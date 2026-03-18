( function () {
    var el                = wp.element.createElement;
    var useState          = wp.element.useState;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var Button            = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var LAYOUT_OPTIONS = [
        { value: 'two-col', label: 'Two Columns (side by side)' },
        { value: 'stacked', label: 'Stacked (pros then cons)' },
    ];

    /* ── Single editable column ──────────────────────────────────────────── */
    function Column(props) {
        var heading    = props.heading;
        var headBg     = props.headBg;
        var headColor  = props.headColor;
        var colBg      = props.colBg;
        var border     = props.border;
        var bulletClr  = props.bulletClr;
        var itemColor  = props.itemColor;
        var icon       = props.icon;
        var iconType   = props.iconType || 'custom-char';
        var iconDash   = props.iconDash;
        var iconImg    = props.iconImg;
        var iconDashColor = props.iconDashColor;
        var items      = props.items;
        var onUpdate   = props.onUpdate;
        var showIcons  = props.showIcons;
        var itemGap    = props.itemGap;
        var colRadius  = props.colRadius;

        return el('div', {
            style: {
                flex: 1, background: colBg, borderRadius: colRadius + 'px',
                border: '1.5px solid ' + border, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
            }
        },
            /* Column header */
            el('div', {
                className: 'bkbg-pc-col-head',
                style: {
                    background: headBg, color: headColor,
                    padding: '12px 18px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                }
            },
                showIcons && el('span', { style: { fontWeight: 800 } }, iconType !== 'custom-char' ? IP().buildEditorIcon(iconType, icon, iconDash, iconImg, iconDashColor) : icon),
                heading
            ),

            /* Items body */
            el('ul', {
                style: {
                    listStyle: 'none', margin: 0,
                    padding: '16px 18px',
                    display: 'flex', flexDirection: 'column', gap: itemGap + 'px',
                    flex: 1,
                }
            },
                items.map(function (item, idx) {
                    return el('li', { key: idx, style: { display: 'flex', alignItems: 'flex-start', gap: '8px' } },
                        showIcons && el('span', { className: 'bkbg-pc-item-icon', style: { color: bulletClr, flexShrink: 0 } }, iconType !== 'custom-char' ? IP().buildEditorIcon(iconType, icon, iconDash, iconImg, iconDashColor) : icon),
                        el('span', {
                            className: 'bkbg-pc-item-text',
                            contentEditable: true, suppressContentEditableWarning: true,
                            onBlur: function (e) {
                                var arr = items.slice(); arr[idx] = e.target.innerText; onUpdate(arr);
                            },
                            style: { color: itemColor, flex: 1, outline: 'none', cursor: 'text' }
                        }, item)
                    );
                }),
                /* Add button */
                el('li', null,
                    el(Button, {
                        variant: 'tertiary',
                        onClick: function () { onUpdate(items.concat('')); },
                        style: { fontSize: '12px', color: bulletClr, padding: '2px 4px' }
                    }, '+ ' + __('Add', 'blockenberg'))
                )
            )
        );
    }

    /* ── Preview ────────────────────────────────────────────────────────── */
    function ProsConsPreview(props) {
        var a    = props.attrs;
        var setA = props.setAttrs;

        var wrapStyle = {
            maxWidth:  (a.maxWidth  || 860) + 'px',
            margin:    '0 auto',
            padding:   (a.paddingV || 0) + 'px ' + (a.paddingH || 0) + 'px',
            background: a.cardBg || undefined,
            boxSizing: 'border-box',
        };

        var colProps = {
            itemGap:    a.itemGap    || 12,
            colRadius:  a.colRadius  || 12,
            showIcons:  a.showIcons  !== false,
        };

        return el('div', { style: wrapStyle },
            a.showHeading && el('h3', {
                className: 'bkbg-pc-heading',
                style: {
                    color: a.headingColor || '#1e1b4b',
                    textAlign: 'center', marginTop: 0, marginBottom: '20px',
                }
            }, a.heading || __('Pros & Cons', 'blockenberg')),

            el('div', {
                style: {
                    display:   a.layout === 'stacked' ? 'flex' : 'flex',
                    flexDirection: a.layout === 'stacked' ? 'column' : 'row',
                    gap:       (a.columnGap || 16) + 'px',
                }
            },
                el(Column, Object.assign({}, colProps, {
                    heading:   a.prosHeading  || 'Pros',
                    headBg:    a.prosHeadBg   || '#dcfce7',
                    headColor: a.prosHeadColor|| '#15803d',
                    colBg:     a.prosBg       || '#f0fdf4',
                    border:    a.prosBorder   || '#bbf7d0',
                    bulletClr: a.prosBulletColor || '#16a34a',
                    itemColor: a.prosItemColor|| '#166534',
                    icon:      a.prosIcon     || '✓',
                    iconType:  a.prosIconType || 'custom-char',
                    iconDash:  a.prosIconDashicon,
                    iconImg:   a.prosIconImageUrl,
                    iconDashColor: a.prosIconDashiconColor,
                    items:     a.pros || [],
                    onUpdate:  function (v) { setA({ pros: v }); },
                })),

                el(Column, Object.assign({}, colProps, {
                    heading:   a.consHeading  || 'Cons',
                    headBg:    a.consHeadBg   || '#fee2e2',
                    headColor: a.consHeadColor|| '#b91c1c',
                    colBg:     a.consBg       || '#fef2f2',
                    border:    a.consBorder   || '#fecaca',
                    bulletClr: a.consBulletColor || '#dc2626',
                    itemColor: a.consItemColor|| '#991b1b',
                    icon:      a.consIcon     || '✗',
                    iconType:  a.consIconType || 'custom-char',
                    iconDash:  a.consIconDashicon,
                    iconImg:   a.consIconImageUrl,
                    iconDashColor: a.consIconDashiconColor,
                    items:     a.cons || [],
                    onUpdate:  function (v) { setA({ cons: v }); },
                }))
            )
        );
    }

    registerBlockType('blockenberg/pros-cons', {
        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;
            var TC = getTypoControl();
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                if (_tv) {
                    Object.assign(s, _tv(a.headingTypo || {}, '--bkpc-h-'));
                    Object.assign(s, _tv(a.colHeadTypo || {}, '--bkpc-ch-'));
                    Object.assign(s, _tv(a.itemTypo || {}, '--bkpc-it-'));
                }
                return { style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Block Heading', 'blockenberg'), checked: a.showHeading, onChange: function (v) { setAttr({ showHeading: v }); }, __nextHasNoMarginBottom: true }),
                        a.showHeading && el(TextControl, { label: __('Heading', 'blockenberg'), value: a.heading, onChange: function (v) { setAttr({ heading: v }); } }),
                        el(TextControl, { label: __('Pros Column Heading', 'blockenberg'), value: a.prosHeading, onChange: function (v) { setAttr({ prosHeading: v }); } }),
                        el(TextControl, { label: __('Cons Column Heading', 'blockenberg'), value: a.consHeading, onChange: function (v) { setAttr({ consHeading: v }); } }),
                        el(ToggleControl, { label: __('Show Icons', 'blockenberg'), checked: a.showIcons, onChange: function (v) { setAttr({ showIcons: v }); }, __nextHasNoMarginBottom: true }),
                        a.showIcons && el(IP().IconPickerControl, IP().iconPickerProps(a, setAttr, { charAttr: 'prosIcon', typeAttr: 'prosIconType', dashiconAttr: 'prosIconDashicon', imageUrlAttr: 'prosIconImageUrl', colorAttr: 'prosIconDashiconColor' })),
                        a.showIcons && el(IP().IconPickerControl, IP().iconPickerProps(a, setAttr, { charAttr: 'consIcon', typeAttr: 'consIconType', dashiconAttr: 'consIconDashicon', imageUrlAttr: 'consIconImageUrl', colorAttr: 'consIconDashiconColor' }))
                    ),

                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: LAYOUT_OPTIONS, onChange: function (v) { setAttr({ layout: v }); } }),
                        el(RangeControl, { label: __('Column Gap (px)', 'blockenberg'), value: a.columnGap, min: 0, max: 60, onChange: function (v) { setAttr({ columnGap: v }); } })
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        TC && el(TC, { label: __('Heading', 'blockenberg'), value: a.headingTypo || {}, onChange: function(v) { setAttr({ headingTypo: v }); } }),
                        TC && el(TC, { label: __('Column Heading', 'blockenberg'), value: a.colHeadTypo || {}, onChange: function(v) { setAttr({ colHeadTypo: v }); } }),
                        TC && el(TC, { label: __('Item Text', 'blockenberg'), value: a.itemTypo || {}, onChange: function(v) { setAttr({ itemTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Pros Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Header Background', 'blockenberg'), value: a.prosHeadBg,      onChange: function (v) { setAttr({ prosHeadBg:      v || '#dcfce7' }); } },
                            { label: __('Header Text Color', 'blockenberg'), value: a.prosHeadColor,   onChange: function (v) { setAttr({ prosHeadColor:   v || '#15803d' }); } },
                            { label: __('Column Background', 'blockenberg'), value: a.prosBg,          onChange: function (v) { setAttr({ prosBg:          v || '#f0fdf4' }); } },
                            { label: __('Border Color', 'blockenberg'),      value: a.prosBorder,      onChange: function (v) { setAttr({ prosBorder:      v || '#bbf7d0' }); } },
                            { label: __('Bullet Color', 'blockenberg'),      value: a.prosBulletColor, onChange: function (v) { setAttr({ prosBulletColor: v || '#16a34a' }); } },
                            { label: __('Item Text Color', 'blockenberg'),   value: a.prosItemColor,   onChange: function (v) { setAttr({ prosItemColor:   v || '#166534' }); } },
                        ]
                    }),

                    el(PanelColorSettings, {
                        title: __('Cons Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Header Background', 'blockenberg'), value: a.consHeadBg,      onChange: function (v) { setAttr({ consHeadBg:      v || '#fee2e2' }); } },
                            { label: __('Header Text Color', 'blockenberg'), value: a.consHeadColor,   onChange: function (v) { setAttr({ consHeadColor:   v || '#b91c1c' }); } },
                            { label: __('Column Background', 'blockenberg'), value: a.consBg,          onChange: function (v) { setAttr({ consBg:          v || '#fef2f2' }); } },
                            { label: __('Border Color', 'blockenberg'),      value: a.consBorder,      onChange: function (v) { setAttr({ consBorder:      v || '#fecaca' }); } },
                            { label: __('Bullet Color', 'blockenberg'),      value: a.consBulletColor, onChange: function (v) { setAttr({ consBulletColor: v || '#dc2626' }); } },
                            { label: __('Item Text Color', 'blockenberg'),   value: a.consItemColor,   onChange: function (v) { setAttr({ consItemColor:   v || '#991b1b' }); } },
                        ]
                    }),

                    el(PanelColorSettings, {
                        title: __('General Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Heading Color', 'blockenberg'),     value: a.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#1e1b4b' }); } },
                            { label: __('Block Background', 'blockenberg'),  value: a.cardBg,       onChange: function (v) { setAttr({ cardBg:       v || '' }); } },
                        ]
                    }),

                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Item Gap (px)', 'blockenberg'),         value: a.itemGap,      min: 4,  max: 32, onChange: function (v) { setAttr({ itemGap:      v }); } }),
                        el(RangeControl, { label: __('Column Radius (px)', 'blockenberg'),    value: a.colRadius,    min: 0,  max: 32, onChange: function (v) { setAttr({ colRadius:    v }); } }),
                        el(RangeControl, { label: __('Padding Vertical (px)', 'blockenberg'), value: a.paddingV,     min: 0,  max: 80, onChange: function (v) { setAttr({ paddingV:     v }); } }),
                        el(RangeControl, { label: __('Padding Horizontal (px)', 'blockenberg'),value: a.paddingH,    min: 0,  max: 80, onChange: function (v) { setAttr({ paddingH:     v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'),        value: a.maxWidth,     min: 320,max: 1400,onChange: function (v) { setAttr({ maxWidth:     v }); } })
                    )
                ),

                el('div', blockProps,
                    el(ProsConsPreview, { attrs: a, setAttrs: setAttr })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save();
            return el('div', blockProps,
                el('div', { className: 'bkbg-pc-app', 'data-opts': JSON.stringify(a) },
                    el('p', { className: 'bkbg-pc-loading' }, '…')
                )
            );
        }
    });
}() );
