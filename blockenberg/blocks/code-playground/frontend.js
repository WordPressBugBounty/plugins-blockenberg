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

    var TAB_COLORS = { html: '#e34c26', css: '#264de4', js: '#f0db4f' };
    var TAB_TEXT   = { html: '#ffffff', css: '#ffffff', js: '#1e1b4b' };

    function debounce(fn, ms) {
        var t;
        return function () {
            clearTimeout(t);
            t = setTimeout(fn, ms);
        };
    }

    function buildSrc(html, css, js) {
        return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' + css + '</style></head><body>' + html + '<script>' + js + '<\/script></body></html>';
    }

    function initBlock(root) {
        var optsRaw = root.getAttribute('data-opts');
        var opts;
        try { opts = JSON.parse(optsRaw); } catch (e) { opts = {}; }

        var layout      = opts.layout      || 'horizontal';
        var editorH     = opts.editorHeight || 180;
        var previewH    = opts.previewHeight || 260;
        var accent      = opts.accentColor  || '#6366f1';
        var editorBg    = opts.editorBg     || '#1e1b4b';
        var editorText  = opts.editorText   || '#e2e8f0';
        var headerBg    = opts.headerBg     || '#312e81';
        var previewBg   = opts.previewBg    || '#ffffff';
        var autoRun     = opts.autoRun !== false;

        // Apply section bg
        if (opts.sectionBg) root.style.background = opts.sectionBg;

        // Apply typography CSS vars on root
        if (opts.typoTitle) typoCssVarsForEl(root, opts.typoTitle, '--bkbg-cpg-tt-');
        if (opts.typoSubtitle) typoCssVarsForEl(root, opts.typoSubtitle, '--bkbg-cpg-st-');

        // Apply title colors
        var titleEl = root.querySelector('.bkbg-cpg-title');
        if (titleEl) {
            titleEl.style.color = opts.titleColor || '#1e1b4b';
        }
        var subtitleEl = root.querySelector('.bkbg-cpg-subtitle');
        if (subtitleEl) {
            subtitleEl.style.color = opts.titleColor || '#1e1b4b';
        }

        var htmlCode = opts.defaultHtml || '';
        var cssCode  = opts.defaultCss  || '';
        var jsCode   = opts.defaultJs   || '';

        var activeTab = 'html';

        // ----- Build UI elements -----

        // Tabs (for tabbed layout)
        var tabsEl = null;
        if (layout === 'tabbed') {
            tabsEl = document.createElement('div');
            tabsEl.className = 'bkbg-cpg-tabs';

            ['html', 'css', 'js'].forEach(function (lang) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-cpg-tab-btn' + (lang === 'html' ? ' bkbg-cpg-active' : '');
                btn.textContent = lang.toUpperCase();
                btn.style.background = TAB_COLORS[lang];
                btn.style.color      = TAB_TEXT[lang];
                btn.dataset.lang     = lang;
                tabsEl.appendChild(btn);
            });

            root.appendChild(tabsEl);
        }

        // Editors container
        var editorsEl = document.createElement('div');
        editorsEl.className = 'bkbg-cpg-editors bkbg-cpg-' + layout;
        root.appendChild(editorsEl);

        var textareas = {};

        function createPanel(lang, defaultCode) {
            var panel = document.createElement('div');
            panel.className = 'bkbg-cpg-panel';
            panel.dataset.lang = lang;

            var header = document.createElement('div');
            header.className = 'bkbg-cpg-panel-header' + (lang === 'js' ? ' bkbg-cpg-js-header' : '');
            header.style.background = TAB_COLORS[lang];
            header.textContent = lang.toUpperCase();
            panel.appendChild(header);

            var textarea = document.createElement('textarea');
            textarea.className = 'bkbg-cpg-textarea';
            textarea.value = defaultCode;
            textarea.style.background  = editorBg;
            textarea.style.color       = editorText;
            textarea.style.height      = editorH + 'px';
            textarea.setAttribute('spellcheck', 'false');
            textarea.setAttribute('autocorrect', 'off');
            textarea.setAttribute('autocapitalize', 'off');

            // Tab key support
            textarea.addEventListener('keydown', function (e) {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    var start = textarea.selectionStart;
                    var end   = textarea.selectionEnd;
                    textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
                    textarea.selectionStart = textarea.selectionEnd = start + 2;
                }
            });

            panel.appendChild(textarea);
            textareas[lang] = textarea;
            return panel;
        }

        editorsEl.appendChild(createPanel('html', htmlCode));
        editorsEl.appendChild(createPanel('css',  cssCode));
        editorsEl.appendChild(createPanel('js',   jsCode));

        // Tabbed mode: hide inactive panels
        if (layout === 'tabbed') {
            function showTab(lang) {
                activeTab = lang;
                var panels = editorsEl.querySelectorAll('.bkbg-cpg-panel');
                panels.forEach(function (p) {
                    p.style.display = p.dataset.lang === lang ? 'flex' : 'none';
                });
                tabsEl.querySelectorAll('.bkbg-cpg-tab-btn').forEach(function (btn) {
                    btn.classList.toggle('bkbg-cpg-active', btn.dataset.lang === lang);
                });
            }
            showTab('html');
            tabsEl.addEventListener('click', function (e) {
                if (e.target.dataset.lang) showTab(e.target.dataset.lang);
            });
        }

        // ----- Toolbar -----
        var toolbar = document.createElement('div');
        toolbar.className = 'bkbg-cpg-toolbar';

        var runBtn = document.createElement('button');
        runBtn.className = 'bkbg-cpg-run-btn';
        runBtn.textContent = '▶ Run';
        runBtn.style.background = accent;
        runBtn.style.color = '#fff';

        var resetBtn = document.createElement('button');
        resetBtn.className = 'bkbg-cpg-reset-btn';
        resetBtn.textContent = '↺ Reset';
        resetBtn.style.background = '#e5e7eb';
        resetBtn.style.color = '#374151';

        var autoLabel = document.createElement('label');
        autoLabel.className = 'bkbg-cpg-autorun-label';
        var autoCheck = document.createElement('input');
        autoCheck.type = 'checkbox';
        autoCheck.checked = autoRun;
        autoLabel.appendChild(autoCheck);
        autoLabel.appendChild(document.createTextNode(' Auto-run'));
        autoLabel.style.color = opts.titleColor || '#374151';

        toolbar.appendChild(runBtn);
        toolbar.appendChild(resetBtn);
        toolbar.appendChild(autoLabel);
        root.appendChild(toolbar);

        // ----- Preview iframe -----
        var previewWrap = document.createElement('div');
        previewWrap.className = 'bkbg-cpg-preview-wrap';

        var previewHeader = document.createElement('div');
        previewHeader.className = 'bkbg-cpg-preview-header';
        previewHeader.style.background = headerBg;

        var dot = document.createElement('span');
        dot.className = 'bkbg-cpg-preview-dot';
        previewHeader.appendChild(dot);
        previewHeader.appendChild(document.createTextNode('Preview'));
        previewWrap.appendChild(previewHeader);

        var iframe = document.createElement('iframe');
        iframe.className = 'bkbg-cpg-iframe';
        iframe.style.height = previewH + 'px';
        iframe.style.background = previewBg;
        iframe.setAttribute('sandbox', 'allow-scripts');
        iframe.setAttribute('title', 'Code preview');
        previewWrap.appendChild(iframe);
        root.appendChild(previewWrap);

        // ----- Run logic -----
        function runCode() {
            var html = textareas.html.value;
            var css  = textareas.css.value;
            var js   = textareas.js.value;
            var src  = buildSrc(html, css, js);
            iframe.srcdoc = src;
        }

        var debouncedRun = debounce(runCode, 500);

        function handleInput() {
            if (autoCheck.checked) debouncedRun();
        }

        Object.values(textareas).forEach(function (ta) {
            ta.addEventListener('input', handleInput);
        });

        runBtn.addEventListener('click', runCode);

        resetBtn.addEventListener('click', function () {
            textareas.html.value = opts.defaultHtml || '';
            textareas.css.value  = opts.defaultCss  || '';
            textareas.js.value   = opts.defaultJs   || '';
            runCode();
        });

        // Initial run
        runCode();
    }

    document.querySelectorAll('.bkbg-cpg-app').forEach(function (root) {
        initBlock(root);
    });
})();
