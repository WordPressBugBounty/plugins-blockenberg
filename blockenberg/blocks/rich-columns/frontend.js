(function () {
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
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-rc-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                columns: [],
                columnCount: 3,
                layout: 'cards',
                gap: 24,
                containerPadding: 0,
                maxWidth: 1100,
                cardRadius: 14,
                cardPadding: 28,
                iconSize: 28,
                iconBgSize: 56,
                iconBgRadius: 14,
                showIcon: true,
                showLink: true,
                showDivider: false,
                headingTag: 'h3',
                headingSize: 19,
                bodySize: 15,
                containerBg: '',
                cardBg: '#ffffff',
                cardBorder: '#e5e7eb',
                headingColor: '#111827',
                textColor: '#374151',
                linkColor: '#6366f1',
                iconBg: '#ede9fe',
                iconColor: '#6366f1',
                dividerColor: '#e5e7eb',
            }, opts);

            if (!o.columns || !o.columns.length) return;

            // Outer
            var outer = document.createElement('div');
            outer.className = 'bkbg-rc-outer';
            if (o.containerBg) outer.style.background = o.containerBg;
            if (o.containerPadding) outer.style.padding = o.containerPadding + 'px';
            typoCssVarsForEl(outer, o.headingTypo, '--bkrc-ht-');
            typoCssVarsForEl(outer, o.bodyTypo, '--bkrc-bt-');

            // Grid
            var grid = document.createElement('div');
            grid.className = 'bkbg-rc-grid cols-' + o.columnCount;
            grid.style.maxWidth = o.maxWidth + 'px';
            grid.style.gap = o.gap + 'px';
            grid.style.setProperty('--bkbg-rc-gap', o.gap + 'px');

            // Column basis (accounts for gaps)
            var colBasis = 'calc(' + (100 / o.columnCount) + '% - ' + ((o.columnCount - 1) * o.gap / o.columnCount) + 'px)';

            o.columns.forEach(function (col, i) {
                // Divider between flat columns
                if (i > 0 && o.showDivider && o.layout === 'flat') {
                    var divider = document.createElement('div');
                    divider.className = 'bkbg-rc-divider';
                    divider.style.background = o.dividerColor;
                    grid.appendChild(divider);
                }

                var colEl = document.createElement('div');
                colEl.className = 'bkbg-rc-col layout-' + o.layout;
                colEl.style.flexBasis = colBasis;
                colEl.style.padding = o.cardPadding + 'px';
                colEl.style.borderRadius = o.cardRadius + 'px';
                colEl.style.boxSizing = 'border-box';

                // Per-column background
                if (col.bgColor) {
                    colEl.style.background = col.bgColor;
                } else if (o.layout === 'cards') {
                    colEl.style.background = o.cardBg;
                    colEl.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                } else if (o.layout === 'bordered') {
                    colEl.style.background = o.cardBg;
                    colEl.style.border = '1px solid ' + o.cardBorder;
                } else if (o.layout === 'icon-left') {
                    colEl.style.background = o.cardBg;
                    colEl.style.border = '1px solid ' + o.cardBorder;
                } else if (o.layout === 'icon-top-line') {
                    colEl.style.borderTop = '3px solid ' + (col.accentColor || o.iconColor || '#6366f1');
                }

                // Inner wrapper (used for icon-left flex)
                var inner = document.createElement('div');
                inner.className = 'bkbg-rc-col-inner';
                if (o.layout === 'icon-left') {
                    inner.style.display = 'flex';
                    inner.style.alignItems = 'flex-start';
                    inner.style.gap = '16px';
                } else {
                    inner.style.display = 'flex';
                    inner.style.flexDirection = 'column';
                    inner.style.height = '100%';
                }

                // Icon
                if (o.showIcon && (col.icon || col.iconDashicon || col.iconImageUrl)) {
                    var iconBox = document.createElement('div');
                    iconBox.className = 'bkbg-rc-icon-box';
                    iconBox.style.width = o.iconBgSize + 'px';
                    iconBox.style.height = o.iconBgSize + 'px';
                    iconBox.style.borderRadius = o.iconBgRadius + 'px';
                    iconBox.style.background = col.accentColor ? col.accentColor + '22' : o.iconBg;
                    iconBox.style.fontSize = o.iconSize + 'px';
                    iconBox.style.flexShrink = '0';
                    if (o.layout !== 'icon-left') {
                        iconBox.style.marginBottom = '14px';
                    }
                    var _IP = window.bkbgIconPicker;
                    var _iType = col.iconPickerType || 'custom-char';
                    if (_IP && _iType !== 'custom-char') {
                        var _in = _IP.buildFrontendIcon(_iType, col.icon, col.iconDashicon, col.iconImageUrl, col.iconDashiconColor);
                        if (_in) iconBox.appendChild(_in); else iconBox.textContent = col.icon || '';
                    } else { iconBox.textContent = col.icon || ''; }
                    inner.appendChild(iconBox);
                }

                // Text block
                var textBlock = document.createElement('div');
                textBlock.className = 'bkbg-rc-text';
                textBlock.style.flexGrow = '1';
                textBlock.style.display = 'flex';
                textBlock.style.flexDirection = 'column';

                // Heading
                var headingEl = document.createElement(o.headingTag || 'h3');
                headingEl.className = 'bkbg-rc-heading';
                headingEl.textContent = col.heading;
                headingEl.style.color = o.headingColor;
                headingEl.style.margin = '0 0 10px';
                textBlock.appendChild(headingEl);

                // Body (rich text / HTML)
                if (col.content) {
                    var bodyEl = document.createElement('div');
                    bodyEl.className = 'bkbg-rc-body';
                    bodyEl.style.color = o.textColor;
                    bodyEl.style.flexGrow = '1';
                    bodyEl.innerHTML = col.content;
                    textBlock.appendChild(bodyEl);
                }

                // Link
                if (o.showLink && col.linkLabel && col.linkUrl) {
                    var link = document.createElement('a');
                    link.className = 'bkbg-rc-link';
                    link.href = col.linkUrl;
                    link.textContent = col.linkLabel + ' →';
                    link.style.color = o.linkColor;
                    link.style.fontSize = '14px';
                    link.style.fontWeight = '600';
                    link.style.textDecoration = 'none';
                    link.style.marginTop = '14px';
                    if (col.linkNewTab) {
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                    }
                    textBlock.appendChild(link);
                } else if (o.showLink && col.linkLabel) {
                    var linkSpan = document.createElement('span');
                    linkSpan.className = 'bkbg-rc-link';
                    linkSpan.textContent = col.linkLabel + ' →';
                    linkSpan.style.color = o.linkColor;
                    linkSpan.style.fontSize = '14px';
                    linkSpan.style.fontWeight = '600';
                    linkSpan.style.marginTop = '14px';
                    textBlock.appendChild(linkSpan);
                }

                inner.appendChild(textBlock);
                colEl.appendChild(inner);
                grid.appendChild(colEl);
            });

            outer.appendChild(grid);
            appEl.parentNode.insertBefore(outer, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
