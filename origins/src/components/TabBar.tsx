import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { spring } from "../lib";

export type Tab = "home" | "words" | "passport" | "me";

const ICON: Record<Tab, ReactNode> = {
  home: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" />,
  words: (
    <>
      <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5v8a1.5 1.5 0 0 1-1.5 1.5H11l-4 3.5V16h-.5A1.5 1.5 0 0 1 5 14.5z" />
      <path d="M9 9.5h6M9 12.5h4" />
    </>
  ),
  passport: (
    <>
      <rect x="5.5" y="3.5" width="13" height="17" rx="2" />
      <circle cx="12" cy="11" r="3" />
      <path d="M9.5 17h5" />
    </>
  ),
  me: (
    <>
      <circle cx="12" cy="9" r="3.5" />
      <path d="M5.5 19.5c.9-3.3 3.4-5 6.5-5s5.6 1.7 6.5 5" />
    </>
  ),
};

const LABEL: Record<Tab, string> = { home: "Home", words: "Words", passport: "Passport", me: "Me" };

function Item({ tab, active, onClick }: { tab: Tab; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-current={active ? "page" : undefined} className="relative flex h-14 flex-1 flex-col items-center justify-center gap-1">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#1A1A1A" : "#6B6B6B"}
        strokeWidth={active ? 1.9 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICON[tab]}
      </svg>
      <span className={`text-[11px] ${active ? "font-medium text-text" : "text-muted"}`}>{LABEL[tab]}</span>
      {active && <motion.span layoutId="tab-dot" className="absolute -top-px h-[2px] w-6 rounded-full bg-gold" transition={spring} />}
    </button>
  );
}

/** Bottom navigation for the top-level screens. Capture sits in the middle. */
export function TabBar({ active, onTab, onCapture }: { active: Tab; onTab: (t: Tab) => void; onCapture: () => void }) {
  return (
    <motion.nav
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      transition={spring}
      className="absolute inset-x-0 bottom-0 z-30 border-t border-hairline bg-bg/92 backdrop-blur-xl"
      style={{ paddingBottom: "var(--sab)" }}
    >
      <div className="flex items-center px-2">
        <Item tab="home" active={active === "home"} onClick={() => onTab("home")} />
        <Item tab="words" active={active === "words"} onClick={() => onTab("words")} />
        <div className="flex flex-1 justify-center">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onCapture}
            aria-label="Capture"
            className="-mt-5 grid h-14 w-14 place-items-center rounded-full bg-text text-bg shadow-lift"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
              <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h2l1.6-2h5.8L16.5 6h2A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" />
              <circle cx="12" cy="13" r="3.6" />
            </svg>
          </motion.button>
        </div>
        <Item tab="passport" active={active === "passport"} onClick={() => onTab("passport")} />
        <Item tab="me" active={active === "me"} onClick={() => onTab("me")} />
      </div>
    </motion.nav>
  );
}
