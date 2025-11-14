import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Droplet, MapPin, Settings, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GetStarted = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border-2 border-primary/20">
                <Heart className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome to LifeLink!</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Your account is ready. Let's get started with what you'd like to do.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Become a Donor */}
            <Link to="/become-donor" className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 cursor-pointer">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Droplet className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">Become a Donor</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Share the gift of life
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span className="text-sm text-slate-700">Complete your donor profile</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span className="text-sm text-slate-700">Set your availability status</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span className="text-sm text-slate-700">Connect with those who need you</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6 bg-gradient-to-r from-primary to-primary/90 group-hover:from-primary/90 group-hover:to-primary transition-all">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Request Blood */}
            <Link to="/request-blood" className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 cursor-pointer">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">Request Blood</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Find the help you need
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span className="text-sm text-slate-700">Create a blood request</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span className="text-sm text-slate-700">Connect with available donors</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span className="text-sm text-slate-700">Manage your requests in real-time</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6 bg-gradient-to-r from-primary to-primary/90 group-hover:from-primary/90 group-hover:to-primary transition-all">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Additional Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Complete Profile */}
            <Card className="border border-slate-200 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Complete Your Profile</CardTitle>
                    <CardDescription>Add more information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 mb-4">
                  Update your profile details, location preferences, and notification settings to get the best experience.
                </p>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Explore Features */}
            <Card className="border border-slate-200 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Learn About LifeLink</CardTitle>
                    <CardDescription>Discover how it works</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 mb-4">
                  Learn about our mission, how the platform works, and how you can make a real difference.
                </p>
                <Link to="/about">
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg text-center">Why LifeLink?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary mb-2">10K+</p>
                  <p className="text-sm text-slate-700">Active Donors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary mb-2">5K+</p>
                  <p className="text-sm text-slate-700">Lives Saved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary mb-2">99%</p>
                  <p className="text-sm text-slate-700">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GetStarted;
