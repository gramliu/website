import { MaterialTextureProps } from "../../lib/texture";
import Block from "./block";
import { blockMap } from "./blocks";
import worldData from "./world.txt";

interface BlockRenderData {
  position: [number, number, number];
  id: number;
  texture: {
    top: MaterialTextureProps;
    side: MaterialTextureProps;
  };
}

interface Position {
  x: number;
  y: number;
  z: number;
}

export interface WaterBlockAdjacency {
  top: boolean;
  bottom: boolean;
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

function loadWorldData(): BlockRenderData[] {
  const lines: string[] = worldData.split("\n");
  const blocks: BlockRenderData[] = [];

  let z = 0;
  let y = 0;
  for (const line of lines) {
    if (line.length === 0) {
      y++;
      z = 0;
      continue;
    }

    const blockIds = line.split(" ");
    for (let x = 0; x < blockIds.length; x++) {
      const blockId = blockIds[x];

      const blockType = blockMap[blockId];
      if (!blockType) {
        // air
        continue;
      }

      blocks.push({
        position: [x, y, z],
        texture: blockType,
        id: parseInt(blockId),
      });
    }
    z++;
  }
  return blocks;
}

function positionToString(position: Position): string {
  return `${position.x},${position.y},${position.z}`;
}

/**
 * World map with blocks
 */
export class World {
  public readonly blocks: JSX.Element[];
  private readonly worldBlocks: Map<string, number>;

  constructor() {
    const worldData = loadWorldData();
    this.worldBlocks = new Map();
    for (const block of worldData) {
      const [x, y, z] = block.position;
      this.worldBlocks.set(positionToString({ x, y, z }), block.id);
    }

    this.blocks = worldData.map((block, index) => {
      const adjacentBlocks = this.getAdjacentBlocks({
        x: block.position[0],
        y: block.position[1],
        z: block.position[2],
      });
      return (
        <Block
          key={index}
          {...block}
          adjacentBlocks={adjacentBlocks}
        />
      );
    });
  }

  private getBlockPosition(position: Position): Position {
    return {
      x: Math.trunc(position.x),
      y: Math.trunc(position.y),
      z: Math.trunc(position.z),
    };
  }

  // Get the block at a given position
  public getBlockAtPosition(position: Position): number {
    const blockPosition = this.getBlockPosition(position);
    return this.worldBlocks.get(positionToString(blockPosition)) ?? 0;
  }

  // Get the highest block position at a given x, z position
  public getHighestBlockPosition(x: number, z: number): number {
    const blockPosition = this.getBlockPosition({ x, y: 0, z });
    let y = 0;
    while (this.getBlockAtPosition({ ...blockPosition, y }) !== 0) {
      y++;
    }
    return y;
  }

  // New method to check adjacent blocks
  public getAdjacentBlocks(position: Position): WaterBlockAdjacency {
    const { x, y, z } = position;
    return {
      top: this.isWater({ x, y: y + 1, z }),
      bottom: this.isWater({ x, y: y - 1, z }),
      north: this.isWater({ x, y, z: z - 1 }),
      south: this.isWater({ x, y, z: z + 1 }),
      east: this.isWater({ x: x + 1, y, z }),
      west: this.isWater({ x: x - 1, y, z }),
    };
  }

  public isWater(position: Position): boolean {
    const blockId = this.getBlockAtPosition(position);
    return blockId === 9; // Assuming 9 is the ID for water blocks
  }
}
