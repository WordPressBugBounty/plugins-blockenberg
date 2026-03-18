( function () {
    var el                = wp.element.createElement;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RichText          = wp.blockEditor.RichText;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    function EditorPreview(props) {
        var a = props.attributes;
        /* Split text into character spans */
        var chars = (a.text || '').split('').map(function (ch, i) {
            return el('span', {
                key: i,
                className: 'bkbg-kt-char',
                style: { color: a.textColor || '#0f172a' }
            }, ch === ' ' ? '\u00a0' : ch);
        });

        return el(a.tag || 'h2', {
            className: 'bkbg-kt-text',
            style: {
                textAlign:      a.textAlign || 'center',
                userSelect:     'none',
                cursor:         'default'
            }
        }, chars);
    }

    registerBlockType('blockenberg/kinetic-text', {
        title:    __('Kinetic Text'),
        icon:     'editor-spellcheck',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var bp      = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {
                    background: attr.bgColor || 'transparent',
                    padding:    '32px 16px',
                    textAlign:  attr.textAlign || 'center'
                };
                if (_tvFn) Object.assign(s, _tvFn(attr.textTypo, '--bkbg-kt-tx-'));
                return { className: 'bkbg-kt-wrap', style: s };
            })());

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Text'), initialOpen: true },
                    el(RichText, {
                        tagName:  'span',
                        value:    attr.text,
                        onChange: function (v) { setAttr({ text: v.replace(/<[^>]*>/g, '') }); },
                        placeholder: __('Type your text…'),
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('HTML Tag'),
                        value: attr.tag,
                        options: [
                            { label: 'H1', value: 'h1' },
                            { label: 'H2', value: 'h2' },
                            { label: 'H3', value: 'h3' },
                            { label: 'H4', value: 'h4' },
                            { label: 'p',  value: 'p'  },
                            { label: 'div', value: 'div' }
                        ],
                        onChange: function (v) { setAttr({ tag: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Text Align'),
                        value: attr.textAlign,
                        options: [
                            { label: __('Left'),   value: 'left' },
                            { label: __('Center'), value: 'center' },
                            { label: __('Right'),  value: 'right' }
                        ],
                        onChange: function (v) { setAttr({ textAlign: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    ),

                el(PanelBody, { title: __('Scatter Effect'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Trigger'),
                        value: attr.trigger,
                        options: [
                            { label: __('On Hover'),    value: 'hover' },
                            { label: __('On Click'),    value: 'click' },
                            { label: __('Auto Loop'),   value: 'auto'  }
                        ],
                        onChange: function (v) { setAttr({ trigger: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Scatter Mode'),
                        value: attr.scatterMode,
                        options: [
                            { label: __('Explode Outward'), value: 'explode' },
                            { label: __('Rain Down'),       value: 'rain'    },
                            { label: __('Spin & Scatter'),  value: 'spin'    },
                            { label: __('Float Up'),        value: 'float'   }
                        ],
                        onChange: function (v) { setAttr({ scatterMode: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Scatter Radius (px)'), value: attr.scatterRadius,
                        min: 40, max: 400,
                        onChange: function (v) { setAttr({ scatterRadius: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Scatter Duration (ms)'), value: attr.scatterDuration,
                        min: 100, max: 1000, step: 50,
                        onChange: function (v) { setAttr({ scatterDuration: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Return Duration (ms)'), value: attr.returnDuration,
                        min: 100, max: 1500, step: 50,
                        onChange: function (v) { setAttr({ returnDuration: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Stagger Delay (ms)'), value: attr.stagger,
                        min: 0, max: 100, step: 5,
                        onChange: function (v) { setAttr({ stagger: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: __('Text'), value: attr.textTypo || {}, onChange: function (v) { setAttr({ textTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors'), initialOpen: false,
                    colorSettings: [
                        { label: __('Text Color'), value: attr.textColor,
                          onChange: function (v) { setAttr({ textColor: v || '#0f172a' }); } },
                        { label: __('Hover Color'), value: attr.hoverColor,
                          onChange: function (v) { setAttr({ hoverColor: v || '#6366f1' }); } },
                        { label: __('Background'), value: attr.bgColor,
                          onChange: function (v) { setAttr({ bgColor: v || 'transparent' }); } }
                    ]
                })
            );

            return el(wp.element.Fragment, {}, inspector,
                el('div', bp,
                    el(EditorPreview, { attributes: attr })
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var bp   = useBlockProps.save();
            var opts = {
                text:           attr.text,
                tag:            attr.tag,
                trigger:        attr.trigger,
                scatterMode:    attr.scatterMode,
                scatterRadius:  attr.scatterRadius,
                scatterDuration: attr.scatterDuration,
                returnDuration: attr.returnDuration,
                stagger:        attr.stagger,
                fontSize:       attr.fontSize,
                fontWeight:     attr.fontWeight,
                letterSpacing:  attr.letterSpacing,
                textAlign:      attr.textAlign,
                textColor:      attr.textColor,
                textTypo:       attr.textTypo,
                hoverColor:     attr.hoverColor,
                bgColor:        attr.bgColor
            };
            return el('div', bp,
                el('div', { className: 'bkbg-kt-app', 'data-opts': JSON.stringify(opts) })
            );
        }
    });
}() );
