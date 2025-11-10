import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Eye, Users, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const DonorVisibility = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Donor Visibility Settings</h1>
            <p className="text-xl text-muted-foreground">
              Control how and when hospitals can see your donor profile
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Visibility Preferences</CardTitle>
              <CardDescription>Manage how your profile appears to hospitals and recipients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    <Label htmlFor="public-profile" className="font-semibold">Public Profile</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to all hospitals in the network
                  </p>
                </div>
                <Switch id="public-profile" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <Label htmlFor="emergency-contact" className="font-semibold">Emergency Contact</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Allow hospitals to contact you for urgent blood requests
                  </p>
                </div>
                <Switch id="emergency-contact" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    <Label htmlFor="match-notifications" className="font-semibold">Match Notifications</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when you match with a blood request
                  </p>
                </div>
                <Switch id="match-notifications" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Views</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary mb-2">248</p>
                <p className="text-sm text-muted-foreground">
                  Hospitals viewed your profile this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Match Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary mb-2">85%</p>
                <p className="text-sm text-muted-foreground">
                  Your profile matches urgent requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary mb-2">2.4h</p>
                <p className="text-sm text-muted-foreground">
                  Average time to respond to requests
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonorVisibility;
