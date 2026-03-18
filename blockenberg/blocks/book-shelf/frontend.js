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

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo) return;
        if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    // ── helpers ──────────────────────────────────────────────────────
    function renderStars(rating, color, size) {
        var wrap = mk('span', '');
        for (var i = 1; i <= 5; i++) {
            ap(wrap, tx('span', '', '\u2605', { color: i <= rating ? (color || '#f59e0b') : '#334155', fontSize: (size || 12) + 'px' }));
        }
        return wrap;
    }

    function statusBadge(status, a) {
        var bg = status === 'read' ? (a.statusReadBg || '#166534')
               : status === 'reading' ? (a.statusReadingBg || '#1e40af')
               : (a.statusWantBg || '#78350f');
        var label = status === 'read' ? '\u2713 Read' : status === 'reading' ? '\u25B6 Reading' : '\u25CB Want';
        return tx('span', '', label, {
            background: bg, color: '#fff', borderRadius: '4px',
            padding: '1px 7px', fontSize: '10px', fontWeight: '700', letterSpacing: '.04em'
        });
    }

    // ── Shelf layout ─────────────────────────────────────────────────
    function buildShelf(appEl, a) {
        var sw = a.spineWidth || 46;
        var sh = a.spineHeight || 190;

        var bookRow = mk('div', 'bkbg-bs-row', {
            display: 'flex', alignItems: 'flex-end', gap: '3px',
            padding: '12px 20px 0', flexWrap: 'nowrap',
            overflowX: 'auto'
        });

        (a.books || []).forEach(function (b) {
            var spine = mk('div', '', {
                width: sw + 'px', height: sh + 'px',
                background: b.coverColor || '#334155',
                borderRadius: '3px', flexShrink: '0', position: 'relative',
                boxShadow: '-2px 2px 4px rgba(0,0,0,.4), inset 2px 0 4px rgba(255,255,255,.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', cursor: 'default'
            });
            spine.title = b.title + (b.author ? ' \u2014 ' + b.author : '');

            var titleDiv = tx('div', '', b.title, {
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                color: a.spineTextColor || '#ffffff',
                fontSize: (a.spineFontSize || 11) + 'px',
                fontWeight: '700', letterSpacing: '0.04em',
                padding: '8px 4px',
                maxHeight: (sh - 16) + 'px',
                overflow: 'hidden', textOverflow: 'ellipsis',
                lineHeight: '1.2', textShadow: '0 1px 2px rgba(0,0,0,.5)'
            });

            var dot = mk('div', '', {
                position: 'absolute', top: '5px', right: '4px',
                width: '6px', height: '6px', borderRadius: '50%',
                background: b.status === 'read' ? '#4ade80' : b.status === 'reading' ? '#60a5fa' : '#fbbf24'
            });

            ap(spine, titleDiv, dot);
            ap(bookRow, spine);
        });

        var plank = mk('div', '', {
            height: '16px', background: a.shelfColor || '#8B5E3C',
            boxShadow: '0 4px 8px ' + (a.shelfShadow || '#5c3d1e'),
            margin: '0 8px', borderRadius: '2px'
        });

        ap(appEl, bookRow, plank);
    }

    // ── Cards layout ─────────────────────────────────────────────────
    function buildCards(appEl, a) {
        var grid = mk('div', '', {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '16px', padding: '20px'
        });

        (a.books || []).forEach(function (b) {
            var card = mk('div', '', {
                background: a.cardBg || '#1e293b',
                border: '1px solid ' + (a.cardBorderColor || '#334155'),
                borderRadius: '10px', padding: '10px'
            });

            var coverWrap = mk('div', '', { position: 'relative', width: '100%', paddingTop: '140%', marginBottom: '10px' });
            var cover = mk('div', '', {
                position: 'absolute', inset: '0',
                background: b.coverColor || '#334155',
                borderRadius: '4px 8px 8px 4px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '12px', gap: '6px',
                boxShadow: '-3px 3px 6px rgba(0,0,0,.4), inset 3px 0 6px rgba(255,255,255,.1)'
            });
            var coverTitle = tx('div', '', b.title, {
                color: '#fff', fontSize: '10px', fontWeight: '700',
                textAlign: 'center', lineHeight: '1.3',
                textShadow: '0 1px 3px rgba(0,0,0,.5)', overflow: 'hidden'
            });
            var coverAuthor = tx('div', '', b.author || '', {
                color: 'rgba(255,255,255,.7)', fontSize: '9px', textAlign: 'center'
            });
            ap(cover, coverTitle, coverAuthor);
            ap(coverWrap, cover);

            var meta = mk('div', '', { display: 'flex', flexDirection: 'column', gap: '6px' });
            if (a.showRating) ap(meta, renderStars(b.rating, a.ratingColor, 12));
            if (a.showGenre && b.genre) {
                ap(meta, tx('span', '', b.genre, {
                    background: a.genreBg || '#1e293b', color: a.genreColor || '#94a3b8',
                    borderRadius: '4px', padding: '1px 6px', fontSize: '10px', fontWeight: '600',
                    display: 'inline-block'
                }));
            }
            if (a.showStatus) ap(meta, statusBadge(b.status, a));
            ap(card, coverWrap, meta);
            ap(grid, card);
        });
        ap(appEl, grid);
    }

    // ── List layout ──────────────────────────────────────────────────
    function buildList(appEl, a) {
        var list = mk('div', '', { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' });
        var fontSize = a.fontSize || 13;

        (a.books || []).forEach(function (b) {
            var row = mk('div', '', { display: 'flex', gap: '12px', alignItems: 'center' });
            var spine = mk('div', '', {
                width: '36px', height: '52px', background: b.coverColor || '#334155',
                borderRadius: '2px 4px 4px 2px', flexShrink: '0',
                boxShadow: 'inset 2px 0 4px rgba(255,255,255,.1)'
            });
            var meta = mk('div', '', { flex: '1', minWidth: '0' });

            var titleEl = tx('div', 'bkbg-bsh-body', b.title, {
                color: a.titleColor || '#f5deb3',
                marginBottom: '2px'
            });
            ap(meta, titleEl);

            if (a.showAuthor && b.author) {
                ap(meta, tx('div', 'bkbg-bsh-body-author', b.author, {
                    color: a.authorColor || '#94a3b8', marginBottom: '4px'
                }));
            }

            var tagRow = mk('div', '', { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' });
            if (a.showRating) ap(tagRow, renderStars(b.rating, a.ratingColor, 12));
            if (a.showGenre && b.genre) {
                ap(tagRow, tx('span', '', b.genre, {
                    background: a.genreBg || '#1e293b', color: a.genreColor || '#94a3b8',
                    borderRadius: '4px', padding: '1px 6px', fontSize: '10px', display: 'inline-block'
                }));
            }
            if (a.showStatus) ap(tagRow, statusBadge(b.status, a));
            if (a.showYear && b.year) {
                ap(tagRow, tx('span', '', String(b.year), { color: a.authorColor || '#94a3b8', fontSize: '11px' }));
            }
            ap(meta, tagRow);
            ap(row, spine, meta);
            ap(list, row);
        });
        ap(appEl, list);
    }

    // ── Build block ──────────────────────────────────────────────────
    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a;
        try { a = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { a = {}; }

        appEl.style.background   = a.bgColor || '#1c1410';
        appEl.style.borderRadius = (a.borderRadius || 14) + 'px';
        appEl.style.overflow     = 'hidden';
        appEl.style.fontFamily   = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

        // Header
        if (a.showTitle && a.shelfTitle) {
            var header = mk('div', '', { padding: '20px 20px 10px', background: a.headerBg || '#2d1f14' });
            var titleEl = tx('h2', 'bkbg-bsh-title', a.shelfTitle, {
                color: a.titleColor || '#f5deb3',
                margin: '0', padding: '0'
            });
            ap(header, titleEl);
            ap(appEl, header);
        }

        typoCssVarsForEl(a.typoTitle, '--bkbg-bsh-title-', appEl);
        typoCssVarsForEl(a.typoBody, '--bkbg-bsh-body-', appEl);

        if (a.layout === 'shelf' || !a.layout) {
            buildShelf(appEl, a);
        } else if (a.layout === 'cards') {
            buildCards(appEl, a);
        } else {
            buildList(appEl, a);
        }
    }

    function init() {
        document.querySelectorAll('.bkbg-book-shelf-app').forEach(buildBlock);
    }
    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
