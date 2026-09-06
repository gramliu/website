import { Camera, Keyboard } from "lucide-react";
import type { ControlMode } from "./useWorldControls";

export default function ControlModeSwitch({
  mode,
  onChange,
}: {
  mode: ControlMode;
  onChange: (mode: ControlMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Control mode"
      className="flex items-center gap-1 text-xs font-medium"
    >
      {(["keyboard", "camera"] as const).map((value) => {
        const Icon = value === "keyboard" ? Keyboard : Camera;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => onChange(value)}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight ${mode === value ? "bg-highlight/15 text-text-highlight ring-1 ring-inset ring-highlight/25" : "text-text-faded hover:bg-bgcolor-highlight hover:text-text-primary"}`}
          >
            <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
            {value === "keyboard" ? "Keyboard" : "Camera"}
          </button>
        );
      })}
    </div>
  );
}
