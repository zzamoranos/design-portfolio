import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Photo } from "../components/Photo";
import { BackButton } from "../components/ui";
import { spring } from "../lib";
import { getPhoto } from "../lib";

function Reticle() {
  const reduce = useReducedMotion();
  const corner = "absolute h-7 w-7 border-white/90";
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-[44%] h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 1.15 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: [1, 0.97, 1] }}
      transition={reduce ? { duration: 0.3 } : { opacity: { duration: 0.4, delay: 0.3 }, scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 } }}
    >
      <span className={`${corner} left-0 top-0 rounded-tl-xl border-l-2 border-t-2`} />
      <span className={`${corner} right-0 top-0 rounded-tr-xl border-r-2 border-t-2`} />
      <span className={`${corner} bottom-0 left-0 rounded-bl-xl border-b-2 border-l-2`} />
      <span className={`${corner} bottom-0 right-0 rounded-br-xl border-b-2 border-r-2`} />
    </motion.div>
  );
}

export function Capture({ onBack, onShoot, onSaveLater }: { onBack: () => void; onShoot: () => void; onSaveLater: () => void }) {
  const [flash, setFlash] = useState(false);
  const [query, setQuery] = useState("");

  const shoot = () => {
    if (flash) return;
    setFlash(true);
    window.setTimeout(onShoot, 150);
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0B0B0C] text-white">
      <div className="relative flex-1">
        <Photo radius={0} live className="absolute inset-0" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-safe">
          <BackButton onClick={onBack} tone="light" />
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            className="rounded-full bg-black/35 px-3.5 py-2 text-[13px] font-medium backdrop-blur-md"
          >
            Point at something cultural
          </motion.span>
          <span className="w-10" />
        </div>

        <Reticle />
      </div>

      <div className="relative z-10 bg-[#0B0B0C] px-6 pt-5 pb-safe">
        <div className="flex items-center justify-between">
          <div className="h-11 w-11 overflow-hidden rounded-xl border border-white/20 opacity-80">
            <img src={getPhoto()} alt="" className="h-full w-full object-cover" />
          </div>

          <motion.button
            aria-label="Take photo"
            onClick={shoot}
            whileTap={{ scale: 0.9 }}
            transition={spring}
            className="grid h-[78px] w-[78px] place-items-center rounded-full border-[3px] border-white"
          >
            <motion.span className="block h-[62px] w-[62px] rounded-full bg-white" whileHover={{ scale: 0.96 }} />
          </motion.button>

          <button aria-label="Flip camera" className="grid h-11 w-11 place-items-center rounded-full bg-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7h-3l-1.5-2h-7L7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z" />
              <path d="M9.5 12.5a2.8 2.8 0 0 1 4.8-1.6M14.5 13.5a2.8 2.8 0 0 1-4.8 1.6" />
            </svg>
          </button>
        </div>

        <form
          className="mt-5 flex h-12 items-center gap-2 rounded-2xl bg-white/[0.08] pl-4 pr-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            shoot();
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Or ask about something..."
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-white/45 focus:outline-none"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                type="submit"
                aria-label="Ask"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="grid h-9 w-9 place-items-center rounded-xl bg-gold text-text"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </form>

        <button onClick={onSaveLater} className="mx-auto mt-2 block h-10 px-3 text-[14px] font-medium text-white/65">
          Save to ask later
        </button>
      </div>

      <AnimatePresence>
        {flash && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-50 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.95, 0] }}
            transition={{ duration: 0.38, times: [0, 0.25, 1], ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
