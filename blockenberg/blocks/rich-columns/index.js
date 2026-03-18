( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var LAYOUT_OPTIONS = [
        { label: 'Cards (elevated)',  value: 'cards' },
        { label: 'Bordered',          value: 'bordered' },
        { label: 'Flat (no border)',  value: 'flat' },
        { label: 'Icon top + line',   value: 'icon-top-line' },
        { label: 'Icon left',         value: 'icon-left' },
    ];

    var COUNT_OPTIONS = [
        { label: '2 columns', value: 2 },
        { label: '3 columns', value: 3 },
        { label: '4 columns', value: 4 },
    ];

    var TAG_OPTIONS = [
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' },
        { label: 'H5', value: 'h5' },
        { label: 'p (bold)', value: 'p' },
    ];

    function updateCol(cols, idx, field, val) {
        return cols.map(function (col, i) {
            if (i !== idx) return col;
            var p = {}; p[field] = val;
            return Object.assign({}, col, p);
        });
    }

    function getCardStyle(a, col, isActive) {
        var base = {
            padding: a.cardPadding + 'px',
            borderRadius: a.cardRadius + 'px',
            boxSizing: 'border-box',
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: 'calc(' + (100 / a.columnCount) + '% - ' + ((a.columnCount - 1) * a.gap / a.columnCount) + 'px)',
            cursor: 'pointer',
            outline: isActive ? '3px solid #6366f1' : 'none',
            outlineOffset: 2,
            background: col.bgColor || (a.layout === 'flat' || a.layout === 'icon-top-line' ? 'transparent' : (a.cardBg || '#ffffff')),
        };
        if (a.layout === 'cards') {
            base.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
        } else if (a.layout === 'bordered' || a.layout === 'icon-left') {
            base.border = '1px solid ' + a.cardBorder;
        } else if (a.layout === 'icon-top-line') {
            base.borderTop = '3px solid ' + (col.accentColor || a.iconColor || '#6366f1');
            base.paddingTop = (a.cardPadding) + 'px';
        }
        return base;
    }

    function renderColumnPreview(col, i, a, activeIdx, setActiveIdx) {
        var iconLeft = a.layout === 'icon-left';

        var iconEl = a.showIcon && (col.icon || col.iconDashicon || col.iconImageUrl) && el('div', {
            style: {
                width: a.iconBgSize + 'px',
                height: a.iconBgSize + 'px',
                borderRadius: a.iconBgRadius + 'px',
                background: col.accentColor ? col.accentColor + '22' : a.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: a.iconSize + 'px',
                flexShrink: 0,
            }
        }, IP().buildEditorIcon(col.iconPickerType || 'custom-char', col.icon, col.iconDashicon, col.iconImageUrl, col.iconDashiconColor));

        var textBlock = el('div', { style: { flexGrow: 1 } },
            el(RichText, {
                tagName: a.headingTag,
                value: col.heading,
                onChange: function (v) { setActiveIdx(i); },
                onFocus: function () { setActiveIdx(i); },
                onClick: function (e) { e.stopPropagation(); setActiveIdx(i); },
                className: 'bkbg-rc-heading',
                style: { color: a.headingColor, margin: '0 0 10px' },
                placeholder: 'Column heading…',
            }),
            el(RichText, {
                tagName: 'div',
                value: col.content,
                onChange: function (v) { setActiveIdx(i); },
                onFocus: function () { setActiveIdx(i); },
                onClick: function (e) { e.stopPropagation(); setActiveIdx(i); },
                className: 'bkbg-rc-body',
                style: { color: a.textColor },
                placeholder: 'Column content…',
            }),
            a.showLink && col.linkLabel && el('span', {
                style: {
                    display: 'inline-block', marginTop: 12,
                    color: a.linkColor, fontSize: 14, fontWeight: 600, textDecoration: 'underline'
                }
            }, col.linkLabel + ' →')
        );

        return el('div', {
            key: i,
            style: getCardStyle(a, col, i === activeIdx),
            onClick: function () { setActiveIdx(i); },
        },
            iconLeft
                ? el('div', { style: { display: 'flex', gap: 16, alignItems: 'flex-start' } }, iconEl, textBlock)
                : el(Fragment, null,
                    iconEl,
                    el('div', { style: { height: 14 } }),
                    textBlock
                )
        );
    }

    registerBlockType('blockenberg/rich-columns', {
        title: __('Rich Columns', 'blockenberg'),
        icon: 'columns',
        category: 'bkbg-layout',
        description: __('Multi-column feature/benefit layout with icons, headings, rich text, and links.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var activeSt = useState(0);
            var activeIdx = activeSt[0];
            var setActiveIdx = activeSt[1];
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {
                    background: a.containerBg || '',
                    padding: a.containerPadding ? a.containerPadding + 'px' : undefined
                };
                if (_tv) {
                    Object.assign(s, _tv(a.headingTypo, '--bkrc-ht-'));
                    Object.assign(s, _tv(a.bodyTypo, '--bkrc-bt-'));
                }
                return { style: s };
            })());

            var activeCol = a.columns[activeIdx] || a.columns[0];

            function addColumn() {
                set({ columns: a.columns.concat([{ icon: '✨', iconType: 'emoji', iconPickerType: 'custom-char', iconDashicon: '', iconImageUrl: '', heading: 'New Feature', content: '<p>Describe this feature in a sentence or two that is clear and compelling.</p>', linkLabel: 'Learn more', linkUrl: '', linkNewTab: false, bgColor: '', accentColor: '' }]) });
                setActiveIdx(a.columns.length);
            }

            function removeColumn(i) {
                if (a.columns.length <= 1) return;
                set({ columns: a.columns.filter(function (_, idx) { return idx !== i; }) });
                setActiveIdx(Math.max(0, activeIdx - 1));
            }

            return el(Fragment, null,
                el(InspectorControls, null,

                    // Active column
                    el(PanelBody, { title: 'Column ' + (activeIdx + 1) + ' Content', initialOpen: true },
                        el('p', { style: { fontSize: 11, color: '#9ca3af', margin: '0 0 8px' } }, 'Click a column in the editor to select it.'),
                        el(IP().IconPickerControl, IP().iconPickerProps(activeCol, function (key, val) { set({ columns: updateCol(a.columns, activeIdx, key, val) }); }, { label: 'Icon', typeAttr: 'iconPickerType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' })),
                        el('div', { style: { height: 8 } }),
                        el(TextControl, { label: 'Heading', value: activeCol.heading, onChange: function (v) { set({ columns: updateCol(a.columns, activeIdx, 'heading', v) }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(TextControl, { label: 'Link label (optional)', value: activeCol.linkLabel, onChange: function (v) { set({ columns: updateCol(a.columns, activeIdx, 'linkLabel', v) }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(TextControl, { label: 'Link URL', value: activeCol.linkUrl, onChange: function (v) { set({ columns: updateCol(a.columns, activeIdx, 'linkUrl', v) }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Open link in new tab', checked: activeCol.linkNewTab, onChange: function (v) { set({ columns: updateCol(a.columns, activeIdx, 'linkNewTab', v) }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 12, borderTop: '1px solid #f3f4f6', marginTop: 8 } }),
                        el('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
                            a.columns.map(function (col, i) {
                                return el(Button, {
                                    key: i,
                                    variant: i === activeIdx ? 'primary' : 'secondary',
                                    size: 'small',
                                    onClick: function () { setActiveIdx(i); },
                                    __nextHasNoMarginBottom: true,
                                }, col.icon + ' ' + (i + 1));
                            }),
                            el(Button, { onClick: addColumn, variant: 'tertiary', size: 'small', __nextHasNoMarginBottom: true }, '+ Add'),
                            el(Button, { onClick: function () { removeColumn(activeIdx); }, isDestructive: true, variant: 'tertiary', size: 'small', __nextHasNoMarginBottom: true }, 'Remove')
                        )
                    ),

                    // Layout
                    el(PanelBody, { title: 'Layout', initialOpen: false },
                        el(SelectControl, { label: 'Column count', value: a.columnCount, options: COUNT_OPTIONS, onChange: function (v) { set({ columnCount: parseInt(v, 10) }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(SelectControl, { label: 'Card style', value: a.layout, options: LAYOUT_OPTIONS, onChange: function (v) { set({ layout: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Column gap (px)', value: a.gap, min: 8, max: 72, onChange: function (v) { set({ gap: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Card padding (px)', value: a.cardPadding, min: 12, max: 60, onChange: function (v) { set({ cardPadding: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Card radius (px)', value: a.cardRadius, min: 0, max: 32, onChange: function (v) { set({ cardRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Max width (px)', value: a.maxWidth, min: 400, max: 1600, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Container padding (px)', value: a.containerPadding, min: 0, max: 100, onChange: function (v) { set({ containerPadding: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(ToggleControl, { label: 'Show icon', checked: a.showIcon, onChange: function (v) { set({ showIcon: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show link', checked: a.showLink, onChange: function (v) { set({ showLink: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show dividers between columns', checked: a.showDivider, onChange: function (v) { set({ showDivider: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        el(SelectControl, { label: 'Heading tag', value: a.headingTag, options: TAG_OPTIONS, onChange: function (v) { set({ headingTag: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        (function () { var TC = getTypoControl(); return TC ? [
                            el(TC, { key: 'ht', label: 'Heading', value: a.headingTypo, onChange: function (v) { set({ headingTypo: v }); } }),
                            el(TC, { key: 'bt', label: 'Body Text', value: a.bodyTypo, onChange: function (v) { set({ bodyTypo: v }); } }),
                        ] : null; })(),
                        el(RangeControl, { label: 'Icon font size (px)', value: a.iconSize, min: 16, max: 56, onChange: function (v) { set({ iconSize: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Icon appearance
                    el(PanelBody, { title: 'Icon Appearance', initialOpen: false },
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Icon box size (px)', value: a.iconBgSize, min: 32, max: 96, onChange: function (v) { set({ iconBgSize: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Icon box radius (px)', value: a.iconBgRadius, min: 0, max: 48, onChange: function (v) { set({ iconBgRadius: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Colors
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Container Background', value: a.containerBg,  onChange: function (v) { set({ containerBg: v || '' }); } },
                            { label: 'Card Background',      value: a.cardBg,       onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                            { label: 'Card Border',          value: a.cardBorder,   onChange: function (v) { set({ cardBorder: v || '#e5e7eb' }); } },
                            { label: 'Heading Color',        value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#111827' }); } },
                            { label: 'Body Text Color',      value: a.textColor,    onChange: function (v) { set({ textColor: v || '#374151' }); } },
                            { label: 'Link Color',           value: a.linkColor,    onChange: function (v) { set({ linkColor: v || '#6366f1' }); } },
                            { label: 'Icon Background',      value: a.iconBg,       onChange: function (v) { set({ iconBg: v || '#ede9fe' }); } },
                            { label: 'Divider Color',        value: a.dividerColor, onChange: function (v) { set({ dividerColor: v || '#e5e7eb' }); } },
                        ]
                    })
                ),

                // ── Editor Preview ──
                el('div', blockProps,
                    el('div', {
                        style: {
                            maxWidth: a.maxWidth + 'px',
                            margin: '0 auto',
                            display: 'flex',
                            gap: a.gap + 'px',
                            flexWrap: 'wrap',
                            alignItems: 'stretch',
                        }
                    },
                        a.columns.map(function (col, i) {
                            return el(Fragment, { key: i },
                                i > 0 && a.showDivider && a.layout === 'flat' && el('div', {
                                    style: { width: 1, background: a.dividerColor, flexShrink: 0, alignSelf: 'stretch' }
                                }),
                                renderColumnPreview(col, i, a, activeIdx, setActiveIdx)
                            );
                        }),
                        // Add column button
                        a.columns.length < 4 && el('button', {
                            onClick: addColumn,
                            style: {
                                border: '2px dashed #d1d5db',
                                borderRadius: a.cardRadius + 'px',
                                padding: a.cardPadding + 'px',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: '#9ca3af',
                                fontSize: 13,
                                flexBasis: 'calc(' + (100 / a.columnCount) + '% - ' + ((a.columnCount - 1) * a.gap / a.columnCount) + 'px)',
                                flexShrink: 0,
                            }
                        }, '+ Add Column')
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-rc-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
