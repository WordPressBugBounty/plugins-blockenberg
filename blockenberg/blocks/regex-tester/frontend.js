(function () {
    'use strict';

    function tryRegex(pattern, flags) {
        try {
            if (!pattern) return { re: null, error: null };
            return { re: new RegExp(pattern, flags), error: null };
        } catch(e) {
            return { re: null, error: e.message };
        }
    }

    function getMatches(re, str) {
        if (!re || !str) return [];
        var matches = [], m;
        var safeFlags = re.flags;
        if (!safeFlags.includes('g')) safeFlags += 'g';
        var r;
        try { r = new RegExp(re.source, safeFlags); } catch(e) { return []; }
        var watchdog = 0;
        while ((m = r.exec(str)) !== null && watchdog++ < 1000) {
            matches.push({ index: m.index, length: m[0].length, value: m[0], groups: Array.from(m).slice(1) });
            if (m[0].length === 0) r.lastIndex++;
        }
        return matches;
    }

    function escapeHtml(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function buildHighlightedHtml(str, matches, matchBg, matchBorder, accentColor) {
        if (!matches.length) return '<span>' + escapeHtml(str) + '</span>';
        var html = '';
        var cursor = 0;
        matches.forEach(function(m) {
            if (m.index > cursor) html += escapeHtml(str.slice(cursor, m.index));
            html += '<mark class="bkbg-rt-match" style="background:' + matchBg + ';border-bottom-color:' + matchBorder + ';" title="Match: ' + escapeHtml(m.value) + '">' + escapeHtml(m.value) + '</mark>';
            cursor = m.index + m.length;
        });
        if (cursor < str.length) html += escapeHtml(str.slice(cursor));
        return html;
    }

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
        Object.keys(_typoKeys).forEach(function(k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    document.querySelectorAll('.bkbg-rt-app').forEach(function (root) {
        var opts = {};
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); } catch(e) {}

        var accentColor    = opts.accentColor    || '#f59e0b';
        var matchBg        = opts.matchBg        || '#fef3c7';
        var matchBorder    = opts.matchBorder    || '#f59e0b';
        var editorBg       = opts.editorBg       || '#1e1e2e';
        var editorText     = opts.editorText      || '#cdd6f4';
        var cardBg         = opts.cardBg         || '#ffffff';
        var sectionBg      = opts.sectionBg      || '#f9fafb';
        var titleColor     = opts.titleColor     || '#111827';
        var subtitleColor  = opts.subtitleColor  || '#6b7280';
        var labelColor     = opts.labelColor     || '#374151';
        var errorColor     = opts.errorColor     || '#dc2626';
        var showGroups     = opts.showGroups     !== false;
        var showCheatsheet = opts.showCheatsheet === true;

        var state = {
            pattern: opts.defaultPattern || '',
            flags:   opts.defaultFlags   || 'gi',
            test:    opts.defaultTestStr || ''
        };

        var FLAG_INFO = { g: 'global', i: 'ignore case', m: 'multiline', s: 'dotAll' };

        function render() {
            var result  = tryRegex(state.pattern, state.flags);
            var matches = result.re ? getMatches(result.re, state.test) : [];
            var hasError = !!result.error;
            var flagsArr = ['g','i','m','s'];

            root.innerHTML =
                '<div class="bkbg-rt-card" style="background:' + cardBg + ';max-width:' + (opts.contentMaxWidth||780) + 'px;">' +
                    '<h2 class="bkbg-rt-title" style="color:' + titleColor + ';">' + (opts.title || 'Regex Tester') + '</h2>' +
                    '<p class="bkbg-rt-subtitle" style="color:' + subtitleColor + ';">' + (opts.subtitle || 'Test regular expressions with live match highlighting') + '</p>' +

                    '<div class="bkbg-rt-pattern-row">' +
                        '<div class="bkbg-rt-pattern-wrap" style="background:' + editorBg + ';">' +
                            '<span class="bkbg-rt-slash" style="color:' + accentColor + ';">/</span>' +
                            '<input type="text" class="bkbg-rt-pattern-input" id="rt-pattern" value="' + escapeHtml(state.pattern) + '" placeholder="Enter pattern…" style="color:' + editorText + ';background:transparent;" spellcheck="false">' +
                            '<span class="bkbg-rt-slash" style="color:' + accentColor + ';">/</span>' +
                            '<input type="text" class="bkbg-rt-flags-input" id="rt-flags" value="' + escapeHtml(state.flags) + '" placeholder="gi" maxlength="6" style="color:' + accentColor + ';background:transparent;" spellcheck="false">' +
                        '</div>' +
                        (hasError ? '<div class="bkbg-rt-error" style="color:' + errorColor + ';">⚠ ' + escapeHtml(result.error) + '</div>' : '') +
                        '<div class="bkbg-rt-flags-row">' +
                            flagsArr.map(function(f) {
                                var active = state.flags.includes(f);
                                return '<button class="bkbg-rt-flag-btn" data-flag="' + f + '" style="background:' + (active ? accentColor : '#f3f4f6') + ';color:' + (active ? '#fff' : labelColor) + ';"><strong>' + f + '</strong><span>' + FLAG_INFO[f] + '</span></button>';
                            }).join('') +
                        '</div>' +
                    '</div>' +

                    '<div class="bkbg-rt-section">' +
                        '<label class="bkbg-rt-label" style="color:' + labelColor + ';">Test String</label>' +
                        '<textarea class="bkbg-rt-textarea" id="rt-test" style="background:' + sectionBg + ';color:' + labelColor + ';min-height:' + (opts.editorHeight||160) + 'px;" spellcheck="false">' + escapeHtml(state.test) + '</textarea>' +
                    '</div>' +

                    '<div class="bkbg-rt-stats" style="background:' + sectionBg + ';color:' + labelColor + ';">' +
                        (hasError
                            ? '<span style="color:' + errorColor + ';">⚠ Invalid regex pattern</span>'
                            : '<span>Matches: <strong style="color:' + accentColor + ';">' + matches.length + '</strong></span>' +
                              (matches.length > 0 ? '<span>Groups per match: <strong>' + Math.max(0, matches[0].groups.length) + '</strong></span>' : '') +
                              '<span>Test length: <strong>' + state.test.length + '</strong> chars</span>'
                        ) +
                    '</div>' +

                    (!hasError && state.test ?
                    '<div class="bkbg-rt-section">' +
                        '<label class="bkbg-rt-label" style="color:' + labelColor + ';">Highlighted Output</label>' +
                        '<div class="bkbg-rt-output" style="background:' + sectionBg + ';font-size:' + (opts.editorFontSize||14) + 'px;">' +
                            buildHighlightedHtml(state.test, matches, matchBg, matchBorder, accentColor) +
                        '</div>' +
                    '</div>' : '') +

                    (showGroups && matches.length > 0 ?
                    '<div class="bkbg-rt-matches">' +
                        '<div class="bkbg-rt-matches-title" style="color:' + labelColor + ';">Matches (' + matches.length + ')</div>' +
                        matches.slice(0, 30).map(function(m, i) {
                            return '<div class="bkbg-rt-match-badge" style="border-color:' + accentColor + '55;background:' + accentColor + '0e;">' +
                                '<span class="bkbg-rt-match-idx" style="color:' + accentColor + ';">#' + (i+1) + '</span>' +
                                '<span class="bkbg-rt-match-val" style="color:' + labelColor + ';">' + escapeHtml(m.value) + '</span>' +
                                (m.groups.some(function(g){ return g !== undefined; })
                                    ? '<span class="bkbg-rt-match-groups">Groups: ' + m.groups.map(function(g,gi){ return 'G'+(gi+1)+': '+(g||'—'); }).join(' | ') + '</span>'
                                    : '') +
                            '</div>';
                        }).join('') +
                        (matches.length > 30 ? '<div class="bkbg-rt-more" style="color:#9ca3af;">+ ' + (matches.length-30) + ' more matches</div>' : '') +
                    '</div>' : '') +
                '</div>';

            var card = root.querySelector('.bkbg-rt-card');
            if (card) {
                typoCssVarsForEl(card, opts.titleTypo || {}, '--bkbgrt-tt-');
                typoCssVarsForEl(card, opts.editorTypo || {}, '--bkbgrt-et-');
            }

            bindEvents();
        }

        function bindEvents() {
            var patInput  = root.querySelector('#rt-pattern');
            var flagInput = root.querySelector('#rt-flags');
            var testArea  = root.querySelector('#rt-test');

            function update() { render(); }

            if (patInput) patInput.addEventListener('input', function() { state.pattern = this.value; update(); });
            if (flagInput) flagInput.addEventListener('input', function() {
                state.flags = this.value.replace(/[^gimsuy]/g,'');  update();
            });
            if (testArea) testArea.addEventListener('input', function() { state.test = this.value; update(); });

            root.querySelectorAll('.bkbg-rt-flag-btn[data-flag]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var f = this.getAttribute('data-flag');
                    if (state.flags.includes(f)) {
                        state.flags = state.flags.replace(f, '');
                    } else {
                        state.flags += f;
                    }
                    update();
                });
            });
        }

        render();
    });

})();
