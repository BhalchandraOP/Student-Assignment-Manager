import { useState, useEffect } from "react";
import {
  Award,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileCheck2,
  FileCode2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  Plus,
  RotateCcw,
  School,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import Brand from "../components/Brand";
import Avatar from "../components/Avatar";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, getSession, logout } from "../services/authService";

const initialFallbackAssignments = [
  {
    id: 1,
    title: "Data Structures Assignment",
    course: "Data Structures",
    professor: "Prof. Sharma",
    due: "24 May 2024",
    status: "Pending",
    submissionText: "",
    grade: null,
    feedback: "",
    color: "purple",
  },
  {
    id: 2,
    title: "Database Systems Project",
    course: "DBMS",
    professor: "Prof. Verma",
    due: "27 May 2024",
    status: "Pending",
    submissionText: "",
    grade: null,
    feedback: "",
    color: "green",
  },
  {
    id: 3,
    title: "Operating Systems Report",
    course: "Operating Systems",
    professor: "Prof. Mehta",
    due: "20 May 2024",
    status: "Graded",
    submissionText: "https://github.com/student/os-process-scheduler",
    grade: "27/30",
    feedback: "Thorough analysis of CPU scheduling algorithms. Excellent work!",
    color: "orange",
  },
  {
    id: 4,
    title: "Computer Networks Lab",
    course: "Computer Networks",
    professor: "Prof. Iyer",
    due: "01 Jun 2024",
    status: "Pending",
    submissionText: "",
    grade: null,
    feedback: "",
    color: "red",
  },
];

function StatCard({ icon: Icon, label, number, note, color }) {
  return (
    <article className="stat-card">
      <span className={`stat-icon ${color}`}>
        <Icon />
      </span>
      <div>
        <small>{label}</small>
        <strong>{number}</strong>
        <p>
          <i className={color} />
          {note}
        </p>
      </div>
    </article>
  );
}

