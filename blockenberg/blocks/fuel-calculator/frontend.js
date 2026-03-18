(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family: 'font-family', weight: 'font-weight', style: 'font-style',
            decoration: 'text-decoration', transform: 'text-transform',
            sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
            lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
            letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m',
            wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m'
        };
        Object.keys(map).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) {
                    v = v + (typo.sizeUnit || 'px');
                } else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) {
                    v = v + (typo.lineHeightUnit || '');
                } else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) {
                    v = v + (typo.letterSpacingUnit || 'px');
                } else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) {
                    v = v + (typo.wordSpacingUnit || 'px');
                }
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    var UNITS = {
        mpg:    { distLabel: 'Distance', effLabel: 'Fuel Economy', priceLabel: 'Fuel Price', volUnit: 'gal', effUnit: 'mpg', distUnit: 'mi' },
        lper100:{ distLabel: 'Distance', effLabel: 'Fuel Economy', priceLabel: 'Fuel Price', volUnit: 'L',   effUnit: 'L/100km', distUnit: 'km' },
        kmpl:   { distLabel: 'Distance', effLabel: 'Fuel Economy', priceLabel: 'Fuel Price', volUnit: 'L',   effUnit: 'km/L', distUnit: 'km' }
    };

    function calcFuel(dist, eff, price, unit) {
        if (unit === 'mpg') {
            var gallons = eff > 0 ? dist / eff : 0;
            return { cost: gallons * price, litres: gallons * 3.78541, gallons: gallons };
        } else if (unit === 'lper100') {
            var l = eff > 0 ? (dist / 100) * eff : 0;
            return { cost: l * price, litres: l, gallons: l / 3.78541 };
        } else {
            var l2 = eff > 0 ? dist / eff : 0;
            return { cost: l2 * price, litres: l2, gallons: l2 / 3.78541 };
        }
    }

    function co2Kg(litres) { return litres * 2.31; }

    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function buildApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) { return; }
        var o = opts;
        var accent = o.accentColor || '#6c3fb5';
        var cur = o.currency || '$';

        app.style.paddingTop    = (o.paddingTop || 60) + 'px';
        app.style.paddingBottom = (o.paddingBottom || 60) + 'px';
        if (o.sectionBg) app.style.background = o.sectionBg;

        typoCssVarsForEl(o.typoTitle, '--bkbg-fuel-tt-', app);
        typoCssVarsForEl(o.typoSubtitle, '--bkbg-fuel-st-', app);
        typoCssVarsForEl(o.typoResult, '--bkbg-fuel-rs-', app);

        var maxW = (o.maxWidth || 620) + 'px';

        /* Header */
        if (o.showTitle || o.showSubtitle) {
            var hdr = document.createElement('div');
            hdr.style.cssText = 'text-align:center;margin-bottom:32px;max-width:' + maxW + ';margin-left:auto;margin-right:auto';
            if (o.showTitle && o.title) {
                var ht = document.createElement('h3');
                ht.className = 'bkbg-fuel-title';
                ht.textContent = o.title;
                ht.style.cssText = 'color:' + (o.titleColor || '#1e1b4b') + ';margin:0 0 8px';
                hdr.appendChild(ht);
            }
            if (o.showSubtitle && o.subtitle) {
                var hs = document.createElement('p');
                hs.className = 'bkbg-fuel-subtitle';
                hs.textContent = o.subtitle;
                hs.style.cssText = 'color:' + (o.subtitleColor || '#6b7280') + ';margin:0';
                hdr.appendChild(hs);
            }
            app.appendChild(hdr);
        }

        /* Card */
        var card = document.createElement('div');
        card.style.cssText = 'background:' + (o.cardBg || '#fff') + ';border-radius:' + (o.cardRadius || 16) + 'px;padding:32px;max-width:' + maxW + ';margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,0.06)';
        app.appendChild(card);

        /* State */
        var unitKey = o.unit || 'mpg';
        var dist    = o.defaultDist || 300;
        var eff     = o.defaultEff  || 30;
        var price   = o.defaultPrice || 3.50;
        var pax     = o.defaultPassengers || 2;

        /* Unit toggle */
        var unitRow = document.createElement('div');
        unitRow.style.cssText = 'display:flex;gap:8px;margin-bottom:24px';
        var unitBtns = {};
        ['mpg','lper100','kmpl'].forEach(function (k) {
            var btn = document.createElement('button');
            btn.textContent = k === 'lper100' ? 'L/100km' : k.toUpperCase();
            btn.className = 'bkbg-fuel-unit-btn';
            btn.style.cssText = 'flex:1;padding:8px;border:none;border-radius:' + (o.inputRadius || 8) + 'px;font-weight:600;font-size:13px;cursor:pointer;transition:background 0.15s';
            btn.addEventListener('click', function () { unitKey = k; refreshUnitBtns(); buildInputSection(); update(); });
            unitBtns[k] = btn;
            unitRow.appendChild(btn);
        });
        card.appendChild(unitRow);

        function refreshUnitBtns() {
            Object.keys(unitBtns).forEach(function (k) {
                unitBtns[k].style.background = k === unitKey ? accent : (o.statCardBg || '#f9fafb');
                unitBtns[k].style.color      = k === unitKey ? '#fff' : (o.labelColor || '#374151');
            });
        }
        refreshUnitBtns();

        /* Input section */
        var inputSection = document.createElement('div');
        card.appendChild(inputSection);

        var distInput, effInput, priceInput, paxInput;

        function makeRow(labelText, suffix) {
            var row = document.createElement('div');
            row.className = 'bkbg-fuel-input-row';
            var lbl = document.createElement('label');
            lbl.textContent = labelText;
            lbl.style.color = o.labelColor || '#374151';
            var right = document.createElement('div');
            right.style.cssText = 'display:flex;align-items:center;gap:6px';
            var inp = document.createElement('input');
            inp.type = 'number'; inp.min = '0'; inp.step = '0.01';
            inp.style.cssText = 'width:90px;text-align:right;border:1px solid #d1d5db;border-radius:' + (o.inputRadius || 8) + 'px;padding:5px 8px;font-size:14px;box-sizing:border-box';
            var sfx = document.createElement('span');
            sfx.textContent = suffix;
            sfx.style.cssText = 'color:' + (o.subtitleColor || '#6b7280') + ';font-size:13px;min-width:56px';
            right.appendChild(inp);
            right.appendChild(sfx);
            row.appendChild(lbl);
            row.appendChild(right);
            return { row: row, input: inp, suffix: sfx };
        }

        function buildInputSection() {
            inputSection.innerHTML = '';
            var u = UNITS[unitKey];
            var dr = makeRow(u.distLabel + ' (' + u.distUnit + ')', u.distUnit);
            dr.input.value = dist;
            dr.input.addEventListener('input', function () { dist = parseFloat(dr.input.value) || 0; update(); });
            distInput = dr.input;

            var er = makeRow(u.effLabel, u.effUnit);
            er.input.value = eff;
            er.input.addEventListener('input', function () { eff = parseFloat(er.input.value) || 0; update(); });
            effInput = er.input;

            var pr = makeRow(u.priceLabel + ' (' + cur + '/' + u.volUnit + ')', cur + '/' + u.volUnit);
            pr.input.value = price;
            pr.input.step = '0.01';
            pr.input.addEventListener('input', function () { price = parseFloat(pr.input.value) || 0; update(); });
            priceInput = pr.input;

            if (o.showPerPerson !== false) {
                var par = makeRow('Passengers', 'people');
                par.input.value = pax;
                par.input.min = '1';
                par.input.step = '1';
                par.input.addEventListener('input', function () { pax = parseInt(par.input.value) || 1; update(); });
                paxInput = par.input;
                inputSection.appendChild(dr.row);
                inputSection.appendChild(er.row);
                inputSection.appendChild(pr.row);
                inputSection.appendChild(par.row);
            } else {
                inputSection.appendChild(dr.row);
                inputSection.appendChild(er.row);
                inputSection.appendChild(pr.row);
            }
        }
        buildInputSection();

        /* Result area */
        var resultArea = document.createElement('div');
        resultArea.style.cssText = 'background:' + (o.resultBg || '#f5f3ff') + ';border:2px solid ' + (o.resultBorder || '#ede9fe') + ';border-radius:' + (o.cardRadius || 16) + 'px;padding:24px;text-align:center;margin:24px 0';
        card.appendChild(resultArea);

        /* Stat cards */
        var statRow = document.createElement('div');
        statRow.className = 'bkbg-fuel-stat-cards';
        card.appendChild(statRow);

        function update() {
            var res = calcFuel(dist, eff, price, unitKey);
            var totalCost = res.cost;
            var perPerson = pax > 0 ? totalCost / pax : totalCost;
            var co2 = co2Kg(res.litres);

            resultArea.innerHTML =
                '<div style="font-size:13px;color:' + (o.subtitleColor || '#6b7280') + ';margin-bottom:4px">Total Fuel Cost</div>' +
                '<div class="bkbg-fuel-result-value" style="color:' + (o.totalColor || accent) + '">' + esc(cur + totalCost.toFixed(2)) + '</div>' +
                (o.showRoundTrip !== false ? '<div style="font-size:12px;color:' + (o.subtitleColor || '#6b7280') + ';margin-top:6px">one way · ' + esc(cur + (totalCost * 2).toFixed(2)) + ' round trip</div>' : '');

            statRow.innerHTML = '';
            var stats = [];
            if (o.showLitres !== false) stats.push({ val: res.litres.toFixed(1) + 'L / ' + res.gallons.toFixed(1) + 'gal', lbl: 'Fuel Used', color: o.labelColor || '#374151' });
            if (o.showPerPerson !== false) stats.push({ val: cur + perPerson.toFixed(2), lbl: 'Per Person', color: accent });
            if (o.showCO2 !== false) stats.push({ val: co2.toFixed(1) + ' kg', lbl: 'CO₂ Emitted', color: o.co2Color || '#10b981' });

            stats.forEach(function (st) {
                var sc = document.createElement('div');
                sc.className = 'bkbg-fuel-stat-card';
                sc.style.cssText = 'background:' + (o.statCardBg || '#f9fafb') + ';border-radius:12px;padding:16px;text-align:center;flex:1;min-width:100px';
                sc.innerHTML = '<div class="bkbg-fuel-stat-val" style="color:' + st.color + '">' + esc(st.val) + '</div><div class="bkbg-fuel-stat-lbl" style="color:' + (o.subtitleColor || '#6b7280') + '">' + esc(st.lbl) + '</div>';
                statRow.appendChild(sc);
            });
        }

        update();
    }

    document.querySelectorAll('.bkbg-fuel-app').forEach(buildApp);
})();
