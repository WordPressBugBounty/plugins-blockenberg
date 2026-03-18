( function () {
    var el                = wp.element.createElement;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var Button            = wp.components.Button;

    var _ftTC, _ftTV;
    function _tc() { return _ftTC || (_ftTC = window.bkbgTypographyControl); }
    function _tv() { return _ftTV || (_ftTV = window.bkbgTypoCssVars); }

    var SIZE_LABELS = ['XS', 'S', 'M', 'L', 'XL'];

    function fontSize(tag, attr) {
        var sizes = attr.showSizes ? [1, 2, 3] : [2, 2, 2];
        var s = Math.max(1, Math.min(3, tag.size || 1));
        var t = (s - 1) / 2;
        return Math.round(attr.minFontSize + t * (attr.maxFontSize - attr.minFontSize));
    }

    registerBlockType('blockenberg/floating-tags', {
        title:    __('Floating Tags'),
        icon:     'tag',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var bp      = useBlockProps({ className: 'bkbg-ft-wrap', style: Object.assign({}, _tv()(attr.typoTag, '--bkbg-ft-tg-')) });

            function updateTag(idx, field, val) {
                var tags = attr.tags.map(function (t, i) {
                    return i === idx ? Object.assign({}, t, { [field]: val }) : t;
                });
                setAttr({ tags: tags });
            }
            function addTag() {
                setAttr({ tags: attr.tags.concat([{ text: 'New Tag', size: 1, url: '' }]) });
            }
            function removeTag(idx) {
                setAttr({ tags: attr.tags.filter(function (_, i) { return i !== idx; }) });
            }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Tags'), initialOpen: true },
                    attr.tags.map(function (tag, idx) {
                        return el('div', { key: idx, style: {
                            display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8
                        }},
                            el(TextControl, { value: tag.text || '',
                                onChange: function (v) { updateTag(idx, 'text', v); },
                                placeholder: __('Tag text'),
                                style: { flex: 2, margin: 0 },
                                __nextHasNoMarginBottom: true }),
                            el(SelectControl, { value: String(tag.size || 1),
                                options: [
                                    { label: __('S'), value: '1' },
                                    { label: __('M'), value: '2' },
                                    { label: __('L'), value: '3' }
                                ],
                                onChange: function (v) { updateTag(idx, 'size', Number(v)); },
                                style: { flex: 1, margin: 0 },
                                __nextHasNoMarginBottom: true }),
                            el(Button, { isDestructive: true, size: 'small',
                                onClick: function () { removeTag(idx); }
                            }, '✕')
                        );
                    }),
                    el(Button, { variant: 'primary', onClick: addTag,
                        style: { width: '100%', marginTop: 8 }
                    }, __('+ Add Tag'))
                ),

                el(PanelBody, { title: __('Appearance'), initialOpen: false },
                    el(SelectControl, { label: __('Alignment'), value: attr.alignment,
                        options: [
                            { label: __('Left'),   value: 'left' },
                            { label: __('Center'), value: 'center' },
                            { label: __('Right'),  value: 'right' }
                        ],
                        onChange: function (v) { setAttr({ alignment: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Size-based font'), checked: attr.showSizes,
                        onChange: function (v) { setAttr({ showSizes: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Border Radius (px)'), value: attr.tagRadius,
                        min: 0, max: 100,
                        onChange: function (v) { setAttr({ tagRadius: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Pad H (px)'), value: attr.tagPaddingH,
                        min: 4, max: 32,
                        onChange: function (v) { setAttr({ tagPaddingH: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Pad V (px)'), value: attr.tagPaddingV,
                        min: 2, max: 20,
                        onChange: function (v) { setAttr({ tagPaddingV: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Gap (px)'), value: attr.gap,
                        min: 4, max: 24,
                        onChange: function (v) { setAttr({ gap: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                el(PanelBody, { title: __('Animation'), initialOpen: false },
                    el(ToggleControl, { label: __('Float Animation'), checked: attr.animateFloat,
                        onChange: function (v) { setAttr({ animateFloat: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Float Amplitude (px)'), value: attr.floatAmplitude,
                        min: 2, max: 24,
                        onChange: function (v) { setAttr({ floatAmplitude: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Float Speed (s)'), value: attr.floatSpeed,
                        min: 1, max: 10,
                        onChange: function (v) { setAttr({ floatSpeed: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Hover Scale'), value: attr.hoverScale,
                        min: 1, max: 1.5, step: 0.05,
                        onChange: function (v) { setAttr({ hoverScale: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(RangeControl, { label: __('Min Font Size (px)'), value: attr.minFontSize,
                                            min: 10, max: 20,
                                            onChange: function (v) { setAttr({ minFontSize: v }); },
                                            __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Max Font Size (px)'), value: attr.maxFontSize,
                                            min: 14, max: 48,
                                            onChange: function (v) { setAttr({ maxFontSize: v }); },
                                            __nextHasNoMarginBottom: true }),
                    _tc()({ label: __('Tag Font', 'blockenberg'), value: attr.typoTag, onChange: function (v) { setAttr({ typoTag: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors'), initialOpen: false,
                    colorSettings: [
                        { label: __('Tag BG'), value: attr.tagBg,
                          onChange: function (v) { setAttr({ tagBg: v || '#f1f5f9' }); } },
                        { label: __('Tag Text'), value: attr.tagColor,
                          onChange: function (v) { setAttr({ tagColor: v || '#334155' }); } },
                        { label: __('Hover BG'), value: attr.tagHoverBg,
                          onChange: function (v) { setAttr({ tagHoverBg: v || '#6366f1' }); } },
                        { label: __('Hover Text'), value: attr.tagHoverColor,
                          onChange: function (v) { setAttr({ tagHoverColor: v || '#ffffff' }); } },
                        { label: __('Border'), value: attr.tagBorder,
                          onChange: function (v) { setAttr({ tagBorder: v || '#e2e8f0' }); } }
                    ]
                })
            );

            return el(wp.element.Fragment, {}, inspector,
                el('div', bp,
                    attr.sectionBg && el('style', {}, '.bkbg-ft-wrap{background:' + attr.sectionBg + '}'),
                    el('div', {
                        style: {
                            display: 'flex', flexWrap: 'wrap',
                            gap: attr.gap + 'px',
                            justifyContent: attr.alignment === 'center' ? 'center' : attr.alignment === 'right' ? 'flex-end' : 'flex-start',
                            padding: '16px 0'
                        }
                    },
                        attr.tags.map(function (tag, i) {
                            var fs = fontSize(tag, attr);
                            return el('span', { key: i, className: 'bkbg-ft-tag', style: {
                                fontSize: fs + 'px',
                                fontWeight: tag.size >= 3 ? 700 : tag.size >= 2 ? 600 : 400,
                                background: attr.tagBg,
                                color: attr.tagColor,
                                borderRadius: attr.tagRadius + 'px',
                                padding: attr.tagPaddingV + 'px ' + attr.tagPaddingH + 'px',
                                border: '1px solid ' + attr.tagBorder
                            }}, tag.text);
                        })
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var bp   = useBlockProps.save();
            return el('div', bp,
                el('div', { className: 'bkbg-ft-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
