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
    var TextareaControl = wp.components.TextareaControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var PROGRESS_STYLE_OPTIONS = [
        { label: __('Step circles',  'blockenberg'), value: 'steps' },
        { label: __('Progress bar',  'blockenberg'), value: 'bar' },
        { label: __('Dots',          'blockenberg'), value: 'dots' },
    ];
    var FIELD_TYPE_OPTIONS = [
        { label: __('Text',     'blockenberg'), value: 'text' },
        { label: __('Email',    'blockenberg'), value: 'email' },
        { label: __('Phone',    'blockenberg'), value: 'phone' },
        { label: __('Textarea', 'blockenberg'), value: 'textarea' },
        { label: __('Select',   'blockenberg'), value: 'select' },
        { label: __('Radio',    'blockenberg'), value: 'radio' },
        { label: __('Checkbox', 'blockenberg'), value: 'checkbox' },
    ];

    function makeId() { return 'msf' + Math.random().toString(36).substr(2, 5); }

    function buildWrapStyle(a) {
        return {
            '--bkbg-msf-accent':            a.accentColor,
            '--bkbg-msf-active-step-bg':    a.activeStepBg,
            '--bkbg-msf-active-step-color': a.activeStepColor,
            '--bkbg-msf-done-step-bg':      a.completedStepBg,
            '--bkbg-msf-done-step-color':   a.completedStepColor,
            '--bkbg-msf-idle-step-bg':      a.pendingStepBg,
            '--bkbg-msf-idle-step-color':   a.pendingStepColor,
            '--bkbg-msf-connector':         a.connectorColor,
            '--bkbg-msf-connector-done':    a.connectorActiveColor,
            '--bkbg-msf-step-title-color':  a.stepTitleColor,
            '--bkbg-msf-step-desc-color':   a.stepDescColor,
            '--bkbg-msf-label-color':       a.labelColor,
            '--bkbg-msf-input-bg':          a.inputBg,
            '--bkbg-msf-input-border':      a.inputBorder,
            '--bkbg-msf-input-text':        a.inputText,
            '--bkbg-msf-input-focus':       a.inputFocusBorder,
            '--bkbg-msf-btn-bg':            a.btnBg,
            '--bkbg-msf-btn-color':         a.btnColor,
            '--bkbg-msf-btn-sec-bg':        a.btnSecBg,
            '--bkbg-msf-btn-sec-color':     a.btnSecColor,
            '--bkbg-msf-card-bg':           a.cardBg,
            '--bkbg-msf-card-border':       a.cardBorderColor,
            '--bkbg-msf-step-circle-sz':    a.stepCircleSize + 'px',
            '--bkbg-msf-card-r':            a.cardRadius + 'px',
            '--bkbg-msf-card-pad':          a.cardPadding + 'px',
            '--bkbg-msf-input-r':           a.inputRadius + 'px',
            '--bkbg-msf-input-pad-v':       a.inputPaddingV + 'px',
            '--bkbg-msf-btn-r':             a.btnRadius + 'px',
            '--bkbg-msf-label-sz':          a.labelSize + 'px',
            '--bkbg-msf-input-sz':          a.inputSize + 'px',
            '--bkbg-msf-step-title-sz':     a.stepTitleSize + 'px',
            '--bkbg-msf-step-desc-sz':      a.stepDescSize + 'px',
            '--bkbg-msf-step-label-sz':     a.stepLabelSize + 'px',
            '--bkbg-msf-btn-sz':            a.btnSize + 'px',
            '--bkbg-msf-font-weight':       a.fontWeight || 600,
            '--bkbg-msf-line-height':       a.lineHeight || 1.5,
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
        var _tvf = getTypoCssVars();
        if (_tvf) {
            Object.assign(s, _tvf(a.stepTitleTypo, '--bkbg-msf-tt-'));
            Object.assign(s, _tvf(a.stepDescTypo, '--bkbg-msf-sd-'));
        }
        return s;
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

    /* ── Field preview ─────────────────────────────────────────────── */
    function FieldPreview(props) {
        var field = props.field;
        var a     = props.a;
        var inputStyle = {
            width: '100%', boxSizing: 'border-box',
            fontSize: a.inputSize + 'px', padding: a.inputPaddingV + 'px 14px',
            borderRadius: a.inputRadius + 'px', border: '1.5px solid ' + a.inputBorder,
            background: a.inputBg, color: a.inputText, fontFamily: 'inherit', outline: 'none',
        };
        return el('div', { className: 'bkbg-msf-field', style: { marginBottom: '16px' } },
            el('label', { className: 'bkbg-msf-label', style: { display: 'block', marginBottom: '6px', fontSize: a.labelSize + 'px', fontWeight: 600, color: a.labelColor } },
                field.label, field.required && el('span', { style: { color: a.accentColor, marginLeft: '3px' } }, '*')
            ),
            field.type === 'textarea' && el('textarea', { className: 'bkbg-msf-input', placeholder: field.placeholder, rows: 3, style: inputStyle, readOnly: true }),
            (field.type === 'text' || field.type === 'email' || field.type === 'phone') && el('input', { type: field.type === 'phone' ? 'tel' : field.type, className: 'bkbg-msf-input', placeholder: field.placeholder, style: inputStyle, readOnly: true }),
            field.type === 'select' && el('select', { className: 'bkbg-msf-input', style: inputStyle, disabled: true },
                el('option', null, field.placeholder || __('Choose…', 'blockenberg')),
                (field.options || []).map(function (opt, oi) { return el('option', { key: oi }, opt); })
            ),
            field.type === 'radio' && el('div', { className: 'bkbg-msf-radio-group', style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                (field.options || []).map(function (opt, oi) {
                    return el('label', { key: oi, style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: a.inputSize + 'px', cursor: 'pointer', color: a.inputText } },
                        el('input', { type: 'radio', disabled: true, readOnly: true }),
                        el('span', null, opt)
                    );
                })
            ),
            field.type === 'checkbox' && el('label', { style: { display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: a.inputSize + 'px', cursor: 'pointer', color: a.inputText } },
                el('input', { type: 'checkbox', disabled: true, style: { marginTop: '2px', flexShrink: 0 } }),
                el('span', null, field.label)
            )
        );
    }

    /* ── Step indicator ────────────────────────────────────────────── */
    function StepIndicator(props) {
        var a           = props.a;
        var currentStep = props.currentStep;
        var onClickStep = props.onClickStep;

        if (a.progressStyle === 'bar') {
            var pct = ((currentStep) / Math.max(1, a.steps.length - 1)) * 100;
            return el('div', { className: 'bkbg-msf-progress-bar-wrap', style: { marginBottom: '32px' } },
                el('div', { style: { height: '6px', borderRadius: '99px', background: a.pendingStepBg, overflow: 'hidden' } },
                    el('div', { className: 'bkbg-msf-progress-fill', style: { height: '100%', width: pct + '%', background: a.accentColor, transition: 'width 0.4s', borderRadius: '99px' } })
                ),
                a.showStepTitles && el('p', { style: { margin: '10px 0 0', fontSize: a.stepLabelSize + 'px', color: a.stepDescColor, textAlign: 'center' } },
                    __('Step', 'blockenberg') + ' ' + (currentStep + 1) + ' ' + __('of', 'blockenberg') + ' ' + a.steps.length
                )
            );
        }

        if (a.progressStyle === 'dots') {
            return el('div', { className: 'bkbg-msf-dots', style: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '32px' } },
                a.steps.map(function (s, si) {
                    var isDone   = si < currentStep;
                    var isActive = si === currentStep;
                    return el('button', { key: s.id, type: 'button', title: s.title, onClick: function () { onClickStep(si); }, style: { width: isActive ? '24px' : '10px', height: '10px', borderRadius: '99px', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s', background: isActive ? a.activeStepBg : (isDone ? a.completedStepBg : a.pendingStepBg) } });
                })
            );
        }

        /* steps (circles + connectors) */
        return el('div', { className: 'bkbg-msf-steps-indicator', style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: '36px', position: 'relative' } },
            a.steps.map(function (s, si) {
                var isDone   = si < currentStep;
                var isActive = si === currentStep;
                var circleBg    = isActive ? a.activeStepBg : (isDone ? a.completedStepBg : a.pendingStepBg);
                var circleColor = isActive ? a.activeStepColor : (isDone ? a.completedStepColor : a.pendingStepColor);
                return el('div', { key: s.id, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: si < a.steps.length - 1 ? '1' : '0', minWidth: '60px' } },
                    el('div', { style: { display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center', position: 'relative' } },
                        el('button', { type: 'button', onClick: function () { onClickStep(si); }, style: { width: a.stepCircleSize + 'px', height: a.stepCircleSize + 'px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: circleBg, color: circleColor, fontSize: a.stepCircleSize * 0.38 + 'px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1, transition: 'all 0.25s' } },
                            a.showStepIcons && s.icon ? (function () {
                                var _st = s.iconType || 'custom-char';
                                if (_st !== 'custom-char' && IP()) {
                                    var _n = IP().buildEditorIcon(_st, s.icon, s.iconDashicon, s.iconImageUrl, s.iconDashiconColor);
                                    if (_n) return el('span', null, _n);
                                }
                                return el('span', null, s.icon);
                            })() : (a.showStepNumbers ? el('span', null, si + 1) : el('span', null, isDone ? '✓' : ''))
                        ),
                        si < a.steps.length - 1 && el('div', { style: { flex: 1, height: '3px', background: isDone ? a.connectorActiveColor : a.connectorColor, marginLeft: '2px', transition: 'background 0.3s' } })
                    ),
                    a.showStepTitles && el('span', { style: { marginTop: '8px', fontSize: a.stepLabelSize + 'px', fontWeight: isActive ? 700 : 500, color: isActive ? a.accentColor : a.stepDescColor, textAlign: 'center', maxWidth: '80px' } }, s.title)
                );
            })
        );
    }

    registerBlockType('blockenberg/multi-step-form', {
        title: __('Multi-Step Form', 'blockenberg'),
        icon: 'feedback',
        category: 'bkbg-marketing',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var currentStepState = useState(0);
            var currentStep = currentStepState[0];
            var setCurrentStep = currentStepState[1];

            var blockProps = useBlockProps({ className: 'bkbg-msf-wrapper', style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateStep(stepId, key, val) {
                setAttributes({ steps: a.steps.map(function (s) {
                    if (s.id !== stepId) return s;
                    var u = Object.assign({}, s); u[key] = val; return u;
                }) });
            }

            function updateField(stepId, fieldId, key, val) {
                setAttributes({ steps: a.steps.map(function (s) {
                    if (s.id !== stepId) return s;
                    return Object.assign({}, s, { fields: s.fields.map(function (f) {
                        if (f.id !== fieldId) return f;
                        var u = Object.assign({}, f); u[key] = val; return u;
                    }) });
                }) });
            }

            function addField(stepId) {
                setAttributes({ steps: a.steps.map(function (s) {
                    if (s.id !== stepId) return s;
                    return Object.assign({}, s, { fields: s.fields.concat([{ id: makeId(), type: 'text', label: __('Field label', 'blockenberg'), placeholder: '', required: false, options: [] }]) });
                }) });
            }

            function removeField(stepId, fieldId) {
                setAttributes({ steps: a.steps.map(function (s) {
                    if (s.id !== stepId) return s;
                    return Object.assign({}, s, { fields: s.fields.filter(function (f) { return f.id !== fieldId; }) });
                }) });
            }

            var safeStep = Math.min(currentStep, a.steps.length - 1);
            var step = a.steps[safeStep];
            var isLast = safeStep === a.steps.length - 1;

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Form Settings', 'blockenberg'), initialOpen: true },
                        el(RangeControl,  { label: __('Max width (px)',    'blockenberg'), value: a.formMaxWidth, min: 400, max: 900, onChange: function (v) { setAttributes({ formMaxWidth: v }); } }),
                        el(SelectControl, { label: __('Progress style',   'blockenberg'), value: a.progressStyle, options: PROGRESS_STYLE_OPTIONS, onChange: function (v) { setAttributes({ progressStyle: v }); } }),
                        el(ToggleControl, { label: __('Show step titles',  'blockenberg'), checked: a.showStepTitles, onChange: function (v) { setAttributes({ showStepTitles: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show descriptions', 'blockenberg'), checked: a.showStepDescriptions, onChange: function (v) { setAttributes({ showStepDescriptions: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show step numbers', 'blockenberg'), checked: a.showStepNumbers, onChange: function (v) { setAttributes({ showStepNumbers: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show step icons',   'blockenberg'), checked: a.showStepIcons, onChange: function (v) { setAttributes({ showStepIcons: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Button Labels', 'blockenberg'), initialOpen: false },
                        el(TextControl, { label: __('Next button',   'blockenberg'), value: a.btnNextLabel,   onChange: function (v) { setAttributes({ btnNextLabel:   v }); } }),
                        el(TextControl, { label: __('Back button',   'blockenberg'), value: a.btnPrevLabel,   onChange: function (v) { setAttributes({ btnPrevLabel:   v }); } }),
                        el(TextControl, { label: __('Submit button', 'blockenberg'), value: a.btnSubmitLabel, onChange: function (v) { setAttributes({ btnSubmitLabel: v }); } })
                    ),
                    el(PanelBody, { title: __('Success Screen', 'blockenberg'), initialOpen: false },
                        el(TextControl,     { label: __('Title',   'blockenberg'), value: a.successTitle,   onChange: function (v) { setAttributes({ successTitle:   v }); } }),
                        el(TextareaControl, { label: __('Message', 'blockenberg'), value: a.successMessage, onChange: function (v) { setAttributes({ successMessage: v }); }, rows: 3 })
                    ),
                    el(PanelBody, { title: __('Card & Input Style', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card radius (px)',     'blockenberg'), value: a.cardRadius,    min: 0, max: 32, onChange: function (v) { setAttributes({ cardRadius:    v }); } }),
                        el(RangeControl, { label: __('Card padding (px)',    'blockenberg'), value: a.cardPadding,   min: 16, max: 64, onChange: function (v) { setAttributes({ cardPadding:   v }); } }),
                        el(RangeControl, { label: __('Input radius (px)',    'blockenberg'), value: a.inputRadius,   min: 0, max: 16, onChange: function (v) { setAttributes({ inputRadius:   v }); } }),
                        el(RangeControl, { label: __('Input padding V (px)', 'blockenberg'), value: a.inputPaddingV, min: 6, max: 20, onChange: function (v) { setAttributes({ inputPaddingV: v }); } }),
                        el(RangeControl, { label: __('Button radius (px)',   'blockenberg'), value: a.btnRadius,     min: 0, max: 99, onChange: function (v) { setAttributes({ btnRadius:     v }); } }),
                        el(RangeControl, { label: __('Step circle (px)',     'blockenberg'), value: a.stepCircleSize, min: 30, max: 64, onChange: function (v) { setAttributes({ stepCircleSize: v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTypoControl(), { label: __('Step Title', 'blockenberg'), value: a.stepTitleTypo, onChange: function (v) { setAttributes({ stepTitleTypo: v }); } }),
                        el(getTypoControl(), { label: __('Step Description', 'blockenberg'), value: a.stepDescTypo, onChange: function (v) { setAttributes({ stepDescTypo: v }); } }),
                        el(RangeControl, { label: __('Step label (px)',   'blockenberg'), value: a.stepLabelSize, min: 10, max: 16, onChange: function (v) { setAttributes({ stepLabelSize: v }); } }),
                        el(RangeControl, { label: __('Field label (px)',  'blockenberg'), value: a.labelSize,     min: 12, max: 18, onChange: function (v) { setAttributes({ labelSize:     v }); } }),
                        el(RangeControl, { label: __('Input text (px)',   'blockenberg'), value: a.inputSize,     min: 13, max: 20, onChange: function (v) { setAttributes({ inputSize:     v }); } }),
                        el(RangeControl, { label: __('Button text (px)',  'blockenberg'), value: a.btnSize,       min: 13, max: 22, onChange: function (v) { setAttributes({ btnSize:       v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',          __('Accent',                   'blockenberg'), 'accentColor'),
                        cc('activeStepBg',         __('Active step bg',           'blockenberg'), 'activeStepBg'),
                        cc('activeStepColor',      __('Active step icon',         'blockenberg'), 'activeStepColor'),
                        cc('completedStepBg',      __('Completed step bg',        'blockenberg'), 'completedStepBg'),
                        cc('completedStepColor',   __('Completed step icon',      'blockenberg'), 'completedStepColor'),
                        cc('pendingStepBg',        __('Pending step bg',          'blockenberg'), 'pendingStepBg'),
                        cc('pendingStepColor',     __('Pending step icon',        'blockenberg'), 'pendingStepColor'),
                        cc('connectorColor',       __('Connector line',           'blockenberg'), 'connectorColor'),
                        cc('connectorActiveColor', __('Connector done',           'blockenberg'), 'connectorActiveColor'),
                        cc('stepTitleColor',       __('Step title',               'blockenberg'), 'stepTitleColor'),
                        cc('stepDescColor',        __('Step desc / labels',       'blockenberg'), 'stepDescColor'),
                        cc('labelColor',           __('Field label',              'blockenberg'), 'labelColor'),
                        cc('inputBg',              __('Input background',         'blockenberg'), 'inputBg'),
                        cc('inputBorder',          __('Input border',             'blockenberg'), 'inputBorder'),
                        cc('inputText',            __('Input text',               'blockenberg'), 'inputText'),
                        cc('inputFocusBorder',     __('Input focus border',       'blockenberg'), 'inputFocusBorder'),
                        cc('btnBg',                __('Primary button bg',        'blockenberg'), 'btnBg'),
                        cc('btnColor',             __('Primary button text',      'blockenberg'), 'btnColor'),
                        cc('btnSecBg',             __('Secondary button bg',      'blockenberg'), 'btnSecBg'),
                        cc('btnSecColor',          __('Secondary button text',    'blockenberg'), 'btnSecColor'),
                        cc('cardBg',               __('Card background',          'blockenberg'), 'cardBg'),
                        cc('cardBorderColor',      __('Card border',              'blockenberg'), 'cardBorderColor'),
                        cc('bgColor',              __('Section background',       'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Form Steps & Fields', 'blockenberg'), initialOpen: false },
                        a.steps.map(function (s, si) {
                            return el(PanelBody, { key: s.id, title: (s.icon || '📋') + ' ' + (s.title || 'Step ' + (si + 1)), initialOpen: false },
                                el(IP().IconPickerControl, {
                                    iconType: s.iconType || 'custom-char',
                                    customChar: s.icon || '',
                                    dashicon: s.iconDashicon || '',
                                    imageUrl: s.iconImageUrl || '',
                                    onChangeType: function (v) { updateStep(s.id, 'iconType', v); },
                                    onChangeChar: function (v) { updateStep(s.id, 'icon', v); },
                                    onChangeDashicon: function (v) { updateStep(s.id, 'iconDashicon', v); },
                                    onChangeImageUrl: function (v) { updateStep(s.id, 'iconImageUrl', v); },
                                    label: __('Icon', 'blockenberg')
                                }),
                                el(TextControl, { label: __('Step title',   'blockenberg'), value: s.title,       onChange: function (v) { updateStep(s.id, 'title',       v); } }),
                                el(TextControl, { label: __('Description',  'blockenberg'), value: s.description, onChange: function (v) { updateStep(s.id, 'description', v); } }),
                                el('p', { style: { fontSize: '12px', fontWeight: 600, margin: '8px 0 4px' } }, __('Fields', 'blockenberg')),
                                s.fields.map(function (f, fi) {
                                    return el(PanelBody, { key: f.id, title: (f.label || 'Field ' + (fi + 1)) + ' (' + f.type + ')', initialOpen: false },
                                        el(SelectControl,  { label: __('Field type',    'blockenberg'), value: f.type,        options: FIELD_TYPE_OPTIONS, onChange: function (v) { updateField(s.id, f.id, 'type',        v); } }),
                                        el(TextControl,    { label: __('Label',         'blockenberg'), value: f.label,       onChange: function (v) { updateField(s.id, f.id, 'label',       v); } }),
                                        f.type !== 'checkbox' && el(TextControl, { label: __('Placeholder','blockenberg'), value: f.placeholder, onChange: function (v) { updateField(s.id, f.id, 'placeholder', v); } }),
                                        (f.type === 'select' || f.type === 'radio') && el(TextareaControl, { label: __('Options (one per line)', 'blockenberg'), value: (f.options || []).join('\n'), onChange: function (v) { updateField(s.id, f.id, 'options', v.split('\n').filter(function (x) { return x.trim(); })); }, rows: 3 }),
                                        el(ToggleControl,  { label: __('Required',      'blockenberg'), checked: f.required, onChange: function (v) { updateField(s.id, f.id, 'required',     v); }, __nextHasNoMarginBottom: true }),
                                        el(Button, { onClick: function () { removeField(s.id, f.id); }, isDestructive: true, variant: 'tertiary', size: 'compact', style: { marginTop: '6px' } }, __('Remove field', 'blockenberg'))
                                    );
                                }),
                                el(Button, { variant: 'secondary', size: 'compact', onClick: function () { addField(s.id); }, style: { marginTop: '6px' } }, __('+ Add Field', 'blockenberg')),
                                el(Button, { onClick: function () { setAttributes({ steps: a.steps.filter(function (st) { return st.id !== s.id; }) }); setCurrentStep(Math.max(0, safeStep - 1)); }, isDestructive: true, variant: 'tertiary', size: 'compact', style: { marginTop: '6px', display: 'block' } }, __('Remove step', 'blockenberg'))
                            );
                        }),
                        el(Button, { variant: 'primary', onClick: function () { setAttributes({ steps: a.steps.concat([{ id: makeId(), icon: '📝', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', title: __('New Step', 'blockenberg'), description: '', fields: [] }]) }); }, style: { marginTop: '8px' } }, __('+ Add Step', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-msf-outer', style: { maxWidth: a.formMaxWidth + 'px', margin: '0 auto' } },
                        el(StepIndicator, { a: a, currentStep: safeStep, onClickStep: setCurrentStep }),
                        step && el('div', { className: 'bkbg-msf-card', style: { background: a.cardBg, border: '1px solid ' + a.cardBorderColor, borderRadius: a.cardRadius + 'px', padding: a.cardPadding + 'px' } },
                            (a.showStepTitles && step.title) && el('h2', { className: 'bkbg-msf-step-title', style: { margin: '0 0 6px', color: a.stepTitleColor } }, step.title),
                            (a.showStepDescriptions && step.description) && el('p', { className: 'bkbg-msf-step-desc', style: { margin: '0 0 24px', color: a.stepDescColor } }, step.description),
                            step.fields.map(function (f) { return el(FieldPreview, { key: f.id, field: f, a: a }); }),
                            el('div', { className: 'bkbg-msf-nav', style: { display: 'flex', justifyContent: 'space-between', marginTop: '24px', gap: '12px' } },
                                el('div', null,
                                    safeStep > 0 && el('button', { type: 'button', onClick: function () { setCurrentStep(safeStep - 1); }, style: { padding: '0 24px', height: (a.btnSize + 20) + 'px', borderRadius: a.btnRadius + 'px', border: '1.5px solid ' + a.cardBorderColor, background: a.btnSecBg, color: a.btnSecColor, cursor: 'pointer', fontSize: a.btnSize + 'px', fontFamily: 'inherit' } }, a.btnPrevLabel)
                                ),
                                el('button', { type: 'button', onClick: function () { if (!isLast && safeStep < a.steps.length - 1) setCurrentStep(safeStep + 1); }, style: { padding: '0 28px', height: (a.btnSize + 20) + 'px', borderRadius: a.btnRadius + 'px', border: 'none', background: a.btnBg, color: a.btnColor, cursor: 'pointer', fontSize: a.btnSize + 'px', fontFamily: 'inherit', fontWeight: 700 } }, isLast ? a.btnSubmitLabel : a.btnNextLabel)
                            )
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-msf-wrapper bkbg-msf-progress--' + a.progressStyle, style: buildWrapStyle(a) }),
                el('div', { className: 'bkbg-msf-outer', style: { maxWidth: a.formMaxWidth + 'px', margin: '0 auto' } },
                    el('div', { className: 'bkbg-msf-indicator', 'data-progress': a.progressStyle, 'data-steps': a.steps.length, 'aria-hidden': 'true' }),
                    el('form', { className: 'bkbg-msf-form', noValidate: true, 'data-current-step': '0', 'data-total-steps': a.steps.length },
                        a.steps.map(function (s, si) {
                            return el('div', { key: s.id, className: 'bkbg-msf-step-panel', 'data-step-idx': si, 'aria-hidden': si === 0 ? 'false' : 'true', style: { display: si === 0 ? 'block' : 'none' } },
                                el('div', { className: 'bkbg-msf-card' },
                                    (a.showStepTitles && s.title) && el('h2', { className: 'bkbg-msf-step-title' }, s.title),
                                    (a.showStepDescriptions && s.description) && el('p', { className: 'bkbg-msf-step-desc' }, s.description),
                                    el('div', { className: 'bkbg-msf-fields' },
                                        s.fields.map(function (f) {
                                            return el('div', { key: f.id, className: 'bkbg-msf-field', 'data-field-id': f.id },
                                                f.type !== 'checkbox' && el('label', { htmlFor: f.id, className: 'bkbg-msf-label' }, f.label, f.required && el('span', { 'aria-hidden': 'true' }, ' *')),
                                                f.type === 'textarea' && el('textarea', { id: f.id, name: f.id, className: 'bkbg-msf-input', placeholder: f.placeholder, required: f.required, rows: 3 }),
                                                (f.type === 'text' || f.type === 'email' || f.type === 'phone') && el('input', { type: f.type === 'phone' ? 'tel' : f.type, id: f.id, name: f.id, className: 'bkbg-msf-input', placeholder: f.placeholder, required: f.required }),
                                                f.type === 'select' && el('select', { id: f.id, name: f.id, className: 'bkbg-msf-input', required: f.required },
                                                    el('option', { value: '' }, f.placeholder || '— Select —'),
                                                    (f.options || []).map(function (opt, oi) { return el('option', { key: oi, value: opt }, opt); })
                                                ),
                                                f.type === 'radio' && el('div', { className: 'bkbg-msf-radio-group' },
                                                    (f.options || []).map(function (opt, oi) {
                                                        return el('label', { key: oi, className: 'bkbg-msf-radio-label' },
                                                            el('input', { type: 'radio', name: f.id, value: opt, required: f.required && oi === 0 }),
                                                            el('span', null, opt)
                                                        );
                                                    })
                                                ),
                                                f.type === 'checkbox' && el('label', { className: 'bkbg-msf-checkbox-label' },
                                                    el('input', { type: 'checkbox', name: f.id, required: f.required }),
                                                    el('span', null, f.label)
                                                )
                                            );
                                        })
                                    ),
                                    el('div', { className: 'bkbg-msf-nav' },
                                        el('button', { type: 'button', className: 'bkbg-msf-btn-prev' + (si === 0 ? ' is-hidden' : ''), 'data-action': 'prev' }, a.btnPrevLabel),
                                        el('button', { type: si < a.steps.length - 1 ? 'button' : 'submit', className: 'bkbg-msf-btn-next', 'data-action': si < a.steps.length - 1 ? 'next' : 'submit' }, si < a.steps.length - 1 ? a.btnNextLabel : a.btnSubmitLabel)
                                    )
                                )
                            );
                        }),
                        el('div', { className: 'bkbg-msf-success is-hidden', 'aria-live': 'polite' },
                            el('h2', { className: 'bkbg-msf-success-title' }, a.successTitle),
                            el('p',  { className: 'bkbg-msf-success-msg'   }, a.successMessage)
                        )
                    )
                )
            );
        }
    });
}() );
