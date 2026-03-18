( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;

    /* ── Shape paths (1200×120 viewBox) ──────────────────────────────────── */
    var SHAPES = {
        wave:      'M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z',
        wave2:     'M0,40 C200,100 400,0 600,50 C800,100 1000,0 1200,40 L1200,120 L0,120 Z',
        wave3:     'M0,80 C100,20 200,100 300,60 C400,20 500,100 600,60 C700,20 800,100 900,60 C1000,20 1100,100 1200,60 L1200,120 L0,120 Z',
        curve:     'M0,0 Q600,120 1200,0 L1200,120 L0,120 Z',
        curve2:    'M0,120 Q600,0 1200,120 L1200,120 L0,120 Z',
        triangle:  'M0,120 L600,0 L1200,120 Z',
        tilt:      'M0,0 L1200,80 L1200,120 L0,120 Z',
        'tilt-r':  'M0,80 L1200,0 L1200,120 L0,120 Z',
        zigzag:    'M0,60 L100,0 L200,60 L300,0 L400,60 L500,0 L600,60 L700,0 L800,60 L900,0 L1000,60 L1100,0 L1200,60 L1200,120 L0,120 Z',
        mountains: 'M0,120 L100,60 L200,100 L350,20 L500,80 L650,40 L800,90 L950,30 L1100,70 L1200,50 L1200,120 Z',
        arrow:     'M0,0 L550,0 L600,60 L650,0 L1200,0 L1200,120 L0,120 Z',
        fan:       'M0,120 Q200,0 400,60 Q600,120 800,0 Q1000,60 1200,120 Z',
    };

    var SHAPE_OPTIONS = [
        { label: 'Wave',        value: 'wave' },
        { label: 'Wave Alt',    value: 'wave2' },
        { label: 'Wave Small',  value: 'wave3' },
        { label: 'Curve Down',  value: 'curve' },
        { label: 'Curve Up',    value: 'curve2' },
        { label: 'Triangle',    value: 'triangle' },
        { label: 'Tilt Left',   value: 'tilt' },
        { label: 'Tilt Right',  value: 'tilt-r' },
        { label: 'Zigzag',      value: 'zigzag' },
        { label: 'Mountains',   value: 'mountains' },
        { label: 'Arrow',       value: 'arrow' },
        { label: 'Fan',         value: 'fan' },
    ];

    var POS_OPTIONS = [
        { label: 'Bottom', value: 'bottom' },
        { label: 'Top',    value: 'top' },
    ];

    /* ── Build SVG ────────────────────────────────────────────────────────── */
    function buildSVG(a, isPreview) {
        var path = SHAPES[a.shape] || SHAPES.wave;
        var scaleX = a.flipHorizontal ? -1 : 1;
        var scaleY = a.flipVertical   ? -1 : 1;
        var animClass = a.animate && !isPreview ? ' bksvd-animate' : '';

        var transformAttr = (scaleX !== 1 || scaleY !== 1)
            ? 'scale(' + scaleX + ',' + scaleY + ')'
            : undefined;

        var g = el('g', { transform: transformAttr },
            a.layers >= 2 && el('path', {
                d: path,
                fill: a.layer2Color,
                transform: 'translate(0,' + a.layer2Offset + ')',
                opacity: 0.6,
            }),
            el('path', { d: path, fill: a.color })
        );

        return el('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 1200 120',
            preserveAspectRatio: 'none',
            className: 'bksvd-svg' + animClass,
            'data-shape': a.shape,
            style: {
                width: a.width + '%',
                height: a.height + 'px',
                display: 'block',
                transformOrigin: 'center',
            }
        }, g);
    }

    /* ── Wrapper style ────────────────────────────────────────────────────── */
    function buildWrap(a) {
        var isTop = a.position === 'top';
        return {
            position: 'relative',
            lineHeight: 0,
            background: a.bgColor || 'transparent',
            zIndex: a.zIndex,
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: isTop ? 'flex-start' : 'flex-end',
        };
    }

    /* ── Block registration ───────────────────────────────────────────────── */
    registerBlockType('blockenberg/shape-divider', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ style: buildWrap(a) });

            return el('div', blockProps,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Shape', 'blockenberg'), initialOpen: true },
                        el(SelectControl, {
                            label: __('Shape', 'blockenberg'),
                            value: a.shape,
                            options: SHAPE_OPTIONS,
                            onChange: function (v) { set({ shape: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Position', 'blockenberg'),
                            value: a.position,
                            options: POS_OPTIONS,
                            onChange: function (v) { set({ position: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Height (px)', 'blockenberg'),
                            value: a.height,
                            min: 20, max: 300,
                            onChange: function (v) { set({ height: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Width %', 'blockenberg'),
                            value: a.width,
                            min: 100, max: 200,
                            onChange: function (v) { set({ width: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Flip Horizontal', 'blockenberg'),
                            checked: a.flipHorizontal,
                            onChange: function (v) { set({ flipHorizontal: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Flip Vertical', 'blockenberg'),
                            checked: a.flipVertical,
                            onChange: function (v) { set({ flipVertical: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                    ),
                    el(PanelBody, { title: __('Layers & Animation', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            label: __('Layers', 'blockenberg'),
                            value: String(a.layers),
                            options: [{ label: '1 layer', value: '1' }, { label: '2 layers', value: '2' }],
                            onChange: function (v) { set({ layers: parseInt(v, 10) }); }
                        }),
                        a.layers >= 2 && el(RangeControl, {
                            label: __('Layer 2 Offset (px)', 'blockenberg'),
                            value: a.layer2Offset,
                            min: 0, max: 40,
                            onChange: function (v) { set({ layer2Offset: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Animate (wave scroll)', 'blockenberg'),
                            checked: a.animate,
                            onChange: function (v) { set({ animate: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        a.animate && el(RangeControl, {
                            label: __('Animation Speed (s)', 'blockenberg'),
                            value: a.animationSpeed,
                            min: 2, max: 30,
                            onChange: function (v) { set({ animationSpeed: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Z-Index', 'blockenberg'),
                            value: a.zIndex,
                            min: 0, max: 100,
                            onChange: function (v) { set({ zIndex: v }); }
                        }),
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            {
                                label: __('Shape Color', 'blockenberg'),
                                value: a.color,
                                onChange: function (v) { set({ color: v || '#ffffff' }); }
                            },
                            {
                                label: __('Layer 2 Color', 'blockenberg'),
                                value: a.layer2Color,
                                onChange: function (v) { set({ layer2Color: v || 'rgba(255,255,255,0.4)' }); }
                            },
                            {
                                label: __('Background Color', 'blockenberg'),
                                value: a.bgColor,
                                onChange: function (v) { set({ bgColor: v || '' }); }
                            },
                        ]
                    }),
                ),
                buildSVG(a, true)
            );
        },

        save: function (props) {
            var a = props.attributes;
            var path = SHAPES[a.shape] || SHAPES.wave;
            var scaleX = a.flipHorizontal ? -1 : 1;
            var scaleY = a.flipVertical   ? -1 : 1;
            var transformAttr = (scaleX !== 1 || scaleY !== 1)
                ? 'scale(' + scaleX + ',' + scaleY + ')'
                : undefined;

            var g = el('g', { transform: transformAttr },
                a.layers >= 2 && el('path', {
                    d: path,
                    fill: a.layer2Color,
                    transform: 'translate(0,' + a.layer2Offset + ')',
                    opacity: 0.6,
                }),
                el('path', { d: path, fill: a.color })
            );

            return el('div', {
                className: 'bksvd-wrap',
                'data-animate': a.animate ? '1' : '0',
                'data-speed': a.animationSpeed,
                style: {
                    position: 'relative',
                    lineHeight: 0,
                    background: a.bgColor || 'transparent',
                    zIndex: a.zIndex,
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: a.position === 'top' ? 'flex-start' : 'flex-end',
                }
            },
                el('svg', {
                    xmlns: 'http://www.w3.org/2000/svg',
                    viewBox: '0 0 1200 120',
                    preserveAspectRatio: 'none',
                    className: 'bksvd-svg' + (a.animate ? ' bksvd-animate' : ''),
                    style: {
                        width: a.width + '%',
                        height: a.height + 'px',
                        display: 'block',
                        '--bksvd-speed': a.animationSpeed + 's',
                    }
                }, g)
            );
        }
    });
}() );
