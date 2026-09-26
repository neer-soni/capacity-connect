"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Award, Download, ExternalLink, CheckCircle, Clock } from "lucide-react";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trainee/certificates").then(r => r.json()).then(d => {
      setCertificates(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>My Certificates</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 28 }}>Your earned certifications from completed courses</p>

      {loading ? (
        <div className="card" style={{ padding: 48, textAlign: "center", color: "hsl(215 16% 57%)" }}>Loading certificates...</div>
      ) : certificates.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: "center" }}>
          <Award size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <h3 style={{ fontWeight: 700, marginBottom: 6 }}>No certificates yet</h3>
          <p style={{ color: "hsl(215 16% 57%)", fontSize: "0.85rem" }}>Complete a course to earn your first certificate!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {certificates.map((cert, i) => (
            <div key={cert.id} className="card animate-fade-in" style={{ padding: 0, overflow: "hidden", animationDelay: `${i * 0.08}s` }}>
              {/* Certificate visual */}
              <div style={{
                background: "linear-gradient(135deg, hsl(215 84% 25%), hsl(178 68% 30%))",
                padding: "32px 28px",
                color: "white",
                textAlign: "center",
                position: "relative",
              }}>
                <div style={{ position: "absolute", top: 12, right: 14 }}>
                  {cert.validatedByAdmin ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: 6, fontSize: "0.7rem" }}>
                      <CheckCircle size={12} /> Validated
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: 6, fontSize: "0.7rem" }}>
                      <Clock size={12} /> Pending Validation
                    </span>
                  )}
                </div>
                <Award size={36} style={{ marginBottom: 10, opacity: 0.9 }} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 4 }}>Certificate of Completion</h3>
                <p style={{ fontSize: "0.85rem", opacity: 0.85 }}>{cert.course?.title}</p>
                <p style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: 8 }}>
                  Issued: {new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)" }}>
                    Hash: <code style={{ background: "hsl(215 84% 96%)", padding: "2px 6px", borderRadius: 3, fontSize: "0.72rem" }}>{cert.hash}</code>
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost btn-sm"><Download size={13} /></button>
                  <button className="btn btn-ghost btn-sm"><ExternalLink size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
