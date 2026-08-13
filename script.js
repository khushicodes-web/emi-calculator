// Inputs & Displays
const loan = document.getElementById("loan");
const rate = document.getElementById("rate");
const time = document.getElementById("time");

const loanValue = document.getElementById("loanValue");
const rateValue = document.getElementById("rateValue");
const timeValue = document.getElementById("timeValue");

const result = document.getElementById("result");
const principalText = document.getElementById("principalText");
const interestText = document.getElementById("interestText");
const paymentText = document.getElementById("paymentText");

let chart;
let visibleYearsCount = 5; // Initial 5 years view
let calculatedAmortData = []; // Calculated schedule data

// 19 World Currencies & Locales Database
const currencyConfig = {
    INR: { symbol: "₹", locale: "en-IN" },
    USD: { symbol: "$", locale: "en-US" },
    GBP: { symbol: "£", locale: "en-GB" },
    EUR: { symbol: "€", locale: "de-DE" },
    CAD: { symbol: "C$", locale: "en-CA" },
    AUD: { symbol: "A$", locale: "en-AU" },
    AED: { symbol: "AED ", locale: "ar-AE" },
    SAR: { symbol: "SAR ", locale: "ar-SA" },
    JPY: { symbol: "¥", locale: "ja-JP" },
    CNY: { symbol: "¥", locale: "zh-CN" },
    KRW: { symbol: "₩", locale: "ko-KR" },
    SGD: { symbol: "S$", locale: "en-SG" },
    NZD: { symbol: "NZ$", locale: "en-NZ" },
    BRL: { symbol: "R$", locale: "pt-BR" },
    RUB: { symbol: "₽", locale: "ru-RU" },
    MXN: { symbol: "$", locale: "es-MX" },
    ZAR: { symbol: "R ", locale: "en-ZA" },
    CHF: { symbol: "CHF ", locale: "de-CH" },
    SEK: { symbol: "kr ", locale: "sv-SE" }
};

let currentCurrency = "INR";
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Loan Presets
const loanData = {
    home: { title: "Home Loan EMI Calculator", amount: 300000, rate: 6.5, tenure: 20 },
    car: { title: "Car Loan EMI Calculator", amount: 800000, rate: 9.0, tenure: 5 },
    personal: { title: "Personal Loan EMI Calculator", amount: 200000, rate: 12.0, tenure: 3 },
    education: { title: "Education Loan EMI Calculator", amount: 1000000, rate: 9.5, tenure: 7 }
};

// Formatting Helper with Selected Currency
function formatCurrency(val) {
    const config = currencyConfig[currentCurrency] || currencyConfig.INR;
    return config.symbol + Number(val).toLocaleString(config.locale, { maximumFractionDigits: 0 });
}

// --- CUSTOM XE-STYLE DROPDOWN LOGIC (HD IMAGE FLAGS SUPPORT) ---
function toggleCurrencyMenu() {
    const menu = document.getElementById("currencyMenu");
    if (menu) {
        menu.classList.toggle("show");
    }
}

