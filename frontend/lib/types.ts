
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number; // Base price in USD (internal calculation)
  category: string;
  imageUrl: string;
  createdAt: number;
  storeName?: string;
  sellerId?: string;
}

export interface StoreProfile {
  id: string; // matches sellerId/userId
  name: string;
  description: string;
  coverImage: string;
  logoImage: string;
  location: string;
  joinedDate: string;
  reputationScore?: number; // 0-100
  verified?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  images?: string[];
  category?: 'General' | 'Sell' | 'Question';
  location?: string;
  likes: number;
  comments: Comment[];
  timestamp: number;
  tags?: string[];
}

export type ViewState = 'landing' | 'seller' | 'buyer' | 'login' | 'register' | 'community';

export enum AppColors {
  Primary = 'amber-600',
  Secondary = 'yellow-400',
  Accent = 'stone-800'
}

export type Language = 'en' | 'my';

export type Currency = 'MMK' | 'THB' | 'GBP';

