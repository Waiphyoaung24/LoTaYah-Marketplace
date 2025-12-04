'use server';

import { createClient } from '@/lib/supabase/server';

export interface StoreWithProducts {
  id: string;
  userId: string;
  name: string;
  description: string;
  logoImage: string;
  coverImage: string;
  location: string;
  reputationScore: number;
  totalSales: number;
  productCount: number;
  joinedDate: string;
  verified: boolean;
  ownerName?: string;
  products: ProductItem[];
}

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  imageUrl: string;
  images?: string[];
  category: string;
  categorySlug?: string;
  isFeatured: boolean;
  tags?: string[];
  createdAt: number;
  storeName: string;
  sellerId: string;
}

export interface StoreProfile {
  id: string;
  userId: string;
  name: string;
  description: string;
  logoImage: string;
  coverImage: string;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  reputationScore: number;
  totalSales: number;
  joinedDate: string;
  verified: boolean;
  ownerName?: string;
  ownerAvatar?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount: number;
}

/**
 * Fetch all approved stores with their products grouped
 */
export async function getStoresWithProducts(options?: {
  search?: string;
  categories?: string[];
}): Promise<StoreWithProducts[]> {
  const supabase = await createClient();

  // Fetch approved stores
  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select(`
      id,
      user_id,
      name,
      description,
      logo_url,
      cover_url,
      city,
      country,
      verification_status,
      reputation_score,
      total_sales,
      created_at,
      users(name, email)
    `)
    .eq('verification_status', 'approved')
    .order('reputation_score', { ascending: false });

  if (storesError) {
    console.error('Error fetching stores:', storesError);
    return [];
  }

  // Fetch all products from approved stores
  let productsQuery = supabase
    .from('products')
    .select(`
      id,
      store_id,
      title,
      description,
      price,
      compare_at_price,
      stock,
      image_url,
      images,
      is_featured,
      tags,
      created_at,
      categories(id, name, slug)
    `)
    .eq('is_active', true)
    .in('store_id', stores?.map(s => s.id) || [])
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  // Apply search filter
  if (options?.search) {
    productsQuery = productsQuery.or(
      `title.ilike.%${options.search}%,description.ilike.%${options.search}%`
    );
  }

  // Apply category filter
  if (options?.categories && options.categories.length > 0) {
    productsQuery = productsQuery.in('categories.name', options.categories);
  }

  const { data: products, error: productsError } = await productsQuery;

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return [];
  }

  // Group products by store
  const storeMap = new Map<string, StoreWithProducts>();

  stores?.forEach(store => {
    // Handle users - it can be an object or array depending on the join
    const storeUser = Array.isArray(store.users) 
      ? store.users[0] 
      : store.users;

    storeMap.set(store.id, {
      id: store.id,
      userId: store.user_id,
      name: store.name,
      description: store.description,
      logoImage: store.logo_url,
      coverImage: store.cover_url,
      location: store.city ? `${store.city}, ${store.country}` : store.country,
      reputationScore: store.reputation_score,
      totalSales: store.total_sales,
      productCount: 0,
      joinedDate: new Date(store.created_at).getFullYear().toString(),
      verified: store.verification_status === 'approved',
      ownerName: storeUser?.name,
      products: [],
    });
  });

  // Add products to stores
  products?.forEach(product => {
    const store = storeMap.get(product.store_id);
    if (store) {
      // Handle categories - it can be an object or array depending on the join
      const category = Array.isArray(product.categories) 
        ? product.categories[0] 
        : product.categories;

      store.products.push({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compare_at_price,
        stock: product.stock,
        imageUrl: product.image_url,
        images: product.images,
        category: category?.name || 'General',
        categorySlug: category?.slug,
        isFeatured: product.is_featured,
        tags: product.tags,
        createdAt: new Date(product.created_at).getTime(),
        storeName: store.name,
        sellerId: store.id,
      });
      store.productCount = store.products.length;
    }
  });

  // Filter out stores with no products (when filters are applied)
  return Array.from(storeMap.values()).filter(store => store.products.length > 0);
}

/**
 * Fetch a single store by ID with all its products
 */
