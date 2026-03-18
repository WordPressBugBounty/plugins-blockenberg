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
        var lhu = typo.lineHeightUnit || 'px';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) { el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu); el.style.setProperty(prefix + 'letter-spacing', typo.letterSpacingDesktop + lsu); }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) { el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu); el.style.setProperty(prefix + 'word-spacing', typo.wordSpacingDesktop + wsu); }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    /* =====================================================================
       Code128-B encoder  (pure JS, no dependencies)
       Reference: ISO/IEC 15417
       ===================================================================== */

    var CODE128_B = {
        START: [2,1,1,4,1,2],
        STOP:  [2,3,3,1,1,1,2],
        // Value → [bar widths ×1] for each code 0–102
        TABLE: [
            [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],
            [1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],
            [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],
            [1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
            [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],
            [3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],
            [2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],
            [1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
            [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],
            [1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],[1,1,3,2,1,3],[1,1,3,3,1,2], // 49
            [1,3,3,1,1,2],[1,3,1,2,3,1],[2,1,1,2,3,2],[1,1,2,2,1,3],[1,2,2,1,1,3], // ok to 54
            [1,2,1,3,3,1],[1,1,3,2,3,1],[1,2,3,1,3,1],[1,2,3,1,1,3],[1,2,1,1,3,3],
            [1,1,1,2,3,3],[1,3,1,2,1,3],[1,3,2,1,1,3],[1,2,1,3,1,3],[1,3,1,3,1,2], // 64
            [2,1,3,1,2,2],[2,1,3,2,2,1],[2,1,2,2,3,1],[2,3,2,1,1,2],[3,1,1,1,2,3],
            [3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],
            [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],
            [1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],
            [1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],
            [2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],
            [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],
            [1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],
            [2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],
            [1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],
            [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[6,1,1,1,1,2]  // 106
        ]
    };

    // Encode text as Code128-B (supports ASCII 32-126)
    function encodeCode128(text) {
        var bars = [];

        // Append pattern helper
        function addCode(idx) {
            var row = CODE128_B.TABLE[idx];
            if (!row) return;
            for (var i = 0; i < row.length; i++) { bars.push({ w: row[i], bar: i % 2 === 0 }); }
        }

        // START B
        for (var s = 0; s < CODE128_B.START.length; s++) {
            bars.push({ w: CODE128_B.START[s], bar: s % 2 === 0 });
        }

        var checksum = 104; // Start-B value
        for (var i = 0; i < text.length; i++) {
            var code = text.charCodeAt(i) - 32;
            if (code < 0 || code > 94) return null; // unsupported char
            checksum += (i + 1) * code;
            addCode(code);
        }

        // Checksum
        addCode(checksum % 103);

        // STOP
        for (var t = 0; t < CODE128_B.STOP.length; t++) {
            bars.push({ w: CODE128_B.STOP[t], bar: t % 2 === 0 });
        }

        return bars;
    }

    function drawBarcode(canvas, text, opts) {
        var barW     = opts.barWidth  || 2;
        var barH     = opts.barHeight || 80;
        var barColor = opts.barColor  || '#000';
        var bgColor  = opts.bgColor   || '#fff';
        var showLabel= opts.showLabel !== false;

        var bars = encodeCode128(text);
        if (!bars) return false;

        var totalBars = 0;
        for (var i = 0; i < bars.length; i++) totalBars += bars[i].w;

        var padX   = 10, padY = 8;
        var labelH = showLabel ? 20 : 0;
        var w = totalBars * barW + padX * 2;
        var h = barH + labelH + padY * 2;

        canvas.width  = w;
        canvas.height = h;

        var ctx = canvas.getContext('2d');
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);

        var x = padX;
        for (var j = 0; j < bars.length; j++) {
            if (bars[j].bar) {
                ctx.fillStyle = barColor;
                ctx.fillRect(x, padY, bars[j].w * barW, barH);
            }
            x += bars[j].w * barW;
        }

        if (showLabel) {
            ctx.fillStyle = barColor;
            ctx.font = '11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(text, w / 2, padY + barH + 14);
        }

        return true;
    }

    function showToast(msg) {
        var t = document.createElement('div');
        t.className = 'bkbg-brc-toast bkbg-brc-toast-show';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function () {
            t.classList.remove('bkbg-brc-toast-show');
            setTimeout(function () { t.parentNode && t.parentNode.removeChild(t); }, 400);
        }, 1800);
    }

    function initBlock(root) {
        var opts = {};
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); } catch (e) {}

        var accentColor = opts.accentColor || '#1f2937';
        var barColor    = opts.barColor    || '#000000';
        var bgColor     = opts.bgColor     || '#ffffff';
        var sectionBg   = opts.sectionBg   || '#f9fafb';
        var titleColor  = opts.titleColor  || '#111827';
        var buttonBg    = opts.buttonBg    || '#1f2937';
        var barHeight   = opts.barHeight   || 80;
        var barWidth    = opts.barWidth    || 2;
        var showLabel   = opts.showLabel  !== false;
        var showDownload= opts.showDownload !== false;
        var showCopy    = opts.showCopy   !== false;
        var defaultText = opts.defaultText || 'BLOCKENBERG-2024';
        var fontSize    = opts.fontSize    || 26;
        var subtitleSize= opts.subtitleSize|| 14;

        root.style.background   = sectionBg;
        root.style.borderRadius = '16px';
        root.style.padding      = '28px 20px';
        root.style.textAlign    = 'center';

        // Title / subtitle already rendered by save() as .bkbg-brc-title / .bkbg-brc-subtitle
        // Apply styling to them
        var titleEl    = root.querySelector('.bkbg-brc-title');
        var subtitleEl = root.querySelector('.bkbg-brc-subtitle');
        if (titleEl)    { titleEl.style.color = titleColor; titleEl.style.margin = '0 0 4px'; }
        if (subtitleEl) { subtitleEl.style.color = titleColor + 'bb'; subtitleEl.style.margin = '0 0 18px'; }
        typoCssVarsForEl(opts.titleTypo, '--bkbg-brc-title-', root);
        typoCssVarsForEl(opts.subtitleTypo, '--bkbg-brc-sub-', root);

        // Build inner UI
        var inner = document.createElement('div');

        // Input row
        var inputRow = document.createElement('div');
        inputRow.className = 'bkbg-brc-input-row';

        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'bkbg-brc-input';
        input.value = defaultText;
        input.placeholder = 'Enter text or number…';
        input.setAttribute('maxlength', '80');
        input.style.setProperty('--bkbg-brc-accent', accentColor);

        var genBtn = document.createElement('button');
        genBtn.className = 'bkbg-brc-generate-btn';
        genBtn.textContent = 'Generate';
        genBtn.style.background = buttonBg;

        inputRow.appendChild(input);
        inputRow.appendChild(genBtn);
        inner.appendChild(inputRow);

        // Error msg
        var errEl = document.createElement('div');
        errEl.className = 'bkbg-brc-error';
        inner.appendChild(errEl);

        // Canvas
        var canvasWrap = document.createElement('div');
        canvasWrap.className = 'bkbg-brc-canvas-wrap';
        var canvas = document.createElement('canvas');
        canvas.className = 'bkbg-brc-canvas';
        canvasWrap.appendChild(canvas);
        inner.appendChild(canvasWrap);

        // Actions
        var actions = document.createElement('div');
        actions.className = 'bkbg-brc-actions';

        function generate() {
            var text = input.value.trim();
            if (!text) { errEl.textContent = 'Please enter text or a number.'; return; }

            var ok = drawBarcode(canvas, text, {
                barWidth: barWidth, barHeight: barHeight,
                barColor: barColor, bgColor: bgColor, showLabel: showLabel
            });
            if (!ok) {
                errEl.textContent = 'Error: Text contains unsupported characters. Use ASCII 32–126.';
                canvas.width = 0;
                canvas.height = 0;
            } else {
                errEl.textContent = '';
            }
        }

        genBtn.addEventListener('click', generate);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') generate(); });

        if (showDownload) {
            var dlBtn = document.createElement('button');
            dlBtn.className = 'bkbg-brc-action-btn';
            dlBtn.style.borderColor = buttonBg;
            dlBtn.style.color       = buttonBg;
            dlBtn.textContent = '⬇ Download PNG';
            dlBtn.addEventListener('click', function () {
                if (!canvas.width) { generate(); }
                var link = document.createElement('a');
                link.download = 'barcode-' + (input.value.trim() || 'code') + '.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
            actions.appendChild(dlBtn);
        }

        if (showCopy) {
            var cpBtn = document.createElement('button');
            cpBtn.className = 'bkbg-brc-action-btn';
            cpBtn.style.borderColor = buttonBg;
            cpBtn.style.color       = buttonBg;
            cpBtn.textContent = '📋 Copy Image';
            cpBtn.addEventListener('click', function () {
                if (!canvas.width) { generate(); }
                canvas.toBlob(function (blob) {
                    if (!blob) return;
                    try {
                        var item = new ClipboardItem({ 'image/png': blob });
                        navigator.clipboard.write([item]).then(function () {
                            showToast('Barcode copied to clipboard!');
                        }).catch(function () {
                            showToast('Copy not supported in this browser.');
                        });
                    } catch (err) {
                        showToast('Copy not supported in this browser.');
                    }
                });
            });
            actions.appendChild(cpBtn);
        }

        inner.appendChild(actions);
        root.appendChild(inner);

        // Auto-generate initial barcode
        generate();
    }

    function init() {
        document.querySelectorAll('.bkbg-brc-app').forEach(function (root) {
            initBlock(root);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
