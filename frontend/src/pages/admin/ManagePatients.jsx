import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import { adminApi } from "../../api/adminApi";

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .getAllPatients()
      .then(setPatients)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p className="subtitle">Everyone registered with Wellspring.</p>
        </div>
      </div>

      <div className="filter-bar">
        <input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
      </div>

      {error && <div className="form-banner error">{error}</div>}

      {loading ? (
        <Loader label="Loading patients..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Search size={22} />} title="No patients found" description="Try a different search." />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Blood group</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.fullName}</td>
                    <td className="muted">{p.email}</td>
                    <td className="muted">{p.phone || "—"}</td>
                    <td className="muted">{p.gender || "—"}</td>
                    <td className="muted">{p.bloodGroup || "—"}</td>
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
