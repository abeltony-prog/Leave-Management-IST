# API Documentation - Leave Management System

**Base URL:** `http://localhost:8080` (Assumed)

---

## Authentication Endpoints

Base Path: `/api/v1/auth`

These endpoints handle user registration and login.

### 1. Register User

- **Description:** Creates a new user account. The first user registered automatically gets the `ADMIN` role.
- **Endpoint:** `POST /api/v1/auth/register`
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "password": "SecureP@ssw0rd!",
    "msProfilePictureUrl": "https://graph.microsoft.com/...",
    "department": "Engineering",
    "team": "Platform",
    "role": "STAFF"
  }
  ```
  _(Note: `role` defaults to `STAFF` if omitted and not the first user. `msProfilePictureUrl`, `department`, `team` are optional)._
- **Success Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYW5lLnNtaXRoQGV4YW1wbGUuY29tIiwiaWF0IjoxNj..."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Validation errors (e.g., missing fields, invalid email).
  - `409 Conflict`: User with this email already exists.

### 2. Authenticate User

- **Description:** Authenticates a user with email and password, returning a JWT token.
- **Endpoint:** `POST /api/v1/auth/authenticate`
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "jane.smith@example.com",
    "password": "SecureP@ssw0rd!"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYW5lLnNtaXRoQGV4YW1wbGUuY29tIiwiaWF0IjoxNj..."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Missing fields.
  - `401 Unauthorized`: Invalid credentials.
  - `404 Not Found`: User not found.

---

## Leave Request Endpoints (User)

Base Path: `/api/v1/leave`

These endpoints manage leave requests and require authentication via a JWT token passed in the `Authorization` header.

**Required Header for all endpoints in this section:**

- `Authorization: Bearer <YOUR_JWT_TOKEN>`

### 1. Submit Leave Request

- **Description:** Allows the authenticated user to submit a new leave request, optionally attaching a supporting document.
- **Endpoint:** `POST /api/v1/leave/requests`
- **Headers:**
  - `Authorization: Bearer <YOUR_JWT_TOKEN>`
  - `Content-Type: multipart/form-data; boundary=...` _(Set by client)_
- **Request Body:** (`multipart/form-data`)
  - **Part 1: `request`**
    - `Content-Type: application/json`
    - **Body:**
      ```json
      {
        "leaveType": "VACATION",
        "startDate": "2024-08-10",
        "endDate": "2024-08-15",
        "halfDay": false,
        "reason": "Annual family vacation"
      }
      ```
  - **Part 2: `document` (Optional)**
    - `Content-Type: application/pdf` _(or other relevant type)_
    - **Body:** (Binary content of the file)
- **Success Response (200 OK):** Returns the created `LeaveRequestResponseDto`.
  ```json
  {
    "id": 123,
    "userId": 45,
    "userFirstName": "Jane",
    "userLastName": "Smith",
    "leaveType": "VACATION",
    "startDate": "2024-08-10",
    "endDate": "2024-08-15",
    "halfDay": false,
    "status": "PENDING",
    "reason": "Annual family vacation",
    "comment": null,
    "uploadedDocumentUrl": "/uploads/document_xyz.pdf",
    "createdAt": "2024-07-26",
    "updatedAt": "2024-07-26"
  }
  ```
  _(Note: `uploadedDocumentUrl` will be present if a document was uploaded)_
- **Error Responses:**
  - `400 Bad Request`: Validation errors (e.g., dates in the past, missing reason).
  - `401 Unauthorized`: Invalid or missing token.

### 2. Get User's Leave Requests

- **Description:** Retrieves a list of all leave requests submitted by the currently authenticated user.
- **Endpoint:** `GET /api/v1/leave/requests`
- **Headers:**
  - `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body:** None
- **Success Response (200 OK):** Returns a list of `LeaveRequestResponseDto`.
  ```json
  [
    {
      "id": 123,
      "userId": 45,
      "userFirstName": "Jane",
      "userLastName": "Smith",
      "leaveType": "VACATION",
      "startDate": "2024-08-10",
      "endDate": "2024-08-15",
      "halfDay": false,
      "status": "PENDING",
      "reason": "Annual family vacation",
      "comment": null,
      "uploadedDocumentUrl": "/uploads/document_xyz.pdf",
      "createdAt": "2024-07-26",
      "updatedAt": "2024-07-26"
    },
    {
      "id": 120,
      "userId": 45,
      "userFirstName": "Jane",
      "userLastName": "Smith",
      "leaveType": "SICK",
      "startDate": "2024-07-10",
      "endDate": "2024-07-10",
      "halfDay": false,
      "status": "APPROVED",
      "reason": "Flu",
      "comment": "Get well soon!",
      "uploadedDocumentUrl": null,
      "createdAt": "2024-07-09",
      "updatedAt": "2024-07-09"
    }
  ]
  ```
