import type { ExtensionAPI, Theme } from "@mariozechner/pi-coding-agent";
import { DynamicBorder } from "@mariozechner/pi-coding-agent";
import { Container, Key, matchesKey, Text } from "@mariozechner/pi-tui";

interface CodexLimitInfo {
	planType: string;
	activeLimit: string;
	primaryUsedPercent: string;
	secondaryUsedPercent: string;
	primaryWindowMinutes: string;
	secondaryWindowMinutes: string;
	primaryResetSeconds: number;
	secondaryResetSeconds: number;
	creditsHasCredits: string;
	creditsBalance: string;
	creditsUnlimited: string;
}

function formatDuration(totalSeconds: number): string {
	if (totalSeconds <= 0) return "now";
	const hrs = Math.floor(totalSeconds / 3600);
	const mins = Math.floor((totalSeconds % 3600) / 60);
	const secs = totalSeconds % 60;
	const parts: string[] = [];
	if (hrs > 0) parts.push(`${hrs}h`);
	if (mins > 0) parts.push(`${mins}m`);
	if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
	return parts.join(" ");
}

function parseCodexHeaders(headers: Record<string, string>): CodexLimitInfo | null {
	if (!headers["x-codex-plan-type"]) return null;
	return {
		planType: headers["x-codex-plan-type"] ?? "unknown",
		activeLimit: headers["x-codex-active-limit"] ?? "unknown",
		primaryUsedPercent: headers["x-codex-primary-used-percent"] ?? "?",
		secondaryUsedPercent: headers["x-codex-secondary-used-percent"] ?? "?",
		primaryWindowMinutes: headers["x-codex-primary-window-minutes"] ?? "?",
		secondaryWindowMinutes: headers["x-codex-secondary-window-minutes"] ?? "?",
		primaryResetSeconds: parseInt(headers["x-codex-primary-reset-after-seconds"] ?? "0", 10) || 0,
		secondaryResetSeconds: parseInt(headers["x-codex-secondary-reset-after-seconds"] ?? "0", 10) || 0,
		creditsHasCredits: headers["x-codex-credits-has-credits"] ?? "?",
		creditsBalance: headers["x-codex-credits-balance"] ?? "?",
		creditsUnlimited: headers["x-codex-credits-unlimited"] ?? "?",
	};
}

class CodexLimitOverlay {
	private timer: ReturnType<typeof setTimeout> | undefined;
	private onDone: (() => void) | undefined;

	constructor(
		private theme: Theme,
		private info: CodexLimitInfo,
	) {}

	start(done: () => void) {
		this.onDone = done;
		this.timer = setTimeout(() => this.dismiss(), 20000);
	}

	private dismiss() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = undefined;
		}
		this.onDone?.();
		this.onDone = undefined;
	}

	handleInput(data: string): void {
		if (
			matchesKey(data, Key.escape) ||
			matchesKey(data, Key.enter) ||
			matchesKey(data, Key.space)
		) {
			this.dismiss();
		}
	}

	render(width: number): string[] {
		const container = new Container();
		const th = this.theme;

		container.addChild(new DynamicBorder((s: string) => th.fg("error", s)));
		container.addChild(new Text(th.fg("error", th.bold(" Codex Usage Limit Reached ")), 1, 0));
		container.addChild(new Text("", 0, 0));

		const primaryColor = this.info.primaryUsedPercent === "100" ? "error" : "warning";
		const secondaryColor = this.info.secondaryUsedPercent === "100" ? "error" : "warning";

		const rows = [
			` Plan:            ${th.fg("accent", this.info.planType)} (${this.info.activeLimit})`,
			` Primary usage:   ${th.fg(primaryColor, `${this.info.primaryUsedPercent}%`)} of ${this.info.primaryWindowMinutes}m window`,
			` Secondary usage: ${th.fg(secondaryColor, `${this.info.secondaryUsedPercent}%`)} of ${this.info.secondaryWindowMinutes}m window`,
			` Primary reset:   ${th.fg("success", formatDuration(this.info.primaryResetSeconds))}`,
			` Secondary reset: ${th.fg("success", formatDuration(this.info.secondaryResetSeconds))}`,
		];

		if (this.info.creditsHasCredits !== "?") {
			rows.push(` Credits:         ${this.info.creditsBalance} (unlimited: ${this.info.creditsUnlimited})`);
		}

		for (const row of rows) {
			container.addChild(new Text(row, 1, 0));
		}

		container.addChild(new Text("", 0, 0));
		container.addChild(
			new Text(th.fg("dim", " Press Esc, Enter, or Space to dismiss "), 1, 0),
		);
		container.addChild(new DynamicBorder((s: string) => th.fg("error", s)));

		return container.render(width);
	}

	invalidate(): void {}
}

export default function codexUsageLimitExtension(pi: ExtensionAPI) {
	let shownForAgentRun = false;

	pi.on("agent_start", async () => {
		shownForAgentRun = false;
	});

	pi.on("after_provider_response", async (event, ctx) => {
		if (event.status !== 429) return;
		if (shownForAgentRun) return;

		const info = parseCodexHeaders(event.headers);
		if (!info) return;

		shownForAgentRun = true;

		// Fire-and-forget overlay so retries aren't blocked
		ctx.ui
			.custom<void>(
				(_tui, theme, _kb, done) => {
					const overlay = new CodexLimitOverlay(theme, info);
					overlay.start(done);
					return overlay;
				},
				{
					overlay: true,
					overlayOptions: {
						anchor: "center",
						width: 62,
						minWidth: 50,
						maxHeight: "60%",
					},
				},
			)
			.catch(() => {
				// Ignore overlay errors
			});
	});
}
