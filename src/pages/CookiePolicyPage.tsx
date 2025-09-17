import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CookiePolicyPage = () => {
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
              <CardTitle className="text-3xl">Cookie Policy</CardTitle>
              <p className="text-muted-foreground">Last updated: September 2024</p>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
                <p className="text-muted-foreground">
                  Cookies are small text files that are placed on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and 
                  understanding how you use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Strictly Necessary Cookies</h3>
                    <p className="text-muted-foreground mb-2">
                      These cookies are essential for our website to function properly. They enable basic 
                      features like page navigation and access to secure areas.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Session management</li>
                      <li>Security and authentication</li>
                      <li>Form submission</li>
                      <li>Cookie consent preferences</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Legal basis:</strong> Legitimate interest (essential for service operation)
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Analytics Cookies</h3>
                    <p className="text-muted-foreground mb-2">
                      These cookies help us understand how visitors interact with our website, 
                      allowing us to improve our service.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Google Analytics (traffic analysis)</li>
                      <li>User behavior tracking</li>
                      <li>Performance monitoring</li>
                      <li>Error tracking</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Legal basis:</strong> Consent
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Marketing Cookies</h3>
                    <p className="text-muted-foreground mb-2">
                      These cookies are used to deliver personalized advertisements and measure 
                      the effectiveness of our marketing campaigns.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Facebook Pixel</li>
                      <li>Google Ads conversion tracking</li>
                      <li>Retargeting pixels</li>
                      <li>Social media integration</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Legal basis:</strong> Consent
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Cookie Retention Periods</h2>
                <div className="bg-muted p-4 rounded-lg">
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                    <li><strong>Preference cookies:</strong> 1 year</li>
                    <li><strong>Analytics cookies:</strong> 2 years</li>
                    <li><strong>Marketing cookies:</strong> 30-90 days (varies by provider)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Managing Your Cookie Preferences</h2>
                <p className="text-muted-foreground mb-4">
                  You can control and manage cookies in several ways:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cookie Banner</h3>
                    <p className="text-muted-foreground">
                      When you first visit our site, you'll see a cookie banner where you can accept all cookies, 
                      decline optional cookies, or customize your preferences.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Browser Settings</h3>
                    <p className="text-muted-foreground mb-2">
                      You can also manage cookies through your browser settings:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li><strong>Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies</li>
                      <li><strong>Firefox:</strong> Preferences &gt; Privacy &amp; Security &gt; Cookies</li>
                      <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Cookies</li>
                      <li><strong>Edge:</strong> Settings &gt; Cookies and site permissions</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Opt-out Tools</h3>
                    <p className="text-muted-foreground">
                      You can opt out of targeted advertising through industry opt-out pages:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Digital Advertising Alliance: <span className="text-accent-irish">optout.aboutads.info</span></li>
                      <li>European Interactive Digital Advertising Alliance: <span className="text-accent-irish">youronlinechoices.eu</span></li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  Some cookies are set by third-party services that appear on our pages:
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p><strong>Google Analytics:</strong> Web traffic analysis</p>
                  <p><strong>Google Ads:</strong> Conversion tracking and remarketing</p>
                  <p><strong>Facebook:</strong> Social plugins and advertising</p>
                  <p><strong>Payment Processors:</strong> Secure payment processing</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Cookie Policy periodically to reflect changes in our practices 
                  or applicable laws. We'll notify you of significant changes through our website 
                  or other communications.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about our use of cookies, please contact us:
                </p>
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <p><strong>Email:</strong> privacy@travel-pass.live</p>
                  <p><strong>Phone:</strong> 0818 501 050</p>
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

export default CookiePolicyPage;