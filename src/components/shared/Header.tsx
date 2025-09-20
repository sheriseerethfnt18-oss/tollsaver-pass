import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent-irish rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TP</span>
            </div>
            <span className="text-xl font-bold text-foreground">TravelPass</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-accent-irish transition-all duration-300">Home</Link>
            <Link to="/duration" className="text-foreground hover:text-accent-irish transition-all duration-300">Pricing</Link>
            <Link to="/contact" className="text-foreground hover:text-accent-irish transition-all duration-300">Contact</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link to="/contact">Support</Link>
            </Button>
            <Button 
              className="btn-irish" 
              onClick={() => {
                const element = document.getElementById('vehicle-lookup');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Get Pass
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;