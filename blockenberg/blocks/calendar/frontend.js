(function () {
    var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var DAYS_MON = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    var DAYS_SUN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    function pad(n) { return String(n).padStart(2, '0'); }

    function dateStr(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }

    function buildCalendar(wrap, events, year, month, opts) {
        wrap.innerHTML = '';

        /* Index events by date */
        var byDate = {};
        events.forEach(function (ev) { (byDate[ev.date] = byDate[ev.date] || []).push(ev); });

        var today = new Date();
        var firstDay = new Date(year, month, 1).getDay();
        if (opts.firstMonday) firstDay = (firstDay + 6) % 7;
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var prevDays    = new Date(year, month, 0).getDate();

        var dayNames = opts.firstMonday ? DAYS_MON : DAYS_SUN;

        /* Day name row */
        var nameRow = document.createElement('div');
        nameRow.className = 'bkbg-cal-day-names';
        dayNames.forEach(function (n) {
            var d = document.createElement('div');
            d.className = 'bkbg-cal-day-name';
            d.textContent = n;
            nameRow.appendChild(d);
        });
        wrap.appendChild(nameRow);

        /* Day cells grid */
        var grid = document.createElement('div');
        grid.className = 'bkbg-cal-days';

        var cells = [];
        for (var p = firstDay - 1; p >= 0; p--) {
            cells.push({ day: prevDays - p, current: false, ds: '' });
        }
        for (var d = 1; d <= daysInMonth; d++) {
            cells.push({ day: d, current: true, ds: dateStr(year, month, d) });
        }
        var remaining = 42 - cells.length;
        for (var n = 1; n <= remaining; n++) {
            cells.push({ day: n, current: false, ds: '' });
        }

        cells.forEach(function (cell) {
            var div = document.createElement('div');
            div.className = 'bkbg-cal-day';
            if (!cell.current) div.classList.add('is-other-month');

            var isToday = cell.current && opts.highlightToday
                && today.getFullYear() === year
                && today.getMonth() === month
                && today.getDate() === cell.day;
            if (isToday) div.classList.add('is-today');

            var numEl = document.createElement('div');
            numEl.className = 'bkbg-cal-day-number';
            numEl.textContent = cell.day;
            div.appendChild(numEl);

            var cellEvents = cell.ds ? (byDate[cell.ds] || []) : [];
            cellEvents.slice(0, 3).forEach(function (ev) {
                var pill = document.createElement(ev.url ? 'a' : 'div');
                pill.className = 'bkbg-cal-event-pill';
                pill.textContent = ev.title;
                pill.style.background = ev.color || '';
                if (ev.url) { pill.href = ev.url; pill.target = '_blank'; pill.rel = 'noopener'; }
                div.appendChild(pill);
            });
            if (cellEvents.length > 3) {
                var more = document.createElement('div');
                more.className = 'bkbg-cal-more';
                more.textContent = '+' + (cellEvents.length - 3) + ' more';
                div.appendChild(more);
            }
            grid.appendChild(div);
        });
        wrap.appendChild(grid);
    }

    function buildEventList(listEl, events) {
        listEl.innerHTML = '';
        var head = document.createElement('p');
        head.className = 'bkbg-cal-list-heading';
        head.textContent = 'Upcoming Events';
        listEl.appendChild(head);

        var sorted = events.slice().sort(function (a, b) { return a.date > b.date ? 1 : -1; }).slice(0, 8);
        sorted.forEach(function (ev) {
            var item = document.createElement('div');
            item.className = 'bkbg-cal-event-item';

            var stripe = document.createElement('div');
            stripe.className = 'bkbg-cal-event-stripe';
            stripe.style.background = ev.color || '';
            item.appendChild(stripe);

            var info = document.createElement('div');
            info.className = 'bkbg-cal-event-info';

            var title = document.createElement('p');
            title.className = 'bkbg-cal-event-title';
            title.textContent = ev.title;
            info.appendChild(title);

            if (ev.category) {
                var cat = document.createElement('p');
                cat.className = 'bkbg-cal-event-cat';
                cat.textContent = ev.category;
                info.appendChild(cat);
            }
            item.appendChild(info);

            var date = document.createElement('span');
            date.className = 'bkbg-cal-event-date';
            date.textContent = ev.date;
            item.appendChild(date);

            if (ev.url) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', function () { window.open(ev.url, '_blank', 'noopener'); });
            }
            listEl.appendChild(item);
        });
    }

    function initCalendar(wrapper) {
        if (wrapper.dataset.initialized) return;
        wrapper.dataset.initialized = '1';

        var gridWrap  = wrapper.querySelector('.bkbg-cal-grid-wrap');
        var listEl    = wrapper.querySelector('.bkbg-cal-event-list');
        var navEl     = wrapper.querySelector('.bkbg-cal-nav');
        var labelEl   = wrapper.querySelector('.bkbg-cal-month-label');
        var prevBtn   = wrapper.querySelector('.bkbg-cal-prev');
        var nextBtn   = wrapper.querySelector('.bkbg-cal-next');

        if (!gridWrap) return;

        var events = [];
        try { events = JSON.parse(gridWrap.getAttribute('data-events') || '[]'); } catch (e) {}
        var firstMonday    = gridWrap.getAttribute('data-first-monday') === '1';
        var highlightToday = gridWrap.getAttribute('data-highlight-today') === '1';
        var showYear       = gridWrap.getAttribute('data-show-year') === '1';

        var now = new Date();
        var curYear  = now.getFullYear();
        var curMonth = now.getMonth();

        function render() {
            buildCalendar(gridWrap, events, curYear, curMonth, { firstMonday: firstMonday, highlightToday: highlightToday });
            if (labelEl) labelEl.textContent = MONTHS[curMonth] + (showYear ? ' ' + curYear : '');
            if (listEl)  buildEventList(listEl, events);
        }

        if (prevBtn) prevBtn.addEventListener('click', function () {
            curMonth--; if (curMonth < 0) { curMonth = 11; curYear--; } render();
        });
        if (nextBtn) nextBtn.addEventListener('click', function () {
            curMonth++; if (curMonth > 11) { curMonth = 0; curYear++; } render();
        });

        render();
    }

    function init() {
        document.querySelectorAll('.bkbg-cal-wrapper').forEach(initCalendar);
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
}());
