(function () {
    'use strict';

    /* ── Typography CSS-var helper ── */
    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        transform:'text-transform', decoration:'text-decoration',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    var _typoUnits = { size:'sizeUnit', lineHeight:'lineHeightUnit', letterSpacing:'letterSpacingUnit', wordSpacing:'wordSpacingUnit' };
    var _typoUnitDefaults = { size:'px', lineHeight:'', letterSpacing:'px', wordSpacing:'px' };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var prop = _typoKeys[k];
            var base = k.replace(/Desktop|Tablet|Mobile/, '');
            var uKey = _typoUnits[base];
            if (uKey && typeof v === 'number') v = v + (obj[uKey] || _typoUnitDefaults[base] || '');
            el.style.setProperty(prefix + prop, v);
        });
    }

    /* ---- Color utilities ---- */
    function hexToRgb(hex) {
        var c = (hex || '#000000').replace('#', '');
        return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
    }

    function rgbToHex(r, g, b) {
        function h(x) { return Math.round(Math.min(255, Math.max(0, x))).toString(16).padStart(2,'0'); }
        return '#' + h(r) + h(g) + h(b);
    }

    function mixColors(hexA, hexB, t) {
        var a = hexToRgb(hexA), bv = hexToRgb(hexB);
        return rgbToHex(a[0]+(bv[0]-a[0])*t, a[1]+(bv[1]-a[1])*t, a[2]+(bv[2]-a[2])*t);
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        var max = Math.max(r,g,b), min = Math.min(r,g,b);
        var h, s, l = (max+min)/2;
        if (max === min) { h = s = 0; }
        else {
            var d = max - min;
            s = l > 0.5 ? d/(2-max-min) : d/(max+min);
            switch(max) {
                case r: h = (g-b)/d + (g<b?6:0); break;
                case g: h = (b-r)/d + 2; break;
                default: h = (r-g)/d + 4;
            }
            h /= 6;
        }
        return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
    }

    function hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        var r, g, b;
        if (s === 0) { r = g = b = l; }
        else {
            function hue2rgb(p, q, t) {
                if (t<0) t+=1; if (t>1) t-=1;
                if (t<1/6) return p+(q-p)*6*t;
                if (t<1/2) return q;
                if (t<2/3) return p+(q-p)*(2/3-t)*6;
                return p;
            }
            var q = l<0.5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
            r = hue2rgb(p,q,h+1/3); g = hue2rgb(p,q,h); b = hue2rgb(p,q,h-1/3);
        }
        return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
    }

    function hslHex(h, s, l) {
        var rgb = hslToRgb(h, s, l);
        return rgbToHex(rgb[0], rgb[1], rgb[2]);
    }

    function hexToHsl(hex) {
        var rgb = hexToRgb(hex);
        return rgbToHsl(rgb[0], rgb[1], rgb[2]);
    }

    function luminance(hex) {
        var rgb = hexToRgb(hex);
        return 0.299*rgb[0] + 0.587*rgb[1] + 0.114*rgb[2];
    }
    function textOn(hex) { return luminance(hex) > 140 ? '#111827' : '#f9fafb'; }

    function getHarmonies(hex) {
        var hsl = hexToHsl(hex);
        var h = hsl[0], s = hsl[1], l = hsl[2];
        return {
            complementary: [hslHex((h+180)%360, s, l)],
            analogous: [hslHex((h+30)%360, s, l), hslHex((h+330)%360, s, l)],
            triadic: [hslHex((h+120)%360, s, l), hslHex((h+240)%360, s, l)],
            split: [hslHex((h+150)%360, s, l), hslHex((h+210)%360, s, l)]
        };
    }

    function copyText(text, el) {
        navigator.clipboard && navigator.clipboard.writeText(text).catch(function () {
            var t = document.createElement('textarea');
            t.value = text; document.body.appendChild(t); t.select();
            document.execCommand('copy'); document.body.removeChild(t);
        });
        var orig = el.querySelector('.bkbg-cm-format-val');
        if (orig) { var ov = orig.textContent; orig.textContent = 'Copied!'; setTimeout(function(){ orig.textContent = ov; }, 1500); }
    }

    function formatRgb(hex) {
        var c = hexToRgb(hex);
        return 'rgb(' + c[0] + ', ' + c[1] + ', ' + c[2] + ')';
    }

    function formatHsl(hex) {
        var c = hexToHsl(hex);
        return 'hsl(' + c[0] + ', ' + c[1] + '%, ' + c[2] + '%)';
    }

    function initBlock(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }

        var a = opts;
        var colorA = a.colorA || '#6366f1';
        var colorB = a.colorB || '#ec4899';
        var ratio = (parseInt(a.defaultRatio) || 50) / 100;

        root.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-cm-wrap';
        wrap.style.cssText = 'background:' + a.sectionBg + ';max-width:' + a.contentMaxWidth + 'px;margin:0 auto;';
        root.appendChild(wrap);

        typoCssVarsForEl(wrap, a.typoTitle, '--bkbg-cm-tt-');
        typoCssVarsForEl(wrap, a.typoSubtitle, '--bkbg-cm-st-');

        if (a.showTitle) {
            var h = document.createElement('div');
            h.className = 'bkbg-cm-title';
            h.style.color = a.titleColor;
            h.textContent = a.title;
            wrap.appendChild(h);
        }

        if (a.showSubtitle) {
            var s = document.createElement('div');
            s.className = 'bkbg-cm-subtitle';
            s.style.color = a.subtitleColor;
            s.textContent = a.subtitle;
            wrap.appendChild(s);
        }

        /* -- Pickers card -- */
        var pickCard = document.createElement('div');
        pickCard.className = 'bkbg-cm-card';
        pickCard.style.background = a.cardBg;
        var pickersRow = document.createElement('div');
        pickersRow.className = 'bkbg-cm-pickers';
        pickCard.appendChild(pickersRow);
        wrap.appendChild(pickCard);

        function makePickerCol(colorRef, label, onChange) {
            var col = document.createElement('div');
            col.className = 'bkbg-cm-picker-col';

            var swatchWrap = document.createElement('div');
            swatchWrap.className = 'bkbg-cm-swatch';
            swatchWrap.style.background = colorRef;

            var colorInp = document.createElement('input');
            colorInp.type = 'color';
            colorInp.value = colorRef;
            colorInp.addEventListener('input', function () {
                swatchWrap.style.background = colorInp.value;
                hexDisplay.textContent = colorInp.value.toUpperCase();
                onChange(colorInp.value);
                renderAll();
            });
            swatchWrap.appendChild(colorInp);
            col.appendChild(swatchWrap);

            var hexDisplay = document.createElement('code');
            hexDisplay.style.cssText = 'font-size:13px;color:' + a.labelColor + ';';
            hexDisplay.textContent = colorRef.toUpperCase();
            col.appendChild(hexDisplay);

            var lbl = document.createElement('div');
            lbl.className = 'bkbg-cm-swatch-label';
            lbl.style.color = a.subtitleColor;
            lbl.textContent = label;
            col.appendChild(lbl);

            return col;
        }

        var colA = makePickerCol(colorA, 'Color A', function (v) { colorA = v; });
        var plusDiv = document.createElement('div');
        plusDiv.className = 'bkbg-cm-plus';
        plusDiv.style.color = a.labelColor;
        plusDiv.textContent = '+';
        var colB = makePickerCol(colorB, 'Color B', function (v) { colorB = v; });
        [colA, plusDiv, colB].forEach(function (el) { pickersRow.appendChild(el); });

        /* -- Mix card -- */
        var mixCard = document.createElement('div');
        mixCard.className = 'bkbg-cm-card';
        mixCard.style.background = a.cardBg;
        wrap.appendChild(mixCard);

        var ratioRow = document.createElement('div');
        ratioRow.className = 'bkbg-cm-ratio-row';
        var ratioLabelA = document.createElement('span');
        ratioLabelA.style.color = a.labelColor;
        var ratioTitle = document.createElement('span');
        ratioTitle.style.cssText = 'font-weight:600;color:' + a.labelColor + ';';
        ratioTitle.textContent = 'Mix Ratio';
        var ratioLabelB = document.createElement('span');
        ratioLabelB.style.color = a.labelColor;
        [ratioLabelA, ratioTitle, ratioLabelB].forEach(function (el) { ratioRow.appendChild(el); });
        mixCard.appendChild(ratioRow);

        var slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0; slider.max = 100; slider.value = Math.round(ratio * 100);
        slider.className = 'bkbg-cm-slider';
        slider.addEventListener('input', function () {
            ratio = parseInt(slider.value) / 100;
            renderAll();
        });
        mixCard.appendChild(slider);

        var resultSwatch = document.createElement('div');
        resultSwatch.className = 'bkbg-cm-result-swatch';
        mixCard.appendChild(resultSwatch);

        /* Formats */
        var formatsEl = null, copiedHint = null;
        if (a.showFormats) {
            formatsEl = document.createElement('div');
            formatsEl.className = 'bkbg-cm-formats';
            mixCard.appendChild(formatsEl);

            copiedHint = document.createElement('div');
            copiedHint.className = 'bkbg-cm-copied-hint';
            copiedHint.style.color = a.accentColor;
            copiedHint.textContent = 'Copied!';
            mixCard.appendChild(copiedHint);
        }

        /* Gradient */
        var gradientEl = null;
        if (a.showGradient) {
            var gradCard = document.createElement('div');
            gradCard.className = 'bkbg-cm-card';
            gradCard.style.background = a.cardBg;
            var gradTitle = document.createElement('div');
            gradTitle.style.cssText = 'font-size:13px;font-weight:600;color:' + a.labelColor + ';margin-bottom:8px;';
            gradTitle.textContent = 'Gradient (A → B)';
            gradCard.appendChild(gradTitle);
            gradientEl = document.createElement('div');
            gradientEl.className = 'bkbg-cm-gradient-bar';
            gradCard.appendChild(gradientEl);
            wrap.appendChild(gradCard);
        }

        /* Harmonies */
        var harmoniesEl = null;
        if (a.showHarmonies) {
            var harmCard = document.createElement('div');
            harmCard.className = 'bkbg-cm-card';
            harmCard.style.background = a.cardBg;
            var harmTitle = document.createElement('div');
            harmTitle.className = 'bkbg-cm-harmonies-title';
            harmTitle.style.color = a.labelColor;
            harmTitle.textContent = 'Color Harmonies (of mixed color)';
            harmCard.appendChild(harmTitle);
            harmoniesEl = document.createElement('div');
            harmCard.appendChild(harmoniesEl);
            wrap.appendChild(harmCard);
        }

        function makeFormatBox(val, lbl) {
            var box = document.createElement('div');
            box.className = 'bkbg-cm-format-box';
            box.title = 'Click to copy';
            var valEl = document.createElement('div');
            valEl.className = 'bkbg-cm-format-val';
            valEl.style.color = a.labelColor;
            valEl.textContent = val;
            var lblEl = document.createElement('div');
            lblEl.className = 'bkbg-cm-format-lbl';
            lblEl.textContent = lbl;
            box.appendChild(valEl);
            box.appendChild(lblEl);
            box.addEventListener('click', function () {
                navigator.clipboard && navigator.clipboard.writeText(val).catch(function () {
                    var t = document.createElement('textarea'); t.value = val;
                    document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t);
                });
                var orig = valEl.textContent;
                valEl.textContent = 'Copied!';
                if (copiedHint) { copiedHint.classList.add('bkbg-cm-show'); }
                setTimeout(function () {
                    valEl.textContent = orig;
                    if (copiedHint) copiedHint.classList.remove('bkbg-cm-show');
                }, 1500);
            });
            return box;
        }

        function makeHarmonyGroup(title, colors) {
            var group = document.createElement('div');
            group.className = 'bkbg-cm-harmony-group';
            var lbl = document.createElement('div');
            lbl.className = 'bkbg-cm-harmony-label';
            lbl.style.color = a.labelColor;
            lbl.textContent = title;
            group.appendChild(lbl);
            var swatches = document.createElement('div');
            swatches.className = 'bkbg-cm-harmony-swatches';
            colors.forEach(function (c) {
                var col = document.createElement('div');
                var sw = document.createElement('button');
                sw.className = 'bkbg-cm-harmony-swatch';
                sw.style.background = c;
                sw.title = c.toUpperCase() + ' – click to copy';
                sw.addEventListener('click', function () {
                    navigator.clipboard && navigator.clipboard.writeText(c.toUpperCase()).catch(function(){});
                    var orig = sw.style.transform; sw.style.transform = 'scale(0.9)';
                    setTimeout(function(){sw.style.transform = orig;},200);
                });
                var hx = document.createElement('div');
                hx.className = 'bkbg-cm-harmony-hex';
                hx.style.color = a.labelColor;
                hx.textContent = c.toUpperCase();
                col.appendChild(sw);
                col.appendChild(hx);
                swatches.appendChild(col);
            });
            group.appendChild(swatches);
            return group;
        }

        function renderAll() {
            var t = ratio;
            var mixed = mixColors(colorA, colorB, t);
            var aStr = Math.round((1-t)*100);
            var bStr = Math.round(t*100);

            ratioLabelA.textContent = 'A (' + aStr + '%)';
            ratioLabelB.textContent = 'B (' + bStr + '%)';

            // slider track gradient
            slider.style.background = 'linear-gradient(to right, ' + colorA + ' 0%, ' + mixed + ' ' + (t*100) + '%, ' + colorB + ' 100%)';
            slider.style.color = mixed;

            resultSwatch.style.background = mixed;
            resultSwatch.title = mixed.toUpperCase();

            if (formatsEl) {
                formatsEl.innerHTML = '';
                [
                    { val: mixed.toUpperCase(), lbl: 'HEX' },
                    { val: formatRgb(mixed), lbl: 'RGB' },
                    { val: formatHsl(mixed), lbl: 'HSL' }
                ].forEach(function (f) { formatsEl.appendChild(makeFormatBox(f.val, f.lbl)); });
            }

            if (gradientEl) {
                gradientEl.style.background = 'linear-gradient(to right, ' + colorA + ', ' + colorB + ')';
            }

            if (harmoniesEl) {
                harmoniesEl.innerHTML = '';
                var h = getHarmonies(mixed);
                [
                    { title: 'Complementary', colors: h.complementary },
                    { title: 'Analogous',     colors: h.analogous },
                    { title: 'Triadic',       colors: h.triadic },
                    { title: 'Split-Comp.',   colors: h.split }
                ].forEach(function (g) { harmoniesEl.appendChild(makeHarmonyGroup(g.title, g.colors)); });
            }
        }

        renderAll();
    }

    function init() {
        document.querySelectorAll('.bkbg-cm-app').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
