import React, { useState, useEffect } from "react";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, onSnapshot, doc, updateDoc, getDocs, orderBy } from "firebase/firestore";
import { motion } from "motion/react";
import { Shield, Users, Package, CheckCircle2, Truck, Clock, UserPlus } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: 'admin' | 'client' | 'content_marketing' | 'logistics_partner';
}

interface Order {
  id: string;
  userId: string;
  fullName: string;
  volume: number;
  status: 'pending' | 'in-transit' | 'delivered';
  createdAt: any;
}

export default function AdminPortal() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setUsers(usersData);
    });

    const unsubscribeOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeOrders();
    };
  }, []);

  const updateRole = async (uid: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  if (loading) return <div className="pt-32 text-center">Loading Admin Portal...</div>;

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="mb-12 flex flex-wrap justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-pazizo-gold" />
            Admin Portal
          </h1>
          <p className="text-slate-500">Manage roles, logistics, and order fulfillment.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Package className="w-4 h-4" />} label="Orders" />
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users className="w-4 h-4" />} label="Users" />
        </div>
      </header>

      {activeTab === 'orders' ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Order Fulfillment</h2>
          <div className="grid gap-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                layout
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap justify-between items-center gap-6"
              >
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-slate-900">{order.fullName}</span>
                    <span className="text-xs font-mono text-slate-400">#{order.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-500">
                    <span>{order.volume}L</span>
                    <span>{order.createdAt?.toDate().toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
                  <StatusAction active={order.status === 'pending'} onClick={() => updateOrderStatus(order.id, 'pending')} icon={<Clock className="w-4 h-4" />} label="Pending" color="amber" />
                  <StatusAction active={order.status === 'in-transit'} onClick={() => updateOrderStatus(order.id, 'in-transit')} icon={<Truck className="w-4 h-4" />} label="In Transit" color="blue" />
                  <StatusAction active={order.status === 'delivered'} onClick={() => updateOrderStatus(order.id, 'delivered')} icon={<CheckCircle2 className="w-4 h-4" />} label="Delivered" color="emerald" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">User Role Management</h2>
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Current Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{user.fullName}</td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pazizo-green/10 text-pazizo-green">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(user.uid, e.target.value)}
                        className="text-xs font-bold bg-slate-100 border-0 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-pazizo-green/20 outline-none"
                      >
                        <option value="client">Client</option>
                        <option value="admin">Admin</option>
                        <option value="logistics_partner">Logistics Partner</option>
                        <option value="content_marketing">Content Marketing</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
        active ? "bg-white text-pazizo-green shadow-sm" : "text-slate-500 hover:text-slate-700")}
    >
      {icon}
      {label}
    </button>
  );
}

function StatusAction({ active, onClick, icon, label, color }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; color: string }) {
  const colors: any = {
    amber: active ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-amber-500 hover:bg-amber-50",
    blue: active ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-blue-500 hover:bg-blue-50",
    emerald: active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-emerald-500 hover:bg-emerald-50",
  };

  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all", colors[color])}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
