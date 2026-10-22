import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { spring } from "../lib";

export type Opt = {
  value: string;
  label: string;
  sub?: string;
  leading?: ReactNode;
  badge?: string;
  disabled?: boolean;
  group?: string;
  keywords?: string[];
};

type Props = {
  options: Opt[];
  value: string[];
  onChange: (v: string[]) => void;
  multi?: boolean;
  placeholder: string;
  /** Lets people add something that isn't in the list. */
  allowCreate?: (query: string) => string;
  /** Label for the first tag in multi mode, e.g. "Primary". */
  firstTag?: string;
};

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Searchable dropdown. Single select shows the choice; multi select shows removable tags. */
export function Combobox({ options, value, onChange, multi = false, placeholder, allowCreate, firstTag }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const q = norm(query.trim());
  const results = useMemo(() => {
    if (!q) return options;
    return options.filter((o) => [o.label, o.sub ?? "", ...(o.keywords ?? [])].some((t) => norm(t).includes(q)));
  }, [options, q]);

  const exact = options.some((o) => norm(o.label) === q);
  const canCreate = !!allowCreate && q.length > 1 && !exact;

  const pick = (v: string) => {
    if (multi) {
      onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
      setQuery("");
      input.current?.focus();
    } else {
      onChange([v]);
      setQuery("");
      setOpen(false);
    }
  };

  const byValue = (v: string) => options.find((o) => o.value === v);
  const selected = !multi ? byValue(value[0]) : undefined;

  // Group headers only when browsing the full list.
  let lastGroup: string | undefined;

  return (
    <div ref={root}>
      <div
        className={`rounded-2xl border bg-surface transition-colors ${open ? "border-text" : "border-hairline"}`}
        onClick={() => {
          setOpen(true);
          requestAnimationFrame(() => input.current?.focus());
        }}
      >
        {multi ? (
          <div className="flex min-h-14 flex-wrap items-center gap-1.5 p-2 pl-3">
            <AnimatePresence initial={false}>
              {value.map((v, i) => (
                <motion.span
                  key={v}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={spring}
                  className="flex h-8 items-center gap-1.5 rounded-full bg-text pl-3 pr-1 text-[14px] text-bg"
                >
                  {byValue(v)?.leading}
                  {byValue(v)?.label ?? v}
                  {firstTag && i === 0 && value.length > 1 && <span className="text-[11px] text-bg/60">{firstTag}</span>}
                  <button
                    aria-label={`Remove ${v}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(value.filter((x) => x !== v));
                    }}
                    className="grid h-6 w-6 place-items-center rounded-full hover:bg-bg/15"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
            <input
              ref={input}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (results[0] && !results[0].disabled) pick(results[0].value);
                  else if (canCreate) pick(allowCreate!(query.trim()));
                }
                if (e.key === "Backspace" && !query && value.length) onChange(value.slice(0, -1));
              }}
              placeholder={value.length ? "Add more" : placeholder}
              className="h-8 min-w-[120px] flex-1 bg-transparent text-[15px] placeholder:text-muted/70 focus:outline-none"
            />
          </div>
        ) : open ? (
          <div className="flex h-14 items-center gap-3 px-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              ref={input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-full flex-1 bg-transparent text-[16px] placeholder:text-muted/70 focus:outline-none"
            />
          </div>
        ) : (
          <button className="flex h-14 w-full items-center gap-3 px-4 text-left">
            {selected ? (
              <>
                <span className="text-[22px] leading-none">{selected.leading}</span>
                <span className="flex-1">
                  <span className="block text-[16px] font-medium">{selected.label}</span>
                </span>
              </>
            ) : (
              <span className="flex-1 text-[16px] text-muted/70">{placeholder}</span>
            )}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <ul role="listbox" className="no-scrollbar mt-2 max-h-[264px] overflow-y-auto rounded-2xl border border-hairline bg-surface py-1.5 shadow-soft">
              {results.map((o) => {
                const header = !q && o.group && o.group !== lastGroup ? o.group : null;
                lastGroup = o.group;
                const on = value.includes(o.value);
                return (
                  <li key={o.value}>
                    {header && <p className="px-4 pb-1 pt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{header}</p>}
                    <button
                      role="option"
                      aria-selected={on}
                      disabled={o.disabled}
                      onClick={() => pick(o.value)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${o.disabled ? "opacity-45" : "hover:bg-bg"}`}
                    >
                      {o.leading && <span className="text-[20px] leading-none">{o.leading}</span>}
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px]">{o.label}</span>
                        {o.sub && <span className="block truncate text-[12px] text-muted">{o.sub}</span>}
                      </span>
                      {o.badge && <span className="shrink-0 rounded-full bg-bg px-2 py-0.5 text-[11px] text-muted">{o.badge}</span>}
                      {on && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5 9-10" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
              {canCreate && (
                <li>
                  <button onClick={() => pick(allowCreate!(query.trim()))} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-bg">
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-hairline text-[14px]">+</span>
                    <span className="text-[15px]">
                      Add "<span className="font-medium">{query.trim()}</span>"
                    </span>
                  </button>
                </li>
              )}
              {!results.length && !canCreate && <li className="px-4 py-3 text-[14px] text-muted">No matches</li>}
            </ul>
            {multi && (
              <button onClick={() => setOpen(false)} className="mt-2 h-9 w-full text-[14px] font-medium text-muted">
                Done
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
