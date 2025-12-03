'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ViewTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, CheckCircle, Store, User, Mail, Phone, MapPin, FileText, Image as ImageIcon, AlertCircle, ChevronDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface FormData {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  governmentId: File | null;
  governmentIdPreview: string | null;
}

export default function StoreSetupPage() {
  const { user, t, setUser } = useApp();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [formData, setFormData] = useState<FormData>({
    storeName: '',
    storeDescription: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    governmentId: null,
    governmentIdPreview: null,
  });

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // If user is already verified, redirect to seller dashboard
    if (user.storeVerified) {
      router.push('/seller');
    }
  }, [user, router]);

  // Update email when user is available
  useEffect(() => {
    if (user?.email && !formData.contactEmail) {
      setFormData(prev => ({ ...prev, contactEmail: user.email }));
    }
  }, [user, formData.contactEmail]);

  // Don't render the page if user is not logged in or already verified
  if (!user || user.storeVerified) {
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    } else if (formData.storeName.trim().length < 3) {
      newErrors.storeName = 'Store name must be at least 3 characters';
    }

    if (!formData.storeDescription.trim()) {
      newErrors.storeDescription = 'Store description is required';
    } else if (formData.storeDescription.trim().length < 20) {
      newErrors.storeDescription = 'Store description must be at least 20 characters';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State/Region is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.governmentId) {
      newErrors.governmentId = 'Government ID photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, governmentId: 'Please upload an image file' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, governmentId: 'File size must be less than 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          governmentId: file,
          governmentIdPreview: reader.result as string,
        }));
        setErrors(prev => ({ ...prev, governmentId: undefined }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      governmentId: null,
      governmentIdPreview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors(prev => ({ ...prev, governmentId: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement API call to submit store setup
      // For now, just simulate submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark user as verified after successful submission
      if (user) {
        setUser({
          ...user,
          storeVerified: true,
        });
      }

      // After successful submission, redirect to seller dashboard
      router.push('/seller');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit store setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ViewTransition>
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl mb-4 shadow-lg shadow-amber-400/30">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-3">
              Set Up Your Store
            </h1>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Complete your store profile to start selling on LoTaYah. All information is secure and will be verified.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-stone-200/50 p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Store Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
                  <Store className="w-5 h-5 text-amber-600" />
                  <h2 className="text-2xl font-bold text-stone-900">Store Information</h2>
                </div>

                {/* Store Name */}
                <div>
                  <label htmlFor="storeName" className="block text-sm font-semibold text-stone-700 mb-2">
                    Store Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="storeName"
                    value={formData.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      errors.storeName
                        ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                    } focus:outline-none`}
                    placeholder="Enter your store name"
                  />
                  {errors.storeName && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.storeName}
                    </p>
                  )}
                </div>

                {/* Store Description */}
                <div>
                  <label htmlFor="storeDescription" className="block text-sm font-semibold text-stone-700 mb-2">
                    Store Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="storeDescription"
                    value={formData.storeDescription}
                    onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 resize-none ${
                      errors.storeDescription
                        ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                    } focus:outline-none`}
                    placeholder="Describe your store, what you sell, and what makes it special..."
                  />
                  <p className="mt-1.5 text-xs text-stone-500">
                    {formData.storeDescription.length}/500 characters (minimum 20)
                  </p>
                  {errors.storeDescription && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.storeDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-6 pt-6 border-t border-stone-200">
                <div className="flex items-center gap-3 pb-4">
                  <User className="w-5 h-5 text-amber-600" />
                  <h2 className="text-2xl font-bold text-stone-900">Contact Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Email */}
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-semibold text-stone-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        errors.contactEmail
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                      } focus:outline-none`}
                      placeholder="your@email.com"
                    />
                    {errors.contactEmail && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.contactEmail}
                      </p>
                    )}
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-semibold text-stone-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        errors.contactPhone
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                      } focus:outline-none`}
                      placeholder="+95 9XX XXX XXXX"
                    />
                    {errors.contactPhone && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.contactPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="space-y-6 pt-6 border-t border-stone-200">
                <div className="flex items-center gap-3 pb-4">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <h2 className="text-2xl font-bold text-stone-900">Address Information</h2>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-stone-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      errors.address
                        ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                    } focus:outline-none`}
                    placeholder="Street address, building, apartment"
                  />
                  {errors.address && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-stone-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        errors.city
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                      } focus:outline-none`}
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* State/Region */}
                  <div>
                    <label htmlFor="state" className="block text-sm font-semibold text-stone-700 mb-2">
                      State/Region <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        errors.state
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                      } focus:outline-none`}
                      placeholder="State/Region"
                    />
                    {errors.state && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.state}
                      </p>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-semibold text-stone-700 mb-2">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        errors.postalCode
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                      } focus:outline-none`}
                      placeholder="Postal Code"
                    />
                    {errors.postalCode && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-stone-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className={`w-full px-4 py-3 pr-10 rounded-xl border-2 transition-all duration-200 appearance-none bg-stone-50 ${
                        errors.country
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                      } focus:outline-none cursor-pointer`}
                    >
                      <option value="">Select a country</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Myanmar">Myanmar</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                  </div>
                  {errors.country && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.country}
                    </p>
                  )}
                </div>
              </div>

              {/* Government ID Upload Section */}
              <div className="space-y-6 pt-6 border-t border-stone-200">
                <div className="flex items-center gap-3 pb-4">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <h2 className="text-2xl font-bold text-stone-900">Verification</h2>
                </div>

                <div className="bg-amber-50/50 border-2 border-amber-200/50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-stone-700 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>
                      For security and verification purposes, please upload a clear photo of your government-issued ID (National ID, Passport, or Driver's License). 
                      This information is encrypted and securely stored. Your store will be verified before going live.
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    Government ID Photo <span className="text-red-500">*</span>
                  </label>

                  {!formData.governmentIdPreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                        errors.governmentId
                          ? 'border-red-300 bg-red-50/50 hover:bg-red-50'
                          : 'border-stone-300 bg-stone-50 hover:border-amber-400 hover:bg-amber-50/30'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                          <Upload className="w-8 h-8 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-stone-700 font-medium">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-stone-500 mt-1">
                            PNG, JPG, or JPEG (max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border-2 border-amber-300 rounded-xl overflow-hidden bg-stone-50">
                      <div className="relative aspect-video">
                        <img
                          src={formData.governmentIdPreview}
                          alt="Government ID preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-3 bg-white border-t border-stone-200">
                        <p className="text-sm text-stone-600 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {formData.governmentId?.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {errors.governmentId && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.governmentId}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-stone-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 rounded-xl font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors border-2 border-stone-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Submit Store Setup
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Info Footer */}
          <div className="mt-8 text-center text-sm text-stone-500">
            <p>
              By submitting this form, you agree to our Terms of Service and Privacy Policy.
              Your information will be securely processed and verified.
            </p>
          </div>
        </div>
      </div>
    </ViewTransition>
  );
}

