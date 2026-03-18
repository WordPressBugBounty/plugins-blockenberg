(function () {
    'use strict';

    /* ── Conversion data ────────────────────────────────────────────────────── */
    var CATEGORIES = {
        length: {
            label: 'Length',
            units: {
                meter:         { label: 'Meter (m)',          toBase: 1 },
                kilometer:     { label: 'Kilometer (km)',     toBase: 1000 },
                centimeter:    { label: 'Centimeter (cm)',    toBase: 0.01 },
                millimeter:    { label: 'Millimeter (mm)',    toBase: 0.001 },
                mile:          { label: 'Mile (mi)',          toBase: 1609.344 },
                yard:          { label: 'Yard (yd)',          toBase: 0.9144 },
                foot:          { label: 'Foot (ft)',          toBase: 0.3048 },
                inch:          { label: 'Inch (in)',          toBase: 0.0254 },
                nautical_mile: { label: 'Nautical Mile',      toBase: 1852 },
            },
            defaultFrom: 'meter', defaultTo: 'foot',
        },
        weight: {
            label: 'Weight',
            units: {
                kilogram:  { label: 'Kilogram (kg)',    toBase: 1 },
                gram:      { label: 'Gram (g)',          toBase: 0.001 },
                milligram: { label: 'Milligram (mg)',    toBase: 0.000001 },
                pound:     { label: 'Pound (lb)',        toBase: 0.453592 },
                ounce:     { label: 'Ounce (oz)',        toBase: 0.0283495 },
                ton:       { label: 'Metric Ton (t)',    toBase: 1000 },
                stone:     { label: 'Stone (st)',        toBase: 6.35029 },
            },
            defaultFrom: 'kilogram', defaultTo: 'pound',
        },
        temperature: {
            label: 'Temperature',
            units: {
                celsius:    { label: 'Celsius (°C)' },
                fahrenheit: { label: 'Fahrenheit (°F)' },
                kelvin:     { label: 'Kelvin (K)' },
            },
            defaultFrom: 'celsius', defaultTo: 'fahrenheit',
        },
        volume: {
            label: 'Volume',
            units: {
                liter:       { label: 'Liter (L)',          toBase: 1 },
                milliliter:  { label: 'Milliliter (mL)',    toBase: 0.001 },
                cubic_meter: { label: 'Cubic Meter (m³)',   toBase: 1000 },
                gallon_us:   { label: 'Gallon (US)',        toBase: 3.78541 },
                gallon_uk:   { label: 'Gallon (UK)',        toBase: 4.54609 },
                quart:       { label: 'Quart (US)',         toBase: 0.946353 },
                pint:        { label: 'Pint (US)',          toBase: 0.473176 },
                cup:         { label: 'Cup (US)',           toBase: 0.236588 },
                fluid_oz:    { label: 'Fluid Oz (US)',      toBase: 0.0295735 },
                tablespoon:  { label: 'Tablespoon',         toBase: 0.0147868 },
                teaspoon:    { label: 'Teaspoon',           toBase: 0.00492892 },
            },
            defaultFrom: 'liter', defaultTo: 'gallon_us',
        },
        area: {
            label: 'Area',
            units: {
                sqmeter:      { label: 'Square Meter (m²)',  toBase: 1 },
                sqkilometer:  { label: 'Square Km (km²)',    toBase: 1000000 },
                sqcentimeter: { label: 'Square Cm (cm²)',    toBase: 0.0001 },
                sqfoot:       { label: 'Square Foot (ft²)',  toBase: 0.092903 },
                sqinch:       { label: 'Square Inch (in²)',  toBase: 0.00064516 },
                sqyard:       { label: 'Square Yard (yd²)',  toBase: 0.836127 },
                squaremile:   { label: 'Square Mile (mi²)',  toBase: 2589988 },
                acre:         { label: 'Acre',               toBase: 4046.86 },
                hectare:      { label: 'Hectare (ha)',       toBase: 10000 },
            },
            defaultFrom: 'sqmeter', defaultTo: 'sqfoot',
        },
        speed: {
            label: 'Speed',
            units: {
                ms:   { label: 'Meter/second (m/s)',  toBase: 1 },
                kmh:  { label: 'Km/hour (km/h)',      toBase: 0.277778 },
                mph:  { label: 'Mile/hour (mph)',     toBase: 0.44704 },
                knot: { label: 'Knot (kn)',           toBase: 0.514444 },
                fts:  { label: 'Foot/second (ft/s)', toBase: 0.3048 },
                mach: { label: 'Mach',               toBase: 343 },
            },
            defaultFrom: 'kmh', defaultTo: 'mph',
        },
    };

    function convertValue(catKey, fromKey, toKey, value) {
        var num = parseFloat(value);
        if (isNaN(num)) return null;
        if (catKey === 'temperature') {
            var c;
            if (fromKey === 'celsius')         c = num;
            else if (fromKey === 'fahrenheit') c = (num - 32) * 5 / 9;
            else                               c = num - 273.15;
            if (toKey === 'celsius')    return c;
            if (toKey === 'fahrenheit') return c * 9 / 5 + 32;
            return c + 273.15;
        }
        var units = CATEGORIES[catKey].units;
        var base  = num * (units[fromKey].toBase || 1);
        return base / (units[toKey].toBase || 1);
    }

    function fmtResult(val, dp) {
        if (val === null || isNaN(val)) return '—';
        if (Math.abs(val) < 1e-10 && val !== 0) return val.toExponential(4);
        return parseFloat(val.toFixed(dp)).toLocaleString('en-US', { maximumFractionDigits: dp });
    }

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) {}

        var enabled  = opts.enabledCategories && opts.enabledCategories.length ? opts.enabledCategories : Object.keys(CATEGORIES);
        var activeCat = (opts.defaultCategory && CATEGORIES[opts.defaultCategory]) ? opts.defaultCategory : enabled[0] || 'length';
        var fromKey, toKey;
        var inputValue = '1';
        var dp         = parseInt(opts.decimalPlaces) || 4;

        /* -- colors -- */
        var accent     = opts.accentColor   || '#6c3fb5';
        var tabActBg   = opts.tabActiveBg   || accent;
        var tabActCol  = opts.tabActiveColor|| '#ffffff';
        var tabInBg    = opts.tabInactiveBg || '#f3f4f6';
        var tabInCol   = opts.tabInactiveColor || '#374151';
        var cardBg     = opts.cardBg        || '#ffffff';
        var resultBg   = opts.resultBg      || '#f5f3ff';
        var resultBdr  = opts.resultBorder  || '#ede9fe';
        var resultCol  = opts.resultColor   || accent;
        var labelColor = opts.labelColor    || '#374151';
        var titleColor = opts.titleColor    || '#1e1b4b';
        var subColor   = opts.subtitleColor || '#6b7280';
        var radius     = (opts.cardRadius   || 16) + 'px';
        var btnR       = '8px';
        var maxW       = (opts.maxWidth     || 640) + 'px';
        var ptop       = (opts.paddingTop   || 60) + 'px';
        var pbot       = (opts.paddingBottom|| 60) + 'px';
        var resSize    = (opts.resultSize   || 40) + 'px';\n\n        /* -- build card -- */
        app.innerHTML = '';
        var card = document.createElement('div');
        card.className = 'bkbg-uc-card';
        card.style.cssText = 'background:' + cardBg + ';border-radius:' + radius + ';padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:' + maxW + ';margin:0 auto;padding-top:' + ptop + ';padding-bottom:' + pbot + ';box-sizing:border-box;';
        app.appendChild(card);

        /* title */
        if (opts.showTitle !== false && opts.title) {
            var titleEl = document.createElement('h2');
            titleEl.className = 'bkbg-uc-title';
            titleEl.textContent = opts.title;
            titleEl.style.color = titleColor;
            card.appendChild(titleEl);
        }
        if (opts.showSubtitle !== false && opts.subtitle) {
            var subEl = document.createElement('p');
            subEl.className = 'bkbg-uc-subtitle';
            subEl.textContent = opts.subtitle;
            subEl.style.color = subColor;
            card.appendChild(subEl);
        }

        /* tabs */
        var tabsEl = null;
        if (opts.showCategoryTabs !== false && enabled.length > 1) {
            tabsEl = document.createElement('div');
            tabsEl.className = 'bkbg-uc-tabs';
            card.appendChild(tabsEl);
        }

        /* from/to row */
        var row = document.createElement('div');
        row.className = 'bkbg-uc-row';
        card.appendChild(row);

        var fromWrap = document.createElement('div');
        var swapWrap = document.createElement('div');
        swapWrap.className = 'bkbg-uc-swap-wrap';
        var toWrap   = document.createElement('div');
        row.appendChild(fromWrap);
        row.appendChild(swapWrap);
        row.appendChild(toWrap);

        var lblFrom = document.createElement('label'); lblFrom.textContent = 'From'; lblFrom.className = 'bkbg-uc-label'; lblFrom.style.color = labelColor;
        var selFrom = document.createElement('select'); selFrom.className = 'bkbg-uc-select'; selFrom.style.accentColor = accent;
        fromWrap.appendChild(lblFrom); fromWrap.appendChild(selFrom);

        if (opts.showSwapButton !== false) {
            var swapBtn = document.createElement('button');
            swapBtn.className = 'bkbg-uc-swap';
            swapBtn.textContent = '⇄';
            swapBtn.style.cssText = 'color:' + accent + ';border-color:' + accent + ';';
            swapWrap.appendChild(swapBtn);
        }

        var lblTo   = document.createElement('label'); lblTo.textContent = 'To'; lblTo.className = 'bkbg-uc-label'; lblTo.style.color = labelColor;
        var selTo   = document.createElement('select'); selTo.className = 'bkbg-uc-select'; selTo.style.accentColor = accent;
        toWrap.appendChild(lblTo); toWrap.appendChild(selTo);

        /* value input */
        var valWrap = document.createElement('div'); valWrap.className = 'bkbg-uc-value-wrap';
        var valLabel = document.createElement('label'); valLabel.textContent = 'Value'; valLabel.className = 'bkbg-uc-label'; valLabel.style.color = labelColor;
        var valInp  = document.createElement('input'); valInp.type = 'number'; valInp.className = 'bkbg-uc-value'; valInp.value = inputValue; valInp.style.accentColor = accent;
        valWrap.appendChild(valLabel); valWrap.appendChild(valInp);
        card.appendChild(valWrap);

        /* result */
        var resBox  = document.createElement('div'); resBox.className = 'bkbg-uc-result';
        resBox.style.cssText = 'background:' + resultBg + ';border:1.5px solid ' + resultBdr + ';border-radius:' + radius + ';';
        var resFrom = document.createElement('div'); resFrom.className = 'bkbg-uc-result-from';
        var resNum  = document.createElement('div'); resNum.className = 'bkbg-uc-result-num'; resNum.style.cssText = 'font-size:' + resSize + ';color:' + resultCol + ';';
        var resUnit = document.createElement('div'); resUnit.className = 'bkbg-uc-result-unit';
        resBox.appendChild(resFrom); resBox.appendChild(resNum); resBox.appendChild(resUnit);
        card.appendChild(resBox);

        /* -- helpers -- */
        function populateSelects() {
            var cat  = CATEGORIES[activeCat];
            var keys = Object.keys(cat.units);
            var opts2 = keys.map(function(k) { return { value: k, label: cat.units[k].label }; });

            function fill(sel, current, defaultKey) {
                sel.innerHTML = '';
                opts2.forEach(function(o) {
                    var opt = document.createElement('option');
                    opt.value = o.value;
                    opt.textContent = o.label;
                    sel.appendChild(opt);
                });
                sel.value = current || defaultKey;
            }
            fill(selFrom, fromKey, cat.defaultFrom);
            fill(selTo,   toKey,   cat.defaultTo);
            fromKey = selFrom.value;
            toKey   = selTo.value;
        }

        function updateResult() {
            var cat   = CATEGORIES[activeCat];
            var fromL = cat.units[fromKey] ? cat.units[fromKey].label : fromKey;
            var toL   = cat.units[toKey]   ? cat.units[toKey].label   : toKey;
            var res   = convertValue(activeCat, fromKey, toKey, valInp.value);
            resFrom.textContent = fromL + ' → ' + toL;
            resNum.textContent  = fmtResult(res, dp);
            resUnit.textContent = toL;
        }

        function buildTabs() {
            if (!tabsEl) return;
            tabsEl.innerHTML = '';
            enabled.forEach(function(k) {
                if (!CATEGORIES[k]) return;
                var btn = document.createElement('button');
                btn.className = 'bkbg-uc-tab' + (k === activeCat ? ' active' : '');
                btn.textContent = CATEGORIES[k].label;
                btn.dataset.cat = k;
                btn.style.background = k === activeCat ? tabActBg : tabInBg;
                btn.style.color      = k === activeCat ? tabActCol : tabInCol;
                tabsEl.appendChild(btn);
            });
        }

        function init() {
            buildTabs();
            populateSelects();
            updateResult();
        }
        init();

        /* -- events -- */
        if (tabsEl) {
            tabsEl.addEventListener('click', function(e) {
                var btn = e.target.closest('.bkbg-uc-tab');
                if (!btn) return;
                activeCat = btn.dataset.cat;
                fromKey = null; toKey = null;
                tabsEl.querySelectorAll('.bkbg-uc-tab').forEach(function(b) {
                    var active = b.dataset.cat === activeCat;
                    b.classList.toggle('active', active);
                    b.style.background = active ? tabActBg : tabInBg;
                    b.style.color      = active ? tabActCol : tabInCol;
                });
                populateSelects();
                updateResult();
            });
        }

        selFrom.addEventListener('change', function() { fromKey = selFrom.value; updateResult(); });
        selTo.addEventListener('change',   function() { toKey   = selTo.value;   updateResult(); });
        valInp.addEventListener('input',   function() { updateResult(); });

        if (swapWrap.querySelector('.bkbg-uc-swap')) {
            swapWrap.querySelector('.bkbg-uc-swap').addEventListener('click', function() {
                var tmp = selFrom.value;
                selFrom.value = selTo.value;
                selTo.value   = tmp;
                fromKey = selFrom.value;
                toKey   = selTo.value;
                updateResult();
            });
        }
    }

    document.querySelectorAll('.bkbg-uc-app').forEach(buildApp);
})();
