import { useProfile } from "../profile";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { parol } from "../content";
import { BackButton, Button, PlayButton } from "../components/ui";
import { spring } from "../lib";

const BARS = 40;
type Phase = "idle" | "recording" | "done";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Prototype only: no microphone. The waveform is a simulated voice.
function fakeVoice(t: number) {
  const phrase = Math.max(0, Math.sin(t / 7) * 0.5 + Math.sin(t / 2.3) * 0.25 + 0.35);
  return Math.min(1, phrase * (0.6 + Math.random() * 0.5));
}

export function Record({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const { relative } = useProfile();
  const [phase, setPhase] = useState<Phase>("idle");
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0.06));
  const [secs, setSecs] = useState(0);
  const loop = useRef<number>();
  const started = useRef(0);

  useEffect(() => () => window.clearInterval(loop.current), []);

  const start = () => {
    setSecs(0);
    started.current = performance.now();
    let t = 0;
    setPhase("recording");
    window.clearInterval(loop.current);
    loop.current = window.setInterval(() => {
      t += 1;
      setLevels((prev) => [...prev.slice(1), Math.max(0.06, fakeVoice(t))]);
      setSecs((performance.now() - started.current) / 1000);
    }, 70);
  };

  const stop = () => {
    window.clearInterval(loop.current);
    setPhase("done");
  };

  return (
    <div className="absolute inset-0 flex flex-col px-6 pt-safe pb-safe">
      <div className="flex h-12 items-center justify-between">
        <BackButton onClick={onBack} />
        <span className="text-[14px] font-medium text-muted">Recording {relative}</span>
        <span className="w-10" />
      </div>

      <p className="mt-6 text-center font-serif text-[20px] leading-[1.4] tracking-[-0.01em] text-muted">{parol.askFamily.question}</p>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex h-[120px] w-full items-center justify-between gap-[3px]" aria-hidden>
          {levels.map((l, i) => (
            <motion.span
              key={i}
              className="w-[4px] rounded-full"
              animate={{ height: `${Math.max(6, l * 120)}px`, backgroundColor: phase === "recording" ? "#B8433A" : phase === "done" ? "#1A1A1A" : "#ECE8E2" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          ))}
        </div>
        <p className="mt-6 font-mono text-[15px] tabular-nums text-muted">{fmt(secs)}</p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {phase !== "done" ? (
          <motion.div key="rec" className="flex flex-col items-center gap-4" exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}>
            <button
              aria-label={phase === "recording" ? "Stop recording" : "Start recording"}
              onClick={phase === "recording" ? stop : start}
              className="grid h-[84px] w-[84px] place-items-center rounded-full border-[3px] border-text/10"
            >
              <motion.span
                className="block bg-ink"
                animate={phase === "recording" ? { width: 30, height: 30, borderRadius: 8 } : { width: 64, height: 64, borderRadius: 32 }}
                transition={spring}
              />
            </button>
            <p className="h-5 text-[14px] text-muted">{phase === "recording" ? "Tap to stop" : `Tap to record ${relative}'s answer`}</p>
          </motion.div>
        ) : (
          <motion.div key="done" className="space-y-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
            <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface p-3 pr-4">
              <PlayButton mock={Math.max(2, secs)} label={`${relative}'s answer`} size={40} />
              <div className="flex-1">
                <p className="text-[15px] font-medium">{relative}'s answer</p>
                <p className="text-[13px] text-muted">{fmt(secs)}</p>
              </div>
              <button onClick={start} className="text-[14px] font-medium text-muted">
                Re-record
              </button>
            </div>
            <Button onClick={onDone}>Add to passport</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
