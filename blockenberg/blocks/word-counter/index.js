( function () {
    var el                = wp.element.createElement;
    var useState          = wp.element.useState;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var Button            = wp.components.Button;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'titleTypo', attrs, '--bkwrd-tt-');
        return v;
    }

    function analyzeText(text, readingWPM, speakingWPM) {
        var words      = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        var chars      = text.length;
        var charsNoSp  = text.replace(/\s/g, '').length;
        var sentences  = text.trim() === '' ? 0 : (text.match(/[^.!?]+[.!?]+/g) || []).length;
        var paragraphs = text.trim() === '' ? 0 : text.trim().split(/\n\s*\n+/).filter(function(p) { return p.trim() !== ''; }).length || (text.trim() !== '' ? 1 : 0);
        var readSec    = words > 0 ? Math.ceil((words / readingWPM) * 60) : 0;
        var speakSec   = words > 0 ? Math.ceil((words / speakingWPM) * 60) : 0;
        return { words: words, chars: chars, charsNoSp: charsNoSp, sentences: sentences, paragraphs: paragraphs, readSec: readSec, speakSec: speakSec };
    }

    function fmtTime(secs) {
        if (secs < 60) return secs + 's';
        var m = Math.floor(secs / 60);
        var s = secs % 60;
        return m + 'm' + (s ? ' ' + s + 's' : '');
    }

    function WordCounterPreview(props) {
        var a  = props.attributes;
        var sa = props.setAttributes;

        var _text = useState(a.defaultText || ''); var text = _text[0]; var setText = _text[1];

        var stats = analyzeText(text, a.readingWPM || 238, a.speakingWPM || 130);
        var charPct = a.showCharLimit && a.charLimit > 0 ? Math.min(100, (stats.chars / a.charLimit) * 100) : 0;
        var isOver  = stats.chars > a.charLimit;

        var containerStyle = {
            background:    a.sectionBg || undefined,
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            fontFamily:    'inherit'
        };
        var cardStyle = {
            background:   a.cardBg,
            borderRadius: a.cardRadius + 'px',
            padding:      '36px 32px',
            maxWidth:     a.maxWidth + 'px',
            margin:       '0 auto',
            boxShadow:    '0 4px 24px rgba(0,0,0,0.09)'
        };

        var statDefs = [
            { key: 'words',      label: 'Words',                 val: stats.words,      color: a.wordCountColor,  show: true },
            { key: 'chars',      label: 'Characters',            val: stats.chars,      color: a.charCountColor,  show: true },
            { key: 'charsNoSp',  label: 'Chars (no spaces)',     val: stats.charsNoSp,  color: a.charCountColor,  show: a.showCharNoSpaces },
            { key: 'sentences',  label: 'Sentences',             val: stats.sentences,  color: a.sentenceColor,   show: a.showSentences },
            { key: 'paragraphs', label: 'Paragraphs',            val: stats.paragraphs, color: a.paragraphColor,  show: a.showParagraphs },
            { key: 'readTime',   label: 'Reading Time',          val: fmtTime(stats.readSec),  color: a.readingColor,   show: a.showReadingTime },
            { key: 'speakTime',  label: 'Speaking Time',         val: fmtTime(stats.speakSec), color: a.speakingColor,  show: a.showSpeakingTime }
        ].filter(function(s) { return s.show; });

        return el('div', { className: 'bkbg-wrd-editor', style: containerStyle },
            el('div', { style: cardStyle },

                // Title / subtitle
                (a.showTitle || a.showSubtitle) && el('div', { style: { marginBottom: '20px' } },
                    a.showTitle && el('div', {
                        className: 'bkbg-wrd-title',
                        style: { color: a.titleColor, contentEditable: true, suppressContentEditableWarning: true, outline: 'none' },
                        onBlur: function(e) { sa({ title: e.target.innerText }); },
                        dangerouslySetInnerHTML: { __html: a.title }
                    }),
                    a.showSubtitle && el('div', {
                        className: 'bkbg-wrd-subtitle',
                        style: { color: a.subtitleColor, contentEditable: true, suppressContentEditableWarning: true, outline: 'none' },
                        onBlur: function(e) { sa({ subtitle: e.target.innerText }); },
                        dangerouslySetInnerHTML: { __html: a.subtitle }
                    })
                ),

                // Textarea
                el('textarea', {
                    className: 'bkbg-wrd-textarea',
                    placeholder: a.placeholder || 'Start typing or paste your text here…',
                    value: text,
                    style: {
                        width: '100%',
                        height: a.textareaHeight + 'px',
                        padding: '14px 16px',
                        borderRadius: a.inputRadius + 'px',
                        border: '2px solid ' + (isOver && a.showCharLimit ? a.limitBarOver : a.textareaBorder),
                        background: a.textareaBg,
                        fontSize: '15px',
                        lineHeight: 1.6,
                        resize: 'vertical',
                        outline: 'none',
                        boxSizing: 'border-box',
                        marginBottom: '16px',
                        fontFamily: 'inherit',
                        transition: 'border-color .2s'
                    },
                    onChange: function(e) { setText(e.target.value); }
                }),

                // Char limit bar
                a.showCharLimit && el('div', { style: { marginBottom: '16px' } },
                    el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: a.labelColor, marginBottom: '5px' } },
                        el('span', null, 'Character Limit'),
                        el('span', { style: { color: isOver ? a.limitBarOver : a.labelColor, fontWeight: isOver ? 700 : 400 } },
                            stats.chars + ' / ' + a.charLimit
                        )
                    ),
                    el('div', { style: { height: '8px', borderRadius: '100px', background: a.limitBarBg, overflow: 'hidden' } },
                        el('div', { style: { height: '100%', width: charPct + '%', background: isOver ? a.limitBarOver : a.limitBarFill, borderRadius: '100px', transition: 'width .3s, background .3s' } })
                    )
                ),

                // Stats grid
                el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' } },
                    statDefs.map(function(s) {
                        return el('div', { key: s.key, className: 'bkbg-wrd-stat-card', style: {
                            background:   a.statCardBg,
                            border:       '1.5px solid ' + a.statCardBorder,
                            borderRadius: a.cardRadius + 'px',
                            padding:      '16px 14px',
                            textAlign:    'center'
                        }},
                            el('div', { style: { fontSize: a.statValueSize + 'px', fontWeight: 800, color: s.color, lineHeight: 1.1 } }, String(s.val)),
                            el('div', { style: { fontSize: '12px', color: a.labelColor, marginTop: '4px', fontWeight: 600 } }, s.label)
                        );
                    })
                )
            )
        );
    }

    registerBlockType('blockenberg/word-counter', {
        edit: function(props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ style: getTypoCssVars(a) });

            var colorSettings = [
                { value: a.accentColor,      onChange: function(v) { set({ accentColor: v }); },      label: 'Accent Color' },
                { value: a.cardBg,           onChange: function(v) { set({ cardBg: v }); },            label: 'Card Background' },
                { value: a.textareaBg,       onChange: function(v) { set({ textareaBg: v }); },        label: 'Textarea Background' },
                { value: a.textareaBorder,   onChange: function(v) { set({ textareaBorder: v }); },    label: 'Textarea Border' },
                { value: a.statCardBg,       onChange: function(v) { set({ statCardBg: v }); },        label: 'Stat Card Background' },
                { value: a.statCardBorder,   onChange: function(v) { set({ statCardBorder: v }); },    label: 'Stat Card Border' },
                { value: a.wordCountColor,   onChange: function(v) { set({ wordCountColor: v }); },    label: 'Word Count Color' },
                { value: a.charCountColor,   onChange: function(v) { set({ charCountColor: v }); },    label: 'Character Count Color' },
                { value: a.sentenceColor,    onChange: function(v) { set({ sentenceColor: v }); },     label: 'Sentence Count Color' },
                { value: a.paragraphColor,   onChange: function(v) { set({ paragraphColor: v }); },    label: 'Paragraph Count Color' },
                { value: a.readingColor,     onChange: function(v) { set({ readingColor: v }); },      label: 'Reading Time Color' },
                { value: a.speakingColor,    onChange: function(v) { set({ speakingColor: v }); },     label: 'Speaking Time Color' },
                { value: a.limitBarFill,     onChange: function(v) { set({ limitBarFill: v }); },      label: 'Limit Bar Fill' },
                { value: a.limitBarOver,     onChange: function(v) { set({ limitBarOver: v }); },      label: 'Limit Bar (over limit)' },
                { value: a.limitBarBg,       onChange: function(v) { set({ limitBarBg: v }); },        label: 'Limit Bar Background' },
                { value: a.titleColor,       onChange: function(v) { set({ titleColor: v }); },        label: 'Title Color' },
                { value: a.subtitleColor,    onChange: function(v) { set({ subtitleColor: v }); },     label: 'Subtitle Color' },
                { value: a.labelColor,       onChange: function(v) { set({ labelColor: v }); },        label: 'Label Color' },
                { value: a.sectionBg,        onChange: function(v) { set({ sectionBg: v }); },         label: 'Section Background' }
            ];

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: 'Header', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Title', checked: a.showTitle, onChange: function(v) { set({ showTitle: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Subtitle', checked: a.showSubtitle, onChange: function(v) { set({ showSubtitle: v }); } }),
                        el(TextControl, { label: 'Title', value: a.title, onChange: function(v) { set({ title: v }); } }),
                        el(TextControl, { label: 'Subtitle', value: a.subtitle, onChange: function(v) { set({ subtitle: v }); } })
                    ),

                    el(PanelBody, { title: 'Counter Settings', initialOpen: true },
                        el(TextControl, { label: 'Textarea Placeholder', value: a.placeholder, onChange: function(v) { set({ placeholder: v }); } }),
                        el(TextControl, { label: 'Default Text (pre-filled)', value: a.defaultText, onChange: function(v) { set({ defaultText: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Characters Without Spaces', checked: a.showCharNoSpaces, onChange: function(v) { set({ showCharNoSpaces: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Sentence Count', checked: a.showSentences, onChange: function(v) { set({ showSentences: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Paragraph Count', checked: a.showParagraphs, onChange: function(v) { set({ showParagraphs: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Reading Time', checked: a.showReadingTime, onChange: function(v) { set({ showReadingTime: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Speaking Time', checked: a.showSpeakingTime, onChange: function(v) { set({ showSpeakingTime: v }); } }),
                        el(RangeControl, { label: 'Reading Speed (WPM)', value: a.readingWPM, min: 100, max: 600, step: 10, onChange: function(v) { set({ readingWPM: v }); } }),
                        el(RangeControl, { label: 'Speaking Speed (WPM)', value: a.speakingWPM, min: 80, max: 400, step: 10, onChange: function(v) { set({ speakingWPM: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Enable Character Limit', checked: a.showCharLimit, onChange: function(v) { set({ showCharLimit: v }); } }),
                        a.showCharLimit && el(RangeControl, { label: 'Character Limit', value: a.charLimit, min: 50, max: 5000, step: 50, onChange: function(v) { set({ charLimit: v }); } })
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl(__('Title', 'blockenberg'), 'titleTypo', a, set),
                        el(RangeControl, { label: 'Stat Value Size', value: a.statValueSize, min: 20, max: 72, step: 2, onChange: function(v) { set({ statValueSize: v }); } })
                    ),
el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colorSettings }),

                    el(PanelBody, { title: 'Sizing & Layout', initialOpen: false },
                        el(RangeControl, { label: 'Textarea Height (px)', value: a.textareaHeight, min: 80, max: 600, step: 10, onChange: function(v) { set({ textareaHeight: v }); } }),
                        el(RangeControl, { label: 'Card Border Radius', value: a.cardRadius, min: 0, max: 40, step: 1, onChange: function(v) { set({ cardRadius: v }); } }),
                        el(RangeControl, { label: 'Input Border Radius', value: a.inputRadius, min: 0, max: 24, step: 1, onChange: function(v) { set({ inputRadius: v }); } }),
                        el(RangeControl, { label: 'Max Width (px)', value: a.maxWidth, min: 300, max: 1000, step: 10, onChange: function(v) { set({ maxWidth: v }); } }),
                        el(RangeControl, { label: 'Padding Top (px)', value: a.paddingTop, min: 0, max: 160, step: 4, onChange: function(v) { set({ paddingTop: v }); } }),
                        el(RangeControl, { label: 'Padding Bottom (px)', value: a.paddingBottom, min: 0, max: 160, step: 4, onChange: function(v) { set({ paddingBottom: v }); } })
                    )
                ),
                el('div', blockProps,
                    el(WordCounterPreview, { attributes: a, setAttributes: set })
                )
            );
        },
        save: function(props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ style: getTypoCssVars(props.attributes) });
            return el('div', blockProps,
                el('div', { className: 'bkbg-wrd-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