function selectCurrency(code, flagImgUrl) {
    currentCurrency = code;

    // Update Button Flag Image & Code Text UI
    const flagElem = document.getElementById("selectedFlagImg");
    const codeElem = document.getElementById("selectedCode");
    if (flagElem) flagElem.src = flagImgUrl;
    if (codeElem) codeElem.innerText = code;

    // Update Active Checkmark in floating list
    document.querySelectorAll(".dropdown-item").forEach(item => {
        item.classList.remove("active");
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }

    // Close Floating Menu
    const menu = document.getElementById("currencyMenu");
    if (menu) menu.classList.remove("show");

    // Update Symbol Labels on UI
    const symbol = currencyConfig[code] ? currencyConfig[code].symbol : "₹";
    document.querySelectorAll('.currSymbol').forEach(el => {
        el.innerText = symbol;
    });

    calculateEMI();
}

// Close Dropdown Menu when clicking outside
window.onclick = function(event) {
    if (!event.target.closest('.custom-dropdown-container')) {
        const menu = document.getElementById("currencyMenu");
        if (menu && menu.classList.contains('show')) {
            menu.classList.remove('show');
        }
    }
};

// --- GROWW GREEN DYNAMIC SLIDER FILL FUNCTION ---
function updateSliderTrack(slider) {
    let min = slider.min || 0;
    let max = slider.max || 100;
    let val = slider.value;
    let percentage = ((val - min) / (max - min)) * 100;

    slider.style.background = `linear-gradient(to right, #00d09c 0%, #00d09c ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
}

function syncAllSliderTracks() {
    updateSliderTrack(loan);
    updateSliderTrack(rate);
    updateSliderTrack(time);
}

// Calculate EMI
function calculateEMI() {
    let P = Number(loan.value);
    let R = Number(rate.value) / 12 / 100;
    let N = Number(time.value) * 12;

    if (P <= 0 || R <= 0 || N <= 0) return;

    let EMI = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    let totalPayment = EMI * N;
    let totalInterest = totalPayment - P;

    // Update Text UI
    result.innerText = formatCurrency(EMI.toFixed(0));
    principalText.innerText = formatCurrency(P);
    interestText.innerText = formatCurrency(totalInterest.toFixed(0));
    paymentText.innerText = formatCurrency(totalPayment.toFixed(0));

    // Update Chart
    updateChart(P, totalInterest);

    // Sync Slider Green Background Fill
    syncAllSliderTracks();

    // Prepare Data for Monthly Amortization Table
    prepareAmortizationData(P, R, N, EMI);
    renderSchedule();
}

// --- SLIDER DRAG HANDLERS ---
loan.oninput = () => { 
    loanValue.value = loan.value; 
    calculateEMI(); 
};

rate.oninput = () => { 
    rateValue.value = rate.value; 
    calculateEMI(); 
};

time.oninput = () => { 
    timeValue.value = time.value; 
    calculateEMI(); 
};

// --- DIRECT INPUT TYPING HANDLERS (Groww Two-Way Sync) ---
loanValue.oninput = () => {
    loan.value = loanValue.value;
    calculateEMI();
};

rateValue.oninput = () => {
    rate.value = rateValue.value;
    calculateEMI();
};

timeValue.oninput = () => {
    time.value = timeValue.value;
    calculateEMI();
};

// Switch Loan Tabs
function switchLoan(type) {
    document.getElementById("loanHeading").innerText = loanData[type].title;

    // Update Sliders
    loan.value = loanData[type].amount;
    rate.value = loanData[type].rate;
    time.value = loanData[type].tenure;

    // Update Input Boxes
    loanValue.value = loanData[type].amount;
    rateValue.value = loanData[type].rate;
    timeValue.value = loanData[type].tenure;

    // Active tab CSS update
    document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
    if(event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    calculateEMI();
}

// Chart.js Setup (With Bright White Text Labels)
function updateChart(principal, interest) {
    let ctx = document.getElementById("myChart").getContext("2d");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Principal Loan Amount', 'Total Interest'],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ['#2563eb', '#00d09c'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff', // White color text
                        boxWidth: 12,
                        padding: 15,
                        font: { size: 12, weight: 'bold' }
                    }
                }
            }
        }
    });
}

// --- TOGGLE MAIN AMORTIZATION SECTION ---
function toggleAmortSection() {
    const amortContent = document.getElementById("amortContent");
    const amortIcon = document.getElementById("amortIcon");

    if (amortContent.style.display === "none" || amortContent.style.display === "") {
        amortContent.style.display = "block";
        amortIcon.innerText = "-";
    } else {
        amortContent.style.display = "none";
        amortIcon.innerText = "+";
    }
}

// --- PREPARE AMORTIZATION DATA (ALWAYS START FROM JAN) ---
function prepareAmortizationData(principal, monthlyRate, totalMonths, emi) {
    calculatedAmortData = [];
    visibleYearsCount = 5; // Reset to 5 years view on value change

    let balance = principal;
    let today = new Date();
    let currentYear = today.getFullYear();
    let currentMonthIdx = 0; // Hamesha Jan (January) se start hoga

    let monthCounter = 0;
    let yr = currentYear;

    while (monthCounter < totalMonths && balance > 0) {
        let yearObj = {
            year: yr,
            months: []
        };

        let monthsInThisYear = 0;
        while (monthsInThisYear < 12 && monthCounter < totalMonths && balance > 0) {
            let mName = monthNames[currentMonthIdx];
            let interestForMonth = balance * monthlyRate;
            let principalForMonth = emi - interestForMonth;

            if (balance < principalForMonth) {
                principalForMonth = balance;
                emi = principalForMonth + interestForMonth;
            }

            balance -= principalForMonth;
            if (balance < 0) balance = 0;

            yearObj.months.push({
                month: mName,
                principalPaid: principalForMonth,
                interestCharged: interestForMonth,
                totalPayment: emi,
                balance: balance
            });

            currentMonthIdx = (currentMonthIdx + 1) % 12;
            monthsInThisYear++;
            monthCounter++;
        }

        calculatedAmortData.push(yearObj);
        yr++;
    }
}

// --- RENDER SCHEDULE (5 YEARS & LOAD MORE) ---
function renderSchedule() {
    const scheduleContainer = document.getElementById("scheduleContainer");
    const loadMoreBox = document.getElementById("loadMoreBox");
    if (!scheduleContainer) return;

    scheduleContainer.innerHTML = "";

    let yearsToDisplay = calculatedAmortData.slice(0, visibleYearsCount);

    yearsToDisplay.forEach((yearObj) => {
        let yearBlock = document.createElement("div");
        yearBlock.className = "year-block";

        let yearHeader = document.createElement("div");
        yearHeader.className = "year-header";
        yearHeader.onclick = function() {
            let isActive = yearBlock.classList.contains("active");
            document.querySelectorAll('.year-block').forEach(b => b.classList.remove('active'));
            if (!isActive) {
                yearBlock.classList.add('active');
            }
        };

        yearHeader.innerHTML = `
            <span>${yearObj.year}</span>
            <span class="chevron-icon">▼</span>
        `;

        let tableWrapper = document.createElement("div");
        tableWrapper.className = "month-table-wrapper";

        let tableHTML = `
            <table class="amort-table">
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Principal Paid</th>
                        <th>Interest Charged</th>
                        <th>Total Payment</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
        `;

        yearObj.months.forEach(m => {
            tableHTML += `
                <tr>
                    <td>${m.month}</td>
                    <td>${formatCurrency(m.principalPaid)}</td>
                    <td>${formatCurrency(m.interestCharged)}</td>
                    <td>${formatCurrency(m.totalPayment)}</td>
                    <td>${formatCurrency(m.balance)}</td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        tableWrapper.innerHTML = tableHTML;
        yearBlock.appendChild(yearHeader);
        yearBlock.appendChild(tableWrapper);
        scheduleContainer.appendChild(yearBlock);
    });

    // Control "Load More" Button Visibility
    if (visibleYearsCount < calculatedAmortData.length) {
        loadMoreBox.style.display = "block";
    } else {
        loadMoreBox.style.display = "none";
    }
}

// "Load More" Action
function loadMoreYears() {
    visibleYearsCount += 5;
    renderSchedule();
}

// --- SHARE FUNCTION ---
function shareCalculator() {
    if (navigator.share) {
        navigator.share({
            title: 'Global EMI Calculator',
            text: 'Check out this awesome interactive Global EMI Calculator!',
            url: window.location.href
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard! You can share it anywhere.');
    }
}

// Initial Call
calculateEMI();
