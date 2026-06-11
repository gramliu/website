import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { type Group, type Object3D, ShaderMaterial } from "three";
import {
  depthFadeParsGlsl,
  fringeDepthFadeUniforms,
  updateFringeDepthFadeUniforms,
} from "./fringe-depth-fade";
import { FRINGE_CONFIG, type FringeLayout } from "./fringe-layout";
import { buildFringeLineGeometry } from "./fringe-line-geometry";

interface Props {
  layout: FringeLayout;
  /**
   * When set, the fade focus tracks this object's local position every frame
   * (the player in interactive mode) instead of staying at the layout focus.
   */
  focusSourceRef?: React.RefObject<Group | null>;
}

const lineVertexShader = `
  attribute float baseOpacity;
  attribute float lineKind;
  varying float vBaseOpacity;
  varying float vLineKind;
  varying vec3 vWorldPos;

  void main() {
    vBaseOpacity = baseOpacity;
    vLineKind = lineKind;
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const lineFragmentShader = `
  uniform float uLateralInner;
  uniform float uLateralOuter;
  uniform float uWireframeLateralInner;
  uniform float uWireframeLateralOuter;
  uniform float uTileRadialFadeStart;
  uniform float uTileRadialFadeEnd;

  varying float vBaseOpacity;
  varying float vLineKind;
  varying vec3 vWorldPos;

  ${depthFadeParsGlsl}

  void main() {
    vec3 bandWeights = fringeDepthBandWeights(vWorldPos);
    float bandFade = mix(bandWeights.y, bandWeights.z, vLineKind);

    vec3 toPoint = vWorldPos - uFocusWorld;
    vec3 viewDir = normalize(uCameraWorld - uFocusWorld);
    float lateralDist = length(cross(toPoint, viewDir));

    float lateralInner = mix(uWireframeLateralInner, uLateralInner, vLineKind);
    float lateralOuter = mix(uWireframeLateralOuter, uLateralOuter, vLineKind);
    float lateralFade = 1.0 - smoothstep(lateralInner, lateralOuter, lateralDist);

    // In radial mode tile opacity is a smooth function of distance from the
    // focus instead of the (discrete) ring row, so the ring can shift with
    // the player without visible pops.
    float radialDist = length(vWorldPos.xz - uFocusWorld.xz);
    float radialTileFade =
      1.0 - smoothstep(uTileRadialFadeStart, uTileRadialFadeEnd, radialDist);
    float baseFade =
      mix(vBaseOpacity, radialTileFade, uRadialFade * vLineKind);

    float opacity = baseFade * bandFade * lateralFade;
    if (opacity < 0.001) {
      discard;
    }

    gl_FragColor = vec4(1.0, 1.0, 1.0, opacity);
  }
`;

export default function FringeLineField({ layout, focusSourceRef }: Props) {
  const focusRef = useRef<Object3D>(null);

  const geometry = useMemo(() => buildFringeLineGeometry(layout), [layout]);

  // The layout (and therefore geometry) rebuilds as the render window moves;
  // release the GPU buffers of the previous build.
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const material = useMemo(() => {
    const { lineFade, wireframeFade, radialTileFade } = FRINGE_CONFIG;
    return new ShaderMaterial({
      uniforms: {
        ...fringeDepthFadeUniforms,
        uLateralInner: { value: lineFade.lateralInner },
        uLateralOuter: { value: lineFade.lateralOuter },
        uWireframeLateralInner: { value: wireframeFade.lateralInner },
        uWireframeLateralOuter: { value: wireframeFade.lateralOuter },
        uTileRadialFadeStart: { value: radialTileFade.start },
        uTileRadialFadeEnd: { value: radialTileFade.end },
      },
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
    });
  }, []);

  useFrame(({ camera }) => {
    if (!focusRef.current) {
      return;
    }

    const focusSource = focusSourceRef?.current;
    if (focusSource) {
      focusRef.current.position.copy(focusSource.position);
    }

    updateFringeDepthFadeUniforms(camera, focusRef.current);
  });

  const { focus } = layout;

  return (
    <>
      <object3D ref={focusRef} position={[focus.x, focus.y, focus.z]} />
      <lineSegments geometry={geometry} material={material} />
    </>
  );
}
