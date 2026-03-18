(function () {
    'use strict';

    function getTimeParts(tz, fmt, showSec) {
        try {
            var now = new Date();
            var opts = { timeZone: tz, hour: 'numeric', minute: '2-digit', second: showSec ? '2-digit' : undefined, hour12: fmt === '12h' };
            var optsDate = { timeZone: tz, month: 'short', day: 'numeric', weekday: 'short' };
            return {
                time: new Intl.DateTimeFormat('en-US', opts).format(now),
                date: new Intl.DateTimeFormat('en-US', optsDate).format(now)
            };
        } catch (e) {
            return { time: 'Invalid TZ', date: '' };
        }
    }

    function getAngles(tz) {
        try {
            var now = new Date();
            var s = new Intl.DateTimeFormat('en-US', {
                timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            }).format(now);
            // s may be "03:25:42" or similar
            var parts = s.split(':').map(Number);
            var h = (parts[0] || 0) % 12, m = parts[1] || 0, sec = parts[2] || 0;
            return {
                h: (h * 30) + (m * 0.5),
                m: m * 6 + sec * 0.1,
                s: sec * 6
            };
        } catch (e) {
            return { h: 0, m: 0, s: 0 };
        }
    }

    function esc(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function svgClock(tz, o) {
        var size = o.analogSize || 120;
        var r = size / 2;
        var ang = getAngles(tz);
        var bc = o.borderColor || '#e5e7eb';
        var ac = o.accentColor || '#6c3fb5';

        function handLine(angle, len, color, width) {
            var rad = (angle - 90) * Math.PI / 180;
            return '<line x1="' + r + '" y1="' + r + '" x2="' + (r + len * Math.cos(rad)) + '" y2="' + (r + len * Math.sin(rad)) + '" stroke="' + color + '" stroke-width="' + width + '" stroke-linecap="round"/>';
        }

        var ticks = '';
        for (var i = 0; i < 12; i++) {
            var rad = (i * 30 - 90) * Math.PI / 180;
            var rIn = r * 0.82, rOut = r * 0.92;
            ticks += '<line x1="' + (r + rIn * Math.cos(rad)) + '" y1="' + (r + rIn * Math.sin(rad)) + '" x2="' + (r + rOut * Math.cos(rad)) + '" y2="' + (r + rOut * Math.sin(rad)) + '" stroke="' + ac + '" stroke-width="1.5"/>';
        }

        var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';
        svg += '<circle cx="' + r + '" cy="' + r + '" r="' + (r - 2) + '" fill="' + (o.clockFace || '#f5f3ff') + '" stroke="' + ac + '" stroke-width="2"/>';
        svg += ticks;
        svg += handLine(ang.h, r * 0.5, o.handHour || '#1e1b4b', 3);
        svg += handLine(ang.m, r * 0.7, o.handMin  || '#6c3fb5', 2);
        if (o.showSeconds !== false) svg += handLine(ang.s, r * 0.75, o.handSec || '#ef4444', 1);
        svg += '<circle cx="' + r + '" cy="' + r + '" r="3" fill="' + (o.handSec || '#ef4444') + '"/>';
        svg += '</svg>';
        return svg;
    }

    function buildCards(container, o) {
        var cols = o.columns || 4;
        var gap  = (o.gap || 16) + 'px';

        container.style.display        = 'grid';
        container.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
        container.style.gap            = gap;
        container.style.maxWidth       = (o.maxWidth || 960) + 'px';
        container.style.margin         = '0 auto';

        container.innerHTML = '';
        (o.zones || []).forEach(function (zone) {
            var card = document.createElement('div');
            card.className = 'bkbg-wc-card';
            card.style.cssText = [
                'background:' + (o.cardBg || '#fff'),
                'border:1px solid ' + (o.borderColor || '#e5e7eb'),
                'border-radius:' + (o.cardRadius || 16) + 'px',
                'padding:' + (o.cardPadding || 24) + 'px',
                'display:flex',
                'flex-direction:column',
                'align-items:center',
                'gap:8px',
                'box-sizing:border-box'
            ].join(';');

            card.dataset.tz = zone.tz;
            card.dataset.label = zone.label;
            container.appendChild(card);
        });
    }

    function updateCards(container, o) {
        var cards = container.querySelectorAll('.bkbg-wc-card');
        cards.forEach(function (card) {
            var tz    = card.dataset.tz;
            var label = card.dataset.label;
            var parts = getTimeParts(tz, o.timeFormat, o.showSeconds !== false);

            var inner = '';
            if (o.clockStyle === 'analog') {
                inner += '<div class="bkbg-wc-analog">' + svgClock(tz, o) + '</div>';
            }
            inner += '<div class="bkbg-wc-label" style="color:' + (o.labelColor || '#6b7280') + ';text-align:center">' + esc(label) + '</div>';
            if (o.clockStyle !== 'analog') {
                inner += '<div class="bkbg-wc-time" style="color:' + (o.timeColor || '#1e1b4b') + '">' + esc(parts.time) + '</div>';
            }
            if (o.showDate !== false) {
                inner += '<div class="bkbg-wc-date" style="color:' + (o.dateColor || '#9ca3af') + ';text-align:center">' + esc(parts.date) + '</div>';
            }
            card.innerHTML = inner;
        });
    }

    function buildApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) { return; }
        var o = opts;

        app.style.paddingTop    = (o.paddingTop || 60) + 'px';
        app.style.paddingBottom = (o.paddingBottom || 60) + 'px';
        if (o.sectionBg) app.style.background = o.sectionBg;

        /* Header */
        if (o.showTitle || o.showSubtitle) {
            var hdr = document.createElement('div');
            hdr.style.cssText = 'text-align:center;margin-bottom:32px';
            if (o.showTitle && o.title) {
                var ht = document.createElement('h3');
                ht.className = 'bkbg-wc-title';
                ht.textContent = o.title;
                ht.style.cssText = 'color:' + (o.titleColor || '#1e1b4b') + ';margin:0 0 8px';
                hdr.appendChild(ht);
            }
            if (o.showSubtitle && o.subtitle) {
                var hs = document.createElement('p');
                hs.className = 'bkbg-wc-subtitle';
                hs.textContent = o.subtitle;
                hs.style.cssText = 'color:' + (o.subtitleColor || '#6b7280') + ';margin:0';
                hdr.appendChild(hs);
            }
            app.appendChild(hdr);
        }

        /* Grid container */
        var grid = document.createElement('div');
        grid.className = 'bkbg-wc-grid';
        app.appendChild(grid);

        buildCards(grid, o);
        updateCards(grid, o);

        /* Tick every second */
        setInterval(function () {
            updateCards(grid, o);
        }, 1000);
    }

    document.querySelectorAll('.bkbg-wc-app').forEach(buildApp);
})();
