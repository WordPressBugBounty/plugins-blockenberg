( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;

    var _dtTC, _dtTV;
    function _tc() { return _dtTC || (_dtTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _dtTV || (_dtTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    registerBlockType('blockenberg/data-table', {
        title: __('Data Table', 'blockenberg'),
        icon: 'editor-table',
        category: 'bkbg-charts',
        description: __('Interactive data table with sorting, search, pagination and export.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            // Update cell
            function updateCell(rowIndex, colIndex, value) {
                var newRows = a.rows.map(function (row, ri) {
                    if (ri === rowIndex) {
                        return row.map(function (cell, ci) {
                            return ci === colIndex ? value : cell;
                        });
                    }
                    return row;
                });
                setAttributes({ rows: newRows });
            }

            // Update header
            function updateHeader(colIndex, value) {
                var newHeaders = a.headers.map(function (h, i) {
                    return i === colIndex ? value : h;
                });
                setAttributes({ headers: newHeaders });
            }

            // Add row at end
            function addRow() {
                var newRow = new Array(a.columns).fill('');
                setAttributes({ rows: a.rows.concat([newRow]) });
            }

            // Insert row at specific position
            function insertRow(index, position) {
                var newRow = new Array(a.columns).fill('');
                var newRows = a.rows.slice();
                var insertAt = position === 'before' ? index : index + 1;
                newRows.splice(insertAt, 0, newRow);
                setAttributes({ rows: newRows });
            }

            // Remove row
            function removeRow(index) {
                if (a.rows.length <= 1) return;
                setAttributes({ rows: a.rows.filter(function (_, i) { return i !== index; }) });
            }

            // Add column at end
            function addColumn() {
                var newHeaders = a.headers.concat([__('Column', 'blockenberg') + ' ' + (a.columns + 1)]);
                var newRows = a.rows.map(function (row) {
                    return row.concat(['']);
                });
                setAttributes({
                    columns: a.columns + 1,
                    headers: newHeaders,
                    rows: newRows
                });
            }

            // Insert column at specific position
            function insertColumn(index, position) {
                var insertAt = position === 'before' ? index : index + 1;
                var newHeaders = a.headers.slice();
                newHeaders.splice(insertAt, 0, __('Column', 'blockenberg'));
                var newRows = a.rows.map(function (row) {
                    var newRow = row.slice();
                    newRow.splice(insertAt, 0, '');
                    return newRow;
                });
                setAttributes({
                    columns: a.columns + 1,
                    headers: newHeaders,
                    rows: newRows
                });
            }

            // Remove column
            function removeColumn(index) {
                if (a.columns <= 1) return;
                var newHeaders = a.headers.filter(function (_, i) { return i !== index; });
                var newRows = a.rows.map(function (row) {
                    return row.filter(function (_, i) { return i !== index; });
                });
                setAttributes({
                    columns: a.columns - 1,
                    headers: newHeaders,
                    rows: newRows
                });
            }

            // Move row
            function moveRow(index, direction) {
                var newIndex = index + direction;
                if (newIndex < 0 || newIndex >= a.rows.length) return;
                var newRows = a.rows.slice();
                var temp = newRows[index];
                newRows[index] = newRows[newIndex];
                newRows[newIndex] = temp;
                setAttributes({ rows: newRows });
            }

            // Move column
            function moveColumn(index, direction) {
                var newIndex = index + direction;
                if (newIndex < 0 || newIndex >= a.columns) return;
                var newHeaders = a.headers.slice();
                var tempH = newHeaders[index];
                newHeaders[index] = newHeaders[newIndex];
                newHeaders[newIndex] = tempH;
                var newRows = a.rows.map(function (row) {
                    var newRow = row.slice();
                    var temp = newRow[index];
                    newRow[index] = newRow[newIndex];
                    newRow[newIndex] = temp;
                    return newRow;
                });
                setAttributes({ headers: newHeaders, rows: newRows });
            }

            // Import CSV
            function importCsv(csvText) {
                if (!csvText.trim()) return;
                // Normalize line endings
                var normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                var lines = normalizedText.trim().split('\n');
                if (lines.length < 1) return;
                
                var parseRow = function(line) {
                    var result = [];
                    var current = '';
                    var inQuotes = false;
                    for (var i = 0; i < line.length; i++) {
                        var char = line[i];
                        if (char === '"') {
                            if (inQuotes && line[i + 1] === '"') {
                                // Escaped quote inside quoted field
                                current += '"';
                                i++;
                            } else {
                                inQuotes = !inQuotes;
                            }
                        } else if (char === ',' && !inQuotes) {
                            result.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    result.push(current.trim());
                    return result;
                };

                var headers = parseRow(lines[0]);
                var rows = [];
                for (var i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        rows.push(parseRow(lines[i]));
                    }
                }
                if (rows.length === 0) {
                    rows = [new Array(headers.length).fill('')];
                }
                setAttributes({
                    columns: headers.length,
                    headers: headers,
                    rows: rows
                });
            }

            // Style options
            var styleOptions = [
                { label: __('Default', 'blockenberg'), value: 'default' },
                { label: __('Bordered', 'blockenberg'), value: 'bordered' },
                { label: __('Minimal', 'blockenberg'), value: 'minimal' }
            ];

            var responsiveOptions = [
                { label: __('Horizontal Scroll', 'blockenberg'), value: 'scroll' },
                { label: __('Stack on Mobile', 'blockenberg'), value: 'stack' }
            ];

            var alignOptions = [
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right', 'blockenberg'), value: 'right' }
            ];

            var captionPosOptions = [
                { label: __('Top', 'blockenberg'), value: 'top' },
                { label: __('Bottom', 'blockenberg'), value: 'bottom' }
            ];

            var fontWeightOptions = [
                { label: '400', value: 400 },
                { label: '500', value: 500 },
                { label: '600', value: 600 },
                { label: '700', value: 700 }
            ];

            // State for CSV import
            var csvInput = wp.element.useState('');
            var csvText = csvInput[0];
            var setCsvText = csvInput[1];

            // Inspector
            var inspector = el(InspectorControls, {},
                // Features
                el(PanelBody, { title: __('Features', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Enable Search', 'blockenberg'),
                        checked: a.searchEnabled,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ searchEnabled: v }); }
                    }),
                    a.searchEnabled && el(TextControl, {
                        label: __('Search Placeholder', 'blockenberg'),
                        value: a.searchPlaceholder,
                        onChange: function (v) { setAttributes({ searchPlaceholder: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Enable Sorting', 'blockenberg'),
                        checked: a.sortingEnabled,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ sortingEnabled: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Enable Pagination', 'blockenberg'),
                        checked: a.paginationEnabled,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ paginationEnabled: v }); }
                    }),
                    a.paginationEnabled && el(RangeControl, {
                        label: __('Items Per Page', 'blockenberg'),
                        value: a.itemsPerPage,
                        min: 5,
                        max: 100,
                        step: 5,
                        onChange: function (v) { setAttributes({ itemsPerPage: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Enable Export', 'blockenberg'),
                        checked: a.exportEnabled,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ exportEnabled: v }); }
                    }),
                    a.exportEnabled && el(TextControl, {
                        label: __('Export Button Text', 'blockenberg'),
                        value: a.exportCsvText,
                        onChange: function (v) { setAttributes({ exportCsvText: v }); }
                    })
                ),

                // Layout
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Sticky Header', 'blockenberg'),
                        checked: a.stickyHeader,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ stickyHeader: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Sticky First Column', 'blockenberg'),
                        checked: a.stickyFirstColumn,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ stickyFirstColumn: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Zebra Striping', 'blockenberg'),
                        checked: a.zebraStriping,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ zebraStriping: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Row Hover Highlight', 'blockenberg'),
                        checked: a.rowHoverHighlight,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ rowHoverHighlight: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Responsive Mode', 'blockenberg'),
                        value: a.responsiveMode,
                        options: responsiveOptions,
                        onChange: function (v) { setAttributes({ responsiveMode: v }); }
                    }),
                    el(TextControl, {
                        label: __('Caption', 'blockenberg'),
                        value: a.caption,
                        onChange: function (v) { setAttributes({ caption: v }); }
                    }),
                    a.caption && el(SelectControl, {
                        label: __('Caption Position', 'blockenberg'),
                        value: a.captionPosition,
                        options: captionPosOptions,
                        onChange: function (v) { setAttributes({ captionPosition: v }); }
                    })
                ),

                // Style
                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Table Style', 'blockenberg'),
                        value: a.tableStyle,
                        options: styleOptions,
                        onChange: function (v) { setAttributes({ tableStyle: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Cell Padding', 'blockenberg'),
                        value: a.cellPadding,
                        min: 6,
                        max: 24,
                        onChange: function (v) { setAttributes({ cellPadding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Width', 'blockenberg'),
                        value: a.borderWidth,
                        min: 0,
                        max: 3,
                        onChange: function (v) { setAttributes({ borderWidth: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.borderRadius,
                        min: 0,
                        max: 16,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    })
                ),

                // Typography
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Header', 'blockenberg'), value: a.typoHeader, onChange: function (v) { setAttributes({ typoHeader: v }); } }),
                    _tc() && el(_tc(), { label: __('Cell', 'blockenberg'),   value: a.typoCell,   onChange: function (v) { setAttributes({ typoCell: v }); } })
                ),

                // Colors
                el(PanelColorSettings, {
                    title: __('Header Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.headerBg, onChange: function (c) { setAttributes({ headerBg: c }); }, label: __('Background', 'blockenberg') },
                        { value: a.headerColor, onChange: function (c) { setAttributes({ headerColor: c }); }, label: __('Text', 'blockenberg') },
                        { value: a.headerBorderColor, onChange: function (c) { setAttributes({ headerBorderColor: c }); }, label: __('Border', 'blockenberg') }
                    ]
                }),

                el(PanelColorSettings, {
                    title: __('Cell Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.cellBg, onChange: function (c) { setAttributes({ cellBg: c }); }, label: __('Background', 'blockenberg') },
                        { value: a.cellBgAlt, onChange: function (c) { setAttributes({ cellBgAlt: c }); }, label: __('Alt Background', 'blockenberg') },
                        { value: a.cellColor, onChange: function (c) { setAttributes({ cellColor: c }); }, label: __('Text', 'blockenberg') },
                        { value: a.cellBorderColor, onChange: function (c) { setAttributes({ cellBorderColor: c }); }, label: __('Border', 'blockenberg') },
                        { value: a.hoverBg, onChange: function (c) { setAttributes({ hoverBg: c }); }, label: __('Hover Background', 'blockenberg') },
                        { value: a.accentColor, onChange: function (c) { setAttributes({ accentColor: c }); }, label: __('Accent', 'blockenberg') }
                    ]
                }),

                // Import
                el(PanelBody, { title: __('Import Data', 'blockenberg'), initialOpen: false },
                    el(TextareaControl, {
                        label: __('Paste CSV Data', 'blockenberg'),
                        help: __('First row will be used as headers.', 'blockenberg'),
                        value: csvText,
                        onChange: function (v) { setCsvText(v); },
                        rows: 6
                    }),
                    el('div', { className: 'bkbg-dt-import-actions' },
                        el(Button, {
                            variant: 'secondary',
                            onClick: function () { importCsv(csvText); },
                            disabled: !csvText.trim()
                        }, __('Import CSV', 'blockenberg')),
                        el(Button, {
                            variant: 'tertiary',
                            onClick: function () { setCsvText(''); }
                        }, __('Clear', 'blockenberg'))
                    )
                )
            );

            // CSS variables
            var wrapStyle = Object.assign({
                '--bkbg-dt-header-bg': a.headerBg,
                '--bkbg-dt-header-color': a.headerColor,
                '--bkbg-dt-header-border': a.headerBorderColor,
                '--bkbg-dt-cell-bg': a.cellBg,
                '--bkbg-dt-cell-bg-alt': a.cellBgAlt,
                '--bkbg-dt-cell-color': a.cellColor,
                '--bkbg-dt-cell-border': a.cellBorderColor,
                '--bkbg-dt-hover-bg': a.hoverBg,
                '--bkbg-dt-accent': a.accentColor,
                /* legacy fallback vars */
                '--bkbg-dt-header-font-size': a.headerFontSize + 'px',
                '--bkbg-dt-header-font-weight': a.headerFontWeight,
                '--bkbg-dt-cell-font-size': a.cellFontSize + 'px',
                '--bkbg-dt-cell-font-weight': a.cellFontWeight,
                '--bkbg-dt-cell-padding': a.cellPadding + 'px',
                '--bkbg-dt-brd-w': a.borderWidth + 'px',
                '--bkbg-dt-radius': a.borderRadius + 'px'
            }, _tv(a.typoHeader || {}, '--bkbg-dt-hdr-'), _tv(a.typoCell || {}, '--bkbg-dt-cel-'));

            // Build editor table
            var headerCells = a.headers.map(function (header, colIndex) {
                return el('th', { className: 'bkbg-dt-th bkbg-dt-editor-th', key: 'th-' + colIndex },
                    el('input', {
                        className: 'bkbg-dt-editor-input',
                        type: 'text',
                        value: header,
                        onChange: function (e) { updateHeader(colIndex, e.target.value); },
                        placeholder: __('Header', 'blockenberg')
                    }),
                    el('div', { className: 'bkbg-dt-col-actions' },
                        el(Button, {
                            icon: 'table-col-before',
                            label: __('Insert column before', 'blockenberg'),
                            onClick: function () { insertColumn(colIndex, 'before'); },
                            isSmall: true
                        }),
                        el(Button, {
                            icon: 'arrow-left-alt2',
                            label: __('Move left', 'blockenberg'),
                            onClick: function () { moveColumn(colIndex, -1); },
                            disabled: colIndex === 0,
                            isSmall: true
                        }),
                        el(Button, {
                            icon: 'arrow-right-alt2',
                            label: __('Move right', 'blockenberg'),
                            onClick: function () { moveColumn(colIndex, 1); },
                            disabled: colIndex === a.columns - 1,
                            isSmall: true
                        }),
                        el(Button, {
                            icon: 'table-col-after',
                            label: __('Insert column after', 'blockenberg'),
                            onClick: function () { insertColumn(colIndex, 'after'); },
                            isSmall: true
                        }),
                        el(Button, {
                            icon: 'trash',
                            label: __('Remove column', 'blockenberg'),
                            onClick: function () { removeColumn(colIndex); },
                            isDestructive: true,
                            isSmall: true,
                            disabled: a.columns <= 1
                        })
                    )
                );
            });

            var bodyRows = a.rows.map(function (row, rowIndex) {
                var cells = row.map(function (cell, colIndex) {
                    return el('td', { className: 'bkbg-dt-td bkbg-dt-editor-td', key: 'td-' + colIndex },
                        el('input', {
                            className: 'bkbg-dt-editor-input',
                            type: 'text',
                            value: cell,
                            onChange: function (e) { updateCell(rowIndex, colIndex, e.target.value); },
                            placeholder: ''
                        })
                    );
                });

                return el('tr', { className: 'bkbg-dt-editor-tr', key: 'tr-' + rowIndex },
                    cells,
                    el('td', { className: 'bkbg-dt-row-actions' },
                        el(Button, {
                            icon: 'table-row-before',
                            label: __('Insert row before', 'blockenberg'),
                            onClick: function () { insertRow(rowIndex, 'before'); },
                            isSmall: true
                        }),
                        el(Button, {
                            icon: 'arrow-up-alt2',
                            label: __('Move up', 'blockenberg'),
                            onClick: function () { moveRow(rowIndex, -1); },
                            disabled: rowIndex === 0,
                            isSmall: true
                        }),
                        el(Button, {
                            icon: 'arrow-down-alt2',
                            label: __('Move down', 'blockenberg'),
                            onClick: function () { moveRow(rowIndex, 1); },
                            disabled: rowIndex === a.rows.length - 1,
                            isSmall: true
                        }),
                        el(Button, {
                            icon: 'table-row-after',
                            label: __('Insert row after', 'blockenberg'),
                            onClick: function () { insertRow(rowIndex, 'after'); },
                            isSmall: true
                        }),
                        el(Button, {
                            icon: 'trash',
                            label: __('Remove row', 'blockenberg'),
                            onClick: function () { removeRow(rowIndex); },
                            isDestructive: true,
                            isSmall: true,
                            disabled: a.rows.length <= 1
                        })
                    )
                );
            });

            var blockProps = useBlockProps({
                className: 'bkbg-editor-wrap',
                'data-block-label': 'Data Table'
            });

            return el('div', blockProps,
                inspector,
                el('div', {
                    className: 'bkbg-dt-wrap',
                    style: wrapStyle,
                    'data-style': a.tableStyle,
                    'data-zebra': a.zebraStriping ? '1' : '0',
                    'data-hover': a.rowHoverHighlight ? '1' : '0'
                },
                    el('div', { className: 'bkbg-dt-container' },
                        el('table', { className: 'bkbg-dt-editor-table' },
                            el('thead', {},
                                el('tr', {}, headerCells)
                            ),
                            el('tbody', {}, bodyRows)
                        )
                    )
                ),
                el('div', { className: 'bkbg-editor-actions' },
                    el(Button, { variant: 'secondary', icon: 'plus-alt2', onClick: addRow }, __('Add Row', 'blockenberg')),
                    el(Button, { variant: 'secondary', icon: 'plus-alt2', onClick: addColumn }, __('Add Column', 'blockenberg'))
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            var wrapStyle = Object.assign({
                '--bkbg-dt-header-bg': a.headerBg,
                '--bkbg-dt-header-color': a.headerColor,
                '--bkbg-dt-header-border': a.headerBorderColor,
                '--bkbg-dt-cell-bg': a.cellBg,
                '--bkbg-dt-cell-bg-alt': a.cellBgAlt,
                '--bkbg-dt-cell-color': a.cellColor,
                '--bkbg-dt-cell-border': a.cellBorderColor,
                '--bkbg-dt-hover-bg': a.hoverBg,
                '--bkbg-dt-accent': a.accentColor,
                /* legacy fallback vars */
                '--bkbg-dt-header-font-size': a.headerFontSize + 'px',
                '--bkbg-dt-header-font-weight': a.headerFontWeight,
                '--bkbg-dt-cell-font-size': a.cellFontSize + 'px',
                '--bkbg-dt-cell-font-weight': a.cellFontWeight,
                '--bkbg-dt-cell-padding': a.cellPadding + 'px',
                '--bkbg-dt-brd-w': a.borderWidth + 'px',
                '--bkbg-dt-radius': a.borderRadius + 'px'
            }, _tv(a.typoHeader || {}, '--bkbg-dt-hdr-'), _tv(a.typoCell || {}, '--bkbg-dt-cel-'));

            // Search icon SVG
            var searchIcon = el('svg', {
                className: 'bkbg-dt-search-icon',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: '2'
            },
                el('circle', { cx: '11', cy: '11', r: '8' }),
                el('path', { d: 'M21 21l-4.35-4.35' })
            );

            // Export icon
            var exportIcon = el('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' },
                el('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
                el('polyline', { points: '7 10 12 15 17 10' }),
                el('line', { x1: '12', y1: '15', x2: '12', y2: '3' })
            );

            // Sort icon
            var sortIcon = el('span', { className: 'bkbg-dt-sort-icon' },
                el('svg', { viewBox: '0 0 24 24', fill: 'currentColor' },
                    el('path', { d: 'M7 10l5 5 5-5z' })
                )
            );

            // Controls bar
            var controls = (a.searchEnabled || a.exportEnabled) && el('div', { className: 'bkbg-dt-controls' },
                a.searchEnabled && el('div', { className: 'bkbg-dt-search' },
                    searchIcon,
                    el('input', {
                        type: 'text',
                        className: 'bkbg-dt-search-input',
                        placeholder: a.searchPlaceholder,
                        'data-search': '1'
                    })
                ),
                a.exportEnabled && el('div', { className: 'bkbg-dt-export-btns' },
                    el('button', { className: 'bkbg-dt-btn', 'data-export': 'csv' },
                        exportIcon,
                        a.exportCsvText
                    )
                )
            );

            // Table header
            var headerCells = a.headers.map(function (header, index) {
                return el('th', {
                    className: 'bkbg-dt-th',
                    key: 'th-' + index,
                    'data-col': index
                },
                    header,
                    a.sortingEnabled && sortIcon
                );
            });

            // Table body
            var bodyRows = a.rows.map(function (row, rowIndex) {
                var cells = row.map(function (cell, colIndex) {
                    return el('td', {
                        className: 'bkbg-dt-td',
                        key: 'td-' + colIndex,
                        'data-label': a.headers[colIndex] || ''
                    }, cell);
                });
                return el('tr', { className: 'bkbg-dt-tr', key: 'tr-' + rowIndex }, cells);
            });

            // Caption
            var caption = a.caption && el('caption', { className: 'bkbg-dt-caption' }, a.caption);

            return el('div', {
                className: 'bkbg-dt-wrap',
                style: wrapStyle,
                'data-style': a.tableStyle,
                'data-sortable': a.sortingEnabled ? '1' : '0',
                'data-paginate': a.paginationEnabled ? '1' : '0',
                'data-per-page': a.itemsPerPage,
                'data-zebra': a.zebraStriping ? '1' : '0',
                'data-hover': a.rowHoverHighlight ? '1' : '0',
                'data-sticky-header': a.stickyHeader ? '1' : '0',
                'data-sticky-col': a.stickyFirstColumn ? '1' : '0',
                'data-responsive': a.responsiveMode,
                'data-caption-pos': a.captionPosition
            },
                controls,
                el('div', { className: 'bkbg-dt-container' },
                    el('table', { className: 'bkbg-dt-table' },
                        caption,
                        el('thead', { className: 'bkbg-dt-thead' },
                            el('tr', {}, headerCells)
                        ),
                        el('tbody', { className: 'bkbg-dt-tbody' }, bodyRows)
                    )
                )
            );
        }
    });
}() );
