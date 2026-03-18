( function () {
    var el                = wp.element.createElement;
    var __                = wp.i18n.__;
    var useState          = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RichText          = wp.blockEditor.RichText;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var TextareaControl   = wp.components.TextareaControl;
    var Button            = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    function StepBubble(idx, step, a, isActive, isDone, onClick) {
        var bg    = isActive ? a.activeBg  : isDone ? a.doneBg    : a.inactiveBg;
        var color = isActive ? a.activeColor : isDone ? a.doneColor : a.inactiveColor;
        return el('button', {
            key: idx,
            onClick: onClick,
            className: 'bkbg-is-bubble' + (isActive ? ' bkbg-is-active' : '') + (isDone ? ' bkbg-is-done' : ''),
            style: {
                width:       a.stepSize + 'px',
                height:      a.stepSize + 'px',
                borderRadius: '50%',
                background:  bg,
                color:       color,
                border:      'none',
                cursor:      'pointer',
                fontSize:    isDone ? '20px' : (a.stepFontSize || 14) + 'px',
                fontWeight:  700,
                display:     'flex',
                alignItems:  'center',
                justifyContent: 'center',
                flexShrink:  0,
                transition:  'background 0.3s, transform 0.2s',
                transform:   isActive ? 'scale(1.12)' : 'scale(1)',
                boxShadow:   isActive ? '0 4px 16px rgba(99,102,241,0.4)' : 'none'
            }
        }, isDone ? '✓' : ((step.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildEditorIcon(step.iconType, step.icon, step.iconDashicon, step.iconImageUrl, step.iconDashiconColor) : (step.icon || (idx + 1))));
    }

    registerBlockType('blockenberg/interactive-steps', {
        title:    __('Interactive Steps'),
        icon:     'editor-ol',
        category: 'bkbg-interactive',

        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var active  = useState(attr.initialStep || 0);
            var activeIdx = active[0];
            var setActive = active[1];
            var bp      = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                Object.assign(s, _tv(attr.headingTypo, '--bkbg-is-h-'));
                Object.assign(s, _tv(attr.bodyTypo, '--bkbg-is-bd-'));
                return { className: 'bkbg-is-wrap', style: s };
            })());

            function updateStep(idx, field, val) {
                var steps = attr.steps.map(function (s, i) {
                    return i === idx ? Object.assign({}, s, { [field]: val }) : s;
                });
                setAttr({ steps: steps });
            }
            function addStep() {
                setAttr({ steps: attr.steps.concat([{
                    title: 'New Step', icon: '⭐',
                    iconType: 'custom-char', iconDashicon: '', iconImageUrl: '',
                    heading: 'Step heading', body: 'Describe this step.'
                }]) });
            }
            function removeStep(idx) {
                if (attr.steps.length <= 2) return;
                setAttr({ steps: attr.steps.filter(function (_, i) { return i !== idx; }) });
                if (activeIdx >= attr.steps.length - 1) setActive(attr.steps.length - 2);
            }

            var total = attr.steps.length;

            var inspector = el(InspectorControls, {},
                /* Steps content */
                el(PanelBody, { title: __('Steps'), initialOpen: true },
                    attr.steps.map(function (step, idx) {
                        return el(PanelBody, { key: idx, title: (idx + 1) + '. ' + (step.title || 'Step'), initialOpen: false },
                            el(TextControl, { label: __('Step Title (nav label)'), value: step.title || '',
                                onChange: function (v) { updateStep(idx, 'title', v); },
                                __nextHasNoMarginBottom: true }),
                            IP() && el(IP().IconPickerControl, {
                                iconType: step.iconType || 'custom-char',
                                customChar: step.icon || '',
                                dashicon: step.iconDashicon || '',
                                imageUrl: step.iconImageUrl || '',
                                onChangeType: function (v) { updateStep(idx, 'iconType', v); },
                                onChangeChar: function (v) { updateStep(idx, 'icon', v); },
                                onChangeDashicon: function (v) { updateStep(idx, 'iconDashicon', v); },
                                onChangeImageUrl: function (v) { updateStep(idx, 'iconImageUrl', v); }
                            }),
                            el(TextControl, { label: __('Panel Heading'), value: step.heading || '',
                                onChange: function (v) { updateStep(idx, 'heading', v); },
                                __nextHasNoMarginBottom: true }),
                            el(TextareaControl, { label: __('Panel Body'), value: step.body || '', rows: 4,
                                onChange: function (v) { updateStep(idx, 'body', v); },
                                __nextHasNoMarginBottom: true }),
                            attr.steps.length > 2 && el(Button, {
                                isDestructive: true, variant: 'secondary',
                                onClick: function () { removeStep(idx); },
                                style: { marginTop: '8px' }
                            }, __('Remove Step'))
                        );
                    }),
                    el(Button, { variant: 'primary', onClick: addStep,
                        style: { marginTop: '8px', width: '100%' }
                    }, __('+ Add Step'))
                ),

                /* Layout */
                el(PanelBody, { title: __('Layout'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout Direction'),
                        value: attr.layout,
                        options: [
                            { label: __('Horizontal'), value: 'horizontal' },
                            { label: __('Vertical'),   value: 'vertical' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, { label: __('Show Connector Line'), checked: attr.showConnector,
                        onChange: function (v) { setAttr({ showConnector: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Animate Content'), checked: attr.animateContent,
                        onChange: function (v) { setAttr({ animateContent: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Bubble Size (px)'), value: attr.stepSize,
                        min: 32, max: 80,
                        onChange: function (v) { setAttr({ stepSize: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Content Radius (px)'), value: attr.contentRadius,
                        min: 0, max: 32,
                        onChange: function (v) { setAttr({ contentRadius: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Content Padding (px)'), value: attr.contentPadding,
                        min: 12, max: 64,
                        onChange: function (v) { setAttr({ contentPadding: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Connector Height (px)'), value: attr.connectorHeight,
                        min: 1, max: 8,
                        onChange: function (v) { setAttr({ connectorHeight: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                /* Colors */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: 'Heading', value: attr.headingTypo, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                    el(getTypographyControl(), { label: 'Body', value: attr.bodyTypo, onChange: function (v) { setAttr({ bodyTypo: v }); } }),
                    el(RangeControl, { label: __('Step Font Size (px)', 'blockenberg'), value: attr.stepFontSize, min: 10, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { setAttr({ stepFontSize: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors'), initialOpen: false,
                    colorSettings: [
                        { label: __('Active Bubble BG'), value: attr.activeBg,
                          onChange: function (v) { setAttr({ activeBg: v || '#6366f1' }); } },
                        { label: __('Active Bubble Text'), value: attr.activeColor,
                          onChange: function (v) { setAttr({ activeColor: v || '#ffffff' }); } },
                        { label: __('Inactive Bubble BG'), value: attr.inactiveBg,
                          onChange: function (v) { setAttr({ inactiveBg: v || '#e5e7eb' }); } },
                        { label: __('Inactive Bubble Text'), value: attr.inactiveColor,
                          onChange: function (v) { setAttr({ inactiveColor: v || '#64748b' }); } },
                        { label: __('Done Bubble BG'), value: attr.doneBg,
                          onChange: function (v) { setAttr({ doneBg: v || '#10b981' }); } },
                        { label: __('Done Bubble Text'), value: attr.doneColor,
                          onChange: function (v) { setAttr({ doneColor: v || '#ffffff' }); } },
                        { label: __('Connector Default'), value: attr.connectorColor,
                          onChange: function (v) { setAttr({ connectorColor: v || '#e5e7eb' }); } },
                        { label: __('Connector Done'), value: attr.connectorDone,
                          onChange: function (v) { setAttr({ connectorDone: v || '#10b981' }); } },
                        { label: __('Content Panel BG'), value: attr.contentBg,
                          onChange: function (v) { setAttr({ contentBg: v || '#f8fafc' }); } },
                        { label: __('Content Panel Border'), value: attr.contentBorder,
                          onChange: function (v) { setAttr({ contentBorder: v || '#e5e7eb' }); } },
                        { label: __('Heading Color'), value: attr.headingColor,
                          onChange: function (v) { setAttr({ headingColor: v || '#0f172a' }); } },
                        { label: __('Body Color'), value: attr.bodyColor,
                          onChange: function (v) { setAttr({ bodyColor: v || '#475569' }); } },
                        { label: __('Label Color'), value: attr.labelColor,
                          onChange: function (v) { setAttr({ labelColor: v || '#0f172a' }); } },
                        { label: __('Section BG'), value: attr.sectionBg,
                          onChange: function (v) { setAttr({ sectionBg: v || 'transparent' }); } }
                    ]
                })
            );

            var currentStep = attr.steps[activeIdx] || attr.steps[0];
            var isHoriz     = attr.layout !== 'vertical';

            /* ── Nav row / column ─────────────────────────────────── */
            var navEl = el('div', {
                className: 'bkbg-is-nav',
                style: {
                    display:        isHoriz ? 'flex' : 'flex',
                    flexDirection:  isHoriz ? 'row' : 'column',
                    alignItems:     isHoriz ? 'center' : 'flex-start',
                    gap:            isHoriz ? '0' : '8px',
                    marginBottom:   isHoriz ? '32px' : '0',
                    marginRight:    isHoriz ? '0' : '32px',
                    flexShrink:     0
                }
            },
                attr.steps.map(function (step, idx) {
                    var isActive = idx === activeIdx;
                    var isDone   = idx < activeIdx;
                    return el(wp.element.Fragment, { key: idx },
                        /* connector */
                        idx > 0 && attr.showConnector !== false && el('div', {
                            className: 'bkbg-is-connector',
                            style: {
                                flex:       isHoriz ? 1 : 'none',
                                height:     isHoriz ? attr.connectorHeight + 'px' : '24px',
                                width:      isHoriz ? 'auto' : attr.connectorHeight + 'px',
                                background: idx <= activeIdx ? (attr.connectorDone || '#10b981') : (attr.connectorColor || '#e5e7eb'),
                                margin:     isHoriz ? '0' : '0 0 0 ' + (attr.stepSize / 2) + 'px',
                                alignSelf:  isHoriz ? 'center' : 'auto',
                                minWidth:   isHoriz ? '24px' : 'auto',
                                transition: 'background 0.4s ease'
                            }
                        }),
                        el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' } },
                            StepBubble(idx, step, attr, isActive, isDone, function () { setActive(idx); }),
                            el('div', {
                                style: {
                                    fontSize:   (attr.stepFontSize || 14) + 'px',
                                    fontWeight: isActive ? 700 : 500,
                                    color:      isActive ? (attr.activeBg || '#6366f1') : (attr.labelColor || '#0f172a'),
                                    whiteSpace: 'nowrap',
                                    textAlign:  'center',
                                    transition: 'color 0.3s'
                                }
                            }, step.title || ('Step ' + (idx + 1)))
                        )
                    );
                })
            );

            /* ── Content panel ───────────────────────────────────── */
            var panel = el('div', {
                className: 'bkbg-is-panel',
                style: {
                    flex:         1,
                    background:   attr.contentBg   || '#f8fafc',
                    border:       '1px solid ' + (attr.contentBorder || '#e5e7eb'),
                    borderRadius: attr.contentRadius + 'px',
                    padding:      attr.contentPadding + 'px'
                }
            },
                el('div', {
                    className: 'bkbg-is-heading',
                    style: { color: attr.headingColor || '#0f172a' }
                }, currentStep.heading || ''),
                el('div', {
                    className: 'bkbg-is-body',
                    style: { color: attr.bodyColor || '#475569' }
                }, currentStep.body || ''),
                /* navigation buttons */
                el('div', { style: { display: 'flex', gap: '12px', marginTop: '24px' } },
                    activeIdx > 0 && el('button', {
                        onClick: function () { setActive(activeIdx - 1); },
                        style: { padding: '10px 24px', borderRadius: '8px',
                            border: '1px solid ' + (attr.contentBorder || '#e5e7eb'),
                            background: 'transparent', cursor: 'pointer', fontSize: '14px',
                            color: attr.bodyColor || '#475569', fontWeight: 600 }
                    }, '← Previous'),
                    activeIdx < total - 1 && el('button', {
                        onClick: function () { setActive(activeIdx + 1); },
                        style: { padding: '10px 24px', borderRadius: '8px',
                            border: 'none', background: attr.activeBg || '#6366f1',
                            color: attr.activeColor || '#ffffff', cursor: 'pointer',
                            fontSize: '14px', fontWeight: 700 }
                    }, 'Next →')
                )
            );

            return el(wp.element.Fragment, {}, inspector,
                el('div', bp,
                    el('div', {
                        className: 'bkbg-is-root',
                        style: {
                            background:    attr.sectionBg || 'transparent',
                            display:       'flex',
                            flexDirection: isHoriz ? 'column' : 'row',
                            gap:           '0'
                        }
                    }, navEl, panel)
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var _tv = getTypoCssVars();
            var s = {};
            Object.assign(s, _tv(attr.headingTypo, '--bkbg-is-h-'));
            Object.assign(s, _tv(attr.bodyTypo, '--bkbg-is-bd-'));
            var bp   = useBlockProps.save({ style: s });
            return el('div', bp,
                el('div', { className: 'bkbg-is-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
