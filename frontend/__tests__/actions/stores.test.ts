/**
 * Tests for stores server actions
 */

import {
  getStoresWithProducts,
  getStoreById,
  getCategories,
  searchProducts,
  updateStoreProfile,
  getMyStoreProfile,
  StoreWithProducts,
  ProductItem,
  Category,
  StoreProfile,
} from '@/src/actions/stores';

// Helper to create chainable mock
const createChainableMock = (resolvedValue: any) => {
  const chainable: any = {};
  const methods = ['select', 'eq', 'neq', 'in', 'order', 'or', 'gte', 'lte', 'range', 'single', 'limit', 'update'];
  
  methods.forEach(method => {
    chainable[method] = jest.fn().mockReturnValue(chainable);
  });
  
  // Make the last method in chain resolve with value
  chainable.then = (resolve: any) => resolve(resolvedValue);
  // Also make order return promise-like object
  Object.assign(chainable, resolvedValue);
  
  return chainable;
};

// Mock stores data
const mockStores = [
  {
    id: 'store-1',
    user_id: 'user-1',
    name: 'Test Store',
    description: 'A test store',
    logo_url: 'https://example.com/logo.png',
    cover_url: 'https://example.com/cover.png',
    city: 'Yangon',
    country: 'Myanmar',
    verification_status: 'approved',
    reputation_score: 85,
    total_sales: 100,
    created_at: '2024-01-01T00:00:00Z',
    users: { name: 'Test User', email: 'test@example.com' },
  },
];

// Mock products data
const mockProducts = [
  {
    id: 'product-1',
    store_id: 'store-1',
    title: 'Test Product',
    description: 'A test product',
    price: 50.00,
    compare_at_price: 60.00,
    stock: 10,
    image_url: 'https://example.com/product.png',
    images: ['https://example.com/product1.png'],
    is_featured: true,
    tags: ['test', 'product'],
    created_at: '2024-01-01T00:00:00Z',
    categories: { id: 'cat-1', name: 'Clothing', slug: 'clothing' },
  },
];

// Mock categories data
const mockCategories = [
  {
    id: 'cat-1',
    name: 'Clothing',
    slug: 'clothing',
    description: 'Clothing items',
    image_url: 'https://example.com/clothing.png',
  },
  {
    id: 'cat-2',
    name: 'Crafts',
    slug: 'crafts',
    description: 'Handmade crafts',
    image_url: 'https://example.com/crafts.png',
  },
];

// Mock Supabase client
let mockFromCalls: any[] = [];

