'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { validateStoreSetup, StoreSetupFormData, ValidationError } from '@/src/lib/store-validation';

// Re-export types for convenience
export type { StoreSetupFormData, ValidationError };

export interface StoreSetupResult {
  success: boolean;
  storeId?: string;
  errors?: ValidationError[];
  message?: string;
}

/**
 * Create a new store (Server Action)
 */
export async function createStore(formData: StoreSetupFormData): Promise<StoreSetupResult> {
  try {
    // Validate form data
    const validationErrors = validateStoreSetup(formData);
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }

    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'You must be logged in to create a store' }] 
      };
    }

    // Ensure user profile exists in users table (foreign key requirement)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      // User profile doesn't exist - create it
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          is_admin: false,
          store_verified: false,
        });

      if (createUserError) {
        console.error('Error creating user profile:', createUserError);
        return { 
          success: false, 
          errors: [{ field: 'general', message: 'Failed to create user profile. Please try again.' }] 
        };
      }
    }

    // Check if user already has a store
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingStore) {
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'You already have a store' }] 
      };
    }

    // Create the store
    const { data: store, error: createError } = await supabase
      .from('stores')
      .insert({
        user_id: user.id,
        name: formData.storeName.trim(),
        description: formData.storeDescription.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postal_code: formData.postalCode.trim(),
        country: formData.country,
        contact_email: formData.contactEmail.trim(),
        contact_phone: formData.contactPhone.trim(),
        government_id_url: formData.governmentIdUrl,
        verification_status: 'pending',
        reputation_score: 0,
        total_sales: 0,
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating store:', createError);
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'Failed to create store. Please try again.' }] 
      };
    }

    // Update user's store_verified status to pending
    await supabase
      .from('users')
      .update({ store_verified: false })
      .eq('id', user.id);

    revalidatePath('/seller');
    revalidatePath('/seller/setup');

    return { 
      success: true, 
      storeId: store.id,
      message: 'Store created successfully! Your store is pending verification.' 
    };
  } catch (error) {
    console.error('Store creation error:', error);
    return { 
      success: false, 
      errors: [{ field: 'general', message: 'An unexpected error occurred. Please try again.' }] 
    };
  }
}

/**
 * Update an existing store (Server Action)
 */
export async function updateStore(
  storeId: string, 
  formData: Partial<StoreSetupFormData>
): Promise<StoreSetupResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'You must be logged in to update a store' }] 
      };
    }

    // Verify ownership
    const { data: store } = await supabase
      .from('stores')
      .select('user_id')
      .eq('id', storeId)
      .single();

    if (!store || store.user_id !== user.id) {
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'You do not have permission to update this store' }] 
      };
    }

    // Build update object
    const updateData: Record<string, string | undefined> = {};
    if (formData.storeName) updateData.name = formData.storeName.trim();
    if (formData.storeDescription) updateData.description = formData.storeDescription.trim();
    if (formData.address) updateData.address = formData.address.trim();
    if (formData.city) updateData.city = formData.city.trim();
    if (formData.state) updateData.state = formData.state.trim();
    if (formData.postalCode) updateData.postal_code = formData.postalCode.trim();
    if (formData.country) updateData.country = formData.country;
    if (formData.contactEmail) updateData.contact_email = formData.contactEmail.trim();
    if (formData.contactPhone) updateData.contact_phone = formData.contactPhone.trim();

    const { error: updateError } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', storeId);

    if (updateError) {
      console.error('Error updating store:', updateError);
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'Failed to update store. Please try again.' }] 
      };
    }

    revalidatePath('/seller');

    return { 
      success: true, 
      storeId,
      message: 'Store updated successfully!' 
    };
  } catch (error) {
    console.error('Store update error:', error);
    return { 
      success: false, 
      errors: [{ field: 'general', message: 'An unexpected error occurred. Please try again.' }] 
    };
  }
}

/**
 * Get the current user's store (Server Action)
 */
export async function getMyStore(): Promise<{
  store: StoreSetupFormData & { id: string; verificationStatus: string } | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { store: null, error: 'Not authenticated' };
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (storeError || !store) {
      return { store: null };
    }

    return {
      store: {
        id: store.id,
        storeName: store.name,
        storeDescription: store.description,
        contactEmail: store.contact_email,
        contactPhone: store.contact_phone,
        address: store.address,
        city: store.city,
        state: store.state,
        postalCode: store.postal_code,
        country: store.country,
        governmentIdUrl: store.government_id_url,
        verificationStatus: store.verification_status,
      },
    };
  } catch (error) {
    console.error('Get store error:', error);
    return { store: null, error: 'Failed to fetch store' };
  }
}

/**
 * Delete a store (Server Action)
 */
export async function deleteStore(storeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify ownership
    const { data: store } = await supabase
      .from('stores')
      .select('user_id')
      .eq('id', storeId)
      .single();

    if (!store || store.user_id !== user.id) {
      return { success: false, error: 'You do not have permission to delete this store' };
    }

    const { error: deleteError } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId);

    if (deleteError) {
      console.error('Error deleting store:', deleteError);
      return { success: false, error: 'Failed to delete store' };
    }

    // Update user's store_verified status
    await supabase
      .from('users')
      .update({ store_verified: false })
      .eq('id', user.id);

    revalidatePath('/seller');
    revalidatePath('/seller/setup');

    return { success: true };
  } catch (error) {
    console.error('Store deletion error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
