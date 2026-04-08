import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Phone } from "lucide-react";

export default function CallButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          href="tel:+2341234567890" // Placeholder Pazizo number
          initial={{ x: 100, opacity: 0, rotate: -45 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            rotate: 0,
            transition: { type: "spring", stiffness: 260, damping: 20, mass: 0.8, delay: 0.1 }
          }}
          whileHover={{ scale: 1.2, rotate: -10 }}
          whileTap={{ scale: 0.8, rotate: 10 }}
          className="fixed bottom-24 right-6 z-50 bg-pazizo-gold p-4 rounded-full shadow-lg cursor-pointer text-white"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 4,
            }}
          >
            <Phone className="w-8 h-8" />
          </motion.div>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
