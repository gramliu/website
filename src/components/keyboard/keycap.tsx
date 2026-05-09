import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  type Group,
  LinearFilter,
  MeshStandardMaterial,
  SRGBColorSpace,
} from "three";

interface KeycapProps {
  label: string;
  position: [number, number, number];
  width?: number;
  depth?: number;
  row?: number;
  pressed: boolean;
}

const KEY_HEIGHT = 0.62;
const REST_Y = 0.52;
const PRESSED_Y = 0.18;
const TOP_INSET = 0.18;
const CORNER_INSET = 0.12;
const SIDE_COLOR = "#d2dde2";
const PRESSED_SIDE_COLOR = "#8f9da3";

type Point = [number, number, number];

function getPointUv(
  point: Point,
  width: number,
  depth: number
): [number, number] {
  return [point[0] / width + 0.5, 1 - (point[2] / depth + 0.5)];
}

function pushTriangle(
  positions: number[],
  uvs: number[],
  a: Point,
  b: Point,
  c: Point,
  width: number,
  depth: number,
  usePlanarUv = false
) {
  positions.push(...a, ...b, ...c);

  if (usePlanarUv) {
    uvs.push(...getPointUv(a, width, depth), ...getPointUv(b, width, depth));
    uvs.push(...getPointUv(c, width, depth));
    return;
  }

  uvs.push(0, 0, 1, 0, 1, 1);
}

function createKeycapBodyGeometry(
  width: number,
  height: number,
  depth: number,
  row: number
) {
  const bottomX = width / 2;
  const bottomZ = depth / 2;
  const topX = (width - TOP_INSET) / 2;
  const topZ = (depth - TOP_INSET) / 2;
  const bottomY = -height / 2;
  const topY = height / 2;
  const corner = Math.min(CORNER_INSET, topX * 0.4, topZ * 0.4);
  const bottomCorner = Math.min(corner * 0.55, bottomX * 0.25, bottomZ * 0.25);
  const rowSlope = row === 1 ? -0.04 : row === 3 ? 0.08 : 0.04;

  const topPoints: Point[] = [
    [-topX + corner, topY - rowSlope, -topZ],
    [topX - corner, topY - rowSlope, -topZ],
    [topX, topY - rowSlope * 0.5, -topZ + corner],
    [topX, topY + rowSlope * 0.5, topZ - corner],
    [topX - corner, topY + rowSlope, topZ],
    [-topX + corner, topY + rowSlope, topZ],
    [-topX, topY + rowSlope * 0.5, topZ - corner],
    [-topX, topY - rowSlope * 0.5, -topZ + corner],
  ];

  const bottomPoints: Point[] = [
    [-bottomX + bottomCorner, bottomY, -bottomZ],
    [bottomX - bottomCorner, bottomY, -bottomZ],
    [bottomX, bottomY, -bottomZ + bottomCorner],
    [bottomX, bottomY, bottomZ - bottomCorner],
    [bottomX - bottomCorner, bottomY, bottomZ],
    [-bottomX + bottomCorner, bottomY, bottomZ],
    [-bottomX, bottomY, bottomZ - bottomCorner],
    [-bottomX, bottomY, -bottomZ + bottomCorner],
  ];

  const positions: number[] = [];
  const uvs: number[] = [];

  for (let i = 0; i < topPoints.length; i++) {
    const next = (i + 1) % topPoints.length;

    pushTriangle(
      positions,
      uvs,
      bottomPoints[i],
      bottomPoints[next],
      topPoints[next],
      width,
      depth
    );
    pushTriangle(
      positions,
      uvs,
      bottomPoints[i],
      topPoints[next],
      topPoints[i],
      width,
      depth
    );
  }

  const sideVertexCount = positions.length / 3;
  const topCenter: Point = [0, topY, 0];

  for (let i = 0; i < topPoints.length; i++) {
    const next = (i + 1) % topPoints.length;

    pushTriangle(
      positions,
      uvs,
      topCenter,
      topPoints[next],
      topPoints[i],
      width,
      depth,
      true
    );
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3)
  );
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
  geometry.addGroup(0, sideVertexCount, 0);
  geometry.addGroup(sideVertexCount, positions.length / 3 - sideVertexCount, 1);
  geometry.computeVertexNormals();

  return geometry;
}

function createLegendTexture(label: string, width: number, depth: number) {
  if (typeof document === "undefined") {
    return undefined;
  }

  const pxPerUnit = 192;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(128, Math.round(width * pxPerUnit));
  canvas.height = Math.max(128, Math.round(depth * pxPerUnit));

  const context = canvas.getContext("2d");
  if (!context) {
    return undefined;
  }

  const topColor = "#edf4f7";
  context.fillStyle = topColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const contour = context.createLinearGradient(0, 0, canvas.width, 0);
  contour.addColorStop(0, "rgba(255,255,255,0.24)");
  contour.addColorStop(0.42, "rgba(255,255,255,0)");
  contour.addColorStop(0.7, "rgba(0,0,0,0.03)");
  contour.addColorStop(1, "rgba(0,0,0,0.18)");
  context.fillStyle = contour;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const edge = context.createLinearGradient(0, 0, 0, canvas.height);
  edge.addColorStop(0, "rgba(255,255,255,0.22)");
  edge.addColorStop(0.12, "rgba(255,255,255,0)");
  edge.addColorStop(0.86, "rgba(0,0,0,0)");
  edge.addColorStop(1, "rgba(0,0,0,0.14)");
  context.fillStyle = edge;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#ff4328";
  context.font = `800 ${label === "Space" ? 36 : 58}px Arial, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, canvas.width / 2, canvas.height / 2);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;

  return texture;
}

export function Keycap({
  label,
  position,
  width = 0.9,
  depth = 0.9,
  row = 2,
  pressed,
}: KeycapProps) {
  const groupRef = useRef<Group>(null);
  const bodyGeometry = useMemo(
    () => createKeycapBodyGeometry(width, KEY_HEIGHT, depth, row),
    [width, depth, row]
  );
  const legendTexture = useMemo(
    () => createLegendTexture(label, width, depth),
    [label, width, depth]
  );
  const materials = useMemo(
    () => [
      new MeshStandardMaterial({
        color: pressed ? PRESSED_SIDE_COLOR : SIDE_COLOR,
        roughness: 0.72,
        metalness: 0.04,
      }),
      new MeshStandardMaterial({
        color: pressed ? "#aab5ba" : "#ffffff",
        map: legendTexture,
        roughness: 0.65,
        metalness: 0.05,
      }),
    ],
    [pressed, legendTexture]
  );

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    const targetY = pressed ? PRESSED_Y : REST_Y;
    const targetRotationX = pressed ? -0.16 : 0;
    const smoothing = Math.min(1, delta * 18);

    groupRef.current.position.y +=
      (targetY - groupRef.current.position.y) * smoothing;
    groupRef.current.rotation.x +=
      (targetRotationX - groupRef.current.rotation.x) * smoothing;
  });

  return (
    <group ref={groupRef} position={[position[0], REST_Y, position[2]]}>
      <mesh
        geometry={bodyGeometry}
        material={materials}
        castShadow
        receiveShadow
      />
    </group>
  );
}
