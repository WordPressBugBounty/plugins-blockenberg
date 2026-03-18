(function () {
    'use strict';

    function fmt(sym, n) { return sym + Number(n || 0).toFixed(2); }
    function uid() { return '_' + Math.random().toString(36).slice(2); }

    /* ── typography CSS-var helper ──────────────────────── */
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

    function initInvoice(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) {}

        var accent       = opts.accentColor   || '#6c3fb5';
        var cardBg       = opts.cardBg        || '#ffffff';
        var headerBg     = opts.headerBg      || '#f5f3ff';
        var headerColor  = opts.headerColor   || '#6c3fb5';
        var rowOddBg     = opts.rowOddBg      || '#ffffff';
        var rowEvenBg    = opts.rowEvenBg     || '#f9fafb';
        var totalBg      = opts.totalBg       || '#6c3fb5';
        var totalColor   = opts.totalColor    || '#ffffff';
        var borderColor  = opts.borderColor   || '#e5e7eb';
        var labelColor   = opts.labelColor    || '#374151';
        var titleColor   = opts.titleColor    || '#1f2937';
        var subtitleColor= opts.subtitleColor || '#6b7280';
        var sectionBg    = opts.sectionBg     || '';
        var maxWidth     = opts.maxWidth      || 640;
        var cardRadius   = opts.cardRadius    || 16;
        var inputRadius  = opts.inputRadius   || 6;
        var titleSize    = opts.titleSize     || 28;
        var padTop       = opts.paddingTop    || 60;
        var padBot       = opts.paddingBottom || 60;
        var sym          = opts.currencySymbol || '$';
        var showTitle    = opts.showTitle     !== false;
        var showSub      = opts.showSubtitle  !== false;
        var showFromTo   = opts.showFromTo    || false;
        var showInvNo    = opts.showInvoiceNo || false;

        var items = [
            { id: uid(), desc: 'Website Design',    qty: 1,  price: 1200 },
            { id: uid(), desc: 'SEO Optimization',  qty: 3,  price: 150  },
            { id: uid(), desc: 'Monthly Support',   qty: 12, price: 80   }
        ];
        var taxRate  = parseFloat(opts.defaultTax)      || 0;
        var discRate = parseFloat(opts.defaultDiscount) || 0;

        // Layout
        app.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        if (sectionBg) app.style.background = sectionBg;
        app.style.paddingTop    = padTop + 'px';
        app.style.paddingBottom = padBot + 'px';

        typoCssVarsForEl(app, opts.titleTypo, '--bkbg-inv-tt-');

        var card = document.createElement('div');
        card.className = 'bkbg-inv-card';
        card.style.cssText = 'background:' + cardBg + ';border-radius:' + cardRadius + 'px;padding:36px 32px;max-width:' + maxWidth + 'px;margin:0 auto;';
        app.appendChild(card);

        // Header
        var topRow = document.createElement('div');
        topRow.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px;';
        card.appendChild(topRow);

        var titleWrap = document.createElement('div');
        if (showTitle && opts.title) {
            var titleEl = document.createElement('div');
            titleEl.className = 'bkbg-inv-title';
            titleEl.style.cssText = 'color:' + titleColor + ';margin-bottom:4px;';
            titleEl.textContent = opts.title;
            titleWrap.appendChild(titleEl);
        }
        if (showSub && opts.subtitle) {
            var subEl = document.createElement('div');
            subEl.style.cssText = 'font-size:14px;color:' + subtitleColor + ';';
            subEl.textContent = opts.subtitle;
            titleWrap.appendChild(subEl);
        }
        topRow.appendChild(titleWrap);

        if (showInvNo) {
            var invNoWrap = document.createElement('div');
            invNoWrap.style.textAlign = 'right';
            var invLbl = document.createElement('div');
            invLbl.style.cssText = 'font-size:12px;font-weight:600;color:' + labelColor + ';margin-bottom:4px;';
            invLbl.textContent = 'Invoice #';
            var invInp = document.createElement('input');
            invInp.className = 'bkbg-inv-input';
            invInp.value = 'INV-001';
            invInp.style.cssText = 'width:120px;text-align:right;border-radius:' + inputRadius + 'px;border:1.5px solid ' + borderColor + ';border-color:' + borderColor + ';font-size:14px;';
            invNoWrap.appendChild(invLbl); invNoWrap.appendChild(invInp);
            topRow.appendChild(invNoWrap);
        }

        if (showFromTo) {
            var ftGrid = document.createElement('div');
            ftGrid.className = 'bkbg-inv-from-to';
            ftGrid.style.marginBottom = '24px';
            [['From', opts.fromName || ''], ['To', opts.toName || '']].forEach(function(pair) {
                var box = document.createElement('div');
                box.style.cssText = 'padding:14px 16px;background:' + headerBg + ';border-radius:' + inputRadius + 'px;';
                var lbl = document.createElement('div');
                lbl.style.cssText = 'font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:' + headerColor + ';margin-bottom:6px;';
                lbl.textContent = pair[0];
                var val = document.createElement('div');
                val.style.cssText = 'font-size:14px;font-weight:600;color:' + labelColor + ';';
                val.textContent = pair[1];
                box.appendChild(lbl); box.appendChild(val);
                ftGrid.appendChild(box);
            });
            card.appendChild(ftGrid);
        }

        // Table
        var tableWrap = document.createElement('div');
        tableWrap.className = 'bkbg-inv-table-wrap';
        tableWrap.style.cssText = 'overflow-x:auto;border-radius:' + inputRadius + 'px;border:1.5px solid ' + borderColor + ';margin-bottom:14px;';
        card.appendChild(tableWrap);

        var table = document.createElement('table');
        table.className = 'bkbg-inv-table';
        tableWrap.appendChild(table);

        var thead = document.createElement('thead');
        table.appendChild(thead);
        var thRow = document.createElement('tr');
        thead.appendChild(thRow);
        [['Description','44%','left'],['Qty','12%','center'],['Price','20%','right'],['Total','18%','right'],['','6%','center']].forEach(function(col) {
            var th = document.createElement('th');
            th.style.cssText = 'width:' + col[1] + ';text-align:' + col[2] + ';background:' + headerBg + ';color:' + headerColor + ';padding:10px 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;';
            th.textContent = col[0];
            thRow.appendChild(th);
        });

        var tbody = document.createElement('tbody');
        table.appendChild(tbody);

        // Totals
        var totalsWrap = document.createElement('div');
        totalsWrap.className = 'bkbg-inv-totals';
        card.appendChild(totalsWrap);

        var subtotalRow = makeTotalRow('Subtotal', '');
        var discRow     = makeTotalRow('Discount', '');
        var taxRow      = makeTotalRow('Tax', '');
        var grandRow    = document.createElement('div');
        grandRow.className = 'bkbg-inv-grand-total';
        grandRow.style.cssText = 'display:flex;justify-content:space-between;padding:14px 16px;background:' + totalBg + ';border-radius:' + inputRadius + 'px;margin-top:8px;color:' + totalColor + ';';
        var grandLbl = document.createElement('span'); grandLbl.style.cssText = 'font-size:15px;font-weight:700;'; grandLbl.textContent = 'Total';
        var grandVal = document.createElement('span'); grandVal.style.cssText = 'font-size:20px;font-weight:800;';
        grandRow.appendChild(grandLbl); grandRow.appendChild(grandVal);

        // Tax/Disc inputs
        var discContainer = document.createElement('div');
        discContainer.style.cssText = 'display:flex;align-items:center;gap:8px;';
        var discInp = makeNumInp(discRate);
        var discAmt = document.createElement('span'); discAmt.style.cssText = 'font-weight:600;color:#ef4444;font-size:14px;';
        discContainer.appendChild(discInp); discContainer.appendChild(discAmt);
        discRow.querySelector('.bkbg-inv-row-val').appendChild(discContainer);

        var taxContainer = document.createElement('div');
        taxContainer.style.cssText = 'display:flex;align-items:center;gap:8px;';
        var taxInp = makeNumInp(taxRate);
        var taxAmt = document.createElement('span'); taxAmt.style.cssText = 'font-weight:600;font-size:14px;color:' + labelColor + ';';
        taxContainer.appendChild(taxInp); taxContainer.appendChild(taxAmt);
        taxRow.querySelector('.bkbg-inv-row-val').appendChild(taxContainer);

        totalsWrap.appendChild(subtotalRow);
        totalsWrap.appendChild(discRow);
        totalsWrap.appendChild(taxRow);
        totalsWrap.appendChild(grandRow);

        function makeTotalRow(lbl, val) {
            var div = document.createElement('div');
            div.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid ' + borderColor + ';font-size:14px;color:' + labelColor + ';';
            var l = document.createElement('span'); l.textContent = lbl;
            var v = document.createElement('span'); v.className = 'bkbg-inv-row-val'; v.style.fontWeight = '600';
            if (val) v.textContent = val;
            div.appendChild(l); div.appendChild(v);
            return div;
        }

        function makeNumInp(defaultVal) {
            var inp = document.createElement('input');
            inp.className = 'bkbg-inv-input';
            inp.type = 'number'; inp.min = '0'; inp.max = '100'; inp.value = defaultVal;
            inp.style.cssText = 'width:60px;border-radius:' + inputRadius + 'px;border:1.5px solid ' + borderColor + ';font-size:13px;';
            return inp;
        }

        function recalc() {
            var sub = items.reduce(function(s,i){ return s + (parseFloat(i.qty)||0)*(parseFloat(i.price)||0); }, 0);
            var disc2 = parseFloat(discInp.value) || 0;
            var tax2  = parseFloat(taxInp.value)  || 0;
            var damt = sub * disc2 / 100;
            var tamt = (sub - damt) * tax2 / 100;
            var tot  = sub - damt + tamt;
            subtotalRow.querySelector('.bkbg-inv-row-val').textContent = fmt(sym, sub);
            discAmt.textContent = '-' + fmt(sym, damt);
            taxAmt.textContent  = '+' + fmt(sym, tamt);
            grandVal.textContent = fmt(sym, tot);
        }
        discInp.addEventListener('input', recalc);
        taxInp.addEventListener('input', recalc);

        // Add line item button
        var addBtn = document.createElement('button');
        addBtn.className = 'bkbg-inv-add-btn';
        addBtn.style.cssText = 'color:' + accent + ';border-color:' + borderColor + ';border-radius:' + inputRadius + 'px;';
        addBtn.textContent = '+ Add Line Item';
        addBtn.addEventListener('click', function() {
            items.push({ id: uid(), desc: '', qty: 1, price: 0 });
            renderRows();
            recalc();
        });
        card.insertBefore(addBtn, totalsWrap);

        function makeInpCell(val, type, width) {
            var inp = document.createElement('input');
            inp.className = 'bkbg-inv-input';
            inp.type = type || 'text'; inp.value = val;
            inp.style.cssText = 'width:' + (width || '100%') + ';border-radius:' + inputRadius + 'px;border:1.5px solid ' + borderColor + ';';
            return inp;
        }

        function renderRows() {
            tbody.innerHTML = '';
            items.forEach(function(item, idx) {
                var tr = document.createElement('tr');
                tr.style.background = idx % 2 === 0 ? rowOddBg : rowEvenBg;

                // Desc
                var tdDesc = document.createElement('td'); tdDesc.style.padding = '8px 10px';
                var descInp = makeInpCell(item.desc, 'text', '100%');
                descInp.addEventListener('input', function(){ item.desc = descInp.value; });
                tdDesc.appendChild(descInp); tr.appendChild(tdDesc);

                // Qty
                var tdQty = document.createElement('td'); tdQty.style.cssText = 'padding:8px 10px;text-align:center;';
                var qtyInp = makeInpCell(item.qty, 'number', '60px');
                qtyInp.addEventListener('input', function(){ item.qty = qtyInp.value; updateLineTotal(tdTotal, item); recalc(); });
                tdQty.appendChild(qtyInp); tr.appendChild(tdQty);

                // Price
                var tdPrice = document.createElement('td'); tdPrice.style.cssText = 'padding:8px 10px;text-align:right;';
                var priceInp = makeInpCell(item.price, 'number', '80px');
                priceInp.style.textAlign = 'right';
                priceInp.addEventListener('input', function(){ item.price = priceInp.value; updateLineTotal(tdTotal, item); recalc(); });
                tdPrice.appendChild(priceInp); tr.appendChild(tdPrice);

                // Line total
                var tdTotal = document.createElement('td'); tdTotal.style.cssText = 'padding:8px 10px;text-align:right;font-weight:600;color:' + labelColor + ';font-size:14px;';
                updateLineTotal(tdTotal, item);
                tr.appendChild(tdTotal);

                // Delete
                var tdDel = document.createElement('td'); tdDel.style.cssText = 'padding:8px 6px;text-align:center;';
                var delBtn = document.createElement('button');
                delBtn.className = 'bkbg-inv-del-btn';
                delBtn.textContent = '×';
                delBtn.addEventListener('click', function() {
                    items = items.filter(function(i){ return i.id !== item.id; });
                    renderRows(); recalc();
                });
                tdDel.appendChild(delBtn); tr.appendChild(tdDel);

                tbody.appendChild(tr);
            });
            recalc();
        }

        function updateLineTotal(td, item) {
            td.textContent = fmt(sym, (parseFloat(item.qty)||0) * (parseFloat(item.price)||0));
        }

        renderRows();
        recalc();
    }

    document.querySelectorAll('.bkbg-inv-app').forEach(initInvoice);
})();