- **Error Responses:**
  - `401 Unauthorized`: Invalid or missing token.

### 3. Get Specific Leave Request

- **Description:** Retrieves the details of a specific leave request by its ID.
- **Endpoint:** `GET /api/v1/leave/requests/{id}` (e.g., `/api/v1/leave/requests/123`)
- **Path Variables:**
  - `id` (Long): The ID of the leave request.
- **Headers:**
  - `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body:** None
- **Success Response (200 OK):** Returns a single `LeaveRequestResponseDto`.
  ```json
  {
    "id": 123,
    "userId": 45,
    "userFirstName": "Jane",
    "userLastName": "Smith",
    "leaveType": "VACATION",
    "startDate": "2024-08-10",
    "endDate": "2024-08-15",
    "halfDay": false,
    "status": "PENDING",
    "reason": "Annual family vacation",
    "comment": null,
    "uploadedDocumentUrl": "/uploads/document_xyz.pdf",
    "createdAt": "2024-07-26",
    "updatedAt": "2024-07-26"
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Invalid or missing token.
  - `403 Forbidden`: User does not have permission to view this request.
  - `404 Not Found`: Leave request with the given ID not found.

### 4. Approve/Reject Leave Request

- **Description:** Allows an authorized user (e.g., Admin) to approve or reject a pending leave request.
- **Endpoint:** `PUT /api/v1/leave/requests/{id}/approve` (e.g., `/api/v1/leave/requests/123/approve`)
- **Path Variables:**
  - `id` (Long): The ID of the leave request to update.
- **Headers:**
  - `Authorization: Bearer <ADMIN_JWT_TOKEN>`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "status": "APPROVED",
    "comment": "Enjoy your vacation!"
  }
  ```
  _(Note: `status` can be `APPROVED` or `REJECTED`)_
- **Success Response (200 OK):** Returns the updated `LeaveRequestResponseDto`.
  ```json
  {
    "id": 123,
    "userId": 45,
    "userFirstName": "Jane",
    "userLastName": "Smith",
    "leaveType": "VACATION",
    "startDate": "2024-08-10",
    "endDate": "2024-08-15",
    "halfDay": false,
    "status": "APPROVED",
    "reason": "Annual family vacation",
    "comment": "Enjoy your vacation!",
    "uploadedDocumentUrl": "/uploads/document_xyz.pdf",
    "createdAt": "2024-07-26",
    "updatedAt": "2024-07-27"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Validation errors (e.g., invalid status, missing comment).
  - `401 Unauthorized`: Invalid or missing token.
  - `403 Forbidden`: User does not have permission to approve/reject requests.
  - `404 Not Found`: Leave request with the given ID not found.
  - `409 Conflict`: Request is not in a state that can be approved/rejected (e.g., already approved).

---

## Leave Request Endpoints (Admin)

Base Path: `/api/v1/admin/leave`

These endpoints are for managing leave requests and typically require ADMIN privileges.

**Required Header for all endpoints in this section:**

- `Authorization: Bearer <ADMIN_JWT_TOKEN>`

### 1. Get All Leave Requests (Filtered)

- **Description:** Retrieves a list of all leave requests, with optional filters. Requires ADMIN role.
- **Endpoint:** `GET /api/v1/admin/leave/requests`
- **Headers:**
  - `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Query Parameters:** (All optional)
  - `department` (String): Filter by user's department (e.g., `department=Engineering`).
  - `status` (String): Filter by status (`PENDING`, `APPROVED`, `REJECTED`).
  - `leaveType` (String): Filter by leave type (e.g., `ANNUAL`, `SICK`).
  - `startDate` (LocalDate, `YYYY-MM-DD`): Filter requests ending on or after this date.
  - `endDate` (LocalDate, `YYYY-MM-DD`): Filter requests starting on or before this date.
  - _(TODO: Add pagination: `page`, `size`, `sort`)_
- **Request Body:** None
- **Success Response (200 OK):** Returns a list of `LeaveRequestResponseDto`.
  ```json
  [
    // ... array of LeaveRequestResponseDto objects ...
  ]
  ```
- **Error Responses:**
  - `401 Unauthorized`: Invalid or missing token.
  - `403 Forbidden`: User does not have ADMIN role.

### 2. Approve/Reject Leave Request

- **Description:** Allows an ADMIN to approve or reject a pending leave request. (Moved from user section for clarity, endpoint remains the same conceptually but requires ADMIN).
- **Endpoint:** `PUT /api/v1/leave/requests/{id}/approve`
- **Path Variables:**
  - `id` (Long): The ID of the leave request to update.
- **Headers:**
  - `Authorization: Bearer <ADMIN_JWT_TOKEN>`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "status": "APPROVED",
    "comment": "Enjoy your vacation!"
  }
  ```
  _(Note: `status` can be `APPROVED` or `REJECTED`)_
- **Success Response (200 OK):** Returns the updated `LeaveRequestResponseDto`.
- **Error Responses:**
  - `400 Bad Request`: Validation errors.
  - `401 Unauthorized`: Invalid or missing token.
  - `403 Forbidden`: User does not have permission.
  - `404 Not Found`: Leave request not found.
  - `409 Conflict`: Request not in PENDING state.

---

## User Endpoints

Base Path: `/api/v1/users`

These endpoints relate to user profile information and require authentication.

**Required Header for all endpoints in this section:**

- `Authorization: Bearer <YOUR_JWT_TOKEN>`

### 1. Get Current User Profile

- **Description:** Retrieves the profile details of the currently authenticated user, including leave balance.
- **Endpoint:** `GET /api/v1/users/me`
- **Headers:**
  - `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body:** None
- **Success Response (200 OK):** Returns a `UserProfileDto`.
  ```json
  {
    "id": 45,
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "STAFF",
    "msProfilePictureUrl": "https://graph.microsoft.com/...",
    "department": "Engineering",
    "team": "Platform",
    "totalLeaveAllowance": 20.0,
    "usedLeaveDays": 5.5
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Invalid or missing token.
  - `404 Not Found`: User associated with the token not found in the database.

---

## Report Endpoints

Base Path: `/api/reports`

Provides reporting capabilities. Requires authentication.

**Required Header for all endpoints in this section:**

- `Authorization: Bearer <YOUR_JWT_TOKEN>` _(Typically requires Admin privileges)_

### 1. Download Leave Report (CSV)

- **Description:** Generates and downloads a leave report in CSV format based on optional filter criteria.
- **Endpoint:** `GET /api/reports/leave`
- **Headers:**
  - `Authorization: Bearer <ADMIN_JWT_TOKEN>`
  - `Accept: text/csv` _(Optional, recommended)_
- **Query Parameters:** (All optional)
  - `department` (String): e.g., `department=Engineering`
  - `startDate` (LocalDate, `YYYY-MM-DD`): e.g., `startDate=2024-01-01`
  - `endDate` (LocalDate, `YYYY-MM-DD`): e.g., `endDate=2024-12-31`
  - `leaveType` (LeaveType enum): e.g., `leaveType=VACATION` (Valid values depend on `LeaveType` enum: `ANNUAL`, `SICK`, `VACATION`, `UNPAID`, `OTHER`)
- **Example Request URL:**
  `http://localhost:8080/api/reports/leave?department=Engineering&startDate=2024-01-01&endDate=2024-12-31&leaveType=VACATION`
- **Request Body:** None
- **Success Response (200 OK):**
  - **Headers:**
    - `Content-Type: text/csv`
    - `Content-Disposition: attachment; filename="leave_report.csv"`
  - **Body:** Raw CSV data.
    ```csv
    Employee ID,Employee Name,Department,Leave Type,Start Date,End Date,Duration (days),Status
    45,Jane Smith,Engineering,VACATION,2024-08-10,2024-08-15,6.00,APPROVED
    52,John Doe,Engineering,VACATION,2024-11-01,2024-11-05,5.00,PENDING
    ...
    ```
- **Error Responses:**
  - `400 Bad Request`: Invalid query parameter format (e.g., bad date, invalid leave type).
  - `401 Unauthorized`: Invalid or missing token.
  - `403 Forbidden`: User does not have permission to access reports.
  - `500 Internal Server Error`: Error during report generation.
