import type { ExtensionAPI, ExtensionCommandContext, SessionEntry } from "@mariozechner/pi-coding-agent";
import { BorderedLoader, getMarkdownTheme } from "@mariozechner/pi-coding-agent";
import { Container, Input, Markdown, Spacer, Text, fuzzyFilter, getKeybindings, matchesKey, visibleWidth } from "@mariozechner/pi-tui";
import { spawn } from "node:child_process";
import { mkdtemp, writeFile, unlink, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ── Types ───────────────────────────────────────────────────────────────────

interface ReviewState {
  lastModel?: string;
  lastFocus?: string;
}

interface ReviewFinding {
  severity: "high" | "medium" | "low" | "note";
  text: string;
}

interface ParsedReview {
  verdict?: string;
  findings: ReviewFinding[];
  questions: string[];
  suggestions: string[];
  raw: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

const STATE_CUSTOM_TYPE = "review-buddy-state";
const REVIEW_CUSTOM_TYPE = "review-buddy-raw";
const MAX_BRANCH_LOOKBACK = 12;

const VALID_SEVERITIES = new Set(["high", "medium", "low", "note"]);

const REVIEWER_SYSTEM_PROMPT = `You are a sharp, skeptical code reviewer. You do NOT have the full project context — only the briefing provided. Only critique what you can verify from the materials. Do not assume hidden requirements or conventions.

## Output Format

Respond in this exact structure:

### Verdict
approved | needs-changes | needs-clarification

### Findings
Numbered list. Prefix each with a severity tag:
- [severity:high] for bugs, security issues, or broken logic
- [severity:medium] for maintainability, edge cases, or missing tests
- [severity:low] for style, naming, or nitpicks
- [severity:note] for observations or questions

### Questions
Numbered list of anything you need clarified to give a better review.

### Suggestions
Numbered list of concrete improvements the developer could make.

Be concise. No preamble. No "Here's my review". Start directly with ### Verdict.`;

// ── State ───────────────────────────────────────────────────────────────────

let reviewState: ReviewState = {};

function loadState(entries: SessionEntry[]) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e.type === "custom" && e.customType === STATE_CUSTOM_TYPE && e.data) {
      const data = e.data as ReviewState;
      if (typeof data.lastModel === "string" || typeof data.lastModel === "undefined") {
        reviewState.lastModel = data.lastModel;
      }
      if (typeof data.lastFocus === "string" || typeof data.lastFocus === "undefined") {
        reviewState.lastFocus = data.lastFocus;
      }
      break;
    }
  }
}

function saveState(pi: ExtensionAPI) {
  pi.appendEntry(STATE_CUSTOM_TYPE, { ...reviewState });
}

// ── Briefing Builder ────────────────────────────────────────────────────────

function extractSessionGoal(branch: SessionEntry[]): string {
  for (const entry of branch) {
    if (entry.type === "message" && entry.message.role === "user") {
      const content = entry.message.content;
      if (typeof content === "string" && content.trim()) return content.trim();
      if (Array.isArray(content)) {
        const text = content
          .filter((c: any) => c.type === "text")
          .map((c: any) => c.text)
          .join("\n")
          .trim();
        if (text) return text;
      }
    }
  }
  return "(no clear session goal found)";
}

