import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { type Object3D, ShaderMaterial, Vector3 } from "three";
import { FRINGE_CONFIG, type FringeLayout } from "./fringe-layout";
import { buildFringeLineGeometry } from "./fringe-line-geometry";

interface Props {
  layout: FringeLayout;
}

const lineVertexShader = `
  attribute float baseOpacity;
  attribute float lineKind;
  attribute float fidelity;
  attribute float lodOpacity;
  varying float vBaseOpacity;
  varying float vLineKind;
  varying float vFidelity;
  varying float vLodOpacity;
  varying vec3 vWorldPos;

  void main() {
    vBaseOpacity = baseOpacity;
    vLineKind = lineKind;
    vFidelity = fidelity;
    vLodOpacity = lodOpacity;
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const lineFragmentShader = `
  uniform vec3 uCameraWorld;
  uniform vec3 uFocusWorld;
  uniform float uBackFadeStart;
  uniform float uBackFadeEnd;
  uniform float uLateralInner;
  uniform float uLateralOuter;
  uniform float uWireframeLateralInner;
  uniform float uWireframeLateralOuter;

  varying float vBaseOpacity;
  varying float vLineKind;
  varying float vFidelity;
  varying float vLodOpacity;
  varying vec3 vWorldPos;

  void main() {
    vec3 toPoint = vWorldPos - uFocusWorld;
    vec3 toCamera = uCameraWorld - uFocusWorld;

    float viewAlignment = dot(
      normalize(toPoint),
      normalize(toCamera)
    );
    float backFade = smoothstep(uBackFadeEnd, uBackFadeStart, viewAlignment);

    vec3 viewDir = normalize(toCamera);
    float lateralDist = length(cross(toPoint, viewDir));

    float lateralInner = mix(uWireframeLateralInner, uLateralInner, vLineKind);
    float lateralOuter = mix(uWireframeLateralOuter, uLateralOuter, vLineKind);
    float lateralFade = 1.0 - smoothstep(lateralInner, lateralOuter, lateralDist);

    float fidelityPulse = mix(1.0, 0.82 + 0.18 * vFidelity, 1.0 - vLineKind);
    float opacity = vBaseOpacity * vLodOpacity * fidelityPulse * backFade * lateralFade;
    if (opacity < 0.001) {
      discard;
    }

    gl_FragColor = vec4(1.0, 1.0, 1.0, opacity);
  }
`;

const cameraWorld = new Vector3();
const focusWorld = new Vector3();

export default function FringeLineField({ layout }: Props) {
  const focusRef = useRef<Object3D>(null);

  const geometry = useMemo(() => buildFringeLineGeometry(layout), [layout]);

  const material = useMemo(() => {
    const { lineFade, wireframeFade } = FRINGE_CONFIG;
    return new ShaderMaterial({
      uniforms: {
        uCameraWorld: { value: new Vector3() },
        uFocusWorld: { value: new Vector3() },
        uBackFadeStart: { value: lineFade.backFadeStart },
        uBackFadeEnd: { value: lineFade.backFadeEnd },
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

    camera.getWorldPosition(cameraWorld);
    focusRef.current.getWorldPosition(focusWorld);

    material.uniforms.uCameraWorld.value.copy(cameraWorld);
    material.uniforms.uFocusWorld.value.copy(focusWorld);
  });

  const { focus } = layout;

  return (
    <>
      <object3D ref={focusRef} position={[focus.x, focus.y, focus.z]} />
      <lineSegments geometry={geometry} material={material} />
    </>
  );
}
