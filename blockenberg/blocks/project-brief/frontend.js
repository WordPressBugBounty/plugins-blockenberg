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

    function statusInfo(s) {
        var map = {
            'planning': { label: '📋 Planning',  bg: '#dbeafe', color: '#1e3a8a' },
            'active':   { label: '🚀 Active',    bg: '#dcfce7', color: '#14532d' },
            'review':   { label: '🔍 In Review', bg: '#fef9c3', color: '#713f12' },
            'complete': { label: '✅ Complete',  bg: '#e0e7ff', color: '#3730a3' },
            'on-hold':  { label: '⏸ On Hold',   bg: '#fee2e2', color: '#991b1b' }
        };
        return map[s] || map['planning'];
    }

    function riskColor(level) {
        if (level === 'high')   return { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' };
        if (level === 'medium') return { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' };
        return                         { bg: '#f0fdf4', color: '#14532d', dot: '#22c55e' };
    }

    function sectionHead(label, accentColor) {
        var h = tx('div', 'bkbg-pb-section-head', label);
        h.style.color = accentColor;
        h.style.borderBottomColor = accentColor;
        return h;
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

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a = Object.assign({
            projectName: '', projectType: '', status: 'active',
            client: '', owner: '', startDate: '', endDate: '',
            showDates: true, overview: '',
            goals: [], deliverables: [], stakeholders: [], risks: [],
            budget: '', showBudget: true, notes: '', showNotes: false,
            fontSize: 14, titleFontSize: 24, lineHeight: 168,
            titleTypo: {}, bodyTypo: {},
            borderRadius: 12,
            bgColor: '#ffffff', borderColor: '#e5e7eb', headerBg: '#0f172a',
            headerColor: '#ffffff', metaColor: '#94a3b8',
            sectionTitleColor: '#111827', bodyTextColor: '#374151',
            goalDotColor: '#3b82f6', delivDotColor: '#10b981',
            sectionBg: '#f8fafc', accentColor: '#3b82f6'
        }, JSON.parse(appEl.dataset.opts || '{}'));

        var si = statusInfo(a.status);

        var wrap = mk('div', 'bkbg-pb-wrap');
        wrap.style.border = '1px solid ' + a.borderColor;
        wrap.style.borderRadius = a.borderRadius + 'px';
        wrap.style.overflow = 'hidden';
        wrap.style.background = a.bgColor;
        typoCssVarsForEl(wrap, a.titleTypo, '--bkbg-pjb-tt-');
        typoCssVarsForEl(wrap, a.bodyTypo, '--bkbg-pjb-bd-');

        // ---- Header ----
        var header = mk('div', 'bkbg-pb-header');
        header.style.background = a.headerBg;

        var topRow = mk('div', 'bkbg-pb-header-top');
        var titleWrap = mk('div');
        var titleEl = tx('h2', 'bkbg-pb-title', a.projectName);
        titleEl.style.color = a.headerColor;
        var typeEl = tx('div', 'bkbg-pb-type', a.projectType);
        typeEl.style.color = a.metaColor;
        ap(titleWrap, titleEl, typeEl);

        var statusEl = tx('span', 'bkbg-pb-status', si.label);
        statusEl.style.background = si.bg;
        statusEl.style.color = si.color;
        ap(topRow, titleWrap, statusEl);

        var metaRow = mk('div', 'bkbg-pb-meta');
        var metaItems = [];
        if (a.owner) metaItems.push('👤 Owner: ' + a.owner);
        if (a.client) metaItems.push('🏢 Client: ' + a.client);
        if (a.showDates && a.startDate && a.endDate) metaItems.push('📅 ' + a.startDate + ' → ' + a.endDate);
        if (a.showBudget && a.budget) metaItems.push('💰 ' + a.budget);
        metaItems.forEach(function (m) {
            var s = tx('span', 'bkbg-pb-meta-item', m);
            s.style.color = a.metaColor;
            ap(metaRow, s);
        });

        ap(header, topRow, metaRow);
        ap(wrap, header);

        // ---- Body ----
        var body = mk('div', 'bkbg-pb-body');

        // Overview
        if (a.overview) {
            var ovSec = mk('div');
            ap(ovSec, sectionHead('Project Overview', a.accentColor));
            var ovText = tx('p', 'bkbg-pb-overview', a.overview);
            ovText.style.color = a.bodyTextColor;
            ap(ovSec, ovText);
            ap(body, ovSec);
        }

        // Goals + Deliverables
        function makeList(items, dotText, dotColor) {
            var ul = mk('ul', 'bkbg-pb-list');
            items.forEach(function (item) {
                var li = mk('li', 'bkbg-pb-list-item');
                var dot = tx('span', 'bkbg-pb-list-dot', dotText);
                dot.style.color = dotColor;
                var text = tx('span', '', item);
                text.style.color = a.bodyTextColor;
                ap(li, dot, text);
                ap(ul, li);
            });
            return ul;
        }

        if (a.goals.length > 0 || a.deliverables.length > 0) {
            var twoCol = mk('div', 'bkbg-pb-two-col');

            if (a.goals.length > 0) {
                var goalsCard = mk('div', 'bkbg-pb-card');
                goalsCard.style.background = a.sectionBg;
                ap(goalsCard, sectionHead('Goals', a.accentColor), makeList(a.goals, '✓', a.goalDotColor));
                ap(twoCol, goalsCard);
            }
            if (a.deliverables.length > 0) {
                var delivCard = mk('div', 'bkbg-pb-card');
                delivCard.style.background = a.sectionBg;
                ap(delivCard, sectionHead('Deliverables', a.accentColor), makeList(a.deliverables, '→', a.delivDotColor));
                ap(twoCol, delivCard);
            }
            ap(body, twoCol);
        }

        // Stakeholders
        if (a.stakeholders.length > 0) {
            var stSec = mk('div');
            ap(stSec, sectionHead('Stakeholders', a.accentColor));
            var stGrid = mk('div', 'bkbg-pb-stakeholders');
            a.stakeholders.forEach(function (s) {
                var card = mk('div', 'bkbg-pb-stakeholder');
                card.style.background = a.sectionBg;
                card.style.borderLeftColor = a.accentColor;
                var nameEl = tx('div', 'bkbg-pb-sh-name', s.name);
                nameEl.style.color = a.sectionTitleColor;
                var roleEl = tx('div', 'bkbg-pb-sh-role', s.role);
                roleEl.style.color = a.bodyTextColor;
                ap(card, nameEl, roleEl);
                ap(stGrid, card);
            });
            ap(stSec, stGrid);
            ap(body, stSec);
        }

        // Risks
        if (a.risks.length > 0) {
            var rkSec = mk('div');
            ap(rkSec, sectionHead('Risks', a.accentColor));
            var rkList = mk('div', 'bkbg-pb-risks');
            a.risks.forEach(function (r) {
                var lc = riskColor(r.likelihood);
                var ic = riskColor(r.impact);
                var row = mk('div', 'bkbg-pb-risk-row');
                row.style.background = a.sectionBg;
                row.style.borderLeftColor = lc.dot;

                var rText = tx('span', 'bkbg-pb-risk-text', r.risk);
                rText.style.color = a.bodyTextColor;

                var lBadge = tx('span', 'bkbg-pb-risk-badge', 'L: ' + r.likelihood);
                lBadge.style.background = lc.bg;
                lBadge.style.color = lc.color;

                var iBadge = tx('span', 'bkbg-pb-risk-badge', 'I: ' + r.impact);
                iBadge.style.background = ic.bg;
                iBadge.style.color = ic.color;

                ap(row, rText, lBadge, iBadge);
                ap(rkList, row);
            });
            ap(rkSec, rkList);
            ap(body, rkSec);
        }

        // Notes
        if (a.showNotes && a.notes) {
            var noteSec = mk('div');
            ap(noteSec, sectionHead('Additional Notes', a.accentColor));
            var noteText = tx('p', 'bkbg-pb-notes', a.notes);
            noteText.style.color = a.bodyTextColor;
            ap(noteSec, noteText);
            ap(body, noteSec);
        }

        ap(wrap, body);
        appEl.innerHTML = '';
        appEl.appendChild(wrap);
    }

    function init() {
        document.querySelectorAll('.bkbg-project-brief-app').forEach(buildBlock);
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
