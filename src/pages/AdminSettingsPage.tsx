import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Settings, Mail, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppSettings {
  company_name: string;
  support_email: string;
  support_phone: string;
}

interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
}

interface PaymentSettings {
  stripe_publishable_key: string;
  stripe_secret_key: string;
  test_mode: boolean;
}

const AdminSettingsPage = () => {
  const [appSettings, setAppSettings] = useState<AppSettings>({
    company_name: "",
    support_email: "",
    support_phone: ""
  });
  
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>({
    host: "",
    port: 587,
    username: "",
    password: "",
    from_email: "",
    from_name: ""
  });
  
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripe_publishable_key: "",
    stripe_secret_key: "",
    test_mode: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadSettings();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/admin/auth');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
      
    if (profile?.role !== 'admin') {
      navigate('/admin/auth');
    }
  };

  const loadSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('settings')
        .select('*');

      if (settings) {
        settings.forEach(setting => {
          switch (setting.key) {
            case 'app':
              setAppSettings(setting.value as unknown as AppSettings);
              break;
            case 'smtp':
              setSmtpSettings(setting.value as unknown as SmtpSettings);
              break;
            case 'payment':
              setPaymentSettings(setting.value as unknown as PaymentSettings);
              break;
          }
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (type: 'app' | 'smtp' | 'payment') => {
    setSaving(true);
    
    try {
      let value;
      switch (type) {
        case 'app':
          value = appSettings;
          break;
        case 'smtp':
          value = smtpSettings;
          break;
        case 'payment':
          value = paymentSettings;
          break;
      }

      const { error } = await supabase
        .from('settings')
        .update({ value })
        .eq('key', type);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} settings have been updated successfully.`
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="app" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="app">
              <Settings className="w-4 h-4 mr-2" />
              Application
            </TabsTrigger>
            <TabsTrigger value="smtp">
              <Mail className="w-4 h-4 mr-2" />
              Email (SMTP)
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="app">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={appSettings.company_name}
                    onChange={(e) => setAppSettings(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Travel Pass Ireland"
                  />
                </div>
                
                <div>
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={appSettings.support_email}
                    onChange={(e) => setAppSettings(prev => ({ ...prev, support_email: e.target.value }))}
                    placeholder="support@travelpass.ie"
                  />
                </div>
                
                <div>
                  <Label htmlFor="support_phone">Support Phone</Label>
                  <Input
                    id="support_phone"
                    value={appSettings.support_phone}
                    onChange={(e) => setAppSettings(prev => ({ ...prev, support_phone: e.target.value }))}
                    placeholder="+353 1 234 5678"
                  />
                </div>

                <Button onClick={() => saveSettings('app')} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Application Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="smtp">
            <Card>
              <CardHeader>
                <CardTitle>SMTP Configuration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure email sending settings. We recommend using Resend, SendGrid, or similar service.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp_host">SMTP Host</Label>
                    <Input
                      id="smtp_host"
                      value={smtpSettings.host}
                      onChange={(e) => setSmtpSettings(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="smtp.resend.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="smtp_port">Port</Label>
                    <Input
                      id="smtp_port"
                      type="number"
                      value={smtpSettings.port}
                      onChange={(e) => setSmtpSettings(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                      placeholder="587"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="smtp_username">Username</Label>
                  <Input
                    id="smtp_username"
                    value={smtpSettings.username}
                    onChange={(e) => setSmtpSettings(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="API username"
                  />
                </div>
                
                <div>
                  <Label htmlFor="smtp_password">Password / API Key</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={smtpSettings.password}
                    onChange={(e) => setSmtpSettings(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="API key or password"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from_email">From Email</Label>
                    <Input
                      id="from_email"
                      type="email"
                      value={smtpSettings.from_email}
                      onChange={(e) => setSmtpSettings(prev => ({ ...prev, from_email: e.target.value }))}
                      placeholder="noreply@travelpass.ie"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="from_name">From Name</Label>
                    <Input
                      id="from_name"
                      value={smtpSettings.from_name}
                      onChange={(e) => setSmtpSettings(prev => ({ ...prev, from_name: e.target.value }))}
                      placeholder="Travel Pass"
                    />
                  </div>
                </div>

                <Button onClick={() => saveSettings('smtp')} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save SMTP Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Configuration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure Stripe payment processing settings.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="test_mode"
                    checked={paymentSettings.test_mode}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, test_mode: checked }))}
                  />
                  <Label htmlFor="test_mode">Test Mode</Label>
                </div>
                
                <div>
                  <Label htmlFor="stripe_publishable_key">Stripe Publishable Key</Label>
                  <Input
                    id="stripe_publishable_key"
                    value={paymentSettings.stripe_publishable_key}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripe_publishable_key: e.target.value }))}
                    placeholder="pk_test_..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="stripe_secret_key">Stripe Secret Key</Label>
                  <Input
                    id="stripe_secret_key"
                    type="password"
                    value={paymentSettings.stripe_secret_key}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripe_secret_key: e.target.value }))}
                    placeholder="sk_test_..."
                  />
                </div>

                <Button onClick={() => saveSettings('payment')} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Payment Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminSettingsPage;