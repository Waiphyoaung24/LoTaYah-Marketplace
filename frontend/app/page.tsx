'use client';

import React from 'react';
import Link from 'next/link';
import { Store, ShoppingCart } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export default function Home() {
  const { t, user } = useApp();

  const handleSellerClick = () => {
    if (user) {
      window.location.href = '/seller';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-100 blur-3xl opacity-40"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-yellow-100 blur-3xl opacity-40"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-stone-900 mb-6 tracking-tight leading-tight">
          {t.landing.title}
        </h1>
        <p className="text-xl text-stone-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          {t.landing.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button 
            onClick={handleSellerClick}
            className="group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg border border-stone-100 hover:border-amber-500 hover:shadow-xl transition-all w-full sm:w-64 text-left"
          >
            <div className="bg-amber-50 p-4 rounded-full mb-4 group-hover:bg-amber-100 transition-colors">
              <Store className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">{t.landing.btnSell}</h3>
            <p className="text-stone-500 text-sm text-center">{t.landing.btnSellDesc}</p>
          </button>

          <Link 
            href="/browse"
            className="group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg border border-stone-100 hover:border-yellow-400 hover:shadow-xl transition-all w-full sm:w-64 text-left"
          >
            <div className="bg-yellow-50 p-4 rounded-full mb-4 group-hover:bg-yellow-100 transition-colors">
              <ShoppingCart className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">{t.landing.btnBuy}</h3>
            <p className="text-stone-500 text-sm text-center">{t.landing.btnBuyDesc}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
