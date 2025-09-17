import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Printer, Wallet, Mail, Phone } from "lucide-react";

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

  if (!vehicle || !duration || !orderId) {
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

  const activationTime = new Date(completedAt);
  const validUntil = new Date(activationTime);
  validUntil.setDate(validUntil.getDate() + duration.days);

  const handleDownloadPass = () => {
    // In a real implementation, this would generate and download a PDF
    alert("PDF download would start here. In production, this would generate a PDF with QR code and pass details.");
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
                    <p className="font-semibold">{duration.label}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount Charged</p>
                    <p className="font-semibold text-accent-irish">€{duration.discountedPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">You Saved</p>
                    <p className="font-semibold text-success">€{duration.savings.toFixed(2)}</p>
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
                    {vehicle.color} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-muted-foreground">Registration: {vehicle.registration}</p>
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
                  <p className="mb-3">{customerInfo?.email}</p>
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
                  <a href="mailto:support@travelpass.ie" className="text-accent-irish hover:underline text-sm">
                    support@travelpass.ie
                  </a>
                </div>
                
                <div>
                  <Phone className="w-8 h-8 text-accent-irish mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Phone Support</h3>
                  <p className="text-sm text-muted-foreground mb-2">Mon-Fri 9AM-6PM</p>
                  <a href="tel:+353123456789" className="text-accent-irish hover:underline text-sm">
                    +353 1 234 5678
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