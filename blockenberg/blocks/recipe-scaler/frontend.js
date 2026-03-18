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
        Object.keys(_typoKeys).forEach(function(k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    var SAMPLE_INGREDIENTS = [
        { qty: 2,   unit: 'cups', name: 'All-purpose flour' },
        { qty: 2,   unit: 'tsp',  name: 'Baking powder' },
        { qty: 0.5, unit: 'tsp',  name: 'Salt' },
        { qty: 2,   unit: 'tbsp', name: 'Sugar' },
        { qty: 2,   unit: '',     name: 'Large eggs' },
        { qty: 1.5, unit: 'cups', name: 'Milk' },
        { qty: 3,   unit: 'tbsp', name: 'Butter, melted' }
    ];

    var QUICK_BTNS = [1, 2, 4, 6, 8, 12];

    function fmtQty(n) {
        if (n <= 0) return '0';
        var fracs = [[0.125,'⅛'],[0.25,'¼'],[0.33,'⅓'],[0.5,'½'],[0.67,'⅔'],[0.75,'¾']];
        var whole = Math.floor(n);
        var rem   = Math.round((n - whole)*1000)/1000;
        for (var i=0; i<fracs.length; i++) {
            if (Math.abs(rem - fracs[i][0]) < 0.02) {
                return (whole > 0 ? whole + ' ' : '') + fracs[i][1];
            }
        }
        if (rem === 0) return String(whole);
        var d = Math.round(n * 100) / 100;
        return d.toFixed(2).replace(/\.?0+$/, '');
    }

    function escHtml(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    document.querySelectorAll('.bkbg-rsc-app').forEach(function(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); }
        catch(e) { return; }

        var o = {
            title:           opts.title           || 'Recipe Scaler',
            subtitle:        opts.subtitle        || '',
            recipeName:      opts.recipeName      || 'Recipe',
            defaultServings: parseInt(opts.defaultServings) || 4,
            maxServings:     parseInt(opts.maxServings)     || 24,
            showQuickBtns:   opts.showQuickBtns   !== false,
            showNotes:       opts.showNotes        !== false,
            recipeNotes:     opts.recipeNotes      || '',
            accentColor:     opts.accentColor      || '#f97316',
            sectionBg:       opts.sectionBg        || '#fff7ed',
            cardBg:          opts.cardBg           || '#ffffff',
            inputBg:         opts.inputBg          || '#fafafa',
            ingredientBg:    opts.ingredientBg     || '#fef3c7',
            titleColor:      opts.titleColor       || '#111827',
            subtitleColor:   opts.subtitleColor    || '#6b7280',
            labelColor:      opts.labelColor       || '#374151',
            titleTypo:       opts.titleTypo        || {},
            contentMaxWidth: parseInt(opts.contentMaxWidth) || 660
        };

        var baseServings  = o.defaultServings;
        var curServings   = o.defaultServings;
        var ingredients   = SAMPLE_INGREDIENTS.map(function(i){ return { qty:i.qty, unit:i.unit, name:i.name }; });

        // ── Build shell ────────────────────────────────────────────────
        root.innerHTML =
            '<div class="bkbg-rsc-wrap" style="background:' + o.sectionBg + ';max-width:' + o.contentMaxWidth + 'px;--rsc-accent:' + o.accentColor + '">' +
            (o.title    ? '<h3 class="bkbg-rsc-title"    style="color:' + o.titleColor    + '">' + o.title    + '</h3>' : '') +
            (o.subtitle ? '<p  class="bkbg-rsc-subtitle" style="color:' + o.subtitleColor + '">' + o.subtitle + '</p>' : '') +

            // Recipe name
            '<div class="bkbg-rsc-name-card" style="background:' + o.cardBg + '">' +
            '<span class="bkbg-rsc-name-icon">🍽️</span>' +
            '<span class="bkbg-rsc-name-text" style="color:' + o.titleColor + '">' + escHtml(o.recipeName) + '</span>' +
            '</div>' +

            // Servings control
            '<div class="bkbg-rsc-servings-card" style="background:' + o.cardBg + '">' +
            '<div class="bkbg-rsc-servings-label" style="color:' + o.labelColor + '">Servings</div>' +
            '<div class="bkbg-rsc-servings-row">' +
            '<button class="bkbg-rsc-sv-btn" id="rsc-minus">−</button>' +
            '<input  class="bkbg-rsc-sv-input" id="rsc-sv-in" type="number" min="1" max="' + o.maxServings + '" value="' + curServings + '" style="background:' + o.inputBg + ';border-color:#e5e7eb">' +
            '<button class="bkbg-rsc-sv-btn" id="rsc-plus">+</button>' +
            '<span class="bkbg-rsc-sv-unit" style="color:' + o.labelColor + '">servings</span>' +
            '</div>' +
            (o.showQuickBtns ?
                '<div class="bkbg-rsc-quick-row" id="rsc-quick">' +
                QUICK_BTNS.map(function(n) {
                    return '<button class="bkbg-rsc-quick-btn' + (n===curServings?' active':'') + '" data-sv="' + n + '" style="color:' + (n===curServings?'#fff':o.labelColor) + '">' + n + 'x</button>';
                }).join('') +
                '</div>'
            : '') +
            '</div>' +

            // Ingredients section
            '<div class="bkbg-rsc-ing-section">' +
            '<div class="bkbg-rsc-ing-heading" style="color:' + o.labelColor + '">Ingredients' +
            '<span class="bkbg-rsc-scale-badge" id="rsc-scale-badge">×' + (curServings/baseServings).toFixed(2).replace(/\.?0+$/,'') + '</span>' +
            '</div>' +
            '<div class="bkbg-rsc-ing-list" id="rsc-ing-list"></div>' +
            '</div>' +

            // Add ingredient form
            '<div class="bkbg-rsc-add-form">' +
            '<input class="bkbg-rsc-add-input bkbg-rsc-add-qty"  id="rsc-new-qty"  type="number" placeholder="Qty"  min="0" step="0.25" style="background:' + o.inputBg + ';color:' + o.labelColor + '">' +
            '<input class="bkbg-rsc-add-input bkbg-rsc-add-unit" id="rsc-new-unit" type="text"   placeholder="Unit (e.g. cups)" style="background:' + o.inputBg + ';color:' + o.labelColor + '">' +
            '<input class="bkbg-rsc-add-input bkbg-rsc-add-name" id="rsc-new-name" type="text"   placeholder="Ingredient name" style="background:' + o.inputBg + ';color:' + o.labelColor + '">' +
            '<button id="rsc-add-btn" class="bkbg-rsc-add-btn">+ Add</button>' +
            '</div>' +

            // Notes
            (o.showNotes && o.recipeNotes ?
                '<div class="bkbg-rsc-notes">' +
                '<div class="bkbg-rsc-notes-title">📝 Recipe Notes</div>' +
                '<div class="bkbg-rsc-notes-text">' + escHtml(o.recipeNotes) + '</div>' +
                '</div>'
            : '') +
            '</div>';

        var wrap = root.querySelector('.bkbg-rsc-wrap');
        if (wrap) typoCssVarsForEl(wrap, o.titleTypo || {}, '--bkrsc-tt-');

        var svInput    = root.querySelector('#rsc-sv-in');
        var minusBtn   = root.querySelector('#rsc-minus');
        var plusBtn    = root.querySelector('#rsc-plus');
        var ingList    = root.querySelector('#rsc-ing-list');
        var badge      = root.querySelector('#rsc-scale-badge');
        var quickRow   = root.querySelector('#rsc-quick');
        var newQty     = root.querySelector('#rsc-new-qty');
        var newUnit    = root.querySelector('#rsc-new-unit');
        var newName    = root.querySelector('#rsc-new-name');
        var addBtn     = root.querySelector('#rsc-add-btn');

        // ── Re-render ingredients ──────────────────────────────────────
        function renderIngredients() {
            var factor = curServings / baseServings;
            ingList.innerHTML = ingredients.map(function(ing, idx) {
                var scaled = fmtQty(ing.qty * factor);
                return '<div class="bkbg-rsc-ing-row" style="background:' + o.ingredientBg + '">' +
                    '<span class="bkbg-rsc-ing-qty">' + scaled + '</span>' +
                    '<span class="bkbg-rsc-ing-unit">' + escHtml(ing.unit) + '</span>' +
                    '<span class="bkbg-rsc-ing-name" style="color:' + o.labelColor + '">' + escHtml(ing.name) + '</span>' +
                    '<button class="bkbg-rsc-ing-del" data-idx="' + idx + '" title="Remove">✕</button>' +
                    '</div>';
            }).join('');

            ingList.querySelectorAll('.bkbg-rsc-ing-del').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    ingredients.splice(parseInt(btn.getAttribute('data-idx')), 1);
                    renderIngredients();
                });
            });

            if (badge) {
                var f = curServings / baseServings;
                badge.textContent = '×' + (f === 1 ? '1' : f.toFixed(2).replace(/\.?0+$/, ''));
            }
            updateQuickBtns();
        }

        // ── Update servings ────────────────────────────────────────────
        function setServings(n) {
            n = Math.max(1, Math.min(o.maxServings, Math.round(n)));
            curServings = n;
            if (svInput) svInput.value = n;
            renderIngredients();
        }

        function updateQuickBtns() {
            if (!quickRow) return;
            quickRow.querySelectorAll('.bkbg-rsc-quick-btn').forEach(function(b) {
                var act = parseInt(b.getAttribute('data-sv')) === curServings;
                b.classList.toggle('active', act);
                b.style.color = act ? '#fff' : o.labelColor;
            });
        }

        // ── Bindings ───────────────────────────────────────────────────
        if (minusBtn) minusBtn.addEventListener('click', function() { setServings(curServings - 1); });
        if (plusBtn)  plusBtn.addEventListener('click',  function() { setServings(curServings + 1); });
        if (svInput)  svInput.addEventListener('input',  function() {
            var v = parseInt(svInput.value);
            if (!isNaN(v) && v > 0) { curServings = Math.min(o.maxServings, v); renderIngredients(); }
        });

        if (quickRow) {
            quickRow.querySelectorAll('.bkbg-rsc-quick-btn').forEach(function(b) {
                b.addEventListener('click', function() { setServings(parseInt(b.getAttribute('data-sv'))); });
            });
        }

        if (addBtn) {
            addBtn.addEventListener('click', function() {
                var qty  = parseFloat(newQty  ? newQty.value  : 0) || 0;
                var unit = newUnit ? newUnit.value.trim() : '';
                var name = newName ? newName.value.trim() : '';
                if (!name) { if (newName) newName.focus(); return; }
                // Store qty relative to base servings
                ingredients.push({ qty: qty * (baseServings / curServings), unit: unit, name: name });
                if (newQty)  newQty.value  = '';
                if (newUnit) newUnit.value = '';
                if (newName) newName.value = '';
                renderIngredients();
            });
        }

        // ── Initial render ─────────────────────────────────────────────
        renderIngredients();
    });
})();
