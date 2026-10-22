import { askLabel, familyQuestion, useProfile } from "../profile";
import { motion } from "framer-motion";
import { useState } from "react";
import { otherPrompts, parol } from "../content";
import { BackButton, Button, Sheet, RelativeAvatar } from "../components/ui";
import { spring } from "../lib";

type Prompt = (typeof otherPrompts)[number];

export function Ask({
  onBack,
  onRecord,
  onSaveLater,
  onCollect,
}: {
  onBack: () => void;
  onRecord: () => void;
  onSaveLater: () => void;
  onCollect: (note?: string) => void;
}) {
  const { relative, familyNearby } = useProfile();
  const [open, setOpenState] = useState<Prompt | null>(null);
  const [shown, setShown] = useState<Prompt | null>(null);
  const [note, setNote] = useState("");
  const setOpen = (p: Prompt | null) => {
    setOpenState(p);
    if (p) {
      setShown(p);
      setNote("");
    }
  };

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { ...spring, delay },
  });

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="px-6 pt-safe">
        <div className="flex h-12 items-center">
          <BackButton onClick={onBack} />
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-safe">
        <motion.div {...enter(0.05)} className="mt-4 flex items-center gap-3">
          <RelativeAvatar relative={relative} />
          <p className="text-[14px] font-medium text-muted">{askLabel(relative)}</p>
        </motion.div>
        <motion.h1 {...enter(0.1)} className="mt-5 font-serif text-[30px] leading-[1.22] tracking-[-0.02em]">
          {familyQuestion(relative, parol.askFamily.question)}
        </motion.h1>

        <div className="flex flex-col">
        <motion.div {...enter(0.18)} className={`space-y-3 ${familyNearby ? "order-1 mt-7" : "order-2 mt-10"}`}>
          {!familyNearby && (
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-hairline" />
              <span className="text-[13px] font-medium text-muted">{relative === "someone" ? "Or record someone's answer" : "Or reach them by phone"}</span>
              <span className="h-px flex-1 bg-hairline" />
            </div>
          )}
          <Button variant={familyNearby ? "primary" : "secondary"} onClick={onRecord} className="flex items-center justify-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
              <rect x="9" y="3" width="6" height="12" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
            Record their answer
          </Button>
          <Button variant="secondary" onClick={onSaveLater}>
            Save to ask later
          </Button>
        </motion.div>

        <motion.div {...enter(0.26)} className={familyNearby ? "order-2 mt-10" : "order-1 mt-7"}>
          {familyNearby ? (
            <>
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-hairline" />
                <span className="text-[13px] font-medium text-muted">No family nearby?</span>
                <span className="h-px flex-1 bg-hairline" />
              </div>
              <p className="mt-3 text-center text-[14px] leading-[1.5] text-muted">Your stamp still counts. Try one of these instead.</p>
            </>
          ) : (
            <p className="text-[15px] leading-[1.5] text-muted">{relative === "someone" ? "Your stamp already counts. These are optional ways to go deeper." : "You're away from family right now. Your stamp still counts, so try one of these."}</p>
          )}

          <ul className="mt-5 space-y-2">
            {otherPrompts.map((p, i) => (
              <motion.li key={p.id} {...enter(0.3 + i * 0.04)}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setOpen(p)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-hairline bg-surface p-4 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-[17px] leading-snug">{p.title}</span>
                    <span className="mt-1 block text-[13px] text-muted">{p.hint}</span>
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </motion.button>
              </motion.li>
            ))}
          </ul>

          <button onClick={() => onCollect()} className="mx-auto mt-4 block h-11 px-3 text-[15px] font-medium text-muted underline decoration-hairline decoration-2 underline-offset-4">
            Just collect the stamp
          </button>
        </motion.div>
        </div>
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)} label="Answer a prompt">
        {shown && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setOpenState(null);
              onCollect(note.trim() || undefined);
            }}
          >
            <h2 className="font-serif text-[24px] leading-tight tracking-[-0.01em]">{shown.title}</h2>
            <p className="mt-1.5 text-[14px] text-muted">{shown.hint}</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={shown.placeholder}
              rows={4}
              className="mt-5 w-full resize-none rounded-2xl border border-hairline bg-bg p-4 font-serif text-[17px] leading-[1.5] placeholder:text-muted/60 focus:outline-none"
            />
            <Button type="submit" className="mt-4">
              Save and collect stamp
            </Button>
          </form>
        )}
      </Sheet>
    </div>
  );
}
