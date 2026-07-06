# 🌌 Supplement Sync

**Supplement Sync** is a modern, premium, and fully client-side web application designed to help you organize, schedule, and track your daily vitamins and supplements with complete privacy.

All your supplement schedules, intake history, and stock records are stored **100% locally** in your browser's Local Storage. No external servers, no databases, and no tracking.

---

## ✨ Features

- **Dynamic Today's Checklist:** Automatically groups scheduled supplements by time of day (Morning, Afternoon, Evening) for the current day of the week.
- **Visual Progress Ring:** A dynamic SVG progress ring that fills up in real-time as you tick off your taken supplements.
- **Streak Tracker:** Automatically counts your consecutive days of completing your supplement routine.
- **AI Label Scanner:** Capture a photo using your webcam or upload a label image. The integrated Gemini AI agent automatically parses the brand, name, dosage, and usage instructions to autofill your inventory form.
- **Inventory & Low Stock Alerts:** Track remaining pill counts; warns you automatically when inventory drops below your customizable warning limit.
- **Weekly Analytics:** A beautiful 7-day bar chart showing your adherence rate and completion history.
- **Data Export & Import:** Move your data easily between browsers or devices with JSON backups.
- **Responsive Layout:** Works beautifully on desktop, tablets, and smartphones.

---

## 🔒 AI Key & Privacy (BYOK)

Supplement Sync adheres to a strict privacy model. To enable the AI features without a centralized server, the app uses a **Bring Your Own Key (BYOK)** architecture:
*   **Local Credentials**: Your Gemini API Key is saved directly in your browser's `localStorage` and never leaves your device.
*   **Direct API Connection**: The app communicates directly with Google's official Gemini API. There is no middleman or logging server.
*   **Demo Mode Fallback**: If you do not have an API Key, the app will run in **Demo Mode**, simulating the AI scanning animation and auto-populating mock supplement data for testing.

---

## 🚀 How to Run

### Method 1: Open Directly (Easiest)
Simply double-click the `index.html` file to open the application directly in any modern web browser.

### Method 2: Local Python Server (Recommended for development)
To run a local web server, open your terminal/PowerShell in this directory and execute:
```bash
python -m http.server 8080 --bind 127.0.0.1
```
Then open your browser and navigate to: [http://127.0.0.1:8080](http://127.0.0.1:8080).

---

## 🛠️ Technology Stack

- **HTML5:** Semantic layouts and clean structural elements.
- **Vanilla CSS3:** Curated dark theme, custom responsive grid, glassmorphic card effects (`backdrop-filter`), hover micro-interactions, and animations.
- **Vanilla JavaScript (ES6):** Complete local state management, LocalStorage synchronization, dynamically generated graphs, and modals.
- **Google Fonts:** Premium typography using *Outfit*.
- **FontAwesome:** Scalable vector icons.
