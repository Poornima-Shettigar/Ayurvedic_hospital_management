# Wellspring — Hospital Management System

A full-stack hospital management system built with **React** and **Spring
Boot**. It covers appointment scheduling end-to-end, plus four supporting
modules: **staff management**, **pharmacy**, **billing**, and **leave
management**.

> Built as a main/capstone project. The code is intentionally organized and
> commented so you can explain every layer in a viva or interview.

---

## ✨ Features

**Patients**
- Register, log in, and manage a profile
- Browse doctors by department, see specialization/experience/bio
- Pick a date and see *only the real available time slots* for that doctor
  (working hours minus already‑booked slots, minus past times)
- Book an appointment with a reason for visit → status starts as `PENDING`
- View all appointments with status, cancel pending/confirmed ones
- View invoices and payment status for past visits (**My Bills**)

**Doctors**
- Register with department + specialization (admin must approve before
  patients can find them)
- Confirm, decline, complete, or cancel appointment requests
- Add consultation notes when marking a visit `COMPLETED`
- Configure their own working hours, days, slot length, and consultation fee
  — the booking calendar instantly reflects this
- Request and track leave (sick/casual/annual/unpaid)

**Staff** *(new role — nurses, receptionists, lab techs, pharmacists, etc.)*
- Onboarded by an admin (not self-registered) with an employee code,
  designation, and optional department
- View their own profile
- Dispense medicine and manage pharmacy stock
- Create invoices and record patient payments
- Request and track leave, same as doctors

**Admins**
- Dashboard with live counts across every module (patients, doctors,
  departments, appointments, staff, low-stock medicines, unpaid invoices,
  pending leave requests)
- Approve/review doctor sign-ups
- Create/update/delete departments
- Onboard and remove staff
- Browse every patient and every appointment in the system
- Manage the medicine catalog (add/edit/remove, set reorder thresholds)
- Approve or reject leave requests from doctors and staff

**Pharmacy**
- Medicine catalog with stock quantity, reorder level, and expiry date
- Restocking (admin + staff) and dispensing (admin + staff), with stock
  automatically deducted and a dispense record kept per transaction
- Dispensing can be linked to a patient or left as a walk-in sale
- Low-stock medicines surface directly on the admin dashboard

**Billing**
- Invoices with itemized line items (consultation / medicine / lab test /
  other), optionally linked to a specific appointment
- Payments recorded against an invoice (cash/card/insurance/online); status
  automatically moves `UNPAID → PARTIALLY_PAID → PAID`
- Patients see their own invoice history with full line-item detail;
  there's no generic "invoice by id" endpoint for patients, specifically to
  prevent one patient from probing another's invoice by guessing an id

**Leave management**
- Doctors and staff submit leave requests (sick/casual/annual/unpaid/other)
  with a date range and reason
- Admin approves or rejects with optional notes
- Requesters can cancel their own request while it's still `PENDING`

**Core scheduling logic (the heart of the project)**
- Slots are generated from a doctor's `workStartTime` → `workEndTime` in
  steps of `slotDurationMinutes`
- A slot is hidden once booked (`PENDING` or `CONFIRMED`), and past times on
  the current day are automatically excluded
- Double-booking is prevented at three layers: the slot-availability check,
  a service-level re-check inside a `@Transactional` method, and a database
  `UNIQUE(doctor_id, appointment_date, appointment_time)` constraint as a
  last line of defense
- Role-aware status transitions: patients can only cancel their own
  appointment; doctors can confirm/decline/complete/cancel theirs; admins can
  override any of it

---

## 🧱 Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19 (Vite), React Router, Axios, lucide-react icons |
| Backend  | Spring Boot 3.2 (Java 21), Spring Security 6 + JWT, Spring Data JPA |
| Database | MySQL 8 |
| Auth     | Stateless JWT (HS256), BCrypt password hashing |

---

## 📁 Project structure

