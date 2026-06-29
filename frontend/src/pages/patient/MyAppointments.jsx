import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import { appointmentApi } from "../../api/appointmentApi";
import { APPOINTMENT_STATUSES } from "../../utils/constants";
import { formatDateLabel, formatTimeLabel } from "../../utils/dateUtils";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    appointmentApi
      .getMine(statusFilter || undefined)
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleCancel(id) {
    if (!window.confirm("Cancel this appointment?")) return;
    setCancellingId(id);
    setError("");
    try {
      await appointmentApi.updateStatus(id, { status: "CANCELLED" });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My appointments</h1>
          <p className="subtitle">Track every visit, past and upcoming.</p>
        </div>
        <Link to="/patient/find-doctors" className="btn btn-primary">
          Book new appointment
        </Link>
      </div>

      <div className="filter-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {APPOINTMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="form-banner error">{error}</div>}

      {loading ? (
        <Loader label="Loading your appointments..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={<Search size={22} />}
          title="No appointments here"
          description="Try a different filter, or book your first appointment."
        />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.doctorName}</td>
                    <td className="muted">{a.departmentName}</td>
                    <td>{formatDateLabel(a.appointmentDate)}</td>
                    <td>{formatTimeLabel(a.appointmentTime)}</td>
                    <td className="muted" style={{ maxWidth: 220 }}>
                      {a.reason}
                    </td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>
                      {["PENDING", "CONFIRMED"].includes(a.status) && (
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={cancellingId === a.id}
                          onClick={() => handleCancel(a.id)}
                        >
                          {cancellingId === a.id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                      {a.status === "COMPLETED" && a.doctorNotes && (
                        <span className="tag" title={a.doctorNotes}>
                          Has notes
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
