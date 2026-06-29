import { useEffect, useState } from "react";
import { Plus, Trash2, Building2 } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import { departmentApi } from "../../api/departmentApi";

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function load() {
    setLoading(true);
    departmentApi
      .getAll()
      .then(setDepartments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await departmentApi.create(form);
      setForm({ name: "", description: "" });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this department?")) return;
    setDeletingId(id);
    setError("");
    try {
      await departmentApi.remove(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Departments</h1>
          <p className="subtitle">Organize the specialties patients can search by.</p>
        </div>
      </div>

      {error && <div className="form-banner error">{error}</div>}

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 16 }}>Add a department</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              <Plus size={16} /> {creating ? "Adding..." : "Add department"}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 16 }}>All departments</h3>
          {loading ? (
            <Loader label="Loading departments..." />
          ) : departments.length === 0 ? (
            <EmptyState
              icon={<Building2 size={20} />}
              title="No departments yet"
              description="Add your first one to get started."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {departments.map((d) => (
                <div
                  key={d.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{d.name}</div>
                    <div className="muted" style={{ fontSize: 12.5 }}>
                      {d.doctorCount} doctor{d.doctorCount === 1 ? "" : "s"}
                    </div>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={deletingId === d.id}
                    onClick={() => handleDelete(d.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