function buildBriefing(branch: SessionEntry[], focusText: string): string {
  const goal = extractSessionGoal(branch);

  const recent: string[] = [];
  let count = 0;
  for (let i = branch.length - 1; i >= 0 && count < MAX_BRANCH_LOOKBACK; i--) {
    const entry = branch[i];
    if (entry.type !== "message") continue;
    const msg = entry.message;
    if (msg.role !== "user" && msg.role !== "assistant") continue;

    const roleLabel = msg.role === "user" ? "User" : "Assistant";
    let text = "";
    if (typeof msg.content === "string") {
      text = msg.content;
    } else if (Array.isArray(msg.content)) {
      text = msg.content
        .map((c: any) => {
          if (c.type === "text") return c.text;
          if (c.type === "toolCall") return `[Tool call: ${c.name}]`;
          if (c.type === "toolResult") return `[Tool result: ${c.toolName}]`;
          return "";
        })
        .filter(Boolean)
        .join("\n");
    }

    if (text.trim()) {
      recent.unshift(`## ${roleLabel}\n${text.trim()}`);
      count++;
    }
  }

  const focusSection = focusText.trim()
    ? `## User Focus Areas\n${focusText.trim()}`
    : "";

  return [
    `## Session Goal\n${goal}`,
    `## Recent Work (last ${count} turns)`,
    ...recent,
    focusSection,
    `## Instructions\nReview the recent work above in the context of the session goal. Point out bugs, missing edge cases, design issues, or anything that seems off. Remember: you do not have full project context, so only flag what you can reasonably infer from the provided materials.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

// ── Model Picker ────────────────────────────────────────────────────────────

interface ModelItem {
  id: string;
  provider: string;
  label: string;
  contextWindow?: number;
}

async function pickReviewerModel(ctx: ExtensionCommandContext): Promise<string | undefined> {
  // Refresh registry to pick up any recent changes
  (ctx.modelRegistry as any).refresh?.();

  let allModels: ModelItem[] = [];
  try {
    const available = await (ctx.modelRegistry as any).getAvailable();
    allModels = available.map((m: any) => ({
      id: m.id.includes("/") ? m.id : `${m.provider}/${m.id}`,
      provider: m.provider,
      label: m.name ?? m.id,
      contextWindow: m.contextWindow,
    }));
  } catch {
    // Fallback to empty list
  }

  if (allModels.length === 0) {
    ctx.ui.notify("No models available. Configure providers with /login or API keys.", "error");
    return undefined;
  }

  // Sort: previous model first, then by provider
  allModels.sort((a, b) => {
    const aPrev = a.id === reviewState.lastModel ? -1 : 0;
    const bPrev = b.id === reviewState.lastModel ? -1 : 0;
    if (aPrev !== bPrev) return aPrev - bPrev;
    return a.provider.localeCompare(b.provider);
  });

  let filtered = [...allModels];
  let selectedIndex = reviewState.lastModel
    ? Math.max(0, allModels.findIndex((m) => m.id === reviewState.lastModel))
    : 0;

  const modelId = await ctx.ui.custom<string | null>((_tui, theme, _kb, done) => {
    const kb = getKeybindings();
    const container = new Container();
    const listContainer = new Container();

    // Top border
    const borderLine = {
      render: (w: number) => [theme.fg("border", "─".repeat(Math.max(1, w)))],
      invalidate: () => {},
    };
    container.addChild(borderLine);
    container.addChild(new Text(theme.fg("accent", theme.bold("  🔍 Pick reviewer model")), 0, 0));
    container.addChild(new Text(theme.fg("dim", "  Type to filter · ↑↓ navigate · Enter select · Esc cancel"), 0, 0));
    container.addChild(borderLine);

    // Search input
    const input = new Input();
    input.focused = true;
    container.addChild(input);
    container.addChild(borderLine);
    container.addChild(listContainer);
    container.addChild(borderLine);

    const updateList = () => {
      listContainer.clear();
      const maxVisible = 10;
      const startIndex = Math.max(
        0,
        Math.min(selectedIndex - Math.floor(maxVisible / 2), filtered.length - maxVisible),
      );
      const endIndex = Math.min(startIndex + maxVisible, filtered.length);

      for (let i = startIndex; i < endIndex; i++) {
        const item = filtered[i];
        if (!item) continue;

        const isSelected = i === selectedIndex;
        const isPrev = item.id === reviewState.lastModel;
        const ctxBadge = item.contextWindow
          ? theme.fg("muted", `[ctx ${Math.round(item.contextWindow / 1000)}k]`)
          : "";
        const prevBadge = isPrev ? theme.fg("warning", " ← previous") : "";

        let line: string;
        if (isSelected) {
          line = theme.fg("accent", "→ ") + theme.fg("accent", item.label) + " " + theme.fg("muted", `[${item.provider}]`) + ctxBadge + prevBadge;
        } else {
          line = "  " + item.label + " " + theme.fg("muted", `[${item.provider}]`) + ctxBadge + prevBadge;
        }
        listContainer.addChild(new Text(line, 0, 0));
      }

      if (startIndex > 0 || endIndex < filtered.length) {
        listContainer.addChild(new Text(theme.fg("muted", `  (${selectedIndex + 1}/${filtered.length})`), 0, 0));
      }

      if (filtered.length === 0) {
        listContainer.addChild(new Text(theme.fg("muted", "  No matching models"), 0, 0));
      }
    };

    updateList();

    return {
      render: (width: number) => container.render(width),
      invalidate: () => container.invalidate(),
      handleInput: (data: string) => {
        if (kb.matches(data, "tui.select.up")) {
          if (filtered.length === 0) return true;
          selectedIndex = selectedIndex === 0 ? filtered.length - 1 : selectedIndex - 1;
          updateList();
          return true;
        }
        if (kb.matches(data, "tui.select.down")) {
          if (filtered.length === 0) return true;
          selectedIndex = selectedIndex === filtered.length - 1 ? 0 : selectedIndex + 1;
          updateList();
          return true;
        }
        if (kb.matches(data, "tui.select.confirm")) {
          const item = filtered[selectedIndex];
          if (item) done(item.id);
          else done(null);
          return true;
        }
        if (kb.matches(data, "tui.select.cancel")) {
          done(null);
          return true;
        }
        // Pass to search input
        input.handleInput(data);
        const query = input.getValue();
        filtered = query
          ? fuzzyFilter(allModels, query, (m) => `${m.id} ${m.provider} ${m.label}`)
          : [...allModels];
        selectedIndex = Math.min(selectedIndex, Math.max(0, filtered.length - 1));
        updateList();
        return true;
      },
    };
  });

  return modelId ?? undefined;
}

// ── Spawn Reviewer ──────────────────────────────────────────────────────────

const REVIEW_TIMEOUT_MS = 18_000_000; // 5 hours

async function spawnReviewer(
  modelId: string,
  briefing: string,
  signal: AbortSignal,
): Promise<string> {
  const tmpDir = await mkdtemp(join(tmpdir(), "review-buddy-"));
  const promptPath = join(tmpDir, "reviewer-prompt.md");
  const systemPath = join(tmpDir, "reviewer-system.md");

  let accumulated = "";
  let proc: ReturnType<typeof spawn> | null = null;

  const cleanup = async () => {
    try { await unlink(promptPath); } catch {}
    try { await unlink(systemPath); } catch {}
    try { await rmdir(tmpDir); } catch {}
  };

  try {
    await writeFile(promptPath, briefing, "utf-8");
    await writeFile(systemPath, REVIEWER_SYSTEM_PROMPT, "utf-8");

    if (signal.aborted) {
      throw new Error("Review cancelled");
    }

    const args = [
      "--mode", "json",
      "--model", modelId,
      "--no-session",
      "--no-extensions",
      "--tools", "read,bash,grep,find,ls",
      "--system-prompt", systemPath,
      `@${promptPath}`,
    ];

    return await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        proc?.kill("SIGTERM");
        reject(new Error(`Review timed out after ${REVIEW_TIMEOUT_MS / 1000}s`));
      }, REVIEW_TIMEOUT_MS);

      proc = spawn("pi", args, {
        stdio: ["ignore", "pipe", "pipe"],
        shell: false,
      });

      let buffer = "";
      let stderr = "";

      const processLine = (line: string) => {
        if (!line.trim()) return;
        try {
          const event = JSON.parse(line);
          if (event.type === "message_end" && event.message?.role === "assistant") {
            for (const part of event.message.content ?? []) {
              if (part.type === "text") {
                accumulated += part.text;
              }
            }
          }
        } catch {
          // ignore malformed lines
        }
      };

      proc.stdout!.on("data", (data) => {
        buffer += data.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) processLine(line);
      });

      proc.stderr!.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", async (code) => {
        clearTimeout(timeoutId);
        if (buffer.trim()) processLine(buffer);
        await cleanup();

        if (signal.aborted) {
          reject(new Error("Review cancelled"));
          return;
        }
        if (code !== 0) {
          reject(new Error(`Reviewer exited with code ${code}. stderr: ${stderr}`));
          return;
        }
        if (!accumulated.trim()) {
          reject(new Error("Reviewer produced no output"));
          return;
        }
        resolve(accumulated);
      });

      proc.on("error", async (err) => {
        clearTimeout(timeoutId);
        await cleanup();
        reject(err);
      });

      signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        proc?.kill("SIGTERM");
        setTimeout(() => {
          if (proc && !proc.killed) proc.kill("SIGKILL");
        }, 5000);
      });
    });
  } catch (err) {
    await cleanup();
    throw err;
  }
}

// ── Parser ──────────────────────────────────────────────────────────────────

function parseReview(raw: string): ParsedReview {
  const findings: ReviewFinding[] = [];
  const questions: string[] = [];
  const suggestions: string[] = [];
  const seenFindings = new Set<string>();
  const seenQuestions = new Set<string>();
  const seenSuggestions = new Set<string>();

  const verdictMatch = raw.match(/###?\s*Verdict\s*\n?\s*(approved|needs-changes|needs-clarification)/i);
  const verdict = verdictMatch?.[1]?.toLowerCase();

  const findingsSection = raw.match(/###?\s*Findings\s*\n?([\s\S]*?)(?=###?\s*(Questions|Suggestions|Verdict|$))/i);
  if (findingsSection) {
    for (const line of findingsSection[1].split("\n")) {
      const match = line.match(/^\s*(?:\d+\.\s*)?\[(severity:)?(high|medium|low|note)\]\s*(.+)$/i);
      if (match) {
        const sev = match[2].toLowerCase();
        const text = match[3].trim();
        if (!isVacuous(text) && !seenFindings.has(text)) {
          seenFindings.add(text);
          findings.push({
            severity: VALID_SEVERITIES.has(sev) ? (sev as any) : "note",
            text,
          });
        }
      } else if (line.trim().startsWith("-") || line.trim().match(/^\d+\./)) {
        const clean = line.replace(/^\s*(?:-\s*|\d+\.\s*)/, "").trim();
        if (clean && !isVacuous(clean) && !seenFindings.has(clean)) {
          seenFindings.add(clean);
          findings.push({ severity: "note", text: clean });
        }
      }
    }
  }

  const questionsSection = raw.match(/###?\s*Questions\s*\n?([\s\S]*?)(?=###?\s*(Suggestions|Findings|Verdict|$))/i);
  if (questionsSection) {
    for (const line of questionsSection[1].split("\n")) {
      const clean = line.replace(/^\s*(?:-\s*|\d+\.\s*)/, "").trim();
      if (clean && !isVacuous(clean) && !seenQuestions.has(clean)) {
        seenQuestions.add(clean);
        questions.push(clean);
      }
    }
  }

  const suggestionsSection = raw.match(/###?\s*Suggestions\s*\n?([\s\S]*?)(?=###?\s*(Questions|Findings|Verdict|$))/i);
  if (suggestionsSection) {
    for (const line of suggestionsSection[1].split("\n")) {
      const clean = line.replace(/^\s*(?:-\s*|\d+\.\s*)/, "").trim();
      if (clean && !isVacuous(clean) && !seenSuggestions.has(clean)) {
        seenSuggestions.add(clean);
        suggestions.push(clean);
      }
    }
  }

  return { verdict, findings, questions, suggestions, raw };
}

// ── Editor Prefill Formatter ────────────────────────────────────────────────

const VACUOUS = /^\s*(?:_*none_*|n\/a|na|no\s*(?:issues?|findings?)|nothing|empty|nil|null)\s*$/i;

function isVacuous(text: string): boolean {
  return !text || VACUOUS.test(text);
}

function formatForPrimary(parsed: ParsedReview, reviewerModel: string, focusText: string): string {
  const lines: string[] = [];
  lines.push(`I've had ${reviewerModel} review the recent work.${focusText ? ` Focus: ${focusText}` : ""}`);
  lines.push("");

  const meaningfulFindings = parsed.findings.filter((f) => !isVacuous(f.text));
  const meaningfulQuestions = parsed.questions.filter((q) => !isVacuous(q));
  const meaningfulSuggestions = parsed.suggestions.filter((s) => !isVacuous(s));
  const hasAnyContent = meaningfulFindings.length > 0 || meaningfulQuestions.length > 0 || meaningfulSuggestions.length > 0;

  // If the model didn't follow the structured format or gave only vacuous placeholders,
  // fall back to the raw review so the user isn't left with an empty review.
  if (!hasAnyContent) {
    lines.push("**Reviewer output (raw):**");
    lines.push("```");
    lines.push(parsed.raw || "(no output)");
    lines.push("```");
    lines.push("");
    lines.push("Please review the above and address any issues before continuing.");
    return lines.join("\n");
  }

  if (parsed.verdict) {
    lines.push(`**Verdict:** ${parsed.verdict}`);
    lines.push("");
  }

  lines.push("**Findings:**");
  if (meaningfulFindings.length > 0) {
    for (const f of meaningfulFindings) {
      const tag = f.severity === "high" ? "🔴" : f.severity === "medium" ? "🟡" : f.severity === "low" ? "🔵" : "⚪";
      lines.push(`${tag} [${f.severity}] ${f.text}`);
    }
  } else {
    lines.push("_None_");
  }
  lines.push("");

  lines.push("**Questions:**");
  if (meaningfulQuestions.length > 0) {
    for (const q of meaningfulQuestions) {
      lines.push(`❓ ${q}`);
    }
  } else {
    lines.push("_None_");
  }
  lines.push("");

  lines.push("**Suggestions:**");
  if (meaningfulSuggestions.length > 0) {
    for (const s of meaningfulSuggestions) {
      lines.push(`💡 ${s}`);
    }
  } else {
    lines.push("_None_");
  }
  lines.push("");

  lines.push("Please address the above before continuing.");

  return lines.join("\n");
}

// ── Border helpers ──────────────────────────────────────────────────────────

function padVisible(s: string, len: number): string {
  const vis = visibleWidth(s);
  return s + " ".repeat(Math.max(0, len - vis));
}

function borderTop(width: number, theme: ExtensionCommandContext["ui"]["theme"]): string {
  return theme.fg("border", "╭" + "─".repeat(Math.max(0, width - 2)) + "╮");
}

function borderBot(width: number, theme: ExtensionCommandContext["ui"]["theme"]): string {
  return theme.fg("border", "╰" + "─".repeat(Math.max(0, width - 2)) + "╯");
}

function borderRow(content: string, width: number, theme: ExtensionCommandContext["ui"]["theme"]): string {
  const inner = Math.max(0, width - 4);
  return theme.fg("border", "│ ") + padVisible(content, inner) + theme.fg("border", " │");
}

// ── Styled Result Overlay ───────────────────────────────────────────────────

function buildResultOverlay(
  parsed: ParsedReview,
  reviewerModel: string,
  focusText: string,
  theme: ExtensionCommandContext["ui"]["theme"],
  onAccept: () => void,
  onDismiss: () => void,
) {
  const meaningfulFindings = parsed.findings.filter((f) => !isVacuous(f.text));
  const meaningfulQuestions = parsed.questions.filter((q) => !isVacuous(q));
  const meaningfulSuggestions = parsed.suggestions.filter((s) => !isVacuous(s));

  const severityColor = (s: string) => {
    if (s === "high") return "error";
    if (s === "medium") return "warning";
    if (s === "low") return "accent";
    return "muted";
  };

  const severityIcon = (s: string) => {
    if (s === "high") return "🔴";
    if (s === "medium") return "🟡";
    if (s === "low") return "🔵";
    return "⚪";
  };

  const verdictColor = parsed.verdict === "approved" ? "success" : parsed.verdict === "needs-changes" ? "error" : "warning";

  return {
    render: (width: number) => {
      const innerW = Math.max(0, width - 4);
      const c = new Container();

      c.addChild(new Text(borderTop(width, theme), 0, 0));

      // Header
      const focus = focusText ? ` | focus: ${focusText.slice(0, 24)}${focusText.length > 24 ? "…" : ""}` : "";
      c.addChild(new Text(
        borderRow(
          theme.fg("accent", "🔍 Reviewer ") +
          theme.fg("toolTitle", theme.bold(reviewerModel)) +
          theme.fg("dim", focus),
          width, theme
        ), 0, 0
      ));

      // Verdict
      if (parsed.verdict) {
        c.addChild(new Text(
          borderRow(theme.fg(verdictColor, theme.bold(`Verdict: ${parsed.verdict}`)), width, theme),
          0, 0
        ));
      }
      c.addChild(new Text(borderRow("", width, theme), 0, 0));

      // Findings
      c.addChild(new Text(borderRow(theme.fg("toolTitle", theme.bold("Findings")), width, theme), 0, 0));
      if (meaningfulFindings.length > 0) {
        for (const f of meaningfulFindings) {
          const line = `  ${severityIcon(f.severity)} ${theme.fg(severityColor(f.severity), `[${f.severity}]`)} ${f.text}`;
          // Wrap long lines roughly
          if (visibleWidth(line) > innerW - 2) {
            c.addChild(new Text(borderRow(line.slice(0, innerW - 2), width, theme), 0, 0));
          } else {
            c.addChild(new Text(borderRow(line, width, theme), 0, 0));
          }
        }
      } else {
        c.addChild(new Text(borderRow(theme.fg("dim", "  (none)"), width, theme), 0, 0));
      }
      c.addChild(new Text(borderRow("", width, theme), 0, 0));

      // Questions
      c.addChild(new Text(borderRow(theme.fg("toolTitle", theme.bold("Questions")), width, theme), 0, 0));
      if (meaningfulQuestions.length > 0) {
        for (const q of meaningfulQuestions) {
          c.addChild(new Text(borderRow(`  ❓ ${q}`, width, theme), 0, 0));
        }
      } else {
        c.addChild(new Text(borderRow(theme.fg("dim", "  (none)"), width, theme), 0, 0));
      }
      c.addChild(new Text(borderRow("", width, theme), 0, 0));

      // Suggestions
      c.addChild(new Text(borderRow(theme.fg("toolTitle", theme.bold("Suggestions")), width, theme), 0, 0));
      if (meaningfulSuggestions.length > 0) {
        for (const s of meaningfulSuggestions) {
          c.addChild(new Text(borderRow(`  💡 ${s}`, width, theme), 0, 0));
        }
      } else {
        c.addChild(new Text(borderRow(theme.fg("dim", "  (none)"), width, theme), 0, 0));
      }
      c.addChild(new Text(borderRow("", width, theme), 0, 0));

      // Footer
      c.addChild(new Text(
        borderRow(theme.fg("dim", "Enter = prefill editor  |  Esc = dismiss"), width, theme),
        0, 0
      ));

      c.addChild(new Text(borderBot(width, theme), 0, 0));

      return c.render(width);
    },
    invalidate: () => {},
    handleInput: (data: string) => {
      if (matchesKey(data, "enter")) {
        onAccept();
        return true;
      }
      if (matchesKey(data, "escape")) {
        onDismiss();
        return true;
      }
      return false;
    },
  };
}

// ── Main Extension ──────────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    loadState(ctx.sessionManager.getEntries());
  });

  pi.registerShortcut("ctrl+shift+r", {
    description: "Review recent work with a second model",
    handler: async (ctx) => {
      ctx.ui.setEditorText("/review");
    },
  });

  pi.registerCommand("review", {
    description: "Review recent work with a second model",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) {
        ctx.ui.notify("review requires interactive mode", "error");
        return;
      }

      // ── 1. Pick model ──────────────────────────────────────────────────
      const modelId = await pickReviewerModel(ctx);
      if (!modelId) return;
      reviewState.lastModel = modelId;
      saveState(pi);

      // ── 2. Focus input ─────────────────────────────────────────────────
      const focusDefault = reviewState.lastFocus ?? "";
      const focusText = (await ctx.ui.editor("Focus areas (optional):", focusDefault)) ?? "";
      // Always update: clear if empty, save if present
      reviewState.lastFocus = focusText.trim() || undefined;
      saveState(pi);

      // ── 3. Build briefing ──────────────────────────────────────────────
      const branch = ctx.sessionManager.getBranch();
      const briefing = buildBriefing(branch, focusText);

      // ── 4. Run reviewer with loader ────────────────────────────────────
      const controller = new AbortController();

      const rawReview = await ctx.ui.custom<string | null>((tui, theme, _kb, done) => {
        const loader = new BorderedLoader(tui, theme, `Reviewing with ${modelId}…`);
        loader.onAbort = () => {
          controller.abort();
          done(null);
        };

        spawnReviewer(modelId, briefing, controller.signal)
          .then((text) => done(text))
          .catch((err) => {
            ctx.ui.notify(`Review failed: ${err.message}`, "error");
            done(null);
          });

        return loader;
      });

      if (rawReview === null) {
        ctx.ui.notify("Review cancelled", "info");
        return;
      }

      // ── 5. Parse & show styled overlay ─────────────────────────────────
      const parsed = parseReview(rawReview);

      // Save raw review to session for reference
      pi.appendEntry(REVIEW_CUSTOM_TYPE, {
        model: modelId,
        focus: focusText,
        raw: rawReview,
        parsed,
        timestamp: Date.now(),
      });

      const accepted = await ctx.ui.custom<boolean>((_tui, theme, _kb, finish) => {
        return buildResultOverlay(
          parsed,
          modelId,
          focusText,
          theme,
          () => finish(true),
          () => finish(false),
        );
      }, {
        overlay: true,
        overlayOptions: { anchor: "center", width: "65%", margin: 2 },
      });

      if (!accepted) {
        ctx.ui.notify("Review dismissed", "info");
        return;
      }

      // ── 6. Prefill editor ──────────────────────────────────────────────
      const draft = formatForPrimary(parsed, modelId, focusText);
      ctx.ui.setEditorText(draft);
      ctx.ui.notify("Review findings prefilled in editor. Edit and send when ready.", "success");
    },
  });

  pi.registerCommand("review-again", {
    description: "Re-run the last review with same model and focus",
    handler: async (_args, ctx) => {
      if (!reviewState.lastModel) {
        ctx.ui.notify("No previous review. Run /review first.", "warning");
        return;
      }
      ctx.ui.setEditorText("/review");
      ctx.ui.notify(`Re-run /review with last model (${reviewState.lastModel})`, "info");
    },
  });

  pi.registerCommand("review-raw", {
    description: "Show the raw output from the last review",
    handler: async (_args, ctx) => {
      const entries = ctx.sessionManager.getEntries();
      let lastRaw: string | undefined;
      for (let i = entries.length - 1; i >= 0; i--) {
        const e = entries[i];
        if (e.type === "custom" && e.customType === REVIEW_CUSTOM_TYPE && (e.data as any)?.raw) {
          lastRaw = (e.data as any).raw;
          break;
        }
      }
      if (!lastRaw) {
        ctx.ui.notify("No raw review found in this session.", "warning");
        return;
      }
      await ctx.ui.custom((_tui, theme, _kb, done) => {
        const c = new Container();
        c.addChild(new Text(theme.fg("accent", theme.bold("Last review — raw output")), 0, 0));
        c.addChild(new Spacer(1));
        c.addChild(new Text(lastRaw!, 0, 0));
        c.addChild(new Spacer(1));
        c.addChild(new Text(theme.fg("dim", "Press Enter or Esc to close"), 0, 0));
        return {
          render: (w: number) => c.render(w),
          invalidate: () => {},
          handleInput: (data: string) => {
            if (matchesKey(data, "enter") || matchesKey(data, "escape")) {
              done(undefined);
              return true;
            }
            return false;
          },
        };
      }, { overlay: true });
    },
  });
}
