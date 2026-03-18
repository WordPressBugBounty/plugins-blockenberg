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

    // ── image placeholder ─────────────────────────────────────────────
    function imgPlaceholder(a) {
        return mk('div', 'bkbg-ogp-img-placeholder', {
            height: (a.imageHeight || 180) + 'px',
            background: a.imageBg || '#6366f1',
            fontSize: Math.floor((a.imageHeight || 180) * 0.35) + 'px'
        });
    }
    function imgPlaceholderFull(a) {
        var d = imgPlaceholder(a);
        d.textContent = a.imageEmoji || '🖼️';
        return d;
    }
    function imgThumb(a) {
        var d = mk('div', 'bkbg-ogp-card-slack-thumb', { background: a.imageBg || '#6366f1' });
        d.textContent = a.imageEmoji || '🖼️';
        return d;
    }

    // ── platform badge ────────────────────────────────────────────────
    function platformBadge(platform) {
        var configs = {
            twitter:  { bg: '#15202b', color: '#1d9bf0', text: '𝕏 X / Twitter' },
            facebook: { bg: '#1877f2', color: '#ffffff',  text: 'f Facebook' },
            linkedin: { bg: '#0a66c2', color: '#ffffff',  text: 'in LinkedIn' },
            slack:    { bg: '#4a154b', color: '#36c5f0',  text: '# Slack' },
        };
        var cfg = configs[platform];
        if (!cfg) return null;
        return tx('span', 'bkbg-ogp-platform-label', cfg.text, { background: cfg.bg, color: cfg.color });
    }

    // ── card: twitter ─────────────────────────────────────────────────
    function buildTwitterCard(a) {
        var fs = (a.bodyTypo && a.bodyTypo.sizeDesktop) || a.fontSize || 14;
        var wrap = mk('div', 'bkbg-ogp-card-twitter', {
            background: a.twitterBg   || '#15202b',
            border: '1px solid ' + (a.twitterBorder || '#38444d')
        });
        var body = mk('div', '', { padding: '12px 16px 14px' });
        ap(body,
            tx('div', 'bkbg-ogp-meta', a.pageUrl, { color: a.twitterMeta || '#6b7280', fontSize: (fs - 2) + 'px', marginBottom: '4px' }),
            tx('div', 'bkbg-ogp-title-twitter', a.pageTitle, { color: a.twitterTitle || '#ffffff', fontSize: (fs + 1) + 'px' })
        );
        if (a.showDescription !== false && a.pageDescription) {
            ap(body, tx('div', 'bkbg-ogp-desc', a.pageDescription, {
                color: a.twitterDesc || '#8b98a5', fontSize: (fs - 1) + 'px', WebkitLineClamp: '2'
            }));
        }
        ap(wrap, imgPlaceholderFull(a), body);
        return wrap;
    }

    // ── card: facebook ────────────────────────────────────────────────
    function buildFacebookCard(a) {
        var fs = (a.bodyTypo && a.bodyTypo.sizeDesktop) || a.fontSize || 14;
        var border = '1px solid ' + (a.facebookBorder || '#dddfe2');
        var wrap = mk('div', 'bkbg-ogp-card-facebook', {
            background: a.facebookBg || '#ffffff',
            border: border
        });
        var body = mk('div', '', { padding: '10px 12px 12px', borderTop: border });
        ap(body,
            tx('div', 'bkbg-ogp-meta', a.pageUrl, { color: a.facebookMeta || '#8a8d91', fontSize: '10px', marginBottom: '5px' }),
            tx('div', '', a.pageTitle, { color: a.facebookTitle || '#1c1e21', fontWeight: '700', fontSize: fs + 'px', lineHeight: '1.3', marginBottom: '4px' })
        );
        if (a.showDescription !== false && a.pageDescription) {
            ap(body, tx('div', 'bkbg-ogp-desc', a.pageDescription, {
                color: a.facebookDesc || '#606770', fontSize: (fs - 1) + 'px', WebkitLineClamp: '2'
            }));
        }
        if (a.showSiteName !== false && a.siteName) {
            ap(body, tx('div', '', a.siteName, { color: a.facebookMeta || '#8a8d91', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '6px' }));
        }
        ap(wrap, imgPlaceholderFull(a), body);
        return wrap;
    }

    // ── card: linkedin ────────────────────────────────────────────────
    function buildLinkedInCard(a) {
        var fs = (a.bodyTypo && a.bodyTypo.sizeDesktop) || a.fontSize || 14;
        var wrap = mk('div', 'bkbg-ogp-card-linkedin', {
            background: a.linkedinBg || '#ffffff',
            border: '1px solid ' + (a.linkedinBorder || '#e0dfde')
        });
        var body = mk('div', '', { padding: '12px 16px 14px' });
        ap(body, tx('div', '', a.pageTitle, { color: a.linkedinTitle || '#000000', fontWeight: '700', fontSize: (fs + 1) + 'px', lineHeight: '1.3', marginBottom: '4px' }));
        if (a.showSiteName !== false && a.siteName) {
            ap(body, tx('div', '', a.siteName + ' › ' + a.pageUrl, {
                color: a.linkedinMeta || '#0a66c2', fontWeight: '600', fontSize: '12px', marginBottom: '4px'
            }));
        }
        if (a.showDescription !== false && a.pageDescription) {
            ap(body, tx('div', 'bkbg-ogp-desc', a.pageDescription, {
                color: a.linkedinDesc || '#434649', fontSize: (fs - 1) + 'px', WebkitLineClamp: '3'
            }));
        }
        ap(wrap, imgPlaceholderFull(a), body);
        return wrap;
    }

    // ── card: slack ───────────────────────────────────────────────────
    function buildSlackCard(a) {
        var fs = (a.bodyTypo && a.bodyTypo.sizeDesktop) || a.fontSize || 14;
        var wrap = mk('div', 'bkbg-ogp-card-slack', {
            background: a.slackBg || '#ffffff',
            border: '1px solid ' + (a.slackBorder || '#e8e8e8')
        });
        var strip = mk('div', 'bkbg-ogp-card-slack-strip', { background: a.slackAccent || '#36c5f0' });
        var body  = mk('div', 'bkbg-ogp-card-slack-body');
        var text  = mk('div', 'bkbg-ogp-card-slack-text');

        if (a.showSiteName !== false && a.siteName) {
            ap(text, tx('div', '', a.siteName, { color: a.slackTitle || '#1d1c1d', fontWeight: '700', fontSize: '12px', marginBottom: '4px' }));
        }
        ap(text, tx('div', '', a.pageTitle, {
            color: a.slackTitle || '#1d1c1d', fontWeight: '700', fontSize: (fs - 1) + 'px',
            lineHeight: '1.3', marginBottom: '4px', textDecoration: 'underline', cursor: 'pointer'
        }));
        if (a.showDescription !== false && a.pageDescription) {
            ap(text, tx('div', 'bkbg-ogp-desc', a.pageDescription, {
                color: a.slackDesc || '#616061', fontSize: '12px', WebkitLineClamp: '3'
            }));
        }
        ap(text, tx('div', '', a.pageUrl, { color: a.slackMeta || '#868686', fontSize: '11px', marginTop: '6px' }));

        ap(body, text, imgThumb(a));
        ap(wrap, strip, body);
        return wrap;
    }

    // ── dispatch rendering ────────────────────────────────────────────
    function buildCard(platform, a) {
        if (platform === 'twitter')  return buildTwitterCard(a);
        if (platform === 'facebook') return buildFacebookCard(a);
        if (platform === 'linkedin') return buildLinkedInCard(a);
        if (platform === 'slack')    return buildSlackCard(a);
        return null;
    }

    // ── main builder ──────────────────────────────────────────────────
    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';
        var a;
        try { a = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { a = {}; }

        typoCssVarsForEl(appEl, a.bodyTypo, '--bkbg-ogp-bd-');

        var borderRadius = (a.borderRadius || 16) + 'px';
        var bgColor      = a.bgColor || '#f1f5f9';

        var outer = mk('div', 'bkbg-ogp-wrap', { borderRadius: borderRadius, overflow: 'hidden' });
        var inner = mk('div', 'bkbg-ogp-inner', { background: bgColor, padding: '24px', borderRadius: borderRadius });

        var platforms = ['twitter', 'facebook', 'linkedin', 'slack'];
        var isAll     = !a.platform || a.platform === 'all';

        if (isAll) {
            var isGrid = a.layout === 'grid';
            var container = mk('div', isGrid ? 'bkbg-ogp-grid' : 'bkbg-ogp-stack');
            platforms.forEach(function (p) {
                var slot = mk('div', '');
                ap(slot, platformBadge(p));
                var card = buildCard(p, a);
                if (card) ap(slot, card);
                container.appendChild(slot);
            });
            ap(inner, container);
        } else {
            var badge = platformBadge(a.platform);
            if (badge) ap(inner, badge);
            var single = buildCard(a.platform, a);
            if (single) ap(inner, single);
        }

        ap(outer, inner);
        appEl.innerHTML = '';
        appEl.appendChild(outer);
    }

    function init() {
        document.querySelectorAll('.bkbg-open-graph-preview-app').forEach(buildBlock);
    }

    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
