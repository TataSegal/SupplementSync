// ==========================================
// SUPPLEMENT SYNC - APPLICATION ENGINE
// ==========================================

// Global State
let state = {
    supplements: [],
    logs: [], // Array of { date: 'YYYY-MM-DD', id: 'supp-id' }
    streak: 0,
    lastActiveDate: null,
    geminiApiKey: ""
};

// Mock/Initial Data if empty
const INITIAL_SUPPLEMENTS = [
    {
        id: "1",
        name: "Vitamin D3",
        dosage: "1 gelcap (5000 IU)",
        time: "morning",
        days: [0, 1, 2, 3, 4, 5, 6], // Daily
        stock: 55,
        limit: 10,
        notes: "Take with a fat-containing meal for best absorption."
    },
    {
        id: "2",
        name: "Omega-3 Fish Oil",
        dosage: "2 capsules",
        time: "afternoon",
        days: [1, 3, 5], // Mon, Wed, Fri
        stock: 12,
        limit: 15,
        notes: "Keeps joints lubricated and improves focus."
    },
    {
        id: "3",
        name: "Magnesium Glycinate",
        dosage: "400 mg (2 pills)",
        time: "evening",
        days: [0, 1, 2, 3, 4, 5, 6], // Daily
        stock: 90,
        limit: 15,
        notes: "Helps with muscle relaxation and deep sleep."
    }
];

// App Init
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateDateDisplay();
    checkDailyReset();
    renderTodayChecklist();
    renderInventory();
    renderAnalytics();
    
    // Load API Key to Input
    const keyInput = document.getElementById('api-key-input');
    if (keyInput && state.geminiApiKey) {
        keyInput.value = state.geminiApiKey;
    }
    
    // Default Tab
    switchTab('today');
});

// Update the current date strings in the UI
function updateDateDisplay() {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const today = new Date();
    document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', options);
    
    // Also update checklist label
    document.getElementById('today-day-name').textContent = today.toLocaleDateString('en-US', { weekday: 'short' });
}

// Format date helper: YYYY-MM-DD
function getFormattedDate(date = new Date()) {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset*60*1000));
    return localDate.toISOString().split('T')[0];
}

// Load state from LocalStorage
function loadState() {
    const storedState = localStorage.getItem('supplement_sync_state');
    if (storedState) {
        try {
            state = JSON.parse(storedState);
            if (state.geminiApiKey === undefined) {
                state.geminiApiKey = "";
            }
        } catch (e) {
            console.error("Error parsing stored state, resetting.", e);
            setupDefaultState();
        }
    } else {
        setupDefaultState();
    }
}

function setupDefaultState() {
    state.supplements = [...INITIAL_SUPPLEMENTS];
    state.logs = [
        // Populate some mock logs for the analytics page
        { date: getPastDateString(1), id: "1" },
        { date: getPastDateString(1), id: "3" },
        { date: getPastDateString(2), id: "1" },
        { date: getPastDateString(2), id: "2" },
        { date: getPastDateString(2), id: "3" },
        { date: getPastDateString(3), id: "1" },
        { date: getPastDateString(3), id: "3" },
        { date: getPastDateString(4), id: "1" },
        { date: getPastDateString(4), id: "2" },
        { date: getPastDateString(4), id: "3" },
        { date: getPastDateString(5), id: "1" },
        { date: getPastDateString(5), id: "3" },
    ];
    state.streak = 4;
    state.lastActiveDate = getPastDateString(1);
    saveState();
}

function getPastDateString(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return getFormattedDate(d);
}

// Save state to LocalStorage
function saveState() {
    localStorage.setItem('supplement_sync_state', JSON.stringify(state));
}

// Check if we need to reset/check the daily streak or update date
function checkDailyReset() {
    const todayStr = getFormattedDate();
    
    if (state.lastActiveDate !== todayStr) {
        // If yesterday was active, maintain streak. If missed, reset.
        if (state.lastActiveDate) {
            const lastDate = new Date(state.lastActiveDate);
            const todayDate = new Date(todayStr);
            const diffTime = Math.abs(todayDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) {
                // Missed a day! Reset streak.
                state.streak = 0;
                showToast("Keep going! New streak started today.", "info");
            }
        }
        
        state.lastActiveDate = todayStr;
        saveState();
    }
    document.getElementById('streak-count').textContent = state.streak;
}

