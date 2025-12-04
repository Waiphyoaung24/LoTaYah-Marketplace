import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List all approved stores with their product counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createClient();

    // Build the query
    let query = supabase
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
        users!inner(name, email)
      `)
      .eq('verification_status', 'approved')
      .order('reputation_score', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: stores, error, count } = await query;

    if (error) {
      console.error('Error fetching stores:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stores' },
        { status: 500 }
      );
    }

    // Get product counts for each store
    const storeIds = stores?.map(s => s.id) || [];
    const { data: productCounts } = await supabase
      .from('products')
      .select('store_id')
      .in('store_id', storeIds)
      .eq('is_active', true);

    // Count products per store
    const countsMap: { [key: string]: number } = {};
    productCounts?.forEach(p => {
      countsMap[p.store_id] = (countsMap[p.store_id] || 0) + 1;
    });

    // Format response
    const formattedStores = stores?.map(store => {
      // Handle users - it can be an object or array depending on the join
      const storeUser = Array.isArray(store.users) 
        ? store.users[0] 
        : store.users;

      return {
        id: store.id,
        userId: store.user_id,
        name: store.name,
        description: store.description,
        logoImage: store.logo_url,
        coverImage: store.cover_url,
        location: store.city ? `${store.city}, ${store.country}` : store.country,
        reputationScore: store.reputation_score,
        totalSales: store.total_sales,
        productCount: countsMap[store.id] || 0,
        joinedDate: new Date(store.created_at).getFullYear().toString(),
        verified: store.verification_status === 'approved',
        ownerName: storeUser?.name,
      };
    }) || [];

    return NextResponse.json({
      stores: formattedStores,
      total: count || formattedStores.length,
    });
  } catch (error) {
    console.error('Stores GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new store (requires authenticated user)
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

    // Validate required fields
    if (!name || !contactEmail || !country) {
      return NextResponse.json(
        { error: 'Name, contact email, and country are required' },
        { status: 400 }
      );
    }

    // Check if user already has a store
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingStore) {
      return NextResponse.json(
        { error: 'You already have a store' },
        { status: 400 }
      );
    }

    // Create the store
    const { data: store, error: createError } = await supabase
      .from('stores')
      .insert({
        user_id: user.id,
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
        verification_status: 'pending',
        reputation_score: 0,
        total_sales: 0,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating store:', createError);
      return NextResponse.json(
        { error: 'Failed to create store' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      store,
      message: 'Store created successfully. Pending verification.',
    }, { status: 201 });
  } catch (error) {
    console.error('Stores POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


