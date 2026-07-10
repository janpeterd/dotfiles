import { type ExtensionAPI, InteractiveMode, type Theme } from "@earendil-works/pi-coding-agent";
import { type Component, truncateToWidth, type TUI, visibleWidth } from "@earendil-works/pi-tui";

const FRAME_MS = 70;
const ANIMATION_MS = 30_000;
const BLOOM_MS = 1_100;
const PALETTE = ["⠁", "⠂", "⠃", "⠇", "⠧", "⠷", "⠿"] as const;

const PATCHED = Symbol.for("jp-header:compact-update-notices");
const NOTICE_STATE = Symbol.for("jp-header:update-notice-state");

type ThemeTone = "dim" | "muted" | "accent" | "syntaxKeyword" | "label";
type CellColor = ThemeTone | `rgb:${number}:${number}:${number}`;
type Cell = { char: string; color: CellColor };
type Rgb = readonly [number, number, number];

type UpdateNoticeState = {
	component?: CenteredUpdateNotice;
	piVersion?: string;
	packages?: string[];
};

type PatchableInteractiveMode = {
	chatContainer: { addChild(component: Component): void };
	ui: { requestRender(): void };
	[NOTICE_STATE]?: UpdateNoticeState;
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
	const canvasHeight = compact ? 13 : 18;
	const radiusX = Math.min(compact ? 13.5 : 19.5, canvasWidth / 2 - 4);
	const radiusY = compact ? 5.5 : 7.7;
	const centerX = (canvasWidth - 1) / 2;
	const centerY = (canvasHeight - 1) / 2;
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

			// Tilted orbital ellipse. The lower half is drawn over the sphere;
			// the upper half disappears behind it.
			const orbitX = nx / 1.27;
			const orbitY = (ny + nx * 0.23) / 0.43;
			const orbitRadius = Math.sqrt(orbitX * orbitX + orbitY * orbitY);
			const onOrbit = Math.abs(orbitRadius - 1) < (compact ? 0.12 : 0.075);
			const orbitInFront = orbitY > 0;
			const orbitChar = Math.sin(x * 0.8 - phase * 1.8) > 0.25 ? "⠒" : "·";

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
					char: onOrbit && orbitInFront && birth > 0.45 ? orbitChar : PALETTE[paletteIndex]!,
					color:
						onOrbit && orbitInFront && birth > 0.45
							? "syntaxKeyword"
							: marbleColor(value, teal, blue, violet, specular),
				});
				continue;
			}

			if (radius <= spread && birth < 1 && hash(x + 31, y + 17) > 0.72 + birth * 0.2) {
				cells.push({ char: hash(x + 7, y + 43) > 0.5 ? "⠁" : "·", color: "dim" });
				continue;
			}

			if (onOrbit && (radius > 1 || orbitInFront) && birth > 0.35) {
				cells.push({ char: orbitChar, color: orbitInFront ? "syntaxKeyword" : "dim" });
				continue;
			}

			cells.push({ char: " ", color: "dim" });
		}

		if (y === Math.round(centerY)) {
			const signature = "JP";
			const start = Math.floor((canvasWidth - signature.length) / 2);
			for (let index = 0; index < signature.length; index++) {
				cells[start + index] = { char: signature[index]!, color: "label" };
			}
		}

		lines.push(center(paintLine(cells, theme), width));
	}

	return lines;
}

class CenteredUpdateNotice implements Component {
	constructor(private message = "") {}

	setText(message: string): void {
		this.message = message;
	}

	render(width: number): string[] {
		return [center(this.message, width)];
	}

	invalidate(): void {}
}

function installCompactUpdateNotices(): void {
	const prototype = InteractiveMode.prototype as unknown as Record<PropertyKey, unknown>;
	if (prototype[PATCHED]) return;
	prototype[PATCHED] = true;

	const renderNotice = (mode: PatchableInteractiveMode): void => {
		const state = (mode[NOTICE_STATE] ??= {});
		const parts: string[] = [];
		if (state.piVersion) parts.push(`pi ${state.piVersion} → pi update`);
		if (state.packages?.length) {
			parts.push(`${state.packages.length} extension update${state.packages.length === 1 ? "" : "s"} → pi update --extensions`);
		}
		if (!state.component) {
			state.component = new CenteredUpdateNotice();
			mode.chatContainer.addChild(state.component);
		}
		state.component.setText(`↑ ${parts.join("  ·  ")}`);
		mode.ui.requestRender();
	};

	prototype.showNewVersionNotification = function (this: PatchableInteractiveMode, release: { version: string }) {
		const state = (this[NOTICE_STATE] ??= {});
		state.piVersion = release.version;
		renderNotice(this);
	};
	prototype.showPackageUpdateNotification = function (this: PatchableInteractiveMode, packages: string[]) {
		const state = (this[NOTICE_STATE] ??= {});
		state.packages = packages;
		renderNotice(this);
	};
}

function formatCwd(cwd: string): string {
	const home = process.env.HOME;
	if (!home) return cwd;
	return cwd === home ? "~" : cwd.startsWith(`${home}/`) ? `~${cwd.slice(home.length)}` : cwd;
}

function formatTokens(tokens: number): string {
	if (tokens < 1_000) return `${tokens}`;
	if (tokens < 1_000_000) return `${Math.round(tokens / 1_000)}k`;
	return `${(tokens / 1_000_000).toFixed(1)}m`;
}

class FluidOrbHeader implements Component {
	private phase = 0;
	private readonly startedAt = Date.now();
	private timer: ReturnType<typeof setInterval> | undefined;
	private stopTimer: ReturnType<typeof setTimeout> | undefined;

	constructor(
		private readonly tui: TUI,
		private readonly theme: Theme,
	) {
		this.timer = setInterval(() => {
			this.phase += 0.12;
			this.tui.requestRender();
		}, FRAME_MS);
		this.stopTimer = setTimeout(() => this.stop(), ANIMATION_MS);
	}

	render(width: number): string[] {
		if (width < 24) {
			return ["", center(this.theme.fg("accent", this.theme.bold("◉ JP ◉")), width), ""];
		}
		const birthProgress = (Date.now() - this.startedAt) / BLOOM_MS;
		return ["", ...renderOrb(width, this.phase, birthProgress, this.theme), ""];
	}

	invalidate(): void {}

	dispose(): void {
		this.stop();
	}

	private stop(): void {
		if (this.timer) clearInterval(this.timer);
		if (this.stopTimer) clearTimeout(this.stopTimer);
		this.timer = undefined;
		this.stopTimer = undefined;
	}
}

export default function jpHeader(pi: ExtensionAPI): void {
	installCompactUpdateNotices();

	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		ctx.ui.setHeader((tui, theme) => new FluidOrbHeader(tui, theme));
		ctx.ui.setFooter((tui, theme, footerData) => {
			const unsubscribe = footerData.onBranchChange(() => tui.requestRender());
			return {
				dispose: unsubscribe,
				invalidate(): void {},
				render(width: number): string[] {
					const separator = theme.fg("dim", " · ");
					const branch = footerData.getGitBranch();
					const leftParts = [formatCwd(ctx.cwd), branch].filter((part): part is string => Boolean(part));
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
