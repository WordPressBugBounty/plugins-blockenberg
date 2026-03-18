( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
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

    var _cdTC, _cdTV;
    function _tc() { return _cdTC || (_cdTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _cdTV || (_cdTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    // Calculate time remaining
    function getTimeRemaining(targetDate, targetTime) {
        if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
        
        var target = new Date(targetDate + 'T' + (targetTime || '00:00') + ':00');
        var now = new Date();
        var total = target - now;

        if (total <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
        }

        return {
            days: Math.floor(total / (1000 * 60 * 60 * 24)),
            hours: Math.floor((total / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((total / (1000 * 60)) % 60),
            seconds: Math.floor((total / 1000) % 60),
            total: total
        };
    }

    // Pad number with leading zero
    function pad(num) {
        return num < 10 ? '0' + num : String(num);
    }

    // Get default date (7 days from now)
    function getDefaultDate() {
        var d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString().split('T')[0];
    }

    registerBlockType('blockenberg/countdown', {
        title: __('Countdown', 'blockenberg'),
        icon: 'clock',
        category: 'bkbg-effects',
        description: __('Display a countdown timer to a specific date and time.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            // State for live countdown in editor
            var timeState = useState(function () {
                return getTimeRemaining(a.targetDate || getDefaultDate(), a.targetTime);
            });
            var time = timeState[0];
            var setTime = timeState[1];

            // State for editing
            var editingState = useState(null);
            var editing = editingState[0];
            var setEditing = editingState[1];

            // Ref for evergreen simulation start time
            var evergreenStartRef = wp.element.useRef(null);

            // Update countdown every second in editor
            useEffect(function () {
                var targetDate = a.targetDate || getDefaultDate();
                
                // Set default date if not set and not evergreen
                if (!a.targetDate && !a.evergreenMode) {
                    setAttributes({ targetDate: targetDate });
                }

                // For evergreen, set up simulation start time
                if (a.evergreenMode && !evergreenStartRef.current) {
                    evergreenStartRef.current = Date.now();
                }
                if (!a.evergreenMode) {
                    evergreenStartRef.current = null;
                }

                // Calculate time remaining
                function updateTime() {
                    if (a.evergreenMode) {
                        // Calculate total duration in ms
                        var totalDuration = (a.evergreenDays * 24 * 60 * 60 * 1000) + 
                                           (a.evergreenHours * 60 * 60 * 1000) + 
                                           (a.evergreenMinutes * 60 * 1000);
                        
                        // Calculate elapsed time since simulation started
                        var elapsed = Date.now() - evergreenStartRef.current;
                        var remaining = Math.max(0, totalDuration - elapsed);
                        
                        // If expired, restart simulation
                        if (remaining <= 0) {
                            evergreenStartRef.current = Date.now();
                            remaining = totalDuration;
                        }
                        
                        var days = Math.floor(remaining / (1000 * 60 * 60 * 24));
                        var hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
                        var minutes = Math.floor((remaining / (1000 * 60)) % 60);
                        var seconds = Math.floor((remaining / 1000) % 60);
                        setTime({ days: days, hours: hours, minutes: minutes, seconds: seconds, total: remaining });
                    } else {
                        setTime(getTimeRemaining(targetDate, a.targetTime));
                    }
                }

                var interval = setInterval(updateTime, 1000);
                updateTime();

                return function () { clearInterval(interval); };
            }, [a.targetDate, a.targetTime, a.evergreenMode, a.evergreenDays, a.evergreenHours, a.evergreenMinutes]);

            var layoutOptions = [
                { label: __('Cards', 'blockenberg'), value: 'cards' },
                { label: __('Inline', 'blockenberg'), value: 'inline' },
                { label: __('Minimal', 'blockenberg'), value: 'minimal' },
                { label: __('Circle', 'blockenberg'), value: 'circle' }
            ];

            var expiredOptions = [
                { label: __('Show Message', 'blockenberg'), value: 'message' },
                { label: __('Hide Block', 'blockenberg'), value: 'hide' },
                { label: __('Redirect', 'blockenberg'), value: 'redirect' },
                { label: __('Keep Last State', 'blockenberg'), value: 'keep' }
            ];

            var fontWeightOptions = [
                { label: '400', value: 400 },
                { label: '500', value: 500 },
                { label: '600', value: 600 },
                { label: '700', value: 700 },
                { label: '800', value: 800 }
            ];

            // Inspector controls
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Date & Time', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Evergreen Mode', 'blockenberg'),
                        help: a.evergreenMode ? __('Countdown resets for each visitor', 'blockenberg') : __('Fixed date countdown', 'blockenberg'),
                        checked: a.evergreenMode,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { 
                            setAttributes({ evergreenMode: v }); 
                            // Generate unique ID for evergreen
                            if (v && !a.evergreenId) {
                                setAttributes({ evergreenId: 'eg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9) });
                            }
                        }
                    }),
                    !a.evergreenMode && el('div', { className: 'bkbg-cd-date-control' },
                        el('label', {}, __('Target Date', 'blockenberg')),
                        el('input', {
                            type: 'date',
                            value: a.targetDate,
                            onChange: function (e) { setAttributes({ targetDate: e.target.value }); },
                            className: 'components-text-control__input'
                        })
                    ),
                    !a.evergreenMode && el('div', { className: 'bkbg-cd-date-control', style: { marginTop: '12px' } },
                        el('label', {}, __('Target Time', 'blockenberg')),
                        el('input', {
                            type: 'time',
                            value: a.targetTime,
                            onChange: function (e) { setAttributes({ targetTime: e.target.value }); },
                            className: 'components-text-control__input'
                        })
                    ),
                    a.evergreenMode && el(RangeControl, {
                        label: __('Days', 'blockenberg'),
                        value: a.evergreenDays,
                        min: 0,
                        max: 30,
                        onChange: function (v) { setAttributes({ evergreenDays: v }); }
                    }),
                    a.evergreenMode && el(RangeControl, {
                        label: __('Hours', 'blockenberg'),
                        value: a.evergreenHours,
                        min: 0,
                        max: 23,
                        onChange: function (v) { setAttributes({ evergreenHours: v }); }
                    }),
                    a.evergreenMode && el(RangeControl, {
                        label: __('Minutes', 'blockenberg'),
                        value: a.evergreenMinutes,
                        min: 0,
                        max: 59,
                        onChange: function (v) { setAttributes({ evergreenMinutes: v }); }
                    })
                ),

                el(PanelBody, { title: __('Display Options', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Layout Style', 'blockenberg'),
                        value: a.layoutStyle,
                        options: layoutOptions,
                        onChange: function (v) { setAttributes({ layoutStyle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Title', 'blockenberg'),
                        checked: a.showTitle,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showTitle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Days', 'blockenberg'),
                        checked: a.showDays,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showDays: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Hours', 'blockenberg'),
                        checked: a.showHours,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showHours: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Minutes', 'blockenberg'),
                        checked: a.showMinutes,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showMinutes: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Seconds', 'blockenberg'),
                        checked: a.showSeconds,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showSeconds: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Labels', 'blockenberg'),
                        checked: a.showLabels,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showLabels: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Separators', 'blockenberg'),
                        checked: a.showSeparators,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showSeparators: v }); }
                    })
                ),

                el(PanelBody, { title: __('Labels', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Days Label', 'blockenberg'),
                        value: a.labelDays,
                        onChange: function (v) { setAttributes({ labelDays: v }); }
                    }),
                    el(TextControl, {
                        label: __('Hours Label', 'blockenberg'),
                        value: a.labelHours,
                        onChange: function (v) { setAttributes({ labelHours: v }); }
                    }),
                    el(TextControl, {
                        label: __('Minutes Label', 'blockenberg'),
                        value: a.labelMinutes,
                        onChange: function (v) { setAttributes({ labelMinutes: v }); }
                    }),
                    el(TextControl, {
                        label: __('Seconds Label', 'blockenberg'),
                        value: a.labelSeconds,
                        onChange: function (v) { setAttributes({ labelSeconds: v }); }
                    })
                ),

                el(PanelBody, { title: __('Expiration', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('When Expired', 'blockenberg'),
                        value: a.expiredAction,
                        options: expiredOptions,
                        onChange: function (v) { setAttributes({ expiredAction: v }); }
                    }),
                    a.expiredAction === 'message' && el(TextControl, {
                        label: __('Expired Message', 'blockenberg'),
                        value: a.expiredMessage,
                        onChange: function (v) { setAttributes({ expiredMessage: v }); }
                    }),
                    a.expiredAction === 'redirect' && el(TextControl, {
                        label: __('Redirect URL', 'blockenberg'),
                        value: a.expiredRedirectUrl,
                        onChange: function (v) { setAttributes({ expiredRedirectUrl: v }); }
                    })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Digit', 'blockenberg'), value: a.typoDigit, onChange: function (v) { setAttributes({ typoDigit: v }); } }),
                    _tc() && el(_tc(), { label: __('Label', 'blockenberg'), value: a.typoLabel, onChange: function (v) { setAttributes({ typoLabel: v }); } }),
                    _tc() && el(_tc(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } })
                ),

                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Container Padding', 'blockenberg'),
                        value: a.padding,
                        min: 0,
                        max: 60,
                        onChange: function (v) { setAttributes({ padding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap Between Units', 'blockenberg'),
                        value: a.gap,
                        min: 8,
                        max: 48,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Digit Box Padding', 'blockenberg'),
                        value: a.digitPadding,
                        min: 8,
                        max: 40,
                        onChange: function (v) { setAttributes({ digitPadding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Container Radius', 'blockenberg'),
                        value: a.borderRadius,
                        min: 0,
                        max: 30,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Digit Box Radius', 'blockenberg'),
                        value: a.digitRadius,
                        min: 0,
                        max: 24,
                        onChange: function (v) { setAttributes({ digitRadius: v }); }
                    })
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.wrapBg, onChange: function (c) { setAttributes({ wrapBg: c }); }, label: __('Background', 'blockenberg') },
                        { value: a.digitBg, onChange: function (c) { setAttributes({ digitBg: c }); }, label: __('Digit Background', 'blockenberg') },
                        { value: a.digitColor, onChange: function (c) { setAttributes({ digitColor: c }); }, label: __('Digit Color', 'blockenberg') },
                        { value: a.labelColor, onChange: function (c) { setAttributes({ labelColor: c }); }, label: __('Label Color', 'blockenberg') },
                        { value: a.separatorColor, onChange: function (c) { setAttributes({ separatorColor: c }); }, label: __('Separator Color', 'blockenberg') },
                        { value: a.titleColor, onChange: function (c) { setAttributes({ titleColor: c }); }, label: __('Title Color', 'blockenberg') }
                    ]
                })
            );

            // CSS variables
            var wrapStyle = {
                '--bkbg-cd-wrap-bg': a.wrapBg,
                '--bkbg-cd-digit-bg': a.digitBg,
                '--bkbg-cd-digit-color': a.digitColor,
                '--bkbg-cd-label-color': a.labelColor,
                '--bkbg-cd-separator-color': a.separatorColor,
                '--bkbg-cd-title-color': a.titleColor,
                '--bkbg-cd-digit-size': a.digitFontSize + 'px',
                '--bkbg-cd-digit-weight': a.digitFontWeight,
                '--bkbg-cd-label-size': a.labelFontSize + 'px',
                '--bkbg-cd-label-weight': a.labelFontWeight,
                '--bkbg-cd-title-size': a.titleFontSize + 'px',
                '--bkbg-cd-padding': a.padding + 'px',
                '--bkbg-cd-gap': a.gap + 'px',
                '--bkbg-cd-radius': a.borderRadius + 'px',
                '--bkbg-cd-digit-padding': a.digitPadding + 'px',
                '--bkbg-cd-digit-radius': a.digitRadius + 'px'
            };

            // Build time units
            var units = [];

            if (a.showDays) {
                units.push({ key: 'days', value: time.days, label: a.labelDays });
            }
            if (a.showHours) {
                units.push({ key: 'hours', value: time.hours, label: a.labelHours });
            }
            if (a.showMinutes) {
                units.push({ key: 'minutes', value: time.minutes, label: a.labelMinutes });
            }
            if (a.showSeconds) {
                units.push({ key: 'seconds', value: time.seconds, label: a.labelSeconds });
            }

            // Title element
            var titleEl = null;
            if (a.showTitle) {
                if (editing === 'title') {
                    titleEl = el('input', {
                        type: 'text',
                        className: 'bkbg-cd-title bkbg-cd-input-active',
                        value: a.title,
                        autoFocus: true,
                        placeholder: __('Countdown Title', 'blockenberg'),
                        onChange: function (e) { setAttributes({ title: e.target.value }); },
                        onBlur: function () { setEditing(null); },
                        onKeyDown: function (e) { if (e.key === 'Enter') setEditing(null); }
                    });
                } else {
                    titleEl = el('div', {
                        className: 'bkbg-cd-title bkbg-cd-clickable',
                        onClick: function () { setEditing('title'); }
                    }, a.title || __('Countdown Title', 'blockenberg'));
                }
            }

            // Build countdown units
            var countdownUnits = units.map(function (unit, index) {
                var isLast = index === units.length - 1;
                var labelKey = 'label-' + unit.key;
                var valueStr = pad(unit.value);

                // Label element - click to edit
                var labelEl = null;
                if (a.showLabels) {
                    if (editing === labelKey) {
                        labelEl = el('input', {
                            type: 'text',
                            className: 'bkbg-cd-label bkbg-cd-input-active',
                            value: unit.label,
                            autoFocus: true,
                            onChange: function (e) {
                                var attr = 'label' + unit.key.charAt(0).toUpperCase() + unit.key.slice(1);
                                var obj = {};
                                obj[attr] = e.target.value;
                                setAttributes(obj);
                            },
                            onBlur: function () { setEditing(null); },
                            onKeyDown: function (e) { if (e.key === 'Enter') setEditing(null); }
                        });
                    } else {
                        labelEl = el('span', {
                            className: 'bkbg-cd-label bkbg-cd-clickable',
                            onClick: function () { setEditing(labelKey); }
                        }, unit.label);
                    }
                }

                return el(Fragment, { key: unit.key },
                    el('div', { className: 'bkbg-cd-unit' },
                        el('div', { className: 'bkbg-cd-digit' },
                            el('span', { className: 'bkbg-cd-number' }, valueStr)
                        ),
                        labelEl
                    ),
                    a.showSeparators && !isLast && el('span', { className: 'bkbg-cd-separator' }, ':')
                );
            });

            var blockProps = useBlockProps({
                className: 'bkbg-editor-wrap',
                'data-block-label': 'Countdown'
            });

            return el('div', blockProps,
                inspector,
                el('div', {
                    className: 'bkbg-cd-wrap',
                    style: wrapStyle,
                    'data-layout': a.layoutStyle
                },
                    titleEl,
                    el('div', { className: 'bkbg-cd-countdown' }, countdownUnits)
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            var wrapStyle = Object.assign({
                '--bkbg-cd-wrap-bg': a.wrapBg,
                '--bkbg-cd-digit-bg': a.digitBg,
                '--bkbg-cd-digit-color': a.digitColor,
                '--bkbg-cd-label-color': a.labelColor,
                '--bkbg-cd-separator-color': a.separatorColor,
                '--bkbg-cd-title-color': a.titleColor,
                '--bkbg-cd-digit-size': a.digitFontSize + 'px',
                '--bkbg-cd-digit-weight': a.digitFontWeight,
                '--bkbg-cd-label-size': a.labelFontSize + 'px',
                '--bkbg-cd-label-weight': a.labelFontWeight,
                '--bkbg-cd-title-size': a.titleFontSize + 'px',
                '--bkbg-cd-padding': a.padding + 'px',
                '--bkbg-cd-gap': a.gap + 'px',
                '--bkbg-cd-radius': a.borderRadius + 'px',
                '--bkbg-cd-digit-padding': a.digitPadding + 'px',
                '--bkbg-cd-digit-radius': a.digitRadius + 'px'
            }, _tv(a.typoDigit, '--bkbg-cd-dig-'), _tv(a.typoLabel, '--bkbg-cd-lbl-'), _tv(a.typoTitle, '--bkbg-cd-ttl-'));

            // Build units config as data attributes
            var unitsConfig = [];
            if (a.showDays) unitsConfig.push('days:' + a.labelDays);
            if (a.showHours) unitsConfig.push('hours:' + a.labelHours);
            if (a.showMinutes) unitsConfig.push('minutes:' + a.labelMinutes);
            if (a.showSeconds) unitsConfig.push('seconds:' + a.labelSeconds);

            // Calculate evergreen duration in milliseconds
            var evergreenDuration = (a.evergreenDays * 24 * 60 * 60 * 1000) + 
                                    (a.evergreenHours * 60 * 60 * 1000) + 
                                    (a.evergreenMinutes * 60 * 1000);

            return el('div', {
                className: 'bkbg-cd-wrap',
                style: wrapStyle,
                'data-layout': a.layoutStyle,
                'data-target': a.evergreenMode ? '' : (a.targetDate + 'T' + a.targetTime),
                'data-units': unitsConfig.join('|'),
                'data-show-labels': a.showLabels ? '1' : '0',
                'data-show-separators': a.showSeparators ? '1' : '0',
                'data-expired-action': a.expiredAction,
                'data-expired-message': a.expiredMessage,
                'data-expired-redirect': a.expiredRedirectUrl,
                'data-evergreen': a.evergreenMode ? '1' : '0',
                'data-evergreen-duration': String(evergreenDuration),
                'data-evergreen-id': a.evergreenId
            },
                a.showTitle && a.title && el('div', { className: 'bkbg-cd-title' }, a.title),
                el('div', { className: 'bkbg-cd-countdown' })
            );
        }
    });
}() );