function Panel({ title, action, onAction, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <header>
        <h3>{title}</h3>
        {action && (
          <button type="button" onClick={onAction}>
            {action}
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const session = getSession();
  const fullName = session?.user?.fullName ?? "User";
  const userRole = session?.user?.roles?.[0] ?? "ROLE_STUDENT";
  const roleName = userRole.replace("ROLE_", "");
  const roleLabel = roleName.charAt(0) + roleName.slice(1).toLowerCase();

  const isStudent = roleName === "STUDENT";
  const isTeacher = roleName === "TEACHER";
  const isAdmin = roleName === "ADMIN";

  const [activeTab, setActiveTab] = useState("dashboard");
  const [assignments, setAssignments] = useState(initialFallbackAssignments);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Modals
  const [submitModalItem, setSubmitModalItem] = useState(null);
  const [submissionInput, setSubmissionInput] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const [gradeModalItem, setGradeModalItem] = useState(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

  // Admin users list from MySQL
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  // Load assignments from backend REST API
  async function loadAssignments() {
    try {
      setLoadingAssignments(true);
      const data = await fetchWithAuth("/assignments");
      if (Array.isArray(data) && data.length > 0) {
        setAssignments(data);
        localStorage.setItem("sat_shared_assignments", JSON.stringify(data));
      }
    } catch (err) {
      console.warn("REST API fallback to cache:", err);
      const cached = localStorage.getItem("sat_shared_assignments");
      if (cached) {
        try {
          setAssignments(JSON.parse(cached));
        } catch {
          // ignore parse error
        }
      }
    } finally {
      setLoadingAssignments(false);
    }
  }

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (activeTab === "users" && isAdmin) {
      loadAdminUsers();
    }
  }, [activeTab, isAdmin]);

  async function loadAdminUsers() {
    setAdminLoading(true);
    setAdminError("");
    try {
      const data = await fetchWithAuth("/admin/users");
      setAdminUsers(data);
    } catch (err) {
      setAdminError(err.message || "Unable to fetch users");
    } finally {
      setAdminLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  // Student Actions
  function handleOpenSubmit(item) {
    setSubmitModalItem(item);
    setSubmissionInput(item.submissionText || "");
  }

  async function handleConfirmSubmit(e) {
    e.preventDefault();
    if (!submitModalItem) return;
    const text = submissionInput.trim() || "Solution notes or repository submitted.";
    try {
      await fetchWithAuth(`/assignments/${submitModalItem.id}/submit`, {
        method: "POST",
        body: JSON.stringify({ submissionText: text }),
      });
      await loadAssignments();
    } catch (err) {
      console.error("Submit API error:", err);
      // Fallback local update
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === submitModalItem.id
            ? { ...a, status: "Submitted", submissionText: text }
            : a
        )
      );
    }
    setSubmitModalItem(null);
    setSubmissionInput("");
  }

  // Student Undo Action
  async function handleUndoSubmit(item) {
    if (!window.confirm(`Revert submission for "${item.title}" back to Pending?`)) return;
    try {
      await fetchWithAuth(`/assignments/${item.id}/revert`, { method: "POST" });
      await loadAssignments();
    } catch (err) {
      console.error("Revert API error:", err);
      // Fallback local update
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === item.id
            ? { ...a, status: "Pending", submissionText: "", grade: null, feedback: "" }
            : a
        )
      );
    }
  }

  // Teacher Actions
  async function handleConfirmCreate(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newCourse.trim()) return;
    const payload = {
      title: newTitle.trim(),
      course: newCourse.trim(),
      due: newDueDate.trim() || "30 Jun 2024",
      color: "purple",
    };

    try {
      await fetchWithAuth("/assignments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await loadAssignments();
    } catch (err) {
      console.error("Create assignment API error:", err);
      const localNew = {
        id: Date.now(),
        ...payload,
        professor: fullName,
        status: "Pending",
        submissionText: "",
        grade: null,
        feedback: "",
      };
      setAssignments((prev) => [localNew, ...prev]);
    }

    setCreateModalOpen(false);
    setNewTitle("");
    setNewCourse("");
    setNewDueDate("");
  }

  function handleOpenGrade(item) {
    setGradeModalItem(item);
    setGradeInput(item.grade || "28/30");
    setFeedbackInput(item.feedback || "Good implementation of project requirements.");
  }

  async function handleConfirmGrade(e) {
    e.preventDefault();
    if (!gradeModalItem) return;
    const grade = gradeInput.trim() || "Graded";
    const feedback = feedbackInput.trim() || "Reviewed by instructor.";

    try {
      await fetchWithAuth(`/assignments/${gradeModalItem.id}/grade`, {
        method: "POST",
        body: JSON.stringify({ grade, feedback }),
      });
      await loadAssignments();
    } catch (err) {
      console.error("Grade API error:", err);
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === gradeModalItem.id
            ? { ...a, status: "Graded", grade, feedback }
            : a
        )
      );
    }

    setGradeModalItem(null);
  }

  async function handleDeleteAssignment(id) {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await fetchWithAuth(`/assignments/${id}`, { method: "DELETE" });
      await loadAssignments();
    } catch (err) {
      console.error("Delete API error:", err);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    }
  }

  // Role Badges
  const roleBadgeStyle = isTeacher
    ? { background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" }
    : isAdmin
    ? { background: "#faf5ff", color: "#6b21a8", border: "1px solid #e9d5ff" }
    : { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" };

  // Sidebar Items per Role
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "assignments",
      label: isTeacher ? "Manage Assignments" : "Assignments",
      icon: FileText,
    },
    {
      id: "submissions",
      label: isTeacher ? "Grade Submissions" : "My Submissions",
      icon: FileCheck2,
    },
    ...(isAdmin
      ? [{ id: "users", label: "User Management", icon: Users }]
      : []),
    { id: "calendar", label: "Calendar", icon: CalendarDays, tag: "Planned" },
    { id: "messages", label: "Messages", icon: Mail, tag: "Planned" },
    { id: "settings", label: "Settings", icon: Settings, tag: "Planned" },
  ];

  const pendingAssignments = assignments.filter((a) => a.status === "Pending");
  const submittedAssignments = assignments.filter(
    (a) => a.status === "Submitted" || a.status === "Graded"
  );
  const awaitingGradingAssignments = assignments.filter(
    (a) => a.status === "Submitted"
  );

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <Brand />
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                className={isActive ? "active" : ""}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.id);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.tag && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      background: "#f1f5f9",
                      color: "#64748b",
                      fontWeight: "600",
                    }}
                  >
                    {item.tag}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <div className="sidebar-card">
          {isTeacher ? <School /> : isAdmin ? <ShieldCheck /> : <GraduationCap />}
          <b>{isTeacher ? "Teacher Portal" : isAdmin ? "Admin Console" : "Student Portal"}</b>
          <p>
            {isTeacher
              ? "Create coursework & grade submissions."
              : isAdmin
              ? "Manage MySQL database & users."
              : "Track assignments & submit work."}
          </p>
          <span
            style={{
              display: "inline-block",
              fontSize: "11px",
              padding: "4px 10px",
              borderRadius: "12px",
              ...roleBadgeStyle,
              fontWeight: "600",
            }}
          >
            Role: {roleName}
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-shell">
        <header className="topbar">
          <button className="icon-button" type="button">
            <Menu />
          </button>
          <label className="search">
            <Search size={20} />
            <input placeholder="Search coursework, assignments..." />
            <kbd>Ctrl + K</kbd>
          </label>
          <div className="top-profile">
            <span className="notification">
              <Bell />
              <i>{pendingAssignments.length}</i>
            </span>
            <Avatar name={fullName} />
            <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <b>Hi, {fullName}</b>
              <span
                style={{
                  ...roleBadgeStyle,
                  display: "inline-block",
                  padding: "1px 7px",
                  borderRadius: "10px",
                  fontSize: "10px",
                  fontWeight: "700",
                  width: "fit-content",
                }}
              >
                {roleLabel}
              </span>
            </span>
            <ChevronDown size={16} />
            <button
              className="icon-button"
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <>
              <div className="welcome">
                <h1>
                  Welcome back, {fullName}! {isTeacher ? "👨‍🏫" : isAdmin ? "🛡️" : "👋"}
                </h1>
                <p>
                  {isTeacher
                    ? "Manage course assignments, review student submissions, and grade coursework."
                    : isAdmin
                    ? "System overview: manage registered user accounts and server security."
                    : "Track your pending assignments, submit solutions, and review instructor grades."}
                </p>
              </div>

              {/* Role-Specific Stats Grid */}
              <div className="stats-grid">
                {isStudent && (
                  <>
                    <StatCard
                      icon={CalendarDays}
                      label="Total Assignments"
                      number={assignments.length}
                      note="Assigned"
                      color="purple"
                    />
                    <StatCard
                      icon={SlidersHorizontal}
                      label="Pending Action"
                      number={pendingAssignments.length}
                      note="Needs your work"
                      color="green"
                    />
                    <StatCard
                      icon={FileCheck2}
                      label="Submitted"
                      number={submittedAssignments.length}
                      note="Completed"
                      color="orange"
                    />
                    <StatCard
                      icon={Award}
                      label="Graded"
                      number={assignments.filter((a) => a.status === "Graded").length}
                      note="With score"
                      color="red"
                    />
                  </>
                )}

                {isTeacher && (
                  <>
                    <StatCard
                      icon={FileCode2}
                      label="Active Assignments"
                      number={assignments.length}
                      note="Published"
                      color="purple"
                    />
                    <StatCard
                      icon={Clock}
                      label="Submissions to Grade"
                      number={awaitingGradingAssignments.length}
                      note="Needs review"
                      color="green"
                    />
                    <StatCard
                      icon={Users}
                      label="Enrolled Students"
                      number="42"
                      note="Across classes"
                      color="orange"
                    />
                    <StatCard
                      icon={Award}
                      label="Graded Submissions"
                      number={assignments.filter((a) => a.status === "Graded").length}
                      note="Evaluated"
                      color="red"
                    />
                  </>
                )}

                {isAdmin && (
                  <>
                    <StatCard
                      icon={Users}
                      label="Total Database Users"
                      number="4"
                      note="In MySQL"
                      color="purple"
                    />
                    <StatCard
                      icon={School}
                      label="Teachers"
                      number="1"
                      note="Prof. Sharma"
                      color="green"
                    />
                    <StatCard
                      icon={GraduationCap}
                      label="Students"
                      number="2"
                      note="Enrolled"
                      color="orange"
                    />
                    <StatCard
                      icon={ShieldCheck}
                      label="Security"
                      number="100%"
                      note="JWT Enforced"
                      color="red"
                    />
                  </>
                )}
              </div>

              {/* Dashboard Content Split */}
              <div className="dashboard-grid">
                <div className="dashboard-left">
                  {/* Student View: Pending Coursework */}
                  {isStudent && (
                    <Panel
                      title="Pending Coursework"
                      action="View All"
                      onAction={() => setActiveTab("assignments")}
                      className="deadlines"
                    >
                      {pendingAssignments.length === 0 ? (
                        <p style={{ color: "#64748b", padding: "20px 0" }}>
                          🎉 All assignments submitted! Great job.
                        </p>
                      ) : (
                        pendingAssignments.map((item) => (
                          <article key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #edf0f5" }}>
                            <div>
                              <b>{item.title}</b>
                              <p style={{ margin: "4px 0", color: "#64748b", fontSize: "12px" }}>
                                {item.course} • {item.professor}
                              </p>
                              <span style={{ fontSize: "12px", color: "#d97706" }}>
                                📅 Due: {item.due}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenSubmit(item)}
                              style={{
                                padding: "7px 14px",
                                borderRadius: "6px",
                                border: "0",
                                background: "#2563eb",
                                color: "#fff",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <Send size={13} /> Submit Work
                            </button>
                          </article>
                        ))
                      )}
                    </Panel>
                  )}

                  {/* Teacher View: Published Course Assignments */}
                  {isTeacher && (
                    <Panel
                      title="Course Assignments"
                      action="+ Create Assignment"
                      onAction={() => setCreateModalOpen(true)}
                    >
                      {assignments.map((item) => (
                        <article key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #edf0f5" }}>
                          <div>
                            <b>{item.title}</b>
                            <p style={{ margin: "4px 0", color: "#64748b", fontSize: "12px" }}>
                              {item.course} • Due {item.due}
                            </p>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: "600",
                                background: item.status === "Graded" ? "#f0fdf4" : item.status === "Submitted" ? "#e0e7ff" : "#fef3c7",
                                color: item.status === "Graded" ? "#16a34a" : item.status === "Submitted" ? "#3730a3" : "#b45309",
                              }}
                            >
                              {item.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteAssignment(item.id)}
                              title="Delete assignment"
                              style={{ border: 0, background: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </article>
                      ))}
                    </Panel>
                  )}

                  {/* Admin View: Database Users Quick Card */}
                  {isAdmin && (
                    <Panel
                      title="System Administration & Database Overview"
                      action="Open User Manager"
                      onAction={() => setActiveTab("users")}
                    >
                      <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                        As an Administrator, you can audit all MySQL database users, view assigned roles, and inspect system permissions.
                      </p>
                      <div style={{ marginTop: "14px" }}>
                        <button
                          type="button"
                          onClick={() => setActiveTab("users")}
                          style={{
                            padding: "9px 16px",
                            borderRadius: "7px",
                            border: "0",
                            background: "#7c3aed",
                            color: "#fff",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Users size={16} /> Manage Database Accounts
                        </button>
                      </div>
                    </Panel>
                  )}
                </div>

                {/* Right Column: Status & Submissions */}
                <div className="dashboard-right">
                  <Panel title="Assignment Status Breakdown" className="status-panel">
                    <div className="donut">
                      <span>
                        <b>{assignments.length}</b>
                        <small>Total</small>
                      </span>
                    </div>
                    <div className="legend">
                      <p>
                        <i className="orange" />
                        <span>Pending</span>
                        <b>{pendingAssignments.length}</b>
                      </p>
                      <p>
                        <i className="green" />
                        <span>Submitted</span>
                        <b>{submittedAssignments.length}</b>
                      </p>
                      <p>
                        <i className="purple" />
                        <span>Graded</span>
                        <b>{assignments.filter((a) => a.status === "Graded").length}</b>
                      </p>
                    </div>
                  </Panel>

                  <Panel title="Recent Submissions & Feedback">
                    {submittedAssignments.length === 0 ? (
                      <p style={{ color: "#64748b", fontSize: "12px" }}>No submitted work yet.</p>
                    ) : (
                      submittedAssignments.map((item) => (
                        <article key={item.id} style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{ fontSize: "13px" }}>{item.title}</strong>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  background: item.status === "Graded" ? "#dcfce7" : "#fef3c7",
                                  color: item.status === "Graded" ? "#15803d" : "#b45309",
                                }}
                              >
                                {item.status === "Graded" ? `Graded: ${item.grade}` : "Under Review"}
                              </span>
                              {isStudent && item.status === "Submitted" && (
                                <button
                                  type="button"
                                  onClick={() => handleUndoSubmit(item)}
                                  title="Undo submission"
                                  style={{
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "4px",
                                    background: "#fff",
                                    color: "#475569",
                                    fontSize: "11px",
                                    padding: "2px 6px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px",
                                  }}
                                >
                                  <RotateCcw size={11} /> Undo
                                </button>
                              )}
                            </div>
                          </div>
                          {item.feedback && (
                            <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#475569", background: "#f8fafc", padding: "6px 10px", borderRadius: "6px" }}>
                              💬 <i>"{item.feedback}"</i>
                            </p>
                          )}
                        </article>
                      ))
                    )}
                  </Panel>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ASSIGNMENTS (Student submits / Teacher creates) */}
          {activeTab === "assignments" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "22px" }}>
                    {isTeacher ? "Course Assignments Manager" : "My Course Assignments"}
                  </h2>
                  <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
                    {isTeacher
                      ? "Create, publish, and manage assignments for your enrolled students."
                      : "View assignment details, deadlines, and submit your coursework."}
                  </p>
                </div>
                {isTeacher && (
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(true)}
                    style={{
                      padding: "9px 16px",
                      borderRadius: "7px",
                      border: "0",
                      background: "#2563eb",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={16} /> Create Assignment
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gap: "14px" }}>
                {assignments.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "#fff",
                      padding: "18px 22px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "16px", fontWeight: "700" }}>{item.title}</span>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "11px",
                            fontWeight: "600",
                            background:
                              item.status === "Graded"
                                ? "#dcfce7"
                                : item.status === "Submitted"
                                ? "#e0e7ff"
                                : "#fef3c7",
                            color:
                              item.status === "Graded"
                                ? "#15803d"
                                : item.status === "Submitted"
                                ? "#3730a3"
                                : "#b45309",
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "13px" }}>
                        Course: <b>{item.course}</b> • Instructor: <b>{item.professor}</b> • Due: <b>{item.due}</b>
                      </p>
                      {item.submissionText && (
                        <p style={{ margin: "6px 0 0", color: "#334155", fontSize: "12px" }}>
                          Submitted notes: <code>{item.submissionText}</code>
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* Student Actions */}
                      {isStudent && item.status === "Pending" && (
                        <button
                          type="button"
                          onClick={() => handleOpenSubmit(item)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "7px",
                            border: "0",
                            background: "#2563eb",
                            color: "#fff",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Send size={14} /> Submit Work
                        </button>
                      )}

                      {isStudent && item.status === "Submitted" && (
                        <>
                          <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle2 size={16} /> Submitted
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUndoSubmit(item)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              background: "#fff",
                              color: "#475569",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <RotateCcw size={13} /> Undo Submission
                          </button>
                        </>
                      )}

                      {isStudent && item.status === "Graded" && (
                        <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Award size={16} /> Graded: {item.grade}
                        </span>
                      )}

                      {/* Teacher Actions */}
                      {isTeacher && item.status === "Submitted" && (
                        <button
                          type="button"
                          onClick={() => handleOpenGrade(item)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "7px",
                            border: "0",
                            background: "#059669",
                            color: "#fff",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Award size={14} /> Grade Work
                        </button>
                      )}

                      {isTeacher && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAssignment(item.id)}
                          title="Delete assignment"
                          style={{
                            padding: "6px",
                            borderRadius: "6px",
                            border: "1px solid #fee2e2",
                            background: "#fff5f5",
                            color: "#dc2626",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SUBMISSIONS (Student reviews grades / Teacher grades) */}
          {activeTab === "submissions" && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ margin: 0, fontSize: "22px" }}>
                  {isTeacher ? "Student Submissions & Grading Queue" : "My Submission History & Grades"}
                </h2>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
                  {isTeacher
                    ? "Review student homework, assign marks, and provide feedback remarks."
                    : "Track all assignments you have submitted and review your instructor marks."}
                </p>
              </div>

              <div style={{ display: "grid", gap: "14px" }}>
                {submittedAssignments.length === 0 ? (
                  <div style={{ background: "#fff", padding: "40px", borderRadius: "10px", textAlign: "center", color: "#64748b" }}>
                    <p>No submissions found in this category yet.</p>
                  </div>
                ) : (
                  submittedAssignments.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: "#fff",
                        padding: "20px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "260px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontSize: "15px" }}>{item.title}</strong>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "10px",
                              fontSize: "10px",
                              fontWeight: "700",
                              background: item.status === "Graded" ? "#dcfce7" : "#fef3c7",
                              color: item.status === "Graded" ? "#15803d" : "#b45309",
                            }}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p style={{ margin: "6px 0", color: "#64748b", fontSize: "12px" }}>
                          Course: {item.course} • Instructor: {item.professor} • Due: {item.due}
                        </p>
                        <p style={{ margin: "4px 0", fontSize: "12px", color: "#334155" }}>
                          <b>Student notes:</b> <code>{item.submissionText}</code>
                        </p>
                        {item.grade && (
                          <div style={{ marginTop: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <Award size={16} color="#16a34a" />
                              <strong style={{ color: "#166534", fontSize: "13px" }}>Grade: {item.grade}</strong>
                            </div>
                            {item.feedback && (
                              <p style={{ margin: "4px 0 0", color: "#14532d", fontSize: "12px" }}>
                                {item.feedback}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {isStudent && item.status === "Submitted" && (
                          <button
                            type="button"
                            onClick={() => handleUndoSubmit(item)}
                            style={{
                              padding: "7px 12px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              background: "#fff",
                              color: "#475569",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <RotateCcw size={13} /> Undo Submission
                          </button>
                        )}

                        {isTeacher && (
                          <button
                            type="button"
                            onClick={() => handleOpenGrade(item)}
                            style={{
                              padding: "8px 14px",
                              borderRadius: "7px",
                              border: "0",
                              background: item.status === "Graded" ? "#475569" : "#059669",
                              color: "#fff",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <Award size={14} /> {item.status === "Graded" ? "Update Grade" : "Grade Submission"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN USER MANAGEMENT (Admin only) */}
          {activeTab === "users" && (
            <div>
              {!isAdmin ? (
                <div style={{ background: "#fff", padding: "40px", borderRadius: "10px", textAlign: "center", border: "1px solid #fecdd3" }}>
                  <Lock size={36} color="#e11d48" style={{ margin: "0 auto 12px" }} />
                  <h3 style={{ color: "#be123c", margin: "0 0 8px" }}>Access Restricted (Admin Only)</h3>
                  <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
                    You are logged in with role <code>{userRole}</code>. Only administrators can view and manage system user accounts.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: "22px" }}>Database User Management</h2>
                      <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
                        Real registered accounts retrieved directly from the MySQL <code>app_users</code> database via Spring Boot.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={loadAdminUsers}
                      disabled={adminLoading}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "7px",
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {adminLoading ? "Loading..." : "🔄 Refresh from DB"}
                    </button>
                  </div>

                  {adminError && (
                    <div style={{ padding: "12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
                      {adminError}
                    </div>
                  )}

                  <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                          <th style={{ padding: "12px 18px", color: "#475569" }}>ID</th>
                          <th style={{ padding: "12px 18px", color: "#475569" }}>Full Name</th>
                          <th style={{ padding: "12px 18px", color: "#475569" }}>Email Address</th>
                          <th style={{ padding: "12px 18px", color: "#475569" }}>Assigned Roles</th>
                          <th style={{ padding: "12px 18px", color: "#475569" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map((u) => (
                          <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "14px 18px", color: "#64748b" }}>#{u.id}</td>
                            <td style={{ padding: "14px 18px", fontWeight: "600" }}>{u.fullName}</td>
                            <td style={{ padding: "14px 18px", color: "#334155" }}>{u.email}</td>
                            <td style={{ padding: "14px 18px" }}>
                              {u.roles?.map((r) => (
                                <span
                                  key={r}
                                  style={{
                                    display: "inline-block",
                                    padding: "2px 8px",
                                    borderRadius: "10px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    background:
                                      r === "ROLE_ADMIN"
                                        ? "#faf5ff"
                                        : r === "ROLE_TEACHER"
                                        ? "#ecfdf5"
                                        : "#eff6ff",
                                    color:
                                      r === "ROLE_ADMIN"
                                        ? "#7c3aed"
                                        : r === "ROLE_TEACHER"
                                        ? "#059669"
                                        : "#2563eb",
                                    marginRight: "4px",
                                  }}
                                >
                                  {r.replace("ROLE_", "")}
                                </span>
                              ))}
                            </td>
                            <td style={{ padding: "14px 18px" }}>
                              <span style={{ color: "#16a34a", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                                <CheckCircle2 size={14} /> Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PLANNED FEATURES (Honest Coming Soon state) */}
          {(activeTab === "calendar" || activeTab === "messages" || activeTab === "settings") && (
            <div style={{ background: "#fff", padding: "60px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
              <Clock size={40} color="#6366f1" style={{ margin: "0 auto 12px" }} />
              <h2 style={{ margin: "0 0 6px", fontSize: "20px" }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module [Coming Soon]
              </h2>
              <p style={{ margin: "0 auto 20px", color: "#64748b", fontSize: "14px", maxWidth: "450px" }}>
                This module is currently in development for the upcoming release. Primary functional modules currently available: <b>Dashboard</b>, <b>Assignments</b>, and <b>Submissions</b>.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                style={{
                  padding: "8px 18px",
                  borderRadius: "7px",
                  border: "0",
                  background: "#2563eb",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: STUDENT SUBMIT SOLUTION */}
      {submitModalItem && (
        <div style={modalBackdropStyle}>
          <div style={modalDialogStyle}>
            <h3 style={{ margin: "0 0 6px", fontSize: "18px" }}>Submit Assignment</h3>
            <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "13px" }}>
              Submitting for: <b>{submitModalItem.title}</b> ({submitModalItem.course})
            </p>
            <form onSubmit={handleConfirmSubmit}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                GitHub Repository URL or Solution Notes:
              </label>
              <textarea
                rows={4}
                required
                value={submissionInput}
                onChange={(e) => setSubmissionInput(e.target.value)}
                placeholder="e.g. https://github.com/student/my-solution or completed homework summary"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setSubmitModalItem(null)}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TEACHER CREATE ASSIGNMENT */}
      {createModalOpen && (
        <div style={modalBackdropStyle}>
          <div style={modalDialogStyle}>
            <h3 style={{ margin: "0 0 6px", fontSize: "18px" }}>Create New Assignment</h3>
            <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "13px" }}>
              Publish a new coursework assignment for students.
            </p>
            <form onSubmit={handleConfirmCreate}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                  Assignment Title:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Algorithms Lab 3"
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                  Course / Subject:
                </label>
                <input
                  type="text"
                  required
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="e.g. Design & Analysis of Algorithms"
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                  Due Date:
                </label>
                <input
                  type="text"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  placeholder="e.g. 15 Jun 2024"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TEACHER GRADE SUBMISSION */}
      {gradeModalItem && (
        <div style={modalBackdropStyle}>
          <div style={modalDialogStyle}>
            <h3 style={{ margin: "0 0 6px", fontSize: "18px" }}>Grade Student Submission</h3>
            <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "13px" }}>
              Evaluating: <b>{gradeModalItem.title}</b> ({gradeModalItem.course})
            </p>
            <form onSubmit={handleConfirmGrade}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                  Marks / Score:
                </label>
                <input
                  type="text"
                  required
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  placeholder="e.g. 28/30 or A"
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                  Feedback / Comments:
                </label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="e.g. Clean solution, well documented."
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setGradeModalItem(null)}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>
                <button type="submit" style={{ ...primaryButtonStyle, background: "#059669" }}>
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const modalBackdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  padding: "20px",
};

const modalDialogStyle = {
  background: "#fff",
  borderRadius: "14px",
  width: "min(480px, 100%)",
  padding: "24px",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
};

const inputStyle = {
  width: "100%",
  height: "38px",
  padding: "0 12px",
  borderRadius: "7px",
  border: "1px solid #cbd5e1",
  fontSize: "13px",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  padding: "8px 16px",
  borderRadius: "7px",
  border: 0,
  background: "#2563eb",
  color: "#fff",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
};

const cancelButtonStyle = {
  padding: "8px 16px",
  borderRadius: "7px",
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  color: "#475569",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
};
