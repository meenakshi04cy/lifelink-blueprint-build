import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Download,
  Filter,
  TrendingUp,
} from "lucide-react";

const sb = supabase as any;

export default function ComplianceRecords() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hospital, setHospital] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hospitalId, setHospitalId] = useState("");

  // Filter states
  const [filterBloodType, setFilterBloodType] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterDonorName, setFilterDonorName] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalUnits: 0,
    uniqueDonors: 0,
    withComplications: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: userData } = await sb.auth.getUser();
      if (!userData?.user) {
        navigate("/login");
        return;
      }

      const hId = userData.user.user_metadata?.hospital_id;
      if (!hId) throw new Error("Hospital not found");

      setHospitalId(hId);

      // Load hospital
      const { data: hospitalData } = await sb
        .from("hospitals")
        .select("*")
        .eq("id", hId)
        .single();
      setHospital(hospitalData);

      // Load all donations
      const { data: donationsData } = await sb
        .from("donations")
        .select("*")
        .eq("hospital_id", hId)
        .order("created_at", { ascending: false });

      setDonations(donationsData || []);
      calculateStats(donationsData || []);
    } catch (err: any) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: err?.message ?? "Failed to load data",
        variant: "destructive",
      });
      navigate("/hospital/dash");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (donationsData: any[]) => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalDonations = donationsData.length;
    const totalUnits = donationsData.reduce(
      (sum, d) => sum + (d.units_collected || 0),
      0
    );
    const uniqueDonors = new Set(donationsData.map((d) => d.donor_id)).size;
    const withComplications = donationsData.filter(
      (d) => d.complications
    ).length;
    const thisMonth = donationsData.filter(
      (d) => new Date(d.created_at) >= thisMonthStart
    ).length;

    setStats({
      totalDonations,
      totalUnits,
      uniqueDonors,
      withComplications,
      thisMonth,
    });
  };

  const getFilteredDonations = () => {
    return donations.filter((d) => {
      if (filterBloodType && d.blood_type !== filterBloodType) return false;
      if (filterDonorName && !d.donor_name?.toLowerCase().includes(filterDonorName.toLowerCase())) return false;
      if (filterFromDate) {
        const donDate = new Date(d.created_at);
        const fromDate = new Date(filterFromDate);
        if (donDate < fromDate) return false;
      }
      if (filterToDate) {
        const donDate = new Date(d.created_at);
        const toDate = new Date(filterToDate);
        toDate.setHours(23, 59, 59, 999);
        if (donDate > toDate) return false;
      }
      return true;
    });
  };

  const exportToCSV = () => {
    const filtered = getFilteredDonations();
    const headers = [
      "Date",
      "Donor Name",
      "Blood Type",
      "Units",
      "Storage",
      "Complications",
      "Status",
    ];
    const rows = filtered.map((d) => [
      new Date(d.created_at).toLocaleString(),
      d.donor_name,
      d.blood_type,
      d.units_collected,
      d.storage_location,
      d.complications || "None",
      d.status,
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `donations-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "✅ Exported",
      description: "Donation records exported to CSV",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <p className="text-gray-600">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredDonations = getFilteredDonations();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => navigate("/hospital/dash")}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Compliance & Records
            </h1>
            <p className="text-gray-600">
              View donation history and generate compliance reports
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">Total Donations</p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.totalDonations}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">Total Units</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.totalUnits}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">Unique Donors</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.uniqueDonors}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">This Month</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.thisMonth}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={stats.withComplications > 0 ? "border-amber-200 bg-amber-50" : ""}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">
                    With Complications
                  </p>
                  <p
                    className={`text-3xl font-bold ${
                      stats.withComplications > 0 ? "text-amber-600" : "text-green-600"
                    }`}
                  >
                    {stats.withComplications}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="bloodTypeFilter">Blood Type</Label>
                  <Select value={filterBloodType} onValueChange={setFilterBloodType}>
                    <SelectTrigger id="bloodTypeFilter">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fromDate">From Date</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={filterFromDate}
                    onChange={(e) => setFilterFromDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="toDate">To Date</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={filterToDate}
                    onChange={(e) => setFilterToDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="donorName">Donor Name</Label>
                  <Input
                    id="donorName"
                    type="text"
                    value={filterDonorName}
                    onChange={(e) => setFilterDonorName(e.target.value)}
                    placeholder="Search..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => {
                    setFilterBloodType("");
                    setFilterFromDate("");
                    setFilterToDate("");
                    setFilterDonorName("");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
                <Button
                  onClick={exportToCSV}
                  className="ml-auto bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export to CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Donation Records ({filteredDonations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDonations.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Donor
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Blood Type
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">
                          Units
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Storage
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDonations.map((donation) => (
                        <tr
                          key={donation.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-gray-900">
                            {new Date(donation.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {donation.donor_name}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded font-semibold">
                              {donation.blood_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-gray-900">
                            {donation.units_collected}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {donation.storage_location}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                              ✓ {donation.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">
                            {donation.complications ? (
                              <span className="text-amber-600 font-semibold">
                                ⚠️ {donation.complications}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legal Compliance Notice */}
          <Card className="bg-purple-50 border-purple-200 mt-6">
            <CardHeader>
              <CardTitle className="text-purple-900">
                📋 Compliance & Legal Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-purple-800 space-y-2">
              <p>
                ✓ All donation records are automatically saved with timestamps
              </p>
              <p>✓ Records are encrypted and compliant with data protection laws</p>
              <p>✓ Maintain records for minimum 7 years as per blood bank standards</p>
              <p>
                ✓ Regular audits ensure data integrity and traceability
              </p>
              <p>
                ✓ All staff access to donation records is logged and audited
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
