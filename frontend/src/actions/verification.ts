'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ============================================
// Types (matching verification_requests table)
// ============================================

export interface VerificationRequestData {
  storeName: string;
  ownerName: string;
  ownerEmail: string;
  contactPhone?: string;
  governmentIdUrl: string;
  storeDescription?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface VerificationRequest {
  id: string;
  storeId: string;
  userId: string;
  storeName: string;
  ownerName: string;
  ownerEmail: string;
  contactPhone?: string;
  governmentIdUrl: string;
  storeDescription?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

// ============================================
// Create Verification Request
// ============================================

/**
 * Submit a store verification request
 * This creates a pending request that admin must approve
 */
export async function submitVerificationRequest(
  formData: VerificationRequestData
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to submit a verification request' };
    }

    // Ensure user profile exists
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      // Create user profile
      await supabase.from('users').insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        is_admin: false,
        store_verified: false,
      });
    }

    // Check if user already has a pending request
    const { data: existingRequest } = await supabase
      .from('verification_requests')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return { success: false, error: 'You already have a pending verification request' };
    }

    // Check if user already has an approved store
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingStore) {
      return { success: false, error: 'You already have a store' };
    }

    // Generate a temporary store_id (UUID) for the verification request
    // This will be used to create the actual store if approved
    const tempStoreId = crypto.randomUUID();

    // Create verification request
    const { data: request, error: createError } = await supabase
      .from('verification_requests')
      .insert({
        store_id: tempStoreId,
        user_id: user.id,
        store_name: formData.storeName.trim(),
        owner_name: formData.ownerName.trim(),
        owner_email: formData.ownerEmail.trim(),
        contact_phone: formData.contactPhone?.trim() || null,
        government_id_url: formData.governmentIdUrl,
        store_description: formData.storeDescription?.trim() || null,
        address: formData.address?.trim() || null,
        city: formData.city?.trim() || null,
        state: formData.state?.trim() || null,
        postal_code: formData.postalCode?.trim() || null,
        country: formData.country || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating verification request:', createError);
      return { success: false, error: 'Failed to submit verification request. Please try again.' };
    }

    revalidatePath('/seller/setup');
    revalidatePath('/admin');

    return { 
      success: true, 
      data: { requestId: request.id }
    };
  } catch (error) {
    console.error('Verification request error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// ============================================
// Get Verification Requests (Admin)
// ============================================

/**
 * Get all verification requests (admin only)
 */
export async function getVerificationRequests(
  status?: 'pending' | 'approved' | 'rejected' | 'all'
): Promise<{ requests: VerificationRequest[]; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify admin status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Admin page - Auth check:', { userId: user?.id, authError });
    
    if (authError || !user) {
      console.log('Admin page - Not authenticated');
      return { requests: [], error: 'Not authenticated' };
    }

    const { data: adminCheck, error: adminError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    console.log('Admin page - Admin check:', { adminCheck, adminError });

    if (!adminCheck?.is_admin) {
      console.log('Admin page - User is not admin');
      return { requests: [], error: 'Not authorized' };
    }

    // Build query - fetch all verification requests
    console.log('Admin page - Fetching verification requests, status filter:', status);
    
    let query = supabase
      .from('verification_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    console.log('Admin page - Query result:', { 
      dataCount: data?.length || 0, 
      error,
      firstRecord: data?.[0] 
    });

    if (error) {
      console.error('Error fetching verification requests:', error);
      return { requests: [], error: `Failed to fetch requests: ${error.message}` };
    }

    const requests: VerificationRequest[] = data?.map(req => ({
      id: req.id,
      storeId: req.store_id,
      userId: req.user_id,
      storeName: req.store_name,
      ownerName: req.owner_name,
      ownerEmail: req.owner_email,
      contactPhone: req.contact_phone,
      governmentIdUrl: req.government_id_url,
      storeDescription: req.store_description,
      address: req.address,
      city: req.city,
      state: req.state,
      postalCode: req.postal_code,
      country: req.country,
      status: req.status,
      reviewedBy: req.reviewed_by,
      reviewedAt: req.reviewed_at,
      rejectionReason: req.rejection_reason,
      createdAt: req.created_at,
      updatedAt: req.updated_at,
    })) || [];

    return { requests };
  } catch (error) {
    console.error('Get verification requests error:', error);
    return { requests: [], error: 'An unexpected error occurred' };
  }
}

// ============================================
// Approve Verification Request (Admin)
// ============================================

/**
 * Approve a verification request and create the store
 * Note: The trigger 'on_verification_status_change' may handle store creation automatically
 */
export async function approveVerificationRequest(
  requestId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Verify admin status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: adminCheck } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!adminCheck?.is_admin) {
      return { success: false, error: 'Not authorized' };
    }

    // Get the verification request
    const { data: request, error: fetchError } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return { success: false, error: 'Verification request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'This request has already been processed' };
    }

    // Update verification request status
    // The trigger 'on_verification_status_change' should handle store creation
    const { error: updateError } = await supabase
      .from('verification_requests')
      .update({ 
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error approving request:', updateError);
      return { success: false, error: `Failed to approve request: ${updateError.message}` };
    }

    // Check if trigger already created the store, if not create manually
    // Use user_id instead of store_id to check (store_id might be text vs uuid issue)
    let { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', request.user_id)
      .single();

    if (!store) {
      // Create the store manually (let database generate the ID)
      const { data: newStore, error: storeError } = await supabase
        .from('stores')
        .insert({
          user_id: request.user_id,
          name: request.store_name,
          description: request.store_description,
          contact_email: request.owner_email,
          contact_phone: request.contact_phone,
          address: request.address,
          city: request.city,
          state: request.state,
          postal_code: request.postal_code,
          country: request.country,
          verification_status: 'approved',
          reputation_score: 0,
          total_sales: 0,
        })
        .select('id')
        .single();

      if (storeError) {
        console.error('Error creating store:', storeError);
        return { success: false, error: `Failed to create store: ${storeError.message}` };
      }

      store = newStore;
    }

    // Update user's store_verified status
    // Cast to string to handle text vs uuid type mismatch
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ store_verified: true, updated_at: new Date().toISOString() })
      .eq('id', String(request.user_id));

    if (userUpdateError) {
      console.error('Error updating user store_verified:', userUpdateError);
      // Don't fail the whole operation - store was created successfully
    }

    revalidatePath('/admin');
    revalidatePath('/seller');
    revalidatePath('/browse');

    return { 
      success: true, 
      data: { storeId: store?.id }
    };
  } catch (error) {
    console.error('Approve verification error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// ============================================
// Reject Verification Request (Admin)
// ============================================

/**
 * Reject a verification request
 */
export async function rejectVerificationRequest(
  requestId: string,
  reason?: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Verify admin status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: adminCheck } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!adminCheck?.is_admin) {
      return { success: false, error: 'Not authorized' };
    }

    // Get the verification request
    const { data: request, error: fetchError } = await supabase
      .from('verification_requests')
      .select('status')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return { success: false, error: 'Verification request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'This request has already been processed' };
    }

    // Update verification request status
    const { error: updateError } = await supabase
      .from('verification_requests')
      .update({ 
        status: 'rejected',
        rejection_reason: reason || 'Your verification request was rejected.',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error rejecting request:', updateError);
      return { success: false, error: 'Failed to reject request' };
    }

    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Reject verification error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// ============================================
// Get User's Verification Status
// ============================================

/**
 * Get the current user's verification request status
 */
export async function getMyVerificationStatus(): Promise<{
  hasRequest: boolean;
  request?: VerificationRequest;
  hasStore: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { hasRequest: false, hasStore: false, error: 'Not authenticated' };
    }

    // Check for existing store
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (store) {
      return { hasRequest: false, hasStore: true };
    }

    // Check for existing verification request
    const { data: request } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (request) {
      return {
        hasRequest: true,
        request: {
          id: request.id,
          storeId: request.store_id,
          userId: request.user_id,
          storeName: request.store_name,
          ownerName: request.owner_name,
          ownerEmail: request.owner_email,
          contactPhone: request.contact_phone,
          governmentIdUrl: request.government_id_url,
          storeDescription: request.store_description,
          address: request.address,
          city: request.city,
          state: request.state,
          postalCode: request.postal_code,
          country: request.country,
          status: request.status,
          reviewedBy: request.reviewed_by,
          reviewedAt: request.reviewed_at,
          rejectionReason: request.rejection_reason,
          createdAt: request.created_at,
          updatedAt: request.updated_at,
        },
        hasStore: false,
      };
    }

    return { hasRequest: false, hasStore: false };
  } catch (error) {
    console.error('Get verification status error:', error);
    return { hasRequest: false, hasStore: false, error: 'An unexpected error occurred' };
  }
}
