import { BoxGeometry, EdgesGeometry } from "three";

interface Props {
  x: number;
  y: number;
  z: number;
  opacity?: number;
}

const boxGeometry = new BoxGeometry(1, 1, 1);
const edgesGeometry = new EdgesGeometry(boxGeometry);

export default function WireframeBlock({ x, y, z, opacity = 0.9 }: Props) {
  return (
    <group position={[x, y, z]}>
      <lineSegments geometry={edgesGeometry} position={[0.5, 0.5, 0.5]}>
        <lineBasicMaterial color="#ffffff" transparent opacity={opacity} />
      </lineSegments>
    </group>
  );
}
