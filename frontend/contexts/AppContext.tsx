'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product, StoreProfile, CartItem, User, Post, Language, Currency } from '@/lib/types';
import { translations } from '@/lib/translations';

// Dummy Data Generation
const generateDummyProducts = (): Product[] => {
  const stores = [
    { name: "Golden Land Crafts", category: "Crafts", id: "store-1" },
    { name: "Yangon Tech Hub", category: "Electronics", id: "store-2" },
    { name: "Mandalay Silk & Fashion", category: "Clothing", id: "store-3" }
  ];

  const products: Product[] = [];

  stores.forEach(store => {
    for (let i = 1; i <= 10; i++) {
      products.push({
        id: `${store.id}-item-${i}`,
        title: `${store.category} Item ${i} from ${store.name}`,
        description: `High quality ${store.category.toLowerCase()} product. Handpicked for the best quality and value. Available now at LoTaYah.`,
        price: Math.floor(Math.random() * 100) + 10,
        category: store.category,
        imageUrl: `https://picsum.photos/seed/${store.name.replace(/\s/g,'')}${i}/400/400`,
        createdAt: Date.now(),
        storeName: store.name,
        sellerId: store.id
      });
    }
  });

  return products;
};

const dummyStores: StoreProfile[] = [
  { id: 'store-1', name: 'Golden Land Crafts', description: 'Handmade crafts from all over Myanmar.', coverImage: 'https://picsum.photos/seed/crafts/1200/400', logoImage: 'https://picsum.photos/seed/crafts/200/200', location: 'Yangon', joinedDate: '2023', reputationScore: 98, verified: true },
  { id: 'store-2', name: 'Yangon Tech Hub', description: 'Latest gadgets and electronics.', coverImage: 'https://picsum.photos/seed/tech/1200/400', logoImage: 'https://picsum.photos/seed/tech/200/200', location: 'Mandalay', joinedDate: '2024', reputationScore: 92, verified: true },
  { id: 'store-3', name: 'Mandalay Silk & Fashion', description: 'Premium silk and traditional clothing.', coverImage: 'https://picsum.photos/seed/silk/1200/400', logoImage: 'https://picsum.photos/seed/silk/200/200', location: 'Nay Pyi Taw', joinedDate: '2024', reputationScore: 95, verified: true }
];

const dummyPosts: Post[] = [
  { 
    id: 'post-1', 
    userId: 'u1', 
    userName: 'Phyo Phyo', 
    userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    content: 'ဘာနဲ့စားစား စားလို့ကောင်းတဲ့ ငရုတ်ဆီမွှေး။ မြို့စပ်မွှေးရပါမယ်နော်။ \nထမင်းဖြူ၊ ခေါက်ဆွဲပြုတ်၊ ရှမ်းခေါက်ဆွဲ၊ ကြာဇံချက်တို့နဲ့ အားရပါးရ စားလို့ရပါတယ်။\n\nငရုတ်ဆီမွှေး 200g - 3500 Ks', 
    images: [
      'https://picsum.photos/seed/food1/600/400',
      'https://picsum.photos/seed/food2/300/300',
      'https://picsum.photos/seed/food3/300/300',
      'https://picsum.photos/seed/food4/300/300'
    ],
    category: 'Sell',
    location: 'Yangon',
    likes: 24, 
    comments: [], 
    timestamp: Date.now() - 43200000 
  },
  { 
    id: 'post-2', 
    userId: 'u2', 
    userName: 'Kyaw Kyaw', 
    userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    content: 'Looking for authentic Shan trousers. Does anyone know a good seller here?', 
    images: [],
    category: 'Question',
    location: 'Mandalay',
    likes: 12, 
    comments: [], 
    timestamp: Date.now() - 172800000 
  },
  {
    id: 'post-3',
    userId: 'u3',
    userName: 'Thida Aye',
    userAvatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d',
    content: 'Just arrived! New stock of traditional handmade bags. \nAvailable in various colors. Limited stock so grab yours fast!',
    images: [
      'https://picsum.photos/seed/bag1/600/600',
      'https://picsum.photos/seed/bag2/600/600'
    ],
    category: 'Sell',
    location: 'Bagan',
    likes: 56,
    comments: [
      { id: 'c1', userId: 'u4', userName: 'Su Su', content: 'How much?', timestamp: Date.now() - 3600000 }
    ],
    timestamp: Date.now() - 12000000
  }
];

// Exchange Rates relative to USD (USD is internal base)
const EXCHANGE_RATES: Record<Currency, number> = {
  MMK: 3500,
  THB: 35,
  GBP: 0.79
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  MMK: 'Ks ',
  THB: '฿',
  GBP: '£'
};

interface AppContextType {
  // State
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  stores: StoreProfile[];
  setStores: React.Dispatch<React.SetStateAction<StoreProfile[]>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  lang: Language;
  setLang: React.Dispatch<React.SetStateAction<Language>>;
  currency: Currency;
  setCurrency: React.Dispatch<React.SetStateAction<Currency>>;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Computed
  t: typeof translations.en;
  formatPrice: (price: number) => string;
  cartTotal: number;
  cartItemCount: number;
  exchangeRate: number;
  
  // Actions
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateStoreProfile: (profile: StoreProfile) => void;
  handleAddPost: (content: string) => void;
  handleLikePost: (postId: string) => void;
  toggleLang: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(generateDummyProducts());
  const [stores, setStores] = useState<StoreProfile[]>(dummyStores);
  const [posts, setPosts] = useState<Post[]>(dummyPosts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('MMK');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const t = translations[lang];
  const exchangeRate = EXCHANGE_RATES[currency];

  const formatPrice = useCallback((priceInUsd: number) => {
    const rate = EXCHANGE_RATES[currency];
    const converted = priceInUsd * rate;
    
    // Formatting nuances
    let formattedNumber: string;
    if (currency === 'MMK') {
      formattedNumber = Math.round(converted).toLocaleString();
    } else {
      formattedNumber = converted.toFixed(2);
    }
    
    return `${CURRENCY_SYMBOLS[currency]}${formattedNumber}`;
  }, [currency]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateStoreProfile = (updatedProfile: StoreProfile) => {
    setStores(prev => {
      const exists = prev.find(s => s.id === updatedProfile.id);
      if (exists) {
        return prev.map(s => s.id === updatedProfile.id ? updatedProfile : s);
      }
      return [...prev, updatedProfile];
    });
  };

  const handleAddPost = (content: string) => {
    if (!user) return;
    const newPost: Post = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      userAvatar: 'https://i.pravatar.cc/150?u=generic',
      content,
      images: [],
      category: 'General',
      likes: 0,
      comments: [],
      timestamp: Date.now()
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    ));
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'my' : 'en');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        stores,
        setStores,
        posts,
        setPosts,
        cart,
        setCart,
        user,
        setUser,
        lang,
        setLang,
        currency,
        setCurrency,
        isCartOpen,
        setIsCartOpen,
        t,
        formatPrice,
        cartTotal,
        cartItemCount,
        exchangeRate,
        addToCart,
        removeFromCart,
        updateStoreProfile,
        handleAddPost,
        handleLikePost,
        toggleLang,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

