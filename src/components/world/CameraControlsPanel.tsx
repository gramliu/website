import { ArrowUp, Camera, Move, RotateCw, ShieldCheck } from "lucide-react";
import { type MutableRefObject, useEffect, useRef, useState } from "react";
import {
  emptyGestures,
  type GestureOutput,
  GestureTracker,
  type Hand,
  STALE_MS,
} from "../../adapters/input/camera/gestures";
import ControlsPanel from "./ControlsPanel";

interface Props {
  inputRef: MutableRefObject<GestureOutput>;
  autoStart: boolean;
  onStart: () => void;
  onClose: () => void;
}

export default function CameraControlsPanel({
  inputRef,
  autoStart,
  onStart,
  onClose,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [attempt, setAttempt] = useState(autoStart ? 1 : 0);
  const [status, setStatus] = useState("Ready to enable camera");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!attempt) return;
    let disposed = false;
    let stream: MediaStream | undefined;
    let worker: Worker | undefined;
    let timer = 0;
    let watchdog = 0;
    let loadingTimeout = 0;
    let busy = false;
    let lastVideoTime = -1;
    let lastResult = 0;
    let pendingJumpAt = 0;
    let visibilityGeneration = 0;
    let frameGeneration = 0;
    const tracker = new GestureTracker();
    const video = videoRef.current;
    const clear = () => {
      inputRef.current = emptyGestures();
      pendingJumpAt = 0;
      tracker.reset();
      canvasRef.current?.getContext("2d")?.clearRect(0, 0, 560, 360);
    };
    const release = () => {
      window.clearTimeout(timer);
      window.clearTimeout(loadingTimeout);
      window.clearInterval(watchdog);
      worker?.terminate();
      stream?.getTracks().forEach((track) => {
        track.stop();
      });
      if (video) video.srcObject = null;
      clear();
    };
    const fail = (message: string) => {
      if (disposed) return;
      disposed = true;
      release();
      setError(true);
      setStatus(message);
    };
    const visibility = () => {
      visibilityGeneration++;
      lastResult = performance.now();
      clear();
      setStatus(
        document.hidden
          ? "Paused while tab is hidden"
          : "Open your hands to re-arm controls"
      );
    };
    document.addEventListener("visibilitychange", visibility);
    setError(false);
    setStatus("Waiting for camera permission…");

    const draw = (output: GestureOutput) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = video?.videoWidth || 640;
      const height = video?.videoHeight || 480;
      const scale = Math.min(canvas.width / width, canvas.height / height);
      const project = (point: { x: number; y: number }) => ({
        x: (canvas.width - width * scale) / 2 + point.x * width * scale,
        y: (canvas.height - height * scale) / 2 + point.y * height * scale,
      });
      for (const marker of output.markers) {
        const point = project(marker.point);
        const origin = marker.origin ? project(marker.origin) : null;
        const color = marker.side === "Left" ? "#60a5fa" : "#fb923c";
        const outline = "#111827";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (origin) {
          ctx.beginPath();
          ctx.arc(origin.x, origin.y, 14, 0, Math.PI * 2);
          ctx.moveTo(origin.x, origin.y);
          ctx.lineTo(point.x, point.y);
          ctx.strokeStyle = outline;
          ctx.lineWidth = 7;
          ctx.stroke();
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = outline;
        ctx.lineWidth = 3;
        ctx.stroke();

        const label = marker.side === "Left" ? "Move" : "Turn / jump";
        ctx.font = "bold 20px sans-serif";
        const labelWidth = ctx.measureText(label).width + 16;
        const labelX = Math.max(
          4,
          Math.min(point.x + 12, canvas.width - labelWidth - 4)
        );
        const labelY = Math.max(4, Math.min(point.y - 42, canvas.height - 34));
        ctx.fillStyle = outline;
        ctx.beginPath();
        ctx.roundRect(labelX, labelY, labelWidth, 30, 6);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.fillText(label, labelX + 8, labelY + 22);
      }
    };

    const capture = async () => {
      if (disposed) return;
      timer = window.setTimeout(capture, 50);
      if (
        document.hidden ||
        busy ||
        !video ||
        video.readyState < 2 ||
        video.currentTime === lastVideoTime
      )
        return;
      busy = true;
      lastVideoTime = video.currentTime;
      frameGeneration = visibilityGeneration;
      const timestamp = performance.now();
      try {
        const frame = await createImageBitmap(video);
        if (disposed || frameGeneration !== visibilityGeneration) {
          frame.close();
          busy = false;
          return;
        }
        worker?.postMessage({ type: "frame", frame, timestamp }, [frame]);
      } catch {
        fail("Camera frames could not be read. Try again or use Keyboard.");
      }
    };

    async function start() {
      try {
        if (
          !navigator.mediaDevices?.getUserMedia ||
          typeof Worker === "undefined" ||
          typeof createImageBitmap === "undefined"
        ) {
          fail(
            "Camera controls are unavailable in this browser. Use Keyboard or a supported browser over HTTPS."
          );
          return;
        }
        const acquired = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 20, max: 30 },
          },
          audio: false,
        });
        if (disposed) {
          acquired.getTracks().forEach((track) => {
            track.stop();
          });
          return;
        }
        stream = acquired;
        for (const track of stream.getVideoTracks())
          track.addEventListener("ended", () =>
            fail("Camera disconnected. Try again or use Keyboard.")
          );
        if (!video) {
          fail("Camera preview could not start.");
          return;
        }
        video.srcObject = stream;
        await video.play();
        if (disposed) return;
        setStatus("Loading hand tracking…");
        worker = new Worker("/workers/hand-tracker.js");
        loadingTimeout = window.setTimeout(
          () =>
            fail(
              "Hand tracking took too long to load. Check your connection and retry."
            ),
          30_000
        );
        worker.onerror = () =>
          fail("Hand tracking could not load. Try again or use Keyboard.");
        worker.onmessage = ({
          data,
        }: MessageEvent<{
          type: string;
          hands: Hand[];
          timestamp: number;
        }>) => {
          if (disposed) return;
          if (data.type === "error") {
            fail("Hand tracking could not start. Try again or use Keyboard.");
            return;
          }
          if (data.type === "ready") {
            window.clearTimeout(loadingTimeout);
            setStatus("Show both open hands, then pinch to move");
            lastResult = performance.now();
            watchdog = window.setInterval(() => {
              if (document.hidden) return;
              if (performance.now() - lastResult > STALE_MS) {
                clear();
                setStatus("Tracking paused · open hands to resume");
              }
              if (performance.now() - lastResult > 10_000)
                fail("Hand tracking stopped responding. Try again.");
            }, 100);
            void capture();
          }
          if (data.type === "result") {
            busy = false;
            lastResult = performance.now();
            if (
              document.hidden ||
              frameGeneration !== visibilityGeneration ||
              lastResult - data.timestamp > STALE_MS
            ) {
              clear();
              return;
            }
            const output = tracker.update(data.hands, data.timestamp);
            // Latch until a physics tick consumes it, without extending its expiry.
            if (output.jump) pendingJumpAt = data.timestamp;
            output.jump ||=
              output.markers.some((marker) => marker.side === "Right") &&
              inputRef.current.jump &&
              lastResult - pendingJumpAt <= STALE_MS;
            inputRef.current = output;
            draw(output);
            const actions = [
              Math.hypot(output.moveX, output.moveY) > 0 && "Moving",
              output.turn !== 0 && "Turning",
              output.jump && "Jump",
            ].filter(Boolean);
            setStatus(
              actions.length
                ? actions.join(" · ")
                : output.markers.length
                  ? "Open hands to arm · pinch to engage"
                  : "No hands detected · controls stopped"
            );
          }
        };
        worker.postMessage({ type: "init" });
      } catch (cause) {
        const name = cause instanceof DOMException ? cause.name : "";
        fail(
          name === "NotAllowedError"
            ? "Camera permission was denied. Allow access in your browser and retry, or use Keyboard."
            : name === "NotFoundError"
              ? "No camera found. Connect a camera and retry, or use Keyboard."
              : "Camera could not start. Close other camera apps and retry, or use Keyboard."
        );
      }
    }
    // Strict Mode replays mount effects. Only the surviving session requests access.
    queueMicrotask(() => {
      if (!disposed) void start();
    });
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", visibility);
      release();
    };
  }, [attempt, inputRef]);

  return (
    <ControlsPanel mode="camera" onClose={onClose}>
      <div className="relative mx-3 h-[180px] overflow-hidden rounded-xl border border-divider/50 bg-bgcolor-light">
        <video
          ref={videoRef}
          muted
          playsInline
          aria-label="Mirrored camera preview"
          className="h-full w-full -scale-x-100 object-contain"
        />
        <canvas
          ref={canvasRef}
          width={560}
          height={360}
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        {(!attempt || error) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bgcolor-light">
            <Camera
              size={28}
              strokeWidth={1.25}
              className="text-text-faded"
              aria-hidden="true"
            />
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-highlight px-4 py-2 text-xs font-semibold text-bgcolor-primary transition-colors hover:bg-highlight/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-bgcolor-light"
              onClick={() => {
                onStart();
                setAttempt((value) => value + 1);
              }}
            >
              {error ? "Retry camera" : "Enable camera"}
            </button>
          </div>
        )}
      </div>
      <div className="px-4 pb-4 pt-3 text-xs leading-relaxed">
        <div className="mb-3 flex items-start gap-2">
          <span
            aria-hidden="true"
            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${error ? "bg-red-300" : "bg-highlight/70"}`}
          />
          <p
            role="status"
            aria-live="polite"
            className={error ? "text-red-300" : "text-text-faded"}
          >
            {status}
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
                  · Right hand
                </span>
              </dt>
              <dd className="text-text-faded">
                Pinch thumb + index, then move.
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RotateCw
              size={16}
              strokeWidth={1.75}
              className="mt-0.5 shrink-0 text-orange-400"
              aria-hidden="true"
            />
            <div>
              <dt className="font-medium">
                Rotate{" "}
                <span className="ml-1 font-normal text-text-faded">
                  · Left hand
                </span>
              </dt>
              <dd className="text-text-faded">
                Pinch thumb + index, move sideways.
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ArrowUp
              size={16}
              strokeWidth={1.75}
              className="mt-0.5 shrink-0 text-orange-400"
              aria-hidden="true"
            />
            <div>
              <dt className="font-medium">
                Jump{" "}
                <span className="ml-1 font-normal text-text-faded">
                  · Left hand
                </span>
              </dt>
              <dd className="text-text-faded">Pinch thumb + middle once.</dd>
            </div>
          </div>
        </dl>
        <p className="mt-3 text-text-faded">Release your pinch to stop.</p>
        <p className="mt-3 flex items-center gap-2 border-t border-divider/50 pt-3 text-[11px] text-text-faded">
          <ShieldCheck
            size={13}
            strokeWidth={1.75}
            className="shrink-0"
            aria-hidden="true"
          />
          On-device only. No video is uploaded.
        </p>
      </div>
    </ControlsPanel>
  );
}
