/**
 * Speech-to-Text extension for pi
 *
 * Press Alt+R to start recording from your microphone.
 * Press Alt+R again to stop — audio is transcribed via faster-whisper
 * and injected as your next prompt.
 *
 * First run downloads the whisper "base" model (~140MB).
 * Change WHISPER_MODEL below to "tiny" (~75MB) or "small" (~460MB).
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { spawn } from "node:child_process";
import { mkdtempSync, unlinkSync, existsSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ── Config ────────────────────────────────────────────────────────────────────
const WHISPER_PYTHON = "/home/jp/.pi/agent/.venv/bin/python";
const WHISPER_MODEL  = "base";   // tiny | base | small | medium | large-v3
const MIC_SOURCE     = "";       // leave empty to use system default mic
// ─────────────────────────────────────────────────────────────────────────────

// Inline Python script — runs faster-whisper and prints the transcript
const TRANSCRIBE_PY = `
import sys, warnings
warnings.filterwarnings("ignore")
from faster_whisper import WhisperModel
model = WhisperModel(sys.argv[2], device="cpu", compute_type="int8")
segments, _ = model.transcribe(sys.argv[1], beam_size=5, language="en")
print(" ".join(s.text.strip() for s in segments).strip())
`.trim();

type RecordingState =
  | { status: "idle" }
  | { status: "recording"; proc: ReturnType<typeof spawn>; wavFile: string; tmpDir: string };

export default function (pi: ExtensionAPI) {
  let state: RecordingState = { status: "idle" };

  // Write the transcription script to a stable temp location once
  const scriptPath = join(tmpdir(), "pi-stt-transcribe.py");
  writeFileSync(scriptPath, TRANSCRIBE_PY, "utf8");

  function cleanupRecordingArtifacts(tmpDir: string, wavFile?: string) {
    try {
      if (wavFile && existsSync(wavFile)) unlinkSync(wavFile);
    } catch {}
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }

  function startRecording(ctx: { ui: { setStatus: (k: string, v: string) => void; notify: (msg: string, level: string) => void } }) {
    if (state.status === "recording") return;

    let tmpDir: string;
    try {
      tmpDir = mkdtempSync(join(tmpdir(), "pi-stt-"));
    } catch (e) {
      ctx.ui.notify(`STT: failed to create temp dir: ${e}`, "error");
      return;
    }

    const wavFile = join(tmpDir, "rec.wav");

    // ffmpeg records from the default PipeWire/PulseAudio source and writes
    // a proper WAV file that faster-whisper can read.
    const inputSource = MIC_SOURCE || "default";
    const args = [
      "-y",                          // overwrite without asking
      "-f", "pulse",                 // PulseAudio/PipeWire input
      "-i", inputSource,             // mic source
      "-ar", "16000",                // 16kHz (whisper requirement)
      "-ac", "1",                    // mono
      "-f", "wav",                   // output format
      wavFile,
    ];

    const proc = spawn("ffmpeg", args, { stdio: "ignore" });

    proc.on("error", (err) => {
      ctx.ui.notify(`STT: ffmpeg failed — ${err.message}`, "error");
      ctx.ui.setStatus("stt", "");
      cleanupRecordingArtifacts(tmpDir, wavFile);
      state = { status: "idle" };
    });

    state = { status: "recording", proc, wavFile, tmpDir };
    ctx.ui.setStatus("stt", "🎙 recording… (press Alt+R to stop)");
  }

  async function stopAndTranscribe(
    ctx: {
      ui: {
        setStatus: (k: string, v: string) => void;
        notify: (msg: string, level: string) => void;
        setEditorText: (text: string) => void;
        getEditorText: () => string;
      };
    },
  ) {
    if (state.status !== "recording") return;

    const { proc, wavFile, tmpDir } = state;
    state = { status: "idle" };

    // Stop the recorder gracefully
    proc.kill("SIGTERM");
    // Give it a moment to flush
    await new Promise<void>((r) => setTimeout(r, 200));

    if (!existsSync(wavFile)) {
      ctx.ui.setStatus("stt", "");
      ctx.ui.notify("STT: no audio captured", "warning");
      cleanupRecordingArtifacts(tmpDir, wavFile);
      return;
    }

    ctx.ui.setStatus("stt", "⏳ transcribing…");

    // Run whisper in a separate process — non-blocking
    const result = await new Promise<string>((resolve, reject) => {
      const proc = spawn(WHISPER_PYTHON, [scriptPath, wavFile, WHISPER_MODEL]);
      let stdout = "";
      let stderr = "";
      let settled = false;
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        proc.kill();
        reject(new Error("transcription timed out"));
      }, 60_000);

      proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
      proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
      proc.on("error", (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        reject(err);
      });
      proc.on("close", (code) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        if (code === 0) resolve(stdout.trim());
        else reject(new Error(stderr.trim().slice(-200) || `exit code ${code}`));
      });
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      ctx.ui.notify(`STT: transcription failed — ${msg.slice(0, 120)}`, "error");
      ctx.ui.setStatus("stt", "");
      return null;
    }).finally(() => {
      cleanupRecordingArtifacts(tmpDir, wavFile);
    });

    if (result === null) return;

    if (!result) {
      ctx.ui.notify("STT: nothing heard", "warning");
      ctx.ui.setStatus("stt", "");
      return;
    }

    ctx.ui.notify(`STT: "${result}"`, "success");
    ctx.ui.setStatus("stt", "");

    const currentEditorText = ctx.ui.getEditorText();
    const nextEditorText = currentEditorText.length > 0 ? `${currentEditorText}\n${result}` : result;
    ctx.ui.setEditorText(nextEditorText);
  }

  // ── Shortcut: press to start, press again to stop+transcribe ─────────────
  pi.registerShortcut("alt+r", {
    description: "STT: press Alt+R to start recording, press again to transcribe",
    handler: async (ctx) => {
      if (state.status === "idle") {
        startRecording(ctx);
      } else {
        await stopAndTranscribe(ctx);
      }
    },
  });

  // ── Slash command as alternative trigger ──────────────────────────────────
  pi.registerCommand("stt", {
    description: "Toggle microphone recording (press again to transcribe)",
    handler: async (_args, ctx) => {
      if (state.status === "idle") {
        startRecording(ctx);
        ctx.ui.notify("Recording started — run /stt again to stop & transcribe", "info");
      } else {
        await stopAndTranscribe(ctx);
      }
    },
  });

  // Cleanup on exit
  pi.on("session_shutdown", async () => {
    if (state.status === "recording") {
      const { proc, wavFile, tmpDir } = state;
      proc.kill("SIGTERM");
      cleanupRecordingArtifacts(tmpDir, wavFile);
      state = { status: "idle" };
    }
  });
}
