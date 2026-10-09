# HEALHEALTH — AI-Powered Healthcare Navigation Platform

HEALHEALTH is a full-stack, AI-driven healthcare navigation, doctor discovery, and smart appointment coordination SaaS platform. It combines evidence-grounded clinical AI navigation with NVIDIA NIM foundation models, geospatial hospital/clinic mapping, 3D anatomical exploration, and appointment booking.

---

## 🌟 Key Architecture & Capabilities

1. **AI Healthcare Navigator (NVIDIA NIM)**
   - Connects to NVIDIA NIM foundation models hosted at `https://integrate.api.nvidia.com/v1`.
   - **User-Selectable Models**:
     - `nvidia/nemotron-3.5-lightning-30b-a3b` — Ultra-Fast Clinical Reasoning
     - `meta/muse-glimmer-30b` — Dialogue & Empathy
     - `nvidia/nemotron-3-ultra-550b-a55b` — Deep Medical Reasoning
   - **Grounded Medical Knowledge Retrieval**: Clinical guidance grounded in public-domain medical reference datasets (MedlinePlus / NIH, NHS Health A-Z).
   - **Deterministic Emergency Triage**: Pre-generation red-flag evaluation (stroke signs, cardiac chest pressure, anaphylaxis, severe dyspnea) immediately triggers emergency protocols and local dispatch contacts (112 / 911).
   - **Multilingual Support**: English, Hindi (हिंदी), and Marathi (मराठी).

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
- **Backend API Server**: [http://localhost:5000](http://localhost:5000) (REST API + SQLite + NVIDIA NIM)
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

# Seed sample data
npm run seed
```

---

## 📡 REST API Reference (`/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health, database status, and NIM configuration status |
| `GET` | `/api/v1/ai/models` | List of the 3 selectable NVIDIA NIM models |
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
- **API Key Protection**: `NVIDIA_NIM_API_KEY` is strictly confined to the server environment and never exposed in the client bundle.
- **Privacy First**: Patient Protected Health Information (PHI) is not logged or transmitted outside required clinical endpoints.
- **Safety Protocol**: All generated responses include the mandatory clinical educational disclaimer.
