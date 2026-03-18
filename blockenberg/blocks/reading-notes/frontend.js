(function () {
    'use strict';

    function mk(tag, cls, styles) {
        var d = document.createElement(tag);
        if (cls) d.className = cls;
        if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; });
        return d;
    }
    function mkText(tag, cls, text, styles) {
        var d = mk(tag, cls, styles);
        d.textContent = text;
        return d;
    }

    function getNoteStyle(type, o) {
        if (type === 'quote')    return { bg: o.quoteBg,    color: o.quoteColor,    accent: o.quoteAccent    };
        if (type === 'insight')  return { bg: o.insightBg,  color: o.insightColor,  accent: o.insightAccent  };
        if (type === 'question') return { bg: o.questionBg, color: o.questionColor, accent: o.questionAccent };
        return                          { bg: o.summaryBg,  color: o.summaryColor,  accent: o.summaryAccent  };
    }

    function noteIcon(type) {
        if (type === 'quote')    return '\u201C'; /* " */
        if (type === 'insight')  return '💡';
        if (type === 'question') return '?';
        return '📝';
    }

    function buildStars(rating, starColor) {
        var span = mk('span', 'bkbg-rn-stars', { color: starColor, letterSpacing: '2px', fontSize: '18px' });
        var s = '';
        for (var i = 1; i <= 5; i++) { s += i <= rating ? '★' : '☆'; }
        span.textContent = s;
        return span;
    }

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
        document.querySelectorAll('.bkbg-reading-notes-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts; try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = {
                bookTitle:     opts.bookTitle   || '',
                author:        opts.author      || '',
                genre:         opts.genre       || '',
                coverEmoji:    opts.coverEmoji  || '📖',
                rating:        opts.rating      !== undefined ? opts.rating : 5,
                dateRead:      opts.dateRead    || '',
                showHeader:    opts.showHeader  !== false,
                showAuthor:    opts.showAuthor  !== false,
                showGenre:     opts.showGenre   !== false,
                showRating:    opts.showRating  !== false,
                showDateRead:  opts.showDateRead !== false,
                notes:         opts.notes       || [],
                layout:        opts.layout      || 'list',
                borderRadius:  opts.borderRadius !== undefined ? opts.borderRadius : 12,
                gap:           opts.gap          !== undefined ? opts.gap          : 12,

                bgColor:       opts.bgColor       || '',
                headerBg:      opts.headerBg      || '#1e293b',
                headerColor:   opts.headerColor   || '#ffffff',
                starColor:     opts.starColor      || '#f59e0b',
                quoteBg:       opts.quoteBg        || '#fdf2f8',
                quoteColor:    opts.quoteColor     || '#86198f',
                quoteAccent:   opts.quoteAccent    || '#d946ef',
                insightBg:     opts.insightBg      || '#eff6ff',
                insightColor:  opts.insightColor   || '#1d4ed8',
                insightAccent: opts.insightAccent  || '#3b82f6',
                questionBg:    opts.questionBg     || '#fffbeb',
                questionColor: opts.questionColor  || '#92400e',
                questionAccent:opts.questionAccent || '#f59e0b',
                summaryBg:     opts.summaryBg      || '#f0fdf4',
                summaryColor:  opts.summaryColor   || '#14532d',
                summaryAccent: opts.summaryAccent  || '#22c55e'
            };

            /* ── Outer block ─────────────────────────────────── */
            var block = mk('div', 'bkbg-rn-block');
            typoCssVarsForEl(block, opts.titleTypo || {}, '--bkrn-tt-');
            typoCssVarsForEl(block, opts.noteTypo || {}, '--bkrn-nt-');
            if (o.bgColor) block.style.background = o.bgColor;

            /* ── Header ──────────────────────────────────────── */
            if (o.showHeader) {
                var header = mk('div', 'bkbg-rn-header', {
                    background: o.headerBg,
                    color: o.headerColor,
                    padding: '24px 28px',
                    borderRadius: o.borderRadius + 'px',
                    marginBottom: o.gap + 'px'
                });

                var emojiEl = mkText('div', 'bkbg-rn-cover-emoji', '', { fontSize: '48px', lineHeight: '1', flexShrink: '0' });
                var _IP = window.bkbgIconPicker;
                if (_IP && o.coverEmojiType && o.coverEmojiType !== 'custom-char') {
                    var _icn = _IP.buildFrontendIcon(o.coverEmojiType, o.coverEmoji, o.coverEmojiDashicon, o.coverEmojiImageUrl, o.coverEmojiDashiconColor);
                    if (_icn) emojiEl.appendChild(_icn);
                    else emojiEl.textContent = o.coverEmoji;
                } else {
                    emojiEl.textContent = o.coverEmoji;
                }
                header.appendChild(emojiEl);

                var info = mk('div', 'bkbg-rn-book-info', { flex: '1' });

                var titleEl = mkText('h3', 'bkbg-rn-book-title', o.bookTitle, {
                    margin: '0 0 4px', color: o.headerColor
                });
                info.appendChild(titleEl);

                if (o.showAuthor && o.author) {
                    info.appendChild(mkText('div', 'bkbg-rn-author', 'by ' + o.author, {
                        fontSize: '14px', color: o.headerColor, opacity: '.84', marginBottom: '8px'
                    }));
                }

                var meta = mk('div', 'bkbg-rn-meta');
                if (o.showGenre && o.genre) {
                    meta.appendChild(mkText('span', 'bkbg-rn-genre-badge', o.genre, {
                        background: 'rgba(255,255,255,.15)', color: o.headerColor
                    }));
                }
                if (o.showRating) {
                    meta.appendChild(buildStars(o.rating, o.starColor));
                }
                if (o.showDateRead && o.dateRead) {
                    meta.appendChild(mkText('span', 'bkbg-rn-date', o.dateRead, {
                        fontSize: '12px', color: o.headerColor, opacity: '.7'
                    }));
                }
                info.appendChild(meta);
                header.appendChild(info);
                block.appendChild(header);
            }

            /* ── Notes ───────────────────────────────────────── */
            var notesWrap = mk('div', 'bkbg-rn-notes' + (o.layout === 'grid' ? ' is-grid' : ''), {
                gap: o.gap + 'px'
            });

            o.notes.forEach(function (note) {
                var ns = getNoteStyle(note.type || 'insight', o);
                var isQuote = note.type === 'quote';

                var noteEl = mk('div', 'bkbg-rn-note bkbg-rn-note--' + (note.type || 'insight'), {
                    background: ns.bg,
                    borderLeft: '4px solid ' + ns.accent,
                    borderRadius: (o.borderRadius - 2) + 'px',
                    padding: '14px 18px'
                });

                var iconEl = mkText('span', 'bkbg-rn-note-icon' + (isQuote ? ' is-quote' : ''), noteIcon(note.type || 'insight'), {
                    color: ns.accent,
                    fontSize: isQuote ? '32px' : '18px',
                    lineHeight: '1',
                    flexShrink: '0',
                    fontFamily: isQuote ? 'Georgia, serif' : 'inherit',
                    marginTop: isQuote ? '-6px' : '0'
                });

                var body = mk('div', 'bkbg-rn-note-body', { flex: '1' });

                body.appendChild(mkText('span', 'bkbg-rn-note-type-label', note.type || 'insight', { color: ns.accent }));

                var text = mk('p', 'bkbg-rn-note-text', {
                    margin: '0',
                    color: ns.color
                });
                text.textContent = note.text || '';
                body.appendChild(text);

                if (note.source) {
                    body.appendChild(mkText('span', 'bkbg-rn-note-source', '— ' + note.source, {
                        color: ns.accent, fontSize: '12px', fontStyle: 'italic'
                    }));
                }

                noteEl.appendChild(iconEl);
                noteEl.appendChild(body);
                notesWrap.appendChild(noteEl);
            });

            block.appendChild(notesWrap);

            /* ── Insert ──────────────────────────────────────── */
            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
