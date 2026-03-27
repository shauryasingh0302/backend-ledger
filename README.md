# Bank Transaction System (Ledger API)

A Node.js + Express + MongoDB backend for user authentication, account management, and ledger-based money transfers with idempotency protection.

## Live Deployment

Base URL (Render):

https://backend-ledger-gwzx.onrender.com

## Features

- User registration, login, and logout
- JWT-based authentication (cookie or Bearer token)
- Account creation and account balance lookup
- Ledger-style debit/credit entries
- Transaction idempotency using idempotencyKey
- System-user protected route for initial funding
- Email notifications for registration and successful transactions

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- cookie-parser
- Nodemailer (Gmail OAuth2)

## Project Structure

```text
.
|-- server.js
|-- src
|   |-- app.js
|   |-- config
|   |   `-- db.js
|   |-- controllers
|   |   |-- account.controller.js
|   |   |-- auth.controller.js
|   |   `-- transaction.controller.js
|   |-- middlewares
|   |   `-- auth.middleware.js
|   |-- models
|   |   |-- account.model.js
|   |   |-- blacklist.model.js
|   |   |-- ledger.model.js
|   |   |-- transaction.model.js
|   |   `-- user.model.js
|   |-- routes
|   |   |-- account.routes.js
|   |   |-- auth.routes.js
|   |   `-- transaction.routes.js
|   `-- services
|       `-- email.service.js
`-- package.json
```

## Setup (Local)

1. Clone and install dependencies:

```bash
npm install
```

2. Create a .env file in project root and add the variables below.

3. Start server:

```bash
npm run dev
```

Production start:

```bash
npm start
```

Default local port in current code: 3000

## Environment Variables

Create a .env file with:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

EMAIL_USER=your_gmail_address
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=your_google_oauth_refresh_token
```

## Authentication

Protected routes accept token from either:

- Cookie: token
- Authorization header: Bearer <JWT_TOKEN>

Most routes require a logged-in user. One route requires a system user role.

## API Routes

All paths below are relative to:

- Local: http://localhost:3000
- Render: https://backend-ledger-gwzx.onrender.com

### Health / Root

#### GET /

Returns API status text.

Sample response:

```json
"Ledger API is running!!"
```

### Auth Routes

Base path: /api/auth

#### POST /api/auth/register

Register a new user.

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

Success response (201):

```json
{
  "user": {
    "_id": "USER_ID",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "token": "JWT_TOKEN"
}
```

#### POST /api/auth/login

Login user.

Request body:

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

Success response (200):

```json
{
  "user": {
    "_id": "USER_ID",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "token": "JWT_TOKEN"
}
```

#### POST /api/auth/logout

Logout user and blacklist token.

Headers (if not using cookie):

```http
Authorization: Bearer JWT_TOKEN
```

Success response (200):

```json
{
  "message": "User logged out successfully"
}
```

### Account Routes

Base path: /api/accounts

All account routes require authentication.

#### POST /api/accounts

Create a new account for logged-in user.

Headers:

```http
Authorization: Bearer JWT_TOKEN
```

Success response (201):

```json
{
  "account": {
    "_id": "ACCOUNT_ID",
    "user": "USER_ID",
    "status": "ACTIVE",
    "currency": "INR",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### GET /api/accounts

Get all accounts of logged-in user.

Headers:

```http
Authorization: Bearer JWT_TOKEN
```

Success response (200):

```json
{
  "accounts": [
    {
      "_id": "ACCOUNT_ID",
      "user": "USER_ID",
      "status": "ACTIVE",
      "currency": "INR",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### GET /api/accounts/balance/:accountId

Get current balance for one account.

Headers:

```http
Authorization: Bearer JWT_TOKEN
```

Success response (200):

```json
{
  "accountId": "ACCOUNT_ID",
  "balance": 1500
}
```

### Transaction Routes

Base path: /api/transactions

#### POST /api/transactions

Create transfer transaction between two accounts.

Headers:

```http
Authorization: Bearer JWT_TOKEN
```

Request body:

```json
{
  "fromAccount": "FROM_ACCOUNT_ID",
  "toAccount": "TO_ACCOUNT_ID",
  "amount": 500,
  "idempotencyKey": "txn-unique-key-001"
}
```

Success response (201):

```json
{
  "message": "Transaction completed successfully",
  "transaction": {
    "_id": "TRANSACTION_ID",
    "fromAccount": "FROM_ACCOUNT_ID",
    "toAccount": "TO_ACCOUNT_ID",
    "amount": 500,
    "idempotencyKey": "txn-unique-key-001",
    "status": "PENDING",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Notes:

- Reusing the same idempotencyKey can return "already processed" or pending/failed states depending on transaction status.
- Sender account must have enough balance.
- Both accounts must be ACTIVE.

#### POST /api/transactions/system/initial-funds

Create initial funds transaction from system user account to target account.

This route uses system-user middleware and requires a token for a system user.

Headers:

```http
Authorization: Bearer JWT_TOKEN
```

Request body:

```json
{
  "toAccount": "TARGET_ACCOUNT_ID",
  "amount": 1000,
  "idempotencyKey": "init-funds-001"
}
```

Success response (201):

```json
{
  "message": "Initial funds transaction completed successfully",
  "transaction": {
    "_id": "TRANSACTION_ID",
    "fromAccount": "SYSTEM_ACCOUNT_ID",
    "toAccount": "TARGET_ACCOUNT_ID",
    "amount": 1000,
    "idempotencyKey": "init-funds-001",
    "status": "COMPLETED",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

## Quick cURL Examples

Register:

```bash
curl -X POST https://backend-ledger-gwzx.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secret123"}'
```

Login:

```bash
curl -X POST https://backend-ledger-gwzx.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'
```

Create account:

```bash
curl -X POST https://backend-ledger-gwzx.onrender.com/api/accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Create transaction:

```bash
curl -X POST https://backend-ledger-gwzx.onrender.com/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"fromAccount":"FROM_ACCOUNT_ID","toAccount":"TO_ACCOUNT_ID","amount":500,"idempotencyKey":"txn-001"}'
```

## Known Notes

- Token blacklist entries expire in 3 days.
- Amount values are numeric.
- This project currently has no automated tests configured.

## Author

Shaurya Singh
