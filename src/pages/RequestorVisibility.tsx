import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Info, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const RequestorVisibility = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [visibilityPublic, setVisibilityPublic] = useState(true);
  const [visibilityVerifiedOnly, setVisibilityVerifiedOnly] = useState(true);
  const [visibilityShowContact, setVisibilityShowContact] = useState(true);
  const [visibilityLocationSharing, setVisibilityLocationSharing] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("blood_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load your requests",
          variant: "destructive",
        });
        return;
      }

      setRequests(data || []);
      if (data && data.length > 0) {
        setSelectedRequestId(data[0].id);
        setVisibilityPublic(data[0].visibility_public ?? true);
        setVisibilityVerifiedOnly(data[0].visibility_verified_only ?? true);
        setVisibilityShowContact(data[0].visibility_show_contact ?? true);
        setVisibilityLocationSharing(data[0].visibility_location_sharing ?? true);
      }
      
      setLoading(false);
    };

    fetchRequests();
  }, [navigate, toast]);

  const handleRequestChange = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequestId(requestId);
      setVisibilityPublic(request.visibility_public ?? true);
      setVisibilityVerifiedOnly(request.visibility_verified_only ?? true);
      setVisibilityShowContact(request.visibility_show_contact ?? true);
      setVisibilityLocationSharing(request.visibility_location_sharing ?? true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRequestId) {
      toast({
        title: "Error",
        description: "Please select a request",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("blood_requests")
      .update({
        visibility_public: visibilityPublic,
        visibility_verified_only: visibilityVerifiedOnly,
        visibility_show_contact: visibilityShowContact,
        visibility_location_sharing: visibilityLocationSharing,
      })
      .eq("id", selectedRequestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update visibility settings",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Visibility settings updated successfully",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold mb-4">No Requests Found</h1>
            <p className="text-muted-foreground mb-6">
              You need to create a blood request first before managing visibility settings.
            </p>
            <Button onClick={() => navigate("/request-blood")}>
              Create Blood Request
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
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
                <Eye className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Request Visibility</h1>
            <p className="text-xl text-muted-foreground">
              Control who can see and respond to your blood requests
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Visibility Settings</CardTitle>
              <CardDescription>Manage how your blood request appears to donors</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {requests.length > 1 && (
                  <div className="space-y-2">
                    <Label>Select Request</Label>
                    <Select value={selectedRequestId} onValueChange={handleRequestChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {requests.map((request) => (
                          <SelectItem key={request.id} value={request.id}>
                            {request.blood_type} - {request.hospital_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="public-visibility" className="text-base">
                        Public Visibility
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Make your request visible to all registered donors
                      </p>
                    </div>
                    <Switch 
                      id="public-visibility" 
                      checked={visibilityPublic}
                      onCheckedChange={setVisibilityPublic}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="verified-donors" className="text-base">
                        Verified Donors Only
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Only show to donors with verified profiles
                      </p>
                    </div>
                    <Switch 
                      id="verified-donors" 
                      checked={visibilityVerifiedOnly}
                      onCheckedChange={setVisibilityVerifiedOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="show-contact" className="text-base">
                        Show Contact Information
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Display your contact details to interested donors
                      </p>
                    </div>
                    <Switch 
                      id="show-contact" 
                      checked={visibilityShowContact}
                      onCheckedChange={setVisibilityShowContact}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="location-sharing" className="text-base">
                        Location Sharing
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Share hospital location with potential donors
                      </p>
                    </div>
                    <Switch 
                      id="location-sharing" 
                      checked={visibilityLocationSharing}
                      onCheckedChange={setVisibilityLocationSharing}
                    />
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg flex gap-3">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Increasing your visibility helps connect you with more potential donors. We recommend keeping all settings enabled for faster responses.
                  </p>
                </div>

                <Button type="submit" className="w-full" variant="hero" size="lg">
                  Save Visibility Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RequestorVisibility;
