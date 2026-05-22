// Unit Converter Pro - JavaScript

// Conversion data
const conversions = {
    length: {
        name: 'Length',
        units: {
            mm: { name: 'Millimeter (mm)', factor: 1 },
            cm: { name: 'Centimeter (cm)', factor: 10 },
            m: { name: 'Meter (m)', factor: 1000 },
            km: { name: 'Kilometer (km)', factor: 1000000 },
            inch: { name: 'Inch (in)', factor: 25.4 },
            foot: { name: 'Foot (ft)', factor: 304.8 },
            yard: { name: 'Yard (yd)', factor: 914.4 },
            mile: { name: 'Mile (mi)', factor: 1609344 }
        },
        baseUnit: 'mm'
    },
    weight: {
        name: 'Weight',
        units: {
            mg: { name: 'Milligram (mg)', factor: 1 },
            g: { name: 'Gram (g)', factor: 1000 },
            kg: { name: 'Kilogram (kg)', factor: 1000000 },
            oz: { name: 'Ounce (oz)', factor: 28349.5 },
            lb: { name: 'Pound (lb)', factor: 453592 },
            ton: { name: 'Metric Ton (t)', factor: 1000000000 }
        },
        baseUnit: 'mg'
    },
    temperature: {
        name: 'Temperature',
        units: {
            c: { name: 'Celsius (°C)' },
            f: { name: 'Fahrenheit (°F)' },
            k: { name: 'Kelvin (K)' }
        },
        baseUnit: 'c'
    },
    volume: {
        name: 'Volume',
        units: {
            ml: { name: 'Milliliter (ml)', factor: 1 },
            l: { name: 'Liter (l)', factor: 1000 },
            gallon: { name: 'US Gallon (gal)', factor: 3785.41 },
            pint: { name: 'US Pint (pt)', factor: 473.176 },
            cup: { name: 'Cup (cup)', factor: 236.588 },
            tsp: { name: 'Teaspoon (tsp)', factor: 4.92892 },
            tbsp: { name: 'Tablespoon (tbsp)', factor: 14.7868 }
        },
        baseUnit: 'ml'
    },
    time: {
        name: 'Time',
        units: {
            ms: { name: 'Millisecond (ms)', factor: 1 },
            s: { name: 'Second (s)', factor: 1000 },
            min: { name: 'Minute (min)', factor: 60000 },
            h: { name: 'Hour (h)', factor: 3600000 },
            day: { name: 'Day (day)', factor: 86400000 },
            week: { name: 'Week (week)', factor: 604800000 },
            month: { name: 'Month (30d)', factor: 2592000000 },
            year: { name: 'Year (365d)', factor: 31536000000 }
        },
        baseUnit: 'ms'
    },
    speed: {
        name: 'Speed',
        units: {
            ms: { name: 'Meter/Second (m/s)', factor: 1 },
            kmh: { name: 'Kilometer/Hour (km/h)', factor: 0.277778 },
            mph: { name: 'Mile/Hour (mph)', factor: 0.44704 },
            knot: { name: 'Knot (kt)', factor: 0.51444 }
        },
        baseUnit: 'ms'
    }
};

// DOM Elements
const inputValue = document.getElementById('inputValue');
const outputValue = document.getElementById('outputValue');
const fromUnit = document.getElementById('fromUnit');
const toUnit = document.getElementById('toUnit');
const swapBtn = document.getElementById('swapBtn');
const categoryButtons = document.querySelectorAll('.category-btn');
const formulaDisplay = document.getElementById('formulaDisplay');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const quickGrid = document.getElementById('quickGrid');

// State
let currentCategory = 'length';
let conversionHistory = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    initializeCategory('length');
    addEventListeners();
    displayQuickConversions();
});

// Event Listeners
function addEventListeners() {
    inputValue.addEventListener('input', performConversion);
    fromUnit.addEventListener('change', performConversion);
    toUnit.addEventListener('change', performConversion);
    swapBtn.addEventListener('click', swapUnits);
    clearHistoryBtn.addEventListener('click', clearHistory);

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            initializeCategory(e.target.dataset.category);
        });
    });
}

// Initialize category
function initializeCategory(category) {
    currentCategory = category;
    const categoryData = conversions[category];

    // Clear inputs
    inputValue.value = '';
    outputValue.value = '';

    // Populate unit dropdowns
    fromUnit.innerHTML = '';
    toUnit.innerHTML = '';

    const units = Object.entries(categoryData.units);
    units.forEach(([key, unit]) => {
        fromUnit.innerHTML += `<option value="${key}">${unit.name}</option>`;
        toUnit.innerHTML += `<option value="${key}">${unit.name}</option>`;
    });

    // Set default units
    if (category === 'temperature') {
        toUnit.value = 'f';
    } else {
        toUnit.value = units[units.length - 1][0];
    }

    formulaDisplay.textContent = 'Select a conversion to see the formula';
}

// Perform conversion
function performConversion() {
    const value = parseFloat(inputValue.value);

    if (isNaN(value) || value === '') {
        outputValue.value = '';
        formulaDisplay.textContent = 'Enter a value to see the formula';
        return;
    }

    const categoryData = conversions[currentCategory];
    const from = fromUnit.value;
    const to = toUnit.value;

    let result;
    let formula;

    if (currentCategory === 'temperature') {
        result = convertTemperature(value, from, to);
        formula = getTemperatureFormula(value, from, to);
    } else {
        const baseFactor = categoryData.units[from].factor;
        const toFactor = categoryData.units[to].factor;
        result = (value * baseFactor) / toFactor;
        formula = `${value} ${categoryData.units[from].name.split(' ')[0]} × ${baseFactor} ÷ ${toFactor} = ${result.toFixed(6)} ${categoryData.units[to].name.split(' ')[0]}`;
    }

    outputValue.value = formatResult(result);
    formulaDisplay.textContent = formula;

    // Add to history
    addToHistory(value, from, result, to);
}

