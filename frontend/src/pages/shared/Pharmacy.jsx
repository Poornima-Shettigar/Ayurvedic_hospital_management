import { useEffect, useState } from "react";
import { Plus, Pill, PackagePlus } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import { pharmacyApi } from "../../api/pharmacyApi";
import { adminApi } from "../../api/adminApi";
import { useAuth } from "../../context/AuthContext";

const blankMedicine = {
  name: "",
  genericName: "",
  manufacturer: "",
  category: "",
  unit: "",
  pricePerUnit: "",
  stockQuantity: 0,
  reorderLevel: 10,
  expiryDate: "",
};

export default function Pharmacy() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [medicineForm, setMedicineForm] = useState(blankMedicine);
  const [savingMedicine, setSavingMedicine] = useState(false);

  const [restockQty, setRestockQty] = useState({});
  const [restockingId, setRestockingId] = useState(null);

  const [dispenseForm, setDispenseForm] = useState({ medicineId: "", patientId: "", quantity: 1, notes: "" });
  const [dispensing, setDispensing] = useState(false);
  const [dispenseSuccess, setDispenseSuccess] = useState("");

  function load() {
    setLoading(true);
    pharmacyApi
      .getAll()
      .then(setMedicines)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  useEffect(() => {
    adminApi
      .getAllPatients()
      .then(setPatients)
      .catch(() => {});
  }, []);

  async function handleAddMedicine(e) {
    e.preventDefault();
    setSavingMedicine(true);
    setError("");
    try {
      await pharmacyApi.create({
        ...medicineForm,
        pricePerUnit: Number(medicineForm.pricePerUnit),
        stockQuantity: Number(medicineForm.stockQuantity),
        reorderLevel: Number(medicineForm.reorderLevel),
        expiryDate: medicineForm.expiryDate || null,
      });
      setMedicineForm(blankMedicine);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingMedicine(false);
    }
  }

  async function handleRestock(id) {
    const qty = Number(restockQty[id]);
    if (!qty || qty <= 0) return;
    setRestockingId(id);
    setError("");
    try {
      await pharmacyApi.restock(id, qty);
      setRestockQty((s) => ({ ...s, [id]: "" }));
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRestockingId(null);
    }
  }

  async function handleDispense(e) {
    e.preventDefault();
    setDispensing(true);
    setError("");
    setDispenseSuccess("");
    try {
      const result = await pharmacyApi.dispense({
        medicineId: Number(dispenseForm.medicineId),
        patientId: dispenseForm.patientId ? Number(dispenseForm.patientId) : null,
        quantity: Number(dispenseForm.quantity),
        notes: dispenseForm.notes || undefined,
      });
      setDispenseSuccess(`Dispensed ${result.quantity} × ${result.medicineName} to ${result.patientName}`);
      setDispenseForm({ medicineId: "", patientId: "", quantity: 1, notes: "" });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDispensing(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this medicine from the catalog?")) return;
    setError("");
    try {
      await pharmacyApi.remove(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = medicines.filter((m) => m.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Pharmacy</h1>
          <p className="subtitle">Track stock levels and dispense medicine to patients.</p>
        </div>
      </div>

      {error && <div className="form-banner error">{error}</div>}
      {dispenseSuccess && <div className="form-banner success">{dispenseSuccess}</div>}

      <div className="grid grid-2">
        <div className="card">
          <h3
            style={{ marginBottom: 14, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}
          >
            <PackagePlus size={17} /> Dispense medicine
          </h3>
          <form onSubmit={handleDispense}>
            <div className="form-group">
              <label htmlFor="dispenseMedicine">Medicine</label>
              <select
                id="dispenseMedicine"
                value={dispenseForm.medicineId}
                onChange={(e) => setDispenseForm((f) => ({ ...f, medicineId: e.target.value }))}
                required
              >
                <option value="">Select medicine</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.stockQuantity === 0}>
                    {m.name} ({m.stockQuantity} in stock)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dispensePatient">Patient (optional)</label>
                <select
                  id="dispensePatient"
                  value={dispenseForm.patientId}
                  onChange={(e) => setDispenseForm((f) => ({ ...f, patientId: e.target.value }))}
                >
                  <option value="">Walk-in (no patient record)</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="dispenseQuantity">Quantity</label>
                <input
                  id="dispenseQuantity"
                  type="number"
                  min="1"
                  value={dispenseForm.quantity}
                  onChange={(e) => setDispenseForm((f) => ({ ...f, quantity: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="dispenseNotes">Notes (optional)</label>
              <input
                id="dispenseNotes"
                value={dispenseForm.notes}
                onChange={(e) => setDispenseForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={dispensing}>
              {dispensing ? "Dispensing..." : "Dispense"}
            </button>
          </form>
        </div>

        {isAdmin && (
          <div className="card">
            <h3
              style={{ marginBottom: 14, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}
            >
              <Plus size={17} /> Add a medicine
            </h3>
            <form onSubmit={handleAddMedicine}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="medName">Name</label>
                  <input
                    id="medName"
                    value={medicineForm.name}
                    onChange={(e) => setMedicineForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="medCategory">Category</label>
                  <input
                    id="medCategory"
                    placeholder="Tablet, Syrup..."
                    value={medicineForm.category}
                    onChange={(e) => setMedicineForm((f) => ({ ...f, category: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="medPrice">Price per unit</label>
                  <input
                    id="medPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={medicineForm.pricePerUnit}
                    onChange={(e) => setMedicineForm((f) => ({ ...f, pricePerUnit: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="medStock">Starting stock</label>
                  <input
                    id="medStock"
                    type="number"
                    min="0"
                    value={medicineForm.stockQuantity}
                    onChange={(e) => setMedicineForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="medReorder">Reorder level</label>
                  <input
                    id="medReorder"
                    type="number"
                    min="0"
                    value={medicineForm.reorderLevel}
                    onChange={(e) => setMedicineForm((f) => ({ ...f, reorderLevel: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="medExpiry">Expiry date</label>
                  <input
                    id="medExpiry"
                    type="date"
                    value={medicineForm.expiryDate}
                    onChange={(e) => setMedicineForm((f) => ({ ...f, expiryDate: e.target.value }))}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-secondary" disabled={savingMedicine}>
                {savingMedicine ? "Adding..." : "Add to catalog"}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <div className="filter-bar" style={{ marginBottom: 14 }}>
          <input
            placeholder="Search medicines"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 260 }}
          />
        </div>
        {loading ? (
          <Loader label="Loading inventory..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Pill size={20} />}
            title="No medicines found"
            description="Try a different search, or add one above."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price/unit</th>
                  <th>Stock</th>
                  <th>Expiry</th>
                  <th>Restock</th>
                  {isAdmin && <th></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>
                      {m.name}
                      {m.lowStock && (
                        <span
                          className="tag"
                          style={{ marginLeft: 8, color: "var(--color-cancelled)" }}
                        >
                          Low stock
                        </span>
                      )}
                    </td>
                    <td className="muted">{m.category || "—"}</td>
                    <td className="muted">₹{Number(m.pricePerUnit).toFixed(2)}</td>
                    <td>
                      {m.stockQuantity} {m.unit}
                    </td>
                    <td className="muted">{m.expiryDate || "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          style={{ width: 70 }}
                          value={restockQty[m.id] || ""}
                          onChange={(e) => setRestockQty((s) => ({ ...s, [m.id]: e.target.value }))}
                        />
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={restockingId === m.id}
                          onClick={() => handleRestock(m.id)}
                        >
                          {restockingId === m.id ? "..." : "Add"}
                        </button>
                      </div>
                    </td>
                    {isAdmin && (
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>
                          Remove
                        </button>
                      </td>
                    )}
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
