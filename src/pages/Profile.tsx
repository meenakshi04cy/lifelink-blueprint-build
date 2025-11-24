import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Edit2, Save, X, LogOut, Heart, Award, Calendar, TrendingUp, History } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [weight, setWeight] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  
  // Validation state
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [requestHistory, setRequestHistory] = useState<any[]>([]);
  
  const { toast } = useToast();
  const navigate = useNavigate();


  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          navigate('/login');
          return;
        }
        setUser(data.user);

        // Load profile with all details
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (prof) {
          setProfile(prof);
          setFullName(prof.full_name || "");
          setPhone(prof.phone || "");
          setBloodGroup(prof.blood_group || "");
          setGender(prof.gender || "");
          setAge(prof.age ? String(prof.age) : "");
          setAddress(prof.address || "");
          setCity(prof.city || "");
          setState(prof.state || "");
          setZipCode(prof.zip_code || "");
          setWeight(prof.weight ? String(prof.weight) : "");
          setMedicalConditions(prof.medical_conditions || "");
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone.trim()) return false;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone.trim());
  };


  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate phone
    if (phone && !validatePhoneNumber(phone)) {
      setPhoneError("Please enter a valid phone number (e.g., +1 (555) 123-4567 or 9876543210)");
      return;
    }
    setPhoneError(null);

    // Validate age if provided
    const ageNum = age ? parseInt(age, 10) : null;
    if (age && (isNaN(ageNum!) || ageNum! < 18 || ageNum! > 120)) {
      toast({ title: 'Validation Error', description: 'Age must be between 18 and 120', variant: 'destructive' });
      return;
    }

    // Validate weight if provided
    const weightNum = weight ? parseFloat(weight) : null;
    if (weight && (isNaN(weightNum!) || weightNum! < 30 || weightNum! > 250)) {
      toast({ title: 'Validation Error', description: 'Weight must be between 30 and 250 kg', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
      id: user.id,
      email: user.email,          // <<--- make sure email is included (NOT NULL)
      full_name: fullName,
      phone: phone,
      blood_group: bloodGroup,
      gender: gender,
      age: ageNum,
      address: address,
      city: city,
      state: state,
      zip_code: zipCode,
      weight: weightNum,
      medical_conditions: medicalConditions,
    };
     // debug: inspect what we will send
    console.log('profile payload', payload);

    

      // Upsert profile
      const { error } = await supabase.from('profiles').upsert(payload);
      if (error) throw error;

      setProfile(payload);
      setEditing(false);
      toast({ title: 'Success', description: 'Your profile has been updated.' });
    } catch (err: any) {
      console.error('Error saving profile:', err);
      toast({ title: 'Save failed', description: err.message || String(err), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setBloodGroup(profile.blood_group || "");
      setGender(profile.gender || "");
      setAge(profile.age ? String(profile.age) : "");
      setAddress(profile.address || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setZipCode(profile.zip_code || "");
      setWeight(profile.weight ? String(profile.weight) : "");
      setMedicalConditions(profile.medical_conditions || "");
    }
    setPhoneError(null);
    setEditing(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-4xl font-bold">Your Profile</h1>
          </div>

          {loading ? (
            <Card>
              <CardContent className="pt-8">
                <p className="text-muted-foreground text-center">Loading profile...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Account Information Card */}
              <Card className="shadow-lg">
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl">Account Information</CardTitle>
                    {!editing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(true)}
                        className="gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Email (read-only) */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">Email Address</Label>
                        <p className="font-semibold text-lg">{user?.email}</p>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName" className="text-sm text-muted-foreground mb-2 block">
                            Full Name
                          </Label>
                          {editing ? (
                            <Input
                              id="fullName"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Enter your full name"
                            />
                          ) : (
                            <p className="font-semibold text-lg">{fullName || 'Not set'}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="phone" className="text-sm text-muted-foreground mb-2 block">
                            Phone Number
                          </Label>
                          {editing ? (
                            <>
                              <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 (555) 123-4567"
                              />
                              {phoneError && (
                                <p className="text-xs text-destructive mt-1">{phoneError}</p>
                              )}
                            </>
                          ) : (
                            <p className="font-semibold text-lg">{phone || 'Not set'}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="gender" className="text-sm text-muted-foreground mb-2 block">
                            Gender
                          </Label>
                          {editing ? (
                            <Select value={gender} onValueChange={setGender}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="font-semibold text-lg capitalize">{gender || 'Not set'}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="age" className="text-sm text-muted-foreground mb-2 block">
                            Age
                          </Label>
                          {editing ? (
                            <Input
                              id="age"
                              type="number"
                              min="18"
                              max="120"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                              placeholder="Enter your age"
                            />
                          ) : (
                            <p className="font-semibold text-lg">{age || 'Not set'}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="weight" className="text-sm text-muted-foreground mb-2 block">
                            Weight (kg)
                          </Label>
                          {editing ? (
                            <Input
                              id="weight"
                              type="number"
                              step="0.5"
                              min="30"
                              max="250"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              placeholder="Enter your weight"
                            />
                          ) : (
                            <p className="font-semibold text-lg">{weight ? `${weight} kg` : 'Not set'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Blood & Health Information */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-lg mb-4">Blood & Health Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bloodGroup" className="text-sm text-muted-foreground mb-2 block">
                            Blood Group
                          </Label>
                          {editing ? (
                            <Select value={bloodGroup} onValueChange={setBloodGroup}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select blood group" />
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
                          ) : (
                            <p className="font-semibold text-lg">{bloodGroup || 'Not set'}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="medicalConditions" className="text-sm text-muted-foreground mb-2 block">
                            Medical Conditions (if any)
                          </Label>
                          {editing ? (
                            <Input
                              id="medicalConditions"
                              value={medicalConditions}
                              onChange={(e) => setMedicalConditions(e.target.value)}
                              placeholder="e.g., Diabetes, Hypertension, etc."
                            />
                          ) : (
                            <p className="font-semibold text-lg">{medicalConditions || 'Not set'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-lg mb-4">Address Information</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="address" className="text-sm text-muted-foreground mb-2 block">
                            Street Address
                          </Label>
                          {editing ? (
                            <Input
                              id="address"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="Enter your street address"
                            />
                          ) : (
                            <p className="font-semibold text-lg">{address || 'Not set'}</p>
                          )}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="city" className="text-sm text-muted-foreground mb-2 block">
                              City
                            </Label>
                            {editing ? (
                              <Input
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Enter your city"
                              />
                            ) : (
                              <p className="font-semibold text-lg">{city || 'Not set'}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="state" className="text-sm text-muted-foreground mb-2 block">
                              State
                            </Label>
                            {editing ? (
                              <Input
                                id="state"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                placeholder="Enter your state"
                              />
                            ) : (
                              <p className="font-semibold text-lg">{state || 'Not set'}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="zipCode" className="text-sm text-muted-foreground mb-2 block">
                              ZIP Code
                            </Label>
                            {editing ? (
                              <Input
                                id="zipCode"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                placeholder="Enter your ZIP code"
                              />
                            ) : (
                              <p className="font-semibold text-lg">{zipCode || 'Not set'}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t pt-6 flex gap-3 justify-end">
                      {editing ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={saving}
                            className="gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </Button>
                          <Button
                            variant="default"
                            onClick={handleSave}
                            disabled={saving}
                            className="gap-2"
                          >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={handleSignOut}
                          className="gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Donation History Card */}
              <Card className="shadow-lg">
                <CardHeader className="border-b">
                  <CardTitle className="text-2xl">Your Donation History</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-0">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Heart className="w-5 h-5 text-primary" />
                            Total Donations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-4xl font-bold text-primary">{donations.length}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Saving lives one donation at a time
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-0">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Award className="w-5 h-5 text-primary" />
                            Lives Impacted
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-4xl font-bold text-primary">{donations.length * 3}+</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Each donation can save up to 3 lives
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-0">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Last Donation
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-4xl font-bold text-primary">-</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            days ago
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Donations Timeline */}
                    {donations.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Donation Timeline</h3>
                        {donations.map((donation, index) => (
                          <div
                            key={donation.id || index}
                            className="flex items-start gap-4 p-4 border rounded-lg hover:border-primary/40 transition-all"
                          >
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Heart className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-lg">{donation.hospital}</p>
                                  <p className="text-sm text-muted-foreground">{donation.date}</p>
                                </div>
                                <Badge variant="secondary">{donation.status}</Badge>
                              </div>
                              <div className="flex gap-4 text-sm">
                                <span className="text-muted-foreground">
                                  Blood Type: <span className="font-semibold text-foreground">{donation.bloodType}</span>
                                </span>
                                <span className="text-muted-foreground">
                                  Units: <span className="font-semibold text-foreground">{donation.units}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">No donations yet. Start saving lives today!</p>
                        <Button 
                          className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => navigate("/nearby-requests")}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Donate Now
                        </Button>
                      </div>
                    )}

                    {/* Achievement Badges */}
                    {donations.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Achievement Badges</h3>
                        <div className="flex flex-wrap gap-4">
                          {donations.length >= 1 && (
                            <div className="flex items-center gap-2 p-3 border rounded-lg bg-primary/5">
                              <Award className="w-6 h-6 text-primary" />
                              <div>
                                <p className="font-semibold text-sm">First Donation</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                              </div>
                            </div>
                          )}
                          {donations.length >= 3 && (
                            <div className="flex items-center gap-2 p-3 border rounded-lg bg-primary/5">
                              <Award className="w-6 h-6 text-primary" />
                              <div>
                                <p className="font-semibold text-sm">3 Donations</p>
                                <p className="text-xs text-muted-foreground">Reached</p>
                              </div>
                            </div>
                          )}
                          {donations.length >= 5 && (
                            <div className="flex items-center gap-2 p-3 border rounded-lg bg-primary/5">
                              <Award className="w-6 h-6 text-primary" />
                              <div>
                                <p className="font-semibold text-sm">5 Donations</p>
                                <p className="text-xs text-muted-foreground">Achieved</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Request History Card */}
              <Card className="shadow-lg">
                <CardHeader className="border-b">
                  <CardTitle className="text-2xl">Your Blood Request History</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {requestHistory.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Request Timeline</h3>
                        {requestHistory.map((request, index) => (
                          <div
                            key={request.id || index}
                            className="flex items-start gap-4 p-4 border rounded-lg hover:border-primary/40 transition-all"
                          >
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <History className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-lg">Patient: {request.patient_name}</p>
                                  <p className="text-sm text-muted-foreground">{request.date}</p>
                                </div>
                                <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                                  {request.status}
                                </Badge>
                              </div>
                              <div className="flex gap-4 text-sm">
                                <span className="text-muted-foreground">
                                  Blood Type: <span className="font-semibold text-foreground">{request.blood_type}</span>
                                </span>
                                <span className="text-muted-foreground">
                                  Units: <span className="font-semibold text-foreground">{request.units}</span>
                                </span>
                                <span className="text-muted-foreground">
                                  Hospital: <span className="font-semibold text-foreground">{request.hospital}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">No blood requests yet. Start requesting blood now!</p>
                        <Button 
                          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => navigate("/request-blood")}
                        >
                          <History className="w-4 h-4 mr-2" />
                          Request Blood
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
