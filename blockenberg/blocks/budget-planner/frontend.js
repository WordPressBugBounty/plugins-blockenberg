(function () {
    'use strict';

    var DEFAULT_CATEGORIES = [
        { name:'Housing',       amount:1200, icon:'🏠' },
        { name:'Food',          amount:400,  icon:'🍔' },
        { name:'Transport',     amount:250,  icon:'🚗' },
        { name:'Utilities',     amount:150,  icon:'💡' },
        { name:'Healthcare',    amount:100,  icon:'🏥' },
        { name:'Entertainment', amount:200,  icon:'🎬' }
    ];

    var BUDGETING_TIPS = [
        'The 50/30/20 rule: spend 50% on needs, 30% on wants, and save 20%.',
        'Build a 3–6 month emergency fund before investing.',
        'Track every expense — even small ones add up over a month.',
        'Pay yourself first: move savings out on payday before spending.',
        'Review subscriptions quarterly — cancel what you no longer use.'
    ];

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo) return;
        if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    document.querySelectorAll('.bkbg-bp-app').forEach(function(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); }
        catch(e) { return; }

        typoCssVarsForEl(opts.typoTitle, '--bkbg-bp-title-', root);
        typoCssVarsForEl(opts.typoSubtitle, '--bkbg-bp-sub-', root);

        var o = {
            title:           opts.title           || 'Monthly Budget Planner',
            subtitle:        opts.subtitle        || '',
            currency:        opts.currency        || '$',
            showSavingsGoal: opts.showSavingsGoal !== false,
            showPieBreakdown:opts.showPieBreakdown !== false,
            showTips:        opts.showTips        !== false,
            defaultIncome:   parseFloat(opts.defaultIncome)  || 5000,
            defaultSavings:  parseFloat(opts.defaultSavings) || 500,
            accentColor:     opts.accentColor     || '#22c55e',
            expenseColor:    opts.expenseColor    || '#f43f5e',
            savingsColor:    opts.savingsColor    || '#8b5cf6',
            surplusColor:    opts.surplusColor    || '#0ea5e9',
            sectionBg:       opts.sectionBg       || '#f0fdf4',
            cardBg:          opts.cardBg          || '#ffffff',
            inputBg:         opts.inputBg         || '#f9fafb',
            titleColor:      opts.titleColor      || '#111827',
            subtitleColor:   opts.subtitleColor   || '#6b7280',
            labelColor:      opts.labelColor      || '#374151',
            titleFontSize:   parseInt(opts.titleFontSize)   || 26,
            contentMaxWidth: parseInt(opts.contentMaxWidth) || 740
        };

        var income     = o.defaultIncome;
        var savingsGoal= o.defaultSavings;
        var categories = DEFAULT_CATEGORIES.map(function(c){ return { name:c.name, amount:c.amount, icon:c.icon }; });

        function cur(n) { return o.currency + Number(n).toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:2}); }

        // ── Build shell ────────────────────────────────────────────────
        root.innerHTML =
            '<div class="bkbg-bp-wrap" style="background:' + o.sectionBg + ';max-width:' + o.contentMaxWidth + 'px;--bp-accent:' + o.accentColor + '">' +
            (o.title    ? '<h3 class="bkbg-bp-title" style="color:' + o.titleColor + '">' + o.title    + '</h3>' : '') +
            (o.subtitle ? '<p  class="bkbg-bp-subtitle" style="color:' + o.subtitleColor + '">' + o.subtitle + '</p>' : '') +

            // Income
            '<div class="bkbg-bp-income-card" style="background:' + o.cardBg + '">' +
            '<span class="bkbg-bp-income-icon">💰</span>' +
            '<div class="bkbg-bp-income-info">' +
            '<div class="bkbg-bp-income-caption">Monthly Income</div>' +
            '<div class="bkbg-bp-income-value" id="bp-income-disp" style="color:' + o.accentColor + '">' + cur(income) + '</div>' +
            '</div>' +
            '<input id="bp-income-in" type="number" class="bkbg-bp-income-input" value="' + income + '" min="0" step="100" style="background:' + o.inputBg + ';color:' + o.labelColor + '">' +
            '</div>' +

            // Categories section
            '<div class="bkbg-bp-section-title" style="color:' + o.labelColor + '">Expense Categories</div>' +
            '<div class="bkbg-bp-categories" id="bp-cats"></div>' +

            // Add category row
            '<div class="bkbg-bp-add-row">' +
            '<input id="bp-new-name" type="text" class="bkbg-bp-add-input" placeholder="Category name (e.g. Gym)" style="background:' + o.inputBg + ';color:' + o.labelColor + '">' +
            '<input id="bp-new-amount" type="number" class="bkbg-bp-add-input" placeholder="Amount" min="0" step="10" style="background:' + o.inputBg + ';color:' + o.labelColor + ';max-width:100px">' +
            '<button id="bp-add-cat" class="bkbg-bp-add-btn">+ Add</button>' +
            '</div>' +

            // Savings goal
            (o.showSavingsGoal ?
                '<div class="bkbg-bp-savings-card" style="background:' + o.cardBg + '">' +
                '<span style="font-size:22px">🎯</span>' +
                '<div style="flex:1"><div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;margin-bottom:3px">Savings Goal</div>' +
                '<div id="bp-sav-disp" style="font-size:20px;font-weight:700;color:' + o.savingsColor + '">' + cur(savingsGoal) + '</div></div>' +
                '<input id="bp-sav-in" type="number" class="bkbg-bp-income-input" value="' + savingsGoal + '" min="0" step="50" style="background:' + o.inputBg + ';color:' + o.labelColor + '">' +
                '</div>'
            : '') +

            // Summary
            '<div class="bkbg-bp-summary" id="bp-summary"></div>' +

            // Allocation bar
            (o.showPieBreakdown ? '<div class="bkbg-bp-alloc" id="bp-alloc"></div>' : '') +

            // Tips
            (o.showTips ?
                '<div class="bkbg-bp-tips">' +
                '<div class="bkbg-bp-tips-title">💡 Budgeting Tips</div>' +
                '<ul class="bkbg-bp-tips-list">' +
                BUDGETING_TIPS.map(function(t){ return '<li>' + t + '</li>'; }).join('') +
                '</ul></div>'
            : '') +
            '</div>';

        var catsEl    = root.querySelector('#bp-cats');
        var summaryEl = root.querySelector('#bp-summary');
        var allocEl   = root.querySelector('#bp-alloc');
        var incomeIn  = root.querySelector('#bp-income-in');
        var incomeDisp= root.querySelector('#bp-income-disp');
        var savIn     = root.querySelector('#bp-sav-in');
        var savDisp   = root.querySelector('#bp-sav-disp');
        var newName   = root.querySelector('#bp-new-name');
        var newAmt    = root.querySelector('#bp-new-amount');
        var addBtn    = root.querySelector('#bp-add-cat');

        // ── Render categories ──────────────────────────────────────────
        function renderCategories() {
            var totalExp = categories.reduce(function(s,c){ return s + (parseFloat(c.amount)||0); }, 0);
            catsEl.innerHTML = categories.map(function(cat, idx) {
                var pct = income > 0 ? Math.min(100, (cat.amount/income)*100) : 0;
                return '<div class="bkbg-bp-cat-row" style="background:' + o.cardBg + '">' +
                    '<span class="bkbg-bp-cat-icon">' + (cat.icon||'📋') + '</span>' +
                    '<span class="bkbg-bp-cat-name" style="color:' + o.labelColor + '">' + escHtml(cat.name) + '</span>' +
                    '<div class="bkbg-bp-cat-bar-wrap">' +
                    '<div class="bkbg-bp-cat-bar-fill" style="width:' + pct.toFixed(1) + '%;background:' + o.expenseColor + '"></div>' +
                    '</div>' +
                    '<input class="bkbg-bp-cat-input" type="number" data-idx="' + idx + '" value="' + cat.amount + '" min="0" step="10" style="background:' + o.inputBg + ';color:' + o.labelColor + '">' +
                    '<button class="bkbg-bp-del-cat" data-idx="' + idx + '" style="background:none;border:none;font-size:16px;cursor:pointer;color:#9ca3af;padding:0 2px" title="Remove">✕</button>' +
                    '</div>';
            }).join('');

            // bind inputs
            catsEl.querySelectorAll('.bkbg-bp-cat-input').forEach(function(inp) {
                inp.addEventListener('input', function() {
                    var idx = parseInt(inp.getAttribute('data-idx'));
                    categories[idx].amount = parseFloat(inp.value) || 0;
                    renderSummary();
                });
            });
            catsEl.querySelectorAll('.bkbg-bp-del-cat').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(btn.getAttribute('data-idx'));
                    categories.splice(idx, 1);
                    renderCategories();
                    renderSummary();
                });
            });
        }

        // ── Render summary ─────────────────────────────────────────────
        function renderSummary() {
            var totalExp = categories.reduce(function(s,c){ return s + (parseFloat(c.amount)||0); }, 0);
            var sav      = o.showSavingsGoal ? savingsGoal : 0;
            var surplus  = income - totalExp - sav;
            var surColor = surplus >= 0 ? o.surplusColor : o.expenseColor;
            var surLabel = surplus >= 0 ? 'Surplus' : 'Deficit';

            var cards = [
                { label:'Total Income',   value: cur(income),   color: o.accentColor  },
                { label:'Total Expenses', value: cur(totalExp), color: o.expenseColor },
                { label:'Savings Goal',   value: cur(sav),      color: o.savingsColor, hide: !o.showSavingsGoal },
                { label: surLabel,        value: (surplus>=0?'+':'-') + cur(Math.abs(surplus)), color: surColor }
            ].filter(function(c){ return !c.hide; });

            summaryEl.innerHTML = cards.map(function(c) {
                return '<div class="bkbg-bp-sum-card" style="background:' + o.cardBg + ';border-left-color:' + c.color + '">' +
                    '<div class="bkbg-bp-sum-label">' + c.label + '</div>' +
                    '<div class="bkbg-bp-sum-value" style="color:' + c.color + '">' + c.value + '</div>' +
                    '</div>';
            }).join('');

            // Update income display
            if (incomeDisp) incomeDisp.textContent = cur(income);
            if (savDisp)    savDisp.textContent    = cur(savingsGoal);

            // Allocation bar
            if (allocEl && o.showPieBreakdown) {
                var expPct  = income > 0 ? Math.min(100, (totalExp/income)*100)  : 0;
                var savPct  = income > 0 ? Math.min(100-expPct, (sav/income)*100): 0;
                var surPct  = Math.max(0, 100 - expPct - savPct);
                allocEl.innerHTML =
                    '<div class="bkbg-bp-alloc-heading" style="color:' + o.labelColor + '">Income Allocation</div>' +
                    '<div class="bkbg-bp-alloc-bar">' +
                    '<div class="bkbg-bp-alloc-seg" style="width:' + expPct.toFixed(1) + '%;background:' + o.expenseColor + '"></div>' +
                    '<div class="bkbg-bp-alloc-seg" style="width:' + savPct.toFixed(1) + '%;background:' + o.savingsColor + '"></div>' +
                    '<div class="bkbg-bp-alloc-seg" style="width:' + surPct.toFixed(1) + '%;background:' + o.surplusColor + '"></div>' +
                    '</div>' +
                    '<div class="bkbg-bp-alloc-legend">' +
                    '<span style="color:' + o.expenseColor + '">● Expenses ' + Math.round(expPct)  + '%</span>' +
                    '<span style="color:' + o.savingsColor + '">● Savings '  + Math.round(savPct)  + '%</span>' +
                    '<span style="color:' + o.surplusColor + '">● Surplus '  + Math.round(surPct)  + '%</span>' +
                    '</div>';
            }
        }

        function escHtml(s) {
            return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        }

        // ── Event bindings ─────────────────────────────────────────────
        if (incomeIn) {
            incomeIn.addEventListener('input', function() {
                income = parseFloat(incomeIn.value) || 0;
                renderCategories();
                renderSummary();
            });
        }
        if (savIn) {
            savIn.addEventListener('input', function() {
                savingsGoal = parseFloat(savIn.value) || 0;
                renderSummary();
            });
        }
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                var name = newName ? newName.value.trim() : '';
                var amt  = newAmt  ? parseFloat(newAmt.value) || 0 : 0;
                if (!name) { if (newName) newName.focus(); return; }
                categories.push({ name: name, amount: amt, icon: '📋' });
                if (newName) newName.value = '';
                if (newAmt)  newAmt.value  = '';
                renderCategories();
                renderSummary();
            });
        }

        // ── Initial render ─────────────────────────────────────────────
        renderCategories();
        renderSummary();
    });
})();
