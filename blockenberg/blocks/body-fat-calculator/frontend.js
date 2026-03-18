(function () {
    'use strict';

    function calcBodyFat(gender, height, waist, neck, hip) {
        var h = parseFloat(height) || 0;
        var w = parseFloat(waist)  || 0;
        var n = parseFloat(neck)   || 0;
        var hi= parseFloat(hip)    || 0;
        if (h <= 0 || w <= 0 || n <= 0) return null;
        var bf;
        if (gender === 'male') {
            bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
        } else {
            if (hi <= 0) return null;
            bf = 495 / (1.29579 - 0.35004 * Math.log10(w + hi - n) + 0.22100 * Math.log10(h)) - 450;
        }
        return Math.max(0, Math.min(70, +bf.toFixed(1)));
    }

    function getCategory(bf, gender) {
        if (gender === 'male') {
            if (bf < 6)  return { label: 'Essential Fat', color: '#3b82f6' };
            if (bf < 14) return { label: 'Athletes',      color: '#10b981' };
            if (bf < 18) return { label: 'Fitness',       color: '#6c3fb5' };
            if (bf < 25) return { label: 'Average',       color: '#f59e0b' };
            return              { label: 'Obese',          color: '#ef4444' };
        } else {
            if (bf < 14) return { label: 'Essential Fat', color: '#3b82f6' };
            if (bf < 21) return { label: 'Athletes',      color: '#10b981' };
            if (bf < 25) return { label: 'Fitness',       color: '#6c3fb5' };
            if (bf < 32) return { label: 'Average',       color: '#f59e0b' };
            return              { label: 'Obese',          color: '#ef4444' };
        }
    }

    function maleRanges()   { return [[0,6,'Essential','#3b82f6'],[6,14,'Athletes','#10b981'],[14,18,'Fitness','#6c3fb5'],[18,25,'Average','#f59e0b'],[25,50,'Obese','#ef4444']]; }
    function femaleRanges() { return [[0,14,'Essential','#3b82f6'],[14,21,'Athletes','#10b981'],[21,25,'Fitness','#6c3fb5'],[25,32,'Average','#f59e0b'],[32,50,'Obese','#ef4444']]; }

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

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) {}
        var o       = opts;
        var accent  = o.accentColor   || '#6c3fb5';
        var labelC  = o.labelColor    || '#374151';
        var radius  = (o.cardRadius   || 16) + 'px';
        var inpRad  = (o.inputRadius  || 8)  + 'px';
        var resultBg= o.resultBg      || '#f5f3ff';
        var resultBr= o.resultBorder  || '#ede9fe';

        app.innerHTML = '';
        app.style.fontFamily = 'inherit';

        var section = document.createElement('div');
        section.style.cssText = 'padding-top:' + (o.paddingTop||60) + 'px;padding-bottom:' + (o.paddingBottom||60) + 'px;background:' + (o.sectionBg||'') + ';';
        app.appendChild(section);

        var card = document.createElement('div');
        card.style.cssText = 'background:' + (o.cardBg||'#fff') + ';border-radius:' + radius + ';padding:36px 32px;max-width:' + (o.maxWidth||560) + 'px;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,.09);box-sizing:border-box;';
        section.appendChild(card);

        // Title/subtitle
        if (o.showTitle || o.showSubtitle) {
            var hdr = document.createElement('div');
            hdr.style.marginBottom = '20px';
            if (o.showTitle) { var t=document.createElement('div'); t.className='bkbg-bfc-title'; t.textContent=o.title||'Body Fat Calculator'; t.style.cssText='color:'+(o.titleColor||'#1e1b4b')+';margin-bottom:6px;'; hdr.appendChild(t); }
            if (o.showSubtitle && o.subtitle) { var s=document.createElement('div'); s.textContent=o.subtitle; s.style.cssText='font-size:15px;color:'+(o.subtitleColor||'#6b7280')+';'; hdr.appendChild(s); }
            card.appendChild(hdr);
        }

        var gender = o.defaultGender || 'male';
        var unit   = o.defaultUnit   || 'metric';
        var unitLbl = unit === 'metric' ? 'cm' : 'in';

        // Helper: convert to cm
        function toCm(v) { return unit === 'imperial' ? v * 2.54 : v; }

        // Gender tabs
        var genderRow = document.createElement('div');
        genderRow.style.cssText = 'display:flex;gap:10px;margin-bottom:20px;';
        var gBtns = {};
        ['male','female'].forEach(function(g) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = g === 'male' ? '♂ Male' : '♀ Female';
            btn.style.cssText = 'flex:1;padding:9px 16px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;transition:all .15s;';
            btn.addEventListener('click', function() { gender = g; refreshGender(); update(); });
            gBtns[g] = btn;
            genderRow.appendChild(btn);
        });
        card.appendChild(genderRow);

        // Unit tabs
        var unitRow = document.createElement('div');
        unitRow.style.cssText = 'display:flex;gap:10px;margin-bottom:24px;';
        var uBtns = {};
        [['metric','Metric (cm)'],['imperial','Imperial (in)']].forEach(function(pair) {
            var btn = document.createElement('button');
            btn.type = 'button'; btn.textContent = pair[1];
            btn.style.cssText = 'flex:1;padding:9px 16px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;transition:all .15s;';
            btn.addEventListener('click', function() { unit = pair[0]; unitLbl = unit==='metric'?'cm':'in'; refreshUnit(); });
            uBtns[pair[0]] = btn;
            unitRow.appendChild(btn);
        });
        card.appendChild(unitRow);

        function styleTab(btn, active) {
            btn.style.border      = '2px solid ' + (active ? accent : '#e5e7eb');
            btn.style.background  = active ? accent : 'transparent';
            btn.style.color       = active ? '#fff' : accent;
        }
        function refreshGender() { ['male','female'].forEach(function(g){ styleTab(gBtns[g], g===gender); }); buildHipRow(); }
        function refreshUnit()   {
            ['metric','imperial'].forEach(function(u){ styleTab(uBtns[u], u===unit); });
            unitLbl = unit === 'metric' ? 'cm' : 'in';
            ['height','waist','neck','hip'].forEach(function(f) {
                var lEl = document.getElementById('bkbg-bfc-lbl-'+f);
                if (lEl) lEl.textContent = unitLbl;
            });
            update();
        }
        refreshGender(); refreshUnit();

        // Input grid
        var grid = document.createElement('div');
        grid.className = 'bkbg-bfc-input-grid';
        grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0 20px;margin-bottom:20px;';
        card.appendChild(grid);

        var inputs = {};
        var defaults = { metric: { height:170, waist:85, neck:37, hip:95 }, imperial: { height:67, waist:33, neck:15, hip:37 } };

        function makeInputRow(field, label, container) {
            var row = document.createElement('div');
            row.className = 'bkbg-bfc-input-row';
            row.setAttribute('data-field', field);
            row.style.marginBottom = '14px';
            var lbl = document.createElement('label');
            lbl.style.cssText = 'display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:'+labelC+';margin-bottom:5px;';
            var nm = document.createElement('span'); nm.textContent = label;
            var su = document.createElement('span'); su.id = 'bkbg-bfc-lbl-'+field; su.textContent = unitLbl; su.style.cssText = 'font-weight:400;color:#9ca3af;';
            lbl.appendChild(nm); lbl.appendChild(su);
            row.appendChild(lbl);
            var inp = document.createElement('input');
            inp.type = 'number'; inp.min = '0'; inp.step = '0.1';
            inp.value = (defaults[unit] || defaults.metric)[field];
            inp.style.cssText = 'width:100%;padding:9px 12px;border-radius:'+inpRad+';border:1.5px solid #e5e7eb;font-size:16px;outline:none;box-sizing:border-box;';
            inp.addEventListener('focus', function(){ inp.style.borderColor=accent; inp.style.boxShadow='0 0 0 3px rgba(108,63,181,.15)'; });
            inp.addEventListener('blur',  function(){ inp.style.borderColor='#e5e7eb'; inp.style.boxShadow=''; });
            inp.addEventListener('input', update);
            row.appendChild(inp);
            inputs[field] = inp;
            container.appendChild(row);
        }

        makeInputRow('height', 'Height', grid);
        makeInputRow('waist', 'Waist (at navel)', grid);
        makeInputRow('neck', 'Neck', grid);

        var hipRow;
        function buildHipRow() {
            if (gender === 'female') {
                if (!hipRow) {
                    hipRow = document.createElement('div');
                    hipRow.className = 'bkbg-bfc-input-row';
                    hipRow.style.marginBottom = '14px';
                    var lbl = document.createElement('label');
                    lbl.style.cssText = 'display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:'+labelC+';margin-bottom:5px;';
                    var nm = document.createElement('span'); nm.textContent = 'Hips';
                    var su = document.createElement('span'); su.id = 'bkbg-bfc-lbl-hip'; su.textContent = unitLbl; su.style.cssText = 'font-weight:400;color:#9ca3af;';
                    lbl.appendChild(nm); lbl.appendChild(su);
                    hipRow.appendChild(lbl);
                    var inp = document.createElement('input'); inp.type = 'number'; inp.min = '0'; inp.step = '0.1'; inp.value = (defaults[unit]||defaults.metric).hip;
                    inp.style.cssText = 'width:100%;padding:9px 12px;border-radius:'+inpRad+';border:1.5px solid #e5e7eb;font-size:16px;outline:none;box-sizing:border-box;';
                    inp.addEventListener('focus',function(){ inp.style.borderColor=accent; inp.style.boxShadow='0 0 0 3px rgba(108,63,181,.15)'; });
                    inp.addEventListener('blur', function(){ inp.style.borderColor='#e5e7eb'; inp.style.boxShadow=''; });
                    inp.addEventListener('input', update);
                    hipRow.appendChild(inp);
                    inputs.hip = inp;
                }
                grid.appendChild(hipRow);
            } else if (hipRow && hipRow.parentNode) {
                hipRow.parentNode.removeChild(hipRow);
            }
        }

        // Result
        var resultBox = document.createElement('div');
        resultBox.style.cssText = 'background:'+resultBg+';border:2px solid '+resultBr+';border-radius:'+radius+';padding:24px 28px;text-align:center;margin-bottom:16px;';
        card.appendChild(resultBox);

        // Category bar
        var catSection = document.createElement('div');
        if (o.showChart) card.appendChild(catSection);

        function update() {
            var h = toCm(parseFloat(inputs.height.value)||0);
            var w = toCm(parseFloat(inputs.waist.value)||0);
            var n = toCm(parseFloat(inputs.neck.value)||0);
            var hi= gender==='female' && inputs.hip ? toCm(parseFloat(inputs.hip.value)||0) : 0;
            var bf = calcBodyFat(gender, h, w, n, hi);
            var cat = bf !== null ? getCategory(bf, gender) : null;

            resultBox.innerHTML = '';
            if (bf !== null && cat) {
                var valEl = document.createElement('div'); valEl.className='bkbg-bfc-bf-value'; valEl.textContent = bf+'%'; valEl.style.cssText = 'color:'+cat.color+';';
                var catEl = document.createElement('div'); catEl.textContent = cat.label; catEl.style.cssText = 'margin-top:6px;font-weight:700;font-size:16px;color:'+cat.color+';';
                var lblEl = document.createElement('div'); lblEl.textContent = 'Body Fat Percentage'; lblEl.style.cssText = 'margin-top:4px;font-size:13px;color:'+labelC+';';
                resultBox.appendChild(valEl); resultBox.appendChild(catEl); resultBox.appendChild(lblEl);
            } else {
                var ph = document.createElement('div'); ph.textContent = 'Enter measurements above'; ph.style.cssText = 'color:'+labelC+';font-size:15px;';
                resultBox.appendChild(ph);
            }

            if (o.showChart) {
                catSection.innerHTML = '';
                var ranges = gender === 'male' ? maleRanges() : femaleRanges();
                var track = document.createElement('div'); track.style.cssText = 'display:flex;height:14px;border-radius:100px;overflow:hidden;margin-bottom:8px;';
                ranges.forEach(function(r) { var seg=document.createElement('div'); seg.style.cssText='flex:'+(r[1]-r[0])+';background:'+r[3]+';'; track.appendChild(seg); });
                catSection.appendChild(track);
                if (o.showCategories) {
                    var leg = document.createElement('div'); leg.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
                    ranges.forEach(function(r) {
                        var chip=document.createElement('span'); chip.textContent=r[2]+' ('+r[0]+(r[1]<50?'-'+r[1]:'+')+' %)'; chip.style.cssText='font-size:11px;font-weight:700;background:'+r[3]+'22;color:'+r[3]+';padding:2px 8px;border-radius:100px;';
                        leg.appendChild(chip);
                    });
                    catSection.appendChild(leg);
                }
            }
        }

        update();
        typoCssVarsForEl(o.typoTitle, '--bkbg-bfc-title-', app);
        typoCssVarsForEl(o.typoResult, '--bkbg-bfc-result-', app);
    }

    document.querySelectorAll('.bkbg-bfc-app').forEach(buildApp);
})();
