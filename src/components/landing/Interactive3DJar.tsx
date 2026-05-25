import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, Text, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

interface Interactive3DJarProps {
  onInteraction?: (isInteracting: boolean) => void;
}

// Folded paper note inside the jar (STATIC VERSION)
const FoldedNote = ({
  initialPos,
  rotation,
  color,
  scale = 1,
}: {
  id: number;
  initialPos: [number, number, number];
  rotation: [number, number, number];
  color: string;
  scale?: number;
}) => {
  return (
    <mesh position={initialPos} rotation={rotation} scale={scale}>
      <boxGeometry args={[0.42, 0.04, 0.3]} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
    </mesh>
  );
};

const GlassJar = ({
  isHovered,
  isClicked,
  showNote,
  onHover,
  onClick,
}: {
  isHovered: boolean;
  isClicked: boolean;
  showNote: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}) => {
  const jarRef = useRef<THREE.Group>(null!);
  const capRef = useRef<THREE.Group>(null!);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const targetRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const jarGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const radius = 1.0;
    const cornerRadius = 0.35;

    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(radius - cornerRadius, 0));

    const segments = 12;
    for (let i = 1; i <= segments; i++) {
      const theta = (i / segments) * (Math.PI / 2);
      const x = radius - cornerRadius + Math.sin(theta) * cornerRadius;
      const y = (1 - Math.cos(theta)) * cornerRadius;
      points.push(new THREE.Vector2(x, y));
    }

    points.push(new THREE.Vector2(radius, 1.65));
    points.push(new THREE.Vector2(0.82, 1.85));
    points.push(new THREE.Vector2(0.82, 2.0));
    points.push(new THREE.Vector2(0.88, 2.0));
    points.push(new THREE.Vector2(0.88, 2.05));
    points.push(new THREE.Vector2(0.78, 2.05));

    const geometry = new THREE.LatheGeometry(points, 64);
    geometry.translate(0, -1.15, 0);
    return geometry;
  }, []);

  // Only animate the Jar/Cap rotation/position based on hover (Interaction), not physics
  useFrame((state) => {
    if (!jarRef.current || !capRef.current) return;
    const time = state.clock.elapsedTime;

    if (isHovered) {
      targetRotation.current.y = mouseX.current * 0.5;
      targetRotation.current.x = mouseY.current * 0.25;
    } else {
      // Gentle idle sway
      targetRotation.current.y = Math.sin(time * 0.5) * 0.05;
      targetRotation.current.x = Math.cos(time * 0.3) * 0.02;
    }

    jarRef.current.rotation.y += (targetRotation.current.y - jarRef.current.rotation.y) * 0.1;
    jarRef.current.rotation.x += (targetRotation.current.x - jarRef.current.rotation.x) * 0.1;

    // Cap Animation
    const baseY = 0.92;
    const targetY = showNote ? baseY + 0.4 : isClicked ? baseY + 0.15 : isHovered ? baseY + 0.08 : baseY;
    const targetRotXCap = showNote ? -0.2 : isClicked ? -0.15 : isHovered ? -0.05 : 0;

    capRef.current.position.y += (targetY - capRef.current.position.y) * 0.08;
    capRef.current.rotation.x += (targetRotXCap - capRef.current.rotation.x) * 0.08;
  });

  const notes = useMemo(() => {
    const palette = ["#ec4899", "#a855f7", "#f472b6", "#d946ef", "#c084fc", "#f9a8d4", "#e879f9", "#a78bfa"];
    const count = 200;
    const generatedNotes = [];

    for (let i = 0; i < count; i++) {
      // STATIC GENERATION LOGIC:
      // Fill from bottom (-1.0) to about half height (0.1)
      const y = -1.0 + Math.random() * 1.1;

      const angle = Math.random() * Math.PI * 2;
      // Distribute them inside the cylinder radius
      const r = Math.sqrt(Math.random()) * 0.72;

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      generatedNotes.push({
        id: i,
        initialPos: [x, y, z] as [number, number, number],
        rotation: [(Math.random() - 0.5) * 1.0, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 1.0] as [
          number,
          number,
          number,
        ],
        color: palette[i % palette.length],
        scale: 0.9 + Math.random() * 0.2,
      });
    }
    return generatedNotes;
  }, []);

  return (
    <group ref={jarRef}>
      <mesh
        geometry={jarGeometry}
        onPointerEnter={() => onHover(true)}
        onPointerLeave={() => onHover(false)}
        onClick={onClick}
      >
        <meshPhysicalMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.05}
          transmission={1.0}
          thickness={0.25}
          roughness={0}
          metalness={0}
          clearcoat={1.0}
          clearcoatRoughness={0}
          ior={1.45}
          reflectivity={0.3}
          side={THREE.DoubleSide}
          envMapIntensity={5.0}
          transparent={true}
          opacity={1}
        />
      </mesh>

      {notes.map((note) => (
        <FoldedNote
          key={note.id}
          id={note.id}
          initialPos={note.initialPos}
          rotation={note.rotation}
          color={note.color}
          scale={note.scale}
        />
      ))}

      <group ref={capRef} position={[0, 0.92, 0]}>
        <mesh>
          <cylinderGeometry args={[0.94, 0.94, 0.25, 64]} />
          <meshStandardMaterial color="#2e1065" roughness={0.65} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.88, 0.94, 0.06, 64]} />
          <meshStandardMaterial color="#3b0764" roughness={0.6} metalness={0.1} />
        </mesh>
        <Text
          position={[0, 0.165, 0.008]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.32}
          color="#1e0533"
          anchorX="center"
          anchorY="middle"
        >
          Vivlit
        </Text>
        <Text
          position={[0, 0.17, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.32}
          color="#e9d5ff"
          anchorX="center"
          anchorY="middle"
        >
          Vivlit
        </Text>
      </group>
    </group>
  );
};