// ==========================================
// NAVIGATION & TABS
// ==========================================
function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab & button
    const targetTab = document.getElementById(`tab-${tabId}`);
    const targetBtn = document.getElementById(`tab-${tabId}-btn`);
    
    if (targetTab && targetBtn) {
        targetTab.classList.add('active');
        targetBtn.classList.add('active');
    }
    
    // Specific tab loads
    if (tabId === 'analytics') {
        renderAnalytics();
    } else if (tabId === 'supplements') {
        renderInventory();
    } else if (tabId === 'today') {
        renderTodayChecklist();
    }
}

function getSupplementIcon(type) {
    switch (type) {
        case 'capsules': return '<i class="fa-solid fa-capsules"></i>';
        case 'droplet': return '<i class="fa-solid fa-droplet"></i>';
        case 'spoon': return '<i class="fa-solid fa-spoon"></i>';
        case 'syringe': return '<i class="fa-solid fa-syringe"></i>';
        default: return '<i class="fa-solid fa-pills"></i>';
    }
}

// ==========================================
// TAB 1: TODAY'S CHECKLIST & TRACKER
// ==========================================
function renderTodayChecklist() {
    const today = new Date();
    const todayDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, etc.
    const todayStr = getFormattedDate();
    
    // Filter supplements scheduled for today
    const todaysSupplements = state.supplements.filter(supp => 
        supp.days.includes(todayDayOfWeek)
    );
    
    const emptyState = document.getElementById('today-empty-state');
    const scheduleGroups = document.getElementById('schedule-groups');
    
    if (todaysSupplements.length === 0) {
        emptyState.style.display = 'flex';
        scheduleGroups.style.display = 'none';
        updateProgressRing(0, 0);
        return;
    }
    
    emptyState.style.display = 'none';
    scheduleGroups.style.display = 'flex';
    
    // Clean containers
    const containers = {
        morning: document.getElementById('items-morning'),
        afternoon: document.getElementById('items-afternoon'),
        evening: document.getElementById('items-evening')
    };
    
    Object.values(containers).forEach(c => {
        c.innerHTML = '';
        c.parentElement.style.display = 'none'; // Hide empty time slots
    });
    
    let totalScheduled = todaysSupplements.length;
    let totalTaken = 0;
    
    todaysSupplements.forEach(supp => {
        // Check if already taken today
        const isTaken = state.logs.some(log => log.date === todayStr && log.id === supp.id);
        if (isTaken) totalTaken++;
        
        const itemHtml = `
            <div class="checklist-item ${isTaken ? 'checked' : ''}" id="check-item-${supp.id}">
                <div class="checklist-left">
                    <label class="custom-checkbox-wrapper">
                        <input type="checkbox" ${isTaken ? 'checked' : ''} onchange="toggleSupplement('${supp.id}')">
                        <div class="checkbox-visual">
                            <i class="fa-solid fa-check"></i>
                        </div>
                    </label>
                    <div class="item-text-info">
                        <span class="item-name">${getSupplementIcon(supp.type)} &nbsp;${supp.name}</span>
                        <div class="item-dosage-notes">
                            <span class="dosage-badge">${supp.dosage}</span>
                            ${supp.notes ? `<span class="notes-text">• ${supp.notes}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="checklist-right">
                    ${supp.stock <= supp.limit ? `
                        <span class="stock-critical" style="font-size: 0.8rem; margin-right: 12px;">
                            <i class="fa-solid fa-triangle-exclamation"></i> Low Stock (${supp.stock})
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
        
        if (containers[supp.time]) {
            containers[supp.time].innerHTML += itemHtml;
            containers[supp.time].parentElement.style.display = 'flex';
        }
    });
    
    updateProgressRing(totalTaken, totalScheduled);
}

function updateProgressRing(taken, total) {
    const ratioText = document.getElementById('progress-ratio');
    const percentText = document.getElementById('progress-percent');
    const centerText = document.getElementById('progress-center-text');
    const circle = document.getElementById('progress-ring-circle');
    
    ratioText.textContent = `${taken} / ${total}`;
    
    const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;
    percentText.textContent = `${percentage}%`;
    centerText.textContent = `${percentage}%`;
    
    // SVG DashOffset math
    // Circumference = 2 * PI * r = 2 * 3.1415 * 50 = 314.15
    const circumference = 314.15;
    const offset = circumference - (percentage / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

function toggleSupplement(id) {
    const todayStr = getFormattedDate();
    const logIndex = state.logs.findIndex(log => log.date === todayStr && log.id === id);
    const supp = state.supplements.find(s => s.id === id);
    
    const itemCard = document.getElementById(`check-item-${id}`);
    
    if (logIndex > -1) {
        // Mark as Untaken
        state.logs.splice(logIndex, 1);
        if (supp && typeof supp.stock === 'number') {
            supp.stock++; // Put back the stock
        }
        itemCard.classList.remove('checked');
        showToast(`Unchecked ${supp ? supp.name : 'supplement'}.`, 'info');
    } else {
        // Mark as Taken
        state.logs.push({ date: todayStr, id: id });
        if (supp && typeof supp.stock === 'number') {
            supp.stock = Math.max(0, supp.stock - 1); // Consume 1 dose
        }
        itemCard.classList.add('checked');
        
        // Dynamic Streak Calculation on checking a task
        checkStreakAchievement();
        showToast(`Took ${supp ? supp.name : 'supplement'}. Daily log updated!`, 'success');
    }
    
    saveState();
    renderTodayChecklist();
}

function checkStreakAchievement() {
    const todayStr = getFormattedDate();
    
    // Get total tasks scheduled for today
    const todayDayOfWeek = new Date().getDay();
    const todaysScheduled = state.supplements.filter(supp => supp.days.includes(todayDayOfWeek));
    
    // Get total logs for today
    const todaysTaken = state.logs.filter(log => log.date === todayStr);
    
    // If today is completed completely, increase streak (if not already recorded today)
    if (todaysScheduled.length > 0 && todaysTaken.length === todaysScheduled.length) {
        // Verify if we already incremented streak today
        const yesterdayStr = getPastDateString(1);
        if (state.lastActiveDate === yesterdayStr || state.streak === 0) {
            state.streak++;
            document.getElementById('streak-count').textContent = state.streak;
            showToast(`Awesome! Daily routine completed! Streak: ${state.streak} days 🔥`, 'success');
        }
    }
}

// ==========================================
// TAB 2: INVENTORY & STOCK
// ==========================================
function renderInventory(filterQuery = "") {
    const grid = document.getElementById('inventory-grid');
    const emptyState = document.getElementById('inventory-empty-state');
    
    let filtered = state.supplements;
    if (filterQuery.trim()) {
        const query = filterQuery.toLowerCase();
        filtered = state.supplements.filter(s => s.name.toLowerCase().includes(query) || (s.notes && s.notes.toLowerCase().includes(query)));
    }
    
    if (state.supplements.length === 0) {
        emptyState.style.display = 'flex';
        grid.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    grid.style.display = 'grid';
    grid.innerHTML = '';
    
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    filtered.forEach(supp => {
        const isLow = supp.stock <= supp.limit;
        const fillPercent = supp.stock > 0 ? Math.min(100, Math.round((supp.stock / (supp.limit * 3 || 60)) * 100)) : 0;
        
        // Days conversion to readable string
        let freqText = "";
        if (supp.days.length === 7) {
            freqText = "Every day";
        } else {
            freqText = supp.days.map(d => dayNames[d]).join(', ');
        }
        
        const cardHtml = `
            <div class="inventory-card">
                <div class="card-top">
                    <div class="pill-icon-box">
                        ${getSupplementIcon(supp.type)}
                    </div>
                    <div class="supp-meta">
                        <span class="time-badge ${supp.time}">${supp.time}</span>
                        <span class="frequency-label">${freqText}</span>
                    </div>
                </div>
                
                <div class="card-details">
                    <h4>${supp.name}</h4>
                    <p class="card-notes">${supp.notes || 'No instructions provided.'}</p>
                </div>
                
                <div class="stock-status">
                    <div class="stock-labels">
                        <span class="dosage-value">${supp.dosage}</span>
                        <span class="stock-value ${isLow ? 'stock-critical' : ''}">
                            ${supp.stock} units left
                        </span>
                    </div>
                    <div class="stock-status-bar">
                        <div class="stock-fill ${isLow ? 'low' : ''}" style="width: ${fillPercent}%"></div>
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="btn-icon-only" onclick="openEditModal('${supp.id}')" title="Edit Supplement">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-icon-only delete" onclick="deleteSupplement('${supp.id}')" title="Delete Supplement">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        grid.innerHTML += cardHtml;
    });
}

function filterSupplements() {
    const q = document.getElementById('inventory-search').value;
    renderInventory(q);
}

// ==========================================
// MODAL & FORM CONTROLS
// ==========================================
function openAddModal() {
    document.getElementById('modal-title').textContent = "Add Supplement";
    document.getElementById('supplement-form').reset();
    document.getElementById('edit-id').value = "";
    document.getElementById('supp-type').value = "pills";
    
    // Check all days by default
    const dayCheckboxes = document.querySelectorAll('input[name="days"]');
    dayCheckboxes.forEach(cb => cb.checked = true);
    
    document.getElementById('supplement-modal').classList.add('active');
}

function openEditModal(id) {
    const supp = state.supplements.find(s => s.id === id);
    if (!supp) return;
    
    document.getElementById('modal-title').textContent = "Edit Supplement";
    document.getElementById('edit-id').value = supp.id;
    document.getElementById('supp-name').value = supp.name;
    document.getElementById('supp-dosage').value = supp.dosage;
    document.getElementById('supp-time').value = supp.time;
    document.getElementById('supp-type').value = supp.type || "pills";
    document.getElementById('supp-stock').value = supp.stock;
    document.getElementById('supp-limit').value = supp.limit;
    document.getElementById('supp-notes').value = supp.notes || "";
    
    // Check scheduled days
    const dayCheckboxes = document.querySelectorAll('input[name="days"]');
    dayCheckboxes.forEach(cb => {
        cb.checked = supp.days.includes(parseInt(cb.value));
    });
    
    document.getElementById('supplement-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('supplement-modal').classList.remove('active');
}

function saveSupplement(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('supp-name').value.trim();
    const dosage = document.getElementById('supp-dosage').value.trim();
    const time = document.getElementById('supp-time').value;
    const type = document.getElementById('supp-type').value;
    const stock = parseInt(document.getElementById('supp-stock').value) || 0;
    const limit = parseInt(document.getElementById('supp-limit').value) || 0;
    const notes = document.getElementById('supp-notes').value.trim();
    
    // Get checked days
    const dayCheckboxes = document.querySelectorAll('input[name="days"]:checked');
    const days = Array.from(dayCheckboxes).map(cb => parseInt(cb.value));
    
    if (days.length === 0) {
        showToast("Please select at least one day of the week.", "warning");
        return;
    }
    
    if (id) {
        // Edit Mode
        const index = state.supplements.findIndex(s => s.id === id);
        if (index > -1) {
            state.supplements[index] = { id, name, dosage, time, days, stock, limit, notes, type };
            showToast(`Updated "${name}".`, "success");
        }
    } else {
        // Add Mode
        const newSupp = {
            id: Date.now().toString(),
            name, dosage, time, days, stock, limit, notes, type
        };
        state.supplements.push(newSupp);
        showToast(`Added "${name}" to your supplements.`, "success");
    }
    
    saveState();
    closeModal();
    renderTodayChecklist();
    renderInventory();
    renderAnalytics();
}

function deleteSupplement(id) {
    const supp = state.supplements.find(s => s.id === id);
    if (!supp) return;
    
    if (confirm(`Are you sure you want to remove "${supp.name}"?`)) {
        state.supplements = state.supplements.filter(s => s.id !== id);
        
        // Also remove today's log if any
        const todayStr = getFormattedDate();
        state.logs = state.logs.filter(log => !(log.date === todayStr && log.id === id));
        
        saveState();
        showToast(`Removed "${supp.name}".`, "info");
        
        renderTodayChecklist();
        renderInventory();
        renderAnalytics();
    }
}

// ==========================================
// TAB 3: INSIGHTS & STATS (ANALYTICS)
// ==========================================
function renderAnalytics() {
    // 1. Total Taken
    document.getElementById('analytics-total-taken').textContent = state.logs.length;
    
    // 2. Low Stock items
    const lowStockCount = state.supplements.filter(s => s.stock <= s.limit).length;
    const lowStockEl = document.getElementById('analytics-low-stock');
    lowStockEl.textContent = lowStockCount;
    if (lowStockCount > 0) {
        lowStockEl.parentElement.parentElement.classList.add('critical-alert-card');
    } else {
        lowStockEl.parentElement.parentElement.classList.remove('critical-alert-card');
    }
    
    // 3. Adherence rate and 7 days chart
    generateAdherenceAndChart();
}

function generateAdherenceAndChart() {
    const chartContainer = document.getElementById('bar-chart-container');
    chartContainer.innerHTML = '';
    
    let totalScheduledCount = 0;
    let totalTakenCount = 0;
    
    // Calculate stats for the last 7 days (including today)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push(d);
    }
    
    const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    last7Days.forEach(date => {
        const dateStr = getFormattedDate(date);
        const dayOfWeek = date.getDay();
        
        // Scheduled supplements for this day of week
        const dayScheduled = state.supplements.filter(s => s.days.includes(dayOfWeek));
        // Taken on this date
        const dayTaken = state.logs.filter(l => l.date === dateStr);
        
        totalScheduledCount += dayScheduled.length;
        totalTakenCount += dayTaken.length;
        
        // Adherence percentage for this day
        const percentage = dayScheduled.length > 0 ? Math.round((dayTaken.length / dayScheduled.length) * 100) : 0;
        
        // Height calculation for the bar (max height 180px)
        const barHeight = Math.max(10, Math.round((percentage / 100) * 180));
        
        const isToday = dateStr === getFormattedDate();
        
        const barHtml = `
            <div class="chart-bar-wrapper">
                <div class="chart-bar-fill" style="height: ${barHeight}px; background: ${isToday ? 'linear-gradient(to top, var(--accent-teal-dark), #00fad0)' : ''}">
                    <span class="chart-bar-val">${percentage}%</span>
                </div>
                <span class="chart-bar-label" style="font-weight: ${isToday ? '700' : '400'}; color: ${isToday ? 'var(--accent-teal)' : ''}">
                    ${weekdayShort[dayOfWeek]}
                </span>
            </div>
        `;
        chartContainer.innerHTML += barHtml;
    });
    
    // Average Adherence Score
    const averageAdherence = totalScheduledCount > 0 ? Math.round((totalTakenCount / totalScheduledCount) * 100) : 0;
    document.getElementById('analytics-adherence').textContent = `${averageAdherence}%`;
}

// ==========================================
// TAB 4: DATA CONTROLS (SETTINGS)
// ==========================================
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `supplement_sync_backup_${getFormattedDate()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Backup exported successfully!", "success");
}

function importData(e) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedState = JSON.parse(event.target.result);
            if (importedState.supplements && importedState.logs) {
                state = importedState;
                saveState();
                showToast("Backup imported successfully!", "success");
                
                // Refresh all UI tabs
                updateDateDisplay();
                checkDailyReset();
                renderTodayChecklist();
                renderInventory();
                renderAnalytics();
            } else {
                showToast("Invalid backup file structure.", "error");
            }
        } catch (err) {
            showToast("Failed to parse JSON file.", "error");
        }
    };
    if (e.target.files[0]) {
        fileReader.readAsText(e.target.files[0]);
    }
}

function resetAllData() {
    if (confirm("Are you sure you want to restore default settings? This will delete all your custom supplements and history log.")) {
        localStorage.removeItem('supplement_sync_state');
        setupDefaultState();
        showToast("App reset successfully.", "info");
        
        // Refresh UI
        renderTodayChecklist();
        renderInventory();
        renderAnalytics();
        switchTab('today');
    }
}

// ==========================================
// TOAST NOTIFICATIONS HELPER
// ==========================================
function showToast(message, type = "success") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = "fa-check-circle";
    if (type === "error") iconClass = "fa-circle-xmark";
    else if (type === "warning") iconClass = "fa-triangle-exclamation";
    else if (type === "info") iconClass = "fa-circle-info";
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Animation trigger
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3000);
}

// ==========================================
// AI SCANNER & API KEY ACTIONS
// ==========================================
function saveApiKey() {
    const keyVal = document.getElementById('api-key-input').value.trim();
    state.geminiApiKey = keyVal;
    saveState();
    showToast("Gemini API Key saved successfully!", "success");
}

function clearApiKey() {
    document.getElementById('api-key-input').value = "";
    state.geminiApiKey = "";
    saveState();
    showToast("Gemini API Key cleared.", "info");
}

let mediaStream = null;

function initiateScan() {
    // Show modal
    const modal = document.getElementById('scanner-modal');
    modal.classList.add('active');
    
    const video = document.getElementById('scanner-video');
    const placeholder = document.getElementById('scanner-placeholder');
    const laser = document.querySelector('.scan-laser');
    
    // Hide laser by default until stream starts
    laser.style.display = 'none';
    placeholder.style.display = 'flex';
    
    // Request camera access
    navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
    })
    .then(stream => {
        mediaStream = stream;
        video.srcObject = stream;
        video.style.display = 'block';
        placeholder.style.display = 'none';
        laser.style.display = 'block';
    })
    .catch(err => {
        console.warn("Could not access camera, running in upload-only mode:", err);
        video.style.display = 'none';
        placeholder.innerHTML = `
            <i class="fa-solid fa-video-slash" style="font-size: 2.5rem; opacity: 0.6; color: var(--text-muted);"></i>
            <p style="margin-top: 8px;">Webcam not accessible.<br>Please upload a photo instead.</p>
        `;
        placeholder.style.display = 'flex';
    });
}

function closeScanner() {
    // Stop camera track
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    
    const video = document.getElementById('scanner-video');
    if (video) video.srcObject = null;
    
    const modal = document.getElementById('scanner-modal');
    modal.classList.remove('active');
    
    // Reset loader overlay
    document.getElementById('scanner-loading').style.display = 'none';
}

function captureFrame() {
    if (!mediaStream) {
        showToast("Camera is not active. Please upload a photo instead.", "warning");
        return;
    }
    
    const video = document.getElementById('scanner-video');
    const canvas = document.getElementById('scanner-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions equal to video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get base64 string
    const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
    processImage(base64Data);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result.split(',')[1];
        processImage(base64Data);
    };
    reader.readAsDataURL(file);
}

function processImage(base64Data) {
    const loader = document.getElementById('scanner-loading');
    loader.style.display = 'flex';
    
    if (state.geminiApiKey && state.geminiApiKey.trim() !== "") {
        // Real Gemini API call
        callGeminiAPI(base64Data);
    } else {
        // Run in Demo/Mock Mode
        setTimeout(() => {
            // Generate some random premium supplement mock data
            const mockSupps = [
                { name: "NMN (Nicotinamide Mononucleotide)", dosage: "250 mg (1 capsule)", notes: "Take in the morning on an empty stomach for cellular energy support." },
                { name: "Coenzyme Q10 (CoQ10)", dosage: "100 mg (1 softgel)", notes: "Take in the morning with a meal containing fats to support cellular energy." },
                { name: "Vitamin B-Complex", dosage: "1 capsule", notes: "Take with breakfast. Gives energy boost." },
                { name: "L-Theanine", dosage: "200 mg (1 capsule)", notes: "Take in the evening. Helps with relaxation." }
            ];
            
            // Pick a random one
            const picked = mockSupps[Math.floor(Math.random() * mockSupps.length)];
            
            autofillForm(picked.name, picked.dosage, picked.notes);
            loader.style.display = 'none';
            closeScanner();
            showToast("Demo Scan successful! Auto-filled fields.", "success");
        }, 1500);
    }
}

function callGeminiAPI(base64Data) {
    const apiKey = state.geminiApiKey.trim();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const promptText = `Analyze this supplement or vitamin label photo. Extract the following details and return ONLY a JSON object (no markdown, no backticks) with the keys:
- "name": The clear brand and name of the supplement (e.g. "Nordic Naturals Omega-3").
- "dosage": The recommended serving size or dosage (e.g. "2 softgels", "1 scoop").
- "notes": Instructions on how to take it (e.g. "Take with food", "Keep refrigerated") or brief health benefits.

Format of response MUST be pure JSON with this schema:
{
  "name": "string",
  "dosage": "string",
  "notes": "string"
}
If a detail cannot be found, return an empty string for that field. Do not include markdown wraps.`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: promptText },
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: base64Data
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };
    
    fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        const textResponse = data.candidates[0].content.parts[0].text;
        try {
            const parsed = JSON.parse(textResponse.trim());
            autofillForm(parsed.name || "", parsed.dosage || "", parsed.notes || "");
            showToast("AI Scan successful! Supplement details imported.", "success");
        } catch (parseErr) {
            console.error("JSON parsing error:", textResponse, parseErr);
            showToast("AI response format was unexpected, please try again.", "error");
        }
    })
    .catch(err => {
        console.error("Gemini API Error:", err);
        showToast("AI Scanner failed: " + err.message, "error");
    })
    .finally(() => {
        document.getElementById('scanner-loading').style.display = 'none';
        closeScanner();
    });
}

function autofillForm(name, dosage, notes) {
    // Open add modal if not already open
    const modal = document.getElementById('supplement-modal');
    if (!modal.classList.contains('active')) {
        openAddModal();
    }
    
    if (name) document.getElementById('supp-name').value = name;
    if (dosage) document.getElementById('supp-dosage').value = dosage;
    if (notes) document.getElementById('supp-notes').value = notes;
}

// ==========================================
// SAFETY AUDIT & COMPATIBILITY CHECK
// ==========================================
let currentLocalAuditResults = [];

function checkSafetyAndInteractions() {
    const modal = document.getElementById('safety-modal');
    modal.classList.add('active');
    
    const resultsContainer = document.getElementById('safety-audit-results');
    resultsContainer.innerHTML = `<div style="display:flex; justify-content:center; padding: 2rem;"><div class="spinner" style="width:30px; height:30px;"></div></div>`;
    
    document.getElementById('ai-consent-box').style.display = 'none';
    
    if (state.supplements.length === 0) {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <i class="fa-solid fa-clipboard-question" style="font-size: 2.5rem; opacity: 0.5; margin-bottom: 12px; display: block;"></i>
                <p>Your inventory is empty. Add supplements first to run a safety audit.</p>
            </div>
        `;
        return;
    }
    
    // Fetch local interactions
    fetch('interactions.json')
    .then(response => {
        if (!response.ok) throw new Error("Could not load local safety database");
        return response.json();
    })
    .then(rules => {
        runLocalAudit(rules);
    })
    .catch(err => {
        console.error("Local safety audit load error:", err);
        resultsContainer.innerHTML = `<p style="color: #ef4444; text-align:center;">Failed to load safety database.</p>`;
    });
}

