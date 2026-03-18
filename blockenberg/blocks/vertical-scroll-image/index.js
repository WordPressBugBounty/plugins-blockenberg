( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'labelTypo',   attrs, '--bkvsi-lb-');
        _tvf(v, 'captionTypo', attrs, '--bkvsi-cp-');
        return v;
    }

    var shadowMap = {
        none: 'none',
        sm:   '0 2px 8px rgba(0,0,0,0.10)',
        md:   '0 8px 32px rgba(0,0,0,0.15)',
        lg:   '0 20px 60px rgba(0,0,0,0.22)'
    };

    registerBlockType('blockenberg/vertical-scroll-image', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var s = getTypoCssVars(attr);
                return { className: 'bkbg-vsi-editor', style: s };
            })());

            var containerStyle = {
                position: 'relative',
                overflow: 'hidden',
                height: attr.containerHeight + 'px',
                borderRadius: attr.borderRadius + 'px',
                border: '1px solid ' + attr.borderColor,
                boxShadow: shadowMap[attr.shadowSize] || shadowMap.md,
                background: attr.bgColor,
                cursor: 'ns-resize'
            };

            var imgStyle = {
                width: attr.scrollDirection === 'horizontal' ? 'auto' : '100%',
                height: attr.scrollDirection === 'horizontal' ? '100%' : 'auto',
                display: 'block',
                minHeight: attr.scrollDirection === 'vertical' ? attr.containerHeight + 'px' : undefined,
                transition: 'object-position ' + attr.scrollDuration + 's ease',
                objectFit: 'none',
                objectPosition: attr.scrollDirection === 'vertical' ? 'center top' : 'left center'
            };

            var wrapStyle = {
                background: '#fff',
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px'
            };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: true },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { setAttr({ imageUrl: m.url, imageId: m.id, imageAlt: m.alt || '' }); },
                                allowedTypes: ['image'], value: attr.imageId,
                                render: function (r) {
                                    return el(Fragment, null,
                                        attr.imageUrl && el('img', { src: attr.imageUrl, style: { width: '100%', height: 80, objectFit: 'cover', borderRadius: 4, marginBottom: 8 } }),
                                        el(Button, { onClick: r.open, variant: 'secondary', __nextHasNoMarginBottom: true }, attr.imageUrl ? __('Change Image', 'blockenberg') : __('Select Image', 'blockenberg')),
                                        attr.imageUrl && el(Button, { onClick: function () { setAttr({ imageUrl: '', imageId: 0, imageAlt: '' }); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true }, __('Remove', 'blockenberg'))
                                    );
                                }
                            })
                        ),
                        el(ToggleControl, { label: __('Show Caption', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showCaption, onChange: function (v) { setAttr({ showCaption: v }); } }),
                        el(ToggleControl, { label: __('Show Scroll Hint Label', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showLabel, onChange: function (v) { setAttr({ showLabel: v }); } })
                    ),
                    el(PanelBody, { title: __('Scroll Behavior', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Scroll Direction', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.scrollDirection,
                            options: [{ label: 'Vertical ↕', value: 'vertical' }, { label: 'Horizontal ↔', value: 'horizontal' }],
                            onChange: function (v) { setAttr({ scrollDirection: v }); } }),
                        el(SelectControl, { label: __('Trigger', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.scrollTrigger,
                            options: [{ label: __('Hover', 'blockenberg'), value: 'hover' }, { label: __('Auto (loop)', 'blockenberg'), value: 'auto' }],
                            onChange: function (v) { setAttr({ scrollTrigger: v }); } }),
                        el(RangeControl, { label: __('Scroll Duration (s)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.scrollDuration, min: 1, max: 15, onChange: function (v) { setAttr({ scrollDuration: v }); } }),
                        el(RangeControl, { label: __('Container Height (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.containerHeight, min: 150, max: 800, onChange: function (v) { setAttr({ containerHeight: v }); } })
                    ),
                    el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.borderRadius, min: 0, max: 32, onChange: function (v) { setAttr({ borderRadius: v }); } }),
                        el(SelectControl, { label: __('Shadow', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.shadowSize,
                            options: [{ label: 'None', value: 'none' }, { label: 'Small', value: 'sm' }, { label: 'Medium', value: 'md' }, { label: 'Large', value: 'lg' }],
                            onChange: function (v) { setAttr({ shadowSize: v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.maxWidth, min: 300, max: 1400, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingTop, min: 0, max: 150, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingBottom, min: 0, max: 150, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                    ),
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl(__('Label', 'blockenberg'), 'labelTypo', attr, setAttr),
                        getTypoControl(__('Caption', 'blockenberg'), 'captionTypo', attr, setAttr)
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,      onChange: function (v) { setAttr({ bgColor: v || '#f9fafb' }); },             label: __('Section Background', 'blockenberg') },
                            { value: attr.borderColor,  onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); },          label: __('Image Border', 'blockenberg') },
                            { value: attr.captionColor, onChange: function (v) { setAttr({ captionColor: v || '#6b7280' }); },         label: __('Caption Text', 'blockenberg') },
                            { value: attr.labelColor,   onChange: function (v) { setAttr({ labelColor: v || '#ffffff' }); },           label: __('Label Text', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { style: wrapStyle },
                        el('div', { style: { maxWidth: attr.maxWidth + 'px', margin: '0 auto', padding: '0 20px' } },
                            el('div', { style: containerStyle },
                                attr.imageUrl
                                    ? el('img', { src: attr.imageUrl, alt: attr.imageAlt, style: { width: '100%', height: 'auto', display: 'block' } })
                                    : el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: 14 } },
                                        el(MediaUploadCheck, null,
                                            el(MediaUpload, {
                                                onSelect: function (m) { setAttr({ imageUrl: m.url, imageId: m.id, imageAlt: m.alt || '' }); },
                                                allowedTypes: ['image'], value: attr.imageId,
                                                render: function (r) {
                                                    return el(Button, { onClick: r.open, variant: 'primary', __nextHasNoMarginBottom: true }, __('+ Select Image', 'blockenberg'));
                                                }
                                            })
                                        )
                                    ),
                                attr.showLabel && el('div', { className: 'bkbg-vsi-label', style: { background: attr.labelBg, color: attr.labelColor } },
                                    (attr.scrollDirection === 'vertical' ? '↕ ' : '↔ ') + attr.label
                                )
                            ),
                            attr.showCaption && el(RichText, { tagName: 'p', className: 'bkbg-vsi-caption', value: attr.caption, onChange: function (v) { setAttr({ caption: v }); },
                                style: { color: attr.captionColor },
                                placeholder: __('Image caption…', 'blockenberg') })
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save((function () { var _tv = getTypoCssVars(attr); return { style: _tv }; })());
            return el('div', blockProps,
                el('div', { className: 'bkbg-vertical-scroll-image-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
