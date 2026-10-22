import { motion, useReducedMotion } from "framer-motion";
import { mapPin, mapRef } from "../content";

// A deliberately simplified Philippines, projected from rough lon/lat outlines.
const LON0 = 116.6;
const LAT0 = 19.2;
const K = 9;
const px = (lon: number, lat: number) => [(lon - LON0) * K, (LAT0 - lat) * K] as const;

const ISLANDS: [number, number][][] = [
  // Luzon
  [[120.6,18.5],[121.2,18.6],[122.2,18.5],[122.3,17.6],[122.1,16.9],[122.2,16.3],[121.6,15.9],[121.6,15.3],[121.4,14.7],[121.7,14.2],[122.2,14.1],[122.7,14.3],[123.1,13.8],[123.9,13.8],[124.2,13.2],[124.0,12.6],[123.3,12.9],[122.7,13.3],[122.1,13.5],[121.5,13.7],[121.0,13.6],[120.6,13.9],[120.6,14.3],[120.95,14.55],[120.6,14.65],[120.4,14.5],[120.2,14.8],[120.0,15.3],[119.8,15.9],[120.1,16.2],[120.4,16.3],[120.4,17.0],[120.4,17.6]],
  // Mindoro
  [[120.4,13.5],[121.2,13.4],[121.5,12.9],[121.4,12.3],[121.0,12.2],[120.6,12.6],[120.3,13.2]],
  // Palawan
  [[119.5,11.5],[119.8,10.8],[119.0,9.9],[118.2,9.0],[117.2,8.3],[117.4,8.6],[118.5,9.9],[119.3,10.9]],
  // Panay
  [[121.9,11.9],[122.9,11.5],[122.6,10.5],[122.0,10.5],[121.9,11.3]],
  // Negros
  [[123.1,10.9],[123.6,10.4],[123.2,9.2],[122.9,9.5],[122.4,10.2],[122.9,10.6]],
  // Cebu
  [[123.9,11.2],[124.1,10.6],[123.4,9.5],[123.4,10.0],[123.8,10.8]],
  // Bohol
  [[123.8,10.1],[124.5,10.0],[124.3,9.6],[123.8,9.6]],
  // Leyte
  [[124.3,11.5],[125.0,11.3],[125.2,10.3],[124.7,10.0],[124.4,10.7]],
  // Samar
  [[124.3,12.5],[125.2,12.6],[125.7,11.9],[125.6,11.1],[125.0,11.2],[124.6,11.6],[124.2,12.1]],
  // Masbate
  [[123.3,12.5],[124.0,12.3],[123.6,11.9],[123.2,12.1]],
  // Mindanao
  [[122.0,7.0],[122.9,8.0],[123.6,8.6],[124.2,8.2],[124.7,8.9],[125.5,9.8],[126.0,9.3],[126.6,7.6],[126.2,6.4],[125.4,5.6],[125.2,6.1],[124.2,6.3],[124.0,7.2],[123.5,7.8],[122.9,7.4],[122.2,6.9]],
];

const toPath = (pts: [number, number][]) =>
  pts.map(([lon, lat], i) => `${i ? "L" : "M"}${px(lon, lat).map((n) => n.toFixed(1)).join(" ")}`).join("") + "Z";

export function OriginMap({ caption }: { caption: string }) {
  const reduce = useReducedMotion();
  const [pinX, pinY] = px(mapPin.lon, mapPin.lat);
  const [refX, refY] = px(mapRef.lon, mapRef.lat);

  return (
    <figure className="overflow-hidden rounded-3xl border border-hairline bg-surface">
      <div className="relative h-[220px]">
        <svg viewBox="0 0 100 130" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
          {/* Frame Luzon so Pampanga is easy to find */}
          <g transform="translate(-3.5 29) scale(1.1)">
            {ISLANDS.map((pts, i) => (
              <motion.path
                key={i}
                d={toPath(pts)}
                fill="#F3EEE6"
                stroke="#D9CFC1"
                strokeWidth={0.5}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={reduce ? false : { pathLength: 0, fillOpacity: 0 }}
                whileInView={{ pathLength: 1, fillOpacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ pathLength: { duration: 1, delay: i * 0.04 }, fillOpacity: { duration: 0.6, delay: 0.5 } }}
              />
            ))}
            {/* Manila for reference */}
            <circle cx={refX} cy={refY} r={0.9} fill="#6B6B6B" />
            <text x={refX + 2} y={refY + 1.2} fontSize="3" fill="#6B6B6B" fontFamily="Inter, sans-serif">
              {mapRef.label}
            </text>
            {/* Pin */}
            <motion.circle
              cx={pinX}
              cy={pinY}
              r={1.6}
              fill="none"
              stroke="#B8433A"
              strokeWidth={0.5}
              animate={reduce ? undefined : { r: [1.6, 5], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <circle cx={pinX} cy={pinY} r={1.5} fill="#B8433A" stroke="#FFFFFF" strokeWidth={0.5} />
          </g>
        </svg>
        <div className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1.5 text-[12px] font-medium shadow-soft backdrop-blur">
          Pampanga
        </div>
      </div>
      <figcaption className="border-t border-hairline px-4 py-3 text-[13px] leading-snug text-muted">{caption}</figcaption>
    </figure>
  );
}
