(function () {
    'use strict';

    /* ── Typography CSS-var helper ── */
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

    /* ── Theme presets ── */
    var THEMES = {
        'dark':            { headerBg: '#1e1e2e', codeBg: '#13131f', codeColor: '#e0e0f0', activeBg: '#6366f1', activeColor: '#ffffff', idleBg: '#2d2d3f', idleColor: '#a0a0c0', lineNum: '#4a4a6a', copyBg: '#2d2d3f', copyColor: '#a0a0c0' },
        'monokai':         { headerBg: '#272822', codeBg: '#1e1f1c', codeColor: '#f8f8f2', activeBg: '#a6e22e', activeColor: '#272822', idleBg: '#3e3d32', idleColor: '#75715e', lineNum: '#49483e', copyBg: '#3e3d32', copyColor: '#75715e' },
        'dracula':         { headerBg: '#21222c', codeBg: '#282a36', codeColor: '#f8f8f2', activeBg: '#bd93f9', activeColor: '#282a36', idleBg: '#343746', idleColor: '#6272a4', lineNum: '#44475a', copyBg: '#343746', copyColor: '#6272a4' },
        'github-dark':     { headerBg: '#161b22', codeBg: '#0d1117', codeColor: '#c9d1d9', activeBg: '#388bfd', activeColor: '#ffffff', idleBg: '#21262d', idleColor: '#8b949e', lineNum: '#30363d', copyBg: '#21262d', copyColor: '#8b949e' },
        'nord':            { headerBg: '#2e3440', codeBg: '#242933', codeColor: '#d8dee9', activeBg: '#88c0d0', activeColor: '#2e3440', idleBg: '#3b4252', idleColor: '#4c566a', lineNum: '#434c5e', copyBg: '#3b4252', copyColor: '#4c566a' },
        'light':           { headerBg: '#f3f4f6', codeBg: '#ffffff', codeColor: '#1f2328', activeBg: '#6366f1', activeColor: '#ffffff', idleBg: '#e5e7eb', idleColor: '#374151', lineNum: '#9ca3af', copyBg: '#e5e7eb', copyColor: '#374151' },
        'github-light':    { headerBg: '#f6f8fa', codeBg: '#ffffff', codeColor: '#1f2328', activeBg: '#0969da', activeColor: '#ffffff', idleBg: '#eaeef2', idleColor: '#57606a', lineNum: '#8c959f', copyBg: '#eaeef2', copyColor: '#57606a' },
        'solarized-light': { headerBg: '#eee8d5', codeBg: '#fdf6e3', codeColor: '#073642', activeBg: '#268bd2', activeColor: '#fdf6e3', idleBg: '#e0dac8', idleColor: '#586e75', lineNum: '#93a1a1', copyBg: '#e0dac8', copyColor: '#586e75' }
    };

    function esc(str) {
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function applyCSS(el, styles) {
        Object.keys(styles).forEach(function (k) { el.style[k] = styles[k]; });
    }

    function init() {
        document.querySelectorAll('.bkbg-ctabs-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                tabs: [],
                theme: 'dark',
                tabStyle: 'pills',
                tabAlign: 'left',
                showLineNumbers: true,
                showCopyButton: true,
                showFileName: true,
                showLangBadge: true,
                fontSize: 13,
                lineHeight: 1.65,
                maxHeight: 0,
                borderRadius: 10,
                paddingTop: 0,
                paddingBottom: 0,
                bgColor: '',
                headerBg: '',
                codeBg: '',
                tabActiveBg: '',
                tabActiveColor: '',
                tabIdleBg: '',
                tabIdleColor: '',
                lineNumColor: '',
                copyBg: '',
                copyColor: ''
            }, opts);

            var themeColors = THEMES[o.theme] || THEMES['dark'];

            /* Resolve final colors (user override → theme default) */
            function col(userVal, themeKey) {
                return (userVal && userVal !== '') ? userVal : themeColors[themeKey];
            }

            var hBg    = col(o.headerBg,      'headerBg');
            var cBg    = col(o.codeBg,         'codeBg');
            var cColor = themeColors.codeColor;
            var aTabBg = col(o.tabActiveBg,    'activeBg');
            var aTabC  = col(o.tabActiveColor, 'activeColor');
            var iTabBg = col(o.tabIdleBg,      'idleBg');
            var iTabC  = col(o.tabIdleColor,   'idleColor');
            var lnC    = col(o.lineNumColor,   'lineNum');
            var cpBg   = col(o.copyBg,         'copyBg');
            var cpC    = col(o.copyColor,      'copyColor');

            var tabs = o.tabs.length ? o.tabs :
                [{ label: 'example.js', lang: 'javascript', fileName: 'example.js', code: 'console.log("Hello, world!");' }];

            var activeIdx = 0;

            /* ── Outer wrap ── */
            var wrap = document.createElement('div');
            wrap.className = 'bkbg-ctabs-wrap theme-' + o.theme;
            wrap.dataset.tabStyle = o.tabStyle;
            applyCSS(wrap, {
                borderRadius: o.borderRadius + 'px',
                overflow: 'hidden',
                paddingTop: o.paddingTop + 'px',
                paddingBottom: o.paddingBottom + 'px',
                background: o.bgColor || ''
            });

            typoCssVarsForEl(wrap, o.typoCode, '--bkbg-ctabs-cd-');

            /* ── Chrome header ── */
            var chrome = document.createElement('div');
            chrome.className = 'bkbg-ctabs-chrome';
            applyCSS(chrome, { background: hBg });

            /* Window dots */
            var dotsEl = document.createElement('div');
            dotsEl.className = 'bkbg-ctabs-dots';
            [['#ff5f57'], ['#febc2e'], ['#28c840']].forEach(function (c) {
                var d = document.createElement('div');
                d.className = 'bkbg-ctabs-dot';
                d.style.background = c[0];
                dotsEl.appendChild(d);
            });
            chrome.appendChild(dotsEl);

            /* Tab bar */
            var tabBar = document.createElement('div');
            tabBar.className = 'bkbg-ctabs-tabbar is-' + o.tabAlign;

            /* Tab buttons */
            var tabBtns = [];

            function updateTabs(nextIdx) {
                tabBtns.forEach(function (btn, i) {
                    var isActive = i === nextIdx;
                    applyCSS(btn, {
                        background: o.tabStyle === 'underline' ? 'transparent' : (isActive ? aTabBg : iTabBg),
                        color: isActive ? aTabC : iTabC,
                        fontWeight: isActive ? '600' : '400',
                        borderBottom: o.tabStyle === 'underline' ? ('2px solid ' + (isActive ? aTabBg : 'transparent')) : ''
                    });
                    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
                });
                panels.forEach(function (panel, i) {
                    panel.classList.toggle('is-active', i === nextIdx);
                });

                /* Update copy button data */
                copyBtn.dataset.code = tabs[nextIdx].code || '';
                activeIdx = nextIdx;
            }

            tabs.forEach(function (tab, idx) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-ctabs-tab';
                btn.setAttribute('role', 'tab');
                btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
                btn.textContent = tab.label || ('Tab ' + (idx + 1));
                applyCSS(btn, {
                    background: o.tabStyle === 'underline' ? 'transparent' : (idx === 0 ? aTabBg : iTabBg),
                    color: idx === 0 ? aTabC : iTabC,
                    fontWeight: idx === 0 ? '600' : '400',
                    fontSize: '12px',
                    borderBottom: o.tabStyle === 'underline' ? ('2px solid ' + (idx === 0 ? aTabBg : 'transparent')) : ''
                });
                btn.addEventListener('click', function () { updateTabs(idx); });
                tabBar.appendChild(btn);
                tabBtns.push(btn);
            });

            chrome.appendChild(tabBar);

            /* Filename */
            var fileEl = null;
            if (o.showFileName) {
                fileEl = document.createElement('span');
                fileEl.className = 'bkbg-ctabs-filename';
                fileEl.style.color = iTabC;
                fileEl.textContent = tabs[0].fileName || '';
                chrome.appendChild(fileEl);
            }

            /* Lang badge */
            var langEl = null;
            if (o.showLangBadge) {
                langEl = document.createElement('span');
                langEl.className = 'bkbg-ctabs-lang';
                langEl.style.color = iTabC;
                langEl.textContent = (tabs[0].lang || 'text').toUpperCase();
                chrome.appendChild(langEl);
            }

            wrap.appendChild(chrome);

            /* ── Code body ── */
            var codeBody = document.createElement('div');
            codeBody.className = 'bkbg-ctabs-body';
            applyCSS(codeBody, {
                background: cBg,
                borderRadius: '0 0 ' + o.borderRadius + 'px ' + o.borderRadius + 'px'
            });
            if (o.maxHeight > 0) {
                applyCSS(codeBody, { maxHeight: o.maxHeight + 'px', overflowY: 'auto' });
            }

            /* Copy button */
            var copyBtn = document.createElement('button');
            copyBtn.className = 'bkbg-ctabs-copy';
            copyBtn.textContent = 'Copy';
            copyBtn.dataset.code = tabs[0].code || '';
            applyCSS(copyBtn, { background: cpBg, color: cpC });
            copyBtn.addEventListener('click', function () {
                var code = copyBtn.dataset.code;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(code).then(function () {
                        copyBtn.textContent = 'Copied!';
                        copyBtn.classList.add('is-copied');
                        setTimeout(function () {
                            copyBtn.textContent = 'Copy';
                            copyBtn.classList.remove('is-copied');
                        }, 2000);
                    }).catch(function () {});
                } else {
                    /* Fallback */
                    var ta = document.createElement('textarea');
                    ta.value = code;
                    ta.style.position = 'absolute';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); } catch (e) {}
                    document.body.removeChild(ta);
                    copyBtn.textContent = 'Copied!';
                    setTimeout(function () { copyBtn.textContent = 'Copy'; }, 2000);
                }
            });

            if (o.showCopyButton) codeBody.appendChild(copyBtn);

            /* Inner scroll wrapper */
            var inner = document.createElement('div');
            inner.className = 'bkbg-ctabs-inner';

            /* ── Panels ── */
            var panels = [];

            tabs.forEach(function (tab, idx) {
                var panel = document.createElement('div');
                panel.className = 'bkbg-ctabs-panel' + (idx === 0 ? ' is-active' : '');

                var lines = (tab.code || '').split('\n');
                lines.forEach(function (line, li) {
                    var row = document.createElement('div');
                    row.className = 'bkbg-ctabs-line';

                    if (o.showLineNumbers) {
                        var numEl = document.createElement('span');
                        numEl.className = 'bkbg-ctabs-linenum';
                        numEl.textContent = li + 1;
                        applyCSS(numEl, {
                            color: lnC
                        });
                        row.appendChild(numEl);
                    }

                    var codeEl = document.createElement('span');
                    codeEl.className = 'bkbg-ctabs-code';
                    codeEl.textContent = line;
                    applyCSS(codeEl, {
                        color: cColor
                    });
                    row.appendChild(codeEl);
                    panel.appendChild(row);
                });

                inner.appendChild(panel);
                panels.push(panel);
            });

            codeBody.appendChild(inner);
            wrap.appendChild(codeBody);

            /* ── Tab switching also updates filename / lang ── */
            tabBtns.forEach(function (btn, idx) {
                btn.addEventListener('click', function () {
                    if (fileEl) fileEl.textContent = tabs[idx].fileName || '';
                    if (langEl) langEl.textContent = (tabs[idx].lang || 'text').toUpperCase();
                });
            });

            /* ── Keyboard navigation (arrow keys) ── */
            tabBar.setAttribute('role', 'tablist');
            tabBar.addEventListener('keydown', function (e) {
                var key = e.key;
                if (key === 'ArrowRight') {
                    e.preventDefault();
                    var next = (activeIdx + 1) % tabs.length;
                    updateTabs(next);
                    tabBtns[next].focus();
                    if (fileEl) fileEl.textContent = tabs[next].fileName || '';
                    if (langEl) langEl.textContent = (tabs[next].lang || 'text').toUpperCase();
                } else if (key === 'ArrowLeft') {
                    e.preventDefault();
                    var prev = (activeIdx - 1 + tabs.length) % tabs.length;
                    updateTabs(prev);
                    tabBtns[prev].focus();
                    if (fileEl) fileEl.textContent = tabs[prev].fileName || '';
                    if (langEl) langEl.textContent = (tabs[prev].lang || 'text').toUpperCase();
                }
            });

            appEl.parentNode.insertBefore(wrap, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
