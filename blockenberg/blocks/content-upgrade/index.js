( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var RangeControl = wp.components.RangeControl;
    var Button = wp.components.Button;

    var _tcCUP, _tvCUP;
    function getCupTC() { return _tcCUP || (_tcCUP = window.bkbgTypographyControl); }
    function getCupTV() { return _tvCUP || (_tvCUP = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/content-upgrade', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;

            var tv = getCupTV();
            var blockProps = useBlockProps({ style: Object.assign({ background: attr.bgColor }, tv(attr.typoHeading, '--bkcup-head-'), tv(attr.typoDesc, '--bkcup-desc-')) });

            /* Preview wrapper */
            var isBoxed = attr.style === 'boxed';
            var isMinimal = attr.style === 'minimal';

            var previewStyle = {
                display: 'flex', gap: '32px', alignItems: 'center',
                padding: attr.paddingTop + 'px 32px ' + attr.paddingBottom + 'px',
                background: isMinimal ? 'transparent' : attr.bgColor,
                border: isBoxed ? '2px solid ' + attr.borderColor : (isMinimal ? '2px dashed ' + attr.borderColor : 'none'),
                borderRadius: isBoxed ? attr.borderRadius + 'px' : (isMinimal ? '0' : attr.borderRadius + 'px'),
                borderLeft: isMinimal ? '4px solid ' + attr.accentColor : undefined
            };

            /* Left: image */
            var leftCol = attr.imageUrl
                ? el('div', { style: { flexShrink: 0 } },
                    el('img', { src: attr.imageUrl, alt: attr.imageAlt, style: { width: '140px', height: '140px', objectFit: 'cover', borderRadius: '8px', display: 'block' } })
                  )
                : el('div', { style: { flexShrink: 0, width: '100px', height: '100px', background: attr.accentColor + '22', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' } }, '🎁');

            /* Right: text + form */
            var rightCol = el('div', { style: { flex: 1 } },
                el(RichText, {
                    tagName: 'p', className: 'bkbg-cup-heading',
                    style: { margin: '0 0 8px', color: attr.headingColor },
                    value: attr.heading, placeholder: __('Heading…', 'blockenberg'),
                    onChange: function (v) { set({ heading: v }); }
                }),
                el(RichText, {
                    tagName: 'p', className: 'bkbg-cup-desc',
                    style: { margin: '0 0 16px', color: attr.descColor },
                    value: attr.description, placeholder: __('Description…', 'blockenberg'),
                    onChange: function (v) { set({ description: v }); }
                }),
                el('div', { style: { display: 'flex', gap: '8px' } },
                    el('input', { type: 'email', placeholder: attr.formPlaceholder, readOnly: true, style: { flex: 1, padding: '10px 14px', background: attr.inputBg, border: '1px solid ' + attr.inputBorder, color: attr.inputColor, borderRadius: '6px', fontSize: '14px' } }),
                    el('button', { style: { padding: '10px 20px', background: attr.submitBg, color: attr.submitColor, border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' } }, attr.formSubmitLabel)
                )
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'), value: attr.style, __nextHasNoMarginBottom: true,
                        options: [
                            { label: 'Boxed', value: 'boxed' },
                            { label: 'Inline (no border)', value: 'inline' },
                            { label: 'Minimal (left accent bar)', value: 'minimal' }
                        ],
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el('div', { style: { marginTop: '12px' } },
                        el(TextControl, {
                            label: __('Form Placeholder', 'blockenberg'), value: attr.formPlaceholder, __nextHasNoMarginBottom: true,
                            onChange: function (v) { set({ formPlaceholder: v }); }
                        })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(TextControl, {
                            label: __('Submit Button Label', 'blockenberg'), value: attr.formSubmitLabel, __nextHasNoMarginBottom: true,
                            onChange: function (v) { set({ formSubmitLabel: v }); }
                        })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(TextControl, {
                            label: __('Form Action URL', 'blockenberg'), value: attr.formAction, __nextHasNoMarginBottom: true,
                            onChange: function (v) { set({ formAction: v }); }
                        })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(TextareaControl, {
                            label: __('Success Message', 'blockenberg'), value: attr.successMessage, __nextHasNoMarginBottom: true,
                            onChange: function (v) { set({ successMessage: v }); }
                        })
                    )
                ),
                el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: false },
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { set({ imageUrl: m.url, imageId: m.id, imageAlt: m.alt || '' }); },
                            allowedTypes: ['image'], value: attr.imageId,
                            render: function (rp) {
                                return el('div', {},
                                    attr.imageUrl && el('img', { src: attr.imageUrl, style: { width: '100%', borderRadius: '6px', marginBottom: '8px' } }),
                                    el(Button, { onClick: rp.open, variant: 'secondary', __nextHasNoMarginBottom: true }, attr.imageUrl ? __('Replace Image', 'blockenberg') : __('Upload Image', 'blockenberg')),
                                    attr.imageUrl && el(Button, { onClick: function () { set({ imageUrl: '', imageId: 0, imageAlt: '' }); }, variant: 'link', isDestructive: true, style: { marginLeft: '8px' } }, __('Remove', 'blockenberg'))
                                );
                            }
                        })
                    )
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 120, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ paddingTop: v }); }
                    }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, {
                            label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 120, __nextHasNoMarginBottom: true,
                            onChange: function (v) { set({ paddingBottom: v }); }
                        })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, {
                            label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 32, __nextHasNoMarginBottom: true,
                            onChange: function (v) { set({ borderRadius: v }); }
                        })
                    )
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#f5f3ff' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#ddd6fe' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#6366f1' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { set({ headingColor: v || '#1e1b4b' }); } },
                        { label: __('Description', 'blockenberg'), value: attr.descColor, onChange: function (v) { set({ descColor: v || '#4b5563' }); } },
                        { label: __('Input Background', 'blockenberg'), value: attr.inputBg, onChange: function (v) { set({ inputBg: v || '#ffffff' }); } },
                        { label: __('Input Border', 'blockenberg'), value: attr.inputBorder, onChange: function (v) { set({ inputBorder: v || '#d1d5db' }); } },
                        { label: __('Input Text', 'blockenberg'), value: attr.inputColor, onChange: function (v) { set({ inputColor: v || '#111827' }); } },
                        { label: __('Submit Button', 'blockenberg'), value: attr.submitBg, onChange: function (v) { set({ submitBg: v || '#6366f1' }); } },
                        { label: __('Submit Text', 'blockenberg'), value: attr.submitColor, onChange: function (v) { set({ submitColor: v || '#ffffff' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getCupTC() && el(getCupTC(), { label: __('Heading', 'blockenberg'), value: attr.typoHeading, onChange: function (v) { set({ typoHeading: v }); } }),
                    getCupTC() && el(getCupTC(), { label: __('Description', 'blockenberg'), value: attr.typoDesc, onChange: function (v) { set({ typoDesc: v }); } })
                )
            );

            return el('div', blockProps,
                controls,
                el('div', { className: 'bkbg-cup-preview', style: previewStyle },
                    leftCol,
                    rightCol
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-cup-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
