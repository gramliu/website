import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  type Object3D,
  type Points,
  ShaderMaterial,
} from "three";
import {
  pickWeightedTile,
  randomInRange,
  randomPointOnTileEdge,
} from "./fringe-animation";
import {
  FRINGE_CONFIG,
  type FringeFocus,
  type FringeGridTile,
} from "./fringe-layout";
import { computeTileSpawnWeights } from "./fringe-view-fade";

interface Particle {
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  vz: number;
}

interface Props {
  tiles: FringeGridTile[];
  y: number;
  focus: FringeFocus;
}

const particleVertexShader = `
  attribute float opacity;
  uniform float size;
  varying float vOpacity;

  void main() {
    vOpacity = opacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragmentShader = `
  varying float vOpacity;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    if (dot(center, center) > 0.0625) discard;
    gl_FragColor = vec4(1.0, 1.0, 1.0, vOpacity * 0.7);
  }
`;

export default function FringeParticleField({ tiles, y, focus }: Props) {
  const pointsRef = useRef<Points>(null);
  const focusRef = useRef<Object3D>(null);
  const spawnBudgetRef = useRef(0);
  const activeIndicesRef = useRef<number[]>([]);
  const freeIndicesRef = useRef<number[]>([]);
  const spawnWeightsRef = useRef<number[]>([]);

  const { poolSize, positions, opacities, particles } = useMemo(() => {
    const size = FRINGE_CONFIG.particlePoolSize;
    const pos = new Float32Array(size * 3);
    const ops = new Float32Array(size);
    const pool: Particle[] = Array.from({ length: size }, () => ({
      life: 0,
      maxLife: 0,
      vx: 0,
      vy: 0,
      vz: 0,
    }));

    freeIndicesRef.current = Array.from({ length: size }, (_, index) => index);
    activeIndicesRef.current = [];

    return {
      poolSize: size,
      positions: pos,
      opacities: ops,
      particles: pool,
    };
  }, []);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("opacity", new BufferAttribute(opacities, 1));
    return geo;
  }, [positions, opacities]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          size: { value: FRINGE_CONFIG.particleSize },
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  function acquireSlot(): number {
    const free = freeIndicesRef.current;
    if (free.length > 0) {
      return free.pop() as number;
    }

    return Math.floor(Math.random() * poolSize);
  }

  function releaseSlot(index: number): void {
    opacities[index] = 0;
    freeIndicesRef.current.push(index);
  }

  function spawnParticle(index: number, tile: FringeGridTile): void {
    const [px, , pz] = randomPointOnTileEdge(tile.x, tile.z);
    const [ox, oz] = tile.outward;
    const speed = randomInRange(0.3, 0.6);

    const particle = particles[index];
    particle.life = randomInRange(
      FRINGE_CONFIG.particleMinLife,
      FRINGE_CONFIG.particleMaxLife
    );
    particle.maxLife = particle.life;
    particle.vx = ox * speed + randomInRange(-0.05, 0.05);
    particle.vy = randomInRange(0.15, 0.35);
    particle.vz = oz * speed + randomInRange(-0.05, 0.05);

    positions[index * 3] = px;
    positions[index * 3 + 1] = y + 0.01;
    positions[index * 3 + 2] = pz;
    opacities[index] = 1;
  }

  useFrame(({ camera }, delta) => {
    if (tiles.length === 0 || !focusRef.current?.parent) {
      return;
    }

    if (spawnWeightsRef.current.length !== tiles.length) {
      spawnWeightsRef.current = Array.from({ length: tiles.length }, () => 0);
    }

    const totalSpawnWeight = computeTileSpawnWeights(
      tiles,
      y,
      focusRef.current.parent,
      camera,
      focusRef.current,
      spawnWeightsRef.current
    );

    let needsUpdate = false;

    spawnBudgetRef.current += delta * FRINGE_CONFIG.particlesPerSecond;
    while (spawnBudgetRef.current >= 1) {
      spawnBudgetRef.current -= 1;

      if (totalSpawnWeight <= 0) {
        continue;
      }

      const tile = pickWeightedTile(tiles, spawnWeightsRef.current);
      if (!tile) {
        continue;
      }

      const index = acquireSlot();
      const wasActive = particles[index].life > 0;
      spawnParticle(index, tile);
      if (!wasActive) {
        activeIndicesRef.current.push(index);
      }
      needsUpdate = true;
    }

    const active = activeIndicesRef.current;
    for (let i = active.length - 1; i >= 0; i--) {
      const index = active[i];
      const particle = particles[index];

      particle.life -= delta;
      if (particle.life <= 0) {
        releaseSlot(index);
        active[i] = active[active.length - 1];
        active.pop();
        needsUpdate = true;
        continue;
      }

      particle.vy -= FRINGE_CONFIG.particleGravity * delta;

      positions[index * 3] += particle.vx * delta;
      positions[index * 3 + 1] += particle.vy * delta;
      positions[index * 3 + 2] += particle.vz * delta;

      opacities[index] = Math.max(0, particle.life / particle.maxLife);
      needsUpdate = true;
    }

    if (needsUpdate && pointsRef.current) {
      const positionAttr = geometry.getAttribute("position") as BufferAttribute;
      const opacityAttr = geometry.getAttribute("opacity") as BufferAttribute;
      positionAttr.needsUpdate = true;
      opacityAttr.needsUpdate = true;
    }
  });

  return (
    <>
      <object3D ref={focusRef} position={[focus.x, focus.y, focus.z]} />
      <points ref={pointsRef} geometry={geometry} material={material} />
    </>
  );
}
