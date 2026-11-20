# HEALHEALTH — AI-Powered Healthcare Navigation Platform

HEALHEALTH is a full-stack, AI-driven healthcare navigation, doctor discovery, and smart appointment coordination SaaS platform. It combines evidence-grounded clinical AI navigation with high-performance foundation models, geospatial hospital/clinic mapping, 3D anatomical exploration, and appointment booking.

---

## 🌟 Key Architecture & Capabilities

1. **AI Healthcare Navigator (byNara AI Router)**
   - Connects to high-performance clinical foundation models via `https://router.bynara.id`.
   - **User-Selectable Models**:
     - `agnes-2.5-flash` — Fast Multimodal Clinical Reasoning (Default)
     - `nemotron-3.5-lightning-free` — Rapid Clinical Triage & Guidance
     - `laguna-s-2.1` — Concise Clinical Navigation
   - **Grounded Medical Knowledge Retrieval**: Clinical guidance grounded in public-domain medical reference datasets (MedlinePlus / NIH, NHS Health A-Z).
   - **Deterministic Emergency Triage**: Pre-generation red-flag evaluation (stroke signs, cardiac chest pressure, anaphylaxis, severe dyspnea) immediately triggers emergency protocols and local dispatch contacts (112 / 911).
   - **Multilingual Support**: English, Hindi (हिंदी), and Marathi (मराठी).
   - **Resilience & Error Recovery**: 1-click retry on connection failures, timeout protection, duplicate submission prevention, and clean chain-of-thought stripping.

2. **Relational Database & Concurrency Protection**
   - Node.js + TypeScript + Express backend under `/api/v1`.
   - Zero-config relational SQLite storage (`dev.db`) using native `node:sqlite` with WAL mode and foreign key constraints.
   - Concurrency-safe appointment bookings with duplicate-slot prevention.

3. **Geospatial Healthcare Map (`/locations`)**
   - Free, live OpenStreetMap and Esri tiles (zero API keys or tokens required).
   - Haversine distance engine and multi-filter discovery (24/7 ER hospitals, clinics, doctor practices).

4. **Clinical SaaS Suite**
   - Doctor Discovery & verified profile viewing.
   - Smart Appointment booking with real-time slot checking.
   - AI Pathology & Lab Report Analyzer.
   - Interactive 3D Human Anatomical Explorer.

---

## 🚀 Quick Start (One Command)

To start the **entire application (both the Backend Server and Frontend Web App)** together with a single command, open your terminal in this folder and simply type:

```bash
heal
```
*(or `npm run heal`, or double-click `heal.bat`)*

This runs:
- **Backend API Server**: [http://localhost:5000](http://localhost:5000) (REST API + SQLite + byNara AI Router)
- **Frontend Web App**: [http://localhost:5173](http://localhost:5173) (Vite + React + 3D + Leaflet Map)

---

### Manual Commands
```bash
# Start backend server only
npm run server

# Start frontend client only
npm run dev

# Run automated tests
npm run test:server

# Build production bundle
npm run build
```

---

## 📡 REST API Reference (`/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health, database status, and AI configuration status |
| `GET` | `/api/v1/ai/models` | List of the 3 selectable AI models |
| `POST` | `/api/v1/ai/chat` | AI Healthcare Navigator chat with grounded retrieval and triage |
| `POST` | `/api/v1/ai/triage` | Dedicated symptom triage and urgency risk evaluation |
| `GET` | `/api/v1/doctors` | List or search verified doctors (`?query=`, `?specialty=`, `?location=`) |
| `GET` | `/api/v1/doctors/:id` | Single doctor profile |
| `GET` | `/api/v1/facilities` | List or search healthcare facilities (`?query=`, `?type=`, `?emergency=true`) |
| `GET` | `/api/v1/facilities/:id` | Single facility details |
| `GET` | `/api/v1/appointments` | User appointments list |
| `GET` | `/api/v1/appointments/slots` | Booked and available appointment slots (`?doctorId=&date=`) |
| `POST` | `/api/v1/appointments` | Concurrency-safe appointment booking |
| `DELETE` | `/api/v1/appointments/:id` | Cancel appointment |
| `POST` | `/api/v1/reports/analyze` | AI Pathology & Lab Report Analyzer |
| `POST` | `/api/v1/auth/login` | Authentication (supports demo logins) |
| `POST` | `/api/v1/auth/signup` | Patient registration |
| `GET` | `/api/v1/auth/me` | Current user profile |

---

## 🔒 Security & Medical Privacy
- **API Key Protection**: `AI_API_KEY` is strictly confined to the server environment and never exposed in the client bundle.
- **Privacy First**: Patient Protected Health Information (PHI) is not logged or transmitted outside required clinical endpoints.
- **Safety Protocol**: All generated responses include the mandatory clinical educational disclaimer.
