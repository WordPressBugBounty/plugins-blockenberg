( function () {
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var ToggleControl = wp.components.ToggleControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    function wrapStyle(a) {
        var s = {
            '--bkbg-ifg-bg': a.bgColor,
            '--bkbg-ifg-heading-c': a.headingColor,
            '--bkbg-ifg-sub-c': a.subColor,
            '--bkbg-ifg-title-c': a.titleColor,
            '--bkbg-ifg-desc-c': a.descColor,
            '--bkbg-ifg-card-bg': a.cardBg,
            '--bkbg-ifg-card-border': a.cardBorder,
            '--bkbg-ifg-pt': a.paddingTop + 'px',
            '--bkbg-ifg-pb': a.paddingBottom + 'px',
            '--bkbg-ifg-heading-sz': a.headingSize + 'px',
            '--bkbg-ifg-heading-w': a.headingWeight,
            '--bkbg-ifg-heading-lh': a.headingLineHeight || 1.2,
            '--bkbg-ifg-sub-sz': a.subSize + 'px',
            '--bkbg-ifg-sub-w': a.subWeight || '600',
            '--bkbg-ifg-sub-lh': a.subLineHeight || 1.4,
            '--bkbg-ifg-title-sz': a.titleSize + 'px',
            '--bkbg-ifg-title-w': a.titleWeight,
            '--bkbg-ifg-title-lh': a.titleLineHeight || 1.3,
            '--bkbg-ifg-desc-sz': a.descSize + 'px',
            '--bkbg-ifg-desc-w': a.descWeight || '400',
            '--bkbg-ifg-desc-lh': a.descLineHeight || 1.6,
            '--bkbg-ifg-card-pad': a.cardPadding + 'px',
            '--bkbg-ifg-card-r': a.cardRadius + 'px',
            '--bkbg-ifg-gap': a.gap + 'px',
            '--bkbg-ifg-cols': a.columns,
            '--bkbg-ifg-icon-sz': a.iconSize + 'px',
            '--bkbg-ifg-icon-box': a.iconBoxSize + 'px',
            '--bkbg-ifg-icon-r': a.iconRadius + 'px',
            '--bkbg-ifg-icon-bg': a.iconBg || 'rgba(108,63,181,0.1)',
            '--bkbg-ifg-sect-gap': a.sectionGap + 'px',
            '--bkbg-ifg-global-accent': a.globalAccent,
        };
        var _tv = getTypoCssVars();
        if (_tv) {
            Object.assign(s, _tv(a.headingTypo, '--bkbg-ifg-hd-'));
            Object.assign(s, _tv(a.subTypo, '--bkbg-ifg-sh-'));
            Object.assign(s, _tv(a.titleTypo, '--bkbg-ifg-tt-'));
            Object.assign(s, _tv(a.descTypo, '--bkbg-ifg-ds-'));
        }
        return s;
    }

    var ICON_OPTIONS = [
        { label: 'Performance', value: 'dashicons-performance' },
        { label: 'Shield / Security', value: 'dashicons-shield-alt' },
        { label: 'Chart / Analytics', value: 'dashicons-chart-line' },
        { label: 'Groups / Team', value: 'dashicons-groups' },
        { label: 'Migrate / Integrate', value: 'dashicons-migrate' },
        { label: 'SOS / Support', value: 'dashicons-sos' },
        { label: 'Star', value: 'dashicons-star-filled' },
        { label: 'Clock / Time', value: 'dashicons-clock' },
        { label: 'Checkmark', value: 'dashicons-yes-alt' },
        { label: 'Lightbulb / Idea', value: 'dashicons-lightbulb' },
        { label: 'Settings / Gear', value: 'dashicons-admin-settings' },
        { label: 'Globe / World', value: 'dashicons-admin-site-alt3' },
        { label: 'Lock', value: 'dashicons-lock' },
        { label: 'Edit / Pencil', value: 'dashicons-edit' },
        { label: 'Heart', value: 'dashicons-heart' },
        { label: 'Rocket / Launch', value: 'dashicons-rocket' },
        { label: 'Tag / Pricing', value: 'dashicons-tag' },
        { label: 'Email', value: 'dashicons-email-alt' },
        { label: 'Plugin / Puzzle', value: 'dashicons-plugins-checked' },
        { label: 'Search', value: 'dashicons-search' },
    ];

    registerBlockType('blockenberg/icon-feature-grid', {
        title: __('Icon Feature Grid', 'blockenberg'),
        icon: 'grid-view',
        category: 'bkbg-marketing',

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var editingState = useState(null);
            var editing = editingState[0];
            var setEditing = editingState[1];

            var styleOptions = [
                { label: __('Card (shadow)', 'blockenberg'), value: 'card' },
                { label: __('Bordered', 'blockenberg'), value: 'bordered' },
                { label: __('Minimal (no border)', 'blockenberg'), value: 'minimal' },
                { label: __('Gradient backgrounds', 'blockenberg'), value: 'gradient' },
                { label: __('Dark', 'blockenberg'), value: 'dark' },
            ];
            var iconStyleOptions = [
                { label: __('Circle', 'blockenberg'), value: 'circle' },
                { label: __('Square (rounded)', 'blockenberg'), value: 'square' },
                { label: __('Plain (no box)', 'blockenberg'), value: 'plain' },
                { label: __('Outline circle', 'blockenberg'), value: 'outline' },
            ];
            var columnsOptions = [
                { label: '2', value: 2 }, { label: '3', value: 3 },
                { label: '4', value: 4 }, { label: '5', value: 5 }, { label: '6', value: 6 }
            ];
            var alignOptions = [
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
            ];

            function updateItem(i, key, val) {
                var ns = a.items.slice();
                ns[i] = Object.assign({}, ns[i]);
                ns[i][key] = val;
                set({ items: ns });
            }
            function addItem() {
                var colors = ['#6c3fb5','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899'];
                var ns = a.items.concat([{
                    icon: 'dashicons-star-filled',
                    title: __('Feature Title', 'blockenberg'),
                    description: __('Describe this feature briefly.', 'blockenberg'),
                    accentColor: colors[a.items.length % colors.length]
                }]);
                set({ items: ns });
                setEditing(ns.length - 1);
            }
            function removeItem(i) {
                set({ items: a.items.filter(function (_, idx) { return idx !== i; }) });
                if (editing === i) setEditing(null);
            }
            function moveItem(i, dir) {
                var ni = i + dir;
                if (ni < 0 || ni >= a.items.length) return;
                var ns = a.items.slice();
                var tmp = ns[i]; ns[i] = ns[ni]; ns[ni] = tmp;
                set({ items: ns });
            }

            function getAccent(item) {
                return a.useItemAccent ? (item.accentColor || a.globalAccent) : a.globalAccent;
            }

            function renderCard(item, i) {
                var accent = getAccent(item);
                var iconBoxStyle = {};
                if (a.iconStyle !== 'plain') {
                    iconBoxStyle.background = a.iconBg || ('rgba(108,63,181,0.10)');
                    iconBoxStyle.background = accent.startsWith('#') ? accent + '18' : accent;
                }
                if (a.iconStyle === 'outline') {
                    iconBoxStyle.background = 'transparent';
                    iconBoxStyle.border = '2px solid ' + accent;
                }

                return el('div', { key: i, className: 'bkbg-ifg-card bkbg-ifg-icon-style--' + a.iconStyle },
                    el('div', { className: 'bkbg-ifg-icon-wrap', style: iconBoxStyle },
                        el('span', { className: 'dashicons ' + item.icon, style: { fontSize: a.iconSize + 'px', width: a.iconSize + 'px', height: a.iconSize + 'px', color: accent } })
                    ),
                    el(RichText, {
                        tagName: 'h3',
                        className: 'bkbg-ifg-title',
                        value: item.title,
                        onChange: function (v) { updateItem(i, 'title', v); },
                        placeholder: __('Feature title', 'blockenberg'),
                        allowedFormats: ['core/bold']
                    }),
                    el(RichText, {
                        tagName: 'p',
                        className: 'bkbg-ifg-desc',
                        value: item.description,
                        onChange: function (v) { updateItem(i, 'description', v); },
                        placeholder: __('Feature description', 'blockenberg'),
                        allowedFormats: ['core/bold', 'core/italic']
                    })
                );
            }

            var blockProps = useBlockProps({
                className: 'bkbg-ifg-wrap bkbg-ifg-style--' + a.style + ' bkbg-ifg-heading-align--' + a.headingAlign,
                style: wrapStyle(a)
            });

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Section Header', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Heading', 'blockenberg'),
                        checked: a.showHeading,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showHeading: v }); }
                    }),
                    a.showHeading && el(TextControl, {
                        label: __('Heading', 'blockenberg'),
                        value: a.heading,
                        onChange: function (v) { set({ heading: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Subheading', 'blockenberg'),
                        checked: a.showSubheading,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSubheading: v }); }
                    }),
                    a.showSubheading && el(TextControl, {
                        label: __('Subheading', 'blockenberg'),
                        value: a.subheading,
                        onChange: function (v) { set({ subheading: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Heading Alignment', 'blockenberg'),
                        value: a.headingAlign,
                        options: alignOptions,
                        onChange: function (v) { set({ headingAlign: v }); }
                    })
                ),
                el(PanelBody, { title: __('Grid & Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Card Style', 'blockenberg'),
                        value: a.style,
                        options: styleOptions,
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Columns', 'blockenberg'),
                        value: a.columns,
                        options: columnsOptions,
                        onChange: function (v) { set({ columns: parseInt(v) }); }
                    }),
                    el(RangeControl, {
                        label: __('Card Padding (px)', 'blockenberg'),
                        value: a.cardPadding,
                        onChange: function (v) { set({ cardPadding: v }); },
                        min: 12, max: 56
                    }),
                    el(RangeControl, {
                        label: __('Card Radius (px)', 'blockenberg'),
                        value: a.cardRadius,
                        onChange: function (v) { set({ cardRadius: v }); },
                        min: 0, max: 32
                    }),
                    el(RangeControl, {
                        label: __('Grid Gap (px)', 'blockenberg'),
                        value: a.gap,
                        onChange: function (v) { set({ gap: v }); },
                        min: 8, max: 60
                    }),
                    el(RangeControl, {
                        label: __('Section-to-Grid Gap (px)', 'blockenberg'),
                        value: a.sectionGap,
                        onChange: function (v) { set({ sectionGap: v }); },
                        min: 16, max: 96
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: a.paddingTop,
                        onChange: function (v) { set({ paddingTop: v }); },
                        min: 0, max: 180
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: a.paddingBottom,
                        onChange: function (v) { set({ paddingBottom: v }); },
                        min: 0, max: 180
                    })
                ),
                el(PanelBody, { title: __('Icon Settings', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Icon Box Style', 'blockenberg'),
                        value: a.iconStyle,
                        options: iconStyleOptions,
                        onChange: function (v) { set({ iconStyle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Use Per-Item Accent Color', 'blockenberg'),
                        checked: a.useItemAccent,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ useItemAccent: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Icon Size (px)', 'blockenberg'),
                        value: a.iconSize,
                        onChange: function (v) { set({ iconSize: v }); },
                        min: 14, max: 48
                    }),
                    el(RangeControl, {
                        label: __('Icon Box Size (px)', 'blockenberg'),
                        value: a.iconBoxSize,
                        onChange: function (v) { set({ iconBoxSize: v }); },
                        min: 28, max: 96
                    }),
                    el(RangeControl, {
                        label: __('Icon Box Radius (px)', 'blockenberg'),
                        value: a.iconRadius,
                        onChange: function (v) { set({ iconRadius: v }); },
                        min: 0, max: 50
                    })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypographyControl() && el(getTypographyControl(), { label: __('Heading', 'blockenberg'), typo: a.headingTypo || {}, onChange: function (v) { set({ headingTypo: v }); } }),
                    getTypographyControl() && el(getTypographyControl(), { label: __('Subheading', 'blockenberg'), typo: a.subTypo || {}, onChange: function (v) { set({ subTypo: v }); } }),
                    getTypographyControl() && el(getTypographyControl(), { label: __('Feature Title', 'blockenberg'), typo: a.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } }),
                    getTypographyControl() && el(getTypographyControl(), { label: __('Description', 'blockenberg'), typo: a.descTypo || {}, onChange: function (v) { set({ descTypo: v }); } })
                ),
                el(PanelBody, { title: __('Feature Items', 'blockenberg') + ' (' + a.items.length + ')', initialOpen: false },
                    a.items.map(function (item, i) {
                        var isEdit = editing === i;
                        return el('div', {
                            key: i,
                            style: { marginBottom: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }
                        },
                            el('div', {
                                style: { padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: isEdit ? '#f8f0ff' : '#f8fafc' },
                                onClick: function () { setEditing(isEdit ? null : i); }
                            },
                                el('span', { className: 'dashicons ' + item.icon, style: { fontSize: '16px', width: '16px', height: '16px', color: item.accentColor || a.globalAccent } }),
                                el('span', { style: { flex: 1, fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.title || __('(untitled)', 'blockenberg')),
                                el('span', { style: { color: '#94a3b8' } }, isEdit ? '▲' : '▼')
                            ),
                            isEdit && el('div', { style: { padding: '12px' } },
                                el(SelectControl, {
                                    label: __('Dashicon', 'blockenberg'),
                                    value: item.icon,
                                    options: ICON_OPTIONS,
                                    onChange: function (v) { updateItem(i, 'icon', v); }
                                }),
                                el(TextControl, {
                                    label: __('Title', 'blockenberg'),
                                    value: item.title,
                                    onChange: function (v) { updateItem(i, 'title', v); }
                                }),
                                el(TextControl, {
                                    label: __('Description', 'blockenberg'),
                                    value: item.description,
                                    onChange: function (v) { updateItem(i, 'description', v); }
                                }),
                                a.useItemAccent && el('div', { style: { marginBottom: '12px' } },
                                    el('label', { style: { display:'block', fontSize:'11px', fontWeight:'600', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'.05em' } }, __('Accent Color', 'blockenberg')),
                                    el('input', {
                                        type: 'color',
                                        value: item.accentColor || a.globalAccent,
                                        onChange: function (e) { updateItem(i, 'accentColor', e.target.value); },
                                        style: { width: '48px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer' }
                                    })
                                ),
                                el('div', { style: { display: 'flex', gap: '6px', marginTop: '6px' } },
                                    el(Button, { onClick: function () { moveItem(i, -1); }, variant: 'secondary', isSmall: true, disabled: i === 0 }, '↑'),
                                    el(Button, { onClick: function () { moveItem(i, 1); }, variant: 'secondary', isSmall: true, disabled: i === a.items.length - 1 }, '↓'),
                                    el(Button, { onClick: function () { removeItem(i); }, variant: 'tertiary', isDestructive: true, isSmall: true }, __('Remove', 'blockenberg'))
                                )
                            )
                        );
                    }),
                    el(Button, {
                        onClick: addItem,
                        variant: 'primary',
                        isSmall: true,
                        style: { marginTop: '8px', width: '100%', justifyContent: 'center' }
                    }, __('+ Add Feature', 'blockenberg'))
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Section Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: __('Global Accent Color', 'blockenberg'), value: a.globalAccent, onChange: function (v) { set({ globalAccent: v || '#6c3fb5' }); } },
                        { label: __('Heading', 'blockenberg'), value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#0f172a' }); } },
                        { label: __('Subheading', 'blockenberg'), value: a.subColor, onChange: function (v) { set({ subColor: v || '#64748b' }); } },
                        { label: __('Feature Title', 'blockenberg'), value: a.titleColor, onChange: function (v) { set({ titleColor: v || '#0f172a' }); } },
                        { label: __('Description', 'blockenberg'), value: a.descColor, onChange: function (v) { set({ descColor: v || '#475569' }); } },
                        { label: __('Card Background', 'blockenberg'), value: a.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                        { label: __('Card Border', 'blockenberg'), value: a.cardBorder, onChange: function (v) { set({ cardBorder: v || '#e2e8f0' }); } },
                    ]
                })
            );

            return el('div', {},
                inspector,
                el('div', blockProps,
                    (a.showHeading || a.showSubheading) && el('div', { className: 'bkbg-ifg-header' },
                        a.showHeading && el('h2', { className: 'bkbg-ifg-heading' }, a.heading),
                        a.showSubheading && el('p', { className: 'bkbg-ifg-sub' }, a.subheading)
                    ),
                    el('div', { className: 'bkbg-ifg-grid' },
                        a.items.map(function (item, i) { return renderCard(item, i); })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save({
                className: 'bkbg-ifg-wrap bkbg-ifg-style--' + a.style + ' bkbg-ifg-heading-align--' + a.headingAlign,
                style: wrapStyle(a)
            });

            function getAccent(item) {
                return a.useItemAccent ? (item.accentColor || a.globalAccent) : a.globalAccent;
            }

            function saveIconBoxStyle(item) {
                var accent = getAccent(item);
                if (a.iconStyle === 'plain') return {};
                if (a.iconStyle === 'outline') return { background: 'transparent', border: '2px solid ' + accent };
                return { background: accent + '18' };
            }

            return el('div', blockProps,
                (a.showHeading || a.showSubheading) && el('div', { className: 'bkbg-ifg-header' },
                    a.showHeading && el('h2', { className: 'bkbg-ifg-heading' }, a.heading),
                    a.showSubheading && el('p', { className: 'bkbg-ifg-sub' }, a.subheading)
                ),
                el('div', { className: 'bkbg-ifg-grid' },
                    a.items.map(function (item, i) {
                        var accent = getAccent(item);
                        return el('div', { key: i, className: 'bkbg-ifg-card bkbg-ifg-icon-style--' + a.iconStyle },
                            el('div', { className: 'bkbg-ifg-icon-wrap', style: saveIconBoxStyle(item) },
                                el('span', { className: 'dashicons ' + item.icon, style: { fontSize: a.iconSize + 'px', width: a.iconSize + 'px', height: a.iconSize + 'px', color: accent } })
                            ),
                            el(RichText.Content, { tagName: 'h3', className: 'bkbg-ifg-title', value: item.title }),
                            el(RichText.Content, { tagName: 'p', className: 'bkbg-ifg-desc', value: item.description })
                        );
                    })
                )
            );
        }
    });
}() );
