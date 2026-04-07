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
  Menu,
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
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showPinModal, setShowPinModal] = React.useState(false);
  const [pinInput, setPinInput] = React.useState('');
  const [pinError, setPinError] = React.useState(false);
  const { settings } = useSettings();

  const handleStaffAccess = () => {
    setShowPinModal(true);
    setIsMenuOpen(false);
  };

  const verifyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === "PAZIZO2026") {
      setActiveTab('admin');
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
      setTimeout(() => setPinError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* PIN Modal */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-pazizo-green" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Staff Access</h3>
                      <p className="text-xs text-slate-500">Enter your secure PIN to continue</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(false); }}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={verifyPin} className="space-y-6">
                  <div className="relative">
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="••••••••"
                      autoFocus
                      className={cn(
                        "w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl text-center text-2xl tracking-[0.5em] font-bold focus:outline-none transition-all",
                        pinError 
                          ? "border-red-500 bg-red-50 text-red-500 animate-shake" 
                          : "border-transparent focus:border-pazizo-green focus:bg-white"
                      )}
                    />
                    {pinError && (
                      <p className="text-center text-xs font-bold text-red-500 mt-2">Invalid Access PIN</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                  >
                    Verify & Access Portal
                  </button>
                </form>
              </div>
              <div className="bg-slate-50 p-4 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure Admin Gateway</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              onClick={handleStaffAccess}
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
            
            {/* Hamburger Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-pazizo-green transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <button 
                  onClick={() => { setActiveTab('order'); setIsMenuOpen(false); }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all",
                    activeTab === 'order' ? "bg-pazizo-green/10 text-pazizo-green" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  Order Diesel
                </button>
                <button 
                  onClick={() => { setActiveTab('track'); setIsMenuOpen(false); }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all",
                    activeTab === 'track' ? "bg-pazizo-green/10 text-pazizo-green" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  Track Delivery
                </button>
                <button 
                  onClick={handleStaffAccess}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                    activeTab === 'admin' ? "bg-pazizo-green/10 text-pazizo-green" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Staff Portal
                </button>
                
                <div className="pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => { setShowConcierge(true); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 bg-pazizo-green text-white py-4 rounded-xl font-bold shadow-lg shadow-pazizo-green/20"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Chat with Concierge
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
