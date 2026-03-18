(function () {
    'use strict';

    var METHOD_COLORS = {
        GET:    { bg: '#22c55e', color: '#fff' },
        POST:   { bg: '#3b82f6', color: '#fff' },
        PUT:    { bg: '#f59e0b', color: '#fff' },
        PATCH:  { bg: '#8b5cf6', color: '#fff' },
        DELETE: { bg: '#ef4444', color: '#fff' }
    };

    var AUTH_LABELS = {
        none: 'No Auth',
        bearer: 'Bearer Token',
        'api-key': 'API Key',
        basic: 'Basic Auth'
    };

    function applyCSS(el, styles) {
        Object.keys(styles).forEach(function (k) { el.style[k] = styles[k]; });
    }

    function makeEl(tag, className, styles) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (styles) applyCSS(el, styles);
        return el;
    }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        return Promise.resolve();
    }

    function buildParamsTable(params, tableBg, tableAltBg, borderColor) {
        if (!params || params.length === 0) {
            var empty = makeEl('p', 'bkbg-apir-empty');
            empty.textContent = 'No parameters defined.';
            return empty;
        }

        var table = makeEl('table', 'bkbg-apir-table');
        table.style.setProperty('--bkbg-apir-table-bg', tableBg || '#fff');
        table.style.setProperty('--bkbg-apir-table-alt', tableAltBg || '#f8fafc');

        var thead = document.createElement('thead');
        var hRow = document.createElement('tr');
        ['Name', 'Type', 'In', 'Required', 'Description', 'Example'].forEach(function (h) {
            var th = document.createElement('th'); th.textContent = h; hRow.appendChild(th);
        });
        thead.appendChild(hRow); table.appendChild(thead);

        var tbody = document.createElement('tbody');
        params.forEach(function (p, i) {
            var row = document.createElement('tr');
            if (i % 2) row.className = 'alt';

            // Name
            var tdName = document.createElement('td');
            var cName = document.createElement('code'); cName.textContent = p.name; tdName.appendChild(cName);

            // Type
            var tdType = document.createElement('td');
            var spanType = makeEl('span', 'bkbg-apir-type'); spanType.textContent = p.type; tdType.appendChild(spanType);

            // Location
            var tdLoc = document.createElement('td');
            var spanLoc = makeEl('span', 'bkbg-apir-loc bkbg-apir-loc-' + p.location); spanLoc.textContent = p.location; tdLoc.appendChild(spanLoc);

            // Required
            var tdReq = document.createElement('td');
            var spanReq = makeEl('span', p.required ? 'bkbg-apir-req' : 'bkbg-apir-opt');
            spanReq.textContent = p.required ? '✓' : '—'; tdReq.appendChild(spanReq);

            // Description
            var tdDesc = document.createElement('td'); tdDesc.textContent = p.description;

            // Example
            var tdEx = document.createElement('td');
            if (p.example) { var cEx = document.createElement('code'); cEx.textContent = p.example; tdEx.appendChild(cEx); }
            else { tdEx.textContent = '—'; }

            [tdName, tdType, tdLoc, tdReq, tdDesc, tdEx].forEach(function (td) { row.appendChild(td); });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        return table;
    }

    function buildCodePanel(code, lang, showCopy, theme) {
        var isDark = theme !== 'light';
        var codeBg = isDark ? '#1e1e2e' : '#f8fafc';
        var codeColor = isDark ? '#a9b1d6' : '#334155';

        var panel = makeEl('div', 'bkbg-apir-code-panel');
        applyCSS(panel, { background: codeBg, color: codeColor });

        if (showCopy) {
            var copyBtn = makeEl('button', 'bkbg-apir-copy');
            copyBtn.textContent = '📋 Copy';
            copyBtn.addEventListener('click', function () {
                copyText(code).then(function () {
                    copyBtn.textContent = '✓ Copied!';
                    setTimeout(function () { copyBtn.textContent = '📋 Copy'; }, 2000);
                });
            });
            panel.appendChild(copyBtn);
        }

        var langBadge = makeEl('span', 'bkbg-apir-lang-badge'); langBadge.textContent = lang;
        panel.appendChild(langBadge);

        var pre = makeEl('pre', 'bkbg-apir-code');
        applyCSS(pre, { background: codeBg, color: codeColor });
        pre.textContent = code;
        panel.appendChild(pre);

        return panel;
    }

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

    function init() {
        document.querySelectorAll('.bkbg-apir-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                method: 'GET',
                endpoint: '/api/v1/users/{id}',
                baseUrl: 'https://api.example.com',
                title: 'API Endpoint',
                description: '',
                authType: 'bearer',
                params: [],
                requestExample: '',
                responseExample: '',
                requestLang: 'curl',
                responseLang: 'json',
                showCopyButton: true,
                showBaseUrl: true,
                showAuth: true,
                defaultTab: 'params',
                codeTheme: 'dark',
                getBg: '#22c55e',
                postBg: '#3b82f6',
                putBg: '#f59e0b',
                patchBg: '#8b5cf6',
                deleteBg: '#ef4444',
                headerBg: '#1e1e2e',
                headerColor: '#e2e8f0',
                tableBg: '#ffffff',
                tableAltBg: '#f8fafc',
                borderColor: '#e2e8f0',
                borderRadius: 8,
                fontSize: 13
            }, opts);

            // Determine method color
            var methodBgKey = o.method.toLowerCase() + 'Bg';
            var methodColors = METHOD_COLORS[o.method] || { bg: '#64748b', color: '#fff' };
            // Override from saved opts
            var customBg = o[methodBgKey];
            if (customBg) methodColors = { bg: customBg, color: '#fff' };

            // Outer wrapper
            var wrap = makeEl('div', 'bkbg-apir-wrap');
            wrap.style.setProperty('--bkbg-apir-border', o.borderColor);
            wrap.style.setProperty('--bkbg-apir-radius', o.borderRadius + 'px');
            wrap.style.setProperty('--bkbg-apir-fs', o.fontSize + 'px');
            typoCssVarsForEl(o.textTypo, '--bkbg-apir-', wrap);

            // ── Header ────────────────────────────────────────────────
            var header = makeEl('div', 'bkbg-apir-header');
            applyCSS(header, { background: o.headerBg, color: o.headerColor });

            var methodBadge = makeEl('span', 'bkbg-apir-method');
            methodBadge.textContent = o.method;
            applyCSS(methodBadge, { background: methodColors.bg, color: methodColors.color });
            header.appendChild(methodBadge);

            if (o.showBaseUrl && o.baseUrl) {
                var baseUrlSpan = makeEl('span', 'bkbg-apir-base-url');
                baseUrlSpan.textContent = o.baseUrl;
                header.appendChild(baseUrlSpan);
            }

            var endpointSpan = makeEl('span', 'bkbg-apir-endpoint');
            endpointSpan.textContent = o.endpoint;
            header.appendChild(endpointSpan);

            if (o.showAuth && o.authType && o.authType !== 'none') {
                var authBadge = makeEl('span', 'bkbg-apir-auth-badge');
                authBadge.textContent = AUTH_LABELS[o.authType] || o.authType;
                header.appendChild(authBadge);
            }
            wrap.appendChild(header);

            // ── Meta (title + description) ─────────────────────────
            var meta = makeEl('div', 'bkbg-apir-meta');

            var titleEl = document.createElement('h3');
            titleEl.className = 'bkbg-apir-title';
            titleEl.textContent = o.title;
            meta.appendChild(titleEl);

            if (o.description) {
                var descEl = makeEl('p', 'bkbg-apir-desc');
                descEl.textContent = o.description;
                meta.appendChild(descEl);
            }
            wrap.appendChild(meta);

            // ── Tab bar ────────────────────────────────────────────
            var activeTab = o.defaultTab || 'params';
            var tabBar = makeEl('div', 'bkbg-apir-tabbar');
            var tabDefs = [
                { key: 'params', label: 'Parameters' },
                { key: 'request', label: 'Request' },
                { key: 'response', label: 'Response' }
            ];

            var panels = {};

            // ── Body ───────────────────────────────────────────────
            var body = makeEl('div', 'bkbg-apir-body');

            // Params panel
            var paramsWrap = makeEl('div', 'bkbg-apir-params');
            paramsWrap.appendChild(buildParamsTable(o.params, o.tableBg, o.tableAltBg, o.borderColor));
            body.appendChild(paramsWrap);
            panels.params = paramsWrap;

            // Request panel
            var requestPanel = buildCodePanel(o.requestExample, o.requestLang, o.showCopyButton, o.codeTheme);
            body.appendChild(requestPanel);
            panels.request = requestPanel;

            // Response panel
            var responsePanel = buildCodePanel(o.responseExample, o.responseLang, o.showCopyButton, o.codeTheme);
            body.appendChild(responsePanel);
            panels.response = responsePanel;

            function switchTab(key) {
                activeTab = key;
                tabDefs.forEach(function (td) {
                    var btn = tabBar.querySelector('[data-tab="' + td.key + '"]');
                    if (btn) btn.className = 'bkbg-apir-tab' + (key === td.key ? ' is-active' : '');
                    if (panels[td.key]) panels[td.key].style.display = key === td.key ? '' : 'none';
                });
            }

            tabDefs.forEach(function (td) {
                var btn = makeEl('button', 'bkbg-apir-tab' + (activeTab === td.key ? ' is-active' : ''));
                btn.textContent = td.label;
                btn.dataset.tab = td.key;
                btn.addEventListener('click', function () { switchTab(td.key); });
                tabBar.appendChild(btn);
            });

            // Initialize visibility
            tabDefs.forEach(function (td) {
                if (panels[td.key]) panels[td.key].style.display = td.key === activeTab ? '' : 'none';
            });

            wrap.appendChild(tabBar);
            wrap.appendChild(body);

            appEl.parentNode.insertBefore(wrap, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
