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
  AlertCircle,
  User,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  Store,
  Phone,
  RefreshCw
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Order } from '@/lib/types';
import { 
  getVerificationRequests, 
  approveVerificationRequest, 
  rejectVerificationRequest,
  VerificationRequest 
} from '@/src/actions/verification';

export default function AdminPage() {
  const { user, formatPrice, isAuthLoading } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'verifications' | 'orders'>('verifications');
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [orderFilterStatus, setOrderFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    // Wait for auth to finish loading
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }
    
    const isAdmin = user.isAdmin || user.role === 'admin';
    if (!isAdmin) {
      router.replace('/');
      return;
    }
  }, [user, isAuthLoading, router]);

  // Load verification requests from database
  const loadVerificationRequests = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      console.log('Loading verification requests...');
      const result = await getVerificationRequests(filterStatus === 'all' ? undefined : filterStatus);
      console.log('Verification requests result:', result);
      
      if (result.error) {
        console.error('Error from server:', result.error);
        setLoadError(result.error);
      }
      
      if (result.requests) {
        setVerificationRequests(result.requests);
      }
    } catch (error) {
      console.error('Error loading verification requests:', error);
      setLoadError('Failed to load verification requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin || user?.role === 'admin') {
      loadVerificationRequests();
    }
  }, [user, filterStatus]);

  // Load dummy orders (keep for now)
  useEffect(() => {
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
        createdAt: Date.now() - 3600000,
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
    ]);
  }, []);

  const handleApprove = async (requestId: string) => {
    setIsProcessing(requestId);
    try {
      const result = await approveVerificationRequest(requestId);
      if (result.success) {
        // Refresh the list
        await loadVerificationRequests();
        setSelectedVerification(null);
      } else {
        alert(result.error || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('An error occurred while approving the request');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setIsProcessing(requestId);
    try {
      const result = await rejectVerificationRequest(requestId, rejectionReason || undefined);
      if (result.success) {
        // Refresh the list
        await loadVerificationRequests();
        setSelectedVerification(null);
        setShowRejectModal(null);
        setRejectionReason('');
      } else {
        alert(result.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('An error occurred while rejecting the request');
    } finally {
      setIsProcessing(null);
    }
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
                         req.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.storeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = orderFilterStatus === 'all' || order.status === orderFilterStatus;
    return matchesSearch && matchesFilter;
  });

  // Show loading while auth is being checked
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

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
                <p className="text-stone-600 mt-1">Manage store verifications and orders</p>
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
              Store Verifications ({verificationRequests.filter(v => v.status === 'pending').length} pending)
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
              Orders ({orders.length})
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
                      setFilterStatus(e.target.value as 'all' | 'pending' | 'approved' | 'rejected');
                    } else {
                      setOrderFilterStatus(e.target.value as typeof orderFilterStatus);
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
                {activeTab === 'verifications' && (
                  <button
                    onClick={loadVerificationRequests}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl border-2 border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-5 h-5 text-stone-600 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Verification Requests Tab */}
          {activeTab === 'verifications' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-stone-200/50 p-12 text-center">
                  <Loader2 className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-spin" />
                  <p className="text-stone-600 text-lg">Loading verification requests...</p>
                </div>
              ) : loadError ? (
                <div className="bg-red-50 backdrop-blur-xl rounded-2xl shadow-lg border border-red-200 p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <p className="text-red-700 text-lg font-semibold mb-2">Error Loading Data</p>
                  <p className="text-red-600">{loadError}</p>
                  <p className="text-sm text-red-500 mt-4">
                    Check that RLS policies allow admin access to verification_requests table.
                    See <code className="bg-red-100 px-1 rounded">supabase/fix-verification-rls.sql</code>
                  </p>
                  <button 
                    onClick={loadVerificationRequests}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredVerifications.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-stone-200/50 p-12 text-center">
                  <Shield className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-600 text-lg">No verification requests found</p>
                  <p className="text-stone-400 text-sm mt-2">
                    {filterStatus !== 'all' ? `No ${filterStatus} requests` : 'When sellers submit store setup requests, they will appear here'}
                  </p>
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
                              {request.contactPhone && (
                                <p className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  {request.contactPhone}
                                </p>
                              )}
                              <p className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {request.city}, {request.country}
                              </p>
                              <p className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Submitted: {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-stone-700 mb-4 line-clamp-2">{request.storeDescription}</p>
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
                              onClick={() => handleApprove(request.id)}
                              disabled={isProcessing === request.id}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isProcessing === request.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => setShowRejectModal(request.id)}
                              disabled={isProcessing === request.id}
                              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
                    {selectedVerification.contactPhone && (
                      <div>
                        <p className="text-sm text-stone-600 mb-1">Phone</p>
                        <p className="font-semibold">{selectedVerification.contactPhone}</p>
                      </div>
                    )}
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-stone-600 mb-1">Description</p>
                      <p className="font-semibold">{selectedVerification.storeDescription}</p>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-stone-600 mb-1">Address</p>
                      <p className="font-semibold">
                        {selectedVerification.address}, {selectedVerification.city}, {selectedVerification.state} {selectedVerification.postalCode}, {selectedVerification.country}
                      </p>
                    </div>
                  </div>
                  {selectedVerification.governmentIdUrl && (
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 mb-4">Government ID</h3>
                      <div className="border-2 border-stone-200 rounded-xl overflow-hidden">
                        <img
                          src={selectedVerification.governmentIdUrl}
                          alt="Government ID"
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      </div>
                    </div>
                  )}
                  {selectedVerification.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-stone-200">
                      <button
                        onClick={() => handleApprove(selectedVerification.id)}
                        disabled={isProcessing === selectedVerification.id}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isProcessing === selectedVerification.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        Approve & Create Store
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectModal(selectedVerification.id);
                        }}
                        disabled={isProcessing === selectedVerification.id}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  )}
                  {selectedVerification.status === 'rejected' && selectedVerification.rejectionReason && (
                    <div className="bg-red-50 rounded-xl p-4">
                      <h4 className="font-semibold text-red-900 mb-2">Rejection Reason:</h4>
                      <p className="text-red-700">{selectedVerification.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reject Modal */}
          {showRejectModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-stone-900 mb-4">Reject Verification Request</h3>
                <p className="text-stone-600 mb-4">
                  Please provide a reason for rejection (optional). This will be shown to the seller.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Incomplete documentation, unclear ID photo..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none resize-none"
                  rows={4}
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setShowRejectModal(null);
                      setRejectionReason('');
                    }}
                    className="flex-1 px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(showRejectModal)}
                    disabled={isProcessing === showRejectModal}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing === showRejectModal ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Confirm Reject
                  </button>
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
