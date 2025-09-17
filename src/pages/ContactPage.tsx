import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone, Clock, MessageCircle, HelpCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Contact & Support</h1>
            <p className="text-xl text-muted-foreground">
              We're here to help with your TravelPass questions and support needs
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="w-12 h-12 text-accent-irish mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Email Support</h3>
                <p className="text-muted-foreground mb-4">Get help via email - we respond within 2 hours</p>
                <a href="mailto:support@travel-pass.live" className="text-accent-irish hover:underline font-medium">
                  support@travel-pass.live
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  Response time: 30 minutes - 2 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="w-12 h-12 text-accent-irish mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
                <p className="text-muted-foreground mb-4">Speak directly with our support team</p>
                <a href="tel:0818501050" className="text-accent-irish hover:underline font-medium text-lg">
                  0818 501 050
                </a>
                <div className="text-sm text-muted-foreground mt-2">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-accent-irish mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
                <p className="text-muted-foreground mb-4">Instant help during business hours</p>
                <Button className="btn-irish">
                  Start Chat
                </Button>
                <div className="text-sm text-muted-foreground mt-2">
                  <p>Available: Mon-Fri 9AM-6PM</p>
                  <p>Average wait time: &lt; 2 minutes</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support Categories */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">What can we help you with?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Purchase & Payment Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Payment processing problems</li>
                    <li>• Order confirmation issues</li>
                    <li>• Refund requests</li>
                    <li>• Billing inquiries</li>
                    <li>• Receipt or invoice questions</li>
                  </ul>
                  <p className="text-sm mt-4 font-medium">
                    <strong>Best contact method:</strong> Email with order number
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Pass Activation & Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• SMS verification issues</li>
                    <li>• Push notification problems</li>
                    <li>• Pass not working at toll plaza</li>
                    <li>• Vehicle registration corrections</li>
                    <li>• Pass expiration questions</li>
                  </ul>
                  <p className="text-sm mt-4 font-medium">
                    <strong>Best contact method:</strong> Phone for immediate help
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Help */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Self-Service Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Account & Orders</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Check order status by email confirmation</li>
                    <li>• Download pass PDF from confirmation email</li>
                    <li>• Update payment method for future orders</li>
                    <li>• View purchase history</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Common Solutions</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Check spam folder for SMS verification</li>
                    <li>• Ensure phone has push notifications enabled</li>
                    <li>• Verify vehicle registration spelling</li>
                    <li>• Clear browser cache if payment fails</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Support Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Phone & Live Chat</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
                    <li>Saturday: 10:00 AM - 4:00 PM</li>
                    <li>Sunday: Closed</li>
                    <li>Public Holidays: Closed</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Email Support</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>24/7 - Submit anytime</li>
                    <li>Business hours: Response within 2 hours</li>
                    <li>After hours: Response by next business day</li>
                    <li>Urgent issues: Mark as "URGENT" in subject</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="bg-warning/5 border-warning/20">
            <CardHeader>
              <CardTitle className="text-warning">Emergency or Urgent Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you're experiencing urgent issues that prevent you from using your travel pass 
                (payment stuck at toll plaza, pass not recognized, etc.), contact us immediately:
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="tel:0818501050" 
                  className="flex items-center gap-2 text-accent-irish hover:underline font-semibold"
                >
                  <Phone className="w-4 h-4" />
                  0818 501 050 (Priority Line)
                </a>
                <a 
                  href="mailto:urgent@travel-pass.live" 
                  className="flex items-center gap-2 text-accent-irish hover:underline font-semibold"
                >
                  <Mail className="w-4 h-4" />
                  urgent@travel-pass.live
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">TravelPass Ireland Ltd</h3>
                  <address className="text-muted-foreground not-italic">
                    Unit 42, Innovation Centre<br />
                    Cork T12 R5CT<br />
                    Ireland
                  </address>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Business Details</h3>
                  <div className="text-muted-foreground space-y-1">
                    <p>Company Registration: IE637492815</p>
                    <p>VAT Number: IE3847291K</p>
                    <p>Regulated by: Central Bank of Ireland</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;