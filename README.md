# Dayflow HRMS

Hackathon monorepo foundation for a React/Vite + Express + Sequelize(MySQL) HRMS.

## Setup

1. Create a MySQL database named `dayflow`.
2. Copy `.env.example` to `server/.env` and fill in your MySQL password and JWT secret.
3. Copy `client/.env.example` to `client/.env` if you need a custom API URL.
4. Run `npm run install:all` from the repo root.
5. Run `npm run seed --prefix server` to create demo data.
6. Start API with `npm run dev --prefix server` and frontend with `npm run dev --prefix client`.

## Demo credentials

All seeded users use password `Test1234`.

- admin@dayflow.test
- aarav@dayflow.test
- diya@dayflow.test
- kabir@dayflow.test

The email verification flow is deliberately mocked for the hackathon: signup generates a verification token, logs it to the server console, and returns it in the API response.

Read `CONTRACT.md` before implementing any module so field names and routes stay shared across branches.
