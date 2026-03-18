( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Readability algorithms ──────────────────────────────────────────────
    function countSyllables(word) {
        word = word.toLowerCase().replace(/[^a-z]/g,'');
        if (!word.length) return 0;
        if (word.length <= 3) return 1;
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        var m = word.match(/[aeiouy]{1,2}/g);
        return m ? m.length : 1;
    }
    function countComplexWords(words) {
        return words.filter(function(w){ return countSyllables(w) >= 3; }).length;
    }
    function analyze(text) {
        if (!text || !text.trim()) return null;
        var sentences = text.trim().split(/[.!?]+/).filter(function(s){ return s.trim().length > 0; }).length || 1;
        var wordList  = text.trim().split(/\s+/).filter(function(w){ return w.replace(/[^a-zA-Z]/g,'').length > 0; });
        var words     = wordList.length || 1;
        var syllables = wordList.reduce(function(n,w){ return n + countSyllables(w); }, 0) || 1;
        var complex   = countComplexWords(wordList);

        var fleschEase = Math.round(206.835 - 1.015*(words/sentences) - 84.6*(syllables/words));
        fleschEase = Math.min(100, Math.max(0, fleschEase));
        var gradeLevel = Math.max(0, Math.round((0.39*(words/sentences) + 11.8*(syllables/words) - 15.59) * 10) / 10);
        var gunningFog = Math.max(0, Math.round(0.4*((words/sentences) + 100*(complex/words)) * 10) / 10);
        var readingTime = Math.ceil(words / 200); // 200 wpm average

        return { fleschEase:fleschEase, gradeLevel:gradeLevel, gunningFog:gunningFog,
                 words:words, sentences:sentences, syllables:syllables,
                 avgWordsPerSentence:Math.round((words/sentences)*10)/10,
                 avgSyllablesPerWord:Math.round((syllables/words)*10)/10,
                 readingTime:readingTime };
    }
    function gaugeInfo(score) {
        if (score >= 90) return { label:'Very Easy',       color:'#10b981', grade:'5th grade'  };
        if (score >= 70) return { label:'Easy',            color:'#22c55e', grade:'6th grade'  };
        if (score >= 60) return { label:'Fairly Easy',     color:'#84cc16', grade:'7th grade'  };
        if (score >= 50) return { label:'Standard',        color:'#f59e0b', grade:'8-9th grade' };
        if (score >= 30) return { label:'Fairly Difficult',color:'#f97316', grade:'10-12th grade' };
        if (score >= 10) return { label:'Difficult',       color:'#ef4444', grade:'College'    };
        return               { label:'Very Confusing',  color:'#dc2626', grade:'Professional' };
    }

    function ReadabilityPreview(props) {
        var a = props.attributes;
        var accent = a.accentColor || '#6c3fb5';

        var _text   = useState(''); var text    = _text[0];   var setText   = _text[1];
        var result  = analyze(text);
        var info    = result ? gaugeInfo(result.fleschEase) : null;

        var inputStyle = {padding:'10px 12px',borderRadius:'6px',border:'1.5px solid '+(a.textareaBorder||'#e5e7eb'),fontSize:'14px',fontFamily:'inherit',outline:'none',background:a.textareaBg||'#f9fafb',resize:'vertical',transition:'border-color .2s'};
        var labelStyle = {fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',textTransform:'uppercase',letterSpacing:'.05em'};

        return el('div', {style:{paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}},
            el('div', {style:{background:a.cardBg,borderRadius:(a.cardRadius||16)+'px',padding:'36px 32px',maxWidth:(a.maxWidth||620)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                (a.showTitle||a.showSubtitle) && el('div', {style:{marginBottom:'22px'}},
                    a.showTitle    && el('div', {className:'bkras-title',style:{color:a.titleColor,marginBottom:'6px'}}, a.title),
                    a.showSubtitle && el('div', {className:'bkras-subtitle',style:{color:a.subtitleColor,opacity:.75}}, a.subtitle)
                ),

                // Textarea
                el('div', {style:{marginBottom:'20px'}},
                    el('label', {style:{display:'block',marginBottom:'6px',...labelStyle}}, 'Your Text'),
                    el('textarea', {rows:6,value:text,placeholder:a.placeholder||'Paste or type your text here...', style:{...inputStyle,width:'100%',display:'block'}, onChange:function(e){setText(e.target.value);}})
                ),

                !result && el('div', {style:{padding:'20px',textAlign:'center',color:'#9ca3af',fontSize:'15px'}}, 'Start typing or paste text to see the analysis'),

                result && el(Fragment, null,

                    // Stats grid
                    a.showStats && el('div', {style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(100px,1fr))',gap:'10px',marginBottom:'20px'}},
                        [
                            {label:'Words',     val:result.words},
                            {label:'Sentences', val:result.sentences},
                            {label:'Syllables', val:result.syllables},
                            {label:'Avg Words/Sent', val:result.avgWordsPerSentence},
                            {label:'Avg Syll/Word',  val:result.avgSyllablesPerWord},
                            ...(a.showReadingTime ? [{label:'Read Time',val:result.readingTime+'m'}] : [])
                        ].map(function(s){
                            return el('div', {key:s.label, style:{background:a.statBg||'#f3f4f6',border:'1px solid '+(a.statBorder||'#e5e7eb'),borderRadius:'8px',padding:'12px 10px',textAlign:'center'}},
                                el('div', {style:{fontSize:'24px',fontWeight:700,color:a.statValueColor||'#111827',lineHeight:1.1}}, s.val),
                                el('div', {style:{fontSize:'11px',color:a.statLabelColor||'#6b7280',marginTop:'4px'}}, s.label)
                            );
                        })
                    ),

                    // Gauge
                    a.showGauge && a.showFleschEase && el('div', {style:{marginBottom:'20px'}},
                        el('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}},
                            el('span', {style:labelStyle}, 'Flesch Reading Ease'),
                            el('span', {style:{fontWeight:700,color:info.color,fontSize:'18px'}}, result.fleschEase+' — '+info.label)
                        ),
                        el('div', {style:{background:a.gaugeTrackColor||'#e5e7eb',borderRadius:'20px',height:'12px',overflow:'hidden'}},
                            el('div', {style:{width:result.fleschEase+'%',height:'100%',background:info.color,borderRadius:'20px',transition:'width .4s ease'}})
                        ),
                        el('div', {style:{display:'flex',justifyContent:'space-between',marginTop:'5px',fontSize:'11px',color:'#9ca3af'}},
                            el('span', null, '0 – Very Confusing'),
                            el('span', null, '100 – Very Easy')
                        )
                    ),

                    // Score cards row
                    el('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}},
                        a.showGradeLevel && el('div', {style:{background:a.scoreBg||'#f9fafb',border:'1px solid '+(a.statBorder||'#e5e7eb'),borderRadius:'10px',padding:'14px 16px'}},
                            el('div', {style:{fontSize:'12px',color:a.statLabelColor||'#6b7280',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'4px'}}, 'Flesch-Kincaid Grade'),
                            el('div', {style:{fontSize:'26px',fontWeight:700,color:a.statValueColor||'#111827'}}, result.gradeLevel),
                            el('div', {style:{fontSize:'12px',color:'#9ca3af',marginTop:'4px'}}, info ? info.grade : '')
                        ),
                        a.showGunningFog && el('div', {style:{background:a.scoreBg||'#f9fafb',border:'1px solid '+(a.statBorder||'#e5e7eb'),borderRadius:'10px',padding:'14px 16px'}},
                            el('div', {style:{fontSize:'12px',color:a.statLabelColor||'#6b7280',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'4px'}}, 'Gunning Fog Index'),
                            el('div', {style:{fontSize:'26px',fontWeight:700,color:a.statValueColor||'#111827'}}, result.gunningFog),
                            el('div', {style:{fontSize:'12px',color:'#9ca3af',marginTop:'4px'}}, 'Years of education needed')
                        )
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/readability-score', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var TC = getTypoControl();
            var blockProps = useBlockProps((function() {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.titleTypo || {}, '--bkras-tt-'));
                    Object.assign(s, _tvFn(a.subtitleTypo || {}, '--bkras-st-'));
                }
                return { style: s };
            })());
            var colorSettings = [
                { value:a.accentColor,    onChange:function(v){set({accentColor:v});},    label:'Accent Color' },
                { value:a.cardBg,         onChange:function(v){set({cardBg:v});},          label:'Card Background' },
                { value:a.textareaBg,     onChange:function(v){set({textareaBg:v});},      label:'Textarea Background' },
                { value:a.textareaBorder, onChange:function(v){set({textareaBorder:v});},  label:'Textarea Border' },
                { value:a.statBg,         onChange:function(v){set({statBg:v});},          label:'Stat Card Background' },
                { value:a.statBorder,     onChange:function(v){set({statBorder:v});},      label:'Stat Card Border' },
                { value:a.statValueColor, onChange:function(v){set({statValueColor:v});},  label:'Stat Value Color' },
                { value:a.statLabelColor, onChange:function(v){set({statLabelColor:v});},  label:'Stat Label Color' },
                { value:a.gaugeTrackColor,onChange:function(v){set({gaugeTrackColor:v});}, label:'Gauge Track Color' },
                { value:a.scoreBg,        onChange:function(v){set({scoreBg:v});},         label:'Score Card Background' },
                { value:a.labelColor,     onChange:function(v){set({labelColor:v});},      label:'Label Color' },
                { value:a.titleColor,     onChange:function(v){set({titleColor:v});},      label:'Title Color' },
                { value:a.subtitleColor,  onChange:function(v){set({subtitleColor:v});},   label:'Subtitle Color' },
                { value:a.sectionBg,      onChange:function(v){set({sectionBg:v});},       label:'Section Background' }
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody,{title:'Header',initialOpen:false},
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Title',   checked:a.showTitle,   onChange:function(v){set({showTitle:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Subtitle',checked:a.showSubtitle,onChange:function(v){set({showSubtitle:v});}}),
                        el(TextControl,{label:'Title',   value:a.title,    onChange:function(v){set({title:v});}}),
                        el(TextControl,{label:'Subtitle',value:a.subtitle, onChange:function(v){set({subtitle:v});}}),
                        el(TextControl,{label:'Textarea Placeholder',value:a.placeholder,onChange:function(v){set({placeholder:v});}})
                    ),
                    el(PanelBody,{title:'Metrics to Show',initialOpen:true},
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Gauge',          checked:a.showGauge,       onChange:function(v){set({showGauge:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Flesch Reading Ease',checked:a.showFleschEase, onChange:function(v){set({showFleschEase:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show FK Grade Level', checked:a.showGradeLevel,  onChange:function(v){set({showGradeLevel:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Gunning Fog',    checked:a.showGunningFog,  onChange:function(v){set({showGunningFog:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Stats Grid',     checked:a.showStats,       onChange:function(v){set({showStats:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Reading Time',   checked:a.showReadingTime, onChange:function(v){set({showReadingTime:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        TC && el(TC, { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function(v) { set({ titleTypo: v }); } }),
                        TC && el(TC, { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function(v) { set({ subtitleTypo: v }); } })
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Card Border Radius',value:a.cardRadius, min:0, max:40, step:1,  onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',   value:a.maxWidth,    min:340,max:960,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top (px)', value:a.paddingTop,  min:0, max:160,step:4,  onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom (px)',value:a.paddingBottom,min:0,max:160,step:4,onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div', blockProps, el(ReadabilityPreview, {attributes:a}))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(), el('div', {className:'bkbg-rs-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
