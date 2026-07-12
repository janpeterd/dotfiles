import { execFileSync } from "node:child_process";
import { uptime as systemUptime } from "node:os";
import { type ExtensionAPI, InteractiveMode, type Theme } from "@earendil-works/pi-coding-agent";
import { type Component, truncateToWidth, type TUI, visibleWidth } from "@earendil-works/pi-tui";

const FRAME_MS = 70;
const BLOOM_MS = 1_100;
const BREAKOUT_MS = 4_800;
const FIRST_BREAKOUT_DELAY_MS = 4_800;
const BREAKOUT_DELAY_MIN_MS = 12_000;
const BREAKOUT_DELAY_VARIANCE_MS = 8_000;
// The terminal font used here has cells about 2.33× taller than wide.
// Scale the horizontal radius accordingly so the orb is circular in pixels.
const CELL_HEIGHT_TO_WIDTH = 2.33;
const PALETTE = ["⠁", "⠂", "⠃", "⠇", "⠧", "⠷", "⠿"] as const;

const PATCHED = Symbol.for("jp-header:compact-update-notices");
const UPDATE_STATE: UpdateNoticeState = {};
const UPDATE_RENDERERS = new Set<() => void>();

type ThemeTone = "dim" | "muted" | "text" | "accent" | "syntaxKeyword" | "label";
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

function smootherstep(value: number): number {
	const x = clamp(value);
	return x * x * x * (x * (x * 6 - 15) + 10);
}

