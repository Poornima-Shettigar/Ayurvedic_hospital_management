import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Stethoscope, BadgeCheck } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import { doctorApi } from "../../api/doctorApi";
import { departmentApi } from "../../api/departmentApi";

export default function FindDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentApi
      .getAll()
      .then(setDepartments)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    doctorApi
      .getApproved(departmentId || undefined)
      .then(setDoctors)
      .finally(() => setLoading(false));
  }, [departmentId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(
      (d) =>
        d.fullName.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.departmentName?.toLowerCase().includes(q)
    );
  }, [doctors, search]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Find a doctor</h1>
          <p className="subtitle">Browse our care team and book a time that suits you.</p>
        </div>
      </div>

      <div className="filter-bar">
        <input
          placeholder="Search by name or specialization"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader label="Finding doctors..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={22} />}
          title="No doctors found"
          description="Try a different search term or department."
        />
      ) : (
        <div className="grid grid-cards">
          {filtered.map((doc) => (
            <div key={doc.id} className="card doctor-card">
              <div className="doctor-card-head">
                <span className="doctor-avatar">
                  <Stethoscope size={20} />
                </span>
                <div>
                  <div style={{ fontWeight: 700 }}>{doc.fullName}</div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {doc.specialization}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className="tag">{doc.departmentName}</span>
                {doc.experienceYears > 0 && <span className="tag">{doc.experienceYears} yrs exp</span>}
              </div>
              {doc.bio && (
                <p className="muted" style={{ fontSize: 13.5 }}>
                  {doc.bio}
                </p>
              )}
              <button
                className="btn btn-primary btn-block"
                onClick={() => navigate(`/patient/book/${doc.id}`)}
              >
                <BadgeCheck size={16} />
                Book appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
