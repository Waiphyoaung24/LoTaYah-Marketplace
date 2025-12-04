'use client';

import { ViewTransition } from 'react';
import { SellerDashboard } from '@/components/SellerDashboard';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { getMyVerificationStatus, VerificationRequest } from '@/src/actions/verification';
import { Clock, XCircle, Store, Loader2, RefreshCw, ArrowRight } from 'lucide-react';

export default function SellerPage() {
  const { user, isAuthLoading } = useApp();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<{
    hasStore: boolean;
    hasRequest: boolean;
    request?: VerificationRequest;
  } | null>(null);
  const hasCheckedStatus = useRef(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (isAuthLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!user) {
      router.replace('/login');
      return;
    }

    // Only check status once
    if (hasCheckedStatus.current) {
      return;
    }
    hasCheckedStatus.current = true;

    const checkStatus = async () => {
      try {
        const status = await getMyVerificationStatus();
        setVerificationStatus(status);

        // If user is verified (has store), they can stay on this page
        if (status.hasStore || user.storeVerified) {
          setIsLoading(false);
          return;
        }

        // If no request and not verified, redirect to setup
        if (!status.hasRequest && !user.storeVerified) {
          router.replace('/seller/setup');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking verification status:', error);
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [user, isAuthLoading, router]);

  // Show loading while auth is being checked or page is loading
  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  // User not authenticated (should redirect above)
  if (!user) {
    return null;
  }

  // User is verified - show dashboard
  if (user.storeVerified || verificationStatus?.hasStore) {
    return (
      <ViewTransition>
        <SellerDashboard />
      </ViewTransition>
    );
  }

  // User has pending verification request
  if (verificationStatus?.hasRequest && verificationStatus.request?.status === 'pending') {
    return (
      <ViewTransition>
        <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-stone-200/50 p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
                <Clock className="w-10 h-10 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold text-stone-900 mb-4">Verification Pending</h1>
              <p className="text-lg text-stone-600 mb-8">
                Your store verification request for <strong className="text-stone-900">{verificationStatus.request.storeName}</strong> is under review. 
                Our team will verify your documents and get back to you within 1-3 business days.
              </p>
              <div className="bg-amber-50 rounded-xl p-6 text-left mb-8">
                <h3 className="font-semibold text-stone-900 mb-3">Request Details:</h3>
                <div className="space-y-2 text-sm text-stone-600">
                  <p><strong>Store Name:</strong> {verificationStatus.request.storeName}</p>
                  <p><strong>Owner:</strong> {verificationStatus.request.ownerName}</p>
                  <p><strong>Location:</strong> {verificationStatus.request.city}, {verificationStatus.request.country}</p>
                  <p><strong>Submitted:</strong> {new Date(verificationStatus.request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-colors"
                >
                  Return to Home
                </button>
                <button
                  onClick={() => router.push('/browse')}
                  className="px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                >
                  Browse Products
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </ViewTransition>
    );
  }

  // User has rejected verification request
  if (verificationStatus?.hasRequest && verificationStatus.request?.status === 'rejected') {
    return (
      <ViewTransition>
        <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-stone-200/50 p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-stone-900 mb-4">Verification Rejected</h1>
              <p className="text-lg text-stone-600 mb-4">
                Unfortunately, your store verification request was not approved.
              </p>
              {verificationStatus.request.rejectionReason && (
                <div className="bg-red-50 rounded-xl p-6 text-left mb-8">
                  <h3 className="font-semibold text-red-900 mb-2">Reason:</h3>
                  <p className="text-red-700">{verificationStatus.request.rejectionReason}</p>
                </div>
              )}
              <p className="text-stone-600 mb-8">
                You can submit a new verification request with updated information.
              </p>
              <button
                onClick={() => router.push('/seller/setup')}
                className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 transition-all duration-200 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 mx-auto"
              >
                <RefreshCw className="w-5 h-5" />
                Submit New Request
              </button>
            </div>
          </div>
        </div>
      </ViewTransition>
    );
  }

  // Default: redirect to setup (should not reach here normally)
  return (
    <ViewTransition>
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-stone-200/50 p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
              <Store className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-stone-900 mb-4">Start Selling on LoTaYah</h1>
            <p className="text-lg text-stone-600 mb-8">
              Set up your store to start selling your products to customers across Myanmar, Thailand, and the UK.
            </p>
            <button
              onClick={() => router.push('/seller/setup')}
              className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 transition-all duration-200 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 mx-auto"
            >
              <Store className="w-5 h-5" />
              Set Up Your Store
            </button>
          </div>
        </div>
      </div>
    </ViewTransition>
  );
}
