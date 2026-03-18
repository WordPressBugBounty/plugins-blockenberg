(function () {
    'use strict';

    var typoMap = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        for (var i = 0; i < typoMap.length; i++) {
            var v = typo[typoMap[i][0]];
            if (v !== undefined && v !== '' && v !== null) el.style.setProperty(prefix + typoMap[i][1], String(v));
        }
    }

    var PRESETS = [
        { label: '1:1',        w: 400,  h: 400  },
        { label: '4:3',        w: 800,  h: 600  },
        { label: '16:9',       w: 1280, h: 720  },
        { label: '3:2',        w: 900,  h: 600  },
        { label: '2:3',        w: 400,  h: 600  },
        { label: '9:16',       w: 360,  h: 640  },
        { label: 'HD 1080p',   w: 1920, h: 1080 },
        { label: 'Social Sq.', w: 1080, h: 1080 }
    ];

    function drawPlaceholder(canvas, opts) {
        var w = opts.width, h = opts.height, bg = opts.bg, fg = opts.fg, text = opts.text, theme = opts.theme, accent = opts.accent;
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');

        /* Background */
        if (theme === 'gradient') {
            var grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, bg);
            grad.addColorStop(1, accent || '#999');
            ctx.fillStyle = grad;
        } else if (theme === 'pattern') {
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = accent ? accent + '33' : 'rgba(0,0,0,0.07)';
            var step = Math.round(Math.max(w, h) / 20);
            for (var y = -h; y < h * 2; y += step) {
                for (var x = -w; x < w * 2; x += step) {
                    ctx.fillRect(x, y, step / 2, step / 2);
                }
            }
        } else {
            ctx.fillStyle = bg;
        }
        ctx.fillRect(0, 0, w, h);

        /* Diagonal cross lines (like classic placeholder) */
        ctx.strokeStyle = fg + '22';
        ctx.lineWidth = Math.max(1, Math.round(Math.min(w, h) / 100));
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(w, h);
        ctx.moveTo(w, 0); ctx.lineTo(0, h);
        ctx.stroke();

        /* Border */
        ctx.strokeStyle = fg + '44';
        ctx.lineWidth = Math.max(2, Math.round(Math.min(w, h) / 80));
        ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);

        /* Text */
        var displayText = text || (w + ' × ' + h);
        var fontSize = Math.max(12, Math.min(Math.round(Math.min(w, h) / 8), 72));
        ctx.fillStyle = fg;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold ' + fontSize + 'px system-ui,Arial,sans-serif';

        /* Word wrap */
        var maxWidth = w * 0.8;
        var words = displayText.split(' ');
        var lines = [];
        var currentLine = '';
        words.forEach(function (word) {
            var testLine = currentLine ? currentLine + ' ' + word : word;
            if (ctx.measureText(testLine).width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) lines.push(currentLine);

        var lineH = fontSize * 1.3;
        var totalTextH = lines.length * lineH;
        var startY = (h - totalTextH) / 2 + lineH / 2;
        lines.forEach(function (line, i) {
            ctx.fillText(line, w / 2, startY + i * lineH);
        });

        /* Dimensions sub-label */
        if (text) {
            var subSize = Math.max(10, Math.round(fontSize * 0.5));
            ctx.font = subSize + 'px system-ui,Arial,sans-serif';
            ctx.fillStyle = fg + 'aa';
            ctx.fillText(w + ' × ' + h, w / 2, startY + lines.length * lineH + subSize);
        }
    }

    function initBlock(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }
        var a = opts;

        var state = {
            width:  a.defaultWidth  || 800,
            height: a.defaultHeight || 600,
            bg:     a.defaultBgColor  || '#cccccc',
            fg:     a.defaultTextColor || '#555555',
            text:   a.defaultText || '',
            theme:  a.defaultTheme || 'flat'
        };

        root.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-iph-wrap';
        wrap.style.cssText = 'background:' + a.sectionBg + ';max-width:' + a.contentMaxWidth + 'px;margin:0 auto;';
        typoCssVarsForEl(a.titleTypo, '--bkbg-iph-tt-', wrap);
        root.appendChild(wrap);

        if (a.showTitle) {
            var h = document.createElement('div');
            h.className = 'bkbg-iph-title';
            h.style.color = a.titleColor;
            h.textContent = a.title;
            wrap.appendChild(h);
        }

        /* Controls */
        var controls = document.createElement('div');
        controls.className = 'bkbg-iph-controls';
        controls.style.cssText = 'background:' + a.cardBg + ';border-color:' + a.borderColor + ';';
        wrap.appendChild(controls);

        function makeField(lbl, el) {
            var g = document.createElement('div');
            g.className = 'bkbg-iph-field';
            var l = document.createElement('label');
            l.className = 'bkbg-iph-label';
            l.style.color = a.labelColor;
            l.textContent = lbl;
            g.appendChild(l);
            g.appendChild(el);
            return g;
        }

        var wInput = document.createElement('input');
        wInput.className = 'bkbg-iph-input';
        wInput.type = 'number';
        wInput.min = '1'; wInput.max = '4000';
        wInput.value = state.width;
        controls.appendChild(makeField('Width (px)', wInput));

        var hInput = document.createElement('input');
        hInput.className = 'bkbg-iph-input';
        hInput.type = 'number';
        hInput.min = '1'; hInput.max = '4000';
        hInput.value = state.height;
        controls.appendChild(makeField('Height (px)', hInput));

        var textInput = document.createElement('input');
        textInput.className = 'bkbg-iph-input';
        textInput.style.minWidth = '150px';
        textInput.placeholder = 'Custom text (default: dimensions)';
        textInput.value = state.text;
        controls.appendChild(makeField('Custom Text', textInput));

        var bgField = document.createElement('div');
        bgField.className = 'bkbg-iph-field bkbg-iph-color-field';
        var bgLbl = document.createElement('label');
        bgLbl.className = 'bkbg-iph-label';
        bgLbl.style.color = a.labelColor;
        bgLbl.textContent = 'BG';
        var bgInput = document.createElement('input');
        bgInput.className = 'bkbg-iph-color-input';
        bgInput.type = 'color';
        bgInput.value = state.bg;
        bgField.appendChild(bgLbl);
        bgField.appendChild(bgInput);
        controls.appendChild(bgField);

        var fgField = document.createElement('div');
        fgField.className = 'bkbg-iph-field bkbg-iph-color-field';
        var fgLbl = document.createElement('label');
        fgLbl.className = 'bkbg-iph-label';
        fgLbl.style.color = a.labelColor;
        fgLbl.textContent = 'Text';
        var fgInput = document.createElement('input');
        fgInput.className = 'bkbg-iph-color-input';
        fgInput.type = 'color';
        fgInput.value = state.fg;
        fgField.appendChild(fgLbl);
        fgField.appendChild(fgInput);
        controls.appendChild(fgField);

        /* Presets */
        if (a.showAspectPresets) {
            var presetsEl = document.createElement('div');
            presetsEl.className = 'bkbg-iph-presets';
            wrap.appendChild(presetsEl);

            PRESETS.forEach(function (p) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-iph-preset-btn';
                btn.style.cssText = 'border-color:' + a.accentColor + ';color:' + a.accentColor + ';background:transparent;';
                btn.textContent = p.label + ' (' + p.w + '×' + p.h + ')';
                btn.addEventListener('click', function () {
                    state.width = p.w;
                    state.height = p.h;
                    wInput.value = p.w;
                    hInput.value = p.h;
                    render();
                });
                presetsEl.appendChild(btn);
            });
        }

        /* Theme selector */
        if (a.showThemeSelector) {
            var themeRow = document.createElement('div');
            themeRow.className = 'bkbg-iph-theme-row';
            wrap.appendChild(themeRow);

            ['flat','gradient','pattern'].forEach(function (t) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-iph-theme-btn';
                btn.textContent = t.charAt(0).toUpperCase() + t.slice(1);
                btn.dataset.theme = t;
                applyThemeBtnStyle(btn, t === state.theme);
                btn.addEventListener('click', function () {
                    state.theme = t;
                    themeRow.querySelectorAll('.bkbg-iph-theme-btn').forEach(function (b) {
                        applyThemeBtnStyle(b, b.dataset.theme === t);
                    });
                    render();
                });
                themeRow.appendChild(btn);
            });
        }

        function applyThemeBtnStyle(btn, active) {
            btn.style.cssText = 'border-color:' + a.accentColor + ';background:' + (active ? a.accentColor : 'transparent') + ';color:' + (active ? '#fff' : a.accentColor) + ';';
        }

        /* Canvas preview */
        var previewWrap = document.createElement('div');
        previewWrap.className = 'bkbg-iph-preview-wrap';
        wrap.appendChild(previewWrap);

        var canvasWrap = document.createElement('div');
        canvasWrap.className = 'bkbg-iph-canvas-wrap';
        previewWrap.appendChild(canvasWrap);

        var canvas = document.createElement('canvas');
        canvasWrap.appendChild(canvas);

        /* Dims label */
        var dimsEl = document.createElement('div');
        dimsEl.className = 'bkbg-iph-dims';
        dimsEl.style.color = a.subtitleColor;
        wrap.appendChild(dimsEl);

        /* Actions */
        var actionsEl = document.createElement('div');
        actionsEl.className = 'bkbg-iph-actions';
        wrap.appendChild(actionsEl);

        var urlBox = document.createElement('div');
        urlBox.className = 'bkbg-iph-url-box';
        var urlLbl = document.createElement('div');
        urlLbl.className = 'bkbg-iph-url-label';
        urlLbl.textContent = 'Data URI';
        urlBox.appendChild(urlLbl);
        var urlText = document.createElement('div');
        urlText.className = 'bkbg-iph-url-text';
        urlBox.appendChild(urlText);
        wrap.appendChild(urlBox);

        if (a.showDownloadBtn) {
            var dlBtn = document.createElement('button');
            dlBtn.className = 'bkbg-iph-btn';
            dlBtn.style.background = a.accentColor;
            dlBtn.textContent = '⬇ Download PNG';
            dlBtn.addEventListener('click', function () {
                var link = document.createElement('a');
                link.download = 'placeholder-' + state.width + 'x' + state.height + '.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
            actionsEl.appendChild(dlBtn);
        }

        if (a.showCopyUriBtn) {
            var copyUriBtn = document.createElement('button');
            copyUriBtn.className = 'bkbg-iph-btn bkbg-iph-btn-outline';
            copyUriBtn.style.cssText = 'border-color:' + a.accentColor + ';color:' + a.accentColor + ';';
            copyUriBtn.textContent = 'Copy Data URI';
            copyUriBtn.addEventListener('click', function () {
                var uri = canvas.toDataURL('image/png');
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(uri).then(function () {
                        copyUriBtn.textContent = '✓ Copied!';
                        setTimeout(function () { copyUriBtn.textContent = 'Copy Data URI'; }, 1800);
                    });
                }
                urlText.textContent = uri.slice(0, 200) + '…';
                urlBox.classList.add('bkbg-iph-show');
            });
            actionsEl.appendChild(copyUriBtn);
        }

        if (a.showCopyUrlBtn) {
            var copyUrlBtn = document.createElement('button');
            copyUrlBtn.className = 'bkbg-iph-btn bkbg-iph-btn-outline';
            copyUrlBtn.style.cssText = 'border-color:#6b7280;color:#6b7280;';
            copyUrlBtn.textContent = 'Copy URL';
            copyUrlBtn.title = 'Copies a placeholder.com style URL';
            copyUrlBtn.addEventListener('click', function () {
                var url = 'https://via.placeholder.com/' + state.width + 'x' + state.height;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(function () {
                        copyUrlBtn.textContent = '✓ Copied URL!';
                        setTimeout(function () { copyUrlBtn.textContent = 'Copy URL'; }, 1800);
                    });
                }
            });
            actionsEl.appendChild(copyUrlBtn);
        }

        function render() {
            var maxPreviewW = Math.min(state.width, wrap.offsetWidth - 48 || 600);
            var scale = maxPreviewW / state.width;
            var previewH = Math.round(state.height * scale);

            drawPlaceholder(canvas, {
                width: state.width, height: state.height,
                bg: state.bg, fg: state.fg,
                text: state.text, theme: state.theme,
                accent: a.accentColor
            });

            canvas.style.width = maxPreviewW + 'px';
            canvas.style.height = previewH + 'px';

            dimsEl.textContent = state.width + ' × ' + state.height + ' px';
        }

        /* Event listeners */
        [wInput, hInput, textInput].forEach(function (inp) {
            inp.addEventListener('input', function () {
                var wv = parseInt(wInput.value) || 1;
                var hv = parseInt(hInput.value) || 1;
                state.width  = Math.max(1, Math.min(wv, 4000));
                state.height = Math.max(1, Math.min(hv, 4000));
                state.text = textInput.value;
                render();
            });
        });

        bgInput.addEventListener('input', function () { state.bg = bgInput.value; render(); });
        fgInput.addEventListener('input', function () { state.fg = fgInput.value; render(); });

        render();
    }

    function init() {
        document.querySelectorAll('.bkbg-iph-app').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
