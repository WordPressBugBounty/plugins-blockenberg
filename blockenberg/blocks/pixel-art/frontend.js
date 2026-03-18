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

    var DEFAULT_PALETTE = ['#000000','#ffffff','#ef4444','#f97316','#f59e0b','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#78716c','#94a3b8'];

    function initBlock(root) {
        var optsRaw = root.getAttribute('data-opts');
        var opts;
        try { opts = JSON.parse(optsRaw); } catch (e) { opts = {}; }

        var cols       = opts.gridCols    || 32;
        var rows       = opts.gridRows    || 32;
        var CS         = opts.cellSize    || 16;
        var canvasBg   = opts.canvasBg    || '#ffffff';
        var gridColor  = opts.gridLineColor || '#e5e7eb';
        var showGrid   = opts.showGrid !== false;
        var accent     = opts.accentColor || '#6366f1';
        var titleColor = opts.titleColor  || '#1e1b4b';
        var palette    = (opts.palette && opts.palette.length) ? opts.palette : DEFAULT_PALETTE;

        if (opts.sectionBg) root.style.background = opts.sectionBg;

        var titleEl = root.querySelector('.bkbg-pxa-title');
        if (titleEl) { titleEl.style.color = titleColor; typoCssVarsForEl(titleEl, opts.titleTypo, '--bkbg-pxa-tt-'); }
        var subEl = root.querySelector('.bkbg-pxa-subtitle');
        if (subEl) { subEl.style.color = titleColor; typoCssVarsForEl(subEl, opts.subtitleTypo, '--bkbg-pxa-st-'); }

        // ---- State ----
        var pixels = [];  // rows x cols array of color strings or null
        for (var r = 0; r < rows; r++) { pixels.push(new Array(cols).fill(null)); }

        var history    = [];  // undo stack (array of serialized states)
        var tool       = 'draw'; // 'draw' | 'fill' | 'erase'
        var activeColor= palette[0];
        var drawing    = false;

        // ---- Toolbar ----
        var toolbar = document.createElement('div');
        toolbar.className = 'bkbg-pxa-toolbar';
        root.appendChild(toolbar);

        var toolBtns = {};
        var tools = [['draw', '✏️ Draw'], ['fill', '🪣 Fill'], ['erase', '⬜ Erase']];
        tools.forEach(function (pair) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-pxa-tool-btn' + (pair[0] === tool ? ' bkbg-pxa-active' : '');
            btn.style.color = accent;
            btn.textContent = pair[1];
            btn.addEventListener('click', function () {
                tool = pair[0];
                Object.values(toolBtns).forEach(function (b) { b.classList.remove('bkbg-pxa-active'); });
                btn.classList.add('bkbg-pxa-active');
            });
            toolbar.appendChild(btn);
            toolBtns[pair[0]] = btn;
        });

        // Separator
        var sep = document.createElement('span');
        sep.style.cssText = 'width:1px;height:24px;background:#e5e7eb;margin:0 4px;';
        toolbar.appendChild(sep);

        // Color swatches
        var swatchEls = [];
        palette.forEach(function (color, i) {
            var sw = document.createElement('div');
            sw.className = 'bkbg-pxa-swatch' + (i === 0 ? ' bkbg-pxa-selected' : '');
            sw.style.background = color;
            // White swatch needs dark border
            if (color === '#ffffff' || color === '#fff') sw.style.boxShadow = 'inset 0 0 0 1px #ccc';
            sw.addEventListener('click', function () {
                activeColor = color;
                tool = 'draw';
                Object.values(toolBtns).forEach(function (b) { b.classList.remove('bkbg-pxa-active'); });
                toolBtns['draw'].classList.add('bkbg-pxa-active');
                swatchEls.forEach(function (s) { s.classList.remove('bkbg-pxa-selected'); });
                sw.classList.add('bkbg-pxa-selected');
            });
            toolbar.appendChild(sw);
            swatchEls.push(sw);
        });

        // Custom color picker
        var colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = '#ff0000';
        colorPicker.title = 'Custom color';
        colorPicker.style.cssText = 'width:26px;height:26px;border:none;border-radius:5px;cursor:pointer;padding:0;background:none;';
        colorPicker.addEventListener('input', function () {
            activeColor = colorPicker.value;
            tool = 'draw';
            Object.values(toolBtns).forEach(function (b) { b.classList.remove('bkbg-pxa-active'); });
            toolBtns['draw'].classList.add('bkbg-pxa-active');
            swatchEls.forEach(function (s) { s.classList.remove('bkbg-pxa-selected'); });
        });
        toolbar.appendChild(colorPicker);

        // ---- Canvas ----
        var canvasWrap = document.createElement('div');
        canvasWrap.className = 'bkbg-pxa-canvas-wrap';
        root.appendChild(canvasWrap);

        var canvas = document.createElement('canvas');
        canvas.className = 'bkbg-pxa-canvas';
        canvas.width  = cols * CS;
        canvas.height = rows * CS;
        canvasWrap.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        // Size info
        var sizeInfo = document.createElement('div');
        sizeInfo.className = 'bkbg-pxa-size-info';
        sizeInfo.style.color = titleColor;
        sizeInfo.textContent = cols + ' × ' + rows + ' pixels  |  Cell: ' + CS + 'px';
        root.appendChild(sizeInfo);

        // ---- Drawing ----
        function render() {
            ctx.fillStyle = canvasBg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (var r = 0; r < rows; r++) {
                for (var c = 0; c < cols; c++) {
                    if (pixels[r][c]) {
                        ctx.fillStyle = pixels[r][c];
                        ctx.fillRect(c * CS, r * CS, CS, CS);
                    }
                }
            }

            if (showGrid) {
                ctx.strokeStyle = gridColor;
                ctx.lineWidth   = 0.5;
                for (var gc = 0; gc <= cols; gc++) {
                    ctx.beginPath();
                    ctx.moveTo(gc * CS, 0);
                    ctx.lineTo(gc * CS, rows * CS);
                    ctx.stroke();
                }
                for (var gr = 0; gr <= rows; gr++) {
                    ctx.beginPath();
                    ctx.moveTo(0, gr * CS);
                    ctx.lineTo(cols * CS, gr * CS);
                    ctx.stroke();
                }
            }
        }

        function getCell(e) {
            var rect = canvas.getBoundingClientRect();
            var scaleX = canvas.width  / rect.width;
            var scaleY = canvas.height / rect.height;
            var x = (e.clientX - rect.left) * scaleX;
            var y = (e.clientY - rect.top)  * scaleY;
            return [Math.floor(y / CS), Math.floor(x / CS)];
        }

        function getTouchCell(e) {
            var t = e.touches[0] || e.changedTouches[0];
            return getCell({ clientX: t.clientX, clientY: t.clientY });
        }

        function saveHistory() {
            history.push(pixels.map(function (row) { return row.slice(); }));
            if (history.length > 40) history.shift();
        }

        function applyTool(r, c) {
            if (r < 0 || r >= rows || c < 0 || c >= cols) return;
            if (tool === 'draw') {
                if (pixels[r][c] !== activeColor) {
                    pixels[r][c] = activeColor;
                    render();
                }
            } else if (tool === 'erase') {
                if (pixels[r][c]) {
                    pixels[r][c] = null;
                    render();
                }
            }
        }

        function floodFill(r, c, targetColor, fillColor) {
            if (r < 0 || r >= rows || c < 0 || c >= cols) return;
            if (pixels[r][c] !== targetColor) return;
            if (pixels[r][c] === fillColor) return;
            pixels[r][c] = fillColor;
            floodFill(r+1, c, targetColor, fillColor);
            floodFill(r-1, c, targetColor, fillColor);
            floodFill(r, c+1, targetColor, fillColor);
            floodFill(r, c-1, targetColor, fillColor);
        }

        canvas.addEventListener('mousedown', function (e) {
            e.preventDefault();
            var rc = getCell(e);
            saveHistory();
            if (tool === 'fill') {
                var target = pixels[rc[0]][rc[1]];
                if (target !== activeColor) floodFill(rc[0], rc[1], target, activeColor);
                render(); return;
            }
            drawing = true;
            applyTool(rc[0], rc[1]);
        });

        canvas.addEventListener('mousemove', function (e) {
            if (!drawing) return;
            var rc = getCell(e);
            applyTool(rc[0], rc[1]);
        });

        window.addEventListener('mouseup', function () { drawing = false; });

        canvas.addEventListener('touchstart', function (e) {
            e.preventDefault();
            var rc = getTouchCell(e);
            saveHistory();
            if (tool === 'fill') {
                var target = pixels[rc[0]][rc[1]];
                if (target !== activeColor) floodFill(rc[0], rc[1], target, activeColor);
                render(); return;
            }
            drawing = true;
            applyTool(rc[0], rc[1]);
        }, { passive: false });

        canvas.addEventListener('touchmove', function (e) {
            e.preventDefault();
            if (!drawing) return;
            var rc = getTouchCell(e);
            applyTool(rc[0], rc[1]);
        }, { passive: false });

        canvas.addEventListener('touchend', function () { drawing = false; });

        // ---- Action buttons ----
        var actions = document.createElement('div');
        actions.className = 'bkbg-pxa-actions';
        root.appendChild(actions);

        function addBtn(label, bg, textCol, fn) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-pxa-btn';
            btn.textContent = label;
            btn.style.background = bg;
            btn.style.color = textCol;
            btn.addEventListener('click', fn);
            actions.appendChild(btn);
            return btn;
        }

        addBtn('↩ Undo', '#e5e7eb', '#374151', function () {
            if (!history.length) return;
            pixels = history.pop();
            render();
        });

        addBtn('🗑️ Clear', '#fef2f2', '#ef4444', function () {
            saveHistory();
            pixels = [];
            for (var r = 0; r < rows; r++) pixels.push(new Array(cols).fill(null));
            render();
        });

        if (opts.showDownload !== false) {
            addBtn('⬇️ Download PNG', '#22c55e', '#fff', function () {
                // Render without grid lines for download
                var tmpCanvas = document.createElement('canvas');
                tmpCanvas.width  = cols * CS;
                tmpCanvas.height = rows * CS;
                var tctx = tmpCanvas.getContext('2d');
                tctx.fillStyle = canvasBg;
                tctx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
                for (var r = 0; r < rows; r++) {
                    for (var c = 0; c < cols; c++) {
                        if (pixels[r][c]) {
                            tctx.fillStyle = pixels[r][c];
                            tctx.fillRect(c * CS, r * CS, CS, CS);
                        }
                    }
                }
                tmpCanvas.toBlob(function (blob) {
                    if (!blob) return;
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url; a.download = 'pixel-art.png'; a.click();
                    URL.revokeObjectURL(url);
                });
            });
        }

        render();
    }

    document.querySelectorAll('.bkbg-pxa-app').forEach(function (root) {
        initBlock(root);
    });
})();
