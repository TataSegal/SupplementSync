# 🌌 Supplement Sync

**Supplement Sync** is a modern, premium, and fully client-side web application designed to help you organize, schedule, and track your daily vitamins and supplements with complete privacy.

All your supplement schedules, intake history, and stock records are stored **100% locally** in your browser's Local Storage. No external servers, no databases, and no tracking.

---

## ✨ Features

- **Dynamic Today's Checklist:** Automatically groups scheduled supplements by time of day (Morning, Afternoon, Evening) for the current day of the week.
- **Visual Progress Ring:** A dynamic SVG progress ring that fills up in real-time as you tick off your taken supplements.
- **Streak Tracker:** Automatically counts your consecutive days of completing your supplement routine.
- **Inventory & Low Stock Alerts:** Track remaining pill counts; warns you automatically when inventory drops below your customizable warning limit.
- **Weekly Analytics:** A beautiful 7-day bar chart showing your adherence rate and completion history.
- **Data Export & Import:** Move your data easily between browsers or devices with JSON backups.
- **Responsive Layout:** Works beautifully on desktop, tablets, and smartphones.

---

## 🚀 How to Run

### Method 1: Open Directly (Easiest)
Simply double-click the `index.html` file to open the application directly in any modern web browser (Chrome, Safari, Edge, Firefox).

### Method 2: Local Python Server (Recommended for development)
To run a local web server, open your terminal/PowerShell in this directory and execute:
```bash
# Python 3
python -m http.server 8000
```
Then open your browser and navigate to: [http://localhost:8000](http://localhost:8000).

---

## 🛠️ Technology Stack

- **HTML5:** Semantic layouts and clean structural elements.
- **Vanilla CSS3:** Curated dark theme, custom responsive grid, glassmorphic card effects (`backdrop-filter`), hover micro-interactions, and animations.
- **Vanilla JavaScript (ES6):** Complete local state management, LocalStorage synchronization, dynamically generated graphs, and modals.
- **Google Fonts:** Premium typography using *Outfit*.
- **FontAwesome:** Scalable vector icons.
