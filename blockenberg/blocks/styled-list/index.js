( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;
    var useMemo = wp.element.useMemo;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var BlockControls = wp.blockEditor.BlockControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var ToolbarGroup = wp.components.ToolbarGroup;
    var ToolbarButton = wp.components.ToolbarButton;
    var TabPanel = wp.components.TabPanel;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

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
        )
    };

    // ── Dashicons list (subset) ──────────────────────────────────────────────────
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
        'wordpress', 'superhero', 'superhero-alt', 'plugins-checked',
        'food', 'coffee', 'beer', 'car', 'airplane', 'palmtree', 'building', 'store',
        'smiley', 'bell', 'megaphone', 'microphone', 'games', 'tickets', 'tickets-alt',
        'privacy', 'shield', 'shield-alt', 'vault', 'sos', 'nametag', 'clipboard',
        'sticky', 'open-folder', 'paperclip', 'printer', 'shortcode', 'layout', 'saved',
        'plus', 'plus-alt', 'plus-alt2', 'minus', 'dismiss', 'remove', 'insert',
        'ellipsis', 'external', 'exit', 'fullscreen-alt', 'fullscreen-exit-alt'
    ];

    function getBuiltInIcon(type) {
        return builtInIcons[type] || builtInIcons.check;
    }

    // ── Helper: resolve effective icon settings for an item ─────────────────────
    function resolveItemIcon(a, item) {
        // Per-item icon overrides global if set (no flag required)
        var hasPerItem = item && item.itemIconType;
        var type = hasPerItem ? item.itemIconType : a.iconType;
        var customChar = hasPerItem ? (item.itemIconChar || a.customChar) : a.customChar;
        var dashicon = hasPerItem ? (item.itemIconDashicon || a.customDashicon) : a.customDashicon;
        var imageUrl = hasPerItem ? (item.itemIconUrl || a.customImageUrl) : a.customImageUrl;
        return { type: type, customChar: customChar, dashicon: dashicon, imageUrl: imageUrl };
    }

    // ── Helper: build icon element for editor/save ───────────────────────────────
    function buildIconEl(a, item, index) {
        var resolved = resolveItemIcon(a, item);
        var type = resolved.type;
        var color = (a.perItemColor && item && item.customColor) ? item.customColor : a.iconColor;

        if (type === 'none') return null;

        var inner;

        if (type === 'custom-image') {
            var url = resolved.imageUrl;
            if (!url) return null;
            inner = el('img', {
                src: url,
                alt: '',
                className: 'bkbg-sl-img-icon',
                style: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' }
            });
        } else if (type === 'number') {
            inner = el('span', { className: 'bkbg-sl-num' }, (index + 1) + '');
        } else if (type === 'custom-char') {
            inner = el('span', { className: 'bkbg-sl-char' }, resolved.customChar || '→');
        } else if (type === 'dashicon') {
            inner = el('span', { className: 'dashicons dashicons-' + resolved.dashicon });
        } else if (builtInIcons[type]) {
            inner = getBuiltInIcon(type);
        } else {
            inner = getBuiltInIcon('check');
        }

        return el('span', {
            className: 'bkbg-sl-icon',
            'aria-hidden': 'true',
            style: (color && type !== 'custom-image') ? { color: color } : {}
        }, inner);
    }

    registerBlockType('blockenberg/styled-list', {
        title: __('Styled List', 'blockenberg'),
        icon: 'editor-ul',
        category: 'bkbg-content',
        description: __('Fully customizable list with icons, rich text, and flexible layout options.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var isSelected = props.isSelected;
            var a = attributes;

            // State: which item is focused
            var activeState = useState(null);
            var activeItem = activeState[0];
            var setActiveItem = activeState[1];

            // FIX: clear active item when block is deselected
            useEffect(function () {
                if (!isSelected) { setActiveItem(null); }
            }, [isSelected]);

            // State: dashicon picker open for which item ('global' | index | null)
            var iconPickerState = useState(null);
            var openIconPicker = iconPickerState[0];
            var setOpenIconPicker = iconPickerState[1];

            // State: per-item icon picker open (stores index or null)
            var itemIconPickerState = useState(null);
            var openItemIconPicker = itemIconPickerState[0];
            var setOpenItemIconPicker = itemIconPickerState[1];

            // State: per-item color picker
            var colorPickerState = useState(null);
            var colorPicker = colorPickerState[0];
            var setColorPicker = colorPickerState[1];

            // State: dashicon search
            var searchState = useState('');
            var iconSearch = searchState[0];
            var setIconSearch = searchState[1];

            // Filtered dashicons
            var filteredDashicons = useMemo(function () {
                if (!iconSearch) return dashicons;
                var s = iconSearch.toLowerCase();
                return dashicons.filter(function (d) { return d.includes(s); });
            }, [iconSearch]);

            // ── Helpers ────────────────────────────────────────────────────────────
            function updateItem(index, key, value) {
                var newItems = a.items.slice();
                newItems[index] = Object.assign({}, newItems[index]);
                newItems[index][key] = value;
                setAttributes({ items: newItems });
            }

            function addItem() {
                setAttributes({
                    items: a.items.concat([{
                        text: __('New list item — click to edit', 'blockenberg'),
                        description: '',
                        customColor: ''
                    }])
                });
            }

            function removeItem(index) {
                if (a.items.length <= 1) return;
                setAttributes({ items: a.items.filter(function (_, i) { return i !== index; }) });
            }

            function moveItem(index, dir) {
                var next = index + dir;
                if (next < 0 || next >= a.items.length) return;
                var newItems = a.items.slice();
                var tmp = newItems[index];
                newItems[index] = newItems[next];
                newItems[next] = tmp;
                setAttributes({ items: newItems });
            }

            function duplicateItem(index) {
                var newItems = a.items.slice();
                newItems.splice(index + 1, 0, Object.assign({}, a.items[index]));
                setAttributes({ items: newItems });
            }

            // ── Option lists ───────────────────────────────────────────────────────
            var listStyleOptions = [
                { label: __('Vertical (Stack)', 'blockenberg'), value: 'vertical' },
                { label: __('Two Columns', 'blockenberg'), value: 'grid' },
                { label: __('Custom Columns', 'blockenberg'), value: 'grid-custom' }
            ];
            var iconTypeOptions = [
                { label: __('Checkmark ✓', 'blockenberg'), value: 'check' },
                { label: __('Check Circle ●✓', 'blockenberg'), value: 'check2' },
                { label: __('Arrow ›', 'blockenberg'), value: 'arrow' },
                { label: __('Arrow Right →', 'blockenberg'), value: 'arrow-right' },
                { label: __('Disc •', 'blockenberg'), value: 'disc' },
                { label: __('Square ▪', 'blockenberg'), value: 'square' },
                { label: __('Star ★', 'blockenberg'), value: 'star' },
                { label: __('Sparkle ✦', 'blockenberg'), value: 'sparkle' },
                { label: __('Bolt ⚡', 'blockenberg'), value: 'bolt' },
                { label: __('Dash —', 'blockenberg'), value: 'dash' },
                { label: __('Cross ✕', 'blockenberg'), value: 'cross' },
                { label: __('Number 1 2 3', 'blockenberg'), value: 'number' },
                { label: __('Custom Character', 'blockenberg'), value: 'custom-char' },
                { label: __('Custom Image', 'blockenberg'), value: 'custom-image' },
                { label: __('Dashicon', 'blockenberg'), value: 'dashicon' },
                { label: __('None', 'blockenberg'), value: 'none' }
            ];

            // Also used for per-item picker — same options + "Use Global"
            var itemIconTypeOptions = [{ label: __('— Use Global Icon —', 'blockenberg'), value: '' }].concat(iconTypeOptions);
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
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Right', 'blockenberg'), value: 'right' }
            ];
            var borderStyleOptions = [
                { label: __('Solid', 'blockenberg'), value: 'solid' },
                { label: __('Dashed', 'blockenberg'), value: 'dashed' },
                { label: __('Dotted', 'blockenberg'), value: 'dotted' }
            ];
            var fontWeightOptions = [
                { label: '300', value: 300 },
                { label: '400 — Regular', value: 400 },
                { label: '500 — Medium', value: 500 },
                { label: '600 — Semibold', value: 600 },
                { label: '700 — Bold', value: 700 },
                { label: '800 — Extrabold', value: 800 }
            ];
            var alignmentOptions = [
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right', 'blockenberg'), value: 'right' }
            ];

            // ── Dynamic computed styles for preview ────────────────────────────────
            var wrapDataAttrs = {
                'data-list-style': a.listStyle,
                'data-icon-type': a.iconType,
                'data-icon-shape': a.iconShape,
                'data-icon-pos': a.iconPosition,
                'data-icon-align': a.iconAlignTop ? 'top' : 'center',
                'data-divider': a.dividerEnabled ? '1' : '0',
                'data-align': a.alignment
            };

            // Compute inline layout so it always wins over editor iframe resets
            var isHorizontal = a.listStyle === 'horizontal';
            var isGrid = a.listStyle === 'grid' || a.listStyle === 'grid-custom';
            var computedDisplay = isGrid ? 'grid' : 'flex';
            var computedFlexDir = isHorizontal ? 'row' : 'column';

            var wrapStyle = {
                display: computedDisplay,
                flexDirection: isHorizontal ? 'row' : (isGrid ? undefined : 'column'),
                flexWrap: isHorizontal ? 'wrap' : undefined,
                gridTemplateColumns: isGrid ? ('repeat(' + ((a.listStyle === 'grid-custom') ? a.columns : 2) + ', 1fr)') : undefined,
                gap: isHorizontal ? (a.gap + 'px ' + a.columnGap + 'px') : (a.gap + 'px'),
                columnGap: isGrid ? (a.columnGap + 'px') : undefined,
                '--bkbg-sl-gap': a.gap + 'px',
                '--bkbg-sl-col-gap': a.columnGap + 'px',
                '--bkbg-sl-columns': (a.listStyle === 'grid-custom') ? a.columns : (a.listStyle === 'grid' ? 2 : 1),
                '--bkbg-sl-icon-size': a.iconSize + 'px',
                '--bkbg-sl-icon-color': a.iconColor,
                '--bkbg-sl-icon-bg': a.iconBgColor,
                '--bkbg-sl-icon-bg-size': a.iconBgSize + 'px',
                '--bkbg-sl-icon-radius': a.iconBgRadius + '%',
                '--bkbg-sl-item-padding': a.itemPaddingTop + 'px ' + a.itemPaddingRight + 'px ' + a.itemPaddingBottom + 'px ' + a.itemPaddingLeft + 'px',
                '--bkbg-sl-item-bg': a.itemBg,
                '--bkbg-sl-item-bg-hover': a.itemBgHover || a.itemBg,
                '--bkbg-sl-item-brd-w': a.itemBorderWidth + 'px',
                '--bkbg-sl-item-brd-color': a.itemBorderColor,
                '--bkbg-sl-item-brd-style': a.itemBorderStyle,
                '--bkbg-sl-item-radius': a.itemBorderRadius + 'px',
                '--bkbg-sl-divider-color': a.dividerColor,
                '--bkbg-sl-divider-w': a.dividerWidth + 'px',
                '--bkbg-sl-text-color': a.textColor,
                '--bkbg-sl-desc-color': a.descColor
            };
            var _tvf = getTypoCssVars();
            Object.assign(wrapStyle, _tvf(a.textTypo, '--bksl-tx-'));
            Object.assign(wrapStyle, _tvf(a.descTypo,  '--bksl-ds-'));

            // ── Open media library for image icon ─────────────────────────────────
            function openMediaLibrary(onSelect) {
                var frame = wp.media({
                    title: __('Select Icon Image', 'blockenberg'),
                    button: { text: __('Use as Icon', 'blockenberg') },
                    multiple: false,
                    library: { type: 'image' }
                });
                frame.on('select', function () {
                    var attachment = frame.state().get('selection').first().toJSON();
                    onSelect(attachment.url);
                });
                frame.open();
            }

            // ── Dashicon picker popover ────────────────────────────────────────────
            function renderDashiconPicker(onPick) {
                return el(Popover, {
                    position: 'bottom left',
                    className: 'bkbg-sl-icon-popover',
                    onClose: function () {
                        setOpenIconPicker(null);
                        setIconSearch('');
                    }
                },
                    el('div', {
                        className: 'bkbg-sc-icon-picker-modal',
                        onMouseDown: function (e) { e.stopPropagation(); },
                        onClick: function (e) { e.stopPropagation(); }
                    },
                        el('div', { className: 'bkbg-sc-icon-picker-header' },
                            el('h3', {}, __('Choose Dashicon', 'blockenberg')),
                            el(Button, {
                                icon: 'no-alt',
                                onClick: function () { setOpenIconPicker(null); setIconSearch(''); },
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
                                    var isActive = (typeof onPick === 'function' ? false : a.customDashicon === icon);
                                    return el('button', {
                                        key: icon,
                                        type: 'button',
                                        className: 'bkbg-sc-dashicon-btn' + (isActive ? ' is-active' : ''),
                                        onClick: function () {
                                            if (typeof onPick === 'function') { onPick(icon); }
                                            else { setAttributes({ customDashicon: icon }); }
                                            setOpenIconPicker(null);
                                            setIconSearch('');
                                        },
                                        title: icon
                                    },
                                        el('span', { className: 'dashicons dashicons-' + icon })
                                    );
                                })
                        )
                    )
                );
            }

            // ── Inspector Controls ─────────────────────────────────────────────────
            var inspector = el(InspectorControls, {},

                // ── Layout ────────────────────────────────────────────────────────
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('List Layout', 'blockenberg'),
                        value: a.listStyle,
                        options: listStyleOptions,
                        onChange: function (v) { setAttributes({ listStyle: v }); }
                    }),
                    (a.listStyle === 'grid-custom') && el(RangeControl, {
                        label: __('Columns', 'blockenberg'),
                        value: a.columns,
                        min: 2,
                        max: 6,
                        onChange: function (v) { setAttributes({ columns: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Text Alignment', 'blockenberg'),
                        value: a.alignment,
                        options: alignmentOptions,
                        onChange: function (v) { setAttributes({ alignment: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Row Gap', 'blockenberg'),
                        value: a.gap,
                        min: 0,
                        max: 60,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    }),
                    (a.listStyle === 'grid' || a.listStyle === 'grid-custom' || a.listStyle === 'horizontal') && el(RangeControl, {
                        label: __('Column Gap', 'blockenberg'),
                        value: a.columnGap,
                        min: 0,
                        max: 80,
                        onChange: function (v) { setAttributes({ columnGap: v }); }
                    })
                ),

                // ── Icon ──────────────────────────────────────────────────────────
                el(PanelBody, { title: __('Icon', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Icon Type', 'blockenberg'),
                        value: a.iconType,
                        options: iconTypeOptions,
                        onChange: function (v) { setAttributes({ iconType: v }); }
                    }),

                    // Custom char input
                    (a.iconType === 'custom-char') && el(TextControl, {
                        label: __('Custom Character', 'blockenberg'),
                        value: a.customChar,
                        onChange: function (v) { setAttributes({ customChar: v }); },
                        help: __('Enter any character or emoji, e.g. → ✦ ◆ 🔥', 'blockenberg')
                    }),

                    // Custom image upload
                    (a.iconType === 'custom-image') && el('div', { style: { marginBottom: '16px' } },
                        el('p', { className: 'components-base-control__label' }, __('Image Icon', 'blockenberg')),
                        a.customImageUrl && el('div', { style: { marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' } },
                            el('img', { src: a.customImageUrl, alt: '', style: { width: '40px', height: '40px', objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px' } }),
                            el(Button, {
                                isSmall: true,
                                isDestructive: true,
                                variant: 'secondary',
                                onClick: function () { setAttributes({ customImageUrl: '' }); }
                            }, __('Remove', 'blockenberg'))
                        ),
                        el(Button, {
                            variant: 'secondary',
                            onClick: function () { openMediaLibrary(function (url) { setAttributes({ customImageUrl: url }); }); }
                        },
                            el('span', { className: 'dashicons dashicons-upload', style: { marginRight: '4px' } }),
                            a.customImageUrl ? __('Replace Image', 'blockenberg') : __('Select from Media Library', 'blockenberg')
                        )
                    ),

                    // Dashicon picker button
                    (a.iconType === 'dashicon') && el('div', { style: { marginBottom: '16px' } },
                        el('p', { className: 'components-base-control__label' }, __('Dashicon', 'blockenberg')),
                        el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                            el('span', { className: 'dashicons dashicons-' + a.customDashicon, style: { fontSize: '24px', width: '24px', height: '24px' } }),
                            el(Button, {
                                variant: 'secondary',
                                isSmall: true,
                                onClick: function () { setOpenIconPicker(openIconPicker ? null : 'global'); }
                            }, __('Change Icon', 'blockenberg')),
                            openIconPicker === 'global' && renderDashiconPicker()
                        )
                    ),

                    el(SelectControl, {
                        label: __('Icon Shape', 'blockenberg'),
                        value: a.iconShape,
                        options: iconShapeOptions,
                        onChange: function (v) { setAttributes({ iconShape: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Icon Position', 'blockenberg'),
                        value: a.iconPosition,
                        options: iconPositionOptions,
                        onChange: function (v) { setAttributes({ iconPosition: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Align icon to top', 'blockenberg'),
                        help: __('By default icon aligns to the first line of text.', 'blockenberg'),
                        checked: a.iconAlignTop,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ iconAlignTop: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Icon Size', 'blockenberg'),
                        value: a.iconSize,
                        min: 10,
                        max: 60,
                        onChange: function (v) { setAttributes({ iconSize: v }); }
                    }),
                    (a.iconShape !== 'none') && el(RangeControl, {
                        label: __('Icon Container Size', 'blockenberg'),
                        value: a.iconBgSize,
                        min: 20,
                        max: 80,
                        onChange: function (v) { setAttributes({ iconBgSize: v }); }
                    }),
                    (a.iconShape !== 'none' && (a.iconShape === 'rounded-filled' || a.iconShape === 'rounded-outline')) && el(RangeControl, {
                        label: __('Container Radius', 'blockenberg'),
                        value: a.iconBgRadius,
                        min: 0,
                        max: 50,
                        onChange: function (v) { setAttributes({ iconBgRadius: v }); }
                    })
                ),

                // ── Item Style ────────────────────────────────────────────────────
                el(PanelBody, { title: __('Item Style', 'blockenberg'), initialOpen: false },
                    el('p', { className: 'components-base-control__label', style: { marginBottom: '8px' } }, __('Item Padding', 'blockenberg')),
                    el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' } },
                        el(RangeControl, { label: __('Top', 'blockenberg'), value: a.itemPaddingTop, min: 0, max: 40, onChange: function (v) { setAttributes({ itemPaddingTop: v }); } }),
                        el(RangeControl, { label: __('Right', 'blockenberg'), value: a.itemPaddingRight, min: 0, max: 40, onChange: function (v) { setAttributes({ itemPaddingRight: v }); } }),
                        el(RangeControl, { label: __('Bottom', 'blockenberg'), value: a.itemPaddingBottom, min: 0, max: 40, onChange: function (v) { setAttributes({ itemPaddingBottom: v }); } }),
                        el(RangeControl, { label: __('Left', 'blockenberg'), value: a.itemPaddingLeft, min: 0, max: 40, onChange: function (v) { setAttributes({ itemPaddingLeft: v }); } })
                    ),
                    el(RangeControl, {
                        label: __('Border Width', 'blockenberg'),
                        value: a.itemBorderWidth,
                        min: 0,
                        max: 6,
                        onChange: function (v) { setAttributes({ itemBorderWidth: v }); }
                    }),
                    (a.itemBorderWidth > 0) && el(SelectControl, {
                        label: __('Border Style', 'blockenberg'),
                        value: a.itemBorderStyle,
                        options: borderStyleOptions,
                        onChange: function (v) { setAttributes({ itemBorderStyle: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.itemBorderRadius,
                        min: 0,
                        max: 32,
                        onChange: function (v) { setAttributes({ itemBorderRadius: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Item Shadow', 'blockenberg'),
                        checked: a.itemShadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ itemShadow: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Divider between items', 'blockenberg'),
                        checked: a.dividerEnabled,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ dividerEnabled: v }); }
                    }),
                    a.dividerEnabled && el(RangeControl, {
                        label: __('Divider Height', 'blockenberg'),
                        value: a.dividerWidth,
                        min: 1,
                        max: 4,
                        onChange: function (v) { setAttributes({ dividerWidth: v }); }
                    })
                ),

                // ── Typography ────────────────────────────────────────────────────
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl()({ label: __('Main Text', 'blockenberg'), value: a.textTypo, onChange: function (v) { setAttributes({ textTypo: v }); } }),
                    el(ToggleControl, {
                        label: __('Show description line', 'blockenberg'),
                        help: __('Add a secondary text beneath each item.', 'blockenberg'),
                        checked: a.showDescription,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showDescription: v }); }
                    }),
                    a.showDescription && getTypoControl()({ label: __('Description Text', 'blockenberg'), value: a.descTypo, onChange: function (v) { setAttributes({ descTypo: v }); } })
                ),

                // ── Colors ────────────────────────────────────────────────────────
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Icon', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            {
                                value: a.iconColor,
                                onChange: function (v) { setAttributes({ iconColor: v || '#3b82f6' }); },
                                label: __('Icon Color', 'blockenberg')
                            },
                            (a.iconShape !== 'none') ? {
                                value: a.iconBgColor,
                                onChange: function (v) { setAttributes({ iconBgColor: v || '#dbeafe' }); },
                                label: __('Icon Background', 'blockenberg')
                            } : null
                        ].filter(Boolean)
                    }),
                    el(PanelColorSettings, {
                        title: __('Text', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            {
                                value: a.textColor,
                                onChange: function (v) { setAttributes({ textColor: v || '#374151' }); },
                                label: __('Text Color', 'blockenberg')
                            },
                            a.showDescription ? {
                                value: a.descColor,
                                onChange: function (v) { setAttributes({ descColor: v || '#6b7280' }); },
                                label: __('Description Color', 'blockenberg')
                            } : null
                        ].filter(Boolean)
                    }),
                    el(PanelColorSettings, {
                        title: __('Item', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            {
                                value: a.itemBg,
                                onChange: function (v) { setAttributes({ itemBg: v || 'transparent' }); },
                                label: __('Item Background', 'blockenberg')
                            },
                            (a.itemBorderWidth > 0) ? {
                                value: a.itemBorderColor,
                                onChange: function (v) { setAttributes({ itemBorderColor: v || '#e2e8f0' }); },
                                label: __('Item Border Color', 'blockenberg')
                            } : null,
                            a.dividerEnabled ? {
                                value: a.dividerColor,
                                onChange: function (v) { setAttributes({ dividerColor: v || '#e2e8f0' }); },
                                label: __('Divider Color', 'blockenberg')
                            } : null
                        ].filter(Boolean)
                    })
                ),

                // ── Per-item settings ─────────────────────────────────────────────
                el(PanelBody, { title: __('Per-item Options', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Enable per-item icon color', 'blockenberg'),
                        help: __('Set a custom icon color per item in the canvas.', 'blockenberg'),
                        checked: a.perItemColor,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ perItemColor: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Enable per-item icon override', 'blockenberg'),
                        help: __('Set a custom icon type / image for individual items.', 'blockenberg'),
                        checked: a.perItemIcon,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ perItemIcon: v }); }
                    })
                )
            );

            // ── Block Controls (Toolbar) ───────────────────────────────────────────
            var blockControls = el(BlockControls, {},
                el(ToolbarGroup, {},
                    el(ToolbarButton, {
                        icon: 'editor-alignleft',
                        title: __('Align Left', 'blockenberg'),
                        isActive: a.alignment === 'left',
                        onClick: function () { setAttributes({ alignment: 'left' }); }
                    }),
                    el(ToolbarButton, {
                        icon: 'editor-aligncenter',
                        title: __('Align Center', 'blockenberg'),
                        isActive: a.alignment === 'center',
                        onClick: function () { setAttributes({ alignment: 'center' }); }
                    }),
                    el(ToolbarButton, {
                        icon: 'editor-alignright',
                        title: __('Align Right', 'blockenberg'),
                        isActive: a.alignment === 'right',
                        onClick: function () { setAttributes({ alignment: 'right' }); }
                    })
                )
            );

            // ── Render items ──────────────────────────────────────────────────────
            var itemsEl = a.items.map(function (item, index) {
                // Toolbar only when block is selected AND this item is focused
                var isActive2 = isSelected && activeItem === index;
                var itemColor = (a.perItemColor && item.customColor) ? item.customColor : null;
                var iconEl = buildIconEl(a, item, index);

                return el('div', {
                    key: 'item-' + index,
                    className: 'bkbg-sl-item' + (isActive2 ? ' is-focused' : '') + (a.itemShadow ? ' has-shadow' : ''),
                    onClick: function () { setActiveItem(index); }
                },
                    // ── Item toolbar ──────────────────────────────────────────
                    isActive2 && el('div', { className: 'bkbg-sl-item-toolbar' },
                        el(Button, {
                            icon: 'arrow-up-alt2',
                            label: __('Move Up', 'blockenberg'),
                            isSmall: true,
                            disabled: index === 0,
                            onClick: function (e) { e.stopPropagation(); moveItem(index, -1); }
                        }),
                        el(Button, {
                            icon: 'arrow-down-alt2',
                            label: __('Move Down', 'blockenberg'),
                            isSmall: true,
                            disabled: index === a.items.length - 1,
                            onClick: function (e) { e.stopPropagation(); moveItem(index, 1); }
                        }),
                        el(Button, {
                            icon: 'admin-page',
                            label: __('Duplicate', 'blockenberg'),
                            isSmall: true,
                            onClick: function (e) { e.stopPropagation(); duplicateItem(index); }
                        }),
                        // Per-item color picker
                        a.perItemColor && el('div', { style: { position: 'relative', display: 'inline-block' } },
                            el(Button, {
                                isSmall: true,
                                onClick: function (e) {
                                    e.stopPropagation();
                                    setColorPicker(colorPicker === index ? null : index);
                                },
                                style: { display: 'flex', alignItems: 'center', gap: '4px' }
                            },
                                el('span', {
                                    style: {
                                        display: 'inline-block',
                                        width: '14px',
                                        height: '14px',
                                        borderRadius: '50%',
                                        background: item.customColor || a.iconColor,
                                        border: '1px solid rgba(0,0,0,.2)'
                                    }
                                }),
                                __('Color', 'blockenberg')
                            ),
                            colorPicker === index && el(Popover, {
                                position: 'bottom center',
                                onClose: function () { setColorPicker(null); }
                            },
                                el('div', {
                                    style: { padding: '8px' },
                                    onMouseDown: function (e) { e.stopPropagation(); }
                                },
                                    el(ColorPicker, {
                                        color: item.customColor || a.iconColor,
                                        onChange: function (v) { updateItem(index, 'customColor', v); }
                                    }),
                                    item.customColor && el(Button, {
                                        isSmall: true,
                                        isDestructive: true,
                                        onClick: function () { updateItem(index, 'customColor', ''); }
                                    }, __('Reset', 'blockenberg'))
                                )
                            )
                        ),
                        el(Button, {
                            icon: 'trash',
                            label: __('Remove Item', 'blockenberg'),
                            isSmall: true,
                            isDestructive: true,
                            disabled: a.items.length <= 1,
                            onClick: function (e) { e.stopPropagation(); removeItem(index); }
                        }),

                        // Per-item icon override picker – always available
                        el('div', { style: { position: 'relative', display: 'inline-block' } },
                            el(Button, {
                                isSmall: true,
                                onClick: function (e) {
                                    e.stopPropagation();
                                    setOpenItemIconPicker(openItemIconPicker === index ? null : index);
                                },
                                style: { display: 'flex', alignItems: 'center', gap: '4px' }
                            },
                                el('span', { className: 'dashicons dashicons-insert', style: { fontSize: '16px', width: '16px', height: '16px' } }),
                                __('Icon', 'blockenberg')
                            ),
                            openItemIconPicker === index && el(Popover, {
                                position: 'bottom center',
                                onClose: function () { setOpenItemIconPicker(null); }
                            },
                                el('div', {
                                    style: { padding: '12px', minWidth: '200px' },
                                    onMouseDown: function (e) { e.stopPropagation(); }
                                },
                                    el('p', { style: { margin: '0 0 8px', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', color: '#888' } }, __('Per-item Icon', 'blockenberg')),
                                    el(SelectControl, {
                                        label: __('Icon Type', 'blockenberg'),
                                        value: item.itemIconType || '',
                                        options: itemIconTypeOptions,
                                        onChange: function (v) { updateItem(index, 'itemIconType', v); }
                                    }),
                                    (item.itemIconType === 'custom-char') && el(TextControl, {
                                        label: __('Character', 'blockenberg'),
                                        value: item.itemIconChar || '',
                                        onChange: function (v) { updateItem(index, 'itemIconChar', v); }
                                    }),
                                    (item.itemIconType === 'dashicon') && el('div', {},
                                        el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                                            el('span', { className: 'dashicons dashicons-' + (item.itemIconDashicon || a.customDashicon), style: { fontSize: '20px', width: '20px', height: '20px' } }),
                                            el(Button, {
                                                variant: 'secondary',
                                                isSmall: true,
                                                onClick: function () { setOpenIconPicker('item-' + index); }
                                            }, __('Pick Dashicon', 'blockenberg'))
                                        ),
                                        openIconPicker === ('item-' + index) && renderDashiconPicker(function (icon) {
                                            updateItem(index, 'itemIconDashicon', icon);
                                        })
                                    ),
                                    (item.itemIconType === 'custom-image') && el('div', {},
                                        item.itemIconUrl && el('div', { style: { marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' } },
                                            el('img', { src: item.itemIconUrl, alt: '', style: { width: '32px', height: '32px', objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: '4px' } }),
                                            el(Button, { isSmall: true, isDestructive: true, onClick: function () { updateItem(index, 'itemIconUrl', ''); } }, __('Remove', 'blockenberg'))
                                        ),
                                        el(Button, {
                                            variant: 'secondary',
                                            isSmall: true,
                                            onClick: function () {
                                                openMediaLibrary(function (url) { updateItem(index, 'itemIconUrl', url); });
                                            }
                                        }, item.itemIconUrl ? __('Replace Image', 'blockenberg') : __('Select Image', 'blockenberg'))
                                    )
                                )
                            )
                        )
                    ),

                    // ── Icon (left) ───────────────────────────────────────────
                    (a.iconPosition === 'left') && iconEl && el('div', {
                        className: 'bkbg-sl-icon-wrap',
                        style: itemColor ? { color: itemColor } : {}
                    }, iconEl),

                    // ── Text area ─────────────────────────────────────────────
                    el('div', { className: 'bkbg-sl-content' },
                        el(RichText, {
                            tagName: 'div',
                            className: 'bkbg-sl-text',
                            value: item.text,
                            onChange: function (v) { updateItem(index, 'text', v); },
                            placeholder: __('List item text…', 'blockenberg'),
                            allowedFormats: ['core/bold', 'core/italic', 'core/strikethrough', 'core/link', 'core/underline', 'core/text-color']
                        }),
                        a.showDescription && el(RichText, {
                            tagName: 'div',
                            className: 'bkbg-sl-desc',
                            value: item.description,
                            onChange: function (v) { updateItem(index, 'description', v); },
                            placeholder: __('Optional description…', 'blockenberg'),
                            allowedFormats: ['core/bold', 'core/italic', 'core/link']
                        })
                    ),

                    // ── Icon (right) ──────────────────────────────────────────
                    (a.iconPosition === 'right') && iconEl && el('div', {
                        className: 'bkbg-sl-icon-wrap',
                        style: itemColor ? { color: itemColor } : {}
                    }, iconEl)
                );
            });

            var blockProps = useBlockProps({
                className: 'bkbg-editor-wrap',
                'data-block-label': 'Styled List'
            });

            return el('div', blockProps,
                inspector,
                blockControls,
                el('ul', Object.assign({
                    className: 'bkbg-sl-wrap',
                    style: wrapStyle
                }, wrapDataAttrs),
                    itemsEl.map(function (item, i) {
                        return el('li', { key: 'li-' + i, className: 'bkbg-sl-li' }, item);
                    })
                ),
                el('div', { className: 'bkbg-editor-actions' },
                    el(Button, {
                        variant: 'secondary',
                        icon: 'plus-alt2',
                        onClick: addItem
                    }, __('Add Item', 'blockenberg'))
                )
            );
        },

        // ── Save ─────────────────────────────────────────────────────────────────
        save: function (props) {
            var a = props.attributes;
            var RichTextContent = wp.blockEditor.RichText.Content;

            var saveIsHorizontal = a.listStyle === 'horizontal';
            var saveIsGrid = a.listStyle === 'grid' || a.listStyle === 'grid-custom';

            var wrapStyle = {
                display: saveIsGrid ? 'grid' : 'flex',
                flexDirection: saveIsHorizontal ? 'row' : (saveIsGrid ? undefined : 'column'),
                flexWrap: saveIsHorizontal ? 'wrap' : undefined,
                gridTemplateColumns: saveIsGrid ? ('repeat(' + ((a.listStyle === 'grid-custom') ? a.columns : 2) + ', 1fr)') : undefined,
                gap: saveIsHorizontal ? (a.gap + 'px ' + a.columnGap + 'px') : (a.gap + 'px'),
                '--bkbg-sl-gap': a.gap + 'px',
                '--bkbg-sl-col-gap': a.columnGap + 'px',
                '--bkbg-sl-columns': (a.listStyle === 'grid-custom') ? a.columns : (a.listStyle === 'grid' ? 2 : 1),
                '--bkbg-sl-icon-size': a.iconSize + 'px',
                '--bkbg-sl-icon-color': a.iconColor,
                '--bkbg-sl-icon-bg': a.iconBgColor,
                '--bkbg-sl-icon-bg-size': a.iconBgSize + 'px',
                '--bkbg-sl-icon-radius': a.iconBgRadius + '%',
                '--bkbg-sl-item-padding': a.itemPaddingTop + 'px ' + a.itemPaddingRight + 'px ' + a.itemPaddingBottom + 'px ' + a.itemPaddingLeft + 'px',
                '--bkbg-sl-item-bg': a.itemBg,
                '--bkbg-sl-item-bg-hover': a.itemBgHover || a.itemBg,
                '--bkbg-sl-item-brd-w': a.itemBorderWidth + 'px',
                '--bkbg-sl-item-brd-color': a.itemBorderColor,
                '--bkbg-sl-item-brd-style': a.itemBorderStyle,
                '--bkbg-sl-item-radius': a.itemBorderRadius + 'px',
                '--bkbg-sl-divider-color': a.dividerColor,
                '--bkbg-sl-divider-w': a.dividerWidth + 'px',
                '--bkbg-sl-text-color': a.textColor,
                '--bkbg-sl-desc-color': a.descColor
            };
            var _tvf = window.bkbgTypoCssVars || function () { return {}; };
            Object.assign(wrapStyle, _tvf(a.textTypo, '--bksl-tx-'));
            Object.assign(wrapStyle, _tvf(a.descTypo,  '--bksl-ds-'));

            // Build SVG icons inline for save (no React)
            var svgPaths = {
                check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
                check2: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.59-7.59L19 7.5l-9 9z',
                arrow: 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z',
                'arrow-right': 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
                star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
                dash: 'M4 11h16v2H4z',
                cross: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
                sparkle: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z',
                bolt: 'M7 2v11h3v9l7-12h-4l4-8z'
            };

            function buildSaveIconEl(item, index) {
                // Resolve per-item override (no flag required)
                var hasPerItem = item && item.itemIconType;
                var type = hasPerItem ? item.itemIconType : a.iconType;
                var customChar = hasPerItem ? (item.itemIconChar || a.customChar) : a.customChar;
                var dashiconName = hasPerItem ? (item.itemIconDashicon || a.customDashicon) : a.customDashicon;
                var imageUrl = hasPerItem ? (item.itemIconUrl || a.customImageUrl) : a.customImageUrl;

                if (type === 'none') return null;
                var color = (a.perItemColor && item.customColor) ? item.customColor : null;
                var iconStyle = (color && type !== 'custom-image') ? { color: color } : {};

                var inner;
                if (type === 'custom-image') {
                    if (!imageUrl) return null;
                    inner = el('img', {
                        src: imageUrl,
                        alt: '',
                        className: 'bkbg-sl-img-icon',
                        style: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' }
                    });
                } else if (type === 'number') {
                    inner = el('span', { className: 'bkbg-sl-num' }, (index + 1) + '');
                } else if (type === 'custom-char') {
                    inner = el('span', { className: 'bkbg-sl-char' }, customChar || '→');
                } else if (type === 'dashicon') {
                    inner = el('span', { className: 'dashicons dashicons-' + dashiconName });
                } else if (type === 'disc') {
                    inner = el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true' },
                        el('circle', { cx: '12', cy: '12', r: '6' })
                    );
                } else if (type === 'square') {
                    inner = el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true' },
                        el('rect', { x: '6', y: '6', width: '12', height: '12', rx: '2' })
                    );
                } else if (svgPaths[type]) {
                    inner = el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true' },
                        el('path', { d: svgPaths[type] })
                    );
                } else {
                    inner = el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true' },
                        el('path', { d: svgPaths.check })
                    );
                }

                return el('span', {
                    className: 'bkbg-sl-icon',
                    'aria-hidden': 'true',
                    style: iconStyle
                }, inner);
            }

            var itemEls = a.items.map(function (item, index) {
                var iconEl = buildSaveIconEl(item, index);
                // Effective icon type (per-item or global)
                var effectiveType = item.itemIconType ? item.itemIconType : a.iconType;
                var showIcon = effectiveType !== 'none' && iconEl !== null;
                var itemColor = (a.perItemColor && item.customColor) ? item.customColor : null;

                return el('li', {
                    key: 'li-' + index,
                    className: 'bkbg-sl-li'
                },
                    el('div', {
                        className: 'bkbg-sl-item' + (a.itemShadow ? ' has-shadow' : '')
                    },
                        (a.iconPosition === 'left') && showIcon && el('div', {
                            className: 'bkbg-sl-icon-wrap',
                            style: itemColor ? { color: itemColor } : {}
                        }, iconEl),
                        el('div', { className: 'bkbg-sl-content' },
                            el(RichTextContent, {
                                tagName: 'div',
                                className: 'bkbg-sl-text',
                                value: item.text
                            }),
                            (a.showDescription && item.description) && el(RichTextContent, {
                                tagName: 'div',
                                className: 'bkbg-sl-desc',
                                value: item.description
                            })
                        ),
                        (a.iconPosition === 'right') && showIcon && el('div', {
                            className: 'bkbg-sl-icon-wrap',
                            style: itemColor ? { color: itemColor } : {}
                        }, iconEl)
                    )
                );
            });

            return el('ul', {
                className: 'bkbg-sl-wrap',
                style: wrapStyle,
                'data-list-style': a.listStyle,
                'data-icon-type': a.iconType,
                'data-icon-shape': a.iconShape,
                'data-icon-pos': a.iconPosition,
                'data-divider': a.dividerEnabled ? '1' : '0',
                'data-align': a.alignment,
                'data-shadow': a.itemShadow ? '1' : '0',
                'data-icon-align': a.iconAlignTop ? 'top' : 'center'
            }, itemEls);
        }
    });
}() );
