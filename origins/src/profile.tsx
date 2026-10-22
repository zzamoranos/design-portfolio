import { createContext, useContext } from "react";
import { family, type ConnectionId, type PersonaId } from "./content";

export type Profile = {
  persona: PersonaId;
  name: string;
  /** Primary region; first of `regions`. */
  region: string;
  regions: string[];
  /** Who to ask, e.g. "Lola". Falls back to "family". */
  relative: string;
  /** False when the user said no family is nearby. */
  familyNearby: boolean;
  culture: string;
  connection: ConnectionId;
  goals: string[];
  /** Primary language they are learning, e.g. "Tagalog"; first of `languages`. */
  learning: string;
  languages: string[];
  level: string;
};

export const defaultProfile: Profile = {
  persona: "existing",
  name: "Paolo",
  region: family.region,
  regions: [family.region, "Metro Manila"],
  relative: family.relative,
  // Paolo is spending Christmas in London, away from family.
  familyNearby: false,
  culture: "filipino",
  connection: "heritage",
  goals: ["Talk with family", "Understand traditions"],
  learning: "Tagalog",
  languages: ["Tagalog", "Kapampangan"],
  level: "understand",
};

export const ProfileContext = createContext<Profile>(defaultProfile);
export const useProfile = () => useContext(ProfileContext);

const PRIORITY = ["Lola", "Lolo", "Mom", "Dad", "Tita", "Tito", "Partner", "Friend"];
export function pickRelative(chosen: string[]) {
  const r = PRIORITY.find((x) => chosen.includes(x));
  if (!r) return "family";
  return r === "Partner" || r === "Friend" ? r.toLowerCase() : r;
}

/** "someone" is used when the user isn't exploring their own or a partner's family culture. */
export const askLabel = (relative: string) => (relative === "someone" ? "Ask someone who knows" : `Ask your ${relative}`);

export const familyQuestion = (relative: string, base: string) =>
  relative === "someone" ? "Ask someone who grew up with parols: what was theirs made of, and who made it?" : base;
