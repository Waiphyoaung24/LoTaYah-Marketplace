'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Product, StoreProfile } from '@/lib/types';
import { Button } from './Button';
import { ProductCard } from './ProductCard';
import { generateProductDescription, generateStoreInventory, generateEnhancedProductImage } from '@/lib/services/geminiService';
import { Sparkles, Package, Plus, Wand2, Settings, Image as ImageIcon, MapPin, Save, Store, Camera, RefreshCw } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const SellerDashboard: React.FC = () => {
  const { 
    products, 
    setProducts, 
    t, 
    user, 
    updateStoreProfile, 
    stores,
    formatPrice,
    currency,
    exchangeRate
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'settings'>('inventory');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  
  // Store Profile State
  const initialStoreProfile = stores.find(s => s.id === user?.id);
  const [storeProfile, setStoreProfile] = useState<StoreProfile>({
    id: user?.id || '',
    name: initialStoreProfile?.name || (user?.name ? `${user.name}'s Store` : ''),
    description: initialStoreProfile?.description || '',
    coverImage: initialStoreProfile?.coverImage || '',
    logoImage: initialStoreProfile?.logoImage || '',
    location: initialStoreProfile?.location || '',
    joinedDate: initialStoreProfile?.joinedDate || new Date().getFullYear().toString()
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Magic Studio State
  const [magicPrompt, setMagicPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (initialStoreProfile) {
      setStoreProfile(initialStoreProfile);
    }
  }, [initialStoreProfile]);

  // Filter products to only show those belonging to this user
  const myProducts = useMemo(() => {
    return products.filter(p => p.sellerId === user?.id);
  }, [products, user]);

  const [newItem, setNewItem] = useState({
    title: '',
    category: 'General',
    price: '',
    description: '',
    imageUrl: ''
  });

  const handleGenerateDescription = async () => {
    if (!newItem.title) return;
    setIsGenerating(true);
    const desc = await generateProductDescription(newItem.title, newItem.category);
    setNewItem(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleBatchGenerate = async () => {
    if (!user) return;
    setIsBatchGenerating(true);
    try {
      const generatedItems = await generateStoreInventory(newItem.category || "General");
      
      const newProducts: Product[] = generatedItems.map(item => ({
        id: crypto.randomUUID(),
        title: item.title,
        description: item.description,
        price: item.price, // Gemini returns usually reasonable numbers, treat as USD
        category: newItem.category || "General",
        imageUrl: `https://picsum.photos/seed/${item.imageKeyword.replace(/\s+/g, '')}/400/400`,
        createdAt: Date.now(),
        sellerId: user.id,
        storeName: storeProfile.name
      }));

      setProducts(prev => [...prev, ...newProducts]);
    } catch (e) {
      alert("Failed to generate items. Please check API key.");
    } finally {
      setIsBatchGenerating(false);
    }
  };

  const handleMagicImageGenerate = async () => {
    if (!newItem.title) {
        alert("Please enter a product title first.");
        return;
    }
    setIsGeneratingImage(true);
    // Use the user's custom prompt, or fallback to a standard enhancement based on title
    const promptToUse = magicPrompt || "professional studio lighting, clean background";
    const image = await generateEnhancedProductImage(newItem.title, promptToUse);
    
    if (image) {
        setGeneratedImage(image);
    } else {
        alert("Could not generate image. Please try again.");
    }
    setIsGeneratingImage(false);
  };

  const applyMagicImage = () => {
      if (generatedImage) {
          setNewItem(prev => ({ ...prev, imageUrl: generatedImage }));
          setGeneratedImage(null); // Clear preview after applying
          setMagicPrompt('');
      }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.price || !user) return;

    // Convert input price (in selected currency) to USD for storage
    const priceInCurrency = parseFloat(newItem.price);
    const priceInUSD = priceInCurrency / exchangeRate;

    const product: Product = {
      id: crypto.randomUUID(),
      title: newItem.title,
      description: newItem.description || 'No description provided.',
      price: priceInUSD,
      category: newItem.category,
      imageUrl: newItem.imageUrl || `https://picsum.photos/seed/${newItem.title.replace(/\s+/g, '')}/400/400`,
      createdAt: Date.now(),
      sellerId: user.id,
      storeName: storeProfile.name
    };

    setProducts(prev => [product, ...prev]);
    setNewItem({ title: '', category: 'General', price: '', description: '', imageUrl: '' });
    setGeneratedImage(null);
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    // Simulate API save
    setTimeout(() => {
      updateStoreProfile(storeProfile);
      // Update store name on all existing products
      setProducts(prev => prev.map(p => 
        p.sellerId === user?.id ? { ...p, storeName: storeProfile.name } : p
      ));
      setIsSavingProfile(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }, 800);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-stone-500">Please log in to access the seller dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-stone-900">{t.seller.title}</h2>
          <p className="text-stone-500 mt-1">
            {t.seller.welcome} <span className="font-semibold text-amber-600">{user?.name}</span>. {t.seller.subtitle}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-stone-200/50 p-1 mb-8 w-fit">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'inventory' 
              ? 'bg-white text-amber-700 shadow-sm' 
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
          }`}
        >
          <Package className="w-4 h-4 mr-2" />
          {t.seller.tabs.inventory}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'settings' 
              ? 'bg-white text-amber-700 shadow-sm' 
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
          }`}
        >
          <Settings className="w-4 h-4 mr-2" />
          {t.seller.tabs.settings}
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Item Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 sticky top-24">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-stone-800">
                <Plus className="w-5 h-5 mr-2 text-amber-600" />
                {t.seller.addProduct}
              </h3>
              
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">{t.seller.form.title}</label>
                  <input
                    type="text"
                    required
                    value={newItem.title}
                    onChange={e => setNewItem({...newItem, title: e.target.value})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={t.seller.form.placeholderTitle}
                  />
                </div>

                {/* Magic Studio Section */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Wand2 className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-bold text-stone-800">{t.seller.magicStudio.title}</span>
                    </div>
                    <p className="text-xs text-stone-500 mb-3">{t.seller.magicStudio.desc}</p>
                    
                    {!generatedImage ? (
                        <>
                            <div className="mb-3">
                                <label className="block text-xs font-medium text-stone-600 mb-1">{t.seller.magicStudio.promptLabel}</label>
                                <textarea 
                                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 bg-white"
                                    placeholder={t.seller.magicStudio.promptPlaceholder}
                                    rows={2}
                                    value={magicPrompt}
                                    onChange={(e) => setMagicPrompt(e.target.value)}
                                />
                                {/* Quick Styles */}
                                <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                                    <button type="button" onClick={() => setMagicPrompt(t.seller.magicStudio.styles.studio)} className="whitespace-nowrap px-2 py-1 bg-white border border-stone-200 rounded text-[10px] text-stone-600 hover:border-amber-400 hover:text-amber-600 transition-colors">
                                        {t.seller.magicStudio.styles.studio}
                                    </button>
                                    <button type="button" onClick={() => setMagicPrompt(t.seller.magicStudio.styles.nature)} className="whitespace-nowrap px-2 py-1 bg-white border border-stone-200 rounded text-[10px] text-stone-600 hover:border-amber-400 hover:text-amber-600 transition-colors">
                                        {t.seller.magicStudio.styles.nature}
                                    </button>
                                    <button type="button" onClick={() => setMagicPrompt(t.seller.magicStudio.styles.luxury)} className="whitespace-nowrap px-2 py-1 bg-white border border-stone-200 rounded text-[10px] text-stone-600 hover:border-amber-400 hover:text-amber-600 transition-colors">
                                        {t.seller.magicStudio.styles.luxury}
                                    </button>
                                </div>
                            </div>
                            <Button 
                                type="button" 
                                size="sm" 
                                className="w-full" 
                                onClick={handleMagicImageGenerate} 
                                isLoading={isGeneratingImage}
                                disabled={!newItem.title}
                            >
                                <Camera className="w-3 h-3 mr-2" />
                                {t.seller.magicStudio.generateBtn}
                            </Button>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <div className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 group">
                                <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button type="button" onClick={() => setGeneratedImage(null)} className="text-white text-xs underline">Discard</button>
                                </div>
                            </div>
                            <Button type="button" size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={applyMagicImage}>
                                {t.seller.magicStudio.useImage}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Display selected image URL if any */}
                {newItem.imageUrl && !generatedImage && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                        <img src={newItem.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                         <button 
                            type="button"
                            onClick={() => setNewItem(prev => ({...prev, imageUrl: ''}))}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-red-50 text-stone-500 hover:text-red-500"
                         >
                             <RefreshCw className="w-3 h-3" />
                         </button>
                    </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">{t.seller.form.category}</label>
                  <select
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {Object.keys(t.categories).filter(key => key !== 'All').map(key => (
                       <option key={key} value={key}>{t.categories[key as keyof typeof t.categories]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t.seller.form.price} ({currency})
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newItem.price}
                    onChange={e => setNewItem({...newItem, price: e.target.value})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-stone-700">{t.seller.form.desc}</label>
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={!newItem.title || isGenerating}
                      className="text-xs text-amber-600 font-medium flex items-center hover:text-amber-700 disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {isGenerating ? t.seller.form.aiLoading : t.seller.form.aiBtn}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={newItem.description}
                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={t.seller.form.placeholderDesc}
                  />
                </div>

                <Button type="submit" className="w-full">
                  {t.seller.form.submit}
                </Button>
              </form>
            </div>
          </div>

          {/* Inventory List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center text-stone-800">
                <Package className="w-5 h-5 mr-2 text-stone-600" />
                {t.seller.inventory.title} ({myProducts.length})
              </h3>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleBatchGenerate}
                isLoading={isBatchGenerating}
              >
                <Wand2 className="w-3 h-3 mr-2" />
                {t.seller.autoFill}
              </Button>
            </div>
            
            {myProducts.length === 0 ? (
              <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl p-12 text-center">
                <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500">{t.seller.inventory.empty}</p>
                <p className="text-stone-400 text-sm mt-1">{t.seller.inventory.emptyHint}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    isSeller={true}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-stone-900 flex items-center">
                 <Store className="w-6 h-6 mr-2 text-amber-600" />
                 Store Profile
               </h3>
               {showSaveSuccess && (
                 <span className="text-green-600 font-medium text-sm animate-fade-in">
                   {t.seller.form.saved}
                 </span>
               )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Store Name */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">{t.seller.form.storeName}</label>
                <input
                  type="text"
                  required
                  value={storeProfile.name}
                  onChange={e => setStoreProfile({...storeProfile, name: e.target.value})}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">{t.seller.form.storeDesc}</label>
                <textarea
                  rows={4}
                  value={storeProfile.description}
                  onChange={e => setStoreProfile({...storeProfile, description: e.target.value})}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">{t.seller.form.location}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    value={storeProfile.location}
                    onChange={e => setStoreProfile({...storeProfile, location: e.target.value})}
                    className="w-full pl-10 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo URL */}
                <div>
                   <label className="block text-sm font-medium text-stone-700 mb-1">Logo URL</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ImageIcon className="h-5 w-5 text-stone-400" />
                      </div>
                      <input
                        type="text"
                        value={storeProfile.logoImage}
                        onChange={e => setStoreProfile({...storeProfile, logoImage: e.target.value})}
                        className="w-full pl-10 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="https://..."
                      />
                   </div>
                   {storeProfile.logoImage && (
                     <img src={storeProfile.logoImage} alt="Preview" className="w-16 h-16 rounded-full mt-2 object-cover border border-stone-200" />
                   )}
                </div>

                {/* Cover URL */}
                <div>
                   <label className="block text-sm font-medium text-stone-700 mb-1">Cover Image URL</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ImageIcon className="h-5 w-5 text-stone-400" />
                      </div>
                      <input
                        type="text"
                        value={storeProfile.coverImage}
                        onChange={e => setStoreProfile({...storeProfile, coverImage: e.target.value})}
                        className="w-full pl-10 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="https://..."
                      />
                   </div>
                   {storeProfile.coverImage && (
                     <img src={storeProfile.coverImage} alt="Preview" className="w-full h-16 rounded-lg mt-2 object-cover border border-stone-200" />
                   )}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <Button type="submit" size="lg" isLoading={isSavingProfile}>
                  <Save className="w-5 h-5 mr-2" />
                  {t.seller.form.saveSettings}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

