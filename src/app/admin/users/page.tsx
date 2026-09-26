"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Users, CheckCircle, XCircle, Ban, Shield } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterStatus !== "all") params.set("status", filterStatus);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, [filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleAction = async (userId: string, action: string) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    loadUsers();
  };

  const pendingUsers = users.filter((u) => u.status === "pending");

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>User Management</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 24 }}>
        Manage platform users, approve registrations, and control access
      </p>

      {/* Pending approval banner */}
      {pendingUsers.length > 0 && (
        <div className="card animate-fade-in" style={{
          padding: "18px 22px",
          marginBottom: 20,
          borderLeft: "4px solid hsl(38 95% 55%)",
          background: "hsl(38 95% 97%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <strong style={{ fontSize: "0.9rem" }}>⏳ {pendingUsers.length} user{pendingUsers.length > 1 ? "s" : ""} awaiting approval</strong>
              <p style={{ fontSize: "0.82rem", color: "hsl(215 18% 38%)", marginTop: 4 }}>
                {pendingUsers.map(u => u.name).join(", ")}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {pendingUsers.map((u) => (
                <div key={u.id} style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => handleAction(u.id, "approve")} className="btn btn-sm" style={{ background: "hsl(145 63% 40%)", color: "white" }}>
                    <CheckCircle size={14} /> Approve {u.name.split(" ")[0]}
                  </button>
                  <button onClick={() => handleAction(u.id, "reject")} className="btn btn-sm" style={{ background: "hsl(0 72% 51%)", color: "white" }}>
                    <XCircle size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search & filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ position: "relative", flex: 1, maxWidth: 340 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "hsl(215 16% 57%)" }} />
          <input className="input" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </form>
        <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>User</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Enrollments</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32 }}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32 }}>No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: "0.7rem" }}>{u.avatar || "?"}</div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === "admin" ? "badge-error" : u.role === "trainer" ? "badge-secondary" : "badge-primary"}`} style={{ fontSize: "0.7rem" }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>{u.department || "—"}</td>
                    <td>
                      <span className={`badge ${u.status === "approved" ? "badge-success" : u.status === "pending" ? "badge-warning" : "badge-error"}`} style={{ fontSize: "0.7rem" }}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>{u._count?.enrollments ?? 0}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {u.status === "pending" && (
                          <>
                            <button onClick={() => handleAction(u.id, "approve")} className="btn btn-sm" style={{ background: "hsl(145 63% 40%)", color: "white", fontSize: "0.72rem" }}>
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button onClick={() => handleAction(u.id, "reject")} className="btn btn-sm" style={{ background: "hsl(0 72% 51%)", color: "white", fontSize: "0.72rem" }}>
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        {u.status === "approved" && u.role !== "admin" && (
                          <button onClick={() => handleAction(u.id, "suspend")} className="btn btn-sm btn-ghost" style={{ fontSize: "0.72rem", color: "hsl(0 72% 51%)" }}>
                            <Ban size={12} /> Suspend
                          </button>
                        )}
                        {u.status === "suspended" && (
                          <button onClick={() => handleAction(u.id, "approve")} className="btn btn-sm btn-ghost" style={{ fontSize: "0.72rem", color: "hsl(145 63% 40%)" }}>
                            <CheckCircle size={12} /> Reinstate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
