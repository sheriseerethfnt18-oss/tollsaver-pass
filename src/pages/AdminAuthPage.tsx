import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminAuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated with hardcoded credentials
    const checkAuth = () => {
      const adminSession = localStorage.getItem('admin_session');
      if (adminSession === 'authenticated') {
        navigate('/admin');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Hardcoded admin credentials
      const ADMIN_USERNAME = "admin";
      const ADMIN_PASSWORD = "Rub8TVRx!!!!";

      if (email === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Store admin session in localStorage
        localStorage.setItem('admin_session', 'authenticated');
        
        toast({
          title: "Welcome back!",
          description: "Successfully signed in as admin.",
        });
        navigate('/admin');
      } else {
        setError("Invalid credentials. Please check your username and password.");
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <p className="text-muted-foreground">
            Sign in to your admin account
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Username
              </label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <Button variant="ghost" onClick={() => navigate('/')}>
              Back to Website
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuthPage;