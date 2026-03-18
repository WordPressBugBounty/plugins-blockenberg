(function () {
    'use strict';

    var _typoKeys = [['family','font-family'],['weight','font-weight'],['style','font-style'],['decoration','text-decoration'],['transform','text-transform']];
    var _sizeKeys = [['Desktop','d'],['Tablet','t'],['Mobile','m']];
    var _lhKeys   = [['Desktop','d'],['Tablet','t'],['Mobile','m']];
    var _lsKeys   = [['Desktop','d'],['Tablet','t'],['Mobile','m']];
    var _wsKeys   = [['Desktop','d'],['Tablet','t'],['Mobile','m']];

    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        _typoKeys.forEach(function (p) { if (obj[p[0]]) el.style.setProperty(prefix + '-' + p[1], obj[p[0]]); });
        var u = obj.sizeUnit || 'px';
        _sizeKeys.forEach(function (p) { var v = obj['size' + p[0]]; if (v !== undefined && v !== '') el.style.setProperty(prefix + '-font-size-' + p[1], v + u); });
        _lhKeys.forEach(function (p) { var v = obj['lineHeight' + p[0]]; if (v !== undefined && v !== '') el.style.setProperty(prefix + '-line-height-' + p[1], String(v)); });
        _lsKeys.forEach(function (p) { var v = obj['letterSpacing' + p[0]]; if (v !== undefined && v !== '') el.style.setProperty(prefix + '-letter-spacing-' + p[1], v + 'px'); });
        _wsKeys.forEach(function (p) { var v = obj['wordSpacing' + p[0]]; if (v !== undefined && v !== '') el.style.setProperty(prefix + '-word-spacing-' + p[1], v + 'px'); });
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

    var moodEmoji  = { great: '🚀', good: '😊', okay: '😐', tough: '😓' };
    var moodLabel  = { great: 'Great', good: 'Good', okay: 'Okay', tough: 'Tough' };
    var moodStyles = {
        great: { bg: '#dcfce7', color: '#14532d' },
        good:  { bg: '#dbeafe', color: '#1e40af' },
        okay:  { bg: '#fef9c3', color: '#713f12' },
        tough: { bg: '#fee2e2', color: '#991b1b' }
    };

    function prioBadge(p, a) {
        if (p === 'high')   return { label: '🔴 High', bg: a.highBg, color: a.highColor };
        if (p === 'medium') return { label: '🟡 Med',  bg: a.medBg,  color: a.medColor  };
        return                     { label: '🟢 Low',  bg: a.lowBg,  color: a.lowColor  };
    }

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a = Object.assign({
            sprintNumber: 'Sprint', sprintGoal: '', startDate: '', endDate: '',
            velocityPlanned: 40, velocityActual: 34, showVelocity: true,
            mood: 'good', showMood: true,
            teamMembers: [], showTeam: true,
            wentWell: [], wentWellLabel: '✅ Went Well',
            toImprove: [], toImproveLabel: '🔧 To Improve',
            actionItems: [], actionItemsLabel: '⚡ Action Items',
            fontSize: 14, titleFontSize: 22, lineHeight: 168, borderRadius: 12,
            bgColor: '#ffffff', borderColor: '#e5e7eb',
            headerBg: '#1e293b', headerColor: '#f8fafc',
            accentColor: '#6366f1', metaColor: '#94a3b8',
            velocityFillColor: '#6366f1', velocityBgColor: '#e2e8f0',
            wellBg: '#f0fdf4', wellBorder: '#16a34a', wellColor: '#166534', wellHeadBg: '#dcfce7',
            improveBg: '#fffbeb', improveBorder: '#d97706', improveColor: '#78350f', improveHeadBg: '#fef3c7',
            actionBg: '#f5f3ff', actionBorder: '#7c3aed', actionColor: '#4c1d95', actionHeadBg: '#ede9fe',
            highBg: '#fee2e2', highColor: '#991b1b',
            medBg: '#fef3c7',  medColor: '#78350f',
            lowBg: '#dcfce7',  lowColor: '#14532d',
            teamBg: '#f1f5f9', teamColor: '#334155'
        }, JSON.parse(appEl.dataset.opts || '{}'));

        var lh = (a.lineHeight / 100).toFixed(2);
        var velPct = a.velocityPlanned > 0 ? Math.min(100, Math.round((a.velocityActual / a.velocityPlanned) * 100)) : 0;
        var ms = moodStyles[a.mood] || moodStyles.good;

        var wrap = mk('div', 'bkbg-spr-wrap');
        wrap.style.border = '1px solid ' + a.borderColor;
        wrap.style.borderRadius = a.borderRadius + 'px';
        wrap.style.overflow = 'hidden';
        wrap.style.background = a.bgColor;

        /* Legacy + typo CSS vars */
        wrap.style.setProperty('--bkspr-tt-sz', (a.titleFontSize || 22) + 'px');
        wrap.style.setProperty('--bkspr-bd-sz', (a.fontSize || 14) + 'px');
        wrap.style.setProperty('--bkspr-bd-w', String(a.fontWeight || '400'));
        wrap.style.setProperty('--bkspr-bd-lh', lh);
        typoCssVarsForEl(wrap, a.titleTypo, '--bkspr-tt');
        typoCssVarsForEl(wrap, a.bodyTypo, '--bkspr-bd');

        // ---- Header ----
        var header = mk('div', 'bkbg-spr-header');
        header.style.background = a.headerBg;

        var headerTop = mk('div', 'bkbg-spr-header-top');

        // Left: title, goal, dates
        var hLeft = mk('div');
        var titleEl = tx('h2', 'bkbg-spr-title', a.sprintNumber);
        titleEl.style.color = a.headerColor;
        ap(hLeft, titleEl);
        if (a.sprintGoal) {
            var goalEl = tx('div', 'bkbg-spr-goal', '🎯 ' + a.sprintGoal);
            goalEl.style.color = a.metaColor;
            ap(hLeft, goalEl);
        }
        if (a.startDate || a.endDate) {
            var datesText = [a.startDate, a.endDate].filter(Boolean).join(' → ');
            var datesEl = tx('div', 'bkbg-spr-dates', datesText);
            datesEl.style.color = a.metaColor;
            ap(hLeft, datesEl);
        }
        ap(headerTop, hLeft);

        // Right: mood badge
        if (a.showMood) {
            var moodEl = mk('div', 'bkbg-spr-mood');
            moodEl.style.background = ms.bg;
            moodEl.style.color = ms.color;
            var moodEmojiEl = tx('div', 'bkbg-spr-mood-emoji', moodEmoji[a.mood] || '😊');
            var moodTextEl = tx('div', '', 'Team Mood: ' + (moodLabel[a.mood] || a.mood));
            ap(moodEl, moodEmojiEl, moodTextEl);
            ap(headerTop, moodEl);
        }
        ap(header, headerTop);

        // Velocity bar
        if (a.showVelocity) {
            var velWrap = mk('div', 'bkbg-spr-velocity');
            var velLabel = mk('div', 'bkbg-spr-vel-label');
            var velLeft = tx('span', '', 'Velocity: ' + a.velocityActual + ' / ' + a.velocityPlanned + ' pts');
            velLeft.style.color = a.metaColor;
            var velRight = tx('span', '', velPct + '%');
            velRight.style.color = a.metaColor;
            ap(velLabel, velLeft, velRight);

            var velTrack = mk('div', 'bkbg-spr-vel-track');
            velTrack.style.background = a.velocityBgColor;
            var velFill = mk('div', 'bkbg-spr-vel-fill');
            velFill.style.width = velPct + '%';
            velFill.style.background = a.velocityFillColor;
            ap(velTrack, velFill);
            ap(velWrap, velLabel, velTrack);
            ap(header, velWrap);
        }
        ap(wrap, header);

        // ---- 3-column board ----
        var board = mk('div', 'bkbg-spr-board');
        board.style.borderTop = '1px solid ' + a.borderColor;

        // Helper to make a column
        function makeCol(label, headBg, borderColor, bodyBg, content) {
            var col = mk('div', 'bkbg-spr-col');
            col.style.borderColor = a.borderColor;

            var head = tx('div', 'bkbg-spr-col-head', label);
            head.style.background = headBg;
            head.style.borderBottomColor = borderColor;
            ap(col, head, content);
            return col;
        }

        // Went Well
        var wwList = mk('ul', 'bkbg-spr-col-list');
        wwList.style.background = a.wellBg;
        wwList.style.color = a.wellColor;
        a.wentWell.forEach(function (w) {
            var li = tx('li', '', w);
            li.style.lineHeight = lh;
            ap(wwList, li);
        });
        ap(board, makeCol(a.wentWellLabel, a.wellHeadBg, a.wellBorder, a.wellBg, wwList));

        // To Improve
        var tiList = mk('ul', 'bkbg-spr-col-list');
        tiList.style.background = a.improveBg;
        tiList.style.color = a.improveColor;
        a.toImprove.forEach(function (t) {
            var li = tx('li', '', t);
            li.style.lineHeight = lh;
            ap(tiList, li);
        });
        ap(board, makeCol(a.toImproveLabel, a.improveHeadBg, a.improveBorder, a.improveBg, tiList));

        // Action Items
        var actBody = mk('div', 'bkbg-spr-col-body');
        actBody.style.background = a.actionBg;
        a.actionItems.forEach(function (act, i) {
            var pb = prioBadge(act.priority, a);
            var card = mk('div', 'bkbg-spr-action');
            if (i < a.actionItems.length - 1) {
                card.style.borderBottom = '1px dashed ' + a.borderColor;
            }
            var badge = tx('span', 'bkbg-spr-prio-badge', pb.label);
            badge.style.background = pb.bg;
            badge.style.color = pb.color;

            var taskEl = tx('div', 'bkbg-spr-action-task', act.task);
            taskEl.style.color = a.actionColor;
            taskEl.style.fontSize = a.fontSize + 'px';
            taskEl.style.lineHeight = lh;

            ap(card, badge, taskEl);
            if (act.owner) {
                var ownerEl = tx('div', 'bkbg-spr-action-owner', '→ ' + act.owner);
                ownerEl.style.color = a.metaColor;
                ap(card, ownerEl);
            }
            ap(actBody, card);
        });
        ap(board, makeCol(a.actionItemsLabel, a.actionHeadBg, a.actionBorder, a.actionBg, actBody));

        ap(wrap, board);

        // ---- Team footer ----
        if (a.showTeam && a.teamMembers.length > 0) {
            var footer = mk('div', 'bkbg-spr-footer');
            footer.style.borderTop = '1px solid ' + a.borderColor;
            var footLabel = tx('span', 'bkbg-spr-footer-label', 'Team:');
            footLabel.style.color = a.metaColor;
            ap(footer, footLabel);
            a.teamMembers.forEach(function (m) {
                var pill = tx('span', 'bkbg-spr-member', m);
                pill.style.background = a.teamBg;
                pill.style.color = a.teamColor;
                ap(footer, pill);
            });
            ap(wrap, footer);
        }

        appEl.innerHTML = '';
        appEl.appendChild(wrap);
    }

    function init() {
        document.querySelectorAll('.bkbg-sprint-retrospective-app').forEach(buildBlock);
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
