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

/**
 * We will attach contact_number to the donor object at runtime (if available).
 */
type DonorWithContact = Donor & { contact_number?: string | null };

const NearbyDonations = () => {
  const [donors, setDonors] = useState<DonorWithContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState<DonorWithContact | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonorsAndProfiles = async () => {
      setLoading(true);
      try {
        // 1) fetch donors list (as you had originally)
        const { data: donorsData, error: donorsError } = await supabase
          .from("donors")
          .select("*")
          .eq("is_available", true)
          .eq("visibility_public", true)
          .order("created_at", { ascending: false });

        if (donorsError) throw donorsError;
        const donorsList = (donorsData as Donor[]) || [];

        // 2) if no donors, set empty and return
        if (!donorsList.length) {
          setDonors([]);
          return;
        }

        // 3) collect all user_ids from donors to fetch profiles in one query
        const userIds = donorsList
          .map((d) => (d as any).user_id)
          .filter(Boolean) as string[];

        let profilesById: Record<string, { phone?: string | null }> = {};

        if (userIds.length) {
          // fetch profiles where id IN (userIds)
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, phone")
            .in("id", userIds);

          if (profilesError) {
            // If profiles query fails due to RLS, we will still continue — donors will just have no phone fallback.
            console.warn("Could not fetch profiles (may be RLS policy):", profilesError);
          } else if (profilesData) {
            profilesById = (profilesData as any[]).reduce((acc, p) => {
              acc[p.id] = { phone: p.phone ?? null };
              return acc;
            }, {} as Record<string, { phone?: string | null }>);
          }
        }

        // 4) merge phone into donor objects as contact_number fallback
        const donorsWithContact: DonorWithContact[] = donorsList.map((d) => {
          const userId = (d as any).user_id;
          const profile = userId ? profilesById[userId] : undefined;
          // prefer donor.contact_number if your donors table has it; else fallback to profile.phone
          const contact =
            (d as any).contact_number ?? profile?.phone ?? null;
          return {
            ...d,
            contact_number: contact,
          };
        });

        setDonors(donorsWithContact);
      } catch (err: any) {
        console.error("Error fetching donors or profiles:", err);
        toast({
          title: "Error",
          description: err?.message ?? "Failed to load available donors",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDonorsAndProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              {donors.map((donor) => {
                const contactNumber = (donor as any).contact_number ?? null;

                return (
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

                          {/* Contact button opens phone dialer */}
                          {donor.visibility_show_contact && contactNumber ? (
                            <a
                              href={`tel:${contactNumber}`}
                              className="flex-1"
                              style={{ textDecoration: "none" }}
                              aria-label={`Call ${contactNumber}`}
                            >
                              <Button variant="outline" className="w-full">
                                <Phone className="w-4 h-4 mr-2" />
                                Contact
                              </Button>
                            </a>
                          ) : (
                            donor.visibility_show_contact && (
                              <Button variant="outline" className="flex-1" disabled>
                                <Phone className="w-4 h-4 mr-2" />
                                Contact
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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

                  {/* Contact shown in details if available */}
                  {( (selectedDonor as any).contact_number ) && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-semibold">{(selectedDonor as any).contact_number}</p>
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
