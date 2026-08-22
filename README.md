# Dayflow HRMS

A full-stack HR management system for small teams — attendance, leave, payroll, and
employee profiles behind role-based access, with an admin-approval onboarding flow.
Built with React + Vite on the front end and Express + Sequelize (MySQL) on the back end.

## Features

- **Authentication & roles** — JWT-based login/signup with two roles, employee and admin.
- **Onboarding & verification** — new signups complete an onboarding form and stay in a
  pending state until an admin approves them. Employees self-fill their job title and
  contact details; the admin sets salary at approval. Admin signups must be approved by an
  existing admin (seeded admins are pre-approved).
- **Attendance** — employees check in and out; the dashboard shows today's status, check-in,
  and check-out. Admins get a read-only view across the whole team (daily and weekly).
- **Leave** — employees apply for paid/sick/unpaid leave (past dates are blocked); admins
  review, approve, or reject with a comment.
- **Payroll** — admins manage base salary, allowances, and deductions per month with a live
  net-salary preview; employees view their own payslips. Amounts use Indian currency
  formatting (e.g. ₹63,000.00).
- **Profiles** — each employee has a profile with personal, job, and salary details; admins
  can view and edit any profile.
- **Reports** — admins get a weekly attendance summary and per-employee salary slips.

## Tech stack

- **Frontend:** React 18, Vite, React Router, Axios, react-hot-toast
- **Backend:** Node.js, Express, Sequelize ORM, JWT, bcrypt
- **Database:** MySQL

## Prerequisites

- Node.js 18+ and npm
- A running MySQL server

## Setup

1. **Create the database.** In a MySQL shell:
   ```sql
   CREATE DATABASE dayflow;
   ```

2. **Configure environment.** Copy `.env.example` to `server/.env` and fill in your MySQL
   password and a JWT secret:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=dayflow
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   JWT_SECRET=replace_with_a_long_random_secret
   CLIENT_URL=http://localhost:5173
   ```
   The client defaults to `http://localhost:5000/api`. To override it, copy
   `client/.env.example` to `client/.env` and set `VITE_API_URL`.

3. **Install dependencies** (from the repo root):
   ```
   npm run install:all
   ```

4. **Seed demo data** — creates the tables and demo users:
   ```
   npm run seed --prefix server
   ```

## Running

Start the API and the frontend in two separate terminals:

```
npm run dev --prefix server    # API on http://localhost:5000
npm run dev --prefix client    # app on http://localhost:5173
```

Then open http://localhost:5173. Start the server first so the client's initial requests
succeed.

## Demo accounts

All seeded users share the password `Test1234`.

| Email | Role | State |
|-------|------|-------|
| admin@dayflow.test | admin | approved (pre-verified) |
| aarav@dayflow.test | employee | approved |
| diya@dayflow.test | employee | approved |
| kabir@dayflow.test | employee | approved |
| meera@dayflow.test | employee | **pending approval** |
| rohan@dayflow.test | admin | **pending approval** |

Log in as `admin@dayflow.test` and open **Admin → Approvals** to approve or reject the two
pending accounts and see the onboarding/verification flow end to end.

Email verification is mocked for the demo: signup generates a verification token, logs it to
the server console, and returns it in the API response. Admin approval doubles as
verification.

## Project structure

```
client/                 React + Vite frontend
  src/
    modules/            feature UIs: auth, onboarding, profile, attendance, leave, payroll
    components/          shared layout, navbar, route guards (ProtectedRoute, AccessGate)
    api/                 shared axios instance with auth + error handling
server/                 Express + Sequelize API
  models/               User, Attendance, LeaveRequest, Payroll
  modules/              route + controller per feature (auth, onboarding, profile,
                        attendance, leave, payroll)
  seed.js               demo data
```