```
hospital-management-system/
├── backend/                         Spring Boot REST API
│   └── src/main/java/com/hms/backend/
│       ├── entity/                  User, Patient, Doctor, Department, Appointment,
│       │                            Staff, Medicine, MedicineDispense, Invoice,
│       │                            InvoiceItem, LeaveRequest
│       ├── enums/                   Role, AppointmentStatus, LeaveType, LeaveStatus,
│       │                            InvoiceStatus, PaymentMethod, InvoiceItemType
│       ├── repository/               Spring Data JPA repositories
│       ├── dto/                     Request/response DTOs, one subfolder per feature
│       ├── service/                 Business logic — AppointmentService is the
│       │                            core scheduling engine; StaffService,
│       │                            PharmacyService, BillingService, LeaveService
│       │                            cover the newer modules
│       ├── controller/               REST endpoints
│       ├── security/                 JWT filter, JwtUtil, UserPrincipal
│       ├── config/                   SecurityConfig, DataSeeder
│       └── exception/                Centralized error handling
│
└── frontend/                        React + Vite SPA
    └── src/
        ├── api/                      Axios wrappers, one file per resource
        ├── context/AuthContext.jsx   Session/JWT state
        ├── components/                Shared UI (badges, loaders, route guard)
        ├── layouts/                   AuthLayout (login/register), DashboardLayout (sidebar)
        └── pages/
            ├── auth/                  Login, RegisterPatient, RegisterDoctor
            ├── patient/                Dashboard, FindDoctors, BookAppointment,
            │                           MyAppointments, Profile, MyBills
            ├── doctor/                 Dashboard, Appointments, Availability
            ├── staff/                  Dashboard, Profile
            ├── admin/                  Dashboard, ManageDoctors, ManageStaff,
            │                           ManageDepartments, AllAppointments,
            │                           ManagePatients, LeaveApprovals
            └── shared/                 MyLeave, Pharmacy, Billing — reused across
                                        roles since the underlying data/permissions
                                        only differ by who's logged in
```

---

## 🚀 Getting started

