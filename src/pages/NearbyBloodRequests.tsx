import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  MapPin,
  Droplet,
  Search,
  Heart,
  ArrowLeft,
  AlertTriangle,
  Clock,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createDonationConnection } from "@/lib/supabase-hospitals";

const sb = supabase as any;
const RADIUS_KM = 40;
const EARTH_RADIUS_KM = 6371;

// Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

interface BloodRequest {
  id: string;
  patient_name: string;
  blood_type: string;
  units_needed: number;
  urgency_level: string;
  hospital_latitude: number;
  hospital_longitude: number;
  description: string;
  status: string;
  created_at: string;
  contact_number?: string;
  distance?: number;
}

export default function NearbyBloodRequests() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [bloodTypeFilter, setBloodTypeFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [map, setMap] = useState<any>(null);
  const markersRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);
  const [donatingRequestId, setDonatingRequestId] = useState<string | null>(null);

  const handleDonateBlood = async (request: BloodRequest) => {
    try {
      setDonatingRequestId(request.id);
      
      // Get current user
      const { data: authData } = await sb.auth.getUser();
      if (!authData?.user?.id) {
        toast({
          title: "Not Logged In",
          description: "Please log in to express interest in donating.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const donorId = authData.user.id;

      // Get the blood request to find hospital
      const { data: bloodRequest, error: requestError } = await sb
        .from("blood_requests")
        .select("hospital_id")
        .eq("id", request.id)
        .single();

      if (requestError || !bloodRequest?.hospital_id) {
        throw new Error("Could not find hospital for this request");
      }

      const hospitalId = bloodRequest.hospital_id;

      // Create donation connection
      await createDonationConnection(donorId, request.id, hospitalId);

      toast({
        title: "✅ Interest Registered",
        description: "Your interest has been sent to the hospital. They will verify and contact you soon.",
      });
    } catch (err: any) {
      console.error("Error expressing interest:", err);
      toast({
        title: "Error",
        description: err?.message || "Could not register interest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDonatingRequestId(null);
    }
  };

  // Get user's current location
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            console.log("📍 User location:", latitude, longitude);
          },
          (error) => {
            console.error("Geolocation error:", error);
            toast({
              title: "Location Error",
              description: "Could not get your location. Please enable location services.",
              variant: "destructive",
            });
            setLoading(false);
          }
        );
      }
    };

    getLocation();
  }, [toast]);

  // Initialize Google Map
  useEffect(() => {
    if (!userLocation || !mapRef.current) return;

    const initMap = () => {
      const googleMap = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: userLocation.lat, lng: userLocation.lng },
        zoom: 13,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      setMap(googleMap);

      // Add user marker
      new (window as any).google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: googleMap,
        title: "Your Location",
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });

      // Add radius circle
      const circle = new (window as any).google.maps.Circle({
        center: { lat: userLocation.lat, lng: userLocation.lng },
        radius: RADIUS_KM * 1000, // Convert to meters
        map: googleMap,
        fillColor: "#00FF00",
        fillOpacity: 0.1,
        strokeColor: "#00FF00",
        strokeOpacity: 0.5,
        strokeWeight: 2,
      });
      circleRef.current = circle;
    };

    initMap();
  }, [userLocation]);

  // Load nearby requests
  useEffect(() => {
    const loadRequests = async () => {
      if (!userLocation) return;

      try {
        setLoading(true);
        const { data, error } = await sb
          .from("blood_requests")
          .select("*")
          .eq("status", "active");

        if (error) {
          console.error("Error fetching requests:", error);
          toast({
            title: "Error",
            description: "Failed to load nearby requests",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Calculate distance and filter
        const requestsWithDistance = data
          .map((request: BloodRequest) => {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              request.hospital_latitude,
              request.hospital_longitude
            );

            return {
              ...request,
              distance,
            };
          })
          .filter((request: BloodRequest) => request.distance! <= RADIUS_KM)
          .sort((a: BloodRequest, b: BloodRequest) => (a.distance || 0) - (b.distance || 0));

        setRequests(requestsWithDistance);
        setFilteredRequests(requestsWithDistance);

        // Add markers to map with urgency-based colors
        if (map) {
          markersRef.current.forEach((marker: any) => marker.setMap(null));
          markersRef.current = [];

          requestsWithDistance.forEach((request: BloodRequest) => {
            let markerColor = "yellow-dot.png"; // Default: routine
            if (request.urgency_level === "emergency") {
              markerColor = "red-dot.png"; // Emergency
            } else if (request.urgency_level === "urgent") {
              markerColor = "orange-dot.png"; // Urgent
            }

            const marker = new (window as any).google.maps.Marker({
              position: { lat: request.hospital_latitude, lng: request.hospital_longitude },
              map: map,
              title: `${request.blood_type} - ${request.urgency_level}`,
              icon: `http://maps.google.com/mapfiles/ms/icons/${markerColor}`,
            });
            markersRef.current.push(marker);
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading requests:", error);
        setLoading(false);
      }
    };

    loadRequests();
  }, [userLocation, map, toast]);

  // Filter and search
  useEffect(() => {
    let filtered = requests;

    if (bloodTypeFilter !== "all") {
      filtered = filtered.filter((r) => r.blood_type === bloodTypeFilter);
    }

    if (urgencyFilter !== "all") {
      filtered = filtered.filter((r) => r.urgency_level === urgencyFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((r) =>
        r.patient_name?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  }, [bloodTypeFilter, urgencyFilter, searchQuery, requests]);

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "destructive";
      case "urgent":
        return "default";
      default:
        return "secondary";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return <AlertTriangle className="w-4 h-4" />;
      case "urgent":
        return <Zap className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
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
            <h1 className="text-4xl font-bold mb-4">Nearby Blood Requests</h1>
            <p className="text-xl text-muted-foreground">
              Find active blood requests within {RADIUS_KM}km of your location
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Requests Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    ref={mapRef}
                    className="w-full h-96 rounded-lg border border-gray-300"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Filters Section */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="blood-type">Blood Type</Label>
                    <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                      <SelectTrigger id="blood-type">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Blood Types</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                      <SelectTrigger id="urgency">
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="emergency">🔴 Emergency</SelectItem>
                        <SelectItem value="urgent">🟠 Urgent</SelectItem>
                        <SelectItem value="routine">🟡 Routine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Patient name..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Requests List */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Active Requests</h2>
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Loading requests...</p>
                </CardContent>
              </Card>
            ) : filteredRequests.length > 0 ? (
              <div className="grid gap-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="border-primary/20 hover:border-primary/40 transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Droplet className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-primary">{request.blood_type}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {request.distance?.toFixed(1)}km away
                              </p>
                            </div>
                            <Badge variant={getUrgencyBadgeColor(request.urgency_level)} className="flex items-center gap-1">
                              {getUrgencyIcon(request.urgency_level)}
                              {request.urgency_level.charAt(0).toUpperCase() + request.urgency_level.slice(1)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Patient</p>
                              <p className="font-semibold">{request.patient_name}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Units Needed</p>
                              <p className="font-semibold">{request.units_needed}</p>
                            </div>
                          </div>

                          {request.description && (
                            <div className="mt-3 bg-muted p-3 rounded-lg">
                              <p className="text-sm">{request.description}</p>
                            </div>
                          )}
                        </div>

                        {/* Donate Button */}
                        <Button
                          size="lg"
                          className="gap-2 whitespace-nowrap bg-green-600 hover:bg-green-700"
                          onClick={() => handleDonateBlood(request)}
                          disabled={donatingRequestId === request.id}
                        >
                          <Heart className="w-4 h-4" />
                          {donatingRequestId === request.id ? "Registering..." : "Donate Blood"}
                        </Button>
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
                    No active blood requests found within {RADIUS_KM}km. Check back later!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
