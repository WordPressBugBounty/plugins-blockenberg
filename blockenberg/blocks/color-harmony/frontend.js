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

    var HARMONIES = {
        complementary:       'Complementary',
        triadic:             'Triadic',
        analogous:           'Analogous',
        splitComplementary:  'Split-Complementary',
        tetradic:            'Tetradic',
        square:              'Square'
    };

    /* ---- Color math ---- */
    function hexToHsl(hex) {
        hex = hex.replace('#','');
        if (hex.length === 3) hex = hex.split('').map(function(c){return c+c;}).join('');
        var r = parseInt(hex.slice(0,2),16)/255;
        var g = parseInt(hex.slice(2,4),16)/255;
        var b = parseInt(hex.slice(4,6),16)/255;
        var max = Math.max(r,g,b), min = Math.min(r,g,b);
        var h, s, l = (max+min)/2;
        if (max === min) { h = s = 0; }
        else {
            var d = max-min;
            s = l > 0.5 ? d/(2-max-min) : d/(max+min);
            switch(max){
                case r: h=((g-b)/d+(g<b?6:0))/6; break;
                case g: h=((b-r)/d+2)/6; break;
                default: h=((r-g)/d+4)/6; break;
            }
        }
        return { h:h*360, s:s*100, l:l*100 };
    }

    function hslToHex(h, s, l) {
        h = ((h%360)+360)%360;
        s /= 100; l /= 100;
        var a = s*Math.min(l, 1-l);
        function f(n) {
            var k=(n+h/30)%12;
            var c=l-a*Math.max(-1,Math.min(k-3,9-k,1));
            return Math.round(255*c).toString(16).padStart(2,'0');
        }
        return '#'+f(0)+f(8)+f(4);
    }

    function hexToRgb(hex) {
        hex = hex.replace('#','');
        if (hex.length === 3) hex = hex.split('').map(function(c){return c+c;}).join('');
        return {
            r: parseInt(hex.slice(0,2),16),
            g: parseInt(hex.slice(2,4),16),
            b: parseInt(hex.slice(4,6),16)
        };
    }

    function getHarmony(baseHex, type) {
        var hsl = hexToHsl(baseHex);
        var h=hsl.h, s=hsl.s, l=hsl.l;
        var res = [baseHex];
        switch(type){
            case 'complementary':      res.push(hslToHex(h+180,s,l)); break;
            case 'triadic':            res.push(hslToHex(h+120,s,l), hslToHex(h+240,s,l)); break;
            case 'analogous':          res.push(hslToHex(h-30,s,l), hslToHex(h+30,s,l), hslToHex(h-60,s,l), hslToHex(h+60,s,l)); break;
            case 'splitComplementary': res.push(hslToHex(h+150,s,l), hslToHex(h+210,s,l)); break;
            case 'tetradic':           res.push(hslToHex(h+90,s,l), hslToHex(h+180,s,l), hslToHex(h+270,s,l)); break;
            case 'square':             res.push(hslToHex(h+90,s,l), hslToHex(h+180,s,l), hslToHex(h+270,s,l)); break;
            default:                   res.push(hslToHex(h+180,s,l)); break;
        }
        return res;
    }

    function copyText(str) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(str);
        }
        var ta = document.createElement('textarea');
        ta.value = str;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        return Promise.resolve();
    }

    function initBlock(root) {
        var opts = {};
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); } catch(e) {}

        var accentColor = opts.accentColor || '#6366f1';
        var sectionBg   = opts.sectionBg   || '#f8fafc';
        var cardBg      = opts.cardBg      || '#ffffff';
        var titleColor  = opts.titleColor  || '#1e1b4b';
        var swatchSize  = parseInt(opts.swatchSize || 80, 10);
        var showHex     = opts.showHex    !== false;
        var showRgb     = opts.showRgb    === true;
        var showExport  = opts.showExport !== false;
        var fontSize    = opts.fontSize   || 28;
        var subtitleSize= opts.subtitleSize || 14;

        root.style.background   = sectionBg;
        root.style.borderRadius = '16px';
        root.style.padding      = '28px 20px';
        root.style.textAlign    = 'center';

        typoCssVarsForEl(root, opts.typoTitle, '--bkbg-coh-tt-');
        typoCssVarsForEl(root, opts.typoSubtitle, '--bkbg-coh-st-');

        // Style title/subtitle
        var titleEl = root.querySelector('.bkbg-coh-title');
        var subEl   = root.querySelector('.bkbg-coh-subtitle');
        if (titleEl) { titleEl.style.color = titleColor; titleEl.style.margin='0 0 4px'; }
        if (subEl)   { subEl.style.color = titleColor+'bb'; subEl.style.margin='0 0 20px'; }

        // State
        var currentColor   = opts.defaultColor   || '#6366f1';
        var currentHarmony = opts.defaultHarmony || 'complementary';

        var inner = document.createElement('div');
        root.appendChild(inner);

        function render() {
            inner.innerHTML = '';

            // Harmony tabs
            var tabs = document.createElement('div');
            tabs.className = 'bkbg-coh-tabs';
            Object.keys(HARMONIES).forEach(function(k) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-coh-tab';
                btn.textContent = HARMONIES[k];
                btn.style.borderColor = accentColor;
                var active = k === currentHarmony;
                btn.style.background = active ? accentColor : 'transparent';
                btn.style.color      = active ? '#fff' : accentColor;
                btn.addEventListener('click', function() { currentHarmony = k; render(); });
                tabs.appendChild(btn);
            });
            inner.appendChild(tabs);

            // Color picker row
            var pickerRow = document.createElement('div');
            pickerRow.className = 'bkbg-coh-picker-row';

            var previewCircle = document.createElement('div');
            previewCircle.className = 'bkbg-coh-picker-preview';
            previewCircle.style.background   = currentColor;
            previewCircle.style.borderColor  = accentColor;
            previewCircle.title = 'Click to pick a color';

            var colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.className = 'bkbg-coh-picker-input';
            colorInput.value = currentColor;
            colorInput.addEventListener('input', function() {
                currentColor = colorInput.value;
                previewCircle.style.background = currentColor;
                hexLbl.textContent = currentColor.toUpperCase();
                renderSwatches();
            });
            previewCircle.appendChild(colorInput);

            var hexLbl = document.createElement('div');
            hexLbl.className = 'bkbg-coh-hex-label';
            hexLbl.style.color = titleColor;
            hexLbl.textContent = currentColor.toUpperCase();

            pickerRow.appendChild(previewCircle);
            pickerRow.appendChild(hexLbl);
            inner.appendChild(pickerRow);

            // Card with swatches
            var card = document.createElement('div');
            card.className = 'bkbg-coh-card';
            card.style.background = cardBg;
            card.id = 'bkbg-coh-swatches-' + (root.id || Math.random().toString(36).slice(2));

            var swatchRow = document.createElement('div');
            swatchRow.className = 'bkbg-coh-swatches';
            card.appendChild(swatchRow);
            inner.appendChild(card);

            function renderSwatches() {
                swatchRow.innerHTML = '';
                var colors = getHarmony(currentColor, currentHarmony);
                colors.forEach(function(hex, i) {
                    var item = document.createElement('div');
                    item.className = 'bkbg-coh-swatch-item';
                    item.title = 'Click to copy ' + hex.toUpperCase();

                    var box = document.createElement('div');
                    box.className = 'bkbg-coh-swatch-box';
                    box.style.width  = swatchSize + 'px';
                    box.style.height = swatchSize + 'px';
                    box.style.background = hex;
                    box.style.position = 'relative';

                    var copiedLbl = document.createElement('div');
                    copiedLbl.className = 'bkbg-coh-copied';
                    copiedLbl.textContent = 'Copied!';
                    box.appendChild(copiedLbl);
                    item.appendChild(box);

                    if (showHex) {
                        var hexEl = document.createElement('div');
                        hexEl.className = 'bkbg-coh-swatch-hex';
                        hexEl.textContent = hex.toUpperCase();
                        item.appendChild(hexEl);
                    }

                    if (showRgb) {
                        var rgb = hexToRgb(hex);
                        var rgbEl = document.createElement('div');
                        rgbEl.className = 'bkbg-coh-swatch-rgb';
                        rgbEl.textContent = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
                        item.appendChild(rgbEl);
                    }

                    if (i === 0) {
                        var baseLbl = document.createElement('div');
                        baseLbl.className = 'bkbg-coh-swatch-base-lbl';
                        baseLbl.textContent = 'Base';
                        item.appendChild(baseLbl);
                    }

                    item.addEventListener('click', function() {
                        copyText(hex.toUpperCase()).then(function() {
                            copiedLbl.classList.add('show');
                            setTimeout(function() { copiedLbl.classList.remove('show'); }, 1200);
                        });
                    });

                    swatchRow.appendChild(item);
                });
            }

            renderSwatches();

            // Export button
            if (showExport) {
                var actions = document.createElement('div');
                actions.className = 'bkbg-coh-actions';

                var expBtn = document.createElement('button');
                expBtn.className = 'bkbg-coh-btn';
                expBtn.style.background = accentColor;
                expBtn.textContent = '📋 Export Palette';
                expBtn.addEventListener('click', function() {
                    var colors = getHarmony(currentColor, currentHarmony);
                    copyText(colors.map(function(c){return c.toUpperCase();}).join(', ')).then(function() {
                        var orig = expBtn.textContent;
                        expBtn.textContent = '✅ Copied!';
                        setTimeout(function() { expBtn.textContent = orig; }, 1500);
                    });
                });
                actions.appendChild(expBtn);

                var cssBtn = document.createElement('button');
                cssBtn.className = 'bkbg-coh-btn bkbg-coh-btn-outline';
                cssBtn.style.borderColor = accentColor;
                cssBtn.style.color       = accentColor;
                cssBtn.textContent = 'Copy as CSS vars';
                cssBtn.addEventListener('click', function() {
                    var colors = getHarmony(currentColor, currentHarmony);
                    var cssStr = ':root {\n' + colors.map(function(c, i) {
                        return '  --color-' + (i===0?'base':'harmony-'+i) + ': ' + c.toUpperCase() + ';';
                    }).join('\n') + '\n}';
                    copyText(cssStr).then(function() {
                        var orig = cssBtn.textContent;
                        cssBtn.textContent = '✅ Copied!';
                        setTimeout(function() { cssBtn.textContent = orig; }, 1500);
                    });
                });
                actions.appendChild(cssBtn);

                inner.appendChild(actions);
            }
        }

        render();
    }

    function init() {
        document.querySelectorAll('.bkbg-coh-app').forEach(function(root) {
            initBlock(root);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
