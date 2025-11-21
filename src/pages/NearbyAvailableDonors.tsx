import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  AlertCircle,
  MapPin,
  Phone,
  Droplet,
  Navigation,
  Search,
  User,
  Heart,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const sb = supabase as any;
const RADIUS_KM = 40;
const EARTH_RADIUS_KM = 6371;

// Haversine formula to calculate distance between two coordinates
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

interface Donor {
  id: string;
  user_id: string;
  blood_type: string;
  city: string;
  latitude: number;
  longitude: number;
  is_available: boolean;
  last_donation_date?: string;
  donor_city?: string;
  donor_state?: string;
  donor_hospital_name?: string;
  willing_distance_km?: number;
  age?: number;
  weight?: number;
  availability_status?: string;
  visibility_show_contact?: boolean;
  contact_number?: string;
  user?: {
    user_metadata?: {
      full_name?: string;
    };
  };
  distance?: number;
}

export default function NearbyAvailableDonors() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [bloodTypeFilter, setBloodTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [map, setMap] = useState<any>(null);
  const markersRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);

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
        fillColor: "#FF0000",
        fillOpacity: 0.1,
        strokeColor: "#FF0000",
        strokeOpacity: 0.5,
        strokeWeight: 2,
      });
      circleRef.current = circle;
    };

    initMap();
  }, [userLocation]);

  // Load nearby donors
  useEffect(() => {
    const loadDonors = async () => {
      if (!userLocation) return;

      try {
        setLoading(true);
        const { data, error } = await sb
          .from("donors")
          .select("*")
          .eq("is_available", true);

        if (error) {
          console.error("Error fetching donors:", error);
          toast({
            title: "Error",
            description: "Failed to load nearby donors",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Fetch phone numbers from profiles
        const userIds = data.map((d: any) => d.user_id).filter(Boolean);
        let profilesById: Record<string, { phone?: string | null }> = {};

        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, phone")
            .in("id", userIds);

          if (profilesData) {
            profilesById = (profilesData as any[]).reduce((acc, p) => {
              acc[p.id] = { phone: p.phone ?? null };
              return acc;
            }, {} as Record<string, { phone?: string | null }>);
          }
        }

        // Calculate distance and filter
        const donorsWithDistance = data
          .map((donor: Donor) => {
            const userId = donor.user_id;
            const profile = userId ? profilesById[userId] : undefined;
            const contact = (donor as any).contact_number ?? profile?.phone ?? null;

            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              donor.latitude,
              donor.longitude
            );

            return {
              ...donor,
              contact_number: contact,
              distance,
            };
          })
          .filter((donor: Donor) => donor.distance! <= RADIUS_KM)
          .sort((a: Donor, b: Donor) => (a.distance || 0) - (b.distance || 0));

        setDonors(donorsWithDistance);
        setFilteredDonors(donorsWithDistance);

        // Add markers to map
        if (map) {
          markersRef.current.forEach((marker: any) => marker.setMap(null));
          markersRef.current = [];

          donorsWithDistance.forEach((donor: Donor) => {
            const marker = new (window as any).google.maps.Marker({
              position: { lat: donor.latitude, lng: donor.longitude },
              map: map,
              title: `${donor.blood_type} - ${donor.distance?.toFixed(1)}km`,
              icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            });
            markersRef.current.push(marker);
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading donors:", error);
        setLoading(false);
      }
    };

    loadDonors();
  }, [userLocation, map, toast]);

  // Filter and search
  useEffect(() => {
    let filtered = donors;

    if (bloodTypeFilter !== "all") {
      filtered = filtered.filter((d) => d.blood_type === bloodTypeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((d) =>
        d.donor_city?.toLowerCase().includes(query) ||
        d.blood_type.includes(query)
      );
    }

    setFilteredDonors(filtered);
  }, [bloodTypeFilter, searchQuery, donors]);

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
            <h1 className="text-4xl font-bold mb-4">Nearby Available Donors</h1>
            <p className="text-xl text-muted-foreground">
              Find blood donors within {RADIUS_KM}km of your location
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Donor Map
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
                    <Label htmlFor="search">Search City</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Enter city name..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      {filteredDonors.length} donor{filteredDonors.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Donors List */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Available Donors</h2>
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Loading donors...</p>
                </CardContent>
              </Card>
            ) : filteredDonors.length > 0 ? (
              <div className="grid gap-4">
                {filteredDonors.map((donor) => (
                  <Card key={donor.id} className="border-primary/20 hover:border-primary/40 transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Droplet className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-primary">{donor.blood_type}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {donor.distance?.toFixed(1)}km away
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                            {donor.donor_city && (
                              <div>
                                <p className="text-muted-foreground">City</p>
                                <p className="font-semibold">{donor.donor_city}</p>
                              </div>
                            )}
                            {donor.age && (
                              <div>
                                <p className="text-muted-foreground">Age</p>
                                <p className="font-semibold">{donor.age} years</p>
                              </div>
                            )}
                            {donor.donor_hospital_name && (
                              <div className="col-span-2">
                                <p className="text-muted-foreground">Hospital</p>
                                <p className="font-semibold">{donor.donor_hospital_name}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Contact Button - Fixed to open dialler */}
                        {donor.contact_number ? (
                          <a
                            href={`tel:${donor.contact_number}`}
                            className="no-underline"
                            aria-label={`Call ${donor.contact_number}`}
                          >
                            <Button className="gap-2">
                              <Phone className="w-4 h-4" />
                              Contact
                            </Button>
                          </a>
                        ) : (
                          <Button variant="outline" disabled className="gap-2">
                            <Phone className="w-4 h-4" />
                            No Contact
                          </Button>
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
                    No available donors found within {RADIUS_KM}km. Try adjusting your filters.
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
