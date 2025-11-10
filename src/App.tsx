import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BecomeDonor from "./pages/BecomeDonor";
import RequestBlood from "./pages/RequestBlood";
import About from "./pages/About";
import UpdateAvailability from "./pages/UpdateAvailability";
import DonorVisibility from "./pages/DonorVisibility";
import NearbyRequests from "./pages/NearbyRequests";
import DonationHistory from "./pages/DonationHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/become-donor" element={<BecomeDonor />} />
          <Route path="/request-blood" element={<RequestBlood />} />
          <Route path="/about" element={<About />} />
          <Route path="/update-availability" element={<UpdateAvailability />} />
          <Route path="/donor-visibility" element={<DonorVisibility />} />
          <Route path="/nearby-requests" element={<NearbyRequests />} />
          <Route path="/donation-history" element={<DonationHistory />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
