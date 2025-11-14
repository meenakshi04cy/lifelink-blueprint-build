import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Upload, Check, AlertCircle, ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import OTPVerification from '@/components/OTPVerification';
import { registerHospital, uploadFile } from '@/lib/mockApi.hospital';

const HospitalRegister = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1: Representative Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMethod, setAuthMethod] = useState('password'); // 'password' or 'otp-only'

  // Step 2: Hospital Info
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalType, setHospitalType] = useState('');
  const [officialPhone, setOfficialPhone] = useState('');
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();

  // Step 3: Documents
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licenseFileName, setLicenseFileName] = useState('');
  const [licenseDocUrl, setLicenseDocUrl] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofFileName, setProofFileName] = useState('');
  const [proofDocUrl, setProofDocUrl] = useState('');
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1 Validation
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name required';
    if (!role.trim()) newErrors.role = 'Position/role required';
    if (!phone.trim()) newErrors.phone = 'Phone number required';
    if (!phoneVerified) newErrors.phoneVerified = 'Phone must be verified';
    if (!email.trim()) newErrors.email = 'Email required';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Invalid email';
    if (authMethod === 'password') {
      if (password.length < 8) newErrors.password = 'Password must be 8+ characters';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!hospitalName.trim()) newErrors.hospitalName = 'Hospital name required';
    if (!hospitalType) newErrors.hospitalType = 'Hospital type required';
    if (!officialPhone.trim()) newErrors.officialPhone = 'Official phone required';
    if (!emergencyNumber.trim()) newErrors.emergencyNumber = 'Emergency number required';
    if (!address.trim()) newErrors.address = 'Address required';
    if (!city.trim()) newErrors.city = 'City required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (!licenseDocUrl) newErrors.license = 'License document required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file uploads
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'license' | 'proof'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [type]: `File must be less than ${maxSizeMB}MB`,
      }));
      return;
    }

    if (type === 'license') {
      setUploadingLicense(true);
      setLicenseFile(file);
      setLicenseFileName(file.name);
      try {
        const url = await uploadFile(file, 'license');
        setLicenseDocUrl(url);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.license;
          return newErrors;
        });
        toast({
          title: 'License uploaded',
          description: file.name,
        });
      } catch (err: any) {
        setErrors((prev) => ({ ...prev, license: 'Upload failed' }));
      } finally {
        setUploadingLicense(false);
      }
    } else {
      setUploadingProof(true);
      setProofFile(file);
      setProofFileName(file.name);
      try {
        const url = await uploadFile(file, 'proof');
        setProofDocUrl(url);
        toast({
          title: 'Proof document uploaded',
          description: file.name,
        });
      } catch (err: any) {
        setErrors((prev) => ({ ...prev, proof: 'Upload failed' }));
      } finally {
        setUploadingProof(false);
      }
    }
  };

  // Move to next step
  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setErrors({});
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      setErrors({});
    } else if (step === 3 && validateStep3()) {
      handleSubmit();
    }
  };

  // Submit registration
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const hospitalId = await registerHospital({
        userId: 'current-user-id', // In production, get from auth
        name: hospitalName,
        type: hospitalType as any,
        officialPhone,
        emergencyNumber,
        address,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        licenseDocumentUrl: licenseDocUrl,
        hospitalProofDocumentUrl: proofDocUrl,
      });

      toast({
        title: 'Registration Submitted',
        description: 'Your application is pending verification.',
      });

      navigate(`/hospital/register/success?hospitalId=${hospitalId}`);
    } catch (err: any) {
      setErrors({ submit: err.message || 'Registration failed' });
      toast({
        title: 'Registration Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border-2 border-primary/20">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold mb-2">Hospital Registration</CardTitle>
              <CardDescription className="text-base">
                {step === 1 && 'Step 1 of 4: Your Information'}
                {step === 2 && 'Step 2 of 4: Hospital Details'}
                {step === 3 && 'Step 3 of 4: Upload Documents'}
                {step === 4 && 'Step 4 of 4: Review & Submit'}
              </CardDescription>

              {/* Progress Bar */}
              <div className="flex gap-2 mt-6 justify-center">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      s <= step ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </CardHeader>

            <CardContent>
              {/* Step 1: Representative Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-slate-700">
                      Hospital Representative Information
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Who will be the primary contact for this hospital?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (errors.firstName) {
                            setErrors({ ...errors, firstName: '' });
                          }
                        }}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-xs text-red-500">{errors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name (Optional)</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Your Position/Role *</Label>
                    <Input
                      id="role"
                      placeholder="e.g., Blood Bank Manager, Hospital Administrator"
                      value={role}
                      onChange={(e) => {
                        setRole(e.target.value);
                        if (errors.role) {
                          setErrors({ ...errors, role: '' });
                        }
                      }}
                      className={errors.role ? 'border-red-500' : ''}
                    />
                    {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (for OTP verification) *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) {
                          setErrors({ ...errors, phone: '' });
                        }
                      }}
                      disabled={phoneVerified}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                    {phoneVerified && (
                      <div className="flex items-center gap-2 text-xs text-green-600 mt-1">
                        <Check className="w-4 h-4" />
                        Phone verified
                      </div>
                    )}
                  </div>

                  {!phoneVerified && phone && (
                    <OTPVerification
                      phoneNumber={phone}
                      onVerified={() => setPhoneVerified(true)}
                      onBack={() => {}}
                    />
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@hospital.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors({ ...errors, email: '' });
                        }
                      }}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <p className="text-sm font-semibold">Authentication Method</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="authPassword"
                          checked={authMethod === 'password'}
                          onCheckedChange={() => setAuthMethod('password')}
                        />
                        <Label htmlFor="authPassword" className="cursor-pointer">
                          Password-based account
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="authOtp"
                          checked={authMethod === 'otp-only'}
                          onCheckedChange={() => setAuthMethod('otp-only')}
                        />
                        <Label htmlFor="authOtp" className="cursor-pointer">
                          OTP-only login (via verified phone)
                        </Label>
                      </div>
                    </div>
                  </div>

                  {authMethod === 'password' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) {
                              setErrors({ ...errors, password: '' });
                            }
                          }}
                          className={errors.password ? 'border-red-500' : ''}
                        />
                        {errors.password && (
                          <p className="text-xs text-red-500">{errors.password}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) {
                              setErrors({ ...errors, confirmPassword: '' });
                            }
                          }}
                          className={errors.confirmPassword ? 'border-red-500' : ''}
                        />
                        {errors.confirmPassword && (
                          <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </>
                  )}

                  <Button
                    onClick={handleNextStep}
                    className="w-full mt-6"
                    size="lg"
                    disabled={!phoneVerified}
                  >
                    Continue to Hospital Details
                  </Button>
                </div>
              )}

              {/* Step 2: Hospital Info */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-slate-700">Hospital Information</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Provide details about your hospital
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">Hospital Name *</Label>
                    <Input
                      id="hospitalName"
                      placeholder="City General Hospital"
                      value={hospitalName}
                      onChange={(e) => {
                        setHospitalName(e.target.value);
                        if (errors.hospitalName) {
                          setErrors({ ...errors, hospitalName: '' });
                        }
                      }}
                      className={errors.hospitalName ? 'border-red-500' : ''}
                    />
                    {errors.hospitalName && (
                      <p className="text-xs text-red-500">{errors.hospitalName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalType">Hospital Type *</Label>
                    <Select value={hospitalType} onValueChange={setHospitalType}>
                      <SelectTrigger className={errors.hospitalType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select hospital type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="government">Government Hospital</SelectItem>
                        <SelectItem value="private">Private Hospital</SelectItem>
                        <SelectItem value="blood-bank">Blood Bank</SelectItem>
                        <SelectItem value="ngo">NGO/Charitable</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.hospitalType && (
                      <p className="text-xs text-red-500">{errors.hospitalType}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="officialPhone">Official Phone *</Label>
                      <Input
                        id="officialPhone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={officialPhone}
                        onChange={(e) => {
                          setOfficialPhone(e.target.value);
                          if (errors.officialPhone) {
                            setErrors({ ...errors, officialPhone: '' });
                          }
                        }}
                        className={errors.officialPhone ? 'border-red-500' : ''}
                      />
                      {errors.officialPhone && (
                        <p className="text-xs text-red-500">{errors.officialPhone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyNumber">Emergency Number *</Label>
                      <Input
                        id="emergencyNumber"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={emergencyNumber}
                        onChange={(e) => {
                          setEmergencyNumber(e.target.value);
                          if (errors.emergencyNumber) {
                            setErrors({ ...errors, emergencyNumber: '' });
                          }
                        }}
                        className={errors.emergencyNumber ? 'border-red-500' : ''}
                      />
                      {errors.emergencyNumber && (
                        <p className="text-xs text-red-500">{errors.emergencyNumber}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      placeholder="123 Medical Avenue"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) {
                          setErrors({ ...errors, address: '' });
                        }
                      }}
                      className={errors.address ? 'border-red-500' : ''}
                    />
                    {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="New Delhi"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          if (errors.city) {
                            setErrors({ ...errors, city: '' });
                          }
                        }}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State (Optional)</Label>
                      <Input
                        id="state"
                        placeholder="Delhi"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code (Optional)</Label>
                      <Input
                        id="zipCode"
                        placeholder="110001"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location Coordinates (Optional)
                    </Label>
                    <p className="text-xs text-gray-600">
                      Latitude: {latitude || 'Not set'} | Longitude: {longitude || 'Not set'}
                    </p>
                    <Button
                      onClick={() => {
                        // TODO: Integrate with map picker
                        setLatitude(28.6139);
                        setLongitude(77.209);
                        toast({
                          title: 'Location set',
                          description: 'New Delhi coordinates',
                        });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Pick Location on Map
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      className="flex-1"
                      size="lg"
                    >
                      Continue to Documents
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Upload Documents */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-slate-700">Verification Documents</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Upload hospital license and proof documents for verification
                    </p>
                  </div>

                  {/* License Document */}
                  <div className="space-y-2">
                    <Label className="font-semibold">
                      Hospital License / Registration Certificate *
                    </Label>
                    <p className="text-xs text-gray-600 mb-3">
                      Accepted: PDF, JPG, PNG (Max 10MB)
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'license')}
                        disabled={uploadingLicense}
                        className="hidden"
                        id="licenseFile"
                      />
                      <label htmlFor="licenseFile" className="cursor-pointer block">
                        {licenseFileName ? (
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <Check className="w-5 h-5" />
                            <span className="font-medium">{licenseFileName}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-600">
                            <Upload className="w-8 h-8" />
                            <span className="text-sm font-medium">Click to upload or drag & drop</span>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.license && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.license}
                      </p>
                    )}
                  </div>

                  {/* Proof Document */}
                  <div className="space-y-2">
                    <Label className="font-semibold">
                      Hospital Proof / Additional Document (Optional)
                    </Label>
                    <p className="text-xs text-gray-600 mb-3">
                      Utility bill, lease agreement, or other proof
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'proof')}
                        disabled={uploadingProof}
                        className="hidden"
                        id="proofFile"
                      />
                      <label htmlFor="proofFile" className="cursor-pointer block">
                        {proofFileName ? (
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <Check className="w-5 h-5" />
                            <span className="font-medium">{proofFileName}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-600">
                            <Upload className="w-8 h-8" />
                            <span className="text-sm font-medium">Click to upload or drag & drop</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-amber-900 mb-2">Before You Submit</p>
                    <ul className="text-xs text-amber-800 space-y-1">
                      <li>✓ Ensure all documents are clear and legible</li>
                      <li>✓ Hospital license must be current and valid</li>
                      <li>✓ Our team will review within 24-48 hours</li>
                      <li>✓ You'll receive email notification upon verification</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(4)}
                      className="flex-1"
                      size="lg"
                      disabled={!licenseDocUrl}
                    >
                      Review & Submit
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-slate-700">Review Your Application</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Please verify all information before submitting
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 bg-gray-50 p-4 rounded">
                      <h4 className="font-semibold text-sm">Representative</h4>
                      <dl className="text-xs space-y-2">
                        <div>
                          <dt className="text-gray-600">Name:</dt>
                          <dd className="font-medium">{`${firstName} ${lastName}`.trim()}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-600">Position:</dt>
                          <dd className="font-medium">{role}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-600">Phone:</dt>
                          <dd className="font-medium flex items-center gap-1">
                            {phone}
                            <Check className="w-3 h-3 text-green-600" />
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-600">Email:</dt>
                          <dd className="font-medium">{email}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="space-y-3 bg-gray-50 p-4 rounded">
                      <h4 className="font-semibold text-sm">Hospital</h4>
                      <dl className="text-xs space-y-2">
                        <div>
                          <dt className="text-gray-600">Name:</dt>
                          <dd className="font-medium">{hospitalName}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-600">Type:</dt>
                          <dd className="font-medium capitalize">{hospitalType}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-600">Location:</dt>
                          <dd className="font-medium">
                            {city}, {state}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-600">Emergency:</dt>
                          <dd className="font-medium">{emergencyNumber}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="space-y-3 bg-green-50 border border-green-200 p-4 rounded">
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">
                          License Document Uploaded
                        </p>
                        <p className="text-xs text-green-800 mt-1">{licenseFileName}</p>
                      </div>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 p-4 rounded">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-900">Submission Error</p>
                        <p className="text-xs text-red-800 mt-1">{errors.submit}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2">
                      <input type="checkbox" id="terms" className="mt-0.5" required />
                      <label htmlFor="terms" className="text-gray-700">
                        I confirm that all information provided is accurate and authentic. I understand
                        that false information may result in rejection and legal action.
                      </label>
                    </div>
                    <div className="flex items-start gap-2">
                      <input type="checkbox" id="privacy" className="mt-0.5" required />
                      <label htmlFor="privacy" className="text-gray-700">
                        I have read and agree to the Privacy Policy and Terms of Service.
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(3)}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="flex-1"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HospitalRegister;
