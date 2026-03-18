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

    var _tc, _tvf;
    Object.defineProperty(window, '_bkbgTypoCtrlCache', { get: function () { if (!_tc) { _tc = window.bkbgTypographyControl; } return _tc; } });
    Object.defineProperty(window, '_bkbgTypoVarsCache', { get: function () { if (!_tvf) { _tvf = window.bkbgTypoCssVars; } return _tvf; } });
    function getTypoControl(props, attrName, label) { return window._bkbgTypoCtrlCache(props, attrName, label); }

    var _IP;
    function IP() { return _IP || (_IP = window.bkbgIconPicker); }

    var STYLE_OPTIONS = [
        { value: 'highlight', label: 'Highlight (accent fill)' },
        { value: 'minimal',   label: 'Minimal (clean border)' },
        { value: 'card',      label: 'Card (shadow)' },
        { value: 'sidebar',   label: 'Sidebar (left stripe)' }
    ];

    registerBlockType('blockenberg/tldr-box', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var points = attr.points || [{ text: '' }];

            var blockProps = (function () {
                var s = { paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' };
                var tv = Object.assign({}, window._bkbgTypoVarsCache(attr.headingTypo, '--bktldr-ht-'), window._bkbgTypoVarsCache(attr.summaryTypo, '--bktldr-st-'));
                for (var k in tv) s[k] = tv[k];
                return useBlockProps({ style: s });
            }());

            function updatePoint(idx, val) {
                set({ points: points.map(function (p, i) { return i === idx ? { text: val } : p; }) });
            }

            var wrapStyle = {
                background: attr.bgColor,
                borderRadius: attr.borderRadius + 'px',
                overflow: 'hidden',
                position: 'relative'
            };
            if (attr.style === 'highlight') {
                wrapStyle.border = '1px solid ' + attr.borderColor;
                wrapStyle.padding = '18px 22px';
            } else if (attr.style === 'minimal') {
                wrapStyle.border = '1px solid ' + attr.borderColor;
                wrapStyle.padding = '18px 22px';
                wrapStyle.background = 'transparent';
            } else if (attr.style === 'card') {
                wrapStyle.border = '1px solid ' + attr.borderColor;
                wrapStyle.padding = '20px 24px';
                wrapStyle.boxShadow = '0 4px 14px rgba(0,0,0,0.08)';
            } else if (attr.style === 'sidebar') {
                wrapStyle.borderLeft = '5px solid ' + attr.accentColor;
                wrapStyle.borderTop = '1px solid ' + attr.borderColor;
                wrapStyle.borderRight = '1px solid ' + attr.borderColor;
                wrapStyle.borderBottom = '1px solid ' + attr.borderColor;
                wrapStyle.padding = '18px 22px';
            }

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Icon', 'blockenberg'), checked: attr.showIcon, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showIcon: v }); } }),
                    attr.showIcon && el('div', { style: { marginTop: '8px' } },
                        el(IP().IconPickerControl, IP().iconPickerProps(attr, set, { charAttr: 'headingIcon' }))
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Heading Text', 'blockenberg'), value: attr.heading, __nextHasNoMarginBottom: true, onChange: function (v) { set({ heading: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Bullet Points', 'blockenberg'), checked: attr.showPoints, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showPoints: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Read Time', 'blockenberg'), checked: attr.showReadTime, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showReadTime: v }); } })
                    ),
                    attr.showReadTime && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Read Time', 'blockenberg'), value: attr.readTime, placeholder: '8 min read', __nextHasNoMarginBottom: true, onChange: function (v) { set({ readTime: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Expandable (show/hide toggle)', 'blockenberg'), checked: attr.expandable, __nextHasNoMarginBottom: true, onChange: function (v) { set({ expandable: v }); } })
                    ),
                    attr.expandable && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Collapse Label', 'blockenberg'), value: attr.collapseLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ collapseLabel: v }); } })
                    ),
                    attr.expandable && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Expand Label', 'blockenberg'), value: attr.expandLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ expandLabel: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Style & Spacing', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Style', 'blockenberg'), value: attr.style, options: STYLE_OPTIONS, __nextHasNoMarginBottom: true, onChange: function (v) { set({ style: v }); } }),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 30, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl(props, 'headingTypo', __('Heading', 'blockenberg')),
                    getTypoControl(props, 'summaryTypo', __('Summary', 'blockenberg'))
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#fef9c3' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#fde047' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#ca8a04' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { set({ headingColor: v || '#713f12' }); } },
                        { label: __('Icon', 'blockenberg'), value: attr.iconColor, onChange: function (v) { set({ iconColor: v || '#ca8a04' }); } },
                        { label: __('Summary', 'blockenberg'), value: attr.summaryColor, onChange: function (v) { set({ summaryColor: v || '#1c1917' }); } },
                        { label: __('Bullet Points', 'blockenberg'), value: attr.pointColor, onChange: function (v) { set({ pointColor: v || '#292524' }); } },
                        { label: __('Meta / Read Time', 'blockenberg'), value: attr.metaColor, onChange: function (v) { set({ metaColor: v || '#a8a29e' }); } }
                    ]
                })
            );

            /* header row */
            var headerRow = el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' } },
                attr.showIcon && IP().buildEditorIcon(attr.iconType, attr.headingIcon, attr.iconDashicon, attr.iconImageUrl, { dashiconColor: attr.iconDashiconColor, style: { fontSize: '20px', lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: attr.iconColor } }),
                el('span', { className: 'bkbg-tldr-heading', style: { color: attr.headingColor } }, attr.heading),
                attr.showReadTime && attr.readTime && el('span', { style: { marginLeft: 'auto', fontSize: '12px', color: attr.metaColor, fontWeight: 500 } }, attr.readTime)
            );

            /* summary */
            var summaryEl = el(RichText, {
                tagName: 'p', value: attr.summary, className: 'bkbg-tldr-summary',
                allowedFormats: ['core/bold', 'core/italic', 'core/link'],
                placeholder: __('One or two sentence summary of the article…', 'blockenberg'),
                style: { color: attr.summaryColor },
                onChange: function (v) { set({ summary: v }); }
            });

            /* point list */
            var pointList = attr.showPoints && el('div', {},
                el('div', { style: { borderTop: '1px solid ' + attr.borderColor + '80', marginBottom: '10px', marginTop: '8px' } }),
                points.map(function (p, idx) {
                    return el('div', { key: idx, style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' } },
                        el('span', { style: { color: attr.accentColor, fontWeight: 700, fontSize: '16px', flexShrink: 0, lineHeight: 1 } }, '✓'),
                        el(TextControl, { value: p.text, label: '', placeholder: __('Bullet point…', 'blockenberg'), __nextHasNoMarginBottom: true, style: { flex: 1, fontSize: '14px' }, onChange: function (v) { updatePoint(idx, v); } }),
                        el(Button, { isSmall: true, isDestructive: true, variant: 'tertiary', onClick: function () { set({ points: points.filter(function (_, i) { return i !== idx; }) }); } }, '×')
                    ) }),
                el(Button, { variant: 'link', style: { fontSize: '11px' }, onClick: function () { set({ points: points.concat([{ text: '' }]) }); } }, '+ Add Point')
            );

            return el('div', blockProps,
                controls,
                el('div', { style: wrapStyle },
                    headerRow,
                    summaryEl,
                    pointList,
                    attr.expandable && el('div', { style: { marginTop: '10px', fontSize: '12px', color: attr.accentColor, fontWeight: 600, cursor: 'pointer' } }, '▼ ' + attr.collapseLabel)
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', (function () {
                var s = {};
                var tv = Object.assign({}, window._bkbgTypoVarsCache(attr.headingTypo, '--bktldr-ht-'), window._bkbgTypoVarsCache(attr.summaryTypo, '--bktldr-st-'));
                for (var k in tv) s[k] = tv[k];
                return useBlockProps.save({ style: s });
            }()),
                el('div', { className: 'bkbg-tldr-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
