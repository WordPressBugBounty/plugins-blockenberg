(function () {
    var el = window.wp.element.createElement;
    var __ = function (s) { return s; };
    var registerBlockType  = window.wp.blocks.registerBlockType;
    var InspectorControls  = window.wp.blockEditor.InspectorControls;
    var PanelBody          = window.wp.components.PanelBody;
    var ToggleControl      = window.wp.components.ToggleControl;
    var SelectControl      = window.wp.components.SelectControl;
    var RangeControl       = window.wp.components.RangeControl;
    var PanelColorSettings = window.wp.blockEditor.PanelColorSettings;
    var useBlockProps       = window.wp.blockEditor.useBlockProps;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var v1Attributes = {
        height: { type: 'number', default: 4 },
        position: { type: 'string', default: 'top' },
        color: { type: 'string', default: '#2563eb' },
        bgColor: { type: 'string', default: '#e5e7eb' },
        showPercentage: { type: 'boolean', default: false },
        zIndex: { type: 'number', default: 9999 },
        animation: { type: 'string', default: 'smooth' },
        gradientEnd: { type: 'string', default: '' },
        useGradient: { type: 'boolean', default: false },
        fontSize: { type: 'number', default: 11 },
        fontWeight: { type: 'number', default: 600 },
        lineHeight: { type: 'number', default: 1.2 }
    };

    registerBlockType('blockenberg/reading-progress', {
        title: __('Reading Progress'),
        description: __('A fixed reading progress bar that fills as the visitor scrolls.'),
        category: 'bkbg-blog',
        icon: el('svg', { viewBox: '0 0 24 24', fill: 'currentColor', width: 24, height: 24 },
            el('rect', { x: 2, y: 10, width: 20, height: 4, rx: 2, fill: '#e5e7eb' }),
            el('rect', { x: 2, y: 10, width: 13, height: 4, rx: 2, fill: '#2563eb' })
        ),

        edit: function (props) {
            var a   = props.attributes;
            var setA = props.setAttributes;
            var TC = getTypoControl();

            var blockProps = useBlockProps((function() {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) Object.assign(s, _tvFn(a.labelTypo || {}, '--bkrp-lt-'));
                return { style: s, className: 'bkbg-rp-editor-preview' };
            })());

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Position & Size'), initialOpen: true },
                    el(SelectControl, {
                        label:   __('Position'),
                        value:   a.position,
                        options: [
                            { label: 'Top of viewport',    value: 'top' },
                            { label: 'Bottom of viewport', value: 'bottom' },
                        ],
                        onChange: function (v) { setA({ position: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Bar Height (px)'),
                        value: a.height,
                        min: 1, max: 20,
                        onChange: function (v) { setA({ height: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Z-Index'),
                        value: a.zIndex,
                        min: 100, max: 99999, step: 100,
                        onChange: function (v) { setA({ zIndex: v }); },
                    })
                ),
                el(PanelBody, { title: __('Appearance'), initialOpen: false },
                    el(SelectControl, {
                        label:   __('Animation'),
                        value:   a.animation,
                        options: [
                            { label: 'Smooth', value: 'smooth' },
                            { label: 'None',   value: 'none' },
                        ],
                        onChange: function (v) { setA({ animation: v }); },
                    }),
                    el(ToggleControl, {
                        label:    __('Use gradient color'),
                        checked:  a.useGradient,
                        onChange: function (v) { setA({ useGradient: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    el(ToggleControl, {
                        label:    __('Show percentage label'),
                        checked:  a.showPercentage,
                        onChange: function (v) { setA({ showPercentage: v }); },
                        __nextHasNoMarginBottom: true,
                    })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    TC && el(TC, { label: __('Percentage Label', 'blockenberg'), value: a.labelTypo || {}, onChange: function(v) { setA({ labelTypo: v }); } })
                ),
                el(PanelBody, { title: __('Colors'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Bar Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Progress Color'),    value: a.color,    onChange: function (v) { setA({ color:    v || '#2563eb' }); } },
                            { label: __('Gradient End'),      value: a.gradientEnd, onChange: function (v) { setA({ gradientEnd: v || '' }); } },
                            { label: __('Background Track'),  value: a.bgColor,  onChange: function (v) { setA({ bgColor:  v || '#e5e7eb' }); } },
                        ],
                    })
                )
            );

            /* Editor preview — static bar inside the content area */
            var previewBar = el('div', {
                style: {
                    position:    'relative',
                    width:       '100%',
                    background:  a.bgColor,
                    height:      a.height + 'px',
                    borderRadius: (a.height / 2) + 'px',
                    overflow:    'hidden',
                }
            },
                el('div', {
                    style: {
                        width:        '60%',
                        height:       '100%',
                        background:   a.useGradient && a.gradientEnd
                            ? 'linear-gradient(90deg,' + a.color + ',' + a.gradientEnd + ')'
                            : a.color,
                        borderRadius: 'inherit',
                    }
                })
            );

            return el('div', blockProps,
                inspector,
                el('div', {
                    style: {
                        padding:      '12px 16px',
                        background:   '#f9fafb',
                        border:       '1px solid #e5e7eb',
                        borderRadius: 8,
                        textAlign:    'center',
                    }
                },
                    el('p', { style: { margin: '0 0 10px', fontSize: 12, color: '#6b7280', fontWeight: 600 } },
                        'Reading Progress Bar — ' + a.position.charAt(0).toUpperCase() + a.position.slice(1) + ' of Viewport'
                    ),
                    previewBar,
                    el('p', { className: 'bkbg-rp-info', style: { margin: '8px 0 0', color: '#9ca3af' } },
                        'The bar will be fixed to the ' + a.position + ' of the screen on the front end.'
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', {
                className:         'bkbg-rp-anchor',
                'data-height':     a.height,
                'data-position':   a.position,
                'data-color':      a.color,
                'data-bg':         a.bgColor,
                'data-pct':        a.showPercentage ? '1' : '0',
                'data-zindex':     a.zIndex,
                'data-animation':  a.animation,
                'data-gradient':   a.useGradient && a.gradientEnd ? a.gradientEnd : '',
                'data-label-typo': JSON.stringify(a.labelTypo || {}),
            });
        },

        deprecated: [
            {
                attributes: v1Attributes,
                save: function (props) {
                    var a = props.attributes;
                    return el('div', {
                        className:         'bkbg-rp-anchor',
                        'data-height':     a.height,
                        'data-position':   a.position,
                        'data-color':      a.color,
                        'data-bg':         a.bgColor,
                        'data-pct':        a.showPercentage ? '1' : '0',
                        'data-zindex':     a.zIndex,
                        'data-animation':  a.animation,
                        'data-gradient':   a.useGradient && a.gradientEnd ? a.gradientEnd : '',
                    });
                },
            }
        ],
    });
})();
