// All prototype content lives here. No backend.
// Copy rule: no em dashes anywhere in UI strings.

export const APP_NAME = "Origins";

export type SourceLabel = "Documented" | "Regional" | "Legend" | "Family";
export type StampState = "seen" | "story" | "family";
export type IconName = "parol" | "bibingka" | "manoPo" | "simbangGabi" | "word";

// Stamps are labelled by category, not by the specific item.
export type Category = "Food" | "Word" | "Place" | "Custom" | "Craft";

export const media = {
  // Drop a real photo at /public/parol.jpg. Until then the illustrated scene is used.
  photo: "/parol.jpg",
  photoFallback: "/parol-scene.svg",
  // Optional audio. Buttons disable themselves if these files are missing.
  pronunciation: "/parol.m4a",
  sayIt: "/maligayang-pasko.m4a",
};

export const season = {
  name: "Paskó",
  header: "The ber months are here",
  subtext: "Christmas starts early at home. What have you noticed this week?",
};

export const family = {
  region: "Pampanga",
  relative: "Lola",
  relativeFull: "Lola Cora",
};

export const parol = {
  name: "Parol",
  category: "Craft" as Category,
  pronunciation: "pa-RÓL",
  partOfSpeech: "noun",
  gloss: "A Christmas star lantern",
  story: {
    label: "Legend" as SourceLabel,
    title: "The story",
    text: "One common origin story says families once carried lanterns to light their way to Simbang Gabi, the nine dawn masses before Christmas. Over time, the lanterns took the shape of a star and moved into the windows of homes.",
  },
  meaning: {
    label: "Documented" as SourceLabel,
    title: "What it means",
    text: "The name comes from the Spanish word farol, meaning lantern. The star stands for the Star of Bethlehem, and a lit parol in the window is a sign of hope and of a home ready for Christmas. Traditional parols are made of bamboo and thin papel de Hapon.",
  },
  yourVersion: {
    label: "Regional" as SourceLabel,
    title: "Your version",
    region: "Pampanga",
    text: "Your family's province is known for its giant parols. In San Fernando, lantern makers build huge, light-filled stars for the Giant Lantern Festival each December. Thousands of bulbs blink in patterns set by hand-turned rotors.",
    localWord: { word: "Parul", language: "Kapampangan" },
    mapCaption: "San Fernando, Pampanga. The lantern capital of the Philippines.",
  },
  sayIt: {
    label: "Documented" as SourceLabel,
    title: "Say it",
    phrase: "Maligayang Paskó",
    pronunciation: "ma-li-GA-yang pas-KÓ",
    english: "Merry Christmas",
    regional: { phrase: "Masayang Pasku", language: "Kapampangan" },
  },
  askFamily: {
    label: "Family" as SourceLabel,
    title: "Ask your family",
    question: "What was your family's parol made of, and who made it?",
    prompt: "Ask your Lola",
  },
};

// When there is no family nearby, the stamp still counts. These are optional.
export const otherPrompts = [
  {
    id: "remind",
    title: "What does a parol remind you of?",
    hint: "A home, a street, a smell, a person.",
    placeholder: "It reminds me of...",
  },
  {
    id: "where",
    title: "Where have you seen one this year?",
    hint: "Even far from home, they turn up.",
    placeholder: "I saw one at...",
  },
  {
    id: "someone",
    title: "Ask someone near you",
    hint: "A kababayan at church, the Filipino store, or a friend's Tita.",
    placeholder: "They told me...",
  },
];

export const alternatives = [
  { name: "Capiz lantern", note: "Made from flat capiz shells" },
  { name: "Belén", note: "A nativity scene" },
  { name: "Christmas star", note: "A general star ornament" },
];

// Simulated AI follow-ups. Every answer carries its source label.
export const followUps: { q: string; a: string; label: SourceLabel }[] = [
  {
    q: "Why five points?",
    label: "Documented",
    a: "The five-pointed star is the most common shape and recalls the star that guided the Magi. Makers also build stars with more points, and the giant lanterns of Pampanga layer many stars into one.",
  },
  {
    q: "What is Simbang Gabi?",
    label: "Documented",
    a: "A series of nine masses held before dawn from December 16 to 24. Many families say that if you complete all nine, your wish will come true. That part is folk belief.",
  },
  {
    q: "Can I make one at home?",
    label: "Regional",
    a: "Yes. Tie five bamboo sticks into a star, add a second star for depth, then cover the frame with papel de Hapon. In Pampanga, kids often learn by helping an older relative before December.",
  },
];

export const askLaterToast = "Saved. We'll remind you at Noche Buena.";

// Map projection data for a stylized Philippines (lon, lat).
export const mapPin = { lon: 120.69, lat: 15.03, label: "San Fernando" };
export const mapRef = { lon: 120.98, lat: 14.6, label: "Manila" };

export type PassportStamp = {
  id: IconName;
  label: string;
  category: Category;
  state: StampState;
  date?: string;
  with?: string;
  summary: string;
  summaryNoFamily?: string;
  phrase: { text: string; pronunciation: string; english: string };
  photo?: boolean;
  voice?: boolean;
};

