( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var useRef = wp.element.useRef;
    var useEffect = wp.element.useEffect;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

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

    // Convert 24h to 12h format
    function to12h(time) {
        if (!time) return '';
        var parts = time.split(':');
        var h = parseInt(parts[0], 10);
        var m = parts[1];
        var ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return h + ':' + m + ' ' + ampm;
    }

    // Get current day index (0 = Monday)
    function getTodayIndex() {
        var jsDay = new Date().getDay();
        return jsDay === 0 ? 6 : jsDay - 1;
    }

    registerBlockType('blockenberg/business-hours', {
        title: __('Business Hours', 'blockenberg'),
        icon: 'calendar-alt',
        category: 'bkbg-business',
        description: __('Display business opening hours with current status indicator.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            // Track which field is being edited: null, 'title', 'day-0', 'time-0', etc.
            var editingState = useState(null);
            var editing = editingState[0];
            var setEditing = editingState[1];

            var todayIndex = getTodayIndex();

            // Update day field
            function updateDay(index, field, value) {
                var newDays = a.days.map(function (d, i) {
                    if (i === index) {
                        var updated = Object.assign({}, d);
                        updated[field] = value;
                        return updated;
                    }
                    return d;
                });
                setAttributes({ days: newDays });
            }

            // Format time for display
            function formatTime(time) {
                if (!time) return '--:--';
                return a.timeFormat === '12h' ? to12h(time) : time;
            }

            var layoutOptions = [
                { label: __('List', 'blockenberg'), value: 'list' },
                { label: __('Cards', 'blockenberg'), value: 'cards' }
            ];

            var timeFormatOptions = [
                { label: __('12 Hour (9:00 AM)', 'blockenberg'), value: '12h' },
                { label: __('24 Hour (09:00)', 'blockenberg'), value: '24h' }
            ];

            // Inspector
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('General', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Title', 'blockenberg'),
                        checked: a.showTitle,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showTitle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Current Status', 'blockenberg'),
                        checked: a.showCurrentStatus,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showCurrentStatus: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Highlight Today', 'blockenberg'),
                        checked: a.highlightToday,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ highlightToday: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Dividers', 'blockenberg'),
                        checked: a.showDividers,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showDividers: v }); }
                    })
                ),

                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'),
                        value: a.layoutStyle,
                        options: layoutOptions,
                        onChange: function (v) { setAttributes({ layoutStyle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Time Format', 'blockenberg'),
                        value: a.timeFormat,
                        options: timeFormatOptions,
                        onChange: function (v) { setAttributes({ timeFormat: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding', 'blockenberg'),
                        value: a.padding,
                        min: 8,
                        max: 32,
                        onChange: function (v) { setAttributes({ padding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap', 'blockenberg'),
                        value: a.gap,
                        min: 4,
                        max: 24,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.borderRadius,
                        min: 0,
                        max: 20,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    })
                ),

                el(PanelBody, { title: __('Labels', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Closed Text', 'blockenberg'),
                        value: a.closedText,
                        onChange: function (v) { setAttributes({ closedText: v }); }
                    }),
                    el(TextControl, {
                        label: __('Open Now Text', 'blockenberg'),
                        value: a.openNowText,
                        onChange: function (v) { setAttributes({ openNowText: v }); }
                    }),
                    el(TextControl, {
                        label: __('Closed Now Text', 'blockenberg'),
                        value: a.closedNowText,
                        onChange: function (v) { setAttributes({ closedNowText: v }); }
                    })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                    el(getTypographyControl(), { label: __('Day Name', 'blockenberg'), value: a.typoDay, onChange: function (v) { setAttributes({ typoDay: v }); } }),
                    el(getTypographyControl(), { label: __('Time', 'blockenberg'), value: a.typoTime, onChange: function (v) { setAttributes({ typoTime: v }); } })
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.dayBg, onChange: function (c) { setAttributes({ dayBg: c }); }, label: __('Background', 'blockenberg') },
                        { value: a.dayColor, onChange: function (c) { setAttributes({ dayColor: c }); }, label: __('Day Text', 'blockenberg') },
                        { value: a.timeColor, onChange: function (c) { setAttributes({ timeColor: c }); }, label: __('Time Text', 'blockenberg') },
                        { value: a.dividerColor, onChange: function (c) { setAttributes({ dividerColor: c }); }, label: __('Divider', 'blockenberg') }
                    ]
                }),

                el(PanelColorSettings, {
                    title: __('Status Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.todayBg, onChange: function (c) { setAttributes({ todayBg: c }); }, label: __('Today Background', 'blockenberg') },
                        { value: a.todayColor, onChange: function (c) { setAttributes({ todayColor: c }); }, label: __('Today Text', 'blockenberg') },
                        { value: a.openColor, onChange: function (c) { setAttributes({ openColor: c }); }, label: __('Open Status', 'blockenberg') },
                        { value: a.closedColor, onChange: function (c) { setAttributes({ closedColor: c }); }, label: __('Closed Status', 'blockenberg') }
                    ]
                })
            );

            // CSS variables
            var wrapStyle = Object.assign({
                '--bkbg-bh-day-bg': a.dayBg,
                '--bkbg-bh-day-color': a.dayColor,
                '--bkbg-bh-time-color': a.timeColor,
                '--bkbg-bh-today-bg': a.todayBg,
                '--bkbg-bh-today-color': a.todayColor,
                '--bkbg-bh-open-color': a.openColor,
                '--bkbg-bh-closed-color': a.closedColor,
                '--bkbg-bh-divider-color': a.dividerColor,
                '--bkbg-bh-radius': a.borderRadius + 'px',
                '--bkbg-bh-padding': a.padding + 'px',
                '--bkbg-bh-gap': a.gap + 'px'
            }, _tv(a.typoTitle, '--bkbg-bh-title-'), _tv(a.typoDay, '--bkbg-bh-day-'), _tv(a.typoTime, '--bkbg-bh-time-'));

            // Title - click to edit
            var titleEl = null;
            if (a.showTitle) {
                if (editing === 'title') {
                    titleEl = el('input', {
                        type: 'text',
                        className: 'bkbg-bh-title bkbg-bh-input-active',
                        value: a.title,
                        autoFocus: true,
                        onChange: function (e) { setAttributes({ title: e.target.value }); },
                        onBlur: function () { setEditing(null); },
                        onKeyDown: function (e) { if (e.key === 'Enter') setEditing(null); },
                        placeholder: __('Business Hours', 'blockenberg')
                    });
                } else {
                    titleEl = el('div', {
                        className: 'bkbg-bh-title bkbg-bh-clickable',
                        onClick: function () { setEditing('title'); }
                    }, a.title || __('Business Hours', 'blockenberg'));
                }
            }

            // Build rows - WYSIWYG style
            var rows = a.days.map(function (day, index) {
                var isToday = index === todayIndex;
                var rowClass = 'bkbg-bh-row' + (isToday && a.highlightToday ? ' is-today' : '');
                var dayKey = 'day-' + index;
                var timeKey = 'time-' + index;

                // Day name - click to edit
                var dayNameEl;
                if (editing === dayKey) {
                    dayNameEl = el('input', {
                        type: 'text',
                        className: 'bkbg-bh-day-name bkbg-bh-input-active',
                        value: day.day,
                        autoFocus: true,
                        onChange: function (e) { updateDay(index, 'day', e.target.value); },
                        onBlur: function () { setEditing(null); },
                        onKeyDown: function (e) { if (e.key === 'Enter') setEditing(null); }
                    });
                } else {
                    dayNameEl = el('span', {
                        className: 'bkbg-bh-day-name bkbg-bh-clickable',
                        onClick: function () { setEditing(dayKey); }
                    }, day.day);
                }

                // Time - click to edit
                var timeEl;
                if (editing === timeKey) {
                    // Show time inputs when editing
                    timeEl = el('div', { className: 'bkbg-bh-time-editing' },
                        el('label', { className: 'bkbg-bh-closed-check' },
                            el('input', {
                                type: 'checkbox',
                                checked: day.closed,
                                onChange: function (e) { updateDay(index, 'closed', e.target.checked); }
                            }),
                            el('span', {}, a.closedText)
                        ),
                        !day.closed && el('div', { className: 'bkbg-bh-time-inputs' },
                            el('input', {
                                type: 'time',
                                value: day.open,
                                onChange: function (e) { updateDay(index, 'open', e.target.value); }
                            }),
                            el('span', {}, '–'),
                            el('input', {
                                type: 'time',
                                value: day.close,
                                onChange: function (e) { updateDay(index, 'close', e.target.value); }
                            })
                        ),
                        el('button', {
                            className: 'bkbg-bh-done-btn',
                            onClick: function () { setEditing(null); }
                        }, '✓')
                    );
                } else {
                    // Show formatted time as text
                    var timeText = day.closed ? a.closedText : formatTime(day.open) + ' – ' + formatTime(day.close);
                    timeEl = el('div', {
                        className: 'bkbg-bh-time bkbg-bh-clickable' + (day.closed ? ' is-closed' : ''),
                        onClick: function () { setEditing(timeKey); }
                    }, timeText);
                }

                return el('div', { className: rowClass, key: index },
                    el('div', { className: 'bkbg-bh-day' },
                        dayNameEl,
                        isToday && a.highlightToday && el('span', { className: 'bkbg-bh-today-badge' }, __('Today', 'blockenberg'))
                    ),
                    timeEl
                );
            });

            var blockProps = useBlockProps({
                className: 'bkbg-editor-wrap',
                'data-block-label': 'Business Hours'
            });

            return el('div', blockProps,
                inspector,
                el('div', {
                    className: 'bkbg-bh-wrap',
                    style: wrapStyle,
                    'data-layout': a.layoutStyle,
                    'data-dividers': a.showDividers ? '1' : '0'
                },
                    titleEl,
                    a.showCurrentStatus && el('div', { className: 'bkbg-bh-status is-open' },
                        el('span', { className: 'bkbg-bh-status-dot' }),
                        el('span', { className: 'bkbg-bh-status-text' }, a.openNowText)
                    ),
                    el('div', { className: 'bkbg-bh-list' }, rows)
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            function to12h(time) {
                if (!time) return '';
                var parts = time.split(':');
                var h = parseInt(parts[0], 10);
                var m = parts[1];
                var ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                return h + ':' + m + ' ' + ampm;
            }

            function formatTime(time) {
                if (!time) return '';
                return a.timeFormat === '12h' ? to12h(time) : time;
            }

            var wrapStyle = Object.assign({
                '--bkbg-bh-day-bg': a.dayBg,
                '--bkbg-bh-day-color': a.dayColor,
                '--bkbg-bh-time-color': a.timeColor,
                '--bkbg-bh-today-bg': a.todayBg,
                '--bkbg-bh-today-color': a.todayColor,
                '--bkbg-bh-open-color': a.openColor,
                '--bkbg-bh-closed-color': a.closedColor,
                '--bkbg-bh-divider-color': a.dividerColor,
                '--bkbg-bh-radius': a.borderRadius + 'px',
                '--bkbg-bh-padding': a.padding + 'px',
                '--bkbg-bh-gap': a.gap + 'px'
            }, _tv(a.typoTitle, '--bkbg-bh-title-'), _tv(a.typoDay, '--bkbg-bh-day-'), _tv(a.typoTime, '--bkbg-bh-time-'));

            var rows = a.days.map(function (day, index) {
                return el('div', {
                    className: 'bkbg-bh-row',
                    key: index,
                    'data-day': index,
                    'data-open': day.open,
                    'data-close': day.close,
                    'data-closed': day.closed ? '1' : '0'
                },
                    el('div', { className: 'bkbg-bh-day' },
                        el('span', { className: 'bkbg-bh-day-name' }, day.day)
                    ),
                    el('div', { className: 'bkbg-bh-time' },
                        day.closed
                            ? el('span', { className: 'bkbg-bh-closed-text' }, a.closedText)
                            : el('span', {}, formatTime(day.open) + ' – ' + formatTime(day.close))
                    )
                );
            });

            return el('div', {
                className: 'bkbg-bh-wrap',
                style: wrapStyle,
                'data-layout': a.layoutStyle,
                'data-dividers': a.showDividers ? '1' : '0',
                'data-highlight-today': a.highlightToday ? '1' : '0',
                'data-show-status': a.showCurrentStatus ? '1' : '0',
                'data-open-text': a.openNowText,
                'data-closed-text': a.closedNowText
            },
                a.showTitle && el('div', { className: 'bkbg-bh-title' }, a.title),
                a.showCurrentStatus && el('div', { className: 'bkbg-bh-status', 'data-status': '1' },
                    el('span', { className: 'bkbg-bh-status-dot' }),
                    el('span', { className: 'bkbg-bh-status-text' })
                ),
                el('div', { className: 'bkbg-bh-list' }, rows)
            );
        }
    });
}() );
