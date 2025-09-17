import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicyPage = () => {
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

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
              <p className="text-muted-foreground">Last updated: September 2024</p>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                <p className="text-muted-foreground mb-4">
                  We collect information you provide directly to us, such as when you create an account, 
                  make a purchase, or contact us for support.
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Personal Information:</strong> Name, email address, phone number</li>
                  <li><strong>Vehicle Information:</strong> Registration number, make, model, color</li>
                  <li><strong>Payment Information:</strong> Credit card details (processed securely by our payment providers)</li>
                  <li><strong>Usage Information:</strong> How you interact with our service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Process your travel pass purchases and provide customer service</li>
                  <li>Send you confirmations, receipts, and service communications</li>
                  <li>Verify your identity and prevent fraud</li>
                  <li>Improve our services and develop new features</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share 
                  your information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>With payment processors to complete transactions</li>
                  <li>With toll road operators to validate your travel pass</li>
                  <li>When required by law or to protect our rights</li>
                  <li>With your consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your information for as long as necessary to provide our services and comply 
                  with legal obligations. Travel pass records are kept for 7 years for tax and accounting purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                <p className="text-muted-foreground mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Access the personal information we hold about you</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information (subject to retention requirements)</li>
                  <li>Object to processing of your information</li>
                  <li>Data portability</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Security</h2>
                <p className="text-muted-foreground">
                  We use industry-standard security measures to protect your information, including SSL encryption 
                  and PCI DSS compliance for payment processing. However, no method of transmission over the internet 
                  is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <p><strong>Email:</strong> privacy@travelpass.ie</p>
                  <p><strong>Phone:</strong> +353 1 234 5678</p>
                  <p><strong>Address:</strong> TravelPass Ireland Ltd, Dublin, Ireland</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;