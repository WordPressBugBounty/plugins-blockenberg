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
    var RangeControl      = wp.components.RangeControl;    var SelectControl     = wp.components.SelectControl;    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var Button            = wp.components.Button;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    var _tv = (function () {
        var fn = window.bkbgTypoCssVars;
        return fn ? fn : function () { return {}; };
    })();

    /* ── Color math ─────────────────────────────────────────────────────── */
    function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(function(c) { return c+c; }).join('');
        if (hex.length !== 6) return null;
        var r = parseInt(hex.slice(0,2),16);
        var g = parseInt(hex.slice(2,4),16);
        var b = parseInt(hex.slice(4,6),16);
        if (isNaN(r)||isNaN(g)||isNaN(b)) return null;
        return { r:r, g:g, b:b };
    }

    function rgbToHex(r,g,b) {
        return '#' + [r,g,b].map(function(x) { return clamp(Math.round(x),0,255).toString(16).padStart(2,'0'); }).join('');
    }

    function rgbToHsl(r,g,b) {
        r/=255; g/=255; b/=255;
        var max=Math.max(r,g,b), min=Math.min(r,g,b), l=(max+min)/2, h, s;
        if (max===min) { h=0; s=0; } else {
            var d=max-min;
            s = l>0.5 ? d/(2-max-min) : d/(max+min);
            switch(max) {
                case r: h=((g-b)/d + (g<b?6:0))/6; break;
                case g: h=((b-r)/d + 2)/6; break;
                default: h=((r-g)/d + 4)/6;
            }
        }
        return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
    }

    function hslToRgb(h,s,l) {
        s/=100; l/=100; h/=360;
        var r,g,b;
        if (s===0) { r=g=b=l; } else {
            function hue2rgb(p,q,t) { if(t<0)t+=1; if(t>1)t-=1; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; }
            var q2=l<0.5?l*(1+s):l+s-l*s, p2=2*l-q2;
            r=hue2rgb(p2,q2,h+1/3); g=hue2rgb(p2,q2,h); b=hue2rgb(p2,q2,h-1/3);
        }
        return { r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255) };
    }

    function ColorPreview(props) {
        var a  = props.attributes;
        var _hex = useState(a.defaultHex || '#6c3fb5'); var hex = _hex[0]; var setHexState = _hex[1];
        var accent = a.accentColor || '#6c3fb5';

        var rgb  = hexToRgb(hex) || { r:108, g:63, b:181 };
        var hsl  = rgbToHsl(rgb.r, rgb.g, rgb.b);

        function fromHex(v) {
            var clean = v.startsWith('#') ? v : '#' + v;
            var test = hexToRgb(clean);
            if (test) setHexState(clean);
            else setHexState(v);
        }
        function fromRgb(r,g,b) {
            setHexState(rgbToHex(clamp(r,0,255), clamp(g,0,255), clamp(b,0,255)));
        }
        function fromHsl(h,s,l) {
            var c = hslToRgb(clamp(h,0,360),clamp(s,0,100),clamp(l,0,100));
            setHexState(rgbToHex(c.r,c.g,c.b));
        }

        function inputStyle() {
            return { width:'100%', padding:'9px 12px', borderRadius: a.inputRadius+'px', border:'1.5px solid '+(a.inputBorderColor||'#e5e7eb'), fontSize:'15px', fontFamily:'monospace', outline:'none', boxSizing:'border-box' };
        }
        function labelStyle() {
            return { display:'block', fontSize:'12px', fontWeight:600, color: a.labelColor, textTransform:'uppercase', letterSpacing:'.04em', marginBottom:'5px' };
        }
        function copyBtn(txt) {
            if (!a.showCopyBtns) return null;
            return el('button', {
                style: { marginTop:'6px', padding:'4px 12px', borderRadius:'6px', border:'none', background: a.copyBg||'#f3f4f6', color: a.copyColor||'#374151', fontSize:'12px', fontWeight:600, cursor:'pointer', width:'100%' },
                onClick: function() { try { navigator.clipboard.writeText(txt); } catch(e) {} }
            }, 'Copy');
        }

        var isValidHex = /^#[0-9a-fA-F]{6}$/.test(hex.replace(/^#/,'').length===3 ? hex.replace(/^#/,'').split('').map(function(c){return c+c;}).join('') : hex.replace(/^#/,'')) || /^#?[0-9a-fA-F]{6}$/.test(hex);

        return el('div', { style: { paddingTop: a.paddingTop+'px', paddingBottom: a.paddingBottom+'px', background: a.sectionBg||undefined } },
            el('div', { style: { background: a.cardBg, borderRadius: a.cardRadius+'px', padding:'36px 32px', maxWidth: a.maxWidth+'px', margin:'0 auto', boxShadow:'0 4px 24px rgba(0,0,0,0.09)' } },

                (a.showTitle || a.showSubtitle) && el('div', { style:{ marginBottom:'20px' }},
                    a.showTitle    && el('div', { className: 'bkbg-ccv-title', style:{color:a.titleColor,marginBottom:'6px'} }, a.title),
                    a.showSubtitle && el('div', { className: 'bkbg-ccv-subtitle', style:{color:a.subtitleColor} }, a.subtitle)
                ),

                // Swatch
                a.showSwatchLarge && el('div', { style:{ height: a.swatchHeight+'px', background: isValidHex?hex:'#6c3fb5', borderRadius: a.inputRadius+'px', border:'2px solid '+(a.swatchBorder||'#e5e7eb'), marginBottom:'24px', transition:'background .15s' } }),

                // HEX
                el('div', { style:{marginBottom:'18px'} },
                    el('label', { style: labelStyle() }, 'HEX'),
                    el('input', { style: inputStyle(), value: hex, onChange: function(e){ fromHex(e.target.value); } }),
                    copyBtn(hex)
                ),

                // RGB
                el('div', { style:{marginBottom:'18px'} },
                    el('label', { style: labelStyle() }, 'RGB'),
                    el('div', { style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px'} },
                        ['R','G','B'].map(function(ch, i) {
                            var val = [rgb.r, rgb.g, rgb.b][i];
                            return el('div', { key:ch },
                                el('label', { style:{fontSize:'11px',fontWeight:600,color:a.labelColor,display:'block',marginBottom:'4px'} }, ch),
                                el('input', { style: inputStyle(), type:'number', min:0, max:255, value: val,
                                    onChange: function(e) {
                                        var vals = [rgb.r, rgb.g, rgb.b]; vals[i]=parseInt(e.target.value)||0;
                                        fromRgb(vals[0],vals[1],vals[2]);
                                    }
                                })
                            );
                        })
                    ),
                    copyBtn('rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')')
                ),

                // HSL
                el('div', { style:{marginBottom:'4px'} },
                    el('label', { style: labelStyle() }, 'HSL'),
                    el('div', { style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px'} },
                        ['H','S','L'].map(function(ch, i) {
                            var val = [hsl.h, hsl.s, hsl.l][i];
                            var max = i===0?360:100;
                            return el('div', { key:ch },
                                el('label', { style:{fontSize:'11px',fontWeight:600,color:a.labelColor,display:'block',marginBottom:'4px'} }, ch + (i===0?'°':'%')),
                                el('input', { style: inputStyle(), type:'number', min:0, max:max, value: val,
                                    onChange: function(e) {
                                        var vals = [hsl.h, hsl.s, hsl.l]; vals[i]=parseInt(e.target.value)||0;
                                        fromHsl(vals[0],vals[1],vals[2]);
                                    }
                                })
                            );
                        })
                    ),
                    copyBtn('hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)')
                )
            )
        );
    }

    registerBlockType('blockenberg/color-converter', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var bpStyle = {};
            Object.assign(bpStyle, _tv(a.typoTitle, '--bkbg-ccv-tt'));
            Object.assign(bpStyle, _tv(a.typoSubtitle, '--bkbg-ccv-st'));
            var blockProps = useBlockProps({ style: bpStyle });
            var colorSettings = [
                { value: a.accentColor,       onChange: function(v){ set({accentColor:v}); },       label: 'Accent Color' },
                { value: a.cardBg,            onChange: function(v){ set({cardBg:v}); },             label: 'Card Background' },
                { value: a.swatchBorder,      onChange: function(v){ set({swatchBorder:v}); },       label: 'Swatch Border' },
                { value: a.inputBorderColor,  onChange: function(v){ set({inputBorderColor:v}); },   label: 'Input Border' },
                { value: a.copyBg,            onChange: function(v){ set({copyBg:v}); },             label: 'Copy Button Background' },
                { value: a.copyColor,         onChange: function(v){ set({copyColor:v}); },          label: 'Copy Button Text' },
                { value: a.labelColor,        onChange: function(v){ set({labelColor:v}); },         label: 'Label Color' },
                { value: a.titleColor,        onChange: function(v){ set({titleColor:v}); },         label: 'Title Color' },
                { value: a.subtitleColor,     onChange: function(v){ set({subtitleColor:v}); },      label: 'Subtitle Color' },
                { value: a.sectionBg,         onChange: function(v){ set({sectionBg:v}); },          label: 'Section Background' }
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Header', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Title',    checked: a.showTitle,    onChange: function(v){ set({showTitle:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Subtitle', checked: a.showSubtitle, onChange: function(v){ set({showSubtitle:v}); } }),
                        el(TextControl, { label: 'Title',    value: a.title,    onChange: function(v){ set({title:v}); } }),
                        el(TextControl, { label: 'Subtitle', value: a.subtitle, onChange: function(v){ set({subtitle:v}); } })
                    ),
                    el(PanelBody, { title: 'Settings', initialOpen: true },
                        el(TextControl, { label: 'Default Color (Hex)', value: a.defaultHex, onChange: function(v){ set({defaultHex:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Color Swatch',   checked: a.showSwatchLarge, onChange: function(v){ set({showSwatchLarge:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Copy Buttons',   checked: a.showCopyBtns,    onChange: function(v){ set({showCopyBtns:v}); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('Subtitle', 'blockenberg'), value: a.typoSubtitle, onChange: function (v) { set({ typoSubtitle: v }); } })
                    ),
el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colorSettings }),
                    el(PanelBody, { title: 'Sizing & Layout', initialOpen: false },
                        el(RangeControl, { label: 'Swatch Height (px)',value: a.swatchHeight,  min: 40, max: 300,step: 4,  onChange: function(v){ set({swatchHeight:v}); } }),
                        el(RangeControl, { label: 'Card Border Radius', value: a.cardRadius,   min: 0, max: 40, step: 1,  onChange: function(v){ set({cardRadius:v}); } }),
                        el(RangeControl, { label: 'Input Border Radius',value: a.inputRadius,  min: 0, max: 24, step: 1,  onChange: function(v){ set({inputRadius:v}); } }),
                        el(RangeControl, { label: 'Max Width (px)',     value: a.maxWidth,     min: 300,max: 900,step: 10, onChange: function(v){ set({maxWidth:v}); } }),
                        el(RangeControl, { label: 'Padding Top (px)',   value: a.paddingTop,   min: 0, max: 160,step: 4,  onChange: function(v){ set({paddingTop:v}); } }),
                        el(RangeControl, { label: 'Padding Bottom (px)',value: a.paddingBottom,min: 0, max: 160,step: 4,  onChange: function(v){ set({paddingBottom:v}); } })
                    )
                ),
                el('div', blockProps, el(ColorPreview, { attributes: a, setAttributes: set }))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(), el('div', { className: 'bkbg-clr-app', 'data-opts': JSON.stringify(a) }));
        }
    });
}() );
