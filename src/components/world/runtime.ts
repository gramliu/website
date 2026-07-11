export const INTERACTIVE_START_TIMEOUT_MS = 8_000;
const SEVERE_FRAME_TIME_MS = 100;
const MIN_FRAME_SAMPLES = 40;

export interface WorldPerformanceSummary {
  averageFrameMs: number;
  p95FrameMs: number;
  sampleCount: number;
}

export function summarizeFrameTimes(
  frameTimes: number[]
): WorldPerformanceSummary {
  if (frameTimes.length === 0) {
    return { averageFrameMs: 0, p95FrameMs: 0, sampleCount: 0 };
  }

  const sorted = [...frameTimes].sort((a, b) => a - b);
  const p95Index = Math.min(
    sorted.length - 1,
    Math.ceil(sorted.length * 0.95) - 1
  );
  const averageFrameMs =
    frameTimes.reduce((total, frameTime) => total + frameTime, 0) /
    frameTimes.length;

  return {
    averageFrameMs,
    p95FrameMs: sorted[p95Index],
    sampleCount: frameTimes.length,
  };
}

export function shouldDowngradeQuality(
  summary: WorldPerformanceSummary
): boolean {
  return (
    summary.sampleCount >= MIN_FRAME_SAMPLES &&
    summary.p95FrameMs >= SEVERE_FRAME_TIME_MS
  );
}
