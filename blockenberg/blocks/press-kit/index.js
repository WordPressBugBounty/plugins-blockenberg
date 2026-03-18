( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* Asset type icons */
    var typeIcons = { logo: '🎨', document: '📄', photo: '📷', other: '📦' };

    function BkbgColorSwatch(props) {
        var st = useState(false); var isOpen = st[0]; var setIsOpen = st[1];
        return el(Fragment, null,
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' } },
                el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' } }, props.label),
                el('button', { type: 'button', style: { width: 28, height: 28, borderRadius: 4, border: '1px solid #ccc', background: props.value || '#fff', cursor: 'pointer', padding: 0 }, onClick: function () { setIsOpen(!isOpen); } })
            ),
            isOpen && el(Popover, { onClose: function () { setIsOpen(false); } }, el('div', { style: { padding: '8px' } }, el(ColorPicker, { color: props.value, enableAlpha: true, onChange: props.onChange })))
        );
    }

    registerBlockType('blockenberg/press-kit', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            function updateAsset(idx, key, val) {
                var assets = (attr.assets || []).map(function (a, i) {
                    return i === idx ? Object.assign({}, a, {[key]: val}) : a;
                });
                setAttr({ assets: assets });
            }

            function updateColor(idx, key, val) {
                var brandColors = (attr.brandColors || []).map(function (c, i) {
                    return i === idx ? Object.assign({}, c, {[key]: val}) : c;
                });
                setAttr({ brandColors: brandColors });
            }

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Max Width (px)', 'blockenberg'), value: attr.maxWidth, min: 600, max: 1400, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                ),
                el(PanelBody, { title: __('Company Info', 'blockenberg'), initialOpen: false },
                    el(TextControl, { __nextHasNoMarginBottom: true, label: __('Company Name', 'blockenberg'), value: attr.companyName, onChange: function (v) { setAttr({ companyName: v }); } }),
                    el(TextareaControl, { __nextHasNoMarginBottom: true, label: __('Company Blurb', 'blockenberg'), value: attr.companyBlurb, onChange: function (v) { setAttr({ companyBlurb: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Press Contact', 'blockenberg'), checked: attr.showPressContact, onChange: function (v) { setAttr({ showPressContact: v }); } }),
                    attr.showPressContact && el(TextControl, { __nextHasNoMarginBottom: true, label: __('Press Email', 'blockenberg'), value: attr.pressEmail, onChange: function (v) { setAttr({ pressEmail: v }); } })
                ),
                el(PanelBody, { title: __('Download All', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Download All Button', 'blockenberg'), checked: attr.showDownloadAll, onChange: function (v) { setAttr({ showDownloadAll: v }); } }),
                    attr.showDownloadAll && el(TextControl, { __nextHasNoMarginBottom: true, label: __('Button Label', 'blockenberg'), value: attr.downloadAllLabel, onChange: function (v) { setAttr({ downloadAllLabel: v }); } }),
                    attr.showDownloadAll && el(TextControl, { __nextHasNoMarginBottom: true, label: __('Button URL', 'blockenberg'), value: attr.downloadAllUrl, onChange: function (v) { setAttr({ downloadAllUrl: v }); } })
                ),
                el(PanelBody, { title: __('Brand Colors', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Brand Colors Section', 'blockenberg'), checked: attr.showBrandColors, onChange: function (v) { setAttr({ showBrandColors: v }); } }),
                    (attr.brandColors || []).map(function (c, idx) {
                        return el('div', { key: idx, style: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' } },
                            el('div', { style: { width: '28px', height: '28px', borderRadius: '4px', background: c.hex, border: '1px solid #eee', flexShrink: 0 } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Name', 'blockenberg'), value: c.name, onChange: function (v) { updateColor(idx, 'name', v); } }),
                            el(BkbgColorSwatch, { label: __('Hex', 'blockenberg'), value: c.hex, onChange: function (v) { updateColor(idx, 'hex', v); } }),
                            el(Button, { isDestructive: true, isSmall: true, onClick: function () { setAttr({ brandColors: (attr.brandColors || []).filter(function (_, i) { return i !== idx; }) }); } }, '✕')
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: function () { setAttr({ brandColors: (attr.brandColors || []).concat([{ name: 'Color', hex: '#000000' }]) }); } }, __('+ Add Color', 'blockenberg'))
                ),
                el(PanelBody, { title: __('Assets', 'blockenberg'), initialOpen: false },
                    (attr.assets || []).map(function (asset, idx) {
                        return el(PanelBody, { key: idx, title: (asset.label || 'Asset ' + (idx + 1)), initialOpen: false },
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Label', 'blockenberg'), value: asset.label, onChange: function (v) { updateAsset(idx, 'label', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Description', 'blockenberg'), value: asset.description, onChange: function (v) { updateAsset(idx, 'description', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('File URL', 'blockenberg'), value: asset.fileUrl, onChange: function (v) { updateAsset(idx, 'fileUrl', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Preview Image URL (optional)', 'blockenberg'), value: asset.previewUrl, onChange: function (v) { updateAsset(idx, 'previewUrl', v); } }),
                            el(SelectControl, { __nextHasNoMarginBottom: true, label: __('Type', 'blockenberg'), value: asset.type, options: [{ label: 'Logo', value: 'logo' }, { label: 'Document', value: 'document' }, { label: 'Photo', value: 'photo' }, { label: 'Other', value: 'other' }], onChange: function (v) { updateAsset(idx, 'type', v); } }),
                            el(Button, { isDestructive: true, variant: 'secondary', onClick: function () { setAttr({ assets: (attr.assets || []).filter(function (_, i) { return i !== idx; }) }); } }, __('Remove Asset', 'blockenberg'))
                        );
                    }),
                    el(Button, { isPrimary: true, variant: 'primary', onClick: function () { setAttr({ assets: (attr.assets || []).concat([{ label: 'New Asset', description: '', fileUrl: '#', previewUrl: '', type: 'other' }]) }); } }, __('+ Add Asset', 'blockenberg'))
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function () {
                        var TC = getTypoControl();
                        if (!TC) return el('p', null, 'Loading…');
                        return el(Fragment, null,
                            el(TC, { label: __('Heading', 'blockenberg'), value: attr.headingTypo, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                            el(TC, { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowTypo, onChange: function (v) { setAttr({ eyebrowTypo: v }); } }),
                            el(TC, { label: __('Subtext', 'blockenberg'), value: attr.subtextTypo, onChange: function (v) { setAttr({ subtextTypo: v }); } }),
                            el(TC, { label: __('Body Text', 'blockenberg'), value: attr.bodyTypo, onChange: function (v) { setAttr({ bodyTypo: v }); } }),
                            el(TC, { label: __('Asset Label', 'blockenberg'), value: attr.assetLabelTypo, onChange: function (v) { setAttr({ assetLabelTypo: v }); } }),
                            el(TC, { label: __('Asset Description', 'blockenberg'), value: attr.assetDescTypo, onChange: function (v) { setAttr({ assetDescTypo: v }); } })
                        );
                    })()
                ),
                                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); } },
                        { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { setAttr({ subColor: v || '#6b7280' }); } },
                        { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { setAttr({ eyebrowColor: v || '#6366f1' }); } },
                        { label: __('Card BG', 'blockenberg'), value: attr.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#f8fafc' }); } },
                        { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { setAttr({ cardBorder: v || '#e2e8f0' }); } },
                        { label: __('Download Button BG', 'blockenberg'), value: attr.downloadBg, onChange: function (v) { setAttr({ downloadBg: v || '#6366f1' }); } },
                        { label: __('Download Button Text', 'blockenberg'), value: attr.downloadColor, onChange: function (v) { setAttr({ downloadColor: v || '#ffffff' }); } },
                        { label: __('Company Blurb Text', 'blockenberg'), value: attr.blurbColor, onChange: function (v) { setAttr({ blurbColor: v || '#374151' }); } }
                    ]
                })
            );

            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(attr.headingTypo, '--bkbg-prk-h-'));
                    Object.assign(s, _tvFn(attr.subtextTypo, '--bkbg-prk-st-'));
                    Object.assign(s, _tvFn(attr.eyebrowTypo, '--bkbg-prk-ey-'));
                    Object.assign(s, _tvFn(attr.bodyTypo, '--bkbg-prk-bd-'));
                    Object.assign(s, _tvFn(attr.assetLabelTypo, '--bkbg-prk-al-'));
                    Object.assign(s, _tvFn(attr.assetDescTypo, '--bkbg-prk-ad-'));
                }
                return { className: 'bkbg-prk-editor', style: s };
            })());

            return el('div', blockProps,
                inspector,
                el('div', { style: { background: attr.bgColor, padding: '40px', borderRadius: '8px', fontFamily: 'sans-serif' } },
                    /* Header */
                    el('div', { className: 'bkbg-prk-header', style: { textAlign: 'center', marginBottom: '48px' } },
                        el(RichText, { tagName: 'p', className: 'bkbg-prk-eyebrow', value: attr.eyebrow, onChange: function (v) { setAttr({ eyebrow: v }); }, placeholder: __('Eyebrow…', 'blockenberg'), style: { color: attr.eyebrowColor, margin: '0 0 8px' } }),
                        el(RichText, { tagName: 'h2', className: 'bkbg-prk-heading', value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, placeholder: __('Heading…', 'blockenberg'), style: { color: attr.headingColor, margin: '0 0 12px' } }),
                        el(RichText, { tagName: 'p', className: 'bkbg-prk-sub', value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, placeholder: __('Subtext…', 'blockenberg'), style: { color: attr.subColor, maxWidth: '600px', margin: '0 auto' } })
                    ),
                    /* Company blurb */
                    el('div', { style: { background: attr.cardBg, border: '1px solid ' + attr.cardBorder, borderRadius: '12px', padding: '24px', marginBottom: '32px' } },
                        el('div', { style: { fontWeight: 700, color: attr.headingColor, fontSize: '16px', marginBottom: '8px' } }, 'About ' + attr.companyName),
                        el(RichText, { tagName: 'p', className: 'bkbg-prk-blurb-text', value: attr.companyBlurb, onChange: function (v) { setAttr({ companyBlurb: v }); }, placeholder: __('Company blurb…', 'blockenberg'), style: { color: attr.blurbColor, margin: 0 } })
                    ),
                    /* Assets grid */
                    el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px', marginBottom: '32px' } },
                        (attr.assets || []).map(function (asset, i) {
                            return el('div', { key: i, style: { background: attr.cardBg, border: '1px solid ' + attr.cardBorder, borderRadius: '10px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' } },
                                el('div', { style: { fontSize: '36px', flexShrink: 0 } }, typeIcons[asset.type] || '📦'),
                                el('div', { style: { flex: 1 } },
                                    el('div', { className: 'bkbg-prk-asset-label', style: { color: attr.assetLabelColor } }, asset.label),
                                    el('div', { className: 'bkbg-prk-asset-desc', style: { color: attr.assetDescColor, marginTop: '2px' } }, asset.description)
                                ),
                                el('a', { href: asset.fileUrl, style: { background: attr.downloadBg, color: attr.downloadColor, borderRadius: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' } }, '⬇ Download')
                            );
                        })
                    ),
                    /* Brand colors */
                    attr.showBrandColors && (attr.brandColors || []).length > 0 && el('div', { style: { marginBottom: '32px' } },
                        el('div', { style: { fontWeight: 700, color: attr.headingColor, fontSize: '16px', marginBottom: '12px' } }, 'Brand Colors'),
                        el('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
                            (attr.brandColors || []).map(function (c, i) {
                                return el('div', { key: i, style: { textAlign: 'center' } },
                                    el('div', { style: { width: '64px', height: '64px', borderRadius: '10px', background: c.hex, border: '1px solid rgba(0,0,0,0.1)', marginBottom: '4px' } }),
                                    el('div', { style: { fontSize: '12px', color: attr.headingColor, fontWeight: 600 } }, c.name),
                                    el('div', { style: { fontSize: '11px', color: attr.subColor, fontFamily: 'monospace' } }, c.hex)
                                );
                            })
                        )
                    ),
                    /* Download all + contact */
                    el('div', { style: { textAlign: 'center', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' } },
                        attr.showDownloadAll && el('a', { href: attr.downloadAllUrl, style: { background: attr.downloadBg, color: attr.downloadColor, borderRadius: '8px', padding: '12px 28px', fontWeight: 700, textDecoration: 'none', fontSize: '15px' } }, '📦 ' + attr.downloadAllLabel),
                        attr.showPressContact && el('a', { href: 'mailto:' + attr.pressEmail, style: { color: attr.accentColor, borderRadius: '8px', padding: '12px 28px', fontWeight: 600, textDecoration: 'none', fontSize: '15px', border: '2px solid ' + attr.accentColor } }, '✉️ ' + attr.pressEmail)
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-prk-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
