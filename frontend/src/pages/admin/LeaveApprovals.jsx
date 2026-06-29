import { useEffect, useState } from "react";
import { Search, Check, X } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import { leaveApi } from "../../api/leaveApi";
import { LEAVE_STATUSES } from "../../utils/constants";
import { formatDateLabel } from "../../utils/dateUtils";

export default function LeaveApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actingId, setActingId] = useState(null);

  function load() {
    setLoading(true);
    leaveApi
      .getAll()
      .then(setRequests)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function act(id, status) {
    setActingId(id);
    setError("");
    try {
      await leaveApi.updateStatus(id, { status });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActingId(null);
    }
  }

  const filtered = requests.filter((r) => !statusFilter || r.status === statusFilter);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Leave requests</h1>
          <p className="subtitle">Review and approve time-off requests from doctors and staff.</p>
        </div>
      </div>

      <div className="filter-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {LEAVE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="form-banner error">{error}</div>}

      {loading ? (
        <Loader label="Loading leave requests..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={22} />}
          title="No leave requests found"
          description="Try a different filter."
        />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Role</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.requesterName}</td>
                    <td className="muted">{r.requesterRole}</td>
                    <td>{r.leaveType}</td>
                    <td className="muted">
                      {formatDateLabel(r.startDate)} → {formatDateLabel(r.endDate)} ({r.days}d)
                    </td>
                    <td className="muted" style={{ maxWidth: 200 }}>
                      {r.reason || "—"}
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>
                      {r.status === "PENDING" ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={actingId === r.id}
                            onClick={() => act(r.id, "APPROVED")}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={actingId === r.id}
                            onClick={() => act(r.id, "REJECTED")}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="muted" style={{ fontSize: 12.5 }}>
                          No actions
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
