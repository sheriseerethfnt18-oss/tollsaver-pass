import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
                    <Input
                      className="form-input"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
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