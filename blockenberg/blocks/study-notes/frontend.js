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

    var _typoKeys = {
        family: 'font-family', sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t',
        sizeMobile: 'font-size-m', lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t',
        lineHeightMobile: 'line-height-m', letterSpacingDesktop: 'letter-spacing-d',
        letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m',
        wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t',
        wordSpacingMobile: 'word-spacing-m', weight: 'font-weight', style: 'font-style',
        decoration: 'text-decoration', transform: 'text-transform'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(obj).forEach(function (k) {
            var css = _typoKeys[k]; if (!css) return;
            var v = obj[k]; if (v === '' || v === undefined || v === null) return;
            el.style.setProperty(prefix + css, String(v));
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-study-notes-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                subject: 'Subject',
                topic: 'Topic',
                source: '',
                noteDate: '',
                showSubject: true,
                showSource: true,
                showDate: true,
                layout: 'cornell',
                cueWidth: 30,
                notes: [],
                summary: '',
                showSummary: true,
                summaryLabel: 'Summary',
                keyTerms: [],
                showKeyTerms: true,
                keyTermsLabel: 'Key Terms',
                tags: [],
                showTags: true,
                fontSize: 14,
                titleFontSize: 20,
                lineHeight: 170,
                borderRadius: 10,
                bgColor: '#ffffff',
                borderColor: '#d1d5db',
                headerBg: '#1e3a5f',
                headerColor: '#ffffff',
                cueBg: '#f8fafc',
                cueColor: '#1e40af',
                cueBorderColor: '#e2e8f0',
                notesBg: '#ffffff',
                notesColor: '#374151',
                rowBorderColor: '#e5e7eb',
                summaryBg: '#fefce8',
                summaryColor: '#1c1917',
                summaryBorderColor: '#fde68a',
                keyTermsBg: '#f0f9ff',
                keyTermsColor: '#0f172a',
                keyTermsBorderColor: '#bae6fd',
                termColor: '#0369a1',
                tagBg: '#e0e7ff',
                tagColor: '#3730a3',
                accentColor: '#3b82f6'
            }, opts);

            var br = (o.borderRadius || 10) + 'px';
            var fs = (o.fontSize || 14) + 'px';
            var lh = ((o.lineHeight || 170) / 100).toFixed(2);

            var block = mk('div', 'bkbg-sn-block', {
                background: o.bgColor,
                border: '1px solid ' + o.borderColor,
                borderRadius: br,
                overflow: 'hidden'
            });
            block.style.setProperty('--bkbg-sn-row-border',  o.rowBorderColor  || '#e5e7eb');
            block.style.setProperty('--bkbg-sn-cue-border',  o.cueBorderColor  || '#e2e8f0');
            block.style.setProperty('--bkbg-sn-lh',          lh);
            typoCssVarsForEl(block, o.titleTypo, '--bksn-tt-');
            typoCssVarsForEl(block, o.textTypo,  '--bksn-tx-');

            // ── Header ─────────────────────────────────────────────
            var header = mk('div', 'bkbg-sn-header', {
                background: o.headerBg,
                color: o.headerColor,
                borderRadius: br.replace('px', '') === '0' ? '0' : (o.borderRadius) + 'px ' + (o.borderRadius) + 'px 0 0'
            });

            var topRow = mk('div', null, { display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '10px' });
            var topicEl = tx('h3', 'bkbg-sn-topic', o.topic, { margin: '0', color: o.headerColor });
            ap(topRow, topicEl);
            if (o.showSubject && o.subject) {
                ap(topRow, tx('span', 'bkbg-sn-subject-badge', o.subject));
            }

            var meta = mk('div', 'bkbg-sn-meta');
            if (o.showSource && o.source) ap(meta, tx('span', null, '📖 ' + o.source));
            if (o.showDate   && o.noteDate) ap(meta, tx('span', null, '📅 ' + o.noteDate));

            ap(header, topRow, meta);
            ap(block, header);

            // ── Column stripe (cornell only) ───────────────────────
            if (o.layout === 'cornell') {
                var stripe = mk('div', 'bkbg-sn-col-stripe', { background: o.accentColor });
                var cueS   = mk('div', 'bkbg-sn-col-stripe-cue', { width: (o.cueWidth || 30) + '%' });
                cueS.textContent = 'Cues / Questions';
                var notesS = mk('div', 'bkbg-sn-col-stripe-notes');
                notesS.textContent = 'Notes';
                ap(stripe, cueS, notesS);
                ap(block, stripe);
            }

            // ── Notes rows ────────────────────────────────────────
            var layoutClass = 'bkbg-sn-notes' +
                (o.layout === 'linear' ? ' is-linear' : '') +
                (o.layout === 'cards'  ? ' is-cards'  : '');
            var notesWrap = mk('div', layoutClass, { background: o.layout === 'cards' ? 'transparent' : o.notesBg, border: o.layout === 'cards' ? 'none' : '1px solid ' + o.borderColor, borderTop: 'none' });

            (o.notes || []).forEach(function (note) {
                var row = mk('div', 'bkbg-sn-row');
                var cueDiv = mk('div', 'bkbg-sn-cue', { width: (o.cueWidth || 30) + '%', background: o.cueBg, color: o.cueColor });
                cueDiv.textContent = note.cue || '';

                var noteDiv = mk('div', 'bkbg-sn-note-text', { color: o.notesColor, background: o.notesBg });
                noteDiv.textContent = note.content || '';

                ap(row, cueDiv, noteDiv);
                ap(notesWrap, row);
            });

            ap(block, notesWrap);

            // ── Summary ────────────────────────────────────────────
            if (o.showSummary && o.summary) {
                var sumSec = mk('div', 'bkbg-sn-summary-section', {
                    background: o.summaryBg,
                    color: o.summaryColor,
                    borderColor: o.summaryBorderColor,
                    margin: '14px 14px 0'
                });
                ap(sumSec,
                    tx('span', 'bkbg-sn-section-label', o.summaryLabel || 'Summary', { color: o.summaryColor }),
                    tx('p', 'bkbg-sn-summary-text', o.summary)
                );
                ap(block, sumSec);
            }

            // ── Key Terms ─────────────────────────────────────────
            if (o.showKeyTerms && o.keyTerms && o.keyTerms.length) {
                var termSec = mk('div', 'bkbg-sn-terms-section', {
                    background: o.keyTermsBg,
                    color: o.keyTermsColor,
                    borderColor: o.keyTermsBorderColor,
                    margin: '12px 14px 0'
                });
                ap(termSec, tx('span', 'bkbg-sn-section-label', o.keyTermsLabel || 'Key Terms', { color: o.keyTermsColor }));

                var ul = mk('ul', 'bkbg-sn-terms-list');
                o.keyTerms.forEach(function (t) {
                    var li = mk('li', 'bkbg-sn-term-item');
                    ap(li,
                        tx('span', 'bkbg-sn-term-word', t.term, { color: o.termColor }),
                        tx('span', 'bkbg-sn-term-def',  t.definition, { color: o.keyTermsColor })
                    );
                    ap(ul, li);
                });
                ap(termSec, ul);
                ap(block, termSec);
            }

            // ── Tags ──────────────────────────────────────────────
            if (o.showTags && o.tags && o.tags.length) {
                var tagsWrap = mk('div', 'bkbg-sn-tags', { padding: '0 14px 14px', marginTop: '12px' });
                o.tags.forEach(function (tag) {
                    if (!tag) return;
                    ap(tagsWrap, tx('span', 'bkbg-sn-tag', tag, { background: o.tagBg, color: o.tagColor }));
                });
                ap(block, tagsWrap);
            } else {
                block.style.paddingBottom = '4px';
            }

            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
