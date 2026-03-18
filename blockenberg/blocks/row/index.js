( function () {
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var useRef = wp.element.useRef;
    var useEffect = wp.element.useEffect;
    var useCallback = wp.element.useCallback;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var BlockControls = wp.blockEditor.BlockControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InnerBlocks = wp.blockEditor.InnerBlocks;
    var useSelect = wp.data.useSelect;
    var useDispatch = wp.data.useDispatch;
    var PanelBody = wp.components.PanelBody;
    var SelectControl = wp.components.SelectControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var ToolbarGroup = wp.components.ToolbarGroup;
    var ToolbarButton = wp.components.ToolbarButton;
    var ToolbarDropdownMenu = wp.components.ToolbarDropdownMenu;
    var Button = wp.components.Button;
    var ButtonGroup = wp.components.ButtonGroup;
    var Placeholder = wp.components.Placeholder;
    var Popover = wp.components.Popover;

    // Gap token scale (legacy support in saved attributes/classes)

    // Responsive mode options
    var responsiveModes = [
        { value: 'desktop', label: __('Desktop', 'blockenberg'), icon: 'desktop' },
        { value: 'tablet', label: __('Tablet', 'blockenberg'), icon: 'tablet' },
        { value: 'mobile', label: __('Mobile', 'blockenberg'), icon: 'smartphone' }
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

    // Column presets for quick setup
    var columnPresets = [
        { label: '1 Column (100)', value: '1-full', widths: [100], icon: '⬜' },
        { label: '2 Columns (50/50)', value: '2-equal', widths: [50, 50], icon: '⬜⬜' },
        { label: '3 Columns (33/33/33)', value: '3-equal', widths: [33.33, 33.33, 33.34], icon: '⬜⬜⬜' },
        { label: '4 Columns (25/25/25/25)', value: '4-equal', widths: [25, 25, 25, 25], icon: '⬜⬜⬜⬜' },
        { label: '2 Columns (66/33)', value: '2-wide-left', widths: [66.66, 33.34], icon: '⬛⬜' },
        { label: '2 Columns (33/66)', value: '2-wide-right', widths: [33.34, 66.66], icon: '⬜⬛' },
        { label: '3 Columns (25/50/25)', value: '3-wide-center', widths: [25, 50, 25], icon: '⬜⬛⬜' }
    ];

    // Row icon
    var rowIcon = el('svg', { 
        width: 24, 
        height: 24, 
        viewBox: '0 0 24 24', 
        xmlns: 'http://www.w3.org/2000/svg' 
    },
        el('path', { 
            d: 'M4 4h16v16H4V4zm2 2v12h5V6H6zm7 0v12h5V6h-5z',
            fill: 'currentColor'
        })
    );

    // Global cleanup function for resize state
    function cleanupAllResizeStates() {
        var allResizing = document.querySelectorAll('.bkbg-row--is-resizing');
        allResizing.forEach(function(el) {
            el.classList.remove('bkbg-row--is-resizing');
        });
        // Also clean in iframe if exists
        var editorCanvas = document.querySelector('iframe[name="editor-canvas"]');
        if (editorCanvas && editorCanvas.contentDocument) {
            var iframeResizing = editorCanvas.contentDocument.querySelectorAll('.bkbg-row--is-resizing');
            iframeResizing.forEach(function(el) {
                el.classList.remove('bkbg-row--is-resizing');
            });
        }
    }

    // Resize Handle Component
    function ResizeHandle(props) {
        var onResizeStart = props.onResizeStart;
        var onResize = props.onResize;
        var onResizeEnd = props.onResizeEnd;
        var leftIndex = props.leftIndex;
        var minPct = props.minPct;
        var leftWidth = props.leftWidth;
        var rightWidth = props.rightWidth;
        var rowClientId = props.rowClientId;

        var handleRef = useRef(null);
        var rowRef = useRef(null);
        var isDragging = useRef(false);
        var startXRef = useRef(0);
        var startLeftRef = useRef(0);
        var startRightRef = useRef(0);
        var rowWidthRef = useRef(0);
        var cleanupFnRef = useRef(null);
        var documentRef = useRef(null);

        // Cleanup on unmount or when component loses focus
        useEffect(function() {
            // Get the document (might be inside iframe)
            var ownerDoc = handleRef.current ? handleRef.current.ownerDocument : document;
            var ownerWin = ownerDoc.defaultView || window;
            documentRef.current = ownerDoc;
            
            // Global mouseup handler to catch any missed events
            function globalMouseUp() {
                if (isDragging.current) {
                    isDragging.current = false;
                    cleanupAllResizeStates();
                    onResizeEnd();
                }
            }
            
            // Also cleanup on window blur (user switched tabs/apps)
            function windowBlur() {
                if (isDragging.current) {
                    isDragging.current = false;
                    cleanupAllResizeStates();
                    onResizeEnd();
                }
            }
            
            // Listen on both the owner document and window
            ownerDoc.addEventListener('mouseup', globalMouseUp);
            ownerWin.addEventListener('blur', windowBlur);
            // Also on parent window if in iframe
            if (ownerWin !== window) {
                window.addEventListener('mouseup', globalMouseUp);
                window.addEventListener('blur', windowBlur);
            }
            
            return function() {
                ownerDoc.removeEventListener('mouseup', globalMouseUp);
                ownerWin.removeEventListener('blur', windowBlur);
                if (ownerWin !== window) {
                    window.removeEventListener('mouseup', globalMouseUp);
                    window.removeEventListener('blur', windowBlur);
                }
                // Cleanup on unmount
                cleanupAllResizeStates();
            };
        }, [onResizeEnd]);

        var onMouseDown = useCallback(function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            var handle = handleRef.current;
            if (!handle) return;
            
            var row = handle.closest('.bkbg-row');
            if (!row) return;
            
            // Get the correct document (handles iframe case)
            var ownerDoc = handle.ownerDocument || document;
            
            // Store row reference for cleanup
            rowRef.current = row;
            isDragging.current = true;
            rowWidthRef.current = row.offsetWidth;
            startXRef.current = e.clientX;
            startLeftRef.current = leftWidth;
            startRightRef.current = rightWidth;
            
            onResizeStart();
            
            // Add dragging class to row
            row.classList.add('bkbg-row--is-resizing');

            function onMouseMove(moveEvent) {
                if (!isDragging.current) return;
                
                var deltaPx = moveEvent.clientX - startXRef.current;
                var deltaPct = (deltaPx / rowWidthRef.current) * 100;
                
                // Apply shift for snap to 1%
                if (moveEvent.shiftKey) {
                    deltaPct = Math.round(deltaPct);
                }
                
                var newLeft = startLeftRef.current + deltaPct;
                var newRight = startRightRef.current - deltaPct;
                
                // Enforce minimum width
                if (newLeft < minPct) {
                    newLeft = minPct;
                    newRight = startLeftRef.current + startRightRef.current - minPct;
                }
                if (newRight < minPct) {
                    newRight = minPct;
                    newLeft = startLeftRef.current + startRightRef.current - minPct;
                }
                
                // Round to 1 decimal place
                newLeft = Math.round(newLeft * 10) / 10;
                newRight = Math.round(newRight * 10) / 10;
                
                onResize(leftIndex, newLeft, newRight);
            }

            function onMouseUp() {
                isDragging.current = false;
                
                // Remove dragging class using stored reference
                if (rowRef.current) {
                    rowRef.current.classList.remove('bkbg-row--is-resizing');
                    rowRef.current = null;
                }
                
                // Global cleanup for safety
                cleanupAllResizeStates();
                
                onResizeEnd();
                ownerDoc.removeEventListener('mousemove', onMouseMove);
                ownerDoc.removeEventListener('mouseup', onMouseUp);
            }
            
            // Store cleanup function
            cleanupFnRef.current = onMouseUp;

            ownerDoc.addEventListener('mousemove', onMouseMove);
            ownerDoc.addEventListener('mouseup', onMouseUp);
        }, [leftWidth, rightWidth, minPct, leftIndex, onResize, onResizeEnd, onResizeStart]);

        // Double-click to equalize pair
        var onDoubleClick = useCallback(function (e) {
            e.preventDefault();
            e.stopPropagation();
            var avg = (leftWidth + rightWidth) / 2;
            avg = Math.round(avg * 10) / 10;
            onResize(leftIndex, avg, avg);
        }, [leftWidth, rightWidth, leftIndex, onResize]);

        return el('div', {
            ref: handleRef,
            className: 'bkbg-row__resize-handle',
            onMouseDown: onMouseDown,
            onDoubleClick: onDoubleClick,
            title: __('Drag to resize. Double-click to equalize.', 'blockenberg')
        },
            el('div', { className: 'bkbg-row__resize-handle-line' }),
            el('div', { className: 'bkbg-row__resize-indicator' },
                el('span', { className: 'bkbg-row__resize-pct bkbg-row__resize-pct--left' }, 
                    Math.round(leftWidth) + '%'
                ),
                el('span', { className: 'bkbg-row__resize-pct bkbg-row__resize-pct--right' }, 
                    Math.round(rightWidth) + '%'
                )
            )
        );
    }

    registerBlockType('blockenberg/row', {
        title: __('Row', 'blockenberg'),
        icon: rowIcon,
        category: 'bkbg-layout',
        parent: ['blockenberg/section'],
        description: __('A row container for columns with drag-resize support.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var clientId = props.clientId;
            var a = attributes;

            var isResizingState = useState(false);
            var isResizing = isResizingState[0];
            var setIsResizing = isResizingState[1];
            
            var hasSelectedLayoutState = useState(false);
            var hasSelectedLayout = hasSelectedLayoutState[0];
            var setHasSelectedLayout = hasSelectedLayoutState[1];

            var isStructureOpenState = useState(false);
            var isStructureOpen = isStructureOpenState[0];
            var setIsStructureOpen = isStructureOpenState[1];

            var updateBlockAttributes = useDispatch('core/block-editor').updateBlockAttributes;
            var selectBlock = useDispatch('core/block-editor').selectBlock;
            var insertBlock = useDispatch('core/block-editor').insertBlock;
            var replaceInnerBlocks = useDispatch('core/block-editor').replaceInnerBlocks;
            var removeBlock = useDispatch('core/block-editor').removeBlock;
            var moveBlockToPosition = useDispatch('core/block-editor').moveBlockToPosition;
            var createBlock = wp.blocks.createBlock;

            function openRowSettings(e) {
                if (e && e.preventDefault) e.preventDefault();
                if (e && e.stopPropagation) e.stopPropagation();

                if (typeof selectBlock === 'function') {
                    selectBlock(clientId);
                } else {
                    try {
                        wp.data.dispatch('core/block-editor').selectBlock(clientId);
                    } catch (err) {}
                }

                // Try to open the block settings sidebar (works in Post Editor; best-effort elsewhere)
                try {
                    var editPostDispatch = wp.data.dispatch('core/edit-post');
                    if (editPostDispatch && typeof editPostDispatch.openGeneralSidebar === 'function') {
                        editPostDispatch.openGeneralSidebar('edit-post/block');
                    }
                } catch (err) {}

                try {
                    var editSiteDispatch = wp.data.dispatch('core/edit-site');
                    if (editSiteDispatch && typeof editSiteDispatch.openGeneralSidebar === 'function') {
                        editSiteDispatch.openGeneralSidebar('edit-site/block-inspector');
                    }
                } catch (err) {}

                try {
                    var interfaceDispatch = wp.data.dispatch('core/interface');
                    if (interfaceDispatch && typeof interfaceDispatch.enableComplementaryArea === 'function') {
                        interfaceDispatch.enableComplementaryArea('core/edit-post', 'edit-post/block');
                    }
                } catch (err) {}
            }

            // Get inner blocks (columns)
            var innerBlocksData = useSelect(function (select) {
                var innerBlocks = select('core/block-editor').getBlocks(clientId);
                return innerBlocks.map(function (block) {
                    return {
                        clientId: block.clientId,
                        widths: block.attributes.widths || { desktop: 50, tablet: 50, mobile: 100 },
                        uid: block.attributes.uid
                    };
                });
            }, [clientId]);

            // Get parent section info and row position
            var parentSectionData = useSelect(function (select) {
                var parents = select('core/block-editor').getBlockParents(clientId);
                for (var i = parents.length - 1; i >= 0; i--) {
                    var parent = select('core/block-editor').getBlock(parents[i]);
                    if (parent && parent.name === 'blockenberg/section') {
                        var siblingRows = parent.innerBlocks || [];
                        var rowIndex = siblingRows.findIndex(function (block) { return block.clientId === clientId; });
                        return {
                            parentClientId: parents[i],
                            rowIndex: rowIndex,
                            rowCount: siblingRows.length
                        };
                    }
                }
                return { parentClientId: null, rowIndex: -1, rowCount: 0 };
            }, [clientId]);

            var columnCount = innerBlocksData.length;
            
            // Check if we need to show layout selector
            var showLayoutSelector = columnCount === 0 && !hasSelectedLayout;

            // Select a preset layout
            function selectLayout(preset) {
                var presetData = columnPresets.find(function (p) { return p.value === preset; });
                if (!presetData) return;
                
                var columns = presetData.widths.map(function (width, index) {
                    return createBlock('blockenberg/column', {
                        widths: { desktop: width, tablet: width, mobile: 100 },
                        uid: 'col-' + Date.now() + '-' + index
                    });
                });
                
                replaceInnerBlocks(clientId, columns);
                setAttributes({ columnsCount: presetData.widths.length });
                setHasSelectedLayout(true);
            }

            // Get widths for current responsive mode
            function getColumnWidth(columnData, mode) {
                var widths = columnData.widths || {};
                // Fallback chain: requested mode -> tablet -> desktop
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

            // Get all current widths
            function getCurrentWidths() {
                return innerBlocksData.map(function (col) {
                    return getColumnWidth(col, a.responsiveMode);
                });
            }

            function setWidthLabelsVisibilityDuringResize(show) {
                var selector = '[data-block="' + clientId + '"] .bkbg-column__width-label';

                function updateInDocument(doc) {
                    if (!doc || !doc.querySelectorAll) return;
                    var labels = doc.querySelectorAll(selector);
                    labels.forEach(function (label) {
                        if (show) {
                            label.style.opacity = '1';
                        } else {
                            label.style.opacity = '';
                        }
                    });
                }

                updateInDocument(document);

                var editorCanvas = document.querySelector('iframe[name="editor-canvas"]');
                if (editorCanvas && editorCanvas.contentDocument) {
                    updateInDocument(editorCanvas.contentDocument);
                }
            }

            // Handle resize start
            function handleResizeStart() {
                setIsResizing(true);
                setWidthLabelsVisibilityDuringResize(true);
            }

            // Handle resize - update attributes immediately
            function handleResize(leftIndex, newLeftPct, newRightPct) {
                var mode = a.responsiveMode;
                var leftCol = innerBlocksData[leftIndex];
                var rightCol = innerBlocksData[leftIndex + 1];
                
                if (leftCol) {
                    var leftWidths = Object.assign({}, leftCol.widths || { desktop: 50, tablet: 50, mobile: 100 });
                    leftWidths[mode] = newLeftPct;
                    updateBlockAttributes(leftCol.clientId, { widths: leftWidths });
                }
                
                if (rightCol) {
                    var rightWidths = Object.assign({}, rightCol.widths || { desktop: 50, tablet: 50, mobile: 100 });
                    rightWidths[mode] = newRightPct;
                    updateBlockAttributes(rightCol.clientId, { widths: rightWidths });
                }
            }

            // Handle resize end
            function handleResizeEnd() {
                setIsResizing(false);
                setWidthLabelsVisibilityDuringResize(false);
                // Ensure CSS class is also cleaned up
                cleanupAllResizeStates();
            }

            // Add column - rebuild all columns with new widths
            function addColumn() {
                var newCount = columnCount + 1;
                if (newCount > 6) return;
                
                // Calculate equal widths
                var equalWidth = Math.round((100 / newCount) * 10) / 10;
                var lastWidth = 100 - (equalWidth * (newCount - 1));
                lastWidth = Math.round(lastWidth * 10) / 10;
                
                // Get existing column inner blocks content
                var existingBlocks = wp.data.select('core/block-editor').getBlocks(clientId);
                
                // Create new columns array
                var newColumns = [];
                
                // Recreate existing columns with new widths
                for (var i = 0; i < existingBlocks.length; i++) {
                    var existingCol = existingBlocks[i];
                    var width = (i === newCount - 1) ? lastWidth : equalWidth;
                    
                    var newCol = createBlock('blockenberg/column', {
                        widths: { desktop: width, tablet: width, mobile: 100 },
                        uid: existingCol.attributes.uid || ('col-' + Date.now() + '-' + i),
                        paddingInner: existingCol.attributes.paddingInner || 'none'
                    }, existingCol.innerBlocks);

                    newCol.attributes = Object.assign({}, existingCol.attributes || {}, newCol.attributes || {});
                    
                    newColumns.push(newCol);
                }
                
                // Add new empty column
                var newColWidth = (newCount - 1 === columnCount) ? lastWidth : equalWidth;
                var newColumn = createBlock('blockenberg/column', {
                    widths: { desktop: newColWidth, tablet: newColWidth, mobile: 100 },
                    uid: 'col-' + Date.now()
                });
                newColumns.push(newColumn);
                
                // Replace all inner blocks
                replaceInnerBlocks(clientId, newColumns, false);
                setAttributes({ columnsCount: newCount });
            }

            // Equalize all columns
            function equalizeColumns() {
                if (columnCount === 0) return;
                
                var mode = a.responsiveMode;
                var equalWidth = Math.round((100 / columnCount) * 100) / 100;
                
                // Adjust last column to ensure sum is exactly 100
                var widthsArray = [];
                for (var i = 0; i < columnCount - 1; i++) {
                    widthsArray.push(equalWidth);
                }
                widthsArray.push(100 - (equalWidth * (columnCount - 1)));
                
                innerBlocksData.forEach(function (col, index) {
                    var newWidths = Object.assign({}, col.widths);
                    newWidths[mode] = widthsArray[index];
                    updateBlockAttributes(col.clientId, { widths: newWidths });
                });
            }

            // Insert column at specific position (before/after index)
            function insertColumnAt(index, position) {
                if (columnCount >= 6) return;
                
                var newCount = columnCount + 1;
                var equalWidth = Math.round((100 / newCount) * 10) / 10;
                
                // Get existing column inner blocks content
                var existingBlocks = wp.data.select('core/block-editor').getBlocks(clientId);
                
                // Determine insert position
                var insertIndex = position === 'before' ? index : index + 1;
                
                // Create new columns array with recalculated widths
                var newColumns = [];
                var colIndex = 0;
                
                for (var i = 0; i < newCount; i++) {
                    var width = equalWidth;
                    if (i === newCount - 1) {
                        width = 100 - (equalWidth * (newCount - 1));
                        width = Math.round(width * 10) / 10;
                    }
                    
                    if (i === insertIndex) {
                        // Insert new column here
                        var newCol = createBlock('blockenberg/column', {
                            widths: { desktop: width, tablet: width, mobile: 100 },
                            uid: 'col-' + Date.now()
                        });
                        newColumns.push(newCol);
                    } else {
                        // Use existing column
                        var existingCol = existingBlocks[colIndex];
                        if (existingCol) {
                            var recreatedCol = createBlock('blockenberg/column', {
                                widths: { desktop: width, tablet: width, mobile: 100 },
                                uid: existingCol.attributes.uid || ('col-' + Date.now() + '-' + colIndex),
                                paddingInner: existingCol.attributes.paddingInner || 'none'
                            }, existingCol.innerBlocks);

                            recreatedCol.attributes = Object.assign({}, existingCol.attributes || {}, recreatedCol.attributes || {});
                            newColumns.push(recreatedCol);
                            colIndex++;
                        }
                    }
                }
                
                replaceInnerBlocks(clientId, newColumns, false);
                setAttributes({ columnsCount: newCount });
            }

            // Move column left or right
            function moveColumn(index, direction) {
                var newIndex = direction === 'left' ? index - 1 : index + 1;
                
                // Check bounds
                if (newIndex < 0 || newIndex >= columnCount) return;
                
                // Get the column block to move
                var blocks = wp.data.select('core/block-editor').getBlocks(clientId);
                var blockToMove = blocks[index];
                
                if (blockToMove) {
                    moveBlockToPosition(blockToMove.clientId, clientId, clientId, newIndex);
                }
            }

            // Remove column at index
            function removeColumnAt(index) {
                if (columnCount <= 1) return;
                
                var blocks = wp.data.select('core/block-editor').getBlocks(clientId);
                var blockToRemove = blocks[index];
                
                if (blockToRemove) {
                    var newCount = columnCount - 1;
                    var equalWidth = Math.round((100 / newCount) * 10) / 10;
                    
                    // Rebuild columns without the removed one
                    var newColumns = [];
                    var newIndex = 0;
                    
                    for (var i = 0; i < blocks.length; i++) {
                        if (i === index) continue;
                        
                        var existingCol = blocks[i];
                        var width = equalWidth;
                        if (newIndex === newCount - 1) {
                            width = 100 - (equalWidth * (newCount - 1));
                            width = Math.round(width * 10) / 10;
                        }
                        
                        var recreatedCol = createBlock('blockenberg/column', {
                            widths: { desktop: width, tablet: width, mobile: 100 },
                            uid: existingCol.attributes.uid || ('col-' + Date.now() + '-' + newIndex),
                            paddingInner: existingCol.attributes.paddingInner || 'none'
                        }, existingCol.innerBlocks);

                        recreatedCol.attributes = Object.assign({}, existingCol.attributes || {}, recreatedCol.attributes || {});
                        newColumns.push(recreatedCol);
                        newIndex++;
                    }
                    
                    replaceInnerBlocks(clientId, newColumns, false);
                    setAttributes({ columnsCount: newCount });
                }
            }

            // ========================================
            // Row Management Functions
            // ========================================

            // Insert new row above or below current row
            function insertRowAt(position) {
                if (!parentSectionData.parentClientId) return;
                
                var insertIndex = position === 'before' 
                    ? parentSectionData.rowIndex 
                    : parentSectionData.rowIndex + 1;
                
                var newRow = createBlock('blockenberg/row', { columnsCount: 1 }, [
                    createBlock('blockenberg/column', {
                        widths: { desktop: 100, tablet: 100, mobile: 100 },
                        uid: 'col-' + Date.now() + '-0'
                    })
                ]);
                
                insertBlock(newRow, insertIndex, parentSectionData.parentClientId);
            }

            // Move row up or down within section
            function moveRow(direction) {
                if (!parentSectionData.parentClientId) return;
                
                var newIndex = direction === 'up' 
                    ? parentSectionData.rowIndex - 1 
                    : parentSectionData.rowIndex + 1;
                
                // Check bounds
                if (newIndex < 0 || newIndex >= parentSectionData.rowCount) return;
                
                moveBlockToPosition(
                    clientId, 
                    parentSectionData.parentClientId, 
                    parentSectionData.parentClientId, 
                    newIndex
                );
            }

            // Apply preset
            function applyPreset(preset) {
                var presetData = columnPresets.find(function (p) { return p.value === preset; });
                if (!presetData) return;
                
                var targetCount = presetData.widths.length;
                var mode = a.responsiveMode;
                
                // Add or remove columns to match preset
                if (columnCount < targetCount) {
                    // Add columns
                    for (var i = columnCount; i < targetCount; i++) {
                        var newColumn = createBlock('blockenberg/column', {
                            widths: { 
                                desktop: presetData.widths[i], 
                                tablet: presetData.widths[i], 
                                mobile: 100 
                            },
                            uid: 'col-' + Date.now() + '-' + i
                        });
                        insertBlock(newColumn, i, clientId);
                    }
                }

                if (columnCount > targetCount) {
                    // Remove extra columns from the end
                    var blocksToTrim = wp.data.select('core/block-editor').getBlocks(clientId);
                    for (var r = blocksToTrim.length - 1; r >= targetCount; r--) {
                        if (blocksToTrim[r] && blocksToTrim[r].clientId) {
                            removeBlock(blocksToTrim[r].clientId);
                        }
                    }
                }
                
                // Update existing column widths
                setTimeout(function () {
                    var blocks = wp.data.select('core/block-editor').getBlocks(clientId);
                    blocks.slice(0, targetCount).forEach(function (block, index) {
                        var newWidths = Object.assign({}, block.attributes.widths || {});
                        newWidths[mode] = presetData.widths[index];
                        updateBlockAttributes(block.clientId, { widths: newWidths });
                    });
                }, 100);
                
                setAttributes({ columnsCount: targetCount });
            }

            var blockProps = useBlockProps({
                className: [
                    'bkbg-row',
                    'bkbg-row--gap-' + a.gap,
                    'bkbg-row--mode-' + a.responsiveMode,
                    a.stackOnMobile ? 'bkbg-row--stack-mobile' : '',
                    isResizing ? 'bkbg-row--is-resizing' : ''
                ].filter(Boolean).join(' '),
                style: getSpacingStyles(a),
                'data-responsive-mode': a.responsiveMode
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

            // Get responsive mode icon
            function getModeIcon(mode) {
                switch (mode) {
                    case 'tablet': return 'tablet';
                    case 'mobile': return 'smartphone';
                    default: return 'desktop';
                }
            }

            // Toolbar controls
            var toolbar = el(BlockControls, {},
                // Responsive mode switcher
                el(ToolbarGroup, {},
                    el(ToolbarDropdownMenu, {
                        icon: getModeIcon(a.responsiveMode),
                        label: __('Responsive Mode', 'blockenberg'),
                        controls: responsiveModes.map(function (mode) {
                            return {
                                title: mode.label,
                                icon: mode.icon,
                                isActive: a.responsiveMode === mode.value,
                                onClick: function () { setAttributes({ responsiveMode: mode.value }); }
                            };
                        })
                    })
                ),
                // Column actions
                el(ToolbarGroup, {},
                    el(ToolbarButton, {
                        icon: 'plus',
                        label: __('Add Column', 'blockenberg'),
                        onClick: addColumn,
                        disabled: columnCount >= 6
                    }),
                    el(ToolbarButton, {
                        icon: 'editor-contract',
                        label: __('Equalize Columns', 'blockenberg'),
                        onClick: equalizeColumns,
                        disabled: columnCount < 2
                    })
                ),
                null
            );

            // Inspector controls
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Row Settings', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Stack on Mobile', 'blockenberg'),
                        help: __('Columns will stack vertically on mobile devices.', 'blockenberg'),
                        checked: a.stackOnMobile,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ stackOnMobile: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Minimum Column Width (%)', 'blockenberg'),
                        value: a.minColumnPct,
                        onChange: function (v) { setAttributes({ minColumnPct: v }); },
                        min: 5,
                        max: 25,
                        step: 1
                    }),
                ),
                el(PanelBody, { title: __('Column Presets', 'blockenberg'), initialOpen: false },
                    el('div', { className: 'bkbg-row-presets' },
                        columnPresets.map(function (preset) {
                            return el(Button, {
                                key: preset.value,
                                variant: 'secondary',
                                className: 'bkbg-row-preset-btn',
                                onClick: function () { applyPreset(preset.value); }
                            }, preset.label);
                        })
                    )
                )
            );

            // Build inner blocks with resize handles
            var currentWidths = getCurrentWidths();
            
            // No appender in Row - columns are added via toolbar button
            
            // Generate column template based on count
            function getColumnTemplate() {
                var count = Math.max(1, a.columnsCount || 1);
                var template = [];
                var defaultWidth = Math.round((100 / count) * 100) / 100;
                for (var i = 0; i < count; i++) {
                    var w = i === count - 1 ? (100 - defaultWidth * (count - 1)) : defaultWidth;
                    template.push(['blockenberg/column', { 
                        widths: { desktop: w, tablet: w, mobile: 100 },
                        uid: 'col-' + i
                    }]);
                }
                return template;
            }
            
            // Layout selector for initial setup
            if (showLayoutSelector) {
                return el('div', blockProps,
                    el(Placeholder, {
                        icon: rowIcon,
                        label: __('Row', 'blockenberg'),
                        instructions: __('Select a column layout to start.', 'blockenberg'),
                        className: 'bkbg-row-layout-selector'
                    },
                        el('div', { className: 'bkbg-row-layout-options' },
                            columnPresets.map(function (preset) {
                                return el(Button, {
                                    key: preset.value,
                                    variant: 'secondary',
                                    className: 'bkbg-row-layout-option',
                                    onClick: function () { selectLayout(preset.value); }
                                },
                                    el('span', { className: 'bkbg-row-layout-icon' }, preset.icon),
                                    el('span', { className: 'bkbg-row-layout-label' }, preset.label)
                                );
                            })
                        ),
                        el(Button, {
                            variant: 'link',
                            className: 'bkbg-row-skip-layout',
                            onClick: function () { setHasSelectedLayout(true); }
                        }, __('Skip and add columns manually', 'blockenberg'))
                    )
                );
            }

            return el('div', blockProps,
                toolbar,
                inspector,
                el('div', { 
                    className: 'bkbg-row__inner'
                },
                    el(InnerBlocks, {
                        allowedBlocks: ['blockenberg/column'],
                        template: getColumnTemplate(),
                        templateLock: false,
                        orientation: 'horizontal',
                        renderAppender: false
                    })
                ),
                // Render resize handles overlay (hide in mobile mode)
                columnCount > 1 && a.responsiveMode !== 'mobile' && el('div', { className: 'bkbg-row__handles-overlay' },
                    currentWidths.slice(0, -1).map(function (leftWidth, index) {
                        var rightWidth = currentWidths[index + 1];
                        var leftOffset = currentWidths.slice(0, index + 1).reduce(function (sum, w) { return sum + w; }, 0);
                        return el('div', {
                            key: 'handle-' + index,
                            className: 'bkbg-row__handle-wrapper',
                            style: { left: leftOffset + '%' }
                        },
                            el(ResizeHandle, {
                                leftIndex: index,
                                leftWidth: leftWidth,
                                rightWidth: rightWidth,
                                minPct: a.minColumnPct,
                                onResizeStart: handleResizeStart,
                                onResize: handleResize,
                                onResizeEnd: handleResizeEnd,
                                rowClientId: clientId
                            })
                        );
                    })
                ),
                // Floating structure popup trigger
                el('div', { className: 'bkbg-row__structure-trigger' },
                    el(Button, {
                        className: 'bkbg-row__structure-btn',
                        icon: 'layout',
                        label: __('Row structure', 'blockenberg'),
                        onClick: function() { setIsStructureOpen(!isStructureOpen); }
                    }),
                    isStructureOpen && el(Popover, {
                        className: 'bkbg-row__structure-popover',
                        position: 'bottom center',
                        onClose: function() { setIsStructureOpen(false); },
                        focusOnMount: 'container'
                    },
                        el('div', { className: 'bkbg-row__structure-content' },
                            // Header
                            el('div', { className: 'bkbg-row__structure-header' },
                                el('span', { className: 'bkbg-row__structure-title' }, __('Row Structure', 'blockenberg')),
                                el(Button, {
                                    className: 'bkbg-row__structure-close',
                                    icon: 'no-alt',
                                    label: __('Close', 'blockenberg'),
                                    onClick: function() { setIsStructureOpen(false); }
                                })
                            ),
                            // Visual column bars
                            el('div', { className: 'bkbg-row__structure-columns' },
                                currentWidths.map(function(width, index) {
                                    return el('div', {
                                        key: 'col-' + index,
                                        className: 'bkbg-row__structure-col',
                                        style: { width: width + '%' }
                                    },
                                        el('span', { className: 'bkbg-row__structure-col-label' }, Math.round(width) + '%')
                                    );
                                })
                            ),
                            // Column actions
                            el('div', { className: 'bkbg-row__structure-actions' },
                                el(Button, {
                                    className: 'bkbg-row__structure-action',
                                    icon: 'plus',
                                    onClick: addColumn,
                                    disabled: columnCount >= 6
                                }, __('Add Column', 'blockenberg')),
                                el(Button, {
                                    className: 'bkbg-row__structure-action',
                                    icon: 'editor-contract',
                                    onClick: equalizeColumns,
                                    disabled: columnCount < 2
                                }, __('Equalize', 'blockenberg'))
                            ),
                            // Row actions
                            el('div', { className: 'bkbg-row__structure-row-actions' },
                                el(Button, {
                                    className: 'bkbg-row__structure-action bkbg-row__structure-action--secondary',
                                    icon: 'insert-before',
                                    onClick: function() { insertRowAt('before'); setIsStructureOpen(false); }
                                }, __('Row Above', 'blockenberg')),
                                el(Button, {
                                    className: 'bkbg-row__structure-action bkbg-row__structure-action--secondary',
                                    icon: 'insert-after',
                                    onClick: function() { insertRowAt('after'); setIsStructureOpen(false); }
                                }, __('Row Below', 'blockenberg'))
                            )
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save({
                className: [
                    'bkbg-row',
                    'bkbg-row--gap-' + a.gap,
                    a.stackOnMobile ? 'bkbg-row--stack-mobile' : ''
                ].filter(Boolean).join(' '),
                style: getSpacingStyles(a),
                'data-stack-mobile': a.stackOnMobile ? '1' : '0'
            });

            return el('div', blockProps,
                el('div', { className: 'bkbg-row__inner' },
                    el(InnerBlocks.Content)
                )
            );
        }
    });
}() );
