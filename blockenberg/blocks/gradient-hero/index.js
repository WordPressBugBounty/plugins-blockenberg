( function () {
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var ToggleControl = wp.components.ToggleControl;
    var TextControl = wp.components.TextControl;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var Fragment = wp.element.Fragment;
    var Button = wp.components.Button;

    /* ── typography lazy-getters ── */
    function _tc() { return window.bkbgTypographyControl || null; }
    function _tv() { return window.bkbgTypoCssVars || function () { return {}; }; }

    function wrapStyle(a) {
        return Object.assign({
            '--bkbg-gh-pt': a.paddingTop + 'px',
            '--bkbg-gh-pb': a.paddingBottom + 'px',
            '--bkbg-gh-bg': a.bgColor,
            '--bkbg-gh-color-a': a.colorA,
            '--bkbg-gh-color-b': a.colorB,
            '--bkbg-gh-color-c': a.colorC,
            '--bkbg-gh-text': a.textColor,
            '--bkbg-gh-sub-c': a.subColor,
            '--bkbg-gh-badge-bg': a.badgeBg,
            '--bkbg-gh-badge-color': a.badgeColor,
            '--bkbg-gh-btn-bg': a.btnBg,
            '--bkbg-gh-btn-text': a.btnText,
            '--bkbg-gh-btn2-bg': a.btn2Bg,
            '--bkbg-gh-btn2-text': a.btn2Text,
            '--bkbg-gh-proof': a.proofColor,
            '--bkbg-gh-proof-hl': a.proofHighlight,
            '--bkbg-gh-cta-sz': a.ctaSize + 'px',
            '--bkbg-gh-cta-r': a.ctaRadius + 'px',
            '--bkbg-gh-max-w': a.maxWidth + 'px',
        }, _tv()(a.typoHeading, '--bkbg-gh-hl-'), _tv()(a.typoSub, '--bkbg-gh-sub-'), _tv()(a.typoBadge, '--bkbg-gh-bg-'));
    }

    registerBlockType('blockenberg/gradient-hero', {
        title: __('Gradient Hero', 'blockenberg'),
        icon: 'cover-image',
        category: 'bkbg-layout',

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var styleOptions = [
                { label: __('Mesh Gradient', 'blockenberg'), value: 'mesh' },
                { label: __('Linear Gradient', 'blockenberg'), value: 'gradient' },
                { label: __('Solid', 'blockenberg'), value: 'solid' },
                { label: __('Aurora', 'blockenberg'), value: 'aurora' },
            ];
            var alignOptions = [
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Left', 'blockenberg'), value: 'left' },
            ];
            var weightOptions = [
                { label: '700', value: 700 },
                { label: '800', value: 800 },
                { label: '900', value: 900 },
            ];

            // Build avatar images
            function renderAvatars(avatars) {
                return el('div', { className: 'bkbg-gh-avatars' },
                    (avatars || []).map(function (av, i) {
                        return av.imageUrl
                            ? el('img', { key: i, className: 'bkbg-gh-avatar', src: av.imageUrl, alt: av.imageAlt || '', style: { marginLeft: i > 0 ? '-8px' : '0' } })
                            : el('span', { key: i, className: 'bkbg-gh-avatar bkbg-gh-avatar--empty', style: { marginLeft: i > 0 ? '-8px' : '0' } });
                    })
                );
            }

            var blockProps = useBlockProps({
                className: 'bkbg-gh-wrap bkbg-gh-style--' + a.style + ' bkbg-gh-align--' + a.contentAlign,
                style: wrapStyle(a)
            });

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Badge', 'blockenberg'),
                        checked: a.showBadge,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showBadge: v }); }
                    }),
                    a.showBadge && el(TextControl, {
                        label: __('Badge Text', 'blockenberg'),
                        value: a.badge,
                        onChange: function (v) { set({ badge: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Subheading', 'blockenberg'),
                        checked: a.showSubheading,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSubheading: v }); }
                    }),
                    el('p', { className: 'components-base-control__label' }, __('Primary CTA', 'blockenberg')),
                    el(TextControl, {
                        label: __('Button Text', 'blockenberg'),
                        value: a.ctaText,
                        onChange: function (v) { set({ ctaText: v }); }
                    }),
                    el(TextControl, {
                        label: __('Button URL', 'blockenberg'),
                        value: a.ctaUrl,
                        onChange: function (v) { set({ ctaUrl: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Secondary CTA', 'blockenberg'),
                        checked: a.showSecondaryCta,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSecondaryCta: v }); }
                    }),
                    a.showSecondaryCta && el(TextControl, {
                        label: __('Secondary Text', 'blockenberg'),
                        value: a.ctaSecondaryText,
                        onChange: function (v) { set({ ctaSecondaryText: v }); }
                    }),
                    a.showSecondaryCta && el(TextControl, {
                        label: __('Secondary URL', 'blockenberg'),
                        value: a.ctaSecondaryUrl,
                        onChange: function (v) { set({ ctaSecondaryUrl: v }); }
                    })
                ),
                el(PanelBody, { title: __('Social Proof', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Social Proof', 'blockenberg'),
                        checked: a.showSocialProof,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSocialProof: v }); }
                    }),
                    a.showSocialProof && el(TextControl, {
                        label: __('Proof Text', 'blockenberg'),
                        value: a.socialProofText,
                        onChange: function (v) { set({ socialProofText: v }); }
                    }),
                    a.showSocialProof && el('div', { style: { marginTop: '8px' } },
                        el('p', { style: { margin: '0 0 8px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' } }, __('Avatars', 'blockenberg')),
                        (a.avatars || []).map(function (av, i) {
                            return el(PanelBody, { key: i, title: __('Avatar', 'blockenberg') + ' ' + (i + 1), initialOpen: false, style: { borderTop: '1px solid #e0e0e0' } },
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (m) {
                                            var next = (a.avatars || []).map(function (x, j) {
                                                return j === i ? { imageUrl: m.url, imageId: m.id, imageAlt: m.alt || '' } : x;
                                            });
                                            set({ avatars: next });
                                        },
                                        allowedTypes: ['image'],
                                        value: av.imageId,
                                        render: function (r) {
                                            return el(Fragment, null,
                                                av.imageUrl && el('img', { src: av.imageUrl, style: { width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', display: 'block', marginBottom: '6px', border: '2px solid #6c3fb5' } }),
                                                el(Button, { onClick: r.open, variant: 'secondary', style: { width: '100%', marginBottom: av.imageUrl ? '4px' : '0' } },
                                                    av.imageUrl ? __('Change image', 'blockenberg') : __('Select image', 'blockenberg')
                                                ),
                                                av.imageUrl && el(Button, {
                                                    onClick: function () {
                                                        var next = (a.avatars || []).map(function (x, j) {
                                                            return j === i ? { imageUrl: '', imageId: 0, imageAlt: '' } : x;
                                                        });
                                                        set({ avatars: next });
                                                    },
                                                    variant: 'link', isDestructive: true, style: { width: '100%' }
                                                }, __('Remove', 'blockenberg'))
                                            );
                                        }
                                    })
                                )
                            );
                        }),
                        el(Button, {
                            variant: 'secondary',
                            style: { width: '100%', marginTop: '8px' },
                            onClick: function () { set({ avatars: (a.avatars || []).concat([{ imageUrl: '', imageId: 0, imageAlt: '' }]) }); },
                            disabled: (a.avatars || []).length >= 8
                        }, __('+ Add avatar', 'blockenberg')),
                        (a.avatars || []).length > 1 && el(Button, {
                            variant: 'link', isDestructive: true,
                            style: { width: '100%', marginTop: '4px' },
                            onClick: function () { set({ avatars: (a.avatars || []).slice(0, -1) }); }
                        }, __('− Remove last', 'blockenberg'))
                    )
                ),
                el(PanelBody, { title: __('Background Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Background Style', 'blockenberg'),
                        value: a.style,
                        options: styleOptions,
                        onChange: function (v) { set({ style: v }); }
                    })
                ),
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Content Alignment', 'blockenberg'),
                        value: a.contentAlign,
                        options: alignOptions,
                        onChange: function (v) { set({ contentAlign: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Content Width (px)', 'blockenberg'),
                        value: a.maxWidth,
                        onChange: function (v) { set({ maxWidth: v }); },
                        min: 480,
                        max: 1200,
                        step: 20
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: a.paddingTop,
                        onChange: function (v) { set({ paddingTop: v }); },
                        min: 0,
                        max: 240
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: a.paddingBottom,
                        onChange: function (v) { set({ paddingBottom: v }); },
                        min: 0,
                        max: 240
                    }),
                    el(RangeControl, {
                        label: __('Button Radius (px)', 'blockenberg'),
                        value: a.ctaRadius,
                        onChange: function (v) { set({ ctaRadius: v }); },
                        min: 0,
                        max: 40
                    })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label:__('Heading','blockenberg'), value:a.typoHeading, onChange:function(v){ set({typoHeading:v}); } }),
                    _tc() && el(_tc(), { label:__('Subheading','blockenberg'), value:a.typoSub, onChange:function(v){ set({typoSub:v}); } }),
                    _tc() && el(_tc(), { label:__('Badge','blockenberg'), value:a.typoBadge, onChange:function(v){ set({typoBadge:v}); } }),
                    el(RangeControl, {
                        label: __('CTA Button Size (px)', 'blockenberg'),
                        value: a.ctaSize,
                        onChange: function (v) { set({ ctaSize: v }); },
                        min: 13,
                        max: 22
                    })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#0f172a' }); } },
                        { label: __('Gradient Color A', 'blockenberg'), value: a.colorA, onChange: function (v) { set({ colorA: v || '#6c3fb5' }); } },
                        { label: __('Gradient Color B', 'blockenberg'), value: a.colorB, onChange: function (v) { set({ colorB: v || '#3b82f6' }); } },
                        { label: __('Gradient Color C', 'blockenberg'), value: a.colorC, onChange: function (v) { set({ colorC: v || '#ec4899' }); } },
                        { label: __('Heading Text', 'blockenberg'), value: a.textColor, onChange: function (v) { set({ textColor: v || '#ffffff' }); } },
                        { label: __('Subheading Text', 'blockenberg'), value: a.subColor, onChange: function (v) { set({ subColor: v || 'rgba(255,255,255,0.65)' }); } },
                        { label: __('Badge Background', 'blockenberg'), value: a.badgeBg, onChange: function (v) { set({ badgeBg: v || 'rgba(108,63,181,0.18)' }); } },
                        { label: __('Badge Text', 'blockenberg'), value: a.badgeColor, onChange: function (v) { set({ badgeColor: v || '#c4b5fd' }); } },
                        { label: __('Primary Button', 'blockenberg'), value: a.btnBg, onChange: function (v) { set({ btnBg: v || '#6c3fb5' }); } },
                        { label: __('Primary Button Text', 'blockenberg'), value: a.btnText, onChange: function (v) { set({ btnText: v || '#ffffff' }); } },
                        { label: __('Secondary Button', 'blockenberg'), value: a.btn2Bg, onChange: function (v) { set({ btn2Bg: v || 'rgba(255,255,255,0.08)' }); } },
                        { label: __('Secondary Button Text', 'blockenberg'), value: a.btn2Text, onChange: function (v) { set({ btn2Text: v || '#ffffff' }); } },
                    ]
                })
            );

            var canvas = el('div', blockProps,
                el('div', { className: 'bkbg-gh-bg-layer' }),
                el('div', { className: 'bkbg-gh-content' },
                    a.showBadge && a.badge && el('div', { className: 'bkbg-gh-badge' },
                        el('span', { className: 'bkbg-gh-badge-text' }, a.badge)
                    ),
                    el(RichText, {
                        tagName: 'h1',
                        className: 'bkbg-gh-heading',
                        value: a.heading,
                        onChange: function (v) { set({ heading: v }); },
                        placeholder: __('Enter headline…', 'blockenberg'),
                        allowedFormats: ['core/bold', 'core/italic']
                    }),
                    a.showSubheading && el(RichText, {
                        tagName: 'p',
                        className: 'bkbg-gh-sub',
                        value: a.subheading,
                        onChange: function (v) { set({ subheading: v }); },
                        placeholder: __('Enter subheading…', 'blockenberg'),
                        allowedFormats: ['core/bold', 'core/italic']
                    }),
                    el('div', { className: 'bkbg-gh-ctas' },
                        el('a', { className: 'bkbg-gh-btn bkbg-gh-btn--primary', href: '#', onClick: function (e) { e.preventDefault(); } }, a.ctaText),
                        a.showSecondaryCta && el('a', { className: 'bkbg-gh-btn bkbg-gh-btn--secondary', href: '#', onClick: function (e) { e.preventDefault(); } },
                            el('span', { className: 'bkbg-gh-play-icon' }, '▷'),
                            el('span', {}, a.ctaSecondaryText)
                        )
                    ),
                    a.showSocialProof && el('div', { className: 'bkbg-gh-proof' },
                        renderAvatars(a.avatars),
                        el('span', { className: 'bkbg-gh-proof-text' }, a.socialProofText)
                    )
                )
            );

            return el('div', {}, inspector, canvas);
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save({
                className: 'bkbg-gh-wrap bkbg-gh-style--' + a.style + ' bkbg-gh-align--' + a.contentAlign,
                style: Object.assign({
                    '--bkbg-gh-pt': a.paddingTop + 'px',
                    '--bkbg-gh-pb': a.paddingBottom + 'px',
                    '--bkbg-gh-bg': a.bgColor,
                    '--bkbg-gh-color-a': a.colorA,
                    '--bkbg-gh-color-b': a.colorB,
                    '--bkbg-gh-color-c': a.colorC,
                    '--bkbg-gh-text': a.textColor,
                    '--bkbg-gh-sub-c': a.subColor,
                    '--bkbg-gh-badge-bg': a.badgeBg,
                    '--bkbg-gh-badge-color': a.badgeColor,
                    '--bkbg-gh-btn-bg': a.btnBg,
                    '--bkbg-gh-btn-text': a.btnText,
                    '--bkbg-gh-btn2-bg': a.btn2Bg,
                    '--bkbg-gh-btn2-text': a.btn2Text,
                    '--bkbg-gh-proof': a.proofColor,
                    '--bkbg-gh-proof-hl': a.proofHighlight,
                    '--bkbg-gh-cta-sz': a.ctaSize + 'px',
                    '--bkbg-gh-cta-r': a.ctaRadius + 'px',
                    '--bkbg-gh-max-w': a.maxWidth + 'px',
                }, _tv()(a.typoHeading, '--bkbg-gh-hl-'), _tv()(a.typoSub, '--bkbg-gh-sub-'), _tv()(a.typoBadge, '--bkbg-gh-bg-'))
            });

            function saveAvatars(avatars) {
                return el('div', { className: 'bkbg-gh-avatars' },
                    (avatars || []).map(function (av, i) {
                        return av.imageUrl
                            ? el('img', { key: i, className: 'bkbg-gh-avatar', src: av.imageUrl, alt: av.imageAlt || '', style: { marginLeft: i > 0 ? '-8px' : '0' } })
                            : el('span', { key: i, className: 'bkbg-gh-avatar bkbg-gh-avatar--empty', style: { marginLeft: i > 0 ? '-8px' : '0' } });
                    })
                );
            }

            return el('div', blockProps,
                el('div', { className: 'bkbg-gh-bg-layer' }),
                el('div', { className: 'bkbg-gh-content' },
                    a.showBadge && a.badge && el('div', { className: 'bkbg-gh-badge' },
                        el('span', { className: 'bkbg-gh-badge-text' }, a.badge)
                    ),
                    el(RichText.Content, { tagName: 'h1', className: 'bkbg-gh-heading', value: a.heading }),
                    a.showSubheading && el(RichText.Content, { tagName: 'p', className: 'bkbg-gh-sub', value: a.subheading }),
                    el('div', { className: 'bkbg-gh-ctas' },
                        el('a', { className: 'bkbg-gh-btn bkbg-gh-btn--primary', href: a.ctaUrl }, a.ctaText),
                        a.showSecondaryCta && el('a', { className: 'bkbg-gh-btn bkbg-gh-btn--secondary', href: a.ctaSecondaryUrl },
                            el('span', { className: 'bkbg-gh-play-icon' }, '▷'),
                            el('span', {}, a.ctaSecondaryText)
                        )
                    ),
                    a.showSocialProof && el('div', { className: 'bkbg-gh-proof' },
                        saveAvatars(a.avatars),
                        el('span', { className: 'bkbg-gh-proof-text' }, a.socialProofText)
                    )
                )
            );
        }
    });
}() );
