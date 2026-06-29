import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import { billingApi } from "../../api/billingApi";
import { formatDateLabel } from "../../utils/dateUtils";

export default function MyBills() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    billingApi
      .getMine()
      .then(setInvoices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My bills</h1>
          <p className="subtitle">Invoices and payment status for your visits.</p>
        </div>
      </div>

      {error && <div className="form-banner error">{error}</div>}

      {loading ? (
        <Loader label="Loading your bills..." />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={<Receipt size={22} />}
          title="No bills yet"
          description="Invoices from your visits will show up here."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {invoices.map((inv) => (
            <div key={inv.id} className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Invoice #{inv.id}</div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {formatDateLabel(inv.issueDate)}
                  </div>
                </div>
                <StatusBadge status={inv.status} />
              </div>

              <div className="table-wrap" style={{ marginTop: 14 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit price</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.description}</td>
                        <td className="muted">{item.quantity}</td>
                        <td className="muted">₹{Number(item.unitPrice).toFixed(2)}</td>
                        <td>₹{Number(item.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 24, marginTop: 14, fontSize: 14 }}
              >
                <div>
                  <span className="muted">Total: </span>
                  <strong>₹{Number(inv.totalAmount).toFixed(2)}</strong>
                </div>
                <div>
                  <span className="muted">Paid: </span>
                  <strong>₹{Number(inv.paidAmount).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
