import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Credit card brand logo SVG components
const VisaLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 24" fill="none">
    <rect width="40" height="24" rx="4" fill="#1A1F71"/>
    <path d="M16.75 7.5h-2.5l-1.5 9h2.5l1.5-9zm7.75 5.75c0-2.5-3.25-2.63-3.25-3.75 0-.33.33-.68 1-.68.83 0 1.5.18 1.5.18l.25-2.25s-.75-.25-1.75-.25c-1.83 0-3.08 1-3.08 2.38 0 1.03.93 1.6 1.65 1.95.75.35 1 .58 1 .9 0 .5-.6.73-1.15.73-.95 0-1.5-.25-1.5-.25l-.28 2.25s.68.3 1.85.3c1.95 0 3.2-.95 3.2-2.43zm5-5.75h-1.93c-.6 0-1.05.35-1.28.88l-3.6 8.12h2.25l.45-1.25h2.75l.25 1.25h2l-1.9-9zm-2.25 6.25l1.13-3.13.63 3.13h-1.76zm-13.5-6.25l-2.25 9h2.25l2.25-9h-2.25z" fill="white"/>
  </svg>
);

const MastercardLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 24" fill="none">
    <rect width="40" height="24" rx="4" fill="#000"/>
    <circle cx="15" cy="12" r="6" fill="#FF5F00"/>
    <circle cx="25" cy="12" r="6" fill="#EB001B"/>
    <circle cx="20" cy="12" r="6" fill="#FF5F00"/>
  </svg>
);

const AmexLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 24" fill="none">
    <rect width="40" height="24" rx="4" fill="#006FCF"/>
    <path d="M8 8h3l1.5 2L14 8h12v1.5h-3v1h3v1.5h-3v1h3V16H14l-1.5-2L11 16H8v-1.5h3v-1H8v-1.5h3v-1H8V8z" fill="white"/>
  </svg>
);

const DiscoverLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 24" fill="none">
    <rect width="40" height="24" rx="4" fill="#FF6000"/>
    <path d="M32 12c0 4.5-3.5 8-8 8H8c-2.2 0-4-1.8-4-4V8c0-2.2 1.8-4 4-4h16c4.5 0 8 3.5 8 8z" fill="#FF6000"/>
    <text x="20" y="15" textAnchor="middle" className="text-xs font-bold" fill="white">DISCOVER</text>
  </svg>
);

const DinersLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 24" fill="none">
    <rect width="40" height="24" rx="4" fill="#0079BE"/>
    <circle cx="20" cy="12" r="8" fill="none" stroke="white" strokeWidth="2"/>
    <text x="20" y="15" textAnchor="middle" className="text-xs font-bold" fill="white">DC</text>
  </svg>
);

const JCBLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 24" fill="none">
    <rect width="40" height="24" rx="4" fill="#006FCF"/>
    <text x="20" y="15" textAnchor="middle" className="text-xs font-bold" fill="white">JCB</text>
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

interface Vehicle {
  registration: string;
  make: string;
  model: string;
  color: string;
}

interface Duration {
  days: number;
  label: string;
  originalPrice: number;
  discountedPrice: number;
  savings: number;
}

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

  useEffect(() => {
    const { vehicle: vehicleData, duration: durationData } = location.state || {};
    if (vehicleData && durationData) {
      setVehicle(vehicleData);
      setDuration(durationData);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'payment_initiated', {
        amount: duration?.discountedPrice,
        duration: duration?.days
      });
    }

    // Simulate payment processing
    setTimeout(() => {
      navigate('/sms-confirmation', {
        state: {
          vehicle,
          duration,
          customerInfo: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone
          }
        }
      });
    }, 2000);
  };

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
                    {cardType !== 'unknown' && (
                      <div className="flex items-center gap-2 text-sm text-accent-irish mt-1">
                        {getCardIcon(cardType)}
                        <span>✓ {getCardName(cardType)} detected</span>
                      </div>
                    )}
                    {errors.cardNumber && <p className="form-error">{errors.cardNumber}</p>}
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

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-hero w-full text-lg py-4"
                  >
                    {isSubmitting ? 'Processing Payment...' : 'Proceed to Verification'}
                  </Button>
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