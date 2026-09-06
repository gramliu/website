import { ArrowUp, Keyboard, Move, RotateCcw } from "lucide-react";
import {
  type DisplayKey,
  isKeyPressed,
  usePressedKeys,
} from "../../adapters/input/pressed-keys";
import ControlsPanel from "./ControlsPanel";

export default function KeyboardControlsPanel({
  isPlaying,
}: {
  isPlaying: boolean;
}) {
  const pressed = usePressedKeys(isPlaying);
  const keycapClass = (key: DisplayKey) =>
    `flex items-center justify-center rounded-lg border font-mono text-sm transition-[background-color,color,border-color,transform,box-shadow] duration-75 motion-reduce:transition-none ${isKeyPressed(pressed, key) ? "translate-y-0.5 border-highlight bg-highlight text-bgcolor-primary shadow-none" : "border-divider bg-bgcolor-primary/50 text-text-faded shadow-[0_2px_0_#49636f]"}`;
  return (
    <ControlsPanel mode="keyboard">
      <div
        aria-hidden="true"
        className="mx-3 flex h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-divider/50 bg-bgcolor-light"
      >
        <div className="grid grid-cols-3 gap-1.5">
          {["", "W", "", "A", "S", "D"].map((key, index) =>
            key ? (
              <kbd
                key={key}
                data-pressed={isKeyPressed(pressed, key as DisplayKey)}
                className={`${keycapClass(key as DisplayKey)} h-9 w-10`}
              >
                {key}
              </kbd>
            ) : (
              <span key={index} />
            )
          )}
        </div>
        <div className="mt-1 flex gap-2">
          <kbd
            data-pressed={isKeyPressed(pressed, "SPACE")}
            className={`${keycapClass("SPACE")} h-7 w-28 !text-[10px]`}
          >
            SPACE
          </kbd>
          <kbd
            data-pressed={isKeyPressed(pressed, "R")}
            className={`${keycapClass("R")} h-7 w-8 !text-[10px]`}
          >
            R
          </kbd>
        </div>
      </div>
      <div className="px-4 pb-4 pt-3 text-xs leading-relaxed">
        <div className="mb-3 flex items-start gap-2">
          <span
            aria-hidden="true"
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-highlight/70"
          />
          <p role="status" className="text-text-faded">
            {isPlaying
              ? "Ready to explore · use your keyboard"
              : "Press Play to start exploring"}
          </p>
        </div>
        <dl className="space-y-3 border-t border-divider/50 pt-3">
          <div className="flex items-start gap-3">
            <Move
              size={16}
              strokeWidth={1.75}
              className="mt-0.5 shrink-0 text-text-highlight"
              aria-hidden="true"
            />
            <div>
              <dt className="font-medium">
                Move{" "}
                <span className="ml-1 font-normal text-text-faded">
                  · WASD / arrow keys
                </span>
              </dt>
              <dd className="text-text-faded">Hold a direction to walk.</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ArrowUp
              size={16}
              strokeWidth={1.75}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <dt className="font-medium">
                Jump{" "}
                <span className="ml-1 font-normal text-text-faded">
                  · Space
                </span>
              </dt>
              <dd className="text-text-faded">Press to jump over blocks.</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RotateCcw
              size={16}
              strokeWidth={1.75}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <dt className="font-medium">
                Reset{" "}
                <span className="ml-1 font-normal text-text-faded">· R</span>
              </dt>
              <dd className="text-text-faded">
                Start again from the spawn point.
              </dd>
            </div>
          </div>
        </dl>
        <p className="mt-3 text-text-faded">Release the keys to stop.</p>
        <p className="mt-3 flex items-center gap-2 border-t border-divider/50 pt-3 text-[11px] text-text-faded">
          <Keyboard
            size={13}
            strokeWidth={1.75}
            className="shrink-0"
            aria-hidden="true"
          />
          Camera is off in keyboard mode.
        </p>
      </div>
    </ControlsPanel>
  );
}
