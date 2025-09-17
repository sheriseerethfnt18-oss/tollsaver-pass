import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminAuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated and is admin
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (profile?.role === 'admin') {
          navigate('/admin');
          return;
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Check if user is admin
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Error checking profile:', profileError);
            throw new Error('Failed to verify admin status');
          }

          if (profile?.role === 'admin') {
            toast({
              title: "Welcome back!",
              description: "Successfully signed in as admin.",
            });
            navigate('/admin');
          } else {
            setError("Access denied. Admin privileges required.");
            await supabase.auth.signOut();
          }
        }
      } else {
        // Check if any admin already exists using the public function
        const { data: adminExists, error: checkError } = await supabase
          .rpc('admin_exists');

        if (checkError) {
          console.error('Error checking for existing admin:', checkError);
          throw new Error('Failed to verify admin status');
        }

        if (adminExists) {
          setError("Admin registration is disabled. An admin account already exists.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: 'Admin User',
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Create admin profile immediately
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              email: data.user.email || email,
              full_name: 'Admin User',
              role: 'admin'
            });

          if (profileError) {
            console.error('Error creating admin profile:', profileError);
            throw new Error('Failed to create admin profile');
          }

          toast({
            title: "Admin Account Created!",
            description: "You can now sign in with your credentials.",
          });
          
          // Switch to login mode
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed');
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
            {isLogin ? 'Sign in to your admin account' : 'Create a new admin account'}
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
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@travel-pass.live"
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
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {isLogin ? "Need to create an admin account?" : "Already have an account?"}
            </button>
          </div>

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