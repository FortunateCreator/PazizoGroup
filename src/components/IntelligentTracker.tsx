import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navigation, Truck, Clock, MapPin } from "lucide-react";
import { getIntelligentLocation, PAZIZO_HUBS, calculateDistance, UserLocation } from "../services/LocationService";

export default function IntelligentTracker() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [nearestHub, setNearestHub] = useState<{ name: string; distance: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const loc = await getIntelligentLocation();
        setLocation(loc);

        let minDistance = Infinity;
        let closest = PAZIZO_HUBS[0];

        PAZIZO_HUBS.forEach(hub => {
          const dist = calculateDistance(loc.latitude, loc.longitude, hub.lat, hub.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closest = hub;
          }
        });

        setNearestHub({ name: closest.name, distance: Math.round(minDistance) });
      } catch (error) {
        console.error("Tracker Init Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  if (isLoading) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8"
      >
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* User Location */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pazizo-green/10 flex items-center justify-center text-pazizo-green">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                Your Location
              </p>
              <h4 className="text-lg font-bold text-slate-900">
                {location?.city}, {location?.state}
              </h4>
              <p className="text-xs text-slate-500">
                Detected via {location?.source.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Logistics Status */}
          <div className="flex items-center gap-4 border-y md:border-y-0 md:border-x border-slate-100 py-6 md:py-0 md:px-8">
            <div className="w-12 h-12 rounded-2xl bg-pazizo-gold/10 flex items-center justify-center text-pazizo-gold">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                Nearest Hub
              </p>
              <h4 className="text-lg font-bold text-slate-900">
                {nearestHub?.name}
              </h4>
              <p className="text-xs text-slate-500">
                {nearestHub?.distance}km away from your site
              </p>
            </div>
          </div>

          {/* Delivery ETA */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                Estimated Delivery
              </p>
              <h4 className="text-lg font-bold text-slate-900">
                {nearestHub && nearestHub.distance < 50 ? "Under 2 Hours" : "Same Day Delivery"}
              </h4>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-green-600">Dispatch Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Visual */}
        <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col gap-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>{nearestHub?.name}</span>
            <div className="flex items-center gap-2 text-pazizo-green">
              <Truck className="w-4 h-4 animate-bounce" />
              <span>In Transit</span>
            </div>
            <span>Your Site</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "65%" }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute h-full bg-gradient-to-r from-pazizo-green to-pazizo-gold rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
