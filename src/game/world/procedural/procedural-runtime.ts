import type { LoadedWorldCell } from "../world-loader";
import type { ProceduralRuntimeMode } from "./lod-policy";
import { ProceduralVoxelWorld } from "./procedural-world";
import {
  type CameraSnapshotContext,
  createProceduralRenderSnapshot,
  type ProceduralRenderSnapshot,
  type RenderOrigin,
} from "./render-snapshot";
import { StarterRegion } from "./starter-region";

export interface ProceduralWorldRuntimeOptions {
  seed?: number;
  mode?: ProceduralRuntimeMode;
  previewCenterX?: number;
  previewCenterZ?: number;
  seedCells?: LoadedWorldCell[];
  starterRegion?: StarterRegion;
}

export class ProceduralWorldRuntime {
  public readonly world: ProceduralVoxelWorld;
  public readonly starterRegion: StarterRegion | null;
  private mode: ProceduralRuntimeMode;
  private focus: RenderOrigin;
  private camera: CameraSnapshotContext | null = null;

  constructor(options: ProceduralWorldRuntimeOptions = {}) {
    this.mode = options.mode ?? "preview";
    this.focus = {
      x: options.previewCenterX ?? 0,
      y: 0,
      z: options.previewCenterZ ?? 0,
    };
    this.starterRegion =
      options.starterRegion ??
      (options.seedCells ? new StarterRegion(options.seedCells) : null);
    this.world = new ProceduralVoxelWorld({
      seed: options.seed,
      mode: this.mode,
      centerX: options.previewCenterX,
      centerZ: options.previewCenterZ,
      starterRegion: this.starterRegion ?? undefined,
    });
  }

  public updateFocus(
    focus: RenderOrigin,
    mode: ProceduralRuntimeMode = this.mode,
    camera: CameraSnapshotContext | null = this.camera
  ): boolean {
    const previousMode = this.mode;
    this.mode = mode;
    this.focus = { ...focus };
    this.camera = camera
      ? { position: { ...camera.position }, forward: { ...camera.forward } }
      : null;
    const worldChanged = this.world.updateFocus(focus.x, focus.z, mode);

    return worldChanged || previousMode !== mode;
  }

  public createSnapshot(): ProceduralRenderSnapshot {
    return createProceduralRenderSnapshot({
      world: this.world,
      mode: this.mode,
      focus: this.focus,
      camera: this.camera,
    });
  }
}
