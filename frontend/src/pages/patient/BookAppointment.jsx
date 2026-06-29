import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3, Stethoscope, CheckCircle2 } from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import { doctorApi } from "../../api/doctorApi";
import { appointmentApi } from "../../api/appointmentApi";
import {
  nextNDates,
  dayShortLabel,
  dayNumberLabel,
  formatTimeLabel,
  formatDateLabel,
} from "../../utils/dateUtils";

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  const dateOptions = nextNDates(14);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reason, setReason] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    doctorApi
      .getById(doctorId)
      .then(setDoctor)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingDoctor(false));
  }, [doctorId]);

  useEffect(() => {
    setSelectedTime(null);
    setLoadingSlots(true);
    doctorApi
      .getAvailableSlots(doctorId, selectedDate)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [doctorId, selectedDate]);

  async function handleConfirm() {
    setError("");
    if (!selectedTime) {
      setError("Please choose a time slot");
      return;
    }
    if (!reason.trim()) {
      setError("Please tell us the reason for your visit");
      return;
    }
    setSubmitting(true);
    try {
      await appointmentApi.book({
        doctorId: Number(doctorId),
        date: selectedDate,
        time: selectedTime,
        reason: reason.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
      // The slot may have just been taken by someone else — refresh availability.
      doctorApi
        .getAvailableSlots(doctorId, selectedDate)
        .then(setSlots)
        .catch(() => {});
      setSelectedTime(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingDoctor) return <Loader label="Loading doctor profile..." />;

  if (success) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div className="icon-wrap" style={{ display: "inline-flex", marginBottom: 14 }}>
            <CheckCircle2 size={26} />
          </div>
          <h2 style={{ marginBottom: 8 }}>Appointment requested</h2>
          <p className="muted" style={{ marginBottom: 22, maxWidth: 460, marginInline: "auto" }}>
            We've sent your request to {doctor?.fullName} for {formatDateLabel(selectedDate)} at{" "}
            {formatTimeLabel(selectedTime)}. It will show as "Pending" until the doctor confirms it.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button className="btn btn-outline" onClick={() => navigate("/patient/find-doctors")}>
              Book another
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/patient/appointments")}>
              View my appointments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <button
        className="btn-text"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start" }}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="doctor-avatar" style={{ width: 52, height: 52 }}>
            <Stethoscope size={22} />
          </span>
          <div>
            <h1 style={{ fontSize: 22 }}>Book with {doctor?.fullName}</h1>
            <p className="subtitle">
              {doctor?.departmentName} · {doctor?.specialization}
            </p>
          </div>
        </div>
      </div>

      {error && <div className="form-banner error">{error}</div>}

      <div className="card">
        <h3
          style={{ marginBottom: 14, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}
        >
          <CalendarDays size={17} /> Choose a date
        </h3>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
          {dateOptions.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`slot-btn${d === selectedDate ? " selected" : ""}`}
              style={{
                minWidth: 64,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                padding: "10px 8px",
              }}
            >
              <span style={{ fontSize: 11, opacity: 0.85 }}>{dayShortLabel(d)}</span>
              <span style={{ fontSize: 16 }}>{dayNumberLabel(d)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3
          style={{ marginBottom: 14, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}
        >
          <Clock3 size={17} /> Available times — {formatDateLabel(selectedDate)}
        </h3>
        {loadingSlots ? (
          <Loader label="Checking availability..." />
        ) : slots.length === 0 ? (
          <EmptyState
            icon={<Clock3 size={20} />}
            title="No availability this day"
            description="This doctor may not see patients on this day, or every slot is booked. Try another date."
          />
        ) : (
          <div className="slot-grid">
            {slots.map((s) => (
              <button
                key={s.time}
                disabled={!s.available}
                className={`slot-btn${selectedTime === s.time ? " selected" : ""}`}
                onClick={() => setSelectedTime(s.time)}
              >
                {formatTimeLabel(s.time)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="form-group">
          <label htmlFor="reason">Reason for visit</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Annual check-up, persistent headache, follow-up visit..."
          />
        </div>
        <button
          className="btn btn-primary btn-block"
          disabled={submitting || !selectedTime}
          onClick={handleConfirm}
        >
          {submitting
            ? "Booking..."
            : selectedTime
            ? `Confirm for ${formatTimeLabel(selectedTime)}`
            : "Select a time slot"}
        </button>
      </div>
    </div>
  );
}
