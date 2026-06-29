import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import { staffApi } from "../../api/staffApi";
import { departmentApi } from "../../api/departmentApi";
import { STAFF_DESIGNATIONS } from "../../utils/constants";

const blankForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  designation: STAFF_DESIGNATIONS[0],
  departmentId: "",
  dateOfJoining: "",
  address: "",
};

export default function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(blankForm);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  function load() {
    setLoading(true);
    staffApi
      .getAll()
      .then(setStaff)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    departmentApi
      .getAll()
      .then(setDepartments)
      .catch(() => {});
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await staffApi.create({
        ...form,
        departmentId: form.departmentId ? Number(form.departmentId) : null,
        dateOfJoining: form.dateOfJoining || null,
      });
      setForm(blankForm);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this staff member? This cannot be undone.")) return;
    setDeletingId(id);
    setError("");
    try {
      await staffApi.remove(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = staff.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q) ||
      s.employeeCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Staff</h1>
          <p className="subtitle">Onboard and manage non-doctor hospital staff.</p>
        </div>
      </div>

      {error && <div className="form-banner error">{error}</div>}

      <div className="card">
        <h3
          style={{ marginBottom: 14, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}
        >
          <Plus size={17} /> Add a staff member
        </h3>
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="staffName">Full name</label>
              <input
                id="staffName"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="staffEmail">Email</label>
              <input
                id="staffEmail"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="staffPassword">Temporary password</label>
              <input
                id="staffPassword"
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="staffPhone">Phone</label>
              <input
                id="staffPhone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="staffDesignation">Designation</label>
              <select
                id="staffDesignation"
                value={form.designation}
                onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
              >
                {STAFF_DESIGNATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="staffDepartment">Department (optional)</label>
              <select
                id="staffDepartment"
                value={form.departmentId}
                onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
              >
                <option value="">None</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="staffJoining">Date of joining</label>
              <input
                id="staffJoining"
                type="date"
                value={form.dateOfJoining}
                onChange={(e) => setForm((f) => ({ ...f, dateOfJoining: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="staffAddress">Address</label>
              <input
                id="staffAddress"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? "Adding..." : "Add staff member"}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="filter-bar" style={{ marginBottom: 14 }}>
          <input
            placeholder="Search by name, code, or designation"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 280 }}
          />
        </div>
        {loading ? (
          <Loader label="Loading staff..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={22} />}
            title="No staff found"
            description="Try a different search, or add someone above."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Phone</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td className="muted">{s.employeeCode}</td>
                    <td style={{ fontWeight: 600 }}>{s.fullName}</td>
                    <td>{s.designation}</td>
                    <td className="muted">{s.departmentName || "—"}</td>
                    <td className="muted">{s.phone || "—"}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === s.id}
                        onClick={() => handleDelete(s.id)}
                      >
                        {deletingId === s.id ? "Removing..." : "Remove"}
                      </button>
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
