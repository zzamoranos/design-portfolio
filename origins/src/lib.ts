import { useEffect, useState } from "react";
import { media } from "./content";

export const spring = { type: "spring", stiffness: 260, damping: 26 } as const;
export const fade = { duration: 0.25, ease: [0.4, 0, 0.2, 1] } as const;

// Vite serves index.html for missing files, so check the content type too.
const cache = new Map<string, Promise<boolean>>();
export function assetExists(url: string, kind: "audio" | "image") {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url, { method: "HEAD" })
        .then((r) => r.ok && (r.headers.get("content-type") ?? "").startsWith(kind === "audio" ? "audio" : "image"))
        .catch(() => false),
    );
  }
  return cache.get(url)!;
}

export function useAsset(url: string | undefined, kind: "audio" | "image") {
  const [ok, setOk] = useState<boolean | null>(url ? null : false);
  useEffect(() => {
    if (!url) return setOk(false);
    if (url.startsWith("blob:")) return setOk(true);
    let live = true;
    assetExists(url, kind).then((v) => live && setOk(v));
    return () => {
      live = false;
    };
  }, [url, kind]);
  return ok;
}

let photoSrc = media.photoFallback;
export const photoReady = assetExists(media.photo, "image").then((ok) => {
  if (ok) photoSrc = media.photo;
  return photoSrc;
});
export const getPhoto = () => photoSrc;

export function useFramed() {
  const query = "(min-width: 501px)";
  const [framed, setFramed] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setFramed(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return framed;
}
