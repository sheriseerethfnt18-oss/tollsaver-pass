import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsPage = () => {
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
              <CardTitle className="text-3xl">Terms & Conditions</CardTitle>
              <p className="text-muted-foreground">Last updated: September 2024</p>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
                <p className="text-muted-foreground">
                  TravelPass provides digital toll road passes for use on Ireland's toll road network. 
                  Our service allows you to prepay for toll usage with a 30% discount on standard rates.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Coverage and Validity</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Travel passes are valid on all participating Irish toll roads</li>
                  <li>Passes are vehicle-specific and non-transferable</li>
                  <li>Pass duration begins immediately upon activation</li>
                  <li>Unused passes may be eligible for refund within 24 hours (see Refund Policy)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Activation Process</h2>
                <p className="text-muted-foreground mb-4">Your travel pass will be activated after:</p>
                <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                  <li>Successful payment processing</li>
                  <li>Identity verification confirmation</li>
                  <li>Account approval</li>
                  <li>System validation of vehicle details</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Payment Terms</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>All payments are processed in Euros (EUR)</li>
                  <li>Prices include 30% discount from standard toll rates</li>
                  <li>Payment is required in full before pass activation</li>
                  <li>We accept major credit and debit cards</li>
                  <li>All transactions are processed securely through PCI-compliant systems</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
                <p className="text-muted-foreground mb-4">By using our service, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Provide accurate vehicle and contact information</li>
                  <li>Use the pass only for the registered vehicle</li>
                  <li>Comply with all traffic laws and toll road regulations</li>
                  <li>Notify us immediately of any discrepancies or issues</li>
                  <li>Not attempt to circumvent or abuse the service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Refund Policy</h2>
                <p className="text-muted-foreground">
                  Full refunds are available within 24 hours of purchase if the pass has not been activated. 
                  Partial refunds may be available for unused portions of multi-day passes. 
                  See our <Link to="/refund-policy" className="text-accent-irish hover:underline">Refund Policy</Link> for complete details.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
                <p className="text-muted-foreground">
                  While we strive for 100% uptime, we cannot guarantee uninterrupted service. 
                  We are not liable for service interruptions due to maintenance, technical issues, 
                  or circumstances beyond our control.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  Our liability is limited to the amount paid for your travel pass. We are not responsible 
                  for indirect, incidental, or consequential damages. This limitation applies to the fullest 
                  extent permitted by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Dispute Resolution</h2>
                <p className="text-muted-foreground">
                  Any disputes will be resolved through binding arbitration in accordance with Irish law. 
                  You may also contact us directly to resolve issues informally.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We may update these terms periodically. Continued use of our service after changes 
                  constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                <div className="bg-muted p-4 rounded-lg">
                  <p><strong>Email:</strong> legal@travelpass.ie</p>
                  <p><strong>Phone:</strong> +353 1 234 5678</p>
                  <p><strong>Address:</strong> TravelPass Ireland Ltd, Dublin, Ireland</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Will the pass work on all toll roads in Ireland?</h3>
                    <p className="text-muted-foreground">Yes, your TravelPass is valid on all participating toll roads across Ireland's network.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">How is the pass activated?</h3>
                    <p className="text-muted-foreground">After payment, your identity will be verified and your pass activates immediately.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">What if my vehicle details are wrong?</h3>
                    <p className="text-muted-foreground">You can edit vehicle details before completing payment, or contact our support team for assistance after purchase.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">How do refunds work?</h3>
                    <p className="text-muted-foreground">Full refund available within 24 hours if the pass hasn't been activated. See our Refund Policy for complete details.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Is payment secure?</h3>
                    <p className="text-muted-foreground">Yes, all payments are processed through PCI-compliant gateways. We never store your CVV or sensitive card details.</p>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;