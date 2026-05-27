# Premium User CRUD REST API

A highly robust, production-grade RESTful API for managing **User** resources. Built using **Node.js**, **Express**, and **Mongoose**, this project implements advanced schema validation, structured centralized error handling, and clean architectural separation. It includes a complete integration test suite leveraging **Jest**, **Supertest**, and an **In-Memory MongoDB Server**.

---

## 🌟 Key Features

- **Full RESTful CRUD**: Create, Read (All/Individual), Update, and Delete endpoints for a "User" resource.
- **Strict Database Validation**: Strict schema types and custom rules using Mongoose validators (required fields, name bounds, regex-validated emails, integer and bounds-checked ages).
- **Centralized Error Boundary**: A global middleware translating internal database exceptions (like unique constraint duplicate keys, bad format IDs, and validation failures) into uniform, developer-friendly JSON error packets.
- **Self-Contained Automated Testing**: Complete test suite of 19 automated integration tests using Jest and `mongodb-memory-server` to mock DB connection automatically during tests.
- **Git Milestone-Driven Workflow**: Programmatic checkpoints committed and pushed sequentially for maximum traceability.

---

## 📂 Project Architecture

```
/
├── config/
│   └── db.js                 # MongoDB connection and event handling
├── controllers/
│   └── userController.js     # User route controller logic (async handlers)
├── middlewares/
│   └── errorHandler.js       # Centralized error mapping and formatting middleware
├── models/
│   └── User.js               # Mongoose schema, validation rules, and schema hooks
├── routes/
│   └── userRoutes.js         # API route configurations (endpoints to controllers)
├── tests/
│   └── user.test.js          # Jest + Supertest integration tests
├── .env                      # Application environment configurations
├── .gitignore                # Node modules and secrets ignoring
├── app.js                    # Core Express initialization (for separation of concerns)
├── package.json              # Project scripts and dependencies list
├── server.js                 # App server bootstrapper
└── README.md                 # Complete system guide
```

---

## 📋 User Resource Schema

The Mongoose model features the following fields and validations:

| Field | Type | Required | Unique | Validation Rules | Default |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `name` | String | Yes | No | Trimmed, `minlength: 2`, `maxlength: 50` | *None* |
| `email` | String | Yes | Yes | Trimmed, Lowercase, Regex checked: `/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/` | *None* |
| `age` | Number | No | No | `min: 0`, Must be an integer | *None* |
| `role` | String | Yes | No | Must be either `'user'` or `'admin'` | `'user'` |
| `createdAt` | Date | Auto | No | Generated on insertion | Current Date |
| `updatedAt` | Date | Auto | No | Generated on modification | Current Date |

---

## 🚀 API Endpoint Documentation

All endpoints return uniform response payloads. Success responses include `success: true` and the requested payload inside `data`. Error responses include `success: false` and error descriptions in `error`.

### 1. Create a New User
- **Route**: `POST /api/users`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "age": 28,
    "role": "user"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "age": 28,
      "role": "user",
      "createdAt": "2026-05-28T00:00:00.000Z",
      "updatedAt": "2026-05-28T00:00:00.000Z",
      "id": "648c2b7d5f70a1a01c3e031e"
    }
  }
  ```

### 2. Get All Users
- **Route**: `GET /api/users`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "age": 28,
        "role": "user",
        "createdAt": "2026-05-28T00:00:00.000Z",
        "updatedAt": "2026-05-28T00:00:00.000Z",
        "id": "648c2b7d5f70a1a01c3e031e"
      }
    ]
  }
  ```

### 3. Get User By ID
- **Route**: `GET /api/users/:id`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "age": 28,
      "role": "user",
      "createdAt": "2026-05-28T00:00:00.000Z",
      "updatedAt": "2026-05-28T00:00:00.000Z",
      "id": "648c2b7d5f70a1a01c3e031e"
    }
  }
  ```

### 4. Update User By ID
- **Route**: `PUT /api/users/:id`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "age": 29
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "name": "Jane Smith",
      "email": "jane.doe@example.com",
      "age": 29,
      "role": "user",
      "createdAt": "2026-05-28T00:00:00.000Z",
      "updatedAt": "2026-05-28T00:00:05.000Z",
      "id": "648c2b7d5f70a1a01c3e031e"
    }
  }
  ```

