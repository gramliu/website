import { type MutableRefObject, useEffect, useRef, useState } from "react";
import {
  emptyGestures,
  type GestureOutput,
  GestureTracker,
  type Hand,
  STALE_MS,
} from "../../adapters/input/camera/gestures";

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
        ctx.strokeStyle = ctx.fillStyle =
          marker.side === "Left" ? "#67e8f9" : "#fde047";
        ctx.lineWidth = 3;
        if (origin) {
          ctx.beginPath();
          ctx.arc(origin.x, origin.y, 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(origin.x, origin.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(
          marker.side === "Left" ? "Move" : "Turn / jump",
          point.x + 12,
          point.y - 12
        );
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
    <section
      aria-label="Camera controls"
      className="absolute bottom-28 right-4 z-30 w-[280px] max-h-[calc(100dvh-8rem)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-white/20 bg-slate-950/95 text-white shadow-xl sm:bottom-24 lg:bottom-6"
    >
      <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
        <span>Camera controls</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close camera and use keyboard"
          className="rounded px-2 py-1 hover:bg-white/10 focus-visible:outline focus-visible:outline-2"
        >
          ✕
        </button>
      </div>
      <div className="relative h-[180px] bg-black">
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
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              className="rounded-lg bg-yellow-500 px-4 py-2 text-black"
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
      <div className="space-y-2 p-3 text-xs leading-relaxed">
        <p
          role="status"
          aria-live="polite"
          className={error ? "text-red-300" : "text-yellow-200"}
        >
          {status}
        </p>
        <p>
          <span className="text-cyan-300">Right thumb + index:</span> pinch and
          move to walk.
        </p>
        <p>
          <span className="text-yellow-200">Left thumb + index:</span> pinch and
          move sideways to turn the view.
        </p>
        <p>Left thumb + middle: jump. Release to stop.</p>
        <p className="text-slate-400">
          Processed on your device. No video is uploaded.
        </p>
      </div>
    </section>
  );
}
