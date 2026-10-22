import { motion, useReducedMotion } from "framer-motion";
import { APP_NAME, homePreview, season, yearAgo, type Category, type IconName, type StampState } from "../content";
import { useProfile } from "../profile";
import { AVATAR } from "./PersonaPicker";
import { Stamp } from "../components/Stamp";
import { Button } from "../components/ui";
import { spring } from "../lib";

function HeroParol({ compact = false }: { compact?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className={`relative mx-auto grid place-items-center ${compact ? "h-[150px] w-[150px]" : "h-[208px] w-[208px]"}`}>
      {/* The one gradient in the UI: a faint warm glow */}
      <motion.div
        className="absolute inset-[-40px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgb(224 166 58 / 0.28), rgb(224 166 58 / 0.08) 55%, rgb(224 166 58 / 0) 100%)" }}
        animate={reduce ? undefined : { opacity: [0.75, 1, 0.75], scale: [0.98, 1.03, 0.98] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.svg
        width={compact ? 108 : 150}
        height={compact ? 127 : 176}
        viewBox="0 0 48 56"
        className="relative"
        style={{ originY: 0 }}
        animate={reduce ? undefined : { rotate: [-1.6, 1.6, -1.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M24 0 V5" stroke="#1A1A1A" strokeWidth="0.6" />
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M24 5 L27.53 14.15 L37.31 14.67 L29.71 20.85 L32.23 30.33 L24 25 L15.77 30.33 L18.29 20.85 L10.69 14.67 L20.47 14.15 Z"
            fill="#E0A63A"
            fillOpacity="0.16"
            stroke="#C98B22"
            strokeWidth="0.9"
          />
          <path d="M24 5 L24 25 M37.31 14.67 L24 19 M32.23 30.33 L24 19 M15.77 30.33 L24 19 M10.69 14.67 L24 19" stroke="#C98B22" strokeWidth="0.4" opacity="0.6" />
          <circle cx="24" cy="19" r="3.4" fill="#FAF8F5" stroke="#C98B22" strokeWidth="0.8" />
          <path d="M15.77 30.33 C14.2 35.5 16.9 39.5 15 44.5 C14.2 46.8 14.4 49 13.4 51.5" stroke="#C98B22" strokeWidth="0.9" />
          <path d="M32.23 30.33 C33.8 35.5 31.1 39.5 33 44.5 C33.8 46.8 33.6 49 34.6 51.5" stroke="#C98B22" strokeWidth="0.9" />
        </g>
      </motion.svg>
    </div>
  );
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: spring },
};

type Preview = { id: IconName; label: string; category: Category; state: StampState } | null;

export function Home({ onCapture, onPassport, outcome }: { onCapture: () => void; onPassport: () => void; outcome: "family" | "story" | null }) {
  const month = new Date().toLocaleDateString("en-US", { month: "long" });
  const { persona, name, learning, goals } = useProfile();
  const isNew = persona === "new";

  const parolStamp: Preview = outcome ? { id: "parol", label: "Parol", category: "Craft", state: outcome } : null;
  const preview: Preview[] = isNew
    ? [parolStamp, null, null]
    : parolStamp
      ? [parolStamp, homePreview[0], homePreview[1]]
      : homePreview;
  const collected = (isNew ? 0 : 2) + (outcome ? 1 : 0);

  return (
    <motion.div
      className="flex h-full flex-col pt-safe"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
    >
      <motion.header variants={item} className="flex h-12 items-center justify-between px-6">
        <span className="font-serif text-[20px] tracking-[-0.01em]">{APP_NAME}</span>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-[12px] font-medium text-muted">
            {season.name} season · {month}
          </span>
          <span className={`grid h-8 w-8 place-items-center rounded-full font-serif text-[14px] ${AVATAR[persona]}`}>{name[0]}</span>
        </div>
      </motion.header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-tab">
        <motion.div variants={item} className="mt-2">
          <HeroParol compact />
        </motion.div>

        <motion.div variants={item} className="mt-1">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-gold">
            {isNew ? `Hi ${name}, welcome` : `Welcome back, ${name}`}
          </p>
          <h1 className={`mt-2 font-serif leading-[1.12] tracking-[-0.02em] ${isNew ? "text-[34px]" : "text-[30px]"}`}>{season.header}</h1>
          <p className="mt-3 text-[16px] leading-[1.5] text-muted">
            {isNew ? "Christmas starts early at home. Look around this week. What feels familiar?" : "What have you noticed this week?"}
          </p>
        </motion.div>

        <motion.div variants={item} className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#F7EEDC] px-2.5 py-1 text-[12px] font-medium text-[#8A6420]">Learning {learning}</span>
          {goals.slice(0, isNew ? 2 : 1).map((g) => (
            <span key={g} className="rounded-full border border-hairline bg-surface px-2.5 py-1 text-[12px] text-muted">
              {g}
            </span>
          ))}
        </motion.div>

        <motion.div variants={item} className="mt-5">
          <Button onClick={onCapture} className="flex items-center justify-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
              <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h2l1.6-2h5.8L16.5 6h2A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" />
              <circle cx="12" cy="13" r="3.6" />
            </svg>
            {isNew && !outcome ? "Capture your first thing" : "Capture something"}
          </Button>
        </motion.div>

        <motion.button
          variants={item}
          whileTap={{ scale: 0.98 }}
          onClick={onPassport}
          className="mt-5 w-full rounded-3xl border border-hairline bg-surface p-4 pb-3 text-left shadow-soft"
        >
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-medium">Your {season.name} page</p>
            <span className="flex items-center gap-1 text-[13px] text-muted">
              {collected} of 6 collected
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3">
            {preview.map((s, i) =>
              s ? (
                <div key={s.id} className="flex flex-col items-center gap-1.5">
                  <Stamp state={s.state} icon={s.id} label={s.category} size={56} />
                  <span className="text-[12px] text-muted">{s.label}</span>
                </div>
              ) : (
                <div key={`empty-${i}`} className="flex flex-col items-center gap-1.5">
                  <span className="h-14 w-14 rounded-full border-[1.5px] border-dashed border-hairline" />
                  <span className="text-[12px] text-muted/60">{i === 0 && isNew ? "First stamp" : "Not yet"}</span>
                </div>
              ),
            )}
          </div>
        </motion.button>

        {!isNew && (
          <motion.div variants={item} className="mt-3 flex items-center gap-4 rounded-3xl border border-hairline bg-surface p-4">
            <Stamp state="family" icon="simbangGabi" label="Place" size={52} />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted">{yearAgo.label}</p>
              <p className="mt-0.5 text-[15px] font-medium">{yearAgo.title}</p>
              <p className="mt-1 font-serif text-[14px] italic leading-snug text-muted">"{yearAgo.quote}"</p>
            </div>
          </motion.div>
        )}
      </div>

    </motion.div>
  );
}
