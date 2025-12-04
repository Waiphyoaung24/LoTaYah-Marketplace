/**
 * Store Setup Validation
 * Can be used on both client and server
 */

export interface StoreSetupFormData {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  governmentIdUrl?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate store setup form data
 */
export function validateStoreSetup(data: StoreSetupFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Store Name validation
  if (!data.storeName?.trim()) {
    errors.push({ field: 'storeName', message: 'Store name is required' });
  } else if (data.storeName.trim().length < 3) {
    errors.push({ field: 'storeName', message: 'Store name must be at least 3 characters' });
  } else if (data.storeName.trim().length > 100) {
    errors.push({ field: 'storeName', message: 'Store name must be less than 100 characters' });
  }

  // Store Description validation
  if (!data.storeDescription?.trim()) {
    errors.push({ field: 'storeDescription', message: 'Store description is required' });
  } else if (data.storeDescription.trim().length < 20) {
    errors.push({ field: 'storeDescription', message: 'Store description must be at least 20 characters' });
  } else if (data.storeDescription.trim().length > 500) {
    errors.push({ field: 'storeDescription', message: 'Store description must be less than 500 characters' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.contactEmail?.trim()) {
    errors.push({ field: 'contactEmail', message: 'Contact email is required' });
  } else if (!emailRegex.test(data.contactEmail.trim())) {
    errors.push({ field: 'contactEmail', message: 'Please enter a valid email address' });
  }

  // Phone validation
  const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
  if (!data.contactPhone?.trim()) {
    errors.push({ field: 'contactPhone', message: 'Contact phone is required' });
  } else if (!phoneRegex.test(data.contactPhone.trim())) {
    errors.push({ field: 'contactPhone', message: 'Please enter a valid phone number' });
  }

  // Address validation
  if (!data.address?.trim()) {
    errors.push({ field: 'address', message: 'Address is required' });
  } else if (data.address.trim().length < 5) {
    errors.push({ field: 'address', message: 'Please enter a valid address' });
  }

  // City validation
  if (!data.city?.trim()) {
    errors.push({ field: 'city', message: 'City is required' });
  }

  // State validation
  if (!data.state?.trim()) {
    errors.push({ field: 'state', message: 'State/Region is required' });
  }

  // Postal Code validation
  if (!data.postalCode?.trim()) {
    errors.push({ field: 'postalCode', message: 'Postal code is required' });
  }

  // Country validation
  const validCountries = ['Myanmar', 'Thailand', 'UK'];
  if (!data.country?.trim()) {
    errors.push({ field: 'country', message: 'Country is required' });
  } else if (!validCountries.includes(data.country)) {
    errors.push({ field: 'country', message: 'Please select a valid country' });
  }

  return errors;
}

