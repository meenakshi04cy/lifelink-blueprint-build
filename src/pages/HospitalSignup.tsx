import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Building2, Upload, Check, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HospitalSignup = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // General Account Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Hospital Details Fields
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [hospitalCity, setHospitalCity] = useState("");
  const [hospitalPhone, setHospitalPhone] = useState("");
  const [hospitalType, setHospitalType] = useState("government");
  const [staffPosition, setStaffPosition] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licenseFileName, setLicenseFileName] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Invalid email format";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords don't match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!hospitalName.trim()) newErrors.hospitalName = "Hospital name is required";
    if (!hospitalAddress.trim()) newErrors.hospitalAddress = "Hospital address is required";
    if (!hospitalCity.trim()) newErrors.hospitalCity = "City is required";
    if (!hospitalPhone.trim()) newErrors.hospitalPhone = "Hospital phone is required";
    if (!staffPosition.trim()) newErrors.staffPosition = "Staff position is required";
    if (!licenseFile) newErrors.licenseFile = "Verification document is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSizeMB = 10;
      if (file.size > maxSizeMB * 1024 * 1024) {
        setErrors({ ...errors, licenseFile: `File size must be less than ${maxSizeMB}MB` });
        return;
      }
      setLicenseFile(file);
      setLicenseFileName(file.name);
      if (errors.licenseFile) setErrors({ ...errors, licenseFile: "" });
    }
  };

  const handleStep1 = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`.trim(),
            phone,
            user_type: "hospital",
            hospital_name: hospitalName,
            hospital_address: hospitalAddress,
            hospital_city: hospitalCity,
            hospital_phone: hospitalPhone,
            hospital_type: hospitalType,
            staff_position: staffPosition,
          },
          emailRedirectTo: `${window.location.origin}/hospital-pending`,
        },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Failed to create user account");

      // Upload verification document if hospitals bucket exists
      if (licenseFile) {
        try {
          const fileName = `hospitals/${userId}/${Date.now()}_${licenseFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from("hospital-documents")
            .upload(fileName, licenseFile);

          if (!uploadError) {
            // Document uploaded successfully
            // Note: Hospital record should be created via database trigger or admin panel
            console.log("Document uploaded successfully");
          }
        } catch (uploadErr) {
          console.warn("Document upload skipped - bucket may not exist yet", uploadErr);
        }
      }

      toast({
        title: "Hospital Account Created!",
        description: "Your account is pending verification. You'll receive an email when approved.",
      });

      navigate("/hospital-pending");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border-2 border-primary/20">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold mb-2">Hospital Staff Registration</CardTitle>
              <CardDescription className="text-base">
                {step === 1 ? "Step 1 of 2: Create Your Account" : "Step 2 of 2: Hospital Details"}
              </CardDescription>

              {/* Progress Indicator */}
              <div className="flex gap-2 mt-6 justify-center">
                <div className={`h-2 w-12 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-slate-300"}`} />
                <div className={`h-2 w-12 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-slate-300"}`} />
              </div>
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                // Step 1: Account Creation
                <form className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="font-semibold">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (errors.firstName) setErrors({ ...errors, firstName: "" });
                        }}
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && (
                        <p className="text-xs text-red-500">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="font-semibold">
                        Last Name <span className="text-slate-400">(Optional)</span>
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@hospital.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-semibold">
                      Personal Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: "" });
                      }}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-semibold">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors({ ...errors, password: "" });
                        }}
                        className={errors.password ? "border-red-500" : ""}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-500 text-sm hover:text-slate-700"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-semibold">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                      }}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleStep1}
                    className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all"
                  >
                    Continue to Hospital Details
                  </Button>
                </form>
              ) : (
                // Step 2: Hospital Details
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-slate-700">Hospital Information</p>
                    <p className="text-xs text-slate-600 mt-1">Complete your hospital details for verification</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalName" className="font-semibold">
                      Hospital Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="hospitalName"
                      type="text"
                      placeholder="City General Hospital"
                      value={hospitalName}
                      onChange={(e) => {
                        setHospitalName(e.target.value);
                        if (errors.hospitalName) setErrors({ ...errors, hospitalName: "" });
                      }}
                      className={errors.hospitalName ? "border-red-500" : ""}
                    />
                    {errors.hospitalName && (
                      <p className="text-xs text-red-500">{errors.hospitalName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalAddress" className="font-semibold">
                      Hospital Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="hospitalAddress"
                      type="text"
                      placeholder="123 Medical Avenue"
                      value={hospitalAddress}
                      onChange={(e) => {
                        setHospitalAddress(e.target.value);
                        if (errors.hospitalAddress) setErrors({ ...errors, hospitalAddress: "" });
                      }}
                      className={errors.hospitalAddress ? "border-red-500" : ""}
                    />
                    {errors.hospitalAddress && (
                      <p className="text-xs text-red-500">{errors.hospitalAddress}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hospitalCity" className="font-semibold">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="hospitalCity"
                        type="text"
                        placeholder="New York"
                        value={hospitalCity}
                        onChange={(e) => {
                          setHospitalCity(e.target.value);
                          if (errors.hospitalCity) setErrors({ ...errors, hospitalCity: "" });
                        }}
                        className={errors.hospitalCity ? "border-red-500" : ""}
                      />
                      {errors.hospitalCity && (
                        <p className="text-xs text-red-500">{errors.hospitalCity}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hospitalPhone" className="font-semibold">
                        Hospital Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="hospitalPhone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={hospitalPhone}
                        onChange={(e) => {
                          setHospitalPhone(e.target.value);
                          if (errors.hospitalPhone) setErrors({ ...errors, hospitalPhone: "" });
                        }}
                        className={errors.hospitalPhone ? "border-red-500" : ""}
                      />
                      {errors.hospitalPhone && (
                        <p className="text-xs text-red-500">{errors.hospitalPhone}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalType" className="font-semibold">
                      Hospital Type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={hospitalType} onValueChange={setHospitalType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="government">Government Hospital</SelectItem>
                        <SelectItem value="private">Private Hospital</SelectItem>
                        <SelectItem value="blood-bank">Blood Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staffPosition" className="font-semibold">
                      Your Position/Role <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="staffPosition"
                      type="text"
                      placeholder="e.g., Blood Bank Manager, Hospital Administrator"
                      value={staffPosition}
                      onChange={(e) => {
                        setStaffPosition(e.target.value);
                        if (errors.staffPosition) setErrors({ ...errors, staffPosition: "" });
                      }}
                      className={errors.staffPosition ? "border-red-500" : ""}
                    />
                    {errors.staffPosition && (
                      <p className="text-xs text-red-500">{errors.staffPosition}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">
                      Verification Document (License/Certificate) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="licenseFile"
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className={`cursor-pointer ${errors.licenseFile ? "border-red-500" : ""}`}
                      />
                      {licenseFileName && (
                        <div className="flex items-center gap-2 mt-2 p-3 bg-green-50 border border-green-200 rounded">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-slate-700">{licenseFileName}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </p>
                    {errors.licenseFile && (
                      <p className="text-xs text-red-500">{errors.licenseFile}</p>
                    )}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-amber-900 mb-2">Verification Status</p>
                    <p className="text-xs text-amber-800">
                      Your hospital account will be reviewed by our team. You'll receive an email notification once your account is verified.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 h-11"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-11 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all"
                      disabled={loading}
                    >
                      {loading ? "Creating Account..." : "Create Hospital Account"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Login Link */}
              <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm">
                <span className="text-slate-600">Already have an account? </span>
                <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Back to General Signup */}
          <div className="text-center mt-6">
            <Link to="/signup" className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              ← Back to General User Registration
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HospitalSignup;
