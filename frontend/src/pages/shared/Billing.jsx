import { useEffect, useState } from "react";
import { Plus, Trash2, Receipt, CreditCard } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import { billingApi } from "../../api/billingApi";
import { adminApi } from "../../api/adminApi";
import { INVOICE_ITEM_TYPES, PAYMENT_METHODS } from "../../utils/constants";
import { formatDateLabel } from "../../utils/dateUtils";

const blankItem = { itemType: "CONSULTATION", description: "", quantity: 1, unitPrice: "" };

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [patientId, setPatientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ ...blankItem }]);
  const [creating, setCreating] = useState(false);

  const [payingId, setPayingId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState({});
  const [paymentMethod, setPaymentMethod] = useState({});

  function load() {
    setLoading(true);
    billingApi
      .getAll()
      .then(setInvoices)
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

  function updateItem(index, field, value) {
    setItems((list) => list.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((list) => [...list, { ...blankItem }]);
  }

  function removeItem(index) {
    setItems((list) => list.filter((_, i) => i !== index));
  }

  const total = items.reduce(
    (sum, it) => sum + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0),
    0
  );

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await billingApi.create({
        patientId: Number(patientId),
        appointmentId: appointmentId ? Number(appointmentId) : null,
        notes,
        items: items.map((it) => ({
          ...it,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        })),
      });
      setPatientId("");
      setAppointmentId("");
      setNotes("");
      setItems([{ ...blankItem }]);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handlePay(id) {
    const amount = Number(paymentAmount[id]);
    const method = paymentMethod[id] || "CASH";
    if (!amount || amount <= 0) return;
    setPayingId(id);
    setError("");
    try {
      await billingApi.recordPayment(id, { amount, paymentMethod: method });
      setPaymentAmount((s) => ({ ...s, [id]: "" }));
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setPayingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Billing</h1>
          <p className="subtitle">Create invoices and record payments.</p>
        </div>
      </div>

      {error && <div className="form-banner error">{error}</div>}

      <div className="card">
        <h3
          style={{ marginBottom: 14, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}
        >
          <Plus size={17} /> New invoice
        </h3>
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="invPatient">Patient</label>
              <select
                id="invPatient"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              >
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="invAppointmentId">Appointment ID (optional)</label>
              <input
                id="invAppointmentId"
                type="number"
                min="1"
                placeholder="Link to a specific visit"
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Line items</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item, index) => (
                <div key={index} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <select
                    style={{ width: 140 }}
                    value={item.itemType}
                    onChange={(e) => updateItem(index, "itemType", e.target.value)}
                  >
                    {INVOICE_ITEM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <input
                    style={{ flex: 1, minWidth: 160 }}
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    required
                  />
                  <input
                    style={{ width: 70 }}
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    required
                  />
                  <input
                    style={{ width: 100 }}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Unit price"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                    required
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="btn-text" style={{ marginTop: 8 }} onClick={addItem}>
              + Add line item
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="invNotes">Notes (optional)</label>
            <input id="invNotes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
            <div style={{ fontWeight: 700 }}>Total:₹{total.toFixed(2)}</div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? "Creating..." : "Create invoice"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14, fontSize: 16 }}>All invoices</h3>
        {loading ? (
          <Loader label="Loading invoices..." />
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={<Receipt size={20} />}
            title="No invoices yet"
            description="Create your first invoice above."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Record payment</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600 }}>{inv.patientName}</td>
                    <td className="muted">{formatDateLabel(inv.issueDate)}</td>
                    <td>₹{Number(inv.totalAmount).toFixed(2)}</td>
                    <td className="muted">₹{Number(inv.paidAmount).toFixed(2)}</td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td>
                      {["UNPAID", "PARTIALLY_PAID"].includes(inv.status) ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Amount"
                            style={{ width: 80 }}
                            value={paymentAmount[inv.id] || ""}
                            onChange={(e) =>
                              setPaymentAmount((s) => ({ ...s, [inv.id]: e.target.value }))
                            }
                          />
                          <select
                            style={{ width: 100 }}
                            value={paymentMethod[inv.id] || "CASH"}
                            onChange={(e) =>
                              setPaymentMethod((s) => ({ ...s, [inv.id]: e.target.value }))
                            }
                          >
                            {PAYMENT_METHODS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={payingId === inv.id}
                            onClick={() => handlePay(inv.id)}
                          >
                            <CreditCard size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="muted" style={{ fontSize: 12.5 }}>
                          —
                        </span>
                      )}
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
