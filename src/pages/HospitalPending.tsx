import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Building2, Mail, Clock, CheckCircle } from "lucide-react";

const HospitalPending = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center border-2 border-amber-200">
                  <Clock className="w-10 h-10 text-amber-600" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold mb-2">Verification Pending</CardTitle>
              <CardDescription className="text-base">
                Your hospital account has been submitted for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="w-1 h-12 bg-slate-300"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-semibold text-slate-900">Account Created</p>
                    <p className="text-sm text-slate-600 mt-1">Your hospital staff account has been created</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="w-1 h-12 bg-slate-300"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-semibold text-slate-900">Under Review</p>
                    <p className="text-sm text-slate-600 mt-1">Our team is verifying your hospital documents</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Verification Complete</p>
                    <p className="text-sm text-slate-600 mt-1">You'll receive an email with next steps</p>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <Card className="bg-blue-50 border border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Check Your Email</p>
                      <p className="text-sm text-blue-800">
                        We've sent a confirmation email to your registered email address. Verification typically takes 1-2 business days.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What to Expect */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">What to Expect:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm text-slate-700">Our team will review your hospital license and verification documents</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm text-slate-700">You may receive additional requests for information if needed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm text-slate-700">Once approved, you can start managing blood requests immediately</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm text-slate-700">You'll have full access to the hospital dashboard and features</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Link to="/">
                  <Button className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-primary/90">
                    Go to Home
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full h-11 text-base font-semibold">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className="mt-6 border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              <p className="mb-2">
                If you have any questions about the verification process, please don't hesitate to reach out to our support team.
              </p>
              <p>
                Email us at{" "}
                <a href="mailto:support@lifelink.com" className="text-primary hover:underline font-semibold">
                  support@lifelink.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HospitalPending;
