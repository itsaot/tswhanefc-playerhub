import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Target, Users } from "lucide-react";

// Utility function to export users to CSV
const exportUsersToCSV = () => {
  try {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Create CSV content without passwords for security reasons
    const headers = ["Username", "Role", "Registration Date"];
    
    const rows = users.map((user: any) => [
      user.username,
      user.role,
      user.registrationDate || "Unknown"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "tshwane_sporting_fc_users.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("Error exporting users to CSV:", error);
    return false;
  }
};

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize admin user if no users exist
  useEffect(() => {
    const users = localStorage.getItem("users");
    if (!users) {
      // Create default admin account with registration date
      localStorage.setItem("users", JSON.stringify([
        { 
          username: "admin", 
          password: "admin123", 
          role: "admin",
          registrationDate: new Date().toISOString().split('T')[0]
        }
      ]));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userAccount = users.find(
        (u: any) => u.username === username && u.password === password
      );

      if (userAccount) {
        // Valid login
        const userInfo = { username: userAccount.username, role: userAccount.role };
        localStorage.setItem("user", JSON.stringify(userInfo));
        setUser(userInfo);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${username}!`,
        });
        
        navigate("/dashboard");
      } else {
        // Invalid login
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-tsfc-green text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/ffa38254-5486-435a-bf4a-46cdd763335b.png" 
              alt="Tshwane Sporting FC Logo" 
              className="h-12 w-12 mr-3" 
            />
            <h1 className="text-2xl font-bold">Tshwane Sporting FC</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="shadow-lg border-t-4 border-t-tsfc-green">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <Target className="h-12 w-12 text-tsfc-green animate-[bounce_2s_ease-in-out_infinite]" />
              </div>
              <CardTitle className="text-2xl text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-tsfc-green hover:bg-tsfc-green/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Button variant="link" className="p-0" onClick={() => navigate("/register")}>
                  Register now
                </Button>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                <p>Default admin: username "admin", password "admin123"</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <footer className="bg-tsfc-black text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Tshwane Sporting FC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export { exportUsersToCSV };
export default LoginPage;
