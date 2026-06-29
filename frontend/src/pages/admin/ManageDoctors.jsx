import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import { adminApi } from "../../api/adminApi";

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    adminApi
      .getAllDoctors()
      .then(setDoctors)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleApprove(id) {
    setApprovingId(id);
    setError("");
    try {
      await adminApi.approveDoctor(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setApprovingId(null);
    }
  }

  const filtered = doctors.filter((d) => {
    if (filter === "PENDING") return !d.approved;
    if (filter === "APPROVED") return d.approved;
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Doctors</h1>
          <p className="subtitle">Approve new doctors and review the care team.</p>
        </div>
      </div>

      <div className="filter-bar">
        {["ALL", "PENDING", "APPROVED"].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-secondary" : "btn-outline"}`}
            onClick={() => setFilter(f)}
          >
            {f === "ALL" ? "All" : f === "PENDING" ? "Pending approval" : "Approved"}
          </button>
        ))}
      </div>

      {error && <div className="form-banner error">{error}</div>}

      {loading ? (
        <Loader label="Loading doctors..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Search size={22} />} title="No doctors found" description="Try a different filter." />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.fullName}</td>
                    <td className="muted">{d.departmentName}</td>
                    <td className="muted">{d.specialization}</td>
                    <td className="muted">{d.experienceYears} yrs</td>
                    <td>
                      <span className={`badge badge-${d.approved ? "CONFIRMED" : "PENDING"}`}>
                        {d.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td>
                      {!d.approved && (
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={approvingId === d.id}
                          onClick={() => handleApprove(d.id)}
                        >
                          {approvingId === d.id ? "Approving..." : "Approve"}
                        </button>
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
