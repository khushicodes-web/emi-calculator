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
let visibleYearsCount = 5; 
let calculatedAmortData = []; 

// 50 World Currencies & Locales Database Config
const currencyConfig = {
    INR: { symbol: "₹", locale: "en-IN" },
    USD: { symbol: "$", locale: "en-US" },
    EUR: { symbol: "€", locale: "de-DE" },
    GBP: { symbol: "£", locale: "en-GB" },
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
    SEK: { symbol: "kr ", locale: "sv-SE" },
    NOK: { symbol: "kr ", locale: "nb-NO" },
    DKK: { symbol: "kr ", locale: "da-DK" },
    PLN: { symbol: "zł ", locale: "pl-PL" },
    CZK: { symbol: "Kč ", locale: "cs-CZ" },
    HUF: { symbol: "Ft ", locale: "hu-HU" },
    TRY: { symbol: "₺", locale: "tr-TR" },
    ILS: { symbol: "₪", locale: "he-IL" },
    MYR: { symbol: "RM ", locale: "ms-MY" },
    THB: { symbol: "฿", locale: "th-TH" },
    IDR: { symbol: "Rp ", locale: "id-ID" },
    PHP: { symbol: "₱", locale: "en-PH" },
    VND: { symbol: "₫", locale: "vi-VN" },
    PKR: { symbol: "Rs ", locale: "ur-PK" },
    BDT: { symbol: "৳", locale: "bn-BD" },
    LKR: { symbol: "Rs ", locale: "si-LK" },
    NPR: { symbol: "Rs ", locale: "ne-NP" },
    EGP: { symbol: "E£ ", locale: "ar-EG" },
    NGN: { symbol: "₦", locale: "en-NG" },
    KES: { symbol: "KSh ", locale: "sw-KE" },
    ARS: { symbol: "$", locale: "es-AR" },
    CLP: { symbol: "$", locale: "es-CL" },
    COP: { symbol: "$", locale: "es-CO" },
    PEN: { symbol: "S/ ", locale: "es-PE" },
    QAR: { symbol: "QR ", locale: "ar-QA" },
    KWD: { symbol: "KD ", locale: "ar-KW" },
    BHD: { symbol: "BD ", locale: "ar-BH" },
    OMR: { symbol: "RO ", locale: "ar-OM" },
    JOD: { symbol: "JD ", locale: "ar-JO" },
    UAH: { symbol: "₴", locale: "uk-UA" },
    RON: { symbol: "lei ", locale: "ro-RO" }
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

// Formatting Helper
function formatCurrency(val) {
    const config = currencyConfig[currentCurrency] || currencyConfig.INR;
    return config.symbol + Number(val).toLocaleString(config.locale, { maximumFractionDigits: 0 });
}

// Custom Dropdown Logic
function toggleCurrencyMenu() {
    const menu = document.getElementById("currencyMenu");
    if (menu) {
        menu.classList.toggle("show");
    }
}

function selectCurrency(code, flagImgUrl, event) {
    currentCurrency = code;

    const flagElem = document.getElementById("selectedFlagImg");
    const codeElem = document.getElementById("selectedCode");
    if (flagElem) flagElem.src = flagImgUrl;
    if (codeElem) codeElem.innerText = code;

    // Dynamically update active class across all dropdown items so the checkmark moves correctly
    document.querySelectorAll(".dropdown-item").forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(`'${code}'`)) {
            item.classList.add("active");
        }
    });
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }

    const menu = document.getElementById("currencyMenu");
    if (menu) menu.classList.remove("show");

    const symbol = currencyConfig[code] ? currencyConfig[code].symbol : "₹";
    document.querySelectorAll('.currSymbol').forEach(el => {
        el.innerText = symbol;
    });

    // Dynamic Max Label Update based on Currency
    const maxLabel = document.getElementById("maxLabel");
    if (maxLabel) {
        if (code === "INR" || code === "PKR" || code === "NPR" || code === "BDT" || code === "LKR") {
            maxLabel.innerText = "50Cr";
        } else {
            maxLabel.innerText = "50M";
        }
    }

    calculateEMI();
}

window.onclick = function(event) {
    if (!event.target.closest('.custom-dropdown-container')) {
        const menu = document.getElementById("currencyMenu");
        if (menu && menu.classList.contains('show')) {
            menu.classList.remove('show');
        }
    }
};

// Fixed Slider Track Background Calculation
function updateSliderTrack(slider) {
    if (!slider) return;
    let min = Number(slider.min) || 0;
    let max = Number(slider.max) || 100;
    let val = Number(slider.value);
    
    if (val < min) val = min;
    if (val > max) val = max;

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

    if (result) result.innerText = formatCurrency(Math.round(EMI));
    if (principalText) principalText.innerText = formatCurrency(P);
    if (interestText) interestText.innerText = formatCurrency(Math.round(totalInterest));
    if (paymentText) paymentText.innerText = formatCurrency(Math.round(totalPayment));

    updateChart(P, totalInterest);
    syncAllSliderTracks();
    prepareAmortizationData(P, R, N, EMI);
    renderSchedule();
}