function runLocalAudit(rules) {
    const resultsContainer = document.getElementById('safety-audit-results');
    const matchedConflicts = [];
    const activeSuppNames = state.supplements.map(s => s.name.toLowerCase());
    
    // Check conflicts
    rules.forEach(rule => {
        const matchingIngredients = rule.ingredients.filter(ing => {
            return activeSuppNames.some(suppName => suppName.includes(ing.toLowerCase()));
        });
        
        // If all ingredients of the conflict rule are present, it's a conflict
        if (matchingIngredients.length === rule.ingredients.length) {
            matchedConflicts.push(rule);
        }
    });
    
    currentLocalAuditResults = matchedConflicts;
    renderAuditResults(matchedConflicts);
    
    // Check if there are active supplements not covered by the local interactions database
    const allKnownIngredients = new Set();
    rules.forEach(rule => rule.ingredients.forEach(ing => allKnownIngredients.add(ing.toLowerCase())));
    
    const uncoveredSupplements = state.supplements.filter(s => {
        const nameLower = s.name.toLowerCase();
        return !Array.from(allKnownIngredients).some(ing => nameLower.includes(ing));
    });
    
    if (uncoveredSupplements.length > 0) {
        const consentBox = document.getElementById('ai-consent-box');
        const consentMessage = document.getElementById('ai-consent-message');
        const listNames = uncoveredSupplements.map(s => `"${s.name}"`).join(', ');
        
        consentMessage.innerHTML = `Our local database does not contain safety rules for: <strong>${listNames}</strong>. Would you like to run a deep AI compatibility audit using the Gemini API?`;
        consentBox.style.display = 'block';
    } else {
        document.getElementById('ai-consent-box').style.display = 'none';
    }
}

