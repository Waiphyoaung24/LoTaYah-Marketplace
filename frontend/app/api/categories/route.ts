import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List all categories
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        description,
        image_url,
        is_active
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
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

    const formattedCategories = categories?.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.image_url,
      productCount: countsMap[cat.id] || 0,
    })) || [];

    return NextResponse.json({
      categories: formattedCategories,
    });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


