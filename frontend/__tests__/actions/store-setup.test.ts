import { validateStoreSetup, StoreSetupFormData } from '@/src/lib/store-validation';

describe('Store Setup Validation', () => {
  const validFormData: StoreSetupFormData = {
    storeName: 'My Test Store',
    storeDescription: 'This is a test store with a description that is at least 20 characters.',
    contactEmail: 'test@example.com',
    contactPhone: '+95 9123456789',
    address: '123 Main Street, Building A',
    city: 'Yangon',
    state: 'Yangon Region',
    postalCode: '11181',
    country: 'Myanmar',
  };

  describe('Store Name Validation', () => {
    it('should fail when store name is empty', () => {
      const data = { ...validFormData, storeName: '' };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'storeName', message: 'Store name is required' });
    });

    it('should fail when store name is too short', () => {
      const data = { ...validFormData, storeName: 'AB' };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'storeName', message: 'Store name must be at least 3 characters' });
    });

    it('should fail when store name is too long', () => {
      const data = { ...validFormData, storeName: 'A'.repeat(101) };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'storeName', message: 'Store name must be less than 100 characters' });
    });

    it('should pass with valid store name', () => {
      const data = { ...validFormData, storeName: 'Valid Store Name' };
      const errors = validateStoreSetup(data);
      expect(errors.filter(e => e.field === 'storeName')).toHaveLength(0);
    });
  });

  describe('Store Description Validation', () => {
    it('should fail when description is empty', () => {
      const data = { ...validFormData, storeDescription: '' };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'storeDescription', message: 'Store description is required' });
    });

    it('should fail when description is too short', () => {
      const data = { ...validFormData, storeDescription: 'Too short' };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'storeDescription', message: 'Store description must be at least 20 characters' });
    });

    it('should fail when description is too long', () => {
      const data = { ...validFormData, storeDescription: 'A'.repeat(501) };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'storeDescription', message: 'Store description must be less than 500 characters' });
    });

    it('should pass with valid description', () => {
      const data = { ...validFormData };
      const errors = validateStoreSetup(data);
      expect(errors.filter(e => e.field === 'storeDescription')).toHaveLength(0);
    });
  });

  describe('Email Validation', () => {
    it('should fail when email is empty', () => {
      const data = { ...validFormData, contactEmail: '' };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'contactEmail', message: 'Contact email is required' });
    });

    it('should fail with invalid email format', () => {
      const invalidEmails = ['notanemail', 'missing@domain', '@nodomain.com', 'spaces in@email.com'];
      
      invalidEmails.forEach(email => {
        const data = { ...validFormData, contactEmail: email };
        const errors = validateStoreSetup(data);
        expect(errors).toContainEqual({ field: 'contactEmail', message: 'Please enter a valid email address' });
      });
    });

    it('should pass with valid email', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'email+tag@gmail.com'];
      
      validEmails.forEach(email => {
        const data = { ...validFormData, contactEmail: email };
        const errors = validateStoreSetup(data);
        expect(errors.filter(e => e.field === 'contactEmail')).toHaveLength(0);
      });
    });
  });

  describe('Phone Validation', () => {
    it('should fail when phone is empty', () => {
      const data = { ...validFormData, contactPhone: '' };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'contactPhone', message: 'Contact phone is required' });
    });

    it('should fail with invalid phone format', () => {
      const invalidPhones = ['abc', '12', 'phone number here'];
      
      invalidPhones.forEach(phone => {
        const data = { ...validFormData, contactPhone: phone };
        const errors = validateStoreSetup(data);
        expect(errors).toContainEqual({ field: 'contactPhone', message: 'Please enter a valid phone number' });
      });
    });

    it('should pass with valid phone numbers', () => {
      const validPhones = ['+95 9123456789', '09123456789', '+44 20 7946 0958', '(123) 456-7890'];
      
      validPhones.forEach(phone => {
        const data = { ...validFormData, contactPhone: phone };
        const errors = validateStoreSetup(data);
        expect(errors.filter(e => e.field === 'contactPhone')).toHaveLength(0);
      });
    });
  });

  describe('Address Validation', () => {
    it('should fail when address is empty', () => {
      const data = { ...validFormData, address: '' };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'address', message: 'Address is required' });
    });

    it('should fail when address is too short', () => {
      const data = { ...validFormData, address: '123' };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'address', message: 'Please enter a valid address' });
    });

    it('should pass with valid address', () => {
      const data = { ...validFormData };
      const errors = validateStoreSetup(data);
      expect(errors.filter(e => e.field === 'address')).toHaveLength(0);
    });
  });

  describe('City Validation', () => {
    it('should fail when city is empty', () => {
      const data = { ...validFormData, city: '' };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'city', message: 'City is required' });
    });

    it('should pass with valid city', () => {
      const data = { ...validFormData };
      const errors = validateStoreSetup(data);
      expect(errors.filter(e => e.field === 'city')).toHaveLength(0);
    });
  });

  describe('State Validation', () => {
    it('should fail when state is empty', () => {
      const data = { ...validFormData, state: '' };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'state', message: 'State/Region is required' });
    });

    it('should pass with valid state', () => {
      const data = { ...validFormData };
      const errors = validateStoreSetup(data);
      expect(errors.filter(e => e.field === 'state')).toHaveLength(0);
    });
  });

  describe('Postal Code Validation', () => {
    it('should fail when postal code is empty', () => {
      const data = { ...validFormData, postalCode: '' };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'postalCode', message: 'Postal code is required' });
    });

    it('should pass with valid postal code', () => {
      const data = { ...validFormData };
      const errors = validateStoreSetup(data);
      expect(errors.filter(e => e.field === 'postalCode')).toHaveLength(0);
    });
  });

  describe('Country Validation', () => {
    it('should fail when country is empty', () => {
      const data = { ...validFormData, country: '' };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'country', message: 'Country is required' });
    });

    it('should fail with invalid country', () => {
      const data = { ...validFormData, country: 'InvalidCountry' };
      const errors = validateStoreSetup(data);
      expect(errors).toContainEqual({ field: 'country', message: 'Please select a valid country' });
    });

    it('should pass with valid countries', () => {
      const validCountries = ['Myanmar', 'Thailand', 'UK'];
      
      validCountries.forEach(country => {
        const data = { ...validFormData, country };
        const errors = validateStoreSetup(data);
        expect(errors.filter(e => e.field === 'country')).toHaveLength(0);
      });
    });
  });

  describe('Full Form Validation', () => {
    it('should pass with all valid data', () => {
      const errors = validateStoreSetup(validFormData);
      expect(errors).toHaveLength(0);
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const data: StoreSetupFormData = {
        storeName: '',
        storeDescription: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      };
      
      const errors = validateStoreSetup(data);
      expect(errors.length).toBeGreaterThan(1);
      expect(errors.map(e => e.field)).toContain('storeName');
      expect(errors.map(e => e.field)).toContain('storeDescription');
      expect(errors.map(e => e.field)).toContain('contactEmail');
      expect(errors.map(e => e.field)).toContain('contactPhone');
      expect(errors.map(e => e.field)).toContain('address');
      expect(errors.map(e => e.field)).toContain('city');
      expect(errors.map(e => e.field)).toContain('state');
      expect(errors.map(e => e.field)).toContain('postalCode');
      expect(errors.map(e => e.field)).toContain('country');
    });

    it('should trim whitespace from inputs', () => {
      const data: StoreSetupFormData = {
        ...validFormData,
        storeName: '  Valid Store  ',
        city: '  Yangon  ',
      };
      
      const errors = validateStoreSetup(data);
      expect(errors).toHaveLength(0);
    });
  });
});

describe('Store Setup Form Data Types', () => {
  it('should have correct interface structure', () => {
    const formData: StoreSetupFormData = {
      storeName: 'Test',
      storeDescription: 'Test description that is long enough',
      contactEmail: 'test@test.com',
      contactPhone: '1234567890',
      address: '123 Street',
      city: 'City',
      state: 'State',
      postalCode: '12345',
      country: 'Myanmar',
      governmentIdUrl: 'https://example.com/id.jpg',
    };
    
    expect(formData).toHaveProperty('storeName');
    expect(formData).toHaveProperty('storeDescription');
    expect(formData).toHaveProperty('contactEmail');
    expect(formData).toHaveProperty('contactPhone');
    expect(formData).toHaveProperty('address');
    expect(formData).toHaveProperty('city');
    expect(formData).toHaveProperty('state');
    expect(formData).toHaveProperty('postalCode');
    expect(formData).toHaveProperty('country');
    expect(formData).toHaveProperty('governmentIdUrl');
  });
});

