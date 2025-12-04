/**
 * Product Validation
 * Can be used on both client and server
 */

export interface ProductFormData {
  title: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  stock?: number;
  imageUrl?: string;
  images?: string[];
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate product form data
 */
export function validateProduct(data: ProductFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Title validation (required, 3-200 characters)
  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Product title is required' });
  } else if (data.title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Product title must be at least 3 characters' });
  } else if (data.title.trim().length > 200) {
    errors.push({ field: 'title', message: 'Product title must be less than 200 characters' });
  }

  // Price validation (required, >= 0)
  if (data.price === undefined || data.price === null) {
    errors.push({ field: 'price', message: 'Price is required' });
  } else if (isNaN(data.price)) {
    errors.push({ field: 'price', message: 'Price must be a valid number' });
  } else if (data.price < 0) {
    errors.push({ field: 'price', message: 'Price cannot be negative' });
  } else if (data.price > 999999999) {
    errors.push({ field: 'price', message: 'Price exceeds maximum allowed value' });
  }

  // Compare at price validation (optional, but must be >= price if provided)
  if (data.compareAtPrice !== undefined && data.compareAtPrice !== null) {
    if (isNaN(data.compareAtPrice)) {
      errors.push({ field: 'compareAtPrice', message: 'Compare at price must be a valid number' });
    } else if (data.compareAtPrice < 0) {
      errors.push({ field: 'compareAtPrice', message: 'Compare at price cannot be negative' });
    } else if (data.compareAtPrice < data.price) {
      errors.push({ field: 'compareAtPrice', message: 'Compare at price should be greater than or equal to price' });
    }
  }

  // Stock validation (optional, must be >= 0)
  if (data.stock !== undefined && data.stock !== null) {
    if (!Number.isInteger(data.stock)) {
      errors.push({ field: 'stock', message: 'Stock must be a whole number' });
    } else if (data.stock < 0) {
      errors.push({ field: 'stock', message: 'Stock cannot be negative' });
    }
  }

  // Description validation (optional, max 5000 characters)
  if (data.description && data.description.length > 5000) {
    errors.push({ field: 'description', message: 'Description must be less than 5000 characters' });
  }

  // Image URL validation (optional, must be valid URL if provided)
  if (data.imageUrl && data.imageUrl.trim()) {
    const urlPattern = /^(https?:\/\/|data:image\/)/i;
    if (!urlPattern.test(data.imageUrl.trim())) {
      errors.push({ field: 'imageUrl', message: 'Please enter a valid image URL' });
    }
  }

  // Images array validation
  if (data.images && data.images.length > 10) {
    errors.push({ field: 'images', message: 'Maximum 10 images allowed' });
  }

  // Tags validation
  if (data.tags && data.tags.length > 20) {
    errors.push({ field: 'tags', message: 'Maximum 20 tags allowed' });
  }

  return errors;
}

