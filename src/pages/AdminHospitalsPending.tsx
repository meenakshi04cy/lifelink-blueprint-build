import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  FileText,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';
import {
  getPendingHospitals,
  approveHospital,
  rejectHospital,
  requestAdditionalInfo,
  getHospitalAuditLogs,
} from '@/lib/mockApi.hospital';
import { useToast } from '@/hooks/use-toast';

interface Hospital {
  id: string;
  name: string;
  type: string;
  city: string;
  emergencyNumber: string;
  createdAt: string;
  verificationStatus: string;
}

const AdminHospitalsPending = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'info' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Load hospitals
  useEffect(() => {
    loadHospitals();
  }, [statusFilter]);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const data = await getPendingHospitals({ status: statusFilter });
      setHospitals(data as Hospital[]);
      setFilteredHospitals(data as Hospital[]);
    } catch (err: any) {
      toast({
        title: 'Error loading hospitals',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter hospitals based on search
  useEffect(() => {
    if (!search) {
      setFilteredHospitals(hospitals);
      return;
    }

    const searchLower = search.toLowerCase();
    setFilteredHospitals(
      hospitals.filter(
        (h) =>
          h.name.toLowerCase().includes(searchLower) ||
          h.city.toLowerCase().includes(searchLower) ||
          h.emergencyNumber.includes(search)
      )
    );
  }, [search, hospitals]);

  // Load audit logs for selected hospital
  useEffect(() => {
    if (selectedHospital) {
      loadAuditLogs(selectedHospital.id);
    }
  }, [selectedHospital]);

  const loadAuditLogs = async (hospitalId: string) => {
    try {
      const logs = await getHospitalAuditLogs(hospitalId);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    }
  };

  // Handle review action
  const handleReviewAction = async () => {
    if (!selectedHospital || !reviewAction || !reviewNotes.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your notes and select an action',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const adminId = 'admin-1'; // In production, get from auth

      if (reviewAction === 'approve') {
        await approveHospital(selectedHospital.id, adminId, reviewNotes);
        toast({
          title: 'Hospital Approved',
          description: `${selectedHospital.name} has been verified.`,
        });
      } else if (reviewAction === 'reject') {
        await rejectHospital(selectedHospital.id, adminId, reviewNotes);
        toast({
          title: 'Hospital Rejected',
          description: `${selectedHospital.name} rejection has been recorded.`,
        });
      } else if (reviewAction === 'info') {
        await requestAdditionalInfo(selectedHospital.id, adminId, reviewNotes);
        toast({
          title: 'Information Requested',
          description: `Hospital has been notified to submit additional information.`,
        });
      }

      setShowReviewModal(false);
      setReviewNotes('');
      setReviewAction(null);
      loadHospitals();
      setSelectedHospital(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hospital Verification Queue</h1>
            <p className="text-gray-600">Review and verify hospital registrations</p>
          </div>

          {!selectedHospital ? (
            // List View
            <div className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="search" className="text-xs text-gray-600">
                        Search
                      </Label>
                      <div className="relative mt-2">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="search"
                          placeholder="Hospital name, city, or phone..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="w-full md:w-48">
                      <Label htmlFor="status" className="text-xs text-gray-600">
                        Status
                      </Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger id="status" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* List of Hospitals */}
              {loading ? (
                <Card>
                  <CardContent className="pt-12 text-center text-gray-500">
                    Loading hospitals...
                  </CardContent>
                </Card>
              ) : filteredHospitals.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hospitals found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredHospitals.map((hospital) => (
                    <Card
                      key={hospital.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-amber-500"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div
                            className="flex-1 space-y-2"
                            onClick={() => setSelectedHospital(hospital)}
                          >
                            <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {hospital.city}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {hospital.emergencyNumber}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(hospital.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 ml-4">
                            <div className="text-right">
                              <div
                                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                  hospital.verificationStatus === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : hospital.verificationStatus === 'approved'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {hospital.verificationStatus.charAt(0).toUpperCase() +
                                  hospital.verificationStatus.slice(1)}
                              </div>
                            </div>
                            <Button
                              onClick={() => setSelectedHospital(hospital)}
                              variant="ghost"
                              size="sm"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Detail View
            <div>
              <Button
                onClick={() => {
                  setSelectedHospital(null);
                  setShowReviewModal(false);
                  setReviewAction(null);
                  setReviewNotes('');
                }}
                variant="ghost"
                className="mb-6"
              >
                ← Back to List
              </Button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Hospital Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Hospital Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Name</p>
                          <p className="font-semibold text-gray-900">{selectedHospital.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Type</p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {selectedHospital.type}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">City</p>
                          <p className="font-semibold text-gray-900">{selectedHospital.city}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Emergency Number</p>
                          <p className="font-semibold text-gray-900">
                            {selectedHospital.emergencyNumber}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Document Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded p-4 bg-gray-50">
                          <p className="text-sm font-semibold text-gray-900 mb-2">
                            License Document
                          </p>
                          <p className="text-xs text-gray-600 mb-3">
                            Click to preview or download
                          </p>
                          <Button variant="outline" size="sm">
                            View License
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Audit Log */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Audit History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {auditLogs.length === 0 ? (
                        <p className="text-xs text-gray-500">No audit entries yet</p>
                      ) : (
                        <div className="space-y-3">
                          {auditLogs.map((log) => (
                            <div key={log.id} className="border-l-2 border-gray-300 pl-4 pb-3">
                              <p className="text-sm font-semibold text-gray-900 capitalize">
                                {log.action}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">{log.notes}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(log.createdAt).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Review Panel */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Review & Action</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!showReviewModal ? (
                        <>
                          <Button
                            onClick={() => {
                              setShowReviewModal(true);
                              setReviewAction('approve');
                            }}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            Approve Hospital
                          </Button>

                          <Button
                            onClick={() => {
                              setShowReviewModal(true);
                              setReviewAction('info');
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            Request Info
                          </Button>

                          <Button
                            onClick={() => {
                              setShowReviewModal(true);
                              setReviewAction('reject');
                            }}
                            variant="destructive"
                            className="w-full"
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 mb-2">
                              Action: {reviewAction?.charAt(0).toUpperCase() + reviewAction?.slice(1)}
                            </p>
                            <div
                              className={`text-xs px-3 py-2 rounded ${
                                reviewAction === 'approve'
                                  ? 'bg-green-100 text-green-800'
                                  : reviewAction === 'reject'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {reviewAction === 'approve' &&
                                'Hospital will be marked as verified'}
                              {reviewAction === 'reject' &&
                                'Hospital will be marked as rejected and notified'}
                              {reviewAction === 'info' &&
                                'Hospital will be asked to provide additional information'}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="notes" className="text-xs">
                              Required: Add your notes
                            </Label>
                            <Textarea
                              id="notes"
                              placeholder={
                                reviewAction === 'approve'
                                  ? 'Reason for approval...'
                                  : reviewAction === 'reject'
                                    ? 'Reason for rejection...'
                                    : 'What information is needed?...'
                              }
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              className="mt-2 text-sm resize-none"
                              rows={4}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setShowReviewModal(false);
                                setReviewAction(null);
                                setReviewNotes('');
                              }}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleReviewAction}
                              disabled={submitting || !reviewNotes.trim()}
                              size="sm"
                              className="flex-1"
                              variant={
                                reviewAction === 'approve'
                                  ? 'default'
                                  : reviewAction === 'reject'
                                    ? 'destructive'
                                    : 'outline'
                              }
                            >
                              {submitting ? 'Submitting...' : 'Confirm'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Status */}
                  <Card>
                    <CardContent className="pt-6">
                      <div
                        className={`text-center py-3 px-4 rounded-lg ${
                          selectedHospital.verificationStatus === 'pending'
                            ? 'bg-amber-100'
                            : selectedHospital.verificationStatus === 'approved'
                              ? 'bg-green-100'
                              : 'bg-red-100'
                        }`}
                      >
                        <p className="text-xs text-gray-600">Current Status</p>
                        <p
                          className={`text-lg font-bold capitalize ${
                            selectedHospital.verificationStatus === 'pending'
                              ? 'text-amber-800'
                              : selectedHospital.verificationStatus === 'approved'
                                ? 'text-green-800'
                                : 'text-red-800'
                          }`}
                        >
                          {selectedHospital.verificationStatus}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminHospitalsPending;

import { Building2 } from 'lucide-react';
