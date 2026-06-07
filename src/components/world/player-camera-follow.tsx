import { useFrame } from "@react-three/fiber";
import { type MutableRefObject, useMemo } from "react";
import { Vector3 } from "three";
import type { GameState } from "../../game/game";

interface PlayerCameraFollowProps {
  enabled: boolean;
  gameStateRef: MutableRefObject<GameState>;
}

export default function PlayerCameraFollow({
  enabled,
  gameStateRef,
}: PlayerCameraFollowProps) {
  const cameraOffset = useMemo(() => new Vector3(8, 6, 8), []);
  const lookOffset = useMemo(() => new Vector3(0, 1.1, 0), []);

  useFrame(({ camera }, delta) => {
    if (!enabled) {
      return;
    }

    const { position } = gameStateRef.current.player;
    const target = new Vector3(position.x, position.y, position.z).add(
      lookOffset
    );
    const desiredPosition = new Vector3(position.x, position.y, position.z).add(
      cameraOffset
    );
    const alpha = 1 - Math.exp(-8 * delta);

    camera.position.lerp(desiredPosition, alpha);
    camera.lookAt(target);
  });

  return null;
}
