( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;
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
    var TextControl = wp.components.TextControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── SVG shape paths ─────────────────────────────────────────────────────────
    var SHAPES = {
        star:   'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
        heart:  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
        diamond:'M12 2l9 10-9 10L3 12z',
        thumb:  'M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z'
    };

    // ── Generate unique block ID ─────────────────────────────────────────────────
    function generateId() {
        return 'sr' + Math.random().toString(36).substr(2, 8);
    }

    // ── Build a single star SVG ──────────────────────────────────────────────────
    // fill: 'full' | 'half' | 'empty'
    // clipId: unique string for the <clipPath id>
    function buildStarSVG(fill, shape, filledColor, emptyColor, clipId) {
        var filled = filledColor || '#f59e0b';
        var empty  = emptyColor  || '#e2e8f0';
        var svgProps = {
            viewBox: '0 0 24 24',
            xmlns: 'http://www.w3.org/2000/svg',
            width: '100%',
            height: '100%',
            style: { display: 'block', overflow: 'visible' }
        };

        function makeShape(tag, extraProps) {
            if (tag === 'circle') {
                return el('circle', Object.assign({ cx: '12', cy: '12', r: '10' }, extraProps));
            }
            return el('path', Object.assign({ d: SHAPES[shape] || SHAPES.star }, extraProps));
        }

        var useCircle = shape === 'circle';
        var shapeTag  = useCircle ? 'circle' : 'path';

        if (fill === 'full') {
            return el('svg', svgProps, makeShape(shapeTag, { fill: filled }));
        }
        if (fill === 'empty') {
            return el('svg', svgProps, makeShape(shapeTag, { fill: empty }));
        }
        // half — left 50% filled, right 50% empty, using clipPath
        return el('svg', svgProps,
            el('defs', {},
                el('clipPath', { id: clipId },
                    el('rect', { x: '0', y: '0', width: '12', height: '24' })
                )
            ),
            makeShape(shapeTag, { key: 'bg', fill: empty }),
            makeShape(shapeTag, { key: 'fg', fill: filled, 'clipPath': 'url(#' + clipId + ')' })
        );
    }

    // ── Build star row elements ──────────────────────────────────────────────────
    function buildStars(rating, maxStars, shape, filledColor, emptyColor, blockId) {
        var stars = [];
        for (var i = 1; i <= maxStars; i++) {
            var fill;
            if (rating >= i) {
                fill = 'full';
            } else if (rating >= i - 0.5) {
                fill = 'half';
            } else {
                fill = 'empty';
            }
            var clipId = 'bkbg-sr-' + blockId + '-' + i;
            stars.push(el('span', {
                key: i,
                className: 'bkbg-sr-star',
                'aria-hidden': 'true'
            }, buildStarSVG(fill, shape, filledColor, emptyColor, clipId)));
        }
        return stars;
    }

    // ── Format numeric label ────────────────────────────────────────────────────
    function formatNumeric(template, rating, max) {
        return (template || '{rating} out of {max}')
            .replace('{rating}', rating)
            .replace('{max}', max);
    }

    registerBlockType('blockenberg/star-rating', {
        title: __('Star Rating', 'blockenberg'),
        icon: 'star-filled',
        category: 'bkbg-blog',
        description: __('Static visual star rating with optional label and numeric score.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            // ── Generate blockId on first mount ────────────────────────────────
            useEffect(function () {
                if (!a.blockId) {
                    setAttributes({ blockId: generateId() });
                }
            }, []);

            // ── Hover state for interactive star picker ────────────────────────
            var hoverState = useState(null);
            var hoverRating = hoverState[0];
            var setHoverRating = hoverState[1];

            // ── Color picker state ─────────────────────────────────────────────
            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

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

            // ── Option lists ───────────────────────────────────────────────────
            var starShapeOptions = [
                { label: __('Star', 'blockenberg'),    value: 'star' },
                { label: __('Heart', 'blockenberg'),   value: 'heart' },
                { label: __('Diamond', 'blockenberg'), value: 'diamond' },
                { label: __('Thumbs Up', 'blockenberg'), value: 'thumb' },
                { label: __('Circle', 'blockenberg'),  value: 'circle' }
            ];

            var textAlignOptions = [
                { label: __('Left', 'blockenberg'),   value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right', 'blockenberg'),  value: 'right' }
            ];

            var labelPositionOptions = [
                { label: __('Below stars', 'blockenberg'),   value: 'below' },
                { label: __('Above stars', 'blockenberg'),   value: 'above' },
                { label: __('Left of stars', 'blockenberg'), value: 'left' },
                { label: __('Right of stars', 'blockenberg'), value: 'right' }
            ];

            var fontWeightOptions = [
                { label: '300 — Light',      value: 300 },
                { label: '400 — Regular',    value: 400 },
                { label: '500 — Medium',     value: 500 },
                { label: '600 — Semi Bold',  value: 600 },
                { label: '700 — Bold',       value: 700 },
                { label: '800 — Extra Bold', value: 800 }
            ];

            // Display rating: use hover preview if hovering
            var displayRating = hoverRating !== null ? hoverRating : a.rating;
            var blockId = a.blockId || 'preview';

            // ── Interactive star picker (canvas) ───────────────────────────────
            function makeInteractiveStar(i) {
                var isFilled   = displayRating >= i;
                var isHalfFill = displayRating >= i - 0.5 && displayRating < i;
                var fill = isFilled ? 'full' : (isHalfFill ? 'half' : 'empty');
                var clipId = 'bkbg-sr-edit-' + blockId + '-' + i;
                return el('span', {
                    key: 'es-' + i,
                    className: 'bkbg-sr-star bkbg-sr-star--interactive',
                    title: i + ' ' + __('stars', 'blockenberg'),
                    onMouseEnter: function () { setHoverRating(i); },
                    onMouseLeave: function () { setHoverRating(null); },
                    onClick:      function () { setAttributes({ rating: i }); },
                    style: { cursor: 'pointer' }
                }, buildStarSVG(fill, a.starShape, a.filledColor, a.emptyColor, clipId));
            }

            var interactiveStars = [];
            for (var i = 1; i <= a.maxStars; i++) {
                interactiveStars.push(makeInteractiveStar(i));
            }

            // ── CSS vars ──────────────────────────────────────────────────────
            var tv = getTypoCssVars();
            var wrapStyle = {
                '--bkbg-sr-star-size': a.starSize + 'px',
                '--bkbg-sr-star-gap':  a.starGap + 'px',
                '--bkbg-sr-label-size':    a.labelSize + 'px',
                '--bkbg-sr-label-weight':  a.labelWeight,
                '--bkbg-sr-label-color':   a.labelColor,
                '--bkbg-sr-label-lh':      a.labelLH,
                '--bkbg-sr-label-spacing': a.labelSpacing + 'px',
                '--bkbg-sr-num-size':    a.numericSize + 'px',
                '--bkbg-sr-num-weight':  a.numericWeight,
                '--bkbg-sr-num-color':   a.numericColor,
                '--bkbg-sr-num-spacing': a.numericSpacing + 'px'
            };
            Object.assign(wrapStyle, tv(a.labelTypo, '--bksr-lb-'));
            Object.assign(wrapStyle, tv(a.numericTypo, '--bksr-nm-'));

            // ── Inspector Controls ─────────────────────────────────────────────
            var inspector = el(InspectorControls, {},

                // ── Stars ─────────────────────────────────────────────────────
                el(PanelBody, { title: __('Stars', 'blockenberg'), initialOpen: true },
                    el('p', { style: { margin: '0 0 8px', fontSize: '12px', color: '#757575' } },
                        __('Click a star in the block to quickly set the rating.', 'blockenberg')
                    ),
                    el(RangeControl, {
                        label: __('Rating', 'blockenberg'),
                        value: a.rating,
                        min: 0,
                        max: a.maxStars,
                        step: 0.5,
                        onChange: function (v) { setAttributes({ rating: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Stars', 'blockenberg'),
                        value: a.maxStars,
                        min: 1,
                        max: 10,
                        onChange: function (v) {
                            var newMax = v;
                            setAttributes({ maxStars: newMax, rating: Math.min(a.rating, newMax) });
                        }
                    }),
                    el(SelectControl, {
                        label: __('Shape', 'blockenberg'),
                        value: a.starShape,
                        options: starShapeOptions,
                        onChange: function (v) { setAttributes({ starShape: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Size (px)', 'blockenberg'),
                        value: a.starSize,
                        min: 12,
                        max: 80,
                        onChange: function (v) { setAttributes({ starSize: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap between stars (px)', 'blockenberg'),
                        value: a.starGap,
                        min: 0,
                        max: 24,
                        onChange: function (v) { setAttributes({ starGap: v }); }
                    })
                ),

                // ── Layout ────────────────────────────────────────────────────
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Alignment', 'blockenberg'),
                        value: a.textAlign,
                        options: textAlignOptions,
                        onChange: function (v) { setAttributes({ textAlign: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Label', 'blockenberg'),
                        checked: a.showLabel,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showLabel: v }); }
                    }),
                    a.showLabel && el(SelectControl, {
                        label: __('Label Position', 'blockenberg'),
                        value: a.labelPosition,
                        options: labelPositionOptions,
                        onChange: function (v) { setAttributes({ labelPosition: v }); }
                    }),
                    el('hr', {}),
                    el(ToggleControl, {
                        label: __('Show Numeric Score', 'blockenberg'),
                        checked: a.showNumeric,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showNumeric: v }); }
                    }),
                    a.showNumeric && el(TextControl, {
                        label: __('Numeric Template', 'blockenberg'),
                        value: a.numericTemplate,
                        help: __('Use {rating} and {max} as placeholders.', 'blockenberg'),
                        onChange: function (v) { setAttributes({ numericTemplate: v }); }
                    })
                ),

                // ── Typography ────────────────────────────────────────────────
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    a.showLabel && getTypoControl()({ label: __('Label', 'blockenberg'), value: a.labelTypo, onChange: function (v) { setAttributes({ labelTypo: v }); } }),
                    a.showLabel && el(RangeControl, {
                        label: __('Label spacing from stars', 'blockenberg'),
                        value: a.labelSpacing,
                        min: 0,
                        max: 40,
                        onChange: function (v) { setAttributes({ labelSpacing: v }); }
                    }),
                    a.showNumeric && getTypoControl()({ label: __('Numeric Score', 'blockenberg'), value: a.numericTypo, onChange: function (v) { setAttributes({ numericTypo: v }); } }),
                    a.showNumeric && el(RangeControl, {
                        label: __('Numeric spacing from stars', 'blockenberg'),
                        value: a.numericSpacing,
                        min: 0,
                        max: 40,
                        onChange: function (v) { setAttributes({ numericSpacing: v }); }
                    })
                ),

                // ── Colors ────────────────────────────────────────────────────
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Stars', 'blockenberg')),
                    renderColorControl('filledColor', __('Filled star', 'blockenberg'), a.filledColor, function (c) { setAttributes({ filledColor: c }); }),
                    renderColorControl('emptyColor',  __('Empty star',  'blockenberg'), a.emptyColor,  function (c) { setAttributes({ emptyColor: c }); }),
                    a.showLabel && el(Fragment, {},
                        el('hr', {}),
                        el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Label', 'blockenberg')),
                        renderColorControl('labelColor', __('Label text', 'blockenberg'), a.labelColor, function (c) { setAttributes({ labelColor: c }); })
                    ),
                    a.showNumeric && el(Fragment, {},
                        el('hr', {}),
                        el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Numeric', 'blockenberg')),
                        renderColorControl('numericColor', __('Numeric text', 'blockenberg'), a.numericColor, function (c) { setAttributes({ numericColor: c }); })
                    )
                )
            );

            // ── Edit render ────────────────────────────────────────────────────────
            var blockProps = useBlockProps({
                className: 'bkbg-editor-wrap',
                'data-block-label': 'Star Rating'
            });

            var numericEl = a.showNumeric && el('span', { className: 'bkbg-sr-numeric' },
                formatNumeric(a.numericTemplate, a.rating, a.maxStars)
            );

            var starsRow = el('div', {
                className: 'bkbg-sr-stars',
                'aria-label': a.rating + ' ' + __('out of', 'blockenberg') + ' ' + a.maxStars + ' ' + __('stars', 'blockenberg'),
                title: __('Click a star to set rating', 'blockenberg')
            }, interactiveStars, numericEl);

            var labelEl = a.showLabel && el(RichText, {
                tagName: 'p',
                className: 'bkbg-sr-label',
                value: a.label,
                onChange: function (v) { setAttributes({ label: v }); },
                placeholder: __('Label text…', 'blockenberg'),
                allowedFormats: ['core/bold', 'core/italic', 'core/text-color', 'core/link']
            });

            // DOM order is always [starsRow, labelEl].
            // CSS flex-direction (column-reverse / row) handles visual reordering.
            var children = [starsRow, a.showLabel ? labelEl : null];

            return el('div', blockProps,
                inspector,
                el('div', Object.assign({ className: 'bkbg-sr-wrap', style: wrapStyle }, {
                    'data-text-align':    a.textAlign,
                    'data-label-pos':     a.labelPosition,
                    'data-show-label':    a.showLabel ? 'true' : 'false'
                }), children)
            );
        },

        // ── Save ─────────────────────────────────────────────────────────────────
        save: function (props) {
            var a = props.attributes;
            var RichTextContent = wp.blockEditor.RichText.Content;
            var blockId = a.blockId || 'sr0';

            var tv = getTypoCssVars();
            var wrapStyle = {
                '--bkbg-sr-star-size': a.starSize + 'px',
                '--bkbg-sr-star-gap':  a.starGap + 'px',
                '--bkbg-sr-label-size':    a.labelSize + 'px',
                '--bkbg-sr-label-weight':  a.labelWeight,
                '--bkbg-sr-label-color':   a.labelColor,
                '--bkbg-sr-label-lh':      a.labelLH,
                '--bkbg-sr-label-spacing': a.labelSpacing + 'px',
                '--bkbg-sr-num-size':    a.numericSize + 'px',
                '--bkbg-sr-num-weight':  a.numericWeight,
                '--bkbg-sr-num-color':   a.numericColor,
                '--bkbg-sr-num-spacing': a.numericSpacing + 'px'
            };
            Object.assign(wrapStyle, tv(a.labelTypo, '--bksr-lb-'));
            Object.assign(wrapStyle, tv(a.numericTypo, '--bksr-nm-'));

            var starEls = buildStars(a.rating, a.maxStars, a.starShape, a.filledColor, a.emptyColor, blockId);

            var numericEl = a.showNumeric && el('span', { className: 'bkbg-sr-numeric' },
                formatNumeric(a.numericTemplate, a.rating, a.maxStars)
            );

            var starsRow = el('div', {
                className: 'bkbg-sr-stars',
                role: 'img',
                'aria-label': a.rating + ' out of ' + a.maxStars + ' stars'
            }, starEls, numericEl);

            var labelEl = a.showLabel && el(RichTextContent, {
                tagName: 'p',
                className: 'bkbg-sr-label',
                value: a.label
            });

            // DOM order is always [starsRow, labelEl].
            // CSS flex-direction (column-reverse / row) handles visual reordering.
            var children = [starsRow, a.showLabel ? labelEl : null];

            return el('div', Object.assign({ className: 'bkbg-sr-wrap', style: wrapStyle }, {
                'data-text-align':  a.textAlign,
                'data-label-pos':   a.labelPosition,
                'data-show-label':  a.showLabel ? 'true' : 'false'
            }), children);
        }
    });
}() );
