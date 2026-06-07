import clsx from "clsx";
import { useEffect, useState } from "react";
import World from "../src/components/world";

type MobileControlKey = "KeyW" | "KeyA" | "KeyS" | "KeyD";

interface MobileControlButton {
  code: MobileControlKey;
  label: string;
  gridArea: string;
}

const mobileControls: MobileControlButton[] = [
  { code: "KeyW", label: "W", gridArea: "col-start-2 row-start-1" },
  { code: "KeyA", label: "A", gridArea: "col-start-1 row-start-2" },
  { code: "KeyS", label: "S", gridArea: "col-start-2 row-start-2" },
  { code: "KeyD", label: "D", gridArea: "col-start-3 row-start-2" },
];

function dispatchKeyboardControl(
  code: MobileControlKey,
  type: "keydown" | "keyup"
) {
  window.dispatchEvent(
    new KeyboardEvent(type, {
      bubbles: true,
      cancelable: true,
      code,
      key: code.replace("Key", "").toLowerCase(),
    })
  );
}

function MobileWasdControls({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) {
      for (const control of mobileControls) {
        dispatchKeyboardControl(control.code, "keyup");
      }
    }
  }, [enabled]);

  return (
    <div
      className={clsx(
        "absolute bottom-24 left-4 z-20 grid grid-cols-3 grid-rows-2 gap-2 md:hidden select-none touch-none transition-opacity",
        enabled ? "opacity-100" : "pointer-events-none opacity-40"
      )}
      role="group"
      aria-label="Mobile WASD controls"
    >
      {mobileControls.map((control) => (
        <button
          key={control.code}
          type="button"
          aria-label={`Move ${control.label}`}
          disabled={!enabled}
          onPointerDown={(event) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            dispatchKeyboardControl(control.code, "keydown");
          }}
          onPointerUp={(event) => {
            event.preventDefault();
            dispatchKeyboardControl(control.code, "keyup");
          }}
          onPointerCancel={() => dispatchKeyboardControl(control.code, "keyup")}
          onPointerLeave={() => dispatchKeyboardControl(control.code, "keyup")}
          className={clsx(
            control.gridArea,
            "h-14 w-14 rounded-full border border-white/40 bg-black/70 text-lg font-bold text-white shadow-lg backdrop-blur-sm active:scale-95 disabled:cursor-not-allowed"
          )}
        >
          {control.label}
        </button>
      ))}
    </div>
  );
}

export default function WorldPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <main className="relative flex h-screen w-screen font-sans">
      <World
        rotateWorld={false}
        interactiveMode={isPlaying}
        showFringe
        worldMode="procedural"
      />
      <MobileWasdControls enabled={isPlaying} />
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={clsx(
          "absolute bottom-8 left-1/2 z-20 -translate-x-1/2 px-4 py-2 bg-yellow-500 text-black rounded-lg shadow-lg hover:bg-yellow-600 transition-all",
          {
            "animate-bounce": !isPlaying,
          }
        )}
      >
        {isPlaying ? "Stop playing" : "Start playing"}
      </button>
    </main>
  );
}
