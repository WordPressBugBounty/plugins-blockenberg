( function () {
    var el                = wp.element.createElement;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var MediaUpload       = wp.blockEditor.MediaUpload;
    var MediaUploadCheck  = wp.blockEditor.MediaUploadCheck;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var TextareaControl   = wp.components.TextareaControl;
    var Button            = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/interactive-image-sheen', {
        title:    __('Interactive Image Sheen'),
        icon:     'visibility',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var bp      = useBlockProps((function () {
                var s = {};
                var _tv = getTypoCssVars();
                Object.assign(s, _tv(attr.captionTypo, '--bkbg-iis-cp-'));
                return { className: 'bkbg-iis-wrap', style: s };
            })());

            var inspector = el(InspectorControls, {},
                /* Image */
                el(PanelBody, { title: __('Image'), initialOpen: true },
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { setAttr({ imageUrl: m.url, imageAlt: m.alt || '' }); },
                            allowedTypes: ['image'], value: attr.imageUrl,
                            render: function (ref) {
                                return el('div', {},
                                    attr.imageUrl && el('img', { src: attr.imageUrl, style: {
                                        width: '100%', height: 80, objectFit: 'cover',
                                        borderRadius: 8, marginBottom: 8, display: 'block'
                                    }}),
                                    el(Button, { variant: attr.imageUrl ? 'secondary' : 'primary', onClick: ref.open },
                                        attr.imageUrl ? __('Change Image') : __('Choose Image'))
                                );
                            }
                        })
                    ),
                    attr.imageUrl && el(Button, { isDestructive: true, variant: 'secondary',
                        onClick: function () { setAttr({ imageUrl: '', imageAlt: '' }); },
                        style: { marginTop: 8 }
                    }, __('Remove Image')),
                    el(TextControl, { label: __('Alt Text'), value: attr.imageAlt,
                        onChange: function (v) { setAttr({ imageAlt: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                /* Dimensions */
                el(PanelBody, { title: __('Dimensions'), initialOpen: false },
                    el(SelectControl, { label: __('Alignment'), value: attr.align2,
                        options: [
                            { label: 'Left', value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right', value: 'right' }
                        ],
                        onChange: function (v) { setAttr({ align2: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Max Width (px)'), value: attr.imageWidth,
                        min: 160, max: 1200,
                        onChange: function (v) { setAttr({ imageWidth: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Height (px)'), value: attr.imageHeight,
                        min: 100, max: 800,
                        onChange: function (v) { setAttr({ imageHeight: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Border Radius (px)'), value: attr.imageRadius,
                        min: 0, max: 60,
                        onChange: function (v) { setAttr({ imageRadius: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                /* Sheen */
                el(PanelBody, { title: __('Sheen Effect'), initialOpen: false },
                    el(RangeControl, { label: __('Sheen Size (% of card)'), value: attr.sheenSize,
                        min: 20, max: 120,
                        onChange: function (v) { setAttr({ sheenSize: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Sheen Blur (px)'), value: attr.sheenBlur,
                        min: 0, max: 100,
                        onChange: function (v) { setAttr({ sheenBlur: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Tilt Strength'), value: attr.tiltStrength,
                        min: 0, max: 30,
                        onChange: function (v) { setAttr({ tiltStrength: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Dynamic Shadow'), checked: attr.tiltShadow,
                        onChange: function (v) { setAttr({ tiltShadow: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                /* Caption */
                el(PanelBody, { title: __('Caption'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Caption'), checked: attr.showCaption,
                        onChange: function (v) { setAttr({ showCaption: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(TextareaControl, { label: __('Caption Text'), value: attr.caption,
                        onChange: function (v) { setAttr({ caption: v }); },
                        __nextHasNoMarginBottom: true }),
                    ),

                
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypographyControl() && el(getTypographyControl(), { label: __('Caption'), value: attr.captionTypo, onChange: function (v) { setAttr({ captionTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors'), initialOpen: false,
                    colorSettings: [
                        { label: __('Sheen'), value: attr.sheenColor,
                          onChange: function (v) { setAttr({ sheenColor: v || 'rgba(255,255,255,0.35)' }); } },
                        { label: __('Shadow'), value: attr.shadowColor,
                          onChange: function (v) { setAttr({ shadowColor: v || 'rgba(99,102,241,0.4)' }); } },
                        { label: __('Caption'), value: attr.captionColor,
                          onChange: function (v) { setAttr({ captionColor: v || '#64748b' }); } },
                        { label: __('Section BG'), value: attr.bgColor,
                          onChange: function (v) { setAttr({ bgColor: v || '' }); } }
                    ]
                })
            );

            var justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };

            return el(wp.element.Fragment, {}, inspector,
                el('div', bp,
                    el('div', { style: {
                        display: 'flex',
                        justifyContent: justifyMap[attr.align2] || 'center',
                        background: attr.bgColor || 'transparent',
                        padding: attr.bgColor ? '32px' : '0'
                    }},
                        el('div', { style: { maxWidth: attr.imageWidth + 'px', width: '100%' }},
                            attr.imageUrl
                                ? el('img', { src: attr.imageUrl, alt: attr.imageAlt, style: {
                                    width: '100%', height: attr.imageHeight + 'px',
                                    objectFit: 'cover', borderRadius: attr.imageRadius + 'px',
                                    display: 'block'
                                }})
                                : el('div', { style: {
                                    width: '100%', height: attr.imageHeight + 'px',
                                    background: '#e2e8f0', borderRadius: attr.imageRadius + 'px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#94a3b8', fontSize: 14
                                }}, __('Choose an image →')),
                            attr.showCaption && attr.caption && el('p', { className: 'bkbg-iis-caption', style: {
                                color: attr.captionColor
                            }}, attr.caption)
                        )
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var bp   = useBlockProps.save();
            return el('div', bp,
                el('div', { className: 'bkbg-iis-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
