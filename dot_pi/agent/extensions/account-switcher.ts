/**
 * Account Switcher Extension
 *
 * Manage multiple credentials (OAuth JWTs or API keys) for any provider and swap
 * them in ~/.pi/agent/auth.json without manual editing.
 *
 * Commands:
 *   /account           Interactive menu
 *   /account switch    Switch active account for a provider
 *   /account add       Add a new account
 *   /account remove    Remove a stored account
 *   /account list      List all stored accounts
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface OAuthAuth {
  type: "oauth";
  access: string;
  refresh?: string;
  expires?: number;
  accountId?: string;
  projectId?: string;
  email?: string;
  [key: string]: unknown;
}

interface ApiKeyAuth {
  type: "api_key";
  key: string;
  [key: string]: unknown;
}

type AuthEntry = OAuthAuth | ApiKeyAuth;

interface Account {
  id: string;
  provider: string;
  name: string;
  auth: AuthEntry;
}

interface AccountsConfig {
  accounts: Account[];
  active: Record<string, string>; // provider -> account id
}

/* ------------------------------------------------------------------ */
/* Paths                                                              */
/* ------------------------------------------------------------------ */

const AGENT_DIR = join(homedir(), ".pi", "agent");
const ACCOUNTS_FILE = join(AGENT_DIR, "account-switcher.json");
const AUTH_FILE = join(AGENT_DIR, "auth.json");

/* ------------------------------------------------------------------ */
/* Persistence                                                        */
/* ------------------------------------------------------------------ */

function loadAccounts(): AccountsConfig {
  if (!existsSync(ACCOUNTS_FILE)) return { accounts: [], active: {} };
  try {
    return JSON.parse(readFileSync(ACCOUNTS_FILE, "utf-8")) as AccountsConfig;
  } catch {
    return { accounts: [], active: {} };
  }
}

function saveAccounts(config: AccountsConfig): void {
  writeFileSync(ACCOUNTS_FILE, JSON.stringify(config, null, 2) + "\n");
}

function loadAuth(): Record<string, unknown> {
  if (!existsSync(AUTH_FILE)) return {};
  try {
    return JSON.parse(readFileSync(AUTH_FILE, "utf-8")) as Record<
      string,
      unknown
    >;
  } catch {
    return {};
  }
}

function saveAuth(auth: Record<string, unknown>): void {
  writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2) + "\n");
}

/* ------------------------------------------------------------------ */
/* JWT helpers                                                        */
/* ------------------------------------------------------------------ */

function decodeJwtEmail(token: string): string | undefined {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return undefined;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8"),
    );
    return (
      payload["https://api.openai.com/profile"]?.email ??
      payload["email"] ??
      payload["sub"] ??
      undefined
    );
  } catch {
    return undefined;
  }
}

function suggestName(auth: AuthEntry): string | undefined {
  if (auth.type === "oauth" && auth.access) {
    const email = decodeJwtEmail(auth.access);
    if (email) return email;
    if (auth.email) return auth.email;
    return `OAuth …${auth.access.slice(-8)}`;
  }
  if (auth.type === "api_key" && auth.key) {
    return `API Key …${auth.key.slice(-4)}`;
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Parsing pasted input                                               */
/* ------------------------------------------------------------------ */

function parsePastedInput(raw: string): AuthEntry | undefined {
  const trimmed = raw.trim();

  // JSON object
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.type === "oauth" && parsed.access) {
        return {
          ...parsed,
          type: "oauth",
          access: String(parsed.access),
        } as AuthEntry;
      }
      if (parsed.type === "api_key" && parsed.key) {
        return {
          ...parsed,
          type: "api_key",
          key: String(parsed.key),
        } as AuthEntry;
      }
    } catch {
      // fall through
    }
  }

  // JWT heuristic
  if (trimmed.startsWith("eyJ")) {
    return { type: "oauth", access: trimmed };
  }

  // API key heuristic
  if (trimmed.startsWith("sk-")) {
    return { type: "api_key", key: trimmed };
  }

  return undefined;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function isActiveAccount(config: AccountsConfig, account: Account): boolean {
  // Prefer the tracked active id, but also fall back to comparing auth.json content
  if (config.active[account.provider] === account.id) return true;
  const auth = loadAuth();
  const current = auth[account.provider];
  if (!current || typeof current !== "object") return false;
  return JSON.stringify(current) === JSON.stringify(account.auth);
}

