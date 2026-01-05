import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

interface Interactive3DJarProps {
  onInteraction?: (isInteracting: boolean) => void;
}

// Folded paper note inside the jar with physics-like motion
const FoldedNote = ({ 
  position, 
  rotation, 
  color, 
  scale = 1,
  isShaking,
  jarRotation
}: { 
  position: [number, number, number]; 
  rotation: [number, number, number]; 
  color: string;
  scale?: number;
  isShaking: boolean;
  jarRotation: { x: number; y: number };
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef({ x: 0, y: 0, z: 0, rotZ: 0 });
  const currentPosRef = useRef({ x: position[0], y: position[1], z: position[2] });
  const randomOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const mass = useMemo(() => 0.5 + Math.random() * 0.5, []); // Random mass for varied response
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    
    // Physics constants
    const gravity = 0.008;
    const friction = 0.92;
    const rotationInfluence = 0.15;
    
    // Calculate forces from jar rotation
    const forceX = jarRotation.y * rotationInfluence / mass;
    const forceZ = -jarRotation.x * rotationInfluence / mass;
    
    // Apply forces to velocity
    velocityRef.current.x += forceX;
    velocityRef.current.z += forceZ;
    velocityRef.current.rotZ += jarRotation.y * 0.02;
    
    // Apply friction
    velocityRef.current.x *= friction;
    velocityRef.current.z *= friction;
    velocityRef.current.rotZ *= friction;
    
    // Update position with constraints (keep notes inside jar)
    const maxOffset = 0.25;
    currentPosRef.current.x = Math.max(-maxOffset, Math.min(maxOffset, 
      position[0] + velocityRef.current.x
    ));
    currentPosRef.current.z = Math.max(-maxOffset, Math.min(maxOffset, 
      position[2] + velocityRef.current.z
    ));
    
    if (isShaking) {
      meshRef.current.position.x = currentPosRef.current.x + Math.sin(time * 20 + randomOffset) * 0.08;
      meshRef.current.position.y = position[1] + Math.cos(time * 15 + randomOffset) * 0.08;
      meshRef.current.position.z = currentPosRef.current.z + Math.sin(time * 18 + randomOffset) * 0.06;
      meshRef.current.rotation.z = rotation[2] + Math.sin(time * 25) * 0.3;
      meshRef.current.rotation.x = rotation[0] + Math.cos(time * 22) * 0.2;
    } else {
      // Gentle floating + physics response
      meshRef.current.position.x = currentPosRef.current.x;
      meshRef.current.position.y = position[1] + Math.sin(time * 0.8 + randomOffset) * 0.02;
      meshRef.current.position.z = currentPosRef.current.z;
      meshRef.current.rotation.z = rotation[2] + velocityRef.current.rotZ + Math.sin(time * 0.5 + randomOffset) * 0.03;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[0.42, 0.08, 0.28]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.35}
        metalness={0}
        emissive={color}
        emissiveIntensity={0.45}
      />
    </mesh>
  );
};

