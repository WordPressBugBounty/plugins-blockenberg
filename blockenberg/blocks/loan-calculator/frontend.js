(function () {
    'use strict';

    var CHART_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';

    function calcLoan(amount, annualRate, years) {
        if (!amount || !annualRate || !years) return { monthly: 0, totalPayment: 0, totalInterest: 0 };
        var r = annualRate / 1200;
        var n = years * 12;
        var monthly = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        var totalPayment = monthly * n;
        var totalInterest = totalPayment - amount;
        return {
            monthly: Math.round(monthly * 100) / 100,
            totalPayment: Math.round(totalPayment * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100
        };
    }

    function fmtMoney(val, currency, pos) {
        var s = Math.round(val).toLocaleString('en-US');
        return pos === 'after' ? s + currency : currency + s;
    }

    function buildAmort(amount, annualRate, years, maxRows) {
        var r = annualRate / 1200;
        var n = years * 12;
        var monthly = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        var balance = amount;
        var rows = [];
        for (var i = 1; i <= n && i <= maxRows; i++) {
            var interest = balance * r;
            var principal = monthly - interest;
            balance = Math.max(0, balance - principal);
            rows.push({ month: i, payment: monthly, principal: principal, interest: interest, balance: balance });
        }
        return rows;
    }

    document.querySelectorAll('.bkbg-lc-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) {}

        var amt    = opts.loanAmountDefault  || 300000;
        var rate   = opts.interestDefault    || 5.5;
        var yrs    = opts.termDefault        || 25;
        var cur    = opts.currency           || '$';
        var pos    = opts.currencyPos        || 'before';

        // Find sliders and bind them
        var sliderGroups = app.querySelectorAll('.bkbg-lc-slider-group');
        var amountGroup, interestGroup, termGroup;

        sliderGroups.forEach(function (g) {
            var type = g.dataset.slider;
            if (type === 'amount')   amountGroup   = g;
            if (type === 'interest') interestGroup = g;
            if (type === 'term')     termGroup     = g;
        });

        function initSlider(group, min, max, step, value, format) {
            if (!group) return;
            var input = group.querySelector('input[type="range"]');
            var valEl = group.querySelector('.bkbg-lc-slider-val');
            var minEl = group.querySelector('.bkbg-lc-range-min');
            var maxEl = group.querySelector('.bkbg-lc-range-max');
            if (input) {
                input.min = min; input.max = max; input.step = step; input.value = value;
                input.style.accentColor = opts.accentColor || '#6c3fb5';
            }
            if (valEl) valEl.textContent = format(value);
            if (minEl) minEl.textContent = format(min);
            if (maxEl) maxEl.textContent = format(max);
            return input;
        }

        var amtInput  = initSlider(amountGroup,   opts.loanAmountMin || 10000, opts.loanAmountMax || 2000000, opts.loanAmountStep || 5000, amt,  function (v) { return fmtMoney(v, cur, pos); });
        var rateInput = initSlider(interestGroup, opts.interestMin   || 0.5,   opts.interestMax   || 20,      opts.interestStep   || 0.1,  rate, function (v) { return v + '%'; });
        var yrsInput  = initSlider(termGroup,     opts.termMin       || 1,     opts.termMax       || 30,      opts.termStep       || 1,    yrs,  function (v) { return v + ' yr'; });

        // Result elements
        var monthlyEl   = app.querySelector('.bkbg-lc-monthly');
        var principalEl = app.querySelector('[data-result="principal"] .bkbg-lc-res-val');
        var interestEl  = app.querySelector('[data-result="interest"] .bkbg-lc-res-val');
        var totalEl     = app.querySelector('[data-result="total"] .bkbg-lc-res-val');
        var amortWrap   = app.querySelector('.bkbg-lc-amort-wrap');

        var chartInstance = null;

        function updateAll() {
            var a = parseFloat(amtInput  ? amtInput.value  : amt);
            var r = parseFloat(rateInput ? rateInput.value : rate);
            var y = parseFloat(yrsInput  ? yrsInput.value  : yrs);

            // Update displayed values
            if (amountGroup) {
                var v = amountGroup.querySelector('.bkbg-lc-slider-val');
                if (v) v.textContent = fmtMoney(a, cur, pos);
            }
            if (interestGroup) {
                var v2 = interestGroup.querySelector('.bkbg-lc-slider-val');
                if (v2) v2.textContent = r + '%';
            }
            if (termGroup) {
                var v3 = termGroup.querySelector('.bkbg-lc-slider-val');
                if (v3) v3.textContent = y + ' yr';
            }

            var result = calcLoan(a, r, y);

            if (monthlyEl)   monthlyEl.textContent  = fmtMoney(result.monthly, cur, pos);
            if (principalEl) principalEl.textContent = fmtMoney(a, cur, pos);
            if (interestEl)  interestEl.textContent  = fmtMoney(result.totalInterest, cur, pos);
            if (totalEl)     totalEl.textContent     = fmtMoney(result.totalPayment, cur, pos);

            // Update chart
            if (chartInstance) {
                chartInstance.data.datasets[0].data = [a, result.totalInterest];
                chartInstance.update();
            }

            // Amortization table
            if (opts.showAmortization && amortWrap) {
                var rows = buildAmort(a, r, y, opts.amortizationRows || 12);
                var table = '<table class="bkbg-lc-amort-table"><thead><tr><th>#</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>';
                rows.forEach(function (row) {
                    table += '<tr><td>' + row.month + '</td><td>' + fmtMoney(row.payment, cur, pos) + '</td><td>' + fmtMoney(row.principal, cur, pos) + '</td><td>' + fmtMoney(row.interest, cur, pos) + '</td><td>' + fmtMoney(row.balance, cur, pos) + '</td></tr>';
                });
                table += '</tbody></table>';
                amortWrap.innerHTML = table;
            }
        }

        function bindSlider(input) {
            if (!input) return;
            input.addEventListener('input', updateAll);
        }
        bindSlider(amtInput);
        bindSlider(rateInput);
        bindSlider(yrsInput);

        // Initial render
        updateAll();

        // Load Chart.js and render donut
        if (opts.showChart) {
            function renderChart() {
                var canvas = app.querySelector('.bkbg-lc-chart');
                if (!canvas || typeof Chart === 'undefined') return;
                var result = calcLoan(
                    parseFloat(amtInput ? amtInput.value : amt),
                    parseFloat(rateInput ? rateInput.value : rate),
                    parseFloat(yrsInput ? yrsInput.value : yrs)
                );
                chartInstance = new Chart(canvas, {
                    type: 'doughnut',
                    data: {
                        labels: ['Principal', 'Interest'],
                        datasets: [{
                            data: [parseFloat(amtInput ? amtInput.value : amt), result.totalInterest],
                            backgroundColor: [opts.principalColor || '#6c3fb5', opts.interestColor || '#f59e0b'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        cutout: '70%',
                        plugins: { legend: { position: 'bottom', labels: { padding: 16 } } }
                    }
                });
            }

            if (typeof Chart !== 'undefined') {
                renderChart();
            } else {
                if (!document.getElementById('bkbg-chartjs-cdn')) {
                    var s = document.createElement('script');
                    s.id = 'bkbg-chartjs-cdn';
                    s.src = CHART_CDN;
                    s.onload = renderChart;
                    document.head.appendChild(s);
                } else {
                    var wait = setInterval(function () {
                        if (typeof Chart !== 'undefined') { clearInterval(wait); renderChart(); }
                    }, 100);
                }
            }
        }
    });
})();
