import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Clock } from "lucide-react";

const SmsConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if we have the required data
    if (!location.state?.vehicle || !location.state?.duration) {
      navigate('/');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === 1) {
          setCanResend(true);
        }
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.state, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError("");

    // Simulate verification delay
    setTimeout(() => {
      // For demo purposes, accept any 6-digit code
      if (code.length === 6) {
        // Analytics event
        if (window.gtag) {
          window.gtag('event', 'sms_verified');
        }

        navigate('/push-confirmation', {
          state: location.state
        });
      } else {
        setError("Invalid verification code. Please try again.");
        setIsVerifying(false);
      }
    }, 1500);
  };

  const handleResendCode = () => {
    setCanResend(false);
    setTimeRemaining(30); // 30 seconds before next resend
    setCode("");
    setError("");
    
    // Simulate sending new code
    setTimeout(() => {
      alert("New verification code sent to your phone!");
    }, 500);
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
                  Code sent to: {customerInfo?.phone}
                </p>
                <p className="text-sm text-muted-foreground">
                  SMS: "Your verification code for Travel Pass: 123456. Do not share this code."
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
                {isVerifying ? "Verifying Code..." : "Verify Code"}
              </Button>

              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {timeRemaining > 0 ? `Code expires in ${formatTime(timeRemaining)}` : "Code expired"}
                  </span>
                </div>

                <div>
                  {canResend ? (
                    <Button variant="outline" onClick={handleResendCode}>
                      Resend Code
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Didn't receive it? You can resend in {formatTime(timeRemaining > 30 ? 30 : timeRemaining)}
                    </p>
                  )}
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
            <p>Having trouble? Contact support at <a href="mailto:support@travelpass.ie" className="text-accent-irish hover:underline">support@travelpass.ie</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmsConfirmationPage;