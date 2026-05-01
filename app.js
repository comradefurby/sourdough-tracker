// ============================================
// Service Worker Registration
// ============================================

// Check if the browser supports service workers
if ('serviceWorker' in navigator) {
    // Register the service worker when the window loads
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

// ============================================
// Main App Logic - Sourdough Tracker
// ============================================

// Run this code when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements by their ID
    const addBtn = document.getElementById('add-btn');
    const subtractBtn = document.getElementById('subtract-btn');
    const clearBtn = document.getElementById('clear-btn');
    const gramsInput = document.getElementById('grams');
    const entriesList = document.getElementById('entries-list');
    const totalSpan = document.getElementById('total');

    // Initialize total grams counter to 0
    let total = 0;

    // Load any previously saved data from localStorage
    loadData();

    // Add click event listener to the Add button
    addBtn.addEventListener('click', () => {
        handleInput(true); // true = add grams
    });

    // Add click event listener to the Subtract button
    subtractBtn.addEventListener('click', () => {
        handleInput(false); // false = subtract grams
    });

    // Add click event listener to the Clear History button
    clearBtn.addEventListener('click', () => {
        // Ask for confirmation before clearing
        if (confirm('Are you sure you want to clear all history?')) {
            // Remove data from localStorage (browser's persistent storage)
            localStorage.removeItem('sourdoughEntries');
            localStorage.removeItem('sourdoughTotal');
            // Clear the displayed list and reset total to 0
            entriesList.innerHTML = '';
            total = 0;
            updateTotal();
        }
    });

    // Handle input from the grams field
    function handleInput(isAdd) {
        // Get the value from the input field and remove leading/trailing whitespace
        const grams = gramsInput.value.trim();
        // Validate: must exist, must be a number, must be positive
        if (grams && !isNaN(grams) && parseFloat(grams) > 0) {
            // Convert string to floating point number
            const value = parseFloat(grams);
            // If isAdd is true, add the value; otherwise subtract (negative)
            const addition = isAdd ? value : -value;
            // Update the running total
            total += addition;
            // Get current timestamp in CET timezone
            const timestamp = getCETTimestamp();
            // Create entry object with the addition value, timestamp, and running total
            const entry = { addition, timestamp, total };
            // Save to localStorage and display on page
            saveEntry(entry);
            displayEntry(entry);
            updateTotal();
            // Clear the input field for the next entry
            gramsInput.value = '';
        } else {
            // Show error message for invalid input
            alert('Please enter a valid positive number in grams.');
        }
    }

    // Generate timestamp in CET (Central European Time)
    function getCETTimestamp() {
        const now = new Date(); // Get current date/time
        const cetOffset = 1; // CET is UTC+1, adjust for DST if needed
        const cetTime = new Date(now.getTime() + (cetOffset * 60 * 60 * 1000));
        // Format date as DD/MM/YYYY by splitting ISO string and reversing
        const dateStr = cetTime.toISOString().slice(0, 10).split('-').reverse().join('/');
        // Extract time portion HH:MM from ISO string
        const timeStr = cetTime.toISOString().slice(11, 16);
        // Return formatted timestamp
        return `${dateStr} ${timeStr}`;
    }

    // Save an entry to localStorage (browser's persistent storage)
    function saveEntry(entry) {
        // Get existing entries from localStorage, or empty array if none exist
        const entries = JSON.parse(localStorage.getItem('sourdoughEntries') || '[]');
        // Add the new entry to the end of the array
        entries.push(entry);
        // Save the updated array back to localStorage as a JSON string
        localStorage.setItem('sourdoughEntries', JSON.stringify(entries));
        // Also save the current total separately
        localStorage.setItem('sourdoughTotal', total.toString());
    }

    // Load saved data from localStorage when the app starts
    function loadData() {
        // Get the saved total from localStorage, default to 0 if not found
        total = parseFloat(localStorage.getItem('sourdoughTotal') || '0');
        // Update the displayed total on the page
        updateTotal();
        // Get all saved entries from localStorage
        const entries = JSON.parse(localStorage.getItem('sourdoughEntries') || '[]');
        // Loop through each saved entry and display it
        entries.forEach(displayEntry);
    }

    // Display a single entry in the list
    function displayEntry(entry) {
        // Create a new list item (li) element
        const li = document.createElement('li');
        // Add plus sign for positive numbers, nothing for negative
        const sign = entry.addition >= 0 ? '+' : '';
        // Set the text content of the list item
        li.textContent = `${sign}${entry.addition}g at ${entry.timestamp} (Total: ${entry.total}g)`;
        // Add the new list item to the entries list
        entriesList.appendChild(li);
    }

    // Update the displayed total on the page
    function updateTotal() {
        totalSpan.textContent = total;
    }
});