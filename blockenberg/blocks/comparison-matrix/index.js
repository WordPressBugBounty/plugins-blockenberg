( function () {
    var el                = wp.element.createElement;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var TextControl       = wp.components.TextControl;
    var Button            = wp.components.Button;
    var SelectControl     = wp.components.SelectControl;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }
    var IP = function () { return window.bkbgIconPicker; };

    /* Render a cell value: 'true'/'false' → icon, otherwise text */
    function CellValue(val, attr) {
        if (val === 'true') {
            var checkType = attr.checkIconType || 'custom-char';
            if (checkType !== 'custom-char') {
                return el('span', { className: 'bkbg-cm-check', style: { color: attr.checkColor, fontSize: 18 } },
                    IP().buildEditorIcon(checkType, attr.checkIcon, attr.checkIconDashicon, attr.checkIconImageUrl, attr.checkIconDashiconColor));
            }
            return el('span', { style: { color: attr.checkColor, fontWeight: 700, fontSize: 18 }}, attr.checkIcon || '✓');
        }
        if (val === 'false') {
            var crossType = attr.crossIconType || 'custom-char';
            if (crossType !== 'custom-char') {
                return el('span', { className: 'bkbg-cm-cross', style: { color: attr.crossColor, fontSize: 18 } },
                    IP().buildEditorIcon(crossType, attr.crossIcon, attr.crossIconDashicon, attr.crossIconImageUrl, attr.crossIconDashiconColor));
            }
            return el('span', { style: { color: attr.crossColor, fontWeight: 700, fontSize: 18 }}, attr.crossIcon || '✕');
        }
        return el('span', { style: { fontWeight: 600 }}, val);
    }

    registerBlockType('blockenberg/comparison-matrix', {
        title:    __('Comparison Matrix'),
        icon:     'grid-view',
        category: 'bkbg-marketing',

        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var typoVars = Object.assign({}, _tv(attr.typoHeader, '--bkcm-header-'), _tv(attr.typoBody, '--bkcm-body-'));
            var bp      = useBlockProps({ className: 'bkbg-cm-wrap', style: typoVars });

            function updatePlan(idx, field, val) {
                var plans = attr.plans.map(function (p, i) {
                    return i === idx ? Object.assign({}, p, { [field]: val }) : p;
                });
                setAttr({ plans: plans });
            }
            function addPlan() {
                var n = attr.plans.length;
                var newValues = attr.features.map(function (f) {
                    var newF = f.values.slice();
                    newF.push('true');
                    return newF;
                });
                setAttr({
                    plans: attr.plans.concat([{ name: 'Plan ' + (n + 1), subtitle: '', highlight: false, badge: '' }]),
                    features: attr.features.map(function (f, i) {
                        return Object.assign({}, f, { values: newValues[i] });
                    })
                });
            }
            function removePlan(idx) {
                if (attr.plans.length <= 2) return;
                setAttr({
                    plans: attr.plans.filter(function (_, i) { return i !== idx; }),
                    features: attr.features.map(function (f) {
                        return Object.assign({}, f, { values: f.values.filter(function (_, i) { return i !== idx; }) });
                    })
                });
            }
            function updateFeature(idx, field, val) {
                var features = attr.features.map(function (f, i) {
                    return i === idx ? Object.assign({}, f, { [field]: val }) : f;
                });
                setAttr({ features: features });
            }
            function updateFeatureValue(fidx, pidx, val) {
                var features = attr.features.map(function (f, i) {
                    if (i !== fidx) return f;
                    var values = f.values.slice();
                    values[pidx] = val;
                    return Object.assign({}, f, { values: values });
                });
                setAttr({ features: features });
            }
            function addFeature() {
                setAttr({ features: attr.features.concat([{
                    label: 'New Feature', group: '',
                    values: attr.plans.map(function () { return 'true'; })
                }]) });
            }
            function removeFeature(idx) {
                setAttr({ features: attr.features.filter(function (_, i) { return i !== idx; }) });
            }

            var inspector = el(InspectorControls, {},
                /* Plans */
                el(PanelBody, { title: __('Plans / Columns'), initialOpen: true },
                    attr.plans.map(function (p, idx) {
                        return el(PanelBody, { key: idx, title: p.name || 'Plan ' + (idx + 1), initialOpen: false },
                            el(TextControl, { label: __('Name'), value: p.name || '',
                                onChange: function (v) { updatePlan(idx, 'name', v); },
                                __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Subtitle'), value: p.subtitle || '',
                                onChange: function (v) { updatePlan(idx, 'subtitle', v); },
                                __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Badge (optional)'), value: p.badge || '',
                                onChange: function (v) { updatePlan(idx, 'badge', v); },
                                __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Highlight (featured)'), checked: !!p.highlight,
                                onChange: function (v) { updatePlan(idx, 'highlight', v); },
                                __nextHasNoMarginBottom: true }),
                            attr.plans.length > 2 && el(Button, { isDestructive: true, variant: 'secondary',
                                onClick: function () { removePlan(idx); },
                                style: { marginTop: 8 }
                            }, __('Remove Plan'))
                        );
                    }),
                    el(Button, { variant: 'primary', onClick: addPlan,
                        style: { marginTop: 8, width: '100%' }
                    }, __('+ Add Plan'))
                ),

                /* Features */
                el(PanelBody, { title: __('Features / Rows'), initialOpen: false },
                    attr.features.map(function (f, fidx) {
                        return el(PanelBody, { key: fidx, title: f.label || 'Feature ' + (fidx + 1), initialOpen: false },
                            el(TextControl, { label: __('Feature Label'), value: f.label || '',
                                onChange: function (v) { updateFeature(fidx, 'label', v); },
                                __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Group Header (optional)'), value: f.group || '',
                                onChange: function (v) { updateFeature(fidx, 'group', v); },
                                __nextHasNoMarginBottom: true }),
                            el('p', { style: { fontSize: 11, margin: '8px 0 4px', color: '#64748b' }},
                                __('Values per plan — use "true"/false" for check/cross, or any text:')),
                            attr.plans.map(function (p, pidx) {
                                return el(TextControl, { key: pidx,
                                    label: p.name || 'Plan ' + (pidx + 1),
                                    value: (f.values && f.values[pidx]) || 'true',
                                    onChange: function (v) { updateFeatureValue(fidx, pidx, v); },
                                    __nextHasNoMarginBottom: true });
                            }),
                            el(Button, { isDestructive: true, variant: 'secondary',
                                onClick: function () { removeFeature(fidx); },
                                style: { marginTop: 8 }
                            }, __('Remove Feature'))
                        );
                    }),
                    el(Button, { variant: 'primary', onClick: addFeature,
                        style: { marginTop: 8, width: '100%' }
                    }, __('+ Add Feature'))
                ),

                /* Appearance */
                el(PanelBody, { title: __('Appearance'), initialOpen: false },
                    el(RangeControl, { label: __('Cell Padding (px)'), value: attr.cellPadding,
                        min: 8, max: 32,
                        onChange: function (v) { setAttr({ cellPadding: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Header Radius (px)'), value: attr.headerRadius,
                        min: 0, max: 24,
                        onChange: function (v) { setAttr({ headerRadius: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('First Column Width (px)'), value: attr.firstColWidth,
                        min: 100, max: 400,
                        onChange: function (v) { setAttr({ firstColWidth: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Sticky Header Row'), checked: attr.stickyHeader,
                        onChange: function (v) { setAttr({ stickyHeader: v }); },
                        __nextHasNoMarginBottom: true }),
                    el('p', { style: { fontSize: 11, fontWeight: 600, marginTop: 12 } }, __('Check Icon')),
                    el(IP().IconPickerControl, IP().iconPickerProps(attr, setAttr, { charAttr: 'checkIcon', typeAttr: 'checkIconType', dashiconAttr: 'checkIconDashicon', imageUrlAttr: 'checkIconImageUrl', colorAttr: 'checkIconDashiconColor' })),
                    el('p', { style: { fontSize: 11, fontWeight: 600, marginTop: 12 } }, __('Cross Icon')),
                    el(IP().IconPickerControl, IP().iconPickerProps(attr, setAttr, { charAttr: 'crossIcon', typeAttr: 'crossIconType', dashiconAttr: 'crossIconDashicon', imageUrlAttr: 'crossIconImageUrl', colorAttr: 'crossIconDashiconColor' }))
                ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Header Typography', 'blockenberg'), value: attr.typoHeader, onChange: function (v) { setAttr({ typoHeader: v }); } }),
                    el(getTypographyControl(), { label: __('Body Typography', 'blockenberg'), value: attr.typoBody, onChange: function (v) { setAttr({ typoBody: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors'), initialOpen: false,
                    colorSettings: [
                        { label: __('Header BG'), value: attr.headerBg,
                          onChange: function (v) { setAttr({ headerBg: v || '#f8fafc' }); } },
                        { label: __('Header Text'), value: attr.headerColor,
                          onChange: function (v) { setAttr({ headerColor: v || '#0f172a' }); } },
                        { label: __('Highlight BG'), value: attr.highlightBg,
                          onChange: function (v) { setAttr({ highlightBg: v || '#6366f1' }); } },
                        { label: __('Highlight Text'), value: attr.highlightColor,
                          onChange: function (v) { setAttr({ highlightColor: v || '#ffffff' }); } },
                        { label: __('Row Color'), value: attr.rowColor,
                          onChange: function (v) { setAttr({ rowColor: v || '#334155' }); } },
                        { label: __('Border'), value: attr.borderColor,
                          onChange: function (v) { setAttr({ borderColor: v || '#e2e8f0' }); } },
                        { label: __('Check'), value: attr.checkColor,
                          onChange: function (v) { setAttr({ checkColor: v || '#10b981' }); } },
                        { label: __('Cross'), value: attr.crossColor,
                          onChange: function (v) { setAttr({ crossColor: v || '#f43f5e' }); } }
                    ]
                })
            );

            /* Editor preview table */
            var colStyle = function (p) {
                return {
                    background: p.highlight ? attr.highlightBg : attr.headerBg,
                    color: p.highlight ? attr.highlightColor : attr.headerColor,
                    padding: attr.cellPadding + 'px',
                    textAlign: 'center',
                    borderRadius: attr.headerRadius + 'px ' + attr.headerRadius + 'px 0 0',
                    border: '1px solid ' + attr.borderColor, borderBottom: 'none'
                };
            };

            return el(wp.element.Fragment, {}, inspector,
                el('div', bp,
                    el('div', { style: { overflowX: 'auto' }},
                        el('table', { className: 'bkbg-cm-table', style: {
                            width: '100%', borderCollapse: 'collapse'
                        }},
                            el('thead', {},
                                el('tr', {},
                                    el('th', { className: 'bkbg-cm-th bkbg-cm-th-feature', style: {
                                        width: attr.firstColWidth + 'px',
                                        padding: attr.cellPadding + 'px',
                                        border: '1px solid ' + attr.borderColor,
                                        background: attr.headerBg
                                    }}),
                                    attr.plans.map(function (p, i) {
                                        return el('th', { key: i, className: 'bkbg-cm-th' + (p.highlight ? ' bkbg-cm-highlight' : ''), style: colStyle(p) },
                                            p.badge && el('div', { style: {
                                                fontSize: 10, fontWeight: 700, marginBottom: 4,
                                                background: attr.badgeBg || '#fef3c7',
                                                color: attr.badgeColor || '#92400e',
                                                padding: '2px 8px', borderRadius: 100,
                                                display: 'inline-block'
                                            }}, p.badge),
                                            el('div', {}, p.name),
                                            p.subtitle && el('div', { style: { fontSize: 11, opacity: 0.75, fontWeight: 400 }}, p.subtitle)
                                        );
                                    })
                                )
                            ),
                            el('tbody', {},
                                attr.features.map(function (f, ridx) {
                                    return el('tr', { key: ridx, style: {
                                        background: ridx % 2 === 0 ? attr.rowBg || '#ffffff' : attr.rowAltBg || '#f8fafc'
                                    }},
                                        el('td', { className: 'bkbg-cm-td bkbg-cm-td-feature', style: {
                                            padding: attr.cellPadding + 'px',
                                            border: '1px solid ' + attr.borderColor,
                                            color: attr.headerColor,
                                            width: attr.firstColWidth + 'px'
                                        }}, f.label),
                                        attr.plans.map(function (p, cidx) {
                                            var val = f.values && f.values[cidx] != null ? f.values[cidx] : '';
                                            return el('td', { key: cidx, className: 'bkbg-cm-td' + (p.highlight ? ' bkbg-cm-hl-col' : ''), style: {
                                                padding: attr.cellPadding + 'px',
                                                border: '1px solid ' + attr.borderColor,
                                                color: attr.rowColor,
                                                background: p.highlight ? attr.highlightBg + '18' : 'transparent'
                                            }},
                                                CellValue(val, attr)
                                            );
                                        })
                                    );
                                })
                            )
                        )
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var sv = Object.assign({}, _tv(attr.typoHeader, '--bkcm-header-'), _tv(attr.typoBody, '--bkcm-body-'));
            var bp   = useBlockProps.save({ style: sv });
            return el('div', bp,
                el('div', { className: 'bkbg-cm-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
