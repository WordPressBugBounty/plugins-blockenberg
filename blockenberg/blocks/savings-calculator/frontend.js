(function () {
    'use strict';

    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    var COMPOUNDING_N = { monthly: 12, quarterly: 4, annually: 1 };
    var COMPOUNDING_OPTIONS = [
        { value: 'monthly',   label: 'Monthly (12×/year)' },
        { value: 'quarterly', label: 'Quarterly (4×/year)' },
        { value: 'annually',  label: 'Annually (1×/year)' },
    ];

    function calcSavings(initial, monthly, rate, years, compounding) {
        var n = COMPOUNDING_N[compounding] || 12;
        var r = rate / 100 / n;
        var periods = years * n;
        var monthsPerPeriod = 12 / n;
        var balance = initial;
        var totalContrib = initial;
        var rows = [];

        for (var p = 1; p <= periods; p++) {
            balance = balance * (1 + r) + monthly * monthsPerPeriod;
            totalContrib += monthly * monthsPerPeriod;
            if (p % n === 0) {
                rows.push({
                    year: p / n,
                    balance: balance,
                    contributed: totalContrib,
                    interest: balance - totalContrib,
                });
            }
        }
        return { finalBalance: balance, totalContributed: totalContrib, totalInterest: balance - totalContrib, rows: rows };
    }

    function fmtMoney(val, cur, pos) {
        var rounded = Math.round(val).toLocaleString('en-US');
        return pos === 'after' ? rounded + ' ' + cur : cur + rounded;
    }

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var accent    = opts.accentColor      || '#6c3fb5';
        var cardBg    = opts.cardBg           || '#ffffff';
        var resultBg  = opts.resultBg         || '#f5f3ff';
        var resultBdr = opts.resultBorder     || '#ede9fe';
        var totalClr  = opts.totalColor       || accent;
        var contribClr= opts.contributedColor || '#3b82f6';
        var interestClr=opts.interestColor    || '#10b981';
        var tableBg   = opts.tableBg          || '#fafafa';
        var titleClr  = opts.titleColor       || '#1e1b4b';
        var subClr    = opts.subtitleColor    || '#6b7280';
        var labelClr  = opts.labelColor       || '#374151';
        var cRadius   = (opts.cardRadius !== undefined ? opts.cardRadius : 16) + 'px';
        var iRadius   = (opts.inputRadius!== undefined ? opts.inputRadius: 8)  + 'px';
        var maxW      = (opts.maxWidth   || 680) + 'px';
        var ptop      = (opts.paddingTop !== undefined ? opts.paddingTop  : 60) + 'px';
        var pbot      = (opts.paddingBottom!== undefined ? opts.paddingBottom : 60) + 'px';
        var titleSz   = (opts.titleSize  || 26) + 'px';
        var resultSz  = (opts.resultSize || 44) + 'px';
        var cur       = opts.currency    || '$';
        var curPos    = opts.currencyPos || 'before';
        var fmt       = function (v) { return fmtMoney(v, cur, curPos); };

        var state = {
            initial:     opts.defaultInitial    || 5000,
            monthly:     opts.defaultMonthly    || 200,
            rate:        opts.defaultRate       || 7,
            years:       opts.defaultYears      || 10,
            compounding: opts.defaultCompounding|| 'monthly',
        };

        /* Card */
        var card = document.createElement('div');
        card.className = 'bkbg-sav-card';
        card.style.cssText = [
            'background:' + cardBg,
            'border-radius:' + cRadius,
            'padding-top:' + ptop,
            'padding-bottom:' + pbot,
            'padding-left:32px',
            'padding-right:32px',
            'max-width:' + maxW,
            'margin:0 auto',
        ].join(';');
        app.innerHTML = '';
        app.appendChild(card);

        /* Title */
        if (opts.showTitle !== false && opts.title) {
            var h2 = document.createElement('h2');
            h2.className = 'bkbg-sav-title';
            h2.style.cssText = 'color:' + titleClr + ';text-align:center;margin-top:0;margin-bottom:8px';
            h2.textContent = opts.title;
            card.appendChild(h2);
        }

        /* Subtitle */
        if (opts.showSubtitle !== false && opts.subtitle) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-sav-subtitle';
            sub.style.cssText = 'color:' + subClr + ';text-align:center;margin-top:0;margin-bottom:28px';
            sub.textContent = opts.subtitle;
            card.appendChild(sub);
        }

        /* ── Slider builder ─────────────────────────────────────────────── */
        var sliderRefs = {};
        var sliderValRefs = {};

        function makeSlider(key, label, min, max, step, displayFn) {
            var row = document.createElement('div');
            row.className = 'bkbg-sav-slider-row';
            var top = document.createElement('div');
            top.className = 'bkbg-sav-slider-top';
            var lbl = document.createElement('span');
            lbl.className = 'bkbg-sav-slider-label';
            lbl.style.color = labelClr;
            lbl.textContent = label;
            var val = document.createElement('span');
            val.className = 'bkbg-sav-slider-val';
            val.style.color = accent;
            val.textContent = displayFn(state[key]);
            sliderValRefs[key] = val;
            top.appendChild(lbl);
            top.appendChild(val);
            row.appendChild(top);

            var inp = document.createElement('input');
            inp.type = 'range';
            inp.className = 'bkbg-sav-slider';
            inp.min = min;
            inp.max = max;
            inp.step = step;
            inp.value = state[key];
            inp.style.accentColor = accent;
            inp.addEventListener('input', function () {
                state[key] = parseFloat(inp.value);
                val.textContent = displayFn(state[key]);
                update();
            });
            sliderRefs[key] = inp;
            row.appendChild(inp);
            card.appendChild(row);
        }

        makeSlider('initial',  'Initial Deposit',            0, 100000, 500, function (v) { return fmt(v); });
        makeSlider('monthly',  'Monthly Contribution',        0, 5000,   50, function (v) { return fmt(v); });
        makeSlider('rate',     'Annual Interest Rate',       0.1, 20,  0.1, function (v) { return v + '%'; });
        makeSlider('years',    'Time Period (Years)',          1, 40,    1, function (v) { return v + ' yrs'; });

        /* Compounding select */
        var selRow = document.createElement('div');
        selRow.className = 'bkbg-sav-select-row';
        var selLabel = document.createElement('label');
        selLabel.className = 'bkbg-sav-select-label';
        selLabel.style.color = labelClr;
        selLabel.textContent = 'Compounding Frequency';
        var sel = document.createElement('select');
        sel.className = 'bkbg-sav-select';
        sel.style.borderRadius = iRadius;
        COMPOUNDING_OPTIONS.forEach(function (o) {
            var opt = document.createElement('option');
            opt.value = o.value;
            opt.textContent = o.label;
            if (o.value === state.compounding) opt.selected = true;
            sel.appendChild(opt);
        });
        sel.addEventListener('change', function () { state.compounding = sel.value; update(); });
        selRow.appendChild(selLabel);
        selRow.appendChild(sel);
        card.appendChild(selRow);

        /* Result box */
        var resultBox = document.createElement('div');
        resultBox.className = 'bkbg-sav-result';
        resultBox.style.cssText = 'background:' + resultBg + ';border:1.5px solid ' + resultBdr + ';border-radius:' + cRadius + ';padding:24px';
        card.appendChild(resultBox);

        /* Year table */
        var tableWrap;
        if (opts.showYearTable !== false) {
            tableWrap = document.createElement('div');
            tableWrap.className = 'bkbg-sav-table-wrap';
            card.appendChild(tableWrap);
        }

        /* ── Update results ─────────────────────────────────────────────── */
        function update() {
            var calc = calcSavings(state.initial, state.monthly, state.rate, state.years, state.compounding);

            /* Result box */
            resultBox.innerHTML = '';

            /* Total */
            var totalDiv = document.createElement('div');
            totalDiv.className = 'bkbg-sav-total';
            var tLbl = document.createElement('div');
            tLbl.className = 'bkbg-sav-total-label';
            tLbl.textContent = 'Total Savings';
            var tNum = document.createElement('div');
            tNum.className = 'bkbg-sav-total-num';
            tNum.style.cssText = 'font-size:' + resultSz + ';color:' + totalClr;
            tNum.textContent = fmt(calc.finalBalance);
            totalDiv.appendChild(tLbl);
            totalDiv.appendChild(tNum);
            resultBox.appendChild(totalDiv);

            /* Breakdown */
            var bdGrid = document.createElement('div');
            bdGrid.className = 'bkbg-sav-breakdown';
            if (opts.showContributedBreakdown !== false) {
                var c1 = document.createElement('div');
                c1.className = 'bkbg-sav-breakdown-item';
                c1.innerHTML = '<div class="bkbg-sav-breakdown-label">Total Contributed</div>' +
                    '<div class="bkbg-sav-breakdown-val" style="color:' + contribClr + '">' + fmt(calc.totalContributed) + '</div>';
                bdGrid.appendChild(c1);
            }
            if (opts.showInterestBreakdown !== false) {
                var c2 = document.createElement('div');
                c2.className = 'bkbg-sav-breakdown-item';
                c2.innerHTML = '<div class="bkbg-sav-breakdown-label">Interest Earned</div>' +
                    '<div class="bkbg-sav-breakdown-val" style="color:' + interestClr + '">' + fmt(calc.totalInterest) + '</div>';
                bdGrid.appendChild(c2);
            }
            resultBox.appendChild(bdGrid);

            /* Table */
            if (tableWrap) {
                tableWrap.innerHTML = '';
                var maxRows = opts.tableRows || 10;
                var table = document.createElement('table');
                table.className = 'bkbg-sav-table';

                var thead = document.createElement('thead');
                var hrow = document.createElement('tr');
                hrow.style.background = tableBg;
                ['Year', 'Balance', 'Contributed', 'Interest'].forEach(function (h) {
                    var th = document.createElement('th');
                    th.textContent = h;
                    hrow.appendChild(th);
                });
                thead.appendChild(hrow);
                table.appendChild(thead);

                var tbody = document.createElement('tbody');
                calc.rows.slice(0, maxRows).forEach(function (row, idx) {
                    var tr = document.createElement('tr');
                    if ((idx + 1) === Math.min(calc.rows.length, maxRows)) {
                        tr.style.fontWeight = '700';
                    }
                    var tdYear = document.createElement('td');
                    tdYear.style.cssText = 'color:#374151;font-weight:600';
                    tdYear.textContent = 'Year ' + row.year;
                    var tdBal = document.createElement('td');
                    tdBal.style.color = totalClr;
                    tdBal.style.fontWeight = '700';
                    tdBal.textContent = fmt(row.balance);
                    var tdCon = document.createElement('td');
                    tdCon.style.color = contribClr;
                    tdCon.textContent = fmt(row.contributed);
                    var tdInt = document.createElement('td');
                    tdInt.style.color = interestClr;
                    tdInt.textContent = fmt(row.interest);
                    tr.appendChild(tdYear);
                    tr.appendChild(tdBal);
                    tr.appendChild(tdCon);
                    tr.appendChild(tdInt);
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);
                tableWrap.appendChild(table);
            }
        }

        update();

        typoCssVarsForEl(card, opts.titleTypo, '--bksav-tt-');
        typoCssVarsForEl(card, opts.subtitleTypo, '--bksav-st-');
    }

    document.querySelectorAll('.bkbg-sav-app').forEach(buildApp);
})();
