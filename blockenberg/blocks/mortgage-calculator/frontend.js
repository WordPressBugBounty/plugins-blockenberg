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

    var TERM_OPTIONS = [
        { value: 10, label: '10 years' }, { value: 15, label: '15 years' },
        { value: 20, label: '20 years' }, { value: 25, label: '25 years' },
        { value: 30, label: '30 years' },
    ];

    function calcMortgage(price, downPct, rate, years) {
        var down      = price * downPct / 100;
        var principal = price - down;
        var n         = years * 12;
        var r         = rate / 100 / 12;
        var monthly   = r === 0 ? principal / n : principal * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1);
        var totalPaid = monthly * n;
        var totalInterest = totalPaid - principal;
        var rows = [], balance = principal;
        for (var y = 1; y <= years; y++) {
            var yp = 0, yi = 0;
            for (var m = 0; m < 12; m++) {
                var ip = balance * r, pp = monthly - ip;
                yi += ip; yp += pp; balance -= pp;
            }
            rows.push({ year: y, principal: yp, interest: yi, balance: Math.max(0, balance) });
        }
        return { monthly: monthly, totalPaid: totalPaid, totalInterest: totalInterest, principal: principal, down: down, rows: rows };
    }

    function fmt(val, cur, pos) {
        return pos === 'after' ? Math.round(val).toLocaleString('en-US') + ' ' + cur : cur + Math.round(val).toLocaleString('en-US');
    }

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var accent     = opts.accentColor    || '#6c3fb5';
        var cardBg     = opts.cardBg         || '#ffffff';
        var resultBg   = opts.resultBg       || '#f5f3ff';
        var resultBdr  = opts.resultBorder   || '#ede9fe';
        var totalClr   = opts.totalColor     || accent;
        var priClr     = opts.principalColor || '#3b82f6';
        var intClr     = opts.interestColor  || '#ef4444';
        var pmiClr     = opts.pmiColor       || '#f59e0b';
        var lclr       = opts.labelColor     || '#374151';
        var tableBg    = opts.tableBg        || '#fafafa';
        var cRadius    = (opts.cardRadius    || 16) + 'px';
        var iRadius    = (opts.inputRadius   || 8)  + 'px';
        var maxW       = (opts.maxWidth      || 680) + 'px';
        var ptop       = (opts.paddingTop    || 60) + 'px';
        var pbot       = (opts.paddingBottom || 60) + 'px';
        var cur        = opts.currency    || '$';
        var curPos     = opts.currencyPos || 'before';
        var fmtM       = function (v) { return fmt(v, cur, curPos); };

        var state = {
            price: opts.defaultPrice || 350000,
            down:  opts.defaultDown  || 20,
            rate:  opts.defaultRate  || 6.5,
            term:  opts.defaultTerm  || 30,
        };

        /* Card */
        var card = document.createElement('div');
        card.className = 'bkbg-mtg-card';
        card.style.cssText = 'background:' + cardBg + ';border-radius:' + cRadius + ';max-width:' + maxW + ';margin:0 auto;padding:' + ptop + ' 32px ' + pbot;
        app.innerHTML = '';
        app.appendChild(card);

        /* Title */
        if (opts.showTitle !== false && opts.title) {
            var h2 = document.createElement('h2');
            h2.className = 'bkbg-mtg-title';
            h2.style.cssText = 'color:' + (opts.titleColor||'#1e1b4b') + ';margin:0 0 8px;text-align:center';
            h2.textContent = opts.title;
            card.appendChild(h2);
        }
        if (opts.showSubtitle !== false && opts.subtitle) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-mtg-subtitle';
            sub.style.cssText = 'color:' + (opts.subtitleColor||'#6b7280') + ';text-align:center;margin:0 0 24px';
            sub.textContent = opts.subtitle;
            card.appendChild(sub);
        }

        /* Helpers */
        var inpCSS = 'width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:' + iRadius + ';font-size:15px;box-sizing:border-box;outline:none;background:#fff;color:' + lclr;

        function mkLabel(txt) {
            var l = document.createElement('label');
            l.style.cssText = 'font-size:13px;font-weight:600;color:' + lclr + ';display:block;margin-bottom:4px';
            l.textContent = txt;
            return l;
        }
        function mkField(label, inp) {
            var d = document.createElement('div');
            d.style.marginBottom = '14px';
            d.appendChild(mkLabel(label));
            d.appendChild(inp);
            return d;
        }
        function mkNum(val, min, max, step, onChange) {
            var i = document.createElement('input');
            i.type = 'number'; i.value = val; i.min = min; i.max = max; i.step = step; i.style.cssText = inpCSS;
            i.addEventListener('input', function () { onChange(parseFloat(i.value)||0); });
            return i;
        }

        /* Inputs */
        card.appendChild(mkField('Home Price (' + cur + ')', mkNum(state.price, 10000, 10000000, 1000, function(v){state.price=v; update();})));
        card.appendChild(mkField('Down Payment (%)',          mkNum(state.down,  0, 99, 0.5,  function(v){state.down=Math.min(99,Math.max(0,v)); update();})));
        card.appendChild(mkField('Annual Interest Rate (%)',  mkNum(state.rate,  0.1, 30, 0.1, function(v){state.rate=v; update();})));

        var termSel = document.createElement('select');
        termSel.style.cssText = inpCSS + ';appearance:auto';
        TERM_OPTIONS.forEach(function (o) {
            var opt = document.createElement('option');
            opt.value = o.value; opt.textContent = o.label;
            if (o.value === state.term) opt.selected = true;
            termSel.appendChild(opt);
        });
        termSel.addEventListener('change', function () { state.term = parseInt(termSel.value); update(); });
        card.appendChild(mkField('Loan Term', termSel));

        /* Result */
        var resultBox = document.createElement('div');
        resultBox.className = 'bkbg-mtg-result';
        resultBox.style.cssText = 'background:' + resultBg + ';border:1.5px solid ' + resultBdr + ';border-radius:' + cRadius + ';padding:24px;text-align:center;margin-bottom:20px';
        var rLbl = document.createElement('div');
        rLbl.style.cssText = 'font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px';
        rLbl.textContent = 'Monthly Payment';
        var rNum = document.createElement('div');
        rNum.className = 'bkbg-mtg-monthly';
        rNum.style.cssText = 'color:' + totalClr + ';margin-bottom:4px';
        var rSub = document.createElement('div');
        rSub.style.cssText = 'font-size:13px;color:#9ca3af';
        var rPMI = document.createElement('div');
        rPMI.className = 'bkbg-mtg-pmi-note';
        rPMI.style.cssText = 'margin-top:8px;font-size:13px;color:' + pmiClr;
        resultBox.appendChild(rLbl); resultBox.appendChild(rNum); resultBox.appendChild(rSub); resultBox.appendChild(rPMI);
        card.appendChild(resultBox);

        /* Breakdown */
        var breakdown, stat1, stat2, stat3;
        if (opts.showBreakdown !== false) {
            breakdown = document.createElement('div');
            breakdown.className = 'bkbg-mtg-breakdown';
            breakdown.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px';
            function mkStat(lbl, color) {
                var d = document.createElement('div');
                d.style.cssText = 'text-align:center;background:#fff;border-radius:10px;padding:14px 12px;border:1.5px solid #e5e7eb';
                d.innerHTML = '<div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;margin-bottom:4px">' + lbl + '</div>' +
                    '<div style="font-size:18px;font-weight:800;color:' + color + '">—</div>';
                return d;
            }
            stat1 = mkStat('Loan Amount',    priClr);
            stat2 = mkStat('Total Interest', intClr);
            stat3 = mkStat('Total Cost',     totalClr);
            breakdown.appendChild(stat1); breakdown.appendChild(stat2); breakdown.appendChild(stat3);
            card.appendChild(breakdown);
        }

        /* LTV */
        var ltvDiv;
        if (opts.showLTV !== false) {
            ltvDiv = document.createElement('div');
            ltvDiv.className = 'bkbg-mtg-ltv';
            ltvDiv.style.cssText = 'text-align:center;margin-bottom:20px;font-size:14px;color:' + lclr;
            card.appendChild(ltvDiv);
        }

        /* Year table */
        var tableWrap;
        if (opts.showYearTable !== false) {
            tableWrap = document.createElement('div');
            tableWrap.className = 'bkbg-mtg-table-wrap';
            tableWrap.style.overflowX = 'auto';
            card.appendChild(tableWrap);
        }

        /* Update */
        function update() {
            var calc     = calcMortgage(state.price, state.down, state.rate, state.term);
            var ltv      = Math.round(calc.principal / state.price * 100);
            var showPMI  = opts.showPMI !== false && state.down < 20;
            var pmi      = showPMI ? (calc.principal * (opts.pmiRate || 0.5) / 100 / 12) : 0;
            var total    = calc.monthly + pmi;

            rNum.textContent = fmtM(total);
            rSub.textContent = 'per month' + (showPMI ? ' (incl. PMI)' : '');
            rPMI.style.display = showPMI ? '' : 'none';
            if (showPMI) rPMI.textContent = 'PMI: ' + fmtM(pmi) + '/mo (down payment < 20%)';

            if (breakdown) {
                stat1.querySelector('div:last-child').textContent = fmtM(calc.principal);
                stat2.querySelector('div:last-child').textContent = fmtM(calc.totalInterest);
                stat3.querySelector('div:last-child').textContent = fmtM(calc.totalPaid);
            }

            if (ltvDiv) {
                var ltvColor = ltv >= 80 ? intClr : priClr;
                ltvDiv.innerHTML = 'Loan-to-Value (LTV): <strong style="color:' + ltvColor + '">' + ltv + '%</strong>' +
                    (ltv >= 80 ? ' — PMI may apply' : ' — no PMI required');
            }

            if (tableWrap) {
                tableWrap.innerHTML = '';
                var maxRows = opts.tableRows || 10;
                var table = document.createElement('table');
                table.className = 'bkbg-mtg-table';
                table.style.cssText = 'width:100%;border-collapse:collapse;font-size:13px';
                var thead = document.createElement('thead');
                var hrow = document.createElement('tr');
                hrow.style.background = tableBg;
                ['Year','Balance','Principal Paid','Interest Paid'].forEach(function (h, i) {
                    var th = document.createElement('th');
                    th.textContent = h;
                    th.style.cssText = 'padding:10px 8px;font-weight:700;color:' + lclr + ';border-bottom:2px solid #e5e7eb;text-align:' + (i===0?'left':'right');
                    hrow.appendChild(th);
                });
                thead.appendChild(hrow);
                table.appendChild(thead);
                var tbody = document.createElement('tbody');
                calc.rows.slice(0, maxRows).forEach(function (row, idx) {
                    var tr = document.createElement('tr');
                    var last = idx === Math.min(calc.rows.length, maxRows) - 1;
                    tr.style.cssText = 'background:' + (idx%2===0?'#fff':tableBg) + ';border-bottom:1px solid #f0f0f0;' + (last?'font-weight:700':'');
                    var td0 = document.createElement('td'); td0.style.cssText = 'padding:9px 8px;color:' + lclr; td0.textContent = 'Year ' + row.year;
                    var td1 = document.createElement('td'); td1.style.cssText = 'padding:9px 8px;text-align:right;color:' + totalClr; td1.textContent = fmtM(row.balance);
                    var td2 = document.createElement('td'); td2.style.cssText = 'padding:9px 8px;text-align:right;color:' + priClr; td2.textContent = fmtM(row.principal);
                    var td3 = document.createElement('td'); td3.style.cssText = 'padding:9px 8px;text-align:right;color:' + intClr; td3.textContent = fmtM(row.interest);
                    tr.appendChild(td0); tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);
                tableWrap.appendChild(table);
            }
        }

        /* Typography CSS vars */
        typoCssVarsForEl(app, opts.titleTypo, '--bkbg-mtg-tt-');
        typoCssVarsForEl(app, opts.subtitleTypo, '--bkbg-mtg-st-');
        typoCssVarsForEl(app, opts.resultTypo, '--bkbg-mtg-rs-');

        update();
    }

    document.querySelectorAll('.bkbg-mtg-app').forEach(buildApp);
})();
