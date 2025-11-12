import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Droplet, Phone, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Donor = Database["public"]["Tables"]["donors"]["Row"];

const NearbyDonations = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const { data, error } = await supabase
          .from("donors")
          .select("*")
          .eq("is_available", true)
          .eq("visibility_public", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDonors(data || []);
      } catch (error) {
        console.error("Error fetching donors:", error);
        toast({
          title: "Error",
          description: "Failed to load available donors",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Nearby Available Donors</h1>
            <p className="text-xl text-muted-foreground">
              Find and connect with available blood donors near your location
            </p>
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading available donors...</p>
              </CardContent>
            </Card>
          ) : donors.length > 0 ? (
            <div className="space-y-4">
              {donors.map((donor) => (
                <Card key={donor.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Droplet className="w-5 h-5 text-primary" />
                          Blood Type: {donor.blood_type}
                        </CardTitle>
                        <CardDescription>
                          {donor.availability_status}
                        </CardDescription>
                      </div>
                      <Badge variant="default">Available</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {donor.last_donation_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          Last donation: {new Date(donor.last_donation_date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {donor.visibility_show_contact && (
                        <div className="flex gap-2">
                          <Button variant="hero" className="flex-1">
                            <Phone className="w-4 h-4 mr-2" />
                            Contact Donor
                          </Button>
                          <Button variant="outline" className="flex-1">
                            View Profile
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No available donors found at this time. Check back later!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NearbyDonations;
