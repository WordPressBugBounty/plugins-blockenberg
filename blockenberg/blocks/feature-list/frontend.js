(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = {
            family: 'font-family', weight: 'font-weight',
            transform: 'text-transform', style: 'font-style', decoration: 'text-decoration'
        };
        Object.keys(m).forEach(function (k) {
            if (typo[k]) el.style.setProperty(prefix + m[k], typo[k]);
        });
        var r = {
            size: 'font-size', lineHeight: 'line-height',
            letterSpacing: 'letter-spacing', wordSpacing: 'word-spacing'
        };
        Object.keys(r).forEach(function (k) {
            ['Desktop', 'Tablet', 'Mobile'].forEach(function (d, i) {
                var v = typo[k + d];
                if (v === undefined || v === '') return;
                var suffix = ['-d', '-t', '-m'][i];
                var unit = typo[k + 'Unit'] || ('size' === k ? 'px' : (k === 'lineHeight' ? '' : 'px'));
                el.style.setProperty(prefix + r[k] + suffix, v + unit);
            });
        });
    }

    var STATUS_ICONS = {
        'color-check': { included: '✓', 'not-included': '✗', partial: '◐', 'coming-soon': '⏱' },
        'emoji':       { included: '✅', 'not-included': '❌', partial: '🔶', 'coming-soon': '🔜' },
        'minimal':     { included: '•', 'not-included': '–', partial: '~', 'coming-soon': '…' }
    };

    function init() {
        document.querySelectorAll('.bkbg-fl-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                heading: 'Everything in Pro', showHeading: true,
                items: [], listStyle: 'bordered', iconSet: 'color-check',
                showDesc: true, showBadge: true, showNotIncluded: true, strikeNotIncluded: false,
                iconSize: 20, fontSize: 15, gap: 0, borderRadius: 12,
                paddingTop: 0, paddingBottom: 0,
                bgColor: '', itemBg: '#ffffff', stripeBg: '#f9fafb', borderColor: '#e5e7eb',
                labelColor: '#111827', descColor: '#6b7280', headingColor: '#111827',
                includedColor: '#10b981', notIncludedColor: '#d1d5db',
                partialColor: '#f59e0b', comingSoonColor: '#8b5cf6',
                badgeBg: '#ede9fe', badgeColor: '#7c3aed'
            }, opts);

            function statusColor(s) {
                if (s === 'included')    return o.includedColor;
                if (s === 'not-included') return o.notIncludedColor;
                if (s === 'partial')     return o.partialColor;
                if (s === 'coming-soon') return o.comingSoonColor;
                return o.labelColor;
            }

            function statusIcon(s) {
                var icons = STATUS_ICONS[o.iconSet] || STATUS_ICONS['color-check'];
                return icons[s] || '•';
            }

            /* Wrapper */
            var section = document.createElement('div');
            section.className = 'bkbg-fl-wrap';
            section.style.cssText = [
                o.bgColor ? 'background:' + o.bgColor : '',
                'padding-top:' + o.paddingTop + 'px',
                'padding-bottom:' + o.paddingBottom + 'px'
            ].filter(Boolean).join(';');

            /* CSS vars */
            section.style.setProperty('--fl-border', o.borderColor);
            section.style.setProperty('--fl-radius', o.borderRadius + 'px');
            typoCssVarsForEl(o.typoHeading, '--bkbg-fl-hd-', section);
            typoCssVarsForEl(o.typoLabel, '--bkbg-fl-lb-', section);
            typoCssVarsForEl(o.typoDesc, '--bkbg-fl-ds-', section);

            /* Heading */
            if (o.showHeading && o.heading) {
                var h = document.createElement('h3');
                h.className = 'bkbg-fl-heading';
                h.innerHTML = o.heading;
                h.style.color = o.headingColor;
                section.appendChild(h);
            }

            /* List */
            var list = document.createElement('div');
            list.className = 'bkbg-fl-list style-' + o.listStyle;
            if (o.borderRadius && (o.listStyle === 'card')) {
                list.style.borderRadius = o.borderRadius + 'px';
            }

            var prevGroup = '';
            var displayedIdx = 0;

            (o.items || []).forEach(function (it, idx) {
                if (!o.showNotIncluded && it.status === 'not-included') return;

                /* Group header */
                if (it.group && it.group !== prevGroup) {
                    var g = document.createElement('div');
                    g.className = 'bkbg-fl-group';
                    g.textContent = it.group;
                    g.style.background = o.stripeBg;
                    g.style.color = o.descColor;
                    g.style.borderColor = o.borderColor;
                    list.appendChild(g);
                    prevGroup = it.group;
                }

                var isStriped = o.listStyle === 'striped';
                var rowBg = isStriped && displayedIdx % 2 === 1 ? o.stripeBg : o.itemBg;
                var isNotIncl = it.status === 'not-included';

                var row = document.createElement('div');
                row.className = 'bkbg-fl-row';
                row.style.background = rowBg;
                if (o.listStyle === 'compact' && o.gap > 0) {
                    row.style.marginBottom = o.gap + 'px';
                }

                /* Icon */
                var icon = document.createElement('span');
                icon.className = 'bkbg-fl-icon';
                icon.textContent = statusIcon(it.status);
                icon.style.cssText = 'color:' + statusColor(it.status) + ';font-size:' + o.iconSize + 'px;width:' + o.iconSize + 'px';
                row.appendChild(icon);

                /* Body */
                var body = document.createElement('div');
                body.className = 'bkbg-fl-body';

                var label = document.createElement('div');
                label.className = 'bkbg-fl-label';
                label.textContent = it.label;
                label.style.cssText = 'color:' + (isNotIncl ? o.notIncludedColor : o.labelColor) + (isNotIncl && o.strikeNotIncluded ? ';text-decoration:line-through' : '');
                body.appendChild(label);

                if (o.showDesc && it.description) {
                    var desc = document.createElement('div');
                    desc.className = 'bkbg-fl-desc';
                    desc.textContent = it.description;
                    desc.style.cssText = 'color:' + o.descColor;
                    body.appendChild(desc);
                }

                row.appendChild(body);

                /* Badge */
                if (o.showBadge && it.badge) {
                    var badge = document.createElement('span');
                    badge.className = 'bkbg-fl-badge';
                    badge.textContent = it.badge;
                    badge.style.cssText = 'background:' + o.badgeBg + ';color:' + o.badgeColor;
                    row.appendChild(badge);
                }

                list.appendChild(row);
                displayedIdx++;
            });

            section.appendChild(list);
            appEl.parentNode.insertBefore(section, appEl);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
