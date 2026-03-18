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

    document.querySelectorAll('.bkbg-cm-app').forEach(function (app) {
        var o;
        try { o = JSON.parse(app.dataset.opts || '{}'); } catch (e) { return; }

        var plans       = Array.isArray(o.plans)    ? o.plans    : [];
        var features    = Array.isArray(o.features) ? o.features : [];
        var stickyHdr   = !!o.stickyHeader;
        var checkIcon   = o.checkIcon   || '✓';
        var crossIcon   = o.crossIcon   || '✕';
        var checkIconType = o.checkIconType || 'custom-char';
        var checkIconDashicon = o.checkIconDashicon || '';
        var checkIconImageUrl = o.checkIconImageUrl, checkIconImageUrlColor = o.checkIconDashiconColor || '';
        var crossIconType = o.crossIconType || 'custom-char';
        var crossIconDashicon = o.crossIconDashicon || '';
        var crossIconImageUrl = o.crossIconImageUrl, crossIconImageUrlColor = o.crossIconDashiconColor || '';
        var firstColW   = o.firstColWidth || 200;
        var cellPad     = o.cellPadding  || 16;
        var headerR     = o.headerRadius || 12;
        var fontSize    = o.fontSize     || 14;
        var headerBg    = o.headerBg     || '#f8fafc';
        var headerColor = o.headerColor  || '#0f172a';
        var hlBg        = o.highlightBg  || '#6366f1';
        var hlColor     = o.highlightColor || '#ffffff';
        var rowBg       = o.rowBg        || '#ffffff';
        var rowAltBg    = o.rowAltBg     || '#f8fafc';
        var rowColor    = o.rowColor     || '#334155';
        var borderColor = o.borderColor  || '#e2e8f0';
        var checkColor  = o.checkColor   || '#10b981';
        var crossColor  = o.crossColor   || '#f43f5e';
        var badgeBg     = o.badgeBg      || '#fef3c7';
        var badgeColor  = o.badgeColor   || '#92400e';
        var sectionBg   = o.sectionBg   || '';

        if (sectionBg) app.style.background = sectionBg;

        /* ── Typography CSS vars ── */
        typoCssVarsForEl(app, o.typoHeader, '--bkcm-header-');
        typoCssVarsForEl(app, o.typoBody, '--bkcm-body-');

        /* ── CSS vars ── */
        app.style.setProperty('--cm-border',     borderColor);
        app.style.setProperty('--cm-header-bg',  headerBg);
        app.style.setProperty('--cm-header-clr', headerColor);
        app.style.setProperty('--cm-hl-bg',      hlBg);
        app.style.setProperty('--cm-hl-clr',     hlColor);
        app.style.setProperty('--cm-check',      checkColor);
        app.style.setProperty('--cm-cross',      crossColor);

        /* ── Build table ── */
        var table = document.createElement('table');
        table.className   = 'bkbg-cm-table' + (stickyHdr ? ' bkbg-cm-sticky' : '');

        /* ── Head ── */
        var thead = document.createElement('thead');
        var hrow  = document.createElement('tr');

        /* empty first col */
        var th0 = document.createElement('th');
        th0.className = 'bkbg-cm-th bkbg-cm-th-feature';
        th0.style.width       = firstColW + 'px';
        th0.style.borderRadius = headerR + 'px 0 0 0';
        hrow.appendChild(th0);

        plans.forEach(function (p, pi) {
            var th = document.createElement('th');
            th.className = 'bkbg-cm-th' + (p.highlight ? ' bkbg-cm-highlight' : '');
            if (pi === plans.length - 1) th.style.borderRadius = '0 ' + headerR + 'px 0 0';

            if (p.badge) {
                var badge = document.createElement('div');
                badge.className = 'bkbg-cm-badge';
                badge.textContent = p.badge;
                badge.style.background = badgeBg;
                badge.style.color      = badgeColor;
                th.appendChild(badge);
            }
            var name = document.createElement('span');
            name.className   = 'bkbg-cm-plan-name';
            name.textContent = p.name || '';
            th.appendChild(name);

            if (p.subtitle) {
                var sub = document.createElement('span');
                sub.className   = 'bkbg-cm-plan-sub';
                sub.textContent = p.subtitle;
                th.appendChild(sub);
            }
            hrow.appendChild(th);
        });

        thead.appendChild(hrow);
        table.appendChild(thead);

        /* ── Body ── */
        var tbody = document.createElement('tbody');
        var altRow = 0;
        var lastGroup = null;

        features.forEach(function (f) {
            /* Group header */
            if (f.group && f.group !== lastGroup) {
                lastGroup = f.group;
                var gr = document.createElement('tr');
                gr.className = 'bkbg-cm-group-row';
                var gtd = document.createElement('td');
                gtd.colSpan = plans.length + 1;
                gtd.textContent = f.group;
                gr.appendChild(gtd);
                tbody.appendChild(gr);
            }

            var tr = document.createElement('tr');
            tr.style.background = altRow % 2 === 0 ? rowBg : rowAltBg;
            altRow++;

            /* feature label */
            var labelTd = document.createElement('td');
            labelTd.className   = 'bkbg-cm-td bkbg-cm-td-feature';
            labelTd.style.width = firstColW + 'px';
            labelTd.style.padding = cellPad + 'px';
            labelTd.textContent  = f.label || '';
            tr.appendChild(labelTd);

            /* value cells */
            plans.forEach(function (p, pi) {
                var val = (f.values && f.values[pi] != null) ? String(f.values[pi]) : '';
                var td  = document.createElement('td');
                td.className = 'bkbg-cm-td' + (p.highlight ? ' bkbg-cm-hl-col' : '');
                td.style.padding = cellPad + 'px';
                td.style.color   = rowColor;

                if (val === 'true') {
                    var chk = document.createElement('span');
                    chk.className   = 'bkbg-cm-check';
                    var IPf = window.bkbgIconPicker;
                    if (IPf && checkIconType !== 'custom-char') {
                        var chkIcon = IPf.buildFrontendIcon(checkIconType, checkIcon, checkIconDashicon, checkIconImageUrl, checkIconImageUrlColor);
                        if (chkIcon) chk.appendChild(chkIcon);
                        else chk.textContent = checkIcon;
                    } else {
                        chk.textContent = checkIcon;
                    }
                    td.appendChild(chk);
                } else if (val === 'false') {
                    var crs = document.createElement('span');
                    crs.className   = 'bkbg-cm-cross';
                    var IPf2 = window.bkbgIconPicker;
                    if (IPf2 && crossIconType !== 'custom-char') {
                        var crsIcon = IPf2.buildFrontendIcon(crossIconType, crossIcon, crossIconDashicon, crossIconImageUrl, crossIconImageUrlColor);
                        if (crsIcon) crs.appendChild(crsIcon);
                        else crs.textContent = crossIcon;
                    } else {
                        crs.textContent = crossIcon;
                    }
                    td.appendChild(crs);
                } else {
                    var txt = document.createElement('span');
                    txt.className   = 'bkbg-cm-text-val';
                    txt.textContent = val;
                    td.appendChild(txt);
                }

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        app.appendChild(table);
    });
}());
