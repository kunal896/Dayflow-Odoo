# PR notes — feature/profile-dashboard

## Final route list

### Backend (`server/modules/profile/`)
- `GET /api/profile/me` — verifyToken. Matches CONTRACT.md.
- `PUT /api/profile/me` — verifyToken. Accepts only `address`, `phone`, `profilePicUrl`; any other field in the body is silently ignored. Matches CONTRACT.md.
- `GET /api/profile/:userId` — verifyToken + requireRole('admin'). Matches CONTRACT.md.
- `PUT /api/profile/:userId` — verifyToken + requireRole('admin'). Accepts any editable User field (employeeId, name, email, role, phone, address, jobTitle, profilePicUrl, salaryBase, isEmailVerified). Matches CONTRACT.md.
- `GET /api/profile/all` — verifyToken + requireRole('admin'). **NOT in CONTRACT.md — added.** Returns `{ users: [...] }`, each with `passwordHash` excluded. Needed for the admin employee list. Please add this to CONTRACT.md section 5 (Profile).

No other deviations from CONTRACT.md.

## Frontend routes
- `/` — role-based redirect: employees see `EmployeeDashboard`, admins are redirected to `/admin`.
- `/profile` — own profile (view).
- `/profile/edit` — own profile (edit; address/phone/profilePicUrl only).
- `/profile/:userId` — admin-only, view another employee's profile.
- `/profile/:userId/edit` — admin-only, edit another employee's profile (all editable fields).
- `/admin` — Admin Dashboard: overview (employee list, today's attendance count, pending leave count, recent leave requests) + Reports tab (stretch goal, see below).

## Reports tab (stretch goal — included)
Added under Admin Dashboard → Reports tab. No new backend routes were added for this; it consumes:
- `GET /api/attendance/all?range=weekly` for a per-employee present/absent/half-day/leave count table.
- `GET /api/payroll/all` for a selectable-by-employee-and-month read-only payslip card.

Both calls are wrapped defensively — if Attendance/Payroll aren't merged yet, the tab shows an "isn't available yet" empty state instead of crashing. **Assumption:** CONTRACT.md doesn't specify query/filter params for `GET /api/payroll/all`, so this fetches the full list and filters client-side by `userId`/`month`/`year`. Worth confirming with whoever owns Payroll whether server-side filtering is preferred once real data volume matters.

## Graceful degradation
`EmployeeDashboard`'s "recent activity" panel and `AdminDashboard`'s attendance/leave widgets all call the other modules' documented endpoints (`/attendance/me`, `/leave/me`, `/attendance/all`, `/leave/all`) but degrade to an empty-state message rather than erroring if those routes 404 or fail, since they may not be merged yet.

## Not implemented
- Real file upload for documents/profile pictures — out of scope per the original prompt; documents section is a static placeholder list, and profile pictures are set via URL string only.

## Git history on this branch
1. `feat: profile view/edit endpoints`
2. `feat: profile view/edit UI`
3. `feat: employee + admin dashboard, reports tab`
4. `docs: PR notes for profile-dashboard`