function getProviderAccounts(
  config: AccountsConfig,
  provider: string,
): Account[] {
  return config.accounts.filter((a) => a.provider === provider);
}

function getProviders(config: AccountsConfig): string[] {
  return [...new Set(config.accounts.map((a) => a.provider))].sort();
}

/* ------------------------------------------------------------------ */
/* Extension                                                          */
/* ------------------------------------------------------------------ */

export default function accountSwitcherExtension(pi: ExtensionAPI) {
  /**
   * Shared switch logic used by both /account command and Alt+L shortcut.
   */
  async function switchAccount(ctx: ExtensionContext) {
    const config = loadAccounts();

    if (config.accounts.length === 0) {
      ctx.ui.notify("No accounts stored. Run /account add", "warning");
      return;
    }

    const providers = getProviders(config);
    let provider: string | null;

    if (providers.length === 1) {
      provider = providers[0];
    } else {
      const labels = providers.map((p) => {
        const count = getProviderAccounts(config, p).length;
        const activeName = config.accounts.find(
          (a) => a.id === config.active[p],
        )?.name;
        return `${p} (${count})${activeName ? ` → ${activeName}` : ""}`;
      });
      const choice = await ctx.ui.select("Select provider", labels);
      if (!choice) return;
      provider = providers[labels.indexOf(choice)];
    }
    if (!provider) return;

    const accounts = getProviderAccounts(config, provider);
    // Show active account first so it's pre-selected
    accounts.sort((a, b) => {
      const aActive = isActiveAccount(config, a);
      const bActive = isActiveAccount(config, b);
      if (aActive === bActive) return a.name.localeCompare(b.name);
      return aActive ? -1 : 1;
    });
    const choices = accounts.map((a) => {
      const active = isActiveAccount(config, a) ? "● " : "○ ";
      return `${active}${a.name} (${a.auth.type})`;
    });

    const choice = await ctx.ui.select(`Switch ${provider} account`, choices);
    if (!choice) return;

    const idx = choices.indexOf(choice);
    const account = accounts[idx];
    if (!account) return;

    const auth = loadAuth();
    auth[provider] = account.auth;
    saveAuth(auth);

    config.active[provider] = account.id;
    saveAccounts(config);

    ctx.ui.notify(`Switched ${provider} to "${account.name}"`, "success");
  }

  /* ------------------------ shortcut ------------------------ */

  pi.registerShortcut("alt+l", {
    description: "Switch active provider account",
    handler: async (ctx) => switchAccount(ctx),
  });

  /* ------------------------ command ------------------------ */

  pi.registerCommand("account", {
    description: "Manage provider accounts (switch, add, remove, list)",
    handler: async (args, ctx) => {
      let config = loadAccounts();

      /* ------------------------ helpers ------------------------ */

      async function doSwitch() {
        await switchAccount(ctx);
      }

      async function doAdd() {
        const auth = loadAuth();
        const knownProviders = new Set([
          ...Object.keys(auth),
          ...config.accounts.map((a) => a.provider),
        ]);
        const providerChoices = [...knownProviders].sort();
        if (providerChoices.length > 0) {
          providerChoices.push("Other...");
        }

        let provider: string | null = null;
        if (providerChoices.length > 0) {
          const choice = await ctx.ui.select("Provider", providerChoices);
          if (choice === null) {
            ctx.ui.notify("Cancelled", "info");
            return;
          }
          if (choice === "Other...") {
            provider = await ctx.ui.input(
              "Provider name (e.g. openai-codex, anthropic)",
            );
          } else {
            provider = choice;
          }
        } else {
          provider = await ctx.ui.input(
            "Provider name (e.g. openai-codex, anthropic)",
          );
        }

        if (!provider || !provider.trim()) {
          ctx.ui.notify("Cancelled", "info");
          return;
        }
        provider = provider.trim();

        let authEntry: AuthEntry | undefined;

        const existingAuth = auth[provider];
        if (
          existingAuth &&
          typeof existingAuth === "object" &&
          existingAuth !== null &&
          (existingAuth as Record<string, unknown>).type
        ) {
          const useExisting = await ctx.ui.confirm(
            "Use current token?",
            `${provider} already has a token in auth.json. Use it?`,
          );
          if (useExisting) {
            const raw = existingAuth as Record<string, unknown>;
            if (raw.type === "oauth" && typeof raw.access === "string") {
              authEntry = {
                type: "oauth",
                access: raw.access,
                refresh:
                  typeof raw.refresh === "string" ? raw.refresh : undefined,
                expires:
                  typeof raw.expires === "number" ? raw.expires : undefined,
                accountId:
                  typeof raw.accountId === "string" ? raw.accountId : undefined,
                projectId:
                  typeof raw.projectId === "string" ? raw.projectId : undefined,
                email: typeof raw.email === "string" ? raw.email : undefined,
              } as AuthEntry;
            } else if (raw.type === "api_key" && typeof raw.key === "string") {
              authEntry = { type: "api_key", key: raw.key } as AuthEntry;
            }
          }
        }

        if (!authEntry) {
          const raw = await ctx.ui.input(
            "Paste token, key, or full auth.json object",
          );
          if (raw === null) {
            ctx.ui.notify("Cancelled", "info");
            return;
          }

          authEntry = parsePastedInput(raw);
          if (!authEntry) {
            ctx.ui.notify(
              "Could not detect account type. Expected JWT (eyJ…), API key (sk-…), or JSON object.",
              "error",
            );
            return;
          }
        }

        let name = suggestName(authEntry);
        const nameInput = await ctx.ui.input(
          name ? `Account name (Enter to use "${name}")` : "Account name",
        );
        if (nameInput === null) {
          ctx.ui.notify("Cancelled", "info");
          return;
        }
        if (nameInput.trim()) {
          name = nameInput.trim();
        }
        if (!name) {
          ctx.ui.notify("A name is required", "error");
          return;
        }

        const account: Account = {
          id: generateId(),
          provider,
          name,
          auth: authEntry,
        };

        config.accounts.push(account);
        saveAccounts(config);
        ctx.ui.notify(`Added "${name}" for ${provider}`, "success");
      }

      async function doRemove() {
        if (config.accounts.length === 0) {
          ctx.ui.notify("No accounts stored", "warning");
          return;
        }

        const providers = getProviders(config);
        let provider: string | null;
        if (providers.length === 1) {
          provider = providers[0];
        } else {
          provider = await ctx.ui.select("Select provider", providers);
        }
        if (!provider) return;

        const accounts = getProviderAccounts(config, provider);
        const choice = await ctx.ui.select(
          `Remove account for ${provider}`,
          accounts.map((a) => `${a.name} (${a.auth.type})`),
        );
        if (!choice) return;

        const idx = accounts.findIndex(
          (a) => `${a.name} (${a.auth.type})` === choice,
        );
        if (idx < 0) return;
        const account = accounts[idx];
        const globalIdx = config.accounts.findIndex((a) => a.id === account.id);
        if (globalIdx >= 0) {
          config.accounts.splice(globalIdx, 1);
          if (config.active[account.provider] === account.id) {
            delete config.active[account.provider];
          }
          saveAccounts(config);
          ctx.ui.notify(
            `Removed "${account.name}" from ${provider}`,
            "success",
          );
        }
      }

      async function doList() {
        if (config.accounts.length === 0) {
          ctx.ui.notify("No accounts stored", "info");
          return;
        }

        const lines: string[] = [];
        for (const provider of getProviders(config)) {
          lines.push(provider + ":");
          for (const account of getProviderAccounts(config, provider)) {
            const active = isActiveAccount(config, account) ? "● " : "○ ";
            lines.push(`  ${active}${account.name} (${account.auth.type})`);
          }
        }
        ctx.ui.notify(lines.join("\n"), "info");
      }

      /* ------------------------ routing ------------------------ */

      const subcommand = args.trim().toLowerCase();

      if (subcommand === "switch") return doSwitch();
      if (subcommand === "add") return doAdd();
      if (subcommand === "remove") return doRemove();
      if (subcommand === "list") return doList();

      // No args -> interactive menu
      const action = await ctx.ui.select("Account manager", [
        "  Switch account",
        "󰀔  Add account",
        "󰀍  Remove account",
        "  List accounts",
      ]);
      if (!action) return;
      if (action.includes("Switch")) return doSwitch();
      if (action.includes("Add")) return doAdd();
      if (action.includes("Remove")) return doRemove();
      if (action.includes("List")) return doList();
    },
  });
}
