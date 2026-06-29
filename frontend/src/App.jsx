import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Loader from "./components/Loader";

const Login = lazy(() => import("./pages/auth/Login"));
const RegisterPatient = lazy(() => import("./pages/auth/RegisterPatient"));
const RegisterDoctor = lazy(() => import("./pages/auth/RegisterDoctor"));

const PatientDashboard = lazy(() => import("./pages/patient/PatientDashboard"));
const FindDoctors = lazy(() => import("./pages/patient/FindDoctors"));
const BookAppointment = lazy(() => import("./pages/patient/BookAppointment"));
const MyAppointments = lazy(() => import("./pages/patient/MyAppointments"));
const PatientProfile = lazy(() => import("./pages/patient/PatientProfile"));
const MyBills = lazy(() => import("./pages/patient/MyBills"));

const DoctorDashboard = lazy(() => import("./pages/doctor/DoctorDashboard"));
const DoctorAppointments = lazy(() => import("./pages/doctor/DoctorAppointments"));
const DoctorAvailability = lazy(() => import("./pages/doctor/DoctorAvailability"));

const StaffDashboard = lazy(() => import("./pages/staff/StaffDashboard"));
const StaffProfile = lazy(() => import("./pages/staff/StaffProfile"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageDoctors = lazy(() => import("./pages/admin/ManageDoctors"));
const ManageStaff = lazy(() => import("./pages/admin/ManageStaff"));
const ManageDepartments = lazy(() => import("./pages/admin/ManageDepartments"));
const AllAppointments = lazy(() => import("./pages/admin/AllAppointments"));
const ManagePatients = lazy(() => import("./pages/admin/ManagePatients"));
const LeaveApprovals = lazy(() => import("./pages/admin/LeaveApprovals"));

// Shared across roles
const MyLeave = lazy(() => import("./pages/shared/MyLeave"));
const Pharmacy = lazy(() => import("./pages/shared/Pharmacy"));
const Billing = lazy(() => import("./pages/shared/Billing"));

const NotFound = lazy(() => import("./pages/NotFound"));

function HomeRedirect() {
  const { user, token, loading } = useAuth();
  if (loading) return null;
  if (!token || !user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader label="Loading..." />}>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register/patient" element={<RegisterPatient />} />
            <Route path="/register/doctor" element={<RegisterDoctor />} />

            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={["PATIENT"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PatientDashboard />} />
              <Route path="find-doctors" element={<FindDoctors />} />
              <Route path="book/:doctorId" element={<BookAppointment />} />
              <Route path="appointments" element={<MyAppointments />} />
              <Route path="bills" element={<MyBills />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>

            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={["DOCTOR"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="availability" element={<DoctorAvailability />} />
              <Route path="leave" element={<MyLeave />} />
            </Route>

            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={["STAFF"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StaffDashboard />} />
              <Route path="pharmacy" element={<Pharmacy />} />
              <Route path="billing" element={<Billing />} />
              <Route path="leave" element={<MyLeave />} />
              <Route path="profile" element={<StaffProfile />} />
            </Route>

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="doctors" element={<ManageDoctors />} />
              <Route path="staff" element={<ManageStaff />} />
              <Route path="patients" element={<ManagePatients />} />
              <Route path="departments" element={<ManageDepartments />} />
              <Route path="appointments" element={<AllAppointments />} />
              <Route path="pharmacy" element={<Pharmacy />} />
              <Route path="billing" element={<Billing />} />
              <Route path="leave" element={<LeaveApprovals />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
