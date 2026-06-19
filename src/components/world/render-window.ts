import type { PlayerRevealSource } from "./effects/player-effects";

export interface RenderWindowCenter {
  x: number;
  z: number;
}

export const FAIRY_REVEAL_RENDER_MARGIN = 2;

export function computeFairyExpandedRenderRadius(
  center: RenderWindowCenter,
  revealSources: PlayerRevealSource[],
  baseRadius: number,
  margin = FAIRY_REVEAL_RENDER_MARGIN
): number {
  let radius = baseRadius;

  for (const source of revealSources) {
    const distanceFromCenter = Math.max(
      Math.abs(source.position.x - center.x),
      Math.abs(source.position.z - center.z)
    );
    radius = Math.max(
      radius,
      Math.ceil(distanceFromCenter + source.radius + margin)
    );
  }

  return radius;
}
