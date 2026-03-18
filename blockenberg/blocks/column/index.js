( function () {
    var el = wp.element.createElement;
    var useEffect = wp.element.useEffect;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InnerBlocks = wp.blockEditor.InnerBlocks;
    var useSelect = wp.data.useSelect;
    var useDispatch = wp.data.useDispatch;
    var PanelBody = wp.components.PanelBody;
    var SelectControl = wp.components.SelectControl;
    var RangeControl = wp.components.RangeControl;
    var BaseControl = wp.components.BaseControl;
    var Button = wp.components.Button;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }
    var _tv = (function () {
        var fn = window.bkbgTypoCssVars;
        return fn ? fn : function () { return {}; };
    })();

    // Custom Appender that opens sidebar inserter instead of popover
    function SidebarInserterAppender(props) {
        var rootClientId = props.rootClientId;
        
        // Get the inserter toggle function
        var insertionPoint = useSelect(function (select) {
            var blockEditor = select('core/block-editor');
            var innerBlocks = blockEditor.getBlocks(rootClientId);
            return {
                index: innerBlocks.length
            };
        }, [rootClientId]);
        
        function handleClick() {
            // Toggle the global inserter sidebar (not the popover).
            try {
                var editPostDispatch = wp.data.dispatch('core/edit-post');
                if (editPostDispatch && typeof editPostDispatch.setIsInserterOpened === 'function') {
                    editPostDispatch.setIsInserterOpened(true);
                }
            } catch (e) {}

            try {
                var editSiteDispatch = wp.data.dispatch('core/edit-site');
                if (editSiteDispatch && typeof editSiteDispatch.setIsInserterOpened === 'function') {
                    editSiteDispatch.setIsInserterOpened(true);
                }
            } catch (e) {}

            // Attempt to set an insertion point inside this column.
            try {
                var beDispatch = wp.data.dispatch('core/block-editor');
                if (beDispatch) {
                    if (typeof beDispatch.setInsertionPoint === 'function') {
                        beDispatch.setInsertionPoint(rootClientId, insertionPoint.index);
                    } else if (typeof beDispatch.__unstableSetInsertionPoint === 'function') {
                        try {
                            beDispatch.__unstableSetInsertionPoint({ rootClientId: rootClientId, index: insertionPoint.index });
                        } catch (e2) {
                            beDispatch.__unstableSetInsertionPoint(rootClientId, insertionPoint.index);
                        }
                    }
                }
            } catch (e) {}
        }
        
        return el(Button, {
            className: 'bkbg-sidebar-appender block-editor-button-block-appender',
            onClick: handleClick,
            label: __('Add block', 'blockenberg')
        },
            el('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                viewBox: '0 0 24 24',
                width: '24',
                height: '24',
                'aria-hidden': 'true',
                focusable: 'false'
            },
                el('path', { d: 'M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z' })
            )
        );
    }

    // Spacing token scale for inner padding
    var paddingOptions = [
        { label: __('None', 'blockenberg'), value: 'none' },
        { label: __('XS (8px)', 'blockenberg'), value: 'xs' },
        { label: __('S (16px)', 'blockenberg'), value: 's' },
        { label: __('M (24px)', 'blockenberg'), value: 'm' },
        { label: __('L (32px)', 'blockenberg'), value: 'l' },
        { label: __('XL (48px)', 'blockenberg'), value: 'xl' }
    ];

    var vAlignOptions = [
        { label: __('Top', 'blockenberg'), value: 'top' },
        { label: __('Middle', 'blockenberg'), value: 'middle' },
        { label: __('Bottom', 'blockenberg'), value: 'bottom' }
    ];

    var spacingUnitOptions = [
        { label: 'px', value: 'px' },
        { label: '%', value: '%' },
        { label: 'em', value: 'em' },
        { label: 'rem', value: 'rem' },
        { label: 'vw', value: 'vw' },
        { label: 'vh', value: 'vh' },
        { label: __('Custom', 'blockenberg'), value: 'custom' }
    ];

    function getSpacingSideValue(attrs, type, side) {
        var cap = side.charAt(0).toUpperCase() + side.slice(1);
        var value = attrs[type + cap];
        var unit = attrs[type + cap + 'Unit'] || 'px';
        var customUnit = attrs[type + cap + 'CustomUnit'] || '';

        if (value === undefined || value === null) return undefined;
        var raw = String(value).trim();
        if (!raw) return undefined;

        if (unit === 'custom') {
            return customUnit ? raw + customUnit : raw;
        }

        return raw + unit;
    }

    function getSpacingStyles(attrs) {
        return {
            paddingTop: getSpacingSideValue(attrs, 'padding', 'top'),
            paddingRight: getSpacingSideValue(attrs, 'padding', 'right'),
            paddingBottom: getSpacingSideValue(attrs, 'padding', 'bottom'),
            paddingLeft: getSpacingSideValue(attrs, 'padding', 'left'),
            marginTop: getSpacingSideValue(attrs, 'margin', 'top'),
            marginRight: getSpacingSideValue(attrs, 'margin', 'right'),
            marginBottom: getSpacingSideValue(attrs, 'margin', 'bottom'),
            marginLeft: getSpacingSideValue(attrs, 'margin', 'left')
        };
    }

    // Column icon
    var columnIcon = el('svg', { 
        width: 24, 
        height: 24, 
        viewBox: '0 0 24 24', 
        xmlns: 'http://www.w3.org/2000/svg' 
    },
        el('path', { 
            d: 'M5 4h14v16H5V4zm2 2v12h10V6H7z',
            fill: 'currentColor'
        })
    );

    // Generate unique ID
    function generateUid() {
        return 'col-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    registerBlockType('blockenberg/column', {
        title: __('Column', 'blockenberg'),
        icon: columnIcon,
        category: 'bkbg-layout',
        parent: ['blockenberg/row'],
        description: __('A column container within a row for content.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var clientId = props.clientId;
            var a = attributes;

            var moveBlockToPosition = useDispatch('core/block-editor').moveBlockToPosition;
            var replaceInnerBlocks = useDispatch('core/block-editor').replaceInnerBlocks;
            var updateBlockAttributes = useDispatch('core/block-editor').updateBlockAttributes;
            var createBlock = wp.blocks.createBlock;

            // Generate UID if not set
            useEffect(function () {
                if (!a.uid) {
                    setAttributes({ uid: generateUid() });
                }
            }, []);

            // Get parent row info (responsive mode + column index)
            var parentData = useSelect(function (select) {
                var parents = select('core/block-editor').getBlockParents(clientId);
                for (var i = parents.length - 1; i >= 0; i--) {
                    var parent = select('core/block-editor').getBlock(parents[i]);
                    if (parent && parent.name === 'blockenberg/row') {
                        var siblings = parent.innerBlocks || [];
                        var colIndex = siblings.findIndex(function (b) { return b.clientId === clientId; });
                        return {
                            rowClientId: parents[i],
                            colIndex: colIndex,
                            colCount: siblings.length,
                            responsiveMode: parent.attributes.responsiveMode || 'desktop',
                            stackOnMobile: parent.attributes.stackOnMobile !== false
                        };
                    }
                }
                return { rowClientId: null, colIndex: -1, colCount: 0, responsiveMode: 'desktop', stackOnMobile: true };
            }, [clientId]);

            var responsiveMode = parentData.responsiveMode;
            var stackOnMobile = parentData.stackOnMobile;

            function moveSelf(direction) {
                if (!parentData.rowClientId) return;
                if (parentData.colIndex < 0) return;
                var newIndex = direction === 'left' ? parentData.colIndex - 1 : parentData.colIndex + 1;
                if (newIndex < 0 || newIndex >= parentData.colCount) return;
                moveBlockToPosition(clientId, parentData.rowClientId, parentData.rowClientId, newIndex);
            }

            function removeSelfWithConfirm() {
                if (!parentData.rowClientId) return;
                if (parentData.colCount <= 1) return;

                var msg = __('Delete this column? All content inside will be removed.', 'blockenberg');
                if (typeof window !== 'undefined' && window.confirm && !window.confirm(msg)) return;

                var blocks = wp.data.select('core/block-editor').getBlocks(parentData.rowClientId);
                if (!blocks || !blocks.length) return;

                var newCount = blocks.length - 1;
                if (newCount < 1) return;

                var equalWidth = Math.round((100 / newCount) * 10) / 10;
                var newColumns = [];
                var newIndex = 0;

                for (var i = 0; i < blocks.length; i++) {
                    var existingCol = blocks[i];
                    if (!existingCol || !existingCol.clientId) continue;
                    if (existingCol.clientId === clientId) continue;

                    var width = equalWidth;
                    if (newIndex === newCount - 1) {
                        width = 100 - (equalWidth * (newCount - 1));
                        width = Math.round(width * 10) / 10;
                    }

                    var recreatedCol = createBlock('blockenberg/column', {
                        widths: { desktop: width, tablet: width, mobile: 100 },
                        uid: (existingCol.attributes && existingCol.attributes.uid) || ('col-' + Date.now() + '-' + newIndex),
                        paddingInner: (existingCol.attributes && existingCol.attributes.paddingInner) || 'none'
                    }, existingCol.innerBlocks);

                    recreatedCol.attributes = Object.assign({}, existingCol.attributes || {}, recreatedCol.attributes || {});

                    newColumns.push(recreatedCol);
                    newIndex++;
                }

                replaceInnerBlocks(parentData.rowClientId, newColumns, false);
                updateBlockAttributes(parentData.rowClientId, { columnsCount: newCount });
            }

            // Get width for current mode with fallback
            function getWidth(mode) {
                var widths = a.widths || { desktop: 50, tablet: 50, mobile: 100 };
                if (mode === 'mobile') {
                    return widths.mobile !== undefined ? widths.mobile : 
                           (widths.tablet !== undefined ? widths.tablet : 
                           (widths.desktop !== undefined ? widths.desktop : 50));
                }
                if (mode === 'tablet') {
                    return widths.tablet !== undefined ? widths.tablet : 
                           (widths.desktop !== undefined ? widths.desktop : 50);
                }
                return widths.desktop !== undefined ? widths.desktop : 50;
            }

            var currentWidth = getWidth(responsiveMode);
            var displayWidth = (responsiveMode === 'mobile' && stackOnMobile) ? 100 : currentWidth;

            // Update width for specific mode
            function updateWidth(mode, value) {
                var newWidths = Object.assign({}, a.widths || { desktop: 50, tablet: 50, mobile: 100 });
                newWidths[mode] = value;
                setAttributes({ widths: newWidths });
            }

            var colStyle = Object.assign({}, {
                    '--bkbg-col-desktop': (a.widths && a.widths.desktop || 50) + '%',
                    '--bkbg-col-tablet': (a.widths && a.widths.tablet || a.widths && a.widths.desktop || 50) + '%',
                    '--bkbg-col-mobile': (a.widths && a.widths.mobile || 100) + '%',
                    flexBasis: displayWidth + '%',
                    maxWidth: displayWidth + '%',
                    width: displayWidth + '%'
                }, getSpacingStyles(a));
            Object.assign(colStyle, _tv(a.typoContent, '--bkbg-col-cn'));
            var blockProps = useBlockProps({
                className: [
                    'bkbg-column',
                    'bkbg-column--padding-' + a.paddingInner,
                    'bkbg-column--valign-' + (a.vAlign || 'top')
                ].join(' '),
                style: colStyle,
                'data-uid': a.uid
            });

            function renderSpacingControl(type, label) {
                var sides = [
                    { key: 'Top', label: __('Top', 'blockenberg') },
                    { key: 'Left', label: __('Left', 'blockenberg') },
                    { key: 'Bottom', label: __('Bottom', 'blockenberg') },
                    { key: 'Right', label: __('Right', 'blockenberg') }
                ];

                return el('div', { className: 'bkbg-spacing-control' },
                    el('div', { className: 'bkbg-spacing-control__title' }, label),
                    el('div', { className: 'bkbg-spacing-control__grid' },
                        sides.map(function (side) {
                            var valueKey = type + side.key;
                            var unitKey = type + side.key + 'Unit';
                            var customUnitKey = type + side.key + 'CustomUnit';

                            return el('div', { className: 'bkbg-spacing-control__item', key: valueKey },
                                el('label', { className: 'bkbg-spacing-control__label' }, side.label),
                                el('div', { className: 'bkbg-spacing-control__row' },
                                    el('input', {
                                        type: 'text',
                                        className: 'components-text-control__input',
                                        value: a[valueKey] || '',
                                        placeholder: '0',
                                        onChange: function (e) {
                                            var next = {};
                                            next[valueKey] = e.target.value;
                                            setAttributes(next);
                                        }
                                    }),
                                    el('select', {
                                        className: 'components-select-control__input',
                                        value: a[unitKey] || 'px',
                                        onChange: function (e) {
                                            var next = {};
                                            next[unitKey] = e.target.value;
                                            setAttributes(next);
                                        }
                                    }, spacingUnitOptions.map(function (opt) {
                                        return el('option', { key: opt.value, value: opt.value }, opt.label);
                                    }))
                                ),
                                (a[unitKey] || 'px') === 'custom' && el('input', {
                                    type: 'text',
                                    className: 'components-text-control__input bkbg-spacing-control__custom-unit',
                                    value: a[customUnitKey] || '',
                                    placeholder: __('unit, e.g. ch', 'blockenberg'),
                                    onChange: function (e) {
                                        var next = {};
                                        next[customUnitKey] = e.target.value;
                                        setAttributes(next);
                                    }
                                })
                            );
                        })
                    )
                );
            }

            // Inspector controls
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Column Settings', 'blockenberg'), initialOpen: true },
                    el(BaseControl, {
                        label: __('Column Widths', 'blockenberg'),
                        help: __('Widths are typically controlled via drag handles on the row. You can fine-tune them here.', 'blockenberg')
                    }),
                    el('div', { className: 'bkbg-column-widths-controls' },
                        el(RangeControl, {
                            label: __('Desktop', 'blockenberg'),
                            value: a.widths && a.widths.desktop || 50,
                            onChange: function (v) { updateWidth('desktop', v); },
                            min: 5,
                            max: 100,
                            step: 0.5,
                            marks: [
                                { value: 25, label: '25%' },
                                { value: 50, label: '50%' },
                                { value: 75, label: '75%' },
                                { value: 100, label: '100%' }
                            ]
                        }),
                        el(RangeControl, {
                            label: __('Tablet', 'blockenberg'),
                            value: a.widths && a.widths.tablet || a.widths && a.widths.desktop || 50,
                            onChange: function (v) { updateWidth('tablet', v); },
                            min: 5,
                            max: 100,
                            step: 0.5
                        }),
                        el(RangeControl, {
                            label: __('Mobile', 'blockenberg'),
                            value: a.widths && a.widths.mobile || 100,
                            onChange: function (v) { updateWidth('mobile', v); },
                            min: 5,
                            max: 100,
                            step: 0.5,
                            help: stackOnMobile ? __('Mobile width is overridden when "Stack on Mobile" is enabled in the row settings.', 'blockenberg') : ''
                        })
                    ),
                    el(SelectControl, {
                        label: __('Vertical Alignment', 'blockenberg'),
                        value: a.vAlign || 'top',
                        options: vAlignOptions,
                        onChange: function (v) { setAttributes({ vAlign: v }); }
                    }),
                ),
                el(PanelBody, { title: __('Column Info', 'blockenberg'), initialOpen: false },
                    el('div', { className: 'bkbg-column-info' },
                        el('p', {}, 
                            el('strong', {}, __('Current Mode:', 'blockenberg')), 
                            ' ' + responsiveMode.charAt(0).toUpperCase() + responsiveMode.slice(1)
                        ),
                        el('p', {}, 
                            el('strong', {}, __('Current Width:', 'blockenberg')), 
                            ' ' + Math.round(currentWidth * 10) / 10 + '%'
                        ),
                        el('p', {}, 
                            el('strong', {}, __('UID:', 'blockenberg')), 
                            ' ' + (a.uid || 'N/A')
                        )
                    )
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function () {
                        var TC = getTypographyControl();
                        return el(TC, { label: __('Content', 'blockenberg'), value: a.typoContent || {}, onChange: function (v) { setAttributes({ typoContent: v }); } });
                    })()
                )
            );

            return el('div', blockProps,
                inspector,
                // Move controls (hover)
                parentData.colCount > 1 && el('div', { className: 'bkbg-column__move-actions' },
                    el(Button, {
                        className: 'bkbg-column__move-btn',
                        icon: 'arrow-left-alt2',
                        label: __('Move column left', 'blockenberg'),
                        onClick: function () { moveSelf('left'); },
                        disabled: parentData.colIndex <= 0
                    }),
                    el(Button, {
                        className: 'bkbg-column__move-btn',
                        icon: 'no-alt',
                        label: __('Delete column', 'blockenberg'),
                        onClick: removeSelfWithConfirm
                    }),
                    el(Button, {
                        className: 'bkbg-column__move-btn',
                        icon: 'arrow-right-alt2',
                        label: __('Move column right', 'blockenberg'),
                        onClick: function () { moveSelf('right'); },
                        disabled: parentData.colIndex >= parentData.colCount - 1
                    })
                ),
                el('div', { className: 'bkbg-column__inner' },
                    el(InnerBlocks, {
                        templateLock: false,
                        renderAppender: function () {
                            return el(SidebarInserterAppender, { rootClientId: clientId });
                        }
                    })
                ),
                el('div', { className: 'bkbg-column__width-label' },
                    Math.round(currentWidth) + '%'
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var widths = a.widths || { desktop: 50, tablet: 50, mobile: 100 };
            
            var saveStyle = Object.assign({}, {
                    '--bkbg-col-desktop': widths.desktop + '%',
                    '--bkbg-col-tablet': (widths.tablet || widths.desktop) + '%',
                    '--bkbg-col-mobile': (widths.mobile || 100) + '%'
                }, getSpacingStyles(a));
            Object.assign(saveStyle, _tv(a.typoContent, '--bkbg-col-cn'));
            var blockProps = useBlockProps.save({
                className: [
                    'bkbg-column',
                    'bkbg-column--padding-' + a.paddingInner,
                    'bkbg-column--valign-' + (a.vAlign || 'top')
                ].join(' '),
                style: saveStyle,
                'data-uid': a.uid
            });

            return el('div', blockProps,
                el('div', { className: 'bkbg-column__inner' },
                    el(InnerBlocks.Content)
                )
            );
        }
    });
}() );
