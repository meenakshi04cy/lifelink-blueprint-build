import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  CheckCircle,
  Users,
  Droplet,
  FileText,
  Clock,
  AlertCircle,
  LogOut,
} from "lucide-react";

const sb = supabase as any;

export default function HospitalDash() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    verifiedDonors: 0,
    completedDonations: 0,
    pendingVerifications: 0,
  });

  useEffect(() => {
    checkAuthAndLoadHospital();
  }, []);

  const checkAuthAndLoadHospital = async () => {
    try {
      const { data: userData } = await sb.auth.getUser();
      if (!userData?.user) {
        navigate("/login");
        return;
      }

      setUser(userData.user);

      // Get hospital info
      const hospitalId = userData.user.user_metadata?.hospital_id;
      if (!hospitalId) {
        toast({
          title: "Error",
          description: "Hospital information not found",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const { data: hospitalData, error: hospitalError } = await sb
        .from("hospitals")
        .select("*")
        .eq("id", hospitalId)
        .single();

      if (hospitalError) throw hospitalError;
      setHospital(hospitalData);

      // Load stats
      await loadStats(hospitalId);
    } catch (err: any) {
      console.error("Error:", err);
      toast({
        title: "Error loading hospital data",
        description: err?.message ?? "Please try again",
        variant: "destructive",
      });
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (hospitalId: string) => {
    try {
      // Load pending requests
      const { data: requests } = await sb
        .from("blood_requests")
        .select("*", { count: "exact" })
        .eq("hospital_id", hospitalId)
        .eq("status", "pending");

      // Load verified donors
      const { data: donors } = await sb
        .from("donor_verifications")
        .select("*", { count: "exact" })
        .eq("hospital_id", hospitalId)
        .eq("verification_status", "eligible");

      // Load completed donations
      const { data: donations } = await sb
        .from("donations")
        .select("*", { count: "exact" })
        .eq("hospital_id", hospitalId)
        .eq("status", "completed");

      // Load pending verifications
      const { data: pending } = await sb
        .from("donor_verifications")
        .select("*", { count: "exact" })
        .eq("hospital_id", hospitalId)
        .eq("verification_status", "pending");

      setStats({
        pendingRequests: requests?.length || 0,
        verifiedDonors: donors?.length || 0,
        completedDonations: donations?.length || 0,
        pendingVerifications: pending?.length || 0,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const handleLogout = async () => {
    await sb.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <p className="text-gray-600">Loading hospital dashboard...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="container mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">Access Denied</CardTitle>
              </CardHeader>
              <CardContent className="text-red-600">
                <p>Hospital information not found. Please contact support.</p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {hospital.name}
              </h1>
              <p className="text-gray-600">
                {hospital.city}, {hospital.state} • {hospital.type}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Logged in as: {user?.email}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      PENDING REQUESTS
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.pendingRequests}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      PENDING VERIFICATIONS
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.pendingVerifications}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      VERIFIED DONORS
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.verifiedDonors}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      DONATIONS COMPLETED
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.completedDonations}
                    </p>
                  </div>
                  <Droplet className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Verify Blood Requests */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader
                onClick={() => navigate("/hospital/verify-requests")}
              >
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Verify Blood Requests
                </CardTitle>
              </CardHeader>
              <CardContent onClick={() => navigate("/hospital/verify-requests")}>
                <p className="text-gray-600 text-sm mb-4">
                  Review and verify incoming blood requests to ensure they are
                  legitimate and not fraudulent.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <p className="text-sm font-semibold text-amber-900">
                    {stats.pendingRequests} pending verification
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/hospital/verify-requests")}
                  className="w-full mt-4"
                  variant="outline"
                >
                  Review Requests →
                </Button>
              </CardContent>
            </Card>

            {/* Donor Eligibility */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader
                onClick={() => navigate("/hospital/donor-eligibility")}
              >
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-blue-500" />
                  Donor Eligibility Verification
                </CardTitle>
              </CardHeader>
              <CardContent
                onClick={() => navigate("/hospital/donor-eligibility")}
              >
                <p className="text-gray-600 text-sm mb-4">
                  Verify donor medical eligibility through health screening to
                  ensure safe blood collection.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm font-semibold text-blue-900">
                    {stats.pendingVerifications} donors awaiting screening
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/hospital/donor-eligibility")}
                  className="w-full mt-4"
                  variant="outline"
                >
                  Screen Donors →
                </Button>
              </CardContent>
            </Card>

            {/* Record Donations */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader
                onClick={() => navigate("/hospital/record-donation")}
              >
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Droplet className="w-5 h-5 text-red-500" />
                  Record Blood Donation
                </CardTitle>
              </CardHeader>
              <CardContent
                onClick={() => navigate("/hospital/record-donation")}
              >
                <p className="text-gray-600 text-sm mb-4">
                  Record blood donations with medical details, blood type,
                  units collected, and storage information.
                </p>
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm font-semibold text-red-900">
                    Maintain accurate donation records
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/hospital/record-donation")}
                  className="w-full mt-4"
                  variant="outline"
                >
                  Record Donation →
                </Button>
              </CardContent>
            </Card>

            {/* Compliance & Records */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader
                onClick={() => navigate("/hospital/compliance-records")}
              >
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-green-500" />
                  Compliance & Records
                </CardTitle>
              </CardHeader>
              <CardContent
                onClick={() => navigate("/hospital/compliance-records")}
              >
                <p className="text-gray-600 text-sm mb-4">
                  View donation history, medical standards compliance, storage
                  protocols, and generate reports.
                </p>
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm font-semibold text-green-900">
                    {stats.completedDonations} donations on record
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/hospital/compliance-records")}
                  className="w-full mt-4"
                  variant="outline"
                >
                  View Records →
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Banner */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">
                Legal Responsibility Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>
                    You are legally responsible for verifying donor eligibility
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Blood handling must follow medical standards and regulations
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>
                    All records must be maintained for compliance and audit
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Blood donations must occur at your hospital facility only
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
