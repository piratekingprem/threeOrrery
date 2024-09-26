// src/Orrery.js
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Vector3, CatmullRomCurve3 } from "three";

// Sun Component
function Sun({ onClick }) {
  return (
    <mesh onClick={(event) => onClick(event.object)}>
      <sphereGeometry args={[6.96, 32, 32]} />
      <meshBasicMaterial color="gold" />
    </mesh>
  );
}

// Planet Component
function Planet({
  radius,
  widthSegment,
  heightSegment,
  color,
  semiMajorAxis,
  semiMinorAxis,
  orbitSpeed,
  startOffset,
  onClick,
}) {
  const planetRef = useRef();

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    const angle = startOffset + elapsedTime * orbitSpeed;
    planetRef.current.position.x = semiMajorAxis * Math.cos(angle);
    planetRef.current.position.z = semiMinorAxis * Math.sin(angle);
  });

  return (
    <mesh ref={planetRef} onClick={() => onClick(planetRef.current)}>
      <sphereGeometry args={[radius, widthSegment, heightSegment]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// OrbitPath Component
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


// Asteroid Component
function Asteroid({ position, size }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 160, 160]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

function Scene({ neoData }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  const handleZoomIn = (object) => {
    if (controlsRef.current) {
      const offset = new Vector3(2, 2, 2);
      controlsRef.current.target.copy(object.position);
      camera.position.copy(object.position).add(offset);
      camera.lookAt(object.position);
    }
  };

  // Define start offsets for each planet (in radians)
  const startOffsets = {
    mercury: Math.PI / 4,
    venus: Math.PI / 2,
    earth: Math.PI,
    mars: (3 * Math.PI) / 2,
    jupiter: Math.PI / 6,
    saturn: Math.PI / 3,
    uranus: Math.PI / 8,
    neptune: Math.PI / 10,
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      <Sun onClick={handleZoomIn} />

      {/* Planets */}
      <OrbitPath semiMajorAxis={4.87} semiMinorAxis={4.79} />
      <Planet
        radius={0.49}
        widthSegment={32}
        heightSegment={32}
        color="gray"
        semiMajorAxis={4.87}
        semiMinorAxis={4.79}
        orbitSpeed={1 / 88}
        startOffset={startOffsets.mercury}
        onClick={handleZoomIn}
      />

      {/* Venus */}
      <OrbitPath semiMajorAxis={10.8} semiMinorAxis={10.7} />
      <Planet
        radius={1.2}
        widthSegment={32}
        heightSegment={32}
        color="yellow"
        semiMajorAxis={10.8}
        semiMinorAxis={10.7}
        orbitSpeed={1 / 225}
        startOffset={startOffsets.venus}
        onClick={handleZoomIn}
      />

      {/* Earth */}
      <OrbitPath semiMajorAxis={15} semiMinorAxis={14.96} />
      <Planet
        radius={1.27}
        widthSegment={32}
        heightSegment={32}
        color="blue"
        semiMajorAxis={15}
        semiMinorAxis={14.96}
        orbitSpeed={1 / 365.25}
        startOffset={startOffsets.earth}
        onClick={handleZoomIn}
      />

      {/* Mars */}
      <OrbitPath semiMajorAxis={22.79} semiMinorAxis={22.64} />
      <Planet
        radius={0.68}
        widthSegment={32}
        heightSegment={32}
        color="red"
        semiMajorAxis={22.79}
        semiMinorAxis={22.64}
        orbitSpeed={1 / 687}
        startOffset={startOffsets.mars}
        onClick={handleZoomIn}
      />

      {/* Jupiter */}
      <OrbitPath semiMajorAxis={77.92} semiMinorAxis={77.57} />
      <Planet
        radius={14.3}
        widthSegment={32}
        heightSegment={32}
        color="orange"
        semiMajorAxis={77.92}
        semiMinorAxis={77.57}
        orbitSpeed={1 / 4333}
        startOffset={startOffsets.jupiter}
        onClick={handleZoomIn}
      />

      {/* Saturn */}
      <OrbitPath semiMajorAxis={143.35} semiMinorAxis={142.94} />
      <Planet
        radius={12.1}
        widthSegment={32}
        heightSegment={32}
        color="lightyellow"
        semiMajorAxis={143.35}
        semiMinorAxis={142.94}
        orbitSpeed={1 / 10759}
        startOffset={startOffsets.saturn}
        onClick={handleZoomIn}
      />

      {/* Uranus */}
      <OrbitPath semiMajorAxis={287.25} semiMinorAxis={286.77} />
      <Planet
        radius={5.1}
        widthSegment={32}
        heightSegment={32}
        color="lightblue"
        semiMajorAxis={287.25}
        semiMinorAxis={286.77}
        orbitSpeed={1 / 30687}
        startOffset={startOffsets.uranus}
        onClick={handleZoomIn}
      />

      {/* Neptune */}
      <OrbitPath semiMajorAxis={449.51} semiMinorAxis={448.94} />
      <Planet
        radius={4.95}
        widthSegment={32}
        heightSegment={32}
        color="blue"
        semiMajorAxis={449.51}
        semiMinorAxis={448.94}
        orbitSpeed={1 / 60190}
        startOffset={startOffsets.neptune}
        onClick={handleZoomIn}
      />

      {/* Two Asteroids */}
       {/* Render Asteroids based on NEO data */}
       {neoData && Object.values(neoData.near_earth_objects).flat().map((neo) => {
        const diameter =
          neo.estimated_diameter.kilometers.estimated_diameter_max;
        const distance = neo.close_approach_data[0].miss_distance.astronomical;

        // Calculate position based on miss distance (in AU)
        const position = new Vector3(distance, Math.random()*100, Math.random()*200a); // Simple placement for demonstration
        const size = diameter / 100; // Convert kilometers to meters for size

        return (
          <>
          {console.log(position)}
          <Asteroid key={neo.id} position={position} size={size} />
          </>
        );
      })}

      <OrbitControls ref={controlsRef} />
      <Stars
        radius={200}
        depth={100}
        count={10000}
        factor={4}
        saturation={0.1}
        fade
        speed={0.5}
      />
    </>
  );
}

export default function Orrery() {
  const [neoData, setNEOData] = useState(null);
  const api_key = "8Cre6l1RZJ7lsmyab3tAtbDwPvCLiJVXidkjmXby";

  useEffect(() => {
    fetch(
      `http://api.nasa.gov/neo/rest/v1/feed?start_date=2024-09-25&end_date=2024-09-25&api_key=${api_key}`
    )
      .then((response) => response.json())
      .then((data) => {
        setNEOData(data);
      });
  }, []);

  return (
    <div style={{ height: "100vh" }}>
      <Canvas
        camera={{ position: [0, 50, 120], fov: 45, near: 0.1, far: 2000 }}
        style={{ background: "black" }}
      >
        <Scene neoData={neoData} />
      </Canvas>
    </div>
  );
}
