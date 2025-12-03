
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
  isAdmin?: boolean;
  role?: 'user' | 'admin';
  storeVerified?: boolean;
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

export interface VerificationRequest {
  id: string;
  storeId: string;
  storeName: string;
  ownerName: string;
  ownerEmail: string;
  submittedAt: number;
  status: 'pending' | 'approved' | 'rejected';
  governmentIdUrl: string;
  storeDetails: {
    description: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contactPhone: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  storeId: string;
  storeName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: number;
  updatedAt: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
}

export type ViewState = 'landing' | 'seller' | 'buyer' | 'login' | 'register' | 'community';

export enum AppColors {
  Primary = 'amber-600',
  Secondary = 'yellow-400',
  Accent = 'stone-800'
}

export type Language = 'en' | 'my';

export type Currency = 'MMK' | 'THB' | 'GBP';
