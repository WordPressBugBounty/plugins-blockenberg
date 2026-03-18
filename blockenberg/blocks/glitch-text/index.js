( function () {
    var el                = wp.element.createElement;
    var Fragment          = wp.element.Fragment;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var RichText          = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody         = wp.components.PanelBody;
    var ToggleControl     = wp.components.ToggleControl;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;

    var _glTC, _glTV;
    function _tc() { return _glTC || (_glTC = window.bkbgTypographyControl); }
    function _tv() { return _glTV || (_glTV = window.bkbgTypoCssVars); }

    var GLITCH_TYPES = [
        { label: 'Chromatic (RGB split)',     value: 'chromatic' },
        { label: 'Noise (character shuffle)', value: 'noise' },
        { label: 'Digital (chromatic + noise)', value: 'digital' },
        { label: 'Flicker',                   value: 'flicker' },
        { label: 'Horizontal shake',          value: 'shake' },
    ];

    var TRIGGERS = [
        { label: 'Always on',  value: 'always' },
        { label: 'On hover',   value: 'hover' },
        { label: 'On click',   value: 'click' },
        { label: 'Interval',   value: 'interval' },
    ];

    var SPEEDS = [
        { label: 'Slow',   value: 'slow' },
        { label: 'Medium', value: 'medium' },
        { label: 'Fast',   value: 'fast' },
        { label: 'Custom', value: 'custom' },
    ];

    var TRANSFORMS = [
        { label: 'Uppercase',    value: 'uppercase' },
        { label: 'Lowercase',    value: 'lowercase' },
        { label: 'Capitalize',   value: 'capitalize' },
        { label: 'None',         value: 'none' },
    ];

    var TAGS = [
        { label: 'H1', value: 'h1' }, { label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' }, { label: 'H5', value: 'h5' }, { label: 'H6', value: 'h6' },
        { label: 'p',  value: 'p' },  { label: 'div', value: 'div' },
    ];

    function speedMs(a) {
        if (a.speed === 'custom') { return a.customDuration; }
        if (a.speed === 'slow')   { return 1400; }
        if (a.speed === 'fast')   { return 300; }
        return 800;
    }

    /* ── wrapper style ───────────────────────────────────────────────────────── */
    function buildWrapStyle(a) {
        return {
            background: a.backgroundColor,
            padding: a.paddingV + 'px ' + a.paddingH + 'px',
            textAlign: a.textAlign,
            borderRadius: a.borderRadius + 'px',
            position: 'relative',
            overflow: 'hidden',
        };
    }

    /* ── text style ─────────────────────────────────────────────────────────── */
    function buildTextStyle(a) {
        return {
            color: a.textColor,
            margin: 0,
            display: 'block',
        };
    }

    /* ── edit ───────────────────────────────────────────────────────────────── */
    function Edit(props) {
        var attributes   = props.attributes;
        var setAttributes = props.setAttributes;
        var a            = attributes;

        var blockProps = useBlockProps({ style: Object.assign(buildWrapStyle(a), _tv()(a.typoText, '--bkgl-tt-'), _tv()(a.typoSubtext, '--bkgl-st-')) });
        var ms = speedMs(a);

        return el(Fragment, null,
            el(InspectorControls, null,

                /* Effect */
                el(PanelBody, { title: __('Glitch Effect', 'blockenberg'), initialOpen: true },
                    el(SelectControl, { label: __('Effect Type', 'blockenberg'), value: a.glitchType, options: GLITCH_TYPES, onChange: function (v) { setAttributes({ glitchType: v }); } }),
                    el(SelectControl, { label: __('Trigger', 'blockenberg'), value: a.trigger, options: TRIGGERS, onChange: function (v) { setAttributes({ trigger: v }); } }),
                    a.trigger === 'interval' && el(Fragment, null,
                        el(RangeControl, { label: __('Interval (ms)', 'blockenberg'), value: a.glitchIntervalMs, min: 500, max: 20000, step: 500, onChange: function (v) { setAttributes({ glitchIntervalMs: v }); } }),
                        el(RangeControl, { label: __('Burst Duration (ms)', 'blockenberg'), value: a.glitchBurstDuration, min: 100, max: 2000, step: 100, onChange: function (v) { setAttributes({ glitchBurstDuration: v }); } })
                    ),
                    el(SelectControl, { label: __('Speed', 'blockenberg'), value: a.speed, options: SPEEDS, onChange: function (v) { setAttributes({ speed: v }); } }),
                    a.speed === 'custom' && el(RangeControl, { label: __('Duration (ms)', 'blockenberg'), value: a.customDuration, min: 100, max: 5000, step: 50, onChange: function (v) { setAttributes({ customDuration: v }); } }),
                    el(RangeControl, { label: __('Intensity', 'blockenberg'), value: a.intensity, min: 1, max: 20, onChange: function (v) { setAttributes({ intensity: v }); } }),
                    (a.glitchType === 'noise' || a.glitchType === 'digital') && el(TextControl, {
                        label: __('Noise Charset', 'blockenberg'), value: a.noiseCharset,
                        onChange: function (v) { setAttributes({ noiseCharset: v }); }
                    }),
                    el(ToggleControl, { label: __('Show Scanlines overlay', 'blockenberg'), checked: a.showScanlines, onChange: function (v) { setAttributes({ showScanlines: v }); }, __nextHasNoMarginBottom: true }),
                    a.showScanlines && el(RangeControl, { label: __('Scanline Opacity (%)', 'blockenberg'), value: a.scanlineOpacity, min: 5, max: 80, onChange: function (v) { setAttributes({ scanlineOpacity: v }); } }),
                    el(ToggleControl, { label: __('Cursor Blink', 'blockenberg'), checked: a.showCursorBlink, onChange: function (v) { setAttributes({ showCursorBlink: v }); }, __nextHasNoMarginBottom: true })
                ),

                /* Text */
                el(PanelBody, { title: __('Text', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('HTML Tag', 'blockenberg'), value: a.tag, options: TAGS, onChange: function (v) { setAttributes({ tag: v }); } }),
                    el(SelectControl, {
                        label: __('Text Align', 'blockenberg'), value: a.textAlign,
                        options: [
                            { label: __('Left', 'blockenberg'), value: 'left' },
                            { label: __('Center', 'blockenberg'), value: 'center' },
                            { label: __('Right', 'blockenberg'), value: 'right' },
                        ],
                        onChange: function (v) { setAttributes({ textAlign: v }); }
                    })
                ),

                /* Subtext */
                el(PanelBody, { title: __('Subtext', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Subtext', 'blockenberg'), checked: a.showSubtext, onChange: function (v) { setAttributes({ showSubtext: v }); }, __nextHasNoMarginBottom: true }),
                    a.showSubtext && el(Fragment, null,
                        el(TextControl, { label: __('Subtext', 'blockenberg'), value: a.subtext, onChange: function (v) { setAttributes({ subtext: v }); } }),
                        el(RangeControl, { label: __('Gap from text (px)', 'blockenberg'), value: a.subtextSpacing, min: 0, max: 60, onChange: function (v) { setAttributes({ subtextSpacing: v }); } })
                    )
                ),

                /* Layout */
                el(PanelBody, { title: __('Layout & Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Vertical Padding (px)', 'blockenberg'), value: a.paddingV, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingV: v }); } }),
                    el(RangeControl, { label: __('Horizontal Padding (px)', 'blockenberg'), value: a.paddingH, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingH: v }); } }),
                    el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ borderRadius: v }); } })
                ),

                /* Colors */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    _tc()({ label: __('Text', 'blockenberg'), value: a.typoText, onChange: function (v) { setAttributes({ typoText: v }); } }),
                    _tc()({ label: __('Subtext', 'blockenberg'), value: a.typoSubtext, onChange: function (v) { setAttributes({ typoSubtext: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Text Color', 'blockenberg'), value: a.textColor, onChange: function (v) { setAttributes({ textColor: v || '#ffffff' }); } },
                        { label: __('Background', 'blockenberg'), value: a.backgroundColor, onChange: function (v) { setAttributes({ backgroundColor: v || '#0d0d0d' }); } },
                        { label: __('Channel Red / Left', 'blockenberg'), value: a.colorRed, onChange: function (v) { setAttributes({ colorRed: v || '#ff0040' }); } },
                        { label: __('Channel Blue / Right', 'blockenberg'), value: a.colorBlue, onChange: function (v) { setAttributes({ colorBlue: v || '#00e5ff' }); } },
                        { label: __('Subtext', 'blockenberg'), value: a.subtextColor, onChange: function (v) { setAttributes({ subtextColor: v || '#888888' }); } },
                    ]
                })
            ),

            /* ── editor preview ── */
            el('div', blockProps,
                /* scanlines overlay */
                a.showScanlines && el('div', {
                    style: {
                        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,' + (a.scanlineOpacity / 100) + ') 2px, rgba(0,0,0,' + (a.scanlineOpacity / 100) + ') 4px)',
                    }
                }),

                /* glitch text */
                el('div', {
                    className: 'bkgl-outer',
                    style: { position: 'relative', display: 'inline-block' },
                    'data-glitch': a.text,
                    'data-type': a.glitchType,
                    'data-trigger': a.trigger,
                    'data-ms': ms,
                    'data-intensity': a.intensity,
                    'data-interval': a.glitchIntervalMs,
                    'data-burst': a.glitchBurstDuration,
                    'data-charset': a.noiseCharset,
                    'data-color-red': a.colorRed,
                    'data-color-blue': a.colorBlue,
                    style: { position: 'relative', display: 'inline-block', '--bkgl-red': a.colorRed, '--bkgl-blue': a.colorBlue, '--bkgl-ms': ms + 'ms', '--bkgl-shift': a.intensity + 'px' },
                },
                    el(a.tag, {
                        className: 'bkgl-text',
                        style: buildTextStyle(a),
                    }, a.text),
                    /* editor hint */
                    el('span', {
                        style: { position: 'absolute', top: '-18px', left: 0, fontSize: '10px', color: '#6c3fb5', fontWeight: 600, whiteSpace: 'nowrap', pointerEvents: 'none' }
                    }, '⚡ ' + GLITCH_TYPES.find(function (g) { return g.value === a.glitchType; }).label.split('(')[0].trim())
                ),
                a.showCursorBlink && el('span', { className: 'bkgl-cursor', style: { color: a.textColor } }, '|'),

                a.showSubtext && el('p', {
                    className: 'bkgl-subtext',
                    style: { margin: a.subtextSpacing + 'px 0 0', color: a.subtextColor }
                }, a.subtext)
            )
        );
    }

    /* ── save ───────────────────────────────────────────────────────────────── */
    function Save(props) {
        var a = props.attributes;
        var ms = speedMs(a);

        var blockProps = wp.blockEditor.useBlockProps.save({
            className: 'bkgl-wrap',
            style: Object.assign(buildWrapStyle(a), _tv()(a.typoText, '--bkgl-tt-'), _tv()(a.typoSubtext, '--bkgl-st-')),
        });

        return el('div', blockProps,
            a.showScanlines && el('div', {
                className: 'bkgl-scanlines',
                style: {
                    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,' + (a.scanlineOpacity / 100) + ') 2px, rgba(0,0,0,' + (a.scanlineOpacity / 100) + ') 4px)',
                }
            }),
            el('div', {
                className: 'bkgl-outer',
                'data-glitch': a.text,
                'data-type': a.glitchType,
                'data-trigger': a.trigger,
                'data-ms': ms,
                'data-intensity': a.intensity,
                'data-interval': a.glitchIntervalMs,
                'data-burst': a.glitchBurstDuration,
                'data-charset': a.noiseCharset,
                style: {
                    position: 'relative',
                    display: 'inline-block',
                    '--bkgl-red': a.colorRed,
                    '--bkgl-blue': a.colorBlue,
                    '--bkgl-ms': ms + 'ms',
                    '--bkgl-shift': a.intensity + 'px',
                }
            },
                el(RichText.Content, {
                    tagName: a.tag,
                    className: 'bkgl-text',
                    value: a.text,
                    style: buildTextStyle(a),
                })
            ),
            a.showCursorBlink && el('span', {
                className: 'bkgl-cursor',
                style: { color: a.textColor }
            }, '|'),
            a.showSubtext && el('p', {
                className: 'bkgl-subtext',
                style: { margin: a.subtextSpacing + 'px 0 0', color: a.subtextColor }
            }, a.subtext)
        );
    }

    registerBlockType('blockenberg/glitch-text', {
        edit: Edit,
        save: Save,
    });
}() );
