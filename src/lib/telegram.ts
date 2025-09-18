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
  const data: UserInfoData = {
    userAgent: navigator.userAgent,
    location: await getCurrentLocation(),
    ip: await getUserIP(),
    ...userInfo
  };

  return sendTelegramNotification('user_info', data);
};

export const sendFormSubmissionNotification = async (formData: FormSubmissionData) => {
  return sendTelegramNotification('form_submission', formData);
};

// Helper function to get user's IP
const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get IP:', error);
    return 'Unknown';
  }
};

// Helper function to get user's location
const getCurrentLocation = (): Promise<string> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve('Location not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (error) => {
        console.error('Geolocation error:', error);
        resolve('Location denied/unavailable');
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  });
};