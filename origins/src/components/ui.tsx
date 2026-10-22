import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { SourceLabel } from "../content";
import { fade, spring, useAsset } from "../lib";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: HTMLMotionProps<"button"> & { variant?: "primary" | "secondary" | "ghost"; children: ReactNode }) {
  const styles = {
    primary: "bg-text text-bg shadow-soft",
    secondary: "bg-surface text-text border border-hairline",
    ghost: "text-muted",
  }[variant];
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={spring}
      className={`h-14 w-full rounded-2xl text-[16px] font-medium tracking-[-0.01em] ${styles} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

const PILL: Record<SourceLabel, string> = {
  Documented: "bg-[#EEF1EC] text-[#4F6650]",
  Regional: "bg-[#F7EEDC] text-[#8A6420]",
  Legend: "bg-[#EFEBF4] text-[#5E5275]",
  Family: "bg-[#F6E6E3] text-ink",
};

export function Pill({ label }: { label: SourceLabel }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.02em] ${PILL[label]}`}>
      {label}
    </span>
  );
}

export function BackButton({ onClick, tone = "dark" }: { onClick: () => void; tone?: "dark" | "light" }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label="Back"
      className={`grid h-10 w-10 place-items-center rounded-full ${
        tone === "light" ? "bg-white/15 text-white backdrop-blur-md" : "bg-surface text-text border border-hairline"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </motion.button>
  );
}

/**
 * Play button that disables itself if its audio is missing.
 * `mock` (seconds) fakes playback for prototype-only recordings.
 */
export function PlayButton({
  src,
  label,
  size = 44,
  tone = "dark",
  mock,
}: {
  src?: string;
  label: string;
  size?: number;
  tone?: "dark" | "gold";
  mock?: number;
}) {
  const found = useAsset(mock ? undefined : src, "audio");
  const ok = mock ? true : found;
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<number>();

  useEffect(
    () => () => {
      audio.current?.pause();
      window.clearTimeout(timer.current);
    },
    [],
  );

  const toggle = () => {
    if (mock) {
      window.clearTimeout(timer.current);
      if (!playing) timer.current = window.setTimeout(() => setPlaying(false), mock * 1000);
      setPlaying(!playing);
      return;
    }
    if (!src || !ok) return;
    if (!audio.current) {
      audio.current = new Audio(src);
      audio.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audio.current.pause();
      audio.current.currentTime = 0;
      setPlaying(false);
    } else {
      audio.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const disabled = !ok;
  const bg = tone === "gold" ? "bg-gold text-text" : "bg-text text-bg";
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.9 }}
      onClick={toggle}
      disabled={disabled}
      aria-label={disabled ? `${label} (audio not available)` : playing ? `Stop ${label}` : `Play ${label}`}
      title={disabled ? "Audio not available yet" : undefined}
      className={`relative grid shrink-0 place-items-center rounded-full transition-opacity ${bg} ${disabled ? "opacity-25" : ""}`}
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {playing ? (
          <motion.span key="bars" className="flex h-4 items-end gap-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-current"
                animate={{ height: ["30%", "100%", "45%", "80%", "30%"] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </motion.span>
        ) : (
          <motion.svg key="play" width={size * 0.34} height={size * 0.34} viewBox="0 0 24 24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" fill="currentColor" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function Toast({ message }: { message: string | null }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center px-6" style={{ paddingTop: "calc(var(--sat) + 8px)" }}>
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            role="status"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={spring}
            className="rounded-2xl bg-text px-5 py-3.5 text-center text-[14px] leading-snug text-bg shadow-lift"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-40" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          <motion.button
            aria-label="Close"
            className="absolute inset-0 bg-text/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-label={label}
            className="absolute inset-x-0 bottom-0 max-h-[88%] overflow-y-auto rounded-t-[28px] bg-surface px-6 pt-3 no-scrollbar"
            style={{ paddingBottom: "calc(var(--sab) + 24px)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => (i.offset.y > 100 || i.velocity.y > 500) && onClose()}
          >
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-hairline" />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Initial for a named relative, or a simple two-person glyph for "family". */
export function RelativeAvatar({ relative, size = 44 }: { relative: string; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-[#F6E6E3] font-serif text-ink" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {relative === "family" || relative === "someone" ? (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <circle cx="9" cy="8" r="3.2" />
          <circle cx="16.5" cy="9.5" r="2.4" />
          <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M14.5 14.6c.6-.3 1.3-.4 2-.4 2.2 0 3.8 1.4 4.2 4.3" />
        </svg>
      ) : (
        relative[0].toUpperCase()
      )}
    </span>
  );
}
