(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = { family:'font-family', weight:'font-weight', transform:'text-transform', style:'font-style', decoration:'text-decoration',
                  sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
                  lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
                  letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
                  wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
        Object.keys(m).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k], u = typo[k + 'Unit'] || '';
                if (/Desktop|Tablet|Mobile/.test(k) && typeof v === 'number') v = v + (u || 'px');
                el.style.setProperty(prefix + m[k], '' + v);
            }
        });
    }

    var PRESET_PALETTE = [
        '#000000', '#374151', '#6b7280', '#d1d5db',
        '#ffffff', '#ef4444', '#f97316', '#eab308',
        '#22c55e', '#06b6d4', '#6366f1', '#a855f7'
    ];

    var MAX_HISTORY = 40;

    function initBlock(root) {
        var optsRaw = root.getAttribute('data-opts');
        var opts;
        try { opts = JSON.parse(optsRaw); } catch (e) { opts = {}; }

        var accent       = opts.accentColor    || '#6366f1';
        var canvW        = opts.canvasWidth     || 800;
        var canvH        = opts.canvasHeight    || 480;
        var defTool      = opts.defaultTool     || 'pen';
        var defColor     = opts.defaultColor    || '#1e1b4b';
        var defLineWidth = opts.defaultLineWidth || 4;
        var showGrid     = !!opts.showGrid;
        var bgColor      = opts.backgroundColor || '#ffffff';
        var gridCol      = opts.gridColor       || '#e5e7eb';
        var titleColor   = opts.titleColor      || '#1e1b4b';
        var sectionBg    = opts.sectionBg       || '#f8fafc';

        if (sectionBg) root.style.background = sectionBg;
        root.style.setProperty('--bkbg-drw-accent', accent);
        root.style.setProperty('--bkbg-drw-ttl-fs', (opts.fontSize || 26) + 'px');
        root.style.setProperty('--bkbg-drw-sub-fs', (opts.subtitleSize || 14) + 'px');
        typoCssVarsForEl(opts.typoTitle, '--bkbg-drw-ttl-', root);
        typoCssVarsForEl(opts.typoSubtitle, '--bkbg-drw-sub-', root);

        var titleEl = root.querySelector('.bkbg-drw-title');
        if (titleEl) { titleEl.style.color = titleColor; }
        var subEl = root.querySelector('.bkbg-drw-subtitle');
        if (subEl) { subEl.style.color = titleColor; }

        // ---- State ----
        var tool      = defTool;
        var color     = defColor;
        var lineWidth = defLineWidth;
        var isDrawing = false;
        var startX = 0, startY = 0;
        var history   = [];
        var snapshot  = null; // imageData snapshot for shape preview during drag

        // ---- Build DOM ----
        var app = document.createElement('div');

        // Toolbar
        var toolbarEl;
        if (opts.showToolbar !== false) {
            toolbarEl = document.createElement('div');
            toolbarEl.className = 'bkbg-drw-toolbar';
            app.appendChild(toolbarEl);
        }

        // Canvas wrapper + canvas
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-drw-canvas-wrap';

        var canvas = document.createElement('canvas');
        canvas.className = 'bkbg-drw-canvas';
        canvas.width  = canvW;
        canvas.height = canvH;
        canvas.style.background = bgColor;
        wrap.appendChild(canvas);
        app.appendChild(wrap);

        // Action bar
        var actionsEl = document.createElement('div');
        actionsEl.className = 'bkbg-drw-actions';
        app.appendChild(actionsEl);

        root.appendChild(app);

        var ctx = canvas.getContext('2d');
        ctx.lineCap  = 'round';
        ctx.lineJoin = 'round';

        // ---- Grid ----
        function drawGrid() {
            if (!showGrid) return;
            var step = 20;
            ctx.save();
            ctx.strokeStyle = gridCol;
            ctx.lineWidth   = 0.5;
            ctx.globalAlpha = 0.5;
            for (var x = step; x < canvW; x += step) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvH); ctx.stroke();
            }
            for (var y = step; y < canvH; y += step) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvW, y); ctx.stroke();
            }
            ctx.restore();
        }

        // ---- Init canvas ----
        function initCanvas() {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvW, canvH);
            drawGrid();
        }
        initCanvas();

        // ---- History ----
        function saveHistory() {
            if (history.length >= MAX_HISTORY) history.shift();
            history.push(ctx.getImageData(0, 0, canvW, canvH));
        }

        function undo() {
            if (!history.length) return;
            ctx.putImageData(history.pop(), 0, 0);
        }

        // ---- Coordinate helper ---- (accounts for canvas CSS scaling)
        function getPos(e) {
            var rect = canvas.getBoundingClientRect();
            var scaleX = canvW / rect.width;
            var scaleY = canvH / rect.height;
            var src = e.touches ? e.touches[0] : e;
            return {
                x: (src.clientX - rect.left) * scaleX,
                y: (src.clientY - rect.top)  * scaleY
            };
        }

        // ---- Drawing helpers ----
        function applyTool(x, y) {
            ctx.strokeStyle = tool === 'eraser' ? bgColor : color;
            ctx.lineWidth   = lineWidth;
            ctx.globalAlpha = tool === 'marker' ? 0.45 : 1;
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        function drawShape(x, y) {
            if (!snapshot) return;
            ctx.putImageData(snapshot, 0, 0);
            ctx.strokeStyle = color;
            ctx.lineWidth   = lineWidth;
            ctx.globalAlpha = 1;
            if (tool === 'line') {
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
                ctx.stroke();
            } else if (tool === 'rect') {
                ctx.beginPath();
                ctx.strokeRect(startX, startY, x - startX, y - startY);
            } else if (tool === 'ellipse') {
                var rx = Math.abs(x - startX) / 2;
                var ry = Math.abs(y - startY) / 2;
                var cx = startX + (x - startX) / 2;
                var cy = startY + (y - startY) / 2;
                ctx.beginPath();
                ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // ---- Flood fill (for fill tool if added) ----
        // Not included in toolbar by default; shapes + pen/marker cover most use-cases.

        // ---- Mouse events ----
        function onStart(x, y) {
            saveHistory();
            isDrawing = true;
            startX = x; startY = y;
            if (tool === 'pen' || tool === 'marker' || tool === 'eraser') {
                ctx.save();
                ctx.strokeStyle = tool === 'eraser' ? bgColor : color;
                ctx.lineWidth   = lineWidth;
                ctx.globalAlpha = tool === 'marker' ? 0.45 : 1;
                ctx.lineCap  = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else {
                // shape — take snapshot
                snapshot = ctx.getImageData(0, 0, canvW, canvH);
            }
        }

        function onMove(x, y) {
            if (!isDrawing) return;
            if (tool === 'pen' || tool === 'marker' || tool === 'eraser') {
                applyTool(x, y);
            } else {
                drawShape(x, y);
            }
        }

        function onEnd(x, y) {
            if (!isDrawing) return;
            isDrawing = false;
            if (tool === 'pen' || tool === 'marker' || tool === 'eraser') {
                ctx.restore();
            } else {
                drawShape(x, y);
                snapshot = null;
            }
        }

        canvas.addEventListener('mousedown', function (e) { var p = getPos(e); onStart(p.x, p.y); });
        canvas.addEventListener('mousemove', function (e) { var p = getPos(e); onMove(p.x, p.y); });
        canvas.addEventListener('mouseup',   function (e) { var p = getPos(e); onEnd(p.x, p.y); });
        canvas.addEventListener('mouseleave', function (e) { if (isDrawing) { var p = getPos(e); onEnd(p.x, p.y); } });

        canvas.addEventListener('touchstart', function (e) { e.preventDefault(); var p = getPos(e); onStart(p.x, p.y); }, { passive: false });
        canvas.addEventListener('touchmove',  function (e) { e.preventDefault(); var p = getPos(e); onMove(p.x, p.y); }, { passive: false });
        canvas.addEventListener('touchend',   function (e) { e.preventDefault(); if (e.changedTouches.length) { var t = e.changedTouches[0]; var rect = canvas.getBoundingClientRect(); onEnd((t.clientX - rect.left) * canvW / rect.width, (t.clientY - rect.top) * canvH / rect.height); } }, { passive: false });

        // Update cursor
        function updateCursor() {
            canvas.className = 'bkbg-drw-canvas' + (tool === 'eraser' ? ' bkbg-drw-eraser-cur' : '');
        }

        // ---- Build Toolbar ----
        if (toolbarEl) {
            var TOOLS = [
                { id: 'pen',     label: '✏️', title: 'Pen (freehand)' },
                { id: 'marker',  label: '🖊️', title: 'Marker (soft)' },
                { id: 'line',    label: '📏', title: 'Line' },
                { id: 'rect',    label: '□',  title: 'Rectangle' },
                { id: 'ellipse', label: '○',  title: 'Ellipse' },
                { id: 'eraser',  label: '🧹', title: 'Eraser' }
            ];

            var toolBtns = {};
            TOOLS.forEach(function (t) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-drw-tool-btn' + (t.id === tool ? ' bkbg-drw-active' : '');
                btn.title = t.title;
                btn.textContent = t.label;
                btn.addEventListener('click', function () {
                    tool = t.id;
                    Object.values(toolBtns).forEach(function (b) { b.classList.remove('bkbg-drw-active'); });
                    btn.classList.add('bkbg-drw-active');
                    updateCursor();
                });
                toolbarEl.appendChild(btn);
                toolBtns[t.id] = btn;
            });

            // Separator
            var sep = document.createElement('div');
            sep.className = 'bkbg-drw-toolbar-sep';
            toolbarEl.appendChild(sep);

            // Palette
            var palette = document.createElement('div');
            palette.className = 'bkbg-drw-palette';

            var swatches = [];
            PRESET_PALETTE.forEach(function (hex) {
                var sw = document.createElement('div');
                sw.className = 'bkbg-drw-swatch' + (hex === color ? ' bkbg-drw-selected' : '');
                sw.style.background = hex;
                sw.title = hex;
                sw.addEventListener('click', function () {
                    color = hex;
                    swatches.forEach(function (s) { s.classList.remove('bkbg-drw-selected'); });
                    sw.classList.add('bkbg-drw-selected');
                    customColor.value = hex;
                });
                palette.appendChild(sw);
                swatches.push(sw);
            });

            // Custom color picker
            var customColor = document.createElement('input');
            customColor.type = 'color';
            customColor.className = 'bkbg-drw-custom-color';
            customColor.title = 'Custom color';
            customColor.value = color;
            customColor.addEventListener('input', function () {
                color = customColor.value;
                swatches.forEach(function (s) { s.classList.remove('bkbg-drw-selected'); });
            });
            palette.appendChild(customColor);
            toolbarEl.appendChild(palette);

            // Separator
            var sep2 = document.createElement('div');
            sep2.className = 'bkbg-drw-toolbar-sep';
            toolbarEl.appendChild(sep2);

            // Stroke width
            var strokeWrap = document.createElement('div');
            strokeWrap.className = 'bkbg-drw-stroke-wrap';
            var strokeLbl = document.createElement('span');
            strokeLbl.className = 'bkbg-drw-stroke-label';
            strokeLbl.textContent = 'Size';
            var strokeRange = document.createElement('input');
            strokeRange.type  = 'range';
            strokeRange.className = 'bkbg-drw-stroke-range';
            strokeRange.min   = 1;
            strokeRange.max   = 60;
            strokeRange.value = lineWidth;
            strokeRange.addEventListener('input', function () { lineWidth = parseInt(strokeRange.value, 10); });
            strokeWrap.appendChild(strokeLbl);
            strokeWrap.appendChild(strokeRange);
            toolbarEl.appendChild(strokeWrap);
        }

        // ---- Action buttons ----
        if (opts.showUndo !== false) {
            var undoBtn = document.createElement('button');
            undoBtn.className = 'bkbg-drw-btn';
            undoBtn.textContent = '↩ Undo';
            undoBtn.addEventListener('click', undo);
            actionsEl.appendChild(undoBtn);
        }

        var clearBtn = document.createElement('button');
        clearBtn.className = 'bkbg-drw-btn bkbg-drw-clear-btn';
        clearBtn.textContent = '🗑 Clear';
        clearBtn.addEventListener('click', function () {
            if (!confirm('Clear the canvas? This cannot be undone.')) return;
            saveHistory();
            initCanvas();
        });
        actionsEl.appendChild(clearBtn);

        if (opts.showDownload !== false) {
            var dlBtn = document.createElement('button');
            dlBtn.className = 'bkbg-drw-btn bkbg-drw-dl-btn';
            dlBtn.style.background = accent;
            dlBtn.textContent = '⬇ Download PNG';
            dlBtn.addEventListener('click', function () {
                canvas.toBlob(function (blob) {
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = 'drawing.png';
                    a.click();
                    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
                }, 'image/png');
            });
            actionsEl.appendChild(dlBtn);
        }

        updateCursor();
    }

    document.querySelectorAll('.bkbg-drw-app').forEach(function (root) {
        initBlock(root);
    });
})();
