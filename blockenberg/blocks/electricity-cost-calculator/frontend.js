(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = { family:'font-family', weight:'font-weight', transform:'text-transform', style:'font-style', decoration:'text-decoration',
                  sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
                  lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
                  letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
                  wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
        Object.keys(m).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k], u = typo[k + 'Unit'] || '';
                if (/Desktop|Tablet|Mobile/.test(k) && typeof v === 'number') v = v + (u || 'px');
                el.style.setProperty(prefix + m[k], '' + v);
            }
        });
    }

    var PRESETS = [
        { name: 'Refrigerator',    watts: 150,  hours: 24  },
        { name: 'LED TV 55"',      watts: 100,  hours: 5   },
        { name: 'Washing Machine', watts: 500,  hours: 1   },
        { name: 'Air Conditioner', watts: 1500, hours: 8   },
        { name: 'LED Light Bulb',  watts: 10,   hours: 6   },
        { name: 'Laptop',          watts: 60,   hours: 8   },
        { name: 'Desktop PC',      watts: 300,  hours: 6   },
        { name: 'Microwave',       watts: 1000, hours: 0.5 }
    ];

    function calcCost(watts, hours, rate) {
        var kwhDay = (watts / 1000) * hours;
        return {
            kwhDay:    kwhDay,
            kwhMonth:  kwhDay * 30.44,
            costDay:   kwhDay * rate,
            costMonth: kwhDay * 30.44 * rate,
            costYear:  kwhDay * 365 * rate
        };
    }

    function fmt(n, cur, dec) { return cur + n.toFixed(dec !== undefined ? dec : 2); }
    function fmtNum(n, dec) { return n.toFixed(dec !== undefined ? dec : 2); }

    function lerp(a, b, t) { return a + (b - a) * t; }

    function costColor(fraction, low, high) {
        function hexToRgb(hex) {
            var c = hex.replace('#', '');
            return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
        }
        function toHex(r, g, b) {
            function h(x) { return Math.round(x).toString(16).padStart(2,'0'); }
            return '#' + h(r) + h(g) + h(b);
        }
        var a = hexToRgb(low), bv = hexToRgb(high);
        return toHex(lerp(a[0],bv[0],fraction), lerp(a[1],bv[1],fraction), lerp(a[2],bv[2],fraction));
    }

    function initBlock(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }

        var a = opts;
        var rate = parseFloat(a.defaultRate) || 0.12;
        var appliances = [];

        root.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-ec-wrap';
        wrap.style.cssText = 'background:' + a.sectionBg + ';max-width:' + a.contentMaxWidth + 'px;margin:0 auto;';
        root.appendChild(wrap);

        typoCssVarsForEl(a.typoTitle, '--bkbg-ec-ttl-', wrap);
        typoCssVarsForEl(a.typoSubtitle, '--bkbg-ec-sub-', wrap);

        if (a.showTitle) {
            var h = document.createElement('div');
            h.className = 'bkbg-ec-title';
            h.style.color = a.titleColor;
            h.textContent = a.title;
            wrap.appendChild(h);
        }

        if (a.showSubtitle) {
            var s = document.createElement('div');
            s.className = 'bkbg-ec-subtitle';
            s.style.color = a.subtitleColor;
            s.textContent = a.subtitle;
            wrap.appendChild(s);
        }

        // Rate card
        var rateCard = document.createElement('div');
        rateCard.className = 'bkbg-ec-card';
        rateCard.style.background = a.cardBg;
        rateCard.innerHTML = '<div class="bkbg-ec-rate-row">' +
            '<div class="bkbg-ec-rate-label" style="color:' + a.labelColor + '">Rate per kWh:</div>' +
            '<div class="bkbg-ec-rate-field">' +
            '<span style="color:' + a.labelColor + '">' + a.currency + '</span>' +
            '<input class="bkbg-ec-input bkbg-ec-rate-input" type="number" step="0.01" min="0" value="' + rate + '" style="background:' + a.inputBg + ';border-color:#fcd34d;color:' + a.labelColor + ';width:80px;">' +
            '<span style="color:' + a.subtitleColor + ';font-size:13px;">/ kWh</span>' +
            '</div></div>';
        wrap.appendChild(rateCard);

        var rateInput = rateCard.querySelector('.bkbg-ec-rate-input');
        rateInput.addEventListener('input', function () {
            rate = parseFloat(rateInput.value) || 0;
            renderAll();
        });

        // Presets
        if (a.showPresets) {
            var presetsCard = document.createElement('div');
            presetsCard.className = 'bkbg-ec-presets';
            presetsCard.style.background = a.cardBg;
            var pTitle = document.createElement('div');
            pTitle.className = 'bkbg-ec-preset-title';
            pTitle.style.color = a.labelColor;
            pTitle.textContent = 'Quick Add Presets';
            presetsCard.appendChild(pTitle);
            var chips = document.createElement('div');
            chips.className = 'bkbg-ec-preset-chips';
            PRESETS.forEach(function (preset) {
                var chip = document.createElement('button');
                chip.className = 'bkbg-ec-preset-chip';
                chip.style.cssText = 'color:' + a.accentColor + ';border-color:' + a.accentColor + ';';
                chip.textContent = '+ ' + preset.name;
                chip.addEventListener('click', function () {
                    appliances.push({ name: preset.name, watts: preset.watts, hours: preset.hours });
                    renderAll();
                });
                chips.appendChild(chip);
            });
            presetsCard.appendChild(chips);
            wrap.appendChild(presetsCard);
        }

        // Appliances card
        var appCard = document.createElement('div');
        appCard.className = 'bkbg-ec-card';
        appCard.style.background = a.cardBg;
        var appTitle = document.createElement('div');
        appTitle.className = 'bkbg-ec-sec-title';
        appTitle.style.color = a.labelColor;
        appTitle.textContent = 'My Appliances';
        appCard.appendChild(appTitle);

        var appList = document.createElement('div');
        appCard.appendChild(appList);

        // Header row
        var hdr = document.createElement('div');
        hdr.className = 'bkbg-ec-appliance';
        hdr.style.cssText = 'font-size:11px;font-weight:600;color:' + a.subtitleColor + ';margin-bottom:4px;';
        ['Appliance', 'Watts', 'Hrs/Day', '', 'Mo. Cost', ''].forEach(function (t) {
            var c = document.createElement('div');
            c.textContent = t;
            hdr.appendChild(c);
        });
        appList.appendChild(hdr);

        var appRows = document.createElement('div');
        appList.appendChild(appRows);

        // Add button row
        var addRow = document.createElement('div');
        addRow.className = 'bkbg-ec-add-row';
        var addBtn = document.createElement('button');
        addBtn.className = 'bkbg-ec-btn';
        addBtn.style.background = a.accentColor;
        addBtn.textContent = '+ Add Appliance';
        addBtn.addEventListener('click', function () {
            appliances.push({ name: 'Appliance', watts: 100, hours: 4 });
            renderAll();
        });
        addRow.appendChild(addBtn);
        appCard.appendChild(addRow);
        wrap.appendChild(appCard);

        // Summary
        var summaryEl = document.createElement('div');
        summaryEl.className = 'bkbg-ec-summary';
        summaryEl.style.background = a.accentColor;
        ['Daily', 'Monthly', 'Yearly'].forEach(function (lbl) {
            var item = document.createElement('div');
            item.className = 'bkbg-ec-summary-item';
            var val = document.createElement('div');
            val.className = 'bkbg-ec-summary-val';
            val.dataset.key = lbl.toLowerCase();
            val.textContent = a.currency + '0.00';
            var l = document.createElement('div');
            l.className = 'bkbg-ec-summary-lbl';
            l.textContent = lbl;
            item.appendChild(val);
            item.appendChild(l);
            summaryEl.appendChild(item);
        });
        wrap.appendChild(summaryEl);

        // Chart
        var chartEl = null;
        if (a.showChart) {
            chartEl = document.createElement('div');
            chartEl.className = 'bkbg-ec-chart';
            chartEl.style.background = a.cardBg;
            var chartTitle = document.createElement('div');
            chartTitle.className = 'bkbg-ec-sec-title';
            chartTitle.style.color = a.labelColor;
            chartTitle.textContent = 'Cost Breakdown (monthly)';
            chartEl.appendChild(chartTitle);
            var chartRows = document.createElement('div');
            chartRows.id = 'bkbg-ec-chart-rows-' + Math.random().toString(36).slice(2);
            chartEl.appendChild(chartRows);
            wrap.appendChild(chartEl);
        }

        // Carbon
        var carbonEl = null;
        if (a.showCarbon) {
            carbonEl = document.createElement('div');
            carbonEl.className = 'bkbg-ec-carbon';
            carbonEl.style.cssText = 'background:' + a.cardBg + ';border-left:4px solid ' + a.lowCostColor + ';';
            wrap.appendChild(carbonEl);
        }

        function renderAll() {
            // Appliance rows
            appRows.innerHTML = '';
            appliances.forEach(function (app, idx) {
                var row = document.createElement('div');
                row.className = 'bkbg-ec-appliance';

                function inp(val, w, type) {
                    var el = document.createElement('input');
                    el.className = 'bkbg-ec-input';
                    el.type = type || 'text';
                    el.value = val;
                    el.style.cssText = 'background:' + a.inputBg + ';border-color:#fcd34d;color:' + a.labelColor + ';width:' + (w || 100) + '%;';
                    return el;
                }

                var nameInp = inp(app.name, 100);
                nameInp.addEventListener('input', function () { appliances[idx].name = nameInp.value; renderAll(); });

                var wattsInp = inp(app.watts, 100, 'number');
                wattsInp.min = 0;
                wattsInp.addEventListener('input', function () { appliances[idx].watts = parseFloat(wattsInp.value) || 0; renderAll(); });

                var hoursInp = inp(app.hours, 100, 'number');
                hoursInp.min = 0; hoursInp.max = 24; hoursInp.step = '0.5';
                hoursInp.addEventListener('input', function () { appliances[idx].hours = parseFloat(hoursInp.value) || 0; renderAll(); });

                var cost = calcCost(app.watts, app.hours, rate);
                var costSpan = document.createElement('span');
                costSpan.className = 'bkbg-ec-cost-col';
                costSpan.style.cssText = 'font-weight:600;font-size:13px;color:' + a.accentColor + ';white-space:nowrap;';
                costSpan.textContent = fmt(cost.costMonth, a.currency);

                var rmBtn = document.createElement('button');
                rmBtn.className = 'bkbg-ec-remove-btn';
                rmBtn.textContent = '×';
                rmBtn.addEventListener('click', function () { appliances.splice(idx, 1); renderAll(); });

                [nameInp, wattsInp, hoursInp, costSpan, rmBtn].forEach(function (el) { row.appendChild(el); });
                appRows.appendChild(row);
            });

            if (appliances.length === 0) {
                var empty = document.createElement('div');
                empty.style.cssText = 'text-align:center;padding:20px;color:' + a.subtitleColor + ';font-size:14px;';
                empty.textContent = 'No appliances added yet. Use presets above or click "+ Add Appliance".';
                appRows.appendChild(empty);
            }

            // Totals
            var totalDay   = appliances.reduce(function (s, ap) { return s + calcCost(ap.watts, ap.hours, rate).costDay; }, 0);
            var totalMonth = totalDay * 30.44;
            var totalYear  = totalDay * 365;

            summaryEl.querySelector('[data-key="daily"]').textContent   = fmt(totalDay,   a.currency);
            summaryEl.querySelector('[data-key="monthly"]').textContent  = fmt(totalMonth, a.currency);
            summaryEl.querySelector('[data-key="yearly"]').textContent   = fmt(totalYear,  a.currency);

            // Chart
            if (chartEl) {
                var chartRows = chartEl.querySelector('div:last-child');
                chartRows.innerHTML = '';
                var maxMonth = Math.max.apply(null, appliances.map(function (ap) { return calcCost(ap.watts, ap.hours, rate).costMonth; }).concat([0.01]));
                appliances.forEach(function (ap) {
                    var c = calcCost(ap.watts, ap.hours, rate);
                    var frac = c.costMonth / maxMonth;
                    var barColor = costColor(frac, a.lowCostColor, a.highCostColor);
                    var row = document.createElement('div');
                    row.className = 'bkbg-ec-chart-row';
                    row.style.color = a.labelColor;

                    var lbl = document.createElement('div');
                    lbl.className = 'bkbg-ec-chart-label';
                    lbl.title = ap.name;
                    lbl.textContent = ap.name;

                    var barWrap = document.createElement('div');
                    barWrap.className = 'bkbg-ec-bar-wrap';
                    var bar = document.createElement('div');
                    bar.className = 'bkbg-ec-bar';
                    bar.style.cssText = 'width:' + (frac * 100) + '%;background:' + barColor + ';';
                    barWrap.appendChild(bar);

                    var val = document.createElement('div');
                    val.className = 'bkbg-ec-chart-val';
                    val.style.color = barColor;
                    val.textContent = fmt(c.costMonth, a.currency);

                    [lbl, barWrap, val].forEach(function (el) { row.appendChild(el); });
                    chartRows.appendChild(row);
                });
            }

            // Carbon
            if (carbonEl) {
                var totalKwhMonth = appliances.reduce(function (s, ap) { return s + calcCost(ap.watts, ap.hours, rate).kwhMonth; }, 0);
                var lbsCo2Month = totalKwhMonth * (parseFloat(a.carbonFactor) || 0.92);
                var kgCo2Month = lbsCo2Month * 0.453592;
                carbonEl.innerHTML = '<div class="bkbg-ec-carbon-icon">🌿</div>' +
                    '<div style="color:' + a.labelColor + '">' +
                    '<strong>' + fmtNum(totalKwhMonth, 1) + ' kWh</strong>/month · ' +
                    '<strong>' + fmtNum(kgCo2Month, 1) + ' kg CO₂</strong>/month estimated' +
                    '</div>';
            }
        }

        // Start with a couple of sample appliances
        appliances = [
            { name: 'Refrigerator', watts: 150, hours: 24 },
            { name: 'Laptop',       watts: 60,  hours: 8  },
            { name: 'LED TV 55"',   watts: 100, hours: 5  }
        ];
        renderAll();
    }

    function init() {
        document.querySelectorAll('.bkbg-ec-app').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
