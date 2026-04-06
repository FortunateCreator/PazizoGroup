import React, { useState, useMemo } from 'react';
import { useOrders } from '../context/OrderContext';
import { NIGERIA_STATES, SPECIAL_MOQ_CITIES, PRICING_LOGIC } from '../types';
import { AlertCircle, CheckCircle2, Calculator, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface OrderFormProps {
  onSuccess: () => void;
}

export default function OrderForm({ onSuccess }: OrderFormProps) {
  const { addOrder } = useOrders();
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    state: 'Lagos',
    quantity: 1000,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moq = useMemo(() => {
    const isSpecial = SPECIAL_MOQ_CITIES.some(city => 
      formData.address.toLowerCase().includes(city.toLowerCase()) || 
      formData.state.toLowerCase().includes(city.toLowerCase())
    );
    return isSpecial ? 100 : 1000;
  }, [formData.address, formData.state]);

  const totalPrice = useMemo(() => {
    const multiplier = (PRICING_LOGIC.stateMultipliers as any)[formData.state] || 1.08;
    return formData.quantity * PRICING_LOGIC.basePrice * multiplier;
  }, [formData.quantity, formData.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.quantity < moq) {
      setError(`Minimum Order Quantity for this location is ${moq} Liters.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await addOrder({
        ...formData,
        totalPrice,
      });
      onSuccess();
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Full Name</label>
          <input
            required
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all"
            placeholder="John Doe"
            value={formData.customerName}
            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Phone Number</label>
          <input
            required
            type="tel"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all"
            placeholder="+234 ..."
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Email Address</label>
        <input
          required
          type="email"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all"
          placeholder="john@example.com"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">State</label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all bg-white"
            value={formData.state}
            onChange={e => setFormData({ ...formData, state: e.target.value })}
          >
            {NIGERIA_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Quantity (Liters)</label>
          <div className="relative">
            <input
              required
              type="number"
              min={moq}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">L</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Delivery Address</label>
        <textarea
          required
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all resize-none"
          placeholder="Enter full delivery address..."
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      {/* Pricing Summary */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Calculator className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Quote</span>
          </div>
          <div className="px-2 py-1 bg-pazizo-gold/20 text-pazizo-gold rounded text-[10px] font-bold uppercase tracking-wider">
            Live Rate
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-slate-400 text-sm">Total Amount</span>
          <span className="text-3xl font-bold text-pazizo-gold">
            ₦{totalPrice.toLocaleString()}
          </span>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>MOQ for this location: {moq}L</span>
          <span>Price per Liter: ₦{(totalPrice / formData.quantity).toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full bg-pazizo-green text-white py-4 rounded-xl font-bold text-lg hover:bg-pazizo-green/90 transition-all shadow-lg shadow-pazizo-green/20 flex items-center justify-center gap-2 group disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            Confirm Order
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        By confirming, you agree to our terms of service and quality integrity loop.
      </p>
    </form>
  );
}
