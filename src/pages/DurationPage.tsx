import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, ArrowLeft } from "lucide-react";

interface Vehicle {
  registration: string;
  make: string;
  model: string;
  color: string;
}

interface Duration {
  days: number;
  label: string;
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  popular?: boolean;
}

const DurationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const durations: Duration[] = [
    {
      days: 1,
      label: "1 Day Pass",
      originalPrice: 5.00,
      discountedPrice: 3.50,
      savings: 1.50
    },
    {
      days: 7,
      label: "7 Day Pass",
      originalPrice: 21.43,
      discountedPrice: 15.00,
      savings: 6.43,
      popular: true
    },
    {
      days: 30,
      label: "30 Day Pass",
      originalPrice: 71.43,
      discountedPrice: 50.00,
      savings: 21.43
    }
  ];

  useEffect(() => {
    // Get vehicle data from navigation state
    const vehicleData = location.state?.vehicle;
    if (vehicleData) {
      setVehicle(vehicleData);
    } else {
      // Redirect to homepage if no vehicle data
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleProceed = () => {
    if (!selectedDuration || !vehicle) return;

    const selectedDurationData = durations.find(d => d.days.toString() === selectedDuration);
    
    if (window.gtag) {
      window.gtag('event', 'duration_selected', {
        days: selectedDuration,
        original_price: selectedDurationData?.originalPrice,
        discounted_price: selectedDurationData?.discountedPrice
      });
    }

    navigate('/payment', {
      state: {
        vehicle,
        duration: selectedDurationData
      }
    });
  };

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Loading vehicle information...</p>
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
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Choose Your Travel Pass Duration</h1>
            <p className="text-xl text-muted-foreground">Select the perfect pass for your travel needs</p>
          </div>

          {/* Vehicle Summary */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="vehicle-found text-lg">
                  Vehicle: {vehicle.color} {vehicle.make} {vehicle.model} ({vehicle.registration})
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duration Selection */}
          <RadioGroup value={selectedDuration} onValueChange={setSelectedDuration}>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {durations.map((duration) => (
                <Card 
                  key={duration.days} 
                  className={`relative cursor-pointer transition-all duration-300 ${
                    selectedDuration === duration.days.toString() 
                      ? 'ring-2 ring-accent-irish shadow-lg' 
                      : 'hover:shadow-md'
                  } ${duration.popular ? 'border-accent-irish' : ''}`}
                  onClick={() => setSelectedDuration(duration.days.toString())}
                >
                  {duration.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-accent-irish text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-between mb-4">
                      <RadioGroupItem 
                        value={duration.days.toString()} 
                        id={`duration-${duration.days}`}
                        className="data-[state=checked]:bg-accent-irish data-[state=checked]:border-accent-irish"
                      />
                      <Label htmlFor={`duration-${duration.days}`} className="sr-only">
                        {duration.label}
                      </Label>
                      {selectedDuration === duration.days.toString() && (
                        <CheckCircle className="w-6 h-6 text-accent-irish" />
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4">{duration.label}</h3>
                    
                    <div className="space-y-2 mb-6">
                      <div className="text-lg text-muted-foreground line-through">
                        €{duration.originalPrice.toFixed(2)}
                      </div>
                      <div className="text-3xl font-bold text-accent-irish">
                        €{duration.discountedPrice.toFixed(2)}
                      </div>
                      <div className="text-sm font-medium text-accent-irish">
                        You save €{duration.savings.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      30% off original price
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </RadioGroup>

          {/* Discount Calculator */}
          <Card className="mb-8 bg-muted">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">How Your Discount is Applied</h3>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Original Price</p>
                  <p className="text-lg font-semibold">
                    €{selectedDuration ? durations.find(d => d.days.toString() === selectedDuration)?.originalPrice.toFixed(2) : '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">30% Discount</p>
                  <p className="text-lg font-semibold text-accent-irish">
                    -€{selectedDuration ? durations.find(d => d.days.toString() === selectedDuration)?.savings.toFixed(2) : '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Price</p>
                  <p className="text-2xl font-bold text-accent-irish">
                    €{selectedDuration ? durations.find(d => d.days.toString() === selectedDuration)?.discountedPrice.toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proceed Button */}
          <div className="text-center">
            <Button 
              onClick={handleProceed}
              disabled={!selectedDuration}
              className="btn-hero px-12 py-4 text-xl"
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DurationPage;