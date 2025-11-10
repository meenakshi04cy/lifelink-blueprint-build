import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Calendar, Eye, MapPin, History } from "lucide-react";
import { Link } from "react-router-dom";

const RequestBlood = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Blood request logic will be implemented with backend
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Request Blood</h1>
            <p className="text-xl text-muted-foreground">
              Fill out this form and we'll connect you with available donors or blood banks
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Blood Request Form</CardTitle>
              <CardDescription>Provide accurate information for faster matching</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 border-b pb-6">
                  <h3 className="font-semibold text-lg">Patient Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientName">Patient Name</Label>
                      <Input id="patientName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientAge">Age</Label>
                      <Input id="patientAge" type="number" min="0" required />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input id="contactPerson" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input id="contactPhone" type="tel" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input id="contactEmail" type="email" required />
                  </div>
                </div>

                <div className="space-y-4 border-b pb-6">
                  <h3 className="font-semibold text-lg">Blood Requirement Details</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bloodType">Blood Type Required</Label>
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
                      <Label htmlFor="units">Units Required</Label>
                      <Input id="units" type="number" min="1" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical (within 24 hours)</SelectItem>
                        <SelectItem value="urgent">Urgent (within 48 hours)</SelectItem>
                        <SelectItem value="normal">Normal (within a week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requiredBy">Required By Date</Label>
                    <Input id="requiredBy" type="date" required />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Hospital Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hospital">Hospital Name</Label>
                    <Input id="hospital" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalAddress">Hospital Address</Label>
                    <Input id="hospitalAddress" required />
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

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Transfusion (Optional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="E.g., surgery, accident, medical condition"
                      rows={3}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" variant="hero" size="lg">
                  Submit Blood Request
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Donor Benefits & Features — replaces previous "Manage Your Requests" cards but keeps existing routes */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">Donor Benefits & Features</h2>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/update-request-status" className="block">
                  <div className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all p-6 h-full">
                    <div className="w-12 h-12 rounded-md bg-red-50 flex items-center justify-center mb-4">
                      <Calendar className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">Update Request Status</h3>
                    <p className="text-sm text-gray-500">
                      Keep your blood request updated to help donors respond effectively
                    </p>
                  </div>
                </Link>

                <Link to="/requestor-visibility" className="block">
                  <div className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all p-6 h-full">
                    <div className="w-12 h-12 rounded-md bg-red-50 flex items-center justify-center mb-4">
                      <Eye className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">Stay Visible</h3>
                    <p className="text-sm text-gray-500">
                       Control who can see and respond to your blood requests
                    </p>
                  </div>
                </Link>

                <Link to="/nearby-donations" className="block">
                  <div className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all p-6 h-full">
                    <div className="w-12 h-12 rounded-md bg-red-50 flex items-center justify-center mb-4">
                      <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">View Nearby Donations</h3>
                    <p className="text-sm text-gray-500">
                      Find and connect with available blood donors near your location
                    </p>
                  </div>
                </Link>

                <Link to="/request-history" className="block">
                  <div className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all p-6 h-full">
                    <div className="w-12 h-12 rounded-md bg-red-50 flex items-center justify-center mb-4">
                      <History className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">Track Request History</h3>
                    <p className="text-sm text-gray-500">
                      Keep a record of all your requests and their outcomes
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RequestBlood;
