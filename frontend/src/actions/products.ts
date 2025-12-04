'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { validateProduct, ProductFormData, ValidationError } from '@/src/lib/product-validation';

// Re-export types
export type { ProductFormData, ValidationError };

// ============================================
// Types
// ============================================

export interface Product {
  id: string;
  storeId: string;
  categoryId?: string;
  title: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  imageUrl?: string;
  images?: string[];
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface ProductActionResult {
  success: boolean;
  product?: Product;
  products?: Product[];
  error?: string;
  errors?: ValidationError[];
  total?: number;
}

// ============================================
// Helper: Map DB row to Product
// ============================================

function mapDbToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    storeId: row.store_id as string,
    categoryId: row.category_id as string | undefined,
    title: row.title as string,
    description: row.description as string | undefined,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
    stock: Number(row.stock || 0),
    imageUrl: row.image_url as string | undefined,
    images: row.images as string[] | undefined,
    isActive: row.is_active as boolean,
    isFeatured: row.is_featured as boolean,
    tags: row.tags as string[] | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    category: row.categories ? {
      id: (row.categories as Record<string, unknown>).id as string,
      name: (row.categories as Record<string, unknown>).name as string,
    } : undefined,
  };
}

// ============================================
// Create Product
// ============================================

export async function createProduct(formData: ProductFormData): Promise<ProductActionResult> {
  try {
    // Validate form data
    const validationErrors = validateProduct(formData);
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }

    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to create a product' };
    }

    // Get user's store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (storeError || !store) {
      return { success: false, error: 'You must have a verified store to list products' };
    }

    // Create the product
    const { data: product, error: createError } = await supabase
      .from('products')
      .insert({
        store_id: store.id,
        category_id: formData.categoryId || null,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        price: formData.price,
        compare_at_price: formData.compareAtPrice || null,
        stock: formData.stock ?? 0,
        image_url: formData.imageUrl?.trim() || null,
        images: formData.images || null,
        is_active: formData.isActive ?? true,
        is_featured: formData.isFeatured ?? false,
        tags: formData.tags || null,
      })
      .select('*, categories(id, name)')
      .single();

    if (createError) {
      console.error('Error creating product:', createError);
      return { success: false, error: `Failed to create product: ${createError.message}` };
    }

    revalidatePath('/seller');
    revalidatePath('/browse');

    return { 
      success: true, 
      product: mapDbToProduct(product),
    };
  } catch (error) {
    console.error('Create product error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// ============================================
// Update Product
// ============================================

export async function updateProduct(
  productId: string, 
  formData: Partial<ProductFormData>
): Promise<ProductActionResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to update a product' };
    }

    // Get user's store
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!store) {
      return { success: false, error: 'Store not found' };
    }

    // Verify product belongs to user's store
    const { data: existingProduct } = await supabase
      .from('products')
      .select('store_id')
      .eq('id', productId)
      .single();

    if (!existingProduct || existingProduct.store_id !== store.id) {
      return { success: false, error: 'Product not found or you do not have permission to update it' };
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (formData.title !== undefined) updateData.title = formData.title.trim();
    if (formData.description !== undefined) updateData.description = formData.description?.trim() || null;
    if (formData.price !== undefined) updateData.price = formData.price;
    if (formData.compareAtPrice !== undefined) updateData.compare_at_price = formData.compareAtPrice || null;
    if (formData.stock !== undefined) updateData.stock = formData.stock;
    if (formData.imageUrl !== undefined) updateData.image_url = formData.imageUrl?.trim() || null;
    if (formData.images !== undefined) updateData.images = formData.images;
    if (formData.categoryId !== undefined) updateData.category_id = formData.categoryId || null;
    if (formData.isActive !== undefined) updateData.is_active = formData.isActive;
    if (formData.isFeatured !== undefined) updateData.is_featured = formData.isFeatured;
    if (formData.tags !== undefined) updateData.tags = formData.tags;

    const { data: product, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select('*, categories(id, name)')
      .single();

    if (updateError) {
      console.error('Error updating product:', updateError);
      return { success: false, error: `Failed to update product: ${updateError.message}` };
    }

    revalidatePath('/seller');
    revalidatePath('/browse');

    return { 
      success: true, 
      product: mapDbToProduct(product),
    };
  } catch (error) {
    console.error('Update product error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// ============================================
// Delete Product
// ============================================

export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to delete a product' };
    }

    // Get user's store
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!store) {
      return { success: false, error: 'Store not found' };
    }

    // Verify product belongs to user's store and delete
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('store_id', store.id);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      return { success: false, error: `Failed to delete product: ${deleteError.message}` };
    }

    revalidatePath('/seller');
    revalidatePath('/browse');

    return { success: true };
  } catch (error) {
    console.error('Delete product error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// ============================================
// Get My Products (Seller)
// ============================================

export async function getMyProducts(options?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}): Promise<ProductActionResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'You must be logged in' };
    }

    // Get user's store
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!store) {
      return { success: false, error: 'Store not found', products: [] };
    }

    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('products')
      .select('*, categories(id, name)', { count: 'exact' })
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive);
    }

    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return { success: false, error: 'Failed to fetch products' };
    }

    return { 
      success: true, 
      products: data?.map(mapDbToProduct) || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Get my products error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// ============================================
// Get Product by ID
// ============================================

export async function getProduct(productId: string): Promise<ProductActionResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name)')
      .eq('id', productId)
      .single();

    if (error || !data) {
      return { success: false, error: 'Product not found' };
    }

    return { 
      success: true, 
      product: mapDbToProduct(data),
    };
  } catch (error) {
    console.error('Get product error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// ============================================
// Get Products (Public - for Browse)
// ============================================

export async function getProducts(options?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  storeId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  featured?: boolean;
}): Promise<ProductActionResult> {
  try {
    const supabase = await createClient();

    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    // Build query - only active products from approved stores
    let query = supabase
      .from('products')
      .select(`
        *,
        categories(id, name),
        stores!inner(id, name, verification_status)
      `, { count: 'exact' })
      .eq('is_active', true)
      .eq('stores.verification_status', 'approved')
      .range(offset, offset + limit - 1);

    // Filters
    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.storeId) {
      query = query.eq('store_id', options.storeId);
    }

    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    if (options?.minPrice !== undefined) {
      query = query.gte('price', options.minPrice);
    }

    if (options?.maxPrice !== undefined) {
      query = query.lte('price', options.maxPrice);
    }

    if (options?.featured) {
      query = query.eq('is_featured', true);
    }

    // Sorting
    switch (options?.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return { success: false, error: 'Failed to fetch products' };
    }

    return { 
      success: true, 
      products: data?.map(mapDbToProduct) || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Get products error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// ============================================
// Toggle Product Active Status
// ============================================

export async function toggleProductActive(productId: string): Promise<ProductActionResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'You must be logged in' };
    }

    // Get user's store
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!store) {
      return { success: false, error: 'Store not found' };
    }

    // Get current product status
    const { data: currentProduct } = await supabase
      .from('products')
      .select('is_active, store_id')
      .eq('id', productId)
      .single();

    if (!currentProduct || currentProduct.store_id !== store.id) {
      return { success: false, error: 'Product not found' };
    }

    // Toggle status
    const { data: product, error: updateError } = await supabase
      .from('products')
      .update({ 
        is_active: !currentProduct.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select('*, categories(id, name)')
      .single();

    if (updateError) {
      console.error('Error toggling product:', updateError);
      return { success: false, error: 'Failed to update product' };
    }

    revalidatePath('/seller');
    revalidatePath('/browse');

    return { 
      success: true, 
      product: mapDbToProduct(product),
    };
  } catch (error) {
    console.error('Toggle product error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

