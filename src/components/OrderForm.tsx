import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Mail, Phone, User, Send, AlertCircle, Home, Navigation } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getIntelligentLocation } from "../services/LocationService";

const orderSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  volume: z.number().min(100, "Minimum 100L"),
  deliveryAddress: z.string().min(10, "Please provide a detailed delivery address"),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function OrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [detectedLocation, setDetectedLocation] = useState<string>("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        setValue("fullName", u.displayName || "");
        setValue("email", u.email || "");
      }
    });

    // Try to pre-fill address with detected location
    getIntelligentLocation().then(loc => {
      setDetectedLocation(`${loc.city}, ${loc.state}`);
      if (!getValues("deliveryAddress")) {
        setValue("deliveryAddress", `${loc.city}, ${loc.state}`);
      }
    });

    return () => unsubscribe();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      volume: 500,
      fullName: auth.currentUser?.displayName || "",
      email: auth.currentUser?.email || "",
      deliveryAddress: "",
    },
  });

  const loginAndSubmit = async (data: OrderFormData) => {
    if (!user) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Login Error:", error);
        return;
      }
    }
    onSubmit(data);
  };

  const onSubmit = async (data: OrderFormData) => {
    if (!auth.currentUser) return;
    
    setIsSubmitting(true);
    try {
      // 1. Save to Firestore
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: auth.currentUser.uid,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        volume: data.volume,
        deliveryAddress: data.deliveryAddress,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // 2. Send Email via API
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: data.email,
          subject: "Order Received - Pazizo Energy",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h1 style="color: #2E7D32;">Order Received!</h1>
              <p>Thank you <strong>${data.fullName}</strong> for choosing Pazizo Energy.</p>
              <p>Your order <strong>#${orderRef.id.slice(0, 8)}</strong> has been successfully placed and is currently <strong>PENDING</strong>.</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Volume:</strong> ${data.volume}L</p>
                <p style="margin: 5px 0;"><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>
              </div>
              <p>You can track your order status in your <a href="${window.location.origin}" style="color: #2E7D32; font-weight: bold;">Dashboard</a>.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #999;">Pazizo Energy - Energy with Integrity</p>
            </div>
          `,
        }),
      });
      
      alert("Order placed successfully! You can track it in your dashboard.");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "orders");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="order" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Place Your Order</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Fill in your delivery details below. 
            Our team will handle the rest with integrity and speed.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Form Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100"
          >
            {!user && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="mb-8 p-4 bg-pazizo-gold/10 border border-pazizo-gold/20 rounded-2xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-pazizo-gold shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">
                  <strong>First time?</strong> You'll be asked to sign in with Google to track your order and access your dashboard.
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(loginAndSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  label="Full Name"
                  icon={<User className="w-4 h-4" />}
                  error={errors.fullName?.message}
                >
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    {...register("fullName")}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all"
                  />
                </FormField>

                <FormField
                  label="Email Address"
                  icon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message}
                >
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    {...register("email")}
                    type="email"
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all"
                  />
                </FormField>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  label="Phone Number"
                  icon={<Phone className="w-4 h-4" />}
                  error={errors.phone?.message}
                >
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    {...register("phone")}
                    placeholder="+234 800 000 0000"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all"
                  />
                </FormField>

                <FormField
                  label="Volume (Liters)"
                  icon={<MapPin className="w-4 h-4" />}
                  error={errors.volume?.message}
                >
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    {...register("volume", { valueAsNumber: true })}
                    type="number"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all"
                  />
                </FormField>
              </div>

              <FormField
                label="Delivery Address"
                icon={<Home className="w-4 h-4" />}
                error={errors.deliveryAddress?.message}
              >
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  {...register("deliveryAddress")}
                  placeholder="Street address, City, State"
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pazizo-green/20 focus:border-pazizo-green outline-none transition-all resize-none"
                />
                {detectedLocation && (
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> Detected: {detectedLocation}
                  </p>
                )}
              </FormField>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                disabled={isSubmitting}
                className="w-full bg-pazizo-green text-white py-4 rounded-2xl font-bold shadow-lg shadow-pazizo-green/20 hover:bg-pazizo-green/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : (
                  <>
                    {user ? "Confirm Order" : "Login & Order"} <Send className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FormField({ label, icon, children, error }: { label: string; icon: React.ReactNode; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        {children}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
