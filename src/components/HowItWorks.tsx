import { Card } from "@/components/ui/card";
import { Search, UserCheck, Activity, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Request Blood",
    description: "Recipients submit blood requests specifying type and quantity needed",
    color: "text-primary"
  },
  {
    icon: Activity,
    title: "Check Availability",
    description: "System checks blood stock and fulfills from inventory if available",
    color: "text-primary"
  },
  {
    icon: UserCheck,
    title: "Match Donors",
    description: "If stock unavailable, system matches with registered healthy donors",
    color: "text-primary"
  },
  {
    icon: CheckCircle,
    title: "Complete Request",
    description: "Blood is collected, tested, and delivered to fulfill the request",
    color: "text-primary"
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How LifeLink Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our streamlined process ensures rapid response when every second counts
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="p-6 relative hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">
                {index + 1}
              </div>
              <div className={`mb-4 ${step.color}`}>
                <step.icon className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
