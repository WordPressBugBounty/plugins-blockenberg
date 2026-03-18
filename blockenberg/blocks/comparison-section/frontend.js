(function () {
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

    function statusEl(v, c) {
        var span = document.createElement('span');
        if (v === 'yes')     { span.className = 'bkbg-cmp-yes';     span.textContent = '✓'; }
        else if (v === 'no') { span.className = 'bkbg-cmp-no';      span.textContent = '✗'; }
        else                 { span.className = 'bkbg-cmp-partial'; span.textContent = '∼'; }
        return span;
    }

    document.querySelectorAll('.bkbg-comparison-section-app').forEach(function (root) {
        var opts = {};
        try { opts = JSON.parse(root.dataset.opts || '{}'); } catch (e) {}

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-comparison-section-wrap';
        wrap.style.cssText = 'background:' + (opts.bgColor || '#fff') + ';padding:' + (opts.paddingTop || 80) + 'px 40px ' + (opts.paddingBottom || 80) + 'px;';
        wrap.style.setProperty('--bkbg-cmp-max', (opts.maxWidth || 1200) + 'px');
        wrap.style.setProperty('--bkbg-cmp-table-width', (opts.tableWidth || '720') + 'px');
        wrap.style.setProperty('--bkbg-cmp-border', opts.borderColor || '#e5e7eb');
        wrap.style.setProperty('--bkbg-cmp-hl-bg', opts.highlightBg || '#7c3aed');
        wrap.style.setProperty('--bkbg-cmp-hl-color', opts.highlightColor || '#fff');
        wrap.style.setProperty('--bkbg-cmp-yes', opts.yesColor || '#16a34a');
        wrap.style.setProperty('--bkbg-cmp-no', opts.noColor || '#dc2626');
        wrap.style.setProperty('--bkbg-cmp-partial', opts.partialColor || '#d97706');

        /* ── Typography CSS vars ── */
        typoCssVarsForEl(wrap, opts.typoHeading, '--bkcs-heading-');
        typoCssVarsForEl(wrap, opts.typoBody, '--bkcs-body-');

        var inner = document.createElement('div');
        inner.className = 'bkbg-cmp-inner';

        if (opts.showHeading !== false) {
            var h2 = document.createElement('h2');
            h2.className = 'bkbg-cmp-heading';
            h2.style.color = opts.headingColor || '#111827';
            h2.innerHTML = opts.heading || '';
            inner.appendChild(h2);

            var p = document.createElement('p');
            p.className = 'bkbg-cmp-subtext';
            p.style.color = opts.textColor || '#6b7280';
            p.innerHTML = opts.subtext || '';
            inner.appendChild(p);
        }

        var tableWrap = document.createElement('div');
        tableWrap.className = 'bkbg-cmp-table-wrap';

        var table = document.createElement('table');
        table.className = 'bkbg-cmp-table';

        // thead
        var thead = document.createElement('thead');
        var headTr = document.createElement('tr');
        var thFeat = document.createElement('th');
        thFeat.className = 'bkbg-cmp-th-feature';
        thFeat.style.cssText = 'background:' + (opts.tableHeaderBg || '#f8fafc') + ';color:' + (opts.featureColor || '#374151') + ';font-size:' + (opts.textSize || 16) + 'px;';

        var hl1 = opts.highlightCol === 'col1';
        var hl2 = opts.highlightCol === 'col2';

        var th1 = document.createElement('th');
        th1.className = 'bkbg-cmp-th-col' + (hl1 ? ' bkbg-cmp-hl-col' : '');
        th1.style.cssText = hl1 ? 'font-size:' + ((opts.textSize || 16) + 2) + 'px;font-weight:700;' : 'background:' + (opts.tableHeaderBg || '#f8fafc') + ';color:' + (opts.featureColor || '#374151') + ';font-size:' + ((opts.textSize || 16) + 2) + 'px;font-weight:700;';
        if (opts.showColIcons !== false && opts.col1Icon) {
            var iconSpan1 = document.createElement('span');
            iconSpan1.className = 'bkbg-cmp-col-icon';
            iconSpan1.style.marginRight = '6px';
            var col1Type = opts.col1IconType || 'custom-char';
            var IPf = window.bkbgIconPicker;
            if (IPf && col1Type !== 'custom-char') {
                var ic1 = IPf.buildFrontendIcon(col1Type, opts.col1Icon, opts.col1IconDashicon, opts.col1IconImageUrl, opts.col1IconDashiconColor);
                if (ic1) iconSpan1.appendChild(ic1);
                else iconSpan1.textContent = opts.col1Icon;
            } else {
                iconSpan1.textContent = opts.col1Icon;
            }
            th1.appendChild(iconSpan1);
        }
        th1.appendChild(document.createTextNode(opts.col1Label || 'Us'));

        var th2 = document.createElement('th');
        th2.className = 'bkbg-cmp-th-col' + (hl2 ? ' bkbg-cmp-hl-col' : '');
        th2.style.cssText = hl2 ? 'font-size:' + ((opts.textSize || 16) + 2) + 'px;font-weight:700;' : 'background:' + (opts.tableHeaderBg || '#f8fafc') + ';color:' + (opts.featureColor || '#374151') + ';font-size:' + ((opts.textSize || 16) + 2) + 'px;font-weight:700;';
        if (opts.showColIcons !== false && opts.col2Icon) {
            var iconSpan2 = document.createElement('span');
            iconSpan2.className = 'bkbg-cmp-col-icon';
            iconSpan2.style.marginRight = '6px';
            var col2Type = opts.col2IconType || 'custom-char';
            var IPf2 = window.bkbgIconPicker;
            if (IPf2 && col2Type !== 'custom-char') {
                var ic2 = IPf2.buildFrontendIcon(col2Type, opts.col2Icon, opts.col2IconDashicon, opts.col2IconImageUrl, opts.col2IconDashiconColor);
                if (ic2) iconSpan2.appendChild(ic2);
                else iconSpan2.textContent = opts.col2Icon;
            } else {
                iconSpan2.textContent = opts.col2Icon;
            }
            th2.appendChild(iconSpan2);
        }
        th2.appendChild(document.createTextNode(opts.col2Label || 'Others'));

        headTr.appendChild(thFeat);
        headTr.appendChild(th1);
        headTr.appendChild(th2);
        thead.appendChild(headTr);
        table.appendChild(thead);

        var tbody = document.createElement('tbody');
        (opts.rows || []).forEach(function (r, i) {
            var tr = document.createElement('tr');
            var rowBg = i % 2 === 0 ? '#ffffff' : '#fafafa';

            var tdFeat = document.createElement('td');
            tdFeat.className = 'bkbg-cmp-td-feature';
            tdFeat.style.cssText = 'font-size:' + (opts.textSize || 16) + 'px;color:' + (opts.featureColor || '#374151') + ';background:' + rowBg + ';';
            tdFeat.textContent = r.feature;

            var td1 = document.createElement('td');
            td1.className = 'bkbg-cmp-td-val' + (hl1 ? ' bkbg-cmp-hl-td' : '');
            if (!hl1) td1.style.background = rowBg;
            td1.appendChild(statusEl(r.col1));

            var td2 = document.createElement('td');
            td2.className = 'bkbg-cmp-td-val' + (hl2 ? ' bkbg-cmp-hl-td' : '');
            if (!hl2) td2.style.background = rowBg;
            td2.appendChild(statusEl(r.col2));

            tr.appendChild(tdFeat);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        tableWrap.appendChild(table);
        inner.appendChild(tableWrap);

        if (opts.showCta && opts.ctaLabel) {
            var ctaWrap = document.createElement('div');
            ctaWrap.className = 'bkbg-cmp-cta-wrap';
            var a = document.createElement('a');
            a.className = 'bkbg-cmp-cta-btn';
            a.href = opts.ctaUrl || '#';
            a.style.cssText = 'background:' + (opts.ctaBg || '#7c3aed') + ';color:' + (opts.ctaColor || '#fff') + ';font-size:' + (opts.textSize || 16) + 'px;';
            a.textContent = opts.ctaLabel + ' →';
            ctaWrap.appendChild(a);
            inner.appendChild(ctaWrap);
        }

        wrap.appendChild(inner);
        root.parentNode.replaceChild(wrap, root);
    });
})();
