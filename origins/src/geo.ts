// Cultures, regions and languages for onboarding.
// The shape is generic so any culture can plug in its own regions and languages.

export type Culture = {
  id: string;
  label: string;
  place: string;
  flag: string;
  available: boolean;
};

export const cultures: Culture[] = [
  { id: "filipino", label: "Filipino", place: "the Philippines", flag: "🇵🇭", available: true },
  { id: "mexican", label: "Mexican", place: "Mexico", flag: "🇲🇽", available: false },
  { id: "korean", label: "Korean", place: "Korea", flag: "🇰🇷", available: false },
  { id: "nigerian", label: "Nigerian", place: "Nigeria", flag: "🇳🇬", available: false },
  { id: "indian", label: "Indian", place: "India", flag: "🇮🇳", available: false },
  { id: "vietnamese", label: "Vietnamese", place: "Vietnam", flag: "🇻🇳", available: false },
  { id: "chinese", label: "Chinese", place: "China", flag: "🇨🇳", available: false },
  { id: "japanese", label: "Japanese", place: "Japan", flag: "🇯🇵", available: false },
  { id: "italian", label: "Italian", place: "Italy", flag: "🇮🇹", available: false },
  { id: "ghanaian", label: "Ghanaian", place: "Ghana", flag: "🇬🇭", available: false },
  { id: "jamaican", label: "Jamaican", place: "Jamaica", flag: "🇯🇲", available: false },
  { id: "haitian", label: "Haitian", place: "Haiti", flag: "🇭🇹", available: false },
  { id: "polish", label: "Polish", place: "Poland", flag: "🇵🇱", available: false },
  { id: "brazilian", label: "Brazilian", place: "Brazil", flag: "🇧🇷", available: false },
  { id: "ethiopian", label: "Ethiopian", place: "Ethiopia", flag: "🇪🇹", available: false },
  { id: "lebanese", label: "Lebanese", place: "Lebanon", flag: "🇱🇧", available: false },
  { id: "pakistani", label: "Pakistani", place: "Pakistan", flag: "🇵🇰", available: false },
  { id: "puerto-rican", label: "Puerto Rican", place: "Puerto Rico", flag: "🇵🇷", available: false },
  { id: "indonesian", label: "Indonesian", place: "Indonesia", flag: "🇮🇩", available: false },
  { id: "greek", label: "Greek", place: "Greece", flag: "🇬🇷", available: false },
];

export const cultureById = (id: string) => cultures.find((c) => c.id === id) ?? cultures[0];

// Philippine provinces, grouped by island group. Aliases let people search by city.
export type Region = { name: string; group: string; aliases?: string[] };

const LUZON = [
  "Abra", "Albay", "Apayao", "Aurora", "Bataan", "Batanes", "Batangas", "Benguet", "Bulacan", "Cagayan",
  "Camarines Norte", "Camarines Sur", "Catanduanes", "Cavite", "Ifugao", "Ilocos Norte", "Ilocos Sur", "Isabela",
  "Kalinga", "La Union", "Laguna", "Marinduque", "Masbate", "Metro Manila", "Mountain Province", "Nueva Ecija",
  "Nueva Vizcaya", "Occidental Mindoro", "Oriental Mindoro", "Palawan", "Pampanga", "Pangasinan", "Quezon",
  "Quirino", "Rizal", "Romblon", "Sorsogon", "Tarlac", "Zambales",
];
const VISAYAS = [
  "Aklan", "Antique", "Biliran", "Bohol", "Capiz", "Cebu", "Eastern Samar", "Guimaras", "Iloilo", "Leyte",
  "Negros Occidental", "Negros Oriental", "Northern Samar", "Samar", "Siquijor", "Southern Leyte",
];
const MINDANAO = [
  "Agusan del Norte", "Agusan del Sur", "Basilan", "Bukidnon", "Camiguin", "Cotabato", "Davao de Oro",
  "Davao del Norte", "Davao del Sur", "Davao Occidental", "Davao Oriental", "Dinagat Islands", "Lanao del Norte",
  "Lanao del Sur", "Maguindanao del Norte", "Maguindanao del Sur", "Misamis Occidental", "Misamis Oriental",
  "Sarangani", "South Cotabato", "Sultan Kudarat", "Sulu", "Surigao del Norte", "Surigao del Sur", "Tawi-Tawi",
  "Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay",
];

const ALIASES: Record<string, string[]> = {
  "Metro Manila": ["Manila", "Quezon City", "Makati", "Pasig", "Taguig", "NCR"],
  Benguet: ["Baguio"],
  Cebu: ["Cebu City", "Mandaue", "Lapu-Lapu"],
  "Davao del Sur": ["Davao City"],
  Iloilo: ["Iloilo City"],
  "Negros Occidental": ["Bacolod"],
  "Negros Oriental": ["Dumaguete"],
  "Misamis Oriental": ["Cagayan de Oro"],
  "Zamboanga del Sur": ["Zamboanga City"],
  Pampanga: ["Angeles", "San Fernando", "Clark"],
  Cavite: ["Tagaytay"],
  "Ilocos Sur": ["Vigan"],
  "Ilocos Norte": ["Laoag"],
  Leyte: ["Tacloban"],
  "South Cotabato": ["General Santos"],
  Palawan: ["Puerto Princesa", "El Nido", "Coron"],
  Aklan: ["Boracay"],
  "Surigao del Norte": ["Siargao"],
  Albay: ["Legazpi"],
  "Camarines Sur": ["Naga"],
};

