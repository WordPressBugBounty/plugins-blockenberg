( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;
    var __ = wp.i18n.__;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function updateObj(list, idx, field, val) {
        return list.map(function (o, i) {
            if (i !== idx) return o;
            var u = {}; u[field] = val;
            return Object.assign({}, o, u);
        });
    }

    // ── ObjectionPreview ────────────────────────────────────────────────────────
    function ObjectionPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;

        return el('div', {
            className: 'bkbg-oh-block',
            style: { background: a.bgColor }
        },
            a.showHeadline && el(Fragment, null,
                el('h2', {
                    className: 'bkbg-oh-headline',
                    style: { color: a.headlineColor },
                    contentEditable: true,
                    suppressContentEditableWarning: true,
                    onBlur: function (e) { setAttributes({ headline: e.target.textContent }); }
                }, a.headline),
                a.subheadline && el('p', {
                    className: 'bkbg-oh-sub',
                    style: { color: a.subColor },
                    contentEditable: true,
                    suppressContentEditableWarning: true,
                    onBlur: function (e) { setAttributes({ subheadline: e.target.textContent }); }
                }, a.subheadline)
            ),
            el('div', {
                className: 'bkbg-oh-list bkbg-oh-layout-' + a.layout + ' bkbg-oh-style-' + a.style,
                style: { gap: a.gap + 'px' }
            },
                a.objections.map(function (obj, i) {
                    return el('div', { key: i, className: 'bkbg-oh-pair', style: { borderRadius: a.borderRadius + 'px' } },
                        // Objection side
                        el('div', {
                            className: 'bkbg-oh-objection',
                            style: {
                                background: a.objectionBg,
                                color: a.objectionColor,
                                borderColor: a.objectionBorderColor,
                                borderRadius: (a.style === 'split' ? a.borderRadius + 'px 0 0 ' + a.borderRadius + 'px' : a.borderRadius + 'px')
                            }
                        },
                            el('div', { className: 'bkbg-oh-side-header' },
                                a.showIcon && el('span', { className: 'bkbg-oh-icon', style: { background: a.iconBg } }, obj.icon || '❓'),
                                el('span', { className: 'bkbg-oh-side-label', style: { color: a.labelColor } }, a.objectionLabel)
                            ),
                            el('p', { className: 'bkbg-oh-objection-text' }, '"' + obj.objection + '"')
                        ),
                        // Divider arrow (split style)
                        a.style === 'split' && el('div', { className: 'bkbg-oh-arrow', style: { color: a.responseBg } }, '▶'),
                        // Response side
                        el('div', {
                            className: 'bkbg-oh-response',
                            style: {
                                background: a.responseBg,
                                color: a.responseColor,
                                borderColor: a.responseBorderColor,
                                borderRadius: (a.style === 'split' ? '0 ' + a.borderRadius + 'px ' + a.borderRadius + 'px 0' : a.borderRadius + 'px')
                            }
                        },
                            el('div', { className: 'bkbg-oh-side-header' },
                                el('span', { className: 'bkbg-oh-check', style: { background: a.responseColor } }, '✓'),
                                el('span', { className: 'bkbg-oh-side-label', style: { color: a.labelColor } }, a.responseLabel)
                            ),
                            el('p', { className: 'bkbg-oh-response-text' }, obj.response)
                        )
                    );
                })
            )
        );
    }

    // ── ObjectionEditor ─────────────────────────────────────────────────────────
    function ObjectionEditor(props) {
        var list = props.list;
        var setAttributes = props.setAttributes;
        var accentColor = props.accentColor;

        var openState = useState(list.map(function () { return false; }));
        var open = openState[0];
        var setOpen = openState[1];

        function toggle(i) {
            setOpen(open.map(function (v, j) { return j === i ? !v : v; }));
        }

        function remove(i) {
            setAttributes({ objections: list.filter(function (_, j) { return j !== i; }) });
            setOpen(open.filter(function (_, j) { return j !== i; }));
        }

        function add() {
            setAttributes({ objections: list.concat([{ objection: 'New concern or objection.', response: 'Your response addressing this concern.', icon: '💬' }]) });
            setOpen(open.concat([true]));
        }

        return el('div', null,
            list.map(function (obj, i) {
                return el('div', { key: i, className: 'bkbg-oh-obj-editor' },
                    el('div', {
                        className: 'bkbg-oh-obj-header',
                        onClick: function () { toggle(i); },
                        style: { borderLeftColor: accentColor }
                    },
                        el('span', null, (obj.icon || '❓') + ' ' + obj.objection.slice(0, 40) + (obj.objection.length > 40 ? '…' : '')),
                        el('span', null, open[i] ? '▲' : '▼')
                    ),
                    open[i] && el('div', { className: 'bkbg-oh-obj-fields' },
                        el(TextControl, {
                            label: __('Icon (emoji)'),
                            value: obj.icon,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ objections: updateObj(list, i, 'icon', v) }); }
                        }),
                        el(TextareaControl, {
                            label: __('Objection / Concern'),
                            value: obj.objection,
                            rows: 2,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ objections: updateObj(list, i, 'objection', v) }); }
                        }),
                        el(TextareaControl, {
                            label: __('Response'),
                            value: obj.response,
                            rows: 3,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ objections: updateObj(list, i, 'response', v) }); }
                        }),
                        el(Button, {
                            variant: 'link',
                            isDestructive: true,
                            onClick: function () { remove(i); }
                        }, __('Remove'))
                    )
                );
            }),
            el(Button, {
                variant: 'secondary',
                onClick: add,
                style: { marginTop: '8px' }
            }, __('+ Add Objection'))
        );
    }

    // ── register ────────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/objection-handler', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Objections'), initialOpen: true },
                        el(ObjectionEditor, {
                            list: a.objections,
                            setAttributes: setAttributes,
                            accentColor: a.objectionColor
                        })
                    ),
                    el(PanelBody, { title: __('Headline'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show headline section'),
                            checked: a.showHeadline,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showHeadline: v }); }
                        }),
                        el(TextControl, {
                            label: __('Headline'),
                            value: a.headline,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ headline: v }); }
                        }),
                        el(TextControl, {
                            label: __('Subheadline'),
                            value: a.subheadline,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ subheadline: v }); }
                        })
                    ),
                    el(PanelBody, { title: __('Layout & Style'), initialOpen: false },
                        el(SelectControl, {
                            label: __('Layout'),
                            value: a.layout,
                            __nextHasNoMarginBottom: true,
                            options: [
                                { value: 'stack', label: 'Stacked (one per row)' },
                                { value: 'grid', label: 'Grid (2 columns)' }
                            ],
                            onChange: function (v) { setAttributes({ layout: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Pair style'),
                            value: a.style,
                            __nextHasNoMarginBottom: true,
                            options: [
                                { value: 'split', label: 'Split (side by side)' },
                                { value: 'card', label: 'Cards (stacked)' }
                            ],
                            onChange: function (v) { setAttributes({ style: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show icon'),
                            checked: a.showIcon,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showIcon: v }); }
                        }),
                        el(TextControl, {
                            label: __('Objection column label'),
                            value: a.objectionLabel,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ objectionLabel: v }); }
                        }),
                        el(TextControl, {
                            label: __('Response column label'),
                            value: a.responseLabel,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ responseLabel: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Border radius (px)'),
                            value: a.borderRadius,
                            min: 0, max: 24,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ borderRadius: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Gap between rows (px)'),
                            value: a.gap,
                            min: 4, max: 40,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ gap: v }); }
                        })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background'), value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#ffffff' }); } },
                            { label: __('Headline'), value: a.headlineColor, onChange: function (v) { setAttributes({ headlineColor: v || '#0f172a' }); } },
                            { label: __('Subheadline'), value: a.subColor, onChange: function (v) { setAttributes({ subColor: v || '#64748b' }); } },
                            { label: __('Objection bg'), value: a.objectionBg, onChange: function (v) { setAttributes({ objectionBg: v || '#fff7ed' }); } },
                            { label: __('Objection text'), value: a.objectionColor, onChange: function (v) { setAttributes({ objectionColor: v || '#9a3412' }); } },
                            { label: __('Objection border'), value: a.objectionBorderColor, onChange: function (v) { setAttributes({ objectionBorderColor: v || '#fed7aa' }); } },
                            { label: __('Response bg'), value: a.responseBg, onChange: function (v) { setAttributes({ responseBg: v || '#f0fdf4' }); } },
                            { label: __('Response text'), value: a.responseColor, onChange: function (v) { setAttributes({ responseColor: v || '#166534' }); } },
                            { label: __('Response border'), value: a.responseBorderColor, onChange: function (v) { setAttributes({ responseBorderColor: v || '#bbf7d0' }); } },
                            { label: __('Label color'), value: a.labelColor, onChange: function (v) { setAttributes({ labelColor: v || '#64748b' }); } }
                        ]
                    }),
                    el(PanelBody, { title: __('Typography'), initialOpen: false },
                        el(getTypoControl(), { label: __('Headline'), value: a.headlineTypo, onChange: function (v) { setAttributes({ headlineTypo: v }); } }),
                        el(getTypoControl(), { label: __('Body Text'), value: a.bodyTypo, onChange: function (v) { setAttributes({ bodyTypo: v }); } })
                    )
                ),
                el('div', (function () {
                    var bp = useBlockProps();
                    var _tvf = getTypoCssVars();
                    var s = {};
                    if (_tvf) {
                        Object.assign(s, _tvf(a.headlineTypo, '--bkbg-oh-hl-'));
                        Object.assign(s, _tvf(a.bodyTypo, '--bkbg-oh-bd-'));
                    }
                    bp.style = Object.assign(s, bp.style || {});
                    return bp;
                }()),
                    el(ObjectionPreview, { attributes: a, setAttributes: setAttributes })
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-oh-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
