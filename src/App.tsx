import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Fuel, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  MessageSquare, 
  LayoutDashboard,
  X,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { OrderProvider } from './context/OrderContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import OrderForm from './components/OrderForm';
import Tracker from './components/Tracker';
import Concierge from './components/Concierge';
import AdminDashboard from './components/AdminDashboard';
import WhatsAppButton from './components/WhatsAppButton';
import { cn } from './lib/utils';

function MainApp() {
  const [activeTab, setActiveTab] = React.useState<'order' | 'track' | 'admin'>('order');
  const [showConcierge, setShowConcierge] = React.useState(false);
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-pazizo-green rounded-lg flex items-center justify-center shadow-lg shadow-pazizo-green/20">
              <Fuel className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">{settings.brandName.split(' ')[0]}</h1>
              <p className="text-[10px] font-bold text-pazizo-gold tracking-[0.2em] mt-1">{settings.brandName.split(' ')[1] || 'ENERGY'}</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('order')}
              className={cn(
                "text-sm font-bold uppercase tracking-wider transition-colors",
                activeTab === 'order' ? "text-pazizo-green" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Order
            </button>
            <button 
              onClick={() => setActiveTab('track')}
              className={cn(
                "text-sm font-bold uppercase tracking-wider transition-colors",
                activeTab === 'track' ? "text-pazizo-green" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Track
            </button>
            <button 
              onClick={() => {
                const pin = prompt("Enter Staff PIN:");
                if (pin === "PAZIZO2026") {
                  setActiveTab('admin');
                } else if (pin !== null) {
                  alert("Invalid PIN");
                }
              }}
              className={cn(
                "text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-1",
                activeTab === 'admin' ? "text-pazizo-green" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Staff
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
              <ShieldCheck className="w-4 h-4 text-pazizo-green" />
              <span className="text-xs font-medium text-slate-600">Integrity Verified</span>
            </div>
            <button 
              onClick={() => setShowConcierge(true)}
              className="p-2 bg-pazizo-green/10 text-pazizo-green rounded-full hover:bg-pazizo-green/20 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'order' && (
            <motion.div
              key="order"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-12 items-start"
            >
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-pazizo-green/10 text-pazizo-green rounded-full mb-6">
                  <Truck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Nationwide Delivery</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                  Never Run Out of <br />
                  <span className="text-pazizo-green">Diesel Again.</span>
                </h2>
                <p className="text-xl text-slate-600 mb-8 max-w-lg leading-relaxed">
                  The most reliable diesel delivery in Nigeria. We solve the "Fuel Anxiety" with absolute integrity, pure quality, and guaranteed delivery within 24 hours.
                </p>
                
                <div className="flex flex-wrap items-center gap-6 mb-12">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <img 
                        key={i}
                        src={`https://picsum.photos/seed/user${i}/100/100`} 
                        alt="User" 
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-slate-900">Trusted by 500+ Businesses</p>
                    <div className="flex items-center gap-1 text-pazizo-gold">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <ShieldCheck key={i} className="w-3 h-3 fill-current" />
                      ))}
                      <span className="text-slate-500 ml-1 text-xs">Rated 4.9/5</span>
                    </div>
                  </div>
                </div>

                {/* Hero Image from Settings */}
                <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-12 shadow-xl border border-slate-100">
                  <img 
                    src={settings.heroImage} 
                    alt="Pazizo Energy Logistics" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-8">
                    <div className="flex items-center gap-2 text-white">
                      <ShieldCheck className="w-5 h-5 text-pazizo-green" />
                      <span className="text-sm font-bold uppercase tracking-widest">Premium Quality Guaranteed</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-pazizo-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Strategic MOQ</h4>
                      <p className="text-sm text-slate-500">100L for Abuja & Owerri. 1,000L for other states.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-pazizo-green" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Quality Guaranteed</h4>
                      <p className="text-sm text-slate-500">Every drop is tested for purity and performance.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={settings.heroImage} 
                    alt="Pazizo Energy" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h3 className="text-xl font-bold text-white">Request Delivery</h3>
                  </div>
                </div>
                <div className="p-8">
                  <OrderForm onSuccess={() => setActiveTab('track')} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'track' && (
            <motion.div
              key="track"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <Tracker />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pazizo-green rounded flex items-center justify-center">
                <Fuel className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-none">{settings.brandName.split(' ')[0]}</h1>
                <p className="text-[8px] font-bold text-pazizo-gold tracking-[0.2em] mt-1">{settings.brandName.split(' ')[1] || 'ENERGY'}</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              © 2026 {settings.brandName}. Part of Pazizo Group. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Concierge Overlay */}
      <AnimatePresence>
        {showConcierge && (
          <Concierge onClose={() => setShowConcierge(false)} />
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <OrderProvider>
        <MainApp />
      </OrderProvider>
    </SettingsProvider>
  );
}
