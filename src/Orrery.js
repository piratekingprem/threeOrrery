// src/Orrery.js
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Vector3 } from "three";
import './Orrey.css';
import * as THREE from 'three'; 

// Stars Component
const Stars = () => {
  const group = useRef();
  const [positions] = useState(() => {
    const temp = [];
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000 - 1000;
      const z = Math.random() * 2000 - 1000;
      temp.push([x, y, z]);
    }
    return temp;
  });

  return (
    <group ref={group}>
      {positions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
    </group>
  );
};

// Sun Component
const Sun = () => (
  <mesh position={[0, 0, 0]}>
    <sphereGeometry args={[5, 32, 32]} />
    <meshStandardMaterial emissive="yellow" color="yellow" />
    <Html position={[0, 6, 0]}>
      <div style={{ color: 'white', fontSize: '1.5em' }}>Sun</div>
    </Html>
  </mesh>
);

// OrbitPath Component
const OrbitPath = ({ distance }) => {
  const points = [];
  for (let i = 0; i < 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(new Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
  }
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line>
      <bufferGeometry attach="geometry" {...lineGeometry} />
      <lineBasicMaterial attach="material" color="white" />
    </line>
  );
};

// Planet Component
const Planet = ({ name, color, distance, size, speed, onClick }) => {
  const ref = useRef();
  const angle = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    if (ref.current) {
      angle.current += delta * speed;
      ref.current.position.x = distance * Math.cos(angle.current);
      ref.current.position.z = distance * Math.sin(angle.current);
    }
  });

  return (
    <mesh ref={ref} onClick={onClick}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
      <Html position={[0, size + 2, 0]}>
        <div style={{ color: 'white', fontSize: '1em' }}>{name}</div>
      </Html>
    </mesh>
  );
};

// NEO (Near-Earth Object) Component
const NeoObject = ({ name, color, size, distance, speed }) => {
  const ref = useRef();
  const angle = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    if (ref.current) {
      angle.current += delta * speed;
      ref.current.position.x = distance * Math.cos(angle.current);
      ref.current.position.z = distance * Math.sin(angle.current);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
      <Html position={[0, size + 2, 0]}>
        <div style={{ color: 'white', fontSize: '0.8em' }}>{name}</div>
      </Html>
    </mesh>
  );
};

// Main Orrery Scene Component
const Scene = ({ neoData }) => {
  const { camera } = useThree();
  const controlsRef = useRef();
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  const planets = [
    { name: 'Mercury', color: 'gray', distance: 20, size: 0.5, speed: 0.03 },
    { name: 'Venus', color: 'yellow', distance: 30, size: 0.5, speed: 0.02 },
    { name: 'Earth', color: 'blue', distance: 40, size: 0.5, speed: 0.01 },
    { name: 'Mars', color: 'red', distance: 50, size: 0.5, speed: 0.008 },
    { name: 'Jupiter', color: 'orange', distance: 70, size: 0.5, speed: 0.005 },
    { name: 'Saturn', color: 'goldenrod', distance: 90, size: 0.5, speed: 0.004 },
    { name: 'Uranus', color: 'lightblue', distance: 110, size: 0.5, speed: 0.003 },
    { name: 'Neptune', color: 'darkblue', distance: 130, size: 0.5, speed: 0.002 },
  ];

  const handleZoomIn = (object) => {
    const offset = new Vector3(2, 2, 2);
    controlsRef.current.target.copy(object.position);
    camera.position.copy(object.position).add(offset);
    camera.lookAt(object.position);
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={1} />

      <Stars />
      <Sun />

      {planets.map((planet) => (
        <React.Fragment key={planet.name}>
          <OrbitPath distance={planet.distance} />
          <Planet
            {...planet}
            onClick={() => setSelectedPlanet(planet.name)}
          />
        </React.Fragment>
      ))}

      {neoData &&
        neoData.map((neo, idx) => (
          <NeoObject key={idx} {...neo} />
        ))}

      <OrbitControls ref={controlsRef} />
    </>
  );
};

// Orrery Component (Main)
export default function Orrery() {
  const [neoData, setNeoData] = useState([]);
  console.log(neoData)
  useEffect(() => {
    const fetchNeoData = async () => {
      try {
        const response = await fetch(
          "https://api.nasa.gov/neo/rest/v1/feed?start_date=2024-09-25&end_date=2024-09-25&api_key=8Cre6l1RZJ7lsmyab3tAtbDwPvCLiJVXidkjmXby"
        );
        const data = await response.json();

        const formattedNEOs = data.near_earth_objects['2024-09-25'].map((neo) => ({
          name: neo.name,
          size: neo.estimated_diameter.kilometers.estimated_diameter_max / 10,
          color: 'red',
          distance: Math.random() * 100 + 60, // Placeholder random value for visualization
          speed: Math.random() * 0.01 + 0.005,
        }));

        setNeoData(formattedNEOs);
      } catch (error) {
        console.error('Error fetching NEO data:', error);
      }
    };

    fetchNeoData();
  }, []);

  return (
    <div style={{ height: "100vh" }}>
      <Canvas camera={{ position: [0, 50, 120], fov: 45 }}>
        <Scene neoData={neoData} />
      </Canvas>
    </div>
  );
}
