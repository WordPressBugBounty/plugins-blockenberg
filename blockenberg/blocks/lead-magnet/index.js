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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/lead-magnet', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.headingTypo, '--bkbg-lgm-h-'));
                    Object.assign(s, _tvFn(a.subtextTypo, '--bkbg-lgm-st-'));
                    Object.assign(s, _tvFn(a.buttonTypo, '--bkbg-lgm-bt-'));
                }
                return { className: 'bkbg-lgm-editor', style: s };
            })());

            var isCentered = a.layout === 'centered';
            var isLeft = a.layout === 'image-left';

            function updateBenefit(idx, val) {
                var next = a.benefits.map(function (b, i) { return i === idx ? { text: val } : b; });
                set({ benefits: next });
            }

            /* --- Mockup image --- */
            var mockupEl = el(MediaUploadCheck, {},
                el(MediaUpload, {
                    onSelect: function (media) { set({ imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' }); },
                    allowedTypes: ['image'],
                    value: a.imageId,
                    render: function (ref) {
                        var imgContent = a.imageUrl
                            ? el('img', { src: a.imageUrl, alt: a.imageAlt, className: 'bkbg-lgm-mockup-img bkbg-lgm-mockup-img--' + a.imageStyle })
                            : el('div', { className: 'bkbg-lgm-mockup-placeholder' }, '📥');
                        return el('div', {
                            className: 'bkbg-lgm-mockup-wrap bkbg-lgm-mockup-wrap--' + a.imageStyle,
                            onClick: ref.open,
                            style: { cursor: 'pointer', margin: isCentered ? '0 auto 32px' : '0' }
                        }, imgContent);
                    }
                })
            );

            /* --- Text / form panel --- */
            var textPanel = el('div', { className: 'bkbg-lgm-text' },
                a.showBadge && el('div', { style: { marginBottom: '14px' } },
                    el('span', { style: { background: a.badgeBg, color: a.badgeColor, fontSize: '11px', fontWeight: '800', letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '999px' } },
                        el(RichText, { tagName: 'span', value: a.badge, onChange: function (v) { set({ badge: v }); } })
                    )
                ),
                el(RichText, { tagName: 'h2', className: 'bkbg-lgm-heading', value: a.heading, style: { color: a.headingColor, margin: '0 0 12px' }, onChange: function (v) { set({ heading: v }); } }),
                el(RichText, { tagName: 'p', className: 'bkbg-lgm-subtext', value: a.subtext, style: { color: a.subtextColor, margin: '0 0 20px' }, onChange: function (v) { set({ subtext: v }); } }),
                a.showBenefits && el('ul', { style: { listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' } },
                    a.benefits.map(function (b, idx) {
                        return el('li', { key: idx, style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                            el('span', { style: { color: a.checkColor, fontSize: '16px', fontWeight: '700', flexShrink: 0 } }, '✓'),
                            el(TextControl, { value: b.text, onChange: function (v) { updateBenefit(idx, v); }, style: { flex: 1, margin: 0 }, __nextHasNoMarginBottom: true }),
                            el(Button, { isDestructive: true, isSmall: true, onClick: function () { set({ benefits: a.benefits.filter(function (_, i) { return i !== idx; }) }); } }, '✕')
                        ) }),
                    el(Button, { isSecondary: true, isSmall: true, onClick: function () { set({ benefits: a.benefits.concat([{ text: 'New benefit' }]) }); } }, '+ Add item')
                ),
                a.formEnabled && el('div', { className: 'bkbg-lgm-form-preview' },
                    el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                        el('input', { type: 'email', disabled: true, placeholder: a.formPlaceholder, style: { flex: '1 1 200px', padding: '14px 16px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '15px', background: '#fff', minWidth: '0' } }),
                        el('button', { disabled: true, className: 'bkbg-lgm-submit', style: { background: a.ctaBg, color: a.ctaColor, padding: '14px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' } }, a.formSubmitLabel)
                    ),
                    a.showPrivacy && el('p', { style: { fontSize: '12px', color: a.privacyColor, marginTop: '8px', marginBottom: 0, textAlign: isCentered ? 'center' : 'left' } },
                        el(RichText, { tagName: 'span', value: a.privacyNote, onChange: function (v) { set({ privacyNote: v }); } })
                    )
                )
            );

            var innerStyle = isCentered
                ? { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }
                : { display: 'flex', gap: '60px', alignItems: 'center', flexDirection: isLeft ? 'row' : 'row-reverse' };

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout & Content', 'blockenberg'), initialOpen: true },
                    el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: [{ label: 'Image Right', value: 'image-right' }, { label: 'Image Left', value: 'image-left' }, { label: 'Centered', value: 'centered' }], onChange: function (v) { set({ layout: v }); }, __nextHasNoMarginBottom: true }),
                    el(SelectControl, { label: __('Image Style', 'blockenberg'), value: a.imageStyle, options: [{ label: 'Floating (shadow)', value: 'floating' }, { label: 'Book', value: 'book' }, { label: 'Flat', value: 'flat' }], onChange: function (v) { set({ imageStyle: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Badge', 'blockenberg'), checked: a.showBadge, onChange: function (v) { set({ showBadge: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Benefits', 'blockenberg'), checked: a.showBenefits, onChange: function (v) { set({ showBenefits: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Form', 'blockenberg'), checked: a.formEnabled, onChange: function (v) { set({ formEnabled: v }); }, __nextHasNoMarginBottom: true }),
                    a.formEnabled && el(TextControl, { label: __('Form Action URL (optional)', 'blockenberg'), value: a.formAction, onChange: function (v) { set({ formAction: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Privacy Note', 'blockenberg'), checked: a.showPrivacy, onChange: function (v) { set({ showPrivacy: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 600, max: 1400, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, min: 0, max: 160, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 160, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: __('Heading'), value: a.headingTypo || {}, onChange: function (v) { set({ headingTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: __('Subtext'), value: a.subtextTypo || {}, onChange: function (v) { set({ subtextTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: __('Button'), value: a.buttonTypo || {}, onChange: function (v) { set({ buttonTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#f8f5ff' }); } },
                        { label: __('Badge BG', 'blockenberg'), value: a.badgeBg, onChange: function (v) { set({ badgeBg: v || '#dcfce7' }); } },
                        { label: __('Badge Text', 'blockenberg'), value: a.badgeColor, onChange: function (v) { set({ badgeColor: v || '#166534' }); } },
                        { label: __('Heading', 'blockenberg'), value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#111827' }); } },
                        { label: __('Subtext', 'blockenberg'), value: a.subtextColor, onChange: function (v) { set({ subtextColor: v || '#4b5563' }); } },
                        { label: __('Checkmark', 'blockenberg'), value: a.checkColor, onChange: function (v) { set({ checkColor: v || '#7c3aed' }); } },
                        { label: __('CTA BG', 'blockenberg'), value: a.ctaBg, onChange: function (v) { set({ ctaBg: v || '#7c3aed' }); } },
                        { label: __('CTA Text', 'blockenberg'), value: a.ctaColor, onChange: function (v) { set({ ctaColor: v || '#ffffff' }); } },
                        { label: __('Privacy Text', 'blockenberg'), value: a.privacyColor, onChange: function (v) { set({ privacyColor: v || '#9ca3af' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: { background: a.bgColor, paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px' } },
                    el('div', { style: Object.assign({ maxWidth: a.maxWidth + 'px', margin: '0 auto', padding: '0 24px' }, innerStyle) },
                        mockupEl,
                        textPanel
                    )
                )
            );
        },

        save: function (props) {
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-lgm-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
