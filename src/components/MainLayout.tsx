
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { 
  Users, UserPlus, LayoutDashboard, LogOut, FileSpreadsheet, 
  Menu, X, Facebook, Camera, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { exportUsersToCSV } from "../pages/LoginPage";
import { toast } from "@/hooks/use-toast";

type MainLayoutProps = {
  children: React.ReactNode;
  title: string;
};

const MainLayout = ({ children, title }: MainLayoutProps) => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser({ username: "", role: null });
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-tsfc-green text-white shadow-md">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleSidebar} 
              className="md:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/ffa38254-5486-435a-bf4a-46cdd763335b.png" 
                alt="Tshwane Sporting FC Logo" 
                className="h-10 w-10 mr-2" 
              />
              <h1 className="text-xl font-bold hidden sm:inline-block">Tshwane Sporting FC</h1>
              <span className="text-xl font-bold sm:hidden">TSFC</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="hidden md:inline">Welcome, {user.username}</span>
            <span className="bg-white text-tsfc-green px-2 py-1 rounded text-xs uppercase font-bold">
              {user.role}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="text-white border-white hover:bg-white hover:text-tsfc-green"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className={`
          ${sidebarOpen ? 'fixed inset-0 z-50 bg-black/50' : 'hidden'} md:relative md:block
          transition-all duration-300 ease-in-out
        `}>
          <div className={`
            bg-white w-64 shadow-lg min-h-screen md:min-h-0 md:h-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            transition-transform duration-300 ease-in-out
          `}>
            <div className="flex flex-col h-full">
              <div className="p-4 border-b md:hidden">
                <button onClick={toggleSidebar} className="ml-auto block">
                  <X size={24} />
                </button>
              </div>
              <div className="py-6 px-4 flex-1">
                <nav className="space-y-1">
                  <Link 
                    to="/dashboard" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-tsfc-green hover:text-white rounded-md transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <LayoutDashboard className="mr-3 h-5 w-5" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/players" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-tsfc-green hover:text-white rounded-md transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Users className="mr-3 h-5 w-5" />
                    Players
                  </Link>
                  <Link 
                    to="/coaching-staff" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-tsfc-green hover:text-white rounded-md transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Award className="mr-3 h-5 w-5" />
                    Coaching Staff
                  </Link>
                  <Link 
                    to="/photos" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-tsfc-green hover:text-white rounded-md transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Camera className="mr-3 h-5 w-5" />
                    Club Photos
                  </Link>
                  {user.role === "admin" && (
                    <Link 
                      to="/register-player" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-tsfc-green hover:text-white rounded-md transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <UserPlus className="mr-3 h-5 w-5" />
                      Register Player
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <a 
                      href="#" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-tsfc-green hover:text-white rounded-md transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        const { exportToCSV } = require('../hooks/usePlayerData');
                        exportToCSV();
                        setSidebarOpen(false);
                      }}
                    >
                      <FileSpreadsheet className="mr-3 h-5 w-5" />
                      Export Players to CSV
                    </a>
                  )}
                  {user.role === "admin" && (
                    <a 
                      href="#" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-tsfc-green hover:text-white rounded-md transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        exportUsersToCSV();
                        toast({
                          title: "Export successful",
                          description: "User login details exported to CSV"
                        });
                        setSidebarOpen(false);
                      }}
                    >
                      <FileSpreadsheet className="mr-3 h-5 w-5" />
                      Export Users to CSV
                    </a>
                  )}
                </nav>
              </div>
              <div className="p-4 border-t">
                <a 
                  href="https://web.facebook.com/p/Tshwane-Sporting-FC-100085997681102/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 text-tsfc-green hover:underline"
                >
                  <Facebook className="mr-2 h-5 w-5" />
                  Follow us on Facebook
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="container mx-auto py-6 px-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            </div>
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-tsfc-black text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Tshwane Sporting FC. All rights reserved.</p>
          <p className="text-sm mt-1">Founded in 2020 at the SAPS Training college by Coach Jomo</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
