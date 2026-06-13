import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const BOUNCE_DELAY_MS = 3_000;

interface Props {
  ready: boolean;
  isPlaying: boolean;
  onToggle: () => void;
  variant?: "hero" | "overlay";
}

function PlayButton({
  isPlaying,
  onToggle,
  bounce,
  className,
}: {
  isPlaying: boolean;
  onToggle: () => void;
  bounce: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        "px-4 py-2 bg-yellow-500 text-black rounded-lg shadow-lg hover:bg-yellow-600 transition-all",
        {
          "animate-bounce": bounce && !isPlaying,
        },
        className
      )}
    >
      {isPlaying ? "Stop playing" : "Start playing"}
    </button>
  );
}

export default function PlayWorldButton({
  ready,
  isPlaying,
  onToggle,
  variant = "hero",
}: Props) {
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (!ready || isPlaying) {
      setBounce(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setBounce(true);
    }, BOUNCE_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [ready, isPlaying]);

  if (!ready) {
    return null;
  }

  if (variant === "overlay") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <PlayButton isPlaying={isPlaying} onToggle={onToggle} bounce={bounce} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="hidden md:flex flex-col justify-start items-center text-center gap-5 pt-32"
    >
      <PlayButton
        isPlaying={isPlaying}
        onToggle={onToggle}
        bounce={bounce}
        className="z-10"
      />
      {isPlaying ? (
        <span className="text-center">Use WASD + Space to move around.</span>
      ) : null}
    </motion.div>
  );
}
