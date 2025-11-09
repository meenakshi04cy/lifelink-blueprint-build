import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Heart, Award, Users } from "lucide-react";

export const ForDonors = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 grid gap-4">
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold">Save Lives</h3>
              </div>
              <p className="text-muted-foreground">One donation can save up to three lives</p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold">Recognition</h3>
              </div>
              <p className="text-muted-foreground">Earn badges and track your donation impact</p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold">Community</h3>
              </div>
              <p className="text-muted-foreground">Join a network of life-saving heroes</p>
            </Card>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-block bg-primary/10 px-4 py-2 rounded-full mb-6">
              <span className="text-primary font-semibold">For Donors</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Be a Hero. Donate Blood.</h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Register as a donor and get notified when your blood type is needed. 
              Every donation makes a difference in someone's life.
            </p>

            <div className="bg-accent/50 p-6 rounded-lg mb-8">
              <h4 className="font-semibold mb-4 text-lg">Donor Requirements:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Age 18-65 years
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Weight at least 50 kg
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Good general health
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  No recent infections or illnesses
                </li>
              </ul>
            </div>

            <Link to="/become-donor">
              <Button variant="hero" size="lg">
                Register as Donor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
