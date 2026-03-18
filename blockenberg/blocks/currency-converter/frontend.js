(function () {
    'use strict';

    /* ── Static indicative rates (USD base) ─────────────────────────────── */
    var USD_RATES = {
        USD:1,EUR:0.92,GBP:0.79,JPY:149.5,CAD:1.36,AUD:1.53,CHF:0.90,CNY:7.24,
        INR:83.1,MXN:17.15,BRL:4.97,KRW:1325,SGD:1.34,HKD:7.82,NOK:10.58,SEK:10.42,
        DKK:6.88,NZD:1.63,ZAR:18.63,TRY:32.6,RUB:90.5,PLN:4.03,THB:35.1,MYR:4.72,
        IDR:15650,PHP:56.5,AED:3.67,SAR:3.75,EGP:30.9,NGN:1490,
    };

    var CURRENCY_NAMES = {
        USD:'US Dollar',EUR:'Euro',GBP:'British Pound',JPY:'Japanese Yen',CAD:'Canadian Dollar',
        AUD:'Australian Dollar',CHF:'Swiss Franc',CNY:'Chinese Yuan',INR:'Indian Rupee',
        MXN:'Mexican Peso',BRL:'Brazilian Real',KRW:'South Korean Won',SGD:'Singapore Dollar',
        HKD:'Hong Kong Dollar',NOK:'Norwegian Krone',SEK:'Swedish Krona',DKK:'Danish Krone',
        NZD:'New Zealand Dollar',ZAR:'South African Rand',TRY:'Turkish Lira',RUB:'Russian Ruble',
        PLN:'Polish Zloty',THB:'Thai Baht',MYR:'Malaysian Ringgit',IDR:'Indonesian Rupiah',
        PHP:'Philippine Peso',AED:'UAE Dirham',SAR:'Saudi Riyal',EGP:'Egyptian Pound',NGN:'Nigerian Naira',
    };

    function convert(amount, from, to) {
        if (!USD_RATES[from] || !USD_RATES[to]) return 0;
        return (amount / USD_RATES[from]) * USD_RATES[to];
    }

    function fmtNum(val) {
        if (isNaN(val) || val === null) return '—';
        if (val >= 1000) return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    }

    function cname(code) { return CURRENCY_NAMES[code] || code; }

    /* ── Typography CSS-var helper ─────────────────────────────────────── */
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', style:'font-style',
            transform:'text-transform', decoration:'text-decoration',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m', sizeUnit:'font-size-unit',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m', lineHeightUnit:'line-height-unit',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m', letterSpacingUnit:'letter-spacing-unit',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m', wordSpacingUnit:'word-spacing-unit'
        };
        Object.keys(map).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                var css = map[k];
                if (css.indexOf('size-d') !== -1 || css.indexOf('size-t') !== -1 || css.indexOf('size-m') !== -1 ||
                    css.indexOf('height-d') !== -1 || css.indexOf('height-t') !== -1 || css.indexOf('height-m') !== -1 ||
                    css.indexOf('spacing-d') !== -1 || css.indexOf('spacing-t') !== -1 || css.indexOf('spacing-m') !== -1) {
                    var unitKey = css.replace(/-[dtm]$/, '-unit');
                    var unit = '';
                    Object.keys(map).forEach(function(k2) { if (map[k2] === unitKey && typo[k2]) unit = typo[k2]; });
                    if (!unit) unit = css.indexOf('size') !== -1 ? 'px' : '';
                    v = v + unit;
                }
                el.style.setProperty(prefix + css, v);
            }
        });
    }

    /* ── Build select options ─────────────────────────────────────────── */
    function buildSelectOptions(sel, selected) {
        sel.innerHTML = '';
        Object.keys(USD_RATES).forEach(function (code) {
            var opt = document.createElement('option');
            opt.value = code;
            opt.textContent = code + ' — ' + cname(code);
            if (code === selected) opt.selected = true;
            sel.appendChild(opt);
        });
    }

    /* ── Main builder ─────────────────────────────────────────────────── */
    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var accent     = opts.accentColor   || '#6c3fb5';
        var cardBg     = opts.cardBg        || '#ffffff';
        var resultBg   = opts.resultBg      || '#f5f3ff';
        var resultBdr  = opts.resultBorder  || '#ede9fe';
        var resultClr  = opts.resultColor   || accent;
        var labelColor = opts.labelColor    || '#374151';
        var titleColor = opts.titleColor    || '#1e1b4b';
        var subColor   = opts.subtitleColor || '#6b7280';
        var pairBg     = opts.quickPairBg   || '#f3f4f6';
        var pairColor  = opts.quickPairColor|| '#374151';
        var cRadius    = (opts.cardRadius   !== undefined ? opts.cardRadius : 16) + 'px';
        var maxW       = (opts.maxWidth     || 580) + 'px';
        var ptop       = (opts.paddingTop   !== undefined ? opts.paddingTop : 60) + 'px';
        var pbot       = (opts.paddingBottom!== undefined ? opts.paddingBottom : 60) + 'px';
        var titleSize  = (opts.titleSize    || 26) + 'px';
        var resultSize = (opts.resultSize   || 40) + 'px';
        var quickPairs = opts.quickPairs    || [];

        var fromCur = opts.defaultFrom   || 'USD';
        var toCur   = opts.defaultTo     || 'EUR';
        var amount  = opts.defaultAmount || 100;

        /* Card */
        var card = document.createElement('div');
        card.className = 'bkbg-cc-card';
        card.style.cssText = [
            'background:' + cardBg,
            'border-radius:' + cRadius,
            'padding-top:'+ ptop,
            'padding-bottom:' + pbot,
            'max-width:' + maxW,
        ].join(';');
        app.innerHTML = '';
        app.appendChild(card);

        /* Apply typography CSS vars on card */
        card.style.setProperty('--bkbg-cc-ttl-fs', titleSize);
        card.style.setProperty('--bkbg-cc-res-fs', resultSize);
        typoCssVarsForEl(opts.typoTitle, '--bkbg-cc-ttl-', card);
        typoCssVarsForEl(opts.typoResult, '--bkbg-cc-res-', card);

        /* Title */
        if (opts.showTitle && opts.title) {
            var h2 = document.createElement('h2');
            h2.className = 'bkbg-cc-title';
            h2.textContent = opts.title;
            h2.style.color = titleColor;
            card.appendChild(h2);
        }

        /* Subtitle */
        if (opts.showSubtitle && opts.subtitle) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-cc-subtitle';
            sub.textContent = opts.subtitle;
            sub.style.color = subColor;
            card.appendChild(sub);
        }

        /* Quick pairs */
        var pairsDiv;
        if (opts.showQuickPairs && quickPairs.length) {
            pairsDiv = document.createElement('div');
            pairsDiv.className = 'bkbg-cc-pairs';
            card.appendChild(pairsDiv);
        }

        /* Convert row: amount + swap + to */
        var row = document.createElement('div');
        row.className = 'bkbg-cc-convert-row';
        card.appendChild(row);

        /* Amount */
        var amtGroup = document.createElement('div');
        amtGroup.className = 'bkbg-cc-field-group';
        var amtLabel = document.createElement('label');
        amtLabel.textContent = 'Amount';
        amtLabel.style.color = labelColor;
        var amtInput = document.createElement('input');
        amtInput.type = 'number';
        amtInput.className = 'bkbg-cc-amount-input';
        amtInput.value = amount;
        amtInput.min = '0';
        amtInput.step = 'any';
        amtGroup.appendChild(amtLabel);
        amtGroup.appendChild(amtInput);
        row.appendChild(amtGroup);

        /* Swap */
        var swapBtn;
        if (opts.showSwapBtn) {
            swapBtn = document.createElement('button');
            swapBtn.className = 'bkbg-cc-swap';
            swapBtn.textContent = '⇄';
            swapBtn.style.borderColor = accent;
            swapBtn.style.color = accent;
            row.appendChild(swapBtn);
        } else {
            var arrow = document.createElement('div');
            arrow.textContent = '→';
            arrow.style.cssText = 'align-self:flex-end;padding:10px 4px;font-size:20px;color:#9ca3af';
            row.appendChild(arrow);
        }

        /* To select */
        var toGroup = document.createElement('div');
        toGroup.className = 'bkbg-cc-field-group';
        var toLabel = document.createElement('label');
        toLabel.textContent = 'To';
        toLabel.style.color = labelColor;
        var toSel = document.createElement('select');
        toSel.className = 'bkbg-cc-select';
        buildSelectOptions(toSel, toCur);
        toGroup.appendChild(toLabel);
        toGroup.appendChild(toSel);
        row.appendChild(toGroup);

        /* From — full width row */
        var fromRow = document.createElement('div');
        fromRow.className = 'bkbg-cc-from-row';
        var fromLabel = document.createElement('label');
        fromLabel.textContent = 'From Currency';
        fromLabel.style.color = labelColor;
        var fromSel = document.createElement('select');
        fromSel.className = 'bkbg-cc-select';
        buildSelectOptions(fromSel, fromCur);
        fromRow.appendChild(fromLabel);
        fromRow.appendChild(fromSel);
        card.appendChild(fromRow);

        /* Result box */
        var resultBox = document.createElement('div');
        resultBox.className = 'bkbg-cc-result';
        resultBox.style.cssText = 'background:' + resultBg + ';border:1.5px solid ' + resultBdr + ';border-radius:' + cRadius;
        var resLabel = document.createElement('div');
        resLabel.className = 'bkbg-cc-result-label';
        var resNum = document.createElement('div');
        resNum.className = 'bkbg-cc-result-num';
        resNum.style.color = resultClr;
        var resRate = document.createElement('div');
        resRate.className = 'bkbg-cc-result-rate';
        resultBox.appendChild(resLabel);
        resultBox.appendChild(resNum);
        resultBox.appendChild(resRate);
        card.appendChild(resultBox);

        /* Disclaimer */
        if (opts.showDisclaimer && opts.disclaimer) {
            var dis = document.createElement('p');
            dis.className = 'bkbg-cc-disclaimer';
            dis.textContent = opts.disclaimer;
            card.appendChild(dis);
        }

        /* ── Update result ──────────────────────────────────────────────── */
        function updateResult() {
            var amt = parseFloat(amtInput.value) || 0;
            var fr  = fromSel.value;
            var to  = toSel.value;
            var res = convert(amt, fr, to);
            var rate = convert(1, fr, to);
            resLabel.textContent = amt + ' ' + fr + ' equals';
            resNum.textContent   = fmtNum(res) + ' ' + to;
            resRate.textContent  = '1 ' + fr + ' = ' + fmtNum(rate) + ' ' + to;
            /* update quick pair active state */
            if (pairsDiv) {
                pairsDiv.querySelectorAll('.bkbg-cc-pair-btn').forEach(function (btn) {
                    var active = btn.dataset.from === fr && btn.dataset.to === to;
                    btn.classList.toggle('active', active);
                    btn.style.background = active ? accent : pairBg;
                    btn.style.color      = active ? '#fff' : pairColor;
                });
            }
        }

        /* ── Quick pairs buttons ────────────────────────────────────────── */
        if (pairsDiv && quickPairs.length) {
            quickPairs.forEach(function (pair) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-cc-pair-btn';
                btn.dataset.from = pair[0];
                btn.dataset.to   = pair[1];
                btn.textContent  = pair[0] + '/' + pair[1];
                btn.style.background = (pair[0] === fromCur && pair[1] === toCur) ? accent : pairBg;
                btn.style.color      = (pair[0] === fromCur && pair[1] === toCur) ? '#fff' : pairColor;
                btn.addEventListener('click', function () {
                    fromSel.value = pair[0];
                    toSel.value   = pair[1];
                    updateResult();
                });
                pairsDiv.appendChild(btn);
            });
        }

        /* ── Swap ─────────────────────────────────────────────────────── */
        if (swapBtn) {
            swapBtn.addEventListener('click', function () {
                var tmp = fromSel.value;
                fromSel.value = toSel.value;
                toSel.value   = tmp;
                updateResult();
            });
        }

        /* ── Events ───────────────────────────────────────────────────── */
        amtInput.addEventListener('input', updateResult);
        fromSel.addEventListener('change', updateResult);
        toSel.addEventListener('change', updateResult);

        /* Initial render */
        updateResult();
    }

    /* ── Init all instances ───────────────────────────────────────────── */
    document.querySelectorAll('.bkbg-cc-app').forEach(buildApp);
})();