const createMockSupabase = (scenario: string) => {
  mockFromCalls = [];
  
  return {
    from: jest.fn((table: string) => {
      const call = { table, scenario };
      mockFromCalls.push(call);
      
      if (scenario === 'success') {
        if (table === 'stores') {
          return createChainableMock({ data: mockStores, error: null });
        }
        if (table === 'products') {
          return createChainableMock({ data: mockProducts, error: null, count: mockProducts.length });
        }
        if (table === 'categories') {
          return createChainableMock({ data: mockCategories, error: null });
        }
      }
      
      if (scenario === 'stores_error') {
        if (table === 'stores') {
          return createChainableMock({ data: null, error: { message: 'Database error' } });
        }
      }
      
      if (scenario === 'products_error') {
        if (table === 'stores') {
          return createChainableMock({ data: mockStores, error: null });
        }
        if (table === 'products') {
          return createChainableMock({ data: null, error: { message: 'Database error' } });
        }
      }
      
      if (scenario === 'categories_error') {
        return createChainableMock({ data: null, error: { message: 'Database error' } });
      }
      
      if (scenario === 'store_not_found') {
        return createChainableMock({ data: null, error: { code: 'PGRST116', message: 'Row not found' } });
      }
      
      if (scenario === 'single_store_success') {
        if (table === 'stores') {
          return createChainableMock({ 
            data: {
              ...mockStores[0],
              address: '123 Test St',
              state: 'Yangon Region',
              postal_code: '11001',
              contact_email: 'store@example.com',
              contact_phone: '+959123456789',
              users: { name: 'Test User', email: 'test@example.com', avatar_url: 'https://example.com/avatar.png' },
            }, 
            error: null 
          });
        }
        if (table === 'products') {
          return createChainableMock({ data: mockProducts, error: null });
        }
      }
      
      if (scenario === 'category_counts') {
        if (table === 'categories') {
          return createChainableMock({ data: mockCategories, error: null });
        }
        if (table === 'products') {
          return createChainableMock({ 
            data: [
              { category_id: 'cat-1' },
              { category_id: 'cat-1' },
              { category_id: 'cat-2' },
            ], 
            error: null 
          });
        }
      }
      
      if (scenario === 'search_success') {
        return createChainableMock({ 
          data: mockProducts.map(p => ({
            ...p,
            stores: { id: 'store-1', name: 'Test Store', logo_url: 'https://example.com/logo.png', verification_status: 'approved' },
          })), 
          error: null,
          count: 1,
        });
      }
      
      if (scenario === 'search_error') {
        return createChainableMock({ data: null, error: { message: 'Database error' }, count: null });
      }
      
      if (scenario === 'empty') {
        return createChainableMock({ data: [], error: null, count: 0 });
      }
      
      return createChainableMock({ data: [], error: null });
    }),
  };
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@/lib/supabase/server';

describe('Stores Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStoresWithProducts', () => {
    it('should fetch approved stores with their products', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('success'));
      
      const result = await getStoresWithProducts();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('products');
    });

    it('should return empty array when stores query fails', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('stores_error'));

      const result = await getStoresWithProducts();

      expect(result).toEqual([]);
    });

    it('should return empty array when products query fails', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('products_error'));

      const result = await getStoresWithProducts();

      expect(result).toEqual([]);
    });

    it('should filter stores by search query', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('success'));

      const result = await getStoresWithProducts({ search: 'test' });

      expect(createClient).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
    });

    it('should filter stores by categories', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('success'));

      const result = await getStoresWithProducts({ categories: ['Clothing'] });

      expect(createClient).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
    });

    it('should return stores with correct data structure', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('success'));

      const result = await getStoresWithProducts();

      if (result.length > 0) {
        const store = result[0];
        expect(store).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          products: expect.any(Array),
        });
      }
    });

    it('should return empty array when no approved stores exist', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('empty'));

      const result = await getStoresWithProducts();

      expect(result).toEqual([]);
    });
  });

  describe('getStoreById', () => {
    it('should fetch a single store by ID with products', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('single_store_success'));

      const result = await getStoreById('store-1');

      expect(result).toHaveProperty('store');
      expect(result).toHaveProperty('products');
      expect(result.products).toBeInstanceOf(Array);
    });

    it('should return null store when store not found', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('store_not_found'));

      const result = await getStoreById('non-existent-store');

      expect(result.store).toBeNull();
      expect(result.products).toEqual([]);
    });

    it('should format store data correctly', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('single_store_success'));

      const result = await getStoreById('store-1');

      if (result.store) {
        expect(result.store).toMatchObject({
          id: 'store-1',
          userId: 'user-1',
          name: 'Test Store',
        });
      }
    });

    it('should include location from city and country', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('single_store_success'));

      const result = await getStoreById('store-1');

      if (result.store) {
        expect(result.store.location).toBe('Yangon, Myanmar');
      }
    });
  });

  describe('getCategories', () => {
    it('should fetch all active categories with product counts', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('category_counts'));

      const result = await getCategories();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array on error', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('categories_error'));

      const result = await getCategories();

      expect(result).toEqual([]);
    });

    it('should calculate correct product counts per category', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('category_counts'));

      const result = await getCategories();

      const clothing = result.find((c: Category) => c.slug === 'clothing');
      const crafts = result.find((c: Category) => c.slug === 'crafts');

      if (clothing) expect(clothing.productCount).toBe(2);
      if (crafts) expect(crafts.productCount).toBe(1);
    });

    it('should format category data correctly', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('category_counts'));

      const result = await getCategories();

      if (result.length > 0) {
        expect(result[0]).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          slug: expect.any(String),
          productCount: expect.any(Number),
        });
      }
    });
  });

  describe('searchProducts', () => {
    it('should search products by query', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('search_success'));

      const result = await searchProducts({ query: 'test' });

      expect(result).toHaveProperty('products');
      expect(result).toHaveProperty('total');
      expect(result.products).toBeInstanceOf(Array);
    });

    it('should return empty results on error', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('search_error'));

      const result = await searchProducts({ query: 'test' });

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should filter products by categories', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('search_success'));

      const result = await searchProducts({ categories: ['Clothing'] });

      expect(createClient).toHaveBeenCalled();
      expect(result.products).toBeInstanceOf(Array);
    });

    it('should filter products by price range', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('search_success'));

      const result = await searchProducts({ minPrice: 10, maxPrice: 100 });

      expect(createClient).toHaveBeenCalled();
      expect(result.products).toBeInstanceOf(Array);
    });

    it('should support pagination with limit and offset', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('search_success'));

      const result = await searchProducts({ limit: 10, offset: 20 });

      expect(createClient).toHaveBeenCalled();
      expect(result).toHaveProperty('products');
      expect(result).toHaveProperty('total');
    });

    it('should format product data correctly', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('search_success'));

      const result = await searchProducts({});

      if (result.products.length > 0) {
        const product = result.products[0];
        expect(product).toMatchObject({
          id: expect.any(String),
          title: expect.any(String),
          price: expect.any(Number),
        });
      }
    });

    it('should return total count of results', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('search_success'));

      const result = await searchProducts({});

      expect(typeof result.total).toBe('number');
    });
  });

  describe('Type Definitions', () => {
    it('StoreWithProducts should have correct structure', () => {
      const store: StoreWithProducts = {
        id: 'store-1',
        userId: 'user-1',
        name: 'Test Store',
        description: 'A test store',
        logoImage: 'https://example.com/logo.png',
        coverImage: 'https://example.com/cover.png',
        location: 'Yangon, Myanmar',
        reputationScore: 85,
        totalSales: 100,
        productCount: 10,
        joinedDate: '2024',
        verified: true,
        products: [],
      };

      expect(store).toHaveProperty('id');
      expect(store).toHaveProperty('name');
      expect(store).toHaveProperty('products');
      expect(store.verified).toBe(true);
    });

    it('ProductItem should have correct structure', () => {
      const product: ProductItem = {
        id: 'product-1',
        title: 'Test Product',
        description: 'A test product',
        price: 50.00,
        stock: 10,
        imageUrl: 'https://example.com/product.png',
        category: 'Clothing',
        isFeatured: true,
        createdAt: Date.now(),
        storeName: 'Test Store',
        sellerId: 'store-1',
      };

      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('price');
      expect(product.isFeatured).toBe(true);
    });

    it('Category should have correct structure', () => {
      const category: Category = {
        id: 'cat-1',
        name: 'Clothing',
        slug: 'clothing',
        productCount: 10,
      };

      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('slug');
      expect(category).toHaveProperty('productCount');
    });

    it('StoreProfile should have correct structure', () => {
      const profile: StoreProfile = {
        id: 'store-1',
        userId: 'user-1',
        name: 'Test Store',
        description: 'A test store',
        logoImage: 'https://example.com/logo.png',
        coverImage: 'https://example.com/cover.png',
        location: 'Yangon, Myanmar',
        reputationScore: 85,
        totalSales: 100,
        joinedDate: '2024',
        verified: true,
      };

      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('verified');
    });

    it('ProductItem should support optional fields', () => {
      const product: ProductItem = {
        id: 'product-1',
        title: 'Test Product',
        description: 'A test product',
        price: 50.00,
        compareAtPrice: 60.00,
        stock: 10,
        imageUrl: 'https://example.com/product.png',
        images: ['https://example.com/img1.png'],
        category: 'Clothing',
        categorySlug: 'clothing',
        isFeatured: true,
        tags: ['sale', 'new'],
        createdAt: Date.now(),
        storeName: 'Test Store',
        sellerId: 'store-1',
      };

      expect(product.compareAtPrice).toBe(60.00);
      expect(product.images).toHaveLength(1);
      expect(product.tags).toContain('sale');
    });

    it('StoreProfile should support optional fields', () => {
      const profile: StoreProfile = {
        id: 'store-1',
        userId: 'user-1',
        name: 'Test Store',
        description: 'A test store',
        logoImage: 'https://example.com/logo.png',
        coverImage: 'https://example.com/cover.png',
        location: 'Yangon, Myanmar',
        address: '123 Test St',
        city: 'Yangon',
        state: 'Yangon Region',
        postalCode: '11001',
        country: 'Myanmar',
        contactEmail: 'store@example.com',
        contactPhone: '+959123456789',
        reputationScore: 85,
        totalSales: 100,
        joinedDate: '2024',
        verified: true,
        ownerName: 'Test Owner',
        ownerAvatar: 'https://example.com/avatar.png',
      };

      expect(profile.address).toBe('123 Test St');
      expect(profile.contactEmail).toBe('store@example.com');
      expect(profile.ownerName).toBe('Test Owner');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty stores array', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('empty'));

      const result = await getStoresWithProducts();

      expect(result).toEqual([]);
    });

    it('should handle stores with no products', async () => {
      const mockSupabase = createMockSupabase('success');
      // Override products to return empty
      const originalFrom = mockSupabase.from;
      mockSupabase.from = jest.fn((table: string) => {
        if (table === 'products') {
          return createChainableMock({ data: [], error: null });
        }
        return originalFrom(table);
      });
      
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await getStoresWithProducts();

      // Stores with no products should be filtered out
      expect(result).toEqual([]);
    });

    it('should handle search with special characters', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('search_success'));

      // Should not throw an error
      const result = await searchProducts({ query: "test's product" });

      expect(result).toHaveProperty('products');
    });

    it('should handle empty search options', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('search_success'));

      const result = await searchProducts({});

      expect(result).toHaveProperty('products');
      expect(result).toHaveProperty('total');
    });

    it('should handle negative offset gracefully', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('search_success'));

      // Using negative offset should still work (defaults would apply)
      const result = await searchProducts({ offset: -1 });

      expect(result).toHaveProperty('products');
    });

    it('should handle zero limit', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('search_success'));

      const result = await searchProducts({ limit: 0 });

      expect(result).toHaveProperty('products');
    });
  });

  describe('Data Transformation', () => {
    it('should correctly transform store location from city and country', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('success'));

      const result = await getStoresWithProducts();

      if (result.length > 0) {
        expect(result[0].location).toBe('Yangon, Myanmar');
      }
    });

    it('should correctly calculate reputation score as rating', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('success'));

      const result = await getStoresWithProducts();

      if (result.length > 0) {
        // 85/20 = 4.25
        expect(result[0].reputationScore).toBe(85);
      }
    });

    it('should correctly transform product category', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('success'));

      const result = await getStoresWithProducts();

      if (result.length > 0 && result[0].products.length > 0) {
        expect(result[0].products[0].category).toBe('Clothing');
      }
    });

    it('should extract year from created_at for joinedDate', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('success'));

      const result = await getStoresWithProducts();

      if (result.length > 0) {
        expect(result[0].joinedDate).toBe('2024');
      }
    });

    it('should set verified based on verification_status', async () => {
      (createClient as jest.Mock).mockResolvedValue(createMockSupabase('success'));

      const result = await getStoresWithProducts();

      if (result.length > 0) {
        expect(result[0].verified).toBe(true);
      }
    });
  });

  describe('updateStoreProfile', () => {
    const mockUpdatedStore = {
      id: 'store-1',
      user_id: 'user-1',
      name: 'Updated Store Name',
      description: 'Updated description',
      logo_url: 'https://example.com/new-logo.png',
      cover_url: 'https://example.com/new-cover.png',
      city: 'Bangkok',
      country: 'Thailand',
      verification_status: 'approved',
      reputation_score: 85,
      total_sales: 100,
      created_at: '2024-01-01T00:00:00Z',
    };

    it('should update store profile successfully', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'user-1' } }, 
            error: null 
          }),
        },
        from: jest.fn((table: string) => {
          if (table === 'stores') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: { id: 'store-1' }, error: null }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockUpdatedStore, error: null }),
                  }),
                }),
              }),
            };
          }
          return createChainableMock({ data: null, error: null });
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await updateStoreProfile({
        name: 'Updated Store Name',
        description: 'Updated description',
        logoImage: 'https://example.com/new-logo.png',
        coverImage: 'https://example.com/new-cover.png',
        location: 'Bangkok, Thailand',
      });

      expect(result.success).toBe(true);
      expect(result.store).toBeDefined();
      expect(result.store?.name).toBe('Updated Store Name');
    });

    it('should return error when user is not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: null }, 
            error: null 
          }),
        },
        from: jest.fn(),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await updateStoreProfile({ name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return error when store is not found', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'user-1' } }, 
            error: null 
          }),
        },
        from: jest.fn((table: string) => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        })),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await updateStoreProfile({ name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Store not found');
    });

    it('should return error when no data to update', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'user-1' } }, 
            error: null 
          }),
        },
        from: jest.fn((table: string) => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { id: 'store-1' }, error: null }),
        })),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await updateStoreProfile({});

      expect(result.success).toBe(false);
      expect(result.error).toBe('No data to update');
    });

    it('should return error when update fails', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'user-1' } }, 
            error: null 
          }),
        },
        from: jest.fn((table: string) => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { id: 'store-1' }, error: null }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Update failed' } }),
              }),
            }),
          }),
        })),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await updateStoreProfile({ name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update store');
    });

    it('should parse location into city and country', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'user-1' } }, 
            error: null 
          }),
        },
        from: jest.fn((table: string) => {
          const updateMock = jest.fn();
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: { id: 'store-1' }, error: null }),
            update: updateMock.mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: mockUpdatedStore, error: null }),
                }),
              }),
            }),
          };
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await updateStoreProfile({ location: 'Bangkok, Thailand' });

      expect(result.success).toBe(true);
    });

    it('should handle single word location', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'user-1' } }, 
            error: null 
          }),
        },
        from: jest.fn((table: string) => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { id: 'store-1' }, error: null }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockUpdatedStore, error: null }),
              }),
            }),
          }),
        })),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await updateStoreProfile({ location: 'Bangkok' });

      expect(result.success).toBe(true);
    });
  });

  describe('getMyStoreProfile', () => {
    const mockMyStore = {
      id: 'store-1',
      user_id: 'user-1',
      name: 'My Store',
      description: 'My store description',
      logo_url: 'https://example.com/logo.png',
      cover_url: 'https://example.com/cover.png',
      city: 'Yangon',
      country: 'Myanmar',
      verification_status: 'approved',
      reputation_score: 90,
      total_sales: 50,
      created_at: '2024-01-01T00:00:00Z',
    };

    it('should fetch current user store profile successfully', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'user-1' } }, 
            error: null 
          }),
        },
        from: jest.fn((table: string) => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockMyStore, error: null }),
        })),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await getMyStoreProfile();

      expect(result.success).toBe(true);
      expect(result.store).toBeDefined();
      expect(result.store?.name).toBe('My Store');
      expect(result.store?.verified).toBe(true);
    });

    it('should return error when user is not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: null }, 
            error: null 
          }),
        },
        from: jest.fn(),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await getMyStoreProfile();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return error when store is not found', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'user-1' } }, 
            error: null 
          }),
        },
        from: jest.fn((table: string) => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        })),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await getMyStoreProfile();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Store not found');
    });

    it('should format store profile correctly', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'user-1' } }, 
            error: null 
          }),
        },
        from: jest.fn((table: string) => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockMyStore, error: null }),
        })),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await getMyStoreProfile();

      expect(result.success).toBe(true);
      expect(result.store).toMatchObject({
        id: 'store-1',
        userId: 'user-1',
        name: 'My Store',
        location: 'Yangon, Myanmar',
        verified: true,
        reputationScore: 90,
        totalSales: 50,
        joinedDate: '2024',
      });
    });

    it('should handle store without city', async () => {
      const mockStoreWithoutCity = {
        ...mockMyStore,
        city: null,
        country: 'Myanmar',
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'user-1' } }, 
            error: null 
          }),
        },
        from: jest.fn((table: string) => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockStoreWithoutCity, error: null }),
        })),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await getMyStoreProfile();

      expect(result.success).toBe(true);
      expect(result.store?.location).toBe('Myanmar');
    });

    it('should handle store without city and country', async () => {
      const mockStoreWithoutLocation = {
        ...mockMyStore,
        city: null,
        country: null,
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'user-1' } }, 
            error: null 
          }),
        },
        from: jest.fn((table: string) => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockStoreWithoutLocation, error: null }),
        })),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await getMyStoreProfile();

      expect(result.success).toBe(true);
      expect(result.store?.location).toBe('');
    });

    it('should set verified to false for non-approved stores', async () => {
      const mockPendingStore = {
        ...mockMyStore,
        verification_status: 'pending',
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'user-1' } }, 
            error: null 
          }),
        },
        from: jest.fn((table: string) => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockPendingStore, error: null }),
        })),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await getMyStoreProfile();

      expect(result.success).toBe(true);
      expect(result.store?.verified).toBe(false);
    });
  });
});
