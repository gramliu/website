import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useRef } from "react";
import { type Group, Vector3 } from "three";
import { useCameraControls } from "../../adapters/input/camera/context";
import { readGestures } from "../../adapters/input/camera/gestures";

const UP = new Vector3(0, 1, 0);

/** Follows the rendered player (including the terrain counter-translation). */
export function useCameraOrbit(player: RefObject<Group>, interactive: boolean) {
  const input = useCameraControls();
  const { camera, controls } = useThree();
  const orbit = controls as unknown as {
    target: Vector3;
    update: () => void;
  } | null;
  const session = useRef<{
    position: Vector3;
    target: Vector3;
    offset: Vector3;
  } | null>(null);
  const pivot = useRef(new Vector3());

  const restore = () => {
    const saved = session.current;
    if (!saved) return;
    camera.position.copy(saved.position);
    if (orbit) {
      orbit.target.copy(saved.target);
      orbit.update();
    }
    camera.lookAt(saved.target);
    session.current = null;
  };
  useEffect(() => () => restore(), [camera, orbit]);

  useFrame((_, delta) => {
    if (!interactive) {
      restore();
      return;
    }
    if (!player.current || (!input && !session.current)) return;
    player.current.getWorldPosition(pivot.current);
    pivot.current.y += 0.8;
    if (!session.current) {
      const target = orbit?.target.clone() ?? new Vector3();
      session.current = {
        position: camera.position.clone(),
        target,
        // Preserve the current elevation and viewing distance when centering.
        offset: camera.position.clone().sub(target),
      };
    }
    const turn = input
      ? readGestures(input.current, performance.now()).turn
      : 0;
    session.current.offset.applyAxisAngle(
      UP,
      -turn * 1.4 * Math.min(delta, 0.05)
    );
    camera.position.copy(pivot.current).add(session.current.offset);
    if (orbit) orbit.target.copy(pivot.current);
    camera.lookAt(pivot.current);
  });
}
