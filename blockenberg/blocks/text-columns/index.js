( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextareaControl = wp.components.TextareaControl;
    var Fragment = wp.element.Fragment;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/text-columns', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var cols = attr.columns || [];

            /* Ensure cols array matches columnCount */
            var count = attr.columnCount;
            while (cols.length < count) { cols = cols.concat([{ content: '<p>Column text here…</p>' }]); }
            if (cols.length !== count) { cols = cols.slice(0, count); }

            function updateCol(idx, val) {
                var updated = cols.map(function (c, i) { return i === idx ? { content: val } : c; });
                set({ columns: updated });
            }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(RangeControl, { label: __('Number of Columns', 'blockenberg'), value: attr.columnCount, min: 2, max: 4, onChange: function (v) { set({ columnCount: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Column Gap (px)', 'blockenberg'), value: attr.columnGap, min: 16, max: 100, onChange: function (v) { set({ columnGap: v }); }, __nextHasNoMarginBottom: true }),
                    el(SelectControl, {
                        label: __('Text Alignment', 'blockenberg'), value: attr.textAlign,
                        options: [{ label: 'Left', value: 'left' }, { label: 'Justify', value: 'justify' }, { label: 'Center', value: 'center' }],
                        onChange: function (v) { set({ textAlign: v }); }, __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && getTypoControl()({
                        label: __('Body Text', 'blockenberg'),
                        value: attr.bodyTypo || {},
                        onChange: function (v) { set({ bodyTypo: v }); }
                    }),
                    getTypoControl() && getTypoControl()({
                        label: __('Pull Quote', 'blockenberg'),
                        value: attr.pullQuoteTypo || {},
                        onChange: function (v) { set({ pullQuoteTypo: v }); }
                    })
                ),
                el(PanelBody, { title: __('Drop Cap', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Enable Drop Cap', 'blockenberg'), checked: attr.dropCap, onChange: function (v) { set({ dropCap: v }); }, __nextHasNoMarginBottom: true }),
                    attr.dropCap && el(RangeControl, { label: __('Drop Cap Size (lines)', 'blockenberg'), value: attr.dropCapSize, min: 2, max: 5, onChange: function (v) { set({ dropCapSize: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Column Rule', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Column Rule', 'blockenberg'), checked: attr.showRule, onChange: function (v) { set({ showRule: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showRule && el(SelectControl, {
                        label: __('Rule Style', 'blockenberg'), value: attr.ruleStyle,
                        options: [{ label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }, { label: 'Double', value: 'double' }],
                        onChange: function (v) { set({ ruleStyle: v }); }, __nextHasNoMarginBottom: true
                    }),
                    attr.showRule && el(RangeControl, { label: __('Rule Width (px)', 'blockenberg'), value: attr.ruleWidth, min: 1, max: 4, onChange: function (v) { set({ ruleWidth: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Pull Quote', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Pull Quote', 'blockenberg'), checked: attr.showPullQuote, onChange: function (v) { set({ showPullQuote: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showPullQuote && el(TextareaControl, { label: __('Pull Quote Text', 'blockenberg'), value: attr.pullQuote, onChange: function (v) { set({ pullQuote: v }); }, rows: 3, __nextHasNoMarginBottom: true }),
                    attr.showPullQuote && el(SelectControl, {
                        label: __('Pull Quote Position', 'blockenberg'), value: attr.pullQuotePos,
                        options: [{ label: 'Above columns', value: 'above' }, { label: 'Between columns', value: 'between' }, { label: 'Below columns', value: 'below' }],
                        onChange: function (v) { set({ pullQuotePos: v }); }, __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 240, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 240, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: attr.bgColor,          onChange: function (v) { set({ bgColor: v || '' }); },          label: __('Background', 'blockenberg') },
                        { value: attr.textColor,        onChange: function (v) { set({ textColor: v || '#374151' }); }, label: __('Text', 'blockenberg') },
                        { value: attr.dropCapColor,     onChange: function (v) { set({ dropCapColor: v || '#111827' }); }, label: __('Drop Cap', 'blockenberg') },
                        { value: attr.ruleColor,        onChange: function (v) { set({ ruleColor: v || '#d1d5db' }); }, label: __('Column Rule', 'blockenberg') },
                        { value: attr.pullQuoteBorder,  onChange: function (v) { set({ pullQuoteBorder: v || '#6366f1' }); }, label: __('Pull Quote Border', 'blockenberg') },
                        { value: attr.pullQuoteColor,   onChange: function (v) { set({ pullQuoteColor: v || '#111827' }); }, label: __('Pull Quote Text', 'blockenberg') }
                    ]
                })
            );

            var wrapStyle = {
                background: attr.bgColor || 'transparent',
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px'
            };
            var _tvf = getTypoCssVars();
            if (_tvf) { Object.assign(wrapStyle, _tvf(attr.bodyTypo, '--bktcl-bd-'), _tvf(attr.pullQuoteTypo, '--bktcl-pq-')); }

            /* Drop cap CSS injected inline for editor preview */
            var dropCapStyle = attr.dropCap ? el('style', { key: 'dc', dangerouslySetInnerHTML: { __html: '.bkbg-tc-col:first-child p:first-child::first-letter{float:left;font-size:' + attr.dropCapSize + 'em;line-height:0.75;padding-right:0.1em;color:' + attr.dropCapColor + ';font-weight:800;margin-top:0.1em}' } }) : null;

            var colElStyle = {
                flex: '1',
                minWidth: 0,
                color: attr.textColor,
                textAlign: attr.textAlign,
                borderLeft: attr.showRule ? (attr.ruleWidth + 'px ' + attr.ruleStyle + ' ' + attr.ruleColor) : 'none',
                paddingLeft: attr.showRule ? (attr.columnGap / 2) + 'px' : '0'
            };

            var pullQuoteEl = attr.showPullQuote && attr.pullQuote ? el('blockquote', {
                className: 'bkbg-tc-pullquote',
                style: {
                    borderLeft: '4px solid ' + attr.pullQuoteBorder,
                    paddingLeft: '24px',
                    margin: '32px 0',
                    color: attr.pullQuoteColor,
                }
            }, attr.pullQuote) : null;

            var gridStyle = {
                display: 'flex',
                gap: attr.columnGap + 'px',
                alignItems: 'flex-start'
            };

            var colEls = cols.map(function (col, idx) {
                var style = Object.assign({}, colElStyle);
                if (idx === 0) { style.borderLeft = 'none'; style.paddingLeft = '0'; }
                return el('div', { key: idx, className: 'bkbg-tc-col', style: style },
                    el(RichText, {
                        tagName: 'div', multiline: 'p',
                        identifier: 'column-' + idx,
                        value: col.content,
                        onChange: function (v) { updateCol(idx, v); },
                        placeholder: __('Column text…', 'blockenberg')
                    })
                );
            });

            return el(Fragment, {},
                dropCapStyle,
                inspector,
                el('div', useBlockProps({ style: wrapStyle }),
                    attr.showPullQuote && attr.pullQuotePos === 'above' && pullQuoteEl,
                    el('div', { style: gridStyle }, colEls),
                    attr.showPullQuote && attr.pullQuotePos !== 'above' && pullQuoteEl
                )
            );
        },

        save: function (props) {
            var el2 = wp.element.createElement;
            var ubp = wp.blockEditor.useBlockProps;
            var a = props.attributes;
            var _tvf = getTypoCssVars();
            return el2('div', (function () {
                var s = {};
                if (_tvf) { Object.assign(s, _tvf(a.bodyTypo, '--bktcl-bd-'), _tvf(a.pullQuoteTypo, '--bktcl-pq-')); }
                return ubp.save({ style: s });
            })(),
                el2('div', { className: 'bkbg-tc-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
