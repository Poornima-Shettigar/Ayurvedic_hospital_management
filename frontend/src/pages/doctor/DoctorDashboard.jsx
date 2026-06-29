import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3 } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import { appointmentApi } from "../../api/appointmentApi";
import { useAuth } from "../../context/AuthContext";
import { formatTimeLabel, todayISODate } from "../../utils/dateUtils";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentApi
      .getForDoctor()
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading your schedule..." />;

  const today = todayISODate();
  const todayAppointments = appointments
    .filter((a) => a.appointmentDate === today && !["CANCELLED", "REJECTED"].includes(a.status))
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

  const pendingCount = appointments.filter((a) => a.status === "PENDING").length;
  const confirmedUpcoming = appointments.filter(
    (a) => a.status === "CONFIRMED" && a.appointmentDate >= today
  ).length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          {/* ?.split(" ").slice(-1)[0]}< */}
          <h1>Good to see you, Dr. {user?.fullName}</h1>
          <p className="subtitle">Here's your schedule for today.</p>
        </div>
        <Link to="/doctor/appointments" className="btn btn-primary">
          View all appointments
        </Link>
      </div>

      <div className="grid grid-stats">
        <div className="card stat-card">
          <span className="stat-label">Today's appointments</span>
          <span className="stat-value">{todayAppointments.length}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Awaiting your response</span>
          <span className="stat-value">{pendingCount}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Confirmed upcoming</span>
          <span className="stat-value">{confirmedUpcoming}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Completed visits</span>
          <span className="stat-value">{completedCount}</span>
        </div>
      </div>

      <div className="card">
        <h3
          style={{ marginBottom: 16, fontSize: 17, display: "flex", alignItems: "center", gap: 8 }}
        >
          <CalendarDays size={17} /> Today's schedule
        </h3>
        {todayAppointments.length === 0 ? (
          <EmptyState
            icon={<Clock3 size={20} />}
            title="Nothing on the books today"
            description="Enjoy the quiet — new requests will show up here."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{formatTimeLabel(a.appointmentTime)}</td>
                    <td>{a.patientName}</td>
                    <td className="muted">{a.reason}</td>
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