export const regions: Region[] = [
  ...LUZON.map((name) => ({ name, group: "Luzon" })),
  ...VISAYAS.map((name) => ({ name, group: "Visayas" })),
  ...MINDANAO.map((name) => ({ name, group: "Mindanao" })),
].map((r) => ({ ...r, aliases: ALIASES[r.name] }));

/**
 * There are more than 170 Philippine languages, so support is tiered:
 * - full: lessons, stories, audio
 * - stories: phrase cards and stories, written with native speakers
 * - community: built from the family and community recordings users add
 * Anything not listed can be added by name and starts in the community tier.
 */
export type Tier = "full" | "stories" | "community";
export type Language = { name: string; tier: Tier; regions: string[]; aka?: string[] };

export const TIER_LABEL: Record<Tier, string> = {
  full: "Full lessons",
  stories: "Phrases and stories",
  community: "Built with your family",
};

export const languages: Language[] = [
  { name: "Tagalog", tier: "full", aka: ["Filipino"], regions: ["Metro Manila", "Batangas", "Bulacan", "Cavite", "Laguna", "Quezon", "Rizal", "Bataan", "Nueva Ecija", "Aurora", "Marinduque", "Oriental Mindoro", "Occidental Mindoro"] },
  { name: "Cebuano", tier: "stories", aka: ["Bisaya", "Binisaya"], regions: ["Cebu", "Bohol", "Negros Oriental", "Siquijor", "Davao del Sur", "Davao del Norte", "Davao de Oro", "Misamis Oriental", "Misamis Occidental", "Bukidnon", "Camiguin", "Zamboanga del Norte", "Southern Leyte"] },
  { name: "Ilocano", tier: "stories", aka: ["Iloko"], regions: ["Ilocos Norte", "Ilocos Sur", "La Union", "Abra", "Cagayan", "Isabela", "Nueva Vizcaya", "Quirino", "Benguet", "Mountain Province", "Ifugao", "Kalinga", "Apayao", "Tarlac", "Pangasinan"] },
  { name: "Hiligaynon", tier: "stories", aka: ["Ilonggo"], regions: ["Iloilo", "Guimaras", "Negros Occidental", "Capiz", "South Cotabato", "Sultan Kudarat"] },
  { name: "Kapampangan", tier: "stories", aka: ["Pampango"], regions: ["Pampanga", "Tarlac"] },
  { name: "Bikol", tier: "stories", aka: ["Bicolano"], regions: ["Albay", "Camarines Sur", "Camarines Norte", "Sorsogon", "Catanduanes"] },
  { name: "Waray", tier: "stories", aka: ["Waray-Waray"], regions: ["Samar", "Eastern Samar", "Northern Samar", "Leyte", "Biliran"] },
  { name: "Pangasinan", tier: "stories", regions: ["Pangasinan"] },
  { name: "Maranao", tier: "stories", regions: ["Lanao del Sur", "Lanao del Norte"] },
  { name: "Maguindanaon", tier: "stories", regions: ["Maguindanao del Norte", "Maguindanao del Sur", "Cotabato"] },
  { name: "Tausug", tier: "stories", regions: ["Sulu", "Basilan", "Tawi-Tawi"] },
  { name: "Chavacano", tier: "stories", regions: ["Zamboanga del Sur", "Basilan"] },
  { name: "Kinaray-a", tier: "community", regions: ["Antique", "Iloilo"] },
  { name: "Aklanon", tier: "community", regions: ["Aklan"] },
  { name: "Surigaonon", tier: "community", regions: ["Surigao del Norte", "Surigao del Sur"] },
  { name: "Ibanag", tier: "community", regions: ["Cagayan", "Isabela"] },
  { name: "Itawis", tier: "community", regions: ["Cagayan"] },
  { name: "Ivatan", tier: "community", regions: ["Batanes"] },
  { name: "Sambal", tier: "community", regions: ["Zambales"] },
  { name: "Kankanaey", tier: "community", regions: ["Benguet", "Mountain Province"] },
  { name: "Ibaloi", tier: "community", regions: ["Benguet"] },
  { name: "Ifugao", tier: "community", regions: ["Ifugao"] },
  { name: "Kalinga", tier: "community", regions: ["Kalinga"] },
  { name: "Yakan", tier: "community", regions: ["Basilan"] },
  { name: "Sama", tier: "community", regions: ["Tawi-Tawi"] },
  { name: "Cuyonon", tier: "community", regions: ["Palawan"] },
  { name: "Romblomanon", tier: "community", regions: ["Romblon"] },
  { name: "Masbatenyo", tier: "community", regions: ["Masbate"] },
  { name: "Butuanon", tier: "community", regions: ["Agusan del Norte"] },
  { name: "Mandaya", tier: "community", regions: ["Davao Oriental"] },
  { name: "Manobo", tier: "community", regions: ["Agusan del Sur", "Bukidnon"] },
];

export const languageByName = (name: string): Language =>
  languages.find((l) => l.name === name) ?? { name, tier: "community", regions: [] };

/** Languages spoken in the chosen regions, most supported first. Tagalog is always offered. */
export function suggestLanguages(chosen: string[]) {
  const order: Tier[] = ["full", "stories", "community"];
  const hits = languages.filter((l) => l.regions.some((r) => chosen.includes(r)));
  const withTagalog = hits.some((l) => l.name === "Tagalog") ? hits : [languages[0], ...hits];
  return withTagalog.sort((a, b) => order.indexOf(a.tier) - order.indexOf(b.tier));
}
