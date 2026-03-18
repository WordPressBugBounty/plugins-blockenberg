( function () {
    var el                = wp.element.createElement;
    var Fragment          = wp.element.Fragment;
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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var _tvf = function (typo, prefix) { var fn = getTypoCssVars(); return fn ? fn(typo, prefix) : {}; };

    var HOVER_OPTIONS = [
        { label: __('Fill text on hover', 'blockenberg'),         value: 'fill'   },
        { label: __('Change stroke color on hover', 'blockenberg'), value: 'stroke' },
        { label: __('Scale up on hover', 'blockenberg'),          value: 'scale'  },
        { label: __('None', 'blockenberg'),                        value: 'none'   },
    ];

    var TAG_OPTIONS = [
        { label: 'h1', value: 'h1' },
        { label: 'h2', value: 'h2' },
        { label: 'h3', value: 'h3' },
        { label: 'h4', value: 'h4' },
        { label: 'p',  value: 'p'  },
        { label: 'div', value: 'div' },
    ];

    var WEIGHT_OPTIONS = [
        { label: '400 – Regular',    value: '400' },
        { label: '500 – Medium',     value: '500' },
        { label: '600 – Semi-bold',  value: '600' },
        { label: '700 – Bold',       value: '700' },
        { label: '800 – Extra-bold', value: '800' },
        { label: '900 – Black',      value: '900' },
    ];

    var TRANSFORM_OPTIONS = [
        { label: __('None', 'blockenberg'),       value: 'none'       },
        { label: __('Uppercase', 'blockenberg'),   value: 'uppercase'  },
        { label: __('Lowercase', 'blockenberg'),   value: 'lowercase'  },
        { label: __('Capitalize', 'blockenberg'),  value: 'capitalize' },
    ];

    function buildTextStyle(a) {
        var style = {
            textAlign:       a.textAlign,
            WebkitTextStroke: a.strokeWidth + 'px ' + a.strokeColor,
            color:           a.fillColor || 'transparent',
            display:         'block',
            transition:      'color ' + a.transitionDuration + 'ms, -webkit-text-stroke-color ' + a.transitionDuration + 'ms, transform ' + a.transitionDuration + 'ms',
        };

        if (a.shadowBlur > 0) {
            style.textShadow = '0 0 ' + a.shadowBlur + 'px ' + a.shadowColor;
        }

        if (a.useGradient) {
            style.backgroundImage = 'linear-gradient(' + a.gradientAngle + 'deg, ' + a.gradientColor1 + ', ' + a.gradientColor2 + ')';
            style.WebkitBackgroundClip = 'text';
            style.backgroundClip = 'text';
            style.color = 'transparent';
            style.WebkitTextStroke = a.strokeWidth + 'px transparent';
        }

        return style;
    }

    registerBlockType('blockenberg/text-stroke', {
        title: __('Text Stroke', 'blockenberg'),
        description: __('Large outlined hollow text with advanced styling.', 'blockenberg'),
        category: 'bkbg-effects',
        icon: 'editor-textcolor',

        edit: function (props) {
            var attributes  = props.attributes;
            var setAttributes = props.setAttributes;

            var blockProps = useBlockProps((function () {
                var s = {
                    background:    attributes.wrapBg || undefined,
                    paddingTop:    attributes.paddingTop + 'px',
                    paddingBottom: attributes.paddingBottom + 'px',
                    textAlign:     attributes.textAlign,
                };
                Object.assign(s, _tvf(attributes.titleTypo, '--bkts-tt-'));
                return { className: 'bkts-wrap', style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,
                    /* ── Text ──────────────────────────────────────────────── */
                    el(PanelBody, { title: __('Text', 'blockenberg'), initialOpen: true },
                        el(TextareaControl, {
                            label: __('Content', 'blockenberg'),
                            value: attributes.text,
                            onChange: function (v) { setAttributes({ text: v }); },
                            rows: 2,
                        }),
                        el(SelectControl, {
                            label: __('HTML tag', 'blockenberg'),
                            value: attributes.tag,
                            options: TAG_OPTIONS,
                            onChange: function (v) { setAttributes({ tag: v }); },
                        }),
                        el(SelectControl, {
                            label: __('Alignment', 'blockenberg'),
                            value: attributes.textAlign,
                            options: [
                                { label: __('Left', 'blockenberg'),   value: 'left'   },
                                { label: __('Center', 'blockenberg'), value: 'center' },
                                { label: __('Right', 'blockenberg'),  value: 'right'  },
                            ],
                            onChange: function (v) { setAttributes({ textAlign: v }); },
                        }),
                        el(TextControl, {
                            label: __('Link URL (optional)', 'blockenberg'),
                            value: attributes.linkUrl,
                            type: 'url',
                            onChange: function (v) { setAttributes({ linkUrl: v }); },
                        }),
                        attributes.linkUrl && el(ToggleControl, {
                            label: __('Open in new tab', 'blockenberg'),
                            checked: attributes.linkNewTab,
                            onChange: function (v) { setAttributes({ linkNewTab: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),
                    /* ── Stroke ─────────────────────────────────────────────── */
                    el(PanelBody, { title: __('Stroke', 'blockenberg'), initialOpen: true },
                        el(RangeControl, {
                            label: __('Stroke width (px)', 'blockenberg'),
                            value: attributes.strokeWidth,
                            min: 0, max: 12, step: 0.5,
                            onChange: function (v) { setAttributes({ strokeWidth: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Text shadow blur (px)', 'blockenberg'),
                            value: attributes.shadowBlur,
                            min: 0, max: 60,
                            onChange: function (v) { setAttributes({ shadowBlur: v }); },
                        })
                    ),
                    /* ── Gradient ───────────────────────────────────────────── */
                    el(PanelBody, { title: __('Gradient overlay', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Use gradient', 'blockenberg'),
                            help: __('Applies gradient via background-clip; overrides fill color.', 'blockenberg'),
                            checked: attributes.useGradient,
                            onChange: function (v) { setAttributes({ useGradient: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        attributes.useGradient && el(RangeControl, {
                            label: __('Gradient angle (°)', 'blockenberg'),
                            value: attributes.gradientAngle,
                            min: 0, max: 360,
                            onChange: function (v) { setAttributes({ gradientAngle: v }); },
                        })
                    ),
                    /* ── Hover ──────────────────────────────────────────────── */
                    el(PanelBody, { title: __('Hover Effect', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            label: __('Hover effect', 'blockenberg'),
                            value: attributes.hoverEffect,
                            options: HOVER_OPTIONS,
                            onChange: function (v) { setAttributes({ hoverEffect: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Transition duration (ms)', 'blockenberg'),
                            value: attributes.transitionDuration,
                            min: 0, max: 1000, step: 50,
                            onChange: function (v) { setAttributes({ transitionDuration: v }); },
                        })
                    ),
                    /* ── Layout ─────────────────────────────────────────────── */
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Padding top (px)', 'blockenberg'),
                            value: attributes.paddingTop,
                            min: 0, max: 160,
                            onChange: function (v) { setAttributes({ paddingTop: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Padding bottom (px)', 'blockenberg'),
                            value: attributes.paddingBottom,
                            min: 0, max: 160,
                            onChange: function (v) { setAttributes({ paddingBottom: v }); },
                        })
                    ),
                    /* ── Colors ─────────────────────────────────────────────── */
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && getTypoControl()({
                            label: __('Text', 'blockenberg'),
                            value: attributes.titleTypo || {},
                            onChange: function (v) { setAttributes({ titleTypo: v }); }
                        })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            {
                                value: attributes.strokeColor,
                                onChange: function (v) { setAttributes({ strokeColor: v || '#6c3fb5' }); },
                                label: __('Stroke color', 'blockenberg'),
                            },
                            {
                                value: attributes.fillColor === 'transparent' ? '' : attributes.fillColor,
                                onChange: function (v) { setAttributes({ fillColor: v || 'transparent' }); },
                                label: __('Fill color (blank = hollow)', 'blockenberg'),
                            },
                            {
                                value: attributes.hoverFillColor,
                                onChange: function (v) { setAttributes({ hoverFillColor: v || '#6c3fb5' }); },
                                label: __('Hover fill color', 'blockenberg'),
                            },
                            {
                                value: attributes.hoverStrokeColor,
                                onChange: function (v) { setAttributes({ hoverStrokeColor: v || '' }); },
                                label: __('Hover stroke color', 'blockenberg'),
                            },
                            {
                                value: attributes.gradientColor1,
                                onChange: function (v) { setAttributes({ gradientColor1: v || '#6c3fb5' }); },
                                label: __('Gradient color 1', 'blockenberg'),
                            },
                            {
                                value: attributes.gradientColor2,
                                onChange: function (v) { setAttributes({ gradientColor2: v || '#ec4899' }); },
                                label: __('Gradient color 2', 'blockenberg'),
                            },
                            {
                                value: attributes.shadowColor,
                                onChange: function (v) { setAttributes({ shadowColor: v || '#000000' }); },
                                label: __('Shadow color', 'blockenberg'),
                            },
                            {
                                value: attributes.wrapBg,
                                onChange: function (v) { setAttributes({ wrapBg: v || '' }); },
                                label: __('Section background', 'blockenberg'),
                            },
                        ],
                    })
                ),
                el('div', blockProps,
                    el(attributes.tag, {
                        className: 'bkts-text',
                        style: buildTextStyle(attributes),
                        contentEditable: true,
                        suppressContentEditableWarning: true,
                        onInput: function (e) { setAttributes({ text: e.currentTarget.textContent }); },
                    }, attributes.text)
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var textStyle = buildTextStyle(a);

            var blockProps = wp.blockEditor.useBlockProps.save((function () {
                var s = {
                    background:    a.wrapBg || undefined,
                    paddingTop:    a.paddingTop + 'px',
                    paddingBottom: a.paddingBottom + 'px',
                    textAlign:     a.textAlign,
                };
                Object.assign(s, _tvf(a.titleTypo, '--bkts-tt-'));
                return {
                    className: 'bkts-wrap',
                    style: s,
                    'data-hover': a.hoverEffect,
                    'data-hover-fill': a.hoverFillColor,
                    'data-hover-stroke': a.hoverStrokeColor || a.strokeColor,
                };
            })());

            var textEl = el(a.tag, { className: 'bkts-text', style: textStyle }, a.text);

            var inner = a.linkUrl
                ? el('a', {
                    href: a.linkUrl,
                    target: a.linkNewTab ? '_blank' : undefined,
                    rel: a.linkNewTab ? 'noopener noreferrer' : undefined,
                    style: { textDecoration: 'none', display: 'block' },
                }, textEl)
                : textEl;

            return el('div', blockProps, inner);
        },
    });
}() );
