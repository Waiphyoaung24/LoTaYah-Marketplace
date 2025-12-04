import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: product, error } = await supabase
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
        updated_at,
        stores!inner(id, name, logo_url, description, city, country, reputation_score),
        categories!inner(id, name, slug)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Handle categories - it can be an object or array depending on the join
    const category = Array.isArray(product.categories) 
      ? product.categories[0] 
      : product.categories;
    
    // Handle stores - it can be an object or array depending on the join
    const store = Array.isArray(product.stores) 
      ? product.stores[0] 
      : product.stores;

    const formattedProduct = {
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
      updatedAt: new Date(product.updated_at).getTime(),
      storeName: store?.name,
      sellerId: product.store_id,
      store: {
        id: store?.id,
        name: store?.name,
        logoUrl: store?.logo_url,
        description: store?.description,
        location: store?.city 
          ? `${store.city}, ${store.country}` 
          : store?.country,
        reputationScore: store?.reputation_score,
      },
    };

    return NextResponse.json({ product: formattedProduct });
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update product (store owner only)
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

    // Check if user owns the product's store
    const { data: productCheck } = await supabase
      .from('products')
      .select('store_id, stores!inner(user_id)')
      .eq('id', id)
      .single();

    const productStore = Array.isArray(productCheck?.stores) 
      ? productCheck?.stores[0] 
      : productCheck?.stores;

    if (!productCheck || productStore?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
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
      isActive,
    } = body;

    // Update the product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        title,
        description,
        price,
        compare_at_price: compareAtPrice,
        stock,
        image_url: imageUrl,
        images,
        category_id: categoryId,
        tags,
        is_featured: isFeatured,
        is_active: isActive ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating product:', updateError);
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      product: updatedProduct,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Product PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product (store owner only)
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

    // Check if user owns the product's store
    const { data: productCheck } = await supabase
      .from('products')
      .select('store_id, stores!inner(user_id)')
      .eq('id', id)
      .single();

    const productStore = Array.isArray(productCheck?.stores) 
      ? productCheck?.stores[0] 
      : productCheck?.stores;

    if (!productCheck || productStore?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Soft delete by setting is_active to false
    const { error: deleteError } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


