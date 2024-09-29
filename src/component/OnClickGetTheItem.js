import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import '../component/OnClickGetTheItem.css';

function Mercury() {
  // Load the GLB model
  const { scene } = useGLTF("/earth.glb"); // Ensure correct path

  // Render the model
  return <primitive object={scene} scale={0.5} />;
}

export default function OnClickGetTheItem() {
  return (
    <div>
      <Canvas>
        <Environment preset="sunset" />
        {/* Add basic lighting */}
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* Load and display the model */}
        <Suspense fallback={null}>
          <Mercury />
        </Suspense>

        {/* Enable camera orbit controls */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

// Preload the GLB model for better performance
useGLTF.preload("/earth.glb");
