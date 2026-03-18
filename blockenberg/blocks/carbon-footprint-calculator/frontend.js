(function () {
    'use strict';

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

    // Emission factors (kg CO2e per unit)
    var EF = {
        // Car: kg CO2e per km (by fuel)
        car: { petrol: 0.192, diesel: 0.171, hybrid: 0.110, electric: 0.063, lpg: 0.161 },
        // Flights: kg CO2e per flight
        shortFlight: 255,  // <3hr
        longFlight:  1620, // >6hr
        // Electricity: kg CO2e per kWh (global average)
        electricity: 0.475,
        // Gas: kg CO2e per m3 (~2.04) or per therm (5.3)
        gasM3: 2.04,
        gasTherm: 5.31,
        // Diet: kg CO2e per year
        diet: { heavy: 3300, medium: 2500, vegetarian: 1700, vegan: 1100 },
        // Shopping: kg CO2e per year
        shopping: { high: 4000, average: 2500, low: 1500, minimal: 700 }
    };

    // World / US / EU averages (tCO2e/yr)
    var WORLD_AVG = 4.7;
    var US_AVG = 15.9;
    var EU_AVG = 6.8;

    var TIPS = {
        transport: [
            { icon: '🚲', text: 'Switch to cycling or walking for short trips (< 5 km).' },
            { icon: '🚌', text: 'Use public transport 2–3 days/week instead of driving.' },
            { icon: '⚡', text: 'Consider switching to an electric vehicle.' }
        ],
        energy: [
            { icon: '💡', text: 'Switch to a renewable electricity tariff.' },
            { icon: '🌡️', text: 'Lower your thermostat by 1 °C — saves ~10% on heating.' },
            { icon: '🔋', text: 'Install solar panels to cut grid electricity use.' }
        ],
        diet: [
            { icon: '🥦', text: 'Replace one meat meal per day with a plant-based option.' },
            { icon: '🛒', text: 'Reduce food waste — wasted food accounts for ~8% of emissions.' }
        ],
        shopping: [
            { icon: '♻️', text: 'Buy second-hand and repair items before replacing.' },
            { icon: '📦', text: 'Avoid fast fashion — choose quality over quantity.' }
        ]
    };

    function initApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) { return; }

        var accent      = opts.accentColor     || '#16a34a';
        var tColor      = opts.transportColor  || '#3b82f6';
        var eColor      = opts.energyColor     || '#f59e0b';
        var dColor      = opts.dietColor       || '#ec4899';
        var sColor      = opts.shoppingColor   || '#8b5cf6';
        var goodC       = opts.goodColor       || '#16a34a';
        var avgC        = opts.avgColor        || '#f59e0b';
        var badC        = opts.badColor        || '#ef4444';
        var cardR       = (opts.cardRadius     || 16) + 'px';
        var inpR        = (opts.inputRadius    || 8)  + 'px';
        var maxW        = (opts.maxWidth       || 640) + 'px';
        var lblClr      = opts.labelColor      || '#374151';
        var inpBdr      = opts.inputBorder     || '#d1d5db';
        var unit        = opts.defaultUnit     || 'metric';

        app.style.paddingTop    = (opts.paddingTop    || 60) + 'px';
        app.style.paddingBottom = (opts.paddingBottom || 60) + 'px';
        if (opts.sectionBg) app.style.background = opts.sectionBg;

        var card = document.createElement('div');
        card.className = 'bkbg-cfc-card';
        Object.assign(card.style, { background: opts.cardBg || '#fff', borderRadius: cardR, maxWidth: maxW });
        app.appendChild(card);
        typoCssVarsForEl(opts.typoTitle, '--bkbg-cfc-tt-', card);
        typoCssVarsForEl(opts.typoSub, '--bkbg-cfc-ts-', card);

        if (opts.showTitle && opts.title) {
            var ttl = document.createElement('div'); ttl.className = 'bkbg-cfc-title';
            ttl.textContent = opts.title; if (opts.titleColor) ttl.style.color = opts.titleColor;
            card.appendChild(ttl);
        }
        if (opts.showSubtitle && opts.subtitle) {
            var sub = document.createElement('div'); sub.className = 'bkbg-cfc-subtitle';
            sub.textContent = opts.subtitle; if (opts.subtitleColor) sub.style.color = opts.subtitleColor;
            card.appendChild(sub);
        }

        // Unit toggle
        var unitToggle = document.createElement('div'); unitToggle.className = 'bkbg-cfc-unit-toggle'; card.appendChild(unitToggle);
        var uBtns = {};
        [{ id: 'metric', label: 'Metric (km, m³)' }, { id: 'imperial', label: 'Imperial (mi, therms)' }].forEach(function (u) {
            var b = document.createElement('button'); b.className = 'bkbg-cfc-unit-btn'; b.textContent = u.label;
            b.addEventListener('click', function () { unit = u.id; refreshUnitBtns(); updateUnitLabels(); });
            uBtns[u.id] = b; unitToggle.appendChild(b);
        });
        function refreshUnitBtns() {
            Object.keys(uBtns).forEach(function (k) {
                var b = uBtns[k]; var active = k === unit;
                b.style.background = active ? accent : 'transparent';
                b.style.color = active ? '#fff' : '#6b7280';
            });
        }
        refreshUnitBtns();

        // Category grid
        var catGrid = document.createElement('div'); catGrid.className = 'bkbg-cfc-cat-grid'; card.appendChild(catGrid);

        function mkInp(labelText, val, min, max, step, onChange) {
            var wrap = document.createElement('div');
            var l = document.createElement('label'); l.className = 'bkbg-cfc-lbl'; l.textContent = labelText; l.style.color = lblClr;
            var inp = document.createElement('input'); inp.type = 'number'; inp.className = 'bkbg-cfc-input';
            inp.value = val; inp.min = min; inp.max = max; inp.step = step || 1;
            inp.style.borderRadius = inpR; inp.style.borderColor = inpBdr;
            inp.addEventListener('input', function () { onChange(parseFloat(inp.value) || 0); });
            wrap.appendChild(l); wrap.appendChild(inp);
            return { el: wrap, input: inp };
        }

        function mkSel(labelText, options, val, onChange) {
            var wrap = document.createElement('div');
            var l = document.createElement('label'); l.className = 'bkbg-cfc-lbl'; l.textContent = labelText; l.style.color = lblClr;
            var sel = document.createElement('select'); sel.className = 'bkbg-cfc-select';
            sel.style.borderRadius = inpR; sel.style.borderColor = inpBdr;
            options.forEach(function (o) {
                var opt = document.createElement('option'); opt.value = o.id; opt.textContent = o.label;
                if (o.id === val) opt.selected = true; sel.appendChild(opt);
            });
            sel.addEventListener('change', function () { onChange(sel.value); });
            wrap.appendChild(l); wrap.appendChild(sel);
            return { el: wrap, select: sel };
        }

        function mkPanel(icon, label, color, children) {
            var p = document.createElement('div'); p.className = 'bkbg-cfc-panel';
            p.style.background = color + '10'; p.style.border = '2px solid ' + color + '44';
            var header = document.createElement('div'); header.className = 'bkbg-cfc-panel-header';
            var ico = document.createElement('span'); ico.className = 'bkbg-cfc-panel-icon'; ico.textContent = icon;
            var ttl = document.createElement('span'); ttl.className = 'bkbg-cfc-panel-title'; ttl.style.color = color; ttl.textContent = label;
            header.appendChild(ico); header.appendChild(ttl); p.appendChild(header);
            children.forEach(function (c) { c && p.appendChild(c.el || c); });
            catGrid.appendChild(p);
            return p;
        }

        // State
        var state = {
            kmPerWeek: 200, carFuel: 'petrol',
            shortFlights: 2, longFlights: 1,
            electricityKwh: 350,
            gasMeter: 60,
            diet: 'medium',
            shopping: 'average'
        };

        // Transport panel
        var kmInp    = mkInp('Distance by car / week', state.kmPerWeek, 0, 5000, 10, function(v){ state.kmPerWeek=v; });
        var kmLblRef = kmInp.input; // for unit update
        var fuelSel  = mkSel('Fuel type',
            [{id:'petrol',label:'Petrol/Gasoline'},{id:'diesel',label:'Diesel'},{id:'hybrid',label:'Hybrid'},{id:'electric',label:'Electric'},{id:'lpg',label:'LPG'}],
            state.carFuel, function(v){ state.carFuel=v; });
        var srtInp   = mkInp('Short-haul flights / year (< 3 hr)', state.shortFlights, 0, 100, 1, function(v){ state.shortFlights=v; });
        var lngInp   = mkInp('Long-haul flights / year (> 6 hr)',  state.longFlights,  0, 100, 1, function(v){ state.longFlights=v; });
        mkPanel('🚗', 'Transport', tColor, [kmInp, fuelSel, srtInp, lngInp]);

        // Energy panel
        var elecInp  = mkInp('Electricity (kWh / month)', state.electricityKwh, 0, 5000, 10, function(v){ state.electricityKwh=v; });
        var gasInp   = mkInp('Gas (m³ / month)', state.gasMeter, 0, 2000, 5, function(v){ state.gasMeter=v; });
        var gasLblRef = gasInp.input;
        mkPanel('🏠', 'Home Energy', eColor, [elecInp, gasInp]);

        // Diet panel
        var dietSel  = mkSel('Meat & dairy consumption',
            [{id:'heavy',label:'Heavy (meat daily)'},{id:'medium',label:'Medium (meat few times/week)'},{id:'vegetarian',label:'Vegetarian'},{id:'vegan',label:'Vegan'}],
            state.diet, function(v){ state.diet=v; });
        mkPanel('🥩', 'Diet', dColor, [dietSel]);

        // Shopping panel
        var shopSel  = mkSel('Shopping & consumption',
            [{id:'high',label:'High (frequent new purchases)'},{id:'average',label:'Average'},{id:'low',label:'Low (mindful consumer)'},{id:'minimal',label:'Minimal (secondhand/repair)'}],
            state.shopping, function(v){ state.shopping=v; });
        mkPanel('🛍', 'Shopping', sColor, [shopSel]);

        // Update unit labels
        function updateUnitLabels() {
            var lbl1 = catGrid.querySelectorAll('.bkbg-cfc-lbl')[0];
            if (lbl1) lbl1.textContent = unit === 'metric' ? 'Distance by car / week (km)' : 'Distance by car / week (miles)';
            var gasLbl = gasInp.input.previousElementSibling;
            if (gasLbl) gasLbl.textContent = unit === 'metric' ? 'Gas (m³ / month)' : 'Gas (therms / month)';
        }
        updateUnitLabels();

        // Calculate button
        var calcBtn = document.createElement('button'); calcBtn.className = 'bkbg-cfc-calc-btn';
        calcBtn.textContent = 'Calculate My Footprint'; calcBtn.style.background = accent;
        card.appendChild(calcBtn);

        // Result area
        var resultArea = document.createElement('div'); card.appendChild(resultArea);

        calcBtn.addEventListener('click', function () {
            var km = unit === 'metric' ? state.kmPerWeek : state.kmPerWeek * 1.60934;
            var carYear = km * 52 * EF.car[state.carFuel] / 1000;  // tonnes
            var flightYear = (state.shortFlights * EF.shortFlight + state.longFlights * EF.longFlight) / 1000;
            var transport = carYear + flightYear;

            var elecYear = state.electricityKwh * 12 * EF.electricity / 1000;
            var gasFactor = unit === 'metric' ? EF.gasM3 : EF.gasTherm;
            var gasYear = state.gasMeter * 12 * gasFactor / 1000;
            var energy = elecYear + gasYear;

            var diet = EF.diet[state.diet] / 1000;
            var shopping = EF.shopping[state.shopping] / 1000;

            var total = transport + energy + diet + shopping;

            renderResult(total, { transport: transport, energy: energy, diet: diet, shopping: shopping });
        });

        function ratingFor(t) {
            if (t < 4) return { label: 'Low Impact 🌿', color: goodC };
            if (t < 8) return { label: 'Average', color: avgC };
            return { label: 'High Impact 🔴', color: badC };
        }

        function renderResult(total, cats) {
            resultArea.innerHTML = '';

            var rating = ratingFor(total);
            var resBg  = rating.color + '14';
            var resBdr = rating.color + '44';

            // Result box
            var res = document.createElement('div'); res.className = 'bkbg-cfc-result';
            res.style.background = resBg; res.style.border = '2px solid ' + resBdr;
            var rl = document.createElement('div'); rl.className = 'bkbg-cfc-result-label'; rl.style.color = rating.color; rl.textContent = 'Total Annual Carbon Footprint';
            var rv = document.createElement('div'); rv.className = 'bkbg-cfc-result-val'; rv.style.color = rating.color; rv.textContent = total.toFixed(2) + ' tCO₂e';
            var rs = document.createElement('div'); rs.className = 'bkbg-cfc-result-sub'; rs.textContent = 'tonnes of CO₂ equivalent per year';
            var badge = document.createElement('span'); badge.className = 'bkbg-cfc-result-badge'; badge.style.background = rating.color; badge.textContent = rating.label;
            res.appendChild(rl); res.appendChild(rv); res.appendChild(rs); res.appendChild(badge);
            resultArea.appendChild(res);

            // Breakdown bars
            var breakdown = document.createElement('div'); breakdown.className = 'bkbg-cfc-breakdown';
            var bt = document.createElement('div'); bt.className = 'bkbg-cfc-breakdown-title'; bt.textContent = 'Emissions Breakdown'; breakdown.appendChild(bt);
            [
                { label: '🚗 Transport',    val: cats.transport, color: tColor },
                { label: '🏠 Home Energy',  val: cats.energy,    color: eColor },
                { label: '🥩 Diet',         val: cats.diet,      color: dColor },
                { label: '🛍 Shopping',     val: cats.shopping,  color: sColor }
            ].forEach(function (c) {
                var pct = total > 0 ? Math.max(3, (c.val / total) * 100) : 0;
                var row = document.createElement('div'); row.className = 'bkbg-cfc-cat-bar-row';
                var hdr = document.createElement('div'); hdr.className = 'bkbg-cfc-cat-bar-header';
                var nl = document.createElement('span'); nl.textContent = c.label; nl.style.color = c.color;
                var vl = document.createElement('span'); vl.textContent = c.val.toFixed(2) + ' t';
                hdr.appendChild(nl); hdr.appendChild(vl);
                var track = document.createElement('div'); track.className = 'bkbg-cfc-cat-bar-track';
                var fill = document.createElement('div'); fill.className = 'bkbg-cfc-cat-bar-fill';
                fill.style.width = pct + '%'; fill.style.background = c.color;
                track.appendChild(fill); row.appendChild(hdr); row.appendChild(track); breakdown.appendChild(row);
            });
            resultArea.appendChild(breakdown);

            // Comparison
            if (opts.showComparison !== false) {
                var cmp = document.createElement('div'); cmp.className = 'bkbg-cfc-comparison';
                var ct = document.createElement('div'); ct.className = 'bkbg-cfc-comparison-title'; ct.textContent = '🌍 How do you compare?'; cmp.appendChild(ct);
                [
                    { label: 'Your footprint', val: total, color: rating.color },
                    { label: 'World average', val: WORLD_AVG, color: '#6b7280' },
                    { label: 'EU average', val: EU_AVG, color: '#6b7280' },
                    { label: 'US average', val: US_AVG, color: '#6b7280' }
                ].forEach(function (row) {
                    var r = document.createElement('div'); r.className = 'bkbg-cfc-cmp-row';
                    var l = document.createElement('span'); l.textContent = row.label;
                    var v = document.createElement('span'); v.className = 'bkbg-cfc-cmp-val'; v.style.color = row.color; v.textContent = row.val.toFixed(1) + ' tCO₂e';
                    r.appendChild(l); r.appendChild(v); cmp.appendChild(r);
                });
                var diff = total - WORLD_AVG;
                var tip = document.createElement('div');
                tip.style.cssText = 'margin-top:10px;font-size:13px;color:#6b7280;';
                tip.textContent = diff > 0
                    ? 'You emit ' + diff.toFixed(1) + ' t more than the world average.'
                    : 'You emit ' + Math.abs(diff).toFixed(1) + ' t less than the world average — keep it up! 🎉';
                cmp.appendChild(tip); resultArea.appendChild(cmp);
            }

            // Tips
            if (opts.showTips !== false) {
                var biggestCat = [
                    { key: 'transport', val: cats.transport },
                    { key: 'energy',    val: cats.energy },
                    { key: 'diet',      val: cats.diet },
                    { key: 'shopping',  val: cats.shopping }
                ].sort(function (a, b) { return b.val - a.val; })[0].key;

                var tc = { transport: tColor, energy: eColor, diet: dColor, shopping: sColor }[biggestCat];
                var tipsBox = document.createElement('div'); tipsBox.className = 'bkbg-cfc-tips';
                tipsBox.style.background = tc + '10'; tipsBox.style.border = '2px solid ' + tc + '44';
                var tpTtl = document.createElement('div'); tpTtl.className = 'bkbg-cfc-tips-title';
                tpTtl.style.color = tc;
                tpTtl.textContent = '💡 Top Reduction Tips';
                tipsBox.appendChild(tpTtl);
                (TIPS[biggestCat] || []).forEach(function (tip) {
                    var tipRow = document.createElement('div'); tipRow.className = 'bkbg-cfc-tip';
                    var ico = document.createElement('span'); ico.className = 'bkbg-cfc-tip-icon'; ico.textContent = tip.icon;
                    var txt = document.createElement('span'); txt.textContent = tip.text;
                    tipRow.appendChild(ico); tipRow.appendChild(txt); tipsBox.appendChild(tipRow);
                });
                resultArea.appendChild(tipsBox);
            }
        }
    }

    document.querySelectorAll('.bkbg-cfc-app').forEach(initApp);
})();
