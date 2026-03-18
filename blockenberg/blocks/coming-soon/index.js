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
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var IP = function () { return window.bkbgIconPicker; };

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    registerBlockType('blockenberg/coming-soon', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-csn-editor' });

            var bg = attr.bgGradient || attr.bgColor;
            var previewStyle = { background: bg, padding: attr.paddingTop + 'px 40px ' + attr.paddingBottom + 'px', textAlign: 'center' };
            var innerStyle = { maxWidth: attr.maxWidth + 'px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 };

            function updateSocial(i, key, val) {
                var next = attr.socialLinks.map(function (s, j) { return j === i ? Object.assign({}, s, { [key]: val }) : s; });
                setAttr({ socialLinks: next });
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Logo', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showLogo, onChange: function (v) { setAttr({ showLogo: v }); } }),
                        attr.showLogo && el(Fragment, null,
                            el(MediaUploadCheck, null,
                                el(MediaUpload, {
                                    onSelect: function (m) { setAttr({ logoUrl: m.url, logoId: m.id, logoAlt: m.alt || '' }); },
                                    allowedTypes: ['image'], value: attr.logoId,
                                    render: function (r) {
                                        return el(Fragment, null,
                                            attr.logoUrl && el('img', { src: attr.logoUrl, style: { maxWidth: 140, display: 'block', marginBottom: 8 } }),
                                            el(Button, { onClick: r.open, variant: 'secondary', __nextHasNoMarginBottom: true }, attr.logoUrl ? __('Change Logo', 'blockenberg') : __('Select Logo', 'blockenberg')),
                                            attr.logoUrl && el(Button, { onClick: function () { setAttr({ logoUrl: '', logoId: 0 }); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true, style: { marginLeft: 8 } }, __('Remove', 'blockenberg'))
                                        );
                                    }
                                })
                            ),
                            el(RangeControl, { label: __('Logo Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.logoWidth, min: 60, max: 300, onChange: function (v) { setAttr({ logoWidth: v }); } })
                        ),
                        el(ToggleControl, { label: __('Show Eyebrow', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showEyebrow, onChange: function (v) { setAttr({ showEyebrow: v }); } }),
                        attr.showEyebrow && el(TextControl, { label: __('Eyebrow Text', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.eyebrow, onChange: function (v) { setAttr({ eyebrow: v }); } }),
                        el(ToggleControl, { label: __('Show Countdown', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showCountdown, onChange: function (v) { setAttr({ showCountdown: v }); } }),
                        attr.showCountdown && el(TextControl, { label: __('Launch Date (YYYY-MM-DD)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.launchDate, placeholder: '2025-12-31', onChange: function (v) { setAttr({ launchDate: v }); } }),
                        el(ToggleControl, { label: __('Show Email Form', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showEmail, onChange: function (v) { setAttr({ showEmail: v }); } }),
                        attr.showEmail && el(TextControl, { label: __('Email Placeholder', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.emailPlaceholder, onChange: function (v) { setAttr({ emailPlaceholder: v }); } }),
                        attr.showEmail && el(TextControl, { label: __('Button Label', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.emailBtnLabel, onChange: function (v) { setAttr({ emailBtnLabel: v }); } }),
                        attr.showEmail && el(TextControl, { label: __('Form Action URL', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.emailAction, onChange: function (v) { setAttr({ emailAction: v }); } })
                    ),
                    el(PanelBody, { title: __('Social Links', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Social Links', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showSocials, onChange: function (v) { setAttr({ showSocials: v }); } }),
                        attr.showSocials && el(Fragment, null,
                            attr.socialLinks.map(function (s, i) {
                                return el('div', { key: i, style: { borderLeft: '3px solid #7c3aed', paddingLeft: 8, marginBottom: 12 } },
                                    el(TextControl, { label: __('Platform', 'blockenberg'), __nextHasNoMarginBottom: true, value: s.platform, onChange: function (v) { updateSocial(i, 'platform', v); } }),
                                    el(TextControl, { label: __('URL', 'blockenberg'), __nextHasNoMarginBottom: true, value: s.url, onChange: function (v) { updateSocial(i, 'url', v); } }),
                                    el(IP().IconPickerControl, {
                        iconType: s.iconType, customChar: s.icon, dashicon: s.iconDashicon, imageUrl: s.iconImageUrl,
                        onChangeType: function (v) { updateSocial(i, 'iconType', v); },
                        onChangeChar: function (v) { updateSocial(i, 'icon', v); },
                        onChangeDashicon: function (v) { updateSocial(i, 'iconDashicon', v); },
                        onChangeImageUrl: function (v) { updateSocial(i, 'iconImageUrl', v); }
                    }),
                                    attr.socialLinks.length > 1 && el(Button, { onClick: function () { setAttr({ socialLinks: attr.socialLinks.filter(function (_, j) { return j !== i; }) }); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true }, __('Remove', 'blockenberg'))
                                );
                            }),
                            el(Button, { onClick: function () { setAttr({ socialLinks: attr.socialLinks.concat([{ platform: 'Social', url: '#', icon: '♦', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '' }]) }); }, variant: 'secondary', __nextHasNoMarginBottom: true }, __('+ Add Link', 'blockenberg'))
                        )
                    ),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.maxWidth, min: 400, max: 1000, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingTop, min: 0, max: 300, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingBottom, min: 0, max: 300, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () {
                            var TC = getTypographyControl();
                            return el( Fragment, {},
                                el( TC, { label: __( 'Heading', 'blockenberg' ), value: attr.typoHeading || {}, onChange: function (v) { setAttr({ typoHeading: v }); } }),
                                el( TC, { label: __( 'Body', 'blockenberg' ), value: attr.typoBody || {}, onChange: function (v) { setAttr({ typoBody: v }); } }),
                                el( TC, { label: __( 'Eyebrow', 'blockenberg' ), value: attr.typoEyebrow || {}, onChange: function (v) { setAttr({ typoEyebrow: v }); } })
                            );
                        })()
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,      onChange: function (v) { setAttr({ bgColor: v || '#0f172a' }); },                label: __('Background', 'blockenberg') },
                            { value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#ffffff' }); },           label: __('Heading', 'blockenberg') },
                            { value: attr.textColor,    onChange: function (v) { setAttr({ textColor: v || '#94a3b8' }); },              label: __('Body Text', 'blockenberg') },
                            { value: attr.eyebrowBg,    onChange: function (v) { setAttr({ eyebrowBg: v || 'rgba(255,255,255,.08)' }); }, label: __('Eyebrow BG', 'blockenberg') },
                            { value: attr.eyebrowColor, onChange: function (v) { setAttr({ eyebrowColor: v || '#c4b5fd' }); },           label: __('Eyebrow Text', 'blockenberg') },
                            { value: attr.timerBg,      onChange: function (v) { setAttr({ timerBg: v || 'rgba(255,255,255,.07)' }); },  label: __('Timer Box BG', 'blockenberg') },
                            { value: attr.timerColor,   onChange: function (v) { setAttr({ timerColor: v || '#ffffff' }); },             label: __('Timer Number', 'blockenberg') },
                            { value: attr.btnBg,        onChange: function (v) { setAttr({ btnBg: v || '#7c3aed' }); },                  label: __('Button Background', 'blockenberg') },
                            { value: attr.btnColor,     onChange: function (v) { setAttr({ btnColor: v || '#ffffff' }); },               label: __('Button Text', 'blockenberg') },
                            { value: attr.accentColor,  onChange: function (v) { setAttr({ accentColor: v || '#7c3aed' }); },            label: __('Accent', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { style: previewStyle },
                        el('div', { style: innerStyle },
                            attr.showLogo && attr.logoUrl && el('img', { src: attr.logoUrl, alt: attr.logoAlt, style: { width: attr.logoWidth + 'px', display: 'block' } }),
                            attr.showEyebrow && el('span', { className: 'bkbg-csn-eyebrow', style: { background: attr.eyebrowBg, color: attr.eyebrowColor } }, attr.eyebrow),
                            el(RichText, { tagName: 'h1', className: 'bkbg-csn-heading', value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, style: { color: attr.headingColor, margin: 0 }, placeholder: __('Heading…', 'blockenberg') }),
                            el(RichText, { tagName: 'p', className: 'bkbg-csn-body', value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, style: { color: attr.textColor, margin: 0, maxWidth: 560 }, placeholder: __('Subtitle…', 'blockenberg') }),
                            attr.showCountdown && el('div', { style: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' } },
                                ['Days', 'Hours', 'Mins', 'Secs'].map(function (unit) {
                                    return el('div', { key: unit, style: { background: attr.timerBg, borderRadius: 12, padding: '20px 28px', textAlign: 'center', minWidth: 80 } },
                                        el('div', { style: { fontSize: 44, fontWeight: 800, color: attr.timerColor, lineHeight: 1 } }, unit === 'Days' ? '00' : unit === 'Hours' ? '00' : unit === 'Mins' ? '00' : '00'),
                                        el('div', { style: { fontSize: 12, color: attr.textColor, marginTop: 6, textTransform: 'uppercase', letterSpacing: '.08em' } }, unit)
                                    );
                                })
                            ),
                            attr.showEmail && el('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 480 } },
                                el('input', { type: 'email', placeholder: attr.emailPlaceholder, readOnly: true, style: { flex: '1 1 220px', padding: '14px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: attr.inputBg, color: attr.inputColor, fontSize: 15 } }),
                                el('button', { style: { flex: '0 0 auto', padding: '14px 28px', borderRadius: 8, background: attr.btnBg, color: attr.btnColor, fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer' } }, attr.emailBtnLabel)
                            ),
                            attr.showSocials && attr.socialLinks.length > 0 && el('div', { style: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' } },
                                attr.socialLinks.map(function (s, i) {
                                    return el('a', { key: i, href: '#', style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.1)', color: attr.textColor, fontSize: 18, textDecoration: 'none' } },
                                        (s.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(s.iconType, s.icon, s.iconDashicon, s.iconImageUrl, s.iconDashiconColor) : s.icon
                                    );
                                })
                            )
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-coming-soon-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
