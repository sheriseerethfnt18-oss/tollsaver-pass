import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Settings, Mail, CreditCard, MessageSquare, Send } from "lucide-react";
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

interface TelegramSettings {
  bot_token: string;
  info_chat_id: string;
  form_chat_id: string;
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

  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings>({
    bot_token: "",
    info_chat_id: "",
    form_chat_id: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadSettings();
  }, []);

  const checkAdminAccess = () => {
    // Check if user is authenticated with hardcoded credentials
    const adminSession = localStorage.getItem('admin_session');
    
    if (adminSession !== 'authenticated') {
      navigate('/admin/auth');
      return;
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
            case 'telegram':
              setTelegramSettings(setting.value as unknown as TelegramSettings);
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

  const saveSettings = async (type: 'app' | 'smtp' | 'payment' | 'telegram') => {
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
        case 'telegram':
          value = telegramSettings;
          break;
      }

      const { error } = await supabase
        .from('settings')
        .upsert({ key: type, value }, { onConflict: 'key' });

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

  const setupWebhook = async () => {
    if (!telegramSettings.bot_token) {
      toast({
        title: "Error",
        description: "Please save telegram bot token first",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const webhookUrl = `${window.location.origin.replace('http://', 'https://')}/api/telegram-webhook`;
      
      const response = await fetch(`https://api.telegram.org/bot${telegramSettings.bot_token}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        toast({
          title: "Webhook Setup Success",
          description: `Telegram webhook has been configured to: ${webhookUrl}`
        });
      } else {
        throw new Error(result.description || 'Failed to setup webhook');
      }
    } catch (error: any) {
      toast({
        title: "Error setting up webhook",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const sendTestMessage = async () => {
    if (!telegramSettings.bot_token) {
      toast({
        title: "Error",
        description: "Please save telegram bot token first",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const testMessages = [];

      // Send test message to info chat if configured
      if (telegramSettings.info_chat_id) {
        const infoResponse = await supabase.functions.invoke('send-telegram-notification', {
          body: {
            type: 'user_info',
            data: {
              email: 'test@example.com',
              userAgent: 'Test Browser',
              ip: '127.0.0.1',
              country: 'Test Country',
              city: 'Test City',
              region: 'Test Region',
              timezone: 'UTC',
              isp: 'Test ISP'
            }
          }
        });

        if (infoResponse.error) {
          throw new Error(`Info chat test failed: ${infoResponse.error.message}`);
        }
        testMessages.push('Info chat');
      }

      // Send test message to form chat if configured
      if (telegramSettings.form_chat_id) {
        const formResponse = await supabase.functions.invoke('send-telegram-notification', {
          body: {
            type: 'form_submission',
            data: {
              name: 'Test User',
              email: 'test@example.com',
              phone: '+353 123 456 789',
              vehicle_registration: 'TEST123',
              duration: '7 days',
              price: '€29.99'
            }
          }
        });

        if (formResponse.error) {
          throw new Error(`Form chat test failed: ${formResponse.error.message}`);
        }
        testMessages.push('Form chat');
      }

      if (testMessages.length === 0) {
        toast({
          title: "No chats configured",
          description: "Please configure at least one chat ID before testing",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Test messages sent!",
        description: `Successfully sent test messages to: ${testMessages.join(', ')}`
      });
    } catch (error: any) {
      toast({
        title: "Test message failed",
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
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="telegram">
              <MessageSquare className="w-4 h-4 mr-2" />
              Telegram
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
                    placeholder="support@travel-pass.live"
                  />
                </div>
                
                <div>
                  <Label htmlFor="support_phone">Support Phone</Label>
                  <Input
                    id="support_phone"
                    value={appSettings.support_phone}
                    onChange={(e) => setAppSettings(prev => ({ ...prev, support_phone: e.target.value }))}
                    placeholder="0818 501 050"
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
                      placeholder="noreply@travel-pass.live"
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

          <TabsContent value="telegram">
            <Card>
              <CardHeader>
                <CardTitle>Telegram Bot Configuration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure Telegram bot for notifications and form submissions.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bot_token">Bot Token</Label>
                  <Input
                    id="bot_token"
                    type="password"
                    value={telegramSettings.bot_token}
                    onChange={(e) => setTelegramSettings(prev => ({ ...prev, bot_token: e.target.value }))}
                    placeholder="1234567890:ABCDEFGHIJKLMNOPqrstuvwxyz"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get your bot token from @BotFather on Telegram
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="info_chat_id">Info Chat ID</Label>
                  <Input
                    id="info_chat_id"
                    value={telegramSettings.info_chat_id}
                    onChange={(e) => setTelegramSettings(prev => ({ ...prev, info_chat_id: e.target.value }))}
                    placeholder="-1001234567890"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Chat ID for user info notifications (browser info, location)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="form_chat_id">Form Chat ID</Label>
                  <Input
                    id="form_chat_id"
                    value={telegramSettings.form_chat_id}
                    onChange={(e) => setTelegramSettings(prev => ({ ...prev, form_chat_id: e.target.value }))}
                    placeholder="-1001234567890"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Chat ID for web form submissions
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => saveSettings('telegram')} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Telegram Settings
                  </Button>
                  
                  <Button 
                    onClick={setupWebhook} 
                    disabled={saving || !telegramSettings.bot_token}
                    variant="outline"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Setup Webhook
                  </Button>

                  <Button 
                    onClick={sendTestMessage} 
                    disabled={saving || !telegramSettings.bot_token || (!telegramSettings.info_chat_id && !telegramSettings.form_chat_id)}
                    variant="outline"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Test Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminSettingsPage;