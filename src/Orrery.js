import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import './Orrey.css';

// Utility to generate random stars in the background
const Stars = () => {
  const group = useRef();
  const [positions] = useState(() => {
    const temp = [];
    for (let i = 0; i < 1000; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000);
      const y = THREE.MathUtils.randFloatSpread(2000);
      const z = THREE.MathUtils.randFloatSpread(2000);
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

// Sun component
const Sun = () => (
  <mesh position={[0, 0, 0]}>
    <sphereGeometry args={[5, 32, 32]} />
    <meshStandardMaterial emissive="yellow" color="yellow" />
    <Html position={[0, 6, 0]}>
      <div style={{ color: 'white', fontSize: '1.5em' }}>Sun</div>
    </Html>
  </mesh>
);

// Planet component with animation using useFrame
const Planet = ({ name, color, distance, size, speed }) => {
  const ref = useRef();
  const angle = useRef(Math.random() * Math.PI * 2); // Random start angle

  useFrame((state, delta) => {
    if (ref.current) {
      angle.current += delta * speed; // Planet's orbit speed
      ref.current.position.x = distance * Math.cos(angle.current);
      ref.current.position.z = distance * Math.sin(angle.current);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
      <Html position={[0, size + 2, 0]}>
        <div style={{ color: 'white', fontSize: '1em' }}>{name}</div>
      </Html>
    </mesh>
  );
};

// NEO (Near-Earth Object) component
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

// Main Orrery Scene component
const Orrery = () => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [neoData, setNeoData] = useState([]);

  const planets = [
    { name: 'Mercury', color: 'gray', distance: 20, size: 1, speed: 0.03 },
    { name: 'Venus', color: 'yellow', distance: 30, size: 1.5, speed: 0.02 },
    { name: 'Earth', color: 'blue', distance: 40, size: 2, speed: 0.01 },
    { name: 'Mars', color: 'red', distance: 50, size: 1.7, speed: 0.008 },
  ];

  // Fetch NEO data from the NASA API
  useEffect(() => {
    const fetchNEOData = async () => {
      try {
        const response = await fetch(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=2024-09-22&end_date=2024-09-23&api_key=ew5wSSkycJDyRhyeznBX6JkaRTRWmImwioGODrTA`
        );
        const data = await response.json();
        const neos = data.near_earth_objects['2024-09-22']; // Adjust based on available dates

        const formattedNEOs = neos.map((neo) => ({
          name: neo.name,
          size: neo.estimated_diameter.kilometers.estimated_diameter_max,
          color: 'red', // You can dynamically assign colors based on other parameters
          distance: Math.random() * 100 + 60, // Random distance for demonstration
          speed: Math.random() * 0.01 + 0.005, // Random speed for demonstration
        }));

        setNeoData(formattedNEOs);
      } catch (error) {
        console.error('Error fetching NEO data:', error);
      }
    };

    fetchNEOData();
  }, []);

  return (
    <>
      <Canvas
        camera={{ position: [0, 50, 100], fov: 75 }}
        style={{ background: 'black', height: '100vh', width: '100vw' }} // Full-screen black background
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={1} /> {/* Sunlight */}

        <Stars />
        <Sun />

        {/* Render each planet */}
        {planets.map((planet) => (
          <Planet
            key={planet.name}
            {...planet}
            onClick={() => setSelectedPlanet(planet.name)}
          />
        ))}

        {/* Render NEOs dynamically from API */}
        {neoData.map((neo, idx) => (
          <NeoObject key={idx} {...neo} />
        ))}

        <OrbitControls />
      </Canvas>

      {/* Display the selected planet or NEO information */}
      {selectedPlanet && (
        <div style={{ position: 'absolute', top: 20, left: 20, color: 'white' }}>
          <h1>{selectedPlanet}</h1>
        </div>
      )}
    </>
  );
};

export default Orrery;
