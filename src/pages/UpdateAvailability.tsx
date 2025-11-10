import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Check, Clock } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const UpdateAvailability = () => {
  const [availability, setAvailability] = useState("available");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Update Your Availability</h1>
            <p className="text-xl text-muted-foreground">
              Let hospitals know when you're ready to donate blood again
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
              <CardDescription>Update your donation availability status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={availability} onValueChange={setAvailability}>
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="available" id="available" />
                  <Label htmlFor="available" className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="font-semibold">Available Now</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      I'm ready to donate and can be contacted by hospitals
                    </p>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="soon" id="soon" />
                  <Label htmlFor="soon" className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold">Available Soon</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      I'll be available to donate within the next 2 weeks
                    </p>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="unavailable" id="unavailable" />
                  <Label htmlFor="unavailable" className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-5 h-5 text-red-600" />
                      <span className="font-semibold">Currently Unavailable</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      I recently donated or cannot donate at this time
                    </p>
                  </Label>
                </div>
              </RadioGroup>

              <Button className="w-full" size="lg">
                Update Availability
              </Button>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Last Donation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-2">45 days ago</p>
                <p className="text-sm text-muted-foreground">
                  You can donate again in 45 days (3 months interval recommended)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Available</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-2">45 days</p>
                <p className="text-sm text-muted-foreground">
                  Estimated time until you can safely donate again
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

export default UpdateAvailability;
