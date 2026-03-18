( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
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
    var __experimentalBoxControl = wp.components.__experimentalBoxControl;
    var BoxControl = __experimentalBoxControl;
    // Lazy lookup so the typography control is resolved at render time,
    // not at module-init time (avoids load-order issues).
    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    // Icon SVGs
    var icons = {
        chevron: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M7 10l5 5 5-5z' })
        ),
        plus: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' })
        ),
        arrow: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' })
        ),
        caret: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M7 14l5-5 5 5H7z' })
        )
    };

    function getIcon(type) {
        return icons[type] || icons.chevron;
    }

    registerBlockType('blockenberg/accordion', {
        title: __('Accordion', 'blockenberg'),
        icon: 'list-view',
        category: 'bkbg-content',
        description: __('Collapsible accordion panels for FAQ, features, and more.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

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

            function removeItem(index) {
                if (a.items.length <= 1) return;
                var newItems = a.items.filter(function (_, i) { return i !== index; });
                var newActive = a.activeItems.filter(function (i) { return i !== index; }).map(function (i) {
                    return i > index ? i - 1 : i;
                });
                setAttributes({ items: newItems, activeItems: newActive });
            }

            function addItem() {
                setAttributes({
                    items: a.items.concat([{
                        title: __('New Accordion Item', 'blockenberg'),
                        content: __('Add your content here. Click to edit.', 'blockenberg')
                    }])
                });
            }

            function moveItem(index, direction) {
                var newIndex = index + direction;
                if (newIndex < 0 || newIndex >= a.items.length) return;
                var newItems = a.items.slice();
                var temp = newItems[index];
                newItems[index] = newItems[newIndex];
                newItems[newIndex] = temp;
                // Update activeItems indices
                var newActive = a.activeItems.map(function (i) {
                    if (i === index) return newIndex;
                    if (i === newIndex) return index;
                    return i;
                });
                setAttributes({ items: newItems, activeItems: newActive });
            }

            function toggleItem(index) {
                var isActive = a.activeItems.indexOf(index) !== -1;
                var newActive;
                if (isActive) {
                    newActive = a.activeItems.filter(function (i) { return i !== index; });
                } else {
                    if (a.allowMultiple) {
                        newActive = a.activeItems.concat([index]);
                    } else {
                        newActive = [index];
                    }
                }
                setAttributes({ activeItems: newActive });
            }

            function createShadowString(h, v, blur, spread, color) {
                return h + 'px ' + v + 'px ' + blur + 'px ' + spread + 'px ' + color;
            }

            // Style options
            var styleOptions = [
                { label: __('Default (Separated)', 'blockenberg'), value: 'default' },
                { label: __('Connected', 'blockenberg'), value: 'connected' },
                { label: __('Minimal', 'blockenberg'), value: 'minimal' },
                { label: __('Boxed', 'blockenberg'), value: 'boxed' }
            ];

            var iconTypeOptions = [
                { label: __('Chevron', 'blockenberg'), value: 'chevron' },
                { label: __('Plus/Minus', 'blockenberg'), value: 'plus' },
                { label: __('Arrow', 'blockenberg'), value: 'arrow' },
                { label: __('Caret', 'blockenberg'), value: 'caret' }
            ];

            var iconPositionOptions = [
                { label: __('Right', 'blockenberg'), value: 'right' },
                { label: __('Left', 'blockenberg'), value: 'left' }
            ];

            var borderStyleOptions = [
                { label: __('Solid', 'blockenberg'), value: 'solid' },
                { label: __('Dashed', 'blockenberg'), value: 'dashed' },
                { label: __('Dotted', 'blockenberg'), value: 'dotted' },
                { label: __('None', 'blockenberg'), value: 'none' }
            ];

            var animationTypeOptions = [
                { label: __('Slide', 'blockenberg'), value: 'slide' },
                { label: __('Fade', 'blockenberg'), value: 'fade' },
                { label: __('None', 'blockenberg'), value: 'none' }
            ];



            // Inspector Controls
            var inspector = el(InspectorControls, {},
                // Behavior Panel
                el(PanelBody, { title: __('Behavior', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Allow multiple open', 'blockenberg'),
                        help: __('Allow several panels to be open simultaneously.', 'blockenberg'),
                        checked: a.allowMultiple,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ allowMultiple: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('First panel open by default', 'blockenberg'),
                        checked: a.firstOpen,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ firstOpen: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Collapse all initially', 'blockenberg'),
                        help: __('Start with all panels closed.', 'blockenberg'),
                        checked: a.collapseAll,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ collapseAll: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Enable FAQ Schema', 'blockenberg'),
                        help: __('Add FAQPage structured data for SEO.', 'blockenberg'),
                        checked: a.schemaEnabled,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ schemaEnabled: v }); }
                    })
                ),

                // Style Panel
                el(PanelBody, { title: __('Accordion Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'),
                        value: a.accordionStyle,
                        options: styleOptions,
                        onChange: function (v) { setAttributes({ accordionStyle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Icon Type', 'blockenberg'),
                        value: a.iconType,
                        options: iconTypeOptions,
                        onChange: function (v) { setAttributes({ iconType: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Icon Position', 'blockenberg'),
                        value: a.iconPosition,
                        options: iconPositionOptions,
                        onChange: function (v) { setAttributes({ iconPosition: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Icon Size', 'blockenberg'),
                        value: a.iconSize,
                        min: 12,
                        max: 32,
                        onChange: function (v) { setAttributes({ iconSize: v }); }
                    })
                ),

                // Spacing Panel
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Gap Between Items', 'blockenberg'),
                        value: a.gap,
                        min: 0,
                        max: 40,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    }),
                    el('p', { className: 'components-base-control__label', style: { marginBottom: '8px' } }, __('Header Padding', 'blockenberg')),
                    el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' } },
                        el(RangeControl, { label: __('Top', 'blockenberg'), value: a.headerPaddingTop, min: 0, max: 40, onChange: function (v) { setAttributes({ headerPaddingTop: v }); } }),
                        el(RangeControl, { label: __('Right', 'blockenberg'), value: a.headerPaddingRight, min: 0, max: 40, onChange: function (v) { setAttributes({ headerPaddingRight: v }); } }),
                        el(RangeControl, { label: __('Bottom', 'blockenberg'), value: a.headerPaddingBottom, min: 0, max: 40, onChange: function (v) { setAttributes({ headerPaddingBottom: v }); } }),
                        el(RangeControl, { label: __('Left', 'blockenberg'), value: a.headerPaddingLeft, min: 0, max: 40, onChange: function (v) { setAttributes({ headerPaddingLeft: v }); } })
                    ),
                    el('p', { className: 'components-base-control__label', style: { marginBottom: '8px' } }, __('Content Padding', 'blockenberg')),
                    el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' } },
                        el(RangeControl, { label: __('Top', 'blockenberg'), value: a.contentPaddingTop, min: 0, max: 40, onChange: function (v) { setAttributes({ contentPaddingTop: v }); } }),
                        el(RangeControl, { label: __('Right', 'blockenberg'), value: a.contentPaddingRight, min: 0, max: 40, onChange: function (v) { setAttributes({ contentPaddingRight: v }); } }),
                        el(RangeControl, { label: __('Bottom', 'blockenberg'), value: a.contentPaddingBottom, min: 0, max: 40, onChange: function (v) { setAttributes({ contentPaddingBottom: v }); } }),
                        el(RangeControl, { label: __('Left', 'blockenberg'), value: a.contentPaddingLeft, min: 0, max: 40, onChange: function (v) { setAttributes({ contentPaddingLeft: v }); } })
                    )
                ),

                // Border Panel
                el(PanelBody, { title: __('Border', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.borderRadius,
                        min: 0,
                        max: 24,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Width', 'blockenberg'),
                        value: a.borderWidth,
                        min: 0,
                        max: 5,
                        onChange: function (v) { setAttributes({ borderWidth: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Border Style', 'blockenberg'),
                        value: a.borderStyle,
                        options: borderStyleOptions,
                        onChange: function (v) { setAttributes({ borderStyle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Divider', 'blockenberg'),
                        help: __('Show line between header and content.', 'blockenberg'),
                        checked: a.dividerEnabled,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ dividerEnabled: v }); }
                    }),
                    a.dividerEnabled && el(RangeControl, {
                        label: __('Divider Width', 'blockenberg'),
                        value: a.dividerWidth,
                        min: 1,
                        max: 5,
                        onChange: function (v) { setAttributes({ dividerWidth: v }); }
                    })
                ),

                // Typography Panel
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function () {
                        var TC = getTypographyControl();
                        if (!TC) return el('p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, __('Typography control loading…', 'blockenberg'));
                        return el(Fragment, {},
                            el(TC, {
                                label: __('Title', 'blockenberg'),
                                value: a.headerTypo || {},
                                onChange: function (v) { setAttributes({ headerTypo: v }); }
                            }),
                            el(TC, {
                                label: __('Content', 'blockenberg'),
                                value: a.contentTypo || {},
                                onChange: function (v) { setAttributes({ contentTypo: v }); }
                            })
                        );
                    })()
                ),

                // Effects Panel
                el(PanelBody, { title: __('Effects', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Enable Animation', 'blockenberg'),
                        checked: a.enableAnimation,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ enableAnimation: v }); }
                    }),
                    a.enableAnimation && el(RangeControl, {
                        label: __('Animation Duration (ms)', 'blockenberg'),
                        value: a.animationDuration,
                        min: 100,
                        max: 800,
                        step: 50,
                        onChange: function (v) { setAttributes({ animationDuration: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Enable Hover Effect', 'blockenberg'),
                        checked: a.enableHoverEffect,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ enableHoverEffect: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Enable Shadow', 'blockenberg'),
                        checked: a.enableShadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ enableShadow: v }); }
                    }),
                    a.enableShadow && el(Fragment, {},
                        el(RangeControl, {
                            label: __('Shadow Horizontal', 'blockenberg'),
                            value: a.shadowHorizontal,
                            min: -20,
                            max: 20,
                            onChange: function (v) { setAttributes({ shadowHorizontal: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Shadow Vertical', 'blockenberg'),
                            value: a.shadowVertical,
                            min: -20,
                            max: 20,
                            onChange: function (v) { setAttributes({ shadowVertical: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Shadow Blur', 'blockenberg'),
                            value: a.shadowBlur,
                            min: 0,
                            max: 40,
                            onChange: function (v) { setAttributes({ shadowBlur: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Shadow Spread', 'blockenberg'),
                            value: a.shadowSpread,
                            min: -10,
                            max: 10,
                            onChange: function (v) { setAttributes({ shadowSpread: v }); }
                        })
                    )
                ),

                // Colors Panel
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Header Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.headerBg, onChange: function (c) { setAttributes({ headerBg: c }); }, label: __('Background', 'blockenberg') },
                            { value: a.headerBgHover, onChange: function (c) { setAttributes({ headerBgHover: c }); }, label: __('Background (Hover)', 'blockenberg') },
                            { value: a.headerBgActive, onChange: function (c) { setAttributes({ headerBgActive: c }); }, label: __('Background (Active)', 'blockenberg') },
                            { value: a.headerColor, onChange: function (c) { setAttributes({ headerColor: c }); }, label: __('Text', 'blockenberg') },
                            { value: a.headerColorHover, onChange: function (c) { setAttributes({ headerColorHover: c }); }, label: __('Text (Hover)', 'blockenberg') },
                            { value: a.headerColorActive, onChange: function (c) { setAttributes({ headerColorActive: c }); }, label: __('Text (Active)', 'blockenberg') }
                        ]
                    }),

                    el(PanelColorSettings, {
                        title: __('Content Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.contentBg, onChange: function (c) { setAttributes({ contentBg: c }); }, label: __('Background', 'blockenberg') },
                            { value: a.contentColor, onChange: function (c) { setAttributes({ contentColor: c }); }, label: __('Text', 'blockenberg') }
                        ]
                    }),

                    el(PanelColorSettings, {
                        title: __('Border & Icon Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.borderColor, onChange: function (c) { setAttributes({ borderColor: c }); }, label: __('Border', 'blockenberg') },
                            { value: a.borderColorActive, onChange: function (c) { setAttributes({ borderColorActive: c }); }, label: __('Border (Active)', 'blockenberg') },
                            { value: a.iconColor, onChange: function (c) { setAttributes({ iconColor: c }); }, label: __('Icon', 'blockenberg') },
                            { value: a.iconColorActive, onChange: function (c) { setAttributes({ iconColorActive: c }); }, label: __('Icon (Active)', 'blockenberg') },
                            { value: a.accentColor, onChange: function (c) { setAttributes({ accentColor: c }); }, label: __('Accent', 'blockenberg') },
                            { value: a.dividerColor, onChange: function (c) { setAttributes({ dividerColor: c }); }, label: __('Divider', 'blockenberg') },
                            { value: a.shadowColor, onChange: function (c) { setAttributes({ shadowColor: c }); }, label: __('Shadow', 'blockenberg') }
                        ]
                    })
                )
            );

            // CSS variables for preview
            var wrapStyle = {
                '--bkbg-ac-gap': a.gap + 'px',
                '--bkbg-ac-radius': a.borderRadius + 'px',
                '--bkbg-ac-brd-w': a.borderWidth + 'px',
                '--bkbg-ac-brd-style': a.borderStyle,
                '--bkbg-ac-header-padding': a.headerPaddingTop + 'px ' + a.headerPaddingRight + 'px ' + a.headerPaddingBottom + 'px ' + a.headerPaddingLeft + 'px',
                '--bkbg-ac-content-padding': a.contentPaddingTop + 'px ' + a.contentPaddingRight + 'px ' + a.contentPaddingBottom + 'px ' + a.contentPaddingLeft + 'px',
                '--bkbg-ac-header-bg': a.headerBg,
                '--bkbg-ac-header-bg-hover': a.headerBgHover,
                '--bkbg-ac-header-bg-active': a.headerBgActive,
                '--bkbg-ac-header-color': a.headerColor,
                '--bkbg-ac-header-color-hover': a.headerColorHover,
                '--bkbg-ac-header-color-active': a.headerColorActive,
                '--bkbg-ac-content-bg': a.contentBg,
                '--bkbg-ac-content-color': a.contentColor,
                '--bkbg-ac-border-color': a.borderColor,
                '--bkbg-ac-border-color-active': a.borderColorActive,
                '--bkbg-ac-icon-color': a.iconColor,
                '--bkbg-ac-icon-color-active': a.iconColorActive,
                '--bkbg-ac-accent': a.accentColor,
                '--bkbg-ac-header-font-size': a.headerFontSize + 'px',
                '--bkbg-ac-header-font-weight': a.headerFontWeight,
                '--bkbg-ac-header-line-height': a.headerLineHeight,
                '--bkbg-ac-content-font-size': a.contentFontSize + 'px',
                '--bkbg-ac-content-font-weight': a.contentFontWeight,
                '--bkbg-ac-content-line-height': a.contentLineHeight,
                '--bkbg-ac-icon-size': a.iconSize + 'px',
                '--bkbg-ac-shadow': a.enableShadow ? createShadowString(a.shadowHorizontal, a.shadowVertical, a.shadowBlur, a.shadowSpread, a.shadowColor) : 'none',
                '--bkbg-ac-animation-duration': a.animationDuration + 'ms',
                '--bkbg-ac-divider-color': a.dividerColor,
                '--bkbg-ac-divider-width': a.dividerWidth + 'px'
            };
            // Merge typography CSS vars (override legacy font size/weight/line-height)
            var _typoCssVars = getTypoCssVars();
            Object.assign(wrapStyle, _typoCssVars(a.headerTypo  || {}, '--bkbg-ac-header-'));
            Object.assign(wrapStyle, _typoCssVars(a.contentTypo || {}, '--bkbg-ac-content-'));

            var wrapDataAttrs = {
                'data-style': a.accordionStyle,
                'data-icon': a.iconType,
                'data-icon-pos': a.iconPosition,
                'data-animation': a.enableAnimation ? '1' : '0',
                'data-hover': a.enableHoverEffect ? '1' : '0',
                'data-shadow': a.enableShadow ? '1' : '0',
                'data-divider': a.dividerEnabled ? '1' : '0'
            };

            // Build accordion items (WYSIWYG)
            var itemsEl = a.items.map(function (item, index) {
                var isActive = a.activeItems.indexOf(index) !== -1;

                return el('div', {
                    className: 'bkbg-ac-item' + (isActive ? ' is-active' : ''),
                    key: 'item-' + index
                },
                    // Item actions toolbar
                    el('div', { className: 'bkbg-ac-item-actions' },
                        el(Button, {
                            icon: 'arrow-up-alt2',
                            label: __('Move up', 'blockenberg'),
                            onClick: function () { moveItem(index, -1); },
                            disabled: index === 0,
                            isSmall: true
                        }),
                        el(Button, {
                            icon: 'arrow-down-alt2',
                            label: __('Move down', 'blockenberg'),
                            onClick: function () { moveItem(index, 1); },
                            disabled: index === a.items.length - 1,
                            isSmall: true
                        }),
                        el(Button, {
                            icon: 'trash',
                            label: __('Remove', 'blockenberg'),
                            onClick: function () { removeItem(index); },
                            isDestructive: true,
                            isSmall: true,
                            disabled: a.items.length <= 1
                        })
                    ),

                    // Header (clickable)
                    el('button', {
                        className: 'bkbg-ac-header',
                        'aria-expanded': isActive ? 'true' : 'false',
                        onClick: function (e) {
                            // Don't toggle if clicking on input
                            if (e.target.tagName === 'INPUT') return;
                            toggleItem(index);
                        }
                    },
                        el('input', {
                            className: 'bkbg-ac-title-input',
                            type: 'text',
                            value: item.title,
                            placeholder: __('Enter title...', 'blockenberg'),
                            onChange: function (e) { updateItem(index, 'title', e.target.value); },
                            onClick: function (e) { e.stopPropagation(); }
                        }),
                        el('span', { className: 'bkbg-ac-icon', 'aria-hidden': 'true' }, getIcon(a.iconType))
                    ),

                    // Content panel
                    el('div', {
                        className: 'bkbg-ac-content',
                        'aria-hidden': isActive ? 'false' : 'true'
                    },
                        el('div', { className: 'bkbg-ac-inner' },
                            el(RichText, {
                                tagName: 'div',
                                className: 'bkbg-ac-body bkbg-ac-body-editor',
                                value: item.content,
                                onChange: function (value) { updateItem(index, 'content', value); },
                                placeholder: __('Add content...', 'blockenberg')
                            })
                        )
                    )
                );
            });

            var blockProps = useBlockProps({
                className: 'bkbg-editor-wrap',
                'data-block-label': 'Accordion'
            });

            return el('div', blockProps,
                inspector,
                el('div', Object.assign({ className: 'bkbg-ac-wrap', style: wrapStyle }, wrapDataAttrs),
                    itemsEl,
                ),
                el('div', { className: 'bkbg-editor-actions' },
                    el(Button, { variant: 'secondary', icon: 'plus-alt2', onClick: addItem }, __('Add Item', 'blockenberg'))
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            function createShadowString(h, v, blur, spread, color) {
                return h + 'px ' + v + 'px ' + blur + 'px ' + spread + 'px ' + color;
            }

            var wrapStyle = {
                '--bkbg-ac-gap': a.gap + 'px',
                '--bkbg-ac-radius': a.borderRadius + 'px',
                '--bkbg-ac-brd-w': a.borderWidth + 'px',
                '--bkbg-ac-brd-style': a.borderStyle,
                '--bkbg-ac-header-padding': a.headerPaddingTop + 'px ' + a.headerPaddingRight + 'px ' + a.headerPaddingBottom + 'px ' + a.headerPaddingLeft + 'px',
                '--bkbg-ac-content-padding': a.contentPaddingTop + 'px ' + a.contentPaddingRight + 'px ' + a.contentPaddingBottom + 'px ' + a.contentPaddingLeft + 'px',
                '--bkbg-ac-header-bg': a.headerBg,
                '--bkbg-ac-header-bg-hover': a.headerBgHover,
                '--bkbg-ac-header-bg-active': a.headerBgActive,
                '--bkbg-ac-header-color': a.headerColor,
                '--bkbg-ac-header-color-hover': a.headerColorHover,
                '--bkbg-ac-header-color-active': a.headerColorActive,
                '--bkbg-ac-content-bg': a.contentBg,
                '--bkbg-ac-content-color': a.contentColor,
                '--bkbg-ac-border-color': a.borderColor,
                '--bkbg-ac-border-color-active': a.borderColorActive,
                '--bkbg-ac-icon-color': a.iconColor,
                '--bkbg-ac-icon-color-active': a.iconColorActive,
                '--bkbg-ac-accent': a.accentColor,
                '--bkbg-ac-header-font-size': a.headerFontSize + 'px',
                '--bkbg-ac-header-font-weight': a.headerFontWeight,
                '--bkbg-ac-header-line-height': a.headerLineHeight,
                '--bkbg-ac-content-font-size': a.contentFontSize + 'px',
                '--bkbg-ac-content-font-weight': a.contentFontWeight,
                '--bkbg-ac-content-line-height': a.contentLineHeight,
                '--bkbg-ac-icon-size': a.iconSize + 'px',
                '--bkbg-ac-shadow': a.enableShadow ? createShadowString(a.shadowHorizontal, a.shadowVertical, a.shadowBlur, a.shadowSpread, a.shadowColor) : 'none',
                '--bkbg-ac-animation-duration': a.animationDuration + 'ms',
                '--bkbg-ac-divider-color': a.dividerColor,
                '--bkbg-ac-divider-width': a.dividerWidth + 'px'
            };
            // Merge typography CSS vars from the new typography objects
            var _typoCssVarsSave = getTypoCssVars();
            Object.assign(wrapStyle, _typoCssVarsSave(a.headerTypo  || {}, '--bkbg-ac-header-'));
            Object.assign(wrapStyle, _typoCssVarsSave(a.contentTypo || {}, '--bkbg-ac-content-'));

            // Icons
            var iconSvgs = {
                chevron: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' }, el('path', { d: 'M7 10l5 5 5-5z' })),
                plus: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' }, el('path', { d: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' })),
                arrow: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' }, el('path', { d: 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' })),
                caret: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' }, el('path', { d: 'M7 14l5-5 5 5H7z' }))
            };
            var iconEl = iconSvgs[a.iconType] || iconSvgs.chevron;

            // Determine initial open items
            var initialOpen = [];
            if (!a.collapseAll) {
                if (a.firstOpen) {
                    initialOpen = [0];
                }
            }

            var itemsEl = a.items.map(function (item, index) {
                var isOpen = initialOpen.indexOf(index) !== -1;
                var headerId = 'bkbg-ac-h-' + index;
                var contentId = 'bkbg-ac-c-' + index;

                return el('div', { className: 'bkbg-ac-item' + (isOpen ? ' is-active' : ''), key: 'item-' + index },
                    el('button', {
                        className: 'bkbg-ac-header',
                        id: headerId,
                        'aria-expanded': isOpen ? 'true' : 'false',
                        'aria-controls': contentId
                    },
                        el('span', { className: 'bkbg-ac-title' }, item.title),
                        el('span', { className: 'bkbg-ac-icon', 'aria-hidden': 'true' }, iconEl)
                    ),
                    el('div', {
                        className: 'bkbg-ac-content',
                        id: contentId,
                        role: 'region',
                        'aria-labelledby': headerId,
                        'aria-hidden': isOpen ? 'false' : 'true'
                    },
                        el('div', { className: 'bkbg-ac-inner' },
                            el(wp.blockEditor.RichText.Content, {
                                tagName: 'div',
                                className: 'bkbg-ac-body',
                                value: item.content
                            })
                        )
                    )
                );
            });

            return el('div', {
                className: 'bkbg-ac-wrap',
                style: wrapStyle,
                'data-allow-multiple': a.allowMultiple ? '1' : '0',
                'data-style': a.accordionStyle,
                'data-icon': a.iconType,
                'data-icon-pos': a.iconPosition,
                'data-animation': a.enableAnimation ? '1' : '0',
                'data-hover': a.enableHoverEffect ? '1' : '0',
                'data-shadow': a.enableShadow ? '1' : '0',
                'data-divider': a.dividerEnabled ? '1' : '0',
                'data-schema': a.schemaEnabled ? '1' : '0'
            }, itemsEl);
        }
    });
}() );
