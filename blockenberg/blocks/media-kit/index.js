( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var Button = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ─── helpers ─── */
    function updateItem(arr, idx, field, val) {
        return arr.map(function (item, i) {
            if (i !== idx) return item;
            var p = {}; p[field] = val;
            return Object.assign({}, item, p);
        });
    }

    /* ─── MediaKitPreview ─── */
    function MediaKitPreview(props) {
        var a = props.attributes;

        var wrapStyle = {
            background: a.bgColor || '#f8fafc',
            padding: (a.paddingTop || 40) + 'px 0 ' + (a.paddingBottom || 40) + 'px',
            boxSizing: 'border-box'
        };

        var innerStyle = {
            maxWidth: (a.maxWidth || 900) + 'px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        };

        var sectionStyle = {
            background: a.sectionBg || '#fff',
            border: '1px solid ' + (a.borderColor || '#e5e7eb'),
            borderRadius: (a.sectionBorderRadius || 12) + 'px',
            padding: '28px 32px'
        };

        var sectionTitleStyle = {
            color: a.accentColor || '#6366f1',
            marginBottom: '20px'
        };

        /* ── header ── */
        var header = el('div', { style: Object.assign({}, sectionStyle, { textAlign: 'center', padding: '40px 32px' }) },
            el('div', { className: 'bkbg-mkit-brand-name', style: { color: a.headingColor || '#111827', marginBottom: '8px' } }, a.brandName || 'Brand Name'),
            a.brandTagline && el('div', { className: 'bkbg-mkit-brand-tagline', style: { color: a.textColor || '#374151', maxWidth: '480px', margin: '0 auto' } }, a.brandTagline)
        );

        /* ── logos ── */
        var logoSection = a.showLogos && el('div', { style: sectionStyle },
            el('div', { style: sectionTitleStyle }, __('Logo Variants', 'blockenberg')),
            el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' } },
                (a.logoVariants || []).map(function (lv, idx) {
                    return el('div', {
                        key: idx,
                        style: {
                            background: a.cardBg || '#f9fafb',
                            border: '1px solid ' + (a.borderColor || '#e5e7eb'),
                            borderRadius: '8px',
                            padding: '20px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px'
                        }
                    },
                        el('div', {
                            style: {
                                width: '100%',
                                height: '80px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: lv.format === 'Dark' ? '#1f2937' : '#fff',
                                borderRadius: '6px',
                                overflow: 'hidden'
                            }
                        },
                            lv.url
                                ? el('img', { src: lv.url, alt: lv.label, style: { maxWidth: '100%', maxHeight: '72px', objectFit: 'contain' } })
                                : el('div', { style: { color: '#d1d5db', fontSize: '12px' } }, '[ ' + (lv.format || 'Logo') + ' ]')
                        ),
                        el('div', { style: { fontWeight: '600', fontSize: '13px', color: a.headingColor || '#111827' } }, lv.label || '—'),
                        el('div', { style: { fontSize: '11px', color: a.labelColor || '#6b7280', fontWeight: '600' } }, lv.format || ''),
                        lv.downloadUrl && el('a', {
                            href: lv.downloadUrl,
                            style: {
                                fontSize: '11px',
                                color: a.accentColor || '#6366f1',
                                textDecoration: 'none',
                                fontWeight: '600'
                            }
                        }, '↓ Download')
                    );
                })
            )
        );

        /* ── colors ── */
        var colsPerRow = a.colorsPerRow || 5;
        var colorSection = a.showColors && el('div', { style: sectionStyle },
            el('div', { style: sectionTitleStyle }, __('Brand Colors', 'blockenberg')),
            el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + colsPerRow + ', 1fr)', gap: '12px' } },
                (a.brandColors || []).map(function (color, idx) {
                    return el('div', { key: idx, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' } },
                        el('div', {
                            style: {
                                width: '100%',
                                paddingBottom: '100%',
                                background: color.hex || '#ccc',
                                borderRadius: '8px',
                                border: '1px solid rgba(0,0,0,0.07)',
                                position: 'relative'
                            }
                        }),
                        el('div', { style: { textAlign: 'center' } },
                            el('div', { style: { fontSize: '12px', fontWeight: '600', color: a.headingColor || '#111827' } }, color.name || '—'),
                            el('div', { style: { fontSize: '11px', color: a.labelColor || '#6b7280', fontFamily: 'monospace' } }, color.hex || '')
                        )
                    );
                })
            )
        );

        /* ── fonts ── */
        var fontSection = a.showFonts && el('div', { style: sectionStyle },
            el('div', { style: sectionTitleStyle }, __('Typography', 'blockenberg')),
            el('div', { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
                (a.fonts || []).map(function (font, idx) {
                    return el('div', {
                        key: idx,
                        style: {
                            background: a.cardBg || '#f9fafb',
                            border: '1px solid ' + (a.borderColor || '#e5e7eb'),
                            borderRadius: '8px',
                            padding: '20px 24px'
                        }
                    },
                        el('div', { style: { display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' } },
                            el('div', { style: { fontWeight: '700', fontSize: '16px', color: a.headingColor || '#111827', fontFamily: font.name } }, font.name || 'Font'),
                            el('div', { style: { fontSize: '11px', fontWeight: '600', color: a.accentColor || '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em' } }, font.role || '')
                        ),
                        el('div', { style: { fontFamily: font.name || 'inherit', fontSize: '15px', color: a.textColor || '#374151', lineHeight: '1.6', fontStyle: 'italic' } },
                            font.previewText || 'The quick brown fox jumps over the lazy dog'
                        )
                    );
                })
            )
        );

        /* ── downloads ── */
        var downloadSection = a.showDownloads && el('div', { style: sectionStyle },
            el('div', { style: sectionTitleStyle }, __('Asset Downloads', 'blockenberg')),
            el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '12px' } },
                a.downloadAllUrl && el('a', {
                    href: a.downloadAllUrl,
                    style: {
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: a.downloadBg || '#6366f1',
                        color: a.downloadColor || '#fff',
                        padding: '11px 22px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        textDecoration: 'none',
                        transition: 'opacity 0.15s'
                    }
                }, '⬇ ' + (a.downloadAllLabel || 'Download All Assets (ZIP)')),
                a.guidelinesDownloadUrl && el('a', {
                    href: a.guidelinesDownloadUrl,
                    style: {
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'transparent',
                        color: a.accentColor || '#6366f1',
                        border: '2px solid ' + (a.accentColor || '#6366f1'),
                        padding: '9px 20px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        textDecoration: 'none'
                    }
                }, '📄 ' + (a.guidelinesLabel || 'Download Brand Guidelines'))
            )
        );

        /* ── contact ── */
        var contactSection = a.showContact && (a.pressEmail || a.websiteUrl) && el('div', { style: Object.assign({}, sectionStyle, { background: a.cardBg || '#f9fafb' }) },
            el('div', { style: sectionTitleStyle }, __('Media Contact', 'blockenberg')),
            el('div', { style: { display: 'flex', gap: '24px', flexWrap: 'wrap' } },
                a.pressEmail && el('div', null,
                    el('div', { style: { fontSize: '11px', color: a.labelColor || '#6b7280', fontWeight: '600', marginBottom: '4px' } }, __('Press Inquiries', 'blockenberg')),
                    el('a', { href: 'mailto:' + a.pressEmail, style: { color: a.accentColor || '#6366f1', fontSize: '14px', textDecoration: 'none', fontWeight: '500' } }, a.pressEmail)
                ),
                a.websiteUrl && el('div', null,
                    el('div', { style: { fontSize: '11px', color: a.labelColor || '#6b7280', fontWeight: '600', marginBottom: '4px' } }, __('Website', 'blockenberg')),
                    el('a', { href: a.websiteUrl, target: '_blank', rel: 'noopener', style: { color: a.accentColor || '#6366f1', fontSize: '14px', textDecoration: 'none', fontWeight: '500' } }, a.websiteUrl)
                )
            )
        );

        return el('div', { style: wrapStyle },
            el('div', { style: innerStyle },
                header,
                logoSection,
                colorSection,
                fontSection,
                downloadSection,
                contactSection
            )
        );
    }

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

    /* ─── register ─── */
    registerBlockType('blockenberg/media-kit', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var logIdxState = useState(-1);
            var logIdx = logIdxState[0];
            var setLogIdx = logIdxState[1];
            var colIdxState = useState(-1);
            var colIdx = colIdxState[0];
            var setColIdx = colIdxState[1];
            var fntIdxState = useState(-1);
            var fntIdx = fntIdxState[0];
            var setFntIdx = fntIdxState[1];

            var blockProps = useBlockProps((function () {
                var tv = getTypoCssVars();
                var s = {};
                Object.assign(s, tv(a.brandNameTypo, '--bkbg-mkit-bn-'));
                Object.assign(s, tv(a.taglineTypo, '--bkbg-mkit-tl-'));
                Object.assign(s, tv(a.sectionTitleTypo, '--bkbg-mkit-st-'));
                Object.assign(s, tv(a.bodyTypo, '--bkbg-mkit-bd-'));
                Object.assign(s, tv(a.labelTypo, '--bkbg-mkit-lb-'));
                Object.assign(s, tv(a.metaTypo, '--bkbg-mkit-mt-'));
                return { style: s };
            })());

            var inspector = el(InspectorControls, null,

                /* Brand */
                el(PanelBody, { title: __('Brand Info', 'blockenberg'), initialOpen: true },
                    el(TextControl, { label: __('Brand Name', 'blockenberg'), value: a.brandName, onChange: function (v) { set({ brandName: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Tagline', 'blockenberg'), value: a.brandTagline, onChange: function (v) { set({ brandTagline: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),

                /* Logos */
                el(PanelBody, { title: __('Logo Variants', 'blockenberg'), initialOpen: false },
                    (a.logoVariants || []).map(function (lv, idx) {
                        var isActive = idx === logIdx;
                        return el('div', {
                            key: idx,
                            style: { border: '1px solid ' + (isActive ? '#6366f1' : '#e5e7eb'), borderRadius: '6px', marginBottom: '6px', overflow: 'hidden' }
                        },
                            el('div', {
                                style: { padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: isActive ? '#f0f0ff' : '#f9fafb' },
                                onClick: function () { setLogIdx(isActive ? -1 : idx); }
                            },
                                el('span', { style: { flex: 1, fontSize: '12px', fontWeight: '600' } }, lv.label || 'Logo ' + (idx + 1)),
                                el(Button, { icon: 'no-alt', isSmall: true, isDestructive: true, onClick: function (e) { e.stopPropagation(); var arr = (a.logoVariants || []).slice(); arr.splice(idx, 1); set({ logoVariants: arr }); setLogIdx(-1); } })
                            ),
                            isActive && el('div', { style: { padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' } },
                                el(TextControl, { label: __('Label', 'blockenberg'), value: lv.label || '', onChange: function (v) { set({ logoVariants: updateItem(a.logoVariants, idx, 'label', v) }); }, __nextHasNoMarginBottom: true }),
                                el(SelectControl, {
                                    label: __('Format', 'blockenberg'),
                                    value: lv.format || 'Full',
                                    options: ['Full', 'Dark', 'Light', 'Icon', 'SVG', 'PNG'].map(function (f) { return { value: f, label: f }; }),
                                    onChange: function (v) { set({ logoVariants: updateItem(a.logoVariants, idx, 'format', v) }); },
                                    __nextHasNoMarginBottom: true
                                }),
                                el(TextControl, { label: __('Download URL', 'blockenberg'), value: lv.downloadUrl || '', onChange: function (v) { set({ logoVariants: updateItem(a.logoVariants, idx, 'downloadUrl', v) }); }, __nextHasNoMarginBottom: true }),
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (media) { set({ logoVariants: updateItem(a.logoVariants, idx, 'url', media.url || '') }); },
                                        allowedTypes: ['image'],
                                        render: function (ref) {
                                            return el(Button, { onClick: ref.open, variant: 'secondary', isSmall: true }, lv.url ? __('Replace Image', 'blockenberg') : __('Upload Image', 'blockenberg'));
                                        }
                                    })
                                )
                            )
                        );
                    }),
                    el(Button, {
                        variant: 'secondary',
                        style: { marginTop: '6px', width: '100%', justifyContent: 'center' },
                        onClick: function () { set({ logoVariants: (a.logoVariants || []).concat([{ label: 'New Logo', url: '', id: 0, format: 'Full', downloadUrl: '' }]) }); }
                    }, __('+ Add Logo Variant', 'blockenberg'))
                ),

                /* Colors */
                el(PanelBody, { title: __('Brand Colors', 'blockenberg'), initialOpen: false },
                    (a.brandColors || []).map(function (col, idx) {
                        var isActive = idx === colIdx;
                        return el('div', {
                            key: idx,
                            style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', padding: '6px 8px', border: '1px solid ' + (isActive ? '#6366f1' : '#e5e7eb'), borderRadius: '6px', cursor: 'pointer', background: isActive ? '#f0f0ff' : '#f9fafb' },
                            onClick: function () { setColIdx(isActive ? -1 : idx); }
                        },
                            el('div', { style: { width: '24px', height: '24px', borderRadius: '6px', background: col.hex || '#ccc', flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)' } }),
                            el('div', { style: { flex: 1, fontSize: '12px', fontWeight: '600' } }, col.name || '—'),
                            el('div', { style: { fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' } }, col.hex || ''),
                            el(Button, { icon: 'no-alt', isSmall: true, isDestructive: true, onClick: function (e) { e.stopPropagation(); var arr = (a.brandColors || []).slice(); arr.splice(idx, 1); set({ brandColors: arr }); setColIdx(-1); } }),
                            isActive && el('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', padding: '8px 0', borderTop: '1px solid #e5e7eb', width: '100%' } },
                                el(TextControl, { label: __('Color Name', 'blockenberg'), value: col.name || '', onChange: function (v) { set({ brandColors: updateItem(a.brandColors, idx, 'name', v) }); }, __nextHasNoMarginBottom: true }),
                                el(BkbgColorSwatch, { label: __('Hex Value', 'blockenberg'), value: col.hex || '', onChange: function (v) { set({ brandColors: updateItem(a.brandColors, idx, 'hex', v) }); } })
                            )
                        );
                    }),
                    el(Button, {
                        variant: 'secondary',
                        style: { marginTop: '6px', width: '100%', justifyContent: 'center' },
                        onClick: function () { set({ brandColors: (a.brandColors || []).concat([{ name: 'New Color', hex: '#6366f1' }]) }); }
                    }, __('+ Add Color', 'blockenberg'))
                ),

                /* Text Sizes */
            el(PanelBody, { title: __('Text Sizes', 'blockenberg'), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: 'Brand Name', value: a.brandNameTypo || {}, onChange: function (v) { set({ brandNameTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: 'Tagline', value: a.taglineTypo || {}, onChange: function (v) { set({ taglineTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: 'Section Title', value: a.sectionTitleTypo || {}, onChange: function (v) { set({ sectionTitleTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: 'Body Text', value: a.bodyTypo || {}, onChange: function (v) { set({ bodyTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: 'Label', value: a.labelTypo || {}, onChange: function (v) { set({ labelTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: 'Meta', value: a.metaTypo || {}, onChange: function (v) { set({ metaTypo: v }); } })
                ),

                /* Fonts */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (a.fonts || []).map(function (font, idx) {
                        var isActive = idx === fntIdx;
                        return el('div', {
                            key: idx,
                            style: { border: '1px solid ' + (isActive ? '#6366f1' : '#e5e7eb'), borderRadius: '6px', marginBottom: '6px', overflow: 'hidden' }
                        },
                            el('div', {
                                style: { padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: isActive ? '#f0f0ff' : '#f9fafb' },
                                onClick: function () { setFntIdx(isActive ? -1 : idx); }
                            },
                                el('span', { style: { flex: 1, fontSize: '12px', fontWeight: '600' } }, font.name || 'Font'),
                                el('span', { style: { fontSize: '11px', color: '#9ca3af' } }, font.role || ''),
                                el(Button, { icon: 'no-alt', isSmall: true, isDestructive: true, onClick: function (e) { e.stopPropagation(); var arr = (a.fonts || []).slice(); arr.splice(idx, 1); set({ fonts: arr }); setFntIdx(-1); } })
                            ),
                            isActive && el('div', { style: { padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' } },
                                el(TextControl, { label: __('Font Name', 'blockenberg'), value: font.name || '', onChange: function (v) { set({ fonts: updateItem(a.fonts, idx, 'name', v) }); }, __nextHasNoMarginBottom: true }),
                                el(SelectControl, {
                                    label: __('Role', 'blockenberg'),
                                    value: font.role || 'Heading',
                                    options: ['Heading', 'Body', 'Mono', 'Display', 'Caption'].map(function (r) { return { value: r, label: r }; }),
                                    onChange: function (v) { set({ fonts: updateItem(a.fonts, idx, 'role', v) }); },
                                    __nextHasNoMarginBottom: true
                                }),
                                el(TextControl, { label: __('Preview Text', 'blockenberg'), value: font.previewText || '', onChange: function (v) { set({ fonts: updateItem(a.fonts, idx, 'previewText', v) }); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Google Font URL (optional)', 'blockenberg'), value: font.googleFontUrl || '', onChange: function (v) { set({ fonts: updateItem(a.fonts, idx, 'googleFontUrl', v) }); }, __nextHasNoMarginBottom: true })
                            )
                        );
                    }),
                    el(Button, {
                        variant: 'secondary',
                        style: { marginTop: '6px', width: '100%', justifyContent: 'center' },
                        onClick: function () { set({ fonts: (a.fonts || []).concat([{ name: 'New Font', role: 'Body', previewText: 'The quick brown fox', googleFontUrl: '' }]) }); }
                    }, __('+ Add Font', 'blockenberg'))
                ),

                /* Downloads */
                el(PanelBody, { title: __('Downloads & Contact', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Download All Label', 'blockenberg'), value: a.downloadAllLabel, onChange: function (v) { set({ downloadAllLabel: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Download All URL', 'blockenberg'), value: a.downloadAllUrl, onChange: function (v) { set({ downloadAllUrl: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Guidelines Label', 'blockenberg'), value: a.guidelinesLabel, onChange: function (v) { set({ guidelinesLabel: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Guidelines Download URL', 'blockenberg'), value: a.guidelinesDownloadUrl, onChange: function (v) { set({ guidelinesDownloadUrl: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Press Email', 'blockenberg'), value: a.pressEmail, onChange: function (v) { set({ pressEmail: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Website URL', 'blockenberg'), value: a.websiteUrl, onChange: function (v) { set({ websiteUrl: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),

                /* Sections visibility */
                el(PanelBody, { title: __('Sections', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Logos', 'blockenberg'), checked: a.showLogos, onChange: function (v) { set({ showLogos: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Colors', 'blockenberg'), checked: a.showColors, onChange: function (v) { set({ showColors: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Typography', 'blockenberg'), checked: a.showFonts, onChange: function (v) { set({ showFonts: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Downloads', 'blockenberg'), checked: a.showDownloads, onChange: function (v) { set({ showDownloads: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Contact', 'blockenberg'), checked: a.showContact, onChange: function (v) { set({ showContact: v }); }, __nextHasNoMarginBottom: true })
                ),

                /* Appearance */
                el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Colors Per Row', 'blockenberg'), value: a.colorsPerRow, min: 2, max: 10, onChange: function (v) { set({ colorsPerRow: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 480, max: 1400, step: 20, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Section Border Radius', 'blockenberg'), value: a.sectionBorderRadius, min: 0, max: 32, onChange: function (v) { set({ sectionBorderRadius: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, min: 0, max: 160, step: 8, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 160, step: 8, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),

                /* Colors */
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.bgColor, onChange: function (v) { set({ bgColor: v }); }, label: __('Page Background', 'blockenberg') },
                        { value: a.sectionBg, onChange: function (v) { set({ sectionBg: v }); }, label: __('Section Background', 'blockenberg') },
                        { value: a.cardBg, onChange: function (v) { set({ cardBg: v }); }, label: __('Card Background', 'blockenberg') },
                        { value: a.headingColor, onChange: function (v) { set({ headingColor: v }); }, label: __('Heading Text', 'blockenberg') },
                        { value: a.textColor, onChange: function (v) { set({ textColor: v }); }, label: __('Body Text', 'blockenberg') },
                        { value: a.labelColor, onChange: function (v) { set({ labelColor: v }); }, label: __('Label Text', 'blockenberg') },
                        { value: a.borderColor, onChange: function (v) { set({ borderColor: v }); }, label: __('Border', 'blockenberg') },
                        { value: a.accentColor, onChange: function (v) { set({ accentColor: v }); }, label: __('Accent', 'blockenberg') },
                        { value: a.downloadBg, onChange: function (v) { set({ downloadBg: v }); }, label: __('Download Button Background', 'blockenberg') },
                        { value: a.downloadColor, onChange: function (v) { set({ downloadColor: v }); }, label: __('Download Button Text', 'blockenberg') }
                    ]
                })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el(MediaKitPreview, { attributes: a })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save((function () {
                var tv = getTypoCssVars();
                var s = {};
                Object.assign(s, tv(a.brandNameTypo, '--bkbg-mkit-bn-'));
                Object.assign(s, tv(a.taglineTypo, '--bkbg-mkit-tl-'));
                Object.assign(s, tv(a.sectionTitleTypo, '--bkbg-mkit-st-'));
                Object.assign(s, tv(a.bodyTypo, '--bkbg-mkit-bd-'));
                Object.assign(s, tv(a.labelTypo, '--bkbg-mkit-lb-'));
                Object.assign(s, tv(a.metaTypo, '--bkbg-mkit-mt-'));
                return { style: s };
            })()),
                el('div', { className: 'bkbg-mkit-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
