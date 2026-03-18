(function () {
    'use strict';

    var PRESETS = [
        { label:'Purple Dream', stops:'#6c3fb5 0%,#06b6d4 100%', type:'linear', angle:135 },
        { label:'Sunset',       stops:'#f97316 0%,#ef4444 50%,#a855f7 100%', type:'linear', angle:135 },
        { label:'Ocean',        stops:'#0ea5e9 0%,#10b981 100%', type:'linear', angle:135 },
        { label:'Midnight',     stops:'#1e1b4b 0%,#6c3fb5 50%,#0ea5e9 100%', type:'linear', angle:225 },
        { label:'Peach',        stops:'#f9a8d4 0%,#fed7aa 100%', type:'linear', angle:90 },
        { label:'Radial Burst', stops:'#fde68a 0%,#f97316 60%,#ef4444 100%', type:'radial', angle:135 },
        { label:'Forest',       stops:'#064e3b 0%,#10b981 100%', type:'linear', angle:135 },
        { label:'Rose Gold',    stops:'#fda4af 0%,#fb7185 40%,#f43f5e 100%', type:'linear', angle:135 }
    ];

    function parseStops(str) {
        return (str || '#6c3fb5 0%,#06b6d4 100%').split(',').map(function(s) {
            s = s.trim();
            var parts = s.match(/^(#[\w]+|rgba?\([^)]+\))\s+(\d+%?)$/);
            if (parts) return { color: parts[1], pos: parts[2] };
            return { color: s, pos: '' };
        });
    }

    function buildGradient(type, angle, stops) {
        var stopStr = stops.map(function(s) { return s.color + (s.pos ? ' ' + s.pos : ''); }).join(', ');
        if (type === 'radial') return 'radial-gradient(circle, ' + stopStr + ')';
        if (type === 'conic')  return 'conic-gradient(from ' + angle + 'deg, ' + stopStr + ')';
        return 'linear-gradient(' + angle + 'deg, ' + stopStr + ')';
    }

    function initGradientGenerator(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) { opts = {}; }

        function typoCssVarsForEl(typo, prefix, el) {
            if (!typo || typeof typo !== 'object') return;
            var map = {
                family:'font-family', weight:'font-weight', style:'font-style',
                decoration:'text-decoration', transform:'text-transform',
                sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
                lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
                letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
                wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
            };
            Object.keys(map).forEach(function(k) {
                if (typo[k] !== undefined && typo[k] !== '') {
                    var v = typo[k];
                    if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) v = v + (typo.sizeUnit || 'px');
                    else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) v = v + (typo.lineHeightUnit || '');
                    else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) v = v + (typo.letterSpacingUnit || 'px');
                    else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) v = v + (typo.wordSpacingUnit || 'px');
                    el.style.setProperty(prefix + map[k], String(v));
                }
            });
        }

        var accent        = opts.accentColor    || '#6c3fb5';
        var cardBg        = opts.cardBg         || '#ffffff';
        var controlsBg    = opts.controlsBg     || '#f9fafb';
        var controlsBorder= opts.controlsBorder || '#e5e7eb';
        var cssBg         = opts.cssBg          || '#1e1b4b';
        var cssColor      = opts.cssColor        || '#c4b5fd';
        var copyBg        = opts.copyBg          || accent;
        var copyColor     = opts.copyColor       || '#ffffff';
        var labelColor    = opts.labelColor      || '#374151';
        var titleColor    = opts.titleColor      || '';
        var subtitleColor = opts.subtitleColor   || '';
        var sectionBg     = opts.sectionBg       || '';

        var paddingTop    = (opts.paddingTop    != null ? opts.paddingTop    : 60) + 'px';
        var paddingBottom = (opts.paddingBottom != null ? opts.paddingBottom : 60) + 'px';
        var maxWidth      = (opts.maxWidth      || 600) + 'px';
        var cardRadius    = (opts.cardRadius    || 16)  + 'px';
        var previewRadius = (opts.previewRadius || 12)  + 'px';
        var previewHeight = (opts.previewHeight || 200) + 'px';
        var titleSize     = (opts.titleSize     || 28)  + 'px';

        var showPresets    = opts.showPresets    !== false;
        var showCssOutput  = opts.showCssOutput  !== false;
        var showTitle      = opts.showTitle      && opts.title;
        var showSubtitle   = opts.showSubtitle   && opts.subtitle;

        // State
        var state = {
            type:  opts.defaultType  || 'linear',
            angle: opts.defaultAngle != null ? opts.defaultAngle : 135,
            stops: parseStops(opts.defaultStops)
        };

        // Build initial HTML
        app.style.paddingTop    = paddingTop;
        app.style.paddingBottom = paddingBottom;
        if (sectionBg) app.style.background = sectionBg;

        typoCssVarsForEl(opts.typoTitle, '--bkbg-gg-tt-', app);
        typoCssVarsForEl(opts.typoBody,  '--bkbg-gg-bd-', app);

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-gg-wrap';
        wrap.style.cssText = 'background:' + cardBg + ';border-radius:' + cardRadius + ';max-width:' + maxWidth;
        app.appendChild(wrap);

        // Header
        if (showTitle || showSubtitle) {
            var header = document.createElement('div');
            header.className = 'bkbg-gg-header';
            if (showTitle) {
                var h = document.createElement('div');
                h.className = 'bkbg-gg-title';
                h.style.cssText = (titleColor ? 'color:' + titleColor : '');
                h.textContent = opts.title;
                header.appendChild(h);
            }
            if (showSubtitle) {
                var sub = document.createElement('div');
                sub.className = 'bkbg-gg-subtitle';
                if (subtitleColor) sub.style.color = subtitleColor;
                sub.textContent = opts.subtitle;
                header.appendChild(sub);
            }
            wrap.appendChild(header);
        }

        // Preview swatch
        var preview = document.createElement('div');
        preview.className = 'bkbg-gg-preview';
        preview.style.height = previewHeight;
        preview.style.borderRadius = previewRadius;
        wrap.appendChild(preview);

        // Controls box
        var controls = document.createElement('div');
        controls.className = 'bkbg-gg-controls';
        controls.style.cssText = 'background:' + controlsBg + ';border:1.5px solid ' + controlsBorder;
        wrap.appendChild(controls);

        // Type + angle row
        var typeRow = document.createElement('div');
        typeRow.className = 'bkbg-gg-type-row';
        controls.appendChild(typeRow);

        var typeGroup = document.createElement('div');
        var typeLabel = document.createElement('label');
        typeLabel.className = 'bkbg-gg-label';
        typeLabel.style.color = labelColor;
        typeLabel.textContent = 'Type';
        var typeSelect = document.createElement('select');
        typeSelect.className = 'bkbg-gg-select';
        typeSelect.style.cssText = 'border:1.5px solid ' + controlsBorder;
        ['linear','radial','conic'].forEach(function(t) {
            var o = document.createElement('option');
            o.value = t; o.textContent = t.charAt(0).toUpperCase() + t.slice(1);
            typeSelect.appendChild(o);
        });
        typeSelect.value = state.type;
        typeGroup.appendChild(typeLabel);
        typeGroup.appendChild(typeSelect);
        typeRow.appendChild(typeGroup);

        var angleGroup = document.createElement('div');
        angleGroup.id = 'bkbg-gg-angle-group';
        var angleLabel = document.createElement('label');
        angleLabel.className = 'bkbg-gg-label';
        angleLabel.style.color = labelColor;
        angleLabel.textContent = 'Angle';
        var angleRow = document.createElement('div');
        angleRow.className = 'bkbg-gg-angle-row';
        var angleSlider = document.createElement('input');
        angleSlider.type = 'range'; angleSlider.min = 0; angleSlider.max = 360; angleSlider.step = 5;
        angleSlider.value = state.angle;
        var angleVal = document.createElement('span');
        angleVal.className = 'bkbg-gg-angle-val';
        angleVal.textContent = state.angle + '°';
        angleRow.appendChild(angleSlider);
        angleRow.appendChild(angleVal);
        angleGroup.appendChild(angleLabel);
        angleGroup.appendChild(angleRow);
        typeRow.appendChild(angleGroup);
        if (state.type === 'radial') angleGroup.style.display = 'none';

        // Stops container
        var stopsContainer = document.createElement('div');
        stopsContainer.className = 'bkbg-gg-stops';
        controls.appendChild(stopsContainer);

        function createStopRow(idx) {
            var row = document.createElement('div');
            row.className = 'bkbg-gg-stop-row';
            row.dataset.idx = idx;

            var swatch = document.createElement('input');
            swatch.type = 'color';
            swatch.className = 'bkbg-gg-color-swatch';
            swatch.style.cssText = 'background:' + state.stops[idx].color;
            swatch.value = state.stops[idx].color;

            var colorText = document.createElement('input');
            colorText.type = 'text';
            colorText.className = 'bkbg-gg-input-text bkbg-gg-input-color';
            colorText.style.cssText = 'border:1.5px solid ' + controlsBorder;
            colorText.value = state.stops[idx].color;
            colorText.placeholder = '#rrggbb';

            var posInput = document.createElement('input');
            posInput.type = 'text';
            posInput.className = 'bkbg-gg-input-text bkbg-gg-input-pos';
            posInput.style.cssText = 'border:1.5px solid ' + controlsBorder;
            posInput.value = state.stops[idx].pos;
            posInput.placeholder = '0%';

            var removeBtn = document.createElement('button');
            removeBtn.className = 'bkbg-gg-btn-remove';
            removeBtn.textContent = '×';
            removeBtn.disabled = state.stops.length <= 2;

            swatch.addEventListener('input', function() {
                state.stops[idx].color = swatch.value;
                colorText.value = swatch.value;
                refresh();
            });
            colorText.addEventListener('input', function() {
                state.stops[idx].color = colorText.value;
                if (/^#[0-9a-fA-F]{6}$/.test(colorText.value)) swatch.value = colorText.value;
                refresh();
            });
            posInput.addEventListener('input', function() {
                state.stops[idx].pos = posInput.value;
                refresh();
            });
            removeBtn.addEventListener('click', function() {
                if (state.stops.length <= 2) return;
                state.stops.splice(idx, 1);
                renderStops();
                refresh();
            });

            row.appendChild(swatch);
            row.appendChild(colorText);
            row.appendChild(posInput);
            row.appendChild(removeBtn);
            return row;
        }

        function renderStops() {
            stopsContainer.innerHTML = '';
            state.stops.forEach(function(_, i) {
                stopsContainer.appendChild(createStopRow(i));
            });
        }
        renderStops();

        // Add stop button
        var addBtn = document.createElement('button');
        addBtn.className = 'bkbg-gg-btn-add';
        addBtn.style.cssText = 'color:' + accent + ';border-color:' + controlsBorder;
        addBtn.textContent = '+ Add Color Stop';
        addBtn.addEventListener('click', function() {
            if (state.stops.length >= 5) return;
            state.stops.push({ color: '#ffffff', pos: '100%' });
            renderStops();
            refresh();
        });
        controls.appendChild(addBtn);

        // Presets
        if (showPresets) {
            var presetsSection = document.createElement('div');
            presetsSection.className = 'bkbg-gg-presets-section';
            var presetsHdr = document.createElement('div');
            presetsHdr.className = 'bkbg-gg-presets-label';
            presetsHdr.style.color = labelColor;
            presetsHdr.textContent = 'Presets';
            presetsSection.appendChild(presetsHdr);
            var presetsGrid = document.createElement('div');
            presetsGrid.className = 'bkbg-gg-presets-grid';
            PRESETS.forEach(function(p) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-gg-preset-btn';
                var sw = document.createElement('div');
                sw.className = 'bkbg-gg-preset-swatch';
                sw.style.background = buildGradient(p.type, p.angle, parseStops(p.stops));
                var nm = document.createElement('span');
                nm.className = 'bkbg-gg-preset-name';
                nm.textContent = p.label;
                btn.appendChild(sw);
                btn.appendChild(nm);
                btn.addEventListener('click', function() {
                    state.stops = parseStops(p.stops);
                    state.type  = p.type;
                    state.angle = p.angle;
                    typeSelect.value = p.type;
                    angleSlider.value = p.angle;
                    angleVal.textContent = p.angle + '°';
                    angleGroup.style.display = (p.type === 'radial') ? 'none' : '';
                    renderStops();
                    refresh();
                });
                presetsGrid.appendChild(btn);
            });
            presetsSection.appendChild(presetsGrid);
            wrap.appendChild(presetsSection);
        }

        // CSS output
        var cssCode, copyBtn;
        if (showCssOutput) {
            var cssSection = document.createElement('div');
            cssSection.className = 'bkbg-gg-css-section';
            var cssBlock = document.createElement('div');
            cssBlock.className = 'bkbg-gg-css-block';
            cssBlock.style.cssText = 'background:' + cssBg + ';color:' + cssColor;
            cssCode = document.createElement('span');
            cssBlock.appendChild(cssCode);
            copyBtn = document.createElement('button');
            copyBtn.className = 'bkbg-gg-copy-btn';
            copyBtn.style.cssText = 'background:' + copyBg + ';color:' + copyColor;
            copyBtn.textContent = 'Copy CSS';
            copyBtn.addEventListener('click', function() {
                var text = 'background: ' + buildGradient(state.type, state.angle, state.stops) + ';';
                try {
                    navigator.clipboard.writeText(text).then(function() {
                        copyBtn.textContent = '✓ Copied!';
                        copyBtn.style.background = '#10b981';
                        setTimeout(function() { copyBtn.textContent = 'Copy CSS'; copyBtn.style.background = copyBg; }, 1500);
                    });
                } catch(e) {}
            });
            cssSection.appendChild(cssBlock);
            cssSection.appendChild(copyBtn);
            wrap.appendChild(cssSection);
        }

        // Wire type and angle controls
        typeSelect.addEventListener('change', function() {
            state.type = typeSelect.value;
            angleGroup.style.display = (state.type === 'radial') ? 'none' : '';
            refresh();
        });
        angleSlider.addEventListener('input', function() {
            state.angle = parseInt(angleSlider.value);
            angleVal.textContent = state.angle + '°';
            refresh();
        });

        function refresh() {
            var g = buildGradient(state.type, state.angle, state.stops);
            preview.style.background = g;
            if (cssCode) cssCode.textContent = 'background: ' + g + ';';
        }

        refresh();
    }

    document.querySelectorAll('.bkbg-gg-app').forEach(initGradientGenerator);
})();
