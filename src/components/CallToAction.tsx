import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import iconBloodHeart from "@/assets/icon-blood-heart.jpg";

export const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary via-primary-light to-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-primary-foreground">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
              <img src={iconBloodHeart} alt="LifeLink" className="w-12 h-12" />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          
          <p className="text-xl mb-10 opacity-90 leading-relaxed">
            Whether you need blood or want to donate, LifeLink is here to connect you. 
            Join thousands of people saving lives every day.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-background text-primary hover:bg-background/90 hover:scale-105 transition-all text-lg font-semibold"
              >
                <Heart className="w-5 h-5" />
                Get Started Now
              </Button>
            </Link>
            <Link to="/about">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg font-semibold"
              >
                Learn More
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="opacity-90">Available Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="opacity-90">Secure Platform</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Fast</div>
              <div className="opacity-90">Response Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
