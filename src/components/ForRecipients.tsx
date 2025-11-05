import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Droplets, Clock, CheckCircle } from "lucide-react";

export const ForRecipients = () => {
  return (
    <section className="py-20 bg-accent/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-primary/10 px-4 py-2 rounded-full mb-6">
              <span className="text-primary font-semibold">For Recipients</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Need Blood? We're Here to Help</h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Submit your request and our system will immediately search for available blood in 
              our network or match you with suitable donors.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Urgent Request Support</h4>
                  <p className="text-muted-foreground">Priority handling for emergency cases</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Real-Time Tracking</h4>
                  <p className="text-muted-foreground">Monitor your request status every step</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-lg">
                  <Droplets className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">All Blood Types</h4>
                  <p className="text-muted-foreground">Comprehensive network for all blood groups</p>
                </div>
              </div>
            </div>

            <Button variant="hero" size="lg">
              Submit Blood Request
            </Button>
          </div>

          <div className="grid gap-4">
            <Card className="p-6 bg-background">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold">Create Profile</h3>
              </div>
              <p className="text-muted-foreground">Set up your account with basic information and blood type</p>
            </Card>
            <Card className="p-6 bg-background">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold">Submit Request</h3>
              </div>
              <p className="text-muted-foreground">Specify blood type, quantity, and urgency level</p>
            </Card>
            <Card className="p-6 bg-background">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold">Get Connected</h3>
              </div>
              <p className="text-muted-foreground">Receive notifications when blood is available</p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
