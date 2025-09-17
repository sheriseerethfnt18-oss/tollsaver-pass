import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Car, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  registration: string;
  make: string;
  model: string;
  color: string;
  name: string;
}

interface Duration {
  days: number;
  label: string;
  originalPrice: number;
  discountedPrice: number;
  savings: number;
}

interface VehicleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration: Duration | null;
  onProceedToPayment: (vehicle: Vehicle, duration: Duration) => void;
}

const VehicleRegistrationModal = ({ 
  isOpen, 
  onClose, 
  duration, 
  onProceedToPayment 
}: VehicleRegistrationModalProps) => {
  const [vrn, setVrn] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleVrnChange = (value: string) => {
    setVrn(value.toUpperCase());
    setError("");
    setVehicle(null);
  };

  const lookupVehicle = async () => {
    if (!vrn.trim()) {
      setError("Please enter a vehicle registration number");
      return;
    }

    setIsLookingUp(true);
    setError("");

    try {
      const { data, error: lookupError } = await supabase.functions.invoke('lookup-vehicle', {
        body: { vrn: vrn.trim() }
      });

      if (lookupError) {
        throw lookupError;
      }

      if (!data.success) {
        setError(data.error || "Vehicle not found");
        return;
      }

      const vehicleData: Vehicle = {
        registration: data.vehicle.registration,
        make: data.vehicle.make,
        model: data.vehicle.model,
        color: data.vehicle.color,
        name: data.vehicle.name
      };

      setVehicle(vehicleData);
      toast({
        title: "Vehicle Found!",
        description: `${vehicleData.color} ${vehicleData.make} ${vehicleData.model}`,
      });
    } catch (err) {
      console.error('Vehicle lookup error:', err);
      setError("Failed to lookup vehicle. Please try again.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleProceed = () => {
    if (vehicle && duration) {
      onProceedToPayment(vehicle, duration);
      handleClose();
    }
  };

  const handleClose = () => {
    setVrn("");
    setVehicle(null);
    setError("");
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLookingUp) {
      lookupVehicle();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Enter Vehicle Registration</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center">
            <Car className="w-12 h-12 mx-auto mb-4 text-accent-irish" />
            <p className="text-muted-foreground">
              Enter your vehicle registration number to verify your car details
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Input
                placeholder="e.g. 12-D-12345"
                value={vrn}
                onChange={(e) => handleVrnChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-center text-lg font-mono"
                maxLength={20}
              />
              {error && (
                <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <Button
              onClick={lookupVehicle}
              disabled={isLookingUp || !vrn.trim()}
              className="w-full"
            >
              {isLookingUp ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Looking up vehicle...
                </>
              ) : (
                "Look Up Vehicle"
              )}
            </Button>
          </div>

          {vehicle && (
            <Card className="border-accent-irish/20 bg-accent-irish/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-center">Vehicle Found!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Registration:</span>
                    <p className="text-muted-foreground">{vehicle.registration}</p>
                  </div>
                  <div>
                    <span className="font-medium">Make:</span>
                    <p className="text-muted-foreground">{vehicle.make}</p>
                  </div>
                  <div>
                    <span className="font-medium">Model:</span>
                    <p className="text-muted-foreground">{vehicle.model}</p>
                  </div>
                  <div>
                    <span className="font-medium">Color:</span>
                    <p className="text-muted-foreground">{vehicle.color}</p>
                  </div>
                </div>
                
                {duration && (
                  <div className="border-t pt-3 mt-4">
                    <h4 className="font-medium mb-2">Selected Plan:</h4>
                    <div className="flex justify-between items-center">
                      <span>{duration.label}</span>
                      <span className="font-bold text-accent-irish">
                        €{duration.discountedPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleProceed}
                  className="w-full btn-irish mt-4"
                >
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleRegistrationModal;