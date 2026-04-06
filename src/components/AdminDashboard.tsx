import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useSettings } from '../context/SettingsContext';
import { 
  BarChart3, 
  Users, 
  Package, 
  TrendingUp,
  CheckCircle2,
  Truck,
  Clock,
  AlertCircle,
  Settings as SettingsIcon,
  Globe,
  Phone,
  Image as ImageIcon,
  Save,
  Upload,
  Loader2,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { OrderStatus } from '../types';

export default function AdminDashboard() {
  const { orders, updateOrderStatus } = useOrders();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const [smsNotification, setSmsNotification] = useState<{ id: string, message: string } | null>(null);
  
  // Settings Form State
  const [formSettings, setFormSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const stats = [
    { label: 'Total Revenue', value: `₦${orders.reduce((acc, o) => acc + o.totalPrice, 0).toLocaleString()}`, icon: TrendingUp, color: 'text-pazizo-green' },
    { label: 'Active Orders', value: orders.filter(o => o.status !== 'Delivered').length, icon: Package, color: 'text-pazizo-gold' },
    { label: 'Customers', value: new Set(orders.map(o => o.email)).size, icon: Users, color: 'text-blue-500' },
    { label: 'Delivery Rate', value: '98.4%', icon: BarChart3, color: 'text-purple-500' },
  ];

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
    setSmsNotification({ 
      id: orderId, 
      message: `SMS Alert sent to customer for Order #${orderId}` 
    });
    setTimeout(() => setSmsNotification(null), 3000);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateSettings(formSettings);
    setIsSaving(false);
    alert("Website settings updated successfully! Changes are now live.");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormSettings(prev => ({ ...prev, heroImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Staff Portal</h2>
          <p className="text-slate-500">Manage nationwide logistics and website configuration.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'orders' ? "bg-white text-pazizo-green shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Package className="w-4 h-4" />
            Orders
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'settings' ? "bg-white text-pazizo-green shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <SettingsIcon className="w-4 h-4" />
            Website Settings
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4", stat.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                </div>
              );
            })}
          </div>

          {/* Order Management Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Recent Orders</h3>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-pazizo-green/10 text-pazizo-green rounded-full">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Live System</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantity</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-900">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{order.customerName}</span>
                          <span className="text-xs text-slate-500">{order.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{order.state}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">{order.quantity}L</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          order.status === 'Processing' && "bg-amber-100 text-amber-700",
                          order.status === 'In Transit' && "bg-blue-100 text-blue-700",
                          order.status === 'Delivered' && "bg-pazizo-green/10 text-pazizo-green",
                          order.status === 'Cancelled' && "bg-red-100 text-red-700",
                        )}>
                          {order.status === 'Processing' && <Clock className="w-3 h-3" />}
                          {order.status === 'In Transit' && <Truck className="w-3 h-3" />}
                          {order.status === 'Delivered' && <CheckCircle2 className="w-3 h-3" />}
                          {order.status === 'Cancelled' && <AlertCircle className="w-3 h-3" />}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            className="text-xs font-bold bg-slate-100 border-none rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-pazizo-green/20"
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          >
                            <option value="Processing">Process</option>
                            <option value="In Transit">Ship</option>
                            <option value="Delivered">Deliver</option>
                            <option value="Cancelled">Cancel</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No orders to display.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SMS Toast Notification */}
          {smsNotification && (
            <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 z-50">
              <div className="w-8 h-8 bg-pazizo-green/20 text-pazizo-green rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">SMS Alert Sent</p>
                <p className="text-xs text-slate-400">{smsNotification.message}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-pazizo-green/10 text-pazizo-green rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">General Branding</h3>
                  <p className="text-sm text-slate-500">Manage how your brand appears across the platform.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Brand Name</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all"
                    value={formSettings.brandName}
                    onChange={e => setFormSettings({ ...formSettings, brandName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">WhatsApp Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="text"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all"
                      placeholder="e.g. 2348000000000"
                      value={formSettings.contactNumber}
                      onChange={e => setFormSettings({ ...formSettings, contactNumber: e.target.value })}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                    Include country code without "+" (e.g. 234 for Nigeria)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-pazizo-green/10 text-pazizo-green rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Visual Assets</h3>
                  <p className="text-sm text-slate-500">Update the hero image and other marketing visuals.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative group">
                  <img 
                    src={formSettings.heroImage} 
                    alt="Hero Preview" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="font-bold">Upload New Image</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Or use Image URL</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all"
                    placeholder="https://..."
                    value={formSettings.heroImage}
                    onChange={e => setFormSettings({ ...formSettings, heroImage: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-8 text-white sticky top-24">
              <h4 className="font-bold text-lg mb-4">Publish Changes</h4>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                Updating these settings will immediately change the live website's branding, contact information, and hero visuals.
              </p>
              
              <button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full bg-pazizo-green text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-pazizo-green/90 transition-all shadow-lg shadow-pazizo-green/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save & Publish
                  </>
                )}
              </button>
              
              <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-pazizo-green" />
                  <span>WhatsApp Link Updated</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-pazizo-green" />
                  <span>Hero Visuals Synced</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-pazizo-green" />
                  <span>Branding Propagated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
