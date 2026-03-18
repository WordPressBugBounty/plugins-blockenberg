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

    var resIcon = { article: '📄', video: '🎥', tool: '🛠️', download: '⬇️', link: '🔗' };

    function sectionHead(label, a) {
        var d = mk('div', 'bkbg-sn-section-head', {
            color: a.accentColor,
            borderBottomColor: a.accentColor
        });
        d.textContent = label;
        return d;
    }

    function init() {
        document.querySelectorAll('.bkbg-show-notes-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var a;
            try { a = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { return; }

            var lh = ((a.lineHeight || 168) / 100).toFixed(2);

            var wrap = mk('div', 'bkbg-sn-wrap', {
                border: '1px solid ' + (a.borderColor || '#e5e7eb'),
                borderRadius: (a.borderRadius || 12) + 'px',
                overflow: 'hidden',
                background: a.bgColor || '#fff'
            });
            typoCssVarsForEl(wrap, a.titleTypo, '--bksn-tt-');
            typoCssVarsForEl(wrap, a.bodyTypo, '--bksn-bt-');
            typoCssVarsForEl(wrap, a.typoQuote, '--bksn-qt-');

            // ── Header ───────────────────────────────────────────────────
            var header = mk('div', 'bkbg-sn-header', { background: a.headerBg || '#0f172a' });

            if (a.showEpisodeMeta) {
                var pRow = mk('div', 'bkbg-sn-podcast-row');
                if (a.podcastName) ap(pRow, tx('span', 'bkbg-sn-podcast-name', a.podcastName, { color: a.metaColor || '#94a3b8' }));
                if (a.episodeNumber) {
                    ap(pRow, tx('span', 'bkbg-sn-dot', '·', { color: a.metaColor || '#94a3b8' }));
                    ap(pRow, tx('span', 'bkbg-sn-ep-num', a.episodeNumber, { color: a.metaColor || '#94a3b8' }));
                }
                if (a.season) {
                    ap(pRow, tx('span', 'bkbg-sn-dot', '/', { color: a.metaColor || '#94a3b8' }));
                    ap(pRow, tx('span', 'bkbg-sn-ep-num', a.season, { color: a.metaColor || '#94a3b8' }));
                }
                ap(header, pRow);
            }

            var titleEl = mk('h2', 'bkbg-sn-title', { color: a.headerColor || '#fff' });
            titleEl.textContent = a.episodeTitle || '';
            ap(header, titleEl);

            if (a.showMeta && (a.publishDate || a.duration)) {
                var metaRow = mk('div', 'bkbg-sn-meta');
                if (a.publishDate) ap(metaRow, tx('span', 'bkbg-sn-meta-item', '📅 ' + a.publishDate, { color: a.metaColor || '#94a3b8' }));
                if (a.duration)    ap(metaRow, tx('span', 'bkbg-sn-meta-item', '⏱ ' + a.duration,     { color: a.metaColor || '#94a3b8' }));
                ap(header, metaRow);
            }

            ap(wrap, header);

            // ── Body ─────────────────────────────────────────────────────
            var body = mk('div', 'bkbg-sn-body');

            // Intro
            if (a.showIntro && a.intro) {
                var introBox = mk('div', 'bkbg-sn-intro', { background: a.introBg || '#f8fafc', borderRadius: '8px' });
                var introP = mk('p', '', { margin: '0', color: a.introColor || '#374151', lineHeight: lh });
                introP.textContent = a.intro;
                ap(introBox, introP);
                ap(body, introBox);
            }

            // Featured Quote
            if (a.showQuote && a.quoteHighlight) {
                var fig = mk('figure', 'bkbg-sn-quote', {
                    background: a.quoteBg || '#f0f9ff',
                    borderLeftColor: a.quoteBorder || '#3b82f6'
                });
                var bq = mk('blockquote', '', { margin: '0 0 8px', fontStyle: 'italic', color: a.quoteColor || '#0369a1', lineHeight: lh });
                bq.textContent = '\u201c' + a.quoteHighlight + '\u201d';
                ap(fig, bq);
                if (a.quoteSpeaker) {
                    var figcap = tx('figcaption', '', '— ' + a.quoteSpeaker, { color: a.quoteColor || '#0369a1', fontSize: '12px', fontWeight: '700', opacity: '.8' });
                    ap(fig, figcap);
                }
                ap(body, fig);
            }

            // Sponsors
            if (a.showSponsors && a.sponsors && a.sponsors.length) {
                var spSection = mk('div', 'bkbg-sn-sponsors-section');
                ap(spSection, sectionHead(a.sponsorsLabel || 'Sponsors', a));
                a.sponsors.forEach(function (sp) {
                    var card = mk('div', 'bkbg-sn-sponsor', {
                        background: a.sponsorBg || '#fffbeb',
                        borderColor: a.sponsorBorder || '#fbbf24'
                    });
                    var top = mk('div', 'bkbg-sn-sponsor-top');
                    ap(top, tx('strong', 'bkbg-sn-sponsor-name', sp.name, { color: '#713f12' }));
                    if (sp.code) ap(top, tx('span', 'bkbg-sn-sponsor-code', 'Code: ' + sp.code));
                    ap(card, top);
                    if (sp.description) {
                        var desc = mk('p', 'bkbg-sn-sponsor-desc', { color: a.sponsorColor || '#374151', fontSize: (a.fontSize - 1) + 'px' });
                        desc.textContent = sp.description;
                        ap(card, desc);
                    }
                    ap(spSection, card);
                });
                ap(body, spSection);
            }

            // Chapters
            if (a.showChapters && a.chapters && a.chapters.length) {
                var chSection = mk('div', 'bkbg-sn-chapters-section');
                ap(chSection, sectionHead(a.chaptersLabel || 'Chapters', a));
                a.chapters.forEach(function (ch) {
                    var row = mk('div', 'bkbg-sn-chapter', { borderBottomColor: a.borderColor || '#e5e7eb' });
                    ap(row, tx('span', 'bkbg-sn-chapter-time', ch.time, {
                        background: a.chapterTimeBg || '#f1f5f9',
                        color: a.chapterTimeColor || '#475569'
                    }));
                    ap(row, tx('span', 'bkbg-sn-chapter-title', ch.title, { color: a.chapterTitleColor || '#111827' }));
                    ap(chSection, row);
                });
                ap(body, chSection);
            }

            // Links Mentioned
            if (a.showLinks && a.links && a.links.length) {
                var lkSection = mk('div', 'bkbg-sn-links-section');
                ap(lkSection, sectionHead(a.linksLabel || 'Links Mentioned', a));
                a.links.forEach(function (lnk) {
                    var item = mk('div', 'bkbg-sn-link', { borderBottomColor: a.borderColor || '#e5e7eb' });
                    var anchor = mk('a', 'bkbg-sn-link-title');
                    anchor.textContent = lnk.title;
                    anchor.href = lnk.url || '#';
                    anchor.target = '_blank';
                    anchor.rel = 'noopener';
                    anchor.style.color = a.linkColor || '#2563eb';
                    ap(item, anchor);
                    if (lnk.description) ap(item, tx('span', 'bkbg-sn-link-desc', lnk.description, { color: a.linkDescColor || '#6b7280' }));
                    ap(lkSection, item);
                });
                ap(body, lkSection);
            }

            // Resources
            if (a.showResources && a.resources && a.resources.length) {
                var rsSection = mk('div', 'bkbg-sn-resources-section');
                ap(rsSection, sectionHead(a.resourcesLabel || 'Episode Resources', a));
                a.resources.forEach(function (r) {
                    var row = mk('div', 'bkbg-sn-resource', { borderLeftColor: a.accentColor || '#3b82f6' });
                    ap(row, tx('span', 'bkbg-sn-resource-icon', resIcon[r.type] || '🔗'));
                    var rtitle = mk('a', 'bkbg-sn-resource-title');
                    rtitle.textContent = r.title;
                    rtitle.href = r.url || '#';
                    rtitle.target = '_blank';
                    rtitle.rel = 'noopener';
                    rtitle.style.color = a.linkColor || '#2563eb';
                    ap(row, rtitle);
                    ap(rsSection, row);
                });
                ap(body, rsSection);
            }

            // Tags
            if (a.showTags && a.tags && a.tags.length) {
                var tagRow = mk('div', 'bkbg-sn-tags');
                a.tags.forEach(function (tag) {
                    ap(tagRow, tx('span', 'bkbg-sn-tag', tag, {
                        background: a.tagBg || '#eff6ff',
                        color: a.tagColor || '#1d4ed8'
                    }));
                });
                ap(body, tagRow);
            }

            ap(wrap, body);
            appEl.appendChild(wrap);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
