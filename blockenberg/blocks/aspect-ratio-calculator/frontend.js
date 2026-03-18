(function () {
    'use strict';

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

    var PRESETS = [
        {label:'16:9',  w:1920, h:1080, note:'HD / Widescreen'},
        {label:'4:3',   w:1024, h:768,  note:'Traditional'},
        {label:'1:1',   w:1080, h:1080, note:'Square / Instagram'},
        {label:'9:16',  w:1080, h:1920, note:'Portrait / Stories'},
        {label:'21:9',  w:2560, h:1080, note:'Ultrawide'},
        {label:'4:5',   w:1080, h:1350, note:'Portrait social'},
        {label:'3:2',   w:1500, h:1000, note:'DSLR / Photography'},
        {label:'2:1',   w:2000, h:1000, note:'Panoramic'}
    ];

    function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

    function getRatio(w, h) {
        var wi = Math.round(w); var hi = Math.round(h);
        if (!wi || !hi) return '—';
        var g = gcd(wi, hi);
        return (wi / g) + ':' + (hi / g);
    }

    function getMegapixels(w, h) {
        return ((parseFloat(w) || 0) * (parseFloat(h) || 0) / 1000000).toFixed(2);
    }

    function getOrientation(w, h) {
        if (w > h) return 'Landscape';
        if (h > w) return 'Portrait';
        return 'Square';
    }

    function getPreviewSize(w, h) {
        var maxW = 240, maxH = 160;
        var pw = maxW, ph = h > 0 ? Math.round(maxW * h / w) : maxH;
        if (ph > maxH) { ph = maxH; pw = w > 0 ? Math.round(maxH * w / h) : maxW; }
        if (pw < 4) pw = 4;
        if (ph < 4) ph = 4;
        return {w: pw, h: ph};
    }

    function initBlock(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) {}

        var defaultWidth  = parseInt(opts.defaultWidth)  || 1920;
        var defaultHeight = parseInt(opts.defaultHeight) || 1080;
        var accent        = opts.accentColor    || '#6c3fb5';
        var ratioBg       = opts.ratioBg        || accent;
        var ratioColor    = opts.ratioColor     || '#fff';
        var previewBg     = opts.previewBg      || '#ede9fe';
        var previewBorder = opts.previewBorder  || accent;
        var presetActiveBg    = opts.presetActiveBg    || accent;
        var presetActiveColor = opts.presetActiveColor || '#fff';
        var statBg    = opts.statBg    || '#f3f4f6';
        var statBorder= opts.statBorder|| '#e5e7eb';
        var inputBorder = opts.inputBorder || '#e5e7eb';
        var labelColor  = opts.labelColor  || '#374151';
        var cardRadius  = (opts.cardRadius  !== undefined ? opts.cardRadius  : 16) + 'px';
        var inputRadius = (opts.inputRadius !== undefined ? opts.inputRadius : 8)  + 'px';
        var ratioSize   = (opts.ratioSize   !== undefined ? opts.ratioSize   : 44) + 'px';
        var showPresets = opts.showPresets !== false;
        var showRatioDisplay = opts.showRatioDisplay !== false;
        var showPreview = opts.showPreview !== false;

        var state = {w: defaultWidth, h: defaultHeight, newW: '', newH: ''};

        // Build DOM
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-arc-wrap';
        wrap.style.borderRadius = cardRadius;
        wrap.style.setProperty('--bkbg-arc-title-sz', (opts.titleSize || 28) + 'px');
        wrap.style.setProperty('--bkbg-arc-ratio-sz', (opts.ratioSize || 44) + 'px');
        typoCssVarsForEl(opts.titleTypo, '--bkbg-arc-title-', wrap);
        typoCssVarsForEl(opts.ratioTypo, '--bkbg-arc-ratio-', wrap);
        app.appendChild(wrap);

        // Header
        if (opts.showTitle || opts.showSubtitle) {
            var hdr = document.createElement('div');
            hdr.className = 'bkbg-arc-header';
            if (opts.showTitle && opts.title) {
                var t = document.createElement('div');
                t.className = 'bkbg-arc-title';
                if (opts.titleColor) t.style.color = opts.titleColor;
                t.textContent = opts.title;
                hdr.appendChild(t);
            }
            if (opts.showSubtitle && opts.subtitle) {
                var s = document.createElement('div');
                s.className = 'bkbg-arc-subtitle';
                if (opts.subtitleColor) s.style.color = opts.subtitleColor;
                s.textContent = opts.subtitle;
                hdr.appendChild(s);
            }
            wrap.appendChild(hdr);
        }

        // Presets
        var presetBtns = [];
        if (showPresets) {
            var presetsRow = document.createElement('div');
            presetsRow.className = 'bkbg-arc-presets-row';
            var presetsLbl = document.createElement('label');
            presetsLbl.className = 'bkbg-arc-label';
            presetsLbl.style.color = labelColor;
            presetsLbl.textContent = 'Common Presets';
            presetsRow.appendChild(presetsLbl);
            var presetsWrap = document.createElement('div');
            presetsWrap.className = 'bkbg-arc-presets';
            PRESETS.forEach(function (p) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-arc-preset';
                btn.type = 'button';
                btn.dataset.w = p.w;
                btn.dataset.h = p.h;
                btn.textContent = p.label + ' – ' + p.note;
                btn.style.setProperty('--arc-preset-active-bg', presetActiveBg);
                btn.style.setProperty('--arc-preset-active-color', presetActiveColor);
                btn.addEventListener('click', function () {
                    state.w = p.w; state.h = p.h;
                    state.newW = ''; state.newH = '';
                    inW.value = p.w; inH.value = p.h;
                    scaleW.value = ''; scaleH.value = '';
                    update();
                });
                presetsWrap.appendChild(btn);
                presetBtns.push({btn:btn, p:p});
            });
            presetsRow.appendChild(presetsWrap);
            wrap.appendChild(presetsRow);
        }

        // Inputs
        var grid2 = document.createElement('div');
        grid2.className = 'bkbg-arc-grid2';

        function makeField(lbl, dflt) {
            var cell = document.createElement('div');
            var label = document.createElement('label');
            label.className = 'bkbg-arc-label';
            label.style.color = labelColor;
            label.textContent = lbl;
            var input = document.createElement('input');
            input.type = 'number';
            input.className = 'bkbg-arc-input';
            input.style.borderColor = inputBorder;
            input.style.borderRadius = inputRadius;
            input.value = dflt;
            input.min = 1;
            cell.appendChild(label); cell.appendChild(input);
            grid2.appendChild(cell);
            return input;
        }

        var inW = makeField('Original Width (px)', defaultWidth);
        var inH = makeField('Original Height (px)', defaultHeight);
        wrap.appendChild(grid2);

        // Ratio display
        var ratioCard, ratioNum, mpNum;
        if (showRatioDisplay) {
            ratioCard = document.createElement('div');
            ratioCard.className = 'bkbg-arc-ratio-card';
            ratioCard.style.background = ratioBg;
            ratioCard.style.color = ratioColor;

            var leftCol = document.createElement('div');
            leftCol.style.textAlign = 'center';
            ratioNum = document.createElement('div');
            ratioNum.className = 'bkbg-arc-ratio-num';
            ratioNum.textContent = getRatio(defaultWidth, defaultHeight);
            var ratioLbl = document.createElement('div');
            ratioLbl.className = 'bkbg-arc-ratio-lbl';
            ratioLbl.textContent = 'Aspect Ratio';
            leftCol.appendChild(ratioNum); leftCol.appendChild(ratioLbl);

            var sep = document.createElement('div');
            sep.className = 'bkbg-arc-ratio-sep';

            var rightCol = document.createElement('div');
            rightCol.style.textAlign = 'center';
            mpNum = document.createElement('div');
            mpNum.className = 'bkbg-arc-mp-num';
            mpNum.textContent = getMegapixels(defaultWidth, defaultHeight) + 'MP';
            var mpLbl = document.createElement('div');
            mpLbl.className = 'bkbg-arc-ratio-lbl';
            mpLbl.textContent = 'Megapixels';
            rightCol.appendChild(mpNum); rightCol.appendChild(mpLbl);

            ratioCard.appendChild(leftCol);
            ratioCard.appendChild(sep);
            ratioCard.appendChild(rightCol);
            wrap.appendChild(ratioCard);
        }

        // Scale calculator
        var scaleW, scaleH, scaleResult;
        var scaleBox = document.createElement('div');
        scaleBox.className = 'bkbg-arc-scale-box';
        scaleBox.style.background = statBg;
        scaleBox.style.borderColor = statBorder;
        var scaleTitle = document.createElement('div');
        scaleTitle.className = 'bkbg-arc-scale-title';
        scaleTitle.style.color = labelColor;
        scaleTitle.textContent = '🔗 Proportional Resize';
        scaleBox.appendChild(scaleTitle);

        var scaleGrid = document.createElement('div');
        scaleGrid.className = 'bkbg-arc-scale-grid';

        function makeScaleField(lbl, ref) {
            var cell = document.createElement('div');
            var label = document.createElement('label');
            label.className = 'bkbg-arc-label';
            label.style.color = labelColor;
            label.textContent = lbl;
            var input = document.createElement('input');
            input.type = 'number';
            input.className = 'bkbg-arc-input';
            input.style.borderColor = inputBorder;
            input.style.borderRadius = inputRadius;
            input.placeholder = 'e.g. ' + ref;
            input.min = 1;
            cell.appendChild(label); cell.appendChild(input);
            return {cell: cell, input: input};
        }

        var swf = makeScaleField('New Width', '800');
        scaleW = swf.input;
        var scaleSep = document.createElement('div');
        scaleSep.className = 'bkbg-arc-scale-sep';
        scaleSep.textContent = '↔';
        var shf = makeScaleField('New Height', '450');
        scaleH = shf.input;
        scaleGrid.appendChild(swf.cell); scaleGrid.appendChild(scaleSep); scaleGrid.appendChild(shf.cell);
        scaleBox.appendChild(scaleGrid);

        scaleResult = document.createElement('div');
        scaleResult.className = 'bkbg-arc-scale-result';
        scaleResult.style.color = accent;
        scaleResult.style.display = 'none';
        scaleBox.appendChild(scaleResult);
        wrap.appendChild(scaleBox);

        // Preview
        var previewBox;
        if (showPreview) {
            var previewWrap = document.createElement('div');
            previewWrap.className = 'bkbg-arc-preview-wrap';
            previewWrap.style.background = statBg;
            previewWrap.style.borderColor = statBorder;
            previewBox = document.createElement('div');
            previewBox.className = 'bkbg-arc-preview-box';
            previewBox.style.background = previewBg;
            previewBox.style.borderColor = previewBorder;
            previewBox.style.color = previewBorder;
            previewWrap.appendChild(previewBox);
            wrap.appendChild(previewWrap);
        }

        // Preset active styles via JS
        if (showPresets) {
            presetBtns.forEach(function (obj) {
                obj.btn.addEventListener('mouseover', function () {
                    if (!obj.btn.classList.contains('active')) {
                        obj.btn.style.background = '';
                        obj.btn.style.borderColor = accent;
                        obj.btn.style.color = accent;
                    }
                });
                obj.btn.addEventListener('mouseout', function () {
                    if (!obj.btn.classList.contains('active')) {
                        obj.btn.style.background = '#fff';
                        obj.btn.style.borderColor = inputBorder;
                        obj.btn.style.color = '#374151';
                    }
                });
            });
        }

        function updatePresetHighlight() {
            if (!showPresets) return;
            presetBtns.forEach(function (obj) {
                var active = obj.p.w === state.w && obj.p.h === state.h;
                obj.btn.classList.toggle('active', active);
                if (active) {
                    obj.btn.style.background = presetActiveBg;
                    obj.btn.style.borderColor = presetActiveBg;
                    obj.btn.style.color = presetActiveColor;
                } else {
                    obj.btn.style.background = '#fff';
                    obj.btn.style.borderColor = inputBorder;
                    obj.btn.style.color = '#374151';
                }
            });
        }

        function update() {
            var w = state.w, h = state.h;
            if (ratioNum) ratioNum.textContent = getRatio(w, h);
            if (mpNum) mpNum.textContent = getMegapixels(w, h) + 'MP';
            if (previewBox) {
                var ps = getPreviewSize(w, h);
                previewBox.style.width  = ps.w + 'px';
                previewBox.style.height = ps.h + 'px';
                previewBox.textContent  = w + '×' + h;
            }
            // Scale result
            var nw = parseFloat(scaleW.value), nh = parseFloat(scaleH.value);
            if (nw && h && w) {
                var ch = Math.round(nw * h / w);
                scaleResult.textContent = nw + ' × ' + ch + ' px';
                scaleResult.style.display = 'block';
            } else if (nh && w && h) {
                var cw = Math.round(nh * w / h);
                scaleResult.textContent = cw + ' × ' + nh + ' px';
                scaleResult.style.display = 'block';
            } else {
                scaleResult.style.display = 'none';
            }
            updatePresetHighlight();
        }

        inW.addEventListener('input', function () {
            state.w = parseFloat(this.value) || 1;
            state.newW = ''; state.newH = '';
            scaleW.value = ''; scaleH.value = '';
            update();
        });
        inH.addEventListener('input', function () {
            state.h = parseFloat(this.value) || 1;
            state.newW = ''; state.newH = '';
            scaleW.value = ''; scaleH.value = '';
            update();
        });
        scaleW.addEventListener('input', function () {
            scaleH.value = '';
            update();
        });
        scaleH.addEventListener('input', function () {
            scaleW.value = '';
            update();
        });

        update();
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-arc-app').forEach(initBlock);
    });
    if (document.readyState === 'loading') {
        // already listening above
    } else {
        document.querySelectorAll('.bkbg-arc-app').forEach(initBlock);
    }
})();
