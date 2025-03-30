
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReactNode, useState } from "react";
import { UserContext, UserProvider } from "./contexts/UserContext";
import LoginPage from "./pages/LoginPage";
import RegisterUserPage from "./pages/RegisterUserPage";
import Dashboard from "./pages/Dashboard";
import PlayersPage from "./pages/PlayersPage";
import PlayerDetailsPage from "./pages/PlayerDetailsPage";
import EditPlayerPage from "./pages/EditPlayerPage";
import RegisterPlayerPage from "./pages/RegisterPlayerPage";
import ClubPhotosPage from "./pages/ClubPhotosPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

// Create the query client outside of the component function
const queryClient = new QueryClient();

// Ensure App is properly defined as a function component
function App(): ReactNode {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterUserPage />} />
              <Route element={<ProtectedRoute allowedRoles={["admin", "user"]} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/players" element={<PlayersPage />} />
                <Route path="/players/:id" element={<PlayerDetailsPage />} />
                <Route path="/photos" element={<ClubPhotosPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/register-player" element={<RegisterPlayerPage />} />
                <Route path="/players/:id/edit" element={<EditPlayerPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
