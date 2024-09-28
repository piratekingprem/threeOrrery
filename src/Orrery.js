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
    for (let i = 0; i < 15000; i++) {
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

// Orbit Path component to show circular paths around the Sun
const OrbitPath = ({ distance, onClick }) => {
  const points = [];
  for (let i = 0; i < 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
  }
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line onClick={onClick}>
      <bufferGeometry attach="geometry" {...lineGeometry} />
      <lineBasicMaterial attach="material" color="white" />
    </line>
  );
};

// Dot to represent planets/NEOs
const Dot = ({ name, color, distance, size, speed, onClick }) => {
  const ref = useRef();
  const angle = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    if (ref.current) {
      angle.current += delta * speed; // Dot's orbit speed
      ref.current.position.x = distance * Math.cos(angle.current);
      ref.current.position.z = distance * Math.sin(angle.current);
    }
  });

  return (
    <mesh ref={ref} onClick={onClick}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
      <Html position={[0, size + 2, 0]}>
        <div style={{ color: 'white', fontSize: '1em', cursor: 'pointer' }} onClick={onClick}>
          {name}
        </div>
      </Html>
    </mesh>
  );
};

// Sun component in the center of the orrery
const Sun = () => {
  return (
    <mesh>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial emissive="yellow" emissiveIntensity={1} />
    </mesh>
  );
};

// Main Orrery Scene component
const Orrery = () => {
  const [selectedObject, setSelectedObject] = useState(null);
  const [showPanel, setShowPanel] = useState(false); // Controls visibility of the information panel
  const [neoData, setNeoData] = useState([]);

  const planets = [
    { name: 'Mercury', color: 'gray', distance: 0.3 * 10, size: 0.2, speed: 0.03 },
    { name: 'Venus', color: 'yellow', distance:0.72 * 10, size: 0.2, speed: 0.02 },
    { name: 'Earth', color: 'blue', distance: 1 * 10, size: 0.2, speed: 0.01 },
    { name: 'Mars', color: 'red', distance: 1.5 * 10, size: 0.2, speed: 0.008 },
    { name: 'Jupiter', color: 'orange', distance:  5.2 * 10, size: 0.2, speed: 0.005 },
    { name: 'Saturn', color: 'goldenrod', distance: 9.5 * 10, size: 0.2, speed: 0.004 },
    { name: 'Uranus', color: 'lightblue', distance: 19.2 * 10, size: 0.2, speed: 0.003 },
    { name: 'Neptune', color: 'darkblue', distance: 30 * 10, size: 0.2, speed: 0.002 },
  ];

  // Fetch NEO data from the NASA API
  useEffect(() => {
    const fetchNEOData = async () => {
      try {
        const response = await fetch(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=2024-09-22&end_date=2024-09-23&api_key=ew5wSSkycJDyRhyeznBX6JkaRTRWmImwioGODrTA`
        );
        const data = await response.json();
        const neos = data.near_earth_objects['2024-09-22'];

        const formattedNEOs = neos.map((neo) => ({
          name: neo.name,
          size: 0.2, // Set a small dot size
          color: 'red',
          distance: Math.random() * 100 + 60,
          speed: Math.random() * 0.01 + 0.005,
          info: `Diameter: ${neo.estimated_diameter.kilometers.estimated_diameter_max} km, 
                 Velocity: ${neo.close_approach_data[0].relative_velocity.kilometers_per_hour} km/h`,
        }));

        setNeoData(formattedNEOs);
      } catch (error) {
        console.error('Error fetching NEO data:', error);
      }
    };

    fetchNEOData();
  }, []);

  const handleObjectClick = (object) => {
    setSelectedObject(object);
    setShowPanel(true); // Show the information panel when a planet or NEO is clicked
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Left Information Panel (only visible when showPanel is true) */}
      {showPanel && (
        <div style={{ width: '30%', padding: '20px', color: 'white', background: '#1a1a1a' }}>
          {selectedObject ? (
            <div>
              <h1>{selectedObject.name}</h1>
              <p>{selectedObject.info || 'No additional information available'}</p>
            </div>
          ) : (
            <div>
              <h2>Select a planet or NEO</h2>
            </div>
          )}
        </div>
      )}

      {/* Orrery 3D View */}
      <div style={{ width: showPanel ? '70%' : '100%' }}>
        <Canvas
          camera={{ position: [0, 100, 150], fov: 75 }}
          style={{ background: 'black', height: '100vh' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 0, 0]} intensity={1} />

          <Stars />

          {/* Sun in the center */}
          <Sun />

          {/* Render orbits and dots for planets */}
          {planets.map((planet) => (
            <React.Fragment key={planet.name}>
              <OrbitPath
                distance={planet.distance}
                onClick={() => handleObjectClick(planet)}
              />
              <Dot
                {...planet}
                onClick={() => handleObjectClick(planet)}
              />
            </React.Fragment>
          ))}

          {/* Render NEOs without orbit paths */}
          {neoData.map((neo, idx) => (
            <Dot
              key={idx}
              {...neo}
              onClick={() => handleObjectClick(neo)}
            />
          ))}

          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
};

export default Orrery;
