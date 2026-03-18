( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var PRIORITIES = {
        high:   { label: 'High',   color: '#ef4444' },
        medium: { label: 'Medium', color: '#f59e0b' },
        low:    { label: 'Low',    color: '#10b981' }
    };

    function uid() {
        return 'id-' + Math.random().toString(36).slice(2, 8);
    }

    // Single Kanban Card
    function KanbanCard(props) {
        var card = props.card;
        var attrs = props.attrs;
        var cardStyle = {
            background: attrs.cardBg,
            borderRadius: attrs.cardRadius + 'px',
            padding: attrs.cardPadding + 'px',
            boxShadow: attrs.cardShadow ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
            marginBottom: '8px'
        };

        return el('div', { className: 'bkk-card', style: cardStyle },
            el('div', { className: 'bkk-card-header' },
                attrs.showTags && card.tag && el('span', {
                    className: 'bkk-tag',
                    style: { background: (card.tagColor || '#e5e7eb') + '22', color: card.tagColor || '#374151', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.02em' }
                }, card.tag),
                attrs.showPriority && el('span', {
                    className: 'bkk-priority bkk-priority--' + (card.priority || 'medium'),
                    title: (PRIORITIES[card.priority] || PRIORITIES.medium).label,
                    style: {
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: (PRIORITIES[card.priority] || PRIORITIES.medium).color,
                        display: 'inline-block', marginLeft: '6px', flexShrink: 0
                    }
                })
            ),
            el('div', {
                className: 'bkk-card-title',
                style: { color: attrs.cardTitleColor, marginTop: '6px' }
            }, card.title || __('Card title', 'blockenberg')),
            attrs.showDesc && card.desc && el('div', {
                className: 'bkk-card-desc',
                style: { color: attrs.cardDescColor, marginTop: '4px' }
            }, card.desc)
        );
    }

    // Single Kanban Column
    function KanbanColumn(props) {
        var col = props.col;
        var attrs = props.attrs;
        var colStyle = {
            background: attrs.columnBg,
            borderRadius: attrs.columnRadius + 'px',
            padding: attrs.columnPadding + 'px',
            minWidth: attrs.columnMinWidth + 'px',
            flex: '1 1 ' + attrs.columnMinWidth + 'px'
        };

        return el('div', { className: 'bkk-column', style: colStyle },
            el('div', { className: 'bkk-col-header', style: { marginBottom: '12px' } },
                attrs.showColorBar && el('div', {
                    className: 'bkk-col-bar',
                    style: {
                        height: attrs.colorBarHeight + 'px',
                        background: col.color || '#6b7280',
                        borderRadius: '3px',
                        marginBottom: '10px'
                    }
                }),
                el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
                    el('span', {
                        className: 'bkk-col-title',
                        style: { color: attrs.columnTitleColor }
                    }, col.title || __('Column', 'blockenberg')),
                    attrs.showCardCount && el('span', {
                        className: 'bkk-count',
                        style: { fontSize: '11px', background: '#e5e7eb', borderRadius: '999px', padding: '1px 7px', color: '#6b7280', fontWeight: 600 }
                    }, (col.cards || []).length)
                )
            ),
            el('div', { className: 'bkk-cards' },
                (col.cards || []).map(function (card) {
                    return el(KanbanCard, { key: card.id, card: card, attrs: attrs });
                })
            )
        );
    }

    // Column editor panel
    function ColumnEditor(props) {
        var col = props.col;
        var colIdx = props.colIdx;
        var onUpdateCol = props.onUpdateCol;
        var onRemoveCol = props.onRemoveCol;
        var onAddCard = props.onAddCard;
        var onUpdateCard = props.onUpdateCard;
        var onRemoveCard = props.onRemoveCard;

        return el(PanelBody, {
            title: (col.title || __('Column', 'blockenberg')) + ' (' + (col.cards || []).length + ')',
            initialOpen: colIdx === 0
        },
            el(TextControl, {
                label: __('Column title', 'blockenberg'),
                value: col.title,
                onChange: function (v) { onUpdateCol(colIdx, 'title', v); }
            }),
            el(BkbgColorSwatch, {
                label: __('Column color (hex)', 'blockenberg'),
                value: col.color,
                onChange: function (v) { onUpdateCol(colIdx, 'color', v); }
            }),

            // Cards
            (col.cards || []).map(function (card, ci) {
                return el(PanelBody, {
                    key: card.id,
                    title: card.title || (__('Card', 'blockenberg') + ' ' + (ci + 1)),
                    initialOpen: false
                },
                    el(TextControl, {
                        label: __('Card title', 'blockenberg'),
                        value: card.title,
                        onChange: function (v) { onUpdateCard(colIdx, ci, 'title', v); }
                    }),
                    el(TextareaControl, {
                        label: __('Description', 'blockenberg'),
                        rows: 2,
                        value: card.desc,
                        onChange: function (v) { onUpdateCard(colIdx, ci, 'desc', v); }
                    }),
                    el(TextControl, {
                        label: __('Tag label', 'blockenberg'),
                        value: card.tag,
                        onChange: function (v) { onUpdateCard(colIdx, ci, 'tag', v); }
                    }),
                    el(BkbgColorSwatch, {
                        label: __('Tag color (hex)', 'blockenberg'),
                        value: card.tagColor,
                        onChange: function (v) { onUpdateCard(colIdx, ci, 'tagColor', v); }
                    }),
                    el(SelectControl, {
                        label: __('Priority', 'blockenberg'),
                        value: card.priority || 'medium',
                        options: [
                            { label: 'High', value: 'high' },
                            { label: 'Medium', value: 'medium' },
                            { label: 'Low', value: 'low' }
                        ],
                        onChange: function (v) { onUpdateCard(colIdx, ci, 'priority', v); }
                    }),
                    el(Button, {
                        variant: 'secondary', isDestructive: true, isSmall: true,
                        onClick: function () { onRemoveCard(colIdx, ci); }
                    }, __('Remove card', 'blockenberg'))
                );
            }),

            el(Button, {
                variant: 'secondary', isSmall: true,
                style: { marginTop: '8px', width: '100%', justifyContent: 'center' },
                onClick: function () { onAddCard(colIdx); }
            }, __('+ Add card', 'blockenberg')),

            el('hr', { style: { margin: '12px 0', borderColor: '#e5e7eb' } }),
            el(Button, {
                variant: 'secondary', isDestructive: true, isSmall: true,
                onClick: function () { onRemoveCol(colIdx); }
            }, __('Remove column', 'blockenberg'))
        );
    }

    var BkbgColorSwatch = function (props) {
        var _st = useState(false); var isOpen = _st[0]; var setOpen = _st[1];
        return el(Fragment, {},
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: '#1e1e1e' } }, props.label),
                el('button', {
                    type: 'button',
                    onClick: function () { setOpen(!isOpen); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #ccc', background: props.value || '#ffffff', cursor: 'pointer', padding: 0 }
                })
            ),
            isOpen && el(Popover, { onClose: function () { setOpen(false); } },
                el('div', { style: { padding: '8px' } },
                    el(ColorPicker, { color: props.value, onChangeComplete: function (c) { props.onChange(c.hex); }, enableAlpha: true })
                )
            )
        );
    };

    registerBlockType('blockenberg/kanban-board', {

        edit: function (props) {
            var attrs = props.attributes;
            var setAttr = props.setAttributes;
            var cols = attrs.columns || [];

            function updateCol(ci, key, val) {
                var next = cols.map(function (c, i) {
                    if (i !== ci) return c;
                    var u = Object.assign({}, c); u[key] = val; return u;
                });
                setAttr({ columns: next });
            }

            function removeCol(ci) {
                setAttr({ columns: cols.filter(function (_, i) { return i !== ci; }) });
            }

            function addCol() {
                if (cols.length >= 8) return;
                setAttr({ columns: cols.concat([{ id: uid(), title: 'New Column', color: '#6b7280', cards: [] }]) });
            }

            function addCard(ci) {
                var next = cols.map(function (c, i) {
                    if (i !== ci) return c;
                    var newCard = { id: uid(), title: 'New card', desc: '', tag: '', tagColor: '#6c3fb5', priority: 'medium' };
                    return Object.assign({}, c, { cards: (c.cards || []).concat([newCard]) });
                });
                setAttr({ columns: next });
            }

            function updateCard(ci, ki, key, val) {
                var next = cols.map(function (c, i) {
                    if (i !== ci) return c;
                    var newCards = (c.cards || []).map(function (card, j) {
                        if (j !== ki) return card;
                        var u = Object.assign({}, card); u[key] = val; return u;
                    });
                    return Object.assign({}, c, { cards: newCards });
                });
                setAttr({ columns: next });
            }

            function removeCard(ci, ki) {
                var next = cols.map(function (c, i) {
                    if (i !== ci) return c;
                    return Object.assign({}, c, { cards: (c.cards || []).filter(function (_, j) { return j !== ki; }) });
                });
                setAttr({ columns: next });
            }

            var wrapStyle = {
                paddingTop: attrs.paddingTop + 'px',
                paddingBottom: attrs.paddingBottom + 'px'
            };
            if (attrs.bgColor) wrapStyle.background = attrs.bgColor;
            var _tv = getTypoCssVars();
            Object.assign(wrapStyle, _tv(attrs.columnTitleTypo, '--bkk-ct-'));
            Object.assign(wrapStyle, _tv(attrs.cardTitleTypo, '--bkk-cdt-'));
            Object.assign(wrapStyle, _tv(attrs.cardDescTypo, '--bkk-cdd-'));

            var blockProps = useBlockProps({ className: 'bkk-wrap', style: wrapStyle });

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Board Settings', 'blockenberg'), initialOpen: true },
                        el(RangeControl, {
                            label: __('Column min-width (px)', 'blockenberg'),
                            value: attrs.columnMinWidth, min: 160, max: 400,
                            onChange: function (v) { setAttr({ columnMinWidth: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Gap (px)', 'blockenberg'),
                            value: attrs.gap, min: 4, max: 48,
                            onChange: function (v) { setAttr({ gap: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Column radius (px)', 'blockenberg'),
                            value: attrs.columnRadius, min: 0, max: 24,
                            onChange: function (v) { setAttr({ columnRadius: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Card radius (px)', 'blockenberg'),
                            value: attrs.cardRadius, min: 0, max: 24,
                            onChange: function (v) { setAttr({ cardRadius: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Card padding (px)', 'blockenberg'),
                            value: attrs.cardPadding, min: 8, max: 32,
                            onChange: function (v) { setAttr({ cardPadding: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Column padding (px)', 'blockenberg'),
                            value: attrs.columnPadding, min: 8, max: 32,
                            onChange: function (v) { setAttr({ columnPadding: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show color bar', 'blockenberg'),
                            checked: attrs.showColorBar,
                            onChange: function (v) { setAttr({ showColorBar: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        attrs.showColorBar && el(RangeControl, {
                            label: __('Color bar height (px)', 'blockenberg'),
                            value: attrs.colorBarHeight, min: 2, max: 12,
                            onChange: function (v) { setAttr({ colorBarHeight: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show card count badge', 'blockenberg'),
                            checked: attrs.showCardCount,
                            onChange: function (v) { setAttr({ showCardCount: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show priority dots', 'blockenberg'),
                            checked: attrs.showPriority,
                            onChange: function (v) { setAttr({ showPriority: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show tags', 'blockenberg'),
                            checked: attrs.showTags,
                            onChange: function (v) { setAttr({ showTags: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show description', 'blockenberg'),
                            checked: attrs.showDesc,
                            onChange: function (v) { setAttr({ showDesc: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Card shadow', 'blockenberg'),
                            checked: attrs.cardShadow,
                            onChange: function (v) { setAttr({ cardShadow: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),

                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTypographyControl(), { label: __('Column Title', 'blockenberg'), value: attrs.columnTitleTypo, onChange: function (v) { setAttr({ columnTitleTypo: v }); } }),
                        el(getTypographyControl(), { label: __('Card Title', 'blockenberg'), value: attrs.cardTitleTypo, onChange: function (v) { setAttr({ cardTitleTypo: v }); } }),
                        el(getTypographyControl(), { label: __('Card Description', 'blockenberg'), value: attrs.cardDescTypo, onChange: function (v) { setAttr({ cardDescTypo: v }); } })
                    ),

                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Padding Top (px)', 'blockenberg'),
                            value: attrs.paddingTop, min: 0, max: 200,
                            onChange: function (v) { setAttr({ paddingTop: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Padding Bottom (px)', 'blockenberg'),
                            value: attrs.paddingBottom, min: 0, max: 200,
                            onChange: function (v) { setAttr({ paddingBottom: v }); }
                        })
                    ),

                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Column Background', 'blockenberg'), value: attrs.columnBg, onChange: function (v) { setAttr({ columnBg: v || '#f3f4f6' }); } },
                            { label: __('Card Background', 'blockenberg'), value: attrs.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#ffffff' }); } },
                            { label: __('Column Title', 'blockenberg'), value: attrs.columnTitleColor, onChange: function (v) { setAttr({ columnTitleColor: v || '#1f2937' }); } },
                            { label: __('Card Title', 'blockenberg'), value: attrs.cardTitleColor, onChange: function (v) { setAttr({ cardTitleColor: v || '#111827' }); } },
                            { label: __('Card Description', 'blockenberg'), value: attrs.cardDescColor, onChange: function (v) { setAttr({ cardDescColor: v || '#6b7280' }); } },
                            { label: __('Board Background', 'blockenberg'), value: attrs.bgColor, onChange: function (v) { setAttr({ bgColor: v || '' }); } }
                        ]
                    }),

                    // Columns editor
                    el(PanelBody, { title: __('Columns & Cards', 'blockenberg'), initialOpen: false },
                        cols.map(function (col, ci) {
                            return el(ColumnEditor, {
                                key: col.id,
                                col: col,
                                colIdx: ci,
                                onUpdateCol: updateCol,
                                onRemoveCol: removeCol,
                                onAddCard: addCard,
                                onUpdateCard: updateCard,
                                onRemoveCard: removeCard
                            });
                        }),
                        cols.length < 8 && el(Button, {
                            variant: 'primary', isSmall: true,
                            style: { marginTop: '12px', width: '100%', justifyContent: 'center' },
                            onClick: addCol
                        }, __('+ Add column', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    el('div', {
                        className: 'bkk-board',
                        style: {
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: attrs.gap + 'px',
                            alignItems: 'flex-start'
                        }
                    },
                        cols.map(function (col) {
                            return el(KanbanColumn, { key: col.id, col: col, attrs: attrs });
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var cols = a.columns || [];

            var wrapStyle = {
                paddingTop: a.paddingTop + 'px',
                paddingBottom: a.paddingBottom + 'px'
            };
            if (a.bgColor) wrapStyle.background = a.bgColor;
            var _tv = getTypoCssVars();
            Object.assign(wrapStyle, _tv(a.columnTitleTypo, '--bkk-ct-'));
            Object.assign(wrapStyle, _tv(a.cardTitleTypo, '--bkk-cdt-'));
            Object.assign(wrapStyle, _tv(a.cardDescTypo, '--bkk-cdd-'));

            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkk-wrap', style: wrapStyle });

            return el('div', blockProps,
                el('div', {
                    className: 'bkk-board',
                    style: { display: 'flex', flexWrap: 'wrap', gap: a.gap + 'px', alignItems: 'flex-start' }
                },
                    cols.map(function (col) {
                        return el('div', {
                            key: col.id,
                            className: 'bkk-column',
                            style: {
                                background: a.columnBg,
                                borderRadius: a.columnRadius + 'px',
                                padding: a.columnPadding + 'px',
                                minWidth: a.columnMinWidth + 'px',
                                flex: '1 1 ' + a.columnMinWidth + 'px'
                            }
                        },
                            el('div', { className: 'bkk-col-header' },
                                a.showColorBar && el('div', {
                                    className: 'bkk-col-bar',
                                    style: { height: a.colorBarHeight + 'px', background: col.color || '#6b7280', borderRadius: '3px', marginBottom: '10px' }
                                }),
                                el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
                                    el('span', {
                                        className: 'bkk-col-title',
                                        style: { color: a.columnTitleColor }
                                    }, col.title),
                                    a.showCardCount && el('span', {
                                        className: 'bkk-count',
                                        style: { fontSize: '11px', background: '#e5e7eb', borderRadius: '999px', padding: '1px 7px', color: '#6b7280', fontWeight: 600 }
                                    }, (col.cards || []).length)
                                )
                            ),
                            el('div', { className: 'bkk-cards', style: { marginTop: '12px' } },
                                (col.cards || []).map(function (card) {
                                    return el('div', {
                                        key: card.id,
                                        className: 'bkk-card',
                                        style: {
                                            background: a.cardBg,
                                            borderRadius: a.cardRadius + 'px',
                                            padding: a.cardPadding + 'px',
                                            boxShadow: a.cardShadow ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                                            marginBottom: '8px'
                                        }
                                    },
                                        el('div', { className: 'bkk-card-header', style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' } },
                                            a.showTags && card.tag && el('span', {
                                                className: 'bkk-tag',
                                                style: { background: (card.tagColor || '#e5e7eb') + '22', color: card.tagColor || '#374151', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }
                                            }, card.tag),
                                            a.showPriority && el('span', {
                                                className: 'bkk-priority bkk-priority--' + (card.priority || 'medium'),
                                                style: {
                                                    width: '8px', height: '8px', borderRadius: '50%',
                                                    background: (PRIORITIES[card.priority] || PRIORITIES.medium).color,
                                                    display: 'inline-block', flexShrink: 0
                                                }
                                            })
                                        ),
                                        el('div', {
                                            className: 'bkk-card-title',
                                            style: { color: a.cardTitleColor, marginTop: '6px' }
                                        }, card.title),
                                        a.showDesc && card.desc && el('div', {
                                            className: 'bkk-card-desc',
                                            style: { color: a.cardDescColor, marginTop: '4px' }
                                        }, card.desc)
                                    );
                                })
                            )
                        );
                    })
                )
            );
        }
    });
}() );
