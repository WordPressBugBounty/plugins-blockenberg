( function () {
    var el                = wp.element.createElement;
    var Fragment          = wp.element.Fragment;
    var useState          = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var TextControl       = wp.components.TextControl;
    var TextareaControl   = wp.components.TextareaControl;
    var ToggleControl     = wp.components.ToggleControl;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var Button            = wp.components.Button;

    var _cpTC, _cpTV;
    function _tc() { return _cpTC || (_cpTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _cpTV || (_cpTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    var STYLE_OPTIONS = [
        { label: __('Classic (strip)',  'blockenberg'), value: 'classic'  },
        { label: __('Card (flat)',      'blockenberg'), value: 'card'     },
        { label: __('Minimal',         'blockenberg'), value: 'minimal'  },
        { label: __('Ribbon (accent)', 'blockenberg'), value: 'ribbon'   },
    ];

    var DISCOUNT_TYPES = [
        { label: __('Percentage (%)',  'blockenberg'), value: 'percent' },
        { label: __('Fixed amount',   'blockenberg'), value: 'fixed'   },
        { label: __('Free shipping',  'blockenberg'), value: 'shipping' },
        { label: __('Buy one get one','blockenberg'), value: 'bogo'    },
        { label: __('Custom label',   'blockenberg'), value: 'custom'  },
    ];

    var BADGE_SHAPES = [
        { label: __('Circle',   'blockenberg'), value: 'circle'  },
        { label: __('Rounded',  'blockenberg'), value: 'rounded' },
        { label: __('Pill',     'blockenberg'), value: 'pill'    },
    ];

    var BADGE_POSITIONS = [
        { label: __('Top right',  'blockenberg'), value: 'top-right'  },
        { label: __('Top left',   'blockenberg'), value: 'top-left'   },
        { label: __('Inline',     'blockenberg'), value: 'inline'     },
    ];

    var STRIP_SIDES = [
        { label: __('Left',   'blockenberg'), value: 'left'   },
        { label: __('Top',    'blockenberg'), value: 'top'    },
        { label: __('Right',  'blockenberg'), value: 'right'  },
        { label: __('Bottom', 'blockenberg'), value: 'bottom' },
    ];

    function badgeLabel(a) {
        if (a.discountType === 'percent')  return a.discountValue + '%\nOFF';
        if (a.discountType === 'fixed')    return '$' + a.discountValue + '\nOFF';
        if (a.discountType === 'shipping') return 'FREE\nSHIPPING';
        if (a.discountType === 'bogo')     return 'BOGO';
        return a.discountValue;
    }

    function CouponPreview(props) {
        var a     = props.attributes;
        var lines = badgeLabel(a).split('\n');

        var wrapStyle = {
            position:   'relative',
            background: a.bgColor,
            color:      a.textColor,
            borderRadius: a.borderRadius + 'px',
            maxWidth:   a.maxWidth + 'px',
            overflow:   'hidden',
            boxShadow:  '0 4px 24px rgba(0,0,0,0.10)',
        };

        // Strip
        var stripStyle = { position: 'absolute', background: a.accentColor };
        if (a.style === 'classic') {
            if (a.stripSide === 'left')   Object.assign(stripStyle, { top: 0, left: 0,  width: '8px', height: '100%' });
            if (a.stripSide === 'right')  Object.assign(stripStyle, { top: 0, right: 0, width: '8px', height: '100%' });
            if (a.stripSide === 'top')    Object.assign(stripStyle, { top: 0, left: 0,  height: '8px', width: '100%' });
            if (a.stripSide === 'bottom') Object.assign(stripStyle, { bottom: 0, left: 0, height: '8px', width: '100%' });
        }

        var bodyPad = a.style === 'classic'
            ? (a.stripSide === 'left' ? '28px 28px 28px 40px' : a.stripSide === 'right' ? '28px 40px 28px 28px' : '28px')
            : '28px';

        if (a.style === 'minimal') {
            wrapStyle.boxShadow = 'none';
            wrapStyle.border = '2px dashed ' + a.accentColor;
        }

        if (a.style === 'ribbon') {
            wrapStyle.borderTop = '6px solid ' + a.accentColor;
        }

        return el('div', { className: 'bkcp-coupon bkcp-style-' + a.style, style: wrapStyle },
            a.style === 'classic' && el('div', { className: 'bkcp-strip', style: stripStyle }),

            // Badge
            a.showBadge && a.badgePosition !== 'inline' && el('div', {
                className: 'bkcp-badge bkcp-badge-' + a.badgeShape + ' bkcp-badge-' + a.badgePosition,
                style: {
                    position:   'absolute',
                    background: a.badgeBg,
                    color:      a.badgeColor,
                    display:    'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign:  'center',
                    fontWeight: 800,
                    borderRadius: a.badgeShape === 'circle' ? '50%' : a.badgeShape === 'pill' ? '999px' : '10px',
                    width:      a.badgeShape === 'circle' ? '72px' : 'auto',
                    height:     a.badgeShape === 'circle' ? '72px' : 'auto',
                    padding:    a.badgeShape === 'circle' ? '0' : '8px 14px',
                    top:        a.badgePosition === 'top-right' || a.badgePosition === 'top-left' ? '16px' : undefined,
                    right:      a.badgePosition === 'top-right' ? '16px' : undefined,
                    left:       a.badgePosition === 'top-left'  ? '16px' : undefined,
                    lineHeight: 1.1,
                    fontSize:   a.badgeShape === 'circle' ? '13px' : '15px',
                }
            }, lines.map(function (l, i) { return el('span', { key: i, style: { display: 'block', fontSize: i === 0 ? '22px' : '11px' } }, l); })),

            // Body
            el('div', { className: 'bkcp-body', style: { padding: bodyPad } },
                // Inline badge
                a.showBadge && a.badgePosition === 'inline' && el('div', {
                    style: {
                        display: 'inline-block',
                        background: a.badgeBg,
                        color: a.badgeColor,
                        borderRadius: a.badgeShape === 'circle' ? '50%' : a.badgeShape === 'pill' ? '999px' : '8px',
                        padding: '6px 14px',
                        fontWeight: 800,
                        fontSize: '14px',
                        marginBottom: '12px',
                    }
                }, lines.join(' ')),

                el('h3', {
                    className: 'bkcp-title',
                    style: { margin: '0 0 8px', color: a.textColor }
                }, a.title),

                el('p', {
                    className: 'bkcp-desc',
                    style: { margin: '0 0 20px', color: a.descColor }
                }, a.description),

                // Code display
                a.showCode && el('div', { className: 'bkcp-code-row', style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' } },
                    el('div', { className: 'bkcp-code-wrap', style: {
                        flex: 1,
                        background: a.codeBg,
                        border: '2px dashed ' + a.codeColor,
                        borderRadius: '8px',
                        padding: '10px 16px',
                    }},
                        el('span', { className: 'bkcp-code-label', style: { display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: a.descColor, marginBottom: '2px' } }, a.codeLabel),
                        el('span', { className: 'bkcp-code', style: { fontFamily: 'monospace', fontSize: (a.codeFontSize || 22) + 'px', fontWeight: 800, letterSpacing: '3px', color: a.codeColor } }, a.code)
                    ),
                    el('button', {
                        className: 'bkcp-copy-btn',
                        type: 'button',
                        style: {
                            background: a.accentColor,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 18px',
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }
                    }, a.copyLabel)
                ),

                // Expiry
                a.showExpiry && el('div', { className: 'bkcp-expiry', style: { fontSize: '13px', color: a.descColor, marginBottom: a.showButton ? '16px' : '0' } },
                    el('span', null, a.expiryLabel + ' '),
                    a.expiryDate && el('strong', { style: { color: a.textColor } }, a.expiryDate),
                    a.showCountdown && el('span', { className: 'bkcp-countdown', 'data-expiry': a.expiryDate, style: { marginLeft: '8px', fontWeight: 700, color: a.accentColor } })
                ),

                // Button
                a.showButton && el('a', {
                    href: '#',
                    className: 'bkcp-btn',
                    style: {
                        display: 'inline-block',
                        background: a.btnBg,
                        color: a.btnColor,
                        padding: '13px 28px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: (a.btnFontSize || 16) + 'px',
                        textDecoration: 'none',
                        marginTop: '4px',
                    }
                }, a.buttonText),

                // Note
                a.showNote && a.note && el('p', {
                    className: 'bkcp-note',
                    style: { margin: '12px 0 0', fontSize: '12px', color: a.descColor }
                }, a.note)
            )
        );
    }

    registerBlockType('blockenberg/coupon', {
        title: __('Coupon', 'blockenberg'),
        description: __('Promo/discount coupon card with copyable code & expiry.', 'blockenberg'),
        category: 'bkbg-marketing',
        icon: 'tickets-alt',

        edit: function (props) {
            var attributes    = props.attributes;
            var setAttributes = props.setAttributes;
            var blockProps    = useBlockProps({ className: 'bkcp-editor-wrap', style: Object.assign({ display: 'flex', justifyContent: 'flex-start' }, _tv(attributes.typoTitle, '--bkcp-ttl-'), _tv(attributes.typoDesc, '--bkcp-dsc-')) });

            return el(Fragment, null,
                el(InspectorControls, null,
                    /* ── Content ──────────────────────────────────────────── */
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, {
                            label: __('Title', 'blockenberg'),
                            value: attributes.title,
                            onChange: function (v) { setAttributes({ title: v }); },
                        }),
                        el(TextareaControl, {
                            label: __('Description', 'blockenberg'),
                            value: attributes.description,
                            rows: 3,
                            onChange: function (v) { setAttributes({ description: v }); },
                        }),
                        el(SelectControl, {
                            label: __('Discount type', 'blockenberg'),
                            value: attributes.discountType,
                            options: DISCOUNT_TYPES,
                            onChange: function (v) { setAttributes({ discountType: v }); },
                        }),
                        el(TextControl, {
                            label: __('Discount value / label', 'blockenberg'),
                            value: attributes.discountValue,
                            onChange: function (v) { setAttributes({ discountValue: v }); },
                        })
                    ),
                    /* ── Coupon Code ─────────────────────────────────────── */
                    el(PanelBody, { title: __('Coupon Code', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, {
                            label: __('Show code', 'blockenberg'),
                            checked: attributes.showCode,
                            onChange: function (v) { setAttributes({ showCode: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        attributes.showCode && el(TextControl, {
                            label: __('Code', 'blockenberg'),
                            value: attributes.code,
                            onChange: function (v) { setAttributes({ code: v }); },
                        }),
                        attributes.showCode && el(TextControl, {
                            label: __('Code label', 'blockenberg'),
                            value: attributes.codeLabel,
                            onChange: function (v) { setAttributes({ codeLabel: v }); },
                        }),
                        attributes.showCode && el(TextControl, {
                            label: __('Copy button label', 'blockenberg'),
                            value: attributes.copyLabel,
                            onChange: function (v) { setAttributes({ copyLabel: v }); },
                        }),
                        attributes.showCode && el(TextControl, {
                            label: __('Copied! label', 'blockenberg'),
                            value: attributes.copiedLabel,
                            onChange: function (v) { setAttributes({ copiedLabel: v }); },
                        })
                    ),
                    /* ── Expiry ───────────────────────────────────────────── */
                    el(PanelBody, { title: __('Expiry', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show expiry', 'blockenberg'),
                            checked: attributes.showExpiry,
                            onChange: function (v) { setAttributes({ showExpiry: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        attributes.showExpiry && el(TextControl, {
                            label: __('Expiry date', 'blockenberg'),
                            help: __('Format: YYYY-MM-DD or any readable date', 'blockenberg'),
                            value: attributes.expiryDate,
                            onChange: function (v) { setAttributes({ expiryDate: v }); },
                        }),
                        attributes.showExpiry && el(TextControl, {
                            label: __('Expiry label', 'blockenberg'),
                            value: attributes.expiryLabel,
                            onChange: function (v) { setAttributes({ expiryLabel: v }); },
                        }),
                        attributes.showExpiry && el(ToggleControl, {
                            label: __('Show live countdown', 'blockenberg'),
                            checked: attributes.showCountdown,
                            onChange: function (v) { setAttributes({ showCountdown: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),
                    /* ── CTA Button ───────────────────────────────────────── */
                    el(PanelBody, { title: __('CTA Button', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show button', 'blockenberg'),
                            checked: attributes.showButton,
                            onChange: function (v) { setAttributes({ showButton: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        attributes.showButton && el(TextControl, {
                            label: __('Button text', 'blockenberg'),
                            value: attributes.buttonText,
                            onChange: function (v) { setAttributes({ buttonText: v }); },
                        }),
                        attributes.showButton && el(TextControl, {
                            label: __('Button URL', 'blockenberg'),
                            value: attributes.buttonUrl,
                            type: 'url',
                            onChange: function (v) { setAttributes({ buttonUrl: v }); },
                        }),
                        attributes.showButton && el(ToggleControl, {
                            label: __('Open in new tab', 'blockenberg'),
                            checked: attributes.buttonNewTab,
                            onChange: function (v) { setAttributes({ buttonNewTab: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el(ToggleControl, {
                            label: __('Show fine print / note', 'blockenberg'),
                            checked: attributes.showNote,
                            onChange: function (v) { setAttributes({ showNote: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        attributes.showNote && el(TextControl, {
                            label: __('Note text', 'blockenberg'),
                            value: attributes.note,
                            onChange: function (v) { setAttributes({ note: v }); },
                        })
                    ),
                    /* ── Badge ────────────────────────────────────────────── */
                    el(PanelBody, { title: __('Badge', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show badge', 'blockenberg'),
                            checked: attributes.showBadge,
                            onChange: function (v) { setAttributes({ showBadge: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        attributes.showBadge && el(SelectControl, {
                            label: __('Badge shape', 'blockenberg'),
                            value: attributes.badgeShape,
                            options: BADGE_SHAPES,
                            onChange: function (v) { setAttributes({ badgeShape: v }); },
                        }),
                        attributes.showBadge && el(SelectControl, {
                            label: __('Badge position', 'blockenberg'),
                            value: attributes.badgePosition,
                            options: BADGE_POSITIONS,
                            onChange: function (v) { setAttributes({ badgePosition: v }); },
                        })
                    ),
                    /* ── Appearance ───────────────────────────────────────── */
                    el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            label: __('Card style', 'blockenberg'),
                            value: attributes.style,
                            options: STYLE_OPTIONS,
                            onChange: function (v) { setAttributes({ style: v }); },
                        }),
                        attributes.style === 'classic' && el(SelectControl, {
                            label: __('Accent strip side', 'blockenberg'),
                            value: attributes.stripSide,
                            options: STRIP_SIDES,
                            onChange: function (v) { setAttributes({ stripSide: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Border radius (px)', 'blockenberg'),
                            value: attributes.borderRadius,
                            min: 0, max: 40,
                            onChange: function (v) { setAttributes({ borderRadius: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Max width (px)', 'blockenberg'),
                            value: attributes.maxWidth,
                            min: 280, max: 900,
                            onChange: function (v) { setAttributes({ maxWidth: v }); },
                        })
                    ),
                    /* ── Colors ───────────────────────────────────────────── */
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: attributes.accentColor,  onChange: function (v) { setAttributes({ accentColor:  v || '#6c3fb5' }); }, label: __('Accent / strip',      'blockenberg') },
                            { value: attributes.bgColor,      onChange: function (v) { setAttributes({ bgColor:      v || '#ffffff' }); }, label: __('Card background',     'blockenberg') },
                            { value: attributes.textColor,    onChange: function (v) { setAttributes({ textColor:    v || '#1f2937' }); }, label: __('Title text',          'blockenberg') },
                            { value: attributes.descColor,    onChange: function (v) { setAttributes({ descColor:    v || '#6b7280' }); }, label: __('Description text',    'blockenberg') },
                            { value: attributes.badgeBg,      onChange: function (v) { setAttributes({ badgeBg:      v || '#6c3fb5' }); }, label: __('Badge background',    'blockenberg') },
                            { value: attributes.badgeColor,   onChange: function (v) { setAttributes({ badgeColor:   v || '#ffffff' }); }, label: __('Badge text',          'blockenberg') },
                            { value: attributes.codeBg,       onChange: function (v) { setAttributes({ codeBg:       v || '#f5f0ff' }); }, label: __('Code background',     'blockenberg') },
                            { value: attributes.codeColor,    onChange: function (v) { setAttributes({ codeColor:    v || '#6c3fb5' }); }, label: __('Code text',           'blockenberg') },
                            { value: attributes.btnBg,        onChange: function (v) { setAttributes({ btnBg:        v || '#6c3fb5' }); }, label: __('Button background',   'blockenberg') },
                            { value: attributes.btnColor,     onChange: function (v) { setAttributes({ btnColor:     v || '#ffffff' }); }, label: __('Button text',         'blockenberg') },
                        ],
                    }),
                    /* ── Typography ────────────────────────────────────────── */
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Title', 'blockenberg'), value: attributes.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                        _tc() && el(_tc(), { label: __('Description', 'blockenberg'), value: attributes.typoDesc, onChange: function (v) { setAttributes({ typoDesc: v }); } }),
                        el(RangeControl, { label: __('Code font size (px)', 'blockenberg'), value: attributes.codeFontSize, min: 14, max: 36, onChange: function (v) { setAttributes({ codeFontSize: v }); } }),
                        el(RangeControl, { label: __('Button font size (px)', 'blockenberg'), value: attributes.btnFontSize, min: 11, max: 24, onChange: function (v) { setAttributes({ btnFontSize: v }); } })
                    )
                ),
                el('div', blockProps,
                    el(CouponPreview, { attributes: attributes })
                )
            );
        },

        save: function (props) {
            var a     = props.attributes;
            var lines = badgeLabel(a).split('\n');

            var wrapStyle = Object.assign({
                '--bkcp-accent':   a.accentColor,
                '--bkcp-bg':       a.bgColor,
                '--bkcp-text':     a.textColor,
                '--bkcp-desc':     a.descColor,
                '--bkcp-badge-bg': a.badgeBg,
                '--bkcp-badge-c':  a.badgeColor,
                '--bkcp-code-bg':  a.codeBg,
                '--bkcp-code-c':   a.codeColor,
                '--bkcp-btn-bg':   a.btnBg,
                '--bkcp-btn-c':    a.btnColor,
                '--bkcp-radius':   a.borderRadius + 'px',
                maxWidth:          a.maxWidth + 'px',
            }, _tv(a.typoTitle, '--bkcp-ttl-'), _tv(a.typoDesc, '--bkcp-dsc-'));

            return el('div', {
                className: 'bkcp-coupon bkcp-style-' + a.style + ' bkcp-strip-' + a.stripSide,
                style:     wrapStyle,
                'data-copied-label': a.copiedLabel,
            },
                a.style === 'classic' && el('div', { className: 'bkcp-strip', 'aria-hidden': 'true' }),

                a.showBadge && a.badgePosition !== 'inline' && el('div', {
                    className: 'bkcp-badge bkcp-badge-' + a.badgeShape + ' bkcp-badge-pos-' + a.badgePosition,
                    'aria-hidden': 'true',
                },
                    lines.map(function (l, i) { return el('span', { key: i, 'data-line': i }, l); })
                ),

                el('div', { className: 'bkcp-body' },
                    a.showBadge && a.badgePosition === 'inline' && el('div', {
                        className: 'bkcp-badge-inline bkcp-badge-' + a.badgeShape,
                        'aria-hidden': 'true',
                    }, lines.join(' ')),

                    el('h3', { className: 'bkcp-title' }, a.title),
                    el('p',  { className: 'bkcp-desc'  }, a.description),

                    a.showCode && el('div', { className: 'bkcp-code-row' },
                        el('div', { className: 'bkcp-code-wrap' },
                            el('span', { className: 'bkcp-code-label' }, a.codeLabel),
                            el('span', { className: 'bkcp-code', 'data-code': a.code }, a.code)
                        ),
                        el('button', {
                            className: 'bkcp-copy-btn',
                            type:      'button',
                            'data-copy': a.code,
                            'aria-label': a.copyLabel + ' ' + a.code,
                        }, a.copyLabel)
                    ),

                    a.showExpiry && el('div', { className: 'bkcp-expiry' },
                        el('span', { className: 'bkcp-expiry-label' }, a.expiryLabel + ' '),
                        a.expiryDate && el('strong', { className: 'bkcp-expiry-date' }, a.expiryDate),
                        a.showCountdown && el('span', {
                            className: 'bkcp-countdown',
                            'data-expiry': a.expiryDate,
                        })
                    ),

                    a.showButton && el('a', {
                        href:   a.buttonUrl || '#',
                        target: a.buttonNewTab ? '_blank' : undefined,
                        rel:    a.buttonNewTab ? 'noopener noreferrer' : undefined,
                        className: 'bkcp-btn',
                    }, a.buttonText),

                    a.showNote && a.note && el('p', { className: 'bkcp-note' }, a.note)
                )
            );
        },
    });
}() );
