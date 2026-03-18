(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family: 'font-family', weight: 'font-weight', transform: 'text-transform',
            style: 'font-style', decoration: 'text-decoration',
            sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m', sizeUnit: 'font-size-unit',
            lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m', lineHeightUnit: 'line-height-unit',
            letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m', letterSpacingUnit: 'letter-spacing-unit',
            wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m', wordSpacingUnit: 'word-spacing-unit'
        };
        Object.keys(map).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (typeof v === 'number') {
                    var css = map[k];
                    var unit = '';
                    if (css.indexOf('font-size') === 0 && css !== 'font-size-unit') unit = typo.sizeUnit || 'px';
                    else if (css.indexOf('line-height') === 0 && css !== 'line-height-unit') unit = typo.lineHeightUnit || '';
                    else if (css.indexOf('letter-spacing') === 0 && css !== 'letter-spacing-unit') unit = typo.letterSpacingUnit || 'px';
                    else if (css.indexOf('word-spacing') === 0 && css !== 'word-spacing-unit') unit = typo.wordSpacingUnit || 'px';
                    v = v + unit;
                }
                el.style.setProperty(prefix + map[k], v);
            }
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

    // ── build one speaker card ───────────────────────────────────────
    function buildCard(spk, a) {
        var card = mk('div', '', {
            background: a.cardBgColor || '#ffffff',
            border: '1px solid ' + (a.cardBorderColor || '#e2e8f0'),
            borderRadius: (a.borderRadius || 16) + 'px',
            padding: '24px',
            display: 'flex', flexDirection: 'column'
        });

        // Avatar
        var sz = a.avatarSize || 64;
        var avatar = tx('div', '', spk.avatarInitials || '?', {
            width: sz + 'px', height: sz + 'px', borderRadius: '50%',
            background: spk.avatarBg || '#6366f1', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: Math.round(sz * 0.35) + 'px', fontWeight: '700',
            flexShrink: '0', marginBottom: '14px',
            lineHeight: sz + 'px', textAlign: 'center'
        });

        var nameEl = tx('div', 'bkbg-esp-name', spk.name || '', {
            color: a.nameColor || '#0f172a',
            marginBottom: '4px'
        });
        var jobEl = tx('div', 'bkbg-esp-body', spk.title || '', {
            color: a.jobTitleColor || '#6366f1',
            fontWeight: '600', marginBottom: '2px'
        });
        var compEl = tx('div', 'bkbg-esp-body bkbg-esp-company', '@ ' + (spk.company || ''), {
            color: a.companyColor || '#64748b',
            marginBottom: '12px'
        });

        ap(card, avatar, nameEl, jobEl, compEl);

        // Bio
        if (a.showBio && spk.bio) {
            var bioEl = tx('p', 'bkbg-esp-body', spk.bio, {
                color: a.bioColor || '#374151',
                margin: '0 0 14px'
            });
            ap(card, bioEl);
        }

        // Session block
        if (a.showSession && spk.session) {
            var sessBox = mk('div', '', {
                background: a.sessionBg || '#f0f9ff',
                border: '1px solid ' + (a.sessionBorderColor || '#bae6fd'),
                borderRadius: '10px', padding: '10px 12px', marginBottom: '12px'
            });
            var timeEl = tx('div', 'bkbg-esp-session-time', '\uD83D\uDD50 ' + (spk.sessionTime || ''), {
                color: a.sessionTimeColor || '#0369a1',
                marginBottom: '4px'
            });
            var titleEl = tx('div', 'bkbg-esp-body', spk.session, {
                fontWeight: '600',
                color: a.sessionTitleColor || '#0c4a6e'
            });
            ap(sessBox, timeEl, titleEl);
            ap(card, sessBox);
        }

        // Twitter
        if (a.showTwitter && spk.twitterHandle) {
            var twEl = tx('div', 'bkbg-esp-body bkbg-esp-twitter', '\uD835\uDD4F ' + spk.twitterHandle, {
                color: a.twitterColor || '#0ea5e9'
            });
            ap(card, twEl);
        }

        return card;
    }

    // ── build full block ─────────────────────────────────────────────
    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a;
        try { a = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { a = {}; }

        // Wrapper styles
        appEl.className += ' bkbg-esp-wrap';
        appEl.style.background   = a.bgColor || '#f8fafc';
        appEl.style.border       = '1px solid ' + (a.borderColor || '#e2e8f0');
        appEl.style.borderRadius = (a.borderRadius || 16) + 'px';
        appEl.style.overflow     = 'hidden';

        typoCssVarsForEl(a.typoTitle, '--bkbg-esp-ttl-', appEl);
        typoCssVarsForEl(a.typoSubtitle, '--bkbg-esp-sub-', appEl);
        typoCssVarsForEl(a.typoName, '--bkbg-esp-nm-', appEl);
        typoCssVarsForEl(a.typoBody, '--bkbg-esp-bd-', appEl);

        // Header
        var header = mk('div', '', {
            background: a.headerBgColor || '#ffffff',
            borderBottom: '1px solid ' + (a.borderColor || '#e2e8f0'),
            padding: '32px 32px 24px'
        });
        var titleEl = tx('h2', 'bkbg-esp-title', a.eventTitle || 'Speaker Lineup', {
            color: a.titleColor || '#0f172a',
            margin: '0 0 8px', padding: '0'
        });
        ap(header, titleEl);
        if (a.showSubtitle && a.eventSubtitle) {
            var subEl = tx('p', 'bkbg-esp-subtitle', a.eventSubtitle, {
                color: a.subtitleColor || '#64748b',
                margin: '0'
            });
            ap(header, subEl);
        }
        ap(appEl, header);

        // Grid body
        var cols = (a.layout === 'grid') ? (a.columns || 2) : 1;
        var body = mk('div', '', {
            display: 'grid',
            gridTemplateColumns: 'repeat(' + cols + ', 1fr)',
            gap: '20px', padding: '28px'
        });
        (a.speakers || []).forEach(function (spk) {
            ap(body, buildCard(spk, a));
        });
        ap(appEl, body);
    }

    function init() {
        document.querySelectorAll('.bkbg-event-speaker-app').forEach(buildBlock);
    }
    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
