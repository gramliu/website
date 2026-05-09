import {
  Center,
  ContactShadows,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Keycap } from "./keycap";

type KeyCode = "KeyW" | "KeyA" | "KeyS" | "KeyD" | "Space";

interface KeyboardKey {
  code: KeyCode;
  label: string;
  position: [number, number, number];
  width?: number;
  depth?: number;
  row?: number;
}

const KEY_LAYOUT: KeyboardKey[] = [
  { code: "KeyW", label: "W", position: [0, 0, -1.05], row: 1 },
  { code: "KeyA", label: "A", position: [-1.05, 0, 0], row: 2 },
  { code: "KeyS", label: "S", position: [0, 0, 0], row: 2 },
  { code: "KeyD", label: "D", position: [1.05, 0, 0], row: 2 },
  {
    code: "Space",
    label: "Space",
    position: [0, 0, 1.42],
    width: 3.2,
    depth: 0.8,
    row: 3,
  },
];

const TRACKED_CODES = new Set<KeyCode>(KEY_LAYOUT.map((key) => key.code));

function isTrackedKey(code: string): code is KeyCode {
  return TRACKED_CODES.has(code as KeyCode);
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

function usePressedKeys() {
  const [pressedKeys, setPressedKeys] = useState<Set<KeyCode>>(new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTrackedKey(event.code) || isEditableTarget(event.target)) {
        return;
      }

      const keyCode = event.code;
      event.preventDefault();
      setPressedKeys((current) => {
        if (current.has(keyCode)) {
          return current;
        }

        const next = new Set(current);
        next.add(keyCode);
        return next;
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isTrackedKey(event.code) || isEditableTarget(event.target)) {
        return;
      }

      const keyCode = event.code;
      event.preventDefault();
      setPressedKeys((current) => {
        if (!current.has(keyCode)) {
          return current;
        }

        const next = new Set(current);
        next.delete(keyCode);
        return next;
      });
    };

    const clearPressedKeys = () => setPressedKeys(new Set());

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("blur", clearPressedKeys);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("blur", clearPressedKeys);
    };
  }, []);

  return pressedKeys;
}

function KeyboardScene({ pressedKeys }: { pressedKeys: Set<KeyCode> }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[0, 5, 4]} intensity={1.45} castShadow />
      <Center>
        <group rotation={[Math.PI / 6, 0, 0]}>
          <RoundedBox
            args={[4.6, 0.22, 3.9]}
            radius={0.12}
            smoothness={4}
            position={[0, 0.05, 0.22]}
            receiveShadow
          >
            <meshStandardMaterial
              color="#263140"
              roughness={0.58}
              metalness={0.18}
            />
          </RoundedBox>
          <RoundedBox
            args={[4.9, 0.18, 4.2]}
            radius={0.14}
            smoothness={4}
            position={[0, -0.1, 0.22]}
            receiveShadow
          >
            <meshStandardMaterial
              color="#9fa4a8"
              roughness={0.42}
              metalness={0.35}
            />
          </RoundedBox>
          {KEY_LAYOUT.map((key) => (
            <Keycap
              key={key.code}
              label={key.label}
              position={key.position}
              width={key.width}
              depth={key.depth}
              row={key.row}
              pressed={pressedKeys.has(key.code)}
            />
          ))}
        </group>
      </Center>
      <ContactShadows
        position={[0, -0.28, 0]}
        opacity={0.35}
        scale={6}
        blur={2}
        far={3}
      />
      <OrbitControls enableZoom={false} enablePan={false} enabled={false} />
    </>
  );
}

export default function KeyboardPreview() {
  const pressedKeys = usePressedKeys();

  return (
    <div className="h-[240px] w-full overflow-visible">
      <Canvas
        camera={{
          position: [0, 3.35, 5.35],
          fov: 40,
        }}
        shadows
      >
        <KeyboardScene pressedKeys={pressedKeys} />
      </Canvas>
    </div>
  );
}
