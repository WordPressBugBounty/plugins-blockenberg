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

    function resourceIcon(type) {
        var map = { article: '📄', book: '📚', link: '🔗', video: '🎥', tool: '🛠️' };
        return map[type] || '🔗';
    }

    function sectionHead(label, accentColor, sectionHeadColor, parentEl) {
        var h = tx('div', 'bkbg-pe-section-head', label, {
            color: sectionHeadColor,
            borderBottomColor: accentColor
        });
        ap(parentEl, h);
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
        document.querySelectorAll('.bkbg-podcast-episode-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                episodeTitle: 'Podcast Episode', episodeNumber: '1', season: '1',
                showNumber: true, podcastName: '', showPodcastName: true,
                publishDate: '', duration: '', showMeta: true,
                description: '', showDescription: true,
                guests: [], showGuests: true, guestsLabel: 'Guests',
                timestamps: [], showTimestamps: true, timestampsLabel: 'Chapters',
                listenLinks: [], showListenLinks: true, listenLinksLabel: 'Listen on',
                resources: [], showResources: true, resourcesLabel: 'Resources & Links',
                transcript: '', showTranscript: true, transcriptLabel: 'Highlighted Quote',
                tags: [], showTags: true,
                fontSize: 14, titleFontSize: 22, lineHeight: 168, borderRadius: 12,
                titleTypo: {}, bodyTypo: {},
                bgColor: '#0f172a', headerColor: '#ffffff',
                bodyBg: '#ffffff', bodyBorderColor: '#e5e7eb',
                textColor: '#374151', mutedColor: '#6b7280',
                accentColor: '#3b82f6', sectionHeadColor: '#0f172a',
                chapterTimeBg: '#f1f5f9', chapterTimeColor: '#1e293b',
                guestBg: '#f8fafc', guestBorderColor: '#e5e7eb',
                guestNameColor: '#0f172a', guestRoleColor: '#3b82f6',
                resourceIconColor: '#3b82f6',
                tagBg: '#eff6ff', tagColor: '#1d4ed8',
                listenBtnBg: '#3b82f6', listenBtnColor: '#ffffff',
                transcriptBg: '#f8fafc', transcriptBorderColor: '#3b82f6'
            }, opts);

            // Block
            var block = mk('div', 'bkbg-pe-block', {
                border: '1px solid ' + o.bodyBorderColor,
                borderRadius: o.borderRadius + 'px',
                overflow: 'hidden'
            });
            typoCssVarsForEl(block, o.titleTypo, '--bkbg-pe-tt-');
            typoCssVarsForEl(block, o.bodyTypo, '--bkbg-pe-bd-');

            // ── Header (dark) ─────────────────────────────────────
            var header = mk('div', 'bkbg-pe-header', { background: o.bgColor });
            if (o.showPodcastName && o.podcastName) {
                ap(header, tx('div', 'bkbg-pe-show-name', o.podcastName, { color: o.headerColor }));
            }
            ap(header, tx('h2', 'bkbg-pe-title', o.episodeTitle, { color: o.headerColor }));

            var infoRow = mk('div', 'bkbg-pe-info-row');
            if (o.showNumber && (o.season || o.episodeNumber)) {
                ap(infoRow, tx('span', 'bkbg-pe-info-item', 'S' + o.season + ' · E' + o.episodeNumber, { color: o.headerColor }));
            }
            if (o.showMeta && o.publishDate) {
                ap(infoRow, tx('span', 'bkbg-pe-info-item', '📅 ' + o.publishDate, { color: o.headerColor }));
            }
            if (o.showMeta && o.duration) {
                ap(infoRow, tx('span', 'bkbg-pe-info-item', '⏱ ' + o.duration, { color: o.headerColor }));
            }
            if (o.showListenLinks && o.listenLinks && o.listenLinks.length > 0) {
                var listenRow = mk('div', 'bkbg-pe-listen-links');
                o.listenLinks.forEach(function (lnk) {
                    if (!lnk.platform) return;
                    var btn = mk('a', 'bkbg-pe-listen-btn', { background: o.listenBtnBg, color: o.listenBtnColor });
                    btn.href = lnk.url || '#';
                    btn.textContent = lnk.platform;
                    ap(listenRow, btn);
                });
                ap(infoRow, listenRow);
            }
            ap(header, infoRow);
            ap(block, header);

            // ── Body ─────────────────────────────────────────────
            var body = mk('div', 'bkbg-pe-body', { background: o.bodyBg });

            // Description
            if (o.showDescription && o.description) {
                var descSec = mk('div', 'bkbg-pe-section');
                ap(descSec, tx('p', '', o.description, { color: o.textColor, margin: '0' }));
                ap(body, descSec);
            }

            // Guests
            if (o.showGuests && o.guests && o.guests.length > 0) {
                var gSec = mk('div', 'bkbg-pe-section');
                sectionHead(o.guestsLabel || 'Guests', o.accentColor, o.sectionHeadColor, gSec);
                var grid = mk('div', 'bkbg-pe-guests-grid');
                o.guests.forEach(function (g) {
                    var card = mk('div', 'bkbg-pe-guest-card', { background: o.guestBg, borderColor: o.guestBorderColor });
                    ap(card, tx('div', 'bkbg-pe-guest-name', g.name, { color: o.guestNameColor }));
                    if (g.role) ap(card, tx('div', 'bkbg-pe-guest-role', g.role, { color: o.guestRoleColor }));
                    if (g.bio) ap(card, tx('p', 'bkbg-pe-guest-bio', g.bio, { color: o.mutedColor }));
                    ap(grid, card);
                });
                ap(gSec, grid);
                ap(body, gSec);
            }

            // Chapters
            if (o.showTimestamps && o.timestamps && o.timestamps.length > 0) {
                var tsSec = mk('div', 'bkbg-pe-section');
                sectionHead(o.timestampsLabel || 'Chapters', o.accentColor, o.sectionHeadColor, tsSec);
                var chList = mk('ul', 'bkbg-pe-chapters');
                o.timestamps.forEach(function (ts, i) {
                    var li  = mk('li', 'bkbg-pe-chapter', { borderBottomColor: o.bodyBorderColor });
                    var time = tx('span', 'bkbg-pe-chapter-time', ts.time, { background: o.chapterTimeBg, color: o.chapterTimeColor });
                    var title = tx('span', '', ts.title, { color: o.textColor });
                    ap(li, time, title);
                    ap(chList, li);
                });
                ap(tsSec, chList);
                ap(body, tsSec);
            }

            // Resources
            if (o.showResources && o.resources && o.resources.length > 0) {
                var rSec = mk('div', 'bkbg-pe-section');
                sectionHead(o.resourcesLabel || 'Resources & Links', o.accentColor, o.sectionHeadColor, rSec);
                var rList = mk('ul', 'bkbg-pe-resources');
                o.resources.forEach(function (r) {
                    var li   = mk('li', 'bkbg-pe-resource', { borderBottomColor: o.bodyBorderColor });
                    var icon = tx('span', 'bkbg-pe-resource-icon', resourceIcon(r.type), { color: o.resourceIconColor });
                    var link = mk('a', 'bkbg-pe-resource-link', { color: o.accentColor });
                    link.href = r.url || '#'; link.textContent = r.title;
                    ap(li, icon, link);
                    ap(rList, li);
                });
                ap(rSec, rList);
                ap(body, rSec);
            }

            // Quote / Transcript
            if (o.showTranscript && o.transcript) {
                var qSec = mk('div', 'bkbg-pe-section');
                sectionHead(o.transcriptLabel || 'Highlighted Quote', o.accentColor, o.sectionHeadColor, qSec);
                ap(qSec, tx('blockquote', 'bkbg-pe-quote', o.transcript, {
                    background: o.transcriptBg,
                    borderLeftColor: o.transcriptBorderColor,
                    color: o.textColor
                }));
                ap(body, qSec);
            }

            // Tags
            if (o.showTags && o.tags && o.tags.length > 0) {
                var tagWrap = mk('div', 'bkbg-pe-tags');
                o.tags.forEach(function (tag) {
                    if (!tag) return;
                    ap(tagWrap, tx('span', 'bkbg-pe-tag', tag, { background: o.tagBg, color: o.tagColor }));
                });
                ap(body, tagWrap);
            }

            ap(block, body);
            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