// Glass Jar with realistic mason jar shape
const GlassJar = ({
  isHovered,
  isClicked,
  showNote,
  onHover,
  onClick,
  onRotationChange
}: { 
  isHovered: boolean;
  isClicked: boolean;
  showNote: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  onRotationChange: (rotation: { x: number; y: number }) => void;
}) => {
  const jarRef = useRef<THREE.Group>(null!);
  const capRef = useRef<THREE.Group>(null!);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const targetRotationX = useRef(0);
  const targetRotationY = useRef(0);
  const currentRotation = useRef({ x: 0, y: 0 });
  const [jarRotation, setJarRotation] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Create classic mason jar shape matching reference
  const jarGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    
    const radius = 1.0;
    const cornerRadius = 0.35;
    
    // A. Floor (center to start of curve)
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(radius - cornerRadius, 0));
    
    // B. Rounded bottom corner
    const segments = 10;
    for (let i = 1; i <= segments; i++) {
      const theta = (i / segments) * (Math.PI / 2);
      const x = (radius - cornerRadius) + (Math.sin(theta) * cornerRadius);
      const y = (1 - Math.cos(theta)) * cornerRadius;
      points.push(new THREE.Vector2(x, y));
    }
    
    // C. Vertical wall up to neck
    points.push(new THREE.Vector2(radius, 1.7));
    
    // D. Neck & rim
    points.push(new THREE.Vector2(0.8, 2.0));  // Neck tapering in
    points.push(new THREE.Vector2(0.8, 2.35)); // Neck straight up
    points.push(new THREE.Vector2(0.93, 2.35)); // Rim flaring out
    points.push(new THREE.Vector2(0.93, 2.15)); // Rim lip going down
    points.push(new THREE.Vector2(0.73, 2.15)); // Inside neck finish
    
    const geometry = new THREE.LatheGeometry(points, 64);
    geometry.translate(0, -1.15, 0);
    return geometry;
  }, []);

  useFrame((state) => {
    if (!jarRef.current || !capRef.current) return;
    const time = state.clock.elapsedTime;
    
    const prevRotY = jarRef.current.rotation.y;
    const prevRotX = jarRef.current.rotation.x;
    
    if (isHovered) {
      targetRotationY.current = mouseX.current * 0.25;
      targetRotationX.current = mouseY.current * 0.12;
    } else {
      targetRotationY.current = Math.sin(time * 0.4) * 0.06;
      targetRotationX.current = Math.sin(time * 0.25) * 0.02;
    }
    
    if (isClicked) {
      targetRotationY.current += Math.sin(time * 18) * 0.08;
      targetRotationX.current += Math.cos(time * 14) * 0.04;
    }
    
    jarRef.current.rotation.y += (targetRotationY.current - jarRef.current.rotation.y) * 0.06;
    jarRef.current.rotation.x += (targetRotationX.current - jarRef.current.rotation.x) * 0.06;
    jarRef.current.position.y = Math.sin(time * 0.6) * 0.04;
    
    // Calculate rotation delta for physics
    const deltaRotY = jarRef.current.rotation.y - prevRotY;
    const deltaRotX = jarRef.current.rotation.x - prevRotX;
    currentRotation.current = { x: deltaRotX * 10, y: deltaRotY * 10 };
    setJarRotation(currentRotation.current);
    
    const targetY = showNote ? 1.55 : isClicked ? 1.45 : isHovered ? 1.32 : 1.22;
    const targetRotXCap = showNote ? -0.2 : isClicked ? -0.15 : isHovered ? -0.05 : 0;
    capRef.current.position.y += (targetY - capRef.current.position.y) * 0.08;
    capRef.current.rotation.x += (targetRotXCap - capRef.current.rotation.x) * 0.08;
  });

  // More vibrant notes - filling the jar
  const notes = useMemo(() => [
    // Bottom layer (densely packed)
    { position: [0.22, -0.78, 0.18] as [number, number, number], rotation: [0.1, 0.3, 0.2] as [number, number, number], color: '#ec4899', scale: 1.0 },
    { position: [-0.25, -0.75, 0.12] as [number, number, number], rotation: [-0.15, -0.2, -0.25] as [number, number, number], color: '#a855f7', scale: 0.95 },
    { position: [0.0, -0.72, -0.2] as [number, number, number], rotation: [0.08, 0.5, 0.15] as [number, number, number], color: '#f472b6', scale: 0.9 },
    { position: [-0.18, -0.7, -0.1] as [number, number, number], rotation: [0.2, -0.4, 0.1] as [number, number, number], color: '#d946ef', scale: 0.88 },
    { position: [0.15, -0.68, -0.08] as [number, number, number], rotation: [-0.1, 0.6, -0.2] as [number, number, number], color: '#fb7185', scale: 0.92 },
    // Lower-middle layer
    { position: [-0.12, -0.55, 0.22] as [number, number, number], rotation: [-0.1, 0.2, -0.3] as [number, number, number], color: '#c084fc', scale: 1.0 },
    { position: [0.28, -0.52, 0.05] as [number, number, number], rotation: [0.15, -0.3, 0.35] as [number, number, number], color: '#f9a8d4', scale: 0.95 },
    { position: [0.0, -0.48, 0.2] as [number, number, number], rotation: [-0.05, 0.4, -0.15] as [number, number, number], color: '#e879f9', scale: 0.88 },
    { position: [-0.25, -0.45, 0.0] as [number, number, number], rotation: [0.12, -0.15, 0.28] as [number, number, number], color: '#a78bfa', scale: 0.9 },
    { position: [0.2, -0.42, -0.15] as [number, number, number], rotation: [-0.08, 0.35, -0.12] as [number, number, number], color: '#ec4899', scale: 0.85 },
    // Upper-middle layer
    { position: [0.15, -0.32, 0.15] as [number, number, number], rotation: [0.12, 0.15, 0.25] as [number, number, number], color: '#d946ef', scale: 0.92 },
    { position: [-0.22, -0.28, 0.1] as [number, number, number], rotation: [-0.08, -0.25, -0.2] as [number, number, number], color: '#fb7185', scale: 0.88 },
    { position: [0.05, -0.25, 0.22] as [number, number, number], rotation: [0.1, 0.35, 0.1] as [number, number, number], color: '#a78bfa', scale: 0.85 },
    { position: [-0.1, -0.22, -0.12] as [number, number, number], rotation: [-0.15, -0.4, 0.18] as [number, number, number], color: '#f472b6', scale: 0.9 },
    // Top layer
    { position: [0.12, -0.1, 0.08] as [number, number, number], rotation: [0.05, 0.2, -0.15] as [number, number, number], color: '#c084fc', scale: 0.82 },
    { position: [-0.15, -0.05, 0.15] as [number, number, number], rotation: [-0.12, -0.18, 0.22] as [number, number, number], color: '#e879f9', scale: 0.78 },
    { position: [0.0, 0.0, 0.05] as [number, number, number], rotation: [0.08, 0.3, 0.08] as [number, number, number], color: '#f9a8d4', scale: 0.75 },
  ], []);

  return (
    <group ref={jarRef}>
      {/* Glass jar body - realistic clear glass */}
      <mesh 
        geometry={jarGeometry}
        onPointerEnter={() => onHover(true)}
        onPointerLeave={() => onHover(false)}
        onClick={onClick}
      >
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0}
          roughness={0.02}
          transmission={0.95}
          thickness={0.8}
          side={THREE.DoubleSide}
          clearcoat={1}
          clearcoatRoughness={0.05}
          ior={1.52}
          envMapIntensity={1.2}
          transparent
          opacity={0.35}
        />
      </mesh>
      
      {/* Folded notes inside - with physics */}
      {notes.map((note, i) => (
        <FoldedNote 
          key={i}
          position={note.position}
          rotation={note.rotation}
          color={note.color}
          scale={note.scale}
          isShaking={isClicked}
          jarRotation={jarRotation}
        />
      ))}
      
      {/* Deep purple cap - flat, no handle */}
      <group ref={capRef} position={[0, 1.2, 0]}>
        <mesh>
          <cylinderGeometry args={[1.0, 1.0, 0.25, 64]} />
          <meshStandardMaterial 
            color="#2e1065"
            roughness={0.65}
            metalness={0.1}
          />
        </mesh>
        {/* Subtle cap detail */}
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.93, 1.0, 0.06, 64]} />
          <meshStandardMaterial 
            color="#3b0764"
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
        {/* Vivlit logo - embossed effect with shadow layer */}
        <Text
          position={[0, 0.165, 0.008]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.36}
          color="#1e0533"
          anchorX="center"
          anchorY="middle"
        >
          Vivlit
        </Text>
        {/* Vivlit logo - highlight layer on top */}
        <Text
          position={[0, 0.17, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.36}
          color="#e9d5ff"
          anchorX="center"
          anchorY="middle"
        >
          Vivlit
        </Text>
      </group>
      
      {/* Soft natural shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <circleGeometry args={[1.1, 64]} />
        <meshBasicMaterial 
          color="#2d1b4e" 
          transparent 
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

const Scene = ({ 
  isHovered,
  isClicked,
  showNote,
  onHover,
  onClick,
  onRotationChange
}: { 
  isHovered: boolean;
  isClicked: boolean;
  showNote: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  onRotationChange: (rotation: { x: number; y: number }) => void;
}) => {
  const { camera } = useThree();
  useEffect(() => {
    // Front-facing view, slightly elevated for a nice angle
    camera.position.set(0, 0.8, 5.5);
    camera.lookAt(0, 0.2, 0);
  }, [camera]);

  return (
    <>
      {/* Orbit controls for rotation */}
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        rotateSpeed={0.5}
      />
      
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 8, 5]} intensity={1.2} />
      <directionalLight position={[-3, 5, -3]} intensity={0.5} />
      <pointLight position={[0, -2, 3]} intensity={0.4} color="#ffd4e5" />
      
      <group position={[0, -0.3, 0]}>
        <Float 
          speed={1.2} 
          rotationIntensity={0.02} 
          floatIntensity={0.1}
          floatingRange={[-0.02, 0.02]}
        >
          <GlassJar 
            isHovered={isHovered}
            isClicked={isClicked}
            showNote={showNote}
            onHover={onHover}
            onClick={onClick}
            onRotationChange={onRotationChange}
          />
        </Float>
      </group>
      
      <Environment preset="apartment" />
    </>
  );
};

