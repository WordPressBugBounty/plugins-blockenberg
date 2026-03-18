( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var useMemo = wp.element.useMemo;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;
    var BlockControls = wp.blockEditor.BlockControls;
    var ToolbarGroup = wp.components.ToolbarGroup;
    var ToolbarButton = wp.components.ToolbarButton;
    var Popover = wp.components.Popover;
    var TabPanel = wp.components.TabPanel;
    var TextControl = wp.components.TextControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var _tvf = function (typo, prefix) { var fn = getTypoCssVars(); return fn ? fn(typo, prefix) : {}; };

    // Full Dashicons list (300+ icons)
    var dashicons = [
        // Admin Menu
        'menu', 'admin-site', 'admin-site-alt', 'admin-site-alt2', 'admin-site-alt3', 'dashboard',
        'admin-post', 'admin-media', 'admin-links', 'admin-page', 'admin-comments',
        'admin-appearance', 'admin-plugins', 'admin-users', 'admin-tools', 'admin-settings',
        'admin-network', 'admin-home', 'admin-generic', 'admin-collapse', 'filter',
        'admin-customizer', 'admin-multisite',
        // Welcome Screen
        'welcome-write-blog', 'welcome-add-page', 'welcome-view-site', 'welcome-widgets-menus',
        'welcome-comments', 'welcome-learn-more',
        // Post Formats
        'format-aside', 'format-image', 'format-gallery', 'format-video', 'format-status',
        'format-quote', 'format-chat', 'format-audio',
        // Media
        'camera', 'camera-alt', 'images-alt', 'images-alt2', 'video-alt', 'video-alt2',
        'video-alt3', 'media-archive', 'media-audio', 'media-code', 'media-default',
        'media-document', 'media-interactive', 'media-spreadsheet', 'media-text',
        'media-video', 'playlist-audio', 'playlist-video', 'controls-play',
        'controls-pause', 'controls-forward', 'controls-skipforward', 'controls-back',
        'controls-skipback', 'controls-repeat', 'controls-volumeon', 'controls-volumeoff',
        // Image Editing
        'image-crop', 'image-rotate', 'image-rotate-left', 'image-rotate-right',
        'image-flip-vertical', 'image-flip-horizontal', 'image-filter',
        // Sorting & Misc UI
        'align-left', 'align-right', 'align-center', 'align-none', 'align-pull-left', 'align-pull-right',
        'align-full-width', 'align-wide',
        'lock', 'unlock', 'calendar', 'calendar-alt', 'visibility', 'hidden',
        'post-status', 'edit', 'trash', 'sticky',
        // Arrows & Navigation
        'arrow-up', 'arrow-down', 'arrow-right', 'arrow-left',
        'arrow-up-alt', 'arrow-down-alt', 'arrow-right-alt', 'arrow-left-alt',
        'arrow-up-alt2', 'arrow-down-alt2', 'arrow-right-alt2', 'arrow-left-alt2',
        'sort', 'leftright', 'randomize', 'list-view', 'excerpt-view', 'grid-view',
        'move', 'undo', 'redo',
        // Social & Sharing
        'share', 'share-alt', 'share-alt2', 'rss', 'email', 'email-alt', 'email-alt2',
        'networking', 'amazon', 'facebook', 'facebook-alt', 'google',
        'twitter', 'twitter-alt', 'instagram', 'linkedin', 'pinterest', 'podio',
        'reddit', 'spotify', 'twitch', 'whatsapp', 'xing', 'youtube',
        // WordPress.org Specific
        'hammer', 'art', 'migrate', 'performance', 'universal-access',
        'universal-access-alt', 'tickets', 'nametag', 'clipboard', 'heart', 'megaphone',
        'schedule', 'tide', 'rest-api', 'code-standards',
        // BuddyPress
        'buddicons-activity', 'buddicons-bbpress-logo', 'buddicons-buddypress-logo',
        'buddicons-community', 'buddicons-forums', 'buddicons-friends',
        'buddicons-groups', 'buddicons-pm', 'buddicons-replies',
        'buddicons-topics', 'buddicons-tracking',
        // WordPress Core
        'wordpress', 'wordpress-alt', 'pressthis', 'update', 'update-alt',
        'screenoptions', 'info', 'cart', 'feedback', 'cloud', 'cloud-saved',
        'cloud-upload', 'translation', 'tag', 'category', 'archive',
        // Status & Alerts
        'yes', 'yes-alt', 'no', 'no-alt', 'plus', 'plus-alt', 'plus-alt2',
        'minus', 'dismiss', 'marker', 'star-filled', 'star-half', 'star-empty',
        'flag', 'warning', 'thumbs-up', 'thumbs-down', 'smiley',
        // Location & Places
        'location', 'location-alt', 'vault', 'shield', 'shield-alt',
        'sos', 'search', 'slides', 'text-page', 'analytics', 'chart-pie',
        'chart-bar', 'chart-line', 'chart-area', 'groups', 'businessman', 'businesswoman',
        'businessperson', 'id', 'id-alt', 'products', 'awards', 'forms', 'testimonial',
        'portfolio', 'book', 'book-alt', 'download', 'upload', 'backup',
        'clock', 'lightbulb', 'microphone', 'desktop', 'laptop', 'tablet',
        'smartphone', 'phone', 'index-card', 'carrot', 'building', 'store',
        'album', 'palmtree', 'tickets-alt', 'money', 'money-alt', 'bank',
        // Misc Objects
        'layout', 'paperclip', 'color-picker', 'edit-large', 'edit-page',
        'airplane', 'beer', 'bell', 'bitcoin', 'calculator', 'car', 'coffee',
        'database', 'database-add', 'database-export', 'database-import',
        'database-remove', 'database-view', 'drumstick', 'ellipsis', 'exit',
        'food', 'fullscreen-alt', 'fullscreen-exit-alt', 'games', 'hourglass',
        'html', 'insert', 'insert-after', 'insert-before', 'open-folder',
        'pdf', 'pets', 'plugins-checked', 'printer', 'privacy', 'remove',
        'saved', 'shortcode', 'superhero', 'superhero-alt', 'text', 'external',
        // Table Operations
        'table-col-after', 'table-col-before', 'table-col-delete',
        'table-row-after', 'table-row-before', 'table-row-delete',
        // Editor Controls
        'editor-aligncenter', 'editor-alignleft', 'editor-alignright', 'editor-bold',
        'editor-break', 'editor-code', 'editor-contract', 'editor-customchar',
        'editor-expand', 'editor-help', 'editor-indent', 'editor-insertmore',
        'editor-italic', 'editor-justify', 'editor-kitchensink', 'editor-ltr',
        'editor-ol', 'editor-ol-rtl', 'editor-outdent', 'editor-paragraph',
        'editor-paste-text', 'editor-paste-word', 'editor-quote', 'editor-removeformatting',
        'editor-rtl', 'editor-spellcheck', 'editor-strikethrough', 'editor-table',
        'editor-textcolor', 'editor-ul', 'editor-underline', 'editor-unlink', 'editor-video'
    ];

    // Helper: parse icon value (supports legacy string or new object format)
    function parseIcon(iconValue) {
        if (!iconValue) return { type: 'dashicon', value: 'flag' };
        if (typeof iconValue === 'string') {
            // Legacy format - just the icon name
            return { type: 'dashicon', value: iconValue };
        }
        return iconValue;
    }

    registerBlockType('blockenberg/timeline', {
        title: __('Timeline', 'blockenberg'),
        icon: 'backup',
        category: 'bkbg-business',
        description: __('Display events, milestones, or steps in a beautiful timeline layout.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var isSelected = props.isSelected;
            var a = attributes;

            var hoverState = useState(null);
            var hoveredItem = hoverState[0];
            var setHoveredItem = hoverState[1];

            // State for icon picker popover
            var iconPickerState = useState(null);
            var openIconPicker = iconPickerState[0];
            var setOpenIconPicker = iconPickerState[1];

            // Search state for dashicons
            var searchState = useState('');
            var iconSearch = searchState[0];
            var setIconSearch = searchState[1];

            // Filter dashicons based on search
            var filteredDashicons = useMemo(function() {
                if (!iconSearch) return dashicons;
                var search = iconSearch.toLowerCase();
                return dashicons.filter(function(icon) {
                    return icon.toLowerCase().includes(search);
                });
            }, [iconSearch]);

            // Update item field
            function updateItem(index, field, value) {
                var newItems = a.items.map(function (item, i) {
                    if (i === index) {
                        var updated = {};
                        for (var k in item) { updated[k] = item[k]; }
                        updated[field] = value;
                        return updated;
                    }
                    return item;
                });
                setAttributes({ items: newItems });
            }

            // Add new item
            function addItem() {
                var newItem = {
                    date: 'New Date',
                    title: 'New Event',
                    content: 'Describe this milestone or event.',
                    icon: { type: 'dashicon', value: 'flag' }
                };
                setAttributes({ items: a.items.concat([newItem]) });
            }

            // Insert item after specific index
            function insertItemAfter(index) {
                var newItem = {
                    date: 'New Date',
                    title: 'New Event',
                    content: 'Describe this milestone or event.',
                    icon: { type: 'dashicon', value: 'flag' }
                };
                var newItems = a.items.slice();
                newItems.splice(index + 1, 0, newItem);
                setAttributes({ items: newItems });
            }

            // Remove item
            function removeItem(index) {
                if (a.items.length <= 1) return;
                setAttributes({ items: a.items.filter(function (_, i) { return i !== index; }) });
            }

            // Move item
            function moveItem(index, direction) {
                var newIndex = index + direction;
                if (newIndex < 0 || newIndex >= a.items.length) return;
                var newItems = a.items.slice();
                var temp = newItems[index];
                newItems[index] = newItems[newIndex];
                newItems[newIndex] = temp;
                setAttributes({ items: newItems });
            }

            // Duplicate item
            function duplicateItem(index) {
                var newItems = a.items.slice();
                var copy = Object.assign({}, a.items[index]);
                newItems.splice(index + 1, 0, copy);
                setAttributes({ items: newItems });
            }

            // Inspector controls
            var inspector = el(InspectorControls, {},
                // Layout Panel
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Layout Style', 'blockenberg'),
                        value: a.layoutStyle,
                        options: [
                            { label: __('Vertical', 'blockenberg'), value: 'vertical' },
                            { label: __('Horizontal', 'blockenberg'), value: 'horizontal' }
                        ],
                        onChange: function (v) { setAttributes({ layoutStyle: v }); }
                    }),
                    a.layoutStyle === 'vertical' && el(ToggleControl, {
                        label: __('Alternating Layout', 'blockenberg'),
                        checked: a.alternating,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ alternating: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Item Spacing', 'blockenberg'),
                        value: a.itemSpacing,
                        onChange: function (v) { setAttributes({ itemSpacing: v }); },
                        min: 10,
                        max: 100
                    })
                ),

                // Connector Panel
                el(PanelBody, { title: __('Connector Line', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Connector', 'blockenberg'),
                        checked: a.showConnector,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showConnector: v }); }
                    }),
                    a.showConnector && el(SelectControl, {
                        label: __('Connector Style', 'blockenberg'),
                        value: a.connectorStyle,
                        options: [
                            { label: __('Solid', 'blockenberg'), value: 'solid' },
                            { label: __('Dashed', 'blockenberg'), value: 'dashed' },
                            { label: __('Dotted', 'blockenberg'), value: 'dotted' }
                        ],
                        onChange: function (v) { setAttributes({ connectorStyle: v }); }
                    }),
                    a.showConnector && el(RangeControl, {
                        label: __('Line Width', 'blockenberg'),
                        value: a.lineWidth,
                        onChange: function (v) { setAttributes({ lineWidth: v }); },
                        min: 1,
                        max: 8
                    })
                ),

                // Marker Panel
                el(PanelBody, { title: __('Marker', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Marker Style', 'blockenberg'),
                        value: a.markerStyle,
                        options: [
                            { label: __('Icon', 'blockenberg'), value: 'icon' },
                            { label: __('Number', 'blockenberg'), value: 'number' },
                            { label: __('Dot', 'blockenberg'), value: 'dot' }
                        ],
                        onChange: function (v) { setAttributes({ markerStyle: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Marker Size', 'blockenberg'),
                        value: a.markerSize,
                        onChange: function (v) { setAttributes({ markerSize: v }); },
                        min: 24,
                        max: 80
                    })
                ),

                // Card Panel
                el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Card Shadow', 'blockenberg'),
                        checked: a.cardShadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ cardShadow: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Card Padding', 'blockenberg'),
                        value: a.cardPadding,
                        onChange: function (v) { setAttributes({ cardPadding: v }); },
                        min: 12,
                        max: 48
                    }),
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.cardBorderRadius,
                        onChange: function (v) { setAttributes({ cardBorderRadius: v }); },
                        min: 0,
                        max: 24
                    }),
                    el(RangeControl, {
                        label: __('Border Width', 'blockenberg'),
                        value: a.cardBorderWidth,
                        onChange: function (v) { setAttributes({ cardBorderWidth: v }); },
                        min: 0,
                        max: 4
                    })
                ),

                // Animation Panel
                el(PanelBody, { title: __('Animation', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Animate on Scroll', 'blockenberg'),
                        checked: a.animateOnScroll,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ animateOnScroll: v }); }
                    }),
                    a.animateOnScroll && el(SelectControl, {
                        label: __('Animation Type', 'blockenberg'),
                        value: a.animationType,
                        options: [
                            { label: __('Fade Up', 'blockenberg'), value: 'fade-up' },
                            { label: __('Fade In', 'blockenberg'), value: 'fade-in' },
                            { label: __('Slide In', 'blockenberg'), value: 'slide-in' },
                            { label: __('Scale Up', 'blockenberg'), value: 'scale-up' }
                        ],
                        onChange: function (v) { setAttributes({ animationType: v }); }
                    })
                ),

                // Typography Panel
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), {
                        label: __('Date Typography', 'blockenberg'),
                        value: a.dateTypo || {},
                        onChange: function (v) { setAttributes({ dateTypo: v }); }
                    }),
                    getTypoControl() && el(getTypoControl(), {
                        label: __('Title Typography', 'blockenberg'),
                        value: a.titleTypo || {},
                        onChange: function (v) { setAttributes({ titleTypo: v }); }
                    }),
                    getTypoControl() && el(getTypoControl(), {
                        label: __('Content Typography', 'blockenberg'),
                        value: a.contentTypo || {},
                        onChange: function (v) { setAttributes({ contentTypo: v }); }
                    })
                ),

                // Colors Panel
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        {
                            value: a.lineColor,
                            onChange: function (v) { setAttributes({ lineColor: v }); },
                            label: __('Line Color', 'blockenberg')
                        },
                        {
                            value: a.markerBg,
                            onChange: function (v) { setAttributes({ markerBg: v }); },
                            label: __('Marker Background', 'blockenberg')
                        },
                        {
                            value: a.markerColor,
                            onChange: function (v) { setAttributes({ markerColor: v }); },
                            label: __('Marker Icon Color', 'blockenberg')
                        },
                        {
                            value: a.cardBg,
                            onChange: function (v) { setAttributes({ cardBg: v }); },
                            label: __('Card Background', 'blockenberg')
                        },
                        {
                            value: a.cardBorderColor,
                            onChange: function (v) { setAttributes({ cardBorderColor: v }); },
                            label: __('Card Border Color', 'blockenberg')
                        },
                        {
                            value: a.dateColor,
                            onChange: function (v) { setAttributes({ dateColor: v }); },
                            label: __('Date Color', 'blockenberg')
                        },
                        {
                            value: a.titleColor,
                            onChange: function (v) { setAttributes({ titleColor: v }); },
                            label: __('Title Color', 'blockenberg')
                        },
                        {
                            value: a.contentColor,
                            onChange: function (v) { setAttributes({ contentColor: v }); },
                            label: __('Content Color', 'blockenberg')
                        }
                    ]
                })
            );

            // CSS Variables
            var wrapStyle = {
                '--bkbg-tl-line-color': a.lineColor,
                '--bkbg-tl-line-width': a.lineWidth + 'px',
                '--bkbg-tl-marker-bg': a.markerBg,
                '--bkbg-tl-marker-color': a.markerColor,
                '--bkbg-tl-marker-size': a.markerSize + 'px',
                '--bkbg-tl-card-bg': a.cardBg,
                '--bkbg-tl-card-border': a.cardBorderColor,
                '--bkbg-tl-card-border-w': a.cardBorderWidth + 'px',
                '--bkbg-tl-card-radius': a.cardBorderRadius + 'px',
                '--bkbg-tl-card-padding': a.cardPadding + 'px',
                '--bkbg-tl-date-color': a.dateColor,
                '--bkbg-tl-title-color': a.titleColor,
                '--bkbg-tl-content-color': a.contentColor,
                '--bkbg-tl-spacing': a.itemSpacing + 'px'
            };
            Object.assign(wrapStyle, _tvf(a.dateTypo, '--bktl-dt-'), _tvf(a.titleTypo, '--bktl-tt-'), _tvf(a.contentTypo, '--bktl-ct-'));

            // Render full icon picker popover with tabs
            function renderIconPicker(index) {
                var currentIcon = parseIcon(a.items[index].icon);
                var stop = function (e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                };

                return el(Popover, {
                    position: 'bottom center',
                    className: 'bkbg-tl-icon-popover',
                    onClose: function () { 
                        setOpenIconPicker(null);
                        setIconSearch('');
                    }
                },
                    el('div', { className: 'bkbg-tl-icon-picker-modal', onMouseDown: stop, onClick: stop },
                        el('div', { className: 'bkbg-tl-icon-picker-header' },
                            el('h3', {}, __('Choose Icon', 'blockenberg')),
                            el(Button, {
                                icon: 'no-alt',
                                onClick: function() { 
                                    setOpenIconPicker(null);
                                    setIconSearch('');
                                },
                                className: 'bkbg-tl-icon-picker-close'
                            })
                        ),
                        el(TabPanel, {
                            className: 'bkbg-tl-icon-tabs',
                            activeClass: 'is-active',
                            tabs: [
                                { name: 'dashicons', title: __('Dashicons', 'blockenberg'), className: 'bkbg-tl-tab-dashicons' },
                                { name: 'media', title: __('Media Library', 'blockenberg'), className: 'bkbg-tl-tab-media' }
                            ]
                        }, function(tab) {
                            if (tab.name === 'dashicons') {
                                return el('div', { className: 'bkbg-tl-dashicons-panel' },
                                    // Search box
                                    el(TextControl, {
                                        placeholder: __('Search icons...', 'blockenberg'),
                                        value: iconSearch,
                                        onChange: setIconSearch,
                                        className: 'bkbg-tl-icon-search'
                                    }),
                                    // Icons grid
                                    el('div', { className: 'bkbg-tl-dashicons-grid' },
                                        filteredDashicons.length === 0 
                                            ? el('p', { className: 'bkbg-tl-no-icons' }, __('No icons found', 'blockenberg'))
                                            : filteredDashicons.map(function(icon) {
                                                var isActive = currentIcon.type === 'dashicon' && currentIcon.value === icon;
                                                return el('button', {
                                                    key: icon,
                                                    type: 'button',
                                                    className: 'bkbg-tl-dashicon-btn' + (isActive ? ' is-active' : ''),
                                                    onClick: function() {
                                                        updateItem(index, 'icon', { type: 'dashicon', value: icon });
                                                        setOpenIconPicker(null);
                                                        setIconSearch('');
                                                    },
                                                    title: icon
                                                },
                                                    el('span', { className: 'dashicons dashicons-' + icon })
                                                );
                                            })
                                    )
                                );
                            } else {
                                // Media Library tab - use wp.media directly for reliability
                                var openMediaLibrary = function() {
                                    var frame = wp.media({
                                        title: __('Select Icon Image', 'blockenberg'),
                                        button: { text: __('Use as Icon', 'blockenberg') },
                                        multiple: false,
                                        library: { type: 'image' }
                                    });
                                    frame.on('select', function() {
                                        var attachment = frame.state().get('selection').first().toJSON();
                                        updateItem(index, 'icon', { type: 'custom', value: attachment.url });
                                        setOpenIconPicker(null);
                                    });
                                    frame.open();
                                };

                                return el('div', { className: 'bkbg-tl-media-panel' },
                                    // Current custom icon preview
                                    currentIcon.type === 'custom' && el('div', { className: 'bkbg-tl-current-media' },
                                        el('img', { src: currentIcon.value, alt: '' }),
                                        el(Button, {
                                            isDestructive: true,
                                            variant: 'secondary',
                                            onClick: function() {
                                                updateItem(index, 'icon', { type: 'dashicon', value: 'flag' });
                                            }
                                        }, __('Remove', 'blockenberg'))
                                    ),
                                    // Media upload button using wp.media directly
                                    el(Button, {
                                        variant: 'secondary',
                                        onClick: openMediaLibrary,
                                        className: 'bkbg-tl-media-btn'
                                    },
                                        el('span', { className: 'dashicons dashicons-upload' }),
                                        ' ',
                                        __('Select from Media Library', 'blockenberg')
                                    ),
                                    el('p', { className: 'bkbg-tl-media-hint' },
                                        __('Upload or select an image to use as a custom marker icon.', 'blockenberg')
                                    )
                                );
                            }
                        })
                    )
                );
            }

            // Render marker content (icon, number, or dot)
            function renderMarkerContent(item, index) {
                if (a.markerStyle === 'number') {
                    return el('span', { className: 'bkbg-tl-marker-number' }, index + 1);
                } else if (a.markerStyle === 'dot') {
                    return el('span', { className: 'bkbg-tl-marker-dot' });
                } else {
                    var iconData = parseIcon(item.icon);
                    if (iconData.type === 'custom') {
                        return el('img', {
                            src: iconData.value,
                            alt: '',
                            className: 'bkbg-tl-marker-img'
                        });
                    } else {
                        // Dashicon
                        return el('span', {
                            className: 'dashicons dashicons-' + iconData.value + ' bkbg-tl-marker-dashicon'
                        });
                    }
                }
            }

            // Render items
            var itemsEl = a.items.map(function (item, index) {
                var isHovered = hoveredItem === index;
                var itemClass = 'bkbg-tl-item';
                if (a.alternating && a.layoutStyle === 'vertical') {
                    itemClass += index % 2 === 0 ? ' bkbg-tl-item-left' : ' bkbg-tl-item-right';
                }
                if (isHovered) itemClass += ' bkbg-tl-item-hovered';

                // Marker is clickable when icon style
                var markerProps = {
                    className: 'bkbg-tl-marker' + (a.markerStyle === 'icon' ? ' bkbg-tl-marker-clickable' : '')
                };
                if (a.markerStyle === 'icon') {
                    markerProps.onClick = function (e) {
                        e.stopPropagation();
                        setOpenIconPicker(openIconPicker === index ? null : index);
                    };
                    markerProps.title = __('Click to change icon', 'blockenberg');
                }

                return el('div', {
                    key: index,
                    className: itemClass,
                    onMouseEnter: function () { setHoveredItem(index); },
                    onMouseLeave: function () { setHoveredItem(null); }
                },
                    // Marker
                    el('div', markerProps,
                        renderMarkerContent(item, index),
                        openIconPicker === index && renderIconPicker(index)
                    ),

                    // Card
                    el('div', {
                        className: 'bkbg-tl-card' + (a.cardShadow ? ' has-shadow' : '')
                    },
                        // Date
                        el(RichText, {
                            tagName: 'div',
                            className: 'bkbg-tl-date',
                            value: item.date,
                            onChange: function (v) { updateItem(index, 'date', v); },
                            placeholder: __('Date...', 'blockenberg')
                        }),

                        // Title
                        el(RichText, {
                            tagName: 'h4',
                            className: 'bkbg-tl-title',
                            value: item.title,
                            onChange: function (v) { updateItem(index, 'title', v); },
                            placeholder: __('Title...', 'blockenberg')
                        }),

                        // Content
                        el(RichText, {
                            tagName: 'p',
                            className: 'bkbg-tl-content',
                            value: item.content,
                            onChange: function (v) { updateItem(index, 'content', v); },
                            placeholder: __('Content...', 'blockenberg')
                        })
                    ),

                    // Item actions - icons change based on layout
                    el('div', { className: 'bkbg-tl-item-actions' },
                        el(Button, {
                            icon: a.layoutStyle === 'horizontal' ? 'arrow-left-alt2' : 'arrow-up-alt2',
                            label: a.layoutStyle === 'horizontal' ? __('Move Left', 'blockenberg') : __('Move Up', 'blockenberg'),
                            onClick: function () { moveItem(index, -1); },
                            disabled: index === 0,
                            size: 'small'
                        }),
                        el(Button, {
                            icon: a.layoutStyle === 'horizontal' ? 'arrow-right-alt2' : 'arrow-down-alt2',
                            label: a.layoutStyle === 'horizontal' ? __('Move Right', 'blockenberg') : __('Move Down', 'blockenberg'),
                            onClick: function () { moveItem(index, 1); },
                            disabled: index === a.items.length - 1,
                            size: 'small'
                        }),
                        el(Button, {
                            icon: 'plus-alt2',
                            label: __('Insert After', 'blockenberg'),
                            onClick: function () { insertItemAfter(index); },
                            size: 'small'
                        }),
                        el(Button, {
                            icon: 'admin-page',
                            label: __('Duplicate', 'blockenberg'),
                            onClick: function () { duplicateItem(index); },
                            size: 'small'
                        }),
                        el(Button, {
                            icon: 'trash',
                            label: __('Remove', 'blockenberg'),
                            onClick: function () { removeItem(index); },
                            isDestructive: true,
                            disabled: a.items.length <= 1,
                            size: 'small'
                        })
                    )
                );
            });

            // Block props
            var wrapClass = 'bkbg-tl-wrap bkbg-editor-wrap';
            wrapClass += ' bkbg-tl-' + a.layoutStyle;
            if (a.alternating && a.layoutStyle === 'vertical') wrapClass += ' bkbg-tl-alternating';
            if (a.showConnector) wrapClass += ' bkbg-tl-has-connector bkbg-tl-connector-' + a.connectorStyle;

            var blockProps = useBlockProps({
                className: wrapClass,
                style: wrapStyle,
                'data-block-label': 'Timeline'
            });

            // Toolbar
            var toolbar = el(BlockControls, {},
                el(ToolbarGroup, {},
                    el(ToolbarButton, {
                        icon: 'plus-alt2',
                        label: __('Add Item', 'blockenberg'),
                        onClick: addItem
                    })
                )
            );

            return el('div', blockProps,
                inspector,
                toolbar,
                el('div', { className: 'bkbg-tl-items' },
                    itemsEl
                ),
                el('div', { className: 'bkbg-editor-actions' },
                    el(Button, {
                        variant: 'secondary',
                        onClick: addItem,
                        icon: 'plus-alt2'
                    }, __('Add Event', 'blockenberg'))
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            var wrapStyle = {
                '--bkbg-tl-line-color': a.lineColor,
                '--bkbg-tl-line-width': a.lineWidth + 'px',
                '--bkbg-tl-marker-bg': a.markerBg,
                '--bkbg-tl-marker-color': a.markerColor,
                '--bkbg-tl-marker-size': a.markerSize + 'px',
                '--bkbg-tl-card-bg': a.cardBg,
                '--bkbg-tl-card-border': a.cardBorderColor,
                '--bkbg-tl-card-border-w': a.cardBorderWidth + 'px',
                '--bkbg-tl-card-radius': a.cardBorderRadius + 'px',
                '--bkbg-tl-card-padding': a.cardPadding + 'px',
                '--bkbg-tl-date-color': a.dateColor,
                '--bkbg-tl-title-color': a.titleColor,
                '--bkbg-tl-content-color': a.contentColor,
                '--bkbg-tl-spacing': a.itemSpacing + 'px'
            };
            Object.assign(wrapStyle, _tvf(a.dateTypo, '--bktl-dt-'), _tvf(a.titleTypo, '--bktl-tt-'), _tvf(a.contentTypo, '--bktl-ct-'));

            // Helper: parse icon value (supports legacy string or new object format)
            function parseSaveIcon(iconValue) {
                if (!iconValue) return { type: 'dashicon', value: 'flag' };
                if (typeof iconValue === 'string') {
                    return { type: 'dashicon', value: iconValue };
                }
                return iconValue;
            }

            var el = wp.element.createElement;

            var wrapClass = 'bkbg-tl-wrap';
            wrapClass += ' bkbg-tl-' + a.layoutStyle;
            if (a.alternating && a.layoutStyle === 'vertical') wrapClass += ' bkbg-tl-alternating';
            if (a.showConnector) wrapClass += ' bkbg-tl-has-connector bkbg-tl-connector-' + a.connectorStyle;

            var itemsEl = a.items.map(function (item, index) {
                var itemClass = 'bkbg-tl-item';
                if (a.alternating && a.layoutStyle === 'vertical') {
                    itemClass += index % 2 === 0 ? ' bkbg-tl-item-left' : ' bkbg-tl-item-right';
                }

                var markerContent;
                if (a.markerStyle === 'number') {
                    markerContent = el('span', { className: 'bkbg-tl-marker-number' }, index + 1);
                } else if (a.markerStyle === 'dot') {
                    markerContent = el('span', { className: 'bkbg-tl-marker-dot' });
                } else {
                    var iconData = parseSaveIcon(item.icon);
                    if (iconData.type === 'custom') {
                        markerContent = el('img', {
                            src: iconData.value,
                            alt: '',
                            className: 'bkbg-tl-marker-img'
                        });
                    } else {
                        // Dashicon
                        markerContent = el('span', {
                            className: 'dashicons dashicons-' + iconData.value + ' bkbg-tl-marker-dashicon'
                        });
                    }
                }

                return el('div', { key: index, className: itemClass },
                    el('div', { className: 'bkbg-tl-marker' }, markerContent),
                    el('div', { className: 'bkbg-tl-card' + (a.cardShadow ? ' has-shadow' : '') },
                        el('div', { className: 'bkbg-tl-date' }, item.date),
                        el('h4', { className: 'bkbg-tl-title' }, item.title),
                        el('p', { className: 'bkbg-tl-content' }, item.content)
                    )
                );
            });

            return el('div', {
                className: wrapClass,
                style: wrapStyle,
                'data-animate': a.animateOnScroll ? '1' : '0',
                'data-animation': a.animationType
            },
                el('div', { className: 'bkbg-tl-items' }, itemsEl)
            );
        }
    });
}() );
