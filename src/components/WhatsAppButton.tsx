import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export default function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          href="https://wa.me/1234567890" // Placeholder number
          target="_blank"
          rel="noopener noreferrer"
          initial={{ x: 100, opacity: 0, rotate: 45 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            rotate: 0,
            transition: { type: "spring", stiffness: 260, damping: 20, mass: 0.8 }
          }}
          whileHover={{ scale: 1.2, rotate: 10 }}
          whileTap={{ scale: 0.8, rotate: -10 }}
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] p-4 rounded-full shadow-lg cursor-pointer"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <svg
              viewBox="0 0 1000 1000"
              className="w-8 h-8 fill-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M500 0C223.8 0 0 223.8 0 500c0 88.3 22.9 171.2 63.1 243.2L0 1000l262.8-61.9C331.4 977.1 413.7 1000 500 1000c276.2 0 500-223.8 500-500S776.2 0 500 0zm270.2 710.2c-11.1 31.2-64.4 57.3-89.4 60.8-22.1 3.1-51.1 5.3-121.4-23.8-90.1-37.3-148.1-128.8-152.6-134.8-4.5-6-36.6-48.7-36.6-92.9 0-44.2 23.1-65.9 31.3-74.9 8.2-9 18-11.2 24-11.2 6 0 12 0 17.2.3 5.5.3 12.8-.8 20.1 16.7 7.5 18 25.5 62.3 27.8 66.8 2.3 4.5 3.8 9.8.8 15.8-3 6-4.5 9.8-9 15-4.5 5.3-9.5 11.8-13.5 15.8-4.5 4.5-9.2 9.5-4 18.5 5.3 9 23.3 38.3 50.1 62.1 34.5 30.7 63.6 40.3 72.6 44.8 9 4.5 14.3 3.8 19.5-2.3 5.3-6 22.5-26.3 28.5-35.3 6-9 12-7.5 20.3-4.5 8.3 3 52.6 24.8 61.6 29.3 9 4.5 15 6.8 17.2 10.5 2.2 3.7 2.2 21.7-8.9 52.9z" />
            </svg>
          </motion.div>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
