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
    var Button            = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5NGEzYjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZTwvdGV4dD48L3N2Zz4=';

    function getStackedStyle(index, total, a, hovered) {
        /* Fan stacking — each card rotated and offset slightly */
        var mid   = (total - 1) / 2;
        var angle = (index - mid) * a.spreadAngle;
        var tx    = (index - mid) * 18;
        var ty    = Math.abs(index - mid) * 4;
        var scale = 1 - Math.abs(index - mid) * 0.03;
        var z     = index;
        if (hovered) {
            /* spread cards wide */
            tx    = (index - mid) * a.spreadDist;
            angle = 0;
            ty    = 0;
            scale = 1;
            z     = total - index;
        }
        return {
            transform:   'translateX(' + tx + 'px) translateY(' + ty + 'px) rotate(' + angle + 'deg) scale(' + scale + ')',
            zIndex:      z,
            transition:  'transform 0.45s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease',
            flexShrink:  0
        };
    }

    registerBlockType('blockenberg/hovering-image-stack', {
        title:    __('Hovering Image Stack'),
        icon:     'format-gallery',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var useState = wp.element.useState;
            var hovered = useState(false);
            var isHovered = hovered[0];
            var setHovered = hovered[1];
            var bp      = useBlockProps({ className: 'bkbg-his-wrap' });

            function updateImage(idx, field, val) {
                var imgs = attr.images.map(function (img, i) {
                    return i === idx ? Object.assign({}, img, { [field]: val }) : img;
                });
                setAttr({ images: imgs });
            }
            function addImage() {
                setAttr({ images: attr.images.concat([{ url: '', alt: 'Image', caption: '' }]) });
            }
            function removeImage(idx) {
                if (attr.images.length <= 2) return;
                setAttr({ images: attr.images.filter(function (_, i) { return i !== idx; }) });
            }

            var total = attr.images.length;

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Images'), initialOpen: true },
                    attr.images.map(function (img, idx) {
                        return el(PanelBody, { key: idx, title: 'Image ' + (idx + 1), initialOpen: false },
                            el(MediaUploadCheck, {},
                                el(MediaUpload, {
                                    onSelect: function (media) {
                                        updateImage(idx, 'url', media.url);
                                        updateImage(idx, 'alt', media.alt || '');
                                    },
                                    allowedTypes: ['image'],
                                    value: img.url,
                                    render: function (ref) {
                                        return el(Button, {
                                            variant: img.url ? 'secondary' : 'primary',
                                            onClick: ref.open
                                        }, img.url ? __('Change Image') : __('Choose Image'));
                                    }
                                })
                            ),
                            img.url && el('img', {
                                src: img.url, alt: img.alt || '',
                                style: { maxWidth: '100%', maxHeight: '80px', objectFit: 'cover',
                                    borderRadius: '4px', marginTop: '8px', display: 'block' }
                            }),
                            el(TextControl, { label: __('Alt text'), value: img.alt || '',
                                onChange: function (v) { updateImage(idx, 'alt', v); },
                                __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Caption'), value: img.caption || '',
                                onChange: function (v) { updateImage(idx, 'caption', v); },
                                __nextHasNoMarginBottom: true }),
                            attr.images.length > 2 && el(Button, {
                                isDestructive: true, variant: 'secondary',
                                onClick: function () { removeImage(idx); },
                                style: { marginTop: '8px' }
                            }, __('Remove'))
                        );
                    }),
                    el(Button, { variant: 'primary', onClick: addImage,
                        style: { marginTop: '8px', width: '100%' }
                    }, __('+ Add Image'))
                ),

                el(PanelBody, { title: __('Layout'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Spread Mode'),
                        value: attr.spreadMode,
                        options: [
                            { label: __('Fan'), value: 'fan' },
                            { label: __('Cascade Down'), value: 'cascade' },
                            { label: __('Horizontal'), value: 'horizontal' }
                        ],
                        onChange: function (v) { setAttr({ spreadMode: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Fan Angle (°)'), value: attr.spreadAngle,
                        min: 0, max: 45,
                        onChange: function (v) { setAttr({ spreadAngle: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Spread Distance (px)'), value: attr.spreadDist,
                        min: 20, max: 200,
                        onChange: function (v) { setAttr({ spreadDist: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Image Width (px)'), value: attr.imageWidth,
                        min: 100, max: 400,
                        onChange: function (v) { setAttr({ imageWidth: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Image Height (px)'), value: attr.imageHeight,
                        min: 100, max: 600,
                        onChange: function (v) { setAttr({ imageHeight: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Border Radius (px)'), value: attr.imageRadius,
                        min: 0, max: 40,
                        onChange: function (v) { setAttr({ imageRadius: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Border Width (px)'), value: attr.borderWidth,
                        min: 0, max: 10,
                        onChange: function (v) { setAttr({ borderWidth: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Shadow Strength (%)'), value: attr.shadowStrength,
                        min: 0, max: 60,
                        onChange: function (v) { setAttr({ shadowStrength: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Captions on Hover'), checked: attr.showCaption,
                        onChange: function (v) { setAttr({ showCaption: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                el(PanelColorSettings, {
                    title: __('Colors'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background'), value: attr.bgColor,
                          onChange: function (v) { setAttr({ bgColor: v || 'transparent' }); } },
                        { label: __('Image Border'), value: attr.borderColor,
                          onChange: function (v) { setAttr({ borderColor: v || '#ffffff' }); } },
                        { label: __('Caption Text'), value: attr.captionColor,
                          onChange: function (v) { setAttr({ captionColor: v || '#0f172a' }); } },
                        { label: __('Caption BG'), value: attr.captionBg,
                          onChange: function (v) { setAttr({ captionBg: v || '#ffffff' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Typography'), initialOpen: false },
                    getTypographyControl() && el(getTypographyControl(), {
                        label: __('Caption'),
                        typo: attr.captionTypo || {},
                        onChange: function(v){ setAttr({ captionTypo: v }); }
                    })
                )
            );

            var shadowAlpha = (attr.shadowStrength / 100).toFixed(2);

            /* Preview — show stacked */
            var stackEl = el('div', {
                className: 'bkbg-his-stack',
                style: { position: 'relative', display: 'inline-flex', alignItems: 'center',
                    height: attr.imageHeight + 'px',
                    minWidth: attr.imageWidth + total * 20 + 'px' },
                onMouseEnter: function () { setHovered(true); },
                onMouseLeave: function () { setHovered(false); }
            },
                attr.images.map(function (img, i) {
                    var st = getStackedStyle(i, total, attr, isHovered);
                    return el('div', {
                        key: i, className: 'bkbg-his-card',
                        style: Object.assign({}, st, {
                            position:    'absolute',
                            width:       attr.imageWidth  + 'px',
                            height:      attr.imageHeight + 'px',
                            borderRadius: attr.imageRadius + 'px',
                            border:      attr.borderWidth + 'px solid ' + (attr.borderColor || '#ffffff'),
                            boxShadow:   '0 8px 32px rgba(0,0,0,' + shadowAlpha + ')',
                            overflow:    'hidden'
                        })
                    },
                        el('img', {
                            src: img.url || PLACEHOLDER,
                            alt: img.alt || '',
                            style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
                        })
                    );
                })
            );

            return el(wp.element.Fragment, {}, inspector,
                el('div', bp,
                    el('div', {
                        style: {
                            background: attr.bgColor || 'transparent',
                            padding: '40px 16px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: attr.imageHeight + 80 + 'px'
                        }
                    }, stackEl)
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var bp   = useBlockProps.save();
            var opts = {
                images:        attr.images,
                spreadMode:    attr.spreadMode,
                spreadAngle:   attr.spreadAngle,
                spreadDist:    attr.spreadDist,
                imageWidth:    attr.imageWidth,
                imageHeight:   attr.imageHeight,
                imageRadius:   attr.imageRadius,
                showCaption:   attr.showCaption,
                captionSize:   attr.captionSize,
                shadowStrength: attr.shadowStrength,
                borderWidth:   attr.borderWidth,
                borderColor:   attr.borderColor,
                bgColor:       attr.bgColor,
                captionColor:  attr.captionColor,
                captionBg:     attr.captionBg,
                captionTypo:   attr.captionTypo
            };
            return el('div', bp,
                el('div', { className: 'bkbg-his-app', 'data-opts': JSON.stringify(opts) })
            );
        }
    });
}() );
