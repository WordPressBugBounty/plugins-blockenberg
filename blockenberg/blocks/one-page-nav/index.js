( function () {
    var el                = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var Button            = wp.components.Button;

    var useState = wp.element.useState;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/one-page-nav', {
        edit: function (props) {
            var a   = props.attributes;
            var set = props.setAttributes;
            var TypoCtrl = getTypoControl();
            var blockProps = (function () {
                var bp = useBlockProps({ className: 'bkbg-opn-editor-wrap' });
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) {
                    Object.assign(s, _tvf(a.tooltipTypo, '--bkbg-opn-tp-'));
                }
                if (Object.keys(s).length) bp.style = Object.assign(s, bp.style || {});
                return bp;
            }());

            var itemsState = useState(a.items || []);

            function updateItem(idx, field, val) {
                var newItems = a.items.map(function (it, i) {
                    return i === idx ? Object.assign({}, it, { [field]: val }) : it;
                });
                set({ items: newItems });
            }

            function addItem() {
                set({ items: a.items.concat([{ label: 'Section ' + (a.items.length + 1), targetId: 'section-' + (a.items.length + 1) }]) });
            }

            function removeItem(idx) {
                set({ items: a.items.filter(function (_, i) { return i !== idx; }) });
            }

            var isRight = (a.position || 'right') === 'right';
            var dotSz   = a.dotSize || 12;
            var dotGap  = a.dotGap  || 14;
            var accent  = a.activeDotColor || '#6366f1';

            // Preview: a column of dots with vertical progress line
            var previewDots = el('div', {
                style: {
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: dotGap + 'px',
                    position: 'relative',
                    padding: '4px 0'
                }
            },
                // progress line
                a.progressLine !== false && el('div', {
                    style: {
                        position: 'absolute',
                        top: 0, left: '50%',
                        width: 2,
                        height: '100%',
                        background: '#e5e7eb',
                        transform: 'translateX(-50%)',
                        zIndex: 0
                    }
                }),
                (a.items || []).map(function (item, i) {
                    var isActive = i === 0;
                    var shape = a.dotShape || 'circle';
                    var borderRadius = shape === 'circle' ? '50%' : shape === 'square' ? '2px' : '2px';
                    var transform    = shape === 'diamond' ? 'rotate(45deg)' : '';
                    return el('div', { key: i, style: { position: 'relative', zIndex: 1, display: 'flex',
                        alignItems: 'center', gap: 8, flexDirection: isRight ? 'row-reverse' : 'row' } },
                        el('div', { style: {
                            width: isActive ? dotSz * 1.35 : dotSz,
                            height: isActive ? dotSz * 1.35 : dotSz,
                            borderRadius: borderRadius,
                            transform: transform,
                            background: isActive ? accent : (a.dotColor || '#d1d5db'),
                            transition: 'all 0.2s',
                            boxShadow: isActive ? '0 0 0 4px ' + accent + '33' : 'none'
                        } }),
                        a.showTooltips !== false && el('div', { className: 'bkbg-opn-tooltip', style: {
                            color: '#fff',
                            background: a.tooltipBg || '#1e1b4b',
                            opacity: isActive ? 1 : 0.4,
                            pointerEvents: 'auto',
                            transform: 'none'
                        } }, item.label)
                    );
                })
            );

            var previewWrap = el('div', {
                style: {
                    background: '#f1f5f9',
                    borderRadius: 12,
                    padding: 24,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 24,
                    fontFamily: 'inherit'
                }
            },
                el('div', { style: { flex: 1, opacity: 0.55 } },
                    // Simulated page sections
                    [0,1,2].map(function (n) {
                        return el('div', { key: n, style: {
                            height: 60, borderRadius: 8, marginBottom: 8,
                            background: n === 0 ? '#e0e7ff' : '#e5e7eb' }
                        });
                    })
                ),
                el('div', { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 80,
                    gap: 0
                } },
                    el('p', { style: { fontSize: 11, fontWeight: 600, color: '#6366f1',
                        textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' } },
                        (isRight ? '↳ Right' : '↲ Left') + ' side'),
                    previewDots
                )
            );

            return el('div', blockProps,
                el(InspectorControls, {},
                    // Navigation items
                    el(PanelBody, { title: 'Navigation Items', initialOpen: true },
                        (a.items || []).map(function (item, i) {
                            return el('div', { key: i, style: { marginBottom: 12, padding: 10,
                                background: '#f8fafc', borderRadius: 6, border: '1px solid #e5e7eb' } },
                                el(TextControl, { label: 'Label', value: item.label,
                                    onChange: function (v) { updateItem(i, 'label', v); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: 'Target ID (without #)', value: item.targetId,
                                    onChange: function (v) { updateItem(i, 'targetId', v); }, __nextHasNoMarginBottom: true }),
                                el(Button, { isDestructive: true, isSmall: true,
                                    onClick: function () { removeItem(i); } }, '✕ Remove')
                            );
                        }),
                        el(Button, { isPrimary: true, isSmall: true, onClick: addItem,
                            style: { marginTop: 4 } }, '+ Add Item')
                    ),
                    // Layout
                    el(PanelBody, { title: 'Layout', initialOpen: false },
                        el(SelectControl, { label: 'Position', value: a.position || 'right',
                            options: [
                                { label: 'Right side', value: 'right' },
                                { label: 'Left side', value: 'left' }
                            ],
                            onChange: function (v) { set({ position: v }); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: 'Dot shape', value: a.dotShape || 'circle',
                            options: [
                                { label: 'Circle', value: 'circle' },
                                { label: 'Square', value: 'square' },
                                { label: 'Diamond', value: 'diamond' }
                            ],
                            onChange: function (v) { set({ dotShape: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Dot size (px)', value: a.dotSize || 12,
                            onChange: function (v) { set({ dotSize: v }); }, min: 6, max: 24, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Gap between dots', value: a.dotGap || 14,
                            onChange: function (v) { set({ dotGap: v }); }, min: 4, max: 40, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Edge offset (px)', value: a.edgeOffset || 24,
                            onChange: function (v) { set({ edgeOffset: v }); }, min: 8, max: 80, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Scroll offset (px)', value: a.scrollOffset || 0,
                            onChange: function (v) { set({ scrollOffset: v }); }, min: -200, max: 200, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show tooltips', checked: a.showTooltips !== false,
                            onChange: function (v) { set({ showTooltips: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Animate active dot', checked: a.animateDots !== false,
                            onChange: function (v) { set({ animateDots: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show progress line', checked: a.progressLine !== false,
                            onChange: function (v) { set({ progressLine: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        TypoCtrl && el(TypoCtrl, { label: 'Tooltip', value: a.tooltipTypo, onChange: function (v) { set({ tooltipTypo: v }); } })
                    ),
                    el(PanelColorSettings, {
                        initialOpen: false, colorSettings: [
                            { label: 'Dot color',        value: a.dotColor,         onChange: function (v) { set({ dotColor: v || '#d1d5db' }); } },
                            { label: 'Active dot color', value: a.activeDotColor,   onChange: function (v) { set({ activeDotColor: v || '#6366f1' }); } },
                            { label: 'Hover dot color',  value: a.hoverDotColor,    onChange: function (v) { set({ hoverDotColor: v || '#a5b4fc' }); } },
                            { label: 'Progress line',    value: a.progressLineColor, onChange: function (v) { set({ progressLineColor: v || '#6366f1' }); } },
                            { label: 'Tooltip background', value: a.tooltipBg,      onChange: function (v) { set({ tooltipBg: v || '#1e1b4b' }); } },
                            { label: 'Tooltip text',     value: a.tooltipColor,     onChange: function (v) { set({ tooltipColor: v || '#ffffff' }); } }
                        ],
                        disableCustomGradients: true
                    })
                ),
                previewWrap
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save();
            var opts = {
                items:             a.items || [],
                position:          a.position          || 'right',
                dotShape:          a.dotShape          || 'circle',
                dotSize:           a.dotSize           || 12,
                dotGap:            a.dotGap            || 14,
                edgeOffset:        a.edgeOffset        || 24,
                scrollOffset:      a.scrollOffset      || 0,
                showTooltips:      a.showTooltips      !== false,
                animateDots:       a.animateDots       !== false,
                progressLine:      a.progressLine      !== false,
                dotColor:          a.dotColor          || '#d1d5db',
                activeDotColor:    a.activeDotColor    || '#6366f1',
                hoverDotColor:     a.hoverDotColor     || '#a5b4fc',
                progressLineColor: a.progressLineColor || '#6366f1',
                tooltipBg:         a.tooltipBg         || '#1e1b4b',
                tooltipColor:      a.tooltipColor      || '#ffffff',
                tooltipSize:       a.tooltipSize       || 11,
                tooltipTypo:       a.tooltipTypo       || {}
            };
            return el('div', blockProps,
                el('div', { className: 'bkbg-opn-app', 'data-opts': JSON.stringify(opts) })
            );
        }
    });
}() );
