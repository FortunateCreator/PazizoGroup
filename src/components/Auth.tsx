import { useState } from "react";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "motion/react";
import { LogIn, LogOut, User as UserIcon, Shield } from "lucide-react";
import { useEffect } from "react";

export default function Auth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else {
            // Create initial profile
            const newProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              fullName: currentUser.displayName,
              role: "client",
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, "users", currentUser.uid), newProfile);
            setRole("client");
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) return <div className="animate-pulse h-10 w-24 bg-slate-200 rounded-full" />;

  if (!user) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={login}
        className="flex items-center gap-2 bg-pazizo-green text-white px-5 py-2 rounded-full font-medium shadow-sm hover:bg-pazizo-green/90 transition-colors"
      >
        <LogIn className="w-4 h-4" />
        Login
      </motion.button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden sm:flex flex-col items-end">
        <span className="text-sm font-bold text-slate-900">{user.displayName}</span>
        <span className="text-[10px] uppercase tracking-widest text-pazizo-gold font-black flex items-center gap-1">
          {role === 'admin' && <Shield className="w-3 h-3" />}
          {role?.replace('_', ' ')}
        </span>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={logout}
        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
        title="Logout"
      >
        <LogOut className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
