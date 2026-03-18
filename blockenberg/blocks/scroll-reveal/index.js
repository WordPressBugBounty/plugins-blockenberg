( function () {
    var el                = wp.element.createElement;
    var Fragment          = wp.element.Fragment;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InnerBlocks       = wp.blockEditor.InnerBlocks;
    var PanelBody         = wp.components.PanelBody;
    var ToggleControl     = wp.components.ToggleControl;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;

    var ANIMATIONS = [
        { label: 'Fade Up',        value: 'fade-up' },
        { label: 'Fade Down',      value: 'fade-down' },
        { label: 'Fade Left',      value: 'fade-left' },
        { label: 'Fade Right',     value: 'fade-right' },
        { label: 'Fade In',        value: 'fade-in' },
        { label: 'Zoom In',        value: 'zoom-in' },
        { label: 'Zoom Out',       value: 'zoom-out' },
        { label: 'Slide Up',       value: 'slide-up' },
        { label: 'Slide Down',     value: 'slide-down' },
        { label: 'Slide Left',     value: 'slide-left' },
        { label: 'Slide Right',    value: 'slide-right' },
        { label: 'Flip Left',      value: 'flip-left' },
        { label: 'Flip Right',     value: 'flip-right' },
        { label: 'Rotate In',      value: 'rotate-in' },
        { label: 'Skew Up',        value: 'skew-up' },
        { label: 'Bounce In',      value: 'bounce-in' },
    ];

    var EASINGS = [
        { label: 'Ease',              value: 'ease' },
        { label: 'Ease In',           value: 'ease-in' },
        { label: 'Ease Out',          value: 'ease-out' },
        { label: 'Ease In Out',       value: 'ease-in-out' },
        { label: 'Linear',            value: 'linear' },
        { label: 'Spring (cubic)',     value: 'cubic-bezier(0.34,1.56,0.64,1)' },
        { label: 'Back Out (cubic)',   value: 'cubic-bezier(0.34,1.3,0.64,1)' },
    ];

    function animLabel(val) {
        var found = ANIMATIONS.find(function (a) { return a.value === val; });
        return found ? found.label : val;
    }

    /* ── edit ───────────────────────────────────────────────────────────────── */
    function Edit(props) {
        var attributes   = props.attributes;
        var setAttributes = props.setAttributes;
        var a            = attributes;

        var blockProps = useBlockProps({
            style: {
                paddingTop: a.paddingTop ? a.paddingTop + 'px' : undefined,
                paddingBottom: a.paddingBottom ? a.paddingBottom + 'px' : undefined,
                position: 'relative',
            }
        });

        return el(Fragment, null,
            el(InspectorControls, null,

                /* Animation panel */
                el(PanelBody, { title: __('Animation', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Animation Type', 'blockenberg'),
                        value: a.animation,
                        options: ANIMATIONS,
                        onChange: function (v) { setAttributes({ animation: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Easing', 'blockenberg'),
                        value: a.easing,
                        options: EASINGS,
                        onChange: function (v) { setAttributes({ easing: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Duration (ms)', 'blockenberg'),
                        value: a.duration,
                        min: 100,
                        max: 2000,
                        step: 50,
                        onChange: function (v) { setAttributes({ duration: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Delay (ms)', 'blockenberg'),
                        value: a.delay,
                        min: 0,
                        max: 2000,
                        step: 50,
                        onChange: function (v) { setAttributes({ delay: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Distance (px)', 'blockenberg'),
                        value: a.distance,
                        min: 0,
                        max: 200,
                        onChange: function (v) { setAttributes({ distance: v }); },
                        help: __('How far the element travels during the animation.', 'blockenberg')
                    }),
                    (a.animation === 'zoom-in' || a.animation === 'zoom-out') && el(RangeControl, {
                        label: __('Scale Start (%)', 'blockenberg'),
                        value: a.scale,
                        min: 50,
                        max: 110,
                        onChange: function (v) { setAttributes({ scale: v }); }
                    }),
                    (a.animation === 'rotate-in' || a.animation === 'skew-up') && el(RangeControl, {
                        label: __('Rotate (deg)', 'blockenberg'),
                        value: a.rotate,
                        min: -90,
                        max: 90,
                        onChange: function (v) { setAttributes({ rotate: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Start Opacity', 'blockenberg'),
                        value: a.opacity,
                        min: 0,
                        max: 99,
                        onChange: function (v) { setAttributes({ opacity: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Trigger Threshold (%)', 'blockenberg'),
                        value: a.threshold,
                        min: 0,
                        max: 80,
                        onChange: function (v) { setAttributes({ threshold: v }); },
                        help: __('% of element visible before trigger fires.', 'blockenberg')
                    }),
                    el(ToggleControl, { label: __('Animate Once', 'blockenberg'), checked: a.once, onChange: function (v) { setAttributes({ once: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, {
                        label: __('Stagger Children', 'blockenberg'),
                        checked: a.stagger,
                        onChange: function (v) { setAttributes({ stagger: v }); },
                        __nextHasNoMarginBottom: true,
                        help: __('Apply incremental delay to each direct child element.', 'blockenberg')
                    }),
                    a.stagger && el(RangeControl, {
                        label: __('Stagger Delay (ms)', 'blockenberg'),
                        value: a.staggerDelay,
                        min: 0,
                        max: 500,
                        step: 25,
                        onChange: function (v) { setAttributes({ staggerDelay: v }); }
                    })
                ),

                /* Spacing */
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                )
            ),

            /* ── editor canvas ── */
            el('div', blockProps,
                /* badge */
                el('div', {
                    style: {
                        position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
                        background: '#6c3fb5', color: '#fff', fontSize: '10px', fontWeight: 600,
                        padding: '2px 10px', borderRadius: '0 0 6px 6px', zIndex: 10,
                        pointerEvents: 'none', letterSpacing: '.3px', whiteSpace: 'nowrap',
                    }
                }, '▶  Scroll Reveal: ' + animLabel(a.animation) + ' · ' + a.duration + 'ms'),
                el(InnerBlocks, {
                    renderAppender: InnerBlocks.ButtonBlockAppender,
                })
            )
        );
    }

    /* ── save ───────────────────────────────────────────────────────────────── */
    function Save(props) {
        var a = props.attributes;
        var blockProps = wp.blockEditor.useBlockProps.save({
            className: 'bksr-wrap',
            'data-animation': a.animation,
            'data-duration': a.duration,
            'data-delay': a.delay,
            'data-easing': a.easing,
            'data-distance': a.distance,
            'data-scale': a.scale,
            'data-rotate': a.rotate,
            'data-opacity': a.opacity,
            'data-threshold': a.threshold,
            'data-once': a.once ? '1' : '0',
            'data-stagger': a.stagger ? '1' : '0',
            'data-stagger-delay': a.staggerDelay,
            style: {
                paddingTop: a.paddingTop ? a.paddingTop + 'px' : undefined,
                paddingBottom: a.paddingBottom ? a.paddingBottom + 'px' : undefined,
            }
        });

        return el('div', blockProps,
            el(InnerBlocks.Content, null)
        );
    }

    registerBlockType('blockenberg/scroll-reveal', {
        edit: Edit,
        save: Save,
    });
}() );
