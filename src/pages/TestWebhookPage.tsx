import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestWebhookPage = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const setupWebhook = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-webhook', {
        body: { action: 'setup' }
      });

      if (error) {
        console.error('Error setting up webhook:', error);
        setResult({ error: error.message });
      } else {
        console.log('Webhook setup result:', data);
        setResult(data);
      }
    } catch (err) {
      console.error('Failed to setup webhook:', err);
      setResult({ error: 'Failed to setup webhook' });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Telegram Webhook Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={setupWebhook} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Setting up webhook...' : 'Setup Telegram Webhook'}
          </Button>
          
          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Click "Setup Telegram Webhook" above</li>
              <li>Go submit a test payment</li>
              <li>Check your Telegram group for the payment notification</li>
              <li>Click one of the buttons (SMS/Push/Error) in Telegram</li>
              <li>The user should be redirected based on your choice</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestWebhookPage;