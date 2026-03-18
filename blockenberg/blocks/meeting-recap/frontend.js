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

    function statusInfo(status, o) {
        if (status === 'in-progress') return { label: 'In Progress', bg: o.taskInProgressBg, color: o.taskInProgressColor };
        if (status === 'done')        return { label: '✓ Done',      bg: o.taskDoneBg,        color: o.taskDoneColor        };
        return                               { label: 'Open',         bg: o.taskOpenBg,        color: o.taskOpenColor        };
    }

    var _typoKeys = { family:'font-family', weight:'font-weight', style:'font-style', decoration:'text-decoration', transform:'text-transform', sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m', lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m', letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m', wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
    function typoCssVarsForEl(el, typo, prefix) {
        if (!typo || typeof typo !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') el.style.setProperty(prefix + _typoKeys[k], typo[k]);
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-meeting-recap-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                meetingTitle: 'Meeting Recap',
                meetingDate: '',
                meetingTime: '',
                location: '',
                facilitator: '',
                showMeta: true,
                attendees: [],
                showAttendees: true,
                attendeesLabel: 'Attendees',
                agendaItems: [],
                showAgenda: true,
                agendaLabel: 'Agenda',
                decisions: [],
                showDecisions: true,
                decisionsLabel: 'Decisions Made',
                actionItems: [],
                showActionItems: true,
                actionItemsLabel: 'Action Items',
                nextMeetingDate: '',
                showNextMeeting: true,
                nextMeetingLabel: 'Next Meeting',
                notes: '',
                showNotes: true,
                notesLabel: 'Additional Notes',
                fontSize: 14,
                titleFontSize: 22,
                lineHeight: 165,
                borderRadius: 10,
                bgColor: '#ffffff',
                borderColor: '#e2e8f0',
                headerBg: '#0f172a',
                headerColor: '#ffffff',
                sectionLabelColor: '#0f172a',
                textColor: '#374151',
                sectionBorderColor: '#e5e7eb',
                attendeePresentBg: '#dcfce7',
                attendeePresentColor: '#14532d',
                attendeeAbsentBg: '#f1f5f9',
                attendeeAbsentColor: '#64748b',
                decisionIconColor: '#16a34a',
                taskOpenBg: '#eff6ff',
                taskOpenColor: '#1d4ed8',
                taskInProgressBg: '#fef9c3',
                taskInProgressColor: '#854d0e',
                taskDoneBg: '#dcfce7',
                taskDoneColor: '#14532d',
                nextMeetingBg: '#f0f9ff',
                nextMeetingColor: '#0369a1',
                accentColor: '#3b82f6'
            }, opts);

            var br = (o.borderRadius || 10) + 'px';
            var fs = (o.fontSize || 14) + 'px';
            var lh = ((o.lineHeight || 165) / 100).toFixed(2);

            var block = mk('div', 'bkbg-mr-block', {
                border: '1px solid ' + o.borderColor,
                borderRadius: br,
                overflow: 'hidden'
            });

            typoCssVarsForEl(block, o.titleTypo, '--bkbg-mr-tt-');
            typoCssVarsForEl(block, o.bodyTypo, '--bkbg-mr-bd-');
            typoCssVarsForEl(block, o.sectionLabelTypo, '--bkbg-mr-sl-');

            // ── Header ─────────────────────────────────────────────
            var header = mk('div', 'bkbg-mr-header', {
                background: o.headerBg,
                color: o.headerColor,
                borderRadius: (o.borderRadius || 10) + 'px ' + (o.borderRadius || 10) + 'px 0 0'
            });
            ap(header, tx('div', 'bkbg-mr-kicker', '📋 MEETING RECAP'));
            ap(header, tx('h2', 'bkbg-mr-title', o.meetingTitle, { color: o.headerColor }));

            if (o.showMeta) {
                var meta = mk('div', 'bkbg-mr-meta');
                if (o.meetingDate) ap(meta, tx('span', null, '📅 ' + o.meetingDate));
                if (o.meetingTime) ap(meta, tx('span', null, '⏰ ' + o.meetingTime));
                if (o.location)    ap(meta, tx('span', null, '📍 ' + o.location));
                if (o.facilitator) ap(meta, tx('span', null, '👤 ' + o.facilitator));
                ap(header, meta);
            }
            ap(block, header);

            // ── Body ───────────────────────────────────────────────
            var body = mk('div', 'bkbg-mr-body', { background: o.bgColor, color: o.textColor });

            function sectionHead(label) {
                return tx('span', 'bkbg-mr-section-head', label, { color: o.accentColor, borderBottomColor: o.accentColor });
            }

            // Attendees
            if (o.showAttendees && o.attendees && o.attendees.length) {
                var attSec = mk('div', 'bkbg-mr-section');
                ap(attSec, sectionHead(o.attendeesLabel || 'Attendees'));
                var attWrap = mk('div', 'bkbg-mr-attendees');
                o.attendees.forEach(function (att) {
                    var pill = mk('div', 'bkbg-mr-attendee', {
                        background: att.present ? o.attendeePresentBg  : o.attendeeAbsentBg,
                        color:      att.present ? o.attendeePresentColor: o.attendeeAbsentColor
                    });

                    var nameSp = document.createElement('strong');
                    nameSp.textContent = att.name || '';
                    ap(pill, nameSp);

                    if (att.role) {
                        ap(pill, tx('span', 'bkbg-mr-attendee-role', ' · ' + att.role));
                    }
                    if (!att.present) {
                        ap(pill, tx('span', 'bkbg-mr-attendee-absent', '(absent)'));
                    }
                    ap(attWrap, pill);
                });
                ap(attSec, attWrap);
                ap(body, attSec);
            }

            // Agenda
            if (o.showAgenda && o.agendaItems && o.agendaItems.length) {
                var agSec = mk('div', 'bkbg-mr-section');
                ap(agSec, sectionHead(o.agendaLabel || 'Agenda'));
                var agOl = mk('ol', 'bkbg-mr-agenda-list');
                o.agendaItems.forEach(function (ag) {
                    var li = document.createElement('li');
                    li.appendChild(document.createTextNode(ag.item || ''));
                    if (ag.duration) {
                        ap(li, tx('span', 'bkbg-mr-agenda-duration', '— ' + ag.duration));
                    }
                    ap(agOl, li);
                });
                ap(agSec, agOl);
                ap(body, agSec);
            }

            // Decisions
            if (o.showDecisions && o.decisions && o.decisions.length) {
                var decSec = mk('div', 'bkbg-mr-section');
                ap(decSec, sectionHead(o.decisionsLabel || 'Decisions Made'));
                var decUl = mk('ul', 'bkbg-mr-decisions-list');
                o.decisions.forEach(function (d) {
                    var li = mk('li', 'bkbg-mr-decision-item');
                    ap(li,
                        tx('span', 'bkbg-mr-decision-icon', '✓', { color: o.decisionIconColor }),
                        tx('span', null, d)
                    );
                    ap(decUl, li);
                });
                ap(decSec, decUl);
                ap(body, decSec);
            }

            // Action Items
            if (o.showActionItems && o.actionItems && o.actionItems.length) {
                var aiSec = mk('div', 'bkbg-mr-section');
                ap(aiSec, sectionHead(o.actionItemsLabel || 'Action Items'));
                o.actionItems.forEach(function (ai) {
                    var si  = statusInfo(ai.status || 'open', o);
                    var row = mk('div', 'bkbg-mr-action-item', { borderLeftColor: o.accentColor });
                    ap(row, tx('span', 'bkbg-mr-action-status', si.label, { background: si.bg, color: si.color }));
                    ap(row, tx('span', 'bkbg-mr-action-task', ai.task || ''));
                    if (ai.owner || ai.due) {
                        var meta = mk('div', 'bkbg-mr-action-meta');
                        if (ai.owner) ap(meta, tx('span', null, '👤 ' + ai.owner));
                        if (ai.due)   ap(meta, tx('span', null, '📅 ' + ai.due));
                        ap(row, meta);
                    }
                    ap(aiSec, row);
                });
                ap(body, aiSec);
            }

            // Next Meeting
            if (o.showNextMeeting && o.nextMeetingDate) {
                var nm = mk('div', 'bkbg-mr-next-meeting', { background: o.nextMeetingBg, color: o.nextMeetingColor });
                ap(nm,
                    tx('span', 'bkbg-mr-next-label', (o.nextMeetingLabel || 'Next Meeting') + ':'),
                    tx('span', null, '📅 ' + o.nextMeetingDate)
                );
                ap(body, nm);
            }

            // Notes
            if (o.showNotes && o.notes) {
                var noteSec = mk('div', 'bkbg-mr-section');
                ap(noteSec, sectionHead(o.notesLabel || 'Additional Notes'));
                ap(noteSec, tx('p', 'bkbg-mr-notes-text', o.notes));
                ap(body, noteSec);
            }

            ap(block, body);
            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
