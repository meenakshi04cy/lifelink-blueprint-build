import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Calendar, Eye, MapPin, History, ArrowLeft, Phone, Check, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getAvailableHospitals } from "@/lib/supabase-hospitals";

interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  official_phone: string;
  latitude?: number;
  longitude?: number;
}

const RequestBlood = () => {
  const [bloodType, setBloodType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [hospitalLat, setHospitalLat] = useState<number | null>(null);
  const [hospitalLng, setHospitalLng] = useState<number | null>(null);
  const [visibility, setVisibility] = useState("public");
  const [consentShare, setConsentShare] = useState(false);
  const [consentDonorContact, setConsentDonorContact] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch available hospitals
  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const data = await getAvailableHospitals();
        setHospitals(data);
      } catch (error) {
        console.error("Error loading hospitals:", error);
        toast({
          title: "Error loading hospitals",
          description: "Please refresh the page",
          variant: "destructive",
        });
      }
    };
    loadHospitals();
  }, [toast]);

  // When hospital is selected, set coordinates
  useEffect(() => {
    if (selectedHospitalId) {
      const hospital = hospitals.find(h => h.id === selectedHospitalId);
      if (hospital) {
        setSelectedHospital(hospital);
        setHospitalLat(hospital.latitude || null);
        setHospitalLng(hospital.longitude || null);
      }
    }
  }, [selectedHospitalId, hospitals]);

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone.trim()) return false;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone.trim());
  };

  const handlePhoneChange = (value: string) => {
    setRecipientPhone(value);
    if (value.trim() && !validatePhoneNumber(value)) {
      setPhoneError("Please enter a valid phone number (e.g., +1 (555) 123-4567 or 9876543210)");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to request blood.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!selectedHospitalId) {
      toast({
        title: "Hospital required",
        description: "Please select a hospital.",
        variant: "destructive",
      });
      return;
    }

    if (!recipientPhone.trim()) {
      setPhoneError("Contact phone number is required");
      toast({
        title: "Validation Error",
        description: "Please provide a contact phone number",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhoneNumber(recipientPhone)) {
      setPhoneError("Please enter a valid phone number");
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number format",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);

      const basePayload: any = {
        user_id: user.id,
        recipient_name: recipientName || formData.get("contactPerson"),
        recipient_phone: recipientPhone,
        patient_name: formData.get("patientName") as string,
        blood_type: bloodType,
        units_needed: parseInt(formData.get("units") as string),
        hospital_id: selectedHospitalId,
        hospital_name: selectedHospital?.name,
        hospital_address: selectedHospital?.address,
        contact_number: selectedHospital?.official_phone,
        urgency_level: urgency,
        required_by: formData.get("requiredBy") as string,
        medical_reason: formData.get("reason") as string || null,
        request_visibility: visibility,
        hospital_preference: "preferred",
        consent_share_contact: consentShare,
        consent_donor_contact_hospital: consentDonorContact,
      };

      // Add hospital coordinates if available
      if (hospitalLat !== null && hospitalLng !== null) {
        basePayload.hospital_latitude = hospitalLat;
        basePayload.hospital_longitude = hospitalLng;
      }

      // Insert blood request
      let insertResult = await supabase.from("blood_requests").insert(basePayload);

      if (insertResult.error) {
        const msg = (insertResult.error.message || "").toLowerCase();
        const shouldRetry = msg.includes("column") && msg.includes("not found");

        if (shouldRetry) {
          const payloadNoCoords = { ...basePayload };
          delete payloadNoCoords.hospital_latitude;
          delete payloadNoCoords.hospital_longitude;
          insertResult = await supabase.from("blood_requests").insert(payloadNoCoords);
        }
      }

      if (insertResult.error) throw insertResult.error;

      toast({
        title: "Request submitted!",
        description: "Your blood request has been submitted successfully. Donors will see it soon.",
      });

      navigate("/request-history");
    } catch (error: any) {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Request Blood</h1>
            <p className="text-xl text-muted-foreground">
              Fill out this form and we'll connect you with available donors or blood banks
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Blood Request</CardTitle>
              <CardDescription>Provide accurate information for faster matching</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 border-b pb-6">
                  <h3 className="font-semibold text-lg">Patient Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientName">Patient Name</Label>
                      <Input id="patientName" name="patientName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientAge">Age</Label>
                      <Input id="patientAge" name="patientAge" type="number" min="0" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input id="contactPerson" name="contactPerson" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input id="contactEmail" name="contactEmail" type="email" required />
                  </div>
                </div>

                <div className="space-y-4 border-b pb-6">
                  <h3 className="font-semibold text-lg">Blood Requirement Details</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bloodType">Blood Type Required</Label>
                      <Select value={bloodType} onValueChange={setBloodType} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="units">Units Required</Label>
                      <Input id="units" name="units" type="number" min="1" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select value={urgency} onValueChange={setUrgency} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical (within 24 hours)</SelectItem>
                        <SelectItem value="urgent">Urgent (within 48 hours)</SelectItem>
                        <SelectItem value="normal">Normal (within a week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requiredBy">Required By Date</Label>
                    <Input id="requiredBy" name="requiredBy" type="date" required />
                  </div>
                </div>

                <div className="space-y-4 border-b pb-6">
                  <h3 className="font-semibold text-lg">Hospital Selection</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hospital">Select Hospital *</Label>
                    <Select value={selectedHospitalId} onValueChange={setSelectedHospitalId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a hospital" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitals.map((hospital) => (
                          <SelectItem key={hospital.id} value={hospital.id}>
                            {hospital.name} - {hospital.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Donors are encouraged to donate at this hospital. They can choose an alternate partner hospital if needed.
                    </p>
                  </div>

                  {selectedHospital && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Hospital Address</p>
                        <p className="font-semibold">{selectedHospital.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Phone</p>
                        <p className="font-semibold">{selectedHospital.official_phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 border-b pb-6">
                  <h3 className="font-semibold text-lg">Request Visibility & Consent</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Request Visibility</Label>
                    <Select value={visibility} onValueChange={setVisibility}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Visible to all donors</SelectItem>
                        <SelectItem value="nearby_only">Nearby Donors Only - Close donors only</SelectItem>
                        <SelectItem value="private">Private - Hospital staff only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="consentShare"
                        checked={consentShare}
                        onCheckedChange={(checked) => setConsentShare(checked as boolean)}
                      />
                      <Label htmlFor="consentShare" className="text-sm font-normal cursor-pointer">
                        Allow donors to contact me directly
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="consentDonor"
                        checked={consentDonorContact}
                        onCheckedChange={(checked) => setConsentDonorContact(checked as boolean)}
                      />
                      <Label htmlFor="consentDonor" className="text-sm font-normal cursor-pointer">
                        I understand donors may contact the hospital to arrange donation
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-b pb-6">
                  <h3 className="font-semibold text-lg">Recipient Contact Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name (or Anonymous ID)</Label>
                    <Input 
                      id="recipientName" 
                      name="recipientName"
                      placeholder="Name or Anon123"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipientPhone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>Contact Phone *</span>
                      {recipientPhone && validatePhoneNumber(recipientPhone) && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </Label>
                    <Input 
                      id="recipientPhone" 
                      name="recipientPhone" 
                      type="tel" 
                      required 
                      placeholder="e.g., +91 9876543210"
                      value={recipientPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={phoneError ? "border-red-500" : ""}
                    />
                    {phoneError && (
                      <p className="text-sm text-red-600">{phoneError}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Additional Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Transfusion (Optional)</Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      placeholder="E.g., surgery, accident, medical condition"
                      rows={3}
                    />
                  </div>

                  {/* Hospital Location Map Section - Removed */}
                </div>

                <Button type="submit" className="w-full" variant="hero" size="lg" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Blood Request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">Donor Benefits & Features</h2>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/update-request-status" className="block">
                  <div className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all p-6 h-full">
                    <div className="w-12 h-12 rounded-md bg-red-50 flex items-center justify-center mb-4">
                      <Calendar className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">Update Request Status</h3>
                    <p className="text-sm text-gray-500">
                      Keep your blood request updated to help donors respond effectively
                    </p>
                  </div>
                </Link>

                <Link to="/requestor-visibility" className="block">
                  <div className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all p-6 h-full">
                    <div className="w-12 h-12 rounded-md bg-red-50 flex items-center justify-center mb-4">
                      <Eye className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">Stay Visible</h3>
                    <p className="text-sm text-gray-500">
                       Control who can see and respond to your blood requests
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RequestBlood;