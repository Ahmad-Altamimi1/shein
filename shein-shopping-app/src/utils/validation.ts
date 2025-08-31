// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Phone validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.trim());
};

// Zip code validation (US format)
export const isValidZipCode = (zipCode: string): boolean => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode.trim());
};

// Product code validation
export const isValidProductCode = (code: string): boolean => {
  const codeRegex = /^[A-Z0-9]{3,20}$/;
  return codeRegex.test(code.toUpperCase().trim());
};

// Name validation
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

// Address validation
export const isValidAddress = (address: string): boolean => {
  return address.trim().length >= 5 && address.trim().length <= 100;
};

// City validation
export const isValidCity = (city: string): boolean => {
  return city.trim().length >= 2 && city.trim().length <= 50;
};

// State validation (US states)
export const isValidState = (state: string): boolean => {
  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];
  return usStates.includes(state.toUpperCase().trim());
};

// Password strength validation
export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  isValid: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  return {
    score,
    feedback,
    isValid: score >= 4 && password.length >= 8,
  };
};

// Credit card validation (basic Luhn algorithm)
export const isValidCreditCard = (cardNumber: string): boolean => {
  const number = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(number)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// CVV validation
export const isValidCVV = (cvv: string, cardType?: string): boolean => {
  const cvvRegex = cardType === 'amex' ? /^\d{4}$/ : /^\d{3}$/;
  return cvvRegex.test(cvv.trim());
};

// Expiry date validation
export const isValidExpiryDate = (month: string, year: string): boolean => {
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (monthNum < 1 || monthNum > 12) {
    return false;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
    return false;
  }

  return true;
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Validate form data
export const validateFormData = (data: Record<string, any>, rules: Record<string, any>): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];

    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = rule.message || `${field} is required`;
      return;
    }

    if (value && rule.validator && !rule.validator(value)) {
      errors[field] = rule.message || `${field} is invalid`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};