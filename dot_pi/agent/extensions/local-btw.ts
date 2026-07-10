import { unlink } from "node:fs/promises";
import {
	CustomEditor,
	type ExtensionAPI,
	type ExtensionCommandContext,
	type ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { Key, matchesKey, truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

const COMMAND = "btw";
const BACK_COMMAND = "btw-back";
const STATUS_KEY = "local-btw";
const STATE_KEY = Symbol.for("local-btw:forked-threads");

type BtwReplacementContext = ExtensionCommandContext & {
	sendUserMessage(message: string): Promise<void>;
};

interface BtwThread {
	mainSessionFile: string;
	sideSessionFile: string;
}

interface BtwState {
	threads: Map<string, BtwThread>;
	pendingDeletes: Set<string>;
}

function getState(): BtwState {
	const globals = globalThis as typeof globalThis & { [STATE_KEY]?: BtwState };
	globals[STATE_KEY] ??= {
		threads: new Map(),
		pendingDeletes: new Set(),
	};
	return globals[STATE_KEY];
}

function sessionFile(ctx: ExtensionContext): string | undefined {
	return ctx.sessionManager.getSessionFile();
}

function currentThread(ctx: ExtensionContext): BtwThread | undefined {
	const file = sessionFile(ctx);
	return file ? getState().threads.get(file) : undefined;
}

async function deleteSessionFile(file: string): Promise<void> {
	try {
		await unlink(file);
	} catch (error) {
		if ((error as { code?: string }).code !== "ENOENT") throw error;
	}
}

class BtwThreadEditor extends CustomEditor {
	onReturn?: () => Promise<void>;
	private returning = false;

	override handleInput(data: string): void {
		if (matchesKey(data, Key.ctrl("c"))) {
			if (this.returning || !this.onReturn) return;
			this.returning = true;
			void this.onReturn().finally(() => {
				this.returning = false;
			});
			return;
		}
		super.handleInput(data);
	}
}

function installThreadUi(ctx: ExtensionContext, onReturn: () => Promise<void>): void {
	ctx.ui.setStatus(STATUS_KEY, ctx.ui.theme.fg("warning", "BTW · THROWAWAY"));
	ctx.ui.setWorkingMessage("Thinking in the throwaway btw thread…");
	ctx.ui.setWidget(
		STATUS_KEY,
		(_tui, theme) => ({
			render(width: number): string[] {
				if (width < 32) {
					return [truncateToWidth(theme.fg("warning", theme.bold("⚠ THROWAWAY BTW THREAD")), width)];
				}

				const label = " THROWAWAY · BTW THREAD ";
				const ruleWidth = Math.max(0, width - label.length - 3);
				const top = theme.fg("warning", `╭─${label}${"─".repeat(ruleWidth)}╮`);
				const bottom = theme.fg("warning", `╰${"─".repeat(width - 2)}╯`);
				const body = (text: string): string => {
					const available = width - 4;
					const clipped = truncateToWidth(text, available, "");
					const padding = " ".repeat(Math.max(0, available - visibleWidth(clipped)));
					return `${theme.fg("warning", "│")} ${clipped}${padding} ${theme.fg("warning", "│")}`;
				};

				return [
					top,
					body(theme.bold("Temporary parallel fork — this is not your main thread.")),
					body(theme.fg("muted", "Chat normally here. The main thread remains untouched.")),
					body(theme.fg("warning", "Ctrl+C returns to main and deletes this fork.")),
					bottom,
				];
			},
			invalidate(): void {},
		}),
		{ placement: "aboveEditor" },
	);
	ctx.ui.setEditorComponent((tui, theme, keybindings) => {
		const editor = new BtwThreadEditor(tui, theme, keybindings);
		editor.onReturn = onReturn;
		return editor;
	});
}

async function returnToMain(ctx: ExtensionCommandContext, thread: BtwThread): Promise<void> {
	if (!ctx.isIdle()) {
		ctx.abort();
		await ctx.waitForIdle();
	}

	const result = await ctx.switchSession(thread.mainSessionFile, {
		withSession: async (mainCtx) => {
			mainCtx.ui.notify("Returned to the main thread", "info");
		},
	});

	if (result.cancelled) {
		ctx.ui.notify("Return to the main thread was cancelled", "warning");
	}
}

function installInitialThreadUi(ctx: BtwReplacementContext, thread: BtwThread): void {
	installThreadUi(ctx, async () => {
		try {
			await returnToMain(ctx, thread);
		} catch (error) {
			ctx.ui.notify(`Could not return to the main thread: ${String(error)}`, "error");
		}
	});
}

export default function localBtw(pi: ExtensionAPI): void {
	pi.registerCommand(COMMAND, {
		description: "Fork the current conversation into a temporary side thread",
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
			if (currentThread(ctx)) {
				ctx.ui.notify("Already in a btw thread; chat normally or press Ctrl+C to return", "info");
				return;
			}

			await ctx.waitForIdle();

			const mainSessionFile = sessionFile(ctx);
			const leafId = ctx.sessionManager.getLeafId();
			if (!mainSessionFile || !leafId) {
				ctx.ui.notify("/btw needs a saved conversation with at least one message", "error");
				return;
			}

			const result = await ctx.fork(leafId, {
				position: "at",
				withSession: async (sideCtx) => {
					const sideSessionFile = sessionFile(sideCtx);
					if (!sideSessionFile) throw new Error("Pi created an ephemeral fork");

					const thread = { mainSessionFile, sideSessionFile };
					getState().threads.set(sideSessionFile, thread);
					installInitialThreadUi(sideCtx, thread);

					// Do not await the whole agent run: the /btw command should finish as
					// soon as the replacement session is ready and remain interruptible.
					void sideCtx.sendUserMessage(question).catch(() => {
						// Provider/session errors are already rendered by Pi. The context may
						// be stale here if Ctrl+C switched back while this promise settled.
					});
				},
			});

			if (result.cancelled) ctx.ui.notify("btw thread creation was cancelled", "warning");
		},
	});

	pi.registerCommand(BACK_COMMAND, {
		description: "Leave the temporary btw thread and return to its main thread",
		handler: async (_args, ctx) => {
			const thread = currentThread(ctx);
			if (!thread) {
				ctx.ui.notify("This is not a btw thread", "warning");
				return;
			}
			await returnToMain(ctx, thread);
		},
	});

	pi.on("session_start", async (event, ctx) => {
		const state = getState();
		if (event.previousSessionFile && state.pendingDeletes.delete(event.previousSessionFile)) {
			state.threads.delete(event.previousSessionFile);
			await deleteSessionFile(event.previousSessionFile);
		}

		const thread = currentThread(ctx);
		if (!thread || ctx.mode !== "tui") return;

		// This path restores Ctrl+C after /reload. Commands sent through the
		// current extension instance are safe; abort first if the side agent runs.
		installThreadUi(ctx, async () => {
			try {
				if (!ctx.isIdle()) {
					ctx.abort();
					while (!ctx.isIdle()) {
						await new Promise((resolve) => setTimeout(resolve, 25));
					}
				}
				pi.sendUserMessage(`/${BACK_COMMAND}`);
			} catch (error) {
				ctx.ui.notify(`Could not return to the main thread: ${String(error)}`, "error");
			}
		});
	});

	pi.on("session_shutdown", async (event, ctx) => {
		const file = sessionFile(ctx);
		if (!file || !getState().threads.has(file) || event.reason === "reload") return;

		if (event.reason === "quit") {
			getState().threads.delete(file);
			await deleteSessionFile(file);
			return;
		}

		// Defer deletion until session_start proves replacement succeeded.
		getState().pendingDeletes.add(file);
	});
}
