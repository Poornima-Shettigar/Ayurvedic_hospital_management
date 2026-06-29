import { Fragment, useEffect, useState } from "react";
import { Search, CheckCircle2, XCircle, Ban, ClipboardCheck } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import { appointmentApi } from "../../api/appointmentApi";
import { APPOINTMENT_STATUSES } from "../../utils/constants";
import { formatDateLabel, formatTimeLabel } from "../../utils/dateUtils";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [notes, setNotes] = useState("");

  function load() {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (dateFilter) params.date = dateFilter;
    appointmentApi
      .getForDoctor(params)
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFilter]);

  async function act(id, status, extra = {}) {
    setActingId(id);
    setError("");
    try {
      await appointmentApi.updateStatus(id, { status, ...extra });
      setCompletingId(null);
      setNotes("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p className="subtitle">Review requests and manage your schedule.</p>
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
                  <th>Date</th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <Fragment key={a.id}>
                    <tr>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.patientName}</div>
                        {a.patientPhone && (
                          <div className="muted" style={{ fontSize: 12.5 }}>
                            {a.patientPhone}
                          </div>
                        )}
                      </td>
                      <td>{formatDateLabel(a.appointmentDate)}</td>
                      <td>{formatTimeLabel(a.appointmentTime)}</td>
                      <td className="muted" style={{ maxWidth: 200 }}>
                        {a.reason}
                      </td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {a.status === "PENDING" && (
                            <>
                              <button
                                className="btn btn-secondary btn-sm"
                                disabled={actingId === a.id}
                                onClick={() => act(a.id, "CONFIRMED")}
                              >
                                <CheckCircle2 size={14} /> Confirm
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={actingId === a.id}
                                onClick={() => act(a.id, "REJECTED")}
                              >
                                <XCircle size={14} /> Decline
                              </button>
                            </>
                          )}
                          {a.status === "CONFIRMED" && (
                            <>
                              <button
                                className="btn btn-secondary btn-sm"
                                disabled={actingId === a.id}
                                onClick={() => setCompletingId(completingId === a.id ? null : a.id)}
                              >
                                <ClipboardCheck size={14} /> Complete
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={actingId === a.id}
                                onClick={() => act(a.id, "CANCELLED")}
                              >
                                <Ban size={14} /> Cancel
                              </button>
                            </>
                          )}
                          {["COMPLETED", "CANCELLED", "REJECTED"].includes(a.status) && (
                            <span className="muted" style={{ fontSize: 12.5 }}>
                              No actions
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                    {completingId === a.id && (
                      <tr>
                        <td colSpan={6} style={{ background: "var(--color-surface-alt)" }}>
                          <div
                            style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}
                          >
                            <textarea
                              style={{ flex: 1, minWidth: 220 }}
                              placeholder="Consultation notes (optional)"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                            />
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={actingId === a.id}
                              onClick={() => act(a.id, "COMPLETED", { doctorNotes: notes || undefined })}
                            >
                              Mark completed
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
