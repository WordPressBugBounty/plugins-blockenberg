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
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/spotlight-reveal', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-sr-editor' });

            var overlayRgba = (function () {
                var hex = attr.overlayColor.replace('#', '');
                if (hex.length === 3) { hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]; }
                var r = parseInt(hex.substr(0,2),16);
                var g = parseInt(hex.substr(2,2),16);
                var b = parseInt(hex.substr(4,2),16);
                return 'rgba(' + r + ',' + g + ',' + b + ',' + (attr.overlayOpacity / 100) + ')';
            })();

            var wrapStyle = (function () {
                var tv = getTypoCssVars();
                var s = {
                    position: 'relative',
                    overflow: 'hidden',
                    background: attr.bgImageUrl
                        ? 'url(' + attr.bgImageUrl + ') center/cover no-repeat'
                        : attr.revealColor,
                    paddingTop: attr.paddingTop + 'px',
                    paddingBottom: attr.paddingBottom + 'px',
                    '--bksr-hd-sz': attr.headingSize + 'px',
                    '--bksr-hd-w': String(attr.headingFontWeight || '700'),
                    '--bksr-hd-lh': String(attr.headingLineHeight || 1.2),
                    '--bksr-tx-sz': attr.textSize + 'px',
                    '--bksr-tx-lh': String(attr.textLineHeight || 1.6),
                    '--bksr-ey-sz': attr.eyebrowSize + 'px',
                };
                Object.assign(s, tv(attr.headingTypo, '--bksr-hd-'));
                Object.assign(s, tv(attr.textTypo, '--bksr-tx-'));
                Object.assign(s, tv(attr.eyebrowTypo, '--bksr-ey-'));
                Object.assign(s, tv(attr.ctaTypo, '--bksr-ct-'));
                return s;
            })();
            var overlayStyle = {
                position: 'absolute', inset: 0,
                background: overlayRgba,
                pointerEvents: 'none'
            };
            var innerStyle = {
                position: 'relative',
                zIndex: 2,
                maxWidth: attr.maxWidth + 'px',
                margin: '0 auto',
                textAlign: 'center',
                padding: '0 24px'
            };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Eyebrow', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showEyebrow, onChange: function (v) { setAttr({ showEyebrow: v }); } }),
                        el(ToggleControl, { label: __('Show CTA Button', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showCta, onChange: function (v) { setAttr({ showCta: v }); } }),
                        attr.showCta && el(TextControl, { label: __('CTA Label', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.ctaLabel, onChange: function (v) { setAttr({ ctaLabel: v }); } }),
                        attr.showCta && el(TextControl, { label: __('CTA URL', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.ctaUrl, onChange: function (v) { setAttr({ ctaUrl: v }); } })
                    ),
                    el(PanelBody, { title: __('Background Image', 'blockenberg'), initialOpen: false },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { setAttr({ bgImageUrl: m.url, bgImageId: m.id }); },
                                allowedTypes: ['image'], value: attr.bgImageId,
                                render: function (r) {
                                    return el(Fragment, null,
                                        attr.bgImageUrl && el('img', { src: attr.bgImageUrl, style: { width: '100%', height: 80, objectFit: 'cover', borderRadius: 4, marginBottom: 8 } }),
                                        el(Button, { onClick: r.open, variant: 'secondary', __nextHasNoMarginBottom: true }, attr.bgImageUrl ? __('Change Image', 'blockenberg') : __('Select Background', 'blockenberg')),
                                        attr.bgImageUrl && el(Button, { onClick: function () { setAttr({ bgImageUrl: '', bgImageId: 0 }); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true }, __('Remove', 'blockenberg'))
                                    );
                                }
                            })
                        )
                    ),
                    el(PanelBody, { title: __('Spotlight', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Trigger Mode', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.triggerMode,
                            options: [{ label: __('Cursor follow', 'blockenberg'), value: 'cursor' }, { label: __('Scan animation', 'blockenberg'), value: 'scan' }],
                            onChange: function (v) { setAttr({ triggerMode: v }); } }),
                        el(RangeControl, { label: __('Spotlight Size (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.spotlightSize, min: 100, max: 800, onChange: function (v) { setAttr({ spotlightSize: v }); } }),
                        el(RangeControl, { label: __('Softness (%)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.spotlightSoft, min: 0, max: 100, onChange: function (v) { setAttr({ spotlightSoft: v }); } }),
                        el(RangeControl, { label: __('Overlay Opacity (%)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.overlayOpacity, min: 10, max: 100, onChange: function (v) { setAttr({ overlayOpacity: v }); } })
                    ),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.maxWidth, min: 400, max: 1400, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingTop, min: 0, max: 300, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingBottom, min: 0, max: 300, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl()({ label: __('Heading', 'blockenberg'), value: attr.headingTypo, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                        getTypoControl()({ label: __('Subtext', 'blockenberg'), value: attr.textTypo, onChange: function (v) { setAttr({ textTypo: v }); } }),
                        getTypoControl()({ label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowTypo, onChange: function (v) { setAttr({ eyebrowTypo: v }); } }),
                        getTypoControl()({ label: __('CTA Button', 'blockenberg'), value: attr.ctaTypo, onChange: function (v) { setAttr({ ctaTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: attr.overlayColor,  onChange: function (v) { setAttr({ overlayColor: v || '#000000' }); },  label: __('Overlay Color', 'blockenberg') },
                            { value: attr.revealColor,   onChange: function (v) { setAttr({ revealColor: v || '#7c3aed' }); },   label: __('Reveal/BG Color', 'blockenberg') },
                            { value: attr.headingColor,  onChange: function (v) { setAttr({ headingColor: v || '#ffffff' }); },  label: __('Heading', 'blockenberg') },
                            { value: attr.subtextColor,  onChange: function (v) { setAttr({ subtextColor: v || '#e5e7eb' }); },  label: __('Subtext', 'blockenberg') },
                            { value: attr.eyebrowColor,  onChange: function (v) { setAttr({ eyebrowColor: v || '#a78bfa' }); },  label: __('Eyebrow', 'blockenberg') },
                            { value: attr.ctaBg,         onChange: function (v) { setAttr({ ctaBg: v || '#7c3aed' }); },         label: __('Button BG', 'blockenberg') },
                            { value: attr.ctaColor,      onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); },      label: __('Button Text', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { style: wrapStyle },
                        el('div', { style: overlayStyle }),
                        el('div', { style: innerStyle },
                            attr.showEyebrow && el(RichText, { tagName: 'span', value: attr.eyebrow, onChange: function (v) { setAttr({ eyebrow: v }); },
                                className: 'bkbg-sr-eyebrow',
                                style: { color: attr.eyebrowColor, marginBottom: 16 },
                                placeholder: 'Eyebrow…' }),
                            el('br'),
                            el(RichText, { tagName: 'h2', value: attr.heading, onChange: function (v) { setAttr({ heading: v }); },
                                className: 'bkbg-sr-heading',
                                style: { color: attr.headingColor, margin: '0 0 20px' },
                                placeholder: __('Section heading…', 'blockenberg') }),
                            el(RichText, { tagName: 'p', value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); },
                                className: 'bkbg-sr-text',
                                style: { color: attr.subtextColor, margin: '0 0 32px' },
                                placeholder: __('Subtext…', 'blockenberg') }),
                            attr.showCta && el('a', {
                                href: '#', onClick: function (e) { e.preventDefault(); },
                                className: 'bkbg-sr-btn',
                                style: { background: attr.ctaBg, color: attr.ctaColor }
                            }, attr.ctaLabel)
                        ),
                        el('div', { style: { textAlign: 'center', marginTop: 24, position: 'relative', zIndex: 2 } },
                            el('span', { style: { display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 20, padding: '6px 16px', fontSize: 12, backdropFilter: 'blur(4px)' } },
                                '🔦 ' + __('Cursor spotlight active on frontend', 'blockenberg'))
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-spotlight-reveal-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
