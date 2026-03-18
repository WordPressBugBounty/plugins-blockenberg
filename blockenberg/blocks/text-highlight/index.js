( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextareaControl = wp.components.TextareaControl;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var _tvf = function (typo, prefix) { var fn = getTypoCssVars(); return fn ? fn(typo, prefix) : {}; };

    // Build spans from text, wrapping matching phrases with highlight spans
    function buildHighlightedText(text, highlights, style, hlColor, opacity, radius, padX, padY, lineThick, linePos, animate) {
        if (!text) return [];

        var phrases = (highlights || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);

        if (!phrases.length) return [text];

        // Sort by length desc so longer phrases matched first
        phrases.sort(function (a, b) { return b.length - a.length; });

        // Build regex from phrases (case insensitive)
        var pattern = phrases.map(function (p) {
            return p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }).join('|');
        var regex = new RegExp('(' + pattern + ')', 'gi');

        var parts = text.split(regex);
        var opacityFrac = (opacity || 100) / 100;

        return parts.map(function (part, i) {
            if (!part) return null;
            var isMatch = phrases.some(function (p) { return p.toLowerCase() === part.toLowerCase(); });

            if (!isMatch) return el('span', { key: i }, part);

            var hlStyles = {
                display: 'inline',
                position: 'relative',
                zIndex: 0
            };

            var markStyles = {};

            if (style === 'marker') {
                markStyles = {
                    background: hlColor + Math.round(opacityFrac * 255).toString(16).padStart(2, '0'),
                    borderRadius: radius + 'px',
                    padding: padY + 'px ' + padX + 'px',
                    display: 'inline',
                    position: 'relative',
                    zIndex: -1
                };
            } else if (style === 'underline') {
                markStyles = {
                    borderBottom: lineThick + 'px solid ' + hlColor,
                    display: 'inline',
                    paddingBottom: '2px'
                };
            } else if (style === 'strikethrough') {
                markStyles = {
                    textDecoration: 'line-through',
                    textDecorationColor: hlColor,
                    textDecorationThickness: lineThick + 'px'
                };
            } else if (style === 'box') {
                markStyles = {
                    outline: lineThick + 'px solid ' + hlColor,
                    borderRadius: radius + 'px',
                    padding: padY + 'px ' + padX + 'px',
                    display: 'inline'
                };
            } else if (style === 'glow') {
                markStyles = {
                    textShadow: '0 0 ' + (lineThick * 3) + 'px ' + hlColor,
                    display: 'inline'
                };
            }

            return el('mark', {
                key: i,
                className: 'bkth-hl bkth-hl--' + style + (animate ? ' bkth-animate' : ' bkth-revealed'),
                style: markStyles
            }, part);
        }).filter(Boolean);
    }

    registerBlockType('blockenberg/text-highlight', {

        edit: function (props) {
            var attrs = props.attributes;
            var setAttr = props.setAttributes;

            var Tag = attrs.tag || 'h2';

            var textStyle = {
                textAlign: attrs.textAlign,
                color: attrs.textColor,
                maxWidth: attrs.maxWidth + 'px',
                margin: '0 auto'
            };

            var rendered = buildHighlightedText(
                attrs.text, attrs.highlights,
                attrs.highlightStyle, attrs.highlightColor,
                attrs.highlightOpacity, attrs.highlightRadius,
                attrs.highlightPadX, attrs.highlightPadY,
                attrs.lineThickness, attrs.linePosition,
                false // editor: always show revealed
            );

            var blockProps = useBlockProps((function () {
                var s = {
                    paddingTop: attrs.paddingTop + 'px',
                    paddingBottom: attrs.paddingBottom + 'px'
                };
                if (attrs.bgColor) s.background = attrs.bgColor;
                Object.assign(s, _tvf(attrs.titleTypo, '--bkth-tt-'));
                return { className: 'bkth-wrap', style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Text', 'blockenberg'), initialOpen: true },
                        el(TextareaControl, {
                            label: __('Text', 'blockenberg'),
                            rows: 4,
                            value: attrs.text,
                            onChange: function (v) { setAttr({ text: v }); }
                        }),
                        el(TextControl, {
                            label: __('Highlight phrases (comma-separated)', 'blockenberg'),
                            help: __('e.g. "grow faster, smarter marketing"', 'blockenberg'),
                            value: attrs.highlights,
                            onChange: function (v) { setAttr({ highlights: v }); }
                        }),
                        el(SelectControl, {
                            label: __('HTML Tag', 'blockenberg'),
                            value: attrs.tag,
                            options: [
                                { label: 'H1', value: 'h1' },
                                { label: 'H2', value: 'h2' },
                                { label: 'H3', value: 'h3' },
                                { label: 'H4', value: 'h4' },
                                { label: 'Paragraph', value: 'p' },
                                { label: 'Div', value: 'div' }
                            ],
                            onChange: function (v) { setAttr({ tag: v }); }
                        })
                    ),

                    el(PanelBody, { title: __('Highlight Style', 'blockenberg'), initialOpen: true },
                        el(SelectControl, {
                            label: __('Style', 'blockenberg'),
                            value: attrs.highlightStyle,
                            options: [
                                { label: 'Marker (background fill)', value: 'marker' },
                                { label: 'Underline', value: 'underline' },
                                { label: 'Box outline', value: 'box' },
                                { label: 'Strikethrough', value: 'strikethrough' },
                                { label: 'Glow', value: 'glow' }
                            ],
                            onChange: function (v) { setAttr({ highlightStyle: v }); }
                        }),
                        (attrs.highlightStyle === 'marker' || attrs.highlightStyle === 'box') && el(RangeControl, {
                            label: __('Corner Radius', 'blockenberg'),
                            value: attrs.highlightRadius, min: 0, max: 24,
                            onChange: function (v) { setAttr({ highlightRadius: v }); }
                        }),
                        (attrs.highlightStyle === 'marker') && el(RangeControl, {
                            label: __('Horizontal Padding', 'blockenberg'),
                            value: attrs.highlightPadX, min: 0, max: 24,
                            onChange: function (v) { setAttr({ highlightPadX: v }); }
                        }),
                        (attrs.highlightStyle === 'marker') && el(RangeControl, {
                            label: __('Vertical Padding', 'blockenberg'),
                            value: attrs.highlightPadY, min: 0, max: 24,
                            onChange: function (v) { setAttr({ highlightPadY: v }); }
                        }),
                        (attrs.highlightStyle !== 'marker' && attrs.highlightStyle !== 'glow') && el(RangeControl, {
                            label: __('Line / Border Thickness', 'blockenberg'),
                            value: attrs.lineThickness, min: 1, max: 20,
                            onChange: function (v) { setAttr({ lineThickness: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Opacity (%)', 'blockenberg'),
                            value: attrs.highlightOpacity, min: 10, max: 100,
                            onChange: function (v) { setAttr({ highlightOpacity: v }); }
                        })
                    ),

                    el(PanelBody, { title: __('Animation', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Animate on scroll', 'blockenberg'),
                            checked: attrs.animateOnScroll,
                            onChange: function (v) { setAttr({ animateOnScroll: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        attrs.animateOnScroll && el(SelectControl, {
                            label: __('Animation style', 'blockenberg'),
                            value: attrs.animationStyle,
                            options: [
                                { label: 'Sweep (left to right)', value: 'sweep' },
                                { label: 'Fade in', value: 'fade' },
                                { label: 'Scale up', value: 'scale' },
                                { label: 'Pop', value: 'pop' }
                            ],
                            onChange: function (v) { setAttr({ animationStyle: v }); }
                        }),
                        attrs.animateOnScroll && el(RangeControl, {
                            label: __('Duration (ms)', 'blockenberg'),
                            value: attrs.animationDuration, min: 100, max: 2000,
                            onChange: function (v) { setAttr({ animationDuration: v }); }
                        }),
                        attrs.animateOnScroll && el(RangeControl, {
                            label: __('Stagger delay (ms)', 'blockenberg'),
                            value: attrs.animationDelay, min: 0, max: 400,
                            onChange: function (v) { setAttr({ animationDelay: v }); }
                        }),
                        attrs.animateOnScroll && el(RangeControl, {
                            label: __('Scroll threshold (0.0–1.0)', 'blockenberg'),
                            value: attrs.threshold, min: 0, max: 1, step: 0.05,
                            onChange: function (v) { setAttr({ threshold: v }); }
                        }),
                        attrs.animateOnScroll && el(ToggleControl, {
                            label: __('Repeat on re-enter', 'blockenberg'),
                            checked: attrs.repeat,
                            onChange: function (v) { setAttr({ repeat: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),

                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() && getTypoControl()({
                            label: __('Title', 'blockenberg'),
                            value: attrs.titleTypo || {},
                            onChange: function (v) { setAttr({ titleTypo: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Text Align', 'blockenberg'),
                            value: attrs.textAlign,
                            options: [
                                { label: 'Left', value: 'left' },
                                { label: 'Center', value: 'center' },
                                { label: 'Right', value: 'right' }
                            ],
                            onChange: function (v) { setAttr({ textAlign: v }); }
                        })
                    ),

                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Max Width (px)', 'blockenberg'),
                            value: attrs.maxWidth, min: 300, max: 1600,
                            onChange: function (v) { setAttr({ maxWidth: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Padding Top (px)', 'blockenberg'),
                            value: attrs.paddingTop, min: 0, max: 200,
                            onChange: function (v) { setAttr({ paddingTop: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Padding Bottom (px)', 'blockenberg'),
                            value: attrs.paddingBottom, min: 0, max: 200,
                            onChange: function (v) { setAttr({ paddingBottom: v }); }
                        })
                    ),

                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Highlight Color', 'blockenberg'), value: attrs.highlightColor, onChange: function (v) { setAttr({ highlightColor: v || '#fde68a' }); } },
                            { label: __('Text Color', 'blockenberg'), value: attrs.textColor, onChange: function (v) { setAttr({ textColor: v || '#111827' }); } },
                            { label: __('Background', 'blockenberg'), value: attrs.bgColor, onChange: function (v) { setAttr({ bgColor: v || '' }); } }
                        ]
                    })
                ),

                el('div', blockProps,
                    el(Tag, { className: 'bkth-title', style: textStyle }, rendered)
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var Tag = a.tag || 'h2';
            var phrases = (a.highlights || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);

            var wrapStyle = {
                paddingTop: a.paddingTop + 'px',
                paddingBottom: a.paddingBottom + 'px',
                '--bkth-hl-color': a.highlightColor,
                '--bkth-hl-dur': a.animationDuration + 'ms',
                '--bkth-hl-delay': a.animationDelay + 'ms'
            };
            if (a.bgColor) wrapStyle.background = a.bgColor;

            var textStyle = {
                textAlign: a.textAlign,
                color: a.textColor,
                maxWidth: a.maxWidth + 'px',
                margin: '0 auto'
            };

            var blockProps = wp.blockEditor.useBlockProps.save((function () {
                var s = Object.assign({}, wrapStyle);
                Object.assign(s, _tvf(a.titleTypo, '--bkth-tt-'));
                return {
                    className: 'bkth-wrap',
                    style: s,
                    'data-animate': a.animateOnScroll ? '1' : '0',
                    'data-anim-style': a.animationStyle,
                    'data-threshold': a.threshold,
                    'data-repeat': a.repeat ? '1' : '0'
                };
            })());

            if (!phrases.length) {
                return el('div', blockProps, el(Tag, { className: 'bkth-title', style: textStyle }, a.text));
            }

            phrases.sort(function (a2, b) { return b.length - a2.length; });
            var pattern = phrases.map(function (p) { return p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|');
            var regex = new RegExp('(' + pattern + ')', 'gi');
            var parts = a.text.split(regex);

            var opacityHex = Math.round((a.highlightOpacity / 100) * 255).toString(16).padStart(2, '0');
            var hlIdx = 0;

            var spans = parts.map(function (part, i) {
                if (!part) return null;
                var isMatch = phrases.some(function (p) { return p.toLowerCase() === part.toLowerCase(); });
                if (!isMatch) return el('span', { key: i }, part);

                var hlStyle = {};
                var hs = a.highlightStyle;
                if (hs === 'marker') {
                    hlStyle = {
                        background: a.highlightColor + opacityHex,
                        borderRadius: a.highlightRadius + 'px',
                        padding: a.highlightPadY + 'px ' + a.highlightPadX + 'px'
                    };
                } else if (hs === 'underline') {
                    hlStyle = { borderBottom: a.lineThickness + 'px solid ' + a.highlightColor, paddingBottom: '2px' };
                } else if (hs === 'strikethrough') {
                    hlStyle = { textDecoration: 'line-through', textDecorationColor: a.highlightColor, textDecorationThickness: a.lineThickness + 'px' };
                } else if (hs === 'box') {
                    hlStyle = { outline: a.lineThickness + 'px solid ' + a.highlightColor, borderRadius: a.highlightRadius + 'px', padding: a.highlightPadY + 'px ' + a.highlightPadX + 'px' };
                } else if (hs === 'glow') {
                    hlStyle = { textShadow: '0 0 ' + (a.lineThickness * 3) + 'px ' + a.highlightColor };
                }

                var idx = hlIdx++;
                return el('mark', {
                    key: i,
                    className: 'bkth-hl bkth-hl--' + hs + (a.animateOnScroll ? ' bkth-animate' : ' bkth-revealed'),
                    style: hlStyle,
                    'data-bkth-i': idx
                }, part);
            }).filter(Boolean);

            return el('div', blockProps, el(Tag, { className: 'bkth-title', style: textStyle }, spans));
        }
    });
}() );
