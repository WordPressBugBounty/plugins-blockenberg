( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;

    var _tc, _tvf;
    Object.defineProperty(window, '_bkbgTypoCtrlCache', { get: function () { if (!_tc) { _tc = window.bkbgTypographyControl; } return _tc; } });
    Object.defineProperty(window, '_bkbgTypoVarsCache', { get: function () { if (!_tvf) { _tvf = window.bkbgTypoCssVars; } return _tvf; } });
    function getTypoControl(props, attrName, label) { return window._bkbgTypoCtrlCache(props, attrName, label); }

    var POSITION_OPTIONS = [
        { label: 'Top',    value: 'top' },
        { label: 'Bottom', value: 'bottom' },
        { label: 'Left',   value: 'left' },
        { label: 'Right',  value: 'right' },
    ];

    var STYLE_OPTIONS = [
        { label: 'Dotted underline',  value: 'underline-dotted' },
        { label: 'Solid underline',   value: 'underline-solid' },
        { label: 'Dashed underline',  value: 'underline-dashed' },
        { label: 'Highlight',         value: 'highlight' },
        { label: 'Bold',              value: 'bold' },
        { label: 'Italic',            value: 'italic' },
        { label: 'None',              value: 'none' },
    ];

    var ANIM_OPTIONS = [
        { label: 'Fade',           value: 'fade' },
        { label: 'Scale up',       value: 'scale' },
        { label: 'Bounce',         value: 'bounce' },
        { label: 'Zoom out',       value: 'zoom-out' },
        { label: 'Slide down',     value: 'slide-down' },
        { label: 'Slide up',       value: 'slide-up' },
        { label: 'Slide left',     value: 'slide-left' },
        { label: 'Slide right',    value: 'slide-right' },
        { label: 'Blur',           value: 'blur' },
        { label: 'Flip',           value: 'flip' },
        { label: 'Rotate',         value: 'rotate' },
        { label: 'None',           value: 'none' },
    ];

    var WEIGHT_OPTIONS = [
        { label: 'Normal (400)', value: '400' },
        { label: 'Medium (500)', value: '500' },
        { label: 'Semi-bold (600)', value: '600' },
        { label: 'Bold (700)', value: '700' },
    ];

    var ALIGN_OPTIONS = [
        { label: 'Left',   value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right',  value: 'right' },
    ];

    function getTriggerStyle(a) {
        var style = {
            color: a.triggerColor,
            cursor: 'help',
            display: 'inline-block',
        };
        if (a.triggerStyle === 'underline-dotted') {
            style.textDecoration = 'underline';
            style.textDecorationStyle = 'dotted';
            style.textDecorationColor = a.underlineColor;
        } else if (a.triggerStyle === 'underline-solid') {
            style.textDecoration = 'underline';
            style.textDecorationColor = a.underlineColor;
        } else if (a.triggerStyle === 'underline-dashed') {
            style.textDecoration = 'underline';
            style.textDecorationStyle = 'dashed';
            style.textDecorationColor = a.underlineColor;
        } else if (a.triggerStyle === 'highlight') {
            style.background = a.highlightBg;
            style.borderRadius = '4px';
            style.padding = '0 4px';
        } else if (a.triggerStyle === 'bold') {
            style.fontWeight = '700';
        } else if (a.triggerStyle === 'italic') {
            style.fontStyle = 'italic';
        }
        return style;
    }

    registerBlockType('blockenberg/tooltip', {
        title: __('Tooltip', 'blockenberg'),
        icon: 'info',
        category: 'bkbg-content',
        description: __('Hover tooltip with trigger text and informational popup.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var showPreview = useState(false);
            var isPreviewOpen = showPreview[0];
            var setPreviewOpen = showPreview[1];

            var blockProps = (function () {
                var s = { textAlign: a.align };
                Object.assign(s, window._bkbgTypoVarsCache(a.triggerTypo, '--bkttp-tr-'), window._bkbgTypoVarsCache(a.tooltipTypo, '--bkttp-tp-'));
                return useBlockProps({ style: s });
            })();

            return el(Fragment, null,
                el(InspectorControls, null,
                    // Content
                    el(PanelBody, { title: 'Content', initialOpen: true },
                        el(TextControl, {
                            label: 'Trigger Text (visible)',
                            value: a.triggerText,
                            onChange: function (v) { set({ triggerText: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 10 } }),
                        el(TextareaControl, {
                            label: 'Tooltip Content (popup)',
                            value: a.tooltipContent,
                            rows: 4,
                            onChange: function (v) { set({ tooltipContent: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),

                    // Appearance
                    el(PanelBody, { title: 'Trigger Style', initialOpen: false },
                        el(SelectControl, { label: 'Trigger style', value: a.triggerStyle, options: STYLE_OPTIONS, onChange: function (v) { set({ triggerStyle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(SelectControl, { label: 'Text alignment', value: a.align, options: ALIGN_OPTIONS, onChange: function (v) { set({ align: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el('div', { style: { height: 10 } }),
                        ),

                    // Tooltip popup
                    el(PanelBody, { title: 'Tooltip Popup', initialOpen: false },
                        el(SelectControl, { label: 'Position', value: a.position, options: POSITION_OPTIONS, onChange: function (v) { set({ position: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(SelectControl, { label: 'Animation', value: a.animationType, options: ANIM_OPTIONS, onChange: function (v) { set({ animationType: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Max width (px)', value: a.maxWidth, min: 150, max: 480, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Padding (px)', value: a.tooltipPadding, min: 6, max: 24, onChange: function (v) { set({ tooltipPadding: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Border radius (px)', value: a.tooltipRadius, min: 0, max: 24, onChange: function (v) { set({ tooltipRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el('div', { style: { height: 10 } }),
                        el(ToggleControl, { label: 'Show arrow', checked: a.showArrow, onChange: function (v) { set({ showArrow: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Colors
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl(props, 'triggerTypo', __('Trigger', 'blockenberg')),
                        getTypoControl(props, 'tooltipTypo', __('Tooltip', 'blockenberg'))
                    ),
el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Trigger Text Color',    value: a.triggerColor,   onChange: function (v) { set({ triggerColor: v || '#6366f1' }); } },
                            { label: 'Underline / Accent Color', value: a.underlineColor, onChange: function (v) { set({ underlineColor: v || '#6366f1' }); } },
                            { label: 'Highlight Background',  value: a.highlightBg,    onChange: function (v) { set({ highlightBg: v || '#ede9fe' }); } },
                            { label: 'Tooltip Background',    value: a.tooltipBg,      onChange: function (v) { set({ tooltipBg: v || '#1e293b' }); } },
                            { label: 'Tooltip Text Color',    value: a.tooltipColor,   onChange: function (v) { set({ tooltipColor: v || '#f8fafc' }); } },
                        ]
                    })
                ),

                // ── Editor Preview ──
                el('div', blockProps,
                    el('div', {
                        style: { display: 'inline-block', position: 'relative' },
                        onMouseEnter: function () { setPreviewOpen(true); },
                        onMouseLeave: function () { setPreviewOpen(false); },
                    },
                        el('span', { style: getTriggerStyle(a) }, a.triggerText),
                        // Always in DOM so CSS transition works (same as frontend)
                        el('div', {
                            style: (function () {
                                var isLR = a.position === 'left' || a.position === 'right';
                                var anim = a.animationType || 'fade';
                                // Base transform (hidden state offset)
                                var hiddenTransform;
                                if (a.position === 'top')         hiddenTransform = 'translateX(-50%) translateY(4px)';
                                else if (a.position === 'bottom') hiddenTransform = 'translateX(-50%) translateY(-4px)';
                                else if (a.position === 'left')   hiddenTransform = 'translateY(-50%) translateX(4px)';
                                else                              hiddenTransform = 'translateY(-50%) translateX(-4px)';

                                var visibleTransform;
                                if (a.position === 'top' || a.position === 'bottom') visibleTransform = 'translateX(-50%) translateY(0)';
                                else                                                  visibleTransform = 'translateY(-50%) translateX(0)';

                                var customTransition = null;
                                var hiddenFilter = null;
                                var visibleFilter = null;

                                if (anim === 'scale') {
                                    hiddenTransform = isLR ? 'translateY(-50%) scale(0.9)' : 'translateX(-50%) scale(0.9)';
                                    visibleTransform = isLR ? 'translateY(-50%) scale(1)' : 'translateX(-50%) scale(1)';
                                } else if (anim === 'bounce') {
                                    hiddenTransform = isLR ? 'translateY(-50%) scale(0.6)' : 'translateX(-50%) scale(0.6)';
                                    visibleTransform = isLR ? 'translateY(-50%) scale(1)' : 'translateX(-50%) scale(1)';
                                    customTransition = 'opacity 0.4s cubic-bezier(0.34,1.56,0.64,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1), visibility 0.4s';
                                } else if (anim === 'zoom-out') {
                                    hiddenTransform = isLR ? 'translateY(-50%) scale(1.25)' : 'translateX(-50%) scale(1.25)';
                                    visibleTransform = isLR ? 'translateY(-50%) scale(1)' : 'translateX(-50%) scale(1)';
                                } else if (anim === 'slide-down') {
                                    hiddenTransform = isLR ? hiddenTransform : 'translateX(-50%) translateY(-8px)';
                                    visibleTransform = isLR ? visibleTransform : 'translateX(-50%) translateY(0)';
                                } else if (anim === 'slide-up') {
                                    hiddenTransform = isLR ? hiddenTransform : 'translateX(-50%) translateY(8px)';
                                    visibleTransform = isLR ? visibleTransform : 'translateX(-50%) translateY(0)';
                                } else if (anim === 'slide-left') {
                                    hiddenTransform = isLR ? hiddenTransform : 'translateX(calc(-50% + 12px))';
                                    visibleTransform = isLR ? visibleTransform : 'translateX(-50%)';
                                } else if (anim === 'slide-right') {
                                    hiddenTransform = isLR ? hiddenTransform : 'translateX(calc(-50% - 12px))';
                                    visibleTransform = isLR ? visibleTransform : 'translateX(-50%)';
                                } else if (anim === 'blur') {
                                    hiddenTransform = isLR ? 'translateY(-50%)' : 'translateX(-50%)';
                                    visibleTransform = isLR ? 'translateY(-50%)' : 'translateX(-50%)';
                                    hiddenFilter = 'blur(6px)';
                                    visibleFilter = 'blur(0px)';
                                    customTransition = 'opacity 0.25s ease, transform 0.25s ease, filter 0.25s ease, visibility 0.25s';
                                } else if (anim === 'flip') {
                                    hiddenTransform = isLR ? 'translateY(-50%) perspective(400px) rotateY(-90deg)' : 'translateX(-50%) perspective(400px) rotateX(-80deg)';
                                    visibleTransform = isLR ? 'translateY(-50%) perspective(400px) rotateY(0deg)' : 'translateX(-50%) perspective(400px) rotateX(0deg)';
                                    customTransition = 'opacity 0.3s ease, transform 0.3s ease, visibility 0.3s';
                                } else if (anim === 'rotate') {
                                    hiddenTransform = isLR ? 'translateY(-50%) rotate(-10deg) scale(0.88)' : 'translateX(-50%) rotate(-10deg) scale(0.88)';
                                    visibleTransform = isLR ? 'translateY(-50%) rotate(0deg) scale(1)' : 'translateX(-50%) rotate(0deg) scale(1)';
                                } else if (anim === 'none') {
                                    hiddenTransform = isLR ? 'translateY(-50%)' : 'translateX(-50%)';
                                    visibleTransform = isLR ? 'translateY(-50%)' : 'translateX(-50%)';
                                }

                                var baseStyle = {
                                    position: 'absolute',
                                    bottom: a.position === 'bottom' ? 'auto' : (isLR ? 'auto' : 'calc(100% + 10px)'),
                                    top: a.position === 'bottom' ? 'calc(100% + 10px)' : (isLR ? '50%' : 'auto'),
                                    left: a.position === 'right' ? 'calc(100% + 10px)' : (isLR ? 'auto' : '50%'),
                                    right: a.position === 'left' ? 'calc(100% + 10px)' : 'auto',
                                    maxWidth: a.maxWidth + 'px',
                                    minWidth: 140,
                                    background: a.tooltipBg,
                                    color: a.tooltipColor,
                                    fontSize: undefined,
                                    lineHeight: undefined,
                                    padding: a.tooltipPadding + 'px',
                                    borderRadius: a.tooltipRadius + 'px',
                                    zIndex: 9999,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                                    pointerEvents: 'none',
                                    whiteSpace: 'normal',
                                    opacity: isPreviewOpen ? 1 : 0,
                                    visibility: isPreviewOpen ? 'visible' : 'hidden',
                                    transform: isPreviewOpen ? visibleTransform : hiddenTransform,
                                    transition: customTransition || (anim === 'none'
                                        ? 'opacity 0s, visibility 0s'
                                        : 'opacity 0.22s ease, transform 0.22s ease, visibility 0.22s'),
                                };
                                if (hiddenFilter !== null) {
                                    baseStyle.filter = isPreviewOpen ? visibleFilter : hiddenFilter;
                                }
                                return baseStyle;
                            }())
                        },
                            a.tooltipContent,
                            a.showArrow && el('div', {
                                style: {
                                    position: 'absolute',
                                    width: 0, height: 0,
                                    bottom: a.position !== 'bottom' ? -6 : 'auto',
                                    top: a.position === 'bottom' ? -6 : 'auto',
                                    left: (a.position === 'top' || a.position === 'bottom') ? '50%' : 'auto',
                                    transform: (a.position === 'top' || a.position === 'bottom') ? 'translateX(-50%)' : undefined,
                                    borderLeft: (a.position === 'top' || a.position === 'bottom') ? '6px solid transparent' : 'none',
                                    borderRight: (a.position === 'top' || a.position === 'bottom') ? '6px solid transparent' : 'none',
                                    borderTop: a.position === 'top' ? '6px solid ' + a.tooltipBg : 'none',
                                    borderBottom: a.position === 'bottom' ? '6px solid ' + a.tooltipBg : 'none',
                                }
                            })
                        )
                    ),
                    el('p', { style: { fontSize: 11, color: '#9ca3af', margin: '8px 0 0' } },
                        '💡 Hover the text above to preview the tooltip.'
                    )
                )
            );
        },

        save: function (props) {
            var bp = (function () {
                var tv = Object.assign({}, window._bkbgTypoVarsCache(props.attributes.triggerTypo, '--bkttp-tr-'), window._bkbgTypoVarsCache(props.attributes.tooltipTypo, '--bkttp-tp-'));
                var parts = []; Object.keys(tv).forEach(function (k) { parts.push(k + ':' + tv[k]); });
                return useBlockProps.save(parts.length ? { style: parts.join(';') } : {});
            })();
            return el('div', bp,
                el('div', { className: 'bkbg-tt-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
