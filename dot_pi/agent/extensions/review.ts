import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { getMarkdownTheme } from "@mariozechner/pi-coding-agent";
import { Container, Markdown, Spacer, Text } from "@mariozechner/pi-tui";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { basename, isAbsolute, relative, resolve } from "node:path";

type ReviewMode = "file" | "pending" | "remote";

interface ReviewRequest {
  mode: ReviewMode;
  cwd: string;
  target: string;
  displayTarget: string;
  focus?: string;
}

interface ReviewUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  cost: number;
  totalTokens: number;
}

interface ReviewReportDetails {
  request: ReviewRequest;
  success: boolean;
  exitCode: number;
  stopReason?: string;
  model?: string;
  errorMessage?: string;
  stderr?: string;
  usage?: ReviewUsage;
}

interface AssistantMessageLike {
  role?: string;
  model?: string;
  stopReason?: string;
  errorMessage?: string;
  usage?: {
    input?: number;
    output?: number;
    cacheRead?: number;
    cacheWrite?: number;
    totalTokens?: number;
    cost?: { total?: number };
  };
  content?: Array<{ type?: string; text?: string }>;
}

function shellEscape(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

function getPiInvocation(args: string[]): { command: string; args: string[] } {
  const currentScript = process.argv[1];
  const isBunVirtualScript = currentScript?.startsWith("/$bunfs/root/");
  if (currentScript && !isBunVirtualScript && existsSync(currentScript)) {
    return { command: process.execPath, args: [currentScript, ...args] };
  }

  const execName = basename(process.execPath).toLowerCase();
  const isGenericRuntime = /^(node|bun)(\.exe)?$/.test(execName);
  if (!isGenericRuntime) {
    return { command: process.execPath, args };
  }

  return { command: "pi", args };
}

function extractAssistantText(message: AssistantMessageLike | undefined): string {
  if (!message?.content) return "";
  return message.content
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function formatUsage(usage?: ReviewUsage): string | undefined {
  if (!usage) return undefined;
  const parts: string[] = [];
  if (usage.input) parts.push(`↑${usage.input}`);
  if (usage.output) parts.push(`↓${usage.output}`);
  if (usage.cacheRead) parts.push(`R${usage.cacheRead}`);
  if (usage.cacheWrite) parts.push(`W${usage.cacheWrite}`);
  if (usage.totalTokens) parts.push(`ctx:${usage.totalTokens}`);
  if (usage.cost) parts.push(`$${usage.cost.toFixed(4)}`);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

function buildReviewerSystemPrompt(): string {
  return [
    "You are an isolated senior code reviewer running in a fresh pi session.",
    "You are not the implementation agent. Do not modify files.",
    "Use only read-only investigation via read, grep, find, ls, and bash.",
    "Be evidence-driven. Inspect diffs, relevant files, and only the minimum surrounding context needed.",
    "Focus on correctness, regressions, edge cases, security, API/behavior changes, missing tests, and maintainability risks.",
    "Do not invent problems. If something is uncertain, say what would need verification.",
    "Prefer concrete findings with precise file paths, line numbers, or command evidence whenever possible.",
    "Return Markdown with exactly these sections:",
    "# Review",
    "## Scope",
    "## Findings",
    "## Follow-ups",
    "## Verdict",
    "If there are no material issues, say 'No material issues found.' under Findings and still note any residual risk or missing coverage.",
    "Each finding should include severity, evidence, impact, and recommendation.",
  ].join("\n");
}

function buildReviewTask(request: ReviewRequest): string {
  const lines: string[] = [];

  if (request.mode === "file") {
    lines.push(`Review the file ${request.target} in the current working tree.`);
    lines.push(
      "If the file has pending git changes, review those changes first, then inspect only the supporting context needed to evaluate them.",
    );
    lines.push(
      `Useful starting commands: git diff --no-ext-diff -- ${shellEscape(request.target)}, git diff --cached --no-ext-diff -- ${shellEscape(request.target)}.`,
    );
  }

  if (request.mode === "pending") {
    lines.push("Review all pending local changes in this repository.");
    lines.push(
      "Cover staged changes, unstaged changes, and any untracked files that are relevant to the change set.",
    );
    lines.push(
      "Useful starting commands: git status --short, git diff --cached --no-ext-diff, git diff --no-ext-diff.",
    );
  }

  if (request.mode === "remote") {
    lines.push(`Review the current branch compared with ${request.target}.`);
    lines.push(
      "Use merge-base / three-dot diff semantics unless you have a strong reason not to, so the review focuses on the branch delta.",
    );
    lines.push(
      `Useful starting commands: git rev-parse --verify ${shellEscape(request.target)}, git log --oneline ${shellEscape(request.target)}..HEAD, git diff --no-ext-diff ${shellEscape(request.target)}...HEAD.`,
    );
    lines.push(
      "If the base ref does not exist locally, say so clearly and stop instead of guessing.",
    );
  }

  if (request.focus) {
    lines.push(`Additional focus from the user: ${request.focus}`);
  }

  lines.push(
    "Start by establishing the review scope, then inspect the relevant diffs/files, and produce a concise but rigorous review.",
  );

  return lines.join("\n\n");
}

function parseReviewArgs(rawArgs: string, cwd: string): ReviewRequest | undefined {
  const trimmed = rawArgs.trim();
  if (!trimmed) return undefined;

  const tokens = trimmed.split(/\s+/);
  const first = tokens[0];

  if (first === "pending") {
    return {
      mode: "pending",
      cwd,
      target: "pending changes",
      displayTarget: "Pending changes",
      focus: tokens.slice(1).join(" ") || undefined,
    };
  }

  if (first === "remote") {
    const baseRef = tokens[1] || "@{upstream}";
    return {
      mode: "remote",
      cwd,
      target: baseRef,
      displayTarget: `Diff vs ${baseRef}`,
      focus: tokens.slice(2).join(" ") || undefined,
    };
  }

  if (first === "file") {
    const filePath = tokens[1];
    if (!filePath) return undefined;
    const absolute = isAbsolute(filePath) ? filePath : resolve(cwd, filePath);
    const displayPath = isAbsolute(filePath) ? filePath : relative(cwd, absolute) || filePath;
    return {
      mode: "file",
      cwd,
      target: absolute,
      displayTarget: displayPath,
      focus: tokens.slice(2).join(" ") || undefined,
    };
  }

  const absolute = isAbsolute(first) ? first : resolve(cwd, first);
  const displayPath = isAbsolute(first) ? first : relative(cwd, absolute) || first;
  return {
    mode: "file",
    cwd,
    target: absolute,
    displayTarget: displayPath,
    focus: tokens.slice(1).join(" ") || undefined,
  };
}

async function promptForReviewRequest(args: string, ctx: any): Promise<ReviewRequest | undefined> {
  const parsed = parseReviewArgs(args, ctx.cwd);
  if (parsed) return parsed;

  const choice = await ctx.ui.select("Review scope", ["Specific file", "Pending changes", "Diff with remote/base ref"]);
  if (!choice) return undefined;

  if (choice === "Specific file") {
    const filePath = await ctx.ui.input("File to review", "src/example.ts");
    if (!filePath?.trim()) return undefined;
    const focus = await ctx.ui.input("Optional review focus", "correctness, tests, edge cases");
    return parseReviewArgs(`file ${filePath.trim()} ${focus?.trim() ?? ""}`.trim(), ctx.cwd);
  }

  if (choice === "Pending changes") {
    const focus = await ctx.ui.input("Optional review focus", "correctness, regressions, missing tests");
    return {
      mode: "pending",
      cwd: ctx.cwd,
      target: "pending changes",
      displayTarget: "Pending changes",
      focus: focus?.trim() || undefined,
    };
  }

  const baseRef = await ctx.ui.input("Base ref", "@{upstream}");
  if (baseRef === undefined) return undefined;
  const focus = await ctx.ui.input("Optional review focus", "API compatibility, bugs, tests");
  return {
    mode: "remote",
    cwd: ctx.cwd,
    target: baseRef.trim() || "@{upstream}",
    displayTarget: `Diff vs ${baseRef.trim() || "@{upstream}"}`,
    focus: focus?.trim() || undefined,
  };
}

async function runIsolatedReview(request: ReviewRequest, ctx: any, pi: ExtensionAPI) {
  const result: {
    output: string;
    exitCode: number;
    stopReason?: string;
    model?: string;
    errorMessage?: string;
    stderr: string;
    usage?: ReviewUsage;
  } = {
    output: "",
    exitCode: 1,
    stderr: "",
  };

  try {
    const args = [
      "--mode",
      "json",
      "-p",
      "--no-session",
      "--no-context-files",
      "--no-skills",
      "--no-prompt-templates",
      "--tools",
      "read,bash,grep,find,ls",
      "--append-system-prompt",
      buildReviewerSystemPrompt(),
      buildReviewTask(request),
    ];

    const currentModel = ctx.model;
    if (currentModel?.provider && currentModel?.id) {
      args.unshift(`${currentModel.provider}/${currentModel.id}`);
      args.unshift("--model");
    }

    const thinkingLevel = pi.getThinkingLevel?.();
    if (thinkingLevel) {
      args.unshift(thinkingLevel);
      args.unshift("--thinking");
    }

    const invocation = getPiInvocation(args);

    await new Promise<void>((resolvePromise, rejectPromise) => {
      const proc = spawn(invocation.command, invocation.args, {
        cwd: request.cwd,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      });

      let stdoutBuffer = "";
      let finished = false;

      const finish = (error?: Error) => {
        if (finished) return;
        finished = true;
        if (error) rejectPromise(error);
        else resolvePromise();
      };

      const processLine = (line: string) => {
        if (!line.trim()) return;

        let event: any;
        try {
          event = JSON.parse(line);
        } catch {
          return;
        }

        if (event.type === "tool_execution_start" && event.toolName) {
          ctx.ui.setStatus("review", `Reviewing: ${event.toolName}`);
        }

        if (event.type === "message_end" && event.message?.role === "assistant") {
          const message = event.message as AssistantMessageLike;
          const text = extractAssistantText(message);
          if (text) result.output = text;
          result.stopReason = message.stopReason;
          result.errorMessage = message.errorMessage;
          result.model = message.model ?? result.model;

          if (message.usage) {
            result.usage = {
              input: message.usage.input ?? 0,
              output: message.usage.output ?? 0,
              cacheRead: message.usage.cacheRead ?? 0,
              cacheWrite: message.usage.cacheWrite ?? 0,
              cost: message.usage.cost?.total ?? 0,
              totalTokens: message.usage.totalTokens ?? 0,
            };
          }
        }
      };

      proc.stdout.on("data", (chunk) => {
        stdoutBuffer += chunk.toString();
        const lines = stdoutBuffer.split("\n");
        stdoutBuffer = lines.pop() || "";
        for (const line of lines) processLine(line);
      });

      proc.stderr.on("data", (chunk) => {
        result.stderr += chunk.toString();
      });

      proc.on("close", (code) => {
        if (stdoutBuffer.trim()) processLine(stdoutBuffer);
        result.exitCode = code ?? 0;
        finish();
      });

      proc.on("error", (error) => {
        finish(error);
      });
    });
  } finally {
    ctx.ui.setStatus("review", undefined);
  }

  return result;
}

export default function reviewExtension(pi: ExtensionAPI) {
  pi.registerMessageRenderer("review-report", (message, _options, theme) => {
    const details = message.details as ReviewReportDetails | undefined;
    const container = new Container();
    const status = details?.success ? theme.fg("success", "✓") : theme.fg("error", "✗");
    const heading = details
      ? `${status} ${theme.fg("toolTitle", theme.bold("Review"))} ${theme.fg("accent", details.request.displayTarget)}`
      : `${theme.fg("toolTitle", theme.bold("Review"))}`;

    container.addChild(new Text(heading, 0, 0));

    const meta: string[] = [];
    if (details?.request.focus) meta.push(`focus: ${details.request.focus}`);
    if (details?.model) meta.push(`model: ${details.model}`);
    const usage = formatUsage(details?.usage);
    if (usage) meta.push(usage);
    if (meta.length > 0) {
      container.addChild(new Text(theme.fg("dim", meta.join("  •  ")), 0, 0));
    }

    if (details?.errorMessage) {
      container.addChild(new Spacer(1));
      container.addChild(new Text(theme.fg("error", `Error: ${details.errorMessage}`), 0, 0));
    }

    if (details?.stderr) {
      container.addChild(new Spacer(1));
      container.addChild(new Text(theme.fg("dim", details.stderr.trim()), 0, 0));
    }

    if (message.content?.trim()) {
      container.addChild(new Spacer(1));
      container.addChild(new Markdown(message.content.trim(), 0, 0, getMarkdownTheme()));
    }

    return container;
  });

  pi.registerCommand("review", {
    description: "Run an isolated review for a file, pending changes, or diff vs remote",
    getArgumentCompletions: (prefix) => {
      const options = [
        { value: "pending", label: "pending" },
        { value: "remote", label: "remote" },
        { value: "file", label: "file" },
      ];
      const filtered = options.filter((option) => option.value.startsWith(prefix));
      return filtered.length > 0 ? filtered : null;
    },
    handler: async (args, ctx) => {
      const request = await promptForReviewRequest(args, ctx);
      if (!request) {
        ctx.ui.notify("Review canceled", "info");
        return;
      }

      if (request.mode === "file" && !existsSync(request.target)) {
        ctx.ui.notify(`File not found: ${request.displayTarget}`, "error");
        return;
      }

      ctx.ui.notify(`Starting isolated review: ${request.displayTarget}`, "info");
      ctx.ui.setStatus("review", `Reviewing ${request.displayTarget}...`);

      try {
        const result = await runIsolatedReview(request, ctx, pi);
        const success = result.exitCode === 0 && result.stopReason !== "error" && result.stopReason !== "aborted";
        const content = result.output || (success ? "# Review\n\n## Findings\n\nNo output produced." : "Review failed.");

        pi.sendMessage({
          customType: "review-report",
          content,
          display: true,
          details: {
            request,
            success,
            exitCode: result.exitCode,
            stopReason: result.stopReason,
            model: result.model,
            errorMessage: result.errorMessage,
            stderr: result.stderr.trim() || undefined,
            usage: result.usage,
          } satisfies ReviewReportDetails,
        });

        if (!success) {
          ctx.ui.notify(`Review failed for ${request.displayTarget}`, "error");
          return;
        }

        ctx.ui.notify(`Review finished for ${request.displayTarget}`, "success");
      } catch (error) {
        ctx.ui.setStatus("review", undefined);
        const message = error instanceof Error ? error.message : String(error);
        pi.sendMessage({
          customType: "review-report",
          content: "Review failed before completion.",
          display: true,
          details: {
            request,
            success: false,
            exitCode: 1,
            errorMessage: message,
          } satisfies ReviewReportDetails,
        });
        ctx.ui.notify(`Review failed: ${message}`, "error");
      }
    },
  });
}
