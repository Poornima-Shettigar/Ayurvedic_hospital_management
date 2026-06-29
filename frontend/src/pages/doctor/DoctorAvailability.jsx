import { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { doctorApi } from "../../api/doctorApi";
import { WEEKDAYS } from "../../utils/constants";

export default function DoctorAvailability() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    doctorApi
      .getMyProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          workStartTime: data.workStartTime,
          workEndTime: data.workEndTime,
          slotDurationMinutes: data.slotDurationMinutes,
          workingDays: data.workingDays ? data.workingDays.split(",") : [],
          consultationFee: data.consultationFee ?? "",
          bio: data.bio || "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleDay(code) {
    setForm((f) => {
      const has = f.workingDays.includes(code);
      return {
        ...f,
        workingDays: has ? f.workingDays.filter((d) => d !== code) : [...f.workingDays, code],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await doctorApi.updateAvailability({
        workStartTime: form.workStartTime,
        workEndTime: form.workEndTime,
        slotDurationMinutes: Number(form.slotDurationMinutes),
        workingDays: form.workingDays.join(","),
        consultationFee: form.consultationFee !== "" ? Number(form.consultationFee) : null,
        bio: form.bio,
      });
      setProfile(updated);
      setSuccess("Availability updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <Loader label="Loading your availability..." />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Availability</h1>
          <p className="subtitle">Control your working hours and how patients can book you.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 620 }}>
        {!profile.approved && (
          <div className="form-banner error">
            Your account is still pending admin approval — patients won't see you in search yet.
          </div>
        )}
        {error && <div className="form-banner error">{error}</div>}
        {success && <div className="form-banner success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="workStartTime">Day starts at</label>
              <input
                id="workStartTime"
                type="time"
                value={form.workStartTime}
                onChange={(e) => setForm((f) => ({ ...f, workStartTime: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="workEndTime">Day ends at</label>
              <input
                id="workEndTime"
                type="time"
                value={form.workEndTime}
                onChange={(e) => setForm((f) => ({ ...f, workEndTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="slotDurationMinutes">Appointment length (minutes)</label>
            <input
              id="slotDurationMinutes"
              type="number"
              min="5"
              max="180"
              step="5"
              value={form.slotDurationMinutes}
              onChange={(e) => setForm((f) => ({ ...f, slotDurationMinutes: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Working days</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {WEEKDAYS.map((d) => (
                <button
                  type="button"
                  key={d.code}
                  className={`slot-btn${form.workingDays.includes(d.code) ? " selected" : ""}`}
                  style={{ minWidth: 56 }}
                  onClick={() => toggleDay(d.code)}
                >
                  {d.code}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="consultationFee">Consultation fee (optional)</label>
            <input
              id="consultationFee"
              type="number"
              min="0"
              step="0.01"
              value={form.consultationFee}
              onChange={(e) => setForm((f) => ({ ...f, consultationFee: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Short bio (shown to patients)</label>
            <textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save availability"}
          </button>
        </form>
      </div>
    </div>
  );
}
