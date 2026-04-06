import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

export default function WhatsAppButton() {
  const { settings } = useSettings();
  const phoneNumber = settings.contactNumber;
  const message = encodeURIComponent(`Hello ${settings.brandName}, I'm interested in a diesel delivery.`);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 left-8 z-50 flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-2xl shadow-[#25D366]/30 hover:bg-[#22c35e] transition-colors"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="font-bold text-sm">Chat with Us</span>
    </motion.a>
  );
}
