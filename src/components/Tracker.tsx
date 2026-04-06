import React from 'react';
import { useOrders } from '../context/OrderContext';
import { motion } from 'motion/react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Search,
  ChevronRight,
  MapPin,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { OrderStatus } from '../types';

export default function Tracker() {
  const { orders } = useOrders();
  const [searchId, setSearchId] = React.useState('');
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);

  const filteredOrders = React.useMemo(() => {
    if (!searchId) return orders;
    return orders.filter(o => o.id.toLowerCase().includes(searchId.toLowerCase()));
  }, [orders, searchId]);

  const selectedOrder = React.useMemo(() => {
    return orders.find(o => o.id === selectedOrderId) || (filteredOrders.length > 0 ? filteredOrders[0] : null);
  }, [orders, selectedOrderId, filteredOrders]);

  const steps: { status: OrderStatus; icon: any; label: string; desc: string }[] = [
    { status: 'Processing', icon: Clock, label: 'Processing', desc: 'Order received and being verified' },
    { status: 'In Transit', icon: Truck, label: 'In Transit', desc: 'Diesel is on its way to your location' },
    { status: 'Delivered', icon: CheckCircle2, label: 'Delivered', desc: 'Successfully delivered and verified' },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === selectedOrder?.status);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Sidebar: Order List */}
      <div className="lg:col-span-1 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Order ID..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
          />
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
              <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <button
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all group",
                  selectedOrder?.id === order.id 
                    ? "bg-pazizo-green border-pazizo-green text-white shadow-lg shadow-pazizo-green/20" 
                    : "bg-white border-slate-100 hover:border-slate-300 text-slate-600"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold tracking-wider opacity-80">#{order.id}</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                    selectedOrder?.id === order.id ? "bg-white/20" : "bg-slate-100 text-slate-500"
                  )}>
                    {order.status}
                  </span>
                </div>
                <h4 className="font-bold truncate">{order.customerName}</h4>
                <div className="flex items-center gap-2 mt-2 opacity-80 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span>{order.state}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main: Order Details & Progress */}
      <div className="lg:col-span-2">
        {selectedOrder ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Order #{selectedOrder.id}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(selectedOrder.createdAt, 'MMM dd, yyyy HH:mm')}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedOrder.state}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
                <p className="text-2xl font-bold text-pazizo-green">₦{selectedOrder.totalPrice.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-8">
              {/* Progress Bar */}
              <div className="relative mb-16">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2" />
                <motion.div 
                  className="absolute top-1/2 left-0 h-1 bg-pazizo-green -translate-y-1/2"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                
                <div className="relative flex justify-between">
                  {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = idx <= currentStepIndex;
                    const isActive = idx === currentStepIndex;

                    return (
                      <div key={step.status} className="flex flex-col items-center">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 z-10",
                          isCompleted ? "bg-pazizo-green text-white shadow-lg shadow-pazizo-green/20" : "bg-white border-2 border-slate-100 text-slate-300"
                        )}>
                          <Icon className={cn("w-6 h-6", isActive && "animate-pulse")} />
                        </div>
                        <div className="mt-4 text-center">
                          <p className={cn(
                            "text-sm font-bold",
                            isCompleted ? "text-slate-900" : "text-slate-400"
                          )}>{step.label}</p>
                          <p className="text-[10px] text-slate-400 mt-1 max-w-[120px] leading-tight">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                <div className="space-y-4">
                  <h5 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Delivery Details</h5>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address</p>
                      <p className="text-sm text-slate-700 font-medium">{selectedOrder.address}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantity</p>
                      <p className="text-sm text-slate-700 font-medium">{selectedOrder.quantity} Liters</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Integrity Log</h5>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-pazizo-green mt-1.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Quality Check Passed</p>
                        <p className="text-[10px] text-slate-500">Density and purity verified at dispatch.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400">Final Verification</p>
                        <p className="text-[10px] text-slate-500">Pending delivery confirmation.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 border-dashed p-12 text-center">
            <Package className="w-16 h-16 text-slate-100 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Order Selected</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              Select an order from the list or search by ID to view real-time delivery progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
