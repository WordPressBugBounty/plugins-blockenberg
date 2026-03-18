( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    var PROGRESS_STYLE_OPTIONS = [
        { label: __('Progress bar', 'blockenberg'), value: 'bar'  },
        { label: __('Dots',         'blockenberg'), value: 'dots' },
        { label: __('Fraction (1/3)','blockenberg'), value: 'fraction' },
    ];

    function makeId() { return 'qz' + Math.random().toString(36).substr(2, 5); }
    var IP = function () { return window.bkbgIconPicker; };

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function buildWrapStyle(a) {
        var _tv = getTypoCssVars();
        var s = {
            '--bkbg-qz-accent':          a.accentColor,
            '--bkbg-qz-selected-bg':     a.selectedBg,
            '--bkbg-qz-selected-color':  a.selectedColor,
            '--bkbg-qz-selected-border': a.selectedBorder,
            '--bkbg-qz-option-bg':       a.optionBg,
            '--bkbg-qz-option-border':   a.optionBorder,
            '--bkbg-qz-option-text':     a.optionText,
            '--bkbg-qz-btn-bg':          a.btnBg,
            '--bkbg-qz-btn-color':       a.btnColor,
            '--bkbg-qz-retake-bg':       a.retakeBg,
            '--bkbg-qz-retake-color':    a.retakeColor,
            '--bkbg-qz-progress-fill':   a.progressFill,
            '--bkbg-qz-progress-track':  a.progressTrack,
            '--bkbg-qz-card-bg':         a.cardBg,
            '--bkbg-qz-card-border':     a.cardBorder,
            '--bkbg-qz-result-card-bg':  a.resultCardBg,
            '--bkbg-qz-title-color':     a.titleColor,
            '--bkbg-qz-question-color':  a.questionColor,
            '--bkbg-qz-result-title':    a.resultTitleColor,
            '--bkbg-qz-result-desc':     a.resultDescColor,
            '--bkbg-qz-card-r':          a.cardRadius + 'px',
            '--bkbg-qz-card-pad':        a.cardPadding + 'px',
            '--bkbg-qz-opt-r':           a.optionRadius + 'px',
            '--bkbg-qz-opt-pad':         a.optionPadding + 'px',
            '--bkbg-qz-btn-r':           a.btnRadius + 'px',
            '--bkbg-qz-result-icon-sz':  a.resultIconSize + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
        if (_tv) {
            Object.assign(s, _tv(a.titleTypo || {}, '--bkbg-qz-tt-'));
            Object.assign(s, _tv(a.descTypo || {}, '--bkbg-qz-ds-'));
            Object.assign(s, _tv(a.questionTypo || {}, '--bkbg-qz-qt-'));
            Object.assign(s, _tv(a.optionTypo || {}, '--bkbg-qz-op-'));
            Object.assign(s, _tv(a.resTitleTypo || {}, '--bkbg-qz-rt-'));
            Object.assign(s, _tv(a.resDescTypo || {}, '--bkbg-qz-rd-'));
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

    /* ── Progress indicator ─────────────────────────────────────────── */
    function ProgressIndicator(props) {
        var current = props.current;
        var total   = props.total;
        var a       = props.a;

        if (!a.showProgress || total === 0) return null;

        if (a.progressStyle === 'fraction') {
            return el('div', { className: 'bkbg-qz-progress bkbg-qz-progress--fraction', style: { textAlign: 'right', color: a.questionColor, marginBottom: '12px', opacity: 0.7 } },
                (current + 1) + ' / ' + total
            );
        }

        if (a.progressStyle === 'dots') {
            return el('div', { className: 'bkbg-qz-progress bkbg-qz-progress--dots', style: { display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '20px' } },
                Array.from({ length: total }, function (_, i) {
                    return el('div', { key: i, style: { width: i <= current ? '20px' : '8px', height: '8px', borderRadius: '99px', background: i <= current ? a.progressFill : a.progressTrack, transition: 'all 0.3s' } });
                })
            );
        }

        /* bar (default) */
        var pct = total > 1 ? ((current) / (total - 1)) * 100 : 0;
        return el('div', { className: 'bkbg-qz-progress bkbg-qz-progress--bar', style: { marginBottom: '20px' } },
            el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: a.questionColor, opacity: 0.6, marginBottom: '6px' } },
                el('span', null, __('Question', 'blockenberg') + ' ' + (current + 1)),
                el('span', null, total + ' ' + __('total', 'blockenberg'))
            ),
            el('div', { style: { height: '6px', borderRadius: '99px', background: a.progressTrack, overflow: 'hidden' } },
                el('div', { className: 'bkbg-qz-progress-fill', style: { height: '100%', width: pct + '%', background: a.progressFill, borderRadius: '99px', transition: 'width 0.4s ease' } })
            )
        );
    }

    /* ── Question preview ───────────────────────────────────────────── */
    function QuestionPreview(props) {
        var q          = props.question;
        var idx        = props.idx;
        var total      = props.total;
        var a          = props.a;
        var selected   = props.selected;
        var onSelect   = props.onSelect;

        var optionBase = {
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: a.optionPadding + 'px',
            borderRadius: a.optionRadius + 'px',
            border: '2px solid ' + a.optionBorder,
            background: a.optionBg,
            cursor: 'pointer',
            marginBottom: '10px',
            color: a.optionText,
            transition: 'all 0.15s',
            fontFamily: 'inherit',
            textAlign: 'left',
            width: '100%',
            boxSizing: 'border-box',
        };

        return el('div', { className: 'bkbg-qz-question' },
            el(ProgressIndicator, { current: idx, total: total, a: a }),
            el('h3', { className: 'bkbg-qz-question-text', style: { color: a.questionColor, marginBottom: '20px' } }, q.question),
            el('div', { className: 'bkbg-qz-options' },
                q.options.map(function (opt) {
                    var isSelected = selected === opt.id;
                    return el('button', {
                        key: opt.id, type: 'button',
                        className: 'bkbg-qz-option' + (isSelected ? ' is-selected' : ''),
                        onClick: function () { onSelect(opt.id); },
                        style: Object.assign({}, optionBase, isSelected ? {
                            background: a.selectedBg,
                            color: a.selectedColor,
                            borderColor: a.selectedBorder,
                            fontWeight: 700,
                        } : {}),
                    },
                        el('span', { className: 'bkbg-qz-option-dot', style: { width: '18px', height: '18px', borderRadius: '50%', border: '2px solid ' + (isSelected ? a.selectedBorder : a.optionBorder), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' } }),
                        el('span', null, opt.text)
                    );
                })
            )
        );
    }

    /* ── Result preview ─────────────────────────────────────────────── */
    function ResultPreview(props) {
        var result = props.result;
        var a      = props.a;

        return el('div', { className: 'bkbg-qz-result', style: { background: a.resultCardBg, borderRadius: a.cardRadius + 'px', padding: a.cardPadding + 'px', textAlign: 'center' } },
            el('div', { className: 'bkbg-qz-result-icon', style: { fontSize: a.resultIconSize + 'px', marginBottom: '16px' } }, (result.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(result.iconType, result.icon, result.iconDashicon, result.iconImageUrl, result.iconDashiconColor) : result.icon),
            el('p', { className: 'bkbg-qz-result-heading', style: { fontWeight: 700, color: a.accentColor, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' } }, a.resultHeading),
            el('h3', { className: 'bkbg-qz-result-title', style: { color: a.resultTitleColor, margin: '0 0 12px' } }, result.title),
            el('p', { className: 'bkbg-qz-result-desc', style: { color: a.resultDescColor, margin: 0 } }, result.description),
            result.imageUrl && el('img', { src: result.imageUrl, alt: result.title, style: { maxWidth: '100%', borderRadius: '8px', marginTop: '16px' } }),
            a.showRetake && el('button', { type: 'button', style: { marginTop: '24px', padding: '12px 28px', borderRadius: a.btnRadius + 'px', border: 'none', background: a.retakeBg, color: a.retakeColor, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, a.retakeLabel)
        );
    }

    var v1Attributes = {
        quizTitle: { type: 'string', default: "What's Your Productivity Style?" },
        quizDescription: { type: 'string', default: 'Answer 3 quick questions to discover which work style fits you best.' },
        showTitle: { type: 'boolean', default: true },
        showDescription: { type: 'boolean', default: true },
        questions: { type: 'array', default: [
            { id: 'q1', question: 'How do you prefer to organise your day?', options: [
                { id: 'q1o1', text: 'Strict timed blocks — every hour is scheduled', points: 3 },
                { id: 'q1o2', text: 'A prioritised to-do list I work through flexibly', points: 2 },
                { id: 'q1o3', text: 'I react to what comes up as the day unfolds', points: 1 },
                { id: 'q1o4', text: 'I have a general direction but no set plan', points: 0 }
            ] },
            { id: 'q2', question: 'When distractions hit, you usually…', options: [
                { id: 'q2o1', text: 'Block notifications and return to deep focus fast', points: 3 },
                { id: 'q2o2', text: 'Finish the distraction then get back on track', points: 2 },
                { id: 'q2o3', text: 'Find it hard to return with the same momentum', points: 1 },
                { id: 'q2o4', text: 'Rarely recover focus the same day', points: 0 }
            ] },
            { id: 'q3', question: 'How do you feel about planning tomorrow the night before?', options: [
                { id: 'q3o1', text: "I always do it — it's non-negotiable", points: 3 },
                { id: 'q3o2', text: 'Usually yes, if I remember', points: 2 },
                { id: 'q3o3', text: 'Sometimes, but I often skip it', points: 1 },
                { id: 'q3o4', text: 'Rarely — I prefer to improvise', points: 0 }
            ] }
        ] },
        resultRanges: { type: 'array', default: [
            { id: 'r1', minScore: 0, maxScore: 3, icon: '🌱', title: 'The Free-Spirited Explorer', description: 'You prefer spontaneity over structure. Embracing a few simple habits could unlock a big jump in your output without sacrificing your flexibility.', imageUrl: '', imageId: 0 },
            { id: 'r2', minScore: 4, maxScore: 6, icon: '⚡', title: 'The Balanced Achiever', description: 'You mix structure with adaptability well. Fine-tuning your focus rituals and planning consistency could push you from good to exceptional.', imageUrl: '', imageId: 0 },
            { id: 'r3', minScore: 7, maxScore: 9, icon: '🏆', title: 'The Power Planner', description: "You're a productivity powerhouse! Your systems are strong — focus now on protecting energy and avoiding burnout while scaling what works.", imageUrl: '', imageId: 0 }
        ] },
        progressStyle: { type: 'string', default: 'bar' },
        showProgress: { type: 'boolean', default: true },
        oneAtATime: { type: 'boolean', default: true },
        randomize: { type: 'boolean', default: false },
        submitLabel: { type: 'string', default: 'See My Results' },
        retakeLabel: { type: 'string', default: 'Retake Quiz' },
        showRetake: { type: 'boolean', default: true },
        resultHeading: { type: 'string', default: 'Your Result' },
        formMaxWidth: { type: 'integer', default: 640 },
        cardRadius: { type: 'integer', default: 20 },
        cardPadding: { type: 'integer', default: 40 },
        optionRadius: { type: 'integer', default: 10 },
        optionPadding: { type: 'integer', default: 16 },
        btnRadius: { type: 'integer', default: 10 },
        titleSize: { type: 'integer', default: 26 },
        descSize: { type: 'integer', default: 15 },
        questionSize: { type: 'integer', default: 20 },
        optionSize: { type: 'integer', default: 15 },
        resultTitleSize: { type: 'integer', default: 24 },
        resultDescSize: { type: 'integer', default: 15 },
        accentColor: { type: 'string', default: '#6c3fb5' },
        selectedBg: { type: 'string', default: '#ede9f7' },
        selectedColor: { type: 'string', default: '#6c3fb5' },
        selectedBorder: { type: 'string', default: '#6c3fb5' },
        optionBg: { type: 'string', default: '#f9fafb' },
        optionBorder: { type: 'string', default: '#e5e7eb' },
        optionText: { type: 'string', default: '#374151' },
        btnBg: { type: 'string', default: '#6c3fb5' },
        btnColor: { type: 'string', default: '#ffffff' },
        retakeBg: { type: 'string', default: '#f3f4f6' },
        retakeColor: { type: 'string', default: '#374151' },
        progressFill: { type: 'string', default: '#6c3fb5' },
        progressTrack: { type: 'string', default: '#e5e7eb' },
        cardBg: { type: 'string', default: '#ffffff' },
        cardBorder: { type: 'string', default: '#e5e7eb' },
        resultCardBg: { type: 'string', default: '#f9fafb' },
        resultIconSize: { type: 'integer', default: 48 },
        titleColor: { type: 'string', default: '#111827' },
        questionColor: { type: 'string', default: '#1f2937' },
        resultTitleColor: { type: 'string', default: '#111827' },
        resultDescColor: { type: 'string', default: '#6b7280' },
        bgColor: { type: 'string', default: '' },
        paddingTop: { type: 'integer', default: 64 },
        paddingBottom: { type: 'integer', default: 64 }
    };

    function buildWrapStyleV1(a) {
        return {
            '--bkbg-qz-accent':          a.accentColor,
            '--bkbg-qz-selected-bg':     a.selectedBg,
            '--bkbg-qz-selected-color':  a.selectedColor,
            '--bkbg-qz-selected-border': a.selectedBorder,
            '--bkbg-qz-option-bg':       a.optionBg,
            '--bkbg-qz-option-border':   a.optionBorder,
            '--bkbg-qz-option-text':     a.optionText,
            '--bkbg-qz-btn-bg':          a.btnBg,
            '--bkbg-qz-btn-color':       a.btnColor,
            '--bkbg-qz-retake-bg':       a.retakeBg,
            '--bkbg-qz-retake-color':    a.retakeColor,
            '--bkbg-qz-progress-fill':   a.progressFill,
            '--bkbg-qz-progress-track':  a.progressTrack,
            '--bkbg-qz-card-bg':         a.cardBg,
            '--bkbg-qz-card-border':     a.cardBorder,
            '--bkbg-qz-result-card-bg':  a.resultCardBg,
            '--bkbg-qz-title-color':     a.titleColor,
            '--bkbg-qz-question-color':  a.questionColor,
            '--bkbg-qz-result-title':    a.resultTitleColor,
            '--bkbg-qz-result-desc':     a.resultDescColor,
            '--bkbg-qz-card-r':          a.cardRadius + 'px',
            '--bkbg-qz-card-pad':        a.cardPadding + 'px',
            '--bkbg-qz-opt-r':           a.optionRadius + 'px',
            '--bkbg-qz-opt-pad':         a.optionPadding + 'px',
            '--bkbg-qz-btn-r':           a.btnRadius + 'px',
            '--bkbg-qz-title-sz':        a.titleSize + 'px',
            '--bkbg-qz-desc-sz':         a.descSize + 'px',
            '--bkbg-qz-question-sz':     a.questionSize + 'px',
            '--bkbg-qz-option-sz':       a.optionSize + 'px',
            '--bkbg-qz-result-title-sz': a.resultTitleSize + 'px',
            '--bkbg-qz-result-desc-sz':  a.resultDescSize + 'px',
            '--bkbg-qz-result-icon-sz':  a.resultIconSize + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
    }

    registerBlockType('blockenberg/quiz', {
        title: __('Scored Quiz', 'blockenberg'),
        icon: 'clipboard',
        category: 'bkbg-interactive',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var TC = getTypoControl();

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            /* Editor preview state */
            var previewModeState = useState('question');  /* 'question' | 'result' */
            var previewMode = previewModeState[0];
            var setPreviewMode = previewModeState[1];

            var previewQIdxState = useState(0);
            var previewQIdx = previewQIdxState[0];
            var setPreviewQIdx = previewQIdxState[1];

            var selectedOptsState = useState({});
            var selectedOpts = selectedOptsState[0];
            var setSelectedOpts = selectedOptsState[1];

            var previewResultIdxState = useState(0);
            var previewResultIdx = previewResultIdxState[0];
            var setPreviewResultIdx = previewResultIdxState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateQuestion(qId, key, val) {
                setAttributes({ questions: a.questions.map(function (q) {
                    if (q.id !== qId) return q;
                    var u = Object.assign({}, q); u[key] = val; return u;
                }) });
            }

            function updateOption(qId, oId, key, val) {
                setAttributes({ questions: a.questions.map(function (q) {
                    if (q.id !== qId) return q;
                    return Object.assign({}, q, { options: q.options.map(function (o) {
                        if (o.id !== oId) return o;
                        var u = Object.assign({}, o); u[key] = val; return u;
                    }) });
                }) });
            }

            function addOption(qId) {
                setAttributes({ questions: a.questions.map(function (q) {
                    if (q.id !== qId) return q;
                    return Object.assign({}, q, { options: q.options.concat([{ id: makeId(), text: __('New option', 'blockenberg'), points: 1 }]) });
                }) });
            }

            function updateResult(rId, key, val) {
                setAttributes({ resultRanges: a.resultRanges.map(function (r) {
                    if (r.id !== rId) return r;
                    var u = Object.assign({}, r); u[key] = val; return u;
                }) });
            }

            var safeQIdx = Math.min(previewQIdx, a.questions.length - 1);
            var currentQ = a.questions[safeQIdx];
            var currentResult = a.resultRanges[previewResultIdx] || a.resultRanges[0];

            /* card wrapper style */
            var cardStyle = {
                background: a.cardBg,
                border: '1px solid ' + a.cardBorder,
                borderRadius: a.cardRadius + 'px',
                padding: a.cardPadding + 'px',
                boxSizing: 'border-box',
            };

            /* preview toolbar */
            var toolbar = el('div', { style: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' } },
                el('div', { style: { display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '8px', padding: '4px' } },
                    el(Button, { variant: previewMode === 'question' ? 'primary' : 'tertiary', size: 'compact', onClick: function () { setPreviewMode('question'); } }, __('Questions', 'blockenberg')),
                    el(Button, { variant: previewMode === 'result'   ? 'primary' : 'tertiary', size: 'compact', onClick: function () { setPreviewMode('result');   } }, __('Results', 'blockenberg'))
                ),
                previewMode === 'question' && a.questions.length > 1 && el('div', { style: { display: 'flex', gap: '4px', alignItems: 'center' } },
                    el(Button, { size: 'compact', variant: 'secondary', disabled: safeQIdx <= 0, onClick: function () { setPreviewQIdx(Math.max(0, safeQIdx - 1)); } }, '←'),
                    el('span', { style: { fontSize: '12px', padding: '0 4px' } }, (safeQIdx + 1) + ' / ' + a.questions.length),
                    el(Button, { size: 'compact', variant: 'secondary', disabled: safeQIdx >= a.questions.length - 1, onClick: function () { setPreviewQIdx(Math.min(a.questions.length - 1, safeQIdx + 1)); } }, '→')
                ),
                previewMode === 'result' && a.resultRanges.length > 1 && el('div', { style: { display: 'flex', gap: '4px', alignItems: 'center' } },
                    el(Button, { size: 'compact', variant: 'secondary', disabled: previewResultIdx <= 0, onClick: function () { setPreviewResultIdx(Math.max(0, previewResultIdx - 1)); } }, '←'),
                    el('span', { style: { fontSize: '12px', padding: '0 4px' } }, (previewResultIdx + 1) + ' / ' + a.resultRanges.length),
                    el(Button, { size: 'compact', variant: 'secondary', disabled: previewResultIdx >= a.resultRanges.length - 1, onClick: function () { setPreviewResultIdx(previewResultIdx + 1); } }, '→')
                )
            );

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Quiz Settings', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show title',       'blockenberg'), checked: a.showTitle,       onChange: function (v) { setAttributes({ showTitle:       v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show description', 'blockenberg'), checked: a.showDescription, onChange: function (v) { setAttributes({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show progress',    'blockenberg'), checked: a.showProgress,    onChange: function (v) { setAttributes({ showProgress:    v }); }, __nextHasNoMarginBottom: true }),
                        a.showProgress && el(SelectControl, { label: __('Progress style', 'blockenberg'), value: a.progressStyle, options: PROGRESS_STYLE_OPTIONS, onChange: function (v) { setAttributes({ progressStyle: v }); } }),
                        el(ToggleControl, { label: __('One question at a time', 'blockenberg'), checked: a.oneAtATime, onChange: function (v) { setAttributes({ oneAtATime: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Randomize questions',    'blockenberg'), checked: a.randomize,  onChange: function (v) { setAttributes({ randomize:  v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Max width (px)',  'blockenberg'), value: a.formMaxWidth, min: 400, max: 900, onChange: function (v) { setAttributes({ formMaxWidth: v }); } })
                    ),
                    el(PanelBody, { title: __('Labels', 'blockenberg'), initialOpen: false },
                        el(TextControl, { label: __('Submit button',   'blockenberg'), value: a.submitLabel,   onChange: function (v) { setAttributes({ submitLabel:   v }); } }),
                        el(TextControl, { label: __('Result heading',  'blockenberg'), value: a.resultHeading, onChange: function (v) { setAttributes({ resultHeading: v }); } }),
                        el(ToggleControl, { label: __('Show retake button', 'blockenberg'), checked: a.showRetake, onChange: function (v) { setAttributes({ showRetake: v }); }, __nextHasNoMarginBottom: true }),
                        a.showRetake && el(TextControl, { label: __('Retake label', 'blockenberg'), value: a.retakeLabel, onChange: function (v) { setAttributes({ retakeLabel: v }); } })
                    ),
                    el(PanelBody, { title: __('Card & Option Style', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card radius (px)',   'blockenberg'), value: a.cardRadius,   min: 0, max: 32, onChange: function (v) { setAttributes({ cardRadius:   v }); } }),
                        el(RangeControl, { label: __('Card padding (px)',  'blockenberg'), value: a.cardPadding,  min: 12, max: 64, onChange: function (v) { setAttributes({ cardPadding:  v }); } }),
                        el(RangeControl, { label: __('Option radius (px)', 'blockenberg'), value: a.optionRadius, min: 0, max: 24, onChange: function (v) { setAttributes({ optionRadius: v }); } }),
                        el(RangeControl, { label: __('Option padding (px)','blockenberg'), value: a.optionPadding, min: 8, max: 32, onChange: function (v) { setAttributes({ optionPadding: v }); } }),
                        el(RangeControl, { label: __('Button radius (px)', 'blockenberg'), value: a.btnRadius,    min: 0, max: 99, onChange: function (v) { setAttributes({ btnRadius:    v }); } }),
                        el(RangeControl, { label: __('Result icon (px)',   'blockenberg'), value: a.resultIconSize, min: 28, max: 80, onChange: function (v) { setAttributes({ resultIconSize: v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        TC && el(TC, { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function(v) { setAttributes({ titleTypo: v }); } }),
                        TC && el(TC, { label: __('Description', 'blockenberg'), value: a.descTypo || {}, onChange: function(v) { setAttributes({ descTypo: v }); } }),
                        TC && el(TC, { label: __('Question', 'blockenberg'), value: a.questionTypo || {}, onChange: function(v) { setAttributes({ questionTypo: v }); } }),
                        TC && el(TC, { label: __('Option', 'blockenberg'), value: a.optionTypo || {}, onChange: function(v) { setAttributes({ optionTypo: v }); } }),
                        TC && el(TC, { label: __('Result Title', 'blockenberg'), value: a.resTitleTypo || {}, onChange: function(v) { setAttributes({ resTitleTypo: v }); } }),
                        TC && el(TC, { label: __('Result Description', 'blockenberg'), value: a.resDescTypo || {}, onChange: function(v) { setAttributes({ resDescTypo: v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',       __('Accent',           'blockenberg'), 'accentColor'),
                        cc('titleColor',        __('Title',            'blockenberg'), 'titleColor'),
                        cc('questionColor',     __('Question text',    'blockenberg'), 'questionColor'),
                        cc('optionBg',          __('Option bg',        'blockenberg'), 'optionBg'),
                        cc('optionBorder',      __('Option border',    'blockenberg'), 'optionBorder'),
                        cc('optionText',        __('Option text',      'blockenberg'), 'optionText'),
                        cc('selectedBg',        __('Selected bg',      'blockenberg'), 'selectedBg'),
                        cc('selectedColor',     __('Selected text',    'blockenberg'), 'selectedColor'),
                        cc('selectedBorder',    __('Selected border',  'blockenberg'), 'selectedBorder'),
                        cc('btnBg',             __('Submit btn bg',    'blockenberg'), 'btnBg'),
                        cc('btnColor',          __('Submit btn text',  'blockenberg'), 'btnColor'),
                        cc('retakeBg',          __('Retake btn bg',    'blockenberg'), 'retakeBg'),
                        cc('retakeColor',       __('Retake btn text',  'blockenberg'), 'retakeColor'),
                        cc('progressFill',      __('Progress fill',    'blockenberg'), 'progressFill'),
                        cc('progressTrack',     __('Progress track',   'blockenberg'), 'progressTrack'),
                        cc('cardBg',            __('Card bg',          'blockenberg'), 'cardBg'),
                        cc('cardBorder',        __('Card border',      'blockenberg'), 'cardBorder'),
                        cc('resultCardBg',      __('Result card bg',   'blockenberg'), 'resultCardBg'),
                        cc('resultTitleColor',  __('Result title',     'blockenberg'), 'resultTitleColor'),
                        cc('resultDescColor',   __('Result desc',      'blockenberg'), 'resultDescColor'),
                        cc('bgColor',           __('Section bg',       'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Questions', 'blockenberg'), initialOpen: false },
                        a.questions.map(function (q, qi) {
                            return el(PanelBody, { key: q.id, title: 'Q' + (qi + 1) + ': ' + (q.question ? q.question.substring(0, 30) : '…'), initialOpen: false },
                                el(TextareaControl, { label: __('Question', 'blockenberg'), value: q.question, rows: 2, onChange: function (v) { updateQuestion(q.id, 'question', v); } }),
                                el('p', { style: { fontSize: '12px', fontWeight: 600, margin: '6px 0 4px' } }, __('Options', 'blockenberg')),
                                q.options.map(function (o, oi) {
                                    return el('div', { key: o.id, style: { display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '8px' } },
                                        el('div', { style: { flex: 1 } },
                                            el(TextareaControl, { label: __('Text', 'blockenberg'), value: o.text, rows: 1, onChange: function (v) { updateOption(q.id, o.id, 'text', v); }, hideLabelFromVision: true }),
                                            el(RangeControl, { label: __('Points', 'blockenberg'), value: o.points, min: 0, max: 10, onChange: function (v) { updateOption(q.id, o.id, 'points', v); } })
                                        ),
                                        el(Button, { onClick: function () { updateQuestion(q.id, 'options', q.options.filter(function (x) { return x.id !== o.id; })); }, isDestructive: true, variant: 'tertiary', size: 'compact', icon: 'trash', label: __('Remove', 'blockenberg') })
                                    );
                                }),
                                el(Button, { variant: 'secondary', size: 'compact', onClick: function () { addOption(q.id); } }, '+ ' + __('Add option', 'blockenberg')),
                                el(Button, { onClick: function () { setAttributes({ questions: a.questions.filter(function (x) { return x.id !== q.id; }) }); }, isDestructive: true, variant: 'tertiary', size: 'compact', style: { marginTop: '8px', display: 'block' } }, __('Remove question', 'blockenberg'))
                            );
                        }),
                        el(Button, { variant: 'primary', style: { marginTop: '8px' }, onClick: function () { setAttributes({ questions: a.questions.concat([{ id: makeId(), question: __('New question', 'blockenberg'), options: [{ id: makeId(), text: __('Option A', 'blockenberg'), points: 0 }, { id: makeId(), text: __('Option B', 'blockenberg'), points: 1 }] }]) }); } }, '+ ' + __('Add question', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Result Ranges', 'blockenberg'), initialOpen: false },
                        a.resultRanges.map(function (r, ri) {
                            return el(PanelBody, { key: r.id, title: ((r.iconType || 'custom-char') === 'custom-char' ? (r.icon || '') : '⬡') + ' ' + (r.title ? r.title.substring(0, 22) : 'Range ' + (ri + 1)) + ' (' + r.minScore + '–' + r.maxScore + ')', initialOpen: false },
                                el(IP().IconPickerControl, {
                                    iconType: r.iconType || 'custom-char',
                                    customChar: r.icon,
                                    dashicon: r.iconDashicon || '',
                                    imageUrl: r.iconImageUrl || '',
                                    onChangeType: function (v) { updateResult(r.id, 'iconType', v); },
                                    onChangeChar: function (v) { updateResult(r.id, 'icon', v); },
                                    onChangeDashicon: function (v) { updateResult(r.id, 'iconDashicon', v); },
                                    onChangeImageUrl: function (v) { updateResult(r.id, 'iconImageUrl', v); }
                                }),
                                el(TextControl,     { label: __('Title',        'blockenberg'), value: r.title,       onChange: function (v) { updateResult(r.id, 'title',       v); } }),
                                el(TextareaControl, { label: __('Description',  'blockenberg'), value: r.description, rows: 3, onChange: function (v) { updateResult(r.id, 'description', v); } }),
                                el(RangeControl,    { label: __('Min score',    'blockenberg'), value: r.minScore, min: 0, max: 100, onChange: function (v) { updateResult(r.id, 'minScore', v); } }),
                                el(RangeControl,    { label: __('Max score',    'blockenberg'), value: r.maxScore, min: 0, max: 100, onChange: function (v) { updateResult(r.id, 'maxScore', v); } }),
                                el(MediaUploadCheck, null, el(MediaUpload, { onSelect: function (m) { updateResult(r.id, 'imageUrl', m.url); updateResult(r.id, 'imageId', m.id); }, allowedTypes: ['image'], value: r.imageId, render: function (rp) { return el(Button, { variant: 'secondary', size: 'compact', onClick: rp.open }, r.imageUrl ? __('Change image', 'blockenberg') : __('Upload image', 'blockenberg')); } })),
                                el(Button, { onClick: function () { setAttributes({ resultRanges: a.resultRanges.filter(function (x) { return x.id !== r.id; }) }); }, isDestructive: true, variant: 'tertiary', size: 'compact', style: { marginTop: '8px', display: 'block' } }, __('Remove range', 'blockenberg'))
                            );
                        }),
                        el(Button, { variant: 'primary', style: { marginTop: '8px' }, onClick: function () { setAttributes({ resultRanges: a.resultRanges.concat([{ id: makeId(), minScore: 0, maxScore: 10, icon: '⭐', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', title: __('New Result', 'blockenberg'), description: '', imageUrl: '', imageId: 0 }]) }); } }, '+ ' + __('Add result range', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-qz-outer', style: { maxWidth: a.formMaxWidth + 'px', margin: '0 auto' } },
                        /* quiz header */
                        (a.showTitle || a.showDescription) && el('div', { className: 'bkbg-qz-header', style: { marginBottom: '28px', textAlign: 'center' } },
                            a.showTitle && el(RichText, { tagName: 'h2', className: 'bkbg-qz-title', value: a.quizTitle, onChange: function (v) { setAttributes({ quizTitle: v }); }, placeholder: __('Quiz title…', 'blockenberg'), style: { color: a.titleColor, margin: '0 0 10px' } }),
                            a.showDescription && el(RichText, { tagName: 'p', className: 'bkbg-qz-description', value: a.quizDescription, onChange: function (v) { setAttributes({ quizDescription: v }); }, placeholder: __('Short description…', 'blockenberg'), style: { color: a.questionColor, opacity: 0.75, margin: 0 } })
                        ),
                        /* editor toolbar */
                        toolbar,
                        /* preview card */
                        el('div', { className: 'bkbg-qz-card', style: cardStyle },
                            previewMode === 'question' && a.questions.length > 0 && el(Fragment, null,
                                el(QuestionPreview, { question: currentQ, idx: safeQIdx, total: a.questions.length, a: a, selected: selectedOpts[currentQ.id], onSelect: function (oId) { var u = Object.assign({}, selectedOpts); u[currentQ.id] = oId; setSelectedOpts(u); } }),
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '10px' } },
                                    el('div', null),
                                    el('button', { type: 'button', style: { padding: '12px 28px', borderRadius: a.btnRadius + 'px', border: 'none', background: a.btnBg, color: a.btnColor, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } },
                                        safeQIdx < a.questions.length - 1 ? __('Next →', 'blockenberg') : a.submitLabel
                                    )
                                )
                            ),
                            previewMode === 'result' && currentResult && el(ResultPreview, { result: currentResult, a: a }),
                            a.questions.length === 0 && el('p', { style: { textAlign: 'center', color: '#9ca3af', padding: '24px 0' } }, __('Add questions in the panel →', 'blockenberg'))
                        )
                    )
                )
            );
        },

        deprecated: [{
            attributes: v1Attributes,
            save: function (props) {
                var a = props.attributes;
                return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-qz-wrapper', style: buildWrapStyleV1(a) }),
                    el('div', { className: 'bkbg-qz-outer', style: { maxWidth: a.formMaxWidth + 'px', margin: '0 auto' } },
                        (a.showTitle || a.showDescription) && el('div', { className: 'bkbg-qz-header' },
                            a.showTitle && el(RichText.Content, { tagName: 'h2', className: 'bkbg-qz-title', value: a.quizTitle }),
                            a.showDescription && el(RichText.Content, { tagName: 'p', className: 'bkbg-qz-description', value: a.quizDescription })
                        ),
                        el('div', { className: 'bkbg-qz-card', 'data-one-at-a-time': a.oneAtATime ? 'true' : 'false', 'data-randomize': a.randomize ? 'true' : 'false', 'data-progress-style': a.progressStyle, 'data-show-progress': a.showProgress ? 'true' : 'false' },
                            el('div', { className: 'bkbg-qz-progress-wrap', 'aria-hidden': 'true' }),
                            el('div', { className: 'bkbg-qz-questions-wrap' },
                                a.questions.map(function (q, qi) {
                                    return el('div', { key: q.id, className: 'bkbg-qz-question', 'data-question-idx': qi, 'data-question-id': q.id, 'aria-hidden': qi === 0 ? 'false' : 'true', style: { display: qi === 0 ? 'block' : 'none' } },
                                        el('h3', { className: 'bkbg-qz-question-text' }, q.question),
                                        el('ul', { className: 'bkbg-qz-options', role: 'list' },
                                            q.options.map(function (o) {
                                                return el('li', { key: o.id, className: 'bkbg-qz-option-item' },
                                                    el('button', { type: 'button', className: 'bkbg-qz-option', 'data-points': o.points, 'data-option-id': o.id },
                                                        el('span', { className: 'bkbg-qz-option-dot', 'aria-hidden': 'true' }),
                                                        el('span', { className: 'bkbg-qz-option-text' }, o.text)
                                                    )
                                                );
                                            })
                                        ),
                                        el('div', { className: 'bkbg-qz-question-nav' },
                                            el('div', null),
                                            el('button', { type: 'button', className: 'bkbg-qz-btn-next', 'data-is-last': qi === a.questions.length - 1 ? 'true' : 'false', disabled: true },
                                                qi < a.questions.length - 1 ? __('Next →', 'blockenberg') : a.submitLabel
                                            )
                                        )
                                    );
                                })
                            ),
                            el('div', { className: 'bkbg-qz-results-wrap is-hidden', 'aria-live': 'polite' },
                                a.resultRanges.map(function (r) {
                                    return el('div', { key: r.id, className: 'bkbg-qz-result', 'data-min': r.minScore, 'data-max': r.maxScore, style: { display: 'none' } },
                                        el('div', { className: 'bkbg-qz-result-icon', 'aria-hidden': 'true' }, r.icon),
                                        el('p', { className: 'bkbg-qz-result-heading' }, a.resultHeading),
                                        el('h3', { className: 'bkbg-qz-result-title' }, r.title),
                                        el('p', { className: 'bkbg-qz-result-desc' }, r.description),
                                        r.imageUrl && el('img', { src: r.imageUrl, alt: r.title, loading: 'lazy', className: 'bkbg-qz-result-img' }),
                                        a.showRetake && el('button', { type: 'button', className: 'bkbg-qz-retake' }, a.retakeLabel)
                                    );
                                })
                            )
                        )
                    )
                );
            }
        }],

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-qz-wrapper', style: buildWrapStyle(a) }),
                el('div', { className: 'bkbg-qz-outer', style: { maxWidth: a.formMaxWidth + 'px', margin: '0 auto' } },
                    (a.showTitle || a.showDescription) && el('div', { className: 'bkbg-qz-header' },
                        a.showTitle && el(RichText.Content, { tagName: 'h2', className: 'bkbg-qz-title', value: a.quizTitle }),
                        a.showDescription && el(RichText.Content, { tagName: 'p', className: 'bkbg-qz-description', value: a.quizDescription })
                    ),
                    el('div', { className: 'bkbg-qz-card', 'data-one-at-a-time': a.oneAtATime ? 'true' : 'false', 'data-randomize': a.randomize ? 'true' : 'false', 'data-progress-style': a.progressStyle, 'data-show-progress': a.showProgress ? 'true' : 'false' },
                        el('div', { className: 'bkbg-qz-progress-wrap', 'aria-hidden': 'true' }),
                        el('div', { className: 'bkbg-qz-questions-wrap' },
                            a.questions.map(function (q, qi) {
                                return el('div', { key: q.id, className: 'bkbg-qz-question', 'data-question-idx': qi, 'data-question-id': q.id, 'aria-hidden': qi === 0 ? 'false' : 'true', style: { display: qi === 0 ? 'block' : 'none' } },
                                    el('h3', { className: 'bkbg-qz-question-text' }, q.question),
                                    el('ul', { className: 'bkbg-qz-options', role: 'list' },
                                        q.options.map(function (o) {
                                            return el('li', { key: o.id, className: 'bkbg-qz-option-item' },
                                                el('button', { type: 'button', className: 'bkbg-qz-option', 'data-points': o.points, 'data-option-id': o.id },
                                                    el('span', { className: 'bkbg-qz-option-dot', 'aria-hidden': 'true' }),
                                                    el('span', { className: 'bkbg-qz-option-text' }, o.text)
                                                )
                                            );
                                        })
                                    ),
                                    el('div', { className: 'bkbg-qz-question-nav' },
                                        el('div', null),
                                        el('button', { type: 'button', className: 'bkbg-qz-btn-next', 'data-is-last': qi === a.questions.length - 1 ? 'true' : 'false', disabled: true },
                                            qi < a.questions.length - 1 ? __('Next →', 'blockenberg') : a.submitLabel
                                        )
                                    )
                                );
                            })
                        ),
                        el('div', { className: 'bkbg-qz-results-wrap is-hidden', 'aria-live': 'polite' },
                            a.resultRanges.map(function (r) {
                                return el('div', { key: r.id, className: 'bkbg-qz-result', 'data-min': r.minScore, 'data-max': r.maxScore, style: { display: 'none' } },
                                    el('div', { className: 'bkbg-qz-result-icon', 'aria-hidden': 'true' }, (r.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(r.iconType, r.icon, r.iconDashicon, r.iconImageUrl, r.iconDashiconColor) : r.icon),
                                    el('p', { className: 'bkbg-qz-result-heading' }, a.resultHeading),
                                    el('h3', { className: 'bkbg-qz-result-title' }, r.title),
                                    el('p', { className: 'bkbg-qz-result-desc' }, r.description),
                                    r.imageUrl && el('img', { src: r.imageUrl, alt: r.title, loading: 'lazy', className: 'bkbg-qz-result-img' }),
                                    a.showRetake && el('button', { type: 'button', className: 'bkbg-qz-retake' }, a.retakeLabel)
                                );
                            })
                        )
                    )
                )
            );
        }
    });
}() );
