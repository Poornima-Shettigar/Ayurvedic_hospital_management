import { useEffect, useState } from "react";
import { User } from "lucide-react";
import Loader from "../../components/Loader";
import { patientApi } from "../../api/patientApi";
import { useAuth } from "../../context/AuthContext";
import { GENDERS } from "../../utils/constants";

export default function PatientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    patientApi
      .getMyProfile()
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await patientApi.updateMyProfile({
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth || null,
        gender: profile.gender,
        address: profile.address,
        bloodGroup: profile.bloodGroup,
      });
      setProfile(updated);
      setSuccess("Profile updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading your profile..." />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My profile</h1>
          <p className="subtitle">Keep your details up to date for a smoother visit.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <span className="doctor-avatar" style={{ width: 52, height: 52 }}>
            <User size={22} />
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.fullName}</div>
            <div className="muted" style={{ fontSize: 13.5 }}>
              {user?.email}
            </div>
          </div>
        </div>

        {error && <div className="form-banner error">{error}</div>}
        {success && <div className="form-banner success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={profile.phone || ""} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of birth</label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={profile.dateOfBirth || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select id="gender" name="gender" value={profile.gender || ""} onChange={handleChange}>
                <option value="">Select</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="bloodGroup">Blood group</label>
              <input
                id="bloodGroup"
                name="bloodGroup"
                placeholder="e.g. O+"
                value={profile.bloodGroup || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea id="address" name="address" value={profile.address || ""} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
