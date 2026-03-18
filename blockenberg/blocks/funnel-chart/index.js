( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    var _fncTC, _fncTV;
    function _tc() { return _fncTC || (_fncTC = window.bkbgTypographyControl); }
    function _tv() { return _fncTV || (_fncTV = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var ORIENTATION_OPTIONS = [
        { label: __('Vertical',   'blockenberg'), value: 'vertical'   },
        { label: __('Horizontal', 'blockenberg'), value: 'horizontal' },
    ];
    var STYLE_OPTIONS = [
        { label: __('Trapezoid', 'blockenberg'), value: 'trapezoid' },
        { label: __('Bars',      'blockenberg'), value: 'bars'      },
        { label: __('Chevron',   'blockenberg'), value: 'chevron'   },
    ];
    var VALUE_FORMAT_OPTIONS = [
        { label: __('Number',  'blockenberg'), value: 'number'  },
        { label: __('Compact', 'blockenberg'), value: 'compact' },
        { label: __('Percent of top', 'blockenberg'), value: 'pct_top' },
    ];

    function makeId() { return 'fn' + Math.random().toString(36).substr(2, 5); }

    function formatVal(v, format) {
        if (format === 'compact') {
            if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
            if (v >= 1000)    return (v / 1000).toFixed(1) + 'K';
            return String(v);
        }
        return v.toLocaleString();
    }

    function buildWrapStyle(a) {
        return Object.assign(
            {
                '--bkbg-fn-label-color':    a.labelColor,
                '--bkbg-fn-title-color':    a.titleColor,
                '--bkbg-fn-subtitle-color': a.subtitleColor,
                '--bkbg-fn-drop-off-color': a.dropOffColor,
                '--bkbg-fn-card-bg':        a.cardBg,
                '--bkbg-fn-card-r':         a.cardRadius + 'px',
                paddingTop:    a.paddingTop    + 'px',
                paddingBottom: a.paddingBottom + 'px',
                backgroundColor: a.bgColor || undefined,
            },
            _tv()(a.typoTitle, '--bkbg-fnc-tt-'),
            _tv()(a.typoSubtitle, '--bkbg-fnc-st-'),
            _tv()(a.typoLabel, '--bkbg-fnc-lb-'),
            _tv()(a.typoValue, '--bkbg-fnc-vl-')
        );
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#ccc' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Funnel stage component ─────────────────────────────────────── */
    function FunnelStage(props) {
        var stage    = props.stage;
        var idx      = props.idx;
        var total    = props.total;
        var topVal   = props.topVal;
        var nextStage = props.nextStage;
        var a        = props.a;
        var widthPct = topVal > 0 ? (stage.value / topVal) * 100 : 100;
        var pct      = topVal > 0 ? Math.round((stage.value / topVal) * 100) : 100;
        var dropOff  = nextStage ? Math.round(((stage.value - nextStage.value) / stage.value) * 100) : null;

        var stageStyle = {
            background: stage.color,
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            minHeight: a.stageHeight + 'px',
            transition: 'width 0.5s ease',
            boxSizing: 'border-box',
            color: a.labelColor,
        };

        if (a.style === 'trapezoid') {
            stageStyle.width = widthPct + '%';
            stageStyle.borderRadius = '4px';
        } else if (a.style === 'bars') {
            stageStyle.width = widthPct + '%';
            stageStyle.borderRadius = '6px';
        } else {
            /* chevron: full width, clip-path */
            stageStyle.width = '100%';
            stageStyle.clipPath = idx < total - 1
                ? 'polygon(0 0, 100% 0, 92% 50%, 100% 100%, 0 100%, 8% 50%)'
                : 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 8% 50%)';
            stageStyle.borderRadius = '0';
        }

        return el('div', { className: 'bkbg-fn-stage-wrap', 'data-idx': idx, style: { marginBottom: a.stageGap + 'px' } },
            el('div', { className: 'bkbg-fn-stage', style: { display: 'flex', justifyContent: 'center' } },
                el('div', { className: 'bkbg-fn-stage-bar', style: stageStyle },
                    a.showIcons && stage.icon && el('span', { className: 'bkbg-fn-stage-icon', style: { fontSize: '18px', lineHeight: 1 } }, (stage.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildEditorIcon(el, stage.iconType, stage.icon, stage.iconDashicon, stage.iconImageUrl, stage.iconDashiconColor) : stage.icon),
                    el('span', { className: 'bkbg-fn-stage-label', style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, stage.label),
                    a.showValues && el('span', { className: 'bkbg-fn-stage-value', style: { opacity: 0.9 } },
                        a.valueFormat === 'pct_top' ? pct + '%' : formatVal(stage.value, a.valueFormat)
                    ),
                    a.showPercent && a.valueFormat !== 'pct_top' && idx < total && el('span', { className: 'bkbg-fn-stage-pct', style: { opacity: 0.75 } }, '(' + pct + '%)')
                )
            ),
            dropOff !== null && a.showDropOff && el('div', { className: 'bkbg-fn-drop-off', style: { textAlign: 'center', color: a.dropOffColor, padding: '3px 0' } },
                '▼ ' + dropOff + '% ' + __('drop-off', 'blockenberg')
            )
        );
    }

    registerBlockType('blockenberg/funnel-chart', {
        title: __('Funnel Chart', 'blockenberg'),
        icon: 'filter',
        category: 'bkbg-charts',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            var topVal = a.stages.length > 0 ? a.stages[0].value : 1;

            function updateStage(id, key, val) {
                setAttributes({ stages: a.stages.map(function (s) {
                    if (s.id !== id) return s;
                    var u = Object.assign({}, s); u[key] = val; return u;
                }) });
            }

            function addStage() {
                var last = a.stages[a.stages.length - 1];
                setAttributes({ stages: a.stages.concat([{
                    id: makeId(), label: __('New Stage', 'blockenberg'),
                    value: last ? Math.round(last.value * 0.5) : 100,
                    icon: '📌', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', color: '#7c3aed'
                }]) });
            }

            function removeStage(id) {
                setAttributes({ stages: a.stages.filter(function (s) { return s.id !== id; }) });
            }

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Stages', 'blockenberg'), initialOpen: true },
                        a.stages.map(function (s, si) {
                            return el('div', { key: s.id, style: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px', marginBottom: '10px', background: '#fafafa' } },
                                el(TextControl, { label: __('Label', 'blockenberg'), value: s.label, onChange: function (v) { updateStage(s.id, 'label', v); } }),
                                el(TextControl, { label: __('Value', 'blockenberg'), value: String(s.value), type: 'number', onChange: function (v) { updateStage(s.id, 'value', parseFloat(v) || 0); } }),
                                IP() ? el(IP().IconPickerControl, {
                                    iconType: s.iconType || 'custom-char',
                                    customChar: s.icon || '',
                                    dashicon: s.iconDashicon || '',
                                    imageUrl: s.iconImageUrl || '',
                                    onChangeType: function (v) { updateStage(s.id, 'iconType', v); },
                                    onChangeChar: function (v) { updateStage(s.id, 'icon', v); },
                                    onChangeDashicon: function (v) { updateStage(s.id, 'iconDashicon', v); },
                                    onChangeImageUrl: function (v) { updateStage(s.id, 'iconImageUrl', v); },
                                    label: __('Icon', 'blockenberg')
                                }) : el(TextControl, { label: __('Icon (emoji)', 'blockenberg'), value: s.icon, onChange: function (v) { updateStage(s.id, 'icon', v); } }),
                                renderColorControl('s-' + s.id + '-color', __('Color', 'blockenberg'), s.color, function (v) { updateStage(s.id, 'color', v); }, openColorKey, setOpenColorKey),
                                el(Button, { isDestructive: true, variant: 'tertiary', size: 'compact', onClick: function () { removeStage(s.id); }, style: { marginTop: '6px' } }, __('Remove', 'blockenberg'))
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: addStage, style: { width: '100%', justifyContent: 'center' } }, '+ ' + __('Add Stage', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Style', 'blockenberg'), value: a.style, options: STYLE_OPTIONS, onChange: function (v) { setAttributes({ style: v }); } }),
                        el(SelectControl, { label: __('Orientation', 'blockenberg'), value: a.orientation, options: ORIENTATION_OPTIONS, onChange: function (v) { setAttributes({ orientation: v }); } }),
                        el(SelectControl, { label: __('Value format', 'blockenberg'), value: a.valueFormat, options: VALUE_FORMAT_OPTIONS, onChange: function (v) { setAttributes({ valueFormat: v }); } }),
                        el(RangeControl, { label: __('Stage height (px)', 'blockenberg'), value: a.stageHeight, min: 40, max: 120, onChange: function (v) { setAttributes({ stageHeight: v }); } }),
                        el(RangeControl, { label: __('Stage gap (px)', 'blockenberg'), value: a.stageGap, min: 0, max: 20, onChange: function (v) { setAttributes({ stageGap: v }); } }),
                        el(RangeControl, { label: __('Max width (px)', 'blockenberg'), value: a.maxWidth, min: 300, max: 900, onChange: function (v) { setAttributes({ maxWidth: v }); } })
                    ),
                    el(PanelBody, { title: __('Display Options', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show values',   'blockenberg'), checked: a.showValues,  onChange: function (v) { setAttributes({ showValues:  v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show %',        'blockenberg'), checked: a.showPercent, onChange: function (v) { setAttributes({ showPercent: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show drop-off', 'blockenberg'), checked: a.showDropOff, onChange: function (v) { setAttributes({ showDropOff: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show icons',    'blockenberg'), checked: a.showIcons,   onChange: function (v) { setAttributes({ showIcons:   v }); }, __nextHasNoMarginBottom: true }),
                        ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc()({ label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                        _tc()({ label: __('Subtitle', 'blockenberg'), value: a.typoSubtitle, onChange: function (v) { setAttributes({ typoSubtitle: v }); } }),
                        _tc()({ label: __('Stage Label', 'blockenberg'), value: a.typoLabel, onChange: function (v) { setAttributes({ typoLabel: v }); } }),
                        _tc()({ label: __('Stage Value', 'blockenberg'), value: a.typoValue, onChange: function (v) { setAttributes({ typoValue: v }); } })
                    ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('labelColor',    __('Stage label text', 'blockenberg'), 'labelColor'),
                        cc('dropOffColor',  __('Drop-off text',    'blockenberg'), 'dropOffColor'),
                        cc('titleColor',    __('Title',            'blockenberg'), 'titleColor'),
                        cc('subtitleColor', __('Subtitle',         'blockenberg'), 'subtitleColor'),
                        cc('cardBg',        __('Card background',  'blockenberg'), 'cardBg'),
                        cc('bgColor',       __('Section bg',       'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                        ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-fn-card', style: { background: a.cardBg, borderRadius: a.cardRadius + 'px', padding: '28px', boxSizing: 'border-box' } },
                        (a.title || a.subtitle) && el('div', { className: 'bkbg-fn-header', style: { textAlign: 'center', marginBottom: '24px' } },
                            el(RichText, { tagName: 'h3', className: 'bkbg-fn-title', value: a.title, onChange: function (v) { setAttributes({ title: v }); }, placeholder: __('Funnel title…', 'blockenberg'), style: { color: a.titleColor, margin: '0 0 6px' } }),
                            el(RichText, { tagName: 'p', className: 'bkbg-fn-subtitle', value: a.subtitle, onChange: function (v) { setAttributes({ subtitle: v }); }, placeholder: __('Optional subtitle…', 'blockenberg'), style: { color: a.subtitleColor, margin: 0 } })
                        ),
                        el('div', { className: 'bkbg-fn-funnel bkbg-fn-funnel--' + a.style + ' bkbg-fn-funnel--' + a.orientation, style: { maxWidth: a.maxWidth + 'px', margin: '0 auto' } },
                            a.stages.map(function (s, si) {
                                return el(FunnelStage, {
                                    key: s.id, stage: s, idx: si, total: a.stages.length, topVal: topVal,
                                    nextStage: a.stages[si + 1] || null, a: a
                                });
                            })
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var topVal = a.stages.length > 0 ? a.stages[0].value : 1;
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-fn-wrapper', style: buildWrapStyle(a) }),
                el('div', { className: 'bkbg-fn-card', style: { background: a.cardBg, borderRadius: a.cardRadius + 'px', padding: '28px', boxSizing: 'border-box' } },
                    (a.title || a.subtitle) && el('div', { className: 'bkbg-fn-header' },
                        a.title    && el(RichText.Content, { tagName: 'h3', className: 'bkbg-fn-title',    value: a.title }),
                        a.subtitle && el(RichText.Content, { tagName: 'p',  className: 'bkbg-fn-subtitle', value: a.subtitle })
                    ),
                    el('div', { className: 'bkbg-fn-funnel bkbg-fn-funnel--' + a.style + ' bkbg-fn-funnel--' + a.orientation, style: { maxWidth: a.maxWidth + 'px', margin: '0 auto' } },
                        a.stages.map(function (s, si) {
                            var widthPct = topVal > 0 ? (s.value / topVal) * 100 : 100;
                            var pct      = topVal > 0 ? Math.round((s.value / topVal) * 100) : 100;
                            var nextStage = a.stages[si + 1] || null;
                            var dropOff  = nextStage ? Math.round(((s.value - nextStage.value) / s.value) * 100) : null;

                            var stageStyle = { background: s.color, '--bkbg-fn-w': widthPct + '%' };
                            return el('div', { key: s.id, className: 'bkbg-fn-stage-wrap', 'data-idx': si, 'data-value': s.value, 'data-pct': pct, style: { marginBottom: a.stageGap + 'px' } },
                                el('div', { className: 'bkbg-fn-stage' },
                                    el('div', { className: 'bkbg-fn-stage-bar', style: stageStyle },
                                        a.showIcons && s.icon && el('span', { className: 'bkbg-fn-stage-icon', 'aria-hidden': 'true' }, (s.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildSaveIcon(el, s.iconType, s.icon, s.iconDashicon, s.iconImageUrl, s.iconDashiconColor) : s.icon),
                                        el('span', { className: 'bkbg-fn-stage-label' }, s.label),
                                        a.showValues && el('span', { className: 'bkbg-fn-stage-value' }, a.valueFormat === 'pct_top' ? pct + '%' : s.value.toLocaleString()),
                                        a.showPercent && a.valueFormat !== 'pct_top' && el('span', { className: 'bkbg-fn-stage-pct' }, '(' + pct + '%)')
                                    )
                                ),
                                dropOff !== null && a.showDropOff && el('div', { className: 'bkbg-fn-drop-off' }, '▼ ' + dropOff + '% drop-off')
                            );
                        })
                    )
                )
            );
        }
    });
}() );
