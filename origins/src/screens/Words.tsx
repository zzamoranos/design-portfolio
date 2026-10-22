import { motion } from "framer-motion";
import { useState } from "react";
import { parol, passportStamps } from "../content";
import { PlayButton } from "../components/ui";
import { spring } from "../lib";
import { useProfile } from "../profile";

type Word = { text: string; pronunciation: string; english: string; from: string; lang: string };

export function Words({ outcome }: { outcome: "family" | "story" | null }) {
  const { persona, languages, learning } = useProfile();
  const [filter, setFilter] = useState(learning);

  const words: Word[] = [];
  if (outcome) {
    words.push({ text: parol.name, pronunciation: parol.pronunciation, english: parol.gloss, from: "Parol", lang: "Tagalog" });
    words.push({ text: parol.sayIt.phrase, pronunciation: parol.sayIt.pronunciation, english: parol.sayIt.english, from: "Parol", lang: "Tagalog" });
    words.push({ text: parol.sayIt.regional.phrase, pronunciation: "", english: parol.sayIt.english, from: "Parol", lang: "Kapampangan" });
  }
  if (persona === "existing") {
    passportStamps
      .filter((s) => s.id !== "parol" && s.state !== "seen")
      .forEach((s) => words.push({ text: s.phrase.text, pronunciation: s.phrase.pronunciation, english: s.phrase.english, from: s.label, lang: "Tagalog" }));
  }
  const shown = words.filter((w) => w.lang === filter);

  return (
    <div className="no-scrollbar absolute inset-0 overflow-y-auto px-6 pt-safe pb-tab">
      <div className="flex h-12 items-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-gold">Your words</p>
      </div>
      <h1 className="font-serif text-[40px] leading-none tracking-[-0.03em]">Words</h1>
      <p className="mt-2 text-[15px] text-muted">Everything you've heard in stories, ready to practice.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {languages.map((l) => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            className={`relative h-9 rounded-full px-3.5 text-[14px] ${filter === l ? "text-bg" : "border border-hairline bg-surface text-text"}`}
          >
            {filter === l && <motion.span layoutId="words-filter" className="absolute inset-0 rounded-full bg-text" transition={spring} />}
            <span className="relative">
              {l} <span className={filter === l ? "text-bg/60" : "text-muted"}>{words.filter((w) => w.lang === l).length}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-2.5">
        {shown.map((w, i) => (
          <motion.div
            key={w.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: i * 0.04 }}
            className="flex items-center gap-4 rounded-2xl border border-hairline bg-surface p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-serif text-[20px] leading-tight">{w.text}</p>
              {w.pronunciation && <p className="mt-0.5 text-[14px] text-muted">/{w.pronunciation}/</p>}
              <p className="mt-1.5 text-[14px]">{w.english}</p>
              <p className="mt-1 text-[12px] text-muted">From your {w.from} stamp</p>
            </div>
            <PlayButton label={w.text} size={40} />
          </motion.div>
        ))}
        {!shown.length && (
          <div className="rounded-3xl border border-dashed border-hairline px-6 py-10 text-center">
            <p className="font-serif text-[20px]">No {filter} words yet</p>
            <p className="mx-auto mt-2 max-w-[260px] text-[14px] leading-[1.5] text-muted">
              {words.length ? `Capture something and ask someone how they say it in ${filter}.` : "Words from the stories you hear will collect here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