// Input Handlers with Track Syncing
if (loan && loanValue) {
    loan.oninput = () => { loanValue.value = loan.value; updateSliderTrack(loan); calculateEMI(); };
    loanValue.oninput = () => { 
        let val = Number(loanValue.value);
        if(val > Number(loan.max)) loan.max = val * 1.5; 
        loan.value = val; 
        updateSliderTrack(loan); 
        calculateEMI(); 
    };
}
if (rate && rateValue) {
    rate.oninput = () => { rateValue.value = rate.value; updateSliderTrack(rate); calculateEMI(); };
    rateValue.oninput = () => { rate.value = rateValue.value; updateSliderTrack(rate); calculateEMI(); };
}
if (time && timeValue) {
    time.oninput = () => { timeValue.value = time.value; updateSliderTrack(time); calculateEMI(); };
    timeValue.oninput = () => { time.value = timeValue.value; updateSliderTrack(time); calculateEMI(); };
}

function switchLoan(type, event) {
    const loanHeading = document.getElementById("loanHeading");
    if (loanHeading) loanHeading.innerText = loanData[type].title;

    loan.value = loanData[type].amount;
    rate.value = loanData[type].rate;
    time.value = loanData[type].tenure;

    loanValue.value = loanData[type].amount;
    rateValue.value = loanData[type].rate;
    timeValue.value = loanData[type].tenure;

    syncAllSliderTracks();

    document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    calculateEMI();
}

// Lazy Load Chart.js Library for 100/100 Performance Score
function loadChartLibrary(callback) {
    if (window.Chart) {
        callback();
        return;
    }
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
}

function updateChart(principal, interest) {
    loadChartLibrary(() => {
        let chartCanvas = document.getElementById("myChart");
        if (!chartCanvas) return;
        let ctx = chartCanvas.getContext("2d");
        if (chart) chart.destroy();

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
                            color: '#ffffff',
                            boxWidth: 12,
                            padding: 15,
                            font: { size: 12, weight: 'bold' }
                        }
                    }
                }
            }
        });
    });
}

function toggleAmortSection() {
    const amortContent = document.getElementById("amortContent");
    const amortIcon = document.getElementById("amortIcon");
    if (!amortContent) return;
    if (amortContent.style.display === "none" || amortContent.style.display === "") {
        amortContent.style.display = "block";
        if (amortIcon) amortIcon.innerText = "-";
    } else {
        amortContent.style.display = "none";
        if (amortIcon) amortIcon.innerText = "+";
    }
}

function prepareAmortizationData(principal, monthlyRate, totalMonths, emi) {
    calculatedAmortData = [];
    visibleYearsCount = 5;
    let balance = principal;
    let today = new Date();
    let currentYear = today.getFullYear();
    let currentMonthIdx = 0;
    let monthCounter = 0;
    let yr = currentYear;

    while (monthCounter < totalMonths && balance > 0) {
        let yearObj = { year: yr, months: [] };
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
            if (!isActive) yearBlock.classList.add('active');
        };

        yearHeader.innerHTML = `<span>${yearObj.year}</span><span class="chevron-icon">▼</span>`;

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
                    <td>${formatCurrency(Math.round(m.principalPaid))}</td>
                    <td>${formatCurrency(Math.round(m.interestCharged))}</td>
                    <td>${formatCurrency(Math.round(m.totalPayment))}</td>
                    <td>${formatCurrency(Math.round(m.balance))}</td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        tableWrapper.innerHTML = tableHTML;
        yearBlock.appendChild(yearHeader);
        yearBlock.appendChild(tableWrapper);
        scheduleContainer.appendChild(yearBlock);
    });

    if (loadMoreBox) {
        if (visibleYearsCount < calculatedAmortData.length) {
            loadMoreBox.style.display = "block";
        } else {
            loadMoreBox.style.display = "none";
        }
    }
}

function loadMoreYears() {
    visibleYearsCount += 5;
    renderSchedule();
}

function shareCalculator() {
    if (navigator.share) {
        navigator.share({
            title: 'Global EMI Calculator',
            text: 'Check out this awesome interactive Global EMI Calculator!',
            url: window.location.href
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

// Automatic Initializer
document.addEventListener("DOMContentLoaded", () => {
    if (loan && loanValue) loanValue.value = loan.value;
    if (rate && rateValue) rateValue.value = rate.value;
    if (time && timeValue) timeValue.value = time.value;
    calculateEMI();
});
