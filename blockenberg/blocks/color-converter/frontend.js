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

    function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

    function hexToRgb(hex) {
        hex = String(hex || '').replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(function(c){ return c+c; }).join('');
        if (hex.length !== 6 || /[^0-9a-fA-F]/.test(hex)) return null;
        return { r: parseInt(hex.slice(0,2),16), g: parseInt(hex.slice(2,4),16), b: parseInt(hex.slice(4,6),16) };
    }

    function rgbToHex(r,g,b) {
        return '#' + [r,g,b].map(function(x){ return clamp(Math.round(x),0,255).toString(16).padStart(2,'0'); }).join('');
    }

    function rgbToHsl(r,g,b) {
        r/=255; g/=255; b/=255;
        var max=Math.max(r,g,b), min=Math.min(r,g,b), l=(max+min)/2, h=0, s=0;
        if (max!==min) {
            var d=max-min;
            s = l>0.5 ? d/(2-max-min) : d/(max+min);
            switch(max) {
                case r: h=((g-b)/d + (g<b?6:0))/6; break;
                case g: h=((b-r)/d + 2)/6; break;
                default: h=((r-g)/d + 4)/6;
            }
        }
        return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
    }

    function hslToRgb(h,s,l) {
        s/=100; l/=100; h/=360;
        function hue2rgb(p,q,t){ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; }
        var r,g,b;
        if (s===0) { r=g=b=l; } else {
            var q2=l<0.5?l*(1+s):l+s-l*s, p2=2*l-q2;
            r=hue2rgb(p2,q2,h+1/3); g=hue2rgb(p2,q2,h); b=hue2rgb(p2,q2,h-1/3);
        }
        return { r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255) };
    }

    function initColorConverter(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) {}

        var cardBg       = opts.cardBg        || '#ffffff';
        var swatchBorder = opts.swatchBorder   || '#e5e7eb';
        var inputBorder  = opts.inputBorderColor || '#e5e7eb';
        var copyBg       = opts.copyBg        || '#f3f4f6';
        var copyColor    = opts.copyColor      || '#374151';
        var labelColor   = opts.labelColor     || '#374151';
        var titleColor   = opts.titleColor     || '#1f2937';
        var subtitleColor= opts.subtitleColor  || '#6b7280';
        var sectionBg    = opts.sectionBg      || '';
        var maxWidth     = opts.maxWidth       || 540;
        var cardRadius   = opts.cardRadius     || 16;
        var inputRadius  = opts.inputRadius    || 8;
        var titleSize    = opts.titleSize      || 28;
        var swatchHeight = opts.swatchHeight   || 120;
        var padTop       = opts.paddingTop     || 60;
        var padBot       = opts.paddingBottom  || 60;
        var showTitle    = opts.showTitle      !== false;
        var showSub      = opts.showSubtitle   !== false;
        var showSwatch   = opts.showSwatchLarge !== false;
        var showCopy     = opts.showCopyBtns   !== false;

        var currentHex = opts.defaultHex || '#6c3fb5';
        if (!hexToRgb(currentHex)) currentHex = '#6c3fb5';

        // Outer
        app.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        if (sectionBg) app.style.background = sectionBg;
        app.style.paddingTop    = padTop + 'px';
        app.style.paddingBottom = padBot + 'px';

        typoCssVarsForEl(app, opts.typoTitle, '--bkbg-ccv-tt-');
        typoCssVarsForEl(app, opts.typoSubtitle, '--bkbg-ccv-st-');

        var card = document.createElement('div');
        card.className = 'bkbg-clr-card';
        card.style.cssText = 'background:' + cardBg + ';border-radius:' + cardRadius + 'px;padding:36px 32px;max-width:' + maxWidth + 'px;margin:0 auto;';
        app.appendChild(card);

        // Header
        if (showTitle && opts.title) {
            var titleEl = document.createElement('div');
            titleEl.className = 'bkbg-ccv-title';
            titleEl.style.cssText = 'color:' + titleColor + ';margin-bottom:6px;';
            titleEl.textContent = opts.title;
            card.appendChild(titleEl);
        }
        if (showSub && opts.subtitle) {
            var subEl = document.createElement('div');
            subEl.className = 'bkbg-ccv-subtitle';
            subEl.style.cssText = 'color:' + subtitleColor + ';margin-bottom:20px;';
            subEl.textContent = opts.subtitle;
            card.appendChild(subEl);
        }

        // Swatch
        var swatch;
        if (showSwatch) {
            swatch = document.createElement('div');
            swatch.className = 'bkbg-clr-swatch';
            swatch.style.cssText = 'height:' + swatchHeight + 'px;border-radius:' + inputRadius + 'px;border:2px solid ' + swatchBorder + ';margin-bottom:24px;background:' + currentHex + ';';
            card.appendChild(swatch);
        }

        function makeCopyBtn(getText) {
            if (!showCopy) return null;
            var btn = document.createElement('button');
            btn.className = 'bkbg-clr-copy-btn';
            btn.style.background = copyBg;
            btn.style.color = copyColor;
            btn.textContent = 'Copy';
            btn.addEventListener('click', function() {
                try { navigator.clipboard.writeText(getText()); } catch(e) {}
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                setTimeout(function(){ btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
            });
            return btn;
        }

        function makeInput(opts2) {
            var inp = document.createElement('input');
            inp.className = 'bkbg-clr-input';
            inp.type = opts2.type || 'text';
            if (opts2.min !== undefined) { inp.min = opts2.min; inp.max = opts2.max; }
            inp.style.borderRadius = inputRadius + 'px';
            inp.style.borderColor  = inputBorder;
            return inp;
        }

        function makeLabel(txt, isSmall) {
            var lbl = document.createElement('label');
            lbl.style.display = 'block';
            lbl.style.fontWeight = '600';
            lbl.style.color = labelColor;
            lbl.style.marginBottom = '5px';
            if (isSmall) {
                lbl.style.fontSize = '11px';
            } else {
                lbl.style.fontSize = '12px';
                lbl.style.textTransform = 'uppercase';
                lbl.style.letterSpacing = '.04em';
            }
            lbl.textContent = txt;
            return lbl;
        }

        var hexInput, rInp, gInp, bInp, hInp, sInp, lInp;

        // HEX section
        var hexSec = document.createElement('div');
        hexSec.className = 'bkbg-clr-section';
        hexSec.appendChild(makeLabel('HEX'));
        hexInput = makeInput({ type: 'text' });
        hexSec.appendChild(hexInput);
        if (showCopy) hexSec.appendChild(makeCopyBtn(function(){ return hexInput.value; }));
        card.appendChild(hexSec);

        // RGB section
        var rgbSec = document.createElement('div');
        rgbSec.className = 'bkbg-clr-section';
        rgbSec.appendChild(makeLabel('RGB'));
        var rgbGrid = document.createElement('div');
        rgbGrid.className = 'bkbg-clr-rgb-grid';
        [['R', 'r'], ['G', 'g'], ['B', 'b']].forEach(function(pair) {
            var col = document.createElement('div');
            col.appendChild(makeLabel(pair[0], true));
            var inp = makeInput({ type:'number', min:0, max:255 });
            if (pair[1]==='r') rInp=inp;
            else if (pair[1]==='g') gInp=inp;
            else bInp=inp;
            col.appendChild(inp);
            rgbGrid.appendChild(col);
        });
        rgbSec.appendChild(rgbGrid);
        if (showCopy) rgbSec.appendChild(makeCopyBtn(function(){ return 'rgb(' + rInp.value + ', ' + gInp.value + ', ' + bInp.value + ')'; }));
        card.appendChild(rgbSec);

        // HSL section
        var hslSec = document.createElement('div');
        hslSec.appendChild(makeLabel('HSL'));
        var hslGrid = document.createElement('div');
        hslGrid.className = 'bkbg-clr-rgb-grid';
        [['H°', 'h', 360], ['S%', 's', 100], ['L%', 'l', 100]].forEach(function(t) {
            var col = document.createElement('div');
            col.appendChild(makeLabel(t[0], true));
            var inp = makeInput({ type:'number', min:0, max:t[2] });
            if (t[1]==='h') hInp=inp;
            else if (t[1]==='s') sInp=inp;
            else lInp=inp;
            col.appendChild(inp);
            hslGrid.appendChild(col);
        });
        hslSec.appendChild(hslGrid);
        if (showCopy) hslSec.appendChild(makeCopyBtn(function(){ return 'hsl(' + hInp.value + ', ' + sInp.value + '%, ' + lInp.value + '%)'; }));
        card.appendChild(hslSec);

        var updating = false;

        function applyHex(hex) {
            if (updating) return;
            var rgb = hexToRgb(hex); if (!rgb) return;
            var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            updating = true;
            hexInput.value = hex;
            rInp.value = rgb.r; gInp.value = rgb.g; bInp.value = rgb.b;
            hInp.value = hsl.h; sInp.value = hsl.s; lInp.value = hsl.l;
            if (swatch) swatch.style.background = hex;
            updating = false;
        }

        hexInput.addEventListener('input', function() {
            var v = hexInput.value.trim();
            if (!v.startsWith('#')) v = '#' + v;
            if (hexToRgb(v)) applyHex(v);
        });

        function fromRgb() {
            if (updating) return;
            var hex = rgbToHex(parseInt(rInp.value)||0, parseInt(gInp.value)||0, parseInt(bInp.value)||0);
            applyHex(hex);
        }
        rInp.addEventListener('input', fromRgb);
        gInp.addEventListener('input', fromRgb);
        bInp.addEventListener('input', fromRgb);

        function fromHsl() {
            if (updating) return;
            var rgb = hslToRgb(parseInt(hInp.value)||0, parseInt(sInp.value)||0, parseInt(lInp.value)||0);
            applyHex(rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        hInp.addEventListener('input', fromHsl);
        sInp.addEventListener('input', fromHsl);
        lInp.addEventListener('input', fromHsl);

        applyHex(currentHex);
    }

    document.querySelectorAll('.bkbg-clr-app').forEach(initColorConverter);
})();
