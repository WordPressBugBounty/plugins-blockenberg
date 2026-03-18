( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    // Lazy lookup so the typography control is resolved at render time
    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    /* ── ES5-safe helpers ── */
    function updateItem(arr, idx, field, val) {
        return arr.map(function (item, i) {
            if (i !== idx) return item;
            var p = {}; p[field] = val;
            return Object.assign({}, item, p);
        });
    }

    function updateRowCell(rows, rIdx, cIdx, val) {
        return rows.map(function (row, i) {
            if (i !== rIdx) return row;
            var cells = row.cells.map(function (c, j) { return j === cIdx ? val : c; });
            return Object.assign({}, row, { cells: cells });
        });
    }

    function ensureCells(row, colCount) {
        var cells = (row.cells || []).slice();
        while (cells.length < colCount) cells.push('');
        return cells.slice(0, colCount);
    }

    /* ── expand icon ── */
    function iconSvg(type, open) {
        if (type === 'plus') {
            return open
                ? el('span', { style: { fontSize: '18px', lineHeight: 1, display: 'block', transform: 'rotate(45deg)', transition: 'transform 0.2s' } }, '+')
                : el('span', { style: { fontSize: '18px', lineHeight: 1, display: 'block' } }, '+');
        }
        if (type === 'arrow') {
            return el('span', { style: { fontSize: '12px', display: 'block', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.22s' } }, '▶');
        }
        /* chevron (default) */
        return el('span', { style: { fontSize: '12px', display: 'block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.22s' } }, '▼');
    }

    /* ── column editor ── */
    function ColumnEditor(props) {
        var columns = props.columns;
        var setColumns = props.setColumns;

        return el('div', {},
            el('div', { style: { fontSize: '11px', color: '#6b7280', marginBottom: '8px' } },
                __('Drag-to-reorder not available in editor. Use move buttons.', 'blockenberg')
            ),
            columns.map(function (col, i) {
                return el('div', {
                    key: i,
                    style: { display: 'flex', gap: '6px', alignItems: 'flex-end', marginBottom: '6px' }
                },
                    el('div', { style: { flex: 2 } },
                        el(TextControl, {
                            __nextHasNoMarginBottom: true,
                            label: i === 0 ? __('Column headers', 'blockenberg') : '',
                            placeholder: __('Header', 'blockenberg'),
                            value: col.label,
                            onChange: function (v) {
                                setColumns(updateItem(columns, i, 'label', v));
                            }
                        })
                    ),
                    el('div', { style: { flex: 1 } },
                        el(SelectControl, {
                            __nextHasNoMarginBottom: true,
                            label: i === 0 ? __('Align', 'blockenberg') : '',
                            value: col.align || 'left',
                            options: [
                                { label: 'L', value: 'left' },
                                { label: 'C', value: 'center' },
                                { label: 'R', value: 'right' }
                            ],
                            onChange: function (v) { setColumns(updateItem(columns, i, 'align', v)); }
                        })
                    ),
                    el('div', { style: { flex: 1 } },
                        el(TextControl, {
                            __nextHasNoMarginBottom: true,
                            label: i === 0 ? __('Width', 'blockenberg') : '',
                            placeholder: 'auto',
                            value: col.width || '',
                            onChange: function (v) { setColumns(updateItem(columns, i, 'width', v)); }
                        })
                    ),
                    el('button', {
                        onClick: function () {
                            if (columns.length <= 1) return;
                            setColumns(columns.filter(function (_, j) { return j !== i; }));
                        },
                        title: 'Remove',
                        style: { background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '16px', padding: '0 2px', marginBottom: '2px' }
                    }, '×')
                );
            }),
            el(Button, {
                variant: 'secondary',
                style: { marginTop: '4px', width: '100%', justifyContent: 'center' },
                onClick: function () {
                    setColumns(columns.concat([{ label: 'Column ' + (columns.length + 1), align: 'left', width: '' }]));
                }
            }, __('+ Add Column', 'blockenberg'))
        );
    }

    /* ── row editor ── */
    function RowEditor(props) {
        var rows = props.rows;
        var columns = props.columns;
        var setRows = props.setRows;
        var expanded = props.expanded;
        var setExpanded = props.setExpanded;

        return el('div', {},
            rows.map(function (row, i) {
                var isOpen = expanded === i;
                var cells = ensureCells(row, columns.length);
                var firstCell = cells[0] || 'Row ' + (i + 1);

                return el('div', {
                    key: i,
                    style: {
                        border: '1px solid ' + (row.highlight ? '#6366f1' : '#e5e7eb'),
                        borderRadius: '6px',
                        marginBottom: '5px',
                        overflow: 'hidden',
                        background: row.highlight ? '#f0f0ff' : '#fff'
                    }
                },
                    /* header row */
                    el('div', {
                        onClick: function () { setExpanded(isOpen ? -1 : i); },
                        style: { padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
                    },
                        row.badge ? el('span', {
                            style: {
                                background: row.badgeColor || '#6366f1',
                                color: '#fff', fontSize: '10px', fontWeight: 700,
                                padding: '2px 6px', borderRadius: '20px', flexShrink: 0
                            }
                        }, row.badge) : null,
                        el('span', { style: { flex: 1, fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: row.highlight ? 700 : 400 } },
                            firstCell
                        ),
                        el('button', {
                            onClick: function (e) {
                                e.stopPropagation();
                                if (rows.length <= 1) return;
                                setRows(rows.filter(function (_, j) { return j !== i; }));
                                setExpanded(-1);
                            },
                            title: 'Remove row',
                            style: { background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '14px', padding: '0 2px' }
                        }, '×'),
                        el('span', { style: { color: '#9ca3af', fontSize: '10px' } }, isOpen ? '▲' : '▼')
                    ),

                    /* expanded editor */
                    isOpen ? el('div', { style: { padding: '10px', borderTop: '1px solid #e5e7eb' } },

                        /* cells */
                        el('div', { style: { marginBottom: '10px' } },
                            el('div', { style: { fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '6px' } },
                                __('Cell values', 'blockenberg')
                            ),
                            columns.map(function (col, ci) {
                                return el('div', { key: ci, style: { marginBottom: '6px' } },
                                    el(TextControl, {
                                        __nextHasNoMarginBottom: true,
                                        label: col.label || ('Col ' + (ci + 1)),
                                        value: cells[ci] || '',
                                        onChange: function (v) { setRows(updateRowCell(rows, i, ci, v)); }
                                    })
                                );
                            })
                        ),

                        /* badge */
                        el('div', {
                            style: { borderTop: '1px solid #eee', paddingTop: '8px', marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'flex-end' }
                        },
                            el('div', { style: { flex: 2 } },
                                el(TextControl, {
                                    __nextHasNoMarginBottom: true,
                                    label: __('Badge text (optional)', 'blockenberg'),
                                    value: row.badge || '',
                                    onChange: function (v) { setRows(updateItem(rows, i, 'badge', v)); }
                                })
                            ),
                            el('div', { style: { flex: 1 } },
                                el('label', { style: { display: 'block', fontSize: '11px', fontWeight: 600, color: '#757575', marginBottom: '4px' } }, __('Badge color', 'blockenberg')),
                                el('input', {
                                    type: 'color',
                                    value: row.badgeColor || '#6366f1',
                                    onChange: function (e) { setRows(updateItem(rows, i, 'badgeColor', e.target.value)); },
                                    style: { width: '100%', height: '32px', padding: '2px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer' }
                                })
                            )
                        ),

                        /* highlight toggle */
                        el(ToggleControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Highlight this row', 'blockenberg'),
                            checked: row.highlight || false,
                            onChange: function (v) { setRows(updateItem(rows, i, 'highlight', v)); }
                        }),

                        /* detail section */
                        el('div', { style: { borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '8px' } },
                            el('div', { style: { fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px' } },
                                __('Expand detail', 'blockenberg')
                            ),
                            el(TextControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Detail section title', 'blockenberg'),
                                value: row.detailTitle || '',
                                onChange: function (v) { setRows(updateItem(rows, i, 'detailTitle', v)); }
                            }),
                            el('div', { style: { marginTop: '8px' } },
                                el(SelectControl, {
                                    __nextHasNoMarginBottom: true,
                                    label: __('Detail type', 'blockenberg'),
                                    value: row.detailType || 'list',
                                    options: [
                                        { label: __('Bullet list', 'blockenberg'), value: 'list' },
                                        { label: __('Text paragraph', 'blockenberg'), value: 'text' }
                                    ],
                                    onChange: function (v) { setRows(updateItem(rows, i, 'detailType', v)); }
                                })
                            ),
                            (row.detailType || 'list') === 'list' ? el('div', { style: { marginTop: '8px' } },
                                el('label', { style: { display: 'block', fontSize: '11px', fontWeight: 600, color: '#757575', marginBottom: '4px' } },
                                    __('List items (one per line)', 'blockenberg')
                                ),
                                el('textarea', {
                                    value: (row.detailItems || []).join('\n'),
                                    rows: 5,
                                    style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box' },
                                    onChange: function (e) {
                                        var items = e.target.value.split('\n').map(function (s) { return s.trimEnd(); }).filter(function (s) { return s.length > 0; });
                                        setRows(updateItem(rows, i, 'detailItems', items));
                                    }
                                })
                            ) : el('div', { style: { marginTop: '8px' } },
                                el('textarea', {
                                    value: row.detailText || '',
                                    rows: 4,
                                    placeholder: __('Detail paragraph text…', 'blockenberg'),
                                    style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box' },
                                    onChange: function (e) { setRows(updateItem(rows, i, 'detailText', e.target.value)); }
                                })
                            )
                        ),

                        /* move buttons */
                        el('div', { style: { display: 'flex', gap: '6px', marginTop: '10px' } },
                            i > 0 ? el(Button, {
                                variant: 'secondary', style: { fontSize: '11px' },
                                onClick: function () {
                                    var arr = rows.slice(); var tmp = arr[i - 1]; arr[i - 1] = arr[i]; arr[i] = tmp;
                                    setRows(arr); setExpanded(i - 1);
                                }
                            }, '↑ Move up') : null,
                            i < rows.length - 1 ? el(Button, {
                                variant: 'secondary', style: { fontSize: '11px' },
                                onClick: function () {
                                    var arr = rows.slice(); var tmp = arr[i + 1]; arr[i + 1] = arr[i]; arr[i] = tmp;
                                    setRows(arr); setExpanded(i + 1);
                                }
                            }, '↓ Move down') : null,
                            el(Button, {
                                variant: 'secondary', style: { fontSize: '11px' },
                                onClick: function () {
                                    var copy = Object.assign({}, row, { badge: row.badge ? row.badge + ' (copy)' : '', cells: cells.slice() });
                                    var arr = rows.slice(); arr.splice(i + 1, 0, copy);
                                    setRows(arr); setExpanded(i + 1);
                                }
                            }, __('Duplicate', 'blockenberg'))
                        )

                    ) : null
                );
            }),

            el(Button, {
                variant: 'primary',
                style: { marginTop: '8px', width: '100%', justifyContent: 'center' },
                onClick: function () {
                    var newRow = {
                        cells: columns.map(function () { return ''; }),
                        badge: '', badgeColor: '#6366f1', highlight: false,
                        detailTitle: '', detailType: 'list', detailText: '', detailItems: []
                    };
                    var arr = rows.concat([newRow]);
                    setRows(arr);
                    setExpanded(arr.length - 1);
                }
            }, __('+ Add Row', 'blockenberg'))
        );
    }

    /* ── editor table preview ── */
    function TablePreview(props) {
        var a = props.attributes;
        var openRows = props.openRows;
        var toggleRow = props.toggleRow;

        var colCount = a.columns.length;
        var iconPos = a.expandIconPosition || 'right';
        var showNums = a.showRowNumbers;

        return el('div', {
            style: {
                border: '1px solid ' + a.borderColor,
                borderRadius: a.borderRadius + 'px',
                overflow: 'hidden',
                maxWidth: a.maxWidth + 'px',
                margin: '0 auto',
                fontFamily: 'system-ui, sans-serif'
            }
        },
            /* header */
            el('div', {
                style: {
                    display: 'grid',
                    gridTemplateColumns: (showNums ? '32px ' : '') + (iconPos === 'left' ? '32px ' : '') + a.columns.map(function (c) { return c.width || '1fr'; }).join(' ') + (iconPos === 'right' ? ' 32px' : ''),
                    background: a.headerBg,
                    borderBottom: '1px solid ' + a.borderColor
                }
            },
                showNums ? el('div', { className: 'bkbg-actbl-th', style: { padding: a.cellPaddingV + 'px ' + a.cellPaddingH + 'px', color: a.headerColor } }, '#') : null,
                iconPos === 'left' ? el('div', { style: { padding: a.cellPaddingV + 'px ' + a.cellPaddingH + 'px' } }) : null,
                a.columns.map(function (col, ci) {
                    return el('div', {
                        key: ci,
                        className: 'bkbg-actbl-th',
                        style: {
                            padding: a.cellPaddingV + 'px ' + a.cellPaddingH + 'px',
                            color: a.headerColor,
                            textAlign: col.align || 'left'
                        }
                    }, col.label);
                }),
                iconPos === 'right' ? el('div', { style: { padding: a.cellPaddingV + 'px ' + a.cellPaddingH + 'px' } }) : null
            ),

            /* rows */
            a.rows.map(function (row, ri) {
                var isOpen = openRows[ri];
                var cells = ensureCells(row, colCount);
                var rowBg = row.highlight ? a.highlightRowBg : (a.stripedRows && ri % 2 === 1 ? a.rowAltBg : a.rowBg);

                return el('div', { key: ri },
                    /* main row */
                    el('div', {
                        onClick: function () { toggleRow(ri); },
                        style: {
                            display: 'grid',
                            gridTemplateColumns: (showNums ? '32px ' : '') + (iconPos === 'left' ? '32px ' : '') + a.columns.map(function (c) { return c.width || '1fr'; }).join(' ') + (iconPos === 'right' ? ' 32px' : ''),
                            background: rowBg,
                            borderLeft: row.highlight ? '3px solid ' + a.highlightRowBorder : '3px solid transparent',
                            borderBottom: '1px solid ' + a.borderColor,
                            cursor: 'pointer',
                            transition: 'background 0.15s'
                        }
                    },
                        showNums ? el('div', { className: 'bkbg-actbl-td', style: { padding: a.cellPaddingV + 'px ' + a.cellPaddingH + 'px', color: '#9ca3af', textAlign: 'center' } }, ri + 1) : null,
                        iconPos === 'left' ? el('div', { style: { padding: a.cellPaddingV + 'px ' + a.cellPaddingH + 'px', color: a.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                            iconSvg(a.expandIcon, isOpen)
                        ) : null,
                        cells.map(function (cell, ci) {
                            return el('div', {
                                key: ci,
                                className: 'bkbg-actbl-td' + (ci === 0 ? ' bkbg-actbl-td-first' : ''),
                                style: {
                                    padding: a.cellPaddingV + 'px ' + a.cellPaddingH + 'px',
                                    color: a.rowColor,
                                    textAlign: a.columns[ci] ? (a.columns[ci].align || 'left') : 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }
                            },
                                ci === 0 && row.badge ? el('span', {
                                    style: {
                                        background: row.badgeColor || '#6366f1',
                                        color: '#fff', fontSize: '10px', fontWeight: 700,
                                        padding: '2px 7px', borderRadius: '20px', flexShrink: 0
                                    }
                                }, row.badge) : null,
                                cell
                            );
                        }),
                        iconPos === 'right' ? el('div', { style: { padding: a.cellPaddingV + 'px ' + a.cellPaddingH + 'px', color: a.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                            iconSvg(a.expandIcon, isOpen)
                        ) : null
                    ),

                    /* detail panel */
                    isOpen ? el('div', {
                        style: {
                            background: a.detailBg,
                            borderBottom: '1px solid ' + a.detailBorderColor,
                            padding: '14px ' + (a.cellPaddingH + 8) + 'px',
                            borderLeft: '3px solid ' + (row.highlight ? a.highlightRowBorder : a.borderColor)
                        }
                    },
                        row.detailTitle ? el('div', {
                            className: 'bkbg-actbl-detail-title',
                            style: { color: a.detailColor, marginBottom: '8px', opacity: 0.7 }
                        }, row.detailTitle) : null,
                        (row.detailType || 'list') === 'list'
                            ? el('ul', { style: { margin: 0, padding: '0 0 0 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '4px 20px' } },
                                (row.detailItems || []).map(function (item, ii) {
                                    return el('li', { key: ii, className: 'bkbg-actbl-detail-li', style: { color: a.detailColor } }, item);
                                })
                              )
                            : el('p', { className: 'bkbg-actbl-detail-text', style: { margin: 0, color: a.detailColor } }, row.detailText || '')
                    ) : null
                );
            })
        );
    }

    /* ── register ── */
    registerBlockType('blockenberg/accordion-table', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var expState = useState(-1);
            var expanded = expState[0];
            var setExpanded = expState[1];

            var openState = useState({});
            var openRows = openState[0];
            var setOpenRows = openState[1];

            var blockProps = useBlockProps({ className: 'bkbg-actbl-editor-wrap' });

            function setColumns(v) { setAttributes({ columns: v }); }
            function setRows(v) { setAttributes({ rows: v }); }

            function toggleRow(ri) {
                if (a.allowMultiple) {
                    var next = Object.assign({}, openRows);
                    next[ri] = !next[ri];
                    setOpenRows(next);
                } else {
                    var next2 = {};
                    next2[ri] = !openRows[ri];
                    setOpenRows(next2);
                }
            }

            return el(Fragment, {},

                el(InspectorControls, {},

                    /* ── Columns ── */
                    el(PanelBody, { title: __('Columns', 'blockenberg'), initialOpen: true },
                        el(ColumnEditor, { columns: a.columns, setColumns: setColumns })
                    ),

                    /* ── Rows ── */
                    el(PanelBody, { title: __('Rows', 'blockenberg'), initialOpen: true },
                        el(RowEditor, {
                            rows: a.rows,
                            columns: a.columns,
                            setRows: setRows,
                            expanded: expanded,
                            setExpanded: setExpanded
                        })
                    ),

                    /* ── Behaviour ── */
                    el(PanelBody, { title: __('Behaviour', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Allow multiple rows open simultaneously', 'blockenberg'),
                            checked: a.allowMultiple,
                            onChange: function (v) { setAttributes({ allowMultiple: v }); }
                        }),
                        el('div', { style: { marginTop: '10px' } },
                            el(ToggleControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Show row numbers', 'blockenberg'),
                                checked: a.showRowNumbers,
                                onChange: function (v) { setAttributes({ showRowNumbers: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '4px' } },
                            el(ToggleControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Striped rows', 'blockenberg'),
                                checked: a.stripedRows,
                                onChange: function (v) { setAttributes({ stripedRows: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '10px' } },
                            el(SelectControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Expand icon', 'blockenberg'),
                                value: a.expandIcon,
                                options: [
                                    { label: __('Chevron (▼)', 'blockenberg'), value: 'chevron' },
                                    { label: __('Plus (+)', 'blockenberg'),     value: 'plus' },
                                    { label: __('Arrow (▶)', 'blockenberg'),   value: 'arrow' }
                                ],
                                onChange: function (v) { setAttributes({ expandIcon: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '10px' } },
                            el(SelectControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Expand icon position', 'blockenberg'),
                                value: a.expandIconPosition,
                                options: [
                                    { label: __('Right', 'blockenberg'), value: 'right' },
                                    { label: __('Left', 'blockenberg'),  value: 'left' }
                                ],
                                onChange: function (v) { setAttributes({ expandIconPosition: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '10px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Animation duration (ms)', 'blockenberg'),
                                value: a.animDuration, min: 80, max: 600,
                                onChange: function (v) { setAttributes({ animDuration: v }); }
                            })
                        )
                    ),

                    /* ── Appearance ── */
                    el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Max width (px)', 'blockenberg'),
                            value: a.maxWidth, min: 300, max: 1400,
                            onChange: function (v) { setAttributes({ maxWidth: v }); }
                        }),
                        el('div', { style: { marginTop: '10px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Border radius (px)', 'blockenberg'),
                                value: a.borderRadius, min: 0, max: 24,
                                onChange: function (v) { setAttributes({ borderRadius: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '10px', display: 'flex', gap: '8px' } },
                            el('div', { style: { flex: 1 } },
                                el(RangeControl, {
                                    __nextHasNoMarginBottom: true,
                                    label: __('Cell padding V', 'blockenberg'),
                                    value: a.cellPaddingV, min: 6, max: 32,
                                    onChange: function (v) { setAttributes({ cellPaddingV: v }); }
                                })
                            ),
                            el('div', { style: { flex: 1 } },
                                el(RangeControl, {
                                    __nextHasNoMarginBottom: true,
                                    label: __('Cell padding H', 'blockenberg'),
                                    value: a.cellPaddingH, min: 6, max: 40,
                                    onChange: function (v) { setAttributes({ cellPaddingH: v }); }
                                })
                            )
                        ),
                        el('div', { style: { marginTop: '10px', display: 'flex', gap: '8px' } },
                            el('div', { style: { flex: 1 } },
                                el(RangeControl, {
                                    __nextHasNoMarginBottom: true,
                                    label: __('Padding top', 'blockenberg'),
                                    value: a.paddingTop, min: 0, max: 120,
                                    onChange: function (v) { setAttributes({ paddingTop: v }); }
                                })
                            ),
                            el('div', { style: { flex: 1 } },
                                el(RangeControl, {
                                    __nextHasNoMarginBottom: true,
                                    label: __('Padding bottom', 'blockenberg'),
                                    value: a.paddingBottom, min: 0, max: 120,
                                    onChange: function (v) { setAttributes({ paddingBottom: v }); }
                                })
                            )
                        )
                    ),

                    /* ── Colors ── */
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () {
                            var TC = getTypographyControl();
                            if (!TC) return el('p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, __('Typography control loading…', 'blockenberg'));
                            return el(Fragment, {},
                                el(TC, { label: __('Header', 'blockenberg'), value: a.headerTypo || {}, onChange: function (v) { setAttributes({ headerTypo: v }); } }),
                                el(TC, { label: __('Cells', 'blockenberg'), value: a.cellTypo || {}, onChange: function (v) { setAttributes({ cellTypo: v }); } }),
                                el(TC, { label: __('Detail', 'blockenberg'), value: a.detailTypo || {}, onChange: function (v) { setAttributes({ detailTypo: v }); } })
                            );
                        })()
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background', 'blockenberg'),         value: a.bgColor,            onChange: function (v) { setAttributes({ bgColor: v || '#ffffff' }); } },
                            { label: __('Header background', 'blockenberg'),  value: a.headerBg,           onChange: function (v) { setAttributes({ headerBg: v || '#f8fafc' }); } },
                            { label: __('Header text', 'blockenberg'),        value: a.headerColor,        onChange: function (v) { setAttributes({ headerColor: v || '#374151' }); } },
                            { label: __('Row background', 'blockenberg'),     value: a.rowBg,              onChange: function (v) { setAttributes({ rowBg: v || '#ffffff' }); } },
                            { label: __('Row alt background', 'blockenberg'), value: a.rowAltBg,           onChange: function (v) { setAttributes({ rowAltBg: v || '#f9fafb' }); } },
                            { label: __('Row text', 'blockenberg'),           value: a.rowColor,           onChange: function (v) { setAttributes({ rowColor: v || '#1f2937' }); } },
                            { label: __('Row hover', 'blockenberg'),          value: a.rowHoverBg,         onChange: function (v) { setAttributes({ rowHoverBg: v || '#f0f4ff' }); } },
                            { label: __('Highlighted row bg', 'blockenberg'), value: a.highlightRowBg,    onChange: function (v) { setAttributes({ highlightRowBg: v || '#f0f0ff' }); } },
                            { label: __('Highlighted row border', 'blockenberg'), value: a.highlightRowBorder, onChange: function (v) { setAttributes({ highlightRowBorder: v || '#6366f1' }); } },
                            { label: __('Detail panel bg', 'blockenberg'),    value: a.detailBg,           onChange: function (v) { setAttributes({ detailBg: v || '#f8fafc' }); } },
                            { label: __('Detail text', 'blockenberg'),        value: a.detailColor,        onChange: function (v) { setAttributes({ detailColor: v || '#374151' }); } },
                            { label: __('Table border', 'blockenberg'),       value: a.borderColor,        onChange: function (v) { setAttributes({ borderColor: v || '#e5e7eb' }); } },
                            { label: __('Icon color', 'blockenberg'),         value: a.iconColor,          onChange: function (v) { setAttributes({ iconColor: v || '#9ca3af' }); } }
                        ]
                    })
                ),

                /* ── canvas ── */
                el('div', blockProps,
                    el('div', {
                        className: 'bkbg-actbl-wrap',
                        style: (function () {
                            var s = {
                                paddingTop: a.paddingTop + 'px',
                                paddingBottom: a.paddingBottom + 'px',
                                background: a.bgColor,
                                '--bkbg-actbl-header-sz': a.headerSize + 'px',
                                '--bkbg-actbl-cell-sz':   a.cellSize + 'px',
                                '--bkbg-actbl-detail-sz': a.detailSize + 'px'
                            };
                            var _tv = getTypoCssVars();
                            Object.assign(s, _tv(a.headerTypo || {}, '--bkbg-actbl-header-'));
                            Object.assign(s, _tv(a.cellTypo   || {}, '--bkbg-actbl-cell-'));
                            Object.assign(s, _tv(a.detailTypo || {}, '--bkbg-actbl-detail-'));
                            return s;
                        })()
                    },
                        el(TablePreview, {
                            attributes: a,
                            openRows: openRows,
                            toggleRow: toggleRow
                        })
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-actbl-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
