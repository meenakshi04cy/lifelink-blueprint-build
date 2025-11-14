import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Heart, Award, Calendar, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DonationHistory = () => {
  const navigate = useNavigate();
  const donations = [
    {
      id: 1,
      date: "March 15, 2024",
      hospital: "City General Hospital",
      units: 1,
      bloodType: "O+",
      status: "Completed",
    },
    {
      id: 2,
      date: "December 10, 2023",
      hospital: "Central Medical Center",
      units: 1,
      bloodType: "O+",
      status: "Completed",
    },
    {
      id: 3,
      date: "September 5, 2023",
      hospital: "St. Mary's Hospital",
      units: 1,
      bloodType: "O+",
      status: "Completed",
    },
  ];

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
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Your Donation History</h1>
            <p className="text-xl text-muted-foreground">
              Track your life-saving contributions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Total Donations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">3</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Saving lives one donation at a time
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Lives Impacted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">9+</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Each donation can save up to 3 lives
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Last Donation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">45</p>
                <p className="text-sm text-muted-foreground mt-1">
                  days ago
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Donation Timeline</CardTitle>
              <CardDescription>Your complete donation history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {donations.map((donation, index) => (
                  <div
                    key={donation.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:border-primary/40 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-lg">{donation.hospital}</p>
                          <p className="text-sm text-muted-foreground">{donation.date}</p>
                        </div>
                        <Badge variant="secondary">{donation.status}</Badge>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Blood Type: <span className="font-semibold text-foreground">{donation.bloodType}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Units: <span className="font-semibold text-foreground">{donation.units}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Achievement Badges</CardTitle>
              <CardDescription>Milestones you've reached</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-primary/5">
                  <Award className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">First Donation</p>
                    <p className="text-xs text-muted-foreground">Sep 2023</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-primary/5">
                  <Award className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">3 Donations</p>
                    <p className="text-xs text-muted-foreground">Mar 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonationHistory;
