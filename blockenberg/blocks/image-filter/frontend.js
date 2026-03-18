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

    var PRESETS = {
        none:     { brightness: 100, contrast: 100, saturation: 100, hueRotate: 0,   blur: 0, sepia: 0,  grayscale: 0,  invert: 0, opacity: 100 },
        vivid:    { brightness: 105, contrast: 120, saturation: 150, hueRotate: 0,   blur: 0, sepia: 0,  grayscale: 0,  invert: 0, opacity: 100 },
        dramatic: { brightness: 90,  contrast: 140, saturation: 110, hueRotate: 0,   blur: 0, sepia: 0,  grayscale: 0,  invert: 0, opacity: 100 },
        vintage:  { brightness: 105, contrast: 95,  saturation: 75,  hueRotate: 0,   blur: 0, sepia: 40, grayscale: 15, invert: 0, opacity: 95 },
        noir:     { brightness: 100, contrast: 125, saturation: 0,   hueRotate: 0,   blur: 0, sepia: 0,  grayscale: 100,invert: 0, opacity: 100 },
        warm:     { brightness: 108, contrast: 100, saturation: 110, hueRotate: 20,  blur: 0, sepia: 20, grayscale: 0,  invert: 0, opacity: 100 },
        cool:     { brightness: 103, contrast: 105, saturation: 95,  hueRotate: -30, blur: 0, sepia: 0,  grayscale: 10, invert: 0, opacity: 100 },
        faded:    { brightness: 112, contrast: 78,  saturation: 60,  hueRotate: 0,   blur: 0, sepia: 15, grayscale: 10, invert: 0, opacity: 90 },
        cinema:   { brightness: 88,  contrast: 130, saturation: 85,  hueRotate: 0,   blur: 0, sepia: 8,  grayscale: 0,  invert: 0, opacity: 100 },
        matte:    { brightness: 110, contrast: 85,  saturation: 70,  hueRotate: 0,   blur: 0, sepia: 10, grayscale: 5,  invert: 0, opacity: 88 },
        duotone:  { brightness: 100, contrast: 120, saturation: 0,   hueRotate: 0,   blur: 0, sepia: 60, grayscale: 40, invert: 0, opacity: 100 },
        highkey:  { brightness: 145, contrast: 80,  saturation: 80,  hueRotate: 0,   blur: 0, sepia: 0,  grayscale: 0,  invert: 0, opacity: 100 },
        lowkey:   { brightness: 55,  contrast: 130, saturation: 100, hueRotate: 0,   blur: 0, sepia: 0,  grayscale: 0,  invert: 0, opacity: 100 },
        neonpop:  { brightness: 110, contrast: 130, saturation: 200, hueRotate: 45,  blur: 0, sepia: 0,  grayscale: 0,  invert: 0, opacity: 100 }
    };

    var SLIDER_CONFIG = [
        { key: 'brightness', label: 'Brightness', min: 0,    max: 300, unit: '%' },
        { key: 'contrast',   label: 'Contrast',   min: 0,    max: 300, unit: '%' },
        { key: 'saturation', label: 'Saturation', min: 0,    max: 400, unit: '%' },
        { key: 'hueRotate',  label: 'Hue Rotate', min: -180, max: 180, unit: '°' },
        { key: 'blur',       label: 'Blur',       min: 0,    max: 20,  unit: 'px' },
        { key: 'sepia',      label: 'Sepia',      min: 0,    max: 100, unit: '%' },
        { key: 'grayscale',  label: 'Grayscale',  min: 0,    max: 100, unit: '%' },
        { key: 'invert',     label: 'Invert',     min: 0,    max: 100, unit: '%' },
        { key: 'opacity',    label: 'Opacity',    min: 0,    max: 100, unit: '%' }
    ];

    function buildFilterString(values) {
        var parts = [];
        if (values.brightness  !== 100) parts.push('brightness(' + values.brightness + '%)');
        if (values.contrast    !== 100) parts.push('contrast(' + values.contrast + '%)');
        if (values.saturation  !== 100) parts.push('saturate(' + values.saturation + '%)');
        if (values.hueRotate   !== 0)   parts.push('hue-rotate(' + values.hueRotate + 'deg)');
        if (values.blur        !== 0)   parts.push('blur(' + values.blur + 'px)');
        if (values.sepia       !== 0)   parts.push('sepia(' + values.sepia + '%)');
        if (values.grayscale   !== 0)   parts.push('grayscale(' + values.grayscale + '%)');
        if (values.invert      !== 0)   parts.push('invert(' + values.invert + '%)');
        if (values.opacity     !== 100) parts.push('opacity(' + values.opacity + '%)');
        return parts.length ? parts.join(' ') : 'none';
    }

    function initImageFilter(appEl) {
        var raw = appEl.dataset.opts;
        if (!raw) return;
        var opts;
        try { opts = JSON.parse(raw); } catch (e) { return; }

        if (!opts.imageUrl) { appEl.remove(); return; }

        var defaults = {
            brightness: opts.brightness, contrast: opts.contrast,
            saturation: opts.saturation, hueRotate: opts.hueRotate,
            blur:       opts.blur,       sepia:     opts.sepia,
            grayscale:  opts.grayscale,  invert:    opts.invert,
            opacity:    opts.opacity
        };
        var current = Object.assign({}, defaults);

        // Build wrapper
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-if-wrap';
        typoCssVarsForEl(opts.captionTypo, '--bkbg-if-cp-', wrap);

        // Figure
        var figure = document.createElement('figure');
        figure.className = 'bkbg-if-figure';
        figure.style.borderRadius = (opts.borderRadius || 12) + 'px';
        figure.style.overflow = 'hidden';
        if (opts.maxWidth) {
            figure.style.maxWidth  = opts.maxWidth + 'px';
            figure.style.marginLeft  = 'auto';
            figure.style.marginRight = 'auto';
        }
        if (opts.borderColor) {
            figure.style.border = '2px solid ' + opts.borderColor;
        }

        var img = document.createElement('img');
        img.src = opts.imageUrl;
        img.alt = opts.imageAlt || '';
        img.style.display = 'block';
        img.style.width = '100%';
        img.style.borderRadius = (opts.borderRadius || 12) + 'px';
        if (opts.imageHeight) img.style.height = opts.imageHeight + 'px';
        if (opts.objectFit)   img.style.objectFit = opts.objectFit;
        if (opts.blendMode && opts.blendMode !== 'normal') img.style.mixBlendMode = opts.blendMode;
        img.style.transition = 'filter ' + (opts.transitionMs || 300) + 'ms ease';
        img.style.filter = buildFilterString(defaults);
        figure.appendChild(img);

        if (opts.overlayColor && opts.overlayOpacity > 0) {
            var overlay = document.createElement('div');
            overlay.className = 'bkbg-if-overlay';
            overlay.style.background = opts.overlayColor;
            overlay.style.opacity = opts.overlayOpacity / 100;
            overlay.style.borderRadius = (opts.borderRadius || 12) + 'px';
            figure.appendChild(overlay);
        }

        if (opts.caption) {
            var figcap = document.createElement('figcaption');
            figcap.className = 'bkbg-if-caption';
            figcap.textContent = opts.caption;
            figcap.style.color = opts.captionColor || '#555';
            if (opts.captionBg) figcap.style.background = opts.captionBg;
            figure.appendChild(figcap);
        }

        wrap.appendChild(figure);

        // Interactive controls
        if (opts.showControls) {
            var controls = document.createElement('div');
            controls.className = 'bkbg-if-controls';

            var top = document.createElement('div');
            top.className = 'bkbg-if-controls-top';

            var heading = document.createElement('h4');
            heading.textContent = 'Filter Controls';
            top.appendChild(heading);

            var rightTools = document.createElement('div');
            rightTools.style.display = 'flex';
            rightTools.style.gap = '8px';
            rightTools.style.alignItems = 'center';

            if (opts.showPresets) {
                var presetSel = document.createElement('select');
                presetSel.className = 'bkbg-if-preset-select';
                [
                    ['none', 'None'],['vivid','Vivid'],['dramatic','Dramatic'],['vintage','Vintage'],
                    ['noir','Noir'],['warm','Warm Glow'],['cool','Cool Ice'],['faded','Faded'],
                    ['cinema','Cinema'],['matte','Matte'],['duotone','Duotone'],['highkey','High Key'],
                    ['lowkey','Low Key'],['neonpop','Neon Pop']
                ].forEach(function (p) {
                    var opt = document.createElement('option');
                    opt.value = p[0];
                    opt.textContent = p[1];
                    if (p[0] === opts.preset) opt.selected = true;
                    presetSel.appendChild(opt);
                });
                presetSel.addEventListener('change', function () {
                    var p = PRESETS[presetSel.value];
                    if (!p) return;
                    Object.assign(current, p);
                    applyFilter();
                    updateSliders();
                });
                rightTools.appendChild(presetSel);
            }

            if (opts.showReset) {
                var resetBtn = document.createElement('button');
                resetBtn.className = 'bkbg-if-reset-btn';
                resetBtn.textContent = 'Reset';
                resetBtn.addEventListener('click', function () {
                    Object.assign(current, defaults);
                    applyFilter();
                    updateSliders();
                    if (opts.showPresets) presetSel.value = opts.preset || 'none';
                });
                rightTools.appendChild(resetBtn);
            }

            top.appendChild(rightTools);
            controls.appendChild(top);

            // Sliders
            var sliderGrid = document.createElement('div');
            sliderGrid.className = 'bkbg-if-sliders';

            var sliderEls = {};
            var valEls = {};

            SLIDER_CONFIG.forEach(function (cfg) {
                var row = document.createElement('div');
                row.className = 'bkbg-if-slider-row';

                var labelRow = document.createElement('div');
                labelRow.className = 'bkbg-if-slider-label';

                var lbl = document.createElement('span');
                lbl.textContent = cfg.label;
                labelRow.appendChild(lbl);

                var valEl = document.createElement('span');
                valEl.textContent = current[cfg.key] + cfg.unit;
                valEls[cfg.key] = valEl;
                labelRow.appendChild(valEl);
                row.appendChild(labelRow);

                var slider = document.createElement('input');
                slider.type = 'range';
                slider.className = 'bkbg-if-slider';
                slider.min = cfg.min;
                slider.max = cfg.max;
                slider.step = 1;
                slider.value = current[cfg.key];
                sliderEls[cfg.key] = slider;

                slider.addEventListener('input', function () {
                    current[cfg.key] = parseFloat(slider.value);
                    valEl.textContent = current[cfg.key] + cfg.unit;
                    applyFilter();
                    if (opts.showPresets) presetSel.value = 'none';
                });

                row.appendChild(slider);
                sliderGrid.appendChild(row);
            });

            controls.appendChild(sliderGrid);
            wrap.appendChild(controls);

            function updateSliders() {
                SLIDER_CONFIG.forEach(function (cfg) {
                    sliderEls[cfg.key].value = current[cfg.key];
                    valEls[cfg.key].textContent = current[cfg.key] + cfg.unit;
                });
            }
        }

        function applyFilter() {
            img.style.filter = buildFilterString(current);
        }

        appEl.parentNode.replaceChild(wrap, appEl);
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-if-app').forEach(initImageFilter);
    });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        document.querySelectorAll('.bkbg-if-app').forEach(initImageFilter);
    }
})();
