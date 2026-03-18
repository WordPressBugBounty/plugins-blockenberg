( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
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
    var Fragment = wp.element.Fragment;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var RATIO_MAP = { '50-50': [50, 50], '55-45': [55, 45], '45-55': [45, 55], '60-40': [60, 40], '40-60': [40, 60] };

    registerBlockType('blockenberg/split-form', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var bullets = attr.bullets || [];
            var submitted = useState(false);
            var isSubmitted = submitted[0];
            var setSubmitted = submitted[1];

            function updateBullet(idx, val) {
                var updated = bullets.map(function (b, i) { return i === idx ? { text: val } : b; });
                set({ bullets: updated });
            }
            function addBullet() { set({ bullets: bullets.concat([{ text: 'New benefit' }]) }); }
            function removeBullet(idx) { set({ bullets: bullets.filter(function (_, i) { return i !== idx; }) }); }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Content Side', 'blockenberg'), value: attr.contentSide,
                        options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }],
                        onChange: function (v) { set({ contentSide: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Split Ratio', 'blockenberg'), value: attr.splitRatio,
                        options: [
                            { label: '50 / 50', value: '50-50' },
                            { label: '55 / 45', value: '55-45' },
                            { label: '45 / 55', value: '45-55' },
                            { label: '60 / 40', value: '60-40' },
                            { label: '40 / 60', value: '40-60' }
                        ],
                        onChange: function (v) { set({ splitRatio: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: attr.borderRadius, min: 0, max: 32, onChange: function (v) { set({ borderRadius: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 240, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 240, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Content Panel', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Use Image instead of colour', 'blockenberg'), checked: attr.useImage, onChange: function (v) { set({ useImage: v }); }, __nextHasNoMarginBottom: true }),
                    attr.useImage && el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { set({ imageUrl: m.url, imageId: m.id, imageAlt: m.alt || '' }); },
                            allowedTypes: ['image'], value: attr.imageId,
                            render: function (ref) {
                                return el(Fragment, {},
                                    attr.imageUrl && el('img', { src: attr.imageUrl, style: { width: '100%', borderRadius: '6px', marginBottom: '8px' } }),
                                    el(Button, { onClick: ref.open, variant: 'secondary', isSmall: true }, attr.imageUrl ? __('Replace Image', 'blockenberg') : __('Upload Image', 'blockenberg'))
                                );
                            }
                        })
                    ),
                    attr.useImage && el(ToggleControl, { label: __('Dark overlay on image', 'blockenberg'), checked: attr.imageOverlay, onChange: function (v) { set({ imageOverlay: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Icon', 'blockenberg'), checked: attr.showIcon, onChange: function (v) { set({ showIcon: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showIcon && el(IP().IconPickerControl, IP().iconPickerProps(attr, set, { charAttr: 'icon', typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' })),
                    el(ToggleControl, { label: __('Show Eyebrow', 'blockenberg'), checked: attr.showEyebrow, onChange: function (v) { set({ showEyebrow: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Bullet List', 'blockenberg'), checked: attr.showBullets, onChange: function (v) { set({ showBullets: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showBullets && el(IP().IconPickerControl, IP().iconPickerProps(attr, set, { charAttr: 'bulletIcon', typeAttr: 'bulletIconType', dashiconAttr: 'bulletIconDashicon', imageUrlAttr: 'bulletIconImageUrl', colorAttr: 'bulletIconDashiconColor' })),
                    attr.showBullets && el('div', {},
                        bullets.map(function (b, idx) {
                            return el('div', { key: idx, style: { display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' } },
                                el(TextControl, { value: b.text, onChange: function (v) { updateBullet(idx, v); }, style: { flex: 1 }, __nextHasNoMarginBottom: true }),
                                el(Button, { onClick: function () { removeBullet(idx); }, variant: 'link', isDestructive: true, isSmall: true }, '✕')
                            );
                        }),
                        el(Button, { onClick: addBullet, variant: 'secondary', isSmall: true }, __('+ Add Bullet', 'blockenberg'))
                    )
                ),
                el(PanelBody, { title: __('Form Panel', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Form Title', 'blockenberg'), checked: attr.showFormTitle, onChange: function (v) { set({ showFormTitle: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Form Title', 'blockenberg'), value: attr.formTitle, onChange: function (v) { set({ formTitle: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Form Sub-text', 'blockenberg'), value: attr.formSubtext, onChange: function (v) { set({ formSubtext: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Name Field', 'blockenberg'), checked: attr.showName, onChange: function (v) { set({ showName: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showName && el(TextControl, { label: __('Name Placeholder', 'blockenberg'), value: attr.namePlaceholder, onChange: function (v) { set({ namePlaceholder: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Email Placeholder', 'blockenberg'), value: attr.emailPlaceholder, onChange: function (v) { set({ emailPlaceholder: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Phone Field', 'blockenberg'), checked: attr.showPhone, onChange: function (v) { set({ showPhone: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showPhone && el(TextControl, { label: __('Phone Placeholder', 'blockenberg'), value: attr.phonePlaceholder, onChange: function (v) { set({ phonePlaceholder: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Submit Label', 'blockenberg'), value: attr.submitLabel, onChange: function (v) { set({ submitLabel: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Form Action URL', 'blockenberg'), value: attr.formAction, onChange: function (v) { set({ formAction: v }); }, placeholder: 'https://', __nextHasNoMarginBottom: true }),
                    el(SelectControl, {
                        label: __('Method', 'blockenberg'), value: attr.formMethod,
                        options: [{ label: 'POST', value: 'post' }, { label: 'GET', value: 'get' }],
                        onChange: function (v) { set({ formMethod: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, { label: __('Show Privacy Note', 'blockenberg'), checked: attr.showPrivacy, onChange: function (v) { set({ showPrivacy: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showPrivacy && el(TextControl, { label: __('Privacy Note', 'blockenberg'), value: attr.privacyNote, onChange: function (v) { set({ privacyNote: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Success Message', 'blockenberg'), value: attr.successMsg, onChange: function (v) { set({ successMsg: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Input Border Radius (px)', 'blockenberg'), value: attr.inputRadius, min: 0, max: 24, onChange: function (v) { set({ inputRadius: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Button Border Radius (px)', 'blockenberg'), value: attr.btnRadius, min: 0, max: 24, onChange: function (v) { set({ btnRadius: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: attr.bgColor,       onChange: function (v) { set({ bgColor: v || '#1e1b4b' }); },   label: __('Outer Background', 'blockenberg') },
                        { value: attr.contentBg,     onChange: function (v) { set({ contentBg: v || '' }); },        label: __('Content Panel BG', 'blockenberg') },
                        { value: attr.formBg,        onChange: function (v) { set({ formBg: v || '#ffffff' }); },    label: __('Form Panel BG', 'blockenberg') },
                        { value: attr.eyebrowColor,  onChange: function (v) { set({ eyebrowColor: v || '#a5b4fc' }); }, label: __('Eyebrow', 'blockenberg') },
                        { value: attr.headingColor,  onChange: function (v) { set({ headingColor: v || '#ffffff' }); }, label: __('Content Heading', 'blockenberg') },
                        { value: attr.subtextColor,  onChange: function (v) { set({ subtextColor: v || '#c7d2fe' }); }, label: __('Content Text', 'blockenberg') },
                        { value: attr.bulletColor,   onChange: function (v) { set({ bulletColor: v || '#c7d2fe' }); }, label: __('Bullet Text', 'blockenberg') },
                        { value: attr.bulletIconColor,onChange: function (v) { set({ bulletIconColor: v || '#818cf8' }); }, label: __('Bullet Icon', 'blockenberg') },
                        { value: attr.formHeadingColor,onChange: function (v) { set({ formHeadingColor: v || '#111827' }); }, label: __('Form Heading', 'blockenberg') },
                        { value: attr.inputBg,       onChange: function (v) { set({ inputBg: v || '#f9fafb' }); },   label: __('Input BG', 'blockenberg') },
                        { value: attr.inputBorder,   onChange: function (v) { set({ inputBorder: v || '#d1d5db' }); }, label: __('Input Border', 'blockenberg') },
                        { value: attr.inputColor,    onChange: function (v) { set({ inputColor: v || '#111827' }); }, label: __('Input Text', 'blockenberg') },
                        { value: attr.btnBg,         onChange: function (v) { set({ btnBg: v || '#6366f1' }); },     label: __('Submit Button BG', 'blockenberg') },
                        { value: attr.btnColor,      onChange: function (v) { set({ btnColor: v || '#ffffff' }); },  label: __('Submit Button Text', 'blockenberg') },
                        { value: attr.privacyColor,  onChange: function (v) { set({ privacyColor: v || '#9ca3af' }); }, label: __('Privacy Note', 'blockenberg') }
                    ]
                }),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() ? el(getTypoControl(), { label: __('Heading Typography', 'blockenberg'), value: attr.headingTypo || {}, onChange: function (v) { set({ headingTypo: v }); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label: __('Eyebrow Typography', 'blockenberg'), value: attr.eyebrowTypo || {}, onChange: function (v) { set({ eyebrowTypo: v }); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label: __('Subtext Typography', 'blockenberg'), value: attr.subtextTypo || {}, onChange: function (v) { set({ subtextTypo: v }); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label: __('Form Title Typography', 'blockenberg'), value: attr.formTitleTypo || {}, onChange: function (v) { set({ formTitleTypo: v }); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label: __('Bullet Typography', 'blockenberg'), value: attr.bulletTypo || {}, onChange: function (v) { set({ bulletTypo: v }); } }) : null
                )
            );

            var ratio = RATIO_MAP[attr.splitRatio] || [50, 50];
            var contentFlex = attr.contentSide === 'left' ? ratio[0] : ratio[1];
            var formFlex = attr.contentSide === 'left' ? ratio[1] : ratio[0];

            /* Input style */
            var inputStyle = { display: 'block', width: '100%', padding: '12px 14px', border: '1px solid ' + attr.inputBorder, borderRadius: attr.inputRadius + 'px', background: attr.inputBg, color: attr.inputColor, fontSize: '15px', boxSizing: 'border-box', marginBottom: '12px' };

            /* Content panel */
            var contentPanelStyle = {
                flex: contentFlex,
                background: attr.contentBg || 'transparent',
                padding: '40px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                position: 'relative', overflow: 'hidden'
            };
            if (attr.useImage && attr.imageUrl) {
                contentPanelStyle.backgroundImage = 'url(' + attr.imageUrl + ')';
                contentPanelStyle.backgroundSize = 'cover';
                contentPanelStyle.backgroundPosition = 'center';
            }

            var contentPanel = el('div', { className: 'bkbg-sf-content', style: contentPanelStyle },
                attr.useImage && attr.imageUrl && attr.imageOverlay && el('div', { style: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)' } }),
                el('div', { style: { position: 'relative', zIndex: 1 } },
                    attr.showIcon && el('div', { style: { fontSize: '40px', marginBottom: '16px' } }, (attr.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(attr.iconType, attr.icon, attr.iconDashicon, attr.iconImageUrl, attr.iconDashiconColor) : attr.icon),
                    attr.showEyebrow && el(RichText, {
                        tagName: 'p', className: 'bkbg-sf-eyebrow', value: attr.eyebrow, onChange: function (v) { set({ eyebrow: v }); },
                        placeholder: __('Eyebrow…', 'blockenberg'),
                        style: { color: attr.eyebrowColor, margin: '0 0 8px' }
                    }),
                    el(RichText, {
                        tagName: 'h2', className: 'bkbg-sf-heading', value: attr.heading, onChange: function (v) { set({ heading: v }); },
                        placeholder: __('Heading…', 'blockenberg'),
                        style: { color: attr.headingColor, margin: '0 0 14px' }
                    }),
                    el(RichText, {
                        tagName: 'p', className: 'bkbg-sf-text', value: attr.subtext, onChange: function (v) { set({ subtext: v }); },
                        placeholder: __('Subtext…', 'blockenberg'),
                        style: { color: attr.subtextColor, margin: attr.showBullets ? '0 0 20px' : '0' }
                    }),
                    attr.showBullets && el('ul', { style: { listStyle: 'none', margin: 0, padding: 0 } },
                        bullets.map(function (b, idx) {
                            return el('li', { key: idx, className: 'bkbg-sf-bullet', style: { color: attr.bulletColor } },
                                el('span', { style: { color: attr.bulletIconColor, fontWeight: '700', flexShrink: 0 } }, (attr.bulletIconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(attr.bulletIconType, attr.bulletIcon, attr.bulletIconDashicon, attr.bulletIconImageUrl, attr.bulletIconDashiconColor) : attr.bulletIcon),
                                b.text
                            );
                        })
                    )
                )
            );

            /* Form panel */
            var formPanel = el('div', { className: 'bkbg-sf-form-panel', style: { flex: formFlex, background: attr.formBg, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
                attr.showFormTitle && el('h3', { className: 'bkbg-sf-form-title', style: { color: attr.formHeadingColor, margin: '0 0 8px' } }, attr.formTitle),
                attr.formSubtext && el('p', { style: { color: attr.formHeadingColor, fontSize: '14px', margin: '0 0 20px', opacity: 0.7 } }, attr.formSubtext),
                attr.showName && el('input', { type: 'text', placeholder: attr.namePlaceholder, style: inputStyle, readOnly: true }),
                el('input', { type: 'email', placeholder: attr.emailPlaceholder, style: inputStyle, readOnly: true }),
                attr.showPhone && el('input', { type: 'tel', placeholder: attr.phonePlaceholder, style: inputStyle, readOnly: true }),
                el('button', { type: 'button', className: 'bkbg-sf-submit', style: { width: '100%', padding: '14px', background: attr.btnBg, color: attr.btnColor, border: 'none', borderRadius: attr.btnRadius + 'px', cursor: 'pointer', marginBottom: '12px' } }, attr.submitLabel),
                attr.showPrivacy && el('p', { style: { color: attr.privacyColor, fontSize: '12px', margin: 0, textAlign: 'center' } }, attr.privacyNote)
            );

            var panels = attr.contentSide === 'left' ? [contentPanel, formPanel] : [formPanel, contentPanel];

            return el(Fragment, {},
                inspector,
                el('div', useBlockProps({ className: 'bkbg-sf-section', style: (function () {
                    var s = {
                        background: attr.bgColor,
                        paddingTop: attr.paddingTop + 'px',
                        paddingBottom: attr.paddingBottom + 'px',
                        borderRadius: attr.borderRadius + 'px',
                        overflow: 'hidden',
                        '--bksf-eb-sz': attr.eyebrowFontSize + 'px',
                        '--bksf-eb-w': attr.eyebrowFontWeight,
                        '--bksf-hd-sz': attr.headingFontSize + 'px',
                        '--bksf-hd-w': attr.headingFontWeight,
                        '--bksf-st-sz': attr.subtextFontSize + 'px',
                        '--bksf-ft-sz': attr.formTitleFontSize + 'px',
                        '--bksf-ft-w': attr.formTitleFontWeight,
                    };
                    var tv = getTypoCssVars();
                    if (tv) {
                        Object.assign(s, tv(attr.headingTypo, '--bksf-hd-'));
                        Object.assign(s, tv(attr.eyebrowTypo, '--bksf-eb-'));
                        Object.assign(s, tv(attr.subtextTypo, '--bksf-st-'));
                        Object.assign(s, tv(attr.formTitleTypo, '--bksf-ft-'));
                        Object.assign(s, tv(attr.bulletTypo, '--bksf-bl-'));
                    }
                    return s;
                })() }),
                    el('div', { style: { display: 'flex', alignItems: 'stretch' } }, panels)
                )
            );
        },

        save: function (props) {
            var el2 = wp.element.createElement;
            var ubp = wp.blockEditor.useBlockProps;
            return el2('div', ubp.save(),
                el2('div', { className: 'bkbg-sf-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
