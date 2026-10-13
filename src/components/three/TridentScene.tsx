"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Environment, Lightformer, Line, MeshDistortMaterial } from "@react-three/drei";
import { damp, damp3 } from "maath/easing";
import { sceneStore, type Focus } from "@/lib/scene-store";
import type { PersonaKey } from "@/lib/i18n";

type V3 = [number, number, number];

const NODES: Record<PersonaKey, { pos: V3; color: string }> = {
  patient: { pos: [-2.5, 1.35, 0], color: "#ff6b4a" },
  pharmacy: { pos: [0, -2.15, 0.5], color: "#10b981" },
  clinic: { pos: [2.5, 1.35, -0.3], color: "#5b6cff" },
};
const KEYS = Object.keys(NODES) as PersonaKey[];
const PAIRS: [PersonaKey, PersonaKey][] = [
  ["pharmacy", "patient"],
  ["patient", "clinic"],
  ["clinic", "pharmacy"],
];

// Shared mutable inputs read inside the render loop (no React re-renders).
const input = { mx: 0, my: 0 };

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.25, "rgba(255,255,255,0.45)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Node({ k, glow, reduced }: { k: PersonaKey; glow: THREE.Texture; reduced: boolean }) {
  const { pos, color } = NODES[k];
  const group = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const halo = useRef<THREE.SpriteMaterial>(null!);
  const seed = useMemo(() => Math.random() * 10, []);

  useFrame((s, dt) => {
    const st = sceneStore.get();
    const active = st.hover === k || st.focus === k;
    const dim = (st.hover && st.hover !== k) || (st.focus !== "home" && st.focus !== "other" && st.focus !== k);
    const target = active ? 1.28 : dim ? 0.86 : 1;
    damp3(group.current.scale, [target, target, target], 0.25, dt);
    const t = s.clock.elapsedTime + seed;
    if (!reduced) {
      group.current.position.y = pos[1] + Math.sin(t * 0.8) * 0.12;
      ring.current.rotation.x = t * 0.5;
      ring.current.rotation.y = t * 0.3;
      ring2.current.rotation.y = -t * 0.4;
      ring2.current.rotation.z = t * 0.2;
    }
    damp(halo.current, "opacity", active ? 0.95 : dim ? 0.25 : 0.55, 0.3, dt);
  });

  return (
    <group ref={group} position={pos}>
      <mesh>
        <sphereGeometry args={[0.6, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.12}
          metalness={0.15}
          distort={reduced ? 0 : 0.32}
          speed={1.6}
          envMapIntensity={1.1}
        />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[0.98, 0.012, 16, 120]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.18, 0.006, 16, 120]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      <Billboard>
        <sprite scale={[3.6, 3.6, 1]}>
          <spriteMaterial ref={halo} map={glow} color={color} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} />
        </sprite>
      </Billboard>
      <pointLight color={color} intensity={4} distance={5} />
    </group>
  );
}

function Core({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((s, dt) => {
    if (reduced) return;
    const w = sceneStore.get().warp ? 6 : 1;
    ref.current.rotation.y += dt * 0.35 * w;
    ref.current.rotation.x += dt * 0.15 * w;
  });
  return (
    <group ref={ref} position={[0, 0.2, 0]}>
      <mesh>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshBasicMaterial color="#2f4fb0" wireframe transparent opacity={0.5} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.2, 3]} />
        <meshStandardMaterial color="#ffffff" emissive="#7f96e0" emissiveIntensity={1.2} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Thread({ a, b, reduced }: { a: PersonaKey; b: PersonaKey; reduced: boolean }) {
  const curve = useMemo(() => {
    const pa = new THREE.Vector3(...NODES[a].pos);
    const pb = new THREE.Vector3(...NODES[b].pos);
    const mid = pa.clone().add(pb).multiplyScalar(0.5);
    const ctrl = mid.clone().multiplyScalar(0.25).add(new THREE.Vector3(0, 0.2, 1.4));
    return new THREE.QuadraticBezierCurve3(pa, ctrl, pb);
  }, [a, b]);
  const points = useMemo(() => curve.getPoints(80), [curve]);
  const dash = useRef<any>(null);
  const packets = useRef<THREE.Mesh[]>([]);
  const ca = useMemo(() => new THREE.Color(NODES[a].color), [a]);
  const cb = useMemo(() => new THREE.Color(NODES[b].color), [b]);

  useFrame((s, dt) => {
    if (reduced) return;
    const warp = sceneStore.get().warp ? 5 : 1;
    if (dash.current?.material) dash.current.material.dashOffset -= dt * 0.6 * warp;
    const t0 = s.clock.elapsedTime * 0.12 * warp;
    packets.current.forEach((m, i) => {
      if (!m) return;
      const t = (t0 + i / 3) % 1;
      m.position.copy(curve.getPoint(t));
      const sc = Math.sin(t * Math.PI) * 0.09 + 0.02;
      m.scale.setScalar(sc / 0.1);
      (m.material as THREE.MeshBasicMaterial).color.copy(ca).lerp(cb, t);
    });
  });

  return (
    <group>
      <Line points={points} color="#2f4fb0" lineWidth={1} transparent opacity={0.18} />
      <Line ref={dash} points={points} color="#2f4fb0" lineWidth={1.6} dashed dashSize={0.12} gapSize={0.22} transparent opacity={0.55} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => { if (m) packets.current[i] = m; }}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color={NODES[a].color} />
        </mesh>
      ))}
    </group>
  );
}

