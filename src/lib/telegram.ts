import { supabase } from "@/integrations/supabase/client";

export interface UserInfoData {
  email?: string;
  userAgent: string;
  location?: string;
  ip?: string;
}

export interface FormSubmissionData {
  name: string;
  email: string;
  phone?: string;
  vehicle_registration: string;
  duration: string;
  price: string;
}

// Helper function to get user's IP and location
const getUserIPAndLocation = async (): Promise<{ ip: string; location: string }> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.error) {
      console.error('IP API error:', data.reason);
      return {
        ip: 'Unknown',
        location: 'Location unavailable'
      };
    }
    
    const location = `${data.city || 'Unknown'}, ${data.region || ''} ${data.country_name || ''}`.trim();
    return {
      ip: data.ip || 'Unknown',
      location: location || 'Location unavailable'
    };
  } catch (error) {
    console.error('Failed to get IP and location:', error);
    return {
      ip: 'Unknown',
      location: 'Location unavailable'
    };
  }
};

export const sendTelegramNotification = async (
  type: 'user_info' | 'form_submission',
  data: UserInfoData | FormSubmissionData
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
  const ipAndLocation = await getUserIPAndLocation();
  
  const data: UserInfoData = {
    userAgent: navigator.userAgent,
    location: ipAndLocation.location,
    ip: ipAndLocation.ip,
    ...userInfo
  };

  return sendTelegramNotification('user_info', data);
};

export const sendFormSubmissionNotification = async (formData: FormSubmissionData) => {
  return sendTelegramNotification('form_submission', formData);
};