# Origins

Clickable prototype: spot a parol, hear its story, ask Lola, earn a stamp.

## Run

Node 22 lives at `~/.local/node` (no system install).

```bash
PATH=~/.local/node/bin:$PATH npm run dev
```

Open http://127.0.0.1:5199. Wider than 500px shows a phone frame; narrower runs full screen with real safe areas.

## Personas

The app opens on a persona picker. On wide screens a presenter panel beside the phone lets you switch persona and shows where you are in the flow.

- **Mika (new user):** onboarding that works for anyone learning a language and culture: name, culture (Filipino has content; others show "Coming soon"), connection (heritage, partner, living there, traveling, curious), goals, region, who you can ask (only for heritage or partner), language and level, then how stamps fill in. Answers change the copy downstream: region chip, "Say it in Kapampangan", "Ask someone who knows" for non-family learners, and the goal chips on Home.
- **Paolo (returning user):** starts on Home with last season's stamps and a "Last Paskó" memory. He's away from family, so Ask leads with the other prompts.

## Regions and languages

`src/geo.ts` holds cultures (with flags), all Philippine provinces (searchable by city), and Philippine languages. There are more than 170 Philippine languages, so support is tiered:

- **Full lessons:** Tagalog
- **Phrases and stories:** the major regional languages (Cebuano, Ilocano, Hiligaynon, Kapampangan, Bikol, Waray and others)
- **Built with your family:** everything else. Anyone can add a language by name, and its phrases come from the family and community voices they record.

Languages are suggested from the regions you pick. The same shape works for any culture: add its regions and languages to `geo.ts`.

## Content and media

- All copy is in `src/content.ts` (app name, story, phrases, passport stamps).
- `public/parol.jpg`: drop in a real photo. Until it exists, `public/parol-scene.svg` is used.
- Optional audio in `public/`: `parol.m4a`, `maligayang-pasko.m4a`. Play buttons disable themselves when a file is missing.
- Recording is a mockup: no microphone. The waveform and Lola's playback are simulated.
- Stamps are labelled by category (Food, Word, Place, Custom, Craft). Reading the story collects the stamp in gold; a family answer is optional and inks it in red.
