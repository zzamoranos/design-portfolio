import type { ReactNode } from "react";
import { connections, onboardingLevel } from "../content";
import { cultureById, languageByName } from "../geo";
import { AVATAR } from "./PersonaPicker";
import { TierBadge } from "./Onboarding";
import { useProfile } from "../profile";


function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-hairline py-5">
      <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted">{label}</p>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

export function Me({ onSwitch, onEdit }: { onSwitch: () => void; onEdit: () => void }) {
  const p = useProfile();
  const culture = cultureById(p.culture);
  const connection = connections.find((c) => c.id === p.connection);
  const level = onboardingLevel.find((l) => l.id === p.level);

  return (
    <div className="no-scrollbar absolute inset-0 overflow-y-auto px-6 pt-safe pb-tab">
      <div className="flex h-12 items-center justify-end">
        <button onClick={onEdit} className="text-[14px] font-medium text-muted">
          Edit
        </button>
      </div>
      <div className="flex items-center gap-4">
        <span className={`grid h-16 w-16 place-items-center rounded-full font-serif text-[26px] ${AVATAR[p.persona]}`}>{p.name[0]}</span>
        <div>
          <h1 className="font-serif text-[30px] leading-none tracking-[-0.02em]">{p.name}</h1>
          <p className="mt-1.5 text-[14px] text-muted">
            <span className="mr-1">{culture.flag}</span>Exploring {culture.label} culture
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Row label="Connection">
          <p className="text-[16px]">{connection?.label}</p>
        </Row>
        <Row label="Regions">
          <div className="flex flex-wrap gap-1.5">
            {(p.regions.length ? p.regions : ["Not set"]).map((r, i) => (
              <span key={r} className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-[14px]">
                {r}
                {i === 0 && p.regions.length > 1 && <span className="ml-1.5 text-[11px] text-muted">Main</span>}
              </span>
            ))}
          </div>
        </Row>
        <Row label="Languages">
          <div className="space-y-2">
            {p.languages.map((l, i) => (
              <div key={l} className="flex items-center justify-between">
                <span className="text-[16px]">
                  {l}
                  {i === 0 && <span className="ml-2 text-[12px] text-muted">{level?.label}</span>}
                </span>
                <TierBadge tier={languageByName(l).tier} />
              </div>
            ))}
          </div>
        </Row>
        <Row label="Goals">
          <div className="flex flex-wrap gap-1.5">
            {p.goals.map((g) => (
              <span key={g} className="rounded-full bg-[#F7EEDC] px-3 py-1.5 text-[13px] text-[#8A6420]">
                {g}
              </span>
            ))}
          </div>
        </Row>
      </div>

      <button onClick={onSwitch} className="mt-4 h-12 w-full rounded-2xl border border-hairline bg-surface text-[15px] font-medium">
        Switch persona
      </button>
    </div>
  );
}
