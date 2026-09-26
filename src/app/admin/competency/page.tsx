"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockCompetencyMap } from "@/lib/mock-data";
import { Search, Star, BookOpen, Users, Map } from "lucide-react";

export default function CompetencyPage() {
  const [search, setSearch] = useState("");
  const filtered = mockCompetencyMap.filter((t) =>
    t.trainer.toLowerCase().includes(search.toLowerCase()) ||
    t.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Competency Mapping</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 28 }}>Identify the best-fit trainer for any subject based on verified skills, ratings and teaching history</p>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 400, marginBottom: 24 }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "hsl(215 16% 57%)" }} />
        <input className="input" placeholder='Search trainers or skills e.g. "Machine Learning"' value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {filtered.map((t, i) => (
          <div key={t.trainer} className="card card-hover animate-fade-in" style={{ padding: "22px", animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div className="avatar" style={{ width: 48, height: 48, fontSize: "0.9rem" }}>
                {t.trainer.split(" ").slice(0, 2).map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4 }}>{t.trainer}</h3>
                <div style={{ display: "flex", gap: 14, marginBottom: 12, fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={13} fill="hsl(38 80% 40%)" style={{ color: "hsl(38 80% 40%)" }} /> {t.rating || "—"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <BookOpen size={13} /> {t.courses} course{t.courses !== 1 ? "s" : ""}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {t.skills.map((s) => (
                    <span key={s} className="skill-pill" style={{ fontSize: "0.75rem" }}>{s}</span>
                  ))}
                </div>
              </div>
              <button className="btn btn-outline btn-sm" style={{ fontSize: "0.75rem", flexShrink: 0 }}>
                Assign Subject
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state card" style={{ padding: 48 }}>
          <Map size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4 }}>No trainers found</h3>
          <p style={{ fontSize: "0.85rem" }}>Try searching for a different skill or trainer name.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
