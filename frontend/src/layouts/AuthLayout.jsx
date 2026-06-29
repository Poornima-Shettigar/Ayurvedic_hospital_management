import { Stethoscope } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand-mark">
          <span className="auth-brand-pulse">
            <Stethoscope size={18} />
          </span>
          Wellspring
        </div>

        <div className="auth-brand-copy">
          <h2>Care, coordinated. Appointments, simplified.</h2>
          <p>
            Wellspring brings patients, doctors, and front-desk staff onto one
            calendar — so the right person sees the right doctor at the right
            time, every time.
          </p>
        </div>

        <div className="auth-brand-stats">
          <div>
            <strong>10</strong>
            <span>Departments</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>Online booking</span>
          </div>
          <div>
            <strong>0</strong>
            <span>Double bookings</span>
          </div>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}
