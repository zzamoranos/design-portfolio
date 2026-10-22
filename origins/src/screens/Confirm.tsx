import { motion } from "framer-motion";
import { useState } from "react";
import { alternatives, parol, todayLabel } from "../content";
import { Photo } from "../components/Photo";
import { Stamp } from "../components/Stamp";
import { BackButton, Button, Sheet } from "../components/ui";
import { spring } from "../lib";

export function Layers({ active }: { active: 0 | 1 | 2 | 3 }) {
  const names = ["Seen", "Story", "Family"];
  return (
    <div className="flex items-center gap-3 text-[12px] font-medium">
      {names.map((n, i) => (
        <span key={n} className={`flex items-center gap-1.5 ${i < active ? "text-ink" : "text-muted/60"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${i < active ? "bg-ink" : "bg-hairline"}`} />
          {n}
        </span>
      ))}
    </div>
  );
}

export function Confirm({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [sheet, setSheet] = useState(false);
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { ...spring, delay },
  });

  return (
    <div className="absolute inset-0 flex flex-col px-6 pt-safe pb-safe">
      <div className="flex h-12 items-center">
        <BackButton onClick={onBack} />
      </div>

      <div className="relative mt-3">
        <Photo radius={24} shadow className="relative h-[340px] w-full" />

        {/* Seen layer: the outline draws in, pinned to the card like a sticker */}
        <motion.div
          className="absolute -bottom-10 right-4 rounded-full bg-bg p-1.5 shadow-soft"
          initial={{ opacity: 0, scale: 0.85, rotate: -14 }}
          animate={{ opacity: 1, scale: 1, rotate: -6 }}
          transition={{ ...spring, delay: 0.45 }}
        >
          <Stamp state="seen" icon="parol" label={parol.category} size={112} draw />
        </motion.div>
      </div>

      <motion.div {...enter(0.35)} className="mt-8">
        <Layers active={1} />
      </motion.div>
      <motion.p {...enter(0.4)} className="mt-4 flex items-center gap-2 text-[13px] text-muted">
        <span className="rounded-full border border-hairline bg-surface px-2.5 py-0.5 font-medium text-text">{parol.category}</span>
        Spotted {todayLabel()}
      </motion.p>
      <motion.h1 {...enter(0.45)} className="mt-1 font-serif text-[32px] leading-[1.15] tracking-[-0.02em]">
        Looks like a {parol.name.toLowerCase()}
      </motion.h1>
      <motion.button {...enter(0.5)} onClick={() => setSheet(true)} className="mt-2 self-start text-[15px] font-medium text-muted underline decoration-hairline decoration-2 underline-offset-4">
        Not quite?
      </motion.button>

      <div className="flex-1" />

      <motion.div {...enter(0.6)}>
        <Button onClick={onNext}>Hear the story</Button>
      </motion.div>

      <Sheet open={sheet} onClose={() => setSheet(false)} label="Other suggestions">
        <h2 className="font-serif text-[22px] tracking-[-0.01em]">Could it be one of these?</h2>
        <p className="mt-1 text-[14px] text-muted">Pick the closest match.</p>
        <ul className="mt-5 divide-y divide-hairline">
          {alternatives.map((a) => (
            <li key={a.name}>
              <button onClick={() => setSheet(false)} className="flex w-full items-center justify-between py-4 text-left">
                <span>
                  <span className="block text-[16px] font-medium">{a.name}</span>
                  <span className="block text-[13px] text-muted">{a.note}</span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
        <Button variant="secondary" className="mt-3" onClick={() => setSheet(false)}>
          Keep "Parol"
        </Button>
      </Sheet>
    </div>
  );
}
