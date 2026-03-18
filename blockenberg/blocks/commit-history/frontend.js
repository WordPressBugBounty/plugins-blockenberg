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

    // ── helpers ─────────────────────────────────────────────────────
    function getPrefix(msg) {
        var m = (msg || '').match(/^(\w+)[\s:!]/);
        return m ? m[1].toLowerCase() : '';
    }
    function initials(name) {
        var parts = (name || 'A').trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return parts[0][0].toUpperCase();
    }
    function prefixColor(prefix, a) {
        if (prefix === 'feat')     return a.featColor;
        if (prefix === 'fix')      return a.fixColor;
        if (prefix === 'chore')    return a.choreColor;
        if (prefix === 'docs')     return a.docsColor;
        if (prefix === 'refactor') return a.refactorColor;
        return a.choreColor;
    }

    // ── build a single commit row ────────────────────────────────────
    function buildCommitRow(commit, a, isLast) {
        var prefix = getPrefix(commit.message);

        // Left column: dot + vertical line
        var dot = mk('div', '', {
            width: '10px', height: '10px', borderRadius: '50%',
            background: a.dotColor, flexShrink: '0',
            marginTop: '5px', position: 'relative', zIndex: '1',
            boxShadow: '0 0 0 3px ' + a.bgColor + ', 0 0 0 5px ' + a.dotColor + '22'
        });
        var leftCol = mk('div', '', {
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            width: '20px', flexShrink: '0', marginTop: '2px'
        });
        ap(leftCol, dot);
        if (!isLast) {
            var line = mk('div', '', {
                width: '2px', flex: '1', background: a.lineColor,
                margin: '4px auto 0', minHeight: '24px'
            });
            ap(leftCol, line);
        }

        // Avatar
        var avatar = null;
        if (a.showAuthorInitials) {
            avatar = tx('div', '', initials(commit.author), {
                width: '26px', height: '26px', borderRadius: '50%',
                background: a.authorBg, color: a.authorColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700', flexShrink: '0',
                lineHeight: '26px', textAlign: 'center'
            });
        }

        // Message row
        var msgRow = mk('div', '', { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' });
        if (prefix) {
            var prefixEl = tx('span', '', prefix, {
                fontSize: '11px', fontWeight: '600',
                color: prefixColor(prefix, a),
                marginRight: '4px', letterSpacing: '0.02em'
            });
            ap(msgRow, prefixEl);
        }
        var msgEl = tx('span', 'bkcmh-msg', commit.message, {
            color: a.messageColor
        });
        ap(msgRow, msgEl);

        // Tags row
        var tagRow = null;
        if (a.showTags && commit.tags && commit.tags.length) {
            tagRow = mk('div', '', { display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' });
            commit.tags.forEach(function (tag) {
                var badge = tx('span', '', '\uD83C\uDFF7 ' + tag, {
                    display: 'inline-flex', alignItems: 'center',
                    background: a.tagBg, color: a.tagColor,
                    borderRadius: '4px', padding: '1px 7px',
                    fontSize: '11px', fontWeight: '600', letterSpacing: '0.04em'
                });
                ap(tagRow, badge);
            });
        }

        // Meta row
        var metaRow = mk('div', '', {
            display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'
        });
        if (avatar) ap(metaRow, avatar);
        var authorEl = tx('span', 'bkcmh-meta', commit.author, {
            color: a.authorColor
        });
        ap(metaRow, authorEl);

        if (a.showHash && commit.hash) {
            var hashEl = tx('span', 'bkcmh-hash', commit.hash, {
                color: a.hashColor, background: a.tagBg,
                borderRadius: '4px', padding: '1px 6px'
            });
            ap(metaRow, hashEl);
        }
        if (a.showDate && commit.date) {
            var dateEl = tx('span', 'bkcmh-meta', commit.date, {
                color: a.dateColor, marginLeft: 'auto'
            });
            ap(metaRow, dateEl);
        }

        var rightCol = mk('div', '', {
            flex: '1', minWidth: '0', paddingBottom: isLast ? '0' : '16px'
        });
        ap(rightCol, msgRow);
        if (tagRow) ap(rightCol, tagRow);
        ap(rightCol, metaRow);

        var row = mk('div', '', { display: 'flex', gap: '14px' });
        ap(row, leftCol, rightCol);
        return row;
    }

    // ── build full block ─────────────────────────────────────────────
    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a;
        try { a = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { a = {}; }

        // Header
        var dotsWrap = mk('div', '', { display: 'flex', gap: '6px', alignItems: 'center' });
        ap(dotsWrap,
            mk('span', '', { width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'block' }),
            mk('span', '', { width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', display: 'block' }),
            mk('span', '', { width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', display: 'block' })
        );
        var repoSpan = tx('span', '', '\uD83D\uDCC1 ' + (a.repoName || 'repo'), {
            color: a.repoColor || '#f8fafc', fontWeight: '700',
            fontSize: ((a.fontSize || 14) + 1) + 'px', letterSpacing: '0.01em'
        });

        var header = mk('div', '', {
            display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
            padding: '12px 16px',
            background: a.headerBg || '#1e293b',
            borderBottom: '1px solid ' + (a.borderColor || '#1e293b'),
            borderRadius: (a.borderRadius || 12) + 'px ' + (a.borderRadius || 12) + 'px 0 0'
        });
        ap(header, dotsWrap, repoSpan);

        if (a.showBranch && a.branchName) {
            var branchDot = mk('span', '', {
                width: '8px', height: '8px', borderRadius: '50%',
                background: a.branchColor || '#4ade80', display: 'inline-block'
            });
            var branchText = tx('span', '', a.branchName, {});
            var branchBadge = mk('span', '', {
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: a.branchBg || '#166534', color: a.branchColor || '#4ade80',
                borderRadius: '20px', padding: '2px 10px',
                fontSize: '12px', fontWeight: '600'
            });
            ap(branchBadge, branchDot, branchText);
            ap(header, branchBadge);
        }

        // Body
        var body = mk('div', '', { padding: '20px 20px 12px' });
        var commits = a.commits || [];
        commits.forEach(function (c, idx) {
            var row = buildCommitRow(c, a, idx === commits.length - 1);
            ap(body, row);
        });

        // Wrap
        appEl.style.background     = a.bgColor || '#0f172a';
        appEl.style.border         = '1px solid ' + (a.borderColor || '#1e293b');
        appEl.style.borderRadius   = (a.borderRadius || 12) + 'px';
        appEl.style.overflow       = 'hidden';
        appEl.style.fontFamily     = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        typoCssVarsForEl(appEl, a.typoMessage, '--bkcmh-msg-');
        typoCssVarsForEl(appEl, a.typoMeta,    '--bkcmh-meta-');
        ap(appEl, header, body);
    }

    function init() {
        document.querySelectorAll('.bkbg-commit-history-app').forEach(buildBlock);
    }
    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
