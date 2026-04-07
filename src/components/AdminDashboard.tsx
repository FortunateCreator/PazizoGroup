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
  LayoutDashboard,
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Order, OrderStatus } from '../types';

export default function AdminDashboard() {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const [smsNotification, setSmsNotification] = useState<{ id: string, message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Settings Form State
  const [formSettings, setFormSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const deliveryRate = orders.length > 0 
    ? ((orders.filter(o => o.status === 'Delivered').length / orders.length) * 100).toFixed(1)
    : '0.0';

  const stats = [
    { label: 'Total Revenue', value: `₦${orders.reduce((acc, o) => acc + o.totalPrice, 0).toLocaleString()}`, icon: TrendingUp, color: 'text-pazizo-green' },
    { label: 'Active Orders', value: orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length, icon: Package, color: 'text-pazizo-gold' },
    { label: 'Customers', value: new Set(orders.map(o => o.email)).size, icon: Users, color: 'text-blue-500' },
    { label: 'Delivery Rate', value: `${deliveryRate}%`, icon: BarChart3, color: 'text-purple-500' },
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

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm(`Are you sure you want to delete order #${orderId}?`)) {
      await deleteOrder(orderId);
    }
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'State', 'Address', 'Quantity', 'Total Price', 'Status', 'Date'];
    const rows = orders.map(o => [
      o.id,
      o.customerName,
      o.email,
      o.phone,
      o.state,
      `"${o.address}"`,
      o.quantity,
      o.totalPrice,
      o.status,
      o.createdAt.toISOString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `pazizo_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
            <div className="p-6 border-b border-slate-100 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-bold text-slate-900">Order Management</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-pazizo-green/10 text-pazizo-green rounded-full">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Live System</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text"
                    placeholder="Search by ID, name or email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pazizo-green/20 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-slate-400 w-4 h-4" />
                  <select 
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-pazizo-green/20"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <option value="All">All Status</option>
                    <option value="Processing">Processing</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
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
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map(order => (
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
                        <div className="flex items-center justify-end gap-2">
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
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-slate-400 hover:text-pazizo-green transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No orders found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Order Details</h3>
                    <p className="text-slate-500 font-medium">#{selectedOrder.id}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>
                
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Customer Information</p>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">{selectedOrder.customerName}</p>
                          <p className="text-sm text-slate-600">{selectedOrder.email}</p>
                          <p className="text-sm text-slate-600">{selectedOrder.phone}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Delivery Address</p>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">{selectedOrder.state}</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{selectedOrder.address}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Order Summary</p>
                        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Quantity</span>
                            <span className="font-bold text-slate-900">{selectedOrder.quantity} Liters</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Price per Liter</span>
                            <span className="font-bold text-slate-900">₦{(selectedOrder.totalPrice / selectedOrder.quantity).toLocaleString()}</span>
                          </div>
                          <div className="pt-3 border-t border-slate-200 flex justify-between">
                            <span className="font-bold text-slate-900">Total Price</span>
                            <span className="font-bold text-pazizo-green">₦{selectedOrder.totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Timeline</p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-xs">
                            <div className="w-2 h-2 rounded-full bg-pazizo-green" />
                            <span className="text-slate-500">Created:</span>
                            <span className="font-medium text-slate-900">{selectedOrder.createdAt.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <div className="w-2 h-2 rounded-full bg-pazizo-gold" />
                            <span className="text-slate-500">Last Update:</span>
                            <span className="font-medium text-slate-900">{selectedOrder.updatedAt.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          )}

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
