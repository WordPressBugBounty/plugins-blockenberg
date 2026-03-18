(function () {
    'use strict';

    function mk(tag, cls, styles) {
        var d = document.createElement(tag);
        if (cls) d.className = cls;
        if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; });
        return d;
    }
    function tx(tag, cls, text, styles) {
        var d = mk(tag, cls, styles);
        d.textContent = text;
        return d;
    }
    function ap(p) {
        Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) p.appendChild(c); });
        return p;
    }

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

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a;
        try { a = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { a = {}; }

        var reactions  = a.reactions || [];
        var isCards    = a.layout === 'cards';
        var isCompact  = a.layout === 'compact';
        var emojiSize  = a.emojiSize || 22;
        var itemRadius = (a.itemRadius || 100) + 'px';

        // state: which index is "active" (toggled)
        var activeIdx = -1;

        // Wrapper
        appEl.style.background   = a.bgColor || '#ffffff';
        appEl.style.border       = '1px solid ' + (a.borderColor || '#e5e7eb');
        appEl.style.borderRadius = (a.borderRadius || 16) + 'px';
        appEl.style.padding      = '20px 24px';
        appEl.style.fontFamily   = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

        typoCssVarsForEl(appEl, a.titleTypo || {}, '--bkrab-tt-');
        typoCssVarsForEl(appEl, a.countTypo || {}, '--bkrab-ct-');

        // Title
        if (a.showTitle && a.title) {
            var titleEl = tx('div', 'bkrab-title', a.title, {
                color: a.titleColor || '#111827',
                marginBottom: '14px'
            });
            ap(appEl, titleEl);
        }

        // Reactions container
        var container = mk('div', '', {
            display: isCards ? 'grid' : 'flex',
            gridTemplateColumns: isCards ? 'repeat(auto-fill, minmax(90px, 1fr))' : '',
            flexWrap: 'wrap',
            gap: '8px'
        });

        // Total tracker
        var totalCounts = reactions.map(function (r) { return r.count || 0; });

        // Total display
        var totalEl = null;
        var totalSum = totalCounts.reduce(function (s, c) { return s + c; }, 0);
        if (a.showTotal) {
            totalEl = tx('div', 'bkrab-total', totalSum + ' ' + (a.totalLabel || 'reactions'), {
                marginTop: '12px',
                color: a.totalColor || '#9ca3af'
            });
        }

        // Build each reaction item
        var itemEls = reactions.map(function (r, idx) {
            var isActive = false;

            var itemWrap = mk('div', '', {
                display: 'inline-flex', alignItems: 'center',
                justifyContent: isCards ? 'center' : 'flex-start',
                flexDirection: isCards ? 'column' : 'row',
                gap: '6px',
                padding: isCards ? '16px 12px' : isCompact ? '4px 12px' : '7px 14px',
                borderRadius: isCards ? '12px' : itemRadius,
                border: '1.5px solid ' + (a.itemBorderColor || '#e5e7eb'),
                background: a.itemBg || '#f9fafb',
                cursor: 'pointer', userSelect: 'none',
                transition: 'all .15s ease',
                flexShrink: '0'
            });

            var emojiEl = tx('span', '', r.emoji || '', { fontSize: emojiSize + 'px', lineHeight: '1' });
            var countSpan = tx('span', 'bkrab-count', String(r.count || 0), {
                color: a.countColor || '#374151'
            });
            var labelSpan = null;
            if (a.showLabel && !isCompact) {
                labelSpan = tx('span', 'bkrab-label', r.label || '', {
                    color: a.labelColor || '#6b7280'
                });
            }

            var metaRow = mk('div', '', {
                display: 'flex', flexDirection: isCards ? 'column' : 'row',
                alignItems: 'center', gap: '4px'
            });
            if (a.showCount) ap(metaRow, countSpan);
            if (labelSpan) ap(metaRow, labelSpan);
            ap(itemWrap, emojiEl, metaRow);

            // Animate helper
            function applyActive(active) {
                var bg     = active ? (a.activeItemBg || '#eff6ff')    : (a.itemBg || '#f9fafb');
                var border = active ? (a.activeItemBorder || '#bfdbfe') : (a.itemBorderColor || '#e5e7eb');
                var cc     = active ? (a.activeCountColor || '#1d4ed8') : (a.countColor || '#374151');
                itemWrap.style.background    = bg;
                itemWrap.style.borderColor   = border;
                countSpan.style.color        = cc;
            }

            itemWrap.addEventListener('click', function () {
                isActive = !isActive;
                applyActive(isActive);

                // Update count
                var delta = isActive ? 1 : -1;
                totalCounts[idx] += delta;
                countSpan.textContent = String(totalCounts[idx]);

                // Bounce animation
                if (a.animate !== false) {
                    emojiEl.style.transform = 'scale(1.4)';
                    setTimeout(function () { emojiEl.style.transform = 'scale(1)'; }, 200);
                }

                // Update total
                if (totalEl) {
                    var sum = totalCounts.reduce(function (s, c) { return s + c; }, 0);
                    totalEl.textContent = sum + ' ' + (a.totalLabel || 'reactions');
                }
            });

            itemWrap.addEventListener('mouseenter', function () {
                if (!isActive) itemWrap.style.background = a.itemHoverBg || '#f3f4f6';
            });
            itemWrap.addEventListener('mouseleave', function () {
                if (!isActive) itemWrap.style.background = a.itemBg || '#f9fafb';
            });

            return itemWrap;
        });

        itemEls.forEach(function (el) { ap(container, el); });
        ap(appEl, container);
        if (totalEl) ap(appEl, totalEl);
    }

    function init() {
        document.querySelectorAll('.bkbg-reaction-bar-app').forEach(buildBlock);
    }
    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
