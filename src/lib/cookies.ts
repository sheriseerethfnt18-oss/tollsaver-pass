// Cookie utilities for storing checkout data across pages

export interface Vehicle {
  registration: string;
  make: string;
  model: string;
  color: string;
  engineCapacity?: string;
}

export interface Duration {
  days: number;
  label: string;
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  description?: string;
  popular?: boolean;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
}

const COOKIE_NAMES = {
  VEHICLE: 'travelpass_vehicle',
  DURATION: 'travelpass_duration',
  CUSTOMER: 'travelpass_customer'
} as const;

// Cookie expiration: 1 hour from now
const getCookieExpiry = (): string => {
  const date = new Date();
  date.setTime(date.getTime() + (60 * 60 * 1000)); // 1 hour
  return date.toUTCString();
};

// Generic cookie functions
const setCookie = (name: string, value: string, expires?: string): void => {
  try {
    const expiry = expires || getCookieExpiry();
    // More permissive cookie settings to work across different scenarios
    document.cookie = `${name}=${value}; expires=${expiry}; path=/; SameSite=Lax`;
    
    // Verify the cookie was set
    const verification = getCookie(name);
    if (!verification) {
      console.warn(`Failed to set cookie: ${name}`);
      // Try setting without SameSite as fallback
      document.cookie = `${name}=${value}; expires=${expiry}; path=/`;
    }
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Vehicle data functions
export const saveVehicleData = (vehicle: Vehicle): void => {
  try {
    const vehicleJson = JSON.stringify(vehicle);
    setCookie(COOKIE_NAMES.VEHICLE, encodeURIComponent(vehicleJson));
  } catch (error) {
    console.error('Error saving vehicle data to cookies:', error);
  }
};

export const getVehicleData = (): Vehicle | null => {
  try {
    const vehicleData = getCookie(COOKIE_NAMES.VEHICLE);
    if (vehicleData) {
      return JSON.parse(decodeURIComponent(vehicleData));
    }
  } catch (error) {
    console.error('Error reading vehicle data from cookies:', error);
  }
  return null;
};

export const clearVehicleData = (): void => {
  deleteCookie(COOKIE_NAMES.VEHICLE);
};

// Duration data functions
export const saveDurationData = (duration: Duration): void => {
  try {
    const durationJson = JSON.stringify(duration);
    setCookie(COOKIE_NAMES.DURATION, encodeURIComponent(durationJson));
  } catch (error) {
    console.error('Error saving duration data to cookies:', error);
  }
};

export const getDurationData = (): Duration | null => {
  try {
    const durationData = getCookie(COOKIE_NAMES.DURATION);
    if (durationData) {
      return JSON.parse(decodeURIComponent(durationData));
    }
  } catch (error) {
    console.error('Error reading duration data from cookies:', error);
  }
  return null;
};

export const clearDurationData = (): void => {
  deleteCookie(COOKIE_NAMES.DURATION);
};

// Customer info functions
export const saveCustomerInfo = (customer: CustomerInfo): void => {
  try {
    const customerJson = JSON.stringify(customer);
    setCookie(COOKIE_NAMES.CUSTOMER, encodeURIComponent(customerJson));
  } catch (error) {
    console.error('Error saving customer data to cookies:', error);
  }
};

export const getCustomerInfo = (): CustomerInfo | null => {
  try {
    const customerData = getCookie(COOKIE_NAMES.CUSTOMER);
    if (customerData) {
      return JSON.parse(decodeURIComponent(customerData));
    }
  } catch (error) {
    console.error('Error reading customer data from cookies:', error);
  }
  return null;
};

export const clearCustomerInfo = (): void => {
  deleteCookie(COOKIE_NAMES.CUSTOMER);
};

// Clear all checkout data
export const clearAllCheckoutData = (): void => {
  clearVehicleData();
  clearDurationData();
  clearCustomerInfo();
};

// Check if we have complete checkout data
export const hasCompleteCheckoutData = (): boolean => {
  return !!(getVehicleData() && getDurationData());
};