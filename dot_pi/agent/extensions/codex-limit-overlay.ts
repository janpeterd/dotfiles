import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI, ExtensionCommandContext, Theme } from "@mariozechner/pi-coding-agent";
import { DynamicBorder } from "@mariozechner/pi-coding-agent";
import type { Component } from "@mariozechner/pi-tui";
import { matchesKey, Key, truncateToWidth } from "@mariozechner/pi-tui";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CodexLimitInfo {
	planType: string;
	activeLimit: string;
	primaryUsedPercent: number;
	secondaryUsedPercent: number;
	primaryWindowMinutes: number;
	secondaryWindowMinutes: number;
	primaryResetSeconds: number;
	secondaryResetSeconds: number;
	creditsHasCredits: boolean;
	creditsBalance: number;
	creditsUnlimited: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

function parseDateish(value: unknown): Date {
	if (typeof value === "number") {
		const ms = value > 10 ** 11 ? value : value * 1000;
		return new Date(ms);
	}
	if (typeof value === "string") return new Date(value);
	return new Date(0);
}

function percentLeftToUsedPercent(limit: any): number {
	if (limit?.percent_left != null) return Math.max(0, 100 - Number(limit.percent_left));
	if (limit?.remaining_percent != null) return Math.max(0, 100 - Number(limit.remaining_percent));
	if (limit?.used_percent != null) return Number(limit.used_percent);
	return 0;
}

function parseCodexHeaders(headers: Record<string, string>): CodexLimitInfo | null {
	if (!headers["x-codex-plan-type"]) return null;
	return {
		planType: headers["x-codex-plan-type"] ?? "unknown",
		activeLimit: headers["x-codex-active-limit"] ?? "unknown",
		primaryUsedPercent: parseInt(headers["x-codex-primary-used-percent"] ?? "0", 10) || 0,
		secondaryUsedPercent: parseInt(headers["x-codex-secondary-used-percent"] ?? "0", 10) || 0,
		primaryWindowMinutes: parseInt(headers["x-codex-primary-window-minutes"] ?? "0", 10) || 0,
		secondaryWindowMinutes: parseInt(headers["x-codex-secondary-window-minutes"] ?? "0", 10) || 0,
		primaryResetSeconds: parseInt(headers["x-codex-primary-reset-after-seconds"] ?? "0", 10) || 0,
		secondaryResetSeconds: parseInt(headers["x-codex-secondary-reset-after-seconds"] ?? "0", 10) || 0,
		creditsHasCredits: headers["x-codex-credits-has-credits"]?.toLowerCase() === "true",
		creditsBalance: parseInt(headers["x-codex-credits-balance"] ?? "0", 10) || 0,
		creditsUnlimited: headers["x-codex-credits-unlimited"]?.toLowerCase() === "true",
	};
}

function parseCodexApiResponse(data: any): CodexLimitInfo | null {
	const rateLimit = data?.rate_limit ?? data?.rate_limits ?? {};
	const primary = rateLimit.primary_window ?? rateLimit.primary ?? rateLimit.five_hour_limit ?? rateLimit.five_hour;
	const secondary = rateLimit.secondary_window ?? rateLimit.secondary ?? rateLimit.weekly_limit ?? rateLimit.weekly;

	if (!primary && !secondary) return null;

	const info: CodexLimitInfo = {
		planType: "unknown",
		activeLimit: "unknown",
		primaryUsedPercent: primary ? percentLeftToUsedPercent(primary) : 0,
		secondaryUsedPercent: secondary ? percentLeftToUsedPercent(secondary) : 0,
		primaryWindowMinutes: Math.round(Number(primary?.limit_window_seconds ?? 5 * 60 * 60) / 60),
		secondaryWindowMinutes: Math.round(Number(secondary?.limit_window_seconds ?? 7 * 24 * 60 * 60) / 60),
		primaryResetSeconds: Math.max(0, Math.round((parseDateish(primary?.reset_at ?? primary?.reset_time_ms).getTime() - Date.now()) / 1000)),
		secondaryResetSeconds: Math.max(0, Math.round((parseDateish(secondary?.reset_at ?? secondary?.reset_time_ms).getTime() - Date.now()) / 1000)),
		creditsHasCredits: false,
		creditsBalance: 0,
		creditsUnlimited: false,
	};

	const credits = data?.credits;
	if (credits && credits.has_credits && credits.balance != null) {
		info.creditsHasCredits = true;
		info.creditsBalance = Number(credits.balance);
		info.creditsUnlimited = false;
	}

	return info;
}

/**
 * Parse the Codex error JSON that is embedded in the assistant message's
 * errorMessage field. The provider throws:
 *   `Codex error: {"type":"error",...,"status_code":429,"headers":{...}}`
 */
function parseCodexErrorMessage(errorMessage: string): CodexLimitInfo | null {
	const prefix = "Codex error: ";
	if (!errorMessage.startsWith(prefix)) return null;
	try {
		const json = JSON.parse(errorMessage.slice(prefix.length));
		if (json.status_code !== 429) return null;
		if (json.error?.type !== "usage_limit_reached") return null;
		const rawHeaders: Record<string, string> = json.headers ?? {};
		const headers: Record<string, string> = {};
		for (const [k, v] of Object.entries(rawHeaders)) {
			headers[k.toLowerCase()] = String(v);
		}
		return parseCodexHeaders(headers);
	} catch {
		return null;
	}
}

function severityFor(percent: number): "success" | "warning" | "error" {
	if (percent >= 100) return "error";
	if (percent >= 80) return "warning";
	return "success";
}

function renderProgressBar(
	percent: number,
	width: number,
	theme: Theme,
	fillColor: "success" | "warning" | "error",
): string {
	const clamped = Math.max(0, Math.min(100, Math.round(percent)));
	const filled = Math.round((clamped / 100) * width);
	const parts: string[] = [];
	for (let i = 0; i < width; i++) {
		parts.push(i < filled ? theme.fg(fillColor, "█") : theme.fg("dim", "░"));
	}
	return parts.join("");
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

class CodexLimitComponent implements Component {
	private timer: ReturnType<typeof setTimeout> | undefined;

	constructor(
		private theme: Theme,
		private info: CodexLimitInfo,
		private onClose: () => void,
	) {
		this.timer = setTimeout(() => this.onClose(), 20000);
	}

	destroy(): void {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = undefined;
		}
	}

	handleInput(data: string): boolean {
		if (
			matchesKey(data, Key.escape) ||
			matchesKey(data, Key.enter) ||
			matchesKey(data, Key.space)
		) {
			this.onClose();
			return true;
		}
		return false;
	}

	render(width: number): string[] {
		const lines: string[] = [];
		const th = this.theme;
		const border = new DynamicBorder((s: string) => th.fg("error", s));

		lines.push(...border.render(width));
		lines.push(truncateToWidth(` ${th.fg("error", th.bold("Codex Usage"))}`, width));
		lines.push("");

		const barWidth = Math.min(32, Math.max(16, width - 36));

		const primaryColor = severityFor(this.info.primaryUsedPercent);
		lines.push(truncateToWidth(`  ${th.fg("accent", "Plan:")} ${this.info.planType} (${this.info.activeLimit})`, width));
		lines.push("");
		lines.push(truncateToWidth(`  ${th.fg(primaryColor, `Primary (${this.info.primaryWindowMinutes}m window):`)}`, width));
		lines.push(
			truncateToWidth(
				`  ${renderProgressBar(this.info.primaryUsedPercent, barWidth, th, primaryColor)} ${th.fg(primaryColor, `${this.info.primaryUsedPercent}%`)}`,
				width,
			),
		);
		lines.push(
			truncateToWidth(
				`  ${th.fg("dim", `Resets in ${formatDuration(this.info.primaryResetSeconds)}`)}`,
				width,
			),
		);
		lines.push("");

		const secondaryColor = severityFor(this.info.secondaryUsedPercent);
		lines.push(truncateToWidth(`  ${th.fg(secondaryColor, `Secondary (${this.info.secondaryWindowMinutes}m window):`)}`, width));
		lines.push(
			truncateToWidth(
				`  ${renderProgressBar(this.info.secondaryUsedPercent, barWidth, th, secondaryColor)} ${th.fg(secondaryColor, `${this.info.secondaryUsedPercent}%`)}`,
				width,
			),
		);
		lines.push(
			truncateToWidth(
				`  ${th.fg("dim", `Resets in ${formatDuration(this.info.secondaryResetSeconds)}`)}`,
				width,
			),
		);
		lines.push("");

		if (this.info.creditsHasCredits) {
			lines.push(
				truncateToWidth(
					`  ${th.fg("accent", "Credits:")} ${this.info.creditsBalance} (unlimited: ${this.info.creditsUnlimited})`,
					width,
				),
			);
			lines.push("");
		}

		lines.push(truncateToWidth(`  ${th.fg("dim", "Esc, Enter, or Space to dismiss")}`, width));
		lines.push(...border.render(width));

		return lines;
	}

	invalidate(): void {}
}

/* ------------------------------------------------------------------ */
/*  Overlay helper                                                     */
/* ------------------------------------------------------------------ */

function showOverlay(ctx: ExtensionCommandContext, info: CodexLimitInfo, title?: string): void {
	ctx.ui.notify(
		`Codex: ${info.primaryUsedPercent}% primary, ${info.secondaryUsedPercent}% secondary. Resets in ${formatDuration(info.primaryResetSeconds)}`,
		"warning",
	);

	ctx.ui
		.custom<null>(
			(_tui, theme, _kb, done) => {
				const component = new CodexLimitComponent(theme, info, () => done(null));
				return {
					render: (w: number) => component.render(w),
					invalidate: () => component.invalidate(),
					handleInput: (data: string) => component.handleInput(data),
					dispose: () => component.destroy(),
				};
			},
			{
				overlay: true,
				overlayOptions: {
					anchor: "center",
					width: 64,
					minWidth: 50,
					maxHeight: "60%",
				},
			},
		)
		.catch(() => {
			/* ignore overlay errors */
		});
}

/* ------------------------------------------------------------------ */
/*  Fetch helpers                                                      */
/* ------------------------------------------------------------------ */

function codexAccountId(authStorage: any): string | undefined {
	const credential = authStorage.get("openai-codex") as any;
	if (typeof credential?.accountId === "string") return credential.accountId;
	try {
		const authPath = join(homedir(), ".codex", "auth.json");
		const data = JSON.parse(readFileSync(authPath, "utf8")) as any;
		return data?.tokens?.account_id ?? data?.tokens?.accountId;
	} catch {
		return undefined;
	}
}

async function fetchCodexQuotas(authStorage: any): Promise<CodexLimitInfo | null> {
	const accessToken = await authStorage.getApiKey("openai-codex");
	const accountId = codexAccountId(authStorage);
	if (!accessToken) {
		throw new Error("No Codex access token found");
	}
	if (!accountId) {
		throw new Error("No Codex account id found");
	}

	const response = await fetch("https://chatgpt.com/backend-api/wham/usage", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"ChatGPT-Account-Id": accountId,
			Accept: "application/json",
			Origin: "https://chatgpt.com",
			Referer: "https://chatgpt.com/",
			"User-Agent": "Mozilla/5.0",
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${await response.text()}`);
	}

	const data = await response.json();
	return parseCodexApiResponse(data);
}

/* ------------------------------------------------------------------ */
/*  Extension                                                          */
/* ------------------------------------------------------------------ */

export default function codexLimitOverlayExtension(pi: ExtensionAPI) {
	let shownForAgentRun = false;

	pi.on("agent_start", async () => {
		shownForAgentRun = false;
	});

	// Automatic: show overlay when a Codex usage-limit error appears
	pi.on("message_end", async (event, ctx) => {
		const msg = event.message;
		if (msg.role !== "assistant") return;
		if (!msg.errorMessage) return;
		if (shownForAgentRun) return;

		const info = parseCodexErrorMessage(msg.errorMessage);
		if (!info) return;

		shownForAgentRun = true;
		showOverlay(ctx as ExtensionCommandContext, info);
	});

	// Manual: /codex:quotas command to check usage on demand
	pi.registerCommand("codex:quotas", {
		description: "Show Codex usage quotas",
		handler: async (_args, ctx) => {
			try {
				const info = await fetchCodexQuotas(ctx.modelRegistry.authStorage);
				if (!info) {
					ctx.ui.notify("Could not parse Codex usage data", "warning");
					return;
				}
				showOverlay(ctx, info);
			} catch (err) {
				ctx.ui.notify(
					`Failed to fetch Codex quotas: ${err instanceof Error ? err.message : String(err)}`,
					"error",
				);
			}
		},
	});
}
