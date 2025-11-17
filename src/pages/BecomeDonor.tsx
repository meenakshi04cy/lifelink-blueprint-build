import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Calendar, MapPin, Activity, TrendingUp, ArrowLeft, Navigation } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BecomeDonor = () => {
  const [bloodType, setBloodType] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hospitalName, setHospitalName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [distance, setDistance] = useState("25");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to register as a donor.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      // Check if user is already registered as a donor
      const { data: existingDonor, error: checkError } = await supabase
        .from("donors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing donor:", checkError);
        throw new Error("Failed to verify donor status. Please try again.");
      }

      if (existingDonor) {
        toast({
          title: "Already Registered",
          description: "You are already registered as a donor. Redirecting to your profile...",
          variant: "destructive",
        });
        navigate("/profile");
        return;
      }

      const formData = new FormData(e.target as HTMLFormElement);
      const ageString = formData.get("age") as string;
      const age = parseInt(ageString);
      
      // Validate required fields
      if (!ageString || isNaN(age) || age < 18 || age > 65) {
        throw new Error("Please enter a valid age between 18 and 65");
      }
      if (!bloodType) {
        throw new Error("Please select a blood type");
      }
      if (!weight) {
        throw new Error("Please enter your weight");
      }
      if (parseFloat(weight) < 50) {
        throw new Error("Weight must be at least 50 kg");
      }
      if (!hospitalName) {
        throw new Error("Please enter a hospital name");
      }
      if (!city) {
        throw new Error("Please enter your city");
      }
      if (!state) {
        throw new Error("Please enter your state");
      }

      // Prepare the data object
      const donorData = {
        user_id: user.id,
        blood_type: bloodType,
        age,
        weight: parseFloat(weight),
        last_donation_date: formData.get("lastDonation") as string || null,
        medical_conditions: formData.get("medicalConditions") as string || null,
        donor_hospital_name: hospitalName,
        donor_city: city,
        donor_state: state,
        willing_distance_km: parseInt(distance),
      };

      try {
        const { error } = await supabase.from("donors").insert(donorData).select();
        if (error) throw error;
      } catch (error) {
        console.error("Supabase error, saving locally:", error);
      }
      
      // Save to localStorage array
      const existing = JSON.parse(localStorage.getItem("donors") || "[]");
      const updated = [donorData, ...existing];
      localStorage.setItem("donors", JSON.stringify(updated));

      toast({
        title: "Registered successfully",
        description: "You are now registered as a blood donor.",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred. Please try again.",
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
                <Heart className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Become a Blood Donor</h1>
            <p className="text-xl text-muted-foreground">
              Thank you for choosing to save lives. Please fill out the registration form below.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Donor Registration</CardTitle>
              <CardDescription>All fields are required unless marked optional</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" name="age" type="number" min="18" max="65" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
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
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" name="weight" type="number" min="50" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastDonation">Last Donation Date (Optional)</Label>
                    <Input id="lastDonation" name="lastDonation" type="date" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">Medical Conditions (Optional)</Label>
                  <Input id="medicalConditions" name="medicalConditions" placeholder="List any medical conditions" />
                </div>

                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Location & Availability
                  </h3>

                  <Alert className="bg-blue-50 border-blue-200">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Help hospitals find you by sharing your location and how far you're willing to travel
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hospital">Hospital / Health Center Name</Label>
                      <Input 
                        id="hospital" 
                        placeholder="Where do you usually donate?" 
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        placeholder="Your city" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State / Province</Label>
                      <Input 
                        id="state" 
                        placeholder="Your state" 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="distance">Willing to Travel (km)</Label>
                      <Select value={distance} onValueChange={setDistance} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select distance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 km</SelectItem>
                          <SelectItem value="10">10 km</SelectItem>
                          <SelectItem value="15">15 km</SelectItem>
                          <SelectItem value="25">25 km</SelectItem>
                          <SelectItem value="50">50 km</SelectItem>
                          <SelectItem value="100">100 km</SelectItem>
                          <SelectItem value="200">200+ km</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold text-lg">Health Screening</h3>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox id="health1" required />
                    <Label htmlFor="health1" className="text-sm leading-relaxed cursor-pointer">
                      I am in good health and feeling well today
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="health2" required />
                    <Label htmlFor="health2" className="text-sm leading-relaxed cursor-pointer">
                      I have not donated blood in the last 3 months
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="health3" required />
                    <Label htmlFor="health3" className="text-sm leading-relaxed cursor-pointer">
                      I do not have any chronic illnesses (diabetes, heart disease, etc.)
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      I agree to the terms and conditions and consent to blood donation
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full" variant="hero" size="lg" disabled={loading}>
                  {loading ? "Registering..." : "Register as Donor"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Donor Benefits & Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link to="/update-availability">
                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <Calendar className="w-12 h-12 text-primary mb-4" />
                    <CardTitle className="text-lg">Update Availability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Let hospitals know when you're ready to donate again. Set your availability status anytime.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/donor-visibility">
                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <Activity className="w-12 h-12 text-primary mb-4" />
                    <CardTitle className="text-lg">Stay Visible</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Stay visible to those who need you. Your profile helps hospitals match urgent requests.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/nearby-requests">
                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <MapPin className="w-12 h-12 text-primary mb-4" />
                    <CardTitle className="text-lg">View Nearby Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      See real-time blood requests near your location and connect with patients easily.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/donation-history">
                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <TrendingUp className="w-12 h-12 text-primary mb-4" />
                    <CardTitle className="text-lg">Track Donation History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Keep a record of your donations and see how many lives you've helped save.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BecomeDonor;