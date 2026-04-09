import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Zap, ShieldCheck, Truck } from "lucide-react";

export default function Hero() {
  const [liters, setLiters] = useState(500);
  const pricePerLiter = 1200; // Price in NGN

  return (
    <section id="hero" className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Accents */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 2, 0]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-pazizo-green/5 rounded-bl-[100px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 20, 0]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute -top-24 -left-24 -z-10 w-64 h-64 bg-pazizo-gold/10 rounded-full blur-3xl" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 50, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 120, 
              damping: 14,
              mass: 1.2
            }}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pazizo-green/10 text-pazizo-green font-semibold text-sm mb-6"
            >
              <ShieldCheck className="w-4 h-4" />
              Trusted by 5,000+ Businesses
            </motion.div>
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-8">
              Energy with <motion.span 
                initial={{ display: "inline-block", y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
                className="text-pazizo-green italic"
              >Integrity</motion.span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
              Premium fuel delivery services tailored for your business. 
              Transparent pricing, real-time tracking, and unmatched reliability.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <motion.a
                href="#order"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="bg-pazizo-green text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-pazizo-green/20 flex items-center gap-2"
              >
                Order Now <ArrowRight className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#about"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-full font-bold hover:border-pazizo-green/30 transition-colors"
              >
                Learn More
              </motion.a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8">
              <Feature icon={<Zap />} label="Fast Delivery" delay={0.6} />
              <Feature icon={<ShieldCheck />} label="Secure Payments" delay={0.7} />
              <Feature icon={<Truck />} label="Real-time GPS" delay={0.8} />
            </div>
          </motion.div>

          {/* Quick Calculator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 15, 
              delay: 0.3,
              mass: 1.5
            }}
            className="bg-white p-8 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 relative"
          >
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 12 }}
              transition={{ delay: 0.8, type: "spring", bounce: 0.7 }}
              className="absolute -top-6 -right-6 bg-pazizo-gold text-white p-4 rounded-2xl shadow-lg"
            >
              <span className="text-sm font-bold uppercase tracking-wider">Best Price</span>
            </motion.div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Quick Calculator</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-500">Volume (Liters)</label>
                  <span className="text-pazizo-green font-bold">{liters}L</span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="5000" 
                  step="50"
                  value={liters}
                  onChange={(e) => setLiters(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-pazizo-green"
                />
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500">Price per Liter</span>
                  <span className="font-medium">₦{pricePerLiter.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <span className="text-lg font-bold text-slate-900">Estimated Total</span>
                  <motion.span 
                    key={liters}
                    initial={{ scale: 1.2, color: "#D4AF37" }}
                    animate={{ scale: 1, color: "#2E7D32" }}
                    className="text-3xl font-black"
                  >
                    ₦{(liters * pricePerLiter).toLocaleString()}
                  </motion.span>
                </div>
              </div>

              <motion.a
                href="tel:+234800PAZIZO"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-pazizo-gold text-white py-4 rounded-2xl font-bold shadow-lg shadow-pazizo-gold/20 hover:bg-pazizo-gold/90 transition-colors flex items-center justify-center"
              >
                Lock in this Price
              </motion.a>
              
              <p className="text-center text-xs text-slate-400">
                *Final price may vary based on delivery location and real-time market rates.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, label, delay = 0 }: { icon: React.ReactNode; label: string; delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring" }}
      className="flex flex-col items-center gap-2"
    >
      <motion.div 
        whileHover={{ rotate: 15, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="w-12 h-12 rounded-2xl bg-pazizo-green/5 flex items-center justify-center text-pazizo-green"
      >
        {icon}
      </motion.div>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </motion.div>
  );
}
