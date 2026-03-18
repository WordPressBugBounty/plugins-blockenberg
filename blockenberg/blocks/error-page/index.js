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
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _epgTC, _epgTV;
    function _tc() { return _epgTC || (_epgTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_epgTV || (_epgTV = window.bkbgTypoCssVars)) ? _epgTV(t, p) : {}; }

    registerBlockType('blockenberg/error-page', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-ep-editor', style: Object.assign({},
                _tv(attr.typoCode || {}, '--bkbg-ep-cd-'),
                _tv(attr.typoHeading || {}, '--bkbg-ep-hd-'),
                _tv(attr.typoBody || {}, '--bkbg-ep-bd-')
            ) });

            var previewStyle = { background: attr.bgColor, padding: attr.paddingTop + 'px 40px ' + attr.paddingBottom + 'px', textAlign: 'center' };
            var innerStyle = { maxWidth: attr.maxWidth + 'px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Error Code', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showError, onChange: function (v) { setAttr({ showError: v }); } }),
                        attr.showError && el(TextControl, { label: __('Error Code', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.errorCode, onChange: function (v) { setAttr({ errorCode: v }); } }),
                        el(TextControl, { label: __('Primary Button Label', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.primaryLabel, onChange: function (v) { setAttr({ primaryLabel: v }); } }),
                        el(TextControl, { label: __('Primary Button URL', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.primaryUrl, onChange: function (v) { setAttr({ primaryUrl: v }); } }),
                        el(ToggleControl, { label: __('Show Secondary Button', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showSecondary, onChange: function (v) { setAttr({ showSecondary: v }); } }),
                        attr.showSecondary && el(TextControl, { label: __('Secondary Button Label', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.secondaryLabel, onChange: function (v) { setAttr({ secondaryLabel: v }); } }),
                        attr.showSecondary && el(TextControl, { label: __('Secondary Button URL', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.secondaryUrl, onChange: function (v) { setAttr({ secondaryUrl: v }); } }),
                        el(ToggleControl, { label: __('Show Search Bar', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showSearch, onChange: function (v) { setAttr({ showSearch: v }); } })
                    ),
                    el(PanelBody, { title: __('Illustration', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Illustration Image', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showImage, onChange: function (v) { setAttr({ showImage: v }); } }),
                        attr.showImage && el(Fragment, null,
                            el(MediaUploadCheck, null,
                                el(MediaUpload, {
                                    onSelect: function (m) { setAttr({ imageUrl: m.url, imageId: m.id, imageAlt: m.alt || '' }); },
                                    allowedTypes: ['image'], value: attr.imageId,
                                    render: function (r) {
                                        return el(Fragment, null,
                                            attr.imageUrl && el('img', { src: attr.imageUrl, style: { maxWidth: 160, display: 'block', marginBottom: 8 } }),
                                            el(Button, { onClick: r.open, variant: 'secondary', __nextHasNoMarginBottom: true }, attr.imageUrl ? __('Change Image', 'blockenberg') : __('Select Illustration', 'blockenberg')),
                                            attr.imageUrl && el(Button, { onClick: function () { setAttr({ imageUrl: '', imageId: 0 }); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true, style: { marginLeft: 8 } }, __('Remove', 'blockenberg'))
                                        );
                                    }
                                })
                            ),
                            el(RangeControl, { label: __('Image Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.imageWidth, min: 100, max: 600, onChange: function (v) { setAttr({ imageWidth: v }); } })
                        )
                    ),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.maxWidth, min: 400, max: 1200, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingTop, min: 0, max: 300, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingBottom, min: 0, max: 300, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Error Code', 'blockenberg'), typo: attr.typoCode || {}, onChange: function (v) { setAttr({ typoCode: v }); } }),
                        _tc() && el(_tc(), { label: __('Heading', 'blockenberg'), typo: attr.typoHeading || {}, onChange: function (v) { setAttr({ typoHeading: v }); } }),
                        _tc() && el(_tc(), { label: __('Body / Buttons', 'blockenberg'), typo: attr.typoBody || {}, onChange: function (v) { setAttr({ typoBody: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,         onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); },         label: __('Background', 'blockenberg') },
                            { value: attr.errorCodeColor,  onChange: function (v) { setAttr({ errorCodeColor: v || '#f3f0ff' }); },  label: __('Error Code Color', 'blockenberg') },
                            { value: attr.headingColor,    onChange: function (v) { setAttr({ headingColor: v || '#111827' }); },    label: __('Heading', 'blockenberg') },
                            { value: attr.textColor,       onChange: function (v) { setAttr({ textColor: v || '#6b7280' }); },       label: __('Body Text', 'blockenberg') },
                            { value: attr.primaryBg,       onChange: function (v) { setAttr({ primaryBg: v || '#7c3aed' }); },       label: __('Primary Button BG', 'blockenberg') },
                            { value: attr.primaryColor,    onChange: function (v) { setAttr({ primaryColor: v || '#ffffff' }); },    label: __('Primary Button Text', 'blockenberg') },
                            { value: attr.secondaryColor,  onChange: function (v) { setAttr({ secondaryColor: v || '#374151' }); },  label: __('Secondary Button Text', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { style: previewStyle },
                        el('div', { style: innerStyle },
                            attr.showImage && attr.imageUrl && el('img', { src: attr.imageUrl, alt: attr.imageAlt, style: { width: attr.imageWidth + 'px', display: 'block' } }),
                            attr.showError && el('div', { className: 'bkbg-ep-code', style: { color: attr.errorCodeColor, userSelect: 'none' } }, attr.errorCode),
                            el(RichText, { tagName: 'h1', className: 'bkbg-ep-heading', value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, style: { color: attr.headingColor, margin: 0 }, placeholder: __('Error heading…', 'blockenberg') }),
                            el(RichText, { tagName: 'p', className: 'bkbg-ep-body', value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, style: { color: attr.textColor, margin: 0, maxWidth: 520 }, placeholder: __('Explanation…', 'blockenberg') }),
                            attr.showSearch && el('div', { style: { display: 'flex', gap: 8, width: '100%', maxWidth: 420 } },
                                el('input', { type: 'search', placeholder: __('Search…', 'blockenberg'), readOnly: true, style: { flex: 1, padding: '12px 20px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 15 } }),
                                el('button', { style: { padding: '12px 20px', borderRadius: 8, background: attr.primaryBg, color: attr.primaryColor, border: 'none', fontWeight: 600, cursor: 'pointer' } }, __('Search', 'blockenberg'))
                            ),
                            el('div', { style: { display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' } },
                                el('a', { href: '#', className: 'bkbg-ep-primary', style: { background: attr.primaryBg, color: attr.primaryColor } }, '← ' + attr.primaryLabel),
                                attr.showSecondary && el('a', { href: '#', className: 'bkbg-ep-secondary', style: { color: attr.secondaryColor } }, attr.secondaryLabel)
                            )
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-error-page-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
