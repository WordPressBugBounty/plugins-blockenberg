( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var BlockControls = wp.blockEditor.BlockControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var ToolbarGroup = wp.components.ToolbarGroup;
    var ToolbarButton = wp.components.ToolbarButton;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var v1Attributes = {
        items: { type: 'array', default: [{ label: 'Web Design', percentage: 90, color: '#3b82f6' }, { label: 'Development', percentage: 85, color: '#10b981' }, { label: 'Marketing', percentage: 75, color: '#f59e0b' }] },
        layoutStyle: { type: 'string', default: 'default' },
        showPercentage: { type: 'boolean', default: true },
        showLabels: { type: 'boolean', default: true },
        animateOnScroll: { type: 'boolean', default: true },
        animationDuration: { type: 'number', default: 1000 },
        barHeight: { type: 'number', default: 20 },
        barSpacing: { type: 'number', default: 24 },
        barRadius: { type: 'number', default: 10 },
        trackColor: { type: 'string', default: '#e5e7eb' },
        labelColor: { type: 'string', default: '#1f2937' },
        percentageColor: { type: 'string', default: '#6b7280' },
        labelSize: { type: 'number', default: 16 },
        percentageSize: { type: 'number', default: 14 },
        labelWeight: { type: 'number', default: 500 },
        percentagePosition: { type: 'string', default: 'right' },
        stripes: { type: 'boolean', default: false },
        stripesAnimated: { type: 'boolean', default: false },
        glowEffect: { type: 'boolean', default: false },
        gradient: { type: 'boolean', default: false },
        gradientAngle: { type: 'number', default: 90 },
        title: { type: 'string', default: '' },
        showTitle: { type: 'boolean', default: false },
        titleColor: { type: 'string', default: '#1f2937' },
        titleSize: { type: 'number', default: 24 },
        titleFontWeight: { type: 'number', default: 600 },
        titleLineHeight: { type: 'number', default: 1.3 },
        labelLineHeight: { type: 'number', default: 1.4 }
    };

    registerBlockType('blockenberg/progress-bar', {
        title: __('Progress Bar', 'blockenberg'),
        icon: 'chart-bar',
        category: 'bkbg-content',
        description: __('Display animated progress bars with customizable styles and labels.', 'blockenberg'),

        deprecated: [{
            attributes: v1Attributes,
            save: function (props) {
                var a = props.attributes;
                var wrapStyle = {
                    '--bkbg-pb-bar-height': a.barHeight + 'px',
                    '--bkbg-pb-bar-spacing': a.barSpacing + 'px',
                    '--bkbg-pb-bar-radius': a.barRadius + 'px',
                    '--bkbg-pb-track-color': a.trackColor,
                    '--bkbg-pb-label-color': a.labelColor,
                    '--bkbg-pb-label-size': a.labelSize + 'px',
                    '--bkbg-pb-label-weight': a.labelWeight,
                    '--bkbg-pb-label-line-height': a.labelLineHeight,
                    '--bkbg-pb-percentage-color': a.percentageColor,
                    '--bkbg-pb-percentage-size': a.percentageSize + 'px',
                    '--bkbg-pb-title-color': a.titleColor,
                    '--bkbg-pb-title-size': a.titleSize + 'px',
                    '--bkbg-pb-title-font-weight': a.titleFontWeight,
                    '--bkbg-pb-title-line-height': a.titleLineHeight,
                    '--bkbg-pb-animation-duration': a.animationDuration + 'ms'
                };
                var itemsData = a.items.map(function (item) {
                    return item.label + '|' + item.percentage + '|' + item.color;
                }).join(';;');
                var layoutClass = 'bkbg-pb-wrap';
                layoutClass += ' bkbg-pb-' + a.layoutStyle;
                if (a.stripes) layoutClass += ' bkbg-pb-striped';
                if (a.stripesAnimated) layoutClass += ' bkbg-pb-striped-animated';
                if (a.glowEffect) layoutClass += ' bkbg-pb-glow';
                if (a.gradient) layoutClass += ' bkbg-pb-gradient';
                var titleEl = null;
                if (a.showTitle && a.title) {
                    titleEl = el('div', { className: 'bkbg-pb-title' }, a.title);
                }
                return el('div', {
                    className: layoutClass,
                    style: wrapStyle,
                    'data-layout': a.layoutStyle,
                    'data-items': itemsData,
                    'data-animate': a.animateOnScroll ? '1' : '0',
                    'data-show-labels': a.showLabels ? '1' : '0',
                    'data-show-percentage': a.showPercentage ? '1' : '0',
                    'data-percentage-position': a.percentagePosition,
                    'data-gradient': a.gradient ? '1' : '0',
                    'data-gradient-angle': a.gradientAngle,
                    'data-glow': a.glowEffect ? '1' : '0'
                },
                    titleEl,
                    el('div', { className: 'bkbg-pb-list' })
                );
            }
        }],

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var isSelected = props.isSelected;
            var a = attributes;
            var TC = getTypoControl();

            // State for editing
            var editingState = useState(null);
            var editing = editingState[0];
            var setEditing = editingState[1];

            // State for hovered item
            var hoveredState = useState(null);
            var hovered = hoveredState[0];
            var setHovered = hoveredState[1];

            // State for color picker
            var colorPickerState = useState(null);
            var colorPicker = colorPickerState[0];
            var setColorPicker = colorPickerState[1];

            var layoutOptions = [
                { label: __('Default', 'blockenberg'), value: 'default' },
                { label: __('Rounded', 'blockenberg'), value: 'rounded' },
                { label: __('Flat', 'blockenberg'), value: 'flat' },
                { label: __('Thin', 'blockenberg'), value: 'thin' },
                { label: __('Thick', 'blockenberg'), value: 'thick' }
            ];

            var percentagePositionOptions = [
                { label: __('Right of Label', 'blockenberg'), value: 'right' },
                { label: __('Inside Bar', 'blockenberg'), value: 'inside' },
                { label: __('Above Bar', 'blockenberg'), value: 'above' },
                { label: __('Hidden', 'blockenberg'), value: 'hidden' }
            ];

            // Update item
            function updateItem(index, key, value) {
                var newItems = a.items.slice();
                newItems[index] = Object.assign({}, newItems[index]);
                newItems[index][key] = value;
                setAttributes({ items: newItems });
            }

            // Add item
            function addItem() {
                var colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                var newColor = colors[a.items.length % colors.length];
                var newItems = a.items.concat([{
                    label: __('New Skill', 'blockenberg'),
                    percentage: 50,
                    color: newColor
                }]);
                setAttributes({ items: newItems });
            }

            // Remove item
            function removeItem(index) {
                var newItems = a.items.filter(function (_, i) { return i !== index; });
                setAttributes({ items: newItems });
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

            // Inspector controls
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'),
                        value: a.layoutStyle,
                        options: layoutOptions,
                        onChange: function (v) { setAttributes({ layoutStyle: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Bar Height', 'blockenberg'),
                        value: a.barHeight,
                        onChange: function (v) { setAttributes({ barHeight: v }); },
                        min: 4,
                        max: 60
                    }),
                    el(RangeControl, {
                        label: __('Bar Spacing', 'blockenberg'),
                        value: a.barSpacing,
                        onChange: function (v) { setAttributes({ barSpacing: v }); },
                        min: 8,
                        max: 60
                    }),
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.barRadius,
                        onChange: function (v) { setAttributes({ barRadius: v }); },
                        min: 0,
                        max: 30
                    })
                ),

                el(PanelBody, { title: __('Labels & Percentage', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Labels', 'blockenberg'),
                        checked: a.showLabels,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showLabels: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Percentage', 'blockenberg'),
                        checked: a.showPercentage,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showPercentage: v }); }
                    }),
                    a.showPercentage && el(SelectControl, {
                        label: __('Percentage Position', 'blockenberg'),
                        value: a.percentagePosition,
                        options: percentagePositionOptions,
                        onChange: function (v) { setAttributes({ percentagePosition: v }); }
                    }),
                ),

                el(PanelBody, { title: __('Effects', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Animate on Scroll', 'blockenberg'),
                        checked: a.animateOnScroll,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ animateOnScroll: v }); }
                    }),
                    a.animateOnScroll && el(RangeControl, {
                        label: __('Animation Duration (ms)', 'blockenberg'),
                        value: a.animationDuration,
                        onChange: function (v) { setAttributes({ animationDuration: v }); },
                        min: 200,
                        max: 3000,
                        step: 100
                    }),
                    el(ToggleControl, {
                        label: __('Stripes', 'blockenberg'),
                        checked: a.stripes,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ stripes: v }); }
                    }),
                    a.stripes && el(ToggleControl, {
                        label: __('Animated Stripes', 'blockenberg'),
                        checked: a.stripesAnimated,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ stripesAnimated: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Glow Effect', 'blockenberg'),
                        checked: a.glowEffect,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ glowEffect: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Gradient', 'blockenberg'),
                        checked: a.gradient,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ gradient: v }); }
                    }),
                    a.gradient && el(RangeControl, {
                        label: __('Gradient Angle', 'blockenberg'),
                        value: a.gradientAngle,
                        onChange: function (v) { setAttributes({ gradientAngle: v }); },
                        min: 0,
                        max: 360
                    })
                ),

                el(PanelBody, { title: __('Title', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Title', 'blockenberg'),
                        checked: a.showTitle,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showTitle: v }); }
                    }),
                    ),

                el(PanelBody, { title: __('Progress Items', 'blockenberg'), initialOpen: false },
                    a.items.map(function (item, index) {
                        return el('div', { key: index, className: 'bkbg-pb-item-control' },
                            el('div', { className: 'bkbg-pb-item-header' },
                                el('span', { className: 'bkbg-pb-item-title' }, item.label || __('Item', 'blockenberg') + ' ' + (index + 1)),
                                el('div', { className: 'bkbg-pb-item-actions' },
                                    el(Button, {
                                        icon: 'arrow-up-alt2',
                                        size: 'small',
                                        disabled: index === 0,
                                        onClick: function () { moveItem(index, -1); }
                                    }),
                                    el(Button, {
                                        icon: 'arrow-down-alt2',
                                        size: 'small',
                                        disabled: index === a.items.length - 1,
                                        onClick: function () { moveItem(index, 1); }
                                    }),
                                    el(Button, {
                                        icon: 'trash',
                                        size: 'small',
                                        isDestructive: true,
                                        onClick: function () { removeItem(index); }
                                    })
                                )
                            ),
                            el(TextControl, {
                                label: __('Label', 'blockenberg'),
                                value: item.label,
                                onChange: function (v) { updateItem(index, 'label', v); }
                            }),
                            el(RangeControl, {
                                label: __('Percentage', 'blockenberg'),
                                value: item.percentage,
                                onChange: function (v) { updateItem(index, 'percentage', v); },
                                min: 0,
                                max: 100
                            }),
                            el('div', { className: 'bkbg-pb-color-row' },
                                el('span', {}, __('Color', 'blockenberg')),
                                el('button', {
                                    className: 'bkbg-pb-color-btn',
                                    style: { backgroundColor: item.color },
                                    onClick: function () { 
                                        setColorPicker(colorPicker === index ? null : index); 
                                    }
                                }),
                                colorPicker === index && el(Popover, {
                                    position: 'bottom left',
                                    onClose: function () { setColorPicker(null); }
                                },
                                    el(ColorPicker, {
                                        color: item.color,
                                        onChangeComplete: function (c) { 
                                            updateItem(index, 'color', c.hex); 
                                        }
                                    })
                                )
                            )
                        );
                    }),
                    el(Button, {
                        variant: 'secondary',
                        onClick: addItem,
                        className: 'bkbg-pb-add-btn'
                    }, __('+ Add Progress Bar', 'blockenberg'))
                ),

                
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    TC && a.showTitle && el(TC, { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function(v) { setAttributes({ titleTypo: v }); } }),
                    TC && a.showLabels && el(TC, { label: __('Label', 'blockenberg'), value: a.labelTypo || {}, onChange: function(v) { setAttributes({ labelTypo: v }); } }),
                    TC && a.showPercentage && el(TC, { label: __('Percentage', 'blockenberg'), value: a.pctTypo || {}, onChange: function(v) { setAttributes({ pctTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        {
                            value: a.trackColor,
                            onChange: function (v) { setAttributes({ trackColor: v }); },
                            label: __('Track Color', 'blockenberg')
                        },
                        {
                            value: a.labelColor,
                            onChange: function (v) { setAttributes({ labelColor: v }); },
                            label: __('Label Color', 'blockenberg')
                        },
                        {
                            value: a.percentageColor,
                            onChange: function (v) { setAttributes({ percentageColor: v }); },
                            label: __('Percentage Color', 'blockenberg')
                        },
                        {
                            value: a.titleColor,
                            onChange: function (v) { setAttributes({ titleColor: v }); },
                            label: __('Title Color', 'blockenberg')
                        }
                    ]
                })
            );

            // Title element
            var titleEl = null;
            if (a.showTitle) {
                if (editing === 'title') {
                    titleEl = el('input', {
                        type: 'text',
                        className: 'bkbg-pb-title bkbg-pb-input-active',
                        value: a.title,
                        autoFocus: true,
                        placeholder: __('Progress Title', 'blockenberg'),
                        onChange: function (e) { setAttributes({ title: e.target.value }); },
                        onBlur: function () { setEditing(null); },
                        onKeyDown: function (e) { if (e.key === 'Enter') setEditing(null); }
                    });
                } else {
                    titleEl = el('div', {
                        className: 'bkbg-pb-title bkbg-pb-clickable',
                        onClick: function () { setEditing('title'); }
                    }, a.title || __('Progress Title', 'blockenberg'));
                }
            }

            // Lighten color helper
            function lightenColor(hex, percent) {
                var num = parseInt(hex.replace('#', ''), 16);
                var r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
                var g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100));
                var b = Math.min(255, (num & 0x0000FF) + Math.round(255 * percent / 100));
                return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
            }

            // Get bar style
            function getBarStyle(item) {
                var style = {
                    width: item.percentage + '%'
                };

                // Background
                if (a.gradient) {
                    var lighterColor = lightenColor(item.color, 30);
                    style.background = 'linear-gradient(' + a.gradientAngle + 'deg, ' + item.color + ' 0%, ' + lighterColor + ' 50%, ' + item.color + ' 100%)';
                    style.backgroundSize = '200% 100%';
                } else {
                    style.backgroundColor = item.color;
                }

                // Stripes overlay
                if (a.stripes) {
                    var stripesBg = 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)';
                    if (a.gradient) {
                        var lighterColor = lightenColor(item.color, 30);
                        style.background = stripesBg + ', linear-gradient(' + a.gradientAngle + 'deg, ' + item.color + ' 0%, ' + lighterColor + ' 50%, ' + item.color + ' 100%)';
                    } else {
                        style.background = stripesBg + ', ' + item.color;
                    }
                    style.backgroundSize = '40px 40px, 100% 100%';
                }

                // Glow effect
                if (a.glowEffect) {
                    style.boxShadow = '0 0 10px ' + item.color + ', 0 0 20px ' + item.color + '60';
                }

                return style;
            }

            // Build progress bars
            var progressBars = a.items.map(function (item, index) {
                var labelKey = 'label-' + index;
                
                // Percentage element based on position
                var percentageEl = null;
                if (a.showPercentage && a.percentagePosition !== 'hidden') {
                    percentageEl = el('span', { className: 'bkbg-pb-percentage' }, item.percentage + '%');
                }

                // Label element - editable
                var labelEl = null;
                if (a.showLabels) {
                    if (editing === labelKey) {
                        labelEl = el('input', {
                            type: 'text',
                            className: 'bkbg-pb-label bkbg-pb-input-active',
                            value: item.label,
                            autoFocus: true,
                            onChange: function (e) { updateItem(index, 'label', e.target.value); },
                            onBlur: function () { setEditing(null); },
                            onKeyDown: function (e) { if (e.key === 'Enter') setEditing(null); }
                        });
                    } else {
                        labelEl = el('span', {
                            className: 'bkbg-pb-label bkbg-pb-clickable',
                            onClick: function () { setEditing(labelKey); }
                        }, item.label);
                    }
                }

                // Header with label and percentage (if position is right)
                var headerEl = null;
                if (a.showLabels || (a.showPercentage && a.percentagePosition === 'right')) {
                    headerEl = el('div', { className: 'bkbg-pb-header' },
                        labelEl,
                        a.percentagePosition === 'right' && percentageEl
                    );
                }

                // Above bar percentage
                var aboveEl = null;
                if (a.showPercentage && a.percentagePosition === 'above') {
                    aboveEl = el('div', { className: 'bkbg-pb-above' },
                        el('span', { 
                            className: 'bkbg-pb-percentage-above',
                            style: { left: item.percentage + '%' }
                        }, item.percentage + '%')
                    );
                }

                // Bar classes
                var barClasses = 'bkbg-pb-bar';
                if (a.stripes) barClasses += ' bkbg-pb-striped';
                if (a.stripesAnimated) barClasses += ' bkbg-pb-striped-animated';

                // Item actions (visible on hover)
                var itemActions = el('div', { className: 'bkbg-pb-item-actions' },
                    el(Button, {
                        icon: 'arrow-up-alt2',
                        size: 'small',
                        disabled: index === 0,
                        onClick: function (e) { e.stopPropagation(); moveItem(index, -1); },
                        label: __('Move Up', 'blockenberg')
                    }),
                    el(Button, {
                        icon: 'arrow-down-alt2',
                        size: 'small',
                        disabled: index === a.items.length - 1,
                        onClick: function (e) { e.stopPropagation(); moveItem(index, 1); },
                        label: __('Move Down', 'blockenberg')
                    }),
                    el(Button, {
                        icon: 'admin-page',
                        size: 'small',
                        onClick: function (e) { 
                            e.stopPropagation();
                            var newItems = a.items.slice();
                            newItems.splice(index + 1, 0, Object.assign({}, item));
                            setAttributes({ items: newItems });
                        },
                        label: __('Duplicate', 'blockenberg')
                    }),
                    el(Button, {
                        icon: 'trash',
                        size: 'small',
                        isDestructive: true,
                        onClick: function (e) { e.stopPropagation(); removeItem(index); },
                        label: __('Delete', 'blockenberg')
                    })
                );

                var itemClass = 'bkbg-pb-item';
                if (hovered === index) itemClass += ' bkbg-pb-item-hovered';

                return el('div', { 
                    className: itemClass, 
                    key: index,
                    onMouseEnter: function () { setHovered(index); },
                    onMouseLeave: function () { setHovered(null); }
                },
                    itemActions,
                    headerEl,
                    aboveEl,
                    el('div', { className: 'bkbg-pb-track' },
                        el('div', { 
                            className: barClasses,
                            style: getBarStyle(item)
                        },
                            a.percentagePosition === 'inside' && el('span', { className: 'bkbg-pb-percentage-inside' }, item.percentage + '%')
                        )
                    )
                );
            });

            // Layout classes
            var layoutClass = 'bkbg-pb-wrap bkbg-editor-wrap';
            layoutClass += ' bkbg-pb-' + a.layoutStyle;
            if (isSelected) layoutClass += ' bkbg-block-selected';

            // Block props for proper selection handling
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {
                    '--bkbg-pb-bar-height': a.barHeight + 'px',
                    '--bkbg-pb-bar-spacing': a.barSpacing + 'px',
                    '--bkbg-pb-bar-radius': a.barRadius + 'px',
                    '--bkbg-pb-track-color': a.trackColor,
                    '--bkbg-pb-label-color': a.labelColor,
                    '--bkbg-pb-percentage-color': a.percentageColor,
                    '--bkbg-pb-title-color': a.titleColor,
                    '--bkbg-pb-animation-duration': a.animationDuration + 'ms'
                };
                if (_tv) {
                    Object.assign(s, _tv(a.titleTypo || {}, '--bkbg-pb-tt-'));
                    Object.assign(s, _tv(a.labelTypo || {}, '--bkbg-pb-lb-'));
                    Object.assign(s, _tv(a.pctTypo || {}, '--bkbg-pb-pct-'));
                }
                return { className: layoutClass, style: s, 'data-layout': a.layoutStyle, 'data-block-label': 'Progress Bar' };
            })());

            // Block toolbar
            var blockToolbar = el(BlockControls, {},
                el(ToolbarGroup, {},
                    el(ToolbarButton, {
                        icon: 'plus-alt2',
                        label: __('Add Progress Bar', 'blockenberg'),
                        onClick: addItem
                    })
                )
            );

            // Add item action bar (shared editor UI)
            var addButton = el('div', { className: 'bkbg-editor-actions' },
                el(Button, {
                    variant: 'secondary',
                    icon: 'plus-alt2',
                    onClick: addItem
                }, __('Add Bar', 'blockenberg'))
            );

            return el(Fragment, {},
                blockToolbar,
                inspector,
                el('div', blockProps,
                    titleEl,
                    el('div', { className: 'bkbg-pb-list' }, progressBars),
                    addButton
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            // CSS variables
            var wrapStyle = (function () {
                var _tv = getTypoCssVars();
                var s = {
                    '--bkbg-pb-bar-height': a.barHeight + 'px',
                    '--bkbg-pb-bar-spacing': a.barSpacing + 'px',
                    '--bkbg-pb-bar-radius': a.barRadius + 'px',
                    '--bkbg-pb-track-color': a.trackColor,
                    '--bkbg-pb-label-color': a.labelColor,
                    '--bkbg-pb-percentage-color': a.percentageColor,
                    '--bkbg-pb-title-color': a.titleColor,
                    '--bkbg-pb-animation-duration': a.animationDuration + 'ms'
                };
                if (_tv) {
                    Object.assign(s, _tv(a.titleTypo || {}, '--bkbg-pb-tt-'));
                    Object.assign(s, _tv(a.labelTypo || {}, '--bkbg-pb-lb-'));
                    Object.assign(s, _tv(a.pctTypo || {}, '--bkbg-pb-pct-'));
                }
                return s;
            })();

            // Serialize items for frontend
            var itemsData = a.items.map(function (item) {
                return item.label + '|' + item.percentage + '|' + item.color;
            }).join(';;');

            // Layout classes
            var layoutClass = 'bkbg-pb-wrap';
            layoutClass += ' bkbg-pb-' + a.layoutStyle;
            if (a.stripes) layoutClass += ' bkbg-pb-striped';
            if (a.stripesAnimated) layoutClass += ' bkbg-pb-striped-animated';
            if (a.glowEffect) layoutClass += ' bkbg-pb-glow';
            if (a.gradient) layoutClass += ' bkbg-pb-gradient';

            // Title element
            var titleEl = null;
            if (a.showTitle && a.title) {
                titleEl = el('div', { className: 'bkbg-pb-title' }, a.title);
            }

            return el('div', {
                className: layoutClass,
                style: wrapStyle,
                'data-layout': a.layoutStyle,
                'data-items': itemsData,
                'data-animate': a.animateOnScroll ? '1' : '0',
                'data-show-labels': a.showLabels ? '1' : '0',
                'data-show-percentage': a.showPercentage ? '1' : '0',
                'data-percentage-position': a.percentagePosition,
                'data-gradient': a.gradient ? '1' : '0',
                'data-gradient-angle': a.gradientAngle,
                'data-glow': a.glowEffect ? '1' : '0'
            },
                titleEl,
                el('div', { className: 'bkbg-pb-list' })
            );
        }
    });
}() );
