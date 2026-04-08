/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import OrderForm from "./components/OrderForm";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import CallButton from "./components/CallButton";
import Dashboard from "./components/Dashboard";
import AdminPortal from "./components/AdminPortal";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function App() {
  const [currentPage, setCurrentPage] = React.useState('home');
  const [user, setUser] = React.useState<any>(null);
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setRole(null);
        setCurrentPage('home');
      }
    });
    return () => unsubscribe();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'admin':
        return role === 'admin' ? <AdminPortal /> : <Hero />;
      default:
        return (
          <>
            <Hero />
            <OrderForm />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar onNavigate={setCurrentPage} />
      <main>
        {renderPage()}
      </main>
      <Footer />
      <CallButton />
      <WhatsAppButton />
    </div>
  );
}
