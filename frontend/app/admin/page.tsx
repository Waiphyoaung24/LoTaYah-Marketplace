'use client';

import React, { useState, useEffect } from 'react';
import { ViewTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Search,
  Filter,
  Download,
  AlertCircle,
  Package,
  User,
  Store,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { VerificationRequest, Order } from '@/lib/types';

export default function AdminPage() {
  const { user, formatPrice } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'verifications' | 'orders'>('verifications');
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [orderFilterStatus, setOrderFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    const isAdmin = user.isAdmin || user.role === 'admin';
    if (!isAdmin) {
      router.push('/');
      return;
    }
  }, [user, router]);

  // Load dummy data
  useEffect(() => {
    // Dummy verification requests
    setVerificationRequests([
      {
        id: 'vr-1',
        storeId: 'store-new-1',
        storeName: 'Myanmar Handicrafts',
        ownerName: 'Aung Aung',
        ownerEmail: 'aung@example.com',
        submittedAt: Date.now() - 86400000, // 1 day ago
        status: 'pending',
        governmentIdUrl: '/imgs/pexels-rockwell-branding-agency-85164430-8910187.jpg',
        storeDetails: {
          description: 'Authentic Myanmar handicrafts and traditional items',
          address: '123 Main Street',
          city: 'Yangon',
          state: 'Yangon',
          postalCode: '11111',
          country: 'Myanmar',
          contactPhone: '+95 9XX XXX XXXX'
        }
      },
      {
        id: 'vr-2',
        storeId: 'store-new-2',
        storeName: 'Thai Silk Emporium',
        ownerName: 'Somsak',
        ownerEmail: 'somsak@example.com',
        submittedAt: Date.now() - 172800000, // 2 days ago
        status: 'pending',
        governmentIdUrl: '/imgs/pexels-rockwell-branding-agency-85164430-8910187.jpg',
        storeDetails: {
          description: 'Premium Thai silk products and accessories',
          address: '456 Sukhumvit Road',
          city: 'Bangkok',
          state: 'Bangkok',
          postalCode: '10110',
          country: 'Thailand',
          contactPhone: '+66 2X XXX XXXX'
        }
      },
      {
        id: 'vr-3',
        storeId: 'store-new-3',
        storeName: 'UK Vintage Finds',
        ownerName: 'John Smith',
        ownerEmail: 'john@example.com',
        submittedAt: Date.now() - 259200000, // 3 days ago
        status: 'approved',
        governmentIdUrl: '/imgs/pexels-rockwell-branding-agency-85164430-8910187.jpg',
        storeDetails: {
          description: 'Curated vintage and antique items from the UK',
          address: '789 High Street',
          city: 'London',
          state: 'England',
          postalCode: 'SW1A 1AA',
          country: 'UK',
          contactPhone: '+44 20 XXXX XXXX'
        }
      }
    ]);

    // Dummy orders
    setOrders([
      {
        id: 'order-1',
        orderNumber: 'ORD-2024-001',
        customerId: 'customer-1',
        customerName: 'Alice Johnson',
        customerEmail: 'alice@example.com',
        storeId: 'store-1',
        storeName: 'Golden Land Crafts',
        items: [
          { productId: 'p1', productName: 'Handmade Wooden Bowl', quantity: 2, price: 25 },
          { productId: 'p2', productName: 'Traditional Woven Mat', quantity: 1, price: 35 }
        ],
        totalAmount: 85,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: Date.now() - 3600000, // 1 hour ago
        updatedAt: Date.now() - 3600000,
        shippingAddress: {
          street: '123 Customer Street',
          city: 'Yangon',
          state: 'Yangon',
          postalCode: '11111',
          country: 'Myanmar'
        },
        notes: 'Please handle with care'
      },
      {
        id: 'order-2',
        orderNumber: 'ORD-2024-002',
        customerId: 'customer-2',
        customerName: 'Bob Williams',
        customerEmail: 'bob@example.com',
        storeId: 'store-2',
        storeName: 'Yangon Tech Hub',
        items: [
          { productId: 'p3', productName: 'Wireless Headphones', quantity: 1, price: 89 }
        ],
        totalAmount: 89,
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: Date.now() - 7200000, // 2 hours ago
        updatedAt: Date.now() - 1800000,
        shippingAddress: {
          street: '456 Buyer Avenue',
          city: 'Mandalay',
          state: 'Mandalay',
          postalCode: '22222',
          country: 'Myanmar'
        }
      },
      {
        id: 'order-3',
        orderNumber: 'ORD-2024-003',
        customerId: 'customer-3',
        customerName: 'Charlie Brown',
        customerEmail: 'charlie@example.com',
        storeId: 'store-3',
        storeName: 'Mandalay Silk & Fashion',
        items: [
          { productId: 'p4', productName: 'Silk Scarf', quantity: 3, price: 45 }
        ],
        totalAmount: 135,
        status: 'processing',
        paymentStatus: 'paid',
        createdAt: Date.now() - 10800000, // 3 hours ago
        updatedAt: Date.now() - 3600000,
        shippingAddress: {
          street: '789 Shopper Road',
          city: 'Bangkok',
          state: 'Bangkok',
          postalCode: '10110',
          country: 'Thailand'
        }
      }
    ]);
  }, []);

  const handleVerificationAction = (requestId: string, action: 'approve' | 'reject') => {
    setVerificationRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
          : req
      )
    );
    setSelectedVerification(null);
  };

  const handleOrderStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: Date.now() }
          : order
      )
    );
    setSelectedOrder(null);
  };

  const handlePaymentStatusUpdate = (orderId: string, newStatus: Order['paymentStatus']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, paymentStatus: newStatus, updatedAt: Date.now() }
          : order
      )
    );
  };

  const filteredVerifications = verificationRequests.filter(req => {
    const matchesSearch = req.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.storeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = orderFilterStatus === 'all' || order.status === orderFilterStatus;
    return matchesSearch && matchesFilter;
  });

  if (!user || (!user.isAdmin && user.role !== 'admin')) {
    return null;
  }

  return (
    <ViewTransition>
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-stone-900">Admin Dashboard</h1>
                <p className="text-stone-600 mt-1">Manage verifications and orders</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-stone-200">
            <button
              onClick={() => setActiveTab('verifications')}
              className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
                activeTab === 'verifications'
                  ? 'text-amber-600 border-amber-600'
                  : 'text-stone-500 border-transparent hover:text-stone-700'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Verification Requests ({verificationRequests.filter(v => v.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
                activeTab === 'orders'
                  ? 'text-amber-600 border-amber-600'
                  : 'text-stone-500 border-transparent hover:text-stone-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4 inline mr-2" />
              Orders & Transactions ({orders.length})
            </button>
          </div>

          {/* Search and Filter */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-stone-200/50 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'verifications' ? 'stores' : 'orders'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border-2 border-stone-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-all duration-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-stone-400" />
                <select
                  value={activeTab === 'verifications' ? filterStatus : orderFilterStatus}
                  onChange={(e) => {
                    if (activeTab === 'verifications') {
                      setFilterStatus(e.target.value as any);
                    } else {
                      setOrderFilterStatus(e.target.value as any);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl border-2 border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none"
                >
                  {activeTab === 'verifications' ? (
                    <>
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </>
                  ) : (
                    <>
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Verification Requests Tab */}
          {activeTab === 'verifications' && (
            <div className="space-y-4">
              {filteredVerifications.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-stone-200/50 p-12 text-center">
                  <Shield className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-600 text-lg">No verification requests found</p>
                </div>
              ) : (
                filteredVerifications.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-stone-200/50 p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-stone-900">{request.storeName}</h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  request.status === 'pending'
                                    ? 'bg-amber-100 text-amber-700'
                                    : request.status === 'approved'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-stone-600">
                              <p className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Owner: {request.ownerName}
                              </p>
                              <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {request.ownerEmail}
                              </p>
                              <p className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {request.storeDetails.city}, {request.storeDetails.country}
                              </p>
                              <p className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-stone-700 mb-4">{request.storeDetails.description}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setSelectedVerification(request)}
                          className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerificationAction(request.id, 'approve')}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerificationAction(request.id, 'reject')}
                              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-stone-200/50 p-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-600 text-lg">No orders found</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-stone-200/50 p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-xl font-bold text-stone-900">{order.orderNumber}</h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  order.status === 'pending'
                                    ? 'bg-amber-100 text-amber-700'
                                    : order.status === 'confirmed'
                                    ? 'bg-blue-100 text-blue-700'
                                    : order.status === 'processing'
                                    ? 'bg-purple-100 text-purple-700'
                                    : order.status === 'shipped'
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : order.status === 'delivered'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  order.paymentStatus === 'paid'
                                    ? 'bg-green-100 text-green-700'
                                    : order.paymentStatus === 'refunded'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600">
                              <div>
                                <p className="font-semibold text-stone-900 mb-1">Customer</p>
                                <p className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  {order.customerName}
                                </p>
                                <p className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  {order.customerEmail}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold text-stone-900 mb-1">Store</p>
                                <p className="flex items-center gap-2">
                                  <Store className="w-4 h-4" />
                                  {order.storeName}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="font-semibold text-stone-900 mb-2">Items</p>
                              <div className="space-y-1">
                                {order.items.map((item, idx) => (
                                  <p key={idx} className="text-sm text-stone-600">
                                    {item.quantity}x {item.productName} - {formatPrice(item.price * item.quantity)}
                                  </p>
                                ))}
                              </div>
                              <div className="mt-3 pt-3 border-t border-stone-200">
                                <p className="text-lg font-bold text-stone-900 flex items-center gap-2">
                                  <DollarSign className="w-5 h-5" />
                                  Total: {formatPrice(order.totalAmount)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 text-sm text-stone-600">
                              <p className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4" />
                                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.country}
                              </p>
                              <p className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-stone-700">Update Status</label>
                          <select
                            value={order.status}
                            onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value as Order['status'])}
                            className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-stone-700">Payment Status</label>
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value as Order['paymentStatus'])}
                            className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Verification Detail Modal */}
          {selectedVerification && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-stone-200 sticky top-0 bg-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-stone-900">Verification Details</h2>
                    <button
                      onClick={() => setSelectedVerification(null)}
                      className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
                    >
                      <XCircle className="w-6 h-6 text-stone-400" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 mb-4">Store Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-stone-600 mb-1">Store Name</p>
                        <p className="font-semibold">{selectedVerification.storeName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-stone-600 mb-1">Owner Name</p>
                        <p className="font-semibold">{selectedVerification.ownerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-stone-600 mb-1">Email</p>
                        <p className="font-semibold">{selectedVerification.ownerEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-stone-600 mb-1">Phone</p>
                        <p className="font-semibold">{selectedVerification.storeDetails.contactPhone}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-stone-600 mb-1">Description</p>
                      <p className="font-semibold">{selectedVerification.storeDetails.description}</p>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-stone-600 mb-1">Address</p>
                      <p className="font-semibold">
                        {selectedVerification.storeDetails.address}, {selectedVerification.storeDetails.city}, {selectedVerification.storeDetails.state} {selectedVerification.storeDetails.postalCode}, {selectedVerification.storeDetails.country}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 mb-4">Government ID</h3>
                    <div className="border-2 border-stone-200 rounded-xl overflow-hidden">
                      <img
                        src={selectedVerification.governmentIdUrl}
                        alt="Government ID"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  {selectedVerification.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-stone-200">
                      <button
                        onClick={() => handleVerificationAction(selectedVerification.id, 'approve')}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                      >
                        Approve Verification
                      </button>
                      <button
                        onClick={() => handleVerificationAction(selectedVerification.id, 'reject')}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                      >
                        Reject Verification
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-stone-200 sticky top-0 bg-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-stone-900">{selectedOrder.orderNumber}</h2>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
                    >
                      <XCircle className="w-6 h-6 text-stone-400" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 mb-4">Customer Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-stone-600">Name:</span> <span className="font-semibold">{selectedOrder.customerName}</span></p>
                        <p><span className="text-stone-600">Email:</span> <span className="font-semibold">{selectedOrder.customerEmail}</span></p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 mb-4">Store Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-stone-600">Store:</span> <span className="font-semibold">{selectedOrder.storeName}</span></p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 mb-4">Order Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-stone-50 rounded-xl">
                          <div>
                            <p className="font-semibold">{item.productName}</p>
                            <p className="text-sm text-stone-600">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                      <div className="pt-3 border-t-2 border-stone-200 flex justify-between items-center">
                        <p className="text-lg font-bold">Total</p>
                        <p className="text-xl font-bold text-amber-600">{formatPrice(selectedOrder.totalAmount)}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 mb-4">Shipping Address</h3>
                    <p className="text-sm">
                      {selectedOrder.shippingAddress.street}<br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}<br />
                      {selectedOrder.shippingAddress.country}
                    </p>
                  </div>
                  {selectedOrder.notes && (
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 mb-2">Notes</h3>
                      <p className="text-sm text-stone-600">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ViewTransition>
  );
}

