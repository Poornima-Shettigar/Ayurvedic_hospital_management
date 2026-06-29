import { NavLink, Outlet } from "react-router-dom";
import {
  Stethoscope,
  LayoutDashboard,
  CalendarDays,
  Search,
  User,
  Users,
  Users2,
  Building2,
  ClipboardList,
  Clock,
  LogOut,
  Pill,
  Receipt,
  PlaneTakeoff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_BY_ROLE = {
  PATIENT: [
    { to: "/patient", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/patient/find-doctors", label: "Find a Doctor", icon: Search },
    { to: "/patient/appointments", label: "My Appointments", icon: CalendarDays },
    { to: "/patient/bills", label: "My Bills", icon: Receipt },
    { to: "/patient/profile", label: "My Profile", icon: User },
  ],
  DOCTOR: [
    { to: "/doctor", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/doctor/appointments", label: "Appointments", icon: CalendarDays },
    { to: "/doctor/availability", label: "Availability", icon: Clock },
    { to: "/doctor/leave", label: "Leave", icon: PlaneTakeoff },
  ],
  STAFF: [
    { to: "/staff", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/staff/pharmacy", label: "Pharmacy", icon: Pill },
    { to: "/staff/billing", label: "Billing", icon: Receipt },
    { to: "/staff/leave", label: "Leave", icon: PlaneTakeoff },
    { to: "/staff/profile", label: "My Profile", icon: User },
  ],
  ADMIN: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/doctors", label: "Doctors", icon: Stethoscope },
    { to: "/admin/staff", label: "Staff", icon: Users2 },
    { to: "/admin/patients", label: "Patients", icon: Users },
    { to: "/admin/departments", label: "Departments", icon: Building2 },
    { to: "/admin/appointments", label: "Appointments", icon: ClipboardList },
    { to: "/admin/pharmacy", label: "Pharmacy", icon: Pill },
    { to: "/admin/billing", label: "Billing", icon: Receipt },
    { to: "/admin/leave", label: "Leave Requests", icon: PlaneTakeoff },
  ],
};

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navItems = NAV_BY_ROLE[user?.role] || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-pulse">
            <Stethoscope size={16} />
          </span>
          Wellspring
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <span className="avatar">{initials(user?.fullName)}</span>
            <div>
              <div className="sidebar-user-name">{user?.fullName}</div>
              <div className="sidebar-user-role">{user?.role?.toLowerCase()}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout}>
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      <main className="app-main">
        {user?.role === "DOCTOR" && user?.approved === false && (
          <div className="pending-banner">
            <Clock size={16} />
            Your account is awaiting admin approval. You can still update your
            profile, but you won't appear in patient searches until approved.
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
