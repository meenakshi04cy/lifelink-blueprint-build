import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Droplet, AlertCircle, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const NearbyRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from("blood_requests")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (data) {
        setRequests(data);
      }
      setLoading(false);
    };

    fetchRequests();
  }, []);

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
            <div className="grid gap-6">
              {requests.map((request) => (
                <Card key={request.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">Patient: {request.patient_name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {request.hospital_name}
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
      </main>
      <Footer />
    </div>
  );
};

export default NearbyRequests;