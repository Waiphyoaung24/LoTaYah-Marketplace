import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get a single store by ID with its products
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get store details
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
        users!inner(name, email, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Get store products
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
        categories!inner(id, name, slug)
      `)
      .eq('store_id', id)
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

    // Format response
    const formattedStore = {
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

    const formattedProducts = products?.map(product => {
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

    return NextResponse.json({
      store: formattedStore,
      products: formattedProducts,
    });
  } catch (error) {
    console.error('Store GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update store (owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns this store
    const { data: store } = await supabase
      .from('stores')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!store || store.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      logoUrl,
      coverUrl,
      address,
      city,
      state,
      postalCode,
      country,
      contactEmail,
      contactPhone,
    } = body;

    // Update the store
    const { data: updatedStore, error: updateError } = await supabase
      .from('stores')
      .update({
        name,
        description,
        logo_url: logoUrl,
        cover_url: coverUrl,
        address,
        city,
        state,
        postal_code: postalCode,
        country,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating store:', updateError);
      return NextResponse.json(
        { error: 'Failed to update store' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      store: updatedStore,
      message: 'Store updated successfully',
    });
  } catch (error) {
    console.error('Store PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete store (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns this store
    const { data: store } = await supabase
      .from('stores')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!store || store.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete the store (cascade will delete products)
    const { error: deleteError } = await supabase
      .from('stores')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting store:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete store' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Store deleted successfully',
    });
  } catch (error) {
    console.error('Store DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


