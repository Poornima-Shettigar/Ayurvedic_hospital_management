import { useEffect, useState } from "react";
import { User } from "lucide-react";
import Loader from "../../components/Loader";
import { staffApi } from "../../api/staffApi";

export default function StaffProfile() {
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

  if (loading) return <Loader label="Loading your profile..." />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My profile</h1>
          <p className="subtitle">Your employee record on file.</p>
        </div>
      </div>

      {error && <div className="form-banner error">{error}</div>}

      {profile && (
        <div className="card" style={{ maxWidth: 480 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <span className="doctor-avatar" style={{ width: 52, height: 52 }}>
              <User size={22} />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{profile.fullName}</div>
              <div className="muted" style={{ fontSize: 13.5 }}>
                {profile.email}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="muted">Employee code</span>
              <span style={{ fontWeight: 600 }}>{profile.employeeCode}</span>
            </div>
            <hr className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="muted">Designation</span>
              <span style={{ fontWeight: 600 }}>{profile.designation}</span>
            </div>
            <hr className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="muted">Department</span>
              <span style={{ fontWeight: 600 }}>{profile.departmentName || "—"}</span>
            </div>
            <hr className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="muted">Phone</span>
              <span style={{ fontWeight: 600 }}>{profile.phone || "—"}</span>
            </div>
            <hr className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="muted">Date of joining</span>
              <span style={{ fontWeight: 600 }}>{profile.dateOfJoining || "—"}</span>
            </div>
            <hr className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="muted">Address</span>
              <span style={{ fontWeight: 600, textAlign: "right" }}>{profile.address || "—"}</span>
            </div>
          </div>

          <p className="muted" style={{ fontSize: 12.5, marginTop: 18 }}>
            To update these details, contact an administrator.
          </p>
        </div>
      )}
    </div>
  );
}
