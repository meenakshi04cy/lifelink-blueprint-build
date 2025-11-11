import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Check, Clock, Droplet } from "lucide-react";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const UpdateAvailability = () => {
  const [availability, setAvailability] = useState("Available Now");
  const [loading, setLoading] = useState(false);
  const [donor, setDonor] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonor = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data } = await supabase
        .from("donors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setDonor(data);
        setAvailability(data.availability_status);
      }
    };

    fetchDonor();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donor) {
      toast({
        title: "No donor profile found",
        description: "Please register as a donor first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("donors")
        .update({
          availability_status: availability,
          is_available: availability === "Available Now",
        })
        .eq("id", donor.id);

      if (error) throw error;

      toast({
        title: "Availability updated!",
        description: "Your availability has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
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
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Update Your Availability</h1>
            <p className="text-xl text-muted-foreground">
              Let hospitals know when you're ready to donate blood again
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
              <CardDescription>Update your donation availability status</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <RadioGroup value={availability} onValueChange={setAvailability}>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="Available Now" id="available" />
                    <Label htmlFor="available" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="font-semibold">Available Now</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        I'm ready to donate and can be contacted by hospitals
                      </p>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="Available Soon" id="soon" />
                    <Label htmlFor="soon" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="font-semibold">Available Soon</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        I'll be available to donate within the next 2 weeks
                      </p>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="Currently Unavailable" id="unavailable" />
                    <Label htmlFor="unavailable" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-5 h-5 text-red-600" />
                        <span className="font-semibold">Currently Unavailable</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        I recently donated or cannot donate at this time
                      </p>
                    </Label>
                  </div>
                </RadioGroup>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Updating..." : "Update Availability"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {donor && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Last Donation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">
                    {donor.last_donation_date 
                      ? new Date(donor.last_donation_date).toLocaleDateString()
                      : "No record"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your last blood donation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Next Available</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">{availability}</p>
                  <p className="text-sm text-muted-foreground">
                    Current availability status
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UpdateAvailability;
