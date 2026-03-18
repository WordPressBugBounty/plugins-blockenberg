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

    function fmtMoney(n, currency) {
        var abs = Math.abs(n);
        var str;
        if (abs >= 1e9)      str = (abs / 1e9).toFixed(2) + 'B';
        else if (abs >= 1e6) str = (abs / 1e6).toFixed(2) + 'M';
        else if (abs >= 1e3) str = abs.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        else                 str = abs.toFixed(2);
        return (n < 0 ? '-' : '') + currency + str;
    }

    var ASSET_CATS = [
        { key: 'cash',       label: 'Cash & Bank',    icon: '🏦', colorKey: 'cashColor'      },
        { key: 'invest',     label: 'Investments',    icon: '📈', colorKey: 'investColor'    },
        { key: 'realestate', label: 'Real Estate',    icon: '🏠', colorKey: 'realEstateColor'},
        { key: 'vehicles',   label: 'Vehicles',       icon: '🚗', colorKey: 'vehicleColor'   },
        { key: 'otherasset', label: 'Other Assets',   icon: '💎', colorKey: 'otherAssetColor'}
    ];
    var LIAB_CATS = [
        { key: 'mortgage',    label: 'Mortgage',       icon: '🏡', color: '#ef4444' },
        { key: 'carloan',     label: 'Car Loans',      icon: '🚙', color: '#f97316' },
        { key: 'creditcard',  label: 'Credit Cards',   icon: '💳', color: '#ec4899' },
        { key: 'studentloan', label: 'Student Loans',  icon: '🎓', color: '#8b5cf6' },
        { key: 'otherdebt',   label: 'Other Debts',    icon: '📋', color: '#9ca3af' }
    ];

    function initApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) { return; }

        var currency  = opts.currency       || '$';
        var assetC    = opts.assetColor     || '#10b981';
        var liabC     = opts.liabilityColor || '#ef4444';
        var netPosC   = opts.netPositiveColor || '#10b981';
        var netNegC   = opts.netNegativeColor || '#ef4444';
        var cardR     = (opts.cardRadius    || 16) + 'px';
        var panelR    = (opts.panelRadius   || 12) + 'px';
        var inpR      = (opts.inputRadius   || 8)  + 'px';
        var maxW      = (opts.maxWidth      || 720) + 'px';
        var lblClr    = opts.labelColor     || '#374151';

        app.style.paddingTop    = (opts.paddingTop    || 60) + 'px';
        app.style.paddingBottom = (opts.paddingBottom || 60) + 'px';
        if (opts.sectionBg) app.style.background = opts.sectionBg;

        var card = document.createElement('div');
        card.className = 'bkbg-nwc-card';
        Object.assign(card.style, { background: opts.cardBg || '#fff', borderRadius: cardR, maxWidth: maxW });
        app.appendChild(card);

        if (opts.showTitle && opts.title) {
            var ttl = document.createElement('div'); ttl.className = 'bkbg-nwc-title';
            ttl.textContent = opts.title;
            if (opts.titleColor) ttl.style.color = opts.titleColor;
            card.appendChild(ttl);
        }
        if (opts.showSubtitle && opts.subtitle) {
            var sub = document.createElement('div'); sub.className = 'bkbg-nwc-subtitle';
            sub.textContent = opts.subtitle;
            if (opts.subtitleColor) sub.style.color = opts.subtitleColor;
            card.appendChild(sub);
        }

        typoCssVarsForEl(app.parentNode, opts.titleTypo, '--bkbg-nwc-tt-');
        typoCssVarsForEl(app.parentNode, opts.subtitleTypo, '--bkbg-nwc-st-');

        /* State */
        var vals = {};
        ASSET_CATS.forEach(function (c) { vals[c.key] = 0; });
        LIAB_CATS.forEach(function (c)  { vals[c.key] = 0; });

        /* Two-column layout */
        var cols = document.createElement('div'); cols.className = 'bkbg-nwc-columns'; card.appendChild(cols);

        function mkPanel(title, icon, borderColor, categories) {
            var panel = document.createElement('div'); panel.className = 'bkbg-nwc-panel';
            panel.style.background   = opts.panelBg   || '#f9fafb';
            panel.style.borderRadius = panelR;
            panel.style.borderTopColor = borderColor;
            var pt = document.createElement('div'); pt.className = 'bkbg-nwc-panel-title'; pt.style.color = borderColor;
            pt.textContent = icon + ' ' + title; panel.appendChild(pt);

            categories.forEach(function (cat) {
                var catColor = opts[cat.colorKey] || cat.color || borderColor;
                var row = document.createElement('div'); row.className = 'bkbg-nwc-row';
                var lbl = document.createElement('label'); lbl.className = 'bkbg-nwc-lbl'; lbl.style.color = lblClr;
                var dot = document.createElement('span'); dot.className = 'bkbg-nwc-cat-dot'; dot.style.background = catColor;
                lbl.appendChild(dot); lbl.appendChild(document.createTextNode(cat.icon + ' ' + cat.label));
                var wrap = document.createElement('div'); wrap.className = 'bkbg-nwc-input-wrap';
                var pfx  = document.createElement('span'); pfx.className = 'bkbg-nwc-prefix'; pfx.textContent = currency;
                var inp  = document.createElement('input'); inp.type = 'number'; inp.className = 'bkbg-nwc-input';
                inp.min = '0'; inp.step = '100'; inp.value = '0'; inp.placeholder = '0';
                inp.style.borderRadius = inpR; inp.style.background = opts.inputBg || '#fff'; inp.style.borderColor = opts.inputBorder || '#d1d5db';
                inp.addEventListener('input', function () {
                    vals[cat.key] = parseFloat(inp.value) || 0;
                    recalc();
                });
                wrap.appendChild(pfx); wrap.appendChild(inp);
                row.appendChild(lbl); row.appendChild(wrap); panel.appendChild(row);
            });
            return panel;
        }

        cols.appendChild(mkPanel('Assets',      '💰', assetC, ASSET_CATS));
        cols.appendChild(mkPanel('Liabilities', '💳', liabC,  LIAB_CATS));

        /* Result */
        var resultEl  = document.createElement('div'); resultEl.className = 'bkbg-nwc-result'; card.appendChild(resultEl);

        /* Chart */
        var chartEl = document.createElement('div'); chartEl.className = 'bkbg-nwc-chart';
        if (opts.showChart !== false) card.appendChild(chartEl);

        /* Breakdown */
        var sep = document.createElement('div'); sep.className = 'bkbg-nwc-sep'; card.appendChild(sep);
        var breakdownEl = document.createElement('div'); breakdownEl.className = 'bkbg-nwc-breakdown';
        if (opts.showBreakdown !== false) card.appendChild(breakdownEl);

        function recalc() {
            var totalAssets = 0; ASSET_CATS.forEach(function (c) { totalAssets += vals[c.key]; });
            var totalLiabs  = 0; LIAB_CATS.forEach(function (c)  { totalLiabs  += vals[c.key]; });
            var net = totalAssets - totalLiabs;
            var isPos = net >= 0;
            var netC  = isPos ? netPosC : netNegC;

            /* Result box */
            resultEl.innerHTML = '';
            resultEl.style.background  = netC + '14';
            resultEl.style.borderColor = netC + '44';
            var rl = document.createElement('div'); rl.className = 'bkbg-nwc-result-label'; rl.style.color = netC; rl.textContent = 'Net Worth';
            var rv = document.createElement('div'); rv.className = 'bkbg-nwc-result-val'; rv.style.color = netC; rv.textContent = fmtMoney(net, currency);
            var rs = document.createElement('div'); rs.className = 'bkbg-nwc-result-sub';
            rs.textContent = 'Assets: ' + fmtMoney(totalAssets, currency) + '  −  Liabilities: ' + fmtMoney(totalLiabs, currency);
            resultEl.appendChild(rl); resultEl.appendChild(rv); resultEl.appendChild(rs);

            /* Chart */
            if (opts.showChart !== false) {
                chartEl.innerHTML = '';
                var ct = document.createElement('div'); ct.className = 'bkbg-nwc-chart-title'; ct.textContent = 'Assets vs Liabilities'; chartEl.appendChild(ct);
                var total = totalAssets + totalLiabs || 1;
                var bars = document.createElement('div'); bars.className = 'bkbg-nwc-bars';
                var ba = document.createElement('div'); ba.className = 'bkbg-nwc-bar-asset';
                ba.style.width = ((totalAssets / total) * 100) + '%'; ba.style.background = assetC;
                ba.title = 'Assets: ' + fmtMoney(totalAssets, currency);
                var bl = document.createElement('div'); bl.className = 'bkbg-nwc-bar-liability';
                bl.style.width = ((totalLiabs / total) * 100) + '%'; bl.style.background = liabC;
                bl.title = 'Liabilities: ' + fmtMoney(totalLiabs, currency);
                bars.appendChild(ba); bars.appendChild(bl); chartEl.appendChild(bars);
                var bls = document.createElement('div'); bls.className = 'bkbg-nwc-bar-labels';
                var la = document.createElement('span'); la.style.color = assetC; la.textContent = '● Assets ' + fmtMoney(totalAssets, currency);
                var ll = document.createElement('span'); ll.style.color = liabC;  ll.textContent = '● Liabilities ' + fmtMoney(totalLiabs, currency);
                bls.appendChild(la); bls.appendChild(ll); chartEl.appendChild(bls);
            }

            /* Breakdown */
            if (opts.showBreakdown !== false) {
                breakdownEl.innerHTML = '';
                function mkBreakdownSection(title, cats, colorFn) {
                    var sec = document.createElement('div'); sec.className = 'bkbg-nwc-breakdown-section';
                    var st = document.createElement('div'); st.className = 'bkbg-nwc-breakdown-title'; st.textContent = title; sec.appendChild(st);
                    cats.forEach(function (cat) {
                        var v = vals[cat.key]; if (v === 0) return;
                        var r = document.createElement('div'); r.className = 'bkbg-nwc-breakdown-row';
                        var k = document.createElement('div'); k.className = 'bkbg-nwc-breakdown-key';
                        var dot = document.createElement('span'); dot.className = 'bkbg-nwc-cat-dot';
                        dot.style.background = colorFn(cat);
                        k.appendChild(dot); k.appendChild(document.createTextNode(cat.icon + ' ' + cat.label));
                        var vEl = document.createElement('div'); vEl.className = 'bkbg-nwc-breakdown-val';
                        vEl.style.color = colorFn(cat); vEl.textContent = fmtMoney(v, currency);
                        r.appendChild(k); r.appendChild(vEl); sec.appendChild(r);
                    });
                    return sec;
                }
                breakdownEl.appendChild(mkBreakdownSection(
                    '💰 Asset Breakdown', ASSET_CATS,
                    function (c) { return opts[c.colorKey] || '#10b981'; }
                ));
                breakdownEl.appendChild(mkBreakdownSection(
                    '💳 Liability Breakdown', LIAB_CATS,
                    function (c) { return c.color || liabC; }
                ));
            }
        }

        recalc();
    }

    document.querySelectorAll('.bkbg-nwc-app').forEach(initApp);
})();
