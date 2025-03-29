
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReactNode, useState } from "react";
import { UserContext } from "./contexts/UserContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import PlayersPage from "./pages/PlayersPage";
import PlayerDetailsPage from "./pages/PlayerDetailsPage";
import RegisterPlayerPage from "./pages/RegisterPlayerPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

// Create the query client outside of the component function
const queryClient = new QueryClient();

// Ensure App is properly defined as a function component
function App(): ReactNode {
  const [user, setUser] = useState<{ username: string; role: "admin" | "user" | null }>(
    localStorage.getItem("user") 
      ? JSON.parse(localStorage.getItem("user") as string)
      : { username: "", role: null }
  );

  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={{ user, setUser }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={user.role ? <Dashboard /> : <LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute allowedRoles={["admin", "user"]} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/players" element={<PlayersPage />} />
                <Route path="/players/:id" element={<PlayerDetailsPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/register-player" element={<RegisterPlayerPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
