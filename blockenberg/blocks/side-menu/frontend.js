(function () {
    'use strict';

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

    function buildMenu(appEl, o) {
        var items = o.items || [];
        if (!items.length) return;

        /* ─ map each item to its closest L0 section index ─ */
        var sectionMap = [];
        var lastL0 = -1;
        items.forEach(function (item, idx) {
            if (item.level === 0) { lastL0 = idx; sectionMap[idx] = idx; }
            else { sectionMap[idx] = lastL0; }
        });

        /* ─ determine which L0 sections have children ─ */
        function sectionHasChildren(l0Idx) {
            return items.some(function (it, i) { return i > l0Idx && it.level > 0 && sectionMap[i] === l0Idx; });
        }

        /* ─ open state: track which L0 sections are expanded ─ */
        var openSections = {};
        items.forEach(function (item, idx) {
            if (item.level === 0 && o.defaultExpanded) openSections[idx] = true;
        });

        /* ─ active item ─ */
        var activeIndex = (typeof o.activeIndex === 'number') ? o.activeIndex : -1;
        /* try to auto-detect from current URL */
        var currentHref = window.location.href;
        items.forEach(function (item, idx) {
            if (item.url && item.url !== '#' && currentHref.indexOf(item.url) !== -1) {
                activeIndex = idx;
            }
        });

        /* ─ outer wrap ─ */
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-smnu-wrap';
        wrap.style.paddingTop = (o.paddingTop || 0) + 'px';
        wrap.style.paddingBottom = (o.paddingBottom || 0) + 'px';
        if (o.bgColor) wrap.style.background = o.bgColor;
        typoCssVarsForEl(wrap, o.headingTypo, '--bksmnu-ht-');
        typoCssVarsForEl(wrap, o.itemTypo, '--bksmnu-it-');

        /* ─ menu card ─ */
        var menu = document.createElement('div');
        menu.className = 'bkbg-smnu-menu style-' + (o.menuStyle || 'default');
        menu.style.width = (o.width || 260) + 'px';
        menu.style.maxWidth = '100%';
        menu.style.background = o.menuBg || '#fff';
        menu.style.border = '1px solid ' + (o.menuBorder || '#e5e7eb');
        menu.style.borderRadius = (o.borderRadius || 8) + 'px';
        menu.style.setProperty('--bkbg-smnu-border', o.menuBorder || '#e5e7eb');

        /* ─ heading ─ */
        if (o.showHeading && o.headingText) {
            var heading = document.createElement('div');
            heading.className = 'bkbg-smnu-heading';
            heading.style.padding = (o.itemPaddingV || 8) + 'px ' + (o.itemPaddingH || 14) + 'px';
            heading.style.color = o.headingColor || '#9ca3af';
            heading.style.borderBottom = '1px solid ' + (o.dividerColor || '#e5e7eb');
            heading.textContent = o.headingText;
            menu.appendChild(heading);
        }

        /* ─ nav ─ */
        var nav = document.createElement('nav');
        nav.className = 'bkbg-smnu-nav';
        nav.setAttribute('aria-label', o.headingText || 'Side menu');

        /* ─ render all items (build DOM list) ─ */
        var itemEls = []; /* {linkEl, childrenEl, arrowEl} per item */

        items.forEach(function (item, idx) {
            var isSection = item.level === 0;
            var indent = item.level * 12;
            var hasSectionChildren = isSection && sectionHasChildren(idx);

            /* divider */
            if (item.dividerBefore && o.showDividers) {
                var div = document.createElement('div');
                div.className = 'bkbg-smnu-divider';
                div.style.background = o.dividerColor || '#e5e7eb';
                div.style.margin = '6px ' + (o.itemPaddingH || 14) + 'px';
                nav.appendChild(div);
            }

            /* link */
            var link = document.createElement('a');
            link.className = 'bkbg-smnu-item' + (idx === activeIndex ? ' is-active' : '');
            link.href = item.url || '#';
            link.style.paddingTop = (o.itemPaddingV || 8) + 'px';
            link.style.paddingBottom = (o.itemPaddingV || 8) + 'px';
            link.style.paddingRight = (o.itemPaddingH || 14) + 'px';
            link.style.paddingLeft = ((o.itemPaddingH || 14) + indent) + 'px';
            link.style.transition = 'background 0.15s, color 0.15s';

            function applyActiveStyle(active) {
                if (active) {
                    link.style.background = o.activeItemBg || '#ede9fe';
                    link.style.color = o.activeItemColor || '#6366f1';
                    link.style.fontWeight = '600';
                    link.style.borderLeft = '3px solid ' + (o.activeIndicatorColor || '#6366f1');
                } else {
                    link.style.background = '';
                    link.style.color = isSection ? (o.sectionHeadingColor || '#111827') : (o.itemColor || '#374151');
                    link.style.fontWeight = isSection ? '700' : '400';
                    link.style.borderLeft = '3px solid transparent';
                }
            }
            applyActiveStyle(idx === activeIndex);

            link.addEventListener('mouseenter', function () {
                if (!link.classList.contains('is-active')) {
                    link.style.background = o.itemHoverBg || '#f3f4f6';
                    link.style.color = o.itemHoverColor || '#111827';
                }
            });
            link.addEventListener('mouseleave', function () {
                if (!link.classList.contains('is-active')) {
                    link.style.background = '';
                    link.style.color = isSection ? (o.sectionHeadingColor || '#111827') : (o.itemColor || '#374151');
                }
            });

            /* icon */
            if (o.showIcons && item.icon) {
                var icon = document.createElement('span');
                icon.className = 'bkbg-smnu-icon';
                var _IP = window.bkbgIconPicker;
                var _iType = item.iconType || 'custom-char';
                if (_IP && _iType !== 'custom-char') {
                    var _in = _IP.buildFrontendIcon(_iType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor);
                    if (_in) icon.appendChild(_in); else icon.textContent = item.icon || '';
                } else { icon.textContent = item.icon; }
                link.appendChild(icon);
            }

            /* label */
            var label = document.createElement('span');
            label.className = 'bkbg-smnu-item-label';
            label.textContent = item.label || '';
            link.appendChild(label);

            /* badge */
            if (o.showBadges && item.badge) {
                var badge = document.createElement('span');
                badge.className = 'bkbg-smnu-badge';
                badge.style.background = item.badgeColor || (o.badgeBg || '#6366f1');
                badge.style.color = o.badgeColor || '#fff';
                badge.textContent = item.badge;
                link.appendChild(badge);
            }

            /* arrow for collapsible sections */
            var arrowEl = null;
            if (isSection && hasSectionChildren && o.collapsible) {
                arrowEl = document.createElement('span');
                arrowEl.className = 'bkbg-smnu-arrow' + (openSections[idx] ? ' is-open' : '');
                arrowEl.style.color = o.arrowColor || '#9ca3af';
                arrowEl.innerHTML = '&#9662;';
                link.appendChild(arrowEl);
            }

            nav.appendChild(link);

            /* children container for L0 sections */
            var childrenEl = null;
            if (isSection && hasSectionChildren) {
                childrenEl = document.createElement('div');
                childrenEl.className = 'bkbg-smnu-children' + (openSections[idx] ? ' is-open' : '');
                nav.appendChild(childrenEl);
            }

            itemEls.push({ linkEl: link, arrowEl: arrowEl, childrenEl: childrenEl, isSection: isSection, sectionIdx: sectionMap[idx] });
        });

        /* ─ re-parent L1/L2 items into their section's childrenEl ─ */
        items.forEach(function (item, idx) {
            if (item.level === 0) return;
            var secIdx = sectionMap[idx];
            if (secIdx < 0) return;
            var secData = itemEls[secIdx];
            if (!secData || !secData.childrenEl) return;

            /* move link (and optional divider before it) into childrenEl */
            var linkEl = itemEls[idx].linkEl;
            if (linkEl.previousSibling && linkEl.previousSibling.classList && linkEl.previousSibling.classList.contains('bkbg-smnu-divider')) {
                secData.childrenEl.appendChild(linkEl.previousSibling);
            }
            secData.childrenEl.appendChild(linkEl);
        });

        /* ─ click handlers for sections (collapse/expand) ─ */
        items.forEach(function (item, idx) {
            if (item.level !== 0) return;
            var data = itemEls[idx];
            var hasSectionChildren = sectionHasChildren(idx);

            data.linkEl.addEventListener('click', function (e) {
                /* toggle active */
                if (!hasSectionChildren || !o.collapsible) {
                    e.preventDefault();
                    setActive(idx);
                } else {
                    /* section heading: toggle children, do NOT navigate */
                    e.preventDefault();
                    toggleSection(idx);
                }
            });
        });

        /* ─ click handlers for L1/L2 nav items ─ */
        items.forEach(function (item, idx) {
            if (item.level === 0) return;
            itemEls[idx].linkEl.addEventListener('click', function () {
                setActive(idx);
            });
        });

        function setActive(newIdx) {
            itemEls.forEach(function (data, i) {
                var isNow = i === newIdx;
                if (isNow) { data.linkEl.classList.add('is-active'); }
                else { data.linkEl.classList.remove('is-active'); }
                var isSection = items[i].level === 0;
                var active = data.linkEl.classList.contains('is-active');
                if (active) {
                    data.linkEl.style.background = o.activeItemBg || '#ede9fe';
                    data.linkEl.style.color = o.activeItemColor || '#6366f1';
                    data.linkEl.style.fontWeight = '600';
                    data.linkEl.style.borderLeft = '3px solid ' + (o.activeIndicatorColor || '#6366f1');
                } else {
                    data.linkEl.style.background = '';
                    data.linkEl.style.color = isSection ? (o.sectionHeadingColor || '#111827') : (o.itemColor || '#374151');
                    data.linkEl.style.fontWeight = isSection ? '700' : '400';
                    data.linkEl.style.borderLeft = '3px solid transparent';
                }
            });
        }

        function toggleSection(l0Idx) {
            openSections[l0Idx] = !openSections[l0Idx];
            var data = itemEls[l0Idx];
            if (data.childrenEl) {
                if (openSections[l0Idx]) {
                    data.childrenEl.classList.add('is-open');
                } else {
                    data.childrenEl.classList.remove('is-open');
                }
            }
            if (data.arrowEl) {
                if (openSections[l0Idx]) { data.arrowEl.classList.add('is-open'); }
                else { data.arrowEl.classList.remove('is-open'); }
            }
        }

        menu.appendChild(nav);
        wrap.appendChild(menu);

        appEl.parentNode.insertBefore(wrap, appEl);
        appEl.style.display = 'none';
    }

    function init() {
        document.querySelectorAll('.bkbg-smnu-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                items: [],
                headingText: 'Documentation',
                showHeading: true,
                menuStyle: 'default',
                collapsible: true,
                defaultExpanded: true,
                showIcons: true,
                showBadges: true,
                showDividers: true,
                activeIndex: -1,
                width: 260,
                itemPaddingV: 8,
                itemPaddingH: 14,
                fontSize: 14,
                headingSize: 11,
                borderRadius: 8,
                paddingTop: 0,
                paddingBottom: 0,
                bgColor: '',
                menuBg: '#ffffff',
                menuBorder: '#e5e7eb',
                headingColor: '#9ca3af',
                itemColor: '#374151',
                itemHoverBg: '#f3f4f6',
                itemHoverColor: '#111827',
                activeItemBg: '#ede9fe',
                activeItemColor: '#6366f1',
                activeIndicatorColor: '#6366f1',
                sectionHeadingColor: '#111827',
                dividerColor: '#e5e7eb',
                badgeBg: '#6366f1',
                badgeColor: '#ffffff',
                arrowColor: '#9ca3af'
            }, opts);

            buildMenu(appEl, o);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
