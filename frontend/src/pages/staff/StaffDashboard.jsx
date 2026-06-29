import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, Receipt, PlaneTakeoff, User } from "lucide-react";
import Loader from "../../components/Loader";
import { staffApi } from "../../api/staffApi";
import { useAuth } from "../../context/AuthContext";

export default function StaffDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    staffApi
      .getMyProfile()
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading your dashboard..." />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.fullName?.split(" ")[0]}</h1>
          <p className="subtitle">
            {profile?.designation} {profile?.departmentName ? `· ${profile.departmentName}` : ""}
          </p>
        </div>
      </div>

      {error && <div className="form-banner error">{error}</div>}

      {profile && (
        <div className="card" style={{ maxWidth: 480 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <span className="doctor-avatar" style={{ width: 52, height: 52 }}>
              <User size={22} />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{profile.fullName}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                {profile.employeeCode}
              </div>
            </div>
          </div>
          <div className="grid grid-2" style={{ gap: 10 }}>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>
                Email
              </div>
              <div>{profile.email}</div>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>
                Phone
              </div>
              <div>{profile.phone || "—"}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cards">
        <Link to="/staff/pharmacy" className="card" style={{ textDecoration: "none" }}>
          <Pill size={20} style={{ color: "var(--color-primary)" }} />
          <h3 style={{ marginTop: 10, fontSize: 16 }}>Pharmacy</h3>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            Dispense medicine and check stock
          </p>
        </Link>
        <Link to="/staff/billing" className="card" style={{ textDecoration: "none" }}>
          <Receipt size={20} style={{ color: "var(--color-primary)" }} />
          <h3 style={{ marginTop: 10, fontSize: 16 }}>Billing</h3>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            Create invoices and record payments
          </p>
        </Link>
        <Link to="/staff/leave" className="card" style={{ textDecoration: "none" }}>
          <PlaneTakeoff size={20} style={{ color: "var(--color-primary)" }} />
          <h3 style={{ marginTop: 10, fontSize: 16 }}>Leave</h3>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            Request time off
          </p>
        </Link>
      </div>
    </div>
  );
}
