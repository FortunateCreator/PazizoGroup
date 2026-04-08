import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Leaf, LogIn, User, Menu, X, LayoutDashboard, Shield } from "lucide-react";
import { cn } from "@/src/lib/utils";
import Auth from "./Auth";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="bg-pazizo-green p-1.5 rounded-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-pazizo-green tracking-tight">
              PAZIZO <span className="text-pazizo-gold">ENERGY</span>
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#hero" onClick={() => onNavigate('home')}>Home</NavLink>
            <NavLink href="#order" onClick={() => onNavigate('home')}>Order Now</NavLink>
            {role && (
              <button 
                onClick={() => onNavigate('dashboard')}
                className="text-slate-600 hover:text-pazizo-green font-medium transition-colors flex items-center gap-1"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            )}
            {role === 'admin' && (
              <button 
                onClick={() => onNavigate('admin')}
                className="text-slate-600 hover:text-pazizo-green font-medium transition-colors flex items-center gap-1"
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            )}
            <Auth />
          </div>

          <div className="md:hidden flex items-center gap-4">
            <Auth />
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden overflow-hidden bg-white border-b border-slate-100"
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          <MobileNavLink href="#hero" onClick={() => { setIsOpen(false); onNavigate('home'); }}>Home</MobileNavLink>
          <MobileNavLink href="#order" onClick={() => { setIsOpen(false); onNavigate('home'); }}>Order Now</MobileNavLink>
          {role && (
            <button 
              onClick={() => { setIsOpen(false); onNavigate('dashboard'); }}
              className="w-full text-left px-3 py-4 text-base font-medium text-slate-600 hover:text-pazizo-green hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
          )}
          {role === 'admin' && (
            <button 
              onClick={() => { setIsOpen(false); onNavigate('admin'); }}
              className="w-full text-left px-3 py-4 text-base font-medium text-slate-600 hover:text-pazizo-green hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </button>
          )}
        </div>
      </motion.div>
    </nav>
  );
}

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <a 
      href={href} 
      onClick={onClick}
      className="text-slate-600 hover:text-pazizo-green font-medium transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pazizo-gold transition-all group-hover:w-full" />
    </a>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <a 
      href={href} 
      onClick={onClick}
      className="block px-3 py-4 text-base font-medium text-slate-600 hover:text-pazizo-green hover:bg-slate-50 rounded-lg transition-colors"
    >
      {children}
    </a>
  );
}
