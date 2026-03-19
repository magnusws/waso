"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ─── Detect mobile ─── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

/* ─── Mouse/gyroscope tracker (normalized -1 to 1) ─── */
function useMousePosition() {
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const gyroEnabled = useRef(false);

  useEffect(() => {
    // Desktop: mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    // Mobile: gyroscope tracking via DeviceOrientation
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      gyroEnabled.current = true;
      // gamma: left-right tilt (-90 to 90), map ±30° to -1..1
      const x = Math.max(-1, Math.min(1, e.gamma / 30));
      // beta: front-back tilt (0=flat, 90=upright), center around 45° (natural hold angle)
      const y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      mouse.current.targetX = x;
      mouse.current.targetY = -y;
    };

    // iOS requires a permission popup for gyro — skip it entirely.
    // Only enable gyro on Android/other where no popup is needed.
    const requestGyroPermission = () => {
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (typeof DOE.requestPermission === "function") {
        // iOS — don't request, no popup
        return;
      }
      // Android / non-iOS — just start listening (no popup)
      window.addEventListener("deviceorientation", handleOrientation, true);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Check if we're on a touch device and request gyro
    if ("ontouchstart" in window) {
      // On iOS, permission must be triggered by a user gesture.
      // We'll try on first touch. If already granted (Android), it works immediately.
      const onFirstTouch = () => {
        requestGyroPermission();
        window.removeEventListener("touchstart", onFirstTouch);
      };
      window.addEventListener("touchstart", onFirstTouch, { once: true });
      // Also try immediately for Android
      requestGyroPermission();
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  return mouse;
}

/* ─── Camera rig that follows mouse ─── */
function CameraRig({ mouse, isMobile }: { mouse: React.RefObject<{ x: number; y: number; targetX: number; targetY: number }>; isMobile: boolean }) {
  const { camera } = useThree();
  const parallaxX = isMobile ? 0.7 : 1.4;
  const parallaxY = isMobile ? 0.5 : 1.0;

  useFrame(() => {
    if (!mouse.current) return;
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.05;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.05;

    camera.position.x = mouse.current.x * parallaxX;
    camera.position.y = mouse.current.y * parallaxY;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ─── Geometry factory ─── */
function useShapeGeometry(shape: string) {
  return useMemo(() => {
    switch (shape) {
      case "torus":
        return new THREE.TorusGeometry(1, 0.4, 32, 64);
      case "donut":
        return new THREE.TorusGeometry(1, 0.55, 32, 64);
      case "capsule":
        return new THREE.CapsuleGeometry(0.5, 1, 16, 32);
      case "pill":
        return new THREE.CapsuleGeometry(0.6, 0.8, 16, 32);
      case "icosahedron":
        return new THREE.IcosahedronGeometry(1, 0); // low-poly faceted gem
      case "octahedron":
        return new THREE.OctahedronGeometry(1, 0); // diamond shape
      case "cone":
        return new THREE.ConeGeometry(0.8, 1.6, 32); // smooth tapered
      case "cylinder":
        return new THREE.CylinderGeometry(0.7, 0.7, 1.2, 32); // disc / puck
      default:
        return new THREE.SphereGeometry(1, 64, 64);
    }
  }, [shape]);
}

/* ─── Object config type ─── */
interface ObjectConfig {
  basePos: [number, number, number];
  scale: number;
  scaleVec?: [number, number, number];
  color: string;
  roughness: number;
  metalness: number;
  shape: string;
  // Animation params — unique per object so they move differently
  floatFreqX: number;
  floatFreqY: number;
  floatFreqZ: number;
  floatAmpX: number;
  floatAmpY: number;
  floatAmpZ: number;
  rotSpeed: number;
  isGlass?: boolean;
}

/* ─── Single animated mesh ─── */
function AnimatedBlob({
  config,
  meshRef,
}: {
  config: ObjectConfig;
  meshRef: React.Ref<THREE.Mesh>;
}) {
  const geometry = useShapeGeometry(config.shape);
  const s = config.scaleVec || [config.scale, config.scale, config.scale];

  if (config.isGlass) {
    return (
      <mesh ref={meshRef} scale={s} geometry={geometry}>
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.5}
          chromaticAberration={0.2}
          anisotropy={0.3}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.1}
          roughness={0.05}
          color="#e8e8e8"
          transmission={0.95}
          ior={1.5}
        />
      </mesh>
    );
  }

  return (
    <mesh ref={meshRef} scale={s} geometry={geometry}>
      <meshPhysicalMaterial
        color={config.color}
        roughness={config.roughness}
        metalness={config.metalness}
        clearcoat={0.5}
        clearcoatRoughness={0.2}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

/* ─── Compute effective radius for collision ─── */
function getCollisionRadius(config: ObjectConfig): number {
  const s = config.scaleVec
    ? Math.max(config.scaleVec[0], config.scaleVec[1], config.scaleVec[2])
    : config.scale;
  if (config.shape === "torus" || config.shape === "donut") return s * 0.8;
  if (config.shape === "capsule" || config.shape === "pill") return s * 0.7;
  if (config.shape === "cone" || config.shape === "cylinder") return s * 0.75;
  if (config.shape === "octahedron" || config.shape === "icosahedron") return s * 0.85;
  return s;
}

/* ─── The full scene with collision-aware objects ─── */
function SceneContent() {
  const mouse = useMousePosition();
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // For portrait viewports, compress X positions to fit narrow screen
  const mobileCompression = useMemo(() => {
    const aspect = viewport.width / viewport.height;
    if (aspect < 0.7) return { scaleX: 0.45, scaleY: 0.75, groupScale: 1.4 };
    if (aspect < 1) return { scaleX: 0.55, scaleY: 0.85, groupScale: 1.25 };
    return { scaleX: 1, scaleY: 1, groupScale: 1 };
  }, [viewport.width, viewport.height]);

  // Warm cream palette
  const palette = useMemo(() => ({
    matteWhite: "#e8e8e8",
    silver: "#b8b8b8",
    coolGrey: "#9a9a9a",
    slate: "#6e6e6e",
    charcoal: "#3a3a3a",
    fog: "#d4d4d4",
    pearl: "#f0eded",
    stone: "#a8a8a8",
    ash: "#c8c8c8",
    graphite: "#585858",
  }), []);

  // Define all objects
  const objectConfigs = useMemo<ObjectConfig[]>(() => [
    // Large corner blobs
    { basePos: [-7, 3.5, -2], scale: 2.8, color: palette.pearl, roughness: 0.1, metalness: 0.05, shape: "sphere", floatFreqX: 0.13, floatFreqY: 0.17, floatFreqZ: 0.11, floatAmpX: 0.15, floatAmpY: 0.12, floatAmpZ: 0.08, rotSpeed: 0.08 },
    { basePos: [7.5, -3, -1.5], scale: 1.8, scaleVec: [2.2, 1.4, 1.8], color: palette.slate, roughness: 0.15, metalness: 0.6, shape: "icosahedron", floatFreqX: 0.11, floatFreqY: 0.14, floatFreqZ: 0.09, floatAmpX: 0.12, floatAmpY: 0.10, floatAmpZ: 0.07, rotSpeed: 0.06 },
    { basePos: [6.5, 3.5, -1], scale: 2.0, color: palette.coolGrey, roughness: 0.25, metalness: 0.4, shape: "sphere", floatFreqX: 0.15, floatFreqY: 0.12, floatFreqZ: 0.10, floatAmpX: 0.14, floatAmpY: 0.11, floatAmpZ: 0.09, rotSpeed: 0.07 },
    { basePos: [-6.5, -3.8, 0], scale: 2.2, color: palette.fog, roughness: 0.2, metalness: 0.1, shape: "sphere", floatFreqX: 0.10, floatFreqY: 0.16, floatFreqZ: 0.12, floatAmpX: 0.13, floatAmpY: 0.10, floatAmpZ: 0.08, rotSpeed: 0.05 },
    // Mid-size orbit
    { basePos: [-4.5, -3, 1], scale: 1.4, color: palette.silver, roughness: 0.1, metalness: 0.7, shape: "capsule", floatFreqX: 0.18, floatFreqY: 0.22, floatFreqZ: 0.15, floatAmpX: 0.18, floatAmpY: 0.15, floatAmpZ: 0.10, rotSpeed: 0.12 },
    { basePos: [4.5, 4, 0.5], scale: 1.2, color: palette.ash, roughness: 0.3, metalness: 0.2, shape: "pill", floatFreqX: 0.20, floatFreqY: 0.15, floatFreqZ: 0.18, floatAmpX: 0.16, floatAmpY: 0.14, floatAmpZ: 0.09, rotSpeed: 0.10 },
    { basePos: [8, 0.5, -2], scale: 1.2, scaleVec: [1.5, 1.0, 1.2], color: palette.graphite, roughness: 0.1, metalness: 0.8, shape: "octahedron", floatFreqX: 0.14, floatFreqY: 0.19, floatFreqZ: 0.11, floatAmpX: 0.12, floatAmpY: 0.10, floatAmpZ: 0.07, rotSpeed: 0.07 },
    { basePos: [-8, 1, -1.5], scale: 1.1, color: palette.matteWhite, roughness: 0.15, metalness: 0.05, shape: "sphere", floatFreqX: 0.22, floatFreqY: 0.16, floatFreqZ: 0.19, floatAmpX: 0.18, floatAmpY: 0.15, floatAmpZ: 0.11, rotSpeed: 0.13 },
    // Torus / ring shapes
    { basePos: [-3.5, 4.5, -1], scale: 1.1, color: palette.stone, roughness: 0.15, metalness: 0.5, shape: "torus", floatFreqX: 0.16, floatFreqY: 0.13, floatFreqZ: 0.20, floatAmpX: 0.14, floatAmpY: 0.12, floatAmpZ: 0.08, rotSpeed: 0.15 },
    { basePos: [3.5, -4.5, 0], scale: 1.2, color: palette.charcoal, roughness: 0.2, metalness: 0.6, shape: "donut", floatFreqX: 0.12, floatFreqY: 0.18, floatFreqZ: 0.14, floatAmpX: 0.13, floatAmpY: 0.11, floatAmpZ: 0.09, rotSpeed: 0.09 },
    { basePos: [0, -5, -1.5], scale: 0.9, color: palette.silver, roughness: 0.1, metalness: 0.7, shape: "torus", floatFreqX: 0.19, floatFreqY: 0.14, floatFreqZ: 0.17, floatAmpX: 0.15, floatAmpY: 0.13, floatAmpZ: 0.10, rotSpeed: 0.11 },
    // Smaller accent shapes
    { basePos: [-8.5, 4, -3.5], scale: 0.8, color: palette.fog, roughness: 0.08, metalness: 0.1, shape: "sphere", floatFreqX: 0.25, floatFreqY: 0.20, floatFreqZ: 0.22, floatAmpX: 0.20, floatAmpY: 0.18, floatAmpZ: 0.12, rotSpeed: 0.16 },
    { basePos: [8.5, -4, -2.5], scale: 0.7, color: palette.coolGrey, roughness: 0.1, metalness: 0.5, shape: "capsule", floatFreqX: 0.21, floatFreqY: 0.17, floatFreqZ: 0.24, floatAmpX: 0.18, floatAmpY: 0.16, floatAmpZ: 0.10, rotSpeed: 0.14 },
    { basePos: [2, -5, -1.5], scale: 0.75, color: palette.slate, roughness: 0.2, metalness: 0.6, shape: "cone", floatFreqX: 0.17, floatFreqY: 0.23, floatFreqZ: 0.13, floatAmpX: 0.16, floatAmpY: 0.14, floatAmpZ: 0.09, rotSpeed: 0.12 },
    { basePos: [-5.5, 5, -2.5], scale: 0.65, color: palette.ash, roughness: 0.12, metalness: 0.3, shape: "pill", floatFreqX: 0.23, floatFreqY: 0.19, floatFreqZ: 0.21, floatAmpX: 0.19, floatAmpY: 0.17, floatAmpZ: 0.11, rotSpeed: 0.17 },
    { basePos: [6.5, 5, -1.5], scale: 0.55, color: palette.matteWhite, roughness: 0.15, metalness: 0.1, shape: "sphere", floatFreqX: 0.26, floatFreqY: 0.21, floatFreqZ: 0.18, floatAmpX: 0.22, floatAmpY: 0.18, floatAmpZ: 0.13, rotSpeed: 0.18 },
    { basePos: [-2, 5.5, -2], scale: 0.5, color: palette.graphite, roughness: 0.1, metalness: 0.7, shape: "torus", floatFreqX: 0.20, floatFreqY: 0.25, floatFreqZ: 0.16, floatAmpX: 0.17, floatAmpY: 0.15, floatAmpZ: 0.10, rotSpeed: 0.15 },
    { basePos: [2, 5, -1], scale: 0.55, color: palette.stone, roughness: 0.2, metalness: 0.4, shape: "sphere", floatFreqX: 0.24, floatFreqY: 0.18, floatFreqZ: 0.22, floatAmpX: 0.20, floatAmpY: 0.16, floatAmpZ: 0.12, rotSpeed: 0.14 },
    // Glass blobs
    { basePos: [5, 2, 1.5], scale: 1.4, color: "#e0e0e0", roughness: 0.05, metalness: 0, shape: "sphere", floatFreqX: 0.12, floatFreqY: 0.16, floatFreqZ: 0.10, floatAmpX: 0.10, floatAmpY: 0.08, floatAmpZ: 0.06, rotSpeed: 0.06, isGlass: true },
    { basePos: [-5, -2, 1], scale: 1.0, color: "#e0e0e0", roughness: 0.05, metalness: 0, shape: "donut", floatFreqX: 0.14, floatFreqY: 0.11, floatFreqZ: 0.15, floatAmpX: 0.12, floatAmpY: 0.10, floatAmpZ: 0.07, rotSpeed: 0.08, isGlass: true },
    { basePos: [3, -3.5, 2], scale: 0.7, color: "#e0e0e0", roughness: 0.05, metalness: 0, shape: "sphere", floatFreqX: 0.18, floatFreqY: 0.14, floatFreqZ: 0.20, floatAmpX: 0.14, floatAmpY: 0.12, floatAmpZ: 0.08, rotSpeed: 0.10, isGlass: true },
  ], [palette]);

  // Create refs for all meshes
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const collisionRadii = useMemo(() => objectConfigs.map(getCollisionRadius), [objectConfigs]);

  // Temp vectors for collision math
  const _v1 = useMemo(() => new THREE.Vector3(), []);
  const _v2 = useMemo(() => new THREE.Vector3(), []);
  const _diff = useMemo(() => new THREE.Vector3(), []);

  // Animation + collision loop
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Idle group rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.07) * 0.15;
      groupRef.current.rotation.x = Math.cos(t * 0.05) * 0.08;
    }

    // 1. Apply sine-wave floating animation to each mesh (amplified)
    const ampScale = 1.5; // boost all float amplitudes
    const { scaleX, scaleY } = mobileCompression;
    for (let i = 0; i < objectConfigs.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const c = objectConfigs[i];
      mesh.position.set(
        (c.basePos[0] + Math.sin(t * c.floatFreqX) * c.floatAmpX * ampScale) * scaleX,
        (c.basePos[1] + Math.sin(t * c.floatFreqY + 1.5) * c.floatAmpY * ampScale) * scaleY,
        c.basePos[2] + Math.sin(t * c.floatFreqZ + 3.0) * c.floatAmpZ * ampScale,
      );
      // Gentle rotation
      mesh.rotation.x = Math.sin(t * c.rotSpeed) * 0.4;
      mesh.rotation.y = Math.cos(t * c.rotSpeed * 0.8) * 0.4;
    }

    // 2. Resolve sphere-sphere collisions — multiple passes for robust separation
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < objectConfigs.length; i++) {
        const meshA = meshRefs.current[i];
        if (!meshA) continue;
        for (let j = i + 1; j < objectConfigs.length; j++) {
          const meshB = meshRefs.current[j];
          if (!meshB) continue;

          _v1.copy(meshA.position);
          _v2.copy(meshB.position);
          _diff.subVectors(_v1, _v2);

          const dist = _diff.length();
          const minDist = (collisionRadii[i] + collisionRadii[j]) * 1.15; // 1.15 for visible gap between objects

          if (dist < minDist && dist > 0.001) {
            const overlap = minDist - dist;
            _diff.normalize();
            // Push both apart equally
            const push = overlap * 0.55;
            meshA.position.addScaledVector(_diff, push);
            meshB.position.addScaledVector(_diff, -push);
          }
        }
      }
    }
  });

  return (
    <>
      <CameraRig mouse={mouse} isMobile={isMobile} />

      {/* Lighting — cool white/neutral */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#e0e8f0" />
      <pointLight position={[0, 5, 0]} intensity={0.4} color="#f0f0ff" />

      <Environment preset="studio" environmentIntensity={0.8} />

      <group ref={groupRef} scale={mobileCompression.groupScale}>
        {objectConfigs.map((config, i) => (
          <AnimatedBlob
            key={i}
            config={config}
            meshRef={(el: THREE.Mesh | null) => { meshRefs.current[i] = el; }}
          />
        ))}
      </group>
    </>
  );
}

/* ─── Exported canvas wrapper ─── */
export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
    >
      <SceneContent />
    </Canvas>
  );
}
