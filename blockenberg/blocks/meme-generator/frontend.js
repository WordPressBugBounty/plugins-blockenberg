(function () {
    'use strict';

    function drawMeme(canvas, img, topText, bottomText, opts) {
        var ctx = canvas.getContext('2d');
        var W = canvas.width, H = canvas.height;

        // Background
        ctx.fillStyle = opts.canvasBg || '#cccccc';
        ctx.fillRect(0, 0, W, H);

        // Image
        if (img && img.complete && img.naturalWidth > 0) {
            // Cover fit
            var iw = img.naturalWidth, ih = img.naturalHeight;
            var scale = Math.max(W / iw, H / ih);
            var dw = iw * scale, dh = ih * scale;
            ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        }

        // Text settings
        var fontSize  = opts.memeFontSize   || 52;
        var font      = opts.memeFont       || 'Impact';
        var fillColor = opts.memeTextColor  || '#ffffff';
        var stroke    = opts.memeStrokeColor|| '#000000';
        var strokeW   = (opts.memeStrokeWidth || 3) * (W / 560);

        ctx.font         = 'bold ' + fontSize + 'px ' + font + ', Arial Black, sans-serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'top';
        ctx.lineJoin     = 'round';
        ctx.miterLimit   = 2;

        function drawText(text, y) {
            if (!text) return;
            text = text.toUpperCase();
            ctx.strokeStyle = stroke;
            ctx.lineWidth   = strokeW;
            ctx.strokeText(text, W / 2, y, W - 24);
            ctx.fillStyle   = fillColor;
            ctx.fillText(text, W / 2, y, W - 24);
        }

        var pad = Math.round(fontSize * 0.2);
        drawText(topText, pad);

        ctx.textBaseline = 'bottom';
        drawText(bottomText, H - pad);
    }

    function initBlock(root) {
        var optsRaw = root.getAttribute('data-opts');
        var opts;
        try { opts = JSON.parse(optsRaw); } catch (e) { opts = {}; }

        var _typoKeys = { family:'font-family', weight:'font-weight', style:'font-style', decoration:'text-decoration', transform:'text-transform', sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m', lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m', letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m', wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
        function typoCssVarsForEl(el, typo, prefix) {
            if (!typo || typeof typo !== 'object') return;
            Object.keys(_typoKeys).forEach(function (k) {
                if (typo[k] !== undefined && typo[k] !== '') el.style.setProperty(prefix + _typoKeys[k], typo[k]);
            });
        }

        var accent     = opts.accentColor || '#6366f1';
        var titleColor = opts.titleColor  || '#1e1b4b';
        var sectionBg  = opts.sectionBg   || '';

        if (sectionBg) root.style.background = sectionBg;
        root.style.setProperty('--bkbg-mme-accent', accent);

        typoCssVarsForEl(root, opts.titleTypo, '--bkbg-mme-tt-');
        typoCssVarsForEl(root, opts.subtitleTypo, '--bkbg-mme-st-');

        // Style title/subtitle
        var titleEl = root.querySelector('.bkbg-mme-title');
        if (titleEl) { titleEl.style.color = titleColor; }
        var subEl = root.querySelector('.bkbg-mme-subtitle');
        if (subEl) { subEl.style.color = titleColor; }

        var W = opts.canvasWidth  || 560;
        var H = opts.canvasHeight || 420;

        // ---- Canvas ----
        var canvasWrap = document.createElement('div');
        canvasWrap.className = 'bkbg-mme-canvas-wrap';

        var canvas = document.createElement('canvas');
        canvas.className = 'bkbg-mme-canvas';
        canvas.width  = W;
        canvas.height = H;
        canvasWrap.appendChild(canvas);
        root.appendChild(canvasWrap);

        // ---- Controls ----
        var ctrlDiv = document.createElement('div');
        ctrlDiv.className = 'bkbg-mme-controls';
        root.appendChild(ctrlDiv);

        function makeRow(labelText, inputEl) {
            var row = document.createElement('div');
            row.className = 'bkbg-mme-row';
            var lbl = document.createElement('label');
            lbl.className = 'bkbg-mme-label';
            lbl.style.color = titleColor;
            lbl.textContent = labelText;
            row.appendChild(lbl);
            row.appendChild(inputEl);
            ctrlDiv.appendChild(row);
        }

        function makeInput(placeholder, val) {
            var inp = document.createElement('input');
            inp.type = 'text';
            inp.className = 'bkbg-mme-input';
            inp.placeholder = placeholder;
            inp.value = val || '';
            inp.style.background = opts.canvasBg || '#f3f4f6';
            inp.style.color = '#1e1b4b';
            return inp;
        }

        var topInput    = makeInput('Top text…', opts.defaultTopText || 'TOP TEXT');
        var bottomInput = makeInput('Bottom text…', opts.defaultBottomText || 'BOTTOM TEXT');
        var urlInput    = makeInput('Image URL (https://…)', opts.defaultImageUrl || '');

        makeRow('Top Text', topInput);
        makeRow('Bottom Text', bottomInput);
        makeRow('Image URL', urlInput);

        // ---- Actions ----
        var actions = document.createElement('div');
        actions.className = 'bkbg-mme-actions';
        root.appendChild(actions);

        if (opts.showDownload !== false) {
            var dlBtn = document.createElement('button');
            dlBtn.className = 'bkbg-mme-dl-btn';
            dlBtn.style.background = '#22c55e';
            dlBtn.style.color = '#fff';
            dlBtn.textContent = '⬇️ Download PNG';
            actions.appendChild(dlBtn);

            dlBtn.addEventListener('click', function () {
                canvas.toBlob(function (blob) {
                    if (!blob) { alert('Could not export — cross-origin image may be blocking download.'); return; }
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = 'meme.png';
                    a.click();
                    URL.revokeObjectURL(url);
                });
            });
        }

        var resetBtn = document.createElement('button');
        resetBtn.className = 'bkbg-mme-reset-btn';
        resetBtn.style.background = '#e5e7eb';
        resetBtn.style.color = '#374151';
        resetBtn.textContent = '↺ Reset';
        actions.appendChild(resetBtn);

        // ---- Image management ----
        var img = null;
        var currentUrl = '';

        function loadImage(url) {
            if (!url) {
                img = null;
                redraw();
                return;
            }
            if (url === currentUrl && img) return;
            currentUrl = url;
            var newImg = new Image();
            newImg.crossOrigin = 'anonymous';
            newImg.onload  = function () { img = newImg; redraw(); };
            newImg.onerror = function () { img = null; redraw(); };
            newImg.src = url;
        }

        function redraw() {
            drawMeme(canvas, img, topInput.value, bottomInput.value, opts);
        }

        topInput.addEventListener('input', redraw);
        bottomInput.addEventListener('input', redraw);
        urlInput.addEventListener('change', function () { loadImage(urlInput.value.trim()); });
        urlInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') loadImage(urlInput.value.trim()); });

        resetBtn.addEventListener('click', function () {
            topInput.value    = opts.defaultTopText    || 'TOP TEXT';
            bottomInput.value = opts.defaultBottomText || 'BOTTOM TEXT';
            urlInput.value    = opts.defaultImageUrl   || '';
            loadImage(urlInput.value.trim());
            redraw();
        });

        // Initial load
        loadImage((opts.defaultImageUrl || '').trim());
        redraw();
    }

    document.querySelectorAll('.bkbg-mme-app').forEach(function (root) {
        initBlock(root);
    });
})();
