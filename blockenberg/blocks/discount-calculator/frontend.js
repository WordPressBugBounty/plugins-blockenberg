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

    function calcSalePrice(orig, pct) {
        var savings = orig * (pct / 100);
        var sale    = orig - savings;
        return { orig: orig, sale: sale, savings: savings, pct: pct };
    }
    function calcDiscountPct(orig, sale) {
        if (orig <= 0) return { orig: orig, sale: sale, savings: 0, pct: 0 };
        var savings = orig - sale;
        var pct     = (savings / orig) * 100;
        return { orig: orig, sale: sale, savings: savings, pct: pct };
    }
    function calcOrigPrice(sale, pct) {
        if (pct >= 100) return { orig: sale, sale: sale, savings: 0, pct: pct };
        var orig    = sale / (1 - pct / 100);
        var savings = orig - sale;
        return { orig: orig, sale: sale, savings: savings, pct: pct };
    }

    function fmtM(val, cur, pos) {
        var s = parseFloat(val).toFixed(2);
        return pos === 'after' ? s + cur : cur + s;
    }

    function makeEl(tag, attrs, children) {
        var el = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                if (k === 'className') { el.className = attrs[k]; }
                else if (k === 'style') { Object.assign(el.style, attrs[k]); }
                else if (k.startsWith('data-')) { el.setAttribute(k, attrs[k]); }
                else { el[k] = attrs[k]; }
            });
        }
        if (children) {
            (Array.isArray(children) ? children : [children]).forEach(function (c) {
                if (c == null || c === false) return;
                el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
            });
        }
        return el;
    }

    var MODE_LABELS = {
        sale_price:   'Find Sale Price',
        discount_pct: 'Find Discount %',
        orig_price:   'Find Original Price'
    };

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var o = opts;
        var mode     = o.mode          || 'sale_price';
        var currency = o.currency      || '$';
        var curPos   = o.currencyPos   || 'before';
        var origVal  = parseFloat(o.defaultOriginal) || 200;
        var pctVal   = parseFloat(o.defaultDiscount) || 25;
        var saleVal  = parseFloat(o.defaultSale)     || 150;

        app.innerHTML = '';
        app.style.fontFamily = 'inherit';
        app.style.boxSizing  = 'border-box';

        /* Typography CSS vars */
        app.style.setProperty('--bkbg-disc-ttl-fs', (o.titleSize || 28) + 'px');
        if (o.typoTitle) typoCssVarsForEl(o.typoTitle, '--bkbg-disc-ttl-', app);
        if (o.typoSubtitle) typoCssVarsForEl(o.typoSubtitle, '--bkbg-disc-sub-', app);

        // Section wrapper
        var section = makeEl('div', { style: {
            paddingTop: (o.paddingTop || 60) + 'px',
            paddingBottom: (o.paddingBottom || 60) + 'px',
            background: o.sectionBg || ''
        }});

        var card = makeEl('div', { className: 'bkbg-disc-card', style: {
            background:   o.cardBg || '#ffffff',
            borderRadius: (o.cardRadius || 16) + 'px',
            padding:      '36px 32px',
            maxWidth:     (o.maxWidth || 520) + 'px',
            margin:       '0 auto',
            boxShadow:    '0 4px 24px rgba(0,0,0,0.09)'
        }});
        section.appendChild(card);
        app.appendChild(section);

        // Title / subtitle
        if (o.showTitle || o.showSubtitle) {
            var hdr = makeEl('div', { style: { marginBottom: '20px' } });
            if (o.showTitle) {
                hdr.appendChild(makeEl('div', { className: 'bkbg-disc-title', style: {
                    color: o.titleColor || '#1e1b4b'
                }}, [o.title || 'Discount Calculator']));
            }
            if (o.showSubtitle) {
                hdr.appendChild(makeEl('div', { className: 'bkbg-disc-subtitle', style: {
                    color: o.subtitleColor || '#6b7280'
                }}, [o.subtitle || '']));
            }
            card.appendChild(hdr);
        }

        // Mode tabs
        var tabRow = makeEl('div', { style: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' } });
        var modeBtns = {};
        ['sale_price', 'discount_pct', 'orig_price'].forEach(function (m) {
            var btn = makeEl('button', { type: 'button', className: 'bkbg-disc-mode-btn', style: {
                flex: '1 1 auto',
                padding: '9px 14px',
                borderRadius: '8px',
                border: '2px solid ' + (mode === m ? (o.accentColor || '#6c3fb5') : '#e5e7eb'),
                background: mode === m ? (o.accentColor || '#6c3fb5') : 'transparent',
                color: mode === m ? '#fff' : (o.accentColor || '#6c3fb5'),
                fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all .15s'
            }}, [MODE_LABELS[m]]);
            modeBtns[m] = btn;
            btn.addEventListener('click', function () {
                mode = m;
                refreshTabs();
                buildInputs();
                update();
            });
            tabRow.appendChild(btn);
        });
        card.appendChild(tabRow);

        // Inputs container
        var inputsContainer = makeEl('div', { style: { marginBottom: '24px' } });
        card.appendChild(inputsContainer);

        // Result card
        var resultCard = makeEl('div', { className: 'bkbg-disc-result', style: {
            background:   o.resultBg     || '#f5f3ff',
            border:       '2px solid ' + (o.resultBorder || '#ede9fe'),
            borderRadius: (o.cardRadius || 16) + 'px',
            padding:      '24px 28px',
            textAlign:    'center'
        }});
        card.appendChild(resultCard);

        // Shared input references
        var origInput, pctInput, saleInput;

        function makeMoneyInput(labelText, initVal, onCh) {
            var row = makeEl('div', { className: 'bkbg-disc-input-row', style: { marginBottom: '14px' } });
            var lbl = makeEl('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, color: o.labelColor || '#374151', marginBottom: '5px' } }, [labelText]);
            row.appendChild(lbl);
            var flex = makeEl('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } });
            if (curPos === 'before') {
                flex.appendChild(makeEl('span', { style: { color: o.labelColor || '#374151', fontWeight: 700, fontSize: '16px' } }, [currency]));
            }
            var inp = makeEl('input', { type: 'number', value: initVal, min: '0', step: '0.01', style: {
                flex: '1', padding: '10px 14px',
                borderRadius: (o.inputRadius || 8) + 'px',
                border: '1.5px solid #e5e7eb', fontSize: '16px', outline: 'none'
            }});
            inp.addEventListener('focus', function () { inp.style.borderColor = o.accentColor || '#6c3fb5'; inp.style.boxShadow = '0 0 0 3px rgba(108,63,181,.15)'; });
            inp.addEventListener('blur',  function () { inp.style.borderColor = '#e5e7eb'; inp.style.boxShadow = ''; });
            inp.addEventListener('input', function () { onCh(parseFloat(inp.value) || 0); update(); });
            flex.appendChild(inp);
            if (curPos === 'after') {
                flex.appendChild(makeEl('span', { style: { color: o.labelColor || '#374151', fontWeight: 700, fontSize: '16px' } }, [currency]));
            }
            row.appendChild(flex);
            return { row: row, inp: inp };
        }

        function makePctInput(labelText, initVal, onCh) {
            var row = makeEl('div', { className: 'bkbg-disc-input-row', style: { marginBottom: '14px' } });
            var lbl = makeEl('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, color: o.labelColor || '#374151', marginBottom: '5px' } }, [labelText]);
            row.appendChild(lbl);
            var flex = makeEl('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } });
            var inp = makeEl('input', { type: 'number', value: initVal, min: '0', max: '100', step: '0.1', style: {
                flex: '1', padding: '10px 14px',
                borderRadius: (o.inputRadius || 8) + 'px',
                border: '1.5px solid #e5e7eb', fontSize: '16px', outline: 'none'
            }});
            inp.addEventListener('focus', function () { inp.style.borderColor = o.accentColor || '#6c3fb5'; inp.style.boxShadow = '0 0 0 3px rgba(108,63,181,.15)'; });
            inp.addEventListener('blur',  function () { inp.style.borderColor = '#e5e7eb'; inp.style.boxShadow = ''; });
            inp.addEventListener('input', function () { onCh(parseFloat(inp.value) || 0); update(); });
            flex.appendChild(inp);
            flex.appendChild(makeEl('span', { style: { color: o.labelColor || '#374151', fontWeight: 700, fontSize: '16px' } }, ['%']));
            row.appendChild(flex);
            return { row: row, inp: inp };
        }

        function buildInputs() {
            inputsContainer.innerHTML = '';
            origInput = pctInput = saleInput = null;

            if (mode === 'sale_price' || mode === 'discount_pct') {
                var origPair = makeMoneyInput('Original Price', origVal, function (v) { origVal = v; });
                inputsContainer.appendChild(origPair.row);
                origInput = origPair.inp;
            }
            if (mode === 'sale_price' || mode === 'orig_price') {
                var pctPair = makePctInput('Discount Percentage', pctVal, function (v) { pctVal = v; });
                inputsContainer.appendChild(pctPair.row);
                pctInput = pctPair.inp;
            }
            if (mode === 'discount_pct' || mode === 'orig_price') {
                var salePair = makeMoneyInput('Sale Price', saleVal, function (v) { saleVal = v; });
                inputsContainer.appendChild(salePair.row);
                saleInput = salePair.inp;
            }
        }

        function getResult() {
            if (mode === 'sale_price')   return calcSalePrice(origVal, pctVal);
            if (mode === 'discount_pct') return calcDiscountPct(origVal, saleVal);
            return calcOrigPrice(saleVal, pctVal);
        }

        function update() {
            var r = getResult();
            var badgePct     = Math.round(r.pct * 10) / 10;
            var savingsFrac  = r.orig > 0 ? Math.min(1, r.savings / r.orig) : 0;
            var accentC      = o.accentColor    || '#6c3fb5';
            var saleSz       = o.salePriceSize  || 56;
            var salePriceC   = o.salePriceColor || '#6c3fb5';
            var origPriceC   = o.origPriceColor || '#9ca3af';
            var savingsC     = o.savingsColor   || '#10b981';
            var badgeBg      = o.badgeBg        || '#ef4444';
            var badgeClr     = o.badgeColor     || '#ffffff';
            var barFillC     = o.barFill        || '#10b981';
            var barBgC       = o.barBg          || '#e5e7eb';
            var labelC       = o.labelColor     || '#374151';

            resultCard.innerHTML = '';

            if (o.showBadge && r.pct > 0) {
                resultCard.appendChild(makeEl('div', { className: 'bkbg-disc-badge', style: {
                    background: badgeBg, color: badgeClr,
                    fontWeight: 800, fontSize: '14px',
                    padding: '4px 14px', borderRadius: '100px',
                    marginBottom: '14px', display: 'inline-block', letterSpacing: '.03em'
                }}, [badgePct + '% OFF']));
            }

            resultCard.appendChild(makeEl('div', { className: 'bkbg-disc-sale-price', style: {
                fontSize: saleSz + 'px', fontWeight: 800,
                color: salePriceC, lineHeight: '1.1', marginBottom: '6px'
            }}, [fmtM(r.sale, currency, curPos)]));

            if (r.orig !== r.sale) {
                resultCard.appendChild(makeEl('div', { className: 'bkbg-disc-orig-price', style: {
                    fontSize: Math.round(saleSz * 0.4) + 'px',
                    color: origPriceC, textDecoration: 'line-through', marginBottom: '10px'
                }}, [fmtM(r.orig, currency, curPos)]));
            }

            if (r.savings > 0) {
                resultCard.appendChild(makeEl('div', { style: {
                    fontSize: '16px', fontWeight: 700, color: savingsC, marginBottom: '16px'
                }}, ['You Save: ' + fmtM(r.savings, currency, curPos)]));
            }

            if (o.showSavingsBar && r.orig > 0) {
                var barLabels = makeEl('div', { style: { fontSize: '12px', color: labelC, marginBottom: '6px', display: 'flex', justifyContent: 'space-between' } },
                    [makeEl('span', null, ['Original']), makeEl('span', null, ['Savings'])]);
                resultCard.appendChild(barLabels);
                var track = makeEl('div', { className: 'bkbg-disc-bar-track', style: { height: '10px', borderRadius: '100px', background: barBgC, overflow: 'hidden' } });
                var fill  = makeEl('div', { className: 'bkbg-disc-bar-fill', style: { height: '100%', width: '0%', background: barFillC, borderRadius: '100px', transition: 'width .35s' } });
                track.appendChild(fill);
                resultCard.appendChild(track);
                setTimeout(function () { fill.style.width = (savingsFrac * 100).toFixed(1) + '%'; }, 30);
            }
        }

        function refreshTabs() {
            ['sale_price', 'discount_pct', 'orig_price'].forEach(function (m) {
                var btn = modeBtns[m];
                var active = m === mode;
                btn.style.background   = active ? (o.accentColor || '#6c3fb5') : 'transparent';
                btn.style.color        = active ? '#fff' : (o.accentColor || '#6c3fb5');
                btn.style.borderColor  = active ? (o.accentColor || '#6c3fb5') : '#e5e7eb';
            });
        }

        buildInputs();
        update();
    }

    document.querySelectorAll('.bkbg-disc-app').forEach(buildApp);
})();
