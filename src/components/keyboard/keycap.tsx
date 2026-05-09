import { RoundedBox, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

interface KeycapProps {
  label: string;
  position: [number, number, number];
  width?: number;
  depth?: number;
  pressed: boolean;
}

const KEY_HEIGHT = 0.36;
const REST_Y = 0.38;
const PRESSED_Y = 0.18;

export function Keycap({
  label,
  position,
  width = 0.9,
  depth = 0.9,
  pressed,
}: KeycapProps) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    const targetY = pressed ? PRESSED_Y : REST_Y;
    const targetRotationX = pressed ? -0.08 : 0;
    const smoothing = Math.min(1, delta * 18);

    groupRef.current.position.y +=
      (targetY - groupRef.current.position.y) * smoothing;
    groupRef.current.rotation.x +=
      (targetRotationX - groupRef.current.rotation.x) * smoothing;
  });

  return (
    <group ref={groupRef} position={[position[0], REST_Y, position[2]]}>
      <RoundedBox
        args={[width, KEY_HEIGHT, depth]}
        radius={0.08}
        smoothness={4}
      >
        <meshStandardMaterial
          color={pressed ? "#d6e0e4" : "#edf4f7"}
          roughness={0.65}
          metalness={0.05}
        />
      </RoundedBox>
      <Text
        color="#ef4438"
        fontSize={label === "Space" ? 0.18 : 0.28}
        anchorX="center"
        anchorY="middle"
        position={[0, KEY_HEIGHT / 2 + 0.012, -0.05]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {label}
      </Text>
    </group>
  );
}