export const passportStamps: PassportStamp[] = [
  {
    id: "parol",
    label: "Parol",
    category: "Craft",
    state: "family",
    with: "Lola",
    photo: true,
    voice: true,
    summary:
      "A star lantern hung in windows from the ber months onward. Lola says hers was bamboo and papel de Hapon, made with her Tatay every November.",
    summaryNoFamily:
      "A star lantern hung in windows from the ber months onward. Its name comes from the Spanish farol, meaning lantern.",
    phrase: { text: "Maligayang Paskó", pronunciation: "ma-li-GA-yang pas-KÓ", english: "Merry Christmas" },
  },
  {
    id: "simbangGabi",
    label: "Simbang Gabi",
    category: "Place",
    state: "family",
    date: "16 Dec 2025",
    with: "Lolo",
    voice: true,
    summary:
      "Nine dawn masses before Christmas. Lolo walked to all nine as a boy and still remembers the puto bumbóng sold outside the church.",
    phrase: { text: "Simbang Gabi", pronunciation: "sim-BANG ga-BÍ", english: "Night mass" },
  },
  {
    id: "bibingka",
    label: "Bibingka",
    category: "Food",
    state: "story",
    summary:
      "A rice cake baked in a clay pot lined with banana leaves, with heat from above and below. Often eaten right after Simbang Gabi.",
    phrase: { text: "Masarap!", pronunciation: "ma-sa-RAP", english: "Delicious!" },
  },
  {
    id: "manoPo",
    label: "Mano po",
    category: "Custom",
    state: "seen",
    summary:
      "A greeting of respect. You take an elder's hand and gently press the back of it to your forehead, asking for a blessing.",
    phrase: { text: "Mano po", pronunciation: "MA-no po", english: "Your hand, please" },
  },
  {
    id: "word",
    label: "Paskó",
    category: "Word",
    state: "seen",
    summary:
      "The Tagalog word for Christmas, from the Spanish pascua. Heard everywhere from September on, in songs, greetings, and store signs.",
    phrase: { text: "Maligayang Paskó", pronunciation: "ma-li-GA-yang pas-KÓ", english: "Merry Christmas" },
  },
];

export const homePreview: { id: IconName; label: string; category: Category; state: StampState }[] = [
  { id: "simbangGabi", label: "Simbang Gabi", category: "Place", state: "family" },
  { id: "bibingka", label: "Bibingka", category: "Food", state: "story" },
  { id: "manoPo", label: "Mano po", category: "Custom", state: "seen" },
];

export function todayLabel(d = new Date()) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Demo personas. Pick one on launch; the new user goes through onboarding.
export type PersonaId = "new" | "existing";

export const personas: Record<
  PersonaId,
  { id: PersonaId; name: string; age: number; city: string; tag: string; bio: string; facts: string[] }
> = {
  new: {
    id: "new",
    name: "Mika",
    age: 23,
    city: "Toronto",
    tag: "New to Origins",
    bio: "Grew up in Toronto. Understands some Tagalog but rarely speaks it. Flying to Pampanga for Paskó for the first time in ten years, and wants to talk with her Lola without switching to English.",
    facts: ["Filipino heritage", "Learning Tagalog", "Goal: talk with family"],
  },
  existing: {
    id: "existing",
    name: "Paolo",
    age: 27,
    city: "London",
    tag: "Returning user",
    bio: "Moved to London for work. Started using Origins last Paskó and collected Simbang Gabi with his Lolo. Spending this Christmas away from family.",
    facts: ["Filipino heritage", "Joined Dec 2025", "Calls Lola on Sundays"],
  },
};

// Onboarding. The app is for anyone learning a language and culture through stories.
export type ConnectionId = "heritage" | "partner" | "living" | "travel" | "curious";
export const connections: { id: ConnectionId; label: string; note: string }[] = [
  { id: "heritage", label: "It's my family's heritage", note: "Reconnect with where you come from" },
  { id: "partner", label: "My partner's or in-laws' culture", note: "Feel at home at their table" },
  { id: "living", label: "I live there, or I'm moving", note: "Understand the place around you" },
  { id: "travel", label: "I'm traveling there", note: "Go beyond the guidebook" },
  { id: "curious", label: "I'm just curious", note: "Every story counts" },
];
/** Connections where asking family makes sense. */
export const FAMILY_CONNECTIONS: ConnectionId[] = ["heritage", "partner"];

export const goals = [
  "Talk with family",
  "Learn everyday words",
  "Understand traditions",
  "Cook the food",
  "Prepare for a trip",
  "Pass it on to my kids",
];

export const onboardingRelatives = ["Lola", "Lolo", "Mom", "Dad", "Tita", "Tito", "Partner", "Friend"];
export const NO_ONE = "No one nearby right now";

export const onboardingLevel = [
  { id: "none", label: "None yet", note: "Start with single words" },
  { id: "few", label: "A few words", note: "Greetings and the basics" },
  { id: "understand", label: "I understand more than I speak", note: "Very common. You're not alone." },
  { id: "fluent", label: "I'm conversational", note: "We'll go deeper on regional words" },
];

export const yearAgo = {
  label: "Last Paskó",
  title: "You heard Lolo's Simbang Gabi story",
  quote: "We walked in the dark, and the puto bumbóng was still warm.",
};