function easeOutCubic(value: number): number {
	const x = clamp(value);
	return 1 - (1 - x) ** 3;
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

function overlayRefractedSignature(canvas: Cell[][], centerX: number, centerY: number, phase: number): void {
	const signature = "π - JP";
	const startX = Math.floor(centerX - (signature.length - 1) / 2);
	const baseY = Math.round(centerY);

	for (let index = 0; index < signature.length; index++) {
		const char = signature[index]!;
		if (char === " ") continue;

		const x = startX + index;
		if (!canvas[baseY]?.[x]) continue;

		// A travelling sine wave bends the logo one terminal row at a time.
		// Color builds before the discrete shift, which keeps the movement fluid
		// rather than making the letters appear to flicker between rows.
		const wave = Math.sin(phase * 0.92 - index * 0.78);
		const refraction = smoothstep((Math.abs(wave) - 0.38) / 0.62);
		const offset = refraction > 0.62 ? (wave > 0 ? -1 : 1) : 0;
		const targetY = baseY + offset;

		if (offset === 0) {
			canvas[baseY]![x] = {
				char,
				color: refraction > 0.18
					? quantizedRgb(92 + refraction * 50, 176 + refraction * 42, 205 + refraction * 34)
					: "label",
			};
			continue;
		}

		// Keep a dim chromatic trace on the original baseline and a fainter
		// counter-echo on the other side, like lettering seen through curved glass.
		canvas[baseY]![x] = {
			char,
			color: quantizedRgb(70, 116 + refraction * 34, 148 + refraction * 42),
		};
		if (canvas[targetY]?.[x]) canvas[targetY]![x] = { char, color: "label" };
		const echoY = baseY - offset;
		if (canvas[echoY]?.[x] && refraction > 0.82) {
			canvas[echoY]![x] = { char, color: quantizedRgb(116, 82, 142) };
		}
	}
}

function renderOrb(
	width: number,
	phase: number,
	birthProgress: number,
	theme: Theme,
	backdrop?: Cell[][],
): string[] {
	const compact = width < 44;
	const canvasWidth = Math.min(compact ? 36 : 54, Math.max(22, width - 2));
	const canvasHeight = compact ? 14 : 19;
	const radiusY = compact ? 5.5 : 7.7;
	const radiusX = Math.min(radiusY * CELL_HEIGHT_TO_WIDTH, canvasWidth / 2 - 4);
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
	const canvas: Cell[][] = [];

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

		canvas.push(cells);
	}

	overlayRefractedSignature(canvas, centerX, centerY, phase);
	const offsetX = Math.floor((width - canvasWidth) / 2);
	return canvas.map((cells, y) => {
		const fullLine = backdrop?.[y]?.map((cell) => ({ ...cell })) ?? blankCellLine(width);
		for (let x = 0; x < cells.length; x++) {
			if (cells[x]!.char !== " " && fullLine[offsetX + x]) fullLine[offsetX + x] = cells[x]!;
		}
		return paintLine(fullLine, theme);
	});
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

function blankCellLine(width: number): Cell[] {
	return Array.from({ length: width }, () => ({ char: " ", color: "dim" as CellColor }));
}

function writeCells(line: Cell[], start: number, text: string, color: CellColor): void {
	let x = start;
	for (const char of text) {
		if (x >= 0 && x < line.length) line[x] = { char, color };
		x += visibleWidth(char);
	}
}

function renderBreakoutLayer(
	width: number,
	height: number,
	progress: number | undefined,
	originY = 0,
): Cell[][] {
	const layer = Array.from({ length: height }, () => blankCellLine(width));
	if (progress === undefined) return layer;

	// The main breach owns the first part of the event. Its wake clears in
	// time for several smaller, offset pressure pockets to burst afterward.
	const mainProgress = progress / 0.66;
	const arrival = smootherstep(mainProgress / 0.12);
	const grow = easeOutCubic((mainProgress - 0.045) / 0.64);
	const fade = smootherstep((1 - mainProgress) / 0.3);
	const centerX = (width - 1) / 2;
	const maxRadiusX = Math.min(46, width * 0.49);
	const verticalReach = Math.max(originY + 1, height - originY);
	const maxRadiusY = Math.max(5, verticalReach * 1.08);
	const afterbursts = [
		{ start: 0.52, duration: 0.28, x: -0.16, y: 0.12, scaleX: 0.42, scaleY: 0.46, seed: 311 },
		{ start: 0.67, duration: 0.25, x: 0.2, y: -0.08, scaleX: 0.32, scaleY: 0.36, seed: 487 },
		{ start: 0.8, duration: 0.2, x: -0.04, y: 0.22, scaleX: 0.22, scaleY: 0.28, seed: 653 },
	] as const;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const dx = x - centerX;
			const dy = y - originY;
			const radial = Math.sqrt((dx / maxRadiusX) ** 2 + (dy / maxRadiusY) ** 2);
			const turbulence = 0.055 * Math.sin(x * 0.53 + y * 1.71 + progress * 18) + 0.035 * Math.sin(x * 1.17 - y * 0.8);
			const distance = radial + turbulence;
			const shell = Math.exp(-((distance - grow) ** 2) / 0.0075);
			const interior = distance < grow ? Math.max(0, 1 - distance / Math.max(0.001, grow)) * 0.28 : 0;
			const wings = 0.55 + 0.65 * Math.min(1, Math.abs(dx) / Math.max(1, maxRadiusX * grow));
			let density = (shell * wings + interior) * arrival * fade;

			// Sparse droplets run ahead of the main liquid front.
			if (distance > grow && distance < grow + 0.22 && hash(x + 191, y + 73) > 0.965) density = Math.max(density, 0.48 * fade);
			// The narrow center stream visually connects the orb to the impact.
			const streamWidth = 0.7 + 1.8 * Math.sin(Math.min(1, mainProgress / 0.2) * Math.PI);
			const belowOrb = dy > 4 && dy < Math.max(7, height - originY - 2);
			if (belowOrb && Math.abs(dx + Math.sin(mainProgress * 20 + y) * 1.3) < streamWidth && mainProgress < 0.72) {
				density = Math.max(density, arrival * (1 - mainProgress * 0.75) * fade);
			}

			let afterburstIndex = -1;
			for (let index = 0; index < afterbursts.length; index++) {
				const burst = afterbursts[index]!;
				const local = (progress - burst.start) / burst.duration;
				if (local < 0 || local > 1) continue;
				const burstGrow = easeOutCubic(local / 0.72);
				const burstOpacity = smootherstep(local / 0.14) * smootherstep((1 - local) / 0.32);
				const burstX = centerX + maxRadiusX * burst.x;
				const burstY = originY + maxRadiusY * burst.y;
				const burstRadius = Math.sqrt(
					((x - burstX) / (maxRadiusX * burst.scaleX)) ** 2 +
					((y - burstY) / (maxRadiusY * burst.scaleY)) ** 2,
				);
				const ripple = 0.045 * Math.sin(x * 0.79 - y * 1.43 + local * 14 + burst.seed);
				const burstShell = Math.exp(-((burstRadius + ripple - burstGrow) ** 2) / 0.012);
				let burstDensity = burstShell * burstOpacity * (0.82 - index * 0.1);
				if (
					burstRadius > burstGrow &&
					burstRadius < burstGrow + 0.3 &&
					hash(x + burst.seed, y + burst.seed / 2) > 0.972
				) {
					burstDensity = Math.max(burstDensity, 0.5 * burstOpacity);
				}
				if (burstDensity > density) {
					density = burstDensity;
					afterburstIndex = index;
				}
			}

			if (density < 0.08 || hash(x + 41, y + 109) > Math.min(0.94, density)) continue;
			const energy = clamp(density + hash(x + 7, y + 13) * 0.28);
			const paletteIndex = Math.min(PALETTE.length - 1, Math.floor(energy * PALETTE.length));
			const violet = clamp(Math.abs(dx) / Math.max(1, maxRadiusX * grow));
			const colorShift = afterburstIndex < 0 ? violet : afterburstIndex / Math.max(1, afterbursts.length - 1);
			layer[y]![x] = {
				char: PALETTE[paletteIndex]!,
				color: quantizedRgb(
					52 + colorShift * 112,
					126 + energy * 92 - colorShift * 28,
					188 + energy * 55,
				),
			};
		}
	}
	return layer;
}

