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

    var BASES = [
        {key:'binary',  label:'Binary',      base:2,  hint:'0 – 1',       validate:/^[01]*$/},
        {key:'octal',   label:'Octal',       base:8,  hint:'0 – 7',       validate:/^[0-7]*$/},
        {key:'decimal', label:'Decimal',     base:10, hint:'0 – 9',       validate:/^[0-9]*$/},
        {key:'hex',     label:'Hexadecimal', base:16, hint:'0 – F',       validate:/^[0-9A-Fa-f]*$/}
    ];

    var ORDER = ['decimal','binary','octal','hex'];

    function toDecimal(str, base) {
        if (!str) return NaN;
        return parseInt(str, base);
    }

    function fromDecimal(n, base) {
        if (isNaN(n) || n < 0) return '';
        return n.toString(base).toUpperCase();
    }

    function bitPattern(n, bits) {
        if (isNaN(n) || n < 0) return '—';
        return (n >>> 0).toString(2).padStart(bits, '0');
    }

    function showToast(msg) {
        var t = document.querySelector('.bkbg-nbc-toast');
        if (!t) {
            t = document.createElement('div');
            t.className = 'bkbg-nbc-toast';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(function () { t.classList.remove('show'); }, 1800);
    }

    function initBlock(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) {}

        var defaultValue  = opts.defaultValue  || '255';
        var showBinary    = opts.showBinary    !== false;
        var showOctal     = opts.showOctal     !== false;
        var showDecimal   = opts.showDecimal   !== false;
        var showHex       = opts.showHex       !== false;
        var showBitLength = opts.showBitLength !== false;
        var showCopy      = opts.showCopyButtons !== false;
        var cardRadius    = (opts.cardRadius  !== undefined ? opts.cardRadius  : 16) + 'px';
        var inputRadius   = (opts.inputRadius !== undefined ? opts.inputRadius : 8)  + 'px';
        var valueFontSize = (opts.valueFontSize || 18) + 'px';
        var colors = {
            binary:  opts.binaryColor  || '#3b82f6',
            octal:   opts.octalColor   || '#f59e0b',
            decimal: opts.decimalColor || '#6c3fb5',
            hex:     opts.hexColor     || '#10b981'
        };
        var rowBg     = opts.rowBg     || '#f3f4f6';
        var rowBorder = opts.rowBorder || '#e5e7eb';
        var cardBg    = opts.cardBg    || '#fff';
        var labelColor= opts.labelColor|| '#374151';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-nbc-wrap';
        wrap.style.borderRadius = cardRadius;
        wrap.style.background   = cardBg;
        app.appendChild(wrap);

        /* Typography CSS vars */
        typoCssVarsForEl(wrap, opts.titleTypo, '--bkbg-nbc-tt-');
        typoCssVarsForEl(wrap, opts.subtitleTypo, '--bkbg-nbc-st-');

        // Header
        if (opts.showTitle || opts.showSubtitle) {
            var hdr = document.createElement('div');
            hdr.className = 'bkbg-nbc-header';
            if (opts.showTitle && opts.title) {
                var ti = document.createElement('div');
                ti.className = 'bkbg-nbc-title';
                if (opts.titleColor) ti.style.color = opts.titleColor;
                ti.textContent = opts.title;
                hdr.appendChild(ti);
            }
            if (opts.showSubtitle && opts.subtitle) {
                var su = document.createElement('div');
                su.className = 'bkbg-nbc-subtitle';
                if (opts.subtitleColor) su.style.color = opts.subtitleColor;
                su.textContent = opts.subtitle;
                hdr.appendChild(su);
            }
            wrap.appendChild(hdr);
        }

        // Build rows
        var inputs = {};
        var visibility = {binary:showBinary, octal:showOctal, decimal:showDecimal, hex:showHex};
        var order = ORDER.filter(function(k){ return visibility[k]; });

        order.forEach(function(key) {
            var binfo = BASES.find(function(b){ return b.key===key; });
            var color = colors[key];

            var row = document.createElement('div');
            row.className = 'bkbg-nbc-row';
            row.style.background = rowBg;
            row.style.borderColor = rowBorder;
            row.style.borderRadius = inputRadius;
            row.style.overflow = 'hidden';

            var badge = document.createElement('div');
            badge.className = 'bkbg-nbc-badge';
            badge.style.background = color;
            badge.style.color = '#fff';

            var hint = document.createElement('div');
            hint.className = 'bkbg-nbc-badge-hint';
            hint.textContent = binfo.hint;

            var name = document.createElement('div');
            name.className = 'bkbg-nbc-badge-name';
            name.textContent = binfo.label;

            badge.appendChild(hint); badge.appendChild(name);

            var inp = document.createElement('input');
            inp.type = 'text';
            inp.className = 'bkbg-nbc-input';
            inp.style.fontSize = valueFontSize;
            inp.autocomplete = 'off';
            inp.autocorrect  = 'off';
            inp.spellcheck   = false;
            inp.dataset.base = binfo.base;
            inp.dataset.key  = key;

            row.appendChild(badge);
            row.appendChild(inp);

            if (showCopy) {
                var copyBtn = document.createElement('button');
                copyBtn.className = 'bkbg-nbc-copy';
                copyBtn.type = 'button';
                copyBtn.textContent = 'Copy';
                copyBtn.style.color = color;
                copyBtn.style.background = color + '18';
                copyBtn.addEventListener('click', function () {
                    var val = inp.value;
                    if (!val) return;
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(val).then(function(){ showToast('Copied!'); });
                    } else {
                        inp.select();
                        document.execCommand('copy');
                        showToast('Copied!');
                    }
                });
                row.appendChild(copyBtn);
            }

            wrap.appendChild(row);
            inputs[key] = inp;
        });

        // Bit length section
        var bitSection, b8, b16, b32;
        if (showBitLength) {
            bitSection = document.createElement('div');
            bitSection.className = 'bkbg-nbc-bits';
            bitSection.style.background = rowBg;
            bitSection.style.borderColor = rowBorder;

            var bTitle = document.createElement('div');
            bTitle.className = 'bkbg-nbc-bits-title';
            bTitle.style.color = labelColor;
            bTitle.textContent = 'Bit Lengths';
            bitSection.appendChild(bTitle);

            function makeBitRow(label) {
                var r = document.createElement('div');
                r.className = 'bkbg-nbc-bit-row';
                var l = document.createElement('span');
                l.className = 'bkbg-nbc-bit-lbl';
                l.style.color = labelColor;
                l.textContent = label;
                var v = document.createElement('span');
                v.className = 'bkbg-nbc-bit-val';
                v.textContent = '—';
                r.appendChild(l); r.appendChild(v);
                bitSection.appendChild(r);
                return v;
            }
            b8  = makeBitRow('8-bit');
            b16 = makeBitRow('16-bit');
            b32 = makeBitRow('32-bit');
            wrap.appendChild(bitSection);
        }

        // Compute initial values from defaultValue (decimal)
        var initDec = parseInt(defaultValue, 10);
        Object.keys(inputs).forEach(function(key) {
            var binfo = BASES.find(function(b){ return b.key===key; });
            inputs[key].value = fromDecimal(initDec, binfo.base);
        });
        if (showBitLength && !isNaN(initDec)) {
            b8.textContent  = bitPattern(initDec, 8);
            b16.textContent = bitPattern(initDec, 16);
            b32.textContent = bitPattern(initDec, 32);
        }

        // Attach listeners
        Object.keys(inputs).forEach(function (key) {
            var inp = inputs[key];
            inp.addEventListener('input', function () {
                var raw   = inp.value.replace(/\s/g, '').toUpperCase();
                var binfo = BASES.find(function(b){ return b.key===key; });
                // Validate
                if (raw && !binfo.validate.test(raw)) {
                    // revert to last valid value - strip invalid chars
                    var allowed = raw.split('').filter(function(c){ return binfo.validate.test(c); }).join('');
                    inp.value = allowed;
                    raw = allowed;
                }
                var n = toDecimal(raw, binfo.base);
                Object.keys(inputs).forEach(function(k) {
                    if (k === key) { return; }
                    var tb = BASES.find(function(b){ return b.key===k; });
                    inputs[k].value = raw ? fromDecimal(n, tb.base) : '';
                });
                if (showBitLength) {
                    if (!raw || isNaN(n)) {
                        b8.textContent = '—'; b16.textContent = '—'; b32.textContent = '—';
                    } else {
                        b8.textContent  = bitPattern(n, 8);
                        b16.textContent = bitPattern(n, 16);
                        b32.textContent = bitPattern(n, 32);
                    }
                }
            });
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-nbc-app').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
