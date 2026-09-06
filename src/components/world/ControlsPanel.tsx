import { Camera, Keyboard, X } from "lucide-react";
import type { ReactNode } from "react";

export default function ControlsPanel({
  mode,
  onClose,
  children,
}: {
  mode: "camera" | "keyboard";
  onClose?: () => void;
  children: ReactNode;
}) {
  const Icon = mode === "camera" ? Camera : Keyboard;
  const title = mode === "camera" ? "Camera controls" : "Keyboard controls";
  return (
    <section
      aria-label={title}
      className="absolute bottom-24 right-4 z-30 h-[548px] w-[300px] max-h-[calc(100dvh-7rem)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-divider/70 bg-bgcolor-primary/95 text-text-primary shadow-[0_12px_40px_#00000026] backdrop-blur-xl lg:bottom-6 lg:right-6"
    >
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <Icon
            size={17}
            strokeWidth={1.75}
            className="text-text-highlight"
            aria-hidden="true"
          />
          <h2 className="text-sm font-medium">{title}</h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close camera and use keyboard"
            className="-mr-1 flex h-8 w-8 items-center justify-center rounded-full text-text-faded transition-colors hover:bg-bgcolor-highlight hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight"
          >
            <X size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
