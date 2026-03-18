(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var PanelBody = wp.components.PanelBody;
        var TextControl = wp.components.TextControl;
        var ToggleControl = wp.components.ToggleControl;
        var RangeControl = wp.components.RangeControl;
        var SelectControl = wp.components.SelectControl;
        var Button = wp.components.Button;

        var _dsTC, _dsTV;
        function _tc() { return _dsTC || (_dsTC = window.bkbgTypographyControl); }
        function _tv(typo, prefix) { return _dsTV ? _dsTV(typo, prefix) : ((_dsTV = window.bkbgTypoCssVars) ? _dsTV(typo, prefix) : {}); }

        // ── helpers ────────────────────────────────────────────────────
        function upd(arr, idx, field, val) {
            return arr.map(function (e, i) {
                if (i !== idx) return e;
                var u = {}; u[field] = val;
                return Object.assign({}, e, u);
            });
        }

        var CATEGORY_OPTIONS = [
            { value: 'work',     label: 'Work' },
            { value: 'break',    label: 'Break' },
            { value: 'personal', label: 'Personal' },
            { value: 'health',   label: 'Health / Exercise' },
            { value: 'meal',     label: 'Meal / Food' },
        ];

        function catColors(cat, a) {
            if (cat === 'work')     return { bg: a.workBg,     color: a.workColor };
            if (cat === 'break')    return { bg: a.breakBg,    color: a.breakColor };
            if (cat === 'personal') return { bg: a.personalBg, color: a.personalColor };
            if (cat === 'health')   return { bg: a.healthBg,   color: a.healthColor };
            if (cat === 'meal')     return { bg: a.mealBg,     color: a.mealColor };
            return { bg: a.workBg, color: a.workColor };
        }

        function catEmoji(cat) {
            if (cat === 'work')     return '💻';
            if (cat === 'break')    return '☕';
            if (cat === 'personal') return '🎨';
            if (cat === 'health')   return '🏃';
            if (cat === 'meal')     return '🍽️';
            return '📌';
        }

        function fmtTime(h, m, use12) {
            if (!use12) {
                return (h < 10 ? '0' : '') + h + ':' + (m === 0 ? '00' : (m < 10 ? '0' : '') + m);
            }
            var ampm = h >= 12 ? 'PM' : 'AM';
            var hh = h % 12 || 12;
            return hh + ':' + (m === 0 ? '00' : (m < 10 ? '0' : '') + m) + ' ' + ampm;
        }

        // ── render schedule preview ────────────────────────────────────
        function renderSchedule(a) {
            var hourStart  = a.hourStart || 6;
            var hourEnd    = a.hourEnd   || 22;
            var hourHeight = a.hourHeight || 60;
            var totalHours = Math.max(hourEnd - hourStart, 1);
            var totalHeight = totalHours * hourHeight;
            var timeColW = 68;
            var fontSize = a.fontSize || 13;

            // Hour grid lines + time labels
            var hourRows = [];
            for (var h = hourStart; h <= hourEnd; h++) {
                var y = (h - hourStart) * hourHeight;
                hourRows.push(
                    el('div', { key: h, style: { position: 'absolute', top: y + 'px', left: '0', right: '0', display: 'flex', alignItems: 'flex-start' } },
                        // Time label
                        el('div', {
                            style: {
                                width: timeColW + 'px', flexShrink: '0',
                                color: a.timeColor || '#475569',
                                fontSize: (fontSize - 1) + 'px',
                                paddingRight: '10px',
                                textAlign: 'right', lineHeight: '1',
                                transform: 'translateY(-7px)', userSelect: 'none'
                            }
                        }, fmtTime(h, 0, a.use12Hour)),
                        // Grid line
                        a.showGridLines ? el('div', {
                            style: {
                                flex: '1', height: '1px', background: a.gridLineColor || '#1e293b',
                                marginTop: '0'
                            }
                        }) : null
                    )
                );
            }

            // Event blocks
            var eventEls = (a.events || []).map(function (ev, idx) {
                var top  = ((ev.startHour - hourStart) + (ev.startMin / 60)) * hourHeight;
                var h    = (ev.duration / 60) * hourHeight;
                var cc   = catColors(ev.category, a);
                var endH = ev.startHour + Math.floor((ev.startMin + ev.duration) / 60);
                var endM = (ev.startMin + ev.duration) % 60;

                var timeStr = a.showEventTime
                    ? fmtTime(ev.startHour, ev.startMin, a.use12Hour) + ' – ' + fmtTime(endH, endM, a.use12Hour)
                    : null;

                return el('div', {
                    key: idx,
                    style: {
                        position: 'absolute',
                        top: top + 'px',
                        left: (timeColW + 4) + 'px',
                        right: '0',
                        height: Math.max(h - 4, 20) + 'px',
                        background: cc.bg,
                        borderRadius: '6px',
                        padding: '4px 8px',
                        overflow: 'hidden',
                        boxSizing: 'border-box',
                        borderLeft: '3px solid ' + cc.color
                    }
                },
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: '5px' } },
                        el('span', { style: { fontSize: '13px' } }, catEmoji(ev.category)),
                        el('span', { style: { color: cc.color, fontSize: fontSize + 'px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, ev.title)
                    ),
                    timeStr ? el('div', { style: { color: cc.color, fontSize: (a.timeFontSize || (fontSize - 2)) + 'px', opacity: '.8', marginTop: '1px' } }, timeStr) : null,
                    (a.showEventNote && ev.note && h > 48) ? el('div', { style: { color: cc.color, fontSize: (a.timeFontSize || (fontSize - 2)) + 'px', opacity: '.65', marginTop: '2px' } }, ev.note) : null
                );
            });

            return el('div', {
                style: {
                    position: 'relative',
                    height: totalHeight + 20 + 'px',
                    padding: '10px 12px 16px'
                }
            }, hourRows, eventEls);
        }

        // ── edit ──────────────────────────────────────────────────────
        function Edit(props) {
            var a   = props.attributes;
            var set = props.setAttributes;

            var HOUR_OPTIONS = [];
            for (var i = 0; i <= 23; i++) {
                HOUR_OPTIONS.push({ value: i, label: fmtTime(i, 0, a.use12Hour) });
            }

            var colorSettings = [
                { label: __('Background'),   value: a.bgColor,       onChange: function (v) { set({ bgColor: v || '#0f172a' }); } },
                { label: __('Header BG'),    value: a.headerBg,      onChange: function (v) { set({ headerBg: v || '#1e293b' }); } },
                { label: __('Border'),       value: a.borderColor,   onChange: function (v) { set({ borderColor: v || '#1e293b' }); } },
                { label: __('Title'),        value: a.titleColor,    onChange: function (v) { set({ titleColor: v || '#f8fafc' }); } },
                { label: __('Time labels'),  value: a.timeColor,     onChange: function (v) { set({ timeColor: v || '#475569' }); } },
                { label: __('Grid lines'),   value: a.gridLineColor, onChange: function (v) { set({ gridLineColor: v || '#1e293b' }); } },
                { label: __('Work BG'),      value: a.workBg,        onChange: function (v) { set({ workBg: v || '#1e3a5f' }); } },
                { label: __('Work text'),    value: a.workColor,     onChange: function (v) { set({ workColor: v || '#93c5fd' }); } },
                { label: __('Break BG'),     value: a.breakBg,       onChange: function (v) { set({ breakBg: v || '#14532d' }); } },
                { label: __('Break text'),   value: a.breakColor,    onChange: function (v) { set({ breakColor: v || '#86efac' }); } },
                { label: __('Personal BG'),  value: a.personalBg,    onChange: function (v) { set({ personalBg: v || '#3b0764' }); } },
                { label: __('Personal text'),value: a.personalColor, onChange: function (v) { set({ personalColor: v || '#c4b5fd' }); } },
                { label: __('Health BG'),    value: a.healthBg,      onChange: function (v) { set({ healthBg: v || '#431407' }); } },
                { label: __('Health text'),  value: a.healthColor,   onChange: function (v) { set({ healthColor: v || '#fdba74' }); } },
                { label: __('Meal BG'),      value: a.mealBg,        onChange: function (v) { set({ mealBg: v || '#451a03' }); } },
                { label: __('Meal text'),    value: a.mealColor,     onChange: function (v) { set({ mealColor: v || '#fde68a' }); } },
            ];

            function fmtTimeLocal(h, m) { return fmtTime(h, m, a.use12Hour); }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Schedule Settings'), initialOpen: true },
                    el(TextControl, {
                        label: __('Day title'), value: a.dayTitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ dayTitle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show title'), checked: a.showTitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showTitle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Day starts at'), value: a.hourStart, options: HOUR_OPTIONS, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ hourStart: parseInt(v, 10) }); }
                    }),
                    el(SelectControl, {
                        label: __('Day ends at'), value: a.hourEnd, options: HOUR_OPTIONS, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ hourEnd: parseInt(v, 10) }); }
                    }),
                    el(ToggleControl, {
                        label: __('12-hour clock'), checked: a.use12Hour, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ use12Hour: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Hour height (px)'), value: a.hourHeight, min: 30, max: 120, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ hourHeight: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show grid lines'), checked: a.showGridLines, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showGridLines: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show event times'), checked: a.showEventTime, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showEventTime: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show event notes'), checked: a.showEventNote, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showEventNote: v }); }
                    })
                ),
                el(PanelBody, { title: __('Typography'), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Title'), typo: a.typoTitle || {}, onChange: function(v) { set({ typoTitle: v }); } }),
                    el(RangeControl, {
                        label: __('Body size'), value: a.fontSize, min: 10, max: 20, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ fontSize: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Event time font size'), value: a.timeFontSize, min: 9, max: 16, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ timeFontSize: v }); }
                    })
                ),
                el(PanelBody, { title: __('Style'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Border radius'), value: a.borderRadius, min: 0, max: 30, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ borderRadius: v }); }
                    })
                ),
                el(PanelBody, { title: __('Events (' + a.events.length + ')'), initialOpen: false },
                    a.events.map(function (ev, idx) {
                        return el(PanelBody, {
                            key: idx,
                            title: catEmoji(ev.category) + ' ' + ev.title.substring(0, 28),
                            initialOpen: false
                        },
                            el(TextControl, {
                                label: __('Title'), value: ev.title, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ events: upd(a.events, idx, 'title', v) }); }
                            }),
                            el(SelectControl, {
                                label: __('Category'), value: ev.category, options: CATEGORY_OPTIONS, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ events: upd(a.events, idx, 'category', v) }); }
                            }),
                            el(SelectControl, {
                                label: __('Start hour'), value: ev.startHour, options: HOUR_OPTIONS, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ events: upd(a.events, idx, 'startHour', parseInt(v, 10)) }); }
                            }),
                            el(SelectControl, {
                                label: __('Start minute'),
                                value: ev.startMin,
                                options: [{ value: 0, label: ':00' }, { value: 15, label: ':15' }, { value: 30, label: ':30' }, { value: 45, label: ':45' }],
                                __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ events: upd(a.events, idx, 'startMin', parseInt(v, 10)) }); }
                            }),
                            el(RangeControl, {
                                label: __('Duration (min)'), value: ev.duration, min: 15, max: 480, step: 15, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ events: upd(a.events, idx, 'duration', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Note (optional)'), value: ev.note || '', __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ events: upd(a.events, idx, 'note', v) }); }
                            }),
                            el(Button, {
                                variant: 'secondary', isDestructive: true, __nextHasNoMarginBottom: true,
                                onClick: function () { var n = a.events.slice(); n.splice(idx, 1); set({ events: n }); }
                            }, __('Remove event'))
                        );
                    }),
                    el(Button, {
                        variant: 'primary', __nextHasNoMarginBottom: true,
                        onClick: function () {
                            set({ events: a.events.concat([{ title: 'New Event', startHour: 9, startMin: 0, duration: 60, category: 'work', note: '' }]) });
                        }
                    }, __('+ Add event'))
                ),
                el(PanelColorSettings, {
                    title: __('Colors'),
                    initialOpen: false,
                    colorSettings: colorSettings
                })
            );

            // Header
            var header = a.showTitle ? el('div', {
                style: {
                    padding: '18px 20px 14px', background: a.headerBg,
                    borderBottom: '1px solid ' + a.borderColor
                }
            },
                el('h2', { className: 'bkbg-ds-title', style: { color: a.titleColor, margin: '0' } }, a.dayTitle),
                // Category legend
                el('div', { style: { display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' } },
                    CATEGORY_OPTIONS.map(function (opt) {
                        var cc = catColors(opt.value, a);
                        return el('span', {
                            key: opt.value,
                            style: {
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                background: cc.bg, color: cc.color,
                                borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '600'
                            }
                        }, catEmoji(opt.value), opt.label);
                    })
                )
            ) : null;

            return el(Fragment, {},
                inspector,
                el('div', Object.assign({}, useBlockProps(), {
                    style: Object.assign({
                        background: a.bgColor, border: '1px solid ' + a.borderColor,
                        borderRadius: a.borderRadius + 'px', overflow: 'hidden',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                    },
                    { '--bkbg-ds-ttl-fs': (a.titleFontSize || 22) + 'px' },
                    _tv(a.typoTitle, '--bkbg-ds-ttl-'))
                }), header, renderSchedule(a))
            );
        }

        function fmtTime(h, m, use12) {
            if (!use12) {
                return (h < 10 ? '0' : '') + h + ':' + (m === 0 ? '00' : (m < 10 ? '0' : '') + m);
            }
            var ampm = h >= 12 ? 'PM' : 'AM';
            var hh = h % 12 || 12;
            return hh + ':' + (m === 0 ? '00' : (m < 10 ? '0' : '') + m) + ' ' + ampm;
        }

        function catColors(cat, a) {
            if (cat === 'work')     return { bg: a.workBg,     color: a.workColor };
            if (cat === 'break')    return { bg: a.breakBg,    color: a.breakColor };
            if (cat === 'personal') return { bg: a.personalBg, color: a.personalColor };
            if (cat === 'health')   return { bg: a.healthBg,   color: a.healthColor };
            if (cat === 'meal')     return { bg: a.mealBg,     color: a.mealColor };
            return { bg: a.workBg, color: a.workColor };
        }

        function catEmoji(cat) {
            if (cat === 'work')     return '💻';
            if (cat === 'break')    return '☕';
            if (cat === 'personal') return '🎨';
            if (cat === 'health')   return '🏃';
            if (cat === 'meal')     return '🍽️';
            return '📌';
        }

        registerBlockType('blockenberg/daily-schedule', {
            edit: Edit,
            save: function (props) {
                return el('div', useBlockProps.save(),
                    el('div', { className: 'bkbg-daily-schedule-app', 'data-opts': JSON.stringify(props.attributes) })
                );
            }
        });
})();
