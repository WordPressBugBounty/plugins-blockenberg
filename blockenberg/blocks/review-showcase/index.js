( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // Platform display config (logo SVG inline or text badge)
    var PLATFORM_CONFIG = {
        google:     { label: 'Google',      color: '#ea4335', badge: 'G' },
        g2:         { label: 'G2',          color: '#ff492c', badge: 'G2' },
        trustpilot: { label: 'Trustpilot',  color: '#00b67a', badge: 'TP' },
        capterra:   { label: 'Capterra',    color: '#ff9d28', badge: 'Ca' },
        producthunt:{ label: 'Product Hunt',color: '#da552f', badge: 'PH' },
        appstore:   { label: 'App Store',   color: '#007aff', badge: 'AS' }
    };

    var layoutOptions = [
        { label: __('Platforms Top + Featured Quote', 'blockenberg'), value: 'platforms-top' },
        { label: __('Split (Stats Left, Quote Right)', 'blockenberg'), value: 'split' },
        { label: __('Compact (Platforms Only)', 'blockenberg'), value: 'compact' }
    ];

    var styleOptions = [
        { label: __('Clean', 'blockenberg'), value: 'clean' },
        { label: __('Card', 'blockenberg'), value: 'card' },
        { label: __('Dark', 'blockenberg'), value: 'dark' },
        { label: __('Gradient', 'blockenberg'), value: 'gradient' }
    ];

    var platformLogoOptions = Object.keys(PLATFORM_CONFIG).map(function (k) {
        return { label: PLATFORM_CONFIG[k].label, value: k };
    });

    // Render star rating (0–5, supports half)
    function renderStars(rating, starColor, starSize) {
        var stars = [];
        for (var i = 1; i <= 5; i++) {
            var fill = i <= Math.floor(rating) ? starColor : (i - 0.5 <= rating ? 'url(#half-' + i + ')' : '#e2e8f0');
            stars.push(el('span', {
                key: i,
                className: 'bkbg-rs-star',
                style: { color: i <= rating ? starColor : '#e2e8f0', fontSize: starSize + 'px' }
            }, i <= Math.floor(rating) ? '★' : (i - 0.5 <= rating ? '★' : '☆')));
        }
        return el('div', { className: 'bkbg-rs-stars' }, stars);
    }

    // Platform badge element
    function renderPlatformBadge(platform, cfg) {
        return el('div', {
            className: 'bkbg-rs-platform-badge',
            key: platform,
            style: { '--bkbg-rs-plat-c': cfg.color }
        },
            el('div', { className: 'bkbg-rs-plat-logo', style: { background: cfg.color } }, cfg.badge)
        );
    }

    registerBlockType('blockenberg/review-showcase', {
        title: __('Review Showcase', 'blockenberg'),
        icon: 'star-filled',
        category: 'bkbg-marketing',
        description: __('Showcase aggregate ratings from review platforms with a featured testimonial.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            function wrapStyle(a) {
                var _tv = getTypoCssVars();
                var s = {
                    '--bkbg-rs-star-c': a.starColor,
                    '--bkbg-rs-heading-c': a.headingColor,
                    '--bkbg-rs-rating-c': a.ratingColor,
                    '--bkbg-rs-quote-c': a.quoteColor,
                    '--bkbg-rs-card-bg': a.cardBg,
                    '--bkbg-rs-card-border': a.cardBorder,
                    '--bkbg-rs-accent': a.accentColor,
                    '--bkbg-rs-rating-sz': a.ratingSize + 'px',
                    '--bkbg-rs-star-sz': a.starSize + 'px',
                    '--bkbg-rs-pt': a.paddingTop + 'px',
                    '--bkbg-rs-pb': a.paddingBottom + 'px'
                };
                Object.assign(s, _tv(a.headingTypo, '--bkrsc-ht-'));
                Object.assign(s, _tv(a.quoteTypo, '--bkrsc-qt-'));
                return s;
            }

            function updatePlatform(index, key, value) {
                var newPlatforms = a.platforms.slice();
                newPlatforms[index] = Object.assign({}, newPlatforms[index]);
                newPlatforms[index][key] = value;
                setAttributes({ platforms: newPlatforms });
            }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Heading', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Heading', 'blockenberg'),
                        checked: a.showHeading,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showHeading: v }); }
                    }),
                    a.showHeading && el(TextControl, {
                        label: __('Heading', 'blockenberg'),
                        value: a.heading,
                        onChange: function (v) { setAttributes({ heading: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Overall Rating', 'blockenberg'),
                        checked: a.showOverall,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showOverall: v }); }
                    }),
                    a.showOverall && el(RangeControl, {
                        label: __('Overall Rating', 'blockenberg'),
                        value: a.overallRating,
                        onChange: function (v) { setAttributes({ overallRating: v }); },
                        min: 1, max: 5, step: 0.1
                    }),
                    a.showOverall && el(TextControl, {
                        label: __('Review Count Label', 'blockenberg'),
                        value: a.reviewCount,
                        onChange: function (v) { setAttributes({ reviewCount: v }); }
                    })
                ),

                el(PanelBody, { title: __('Platforms', 'blockenberg'), initialOpen: false },
                    a.platforms.map(function (plat, index) {
                        return el('div', { key: plat.id, className: 'bkbg-rs-plat-ctrl' },
                            el('div', { className: 'bkbg-rs-plat-ctrl-head' },
                                el('strong', {}, plat.name),
                                el(ToggleControl, {
                                    checked: plat.active,
                                    __nextHasNoMarginBottom: true,
                                    onChange: function (v) { updatePlatform(index, 'active', v); }
                                })
                            ),
                            plat.active && el(Fragment, {},
                                el(TextControl, {
                                    label: __('Name', 'blockenberg'),
                                    value: plat.name,
                                    onChange: function (v) { updatePlatform(index, 'name', v); }
                                }),
                                el(SelectControl, {
                                    label: __('Logo', 'blockenberg'),
                                    value: plat.logo,
                                    options: platformLogoOptions,
                                    onChange: function (v) { updatePlatform(index, 'logo', v); }
                                }),
                                el(RangeControl, {
                                    label: __('Rating', 'blockenberg'),
                                    value: plat.rating,
                                    onChange: function (v) { updatePlatform(index, 'rating', v); },
                                    min: 1, max: 5, step: 0.1
                                }),
                                el(TextControl, {
                                    label: __('Review Count', 'blockenberg'),
                                    value: plat.count,
                                    onChange: function (v) { updatePlatform(index, 'count', v); }
                                })
                            )
                        );
                    })
                ),

                el(PanelBody, { title: __('Featured Testimonial', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Featured Quote', 'blockenberg'),
                        checked: a.showFeatured,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showFeatured: v }); }
                    }),
                    a.showFeatured && el(Fragment, {},
                        el(TextControl, {
                            label: __('Quote', 'blockenberg'),
                            value: a.featuredQuote,
                            onChange: function (v) { setAttributes({ featuredQuote: v }); }
                        }),
                        el(TextControl, {
                            label: __('Reviewer Name', 'blockenberg'),
                            value: a.featuredName,
                            onChange: function (v) { setAttributes({ featuredName: v }); }
                        }),
                        el(TextControl, {
                            label: __('Reviewer Role', 'blockenberg'),
                            value: a.featuredRole,
                            onChange: function (v) { setAttributes({ featuredRole: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Platform Source', 'blockenberg'),
                            value: a.featuredPlatform,
                            options: platformLogoOptions,
                            onChange: function (v) { setAttributes({ featuredPlatform: v }); }
                        })
                    )
                ),

                el(PanelBody, { title: __('Style & Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'),
                        value: a.layout,
                        options: layoutOptions,
                        onChange: function (v) { setAttributes({ layout: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'),
                        value: a.style,
                        options: styleOptions,
                        onChange: function (v) { setAttributes({ style: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: a.paddingTop,
                        onChange: function (v) { setAttributes({ paddingTop: v }); },
                        min: 0, max: 120
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: a.paddingBottom,
                        onChange: function (v) { setAttributes({ paddingBottom: v }); },
                        min: 0, max: 120
                    })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function () { var TC = getTypoControl(); return TC ? [
                        el(TC, { key: 'ht', label: __('Heading'), value: a.headingTypo, onChange: function (v) { setAttributes({ headingTypo: v }); } }),
                        el(TC, { key: 'qt', label: __('Quote'), value: a.quoteTypo, onChange: function (v) { setAttributes({ quoteTypo: v }); } }),
                    ] : null; })(),
                    el(RangeControl, { label: __('Rating Number Size (px)', 'blockenberg'), value: a.ratingSize, onChange: function (v) { setAttributes({ ratingSize: v }); }, min: 24, max: 96, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Star Size (px)', 'blockenberg'), value: a.starSize, onChange: function (v) { setAttributes({ starSize: v }); }, min: 14, max: 36, __nextHasNoMarginBottom: true })
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.starColor, onChange: function (v) { setAttributes({ starColor: v || '#f59e0b' }); }, label: __('Star Color', 'blockenberg') },
                        { value: a.headingColor, onChange: function (v) { setAttributes({ headingColor: v || '#0f172a' }); }, label: __('Heading Color', 'blockenberg') },
                        { value: a.ratingColor, onChange: function (v) { setAttributes({ ratingColor: v || '#0f172a' }); }, label: __('Rating Number Color', 'blockenberg') },
                        { value: a.quoteColor, onChange: function (v) { setAttributes({ quoteColor: v || '#475569' }); }, label: __('Quote Color', 'blockenberg') },
                        { value: a.cardBg, onChange: function (v) { setAttributes({ cardBg: v || '#ffffff' }); }, label: __('Card Background', 'blockenberg') },
                        { value: a.cardBorder, onChange: function (v) { setAttributes({ cardBorder: v || '#e2e8f0' }); }, label: __('Card Border', 'blockenberg') },
                        { value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#6c3fb5' }); }, label: __('Accent Color', 'blockenberg') }
                    ]
                })
            );

            var activePlatforms = a.platforms.filter(function (p) { return p.active; });
            var wrapClass = 'bkbg-rs-wrap bkbg-rs-layout--' + a.layout + ' bkbg-rs-style--' + a.style;
            var blockProps = useBlockProps({ className: wrapClass, style: wrapStyle(a) });

            // Overall rating display
            var overallEl = a.showOverall ? el('div', { className: 'bkbg-rs-overall' },
                el('div', { className: 'bkbg-rs-rating-num' }, a.overallRating.toFixed(1)),
                el('div', { className: 'bkbg-rs-overall-right' },
                    renderStars(a.overallRating, a.starColor, a.starSize),
                    el('div', { className: 'bkbg-rs-count' }, a.reviewCount + ' ' + __('reviews', 'blockenberg'))
                )
            ) : null;

            // Platforms row
            var platformsEl = el('div', { className: 'bkbg-rs-platforms' },
                activePlatforms.map(function (plat) {
                    var cfg = PLATFORM_CONFIG[plat.logo] || { label: plat.name, color: '#666', badge: plat.name.slice(0, 2) };
                    return el('div', { key: plat.id, className: 'bkbg-rs-plat-card' },
                        el('div', { className: 'bkbg-rs-plat-top' },
                            el('div', { className: 'bkbg-rs-plat-logo', style: { background: cfg.color } }, cfg.badge),
                            el('div', { className: 'bkbg-rs-plat-name' }, plat.name)
                        ),
                        renderStars(plat.rating, a.starColor, 14),
                        el('div', { className: 'bkbg-rs-plat-meta' },
                            el('strong', {}, plat.rating.toFixed(1)),
                            el('span', {}, ' / 5 · ' + plat.count + ' ' + __('reviews', 'blockenberg'))
                        )
                    );
                })
            );

            // Featured quote
            var featuredEl = a.showFeatured ? el('div', { className: 'bkbg-rs-featured' },
                el('div', { className: 'bkbg-rs-featured-inner' },
                    el('div', { className: 'bkbg-rs-feat-stars' }, renderStars(5, a.starColor, a.starSize)),
                    el('p', { className: 'bkbg-rs-feat-quote' }, '\u201C' + a.featuredQuote + '\u201D'),
                    el('div', { className: 'bkbg-rs-feat-attr' },
                        el('div', { className: 'bkbg-rs-feat-avatar' }, a.featuredName.charAt(0)),
                        el('div', { className: 'bkbg-rs-feat-meta' },
                            el('div', { className: 'bkbg-rs-feat-name' }, a.featuredName),
                            el('div', { className: 'bkbg-rs-feat-role' }, a.featuredRole)
                        ),
                        (function () {
                            var cfg = PLATFORM_CONFIG[a.featuredPlatform];
                            return cfg ? el('div', { className: 'bkbg-rs-plat-logo bkbg-rs-feat-plat', style: { background: cfg.color } }, cfg.badge) : null;
                        })()
                    )
                )
            ) : null;

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    a.showHeading && el('h2', { className: 'bkbg-rs-heading' }, a.heading),
                    overallEl,
                    platformsEl,
                    featuredEl
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            function wrapStyle(a) {
                var _tv = getTypoCssVars();
                var s = {
                    '--bkbg-rs-star-c': a.starColor,
                    '--bkbg-rs-heading-c': a.headingColor,
                    '--bkbg-rs-rating-c': a.ratingColor,
                    '--bkbg-rs-quote-c': a.quoteColor,
                    '--bkbg-rs-card-bg': a.cardBg,
                    '--bkbg-rs-card-border': a.cardBorder,
                    '--bkbg-rs-accent': a.accentColor,
                    '--bkbg-rs-rating-sz': a.ratingSize + 'px',
                    '--bkbg-rs-star-sz': a.starSize + 'px',
                    '--bkbg-rs-pt': a.paddingTop + 'px',
                    '--bkbg-rs-pb': a.paddingBottom + 'px'
                };
                Object.assign(s, _tv(a.headingTypo, '--bkrsc-ht-'));
                Object.assign(s, _tv(a.quoteTypo, '--bkrsc-qt-'));
                return s;
            }

            function renderStarsSave(rating, starColor, starSize) {
                var stars = [];
                for (var i = 1; i <= 5; i++) {
                    stars.push(el('span', {
                        key: i,
                        className: 'bkbg-rs-star',
                        style: { color: i <= Math.round(rating) ? starColor : '#e2e8f0', fontSize: starSize + 'px' }
                    }, i <= Math.round(rating) ? '★' : '☆'));
                }
                return el('div', { className: 'bkbg-rs-stars' }, stars);
            }

            var activePlatforms = a.platforms.filter(function (p) { return p.active; });
            var wrapClass = 'bkbg-rs-wrap bkbg-rs-layout--' + a.layout + ' bkbg-rs-style--' + a.style;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: wrapClass, style: wrapStyle(a) });

            return el('div', blockProps,
                a.showHeading && el('h2', { className: 'bkbg-rs-heading' }, a.heading),
                a.showOverall && el('div', { className: 'bkbg-rs-overall' },
                    el('div', { className: 'bkbg-rs-rating-num' }, a.overallRating.toFixed(1)),
                    el('div', { className: 'bkbg-rs-overall-right' },
                        renderStarsSave(a.overallRating, a.starColor, a.starSize),
                        el('div', { className: 'bkbg-rs-count' }, a.reviewCount + ' reviews')
                    )
                ),
                el('div', { className: 'bkbg-rs-platforms' },
                    activePlatforms.map(function (plat) {
                        var cfg = PLATFORM_CONFIG[plat.logo] || { label: plat.name, color: '#666', badge: plat.name.slice(0, 2) };
                        return el('div', { key: plat.id, className: 'bkbg-rs-plat-card' },
                            el('div', { className: 'bkbg-rs-plat-top' },
                                el('div', { className: 'bkbg-rs-plat-logo', style: { background: cfg.color } }, cfg.badge),
                                el('div', { className: 'bkbg-rs-plat-name' }, plat.name)
                            ),
                            renderStarsSave(plat.rating, a.starColor, 14),
                            el('div', { className: 'bkbg-rs-plat-meta' },
                                el('strong', {}, plat.rating.toFixed(1)),
                                el('span', {}, ' / 5 · ' + plat.count + ' reviews')
                            )
                        );
                    })
                ),
                a.showFeatured && el('div', { className: 'bkbg-rs-featured' },
                    el('div', { className: 'bkbg-rs-featured-inner' },
                        el('div', { className: 'bkbg-rs-feat-stars' }, renderStarsSave(5, a.starColor, a.starSize)),
                        el('p', { className: 'bkbg-rs-feat-quote' }, '\u201C' + a.featuredQuote + '\u201D'),
                        el('div', { className: 'bkbg-rs-feat-attr' },
                            el('div', { className: 'bkbg-rs-feat-avatar' }, a.featuredName.charAt(0)),
                            el('div', { className: 'bkbg-rs-feat-meta' },
                                el('div', { className: 'bkbg-rs-feat-name' }, a.featuredName),
                                el('div', { className: 'bkbg-rs-feat-role' }, a.featuredRole)
                            ),
                            (function () {
                                var cfg = PLATFORM_CONFIG[a.featuredPlatform];
                                return cfg ? el('div', { className: 'bkbg-rs-plat-logo bkbg-rs-feat-plat', style: { background: cfg.color } }, cfg.badge) : null;
                            })()
                        )
                    )
                )
            );
        },
        deprecated: [{
            attributes: {"heading":{"type":"string","default":"Loved by thousands of teams"},"showHeading":{"type":"boolean","default":true},"overallRating":{"type":"number","default":4.9},"reviewCount":{"type":"string","default":"2,400+"},"showOverall":{"type":"boolean","default":true},"platforms":{"type":"array","default":[{"id":"p1","name":"Google","logo":"google","rating":4.9,"count":"1.2k","active":true},{"id":"p2","name":"G2","logo":"g2","rating":4.8,"count":"850","active":true},{"id":"p3","name":"Trustpilot","logo":"trustpilot","rating":4.9,"count":"400","active":true},{"id":"p4","name":"Capterra","logo":"capterra","rating":4.8,"count":"320","active":false}]},"showFeatured":{"type":"boolean","default":true},"featuredQuote":{"type":"string","default":"This product completely transformed how our team works. The setup was effortless and the results were immediate."},"featuredName":{"type":"string","default":"Sarah M."},"featuredRole":{"type":"string","default":"Product Manager at Acme Corp"},"featuredPlatform":{"type":"string","default":"google"},"layout":{"type":"string","default":"platforms-top"},"style":{"type":"string","default":"clean"},"starSize":{"type":"number","default":20},"ratingSize":{"type":"number","default":48},"headingSize":{"type":"number","default":28},"headingFontWeight":{"type":"number","default":800},"headingLineHeight":{"type":"number","default":1.2},"quoteSize":{"type":"number","default":16},"quoteFontWeight":{"type":"number","default":400},"quoteLineHeight":{"type":"number","default":1.6},"paddingTop":{"type":"number","default":0},"paddingBottom":{"type":"number","default":0},"starColor":{"type":"string","default":"#f59e0b"},"headingColor":{"type":"string","default":"#0f172a"},"ratingColor":{"type":"string","default":"#0f172a"},"quoteColor":{"type":"string","default":"#475569"},"cardBg":{"type":"string","default":"#ffffff"},"cardBorder":{"type":"string","default":"#e2e8f0"},"accentColor":{"type":"string","default":"#6c3fb5"},"headingTypo":{"type":"object","default":{}},"quoteTypo":{"type":"object","default":{}}},
            save: function (props) {
                var a = props.attributes;

                function wrapStyle(a) {
                    return {
                        '--bkbg-rs-star-c': a.starColor,
                        '--bkbg-rs-heading-c': a.headingColor,
                        '--bkbg-rs-rating-c': a.ratingColor,
                        '--bkbg-rs-quote-c': a.quoteColor,
                        '--bkbg-rs-card-bg': a.cardBg,
                        '--bkbg-rs-card-border': a.cardBorder,
                        '--bkbg-rs-accent': a.accentColor,
                        '--bkbg-rs-heading-sz': a.headingSize + 'px',
                        '--bkbg-rs-heading-fw': a.headingFontWeight,
                        '--bkbg-rs-heading-lh': a.headingLineHeight,
                        '--bkbg-rs-rating-sz': a.ratingSize + 'px',
                        '--bkbg-rs-quote-sz': a.quoteSize + 'px',
                        '--bkbg-rs-quote-fw': a.quoteFontWeight,
                        '--bkbg-rs-quote-lh': a.quoteLineHeight,
                        '--bkbg-rs-star-sz': a.starSize + 'px',
                        '--bkbg-rs-pt': a.paddingTop + 'px',
                        '--bkbg-rs-pb': a.paddingBottom + 'px'
                    };
                }

                function renderStarsSave(rating, starColor, starSize) {
                    var stars = [];
                    for (var i = 1; i <= 5; i++) {
                        stars.push(el('span', {
                            key: i,
                            className: 'bkbg-rs-star',
                            style: { color: i <= Math.round(rating) ? starColor : '#e2e8f0', fontSize: starSize + 'px' }
                        }, i <= Math.round(rating) ? '\u2605' : '\u2606'));
                    }
                    return el('div', { className: 'bkbg-rs-stars' }, stars);
                }

                var activePlatforms = a.platforms.filter(function (p) { return p.active; });
                var wrapClass = 'bkbg-rs-wrap bkbg-rs-layout--' + a.layout + ' bkbg-rs-style--' + a.style;
                var blockProps = wp.blockEditor.useBlockProps.save({ className: wrapClass, style: wrapStyle(a) });

                return el('div', blockProps,
                    a.showHeading && el('h2', { className: 'bkbg-rs-heading' }, a.heading),
                    a.showOverall && el('div', { className: 'bkbg-rs-overall' },
                        el('div', { className: 'bkbg-rs-rating-num' }, a.overallRating.toFixed(1)),
                        el('div', { className: 'bkbg-rs-overall-right' },
                            renderStarsSave(a.overallRating, a.starColor, a.starSize),
                            el('div', { className: 'bkbg-rs-count' }, a.reviewCount + ' reviews')
                        )
                    ),
                    el('div', { className: 'bkbg-rs-platforms' },
                        activePlatforms.map(function (plat) {
                            var cfg = PLATFORM_CONFIG[plat.logo] || { label: plat.name, color: '#666', badge: plat.name.slice(0, 2) };
                            return el('div', { key: plat.id, className: 'bkbg-rs-plat-card' },
                                el('div', { className: 'bkbg-rs-plat-top' },
                                    el('div', { className: 'bkbg-rs-plat-logo', style: { background: cfg.color } }, cfg.badge),
                                    el('div', { className: 'bkbg-rs-plat-name' }, plat.name)
                                ),
                                renderStarsSave(plat.rating, a.starColor, 14),
                                el('div', { className: 'bkbg-rs-plat-meta' },
                                    el('strong', {}, plat.rating.toFixed(1)),
                                    el('span', {}, ' / 5 \u00b7 ' + plat.count + ' reviews')
                                )
                            );
                        })
                    ),
                    a.showFeatured && el('div', { className: 'bkbg-rs-featured' },
                        el('div', { className: 'bkbg-rs-featured-inner' },
                            el('div', { className: 'bkbg-rs-feat-stars' }, renderStarsSave(5, a.starColor, a.starSize)),
                            el('p', { className: 'bkbg-rs-feat-quote' }, '\u201C' + a.featuredQuote + '\u201D'),
                            el('div', { className: 'bkbg-rs-feat-attr' },
                                el('div', { className: 'bkbg-rs-feat-avatar' }, a.featuredName.charAt(0)),
                                el('div', { className: 'bkbg-rs-feat-meta' },
                                    el('div', { className: 'bkbg-rs-feat-name' }, a.featuredName),
                                    el('div', { className: 'bkbg-rs-feat-role' }, a.featuredRole)
                                ),
                                (function () {
                                    var cfg = PLATFORM_CONFIG[a.featuredPlatform];
                                    return cfg ? el('div', { className: 'bkbg-rs-plat-logo bkbg-rs-feat-plat', style: { background: cfg.color } }, cfg.badge) : null;
                                })()
                            )
                        )
                    )
                );
            }
        }]
    });
}() );