function Dust({ count, reduced }: { count: number; reduced: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 12;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      p[i * 3] = r * Math.sin(ph) * Math.cos(th);
      p[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6;
      p[i * 3 + 2] = r * Math.cos(ph) - 4;
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [count]);
  const speed = useRef(1);
  useFrame((_, dt) => {
    if (reduced) return;
    speed.current = THREE.MathUtils.damp(speed.current, sceneStore.get().warp ? 14 : 1, 4, dt);
    ref.current.rotation.y += dt * 0.02 * speed.current;
    ref.current.rotation.z += dt * 0.004 * speed.current;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.045} color="#7d8fd0" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// Visible world width per unit of camera distance at fov 42° (2·tan(21°)), times aspect.
const SPAN = 0.7677;
const TRIDENT_W = 7;

/**
 * Camera position + look-at for each route focus. On landscape screens the
 * trident sits in the right ~45% (text lives on the left); on portrait it sits
 * lower and further back, behind the hero text.
 */
function framing(focus: Focus, aspect: number, width: number): { pos: V3; look: V3 } {
  const landscape = aspect >= 1.1;
  // Tablets/small laptops: hero text takes more width, so the trident shrinks right.
  const narrow = width < 1100;
  if (focus === "home" || focus === "other") {
    if (landscape) {
      const share = focus === "home" ? (narrow ? 0.34 : 0.42) : 0.26;
      const d = THREE.MathUtils.clamp(TRIDENT_W / (share * SPAN * aspect), 9.5, 24);
      const x = -(focus === "home" ? (narrow ? 0.29 : 0.24) : 0.38) * SPAN * aspect * d;
      const y = focus === "home" ? 0 : -0.22 * SPAN * d;
      return { pos: [x, y, d], look: [x, y, 0] };
    }
    // Portrait: a smaller trident tucked into the top-right corner, behind the headline.
    const d = 24;
    const x = -0.36 * SPAN * aspect * d;
    const y = -0.2 * SPAN * d;
    return { pos: [x, y, d], look: [x, y, 0] };
  }
  const [nx, ny, nz] = NODES[focus].pos;
  if (landscape) {
    const d = 5.2;
    const x = nx - 0.22 * SPAN * aspect * d;
    return { pos: [x, ny, nz + d], look: [x, ny, nz] };
  }
  const d = 9;
  const x = nx - 0.26 * SPAN * aspect * d;
  const y = ny - 0.3 * SPAN * d;
  return { pos: [x, y, nz + d], look: [x, y, nz] };
}

function Rig({ reduced }: { reduced: boolean }) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(-2.9, 0, 0));
  const warpAmt = useRef(0);

  useFrame((_, dt) => {
    const st = sceneStore.get();
    const f = framing(st.focus, size.width / size.height, size.width);
    const lag = reduced ? 0.0001 : st.warp ? 0.55 : 0.9;
    const par = reduced ? 0 : 0.45;
    damp3(camera.position, [f.pos[0] + input.mx * par, f.pos[1] + input.my * par * 0.6, f.pos[2]], lag, dt);
    damp3(look.current, f.look, lag, dt);
    camera.lookAt(look.current);

    warpAmt.current = THREE.MathUtils.damp(warpAmt.current, st.warp ? 1 : 0, 5, dt);
    const cam = camera as THREE.PerspectiveCamera;
    const fov = 42 + warpAmt.current * 22;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
  });
  return null;
}

function World({ reduced, mobile }: { reduced: boolean; mobile: boolean }) {
  const glow = useMemo(() => glowTexture(), []);
  const root = useRef<THREE.Group>(null!);
  useFrame((s, dt) => {
    if (reduced) return;
    const scroll = Math.min(window.scrollY / 900, 1);
    const warp = sceneStore.get().warp;
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, scroll * 0.6 + (warp ? 0.8 : 0) + input.mx * 0.08, 3, dt);
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, scroll * 0.2 - input.my * 0.05, 3, dt);
  });
  return (
    <>
      <group ref={root}>
        <Core reduced={reduced} />
        {KEYS.map((k) => (
          <Node key={k} k={k} glow={glow} reduced={reduced} />
        ))}
        {PAIRS.map(([a, b]) => (
          <Thread key={a + b} a={a} b={b} reduced={reduced} />
        ))}
        {KEYS.map((k) => (
          <Line key={`c-${k}`} points={[[0, 0.2, 0], NODES[k].pos]} color="#2f4fb0" lineWidth={0.8} transparent opacity={0.14} />
        ))}
      </group>
      <Dust count={mobile ? 350 : 900} reduced={reduced} />
    </>
  );
}

export default function TridentScene() {
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const mobile = useMemo(() => typeof window !== "undefined" && window.innerWidth < 768, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      input.mx = (e.clientX / window.innerWidth) * 2 - 1;
      input.my = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [-2.9, 0, 10], fov: 42, near: 0.1, far: 80 }}
      frameloop={reduced ? "demand" : "always"}
      aria-hidden
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 6]} intensity={1.4} />
      <directionalLight position={[-6, -2, 3]} intensity={0.5} color="#b8c6ff" />
      <Environment resolution={mobile ? 64 : 128}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
          <Lightformer form="ring" color="#9fb3ff" intensity={6} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
          <Lightformer form="rect" intensity={1.5} position={[0, 0, 10]} scale={[10, 4, 1]} />
        </group>
      </Environment>
      <Rig reduced={reduced} />
      <World reduced={reduced} mobile={mobile} />
    </Canvas>
  );
}
