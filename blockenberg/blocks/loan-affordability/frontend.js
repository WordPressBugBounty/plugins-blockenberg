(function () {
    'use strict';

    var _typoKeys = {
        family: 'font-family', weight: 'font-weight', style: 'font-style',
        decoration: 'text-decoration', transform: 'text-transform',
        sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
        lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
        letterSpacing: 'letter-spacing', wordSpacing: 'word-spacing'
    };
    function typoCssVarsForEl(el, typo, prefix) {
        if (!typo || typeof typo !== 'object') return;
        Object.keys(typo).forEach(function (k) {
            var v = typo[k]; if (v === '' || v == null) return;
            var css = _typoKeys[k]; if (!css) return;
            if ((k === 'letterSpacing' || k === 'wordSpacing') && typeof v === 'number') v = v + 'px';
            if ((/^(sizeDesktop|sizeTablet|sizeMobile)$/).test(k) && typeof v === 'number') v = v + 'px';
            el.style.setProperty(prefix + css, '' + v);
        });
    }

    function calcAffordability(income, monthlyDebts, rate, years, downPct, feRatio, beRatio, incomeShare, paymentMode) {
        var monthlyIncome = income / 12;
        var maxFront = monthlyIncome * (feRatio / 100);
        var maxBack  = monthlyIncome * (beRatio / 100) - monthlyDebts;
        var maxDti   = Math.max(0, Math.min(maxFront, maxBack));
        var maxShare = Math.max(0, monthlyIncome * ((incomeShare || 30) / 100));
        var mode = paymentMode || 'min';
        var maxPmt;

        if (mode === 'incomeShare') {
            maxPmt = maxShare;
        } else if (mode === 'dti') {
            maxPmt = maxDti;
        } else {
            maxPmt = Math.min(maxDti, maxShare);
        }
        var r = rate / 100 / 12;
        var n = years * 12;
        var maxLoan = r === 0 ? maxPmt * n : maxPmt * ((1 - Math.pow(1 + r, -n)) / r);
        var downAmount = maxLoan > 0 ? (maxLoan / (1 - downPct / 100)) * (downPct / 100) : 0;
        var maxHome    = maxLoan + downAmount;
        var dti        = monthlyIncome > 0 ? ((maxPmt + monthlyDebts) / monthlyIncome) * 100 : 0;
        return { maxHome: Math.max(0, maxHome), maxLoan: Math.max(0, maxLoan), maxMonthly: maxPmt, downAmount: Math.max(0, downAmount), dti: dti };
    }

    function fmtMoney(val, cur, pos) {
        var s = Math.round(val).toLocaleString('en-US');
        return pos === 'after' ? s + cur : cur + s;
    }

    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function buildApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) { return; }
        var o = opts;
        var accent = o.accentColor || '#6c3fb5';
        var cur    = o.currency || '$';
        var pos    = o.currencyPos || 'before';

        app.style.paddingTop    = (o.paddingTop || 60) + 'px';
        app.style.paddingBottom = (o.paddingBottom || 60) + 'px';
        if (o.sectionBg) app.style.background = o.sectionBg;

        typoCssVarsForEl(app, o.titleTypo,  '--bkbg-la-tt-');
        typoCssVarsForEl(app, o.resultTypo, '--bkbg-la-rt-');

        var maxW = (o.maxWidth || 680) + 'px';

        /* Header */
        if (o.showTitle || o.showSubtitle) {
            var hdr = document.createElement('div');
            hdr.style.cssText = 'text-align:center;margin-bottom:32px;max-width:' + maxW + ';margin-left:auto;margin-right:auto';
            if (o.showTitle && o.title) {
                var ht = document.createElement('h3');
                ht.className = 'bkbg-la-title';
                ht.textContent = o.title;
                ht.style.color = o.titleColor || '#1e1b4b';
                hdr.appendChild(ht);
            }
            if (o.showSubtitle && o.subtitle) {
                var hs = document.createElement('p');
                hs.className = 'bkbg-la-subtitle';
                hs.textContent = o.subtitle;
                hs.style.color = o.subtitleColor || '#6b7280';
                hdr.appendChild(hs);
            }
            app.appendChild(hdr);
        }

        /* Card */
        var card = document.createElement('div');
        card.className = 'bkbg-la-card';
        card.style.cssText = 'background:' + (o.cardBg || '#fff') + ';border-radius:' + (o.cardRadius || 16) + 'px;padding:32px;max-width:' + maxW + ';margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,0.06)';
        app.appendChild(card);

        /* State */
        var state = {
            income: o.defaultIncome || 75000,
            debts:  o.defaultDebts  || 500,
            rate:   o.defaultRate   || 6.5,
            term:   o.defaultTerm   || 30,
            down:   o.defaultDown   || 20
        };

        /* Hero result box */
        var hero = document.createElement('div');
        hero.className = 'bkbg-la-hero';
        hero.style.cssText = 'background:' + (o.resultBg || '#f5f3ff') + ';border:2px solid ' + (o.resultBorder || '#ede9fe') + ';border-radius:' + (o.cardRadius || 16) + 'px;padding:28px 32px;text-align:center;margin-bottom:24px';
        card.appendChild(hero);

        /* Input rows */
        function makeRow(label, stateKey, pfx, sfx, step) {
            var row = document.createElement('div');
            row.className = 'bkbg-la-input-row';
            var lbl = document.createElement('label');
            lbl.textContent = label;
            lbl.style.cssText = 'font-size:14px;color:' + (o.labelColor || '#374151');
            var right = document.createElement('div');
            right.style.cssText = 'display:flex;align-items:center;gap:6px';
            if (pfx) {
                var ps = document.createElement('span');
                ps.textContent = pfx;
                ps.style.cssText = 'color:' + (o.subtitleColor || '#6b7280') + ';font-size:13px';
                right.appendChild(ps);
            }
            var inp = document.createElement('input');
            inp.type = 'number'; inp.value = state[stateKey]; inp.min = '0'; inp.step = step || '1';
            inp.style.cssText = 'width:110px;text-align:right;border:1px solid #d1d5db;border-radius:' + (o.inputRadius || 8) + 'px;padding:5px 8px;font-size:14px;box-sizing:border-box';
            inp.addEventListener('input', function () { state[stateKey] = parseFloat(inp.value) || 0; update(); });
            right.appendChild(inp);
            if (sfx) {
                var ss = document.createElement('span');
                ss.textContent = sfx;
                ss.style.cssText = 'color:' + (o.subtitleColor || '#6b7280') + ';font-size:13px';
                right.appendChild(ss);
            }
            row.appendChild(lbl);
            row.appendChild(right);
            card.appendChild(row);
        }

        makeRow('Annual Gross Income', 'income', cur, null, '1000');
        makeRow('Monthly Existing Debts', 'debts', cur, null, '50');
        makeRow('Interest Rate', 'rate', null, '%', '0.1');
        makeRow('Loan Term', 'term', null, 'years', '5');
        makeRow('Down Payment', 'down', null, '%', '1');

        /* Stat row */
        var statRow = document.createElement('div');
        statRow.className = 'bkbg-la-stat-row';
        card.appendChild(statRow);

        function update() {
            var res = calcAffordability(
                state.income,
                state.debts,
                state.rate,
                state.term,
                state.down,
                o.frontEndRatio || 28,
                o.backEndRatio || 43,
                o.incomeShareLimit || 30,
                o.monthlyPaymentMode || 'min'
            );

            /* Update hero */
            hero.innerHTML =
                '<div style="font-size:12px;color:' + (o.subtitleColor || '#6b7280') + ';font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Maximum Home Price</div>' +
                '<div class="bkbg-la-result-hero" style="color:' + (o.maxHomeColor || accent) + '">' +
                esc(fmtMoney(res.maxHome, cur, pos)) + '</div>' +
                '<div style="font-size:13px;color:' + (o.subtitleColor || '#6b7280') + '">with ' + state.down + '% down · ' + state.rate + '% rate · ' + state.term + ' yr term</div>';

            /* Stat cards */
            statRow.innerHTML = '';
            var stats = [];
            if (o.showMaxLoan !== false)     stats.push({ val: fmtMoney(res.maxLoan, cur, pos),      lbl: 'Max Loan Amount',    color: o.maxLoanColor  || '#3b82f6' });
            if (o.showMonthly !== false)     stats.push({ val: fmtMoney(res.maxMonthly, cur, pos),   lbl: 'Max Monthly Payment', color: o.monthlyColor  || '#10b981' });
            if (o.showDTI !== false)         stats.push({ val: res.dti.toFixed(1) + '%',             lbl: 'DTI Ratio',           color: o.dtiColor      || '#f59e0b' });
            if (o.showDownPayment !== false) stats.push({ val: fmtMoney(res.downAmount, cur, pos),   lbl: 'Down Payment',        color: o.labelColor    || '#374151' });

            stats.forEach(function (st) {
                var sc = document.createElement('div');
                sc.className = 'bkbg-la-stat';
                sc.style.cssText = 'background:' + (o.statCardBg || '#f9fafb') + ';border-radius:12px;padding:20px 16px;text-align:center;flex:1;min-width:120px;box-sizing:border-box';
                sc.innerHTML =
                    '<div class="bkbg-la-stat-val" style="color:' + st.color + '">' + esc(st.val) + '</div>' +
                    '<div class="bkbg-la-stat-lbl" style="font-size:12px;color:' + (o.subtitleColor || '#6b7280') + ';margin-top:6px">' + esc(st.lbl) + '</div>';
                statRow.appendChild(sc);
            });
        }

        update();
    }

    document.querySelectorAll('.bkbg-la-app').forEach(buildApp);
})();
