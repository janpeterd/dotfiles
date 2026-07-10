import { VERSION, type ExtensionAPI, type Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, type TUI, visibleWidth } from "@earendil-works/pi-tui";

const FRAME_MS = 120;
const ANIMATION_MS = 30_000;
const PALETTE = ["·", ".", ":", "-", "=", "+", "*", "#", "%", "█"] as const;

type Tone = "dim" | "muted" | "text" | "accent";
type Cell = { char: string; tone: Tone };

function center(text: string, width: number): string {
	const clipped = truncateToWidth(text, width, "");
	return `${" ".repeat(Math.max(0, Math.floor((width - visibleWidth(clipped)) / 2)))}${clipped}`;
}

function hash(x: number, y: number, frame: number): number {
	const value = Math.sin(x * 12.9898 + y * 78.233 + frame * 0.173) * 43_758.5453;
	return value - Math.floor(value);
}

function toneFor(value: number): Tone {
	if (value < 0.28) return "dim";
	if (value < 0.53) return "muted";
	if (value < 0.82) return "text";
	return "accent";
}

function paintLine(cells: Cell[], theme: Theme): string {
	let result = "";
	let run = "";
	let tone: Tone | undefined;

	const flush = () => {
		if (!run || !tone) return;
		result += theme.fg(tone, run);
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
	const canvasWidth = Math.min(62, Math.max(22, width - 2));
	const canvasHeight = canvasWidth < 38 ? 11 : 16;
	const radiusX = Math.min(23, canvasWidth / 2 - 4);
	const radiusY = canvasHeight / 2 - 1.5;
	const centerX = (canvasWidth - 1) / 2;
	const centerY = (canvasHeight - 1) / 2;
	const frame = Math.floor(phase * 3);
	const lines: string[] = [];

	for (let y = 0; y < canvasHeight; y++) {
		const cells: Cell[] = [];
		for (let x = 0; x < canvasWidth; x++) {
			const nx = (x - centerX) / radiusX;
			const ny = (y - centerY) / radiusY;
			const angle = Math.atan2(ny, nx);
			const radius = Math.sqrt(nx * nx + ny * ny);
			const boundary =
				1 +
				0.075 * Math.sin(angle * 3 + phase * 0.82) +
				0.045 * Math.sin(angle * 5 - phase * 0.57) +
				0.025 * Math.sin(angle * 7 + phase * 0.31);
			const normalizedRadius = radius / boundary;

			if (normalizedRadius <= 1) {
				const z = Math.sqrt(Math.max(0, 1 - normalizedRadius * normalizedRadius));
				const light = -0.34 * nx - 0.42 * ny + 0.86 * z;
				const flow =
					0.16 * Math.sin(nx * 5.2 + Math.sin(ny * 3.4 + phase) * 1.8 - phase * 0.9) +
					0.08 * Math.sin(ny * 7.1 - nx * 2.3 + phase * 0.63);
				const value = Math.max(0, Math.min(1, 0.26 + light * 0.5 + flow));
				const paletteIndex = Math.min(PALETTE.length - 1, Math.floor(value * PALETTE.length));
				cells.push({ char: PALETTE[paletteIndex]!, tone: toneFor(value) });
				continue;
			}

			const nearSurface = normalizedRadius < 1.42;
			const dust = nearSurface && hash(x, y, frame) > 0.965 + Math.max(0, normalizedRadius - 1) * 0.06;
			cells.push({ char: dust ? "·" : " ", tone: "dim" });
		}

		// Carve the signature into the moving material rather than placing a
		// separate logo beneath it.
		if (y === Math.round(centerY) && canvasWidth >= 38) {
			const signature = "  J P  ";
			const start = Math.floor((canvasWidth - signature.length) / 2);
			for (let index = 0; index < signature.length; index++) {
				cells[start + index] = { char: signature[index]!, tone: "accent" };
			}
		}

		lines.push(center(paintLine(cells, theme), width));
	}

	return lines;
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

		const title = `${this.theme.bold("JP")}  ${this.theme.fg("dim", "/ FLUID STUDY 001")}`;
		const subtitle = `${this.theme.fg("muted", "developer · always learning")}  ${this.theme.fg("dim", `pi v${VERSION}`)}`;
		return ["", ...renderBlob(width, this.phase, this.theme), center(title, width), center(subtitle, width), ""];
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
	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;
		ctx.ui.setHeader((tui, theme) => new FluidOrbHeader(tui, theme));
	});
}
