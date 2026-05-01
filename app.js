if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Basic app logic for sourdough tracking can be added here
// For example, stages: feed starter, mix dough, bulk fermentation, etc.

document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('add-btn');
    const subtractBtn = document.getElementById('subtract-btn');
    const clearBtn = document.getElementById('clear-btn');
    const gramsInput = document.getElementById('grams');
    const entriesList = document.getElementById('entries-list');
    const totalSpan = document.getElementById('total');

    let total = 0;

    // Load saved data
    loadData();

    addBtn.addEventListener('click', () => {
        handleInput(true);
    });

    subtractBtn.addEventListener('click', () => {
        handleInput(false);
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all history?')) {
            localStorage.removeItem('sourdoughEntries');
            localStorage.removeItem('sourdoughTotal');
            entriesList.innerHTML = '';
            total = 0;
            updateTotal();
        }
    });

    function handleInput(isAdd) {
        const grams = gramsInput.value.trim();
        if (grams && !isNaN(grams) && parseFloat(grams) > 0) {
            const value = parseFloat(grams);
            const addition = isAdd ? value : -value;
            total += addition;
            const timestamp = getCETTimestamp();
            const entry = { addition, timestamp, total };
            saveEntry(entry);
            displayEntry(entry);
            updateTotal();
            gramsInput.value = '';
        } else {
            alert('Please enter a valid positive number in grams.');
        }
    }

    function getCETTimestamp() {
        const now = new Date();
        const cetOffset = 1; // CET is UTC+1, adjust for DST if needed
        const cetTime = new Date(now.getTime() + (cetOffset * 60 * 60 * 1000));
        const dateStr = cetTime.toISOString().slice(0, 10).split('-').reverse().join('/'); // DD/MM/YYYY
        const timeStr = cetTime.toISOString().slice(11, 16); // HH:MM
        return `${dateStr} ${timeStr}`;
    }

    function saveEntry(entry) {
        const entries = JSON.parse(localStorage.getItem('sourdoughEntries') || '[]');
        entries.push(entry);
        localStorage.setItem('sourdoughEntries', JSON.stringify(entries));
        localStorage.setItem('sourdoughTotal', total.toString());
    }

    function loadData() {
        total = parseFloat(localStorage.getItem('sourdoughTotal') || '0');
        updateTotal();
        const entries = JSON.parse(localStorage.getItem('sourdoughEntries') || '[]');
        entries.forEach(displayEntry);
    }

    function displayEntry(entry) {
        const li = document.createElement('li');
        const sign = entry.addition >= 0 ? '+' : '';
        li.textContent = `${sign}${entry.addition}g at ${entry.timestamp} (Total: ${entry.total}g)`;
        entriesList.appendChild(li);
    }

    function updateTotal() {
        totalSpan.textContent = total;
    }
});