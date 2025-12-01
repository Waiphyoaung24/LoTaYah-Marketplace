'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { Button } from './Button';
import { ShoppingCart, Trash2, Store } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onDelete?: (id: string) => void;
  isSeller?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onDelete, isSeller }) => {
  const { t, formatPrice } = useApp();

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300 flex flex-col h-full">
      <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2">
           <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-stone-800 shadow-sm border border-stone-100">
             {t.categories[product.category as keyof typeof t.categories] || product.category}
           </span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          {!isSeller && product.storeName && (
            <div className="flex items-center text-xs text-stone-500 mb-1">
              <Store className="w-3 h-3 mr-1" />
              <span className="truncate">{product.storeName}</span>
            </div>
          )}
          <h3 className="text-base font-semibold text-stone-900 line-clamp-1" title={product.title}>
            {product.title}
          </h3>
        </div>
        
        <p className="text-stone-500 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-50">
          <span className="text-lg font-bold text-amber-700">
            {formatPrice(product.price)}
          </span>
          
          <div className="flex gap-2">
            {isSeller ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:bg-red-50 hover:border-red-200"
                onClick={() => onDelete && onDelete(product.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="sm" 
                className="shadow-sm hover:shadow-md hover:shadow-amber-200"
                onClick={() => onAddToCart && onAddToCart(product)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t.common.addToCart}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

