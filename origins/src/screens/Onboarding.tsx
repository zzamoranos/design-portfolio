import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import {
  APP_NAME,
  FAMILY_CONNECTIONS,
  NO_ONE,
  connections,
  goals as goalOptions,
  onboardingLevel,
  onboardingRelatives,
  personas,
  type ConnectionId,
  type StampState,
} from "../content";
import { TIER_LABEL, cultures, languageByName, languages, regions as allRegions, suggestLanguages, type Tier } from "../geo";
import { Combobox, type Opt } from "../components/Combobox";
import { Stamp } from "../components/Stamp";
import { BackButton, Button } from "../components/ui";
import { spring } from "../lib";
import { pickRelative, type Profile } from "../profile";

type Step = "welcome" | "name" | "culture" | "connection" | "goals" | "region" | "family" | "language" | "passport";

function Chip({ on, onClick, children, wide, disabled }: { on: boolean; onClick: () => void; children: ReactNode; wide?: boolean; disabled?: boolean }) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={`relative min-h-11 rounded-full border px-4 py-2 text-[15px] transition-colors ${wide ? "col-span-full" : ""} ${
        on ? "border-text bg-text text-bg" : "border-hairline bg-surface text-text"
      }`}
    >
      {children}
    </motion.button>
  );
}

function Option({ on, onClick, label, note, multi }: { on: boolean; onClick: () => void; label: string; note?: string; multi?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-pressed={on}
      className={`flex w-full items-center gap-3 rounded-2xl border bg-surface p-4 text-left transition-colors ${on ? "border-text" : "border-hairline"}`}
    >
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center border-[1.5px] ${multi ? "rounded-md" : "rounded-full"} ${
          on ? "border-text bg-text" : "border-hairline"
        }`}
      >
        {on &&
          (multi ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5 9-10" />
            </svg>
          ) : (
            <span className="h-2 w-2 rounded-full bg-bg" />
          ))}
      </span>
      <span>
        <span className="block text-[15px] font-medium">{label}</span>
        {note && <span className="block text-[13px] text-muted">{note}</span>}
      </span>
    </motion.button>
  );
}

const TIER_STYLE: Record<Tier, string> = {
  full: "bg-[#EEF1EC] text-[#4F6650]",
  stories: "bg-[#F7EEDC] text-[#8A6420]",
  community: "bg-[#F6E6E3] text-ink",
};
export function TierBadge({ tier }: { tier: Tier }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${TIER_STYLE[tier]}`}>{TIER_LABEL[tier]}</span>;
}

function Title({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div>
      {eyebrow && <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-gold">{eyebrow}</p>}
      <h1 className="mt-2 font-serif text-[30px] leading-[1.18] tracking-[-0.02em]">{title}</h1>
      {sub && <p className="mt-3 text-[15px] leading-[1.5] text-muted">{sub}</p>}
    </div>
  );
}

function DrawnParol() {
  const reduce = useReducedMotion();
  const paths = [
    "M24 5 L27.53 14.15 L37.31 14.67 L29.71 20.85 L32.23 30.33 L24 25 L15.77 30.33 L18.29 20.85 L10.69 14.67 L20.47 14.15 Z",
    "M24 15.6 A3.4 3.4 0 1 1 23.99 15.6",
    "M15.77 30.33 C14.2 35.5 16.9 39.5 15 44.5 C14.2 46.8 14.4 49 13.4 51.5",
    "M32.23 30.33 C33.8 35.5 31.1 39.5 33 44.5 C33.8 46.8 33.6 49 34.6 51.5",
  ];
  return (
    <div className="relative mx-auto grid h-[200px] w-[200px] place-items-center">
      <motion.div
        className="absolute inset-[-30px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgb(224 166 58 / 0.26), rgb(224 166 58 / 0) 100%)" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}
      />
      <svg width="136" height="160" viewBox="0 0 48 56" className="relative">
        {paths.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill={i === 0 ? "#E0A63A" : "none"}
            stroke="#C98B22"
            strokeWidth={0.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0, fillOpacity: 0 }}
            animate={{ pathLength: 1, fillOpacity: i === 0 ? 0.16 : 0 }}
            transition={{ pathLength: { duration: 1.1, delay: 0.15 + i * 0.18, ease: [0.4, 0, 0.2, 1] }, fillOpacity: { duration: 0.6, delay: 1.1 } }}
          />
        ))}
      </svg>
    </div>
  );
}

