( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    var _dmTC, _dmTV;
    function _tc() { return _dmTC || (_dmTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _dmTV || (_dmTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    /* ── Preview component ─────────────────────────────────────────────────── */
    function TogglePreview(props) {
        var a = props.attrs;
        var isDark = props.isDark;

        var wrapStyle = {
            display: 'flex',
            alignItems: 'center',
            justifyContent:
                props.align === 'right'  ? 'flex-end' :
                props.align === 'center' ? 'center'   : 'flex-start',
        };

        var btnStyle = {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: a.buttonSize + 'px',
            height: a.buttonSize + 'px',
            padding: '0 12px',
            borderRadius: a.borderRadius + 'px',
            border: 'none',
            cursor: 'pointer',
            fontSize: Math.round(a.buttonSize * 0.4) + 'px',
            background: isDark ? a.darkBg : a.lightBg,
            color: isDark ? a.darkColor : a.lightColor,
            boxShadow: a.shadow ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
            transition: 'transform ' + a.transitionDuration + 'ms ease',
            transform: 'scale(1)',
        };

        if (a.toggleStyle === 'switch') {
            var trackStyle = {
                display: 'inline-flex',
                alignItems: 'center',
                width: '48px',
                height: '26px',
                borderRadius: '13px',
                background: isDark ? a.switchTrackDark : a.switchTrackLight,
                padding: '2px',
                boxSizing: 'border-box',
                transition: 'background ' + a.transitionDuration + 'ms ease',
                flexShrink: 0,
            };
            var thumbStyle = {
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: a.switchThumbColor,
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                transition: 'transform ' + a.transitionDuration + 'ms ease',
                transform: isDark ? 'translateX(22px)' : 'translateX(0)',
            };
            return el('div', { style: wrapStyle },
                el('button', {
                    'aria-label': 'Toggle dark mode',
                    style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '18px',
                    }
                },
                    a.showIcon ? el('span', null, isDark ? a.darkIcon : a.lightIcon) : null,
                    el('div', { style: trackStyle },
                        el('div', { style: thumbStyle })
                    ),
                    a.showLabel ? el('span', {
                        className: 'bkdm-label', style: { color: '#374151' }
                    }, isDark ? a.darkLabel : a.lightLabel) : null
                )
            );
        }

        // icon or button style
        return el('div', { style: wrapStyle },
            el('button', { 'aria-label': 'Toggle dark mode', style: btnStyle },
                a.showIcon ? el('span', null, isDark ? a.darkIcon : a.lightIcon) : null,
                a.showLabel ? el('span', {
                    className: 'bkdm-label'
                }, isDark ? a.darkLabel : a.lightLabel) : null
            )
        );
    }

    /* ── Register ──────────────────────────────────────────────────────────── */
    registerBlockType('blockenberg/dark-mode-toggle', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var align = props.attributes.align;

            var isDark = useState(false);
            var previewDark = isDark[0];
            var setPreviewDark = isDark[1];

            var blockProps = useBlockProps({
                className: 'bkdm-wrap',
                style: Object.assign(
                    { '--bkdm-lbl-fs': (a.labelFontSize || 14) + 'px' },
                    _tv(a.typoLabel || {}, '--bkdm-lbl-')
                )
            });

            return el(wp.element.Fragment, null,

                /* Inspector */
                el(InspectorControls, null,

                    /* Appearance */
                    el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: true },
                        el(SelectControl, {
                            label: __('Toggle Style', 'blockenberg'),
                            value: a.toggleStyle,
                            options: [
                                { label: __('Switch (track + thumb)', 'blockenberg'), value: 'switch' },
                                { label: __('Icon Button', 'blockenberg'), value: 'icon' },
                            ],
                            onChange: function (v) { set({ toggleStyle: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Position', 'blockenberg'),
                            value: a.position,
                            options: [
                                { label: __('Inline (in flow)', 'blockenberg'), value: 'inline' },
                                { label: __('Floating (fixed corner)', 'blockenberg'), value: 'floating' },
                            ],
                            onChange: function (v) { set({ position: v }); }
                        }),
                        a.position === 'floating' ? el(SelectControl, {
                            label: __('Corner', 'blockenberg'),
                            value: a.floatCorner,
                            options: [
                                { label: __('Bottom Right', 'blockenberg'), value: 'bottom-right' },
                                { label: __('Bottom Left', 'blockenberg'),  value: 'bottom-left'  },
                                { label: __('Top Right', 'blockenberg'),    value: 'top-right'    },
                                { label: __('Top Left', 'blockenberg'),     value: 'top-left'     },
                            ],
                            onChange: function (v) { set({ floatCorner: v }); }
                        }) : null,
                        a.position === 'floating' ? el(RangeControl, {
                            label: __('Offset X (px)', 'blockenberg'),
                            value: a.floatOffsetX,
                            min: 0, max: 120,
                            onChange: function (v) { set({ floatOffsetX: v }); }
                        }) : null,
                        a.position === 'floating' ? el(RangeControl, {
                            label: __('Offset Y (px)', 'blockenberg'),
                            value: a.floatOffsetY,
                            min: 0, max: 120,
                            onChange: function (v) { set({ floatOffsetY: v }); }
                        }) : null,
                        el(RangeControl, {
                            label: __('Button Size (px)', 'blockenberg'),
                            value: a.buttonSize,
                            min: 28, max: 80,
                            onChange: function (v) { set({ buttonSize: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Border Radius (px)', 'blockenberg'),
                            value: a.borderRadius,
                            min: 0, max: 50,
                            onChange: function (v) { set({ borderRadius: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Transition Duration (ms)', 'blockenberg'),
                            value: a.transitionDuration,
                            min: 0, max: 1000, step: 50,
                            onChange: function (v) { set({ transitionDuration: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Icon', 'blockenberg'),
                            checked: a.showIcon,
                            onChange: function (v) { set({ showIcon: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Label', 'blockenberg'),
                            checked: a.showLabel,
                            onChange: function (v) { set({ showLabel: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Hover Scale', 'blockenberg'),
                            checked: a.hoverScale,
                            onChange: function (v) { set({ hoverScale: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Drop Shadow', 'blockenberg'),
                            checked: a.shadow,
                            onChange: function (v) { set({ shadow: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),

                    /* Icons & Labels */
                    el(PanelBody, { title: __('Icons & Labels', 'blockenberg'), initialOpen: false },
                        el(TextControl, {
                            label: __('Light Mode Icon', 'blockenberg'),
                            value: a.lightIcon,
                            onChange: function (v) { set({ lightIcon: v }); }
                        }),
                        el(TextControl, {
                            label: __('Dark Mode Icon', 'blockenberg'),
                            value: a.darkIcon,
                            onChange: function (v) { set({ darkIcon: v }); }
                        }),
                        el(TextControl, {
                            label: __('Light Label Text', 'blockenberg'),
                            value: a.lightLabel,
                            onChange: function (v) { set({ lightLabel: v }); }
                        }),
                        el(TextControl, {
                            label: __('Dark Label Text', 'blockenberg'),
                            value: a.darkLabel,
                            onChange: function (v) { set({ darkLabel: v }); }
                        })
                    ),

                    /* Behaviour */
                    el(PanelBody, { title: __('Behaviour', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            label: __('Default Theme', 'blockenberg'),
                            value: a.defaultTheme,
                            options: [
                                { label: __('Light', 'blockenberg'), value: 'light' },
                                { label: __('Dark', 'blockenberg'),  value: 'dark'  },
                            ],
                            onChange: function (v) { set({ defaultTheme: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Respect System Preference', 'blockenberg'),
                            help: __('If enabled, auto-applies dark mode when the OS is in dark mode (unless user overrides).', 'blockenberg'),
                            checked: a.respectSystemPref,
                            onChange: function (v) { set({ respectSystemPref: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(TextControl, {
                            label: __('localStorage Key', 'blockenberg'),
                            value: a.storageKey,
                            onChange: function (v) { set({ storageKey: v }); }
                        }),
                        el(TextControl, {
                            label: __('HTML Attribute Name', 'blockenberg'),
                            value: a.dataAttribute,
                            onChange: function (v) { set({ dataAttribute: v }); }
                        }),
                        el(TextControl, {
                            label: __('Dark Value', 'blockenberg'),
                            value: a.darkValue,
                            onChange: function (v) { set({ darkValue: v }); }
                        }),
                        el(TextControl, {
                            label: __('Light Value', 'blockenberg'),
                            value: a.lightValue,
                            onChange: function (v) { set({ lightValue: v }); }
                        })
                    ),

                    /* Colors */
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Label', 'blockenberg'), value: a.typoLabel, onChange: function (v) { set({ typoLabel: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.lightBg,          onChange: function (v) { set({ lightBg: v || '#f3f4f6' }); },          label: __('Light Mode Background', 'blockenberg') },
                            { value: a.lightColor,       onChange: function (v) { set({ lightColor: v || '#111827' }); },       label: __('Light Mode Icon/Text', 'blockenberg') },
                            { value: a.darkBg,           onChange: function (v) { set({ darkBg: v || '#1f2937' }); },           label: __('Dark Mode Background', 'blockenberg') },
                            { value: a.darkColor,        onChange: function (v) { set({ darkColor: v || '#f9fafb' }); },        label: __('Dark Mode Icon/Text', 'blockenberg') },
                            { value: a.switchTrackLight, onChange: function (v) { set({ switchTrackLight: v || '#d1d5db' }); }, label: __('Switch Track (Light)', 'blockenberg') },
                            { value: a.switchTrackDark,  onChange: function (v) { set({ switchTrackDark: v || '#4f46e5' }); },  label: __('Switch Track (Dark)', 'blockenberg') },
                            { value: a.switchThumbColor, onChange: function (v) { set({ switchThumbColor: v || '#ffffff' }); }, label: __('Switch Thumb', 'blockenberg') },
                        ]
                    })
                ),

                /* Canvas */
                el('div', blockProps,
                    el('div', {
                        style: { padding: '8px 0' }
                    },
                        el('p', {
                            style: { fontSize: '11px', color: '#6b7280', marginBottom: '10px', textAlign: 'center' }
                        }, __('Preview — click to toggle', 'blockenberg')),
                        el(TogglePreview, {
                            attrs: a,
                            isDark: previewDark,
                            align: align,
                        }),
                        el('button', {
                            style: {
                                display: 'block',
                                margin: '12px auto 0',
                                padding: '4px 12px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                border: '1px solid #d1d5db',
                                background: '#fff',
                            },
                            onClick: function () { setPreviewDark(!previewDark); }
                        }, __('Toggle Preview', 'blockenberg'))
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkdm-wrap',
                style: Object.assign(
                    { '--bkdm-lbl-fs': (a.labelFontSize || 14) + 'px' },
                    _tv(a.typoLabel || {}, '--bkdm-lbl-')
                )
            });

            return el('div', Object.assign({}, blockProps, {
                'data-toggle-style':      a.toggleStyle,
                'data-position':          a.position,
                'data-float-corner':      a.floatCorner,
                'data-float-x':           a.floatOffsetX,
                'data-float-y':           a.floatOffsetY,
                'data-storage-key':       a.storageKey,
                'data-attr':              a.dataAttribute,
                'data-dark-val':          a.darkValue,
                'data-light-val':         a.lightValue,
                'data-default':           a.defaultTheme,
                'data-respect-system':    String(a.respectSystemPref),
                'data-button-size':       a.buttonSize,
                'data-border-radius':     a.borderRadius,
                'data-duration':          a.transitionDuration,
                'data-show-icon':         String(a.showIcon),
                'data-show-label':        String(a.showLabel),
                'data-light-icon':        a.lightIcon,
                'data-dark-icon':         a.darkIcon,
                'data-light-label':       a.lightLabel,
                'data-dark-label':        a.darkLabel,
                'data-hover-scale':       String(a.hoverScale),
                'data-shadow':            String(a.shadow),
                'data-light-bg':          a.lightBg,
                'data-light-color':       a.lightColor,
                'data-dark-bg':           a.darkBg,
                'data-dark-color':        a.darkColor,
                'data-track-light':       a.switchTrackLight,
                'data-track-dark':        a.switchTrackDark,
                'data-thumb':             a.switchThumbColor,
            }),
                el('button', {
                    className: 'bkdm-btn',
                    'aria-label': 'Toggle dark mode',
                    'aria-pressed': 'false',
                    type: 'button',
                })
            );
        }
    });
}() );
