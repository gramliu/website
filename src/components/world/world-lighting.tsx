import type { WorldQuality } from "./quality";

export interface WorldLightingConfig {
  ambientIntensity: number;
  sun: {
    position: [number, number, number];
    intensity: number;
    castsShadow: boolean;
    shadowMapSize: number;
    shadowCamera: {
      near: number;
      far: number;
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
    shadowBias: number;
    shadowNormalBias: number;
  };
}

const BASE_SUN = {
  position: [1, 10, 5] as [number, number, number],
  intensity: 1,
  shadowMapSize: 1024,
  shadowCamera: {
    near: 0.5,
    far: 50,
    left: -10,
    right: 10,
    top: 10,
    bottom: -10,
  },
  shadowBias: -0.0005,
  shadowNormalBias: 0.02,
};

export const WORLD_LIGHTING_CONFIG: Record<WorldQuality, WorldLightingConfig> =
  {
    full: {
      ambientIntensity: 0.5,
      sun: { ...BASE_SUN, castsShadow: true },
    },
    lite: {
      ambientIntensity: 0.5,
      sun: { ...BASE_SUN, castsShadow: false },
    },
  };

interface Props {
  quality: WorldQuality;
}

export default function WorldLighting({ quality }: Props) {
  const { ambientIntensity, sun } = WORLD_LIGHTING_CONFIG[quality];
  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={sun.position}
        intensity={sun.intensity}
        castShadow={sun.castsShadow}
        shadow-mapSize-width={sun.shadowMapSize}
        shadow-mapSize-height={sun.shadowMapSize}
        shadow-camera-near={sun.shadowCamera.near}
        shadow-camera-far={sun.shadowCamera.far}
        shadow-camera-left={sun.shadowCamera.left}
        shadow-camera-right={sun.shadowCamera.right}
        shadow-camera-top={sun.shadowCamera.top}
        shadow-camera-bottom={sun.shadowCamera.bottom}
        shadow-bias={sun.shadowBias}
        shadow-normalBias={sun.shadowNormalBias}
      />
    </>
  );
}
