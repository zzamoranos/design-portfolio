import { askLabel, useProfile } from "../profile";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { askLaterToast, passportStamps, season, todayLabel, type PassportStamp } from "../content";
import { Stamp } from "../components/Stamp";
import { Pill, PlayButton, Sheet, RelativeAvatar } from "../components/ui";
import { getPhoto, spring } from "../lib";

const TABS = ["Seasons", "Places", "Everyday"] as const;
type Tab = (typeof TABS)[number];

const LAYER: Record<PassportStamp["state"], string> = { seen: "Seen", story: "Collected", family: "With family" };

export type Outcome = "family" | "story" | null;

function Detail({ stamp, note, onAskLater }: { stamp: PassportStamp; note?: string; onAskLater: () => void }) {
  const date = stamp.id === "parol" ? todayLabel() : stamp.date;
  const { relative } = useProfile();
  const summary = stamp.state !== "family" && stamp.summaryNoFamily ? stamp.summaryNoFamily : stamp.summary;
  return (
    <div>
      <div className="flex items-center gap-4">
        <Stamp state={stamp.state} icon={stamp.id} label={stamp.category} date={date} with={stamp.with} size={120} textured={stamp.id === "parol" || undefined} />
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-gold">{stamp.category}</p>
          <h2 className="mt-0.5 font-serif text-[28px] leading-tight tracking-[-0.02em]">{stamp.label}</h2>
          <p className="mt-1 text-[13px] text-muted">
            {LAYER[stamp.state]}
            {date ? ` · ${date}` : ""}
            {stamp.with ? ` · with ${stamp.with}` : ""}
          </p>
        </div>
      </div>

      {stamp.photo && (
        <div className="mt-5 h-[180px] overflow-hidden rounded-3xl">
          <img src={getPhoto()} alt="The parol you photographed" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="mt-5">
        <Pill label={stamp.state === "family" ? "Family" : "Documented"} />
        <p className="mt-3 font-serif text-[17px] leading-[1.6]">{summary}</p>
      </div>

      {note && stamp.id === "parol" && (
        <div className="mt-4 rounded-2xl border border-hairline p-4">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted">Your note</p>
          <p className="mt-1.5 font-serif text-[16px] italic leading-[1.5]">"{note}"</p>
        </div>
      )}

      {stamp.state === "story" && (
        <button
          onClick={onAskLater}
          className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-dashed border-ink/30 p-4 text-left"
        >
          <RelativeAvatar relative={relative} size={40} />
          <span className="flex-1">
            <span className="block text-[15px] font-medium">Add someone's voice</span>
            <span className="block text-[13px] text-muted">Optional. {askLabel(relative)} when you can.</span>
          </span>
        </button>
      )}

      {stamp.voice && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-hairline p-3 pr-4">
          <PlayButton mock={6} label={`${stamp.with}'s voice`} size={40} tone="gold" />
          <div>
            <p className="text-[15px] font-medium">{stamp.with}'s voice</p>
            <p className="text-[13px] text-muted">{stamp.id === "parol" ? "Recorded today" : `Recorded ${stamp.date}`}</p>
          </div>
        </div>
      )}

      <div className="mt-3 rounded-2xl bg-bg p-4">
        <p className="font-serif text-[20px]">{stamp.phrase.text}</p>
        <p className="mt-1 text-[14px] text-muted">/{stamp.phrase.pronunciation}/ · {stamp.phrase.english}</p>
      </div>
    </div>
  );
}

export function Passport({
  onBack,
  onRestart,
  onToast,
  outcome,
  note,
  fresh,
}: {
  onBack: () => void;
  onRestart: () => void;
  onToast: (m: string) => void;
  outcome: Outcome;
  note?: string;
  fresh: boolean;
}) {
  // The parol only appears once it's collected, inked by whichever path the user took.
  const { persona } = useProfile();
  const stamps = passportStamps
    .filter((s) => (s.id === "parol" ? !!outcome : persona === "existing"))
    .map((s) =>
      s.id === "parol" && outcome === "story" ? { ...s, state: "story" as const, with: undefined, voice: false } : s,
    );
  const [tab, setTab] = useState<Tab>("Seasons");
  const [open, setOpenState] = useState<PassportStamp | null>(null);
  // Keep the last stamp so the sheet has content while it slides away.
  const [shown, setShown] = useState<PassportStamp | null>(null);
  const setOpen = (s: PassportStamp | null) => {
    setOpenState(s);
    if (s) setShown(s);
  };
  const collected = stamps.filter((s) => s.state !== "seen").length;

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="px-6 pt-safe">
        <div className="h-4" />

        <div role="tablist" className="mt-4 flex gap-1 rounded-full bg-hairline/70 p-1">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className="relative h-9 flex-1 rounded-full text-[14px] font-medium">
              {tab === t && <motion.span layoutId="tab" className="absolute inset-0 rounded-full bg-surface shadow-soft" transition={spring} />}
              <span className={`relative ${tab === t ? "text-text" : "text-muted"}`}>{t}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-tab">
        <AnimatePresence mode="wait">
          {tab === "Seasons" ? (
            <motion.div key="seasons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-gold">Season 1</p>
                  <h1 className="mt-1 font-serif text-[44px] leading-none tracking-[-0.03em]">{season.name}</h1>
                </div>
                <p className="pb-1 text-[13px] text-muted">
                  {collected} of 6 collected
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-x-2 gap-y-6 rounded-[28px] border border-hairline bg-surface px-3 py-6 shadow-soft">
                {stamps.map((s, i) => (
                  <motion.button
                    key={s.id}
                    onClick={() => setOpen(s)}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex flex-col items-center gap-2"
                    initial={fresh && s.id === "parol" ? { opacity: 0, scale: 1.3, rotate: -10 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, scale: 1, rotate: s.id === "parol" ? -4 : 0, y: 0 }}
                    transition={fresh && s.id === "parol" ? { type: "spring", stiffness: 260, damping: 16, delay: 0.35 } : { ...spring, delay: 0.05 * i }}
                  >
                    <Stamp state={s.state} icon={s.id} label={s.category} size={84} date={s.id === "parol" ? todayLabel() : s.date} with={s.with} />
                    <span className="text-center leading-tight">
                      <span className="block text-[13px]">{s.label}</span>
                      <span className="block text-[11px] uppercase tracking-[0.08em] text-muted">{s.category}</span>
                    </span>
                    {fresh && s.id === "parol" && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ ...spring, delay: 0.7 }}
                        className="absolute -top-1 right-1 rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]"
                      >
                        New
                      </motion.span>
                    )}
                  </motion.button>
                ))}
                {Array.from({ length: Math.max(1, 6 - stamps.length) }, (_, n) => `slot-${n}`).map((name) => (
                  <div key={name} className="flex flex-col items-center gap-2 opacity-60">
                    <div className="grid h-[84px] w-[84px] place-items-center rounded-full border-[1.5px] border-dashed border-hairline text-[20px] text-muted/50">?</div>
                    <span className="text-[13px] text-muted">Not yet</span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-center text-[13px] text-muted">Tap a stamp to see its story.</p>
            </motion.div>
          ) : (
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex h-[60%] flex-col items-center justify-center pt-20 text-center"
            >
              <div className="h-[84px] w-[84px] rounded-full border-[1.5px] border-dashed border-hairline" />
              <p className="mt-5 font-serif text-[22px]">Nothing here yet</p>
              <p className="mt-2 max-w-[260px] text-[15px] text-muted">
                {tab === "Places" ? "Stamps from places your family comes from will collect here." : "Small daily things, like a greeting or a snack, will collect here."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)} label={open ? `${open.label} details` : "Stamp details"}>
        {shown && <Detail stamp={shown} note={note} onAskLater={() => onToast(askLaterToast)} />}
      </Sheet>
    </div>
  );
}
