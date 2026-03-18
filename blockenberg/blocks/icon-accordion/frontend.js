(function () {
    var typoMap = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        for (var i = 0; i < typoMap.length; i++) {
            var v = typo[typoMap[i][0]];
            if (v !== undefined && v !== '' && v !== null) el.style.setProperty(prefix + typoMap[i][1], String(v));
        }
    }

    function init() {
        document.querySelectorAll('.bkbg-iac-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                items: [], accordionStyle: 'card', iconStyle: 'rounded', iconSize: 44,
                expandIcon: 'chevron', allowMultiple: false, animDuration: 300,
                gap: 8, borderRadius: 12, paddingTop: 0, paddingBottom: 0,
                bgColor: '', panelBg: '#ffffff', panelBorder: '#e5e7eb', headerBg: '',
                titleColor: '#111827', contentColor: '#6b7280',
                badgeBg: '#f3f4f6', badgeColor: '#374151',
                accentColor: '#6366f1', expandColor: '#9ca3af'
            }, opts);

            var items = o.items || [];
            if (!items.length) { appEl.style.display = 'none'; return; }

            var expIcons = {
                chevron: { open: '▾', closed: '▸' },
                plus: { open: '−', closed: '+' },
                arrow: { open: '↑', closed: '↓' },
                caret: { open: '◀', closed: '▶' }
            };
            var eIcons = expIcons[o.expandIcon] || expIcons.chevron;

            var iStyle = o.iconStyle;
            var iRadius = iStyle === 'circle' ? '50%' : iStyle === 'rounded' ? '10px' : '4px';
            var iFontSize = Math.round(o.iconSize * 0.5) + 'px';

            function mk(tag, cls, style) {
                var n = document.createElement(tag);
                if (cls) n.className = cls;
                if (style) Object.assign(n.style, style);
                return n;
            }

            /* Section */
            var section = mk('div', 'bkbg-iac-section bkbg-iac-style-' + o.accordionStyle, {
                background: o.bgColor || '',
                paddingTop: o.paddingTop + 'px',
                paddingBottom: o.paddingBottom + 'px'
            });
            section.style.setProperty('--bkbg-iac-tt-sz', (o.titleFontSize || 15) + 'px');
            section.style.setProperty('--bkbg-iac-tt-w', o.titleFontWeight || '700');
            section.style.setProperty('--bkbg-iac-tt-lh', String(o.titleLineHeight || 1.3));
            section.style.setProperty('--bkbg-iac-ct-sz', (o.contentFontSize || 14) + 'px');
            section.style.setProperty('--bkbg-iac-ct-w', o.contentFontWeight || '400');
            section.style.setProperty('--bkbg-iac-ct-lh', String(o.contentLineHeight || 1.7));
            typoCssVarsForEl(o.titleTypo, '--bkbg-iac-tt-', section);
            typoCssVarsForEl(o.contentTypo, '--bkbg-iac-ct-', section);

            var panelEls = [];

            items.forEach(function (it, idx) {
                var isOpen = it.defaultOpen || false;
                var isFilled = o.accordionStyle === 'filled';

                function panelBgColor() {
                    return isFilled && isOpen ? o.accentColor : o.panelBg;
                }

                var panelStyle = {
                    borderRadius: o.borderRadius + 'px',
                    marginBottom: o.gap + 'px',
                    overflow: 'hidden',
                    background: panelBgColor(),
                    transition: 'background ' + (o.animDuration / 1000) + 's ease, box-shadow 0.25s ease'
                };
                if (o.accordionStyle === 'card') { panelStyle.border = '1px solid ' + o.panelBorder; }
                if (o.accordionStyle === 'minimal') {
                    panelStyle.borderBottom = '1px solid ' + o.panelBorder;
                    panelStyle.borderRadius = '0';
                    panelStyle.background = 'transparent';
                }

                var panel = mk('div', 'bkbg-iac-panel' + (isOpen ? ' open' : ''), panelStyle);

                /* Header */
                var header = mk('div', 'bkbg-iac-header', { background: o.headerBg || 'transparent' });

                /* Icon */
                var icon = mk('div', 'bkbg-iac-icon', {
                    width: o.iconSize + 'px',
                    height: o.iconSize + 'px',
                    background: isFilled && isOpen ? 'rgba(255,255,255,0.2)' : (it.iconBg || '#ede9fe'),
                    borderRadius: iRadius,
                    fontSize: iFontSize
                });
                icon.textContent = '';
                var _IP = window.bkbgIconPicker;
                var _iType = it.iconType || 'custom-char';
                if (_IP && _iType !== 'custom-char') {
                    var _in = _IP.buildFrontendIcon(_iType, it.icon, it.iconDashicon, it.iconImageUrl, it.iconDashiconColor);
                    if (_in) icon.appendChild(_in); else icon.textContent = it.icon || '●';
                } else { icon.textContent = it.icon || '●'; }
                header.appendChild(icon);

                /* Title row */
                var titleRow = mk('div', 'bkbg-iac-title-row');
                var titleEl = mk('span', 'bkbg-iac-title', { color: isFilled && isOpen ? '#ffffff' : o.titleColor });
                titleEl.textContent = it.title || '';
                titleRow.appendChild(titleEl);
                if (it.badge) {
                    var badge = mk('span', 'bkbg-iac-badge', {
                        background: isFilled && isOpen ? 'rgba(255,255,255,0.25)' : o.badgeBg,
                        color: isFilled && isOpen ? '#ffffff' : o.badgeColor
                    });
                    badge.textContent = it.badge;
                    titleRow.appendChild(badge);
                }
                header.appendChild(titleRow);

                /* Expand icon */
                var expEl = mk('span', 'bkbg-iac-expand', { color: isFilled && isOpen ? 'rgba(255,255,255,0.8)' : o.expandColor });
                expEl.textContent = isOpen ? eIcons.open : eIcons.closed;
                header.appendChild(expEl);
                panel.appendChild(header);

                /* Body */
                var body = mk('div', 'bkbg-iac-body');
                var bodyInner = mk('div', 'bkbg-iac-body-inner', {
                    paddingLeft: (18 + o.iconSize + 14) + 'px',
                    color: isFilled && isOpen ? 'rgba(255,255,255,0.85)' : o.contentColor
                });
                bodyInner.innerHTML = it.content || '';
                body.appendChild(bodyInner);
                panel.appendChild(body);

                /* Initial state */
                if (isOpen) { body.style.maxHeight = '1000px'; }

                /* Toggle handler */
                header.addEventListener('click', function () {
                    isOpen = !isOpen;

                    if (!o.allowMultiple && isOpen) {
                        /* close others */
                        panelEls.forEach(function (info) {
                            if (info.panel === panel) return;
                            info.isOpen = false;
                            info.panel.classList.remove('open');
                            info.body.style.maxHeight = '0';
                            info.expEl.textContent = eIcons.closed;
                            if (o.accordionStyle === 'filled') {
                                info.panel.style.background = o.panelBg;
                                info.icon.style.background = info.iconBg || '#ede9fe';
                                info.titleEl.style.color = o.titleColor;
                                info.expEl.style.color = o.expandColor;
                                info.bodyInner.style.color = o.contentColor;
                                if (info.badge) { info.badge.style.background = o.badgeBg; info.badge.style.color = o.badgeColor; }
                            }
                        });
                    }

                    panel.classList.toggle('open', isOpen);
                    body.style.maxHeight = isOpen ? '1000px' : '0';
                    expEl.textContent = isOpen ? eIcons.open : eIcons.closed;

                    if (o.accordionStyle === 'filled') {
                        panel.style.background = isOpen ? o.accentColor : o.panelBg;
                        icon.style.background = isOpen ? 'rgba(255,255,255,0.2)' : (it.iconBg || '#ede9fe');
                        titleEl.style.color = isOpen ? '#ffffff' : o.titleColor;
                        expEl.style.color = isOpen ? 'rgba(255,255,255,0.8)' : o.expandColor;
                        bodyInner.style.color = isOpen ? 'rgba(255,255,255,0.85)' : o.contentColor;
                        if (badge) { badge.style.background = isOpen ? 'rgba(255,255,255,0.25)' : o.badgeBg; badge.style.color = isOpen ? '#fff' : o.badgeColor; }
                    }
                });

                section.appendChild(panel);
                panelEls.push({ panel: panel, body: body, icon: icon, titleEl: titleEl, expEl: expEl, badge: it.badge ? panel.querySelector('.bkbg-iac-badge') : null, bodyInner: bodyInner, iconBg: it.iconBg, isOpen: isOpen });
            });

            appEl.parentNode.insertBefore(section, appEl);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
