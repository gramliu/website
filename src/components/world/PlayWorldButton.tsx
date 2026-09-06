import clsx from "clsx";
import { motion } from "framer-motion";
import { Play, Square } from "lucide-react";
import type { ReactNode } from "react";
import { useHasSideBySideHeroLayout } from "../../hooks/useHasSideBySideHeroLayout";

interface Props {
  controls?: ReactNode;
  ready: boolean;
  isPlaying: boolean;
  onToggle: () => void;
  variant?: "hero" | "overlay";
}

function PlayButton({
  isPlaying,
  onToggle,
  className,
  compact = false,
}: {
  isPlaying: boolean;
  onToggle: () => void;
  className?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isPlaying ? "Stop playing" : "Start playing"}
      className={clsx(
        "inline-flex h-10 items-center gap-2 rounded-full bg-highlight px-4 text-xs font-semibold text-bgcolor-primary transition-colors hover:bg-highlight/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-bgcolor-primary",
        className
      )}
    >
      {isPlaying ? (
        <Square size={13} fill="currentColor" aria-hidden="true" />
      ) : (
        <Play size={14} fill="currentColor" aria-hidden="true" />
      )}
      {compact
        ? isPlaying
          ? "Stop"
          : "Play"
        : isPlaying
          ? "Stop playing"
          : "Start playing"}
    </button>
  );
}

export default function PlayWorldButton({
  ready,
  isPlaying,
  onToggle,
  variant = "hero",
  controls,
}: Props) {
  const hasSideBySideHeroLayout = useHasSideBySideHeroLayout();

  if (!ready) {
    return null;
  }

  if (variant === "overlay") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-6 left-1/2 z-20 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-divider/70 bg-bgcolor-primary/90 p-1.5 shadow-[0_8px_32px_#00000026] backdrop-blur-xl"
      >
        <PlayButton isPlaying={isPlaying} onToggle={onToggle} compact />
        {controls && (
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-divider/70" />
        )}
        {controls}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col justify-start items-center text-center gap-5 pt-32"
    >
      <div
        className={clsx(
          "relative z-10 flex items-center gap-1",
          !!controls &&
            "max-w-[calc(100vw-1rem)] rounded-full border border-divider/70 bg-bgcolor-primary/90 p-1.5 shadow-[0_8px_32px_#00000026] backdrop-blur-xl"
        )}
      >
        <PlayButton
          isPlaying={isPlaying}
          onToggle={onToggle}
          compact={!!controls}
        />
        {controls && (
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-divider/70" />
        )}
        {controls}
      </div>
      {isPlaying && hasSideBySideHeroLayout && !controls ? (
        <span className="text-center">Use WASD + Space to move around.</span>
      ) : null}
    </motion.div>
  );
}
