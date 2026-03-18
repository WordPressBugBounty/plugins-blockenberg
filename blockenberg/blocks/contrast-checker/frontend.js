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
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) {
            el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
            el.style.setProperty(prefix + 'letter-spacing',   typo.letterSpacingDesktop + lsu);
        }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) {
            el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
            el.style.setProperty(prefix + 'word-spacing',   typo.wordSpacingDesktop + wsu);
        }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        var n = parseInt(hex, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }

    function luminance(hex) {
        try {
            var rgb = hexToRgb(hex);
            var vals = [rgb.r, rgb.g, rgb.b].map(function(v) {
                v = v / 255;
                return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];
        } catch(e) { return 0; }
    }

    function contrastRatio(fg, bg) {
        var l1 = luminance(fg), l2 = luminance(bg);
        var lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    function isValidHex(hex) {
        return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);
    }

    // Suggestions: darken fg or lighten bg to reach AA
    function suggestColors(fg, bg) {
        var suggestions = [];
        // Try some darker versions of fg
        var fgRgb = hexToRgb(fg);
        var steps = [0.8, 0.6, 0.4, 0.2, 0];
        steps.forEach(function(factor) {
            var r = Math.round(fgRgb.r * factor);
            var g = Math.round(fgRgb.g * factor);
            var b = Math.round(fgRgb.b * factor);
            var hex = '#' + [r,g,b].map(function(v){ return ('0'+v.toString(16)).slice(-2); }).join('');
            var ratio = contrastRatio(hex, bg);
            if (ratio >= 4.5) {
                suggestions.push({ hex: hex, ratio: ratio, label: 'Darker Fg' });
                return;
            }
        });
        // Classic black/white
        [['#000000','Black'],['#ffffff','White'],['#1e293b','Dark'],['#f8fafc','Light']].forEach(function(pair) {
            var ratio = contrastRatio(pair[0], bg);
            if (ratio >= 4.5) suggestions.push({ hex: pair[0], ratio: ratio, label: pair[1] });
        });
        // Deduplicate
        var seen = {};
        return suggestions.filter(function(s) {
            if (seen[s.hex]) return false;
            seen[s.hex] = true;
            return true;
        }).slice(0, 5);
    }

    var WCAG_LEVELS = [
        { id: 'aa-normal',  label: 'AA',  sub: 'Normal text ≥ 4.5:1', min: 4.5 },
        { id: 'aa-large',   label: 'AA',  sub: 'Large text ≥ 3:1',    min: 3.0 },
        { id: 'aaa-normal', label: 'AAA', sub: 'Normal text ≥ 7:1',   min: 7.0 },
        { id: 'aaa-large',  label: 'AAA', sub: 'Large text ≥ 4.5:1',  min: 4.5 }
    ];

    document.querySelectorAll('.bkbg-cc-app').forEach(function (root) {
        var opts = {};
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); } catch(e) {}

        /* Apply typography CSS vars on root (survives innerHTML replacements) */
        typoCssVarsForEl(opts.typoTitle, '--bkcchk-title-', root);
        typoCssVarsForEl(opts.typoSubtitle, '--bkcchk-sub-', root);

        var showPreview     = opts.showPreview     !== false;
        var showSuggestions = opts.showSuggestions !== false;
        var previewText     = opts.previewText     || 'The quick brown fox jumps over the lazy dog';
        var passColor       = opts.passColor       || '#16a34a';
        var failColor       = opts.failColor       || '#dc2626';
        var accentColor     = opts.accentColor     || '#6c3fb5';
        var cardBg          = opts.cardBg          || '#ffffff';
        var sectionBg       = opts.sectionBg       || '#f5f3ff';
        var titleColor      = opts.titleColor      || '#111827';
        var subtitleColor   = opts.subtitleColor   || '#6b7280';
        var labelColor      = opts.labelColor      || '#374151';

        var fg = opts.defaultFg || '#1e1b4b';
        var bg = opts.defaultBg || '#ffffff';

        function gradeColor(ratio) {
            return ratio >= 4.5 ? passColor : ratio >= 3 ? '#d97706' : failColor;
        }
        function gradeLabel(ratio) {
            return ratio >= 4.5 ? 'Excellent' : ratio >= 3 ? 'Good' : ratio >= 2 ? 'Poor' : 'Fail';
        }

        function render() {
            var validFg = isValidHex(fg) ? fg : '#000000';
            var validBg = isValidHex(bg) ? bg : '#ffffff';
            var ratio = contrastRatio(validFg, validBg);
            var gc = gradeColor(ratio);
            var sug = showSuggestions && ratio < 4.5 ? suggestColors(validFg, validBg) : [];

            root.innerHTML =
                '<div class="bkbg-cc-card" style="background:' + cardBg + ';max-width:' + (opts.contentMaxWidth||680) + 'px;">' +
                    '<h2 class="bkbg-cc-title" style="color:' + titleColor + ';">' + (opts.title || 'Color Contrast Checker') + '</h2>' +
                    '<p class="bkbg-cc-subtitle" style="color:' + subtitleColor + ';">' + (opts.subtitle || 'Test accessibility compliance with WCAG 2.1 standards') + '</p>' +

                    '<div class="bkbg-cc-pickers" style="background:' + sectionBg + ';">' +
                        '<div class="bkbg-cc-picker-group">' +
                            '<label class="bkbg-cc-label" style="color:' + labelColor + ';">🅰 Foreground Color</label>' +
                            '<div class="bkbg-cc-color-row">' +
                                '<input type="color" class="bkbg-cc-color-input" id="cc-fg" value="' + validFg + '">' +
                                '<input type="text" class="bkbg-cc-hex-input" id="cc-fg-text" value="' + validFg.toUpperCase() + '" maxlength="7" style="color:' + labelColor + ';font-weight:700;font-size:14px;border:1.5px solid #e5e7eb;border-radius:8px;padding:8px 10px;width:100px;font-family:monospace;background:' + cardBg + ';">' +
                            '</div>' +
                        '</div>' +
                        '<button class="bkbg-cc-swap" id="cc-swap" style="background:' + accentColor + ';" title="Swap colors">⇆</button>' +
                        '<div class="bkbg-cc-picker-group">' +
                            '<label class="bkbg-cc-label" style="color:' + labelColor + ';">◻ Background Color</label>' +
                            '<div class="bkbg-cc-color-row">' +
                                '<input type="color" class="bkbg-cc-color-input" id="cc-bg" value="' + validBg + '">' +
                                '<input type="text" class="bkbg-cc-hex-input" id="cc-bg-text" value="' + validBg.toUpperCase() + '" maxlength="7" style="color:' + labelColor + ';font-weight:700;font-size:14px;border:1.5px solid #e5e7eb;border-radius:8px;padding:8px 10px;width:100px;font-family:monospace;background:' + cardBg + ';">' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    (showPreview ?
                    '<div class="bkbg-cc-preview" style="background:' + validBg + ';">' +
                        '<p class="bkbg-cc-preview-normal" style="color:' + validFg + ';">' + previewText + ' — Normal (16px)</p>' +
                        '<p class="bkbg-cc-preview-large"  style="color:' + validFg + ';">' + previewText + ' — Large (24px)</p>' +
                        '<p class="bkbg-cc-preview-bold"   style="color:' + validFg + ';">' + previewText + ' — Bold (14px)</p>' +
                    '</div>' : '') +

                    '<div class="bkbg-cc-ratio-box" style="border-color:' + gc + '44;background:' + gc + '10;">' +
                        '<div class="bkbg-cc-ratio-val" style="color:' + gc + ';">' + ratio.toFixed(2) + ':1</div>' +
                        '<div class="bkbg-cc-ratio-lbl" style="color:' + labelColor + ';">Contrast Ratio</div>' +
                        '<div class="bkbg-cc-ratio-grade" style="background:' + gc + ';color:#fff;">' + gradeLabel(ratio) + '</div>' +
                    '</div>' +

                    '<div class="bkbg-cc-wcag-grid">' +
                        WCAG_LEVELS.map(function(level) {
                            var pass = ratio >= level.min;
                            var col  = pass ? passColor : failColor;
                            return '<div class="bkbg-cc-wcag-row" style="border-color:' + col + '33;background:' + col + '09;">' +
                                '<div class="bkbg-cc-wcag-badge" style="background:' + col + ';color:#fff;">' + level.label + '</div>' +
                                '<div class="bkbg-cc-wcag-info">' +
                                    '<div class="bkbg-cc-wcag-sub" style="color:' + labelColor + ';">' + level.sub + '</div>' +
                                '</div>' +
                                '<div class="bkbg-cc-wcag-status" style="color:' + col + ';">' + (pass ? '✓ Pass' : '✗ Fail') + '</div>' +
                            '</div>';
                        }).join('') +
                    '</div>' +

                    (sug.length > 0 ?
                    '<div class="bkbg-cc-suggestions">' +
                        '<div class="bkbg-cc-suggestions-title" style="color:' + labelColor + ';">💡 Suggested foreground colors to reach AA:</div>' +
                        '<div class="bkbg-cc-sug-chips">' +
                            sug.map(function(s) {
                                return '<button class="bkbg-cc-sug-chip" data-sugfg="' + s.hex + '" style="background:' + cardBg + ';color:' + labelColor + ';">' +
                                    '<span class="bkbg-cc-sug-swatch" style="background:' + s.hex + ';"></span>' +
                                    s.hex.toUpperCase() + ' (' + s.ratio.toFixed(1) + ':1)' +
                                '</button>';
                            }).join('') +
                        '</div>' +
                    '</div>' : '') +
                '</div>';

            bindEvents();
        }

        function update(newFg, newBg) {
            fg = newFg || fg;
            bg = newBg || bg;
            render();
        }

        function bindEvents() {
            var fgPicker = root.querySelector('#cc-fg');
            var bgPicker = root.querySelector('#cc-bg');
            var fgText   = root.querySelector('#cc-fg-text');
            var bgText   = root.querySelector('#cc-bg-text');
            var swapBtn  = root.querySelector('#cc-swap');

            if (fgPicker) fgPicker.addEventListener('input', function() {
                fg = this.value; if (fgText) fgText.value = fg.toUpperCase(); render();
            });
            if (bgPicker) bgPicker.addEventListener('input', function() {
                bg = this.value; if (bgText) bgText.value = bg.toUpperCase(); render();
            });
            if (fgText) fgText.addEventListener('input', function() {
                var v = this.value.trim();
                if (!v.startsWith('#')) v = '#' + v;
                if (isValidHex(v)) { fg = v; if (fgPicker) fgPicker.value = fg; render(); }
            });
            if (bgText) bgText.addEventListener('input', function() {
                var v = this.value.trim();
                if (!v.startsWith('#')) v = '#' + v;
                if (isValidHex(v)) { bg = v; if (bgPicker) bgPicker.value = bg; render(); }
            });
            if (swapBtn) swapBtn.addEventListener('click', function() {
                var t = fg; fg = bg; bg = t; render();
            });

            root.querySelectorAll('[data-sugfg]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    fg = this.getAttribute('data-sugfg');
                    render();
                });
            });
        }

        render();
    });

})();
