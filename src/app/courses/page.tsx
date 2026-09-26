"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Star, Users, Clock, BookOpen } from "lucide-react";

export default function CourseCatalog() {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [department, setDepartment] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (level !== "All") params.set("level", level);
    if (department !== "All") params.set("department", department);

    fetch(`/api/courses?${params}`)
      .then(r => r.json())
      .then(d => { setCourses(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [level, department]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (level !== "All") params.set("level", level);
    if (department !== "All") params.set("department", department);
    fetch(`/api/courses?${params}`)
      .then(r => r.json())
      .then(d => { setCourses(Array.isArray(d) ? d : []); setLoading(false); });
  };

  const departments = ["All", "Oceanography", "Climate Science", "Atmospheric Sciences", "Deep Sea", "Space Applications", "Seismology"];
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  return (
    <div style={{ minHeight: "100vh", background: "hsl(210 20% 98%)" }}>
      {/* Header */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", height: 60, background: "white", borderBottom: "1px solid hsl(214 20% 90%)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ background: "linear-gradient(135deg, hsl(215 84% 30%), hsl(178 68% 35%))", borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "0.75rem" }}>CC</div>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "hsl(215 30% 12%)" }}>Capacity Connect</span>
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/login" className="btn btn-outline btn-sm">Login</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>Course Catalog</h1>
        <p style={{ color: "hsl(215 16% 57%)", marginBottom: 24 }}>Explore {courses.length} courses across all MoES departments</p>

        {/* Search & filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          <form onSubmit={handleSearch} style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "hsl(215 16% 57%)" }} />
            <input className="input" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </form>
          <select className="input" value={level} onChange={e => setLevel(e.target.value)} style={{ maxWidth: 160 }}>
            {levels.map(l => <option key={l} value={l}>{l === "All" ? "All Levels" : l}</option>)}
          </select>
          <select className="input" value={department} onChange={e => setDepartment(e.target.value)} style={{ maxWidth: 200 }}>
            {departments.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
          </select>
        </div>

        {/* Course grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "hsl(215 16% 57%)" }}>Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 60 }}>
            <BookOpen size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>No courses found</h3>
            <p style={{ color: "hsl(215 16% 57%)", fontSize: "0.85rem" }}>Try a different search or filter.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {courses.map((c, i) => (
              <Link key={c.id} href={`/courses/${c.id}`} className="card card-hover animate-fade-in" style={{ textDecoration: "none", padding: "24px", display: "flex", flexDirection: "column", animationDelay: `${i * 0.05}s` }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>{c.thumbnail}</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <span className="badge badge-primary" style={{ fontSize: "0.68rem" }}>{c.level}</span>
                  <span className="badge badge-muted" style={{ fontSize: "0.68rem" }}>{c.department}</span>
                </div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 8, color: "hsl(215 30% 12%)" }}>{c.title}</h3>
                <p style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)", lineHeight: 1.5, marginBottom: 14, flex: 1 }}>
                  {c.description?.slice(0, 110)}...
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "hsl(215 16% 57%)", paddingTop: 12, borderTop: "1px solid hsl(214 20% 92%)" }}>
                  <span>By {c.trainer}</span>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={12} /> {c.duration}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Users size={12} /> {c.enrolledCount}</span>
                    {c.rating > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Star size={12} fill="hsl(38 80% 40%)" style={{ color: "hsl(38 80% 40%)" }} /> {c.rating}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
