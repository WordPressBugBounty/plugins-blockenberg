( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var LAYOUT_OPTIONS = [
        { label: __('Masonry', 'blockenberg'), value: 'masonry' },
        { label: __('Grid',    'blockenberg'), value: 'grid' },
        { label: __('Scatter', 'blockenberg'), value: 'scatter' },
    ];
    var CARD_STYLE_OPTIONS = [
        { label: __('Shadow',   'blockenberg'), value: 'shadow' },
        { label: __('Plain',    'blockenberg'), value: 'plain' },
        { label: __('Bordered', 'blockenberg'), value: 'bordered' },
    ];
    var PLATFORM_OPTIONS = [
        { label: __('Google',   'blockenberg'), value: 'google' },
        { label: __('G2',       'blockenberg'), value: 'g2' },
        { label: __('Capterra', 'blockenberg'), value: 'capterra' },
        { label: __('Twitter',  'blockenberg'), value: 'twitter' },
        { label: __('X / Twitter', 'blockenberg'), value: 'x' },
        { label: __('Trustpilot', 'blockenberg'), value: 'trustpilot' },
        { label: __('None',     'blockenberg'), value: 'none' },
    ];
    var PLATFORM_COLORS = { google: '#4285f4', g2: '#FF492C', capterra: '#FF3D2E', twitter: '#000', x: '#000', trustpilot: '#00b67a', none: '#6b7280' };
    var PLATFORM_LABELS = { google: 'Google', g2: 'G2', capterra: 'Capterra', twitter: 'Twitter', x: 'X', trustpilot: 'Trustpilot', none: '' };

    function makeId() { return 'tw' + Math.random().toString(36).substr(2, 6); }

    function renderStarsSvg(rating, size, color) {
        var stars = [];
        for (var i = 1; i <= 5; i++) {
            var filled = i <= rating;
            stars.push(
                el('svg', { key: i, width: size, height: size, viewBox: '0 0 24 24', style: { display: 'inline-block', marginRight: '2px' } },
                    el('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2', fill: filled ? color : 'none', stroke: color, strokeWidth: '1.5' })
                )
            );
        }
        return el('div', { style: { display: 'flex', alignItems: 'center' } }, stars);
    }

    function PlatformBadge(props) {
        var platform = props.platform;
        var size = props.size || 13;
        if (platform === 'none' || !platform) return null;
        return el('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: size + 'px', fontWeight: 700, color: PLATFORM_COLORS[platform] || '#6b7280' } },
            PLATFORM_LABELS[platform] || platform
        );
    }

    function TestimonialCard(props) {
        var item = props.item;
        var a = props.a;
        var cardStyle = {
            background: item.cardBg || a.globalCardBg || '#fff',
            borderRadius: a.cardRadius + 'px',
            padding: a.cardPadding + 'px',
            borderTop: item.featured ? '4px solid ' + a.featuredAccent : undefined,
            boxShadow: a.cardStyle === 'shadow' ? '0 4px 24px rgba(0,0,0,0.08)' : undefined,
            border: a.cardStyle === 'bordered' ? '1px solid #e5e7eb' : undefined,
            marginBottom: a.layout === 'masonry' ? a.gap + 'px' : undefined,
            breakInside: 'avoid',
        };
        return el('div', { className: 'bkbg-tw-card' + (item.featured ? ' bkbg-tw-card--featured' : ''), style: cardStyle },
            a.showQuoteMark && el('div', { style: { fontSize: a.quoteMarkSize + 'px', lineHeight: 1, color: a.featuredAccent, marginBottom: '8px', opacity: 0.25, fontFamily: 'Georgia, serif' } }, '\u201C'),
            a.showRating && el('div', { style: { marginBottom: '10px' } }, renderStarsSvg(item.rating, a.starSize, a.starColor)),
            el('p', { className: 'bkbg-tw-quote', style: { color: a.quoteColor, margin: '0 0 16px' } }, item.quote),
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
                a.showAvatar && item.avatarUrl && el('img', { src: item.avatarUrl, alt: item.author, style: { width: a.avatarSize + 'px', height: a.avatarSize + 'px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 } }),
                a.showAvatar && !item.avatarUrl && el('div', { style: { width: a.avatarSize + 'px', height: a.avatarSize + 'px', borderRadius: '50%', background: a.featuredAccent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: (a.avatarSize * 0.4) + 'px', color: a.featuredAccent, fontWeight: 700, flexShrink: 0 } }, (item.author || '?').charAt(0).toUpperCase()),
                el('div', null,
                    el('p', { className: 'bkbg-tw-author-name', style: { margin: '0 0 2px', color: a.authorColor } }, item.author),
                    (item.role || item.company) && el('p', { className: 'bkbg-tw-role', style: { margin: '0', color: a.roleColor } }, [item.role, a.showCompany && item.company].filter(Boolean).join(' · ')),
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' } },
                        a.showPlatform && el(PlatformBadge, { platform: item.platform, size: a.authorSize - 1 }),
                        a.showDate && item.date && el('span', { style: { fontSize: (a.roleSize - 1) + 'px', color: '#9ca3af' } }, item.date)
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/testimonial-wall', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined };
                if (_tvf) { Object.assign(s, _tvf(a.quoteTypo, '--bktw-qt-'), _tvf(a.nameTypo, '--bktw-nm-'), _tvf(a.roleTypo, '--bktw-rl-')); }
                return { style: s };
            })());

            function setItem(id, patch) {
                setAttributes({ items: a.items.map(function (it) { return it.id === id ? Object.assign({}, it, patch) : it; }) });
            }
            function addItem() {
                setAttributes({ items: a.items.concat([{ id: makeId(), quote: 'Great product! Highly recommend.', author: 'New Customer', role: 'Customer', company: '', avatarUrl: '', avatarId: 0, rating: 5, platform: 'google', date: '', featured: false, cardBg: '' }]) });
            }
            function removeItem(id) {
                if (a.items.length <= 1) return;
                setAttributes({ items: a.items.filter(function (it) { return it.id !== id; }) });
            }

            var wrapStyle = a.layout === 'masonry'
                ? { columnCount: a.columns, columnGap: a.gap + 'px' }
                : { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Layout style', 'blockenberg'), value: a.layout, options: LAYOUT_OPTIONS, onChange: function (v) { setAttributes({ layout: v }); } }),
                        el(RangeControl, { label: __('Columns', 'blockenberg'), value: a.columns, min: 1, max: 5, onChange: function (v) { setAttributes({ columns: v }); } }),
                        el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: a.gap, min: 8, max: 80, onChange: function (v) { setAttributes({ gap: v }); } }),
                        el(SelectControl, { label: __('Card style', 'blockenberg'), value: a.cardStyle, options: CARD_STYLE_OPTIONS, onChange: function (v) { setAttributes({ cardStyle: v }); } }),
                        el(RangeControl, { label: __('Card border radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 40, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                        el(RangeControl, { label: __('Card padding (px)', 'blockenberg'), value: a.cardPadding, min: 8, max: 64, onChange: function (v) { setAttributes({ cardPadding: v }); } })
                    ),
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show star rating', 'blockenberg'), checked: a.showRating, onChange: function (v) { setAttributes({ showRating: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show platform badge', 'blockenberg'), checked: a.showPlatform, onChange: function (v) { setAttributes({ showPlatform: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show date', 'blockenberg'), checked: a.showDate, onChange: function (v) { setAttributes({ showDate: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show avatar', 'blockenberg'), checked: a.showAvatar, onChange: function (v) { setAttributes({ showAvatar: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show company', 'blockenberg'), checked: a.showCompany, onChange: function (v) { setAttributes({ showCompany: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show opening quote mark', 'blockenberg'), checked: a.showQuoteMark, onChange: function (v) { setAttributes({ showQuoteMark: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Star size (px)', 'blockenberg'), value: a.starSize, min: 10, max: 24, onChange: function (v) { setAttributes({ starSize: v }); } }),
                        el(RangeControl, { label: __('Quote mark size (px)', 'blockenberg'), value: a.quoteMarkSize, min: 32, max: 120, onChange: function (v) { setAttributes({ quoteMarkSize: v }); } }),
                        el(RangeControl, { label: __('Avatar size (px)', 'blockenberg'), value: a.avatarSize, min: 28, max: 80, onChange: function (v) { setAttributes({ avatarSize: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Quote', 'blockenberg'), value: a.quoteTypo, onChange: function (v) { setAttributes({ quoteTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Author Name', 'blockenberg'), value: a.nameTypo, onChange: function (v) { setAttributes({ nameTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Role / Company', 'blockenberg'), value: a.roleTypo, onChange: function (v) { setAttributes({ roleTypo: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.featuredAccent, onChange: function (v) { setAttributes({ featuredAccent: v || '' }); }, label: __('Featured accent', 'blockenberg') },
                            { value: a.starColor,      onChange: function (v) { setAttributes({ starColor: v || '' }); },      label: __('Stars', 'blockenberg') },
                            { value: a.globalCardBg,   onChange: function (v) { setAttributes({ globalCardBg: v || '' }); },   label: __('Card background (global)', 'blockenberg') },
                            { value: a.quoteColor,     onChange: function (v) { setAttributes({ quoteColor: v || '' }); },     label: __('Quote text', 'blockenberg') },
                            { value: a.authorColor,    onChange: function (v) { setAttributes({ authorColor: v || '' }); },    label: __('Author name', 'blockenberg') },
                            { value: a.roleColor,      onChange: function (v) { setAttributes({ roleColor: v || '' }); },      label: __('Role / company', 'blockenberg') },
                            { value: a.bgColor,        onChange: function (v) { setAttributes({ bgColor: v || '' }); },        label: __('Section background', 'blockenberg') },
                        ]
                    }),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Testimonials', 'blockenberg'), initialOpen: false },
                        a.items.map(function (item, idx) {
                            return el(PanelBody, { key: item.id, title: (item.author || __('Testimonial', 'blockenberg') + ' ' + (idx + 1)), initialOpen: false },
                                el(TextareaControl, { label: __('Quote', 'blockenberg'), value: item.quote, onChange: function (v) { setItem(item.id, { quote: v }); } }),
                                el(TextControl, { label: __('Author name', 'blockenberg'), value: item.author, onChange: function (v) { setItem(item.id, { author: v }); } }),
                                el(TextControl, { label: __('Role', 'blockenberg'), value: item.role, onChange: function (v) { setItem(item.id, { role: v }); } }),
                                el(TextControl, { label: __('Company', 'blockenberg'), value: item.company, onChange: function (v) { setItem(item.id, { company: v }); } }),
                                el(RangeControl, { label: __('Star rating', 'blockenberg'), value: item.rating, min: 1, max: 5, onChange: function (v) { setItem(item.id, { rating: v }); } }),
                                el(SelectControl, { label: __('Platform', 'blockenberg'), value: item.platform, options: PLATFORM_OPTIONS, onChange: function (v) { setItem(item.id, { platform: v }); } }),
                                el(TextControl, { label: __('Date', 'blockenberg'), value: item.date, onChange: function (v) { setItem(item.id, { date: v }); } }),
                                el(ToggleControl, { label: __('Featured (accent top border)', 'blockenberg'), checked: item.featured, onChange: function (v) { setItem(item.id, { featured: v }); }, __nextHasNoMarginBottom: true }),
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (media) { setItem(item.id, { avatarUrl: media.url, avatarId: media.id }); },
                                        allowedTypes: ['image'],
                                        value: item.avatarId,
                                        render: function (p) {
                                            return el('div', { style: { marginBottom: '8px' } },
                                                item.avatarUrl && el('img', { src: item.avatarUrl, alt: '', style: { width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', marginBottom: '4px', display: 'block' } }),
                                                el(Button, { onClick: p.open, variant: item.avatarUrl ? 'secondary' : 'primary', size: 'compact' }, item.avatarUrl ? __('Replace avatar', 'blockenberg') : __('Upload avatar', 'blockenberg'))
                                            );
                                        }
                                    })
                                ),
                                a.items.length > 1 && el(Button, { onClick: function () { removeItem(item.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, __('Remove', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: addItem, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Testimonial', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-tw bkbg-tw--' + a.layout, style: wrapStyle },
                        a.items.map(function (item) {
                            return el(TestimonialCard, { key: item.id, item: item, a: a });
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tvf = getTypoCssVars();
            var PLATFORM_COLORS = { google: '#4285f4', g2: '#FF492C', capterra: '#FF3D2E', twitter: '#000', x: '#000', trustpilot: '#00b67a', none: '#6b7280' };
            var PLATFORM_LABELS = { google: 'Google', g2: 'G2', capterra: 'Capterra', twitter: 'Twitter', x: 'X', trustpilot: 'Trustpilot', none: '' };
            var wrapStyle = a.layout === 'masonry'
                ? { columnCount: a.columns, columnGap: a.gap + 'px' }
                : { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' };

            return el('div', (function () {
                var s = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined };
                if (_tvf) { Object.assign(s, _tvf(a.quoteTypo, '--bktw-qt-'), _tvf(a.nameTypo, '--bktw-nm-'), _tvf(a.roleTypo, '--bktw-rl-')); }
                return wp.blockEditor.useBlockProps.save({ className: 'bkbg-testimonial-wall-wrap', style: s });
            })(),
                el('div', { className: 'bkbg-tw bkbg-tw--' + a.layout, style: wrapStyle },
                    a.items.map(function (item) {
                        var cardStyle = {
                            background: item.cardBg || a.globalCardBg || '#fff',
                            borderRadius: a.cardRadius + 'px',
                            padding: a.cardPadding + 'px',
                            borderTop: item.featured ? '4px solid ' + a.featuredAccent : undefined,
                            boxShadow: a.cardStyle === 'shadow' ? '0 4px 24px rgba(0,0,0,0.08)' : undefined,
                            border: a.cardStyle === 'bordered' ? '1px solid #e5e7eb' : undefined,
                            marginBottom: a.layout === 'masonry' ? a.gap + 'px' : undefined,
                            breakInside: 'avoid',
                        };
                        return el('div', { key: item.id, className: 'bkbg-tw-card' + (item.featured ? ' bkbg-tw-card--featured' : ''), style: cardStyle },
                            a.showQuoteMark && el('div', { style: { fontSize: a.quoteMarkSize + 'px', lineHeight: 1, color: a.featuredAccent, marginBottom: '8px', opacity: 0.25, fontFamily: 'Georgia, serif' } }, '\u201C'),
                            a.showRating && el('div', { style: { marginBottom: '10px', display: 'flex', alignItems: 'center' } },
                                Array.from({ length: 5 }).map(function (_, i) {
                                    return el('svg', { key: i, width: a.starSize, height: a.starSize, viewBox: '0 0 24 24', style: { display: 'inline-block', marginRight: '2px' } },
                                        el('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2', fill: i < item.rating ? a.starColor : 'none', stroke: a.starColor, strokeWidth: '1.5' })
                                    );
                                })
                            ),
                            el('p', { className: 'bkbg-tw-quote', style: { color: a.quoteColor, margin: '0 0 16px' } }, item.quote),
                            el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
                                a.showAvatar && item.avatarUrl && el('img', { src: item.avatarUrl, alt: item.author, style: { width: a.avatarSize + 'px', height: a.avatarSize + 'px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 } }),
                                a.showAvatar && !item.avatarUrl && el('div', { style: { width: a.avatarSize + 'px', height: a.avatarSize + 'px', borderRadius: '50%', background: a.featuredAccent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: (a.avatarSize * 0.4) + 'px', color: a.featuredAccent, fontWeight: 700, flexShrink: 0 } }, (item.author || '?').charAt(0).toUpperCase()),
                                el('div', null,
                                    el('p', { className: 'bkbg-tw-author-name', style: { margin: '0 0 2px', color: a.authorColor } }, item.author),
                                    (item.role || item.company) && el('p', { className: 'bkbg-tw-role', style: { margin: 0, color: a.roleColor } }, [item.role, a.showCompany && item.company].filter(Boolean).join(' \u00B7 ')),
                                    el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' } },
                                        a.showPlatform && item.platform && item.platform !== 'none' && el('span', { style: { fontWeight: 700, color: PLATFORM_COLORS[item.platform] || '#6b7280' } }, PLATFORM_LABELS[item.platform] || item.platform),
                                        a.showDate && item.date && el('span', { style: { color: '#9ca3af' } }, item.date)
                                    )
                                )
                            )
                        );
                    })
                )
            );
        }
    });
}() );
