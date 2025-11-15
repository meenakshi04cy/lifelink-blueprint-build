import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Calendar, Droplet, MapPin, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const RequestHistory = () => {
  const [requestHistory, setRequestHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data } = await supabase
        .from("blood_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setRequestHistory(data);
      }
      setLoading(false);
    };

    fetchRequests();
  }, [navigate]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "fulfilled":
        return "default";
      case "cancelled":
        return "secondary";
      default:
        return "outline";
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
                <History className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Request History</h1>
            <p className="text-xl text-muted-foreground">
              Track all your blood requests and their outcomes
            </p>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Requests: <span className="font-semibold text-foreground">{requestHistory.length}</span>
              </p>
            </div>
            <Button variant="outline">
              Download Report
            </Button>
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading your requests...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requestHistory.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Droplet className="w-5 h-5 text-primary" />
                          {request.blood_type} - {request.units_needed} {request.units_needed > 1 ? "Units" : "Unit"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(request.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusVariant(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{request.hospital_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {request.urgency_level}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {requestHistory.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You haven't made any blood requests yet.
                    </p>
                    <Button variant="hero" onClick={() => navigate("/request-blood")}>
                      Make Your First Request
                    </Button>
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

export default RequestHistory;
