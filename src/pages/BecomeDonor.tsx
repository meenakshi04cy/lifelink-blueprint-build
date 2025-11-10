import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Calendar, MapPin, Activity, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const BecomeDonor = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Donor registration logic will be implemented with backend
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Become a Blood Donor</h1>
            <p className="text-xl text-muted-foreground">
              Thank you for choosing to save lives. Please fill out the registration form below.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Donor Registration Form</CardTitle>
              <CardDescription>All fields are required unless marked optional</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" type="number" min="50" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" required />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" required />
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold text-lg">Health Screening</h3>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox id="health1" required />
                    <Label htmlFor="health1" className="text-sm leading-relaxed cursor-pointer">
                      I am in good health and feeling well today
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="health2" required />
                    <Label htmlFor="health2" className="text-sm leading-relaxed cursor-pointer">
                      I have not donated blood in the last 3 months
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="health3" required />
                    <Label htmlFor="health3" className="text-sm leading-relaxed cursor-pointer">
                      I do not have any chronic illnesses (diabetes, heart disease, etc.)
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      I agree to the terms and conditions and consent to blood donation
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full" variant="hero" size="lg">
                  Register as Donor
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Donor Benefits & Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link to="/update-availability">
                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <Calendar className="w-12 h-12 text-primary mb-4" />
                    <CardTitle className="text-lg">Update Availability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Let hospitals know when you're ready to donate again. Set your availability status anytime.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/donor-visibility">
                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <Activity className="w-12 h-12 text-primary mb-4" />
                    <CardTitle className="text-lg">Stay Visible</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Stay visible to those who need you. Your profile helps hospitals match urgent requests.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/nearby-requests">
                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <MapPin className="w-12 h-12 text-primary mb-4" />
                    <CardTitle className="text-lg">View Nearby Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      See real-time blood requests near your location and connect with patients easily.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/donation-history">
                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <TrendingUp className="w-12 h-12 text-primary mb-4" />
                    <CardTitle className="text-lg">Track Donation History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Keep a record of your donations and see how many lives you've helped save.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BecomeDonor;
