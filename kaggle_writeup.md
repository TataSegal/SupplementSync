# Kaggle Writeup: Supplement Sync

## 🌌 Project Overview
Supplement Sync is a project that assists with supplement intake tracking, using AI to scan data from labels and reveal potential supplement interaction risks.

*   **GitHub Repository**: [github.com/TataSegal/SupplementSync](https://github.com/TataSegal/SupplementSync)
*   **Kaggle Competition**: [vibecoding-agents-capstone-project](https://www.kaggle.com/competitions/vibecoding-agents-capstone-project)

---

## 🎯 The Problem
Managing a daily wellness routine involving multiple vitamins and supplements comes with significant friction:
1.  **Tedious Data Entry**: Manually typing out supplement names, specific dosages (e.g., "5000 IU", "2 softgels"), and special instructions is slow and error-prone.
2.  **Intake Safety**: Users often take combinations of dietary supplements without visibility into potential negative interactions, absorption conflicts, or health warnings.
3.  **Adherence Friction**: Lack of simple, clear scheduling and stock tracking leads to forgotten doses and empty supplement bottles.

---

## 💡 The Solution
Supplement Sync is a client-side, privacy-oriented web application with offline-friendly core flows and optional AI-assisted online features. Users can upload an image of a supplement bottle label, and the embedded AI extracts the name, dosage, and intake notes to pre-populate the form. While keeping all user routines in the browser avoids storing routine data on a remote backend, client-side key storage is inconsistent with OWASP guidance for production environments, serving as a design compromise for this prototype.

---

## 🏗️ Architecture & Technical Stack
The application is structured as a client-side web application to reduce backend exposure and keep data local to the browser:

```
[Smartphone Camera / File Upload] 
       │ (Base64 Image Data)
       ▼
[Web Browser (HTML5 + CSS3 + ES6 JS)] ◄───► [LocalStorage (State, Logs, API Key)]
       │ (Direct HTTPS Request)
       ▼
[Google Gemini API (gemini-2.5-flash)]
```

### 1. Presentation Layer (Frontend & Aesthetics)
*   **Semantic HTML5 & Vanilla CSS3**: A responsive design supporting light and dark themes.
*   **Day/Night Mode Switcher**: Togglable with user preference saved in `localStorage`.
*   **Geometric Logo**: An overlapping geometric design representing health and data synchronization.
*   **Progress Widget**: A circular activity ring displaying intake progress and ratios.
*   **Responsive Desktop/Mobile Layout**: Shows a clean dashboard sidebar on wide screens and transitions to a bottom navigation bar on mobile viewports (< 768px).

### 2. State Management & Local Storage (with Security Mitigation)
*   **Persistent Web Storage (localStorage)**: User state (supplement catalog, schedules, intake logs, streaks, and API credentials) is saved locally in the browser's persistent `localStorage` to avoid storing routine data on a remote backend.
*   **Key Restriction Mitigation**: As a partial risk-reduction measure, users are advised to restrict their key to the Gemini API only. This reduces potential cross-service abuse if the key is exposed, but does not make client-side key storage production-safe.
*   **Smart Name Truncation**: Supplement names are intelligently shortened on the main checklist cards while retaining their full labels in detail modals.
*   **Supplement Type Icons**: Custom icons (Pills, Capsules, Liquid, Powder, Syringe) map directly to formulations.

### 3. AI Agent Integration & Security Architecture
The application integrates two specialized AI agents utilizing the Gemini API:

*   **Agent 1: Label Extractor Agent (Vision-to-Structured-Data)**:
    *   **Capability**: Processes base64-encoded image streams captured via camera or file uploads.
    *   **System Instructions**: Acts as a medical scribe. It extracts three specific data points (`name`, `dosage`, `notes`) from the visual label.
    *   **Structured Output**: Enforces structured JSON output via `responseMimeType: "application/json"`, populating the supplement forms automatically to eliminate manual entry friction.
*   **Agent 2: Safety & Compatibility Audit Agent (Clinical Verification)**:
    *   **Capability**: Analyzes the user's active cabinet list (triggered automatically when the cabinet's fingerprint changes to avoid stale checks).
    *   **System Instructions**: Acts as a clinical pharmacist. It scans the supplement cabinet for three main risk profiles:
        1.  *Incompatibility & Interactions*: Competitions for absorption (e.g., Calcium blocking Iron) or negative synergies (e.g., high-dose Omega-3 with Curcumin thinning blood).
        2.  *Lab Test Interferences*: Identifies substances like Biotin interfering with thyroid or troponin panel readings.
        3.  *Cumulative Overdoses*: Detects overlapping active ingredients across different supplement brands.
    *   **Structured Output**: Enforces structured JSON containing `warnings_and_conflicts` (categorized as `warning` or `danger` alerts) and `timing_insights` (optimal schedule separation).
*   **Agent Orchestrator & Lifecycle Manager**:
    *   The client-side application logic (`app.js`) acts as the central orchestrator, managing state routing, visual loading states, and event triggers.
    *   **Inventory Fingerprinting**: The orchestrator computes a hash of the current supplement list. If modifications are detected, it marks the existing AI analysis as stale, triggers a warning banner, and schedules a re-audit when the user initiates a safety check.
    *   **User/Agent Handoff**: Coordinates when to invoke the *Label Extractor Agent* (upon camera/file upload), maps its structured JSON output back to the form inputs, and prompts the user for validation before saving the state.
*   **Authentication**: Both agents send direct browser-to-Google `fetch` requests utilizing the `x-goog-api-key` HTTP header rather than query string parameters.
*   **Demo Mode fallback**: If no API key is provided, the app runs in **Demo Mode**, bypassing active AI requests and displaying simulated loading before auto-populating mock supplement data.

### 4. Production Recommendation (Backend Proxy)
For a commercial, production-grade deployment, the architecture should be refactored to introduce a **secure backend proxy/gateway** (e.g., hosted on Google Cloud Run or Cloud Functions). The backend proxy would:
1.  Store the Gemini API key securely in server-side environment variables or Secret Manager.
2.  Act as an intermediary endpoint, receiving requests from the client, appending the API key, and forwarding them to Google's API, keeping the secret key completely hidden from the client side.

---

## 🚀 Key Takeaways & "Vibe Coding"
This project was developed iteratively using the **Google Antigravity IDE**. By practicing "Vibe Coding," natural language was used to orchestrate complex UI updates, handle video streams in browser environments, and configure API call parameters. The result is a lightweight application that proves AI agents can enhance client-side utilities and help manage daily supplement routines.
