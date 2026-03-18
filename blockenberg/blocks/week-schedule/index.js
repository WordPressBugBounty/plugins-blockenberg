( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'titleTypo', attrs, '--bkwscd-tt-');
        _tvf(v, 'eventTypo', attrs, '--bkwscd-ev-');
        return v;
    }

    var DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    var EVENT_COLORS = ['#6366f1','#ef4444','#0ea5e9','#22c55e','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316','#64748b'];

    function fmt(h, m, format) {
        m = m || 0;
        if (format === '24h') {
            return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2);
        }
        var ampm = h >= 12 ? 'PM' : 'AM';
        var h12 = h % 12 || 12;
        return h12 + (m ? ':' + ('0' + m).slice(-2) : '') + ' ' + ampm;
    }

    function updateEvent(events, idx, field, val) {
        return events.map(function (e, i) {
            if (i !== idx) return e;
            var upd = {}; upd[field] = val;
            return Object.assign({}, e, upd);
        });
    }

    function ScheduleGrid(props) {
        var a = props.a;
        var onEventClick = props.onEventClick;

        var numDays = a.showWeekend ? 7 : 5;
        var totalHours = a.endHour - a.startHour;
        var gridHeight = totalHours * a.cellHeight;

        var colWidth = 'calc((100% - 48px) / ' + numDays + ')';

        // Time labels column
        var timeLabels = [];
        for (var h = a.startHour; h <= a.endHour; h++) {
            var topPos = (h - a.startHour) * a.cellHeight;
            timeLabels.push(el('div', {
                key: h,
                className: 'bkbg-wscd-time-label',
                style: { top: topPos + 'px', color: a.timeColor }
            }, a.showTime ? fmt(h, 0, a.timeFormat) : ''));
        }

        // Day columns
        var dayCols = [];
        for (var d = 0; d < numDays; d++) {
            var dayD = d;
            // Hour grid lines
            var hourLines = [];
            for (var dh = 0; dh < totalHours; dh++) {
                hourLines.push(el('div', {
                    key: dh,
                    className: 'bkbg-wscd-hour-line',
                    style: {
                        top: (dh * a.cellHeight) + 'px',
                        borderTopColor: a.gridColor
                    }
                }));
            }

            // Events for this day
            var dayEvents = a.events.filter(function (ev) { return ev.day === dayD; });
            var eventEls = dayEvents.map(function (ev, ei) {
                var top = ((ev.startHour + (ev.startMinute || 0) / 60) - a.startHour) * a.cellHeight;
                var height = (ev.duration || 1) * a.cellHeight - 4;
                if (top < 0 || top >= gridHeight) return null;

                return el('div', {
                    key: ei,
                    className: 'bkbg-wscd-event',
                    style: {
                        top: top + 'px',
                        height: height + 'px',
                        background: ev.color || '#6366f1',
                        borderRadius: a.eventRadius + 'px'
                    },
                    onClick: function () { if (onEventClick) onEventClick(ev); }
                },
                    el('div', { className: 'bkbg-wscd-event-title' }, ev.title),
                    a.showInstructor && ev.instructor && el('div', { className: 'bkbg-wscd-event-sub' }, ev.instructor),
                    a.showLocation && ev.location && el('div', { className: 'bkbg-wscd-event-sub' }, '📍 ' + ev.location)
                );
            }).filter(Boolean);

            dayCols.push(el('div', {
                key: d,
                className: 'bkbg-wscd-day-col',
                style: {
                    height: gridHeight + 'px',
                    background: a.bgColor,
                    borderColor: a.borderColor
                }
            }, hourLines, eventEls));
        }

        // Day headers
        var dayHeaders = [];
        for (var dh2 = 0; dh2 < numDays; dh2++) {
            dayHeaders.push(el('div', {
                key: dh2,
                className: 'bkbg-wscd-day-header',
                style: { background: a.headerBg, color: a.headerColor, borderColor: a.borderColor }
            }, a.dayLabels[dh2] || DAY_NAMES[dh2]));
        }

        return el('div', {
            className: 'bkbg-wscd-wrap',
            style: {
                '--bkbg-wscd-cols': numDays,
                '--bkbg-wscd-cell-h': a.cellHeight + 'px',
                '--bkbg-wscd-radius': a.borderRadius + 'px',
                '--bkbg-wscd-border': a.borderColor,
                background: a.bgColor
            }
        },
            a.showTitle && a.title && el('div', { className: 'bkbg-wscd-title', style: { color: a.headerColor } }, a.title),
            el('div', { className: 'bkbg-wscd-grid' },
                el('div', { className: 'bkbg-wscd-header-row' },
                    el('div', { className: 'bkbg-wscd-time-corner', style: { background: a.headerBg, borderColor: a.borderColor } }),
                    dayHeaders
                ),
                el('div', { className: 'bkbg-wscd-body-row' },
                    el('div', { className: 'bkbg-wscd-time-col', style: { background: a.timeBg, borderColor: a.borderColor, height: gridHeight + 'px' } }, timeLabels),
                    el('div', { className: 'bkbg-wscd-days-area', style: { height: gridHeight + 'px' } }, dayCols)
                )
            )
        );
    }

    registerBlockType('blockenberg/week-schedule', {
        title: __('Weekly Schedule', 'blockenberg'),
        icon: 'calendar',
        category: 'bkbg-blog',
        description: __('Visual weekly schedule grid with colored time-slot events.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openState = useState(null);
            var openIdx = openState[0]; var setOpenIdx = openState[1];

            var hourOpts = [];
            for (var h = 0; h <= 23; h++) {
                hourOpts.push({ label: fmt(h, 0, '12h'), value: h });
            }
            var minOpts = [{ label: ':00', value: 0 }, { label: ':15', value: 15 }, { label: ':30', value: 30 }, { label: ':45', value: 45 }];
            var durationOpts = [
                { label: '30 min', value: 0.5 },
                { label: '45 min', value: 0.75 },
                { label: '1 hr', value: 1 },
                { label: '1.5 hr', value: 1.5 },
                { label: '2 hr', value: 2 },
                { label: '2.5 hr', value: 2.5 },
                { label: '3 hr', value: 3 }
            ];
            var dayOpts = DAY_NAMES.map(function (d, i) { return { label: d, value: i }; });
            var timeFormatOpts = [{ label: '12-hour', value: '12h' }, { label: '24-hour', value: '24h' }];

            function addEvent() {
                var colorIdx = a.events.length % EVENT_COLORS.length;
                setAttributes({ events: a.events.concat([{
                    day: 0, startHour: 9, startMinute: 0, duration: 1,
                    title: 'New Class', instructor: '', location: '', color: EVENT_COLORS[colorIdx]
                }])});
            }
            function removeEvent(idx) {
                setAttributes({ events: a.events.filter(function (_, i) { return i !== idx; }) });
            }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Schedule Settings', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label: __('Title', 'blockenberg'),
                        value: a.title,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ title: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Title', 'blockenberg'),
                        checked: a.showTitle,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showTitle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Start Hour', 'blockenberg'),
                        value: a.startHour,
                        options: hourOpts,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ startHour: parseInt(v, 10) }); }
                    }),
                    el(SelectControl, {
                        label: __('End Hour', 'blockenberg'),
                        value: a.endHour,
                        options: hourOpts,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ endHour: parseInt(v, 10) }); }
                    }),
                    el(RangeControl, {
                        label: __('Cell Height (px/hr)', 'blockenberg'),
                        value: a.cellHeight,
                        min: 40, max: 120,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ cellHeight: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Time Format', 'blockenberg'),
                        value: a.timeFormat,
                        options: timeFormatOpts,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ timeFormat: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Weekend (Sat/Sun)', 'blockenberg'),
                        checked: a.showWeekend,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showWeekend: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Instructor', 'blockenberg'),
                        checked: a.showInstructor,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showInstructor: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Location', 'blockenberg'),
                        checked: a.showLocation,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showLocation: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.borderRadius,
                        min: 0, max: 20,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Event Radius', 'blockenberg'),
                        value: a.eventRadius,
                        min: 0, max: 12,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ eventRadius: v }); }
                    })
                ),
                el(PanelBody, { title: __('Events (' + a.events.length + ')', 'blockenberg'), initialOpen: false },
                    a.events.map(function (ev, i) {
                        var isOpen = openIdx === i;
                        return el('div', { key: i, className: 'bkbg-wscd-event-editor' },
                            el('div', {
                                className: 'bkbg-wscd-event-head',
                                style: { borderLeft: '4px solid ' + (ev.color || '#6366f1') },
                                onClick: function () { setOpenIdx(isOpen ? null : i); }
                            },
                                el('span', {}, ev.title || 'Event ' + (i + 1)),
                                el('span', { className: 'bkbg-wscd-ev-day' }, DAY_NAMES[ev.day] || ''),
                                el('div', { style: { marginLeft: 'auto', display: 'flex', gap: '4px' } },
                                    el('span', {}, isOpen ? '▲' : '▼'),
                                    el(Button, { isSmall: true, isDestructive: true, onClick: function (e) { e.stopPropagation(); removeEvent(i); } }, '✕')
                                )
                            ),
                            isOpen && el('div', { className: 'bkbg-wscd-event-fields' },
                                el(TextControl, {
                                    label: __('Title', 'blockenberg'),
                                    value: ev.title,
                                    __nextHasNoMarginBottom: true,
                                    onChange: function (v) { setAttributes({ events: updateEvent(a.events, i, 'title', v) }); }
                                }),
                                el(SelectControl, {
                                    label: __('Day', 'blockenberg'),
                                    value: ev.day,
                                    options: dayOpts,
                                    __nextHasNoMarginBottom: true,
                                    onChange: function (v) { setAttributes({ events: updateEvent(a.events, i, 'day', parseInt(v, 10)) }); }
                                }),
                                el(SelectControl, {
                                    label: __('Start Hour', 'blockenberg'),
                                    value: ev.startHour,
                                    options: hourOpts,
                                    __nextHasNoMarginBottom: true,
                                    onChange: function (v) { setAttributes({ events: updateEvent(a.events, i, 'startHour', parseInt(v, 10)) }); }
                                }),
                                el(SelectControl, {
                                    label: __('Start Minute', 'blockenberg'),
                                    value: ev.startMinute || 0,
                                    options: minOpts,
                                    __nextHasNoMarginBottom: true,
                                    onChange: function (v) { setAttributes({ events: updateEvent(a.events, i, 'startMinute', parseInt(v, 10)) }); }
                                }),
                                el(SelectControl, {
                                    label: __('Duration', 'blockenberg'),
                                    value: ev.duration,
                                    options: durationOpts,
                                    __nextHasNoMarginBottom: true,
                                    onChange: function (v) { setAttributes({ events: updateEvent(a.events, i, 'duration', parseFloat(v)) }); }
                                }),
                                el(TextControl, {
                                    label: __('Instructor', 'blockenberg'),
                                    value: ev.instructor,
                                    __nextHasNoMarginBottom: true,
                                    onChange: function (v) { setAttributes({ events: updateEvent(a.events, i, 'instructor', v) }); }
                                }),
                                el(TextControl, {
                                    label: __('Location', 'blockenberg'),
                                    value: ev.location,
                                    __nextHasNoMarginBottom: true,
                                    onChange: function (v) { setAttributes({ events: updateEvent(a.events, i, 'location', v) }); }
                                }),
                                el('div', { style: { marginBottom: '8px' } },
                                    el('label', { style: { display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', color: '#1e1e1e' } }, __('Color', 'blockenberg')),
                                    el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } },
                                        EVENT_COLORS.map(function (c) {
                                            return el('button', {
                                                key: c,
                                                style: {
                                                    width: '20px', height: '20px',
                                                    background: c,
                                                    border: ev.color === c ? '2px solid #000' : '2px solid transparent',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer', padding: 0
                                                },
                                                onClick: function () { setAttributes({ events: updateEvent(a.events, i, 'color', c) }); }
                                            });
                                        })
                                    )
                                )
                            )
                        );
                    }),
                    el(Button, {
                        variant: 'secondary',
                        style: { marginTop: '8px', width: '100%' },
                        onClick: addEvent
                    }, __('+ Add Event', 'blockenberg'))
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl(__('Title', 'blockenberg'), 'titleTypo', a, setAttributes),
                    getTypoControl(__('Event', 'blockenberg'), 'eventTypo', a, setAttributes)
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.bgColor, onChange: function (c) { setAttributes({ bgColor: c || '#ffffff' }); }, label: __('Background', 'blockenberg') },
                        { value: a.headerBg, onChange: function (c) { setAttributes({ headerBg: c || '#f8fafc' }); }, label: __('Header Background', 'blockenberg') },
                        { value: a.headerColor, onChange: function (c) { setAttributes({ headerColor: c || '#1e293b' }); }, label: __('Header Text', 'blockenberg') },
                        { value: a.gridColor, onChange: function (c) { setAttributes({ gridColor: c || '#f1f5f9' }); }, label: __('Grid Lines', 'blockenberg') },
                        { value: a.borderColor, onChange: function (c) { setAttributes({ borderColor: c || '#e2e8f0' }); }, label: __('Border', 'blockenberg') },
                        { value: a.timeBg, onChange: function (c) { setAttributes({ timeBg: c || '#f8fafc' }); }, label: __('Time Column Background', 'blockenberg') },
                        { value: a.timeColor, onChange: function (c) { setAttributes({ timeColor: c || '#64748b' }); }, label: __('Time Text', 'blockenberg') }
                    ]
                })
            );

            var blockProps = useBlockProps((function () {
                var s = getTypoCssVars(a);
                return { className: 'bkbg-editor-wrap', 'data-block-label': 'Weekly Schedule', style: s };
            })());

            return el('div', blockProps,
                inspector,
                el(ScheduleGrid, { a: a })
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save({ style: getTypoCssVars(props.attributes) }),
                el('div', { className: 'bkbg-wscd-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
