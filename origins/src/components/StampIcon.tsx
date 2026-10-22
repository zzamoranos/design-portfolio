import { motion } from "framer-motion";
import type { IconName } from "../content";

// Simple line icons drawn on a 48x48 grid. Stroke only, so they read in any stamp state.
const ICONS: Record<IconName, string[]> = {
  parol: [
    // five-pointed star
    "M24 5 L27.53 14.15 L37.31 14.67 L29.71 20.85 L32.23 30.33 L24 25 L15.77 30.33 L18.29 20.85 L10.69 14.67 L20.47 14.15 Z",
    // inner frame
    "M24 15.6 A3.4 3.4 0 1 1 23.99 15.6",
    // two trailing tails
    "M15.77 30.33 C13.8 34 17.6 36.2 15.4 40 C14.4 41.8 14.6 43.6 13.2 45.2",
    "M32.23 30.33 C34.2 34 30.4 36.2 32.6 40 C33.6 41.8 33.4 43.6 34.8 45.2",
  ],
  bibingka: [
    // steam
    "M20 12.5 C18.6 10.8 21.4 9.2 20 7",
    "M27 12.5 C25.6 10.8 28.4 9.2 27 7",
    // cake: top, sides, bottom
    "M12 20 A12 4.5 0 1 1 36 20 A12 4.5 0 1 1 12 20 Z",
    "M12 20 V26 A12 4.5 0 0 0 36 26 V20",
    // salted egg slice on top
    "M19 19.6 A3 1.2 0 1 1 25 19.6 A3 1.2 0 1 1 19 19.6",
    // banana leaf under the cake
    "M3.5 27.5 C8 37.5 40 37.5 44.5 27.5",
    "M3.5 27.5 C6.5 26.4 9.5 26.6 12 27.6",
    "M44.5 27.5 C41.5 26.4 38.5 26.6 36 27.6",
    "M14 33.2 L16.6 31.2 M21 34.6 L22.6 32.2 M27 34.6 L25.4 32.2 M34 33.2 L31.4 31.2",
  ],
  manoPo: [
    // younger person, head bowed toward the elder's hand
    "M28.5 13.6 A6.6 6.6 0 1 1 28.49 13.6",
    "M33.6 27 C38.6 29.6 41.6 35.4 42.4 44",
    "M24.8 26.6 C23 31.4 22.6 37.6 23.6 44",
    // elder's sleeve and hand, back of hand at the forehead
    "M3 22.6 H11.2",
    "M3 27.4 H11.2",
    "M11.2 21.4 C14.6 19.8 18.8 19.6 22.2 20.6 C23.6 21.1 23.6 22.9 22.2 23.4 L20.4 24 C21.4 24.6 21.2 26.2 19.8 26.4 L11.2 28.4",
    // younger person's hand gently holding it
    "M28.8 31.2 C25.4 30.6 22.6 28.8 20.4 26.6",
  ],
  simbangGabi: [
    // crescent moon, before dawn
    "M41.6 5.2 A4.6 4.6 0 1 0 45 12.6 A3.6 3.6 0 0 1 41.6 5.2 Z",
    // cross
    "M24 3 V9.4 M21.6 5.6 H26.4",
    // church facade
    "M10.5 42 V23 L24 11 L37.5 23 V42",
    // round window and arched door
    "M24 20.6 A3 3 0 1 1 23.99 20.6",
    "M19.8 42 V34.4 A4.2 4.2 0 0 1 28.2 34.4 V42",
    // ground
    "M5 42 H43",
  ],
  word: [
    // speech bubble
    "M9 9 H39 A4 4 0 0 1 43 13 V29 A4 4 0 0 1 39 33 H22 L14 40 V33 H9 A4 4 0 0 1 5 29 V13 A4 4 0 0 1 9 9 Z",
    // "A" and an accent mark, for a word and how to say it
    "M14 27 L18.5 15 L23 27 M15.6 23 H21.4",
    "M28 14.5 L31 11.5",
    "M27 27 V19 M27 21.5 C28 19.2 31 18.6 33 19.6 C34.6 20.4 35 22 35 23.4 V27",
  ],
};

type Props = {
  name: IconName;
  draw?: boolean;
  delay?: number;
  strokeWidth?: number;
};

export function StampIcon({ name, draw = false, delay = 0, strokeWidth = 1.6 }: Props) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name].map((d, i) =>
        draw ? (
          <motion.path
            key={i}
            d={d}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 0.5, delay: delay + i * 0.05, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.15, delay: delay + i * 0.05 },
            }}
          />
        ) : (
          <path key={i} d={d} />
        ),
      )}
    </g>
  );
}
