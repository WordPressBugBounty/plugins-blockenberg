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

    registerBlockType('blockenberg/popup', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var previewOpen = useState(false);
            var isOpen = previewOpen[0];
            var setOpen = previewOpen[1];

            var inspector = el(InspectorControls, {},
                /* Trigger */
                el(PanelBody, { title: __('Trigger Button', 'blockenberg'), initialOpen: true },
                    el(TextControl, { label: __('Button Label', 'blockenberg'), value: attr.triggerLabel, onChange: function (v) { set({ triggerLabel: v }); }, __nextHasNoMarginBottom: true }),
                    el(SelectControl, {
                        label: __('Button Style', 'blockenberg'), value: attr.triggerStyle,
                        options: [{ label: 'Filled', value: 'filled' }, { label: 'Outline', value: 'outline' }, { label: 'Ghost', value: 'ghost' }],
                        onChange: function (v) { set({ triggerStyle: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Button Size', 'blockenberg'), value: attr.triggerSize,
                        options: [{ label: 'Small', value: 'sm' }, { label: 'Medium', value: 'md' }, { label: 'Large', value: 'lg' }],
                        onChange: function (v) { set({ triggerSize: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Button Alignment', 'blockenberg'), value: attr.triggerAlign,
                        options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }],
                        onChange: function (v) { set({ triggerAlign: v }); }, __nextHasNoMarginBottom: true
                    })
                ),
                /* Trigger type */
                el(PanelBody, { title: __('Trigger Type', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('When to Show', 'blockenberg'), value: attr.triggerType,
                        options: [
                            { label: 'Button Click', value: 'click' },
                            { label: 'Scroll Depth', value: 'scroll' },
                            { label: 'Time Delay', value: 'delay' },
                            { label: 'Exit Intent', value: 'exit' }
                        ],
                        onChange: function (v) { set({ triggerType: v }); }, __nextHasNoMarginBottom: true
                    }),
                    attr.triggerType === 'scroll' && el(RangeControl, {
                        label: __('Scroll Depth (%)', 'blockenberg'), value: attr.scrollDepth, min: 10, max: 100,
                        onChange: function (v) { set({ scrollDepth: v }); }, __nextHasNoMarginBottom: true
                    }),
                    attr.triggerType === 'delay' && el(RangeControl, {
                        label: __('Delay (seconds)', 'blockenberg'), value: attr.timeDelay, min: 1, max: 30,
                        onChange: function (v) { set({ timeDelay: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Show Frequency', 'blockenberg'), value: attr.showOnce,
                        options: [
                            { label: 'Always', value: 'always' },
                            { label: 'Once per Session', value: 'session' },
                            { label: 'Once Ever', value: 'once' }
                        ],
                        onChange: function (v) { set({ showOnce: v }); }, __nextHasNoMarginBottom: true
                    })
                ),
                /* Popup layout */
                el(PanelBody, { title: __('Popup Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Position', 'blockenberg'), value: attr.popupPosition,
                        options: [
                            { label: 'Center', value: 'center' },
                            { label: 'Drawer — Right', value: 'drawer-right' },
                            { label: 'Drawer — Bottom', value: 'drawer-bottom' }
                        ],
                        onChange: function (v) { set({ popupPosition: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Size', 'blockenberg'), value: attr.popupSize,
                        options: [{ label: 'Small', value: 'sm' }, { label: 'Medium', value: 'md' }, { label: 'Large', value: 'lg' }, { label: 'Custom', value: 'custom' }],
                        onChange: function (v) { set({ popupSize: v }); }, __nextHasNoMarginBottom: true
                    }),
                    attr.popupSize === 'custom' && el(RangeControl, {
                        label: __('Custom Width (px)', 'blockenberg'), value: attr.popupWidth, min: 300, max: 1000,
                        onChange: function (v) { set({ popupWidth: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Animation', 'blockenberg'), value: attr.popupAnimation,
                        options: [
                            { label: 'Scale', value: 'scale' },
                            { label: 'Fade', value: 'fade' },
                            { label: 'Slide Up', value: 'slide-up' },
                            { label: 'Slide Right', value: 'slide-right' }
                        ],
                        onChange: function (v) { set({ popupAnimation: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'), value: attr.borderRadius, min: 0, max: 40,
                        onChange: function (v) { set({ borderRadius: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, { label: __('Close on Overlay Click', 'blockenberg'), checked: attr.closeOnOverlay, onChange: function (v) { set({ closeOnOverlay: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Close Button', 'blockenberg'), checked: attr.showCloseBtn, onChange: function (v) { set({ showCloseBtn: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, {
                        label: __('Overlay Opacity (%)', 'blockenberg'), value: attr.overlayOpacity, min: 10, max: 95,
                        onChange: function (v) { set({ overlayOpacity: v }); }, __nextHasNoMarginBottom: true
                    })
                ),
                /* Image */
                el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Image Position', 'blockenberg'), value: attr.imagePosition,
                        options: [{ label: 'Top', value: 'top' }, { label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }, { label: 'None', value: 'none' }],
                        onChange: function (v) { set({ imagePosition: v }); }, __nextHasNoMarginBottom: true
                    }),
                    attr.imagePosition !== 'none' && el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { set({ imageUrl: m.url, imageId: m.id, imageAlt: m.alt || '' }); },
                            allowedTypes: ['image'], value: attr.imageId,
                            render: function (ref) {
                                return el(Fragment, {},
                                    attr.imageUrl && el('img', { src: attr.imageUrl, alt: attr.imageAlt, style: { width: '100%', borderRadius: '8px', marginBottom: '8px' } }),
                                    el(Button, { onClick: ref.open, variant: 'secondary', isSmall: true }, attr.imageUrl ? __('Replace Image', 'blockenberg') : __('Upload Image', 'blockenberg')),
                                    attr.imageUrl && el(Button, { onClick: function () { set({ imageUrl: '', imageId: 0, imageAlt: '' }); }, variant: 'link', isDestructive: true, isSmall: true, style: { marginLeft: '8px' } }, __('Remove', 'blockenberg'))
                                );
                            }
                        })
                    )
                ),
                /* CTA */
                el(PanelBody, { title: __('CTA & Dismiss', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show CTA Button', 'blockenberg'), checked: attr.showCta, onChange: function (v) { set({ showCta: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showCta && el(TextControl, { label: __('CTA Label', 'blockenberg'), value: attr.ctaLabel, onChange: function (v) { set({ ctaLabel: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showCta && el(TextControl, { label: __('CTA URL', 'blockenberg'), value: attr.ctaUrl, onChange: function (v) { set({ ctaUrl: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showCta && el(ToggleControl, { label: __('Open in New Tab', 'blockenberg'), checked: attr.ctaNewTab, onChange: function (v) { set({ ctaNewTab: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showCta && el(SelectControl, {
                        label: __('CTA Style', 'blockenberg'), value: attr.ctaStyle,
                        options: [{ label: 'Filled', value: 'filled' }, { label: 'Outline', value: 'outline' }],
                        onChange: function (v) { set({ ctaStyle: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, { label: __('Show Dismiss Link', 'blockenberg'), checked: attr.showDismiss, onChange: function (v) { set({ showDismiss: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showDismiss && el(TextControl, { label: __('Dismiss Label', 'blockenberg'), value: attr.dismissLabel, onChange: function (v) { set({ dismissLabel: v }); }, __nextHasNoMarginBottom: true })
                ),
                /* Spacing */
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 240, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 240, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                /* Colors */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function () {
                        var TC = getTypoControl();
                        if (!TC) return el('p', null, 'Loading\u2026');
                        return el(Fragment, null,
                            el(TC, { label: 'Heading Typography', value: attr.headingTypo, onChange: function (v) { set({ headingTypo: v }); } }),
                            el(TC, { label: 'Body Typography', value: attr.bodyTypo, onChange: function (v) { set({ bodyTypo: v }); } })
                        );
                    })()
                ),
                                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: attr.triggerBg, onChange: function (v) { set({ triggerBg: v || '#6366f1' }); }, label: __('Trigger Button BG', 'blockenberg') },
                        { value: attr.triggerColor, onChange: function (v) { set({ triggerColor: v || '#ffffff' }); }, label: __('Trigger Button Text', 'blockenberg') },
                        { value: attr.overlayColor, onChange: function (v) { set({ overlayColor: v || '#000000' }); }, label: __('Overlay Color', 'blockenberg') },
                        { value: attr.popupBg, onChange: function (v) { set({ popupBg: v || '#ffffff' }); }, label: __('Popup Background', 'blockenberg') },
                        { value: attr.headingColor, onChange: function (v) { set({ headingColor: v || '#111827' }); }, label: __('Heading', 'blockenberg') },
                        { value: attr.textColor, onChange: function (v) { set({ textColor: v || '#4b5563' }); }, label: __('Body Text', 'blockenberg') },
                        { value: attr.btnBg, onChange: function (v) { set({ btnBg: v || '#6366f1' }); }, label: __('CTA Button BG', 'blockenberg') },
                        { value: attr.btnColor, onChange: function (v) { set({ btnColor: v || '#ffffff' }); }, label: __('CTA Button Text', 'blockenberg') },
                        { value: attr.dismissColor, onChange: function (v) { set({ dismissColor: v || '#9ca3af' }); }, label: __('Dismiss Text', 'blockenberg') }
                    ]
                })
            );

            /* Trigger button styles */
            var triggerPadding = attr.triggerSize === 'sm' ? '10px 20px' : attr.triggerSize === 'lg' ? '18px 40px' : '13px 28px';
            var triggerFontSize = attr.triggerSize === 'sm' ? '14px' : attr.triggerSize === 'lg' ? '18px' : '15px';
            var triggerStyle = {
                padding: triggerPadding,
                fontSize: triggerFontSize,
                fontWeight: '700',
                borderRadius: '8px',
                cursor: 'pointer',
                border: attr.triggerStyle === 'outline' ? ('2px solid ' + attr.triggerBg) : 'none',
                background: attr.triggerStyle === 'filled' ? attr.triggerBg : attr.triggerStyle === 'ghost' ? 'transparent' : 'transparent',
                color: attr.triggerStyle === 'filled' ? attr.triggerColor : attr.triggerBg,
                display: 'inline-block'
            };

            /* Popup width */
            var pwMap = { sm: '400px', md: '560px', lg: '760px', custom: attr.popupWidth + 'px' };
            var pw = pwMap[attr.popupSize] || '560px';

            /* Popup content inner */
            var imgEl = attr.imageUrl && attr.imagePosition !== 'none'
                ? el('img', { src: attr.imageUrl, alt: attr.imageAlt, style: { width: '100%', display: 'block', borderRadius: attr.imagePosition === 'top' ? (attr.borderRadius + 'px ' + attr.borderRadius + 'px 0 0') : '10px', objectFit: 'cover', maxHeight: attr.imagePosition === 'top' ? '200px' : '100%' } })
                : null;

            var popupContentStyle = {
                display: 'flex',
                flexDirection: attr.imagePosition === 'left' || attr.imagePosition === 'right' ? 'row' : 'column',
                background: attr.popupBg,
                borderRadius: attr.borderRadius + 'px',
                overflow: 'hidden',
                maxWidth: pw,
                width: '100%',
                boxShadow: '0 25px 80px rgba(0,0,0,.25)',
                position: 'relative'
            };

            var bodyStyle = { padding: '32px' };

            var ctaBtnStyle = {
                display: 'inline-block',
                padding: '12px 28px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                marginTop: '20px',
                background: attr.ctaStyle === 'filled' ? attr.btnBg : 'transparent',
                color: attr.ctaStyle === 'filled' ? attr.btnColor : attr.btnBg,
                border: attr.ctaStyle === 'outline' ? ('2px solid ' + attr.btnBg) : 'none',
                textDecoration: 'none'
            };

            var popupBody = el('div', { style: bodyStyle },
                el(RichText, {
                    tagName: 'h3', className: 'bkbg-pop-heading', value: attr.heading, onChange: function (v) { set({ heading: v }); },
                    placeholder: __('Popup heading…', 'blockenberg'),
                    style: { color: attr.headingColor, margin: '0 0 12px' }
                }),
                el(RichText, {
                    tagName: 'p', className: 'bkbg-pop-text', value: attr.subtext, onChange: function (v) { set({ subtext: v }); },
                    placeholder: __('Popup body text…', 'blockenberg'),
                    style: { color: attr.textColor, margin: 0 }
                }),
                attr.showCta && el('span', { style: ctaBtnStyle }, attr.ctaLabel),
                attr.showDismiss && el('p', { style: { color: attr.dismissColor, fontSize: '13px', marginTop: '12px', cursor: 'pointer', textDecoration: 'underline' } }, attr.dismissLabel)
            );

            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = { paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px', textAlign: attr.triggerAlign };
                if (_tv) {
                    Object.assign(s, _tv(attr.headingTypo, '--bkbg-pop-hd-'));
                    Object.assign(s, _tv(attr.bodyTypo, '--bkbg-pop-bd-'));
                }
                return { style: s };
            })());

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { style: { display: 'inline-block' } },
                        el('button', { type: 'button', style: triggerStyle, onClick: function () { setOpen(!isOpen); } }, attr.triggerLabel),
                        attr.triggerType !== 'click' && el('div', { style: { fontSize: '12px', color: '#6b7280', marginTop: '6px' } },
                            '⚡ Trigger: ',
                            attr.triggerType === 'scroll' ? ('after ' + attr.scrollDepth + '% scroll') :
                            attr.triggerType === 'delay' ? ('after ' + attr.timeDelay + 's') : 'exit intent'
                        )
                    ),
                    isOpen && el('div', {
                        style: { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: attr.popupPosition === 'drawer-bottom' ? 'flex-end' : 'center', justifyContent: attr.popupPosition === 'drawer-right' ? 'flex-end' : 'center', background: (attr.overlayColor || '#000') + Math.round(attr.overlayOpacity * 255 / 100).toString(16).padStart(2, '0') },
                        onClick: function () { if (attr.closeOnOverlay) setOpen(false); }
                    },
                        el('div', { className: 'bkbg-pop-box', style: popupContentStyle, onClick: function (e) { e.stopPropagation(); } },
                            attr.showCloseBtn && el('button', {
                                type: 'button', onClick: function () { setOpen(false); },
                                style: { position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', fontSize: '22px', color: '#9ca3af', cursor: 'pointer', lineHeight: 1, zIndex: 1 }
                            }, '×'),
                            imgEl && attr.imagePosition === 'top' && imgEl,
                            el('div', { style: { display: 'flex', flex: 1 } },
                                imgEl && attr.imagePosition === 'left' && el('div', { style: { width: '45%', flexShrink: 0 } }, imgEl),
                                popupBody,
                                imgEl && attr.imagePosition === 'right' && el('div', { style: { width: '45%', flexShrink: 0 } }, imgEl)
                            )
                        )
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-pop-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        },

        deprecated: [{
            attributes: {
                triggerLabel:{type:'string',default:'Open Popup'},triggerStyle:{type:'string',default:'filled'},triggerSize:{type:'string',default:'md'},triggerAlign:{type:'string',default:'center'},triggerType:{type:'string',default:'click'},scrollDepth:{type:'number',default:40},timeDelay:{type:'number',default:3},showOnce:{type:'string',default:'always'},popupPosition:{type:'string',default:'center'},popupSize:{type:'string',default:'md'},popupWidth:{type:'number',default:560},popupAnimation:{type:'string',default:'scale'},borderRadius:{type:'number',default:16},closeOnOverlay:{type:'boolean',default:true},showCloseBtn:{type:'boolean',default:true},imageUrl:{type:'string',default:''},imageId:{type:'number',default:0},imageAlt:{type:'string',default:''},imagePosition:{type:'string',default:'top'},heading:{type:'string',default:'Get 20% Off Today'},subtext:{type:'string',default:'Subscribe to our newsletter and get your exclusive discount code instantly.'},ctaLabel:{type:'string',default:'Claim Your Discount'},ctaUrl:{type:'string',default:'#'},ctaNewTab:{type:'boolean',default:false},showCta:{type:'boolean',default:true},ctaStyle:{type:'string',default:'filled'},dismissLabel:{type:'string',default:'No thanks'},showDismiss:{type:'boolean',default:true},paddingTop:{type:'number',default:0},paddingBottom:{type:'number',default:0},overlayColor:{type:'string',default:'#000000'},overlayOpacity:{type:'number',default:60},popupBg:{type:'string',default:'#ffffff'},headingColor:{type:'string',default:'#111827'},textColor:{type:'string',default:'#4b5563'},btnBg:{type:'string',default:'#6366f1'},btnColor:{type:'string',default:'#ffffff'},triggerBg:{type:'string',default:'#6366f1'},triggerColor:{type:'string',default:'#ffffff'},dismissColor:{type:'string',default:'#9ca3af'},headingFontSize:{type:'number',default:22},headingFontWeight:{type:'string',default:'800'},headingLineHeight:{type:'number',default:1.3},bodyFontSize:{type:'number',default:15},bodyLineHeight:{type:'number',default:1.6}
            },
            save: function (props) {
                return wp.element.createElement('div', wp.blockEditor.useBlockProps.save(),
                    wp.element.createElement('div', { className: 'bkbg-pop-app', 'data-opts': JSON.stringify(props.attributes) })
                );
            }
        }]
    });
}() );
