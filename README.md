<div align="center">

# VaurLis Educations
### *Next-Generation Learning Management System & Interactive Platform*

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)](https://github.com/prince7z/Coursera)
[![License](https://img.shields.io/badge/license-ISC-green.svg?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.11-06B6D4.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

<br>

<p align="center">
  <img src="readme-content/homepage.webp" alt="VaurLis Educations Homepage Showcase" width="95%" style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />
</p>

*Empowering educators and learners through real-time streaming, automated certification, and seamless monetization.*

</div>

---

## Executive Overview

**VaurLis Educations** is a production-ready, full-stack Learning Management System (LMS) designed to bridge the gap between students, independent instructors, and educational institutions. Built with modern web technologies, VaurLis offers an end-to-end learning lifecycle—from course creation and live streaming to secure payment processing and tamper-proof digital certification.

### Mission & Value Proposition
Our mission is to democratize modern education. Whether you are an expert sharing specialized skills or a student pursuing career advancement, VaurLis provides the tools to teach, learn, and succeed.

| For Instructors | For Students | For Institutions |
| :--- | :--- | :--- |
| **Monetize Knowledge**: Flexible pricing with instant Razorpay payouts | **Interactive Learning**: HD video streaming & interactive live classes | **Scalable Infrastructure**: Micro-services ready backend topology |
| **Comprehensive Analytics**: Track revenue, student engagement & reviews | **Verified Credentials**: Blockchain-ready certificates with QR validation | **Custom Branding**: Tailored navigation headers, footers & certificates |
| **Course Authoring**: Multimedia content support (Video, PDF, Quizzes) | **Peer Network**: Learn from top featured industry leaders & creators | **Audit & Security**: Fine-grained role permissions & security logging |

---

## System Architecture & Workflow

### High-Level Architecture Topology
The platform follows a decoupled client-server architecture with multi-layered security and external service integrations.

```mermaid
graph TB

    subgraph ClientLayer["Client Layer"]
        A[Web Frontend React]
        B[Future Mobile App]
    end

    subgraph SecurityLayer["Security Layer"]
        C1[CORS Protection]
        C2[Helmet Security]
        C3[Rate Limiter]
        C4[Mongo Request Logger]
    end

    subgraph Backend["Express.js Backend Server"]
        D[Express.js API Server]

        subgraph Middleware["Middleware"]
            E1[JWT Auth]
            E2[AuthLite]
            E3[Validation]
        end

        subgraph Modules["Business Modules"]
            F1[Authentication Module]
            F2[User Module]
            F3[Course Module]
            F4[Payment Module]
            F5[Media Upload Module]
            F6[Admin Analytics]
            F7[WebSocket Streaming]
        end
    end

    subgraph ExternalServices["External Services"]
        G1[Razorpay Gateway]
        G2[Cloudinary CDN]
        G3[SendGrid Mailer]
    end

    subgraph Database["Database Layer"]
        H[(MongoDB Atlas)]
    end

    A --> D
    B --> D

    D --> C1
    C1 --> C2
    C2 --> C3
    C3 --> C4

    C4 --> E1
    E1 --> F1
    E1 --> F2
    E1 --> F3
    E1 --> F4
    E1 --> F5
    E1 --> F6

    D --> F7

    F1 --> H
    F2 --> H
    F3 --> H
    F4 --> H
    F5 --> H
    F6 --> H

    F4 --> G1
    F5 --> G2
    F1 --> G3
```

---

### End-to-End Request Lifecycle
Every client request undergoes rigorous validation, authorization, execution, and auditing.

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Web Client
    participant API as Express API
    participant Auth as JWT Middleware
    participant Logic as Route Logic
    participant DB as MongoDB
    participant External as External Services

    User->>Frontend: Action Request (e.g. Enroll / Upload)
    Frontend->>API: HTTP Request + Bearer JWT
    API->>API: CORS + Helmet + Rate Limiter
    API->>Auth: Verify JWT Token
    Auth->>DB: Load User Context
    DB-->>Auth: Return User Context
    Auth-->>API: Authorized Request Context
    API->>Logic: Execute Business Logic

    alt Payment Gateway Flow
        Logic->>External: Razorpay API Order Creation
    else Cloud Upload Flow
        Logic->>External: Cloudinary Direct Upload
    else Email / OTP Flow
        Logic->>External: SendGrid Email Delivery
    end

    Logic->>DB: Read / Write Operations
    DB-->>Logic: DB Confirmation / Data Payload
    Logic-->>API: Consolidated Result
    API->>DB: Log Audit Trail (MongoLogger)
    API-->>Frontend: JSON Response
    Frontend-->>User: Dynamic UI Update
```

---

## Key Features Showcase

### 1. Course Catalog & Instructor Network
Discover courses taught by verified industry experts. Detailed instructor cards showcase ratings, student enrollments, and professional expertise.

<div align="center">
  <img src="readme-content/instructors.webp" alt="Instructor Showcase UI" width="90%" style="border-radius: 8px; border: 1px solid #e1e4e8;" />
  <p><em>Featured Instructors & Credentials Showcase Interface</em></p>
</div>

- **Smart Filtering**: Filter by category, difficulty level, rating, or price.
- **Rich Course Player**: Seamless video playback powered by Cloudinary CDN streaming.
- **Reviews & Ratings**: Transparent feedback system to guarantee course quality.

---

### 2. Secure Payments & Instant Monetization
Integrated with **Razorpay** to support card payments, UPI, Net Banking, and digital wallets with dynamic order generation and instant enrollment verification.

<div align="center">
  <img src="readme-content/razorpayint.webp" alt="Razorpay Integration Modal" width="90%" style="border-radius: 8px; border: 1px solid #e1e4e8;" />
  <p><em>Seamless Razorpay Payment Checkout Experience</em></p>
</div>

- **PCI-DSS Compliant**: Payment data is handled directly by Razorpay's encrypted checkout.
- **Automated Webhooks**: Instant course activation upon successful signature verification.
- **Transaction History**: Comprehensive financial logs for both learners and instructors.

---

### 3. Real-Time WebRTC Live Streaming & Interactive Classes
Instructors can launch live interactive classes with peer-to-peer WebRTC video, low-latency WebSocket signaling, and real-time chat.

```mermaid
graph LR
    subgraph Instructor["Instructor Node"]
        A[Instructor Client]
    end

    subgraph WebSocketServer["WebSocket Server"]
        B[Room Manager]
        C["Room: class_123"]
    end

    subgraph Students["Student Nodes"]
        D[Student 1]
        E[Student 2]
        F[Student N]
    end

    A -->|sender-join| B
    D -->|receiver-join| B
    E -->|receiver-join| B
    F -->|receiver-join| B

    B --> C

    A -->|WebRTC Offer| D
    A -->|WebRTC Offer| E
    A -->|WebRTC Offer| F

    D -->|Answer + ICE| A
    E -->|Answer + ICE| A
    F -->|Answer + ICE| A

    A <-->|Chat Messages| D
    A <-->|Chat Messages| E
    A <-->|Chat Messages| F
```

- **P2P Video Mesh**: Ultra-low latency communication for live Q&A sessions.
- **Room Management**: Dynamic creation and cleanup of streaming rooms (`Server/WSS.ts`).
- **Session Chat**: Instant messaging during live broadcasts.

---

### 4. Automated Digital Certificates & Verification Portal
Upon course completion, students receive a custom-designed digital certificate equipped with a unique QR code for instant authenticity verification.

<div align="center">
  <table width="100%">
    <tr>
      <td width="50%" align="center">
        <img src="readme-content/certificatedesign.webp" alt="Digital Certificate Design" width="100%" style="border-radius: 8px;" />
        <br><sub><b>Custom Digital Certificate Template</b></sub>
      </td>
      <td width="50%" align="center">
        <img src="readme-content/scan-verify.webp" alt="Certificate Scan & Verification" width="100%" style="border-radius: 8px;" />
        <br><sub><b>QR Code Verification Portal</b></sub>
      </td>
    </tr>
  </table>
</div>

- **Tamper-Proof QR Verification**: Scanning the certificate QR code instantly opens the verification registry.
- **Downloadable PDF**: High-resolution certificate rendering for print and LinkedIn sharing.
- **Custom Institutional Branding**: Support for custom badges, signatures, and logos.

---

### 5. Robust Authentication & Security Flow
Multi-factor security workflow featuring SendGrid OTP verification, bcrypt password hashing, and stateless JWT authentication.

```mermaid
graph TD
    A[User Registration] --> B[Generate 6-Digit OTP]
    B --> C[Store OTP In Memory Cache]
    C --> D[SendGrid Email Delivery]
    D --> E[User Inputs OTP]
    E --> F{OTP Valid?}
    F -->|No| G[Reject Registration]
    F -->|Yes| H[Hash Password via bcrypt]
    H --> I[Create MongoDB User Document]
    I --> J[Generate Signed JWT Token]
    J --> K[Return Auth Payload]
    K --> L[Client Persists Token]
    L --> M[Subsequent API Requests]
    M --> N[JWT Verification Middleware]
    N --> O{Token Valid?}
    O -->|No| P[HTTP 401 Unauthorized]
    O -->|Yes| Q[Attach User Context]
    Q --> R[Access Protected API Route]
```

- **Data Protection**: Security headers enforced via `Helmet.js`.
- **Injection Prevention**: Sanitized NoSQL queries preventing MongoDB injection.
- **Rate Limiting**: Protection against brute-force login attempts.

---

### 6. Mobile First & Sleek UI Design
Designed with Tailwind CSS, VaurLis offers a responsive mobile layout alongside structured sidebar navigation and brand elements.

<div align="center">
  <table width="100%">
    <tr>
      <td width="40%" align="center">
        <img src="readme-content/mobilescreen.webp" alt="Mobile Learning Interface" width="85%" style="border-radius: 12px; border: 1px solid #ccc;" />
        <br><sub><b>Mobile Responsive Interface</b></sub>
      </td>
      <td width="60%" align="center">
        <img src="readme-content/sidebarbranding.webp" alt="Sidebar Branding UI" width="95%" style="border-radius: 8px; margin-bottom: 12px;" />
        <br><sub><b>Sidebar Navigation & Branding</b></sub>
        <br><br>
        <img src="readme-content/footerbranding.webp" alt="Footer Branding UI" width="95%" style="border-radius: 8px;" />
        <br><sub><b>Footer & Platform Details</b></sub>
      </td>
    </tr>
  </table>
</div>

---

## Technology Stack

<div align="center">

### Backend Architecture
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Native-FF6600?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

### Frontend Client
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.11-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Recoil](https://img.shields.io/badge/Recoil-0.7.7-3578E5?style=for-the-badge)](https://recoiljs.org/)

### Third-Party Services
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment-02042B?style=for-the-badge&logo=razorpay)](https://razorpay.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)
[![SendGrid](https://img.shields.io/badge/SendGrid-Email-1A82E2?style=for-the-badge&logo=sendgrid)](https://sendgrid.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P-333333?style=for-the-badge&logo=webrtc)](https://webrtc.org/)

</div>

---

## Repository Structure

```
Coursera/
├── backend/                           # Express.js REST & WebSockets Server
│   ├── config/                        # Integrations (Cloudinary, Logger, Mailer)
│   ├── DB/                            # Mongoose Models & Schemas
│   ├── Midware/                       # Auth & Security Middlewares
│   ├── Routes/                        # API Route Modules (Admin, Course, Payment, Auth)
│   ├── utlis/                         # OTP Cache & Helper Utilities
│   ├── Server.ts                      # Main Express Application Entry Point
│   └── WSS.ts                         # WebSocket Server for Real-Time Streaming
│
├── frontend/                          # Vite + React Client
│   ├── src/
│   │   ├── Component/                 # UI Atoms, Navigation & Certificates
│   │   ├── pages/                     # Page Views (Course, LiveClass, Purchase, Certs)
│   │   ├── config/                    # Endpoint & Client Configs
│   │   ├── App.tsx                    # Core Routing & Recoil Root
│   │   └── main.tsx                   # Client Entry Point
│   ├── vite.config.ts                 # Vite Bundler Setup
│   └── tailwind.config.ts             # Styling & Utility Tokens
│
└── readme-content/                    # Visual Assets & Diagram Definitions
    ├── homepage.webp
    ├── instructors.webp
    ├── razorpayint.webp
    ├── certificatedesign.webp
    ├── scan-verify.webp
    ├── mobilescreen.webp
    ├── sidebarbranding.webp
    ├── footerbranding.webp
    └── mermaid.txt                    # Architecture & Flow Diagrams
```

---

## Quick Start & Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **MongoDB**: Local MongoDB instance or Atlas connection string
- **Package Manager**: `npm` or `yarn`

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/prince7z/Coursera.git
   cd Coursera
   ```

2. **Backend Configuration**
   ```bash
   # Install backend dependencies
   npm install

   # Configure Environment Variables
   cp .env.example .env
   ```
   *Edit `.env` with your Mongo URI, JWT secret, Razorpay credentials, and Cloudinary keys.*

3. **Frontend Configuration**
   ```bash
   cd frontend
   npm install
   ```

4. **Launch Development Servers**

   *Terminal 1 (Backend Server & WebSockets):*
   ```bash
   npm run dev
   ```

   *Terminal 2 (Vite Frontend):*
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access Application**
   - **Frontend App**: `http://localhost:5173`
   - **API Server**: `http://localhost:5000`

---

## API Endpoint Overview

<details>
<summary><strong>Authentication & User Routes</strong></summary>

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `POST` | `/api/auth/register` | User signup & OTP trigger | Public |
| `POST` | `/api/auth/verify-otp` | OTP validation & User creation | Public |
| `POST` | `/api/auth/login` | User login & JWT issue | Public |
| `GET` | `/api/user/profile` | Retrieve user profile details | Required |

</details>

<details>
<summary><strong>Course Management Routes</strong></summary>

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `GET` | `/api/courses` | List all available courses | Public |
| `GET` | `/api/courses/:id` | Get specific course details | Public |
| `POST` | `/api/courses` | Create new course (Instructor/Admin) | Required |
| `PUT` | `/api/courses/:id` | Update existing course content | Required |

</details>

<details>
<summary><strong>Payment & Enrollment Routes</strong></summary>

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `POST` | `/api/secure/create-order/:courseId` | Create Razorpay order | Required |
| `POST` | `/api/secure/verify-payment` | Validate payment signature | Required |
| `GET` | `/api/user/transactions` | User payment history | Required |

</details>

<details>
<summary><strong>WebRTC & Live Classes</strong></summary>

| Method | Endpoint / Protocol | Description | Auth Required |
|:---|:---|:---|:---:|
| `POST` | `/api/user/schedule/liveclass/:id` | Schedule a live session | Required |
| `GET` | `/api/user/liveclass/:id` | Fetch session metadata | Required |
| `WS` | `/ws` | WebSockets for WebRTC signaling & chat | Required |

</details>

---

## Contributing

Contributions are always welcome! If you have suggestions to improve VaurLis Educations:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License & Copyright

Copyright © 2024 **VaurLis Educations**. Distributed under the **ISC License**. See `LICENSE` for more information.

---

<div align="center">

### Built with passion by [@prince7z](https://github.com/prince7z)

*Transforming Education Through Technology*

</div>