const Scene = ({
  isHovered,
  isClicked,
  showNote,
  onHover,
  onClick,
}: {
  isHovered: boolean;
  isClicked: boolean;
  showNote: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.8, 5.5);
    camera.lookAt(0, 0.2, 0);
  }, [camera]);

  return (
    <>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        rotateSpeed={0.5}
      />

      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 8, 5]} intensity={1.5} />
      <directionalLight position={[-3, 5, -3]} intensity={0.8} />
      <pointLight position={[0, -2, 3]} intensity={0.5} color="#ffd4e5" />

      <group position={[0, -0.3, 0]}>
        <GlassJar isHovered={isHovered} isClicked={isClicked} showNote={showNote} onHover={onHover} onClick={onClick} />
      </group>

      <ContactShadows
        resolution={512}
        scale={10}
        blur={2.5}
        opacity={0.4}
        far={10}
        color="#1a0525"
        position={[0, -1.6, 0]}
      />

      <Environment preset="city" />
    </>
  );
};

const NoteOverlay = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const messages = [
    "✨ You are capable of amazing things ✨",
    "💕 You make the world a softer place 💕",
    "🌟 Your potential is endless 🌟",
    "💫 Small steps are still progress 💫",
    "🦋 Trust the timing of your life 🦋",
    "🌻 Keep growing, keep glowing 🌻",
    "🌙 Rest is productive too 🌙",
    "💖 You are enough, just as you are 💖",
    "🌈 Storms don't last forever 🌈",
    "✨ Your energy is magnetic ✨",
    "🌿 Breathe. You’ve got this 🌿",
    "💌 You are loved more than you know 💌",
    "🌟 Believe in your own magic 🌟",
    "💫 Everything you need is within you 💫",
    "🌷 Bloom where you are planted 🌷",
    "🌞 You bring sunshine to others 🌞",
    "💪 You have survived 100% of your bad days 💪",
    "💕 Be kind to yourself today 💕",
    "✨ The best is yet to come ✨",
    "🌊 You are stronger than the waves 🌊",
    "🕊️ Peace begins with you 🕊️",
    "🌟 Focus on the good 🌟",
    "🦋 Embrace your own journey 🦋",
    "💫 Dream big, worry small 💫",
    "🍂 Let go of what you can't control 🍂",
    "💖 Your heart is pure gold 💖",
    "✨ Create your own happiness ✨",
    "🛤️ You are on the right path 🛤️",
    "🧘‍♀️ Inhale confidence, exhale doubt 🧘‍♀️",
    "🌟 You are a masterpiece in progress 🌟",
    "💕 Your feelings are valid 💕",
    "🌺 Good things take time 🌺",
    "💫 Make today count 💫",
    "🐢 Slow progress is still progress 🐢",
    "✨ You inspire people around you ✨",
    "🌈 Happiness looks good on you 🌈",
    "💖 Protect your peace 💖",
    "🌟 You are exactly where you need to be 🌟",
    "🦋 Don't forget to fly 🦋",
    "💫 You are worthy of all good things 💫",
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
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative bg-gradient-to-b from-amber-50 to-orange-50 w-72 h-96 rounded-2xl shadow-2xl flex items-center justify-center p-8"
            style={{ boxShadow: "0 30px 90px rgba(0,0,0,0.32), inset 0 0 0 1px rgba(255,255,255,0.6)" }}
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <p className="font-heading text-2xl text-primary text-center leading-relaxed">{message}</p>
            <div
              className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-white/60 to-transparent"
              style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
            />
          </motion.div>
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

  const handleHover = (hovered: boolean) => {
    setIsHovered(hovered);
    onInteraction?.(hovered);
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
    <div className="w-full h-[400px] md:h-[500px] cursor-pointer relative">
      <Canvas
        camera={{ position: [0, 0.8, 5.5], fov: 40 }}
        style={{ background: "transparent" }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 2]}
      >
        <Scene
          isHovered={isHovered}
          isClicked={isClicked}
          showNote={showNote}
          onHover={handleHover}
          onClick={handleClick}
        />
      </Canvas>
      <NoteOverlay isVisible={showNote} onClose={handleCloseNote} />
    </div>
  );
};

export default Interactive3DJar;
