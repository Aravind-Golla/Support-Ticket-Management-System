# System Architecture & Flowcharts - Support Ticket Management System

This document provides visual flowcharts mapping out the system architecture, authentication & authorization flow, ticket lifecycle, and component interactions.

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend (React + Vite)"]
        UI["React UI (Port 5173)"]
        AC["AuthContext (JWT State)"]
        AX["Axios Client Interceptor"]
        UI --> AC
        AC --> AX
    end

    subgraph Server["Backend (Node.js + Express)"]
        API["Express Router (Port 5000)"]
        MW_AUTH["authenticate Middleware"]
        MW_ROLE["requireRole Middleware"]
        CTRL_AUTH["Auth Controller"]
        CTRL_TICKETS["Ticket Controller"]
        CTRL_COMMENTS["Comment Controller"]
        CTRL_USERS["User Controller"]

        API --> MW_AUTH
        MW_AUTH --> MW_ROLE
        MW_ROLE --> CTRL_AUTH
        MW_ROLE --> CTRL_TICKETS
        MW_ROLE --> CTRL_COMMENTS
        MW_ROLE --> CTRL_USERS
    end

    subgraph Data["Database Layer (MySQL)"]
        DB[("MySQL Database (Port 3307)")]
        USERS["users Table"]
        TICKETS["tickets Table"]
        COMMENTS["ticket_comments Table"]

        DB --- USERS
        DB --- TICKETS
        DB --- COMMENTS
    end

    AX -->|"HTTP + Bearer Token"| API
    CTRL_AUTH -->|"Parameterized Queries"| DB
    CTRL_TICKETS -->|"Parameterized Queries"| DB
    CTRL_COMMENTS -->|"Parameterized Queries"| DB
    CTRL_USERS -->|"Parameterized Queries"| DB
```

---

## 2. Authentication & Role-Based Routing Flo

```mermaid
flowchart TD
    Start(["User Visits Web Portal"]) --> CheckToken{"JWT Token in LocalStorage?"}

    CheckToken -->|"No Token"| PublicRoutes["Public Pages: /login, /register"]
    CheckToken -->|"Token Present"| DecodeToken["Verify JWT & Decode User Payload"]

    PublicRoutes --> LoginSubmit["User Inputs Credentials"]
    LoginSubmit --> PostLogin["POST /api/auth/login"]
    PostLogin --> AuthValidation{"Valid Email & bcrypt Password?"}

    AuthValidation -->|"No (401)"| ShowError["Show Invalid Credentials Alert"]
    AuthValidation -->|"Yes (200)"| SaveToken["Store JWT & User Object in LocalStorage"]
    SaveToken --> DecodeToken

    DecodeToken --> CheckRole{"User Role"}
    CheckRole -->|"Customer"| CustomerDash["/dashboard (Customer Dashboard)"]
    CheckRole -->|"Agent"| AgentDash["/agent (Agent Dashboard)"]

    subgraph RouteProtection["ProtectedRoute Wrapper"]
        CustomerDash --> CustomerAuthCheck{"Is Role Customer?"}
        CustomerAuthCheck -->|"Yes"| RenderCustomerUI["Render Customer Features"]
        CustomerAuthCheck -->|"No"| RedirectUnauthorized["Redirect to Authorized Portal"]

        AgentDash --> AgentAuthCheck{"Is Role Agent?"}
        AgentAuthCheck -->|"Yes"| RenderAgentUI["Render Agent Features"]
        AgentAuthCheck -->|"No"| RedirectUnauthorized
    end
```

---

## 3. Ticket Creation & Management Flow

```mermaid
flowchart TD
    subgraph CustomerAction["Customer Workflow"]
        C1["Customer Clicks Create Ticket"] --> C2["Fills Subject, Description, Priority"]
        C2 --> C3["POST /api/tickets"]
        C3 --> C4["Backend Assigns req.user.id as user_id"]
        C4 --> C5["Ticket Created with Status 'open'"]
    end

    subgraph AgentAction["Agent Workflow"]
        A1["Agent Views Dashboard"] --> A2["GET /api/tickets (Fetch All)"]
        A2 --> A3["Selects Ticket"]
        A3 --> A4{"Action Selected"}

        A4 -->|"Assign Agent"| A5["PUT /api/tickets/:id (assigned_to = agent_id)"]
        A4 -->|"Change Status"| A6["PUT /api/tickets/:id (status = in_progress / closed)"]
        A4 -->|"Post Comment"| A7["POST /api/tickets/:id/comments"]

        A5 --> UpdateDB[("MySQL Database Updated")]
        A6 --> UpdateDB
        A7 --> UpdateDB
    end

    C5 --> UpdateDB
```

---

## 4. Ticket Lifecycle State Diagram

```mermaid
flowchart LR
    Open["OPEN<br>(New Customer Submission)"]
    InProgress["IN PROGRESS<br>(Agent Assigned & Investigating)"]
    Closed["CLOSED<br>(Resolution Provided)"]

    Open -->|"Agent Updates Status"| InProgress
    Open -->|"Direct Resolution"| Closed
    InProgress -->|"Issue Resolved"| Closed
    Closed -->|"Customer Reopens"| InProgress
```

---

## 5. Security & Permission Check Matrix

```mermaid
flowchart TD
    Req["Incoming API Request"] --> CheckAuthHeader{"Bearer Token Included?"}

    CheckAuthHeader -->|"Missing / Invalid"| Resp401["401 Unauthorized Response"]
    CheckAuthHeader -->|"Valid Token"| ExtractUser["Attach req.user Payload"]

    ExtractUser --> EndpointType{"Endpoint Scope"}

    EndpointType -->|"Customer Route (GET /api/tickets/:id)"| OwnershipCheck{"Is req.user.role == agent OR req.user.id == ticket.user_id?"}
    OwnershipCheck -->|"Yes"| ProcessRequest["Process Request & Return Data"]
    OwnershipCheck -->|"No"| Resp403["403 Forbidden Response"]

    EndpointType -->|"Agent Route (GET /api/users, PUT /api/tickets/:id)"| AgentRoleCheck{"Is req.user.role == agent?"}
    AgentRoleCheck -->|"Yes"| ProcessRequest
    AgentRoleCheck -->|"No"| Resp403
```
