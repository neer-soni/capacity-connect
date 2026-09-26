"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Award, CheckCircle, XCircle, Eye, Download, QrCode, Loader } from "lucide-react";

interface CertificateItem {
  id: string;
  user: string;
  course: string;
  score: string;
  hash: string;
  validatedByAdmin: boolean;
  issuedAt: string;
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/certificates");
      if (res.ok) {
        const data = await res.json();
        setCertificates(Array.isArray(data) ? data : []);
      }
    } catch {}
    setLoading(false);
  }

  async function handleAction(certId: string, action: "validate" | "reject") {
    setActing(certId);
    try {
      const res = await fetch(`/api/admin/certificates/${certId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        await fetchCertificates();
      } else {
        alert("Action failed. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setActing(null);
  }

  const pendingCerts = certificates.filter((c) => !c.validatedByAdmin);
  const validatedCerts = certificates.filter((c) => c.validatedByAdmin);

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Certificate Validation</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 28 }}>Review and validate issued certificates before they become official</p>

      {loading ? (
        <div className="card" style={{ padding: 48, textAlign: "center", color: "hsl(215 16% 57%)" }}>
          Loading certificates...
        </div>
      ) : (
        <>
          {/* Pending */}
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>⏳ Pending Validation ({pendingCerts.length})</h2>
          {pendingCerts.length === 0 ? (
            <div className="card" style={{ padding: "24px", textAlign: "center", marginBottom: 28, color: "hsl(215 16% 57%)" }}>
              ✓ No certificates pending validation
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {pendingCerts.map((cert) => (
                <div key={cert.id} className="card animate-fade-in" style={{ padding: "20px", display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 50, height: 50, borderRadius: 10, background: "hsl(38 95% 94%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🏆</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 2 }}>{cert.user}</div>
                    <div style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>
                      {cert.course} · Score: {cert.score} · Hash: <code style={{ fontSize: "0.75rem", background: "hsl(215 84% 96%)", padding: "2px 6px", borderRadius: 3 }}>{cert.hash}</code>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {acting === cert.id ? (
                      <span style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)", display: "flex", alignItems: "center", gap: 6 }}>
                        <Loader size={14} className="spin" /> Processing...
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction(cert.id, "validate")}
                          className="btn btn-sm"
                          style={{ background: "hsl(145 63% 40%)", color: "white" }}
                        >
                          <CheckCircle size={14} /> Validate
                        </button>
                        <button
                          onClick={() => handleAction(cert.id, "reject")}
                          className="btn btn-sm"
                          style={{ background: "hsl(0 72% 51%)", color: "white" }}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Validated */}
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>✅ Validated Certificates ({validatedCerts.length})</h2>
          {validatedCerts.length === 0 ? (
            <div className="card" style={{ padding: "24px", textAlign: "center", color: "hsl(215 16% 57%)" }}>
              No validated certificates yet
            </div>
          ) : (
            <div className="card" style={{ overflow: "hidden" }}>
              <div className="table-container">
                <table>
                  <thead><tr><th>User</th><th>Course</th><th>Score</th><th>Issued</th><th>Hash</th><th>Actions</th></tr></thead>
                  <tbody>
                    {validatedCerts.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.user}</td>
                        <td>{c.course}</td>
                        <td style={{ fontWeight: 600, color: "hsl(145 63% 35%)" }}>{c.score}</td>
                        <td style={{ fontSize: "0.82rem" }}>{new Date(c.issuedAt).toLocaleDateString("en-IN")}</td>
                        <td><code style={{ fontSize: "0.75rem", background: "hsl(215 84% 96%)", padding: "2px 6px", borderRadius: 3 }}>{c.hash}</code></td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="btn btn-ghost btn-sm"><Eye size={13} /></button>
                            <button className="btn btn-ghost btn-sm"><Download size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}