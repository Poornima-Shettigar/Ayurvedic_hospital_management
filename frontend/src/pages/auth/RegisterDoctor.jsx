import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { departmentApi } from "../../api/departmentApi";

export default function RegisterDoctor() {
  const { registerDoctor } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    departmentId: "",
    specialization: "",
    qualification: "",
    experienceYears: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    departmentApi
      .getAll()
      .then(setDepartments)
      .catch(() => {});
  }, []);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        departmentId: form.departmentId ? Number(form.departmentId) : null,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : 0,
      };
      const user = await registerDoctor(payload);
      navigate(`/${user.role.toLowerCase()}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-tabs">
        <Link to="/register/patient">As a patient</Link>
        <Link to="/register/doctor" className="active">
          As a doctor
        </Link>
      </div>

      <div className="auth-card-head">
        <h1>Join as a doctor</h1>
        <p>An admin will review and approve your profile before patients can book you.</p>
      </div>

      {error && <div className="form-banner error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required />
          {fieldErrors.fullName && <span className="field-error">{fieldErrors.fullName}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="departmentId">Department</label>
            <select
              id="departmentId"
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              required
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {fieldErrors.departmentId && <span className="field-error">{fieldErrors.departmentId}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="specialization">Specialization</label>
            <input
              id="specialization"
              name="specialization"
              placeholder="e.g. Pediatric Cardiology"
              value={form.specialization}
              onChange={handleChange}
              required
            />
            {fieldErrors.specialization && (
              <span className="field-error">{fieldErrors.specialization}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="qualification">Qualification</label>
            <input
              id="qualification"
              name="qualification"
              placeholder="e.g. MBBS, MD"
              value={form.qualification}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="experienceYears">Years of experience</label>
            <input
              id="experienceYears"
              name="experienceYears"
              type="number"
              min="0"
              value={form.experienceYears}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
          <ArrowRight size={16} />
        </button>
      </form>

      <p className="auth-foot">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
