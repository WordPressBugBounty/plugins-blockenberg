(function () {
    'use strict';

    function calcSalesTax(amount, rate) {
        var tax = amount * (rate / 100);
        return { net: amount, tax: tax, total: amount + tax };
    }
    function calcReverse(total, rate) {
        var net = total / (1 + rate / 100);
        return { net: net, tax: total - net, total: total };
    }
    function fmt(val, cur, pos) {
        return pos === 'after' ? val.toFixed(2) + cur : cur + val.toFixed(2);
    }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function buildApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) { return; }
        var o   = opts;
        var accent  = o.accentColor   || '#6c3fb5';
        var cur     = o.currency      || '$';
        var pos     = o.currencyPos   || 'before';
        var maxW    = (o.maxWidth || 580) + 'px';
        var iRad    = (o.inputRadius || 8) + 'px';
        var cRad    = (o.cardRadius  || 16) + 'px';
        var taxLbl  = o.taxLabel     || 'Sales Tax';

        app.style.paddingTop    = (o.paddingTop || 60) + 'px';
        app.style.paddingBottom = (o.paddingBottom || 60) + 'px';
        if (o.sectionBg) app.style.background = o.sectionBg;

        /* Header */
        if (o.showTitle || o.showSubtitle) {
            var hdr = document.createElement('div');
            hdr.style.cssText = 'text-align:center;margin-bottom:32px;max-width:' + maxW + ';margin-left:auto;margin-right:auto';
            if (o.showTitle && o.title) {
                var ht = document.createElement('h3');
                ht.className = 'bkbg-tax-title';
                ht.textContent = o.title;
                ht.style.cssText = 'color:' + (o.titleColor || '#1e1b4b') + ';margin:0 0 8px';
                hdr.appendChild(ht);
            }
            if (o.showSubtitle && o.subtitle) {
                var hs = document.createElement('p');
                hs.textContent = o.subtitle;
                hs.style.cssText = 'color:' + (o.subtitleColor || '#6b7280') + ';margin:0';
                hdr.appendChild(hs);
            }
            app.appendChild(hdr);
        }

        /* Card */
        var card = document.createElement('div');
        card.style.cssText = 'background:' + (o.cardBg || '#fff') + ';border-radius:' + cRad + ';padding:32px;max-width:' + maxW + ';margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,0.06)';
        app.appendChild(card);

        /* State */
        var mode    = o.mode   || 'sales';
        var amount  = parseFloat(o.defaultAmount) || 100;
        var rate    = parseFloat(o.defaultRate)   || 8.5;

        /* Mode tabs */
        var modeRow = document.createElement('div');
        modeRow.style.cssText = 'display:flex;gap:8px;margin-bottom:24px';
        var modeBtns = {};
        [['sales','Add Tax →'],['reverse','← Remove Tax']].forEach(function (pair) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-tax-mode-btn';
            btn.textContent = pair[1];
            btn.style.cssText = 'flex:1;padding:9px;border:none;border-radius:' + iRad + ';font-weight:600;font-size:13px;cursor:pointer';
            btn.addEventListener('click', function () { mode = pair[0]; refreshMode(); update(); });
            modeBtns[pair[0]] = btn;
            modeRow.appendChild(btn);
        });
        card.appendChild(modeRow);

        function refreshMode() {
            Object.keys(modeBtns).forEach(function (k) {
                modeBtns[k].style.background = k === mode ? accent : (o.statCardBg || '#f9fafb');
                modeBtns[k].style.color      = k === mode ? '#fff' : (o.labelColor || '#374151');
                amtLabel.textContent         = mode === 'reverse' ? 'Total Price (with tax)' : 'Original Amount';
            });
        }

        /* Preset chips */
        if (o.showPresets !== false && (o.presetRates || []).length) {
            var chipRow = document.createElement('div');
            chipRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px';
            (o.presetRates || []).forEach(function (p) {
                var chip = document.createElement('button');
                chip.className = 'bkbg-tax-preset-chip';
                chip.textContent = p.label;
                chip.style.cssText = 'padding:4px 12px;border:1px solid ' + accent + ';border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;background:transparent;color:' + accent;
                chip.addEventListener('click', function () {
                    rate = p.rate;
                    rateInput.value = rate;
                    update();
                });
                chipRow.appendChild(chip);
            });
            card.appendChild(chipRow);
        }

        /* Amount row */
        var amtLabel, amtInput;
        (function () {
            var row = document.createElement('div');
            row.className = 'bkbg-tax-input-row';
            amtLabel = document.createElement('label');
            amtLabel.style.cssText = 'font-size:14px;color:' + (o.labelColor || '#374151');
            var right = document.createElement('div');
            right.style.cssText = 'display:flex;align-items:center;gap:6px';
            var pfx = document.createElement('span');
            pfx.textContent = cur;
            pfx.style.cssText = 'color:' + (o.subtitleColor || '#6b7280') + ';font-size:13px';
            amtInput = document.createElement('input');
            amtInput.type = 'number'; amtInput.value = amount; amtInput.min = '0'; amtInput.step = '0.01';
            amtInput.style.cssText = 'width:110px;text-align:right;border:1px solid #d1d5db;border-radius:' + iRad + ';padding:5px 8px;font-size:14px;box-sizing:border-box';
            amtInput.addEventListener('input', function () { amount = parseFloat(amtInput.value) || 0; update(); });
            if (pos === 'before') right.appendChild(pfx);
            right.appendChild(amtInput);
            if (pos === 'after')  right.appendChild(pfx);
            row.appendChild(amtLabel);
            row.appendChild(right);
            card.appendChild(row);
        })();

        /* Rate row */
        var rateInput;
        (function () {
            var row = document.createElement('div');
            row.className = 'bkbg-tax-input-row';
            var lbl = document.createElement('label');
            lbl.textContent = 'Tax Rate (' + taxLbl + ')';
            lbl.style.cssText = 'font-size:14px;color:' + (o.labelColor || '#374151');
            var right = document.createElement('div');
            right.style.cssText = 'display:flex;align-items:center;gap:6px';
            rateInput = document.createElement('input');
            rateInput.type = 'number'; rateInput.value = rate; rateInput.min = '0'; rateInput.step = '0.001';
            rateInput.style.cssText = 'width:110px;text-align:right;border:1px solid #d1d5db;border-radius:' + iRad + ';padding:5px 8px;font-size:14px;box-sizing:border-box';
            rateInput.addEventListener('input', function () { rate = parseFloat(rateInput.value) || 0; update(); });
            var sfx = document.createElement('span');
            sfx.textContent = '%';
            sfx.style.cssText = 'color:' + (o.subtitleColor || '#6b7280') + ';font-size:13px';
            right.appendChild(rateInput);
            right.appendChild(sfx);
            row.appendChild(lbl);
            row.appendChild(right);
            card.appendChild(row);
        })();

        /* Result box */
        var resultBox = document.createElement('div');
        resultBox.style.cssText = 'background:' + (o.resultBg || '#f5f3ff') + ';border:2px solid ' + (o.resultBorder || '#ede9fe') + ';border-radius:' + cRad + ';padding:20px 24px;margin-top:24px';
        card.appendChild(resultBox);

        function update() {
            var res = mode === 'reverse' ? calcReverse(amount, rate) : calcSalesTax(amount, rate);
            var rs  = o.resultSize || 48;
            resultBox.innerHTML =
                '<div class="bkbg-tax-result-grid" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">' +
                '<div class="bkbg-tax-result-col" style="flex:1;text-align:center;min-width:100px">' +
                  '<div class="bkbg-tax-result-label" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:' + (o.subtitleColor || '#6b7280') + ';margin-bottom:4px">Net Price</div>' +
                  '<div class="bkbg-tax-result-val" style="font-size:' + (rs * 0.55) + 'px;font-weight:800;color:' + (o.netColor || '#10b981') + '">' + esc(fmt(res.net, cur, pos)) + '</div>' +
                '</div>' +
                '<div class="bkbg-tax-result-col" style="flex:1;text-align:center;min-width:100px">' +
                  '<div class="bkbg-tax-result-label" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:' + (o.subtitleColor || '#6b7280') + ';margin-bottom:4px">' + esc(taxLbl) + '</div>' +
                  '<div class="bkbg-tax-result-val" style="font-size:' + (rs * 0.55) + 'px;font-weight:800;color:' + (o.taxColor || '#ef4444') + '">' + esc(fmt(res.tax, cur, pos)) + '</div>' +
                '</div>' +
                '<div class="bkbg-tax-result-col" style="flex:1;text-align:center;min-width:100px">' +
                  '<div class="bkbg-tax-result-label" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:' + (o.subtitleColor || '#6b7280') + ';margin-bottom:4px">Total Price</div>' +
                  '<div class="bkbg-tax-result-val" style="font-size:' + (rs * 0.7) + 'px;font-weight:900;color:' + (o.totalColor || accent) + '">' + esc(fmt(res.total, cur, pos)) + '</div>' +
                '</div>' +
                '</div>';
        }

        refreshMode();
        update();
    }

    document.querySelectorAll('.bkbg-tax-app').forEach(buildApp);
})();
