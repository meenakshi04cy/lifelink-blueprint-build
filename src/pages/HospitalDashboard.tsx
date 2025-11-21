import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Users, Droplet, Heart, CheckCircle, AlertCircle, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getHospitalDonationConnections, verifyDonationConnection } from "@/lib/supabase-hospitals";

const sb = supabase as any;

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hospitalData, setHospitalData] = useState<any>(null);
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);
  const [bloodDonors, setBloodDonors] = useState<any[]>([]);
  const [tab, setTab] = useState<"overview" | "requests" | "donors" | "acceptance">("overview");
  const [donationConnections, setDonationConnections] = useState<any[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const [showAcceptanceDialog, setShowAcceptanceDialog] = useState(false);
  const [acceptanceNotes, setAcceptanceNotes] = useState("");
  const [processingConnectionId, setProcessingConnectionId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await sb.auth.getUser();
        if (!data?.user) {
          navigate("/login");
          return;
        }

        // Check if user is hospital staff
        const userMeta = data.user.user_metadata;
        if (userMeta?.user_type !== "hospital_staff") {
          toast({
            title: "Access Denied",
            description: "You must be a hospital staff member",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        // Load hospital data
        const hospitalId = userMeta?.hospital_id;
        if (hospitalId) {
          const { data: hosp } = await sb
            .from("hospitals")
            .select("*")
            .eq("id", hospitalId)
            .single();
          
          if (hosp) {
            setHospitalData(hosp);
            await loadBloodRequests(hospitalId);
            await loadDonors(hospitalId);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Auth check error:", err);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loadBloodRequests = async (hospitalId: string) => {
    try {
      const { data } = await sb
        .from("blood_requests")
        .select("*")
        .eq("hospital_id", hospitalId)
        .order("created_at", { ascending: false });
      
      setBloodRequests(data || []);
    } catch (err) {
      console.error("Error loading requests:", err);
    }
  };

  const loadDonors = async (hospitalId: string) => {
    try {
      const { data } = await sb
        .from("blood_donors")
        .select("*")
        .eq("hospital_id", hospitalId)
        .order("created_at", { ascending: false });
      
      setBloodDonors(data || []);
    } catch (err) {
      console.error("Error loading donors:", err);
    }
  };

  const loadConnections = async (hospitalId: string) => {
    try {
      const connections = await getHospitalDonationConnections(hospitalId, "pending");
      setDonationConnections(connections);
    } catch (err) {
      console.error("Error loading connections:", err);
      toast({
        title: "Error",
        description: "Failed to load pending donations",
        variant: "destructive",
      });
    }
  };

  const handleAcceptConnection = async (connectionId: string, accept: boolean) => {
    try {
      setProcessingConnectionId(connectionId);
      const { data } = await sb.auth.getUser();
      
      if (!data?.user?.id) throw new Error("Not authenticated");

      await verifyDonationConnection(
        connectionId,
        accept,
        data.user.id,
        acceptanceNotes || undefined
      );

      toast({
        title: accept ? "✅ Donation Accepted" : "❌ Donation Rejected",
        description: accept
          ? "The donor will be notified about the acceptance."
          : "The donor will be notified about the rejection.",
      });

      // Refresh connections
      if (hospitalData?.id) {
        await loadConnections(hospitalData.id);
      }

      // Reset dialog
      setShowAcceptanceDialog(false);
      setAcceptanceNotes("");
      setSelectedConnection(null);
    } catch (err: any) {
      console.error("Error processing connection:", err);
      toast({
        title: "Error",
        description: err?.message || "Failed to process donation",
        variant: "destructive",
      });
    } finally {
      setProcessingConnectionId(null);
    }
  };

  const handleLogout = async () => {
    await sb.auth.signOut();
    navigate("/");
  };

  // Load connections when tab changes to acceptance
  useEffect(() => {
    if (tab === "acceptance" && hospitalData?.id) {
      loadConnections(hospitalData.id);
    }
  }, [tab, hospitalData?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container mx-auto">
            <p className="text-center text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hospitalData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">Hospital Not Found</CardTitle>
              </CardHeader>
              <CardContent className="text-red-600">
                <p>Your hospital account could not be loaded. Please contact support.</p>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{hospitalData.hospital_name}</h1>
              <p className="text-gray-600 mt-1">Hospital Management Dashboard</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="lg">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <Button
              variant={tab === "overview" ? "default" : "ghost"}
              onClick={() => setTab("overview")}
              className="rounded-b-none"
            >
              Overview
            </Button>
            <Button
              variant={tab === "requests" ? "default" : "ghost"}
              onClick={() => setTab("requests")}
              className="rounded-b-none"
            >
              <Heart className="w-4 h-4 mr-2" />
              Blood Requests
            </Button>
            <Button
              variant={tab === "donors" ? "default" : "ghost"}
              onClick={() => setTab("donors")}
              className="rounded-b-none"
            >
              <Droplet className="w-4 h-4 mr-2" />
              Blood Donors
            </Button>
            <Button
              variant={tab === "acceptance" ? "default" : "ghost"}
              onClick={() => setTab("acceptance")}
              className="rounded-b-none"
            >
              <Users className="w-4 h-4 mr-2" />
              Mutual Acceptance
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {tab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Heart className="w-5 h-5 text-red-500" />
                      Blood Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-gray-900">{bloodRequests.length}</p>
                    <p className="text-sm text-gray-600 mt-2">Active requests</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Droplet className="w-5 h-5 text-blue-500" />
                      Blood Donors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-gray-900">{bloodDonors.length}</p>
                    <p className="text-sm text-gray-600 mt-2">Registered donors</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Matches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-600 mt-2">Successful matches</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {tab === "requests" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Blood Requests</h2>
                  <Button>Add New Request</Button>
                </div>

                {bloodRequests.length === 0 ? (
                  <Card>
                    <CardContent className="pt-12 text-center text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No blood requests yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {bloodRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">{request.blood_type} Blood</p>
                              <p className="text-sm text-gray-600">Units needed: {request.units_needed}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Status: <span className="font-medium">{request.status}</span>
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "donors" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Blood Donors</h2>
                </div>

                {bloodDonors.length === 0 ? (
                  <Card>
                    <CardContent className="pt-12 text-center text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No blood donors registered</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {bloodDonors.map((donor) => (
                      <Card key={donor.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">{donor.name}</p>
                              <p className="text-sm text-gray-600">Blood Type: {donor.blood_type}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Last Donation: {donor.last_donation_date || "Never"}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "acceptance" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Pending Donor-Request Matches</h2>
                {donationConnections.length === 0 ? (
                  <Card>
                    <CardContent className="pt-12">
                      <div className="text-center">
                        <Heart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600 mb-4">
                          No pending donor matches yet. Donors will express interest when they see your blood requests.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {donationConnections.map((connection) => (
                      <Card key={connection.id} className="border-amber-200">
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Blood Request Info */}
                            <div className="space-y-2">
                              <h3 className="font-semibold text-gray-900">Blood Request</h3>
                              <p className="text-sm"><strong>Patient:</strong> {connection.blood_requests?.patient_name}</p>
                              <p className="text-sm"><strong>Blood Type:</strong> {connection.blood_requests?.blood_type}</p>
                              <p className="text-sm"><strong>Units Needed:</strong> {connection.blood_requests?.units_needed}</p>
                              <p className="text-sm"><strong>Urgency:</strong> <span className="font-medium">{connection.blood_requests?.urgency_level}</span></p>
                            </div>

                            {/* Actions */}
                            <div className="space-y-2">
                              <h3 className="font-semibold text-gray-900">Action Required</h3>
                              <p className="text-sm text-gray-600">Verify donor eligibility and accept or reject this match.</p>
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => {
                                    setSelectedConnection(connection);
                                    setShowAcceptanceDialog(true);
                                  }}
                                  disabled={processingConnectionId === connection.id}
                                >
                                  {processingConnectionId === connection.id ? "Processing..." : "Review"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Acceptance Dialog */}
                <Dialog open={showAcceptanceDialog} onOpenChange={setShowAcceptanceDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Verify Donor Match</DialogTitle>
                      <DialogDescription>
                        Accept or reject this donor for the blood request
                      </DialogDescription>
                    </DialogHeader>

                    {selectedConnection && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                          <h4 className="font-semibold text-blue-900">Blood Request</h4>
                          <p className="text-sm"><strong>Patient:</strong> {selectedConnection.blood_requests?.patient_name}</p>
                          <p className="text-sm"><strong>Blood Type:</strong> {selectedConnection.blood_requests?.blood_type}</p>
                          <p className="text-sm"><strong>Units:</strong> {selectedConnection.blood_requests?.units_needed}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Hospital Notes (Optional)</label>
                          <Textarea
                            placeholder="Add notes about acceptance/rejection..."
                            value={acceptanceNotes}
                            onChange={(e) => setAcceptanceNotes(e.target.value)}
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAcceptanceDialog(false);
                          setAcceptanceNotes("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleAcceptConnection(selectedConnection.id, false)}
                        disabled={processingConnectionId === selectedConnection?.id}
                      >
                        {processingConnectionId === selectedConnection?.id ? "Processing..." : "Reject"}
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAcceptConnection(selectedConnection.id, true)}
                        disabled={processingConnectionId === selectedConnection?.id}
                      >
                        {processingConnectionId === selectedConnection?.id ? "Processing..." : "Accept Donor"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
