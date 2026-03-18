( function () {
    var el                = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RichText          = wp.blockEditor.RichText;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'contentTypo', attrs, '--bkufd-ct-');
        _tvf(v, 'buttonTypo', attrs, '--bkufd-bt-');
        return v;
    }

    registerBlockType('blockenberg/unfold', {
        edit: function (props) {
            var a   = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () { var _tv = getTypoCssVars(a); var s = {}; Object.assign(s, _tv); return { style: s }; })());

            var btnStyle = {};
            if (a.buttonStyle === 'filled') {
                btnStyle = {
                    background: a.buttonBg || '#6366f1',
                    color:      a.buttonColor || '#ffffff',
                    border:     'none',
                    borderRadius: (a.borderRadius || 8) + 'px',
                    padding: '10px 24px',
                    cursor: 'pointer',
                    transition: 'opacity .2s, transform .15s',
                    display: 'inline-block'
                };
            } else if (a.buttonStyle === 'outline') {
                btnStyle = {
                    background: 'transparent',
                    color:      a.accentColor || '#6366f1',
                    border:     '2px solid ' + (a.accentColor || '#6366f1'),
                    borderRadius: (a.borderRadius || 8) + 'px',
                    padding: '10px 24px',
                    cursor: 'pointer',
                    display: 'inline-block'
                };
            } else { // text
                btnStyle = {
                    background: 'none',
                    border: 'none',
                    color: a.accentColor || '#6366f1',
                    cursor: 'pointer',
                    padding: '4px 0',
                    display: 'inline-block'
                };
            }

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: 'Content', initialOpen: true },
                        el(RangeControl, { label: 'Preview height (px)', value: a.previewHeight || 200,
                            onChange: function (v) { set({ previewHeight: v }); }, min: 60, max: 800, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Fade gradient height (px)', value: a.gradientHeight || 60,
                            onChange: function (v) { set({ gradientHeight: v }); }, min: 20, max: 200, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Expand animation (ms)', value: a.animationDuration || 400,
                            onChange: function (v) { set({ animationDuration: v }); }, min: 100, max: 1200, step: 50, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Button Settings', initialOpen: false },
                        el(TextControl, { label: 'Expand button text', value: a.expandText || '',
                            onChange: function (v) { set({ expandText: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Collapse button text', value: a.collapseText || '',
                            onChange: function (v) { set({ collapseText: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show collapse button', checked: a.showCollapseBtn !== false,
                            onChange: function (v) { set({ showCollapseBtn: v }); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: 'Button alignment', value: a.buttonAlign || 'center',
                            options: [
                                { label: 'Left',   value: 'left' },
                                { label: 'Center', value: 'center' },
                                { label: 'Right',  value: 'right' }
                            ],
                            onChange: function (v) { set({ buttonAlign: v }); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: 'Button style', value: a.buttonStyle || 'filled',
                            options: [
                                { label: 'Filled',  value: 'filled' },
                                { label: 'Outline', value: 'outline' },
                                { label: 'Text',    value: 'text' }
                            ],
                            onChange: function (v) { set({ buttonStyle: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Border radius', value: a.borderRadius || 8,
                            onChange: function (v) { set({ borderRadius: v }); }, min: 0, max: 40, __nextHasNoMarginBottom: true })
                    ),
                    
                    el( PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl('Content', 'contentTypo', a, set),
                        getTypoControl('Button', 'buttonTypo', a, set)
                    ),
el(PanelColorSettings, {
                        title: 'Colors', initialOpen: false,
                        colorSettings: [
                            { label: 'Section background', value: a.sectionBg,    onChange: function (v) { set({ sectionBg:    v || '#ffffff' }); } },
                            { label: 'Content text',       value: a.contentColor, onChange: function (v) { set({ contentColor: v || '#374151' }); } },
                            { label: 'Gradient end color', value: a.gradientTo,   onChange: function (v) { set({ gradientTo:   v || '#ffffff' }); } },
                            { label: 'Accent / focus',     value: a.accentColor,  onChange: function (v) { set({ accentColor:  v || '#6366f1' }); } },
                            { label: 'Button background',  value: a.buttonBg,     onChange: function (v) { set({ buttonBg:     v || '#6366f1' }); } },
                            { label: 'Button text',        value: a.buttonColor,  onChange: function (v) { set({ buttonColor:  v || '#ffffff' }); } }
                        ],
                        disableCustomGradients: true
                    })
                ),

                // Editor preview
                el('div', {
                    style: {
                        background: a.sectionBg || '#ffffff',
                        padding: '24px',
                        borderRadius: (a.borderRadius || 8) + 'px',
                        border: '1px solid #e5e7eb'
                    }
                },
                    // Content area (limited height visually)
                    el('div', {
                        className: 'bkbg-ufd-content-body',
                        style: {
                            position: 'relative',
                            maxHeight: (a.previewHeight || 200) + 'px',
                            overflow: 'hidden',
                            color: a.contentColor || '#374151'
                        }
                    },
                        el(RichText, {
                            tagName: 'div',
                            value: a.content,
                            onChange: function (v) { set({ content: v }); },
                            placeholder: 'Write your expandable content here…',
                            multiline: 'p'
                        }),
                        // Gradient overlay
                        el('div', {
                            style: {
                                position: 'absolute',
                                bottom: 0, left: 0, right: 0,
                                height: (a.gradientHeight || 60) + 'px',
                                background: 'linear-gradient(transparent, ' + (a.gradientTo || '#ffffff') + ')',
                                pointerEvents: 'none'
                            }
                        })
                    ),
                    // Button row
                    el('div', {
                        style: {
                            textAlign: a.buttonAlign || 'center',
                            marginTop: 16
                        }
                    },
                        el('span', { className: 'bkbg-ufd-btn', style: btnStyle }, a.expandText || 'Read More ↓')
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save((function () { var _tv = getTypoCssVars(a); var s = {}; Object.assign(s, _tv); return { style: s }; })());
            var opts = {
                previewHeight:    a.previewHeight    || 200,
                expandText:       a.expandText       || 'Read More ↓',
                collapseText:     a.collapseText     || 'Show Less ↑',
                showCollapseBtn:  a.showCollapseBtn  !== false,
                gradientHeight:   a.gradientHeight   || 60,
                animationDuration: a.animationDuration || 400,
                buttonAlign:      a.buttonAlign      || 'center',
                buttonStyle:      a.buttonStyle      || 'filled',
                borderRadius:     a.borderRadius      || 8,
                sectionBg:        a.sectionBg         || '#ffffff',
                contentColor:     a.contentColor      || '#374151',
                gradientTo:       a.gradientTo        || '#ffffff',
                accentColor:      a.accentColor       || '#6366f1',
                buttonBg:         a.buttonBg          || '#6366f1',
                buttonColor:      a.buttonColor       || '#ffffff'
            };
            return el('div', blockProps,
                el('div', { className: 'bkbg-ufd-app', 'data-opts': JSON.stringify(opts) },
                    el('div', { className: 'bkbg-ufd-content-src' },
                        el(RichText.Content, { tagName: 'div', value: a.content, multiline: 'p' })
                    )
                )
            );
        }
    });
}() );
