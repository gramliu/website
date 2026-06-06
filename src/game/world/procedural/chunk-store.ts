import type { VoxelChunk } from "./chunk";
import { chunkKey } from "./chunk-coords";
import { TerrainGenerator } from "./terrain-generator";

export interface ChunkStoreOptions {
  generator?: TerrainGenerator;
  maxCachedChunks?: number;
}

export class ChunkStore {
  private readonly generator: TerrainGenerator;
  private readonly chunks = new Map<string, VoxelChunk>();
  private maxCachedChunks: number;
  private accessClock = 0;

  constructor(options: ChunkStoreOptions = {}) {
    this.generator = options.generator ?? new TerrainGenerator();
    this.maxCachedChunks = options.maxCachedChunks ?? 81;
  }

  public setMaxCachedChunks(maxCachedChunks: number): void {
    this.maxCachedChunks = maxCachedChunks;
    this.evictStaleChunks();
  }

  public get size(): number {
    return this.chunks.size;
  }

  public getLoadedChunks(): VoxelChunk[] {
    return Array.from(this.chunks.values());
  }

  public hasChunk(chunkX: number, chunkZ: number): boolean {
    return this.chunks.has(chunkKey(chunkX, chunkZ));
  }

  public getChunk(chunkX: number, chunkZ: number): VoxelChunk | null {
    const chunk = this.chunks.get(chunkKey(chunkX, chunkZ));
    if (!chunk) {
      return null;
    }

    this.touch(chunk);
    return chunk;
  }

  public ensureChunk(chunkX: number, chunkZ: number): VoxelChunk {
    const key = chunkKey(chunkX, chunkZ);
    const existing = this.chunks.get(key);
    if (existing) {
      this.touch(existing);
      return existing;
    }

    const chunk = this.generator.generateChunk(chunkX, chunkZ);
    this.touch(chunk);
    this.chunks.set(key, chunk);
    this.evictStaleChunks();
    return chunk;
  }

  public ensureWindow(
    centerChunkX: number,
    centerChunkZ: number,
    radius: number
  ): VoxelChunk[] {
    const chunks: VoxelChunk[] = [];
    for (
      let chunkZ = centerChunkZ - radius;
      chunkZ <= centerChunkZ + radius;
      chunkZ++
    ) {
      for (
        let chunkX = centerChunkX - radius;
        chunkX <= centerChunkX + radius;
        chunkX++
      ) {
        chunks.push(this.ensureChunk(chunkX, chunkZ));
      }
    }

    return chunks;
  }

  public retainWindow(
    centerChunkX: number,
    centerChunkZ: number,
    radius: number
  ): void {
    for (const [key, chunk] of Array.from(this.chunks.entries())) {
      const distance = Math.max(
        Math.abs(chunk.chunkX - centerChunkX),
        Math.abs(chunk.chunkZ - centerChunkZ)
      );
      if (distance > radius) {
        this.chunks.delete(key);
      }
    }
  }

  private touch(chunk: VoxelChunk): void {
    this.accessClock += 1;
    chunk.lastAccessedAt = this.accessClock;
  }

  private evictStaleChunks(): void {
    if (this.chunks.size <= this.maxCachedChunks) {
      return;
    }

    const chunksByAccess = Array.from(this.chunks.values()).sort(
      (a, b) => a.lastAccessedAt - b.lastAccessedAt
    );
    const evictCount = this.chunks.size - this.maxCachedChunks;
    for (const chunk of chunksByAccess.slice(0, evictCount)) {
      this.chunks.delete(chunkKey(chunk.chunkX, chunk.chunkZ));
    }
  }
}
