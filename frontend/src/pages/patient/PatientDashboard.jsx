import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Search, Clock3, Stethoscope } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import { appointmentApi } from "../../api/appointmentApi";
import { useAuth } from "../../context/AuthContext";
import { formatDateLabel, formatTimeLabel, todayISODate } from "../../utils/dateUtils";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentApi
      .getMine()
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading your dashboard..." />;

  const today = todayISODate();
  const upcoming = appointments
    .filter((a) => ["PENDING", "CONFIRMED"].includes(a.status) && a.appointmentDate >= today)
    .sort((a, b) =>
      (a.appointmentDate + a.appointmentTime).localeCompare(b.appointmentDate + b.appointmentTime)
    );

  const nextAppointment = upcoming[0];
  const pendingCount = appointments.filter((a) => a.status === "PENDING").length;
  const confirmedCount = appointments.filter((a) => a.status === "CONFIRMED").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Hi {user?.fullName?.split(" ")[0]}, welcome back</h1>
          <p className="subtitle">Here's where things stand with your care.</p>
        </div>
        <Link to="/patient/find-doctors" className="btn btn-primary">
          <Search size={16} />
          Find a doctor
        </Link>
      </div>

      <div className="grid grid-stats">
        <div className="card stat-card">
          <span className="stat-label">Upcoming</span>
          <span className="stat-value">{upcoming.length}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Awaiting confirmation</span>
          <span className="stat-value">{pendingCount}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Confirmed</span>
          <span className="stat-value">{confirmedCount}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Completed visits</span>
          <span className="stat-value">{completedCount}</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 17 }}>Your next appointment</h3>
        {nextAppointment ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span className="doctor-avatar">
                <Stethoscope size={20} />
              </span>
              <div>
                <div style={{ fontWeight: 700 }}>{nextAppointment.doctorName}</div>
                <div className="muted" style={{ fontSize: 13.5 }}>
                  {nextAppointment.departmentName} · {nextAppointment.doctorSpecialization}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }} className="muted">
                <CalendarDays size={16} />
                {formatDateLabel(nextAppointment.appointmentDate)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }} className="muted">
                <Clock3 size={16} />
                {formatTimeLabel(nextAppointment.appointmentTime)}
              </div>
              <StatusBadge status={nextAppointment.status} />
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<CalendarDays size={22} />}
            title="No upcoming appointments"
            description="When you're ready, find a doctor and book a time that works for you."
            action={
              <Link to="/patient/find-doctors" className="btn btn-primary">
                Find a doctor
              </Link>
            }
          />
        )}
      </div>

      <div className="card">
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}
        >
          <h3 style={{ fontSize: 17 }}>Recent activity</h3>
          <Link to="/patient/appointments" className="btn-text">
            View all
          </Link>
        </div>
        {appointments.length === 0 ? (
          <p className="muted">No appointments yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 5).map((a) => (
                  <tr key={a.id}>
                    <td>{a.doctorName}</td>
                    <td>{formatDateLabel(a.appointmentDate)}</td>
                    <td>{formatTimeLabel(a.appointmentTime)}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
