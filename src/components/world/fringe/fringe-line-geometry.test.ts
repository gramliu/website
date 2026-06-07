import { describe, expect, it } from "bun:test";
import { VoxelWorld } from "../../../game/world/world";
import { loadWorldCellsFromString } from "../../../game/world/world-loader";
import worldData from "../world-data";
import { computeFringeLayout } from "./fringe-layout";
import {
  buildFringeLineGeometry,
  getGridVerticesPerTile,
  getWireframeVerticesPerBlock,
} from "./fringe-line-geometry";

const world = new VoxelWorld(loadWorldCellsFromString(worldData));

describe("buildFringeLineGeometry", () => {
  it("merges wireframe and grid vertices with matching baseOpacity counts", () => {
    const layout = computeFringeLayout(world);
    const geometry = buildFringeLineGeometry(layout);

    const positions = geometry.getAttribute("position");
    const baseOpacity = geometry.getAttribute("baseOpacity");

    const expectedVertexCount =
      layout.wireframes.length * getWireframeVerticesPerBlock() +
      layout.gridTiles.length * getGridVerticesPerTile();

    expect(positions.count).toBe(expectedVertexCount);
    expect(baseOpacity.count).toBe(expectedVertexCount);
    expect(geometry.getAttribute("lineKind").count).toBe(expectedVertexCount);
    expect(geometry.getAttribute("fidelity").count).toBe(expectedVertexCount);
    expect(geometry.getAttribute("lodOpacity").count).toBe(expectedVertexCount);
  });

  it("tags wireframe vertices as kind 0 and grid vertices as kind 1", () => {
    const layout = computeFringeLayout(world);
    const geometry = buildFringeLineGeometry(layout);
    const lineKind = geometry.getAttribute("lineKind");
    const wireframeVertexCount =
      layout.wireframes.length * getWireframeVerticesPerBlock();

    for (let i = 0; i < wireframeVertexCount; i++) {
      expect(lineKind.getX(i)).toBe(0);
    }

    for (let i = wireframeVertexCount; i < lineKind.count; i++) {
      expect(lineKind.getX(i)).toBe(1);
    }
  });

  it("assigns layout opacity to every vertex in each wireframe block", () => {
    const layout = computeFringeLayout(world);
    const geometry = buildFringeLineGeometry(layout);
    const baseOpacity = geometry.getAttribute("baseOpacity");
    const verticesPerBlock = getWireframeVerticesPerBlock();

    for (let i = 0; i < layout.wireframes.length; i++) {
      const { opacity } = layout.wireframes[i];
      const start = i * verticesPerBlock;

      for (let v = 0; v < verticesPerBlock; v++) {
        expect(baseOpacity.getX(start + v)).toBeCloseTo(opacity);
      }
    }
  });

  it("assigns layout opacity to every vertex in each grid tile", () => {
    const layout = computeFringeLayout(world);
    const geometry = buildFringeLineGeometry(layout);
    const baseOpacity = geometry.getAttribute("baseOpacity");
    const positions = geometry.getAttribute("position");
    const wireframeVertexCount =
      layout.wireframes.length * getWireframeVerticesPerBlock();
    const verticesPerTile = getGridVerticesPerTile();

    for (let i = 0; i < layout.gridTiles.length; i++) {
      const { x, z, opacity } = layout.gridTiles[i];
      const start = wireframeVertexCount + i * verticesPerTile;

      for (let v = 0; v < verticesPerTile; v++) {
        expect(baseOpacity.getX(start + v)).toBeCloseTo(opacity);
      }

      expect(positions.getY(start)).toBe(layout.gridY);
      expect(positions.getX(start)).toBe(x);
      expect(positions.getZ(start)).toBe(z);
    }
  });

  it("includes focus point in layout", () => {
    const layout = computeFringeLayout(world);
    const bounds = world.getBounds();
    const centerX = (bounds.min.x + bounds.max.x + 1) / 2;
    const centerZ = (bounds.min.z + bounds.max.z + 1) / 2;

    expect(layout.focus).toEqual({
      x: centerX,
      y: layout.gridY,
      z: centerZ,
    });
  });
});
