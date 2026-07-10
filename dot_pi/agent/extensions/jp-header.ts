import { execFileSync } from "node:child_process";
import { uptime as systemUptime } from "node:os";
import { type ExtensionAPI, InteractiveMode, type Theme } from "@earendil-works/pi-coding-agent";
import { type Component, truncateToWidth, type TUI, visibleWidth } from "@earendil-works/pi-tui";

const FRAME_MS = 70;
const BLOOM_MS = 1_100;
const PALETTE = ["⠁", "⠂", "⠃", "⠇", "⠧", "⠷", "⠿"] as const;

const PATCHED = Symbol.for("jp-header:compact-update-notices");
const UPDATE_STATE: UpdateNoticeState = {};
const UPDATE_RENDERERS = new Set<() => void>();

type ThemeTone = "dim" | "muted" | "accent" | "syntaxKeyword" | "label";
type CellColor = ThemeTone | `rgb:${number}:${number}:${number}`;
type Cell = { char: string; color: CellColor };
type Rgb = readonly [number, number, number];

type UpdateNoticeState = {
	piVersion?: string;
	packages?: string[];
};

type PatchableInteractiveMode = {
	ui: { requestRender(): void };
};

type GitInfo = {
	branch?: string;
	tag?: string;
};

function center(text: string, width: number): string {
	const clipped = truncateToWidth(text, width, "");
	return `${" ".repeat(Math.max(0, Math.floor((width - visibleWidth(clipped)) / 2)))}${clipped}`;
}

function clamp(value: number, min = 0, max = 1): number {
	return Math.max(min, Math.min(max, value));
}

function smoothstep(value: number): number {
	const x = clamp(value);
	return x * x * (3 - 2 * x);
}

function hash(x: number, y: number): number {
	const value = Math.sin(x * 12.9898 + y * 78.233) * 43_758.5453;
	return value - Math.floor(value);
}

function metaball(
	x: number,
	y: number,
	z: number,
	centerX: number,
	centerY: number,
	centerZ: number,
	radius: number,
): number {
	const dx = x - centerX;
	const dy = y - centerY;
	const dz = z - centerZ;
	return Math.exp(-(dx * dx + dy * dy + dz * dz) / (2 * radius * radius));
}

function quantizedRgb(red: number, green: number, blue: number): CellColor {
	const quantize = (value: number) => Math.round(clamp(value, 0, 255) / 12) * 12;
	return `rgb:${quantize(red)}:${quantize(green)}:${quantize(blue)}`;
}

function paintLine(cells: Cell[], theme: Theme): string {
	let result = "";
	let run = "";
	let color: CellColor | undefined;

	const flush = () => {
		if (!run || !color) return;
		if (color === "label") {
			result += theme.bold(theme.fg("accent", run));
		} else if (color.startsWith("rgb:")) {
			const [red, green, blue] = color.slice(4).split(":").map(Number);
			result += `\x1b[38;2;${red};${green};${blue}m${run}\x1b[39m`;
		} else {
			result += theme.fg(color as Exclude<ThemeTone, "label">, run);
		}
		run = "";
	};

	for (const cell of cells) {
		if (cell.color !== color) {
			flush();
			color = cell.color;
		}
		run += cell.char;
	}
	flush();
	return result;
}

function marbleColor(value: number, teal: number, blue: number, violet: number, specular: number): CellColor {
	if (value < 0.22) return "dim";
	if (value < 0.34) return "muted";

	const shadow: Rgb = [72, 82, 88];
	const tealColor: Rgb = [62, 201, 176];
	const blueColor: Rgb = [74, 138, 220];
	const violetColor: Rgb = [178, 132, 196];
	const baseWeight = 0.2;
	const total = baseWeight + teal + blue + violet;
	const brightness = 0.52 + value * 0.55;
	const highlight = specular * 52;

	const channel = (index: 0 | 1 | 2) =>
		((shadow[index] * baseWeight + tealColor[index] * teal + blueColor[index] * blue + violetColor[index] * violet) /
			total) *
			brightness +
		highlight;

	return quantizedRgb(channel(0), channel(1), channel(2));
}

