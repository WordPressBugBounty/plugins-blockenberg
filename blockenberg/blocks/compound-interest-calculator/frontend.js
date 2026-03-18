(function () {
    'use strict';

    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        transform:'text-transform', decoration:'text-decoration',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    var _typoUnits = { size:'sizeUnit', lineHeight:'lineHeightUnit', letterSpacing:'letterSpacingUnit', wordSpacing:'wordSpacingUnit' };
    var _typoUnitDefaults = { size:'px', lineHeight:'', letterSpacing:'px', wordSpacing:'px' };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var prop = _typoKeys[k];
            var base = k.replace(/Desktop|Tablet|Mobile/, '');
            var uKey = _typoUnits[base];
            if (uKey && typeof v === 'number') v = v + (obj[uKey] || _typoUnitDefaults[base] || '');
            el.style.setProperty(prefix + prop, v);
        });
    }

    function calcCompound(principal, monthly, rateAnn, years, freq) {
        var n = freq;
        var r = rateAnn / 100;
        var rows = [];
        var balance = principal;
        for (var y = 1; y <= years; y++) {
            balance = balance * Math.pow(1 + r / n, n) + monthly * 12 * ((Math.pow(1 + r / n, n) - 1) / (r / n));
            var contributed = principal + monthly * 12 * y;
            var interest    = Math.max(0, balance - contributed);
            rows.push({ year: y, balance: balance, contributed: contributed, interest: interest });
        }
        return rows;
    }

    function fmt(sym, n) { return sym + Math.round(n).toLocaleString(); }

    function init(app) {
        var a;
        try { a = JSON.parse(app.getAttribute('data-opts')); } catch (e) { return; }

        var sym    = a.currency || '$';
        var accent = a.accentColor || '#6c3fb5';

        app.style.paddingTop    = (a.paddingTop    || 60) + 'px';
        app.style.paddingBottom = (a.paddingBottom || 60) + 'px';
        if (a.sectionBg) app.style.background = a.sectionBg;
        app.innerHTML = '';

        /* ── Typography CSS vars ── */
        typoCssVarsForEl(app, a.typoTitle, '--bkcic-title-');
        typoCssVarsForEl(app, a.typoResult, '--bkcic-result-');

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-cic-wrap';
        wrap.style.maxWidth     = (a.maxWidth    || 580) + 'px';
        wrap.style.borderRadius = (a.cardRadius  || 16)  + 'px';
        wrap.style.background   = a.cardBg || '#fff';
        app.appendChild(wrap);

        // Header
        if (a.showTitle || a.showSubtitle) {
            var header = document.createElement('div');
            header.className = 'bkbg-cic-header';
            if (a.showTitle && a.title) {
                var t = document.createElement('div');
                t.className = 'bkbg-cic-title';
                t.textContent = a.title;
                if (a.titleColor) t.style.color = a.titleColor;
                header.appendChild(t);
            }
            if (a.showSubtitle && a.subtitle) {
                var s = document.createElement('div');
                s.className = 'bkbg-cic-subtitle';
                s.textContent = a.subtitle;
                if (a.subtitleColor) s.style.color = a.subtitleColor;
                header.appendChild(s);
            }
            wrap.appendChild(header);
        }

        var ir = (a.inputRadius || 8) + 'px';
        var ib = '1.5px solid ' + (a.inputBorder || '#e5e7eb');

        function makeField(labelText, inputEl) {
            var f = document.createElement('div');
            f.className = 'bkbg-cic-field';
            var lbl = document.createElement('label');
            lbl.className = 'bkbg-cic-label';
            lbl.textContent = labelText;
            if (a.labelColor) lbl.style.color = a.labelColor;
            f.appendChild(lbl);
            f.appendChild(inputEl);
            return f;
        }

        function makeInput(val, min) {
            var inp = document.createElement('input');
            inp.type = 'number';
            inp.className = 'bkbg-cic-input';
            inp.value = val;
            inp.min = String(min || 0);
            inp.style.borderRadius = ir;
            inp.style.border = ib;
            return inp;
        }

        var principalInput = makeInput(a.defaultPrincipal || 10000);
        var monthlyInput   = makeInput(a.defaultMonthly   || 200);
        var rateInput      = makeInput(a.defaultRate       || 7);
        var yearsInput     = makeInput(a.defaultYears      || 20, 1);

        var row1 = document.createElement('div'); row1.className = 'bkbg-cic-row';
        row1.appendChild(makeField('Initial Investment (' + sym + ')', principalInput));
        row1.appendChild(makeField('Monthly Contribution (' + sym + ')', monthlyInput));
        wrap.appendChild(row1);

        var row2 = document.createElement('div'); row2.className = 'bkbg-cic-row';
        row2.appendChild(makeField('Annual Rate (%)', rateInput));
        row2.appendChild(makeField('Years', yearsInput));
        wrap.appendChild(row2);

        // Frequency select
        var freqWrap = document.createElement('div');
        freqWrap.className = 'bkbg-cic-freq-field';
        var freqLbl = document.createElement('label');
        freqLbl.className = 'bkbg-cic-label';
        freqLbl.textContent = 'Compound Frequency';
        if (a.labelColor) freqLbl.style.color = a.labelColor;
        var freqSel = document.createElement('select');
        freqSel.className = 'bkbg-cic-select';
        freqSel.style.borderRadius = ir;
        freqSel.style.border = ib;
        [['1','Annually (1×/year)'],['2','Semi-annually (2×/yr)'],['4','Quarterly (4×/yr)'],['12','Monthly (12×/yr)'],['365','Daily (365×/yr)']].forEach(function(o) {
            var opt = document.createElement('option');
            opt.value = o[0];
            opt.textContent = o[1];
            if (o[0] === String(a.defaultFrequency || '12')) opt.selected = true;
            freqSel.appendChild(opt);
        });
        freqWrap.appendChild(freqLbl);
        freqWrap.appendChild(freqSel);
        wrap.appendChild(freqWrap);

        // Result card
        var resultCard = document.createElement('div');
        resultCard.className = 'bkbg-cic-result';
        resultCard.style.background   = a.resultBg || accent;
        resultCard.style.borderRadius = ir;

        var resultLabel = document.createElement('div');
        resultLabel.className = 'bkbg-cic-result-label';
        resultLabel.style.color = a.resultColor || '#fff';

        var resultAmount = document.createElement('div');
        resultAmount.className = 'bkbg-cic-result-amount';
        resultAmount.style.color    = a.resultColor || '#fff';

        var breakdown = document.createElement('div');
        breakdown.className = 'bkbg-cic-result-breakdown';

        var contribDiv = document.createElement('div');
        var contribSLbl = document.createElement('div'); contribSLbl.className = 'bkbg-cic-result-sub-label'; contribSLbl.style.color = a.resultColor||'#fff'; contribSLbl.textContent = 'Principal + Contributions';
        var contribSVal = document.createElement('div'); contribSVal.className = 'bkbg-cic-result-sub-value'; contribSVal.style.color = a.principalColor||'#93c5fd';
        contribDiv.appendChild(contribSLbl); contribDiv.appendChild(contribSVal);

        var interestDiv = document.createElement('div');
        var interestSLbl = document.createElement('div'); interestSLbl.className = 'bkbg-cic-result-sub-label'; interestSLbl.style.color = a.resultColor||'#fff'; interestSLbl.textContent = 'Interest Earned';
        var interestSVal = document.createElement('div'); interestSVal.className = 'bkbg-cic-result-sub-value'; interestSVal.style.color = a.interestColor||'#6ee7b7';
        interestDiv.appendChild(interestSLbl); interestDiv.appendChild(interestSVal);

        breakdown.appendChild(contribDiv);
        breakdown.appendChild(interestDiv);
        resultCard.appendChild(resultLabel);
        resultCard.appendChild(resultAmount);
        resultCard.appendChild(breakdown);
        wrap.appendChild(resultCard);

        // Bar
        var barWrap  = document.createElement('div'); barWrap.className = 'bkbg-cic-bar-wrap';
        var barTrack = document.createElement('div'); barTrack.className = 'bkbg-cic-bar-track'; barTrack.style.background = a.tableBorder || '#e5e7eb';
        var barInner = document.createElement('div'); barInner.className = 'bkbg-cic-bar-inner';
        var barPrin  = document.createElement('div'); barPrin.className  = 'bkbg-cic-bar-principal'; barPrin.style.background = a.principalColor || '#3b82f6';
        var barInt   = document.createElement('div'); barInt.className   = 'bkbg-cic-bar-interest';  barInt.style.background  = a.interestColor  || '#10b981';
        barInner.appendChild(barPrin); barInner.appendChild(barInt);
        barTrack.appendChild(barInner);
        var barLegend = document.createElement('div'); barLegend.className = 'bkbg-cic-bar-legend';
        var legPrin = document.createElement('span'); var legInt = document.createElement('span');
        barLegend.appendChild(legPrin); barLegend.appendChild(legInt);
        barWrap.appendChild(barTrack); barWrap.appendChild(barLegend);
        wrap.appendChild(barWrap);

        // Table
        var tableWrap = null, tbody = null;
        if (a.showTable) {
            tableWrap = document.createElement('div');
            tableWrap.className = 'bkbg-cic-table-wrap';
            var table = document.createElement('table');
            table.className = 'bkbg-cic-table';
            if (a.tableBg) table.style.background = a.tableBg;
            var thead = document.createElement('thead');
            var headRow = document.createElement('tr');
            ['Year','Balance','Contributed','Interest Earned'].forEach(function(h) {
                var th = document.createElement('th');
                th.textContent = h;
                if (a.tableHeaderBg) th.style.background = a.tableHeaderBg;
                if (a.labelColor)    th.style.color      = a.labelColor;
                if (a.tableBorder)   th.style.borderBottomColor = a.tableBorder;
                headRow.appendChild(th);
            });
            thead.appendChild(headRow);
            table.appendChild(thead);
            tbody = document.createElement('tbody');
            table.appendChild(tbody);
            tableWrap.appendChild(table);
            wrap.appendChild(tableWrap);
        }

        function recalculate() {
            var principal = parseFloat(principalInput.value) || 0;
            var monthly   = parseFloat(monthlyInput.value)   || 0;
            var rate      = parseFloat(rateInput.value)      || 0;
            var years     = Math.max(1, parseInt(yearsInput.value) || 1);
            var freq      = parseInt(freqSel.value) || 12;

            var rows = calcCompound(principal, monthly, rate, years, freq);
            var last = rows[rows.length - 1] || { balance: 0, contributed: principal, interest: 0 };
            var contributed = principal + monthly * 12 * years;
            var interest    = Math.max(0, last.balance - contributed);

            resultLabel.textContent  = 'Future Value after ' + years + ' years';
            resultAmount.textContent = fmt(sym, last.balance);
            contribSVal.textContent  = fmt(sym, contributed);
            interestSVal.textContent = fmt(sym, interest);

            var pct = last.balance > 0 ? contributed / last.balance * 100 : 100;
            barPrin.style.width = pct + '%';
            legPrin.textContent = '■ Principal & Contributions (' + Math.round(pct) + '%)';
            legInt.textContent  = '■ Interest (' + Math.round(100 - pct) + '%)';

            if (tbody) {
                tbody.innerHTML = '';
                var limit = a.tableRows || 10;
                rows.slice(0, limit).forEach(function(row) {
                    var tr = document.createElement('tr');
                    [
                        { val: row.year, color: a.labelColor || '#374151', bold: false },
                        { val: fmt(sym, row.balance),     color: '#1f2937', bold: true  },
                        { val: fmt(sym, row.contributed), color: a.principalColor || '#3b82f6', bold: false },
                        { val: fmt(sym, row.interest),    color: a.interestColor  || '#10b981', bold: false }
                    ].forEach(function(cell) {
                        var td = document.createElement('td');
                        td.textContent = cell.val;
                        td.style.color = cell.color;
                        if (cell.bold) td.style.fontWeight = '700';
                        if (a.tableBorder) td.style.borderBottomColor = a.tableBorder;
                        tr.appendChild(td);
                    });
                    tbody.appendChild(tr);
                });
            }
        }

        [principalInput, monthlyInput, rateInput, yearsInput, freqSel].forEach(function(el) {
            el.addEventListener('input', recalculate);
            el.addEventListener('change', recalculate);
        });

        recalculate();
    }

    document.querySelectorAll('.bkbg-cic-app').forEach(init);
})();
