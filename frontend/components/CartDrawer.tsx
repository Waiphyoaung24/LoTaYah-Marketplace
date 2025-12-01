'use client';

import React from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { Button } from './Button';
import { useApp } from '@/contexts/AppContext';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    removeFromCart, 
    cartTotal, 
    formatPrice, 
    t 
  } = useApp();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
          <div className="flex items-center justify-between p-6 border-b border-stone-100">
            <h2 className="text-lg font-bold text-stone-900">{t.common.cart}</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-stone-400 hover:text-stone-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center text-stone-500 mt-10">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                {t.common.emptyCart}
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-stone-900">{item.title}</h4>
                     <p className="text-xs text-stone-400 mb-1">{item.storeName}</p>
                    <p className="text-sm text-stone-500 mb-2">{formatPrice(item.price)} x {item.quantity}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-red-500 font-medium hover:text-red-700"
                    >
                      {t.common.remove}
                    </button>
                  </div>
                  <div className="text-right font-medium text-stone-900">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-stone-100 bg-stone-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-stone-600">{t.common.total}</span>
              <span className="text-2xl font-bold text-stone-900">{formatPrice(cartTotal)}</span>
            </div>
            <Button className="w-full" size="lg" disabled={cart.length === 0} onClick={() => alert("Checkout simulated! Thank you for using LoTaYah.")}>
              {t.common.checkout}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

