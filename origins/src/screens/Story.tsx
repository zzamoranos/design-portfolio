import { askLabel, familyQuestion, useProfile } from "../profile";
import { languageByName } from "../geo";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { followUps, media, parol, type SourceLabel } from "../content";
import { OriginMap } from "../components/OriginMap";
import { Stamp } from "../components/Stamp";
import { BackButton, Button, Pill, PlayButton } from "../components/ui";
import { spring } from "../lib";

function Section({ label, title, children }: { label: SourceLabel; title: string; children: ReactNode }) {
  return (
    <motion.section
      className="border-t border-hairline py-8"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={spring}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted">{title}</h2>
        <Pill label={label} />
      </div>
      {children}
    </motion.section>
  );
}

const body = "font-serif text-[18px] leading-[1.65] tracking-[-0.005em] text-text";

type Msg = { q: string; a: string; label: SourceLabel };

function Streamed({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const [n, setN] = useState(reduce ? words.length : 0);
  useEffect(() => {
    if (n >= words.length) return;
    const t = window.setTimeout(() => setN((v) => v + 1), 28);
    return () => window.clearTimeout(t);
  }, [n, words.length]);
  return (
    <>
      {words.slice(0, n).join(" ")}
      {n < words.length && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-gold" />}
    </>
  );
}

function AskAI() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState("");
  const asked = new Set(msgs.map((m) => m.q));

  const ask = (q: string) => {
    if (thinking) return;
    const match = followUps.find((f) => f.q === q) ?? {
      q,
      label: "Documented" as SourceLabel,
      a: "Good question. In this prototype I can only answer a few things, but in the full app I would look it up and tell you whether the answer is documented, regional, or family lore.",
    };
    setThinking(true);
    window.setTimeout(() => {
      setThinking(false);
      setMsgs((m) => [...m, { ...match, q }]);
    }, 700);
  };

  return (
    <div>
      <div className="space-y-5">
        <AnimatePresence initial={false}>
          {msgs.map((m) => (
            <motion.div key={m.q} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="space-y-3">
              <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-text px-4 py-2.5 text-[15px] text-bg">{m.q}</div>
              <div className="rounded-2xl rounded-bl-md border border-hairline bg-surface p-4">
                <div className="mb-2">
                  <Pill label={m.label} />
                </div>
                <p className="text-[15px] leading-[1.6]">
                  <Streamed text={m.a} />
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {thinking && (
          <div className="flex gap-1.5 px-1" aria-label="Thinking">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-gold"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {followUps
          .filter((f) => !asked.has(f.q))
          .map((f) => (
            <motion.button
              layout
              key={f.q}
              whileTap={{ scale: 0.96 }}
              onClick={() => ask(f.q)}
              className="rounded-full border border-hairline bg-surface px-3.5 py-2 text-[14px]"
            >
              {f.q}
            </motion.button>
          ))}
      </div>

      <form
        className="mt-3 flex h-12 items-center gap-2 rounded-2xl border border-hairline bg-surface pl-4 pr-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) ask(draft.trim());
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask anything about the parol"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-muted/70 focus:outline-none"
        />
        <button type="submit" aria-label="Send" disabled={!draft.trim()} className="grid h-9 w-9 place-items-center rounded-xl bg-text text-bg disabled:opacity-20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export function Story({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { relative, region, regions, connection, learning } = useProfile();
  const regionMatches = regions.includes(parol.yourVersion.region);
  const regionLabel = regions.length > 1 ? `${regions[0]} +${regions.length - 1}` : region;
  const tier = languageByName(learning).tier;
  const scroller = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ container: scroller });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  const [read, setRead] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!scrolled && v > 0.02) setScrolled(true);
    if (!read && v > 0.97) setRead(true);
  });

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header */}
      <div className="relative z-20 flex items-center justify-between bg-bg/90 px-6 pt-safe pb-2 backdrop-blur-md">
        <div className="flex h-14 items-center">
          <BackButton onClick={onBack} />
        </div>
        <AnimatePresence>
          {scrolled && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute left-1/2 -translate-x-1/2 font-serif text-[17px]"
              style={{ bottom: 22 }}
            >
              {parol.name}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Sticky mini stamp: fills as you read, locks into the Story layer */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          <motion.div
            animate={read && !reduce ? { scale: [1, 1.32, 0.92, 1.04, 1], rotate: [0, -10, 5, -2, 0] } : { scale: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {read ? (
              <Stamp state="story" icon="parol" label={parol.category} size={52} />
            ) : (
              <Stamp state="seen" icon="parol" label={parol.category} size={52} fill={fill} />
            )}
          </motion.div>
          <AnimatePresence>
            {read && (
              <motion.span
                initial={{ opacity: 0, y: -4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ ...spring, delay: 0.35 }}
                className="absolute -bottom-5 whitespace-nowrap rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-bg"
              >
                Story
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div ref={scroller} className="no-scrollbar relative flex-1 overflow-y-auto px-6">
        {/* 1. Name block */}
        <div className="pb-8 pt-4">
          <p className="text-[13px] text-muted">
            {parol.partOfSpeech} · Tagalog, from Spanish
          </p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-[56px] leading-none tracking-[-0.03em]">{parol.name}</h1>
              <p className="mt-3 text-[18px] tracking-[0.01em] text-muted">/{parol.pronunciation}/</p>
            </div>
            <PlayButton src={media.pronunciation} label="pronunciation" size={52} tone="gold" />
          </div>
          <p className="mt-4 text-[16px] text-text">{parol.gloss}</p>
        </div>

        {/* 2. Story */}
        <Section label={parol.story.label} title={parol.story.title}>
          <p className={body}>{parol.story.text}</p>
        </Section>

        {/* 3. Meaning */}
        <Section label={parol.meaning.label} title={parol.meaning.title}>
          <p className={body}>{parol.meaning.text}</p>
        </Section>

        {/* 4. Your version */}
        <Section label={parol.yourVersion.label} title={parol.yourVersion.title}>
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-soft">
            <span className="text-[14px]">
              <span className="text-muted">{connection === "heritage" ? "Your family is from: " : connection === "partner" ? "Their family is from: " : "Your region: "}</span>
              <span className="font-medium">{regionLabel}</span>
            </span>
            <button className="text-[14px] font-medium text-ink">Change</button>
          </div>
          {!regionMatches && (
            <p className="mb-3 text-[14px] leading-[1.5] text-muted">
              We don't have a {region === "Not sure yet" ? "regional" : region} story for the parol yet. Here's one from Pampanga, the lantern capital.
            </p>
          )}
          <p className={body}>
            {regionMatches && connection === "heritage" ? parol.yourVersion.text : parol.yourVersion.text.replace("Your family's province is", "Pampanga is")}
          </p>
          <p className="mt-4 text-[15px] text-muted">
            In {parol.yourVersion.localWord.language}, it's <span className="font-serif text-[17px] italic text-text">{parol.yourVersion.localWord.word}</span>.
          </p>
          <div className="mt-5">
            <OriginMap caption={parol.yourVersion.mapCaption} />
          </div>
        </Section>

        {/* 5. Say it */}
        <Section label={parol.sayIt.label} title={`Say it in ${learning === parol.sayIt.regional.language ? learning : "Tagalog"}`}>
          {learning === parol.sayIt.regional.language && (
            <div className="mb-3 rounded-3xl border border-gold/60 bg-surface p-5">
              <p className="font-serif text-[26px] leading-tight tracking-[-0.01em]">{parol.sayIt.regional.phrase}</p>
              <p className="mt-3 text-[15px]">{parol.sayIt.english}</p>
              <p className="mt-2 text-[13px] text-muted">The {learning} you're learning. In Tagalog:</p>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 rounded-3xl border border-hairline bg-surface p-5">
            <div>
              <p className="font-serif text-[26px] leading-tight tracking-[-0.01em]">{parol.sayIt.phrase}</p>
              <p className="mt-1.5 text-[15px] text-muted">/{parol.sayIt.pronunciation}/</p>
              <p className="mt-3 text-[15px]">{parol.sayIt.english}</p>
            </div>
            <PlayButton src={media.sayIt} label={parol.sayIt.phrase} />
          </div>
          {learning === "Tagalog" ? (
            <p className="mt-3 text-[14px] text-muted">
              In {parol.sayIt.regional.language}: <span className="font-serif italic text-text">{parol.sayIt.regional.phrase}</span>
            </p>
          ) : learning !== parol.sayIt.regional.language ? (
            <p className="mt-3 text-[14px] leading-[1.5] text-muted">
              {tier === "community"
                ? `${learning} phrases come from the people you ask. ${askLabel(relative)} how they say it, and it joins your Words.`
                : `The ${learning} version of this phrase is coming soon. Tagalog is shown for now.`}
            </p>
          ) : null}
        </Section>

        {/* Curious? Simulated AI */}
        <Section label="Documented" title="Curious about something?">
          <AskAI />
        </Section>

        {/* 6. Ask your family */}
        <Section label={parol.askFamily.label} title={relative === "someone" ? "Ask someone" : parol.askFamily.title}>
          <p className="text-[15px] text-muted">{askLabel(relative)}, if you can. It's optional.</p>
          <p className="mt-3 font-serif text-[30px] leading-[1.25] tracking-[-0.02em]">{familyQuestion(relative, parol.askFamily.question)}</p>
        </Section>

        <div className="h-[140px]" />
      </div>

      {/* Bottom CTA */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 px-6 pb-safe pt-3 transition-colors duration-300 ${
          read ? "border-t border-hairline bg-bg/95 backdrop-blur-md" : "border-t border-transparent"
        }`}
      >
        <AnimatePresence mode="wait">
          {read ? (
            <motion.div
              key="cta"
              className="pointer-events-auto"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ ...spring, delay: 0.25 }}
            >
              <Button onClick={onNext}>Continue</Button>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, delay: 0.6 }}
            >
              <span className="rounded-full border border-hairline bg-surface/95 px-4 py-2 text-[13px] text-muted shadow-soft backdrop-blur">
                Read to the end to fill your stamp
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
