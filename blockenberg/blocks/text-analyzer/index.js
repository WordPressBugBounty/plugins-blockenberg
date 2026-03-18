( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var RichText           = wp.blockEditor.RichText;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog. A fast, nimble fox leaps gracefully. The dog watches the fox, the fox watches the dog. Quick movements define the fox. Lazy afternoons define the dog.';

    function analyze(text) {
        var trimmed    = text.trim();
        var words      = trimmed ? trimmed.split(/\s+/).filter(function (w) { return w.length > 0; }) : [];
        var sentences  = trimmed ? trimmed.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; }) : [];
        var paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(function (p) { return p.trim().length > 0; }) : [];
        var chars      = trimmed.length;
        var charsNoSp  = trimmed.replace(/\s/g, '').length;
        var avgWordLen = words.length ? (words.map(function (w) { return w.replace(/[^a-zA-Z]/g,'').length; }).reduce(function (a,b){return a+b;},0) / words.length) : 0;
        var avgSentLen = sentences.length ? (words.length / sentences.length) : 0;
        var readingMins = words.length / 200;
        var uniqueWords = (function () {
            var s = {};
            words.forEach(function (w) { s[w.toLowerCase().replace(/[^a-z]/g,'')] = true; });
            return Object.keys(s).length;
        })();
        var vocabRichness = words.length ? Math.round((uniqueWords / words.length) * 100) : 0;
        var longestWord = words.reduce(function (a, w) { return w.length > a.length ? w : a; }, '');
        // Frequency: skip stop words for freq chart
        var STOP = { the:1,a:1,an:1,and:1,or:1,but:1,in:1,on:1,at:1,to:1,for:1,of:1,with:1,by:1,is:1,it:1,its:1,was:1,are:1,be:1,this:1,that:1,as:1 };
        var freq = {};
        words.forEach(function (w) {
            var k = w.toLowerCase().replace(/[^a-z']/g,'');
            if (k.length > 1 && !STOP[k]) freq[k] = (freq[k] || 0) + 1;
        });
        var freqList = Object.keys(freq).map(function (k) { return { word:k, count:freq[k] }; })
            .sort(function (a,b){ return b.count - a.count; });
        return { words:words.length, sentences:sentences.length, paragraphs:paragraphs.length, chars:chars, charsNoSp:charsNoSp, avgWordLen:avgWordLen, avgSentLen:avgSentLen, readingMins:readingMins, uniqueWords:uniqueWords, vocabRichness:vocabRichness, longestWord:longestWord, freqList:freqList };
    }

    function EditorPreview(props) {
        var a   = props.attributes;
        var res = analyze(SAMPLE_TEXT);
        var topN = Math.min(a.freqTopN || 8, res.freqList.length);
        var maxFreq = topN > 0 ? res.freqList[0].count : 1;

        var wrapStyle = {
            background:  a.sectionBg,
            borderRadius:'16px',
            padding:     '32px 24px',
            maxWidth:    a.contentMaxWidth + 'px',
            margin:      '0 auto',
            fontFamily:  'inherit',
            boxSizing:   'border-box'
        };

        function statCard(label, value, unit) {
            return el('div', { style:{ background:a.statBg, borderRadius:'12px', padding:'12px 16px', textAlign:'center', minWidth:'90px' } },
                el('div', { style:{ fontSize:'24px', fontWeight:'800', color:a.statNumColor, lineHeight:'1.1' } }, value + (unit||'')),
                el('div', { style:{ fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'.06em', color:a.labelColor, marginTop:'4px' } }, label)
            );
        }

        return el('div', { style: wrapStyle },
            a.showTitle && el(RichText, {
                tagName:'h3', className:'bkbg-ta-title', value:a.title,
                onChange:function(v){ props.setAttributes({title:v}); },
                style:{ color:a.titleColor, margin:'0 0 5px 0' },
                placeholder:'Title…'
            }),
            a.showSubtitle && el(RichText, {
                tagName:'p', className:'bkbg-ta-subtitle', value:a.subtitle,
                onChange:function(v){ props.setAttributes({subtitle:v}); },
                style:{ color:a.subtitleColor, margin:'0 0 14px 0' },
                placeholder:'Subtitle…'
            }),

            // Textarea
            el('textarea', { rows:6, readOnly:true, defaultValue:SAMPLE_TEXT,
                style:{ width:'100%', boxSizing:'border-box', border:'1.5px solid #e5e7eb', borderRadius:'12px', padding:'14px 16px', fontSize:'14px', color:a.labelColor, background:a.inputBg, fontFamily:'inherit', lineHeight:'1.6', resize:'vertical', outline:'none', marginBottom:'18px' }
            }),

            // Basic stats
            a.showBasicStats && el('div', null,
                el('div', { style:{ fontSize:'12px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'.06em', color:a.labelColor, marginBottom:'8px' } }, '📊 Basic Statistics'),
                el('div', { style:{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'18px' } },
                    statCard('Words',      res.words,                ''),
                    statCard('Characters', res.chars,                ''),
                    statCard('No Spaces',  res.charsNoSp,            ''),
                    statCard('Sentences',  res.sentences,            ''),
                    statCard('Paragraphs', res.paragraphs,           ''),
                    statCard('Read',       (res.readingMins < 1 ? '<1' : Math.ceil(res.readingMins)), ' min')
                )
            ),

            // Vocab stats
            a.showVocabStats && el('div', null,
                el('div', { style:{ fontSize:'12px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'.06em', color:a.labelColor, marginBottom:'8px' } }, '📚 Vocabulary Insights'),
                el('div', { style:{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'18px' } },
                    statCard('Unique Words',   res.uniqueWords,                   ''),
                    statCard('Vocabulary %',   res.vocabRichness,                 '%'),
                    statCard('Avg Word Len',   res.avgWordLen.toFixed(1),         ' ch'),
                    statCard('Avg Sent Len',   res.avgSentLen.toFixed(1),         ' wds'),
                    a.showLongestWord && statCard('Longest Word', res.longestWord, '')
                )
            ),

            // Frequency
            a.showFrequency && res.freqList.length > 0 && el('div', null,
                el('div', { style:{ fontSize:'12px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'.06em', color:a.labelColor, marginBottom:'10px' } }, '🔠 Top Words'),
                el('div', { style:{ display:'flex', flexDirection:'column', gap:'6px' } },
                    res.freqList.slice(0, topN).map(function (item) {
                        return el('div', { key:item.word, style:{ display:'flex', alignItems:'center', gap:'10px' } },
                            el('div', { style:{ width:'90px', fontSize:'12px', fontWeight:'600', color:a.labelColor, textAlign:'right', flexShrink:0 } }, item.word),
                            el('div', { style:{ flex:'1', background:'#f3f4f6', borderRadius:'6px', height:'18px', overflow:'hidden' } },
                                el('div', { style:{ width:Math.round((item.count/maxFreq)*100)+'%', height:'100%', background:a.barColor, borderRadius:'6px', transition:'width .3s' } })
                            ),
                            el('div', { style:{ width:'24px', fontSize:'12px', fontWeight:'700', color:a.statNumColor } }, item.count)
                        );
                    })
                )
            )
        );
    }

    registerBlockType('blockenberg/text-analyzer', {
        edit: function (props) {
            var a   = props.attributes;
            var set = props.setAttributes;

            var colorSettings = [
                { value:a.accentColor,   onChange:function(v){set({accentColor:  v||'#8b5cf6'});}, label:'Accent color'        },
                { value:a.barColor,      onChange:function(v){set({barColor:     v||'#8b5cf6'});}, label:'Frequency bar color' },
                { value:a.statBg,        onChange:function(v){set({statBg:       v||'#f5f3ff'});}, label:'Stat card background'},
                { value:a.statNumColor,  onChange:function(v){set({statNumColor: v||'#6d28d9'});}, label:'Stat number color'   },
                { value:a.sectionBg,     onChange:function(v){set({sectionBg:    v||'#faf5ff'});}, label:'Section background'  },
                { value:a.cardBg,        onChange:function(v){set({cardBg:       v||'#ffffff'});}, label:'Card background'     },
                { value:a.inputBg,       onChange:function(v){set({inputBg:      v||'#f8fafc'});}, label:'Textarea background' },
                { value:a.titleColor,    onChange:function(v){set({titleColor:   v||'#111827'});}, label:'Title color'         },
                { value:a.subtitleColor, onChange:function(v){set({subtitleColor:v||'#6b7280'});}, label:'Subtitle color'      },
                { value:a.labelColor,    onChange:function(v){set({labelColor:   v||'#374151'});}, label:'Label color'         }
            ];

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title:'Analyzer Settings', initialOpen:true },
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show title',              checked:a.showTitle,       onChange:function(v){set({showTitle:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show subtitle',           checked:a.showSubtitle,    onChange:function(v){set({showSubtitle:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show basic statistics',   checked:a.showBasicStats,  onChange:function(v){set({showBasicStats:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show vocabulary insights',checked:a.showVocabStats,  onChange:function(v){set({showVocabStats:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show longest word',        checked:a.showLongestWord,onChange:function(v){set({showLongestWord:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show word frequency chart',checked:a.showFrequency, onChange:function(v){set({showFrequency:v});} }),
                        el(RangeControl, { label:'Top N words in chart', value:a.freqTopN, min:3, max:20, onChange:function(v){set({freqTopN:v});} }),
                        el(TextControl, { label:'Placeholder text', value:a.placeholder, onChange:function(v){set({placeholder:v});} })
                    ),
                    el(PanelBody, { title:'Sizing', initialOpen:false },
                        el(RangeControl, { label:'Max width (px)',  value:a.contentMaxWidth, min:400, max:1200, step:20, onChange:function(v){set({contentMaxWidth:v});} })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && getTypoControl()({
                            label: __('Title', 'blockenberg'),
                            value: a.titleTypo || {},
                            onChange: function (v) { set({ titleTypo: v }); }
                        }),
                        getTypoControl() && getTypoControl()({
                            label: __('Subtitle', 'blockenberg'),
                            value: a.subtitleTypo || {},
                            onChange: function (v) { set({ subtitleTypo: v }); }
                        })
                    ),
el(PanelColorSettings, { title:'Colors', initialOpen:false, disableCustomGradients:true, colorSettings:colorSettings })
                ),
                el('div', (function () {
                    var s = {};
                    var _tvf = getTypoCssVars();
                    if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bkta-tt-'), _tvf(a.subtitleTypo, '--bkta-st-')); }
                    return useBlockProps({ style: s });
                })(),
                    el(EditorPreview, { attributes:a, setAttributes:set })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tvf = getTypoCssVars();
            return el('div', (function () {
                var s = {};
                if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bkta-tt-'), _tvf(a.subtitleTypo, '--bkta-st-')); }
                return useBlockProps.save({ style: s });
            })(),
                el('div', {
                    className:   'bkbg-ta-app',
                    'data-opts': JSON.stringify({
                        title:          a.title,
                        subtitle:       a.subtitle,
                        showTitle:      a.showTitle,
                        showSubtitle:   a.showSubtitle,
                        showBasicStats: a.showBasicStats,
                        showVocabStats: a.showVocabStats,
                        showFrequency:  a.showFrequency,
                        showLongestWord:a.showLongestWord,
                        freqTopN:       a.freqTopN,
                        defaultText:    a.defaultText,
                        placeholder:    a.placeholder,
                        accentColor:    a.accentColor,
                        barColor:       a.barColor,
                        statBg:         a.statBg,
                        statNumColor:   a.statNumColor,
                        sectionBg:      a.sectionBg,
                        cardBg:         a.cardBg,
                        inputBg:        a.inputBg,
                        titleColor:     a.titleColor,
                        subtitleColor:  a.subtitleColor,
                        labelColor:     a.labelColor,
                        contentMaxWidth:a.contentMaxWidth
                    })
                })
            );
        }
    });
}() );
