// Fuzzy zoxide directory completion for prompts.
// Type `~` at a token boundary, then keep typing to fuzzy-filter zoxide's database.

import { basename, relative } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
	type AutocompleteItem,
	type AutocompleteProvider,
	fuzzyMatch,
} from "@earendil-works/pi-tui";

const MAX_SUGGESTIONS = 12;

type ZoxideEntry = {
	path: string;
	name: string;
};

function extractQuery(textBeforeCursor: string): string | undefined {
	// Leave ~/... to Pi's normal path completion.
	return textBeforeCursor.match(/(?:^|[ \t])~([^/\s]*)$/)?.[1];
}

function displayPath(path: string, home: string | undefined): string {
	if (!home) return path;
	if (path === home) return "~";
	if (path.startsWith(`${home}/`)) return `~${path.slice(home.length)}`;
	return path;
}

function insertionPath(path: string, cwd: string): string {
	const fromProject = relative(cwd, path);
	const isInsideProject = fromProject === "" || (!fromProject.startsWith("..") && !fromProject.startsWith("/"));
	return `@${isInsideProject && fromProject ? fromProject : path}`;
}

function suggestions(entries: ZoxideEntry[], query: string, cwd: string, home: string | undefined): AutocompleteItem[] {
	// `+` is an inline AND separator: `~curate+dev` matches paths containing
	// both fuzzy terms without consuming a prompt-separating space.
	const terms = query
		.split(/\++/)
		.map((term) => term.trim().toLowerCase())
		.filter(Boolean);

	const matches = terms.length === 0
		? entries
		: entries
			.map((entry, frecencyIndex) => {
				const path = entry.path.toLowerCase();
				const segments = path.split(/[\\/]+/);
				const finalTerm = terms[terms.length - 1];
				return {
					entry,
					frecencyIndex,
					exactTerms: terms.filter((term) => path.includes(term)).length,
					exactSegments: terms.filter((term) => segments.includes(term)).length,
					finalBasenameMatch: entry.name.toLowerCase() === finalTerm ? 1 : 0,
				};
			})
			.filter(({ entry }) => terms.every((term) => fuzzyMatch(term, entry.path).matches))
			.sort((a, b) =>
				b.exactTerms - a.exactTerms
				|| b.exactSegments - a.exactSegments
				|| b.finalBasenameMatch - a.finalBasenameMatch
				|| a.frecencyIndex - b.frecencyIndex
			)
			.map(({ entry }) => entry);

	return matches.slice(0, MAX_SUGGESTIONS).map((entry) => ({
		value: insertionPath(entry.path, cwd),
		label: entry.name,
		description: displayPath(entry.path, home),
	}));
}

async function loadEntries(pi: ExtensionAPI, cwd: string): Promise<ZoxideEntry[]> {
	try {
		// `--list` is already ordered by zoxide's frecency score. Filtering is
		// performed in memory so typing never starts another process.
		const result = await pi.exec("zoxide", ["query", "--list"], { cwd, timeout: 5_000 });
		if (result.code !== 0) return [];

		const seen = new Set<string>();
		const entries: ZoxideEntry[] = [];
		for (const rawPath of result.stdout.split("\n")) {
			const path = rawPath.trim();
			if (!path || seen.has(path)) continue;
			seen.add(path);
			entries.push({ path, name: basename(path) || path });
		}
		return entries;
	} catch {
		// This is optional convenience functionality: missing zoxide should be silent.
		return [];
	}
}

function createProvider(
	current: AutocompleteProvider,
	getEntries: () => Promise<ZoxideEntry[]>,
	cwd: string,
	home: string | undefined,
): AutocompleteProvider {
	return {
		triggerCharacters: ["~"],

		async getSuggestions(lines, cursorLine, cursorCol, options) {
			const line = lines[cursorLine] ?? "";
			const query = extractQuery(line.slice(0, cursorCol));
			if (query === undefined) {
				return current.getSuggestions(lines, cursorLine, cursorCol, options);
			}

			const entries = await getEntries();
			if (options.signal.aborted || entries.length === 0) {
				return current.getSuggestions(lines, cursorLine, cursorCol, options);
			}

			const items = suggestions(entries, query, cwd, home);
			if (items.length === 0) return null;

			return { prefix: `~${query}`, items };
		},

		applyCompletion(lines, cursorLine, cursorCol, item, prefix) {
			return current.applyCompletion(lines, cursorLine, cursorCol, item, prefix);
		},

		shouldTriggerFileCompletion(lines, cursorLine, cursorCol) {
			return current.shouldTriggerFileCompletion?.(lines, cursorLine, cursorCol) ?? true;
		},
	};
}

export default function zoxidePaths(pi: ExtensionAPI): void {
	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		const entriesPromise = loadEntries(pi, ctx.cwd);
		ctx.ui.addAutocompleteProvider((current) =>
			createProvider(current, () => entriesPromise, ctx.cwd, process.env.HOME),
		);
	});
}
