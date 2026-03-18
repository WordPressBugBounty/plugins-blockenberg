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
    function ap(parent) {
        Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) parent.appendChild(c); });
        return parent;
    }

    var eventTypeInfo = {
        conference: { label: 'Conference', bg: '#ede9fe', color: '#5b21b6' },
        webinar:    { label: 'Webinar',    bg: '#dbeafe', color: '#1e40af' },
        meetup:     { label: 'Meetup',     bg: '#dcfce7', color: '#14532d' },
        workshop:   { label: 'Workshop',   bg: '#fef3c7', color: '#78350f' }
    };

    function sectionHead(label, a) {
        return tx('div', 'bkbg-ed-section-head', label, { color: a.accentColor || '#6366f1', borderBottomColor: a.accentColor || '#6366f1' });
    }

    function init() {
        document.querySelectorAll('.bkbg-event-debrief-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var a;
            try { a = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { return; }

            var lh  = ((a.lineHeight || 168) / 100).toFixed(2);
            var tInfo = eventTypeInfo[a.eventType] || eventTypeInfo.conference;

            var wrap = mk('div', 'bkbg-ed-wrap', {
                border: '1px solid ' + (a.borderColor || '#e5e7eb'),
                borderRadius: (a.borderRadius || 12) + 'px',
                overflow: 'hidden',
                background: a.bgColor || '#fff'
            });

            typoCssVarsForEl(a.typoTitle, '--bkbg-ed-ttl-', wrap);
            typoCssVarsForEl(a.typoBody,  '--bkbg-ed-bdy-', wrap);

            // ── Header ───────────────────────────────────────────────────
            var header = mk('div', 'bkbg-ed-header', { background: a.headerBg || '#1e1b4b' });
            var metaRow = mk('div', 'bkbg-ed-header-meta');
            ap(metaRow, tx('span', 'bkbg-ed-type-badge', tInfo.label, { background: tInfo.bg, color: tInfo.color }));
            if (a.eventLocation) ap(metaRow, tx('span', 'bkbg-ed-meta-item', '📍 ' + a.eventLocation, { color: a.metaColor || '#a5b4fc' }));
            if (a.eventDate)     ap(metaRow, tx('span', 'bkbg-ed-meta-item', '📅 ' + a.eventDate,     { color: a.metaColor || '#a5b4fc' }));
            ap(header, metaRow);
            ap(header, tx('h2', 'bkbg-ed-title', a.eventName || '', { color: a.headerColor || '#fff' }));
            ap(wrap, header);

            // ── Stats ─────────────────────────────────────────────────────
            if (a.showStats) {
                var statsRow = mk('div', 'bkbg-ed-stats', { borderBottomColor: a.borderColor || '#e5e7eb' });
                [[a.attendees, 'In-Person'], [a.onlineAttendees, 'Online'], [a.nps, 'NPS Score']].forEach(function (pair) {
                    var tile = mk('div', 'bkbg-ed-stat', { background: a.statBg || '#f5f3ff' });
                    ap(tile, tx('div', 'bkbg-ed-stat-value', typeof pair[0] === 'number' ? pair[0].toLocaleString() : (pair[0] || '0'), { color: a.statColor || '#4338ca' }));
                    ap(tile, tx('div', 'bkbg-ed-stat-label', pair[1]));
                    ap(statsRow, tile);
                });
                ap(wrap, statsRow);
            }

            // ── Body ─────────────────────────────────────────────────────
            var body = mk('div', 'bkbg-ed-body');

            if (a.showSummary && a.summary) {
                ap(body, tx('div', 'bkbg-ed-summary', a.summary, { background: a.summaryBg || '#f8fafc', color: a.summaryColor || '#374151' }));
            }

            // Highlights
            if (a.showHighlights && a.highlights && a.highlights.length) {
                var hlSection = mk('div', 'bkbg-ed-highlights-section');
                ap(hlSection, sectionHead(a.highlightsLabel || 'Event Highlights', a));
                a.highlights.forEach(function (h) {
                    var card = mk('div', 'bkbg-ed-highlight', { background: a.highlightBg || '#f8fafc', borderLeftColor: a.highlightBorder || '#6366f1' });
                    ap(card, tx('strong', 'bkbg-ed-highlight-title', h.title));
                    if (h.description) {
                        var desc = mk('p', 'bkbg-ed-highlight-desc', { color: a.summaryColor || '#374151' });
                        desc.textContent = h.description;
                        ap(card, desc);
                    }
                    ap(hlSection, card);
                });
                ap(body, hlSection);
            }

            // Quotes
            if (a.showQuotes && a.quotes && a.quotes.length) {
                var qSection = mk('div', 'bkbg-ed-quotes-section');
                ap(qSection, sectionHead(a.quotesLabel || 'Attendee Voices', a));
                a.quotes.forEach(function (q) {
                    var fig = mk('figure', 'bkbg-ed-quote', { background: a.quoteBg || '#f5f3ff', borderLeftColor: a.quoteBorder || '#818cf8' });
                    var bq = mk('blockquote', '', { color: a.quoteColor || '#4338ca', margin: '0 0 6px', fontStyle: 'italic' });
                    bq.textContent = '\u201c' + q.quote + '\u201d';
                    var fc = tx('figcaption', '', '— ' + q.speaker + (q.role ? ', ' + q.role : ''), { color: a.quoteColor || '#4338ca', fontSize: '12px', fontWeight: '700' });
                    ap(fig, bq, fc);
                    ap(qSection, fig);
                });
                ap(body, qSection);
            }

            // Outcomes
            if (a.showOutcomes && a.outcomes && a.outcomes.length) {
                var outSection = mk('div', 'bkbg-ed-outcomes-section');
                ap(outSection, sectionHead(a.outcomesLabel || 'Key Outcomes', a));
                var ul = mk('ul', 'bkbg-ed-list', { color: a.outcomeColor || '#166534' });
                a.outcomes.forEach(function (o) { ap(ul, tx('li', '', o)); });
                ap(outSection, ul);
                ap(body, outSection);
            }

            // Lessons
            if (a.showLessons && a.lessonsLearned && a.lessonsLearned.length) {
                var lsSection = mk('div', 'bkbg-ed-lessons-section');
                ap(lsSection, sectionHead(a.lessonsLabel || 'Lessons Learned', a));
                var ll = mk('ul', 'bkbg-ed-list', { color: a.lessonColor || '#92400e' });
                a.lessonsLearned.forEach(function (l) { ap(ll, tx('li', '', l)); });
                ap(lsSection, ll);
                ap(body, lsSection);
            }

            // Next Event
            if (a.showNextEvent && a.nextEventName) {
                var nextBox = mk('div', 'bkbg-ed-next', { background: a.nextEventBg || '#1e1b4b' });
                var nextLeft = mk('div');
                ap(nextLeft, tx('div', 'bkbg-ed-next-label', 'UP NEXT', { color: a.nextEventColor || '#fff' }));
                ap(nextLeft, tx('div', 'bkbg-ed-next-name', a.nextEventName, { color: a.nextEventColor || '#fff' }));
                if (a.nextEventDate) ap(nextLeft, tx('div', 'bkbg-ed-next-date', '📅 ' + a.nextEventDate, { color: a.nextEventColor || '#fff' }));
                var nextBtn = mk('a', 'bkbg-ed-next-btn');
                nextBtn.textContent = 'Learn More →';
                nextBtn.href = a.nextEventUrl || '#';
                nextBtn.style.background = a.accentColor || '#6366f1';
                nextBtn.style.color = '#fff';
                ap(nextBox, nextLeft, nextBtn);
                ap(body, nextBox);
            }

            ap(wrap, body);
            appEl.appendChild(wrap);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
