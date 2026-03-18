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
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function scorePassword(pw, minLen) {
        if (!pw) return 0;
        var score = 0;
        if (pw.length >= minLen) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[a-z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^a-zA-Z0-9]/.test(pw)) score++;
        return score; // 0-5
    }

    function strengthInfo(score, a) {
        if (score <= 1) return { level: 1, label: a.labelWeak   || 'Weak',   color: a.colorWeak   || '#ef4444' };
        if (score <= 2) return { level: 2, label: a.labelFair   || 'Fair',   color: a.colorFair   || '#f59e0b' };
        if (score <= 3) return { level: 3, label: a.labelGood   || 'Good',   color: a.colorGood   || '#3b82f6' };
        return             { level: 4, label: a.labelStrong || 'Strong', color: a.colorStrong || '#10b981' };
    }

    function PasswordStrengthPreview(props) {
        var a = props.attributes;
        var _pw  = useState('');   var pw = _pw[0];   var setPw = _pw[1];
        var _vis = useState(false); var vis = _vis[0]; var setVis = _vis[1];

        var score = scorePassword(pw, a.minLength || 8);
        var info  = pw.length > 0 ? strengthInfo(score, a) : null;
        var reqMetColor   = a.reqMetColor   || '#10b981';
        var reqUnmetColor = a.reqUnmetColor || '#9ca3af';

        var reqs = [
            { key:'showLengthReq',    met: pw.length >= (a.minLength||8),     label: 'At least ' + (a.minLength||8) + ' characters' },
            { key:'showUppercaseReq', met: /[A-Z]/.test(pw),                  label: 'Uppercase letter (A-Z)' },
            { key:'showLowercaseReq', met: /[a-z]/.test(pw),                  label: 'Lowercase letter (a-z)' },
            { key:'showNumberReq',    met: /[0-9]/.test(pw),                   label: 'Number (0-9)' },
            { key:'showSymbolReq',    met: /[^a-zA-Z0-9]/.test(pw),            label: 'Special character (!@#…)' }
        ].filter(function(r){ return a[r.key]; });

        var segments = [1,2,3,4].map(function(i){
            var active = info && i <= info.level;
            return el('div', { key:i, style:{flex:1,height:'6px',borderRadius:'3px',background:active?info.color:(a.barBg||'#e5e7eb'),transition:'background .3s'} });
        });

        return el('div', { style:{paddingTop:a.paddingTop+'px',paddingBottom:a.paddingBottom+'px',background:a.sectionBg||undefined}},
            el('div', { style:{background:a.cardBg,borderRadius:(a.cardRadius||16)+'px',padding:'36px 32px',maxWidth:(a.maxWidth||480)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,0.09)'}},

                (a.showTitle||a.showSubtitle) && el('div', { style:{marginBottom:'22px'}},
                    a.showTitle    && el('div', { style:{color:a.titleColor,marginBottom:'6px'}, className:'bkbg-psm-title'}, a.title),
                    a.showSubtitle && el('div', { style:{color:a.subtitleColor,opacity:.75}, className:'bkbg-psm-subtitle'}, a.subtitle)
                ),

                // Input + toggle
                el('div', { style:{position:'relative',marginBottom:'14px'}},
                    el('input', {
                        type: vis ? 'text' : 'password',
                        value: pw,
                        placeholder: a.placeholder,
                        onChange: function(e){ setPw(e.target.value); },
                        style:{width:'100%',padding:'14px '+(a.showToggleVisibility?'48px':'16px')+' 14px 16px',fontSize:'16px',fontFamily:'inherit',borderRadius:(a.inputRadius||10)+'px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),background:a.inputBg||'#f9fafb',outline:'none',boxSizing:'border-box'}
                    }),
                    a.showToggleVisibility && el('button', {
                        onClick: function(){ setVis(!vis); },
                        style:{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'18px',padding:'4px',color:'#6b7280'}
                    }, vis ? '🙈' : '👁️')
                ),

                // Strength bar
                el('div', { style:{display:'flex',gap:'5px',marginBottom:'8px'}}, segments),

                // Strength label
                el('div', { style:{height:'22px',marginBottom:'18px',display:'flex',alignItems:'center',justifyContent:'space-between'}},
                    el('span', { style:{fontSize:'13px',color:a.labelColor||'#374151'}}, info ? 'Password strength:' : ''),
                    info && el('span', { style:{fontSize:'13px',fontWeight:700,color:info.color} }, info.label)
                ),

                // Requirements checklist
                reqs.length > 0 && el('div', { style:{display:'flex',flexDirection:'column',gap:'8px'}},
                    reqs.map(function(r) {
                        return el('div', { key:r.key, style:{display:'flex',alignItems:'center',gap:'10px',fontSize:'13px',color:r.met?reqMetColor:reqUnmetColor,fontWeight:r.met?600:400,transition:'color .2s'}},
                            el('span', { style:{fontSize:'15px',lineHeight:1}}, r.met ? '✓' : '○'),
                            el('span', null, r.label)
                        );
                    })
                )
            )
        );
    }

    registerBlockType('blockenberg/password-strength-meter', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function(){
                var s = {};
                var tv = getTypoCssVars();
                if (tv) {
                    Object.assign(s, tv(a.titleTypo || {}, '--bkbg-psm-title'));
                    Object.assign(s, tv(a.subtitleTypo || {}, '--bkbg-psm-subtitle'));
                }
                return { style: s };
            })());
            var colorSettings = [
                { value: a.accentColor,    onChange: function(v){ set({accentColor:v}); },    label: 'Accent Color' },
                { value: a.cardBg,         onChange: function(v){ set({cardBg:v}); },          label: 'Card Background' },
                { value: a.inputBg,        onChange: function(v){ set({inputBg:v}); },         label: 'Input Background' },
                { value: a.inputBorder,    onChange: function(v){ set({inputBorder:v}); },     label: 'Input Border' },
                { value: a.barBg,          onChange: function(v){ set({barBg:v}); },           label: 'Bar Track Color' },
                { value: a.colorWeak,      onChange: function(v){ set({colorWeak:v}); },       label: 'Weak Color' },
                { value: a.colorFair,      onChange: function(v){ set({colorFair:v}); },       label: 'Fair Color' },
                { value: a.colorGood,      onChange: function(v){ set({colorGood:v}); },       label: 'Good Color' },
                { value: a.colorStrong,    onChange: function(v){ set({colorStrong:v}); },     label: 'Strong Color' },
                { value: a.reqMetColor,    onChange: function(v){ set({reqMetColor:v}); },     label: 'Requirement Met' },
                { value: a.reqUnmetColor,  onChange: function(v){ set({reqUnmetColor:v}); },   label: 'Requirement Unmet' },
                { value: a.labelColor,     onChange: function(v){ set({labelColor:v}); },      label: 'Label Color' },
                { value: a.titleColor,     onChange: function(v){ set({titleColor:v}); },      label: 'Title Color' },
                { value: a.subtitleColor,  onChange: function(v){ set({subtitleColor:v}); },   label: 'Subtitle Color' },
                { value: a.sectionBg,      onChange: function(v){ set({sectionBg:v}); },       label: 'Section Background' }
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Header', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Title',    checked: a.showTitle,    onChange: function(v){ set({showTitle:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Subtitle', checked: a.showSubtitle, onChange: function(v){ set({showSubtitle:v}); } }),
                        el(TextControl,   { label: 'Title',    value: a.title,       onChange: function(v){ set({title:v}); } }),
                        el(TextControl,   { label: 'Subtitle', value: a.subtitle,    onChange: function(v){ set({subtitle:v}); } }),
                        el(TextControl,   { label: 'Placeholder', value: a.placeholder, onChange: function(v){ set({placeholder:v}); } })
                    ),
                    el(PanelBody, { title: 'Strength Settings', initialOpen: true },
                        el(RangeControl, { label: 'Minimum Length Requirement', value: a.minLength, min: 4, max: 32, step: 1, onChange: function(v){ set({minLength:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Toggle Visibility', checked: a.showToggleVisibility, onChange: function(v){ set({showToggleVisibility:v}); } })
                    ),
                    el(PanelBody, { title: 'Requirements Checklist', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Minimum Length',  checked: a.showLengthReq,    onChange: function(v){ set({showLengthReq:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Uppercase Letter', checked: a.showUppercaseReq, onChange: function(v){ set({showUppercaseReq:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Lowercase Letter', checked: a.showLowercaseReq, onChange: function(v){ set({showLowercaseReq:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Number',           checked: a.showNumberReq,    onChange: function(v){ set({showNumberReq:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Special Character', checked: a.showSymbolReq,    onChange: function(v){ set({showSymbolReq:v}); } })
                    ),
                    el(PanelBody, { title: 'Strength Labels', initialOpen: false },
                        el(TextControl, { label: 'Weak Label',   value: a.labelWeak,   onChange: function(v){ set({labelWeak:v}); } }),
                        el(TextControl, { label: 'Fair Label',   value: a.labelFair,   onChange: function(v){ set({labelFair:v}); } }),
                        el(TextControl, { label: 'Good Label',   value: a.labelGood,   onChange: function(v){ set({labelGood:v}); } }),
                        el(TextControl, { label: 'Strong Label', value: a.labelStrong, onChange: function(v){ set({labelStrong:v}); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function(){ var C = getTypoControl(); return C ? [
                            el(C, { key: 'title', label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function(v){ set({titleTypo: v}); } }),
                            el(C, { key: 'subtitle', label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function(v){ set({subtitleTypo: v}); } })
                        ] : null; })()
                    ),
                    el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colorSettings }),
                    el(PanelBody, { title: 'Sizing & Layout', initialOpen: false },
                        el(RangeControl, { label: 'Card Border Radius',  value: a.cardRadius,    min: 0,  max: 40,  step: 1,  onChange: function(v){ set({cardRadius:v}); } }),
                        el(RangeControl, { label: 'Input Border Radius', value: a.inputRadius,   min: 0,  max: 24,  step: 1,  onChange: function(v){ set({inputRadius:v}); } }),
                        el(RangeControl, { label: 'Max Width (px)',      value: a.maxWidth,      min: 300,max: 800, step: 10, onChange: function(v){ set({maxWidth:v}); } }),
                        el(RangeControl, { label: 'Padding Top (px)',    value: a.paddingTop,    min: 0,  max: 160, step: 4,  onChange: function(v){ set({paddingTop:v}); } }),
                        el(RangeControl, { label: 'Padding Bottom (px)', value: a.paddingBottom, min: 0,  max: 160, step: 4,  onChange: function(v){ set({paddingBottom:v}); } })
                    )
                ),
                el('div', blockProps, el(PasswordStrengthPreview, { attributes: a, setAttributes: set }))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(), el('div', { className: 'bkbg-psm-app', 'data-opts': JSON.stringify(a) }));
        }
    });
}() );
