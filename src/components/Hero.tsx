import { Button } from "@/components/ui/button";
import { Heart, Droplets } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-blood-donation.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Blood donation healthcare"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/60" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <span className="text-primary font-semibold text-lg">Connecting Lives</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Every Drop <span className="text-primary">Counts</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            LifeLink brings together blood recipients, donors, and hospitals in a seamless platform. 
            Save lives by donating blood or find the help you need when it matters most.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/request-blood">
              <Button variant="hero" size="lg" className="text-lg">
                <Droplets className="w-5 h-5" />
                Request Blood
              </Button>
            </Link>
            <Link to="/become-donor">
              <Button variant="outline" size="lg" className="text-lg">
                <Heart className="w-5 h-5" />
                Become a Donor
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Lives Saved</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">5K+</div>
              <div className="text-sm text-muted-foreground">Active Donors</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">200+</div>
              <div className="text-sm text-muted-foreground">Partner Hospitals</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
