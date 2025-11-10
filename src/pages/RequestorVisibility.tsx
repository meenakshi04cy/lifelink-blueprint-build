import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, Info } from "lucide-react";

const RequestorVisibility = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Visibility settings logic will be implemented with backend
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
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
                    <Switch id="public-visibility" defaultChecked />
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
                    <Switch id="verified-donors" defaultChecked />
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
                    <Switch id="show-contact" defaultChecked />
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
                    <Switch id="location-sharing" defaultChecked />
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
