"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

function Gate() {
  const ring = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ring.current) ring.current.rotation.z += delta * 0.22;
  });
  return (
    <group rotation={[0.25, -0.45, 0]}>
      <mesh ref={ring}>
        <torusGeometry args={[1.45, 0.18, 20, 64]} />
        <meshStandardMaterial color="#1bd7ff" emissive="#067aa0" emissiveIntensity={1.4} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.45, 3.5, 0.45]} />
        <meshStandardMaterial color="#bbf400" emissive="#3d5500" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

export function PaymentGate() {
  return (
    <div className="gate" aria-label="Animated API payment gate" role="img">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 42 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[3, 3, 5]} intensity={28} color="#1bd7ff" />
        <Gate />
      </Canvas>
      <span className="data-stream left" />
      <span className="data-stream right" />
    </div>
  );
}
