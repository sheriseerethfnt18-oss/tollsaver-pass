import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, CheckCircle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const RefundPolicyPage = () => {
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
              <CardTitle className="text-3xl">Refund Policy</CardTitle>
              <p className="text-muted-foreground">Last updated: September 2024</p>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Refund Eligibility</h2>
                <p className="text-muted-foreground mb-4">
                  We want you to be completely satisfied with your TravelPass purchase. 
                  Our refund policy is designed to be fair and straightforward.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-success/5 border-success/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <h3 className="font-semibold text-success">Full Refund Available</h3>
                      </div>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Within 24 hours of purchase</li>
                        <li>• Pass has not been activated</li>
                        <li>• No toll roads have been used</li>
                        <li>• Refund processed to original payment method</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-warning/5 border-warning/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-warning" />
                        <h3 className="font-semibold text-warning">Partial Refund May Apply</h3>
                      </div>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Multi-day passes with unused days remaining</li>
                        <li>• Technical issues preventing pass usage</li>
                        <li>• Calculated based on unused portion</li>
                        <li>• Subject to minimum processing fee</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Refund Process</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-accent-irish rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                    <div>
                      <h3 className="font-semibold mb-1">Submit Refund Request</h3>
                      <p className="text-muted-foreground">Contact our support team with your order number and reason for refund.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-accent-irish rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                    <div>
                      <h3 className="font-semibold mb-1">Review & Verification</h3>
                      <p className="text-muted-foreground">We'll review your request and verify eligibility within 1 business day.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-accent-irish rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                    <div>
                      <h3 className="font-semibold mb-1">Refund Processing</h3>
                      <p className="text-muted-foreground">Approved refunds are processed within 3-5 business days to your original payment method.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-accent-irish rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                    <div>
                      <h3 className="font-semibold mb-1">Confirmation</h3>
                      <p className="text-muted-foreground">You'll receive email confirmation once the refund has been processed.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Refund Timelines</h2>
                <div className="bg-muted p-4 rounded-lg">
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Credit Cards:</strong> 3-5 business days</li>
                    <li><strong>Debit Cards:</strong> 1-3 business days</li>
                    <li><strong>Digital Wallets:</strong> 1-2 business days</li>
                    <li><strong>Bank Transfers:</strong> 2-7 business days (depending on bank)</li>
                  </ul>
                  <p className="text-sm mt-3 text-muted-foreground">
                    <em>Note: Actual refund timing depends on your financial institution's processing time.</em>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Special Circumstances</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Technical Issues</h3>
                    <p className="text-muted-foreground">
                      If you experience technical problems that prevent you from using your pass, 
                      we'll provide a full refund or replacement pass at no charge.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Incorrect Vehicle Details</h3>
                    <p className="text-muted-foreground">
                      If you purchased a pass for the wrong vehicle and haven't used it, 
                      we can transfer it to the correct vehicle or provide a full refund.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Service Interruptions</h3>
                    <p className="text-muted-foreground">
                      If our service experiences extended downtime that affects your pass usage, 
                      you may be eligible for a prorated refund or pass extension.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Non-Refundable Situations</h2>
                <p className="text-muted-foreground mb-4">
                  Refunds are not available in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Pass has been fully used for its intended duration</li>
                  <li>More than 24 hours have passed since purchase and pass has been activated</li>
                  <li>Refund request is made after pass expiration</li>
                  <li>Violation of our Terms & Conditions</li>
                  <li>Fraudulent activity or chargebacks</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact for Refunds</h2>
                <p className="text-muted-foreground mb-4">
                  To request a refund or ask questions about our refund policy, please contact us:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Mail className="w-8 h-8 text-accent-irish mx-auto mb-2" />
                      <h3 className="font-semibold mb-2">Email Support</h3>
                      <p className="text-sm text-muted-foreground mb-2">Fastest response time</p>
                      <a href="mailto:refunds@travelpass.ie" className="text-accent-irish hover:underline">
                        refunds@travelpass.ie
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">
                        Include your order number
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Phone className="w-8 h-8 text-accent-irish mx-auto mb-2" />
                      <h3 className="font-semibold mb-2">Phone Support</h3>
                      <p className="text-sm text-muted-foreground mb-2">Mon-Fri 9AM-6PM</p>
                      <a href="tel:+353123456789" className="text-accent-irish hover:underline">
                        +353 1 234 5678
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">
                        Have your order number ready
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Refund Request Information</h2>
                <p className="text-muted-foreground mb-4">
                  To process your refund quickly, please provide:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Order number (format: TP12345678)</li>
                  <li>Email address used for purchase</li>
                  <li>Vehicle registration number</li>
                  <li>Reason for refund request</li>
                  <li>Original payment method details (last 4 digits of card)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Dispute Resolution</h2>
                <p className="text-muted-foreground">
                  If you're not satisfied with our refund decision, you can escalate your case to our 
                  customer service manager. We're committed to resolving all disputes fairly and promptly. 
                  You may also have rights under consumer protection laws in your jurisdiction.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;