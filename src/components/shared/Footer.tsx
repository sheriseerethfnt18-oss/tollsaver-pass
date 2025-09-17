import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-accent-irish rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TP</span>
              </div>
              <span className="text-xl font-bold text-foreground">TravelPass</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Save 30% on all Irish toll roads with our instant digital travel pass.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-accent-irish transition-all duration-300 text-sm">Home</Link></li>
              <li><Link to="/duration" className="text-muted-foreground hover:text-accent-irish transition-all duration-300 text-sm">Pricing</Link></li>
              <li><Link to="/refund-policy" className="text-muted-foreground hover:text-accent-irish transition-all duration-300 text-sm">Refunds</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-accent-irish transition-all duration-300 text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-accent-irish transition-all duration-300 text-sm">Terms & Conditions</Link></li>
              <li><Link to="/cookie-policy" className="text-muted-foreground hover:text-accent-irish transition-all duration-300 text-sm">Cookie Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-muted-foreground hover:text-accent-irish transition-all duration-300 text-sm">Contact Us</Link></li>
              <li><a href="mailto:support@travel-pass.live" className="text-muted-foreground hover:text-accent-irish transition-all duration-300 text-sm">support@travel-pass.live</a></li>
              <li><a href="tel:0818501050" className="text-muted-foreground hover:text-accent-irish transition-all duration-300 text-sm">0818 501 050</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 TravelPass Ireland. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;