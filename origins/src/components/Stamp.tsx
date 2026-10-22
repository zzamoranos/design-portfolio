import { motion, motionValue, useTransform, type MotionValue } from "framer-motion";
import { useId } from "react";
import type { IconName, StampState } from "../content";
import { StampIcon } from "./StampIcon";

const INK = "#B8433A";
const GOLD = "#E0A63A";
const PAPER = "#FAF8F5";

// Scalloped circle, sampled from r(t) = R + a * cos(n t).
function scallopPath(cx = 60, cy = 60, R = 55.5, a = 2.1, n = 26, steps = 312) {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = R + a * Math.cos(n * t);
    const x = cx + r * Math.sin(t);
    const y = cy - r * Math.cos(t);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d + "Z";
}
export const SCALLOP = scallopPath();

// Stand-in so the transform hooks run unconditionally.
const zeroMV = motionValue(0);

export type StampProps = {
  state: StampState;
  icon: IconName;
  label: string;
  date?: string;
  with?: string;
  size?: number;
  /** Animate the outline drawing in (Seen layer reveal). */
  draw?: boolean;
  /** 0 to 1. Fills the stamp with soft gold as the story is read. */
  fill?: MotionValue<number>;
  /** Use the ink texture filter. Defaults to on for the family state. */
  textured?: boolean;
  className?: string;
};

export function Stamp({
  state,
  icon,
  label,
  date,
  with: withWho,
  size = 120,
  draw = false,
  fill,
  textured,
  className,
}: StampProps) {
  const uid = useId().replace(/:/g, "");
  const compact = size < 80;
  const showText = size >= 110;
  const isFamily = state === "family";
  const useTexture = textured ?? isFamily;

  const lineColor = isFamily ? PAPER : INK;
  const lineOpacity = state === "seen" ? 0.5 : 1;
  const outlineW = state === "seen" ? 1.5 : 1.75;

  // Scroll-driven fill only matters while the stamp is still an outline.
  const fillOpacity = useTransform(fill ?? zeroMV, [0, 1], [0, 0.4]);
  const strokeOpacity = useTransform(fill ?? zeroMV, [0, 1], [0.5, 1]);

  const bottomText = isFamily
    ? [date, withWho ? `WITH ${withWho.toUpperCase()}` : null].filter(Boolean).join("  ·  ").toUpperCase()
    : state === "story"
      ? (date ?? "STORY").toUpperCase()
      : "SEEN";

  const iconSize = compact ? 60 : showText ? 42 : 54;
  const drawProps = (delay = 0) =>
    draw
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: {
            pathLength: { duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] as const },
            opacity: { duration: 0.2, delay },
          },
        }
      : {};

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={`${label} stamp, ${state === "family" ? "complete" : state} layer`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <path id={`top-${uid}`} d="M19 60 A41 41 0 0 1 101 60" />
        <path id={`bot-${uid}`} d="M17 60 A43 43 0 0 0 103 60" />
        {useTexture && (
          <filter id={`ink-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
            {/* Uneven edges, like rubber pressed onto paper */}
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="4" result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="warped" />
            {/* Tiny gaps where ink did not take */}
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="11" result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  5 0 0 0 -3.15" result="specks" />
            <feComposite in="warped" in2="specks" operator="out" />
          </filter>
        )}
      </defs>

      <g filter={useTexture ? `url(#ink-${uid})` : undefined}>
        {/* Body */}
        {state === "story" && <path d={SCALLOP} fill={GOLD} fillOpacity={0.4} />}
        {isFamily && <path d={SCALLOP} fill={INK} />}
        {fill && state === "seen" && <motion.path d={SCALLOP} fill={GOLD} style={{ fillOpacity }} />}

        {/* Edge */}
        <motion.path
          d={SCALLOP}
          fill="none"
          stroke={INK}
          strokeWidth={outlineW}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          style={fill && state === "seen" ? { strokeOpacity } : { strokeOpacity: lineOpacity }}
          {...drawProps(0)}
        />

        <g color={lineColor} opacity={fill && state === "seen" ? undefined : lineOpacity}>
          {/* Inner rings */}
          <motion.circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            {...drawProps(0.08)}
          />
          {showText && (
            <motion.circle
              cx="60"
              cy="60"
              r="31"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeDasharray="0.1 3.6"
              strokeLinecap="round"
              initial={draw ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            />
          )}

          {/* Icon */}
          <g transform={`translate(${60 - iconSize / 2} ${60 - iconSize / 2 - (compact ? 0 : 1)}) scale(${iconSize / 48})`}>
            <StampIcon name={icon} draw={draw} delay={0.15} strokeWidth={compact ? 2.1 : showText ? 1.7 : 1.9} />
          </g>

          {/* Arc text */}
          {showText && (
            <motion.g
              initial={draw ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              fill="currentColor"
              fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
              fontWeight={600}
            >
              <text fontSize="9.5" letterSpacing="2.6">
                <textPath href={`#top-${uid}`} startOffset="50%" textAnchor="middle">
                  {label.toUpperCase()}
                </textPath>
              </text>
              <text fontSize="6.4" letterSpacing="1.4">
                <textPath href={`#bot-${uid}`} startOffset="50%" textAnchor="middle">
                  {bottomText}
                </textPath>
              </text>
            </motion.g>
          )}
        </g>
      </g>
    </svg>
  );
}
