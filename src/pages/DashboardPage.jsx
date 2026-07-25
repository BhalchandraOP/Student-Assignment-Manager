import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileCode2,
  FileText,
  LayoutDashboard,
  Mail,
  Menu,
  Network,
  LogOut,
  Search,
  Settings,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import Brand from "../components/Brand";
import Avatar from "../components/Avatar";
import { useNavigate } from "react-router-dom";
import { getSession, logout } from "../services/authService";
const sidebar = [
  [LayoutDashboard, "Dashboard"],
  [FileText, "Assignments"],
  [FileCheck2, "My Submissions"],
  [BookOpen, "Courses"],
  [Users, "Students"],
  [CalendarDays, "Calendar"],
  [Mail, "Messages", 3],
  [BarChart3, "Reports"],
  [Settings, "Settings"],
];
const deadlines = [
  [
    FileCode2,
    "Data Structures Assignment",
    "Data Structures",
    "Prof. Sharma",
    "Due in 2 days",
    "24 May 2024, 11:59 PM",
    "purple",
  ],
  [
    SlidersHorizontal,
    "Database Systems Project",
    "DBMS",
    "Prof. Verma",
    "Due in 5 days",
    "27 May 2024, 11:59 PM",
    "green",
  ],
  [
    FileText,
    "Operating Systems Report",
    "Operating Systems",
    "Prof. Mehta",
    "Due in 7 days",
    "29 May 2024, 11:59 PM",
    "orange",
  ],
  [
    Network,
    "Computer Networks Lab",
    "Computer Networks",
    "Prof. Iyer",
    "Due in 10 days",
    "01 Jun 2024, 11:59 PM",
    "red",
  ],
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
function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <header>
        <h3>{title}</h3>
        {action && <button>{action}</button>}
      </header>
      {children}
    </section>
  );
}
export default function DashboardPage() {
  const navigate = useNavigate();
  const session = getSession();
  const fullName = session?.user?.fullName ?? "Student";
  const role = session?.user?.roles?.[0]?.replace("ROLE_", "") ?? "STUDENT";
  const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Brand />
        <nav>
          {sidebar.map(([Icon, label, badge], i) => (
            <a
              className={i === 0 ? "active" : ""}
              href={`#${label}`}
              key={label}
            >
              <Icon size={19} />
              <span>{label}</span>
              {badge && <em>{badge}</em>}
            </a>
          ))}
        </nav>
        <div className="sidebar-card">
          <ClipboardCheck />
          <b>Stay Organized</b>
          <p>Track, submit and manage all your assignments in one place.</p>
          <button>View Calendar</button>
        </div>
      </aside>
      <div className="dashboard-shell">
        <header className="topbar">
          <button className="icon-button">
            <Menu />
          </button>
          <label className="search">
            <Search size={20} />
            <input placeholder="Search anything..." />
            <kbd>Ctrl + K</kbd>
          </label>
          <div className="top-profile">
            <span className="notification">
              <Bell />
              <i>5</i>
            </span>
            <Avatar name={fullName} />
            <span>
              <b>Hi, {fullName}</b>
              <small>{roleLabel}</small>
            </span>
            <ChevronDown size={16} />
            <button className="icon-button" type="button" onClick={handleLogout} aria-label="Log out" title="Log out">
              <LogOut size={19} />
            </button>
          </div>
        </header>
        <main className="dashboard-content">
          <div className="welcome">
            <h1>Welcome back, {fullName}! 👋</h1>
            <p>Here's what's happening with your assignments today.</p>
          </div>
          <div className="stats-grid">
            <StatCard
              icon={CalendarDays}
              label="Total Assignments"
              number="24"
              note="All time"
              color="purple"
            />
            <StatCard
              icon={SlidersHorizontal}
              label="Pending"
              number="8"
              note="Needs your action"
              color="green"
            />
            <StatCard
              icon={ClipboardCheck}
              label="Submitted"
              number="12"
              note="Completed"
              color="orange"
            />
            <StatCard
              icon={Network}
              label="Overdue"
              number="4"
              note="Past deadline"
              color="red"
            />
          </div>
          <div className="dashboard-grid">
            <div className="dashboard-left">
              <Panel
                title="Upcoming Deadlines"
                action="View All"
                className="deadlines"
              >
                {deadlines.map(
                  ([Icon, title, subject, professor, due, date, color]) => (
                    <article key={title}>
                      <span className={`assignment-icon ${color}`}>
                        <Icon />
                      </span>
                      <div>
                        <b>{title}</b>
                        <p>
                          {subject} <i>•</i> {professor}
                        </p>
                      </div>
                      <div className="due">
                        <em>{due}</em>
                        <span>{date}</span>
                      </div>
                    </article>
                  ),
                )}
              </Panel>
              <Panel
                title="Calendar"
                action="View Calendar"
                className="calendar-panel"
              >
                <div className="month">
                  <b>May 2024</b>
                  <ChevronLeft />
                  <ChevronRight />
                </div>
                <div className="week">
                  {[
                    ["Sun", "19"],
                    ["Mon", "20"],
                    ["Tue", "21"],
                    ["Wed", "22"],
                    ["Thu", "23"],
                    ["Fri", "24"],
                    ["Sat", "25"],
                  ].map(([day, date]) => (
                    <span className={date === "24" ? "today" : ""} key={date}>
                      <small>{day}</small>
                      <b>{date}</b>
                    </span>
                  ))}
                </div>
                <div className="calendar-events">
                  <span>
                    DSA Assignment<small>Due in 2 days</small>
                  </span>
                  <span>
                    DBMS Project<small>Due in 5 days</small>
                  </span>
                  <span>
                    OS Report<small>Due in 7 days</small>
                  </span>
                  <span>
                    CN Lab<small>Due in 10 days</small>
                  </span>
                </div>
              </Panel>
            </div>
            <div className="dashboard-right">
              <Panel title="Assignment Status" className="status-panel">
                <div className="donut">
                  <span>
                    <b>24</b>
                    <small>Total</small>
                  </span>
                </div>
                <div className="legend">
                  {[
                    ["Pending", "8", "33.3%", "orange"],
                    ["Submitted", "12", "50.0%", "green"],
                    ["Graded", "2", "8.3%", "purple"],
                    ["Overdue", "4", "16.7%", "red"],
                  ].map(([x, n, p, c]) => (
                    <p key={x}>
                      <i className={c} />
                      <span>{x}</span>
                      <b>{n}</b>
                      <small>({p})</small>
                    </p>
                  ))}
                </div>
              </Panel>
              <Panel
                title="Recent Submissions"
                action="View All"
                className="recent-list"
              >
                {[
                  [
                    "Web Development Assignment",
                    "Submitted on 18 May 2024",
                    "Submitted",
                  ],
                  [
                    "Data Structures Assignment",
                    "Submitted on 15 May 2024",
                    "Submitted",
                  ],
                  [
                    "DBMS Project Phase 1",
                    "Submitted on 12 May 2024",
                    "Under Review",
                  ],
                  [
                    "Operating Systems Report",
                    "Graded on 10 May 2024",
                    "27/30",
                  ],
                ].map(([a, b, c], i) => (
                  <article key={a}>
                    <span className={i < 2 ? "success-dot" : "review-dot"}>
                      {i < 2 ? "✓" : i === 2 ? "◷" : "☆"}
                    </span>
                    <div>
                      <b>{a}</b>
                      <small>{b}</small>
                    </div>
                    <em>{c}</em>
                  </article>
                ))}
              </Panel>
              <Panel title="Messages" action="View All" className="messages">
                {[
                  [
                    "Prof. Sharma",
                    "Reminder: Data Structures assignment is due in 2 days.",
                    "10:30 AM",
                  ],
                  [
                    "Prof. Verma",
                    "DBMS project guidelines have been updated.",
                    "Yesterday",
                  ],
                  [
                    "Prof. Mehta",
                    "Please find the OS reference material attached.",
                    "2 days ago",
                  ],
                ].map(([name, copy, time], i) => (
                  <article key={name}>
                    <Avatar name={name} tone={["blue", "green", "orange"][i]} />
                    <div>
                      <b>{name}</b>
                      <small>{copy}</small>
                    </div>
                    <time>
                      {time} <i />
                    </time>
                  </article>
                ))}
              </Panel>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
