import { type ExtensionAPI, InteractiveMode, type Theme } from "@earendil-works/pi-coding-agent";
import { Text, truncateToWidth, type TUI, visibleWidth } from "@earendil-works/pi-tui";

const FRAME_MS = 70;
const ANIMATION_MS = 30_000;
// Braille cells increase dot density without jumping from punctuation to
// near-solid block characters. This keeps shadows and highlights continuous.
const PALETTE = ["⠁", "⠂", "⠃", "⠇", "⠧", "⠷", "⠿"] as const;

type Tone = "dim" | "muted" | "accent" | "label";
type Cell = { char: string; tone: Tone };

const PATCHED = Symbol.for("jp-header:compact-update-notices");
const NOTICE_STATE = Symbol.for("jp-header:update-notice-state");

type UpdateNoticeState = {
	component?: Text;
	piVersion?: string;
	packages?: string[];
};

type PatchableInteractiveMode = {
	chatContainer: { addChild(component: Text): void };
	ui: { requestRender(): void };
	[NOTICE_STATE]?: UpdateNoticeState;
};

function center(text: string, width: number): string {
	const clipped = truncateToWidth(text, width, "");
	return `${" ".repeat(Math.max(0, Math.floor((width - visibleWidth(clipped)) / 2)))}${clipped}`;
}

function toneFor(value: number): Tone {
	if (value < 0.3) return "dim";
	if (value < 0.9) return "muted";
	return "accent";
}

function paintLine(cells: Cell[], theme: Theme): string {
	let result = "";
	let run = "";
	let tone: Tone | undefined;

	const flush = () => {
		if (!run || !tone) return;
		result += tone === "label" ? theme.bold(theme.fg("accent", run)) : theme.fg(tone, run);
		run = "";
	};

	for (const cell of cells) {
		if (cell.tone !== tone) {
			flush();
			tone = cell.tone;
		}
		run += cell.char;
	}
	flush();
	return result;
}

function renderBlob(width: number, phase: number, theme: Theme): string[] {
	const compact = width < 44;
	const canvasWidth = Math.min(compact ? 34 : 48, Math.max(22, width - 2));
	const canvasHeight = compact ? 13 : 17;
	// Terminal cells are much taller than they are wide. These radii produce a
	// visually circular silhouette in a typical monospace terminal.
	const radiusX = Math.min(compact ? 13.5 : 18.5, canvasWidth / 2 - 1.5);
	const radiusY = compact ? 5.5 : 7.5;
	const centerX = (canvasWidth - 1) / 2;
	const centerY = (canvasHeight - 1) / 2;
	const rotation = phase * 0.52;
	const cosRotation = Math.cos(rotation);
	const sinRotation = Math.sin(rotation);
	const lines: string[] = [];

	for (let y = 0; y < canvasHeight; y++) {
		const cells: Cell[] = [];
		for (let x = 0; x < canvasWidth; x++) {
			const nx = (x - centerX) / radiusX;
			const ny = (y - centerY) / radiusY;
			const radius = Math.sqrt(nx * nx + ny * ny);

			if (radius <= 1) {
				const z = Math.sqrt(Math.max(0, 1 - radius * radius));

				// Rotate the sampled point around the sphere, then advect several
				// low-frequency fields through it. The outline remains a perfect
				// sphere while the material appears to roll and fold internally.
				const sx = nx * cosRotation + z * sinRotation;
				const sz = -nx * sinRotation + z * cosRotation;

				// Domain-warped currents fold through one another instead of merely
				// sliding across the surface. Different velocities keep the motion
				// visibly alive during the brief startup window.
				const warpX =
					sx +
					0.2 * Math.sin(ny * 4.2 + phase * 1.08) +
					0.08 * Math.sin(sz * 5.1 - phase * 0.71);
				const warpY =
					ny +
					0.17 * Math.sin(sz * 3.5 - phase * 0.86) +
					0.06 * Math.sin(sx * 6.2 + phase * 0.63);
				const current =
					Math.sin(warpX * 4.5 + warpY * 1.2 - phase * 1.24) +
					0.68 * Math.sin(warpY * 5.3 - warpX * 2.4 + phase * 0.91) +
					0.4 * Math.sin((warpX + warpY - sz) * 7.4 - phase * 0.53);
				const fluid = current / 2.08;
				const light = -0.32 * nx - 0.4 * ny + 0.86 * z;
				const specular = Math.pow(Math.max(0, light), 9) * 0.16;
				let value = Math.max(0, Math.min(1, 0.31 + light * 0.36 + fluid * 0.32 + specular));

				// A soft antialiased rim makes the fixed circular boundary read as a
				// polished volume rather than a hard character-cell cutout.
				if (radius > 0.93) value *= Math.max(0.18, (1 - radius) / 0.07);

				const paletteIndex = Math.min(PALETTE.length - 1, Math.floor(value * PALETTE.length));
				cells.push({ char: PALETTE[paletteIndex]!, tone: toneFor(value) });
				continue;
			}

			cells.push({ char: " ", tone: "dim" });
		}

		if (y === Math.round(centerY)) {
			const signature = "    JP    ";
			const start = Math.floor((canvasWidth - signature.length) / 2);
			for (let index = 0; index < signature.length; index++) {
				const char = signature[index]!;
				cells[start + index] = { char, tone: char === " " ? "dim" : "label" };
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
		const state = (mode[NOTICE_STATE] ??= {});
		const parts: string[] = [];
		if (state.piVersion) parts.push(`pi ${state.piVersion} available → pi update`);
		if (state.packages?.length) {
			parts.push(`${state.packages.length} extension update${state.packages.length === 1 ? "" : "s"} → pi update --extensions`);
		}
		if (!state.component) {
			state.component = new Text("", 1, 0);
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

class FluidOrbHeader {
	private phase = 0;
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
			return ["", center(this.theme.fg("accent", this.theme.bold("◉  JP  ◉")), width), ""];
		}

		return ["", ...renderBlob(width, this.phase, this.theme), ""];
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
	});
}
