( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody    = wp.components.PanelBody;
    var Button       = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl  = wp.components.TextControl;
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var IP = function () { return window.bkbgIconPicker; };

    var LAYOUT_OPTIONS = [
        { label: __('Horizontal (left→right)', 'blockenberg'), value: 'horizontal' },
        { label: __('Vertical (top→bottom)',   'blockenberg'), value: 'vertical' },
    ];
    var NUMBER_STYLE_OPTIONS = [
        { label: __('Circle',    'blockenberg'), value: 'circle' },
        { label: __('Square',    'blockenberg'), value: 'square' },
        { label: __('Plain',     'blockenberg'), value: 'plain' },
        { label: __('Outlined',  'blockenberg'), value: 'outlined' },
    ];
    var CONNECTOR_OPTIONS = [
        { label: __('Solid line',  'blockenberg'), value: 'line' },
        { label: __('Dashed',      'blockenberg'), value: 'dashed' },
        { label: __('Dotted',      'blockenberg'), value: 'dotted' },
        { label: __('Arrow',       'blockenberg'), value: 'arrow' },
    ];
    var CARD_STYLE_OPTIONS = [
        { label: __('Plain',       'blockenberg'), value: 'plain' },
        { label: __('Card (bg)',   'blockenberg'), value: 'card' },
        { label: __('Bordered',    'blockenberg'), value: 'bordered' },
        { label: __('Shadow',      'blockenberg'), value: 'shadow' },
    ];
    var ALIGN_OPTIONS = [
        { label: __('Left',   'blockenberg'), value: 'left' },
        { label: __('Center', 'blockenberg'), value: 'center' },
    ];

    function makeId() { return 'hw' + Math.random().toString(36).substr(2, 6); }

    function buildWrapStyle(a) {
        var s = {
            '--bkbg-hiw-accent':       a.numberBg,
            '--bkbg-hiw-num-color':    a.numberColor,
            '--bkbg-hiw-num-size':     a.numberSize + 'px',
            '--bkbg-hiw-num-bg-size':  a.numberBgSize + 'px',
            '--bkbg-hiw-icon-size':    a.iconSize + 'px',
            '--bkbg-hiw-connector':    a.connectorColor,
            '--bkbg-hiw-title-color':  a.titleColor,
            '--bkbg-hiw-title-size':   a.titleSize + 'px',
            '--bkbg-hiw-desc-color':   a.descColor,
            '--bkbg-hiw-desc-size':    a.descSize + 'px',
            '--bkbg-hiw-card-bg':      a.cardBg,
            '--bkbg-hiw-card-border':  a.cardBorderColor,
            '--bkbg-hiw-card-radius':  a.cardRadius + 'px',
            '--bkbg-hiw-card-pad':     a.cardPadding + 'px',
            '--bkbg-hiw-gap':          a.gap + 'px',
            '--bkbg-hiw-text-align':   a.textAlign,
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
        var _tv = getTypoCssVars();
        if (_tv) {
            Object.assign(s, _tv(a.titleTypo || {}, '--bkbg-hiw-tt-'));
            Object.assign(s, _tv(a.descTypo || {}, '--bkbg-hiw-desc-'));
        }
        if (a.titleSize && a.titleSize !== 18) s['--bkbg-hiw-tt-sz'] = a.titleSize + 'px';
        if (a.titleFontWeight && a.titleFontWeight !== '700') s['--bkbg-hiw-tt-fw'] = a.titleFontWeight;
        if (a.titleLineHeight && a.titleLineHeight !== 1.3) s['--bkbg-hiw-tt-lh'] = String(a.titleLineHeight);
        if (a.descSize && a.descSize !== 14) s['--bkbg-hiw-desc-sz'] = a.descSize + 'px';
        if (a.descFontWeight && a.descFontWeight !== '400') s['--bkbg-hiw-desc-fw'] = a.descFontWeight;
        if (a.descLineHeight && a.descLineHeight !== 1.6) s['--bkbg-hiw-desc-lh'] = String(a.descLineHeight);
        return s;
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', title: value || 'default', onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#cccccc' }
                }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Step card component ─────────────────────────────────────────────── */
    function StepCard(props) {
        var step = props.step;
        var idx  = props.idx;
        var a    = props.a;
        var isHoriz = a.layout === 'horizontal';

        var numStyle = {
            width: a.numberBgSize + 'px', height: a.numberBgSize + 'px',
            borderRadius: a.numberStyle === 'circle' ? '50%' : a.numberStyle === 'square' ? a.cardRadius + 'px' : '0',
            background:  a.numberStyle === 'plain' || a.numberStyle === 'outlined' ? 'transparent' : a.numberBg,
            border: a.numberStyle === 'outlined' ? '2px solid ' + a.numberBg : 'none',
            color: a.numberStyle === 'plain' || a.numberStyle === 'outlined' ? a.numberBg : a.numberColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: a.numberSize + 'px', fontWeight: 800, flexShrink: 0
        };

        var cardStyle = {
            flex: isHoriz ? '1 1 0' : undefined,
            background:   a.cardStyle === 'card' || a.cardStyle === 'shadow' ? a.cardBg : 'transparent',
            border:       a.cardStyle === 'bordered' ? '1.5px solid ' + a.cardBorderColor : 'none',
            borderRadius: a.cardStyle !== 'plain' ? a.cardRadius + 'px' : '0',
            boxShadow:    a.cardStyle === 'shadow' ? '0 4px 16px rgba(0,0,0,0.09)' : 'none',
            padding:      a.cardStyle !== 'plain' ? a.cardPadding + 'px' : '0',
            display: 'flex', flexDirection: 'column', alignItems: a.textAlign === 'center' ? 'center' : 'flex-start',
            textAlign: a.textAlign,
        };

        return el('div', { className: 'bkbg-hiw-step bkbg-hiw-step--' + a.numberStyle + (a.animate ? ' bkbg-hiw-anim' : ''), style: cardStyle },
            el('div', { style: numStyle }, String(idx + 1).padStart(2, '0')),
            a.showIcon && step.icon && el('div', { className: 'bkbg-hiw-icon', style: { fontSize: a.iconSize + 'px', lineHeight: 1, margin: '12px 0 6px' } },
                (step.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(step.iconType, step.icon, step.iconDashicon, step.iconImageUrl, step.iconDashiconColor) : step.icon
            ),
            el(RichText, { tagName: 'h3', value: step.title, onChange: props.onTitleChange, placeholder: __('Step title…', 'blockenberg'), className: 'bkbg-hiw-title', style: { color: a.titleColor, margin: '12px 0 6px' } }),
            el(RichText, { tagName: 'p', value: step.description, onChange: props.onDescChange, placeholder: __('Describe this step…', 'blockenberg'), className: 'bkbg-hiw-desc', style: { color: a.descColor, margin: 0 } })
        );
    }

    /* ── Connector ───────────────────────────────────────────────────────── */
    function Connector(props) {
        var a = props.a;
        var isHoriz = a.layout === 'horizontal';
        var borderStyle = a.connectorStyle === 'line' ? 'solid' : a.connectorStyle === 'dashed' ? 'dashed' : a.connectorStyle === 'dotted' ? 'dotted' : 'solid';

        if (isHoriz) {
            return el('div', { className: 'bkbg-hiw-connector', style: { flex: '0 0 40px', alignSelf: 'flex-start', marginTop: (a.numberBgSize / 2) + 'px', borderTop: '2px ' + borderStyle + ' ' + a.connectorColor } });
        }
        return el('div', { className: 'bkbg-hiw-connector bkbg-hiw-connector--vert', style: { width: '2px', height: '32px', background: a.connectorColor, margin: '0 auto', borderLeft: '2px ' + borderStyle + ' ' + a.connectorColor } });
    }

    /* ── Register ────────────────────────────────────────────────────────── */
    registerBlockType('blockenberg/how-it-works', {
        title: __('How It Works', 'blockenberg'),
        icon: 'list-view',
        category: 'bkbg-marketing',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateStep(id, key, val) {
                setAttributes({ steps: a.steps.map(function (s) { if (s.id !== id) return s; var u = Object.assign({}, s); u[key] = val; return u; }) });
            }
            function addStep() {
                setAttributes({ steps: a.steps.concat([{ id: makeId(), icon: '✨', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', title: 'New Step', description: 'Describe this step.' }]) });
            }
            function removeStep(id) {
                if (a.steps.length <= 1) return;
                setAttributes({ steps: a.steps.filter(function (s) { return s.id !== id; }) });
            }

            var isHoriz = a.layout === 'horizontal';

            return el(Fragment, null,
                el(InspectorControls, null,
                    /* Layout */
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Direction', 'blockenberg'), value: a.layout, options: LAYOUT_OPTIONS, onChange: function (v) { setAttributes({ layout: v }); } }),
                        el(SelectControl, { label: __('Number style', 'blockenberg'), value: a.numberStyle, options: NUMBER_STYLE_OPTIONS, onChange: function (v) { setAttributes({ numberStyle: v }); } }),
                        el(SelectControl, { label: __('Card style', 'blockenberg'), value: a.cardStyle, options: CARD_STYLE_OPTIONS, onChange: function (v) { setAttributes({ cardStyle: v }); } }),
                        el(SelectControl, { label: __('Text align', 'blockenberg'), value: a.textAlign, options: ALIGN_OPTIONS, onChange: function (v) { setAttributes({ textAlign: v }); } }),
                        el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: a.gap, min: 16, max: 80, onChange: function (v) { setAttributes({ gap: v }); } }),
                        a.cardStyle !== 'plain' && el(RangeControl, { label: __('Card padding (px)', 'blockenberg'), value: a.cardPadding, min: 12, max: 56, onChange: function (v) { setAttributes({ cardPadding: v }); } }),
                        a.cardStyle !== 'plain' && el(RangeControl, { label: __('Card radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                        el(ToggleControl, { label: __('Show connector', 'blockenberg'), checked: a.showConnector, onChange: function (v) { setAttributes({ showConnector: v }); }, __nextHasNoMarginBottom: true }),
                        a.showConnector && el(SelectControl, { label: __('Connector style', 'blockenberg'), value: a.connectorStyle, options: CONNECTOR_OPTIONS, onChange: function (v) { setAttributes({ connectorStyle: v }); } }),
                        el(ToggleControl, { label: __('Show emoji icon', 'blockenberg'), checked: a.showIcon, onChange: function (v) { setAttributes({ showIcon: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Animate on scroll', 'blockenberg'), checked: a.animate, onChange: function (v) { setAttributes({ animate: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    /* Typography */
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Number size (px)', 'blockenberg'), value: a.numberSize, min: 14, max: 40, onChange: function (v) { setAttributes({ numberSize: v }); } }),
                        el(RangeControl, { label: __('Number badge size (px)', 'blockenberg'), value: a.numberBgSize, min: 36, max: 88, onChange: function (v) { setAttributes({ numberBgSize: v }); } }),
                        el(RangeControl, { label: __('Icon size (px)', 'blockenberg'), value: a.iconSize, min: 20, max: 64, onChange: function (v) { setAttributes({ iconSize: v }); } }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Step Title', 'blockenberg'), typo: a.titleTypo || {}, onChange: function(v){ setAttributes({ titleTypo: v }); } }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Step Description', 'blockenberg'), typo: a.descTypo || {}, onChange: function(v){ setAttributes({ descTypo: v }); } })
                    ),
                    /* Colors */
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('numberBg',      __('Number background',  'blockenberg'), 'numberBg'),
                        cc('numberColor',   __('Number text',        'blockenberg'), 'numberColor'),
                        cc('connectorColor',__('Connector',          'blockenberg'), 'connectorColor'),
                        cc('titleColor',    __('Step title',         'blockenberg'), 'titleColor'),
                        cc('descColor',     __('Step description',   'blockenberg'), 'descColor'),
                        cc('cardBg',        __('Card background',    'blockenberg'), 'cardBg'),
                        cc('cardBorderColor',__('Card border',       'blockenberg'), 'cardBorderColor'),
                        cc('bgColor',       __('Section background', 'blockenberg'), 'bgColor')
                    ),
                    /* Spacing */
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    /* Steps */
                    el(PanelBody, { title: __('Steps', 'blockenberg'), initialOpen: false },
                        a.steps.map(function (step, idx) {
                            return el(PanelBody, { key: step.id, title: (idx + 1) + '. ' + (step.title || __('Step', 'blockenberg')), initialOpen: false },
                                el(IP().IconPickerControl, { iconType: step.iconType || 'custom-char', customChar: step.icon, dashicon: step.iconDashicon || '', imageUrl: step.iconImageUrl || '',
                                    onChangeType: function (v) { updateStep(step.id, 'iconType', v); }, onChangeChar: function (v) { updateStep(step.id, 'icon', v); },
                                    onChangeDashicon: function (v) { updateStep(step.id, 'iconDashicon', v); }, onChangeImageUrl: function (v) { updateStep(step.id, 'iconImageUrl', v); } }),
                                el(TextControl, { label: __('Title', 'blockenberg'), value: step.title, onChange: function (v) { updateStep(step.id, 'title', v); } }),
                                el(wp.components.TextareaControl, { label: __('Description', 'blockenberg'), value: step.description, rows: 3, onChange: function (v) { updateStep(step.id, 'description', v); } }),
                                a.steps.length > 1 && el(Button, { onClick: function () { removeStep(step.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, __('Remove step', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: addStep, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Step', 'blockenberg'))
                    )
                ),

                /* Canvas */
                el('div', blockProps,
                    el('div', {
                        className: 'bkbg-hiw-steps bkbg-hiw--' + a.layout,
                        style: {
                            display: 'flex',
                            flexDirection: isHoriz ? 'row' : 'column',
                            alignItems: isHoriz ? 'flex-start' : 'center',
                            gap: isHoriz ? '0' : a.gap + 'px',
                        }
                    },
                        a.steps.map(function (step, idx) {
                            return el(Fragment, { key: step.id },
                                el(StepCard, {
                                    step: step, idx: idx, a: a,
                                    onTitleChange: function (v) { updateStep(step.id, 'title', v); },
                                    onDescChange:  function (v) { updateStep(step.id, 'description', v); },
                                }),
                                idx < a.steps.length - 1 && a.showConnector && el(Connector, { a: a })
                            );
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var isHoriz = a.layout === 'horizontal';

            function numStyle(idx) {
                return {
                    width: a.numberBgSize + 'px', height: a.numberBgSize + 'px',
                    borderRadius: a.numberStyle === 'circle' ? '50%' : a.numberStyle === 'square' ? a.cardRadius + 'px' : '0',
                    background:  a.numberStyle === 'plain' || a.numberStyle === 'outlined' ? 'transparent' : a.numberBg,
                    border: a.numberStyle === 'outlined' ? '2px solid ' + a.numberBg : 'none',
                    color: a.numberStyle === 'plain' || a.numberStyle === 'outlined' ? a.numberBg : a.numberColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: a.numberSize + 'px', fontWeight: 800, flexShrink: 0
                };
            }

            function cardStyle() {
                return {
                    flex: isHoriz ? '1 1 0' : undefined,
                    background:   a.cardStyle === 'card' || a.cardStyle === 'shadow' ? a.cardBg : 'transparent',
                    border:       a.cardStyle === 'bordered' ? '1.5px solid ' + a.cardBorderColor : 'none',
                    borderRadius: a.cardStyle !== 'plain' ? a.cardRadius + 'px' : '0',
                    boxShadow:    a.cardStyle === 'shadow' ? '0 4px 16px rgba(0,0,0,0.09)' : 'none',
                    padding:      a.cardStyle !== 'plain' ? a.cardPadding + 'px' : '0',
                    display: 'flex', flexDirection: 'column', alignItems: a.textAlign === 'center' ? 'center' : 'flex-start',
                    textAlign: a.textAlign,
                };
            }

            var borderStyle = a.connectorStyle === 'line' ? 'solid' : a.connectorStyle === 'dashed' ? 'dashed' : a.connectorStyle === 'dotted' ? 'dotted' : 'solid';

            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-hiw-wrapper', style: buildWrapStyle(a) }),
                el('div', {
                    className: 'bkbg-hiw-steps bkbg-hiw--' + a.layout,
                    style: { display: 'flex', flexDirection: isHoriz ? 'row' : 'column', alignItems: isHoriz ? 'flex-start' : 'center', gap: isHoriz ? '0' : a.gap + 'px' }
                },
                    a.steps.map(function (step, idx) {
                        return el(Fragment, { key: step.id },
                            el('div', { className: 'bkbg-hiw-step bkbg-hiw-step--' + a.numberStyle + (a.animate ? ' bkbg-hiw-anim' : ''), style: cardStyle() },
                                el('div', { className: 'bkbg-hiw-number', style: numStyle(idx) }, String(idx + 1).padStart(2, '0')),
                                a.showIcon && step.icon && el('div', { className: 'bkbg-hiw-icon', style: { fontSize: a.iconSize + 'px', lineHeight: 1, margin: '12px 0 6px' } },
                                    (step.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(step.iconType, step.icon, step.iconDashicon, step.iconImageUrl, step.iconDashiconColor) : step.icon
                                ),
                                el(RichText.Content, { tagName: 'h3', value: step.title, className: 'bkbg-hiw-title', style: { color: a.titleColor } }),
                                el(RichText.Content, { tagName: 'p', value: step.description, className: 'bkbg-hiw-desc', style: { color: a.descColor } })
                            ),
                            idx < a.steps.length - 1 && a.showConnector && (
                                isHoriz
                                    ? el('div', { className: 'bkbg-hiw-connector', style: { flex: '0 0 ' + a.gap + 'px', alignSelf: 'flex-start', marginTop: (a.numberBgSize / 2) + 'px', borderTop: '2px ' + borderStyle + ' ' + a.connectorColor } })
                                    : el('div', { className: 'bkbg-hiw-connector bkbg-hiw-connector--vert', style: { width: '2px', height: '32px', background: a.connectorColor, margin: '0 auto' } })
                            )
                        );
                    })
                )
            );
        }
    });
}() );
