( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    function _tv(typo, prefix) {
        if (!typo) return {};
        var s = {};
        if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
        if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
        if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
        if (typo.style)      s[prefix + 'font-style'] = typo.style;
        if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
        return s;
    }

    var MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    function makeId() { return 'cal' + Math.random().toString(36).substr(2, 5); }

    function buildWrapStyle(a) {
        return Object.assign({
            '--bkbg-cal-accent':       a.accentColor,
            '--bkbg-cal-header-bg':    a.headerBg,
            '--bkbg-cal-header-color': a.headerColor,
            '--bkbg-cal-grid-bg':      a.gridBg,
            '--bkbg-cal-day-border':   a.dayBorderColor,
            '--bkbg-cal-day-hover':    a.dayHoverBg,
            '--bkbg-cal-today-bg':     a.todayBg,
            '--bkbg-cal-today-color':  a.todayColor,
            '--bkbg-cal-other-color':  a.otherMonthColor,
            '--bkbg-cal-title-color':  a.titleColor,
            '--bkbg-cal-day-name-color': a.dayNameColor,
            '--bkbg-cal-list-title':   a.listTitleColor,
            '--bkbg-cal-list-date':    a.listDateColor,
            '--bkbg-cal-card-bg':      a.cardBg,
            '--bkbg-cal-card-border':  a.cardBorder,
            '--bkbg-cal-card-r':       a.cardRadius + 'px',
            paddingTop:    a.paddingTop    + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        }, _tv(a.typoTitle, '--bkbg-cal-title-'));
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#ccc' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Calendar grid ─────────────────────────────────────────────── */
    function CalendarGrid(props) {
        var year   = props.year;
        var month  = props.month;
        var events = props.events;
        var a      = props.a;
        var today  = new Date();

        /* Day names */
        var dayNames = props.a.firstDayMonday
            ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
            : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

        /* Events indexed by date */
        var eventsByDate = {};
        events.forEach(function (ev) {
            var d = ev.date;
            if (!eventsByDate[d]) eventsByDate[d] = [];
            eventsByDate[d].push(ev);
        });

        /* Build grid cells */
        var firstDay = new Date(year, month, 1).getDay(); /* 0=Sun */
        if (a.firstDayMonday) firstDay = (firstDay + 6) % 7; /* shift: Mon=0 */
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var prevDays    = new Date(year, month, 0).getDate();

        var cells = [];
        /* Prev month tail */
        for (var p = firstDay - 1; p >= 0; p--) {
            cells.push({ day: prevDays - p, current: false, dateStr: '' });
        }
        /* Current month */
        for (var d = 1; d <= daysInMonth; d++) {
            var ds = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            cells.push({ day: d, current: true, dateStr: ds });
        }
        /* Next month fill */
        var remaining = 42 - cells.length;
        for (var n = 1; n <= remaining; n++) {
            cells.push({ day: n, current: false, dateStr: '' });
        }

        return el('div', { className: 'bkbg-cal-grid-wrap', style: { background: a.gridBg, borderRadius: a.cardRadius + 'px', overflow: 'hidden', border: '1px solid ' + a.cardBorder } },
            /* Day name headers */
            el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: a.headerBg } },
                dayNames.map(function (name) {
                    return el('div', { key: name, style: { textAlign: 'center', padding: '10px 4px', fontSize: '12px', fontWeight: 700, color: a.headerColor, textTransform: 'uppercase', letterSpacing: '0.05em' } }, name);
                })
            ),
            /* Day cells */
            el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' } },
                cells.map(function (cell, idx) {
                    var isToday = cell.current && a.highlightToday
                        && today.getFullYear() === year
                        && today.getMonth() === month
                        && today.getDate() === cell.day;
                    var cellEvents = cell.dateStr ? (eventsByDate[cell.dateStr] || []) : [];

                    return el('div', { key: idx,
                        style: {
                            minHeight: '80px',
                            padding: '6px',
                            borderRight: '1px solid ' + a.dayBorderColor,
                            borderBottom: '1px solid ' + a.dayBorderColor,
                            background: a.gridBg,
                            opacity: cell.current ? 1 : 0.4,
                        }
                    },
                        /* Day number */
                        el('div', { style: {
                            width: '26px', height: '26px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: isToday ? 800 : 500,
                            background: isToday ? a.todayBg : 'transparent',
                            color: isToday ? a.todayColor : (cell.current ? a.titleColor : a.otherMonthColor),
                            marginBottom: '4px',
                        }}, cell.day),
                        /* Events */
                        cellEvents.slice(0, 3).map(function (ev) {
                            return el('div', { key: ev.id, style: {
                                background: ev.color || a.accentColor,
                                color: '#fff',
                                fontSize: '10px',
                                fontWeight: 600,
                                padding: '1px 5px',
                                borderRadius: '3px',
                                marginBottom: '2px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}, ev.title);
                        }),
                        cellEvents.length > 3 && el('div', { style: { fontSize: '10px', color: a.accentColor, fontWeight: 700 } }, '+' + (cellEvents.length - 3) + ' more')
                    );
                })
            )
        );
    }

    registerBlockType('blockenberg/calendar', {
        title: __('Events Calendar', 'blockenberg'),
        icon: 'calendar-alt',
        category: 'bkbg-interactive',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            /* Navigate months in editor */
            var today = new Date();
            var viewDateState = useState({ year: today.getFullYear(), month: today.getMonth() });
            var viewDate = viewDateState[0];
            var setViewDate = viewDateState[1];

            /* Editing event */
            var editEventState = useState(null);
            var editEventId = editEventState[0];
            var setEditEventId = editEventState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateEvent(id, key, val) {
                setAttributes({ events: a.events.map(function (ev) {
                    if (ev.id !== id) return ev;
                    var u = Object.assign({}, ev); u[key] = val; return u;
                }) });
            }

            function removeEvent(id) {
                setAttributes({ events: a.events.filter(function (ev) { return ev.id !== id; }) });
            }

            function addEvent() {
                var today2 = new Date();
                var ds = today2.getFullYear() + '-' + String(today2.getMonth()+1).padStart(2,'0') + '-' + String(today2.getDate()).padStart(2,'0');
                var newId = makeId();
                setAttributes({ events: a.events.concat([{ id: newId, title: 'New Event', date: ds, endDate: '', color: a.accentColor, url: '', allDay: true, category: '' }]) });
                setEditEventId(newId);
            }

            var prevMonth = function () {
                setViewDate(function (vd) {
                    var m = vd.month - 1;
                    var y = vd.year;
                    if (m < 0) { m = 11; y--; }
                    return { year: y, month: m };
                });
            };
            var nextMonth = function () {
                setViewDate(function (vd) {
                    var m = vd.month + 1;
                    var y = vd.year;
                    if (m > 11) { m = 0; y++; }
                    return { year: y, month: m };
                });
            };

            /* Sort upcoming events for list */
            var upcoming = a.events.slice().sort(function (a2, b2) { return a2.date > b2.date ? 1 : -1; }).slice(0, 8);

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Events', 'blockenberg'), initialOpen: true },
                        a.events.map(function (ev) {
                            var isEdit = editEventId === ev.id;
                            return el('div', { key: ev.id, style: { border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' } },
                                el('div', { onClick: function () { setEditEventId(isEdit ? null : ev.id); },
                                    style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', cursor: 'pointer', background: isEdit ? '#f0e9ff' : '#fafafa' } },
                                    el('span', { style: { width: '10px', height: '10px', borderRadius: '50%', background: ev.color || '#6c3fb5', flexShrink: 0 } }),
                                    el('span', { style: { flex: 1, fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, ev.title),
                                    el('span', { style: { fontSize: '11px', color: '#888', flexShrink: 0 } }, ev.date)
                                ),
                                isEdit && el('div', { style: { padding: '10px', borderTop: '1px solid #e0e0e0' } },
                                    el(TextControl, { label: __('Title', 'blockenberg'), value: ev.title, onChange: function (v) { updateEvent(ev.id, 'title', v); } }),
                                    el(TextControl, { label: __('Date (YYYY-MM-DD)', 'blockenberg'), value: ev.date, onChange: function (v) { updateEvent(ev.id, 'date', v); } }),
                                    el(TextControl, { label: __('Category', 'blockenberg'), value: ev.category || '', onChange: function (v) { updateEvent(ev.id, 'category', v); } }),
                                    el(TextControl, { label: __('URL (optional)', 'blockenberg'), value: ev.url || '', onChange: function (v) { updateEvent(ev.id, 'url', v); } }),
                                    el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                                        el('span', { style: { fontSize: '12px', fontWeight: 600 } }, __('Color:', 'blockenberg')),
                                        el('input', { type: 'color', value: ev.color || '#6c3fb5', onChange: function (e) { updateEvent(ev.id, 'color', e.target.value); }, style: { width: '32px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', background: 'none' } })
                                    ),
                                    el(Button, { isDestructive: true, variant: 'tertiary', size: 'compact', onClick: function () { removeEvent(ev.id); } }, __('Remove Event', 'blockenberg'))
                                )
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: addEvent, style: { width: '100%', justifyContent: 'center' } }, '+ ' + __('Add Event', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Options', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show title', 'blockenberg'), checked: a.showTitle, onChange: function (v) { setAttributes({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Highlight today', 'blockenberg'), checked: a.highlightToday, onChange: function (v) { setAttributes({ highlightToday: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Week starts on Monday', 'blockenberg'), checked: a.firstDayMonday, onChange: function (v) { setAttributes({ firstDayMonday: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show event list below', 'blockenberg'), checked: a.showEventList, onChange: function (v) { setAttributes({ showEventList: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show year in header', 'blockenberg'), checked: a.showYear, onChange: function (v) { setAttributes({ showYear: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Card radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 24, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                        ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } })
                    ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',     __('Accent',          'blockenberg'), 'accentColor'),
                        cc('headerBg',        __('Calendar header bg', 'blockenberg'), 'headerBg'),
                        cc('headerColor',     __('Header text',     'blockenberg'), 'headerColor'),
                        cc('gridBg',          __('Grid background', 'blockenberg'), 'gridBg'),
                        cc('dayBorderColor',  __('Day borders',     'blockenberg'), 'dayBorderColor'),
                        cc('dayHoverBg',      __('Day hover bg',    'blockenberg'), 'dayHoverBg'),
                        cc('todayBg',         __('Today circle bg', 'blockenberg'), 'todayBg'),
                        cc('todayColor',      __('Today number',    'blockenberg'), 'todayColor'),
                        cc('otherMonthColor', __('Other month day', 'blockenberg'), 'otherMonthColor'),
                        cc('titleColor',      __('Day number',      'blockenberg'), 'titleColor'),
                        cc('dayNameColor',    __('Day names',       'blockenberg'), 'dayNameColor'),
                        cc('listTitleColor',  __('List event title','blockenberg'), 'listTitleColor'),
                        cc('listDateColor',   __('List event date', 'blockenberg'), 'listDateColor'),
                        cc('cardBg',          __('Card background', 'blockenberg'), 'cardBg'),
                        cc('cardBorder',      __('Card border',     'blockenberg'), 'cardBorder'),
                        cc('bgColor',         __('Section bg',      'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    /* Title */
                    a.showTitle && el(RichText, { tagName: 'h2', className: 'bkbg-cal-title', value: a.title, onChange: function (v) { setAttributes({ title: v }); }, placeholder: __('Events Calendar', 'blockenberg'), style: { color: a.titleColor, margin: '0 0 20px', textAlign: 'center' } }),

                    /* Month navigation */
                    el('div', { className: 'bkbg-cal-nav', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
                        el('button', { onClick: prevMonth, style: { border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: a.accentColor, padding: '4px 10px', borderRadius: '6px' } }, '‹'),
                        el('span', { style: { fontSize: '16px', fontWeight: 700, color: a.titleColor } },
                            MONTHS_EN[viewDate.month] + (a.showYear ? ' ' + viewDate.year : '')
                        ),
                        el('button', { onClick: nextMonth, style: { border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: a.accentColor, padding: '4px 10px', borderRadius: '6px' } }, '›')
                    ),

                    /* Calendar grid */
                    el(CalendarGrid, { year: viewDate.year, month: viewDate.month, events: a.events, a: a }),

                    /* Event list */
                    a.showEventList && upcoming.length > 0 && el('div', { className: 'bkbg-cal-event-list', style: { marginTop: '24px' } },
                        el('h3', { style: { fontSize: '14px', fontWeight: 700, color: a.listTitleColor, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' } }, __('Upcoming Events', 'blockenberg')),
                        upcoming.map(function (ev) {
                            return el('div', { key: ev.id, className: 'bkbg-cal-event-item', style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', marginBottom: '6px', background: a.cardBg, border: '1px solid ' + a.cardBorder } },
                                el('div', { style: { width: '4px', alignSelf: 'stretch', borderRadius: '4px', background: ev.color || a.accentColor, flexShrink: 0 } }),
                                el('div', { style: { flex: 1, minWidth: 0 } },
                                    el('p', { style: { margin: 0, fontSize: '14px', fontWeight: 700, color: a.listTitleColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, ev.title),
                                    ev.category && el('p', { style: { margin: '2px 0 0', fontSize: '11px', color: a.accentColor, fontWeight: 600 } }, ev.category)
                                ),
                                el('span', { style: { fontSize: '12px', color: a.listDateColor, fontWeight: 600, flexShrink: 0 } }, ev.date)
                            );
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var sortedEvents = a.events.slice().sort(function (x, y) { return x.date > y.date ? 1 : -1; });

            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-cal-wrapper', style: buildWrapStyle(a) }),
                a.showTitle && el(RichText.Content, { tagName: 'h2', className: 'bkbg-cal-title', value: a.title }),

                el('div', { className: 'bkbg-cal-nav' },
                    el('button', { type: 'button', className: 'bkbg-cal-nav-btn bkbg-cal-prev', 'aria-label': __('Previous month', 'blockenberg') }, '‹'),
                    el('span', { className: 'bkbg-cal-month-label' }),
                    el('button', { type: 'button', className: 'bkbg-cal-nav-btn bkbg-cal-next', 'aria-label': __('Next month', 'blockenberg') }, '›')
                ),

                el('div', {
                    className: 'bkbg-cal-grid-wrap',
                    'data-events': JSON.stringify(a.events),
                    'data-first-monday': a.firstDayMonday ? '1' : '0',
                    'data-highlight-today': a.highlightToday ? '1' : '0',
                    'data-show-year': a.showYear ? '1' : '0',
                }),

                a.showEventList && el('div', { className: 'bkbg-cal-event-list', 'data-events': JSON.stringify(sortedEvents.slice(0, 8)) })
            );
        }
    });
}() );
