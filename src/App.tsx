import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GetStarted from "./pages/GetStarted";
import HospitalPending from "./pages/HospitalPending";
import RequestBlood from "./pages/RequestBlood";
import About from "./pages/About";
import NearbyRequests from "./pages/NearbyRequests";
import UpdateRequestStatus from "./pages/UpdateRequestStatus";
import RequestorVisibility from "./pages/RequestorVisibility";
import NearbyBloodRequests from "./pages/NearbyBloodRequests";
import RequestHistory from "./pages/RequestHistory";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import HospitalRegister from "./pages/HospitalRegister";
import HospitalRegisterSuccess from "./pages/HospitalRegisterSuccess";
import AdminHospitalsPending from "./pages/AdminHospitalsPending";
import HospitalDashboard from "./pages/HospitalDashboard";
import HospitalDash from "./pages/HospitalDash";
import HospitalDonorEligibility from "./pages/HospitalDonorEligibility";
import HospitalVerifyRequests from "./pages/HospitalVerifyRequests";
import HospitalRecordDonation from "./pages/HospitalRecordDonation";
import HospitalComplianceRecords from "./pages/HospitalComplianceRecords";





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
          <Route path="/hospital/register" element={<HospitalRegister />} />
          <Route path="/hospital/register/success" element={<HospitalRegisterSuccess />} />
          <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
          <Route path="/hospital/dash" element={<HospitalDash />} />
          <Route path="/hospital/verify-requests" element={<HospitalVerifyRequests />} />
          <Route path="/hospital/donor-eligibility" element={<HospitalDonorEligibility />} />
          <Route path="/hospital/record-donation" element={<HospitalRecordDonation />} />
          <Route path="/hospital/compliance-records" element={<HospitalComplianceRecords />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/hospital-pending" element={<HospitalPending />} />
          <Route path="/admin/hospitals/pending" element={<AdminHospitalsPending />} />
          <Route path="/request-blood" element={<RequestBlood />} />
          <Route path="/about" element={<About />} />
          <Route path="/nearby-requests" element={<NearbyRequests />} />
          <Route path="/update-request-status" element={<UpdateRequestStatus />} />
          <Route path="/requestor-visibility" element={<RequestorVisibility />} />
          <Route path="/nearby-blood-requests" element={<NearbyBloodRequests />} />
          <Route path="/request-history" element={<RequestHistory />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
