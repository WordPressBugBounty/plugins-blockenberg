( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Popover = wp.components.Popover;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    // ── Built-in SVG icons ──────────────────────────────────────────────────────
    var builtInIcons = {
        check: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' })
        ),
        check2: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.59-7.59L19 7.5l-9 9z' })
        ),
        arrow: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' })
        ),
        'arrow-right': el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z' })
        ),
        star: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' })
        ),
        disc: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('circle', { cx: '12', cy: '12', r: '6' })
        ),
        square: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('rect', { x: '6', y: '6', width: '12', height: '12', rx: '2' })
        ),
        dash: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M4 11h16v2H4z' })
        ),
        cross: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' })
        ),
        sparkle: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z' })
        ),
        bolt: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M7 2v11h3v9l7-12h-4l4-8z' })
        ),
        heart: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' })
        ),
        globe: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' })
        ),
        shield: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z' })
        ),
        rocket: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.38-.37.88-.57 1.41-.57L9.19 6.35zM11.17 19l5.38-5.38c-.45 2.29-2.16 5.89-5.38 5.38zm8.6-14.26c.1-.46.12-.93.07-1.39-.46-.05-.93-.03-1.39.07-1.19.27-2.3.86-3.2 1.76L9.5 11H8l-3 3 3.46.96.58.58.96 3.46 3-3v-1.5l5.82-5.75c.9-.9 1.49-2.01 1.76-3.2zM15 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-6.71 9.21l-1.5-1.5c-.39-.39-.39-1.02 0-1.41l.03-.03c.39-.39 1.02-.39 1.41 0l1.5 1.5c.39.39.39 1.02 0 1.41l-.03.03c-.39.39-1.02.39-1.41 0z' })
        )
    };

    // ── Dashicons list ──────────────────────────────────────────────────────────
    var dashicons = [
        'yes', 'yes-alt', 'no', 'no-alt', 'arrow-right', 'arrow-right-alt', 'arrow-right-alt2',
        'arrow-left-alt2', 'arrow-up-alt2', 'arrow-down-alt2',
        'star-filled', 'star-half', 'star-empty', 'heart', 'thumbs-up', 'thumbs-down',
        'awards', 'flag', 'warning', 'info', 'lightbulb', 'marker', 'tag', 'category',
        'location', 'location-alt', 'clock', 'calendar', 'calendar-alt',
        'groups', 'businessman', 'businesswoman', 'admin-users', 'id', 'id-alt',
        'products', 'cart', 'money', 'money-alt', 'bank', 'feedback', 'forms',
        'edit', 'trash', 'upload', 'download', 'cloud', 'cloud-upload', 'cloud-saved',
        'search', 'lock', 'unlock', 'performance', 'analytics', 'chart-bar', 'chart-pie',
        'chart-line', 'chart-area', 'list-view', 'grid-view', 'slides',
        'desktop', 'laptop', 'tablet', 'smartphone', 'phone',
        'media-audio', 'media-video', 'media-document', 'format-image', 'camera',
        'portfolio', 'book', 'book-alt', 'text-page', 'welcome-write-blog',
        'hammer', 'art', 'schedule', 'rest-api', 'database', 'code-standards',
        'rss', 'email', 'email-alt', 'share', 'share-alt', 'networking',
        'facebook', 'twitter', 'instagram', 'linkedin', 'youtube',
        'shield', 'shield-alt', 'sos', 'image-rotate', 'image-flip-horizontal'
    ];

    // ── Helper: build icon element ───────────────────────────────────────────────
    function buildIconEl(a, forSave) {
        var type = a.iconType;
        if (type === 'none') return null;

        var inner;
        if (type === 'custom-image') {
            if (!a.iconImageUrl) return null;
            inner = el('img', {
                src: a.iconImageUrl,
                alt: '',
                className: 'bkbg-ib-img-icon',
                style: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' }
            });
        } else if (type === 'custom-char') {
            inner = el('span', { className: 'bkbg-ib-char' }, a.iconChar || '★');
        } else if (type === 'dashicon') {
            inner = el('span', { className: 'dashicons dashicons-' + a.iconDashicon });
        } else if (builtInIcons[type]) {
            inner = builtInIcons[type];
        } else {
            inner = builtInIcons.star;
        }

        return el('span', {
            className: 'bkbg-ib-icon',
            'aria-hidden': 'true'
        }, inner);
    }

    registerBlockType('blockenberg/icon-box', {
        title: __('Icon Box', 'blockenberg'),
        icon: 'star-filled',
        category: 'bkbg-content',
        description: __('Single card with icon, title, text, and optional link button.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            // State
            var iconPickerState = useState(false);
            var iconPickerOpen = iconPickerState[0];
            var setIconPickerOpen = iconPickerState[1];

            var iconSearchState = useState('');
            var iconSearch = iconSearchState[0];
            var setIconSearch = iconSearchState[1];

            var filteredDashicons = dashicons.filter(function (ic) {
                return !iconSearch || ic.indexOf(iconSearch) !== -1;
            });

            // ── Open media library ─────────────────────────────────────────────
            function openMediaLibrary() {
                var frame = wp.media({
                    title: __('Select Icon Image', 'blockenberg'),
                    button: { text: __('Use as Icon', 'blockenberg') },
                    multiple: false,
                    library: { type: 'image' }
                });
                frame.on('select', function () {
                    var attachment = frame.state().get('selection').first().toJSON();
                    setAttributes({ iconImageUrl: attachment.url });
                });
                frame.open();
            }

            // ── Option lists ───────────────────────────────────────────────────
            var iconTypeOptions = [
                { label: __('Star ★', 'blockenberg'), value: 'star' },
                { label: __('Checkmark ✓', 'blockenberg'), value: 'check' },
                { label: __('Check Circle ✓●', 'blockenberg'), value: 'check2' },
                { label: __('Arrow ›', 'blockenberg'), value: 'arrow' },
                { label: __('Arrow Right →', 'blockenberg'), value: 'arrow-right' },
                { label: __('Disc •', 'blockenberg'), value: 'disc' },
                { label: __('Square ▪', 'blockenberg'), value: 'square' },
                { label: __('Sparkle ✦', 'blockenberg'), value: 'sparkle' },
                { label: __('Bolt ⚡', 'blockenberg'), value: 'bolt' },
                { label: __('Dash —', 'blockenberg'), value: 'dash' },
                { label: __('Cross ✕', 'blockenberg'), value: 'cross' },
                { label: __('Heart ♥', 'blockenberg'), value: 'heart' },
                { label: __('Globe 🌐', 'blockenberg'), value: 'globe' },
                { label: __('Shield 🛡', 'blockenberg'), value: 'shield' },
                { label: __('Rocket 🚀', 'blockenberg'), value: 'rocket' },
                { label: __('Custom Character', 'blockenberg'), value: 'custom-char' },
                { label: __('Dashicon', 'blockenberg'), value: 'dashicon' },
                { label: __('Custom Image', 'blockenberg'), value: 'custom-image' },
                { label: __('None', 'blockenberg'), value: 'none' }
            ];

            var iconShapeOptions = [
                { label: __('None (icon only)', 'blockenberg'), value: 'none' },
                { label: __('Circle — Filled', 'blockenberg'), value: 'circle-filled' },
                { label: __('Circle — Outline', 'blockenberg'), value: 'circle-outline' },
                { label: __('Square — Filled', 'blockenberg'), value: 'square-filled' },
                { label: __('Square — Outline', 'blockenberg'), value: 'square-outline' },
                { label: __('Rounded Square — Filled', 'blockenberg'), value: 'rounded-filled' },
                { label: __('Rounded Square — Outline', 'blockenberg'), value: 'rounded-outline' }
            ];

            var iconPositionOptions = [
                { label: __('Top (Centered)', 'blockenberg'), value: 'top' },
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Right', 'blockenberg'), value: 'right' }
            ];

            var textAlignOptions = [
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right', 'blockenberg'), value: 'right' }
            ];

            var titleTagOptions = [
                { label: 'H2', value: 'h2' },
                { label: 'H3', value: 'h3' },
                { label: 'H4', value: 'h4' },
                { label: 'P', value: 'p' }
            ];

            var fontWeightOptions = [
                { label: '300 — Light', value: 300 },
                { label: '400 — Regular', value: 400 },
                { label: '500 — Medium', value: 500 },
                { label: '600 — Semi Bold', value: 600 },
                { label: '700 — Bold', value: 700 },
                { label: '800 — Extra Bold', value: 800 }
            ];

            var linkStyleOptions = [
                { label: __('Solid Button', 'blockenberg'), value: 'solid' },
                { label: __('Outline Button', 'blockenberg'), value: 'outline' },
                { label: __('Ghost / Subtle', 'blockenberg'), value: 'ghost' },
                { label: __('Plain Link', 'blockenberg'), value: 'text' }
            ];

            var borderStyleOptions = [
                { label: __('Solid', 'blockenberg'), value: 'solid' },
                { label: __('Dashed', 'blockenberg'), value: 'dashed' },
                { label: __('Dotted', 'blockenberg'), value: 'dotted' },
                { label: __('None', 'blockenberg'), value: 'none' }
            ];

            var hoverEffectOptions = [
                { label: __('None', 'blockenberg'), value: 'none' },
                { label: __('Lift (translate up)', 'blockenberg'), value: 'lift' },
                { label: __('Glow (shadow)', 'blockenberg'), value: 'glow' },
                { label: __('Scale', 'blockenberg'), value: 'scale' },
                { label: __('Border Highlight', 'blockenberg'), value: 'border' }
            ];

            var targetOptions = [
                { label: __('Same Tab', 'blockenberg'), value: '_self' },
                { label: __('New Tab', 'blockenberg'), value: '_blank' }
            ];

            // ── CSS Variables & data attributes ────────────────────────────────
            var wrapStyle = {
                '--bkbg-ib-content-gap': a.contentGap + 'px',
                '--bkbg-ib-icon-size': a.iconSize + 'px',
                '--bkbg-ib-icon-color': a.iconColor,
                '--bkbg-ib-icon-bg': a.iconBgColor,
                '--bkbg-ib-icon-bg-size': a.iconBgSize + 'px',
                '--bkbg-ib-icon-radius': a.iconBgRadius + '%',
                '--bkbg-ib-title-size': a.titleSize + 'px',
                '--bkbg-ib-title-weight': a.titleWeight,
                '--bkbg-ib-title-color': a.titleColor,
                '--bkbg-ib-title-lh': a.titleLineHeight,
                '--bkbg-ib-title-spacing': a.titleSpacing + 'px',
                '--bkbg-ib-text-size': a.textSize + 'px',
                '--bkbg-ib-text-weight': a.textWeight,
                '--bkbg-ib-text-color': a.textColor,
                '--bkbg-ib-text-lh': a.textLineHeight,
                '--bkbg-ib-card-bg': a.cardBg,
                '--bkbg-ib-card-bg-hover': a.cardBgHover || a.cardBg,
                '--bkbg-ib-card-padding': a.cardPaddingTop + 'px ' + a.cardPaddingRight + 'px ' + a.cardPaddingBottom + 'px ' + a.cardPaddingLeft + 'px',
                '--bkbg-ib-card-brd-w': a.cardBorderWidth + 'px',
                '--bkbg-ib-card-brd-style': a.cardBorderStyle,
                '--bkbg-ib-card-brd-color': a.cardBorderColor,
                '--bkbg-ib-card-radius': a.cardBorderRadius + 'px',
                '--bkbg-ib-card-shadow': a.cardShadow
                    ? (a.cardShadowH + 'px ' + a.cardShadowV + 'px ' + a.cardShadowBlur + 'px ' + a.cardShadowSpread + 'px ' + a.cardShadowColor)
                    : 'none',
                '--bkbg-ib-card-shadow-hover': a.cardShadowHover,
                '--bkbg-ib-link-bg': a.linkBg,
                '--bkbg-ib-link-color': a.linkColor,
                '--bkbg-ib-link-bg-hover': a.linkBgHover,
                '--bkbg-ib-link-color-hover': a.linkColorHover,
                '--bkbg-ib-link-brd-color': a.linkBorderColor,
                '--bkbg-ib-link-brd-w': a.linkBorderWidth + 'px',
                '--bkbg-ib-link-size': a.linkSize + 'px',
                '--bkbg-ib-link-weight': a.linkWeight,
                '--bkbg-ib-link-radius': a.linkRadius + 'px',
                '--bkbg-ib-link-padding': a.linkPaddingV + 'px ' + a.linkPaddingH + 'px',
                '--bkbg-ib-link-spacing': a.linkSpacingTop + 'px',
                '--bkbg-ib-text-align': a.textAlign
            };
            var _tv = getTypoCssVars();
            if (_tv) {
                Object.assign(wrapStyle, _tv(a.titleTypo, '--bkbg-ib-tt-'));
                Object.assign(wrapStyle, _tv(a.textTypo, '--bkbg-ib-tx-'));
            }

            var wrapDataAttrs = {
                'data-icon-pos': a.iconPosition,
                'data-icon-shape': a.iconShape,
                'data-icon-align': a.iconAlignTop ? 'top' : 'center',
                'data-text-align': a.textAlign,
                'data-link-style': a.linkStyle,
                'data-hover': a.hoverEffect
            };

            var iconEl = buildIconEl(a, false);

            // ── Inspector Controls ─────────────────────────────────────────────
            var inspector = el(InspectorControls, {},

                // ── Layout ────────────────────────────────────────────────────
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Icon Position', 'blockenberg'),
                        value: a.iconPosition,
                        options: iconPositionOptions,
                        onChange: function (v) { setAttributes({ iconPosition: v }); }
                    }),
                    (a.iconPosition === 'left' || a.iconPosition === 'right') && el(ToggleControl, {
                        label: __('Align icon to top', 'blockenberg'),
                        checked: a.iconAlignTop,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ iconAlignTop: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Text Alignment', 'blockenberg'),
                        value: a.textAlign,
                        options: textAlignOptions,
                        onChange: function (v) { setAttributes({ textAlign: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap (icon ↔ content)', 'blockenberg'),
                        value: a.contentGap,
                        min: 4,
                        max: 60,
                        onChange: function (v) { setAttributes({ contentGap: v }); }
                    })
                ),

                // ── Icon ──────────────────────────────────────────────────────
                el(PanelBody, { title: __('Icon', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Icon Type', 'blockenberg'),
                        value: a.iconType,
                        options: iconTypeOptions,
                        onChange: function (v) { setAttributes({ iconType: v }); }
                    }),
                    // Custom char input
                    a.iconType === 'custom-char' && el(TextControl, {
                        label: __('Character', 'blockenberg'),
                        value: a.iconChar,
                        onChange: function (v) { setAttributes({ iconChar: v }); }
                    }),
                    // Dashicon picker
                    a.iconType === 'dashicon' && el('div', {},
                        el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                            el('span', {
                                className: 'dashicons dashicons-' + a.iconDashicon,
                                style: { fontSize: '24px', width: '24px', height: '24px', color: a.iconColor }
                            }),
                            el(Button, {
                                variant: 'secondary',
                                isSmall: true,
                                onClick: function () { setIconPickerOpen(!iconPickerOpen); }
                            }, __('Choose Dashicon', 'blockenberg'))
                        ),
                        iconPickerOpen && el(Popover, {
                            position: 'bottom left',
                            onClose: function () { setIconPickerOpen(false); setIconSearch(''); }
                        },
                            el('div', {
                                className: 'bkbg-sc-icon-picker-modal',
                                onMouseDown: function (e) { e.stopPropagation(); }
                            },
                                el('div', { className: 'bkbg-sc-icon-picker-header' },
                                    el('h3', {}, __('Choose Dashicon', 'blockenberg')),
                                    el(Button, {
                                        icon: 'no-alt',
                                        onClick: function () { setIconPickerOpen(false); setIconSearch(''); },
                                        className: 'bkbg-sc-icon-picker-close'
                                    })
                                ),
                                el(TextControl, {
                                    placeholder: __('Search icons…', 'blockenberg'),
                                    value: iconSearch,
                                    onChange: setIconSearch,
                                    className: 'bkbg-sc-icon-search'
                                }),
                                el('div', { className: 'bkbg-sc-dashicons-grid' },
                                    filteredDashicons.length === 0
                                        ? el('p', { className: 'bkbg-sc-no-icons' }, __('No icons found', 'blockenberg'))
                                        : filteredDashicons.map(function (icon) {
                                            var isActive = a.iconDashicon === icon;
                                            return el('button', {
                                                key: icon,
                                                type: 'button',
                                                title: icon,
                                                className: 'bkbg-sc-dashicon-btn' + (isActive ? ' is-active' : ''),
                                                onClick: function () {
                                                    setAttributes({ iconDashicon: icon });
                                                    setIconPickerOpen(false);
                                                    setIconSearch('');
                                                }
                                            }, el('span', { className: 'dashicons dashicons-' + icon }));
                                        })
                                )
                            )
                        )
                    ),
                    // Custom image
                    a.iconType === 'custom-image' && el('div', {},
                        a.iconImageUrl && el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                            el('img', { src: a.iconImageUrl, alt: '', style: { width: '48px', height: '48px', objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: '6px' } }),
                            el(Button, {
                                isSmall: true,
                                isDestructive: true,
                                onClick: function () { setAttributes({ iconImageUrl: '' }); }
                            }, __('Remove', 'blockenberg'))
                        ),
                        el(Button, {
                            variant: 'secondary',
                            isSmall: true,
                            onClick: openMediaLibrary
                        }, a.iconImageUrl ? __('Replace Image', 'blockenberg') : __('Select Image', 'blockenberg'))
                    ),

                    el('hr', {}),

                    el(SelectControl, {
                        label: __('Icon Shape', 'blockenberg'),
                        value: a.iconShape,
                        options: iconShapeOptions,
                        onChange: function (v) { setAttributes({ iconShape: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Icon Size', 'blockenberg'),
                        value: a.iconSize,
                        min: 12,
                        max: 80,
                        onChange: function (v) { setAttributes({ iconSize: v }); }
                    }),
                    a.iconShape !== 'none' && el(Fragment, {},
                        el(RangeControl, {
                            label: __('Background Size', 'blockenberg'),
                            value: a.iconBgSize,
                            min: 24,
                            max: 140,
                            onChange: function (v) { setAttributes({ iconBgSize: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Background Radius (%)', 'blockenberg'),
                            value: a.iconBgRadius,
                            min: 0,
                            max: 50,
                            onChange: function (v) { setAttributes({ iconBgRadius: v }); }
                        })
                    )
                ),

                // ── Typography ────────────────────────────────────────────────
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Title Tag', 'blockenberg'),
                        value: a.titleTag,
                        options: titleTagOptions,
                        onChange: function (v) { setAttributes({ titleTag: v }); }
                    }),
                    el('p', { style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Title', 'blockenberg')),
                    getTypographyControl() && el(getTypographyControl(), { label: __('Title', 'blockenberg'), typo: a.titleTypo || {}, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                    el(RangeControl, {
                        label: __('Spacing Below Title', 'blockenberg'),
                        value: a.titleSpacing,
                        min: 0,
                        max: 40,
                        onChange: function (v) { setAttributes({ titleSpacing: v }); }
                    }),
                    el('hr', {}),
                    el('p', { style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Body Text', 'blockenberg')),
                    getTypographyControl() && el(getTypographyControl(), { label: __('Body Text', 'blockenberg'), typo: a.textTypo || {}, onChange: function (v) { setAttributes({ textTypo: v }); } }),
                    el('hr', {}),
                    el('p', { style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Link Button', 'blockenberg')),
                    el(RangeControl, {
                        label: __('Font Size', 'blockenberg'),
                        value: a.linkSize,
                        min: 10,
                        max: 24,
                        onChange: function (v) { setAttributes({ linkSize: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Font Weight', 'blockenberg'),
                        value: a.linkWeight,
                        options: fontWeightOptions,
                        onChange: function (v) { setAttributes({ linkWeight: parseInt(v, 10) }); }
                    })
                ),

                // ── Link ──────────────────────────────────────────────────────
                el(PanelBody, { title: __('Link Button', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Link Button', 'blockenberg'),
                        checked: a.linkEnabled,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ linkEnabled: v }); }
                    }),
                    a.linkEnabled && el(Fragment, {},
                        el(TextControl, {
                            label: __('Button Text', 'blockenberg'),
                            value: a.linkText,
                            onChange: function (v) { setAttributes({ linkText: v }); }
                        }),
                        el(TextControl, {
                            label: __('URL', 'blockenberg'),
                            value: a.linkUrl,
                            type: 'url',
                            placeholder: 'https://',
                            onChange: function (v) { setAttributes({ linkUrl: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Open In', 'blockenberg'),
                            value: a.linkTarget,
                            options: targetOptions,
                            onChange: function (v) { setAttributes({ linkTarget: v }); }
                        }),
                        el('hr', {}),
                        el(SelectControl, {
                            label: __('Button Style', 'blockenberg'),
                            value: a.linkStyle,
                            options: linkStyleOptions,
                            onChange: function (v) { setAttributes({ linkStyle: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Border Radius', 'blockenberg'),
                            value: a.linkRadius,
                            min: 0,
                            max: 50,
                            onChange: function (v) { setAttributes({ linkRadius: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Padding Vertical', 'blockenberg'),
                            value: a.linkPaddingV,
                            min: 4,
                            max: 28,
                            onChange: function (v) { setAttributes({ linkPaddingV: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Padding Horizontal', 'blockenberg'),
                            value: a.linkPaddingH,
                            min: 8,
                            max: 60,
                            onChange: function (v) { setAttributes({ linkPaddingH: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Spacing Above Button', 'blockenberg'),
                            value: a.linkSpacingTop,
                            min: 0,
                            max: 48,
                            onChange: function (v) { setAttributes({ linkSpacingTop: v }); }
                        }),
                        (a.linkStyle === 'outline' || a.linkStyle === 'ghost') && el(RangeControl, {
                            label: __('Border Width', 'blockenberg'),
                            value: a.linkBorderWidth,
                            min: 1,
                            max: 4,
                            onChange: function (v) { setAttributes({ linkBorderWidth: v }); }
                        })
                    )
                ),

                // ── Card ──────────────────────────────────────────────────────
                el(PanelBody, { title: __('Card', 'blockenberg'), initialOpen: false },
                    el('p', { style: { margin: '0 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Padding', 'blockenberg')),
                    el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' } },
                        el(RangeControl, { label: __('Top', 'blockenberg'), value: a.cardPaddingTop, min: 0, max: 80, onChange: function (v) { setAttributes({ cardPaddingTop: v }); } }),
                        el(RangeControl, { label: __('Right', 'blockenberg'), value: a.cardPaddingRight, min: 0, max: 80, onChange: function (v) { setAttributes({ cardPaddingRight: v }); } }),
                        el(RangeControl, { label: __('Bottom', 'blockenberg'), value: a.cardPaddingBottom, min: 0, max: 80, onChange: function (v) { setAttributes({ cardPaddingBottom: v }); } }),
                        el(RangeControl, { label: __('Left', 'blockenberg'), value: a.cardPaddingLeft, min: 0, max: 80, onChange: function (v) { setAttributes({ cardPaddingLeft: v }); } })
                    ),
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.cardBorderRadius,
                        min: 0,
                        max: 48,
                        onChange: function (v) { setAttributes({ cardBorderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Width', 'blockenberg'),
                        value: a.cardBorderWidth,
                        min: 0,
                        max: 6,
                        onChange: function (v) { setAttributes({ cardBorderWidth: v }); }
                    }),
                    a.cardBorderWidth > 0 && el(SelectControl, {
                        label: __('Border Style', 'blockenberg'),
                        value: a.cardBorderStyle,
                        options: borderStyleOptions,
                        onChange: function (v) { setAttributes({ cardBorderStyle: v }); }
                    }),
                    el('hr', {}),
                    el(SelectControl, {
                        label: __('Hover Effect', 'blockenberg'),
                        value: a.hoverEffect,
                        options: hoverEffectOptions,
                        onChange: function (v) { setAttributes({ hoverEffect: v }); }
                    }),
                    el('hr', {}),
                    el(ToggleControl, {
                        label: __('Box Shadow', 'blockenberg'),
                        checked: a.cardShadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ cardShadow: v }); }
                    }),
                    a.cardShadow && el(Fragment, {},
                        el(RangeControl, {
                            label: __('Shadow H', 'blockenberg'),
                            value: a.cardShadowH, min: -20, max: 20,
                            onChange: function (v) { setAttributes({ cardShadowH: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Shadow V', 'blockenberg'),
                            value: a.cardShadowV, min: -20, max: 40,
                            onChange: function (v) { setAttributes({ cardShadowV: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Blur', 'blockenberg'),
                            value: a.cardShadowBlur, min: 0, max: 80,
                            onChange: function (v) { setAttributes({ cardShadowBlur: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Spread', 'blockenberg'),
                            value: a.cardShadowSpread, min: -10, max: 20,
                            onChange: function (v) { setAttributes({ cardShadowSpread: v }); }
                        }),
                        el(TextControl, {
                            label: __('Shadow on Hover (CSS)', 'blockenberg'),
                            value: a.cardShadowHover,
                            help: __('Full box-shadow CSS value for hover state.', 'blockenberg'),
                            onChange: function (v) { setAttributes({ cardShadowHover: v }); }
                        })
                    )
                ),

                // ── Colors ────────────────────────────────────────────────────
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Icon', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.iconColor, onChange: function (c) { setAttributes({ iconColor: c || '#3b82f6' }); }, label: __('Icon Color', 'blockenberg') },
                            { value: a.iconBgColor, onChange: function (c) { setAttributes({ iconBgColor: c || '#dbeafe' }); }, label: __('Background', 'blockenberg') }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Text', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.titleColor, onChange: function (c) { setAttributes({ titleColor: c || '#1e293b' }); }, label: __('Title', 'blockenberg') },
                            { value: a.textColor, onChange: function (c) { setAttributes({ textColor: c || '#6b7280' }); }, label: __('Body Text', 'blockenberg') }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Card', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.cardBg, onChange: function (c) { setAttributes({ cardBg: c || '#ffffff' }); }, label: __('Background', 'blockenberg') },
                            { value: a.cardBgHover, onChange: function (c) { setAttributes({ cardBgHover: c || '' }); }, label: __('Background (Hover)', 'blockenberg') },
                            { value: a.cardBorderColor, onChange: function (c) { setAttributes({ cardBorderColor: c || '#e2e8f0' }); }, label: __('Border', 'blockenberg') },
                            { value: a.cardShadowColor, onChange: function (c) { setAttributes({ cardShadowColor: c || 'rgba(0,0,0,0.07)' }); }, label: __('Shadow Color', 'blockenberg') }
                        ]
                    }),
                    a.linkEnabled && el(PanelColorSettings, {
                        title: __('Link Button', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.linkBg, onChange: function (c) { setAttributes({ linkBg: c || '#3b82f6' }); }, label: __('Background', 'blockenberg') },
                            { value: a.linkColor, onChange: function (c) { setAttributes({ linkColor: c || '#ffffff' }); }, label: __('Text', 'blockenberg') },
                            { value: a.linkBgHover, onChange: function (c) { setAttributes({ linkBgHover: c || '#2563eb' }); }, label: __('Background (Hover)', 'blockenberg') },
                            { value: a.linkColorHover, onChange: function (c) { setAttributes({ linkColorHover: c || '#ffffff' }); }, label: __('Text (Hover)', 'blockenberg') },
                            { value: a.linkBorderColor, onChange: function (c) { setAttributes({ linkBorderColor: c || '#3b82f6' }); }, label: __('Border', 'blockenberg') }
                        ]
                    })
                )
            );

            // ── Edit render ────────────────────────────────────────────────────────
            var blockProps = useBlockProps({
                className: 'bkbg-editor-wrap',
                'data-block-label': 'Icon Box'
            });

            return el('div', blockProps,
                inspector,
                el('div', Object.assign({ className: 'bkbg-ib-wrap', style: wrapStyle }, wrapDataAttrs),
                    // Icon
                    iconEl && el('div', { className: 'bkbg-ib-icon-wrap' }, iconEl),

                    // Body
                    el('div', { className: 'bkbg-ib-body' },
                        el(RichText, {
                            tagName: a.titleTag,
                            className: 'bkbg-ib-title',
                            value: a.title,
                            onChange: function (v) { setAttributes({ title: v }); },
                            placeholder: __('Title…', 'blockenberg'),
                            allowedFormats: ['core/bold', 'core/italic', 'core/text-color']
                        }),
                        el(RichText, {
                            tagName: 'p',
                            className: 'bkbg-ib-text',
                            value: a.text,
                            onChange: function (v) { setAttributes({ text: v }); },
                            placeholder: __('Description…', 'blockenberg'),
                            allowedFormats: ['core/bold', 'core/italic', 'core/link', 'core/strikethrough', 'core/text-color']
                        }),
                        a.linkEnabled && el('div', { className: 'bkbg-ib-link-wrap' },
                            el('span', { className: 'bkbg-ib-link' }, a.linkText || __('Learn More', 'blockenberg')),
                            el('span', { className: 'bkbg-ib-link-url-hint' },
                                a.linkUrl ? ' → ' + a.linkUrl : __(' (no URL set)', 'blockenberg')
                            )
                        )
                    )
                )
            );
        },

        // ── Save ─────────────────────────────────────────────────────────────────
        save: function (props) {
            var a = props.attributes;
            var RichTextContent = wp.blockEditor.RichText.Content;

            var wrapStyle = {
                '--bkbg-ib-content-gap': a.contentGap + 'px',
                '--bkbg-ib-icon-size': a.iconSize + 'px',
                '--bkbg-ib-icon-color': a.iconColor,
                '--bkbg-ib-icon-bg': a.iconBgColor,
                '--bkbg-ib-icon-bg-size': a.iconBgSize + 'px',
                '--bkbg-ib-icon-radius': a.iconBgRadius + '%',
                '--bkbg-ib-title-size': a.titleSize + 'px',
                '--bkbg-ib-title-weight': a.titleWeight,
                '--bkbg-ib-title-color': a.titleColor,
                '--bkbg-ib-title-lh': a.titleLineHeight,
                '--bkbg-ib-title-spacing': a.titleSpacing + 'px',
                '--bkbg-ib-text-size': a.textSize + 'px',
                '--bkbg-ib-text-weight': a.textWeight,
                '--bkbg-ib-text-color': a.textColor,
                '--bkbg-ib-text-lh': a.textLineHeight,
                '--bkbg-ib-card-bg': a.cardBg,
                '--bkbg-ib-card-bg-hover': a.cardBgHover || a.cardBg,
                '--bkbg-ib-card-padding': a.cardPaddingTop + 'px ' + a.cardPaddingRight + 'px ' + a.cardPaddingBottom + 'px ' + a.cardPaddingLeft + 'px',
                '--bkbg-ib-card-brd-w': a.cardBorderWidth + 'px',
                '--bkbg-ib-card-brd-style': a.cardBorderStyle,
                '--bkbg-ib-card-brd-color': a.cardBorderColor,
                '--bkbg-ib-card-radius': a.cardBorderRadius + 'px',
                '--bkbg-ib-card-shadow': a.cardShadow
                    ? (a.cardShadowH + 'px ' + a.cardShadowV + 'px ' + a.cardShadowBlur + 'px ' + a.cardShadowSpread + 'px ' + a.cardShadowColor)
                    : 'none',
                '--bkbg-ib-card-shadow-hover': a.cardShadowHover,
                '--bkbg-ib-link-bg': a.linkBg,
                '--bkbg-ib-link-color': a.linkColor,
                '--bkbg-ib-link-bg-hover': a.linkBgHover,
                '--bkbg-ib-link-color-hover': a.linkColorHover,
                '--bkbg-ib-link-brd-color': a.linkBorderColor,
                '--bkbg-ib-link-brd-w': a.linkBorderWidth + 'px',
                '--bkbg-ib-link-size': a.linkSize + 'px',
                '--bkbg-ib-link-weight': a.linkWeight,
                '--bkbg-ib-link-radius': a.linkRadius + 'px',
                '--bkbg-ib-link-padding': a.linkPaddingV + 'px ' + a.linkPaddingH + 'px',
                '--bkbg-ib-link-spacing': a.linkSpacingTop + 'px',
                '--bkbg-ib-text-align': a.textAlign
            };
            var _tv2 = getTypoCssVars();
            if (_tv2) {
                Object.assign(wrapStyle, _tv2(a.titleTypo, '--bkbg-ib-tt-'));
                Object.assign(wrapStyle, _tv2(a.textTypo, '--bkbg-ib-tx-'));
            }

            var wrapDataAttrs = {
                'data-icon-pos': a.iconPosition,
                'data-icon-shape': a.iconShape,
                'data-icon-align': a.iconAlignTop ? 'top' : 'center',
                'data-text-align': a.textAlign,
                'data-link-style': a.linkStyle,
                'data-hover': a.hoverEffect
            };

            // Build save icon
            var saveIconEl = (function () {
                var type = a.iconType;
                if (type === 'none') return null;

                var svgPaths = {
                    check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
                    check2: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.59-7.59L19 7.5l-9 9z',
                    arrow: 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z',
                    'arrow-right': 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
                    star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
                    sparkle: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z',
                    bolt: 'M7 2v11h3v9l7-12h-4l4-8z',
                    dash: 'M4 11h16v2H4z',
                    cross: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
                    heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
                    globe: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
                    shield: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z',
                    rocket: 'M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.38-.37.88-.57 1.41-.57L9.19 6.35zM11.17 19l5.38-5.38c-.45 2.29-2.16 5.89-5.38 5.38zm8.6-14.26c.1-.46.12-.93.07-1.39-.46-.05-.93-.03-1.39.07-1.19.27-2.3.86-3.2 1.76L9.5 11H8l-3 3 3.46.96.58.58.96 3.46 3-3v-1.5l5.82-5.75c.9-.9 1.49-2.01 1.76-3.2zM15 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-6.71 9.21l-1.5-1.5c-.39-.39-.39-1.02 0-1.41l.03-.03c.39-.39 1.02-.39 1.41 0l1.5 1.5c.39.39.39 1.02 0 1.41l-.03.03c-.39.39-1.02.39-1.41 0z'
                };

                var inner;
                if (type === 'custom-image') {
                    if (!a.iconImageUrl) return null;
                    inner = el('img', { src: a.iconImageUrl, alt: '', className: 'bkbg-ib-img-icon', style: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' } });
                } else if (type === 'custom-char') {
                    inner = el('span', { className: 'bkbg-ib-char' }, a.iconChar || '★');
                } else if (type === 'dashicon') {
                    inner = el('span', { className: 'dashicons dashicons-' + a.iconDashicon });
                } else if (type === 'disc') {
                    inner = el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' }, el('circle', { cx: '12', cy: '12', r: '6' }));
                } else if (type === 'square') {
                    inner = el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' }, el('rect', { x: '6', y: '6', width: '12', height: '12', rx: '2' }));
                } else if (svgPaths[type]) {
                    inner = el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' }, el('path', { d: svgPaths[type] }));
                } else {
                    inner = el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' }, el('path', { d: svgPaths.star }));
                }

                return el('span', { className: 'bkbg-ib-icon', 'aria-hidden': 'true' }, inner);
            })();

            return el('div', Object.assign({ className: 'bkbg-ib-wrap', style: wrapStyle }, wrapDataAttrs),
                // Icon
                saveIconEl && el('div', { className: 'bkbg-ib-icon-wrap' }, saveIconEl),

                // Body
                el('div', { className: 'bkbg-ib-body' },
                    el(RichTextContent, {
                        tagName: a.titleTag,
                        className: 'bkbg-ib-title',
                        value: a.title
                    }),
                    el(RichTextContent, {
                        tagName: 'p',
                        className: 'bkbg-ib-text',
                        value: a.text
                    }),
                    a.linkEnabled && el('div', { className: 'bkbg-ib-link-wrap' },
                        el('a', {
                            href: a.linkUrl || '#',
                            className: 'bkbg-ib-link',
                            target: a.linkTarget,
                            rel: a.linkTarget === '_blank' ? 'noopener noreferrer' : undefined
                        }, a.linkText || 'Learn More')
                    )
                )
            );
        }
    });
}() );
