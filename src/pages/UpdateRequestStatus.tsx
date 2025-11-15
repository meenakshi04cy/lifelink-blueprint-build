import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Info, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type BloodRequest = Database["public"]["Tables"]["blood_requests"]["Row"];

const UpdateRequestStatus = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [urgencyLevel, setUrgencyLevel] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
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

        if (error) throw error;
        
        setRequests(data || []);
        if (data && data.length > 0) {
          setSelectedRequestId(data[0].id);
          setStatus(data[0].status || "active");
          setUrgencyLevel(data[0].urgency_level);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast({
          title: "Error",
          description: "Failed to load your blood requests",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate, toast]);

  const handleRequestChange = (requestId: string) => {
    setSelectedRequestId(requestId);
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setStatus(request.status || "active");
      setUrgencyLevel(request.urgency_level);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRequestId) {
      toast({
        title: "Error",
        description: "Please select a request to update",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const updateData: Database["public"]["Tables"]["blood_requests"]["Update"] = {
        status,
        urgency_level: urgencyLevel,
      };

      if (notes.trim()) {
        updateData.medical_reason = notes;
      }

      const { error } = await supabase
        .from("blood_requests")
        .update(updateData)
        .eq("id", selectedRequestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Request status updated successfully",
      });

      // Refresh the requests list
      const { data } = await supabase
        .from("blood_requests")
        .select("*")
        .eq("id", selectedRequestId)
        .single();

      if (data) {
        setRequests(requests.map(r => r.id === selectedRequestId ? data : r));
      }
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
                <Calendar className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Update Request Status</h1>
            <p className="text-xl text-muted-foreground">
              Keep your blood request updated to help donors respond effectively
            </p>
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading your requests...</p>
              </CardContent>
            </Card>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  You don't have any blood requests yet.
                </p>
                <Button variant="hero" onClick={() => navigate("/request-blood")}>
                  Create Blood Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Request Status Management</CardTitle>
                <CardDescription>Update the status of your blood request</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="request">Select Request</Label>
                    <Select value={selectedRequestId} onValueChange={handleRequestChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a request" />
                      </SelectTrigger>
                      <SelectContent>
                        {requests.map((request) => (
                          <SelectItem key={request.id} value={request.id}>
                            {request.blood_type} - {request.patient_name} ({new Date(request.created_at!).toLocaleDateString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Request Status</Label>
                    <Select value={status} onValueChange={setStatus} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active - Still Needed</SelectItem>
                        <SelectItem value="fulfilled">Fulfilled - Blood Received</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="postponed">Postponed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select value={urgencyLevel} onValueChange={setUrgencyLevel} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Update urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical (within 24 hours)</SelectItem>
                        <SelectItem value="urgent">Urgent (within 48 hours)</SelectItem>
                        <SelectItem value="normal">Normal (within a week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Update details about your request status..."
                      rows={4}
                    />
                  </div>

                  <div className="bg-muted p-4 rounded-lg flex gap-3">
                    <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Keeping your request status updated helps donors know if you still need blood and allows others to prioritize their donations effectively.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" variant="hero" size="lg" disabled={submitting}>
                    {submitting ? "Updating..." : "Update Request Status"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UpdateRequestStatus;
