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

    // ── Base64 helpers with Unicode support ──────────────────────────────
    function toBase64(str, urlSafe, lineBreaks) {
        var b64;
        try {
            // TextEncoder → Uint8Array → binary string → btoa handles Unicode cleanly
            var bytes = new TextEncoder().encode(str);
            var bin   = '';
            bytes.forEach(function(b) { bin += String.fromCharCode(b); });
            b64 = btoa(bin);
        } catch(e) {
            return { error: 'Encoding error: ' + e.message };
        }
        if (urlSafe) { b64 = b64.replace(/\+/g,'-').replace(/\//g,'_'); }
        if (lineBreaks) {
            var lines = [];
            for (var i = 0; i < b64.length; i += 76) { lines.push(b64.slice(i, i+76)); }
            b64 = lines.join('\n');
        }
        return { result: b64 };
    }

    function fromBase64(str, urlSafe) {
        try {
            var s = str.trim();
            if (urlSafe) { s = s.replace(/-/g,'+').replace(/_/g,'/'); }
            s = s.replace(/\s/g, '');
            var bin   = atob(s);
            var bytes = new Uint8Array(bin.length);
            for (var i=0; i<bin.length; i++) { bytes[i] = bin.charCodeAt(i); }
            return { result: new TextDecoder().decode(bytes) };
        } catch(e) {
            return { error: 'Invalid Base64 string. Please check the input.' };
        }
    }

    // ── Bootstrap ────────────────────────────────────────────────────────
    document.querySelectorAll('.bkbg-b64-app').forEach(function(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); }
        catch(e) { return; }

        var o = {
            title:           opts.title           || 'Base64 Encoder / Decoder',
            subtitle:        opts.subtitle        || '',
            defaultMode:     opts.defaultMode     || 'encode',
            defaultInput:    opts.defaultInput    || '',
            showUrlSafe:     opts.showUrlSafe     !== false,
            showLineBreaks:  opts.showLineBreaks  !== false,
            showStats:       opts.showStats       !== false,
            accentColor:     opts.accentColor     || '#0ea5e9',
            sectionBg:       opts.sectionBg       || '#f0f9ff',
            cardBg:          opts.cardBg          || '#ffffff',
            inputBg:         opts.inputBg         || '#f8fafc',
            outputBg:        opts.outputBg        || '#0f172a',
            outputColor:     opts.outputColor     || '#7dd3fc',
            titleColor:      opts.titleColor      || '#0c4a6e',
            subtitleColor:   opts.subtitleColor   || '#6b7280',
            labelColor:      opts.labelColor      || '#374151',
            titleFontSize:   parseInt(opts.titleFontSize)   || 26,
            contentMaxWidth: parseInt(opts.contentMaxWidth) || 720
        };

        var mode = o.defaultMode;

        // ── Build HTML ─────────────────────────────────────────────────
        root.innerHTML =
            '<div class="bkbg-b64-wrap" style="background:' + o.sectionBg + ';max-width:' + o.contentMaxWidth + 'px;--b64-accent:' + o.accentColor + '">' +
            (o.title    ? '<h3 class="bkbg-b64-title" style="color:' + o.titleColor + '">' + o.title    + '</h3>' : '') +
            (o.subtitle ? '<p  class="bkbg-b64-subtitle" style="color:' + o.subtitleColor + '">' + o.subtitle + '</p>' : '') +

            '<div class="bkbg-b64-tabs">' +
            '<button class="bkbg-b64-tab" data-mode="encode">⬆ Encode</button>' +
            '<button class="bkbg-b64-tab" data-mode="decode">⬇ Decode</button>' +
            '</div>' +

            '<label class="bkbg-b64-field-label" id="b64-in-label" style="color:' + o.labelColor + '">Plain Text</label>' +
            '<textarea id="b64-input" class="bkbg-b64-textarea" style="background:' + o.inputBg + ';color:' + o.labelColor + '" placeholder="Enter text to encode…"></textarea>' +

            '<div class="bkbg-b64-options">' +
            (o.showUrlSafe   ? '<label class="bkbg-b64-option-label" style="color:' + o.labelColor + '"><input type="checkbox" id="b64-urlsafe" style="accent-color:' + o.accentColor + '"> URL-safe Base64</label>' : '') +
            (o.showLineBreaks ? '<label class="bkbg-b64-option-label" style="color:' + o.labelColor + '"><input type="checkbox" id="b64-linebreaks" style="accent-color:' + o.accentColor + '"> Line breaks (76 chars)</label>' : '') +
            '</div>' +

            '<div class="bkbg-b64-output-header">' +
            '<span class="bkbg-b64-output-label" id="b64-out-label" style="color:' + o.labelColor + '">Base64 Output</span>' +
            '<button class="bkbg-b64-copy-btn" id="b64-copy">⧉ Copy</button>' +
            '</div>' +
            '<div class="bkbg-b64-output-box" id="b64-output" style="background:' + o.outputBg + ';color:' + o.outputColor + '">' +
            '<span class="bkbg-b64-output-placeholder">Output will appear here…</span>' +
            '<span class="bkbg-b64-toast" id="b64-toast">Copied!</span>' +
            '</div>' +

            (o.showStats ?
                '<div class="bkbg-b64-stats" id="b64-stats">' +
                '<span class="bkbg-b64-stat" id="b64-stat-in"  style="color:' + o.labelColor + '">Input: 0 chars</span>' +
                '<span class="bkbg-b64-stat" id="b64-stat-out" style="color:' + o.labelColor + '">Output: 0 chars</span>' +
                '<span class="bkbg-b64-stat" id="b64-stat-ratio" style="color:' + o.labelColor + '">Ratio: —</span>' +
                '</div>'
            : '') +
            '</div>';

        var wrapEl = root.querySelector('.bkbg-b64-wrap');
        if (wrapEl) {
            typoCssVarsForEl(opts.titleTypo, '--bkbg-b64-title-', wrapEl);
            typoCssVarsForEl(opts.subtitleTypo, '--bkbg-b64-sub-', wrapEl);
        }

        var inEl       = root.querySelector('#b64-input');
        var inLabel    = root.querySelector('#b64-in-label');
        var outLabel   = root.querySelector('#b64-out-label');
        var outEl      = root.querySelector('#b64-output');
        var copyBtn    = root.querySelector('#b64-copy');
        var toast      = root.querySelector('#b64-toast');
        var urlsafeEl  = root.querySelector('#b64-urlsafe');
        var lbEl       = root.querySelector('#b64-linebreaks');
        var statIn     = root.querySelector('#b64-stat-in');
        var statOut    = root.querySelector('#b64-stat-out');
        var statRatio  = root.querySelector('#b64-stat-ratio');
        var tabs       = root.querySelectorAll('.bkbg-b64-tab');

        var currentOutput = '';

        function setMode(m) {
            mode = m;
            tabs.forEach(function(t) {
                var act = t.getAttribute('data-mode') === mode;
                t.classList.toggle('active', act);
                t.style.background  = act ? o.accentColor : '';
                t.style.borderColor = act ? o.accentColor : '';
                t.style.color       = act ? '#fff' : o.labelColor;
            });
            inLabel.textContent  = mode === 'encode' ? 'Plain Text'    : 'Base64 String';
            outLabel.textContent = mode === 'encode' ? 'Base64 Output' : 'Decoded Text';
            inEl.placeholder     = mode === 'encode' ? 'Enter text to encode…' : 'Enter Base64 to decode…';
            inEl.value = '';
            outEl.innerHTML = '<span class="bkbg-b64-output-placeholder">Output will appear here…</span>';
            currentOutput = '';
            if (statIn) statIn.textContent = 'Input: 0 chars';
            if (statOut) statOut.textContent = 'Output: 0 chars';
            if (statRatio) statRatio.textContent = 'Ratio: —';
        }

        function convert() {
            var text    = inEl.value;
            var urlSafe = urlsafeEl ? urlsafeEl.checked : false;
            var lb      = lbEl      ? lbEl.checked      : false;
            var res;

            if (!text) {
                outEl.innerHTML = '<span class="bkbg-b64-output-placeholder">Output will appear here…</span><span class="bkbg-b64-toast" id="b64-toast">Copied!</span>';
                currentOutput = '';
                return;
            }

            if (mode === 'encode') {
                res = toBase64(text, urlSafe, lb);
            } else {
                res = fromBase64(text, urlSafe);
            }

            if (res.error) {
                outEl.innerHTML = '<span class="bkbg-b64-toast" id="b64-toast">Copied!</span>' +
                    '<span style="color:#f87171;font-style:italic">' + res.error + '</span>';
                currentOutput = '';
            } else {
                var esc = res.result.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                outEl.innerHTML = '<span class="bkbg-b64-toast" id="b64-toast">Copied!</span>' + esc;
                currentOutput = res.result;
                toast = root.querySelector('#b64-toast');

                if (o.showStats) {
                    var inLen  = text.length;
                    var outLen = res.result.replace(/\n/g,'').length;
                    var ratio  = inLen > 0 ? (outLen / inLen).toFixed(2) + 'x' : '—';
                    if (statIn)    statIn.textContent    = 'Input: ' + inLen + ' chars';
                    if (statOut)   statOut.textContent   = 'Output: ' + outLen + ' chars';
                    if (statRatio) statRatio.textContent = 'Ratio: ' + ratio;
                }
            }
        }

        // bind tab clicks
        tabs.forEach(function(t) { t.addEventListener('click', function(){ setMode(t.getAttribute('data-mode')); }); });

        // live conversion on input
        inEl.addEventListener('input', convert);
        if (urlsafeEl) urlsafeEl.addEventListener('change', convert);
        if (lbEl)      lbEl.addEventListener('change', convert);

        // copy button
        copyBtn.addEventListener('click', function() {
            if (!currentOutput) return;
            navigator.clipboard.writeText(currentOutput).then(function() {
                var t2 = root.querySelector('#b64-toast');
                if (t2) { t2.classList.add('show'); setTimeout(function(){ t2.classList.remove('show'); }, 1800); }
            }).catch(function(){});
        });

        // initial
        setMode(mode);
        if (o.defaultInput) { inEl.value = o.defaultInput; convert(); }
    });
})();