function renderOrb(width: number, phase: number, birthProgress: number, theme: Theme): string[] {
	const compact = width < 44;
	const canvasWidth = Math.min(compact ? 36 : 54, Math.max(22, width - 2));
	const canvasHeight = compact ? 14 : 19;
	const radiusX = Math.min(compact ? 13.5 : 19.5, canvasWidth / 2 - 4);
	const radiusY = compact ? 5.5 : 7.7;
	const centerX = (canvasWidth - 1) / 2;
	const centerY = (canvasHeight - 3) / 2;
	const shadowCenterX = centerX + Math.sin(phase * 0.72) * (compact ? 0.8 : 1.4);
	const shadowCenterY = centerY + radiusY + 0.9;
	const shadowWidth = radiusX * (0.68 + 0.06 * Math.sin(phase * 0.9));
	const rotation = phase * 0.46;
	const cosRotation = Math.cos(rotation);
	const sinRotation = Math.sin(rotation);
	const birth = smoothstep(birthProgress);
	const spread = 1.42 - birth * 0.42;
	const reveal = 0.08 + birth * 0.92;
	const lines: string[] = [];

	for (let y = 0; y < canvasHeight; y++) {
		const cells: Cell[] = [];
		for (let x = 0; x < canvasWidth; x++) {
			const nx = (x - centerX) / radiusX;
			const ny = (y - centerY) / radiusY;
			const radius = Math.sqrt(nx * nx + ny * ny);


			if (radius <= 1 && hash(x, y) <= reveal) {
				const z = Math.sqrt(Math.max(0, 1 - radius * radius));
				const sx = nx * cosRotation + z * sinRotation;
				const sz = -nx * sinRotation + z * cosRotation;

				// Warp the sampling domain before evaluating the moving metaballs.
				// This makes pools stretch, merge, and peel apart like liquid marble.
				const warpX = sx + 0.18 * Math.sin(ny * 4.1 + phase * 1.04) + 0.07 * Math.sin(sz * 5.4 - phase * 0.72);
				const warpY = ny + 0.16 * Math.sin(sz * 3.6 - phase * 0.87) + 0.06 * Math.sin(sx * 6.1 + phase * 0.61);

				const teal =
					metaball(warpX, warpY, sz, 0.48 * Math.cos(phase * 0.71), 0.42 * Math.sin(phase * 0.83), 0.25, 0.43) +
					0.55 * metaball(warpX, warpY, sz, -0.52, 0.3 * Math.cos(phase * 0.66), -0.2, 0.35);
				const blue =
					metaball(warpX, warpY, sz, -0.44 * Math.sin(phase * 0.58), -0.46 * Math.cos(phase * 0.77), 0.15, 0.46) +
					0.45 * metaball(warpX, warpY, sz, 0.58, -0.18, 0.35 * Math.sin(phase * 0.9), 0.3);
				const violet =
					metaball(warpX, warpY, sz, 0.38 * Math.sin(phase * 0.93 + 1.7), -0.38, -0.32, 0.4) +
					0.52 * metaball(warpX, warpY, sz, -0.2, 0.52 * Math.sin(phase * 0.69), 0.38, 0.33);

				const marble = Math.sin((teal - violet) * 3.4 + (blue - teal) * 2.2 + warpX * 2.1 - phase * 0.46);
				const light = -0.32 * nx - 0.4 * ny + 0.86 * z;
				const specular = Math.pow(Math.max(0, light), 10) * 0.22;
				let value = clamp(0.31 + light * 0.36 + marble * 0.16 + (teal + blue + violet) * 0.055 + specular);
				if (radius > 0.93) value *= Math.max(0.17, (1 - radius) / 0.07);

				const paletteIndex = Math.min(PALETTE.length - 1, Math.floor(value * PALETTE.length));
				cells.push({
					char: PALETTE[paletteIndex]!,
					color: marbleColor(value, teal, blue, violet, specular),
				});
				continue;
			}

			if (radius <= spread && birth < 1 && hash(x + 31, y + 17) > 0.72 + birth * 0.2) {
				cells.push({ char: hash(x + 7, y + 43) > 0.5 ? "⠁" : "·", color: "dim" });
				continue;
			}

			const shadowX = (x - shadowCenterX) / shadowWidth;
			const shadowY = (y - shadowCenterY) / 0.9;
			const shadowDensity =
				Math.exp(-(shadowX * shadowX * 2 + shadowY * shadowY * 1.55)) *
				(0.84 + 0.1 * Math.sin(phase * 1.15 + x * 0.12)) *
				birth;
			if (radius > 1 && shadowDensity > 0.08 && hash(x + 83, y + 29) < shadowDensity * 1.12) {
				cells.push({ char: shadowDensity > 0.48 ? "⠶" : shadowDensity > 0.24 ? "⠤" : "·", color: shadowDensity > 0.27 ? "muted" : "dim" });
				continue;
			}

			cells.push({ char: " ", color: "dim" });
		}

		if (y === Math.round(centerY)) {
			const signature = "π - JP";
			const start = Math.floor((canvasWidth - signature.length) / 2);
			for (let index = 0; index < signature.length; index++) {
				cells[start + index] = { char: signature[index]!, color: "label" };
			}
		}

		lines.push(center(paintLine(cells, theme), width));
	}

	return lines;
}

