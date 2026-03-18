(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family: 'font-family', weight: 'font-weight', transform: 'text-transform',
            style: 'font-style', decoration: 'text-decoration',
            sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m', sizeUnit: 'font-size-unit',
            lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m', lineHeightUnit: 'line-height-unit',
            letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m', letterSpacingUnit: 'letter-spacing-unit',
            wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m', wordSpacingUnit: 'word-spacing-unit'
        };
        Object.keys(map).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (typeof v === 'number') {
                    var css = map[k];
                    var unit = '';
                    if (css.indexOf('font-size') === 0 && css !== 'font-size-unit') unit = typo.sizeUnit || 'px';
                    else if (css.indexOf('line-height') === 0 && css !== 'line-height-unit') unit = typo.lineHeightUnit || '';
                    else if (css.indexOf('letter-spacing') === 0 && css !== 'letter-spacing-unit') unit = typo.letterSpacingUnit || 'px';
                    else if (css.indexOf('word-spacing') === 0 && css !== 'word-spacing-unit') unit = typo.wordSpacingUnit || 'px';
                    v = v + unit;
                }
                el.style.setProperty(prefix + map[k], v);
            }
        });
    }

    var CAT_COLORS = {
        Housing:       '#6366f1',
        Food:          '#f59e0b',
        Transport:     '#10b981',
        Entertainment: '#ec4899',
        Health:        '#ef4444',
        Shopping:      '#3b82f6',
        Utilities:     '#14b8a6',
        Other:         '#8b5cf6'
    };
    var CATEGORIES = ['Housing','Food','Transport','Entertainment','Health','Shopping','Utilities','Other'];

    var STORAGE_KEY = 'bkbg_expense_tracker';

    function loadData(uid) {
        try {
            var raw = localStorage.getItem(STORAGE_KEY + '_' + uid);
            return raw ? JSON.parse(raw) : { expenses: [], budget: 1000 };
        } catch (e) { return { expenses: [], budget: 1000 }; }
    }

    function saveData(uid, data) {
        try { localStorage.setItem(STORAGE_KEY + '_' + uid, JSON.stringify(data)); } catch (e) {}
    }

    function formatDate(d) {
        var dt = new Date(d);
        return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    function initBlock(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }
        var a = opts;
        var uid = root.getAttribute('data-uid') || ('expt' + Math.random().toString(36).slice(2));
        root.setAttribute('data-uid', uid);

        var stored = loadData(uid);
        var expenses = stored.expenses || [];
        var budget = stored.budget || a.defaultBudget;
        var filterCat = 'all';
        var nextId = (expenses.length ? Math.max.apply(null, expenses.map(function (e) { return e.id; })) + 1 : 1);

        root.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-expt-wrap';
        wrap.style.cssText = 'background:' + a.sectionBg + ';max-width:' + a.contentMaxWidth + 'px;margin:0 auto;';
        root.appendChild(wrap);

        typoCssVarsForEl(a.typoTitle, '--bkbg-expt-ttl-', wrap);
        typoCssVarsForEl(a.typoSubtitle, '--bkbg-expt-sub-', wrap);

        if (a.showTitle) {
            var h = document.createElement('div');
            h.className = 'bkbg-expt-title';
            h.style.cssText = 'color:' + a.titleColor + ';';
            h.textContent = a.title;
            wrap.appendChild(h);
        }
        if (a.showSubtitle) {
            var sub = document.createElement('div');
            sub.className = 'bkbg-expt-subtitle';
            sub.style.color = a.subtitleColor;
            sub.textContent = a.subtitle;
            wrap.appendChild(sub);
        }

        /* Summary */
        var summaryEl = document.createElement('div');
        summaryEl.className = 'bkbg-expt-summary';
        wrap.appendChild(summaryEl);

        /* Form */
        var form = document.createElement('div');
        form.className = 'bkbg-expt-form';
        form.style.cssText = 'background:' + a.cardBg + ';border-color:' + a.borderColor + ';';
        wrap.appendChild(form);

        function makeFormGroup(labelText) {
            var g = document.createElement('div');
            g.className = 'bkbg-expt-form-group';
            var lbl = document.createElement('label');
            lbl.className = 'bkbg-expt-label';
            lbl.style.color = a.labelColor;
            lbl.textContent = labelText;
            g.appendChild(lbl);
            return g;
        }

        var gName = makeFormGroup('Description');
        var iName = document.createElement('input');
        iName.className = 'bkbg-expt-input';
        iName.placeholder = 'e.g. Coffee';
        gName.appendChild(iName);
        form.appendChild(gName);

        var gAmt = makeFormGroup('Amount');
        var iAmt = document.createElement('input');
        iAmt.className = 'bkbg-expt-input';
        iAmt.type = 'number';
        iAmt.placeholder = '0.00';
        iAmt.min = '0';
        iAmt.step = '0.01';
        gAmt.appendChild(iAmt);
        form.appendChild(gAmt);

        var gCat = makeFormGroup('Category');
        var iCat = document.createElement('select');
        iCat.className = 'bkbg-expt-select';
        CATEGORIES.forEach(function (c) {
            var o = document.createElement('option');
            o.value = c;
            o.textContent = c;
            iCat.appendChild(o);
        });
        gCat.appendChild(iCat);
        form.appendChild(gCat);

        var gDate = makeFormGroup('Date');
        var iDate = document.createElement('input');
        iDate.className = 'bkbg-expt-input';
        iDate.type = 'date';
        iDate.value = new Date().toISOString().slice(0, 10);
        gDate.appendChild(iDate);
        form.appendChild(gDate);

        var addBtn = document.createElement('button');
        addBtn.className = 'bkbg-expt-add-btn';
        addBtn.style.background = a.accentColor;
        addBtn.textContent = '+ Add';
        form.appendChild(addBtn);

        /* Chart */
        var chartEl = null;
        if (a.showChart) {
            chartEl = document.createElement('div');
            chartEl.className = 'bkbg-expt-chart';
            chartEl.style.cssText = 'background:' + a.cardBg + ';border-color:' + a.borderColor + ';';
            wrap.appendChild(chartEl);
        }

        /* List */
        var listEl = document.createElement('div');
        listEl.className = 'bkbg-expt-list';
        listEl.style.cssText = 'background:' + a.cardBg + ';border-color:' + a.borderColor + ';';
        wrap.appendChild(listEl);

        var listHeader = document.createElement('div');
        listHeader.className = 'bkbg-expt-list-header';
        listHeader.style.cssText = 'color:' + a.labelColor + ';border-color:' + a.borderColor + ';';
        listHeader.appendChild(document.createTextNode('Expenses'));
        var filterSel = document.createElement('select');
        filterSel.className = 'bkbg-expt-filter';
        var allOpt = document.createElement('option');
        allOpt.value = 'all';
        allOpt.textContent = 'All Categories';
        filterSel.appendChild(allOpt);
        CATEGORIES.forEach(function (c) {
            var o = document.createElement('option');
            o.value = c;
            o.textContent = c;
            filterSel.appendChild(o);
        });
        listHeader.appendChild(filterSel);
        listEl.appendChild(listHeader);

        var listBody = document.createElement('div');
        listEl.appendChild(listBody);

        function persist() { saveData(uid, { expenses: expenses, budget: budget }); }

        function render() {
            var total = expenses.reduce(function (s, e) { return s + e.amount; }, 0);

            /* Summary */
            summaryEl.innerHTML = '';
            function makeCard(val, lbl, color) {
                var c = document.createElement('div');
                c.className = 'bkbg-expt-card';
                c.style.cssText = 'background:' + a.cardBg + ';border-color:' + a.borderColor + ';';
                var v = document.createElement('div');
                v.className = 'bkbg-expt-card-val';
                v.style.color = color;
                v.textContent = a.currency + val;
                var l = document.createElement('div');
                l.className = 'bkbg-expt-card-lbl';
                l.style.color = a.subtitleColor;
                l.textContent = lbl;
                c.appendChild(v);
                c.appendChild(l);
                return c;
            }

            summaryEl.appendChild(makeCard(total.toFixed(2), 'Total Spent', a.accentColor));

            if (a.showBudget) {
                var rem = budget - total;
                var remColor = rem < 0 ? a.dangerColor : a.labelColor;
                var budCard = makeCard(Math.abs(rem).toFixed(2), rem < 0 ? 'Over Budget' : 'Remaining', remColor);
                var barWrap = document.createElement('div');
                barWrap.className = 'bkbg-expt-budget-bar-wrap';
                var barFill = document.createElement('div');
                barFill.className = 'bkbg-expt-budget-bar';
                var pct = Math.min((total / budget) * 100, 100);
                barFill.style.cssText = 'width:' + pct + '%;background:' + (rem < 0 ? a.dangerColor : a.accentColor) + ';';
                barWrap.appendChild(barFill);
                budCard.appendChild(barWrap);
                summaryEl.appendChild(budCard);
            }

            summaryEl.appendChild(makeCard(expenses.length.toString(), 'Transactions', a.labelColor));

            /* Chart */
            if (chartEl) {
                chartEl.innerHTML = '';
                var ct = document.createElement('div');
                ct.className = 'bkbg-expt-chart-title';
                ct.style.color = a.labelColor;
                ct.textContent = 'Spending by Category';
                chartEl.appendChild(ct);

                var catTotals = {};
                expenses.forEach(function (e) {
                    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
                });
                var maxCat = Math.max.apply(null, Object.values(catTotals).concat([0]));

                Object.keys(catTotals).sort(function (x, y) { return catTotals[y] - catTotals[x]; }).forEach(function (cat) {
                    var pct = maxCat > 0 ? Math.round((catTotals[cat] / maxCat) * 100) : 0;
                    var row = document.createElement('div');
                    row.className = 'bkbg-expt-bar-row';
                    var lbls = document.createElement('div');
                    lbls.className = 'bkbg-expt-bar-labels';
                    var catLbl = document.createElement('span');
                    catLbl.style.color = a.labelColor;
                    catLbl.textContent = cat;
                    var amtLbl = document.createElement('span');
                    amtLbl.style.color = a.subtitleColor;
                    amtLbl.textContent = a.currency + catTotals[cat].toFixed(2);
                    lbls.appendChild(catLbl);
                    lbls.appendChild(amtLbl);
                    var track = document.createElement('div');
                    track.className = 'bkbg-expt-bar-track';
                    var fill = document.createElement('div');
                    fill.className = 'bkbg-expt-bar-fill';
                    fill.style.cssText = 'width:' + pct + '%;background:' + (CAT_COLORS[cat] || a.accentColor) + ';';
                    track.appendChild(fill);
                    row.appendChild(lbls);
                    row.appendChild(track);
                    chartEl.appendChild(row);
                });

                if (!Object.keys(catTotals).length) {
                    var empty = document.createElement('div');
                    empty.style.cssText = 'text-align:center;padding:16px;font-size:13px;color:' + a.subtitleColor + ';';
                    empty.textContent = 'No expenses yet';
                    chartEl.appendChild(empty);
                }
            }

            /* List */
            listBody.innerHTML = '';
            var filtered = filterCat === 'all' ? expenses : expenses.filter(function (e) { return e.category === filterCat; });
            var sorted = filtered.slice().sort(function (x, y) { return new Date(y.date) - new Date(x.date); });

            if (!sorted.length) {
                var empt = document.createElement('div');
                empt.className = 'bkbg-expt-empty';
                empt.style.color = a.subtitleColor;
                empt.textContent = filterCat === 'all' ? 'No expenses yet. Add your first one above!' : 'No expenses in this category.';
                listBody.appendChild(empt);
                return;
            }

            sorted.forEach(function (exp) {
                var item = document.createElement('div');
                item.className = 'bkbg-expt-item';
                item.style.borderColor = a.borderColor;
                var left = document.createElement('div');
                left.className = 'bkbg-expt-item-left';
                var dot = document.createElement('div');
                dot.className = 'bkbg-expt-dot';
                dot.style.background = CAT_COLORS[exp.category] || a.accentColor;
                var info = document.createElement('div');
                var name = document.createElement('div');
                name.className = 'bkbg-expt-item-name';
                name.style.color = a.labelColor;
                name.textContent = exp.name;
                var meta = document.createElement('div');
                meta.className = 'bkbg-expt-item-meta';
                meta.style.color = a.subtitleColor;
                meta.textContent = exp.category + ' · ' + formatDate(exp.date);
                info.appendChild(name);
                info.appendChild(meta);
                left.appendChild(dot);
                left.appendChild(info);
                var right = document.createElement('div');
                right.className = 'bkbg-expt-item-right';
                var amt = document.createElement('div');
                amt.className = 'bkbg-expt-item-amount';
                amt.style.color = a.labelColor;
                amt.textContent = a.currency + exp.amount.toFixed(2);
                var del = document.createElement('button');
                del.className = 'bkbg-expt-del-btn';
                del.textContent = '×';
                del.setAttribute('aria-label', 'Delete');
                del.addEventListener('click', function () {
                    expenses = expenses.filter(function (e) { return e.id !== exp.id; });
                    persist();
                    render();
                });
                right.appendChild(amt);
                right.appendChild(del);
                item.appendChild(left);
                item.appendChild(right);
                listBody.appendChild(item);
            });
        }

        addBtn.addEventListener('click', function () {
            var name = iName.value.trim();
            var amt = parseFloat(iAmt.value);
            if (!name || isNaN(amt) || amt <= 0) { return; }
            expenses.push({ id: nextId++, name: name, amount: amt, category: iCat.value, date: iDate.value || new Date().toISOString().slice(0, 10) });
            persist();
            render();
            iName.value = '';
            iAmt.value = '';
            iName.focus();
        });

        iName.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { iAmt.focus(); }
        });
        iAmt.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { addBtn.click(); }
        });

        filterSel.addEventListener('change', function () {
            filterCat = filterSel.value;
            render();
        });

        render();
    }

    function init() {
        document.querySelectorAll('.bkbg-expt-app').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
