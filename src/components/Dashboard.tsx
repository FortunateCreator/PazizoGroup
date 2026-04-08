import React, { useState, useEffect } from "react";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { motion } from "motion/react";
import { Package, Clock, CheckCircle2, Truck, MapPin } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Order {
  id: string;
  volume: number;
  status: 'pending' | 'in-transit' | 'delivered';
  createdAt: any;
  location: { lat: number; lng: number };
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "orders");
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-pazizo-green border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-500">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900">Your Dashboard</h1>
        <p className="text-slate-500">Track your fuel deliveries and order history.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-pazizo-green" />
            Recent Orders
          </h2>

          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
              <p className="text-slate-400 mb-6">You haven't placed any orders yet.</p>
              <a href="#order" className="text-pazizo-green font-bold hover:underline">Place your first order</a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Order ID</span>
                      <span className="font-mono text-sm text-slate-600">#{order.id.slice(0, 8)}</span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-6">
                    <InfoItem label="Volume" value={`${order.volume}L`} />
                    <InfoItem label="Date" value={order.createdAt?.toDate().toLocaleDateString() || 'Pending...'} />
                    <InfoItem label="Location" value={`${order.location.lat.toFixed(4)}, ${order.location.lng.toFixed(4)}`} />
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Step active={true} label="Pending" icon={<Clock className="w-4 h-4" />} />
                        <Step active={order.status !== 'pending'} label="In Transit" icon={<Truck className="w-4 h-4" />} />
                        <Step active={order.status === 'delivered'} label="Delivered" icon={<CheckCircle2 className="w-4 h-4" />} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-pazizo-green p-8 rounded-3xl text-white shadow-xl shadow-pazizo-green/20">
            <h3 className="text-lg font-bold mb-4">Need Help?</h3>
            <p className="text-pazizo-green-100 text-sm mb-6 leading-relaxed">
              Our support team is available 24/7 to assist with your deliveries.
            </p>
            <button className="w-full bg-white text-pazizo-green py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors">
              Contact Support
            </button>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <StatRow label="Total Volume" value={`${orders.reduce((acc, o) => acc + o.volume, 0)}L`} />
              <StatRow label="Active Orders" value={orders.filter(o => o.status !== 'delivered').length.toString()} />
              <StatRow label="Completed" value={orders.filter(o => o.status === 'delivered').length.toString()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const styles = {
    'pending': 'bg-amber-50 text-amber-600 border-amber-100',
    'in-transit': 'bg-blue-50 text-blue-600 border-blue-100',
    'delivered': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider", styles[status])}>
      {status.replace('-', ' ')}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{label}</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}

function Step({ active, label, icon }: { active: boolean; label: string; icon: React.ReactNode }) {
  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors", 
      active ? "bg-pazizo-green/10 text-pazizo-green" : "bg-slate-50 text-slate-300")}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}
