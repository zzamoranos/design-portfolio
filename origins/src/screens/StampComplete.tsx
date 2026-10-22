import { useProfile } from "../profile";
import { motion, useAnimate, useMotionTemplate, useMotionValue, animate as animateValue, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { media, parol, season, todayLabel } from "../content";
import { Stamp } from "../components/Stamp";
import { Button, PlayButton } from "../components/ui";
import { spring } from "../lib";

const SIZE = 184;

export function StampComplete({ withFamily, note, onNext }: { withFamily: boolean; note?: string; onNext: () => void }) {
  // With a family answer the stamp inks in red. Without one it still counts, in gold.
  const inkColor = withFamily ? "#B8433A" : "#E0A63A";
  const { relative } = useProfile();
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate();
  const [landed, setLanded] = useState(false);

  // Radial mask that spreads the ink out from the center on impact.
  const inkR = useMotionValue(reduce ? 120 : 0);
  const inkMask = useMotionTemplate`radial-gradient(circle at 50% 50%, #000 ${inkR}%, transparent calc(${inkR}% + 14%))`;

  useEffect(() => {
    if (reduce) {
      animate("#stamp", { opacity: [0, 1] }, { duration: 0.3 }).then(() => setLanded(true));
      return;
    }
    let cancelled = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 250));
      // 1. Lift and drop
      animate("#shadow", { opacity: 0.22, scale: 1 }, { duration: 0.3, ease: [0.55, 0, 0.9, 0.5] });
      await animate("#stamp", { y: 0, opacity: 1 }, { duration: 0.3, ease: [0.55, 0, 0.9, 0.5] });
      if (cancelled) return;

      // 2. Impact: press, ink spread, screen nudge
      animateValue(inkR, 120, { duration: 0.32, ease: [0.2, 0.8, 0.3, 1] });
      animate("#spread", { scale: [0.7, 1.32], opacity: [0.32, 0] }, { duration: 0.55, ease: "easeOut" });
      animate("#sparks", { opacity: [0, 1, 0], scale: [0.6, 1.25] }, { duration: 0.6, ease: "easeOut" });
      animate("#shadow", { opacity: 0, scale: 1.1 }, { duration: 0.3 });
      animate(scope.current, { y: [0, 3.5, -1.5, 0.5, 0] }, { duration: 0.32, ease: "easeOut" });
      navigator.vibrate?.(12);
      animate("#stamp", { rotate: -3 }, { type: "spring", stiffness: 260, damping: 18 });
      await animate("#stamp", { scale: 0.94 }, { duration: 0.11, ease: [0.3, 0, 0.2, 1] });
      if (cancelled) return;
      await animate("#stamp", { scale: 1 }, { type: "spring", stiffness: 260, damping: 14 });
      if (!cancelled) setLanded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: landed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    transition: { ...spring, delay },
  });

  return (
    <motion.div ref={scope} className="absolute inset-0 flex flex-col px-6 pt-safe pb-safe">
      <div className="flex h-12 items-center justify-center">
        <motion.span {...reveal(0)} className={`text-[13px] font-medium uppercase tracking-[0.14em] ${withFamily ? "text-ink" : "text-[#8A6420]"}`}>
          {withFamily ? "Stamp complete" : "Stamp collected"}
        </motion.span>
      </div>

      <div className="relative mt-8 flex flex-1 flex-col items-center">
        <div className="relative grid place-items-center" style={{ width: SIZE + 60, height: SIZE + 60 }}>
          {/* ink bleed ring */}
          <motion.div
            id="spread"
            className="absolute rounded-full"
            style={{ width: SIZE, height: SIZE, background: inkColor, opacity: 0, filter: "blur(6px)" }}
          />
          {/* contact shadow while the stamp is in the air */}
          <motion.div
            id="shadow"
            className="absolute rounded-full bg-text"
            style={{ width: SIZE * 0.9, height: SIZE * 0.9, opacity: 0, scale: 0.55, filter: "blur(18px)" }}
          />
          {/* tiny flecks on impact */}
          <motion.svg id="sparks" className="pointer-events-none absolute" width={SIZE + 60} height={SIZE + 60} viewBox="0 0 244 244" style={{ opacity: 0 }}>
            {Array.from({ length: 10 }).map((_, i) => {
              const a = (i / 10) * Math.PI * 2 + 0.3;
              const r = 112 + (i % 3) * 6;
              return <circle key={i} cx={122 + Math.cos(a) * r} cy={122 + Math.sin(a) * r} r={i % 2 ? 1.6 : 2.4} fill={i % 3 ? "#E0A63A" : "#B8433A"} />;
            })}
          </motion.svg>

          <motion.div
            id="stamp"
            className="relative"
            style={{ width: SIZE, height: SIZE, willChange: "transform" }}
            initial={reduce ? { opacity: 0 } : { y: -340, scale: 1.25, rotate: -8, opacity: 0 }}
          >
            {/* What the stamp looked like before the press */}
            <div className="absolute inset-0">
              <Stamp state={withFamily ? "story" : "seen"} icon="parol" label={parol.category} size={SIZE} />
            </div>
            {/* The pressed ink, revealed from the center out */}
            <motion.div className="absolute inset-0" style={{ WebkitMaskImage: inkMask, maskImage: inkMask }}>
              {withFamily ? (
                <Stamp state="family" icon="parol" label={parol.category} date={todayLabel()} with={relative} size={SIZE} />
              ) : (
                <Stamp state="story" icon="parol" label={parol.category} date={todayLabel()} size={SIZE} textured />
              )}
            </motion.div>
          </motion.div>
        </div>

        <motion.div {...reveal(0.1)} className="mt-6 flex items-center gap-4 rounded-3xl border border-hairline bg-surface py-3 pl-5 pr-3 shadow-soft">
          <div>
            <p className="font-serif text-[24px] leading-tight">
              {parol.name} <span className="text-muted">·</span> <span className="text-[18px] text-muted">{parol.pronunciation}</span>
            </p>
            <p className="mt-0.5 text-[13px] text-muted">{withFamily ? `In ${relative}'s voice` : `${parol.category} · ${season.name}`}</p>
          </div>
          {withFamily ? (
            <PlayButton mock={6} label={`${relative}'s voice`} size={44} tone="gold" />
          ) : (
            <PlayButton src={media.pronunciation} label="pronunciation" size={44} tone="gold" />
          )}
        </motion.div>

        {note && (
          <motion.blockquote {...reveal(0.14)} className="mt-4 max-w-full rounded-2xl bg-surface px-5 py-3 font-serif text-[16px] italic leading-[1.5] text-muted">
            "{note}"
          </motion.blockquote>
        )}

        <motion.p {...reveal(0.18)} className="mt-6 text-center font-serif text-[20px] tracking-[-0.01em]">
          Added to your {season.name} page.
        </motion.p>
        {!withFamily && (
          <motion.p {...reveal(0.22)} className="mt-2 max-w-[280px] text-center text-[14px] leading-[1.5] text-muted">
            Ask family any time, and their answer inks it in red.
          </motion.p>
        )}
      </div>

      <motion.div {...reveal(0.28)}>
        <Button onClick={onNext}>Open passport</Button>
      </motion.div>
    </motion.div>
  );
}
