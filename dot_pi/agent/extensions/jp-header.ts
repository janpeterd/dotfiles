import { VERSION, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

function center(text: string, width: number): string {
	const clipped = truncateToWidth(text, width, "");
	return `${" ".repeat(Math.max(0, Math.floor((width - visibleWidth(clipped)) / 2)))}${clipped}`;
}

export default function jpHeader(pi: ExtensionAPI): void {
	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		ctx.ui.setHeader((_tui, theme) => ({
			render(width: number): string[] {
				if (width < 24) {
					return ["", center(theme.fg("accent", theme.bold("[ JP ]")), width), ""];
				}

				const border = (text: string) => theme.fg("borderAccent", text);
				const dots = theme.fg("dim", "·  ·   ·");
				const logoTop = `${dots}      ${border("╭──────╮")}      ${dots}`;
				const logoMiddle = `${theme.fg("dim", "·   ·  ·")}      ${border("│")}  ${theme.bold("JP")}  ${border("│")}      ${theme.fg("dim", "·  ·   ·")}`;
				const logoBottom = `${dots}      ${border("╰──────╯")}      ${dots}`;
				const rule = theme.fg("borderMuted", "────────────┄┄┄┄···  ·   ·");
				const subtitle = `${theme.fg("muted", "developer · always learning")}  ${theme.fg("dim", `pi v${VERSION}`)}`;

				return [
					"",
					center(logoTop, width),
					center(logoMiddle, width),
					center(logoBottom, width),
					center(rule, width),
					center(subtitle, width),
					"",
				];
			},
			invalidate(): void {},
		}));
	});
}
