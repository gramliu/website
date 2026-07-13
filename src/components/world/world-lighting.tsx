import { WORLD_QUALITY_PROFILES, type WorldQuality } from "./quality";

const BASE_SUN = {
  position: [1, 10, 5] as [number, number, number],
  intensity: 1,
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

interface Props {
  quality: WorldQuality;
}

export default function WorldLighting({ quality }: Props) {
  const qualityProfile = WORLD_QUALITY_PROFILES[quality];
  const ambientIntensity = 0.5;
  const sun = BASE_SUN;
  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={sun.position}
        intensity={sun.intensity}
        castShadow={qualityProfile.shadows}
        shadow-mapSize-width={qualityProfile.shadowMapSize}
        shadow-mapSize-height={qualityProfile.shadowMapSize}
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
