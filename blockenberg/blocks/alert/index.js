( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;

    // Lazy lookup so the typography control is resolved at render time
    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    // ── Preset palettes per alert type ──────────────────────────────────────────
    var PRESETS = {
        info: {
            bg: '#eff6ff', border: '#3b82f6', icon: '#3b82f6',
            title: '#1e3a5f', text: '#1d4ed8'
        },
        success: {
            bg: '#f0fdf4', border: '#22c55e', icon: '#16a34a',
            title: '#14532d', text: '#166534'
        },
        warning: {
            bg: '#fffbeb', border: '#f59e0b', icon: '#d97706',
            title: '#78350f', text: '#92400e'
        },
        error: {
            bg: '#fef2f2', border: '#ef4444', icon: '#dc2626',
            title: '#7f1d1d', text: '#991b1b'
        },
        tip: {
            bg: '#f5f3ff', border: '#8b5cf6', icon: '#7c3aed',
            title: '#2e1065', text: '#5b21b6'
        },
        note: {
            bg: '#f8fafc', border: '#94a3b8', icon: '#64748b',
            title: '#1e293b', text: '#475569'
        },
        dark: {
            bg: '#1e293b', border: '#475569', icon: '#94a3b8',
            title: '#f1f5f9', text: '#cbd5e1'
        }
    };

    // ── Inline SVG icons per alert type ────────────────────────────────────────
    // All 24×24 viewBox paths
    var ICONS = {
        info: {
            auto: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
            outline: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z'
        },
        success: {
            auto: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
            outline: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.83l-2.59-2.58L6 13l4 4 8-8-1.41-1.42L10 14.17z'
        },
        warning: {
            auto: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
            outline: 'M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z'
        },
        error: {
            auto: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
            outline: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z'
        },
        tip: {
            auto: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z',
            outline: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z'
        },
        note: {
            auto: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z',
            outline: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z'
        },
        dark: {
            auto: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
            outline: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z'
        }
    };

    // Extra standalone icon paths (when iconStyle overrides default)
    var ICON_OVERRIDES = {
        star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
        heart:    'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
        shield:   'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l6 2.67V11c0 3.83-2.62 7.43-6 8.93-3.38-1.5-6-5.1-6-8.93V7.67L12 5z',
        bell:     'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
        lock:     'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
        check:    'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
        zap:      'M7 2v11h3v9l7-12h-4l4-8z',
        book:     'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z'
    };

    // ── Resolve icon path ────────────────────────────────────────────────────────
    function resolveIconPath(alertType, iconStyle) {
        if (iconStyle !== 'auto' && iconStyle !== 'outline' && ICON_OVERRIDES[iconStyle]) {
            return ICON_OVERRIDES[iconStyle];
        }
        var typeIcons = ICONS[alertType] || ICONS.info;
        return iconStyle === 'outline' ? typeIcons.outline : typeIcons.auto;
    }

    // ── Build icon SVG ───────────────────────────────────────────────────────────
    function buildIconSVG(alertType, iconStyle, iconColor, iconSize) {
        var d = resolveIconPath(alertType, iconStyle);
        return el('svg', {
            viewBox: '0 0 24 24',
            xmlns: 'http://www.w3.org/2000/svg',
            width: iconSize,
            height: iconSize,
            'aria-hidden': 'true',
            focusable: 'false',
            style: { display: 'block', flexShrink: 0 }
        }, el('path', { d: d, fill: iconColor }));
    }

    // ── Resolve colors (preset or custom) ───────────────────────────────────────
    function resolveColors(a) {
        if (a.useCustomColors) {
            return {
                bg: a.customBgColor,
                border: a.customBorderColor,
                icon: a.customIconColor,
                title: a.customTitleColor,
                text: a.customTextColor
            };
        }
        return PRESETS[a.alertType] || PRESETS.info;
    }

    // ── CSS vars on wrapper ──────────────────────────────────────────────────────
    function buildWrapStyle(a) {
        var c = resolveColors(a);
        var s = {
            '--bkbg-al-bg':         c.bg,
            '--bkbg-al-border':     c.border,
            '--bkbg-al-icon-color': c.icon,
            '--bkbg-al-title':      c.title,
            '--bkbg-al-text':       c.text,
            '--bkbg-al-brd-w':      a.borderWidth + 'px',
            '--bkbg-al-radius':     a.borderRadius + 'px',
            '--bkbg-al-pad-t':      a.paddingTop + 'px',
            '--bkbg-al-pad-r':      a.paddingRight + 'px',
            '--bkbg-al-pad-b':      a.paddingBottom + 'px',
            '--bkbg-al-pad-l':      a.paddingLeft + 'px',
            '--bkbg-al-gap-ic':     a.gapIconContent + 'px',
            '--bkbg-al-gap-tb':     a.gapTitleBody + 'px',
            '--bkbg-al-title-size': a.titleSize + 'px',
            '--bkbg-al-title-w':    a.titleWeight,
            '--bkbg-al-body-size':  a.bodySize + 'px',
            '--bkbg-al-body-w':     a.bodyWeight,
            '--bkbg-al-body-lh':    a.bodyLH
        };
        var _tv = getTypoCssVars();
        Object.assign(s, _tv(a.titleTypo || {}, '--bkbg-al-title-'));
        Object.assign(s, _tv(a.bodyTypo || {}, '--bkbg-al-body-'));
        return s;
    }

    registerBlockType('blockenberg/alert', {
        title: __('Alert / Notice', 'blockenberg'),
        icon: 'warning',
        category: 'bkbg-content',
        description: __('Info, success, warning or error notice with icon, title and body. Pure CSS.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            // ── Color picker state ────────────────────────────────────────────
            var openColorKeyState = useState(null);
            var openColorKey      = openColorKeyState[0];
            var setOpenColorKey   = openColorKeyState[1];

            function renderColorControl(key, label, value, onChange) {
                var isOpen = openColorKey === key;
                return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
                    el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
                    el('div', { style: { position: 'relative', flexShrink: 0 } },
                        el('button', {
                            type: 'button',
                            title: value || 'none',
                            onClick: function () { setOpenColorKey(isOpen ? null : key); },
                            style: {
                                width: '28px', height: '28px', borderRadius: '4px',
                                border: isOpen ? '2px solid #007cba' : '2px solid #ddd',
                                cursor: 'pointer', padding: 0, display: 'block',
                                background: value || '#ffffff', flexShrink: 0
                            }
                        }),
                        isOpen && el(Popover, {
                            position: 'bottom left',
                            onClose: function () { setOpenColorKey(null); }
                        },
                            el('div', {
                                style: { padding: '8px' },
                                onMouseDown: function (e) { e.stopPropagation(); }
                            },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } },
                                    el('strong', { style: { fontSize: '12px' } }, label),
                                    el(Button, { icon: 'no-alt', isSmall: true, onClick: function () { setOpenColorKey(null); } })
                                ),
                                el(ColorPicker, {
                                    color: value,
                                    enableAlpha: true,
                                    onChange: function (c) { onChange(c); }
                                })
                            )
                        )
                    )
                );
            }

            // ── Option lists ──────────────────────────────────────────────────
            var alertTypeOptions = [
                { label: __('ℹ Info',         'blockenberg'), value: 'info'    },
                { label: __('✓ Success',      'blockenberg'), value: 'success' },
                { label: __('⚠ Warning',     'blockenberg'), value: 'warning' },
                { label: __('✕ Error',        'blockenberg'), value: 'error'   },
                { label: __('💡 Tip',          'blockenberg'), value: 'tip'     },
                { label: __('📝 Note',         'blockenberg'), value: 'note'    },
                { label: __('■ Dark',          'blockenberg'), value: 'dark'    }
            ];

            var borderStyleOptions = [
                { label: __('Left bar',   'blockenberg'), value: 'left'     },
                { label: __('Top bar',    'blockenberg'), value: 'top'      },
                { label: __('Full border','blockenberg'), value: 'full'     },
                { label: __('None',       'blockenberg'), value: 'none'     }
            ];

            var iconStyleOptions = [
                { label: __('Auto (matches type)',  'blockenberg'), value: 'auto'      },
                { label: __('Outline',             'blockenberg'), value: 'outline'   },
                { label: __('Star',                'blockenberg'), value: 'star'      },
                { label: __('Heart',               'blockenberg'), value: 'heart'     },
                { label: __('Shield',              'blockenberg'), value: 'shield'    },
                { label: __('Bell',                'blockenberg'), value: 'bell'      },
                { label: __('Lock',                'blockenberg'), value: 'lock'      },
                { label: __('Check',               'blockenberg'), value: 'check'     },
                { label: __('Zap / Lightning',     'blockenberg'), value: 'zap'       },
                { label: __('Book',                'blockenberg'), value: 'book'      }
            ];

            var iconPositionOptions = [
                { label: __('Top (align to first line)', 'blockenberg'), value: 'top'    },
                { label: __('Centre (middle of block)',  'blockenberg'), value: 'center' }
            ];

            var titleTagOptions = [
                { label: 'p',  value: 'p'  },
                { label: 'h3', value: 'h3' },
                { label: 'h4', value: 'h4' },
                { label: 'h5', value: 'h5' }
            ];

            var fontWeightOptions = [
                { label: '300 — Light',     value: 300 },
                { label: '400 — Regular',   value: 400 },
                { label: '500 — Medium',    value: 500 },
                { label: '600 — Semi Bold', value: 600 },
                { label: '700 — Bold',      value: 700 },
                { label: '800 — Extra Bold',value: 800 }
            ];

            var c = resolveColors(a);

            // ── Inspector panels ──────────────────────────────────────────────
            var inspector = el(InspectorControls, {},

                // ── Alert Type ────────────────────────────────────────────────
                el(PanelBody, { title: __('Alert Type', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Type / Preset', 'blockenberg'),
                        value: a.alertType,
                        options: alertTypeOptions,
                        onChange: function (v) { setAttributes({ alertType: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Border Style', 'blockenberg'),
                        value: a.borderStyle,
                        options: borderStyleOptions,
                        onChange: function (v) { setAttributes({ borderStyle: v }); }
                    }),
                    a.borderStyle !== 'none' && el(RangeControl, {
                        label: __('Border Width (px)', 'blockenberg'),
                        value: a.borderWidth, min: 1, max: 12,
                        onChange: function (v) { setAttributes({ borderWidth: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: a.borderRadius, min: 0, max: 32,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    })
                ),

                // ── Icon ──────────────────────────────────────────────────────
                el(PanelBody, { title: __('Icon', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Icon', 'blockenberg'),
                        checked: a.showIcon,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showIcon: v }); }
                    }),
                    a.showIcon && el(Fragment, {},
                        el(SelectControl, {
                            label: __('Icon Style', 'blockenberg'),
                            value: a.iconStyle,
                            options: iconStyleOptions,
                            onChange: function (v) { setAttributes({ iconStyle: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Icon Vertical Alignment', 'blockenberg'),
                            value: a.iconPosition,
                            options: iconPositionOptions,
                            onChange: function (v) { setAttributes({ iconPosition: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Icon Size (px)', 'blockenberg'),
                            value: a.iconSize, min: 14, max: 64,
                            onChange: function (v) { setAttributes({ iconSize: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Gap icon → text (px)', 'blockenberg'),
                            value: a.gapIconContent, min: 0, max: 48,
                            onChange: function (v) { setAttributes({ gapIconContent: v }); }
                        })
                    )
                ),

                // ── Typography ────────────────────────────────────────────────
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Title', 'blockenberg'),
                        checked: a.showTitle,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showTitle: v }); }
                    }),
                    a.showTitle && el(Fragment, {},
                        el(SelectControl, {
                            label: __('HTML Tag', 'blockenberg'),
                            value: a.titleTag,
                            options: titleTagOptions,
                            onChange: function (v) { setAttributes({ titleTag: v }); }
                        }),
                        (function () {
                            var TC = getTypographyControl();
                            if (!TC) return el('p', null, 'Typography control not loaded.');
                            return el(TC, { label: __('Title Typography', 'blockenberg'), value: a.titleTypo || {}, onChange: function (v) { setAttributes({ titleTypo: v }); } });
                        })()
                    ),
                    el('hr', {}),
                    (function () {
                        var TC = getTypographyControl();
                        if (!TC) return el('p', null, 'Typography control not loaded.');
                        return el(TC, { label: __('Body Typography', 'blockenberg'), value: a.bodyTypo || {}, onChange: function (v) { setAttributes({ bodyTypo: v }); } });
                    })(),
                    el('hr', {}),
                    el(RangeControl, {
                        label: __('Gap title → body (px)', 'blockenberg'),
                        value: a.gapTitleBody, min: 0, max: 32,
                        onChange: function (v) { setAttributes({ gapTitleBody: v }); }
                    })
                ),

                // ── Colors ────────────────────────────────────────────────────
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Override preset colors', 'blockenberg'),
                        checked: a.useCustomColors,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ useCustomColors: v }); }
                    }),
                    a.useCustomColors
                        ? el(Fragment, {},
                            el('p', { style: { margin: '8px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } },
                                __('Custom Colors', 'blockenberg')),
                            renderColorControl('customBgColor',     __('Background',     'blockenberg'), a.customBgColor,     function (c) { setAttributes({ customBgColor: c }); }),
                            renderColorControl('customBorderColor', __('Border / accent', 'blockenberg'), a.customBorderColor, function (c) { setAttributes({ customBorderColor: c }); }),
                            renderColorControl('customIconColor',   __('Icon',           'blockenberg'), a.customIconColor,   function (c) { setAttributes({ customIconColor: c }); }),
                            renderColorControl('customTitleColor',  __('Title',          'blockenberg'), a.customTitleColor,  function (c) { setAttributes({ customTitleColor: c }); }),
                            renderColorControl('customTextColor',   __('Body Text',      'blockenberg'), a.customTextColor,   function (c) { setAttributes({ customTextColor: c }); })
                          )
                        : el('p', { style: { fontSize: '12px', color: '#757575', margin: '8px 0' } },
                            __('Colors are driven by the preset type above. Enable "Override preset colors" to customise.', 'blockenberg'))
                ),

                // ── Spacing ───────────────────────────────────────────────────
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 80, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                    el(RangeControl, { label: __('Padding Right (px)',  'blockenberg'), value: a.paddingRight,  min: 0, max: 80, onChange: function (v) { setAttributes({ paddingRight: v }); } }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 80, onChange: function (v) { setAttributes({ paddingBottom: v }); } }),
                    el(RangeControl, { label: __('Padding Left (px)',   'blockenberg'), value: a.paddingLeft,   min: 0, max: 80, onChange: function (v) { setAttributes({ paddingLeft: v }); } })
                )
            );

            // ── Build render elements ─────────────────────────────────────────
            var iconEl = a.showIcon
                ? el('span', { className: 'bkbg-al-icon', 'aria-hidden': 'true' },
                    buildIconSVG(a.alertType, a.iconStyle, c.icon, a.iconSize))
                : null;

            var titleEl = a.showTitle
                ? el(RichText, {
                    tagName: a.titleTag,
                    className: 'bkbg-al-title',
                    value: a.titleText,
                    onChange: function (v) { setAttributes({ titleText: v }); },
                    placeholder: __('Alert title…', 'blockenberg'),
                    allowedFormats: ['core/bold', 'core/italic', 'core/text-color']
                  })
                : null;

            var bodyEl = el(RichText, {
                tagName: 'p',
                className: 'bkbg-al-body',
                value: a.bodyText,
                onChange: function (v) { setAttributes({ bodyText: v }); },
                placeholder: __('Notice body text…', 'blockenberg'),
                allowedFormats: ['core/bold', 'core/italic', 'core/text-color', 'core/link']
            });

            var blockProps = useBlockProps({
                className: 'bkbg-editor-wrap',
                'data-block-label': 'Alert'
            });

            return el('div', blockProps,
                inspector,
                el('div', Object.assign(
                    { className: 'bkbg-al-wrap', style: buildWrapStyle(a) },
                    {
                        'data-type':      a.alertType,
                        'data-border':    a.borderStyle,
                        'data-icon-pos':  a.iconPosition
                    }
                ),
                    iconEl,
                    el('div', { className: 'bkbg-al-content' },
                        titleEl,
                        bodyEl
                    )
                )
            );
        },

        // ── Save ─────────────────────────────────────────────────────────────────
        save: function (props) {
            var a = props.attributes;
            var RichTextContent = wp.blockEditor.RichText.Content;
            var c = resolveColors(a);

            var iconEl = a.showIcon
                ? el('span', { className: 'bkbg-al-icon', 'aria-hidden': 'true' },
                    buildIconSVG(a.alertType, a.iconStyle, c.icon, a.iconSize))
                : null;

            return el('div', Object.assign(
                { className: 'bkbg-al-wrap', style: buildWrapStyle(a) },
                {
                    'data-type':     a.alertType,
                    'data-border':   a.borderStyle,
                    'data-icon-pos': a.iconPosition,
                    role: 'note'
                }
            ),
                iconEl,
                el('div', { className: 'bkbg-al-content' },
                    a.showTitle && el(RichTextContent, { tagName: a.titleTag, className: 'bkbg-al-title', value: a.titleText }),
                    el(RichTextContent, { tagName: 'p', className: 'bkbg-al-body', value: a.bodyText })
                )
            );
        }
    });
}() );
