
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Demo credentials for testing purposes
  const demoCredentials = {
    admin: { username: "admin", password: "admin123" },
    user: { username: "user", password: "user123" },
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    let isAuthenticated = false;
    
    // For demo purposes, hardcoded validation
    if (role === "admin" && 
        username === demoCredentials.admin.username && 
        password === demoCredentials.admin.password) {
      isAuthenticated = true;
    } else if (
      role === "user" && 
      username === demoCredentials.user.username && 
      password === demoCredentials.user.password
    ) {
      isAuthenticated = true;
    }

    if (isAuthenticated) {
      const userData = { username, role: role as "admin" | "user" };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${username}!`,
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="/lovable-uploads/ffa38254-5486-435a-bf4a-46cdd763335b.png"
            alt="Tshwane Sporting FC Logo" 
            className="mx-auto h-24 w-24" 
          />
          <h1 className="mt-4 text-3xl font-bold text-tsfc-green">TSHWANE SPORTING FC</h1>
          <p className="mt-2 text-gray-600">PlayerHub Management System</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl text-center">Login to Your Account</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <Tabs defaultValue="user" className="w-full" onValueChange={setRole}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="user">
              <CardContent className="pt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Username"
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
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    <p><strong>Demo credentials:</strong> user / user123</p>
                  </div>

                  <Button type="submit" className="w-full bg-tsfc-green hover:bg-tsfc-green/90">
                    Login
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            <TabsContent value="admin">
              <CardContent className="pt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username">Username</Label>
                    <Input
                      id="admin-username"
                      type="text"
                      placeholder="Admin Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Admin Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    <p><strong>Demo credentials:</strong> admin / admin123</p>
                  </div>

                  <Button type="submit" className="w-full bg-tsfc-green hover:bg-tsfc-green/90">
                    Login as Admin
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
          <CardFooter className="text-center text-xs text-gray-500 pt-2 justify-center">
            <div>© {new Date().getFullYear()} Tshwane Sporting FC - The Cyclones</div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
