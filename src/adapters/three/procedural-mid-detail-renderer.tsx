import type { MidDetailColumn } from "../../game/world/procedural/render-snapshot";

interface Props {
  columns: MidDetailColumn[];
}

function colorForBlockId(blockId: number): string {
  switch (blockId) {
    case 2:
      return "#6aa84f";
    case 3:
      return "#7a5634";
    case 9:
      return "#4c8fbd";
    case 12:
      return "#d8c98f";
    default:
      return "#8a8a8a";
  }
}

export default function ProceduralMidDetailRenderer({ columns }: Props) {
  return (
    <>
      {columns.map((column) => {
        const height = Math.max(1, column.height - column.y + 1);
        return (
          <mesh
            key={`${column.x}-${column.z}`}
            position={[column.x + 0.5, column.y + height / 2, column.z + 0.5]}
            scale={[1, height, 1]}
            receiveShadow
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={colorForBlockId(column.surfaceBlockId)}
              opacity={column.opacity * 0.55}
              transparent
              depthWrite={false}
              roughness={1}
              metalness={0}
            />
          </mesh>
        );
      })}
    </>
  );
}