// Note reveal overlay
const NoteOverlay = ({ 
  isVisible, 
  onClose 
}: { 
  isVisible: boolean; 
  onClose: () => void;
}) => {
  const messages = [
    "✨ You are doing better than you think ✨",
    "💕 Someone is grateful you exist 💕",
    "🌟 Your smile makes a difference 🌟",
    "💫 Today is full of possibilities 💫",
    "🦋 You're braver than you believe 🦋",
  ];
  
  const message = useMemo(() => messages[Math.floor(Math.random() * messages.length)], [isVisible]);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop blur */}
          <motion.div 
            className="absolute inset-0 bg-black/20 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Note card */}
          <motion.div
            className="relative bg-gradient-to-b from-amber-50 to-orange-50 w-72 h-96 rounded-2xl shadow-2xl flex items-center justify-center p-8"
            style={{
              boxShadow: '0 30px 90px rgba(0,0,0,0.32), inset 0 0 0 1px rgba(255,255,255,0.6)',
            }}
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <p className="font-heading text-2xl text-primary text-center leading-relaxed">
              {message}
            </p>
            
            {/* Corner fold effect */}
            <div 
              className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-white/60 to-transparent"
              style={{
                clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
              }}
            />
          </motion.div>
          
          {/* Hint to close */}
          <motion.p
            className="absolute bottom-20 text-white/80 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Click anywhere to close
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Interactive3DJar = ({ onInteraction }: Interactive3DJarProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [jarRotation, setJarRotation] = useState({ x: 0, y: 0 });

  const handleHover = (hovered: boolean) => {
    setIsHovered(hovered);
    onInteraction?.(hovered);
  };

  const handleRotationChange = (rotation: { x: number; y: number }) => {
    setJarRotation(rotation);
  };

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
      setShowNote(true);
    }, 500);
  };

  const handleCloseNote = () => {
    setShowNote(false);
  };

  return (
    <div className="w-full h-[400px] md:h-[500px] cursor-pointer">
      <Canvas
        camera={{ position: [0, 0.8, 5.5], fov: 40 }}
        style={{ background: 'transparent' }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false
        }}
        dpr={[1, 2]}
      >
        <Scene 
          isHovered={isHovered}
          isClicked={isClicked}
          showNote={showNote}
          onHover={handleHover}
          onClick={handleClick}
          onRotationChange={handleRotationChange}
        />
      </Canvas>
      
      <NoteOverlay isVisible={showNote} onClose={handleCloseNote} />
    </div>
  );
};

export default Interactive3DJar;
