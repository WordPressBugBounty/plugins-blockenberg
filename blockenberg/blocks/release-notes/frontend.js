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
    function ap(parent) {
        Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) parent.appendChild(c); });
        return parent;
    }

    function releaseTypeInfo(t) {
        if (t === 'major')  return { label: '🚀 Major',  bg: '#fee2e2', color: '#991b1b' };
        if (t === 'patch')  return { label: '🐛 Patch',  bg: '#fef9c3', color: '#713f12' };
        if (t === 'hotfix') return { label: '🔥 Hotfix', bg: '#ffedd5', color: '#9a3412' };
        return                     { label: '✨ Minor',  bg: '#dbeafe', color: '#1e3a8a' };
    }

    function sectionMeta(type, o) {
        if (type === 'added')      return { label: 'Added',      bg: o.addedBg,      color: o.addedColor,      dot: '#16a34a' };
        if (type === 'changed')    return { label: 'Changed',    bg: o.changedBg,    color: o.changedColor,    dot: '#2563eb' };
        if (type === 'fixed')      return { label: 'Fixed',      bg: o.fixedBg,      color: o.fixedColor,      dot: '#ca8a04' };
        if (type === 'removed')    return { label: 'Removed',    bg: o.removedBg,    color: o.removedColor,    dot: '#dc2626' };
        if (type === 'security')   return { label: 'Security',   bg: o.securityBg,   color: o.securityColor,   dot: '#7c3aed' };
        if (type === 'deprecated') return { label: 'Deprecated', bg: o.deprecatedBg, color: o.deprecatedColor, dot: '#64748b' };
        return { label: type, bg: '#f1f5f9', color: '#374151', dot: '#64748b' };
    }

    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        Object.keys(_typoKeys).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) v = v + (typo.sizeUnit || 'px');
                else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) v = v + (typo.lineHeightUnit || '');
                else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) v = v + (typo.letterSpacingUnit || 'px');
                else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) v = v + (typo.wordSpacingUnit || 'px');
                el.style.setProperty(prefix + _typoKeys[k], String(v));
            }
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-release-notes-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                productName: 'Product', version: '1.0.0', releaseDate: '',
                releaseType: 'minor', showMeta: true, showReleaseType: true,
                intro: '', showIntro: true, sections: [],
                changelogUrl: '', compareUrl: '', showLinks: true,
                fontSize: 14, titleFontSize: 24, lineHeight: 168,
                borderRadius: 10, itemSpacing: 6,
                bgColor: '#ffffff', borderColor: '#e5e7eb',
                headerBg: '#0f172a', headerColor: '#ffffff',
                introBg: '#f8fafc', introColor: '#374151', textColor: '#374151',
                accentColor: '#3b82f6',
                addedBg: '#dcfce7', addedColor: '#14532d',
                changedBg: '#dbeafe', changedColor: '#1e3a8a',
                fixedBg: '#fef9c3', fixedColor: '#713f12',
                removedBg: '#fee2e2', removedColor: '#991b1b',
                securityBg: '#f3e8ff', securityColor: '#581c87',
                deprecatedBg: '#f1f5f9', deprecatedColor: '#475569'
            }, opts);

            // Block wrapper
            var block = mk('div', 'bkbg-rn-block', {
                border: '1px solid ' + o.borderColor,
                borderRadius: o.borderRadius + 'px',
                overflow: 'hidden',
                background: o.bgColor
            });
            typoCssVarsForEl(o.titleTypo, '--bkrn-tt-', block);
            typoCssVarsForEl(o.bodyTypo, '--bkrn-bt-', block);

            // ── Header ───────────────────────────────────────────
            var header = mk('div', 'bkbg-rn-header', { background: o.headerBg });
            var hrow   = mk('div', 'bkbg-rn-header-row');
            ap(hrow, tx('span', 'bkbg-rn-version', 'v' + o.version, { color: o.headerColor }));
            if (o.showReleaseType) {
                var rtI = releaseTypeInfo(o.releaseType);
                ap(hrow, tx('span', 'bkbg-rn-type-badge', rtI.label, { background: rtI.bg, color: rtI.color }));
            }
            ap(hrow, tx('span', 'bkbg-rn-product', o.productName, { color: o.headerColor }));
            ap(header, hrow);
            if (o.showMeta && o.releaseDate) {
                ap(header, tx('div', 'bkbg-rn-date', '📅 Released ' + o.releaseDate, { color: o.headerColor }));
            }
            ap(block, header);

            // ── Intro ─────────────────────────────────────────────
            if (o.showIntro && o.intro) {
                var intro = tx('div', 'bkbg-rn-intro', o.intro, {
                    background: o.introBg,
                    borderColor: o.borderColor,
                    color: o.introColor
                });
                ap(block, intro);
            }

            // ── Body ─────────────────────────────────────────────
            var body = mk('div', 'bkbg-rn-body');

            o.sections.forEach(function (sec, si) {
                if (!sec || !sec.items || sec.items.length === 0) return;
                var m = sectionMeta(sec.type, o);

                var section = mk('div', 'bkbg-rn-section');

                // Section heading
                var shead = mk('div', 'bkbg-rn-section-head');
                var pill  = mk('span', 'bkbg-rn-type-pill', { background: m.bg, color: m.color });
                var dot   = mk('span', 'bkbg-rn-type-dot', { background: m.dot });
                ap(pill, dot);
                pill.appendChild(document.createTextNode(m.label));
                ap(shead, pill);
                ap(shead, tx('span', 'bkbg-rn-count', sec.items.length + ' item' + (sec.items.length !== 1 ? 's' : '')));
                ap(section, shead);

                // Items
                var list = mk('ul', 'bkbg-rn-list');
                sec.items.forEach(function (item, ii) {
                    var li = mk('li', 'bkbg-rn-item', {
                        padding: o.itemSpacing + 'px 0',
                        borderBottomColor: o.borderColor
                    });
                    var dash = tx('span', 'bkbg-rn-dash', '—', { color: m.dot });
                    var txt  = tx('span', '', item, { color: o.textColor });
                    ap(li, dash, txt);
                    ap(list, li);
                });
                ap(section, list);
                ap(body, section);
            });

            // Footer links
            if (o.showLinks && (o.changelogUrl || o.compareUrl)) {
                var linksRow = mk('div', 'bkbg-rn-links', { borderTopColor: o.borderColor });
                if (o.changelogUrl) {
                    var cl = mk('a', 'bkbg-rn-link', { color: o.accentColor });
                    cl.href = o.changelogUrl; cl.textContent = '📋 Full Changelog →';
                    ap(linksRow, cl);
                }
                if (o.compareUrl) {
                    var cr = mk('a', 'bkbg-rn-link', { color: o.accentColor });
                    cr.href = o.compareUrl; cr.textContent = '🔀 Compare Changes →';
                    ap(linksRow, cr);
                }
                ap(body, linksRow);
            }

            ap(block, body);
            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