function installCompactUpdateNotices(): void {
	const prototype = InteractiveMode.prototype as unknown as Record<PropertyKey, unknown>;
	if (prototype[PATCHED]) return;
	prototype[PATCHED] = true;

	const renderNotice = (mode: PatchableInteractiveMode): void => {
		mode.ui.requestRender();
		for (const requestRender of UPDATE_RENDERERS) requestRender();
	};

	prototype.showNewVersionNotification = function (this: PatchableInteractiveMode, release: { version: string }) {
		UPDATE_STATE.piVersion = release.version;
		renderNotice(this);
	};
	prototype.showPackageUpdateNotification = function (this: PatchableInteractiveMode, packages: string[]) {
		UPDATE_STATE.packages = packages;
		renderNotice(this);
	};
}

function formatCwd(cwd: string): string {
	const home = process.env.HOME;
	if (!home) return cwd;
	return cwd === home ? "~" : cwd.startsWith(`${home}/`) ? `~${cwd.slice(home.length)}` : cwd;
}

function readGitInfo(cwd: string): GitInfo {
	const git = (...args: string[]) => {
		try {
			return execFileSync("git", ["-C", cwd, ...args], {
				encoding: "utf8",
				stdio: ["ignore", "pipe", "ignore"],
				timeout: 800,
			}).trim();
		} catch {
			return "";
		}
	};
	return {
		branch: git("branch", "--show-current") || undefined,
		tag: git("describe", "--tags", "--exact-match", "HEAD") || undefined,
	};
}

