import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, MessageSquare, X, MapPin, Navigation } from "lucide-react";
import { getIntelligentLocation, PAZIZO_HUBS, calculateDistance, UserLocation } from "../services/LocationService";

/**
 * LogisticsCallButton - An intelligent, location-aware floating action button
 * for Pazizo Energy.
 */

const CACHE_KEY = "pazizo_location_cache_v2";
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

interface CachedData {
  location: UserLocation;
  timestamp: number;
}

const DYNAMIC_COPY: Record<string, string> = {
  Lagos: "Tankers active near Apapa/Ikeja. Tap for priority dispatch.",
  Rivers: "Bulk supply available in PH. Lock in today's rate.",
  Kano: "Long-haul dispatch heading North. Tap for ETA.",
  Kaduna: "Long-haul dispatch heading North. Tap for ETA.",
  Default: "Fast Diesel Delivery Nationwide. Tap to Call.",
};

export default function LogisticsCallButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [nearestHub, setNearestHub] = useState<{ name: string; distance: number } | null>(null);

  const processLocation = useCallback((location: UserLocation) => {
    setUserLoc(location);
    
    // Find nearest hub
    let minDistance = Infinity;
    let closest = PAZIZO_HUBS[0];
    
    PAZIZO_HUBS.forEach(hub => {
      const dist = calculateDistance(location.latitude, location.longitude, hub.lat, hub.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = hub;
      }
    });
    
    setNearestHub({ name: closest.name, distance: Math.round(minDistance) });
  }, []);

  const fetchLocation = useCallback(async () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { location, timestamp }: CachedData = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          processLocation(location);
          return;
        }
      }

      const location = await getIntelligentLocation();
      processLocation(location);
      
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        location,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error("Intelligent Location Error:", error);
    }
  }, [processLocation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      fetchLocation();
    }, 3000);

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) setShowExitIntent(true);
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [fetchLocation]);

  const stateName = userLoc?.state || "Default";
  const copy = DYNAMIC_COPY[stateName] || DYNAMIC_COPY.Default;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3 pointer-events-none">
      {/* Intelligent Status Badge */}
      <AnimatePresence>
        {isVisible && nearestHub && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="pointer-events-auto bg-white/95 backdrop-blur shadow-xl border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3 mb-1"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                Logistics Status
              </span>
              <span className="text-xs font-bold text-slate-800">
                {nearestHub.distance}km from {nearestHub.name}
              </span>
            </div>
            <Navigation size={14} className="text-pazizo-green ml-1" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Intent Tooltip */}
      <AnimatePresence>
        {showExitIntent && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pointer-events-auto bg-[#0B1221] text-white p-4 rounded-2xl shadow-2xl border border-[#FF6B00]/30 max-w-[280px] mb-2 relative"
          >
            <button 
              onClick={() => setShowExitIntent(false)}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
            >
              <X size={12} />
            </button>
            <p className="text-sm font-bold leading-tight">
              Wait! Get a quote before the price changes in {userLoc?.city || "your area"}.
            </p>
            <div className="mt-2 flex gap-2">
              <a 
                href="tel:+234800PAZIZO" 
                className="text-[10px] bg-[#FF6B00] px-3 py-1 rounded-full font-black uppercase"
              >
                Call Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interaction Area */}
      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        <AnimatePresence>
          {isVisible && (
            <>
              {/* Secondary WhatsApp Button */}
              <motion.a
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href={`https://wa.me/234800729496?text=I'm%20at%20${userLoc?.city || 'my%20location'}%20and%20need%20diesel`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white p-3 rounded-full shadow-lg flex items-center gap-2 group"
              >
                <MessageSquare size={20} />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-bold whitespace-nowrap">
                  Send Location
                </span>
              </motion.a>

              {/* Primary Call Button */}
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 10,
                  }}
                  className="absolute inset-0 bg-[#FF6B00] rounded-full -z-10"
                />

                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-center"
                >
                  <a
                    href="tel:+234800PAZIZO"
                    onMouseEnter={() => setIsExpanded(true)}
                    onMouseLeave={() => setIsExpanded(false)}
                    className="flex items-center bg-[#0B1221] text-white rounded-full shadow-2xl border-2 border-[#FF6B00] overflow-hidden transition-all duration-500"
                  >
                    <div className="relative bg-[#FF6B00] p-4 sm:p-5">
                      <Phone className="text-[#0B1221] w-6 h-6 sm:w-7 sm:h-7" />
                      <span className="absolute top-3 right-3 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                    </div>

                    <motion.div
                      animate={{ width: isExpanded ? "auto" : "0px", opacity: isExpanded ? 1 : 0 }}
                      className="hidden md:flex flex-col pr-6 pl-4 overflow-hidden whitespace-nowrap"
                    >
                      <span className="text-[10px] uppercase tracking-widest font-black text-[#FF6B00]">
                        Talk to Dispatch
                      </span>
                      <span className="text-xs font-medium text-slate-300">
                        {copy}
                      </span>
                    </motion.div>
                    
                    <div className="md:hidden pr-4 pl-2 flex flex-col">
                       <span className="text-[8px] uppercase font-black text-[#FF6B00]">Live</span>
                    </div>
                  </a>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Location Indicator Badge */}
      <AnimatePresence>
        {isVisible && userLoc && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10"
          >
            <MapPin size={10} className="text-[#FF6B00]" />
            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">
              {userLoc.city}, {userLoc.state} ({userLoc.source.toUpperCase()})
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
