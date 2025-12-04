'use client';

import React, { useState, useMemo, useRef, useTransition } from 'react';
import { ViewTransition } from 'react';
import { ProductCard } from './ProductCard';
import { 
  Search, Store, ArrowRight, ArrowLeft, Star, MapPin, Calendar, 
  MessageSquare, Filter, ChevronLeft, ChevronRight, Loader2 
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  StoreWithProducts, 
  ProductItem, 
  Category,
  getStoresWithProducts,
  getStoreById 
} from '@/src/actions/stores';

// Store Row Component
const StoreRow: React.FC<{ 
  store: StoreWithProducts;
  onVisitStore: (id: string) => void;
}> = ({ store, onVisitStore }) => {
  const { addToCart, t } = useApp();
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { current } = rowRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Convert to Product type for ProductCard
  const convertToProduct = (item: ProductItem) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    category: item.category,
    imageUrl: item.imageUrl,
    createdAt: item.createdAt,
    storeName: item.storeName,
    sellerId: item.sellerId,
  });

  return (
    <div className="animate-fade-in mb-10 group/row">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-100 overflow-hidden shadow-sm border border-stone-100">
            <img 
              src={store.logoImage || `https://picsum.photos/seed/${store.id}/200/200`} 
              alt={store.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h3 
              className="text-lg font-bold text-stone-900 leading-tight hover:text-amber-600 transition-colors cursor-pointer" 
              onClick={() => onVisitStore(store.id)}
            >
              {store.name}
            </h3>
            <div className="flex items-center text-xs text-stone-500">
              <Star className="w-3 h-3 text-yellow-400 mr-1 fill-yellow-400" />
              {((store.reputationScore || 80) / 20).toFixed(1)} • {store.productCount} Items
            </div>
          </div>
        </div>
        <button 
          onClick={() => onVisitStore(store.id)}
          className="group flex items-center text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100"
        >
          <span className="mr-1">{t.buyer.visitStore}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="relative group/carousel">
        {/* Left Arrow */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-full border border-stone-100 text-stone-700 hover:text-amber-600 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 -ml-4 hidden md:flex"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={rowRef}
          className="flex overflow-x-auto pb-6 pt-2 gap-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {store.products.slice(0, 10).map(product => (
            <div key={product.id} className="snap-start w-64 md:w-72 flex-shrink-0">
              <ProductCard 
                product={convertToProduct(product)} 
                onAddToCart={addToCart}
                isSeller={false}
              />
            </div>
          ))}
          
          {store.products.length > 10 && (
            <div className="snap-start w-40 flex-shrink-0 flex items-center justify-center">
              <button 
                onClick={() => onVisitStore(store.id)}
                className="flex flex-col items-center justify-center w-full h-full min-h-[300px] rounded-xl border-2 border-dashed border-stone-200 text-stone-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-stone-100 group-hover:bg-white flex items-center justify-center mb-2 transition-colors">
                  <ArrowRight className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">See All</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-full border border-stone-100 text-stone-700 hover:text-amber-600 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 -mr-4 hidden md:flex"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

interface BrowseContentProps {
  initialStores: StoreWithProducts[];
  initialCategories: Category[];
}

export const BrowseContent: React.FC<BrowseContentProps> = ({ 
  initialStores, 
  initialCategories 
}) => {
  const { addToCart, t } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [stores, setStores] = useState<StoreWithProducts[]>(initialStores);
  const [search, setSearch] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(searchParams.get('store'));
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  
  // Store detail view state
  const [activeStoreData, setActiveStoreData] = useState<{
    store: any;
    products: ProductItem[];
  } | null>(null);

  // Handle category toggle with server refetch
  const toggleCategory = (cat: string) => {
    const newCategories = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat];
    
    setSelectedCategories(newCategories);
    
    // Refetch with new filters
    startTransition(async () => {
      const filteredStores = await getStoresWithProducts({
        search,
        categories: newCategories,
      });
      setStores(filteredStores);
    });
  };

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearch(value);
    
    startTransition(async () => {
      const filteredStores = await getStoresWithProducts({
        search: value,
        categories: selectedCategories,
      });
      setStores(filteredStores);
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    
    startTransition(async () => {
      const allStores = await getStoresWithProducts();
      setStores(allStores);
    });
  };

  // Handle store visit
  const handleVisitStore = async (storeId: string) => {
    setSelectedStoreId(storeId);
    router.push(`/browse?store=${storeId}`, { scroll: false });
    
    // Fetch store details
    startTransition(async () => {
      const data = await getStoreById(storeId);
      setActiveStoreData(data);
    });
  };

  // Handle back to browse
  const handleBackToBrowse = () => {
    setSelectedStoreId(null);
    setActiveStoreData(null);
    router.push('/browse', { scroll: false });
  };

  // Convert ProductItem to Product for ProductCard
  const convertToProduct = (item: ProductItem) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    category: item.category,
    imageUrl: item.imageUrl,
    createdAt: item.createdAt,
    storeName: item.storeName,
    sellerId: item.sellerId,
  });

  // Single Store View
  if (selectedStoreId && activeStoreData?.store) {
    const { store, products } = activeStoreData;
    const coverImage = store.coverImage || `https://picsum.photos/seed/${store.name.replace(/\s/g,'')}/1200/400`;
    const logoImage = store.logoImage || `https://picsum.photos/seed/${store.id}/200/200`;

    return (
      <div className="min-h-screen bg-stone-50">
        {/* Hero Section */}
        <div className="relative h-64 md:h-80 bg-stone-900 overflow-hidden">
          <img 
            src={coverImage} 
            alt="Store Cover" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/10 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/50 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end md:items-center gap-6">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden flex-shrink-0">
                <img src={logoImage} alt={store.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-white flex-grow">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-amber-50">{store.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-stone-300">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1 fill-yellow-400" />
                    <span className="font-medium text-white mr-1">
                      {((store.reputationScore || 80) / 20).toFixed(1)}
                    </span> 
                    ({store.totalSales || 0} {t.buyer.rating})
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {store.location || 'Myanmar'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {t.buyer.joined} {store.joinedDate || '2024'}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleBackToBrowse}
                className="hidden md:flex items-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors border border-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.buyer.backToBrowse}
              </button>
            </div>
          </div>
        </div>

        {/* Store Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button 
            onClick={handleBackToBrowse}
            className="md:hidden flex items-center text-stone-500 mb-6 hover:text-amber-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.buyer.backToBrowse}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="font-semibold text-stone-900 mb-4 flex items-center">
                  <Store className="w-4 h-4 mr-2 text-amber-600" />
                  {t.buyer.about}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed mb-4">
                  {store.description || "Welcome to our store. We provide high quality items sourced directly from local artisans."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(products.map(p => p.category))).map((cat: string) => (
                    <span key={cat} className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">
                      {t.categories[cat as keyof typeof t.categories] || cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="font-semibold text-stone-900 mb-4 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-amber-600" />
                  {t.buyer.reviews}
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b border-stone-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center mb-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}
                        </div>
                        <span className="text-xs text-stone-400 ml-2">{i} days ago</span>
                      </div>
                      <p className="text-sm text-stone-600 italic">"Great products and fast delivery! Will buy again."</p>
                      <p className="text-xs text-stone-500 mt-1 font-medium">- Happy Customer</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Product Grid */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-900">{t.buyer.products}</h2>
                <span className="text-sm text-stone-500">{products.length} Items</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={convertToProduct(product)} 
                    onAddToCart={addToCart}
                    isSeller={false}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state for store detail
  if (selectedStoreId && isPending) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-stone-600">Loading store...</p>
        </div>
      </div>
    );
  }

  // Browse Store List View
  return (
    <ViewTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Search className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-stone-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-all duration-200"
                  placeholder={t.buyer.searchPlaceholder}
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>

              {/* Filter Panel */}
              <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-stone-900 flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-amber-600" />
                    {t.buyer.filters.title}
                  </h3>
                  {selectedCategories.length > 0 && (
                    <button 
                      onClick={clearFilters}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      {t.buyer.filters.clear}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    {t.buyer.filters.categories}
                  </h4>
                  {initialCategories.map(cat => (
                    <label key={cat.id} className="flex items-center group cursor-pointer">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          className="peer h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                          checked={selectedCategories.includes(cat.name)}
                          onChange={() => toggleCategory(cat.name)}
                        />
                      </div>
                      <span className="ml-3 text-sm text-stone-600 group-hover:text-stone-900 transition-colors">
                        {t.categories[cat.name as keyof typeof t.categories] || cat.name}
                      </span>
                      {cat.productCount > 0 && (
                        <span className="ml-auto text-xs text-stone-400">
                          ({cat.productCount})
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Loading indicator */}
              {isPending && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                  <span className="ml-2 text-sm text-stone-500">Filtering...</span>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0 mt-20">
            {stores.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-200">
                <Store className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                <h3 className="text-xl font-medium text-stone-900">{t.buyer.noResults}</h3>
                <p className="text-stone-500">{t.buyer.noResultsHint}</p>
                <button 
                  onClick={clearFilters}
                  className="mt-4 text-amber-600 font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div>
                {stores.map(store => (
                  <StoreRow 
                    key={store.id} 
                    store={store} 
                    onVisitStore={handleVisitStore}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ViewTransition>
  );
};


