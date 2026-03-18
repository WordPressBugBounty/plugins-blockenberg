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
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }
    var IP = function () { return window.bkbgIconPicker; };

    var statusOptions = [
        { label: '✓ Yes', value: 'yes' },
        { label: '✗ No', value: 'no' },
        { label: '~ Partial', value: 'partial' }
    ];

    function statusIcon(v, colors) {
        if (v === 'yes')     return el('span', { style: { color: colors.yes,     fontSize: 22, fontWeight: 700 } }, '✓');
        if (v === 'no')      return el('span', { style: { color: colors.no,      fontSize: 22, fontWeight: 700 } }, '✗');
        if (v === 'partial') return el('span', { style: { color: colors.partial, fontSize: 20 } }, '∼');
        return el('span', null, v);
    }

    registerBlockType('blockenberg/comparison-section', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-cmp-editor', style: Object.assign({}, _tv(attr.typoHeading, '--bkcs-heading-'), _tv(attr.typoBody, '--bkcs-body-')) });

            var colors = { yes: attr.yesColor, no: attr.noColor, partial: attr.partialColor };

            function updateRow(idx, key, val) {
                var next = attr.rows.map(function (r, i) {
                    return i === idx ? Object.assign({}, r, { [key]: val }) : r;
                });
                setAttr({ rows: next });
            }

            function addRow() {
                setAttr({ rows: attr.rows.concat([{ feature: 'New feature', col1: 'yes', col2: 'no' }]) });
            }

            function removeRow(idx) {
                setAttr({ rows: attr.rows.filter(function (_, i) { return i !== idx; }) });
            }

            var col1IsHl = attr.highlightCol === 'col1';
            var col2IsHl = attr.highlightCol === 'col2';
            var hlStyle = { background: attr.highlightBg, color: attr.highlightColor };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Heading', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Heading', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showHeading, onChange: function (v) { setAttr({ showHeading: v }); } })
                    ),
                    el(PanelBody, { title: __('Columns', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: __('Col 1 Label (You)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.col1Label, onChange: function (v) { setAttr({ col1Label: v }); } }),
                        el('p', { style: { fontSize: 11, fontWeight: 600, marginTop: 12 } }, __('Col 1 Icon', 'blockenberg')),
                        el(IP().IconPickerControl, IP().iconPickerProps(attr, setAttr, { charAttr: 'col1Icon', typeAttr: 'col1IconType', dashiconAttr: 'col1IconDashicon', imageUrlAttr: 'col1IconImageUrl', colorAttr: 'col1IconDashiconColor' })),
                        el(TextControl, { label: __('Col 2 Label (Others)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.col2Label, onChange: function (v) { setAttr({ col2Label: v }); } }),
                        el('p', { style: { fontSize: 11, fontWeight: 600, marginTop: 12 } }, __('Col 2 Icon', 'blockenberg')),
                        el(IP().IconPickerControl, IP().iconPickerProps(attr, setAttr, { charAttr: 'col2Icon', typeAttr: 'col2IconType', dashiconAttr: 'col2IconDashicon', imageUrlAttr: 'col2IconImageUrl', colorAttr: 'col2IconDashiconColor' })),
                        el(ToggleControl, { label: __('Show Icons', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showColIcons, onChange: function (v) { setAttr({ showColIcons: v }); } }),
                        el(SelectControl, { label: __('Highlight Column', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.highlightCol,
                            options: [{ label: 'Col 1 (You)', value: 'col1' }, { label: 'Col 2 (Others)', value: 'col2' }, { label: 'None', value: 'none' }],
                            onChange: function (v) { setAttr({ highlightCol: v }); } })
                    ),
                    el(PanelBody, { title: __('Feature Rows', 'blockenberg'), initialOpen: false },
                        attr.rows.map(function (r, i) {
                            return el('div', { key: i, style: { borderLeft: '3px solid #7c3aed', paddingLeft: 8, marginBottom: 12 } },
                                el(TextControl, { label: __('Feature', 'blockenberg') + ' ' + (i + 1), __nextHasNoMarginBottom: true, value: r.feature, onChange: function (v) { updateRow(i, 'feature', v); } }),
                                el(SelectControl, { label: attr.col1Label, __nextHasNoMarginBottom: true, value: r.col1, options: statusOptions, onChange: function (v) { updateRow(i, 'col1', v); } }),
                                el(SelectControl, { label: attr.col2Label, __nextHasNoMarginBottom: true, value: r.col2, options: statusOptions, onChange: function (v) { updateRow(i, 'col2', v); } }),
                                attr.rows.length > 1 && el(Button, { onClick: function () { removeRow(i); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true }, __('Remove', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: addRow, variant: 'secondary', __nextHasNoMarginBottom: true }, __('+ Add Row', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('CTA', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show CTA', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showCta, onChange: function (v) { setAttr({ showCta: v }); } }),
                        attr.showCta && el(TextControl, { label: __('CTA Label', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.ctaLabel, onChange: function (v) { setAttr({ ctaLabel: v }); } }),
                        attr.showCta && el(TextControl, { label: __('CTA URL', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.ctaUrl, onChange: function (v) { setAttr({ ctaUrl: v }); } })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(TextControl, { label: __('Table Max Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.tableWidth, onChange: function (v) { setAttr({ tableWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); } }),
                        el(RangeControl, { label: __('Outer Max Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.maxWidth, min: 600, max: 1600, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Heading Typography', 'blockenberg'), value: attr.typoHeading, onChange: function (v) { setAttr({ typoHeading: v }); } }),
                        el(getTypographyControl(), { label: __('Body Typography', 'blockenberg'), value: attr.typoBody, onChange: function (v) { setAttr({ typoBody: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,        onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); },        label: __('Background', 'blockenberg') },
                            { value: attr.highlightBg,    onChange: function (v) { setAttr({ highlightBg: v || '#7c3aed' }); },    label: __('Highlight Column BG', 'blockenberg') },
                            { value: attr.highlightColor, onChange: function (v) { setAttr({ highlightColor: v || '#ffffff' }); }, label: __('Highlight Column Text', 'blockenberg') },
                            { value: attr.headingColor,   onChange: function (v) { setAttr({ headingColor: v || '#111827' }); },   label: __('Heading', 'blockenberg') },
                            { value: attr.textColor,      onChange: function (v) { setAttr({ textColor: v || '#6b7280' }); },      label: __('Subtext', 'blockenberg') },
                            { value: attr.featureColor,   onChange: function (v) { setAttr({ featureColor: v || '#374151' }); },   label: __('Feature Text', 'blockenberg') },
                            { value: attr.yesColor,       onChange: function (v) { setAttr({ yesColor: v || '#16a34a' }); },       label: __('Yes / checkmark', 'blockenberg') },
                            { value: attr.noColor,        onChange: function (v) { setAttr({ noColor: v || '#dc2626' }); },        label: __('No / cross', 'blockenberg') },
                            { value: attr.partialColor,   onChange: function (v) { setAttr({ partialColor: v || '#d97706' }); },   label: __('Partial', 'blockenberg') },
                            { value: attr.borderColor,    onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); },    label: __('Table Border', 'blockenberg') },
                            { value: attr.ctaBg,          onChange: function (v) { setAttr({ ctaBg: v || '#7c3aed' }); },          label: __('CTA Background', 'blockenberg') },
                            { value: attr.ctaColor,       onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); },       label: __('CTA Text', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { style: { background: attr.bgColor, padding: attr.paddingTop + 'px 40px ' + attr.paddingBottom + 'px' } },
                        el('div', { style: { maxWidth: attr.maxWidth + 'px', margin: '0 auto', textAlign: 'center' } },
                            attr.showHeading && el(Fragment, null,
                                el(RichText, { tagName: 'h2', className: 'bkbg-cmp-heading', value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, style: { color: attr.headingColor, margin: '0 0 16px', fontWeight: 700 }, placeholder: __('Heading…', 'blockenberg') }),
                                el(RichText, { tagName: 'p', className: 'bkbg-cmp-subtext', value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, style: { color: attr.textColor, margin: '0 0 48px' }, placeholder: __('Subtext…', 'blockenberg') })
                            ),
                            el('table', { style: { width: '100%', maxWidth: attr.tableWidth + 'px', margin: '0 auto', borderCollapse: 'collapse', borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 0 1px ' + attr.borderColor } },
                                el('thead', null,
                                    el('tr', null,
                                        el('th', { style: { background: attr.tableHeaderBg, padding: '20px 24px', textAlign: 'left', width: '50%', fontSize: attr.textSize + 'px', color: attr.featureColor, borderBottom: '1px solid ' + attr.borderColor } }, ''),
                                        el('th', { style: Object.assign({ padding: '20px 24px', fontSize: attr.textSize + 2 + 'px', fontWeight: 700, borderBottom: '1px solid ' + attr.borderColor, width: '25%' }, col1IsHl ? hlStyle : { background: attr.tableHeaderBg, color: attr.featureColor }) },
                                            attr.showColIcons && el('span', { className: 'bkbg-cmp-col-icon', style: { marginRight: 6 } },
                                                (!attr.col1IconType || attr.col1IconType === 'custom-char')
                                                    ? attr.col1Icon
                                                    : IP().buildEditorIcon(attr.col1IconType, attr.col1Icon, attr.col1IconDashicon, attr.col1IconImageUrl, attr.col1IconDashiconColor)
                                            ),
                                            attr.col1Label
                                        ),
                                        el('th', { style: Object.assign({ padding: '20px 24px', fontSize: attr.textSize + 2 + 'px', fontWeight: 700, borderBottom: '1px solid ' + attr.borderColor, width: '25%' }, col2IsHl ? hlStyle : { background: attr.tableHeaderBg, color: attr.featureColor }) },
                                            attr.showColIcons && el('span', { className: 'bkbg-cmp-col-icon', style: { marginRight: 6 } },
                                                (!attr.col2IconType || attr.col2IconType === 'custom-char')
                                                    ? attr.col2Icon
                                                    : IP().buildEditorIcon(attr.col2IconType, attr.col2Icon, attr.col2IconDashicon, attr.col2IconImageUrl, attr.col2IconDashiconColor)
                                            ),
                                            attr.col2Label
                                        )
                                    )
                                ),
                                el('tbody', null,
                                    attr.rows.map(function (r, i) {
                                        var rowBg = i % 2 === 0 ? '#ffffff' : '#fafafa';
                                        return el('tr', { key: i },
                                            el('td', { style: { padding: '16px 24px', borderBottom: '1px solid ' + attr.borderColor, textAlign: 'left', fontSize: attr.textSize + 'px', color: attr.featureColor, background: rowBg } }, r.feature),
                                            el('td', { style: Object.assign({ padding: '16px 24px', textAlign: 'center', borderBottom: '1px solid ' + attr.borderColor }, col1IsHl ? { background: attr.highlightBg + '22' } : { background: rowBg }) }, statusIcon(r.col1, colors)),
                                            el('td', { style: Object.assign({ padding: '16px 24px', textAlign: 'center', borderBottom: '1px solid ' + attr.borderColor }, col2IsHl ? { background: attr.highlightBg + '22' } : { background: rowBg }) }, statusIcon(r.col2, colors))
                                        );
                                    })
                                )
                            ),
                            attr.showCta && el('div', { style: { marginTop: 48 } },
                                el('a', { href: '#', style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 36px', borderRadius: 8, fontWeight: 700, fontSize: attr.textSize + 'px', background: attr.ctaBg, color: attr.ctaColor, textDecoration: 'none' } }, attr.ctaLabel, el('span', null, '→'))
                            )
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var sv = Object.assign({}, _tv(attr.typoHeading, '--bkcs-heading-'), _tv(attr.typoBody, '--bkcs-body-'));
            return el('div', useBlockProps.save({ style: sv }),
                el('div', { className: 'bkbg-comparison-section-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
