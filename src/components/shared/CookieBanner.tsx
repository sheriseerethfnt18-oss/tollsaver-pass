import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

// Global gtag declaration
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const fullConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(fullConsent));
    setShowBanner(false);
    
    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'cookies_accepted', {
        consent_type: 'all'
      });
    }
  };

  const declineAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(minimalConsent));
    setShowBanner(false);
    
    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'cookies_declined');
    }
  };

  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
    
    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'cookies_customized', {
        analytics_consent: preferences.analytics,
        marketing_consent: preferences.marketing
      });
    }
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="cookie-banner">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-foreground">
                This website uses cookies to ensure you get the best experience. We use necessary cookies for site functionality and optional cookies for analytics and marketing.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={declineAll}>
                Decline
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                Cookie Settings
              </Button>
              <Button size="sm" className="btn-irish" onClick={acceptAll}>
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Strictly Necessary</h4>
                <p className="text-sm text-muted-foreground">Required for basic site functionality</p>
              </div>
              <Switch checked={preferences.necessary} disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Analytics</h4>
                <p className="text-sm text-muted-foreground">Help us improve our website</p>
              </div>
              <Switch 
                checked={preferences.analytics} 
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, analytics: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Marketing</h4>
                <p className="text-sm text-muted-foreground">Personalized ads and content</p>
              </div>
              <Switch 
                checked={preferences.marketing} 
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketing: checked }))}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowSettings(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={savePreferences} className="flex-1 btn-irish">
                Save Preferences
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieBanner;