import { Card } from "@/components/ui/card";
import { Shield, Clock, Database, Users, Bell, MapPin } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Instant Matching",
    description: "Real-time matching between blood requests and available donors or stock"
  },
  {
    icon: Database,
    title: "Blood Stock Management",
    description: "Comprehensive inventory tracking across all partner hospitals"
  },
  {
    icon: Users,
    title: "Verified Donors",
    description: "All donors undergo health screening to ensure safe donations"
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get instant updates on request status and donation opportunities"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your health data is protected with industry-leading security"
  },
  {
    icon: MapPin,
    title: "Location-Based",
    description: "Find nearby hospitals and donors for faster response times"
  }
];

export const Features = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Platform Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built with cutting-edge technology to ensure reliability and efficiency
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="mb-4 w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
