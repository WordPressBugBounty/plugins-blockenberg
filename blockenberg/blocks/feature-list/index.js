( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var Fragment = wp.element.Fragment;

    var _flTC, _flTV;
    function _tc() { return _flTC || (_flTC = window.bkbgTypographyControl); }
    function _tv() { return _flTV || (_flTV = window.bkbgTypoCssVars); }

    /* Status icon sets */
    var STATUS_ICONS = {
        'color-check': { included: '✓', 'not-included': '✗', partial: '◐', 'coming-soon': '⏱' },
        'emoji':       { included: '✅', 'not-included': '❌', partial: '🔶', 'coming-soon': '🔜' },
        'minimal':     { included: '•', 'not-included': '–', partial: '~', 'coming-soon': '…' }
    };

    function getStatusColor(status, a) {
        if (status === 'included')     return a.includedColor;
        if (status === 'not-included') return a.notIncludedColor;
        if (status === 'partial')      return a.partialColor;
        if (status === 'coming-soon')  return a.comingSoonColor;
        return a.labelColor;
    }

    function getStatusIcon(status, iconSet) {
        var icons = STATUS_ICONS[iconSet] || STATUS_ICONS['color-check'];
        return icons[status] || '•';
    }

    registerBlockType('blockenberg/feature-list', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var items = attr.items || [];

            function updateItem(idx, field, val) {
                var updated = items.map(function (it, i) {
                    if (i !== idx) return it;
                    var p = {}; p[field] = val;
                    return Object.assign({}, it, p);
                });
                set({ items: updated });
            }

            function addItem() {
                set({ items: items.concat([{ label: 'New Feature', status: 'included', description: '', badge: '', group: '' }]) });
            }

            function removeItem(idx) { set({ items: items.filter(function (_, i) { return i !== idx; }) }); }

            function moveItem(idx, dir) {
                var arr = items.slice();
                var to = idx + dir;
                if (to < 0 || to >= arr.length) return;
                var tmp = arr[idx]; arr[idx] = arr[to]; arr[to] = tmp;
                set({ items: arr });
            }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('List Style', 'blockenberg'), value: attr.listStyle,
                        options: [
                            { label: 'Bordered rows', value: 'bordered' },
                            { label: 'Striped rows', value: 'striped' },
                            { label: 'Cards', value: 'card' },
                            { label: 'Compact (no lines)', value: 'compact' }
                        ],
                        onChange: function (v) { set({ listStyle: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Icon Set', 'blockenberg'), value: attr.iconSet,
                        options: [
                            { label: 'Color check / cross', value: 'color-check' },
                            { label: 'Emoji', value: 'emoji' },
                            { label: 'Minimal (dot / dash)', value: 'minimal' }
                        ],
                        onChange: function (v) { set({ iconSet: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Icon Size (px)', 'blockenberg'), value: attr.iconSize, min: 14, max: 32, onChange: function (v) { set({ iconSize: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: attr.borderRadius, min: 0, max: 24, onChange: function (v) { set({ borderRadius: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Visibility', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Heading', 'blockenberg'), checked: attr.showHeading, onChange: function (v) { set({ showHeading: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Descriptions', 'blockenberg'), checked: attr.showDesc, onChange: function (v) { set({ showDesc: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Badges', 'blockenberg'), checked: attr.showBadge, onChange: function (v) { set({ showBadge: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show "Not Included" Items', 'blockenberg'), checked: attr.showNotIncluded, onChange: function (v) { set({ showNotIncluded: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Strike Through "Not Included"', 'blockenberg'), checked: attr.strikeNotIncluded, onChange: function (v) { set({ strikeNotIncluded: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Items', 'blockenberg'), initialOpen: true },
                    items.map(function (it, idx) {
                        return el('div', { key: idx, style: { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px', marginBottom: '10px' } },
                            el('div', { style: { display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' } },
                                el('span', { style: { fontWeight: '700', fontSize: '12px', color: getStatusColor(it.status, attr), minWidth: '16px' } }, getStatusIcon(it.status, attr.iconSet)),
                                el(SelectControl, {
                                    value: it.status,
                                    options: [
                                        { label: '✓ Included', value: 'included' },
                                        { label: '✗ Not included', value: 'not-included' },
                                        { label: '◐ Partial', value: 'partial' },
                                        { label: '⏱ Coming soon', value: 'coming-soon' }
                                    ],
                                    onChange: function (v) { updateItem(idx, 'status', v); },
                                    style: { flex: 1, margin: 0 },
                                    __nextHasNoMarginBottom: true
                                }),
                                el(Button, { onClick: function () { moveItem(idx, -1); }, isSmall: true, variant: 'tertiary', disabled: idx === 0 }, '↑'),
                                el(Button, { onClick: function () { moveItem(idx, 1); }, isSmall: true, variant: 'tertiary', disabled: idx === items.length - 1 }, '↓'),
                                el(Button, { onClick: function () { removeItem(idx); }, isSmall: true, variant: 'link', isDestructive: true }, '✕')
                            ),
                            el(TextControl, { label: __('Label', 'blockenberg'), value: it.label, onChange: function (v) { updateItem(idx, 'label', v); }, __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Description (optional)', 'blockenberg'), value: it.description, onChange: function (v) { updateItem(idx, 'description', v); }, __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Badge (optional)', 'blockenberg'), value: it.badge, onChange: function (v) { updateItem(idx, 'badge', v); }, __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Group Header (leave blank to skip)', 'blockenberg'), value: it.group, onChange: function (v) { updateItem(idx, 'group', v); }, __nextHasNoMarginBottom: true })
                        );
                    }),
                    el(Button, { onClick: addItem, variant: 'primary', isSmall: true }, __('+ Add Feature', 'blockenberg'))
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 240, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 240, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    _tc() && el(_tc(), {
                        label: __('Heading Typography', 'blockenberg'),
                        value: attr.typoHeading,
                        onChange: function (v) { set({ typoHeading: v }); }
                    }),
                    _tc() && el(_tc(), {
                        label: __('Label Typography', 'blockenberg'),
                        value: attr.typoLabel,
                        onChange: function (v) { set({ typoLabel: v }); }
                    }),
                    _tc() && el(_tc(), {
                        label: __('Description Typography', 'blockenberg'),
                        value: attr.typoDesc,
                        onChange: function (v) { set({ typoDesc: v }); }
                    })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: attr.bgColor,          onChange: function (v) { set({ bgColor: v || '' }); },          label: __('Section BG', 'blockenberg') },
                        { value: attr.itemBg,           onChange: function (v) { set({ itemBg: v || '#ffffff' }); },     label: __('Row BG', 'blockenberg') },
                        { value: attr.stripeBg,         onChange: function (v) { set({ stripeBg: v || '#f9fafb' }); },  label: __('Stripe BG', 'blockenberg') },
                        { value: attr.borderColor,      onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); }, label: __('Border', 'blockenberg') },
                        { value: attr.labelColor,       onChange: function (v) { set({ labelColor: v || '#111827' }); }, label: __('Label', 'blockenberg') },
                        { value: attr.descColor,        onChange: function (v) { set({ descColor: v || '#6b7280' }); },  label: __('Description', 'blockenberg') },
                        { value: attr.headingColor,     onChange: function (v) { set({ headingColor: v || '#111827' }); }, label: __('Heading', 'blockenberg') },
                        { value: attr.includedColor,    onChange: function (v) { set({ includedColor: v || '#10b981' }); }, label: __('Included Icon', 'blockenberg') },
                        { value: attr.notIncludedColor, onChange: function (v) { set({ notIncludedColor: v || '#d1d5db' }); }, label: __('Not Included Icon', 'blockenberg') },
                        { value: attr.partialColor,     onChange: function (v) { set({ partialColor: v || '#f59e0b' }); }, label: __('Partial Icon', 'blockenberg') },
                        { value: attr.comingSoonColor,  onChange: function (v) { set({ comingSoonColor: v || '#8b5cf6' }); }, label: __('Coming Soon Icon', 'blockenberg') },
                        { value: attr.badgeBg,          onChange: function (v) { set({ badgeBg: v || '#ede9fe' }); },    label: __('Badge BG', 'blockenberg') },
                        { value: attr.badgeColor,       onChange: function (v) { set({ badgeColor: v || '#7c3aed' }); }, label: __('Badge Text', 'blockenberg') }
                    ]
                })
            );

            /* Editor preview */
            var wrapStyle = Object.assign({
                background: attr.bgColor || 'transparent',
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px'
            }, _tv()(attr.typoHeading, '--bkbg-fl-hd-'), _tv()(attr.typoLabel, '--bkbg-fl-lb-'), _tv()(attr.typoDesc, '--bkbg-fl-ds-'));

            var listWrapStyle = {
                borderRadius: attr.listStyle === 'card' ? attr.borderRadius + 'px' : 0,
                border: attr.listStyle === 'bordered' || attr.listStyle === 'card' ? ('1px solid ' + attr.borderColor) : 'none',
                overflow: 'hidden'
            };

            var prevGroup = '';
            var rowEls = [];
            items.forEach(function (it, idx) {
                if (!attr.showNotIncluded && it.status === 'not-included') return;

                /* Group header */
                if (it.group && it.group !== prevGroup) {
                    rowEls.push(el('div', { key: 'g-' + idx, style: { padding: '8px 16px 4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: attr.descColor, background: attr.stripeBg, borderBottom: '1px solid ' + attr.borderColor } }, it.group));
                    prevGroup = it.group;
                }

                var isBordered = attr.listStyle === 'bordered' || attr.listStyle === 'card';
                var isStriped = attr.listStyle === 'striped';
                var rowBg = isStriped && idx % 2 === 1 ? attr.stripeBg : attr.itemBg;
                var iconColor = getStatusColor(it.status, attr);
                var icon = getStatusIcon(it.status, attr.iconSet);
                var isNotIncl = it.status === 'not-included';

                rowEls.push(el('div', {
                    key: idx,
                    style: {
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                        background: rowBg, borderBottom: isBordered && idx < items.length - 1 ? ('1px solid ' + attr.borderColor) : 'none',
                        marginBottom: attr.listStyle === 'card' ? '0' : (attr.gap > 0 ? attr.gap + 'px' : '0')
                    }
                },
                    el('span', { style: { color: iconColor, fontSize: attr.iconSize + 'px', flexShrink: 0, width: attr.iconSize + 'px', textAlign: 'center', fontWeight: '700' } }, icon),
                    el('div', { style: { flex: 1 } },
                        el('div', { className: 'bkbg-fl-label', style: { color: isNotIncl ? attr.notIncludedColor : attr.labelColor, textDecoration: isNotIncl && attr.strikeNotIncluded ? 'line-through' : 'none' } }, it.label),
                        attr.showDesc && it.description && el('div', { className: 'bkbg-fl-desc', style: { color: attr.descColor } }, it.description)
                    ),
                    attr.showBadge && it.badge && el('span', { style: { background: attr.badgeBg, color: attr.badgeColor, fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', flexShrink: 0 } }, it.badge)
                ));
            });

            return el(Fragment, {},
                inspector,
                el('div', useBlockProps({ className: 'bkbg-fl-wrap', style: wrapStyle }),
                    attr.showHeading && el(RichText, {
                        tagName: 'h3', className: 'bkbg-fl-heading', value: attr.heading,
                        onChange: function (v) { set({ heading: v }); },
                        placeholder: __('Heading…', 'blockenberg'),
                        style: { color: attr.headingColor, marginBottom: '20px' }
                    }),
                    el('div', { style: listWrapStyle }, rowEls)
                )
            );
        },

        save: function (props) {
            var el2 = wp.element.createElement;
            var ubp = wp.blockEditor.useBlockProps;
            return el2('div', ubp.save(),
                el2('div', { className: 'bkbg-fl-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
