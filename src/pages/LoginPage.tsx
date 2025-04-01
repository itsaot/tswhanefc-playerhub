
import React, { useState, useContext, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { setupAdminSession } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useContext(UserContext);
  const { toast } = useToast();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user.role) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For demo purposes, we're using a simplistic login
      // In a real app, you'd validate credentials against a backend
      if (username === 'admin' && password === 'admin') {
        // Log in as admin - FIXED: was incorrectly using 'user' role
        login('admin', 'admin');
        
        toast({
          title: "Login successful",
          description: "Welcome back, Admin!",
        });
        
        navigate('/dashboard');
      } else if (username && password) {
        // Log in as regular user
        login(username, 'user');
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${username}!`,
        });
        
        navigate('/dashboard');
      } else {
        toast({
          title: "Login failed",
          description: "Please enter valid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Tshwane Sporting FC</h1>
          <p className="text-gray-600">Team Management System</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="e.g., admin" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="text-sm text-muted-foreground">
                For demo: use "admin" / "admin" to log in as administrator
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full bg-green-700 hover:bg-green-800" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-sm text-center text-gray-600">
                Don't have an account? <Link to="/register" className="text-green-700 hover:underline">Register</Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