// Temperature conversion
function convertTemperature(value, from, to) {
    let celsius;

    // Convert to Celsius
    if (from === 'c') celsius = value;
    else if (from === 'f') celsius = (value - 32) * 5 / 9;
    else if (from === 'k') celsius = value - 273.15;

    // Convert from Celsius
    if (to === 'c') return celsius;
    else if (to === 'f') return (celsius * 9 / 5) + 32;
    else if (to === 'k') return celsius + 273.15;
}

// Temperature formula
function getTemperatureFormula(value, from, to) {
    const unitMap = {
        c: '°C',
        f: '°F',
        k: 'K'
    };

    if (from === 'c' && to === 'f') return `(${value} × 9/5) + 32 = ${(value * 9 / 5 + 32).toFixed(2)}°F`;
    if (from === 'f' && to === 'c') return `(${value} - 32) × 5/9 = ${((value - 32) * 5 / 9).toFixed(2)}°C`;
    if (from === 'c' && to === 'k') return `${value} + 273.15 = ${(value + 273.15).toFixed(2)}K`;
    if (from === 'k' && to === 'c') return `${value} - 273.15 = ${(value - 273.15).toFixed(2)}°C`;
    if (from === 'f' && to === 'k') return `((${value} - 32) × 5/9) + 273.15 = ${((value - 32) * 5 / 9 + 273.15).toFixed(2)}K`;
    if (from === 'k' && to === 'f') return `(${value} - 273.15) × 9/5 + 32 = ${((value - 273.15) * 9 / 5 + 32).toFixed(2)}°F`;
}

// Format result
function formatResult(value) {
    if (value === 0) return '0';
    if (Math.abs(value) < 0.0001 || Math.abs(value) > 1000000) {
        return value.toExponential(6);
    }
    return parseFloat(value.toFixed(6)).toString();
}

// Swap units
function swapUnits() {
    const temp = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = temp;
    performConversion();
}

// History management
function addToHistory(from, fromUnit, to, toUnit) {
    if (from === '' || isNaN(from)) return;

    const historyItem = {
        from: parseFloat(from),
        fromUnit: fromUnit,
        to: parseFloat(to),
        toUnit: toUnit,
        timestamp: new Date(),
        category: currentCategory
    };

    conversionHistory.unshift(historyItem);
    if (conversionHistory.length > 20) conversionHistory.pop();

    saveHistory();
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = '';

    if (conversionHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-history">No conversions yet</p>';
        clearHistoryBtn.disabled = true;
        return;
    }

    clearHistoryBtn.disabled = false;

    conversionHistory.forEach((item, index) => {
        const categoryData = conversions[item.category];
        const fromName = categoryData.units[item.fromUnit].name.split(' ')[0];
        const toName = categoryData.units[item.toUnit].name.split(' ')[0];
        const time = formatTime(item.timestamp);

        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-item-content">
                ${item.from.toFixed(2)} ${fromName} → ${item.to.toFixed(2)} ${toName}
            </div>
            <span class="history-item-time">${time}</span>
        `;

        historyItem.addEventListener('click', () => {
            inputValue.value = item.from;
            fromUnit.value = item.fromUnit;
            toUnit.value = item.toUnit;
            performConversion();
        });

        historyList.appendChild(historyItem);
    });
}

function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
}

function clearHistory() {
    if (confirm('Clear all conversion history?')) {
        conversionHistory = [];
        saveHistory();
        renderHistory();
    }
}

// Local Storage
function saveHistory() {
    localStorage.setItem('converterHistory', JSON.stringify(conversionHistory));
}

function loadHistory() {
    const saved = localStorage.getItem('converterHistory');
    if (saved) {
        conversionHistory = JSON.parse(saved).map(item => ({
            ...item,
            timestamp: new Date(item.timestamp)
        }));
        renderHistory();
    }
}

// Quick Conversions
function displayQuickConversions() {
    const quickConversions = [
        { value: 1, from: 'km', to: 'mile', label: 'km to miles' },
        { value: 100, from: 'f', to: 'c', label: '°F to °C' },
        { value: 1, from: 'kg', to: 'lb', label: 'kg to lbs' },
        { value: 1, from: 'l', to: 'gallon', label: 'liters to gal' }
    ];

    quickGrid.innerHTML = '';

    quickConversions.forEach(quick => {
        const categoryData = conversions[currentCategory] || conversions[getQuickCategory(quick.from)];
        
        const card = document.createElement('div');
        card.className = 'quick-card';

        let result;
        if (quick.label.includes('to °C')) {
            result = convertTemperature(quick.value, quick.from, quick.to);
        } else {
            const fromData = categoryData.units[quick.from];
            const toData = categoryData.units[quick.to];
            result = (quick.value * fromData.factor) / toData.factor;
        }

        card.innerHTML = `
            <div class="quick-card-value">${result.toFixed(2)}</div>
            <div class="quick-card-label">${quick.label}</div>
        `;

        card.addEventListener('click', () => {
            inputValue.value = quick.value;
            
            // Find and activate correct category
            for (let cat in conversions) {
                if (conversions[cat].units[quick.from]) {
                    document.querySelector(`[data-category="${cat}"]`).click();
                    setTimeout(() => {
                        fromUnit.value = quick.from;
                        toUnit.value = quick.to;
                        performConversion();
                    }, 100);
                    break;
                }
            }
        });

        quickGrid.appendChild(card);
    });
}

function getQuickCategory(unit) {
    for (let category in conversions) {
        if (conversions[category].units[unit]) {
            return category;
        }
    }
    return 'length';
}
