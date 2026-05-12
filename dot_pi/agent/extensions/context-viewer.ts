import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const SYSTEM_MARKER = "=== SYSTEM PROMPT ===";
const MESSAGES_MARKER = "=== MESSAGES (JSON) ===";

function toEditorFormat(sys: string, messages: any[]) {
  // Put the system prompt as plain, unescaped text.
  // Keep messages as formatted JSON so it's "1 item per line" but safely structured.
  return `${SYSTEM_MARKER}\n${sys}\n\n${MESSAGES_MARKER}\n${JSON.stringify(messages, null, 2)}`;
}

function fromEditorFormat(text: string) {
  const sysStart = text.indexOf(SYSTEM_MARKER);
  const msgStart = text.indexOf(MESSAGES_MARKER);

  if (sysStart === -1 || msgStart === -1) {
    throw new Error("Missing boundary markers. Please keep '=== SYSTEM PROMPT ===' and '=== MESSAGES (JSON) ==='.");
  }

  const systemPrompt = text.slice(sysStart + SYSTEM_MARKER.length, msgStart).trim();
  const messagesJson = text.slice(msgStart + MESSAGES_MARKER.length).trim();
  
  return { 
    systemPrompt, 
    messages: JSON.parse(messagesJson) 
  };
}

export default function (pi: ExtensionAPI) {
  let interceptNext = false;
  let overrideMessages: any[] | null = null;

  pi.registerCommand("context", {
    description: "View the LLM context (system prompt & messages) as it stands right now",
    handler: async (args, ctx) => {
      const sys = ctx.getSystemPrompt();
      const { messages } = ctx.sessionManager.buildSessionContext();
      
      const text = toEditorFormat(sys, messages);
      await ctx.ui.editor("Current Context", text);
    }
  });

  pi.registerCommand("intercept", {
    description: "Intercept and edit the context (system prompt & messages) before the next LLM call",
    handler: async (args, ctx) => {
      interceptNext = true;
      ctx.ui.notify("Will intercept the next turn to edit context.", "success");
    }
  });

  pi.on("before_agent_start", async (event, ctx) => {
    if (interceptNext) {
      interceptNext = false;

      const { messages } = ctx.sessionManager.buildSessionContext();
      const text = toEditorFormat(event.systemPrompt, messages);
      const edited = await ctx.ui.editor("Intercept: Edit Full Context", text);
      
      if (edited && edited !== text) {
        try {
          const parsed = fromEditorFormat(edited);
          
          overrideMessages = parsed.messages;
          ctx.ui.notify("Context modified for this turn.", "info");
          return { systemPrompt: parsed.systemPrompt };
        } catch (e) {
          ctx.ui.notify(`Parse error: ${e instanceof Error ? e.message : String(e)}`, "error");
        }
      } else {
        ctx.ui.notify("Context unchanged.", "info");
      }
    }
  });

  pi.on("context", async (event, ctx) => {
    if (overrideMessages) {
      const msgs = overrideMessages;
      overrideMessages = null; 
      return { messages: msgs };
    }
  });
}

