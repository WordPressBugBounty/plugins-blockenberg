(function () {
    'use strict';

    var DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    function fmt(h, m, format) {
        m = m || 0;
        if (format === '24h') {
            return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2);
        }
        var ampm = h >= 12 ? 'PM' : 'AM';
        var h12 = h % 12 || 12;
        return h12 + (m ? ':' + ('0' + m).slice(-2) : '') + ' ' + ampm;
    }

    function applyCSS(el, styles) {
        Object.keys(styles).forEach(function (k) { el.style[k] = styles[k]; });
    }

    function makeEl(tag, className, styles) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (styles) applyCSS(el, styles);
        return el;
    }

    function init() {
        document.querySelectorAll('.bkbg-wscd-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                events: [],
                dayLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                startHour: 8,
                endHour: 20,
                cellHeight: 60,
                showTime: true,
                showInstructor: true,
                showLocation: false,
                showWeekend: true,
                timeFormat: '12h',
                title: 'Class Schedule',
                showTitle: true,
                bgColor: '#ffffff',
                headerBg: '#f8fafc',
                headerColor: '#1e293b',
                gridColor: '#f1f5f9',
                borderColor: '#e2e8f0',
                timeBg: '#f8fafc',
                timeColor: '#64748b',
                borderRadius: 8,
                eventRadius: 6,
                fontSize: 12
            }, opts);

            var numDays = o.showWeekend ? 7 : 5;
            var totalHours = o.endHour - o.startHour;
            var gridHeight = totalHours * o.cellHeight;

            // Outer wrap
            var wrap = makeEl('div', 'bkbg-wscd-wrap');
            wrap.style.setProperty('--bkbg-wscd-border', o.borderColor);
            wrap.style.setProperty('--bkbg-wscd-radius', o.borderRadius + 'px');
            wrap.style.setProperty('--bkbg-wscd-cell-h', o.cellHeight + 'px');
            wrap.style.setProperty('--bkbg-wscd-grid', o.gridColor);
            wrap.style.background = o.bgColor;

            // Title
            if (o.showTitle && o.title) {
                var titleEl = makeEl('div', 'bkbg-wscd-title');
                titleEl.textContent = o.title;
                titleEl.style.color = o.headerColor;
                wrap.appendChild(titleEl);
            }

            // Grid container
            var grid = makeEl('div', 'bkbg-wscd-grid');

            // Header row
            var headerRow = makeEl('div', 'bkbg-wscd-header-row');

            var corner = makeEl('div', 'bkbg-wscd-time-corner');
            applyCSS(corner, { background: o.headerBg, borderRight: '1px solid ' + o.borderColor, borderBottom: '1px solid ' + o.borderColor });
            headerRow.appendChild(corner);

            for (var d = 0; d < numDays; d++) {
                var dayHeader = makeEl('div', 'bkbg-wscd-day-header');
                dayHeader.textContent = o.dayLabels[d] || DAY_NAMES[d];
                applyCSS(dayHeader, { background: o.headerBg, color: o.headerColor, borderRight: '1px solid ' + o.borderColor, borderBottom: '1px solid ' + o.borderColor });
                headerRow.appendChild(dayHeader);
            }
            grid.appendChild(headerRow);

            // Body row
            var bodyRow = makeEl('div', 'bkbg-wscd-body-row');

            // Time column
            var timeCol = makeEl('div', 'bkbg-wscd-time-col');
            applyCSS(timeCol, { background: o.timeBg, borderRight: '1px solid ' + o.borderColor, height: gridHeight + 'px' });

            for (var h = o.startHour; h <= o.endHour; h++) {
                if (o.showTime) {
                    var topPos = (h - o.startHour) * o.cellHeight;
                    var label = makeEl('div', 'bkbg-wscd-time-label');
                    label.textContent = fmt(h, 0, o.timeFormat);
                    label.style.top = topPos + 'px';
                    label.style.color = o.timeColor;
                    timeCol.appendChild(label);
                }
            }
            bodyRow.appendChild(timeCol);

            // Days area
            var daysArea = makeEl('div', 'bkbg-wscd-days-area');
            daysArea.style.height = gridHeight + 'px';

            for (var day = 0; day < numDays; day++) {
                var dayCol = makeEl('div', 'bkbg-wscd-day-col');
                applyCSS(dayCol, {
                    background: o.bgColor,
                    borderRight: day < numDays - 1 ? '1px solid ' + o.borderColor : 'none',
                    height: gridHeight + 'px'
                });

                // Hour lines
                for (var hl = 0; hl < totalHours; hl++) {
                    var line = makeEl('div', 'bkbg-wscd-hour-line');
                    line.style.top = (hl * o.cellHeight) + 'px';
                    line.style.borderTopColor = o.gridColor;
                    dayCol.appendChild(line);
                }

                // Events for this day
                var dayEvents = (o.events || []).filter(function (ev) { return ev.day === day; });
                dayEvents.forEach(function (ev) {
                    var startFrac = (ev.startHour || 0) + ((ev.startMinute || 0) / 60);
                    var top = (startFrac - o.startHour) * o.cellHeight;
                    var height = (ev.duration || 1) * o.cellHeight - 4;
                    if (top < 0 || top >= gridHeight) return;

                    var evEl = makeEl('div', 'bkbg-wscd-event');
                    applyCSS(evEl, {
                        top: top + 'px',
                        height: height + 'px',
                        background: ev.color || '#6366f1',
                        borderRadius: o.eventRadius + 'px'
                    });

                    var titleDiv = makeEl('div', 'bkbg-wscd-event-title');
                    titleDiv.textContent = ev.title || '';
                    evEl.appendChild(titleDiv);

                    if (o.showInstructor && ev.instructor) {
                        var instDiv = makeEl('div', 'bkbg-wscd-event-sub');
                        instDiv.textContent = ev.instructor;
                        evEl.appendChild(instDiv);
                    }
                    if (o.showLocation && ev.location) {
                        var locDiv = makeEl('div', 'bkbg-wscd-event-sub');
                        locDiv.textContent = '📍 ' + ev.location;
                        evEl.appendChild(locDiv);
                    }

                    dayCol.appendChild(evEl);
                });

                daysArea.appendChild(dayCol);
            }

            bodyRow.appendChild(daysArea);
            grid.appendChild(bodyRow);
            wrap.appendChild(grid);

            appEl.parentNode.insertBefore(wrap, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
