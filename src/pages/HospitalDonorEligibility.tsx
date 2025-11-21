import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
} from "lucide-react";

const sb = supabase as any;

export default function DonorEligibility() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hospital, setHospital] = useState<any>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  // Eligibility form fields
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [hemoglobin, setHemoglobin] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [eligibilityStatus, setEligibilityStatus] = useState<
    "eligible" | "ineligible"
  >("eligible");
  const [ineligibilityReason, setIneligibilityReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

      // Load pending verifications (for donors with pending status)
      const { data: donorData } = await sb
        .from("donor_verifications")
        .select("*")
        .eq("hospital_id", hospitalId)
        .eq("verification_status", "pending")
        .order("created_at", { ascending: false });

      setDonors(donorData || []);
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

  const handleVerify = async () => {
    if (!selectedDonor) return;

    // Validation
    if (!age || !weight || !bloodPressure || !hemoglobin) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required health fields",
        variant: "destructive",
      });
      return;
    }

    if (eligibilityStatus === "ineligible" && !ineligibilityReason) {
      toast({
        title: "Validation Error",
        description: "Please provide reason for ineligibility",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: user } = await sb.auth.getUser();
      const adminId = user?.user?.id;

      const updatePayload = {
        verification_status: eligibilityStatus,
        age: parseInt(age),
        weight: parseFloat(weight),
        blood_pressure: bloodPressure,
        hemoglobin: parseFloat(hemoglobin),
        medical_history: medicalHistory,
        ineligibility_reason:
          eligibilityStatus === "ineligible" ? ineligibilityReason : null,
        verified_at: new Date().toISOString(),
        verified_by: adminId,
      };

      const { error } = await sb
        .from("donor_verifications")
        .update(updatePayload)
        .eq("id", selectedDonor.id);

      if (error) throw error;

      toast({
        title: "✅ Donor Verified",
        description: `${selectedDonor.donor_name} marked as ${eligibilityStatus}`,
        variant: "default",
      });

      // Reload
      setSelectedDonor(null);
      setShowVerificationForm(false);
      resetForm();
      await loadData();
    } catch (err: any) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: err?.message ?? "Failed to verify donor",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAge("");
    setWeight("");
    setBloodPressure("");
    setHemoglobin("");
    setMedicalHistory("");
    setEligibilityStatus("eligible");
    setIneligibilityReason("");
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
              Donor Eligibility Verification
            </h1>
            <p className="text-gray-600">
              Screen donors for medical eligibility and health requirements
            </p>
          </div>

          {!selectedDonor ? (
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Donors Pending Verification (
                    {donors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {donors.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-600">
                        No donors pending verification
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {donors.map((donor) => (
                        <div
                          key={donor.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedDonor(donor)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {donor.donor_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Phone: {donor.donor_phone}
                              </p>
                              <p className="text-sm text-gray-600">
                                Blood Type: {donor.blood_type}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  donor.created_at
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

              {/* Requirements Info */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">
                    Eligibility Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-2">
                  <p>✓ Age: 18-65 years</p>
                  <p>✓ Weight: Minimum 50 kg (110 lbs)</p>
                  <p>✓ Blood Pressure: Systolic &lt; 180, Diastolic &lt; 100</p>
                  <p>✓ Hemoglobin: Men ≥ 13.5 g/dL, Women ≥ 12.5 g/dL</p>
                  <p>✓ No major medical conditions or medications</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {selectedDonor.donor_name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Blood Type: {selectedDonor.blood_type}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedDonor(null);
                      resetForm();
                    }}
                    variant="ghost"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!showVerificationForm ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3">
                        Donor Information
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Phone</p>
                          <p className="font-semibold">
                            {selectedDonor.donor_phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Email</p>
                          <p className="font-semibold">
                            {selectedDonor.donor_email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowVerificationForm(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      Start Health Screening
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="age">Age (years) *</Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="e.g., 25"
                          min="18"
                          max="65"
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight (kg) *</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="e.g., 70"
                          min="50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bp">Blood Pressure (e.g., 120/80) *</Label>
                        <Input
                          id="bp"
                          value={bloodPressure}
                          onChange={(e) => setBloodPressure(e.target.value)}
                          placeholder="e.g., 120/80"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hemoglobin">Hemoglobin (g/dL) *</Label>
                        <Input
                          id="hemoglobin"
                          type="number"
                          value={hemoglobin}
                          onChange={(e) => setHemoglobin(e.target.value)}
                          placeholder="e.g., 14.5"
                          step="0.1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="medicalHistory">
                        Medical History / Notes
                      </Label>
                      <Textarea
                        id="medicalHistory"
                        value={medicalHistory}
                        onChange={(e) => setMedicalHistory(e.target.value)}
                        placeholder="Any relevant medical conditions or medications..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="eligibility">Eligibility Status *</Label>
                      <Select
                        value={eligibilityStatus}
                        onValueChange={(v: any) => setEligibilityStatus(v)}
                      >
                        <SelectTrigger id="eligibility">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eligible">Eligible</SelectItem>
                          <SelectItem value="ineligible">Ineligible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {eligibilityStatus === "ineligible" && (
                      <div>
                        <Label htmlFor="reason">Reason for Ineligibility *</Label>
                        <Textarea
                          id="reason"
                          value={ineligibilityReason}
                          onChange={(e) => setIneligibilityReason(e.target.value)}
                          placeholder="Explain why donor is ineligible..."
                          rows={2}
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => {
                          setShowVerificationForm(false);
                          resetForm();
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleVerify}
                        disabled={submitting}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {submitting ? "Verifying..." : "✓ Verify Donor"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