export async function getStoreById(storeId: string): Promise<{
  store: StoreProfile | null;
  products: ProductItem[];
}> {
  const supabase = await createClient();

  // Fetch store details
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select(`
      id,
      user_id,
      name,
      description,
      logo_url,
      cover_url,
      address,
      city,
      state,
      postal_code,
      country,
      contact_email,
      contact_phone,
      verification_status,
      reputation_score,
      total_sales,
      created_at,
      users(name, email, avatar_url)
    `)
    .eq('id', storeId)
    .single();

  if (storeError || !store) {
    console.error('Error fetching store:', storeError);
    return { store: null, products: [] };
  }

  // Fetch store products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      id,
      title,
      description,
      price,
      compare_at_price,
      stock,
      image_url,
      images,
      is_featured,
      tags,
      created_at,
      categories(id, name, slug)
    `)
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (productsError) {
    console.error('Error fetching products:', productsError);
  }

  // Handle users - it can be an object or array depending on the join
  const storeUser = Array.isArray(store.users) 
    ? store.users[0] 
    : store.users;

  const formattedStore: StoreProfile = {
    id: store.id,
    userId: store.user_id,
    name: store.name,
    description: store.description,
    logoImage: store.logo_url,
    coverImage: store.cover_url,
    address: store.address,
    city: store.city,
    state: store.state,
    postalCode: store.postal_code,
    country: store.country,
    location: store.city ? `${store.city}, ${store.country}` : store.country,
    contactEmail: store.contact_email,
    contactPhone: store.contact_phone,
    reputationScore: store.reputation_score,
    totalSales: store.total_sales,
    joinedDate: new Date(store.created_at).getFullYear().toString(),
    verified: store.verification_status === 'approved',
    ownerName: storeUser?.name,
    ownerAvatar: storeUser?.avatar_url,
  };

  const formattedProducts: ProductItem[] = products?.map(product => {
    // Handle categories - it can be an object or array depending on the join
    const category = Array.isArray(product.categories) 
      ? product.categories[0] 
      : product.categories;

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compare_at_price,
      stock: product.stock,
      imageUrl: product.image_url,
      images: product.images,
      category: category?.name || 'General',
      categorySlug: category?.slug,
      isFeatured: product.is_featured,
      tags: product.tags,
      createdAt: new Date(product.created_at).getTime(),
      storeName: store.name,
      sellerId: store.id,
    };
  }) || [];

  return { store: formattedStore, products: formattedProducts };
}

/**
 * Fetch all categories with product counts
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug,
      description,
      image_url
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Get product counts per category
  const { data: productCounts } = await supabase
    .from('products')
    .select('category_id')
    .eq('is_active', true);

  const countsMap: { [key: string]: number } = {};
  productCounts?.forEach(p => {
    if (p.category_id) {
      countsMap[p.category_id] = (countsMap[p.category_id] || 0) + 1;
    }
  });

  return categories?.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    imageUrl: cat.image_url,
    productCount: countsMap[cat.id] || 0,
  })) || [];
}

/**
 * Search products across all stores
 */
export async function searchProducts(options: {
  query?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}): Promise<{ products: ProductItem[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select(`
      id,
      store_id,
      title,
      description,
      price,
      compare_at_price,
      stock,
      image_url,
      images,
      is_featured,
      tags,
      created_at,
      stores!inner(id, name, logo_url, verification_status),
      categories(id, name, slug)
    `, { count: 'exact' })
    .eq('is_active', true)
    .eq('stores.verification_status', 'approved');

  if (options.query) {
    query = query.or(`title.ilike.%${options.query}%,description.ilike.%${options.query}%`);
  }

  if (options.categories && options.categories.length > 0) {
    query = query.in('categories.name', options.categories);
  }

  if (options.minPrice !== undefined) {
    query = query.gte('price', options.minPrice);
  }

  if (options.maxPrice !== undefined) {
    query = query.lte('price', options.maxPrice);
  }

  query = query
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(options.offset || 0, (options.offset || 0) + (options.limit || 50) - 1);

  const { data: products, error, count } = await query;

  if (error) {
    console.error('Error searching products:', error);
    return { products: [], total: 0 };
  }

  const formattedProducts: ProductItem[] = products?.map(product => {
    // Handle categories - it can be an object or array depending on the join
    const category = Array.isArray(product.categories) 
      ? product.categories[0] 
      : product.categories;
    
    // Handle stores - it can be an object or array depending on the join
    const productStore = Array.isArray(product.stores) 
      ? product.stores[0] 
      : product.stores;

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compare_at_price,
      stock: product.stock,
      imageUrl: product.image_url,
      images: product.images,
      category: category?.name || 'General',
      categorySlug: category?.slug,
      isFeatured: product.is_featured,
      tags: product.tags,
      createdAt: new Date(product.created_at).getTime(),
      storeName: productStore?.name || 'Unknown Store',
      sellerId: product.store_id,
    };
  }) || [];

  return { products: formattedProducts, total: count || 0 };
}

/**
 * Update store profile
 */
export async function updateStoreProfile(data: {
  name?: string;
  description?: string;
  logoImage?: string;
  coverImage?: string;
  location?: string;
  city?: string;
  country?: string;
}): Promise<{ success: boolean; store?: StoreProfile; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Get the user's store
  const { data: existingStore, error: fetchError } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (fetchError || !existingStore) {
    return { success: false, error: 'Store not found' };
  }

  // Prepare update data
  const updateData: Record<string, any> = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.logoImage !== undefined) updateData.logo_url = data.logoImage;
  if (data.coverImage !== undefined) updateData.cover_url = data.coverImage;
  if (data.location !== undefined) {
    // Parse location into city/country if possible
    const parts = data.location.split(',').map(s => s.trim());
    if (parts.length >= 2) {
      updateData.city = parts[0];
      updateData.country = parts[parts.length - 1];
    } else if (parts.length === 1) {
      updateData.city = parts[0];
    }
  }
  if (data.city !== undefined) updateData.city = data.city;
  if (data.country !== undefined) updateData.country = data.country;

  if (Object.keys(updateData).length === 0) {
    return { success: false, error: 'No data to update' };
  }

  // Update the store
  const { data: updatedStore, error: updateError } = await supabase
    .from('stores')
    .update(updateData)
    .eq('id', existingStore.id)
    .select(`
      id,
      user_id,
      name,
      description,
      logo_url,
      cover_url,
      city,
      country,
      verification_status,
      reputation_score,
      total_sales,
      created_at
    `)
    .single();

  if (updateError) {
    console.error('Error updating store:', updateError);
    return { success: false, error: 'Failed to update store' };
  }

  const formattedStore: StoreProfile = {
    id: updatedStore.id,
    userId: updatedStore.user_id,
    name: updatedStore.name,
    description: updatedStore.description,
    logoImage: updatedStore.logo_url,
    coverImage: updatedStore.cover_url,
    location: updatedStore.city ? `${updatedStore.city}, ${updatedStore.country}` : updatedStore.country || '',
    reputationScore: updatedStore.reputation_score,
    totalSales: updatedStore.total_sales,
    joinedDate: new Date(updatedStore.created_at).getFullYear().toString(),
    verified: updatedStore.verification_status === 'approved',
  };

  return { success: true, store: formattedStore };
}

/**
 * Get current user's store profile
 */
export async function getMyStoreProfile(): Promise<{ success: boolean; store?: StoreProfile; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data: store, error } = await supabase
    .from('stores')
    .select(`
      id,
      user_id,
      name,
      description,
      logo_url,
      cover_url,
      city,
      country,
      verification_status,
      reputation_score,
      total_sales,
      created_at
    `)
    .eq('user_id', user.id)
    .single();

  if (error || !store) {
    return { success: false, error: 'Store not found' };
  }

  const formattedStore: StoreProfile = {
    id: store.id,
    userId: store.user_id,
    name: store.name,
    description: store.description,
    logoImage: store.logo_url,
    coverImage: store.cover_url,
    location: store.city ? `${store.city}, ${store.country}` : store.country || '',
    reputationScore: store.reputation_score,
    totalSales: store.total_sales,
    joinedDate: new Date(store.created_at).getFullYear().toString(),
    verified: store.verification_status === 'approved',
  };

  return { success: true, store: formattedStore };
}