function renderAuditResults(conflicts) {
    const resultsContainer = document.getElementById('safety-audit-results');
    
    let html = `
        <h4 style="margin-bottom: 1.25rem; color: #ffffff;"><i class="fa-solid fa-stethoscope" style="color: var(--accent-teal);"></i> Audit Results</h4>
    `;
    
    if (conflicts.length === 0) {
        html += `
            <div class="safety-card success">
                <i class="fa-solid fa-circle-check safety-card-icon"></i>
                <div class="safety-card-content">
                    <h5>No Conflicts Found</h5>
                    <p>All supplements checked are compatible. Keep it up!</p>
                </div>
            </div>
        `;
    } else {
        conflicts.forEach(conflict => {
            const isDanger = conflict.type === 'danger';
            const icon = isDanger ? 'fa-triangle-exclamation' : 'fa-circle-exclamation';
            const severityClass = isDanger ? 'danger' : 'warning';
            
            html += `
                <div class="safety-card ${severityClass}">
                    <i class="fa-solid ${icon} safety-card-icon"></i>
                    <div class="safety-card-content">
                        <h5>${conflict.type}</h5>
                        <p>${conflict.message}</p>
                    </div>
                </div>
            `;
        });
    }
    
    // Add Medical Disclaimer
    html += `
        <div class="safety-disclaimer">
            <p>
                <strong>⚠️ Disclaimer:</strong> This safety audit is for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a physician or healthcare provider before starting, stopping, or changing any supplement schedule.
            </p>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
}

function closeSafetyModal() {
    document.getElementById('safety-modal').classList.remove('active');
}

function dismissAIConsent() {
    document.getElementById('ai-consent-box').style.display = 'none';
}

function runAISafetyCheck() {
    if (!state.geminiApiKey || state.geminiApiKey.trim() === "") {
        showToast("Please enter a Gemini API Key in Settings to run the AI check.", "warning");
        return;
    }
    
    const resultsContainer = document.getElementById('safety-audit-results');
    resultsContainer.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 3rem; gap:16px;">
            <div class="spinner"></div>
            <p style="color: var(--accent-teal); font-weight:600; animation: pulse 1.5s infinite;">Gemini AI conducting safety audit...</p>
        </div>
    `;
    document.getElementById('ai-consent-box').style.display = 'none';
    
    const apiKey = state.geminiApiKey.trim();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const suppList = state.supplements.map(s => `- ${s.name} (${s.dosage || "no dosage specified"})`).join('\n');
    
    const promptText = `Analyze this list of supplements for potential negative interactions, competitive absorption, dosage overlaps, or warnings. Consider synergistic benefits too.
Supplements List:
${suppList}

Format your response as a clean JSON array (no markdown wraps, no backticks) where each object has these keys:
- "type": "warning" or "danger"
- "message": A concise, clear explanation of the interaction and action-item advice.
- "ingredients": An array of ingredients involved.

If there are absolutely no interactions, return an empty array [].
Respond ONLY with the raw JSON array.`;

    const requestBody = {
        contents: [
            {
                parts: [{ text: promptText }]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };
    
    fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
        return response.json();
    })
    .then(data => {
        const textResponse = data.candidates[0].content.parts[0].text;
        try {
            const aiConflicts = JSON.parse(textResponse.trim());
            
            // Combine with local conflicts
            const combined = [...currentLocalAuditResults, ...aiConflicts];
            
            // Deduplicate conflicts by message
            const unique = [];
            const seen = new Set();
            combined.forEach(c => {
                if (!seen.has(c.message)) {
                    seen.add(c.message);
                    unique.push(c);
                }
            });
            
            renderAuditResults(unique);
            showToast("Gemini AI Safety Audit completed!", "success");
        } catch (parseErr) {
            console.error("AI JSON parsing error:", textResponse, parseErr);
            showToast("Failed to parse AI response. Please try again.", "error");
            renderAuditResults(currentLocalAuditResults);
        }
    })
    .catch(err => {
        console.error("AI Safety Check Error:", err);
        showToast("AI Safety Check failed: " + err.message, "error");
        renderAuditResults(currentLocalAuditResults);
    });
}
