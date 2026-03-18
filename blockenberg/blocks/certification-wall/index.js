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
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    registerBlockType('blockenberg/certification-wall', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            function setCert(idx, key, val) {
                var certs = attr.certs.map(function (c, i) {
                    return i === idx ? Object.assign({}, c, { [key]: val }) : c;
                });
                setAttr({ certs: certs });
            }
            function addCert() {
                setAttr({ certs: attr.certs.concat([{ name: 'New Certificate', issuer: 'Issuer', year: '2024', imageUrl: '', verifyUrl: '#' }]) });
            }
            function removeCert(idx) {
                setAttr({ certs: attr.certs.filter(function (_, i) { return i !== idx; }) });
            }

            var isGrid = attr.layout === 'grid';
            var isLarge = attr.layout === 'large';

            return el(wp.element.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrow, onChange: function (v) { setAttr({ eyebrow: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Heading', 'blockenberg'), value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Subtext', 'blockenberg'), value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), value: attr.layout, options: [{ label: 'Grid', value: 'grid' }, { label: 'List', value: 'list' }, { label: 'Large Cards', value: 'large' }], onChange: function (v) { setAttr({ layout: v }); }, __nextHasNoMarginBottom: true }),
                        (isGrid || isLarge) && el(RangeControl, { label: __('Columns', 'blockenberg'), value: attr.columns, min: 2, max: 6, onChange: function (v) { setAttr({ columns: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Max Width', 'blockenberg'), value: attr.maxWidth, min: 600, max: 1600, step: 20, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Display Options', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Year', 'blockenberg'), checked: attr.showYear, onChange: function (v) { setAttr({ showYear: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Issuer', 'blockenberg'), checked: attr.showIssuer, onChange: function (v) { setAttr({ showIssuer: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Verify Link', 'blockenberg'), checked: attr.showVerify, onChange: function (v) { setAttr({ showVerify: v }); }, __nextHasNoMarginBottom: true }),
                        attr.showVerify && el(TextControl, { label: __('Verify Link Label', 'blockenberg'), value: attr.verifyLabel, onChange: function (v) { setAttr({ verifyLabel: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTypographyControl(), { label: __('Heading', 'blockenberg'), value: attr.typoHeading, onChange: function (v) { setAttr({ typoHeading: v }); } }),
                        el(getTypographyControl(), { label: __('Subtext', 'blockenberg'), value: attr.typoSubtext, onChange: function (v) { setAttr({ typoSubtext: v }); } }),
                        el(getTypographyControl(), { label: __('Certificate Name', 'blockenberg'), value: attr.typoCertName, onChange: function (v) { setAttr({ typoCertName: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#f8fafc' }); } },
                            { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); } },
                            { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { setAttr({ subColor: v || '#6b7280' }); } },
                            { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { setAttr({ eyebrowColor: v || '#6366f1' }); } },
                            { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#ffffff' }); } },
                            { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { setAttr({ cardBorder: v || '#e2e8f0' }); } },
                            { label: __('Cert Name', 'blockenberg'), value: attr.nameColor, onChange: function (v) { setAttr({ nameColor: v || '#111827' }); } },
                            { label: __('Issuer', 'blockenberg'), value: attr.issuerColor, onChange: function (v) { setAttr({ issuerColor: v || '#6b7280' }); } },
                            { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#6366f1' }); } },
                            { label: __('Verify Link', 'blockenberg'), value: attr.verifyColor, onChange: function (v) { setAttr({ verifyColor: v || '#6366f1' }); } }
                        ]
                    }),
                    /* Per-cert panels */
                    el(PanelBody, { title: __('Certificates', 'blockenberg'), initialOpen: false },
                        attr.certs.map(function (cert, idx) {
                            return el(PanelBody, { key: idx, title: (cert.name || 'Certificate ' + (idx + 1)), initialOpen: false },
                                el(TextControl, { label: __('Name', 'blockenberg'), value: cert.name, onChange: function (v) { setCert(idx, 'name', v); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Issuer', 'blockenberg'), value: cert.issuer, onChange: function (v) { setCert(idx, 'issuer', v); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Year', 'blockenberg'), value: cert.year, onChange: function (v) { setCert(idx, 'year', v); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Verify URL', 'blockenberg'), value: cert.verifyUrl, onChange: function (v) { setCert(idx, 'verifyUrl', v); }, __nextHasNoMarginBottom: true }),
                                el('p', { style: { marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#888' } }, __('Badge Image', 'blockenberg')),
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (media) { setCert(idx, 'imageUrl', media.url); },
                                        allowedTypes: ['image'], value: cert.imageUrl,
                                        render: function (rp) {
                                            return el('div', { style: { marginBottom: 8 } },
                                                cert.imageUrl && el('img', { src: cert.imageUrl, style: { maxHeight: 48, display: 'block', marginBottom: 6 } }),
                                                el(Button, { onClick: rp.open, variant: 'secondary', size: 'small' }, cert.imageUrl ? __('Change', 'blockenberg') : __('Upload Badge', 'blockenberg')),
                                                cert.imageUrl && el(Button, { onClick: function () { setCert(idx, 'imageUrl', ''); }, variant: 'link', isDestructive: true, size: 'small', style: { marginLeft: 8 } }, __('Remove', 'blockenberg'))
                                            );
                                        }
                                    })
                                ),
                                el(Button, { onClick: function () { removeCert(idx); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true }, __('Remove Certificate', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: addCert, variant: 'secondary', style: { marginTop: 8 } }, __('+ Add Certificate', 'blockenberg'))
                    )
                ),
                /* Editor preview */
                el('div', Object.assign(useBlockProps({ className: 'bkbg-crt-editor', style: Object.assign({ background: attr.bgColor }, _tv(attr.typoHeading, '--bkbg-crt-h-'), _tv(attr.typoSubtext, '--bkbg-crt-s-'), _tv(attr.typoCertName, '--bkbg-crt-cn-')) })),
                    el('div', { className: 'bkbg-crt-inner', style: { maxWidth: attr.maxWidth + 'px', margin: '0 auto', padding: attr.paddingTop + 'px 24px ' + attr.paddingBottom + 'px' } },
                        el('div', { className: 'bkbg-crt-header', style: { textAlign: 'center', marginBottom: 48 } },
                            el(RichText, { tagName: 'p', className: 'bkbg-crt-eyebrow', style: { color: attr.eyebrowColor }, value: attr.eyebrow, onChange: function (v) { setAttr({ eyebrow: v }); }, placeholder: __('Eyebrow text…', 'blockenberg') }),
                            el(RichText, { tagName: 'h2', className: 'bkbg-crt-heading', style: { color: attr.headingColor }, value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, placeholder: __('Heading…', 'blockenberg') }),
                            el(RichText, { tagName: 'p', className: 'bkbg-crt-sub', style: { color: attr.subColor }, value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, placeholder: __('Subtext…', 'blockenberg') })
                        ),
                        el('div', { className: 'bkbg-crt-grid layout-' + attr.layout, style: { gridTemplateColumns: 'repeat(' + attr.columns + ',1fr)' } },
                            attr.certs.map(function (cert, idx) {
                                return el('div', { key: idx, className: 'bkbg-crt-card', style: { background: attr.cardBg, borderColor: attr.cardBorder } },
                                    cert.imageUrl
                                        ? el('img', { src: cert.imageUrl, className: 'bkbg-crt-badge' })
                                        : el('div', { className: 'bkbg-crt-badge-placeholder', style: { background: attr.accentColor + '22', color: attr.accentColor } }, '🏆'),
                                    el('div', { className: 'bkbg-crt-card-body' },
                                        el('div', { className: 'bkbg-crt-name', style: { color: attr.nameColor } }, cert.name),
                                        attr.showIssuer && el('div', { className: 'bkbg-crt-issuer', style: { color: attr.issuerColor } }, cert.issuer),
                                        attr.showYear && el('div', { className: 'bkbg-crt-year', style: { color: attr.issuerColor } }, cert.year),
                                        attr.showVerify && cert.verifyUrl && el('a', { className: 'bkbg-crt-verify', style: { color: attr.verifyColor }, href: cert.verifyUrl, target: '_blank', rel: 'noopener' }, attr.verifyLabel)
                                    )
                                );
                            })
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-crt-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
