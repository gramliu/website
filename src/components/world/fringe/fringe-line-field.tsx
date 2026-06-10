import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { type Object3D, ShaderMaterial } from "three";
import {
  depthFadeParsGlsl,
  fringeDepthFadeUniforms,
  updateFringeDepthFadeUniforms,
} from "./fringe-depth-fade";
import { FRINGE_CONFIG, type FringeLayout } from "./fringe-layout";
import { buildFringeLineGeometry } from "./fringe-line-geometry";

interface Props {
  layout: FringeLayout;
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

    float opacity = vBaseOpacity * bandFade * lateralFade;
    if (opacity < 0.001) {
      discard;
    }

    gl_FragColor = vec4(1.0, 1.0, 1.0, opacity);
  }
`;

export default function FringeLineField({ layout }: Props) {
  const focusRef = useRef<Object3D>(null);

  const geometry = useMemo(() => buildFringeLineGeometry(layout), [layout]);

  const material = useMemo(() => {
    const { lineFade, wireframeFade } = FRINGE_CONFIG;
    return new ShaderMaterial({
      uniforms: {
        ...fringeDepthFadeUniforms,
        uLateralInner: { value: lineFade.lateralInner },
        uLateralOuter: { value: lineFade.lateralOuter },
        uWireframeLateralInner: { value: wireframeFade.lateralInner },
        uWireframeLateralOuter: { value: wireframeFade.lateralOuter },
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
