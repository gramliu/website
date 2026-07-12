import type {
  WorldQuality,
  WorldTerrainMode,
} from "../components/world/quality";
import { HERO_WORLD_SIDE_BY_SIDE_MEDIA_QUERY } from "../config/breakpoints";

type TelemetryValue = string | number | boolean | undefined;
type TelemetryParameters = Record<string, TelemetryValue>;

export type WorldTelemetryEvent =
  | "world_start_requested"
  | "world_interactive_ready"
  | "world_performance_sample"
  | "world_context_lost"
  | "world_render_error"
  | "world_quality_downgraded"
  | "world_fallback"
  | "world_stopped";

declare global {
  interface Navigator {
    deviceMemory?: number;
  }

  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      parameters?: Record<string, string | number | boolean>
    ) => void;
  }
}

function bucket(value: number | undefined, thresholds: number[]): string {
  if (value === undefined || !Number.isFinite(value)) {
    return "unknown";
  }
  for (const threshold of thresholds) {
    if (value <= threshold) {
      return `lte_${threshold}`;
    }
  }
  return `gt_${thresholds[thresholds.length - 1]}`;
}

export function getWorldCapabilityTelemetry(
  quality: WorldQuality,
  terrainMode: WorldTerrainMode
): TelemetryParameters {
  if (typeof window === "undefined") {
    return { quality, world_mode: terrainMode };
  }

  return {
    quality,
    world_mode: terrainMode,
    viewport: window.matchMedia(HERO_WORLD_SIDE_BY_SIDE_MEDIA_QUERY).matches
      ? "desktop"
      : "mobile",
    dpr: bucket(window.devicePixelRatio, [1, 2, 3]),
    logical_cores: bucket(navigator.hardwareConcurrency, [2, 4, 8]),
    device_memory: bucket(navigator.deviceMemory, [2, 4, 8]),
  };
}

export function trackWorldEvent(
  eventName: WorldTelemetryEvent,
  parameters: TelemetryParameters = {}
): void {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  const cleanedParameters: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined) {
      cleanedParameters[key] = value;
    }
  }
  window.gtag("event", eventName, cleanedParameters);
}

export class WorldTelemetrySession {
  private readonly sent = new Set<WorldTelemetryEvent>();

  public trackOnce(
    eventName: WorldTelemetryEvent,
    parameters: TelemetryParameters = {}
  ): void {
    if (this.sent.has(eventName)) {
      return;
    }
    this.sent.add(eventName);
    trackWorldEvent(eventName, parameters);
  }
}
