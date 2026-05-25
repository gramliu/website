import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
} from "three";
import type { FringeLayout } from "./fringe-layout";

const WIREFRAME_VERTICES_PER_BLOCK = 24;
const GRID_VERTICES_PER_TILE = 8;

const boxGeometry = new BoxGeometry(1, 1, 1);
const wireframeEdgePositions = new EdgesGeometry(boxGeometry).attributes
  .position.array as Float32Array;

const gridTileVertices = new Float32Array([
  0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0,
]);

function appendWireframeBlock(
  positions: number[],
  opacities: number[],
  lineKinds: number[],
  x: number,
  y: number,
  z: number,
  opacity: number
): void {
  const ox = x + 0.5;
  const oy = y + 0.5;
  const oz = z + 0.5;

  for (let i = 0; i < wireframeEdgePositions.length; i += 3) {
    positions.push(
      wireframeEdgePositions[i] + ox,
      wireframeEdgePositions[i + 1] + oy,
      wireframeEdgePositions[i + 2] + oz
    );
    opacities.push(opacity);
    lineKinds.push(0);
  }
}

function appendGridTile(
  positions: number[],
  opacities: number[],
  lineKinds: number[],
  x: number,
  y: number,
  z: number,
  opacity: number
): void {
  for (let i = 0; i < gridTileVertices.length; i += 3) {
    positions.push(
      gridTileVertices[i] + x,
      gridTileVertices[i + 1] + y,
      gridTileVertices[i + 2] + z
    );
    opacities.push(opacity);
    lineKinds.push(1);
  }
}

export function getWireframeVerticesPerBlock(): number {
  return WIREFRAME_VERTICES_PER_BLOCK;
}

export function getGridVerticesPerTile(): number {
  return GRID_VERTICES_PER_TILE;
}

export function buildFringeLineGeometry(layout: FringeLayout): BufferGeometry {
  const positions: number[] = [];
  const opacities: number[] = [];
  const lineKinds: number[] = [];

  for (const { x, y, z, opacity } of layout.wireframes) {
    appendWireframeBlock(positions, opacities, lineKinds, x, y, z, opacity);
  }

  for (const { x, z, opacity } of layout.gridTiles) {
    appendGridTile(
      positions,
      opacities,
      lineKinds,
      x,
      layout.gridY,
      z,
      opacity
    );
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new Float32BufferAttribute(new Float32Array(positions), 3)
  );
  geometry.setAttribute(
    "baseOpacity",
    new BufferAttribute(new Float32Array(opacities), 1)
  );
  geometry.setAttribute(
    "lineKind",
    new BufferAttribute(new Float32Array(lineKinds), 1)
  );

  return geometry;
}
