import { useEffect, useState } from "react";
import { PlaneTakeoff, Plus } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import { leaveApi } from "../../api/leaveApi";
import { LEAVE_TYPES } from "../../utils/constants";
import { formatDateLabel } from "../../utils/dateUtils";

const blankForm = { leaveType: "CASUAL", startDate: "", endDate: "", reason: "" };

export default function MyLeave() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [form, setForm] = useState(blankForm);

  function load() {
    setLoading(true);
    leaveApi
      .getMine()
      .then(setRequests)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await leaveApi.create(form);
      setForm(blankForm);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this leave request?")) return;
    setCancellingId(id);
    setError("");
    try {
      await leaveApi.cancel(id);
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
          <h1>Leave</h1>
          <p className="subtitle">Request time off and track approvals.</p>
        </div>
      </div>

      {error && <div className="form-banner error">{error}</div>}

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 16 }}>Request leave</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="leaveType">Leave type</label>
              <select
                id="leaveType"
                value={form.leaveType}
                onChange={(e) => setForm((f) => ({ ...f, leaveType: e.target.value }))}
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start date</label>
                <input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End date</label>
                <input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="reason">Reason</label>
              <textarea
                id="reason"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="Optional context for your manager"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Plus size={16} /> {submitting ? "Submitting..." : "Submit request"}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 16 }}>Your leave history</h3>
          {loading ? (
            <Loader label="Loading..." />
          ) : requests.length === 0 ? (
            <EmptyState
              icon={<PlaneTakeoff size={20} />}
              title="No leave requests yet"
              description="Submit your first request using the form."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {requests.map((r) => (
                <div key={r.id} style={{ paddingBottom: 12, borderBottom: "1px solid var(--color-border)" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {r.leaveType} · {r.days} day{r.days === 1 ? "" : "s"}
                      </div>
                      <div className="muted" style={{ fontSize: 12.5 }}>
                        {formatDateLabel(r.startDate)} → {formatDateLabel(r.endDate)}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.reason && (
                    <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                      {r.reason}
                    </p>
                  )}
                  {r.reviewNotes && (
                    <p className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                      Note: {r.reviewNotes}
                    </p>
                  )}
                  {r.status === "PENDING" && (
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ marginTop: 8 }}
                      disabled={cancellingId === r.id}
                      onClick={() => handleCancel(r.id)}
                    >
                      {cancellingId === r.id ? "Cancelling..." : "Cancel request"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
