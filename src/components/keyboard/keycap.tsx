import { RoundedBox, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, type Group } from "three";

interface KeycapProps {
  label: string;
  position: [number, number, number];
  width?: number;
  depth?: number;
  pressed: boolean;
}

const KEY_HEIGHT = 0.62;
const TOP_SURFACE_HEIGHT = 0.12;
const REST_Y = 0.52;
const PRESSED_Y = 0.18;
const TOP_INSET = 0.22;

function createKeycapBodyGeometry(
  width: number,
  height: number,
  depth: number
) {
  const topWidth = width - TOP_INSET;
  const topDepth = depth - TOP_INSET;
  const bottomX = width / 2;
  const bottomZ = depth / 2;
  const topX = topWidth / 2;
  const topZ = topDepth / 2;
  const bottomY = -height / 2;
  const topY = height / 2;

  const positions = new Float32Array([
    -bottomX,
    bottomY,
    -bottomZ,
    bottomX,
    bottomY,
    -bottomZ,
    bottomX,
    bottomY,
    bottomZ,
    -bottomX,
    bottomY,
    bottomZ,
    -topX,
    topY,
    -topZ,
    topX,
    topY,
    -topZ,
    topX,
    topY,
    topZ,
    -topX,
    topY,
    topZ,
  ]);

  const indices = [
    0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7, 4,
    5, 6, 4, 6, 7, 3, 2, 1, 3, 1, 0,
  ];

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export function Keycap({
  label,
  position,
  width = 0.9,
  depth = 0.9,
  pressed,
}: KeycapProps) {
  const groupRef = useRef<Group>(null);
  const topWidth = width - TOP_INSET;
  const topDepth = depth - TOP_INSET;
  const bodyGeometry = useMemo(
    () => createKeycapBodyGeometry(width, KEY_HEIGHT, depth),
    [width, depth]
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
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={pressed ? "#8f9da3" : "#d3dee3"}
          roughness={0.72}
          metalness={0.04}
        />
      </mesh>
      <RoundedBox
        args={[topWidth, TOP_SURFACE_HEIGHT, topDepth]}
        radius={0.07}
        smoothness={4}
        position={[0, KEY_HEIGHT / 2 + TOP_SURFACE_HEIGHT / 2 - 0.02, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={pressed ? "#9aa8ae" : "#edf4f7"}
          roughness={0.65}
          metalness={0.05}
        />
      </RoundedBox>
      <Text
        color="#ef4438"
        fontSize={label === "Space" ? 0.18 : 0.28}
        anchorX="center"
        anchorY="middle"
        position={[0, KEY_HEIGHT / 2 + TOP_SURFACE_HEIGHT + 0.005, -0.05]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {label}
      </Text>
    </group>
  );
}
