(function () {
    'use strict';

    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        transform:'text-transform', decoration:'text-decoration',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    var _typoUnits = { size:'sizeUnit', lineHeight:'lineHeightUnit', letterSpacing:'letterSpacingUnit', wordSpacing:'wordSpacingUnit' };
    var _typoUnitDefaults = { size:'px', lineHeight:'', letterSpacing:'px', wordSpacing:'px' };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var prop = _typoKeys[k];
            var base = k.replace(/Desktop|Tablet|Mobile/, '');
            var uKey = _typoUnits[base];
            if (uKey && typeof v === 'number') v = v + (obj[uKey] || _typoUnitDefaults[base] || '');
            el.style.setProperty(prefix + prop, v);
        });
    }

    // ── Token colours ──────────────────────────────────────────────────────────
    var TOKEN_COLOURS = {
        plain:    null,
        keyword:  '#c792ea',
        string:   '#c3e88d',
        comment:  '#546e7a',
        number:   '#f78c6c',
        operator: '#89ddff',
        function: '#82aaff',
        tag:      '#f07178',
        variable: '#ffcb6b'
    };

    var LANG_KW = {
        javascript: 'break case catch class const continue debugger default delete do else enum export extends false finally for from function if import in instanceof let new null of return static super switch this throw true try typeof undefined var void while with yield async await',
        typescript: 'break case catch class const continue debugger default delete do else enum export extends false finally for from function if import in instanceof interface let namespace new null of return static super switch this throw true try type typeof undefined var void while with yield async await',
        php:    'echo print class function return if else elseif for foreach while do switch case break continue true false null new public private protected static abstract final try catch finally throw namespace use extends implements interface trait',
        python: 'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield',
        css:    'important',
        bash:   'if then else elif fi for while do done case esac in function return export readonly local true false',
        sql:    'SELECT FROM WHERE JOIN LEFT RIGHT INNER OUTER ON UPDATE INSERT INTO VALUES DELETE CREATE DROP TABLE ALTER ADD COLUMN AS GROUP BY ORDER HAVING LIMIT DISTINCT WITH UNION ALL SET AND OR NOT NULL IS IN EXISTS',
        ruby:   'BEGIN END __ENCODING__ __END__ __FILE__ __LINE__ alias and begin break case class def defined do else elsif end ensure false for if in module next nil not or raise redo rescue retry return self super then true undef unless until when while yield',
        go:     'break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var nil true false',
        rust:   'as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while'
    };

    function tokenize(code, lang) {
        if (!lang || lang === 'text') return [{ type: 'plain', text: code }];
        var kw = (LANG_KW[lang] || '').split(' ').filter(Boolean);
        var rules = [
            { type: 'string',   re: /("""[\s\S]*?"""|'''[\s\S]*?'''|`[\s\S]*?`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/ },
            { type: 'comment',  re: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*|--[^\n]*)/ },
            { type: 'number',   re: /(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)/ },
            { type: 'operator', re: /([+\-*/%=<>!&|^~?:;,.()\[\]{}])/ },
            { type: 'keyword',  re: new RegExp('\\b(' + (kw.length ? kw.join('|') : '__NONE__') + ')\\b') },
            { type: 'function', re: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/ },
            lang === 'html'
                ? { type: 'tag',      re: /(<\/?\w[^>]*>)/ }
                : null,
            lang === 'php'
                ? { type: 'variable', re: /(\$[a-zA-Z_]\w*)/ }
                : null
        ].filter(Boolean);

        var tokens = [];
        var rest = code;
        while (rest.length) {
            var bestIdx = Infinity, bestLen = 0, bestType = 'plain', bestM = null;
            for (var i = 0; i < rules.length; i++) {
                var m = rules[i].re.exec(rest);
                if (m && m.index < bestIdx) {
                    bestIdx = m.index; bestLen = m[0].length; bestType = rules[i].type; bestM = m;
                }
            }
            if (!bestM) { tokens.push({ type: 'plain', text: rest }); break; }
            if (bestIdx > 0) tokens.push({ type: 'plain', text: rest.slice(0, bestIdx) });
            tokens.push({ type: bestType, text: rest.slice(bestIdx, bestIdx + bestLen) });
            rest = rest.slice(bestIdx + bestLen);
        }
        return tokens;
    }

    function buildPaneDOM(code, lang, opts, side, diffLinesArr) {
        var lines = code.split('\n');
        var fragment = document.createDocumentFragment();

        lines.forEach(function (line, i) {
            var lineEl = document.createElement('div');
            lineEl.className = 'bkbg-cc-line' + (opts.wrapLines ? ' bkbg-cc-wrap-lines' : '');

            var isDiff = diffLinesArr.indexOf(i) !== -1;
            if (isDiff && side === 'left')  lineEl.style.backgroundColor = opts.diffRemBg;
            if (isDiff && side === 'right') lineEl.style.backgroundColor = opts.diffAddBg;

            if (opts.showLineNumbers) {
                var numEl = document.createElement('span');
                numEl.className = 'bkbg-cc-line-num';
                numEl.style.color = opts.lineNumColor;
                numEl.textContent = i + 1;
                lineEl.appendChild(numEl);
            }

            if (opts.showDiffMarkers && isDiff) {
                var marker = document.createElement('span');
                marker.className = 'bkbg-cc-line-marker ' + (side === 'left' ? 'bkbg-cc-removed' : 'bkbg-cc-added');
                marker.textContent = side === 'left' ? '−' : '+';
                lineEl.appendChild(marker);
            }

            var codeSpan = document.createElement('span');
            codeSpan.className = 'bkbg-cc-line-code';
            codeSpan.style.color = opts.codeColor;

            var tokens = tokenize(line, lang);
            tokens.forEach(function (tok) {
                var span = document.createElement('span');
                span.className = 'bkbg-cc-tok-' + tok.type;
                var col = TOKEN_COLOURS[tok.type];
                if (col) span.style.color = col;
                span.textContent = tok.text;
                codeSpan.appendChild(span);
            });

            lineEl.appendChild(codeSpan);
            fragment.appendChild(lineEl);
        });

        return fragment;
    }

    function buildPane(code, lang, label, opts, side, diffLinesArr) {
        var pane = document.createElement('div');
        pane.className = 'bkbg-cc-pane';
        pane.style.backgroundColor = side === 'left' ? opts.bgLeft : opts.bgRight;
        pane.dataset.side = side;
        pane.dataset.code = code;

        // Header
        var header = document.createElement('div');
        header.className = 'bkbg-cc-header';
        header.style.backgroundColor = side === 'left' ? opts.headerBgLeft : opts.headerBgRight;
        header.style.color = opts.headerColor;

        var titleEl = document.createElement('span');
        titleEl.textContent = label;
        header.appendChild(titleEl);

        var meta = document.createElement('div');
        meta.className = 'bkbg-cc-header-meta';

        if (opts.showLanguageBadge) {
            var badge = document.createElement('span');
            badge.className = 'bkbg-cc-lang-badge';
            badge.style.color = opts.headerColor;
            badge.textContent = lang.toUpperCase();
            meta.appendChild(badge);
        }
        if (opts.showCopyButtons) {
            var copyBtn = document.createElement('button');
            copyBtn.className = 'bkbg-cc-copy-btn';
            copyBtn.style.color = opts.headerColor;
            copyBtn.textContent = 'Copy';
            copyBtn.addEventListener('click', function () {
                navigator.clipboard.writeText(code).then(function () {
                    copyBtn.textContent = 'Copied!';
                    copyBtn.classList.add('bkbg-cc-copied');
                    setTimeout(function () {
                        copyBtn.textContent = 'Copy';
                        copyBtn.classList.remove('bkbg-cc-copied');
                    }, 1600);
                }).catch(function () {
                    var ta = document.createElement('textarea');
                    ta.value = code;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    copyBtn.textContent = 'Copied!';
                    setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1600);
                });
            });
            meta.appendChild(copyBtn);
        }

        header.appendChild(meta);
        pane.appendChild(header);

        // Code body
        var body = document.createElement('div');
        body.className = 'bkbg-cc-code-body';
        if (opts.maxHeight) body.style.maxHeight = opts.maxHeight + 'px';

        body.appendChild(buildPaneDOM(code, lang, opts, side, diffLinesArr));
        pane.appendChild(body);

        return pane;
    }

    function initCodeComparison(appEl) {
        var raw = appEl.dataset.opts;
        if (!raw) return;
        var opts;
        try { opts = JSON.parse(raw); } catch (e) { return; }

        // Parse diff lines
        var diffLinesArr = [];
        if (opts.diffLines && opts.diffLines.trim()) {
            opts.diffLines.split(',').forEach(function (s) {
                var n = parseInt(s.trim(), 10);
                if (!isNaN(n)) diffLinesArr.push(n - 1);
            });
        }

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-cc-wrap bkbg-cc-theme-' + (opts.theme || 'dark');
        wrap.style.borderRadius = (opts.borderRadius || 12) + 'px';
        wrap.style.overflow = 'hidden';
        if (opts.typoCode) typoCssVarsForEl(wrap, opts.typoCode, '--bkbg-cc-cd-');

        var inner = document.createElement('div');
        inner.className = 'bkbg-cc-inner';

        // Panes
        var leftPaneEl  = buildPane(opts.leftCode  || '', opts.leftLang  || 'javascript', opts.leftLabel  || 'Before', opts, 'left',  diffLinesArr);
        var rightPaneEl = buildPane(opts.rightCode || '', opts.rightLang || 'javascript', opts.rightLabel || 'After',  opts, 'right', diffLinesArr);

        var splitL = opts.splitRatio || 50;
        leftPaneEl.style.width  = splitL + '%';
        leftPaneEl.style.flexShrink = '0';
        leftPaneEl.style.flexGrow   = '0';
        rightPaneEl.style.width = (100 - splitL) + '%';
        rightPaneEl.style.flexShrink = '0';
        rightPaneEl.style.flexGrow   = '0';

        inner.appendChild(leftPaneEl);

        // Divider
        var divider = document.createElement('div');
        divider.className = 'bkbg-cc-divider';

        if (opts.draggableSplit) {
            var dragging = false, startX = 0, startL = splitL;

            divider.addEventListener('mousedown', function (e) {
                dragging = true;
                startX = e.clientX;
                startL = parseFloat(leftPaneEl.style.width);
                divider.classList.add('bkbg-cc-dragging');
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'col-resize';
                e.preventDefault();
            });
            document.addEventListener('mousemove', function (e) {
                if (!dragging) return;
                var dx = e.clientX - startX;
                var totalW = inner.getBoundingClientRect().width;
                var newL = Math.min(80, Math.max(20, startL + (dx / totalW * 100)));
                leftPaneEl.style.width  = newL + '%';
                rightPaneEl.style.width = (100 - newL) + '%';
            });
            document.addEventListener('mouseup', function () {
                if (!dragging) return;
                dragging = false;
                divider.classList.remove('bkbg-cc-dragging');
                document.body.style.userSelect = '';
                document.body.style.cursor = '';
            });
        }

        inner.appendChild(divider);
        inner.appendChild(rightPaneEl);
        wrap.appendChild(inner);

        appEl.parentNode.replaceChild(wrap, appEl);
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-cc-app').forEach(initCodeComparison);
    });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        document.querySelectorAll('.bkbg-cc-app').forEach(initCodeComparison);
    }
})();
