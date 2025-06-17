import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import Index from "./pages/Index";
import MovieDetails from "./pages/MovieDetails";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { AuthProvider } from './providers/AuthProvider';
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import AdminFilmes from "./pages/AdminFilmes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/filmes" element={<Index />} />
            <Route path="/filmes/:id" element={<MovieDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/usuarios" element={<AdminUsers />} />
            <Route path="/admin/filmes" element={<AdminFilmes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
