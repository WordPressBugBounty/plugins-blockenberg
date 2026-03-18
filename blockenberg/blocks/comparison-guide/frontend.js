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

    function winnerBadge(winner, nameA, nameB, a) {
        var label, bg, color;
        if (winner === 'tie') {
            label = '— Tie'; bg = a.tieBg; color = a.tieColor;
        } else {
            label = '🏆 ' + (winner === 'A' ? nameA : nameB);
            bg = a.winnerBadgeBg; color = a.winnerBadgeColor;
        }
        var s = mk('span', 'bkbg-cg-badge');
        s.textContent = label;
        s.style.background = bg;
        s.style.color = color;
        return s;
    }

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a = Object.assign({
            guideTitle: '', intro: '', showIntro: true,
            nameA: 'A', descA: '', emojiA: '🅰️', scoreA: 80, showScores: true,
            emojiAType: 'custom-char', emojiADashicon: '', emojiAImageUrl: '',
            nameB: 'B', descB: '', emojiB: '🅱️', scoreB: 80,
            emojiBType: 'custom-char', emojiBDashicon: '', emojiBImageUrl: '',
            criteria: [], showNotes: true, showCritScores: true,
            verdictWinner: 'A', verdictSummary: '', showVerdict: true,
            fontSize: 14, titleFontSize: 24, lineHeight: 170, borderRadius: 12,
            bgColor: '#ffffff', borderColor: '#e5e7eb', headerBg: '#f8fafc',
            titleColor: '#0f172a', introColor: '#374151',
            colABg: '#eff6ff', colAColor: '#1e3a8a',
            colBBg: '#f0fdf4', colBColor: '#14532d',
            winnerBadgeBg: '#fef9c3', winnerBadgeColor: '#713f12',
            tieBg: '#f1f5f9', tieColor: '#475569',
            notesColor: '#6b7280', rowAltBg: '#f8fafc',
            verdictBg: '#0f172a', verdictColor: '#ffffff',
            accentColor: '#3b82f6'
        }, JSON.parse(appEl.dataset.opts || '{}'));

        var wrap = mk('div', 'bkbg-cg-wrap');
        wrap.style.border = '1px solid ' + a.borderColor;
        wrap.style.borderRadius = a.borderRadius + 'px';
        wrap.style.overflow = 'hidden';
        wrap.style.background = a.bgColor;
        typoCssVarsForEl(wrap, a.typoTitle, '--bkcg-title-');
        typoCssVarsForEl(wrap, a.typoBody,  '--bkcg-body-');

        // ---- Header ----
        var header = mk('div', 'bkbg-cg-header');
        header.style.background = a.headerBg;
        header.style.borderBottom = '1px solid ' + a.borderColor;

        var title = tx('h2', 'bkbg-cg-title', a.guideTitle);
        title.style.color = a.titleColor;
        ap(header, title);

        if (a.showIntro && a.intro) {
            var intro = tx('p', 'bkbg-cg-intro', a.intro);
            intro.style.color = a.introColor;
            ap(header, intro);
        }
        ap(wrap, header);

        // ---- A vs B columns ----
        var cols = mk('div', 'bkbg-cg-cols');
        cols.style.borderBottom = '1px solid ' + a.borderColor;

        function makeItemCol(name, emoji, desc, score, bg, color, emojiType, emojiDashicon, emojiImageUrl, emojiDashiconColor) {
            var col = mk('div', 'bkbg-cg-item');
            col.style.background = bg;
            var eEl = mk('div', 'bkbg-cg-emoji');
            var IP = window.bkbgIconPicker;
            if (IP && emojiType && emojiType !== 'custom-char') {
                var iconNode = IP.buildFrontendIcon(emojiType, emoji, emojiDashicon, emojiImageUrl, emojiDashiconColor);
                if (iconNode) eEl.appendChild(iconNode);
                else eEl.textContent = emoji;
            } else {
                eEl.textContent = emoji;
            }
            var nEl = tx('div', 'bkbg-cg-item-name', name);
            nEl.style.color = color;
            var dEl = tx('div', 'bkbg-cg-item-desc', desc);
            dEl.style.color = color;
            ap(col, eEl, nEl, dEl);
            if (a.showScores) {
                var sNum = tx('div', 'bkbg-cg-score-num', score);
                sNum.style.color = color;
                var sLab = tx('div', 'bkbg-cg-score-label', 'Overall Score');
                sLab.style.color = color;
                ap(col, sNum, sLab);
            }
            return col;
        }

        var colA = makeItemCol(a.nameA, a.emojiA, a.descA, a.scoreA, a.colABg, a.colAColor, a.emojiAType, a.emojiADashicon, a.emojiAImageUrl, a.emojiADashiconColor);
        var vs = tx('div', 'bkbg-cg-vs', 'VS');
        var colB = makeItemCol(a.nameB, a.emojiB, a.descB, a.scoreB, a.colBBg, a.colBColor, a.emojiBType, a.emojiBDashicon, a.emojiBImageUrl, a.emojiBDashiconColor);
        ap(cols, colA, vs, colB);
        ap(wrap, cols);

        // ---- Table header ----
        var tblHead = mk('div', 'bkbg-cg-tbl-head');
        var thCells = ['Criterion', a.nameA, a.nameB, 'Winner'];
        thCells.forEach(function (label, i) {
            var cell = tx('div', 'bkbg-cg-tbl-head-cell' + (i > 0 ? ' center' : ''), label);
            ap(tblHead, cell);
        });
        ap(wrap, tblHead);

        // ---- Criteria rows ----
        a.criteria.forEach(function (crit, i) {
            var isAlt = i % 2 === 1;
            var rowBg = isAlt ? a.rowAltBg : a.bgColor;
            var bdrColor = a.borderColor;

            var row = mk('div', 'bkbg-cg-row');
            row.style.background = rowBg;
            row.style.borderTop = (i === 0 ? 'none' : '1px solid ' + bdrColor);

            // Criterion name
            var nameCell = tx('div', 'bkbg-cg-crit-name', crit.name);
            nameCell.style.color = a.titleColor;
            ap(row, nameCell);

            // Scores
            if (a.showCritScores) {
                var sA = tx('div', 'bkbg-cg-crit-score', crit.scoreA);
                sA.style.color = a.colAColor;
                var sB = tx('div', 'bkbg-cg-crit-score', crit.scoreB);
                sB.style.color = a.colBColor;
                ap(row, sA, sB);
            } else {
                ap(row, mk('div'), mk('div'));
            }

            // Winner badge
            var winnerCol = mk('div', 'bkbg-cg-winner-col');
            ap(winnerCol, winnerBadge(crit.winner, a.nameA, a.nameB, a));
            ap(row, winnerCol);
            ap(wrap, row);

            // Notes
            if (a.showNotes && crit.notes) {
                var notes = tx('div', 'bkbg-cg-notes', crit.notes);
                notes.style.background = rowBg;
                notes.style.color = a.notesColor;
                notes.style.borderTop = '1px dashed ' + bdrColor;
                ap(wrap, notes);
            }
        });

        // ---- Verdict ----
        if (a.showVerdict) {
            var verdict = mk('div', 'bkbg-cg-verdict');
            verdict.style.background = a.verdictBg;
            verdict.style.color = a.verdictColor;
            verdict.style.borderTop = '1px solid rgba(255,255,255,.08)';

            var eyebrow = tx('div', 'bkbg-cg-verdict-eyebrow', 'Verdict');
            var winnerRow = mk('div', 'bkbg-cg-verdict-winner');

            var vName, vEmoji;
            if (a.verdictWinner === 'A') { vName = a.nameA; vEmoji = a.emojiA; }
            else if (a.verdictWinner === 'B') { vName = a.nameB; vEmoji = a.emojiB; }
            else { vName = 'Tie'; vEmoji = '🤝'; }

            var vNameEl = tx('div', 'bkbg-cg-verdict-name', vName + ' wins');
            var vEmEl = mk('div', 'bkbg-cg-verdict-emoji');
            var vIP = window.bkbgIconPicker;
            var vEmojiType = a.verdictWinner === 'A' ? a.emojiAType : (a.verdictWinner === 'B' ? a.emojiBType : '');
            var vEmojiDash = a.verdictWinner === 'A' ? a.emojiADashicon : (a.verdictWinner === 'B' ? a.emojiBDashicon : '');
            var vEmojiImg  = a.verdictWinner === 'A' ? a.emojiAImageUrl : (a.verdictWinner === 'B' ? a.emojiBImageUrl : '');
            var vEmojiDashColor = a.verdictWinner === 'A' ? a.emojiADashiconColor : (a.verdictWinner === 'B' ? a.emojiBDashiconColor : '');
            if (vIP && vEmojiType && vEmojiType !== 'custom-char') {
                var vIconNode = vIP.buildFrontendIcon(vEmojiType, vEmoji, vEmojiDash, vEmojiImg, vEmojiDashColor);
                if (vIconNode) vEmEl.appendChild(vIconNode);
                else vEmEl.textContent = vEmoji;
            } else {
                vEmEl.textContent = vEmoji;
            }
            ap(winnerRow, vNameEl, vEmEl);
            ap(verdict, eyebrow, winnerRow);

            if (a.verdictSummary) {
                var vSum = tx('p', 'bkbg-cg-verdict-summary', a.verdictSummary);
                ap(verdict, vSum);
            }
            ap(wrap, verdict);
        }

        appEl.innerHTML = '';
        appEl.appendChild(wrap);
    }

    function init() {
        document.querySelectorAll('.bkbg-comparison-guide-app').forEach(buildBlock);
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
