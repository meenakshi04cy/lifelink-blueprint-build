import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar, Eye, MapPin, History, ArrowLeft, Phone, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EntityMap from "@/components/EntityMap";
import { geocodeAddress } from "@/lib/geocoding";

const RequestBlood = () => {
  const [bloodType, setBloodType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hospitalLat, setHospitalLat] = useState<number | null>(null);
  const [hospitalLng, setHospitalLng] = useState<number | null>(null);
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [hospitalAddressInput, setHospitalAddressInput] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [contactPhone, setContactPhone] = useState("");
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

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone.trim()) return false;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone.trim());
  };

  const handlePhoneChange = (value: string) => {
    setContactPhone(value);
    if (value.trim() && !validatePhoneNumber(value)) {
      setPhoneError("Please enter a valid phone number (e.g., +1 (555) 123-4567 or 9876543210)");
    } else {
      setPhoneError("");
    }
  };


  // Geocode hospital address when all details are filled
  useEffect(() => {
    const geocodeHospital = async () => {
      if (hospitalAddressInput && city && state && zip && hospitalName) {
        try {
          const result = await geocodeAddress(hospitalAddressInput, city, state, zip);
          if (result) {
            setHospitalLat(result.latitude);
            setHospitalLng(result.longitude);
            setHospitalAddress(result.formattedAddress || hospitalAddressInput);
          }
        } catch (error) {
          console.error("Geocoding error:", error);
        }
      }
    };

    geocodeHospital();
  }, [hospitalName, hospitalAddressInput, city, state, zip]);

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

    // Validate hospital contact phone
    if (!contactPhone.trim()) {
      setPhoneError("Hospital contact phone number is required");
      toast({
        title: "Validation Error",
        description: "Please provide a hospital contact phone number",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhoneNumber(contactPhone)) {
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
        patient_name: formData.get("patientName") as string,
        blood_type: bloodType,
        units_needed: parseInt(formData.get("units") as string),
        hospital_name: hospitalName,
        hospital_address: `${hospitalAddressInput}, ${city}, ${state} ${zip}`,
        contact_number: contactPhone,
        urgency_level: urgency,
        required_by: formData.get("requiredBy") as string,
        medical_reason: formData.get("reason") as string || null,
      };

      // include coordinates if we have them locally
      if (hospitalLat !== null && hospitalLng !== null) {
        basePayload.hospital_latitude = hospitalLat;
        basePayload.hospital_longitude = hospitalLng;
      }

      // First attempt: try inserting with coordinates (if present)
      let insertResult = await supabase.from("blood_requests").insert(basePayload);

      // If DB complains about unknown columns (migration not applied), retry without lat/lng
      if (insertResult.error) {
        const msg = (insertResult.error.message || "").toLowerCase();
        const shouldRetryWithoutCoords = msg.includes("hospital_latitude") || msg.includes("hospital_longitude") || msg.includes("column") && msg.includes("not found");

        if (shouldRetryWithoutCoords && (basePayload.hospital_latitude || basePayload.hospital_longitude)) {
          // remove the coords and retry
          const payloadNoCoords = { ...basePayload };
          delete payloadNoCoords.hospital_latitude;
          delete payloadNoCoords.hospital_longitude;

          insertResult = await supabase.from("blood_requests").insert(payloadNoCoords);
        }
      }

      if (insertResult.error) throw insertResult.error;

      toast({
        title: "Request submitted!",
        description: "Your blood request has been submitted successfully.",
      });

      navigate("/");
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

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Hospital Information</h3>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Please provide an accurate hospital contact phone number. Donors will use this to reach the hospital about the blood request.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hospital">Hospital Name</Label>
                    <Input 
                      id="hospital" 
                      name="hospital" 
                      required 
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalAddress">Hospital Address</Label>
                    <Input 
                      id="hospitalAddress" 
                      name="hospitalAddress" 
                      required 
                      value={hospitalAddressInput}
                      onChange={(e) => setHospitalAddressInput(e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        required 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        name="state" 
                        required 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input 
                        id="zip" 
                        name="zip" 
                        required 
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>Hospital Contact Phone *</span>
                      {contactPhone && validatePhoneNumber(contactPhone) && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </Label>
                    <Input 
                      id="contactPhone" 
                      name="contactPhone" 
                      type="tel" 
                      required 
                      placeholder="e.g., +1 (555) 123-4567 or 9876543210"
                      value={contactPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={phoneError ? "border-red-500" : ""}
                    />
                    {phoneError && (
                      <p className="text-sm text-red-600">{phoneError}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Donors will use this number to contact the hospital about the blood request
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Transfusion (Optional)</Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      placeholder="E.g., surgery, accident, medical condition"
                      rows={3}
                    />
                  </div>

                  {/* Hospital Location Map Section */}
                  {(hospitalLat && hospitalLng) && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Hospital Location Map
                      </h3>
                      <EntityMap
                        latitude={hospitalLat}
                        longitude={hospitalLng}
                        hospitalName={hospitalName}
                        address={hospitalAddress}
                        height="h-80"
                      />
                    </div>
                  )}
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

                <Link to="/nearby-donations" className="block">
                  <div className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all p-6 h-full">
                    <div className="w-12 h-12 rounded-md bg-red-50 flex items-center justify-center mb-4">
                      <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">View Nearby Donations</h3>
                    <p className="text-sm text-gray-500">
                      Find and connect with available blood donors near your location
                    </p>
                  </div>
                </Link>

                <Link to="/request-history" className="block">
                  <div className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all p-6 h-full">
                    <div className="w-12 h-12 rounded-md bg-red-50 flex items-center justify-center mb-4">
                      <History className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">Track Request History</h3>
                    <p className="text-sm text-gray-500">
                      Keep a record of all your requests and their outcomes
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