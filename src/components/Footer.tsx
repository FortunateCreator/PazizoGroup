import React from "react";
import { Leaf, Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LogisticsCompany",
    "name": "Pazizo Energy",
    "url": "https://pazizoenergy.com",
    "logo": "https://pazizoenergy.com/logo.png",
    "description": "Premium energy logistics and fuel delivery with integrity.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Energy Way",
      "addressLocality": "Lagos",
      "addressCountry": "Nigeria"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+234-800-PAZIZO",
      "contactType": "customer service"
    }
  };

  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-pazizo-green p-1.5 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                PAZIZO <span className="text-pazizo-gold">ENERGY</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Part of the Pazizo Group. Delivering energy with integrity across the continent. 
              Your trusted partner in fuel logistics.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Linkedin />} />
              <SocialIcon icon={<Twitter />} />
              <SocialIcon icon={<Facebook />} />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><FooterLink href="#hero">Home</FooterLink></li>
              <li><FooterLink href="#order">Order Fuel</FooterLink></li>
              <li><FooterLink href="#about">About Us</FooterLink></li>
              <li><FooterLink href="#careers">Careers</FooterLink></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Services</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><FooterLink href="#bulk">Bulk Delivery</FooterLink></li>
              <li><FooterLink href="#retail">Retail Supply</FooterLink></li>
              <li><FooterLink href="#logistics">Fleet Logistics</FooterLink></li>
              <li><FooterLink href="#consulting">Energy Consulting</FooterLink></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-pazizo-gold" />
                hello@pazizoenergy.com
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-pazizo-gold" />
                +234 800 PAZIZO
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-pazizo-gold" />
                123 Energy Way, Victoria Island, Lagos
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} Pazizo Energy. All rights reserved. Part of Pazizo Group.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="hover:text-pazizo-gold transition-colors">
      {children}
    </a>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pazizo-green transition-colors">
      <div className="w-4 h-4">{icon}</div>
    </a>
  );
}