### Prerequisites
- Java 21 (JDK)
- Maven (or just use your IDE's built-in Maven support)
- MySQL 8 running locally
- Node.js 18+ and npm

### 1. Database

```sql
CREATE DATABASE hms_db;
```

That's it — Hibernate will create all the tables automatically on first run
(`spring.jpa.hibernate.ddl-auto=update`).

### 2. Backend

```bash
cd backend
# Edit src/main/resources/application.properties if your MySQL
# username/password aren't both "root"

mvn spring-boot:run
```

The API starts on **http://localhost:8080**. On first boot it automatically
seeds:
- An admin account → `admin@hms.com` / `Admin@123`
- 10 starter departments (Cardiology, Neurology, Pediatrics, etc.)

There's no seed data for staff/medicines/invoices/leave — log in as the
admin and create those from the UI (**Staff**, **Pharmacy**, **Billing**
pages) so you can walk through the onboarding flow yourself.

> No Maven installed? Just open the `backend` folder in IntelliJ IDEA / any
> IDE with Spring Boot support and run `BackendApplication.java` directly.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Register as a patient (instant access) or
as a doctor (needs admin approval — log in as the seeded admin to approve
them under **Doctors → Pending approval**). Staff accounts can only be
created by an admin, from **Staff → Add a staff member**.

---

## 🔌 Key API endpoints

| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `/api/auth/register/patient` | Public | Create a patient account |
| POST | `/api/auth/register/doctor` | Public | Create a doctor account (unapproved) |
| POST | `/api/auth/login` | Public | Get a JWT |
| GET | `/api/departments` | Public | List departments (needed by the doctor registration form, before login) |
| GET | `/api/doctors?departmentId=` | Any | List approved doctors |
| GET | `/api/doctors/{id}/slots?date=` | Any | **Available time slots for a date** |
| POST | `/api/appointments` | Patient | Book a slot |
| GET | `/api/appointments/my` | Patient | My appointments |
| GET | `/api/appointments/doctor` | Doctor | My incoming appointments |
| PUT | `/api/appointments/{id}/status` | Patient/Doctor/Admin | Confirm/decline/complete/cancel |
| PUT | `/api/doctors/me/availability` | Doctor | Update working hours/days/slot length |
| GET | `/api/admin/dashboard` | Admin | Live stats across every module |
| PUT | `/api/admin/doctors/{id}/approve` | Admin | Approve a doctor |
| GET/POST/PUT/DELETE | `/api/admin/staff` | Admin | Onboard/manage staff |
| GET | `/api/staff/me` | Staff | My own profile |
| GET/POST/PUT/DELETE | `/api/pharmacy/medicines` | Admin (write), Admin+Staff (read) | Medicine catalog |
| PUT | `/api/pharmacy/medicines/{id}/restock` | Admin/Staff | Add stock |
| POST | `/api/pharmacy/dispense` | Admin/Staff | Dispense medicine, deducts stock |
| GET/POST | `/api/billing/invoices` | Admin/Staff | List/create invoices |
| GET | `/api/billing/invoices/my` | Patient | My own invoices |
| PUT | `/api/billing/invoices/{id}/payment` | Admin/Staff | Record a payment |
| GET/POST | `/api/leave` | Admin (read all) / Doctor+Staff (create) | Leave requests |
| GET | `/api/leave/my` | Doctor/Staff | My own leave history |
| PUT | `/api/leave/{id}/status` | Admin | Approve/reject |
| GET/POST/PUT/DELETE | `/api/departments` | Public (GET) / Admin (write) | Departments |

All protected endpoints expect `Authorization: Bearer <token>`.

---

## 🛡️ Security notes

- Passwords are hashed with BCrypt — never stored in plain text.
- JWTs are signed with HS256 and expire after 24h (`app.jwt.expiration-ms`
  in `application.properties`).
- `@PreAuthorize` on every controller enforces role checks server-side —
  the frontend's route guards are a UX convenience, not the security
  boundary.
- Patients can only ever see their *own* invoices (`/invoices/my`) — there's
  deliberately no generic `/invoices/{id}` route exposed to the `PATIENT`
  role, which avoids an id-guessing (IDOR) risk.
- **Before deploying anywhere real**, change `app.jwt.secret` and the
  seeded admin password in `application.properties`.

---

## 🐛 Bugs found and fixed during development

Worth knowing about if you're presenting this project, since they're the
kind of thing that comes up in a viva:

1. **Doctor registration redirecting to login.** The registration page
   fetches the department list before the user has a JWT. That endpoint
   required authentication, so the request 401'd, and the frontend's global
   401-handler treated it like an expired session and force-redirected to
   `/login`. Fixed on both ends: `GET /api/departments` is now public, and
   the frontend interceptor only force-redirects on 401 if a token actually
   existed (i.e. a real session expiry, not an anonymous request).
2. **Every page loading every other page's code.** `App.jsx` originally
   imported all ~20 page components eagerly, so Vite's dev server pulled in
   the entire app's JS just to render `/login`. Fixed with `React.lazy()` +
   `<Suspense>` per route — each page is now its own chunk.
3. **Latent `LazyInitializationException` risk.** `spring.jpa.open-in-view`
   was set to `false`, but none of the service-layer read methods were
   wrapped in `@Transactional`. Combined with response DTOs that walk lazy
   associations (`appointment.getDoctor().getUser()`, etc.), this would have
   thrown on most list endpoints the first time the app actually ran against
   a real database. Fixed by setting `open-in-view=true` (Spring Boot's
   actual default) — the newer services also use `@Transactional(readOnly =
   true)` as defense-in-depth.

---

## 🧩 Possible extensions

- Email/SMS reminders before an appointment
- Pagination on the admin appointment/patient/staff lists
- Doctor calendar (week view) instead of a single-day slot grid
- File uploads for prescriptions/lab reports per appointment
- Linking pharmacy dispense records directly into an invoice's line items,
  instead of entering them manually
- Leave balance/accrual tracking (currently just request → approve/reject,
  no running balance)
