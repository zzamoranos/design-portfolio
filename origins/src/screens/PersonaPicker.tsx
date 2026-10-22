import { motion } from "framer-motion";
import { APP_NAME, personas, type PersonaId } from "../content";
import { spring } from "../lib";

export const AVATAR: Record<PersonaId, string> = {
  new: "bg-[#F7EEDC] text-[#8A6420]",
  existing: "bg-[#F6E6E3] text-ink",
};

export function PersonaPicker({ onPick }: { onPick: (id: PersonaId) => void }) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col overflow-y-auto px-6 pt-safe pb-safe no-scrollbar"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}
    >
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: spring } }} className="flex h-12 items-center justify-between">
        <span className="font-serif text-[20px]">{APP_NAME}</span>
        <span className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-[12px] font-medium text-muted">Prototype</span>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: spring } }} className="mt-8">
        <h1 className="font-serif text-[32px] leading-[1.15] tracking-[-0.02em]">Who's exploring today?</h1>
        <p className="mt-2 text-[15px] leading-[1.5] text-muted">Origins helps anyone learn a language and culture through everyday stories. Pick a persona to walk through the demo.</p>
      </motion.div>

      <div className="mt-7 space-y-3">
        {(Object.keys(personas) as PersonaId[]).map((id) => {
          const p = personas[id];
          return (
            <motion.button
              key={id}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: spring } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPick(id)}
              className="w-full rounded-3xl border border-hairline bg-surface p-5 text-left shadow-soft"
            >
              <div className="flex items-center gap-3">
                <span className={`grid h-12 w-12 place-items-center rounded-full font-serif text-[20px] ${AVATAR[id]}`}>{p.name[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-medium">{p.name}</p>
                  <p className="text-[13px] text-muted">
                    {p.age} · {p.city}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${AVATAR[id]}`}>{p.tag}</span>
              </div>
              <p className="mt-4 text-[14px] leading-[1.55] text-muted">{p.bio}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[13px] text-muted">{id === "new" ? "Starts with onboarding" : "Starts on Home"}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex-1" />
      <p className="mt-6 text-center text-[12px] text-muted">Switch personas any time from the passport.</p>
    </motion.div>
  );
}
