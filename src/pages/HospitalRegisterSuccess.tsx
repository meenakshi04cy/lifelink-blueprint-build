import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Clock, FileText, Home } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const HospitalRegisterSuccess = () => {
  const [searchParams] = useSearchParams();
  const hospitalId = searchParams.get('hospitalId');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-slate-100">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="shadow-xl border-green-200">
            <div className="p-12 text-center space-y-8">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl font-bold text-green-900 mb-2">
                  Application Submitted Successfully!
                </h1>
                <p className="text-lg text-gray-600">
                  Your hospital registration is now under review.
                </p>
              </div>

              {/* Application ID */}
              {hospitalId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Application ID</p>
                  <p className="font-mono text-sm font-semibold text-green-900 break-all">
                    {hospitalId}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Save this ID for reference. You'll need it to check status or resubmit documents.
                  </p>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-700">What Happens Next?</p>

                <div className="grid grid-cols-1 gap-3">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                        1
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-gray-900">Document Review</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Our verification team will review your documents within 24-48 hours.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        2
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-gray-900">Email Notification</p>
                      <p className="text-xs text-gray-600 mt-1">
                        You'll receive an email at {/* TODO: show email */} with the verification decision.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                        3
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-gray-900">Access Granted</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Once approved, you can manage blood requests and access donor information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <p className="font-semibold text-amber-900">Verification Status: Pending</p>
                </div>
                <p className="text-xs text-amber-800">
                  Your hospital is currently in the verification queue. This status will be updated to
                  "Verified" once our team completes the review.
                </p>
              </div>

              {/* Important Notes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold text-sm text-blue-900">Important</p>
                    <ul className="text-xs text-blue-800 mt-1 space-y-1">
                      <li>• Keep your login credentials safe and secure</li>
                      <li>• Do not share your Application ID or documents with unauthorized persons</li>
                      <li>• Check your email (including spam folder) for updates</li>
                      <li>• If rejected, you can resubmit updated documents</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-6">
                <Link to="/">
                  <Button className="w-full" size="lg" variant="default">
                    <Home className="w-4 h-4 mr-2" />
                    Go to Home
                  </Button>
                </Link>
                <Link to={`/hospital/${hospitalId}/edit`}>
                  <Button className="w-full" size="lg" variant="outline">
                    Check Application Status
                  </Button>
                </Link>
              </div>

              {/* FAQ */}
              <div className="pt-6 border-t text-left space-y-3">
                <p className="font-semibold text-sm text-gray-900">Frequently Asked Questions</p>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">How long does verification take?</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Typically 24-48 hours during business days. Complex cases may take longer.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900">What if my application is rejected?</p>
                    <p className="text-xs text-gray-600 mt-1">
                      You'll receive detailed feedback and can resubmit with updated documents.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900">Can I make changes before verification?</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Yes, you can edit and resubmit documents from the application status page.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900">Who do I contact for support?</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Email support@lifelink.com or call our support team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HospitalRegisterSuccess;
