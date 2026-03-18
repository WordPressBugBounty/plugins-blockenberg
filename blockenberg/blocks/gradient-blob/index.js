( function () {
    var el                = wp.element.createElement;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var InnerBlocks       = wp.blockEditor.InnerBlocks;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var useInnerBlocksProps = wp.blockEditor.useInnerBlocksProps;
    var PanelBody         = wp.components.PanelBody;
    var ToggleControl     = wp.components.ToggleControl;
    var RangeControl      = wp.components.RangeControl;

    var TEMPLATE = [
        ['core/heading',   { level: 2, placeholder: __('Section heading…', 'blockenberg'), textAlign: 'center' }],
        ['core/paragraph', { placeholder: __('Add your content here…', 'blockenberg'),     align: 'center' }],
        ['core/buttons',   { layout: { type: 'flex', justifyContent: 'center' } }, [
            ['core/button', { text: __('Get started', 'blockenberg') }],
        ]],
    ];

    // CSS for animated blob (editor preview)
    var BLOB_ANIM = [
        { top: '10%', left: '15%',  animDelay: '0s' },
        { top: '60%', left: '65%',  animDelay: '-4s' },
        { top: '35%', left: '50%',  animDelay: '-7s' },
        { top: '75%', left: '10%',  animDelay: '-2s' },
        { top: '20%', left: '75%',  animDelay: '-9s' },
    ];

    function buildWrapStyle(a) {
        return {
            position:      'relative',
            overflow:      'hidden',
            minHeight:     a.minHeight + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            background:    a.bgColor,
            color:         a.textColor || undefined,
        };
    }

    function buildInnerStyle(a) {
        return {
            position:  'relative',
            zIndex:    1,
            maxWidth:  a.contentMaxWidth + 'px',
            margin:    a.centerContent ? '0 auto' : undefined,
        };
    }

    function buildBlobStyle(a, idx) {
        var info = BLOB_ANIM[idx % BLOB_ANIM.length];
        var colors = [a.color1, a.color2, a.color3];
        var color = colors[idx % colors.length];
        var size = a.blobSize;
        return {
            position:          'absolute',
            top:               info.top,
            left:              info.left,
            width:             size + '%',
            height:            size + '%',
            background:        color,
            borderRadius:      '60% 40% 30% 70% / 60% 30% 70% 40%',
            opacity:           (a.blobOpacity / 100),
            filter:            'blur(' + a.blobBlur + 'px)',
            willChange:        'transform, border-radius',
            animationName:     'bkgb-morph',
            animationDuration: a.animSpeed + 's',
            animationDelay:    info.animDelay,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationPlayState: a.paused ? 'paused' : 'running',
            transformOrigin:   'center',
            pointerEvents:     'none',
        };
    }

    registerBlockType('blockenberg/gradient-blob', {
        title: __('Gradient Blob', 'blockenberg'),
        description: __('Section with animated CSS blobs as background.', 'blockenberg'),
        category: 'bkbg-effects',
        icon: 'art',

        edit: function (props) {
            var attributes   = props.attributes;
            var setAttributes = props.setAttributes;
            var numBlobs = Math.min(attributes.numBlobs || 3, 5);

            var wrapStyle = buildWrapStyle(attributes);
            var innerStyle = buildInnerStyle(attributes);

            var blockProps = useBlockProps({ style: wrapStyle, className: 'bkgb-section' });
            var innerBlocksProps = useInnerBlocksProps({ style: innerStyle, className: 'bkgb-inner' }, {
                template: TEMPLATE,
                templateLock: false,
            });

            return el(Fragment, null,
                el(InspectorControls, null,
                    /* ── Blobs ──────────────────────────────────────────────── */
                    el(PanelBody, { title: __('Blobs', 'blockenberg'), initialOpen: true },
                        el(RangeControl, {
                            label: __('Number of blobs', 'blockenberg'),
                            value: attributes.numBlobs,
                            min: 1, max: 5,
                            onChange: function (v) { setAttributes({ numBlobs: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Blob size (%)', 'blockenberg'),
                            value: attributes.blobSize,
                            min: 10, max: 120,
                            onChange: function (v) { setAttributes({ blobSize: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Opacity (%)', 'blockenberg'),
                            value: attributes.blobOpacity,
                            min: 5, max: 100,
                            onChange: function (v) { setAttributes({ blobOpacity: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Blur (px)', 'blockenberg'),
                            value: attributes.blobBlur,
                            min: 0, max: 200,
                            onChange: function (v) { setAttributes({ blobBlur: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Animation speed (s)', 'blockenberg'),
                            value: attributes.animSpeed,
                            min: 3, max: 40,
                            onChange: function (v) { setAttributes({ animSpeed: v }); },
                        }),
                        el(ToggleControl, {
                            label: __('Pause animation', 'blockenberg'),
                            checked: attributes.paused,
                            onChange: function (v) { setAttributes({ paused: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),
                    /* ── Layout ─────────────────────────────────────────────── */
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Min height (px)', 'blockenberg'),
                            value: attributes.minHeight,
                            min: 100, max: 1200,
                            onChange: function (v) { setAttributes({ minHeight: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Padding top (px)', 'blockenberg'),
                            value: attributes.paddingTop,
                            min: 0, max: 200,
                            onChange: function (v) { setAttributes({ paddingTop: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Padding bottom (px)', 'blockenberg'),
                            value: attributes.paddingBottom,
                            min: 0, max: 200,
                            onChange: function (v) { setAttributes({ paddingBottom: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Content max width (px)', 'blockenberg'),
                            value: attributes.contentMaxWidth,
                            min: 200, max: 1400,
                            onChange: function (v) { setAttributes({ contentMaxWidth: v }); },
                        }),
                        el(ToggleControl, {
                            label: __('Center content', 'blockenberg'),
                            checked: attributes.centerContent,
                            onChange: function (v) { setAttributes({ centerContent: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),
                    /* ── Colors ─────────────────────────────────────────────── */
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            {
                                value: attributes.color1,
                                onChange: function (v) { setAttributes({ color1: v || '#c084fc' }); },
                                label: __('Blob color 1', 'blockenberg'),
                            },
                            {
                                value: attributes.color2,
                                onChange: function (v) { setAttributes({ color2: v || '#818cf8' }); },
                                label: __('Blob color 2', 'blockenberg'),
                            },
                            {
                                value: attributes.color3,
                                onChange: function (v) { setAttributes({ color3: v || '#f0abfc' }); },
                                label: __('Blob color 3', 'blockenberg'),
                            },
                            {
                                value: attributes.bgColor,
                                onChange: function (v) { setAttributes({ bgColor: v || '#faf5ff' }); },
                                label: __('Background color', 'blockenberg'),
                            },
                            {
                                value: attributes.textColor,
                                onChange: function (v) { setAttributes({ textColor: v || '' }); },
                                label: __('Text color', 'blockenberg'),
                            },
                        ],
                    })
                ),
                el('section', blockProps,
                    /* Blob layers */
                    Array.from({ length: numBlobs }, function (_, i) {
                        return el('div', {
                            key: i,
                            'aria-hidden': 'true',
                            className: 'bkgb-blob bkgb-blob-' + (i + 1),
                            style: buildBlobStyle(attributes, i),
                        });
                    }),
                    /* InnerBlocks content */
                    el('div', innerBlocksProps)
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var numBlobs = Math.min(a.numBlobs || 3, 5);
            var colors = [a.color1, a.color2, a.color3];
            var blobPositions = [
                { top: '10%', left: '15%' },
                { top: '60%', left: '65%' },
                { top: '35%', left: '50%' },
                { top: '75%', left: '10%' },
                { top: '20%', left: '75%' },
            ];
            var blobDelays = ['0s', '-4s', '-7s', '-2s', '-9s'];

            return el('section', {
                className: 'bkgb-section',
                'data-speed': a.animSpeed,
                'data-paused': a.paused ? 'true' : 'false',
                style: {
                    position:      'relative',
                    overflow:      'hidden',
                    minHeight:     a.minHeight + 'px',
                    paddingTop:    a.paddingTop + 'px',
                    paddingBottom: a.paddingBottom + 'px',
                    background:    a.bgColor,
                    color:         a.textColor || undefined,
                    '--bkgb-speed': a.animSpeed + 's',
                    '--bkgb-blur':  a.blobBlur + 'px',
                    '--bkgb-opacity': a.blobOpacity / 100,
                    '--bkgb-size':  a.blobSize + '%',
                },
            },
                Array.from({ length: numBlobs }, function (_, i) {
                    var pos = blobPositions[i % blobPositions.length];
                    return el('div', {
                        key: i,
                        'aria-hidden': 'true',
                        className: 'bkgb-blob bkgb-blob-' + (i + 1),
                        style: {
                            '--bkgb-c': colors[i % colors.length],
                            '--bkgb-delay': blobDelays[i % blobDelays.length],
                            top:   pos.top,
                            left:  pos.left,
                        },
                    });
                }),
                el('div', {
                    className: 'bkgb-inner',
                    style: {
                        position:  'relative',
                        zIndex:    1,
                        maxWidth:  a.contentMaxWidth + 'px',
                        margin:    a.centerContent ? '0 auto' : undefined,
                    },
                }, el(InnerBlocks.Content))
            );
        },
    });
}() );
