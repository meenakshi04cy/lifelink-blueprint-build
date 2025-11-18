// src/pages/admin/AdminHospitalsPending.tsx
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  FileText,
  ChevronRight,
  Search,
  Building2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AppRow = {
  id: string;
  hospital_name?: string;
  name?: string;
  type?: string;
  city?: string;
  contact_phone?: string;
  contact_email?: string;
  emergency_number?: string;
  created_at?: string;
  status?: string;
  documents?: any[];
};

export default function AdminHospitalsPending() {
  // keep supabase typed as any for runtime calls to avoid deep TS instantiation
  const sb = supabase as any;

  const [hospitals, setHospitals] = useState<AppRow[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "all">(
    "pending"
  );
  const [selectedHospital, setSelectedHospital] = useState<AppRow | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | "info" | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    if (!search) {
      setFilteredHospitals(hospitals);
      return;
    }
    const s = search.toLowerCase();
    setFilteredHospitals(
      hospitals.filter((h) => {
        const name = (h.hospital_name || h.name || "").toLowerCase();
        const city = (h.city || "").toLowerCase();
        const phone = (h.contact_phone || h.emergency_number || "").toLowerCase();
        return name.includes(s) || city.includes(s) || phone.includes(s);
      })
    );
  }, [search, hospitals]);

  useEffect(() => {
    if (selectedHospital) loadAuditLogs(selectedHospital.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHospital]);

  async function loadHospitals() {
    setLoading(true);
    try {
      // use sb (any) to avoid TS generic instantiation issues
      let query: any = sb.from("hospital_applications").select("*");

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      query = query.order("created_at", { ascending: false });

      const res = await query;
      if (res.error) throw res.error;
      const data = res.data as AppRow[];
      setHospitals(data || []);
      setFilteredHospitals(data || []);
    } catch (err: any) {
      console.error("Failed to load hospitals", err);
      toast({
        title: "Error loading hospitals",
        description: err?.message ?? String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadAuditLogs(hospitalId: string) {
    try {
      const res = await sb
        .from("hospital_application_audit")
        .select("*")
        .eq("application_id", hospitalId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (res?.error) {
        // audit table may not exist or be inaccessible; ignore
        console.warn("Audit load error:", res.error);
        setAuditLogs([]);
        return;
      }
      setAuditLogs(res?.data || []);
    } catch (err) {
      console.error("audit logs load error", err);
      setAuditLogs([]);
    }
  }

  // Build a usable URL for a doc item; supports a few return shapes
  const docUrl = async (doc: any) => {
    if (!doc) return null;
    if (doc.url) return doc.url;
    // handle storage objects with bucket/path
    try {
      if (doc.bucket && doc.path) {
        // try getPublicUrl (shape differs across sdk versions)
        try {
          const publicRes = await (sb.storage.from(doc.bucket) as any).getPublicUrl(doc.path);
          // publicRes may be { data: { publicUrl } } or { data: { publicUrl: string } }
          const pub = publicRes?.data?.publicUrl ?? publicRes?.data?.publicURL ?? publicRes?.publicUrl;
          if (pub) return pub;
        } catch (e) {
          // ignore and try signed url
        }

        // try createSignedUrl (returns { data, error } shape)
        try {
          const signed = await (sb.storage.from(doc.bucket) as any).createSignedUrl(doc.path, 60 * 60);
          const signedUrl = signed?.data?.signedUrl ?? signed?.data?.signedURL ?? signed?.signedURL ?? signed?.signedUrl;
          if (signedUrl) return signedUrl;
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      console.warn("docUrl error", e);
    }
    return null;
  };

  const handleReviewAction = async () => {
    if (!selectedHospital || !reviewAction || !reviewNotes.trim()) {
      toast({
        title: "Error",
        description: "Please enter notes and select an action",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // try to get admin id (if auth available)
      let adminId: string | null = null;
      try {
        const userRes = await sb.auth.getUser();
        adminId = userRes?.data?.user?.id ?? null;
      } catch {
        adminId = null;
      }

      const newStatus =
        reviewAction === "approve" ? "approved" : reviewAction === "reject" ? "rejected" : "info_requested";

      const updatePayload: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (reviewAction === "approve") updatePayload.verified_at = new Date().toISOString();
      if (adminId) updatePayload.verified_by = adminId;
      if (reviewAction === "reject") updatePayload.rejection_reason = reviewNotes;

      const upd = await sb.from("hospital_applications").update(updatePayload).eq("id", selectedHospital.id);
      if (upd?.error) throw upd.error;

      // attempt to insert audit row (non-fatal)
      try {
        const auditRow = {
          application_id: selectedHospital.id,
          action: reviewAction === "approve" ? "approved" : reviewAction === "reject" ? "rejected" : "info_requested",
          notes: reviewNotes,
          actor_id: adminId,
          created_at: new Date().toISOString(),
        };
        const auditInsert = await sb.from("hospital_application_audit").insert([auditRow]);
        if (auditInsert?.error) {
          console.warn("audit insert warning:", auditInsert.error);
        }
      } catch (e) {
        console.warn("audit insert failed (ignored)", e);
      }

      toast({
        title:
          reviewAction === "approve"
            ? "Hospital Approved"
            : reviewAction === "reject"
            ? "Hospital Rejected"
            : "Requested More Info",
        description:
          reviewAction === "approve"
            ? `${selectedHospital.hospital_name || selectedHospital.name} has been approved.`
            : reviewAction === "reject"
            ? `${selectedHospital.hospital_name || selectedHospital.name} was rejected.`
            : "Hospital asked to submit additional information.",
      });

      // refresh
      setShowReviewModal(false);
      setReviewNotes("");
      setReviewAction(null);
      setSelectedHospital(null);
      await loadHospitals();
    } catch (err: any) {
      console.error("Review action failed", err);
      toast({
        title: "Action failed",
        description: err?.message ?? String(err),
        variant: "destructive",
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
            <div className="space-y-6">
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
                      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
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

              {loading ? (
                <Card>
                  <CardContent className="pt-12 text-center text-gray-500">Loading hospitals...</CardContent>
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
                          <div className="flex-1 space-y-2" onClick={() => setSelectedHospital(hospital)}>
                            <h3 className="font-semibold text-gray-900">
                              {hospital.hospital_name || hospital.name}
                            </h3>

                            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {hospital.city}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {hospital.contact_phone || hospital.emergency_number}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {hospital.created_at ? new Date(hospital.created_at).toLocaleDateString() : ""}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 ml-4">
                            <div className="text-right">
                              <div
                                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                  hospital.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : hospital.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {hospital.status ? hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1) : "Unknown"}
                              </div>
                            </div>
                            <Button onClick={() => setSelectedHospital(hospital)} variant="ghost" size="sm">
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
            <div>
              <Button
                onClick={() => {
                  setSelectedHospital(null);
                  setShowReviewModal(false);
                  setReviewAction(null);
                  setReviewNotes("");
                }}
                variant="ghost"
                className="mb-6"
              >
                ← Back to List
              </Button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
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
                          <p className="font-semibold text-gray-900">{selectedHospital.hospital_name || selectedHospital.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Type</p>
                          <p className="font-semibold text-gray-900 capitalize">{selectedHospital.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">City</p>
                          <p className="font-semibold text-gray-900">{selectedHospital.city}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Phone</p>
                          <p className="font-semibold text-gray-900">{selectedHospital.contact_phone || selectedHospital.emergency_number}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedHospital.documents && selectedHospital.documents.length > 0 ? (
                          <div className="space-y-2">
                            {selectedHospital.documents.map((d: any, idx: number) => (
                              <div key={idx} className="border rounded p-4 bg-gray-50 flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{d.fileName || d.name || d.path || "Document"}</p>
                                  <p className="text-xs text-gray-600">{d.type || d.mimeType || ""}</p>
                                </div>
                                <div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      const url = await docUrl(d);
                                      if (url) window.open(url, "_blank", "noopener");
                                      else toast({ title: "No preview", description: "Document not publicly available", variant: "destructive" });
                                    }}
                                  >
                                    View
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border rounded p-4 bg-gray-50">
                            <p className="text-xs text-gray-600">No documents uploaded</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

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
                          {auditLogs.map((log: any) => (
                            <div key={log.id} className="border-l-2 border-gray-300 pl-4 pb-3">
                              <p className="text-sm font-semibold text-gray-900 capitalize">{log.action || log.action_type || log.action}</p>
                              <p className="text-xs text-gray-600 mt-1">{log.notes}</p>
                              <p className="text-xs text-gray-500 mt-1">{new Date(log.created_at || log.createdAt || "").toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Review & Action</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!showReviewModal ? (
                        <>
                          <Button onClick={() => { setShowReviewModal(true); setReviewAction("approve"); }} className="w-full bg-green-600 hover:bg-green-700">Approve Hospital</Button>
                          <Button onClick={() => { setShowReviewModal(true); setReviewAction("info"); }} variant="outline" className="w-full">Request Info</Button>
                          <Button onClick={() => { setShowReviewModal(true); setReviewAction("reject"); }} variant="destructive" className="w-full">Reject</Button>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 mb-2">Action: {reviewAction?.charAt(0).toUpperCase() + reviewAction?.slice(1)}</p>
                            <div className={`text-xs px-3 py-2 rounded ${reviewAction === "approve" ? "bg-green-100 text-green-800" : reviewAction === "reject" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                              {reviewAction === "approve" && "Hospital will be marked as verified"}
                              {reviewAction === "reject" && "Hospital will be marked as rejected and notified"}
                              {reviewAction === "info" && "Hospital will be asked to provide additional information"}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="notes" className="text-xs">Required: Add your notes</Label>
                            <Textarea id="notes" placeholder={reviewAction === "approve" ? "Reason for approval..." : reviewAction === "reject" ? "Reason for rejection..." : "What information is needed?..." } value={reviewNotes} onChange={(e)=>setReviewNotes(e.target.value)} className="mt-2 text-sm resize-none" rows={4} />
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={() => { setShowReviewModal(false); setReviewAction(null); setReviewNotes(""); }} variant="outline" size="sm" className="flex-1">Cancel</Button>
                            <Button onClick={handleReviewAction} disabled={submitting || !reviewNotes.trim()} size="sm" className="flex-1" variant={reviewAction === "approve" ? "default" : reviewAction === "reject" ? "destructive" : "outline"}>
                              {submitting ? "Submitting..." : "Confirm"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className={`text-center py-3 px-4 rounded-lg ${selectedHospital.status === "pending" ? "bg-amber-100" : selectedHospital.status === "approved" ? "bg-green-100" : "bg-red-100"}`}>
                        <p className="text-xs text-gray-600">Current Status</p>
                        <p className={`text-lg font-bold capitalize ${selectedHospital.status === "pending" ? "text-amber-800" : selectedHospital.status === "approved" ? "text-green-800" : "text-red-800"}`}>
                          {selectedHospital.status}
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
}
