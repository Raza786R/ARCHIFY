import React, { Suspense, useState, useEffect } from 'react';
// --- THIS IS THE FIXED LINE ---
import { Canvas } from '@react-three/fiber';
// ------------------------------
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Uploader } from './Uploader'; // Import our new component

// --- Wall component (This is unchanged) ---
function Wall({ start, end }) {
  const center = new THREE.Vector3(
    (start.x + end.x) / 2,
    1.5,
    (start.z + end.z) / 2
  );
  const length = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2)
  );
  // This is the fixed rotation from before
  const rotation = Math.atan2(end.z - start.z, end.x - start.x);

  return (
    <mesh position={center} rotation={[0, rotation, 0]}>
      <boxGeometry args={[length, 3, 0.2]} />
      <meshStandardMaterial color="#888" />
    </mesh>
  );
}

// --- Scene component (This is now different) ---
// It receives the 'layout' data as a prop
function Scene({ layout }) {
  if (!layout) {
    // If no layout, show a "welcome" message
    return (
      <Text color="white" fontSize={0.5} position={[0, 1.5, 0]}>
        Please upload a blueprint to begin.
      </Text>
    );
  }

  // --- THIS IS A HACKATHON HACK ---
  // The AI gives us pixel coordinates (e.g., x: 800, y: 600)
  // These are too big for a 3D scene.
  // We will "normalize" them by dividing by a number (e.g., 50)
  // and centering them.
  const SCALE = 50; // Adjust this scale to make the model bigger/smaller
  const center = { x: 500, z: 500 }; // Guess a center point

  // SUCCESS! Render the walls
  return (
    <>
      {layout.walls.map((wall, index) => (
        <Wall
          key={index}
          start={{
            x: (wall.from.x - center.x) / SCALE,
            y: 0,
            z: (wall.from.y - center.z) / SCALE, // AI's 'y' is our 'z'
          }}
          end={{
            x: (wall.to.x - center.x) / SCALE,
            y: 0,
            z: (wall.to.y - center.z) / SCALE, // AI's 'y' is our 'z'
          }}
        />
      ))}
    </>
  );
}

// --- Main App component (This is also different) ---
export default function App() {
  // The layout data is now held here, in the main App
  const [layout, setLayout] = useState(null);

  return (
    <>
      {/* 1. The Uploader UI. It floats on top. */}
      {/* We pass it a function to update our layout state */}
      <Uploader onLayoutData={setLayout} />

      {/* 2. The 3D Canvas */}
      <Canvas camera={{ position: [0, 30, 30], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        <OrbitControls />
        <Suspense fallback={null}>
          {/* We pass the 'layout' state down to the Scene */}
          <Scene layout={layout} />
        </Suspense>
      </Canvas>
    </>
  );
}