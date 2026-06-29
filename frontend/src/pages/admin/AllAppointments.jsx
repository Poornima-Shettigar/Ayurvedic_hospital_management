import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import { appointmentApi } from "../../api/appointmentApi";
import { APPOINTMENT_STATUSES } from "../../utils/constants";
import { formatDateLabel, formatTimeLabel } from "../../utils/dateUtils";

export default function AllAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (dateFilter) params.date = dateFilter;
    appointmentApi
      .getAll(params)
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFilter]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>All appointments</h1>
          <p className="subtitle">Every booking across the hospital, in one place.</p>
        </div>
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
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        {dateFilter && (
          <button className="btn-text" onClick={() => setDateFilter("")}>
            Clear date
          </button>
        )}
      </div>

      {error && <div className="form-banner error">{error}</div>}

      {loading ? (
        <Loader label="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={<Search size={22} />}
          title="No appointments found"
          description="Try a different filter."
        />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.patientName}</td>
                    <td>{a.doctorName}</td>
                    <td className="muted">{a.departmentName}</td>
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
        </div>
      )}
    </div>
  );
}
