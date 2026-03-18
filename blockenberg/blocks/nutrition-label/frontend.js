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

    var DV = {
        totalFat: 78, saturatedFat: 20, cholesterol: 300,
        sodium: 2300, totalCarbs: 275, dietaryFiber: 28,
        addedSugars: 50, protein: 50,
        vitaminD: 20, calcium: 1300, iron: 18, potassium: 4700
    };

    function dvPct(val, key) {
        if (!DV[key] || !val) return null;
        return Math.round((val / DV[key]) * 100);
    }

    function esc(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function row(label, val, unit, key, bold, indent) {
        var dv = key ? dvPct(val, key) : null;
        var indentClass = indent === 2 ? ' bkbg-nl-indent2' : indent ? ' bkbg-nl-indent' : '';
        return '<div class="bkbg-nl-row' + (bold ? ' bkbg-nl-bold' : '') + indentClass + '">' +
            '<span class="bkbg-nl-nutrient">' +
            '<' + (bold ? 'strong' : 'span') + '>' + esc(label) + '</' + (bold ? 'strong' : 'span') + '> ' +
            esc(val) + esc(unit) +
            '</span>' +
            (dv !== null ? '<span class="bkbg-nl-dv"><strong>' + dv + '%</strong></span>' : '') +
            '</div>';
    }

    function buildApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) { return; }
        var o = opts;

        var containerStyle = [
            'padding-top:' + (o.paddingTop || 40) + 'px',
            'padding-bottom:' + (o.paddingBottom || 40) + 'px',
            o.containerBg ? 'background:' + o.containerBg : '',
            'display:flex',
            'justify-content:center'
        ].filter(Boolean).join(';');

        var labelStyle = [
            'font-family:Arial,Helvetica,sans-serif',
            'font-size:' + (o.fontSize || 14) + 'px',
            'background:' + (o.bgColor || '#fff'),
            'color:' + (o.accentColor || '#000'),
            'border:' + (o.borderWidth || 3) + 'px solid ' + (o.borderColor || '#000'),
            'border-radius:' + (o.borderRadius || 0) + 'px',
            'width:' + (o.labelWidth || 340) + 'px',
            'max-width:100%',
            'padding:8px 8px 4px',
            'box-sizing:border-box'
        ].join(';');

        var fs = o.fontSize || 14;
        var bc = o.borderColor || '#000';

        var html = '<div style="' + containerStyle + '"><div class="bkbg-nl-label" style="' + labelStyle + '">';

        /* header */
        html += '<div class="bkbg-nl-header">';
        html += '<div class="bkbg-nl-title">Nutrition Facts</div>';
        if (o.foodName) html += '<div style="font-size:' + (fs * 0.9) + 'px;margin-top:2px;">' + esc(o.foodName) + '</div>';
        html += '<div style="border-top:4px solid ' + bc + ';border-bottom:4px solid ' + bc + ';padding:2px 0;margin:4px 0;font-size:' + (fs * 0.85) + 'px">';
        html += '<div>' + esc(o.servingsPerContainer || '2') + ' servings per container</div>';
        html += '<div style="display:flex;justify-content:space-between;font-weight:700"><span>Serving size</span><span>' + esc(o.servingSize || '1 cup') + '</span></div>';
        html += '</div></div>';

        /* calories */
        html += '<div style="border-bottom:8px solid ' + bc + ';padding-bottom:4px">';
        html += '<div style="font-size:' + (fs * 0.75) + 'px;font-weight:700">Amount per serving</div>';
        html += '<div style="display:flex;justify-content:space-between;align-items:flex-end">';
        html += '<div style="font-size:' + (fs * 1.1) + 'px;font-weight:700">Calories</div>';
        html += '<div style="font-size:' + (fs * 2.8) + 'px;font-weight:900;line-height:1;color:' + (o.calorieColor || '#000') + '">' + esc(o.calories) + '</div>';
        html += '</div></div>';

        /* %DV header */
        html += '<div style="text-align:right;font-size:' + (fs * 0.75) + 'px;border-bottom:1px solid ' + bc + ';padding-bottom:2px"><strong>% Daily Value*</strong></div>';

        /* fats */
        html += row('Total Fat', o.totalFat, 'g', 'totalFat', true, false);
        html += row('Saturated Fat', o.saturatedFat, 'g', 'saturatedFat', false, true);
        html += '<div class="bkbg-nl-row bkbg-nl-indent"><span class="bkbg-nl-nutrient"><em>Trans</em> Fat ' + esc(o.transFat) + 'g</span></div>';
        if (o.showPolyMono) {
            html += row('Polyunsaturated Fat', o.polyFat, 'g', null, false, true);
            html += row('Monounsaturated Fat', o.monoFat, 'g', null, false, true);
        }

        /* cholesterol / sodium */
        html += row('Cholesterol', o.cholesterol, 'mg', 'cholesterol', true, false);
        html += row('Sodium', o.sodium, 'mg', 'sodium', true, false);

        /* carbs */
        html += row('Total Carbohydrate', o.totalCarbs, 'g', 'totalCarbs', true, false);
        html += row('Dietary Fiber', o.dietaryFiber, 'g', 'dietaryFiber', false, true);
        html += '<div class="bkbg-nl-row bkbg-nl-indent"><span class="bkbg-nl-nutrient">Total Sugars ' + esc(o.totalSugars) + 'g</span></div>';
        if (o.showAddedSugars !== false) {
            var addedDv = dvPct(o.addedSugars, 'addedSugars');
            html += '<div class="bkbg-nl-row bkbg-nl-indent2"><span class="bkbg-nl-nutrient">Includes ' + esc(o.addedSugars) + 'g Added Sugars</span>';
            if (addedDv !== null) html += '<span class="bkbg-nl-dv" style="color:' + (o.dvColor || '#000') + '"><strong>' + addedDv + '%</strong></span>';
            html += '</div>';
        }

        /* protein */
        html += '<div class="bkbg-nl-row" style="border-top:4px solid ' + bc + '"><span class="bkbg-nl-nutrient"><strong>Protein </strong>' + esc(o.protein) + 'g</span></div>';

        /* vitamins */
        if (o.showVitamins !== false) {
            html += '<div style="border-top:8px solid ' + bc + '"></div>';
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 8px;padding:4px 0;font-size:' + (fs * 0.85) + 'px">';
            html += '<span>Vitamin D ' + esc(o.vitaminD) + 'mcg</span><span>' + (dvPct(o.vitaminD, 'vitaminD') || 0) + '%</span>';
            html += '<span>Calcium ' + esc(o.calcium) + 'mg</span><span>' + (dvPct(o.calcium, 'calcium') || 0) + '%</span>';
            html += '<span>Iron ' + esc(o.iron) + 'mg</span><span>' + (dvPct(o.iron, 'iron') || 0) + '%</span>';
            html += '<span>Potassium ' + esc(o.potassium) + 'mg</span><span>' + (dvPct(o.potassium, 'potassium') || 0) + '%</span>';
            html += '</div>';
        }

        /* footnote */
        if (o.showFootnote !== false) {
            html += '<div class="bkbg-nl-footnote" style="border-top:4px solid ' + bc + ';font-size:' + (fs * 0.72) + 'px;padding-top:4px">';
            html += '* The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. ' + esc(o.dvRef || '2000') + ' calories a day is used for general nutrition advice.';
            html += '</div>';
        }

        html += '</div></div>';

        app.innerHTML = html;

        /* Typography CSS vars — set on outer container so they cascade */
        var wrap = app.querySelector('.bkbg-nl-label') || app;
        typoCssVarsForEl(wrap, o.titleTypo, '--bkbg-nutl-tt-');
    }

    document.querySelectorAll('.bkbg-nl-app').forEach(buildApp);
})();
