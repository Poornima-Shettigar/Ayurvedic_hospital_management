import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Stethoscope,
  Building2,
  ClipboardList,
  Clock3,
  CheckCircle2,
  Users2,
  Pill,
  Receipt,
  PlaneTakeoff,
} from "lucide-react";
import Loader from "../../components/Loader";
import { adminApi } from "../../api/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .getDashboard()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Admin overview</h1>
          <p className="subtitle">A snapshot of how Wellspring is running today.</p>
        </div>
      </div>

      {error && <div className="form-banner error">{error}</div>}

      <div className="grid grid-stats">
        <div className="card stat-card">
          <span className="stat-label">Total patients</span>
          <span className="stat-value">{stats?.totalPatients ?? 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Total doctors</span>
          <span className="stat-value">{stats?.totalDoctors ?? 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Departments</span>
          <span className="stat-value">{stats?.totalDepartments ?? 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Appointments today</span>
          <span className="stat-value">{stats?.appointmentsToday ?? 0}</span>
        </div>
      </div>

      <div className="grid grid-stats">
        <div className="card stat-card">
          <span className="stat-label">Total staff</span>
          <span className="stat-value">{stats?.totalStaff ?? 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Low stock medicines</span>
          <span className="stat-value">{stats?.lowStockMedicines ?? 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Unpaid invoices</span>
          <span className="stat-value">{stats?.unpaidInvoices ?? 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Pending leave requests</span>
          <span className="stat-value">{stats?.pendingLeaveRequests ?? 0}</span>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span
              className="doctor-avatar"
              style={{ background: "var(--color-pending-bg)", color: "var(--color-pending)" }}
            >
              <Clock3 size={18} />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{stats?.pendingDoctorApprovals ?? 0}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                Doctors awaiting approval
              </div>
            </div>
          </div>
          <Link to="/admin/doctors" className="btn btn-secondary btn-block">
            Review doctors
          </Link>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span
              className="doctor-avatar"
              style={{ background: "var(--color-confirmed-bg)", color: "var(--color-confirmed)" }}
            >
              <CheckCircle2 size={18} />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{stats?.completedAppointments ?? 0}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                Visits completed all-time
              </div>
            </div>
          </div>
          <Link to="/admin/appointments" className="btn btn-secondary btn-block">
            View all appointments
          </Link>
        </div>
      </div>

      <div className="grid grid-cards">
        <Link to="/admin/doctors" className="card" style={{ textDecoration: "none" }}>
          <Stethoscope size={20} style={{ color: "var(--color-primary)" }} />
          <h3 style={{ marginTop: 10, fontSize: 16 }}>Doctors</h3>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            Approve and manage doctor profiles
          </p>
        </Link>
        <Link to="/admin/staff" className="card" style={{ textDecoration: "none" }}>
          <Users2 size={20} style={{ color: "var(--color-primary)" }} />
          <h3 style={{ marginTop: 10, fontSize: 16 }}>Staff</h3>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            Onboard nurses, receptionists, and more
          </p>
        </Link>
        <Link to="/admin/patients" className="card" style={{ textDecoration: "none" }}>
          <Users size={20} style={{ color: "var(--color-primary)" }} />
          <h3 style={{ marginTop: 10, fontSize: 16 }}>Patients</h3>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            Browse registered patients
          </p>
        </Link>
        <Link to="/admin/departments" className="card" style={{ textDecoration: "none" }}>
          <Building2 size={20} style={{ color: "var(--color-primary)" }} />
          <h3 style={{ marginTop: 10, fontSize: 16 }}>Departments</h3>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            Organize specialties and care areas
          </p>
        </Link>
        <Link to="/admin/appointments" className="card" style={{ textDecoration: "none" }}>
          <ClipboardList size={20} style={{ color: "var(--color-primary)" }} />
          <h3 style={{ marginTop: 10, fontSize: 16 }}>Appointments</h3>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            See every booking across the hospital
          </p>
        </Link>
        <Link to="/admin/pharmacy" className="card" style={{ textDecoration: "none" }}>
          <Pill size={20} style={{ color: "var(--color-primary)" }} />
          <h3 style={{ marginTop: 10, fontSize: 16 }}>Pharmacy</h3>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            Manage inventory and dispense medicine
          </p>
        </Link>
        <Link to="/admin/billing" className="card" style={{ textDecoration: "none" }}>
          <Receipt size={20} style={{ color: "var(--color-primary)" }} />
          <h3 style={{ marginTop: 10, fontSize: 16 }}>Billing</h3>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            Invoices and payments
          </p>
        </Link>
        <Link to="/admin/leave" className="card" style={{ textDecoration: "none" }}>
          <PlaneTakeoff size={20} style={{ color: "var(--color-primary)" }} />
          <h3 style={{ marginTop: 10, fontSize: 16 }}>Leave requests</h3>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            Approve time off for doctors and staff
          </p>
        </Link>
      </div>
    </div>
  );
}
