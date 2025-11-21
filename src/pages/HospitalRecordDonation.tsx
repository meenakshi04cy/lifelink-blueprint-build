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
  Heart,
  FileText,
} from "lucide-react";

const sb = supabase as any;

export default function RecordDonation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hospital, setHospital] = useState<any>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [selectedDonor, setSelectedDonor] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [unitsCollected, setUnitsCollected] = useState("");
  const [collectionTime, setCollectionTime] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [complications, setComplications] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [records, setRecords] = useState<any[]>([]);

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

      // Load eligible donors
      const { data: donorData } = await sb
        .from("donor_verifications")
        .select("*")
        .eq("hospital_id", hospitalId)
        .eq("verification_status", "eligible")
        .order("created_at", { ascending: false });

      setDonors(donorData || []);

      // Load today's donation records
      const today = new Date().toISOString().split("T")[0];
      const { data: recordsData } = await sb
        .from("donations")
        .select("*")
        .eq("hospital_id", hospitalId)
        .gte("created_at", today + "T00:00:00")
        .order("created_at", { ascending: false });

      setRecords(recordsData || []);
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

  const handleRecordDonation = async () => {
    // Validation
    if (
      !selectedDonor ||
      !bloodType ||
      !unitsCollected ||
      !collectionTime ||
      !storageLocation
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: user } = await sb.auth.getUser();
      const hospitalId = user?.user?.user_metadata?.hospital_id;

      // Find donor info
      const donor = donors.find((d) => d.id === selectedDonor);

      const donationData = {
        hospital_id: hospitalId,
        donor_id: selectedDonor,
        donor_name: donor.donor_name,
        donor_phone: donor.donor_phone,
        blood_type: bloodType,
        units_collected: parseInt(unitsCollected),
        collection_datetime: new Date(collectionTime).toISOString(),
        storage_location: storageLocation,
        medical_notes: medicalNotes,
        complications: complications || null,
        status: "completed",
        created_at: new Date().toISOString(),
      };

      const { error } = await sb.from("donations").insert([donationData]);

      if (error) throw error;

      toast({
        title: "✅ Donation Recorded",
        description: `${donor.donor_name}'s donation recorded successfully`,
      });

      // Reset form
      setShowForm(false);
      resetForm();
      await loadData();
    } catch (err: any) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: err?.message ?? "Failed to record donation",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDonor("");
    setBloodType("");
    setUnitsCollected("");
    setCollectionTime("");
    setStorageLocation("");
    setMedicalNotes("");
    setComplications("");
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
              Record Blood Donation
            </h1>
            <p className="text-gray-600">
              Log donation details and storage information
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Form Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  {showForm ? "Recording New Donation" : "New Donation"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showForm ? (
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm">
                      Eligible donors available: {donors.length}
                    </p>
                    <Button
                      onClick={() => setShowForm(true)}
                      disabled={donors.length === 0}
                      className="w-full bg-red-600 hover:bg-red-700"
                      size="lg"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Start Recording Donation
                    </Button>
                    {donors.length === 0 && (
                      <p className="text-sm text-amber-600">
                        No eligible donors available. Please verify donors first.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="donor">Donor *</Label>
                      <Select value={selectedDonor} onValueChange={setSelectedDonor}>
                        <SelectTrigger id="donor">
                          <SelectValue placeholder="Select donor" />
                        </SelectTrigger>
                        <SelectContent>
                          {donors.map((donor) => (
                            <SelectItem key={donor.id} value={donor.id}>
                              {donor.donor_name} ({donor.blood_type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bloodType">Blood Type *</Label>
                        <Input
                          id="bloodType"
                          value={bloodType}
                          onChange={(e) => setBloodType(e.target.value)}
                          placeholder="e.g., O+"
                        />
                      </div>
                      <div>
                        <Label htmlFor="units">Units Collected *</Label>
                        <Input
                          id="units"
                          type="number"
                          value={unitsCollected}
                          onChange={(e) => setUnitsCollected(e.target.value)}
                          placeholder="e.g., 1"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="time">Collection Date & Time *</Label>
                      <Input
                        id="time"
                        type="datetime-local"
                        value={collectionTime}
                        onChange={(e) => setCollectionTime(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="storage">Storage Location *</Label>
                      <Select value={storageLocation} onValueChange={setStorageLocation}>
                        <SelectTrigger id="storage">
                          <SelectValue placeholder="Select storage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main-fridge">Main Blood Bank Fridge</SelectItem>
                          <SelectItem value="backup-fridge">Backup Fridge</SelectItem>
                          <SelectItem value="freezer">Deep Freezer</SelectItem>
                          <SelectItem value="special">Special Storage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="notes">Medical Notes</Label>
                      <Textarea
                        id="notes"
                        value={medicalNotes}
                        onChange={(e) => setMedicalNotes(e.target.value)}
                        placeholder="Any relevant medical details..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="complications">Complications / Adverse Events</Label>
                      <Textarea
                        id="complications"
                        value={complications}
                        onChange={(e) => setComplications(e.target.value)}
                        placeholder="Leave blank if none"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => {
                          setShowForm(false);
                          resetForm();
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRecordDonation}
                        disabled={submitting}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        {submitting ? "Recording..." : "✓ Record Donation"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Today's Donations ({records.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">No donations recorded today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className="border rounded-lg p-4 bg-red-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {record.donor_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {record.blood_type} - {record.units_collected} unit
                              {record.units_collected > 1 ? "s" : ""}
                            </p>
                            <p className="text-sm text-gray-600">
                              Storage: {record.storage_location}
                            </p>
                            {record.complications && (
                              <p className="text-sm text-red-600 font-semibold mt-1">
                                ⚠️ {record.complications}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(
                                record.collection_datetime
                              ).toLocaleTimeString()}
                            </p>
                            <p className="text-xs font-semibold text-green-600 mt-1">
                              ✓ Recorded
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Storage Guidelines */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Storage Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-800 space-y-2">
                <p>• Whole Blood: 1-6°C, up to 42 days</p>
                <p>• Red Blood Cells: 1-6°C, up to 42 days</p>
                <p>• Platelets: 20-24°C, up to 5 days</p>
                <p>• Fresh Frozen Plasma: ≤-18°C, up to 1 year</p>
                <p>• Record batch numbers for traceability</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
