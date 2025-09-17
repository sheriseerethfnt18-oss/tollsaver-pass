import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Printer, Wallet, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getVehicleData, getDurationData, getCustomerInfo } from "@/lib/cookies";

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have the required data
    if (!location.state?.vehicle || !location.state?.duration || !location.state?.orderId) {
      navigate('/');
      return;
    }

    // Analytics event for purchase completion
    if (window.gtag) {
      window.gtag('event', 'purchase_completed', {
        order_id: location.state.orderId,
        amount: location.state.duration.discountedPrice,
        duration: location.state.duration.days
      });
    }
  }, [location.state, navigate]);

  const { vehicle, duration, customerInfo, orderId, completedAt } = location.state || {};

  // Fallback to cookie data if state is missing
  const finalVehicle = vehicle || getVehicleData();
  const finalDuration = duration || getDurationData();
  const finalCustomerInfo = customerInfo || getCustomerInfo();

  if (!finalVehicle || !finalDuration || !orderId) {
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

  const activationTime = new Date(completedAt || Date.now());
  const validUntil = new Date(activationTime);
  validUntil.setDate(validUntil.getDate() + finalDuration.days);

  const handleDownloadPass = async () => {
    try {
      const passData = {
        orderId,
        vehicle: finalVehicle,
        duration: finalDuration,
        customerInfo: finalCustomerInfo,
        activationDate: activationTime.toISOString(),
        expiryDate: validUntil.toISOString()
      };

      const { data, error } = await supabase.functions.invoke('download-pass', {
        body: passData,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again or contact support.');
        return;
      }

      // Create blob from response and trigger download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `travel-pass-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      // Analytics event
      if (window.gtag) {
        window.gtag('event', 'download_pass', {
          order_id: orderId,
          format: 'pdf'
        });
      }
    } catch (error) {
      console.error('Error downloading pass:', error);
      alert('Failed to download pass. Please try again or contact support.');
    }
  };

  const handlePrintPass = () => {
    window.print();
  };

  const handleAddToWallet = () => {
    // In a real implementation, this would generate an Apple Wallet pass or Google Pay pass
    alert("Add to Wallet functionality would be implemented here for Apple Wallet/Google Pay integration.");
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-success mb-4">Your Travel Pass is Activated!</h1>
            <p className="text-xl text-muted-foreground">
              You're all set to save 30% on Irish toll roads
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Pass Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  Travel Pass Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order Number</p>
                    <p className="font-semibold text-lg">{orderId}</p>
                  </div>
                   <div>
                     <p className="text-muted-foreground">Pass Duration</p>
                     <p className="font-semibold">{finalDuration.label}</p>
                   </div>
                   <div>
                     <p className="text-muted-foreground">Amount Charged</p>
                     <p className="font-semibold text-accent-irish">€{finalDuration.discountedPrice.toFixed(2)}</p>
                   </div>
                   <div>
                     <p className="text-muted-foreground">You Saved</p>
                     <p className="font-semibold text-success">€{finalDuration.savings.toFixed(2)}</p>
                   </div>
                  <div>
                    <p className="text-muted-foreground">Activated</p>
                    <p className="font-semibold">{activationTime.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valid Until</p>
                    <p className="font-semibold">{validUntil.toLocaleDateString()}</p>
                  </div>
                </div>

                 <div className="pt-4 border-t border-border">
                   <p className="text-muted-foreground mb-2">Vehicle</p>
                   <p className="font-semibold text-lg">
                     {finalVehicle.color} {finalVehicle.make} {finalVehicle.model}
                   </p>
                   <p className="text-muted-foreground">Registration: {finalVehicle.registration}</p>
                 </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Access Your Pass</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Download, print, or add your travel pass to your digital wallet for easy access.
                </p>

                <div className="grid gap-3">
                  <Button onClick={handleDownloadPass} className="btn-irish w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Download Pass (PDF)
                  </Button>
                  
                  <Button variant="outline" onClick={handlePrintPass} className="w-full justify-start">
                    <Printer className="w-4 h-4 mr-2" />
                    Print Pass
                  </Button>
                  
                  <Button variant="outline" onClick={handleAddToWallet} className="w-full justify-start">
                    <Wallet className="w-4 h-4 mr-2" />
                    Add to Wallet
                  </Button>
                </div>

                 <div className="pt-4 border-t border-border text-sm text-muted-foreground">
                   <p className="mb-2">📧 <strong>Email confirmation sent to:</strong></p>
                   <p className="mb-3">{finalCustomerInfo?.email || 'N/A'}</p>
                   <p className="mb-1"><strong>Subject:</strong> Your Travel Pass is Active — Order #{orderId}</p>
                   <p>Check your email for pass details and download link.</p>
                 </div>
              </CardContent>
            </Card>
          </div>

          {/* Support Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <Mail className="w-8 h-8 text-accent-irish mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-2">Get help via email</p>
                  <a href="mailto:support@travel-pass.live" className="text-accent-irish hover:underline text-sm">
                    support@travel-pass.live
                  </a>
                </div>
                
                <div>
                  <Phone className="w-8 h-8 text-accent-irish mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Phone Support</h3>
                  <p className="text-sm text-muted-foreground mb-2">Mon-Fri 9AM-6PM</p>
                  <a href="tel:0818501050" className="text-accent-irish hover:underline text-sm">
                    0818 501 050
                  </a>
                </div>
                
                <div>
                  <CheckCircle className="w-8 h-8 text-accent-irish mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Self-Service</h3>
                  <p className="text-sm text-muted-foreground mb-2">FAQ and guides</p>
                  <Link to="/contact" className="text-accent-irish hover:underline text-sm">
                    Help Center
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-accent-irish/5 border-accent-irish/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">What's Next?</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-accent-irish rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Keep Your Pass Handy</h4>
                  <p className="text-sm text-muted-foreground">Download the PDF or add to your wallet for quick access</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-accent-irish rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Drive & Save</h4>
                  <p className="text-sm text-muted-foreground">Your pass is automatically applied at all Irish toll roads</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-accent-irish rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Renew When Needed</h4>
                  <p className="text-sm text-muted-foreground">Get notified before your pass expires for easy renewal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return to Home */}
          <div className="text-center mt-8">
            <Button onClick={() => navigate('/')} variant="outline" size="lg">
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;