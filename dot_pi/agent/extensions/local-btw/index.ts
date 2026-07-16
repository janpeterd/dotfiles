import {
	buildSessionContext,
	createAgentSession,
	DefaultResourceLoader,
	getAgentDir,
	SessionManager,
	SettingsManager,
	type AgentSession,
	type ExtensionAPI,
	type ExtensionCommandContext,
	type KeybindingsManager,
	type Theme,
} from "@earendil-works/pi-coding-agent";
import {
	Input,
	Key,
	matchesKey,
	truncateToWidth,
	type Component,
	type Focusable,
	type TUI,
	wrapTextWithAnsi,
} from "@earendil-works/pi-tui";
import { selectBtwCheckpoint } from "./core.ts";

const COMMAND = "btw";
const CHILD_SHUTDOWN_TIMEOUT_MS = 5_000;
const RENDER_THROTTLE_MS = 50;
const CHILD_EXCLUDED_TOOL_NAMES = [
	"subagent_spawn",
	"subagent_wait",
	"subagent_cancel",
	"subagent_check",
	"subagent_list",
	"workflow",
	"ask_user",
] as const;

type AgentMessage = AgentSession["messages"][number];

function messageText(message: AgentMessage): string {
	if (!("content" in message)) return "";
	if (typeof message.content === "string") return message.content;
	return message.content
		.filter((part): part is { type: "text"; text: string } => part.type === "text")
		.map((part) => part.text)
		.join("\n");
}

function cleanText(text: string): string {
	return text.replaceAll("\t", "  ").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "");
}

function appendWrapped(lines: string[], text: string, width: number, prefix = ""): void {
	const clean = cleanText(text).trim();
	if (!clean) return;
	const available = Math.max(10, width - prefix.length);
	const wrapped = wrapTextWithAnsi(clean, available);
	for (let index = 0; index < wrapped.length; index++) {
		lines.push(truncateToWidth((index === 0 ? prefix : " ".repeat(prefix.length)) + wrapped[index], width));
	}
}

function assistantLines(message: AgentMessage, width: number, theme: Theme): string[] {
	if (message.role !== "assistant") return [];
	const lines: string[] = [];
	for (const part of message.content) {
		if (part.type === "text") {
			appendWrapped(lines, part.text, width);
		} else if (part.type === "thinking") {
			appendWrapped(lines, theme.fg("muted", theme.italic(part.thinking)), width, "~ ");
		} else if (part.type === "toolCall") {
			let args = "";
			try {
				args = JSON.stringify(part.arguments);
			} catch {
				args = "";
			}
			lines.push(
				truncateToWidth(
					theme.fg("muted", "→ ") +
						theme.fg("toolTitle", part.name) +
						(args && args !== "{}" ? theme.fg("dim", ` ${args}`) : ""),
					width,
				),
			);
		}
	}
	return lines;
}

function transcriptLines(session: AgentSession, baseline: number, width: number, theme: Theme): string[] {
	const lines: string[] = [];
	for (const message of session.messages.slice(baseline)) {
		const before = lines.length;
		if (message.role === "user") {
			appendWrapped(lines, theme.fg("userMessageText", messageText(message)), width, "> ");
		} else if (message.role === "assistant") {
			lines.push(...assistantLines(message, width, theme));
		} else if (message.role === "toolResult") {
			const first = cleanText(messageText(message)).split("\n").find((line) => line.trim()) ?? "(no output)";
			lines.push(
				truncateToWidth(
					theme.fg(message.isError ? "error" : "dim", message.isError ? "  error: " : "  output: ") +
						theme.fg("dim", first),
					width,
				),
			);
		}
		if (lines.length > before) lines.push("");
	}
	while (lines.at(-1) === "") lines.pop();

	const streaming = session.agent.state.streamingMessage;
	if (streaming?.role === "assistant") {
		if (lines.length > 0) lines.push("");
		lines.push(...assistantLines(streaming, width, theme));
	}
	return lines;
}

async function waitBounded(operation: Promise<unknown>, timeoutMs: number): Promise<void> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const timeout = new Promise<void>((resolve) => {
		timer = setTimeout(resolve, timeoutMs);
	});
	await Promise.race([operation.catch(() => undefined), timeout]);
	if (timer) clearTimeout(timer);
}

async function disposeChildSession(session: AgentSession): Promise<void> {
	try {
		await waitBounded(session.abort(), CHILD_SHUTDOWN_TIMEOUT_MS);
		if (session.extensionRunner.hasHandlers("session_shutdown")) {
			await waitBounded(
				session.extensionRunner.emit({ type: "session_shutdown", reason: "quit" }),
				CHILD_SHUTDOWN_TIMEOUT_MS,
			);
		}
	} finally {
		session.dispose();
	}
}

async function createBtwSession(
	pi: ExtensionAPI,
	ctx: ExtensionCommandContext,
	checkpointId: string | undefined,
): Promise<{ session: AgentSession; baseline: number }> {
	const branch = checkpointId ? ctx.sessionManager.getBranch(checkpointId) : [];
	const inheritedMessages = buildSessionContext(branch, checkpointId).messages;
	const cwd = ctx.cwd;
	const agentDir = getAgentDir();
	const settingsManager = SettingsManager.create(cwd, agentDir, {
		projectTrusted: ctx.isProjectTrusted(),
	});
	const resourceLoader = new DefaultResourceLoader({ cwd, agentDir, settingsManager });
	await resourceLoader.reload();

	const { session } = await createAgentSession({
		cwd,
		agentDir,
		sessionManager: SessionManager.inMemory(cwd),
		settingsManager,
		resourceLoader,
		modelRegistry: ctx.modelRegistry,
		...(ctx.model ? { model: ctx.model } : {}),
		thinkingLevel: pi.getThinkingLevel(),
		excludeTools: [...CHILD_EXCLUDED_TOOL_NAMES],
	});

	session.agent.state.messages = inheritedMessages;
	try {
		await session.bindExtensions({ mode: "print" });
	} catch (error) {
		await disposeChildSession(session);
		throw error;
	}
	return { session, baseline: inheritedMessages.length };
}

class BtwOverlay implements Component, Focusable {
	private readonly input = new Input();
	private readonly unsubscribe: () => void;
	private renderTimer?: ReturnType<typeof setTimeout>;
	private closed = false;
	private error?: string;
	private _focused = false;

	get focused(): boolean {
		return this._focused;
	}

	set focused(value: boolean) {
		this._focused = value;
		this.input.focused = value;
	}

	constructor(
		private readonly tui: TUI,
		private readonly theme: Theme,
		private readonly keybindings: KeybindingsManager,
		private readonly session: AgentSession,
		private readonly baseline: number,
		private readonly initialPrompt: string,
		private readonly mainIsIdle: () => boolean,
		private readonly done: (value: void) => void,
	) {
		this.unsubscribe = session.subscribe(() => this.scheduleRender());
		this.input.onSubmit = (value) => {
			const text = value.trim();
			if (!text) return;
			this.input.setValue("");
			this.send(text);
			this.tui.requestRender();
		};
		queueMicrotask(() => this.send(this.initialPrompt));
	}

	private send(text: string): void {
		this.error = undefined;
		const operation = this.session.isStreaming ? this.session.steer(text) : this.session.prompt(text);
		void operation.catch((error) => {
			this.error = error instanceof Error ? error.message : String(error);
			this.scheduleRender();
		});
	}

	private scheduleRender(): void {
		if (this.renderTimer || this.closed) return;
		this.renderTimer = setTimeout(() => {
			this.renderTimer = undefined;
			if (!this.closed) this.tui.requestRender();
		}, RENDER_THROTTLE_MS);
	}

	private close(): void {
		if (this.closed) return;
		this.closed = true;
		this.unsubscribe();
		if (this.renderTimer) clearTimeout(this.renderTimer);
		this.renderTimer = undefined;
		this.done();
	}

	dispose(): void {
		if (this.closed) return;
		this.closed = true;
		this.unsubscribe();
		if (this.renderTimer) clearTimeout(this.renderTimer);
	}

	handleInput(data: string): void {
		if (
			matchesKey(data, Key.ctrl("c")) ||
			this.keybindings.matches(data, "tui.select.cancel")
		) {
			this.close();
			return;
		}
		this.input.handleInput(data);
		this.tui.requestRender();
	}

	render(width: number): string[] {
		const theme = this.theme;
		const border = theme.fg("warning", "─".repeat(Math.max(1, width)));
		const mainStatus = this.mainIsIdle()
			? theme.fg("success", "main finished")
			: theme.fg("warning", "main still running");
		const childStatus = this.session.isStreaming
			? theme.fg("warning", "btw thinking")
			: theme.fg("success", "btw ready");
		const lines = [
			border,
			truncateToWidth(
				theme.fg("warning", theme.bold("BTW · THROWAWAY PARALLEL THREAD")) +
					theme.fg("dim", " · ") +
					mainStatus +
					theme.fg("dim", " · ") +
					childStatus,
				width,
			),
			border,
		];

		const viewport = Math.max(6, (this.tui.terminal.rows || 30) - 8);
		const body = transcriptLines(this.session, this.baseline, width, theme);
		if (this.error) body.push(theme.fg("error", `error: ${this.error}`));
		if (body.length === 0) body.push(theme.fg("dim", "Starting btw thread…"));
		const visible = body.slice(-viewport);
		lines.push(...visible);
		while (lines.length < viewport + 3) lines.push("");

		lines.push(border);
		lines.push(...this.input.render(width));
		lines.push(
			truncateToWidth(
				theme.fg("dim", "Enter send/steer · Ctrl+C or Esc close BTW · main thread continues independently"),
				width,
			),
		);
		lines.push(border);
		return lines;
	}

	invalidate(): void {
		this.input.invalidate();
	}
}

export default function localBtw(pi: ExtensionAPI): void {
	const lastSettledLeaf = new Map<string, string | undefined>();

	pi.on("session_start", (_event, ctx) => {
		lastSettledLeaf.set(
			ctx.sessionManager.getSessionId(),
			ctx.sessionManager.getLeafId() ?? undefined,
		);
	});
	pi.on("agent_settled", (_event, ctx) => {
		lastSettledLeaf.set(
			ctx.sessionManager.getSessionId(),
			ctx.sessionManager.getLeafId() ?? undefined,
		);
	});

	pi.registerCommand(COMMAND, {
		description: "Open an immediate throwaway side conversation while the main agent keeps running",
		handler: async (args, ctx) => {
			const question = args.trim();
			if (!question) {
				ctx.ui.notify("Usage: /btw <message>", "warning");
				return;
			}
			if (ctx.mode !== "tui") {
				ctx.ui.notify("/btw requires interactive mode", "error");
				return;
			}

			const checkpointId = selectBtwCheckpoint(
				ctx.isIdle(),
				ctx.sessionManager.getLeafId(),
				lastSettledLeaf.get(ctx.sessionManager.getSessionId()),
			);

			let child: { session: AgentSession; baseline: number } | undefined;
			try {
				child = await createBtwSession(pi, ctx, checkpointId);
				await ctx.ui.custom<void>(
					(tui, theme, keybindings, done) =>
						new BtwOverlay(
							tui,
							theme,
							keybindings,
							child!.session,
							child!.baseline,
							question,
							() => ctx.isIdle(),
							done,
						),
					{
						overlay: true,
						overlayOptions: { anchor: "center", width: "100%", maxHeight: "100%" },
					},
				);
			} catch (error) {
				ctx.ui.notify(`Could not start BTW: ${String(error)}`, "error");
			} finally {
				if (child) await disposeChildSession(child.session);
			}
		},
	});
}
