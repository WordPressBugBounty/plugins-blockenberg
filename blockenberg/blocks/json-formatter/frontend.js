(function () {
    'use strict';

    /* ---- Syntax highlighter ---- */
    function syntaxHighlight(json, colors) {
        var keyC    = colors.key      || '#0ea5e9';
        var strC    = colors.string   || '#16a34a';
        var numC    = colors.number   || '#f59e0b';
        var boolC   = colors.boolNull || '#ec4899';
        var punctC  = colors.punct    || '#9ca3af';
        var textC   = colors.text     || '#cdd6f4';

        /* Tokenise */
        var html = '';
        var regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|[{}\[\],:])/g;
        json.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(regex, function (match, offset, fullStr) {
            return match; /* replaced below */
        });

        var escaped = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html = escaped.replace(regex, function (match) {
            var color = textC;
            var isPunct = /^[{}\[\],:]$/.test(match);
            var isBool  = /^(true|false|null)$/.test(match);
            var isNum   = !isNaN(match) && match.trim() !== '';
            var isKey   = /^"/.test(match) && /:$/.test(match.trimEnd());
            var isStr   = /^"/.test(match) && !isKey;

            if (isPunct) color = punctC;
            else if (isBool) color = boolC;
            else if (isNum) color = numC;
            else if (isKey) color = keyC;
            else if (isStr) color = strC;

            return '<span style="color:' + color + '">' + match + '</span>';
        });
        return html;
    }

    /* ---- Stats ---- */
    function countKeys(obj, depth) {
        depth = depth || 0;
        if (typeof obj !== 'object' || obj === null) return { keys: 0, depth: depth };
        var keys = 0; var maxD = depth;
        var ks = Array.isArray(obj) ? obj : Object.values(obj);
        ks.forEach(function (v) {
            if (typeof v === 'object' && v !== null) {
                var sub = countKeys(v, depth + 1);
                keys += sub.keys;
                if (sub.depth > maxD) maxD = sub.depth;
            }
        });
        if (!Array.isArray(obj)) keys += Object.keys(obj).length;
        return { keys: keys, depth: maxD };
    }

    /* ---- DOM ---- */
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

    function initApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) { return; }

        var accent     = opts.accentColor   || '#0ea5e9';
        var editorBg   = opts.editorBg      || '#1e1e2e';
        var editorText = opts.editorText     || '#cdd6f4';
        var lineNumBg  = opts.lineNumBg      || '#181825';
        var lineNumClr = opts.lineNumColor   || '#6c7086';
        var errorBg    = opts.errorBg        || '#fee2e2';
        var errorClr   = opts.errorColor     || '#dc2626';
        var successClr = opts.successColor   || '#16a34a';
        var cardR      = (opts.cardRadius    || 16) + 'px';
        var edR        = (opts.editorRadius  || 10) + 'px';
        var maxW       = (opts.maxWidth      || 800) + 'px';
        var fs         = (opts.editorFontSize|| 13) + 'px';
        var edH        = (opts.editorHeight  || 320) + 'px';
        var indent     = opts.indentSize     !== undefined ? opts.indentSize : 2;

        app.style.paddingTop    = (opts.paddingTop    || 60) + 'px';
        app.style.paddingBottom = (opts.paddingBottom || 60) + 'px';
        if (opts.sectionBg) app.style.background = opts.sectionBg;
        typoCssVarsForEl(opts.titleTypo, '--bkbg-jf-tt-', app);

        var card = document.createElement('div');
        card.className = 'bkbg-jf-card';
        Object.assign(card.style, { background: opts.cardBg || '#fff', borderRadius: cardR, maxWidth: maxW });
        app.appendChild(card);

        if (opts.showTitle && opts.title) {
            var ttl = document.createElement('div'); ttl.className = 'bkbg-jf-title';
            ttl.textContent = opts.title;
            if (opts.titleColor) ttl.style.color = opts.titleColor;
            card.appendChild(ttl);
        }
        if (opts.showSubtitle && opts.subtitle) {
            var sub = document.createElement('div'); sub.className = 'bkbg-jf-subtitle';
            sub.textContent = opts.subtitle;
            if (opts.subtitleColor) sub.style.color = opts.subtitleColor;
            card.appendChild(sub);
        }

        /* Toolbar */
        var toolbar = document.createElement('div'); toolbar.className = 'bkbg-jf-toolbar'; card.appendChild(toolbar);

        function mkBtn(label, primary, onClick) {
            var b = document.createElement('button'); b.className = 'bkbg-jf-btn';
            b.textContent = label;
            if (primary) { b.style.background = accent; b.style.color = '#fff'; }
            else { b.classList.add('bkbg-jf-btn-secondary'); }
            b.addEventListener('click', onClick);
            return b;
        }

        var statusEl = document.createElement('div'); statusEl.className = 'bkbg-jf-status';
        statusEl.style.marginLeft = 'auto';

        function setStatus(ok, msg) {
            statusEl.textContent = (ok ? '✓ ' : '✗ ') + msg;
            statusEl.style.background = ok ? successClr + '18' : errorBg;
            statusEl.style.color      = ok ? successClr : errorClr;
        }
        setStatus(true, 'Ready');

        /* Split: input | output */
        var split = document.createElement('div'); split.className = 'bkbg-jf-split'; card.appendChild(split);

        function mkEditorPane(label) {
            var wrap = document.createElement('div');
            var lbl  = document.createElement('div'); lbl.className = 'bkbg-jf-pane-label'; lbl.textContent = label;
            var ewrap = document.createElement('div'); ewrap.className = 'bkbg-jf-editor-wrap';
            ewrap.style.background = editorBg; ewrap.style.borderRadius = edR; ewrap.style.height = edH;
            var inner = document.createElement('div'); inner.className = 'bkbg-jf-editor-inner'; inner.style.height = edH;
            wrap.appendChild(lbl); ewrap.appendChild(inner); wrap.appendChild(ewrap);
            return { el: wrap, inner: inner };
        }

        /* Input pane */
        var inPane = mkEditorPane('Input JSON');
        var lnWrapIn = document.createElement('div'); lnWrapIn.className = 'bkbg-jf-line-nums';
        lnWrapIn.style.background = lineNumBg; lnWrapIn.style.color = lineNumClr; lnWrapIn.style.fontSize = fs;
        var taIn = document.createElement('textarea'); taIn.className = 'bkbg-jf-textarea';
        taIn.value = opts.defaultJson || '{}';
        taIn.style.color = editorText; taIn.style.fontSize = fs;
        taIn.spellcheck = false; taIn.autocorrect = 'off'; taIn.autocapitalize = 'off';
        inPane.inner.appendChild(lnWrapIn); inPane.inner.appendChild(taIn);

        /* Output pane */
        var outPane = mkEditorPane('Formatted Output');
        var lnWrapOut = document.createElement('div'); lnWrapOut.className = 'bkbg-jf-line-nums';
        lnWrapOut.style.background = lineNumBg; lnWrapOut.style.color = lineNumClr; lnWrapOut.style.fontSize = fs;
        var outDiv = document.createElement('div'); outDiv.className = 'bkbg-jf-output';
        outDiv.style.color = editorText; outDiv.style.fontSize = fs; outDiv.style.background = editorBg; outDiv.style.borderRadius = edR; outDiv.style.height = edH;
        if (opts.showLineNums !== false) { outPane.inner.appendChild(lnWrapOut); }
        outPane.inner.appendChild(outDiv);

        split.appendChild(inPane.el);
        split.appendChild(outPane.el);

        /* Error bar */
        var errorBar = document.createElement('div'); errorBar.className = 'bkbg-jf-error-bar';
        errorBar.style.background = errorBg; errorBar.style.color = errorClr; errorBar.style.display = 'none';
        card.appendChild(errorBar);

        /* Stats bar */
        var statsBar = document.createElement('div'); statsBar.className = 'bkbg-jf-stats-bar';
        if (opts.showStats !== false) card.appendChild(statsBar);

        function updateLineNums(text, wrap) {
            if (opts.showLineNums === false) return;
            var lines = text.split('\n').length;
            var html = '';
            for (var i = 1; i <= lines; i++) html += i + '\n';
            wrap.textContent = html;
        }

        function updateStats(text, parsed) {
            statsBar.innerHTML = '';
            var size = new Blob([text]).size;
            var lines = text.split('\n').length;
            var sizeStr = size < 1024 ? size + ' B' : (size / 1024).toFixed(1) + ' KB';
            var stats = [{ label: 'Size', val: sizeStr }, { label: 'Lines', val: lines }];
            if (parsed) {
                var info = countKeys(parsed, 0);
                stats.push({ label: 'Keys', val: info.keys });
                stats.push({ label: 'Depth', val: info.depth });
            }
            stats.forEach(function (s) {
                var d = document.createElement('div'); d.className = 'bkbg-jf-stat-item';
                d.innerHTML = s.label + ': <strong>' + s.val + '</strong>';
                statsBar.appendChild(d);
            });
        }

        function showError(msg) {
            errorBar.style.display = 'flex'; errorBar.innerHTML = '⚠️ ' + msg;
        }
        function hideError() { errorBar.style.display = 'none'; }

        var currentOutput = '';

        function format() {
            try {
                var parsed = JSON.parse(taIn.value);
                var pretty = JSON.stringify(parsed, null, indent);
                currentOutput = pretty;
                outDiv.innerHTML = syntaxHighlight(pretty, {
                    key:       opts.keyColor,
                    string:    opts.stringColor,
                    number:    opts.numberColor,
                    boolNull:  opts.boolNullColor,
                    punct:     opts.punctColor,
                    text:      editorText
                });
                updateLineNums(pretty, lnWrapOut);
                updateStats(pretty, parsed);
                hideError(); setStatus(true, 'Valid JSON');
                lnWrapOut.scrollTop = 0; outDiv.scrollTop = 0;
            } catch (e) {
                showError(e.message); setStatus(false, 'Invalid JSON');
                outDiv.innerHTML = ''; lnWrapOut.textContent = ''; statsBar.innerHTML = '';
            }
        }

        function minify() {
            try {
                var parsed = JSON.parse(taIn.value);
                var min = JSON.stringify(parsed);
                currentOutput = min;
                outDiv.innerHTML = syntaxHighlight(min, { key: opts.keyColor, string: opts.stringColor, number: opts.numberColor, boolNull: opts.boolNullColor, punct: opts.punctColor, text: editorText });
                updateLineNums(min, lnWrapOut);
                updateStats(min, parsed);
                hideError(); setStatus(true, 'Minified');
            } catch (e) {
                showError(e.message); setStatus(false, 'Invalid JSON');
            }
        }

        function validate() {
            try {
                JSON.parse(taIn.value);
                hideError(); setStatus(true, 'Valid JSON ✓');
            } catch (e) {
                showError(e.message); setStatus(false, 'Invalid JSON');
            }
        }

        var copiedEl = document.createElement('span'); copiedEl.className = 'bkbg-jf-copied'; copiedEl.textContent = 'Copied!';

        var fmtBtn  = mkBtn('Format',   true,  format);
        var minBtn  = mkBtn('Minify',   true,  minify);
        var valBtn  = mkBtn('Validate', false, validate);
        var cpyBtn  = mkBtn('📋 Copy',  false, function () {
            var text = currentOutput || taIn.value;
            navigator.clipboard.writeText(text).then(function () {
                copiedEl.style.display = 'inline-block';
                setTimeout(function () { copiedEl.style.display = 'none'; }, 1500);
            }).catch(function () {});
        });
        var clrBtn  = mkBtn('Clear', false, function () {
            taIn.value = ''; outDiv.innerHTML = ''; lnWrapIn.textContent = '1'; lnWrapOut.textContent = '';
            statsBar.innerHTML = ''; hideError(); setStatus(true, 'Ready'); currentOutput = '';
        });

        [fmtBtn, minBtn, valBtn, cpyBtn, clrBtn, copiedEl, statusEl].forEach(function (b) { toolbar.appendChild(b); });

        /* Live line nums on input */
        taIn.addEventListener('input', function () {
            updateLineNums(taIn.value, lnWrapIn);
            hideError(); setStatus(true, 'Editing…');
            currentOutput = '';
        });

        /* Sync scroll */
        function syncScroll(from, to) { from.addEventListener('scroll', function () { to.scrollTop = from.scrollTop; }); }
        syncScroll(taIn, lnWrapIn); syncScroll(lnWrapIn, taIn);
        syncScroll(outDiv, lnWrapOut); syncScroll(lnWrapOut, outDiv);

        /* Tab key support */
        taIn.addEventListener('keydown', function (e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                var s = taIn.selectionStart; var end = taIn.selectionEnd;
                taIn.value = taIn.value.substring(0, s) + '  ' + taIn.value.substring(end);
                taIn.selectionStart = taIn.selectionEnd = s + 2;
            }
            if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); format(); }
        });

        /* Initial */
        updateLineNums(taIn.value, lnWrapIn);
        format();
    }

    document.querySelectorAll('.bkbg-jf-app').forEach(initApp);
})();
