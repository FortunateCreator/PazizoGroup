import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "motion/react";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 250 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.closest('a') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.getAttribute('role') === 'button';
      
      setIsHovering(!!isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isVisible, mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        x,
        y,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <motion.div
        animate={{
          rotate: isHovering ? -15 : 0,
          scale: isHovering ? 1.2 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          originX: "25.2px", // Scaled tip position (42/60 * 36)
          originY: "4.8px",  // Scaled tip position (8/60 * 36)
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transform: "translate(-25.2px, -4.8px)", // Align scaled tip to mouse
          }}
        >
          {/* Golden Fuel Nozzle SVG */}
          {/* Handle */}
          <path
            d="M15 35L12 48C11.5 50 13 52 15 52H22C24 52 25.5 50 25 48L22 35"
            stroke="#D4AF37"
            strokeWidth="3"
            strokeLinejoin="round"
            fill="#D4AF37"
            fillOpacity="0.2"
          />
          {/* Body */}
          <path
            d="M18 35C18 35 8 35 8 25C8 15 18 15 18 15"
            stroke="#D4AF37"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Trigger */}
          <motion.path
            animate={{
              d: isHovering ? "M12 28L18 28" : "M10 28L18 28",
            }}
            d="M10 28L18 28"
            stroke="#D4AF37"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Spout */}
          <path
            d="M18 15L42 8"
            stroke="#D4AF37"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Tip Detail */}
          <path
            d="M40 8.5L44 7.5"
            stroke="#D4AF37"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Fuel Drop Effect on Hover */}
          <AnimatePresence>
            {isHovering && (
              <motion.circle
                initial={{ scale: 0, opacity: 0, y: 0 }}
                animate={{ 
                  scale: [0, 1, 0.5], 
                  opacity: [0, 1, 0],
                  y: 20,
                  x: 5
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                cx="42"
                cy="8"
                r="4"
                fill="#D4AF37"
              />
            )}
          </AnimatePresence>

          {/* Glow effect at tip */}
          <circle
            cx="42"
            cy="8"
            r="5"
            fill="#D4AF37"
            fillOpacity="0.4"
          >
            <animate
              attributeName="r"
              values="5;8;5"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </motion.div>
    </motion.div>
  );
}
