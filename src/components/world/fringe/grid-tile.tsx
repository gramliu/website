import { useFrame } from "@react-three/fiber";
import { type MutableRefObject, useLayoutEffect, useRef } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  type LineDashedMaterial,
  type LineSegments,
} from "three";

interface Props {
  x: number;
  z: number;
  y: number;
  opacity: number;
  row: number;
  dashOffsetRef: MutableRefObject<number>;
  rowDashStagger: number;
}

function createTileGeometry(): BufferGeometry {
  // Bottom face outline of a 1x1 block on the XZ plane (local y = 0).
  const geometry = new BufferGeometry();
  const vertices = new Float32Array([
    0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0,
  ]);

  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  return geometry;
}

const tileGeometry = createTileGeometry();

export default function GridTile({
  x,
  z,
  y,
  opacity,
  row,
  dashOffsetRef,
  rowDashStagger,
}: Props) {
  const lineRef = useRef<LineSegments>(null);
  const materialRef = useRef<LineDashedMaterial>(null);

  useLayoutEffect(() => {
    lineRef.current?.computeLineDistances();
  }, []);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.scale = dashOffsetRef.current + row * rowDashStagger;
    }
  });

  return (
    <lineSegments ref={lineRef} geometry={tileGeometry} position={[x, y, z]}>
      <lineDashedMaterial
        ref={materialRef}
        color="#ffffff"
        dashSize={0.12}
        gapSize={0.08}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </lineSegments>
  );
}
