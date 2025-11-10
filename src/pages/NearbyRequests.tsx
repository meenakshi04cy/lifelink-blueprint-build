import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Droplet, Phone } from "lucide-react";

const NearbyRequests = () => {
  const requests = [
    {
      id: 1,
      patientName: "John D.",
      bloodType: "O+",
      units: 2,
      urgency: "Critical",
      hospital: "City General Hospital",
      distance: "2.3 km",
      time: "15 mins ago",
    },
    {
      id: 2,
      patientName: "Sarah M.",
      bloodType: "A+",
      units: 3,
      urgency: "Urgent",
      hospital: "Central Medical Center",
      distance: "4.7 km",
      time: "1 hour ago",
    },
    {
      id: 3,
      patientName: "Robert K.",
      bloodType: "B+",
      units: 1,
      urgency: "Moderate",
      hospital: "St. Mary's Hospital",
      distance: "6.2 km",
      time: "3 hours ago",
    },
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Critical":
        return "destructive";
      case "Urgent":
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

          <div className="grid gap-6">
            {requests.map((request) => (
              <Card key={request.id} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">Patient: {request.patientName}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {request.hospital} • {request.distance} away
                      </CardDescription>
                    </div>
                    <Badge variant={getUrgencyColor(request.urgency)}>
                      {request.urgency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Blood Type</p>
                        <p className="font-semibold text-lg">{request.bloodType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplet className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Units Needed</p>
                        <p className="font-semibold text-lg">{request.units} units</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Posted</p>
                        <p className="font-semibold">{request.time}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1" variant="hero">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Hospital
                    </Button>
                    <Button className="flex-1" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Search Filters</CardTitle>
              <CardDescription>Refine your search to find matching requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Filter options will be available here to search by blood type, urgency level, and distance.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NearbyRequests;
