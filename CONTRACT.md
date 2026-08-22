# Dayflow Shared Contract

## 1. Global response envelope

Every endpoint MUST return exactly one of these top-level shapes:

```json
{ "success": true, "data": { } }
```

```json
{ "success": false, "error": "human-readable message" }
```

Do not invent alternate wrappers such as `message`, `result`, or `errors` at the top level.

## 2. Database schema

### User

| Field | Sequelize type | Rules |
|---|---|---|
| id | INTEGER | PK, auto-increment |
| employeeId | STRING(50) | required, unique |
| name | STRING(120) | required |
| email | STRING(150) | required, unique, valid email |
| passwordHash | STRING(255) | required; never expose to frontend |
| role | ENUM(employee, admin) | required |
| phone | STRING(30) | nullable |
| address | STRING(255) | nullable |
| jobTitle | STRING(120) | nullable |
| profilePicUrl | STRING(500) | nullable |
| salaryBase | DECIMAL(12,2) | nullable |
| isEmailVerified | BOOLEAN | default false |
| createdAt | DATETIME | Sequelize-managed |
| updatedAt | DATETIME | Sequelize-managed |

### Attendance

| Field | Sequelize type | Rules |
|---|---|---|
| id | INTEGER | PK, auto-increment |
| userId | INTEGER | required, FK -> User.id |
| date | DATEONLY | required; unique per user |
| checkInTime | DATETIME | nullable |
| checkOutTime | DATETIME | nullable |
| status | ENUM(present, absent, half-day, leave) | required |
| createdAt | DATETIME | Sequelize-managed |
| updatedAt | DATETIME | Sequelize-managed |

### LeaveRequest

| Field | Sequelize type | Rules |
|---|---|---|
| id | INTEGER | PK, auto-increment |
| userId | INTEGER | required, FK -> User.id |
| leaveType | ENUM(paid, sick, unpaid) | required |
| startDate | DATEONLY | required |
| endDate | DATEONLY | required |
| remarks | TEXT | nullable |
| status | ENUM(pending, approved, rejected) | default pending |
| adminComment | TEXT | nullable |
| createdAt | DATETIME | Sequelize-managed |
| updatedAt | DATETIME | Sequelize-managed |

### Payroll

| Field | Sequelize type | Rules |
|---|---|---|
| id | INTEGER | PK, auto-increment |
| userId | INTEGER | required, FK -> User.id |
| baseSalary | DECIMAL(12,2) | required |
| allowances | DECIMAL(12,2) | required, default 0 |
| deductions | DECIMAL(12,2) | required, default 0 |
| netSalary | DECIMAL(12,2) | required |
| month | INTEGER | required |
| year | INTEGER | required |
| createdAt | DATETIME | Sequelize-managed |
| updatedAt | DATETIME | Sequelize-managed |

Relationships: User 1:N Attendance, User 1:N LeaveRequest, User 1:N Payroll. All child `userId` fields reference `User.id`.

## 3. Auth

### POST /api/auth/signup

Request body:

```json
{ "employeeId": "EMP005", "name": "Jane Doe", "email": "jane@example.com", "password": "Password1", "role": "employee" }
```

Validation errors use `success:false`, including missing fields, invalid email, duplicate email/employeeId, and weak passwords. Passwords must be at least 8 characters and contain a letter and a number.

Success:

```json
{ "success": true, "data": { "user": { "id": 5, "employeeId": "EMP005", "name": "Jane Doe", "email": "jane@example.com", "role": "employee" }, "verificationToken": "demo-token" } }
```

Email verification is **mocked for demo**. No external email provider exists. The generated token is logged server-side and returned in the signup response so the hackathon flow can be demonstrated.

### POST /api/auth/login

Request body:

```json
{ "email": "jane@example.com", "password": "Password1" }
```

Success:

```json
{ "success": true, "data": { "token": "jwt...", "user": { "id": 5, "employeeId": "EMP005", "name": "Jane Doe", "email": "jane@example.com", "role": "employee" } } }
```

`passwordHash` MUST NOT be returned.

Wrong credentials: HTTP 401 with `{ "success": false, "error": "Invalid email or password" }`.

## 4. Auth middleware contract

`server/middleware/auth.js` exports exactly:

- `verifyToken(req, res, next)`: reads `Authorization: Bearer <JWT>`, validates JWT, and attaches the decoded user to `req.user`.
- `requireRole('admin')`: middleware factory that returns HTTP 403 and the standard error envelope when the current user role does not match.

Other modules MUST import these names rather than renaming them.

## 5. Placeholder module contracts

### Profile

- `GET /api/profile/me` — authenticated employee/admin; returns current user's profile.
- `PUT /api/profile/me` — authenticated employee; request may change only `address`, `phone`, `profilePicUrl`.
- `GET /api/profile/:userId` — admin only.
- `PUT /api/profile/:userId` — admin only; all editable User profile fields defined by the User schema.

### Attendance

- `POST /api/attendance/checkin` — authenticated user; creates/toggles today's attendance record.
- `POST /api/attendance/checkout` — authenticated user; records checkout for today's attendance.
- `GET /api/attendance/me?range=daily|weekly` — authenticated user.
- `GET /api/attendance/all?range=daily|weekly` — admin only.

### Leave

- `POST /api/leave/apply` — authenticated employee.
- `GET /api/leave/me` — authenticated user.
- `GET /api/leave/all` — admin only.
- `PUT /api/leave/:id/decision` — admin only; request body should contain `{ "status": "approved|rejected", "adminComment": "..." }`.

### Payroll

- `GET /api/payroll/me` — authenticated user; read-only.
- `GET /api/payroll/all` — admin only.
- `PUT /api/payroll/:userId` — admin only.

## 6. Frontend shared contract

Use the single Axios instance at `client/src/api/axios.js`. It reads `VITE_API_URL`, injects the JWT from `localStorage` as a Bearer token, and automatically displays `response.data.error` via `react-hot-toast` for `success:false` responses and network failures.

Protected pages MUST use `ProtectedRoute`. Admin-only pages pass `role="admin"`.

JWT key: `dayflow_token`.
User key: `dayflow_user`.

## 7. Git workflow

Foundation checkpoints:

```bash
git add . && git commit -m "feat: sequelize models + db config"
git add . && git commit -m "feat: auth signup/login + JWT middleware"
git add . && git commit -m "feat: axios instance + protected routes + toast interceptor"
git add . && git commit -m "docs: CONTRACT.md"
```

Teammate branches are:

- `feature/profile-dashboard`
- `feature/attendance`
- `feature/leave-payroll`

Keep auth on `main`.
