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
    this.blocks = worldData.map((block, index) => (
      <Block key={index} {...block} />
    ));
    this.worldBlocks = new Map();

    // console.log(worldData.length);
    for (const block of worldData) {
      const [x, y, z] = block.position;
      this.worldBlocks.set(positionToString({ x, y, z }), block.id);
    }
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
}
