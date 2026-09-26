"use client";
import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Star, BookOpen, Map, Loader2 } from "lucide-react";

interface CompetencyEntry {
  id: string;
  trainer: string;
  avatar: string;
  department: string;
  verified: boolean;
  skills: string[];
  rating: number;
  courses: number;
}

export default function CompetencyPage() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<CompetencyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/competency");
      if (res.ok) {
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      }
    } catch {
      console.error("Failed to load competency data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = data.filter(
    (t) =>
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

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Loader2 size={32} className="spinner" style={{ color: "hsl(215 84% 52%)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card" style={{ padding: 48 }}>
          <Map size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4 }}>No trainers found</h3>
          <p style={{ fontSize: "0.85rem" }}>
            {data.length === 0
              ? "No trainers are registered in the system yet."
              : "Try searching for a different skill or trainer name."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {filtered.map((t, i) => (
            <div key={t.id} className="card card-hover animate-fade-in" style={{ padding: "22px", animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div className="avatar" style={{ width: 48, height: 48, fontSize: "0.9rem" }}>
                  {t.avatar || t.trainer.split(" ").slice(0, 2).map((n) => n[0]).join("").slice(0, 2)}
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
                    {t.skills.length > 0 ? (
                      t.skills.map((s) => (
                        <span key={s} className="skill-pill" style={{ fontSize: "0.75rem" }}>{s}</span>
                      ))
                    ) : (
                      <span style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)", fontStyle: "italic" }}>No skills listed</span>
                    )}
                  </div>
                </div>
                <button className="btn btn-outline btn-sm" style={{ fontSize: "0.75rem", flexShrink: 0 }}>
                  Assign Subject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
