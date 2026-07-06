# Kaggle Writeup: Supplement Sync

## 🌌 Project Overview
Supplement Sync is a client-side, privacy-oriented supplement tracking web app that keeps routine data local to the browser and uses the Gemini API only for optional AI label extraction. The app demonstrates how browser storage and multimodal AI can reduce data-entry friction, while also acknowledging that client-side API keys are not a production-safe pattern and should be moved behind a backend proxy for commercial deployment.

*   **GitHub Repository**: [github.com/TataSegal/SupplementSync](https://github.com/TataSegal/SupplementSync)
*   **Kaggle Competition**: [vibecoding-agents-capstone-project](https://www.kaggle.com/competitions/vibecoding-agents-capstone-project)

---

## 🎯 The Problem
Managing a daily wellness routine involving multiple vitamins and supplements comes with significant friction:
1.  **Tedious Data Entry**: Manually typing out supplement names, specific dosages (e.g., "5000 IU", "2 softgels"), and special instructions (e.g., "take with a fatty meal") is slow and error-prone.
2.  **Privacy Concerns**: Health and supplement routines are highly personal. Conventional trackers require centralized cloud synchronization, creating data exposure risks on remote backends.
3.  **Adherence Friction**: Lack of simple, clear scheduling and stock tracking leads to forgotten doses and empty supplement bottles.

---

## 💡 The Solution: Supplement Sync
Supplement Sync is a client-side, privacy-oriented web application with offline-friendly core flows and optional AI-assisted online features. Users can upload an image of a supplement bottle label, and the embedded AI extracts the name, dosage, and intake notes to pre-populate the form.

---

## 🏗️ Architecture & Technical Stack
The application is structured as a client-side web application to reduce backend exposure and keep data local to the browser:

```
[Smartphone Camera / File Upload] 
       │ (Base64 Image Data)
       ▼
[Web Browser (HTML5 + CSS3 + ES6 JS)] ◄───► [LocalStorage (State, Logs, API Key)]
       │ (Direct Secure HTTPS Request)
       ▼
[Google Gemini API (gemini-2.5-flash)]
```

### 1. Presentation Layer (Frontend & Aesthetics)
*   **Semantic HTML5 & Vanilla CSS3**: A responsive design supporting light and dark themes.
*   **Day/Night Mode Switcher**: Togglable with user preference saved in `localStorage`.
*   **Geometric Logo**: An overlapping geometric design representing health and data synchronization.
*   **Progress Widget**: A circular activity ring displaying intake progress and ratios.
*   **Responsive Desktop/Mobile Synchronization**: Shows a clean dashboard sidebar on wide screens and transitions to a bottom navigation bar on mobile viewports (< 768px).

### 2. State Management & Local Storage
*   **Persistent Web Storage (localStorage)**: User state (supplement catalog, schedules, intake logs, streaks, and API credentials) is saved locally in the browser's persistent `localStorage` to avoid storing routine data on a remote backend.
*   **Smart Name Truncation**: Supplement names are intelligently shortened on the main checklist cards while retaining their full labels in detail modals.
*   **Supplement Type Icons**: Custom icons (Pills, Capsules, Liquid, Powder, Syringe) map directly to formulations.

### 3. AI Agent Integration & Security Architecture
*   **Label Extractor & Safety Agents**:
    *   Direct `fetch` requests sent from the browser to the official Google Gemini API endpoint.
    *   **Authentication**: Sent via the `x-goog-api-key` header rather than query string parameters (which can leak via browser history or proxy logs).
    *   **Structured JSON Output**: Prompts enforce a clean JSON payload using `responseMimeType: "application/json"`.
*   **Demo Mode fallback**: If no API key is provided, the app runs in **Demo Mode**, displaying the loader spinner before autofilling mock supplement data.

---

## 🔒 Security & Production Best Practices
> [!IMPORTANT]
> **Prototype Design Considerations**:
> Keeping the app serverless and client-side allows free hosting on GitHub Pages and isolates personal health logs to the user's browser. However, storing API keys in `localStorage` and making client-side API requests exposes the keys to client-side risks (such as XSS attacks or physical device/profile compromise), violating OWASP production guidelines.
> 
> *   **Key Restriction Mitigation**: To reduce the blast radius in this client-side architecture, the application prompts users to restrict their API keys to the **"Gemini API" only** inside their Google AI Studio or GCP console.
> 
> **Production Recommendation**:
> For a commercial, production-grade deployment, the architecture should be refactored to introduce a **secure backend proxy/gateway** (e.g., hosted on Google Cloud Run or Cloud Functions). The backend proxy would:
> 1. Store the Gemini API key securely in server-side environment variables or Secret Manager.
> 2. Act as an intermediary endpoint, receiving requests from the client, appending the API key, and forwarding them to Google's API, keeping the secret key completely hidden from the client side.

---

## 🚀 Key Takeaways & "Vibe Coding"
This project was developed iteratively using the **Google Antigravity IDE**. By practicing "Vibe Coding," natural language was used to orchestrate complex UI updates, handle video streams in browser environments, and securely configure API call parameters. The result is a lightweight, privacy-focused application that proves AI agents can enhance client-side utilities without requiring complex backend servers.
