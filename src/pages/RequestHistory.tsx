import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Calendar, Droplet, MapPin } from "lucide-react";

const RequestHistory = () => {
  // Mock data - will be replaced with real data from backend
  const requestHistory = [
    {
      id: 1,
      bloodType: "A+",
      units: 2,
      date: "2024-01-15",
      status: "Fulfilled",
      hospital: "City General Hospital",
      urgency: "Critical",
    },
    {
      id: 2,
      bloodType: "O+",
      units: 1,
      date: "2023-11-20",
      status: "Fulfilled",
      hospital: "St. Mary's Medical Center",
      urgency: "Urgent",
    },
    {
      id: 3,
      bloodType: "A+",
      units: 3,
      date: "2023-08-10",
      status: "Cancelled",
      hospital: "Regional Health Center",
      urgency: "Normal",
    },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Fulfilled":
        return "default";
      case "Cancelled":
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

          <div className="space-y-4">
            {requestHistory.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-primary" />
                        {request.bloodType} - {request.units} {request.units > 1 ? "Units" : "Unit"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(request.date).toLocaleDateString("en-US", {
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
                      <span className="text-muted-foreground">{request.hospital}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {request.urgency}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {requestHistory.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  You haven't made any blood requests yet.
                </p>
                <Button variant="hero">Make Your First Request</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RequestHistory;
