# Kaggle Writeup: Supplement Sync

## 🌌 Project Overview
**Supplement Sync** is a mobile-first, privacy-focused daily vitamin and supplement tracking web application. Built during the Kaggle 5-Day AI Agents course, the project demonstrates how to merge modern client-side storage with multimodal AI capabilities (Gemini API) to solve real-world UX friction without compromising user privacy.

*   **GitHub Repository**: [github.com/TataSegal/SupplementSync](https://github.com/TataSegal/SupplementSync)
*   **Kaggle Competition**: [vibecoding-agents-capstone-project](https://www.kaggle.com/competitions/vibecoding-agents-capstone-project)

---

## 🎯 The Problem
Managing a daily wellness routine involving multiple vitamins and supplements comes with significant friction:
1.  **Tedious Data Entry**: Manually typing out supplement names, specific dosages (e.g., "5000 IU", "2 softgels"), and special instructions (e.g., "take with a fatty meal") is slow and error-prone.
2.  **Privacy Concerns**: Health and supplement routines are highly personal. Existing trackers require cloud accounts, syncing user data to remote databases where it can be tracked or monetized.
3.  **Adherence Friction**: Lack of simple, clear scheduling and stock tracking leads to forgotten doses and empty supplement bottles.

---

## 💡 The Solution: Supplement Sync
Supplement Sync solves these problems by providing a **100% client-side, offline-first app** equipped with an **AI Label Scanner Agent**. Users can capture or upload an image of a supplement bottle label, and the embedded AI automatically extracts the name, optimal dosage, and intake notes to pre-populate the form.

---

## 🏗️ Architecture & Technical Stack

The application is structured as a **Zero-Backend Serverless Client-Side App** to guarantee absolute privacy:

```
[Smartphone Camera / File Upload] 
       │ (Base64 Image Data)
       ▼
[Web Browser (HTML5 + CSS3 + ES6 JS)] ◄───► [LocalStorage (State, Logs, API Key)]
       │ (Direct Secure HTTPS Request)
       ▼
[Google Gemini API (gemini-2.5-flash)]
```

### 1. Presentation Layer (Frontend & Premium Aesthetics)
*   **Semantic HTML5 & Vanilla CSS3**: A premium, responsive design with an elegant off-white light theme and a sleek dark theme.
*   **Day/Night Mode Switcher**: Fully togglable with persistent user preference saved in `localStorage`.
*   **Venn Diagram Logo**: A custom, vibrant, three-color overlapping geometric logo representing health, fun, and biohacking.
*   **Compact Circular Progress Widget**: An Apple Watch-like activity ring with a pulsing energy/vitality icon centered inside, displaying progress percentage and intake ratios side-by-side in the header.
*   **Responsive Desktop/Mobile Synchronization**: Shows a clean dashboard sidebar on wide screens and transitions to a bottom navigation bar on mobile viewports (< 768px).

### 2. State Management & Local Memory
*   **Web Storage (LocalStorage)**: State (supplement catalog, schedules, intake logs, streaks, and API credentials) is saved locally in the browser's `localStorage` to guarantee 100% offline privacy.
*   **Smart Name Truncation**: Supplement names are intelligently shortened on the main checklist cards while retaining their full labels in detail modals.
*   **Supplement Type Icons**: Custom icons (Pills, Capsules, Liquid, Powder, Syringe) map directly to formulations.

### 3. AI Agent Integration (Gemini API)
*   **Label Extractor Agent**:
    *   Direct `fetch` requests sent to the Gemini API (`gemini-2.5-flash:generateContent`).
    *   **Secure API Key Storage**: Key is entered in Settings and saved locally in `localStorage`—never sent to third-party servers.
    *   **Structured JSON Output**: Prompts enforce a clean JSON payload using `responseMimeType: "application/json"`.
*   **Demo Mode fallback**: If no API key is provided, the app runs in **Demo Mode**, displaying the loader spinner before autofilling mock supplement data.

---

## 🚀 Key Takeaways & "Vibe Coding"
This project was developed iteratively using the **Google Antigravity IDE**. By practicing "Vibe Coding," natural language was used to orchestrate complex UI updates, handle video streams in browser environments, and securely configure API call parameters. The result is a premium, lightweight, privacy-focused application that proves AI agents can enhance client-side utilities without requiring complex backend servers.