function formatDateTime(date: Date): string {
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatUptime(milliseconds: number): string {
	const totalSeconds = Math.max(0, Math.floor(milliseconds / 1_000));
	const hours = Math.floor(totalSeconds / 3_600);
	const minutes = Math.floor((totalSeconds % 3_600) / 60);
	const seconds = totalSeconds % 60;
	if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
	return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function renderInfoCard(
	width: number,
	theme: Theme,
	info: { cwd: string; model: string; thinking: string; git: GitInfo },
): string[] {
	const cardWidth = Math.max(18, Math.min(48, width - 2));
	const innerWidth = cardWidth - 4;
	const border = (text: string) => theme.fg("dim", text);
	const row = (label: string, value: string, highlight = false) => {
		const labelWidth = 7;
		const clipped = truncateToWidth(value, Math.max(1, innerWidth - labelWidth), "…");
		const content = `${theme.fg(highlight ? "accent" : "muted", label.padEnd(labelWidth))}${
			highlight ? theme.fg("accent", clipped) : theme.fg("text", clipped)
		}`;
		const padding = " ".repeat(Math.max(0, innerWidth - labelWidth - visibleWidth(clipped)));
		return center(`${border("│")} ${content}${padding} ${border("│")}`, width);
	};

	const lines = [center(border(`╭${"─".repeat(cardWidth - 2)}╮`), width)];
	lines.push(row("model", `${info.model} · ${info.thinking}`));
	lines.push(row("dir", formatCwd(info.cwd)));
	const git = [info.git.branch, info.git.tag].filter((part): part is string => Boolean(part));
	if (git.length) lines.push(row("git", git.join(" · ")));
	lines.push(row("now", `${formatDateTime(new Date())} · up ${formatUptime(systemUptime() * 1_000)}`));

	const updates: string[] = [];
	if (UPDATE_STATE.piVersion) updates.push(`pi ${UPDATE_STATE.piVersion}`);
	if (UPDATE_STATE.packages?.length) {
		updates.push(`${UPDATE_STATE.packages.length} extension${UPDATE_STATE.packages.length === 1 ? "" : "s"}`);
	}
	if (updates.length) lines.push(row("update", `↑ ${updates.join(" · ")}`, true));
	lines.push(center(border(`╰${"─".repeat(cardWidth - 2)}╯`), width));
	return lines;
}

function formatTokens(tokens: number): string {
	if (tokens < 1_000) return `${tokens}`;
	if (tokens < 1_000_000) return `${Math.round(tokens / 1_000)}k`;
	return `${(tokens / 1_000_000).toFixed(1)}m`;
}

class FluidOrbHeader implements Component {
	private phase = 0;
	private readonly startedAt = Date.now();
	private git: GitInfo;
	private animationTimer: ReturnType<typeof setInterval> | undefined;
	private clockTimer: ReturnType<typeof setInterval> | undefined;
	private readonly requestRender: () => void;

	constructor(
		private readonly tui: TUI,
		private readonly theme: Theme,
		private readonly cwd: string,
		private readonly getModel: () => string,
		private readonly getThinking: () => string,
	) {
		this.git = readGitInfo(cwd);
		this.requestRender = () => this.tui.requestRender();
		UPDATE_RENDERERS.add(this.requestRender);
		this.animationTimer = setInterval(() => {
			this.phase += 0.12;
			this.tui.requestRender();
		}, FRAME_MS);
		let clockTicks = 0;
		this.clockTimer = setInterval(() => {
			clockTicks++;
			if (clockTicks % 5 === 0) this.git = readGitInfo(this.cwd);
			this.tui.requestRender();
		}, 1_000);
	}

	render(width: number): string[] {
		if (width < 20) {
			return ["", center(this.theme.fg("accent", this.theme.bold("π - JP")), width), ""];
		}
		const birthProgress = (Date.now() - this.startedAt) / BLOOM_MS;
		const card = renderInfoCard(width, this.theme, {
			cwd: this.cwd,
			model: this.getModel(),
			thinking: this.getThinking(),
			git: this.git,
		});
		return ["", ...renderOrb(width, this.phase, birthProgress, this.theme), "", ...card, ""];
	}

	invalidate(): void {}

	dispose(): void {
		this.stopAnimation();
		if (this.clockTimer) clearInterval(this.clockTimer);
		this.clockTimer = undefined;
		UPDATE_RENDERERS.delete(this.requestRender);
	}

	private stopAnimation(): void {
		if (this.animationTimer) clearInterval(this.animationTimer);
		this.animationTimer = undefined;
	}
}

export default function jpHeader(pi: ExtensionAPI): void {
	installCompactUpdateNotices();

	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		ctx.ui.setHeader(
			(tui, theme) =>
				new FluidOrbHeader(
					tui,
					theme,
					ctx.cwd,
					() => ctx.model?.id ?? "no model",
					() => pi.getThinkingLevel(),
				),
		);
		ctx.ui.setFooter((tui, theme, footerData) => {
			let git = readGitInfo(ctx.cwd);
			const unsubscribe = footerData.onBranchChange(() => {
				git = readGitInfo(ctx.cwd);
				tui.requestRender();
			});
			return {
				dispose: unsubscribe,
				invalidate(): void {},
				render(width: number): string[] {
					const separator = theme.fg("dim", " · ");
					const branch = footerData.getGitBranch() ?? git.branch;
					const leftParts = [formatCwd(ctx.cwd), branch, git.tag].filter((part): part is string => Boolean(part));
					const usage = ctx.getContextUsage();
					const context = usage
						? `${usage.percent === null ? "?" : Math.round(usage.percent)}%/${formatTokens(usage.contextWindow)}`
						: undefined;
					const statuses = [...footerData.getExtensionStatuses().values()].filter(Boolean);
					const model = ctx.model?.id ?? "no-model";
					const rightParts = [...statuses, `${model}/${pi.getThinkingLevel()}`, context].filter(
						(part): part is string => Boolean(part),
					);
					const left = theme.fg("dim", leftParts.join(" · "));
					const right = theme.fg("dim", rightParts.join(" · "));
					const gap = width - visibleWidth(left) - visibleWidth(right);
					if (gap < 2) return [truncateToWidth(right, width)];
					return [truncateToWidth(`${left}${" ".repeat(gap)}${right}`, width)];
				},
			};
		});
	});
}
