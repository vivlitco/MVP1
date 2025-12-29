import { motion } from 'framer-motion';

const notes = [
  { id: 1, content: "You make my heart smile 💕", color: "from-pink-200 to-pink-100", rotation: -8, x: "5%", y: "15%" },
  { id: 2, content: "Remember our first adventure?", color: "from-yellow-200 to-yellow-100", rotation: 5, x: "85%", y: "20%" },
  { id: 3, content: "I'm grateful for you ✨", color: "from-purple-200 to-purple-100", rotation: -3, x: "10%", y: "70%" },
  { id: 4, content: "You're my favorite person", color: "from-green-200 to-green-100", rotation: 7, x: "80%", y: "65%" },
  { id: 5, content: "Today I thought of you...", color: "from-blue-200 to-blue-100", rotation: -5, x: "15%", y: "45%" },
  { id: 6, content: "Always here for you 🤍", color: "from-orange-200 to-orange-100", rotation: 4, x: "75%", y: "40%" },
];

interface FloatingNoteProps {
  content: string;
  color: string;
  rotation: number;
  x: string;
  y: string;
  delay: number;
}

const FloatingNote = ({ content, color, rotation, x, y, delay }: FloatingNoteProps) => {
  return (
    <motion.div
      className={`absolute hidden md:block w-36 lg:w-44 p-3 lg:p-4 rounded-lg shadow-lg bg-gradient-to-br ${color} cursor-pointer select-none`}
      style={{ 
        left: x, 
        top: y,
        rotate: rotation,
      }}
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
      }}
      transition={{ 
        delay: delay,
        duration: 0.6,
        type: "spring",
        stiffness: 200,
      }}
      whileHover={{ 
        scale: 1.1, 
        rotate: 0,
        zIndex: 50,
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      drag
      dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
      dragElastic={0.1}
    >
      <p className="text-xs lg:text-sm text-gray-700 font-medium leading-relaxed">
        {content}
      </p>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white/50 rounded-full blur-sm" />
    </motion.div>
  );
};

const FloatingNotes = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="pointer-events-auto">
        {notes.map((note, index) => (
          <FloatingNote
            key={note.id}
            {...note}
            delay={0.5 + index * 0.15}
          />
        ))}
      </div>
    </div>
  );
};

export default FloatingNotes;