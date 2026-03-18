( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/testimonial-inline', {
        title: __('Testimonial Card', 'blockenberg'),
        icon: 'format-quote',
        category: 'bkbg-marketing',

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            function wrapStyle(a) {
                var _tvf = getTypoCssVars();
                var s = {
                    '--bkbg-ti-bg': a.bgColor,
                    '--bkbg-ti-quote-c': a.quoteColor,
                    '--bkbg-ti-name-c': a.nameColor,
                    '--bkbg-ti-role-c': a.roleColor,
                    '--bkbg-ti-star-c': a.starColor,
                    '--bkbg-ti-star-sz': a.starSize + 'px',
                    '--bkbg-ti-accent': a.accentColor,
                    '--bkbg-ti-border': a.borderColor,
                    '--bkbg-ti-qm-c': a.quoteMarkColor,
                    '--bkbg-ti-photo-sz': a.photoSize + 'px',
                    '--bkbg-ti-r': a.borderRadius + 'px',
                    '--bkbg-ti-pad': a.cardPadding + 'px',
                    '--bkbg-ti-max-w': a.maxWidth + 'px',
                };
                if (_tvf) {
                    Object.assign(s, _tvf(a.quoteTypo, '--bkti-qt-'));
                    Object.assign(s, _tvf(a.nameTypo, '--bkti-nm-'));
                    Object.assign(s, _tvf(a.roleTypo, '--bkti-rl-'));
                }
                return s;
            }

            var styleOptions = [
                { label: __('Card (white)', 'blockenberg'), value: 'card' },
                { label: __('Minimal (no bg)', 'blockenberg'), value: 'minimal' },
                { label: __('Bubble (speech)', 'blockenberg'), value: 'bubble' },
                { label: __('Accent Left Border', 'blockenberg'), value: 'accent' },
                { label: __('Dark', 'blockenberg'), value: 'dark' },
            ];

            var alignOptions = [
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right', 'blockenberg'), value: 'right' },
            ];

            var platformOptions = [
                { label: __('None', 'blockenberg'), value: 'none' },
                { label: __('Google', 'blockenberg'), value: 'google' },
                { label: __('Trustpilot', 'blockenberg'), value: 'trustpilot' },
                { label: __('G2', 'blockenberg'), value: 'g2' },
                { label: __('Capterra', 'blockenberg'), value: 'capterra' },
                { label: __('Yelp', 'blockenberg'), value: 'yelp' },
                { label: __('Twitter / X', 'blockenberg'), value: 'twitter' },
                { label: __('LinkedIn', 'blockenberg'), value: 'linkedin' },
                { label: __('Product Hunt', 'blockenberg'), value: 'producthunt' },
            ];

            var PLATFORM_COLORS = {
                google: '#ea4335', trustpilot: '#00b67a', g2: '#ff492c',
                capterra: '#ff9d28', yelp: '#d32323', twitter: '#1da1f2',
                linkedin: '#0077b5', producthunt: '#da552f'
            };

            var PLATFORM_LABELS = {
                google: 'G', trustpilot: 'TP', g2: 'G2',
                capterra: 'Ca', yelp: 'Yelp', twitter: 'X',
                linkedin: 'in', producthunt: 'PH'
            };

            function renderStars(rating) {
                var stars = [];
                for (var i = 1; i <= 5; i++) {
                    stars.push(el('span', { key: i, className: 'bkbg-ti-star' }, i <= rating ? '★' : '☆'));
                }
                return el('div', { className: 'bkbg-ti-stars' }, stars);
            }

            function renderPlatformBadge(platform) {
                if (!platform || platform === 'none') return null;
                var color = PLATFORM_COLORS[platform] || '#94a3b8';
                var label = PLATFORM_LABELS[platform] || platform;
                return el('div', {
                    className: 'bkbg-ti-platform',
                    style: { background: color }
                }, label);
            }

            var inspector = el(InspectorControls, {},

                el(PanelBody, { title: __('Author', 'blockenberg'), initialOpen: true },
                    el('label', { style: { display: 'block', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', marginBottom: 8 } }, __('Author Photo', 'blockenberg')),
                    el(ToggleControl, {
                        label: __('Show Photo', 'blockenberg'), checked: a.showPhoto, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showPhoto: v }); }
                    }),
                    a.showPhoto && el(MediaUpload, {
                        onSelect: function (m) { set({ photoUrl: m.url, photoId: m.id }); },
                        allowedTypes: ['image'],
                        value: a.photoId,
                        render: function (ref) {
                            return el('div', { className: 'bkbg-ti-photo-upload' },
                                a.photoUrl && el('img', { src: a.photoUrl, style: { width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 } }),
                                el(Button, { variant: 'secondary', onClick: ref.open }, a.photoUrl ? __('Change Photo', 'blockenberg') : __('Upload Photo', 'blockenberg')),
                                a.photoUrl && el(Button, { isDestructive: true, variant: 'link', onClick: function () { set({ photoUrl: '', photoId: 0 }); } }, __('Remove', 'blockenberg'))
                            );
                        }
                    }),
                    el(RangeControl, { label: __('Photo Size', 'blockenberg'), value: a.photoSize, onChange: function (v) { set({ photoSize: v }); }, min: 32, max: 100 })
                ),

                el(PanelBody, { title: __('Rating & Platform', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Rating Stars', 'blockenberg'), checked: a.showRating, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showRating: v }); }
                    }),
                    a.showRating && el(RangeControl, { label: __('Stars (1–5)', 'blockenberg'), value: a.rating, onChange: function (v) { set({ rating: v }); }, min: 1, max: 5 }),
                    a.showRating && el(RangeControl, { label: __('Star Size', 'blockenberg'), value: a.starSize, onChange: function (v) { set({ starSize: v }); }, min: 12, max: 28 }),
                    el(ToggleControl, {
                        label: __('Show Platform Badge', 'blockenberg'), checked: a.showPlatform, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showPlatform: v }); }
                    }),
                    a.showPlatform && el(SelectControl, { label: __('Platform', 'blockenberg'), value: a.platform, options: platformOptions, onChange: function (v) { set({ platform: v }); } })
                ),

                el(PanelBody, { title: __('Style & Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Card Style', 'blockenberg'), value: a.style, options: styleOptions, onChange: function (v) { set({ style: v }); } }),
                    el(SelectControl, { label: __('Alignment', 'blockenberg'), value: a.align, options: alignOptions, onChange: function (v) { set({ align: v }); } }),
                    el(ToggleControl, {
                        label: __('Show Quote Mark', 'blockenberg'), checked: a.showQuoteMark, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showQuoteMark: v }); }
                    }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, onChange: function (v) { set({ maxWidth: v }); }, min: 200, max: 1200 }),
                    el(RangeControl, { label: __('Card Padding', 'blockenberg'), value: a.cardPadding, onChange: function (v) { set({ cardPadding: v }); }, min: 12, max: 64 }),
                    el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: a.borderRadius, onChange: function (v) { set({ borderRadius: v }); }, min: 0, max: 48 })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl()({ label: __('Quote', 'blockenberg'), value: a.quoteTypo, onChange: function (v) { set({ quoteTypo: v }); } }),
                    getTypoControl()({ label: __('Name', 'blockenberg'), value: a.nameTypo, onChange: function (v) { set({ nameTypo: v }); } }),
                    getTypoControl()({ label: __('Role', 'blockenberg'), value: a.roleTypo, onChange: function (v) { set({ roleTypo: v }); } })
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); }, label: __('Card Background', 'blockenberg') },
                        { value: a.quoteColor, onChange: function (v) { set({ quoteColor: v || '#1e293b' }); }, label: __('Quote Text Color', 'blockenberg') },
                        { value: a.nameColor, onChange: function (v) { set({ nameColor: v || '#0f172a' }); }, label: __('Name Color', 'blockenberg') },
                        { value: a.roleColor, onChange: function (v) { set({ roleColor: v || '#64748b' }); }, label: __('Role Color', 'blockenberg') },
                        { value: a.starColor, onChange: function (v) { set({ starColor: v || '#f59e0b' }); }, label: __('Star Color', 'blockenberg') },
                        { value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#6c3fb5' }); }, label: __('Accent Color', 'blockenberg') },
                        { value: a.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); }, label: __('Border Color', 'blockenberg') },
                        { value: a.quoteMarkColor, onChange: function (v) { set({ quoteMarkColor: v || '#6c3fb5' }); }, label: __('Quote Mark Color', 'blockenberg') },
                    ]
                })
            );

            var alignClass = 'bkbg-ti-align--' + a.align;
            var blockProps = useBlockProps({
                className: 'bkbg-ti-wrap bkbg-ti-style--' + a.style + ' ' + alignClass,
                style: wrapStyle(a)
            });

            var photoEl = a.showPhoto && (
                a.photoUrl ?
                    el('img', { className: 'bkbg-ti-photo', src: a.photoUrl, alt: a.name }) :
                    el('div', { className: 'bkbg-ti-photo bkbg-ti-photo--placeholder' },
                        el('span', { className: 'dashicons dashicons-admin-users' })
                    )
            );

            return el('div', blockProps,
                inspector,
                el('div', { className: 'bkbg-ti-card' },
                    a.showRating && renderStars(a.rating),
                    a.showQuoteMark && el('div', { className: 'bkbg-ti-qm' }, '\u201C'),
                    el(RichText, {
                        tagName: 'p', className: 'bkbg-ti-quote',
                        value: a.quote, placeholder: __('Enter testimonial quote…', 'blockenberg'),
                        onChange: function (v) { set({ quote: v }); }
                    }),
                    el('div', { className: 'bkbg-ti-author' },
                        photoEl,
                        el('div', { className: 'bkbg-ti-author-text' },
                            el('div', { className: 'bkbg-ti-name' }, a.name),
                            el('div', { className: 'bkbg-ti-role' },
                                a.role, a.showCompany && a.company ? ' · ' + a.company : ''
                            )
                        ),
                        a.showPlatform && renderPlatformBadge(a.platform)
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var el = wp.element.createElement;

            function wrapStyle(a) {
                var _tvf = getTypoCssVars();
                var s = {
                    '--bkbg-ti-bg': a.bgColor,
                    '--bkbg-ti-quote-c': a.quoteColor,
                    '--bkbg-ti-name-c': a.nameColor,
                    '--bkbg-ti-role-c': a.roleColor,
                    '--bkbg-ti-star-c': a.starColor,
                    '--bkbg-ti-star-sz': a.starSize + 'px',
                    '--bkbg-ti-accent': a.accentColor,
                    '--bkbg-ti-border': a.borderColor,
                    '--bkbg-ti-qm-c': a.quoteMarkColor,
                    '--bkbg-ti-photo-sz': a.photoSize + 'px',
                    '--bkbg-ti-r': a.borderRadius + 'px',
                    '--bkbg-ti-pad': a.cardPadding + 'px',
                    '--bkbg-ti-max-w': a.maxWidth + 'px',
                };
                if (_tvf) {
                    Object.assign(s, _tvf(a.quoteTypo, '--bkti-qt-'));
                    Object.assign(s, _tvf(a.nameTypo, '--bkti-nm-'));
                    Object.assign(s, _tvf(a.roleTypo, '--bkti-rl-'));
                }
                return s;
            }

            var PLATFORM_COLORS = {
                google: '#ea4335', trustpilot: '#00b67a', g2: '#ff492c',
                capterra: '#ff9d28', yelp: '#d32323', twitter: '#1da1f2',
                linkedin: '#0077b5', producthunt: '#da552f'
            };
            var PLATFORM_LABELS = {
                google: 'G', trustpilot: 'TP', g2: 'G2',
                capterra: 'Ca', yelp: 'Yelp', twitter: 'X', linkedin: 'in', producthunt: 'PH'
            };

            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-ti-wrap bkbg-ti-style--' + a.style + ' bkbg-ti-align--' + a.align,
                style: wrapStyle(a)
            });

            var stars = [];
            if (a.showRating) {
                for (var i = 1; i <= 5; i++) {
                    stars.push(el('span', { key: i, className: 'bkbg-ti-star' }, i <= a.rating ? '★' : '☆'));
                }
            }

            var platformEl = null;
            if (a.showPlatform && a.platform && a.platform !== 'none') {
                platformEl = el('div', {
                    className: 'bkbg-ti-platform',
                    style: { background: PLATFORM_COLORS[a.platform] || '#94a3b8' }
                }, PLATFORM_LABELS[a.platform] || a.platform);
            }

            return el('div', blockProps,
                el('div', { className: 'bkbg-ti-card' },
                    a.showRating && el('div', { className: 'bkbg-ti-stars' }, stars),
                    a.showQuoteMark && el('div', { className: 'bkbg-ti-qm' }, '\u201C'),
                    el(RichText.Content, { tagName: 'p', className: 'bkbg-ti-quote', value: a.quote }),
                    el('div', { className: 'bkbg-ti-author' },
                        a.showPhoto && (
                            a.photoUrl ?
                                el('img', { className: 'bkbg-ti-photo', src: a.photoUrl, alt: a.name }) :
                                el('div', { className: 'bkbg-ti-photo bkbg-ti-photo--placeholder' },
                                    el('span', { className: 'dashicons dashicons-admin-users' })
                                )
                        ),
                        el('div', { className: 'bkbg-ti-author-text' },
                            el('div', { className: 'bkbg-ti-name' }, a.name),
                            el('div', { className: 'bkbg-ti-role' },
                                a.role, a.showCompany && a.company ? ' · ' + a.company : ''
                            )
                        ),
                        platformEl
                    )
                )
            );
        }
    });
}() );
