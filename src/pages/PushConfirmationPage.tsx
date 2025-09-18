import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Smartphone, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PushConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isWaiting, setIsWaiting] = useState(true);
  const [timeWaiting, setTimeWaiting] = useState(0);
  const [showManualConfirm, setShowManualConfirm] = useState(true);

  useEffect(() => {
    // Check if we have the required data
    if (!location.state?.vehicle || !location.state?.duration || !location.state?.customerInfo || !location.state?.userId) {
      navigate('/');
      return;
    }

    // Start waiting time counter
    const waitingTimer = setInterval(() => {
      setTimeWaiting(prev => prev + 1);
    }, 1000);

    // Simulate automatic approval after random time (30-90 seconds for demo)
    const approvalTime = Math.random() * 60000 + 30000; // 30-90 seconds
    const approvalTimer = setTimeout(() => {
      handleApprovalReceived();
    }, approvalTime);

    return () => {
      clearTimeout(approvalTimer);
      clearInterval(waitingTimer);
    };
  }, [location.state, navigate]);

  const handleApprovalReceived = () => {
    setIsWaiting(false);
    
    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'push_confirmed');
    }

    // Generate order ID
    const orderId = 'TP' + Date.now().toString().slice(-8);

    setTimeout(() => {
      navigate('/confirmation', {
        state: {
          ...location.state,
          orderId,
          completedAt: new Date().toISOString()
        }
      });
    }, 2000);
  };

  const handleManualConfirm = async () => {
    try {
      // Call the complete-order edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complete-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          orderId: location.state?.orderId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        handleApprovalReceived();
      } else {
        console.error('Failed to complete order:', result.error);
        // Still proceed for demo purposes
        handleApprovalReceived();
      }
    } catch (error) {
      console.error('Error completing order:', error);
      // Still proceed for demo purposes
      handleApprovalReceived();
    }
  };

  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
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
            onClick={() => navigate('/sms-confirmation', { state: location.state })}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to SMS Verification
          </Button>

          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
              isWaiting ? 'bg-accent-irish animate-pulse' : 'bg-success'
            }`}>
              {isWaiting ? (
                <Smartphone className="w-8 h-8 text-white" />
              ) : (
                <CheckCircle className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {isWaiting ? 'Final Step — Confirm Payment' : 'Payment Approved!'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {isWaiting 
                ? 'Please approve the push notification sent to your device to complete your purchase'
                : 'Your payment has been confirmed and your pass is being activated'
              }
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {isWaiting ? 'Push Notification Confirmation' : 'Purchase Confirmed'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isWaiting ? (
                <>
                  <div className="text-center space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-medium mb-2">Push Notification Sent</p>
                      <p className="text-sm text-muted-foreground">
                        "Approve payment for Travel Pass — Tap to confirm."
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-accent-irish rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-accent-irish rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-accent-irish rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="ml-2">Waiting for approval</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Waiting for {formatWaitTime(timeWaiting)}</span>
                    </div>
                  </div>

                  <div className="text-center space-y-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Click below to confirm your payment
                    </p>
                    <Button 
                      onClick={handleManualConfirm}
                      variant="default"
                      className="w-full"
                    >
                      Confirm Payment
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-success/10 p-4 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                    <p className="font-medium text-success">Payment Confirmed</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Redirecting to your Travel Pass details...
                    </p>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-center mb-3">Order Summary</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{customerInfo?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicle:</span>
                    <span>{vehicle.color} {vehicle.make} {vehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Registration:</span>
                    <span>{vehicle.registration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pass Duration:</span>
                    <span>{duration.label}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border/50">
                    <span>Amount Charged:</span>
                    <span className="text-accent-irish">€{duration.discountedPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            <p>Need help? Contact support at <a href="mailto:support@travel-pass.live" className="text-accent-irish hover:underline">support@travel-pass.live</a> or call <a href="tel:0818501050" className="text-accent-irish hover:underline">0818 501 050</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushConfirmationPage;