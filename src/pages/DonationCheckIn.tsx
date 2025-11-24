import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Heart, User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getHospitalDonationCommitments, updateDonationCommitmentStatus } from "@/lib/supabase-hospitals";

interface DonationCommitment {
  id: string;
  donor_id: string;
  blood_request_id: string;
  status: "committed" | "scheduled" | "checked_in" | "completed" | "cancelled" | "no_show";
  scheduled_at?: string;
  checked_in_at?: string;
  completed_at?: string;
  units_donated?: number;
  bag_id?: string;
  hemoglobin_reading?: number;
  is_alternate_hospital: boolean;
  donor_notes?: string;
  created_at: string;
  blood_requests?: {
    id: string;
    patient_name: string;
    blood_type: string;
    units_needed: number;
    urgency_level: string;
  };
  donors?: {
    id: string;
    blood_type: string;
  };
}

const DonationCheckIn = () => {
  const [user, setUser] = useState<any>(null);
  const [commitments, setCommitments] = useState<DonationCommitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommitment, setSelectedCommitment] = useState<DonationCommitment | null>(null);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  
  // Check-in form state
  const [unitsDonated, setUnitsDonated] = useState<number>(1);
  const [bagId, setBagId] = useState("");
  const [hemoglobinReading, setHemoglobinReading] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [processingCheckIn, setProcessingCheckIn] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/login");
        return;
      }

      // Check if user is hospital staff
      const metadata = session.user.user_metadata;
      if (metadata?.user_type !== "hospital_staff" && metadata?.user_type !== "admin") {
        toast({
          title: "Access Denied",
          description: "Only hospital staff can access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      loadCommitments(metadata?.hospital_id);
    };

    initUser();
  }, []);

  const loadCommitments = async (hospitalId: string) => {
    try {
      const data = await getHospitalDonationCommitments(hospitalId);
      setCommitments(data);
    } catch (error) {
      console.error("Error loading commitments:", error);
      toast({
        title: "Error loading commitments",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedCommitment || !user) return;

    setProcessingCheckIn(true);

    try {
      const result = await updateDonationCommitmentStatus(
        selectedCommitment.id,
        "checked_in",
        user.id,
        {
          checkedInAt: new Date().toISOString(),
        }
      );

      toast({
        title: "Donor Checked In",
        description: `${selectedCommitment.blood_requests?.patient_name}'s donor has been checked in.`,
      });

      setShowCheckInDialog(false);
      setSelectedCommitment(null);
      loadCommitments(user.user_metadata?.hospital_id);
    } catch (error: any) {
      toast({
        title: "Error checking in donor",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingCheckIn(false);
    }
  };

  const handleCompleteDonation = async () => {
    if (!selectedCommitment || !user || !bagId) {
      toast({
        title: "Missing information",
        description: "Please enter bag ID and units donated",
        variant: "destructive",
      });
      return;
    }

    setProcessingCheckIn(true);

    try {
      const result = await updateDonationCommitmentStatus(
        selectedCommitment.id,
        "completed",
        user.id,
        {
          completedAt: new Date().toISOString(),
          unitsDonated,
          bagId,
          hemoglobinReading: hemoglobinReading || undefined,
        }
      );

      toast({
        title: "Donation Completed",
        description: `${unitsDonated} unit(s) collected and recorded for ${selectedCommitment.blood_requests?.patient_name}.`,
      });

      setShowCheckInDialog(false);
      setSelectedCommitment(null);
      setUnitsDonated(1);
      setBagId("");
      setHemoglobinReading(null);
      setNotes("");
      loadCommitments(user.user_metadata?.hospital_id);
    } catch (error: any) {
      toast({
        title: "Error completing donation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingCheckIn(false);
    }
  };

  const getCommitmentsByStatus = (status: string) => {
    return commitments.filter(c => c.status === status);
  };

  const renderCommitmentCard = (commitment: DonationCommitment) => (
    <Card key={commitment.id} className="border-primary/20 hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Patient: {commitment.blood_requests?.patient_name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Heart className="w-4 h-4" />
              {commitment.blood_requests?.blood_type} ({commitment.blood_requests?.units_needed} units needed)
            </CardDescription>
          </div>
          <Badge 
            variant={
              commitment.urgency_level === "critical" ? "destructive" : 
              commitment.urgency_level === "urgent" ? "default" : 
              "secondary"
            }
          >
            {commitment.blood_requests?.urgency_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Commitment Status</p>
              <Badge variant="outline" className="mt-1">{commitment.status}</Badge>
            </div>
            {commitment.is_alternate_hospital && (
              <div>
                <p className="text-muted-foreground">Transfer Required</p>
                <Badge variant="secondary" className="mt-1">Alternate Hospital</Badge>
              </div>
            )}
            {commitment.units_donated && (
              <div>
                <p className="text-muted-foreground">Units Donated</p>
                <p className="font-semibold">{commitment.units_donated} units</p>
              </div>
            )}
            {commitment.bag_id && (
              <div>
                <p className="text-muted-foreground">Bag ID</p>
                <p className="font-semibold">{commitment.bag_id}</p>
              </div>
            )}
          </div>

          {commitment.donor_notes && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Donor Notes</p>
              <p className="text-sm">{commitment.donor_notes}</p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => {
              setSelectedCommitment(commitment);
              setShowCheckInDialog(true);
            }}
          >
            {commitment.status === "committed" ? "Check In Donor" : "Record Donation"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Loading donations...</p>
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

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Donation Check-In</h1>
            <p className="text-muted-foreground">
              Manage donor check-ins and record completed donations
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Committed</span>
                <Badge variant="outline">{getCommitmentsByStatus("committed").length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="checked-in" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Checked In</span>
                <Badge variant="outline">{getCommitmentsByStatus("checked_in").length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Completed</span>
                <Badge variant="outline">{getCommitmentsByStatus("completed").length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {getCommitmentsByStatus("committed").length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No committed donations yet</p>
                  </CardContent>
                </Card>
              ) : (
                getCommitmentsByStatus("committed").map(renderCommitmentCard)
              )}
            </TabsContent>

            <TabsContent value="checked-in" className="space-y-4">
              {getCommitmentsByStatus("checked_in").length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No checked-in donors</p>
                  </CardContent>
                </Card>
              ) : (
                getCommitmentsByStatus("checked_in").map(renderCommitmentCard)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {getCommitmentsByStatus("completed").length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No completed donations yet</p>
                  </CardContent>
                </Card>
              ) : (
                getCommitmentsByStatus("completed").map(renderCommitmentCard)
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {commitments.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No donations</p>
                  </CardContent>
                </Card>
              ) : (
                commitments.map(renderCommitmentCard)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Check-In Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCommitment?.status === "committed" ? "Check In Donor" : "Record Donation"}
            </DialogTitle>
            <DialogDescription>
              {selectedCommitment?.blood_requests?.patient_name} - {selectedCommitment?.blood_requests?.blood_type}
            </DialogDescription>
          </DialogHeader>

          {selectedCommitment && (
            <div className="space-y-4">
              {selectedCommitment.status === "committed" && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Donor is arriving. Click "Check In" to mark them as present.
                  </AlertDescription>
                </Alert>
              )}

              {selectedCommitment.status === "checked_in" && (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Donor is checked in. Record the donation details below.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="units">Units Donated</Label>
                    <Input
                      id="units"
                      type="number"
                      min="1"
                      max={selectedCommitment.blood_requests?.units_needed}
                      value={unitsDonated}
                      onChange={(e) => setUnitsDonated(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bag-id">Blood Bag ID *</Label>
                    <Input
                      id="bag-id"
                      placeholder="e.g., BAG-001-2025"
                      value={bagId}
                      onChange={(e) => setBagId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hemoglobin">Hemoglobin Reading (g/dL)</Label>
                    <Input
                      id="hemoglobin"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 13.5"
                      value={hemoglobinReading || ""}
                      onChange={(e) => setHemoglobinReading(parseFloat(e.target.value) || null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCheckInDialog(false)}
            >
              Cancel
            </Button>
            {selectedCommitment?.status === "committed" && (
              <Button
                variant="hero"
                onClick={handleCheckIn}
                disabled={processingCheckIn}
              >
                {processingCheckIn ? "Checking In..." : "Check In"}
              </Button>
            )}
            {selectedCommitment?.status === "checked_in" && (
              <Button
                variant="hero"
                onClick={handleCompleteDonation}
                disabled={processingCheckIn || !bagId}
              >
                {processingCheckIn ? "Recording..." : "Complete Donation"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default DonationCheckIn;
