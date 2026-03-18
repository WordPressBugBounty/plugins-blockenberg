( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;

    /* ── typography lazy-getters ── */
    function _tc() { return window.bkbgTypographyControl || null; }
    function _tv() { return window.bkbgTypoCssVars || function () { return {}; }; }

    /* ── Build editor SVG preview ── */
    function buildEditorSVG(attr) {
        var W = attr.svgWidth, H = attr.svgHeight;
        var pathId = 'bkbg-hw-ul-' + Math.random().toString(36).slice(2, 5);

        return el('svg', {
            viewBox: '0 0 ' + W + ' ' + H,
            width: '100%',
            height: H,
            xmlns: 'http://www.w3.org/2000/svg',
            style: { display: 'block', overflow: 'visible', maxWidth: W + 'px',
                margin: attr.align2 === 'center' ? '0 auto' : attr.align2 === 'right' ? '0 0 0 auto' : '0' }
        },
            el('text', {
                className: 'bkbg-hw-text',
                x: attr.textX + '%',
                y: attr.textY,
                textAnchor: attr.textAnchor,
                fill: 'none',
                stroke: attr.strokeColor,
                strokeWidth: attr.strokeWidth,
                strokeDasharray: '8 4',
                style: { opacity: 0.85 }
            }, attr.text),
            /* Show fill text underneath to approximate "drawn" look in editor */
            el('text', {
                className: 'bkbg-hw-text',
                x: attr.textX + '%',
                y: attr.textY,
                textAnchor: attr.textAnchor,
                style: { opacity: 0.35, fill: attr.textColor }
            }, attr.text),
            attr.showUnderline && el('path', {
                id: pathId,
                d: 'M ' + (attr.textX - 30) + ' ' + (attr.textY + attr.underlineOffsetY) + ' L ' + (attr.textX + 30) + ' ' + (attr.textY + attr.underlineOffsetY),
                fill: 'none',
                stroke: attr.underlineColor,
                strokeWidth: attr.underlineWidth,
                strokeLinecap: 'round',
                strokeDasharray: '6 4'
            })
        );
    }

    var FONT_PRESETS = [
        { label: 'Dancing Script (cursive)', value: "'Dancing Script', cursive" },
        { label: 'Caveat (casual)', value: "'Caveat', cursive" },
        { label: 'Pacifico (rounded)', value: "'Pacifico', cursive" },
        { label: 'Satisfy (elegant)', value: "'Satisfy', cursive" },
        { label: 'Sacramento (thin cursive)', value: "'Sacramento', cursive" },
        { label: 'Inherit (theme font)', value: 'inherit' },
        { label: 'Custom (type below)', value: 'custom' }
    ];

    registerBlockType('blockenberg/handwriting-text', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({
                style: Object.assign({ background: attr.sectionBg || undefined, padding: '40px 20px', textAlign: attr.align2 }, _tv()(attr.typoText, '--bkbg-hw-tt-'))
            });

            var inspector = el(InspectorControls, {},
                /* Text Content */
                el(PanelBody, { title: __('Text', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label: __('Text to Handwrite', 'blockenberg'),
                        value: attr.text,
                        onChange: function (v) { setAttr({ text: v }); },
                        help: __('Cursive/script fonts work best for the handwriting effect.', 'blockenberg'),
                        __nextHasNoMarginBottom: true
                    }),
                    el('div', { style: { marginTop: '12px' } }),
                    el(SelectControl, {
                        label: __('Font Preset', 'blockenberg'),
                        value: (function () {
                            var fam = (attr.typoText || {}).family || attr.fontFamily;
                            return FONT_PRESETS.some(function (f) { return f.value === fam; }) ? fam : 'custom';
                        })(),
                        options: FONT_PRESETS,
                        onChange: function (v) {
                            if (v !== 'custom') {
                                var t = Object.assign({}, attr.typoText || {}, { family: v });
                                setAttr({ typoText: t });
                            }
                        },
                        help: __('Google Fonts must be loaded separately via "Additional CSS" or your theme.', 'blockenberg'),
                        __nextHasNoMarginBottom: true
                    }),
                    el('div', { style: { marginTop: '8px' } }),
                    el('div', { style: { marginTop: '8px' } }),
                    el('div', { style: { marginTop: '8px' } }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(SelectControl, {
                        label: __('Text Alignment', 'blockenberg'),
                        value: attr.align2,
                        options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }],
                        onChange: function (v) {
                            var anchor = v === 'center' ? 'middle' : v === 'right' ? 'end' : 'start';
                            var x = v === 'center' ? 50 : v === 'right' ? 95 : 5;
                            setAttr({ align2: v, textAnchor: anchor, textX: x });
                        },
                        __nextHasNoMarginBottom: true
                    })
                ),
                /* SVG canvas */
                el(PanelBody, { title: __('Canvas', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('SVG Width (px)', 'blockenberg'), value: attr.svgWidth, min: 300, max: 1400, onChange: function (v) { setAttr({ svgWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('SVG Height (px)', 'blockenberg'), value: attr.svgHeight, min: 60, max: 400, onChange: function (v) { setAttr({ svgHeight: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Text Y Position (px)', 'blockenberg'), value: attr.textY, min: 20, max: 380, onChange: function (v) { setAttr({ textY: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Stroke Width (px)', 'blockenberg'), value: attr.strokeWidth, min: 1, max: 8, onChange: function (v) { setAttr({ strokeWidth: v }); }, __nextHasNoMarginBottom: true })
                ),
                /* Underline */
                el(PanelBody, { title: __('Underline', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Underline', 'blockenberg'), checked: attr.showUnderline, onChange: function (v) { setAttr({ showUnderline: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showUnderline && el('div', {},
                        el('div', { style: { marginTop: '8px' } }),
                        el(RangeControl, { label: __('Underline Width (px)', 'blockenberg'), value: attr.underlineWidth, min: 1, max: 12, onChange: function (v) { setAttr({ underlineWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginTop: '8px' } }),
                        el(RangeControl, { label: __('Underline Gap (px)', 'blockenberg'), value: attr.underlineOffsetY, min: 0, max: 40, onChange: function (v) { setAttr({ underlineOffsetY: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginTop: '8px' } }),
                        el(RangeControl, { label: __('Underline Animate Duration (s)', 'blockenberg'), value: attr.underlineDuration, min: 0.2, max: 3, step: 0.1, onChange: function (v) { setAttr({ underlineDuration: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),
                /* Animation */
                el(PanelBody, { title: __('Animation', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Trigger', 'blockenberg'),
                        value: attr.trigger,
                        options: [
                            { label: 'On Scroll (IntersectionObserver)', value: 'scroll' },
                            { label: 'On Page Load', value: 'load' },
                            { label: 'On Click', value: 'click' }
                        ],
                        onChange: function (v) { setAttr({ trigger: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Draw Duration (s)', 'blockenberg'), value: attr.duration, min: 0.5, max: 12, step: 0.1, onChange: function (v) { setAttr({ duration: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Start Delay (s)', 'blockenberg'), value: attr.delay, min: 0, max: 5, step: 0.1, onChange: function (v) { setAttr({ delay: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(SelectControl, {
                        label: __('Easing', 'blockenberg'),
                        value: attr.easing,
                        options: [
                            { label: 'Ease In Out', value: 'ease-in-out' },
                            { label: 'Ease In', value: 'ease-in' },
                            { label: 'Ease Out', value: 'ease-out' },
                            { label: 'Linear', value: 'linear' }
                        ],
                        onChange: function (v) { setAttr({ easing: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(ToggleControl, { label: __('Fill Text After Drawing', 'blockenberg'), checked: attr.fillOnComplete, onChange: function (v) { setAttr({ fillOnComplete: v }); }, __nextHasNoMarginBottom: true }),
                    attr.fillOnComplete && el(RangeControl, { label: __('Fill Transition Duration (s)', 'blockenberg'), value: attr.fillDuration, min: 0.1, max: 3, step: 0.1, onChange: function (v) { setAttr({ fillDuration: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(ToggleControl, { label: __('Repeat Animation on Re-enter', 'blockenberg'), checked: attr.repeatAnimation, onChange: function (v) { setAttr({ repeatAnimation: v }); }, __nextHasNoMarginBottom: true })
                ),
                /* Colors */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    _tc() && el(_tc(), { label:__('Text','blockenberg'), value:attr.typoText, onChange:function(v){ setAttr({typoText:v}); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Text Fill Color', 'blockenberg'), value: attr.textColor, onChange: function (v) { setAttr({ textColor: v || '#0f172a' }); } },
                        { label: __('Drawing Stroke Color', 'blockenberg'), value: attr.strokeColor, onChange: function (v) { setAttr({ strokeColor: v || '#6366f1' }); } },
                        { label: __('Underline Color', 'blockenberg'), value: attr.underlineColor, onChange: function (v) { setAttr({ underlineColor: v || '#6366f1' }); } },
                        { label: __('Section Background', 'blockenberg'), value: attr.sectionBg, onChange: function (v) { setAttr({ sectionBg: v || '' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                inspector,
                el('div', { style: { textAlign: attr.align2 } },
                    buildEditorSVG(attr)
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var blockProps = useBlockProps.save();
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-hw-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
