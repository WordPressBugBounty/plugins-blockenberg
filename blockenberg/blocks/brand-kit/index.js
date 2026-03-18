( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    function _tv(typo, prefix) {
        if (!typo) return {};
        var s = {};
        if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
        if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
        if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
        if (typo.style)      s[prefix + 'font-style'] = typo.style;
        if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
        return s;
    }

    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var IP = function () { return window.bkbgIconPicker; };

    function lightenHex(hex) {
        // Returns a semi-transparent light version for text on dark swatches
        return hex;
    }

    function isBright(hex) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return (r * 299 + g * 587 + b * 114) / 1000 > 180;
    }

    function hexToRgb(hex) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return r + ', ' + g + ', ' + b;
    }

    function updateItem(arr, idx, field, val) {
        return arr.map(function (item, i) {
            if (i !== idx) return item;
            var p = {}; p[field] = val;
            return Object.assign({}, item, p);
        });
    }

    function SectionLabel(title, a) {
        return el('div', { style: { marginBottom: 20 } },
            el('span', {
                style: {
                    display: 'inline-block',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: a.sectionLabelBg,
                    color: a.sectionLabelColor,
                }
            }, title)
        );
    }

    registerBlockType('blockenberg/brand-kit', {
        title: __('Brand Kit', 'blockenberg'),
        icon: 'art',
        category: 'bkbg-business',
        description: __('Complete brand style guide: colour swatches, typography, logos, and brand values.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({
                style: Object.assign({ background: a.containerBg || '', padding: a.containerPadding + 'px 0' }, _tv(a.typoTitle, '--bkbg-bdk-title-'), _tv(a.typoBody, '--bkbg-bdk-body-'))
            });

            // ── Inspector panels ──────────────────────────────────────────

            // Colors panel (colour swatches configuration)
            function addColor() {
                set({ colors: a.colors.concat([{ name: 'New Color', value: '#000000', isLight: false }]) });
            }
            function removeColor(i) {
                if (a.colors.length <= 1) return;
                set({ colors: a.colors.filter(function (_, idx) { return idx !== i; }) });
            }

            // Fonts
            function addFont() {
                set({ fonts: a.fonts.concat([{
                    name: 'New Font', familyName: 'Georgia', cssFamily: 'Georgia, serif',
                    headingText: 'The quick brown fox', bodyText: 'Sample body text goes here.',
                    weights: '400, 700', sourceUrl: ''
                }]) });
            }
            function removeFont(i) {
                if (a.fonts.length <= 1) return;
                set({ fonts: a.fonts.filter(function (_, idx) { return idx !== i; }) });
            }

            // Logos
            function addLogo() {
                set({ logos: a.logos.concat([{ label: 'Logo Variant', imageUrl: '', imageId: 0, imageAlt: 'Logo', bgStyle: 'light', description: '' }]) });
            }
            function removeLogo(i) {
                if (a.logos.length <= 1) return;
                set({ logos: a.logos.filter(function (_, idx) { return idx !== i; }) });
            }

            // Values
            function addValue() {
                set({ values: a.values.concat([{ icon: '⭐', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', title: 'New Value', description: 'Describe this brand value here.' }]) });
            }
            function removeValue(i) {
                if (a.values.length <= 1) return;
                set({ values: a.values.filter(function (_, idx) { return idx !== i; }) });
            }

            // ── Editor preview ────────────────────────────────────────────
            var cardStyle = {
                background: a.cardBg,
                border: '1px solid ' + a.cardBorder,
                borderRadius: a.cardRadius + 'px',
                padding: a.cardPadding + 'px',
                marginBottom: a.sectionGap + 'px',
            };

            return el(Fragment, null,
                el(InspectorControls, null,
                    // Sections toggle
                    el(PanelBody, { title: 'Sections', initialOpen: true },
                        el(TextControl, { label: 'Main title', value: a.sectionTitle, onChange: function (v) { set({ sectionTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show main title', checked: a.showTitle, onChange: function (v) { set({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show Colour Palette', checked: a.showColors, onChange: function (v) { set({ showColors: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show Typography', checked: a.showTypography, onChange: function (v) { set({ showTypography: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show Logo Usage', checked: a.showLogos, onChange: function (v) { set({ showLogos: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show Brand Values', checked: a.showValues, onChange: function (v) { set({ showValues: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Colour Swatches
                    el(PanelBody, { title: 'Colour Palette', initialOpen: false },
                        el(TextControl, { label: 'Section label', value: a.colorsTitle, onChange: function (v) { set({ colorsTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Swatch height (px)', value: a.swatchHeight, min: 48, max: 160, onChange: function (v) { set({ swatchHeight: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(RangeControl, { label: 'Swatch radius (px)', value: a.swatchRadius, min: 0, max: 24, onChange: function (v) { set({ swatchRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show colour name', checked: a.showColorName, onChange: function (v) { set({ showColorName: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show hex value', checked: a.showColorHex, onChange: function (v) { set({ showColorHex: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show copy hint', checked: a.showCopyHint, onChange: function (v) { set({ showCopyHint: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 12 } }),
                        el('div', { style: { fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 8 } }, 'Colours (' + a.colors.length + ')'),
                        a.colors.map(function (clr, i) {
                            return el('div', { key: i, style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 } },
                                el('div', { style: { width: 24, height: 24, borderRadius: 4, background: clr.value, border: '1px solid #e5e7eb', flexShrink: 0 } }),
                                el(TextControl, { value: clr.name, onChange: function (v) { set({ colors: updateItem(a.colors, i, 'name', v) }); }, __nextHasNoMarginBottom: true, style: { flex: 1 } }),
                                el(TextControl, { value: clr.value, onChange: function (v) { set({ colors: updateItem(a.colors, i, 'value', v) }); }, __nextHasNoMarginBottom: true, style: { flex: 1 } }),
                                el(Button, { isDestructive: true, variant: 'tertiary', size: 'small', onClick: function () { removeColor(i); }, __nextHasNoMarginBottom: true }, '✕')
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: addColor, style: { width: '100%', justifyContent: 'center', marginTop: 4 }, __nextHasNoMarginBottom: true }, '+ Add Colour')
                    ),

                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        el(TextControl, { label: 'Section label', value: a.typographyTitle, onChange: function (v) { set({ typographyTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 12 } }),
                        a.fonts.map(function (font, i) {
                            return el('div', { key: i, style: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8 } },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 } },
                                    el('strong', { style: { fontSize: 12 } }, font.name),
                                    el(Button, { isDestructive: true, variant: 'tertiary', size: 'small', onClick: function () { removeFont(i); }, __nextHasNoMarginBottom: true }, '✕')
                                ),
                                el(TextControl, { label: 'Label', value: font.name, onChange: function (v) { set({ fonts: updateItem(a.fonts, i, 'name', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Family name', value: font.familyName, onChange: function (v) { set({ fonts: updateItem(a.fonts, i, 'familyName', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'CSS font-family', value: font.cssFamily, placeholder: "'Inter', sans-serif", onChange: function (v) { set({ fonts: updateItem(a.fonts, i, 'cssFamily', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Weights', value: font.weights, placeholder: '400, 600, 700', onChange: function (v) { set({ fonts: updateItem(a.fonts, i, 'weights', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Heading preview text', value: font.headingText, onChange: function (v) { set({ fonts: updateItem(a.fonts, i, 'headingText', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Body preview text', value: font.bodyText, onChange: function (v) { set({ fonts: updateItem(a.fonts, i, 'bodyText', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Source URL (optional)', value: font.sourceUrl, placeholder: 'https://fonts.google.com/...', onChange: function (v) { set({ fonts: updateItem(a.fonts, i, 'sourceUrl', v) }); }, __nextHasNoMarginBottom: true })
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: addFont, style: { width: '100%', justifyContent: 'center', marginTop: 4 }, __nextHasNoMarginBottom: true }, '+ Add Font')
                    ),

                    // Logos
                    el(PanelBody, { title: 'Logo Usage', initialOpen: false },
                        el(TextControl, { label: 'Section label', value: a.logosTitle, onChange: function (v) { set({ logosTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 12 } }),
                        a.logos.map(function (logo, i) {
                            return el('div', { key: i, style: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8 } },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 } },
                                    el('strong', { style: { fontSize: 12 } }, logo.label || 'Logo ' + (i + 1)),
                                    el(Button, { isDestructive: true, variant: 'tertiary', size: 'small', onClick: function () { removeLogo(i); }, __nextHasNoMarginBottom: true }, '✕')
                                ),
                                el(TextControl, { label: 'Label', value: logo.label, onChange: function (v) { set({ logos: updateItem(a.logos, i, 'label', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Description', value: logo.description, onChange: function (v) { set({ logos: updateItem(a.logos, i, 'description', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 8 } }),
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (media) {
                                            var updated = updateItem(a.logos, i, 'imageUrl', media.url);
                                            updated = updateItem(updated, i, 'imageId', media.id);
                                            updated = updateItem(updated, i, 'imageAlt', media.alt || '');
                                            set({ logos: updated });
                                        },
                                        allowedTypes: ['image'],
                                        value: logo.imageId,
                                        render: function (ref) {
                                            return el(Button, {
                                                onClick: ref.open,
                                                variant: logo.imageUrl ? 'secondary' : 'primary',
                                                size: 'small',
                                                __nextHasNoMarginBottom: true,
                                            }, logo.imageUrl ? 'Change Logo' : 'Upload Logo');
                                        }
                                    })
                                )
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: addLogo, style: { width: '100%', justifyContent: 'center', marginTop: 4 }, __nextHasNoMarginBottom: true }, '+ Add Logo Variant')
                    ),

                    // Brand Values
                    el(PanelBody, { title: 'Brand Values', initialOpen: false },
                        el(TextControl, { label: 'Section label', value: a.valuesTitle, onChange: function (v) { set({ valuesTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 12 } }),
                        a.values.map(function (val, i) {
                            return el('div', { key: i, style: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8 } },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 } },
                                    el('strong', { style: { fontSize: 12 } }, val.icon + ' ' + val.title),
                                    el(Button, { isDestructive: true, variant: 'tertiary', size: 'small', onClick: function () { removeValue(i); }, __nextHasNoMarginBottom: true }, '✕')
                                ),
                                el(IP().IconPickerControl, {
                                    iconType: val.iconType, customChar: val.icon, dashicon: val.iconDashicon, imageUrl: val.iconImageUrl,
                                    onChangeType: function (v) { set({ values: updateItem(a.values, i, 'iconType', v) }); },
                                    onChangeChar: function (v) { set({ values: updateItem(a.values, i, 'icon', v) }); },
                                    onChangeDashicon: function (v) { set({ values: updateItem(a.values, i, 'iconDashicon', v) }); },
                                    onChangeImageUrl: function (v) { set({ values: updateItem(a.values, i, 'iconImageUrl', v) }); }
                                }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Title', value: val.title, onChange: function (v) { set({ values: updateItem(a.values, i, 'title', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Description', value: val.description, onChange: function (v) { set({ values: updateItem(a.values, i, 'description', v) }); }, __nextHasNoMarginBottom: true })
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: addValue, style: { width: '100%', justifyContent: 'center', marginTop: 4 }, __nextHasNoMarginBottom: true }, '+ Add Value')
                    ),

                    // Text Style
                    el(PanelBody, { title: __('Text Style', 'blockenberg'), initialOpen: false },
                        el(getTypographyControl(), { label: __('Main Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('Body Text', 'blockenberg'), value: a.typoBody, onChange: function (v) { set({ typoBody: v }); } })
                    ),

                    // Layout
                    el(PanelBody, { title: 'Layout', initialOpen: false },
                        el(RangeControl, { label: 'Max width (px)', value: a.maxWidth, min: 600, max: 1600, step: 50, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Container padding (px)', value: a.containerPadding, min: 0, max: 120, onChange: function (v) { set({ containerPadding: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Section gap (px)', value: a.sectionGap, min: 16, max: 120, onChange: function (v) { set({ sectionGap: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Card radius (px)', value: a.cardRadius, min: 0, max: 32, onChange: function (v) { set({ cardRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Card padding (px)', value: a.cardPadding, min: 12, max: 64, onChange: function (v) { set({ cardPadding: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Colors
                    el(PanelColorSettings, {
                        title: 'UI Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Container Background', value: a.containerBg, onChange: function (v) { set({ containerBg: v || '' }); } },
                            { label: 'Card Background', value: a.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                            { label: 'Card Border', value: a.cardBorder, onChange: function (v) { set({ cardBorder: v || '#e5e7eb' }); } },
                            { label: 'Heading Color', value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#111827' }); } },
                            { label: 'Text Color', value: a.textColor, onChange: function (v) { set({ textColor: v || '#374151' }); } },
                            { label: 'Section Label Color', value: a.sectionLabelColor, onChange: function (v) { set({ sectionLabelColor: v || '#6366f1' }); } },
                            { label: 'Section Label Background', value: a.sectionLabelBg, onChange: function (v) { set({ sectionLabelBg: v || '#ede9fe' }); } },
                            { label: 'Value Icon Background', value: a.valueIconBg, onChange: function (v) { set({ valueIconBg: v || '#f5f3ff' }); } },
                        ]
                    })
                ),

                // ── Editor Preview ──
                el('div', blockProps,
                    el('div', { style: { maxWidth: a.maxWidth + 'px', margin: '0 auto', padding: '0 24px' } },

                        // Main title
                        a.showTitle && el('h2', {
                            className: 'bkbg-bk-main-title',
                            style: { color: a.headingColor, marginBottom: a.sectionGap + 'px' }
                        }, a.sectionTitle),

                        // ── Colour palette ──
                        a.showColors && el('div', { style: cardStyle },
                            SectionLabel(a.colorsTitle, a),
                            el('div', {
                                style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 16 }
                            },
                                a.colors.map(function (clr, i) {
                                    var bright = isBright(clr.value);
                                    return el('div', { key: i },
                                        el('div', {
                                            style: {
                                                height: a.swatchHeight + 'px',
                                                background: clr.value,
                                                borderRadius: a.swatchRadius + 'px',
                                                border: bright ? '1px solid #e5e7eb' : 'none',
                                                marginBottom: 8,
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                justifyContent: 'flex-end',
                                                padding: 8,
                                            }
                                        },
                                            a.showCopyHint && el('span', {
                                                style: { fontSize: 10, color: bright ? '#6b7280' : 'rgba(255,255,255,0.6)', background: bright ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: 4 }
                                            }, 'copy')
                                        ),
                                        a.showColorName && el('div', { style: { fontSize: 12, fontWeight: 600, color: a.headingColor } }, clr.name),
                                        a.showColorHex && el('div', { style: { fontSize: 11, color: a.textColor, fontFamily: 'monospace' } }, clr.value)
                                    );
                                })
                            )
                        ),

                        // ── Typography ──
                        a.showTypography && el('div', { style: cardStyle },
                            SectionLabel(a.typographyTitle, a),
                            el('div', { style: { display: 'flex', flexDirection: 'column', gap: 32 } },
                                a.fonts.map(function (font, i) {
                                    return el('div', { key: i, style: { paddingBottom: i < a.fonts.length - 1 ? 32 : 0, borderBottom: i < a.fonts.length - 1 ? '1px solid #f3f4f6' : 'none' } },
                                        el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 } },
                                            el('div', null,
                                                el('div', { style: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: a.sectionLabelColor, marginBottom: 4 } }, font.name),
                                                el('div', { style: { fontSize: 13, color: a.textColor } }, font.familyName + ' · ' + font.weights)
                                            ),
                                            font.sourceUrl && el('a', { href: font.sourceUrl, target: '_blank', style: { fontSize: 12, color: a.sectionLabelColor } }, 'View font →')
                                        ),
                                        el('div', { style: { fontFamily: font.cssFamily, fontSize: 36, fontWeight: 700, color: a.headingColor, marginBottom: 12, lineHeight: 1.2 } }, font.headingText),
                                        el('div', { style: { fontFamily: font.cssFamily, fontSize: 16, color: a.textColor, lineHeight: 1.7 } }, font.bodyText)
                                    );
                                })
                            )
                        ),

                        // ── Logos ──
                        a.showLogos && el('div', { style: cardStyle },
                            SectionLabel(a.logosTitle, a),
                            el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 } },
                                a.logos.map(function (logo, i) {
                                    var logoBg = logo.bgStyle === 'dark' ? '#0f172a' : logo.bgStyle === 'light' ? '#f8fafc' : 'transparent';
                                    var checkered = logo.bgStyle === 'transparent';
                                    return el('div', { key: i },
                                        el('div', {
                                            style: {
                                                height: 120,
                                                borderRadius: 8,
                                                background: checkered ? 'repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 0 / 20px 20px' : logoBg,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: 10,
                                                border: '1px solid #e5e7eb',
                                                overflow: 'hidden',
                                            }
                                        },
                                            logo.imageUrl
                                                ? el('img', { src: logo.imageUrl, alt: logo.imageAlt || '', style: { maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' } })
                                                : el('div', { style: { fontSize: 13, color: '#9ca3af' } }, '+ Upload logo')
                                        ),
                                        el('div', { style: { fontSize: 12, fontWeight: 600, color: a.headingColor, marginBottom: 2 } }, logo.label),
                                        logo.description && el('div', { style: { fontSize: 11, color: a.textColor } }, logo.description)
                                    );
                                })
                            )
                        ),

                        // ── Brand Values ──
                        a.showValues && el('div', { style: Object.assign({}, cardStyle, { marginBottom: 0 }) },
                            SectionLabel(a.valuesTitle, a),
                            el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 } },
                                a.values.map(function (val, i) {
                                    return el('div', { key: i, style: { display: 'flex', flexDirection: 'column', gap: 10 } },
                                        el('div', {
                                            style: {
                                                width: 44, height: 44, borderRadius: 10,
                                                background: a.valueIconBg,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 22,
                                            }
                                        }, (val.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(val.iconType, val.icon, val.iconDashicon, val.iconImageUrl, val.iconDashiconColor) : val.icon),
                                        el('div', { className: 'bkbg-bk-value-title', style: { color: a.headingColor } }, val.title),
                                        el('div', { className: 'bkbg-bk-value-desc', style: { color: a.textColor } }, val.description)
                                    );
                                })
                            )
                        )
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-bk-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
