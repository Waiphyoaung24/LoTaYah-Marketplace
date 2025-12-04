import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List all products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const storeId = searchParams.get('storeId') || '';
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? true : false;

    const supabase = await createClient();

    // Build the query
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
        categories!inner(id, name, slug)
      `)
      .eq('is_active', true)
      .eq('stores.verification_status', 'approved');

    // Add filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (categories.length > 0) {
      query = query.in('categories.name', categories);
    }

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    // Add sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder })
      .range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Format response
    const formattedProducts = products?.map(product => {
      // Handle categories - it can be an object or array depending on the join
      const category = Array.isArray(product.categories) 
        ? product.categories[0] 
        : product.categories;
      
      // Handle stores - it can be an object or array depending on the join
      const store = Array.isArray(product.stores) 
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
        storeName: store?.name,
        sellerId: product.store_id,
        storeLogoUrl: store?.logo_url,
      };
    }) || [];

    return NextResponse.json({
      products: formattedProducts,
      total: count || formattedProducts.length,
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new product (store owner only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's store
    const { data: store } = await supabase
      .from('stores')
      .select('id, verification_status')
      .eq('user_id', user.id)
      .single();

    if (!store) {
      return NextResponse.json(
        { error: 'You do not have a store' },
        { status: 400 }
      );
    }

    if (store.verification_status !== 'approved') {
      return NextResponse.json(
        { error: 'Your store must be verified to add products' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      compareAtPrice,
      stock,
      imageUrl,
      images,
      categoryId,
      tags,
      isFeatured,
    } = body;

    // Validate required fields
    if (!title || price === undefined || price < 0) {
      return NextResponse.json(
        { error: 'Title and valid price are required' },
        { status: 400 }
      );
    }

    // Create the product
    const { data: product, error: createError } = await supabase
      .from('products')
      .insert({
        store_id: store.id,
        category_id: categoryId || 'cat-general',
        title,
        description,
        price,
        compare_at_price: compareAtPrice,
        stock: stock || 0,
        image_url: imageUrl,
        images: images || [],
        is_active: true,
        is_featured: isFeatured || false,
        tags: tags || [],
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating product:', createError);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      product,
      message: 'Product created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


