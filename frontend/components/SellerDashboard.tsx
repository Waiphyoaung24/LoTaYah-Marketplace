'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { Product, StoreProfile } from '@/lib/types';
import { Button } from './Button';
import { ProductCard } from './ProductCard';
import { Sparkles, Package, Plus, Settings, Image as ImageIcon, MapPin, Save, Store, Upload, X, Wand2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { createProduct, deleteProduct, getMyProducts, Product as DbProduct } from '@/src/actions/products';
import { updateStoreProfile as updateStoreProfileAction, getMyStoreProfile } from '@/src/actions/stores';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  
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

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Database products state
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    if (initialStoreProfile) {
      setStoreProfile(initialStoreProfile);
    }
  }, [initialStoreProfile]);

  // Load store profile and products from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingProducts(true);
        
        // Load store profile
        const profileResult = await getMyStoreProfile();
        if (profileResult.success && profileResult.store) {
          setStoreProfile({
            id: profileResult.store.id,
            name: profileResult.store.name,
            description: profileResult.store.description || '',
            coverImage: profileResult.store.coverImage || '',
            logoImage: profileResult.store.logoImage || '',
            location: profileResult.store.location || '',
            joinedDate: profileResult.store.joinedDate || new Date().getFullYear().toString()
          });
        }
        
        // Load products
        const productsResult = await getMyProducts();
        if (productsResult.success && productsResult.products) {
          setDbProducts(productsResult.products);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Combine local products (for demo) with database products
  const myProducts = useMemo(() => {
    const localProducts = products.filter(p => p.sellerId === user?.id);
    
    // Convert database products to local format
    const convertedDbProducts: Product[] = dbProducts.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description || '',
      price: p.price,
      category: p.category?.name || 'General',
      imageUrl: p.imageUrl || `https://picsum.photos/seed/${p.id}/400/400`,
      createdAt: new Date(p.createdAt).getTime(),
      sellerId: user?.id || '',
      storeName: storeProfile.name,
    }));

    return [...convertedDbProducts, ...localProducts];
  }, [products, dbProducts, user, storeProfile.name]);

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
    // Simulate description generation
    setTimeout(() => {
      const desc = `High quality ${newItem.category.toLowerCase()} product. ${newItem.title} - carefully selected for the best quality and value.`;
      setNewItem(prev => ({ ...prev, description: desc }));
      setIsGenerating(false);
    }, 500);
  };

  const handleBatchGenerate = async () => {
    if (!user) return;
    setIsBatchGenerating(true);
    
    // Generate sample products
    setTimeout(() => {
      const category = newItem.category || "General";
      const sampleProducts = [
        { title: `${category} Item 1`, price: 25, keyword: `${category}1` },
        { title: `${category} Item 2`, price: 35, keyword: `${category}2` },
        { title: `${category} Item 3`, price: 45, keyword: `${category}3` },
        { title: `${category} Item 4`, price: 30, keyword: `${category}4` },
        { title: `${category} Item 5`, price: 40, keyword: `${category}5` },
        { title: `${category} Item 6`, price: 50, keyword: `${category}6` },
        { title: `${category} Item 7`, price: 28, keyword: `${category}7` },
        { title: `${category} Item 8`, price: 38, keyword: `${category}8` },
        { title: `${category} Item 9`, price: 42, keyword: `${category}9` },
        { title: `${category} Item 10`, price: 33, keyword: `${category}10` },
      ];
      
      const newProducts: Product[] = sampleProducts.map(item => ({
        id: crypto.randomUUID(),
        title: item.title,
        description: `High quality ${category.toLowerCase()} product. ${item.title} - carefully selected for the best quality and value.`,
        price: item.price,
        category: category,
        imageUrl: `https://picsum.photos/seed/${item.keyword}/400/400`,
        createdAt: Date.now(),
        sellerId: user.id,
        storeName: storeProfile.name
      }));

      setProducts(prev => [...prev, ...newProducts]);
      setIsBatchGenerating(false);
    }, 1000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setNewItem(prev => ({ ...prev, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setNewItem(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.price || !user) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Convert input price (in selected currency) to base price for storage
      const priceInCurrency = parseFloat(newItem.price);
      const priceInUSD = priceInCurrency / exchangeRate;

      // Call the server action to create product
      const result = await createProduct({
        title: newItem.title,
        description: newItem.description || 'No description provided.',
        price: priceInUSD,
        imageUrl: newItem.imageUrl || `https://picsum.photos/seed/${newItem.title.replace(/\s+/g, '')}/400/400`,
        stock: 0,
        isActive: true,
        isFeatured: false,
        tags: [newItem.category],
      });

      if (!result.success) {
        // Handle validation errors
        if (result.errors && result.errors.length > 0) {
          setSubmitError(result.errors.map(e => e.message).join(', '));
        } else {
          setSubmitError(result.error || 'Failed to create product');
        }
        return;
      }

      // Success - add to local state
      if (result.product) {
        setDbProducts(prev => [result.product!, ...prev]);
      }

      // Reset form
      setNewItem({ title: '', category: 'General', price: '', description: '', imageUrl: '' });
      setImagePreview(null);
      setSubmitSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating product:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Try to delete from database first
      const result = await deleteProduct(id);
      
      if (result.success) {
        // Remove from database products state
        setDbProducts(prev => prev.filter(p => p.id !== id));
      } else {
        // If not found in database, might be a local product
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      // Fallback to local deletion
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setSubmitError(null);
    
    try {
      const result = await updateStoreProfileAction({
        name: storeProfile.name,
        description: storeProfile.description,
        logoImage: storeProfile.logoImage,
        coverImage: storeProfile.coverImage,
        location: storeProfile.location,
      });

      if (!result.success) {
        setSubmitError(result.error || 'Failed to save profile');
        return;
      }

      // Update local context state
      updateStoreProfile(storeProfile);
      
      // Update store name on all existing products locally
      setProducts(prev => prev.map(p => 
        p.sellerId === user?.id ? { ...p, storeName: storeProfile.name } : p
      ));
      
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSubmitError('An unexpected error occurred');
    } finally {
      setIsSavingProfile(false);
    }
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-20">
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

              {/* Success Message */}
              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Product listed successfully!</span>
                </div>
              )}

              {/* Error Message */}
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{submitError}</span>
                </div>
              )}
              
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">{t.seller.form.title}</label>
                  <input
                    type="text"
                    required
                    value={newItem.title}
                    onChange={e => setNewItem({...newItem, title: e.target.value})}
                    placeholder={t.seller.form.placeholderTitle}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Product Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    {t.seller.form.images || 'Product Image'}
                  </label>
                  
                  {imagePreview || newItem.imageUrl ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-stone-200 bg-stone-100 group">
                      <img 
                        src={imagePreview || newItem.imageUrl} 
                        alt="Product preview" 
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isSubmitting}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 text-stone-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 right-2">
                        <label className="block w-full">
                          <span className="sr-only">Change image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                            disabled={isSubmitting}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="w-full bg-white/90 backdrop-blur-sm hover:bg-white"
                            onClick={() => document.getElementById('image-upload')?.click()}
                            disabled={isSubmitting}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Change Image
                          </Button>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload-input"
                        disabled={isSubmitting}
                      />
                      <div className="relative border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-amber-400 hover:bg-amber-50/50 transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                            <Upload className="w-6 h-6 text-amber-600" />
                          </div>
                          <p className="text-sm font-medium text-stone-700 mb-1">
                            Upload Product Image
                          </p>
                          <p className="text-xs text-stone-500">
                            PNG, JPG, or WEBP (max 5MB)
                          </p>
                        </div>
                      </div>
                    </label>
                  )}
                  
                  {/* Alternative: Image URL input */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Or enter image URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <ImageIcon className="h-4 w-4 text-stone-400" />
                      </div>
                      <input
                        type="url"
                        value={newItem.imageUrl && !imagePreview ? newItem.imageUrl : ''}
                        onChange={e => {
                          if (!imagePreview) {
                            setNewItem(prev => ({ ...prev, imageUrl: e.target.value }));
                          }
                        }}
                        className="pl-11 text-sm"
                        placeholder="https://example.com/image.jpg"
                        disabled={!!imagePreview || isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">{t.seller.form.category}</label>
                  <select
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value})}
                    disabled={isSubmitting}
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
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-stone-700">{t.seller.form.desc}</label>
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={!newItem.title || isGenerating || isSubmitting}
                      className="text-xs text-amber-600 font-medium flex items-center hover:text-amber-700 disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {isGenerating ? t.seller.form.aiLoading : t.seller.form.aiBtn}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={newItem.description}
                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                    placeholder={t.seller.form.placeholderDesc}
                    disabled={isSubmitting}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || !newItem.title || !newItem.price}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Listing...
                    </>
                  ) : (
                    t.seller.form.submit
                  )}
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
            
            {isLoadingProducts ? (
              <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl p-12 text-center">
                <Loader2 className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-spin" />
                <p className="text-stone-500">Loading your products...</p>
              </div>
            ) : myProducts.length === 0 ? (
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
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">{t.seller.form.storeDesc}</label>
                <textarea
                  rows={4}
                  value={storeProfile.description}
                  onChange={e => setStoreProfile({...storeProfile, description: e.target.value})}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">{t.seller.form.location}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <MapPin className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    value={storeProfile.location}
                    onChange={e => setStoreProfile({...storeProfile, location: e.target.value})}
                    className="pl-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo URL */}
                <div>
                   <label className="block text-sm font-medium text-stone-700 mb-1">Logo URL</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <ImageIcon className="h-5 w-5 text-stone-400" />
                      </div>
                      <input
                        type="text"
                        value={storeProfile.logoImage}
                        onChange={e => setStoreProfile({...storeProfile, logoImage: e.target.value})}
                        className="pl-12"
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
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <ImageIcon className="h-5 w-5 text-stone-400" />
                      </div>
                      <input
                        type="text"
                        value={storeProfile.coverImage}
                        onChange={e => setStoreProfile({...storeProfile, coverImage: e.target.value})}
                        className="pl-12"
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
