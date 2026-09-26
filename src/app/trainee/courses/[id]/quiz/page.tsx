"use client";
import { use, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { Clock, ArrowLeft, ArrowRight, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

interface Quiz {
  id: string;
  title: string;
  deadline: string | null;
  timeLimit: number;
  questions: QuizQuestion[];
  previousAttempt?: { score: number; total: number; submittedAt: string } | null;
}

interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  questions: {
    id: string;
    text: string;
    correctOptionId: string;
    userAnswer: string | null;
    isCorrect: boolean;
    options: QuizOption[];
  }[];
}

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [courseName, setCourseName] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  // Fetch the quiz for this specific course
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Fetch course name
        const courseRes = await fetch(`/api/courses/${id}`);
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourseName(courseData.title || "");
        }

        // Fetch quiz for THIS course
        const quizRes = await fetch(`/api/courses/${id}/quiz`);
        if (quizRes.ok) {
          const quizData = await quizRes.json();
          setQuiz(quizData);
        } else {
          const errData = await quizRes.json();
          setError(errData.error || "No quiz found for this course.");
        }
      } catch {
        setError("Failed to load quiz. Please try again.");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSelect = (questionId: string, optionId: string) => {
    if (!result) setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // Submit answers to the backend for grading
  async function handleSubmit() {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${id}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        alert("Failed to submit quiz. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  // ── Loading / Error states ──
  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "80px 20px", color: "hsl(215 16% 57%)" }}>
          Loading quiz...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !quiz) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📝</div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 8 }}>
            {error || "No quiz available for this course yet"}
          </h2>
          <p style={{ fontSize: "0.88rem", color: "hsl(215 16% 57%)", marginBottom: 24 }}>
            The trainer has not created an assessment for this course.
          </p>
          <Link href={`/trainee/courses/${id}/learn`} className="btn btn-primary">
            <ArrowLeft size={14} /> Back to Course
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const totalQ = quiz.questions.length;

  // ── Result screen ──
  if (result) {
    const { score, total, percentage, passed, questions: reviewQs } = result;
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div className="card animate-fade-in" style={{ padding: "48px 40px" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>
              {passed ? "🎉" : "📚"}
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 8 }}>
              Quiz Completed!
            </h1>
            <p style={{ color: "hsl(215 18% 38%)", marginBottom: 28 }}>{quiz.title}</p>

            <div
              style={{
                width: 120, height: 120, borderRadius: "50%", margin: "0 auto 28px",
                background: passed ? "hsl(145 63% 92%)" : "hsl(0 72% 94%)",
                border: `4px solid ${passed ? "hsl(145 63% 40%)" : "hsl(0 72% 51%)"}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}
            >
              <div style={{ fontSize: "2rem", fontWeight: 900, color: passed ? "hsl(145 63% 30%)" : "hsl(0 72% 40%)" }}>
                {percentage}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>{score}/{total} correct</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
              {[
                { label: "Score", value: `${score}/${total}`, color: "hsl(215 84% 30%)" },
                { label: "Percentage", value: `${percentage}%`, color: passed ? "hsl(145 63% 40%)" : "hsl(0 72% 51%)" },
                { label: "Status", value: passed ? "Passed ✓" : "Failed ✗", color: passed ? "hsl(145 63% 40%)" : "hsl(0 72% 51%)" },
              ].map((s) => (
                <div key={s.label} style={{ background: "hsl(210 20% 97%)", borderRadius: 10, padding: "14px" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Answer Review */}
            <div style={{ textAlign: "left", marginBottom: 24 }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 14 }}>Answer Review</h3>
              {reviewQs.map((q, i) => (
                <div key={q.id} style={{
                  padding: "12px 14px", borderRadius: 8, marginBottom: 8,
                  border: `1px solid ${q.isCorrect ? "hsl(145 63% 85%)" : "hsl(0 72% 88%)"}`,
                  background: q.isCorrect ? "hsl(145 63% 97%)" : "hsl(0 72% 97%)",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  {q.isCorrect
                    ? <CheckCircle size={16} style={{ color: "hsl(145 63% 40%)", flexShrink: 0, marginTop: 2 }} />
                    : <XCircle size={16} style={{ color: "hsl(0 72% 51%)", flexShrink: 0, marginTop: 2 }} />
                  }
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>Q{i + 1}: {q.text}</div>
                    {!q.isCorrect && (
                      <div style={{ fontSize: "0.75rem", color: "hsl(145 63% 35%)", marginTop: 2 }}>
                        ✓ Correct: {q.options.find((o) => o.id === q.correctOptionId)?.text}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/trainee/courses/${id}/learn`} className="btn btn-outline" style={{ flex: 1 }}>
                Back to Course
              </Link>
              {passed && (
                <Link href="/trainee/certificates" className="btn btn-primary" style={{ flex: 1 }}>
                  View Certificate 🏆
                </Link>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Previous attempt banner ──
  const prevAttempt = quiz.previousAttempt;

  // ── Active quiz ──
  const q = quiz.questions[currentQ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href={`/trainee/courses/${id}/learn`} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{quiz.title}</h1>
          <p style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)" }}>{courseName}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, color: "hsl(215 18% 38%)" }}>
          <Clock size={15} />
          {quiz.timeLimit} min limit
        </div>
      </div>

      {/* Previous attempt banner */}
      {prevAttempt && (
        <div style={{
          padding: "12px 18px", borderRadius: 8, marginBottom: 20,
          background: "hsl(38 95% 96%)", border: "1px solid hsl(38 95% 85%)",
          fontSize: "0.85rem", color: "hsl(38 80% 35%)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <AlertTriangle size={16} />
          You previously scored {prevAttempt.score}/{prevAttempt.total}. Submitting again will create a new attempt.
        </div>
      )}

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {quiz.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            style={{
              width: 28, height: 28, borderRadius: "50%",
              border: `2px solid ${i === currentQ ? "hsl(215 84% 30%)" : answers[quiz.questions[i].id] ? "hsl(145 63% 40%)" : "hsl(214 20% 88%)"}`,
              background: i === currentQ ? "hsl(215 84% 30%)" : answers[quiz.questions[i].id] ? "hsl(145 63% 40%)" : "transparent",
              color: i === currentQ || answers[quiz.questions[i].id] ? "white" : "hsl(215 18% 38%)",
              fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {i + 1}
          </button>
        ))}
        <span style={{ marginLeft: 8, fontSize: "0.82rem", color: "hsl(215 16% 57%)", alignSelf: "center" }}>
          {Object.keys(answers).length}/{totalQ} answered
        </span>
      </div>

      {/* Question card */}
      <div className="card animate-fade-in" style={{ padding: "32px", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span className="badge badge-primary">Question {currentQ + 1} of {totalQ}</span>
        </div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 24, lineHeight: 1.5 }}>
          {q.text}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {q.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(q.id, opt.id)}
              className={`quiz-option ${answers[q.id] === opt.id ? "selected" : ""}`}
            >
              {opt.text}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="btn btn-outline"
          >
            <ArrowLeft size={16} /> Previous
          </button>
          {currentQ < totalQ - 1 ? (
            <button onClick={() => setCurrentQ(currentQ + 1)} className="btn btn-primary">
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              style={{ background: "hsl(145 63% 40%)" }}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : <><CheckCircle size={16} /> Submit Quiz</>}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}