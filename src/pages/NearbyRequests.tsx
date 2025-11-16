import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Clock, Droplet, AlertCircle, Phone, X, Navigation, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import EntityMap from "@/components/EntityMap";
import { useNavigate } from "react-router-dom";

interface BloodRequest {
  id: string;
  patient_name: string;
  hospital_name: string;
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
}

const NearbyRequests = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const navigate = useNavigate();

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
              {/* Hospital Map Section */}
              {selectedRequest.hospital_latitude && selectedRequest.hospital_longitude && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Hospital Location
                  </h3>
                  <EntityMap
                    latitude={selectedRequest.hospital_latitude}
                    longitude={selectedRequest.hospital_longitude}
                    hospitalName={selectedRequest.hospital_name}
                    address={selectedRequest.hospital_address || ""}
                    height="h-64"
                  />
                </div>
              )}


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