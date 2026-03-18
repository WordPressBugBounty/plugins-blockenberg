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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function toTitleCase(s) {
        return s.replace(/\w\S*/g, function(w){ return w.charAt(0).toUpperCase() + w.substr(1).toLowerCase(); });
    }
    function toSentenceCase(s) {
        return s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, function(c){ return c.toUpperCase(); });
    }
    function toCamelCase(s) {
        return s.replace(/[^a-zA-Z0-9]+(.)/g, function(_, c){ return c.toUpperCase(); })
                .replace(/^[A-Z]/, function(c){ return c.toLowerCase(); });
    }
    function toPascalCase(s) {
        var c = toCamelCase(s);
        return c.charAt(0).toUpperCase() + c.slice(1);
    }
    function toSnakeCase(s) {
        return s.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    }
    function toKebabCase(s) {
        return s.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    var CASES = [
        { key: 'showUppercase',    label: 'UPPERCASE',     fn: function(s){ return s.toUpperCase(); } },
        { key: 'showLowercase',    label: 'lowercase',     fn: function(s){ return s.toLowerCase(); } },
        { key: 'showTitleCase',    label: 'Title Case',    fn: toTitleCase },
        { key: 'showSentenceCase', label: 'Sentence case', fn: toSentenceCase },
        { key: 'showCamelCase',    label: 'camelCase',     fn: toCamelCase },
        { key: 'showPascalCase',   label: 'PascalCase',    fn: toPascalCase },
        { key: 'showSnakeCase',    label: 'snake_case',    fn: toSnakeCase },
        { key: 'showKebabCase',    label: 'kebab-case',    fn: toKebabCase }
    ];

    function CaseConverterPreview(props) {
        var a   = props.attributes;
        var accent = a.accentColor || '#6c3fb5';
        var _t = useState('The quick brown fox jumps over the lazy dog'); var text = _t[0]; var setText = _t[1];
        var _copied = useState(null); var copied = _copied[0]; var setCopied = _copied[1];

        function copyText(key, val) {
            if (!val) return;
            try { navigator.clipboard.writeText(val).then(function(){ setCopied(key); setTimeout(function(){ setCopied(null); }, 1500); }); } catch(e){}
        }

        return el('div', { style:{paddingTop:a.paddingTop+'px',paddingBottom:a.paddingBottom+'px',background:a.sectionBg||undefined}},
            el('div', { style:{background:a.cardBg,borderRadius:(a.cardRadius||16)+'px',padding:'36px 32px',maxWidth:(a.maxWidth||640)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,0.09)'}},

                (a.showTitle||a.showSubtitle) && el('div', { style:{marginBottom:'22px'}},
                    a.showTitle    && el('div', { className:'bkbg-tcc-title', style:{color:a.titleColor,marginBottom:'6px'}}, a.title),
                    a.showSubtitle && el('div', { className:'bkbg-tcc-subtitle', style:{color:a.subtitleColor,opacity:.75}}, a.subtitle)
                ),

                el('textarea', {
                    value: text,
                    placeholder: a.placeholder,
                    onChange: function(e){ setText(e.target.value); },
                    rows: 4,
                    style:{width:'100%',padding:'14px',fontSize:'15px',fontFamily:'inherit',borderRadius:(a.rowRadius||10)+'px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),background:a.inputBg||'#f9fafb',outline:'none',resize:'vertical',boxSizing:'border-box',marginBottom:'20px'}
                }),

                el('div', { style:{display:'flex',flexDirection:'column',gap:'10px'}},
                    CASES.filter(function(c){ return a[c.key]; }).map(function(c) {
                        var result = text ? c.fn(text) : '';
                        var isCopied = copied === c.key;
                        return el('div', { key:c.key, style:{display:'flex',alignItems:'center',gap:'12px',background:a.rowBg||'#f9fafb',border:'1.5px solid '+(a.rowBorder||'#e5e7eb'),borderRadius:(a.rowRadius||10)+'px',padding:'12px 16px'}},
                            el('div', { style:{flex:'0 0 110px',fontSize:'12px',fontWeight:700,color:a.rowLabelColor||'#6b7280',textTransform:'uppercase',letterSpacing:'.04em'}}, c.label),
                            el('div', { style:{flex:1,fontSize:'14px',color:a.rowValueColor||'#1f2937',wordBreak:'break-all',fontFamily:'monospace'}}, result || el('span', { style:{color:'#d1d5db',fontStyle:'italic'}}, 'No text entered')),
                            a.showCopyButtons && el('button', {
                                onClick: function(){ copyText(c.key, result); },
                                style:{flexShrink:0,padding:'6px 14px',borderRadius:'6px',border:'none',background:isCopied?'#10b981':(a.copyBg||accent),color:a.copyColor||'#fff',fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'background .2s'}
                            }, isCopied ? '✓ Copied' : 'Copy')
                        );
                    })
                )
            )
        );
    }

    registerBlockType('blockenberg/text-case-converter', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var s = {};
                var _tvf = getTypoCssVars();
                if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bktcc-tt-'), _tvf(a.subtitleTypo, '--bktcc-st-')); }
                return { style: s };
            })());
            var colorSettings = [
                { value: a.accentColor,    onChange: function(v){ set({accentColor:v}); },    label: 'Accent / Copy Button' },
                { value: a.cardBg,         onChange: function(v){ set({cardBg:v}); },          label: 'Card Background' },
                { value: a.inputBg,        onChange: function(v){ set({inputBg:v}); },         label: 'Input Background' },
                { value: a.inputBorder,    onChange: function(v){ set({inputBorder:v}); },     label: 'Input Border' },
                { value: a.rowBg,          onChange: function(v){ set({rowBg:v}); },           label: 'Row Background' },
                { value: a.rowBorder,      onChange: function(v){ set({rowBorder:v}); },       label: 'Row Border' },
                { value: a.rowLabelColor,  onChange: function(v){ set({rowLabelColor:v}); },   label: 'Row Label' },
                { value: a.rowValueColor,  onChange: function(v){ set({rowValueColor:v}); },   label: 'Row Value' },
                { value: a.copyBg,         onChange: function(v){ set({copyBg:v}); },          label: 'Copy Button Background' },
                { value: a.copyColor,      onChange: function(v){ set({copyColor:v}); },       label: 'Copy Button Text' },
                { value: a.titleColor,     onChange: function(v){ set({titleColor:v}); },      label: 'Title Color' },
                { value: a.subtitleColor,  onChange: function(v){ set({subtitleColor:v}); },   label: 'Subtitle Color' },
                { value: a.sectionBg,      onChange: function(v){ set({sectionBg:v}); },       label: 'Section Background' }
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Header', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Title',    checked: a.showTitle,    onChange: function(v){ set({showTitle:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Subtitle', checked: a.showSubtitle, onChange: function(v){ set({showSubtitle:v}); } }),
                        el(TextControl,   { label: 'Title',        value: a.title,       onChange: function(v){ set({title:v}); } }),
                        el(TextControl,   { label: 'Subtitle',     value: a.subtitle,    onChange: function(v){ set({subtitle:v}); } }),
                        el(TextControl,   { label: 'Input Placeholder', value: a.placeholder, onChange: function(v){ set({placeholder:v}); } })
                    ),
                    el(PanelBody, { title: 'Case Options', initialOpen: true },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'UPPERCASE',     checked: a.showUppercase,    onChange: function(v){ set({showUppercase:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'lowercase',     checked: a.showLowercase,    onChange: function(v){ set({showLowercase:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Title Case',    checked: a.showTitleCase,    onChange: function(v){ set({showTitleCase:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Sentence case', checked: a.showSentenceCase, onChange: function(v){ set({showSentenceCase:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'camelCase',     checked: a.showCamelCase,    onChange: function(v){ set({showCamelCase:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'PascalCase',    checked: a.showPascalCase,   onChange: function(v){ set({showPascalCase:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'snake_case',    checked: a.showSnakeCase,    onChange: function(v){ set({showSnakeCase:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'kebab-case',    checked: a.showKebabCase,    onChange: function(v){ set({showKebabCase:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Copy Buttons', checked: a.showCopyButtons, onChange: function(v){ set({showCopyButtons:v}); } })
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
el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colorSettings }),
                    el(PanelBody, { title: 'Sizing & Layout', initialOpen: false },
                        el(RangeControl, { label: 'Card Border Radius', value: a.cardRadius,    min: 0,  max: 40,  step: 1,  onChange: function(v){ set({cardRadius:v}); } }),
                        el(RangeControl, { label: 'Row Border Radius',  value: a.rowRadius,     min: 0,  max: 24,  step: 1,  onChange: function(v){ set({rowRadius:v}); } }),
                        el(RangeControl, { label: 'Max Width (px)',     value: a.maxWidth,      min: 340,max: 960, step: 10, onChange: function(v){ set({maxWidth:v}); } }),
                        el(RangeControl, { label: 'Padding Top (px)',   value: a.paddingTop,    min: 0,  max: 160, step: 4,  onChange: function(v){ set({paddingTop:v}); } }),
                        el(RangeControl, { label: 'Padding Bottom (px)',value: a.paddingBottom, min: 0,  max: 160, step: 4,  onChange: function(v){ set({paddingBottom:v}); } })
                    )
                ),
                el('div', blockProps, el(CaseConverterPreview, { attributes: a, setAttributes: set }))
            );
        },
        save: function(props) {
            var a = props.attributes;
            var _tvf = getTypoCssVars();
            return el('div', (function () {
                var s = {};
                if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bktcc-tt-'), _tvf(a.subtitleTypo, '--bktcc-st-')); }
                return wp.blockEditor.useBlockProps.save({ style: s });
            })(), el('div', { className: 'bkbg-tcc-app', 'data-opts': JSON.stringify(a) }));
        }
    });
}() );
