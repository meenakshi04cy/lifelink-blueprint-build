import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Info } from "lucide-react";

const UpdateRequestStatus = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update request status logic will be implemented with backend
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Update Request Status</h1>
            <p className="text-xl text-muted-foreground">
              Keep your blood request updated to help donors respond effectively
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request Status Management</CardTitle>
              <CardDescription>Update the status of your blood request</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="status">Request Status</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active - Still Needed</SelectItem>
                      <SelectItem value="fulfilled">Fulfilled - Blood Received</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="postponed">Postponed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Update urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical (within 24 hours)</SelectItem>
                      <SelectItem value="urgent">Urgent (within 48 hours)</SelectItem>
                      <SelectItem value="normal">Normal (within a week)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Update details about your request status..."
                    rows={4}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg flex gap-3">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Keeping your request status updated helps donors know if you still need blood and allows others to prioritize their donations effectively.
                  </p>
                </div>

                <Button type="submit" className="w-full" variant="hero" size="lg">
                  Update Request Status
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UpdateRequestStatus;
