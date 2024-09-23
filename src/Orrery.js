// src/Orrery.js
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Vector3, CatmullRomCurve3 } from "three";

function useFetchNEOData() {
  const [neoData, setNeoData] = useState([]);

  useEffect(() => {
    async function fetchNEOData() {
      try {
        const response = await fetch(
          "https://api.nasa.gov/neo/rest/v1/feed?start_date=2015-09-07&end_date=2015-09-08&api_key=8Cre6l1RZJ7lsmyab3tAtbDwPvCLiJVXidkjmXbyAC"
        );
        const data = await response.json();
        console.log("Fetched NEO Data:", data); // Check if data is fetched correctly

        if (data.near_earth_objects) {
          const asteroids = Object.values(data.near_earth_objects).flat();
          setNeoData(asteroids);
        } else {
          console.error("No NEO data found in response");
        }
      } catch (error) {
        console.error("Error fetching NEO data:", error);
      }
    }

    fetchNEOData();
  }, []);

  return neoData;
}

function Sun({ onClick }) {
  return (
    <mesh onClick={(event) => onClick(event.object)}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshBasicMaterial color="gold" />
    </mesh>
  );
}

function Planet({
  radius,
  widthSegment,
  heightSegment,
  color,
  semiMajorAxis,
  semiMinorAxis,
  orbitSpeed,
  onClick,
}) {
  const planetRef = useRef();

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    planetRef.current.position.x =
      semiMajorAxis * Math.cos(elapsedTime * orbitSpeed);
    planetRef.current.position.z =
      semiMinorAxis * Math.sin(elapsedTime * orbitSpeed);
  });

  return (
    <mesh ref={planetRef} onClick={() => onClick(planetRef.current)}>
      <sphereGeometry args={[radius, widthSegment, heightSegment]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function OrbitPath({ semiMajorAxis, semiMinorAxis }) {
  const points = [];
  for (let i = 0; i < 360; i++) {
    const angle = (i * Math.PI) / 180;
    const x = semiMajorAxis * Math.cos(angle);
    const z = semiMinorAxis * Math.sin(angle);
    points.push(new Vector3(x, 0, z));
  }

  const curve = new CatmullRomCurve3(points);
  const curvePoints = curve.getPoints(100);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(curvePoints.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
          count={curvePoints.length}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="white" />
    </points>
  );
}

function Asteroid({ asteroid, onClick }) {
    const asteroidRef = useRef();
  
    useFrame(({ clock }) => {
      const elapsedTime = clock.getElapsedTime();
      // Temporarily fixed position to ensure visibility
      const distance = 10; // Try a smaller, fixed distance
      asteroidRef.current.position.x = distance * Math.cos(elapsedTime * 0.1);
      asteroidRef.current.position.z = distance * Math.sin(elapsedTime * 0.1);
    });
  
    return (
      <mesh ref={asteroidRef} onClick={() => onClick(asteroid)}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>
    );
  }
  

function Scene() {
  const { camera } = useThree();
  const controlsRef = useRef();
  const neoData = useFetchNEOData(); // Fetch NEO data here
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);

  const handleZoomIn = (object) => {
    if (controlsRef.current) {
      controlsRef.current.target.copy(object.position);
      const offset = new Vector3(2, 2, 2);
      camera.position.copy(object.position).add(offset);
      camera.lookAt(object.position);
    }
  };

  const handleAsteroidClick = (asteroid) => {
    setSelectedAsteroid(asteroid);
    handleZoomIn(asteroid);
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {/* Sun */}
      <Sun onClick={handleZoomIn} />
      {/* Planets' orbits and planets */}
      <OrbitPath semiMajorAxis={2} semiMinorAxis={1.9} />
      <Planet
        radius={0.2}
        widthSegment={32}
        heightSegment={32}
        color="gray"
        semiMajorAxis={2}
        semiMinorAxis={1.9}
        orbitSpeed={4.1}
        onClick={handleZoomIn}
      /> {/* Mercury */}
      <OrbitPath semiMajorAxis={3} semiMinorAxis={2.9} />
      <Planet
        radius={0.5}
        widthSegment={32}
        heightSegment={32}
        color="yellow"
        semiMajorAxis={3}
        semiMinorAxis={2.9}
        orbitSpeed={1.6}
        onClick={handleZoomIn}
      /> {/* Venus */}
      <OrbitPath semiMajorAxis={5} semiMinorAxis={4.95} />
      <Planet
        radius={0.5}
        widthSegment={32}
        heightSegment={32}
        color="blue"
        semiMajorAxis={5}
        semiMinorAxis={4.95}
        orbitSpeed={1}
        onClick={handleZoomIn}
      /> {/* Earth */}
      <OrbitPath semiMajorAxis={6} semiMinorAxis={5.9} />
      <Planet
        radius={0.27}
        widthSegment={32}
        heightSegment={32}
        color="red"
        semiMajorAxis={6}
        semiMinorAxis={5.9}
        orbitSpeed={0.53}
        onClick={handleZoomIn}
      /> {/* Mars */}
      <OrbitPath semiMajorAxis={11} semiMinorAxis={10.8} />
      <Planet
        radius={1.1}
        widthSegment={32}
        heightSegment={32}
        color="orange"
        semiMajorAxis={11}
        semiMinorAxis={10.8}
        orbitSpeed={0.08}
        onClick={handleZoomIn}
      /> {/* Jupiter */}
      <OrbitPath semiMajorAxis={19} semiMinorAxis={18.5} />
      <Planet
        radius={0.9}
        widthSegment={32}
        heightSegment={32}
        color="lightyellow"
        semiMajorAxis={19}
        semiMinorAxis={18.5}
        orbitSpeed={0.034}
        onClick={handleZoomIn}
      /> {/* Saturn */}
      <OrbitPath semiMajorAxis={30} semiMinorAxis={29.5} />
      <Planet
        radius={0.4}
        widthSegment={32}
        heightSegment={32}
        color="lightblue"
        semiMajorAxis={30}
        semiMinorAxis={29.5}
        orbitSpeed={0.011}
        onClick={handleZoomIn}
      /> {/* Uranus */}
      <OrbitPath semiMajorAxis={40} semiMinorAxis={39.5} />
      <Planet
        radius={0.38}
        widthSegment={32}
        heightSegment={32}
        color="blue"
        semiMajorAxis={40}
        semiMinorAxis={39.5}
        orbitSpeed={0.006}
        onClick={handleZoomIn}
      /> {/* Neptune */}

      {/* Render NEO (Asteroids) */}
      {neoData.map((asteroid) => (
        <Asteroid key={asteroid.id} asteroid={asteroid} onClick={handleAsteroidClick} />
      ))}
      {/* Orbit Controls */}
      <OrbitControls ref={controlsRef} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Asteroid details modal */}
      {selectedAsteroid && (
        <div className="asteroid-details">
          <h2>{selectedAsteroid.name}</h2>
          <p>Estimated Diameter: {selectedAsteroid.estimated_diameter.kilometers.estimated_diameter_max} km</p>
          <p>Is Potentially Hazardous: {selectedAsteroid.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}</p>
          {/* Add more details as needed */}
        </div>
      )}
    </>
  );
}

export default function Orrery() {
  return (
    <div style={{ height: "100vh" }}>
      <Canvas camera={{ position: [0, 30, 80], fov: 45 }} style={{background: "black"}}>
        <Scene />
      </Canvas>
    </div>
  );
}
