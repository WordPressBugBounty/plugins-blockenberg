( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var useRef = wp.element.useRef;
    var useEffect = wp.element.useEffect;

    var registerBlockType = wp.blocks.registerBlockType;

    var InspectorControls = wp.blockEditor.InspectorControls;
    var BlockControls = wp.blockEditor.BlockControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;

    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;
    var ToolbarGroup = wp.components.ToolbarGroup;
    var ToolbarButton = wp.components.ToolbarButton;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function clone(obj) {
        var out = {};
        for (var k in obj) out[k] = obj[k];
        return out;
    }

    function getAvatarRadius(shape, radiusPx) {
        if (shape === 'circle') return '999px';
        if (shape === 'square') return '0px';
        return (radiusPx || 12) + 'px';
    }

    function openMedia(onSelect) {
        if (!wp || !wp.media) return;
        var frame = wp.media({
            title: __('Select Image', 'blockenberg'),
            button: { text: __('Use image', 'blockenberg') },
            multiple: false
        });

        frame.on('select', function () {
            var attachment = frame.state().get('selection').first().toJSON();
            onSelect(attachment);
        });

        frame.open();
    }

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }

    function renderStars(rating, maxStars, onSelect) {
        var stars = [];
        for (var i = 1; i <= maxStars; i++) {
            var icon = i <= rating ? 'star-filled' : 'star-empty';
            if (typeof onSelect === 'function') {
                stars.push(
                    el('button', {
                        key: i,
                        type: 'button',
                        className: 'bkbg-ts-star-btn',
                        'aria-label': __('Set rating', 'blockenberg') + ': ' + i,
                        onClick: (function (val) {
                            return function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                onSelect(val);
                            };
                        })(i)
                    },
                        el('span', { className: 'bkbg-ts-star dashicons dashicons-' + icon, 'aria-hidden': 'true' })
                    )
                );
            } else {
                stars.push(el('span', { key: i, className: 'bkbg-ts-star dashicons dashicons-' + icon, 'aria-hidden': 'true' }));
            }
        }
        return stars;
    }

    registerBlockType('blockenberg/testimonials', {
        title: __('Testimonials', 'blockenberg'),
        icon: 'testimonial',
        category: 'bkbg-marketing',
        description: __('Customer testimonials with avatars, ratings, and beautiful layouts.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var isSelected = props.isSelected;
            var a = attributes;

            var activeState = useState(0);
            var activeIndex = activeState[0];
            var setActiveIndex = activeState[1];

            function setItems(items) {
                setAttributes({ items: items });
            }

            function updateItem(index, field, value) {
                var next = a.items.map(function (it, i) {
                    if (i !== index) return it;
                    var ni = clone(it);
                    ni[field] = value;
                    return ni;
                });
                setItems(next);
            }

            function updateAvatar(index, image) {
                var img = {
                    id: image && image.id ? image.id : 0,
                    url: image && image.url ? image.url : '',
                    alt: image && image.alt ? image.alt : ''
                };
                updateItem(index, 'avatar', img);
            }

            function addItem() {
                var next = a.items.concat([
                    {
                        quote: __('Write the testimonial here. Click to edit.', 'blockenberg'),
                        name: __('Name', 'blockenberg'),
                        role: __('Role', 'blockenberg'),
                        company: __('Company', 'blockenberg'),
                        rating: 5,
                        avatar: { id: 0, url: '', alt: '' }
                    }
                ]);
                setItems(next);
                setActiveIndex(next.length - 1);
            }

            function removeItem(index) {
                if (a.items.length <= 1) return;
                var next = a.items.filter(function (_, i) { return i !== index; });
                setItems(next);
                setActiveIndex(Math.max(0, Math.min(activeIndex, next.length - 1)));
            }

            function duplicateItem(index) {
                var next = a.items.slice();
                var copy = clone(a.items[index]);
                copy.avatar = clone(copy.avatar || { id: 0, url: '', alt: '' });
                next.splice(index + 1, 0, copy);
                setItems(next);
                setActiveIndex(index + 1);
            }

            function moveItem(index, dir) {
                var ni = index + dir;
                if (ni < 0 || ni >= a.items.length) return;
                var next = a.items.slice();
                var tmp = next[index];
                next[index] = next[ni];
                next[ni] = tmp;
                setItems(next);
                setActiveIndex(ni);
            }

            var fontWeightOptions = [
                { label: '300', value: 300 },
                { label: '400', value: 400 },
                { label: '500', value: 500 },
                { label: '600', value: 600 },
                { label: '700', value: 700 },
                { label: '800', value: 800 }
            ];

            var columnsOptions = [
                { label: '1', value: 1 },
                { label: '2', value: 2 },
                { label: '3', value: 3 },
                { label: '4', value: 4 }
            ];

            var alignOptions = [
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right', 'blockenberg'), value: 'right' }
            ];

            var layoutOptions = [
                { label: __('Grid', 'blockenberg'), value: 'grid' },
                { label: __('Carousel', 'blockenberg'), value: 'carousel' }
            ];

            var avatarShapeOptions = [
                { label: __('Circle', 'blockenberg'), value: 'circle' },
                { label: __('Rounded', 'blockenberg'), value: 'rounded' },
                { label: __('Square', 'blockenberg'), value: 'square' }
            ];

            var activeItem = a.items[activeIndex] || a.items[0];

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'),
                        value: a.layoutStyle,
                        options: layoutOptions,
                        onChange: function (v) { setAttributes({ layoutStyle: v }); }
                    }),
                    a.layoutStyle === 'grid' && el(SelectControl, {
                        label: __('Columns', 'blockenberg'),
                        value: a.columns,
                        options: columnsOptions,
                        onChange: function (v) { setAttributes({ columns: parseInt(v, 10) }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap', 'blockenberg'),
                        value: a.gap,
                        min: 8,
                        max: 60,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Text Align', 'blockenberg'),
                        value: a.textAlign,
                        options: alignOptions,
                        onChange: function (v) { setAttributes({ textAlign: v }); }
                    }),
                    a.layoutStyle === 'carousel' && el(ToggleControl, {
                        label: __('Peek Next Slide', 'blockenberg'),
                        checked: a.carouselPeek,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ carouselPeek: v }); }
                    }),
                    a.layoutStyle === 'carousel' && el(ToggleControl, {
                        label: __('Show Navigation', 'blockenberg'),
                        checked: a.carouselNav,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ carouselNav: v }); }
                    }),
                    a.layoutStyle === 'carousel' && el(SelectControl, {
                        label: __('Arrow Style', 'blockenberg'),
                        value: a.carouselNavStyle,
                        options: [
                            { label: __('Top Right', 'blockenberg'), value: 'top' },
                            { label: __('Overlay Sides', 'blockenberg'), value: 'overlay' },
                            { label: __('Bottom Center', 'blockenberg'), value: 'bottom' }
                        ],
                        onChange: function (v) { setAttributes({ carouselNavStyle: v }); }
                    }),
                    a.layoutStyle === 'carousel' && el(SelectControl, {
                        label: __('Indicators', 'blockenberg'),
                        value: a.carouselIndicators,
                        options: [
                            { label: __('None', 'blockenberg'), value: 'none' },
                            { label: __('Dots', 'blockenberg'), value: 'dots' },
                            { label: __('Progress Bar', 'blockenberg'), value: 'progress' },
                            { label: __('Fraction (1/6)', 'blockenberg'), value: 'fraction' }
                        ],
                        onChange: function (v) { setAttributes({ carouselIndicators: v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.carouselIndicators === 'dots' && el(SelectControl, {
                        label: __('Dots Style', 'blockenberg'),
                        value: a.carouselDotsStyle,
                        options: [
                            { label: __('Dots', 'blockenberg'), value: 'default' },
                            { label: __('Active Pill', 'blockenberg'), value: 'pill' }
                        ],
                        onChange: function (v) { setAttributes({ carouselDotsStyle: v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.carouselIndicators === 'dots' && el(RangeControl, {
                        label: __('Dot Size', 'blockenberg'),
                        value: a.carouselIndicatorSize,
                        min: 6,
                        max: 16,
                        onChange: function (v) { setAttributes({ carouselIndicatorSize: v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.carouselIndicators === 'progress' && el(SelectControl, {
                        label: __('Progress Style', 'blockenberg'),
                        value: a.carouselProgressStyle,
                        options: [
                            { label: __('Contained', 'blockenberg'), value: 'default' },
                            { label: __('Edge-to-edge', 'blockenberg'), value: 'edge' }
                        ],
                        onChange: function (v) { setAttributes({ carouselProgressStyle: v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.carouselIndicators === 'progress' && el(RangeControl, {
                        label: __('Progress Height', 'blockenberg'),
                        value: a.carouselProgressHeight,
                        min: 2,
                        max: 14,
                        onChange: function (v) { setAttributes({ carouselProgressHeight: v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.carouselIndicators !== 'none' && el(SelectControl, {
                        label: __('Indicators Position', 'blockenberg'),
                        value: a.carouselIndicatorsPosition,
                        options: [
                            { label: __('Below', 'blockenberg'), value: 'below' },
                            { label: __('Above', 'blockenberg'), value: 'top' }
                        ],
                        onChange: function (v) { setAttributes({ carouselIndicatorsPosition: v }); }
                    }),
                    a.layoutStyle === 'carousel' && el(ToggleControl, {
                        label: __('Infinite Loop', 'blockenberg'),
                        checked: a.infiniteScroll !== false,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ infiniteScroll: !!v }); }
                    }),
                    a.layoutStyle === 'carousel' && el(ToggleControl, {
                        label: __('Auto-scroll (continuous)', 'blockenberg'),
                        help: __('Runs on the live site (frontend). Please check it there.', 'blockenberg'),
                        checked: !!a.autoScroll,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ autoScroll: !!v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.autoScroll && el(RangeControl, {
                        label: __('Auto-scroll speed (px/sec)', 'blockenberg'),
                        value: a.autoScrollSpeed || 40,
                        min: 5,
                        max: 200,
                        step: 1,
                        onChange: function (v) { setAttributes({ autoScrollSpeed: v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.autoScroll && el(ToggleControl, {
                        label: __('Pause on hover', 'blockenberg'),
                        checked: a.autoScrollPauseOnHover !== false,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ autoScrollPauseOnHover: !!v }); }
                    })
                ),

                el(PanelBody, { title: __('Card', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Padding', 'blockenberg'),
                        value: a.cardPadding,
                        min: 8,
                        max: 60,
                        onChange: function (v) { setAttributes({ cardPadding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.cardRadius,
                        min: 0,
                        max: 40,
                        onChange: function (v) { setAttributes({ cardRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Width', 'blockenberg'),
                        value: a.cardBorderWidth,
                        min: 0,
                        max: 6,
                        onChange: function (v) { setAttributes({ cardBorderWidth: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Shadow', 'blockenberg'),
                        checked: a.cardShadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ cardShadow: v }); }
                    })
                ),

                el(PanelBody, { title: __('Elements', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Quote Icon', 'blockenberg'),
                        checked: a.showQuoteIcon,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showQuoteIcon: v }); }
                    }),
                    a.showQuoteIcon && el(RangeControl, {
                        label: __('Quote Icon Size', 'blockenberg'),
                        value: a.quoteIconSize,
                        min: 12,
                        max: 48,
                        onChange: function (v) { setAttributes({ quoteIconSize: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Avatar', 'blockenberg'),
                        checked: a.showAvatar,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showAvatar: v }); }
                    }),
                    a.showAvatar && el(SelectControl, {
                        label: __('Avatar Shape', 'blockenberg'),
                        value: a.avatarShape,
                        options: avatarShapeOptions,
                        onChange: function (v) { setAttributes({ avatarShape: v }); }
                    }),
                    a.showAvatar && el(RangeControl, {
                        label: __('Avatar Size', 'blockenberg'),
                        value: a.avatarSize,
                        min: 24,
                        max: 120,
                        onChange: function (v) { setAttributes({ avatarSize: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Rating', 'blockenberg'),
                        checked: a.showRating,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showRating: v }); }
                    }),
                    a.showRating && el(RangeControl, {
                        label: __('Max Stars', 'blockenberg'),
                        value: a.ratingStars,
                        min: 3,
                        max: 5,
                        onChange: function (v) { setAttributes({ ratingStars: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Name', 'blockenberg'),
                        checked: a.showName,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showName: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Role', 'blockenberg'),
                        checked: a.showRole,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showRole: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Company', 'blockenberg'),
                        checked: a.showCompany,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showCompany: v }); }
                    })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && getTypoControl()({
                        label: __('Quote', 'blockenberg'),
                        value: a.quoteTypo || {},
                        onChange: function (v) { setAttributes({ quoteTypo: v }); }
                    }),
                    getTypoControl() && getTypoControl()({
                        label: __('Name', 'blockenberg'),
                        value: a.nameTypo || {},
                        onChange: function (v) { setAttributes({ nameTypo: v }); }
                    }),
                    getTypoControl() && getTypoControl()({
                        label: __('Role', 'blockenberg'),
                        value: a.roleTypo || {},
                        onChange: function (v) { setAttributes({ roleTypo: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Rating Size', 'blockenberg'),
                        value: a.ratingSize,
                        min: 12,
                        max: 24,
                        onChange: function (v) { setAttributes({ ratingSize: v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.carouselIndicators === 'fraction' && el(RangeControl, {
                                            label: __('Fraction Text Size', 'blockenberg'),
                                            value: a.carouselFractionSize,
                                            min: 10,
                                            max: 18,
                                            onChange: function (v) { setAttributes({ carouselFractionSize: v }); }
                                        })
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.cardBg, onChange: function (c) { setAttributes({ cardBg: c }); }, label: __('Card Background', 'blockenberg') },
                        { value: a.cardBorderColor, onChange: function (c) { setAttributes({ cardBorderColor: c }); }, label: __('Card Border', 'blockenberg') },
                        { value: a.featuredBorderColor, onChange: function (c) { setAttributes({ featuredBorderColor: c }); }, label: __('Featured Border', 'blockenberg') },
                        { value: a.quoteIconColor, onChange: function (c) { setAttributes({ quoteIconColor: c }); }, label: __('Quote Icon', 'blockenberg') },
                        { value: a.quoteColor, onChange: function (c) { setAttributes({ quoteColor: c }); }, label: __('Quote', 'blockenberg') },
                        { value: a.nameColor, onChange: function (c) { setAttributes({ nameColor: c }); }, label: __('Name', 'blockenberg') },
                        { value: a.roleColor, onChange: function (c) { setAttributes({ roleColor: c }); }, label: __('Role', 'blockenberg') },
                        { value: a.companyColor, onChange: function (c) { setAttributes({ companyColor: c }); }, label: __('Company', 'blockenberg') },
                        { value: a.ratingColor, onChange: function (c) { setAttributes({ ratingColor: c }); }, label: __('Rating', 'blockenberg') },

                        { value: a.carouselIndicatorColor, onChange: function (c) { setAttributes({ carouselIndicatorColor: c }); }, label: __('Carousel Indicator', 'blockenberg') },
                        { value: a.carouselIndicatorActiveColor, onChange: function (c) { setAttributes({ carouselIndicatorActiveColor: c }); }, label: __('Carousel Indicator (Active)', 'blockenberg') },
                        { value: a.carouselProgressBg, onChange: function (c) { setAttributes({ carouselProgressBg: c }); }, label: __('Carousel Progress (Track)', 'blockenberg') },
                        { value: a.carouselProgressFg, onChange: function (c) { setAttributes({ carouselProgressFg: c }); }, label: __('Carousel Progress (Fill)', 'blockenberg') },
                        { value: a.carouselFractionColor, onChange: function (c) { setAttributes({ carouselFractionColor: c }); }, label: __('Carousel Fraction', 'blockenberg') }
                    ]
                }),

                el(PanelBody, { title: __('Selected Testimonial', 'blockenberg'), initialOpen: false },
                    activeItem ? el('div', {},
                        el('div', { style: { marginBottom: '10px', fontWeight: 600 } }, __('Item', 'blockenberg') + ': ' + (activeIndex + 1)),
                        el(ToggleControl, {
                            label: __('Featured Testimonial', 'blockenberg'),
                            checked: a.featuredIndex === activeIndex,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) {
                                setAttributes({ featuredIndex: v ? activeIndex : -1 });
                            }
                        }),
                        el(Button, {
                            isSecondary: true,
                            onClick: function () {
                                openMedia(function (att) {
                                    updateAvatar(activeIndex, { id: att.id, url: att.url, alt: att.alt || '' });
                                });
                            }
                        }, activeItem.avatar && activeItem.avatar.url ? __('Change Avatar', 'blockenberg') : __('Select Avatar', 'blockenberg')),
                        activeItem.avatar && activeItem.avatar.url && el(Button, {
                            isLink: true,
                            isDestructive: true,
                            onClick: function () { updateAvatar(activeIndex, { id: 0, url: '', alt: '' }); }
                        }, __('Remove Avatar', 'blockenberg')),
                        a.showRating && el(RangeControl, {
                            label: __('Rating', 'blockenberg'),
                            value: clamp(parseInt(activeItem.rating || 0, 10), 0, 5),
                            min: 0,
                            max: 5,
                            onChange: function (v) { updateItem(activeIndex, 'rating', v); }
                        })
                    ) : el('div', {}, __('Select a card to edit its settings.', 'blockenberg'))
                )
            );

            var blockControls = el(BlockControls, {},
                el(ToolbarGroup, {},
                    el(ToolbarButton, {
                        icon: 'plus',
                        label: __('Add Testimonial', 'blockenberg'),
                        onClick: addItem
                    }),
                    el(ToolbarButton, {
                        icon: (a.featuredIndex === activeIndex) ? 'star-filled' : 'star-empty',
                        label: __('Toggle Featured', 'blockenberg'),
                        onClick: function () {
                            setAttributes({ featuredIndex: (a.featuredIndex === activeIndex) ? -1 : activeIndex });
                        }
                    })
                )
            );

            var styleVars = {
                '--bkbg-ts-columns': String(a.columns),
                '--bkbg-ts-gap': a.gap + 'px',
                '--bkbg-ts-card-bg': a.cardBg,
                '--bkbg-ts-card-border-color': a.cardBorderColor,
                '--bkbg-ts-card-border-width': a.cardBorderWidth + 'px',
                '--bkbg-ts-card-radius': a.cardRadius + 'px',
                '--bkbg-ts-card-padding': a.cardPadding + 'px',
                '--bkbg-ts-text-align': a.textAlign,
                '--bkbg-ts-featured-border-color': a.featuredBorderColor,
                '--bkbg-ts-quote-icon-color': a.quoteIconColor,
                '--bkbg-ts-quote-icon-size': a.quoteIconSize + 'px',
                '--bkbg-ts-quote-color': a.quoteColor,
                '--bkbg-ts-name-color': a.nameColor,
                '--bkbg-ts-role-color': a.roleColor,
                '--bkbg-ts-company-color': a.companyColor,
                '--bkbg-ts-rating-color': a.ratingColor,
                '--bkbg-ts-rating-size': a.ratingSize + 'px',
                '--bkbg-ts-avatar-size': a.avatarSize + 'px',
                '--bkbg-ts-avatar-radius': getAvatarRadius(a.avatarShape, 12),

                '--bkbg-ts-indicator-size': (a.carouselIndicatorSize || 8) + 'px',
                '--bkbg-ts-indicator-color': a.carouselIndicatorColor,
                '--bkbg-ts-indicator-active-color': a.carouselIndicatorActiveColor,
                '--bkbg-ts-progress-height': (a.carouselProgressHeight || 6) + 'px',
                '--bkbg-ts-progress-bg': a.carouselProgressBg,
                '--bkbg-ts-progress-fg': a.carouselProgressFg,
                '--bkbg-ts-fraction-color': a.carouselFractionColor,
                '--bkbg-ts-fraction-size': (a.carouselFractionSize || 13) + 'px'
            };

            var classes = ['bkbg-ts-wrap', 'bkbg-ts-align-' + a.textAlign];
            if (a.layoutStyle === 'carousel') {
                classes.push('bkbg-ts-carousel');
                if (a.carouselPeek) classes.push('bkbg-ts-carousel-peek');
                classes.push('bkbg-ts-nav-' + (a.carouselNavStyle || 'top'));
                classes.push('bkbg-ts-indicators-' + (a.carouselIndicators || 'none'));
                classes.push('bkbg-ts-indicators-pos-' + (a.carouselIndicatorsPosition || 'below'));

                if (a.carouselIndicators === 'dots') {
                    classes.push('bkbg-ts-dots-style-' + (a.carouselDotsStyle || 'default'));
                }
                if (a.carouselIndicators === 'progress') {
                    classes.push('bkbg-ts-progress-style-' + (a.carouselProgressStyle || 'default'));
                }
            }

            var blockProps = (function () {
                var _tvf = getTypoCssVars();
                if (_tvf) { Object.assign(styleVars, _tvf(a.quoteTypo, '--bkts-qt-'), _tvf(a.nameTypo, '--bkts-nm-'), _tvf(a.roleTypo, '--bkts-rl-')); }
                return useBlockProps({
                    className: 'bkbg-editor-wrap ' + classes.join(' '),
                    style: styleVars,
                    'data-block-label': 'Testimonials'
                });
            })();

            function renderAvatar(item, index) {
                if (!a.showAvatar) return null;
                var hasImg = item.avatar && item.avatar.url;

                return el('div', {
                    className: 'bkbg-ts-avatar',
                    onClick: function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveIndex(index);
                        openMedia(function (att) {
                            updateAvatar(index, { id: att.id, url: att.url, alt: att.alt || '' });
                        });
                    },
                    title: __('Click to change avatar', 'blockenberg')
                },
                    hasImg
                        ? el('img', { src: item.avatar.url, alt: item.avatar.alt || '' })
                        : el('span', { className: 'dashicons dashicons-format-image', 'aria-hidden': 'true' })
                );
            }

            function renderRoleLine(item, index) {
                if (!a.showRole && !a.showCompany) return null;

                return el('p', { className: 'bkbg-ts-roleline' },
                    a.showRole && el(RichText, {
                        tagName: 'span',
                        value: item.role,
                        placeholder: __('Role', 'blockenberg'),
                        onChange: function (v) { updateItem(index, 'role', v); }
                    }),
                    a.showCompany && el(Fragment, {},
                        a.showRole && item.company && el('span', { 'aria-hidden': 'true' }, ' · '),
                        el(RichText, {
                            tagName: 'span',
                            className: 'bkbg-ts-company',
                            value: item.company,
                            placeholder: __('Company', 'blockenberg'),
                            onChange: function (v) { updateItem(index, 'company', v); }
                        })
                    )
                );
            }

            function renderHeader(item, index) {
                return el('div', { className: 'bkbg-ts-meta' },
                    renderAvatar(item, index),
                    el('div', { className: 'bkbg-ts-author' },
                        a.showName && el(RichText, {
                            tagName: 'p',
                            className: 'bkbg-ts-name',
                            value: item.name,
                            placeholder: __('Name', 'blockenberg'),
                            onChange: function (v) { updateItem(index, 'name', v); }
                        }),
                        renderRoleLine(item, index)
                    )
                );
            }

            var trackRef = useRef(null);
            var activeSlideState = useState(0);
            var activeSlide = activeSlideState[0];
            var setActiveSlide = activeSlideState[1];

            var progressState = useState(0);
            var progressPct = progressState[0];
            var setProgressPct = progressState[1];

            function getSlides() {
                if (!trackRef.current) return [];
                return trackRef.current.querySelectorAll('.bkbg-ts-slide');
            }

            function scrollToIndex(i) {
                if (!trackRef.current) return;
                var slides = getSlides();
                if (!slides.length) return;
                var idx = Math.max(0, Math.min(slides.length - 1, i));
                slides[idx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
            }

            function scrollByOne(dir) {
                if (!trackRef.current) return;
                var slides = getSlides();
                if (!slides.length) return;

                var trackRect = trackRef.current.getBoundingClientRect();
                var currentIndex = 0;
                for (var i = 0; i < slides.length; i++) {
                    var r = slides[i].getBoundingClientRect();
                    if (r.left >= trackRect.left - 10) {
                        currentIndex = i;
                        break;
                    }
                }
                scrollToIndex(currentIndex + dir);
            }

            useEffect(function () {
                if (!trackRef.current) return;
                var track = trackRef.current;

                function getScrollPct() {
                    var max = track.scrollWidth - track.clientWidth;
                    if (max <= 0) return 0;
                    var pct = (track.scrollLeft / max) * 100;
                    if (pct < 0) pct = 0;
                    if (pct > 100) pct = 100;
                    return pct;
                }

                function updateActiveFromScroll() {
                    var slides = getSlides();
                    if (!slides.length) return;
                    var trackRect = track.getBoundingClientRect();
                    var idx = 0;
                    for (var i = 0; i < slides.length; i++) {
                        var r = slides[i].getBoundingClientRect();
                        if (r.left >= trackRect.left - 10) {
                            idx = i;
                            break;
                        }
                    }
                    setActiveSlide(idx);

                    // Smooth progress update
                    setProgressPct(getScrollPct());
                }

                updateActiveFromScroll();
                track.addEventListener('scroll', updateActiveFromScroll, { passive: true });
                return function () {
                    track.removeEventListener('scroll', updateActiveFromScroll);
                };
            }, [a.layoutStyle, a.items.length]);

            function renderIndicators() {
                if (a.carouselIndicators === 'none') return null;
                if (a.carouselIndicators === 'progress') {
                    return el('div', { className: 'bkbg-ts-indicators' },
                        el('div', { className: 'bkbg-ts-progress' },
                            el('div', { className: 'bkbg-ts-progress-bar', style: { width: progressPct + '%' } })
                        )
                    );
                }

                if (a.carouselIndicators === 'fraction') {
                    var total = Math.max(1, (a.items || []).length);
                    return el('div', { className: 'bkbg-ts-indicators' },
                        el('div', { className: 'bkbg-ts-fraction', 'aria-label': __('Carousel position', 'blockenberg') },
                            el('span', { className: 'bkbg-ts-fraction-current' }, String(activeSlide + 1)),
                            el('span', { 'aria-hidden': 'true' }, '/'),
                            el('span', { className: 'bkbg-ts-fraction-total' }, String(total))
                        )
                    );
                }

                // dots
                return el('div', { className: 'bkbg-ts-indicators' },
                    el('div', { className: 'bkbg-ts-dots', role: 'tablist', 'aria-label': __('Testimonials Carousel', 'blockenberg') },
                        (a.items || []).map(function (_, i) {
                            return el('button', {
                                key: i,
                                type: 'button',
                                className: 'bkbg-ts-dot' + (i === activeSlide ? ' is-active' : ''),
                                'aria-label': __('Go to slide', 'blockenberg') + ' ' + (i + 1),
                                onClick: function (e) { e.preventDefault(); e.stopPropagation(); scrollToIndex(i); }
                            });
                        })
                    )
                );
            }

            function renderCard(item, index) {
                var isActive = index === activeIndex;
                var isFeatured = a.featuredIndex === index;
                var cardClasses = ['bkbg-ts-card'];
                if (a.cardShadow) cardClasses.push('has-shadow');
                if (isActive && isSelected) cardClasses.push('is-active');
                if (isFeatured) cardClasses.push('is-featured');

                return el('div', {
                    key: index,
                    className: cardClasses.join(' '),
                    onClick: function () { setActiveIndex(index); }
                },
                    el('div', { className: 'bkbg-ts-actions' },
                        el(Button, {
                            icon: 'arrow-left-alt2',
                            label: __('Move Left', 'blockenberg'),
                            disabled: index === 0,
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); moveItem(index, -1); }
                        }),
                        el(Button, {
                            icon: 'arrow-right-alt2',
                            label: __('Move Right', 'blockenberg'),
                            disabled: index === a.items.length - 1,
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); moveItem(index, 1); }
                        }),
                        el(Button, {
                            icon: isFeatured ? 'star-filled' : 'star-empty',
                            label: __('Toggle Featured', 'blockenberg'),
                            onClick: function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                setAttributes({ featuredIndex: isFeatured ? -1 : index });
                            }
                        }),
                        el(Button, {
                            icon: 'admin-page',
                            label: __('Duplicate', 'blockenberg'),
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); duplicateItem(index); }
                        }),
                        el(Button, {
                            icon: 'trash',
                            label: __('Remove', 'blockenberg'),
                            isDestructive: true,
                            disabled: a.items.length <= 1,
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); removeItem(index); }
                        })
                    ),

                    a.showQuoteIcon && el('div', { className: 'bkbg-ts-quote-icon' },
                        el('span', { className: 'dashicons dashicons-format-quote', 'aria-hidden': 'true' })
                    ),

                    el(RichText, {
                        tagName: 'p',
                        className: 'bkbg-ts-quote',
                        value: item.quote,
                        placeholder: __('Testimonial…', 'blockenberg'),
                        onChange: function (v) { updateItem(index, 'quote', v); }
                    }),

                    a.showRating && el('div', { className: 'bkbg-ts-rating', 'aria-label': __('Rating', 'blockenberg') },
                        renderStars(
                            clamp(parseInt(item.rating || 0, 10), 0, 5),
                            a.ratingStars,
                            function (val) {
                                var current = clamp(parseInt(item.rating || 0, 10), 0, 5);
                                updateItem(index, 'rating', (val === current) ? 0 : val);
                            }
                        )
                    ),

                    el('div', {}, renderHeader(item, index))
                );
            }

            var content;
            if (a.layoutStyle === 'carousel') {
                var indicators = renderIndicators();
                var navStyle = a.carouselNavStyle || 'top';
                var nav = a.carouselNav && el('div', { className: 'bkbg-ts-nav' },
                    el('button', {
                        type: 'button',
                        className: 'bkbg-ts-nav-btn',
                        'data-bkbg-nav': 'prev',
                        'aria-label': __('Previous', 'blockenberg'),
                        onClick: function (e) { e.preventDefault(); e.stopPropagation(); scrollByOne(-1); }
                    }, el('span', { className: 'dashicons dashicons-arrow-left-alt2', 'aria-hidden': 'true' })),
                    el('button', {
                        type: 'button',
                        className: 'bkbg-ts-nav-btn',
                        'data-bkbg-nav': 'next',
                        'aria-label': __('Next', 'blockenberg'),
                        onClick: function (e) { e.preventDefault(); e.stopPropagation(); scrollByOne(1); }
                    }, el('span', { className: 'dashicons dashicons-arrow-right-alt2', 'aria-hidden': 'true' }))
                );

                var track = el('div', { className: 'bkbg-ts-carousel-track', ref: trackRef },
                    a.items.map(function (it, idx) {
                        return el('div', { key: idx, className: 'bkbg-ts-slide' }, renderCard(it, idx));
                    })
                );

                // For bottom nav style, render nav outside carousel-inner to avoid z-index issues
                if (navStyle === 'bottom') {
                    content = el('div', { className: 'bkbg-ts-carousel' },
                        (a.carouselIndicatorsPosition === 'top') && indicators,
                        el('div', { className: 'bkbg-ts-carousel-inner' },
                            track
                        ),
                        nav,
                        (a.carouselIndicatorsPosition !== 'top') && indicators
                    );
                } else {
                    content = el('div', { className: 'bkbg-ts-carousel' },
                        (a.carouselIndicatorsPosition === 'top') && indicators,
                        el('div', { className: 'bkbg-ts-carousel-inner' },
                            nav,
                            track
                        ),
                        (a.carouselIndicatorsPosition !== 'top') && indicators
                    );
                }
            } else {
                content = el('div', { className: 'bkbg-ts-grid' }, a.items.map(renderCard));
            }

            return el(Fragment, {},
                inspector,
                blockControls,
                el('div', blockProps,
                    content,

                    el('div', { className: 'bkbg-editor-actions' },
                        el(Button, { variant: 'secondary', icon: 'plus-alt2', onClick: addItem }, __('Add Testimonial', 'blockenberg'))
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            function getAvatarRadius(shape, radiusPx) {
                if (shape === 'circle') return '999px';
                if (shape === 'square') return '0px';
                return (radiusPx || 12) + 'px';
            }

            function clamp(n, min, max) {
                return Math.max(min, Math.min(max, n));
            }

            function renderStars(rating, maxStars) {
                var stars = [];
                for (var i = 1; i <= maxStars; i++) {
                    var icon = i <= rating ? 'star-filled' : 'star-empty';
                    stars.push(el('span', { key: i, className: 'bkbg-ts-star dashicons dashicons-' + icon, 'aria-hidden': 'true' }));
                }
                return stars;
            }

            var _tvf = getTypoCssVars();
            var styleVars = {
                '--bkbg-ts-columns': String(a.columns),
                '--bkbg-ts-gap': a.gap + 'px',
                '--bkbg-ts-card-bg': a.cardBg,
                '--bkbg-ts-card-border-color': a.cardBorderColor,
                '--bkbg-ts-card-border-width': a.cardBorderWidth + 'px',
                '--bkbg-ts-card-radius': a.cardRadius + 'px',
                '--bkbg-ts-card-padding': a.cardPadding + 'px',
                '--bkbg-ts-text-align': a.textAlign,
                '--bkbg-ts-featured-border-color': a.featuredBorderColor,
                '--bkbg-ts-quote-icon-color': a.quoteIconColor,
                '--bkbg-ts-quote-icon-size': a.quoteIconSize + 'px',
                '--bkbg-ts-quote-color': a.quoteColor,
                '--bkbg-ts-name-color': a.nameColor,
                '--bkbg-ts-role-color': a.roleColor,
                '--bkbg-ts-company-color': a.companyColor,
                '--bkbg-ts-rating-color': a.ratingColor,
                '--bkbg-ts-rating-size': a.ratingSize + 'px',
                '--bkbg-ts-avatar-size': a.avatarSize + 'px',
                '--bkbg-ts-avatar-radius': getAvatarRadius(a.avatarShape, 12),

                '--bkbg-ts-indicator-size': (a.carouselIndicatorSize || 8) + 'px',
                '--bkbg-ts-indicator-color': a.carouselIndicatorColor,
                '--bkbg-ts-indicator-active-color': a.carouselIndicatorActiveColor,
                '--bkbg-ts-progress-height': (a.carouselProgressHeight || 6) + 'px',
                '--bkbg-ts-progress-bg': a.carouselProgressBg,
                '--bkbg-ts-progress-fg': a.carouselProgressFg,
                '--bkbg-ts-fraction-color': a.carouselFractionColor,
                '--bkbg-ts-fraction-size': (a.carouselFractionSize || 13) + 'px'
            };
            if (_tvf) { Object.assign(styleVars, _tvf(a.quoteTypo, '--bkts-qt-'), _tvf(a.nameTypo, '--bkts-nm-'), _tvf(a.roleTypo, '--bkts-rl-')); }

            var classes = ['bkbg-ts-wrap', 'bkbg-ts-align-' + a.textAlign];
            if (a.layoutStyle === 'carousel') {
                classes.push('bkbg-ts-carousel');
                if (a.carouselPeek) classes.push('bkbg-ts-carousel-peek');
                classes.push('bkbg-ts-nav-' + (a.carouselNavStyle || 'top'));
                classes.push('bkbg-ts-indicators-' + (a.carouselIndicators || 'none'));
                classes.push('bkbg-ts-indicators-pos-' + (a.carouselIndicatorsPosition || 'below'));

                if (a.carouselIndicators === 'dots') {
                    classes.push('bkbg-ts-dots-style-' + (a.carouselDotsStyle || 'default'));
                }
                if (a.carouselIndicators === 'progress') {
                    classes.push('bkbg-ts-progress-style-' + (a.carouselProgressStyle || 'default'));
                }
            }

            var blockProps = useBlockProps.save({
                className: classes.join(' '),
                style: styleVars,
                'data-bkbg-infinite': a.infiniteScroll === false ? '0' : '1',
                'data-bkbg-autoscroll': a.autoScroll ? '1' : '0',
                'data-bkbg-autoscroll-speed': String(a.autoScrollSpeed || 40),
                'data-bkbg-autoscroll-hover': a.autoScrollPauseOnHover === false ? '0' : '1'
            });

            function renderRoleLine(item) {
                if (!a.showRole && !a.showCompany) return null;

                return el('p', { className: 'bkbg-ts-roleline' },
                    a.showRole && el(RichText.Content, { tagName: 'span', value: item.role }),
                    a.showCompany && el(Fragment, {},
                        a.showRole && item.company && el('span', { 'aria-hidden': 'true' }, ' · '),
                        el(RichText.Content, { tagName: 'span', className: 'bkbg-ts-company', value: item.company })
                    )
                );
            }

            function renderHeader(item) {
                return el('div', { className: 'bkbg-ts-meta' },
                    a.showAvatar && el('div', { className: 'bkbg-ts-avatar' },
                        item.avatar && item.avatar.url
                            ? el('img', { src: item.avatar.url, alt: (item.avatar.alt || '') })
                            : el('span', { className: 'dashicons dashicons-format-image', 'aria-hidden': 'true' })
                    ),
                    el('div', { className: 'bkbg-ts-author' },
                        a.showName && el(RichText.Content, { tagName: 'p', className: 'bkbg-ts-name', value: item.name }),
                        renderRoleLine(item)
                    )
                );
            }

            function renderCard(item, index) {
                var cardClasses = ['bkbg-ts-card'];
                if (a.cardShadow) cardClasses.push('has-shadow');
                if (a.featuredIndex === index) cardClasses.push('is-featured');

                return el('div', {
                    key: index,
                    className: (a.layoutStyle === 'carousel' ? 'bkbg-ts-slide ' : '') + cardClasses.join(' ')
                },
                    a.showQuoteIcon && el('div', { className: 'bkbg-ts-quote-icon' },
                        el('span', { className: 'dashicons dashicons-format-quote', 'aria-hidden': 'true' })
                    ),
                    el(RichText.Content, { tagName: 'p', className: 'bkbg-ts-quote', value: item.quote }),
                    a.showRating && el('div', { className: 'bkbg-ts-rating', 'aria-label': __('Rating', 'blockenberg') },
                        renderStars(clamp(parseInt(item.rating || 0, 10), 0, 5), a.ratingStars)
                    ),
                    renderHeader(item)
                );
            }

            function renderIndicators() {
                if (a.carouselIndicators === 'none') return null;

                if (a.carouselIndicators === 'progress') {
                    return el('div', { className: 'bkbg-ts-indicators' },
                        el('div', { className: 'bkbg-ts-progress' },
                            el('div', { className: 'bkbg-ts-progress-bar', style: { width: '0%' } })
                        )
                    );
                }

                if (a.carouselIndicators === 'fraction') {
                    var total = Math.max(1, (a.items || []).length);
                    return el('div', { className: 'bkbg-ts-indicators' },
                        el('div', { className: 'bkbg-ts-fraction', 'aria-label': __('Carousel position', 'blockenberg') },
                            el('span', { className: 'bkbg-ts-fraction-current', 'data-bkbg-fraction': 'current' }, '1'),
                            el('span', { 'aria-hidden': 'true' }, '/'),
                            el('span', { className: 'bkbg-ts-fraction-total', 'data-bkbg-fraction': 'total' }, String(total))
                        )
                    );
                }

                return el('div', { className: 'bkbg-ts-indicators' },
                    el('div', { className: 'bkbg-ts-dots', role: 'tablist', 'aria-label': __('Testimonials Carousel', 'blockenberg') },
                        (a.items || []).map(function (_, i) {
                            return el('button', {
                                key: i,
                                type: 'button',
                                className: 'bkbg-ts-dot' + (i === 0 ? ' is-active' : ''),
                                'data-bkbg-dot': String(i),
                                'aria-label': __('Go to slide', 'blockenberg') + ' ' + (i + 1)
                            });
                        })
                    )
                );
            }

            var content;
            if (a.layoutStyle === 'carousel') {
                var indicators = renderIndicators();
                content = el('div', { className: 'bkbg-ts-carousel' },
                    (a.carouselIndicatorsPosition === 'top') && indicators,
                    el('div', { className: 'bkbg-ts-carousel-inner' },
                        a.carouselNav && el('div', { className: 'bkbg-ts-nav' },
                            el('button', { type: 'button', className: 'bkbg-ts-nav-btn', 'data-bkbg-nav': 'prev', 'data-ts-nav': 'prev', 'aria-label': __('Previous', 'blockenberg') },
                                el('span', { className: 'dashicons dashicons-arrow-left-alt2', 'aria-hidden': 'true' })
                            ),
                            el('button', { type: 'button', className: 'bkbg-ts-nav-btn', 'data-bkbg-nav': 'next', 'data-ts-nav': 'next', 'aria-label': __('Next', 'blockenberg') },
                                el('span', { className: 'dashicons dashicons-arrow-right-alt2', 'aria-hidden': 'true' })
                            )
                        ),
                        el('div', { className: 'bkbg-ts-carousel-track' },
                            (a.items || []).map(renderCard)
                        )
                    ),
                    (a.carouselIndicatorsPosition !== 'top') && indicators
                );
            } else {
                content = el('div', { className: 'bkbg-ts-grid' }, (a.items || []).map(renderCard));
            }

            return el('div', blockProps, content);
        }
    });
}() );
