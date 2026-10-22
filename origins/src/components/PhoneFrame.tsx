import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useFramed } from "../lib";

function StatusBar({ tone }: { tone: "dark" | "light" }) {
  const c = tone === "light" ? "#FFFFFF" : "#1A1A1A";
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[60] flex h-[54px] items-center justify-between px-8 pt-1.5" style={{ color: c }}>
      <span className="w-[54px] text-center text-[16px] font-semibold tracking-[-0.02em]">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.6c2.2 0 4.2.85 5.7 2.25l1.1-1.15A9.6 9.6 0 0 0 8 1 9.6 9.6 0 0 0 1.2 3.7l1.1 1.15A8 8 0 0 1 8 2.6zm0 3.2c1.3 0 2.5.5 3.4 1.3l1.1-1.15A6.4 6.4 0 0 0 8 4.2c-1.7 0-3.3.65-4.5 1.75L4.6 7.1c.9-.8 2.1-1.3 3.4-1.3zm0 3.2c.5 0 .95.18 1.3.48L8 10.8 6.7 9.48c.35-.3.8-.48 1.3-.48z" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

export function PhoneFrame({ children, tone, aside }: { children: ReactNode; tone: "dark" | "light"; aside?: ReactNode }) {
  const framed = useFramed();

  if (!framed) {
    return <div className="relative h-[100dvh] w-full overflow-hidden bg-bg">{children}</div>;
  }

  return (
    <div className="flex min-h-full items-center justify-center gap-16 p-6">
      {aside && <div className="hidden min-[1000px]:block">{aside}</div>}
      <div
        className="relative shrink-0 rounded-[62px] bg-[#1b1b1d] p-[11px]"
        style={{
          width: 412,
          height: "min(866px, calc(100vh - 48px))",
          boxShadow: "0 0 0 1.5px #3a3a3d, 0 30px 80px -20px rgb(60 40 20 / 0.35), 0 12px 24px -8px rgb(0 0 0 / 0.2)",
        }}
      >
        <div className="in-frame relative h-full w-full overflow-hidden rounded-[52px] bg-bg" style={{ isolation: "isolate" }}>
          {children}
          <StatusBar tone={tone} />
          <div className="pointer-events-none absolute left-1/2 top-[11px] z-[60] h-[37px] w-[124px] -translate-x-1/2 rounded-full bg-black" />
          <motion.div
            className="pointer-events-none absolute bottom-2 left-1/2 z-[60] h-[5px] w-[136px] -translate-x-1/2 rounded-full"
            animate={{ backgroundColor: tone === "light" ? "#FFFFFF" : "#1A1A1A" }}
          />
        </div>
      </div>
    </div>
  );
}
