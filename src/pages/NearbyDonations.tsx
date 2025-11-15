import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Droplet, Phone, Clock, Navigation, Heart, Zap, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type Donor = Database["public"]["Tables"]["donors"]["Row"];

const NearbyDonations = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
                <Card key={donor.id} className="border-primary/20 hover:border-primary/40 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Droplet className="w-5 h-5 text-primary" />
                          Blood Type: <span className="text-primary font-bold">{donor.blood_type}</span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {donor.donor_city}{donor.donor_state ? `, ${donor.donor_state}` : ""}
                        </CardDescription>
                      </div>
                      <Badge variant="default" className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        Available
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Hospital & Location Info */}
                      <div className="bg-muted p-3 rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                          <Navigation className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">Donation Location</p>
                            <p className="font-semibold">{donor.donor_hospital_name || "Not specified"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Zap className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">Willing to Travel</p>
                            <p className="font-semibold">{donor.willing_distance_km} km</p>
                          </div>
                        </div>
                      </div>

                      {/* Last Donation & Status */}
                      <div className="grid grid-cols-2 gap-2">
                        {donor.last_donation_date && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span className="truncate">Last: {new Date(donor.last_donation_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {donor.availability_status && (
                          <div className="text-sm text-muted-foreground truncate">
                            {donor.availability_status}
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          variant="hero" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedDonor(donor);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        {donor.visibility_show_contact && (
                          <Button variant="outline" className="flex-1">
                            <Phone className="w-4 h-4 mr-2" />
                            Contact
                          </Button>
                        )}
                      </div>
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

        {/* Donor Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Donor Details
              </DialogTitle>
              <DialogDescription>
                Complete information about this available donor
              </DialogDescription>
            </DialogHeader>
            {selectedDonor && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  {/* Blood Type */}
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Type</p>
                    <p className="font-semibold text-lg text-primary">{selectedDonor.blood_type}</p>
                  </div>

                  {/* Location Information */}
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground mb-2">Donation Location</p>
                    <div className="space-y-1">
                      <p className="font-semibold">{selectedDonor.donor_hospital_name || "Not specified"}</p>
                      <p className="text-sm">
                        {selectedDonor.donor_city}{selectedDonor.donor_state ? `, ${selectedDonor.donor_state}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Distance Information */}
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground">Willing to Travel</p>
                    <p className="font-semibold">{selectedDonor.willing_distance_km} km</p>
                  </div>

                  {/* Donor Health Info */}
                  <div className="border-t pt-3 space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-semibold">{selectedDonor.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Weight</p>
                      <p className="font-semibold">{selectedDonor.weight} kg</p>
                    </div>
                  </div>

                  {/* Last Donation */}
                  {selectedDonor.last_donation_date && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground">Last Donation</p>
                      <p className="font-semibold">{new Date(selectedDonor.last_donation_date).toLocaleDateString()}</p>
                    </div>
                  )}

                  {/* Status */}
                  {selectedDonor.availability_status && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-semibold">{selectedDonor.availability_status}</p>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  variant="hero"
                  onClick={() => setShowDetailsDialog(false)}
                >
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default NearbyDonations;
