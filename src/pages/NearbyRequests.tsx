import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Clock, Droplet, AlertCircle, Phone, X, Navigation, ArrowLeft, Heart, Building2, Zap, Map } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createDonationConnection, createDonationCommitment, getPartnerHospitals } from "@/lib/supabase-hospitals";
import { useNavigate } from "react-router-dom";
import { calculateDistance, formatDistance } from "@/lib/distance";
import BloodRequestMap from "@/components/BloodRequestMap";

interface BloodRequest {
  id: string;
  patient_name: string;
  hospital_name: string;
  hospital_id?: string;
  hospital_address?: string;
  hospital_latitude?: number;
  hospital_longitude?: number;
  urgency_level: string;
  blood_type: string;
  units_needed: number;
  required_by: string;
  status: string;
  created_at: string;
  contact_number?: string;
  contact_email?: string;
  notes?: string;
  request_visibility?: string;
  distance?: number;
}

interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  official_phone: string;
  latitude?: number;
  longitude?: number;
}

const NearbyRequests = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [donatingRequestId, setDonatingRequestId] = useState<string | null>(null);
  const [processingDonation, setProcessingDonation] = useState(false);
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [showMapView, setShowMapView] = useState(false);
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

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        // Try to get user's saved location from profile
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("latitude, longitude")
            .eq("id", user.id)
            .single();

          if (data && data.latitude && data.longitude) {
            console.log("User location from profile:", data.latitude, data.longitude);
            setUserLatitude(data.latitude);
            setUserLongitude(data.longitude);
            return;
          }
        }

        // Fallback to geolocation API
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log("User location from geolocation API:", position.coords.latitude, position.coords.longitude);
              setUserLatitude(position.coords.latitude);
              setUserLongitude(position.coords.longitude);
            },
            (error) => {
              console.log("Geolocation error:", error);
            }
          );
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
      }
    };

    fetchUserLocation();
  }, [user]);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from("blood_requests")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching requests:", error);
        setLoading(false);
        return;
      }

      if (data) {
        console.log("Total requests fetched:", data.length);
        console.log("Sample request with location data:", {
          patient_name: data[0]?.patient_name,
          hospital_latitude: data[0]?.hospital_latitude,
          hospital_longitude: data[0]?.hospital_longitude,
          hospital_name: data[0]?.hospital_name
        });

        // Calculate distances if user location is available
        const requestsWithDistance = data.map((request) => {
          const hasUserLocation = userLatitude && userLongitude;
          const hasHospitalLocation = request.hospital_latitude && request.hospital_longitude;
          
          if (hasUserLocation && hasHospitalLocation) {
            const distance = calculateDistance(
              userLatitude,
              userLongitude,
              request.hospital_latitude,
              request.hospital_longitude
            );
            console.log(`Distance for ${request.patient_name}: ${distance.toFixed(2)} km`);
            return { ...request, distance };
          }
          
          if (!hasUserLocation) {
            console.warn("User location not available");
          }
          if (!hasHospitalLocation) {
            console.warn(`Hospital location missing for ${request.patient_name}`);
          }
          
          return request;
        });

        // Sort by distance (closest first)
        const sortedRequests = requestsWithDistance.sort((a, b) => {
          // If both have distances, sort by distance ascending (closest first)
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          // If only one has distance, put it first
          if (a.distance !== undefined) return -1;
          if (b.distance !== undefined) return 1;
          // Otherwise, maintain original order
          return 0;
        });

        console.log("Final sorted requests:", sortedRequests.map(r => ({ 
          patient_name: r.patient_name, 
          distance: r.distance 
        })));

        setRequests(sortedRequests);
      }
      setLoading(false);
    };

    fetchRequests();
  }, [userLatitude, userLongitude]);

  const handleDonateBlood = async (request: BloodRequest) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to donate blood.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setSelectedRequest(request);
    setProcessingDonation(true);
    setDonatingRequestId(request.id);

    try {
      // Get or create donor profile
      let donor;
      const { data: existingDonor, error: donorError } = await supabase
        .from("donors")
        .select("id, user_id")
        .eq("user_id", user.id)
        .single();

      if (existingDonor) {
        donor = existingDonor;
      } else {
        // Create a new donor profile if it doesn't exist
        const { data: newDonor, error: createError } = await supabase
          .from("donors")
          .insert([{ 
            user_id: user.id,
            blood_type: "O+",  // Default value, can be updated in profile
            age: 18,           // Default minimum age, can be updated in profile
            weight: 60         // Default value in kg, can be updated in profile
          }])
          .select()
          .single();

        if (createError) {
          console.error("Donor creation error:", createError);
          throw new Error(`Failed to create donor profile: ${createError.message}`);
        }
        
        if (!newDonor) {
          throw new Error("Failed to create donor profile: No data returned");
        }
        donor = newDonor;
      }

      // Directly create donation commitment to the requested hospital
      const commitment = await createDonationCommitment(
        donor.id,
        request.id,
        request.hospital_id || "",
        request.hospital_id || "",
        false,
        ""
      );

      toast({
        title: "Donation registered!",
        description: `You've committed to donate at ${request.hospital_name}.`,
      });
    } catch (error: any) {
      console.error("Full donation error:", error);
      toast({
        title: "Error registering donation",
        description: error.message || "Failed to register your donation.",
        variant: "destructive",
      });
    } finally {
      setProcessingDonation(false);
      setDonatingRequestId(null);
    }
  };



  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "destructive";
      case "urgent":
        return "default";
      default:
        return "secondary";
    }
  };

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
            <h1 className="text-4xl font-bold mb-4">Nearby Blood Requests</h1>
            <p className="text-xl text-muted-foreground">
              Real-time blood requests near your location
            </p>
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading requests...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* View Toggle */}
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => setShowMapView(false)}
                  variant={!showMapView ? "default" : "outline"}
                  className="gap-2"
                >
                  List View
                </Button>
                <Button
                  onClick={() => setShowMapView(true)}
                  variant={showMapView ? "default" : "outline"}
                  className="gap-2"
                >
                  <Map className="w-4 h-4" />
                  Map View
                </Button>
              </div>

              {/* Map View */}
              {showMapView && userLatitude && userLongitude ? (
                <div>
                  {(() => {
                    const filteredRequests = requests.filter(r => r.hospital_latitude && r.hospital_longitude);
                    console.log("Requests with coordinates:", filteredRequests.length);
                    console.log("Sample filtered request:", filteredRequests[0]);
                    
                    return (
                      <BloodRequestMap
                        userLocation={{ latitude: userLatitude, longitude: userLongitude }}
                        hospitals={filteredRequests.map((request) => ({
                          lat: request.hospital_latitude!,
                          lng: request.hospital_longitude!,
                          name: request.hospital_name,
                          type: "hospital" as const,
                          bloodType: request.blood_type,
                          urgency: request.urgency_level,
                          distance: request.distance || 0,
                          units: request.units_needed,
                          onClick: () => {
                            setSelectedRequest(request);
                            setShowDetailsDialog(true);
                          },
                        }))}
                        radius={50}
                      />
                    );
                  })()}
                </div>
              ) : showMapView ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Location not available. Please enable location permissions.
                  </CardContent>
                </Card>
              ) : null}

              {/* List View */}
              {!showMapView && (
              <div className="grid gap-6">
              {requests.map((request) => (
                <Card key={request.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">Patient: {request.patient_name}</CardTitle>
                        <CardDescription className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {request.hospital_name}
                          </div>
                          {request.distance && (
                            <div className="flex items-center gap-2 text-sm text-primary font-medium">
                              <Zap className="w-4 h-4" />
                              {formatDistance(request.distance)} away
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant={getUrgencyColor(request.urgency_level)}>
                        {request.urgency_level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Blood Type</p>
                          <p className="font-semibold text-lg">{request.blood_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Units Needed</p>
                          <p className="font-semibold text-lg">{request.units_needed} units</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Required By</p>
                          <p className="font-semibold">{new Date(request.required_by).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleDonateBlood(request)}
                        disabled={processingDonation && donatingRequestId === request.id}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        {processingDonation && donatingRequestId === request.id ? "Registering..." : "Donate Blood"}
                      </Button>
                      <Button 
                        className="flex-1" 
                        variant="hero"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowContactDialog(true);
                        }}
                        disabled={!request.contact_number}
                        title={request.contact_number ? "Click to call the hospital" : "No phone number available"}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Contact Hospital
                      </Button>
                      <Button 
                        className="flex-1" 
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsDialog(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {requests.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No active blood requests at the moment.
                    </p>
                  </CardContent>
                </Card>
              )}
              </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Contact Hospital Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Hospital</DialogTitle>
            <DialogDescription>
              Reach out to {selectedRequest?.hospital_name} for this blood request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Hospital</p>
                  <p className="font-semibold">{selectedRequest.hospital_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-semibold">{selectedRequest.patient_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Type Needed</p>
                  <p className="font-semibold text-lg text-primary">{selectedRequest.blood_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">
                    {selectedRequest.contact_number || "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold break-all">
                    {selectedRequest.contact_email || "Not available"}
                  </p>
                </div>
              </div>
              <Button 
                className="w-full" 
                variant="hero"
                onClick={() => {
                  if (selectedRequest.contact_number) {
                    window.location.href = `tel:${selectedRequest.contact_number}`;
                  } else {
                    alert('Phone number not available for this hospital');
                  }
                }}
                disabled={!selectedRequest.contact_number}
              >
                <Phone className="w-4 h-4 mr-2" />
                {selectedRequest.contact_number ? 'Call Hospital' : 'No Phone Available'}
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => setShowContactDialog(false)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details & Hospital Location</DialogTitle>
            <DialogDescription>
              Complete information about this blood request and hospital directions
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Hospital Map Section - Removed */}

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Request Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Blood Type</p>
                    <p className="font-semibold text-lg text-primary">{selectedRequest.blood_type}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Units Needed</p>
                    <p className="font-semibold text-lg">{selectedRequest.units_needed}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Urgency</p>
                    <Badge variant={selectedRequest.urgency_level === "critical" ? "destructive" : "default"} className="mt-1">
                      {selectedRequest.urgency_level}
                    </Badge>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant="outline" className="mt-1">{selectedRequest.status}</Badge>
                  </div>
                </div>
              </div>

              {/* Hospital & Patient Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Hospital & Patient Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Patient Name</p>
                    <p className="font-semibold">{selectedRequest.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hospital</p>
                    <p className="font-semibold">{selectedRequest.hospital_name}</p>
                  </div>
                  {selectedRequest.hospital_address && (
                    <div>
                      <p className="text-sm text-muted-foreground">Hospital Address</p>
                      <p className="font-semibold">{selectedRequest.hospital_address}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Required By</p>
                    <p className="font-semibold">
                      {new Date(selectedRequest.required_by).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {selectedRequest.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="font-semibold">{selectedRequest.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  variant="hero"
                  onClick={() => {
                    setShowDetailsDialog(false);
                    setShowContactDialog(true);
                  }}
                  disabled={!selectedRequest.contact_number}
                  title={selectedRequest.contact_number ? "Click to call the hospital" : "No phone number available"}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {selectedRequest.contact_number ? 'Contact Hospital' : 'No Phone'}
                </Button>
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => setShowDetailsDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default NearbyRequests;