function renderInfoCard(
	width: number,
	theme: Theme,
	info: { cwd: string; model: string; thinking: string; git: GitInfo },
	backdrop?: Cell[][],
): string[] {
	const cardWidth = Math.max(18, Math.min(48, width - 2));
	const innerWidth = cardWidth - 4;
	const labelWidth = 7;
	const startX = Math.floor((width - cardWidth) / 2);
	const rows: Array<{ label: string; value: string; highlight?: boolean }> = [
		{ label: "model", value: `${info.model} · ${info.thinking}` },
		{ label: "dir", value: formatCwd(info.cwd) },
	];
	const git = [info.git.branch, info.git.tag].filter((part): part is string => Boolean(part));
	if (git.length) rows.push({ label: "git", value: git.join(" · ") });
	rows.push({ label: "now", value: `${formatDateTime(new Date())} · up ${formatUptime(systemUptime() * 1_000)}` });

	const updates: string[] = [];
	if (UPDATE_STATE.piVersion) updates.push(`pi ${UPDATE_STATE.piVersion}`);
	if (UPDATE_STATE.packages?.length) {
		updates.push(`${UPDATE_STATE.packages.length} extension${UPDATE_STATE.packages.length === 1 ? "" : "s"}`);
	}
	if (updates.length) rows.push({ label: "update", value: `↑ ${updates.join(" · ")}`, highlight: true });

	const lines = Array.from({ length: rows.length + 2 }, (_, index) =>
		backdrop?.[index]?.map((cell) => ({ ...cell })) ?? blankCellLine(width),
	);
	writeCells(lines[0]!, startX, `╭${"─".repeat(cardWidth - 2)}╮`, "dim");
	rows.forEach((row, index) => {
		const line = lines[index + 1]!;
		writeCells(line, startX, "│", "dim");
		writeCells(line, startX + cardWidth - 1, "│", "dim");
		writeCells(line, startX + 2, row.label, row.highlight ? "accent" : "muted");
		const clipped = truncateToWidth(row.value, Math.max(1, innerWidth - labelWidth), "…");
		writeCells(line, startX + 2 + labelWidth, clipped, row.highlight ? "accent" : "text");
	});
	writeCells(lines[lines.length - 1]!, startX, `╰${"─".repeat(cardWidth - 2)}╯`, "dim");
	return lines.map((line) => paintLine(line, theme));
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
	private breakoutAgeMs: number | undefined;
	private breakoutDelayMs = FIRST_BREAKOUT_DELAY_MS;
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
		this.requestRender = () => {
			if (this.isVisible()) this.tui.requestRender();
		};
		UPDATE_RENDERERS.add(this.requestRender);
		this.animationTimer = setInterval(() => {
			if (!this.isVisible()) {
				this.freezeOffscreen();
				return;
			}
			this.phase += 0.12;
			if (this.breakoutAgeMs === undefined) {
				this.breakoutDelayMs -= FRAME_MS;
				if (this.breakoutDelayMs <= 0) this.breakoutAgeMs = 0;
			} else {
				this.breakoutAgeMs += FRAME_MS;
				if (this.breakoutAgeMs >= BREAKOUT_MS) {
					this.breakoutAgeMs = undefined;
					this.breakoutDelayMs = BREAKOUT_DELAY_MIN_MS + Math.random() * BREAKOUT_DELAY_VARIANCE_MS;
				}
			}
			this.tui.requestRender();
		}, FRAME_MS);
		let clockTicks = 0;
		this.clockTimer = setInterval(() => {
			if (!this.isVisible()) {
				this.freezeOffscreen();
				return;
			}
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
		const info = {
			cwd: this.cwd,
			model: this.getModel(),
			thinking: this.getThinking(),
			git: this.git,
		};
		const cardHeight = renderInfoCard(width, this.theme, info).length;
		const orbHeight = width < 44 ? 14 : 19;
		const breakoutProgress = this.breakoutAgeMs === undefined ? undefined : this.breakoutAgeMs / BREAKOUT_MS;
		const totalHeight = 1 + orbHeight + 1 + cardHeight;
		const orbOriginY = 1 + (orbHeight - 3) / 2;
		const breakout = renderBreakoutLayer(width, totalHeight, breakoutProgress, orbOriginY);
		const top = paintLine(breakout[0]!, this.theme);
		const orbStart = 1;
		const bridgeIndex = orbStart + orbHeight;
		const orb = renderOrb(
			width,
			this.phase,
			birthProgress,
			this.theme,
			breakout.slice(orbStart, bridgeIndex),
		);
		const bridge = paintLine(breakout[bridgeIndex]!, this.theme);
		const card = renderInfoCard(width, this.theme, info, breakout.slice(bridgeIndex + 1));
		return [top, ...orb, bridge, ...card, ""];
	}

	invalidate(): void {}

	dispose(): void {
		this.stopAnimation();
		if (this.clockTimer) clearInterval(this.clockTimer);
		this.clockTimer = undefined;
		UPDATE_RENDERERS.delete(this.requestRender);
	}

	private isVisible(): boolean {
		// Pi's component interface has no visibility callback. The renderer keeps
		// its logical viewport position, so a non-zero top means this first
		// component has scrolled away. Avoid changing off-screen lines: Pi must
		// otherwise perform a full redraw, which clears terminal scrollback.
		const viewport = this.tui as unknown as { previousViewportTop?: number };
		return (viewport.previousViewportTop ?? 0) === 0;
	}

	private freezeOffscreen(): void {
		this.stopAnimation();
		if (this.clockTimer) clearInterval(this.clockTimer);
		this.clockTimer = undefined;
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
