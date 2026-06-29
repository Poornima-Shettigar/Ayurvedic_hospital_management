import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        textAlign: "center",
        padding: 24,
      }}
    >
      <span className="empty-state icon-wrap" style={{ display: "inline-flex" }}>
        <Compass size={26} />
      </span>
      <h1 style={{ fontSize: 24 }}>This page took a wrong turn</h1>
      <p className="muted">We couldn't find what you were looking for.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>
        Back to safety
      </Link>
    </div>
  );
}
