import { motion, useReducedMotion } from "framer-motion";
import { getPhoto } from "../lib";

/**
 * The captured photo. Shares a layoutId between Capture and Confirm so the
 * live viewfinder shrinks into a rounded card. The inner layer uses `layout`
 * so Framer corrects the scale distortion and the image crops instead of squashing.
 */
export function Photo({
  radius,
  live = false,
  className = "",
  shadow = false,
}: {
  radius: number;
  live?: boolean;
  className?: string;
  shadow?: boolean;
}) {
  const reduce = useReducedMotion();
  const animateLive = live && !reduce;
  return (
    <motion.div
      layoutId="photo"
      className={`overflow-hidden bg-black ${className}`}
      style={{ borderRadius: radius, boxShadow: shadow ? "0 2px 4px rgb(26 26 26 / 0.06), 0 20px 48px -12px rgb(26 26 26 / 0.28)" : "none" }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <motion.div layout className="absolute inset-0" transition={{ type: "spring", stiffness: 260, damping: 30 }}>
        <motion.img
          src={getPhoto()}
          alt="A lit parol hanging in a window at night"
          draggable={false}
          className="h-full w-full select-none object-cover"
          style={{ willChange: animateLive ? "transform, filter" : undefined }}
          initial={false}
          animate={
            animateLive
              ? {
                  scale: [1, 1.05],
                  // gentle flicker, like a real bulb behind paper
                  filter: ["brightness(1)", "brightness(1.07)", "brightness(0.97)", "brightness(1.05)", "brightness(1)", "brightness(1.03)", "brightness(1)"],
                }
              : { scale: 1, filter: "brightness(1)" }
          }
          transition={
            animateLive
              ? {
                  scale: { duration: 14, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
                  filter: { duration: 3.2, ease: "easeInOut", repeat: Infinity, times: [0, 0.12, 0.2, 0.45, 0.6, 0.8, 1] },
                }
              : { duration: 0.4 }
          }
        />
      </motion.div>
    </motion.div>
  );
}
