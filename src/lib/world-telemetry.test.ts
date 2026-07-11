import { afterEach, describe, expect, it } from "bun:test";
import { WorldTelemetrySession } from "./world-telemetry";

const originalWindow = globalThis.window;

afterEach(() => {
  Object.assign(globalThis, { window: originalWindow });
});

describe("WorldTelemetrySession", () => {
  it("sends each lifecycle event at most once", () => {
    const events: string[] = [];
    Object.assign(globalThis, {
      window: {
        gtag: (_command: string, eventName: string) => events.push(eventName),
      },
    });

    const telemetry = new WorldTelemetrySession();
    telemetry.trackOnce("world_start_requested");
    telemetry.trackOnce("world_start_requested");
    telemetry.trackOnce("world_stopped");

    expect(events).toEqual(["world_start_requested", "world_stopped"]);
  });
});
