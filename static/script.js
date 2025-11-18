// デバウンス関数
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Chart.js 初期化
const ctx = document.getElementById('growthChart').getContext('2d');
let growthChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{
        label: '資産推移',
        data: [],
        borderColor: 'rgba(76, 175, 80, 1)',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true
    }]},
    options: {
        scales: {
            x: { title: { display: true, text: '年月' } },
            y: { title: { display: true, text: '円' } }
        }
    }
});

let periods = [];
let selectedPeriodIndex = null;

// --- 入力要素 ---
const principalInput = document.getElementById('principalInput');
const annualRateInput = document.getElementById('annualRateInput');
const yearsInput = document.getElementById('yearsInput');
const monthlyInput = document.getElementById('monthlyInput');

const principalRange = document.getElementById('principalRange');
const annualRateRange = document.getElementById('annualRateRange');
const yearsRange = document.getElementById('yearsRange');
const monthlyRange = document.getElementById('monthlyRange');

// 特別出費収入入力欄
let extraLabel = document.createElement('label');
extraLabel.innerHTML = `
    特別出費収入:
    <input type="number" id="extraInput" value="0" step="1000">
`;
document.getElementById('calcForm').appendChild(extraLabel);
const extraInput = document.getElementById('extraInput');

// --- スライダー同期 ---
function syncInputWithRange(numberInput, rangeInput) {
    numberInput.addEventListener('input', () => {
        rangeInput.value = numberInput.value;
        updateSelectedPeriod();
    });
    rangeInput.addEventListener('input', () => {
        numberInput.value = rangeInput.value;
        updateSelectedPeriod();
    });
}
syncInputWithRange(principalInput, principalRange);
syncInputWithRange(annualRateInput, annualRateRange);
syncInputWithRange(yearsInput, yearsRange);
syncInputWithRange(monthlyInput, monthlyRange);

// --- 区間更新 ---
function updateSelectedPeriod() {
    if (selectedPeriodIndex === null) return;

    if (selectedPeriodIndex === 0) {
        periods[selectedPeriodIndex] = {
            principal: parseFloat(principalInput.value) || 0,
            annual_rate: parseFloat(annualRateInput.value) || 0,
            years: parseInt(yearsInput.value) || 0,
            monthly_addition: parseFloat(monthlyInput.value) || 0
        };
    } else {
        periods[selectedPeriodIndex] = {
            principal: 0,
            annual_rate: parseFloat(annualRateInput.value) || 0,
            years: parseInt(yearsInput.value) || 0,
            monthly_addition: parseFloat(monthlyInput.value) || 0,
            extra_income: parseFloat(extraInput.value) || 0
        };
    }

    renderPeriods();
    updateAll();
}

// --- 区間追加 ---
document.getElementById('addPeriod').addEventListener('click', () => {
    const newPeriod = {
        principal: 0,
        annual_rate: parseFloat(annualRateInput.value) || 0,
        years: parseInt(yearsInput.value) || 0,
        monthly_addition: parseFloat(monthlyInput.value) || 0,
        extra_income: parseFloat(extraInput.value) || 0
    };
    periods.push(newPeriod);
    selectedPeriodIndex = periods.length - 1;
    renderPeriods();
    updateAll();
});

// --- 区間削除 ---
document.getElementById('removePeriod').addEventListener('click', () => {
    if (selectedPeriodIndex === null) return;
    periods.splice(selectedPeriodIndex, 1);
    selectedPeriodIndex = null;
    renderPeriods();
    updateAll();
});

// --- 区間表示 ---
function renderPeriods() {
    const container = document.getElementById('periodContainer');
    container.innerHTML = '';

    periods.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'period-card';
        div.dataset.index = i;
        if (i === selectedPeriodIndex) div.classList.add('selected');

        if (i === 0) {
            div.innerHTML = `
                <h4>期間 ${i + 1}</h4>
                <p>元本: ${p.principal.toLocaleString()}円</p>
                <p>年利: ${p.annual_rate}%</p>
                <p>期間: ${p.years}年</p>
                <p>毎月追加: ${p.monthly_addition.toLocaleString()}円</p>
            `;
        } else {
            div.innerHTML = `
                <h4>期間 ${i + 1}</h4>
                <p style="color:red;">特別出費収入: ${(p.extra_income || 0).toLocaleString()}円</p>
                <p>年利: ${p.annual_rate}%</p>
                <p>期間: ${p.years}年</p>
                <p>毎月追加: ${p.monthly_addition.toLocaleString()}円</p>
            `;
        }

        div.addEventListener('click', () => {
            selectedPeriodIndex = i;
            document.querySelectorAll('.period-card').forEach(c => c.classList.remove('selected'));
            div.classList.add('selected');

            if (i === 0) {
                principalInput.parentElement.style.display = 'block';
                principalRange.style.display = 'block';
                extraLabel.style.display = 'none';
                principalInput.value = p.principal;
            } else {
                principalInput.parentElement.style.display = 'none';
                principalRange.style.display = 'none';
                extraLabel.style.display = 'block';
                extraInput.value = p.extra_income || 0;
            }

            annualRateInput.value = p.annual_rate;
            yearsInput.value = p.years;
            monthlyInput.value = p.monthly_addition;
        });

        container.appendChild(div);
    });
}

// --- 計算（特別出費収入あり） ---
function simulatePeriods(periods) {
    let history = [];
    let labels = [];
    let previous = 0;

    periods.forEach((p, idx) => {
        let months = p.years * 12;
        let balance = idx === 0 ? p.principal : previous + (p.extra_income || 0);

        for (let m = 0; m < months; m++) {
            balance *= (1 + p.annual_rate / 12 / 100);
            balance += p.monthly_addition;
            history.push(balance);
            labels.push(`${Math.floor(history.length / 12)}年${history.length % 12}ヶ月`);
        }

        previous = balance;
    });

    return { total: previous, history, labels };
}

// --- グラフ更新 ---
function updateAll() {
    if (periods.length === 0) {
        growthChart.data.labels = [];
        growthChart.data.datasets[0].data = [];
        growthChart.update();
        return;
    }

    const data = simulatePeriods(periods);

    document.getElementById('result').textContent = Math.floor(data.total).toLocaleString();
    growthChart.data.labels = data.labels;
    growthChart.data.datasets[0].data = data.history.map(v => Math.floor(v));
    growthChart.update();
}
