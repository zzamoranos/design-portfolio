import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { PhoneFrame } from "./components/PhoneFrame";
import { Toast } from "./components/ui";
import { Home } from "./screens/Home";
import { Capture } from "./screens/Capture";
import { Confirm } from "./screens/Confirm";
import { Story } from "./screens/Story";
import { Ask } from "./screens/Ask";
import { Record } from "./screens/Record";
import { StampComplete } from "./screens/StampComplete";
import { Passport, type Outcome } from "./screens/Passport";
import { askLaterToast, personas, type PersonaId } from "./content";
import { PersonaPicker } from "./screens/PersonaPicker";
import { Onboarding } from "./screens/Onboarding";
import { DemoPanel } from "./components/DemoPanel";
import { TabBar, type Tab } from "./components/TabBar";
import { Words } from "./screens/Words";
import { Me } from "./screens/Me";
import { ProfileContext, defaultProfile, type Profile } from "./profile";
import { photoReady } from "./lib";

export type Screen = "persona" | "onboarding" | "home" | "words" | "me" | "capture" | "confirm" | "story" | "ask" | "record" | "stamp" | "passport";

const ORDER: Screen[] = ["persona", "onboarding", "home", "words", "me", "capture", "confirm", "story", "ask", "record", "stamp", "passport"];
const DARK_SCREENS: Screen[] = ["capture"];
const TAB_SCREENS: Screen[] = ["home", "words", "passport", "me"];

export default function App() {
  const [screen, setScreen] = useState<Screen>("persona");
  const [persona, setPersona] = useState<PersonaId | null>(null);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [dir, setDir] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [, setPhotoLoaded] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [note, setNote] = useState<string | undefined>();
  const [from, setFrom] = useState<Screen>("home");
  const toastTimer = useRef<number>();

  useEffect(() => {
    photoReady.then(() => setPhotoLoaded(true));
  }, []);

  const go = useCallback(
    (next: Screen) => {
      // The photo morph carries capture to confirm, so that hop only cross-fades.
      // Tabs cross-fade; the photo morph carries capture to confirm.
      if ((screen === "capture" && next === "confirm") || (TAB_SCREENS.includes(screen) && TAB_SCREENS.includes(next))) setDir(0);
      else setDir(ORDER.indexOf(next) >= ORDER.indexOf(screen) ? 1 : -1);
      setFrom(screen);
      setScreen(next);
    },
    [screen],
  );

  const start = (id: PersonaId) => {
    setPersona(id);
    setOutcome(null);
    setNote(undefined);
    setToast(null);
    if (id === "existing") {
      setProfile(defaultProfile);
      go("home");
    } else {
      setProfile({ ...defaultProfile, persona: "new", name: personas.new.name });
      go("onboarding");
    }
  };

  const showToast = useCallback((msg: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ProfileContext.Provider value={profile}>
      <PhoneFrame tone={DARK_SCREENS.includes(screen) ? "light" : "dark"} aside={<DemoPanel persona={persona} screen={screen} onSwitch={start} />}>
        <LayoutGroup>
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={screen}
              custom={dir}
              className="absolute inset-0"
              variants={{
                enter: (d: number) => ({ opacity: 0, x: 20 * d }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: -20 * d }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ opacity: { duration: 0.25 }, x: { type: "spring", stiffness: 260, damping: 26 } }}
            >
              {screen === "persona" && <PersonaPicker onPick={start} />}
              {screen === "onboarding" && (
                <Onboarding
                  onExisting={() => start("existing")}
                  onDone={(p) => {
                    setProfile(p);
                    go("home");
                  }}
                />
              )}
              {screen === "home" && <Home outcome={outcome} onCapture={() => go("capture")} onPassport={() => go("passport")} />}
              {screen === "words" && <Words outcome={outcome} />}
              {screen === "me" && (
                <Me
                  onEdit={() => showToast("Editing isn't part of this prototype yet.")}
                  onSwitch={() => {
                    setOutcome(null);
                    setNote(undefined);
                    setPersona(null);
                    go("persona");
                  }}
                />
              )}
              {screen === "capture" && (
                <Capture onBack={() => go("home")} onShoot={() => go("confirm")} onSaveLater={() => showToast("Saved. Ask about it any time.")} />
              )}
              {screen === "confirm" && <Confirm onBack={() => go("capture")} onNext={() => go("story")} />}
              {screen === "story" && <Story onBack={() => go("confirm")} onNext={() => go("ask")} />}
              {screen === "ask" && (
                <Ask
                  onBack={() => go("story")}
                  onRecord={() => go("record")}
                  onSaveLater={() => {
                    showToast(askLaterToast);
                    setNote(undefined);
                    setOutcome("story");
                    go("stamp");
                  }}
                  onCollect={(n) => {
                    setNote(n);
                    setOutcome("story");
                    go("stamp");
                  }}
                />
              )}
              {screen === "record" && (
                <Record
                  onBack={() => go("ask")}
                  onDone={() => {
                    setNote(undefined);
                    setOutcome("family");
                    go("stamp");
                  }}
                />
              )}
              {screen === "stamp" && <StampComplete withFamily={outcome === "family"} note={note} onNext={() => go("passport")} />}
              {screen === "passport" && (
                <Passport
                  outcome={outcome}
                  note={note}
                  fresh={from === "stamp"}
                  onToast={showToast}
                  onBack={() => go(from === "stamp" || from === "passport" ? "home" : from)}
                  onRestart={() => {
                    setOutcome(null);
                    setNote(undefined);
                    setPersona(null);
                    go("persona");
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            {TAB_SCREENS.includes(screen) && (
              <TabBar key="tabs" active={screen as Tab} onTab={(t) => go(t)} onCapture={() => go("capture")} />
            )}
          </AnimatePresence>
        </LayoutGroup>
        <Toast message={toast} />
      </PhoneFrame>
      </ProfileContext.Provider>
    </MotionConfig>
  );
}