const LAYERS: { state: StampState; title: string; body: string }[] = [
  { state: "seen", title: "Seen", body: "You spotted something and saved it." },
  { state: "story", title: "Story", body: "You heard its story and how to say it. The stamp is yours." },
  { state: "family", title: "Voice", body: "Someone who knows added their story. Optional, any time." },
];

function PassportIntro() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % 3), 1800);
    return () => window.clearInterval(t);
  }, [reduce]);
  return (
    <div>
      <div className="relative mx-auto grid h-[150px] w-[150px] place-items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 1.18, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <Stamp state={LAYERS[i].state} icon="parol" label="Craft" size={140} date={i === 2 ? "Your first stamp" : undefined} />
          </motion.div>
        </AnimatePresence>
      </div>
      <ul className="mt-6 space-y-2">
        {LAYERS.map((l, n) => (
          <li
            key={l.title}
            className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-colors duration-300 ${n === i ? "border-hairline bg-surface shadow-soft" : "border-transparent"}`}
          >
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n === 2 ? "bg-ink" : n === 1 ? "bg-gold" : "border border-ink/50"}`} />
            <span>
              <span className="block text-[15px] font-medium">{l.title}</span>
              <span className="block text-[14px] leading-[1.45] text-muted">{l.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const REGION_TITLE: Record<ConnectionId, string> = {
  heritage: "Where is your family from?",
  partner: "Where is their family from?",
  living: "Where are you, or where are you headed?",
  travel: "Where are you headed?",
  curious: "Any region you're drawn to?",
};

export function Onboarding({ onDone, onExisting }: { onDone: (p: Profile) => void; onExisting: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState(personas.new.name);
  const [culture, setCulture] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionId | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [relatives, setRelatives] = useState<string[]>([]);
  const [langs, setLangs] = useState<string[]>([]);
  const learning = langs[0] ?? "Tagalog";
  const [level, setLevel] = useState<string | null>(null);

  const askFamily = !connection || FAMILY_CONNECTIONS.includes(connection);
  const steps: Step[] = ["welcome", "name", "culture", "connection", "goals", "region", ...(askFamily ? (["family"] as Step[]) : []), "language", "passport"];
  const key = steps[stepIndex];
  const place = cultures.find((c) => c.id === culture)?.place ?? "there";

  const cultureOptions: Opt[] = cultures.map((c) => ({
    value: c.id,
    label: c.label,
    sub: c.available ? c.place.replace(/^the /, "") : `${c.place} · Coming soon`,
    leading: c.flag,
    disabled: !c.available,
    keywords: [c.place],
  }));
  const regionOptions: Opt[] = allRegions.map((r) => ({
    value: r.name,
    label: r.name,
    sub: r.aliases?.join(", "),
    group: r.group,
    keywords: r.aliases,
  }));
  const languageOptions: Opt[] = languages.map((l) => ({
    value: l.name,
    label: l.name,
    sub: l.aka?.join(", "),
    badge: TIER_LABEL[l.tier],
    keywords: l.aka,
  }));
  const suggested = suggestLanguages(regions).slice(0, 6);

  const ready: Record<Step, boolean> = {
    welcome: true,
    name: !!name.trim(),
    culture: !!culture,
    connection: !!connection,
    goals: goals.length > 0,
    region: true,
    family: true,
    language: langs.length > 0 && !!level,
    passport: true,
  };

  const next = () => {
    if (key === "passport") {
      const noOne = relatives.includes(NO_ONE) || relatives.length === 0;
      onDone({
        persona: "new",
        name: name.trim(),
        culture: culture ?? "filipino",
        connection: connection ?? "heritage",
        goals,
        region: regions[0] ?? "Not sure yet",
        regions,
        relative: askFamily ? (noOne ? "family" : pickRelative(relatives)) : "someone",
        familyNearby: askFamily && !noOne,
        learning,
        languages: langs,
        level: level ?? "few",
      });
      return;
    }
    setDir(1);
    setStepIndex((s) => s + 1);
  };
  const back = () => {
    setDir(-1);
    setStepIndex((s) => Math.max(0, s - 1));
  };

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const toggleRelative = (r: string) => {
    if (r === NO_ONE) return setRelatives(relatives.includes(NO_ONE) ? [] : [NO_ONE]);
    const base = relatives.filter((x) => x !== NO_ONE);
    setRelatives(base.includes(r) ? base.filter((x) => x !== r) : [...base, r]);
  };

  const cta: Partial<Record<Step, string>> = {
    welcome: "Get started",
    family: relatives.length ? "Continue" : "Skip for now",
    region: regions.length ? "Continue" : "Skip for now",
    passport: "Start exploring",
  };

  return (
    <div className="absolute inset-0 flex flex-col px-6 pt-safe pb-safe">
      <div className="flex h-12 items-center gap-4">
        <div className="w-10">{stepIndex > 0 && <BackButton onClick={back} />}</div>
        <div className="flex flex-1 gap-1">
          {stepIndex > 0 &&
            steps.slice(1).map((s, i) => (
              <span key={s} className="h-1 flex-1 overflow-hidden rounded-full bg-hairline">
                <motion.span className="block h-full rounded-full bg-text" initial={false} animate={{ width: i < stepIndex ? "100%" : "0%" }} transition={spring} />
              </span>
            ))}
        </div>
        <div className="w-10" />
      </div>

      <div className="relative flex-1">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={key}
            custom={dir}
            className="no-scrollbar absolute inset-0 overflow-y-auto pb-4 pt-6"
            variants={{
              enter: (d: number) => ({ opacity: 0, x: 28 * d }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: -28 * d }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ opacity: { duration: 0.22 }, x: spring }}
          >
            {key === "welcome" && (
              <div className="flex h-full flex-col">
                <div className="flex-1" />
                <DrawnParol />
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.9 }} className="mt-6">
                  <p className="font-serif text-[18px] text-muted">{APP_NAME}</p>
                  <h1 className="mt-2 font-serif text-[34px] leading-[1.12] tracking-[-0.02em]">Learn a language through the stories around you.</h1>
                  <p className="mt-3 text-[16px] leading-[1.5] text-muted">
                    Spot something, hear where it comes from and how to say it, and keep it in your passport.
                  </p>
                </motion.div>
                <div className="flex-1" />
              </div>
            )}

            {key === "name" && (
              <div>
                <Title title="What should we call you?" sub="Just a first name. It's how your stamps are signed." />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-8 h-14 w-full rounded-2xl border border-hairline bg-surface px-4 font-serif text-[22px] focus:border-text focus:outline-none"
                />
              </div>
            )}

            {key === "culture" && (
              <div>
                <Title title="Which culture do you want to explore?" sub="Pick one to start. You can add more later." />
                <div className="mt-7">
                  <Combobox
                    options={cultureOptions}
                    value={culture ? [culture] : []}
                    onChange={(v) => setCulture(v[0] ?? null)}
                    placeholder="Choose a culture"
                  />
                </div>
                <p className="mt-4 text-[13px] leading-[1.5] text-muted">This demo has Filipino stories. Others are on the way, starting with the most requested.</p>
              </div>
            )}

            {key === "connection" && (
              <div>
                <Title title={`What brings you to ${place}?`} sub="This shapes the stories and who we suggest you ask." />
                <div className="mt-7 space-y-2">
                  {connections.map((c) => (
                    <Option key={c.id} on={connection === c.id} onClick={() => setConnection(c.id)} label={c.label} note={c.note} />
                  ))}
                </div>
              </div>
            )}

            {key === "goals" && (
              <div>
                <Title title="What do you want to get out of it?" sub="Pick as many as you like." />
                <div className="mt-7 space-y-2">
                  {goalOptions.map((g) => (
                    <Option key={g} multi on={goals.includes(g)} onClick={() => toggle(goals, setGoals, g)} label={g} />
                  ))}
                </div>
              </div>
            )}

            {key === "region" && (
              <div>
                <Title title={REGION_TITLE[connection ?? "heritage"]} sub="Add as many as you like, by province or city. Stories adapt to them." />
                <div className="mt-7">
                  <Combobox multi options={regionOptions} value={regions} onChange={setRegions} placeholder="Search provinces or cities" firstTag="Main" />
                </div>
                {!regions.length && (
                  <div className="mt-4">
                    <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted">Popular</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["Metro Manila", "Pampanga", "Cebu", "Iloilo", "Ilocos Norte", "Davao del Sur"].map((r) => (
                        <Chip key={r} on={false} onClick={() => setRegions([...regions, r])}>
                          + {r}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
                <p className="mt-4 text-[13px] text-muted">Not sure? Skip this for now.</p>
              </div>
            )}

            {key === "family" && (
              <div>
                <Title
                  title={connection === "partner" ? "Who can you ask?" : "Who in your family can you ask?"}
                  sub="Optional. Every stamp can be collected on your own, and others can add their voice later."
                />
                <div className="mt-7 grid grid-cols-3 gap-2">
                  {onboardingRelatives.map((r) => (
                    <Chip key={r} on={relatives.includes(r)} onClick={() => toggleRelative(r)}>
                      {r}
                    </Chip>
                  ))}
                </div>
                <div className="mt-2">
                  <Chip on={relatives.includes(NO_ONE)} onClick={() => toggleRelative(NO_ONE)}>
                    {NO_ONE}
                  </Chip>
                </div>
              </div>
            )}

            {key === "language" && (
              <div>
                <Title title="Which languages?" sub={`More than 170 languages are spoken in ${place}. Pick the ones that matter to you.`} />
                {suggested.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted">{regions.length ? "Spoken where you picked" : "Most spoken"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {suggested.map((l) => (
                        <Chip key={l.name} on={langs.includes(l.name)} onClick={() => setLangs(langs.includes(l.name) ? langs.filter((x) => x !== l.name) : [...langs, l.name])}>
                          {l.name}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <Combobox
                    multi
                    options={languageOptions}
                    value={langs}
                    onChange={setLangs}
                    placeholder="Search all languages"
                    firstTag="Main"
                    allowCreate={(q) => q.replace(/^./, (c) => c.toUpperCase())}
                  />
                </div>
                {langs.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-1.5 rounded-2xl bg-surface p-4">
                    {langs.map((n) => {
                      const t = languageByName(n).tier;
                      return (
                        <div key={n} className="flex items-center justify-between text-[14px]">
                          <span>{n}</span>
                          <TierBadge tier={t} />
                        </div>
                      );
                    })}
                    {langs.some((n) => languageByName(n).tier === "community") && (
                      <p className="pt-2 text-[13px] leading-[1.5] text-muted">
                        For languages built with your family, the phrases come from the voices you record. You help bring them into the app.
                      </p>
                    )}
                  </motion.div>
                )}

                {langs.length > 0 && (
                  <>
                    <p className="mt-8 font-serif text-[20px] tracking-[-0.01em]">How much {learning} do you know?</p>
                    <div className="mt-4 space-y-2">
                      {onboardingLevel.map((l) => (
                        <Option key={l.id} on={level === l.id} onClick={() => setLevel(l.id)} label={l.label} note={l.note} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {key === "passport" && (
              <div>
                <Title eyebrow={`Welcome, ${name.trim()}`} title="This is how stamps fill in" />
                <div className="mt-6">
                  <PassportIntro />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-1 pt-3">
        <Button onClick={next} disabled={!ready[key]} className="disabled:opacity-35">
          {cta[key] ?? "Continue"}
        </Button>
        {key === "welcome" && (
          <button onClick={onExisting} className="block h-11 w-full text-[15px] font-medium text-muted">
            I already have an account
          </button>
        )}
      </div>
    </div>
  );
}
