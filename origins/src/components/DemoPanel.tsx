import { motion } from "framer-motion";
import { APP_NAME, personas, type PersonaId } from "../content";
import { AVATAR } from "../screens/PersonaPicker";
import type { Screen } from "../App";

const FLOW: { label: string; screens: Screen[]; newOnly?: boolean }[] = [
  { label: "Onboarding", screens: ["onboarding"], newOnly: true },
  { label: "Home", screens: ["home"] },
  { label: "Capture", screens: ["capture"] },
  { label: "Confirm", screens: ["confirm"] },
  { label: "Story", screens: ["story"] },
  { label: "Ask family (optional)", screens: ["ask", "record"] },
  { label: "Stamp", screens: ["stamp"] },
  { label: "Passport", screens: ["passport"] },
];

/** Presenter panel beside the phone on wide screens. Not part of the app itself. */
export function DemoPanel({ persona, screen, onSwitch }: { persona: PersonaId | null; screen: Screen; onSwitch: (id: PersonaId) => void }) {
  const active = persona ? personas[persona] : null;
  return (
    <div className="w-[280px] text-text">
      <p className="font-serif text-[22px]">{APP_NAME}</p>
      <p className="mt-1 text-[13px] leading-[1.5] text-muted">Learn a language and culture through the stories around you. Clickable prototype.</p>

      <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Persona</p>
      <div className="mt-3 space-y-2">
        {(Object.keys(personas) as PersonaId[]).map((id) => {
          const p = personas[id];
          const on = persona === id;
          return (
            <button
              key={id}
              onClick={() => onSwitch(id)}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                on ? "border-text bg-surface shadow-soft" : "border-hairline bg-surface/60 hover:bg-surface"
              }`}
            >
              <span className={`grid h-9 w-9 place-items-center rounded-full font-serif text-[16px] ${AVATAR[id]}`}>{p.name[0]}</span>
              <span className="flex-1">
                <span className="block text-[14px] font-medium">{p.name}</span>
                <span className="block text-[12px] text-muted">{p.tag}</span>
              </span>
              {on && <span className="text-[11px] font-medium text-muted">Restart</span>}
            </button>
          );
        })}
      </div>

      {active && (
        <motion.div key={active.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <p className="text-[13px] leading-[1.55] text-muted">{active.bio}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {active.facts.map((f) => (
              <span key={f} className="rounded-full border border-hairline bg-surface px-2.5 py-1 text-[11px] text-muted">
                {f}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Flow</p>
      <ol className="relative mt-3 space-y-0.5">
        {FLOW.filter((f) => !f.newOnly || persona === "new").map((f, i) => {
          const on = f.screens.includes(screen);
          return (
            <li key={f.label} className="relative flex h-8 items-center gap-3 rounded-xl px-2.5 text-[13px]">
              {on && <motion.span layoutId="flow-active" className="absolute inset-0 rounded-xl bg-surface shadow-soft" transition={{ type: "spring", stiffness: 260, damping: 26 }} />}
              <span className={`relative w-4 text-right tabular-nums ${on ? "text-gold" : "text-muted/60"}`}>{i + 1}</span>
              <span className={`relative ${on ? "font-medium text-text" : "text-muted"}`}>{f.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
