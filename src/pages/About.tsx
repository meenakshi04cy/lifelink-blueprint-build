import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Heart, Target, Users, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-primary via-primary-light to-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About LifeLink</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Connecting blood donors with those in need through innovative technology
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">Our Mission</h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  LifeLink is dedicated to solving the critical challenge of blood availability by creating
                  a seamless connection between donors, recipients, and healthcare facilities. We believe
                  that access to safe blood should never be a barrier to saving lives.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-16">
                <Card className="p-8">
                  <Target className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-2xl font-semibold mb-3">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    A world where no life is lost due to blood shortage, and where every person
                    in need has immediate access to safe, compatible blood.
                  </p>
                </Card>

                <Card className="p-8">
                  <Heart className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-2xl font-semibold mb-3">Our Values</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Compassion, innovation, and reliability guide everything we do. We prioritize
                    patient safety, donor well-being, and building trust in our community.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
              <p className="text-xl text-muted-foreground">Making a difference, one donation at a time</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">10K+</div>
                <div className="text-muted-foreground">Registered Donors</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">5K+</div>
                <div className="text-muted-foreground">Lives Saved</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">200+</div>
                <div className="text-muted-foreground">Partner Hospitals</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Support Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">How We Work</h2>
                <p className="text-xl text-muted-foreground">
                  Our platform streamlines the entire blood donation and request process
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Smart Matching Algorithm</h3>
                      <p className="text-muted-foreground">
                        Our advanced system instantly matches blood requests with compatible donors or
                        available blood bank inventory based on location, urgency, and compatibility.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Verified & Safe</h3>
                      <p className="text-muted-foreground">
                        All donors undergo health screening and verification processes. We maintain strict
                        quality standards to ensure the safety of both donors and recipients.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
                      <p className="text-muted-foreground">
                        We build a community of heroes who donate regularly and help us maintain a sustainable
                        blood supply network across all regions.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
