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
    function ap(p) {
        Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) p.appendChild(c); });
        return p;
    }

    // ── helpers ────────────────────────────────────────────────────────
    function fmtTime(h, m, use12) {
        if (!use12) {
            return (h < 10 ? '0' : '') + h + ':' + (m === 0 ? '00' : (m < 10 ? '0' : '') + m);
        }
        var ampm = h >= 12 ? 'PM' : 'AM';
        var hh = h % 12 || 12;
        return hh + ':' + (m === 0 ? '00' : (m < 10 ? '0' : '') + m) + ' ' + ampm;
    }

    function catColors(cat, a) {
        if (cat === 'work')     return { bg: a.workBg     || '#1e3a5f', color: a.workColor     || '#93c5fd' };
        if (cat === 'break')    return { bg: a.breakBg    || '#14532d', color: a.breakColor    || '#86efac' };
        if (cat === 'personal') return { bg: a.personalBg || '#3b0764', color: a.personalColor || '#c4b5fd' };
        if (cat === 'health')   return { bg: a.healthBg   || '#431407', color: a.healthColor   || '#fdba74' };
        if (cat === 'meal')     return { bg: a.mealBg     || '#451a03', color: a.mealColor     || '#fde68a' };
        return { bg: a.workBg || '#1e3a5f', color: a.workColor || '#93c5fd' };
    }

    function catEmoji(cat) {
        var map = { work: '💻', break: '☕', personal: '🎨', health: '🏃', meal: '🍽️' };
        return map[cat] || '📌';
    }

    var CAT_LABELS = { work: 'Work', break: 'Break', personal: 'Personal', health: 'Health', meal: 'Meal' };

    /* ── Typography CSS-var helper ─────────────────────────────────────── */
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', style:'font-style',
            transform:'text-transform', decoration:'text-decoration',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m', sizeUnit:'font-size-unit',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m', lineHeightUnit:'line-height-unit',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m', letterSpacingUnit:'letter-spacing-unit',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m', wordSpacingUnit:'word-spacing-unit'
        };
        Object.keys(map).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                var css = map[k];
                if (css.indexOf('size-d') !== -1 || css.indexOf('size-t') !== -1 || css.indexOf('size-m') !== -1 ||
                    css.indexOf('height-d') !== -1 || css.indexOf('height-t') !== -1 || css.indexOf('height-m') !== -1 ||
                    css.indexOf('spacing-d') !== -1 || css.indexOf('spacing-t') !== -1 || css.indexOf('spacing-m') !== -1) {
                    var unitKey = css.replace(/-[dtm]$/, '-unit');
                    var unit = '';
                    Object.keys(map).forEach(function(k2) { if (map[k2] === unitKey && typo[k2]) unit = typo[k2]; });
                    if (!unit) unit = css.indexOf('size') !== -1 ? 'px' : '';
                    v = v + unit;
                }
                el.style.setProperty(prefix + css, v);
            }
        });
    }

    // ── builder ───────────────────────────────────────────────────────
    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';
        var a;
        try { a = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { a = {}; }

        var hourStart  = typeof a.hourStart  === 'number' ? a.hourStart  : 6;
        var hourEnd    = typeof a.hourEnd    === 'number' ? a.hourEnd    : 22;
        var hourHeight = typeof a.hourHeight === 'number' ? a.hourHeight : 60;
        var fontSize   = typeof a.fontSize   === 'number' ? a.fontSize   : 13;
        var totalHours  = Math.max(hourEnd - hourStart, 1);
        var totalHeight = totalHours * hourHeight;
        var timeColW   = 68;
        var borderRadius = typeof a.borderRadius === 'number' ? a.borderRadius : 12;

        // Outer wrapper
        var wrap = mk('div', 'bkbg-daily-schedule-app', {
            background:   a.bgColor     || '#0f172a',
            border:       '1px solid ' + (a.borderColor || '#1e293b'),
            borderRadius: borderRadius + 'px',
            overflow:     'hidden',
            fontFamily:   '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        });

        // Header
        if (a.showTitle !== false && a.dayTitle) {
            var header = mk('div', 'bkbg-ds-header', {
                background:   a.headerBg   || '#1e293b',
                borderBottom: '1px solid ' + (a.borderColor || '#1e293b'),
                padding: '18px 20px 14px'
            });

            ap(header, tx('h2', 'bkbg-ds-title', a.dayTitle, {
                color: a.titleColor || '#f8fafc',
                margin: '0 0 10px'
            }));

            // Legend
            var legend = mk('div', 'bkbg-ds-legend');
            ['work', 'break', 'personal', 'health', 'meal'].forEach(function (cat) {
                var cc = catColors(cat, a);
                var pill = mk('span', 'bkbg-ds-legend-item', {
                    background: cc.bg, color: cc.color
                });
                pill.textContent = catEmoji(cat) + ' ' + CAT_LABELS[cat];
                legend.appendChild(pill);
            });
            ap(header, legend);
            ap(wrap, header);
        }

        // Body
        var body = mk('div', 'bkbg-ds-body', {
            position: 'relative',
            height: (totalHeight + 24) + 'px',
            padding: '12px 12px 16px'
        });

        // Hour rows (grid lines + time labels)
        for (var h = hourStart; h <= hourEnd; h++) {
            var y = (h - hourStart) * hourHeight;
            var row = mk('div', 'bkbg-ds-hour-row', { position: 'absolute', top: y + 'px', left: '12px', right: '12px', display: 'flex', alignItems: 'flex-start' });

            ap(row, tx('span', 'bkbg-ds-time-label', fmtTime(h, 0, a.use12Hour), {
                width: timeColW + 'px',
                color: a.timeColor || '#475569',
                fontSize: (fontSize - 1) + 'px'
            }));

            if (a.showGridLines !== false) {
                ap(row, mk('span', 'bkbg-ds-grid-line', { background: a.gridLineColor || '#1e293b' }));
            }

            body.appendChild(row);
        }

        // Events
        (a.events || []).forEach(function (ev) {
            var top  = ((ev.startHour - hourStart) + (ev.startMin / 60)) * hourHeight;
            var evH  = Math.max((ev.duration / 60) * hourHeight - 4, 20);
            var cc   = catColors(ev.category, a);
            var endH = ev.startHour + Math.floor((ev.startMin + ev.duration) / 60);
            var endM = (ev.startMin + ev.duration) % 60;
            var left = timeColW + 16;

            var evEl = mk('div', 'bkbg-ds-event', {
                top:        top + 'px',
                left:       left + 'px',
                right:      '0',
                height:     evH + 'px',
                background: cc.bg,
                borderLeft: '3px solid ' + cc.color,
                color:      cc.color
            });

            // Title row
            var titleRow = mk('div', 'bkbg-ds-event-title-row');
            ap(titleRow,
                tx('span', '', catEmoji(ev.category), { fontSize: '13px' }),
                tx('span', 'bkbg-ds-event-title', ev.title, {
                    fontSize: fontSize + 'px',
                    color: cc.color
                })
            );
            evEl.appendChild(titleRow);

            // Time
            if (a.showEventTime !== false && evH > 28) {
                var timeStr = fmtTime(ev.startHour, ev.startMin, a.use12Hour) + ' – ' + fmtTime(endH, endM, a.use12Hour);
                ap(evEl, tx('div', 'bkbg-ds-event-time', timeStr, { fontSize: (fontSize - 2) + 'px', color: cc.color }));
            }

            // Note
            if (a.showEventNote !== false && ev.note && evH > 48) {
                ap(evEl, tx('div', 'bkbg-ds-event-note', ev.note, { fontSize: (fontSize - 2) + 'px', color: cc.color }));
            }

            body.appendChild(evEl);
        });

        ap(wrap, body);

        /* Apply typography CSS vars on wrap */
        wrap.style.setProperty('--bkbg-ds-ttl-fs', (a.titleFontSize || 22) + 'px');
        typoCssVarsForEl(a.typoTitle, '--bkbg-ds-ttl-', wrap);

        appEl.innerHTML = '';
        appEl.appendChild(wrap);
    }

    function init() {
        document.querySelectorAll('.bkbg-daily-schedule-app').forEach(buildBlock);
    }

    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
