( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
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

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    registerBlockType('blockenberg/comparison-checklist', {
        title: __('Comparison Checklist', 'blockenberg'),
        icon: 'yes-alt',
        category: 'bkbg-marketing',

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            // -- helpers --
            function wrapStyle(a) {
                return Object.assign({
                    '--bkbg-cc-col-a': a.colAColor,
                    '--bkbg-cc-col-b': a.colBColor,
                    '--bkbg-cc-check': a.checkColor,
                    '--bkbg-cc-cross': a.crossColor,
                    '--bkbg-cc-bg': a.bgColor,
                    '--bkbg-cc-text': a.textColor,
                    '--bkbg-cc-border': a.borderColor,
                    '--bkbg-cc-row-alt': a.rowBgAlt,
                    '--bkbg-cc-font-sz': a.fontSize + 'px',
                    '--bkbg-cc-font-w': a.fontWeight,
                    '--bkbg-cc-icon-sz': a.iconSize + 'px',
                    '--bkbg-cc-head-sz': a.headerSize + 'px',
                    '--bkbg-cc-head-w': a.headerWeight,
                    '--bkbg-cc-radius': a.borderRadius + 'px',
                    '--bkbg-cc-pad': a.cardPadding + 'px',
                    '--bkbg-cc-row-pad': a.rowPadding + 'px',
                    '--bkbg-cc-heading-c': a.headingColor,
                    '--bkbg-cc-heading-sz': a.headingSize + 'px',
                    '--bkbg-cc-pt': a.paddingTop + 'px',
                    '--bkbg-cc-pb': a.paddingBottom + 'px',
                    '--bkbg-cc-line-h': a.lineHeight,
                }, _tv(a.typoHeading, '--bkcc-heading-'), _tv(a.typoRow, '--bkcc-row-'), _tv(a.typoHeader, '--bkcc-header-'));
            }

            function iconEl(yes) {
                return el('span', {
                    className: 'dashicons ' + (yes ? 'dashicons-yes-alt bkbg-cc-icon--yes' : 'dashicons-dismiss bkbg-cc-icon--no')
                });
            }

            function updateItem(index, key, value) {
                var arr = a.items.slice();
                arr[index] = Object.assign({}, arr[index]);
                arr[index][key] = value;
                set({ items: arr });
            }

            function addItem() {
                set({ items: a.items.concat([{ text: __('New benefit or comparison point', 'blockenberg'), colA: true, colB: false }]) });
            }

            function removeItem(idx) {
                set({ items: a.items.filter(function (_, i) { return i !== idx; }) });
            }

            function moveItem(idx, dir) {
                var ni = idx + dir;
                if (ni < 0 || ni >= a.items.length) return;
                var arr = a.items.slice();
                var tmp = arr[idx]; arr[idx] = arr[ni]; arr[ni] = tmp;
                set({ items: arr });
            }

            var styleOptions = [
                { label: __('Split Cards', 'blockenberg'), value: 'split' },
                { label: __('Single Card', 'blockenberg'), value: 'single' },
                { label: __('Minimal', 'blockenberg'), value: 'minimal' },
                { label: __('Dark', 'blockenberg'), value: 'dark' },
            ];

            var weightOptions = [
                { label: '400', value: 400 }, { label: '500', value: 500 },
                { label: '600', value: 600 }, { label: '700', value: 700 }
            ];

            // -- inspector --
            var inspector = el(InspectorControls, {},

                el(PanelBody, { title: __('Column Headings', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Column Headers', 'blockenberg'),
                        checked: a.showHeader,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showHeader: v }); }
                    }),
                    el(TextControl, { label: __('Column A Title', 'blockenberg'), value: a.colATitle, onChange: function (v) { set({ colATitle: v }); } }),
                    el(TextControl, { label: __('Column B Title', 'blockenberg'), value: a.colBTitle, onChange: function (v) { set({ colBTitle: v }); } })
                ),

                el(PanelBody, { title: __('Heading', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Heading', 'blockenberg'),
                        checked: a.showHeading,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showHeading: v }); }
                    }),
                    a.showHeading && el(TextControl, { label: __('Heading Text', 'blockenberg'), value: a.headingText, onChange: function (v) { set({ headingText: v }); } }),
                    a.showHeading && el(SelectControl, {
                        label: __('Heading Align', 'blockenberg'), value: a.headingAlign,
                        options: [
                            { label: __('Left', 'blockenberg'), value: 'left' },
                            { label: __('Center', 'blockenberg'), value: 'center' }
                        ],
                        onChange: function (v) { set({ headingAlign: v }); }
                    })
                ),

                el(PanelBody, { title: __('Style & Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'), value: a.style,
                        options: styleOptions,
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Alternating Row Background', 'blockenberg'),
                        checked: a.rowAlternate,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ rowAlternate: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Icons', 'blockenberg'),
                        checked: a.showIcons,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showIcons: v }); }
                    }),
                    el(RangeControl, { label: __('Icon Size', 'blockenberg'), value: a.iconSize, onChange: function (v) { set({ iconSize: v }); }, min: 12, max: 32 }),
                    el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: a.borderRadius, onChange: function (v) { set({ borderRadius: v }); }, min: 0, max: 32 }),
                    el(RangeControl, { label: __('Card Padding', 'blockenberg'), value: a.cardPadding, onChange: function (v) { set({ cardPadding: v }); }, min: 8, max: 64 }),
                    el(RangeControl, { label: __('Row Padding', 'blockenberg'), value: a.rowPadding, onChange: function (v) { set({ rowPadding: v }); }, min: 4, max: 32 }),
                    el(RangeControl, { label: __('Column Gap', 'blockenberg'), value: a.gap, onChange: function (v) { set({ gap: v }); }, min: 4, max: 48 })
                ),

                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, onChange: function (v) { set({ paddingTop: v }); }, min: 0, max: 200 }),
                    el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, onChange: function (v) { set({ paddingBottom: v }); }, min: 0, max: 200 })
                ),

                el(PanelBody, { title: __('Comparison Items', 'blockenberg'), initialOpen: false },
                    a.items.map(function (item, idx) {
                        return el('div', { key: idx, className: 'bkbg-cc-item-ctrl' },
                            el('div', { className: 'bkbg-cc-item-head' },
                                el('small', { style: { fontWeight: 600 } }, __('Row', 'blockenberg') + ' ' + (idx + 1)),
                                el('div', { className: 'bkbg-cc-item-actions' },
                                    el(Button, { icon: 'arrow-up-alt2', size: 'small', disabled: idx === 0, onClick: function () { moveItem(idx, -1); } }),
                                    el(Button, { icon: 'arrow-down-alt2', size: 'small', disabled: idx === a.items.length - 1, onClick: function () { moveItem(idx, 1); } }),
                                    el(Button, { icon: 'trash', size: 'small', isDestructive: true, onClick: function () { removeItem(idx); } })
                                )
                            ),
                            el(TextControl, {
                                label: __('Row text', 'blockenberg'), value: item.text,
                                onChange: function (v) { updateItem(idx, 'text', v); }
                            }),
                            el('div', { style: { display: 'flex', gap: 16, marginBottom: 12 } },
                                el(ToggleControl, {
                                    label: a.colATitle || 'Col A',
                                    checked: item.colA, __nextHasNoMarginBottom: true,
                                    onChange: function (v) { updateItem(idx, 'colA', v); }
                                }),
                                el(ToggleControl, {
                                    label: a.colBTitle || 'Col B',
                                    checked: item.colB, __nextHasNoMarginBottom: true,
                                    onChange: function (v) { updateItem(idx, 'colB', v); }
                                })
                            )
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: addItem }, __('+ Add Row', 'blockenberg'))
                ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Heading Typography', 'blockenberg'), value: a.typoHeading, onChange: function (v) { set({ typoHeading: v }); } }),
                    el(getTypographyControl(), { label: __('Row Typography', 'blockenberg'), value: a.typoRow, onChange: function (v) { set({ typoRow: v }); } }),
                    el(getTypographyControl(), { label: __('Header Typography', 'blockenberg'), value: a.typoHeader, onChange: function (v) { set({ typoHeader: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: a.colAColor, onChange: function (v) { set({ colAColor: v || '#6c3fb5' }); }, label: __('Column A Accent', 'blockenberg') },
                        { value: a.colBColor, onChange: function (v) { set({ colBColor: v || '#ef4444' }); }, label: __('Column B Accent', 'blockenberg') },
                        { value: a.checkColor, onChange: function (v) { set({ checkColor: v || '#22c55e' }); }, label: __('Check Icon Color', 'blockenberg') },
                        { value: a.crossColor, onChange: function (v) { set({ crossColor: v || '#ef4444' }); }, label: __('Cross Icon Color', 'blockenberg') },
                        { value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); }, label: __('Background', 'blockenberg') },
                        { value: a.textColor, onChange: function (v) { set({ textColor: v || '#1e293b' }); }, label: __('Text Color', 'blockenberg') },
                        { value: a.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); }, label: __('Border Color', 'blockenberg') },
                        { value: a.rowBgAlt, onChange: function (v) { set({ rowBgAlt: v || '#f8fafc' }); }, label: __('Alternate Row Color', 'blockenberg') },
                        { value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#0f172a' }); }, label: __('Heading Color', 'blockenberg') },
                    ]
                })
            );

            // -- render canvas --
            var blockProps = useBlockProps({ className: 'bkbg-cc-wrap bkbg-cc-style--' + a.style, style: wrapStyle(a) });

            function renderTable() {
                return el('div', { className: 'bkbg-cc-table' },
                    // Header row
                    a.showHeader && el('div', { className: 'bkbg-cc-header-row' },
                        el('div', { className: 'bkbg-cc-header-text' }),
                        el('div', { className: 'bkbg-cc-header-col bkbg-cc-header-col--a' },
                            el('span', { className: 'bkbg-cc-col-title bkbg-cc-col-title--a' }, a.colATitle)
                        ),
                        el('div', { className: 'bkbg-cc-header-col bkbg-cc-header-col--b' },
                            el('span', { className: 'bkbg-cc-col-title bkbg-cc-col-title--b' }, a.colBTitle)
                        )
                    ),
                    // Rows
                    a.items.map(function (item, idx) {
                        var isAlt = a.rowAlternate && idx % 2 === 1;
                        return el('div', {
                            key: idx,
                            className: 'bkbg-cc-row' + (isAlt ? ' bkbg-cc-row--alt' : '')
                        },
                            el('div', { className: 'bkbg-cc-row-text' }, item.text),
                            el('div', { className: 'bkbg-cc-row-cell bkbg-cc-row-cell--a' },
                                a.showIcons ? iconEl(item.colA) : el('span', {}, item.colA ? '✓' : '—')
                            ),
                            el('div', { className: 'bkbg-cc-row-cell bkbg-cc-row-cell--b' },
                                a.showIcons ? iconEl(item.colB) : el('span', {}, item.colB ? '✓' : '—')
                            )
                        );
                    })
                );
            }

            return el('div', blockProps,
                inspector,
                a.showHeading && a.headingText && el('h2', {
                    className: 'bkbg-cc-heading',
                    style: { textAlign: a.headingAlign }
                }, a.headingText),
                renderTable()
            );
        },

        save: function (props) {
            var a = props.attributes;
            var el = wp.element.createElement;

            function wrapStyle(a) {
                return Object.assign({
                    '--bkbg-cc-col-a': a.colAColor,
                    '--bkbg-cc-col-b': a.colBColor,
                    '--bkbg-cc-check': a.checkColor,
                    '--bkbg-cc-cross': a.crossColor,
                    '--bkbg-cc-bg': a.bgColor,
                    '--bkbg-cc-text': a.textColor,
                    '--bkbg-cc-border': a.borderColor,
                    '--bkbg-cc-row-alt': a.rowBgAlt,
                    '--bkbg-cc-font-sz': a.fontSize + 'px',
                    '--bkbg-cc-font-w': a.fontWeight,
                    '--bkbg-cc-icon-sz': a.iconSize + 'px',
                    '--bkbg-cc-head-sz': a.headerSize + 'px',
                    '--bkbg-cc-head-w': a.headerWeight,
                    '--bkbg-cc-radius': a.borderRadius + 'px',
                    '--bkbg-cc-pad': a.cardPadding + 'px',
                    '--bkbg-cc-row-pad': a.rowPadding + 'px',
                    '--bkbg-cc-heading-c': a.headingColor,
                    '--bkbg-cc-heading-sz': a.headingSize + 'px',
                    '--bkbg-cc-pt': a.paddingTop + 'px',
                    '--bkbg-cc-pb': a.paddingBottom + 'px',
                    '--bkbg-cc-line-h': a.lineHeight,
                }, _tv(a.typoHeading, '--bkcc-heading-'), _tv(a.typoRow, '--bkcc-row-'), _tv(a.typoHeader, '--bkcc-header-'));
            }

            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-cc-wrap bkbg-cc-style--' + a.style,
                style: wrapStyle(a)
            });

            function iconEl(yes) {
                return el('span', {
                    className: 'dashicons ' + (yes ? 'dashicons-yes-alt bkbg-cc-icon--yes' : 'dashicons-dismiss bkbg-cc-icon--no')
                });
            }

            return el('div', blockProps,
                a.showHeading && a.headingText && el('h2', {
                    className: 'bkbg-cc-heading',
                    style: { textAlign: a.headingAlign }
                }, a.headingText),
                el('div', { className: 'bkbg-cc-table' },
                    a.showHeader && el('div', { className: 'bkbg-cc-header-row' },
                        el('div', { className: 'bkbg-cc-header-text' }),
                        el('div', { className: 'bkbg-cc-header-col bkbg-cc-header-col--a' },
                            el('span', { className: 'bkbg-cc-col-title bkbg-cc-col-title--a' }, a.colATitle)
                        ),
                        el('div', { className: 'bkbg-cc-header-col bkbg-cc-header-col--b' },
                            el('span', { className: 'bkbg-cc-col-title bkbg-cc-col-title--b' }, a.colBTitle)
                        )
                    ),
                    a.items.map(function (item, idx) {
                        var isAlt = a.rowAlternate && idx % 2 === 1;
                        return el('div', {
                            key: idx,
                            className: 'bkbg-cc-row' + (isAlt ? ' bkbg-cc-row--alt' : '')
                        },
                            el('div', { className: 'bkbg-cc-row-text' }, item.text),
                            el('div', { className: 'bkbg-cc-row-cell bkbg-cc-row-cell--a' },
                                a.showIcons ? iconEl(item.colA) : el('span', {}, item.colA ? '✓' : '—')
                            ),
                            el('div', { className: 'bkbg-cc-row-cell bkbg-cc-row-cell--b' },
                                a.showIcons ? iconEl(item.colB) : el('span', {}, item.colB ? '✓' : '—')
                            )
                        );
                    })
                )
            );
        }
    });
}() );
