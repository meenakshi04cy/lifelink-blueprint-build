import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Droplet, Phone, Clock } from "lucide-react";

const NearbyDonations = () => {
  // Mock data - will be replaced with real data from backend
  const nearbyDonors = [
    {
      id: 1,
      bloodType: "O+",
      distance: "1.2 km",
      available: true,
      lastDonation: "3 months ago",
    },
    {
      id: 2,
      bloodType: "A+",
      distance: "2.5 km",
      available: true,
      lastDonation: "4 months ago",
    },
    {
      id: 3,
      bloodType: "B+",
      distance: "3.8 km",
      available: false,
      lastDonation: "1 month ago",
    },
  ];

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

          <div className="space-y-4">
            {nearbyDonors.map((donor) => (
              <Card key={donor.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-primary" />
                        Blood Type: {donor.bloodType}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {donor.distance} away
                      </CardDescription>
                    </div>
                    <Badge variant={donor.available ? "default" : "secondary"}>
                      {donor.available ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Last donation: {donor.lastDonation}
                    </div>
                    
                    {donor.available && (
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

          {nearbyDonors.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No donors found nearby. Try expanding your search radius.
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