### 5. Delete User By ID
- **Route**: `DELETE /api/users/:id`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User deleted successfully",
    "data": {}
  }
  ```

---

## 🛡️ Error Scenarios & Validations Examples

### Missing or Invalid Schema Input (`400 Bad Request`)
If you send a POST request with an invalid email format and negative age, the central error handler maps it nicely:
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "email": "Please enter a valid email address",
    "age": "Age cannot be negative"
  }
}
```

### Duplicate User Emails (`409 Conflict`)
If you try to create or update a user with an email already taken by another account:
```json
{
  "success": false,
  "error": "Duplicate value entered for field(s): email. Please use a unique value."
}
```

### Invalid Mongoose ObjectId format (`400 Bad Request`)
If you query a user with an invalid ID parameter, e.g., `/api/users/not-a-valid-id`:
```json
{
  "success": false,
  "error": "Invalid resource ID format: not-a-valid-id"
}
```

### User ID Not Found (`404 Not Found`)
If the Mongoose ObjectId is syntactically valid but does not belong to any user inside the database:
```json
{
  "success": false,
  "error": "User not found with id of 648c2b7d5f70a1a01c3e031f"
}
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (Local instance or MongoDB Atlas Connection string)

### 2. Clone and Setup Dependencies
Navigate to the root project folder and install the required modules:
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (based on the default setup) containing:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/user_crud_db
NODE_ENV=development
```

### 4. Running the Application
- **For Development Mode** (Automatically restarts server on changes via `nodemon`):
  ```bash
  npm run dev
  ```
- **For Production Mode**:
  ```bash
  npm start
  ```

---

## 🧪 Testing the API

The project comes pre-configured with a powerful Jest integration test suite. It initiates a mock database server on the fly so **no running MongoDB instance is needed to run the test suite!**

Run the automated integration tests:
```bash
npm test
```

### Mock Test Result Log:
```bash
PASS tests/user.test.js
  User CRUD API Integration Tests
    POST /api/users - Create User
      √ should create a new user and return 201 (94 ms)
      √ should fail with 400 if name is missing (15 ms)
      ...
      √ should fail with 409 if email is duplicate (25 ms)
    GET /api/users - Get All Users
      √ should get all users in database (34 ms)
      ...
    GET /api/users/:id - Get User By ID
      √ should return the user if found (17 ms)
      ...
    PUT /api/users/:id - Update User
      √ should update a user and return 200 (20 ms)
      ...
    DELETE /api/users/:id - Delete User
      √ should delete user and return 200 (25 ms)

Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
```

---

## 📅 Git Task History

This project was built iteratively following clean software engineering guidelines. Each core component was isolated, implemented, and verified, followed by an immediate GitHub commit:

1. **Commit 1**: `chore: setup project files and dependencies` (Added `.gitignore`, `package.json`, and `.env`).
2. **Commit 2**: `feat: configure Mongoose database connection` (Added `config/db.js`).
3. **Commit 3**: `feat: create User model with validations` (Added `models/User.js`).
4. **Commit 4**: `feat: implement centralized error handling middleware` (Added `middlewares/errorHandler.js`).
5. **Commit 5**: `feat: implement user CRUD controllers` (Added `controllers/userController.js`).
6. **Commit 6**: `feat: setup Express application, routes, and server configuration` (Added `routes/userRoutes.js`, `app.js`, and `server.js`).
7. **Commit 7**: `test: add comprehensive integration test suite using Jest and Supertest` (Added `tests/user.test.js`).
8. **Commit 8**: `docs: write comprehensive production-grade README documentation` (This `README.md`).
