"use client";
import { useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MediaUploader from "@/components/media/MediaUploader";
import { ArrowLeft, Plus, Trash2, Save, Send, CheckCircle, Video, FileText, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuizQuestion {
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
}

interface UploadedResource {
  id: string;
  title: string;
  type: string;
  size: string;
  url: string;
}

const DEPARTMENTS = [
  "Oceanography", "Climate Science", "Atmospheric Sciences",
  "Seismology", "Deep Sea Research", "Space Applications",
  "Hydrology", "Marine Biology",
];

const THUMBNAILS = ["🌊", "🌍", "🌤️", "🐙", "🛰️", "🏔️", "📡", "🔬", "🌡️", "⚡"];

function typeIcon(type: string) {
  if (type === "video") return <Video size={16} style={{ color: "hsl(215 84% 30%)" }} />;
  if (type === "pdf") return <FileText size={16} style={{ color: "hsl(0 72% 51%)" }} />;
  return <BookOpen size={16} style={{ color: "hsl(38 80% 40%)" }} />;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NewCoursePage() {
  const router = useRouter();

  // Wizard state
  const [step, setStep] = useState(1);
  const [courseId, setCourseId] = useState<string | null>(null); // set after step 1 saves
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — Course Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState("");
  const [thumbnail, setThumbnail] = useState("📚");

  // Step 2 — Uploaded resources (refreshed from API after upload)
  const [uploadedResources, setUploadedResources] = useState<UploadedResource[]>([]);

  // Step 3 — Quiz
  const [quizTitle, setQuizTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [deadline, setDeadline] = useState("");
  const [skipQuiz, setSkipQuiz] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { text: "", options: ["", "", "", ""], correctIndex: 0 },
  ]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function addQuestion() {
    setQuestions((prev) => [...prev, { text: "", options: ["", "", "", ""], correctIndex: 0 }]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, field: keyof QuizQuestion, value: string | number) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) as [string, string, string, string] }
          : q
      )
    );
  }

  // Refresh resources from DB after upload
  const refreshResources = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/courses/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUploadedResources(data.resources || []);
      }
    } catch {}
  }, []);

  // ── Step 1: Save Course Info ──────────────────────────────────────────────
  async function handleSaveCourseInfo() {
    setError(null);
    if (!title.trim()) { setError("Course title is required."); return; }
    if (!description.trim()) { setError("Course description is required."); return; }

    setSaving(true);
    try {
      const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);

      if (courseId) {
        // Update existing draft
        await fetch(`/api/trainer/courses/${courseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, department, level, duration, tags: tagArray, thumbnail }),
        });
        setStep(2);
      } else {
        // Create new course
        const res = await fetch("/api/trainer/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, department, level, duration, tags: tagArray, thumbnail }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create course");
        setCourseId(data.id);
        setStep(2);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    }
    setSaving(false);
  }

  // ── Step 3: Save Quiz ──────────────────────────────────────────────────────
  async function handleSaveQuiz() {
    if (skipQuiz) { setStep(4); return; }

    const validQs = questions.filter((q) => q.text.trim() && q.options.every((o) => o.trim()));
    if (validQs.length === 0) {
      setError("Add at least one complete question (all 4 options filled), or choose to skip the quiz.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/trainer/courses/${courseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quizTitle || `${title} — Assessment`,
          timeLimit,
          deadline: deadline || null,
          questions: validQs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save quiz");
      setStep(4);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save quiz.");
    }
    setSaving(false);
  }

  // ── Step 4: Submit for Approval ────────────────────────────────────────────
  async function handleSubmit() {
    if (!courseId) return;
    setSaving(true);
    setError(null);
    try {
      await fetch(`/api/trainer/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending" }),
      });
      router.push("/trainer/courses");
    } catch {
      setError("Failed to submit course. Please try again.");
    }
    setSaving(false);
  }

  async function handleSaveDraft() {
    router.push("/trainer/courses");
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  const STEPS = ["Course Info", "Resources", "Quizzes", "Review"];

  return (
    <DashboardLayout>
      <Link
        href="/trainer/courses"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "hsl(215 16% 57%)", fontSize: "0.85rem", textDecoration: "none", marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Back to My Courses
      </Link>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Create New Course</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 28 }}>
        Fill in the details below. You can save as draft and publish later.
      </p>

      {/* Step indicators */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => { if (courseId && i + 1 <= step) setStep(i + 1); }}
            style={{
              flex: 1, padding: "10px 16px", borderRadius: 8,
              background: step === i + 1 ? "hsl(215 84% 30%)" : step > i + 1 ? "hsl(145 63% 92%)" : "hsl(210 20% 96%)",
              color: step === i + 1 ? "white" : step > i + 1 ? "hsl(145 63% 35%)" : "hsl(215 16% 57%)",
              fontWeight: 600, fontSize: "0.82rem", border: "none",
              cursor: courseId && i + 1 <= step ? "pointer" : "default",
              transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            {step > i + 1 && <CheckCircle size={14} />}
            {i + 1}. {s}
          </button>
        ))}
      </div>

      <div className="card animate-fade-in" style={{ padding: "32px", maxWidth: 740 }}>
        {/* Error banner */}
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 8, background: "hsl(0 72% 96%)", color: "hsl(0 72% 40%)", fontSize: "0.85rem", marginBottom: 18, border: "1px solid hsl(0 72% 88%)" }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── STEP 1: COURSE INFO ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Course Title *</label>
              <input className="input" placeholder="e.g. Introduction to Oceanography" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Description *</label>
              <textarea className="input" rows={4} placeholder="Describe what this course covers..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Department</label>
                <select className="input" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Level</label>
                <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Duration</label>
                <input className="input" placeholder="e.g. 8 weeks" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Skill Tags</label>
                <input className="input" placeholder="Python, GIS, Data Analysis" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 8 }}>Course Thumbnail Icon</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {THUMBNAILS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setThumbnail(t)}
                    style={{
                      fontSize: "1.8rem", padding: "8px 10px", borderRadius: 8, border: "2px solid",
                      borderColor: thumbnail === t ? "hsl(215 84% 30%)" : "hsl(214 20% 88%)",
                      background: thumbnail === t ? "hsl(215 84% 96%)" : "transparent",
                      cursor: "pointer", transition: "all 0.1s",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: RESOURCES ── */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>Upload Course Media</h3>
            <p style={{ fontSize: "0.85rem", color: "hsl(215 16% 57%)", marginBottom: 20 }}>
              Upload videos, PDFs, or slide decks. Each file you upload is immediately saved to this course in the database and visible to enrolled trainees.
            </p>

            {courseId && (
              <MediaUploader
                courseId={courseId}
                purpose="resource"
                maxFiles={20}
                onUploadComplete={() => refreshResources(courseId)}
              />
            )}

            {/* Uploaded resources list */}
            {uploadedResources.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: 10 }}>
                  Uploaded ({uploadedResources.length} files)
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {uploadedResources.map((r) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "hsl(210 20% 98%)", borderRadius: 8, border: "1px solid hsl(214 20% 90%)" }}>
                      {typeIcon(r.type)}
                      <span style={{ flex: 1, fontSize: "0.85rem", fontWeight: 600 }}>{r.title}</span>
                      <span style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>{r.size}</span>
                      <span className={`badge ${r.type === "video" ? "badge-primary" : r.type === "pdf" ? "badge-error" : "badge-warning"}`} style={{ fontSize: "0.65rem" }}>
                        {r.type?.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: QUIZ ── */}
        {step === 3 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 4 }}>Create Assessment Quiz</h3>
                <p style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>
                  Trainees must pass this quiz (60%+) to receive their certificate.
                </p>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", cursor: "pointer" }}>
                <input type="checkbox" checked={skipQuiz} onChange={(e) => setSkipQuiz(e.target.checked)} />
                Skip quiz for now
              </label>
            </div>

            {!skipQuiz && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Quiz Title</label>
                    <input className="input" placeholder={`${title} — Assessment`} value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Time Limit (mins)</label>
                    <input type="number" className="input" min={5} max={180} value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Deadline (optional)</label>
                  <input type="datetime-local" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ maxWidth: 280 }} />
                </div>

                {questions.map((q, qi) => (
                  <div key={qi} style={{ background: "hsl(210 20% 97%)", borderRadius: 10, padding: "20px", marginBottom: 14, border: "1px solid hsl(214 20% 90%)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <h4 style={{ fontSize: "0.88rem", fontWeight: 700 }}>Question {qi + 1}</h4>
                      {questions.length > 1 && (
                        <button type="button" onClick={() => removeQuestion(qi)} className="btn btn-ghost btn-sm" style={{ color: "hsl(0 72% 51%)" }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <input
                      className="input"
                      placeholder="Enter your question..."
                      value={q.text}
                      onChange={(e) => updateQuestion(qi, "text", e.target.value)}
                      style={{ marginBottom: 12 }}
                    />
                    <p style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)", marginBottom: 8 }}>
                      Select the radio button next to the correct answer:
                    </p>
                    {q.options.map((opt, oi) => (
                      <div key={oi} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={q.correctIndex === oi}
                          onChange={() => updateQuestion(qi, "correctIndex", oi)}
                          style={{ accentColor: "hsl(145 63% 40%)", width: 16, height: 16, flexShrink: 0 }}
                        />
                        <input
                          className="input"
                          placeholder={`Option ${["A", "B", "C", "D"][oi]}`}
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                ))}

                <button type="button" onClick={addQuestion} className="btn btn-outline" style={{ width: "100%" }}>
                  <Plus size={16} /> Add Another Question
                </button>
              </>
            )}
          </div>
        )}

        {/* ── STEP 4: REVIEW ── */}
        {step === 4 && (
          <div>
            <div style={{ fontSize: "3rem", textAlign: "center", marginBottom: 16 }}>{thumbnail}</div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, textAlign: "center", marginBottom: 4 }}>{title}</h3>
            <p style={{ color: "hsl(215 16% 57%)", textAlign: "center", fontSize: "0.85rem", marginBottom: 24 }}>{description}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Department", value: department },
                { label: "Level", value: level },
                { label: "Duration", value: duration || "—" },
                { label: "Media Files", value: `${uploadedResources.length} uploaded` },
                { label: "Quiz", value: skipQuiz ? "Skipped" : `${questions.filter(q => q.text.trim()).length} questions` },
                { label: "Tags", value: tags || "—" },
              ].map((item) => (
                <div key={item.label} style={{ padding: "12px 14px", background: "hsl(210 20% 98%)", borderRadius: 8, border: "1px solid hsl(214 20% 90%)" }}>
                  <div style={{ fontSize: "0.72rem", color: "hsl(215 16% 57%)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "hsl(38 95% 96%)", border: "1px solid hsl(38 95% 85%)", borderRadius: 10, padding: "14px 18px" }}>
              <p style={{ fontSize: "0.82rem", color: "hsl(38 80% 35%)" }}>
                ℹ️ After submission, an admin will review and approve your course. You will be notified once it is published.
              </p>
            </div>
          </div>
        )}

        {/* ── NAVIGATION ── */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 18, borderTop: "1px solid hsl(214 20% 92%)" }}>
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="btn btn-outline"
          >
            Previous
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSaveDraft} className="btn btn-ghost" disabled={saving}>
              <Save size={14} /> Save Draft
            </button>

            {step === 1 && (
              <button onClick={handleSaveCourseInfo} className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Next →"}
              </button>
            )}
            {step === 2 && (
              <button onClick={() => setStep(3)} className="btn btn-primary">
                Next →
              </button>
            )}
            {step === 3 && (
              <button onClick={handleSaveQuiz} className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Next →"}
              </button>
            )}
            {step === 4 && (
              <button onClick={handleSubmit} className="btn btn-primary" disabled={saving} style={{ background: "hsl(145 63% 40%)" }}>
                {saving ? "Submitting..." : <><Send size={14} /> Submit for Approval</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}