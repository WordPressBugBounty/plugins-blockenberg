(function () {
    'use strict';

    function toTitleCase(s) {
        return s.replace(/\w\S*/g, function(w){ return w.charAt(0).toUpperCase() + w.substr(1).toLowerCase(); });
    }
    function toSentenceCase(s) {
        return s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, function(c){ return c.toUpperCase(); });
    }
    function toCamelCase(s) {
        return s.replace(/[^a-zA-Z0-9]+(.)/g, function(_, c){ return c.toUpperCase(); })
                .replace(/^[A-Z]/, function(c){ return c.toLowerCase(); });
    }
    function toPascalCase(s) {
        var c = toCamelCase(s);
        return c.charAt(0).toUpperCase() + c.slice(1);
    }
    function toSnakeCase(s) {
        return s.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    }
    function toKebabCase(s) {
        return s.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    var CASES = [
        { key: 'showUppercase',    label: 'UPPERCASE',     fn: function(s){ return s.toUpperCase(); } },
        { key: 'showLowercase',    label: 'lowercase',     fn: function(s){ return s.toLowerCase(); } },
        { key: 'showTitleCase',    label: 'Title Case',    fn: toTitleCase },
        { key: 'showSentenceCase', label: 'Sentence case', fn: toSentenceCase },
        { key: 'showCamelCase',    label: 'camelCase',     fn: toCamelCase },
        { key: 'showPascalCase',   label: 'PascalCase',    fn: toPascalCase },
        { key: 'showSnakeCase',    label: 'snake_case',    fn: toSnakeCase },
        { key: 'showKebabCase',    label: 'kebab-case',    fn: toKebabCase }
    ];

    function init(app) {
        var a;
        try { a = JSON.parse(app.getAttribute('data-opts')); } catch(e) { return; }

        var accent = a.accentColor || '#6c3fb5';
        var activeRows = CASES.filter(function(c){ return a[c.key]; });

        // Apply section styles
        app.style.paddingTop    = (a.paddingTop || 60) + 'px';
        app.style.paddingBottom = (a.paddingBottom || 60) + 'px';
        if (a.sectionBg) app.style.background = a.sectionBg;
        app.innerHTML = '';

        // Wrap
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-tcc-wrap';
        wrap.style.maxWidth     = (a.maxWidth || 640) + 'px';
        wrap.style.borderRadius = (a.cardRadius || 16) + 'px';
        wrap.style.background   = a.cardBg || '#fff';
        app.appendChild(wrap);

        // Header
        if (a.showTitle || a.showSubtitle) {
            var header = document.createElement('div');
            header.className = 'bkbg-tcc-header';
            if (a.showTitle && a.title) {
                var title = document.createElement('div');
                title.className = 'bkbg-tcc-title';
                title.textContent = a.title;
                if (a.titleColor) title.style.color = a.titleColor;
                header.appendChild(title);
            }
            if (a.showSubtitle && a.subtitle) {
                var sub = document.createElement('div');
                sub.className = 'bkbg-tcc-subtitle';
                sub.textContent = a.subtitle;
                if (a.subtitleColor) sub.style.color = a.subtitleColor;
                header.appendChild(sub);
            }
            wrap.appendChild(header);
        }

        // Textarea
        var textarea = document.createElement('textarea');
        textarea.className = 'bkbg-tcc-textarea';
        textarea.placeholder = a.placeholder || 'Paste or type your text here…';
        textarea.rows = 4;
        textarea.style.borderRadius = (a.rowRadius || 10) + 'px';
        textarea.style.border = '1.5px solid ' + (a.inputBorder || '#e5e7eb');
        textarea.style.background = a.inputBg || '#f9fafb';
        wrap.appendChild(textarea);

        // Rows container
        var rowsContainer = document.createElement('div');
        rowsContainer.className = 'bkbg-tcc-rows';
        wrap.appendChild(rowsContainer);

        // Build rows
        var valueEls = {};
        var copyBtns = {};

        activeRows.forEach(function(c) {
            var row = document.createElement('div');
            row.className = 'bkbg-tcc-row';
            row.style.background    = a.rowBg    || '#f9fafb';
            row.style.borderColor   = a.rowBorder || '#e5e7eb';
            row.style.borderRadius  = (a.rowRadius || 10) + 'px';

            var lbl = document.createElement('div');
            lbl.className   = 'bkbg-tcc-row-label';
            lbl.textContent = c.label;
            if (a.rowLabelColor) lbl.style.color = a.rowLabelColor;

            var val = document.createElement('div');
            val.className = 'bkbg-tcc-row-value empty';
            val.textContent = 'No text entered';
            if (a.rowValueColor) val.style.color = a.rowValueColor;
            valueEls[c.key] = val;

            row.appendChild(lbl);
            row.appendChild(val);

            if (a.showCopyButtons) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-tcc-copy-btn';
                btn.textContent = 'Copy';
                btn.style.background = a.copyBg || accent;
                btn.style.color      = a.copyColor || '#fff';
                copyBtns[c.key] = btn;
                btn.addEventListener('click', function() {
                    var result = val.textContent;
                    if (!result || val.classList.contains('empty')) return;
                    navigator.clipboard.writeText(result).then(function() {
                        btn.textContent = '✓ Copied';
                        btn.classList.add('copied');
                        btn.style.background = '#10b981';
                        setTimeout(function() {
                            btn.textContent = 'Copy';
                            btn.classList.remove('copied');
                            btn.style.background = a.copyBg || accent;
                        }, 1500);
                    }).catch(function() {});
                });
                row.appendChild(btn);
            }

            rowsContainer.appendChild(row);
        });

        function update() {
            var text = textarea.value;
            activeRows.forEach(function(c) {
                var el = valueEls[c.key];
                if (!el) return;
                if (!text.trim()) {
                    el.textContent = 'No text entered';
                    el.classList.add('empty');
                    if (a.rowValueColor) el.style.color = '#d1d5db';
                } else {
                    el.textContent = c.fn(text);
                    el.classList.remove('empty');
                    if (a.rowValueColor) el.style.color = a.rowValueColor;
                }
            });
        }

        textarea.addEventListener('input', update);
        update();
    }

    document.querySelectorAll('.bkbg-tcc-app').forEach(init);
})();
