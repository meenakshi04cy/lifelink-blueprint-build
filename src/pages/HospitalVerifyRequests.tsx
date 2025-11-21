import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileText,
  Droplet,
} from "lucide-react";

const sb = supabase as any;

export default function VerifyRequests() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hospital, setHospital] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: userData } = await sb.auth.getUser();
      if (!userData?.user) {
        navigate("/login");
        return;
      }

      const hospitalId = userData.user.user_metadata?.hospital_id;
      if (!hospitalId) throw new Error("Hospital not found");

      // Load hospital
      const { data: hospitalData } = await sb
        .from("hospitals")
        .select("*")
        .eq("id", hospitalId)
        .single();
      setHospital(hospitalData);

      // Load pending blood requests for this hospital
      const { data: requestsData } = await sb
        .from("blood_requests")
        .select("*")
        .eq("hospital_id", hospitalId)
        .eq("request_status", "pending")
        .order("created_at", { ascending: false });

      setRequests(requestsData || []);
    } catch (err: any) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: err?.message ?? "Failed to load data",
        variant: "destructive",
      });
      navigate("/hospital/dash");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRequest = async (verified: boolean) => {
    if (!selectedRequest) return;

    setVerifying(true);

    try {
      const { data: user } = await sb.auth.getUser();
      const adminId = user?.user?.id;

      const updatePayload = {
        verification_status: verified ? "verified" : "rejected",
        verified_at: new Date().toISOString(),
        verified_by: adminId,
        verification_notes: verificationNotes,
        request_status: verified ? "active" : "cancelled",
      };

      const { error } = await sb
        .from("blood_requests")
        .update(updatePayload)
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: verified ? "✅ Request Verified" : "❌ Request Rejected",
        description: `Blood request has been ${
          verified ? "verified as legitimate" : "rejected"
        }`,
      });

      // Reload
      setSelectedRequest(null);
      setVerificationNotes("");
      await loadData();
    } catch (err: any) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: err?.message ?? "Failed to verify request",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <p className="text-gray-600">Loading...</p>
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
          <div className="mb-8">
            <Button
              onClick={() => navigate("/hospital/dash")}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Blood Requests
            </h1>
            <p className="text-gray-600">
              Review and verify that blood requests are legitimate
            </p>
          </div>

          {!selectedRequest ? (
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Pending Verification ({requests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {requests.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-600">
                        No pending blood requests to verify
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requests.map((req) => (
                        <div
                          key={req.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Droplet className="w-4 h-4 text-red-500" />
                                <p className="font-semibold text-gray-900">
                                  {req.blood_type} - {req.units_needed} units
                                </p>
                              </div>
                              <p className="text-sm text-gray-600">
                                Patient: {req.patient_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Requestor: {req.requestor_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Phone: {req.requestor_phone}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  req.created_at
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-xs font-semibold text-amber-600 mt-1">
                                Pending
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Verification Checklist */}
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">
                    Verification Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-amber-800 space-y-2">
                  <p>□ Verify patient name matches hospital records</p>
                  <p>□ Check urgency level (emergency vs routine)</p>
                  <p>□ Confirm blood type requirement</p>
                  <p>□ Validate requestor contact information</p>
                  <p>□ Ensure units requested are reasonable</p>
                  <p>□ Check for duplicate or repeat requests</p>
                  <p>□ Verify medical indication is appropriate</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-red-500" />
                        {selectedRequest.blood_type} -{" "}
                        {selectedRequest.units_needed} units
                      </div>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Patient: {selectedRequest.patient_name}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedRequest(null);
                      setVerificationNotes("");
                    }}
                    variant="ghost"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Patient Name</p>
                    <p className="font-semibold">
                      {selectedRequest.patient_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Blood Type</p>
                    <p className="font-semibold">{selectedRequest.blood_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Units Needed</p>
                    <p className="font-semibold">
                      {selectedRequest.units_needed} units
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Urgency</p>
                    <p className="font-semibold capitalize">
                      {selectedRequest.urgency_level}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Medical Indication</p>
                    <p className="font-semibold">
                      {selectedRequest.medical_indication}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded p-4 space-y-3 border border-blue-200">
                  <div>
                    <p className="text-sm text-gray-600">Requestor Name</p>
                    <p className="font-semibold">
                      {selectedRequest.requestor_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Requestor Contact</p>
                    <p className="font-semibold">
                      {selectedRequest.requestor_phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Doctor/Physician</p>
                    <p className="font-semibold">
                      {selectedRequest.physician_name || "Not provided"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Verification Notes
                  </label>
                  <Textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Document your verification findings and any concerns..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setSelectedRequest(null);
                      setVerificationNotes("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleVerifyRequest(false)}
                    disabled={verifying}
                    variant="destructive"
                    className="flex-1"
                  >
                    {verifying ? "Processing..." : "❌ Reject"}
                  </Button>
                  <Button
                    onClick={() => handleVerifyRequest(true)}
                    disabled={verifying}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {verifying ? "Processing..." : "✓ Verify"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
