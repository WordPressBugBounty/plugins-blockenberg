( function () {
    var el = React.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useRef = wp.element.useRef;
    var useEffect = wp.element.useEffect;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var TAG_OPTS = ['h1','h2','h3','h4','p'].map(function(t){return{value:t,label:t.toUpperCase()};});
    var BG_OPTS  = [{value:'solid',label:'Solid Color'},{value:'gradient',label:'Gradient'},{value:'image',label:'Image'}];
    var ALIGN_OPTS = [{value:'left',label:'Left'},{value:'center',label:'Center'},{value:'right',label:'Right'}];
    var TINT_OPTS  = [{value:'dark',label:'Dark (shadows)'},{value:'light',label:'Light (halation)'},{value:'colored',label:'Colored (tinted)'}];

    function buildBg(a) {
        if (a.bgType === 'gradient') return 'linear-gradient('+a.bgAngle+'deg, '+(a.bgColor||'#0a0a0f')+', '+(a.bgColor2||'#1e1b4b')+')';
        return a.bgColor || '#0a0a0f';
    }

    registerBlockType('blockenberg/noise-section', {
        title: 'Noise / Grain Section',
        icon: 'image-flip-horizontal',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr = props.attributes; var setAttr = props.setAttributes;
            var previewRef = useRef(null);
            var canvasRef = useRef(null);
            var rafRef = useRef(null);

            useEffect(function () {
                var previewEl = previewRef.current;
                var canvas = canvasRef.current;
                if (!previewEl || !canvas) return;

                var ctx = canvas.getContext('2d');
                if (!ctx) return;

                var pixelRatio = window.devicePixelRatio || 1;
                var fps = Math.max(1, attr.noiseFps || 12);
                var frameInterval = 1000 / fps;
                var scale = Math.max(0.5, attr.noiseScale || 1);
                var opacity = attr.noiseOpacity !== undefined ? attr.noiseOpacity : 0.3;
                var alpha = Math.max(0, Math.min(255, Math.round(opacity * 255)));
                var lastFrame = 0;

                var tintR = 0, tintG = 0, tintB = 0;
                if (attr.noiseTint === 'light') { tintR = 255; tintG = 255; tintB = 220; }
                else if (attr.noiseTint === 'colored') { tintR = 120; tintG = 80; tintB = 200; }

                function resizeCanvas() {
                    var w = previewEl.offsetWidth || 800;
                    var h = previewEl.offsetHeight || (attr.sectionHeight || 600);
                    canvas.width = Math.ceil(w * pixelRatio / scale);
                    canvas.height = Math.ceil(h * pixelRatio / scale);
                    canvas.style.width = w + 'px';
                    canvas.style.height = h + 'px';
                }

                function drawNoise(now) {
                    if (now - lastFrame < frameInterval) return;
                    lastFrame = now;

                    var w = canvas.width;
                    var h = canvas.height;
                    var imageData = ctx.createImageData(w, h);
                    var data = imageData.data;

                    for (var i = 0; i < data.length; i += 4) {
                        var v = Math.random() * 255 | 0;
                        data[i] = tintR || v;
                        data[i + 1] = tintG || v;
                        data[i + 2] = tintB || v;
                        data[i + 3] = alpha;
                    }
                    ctx.putImageData(imageData, 0, 0);
                }

                function loop(now) {
                    drawNoise(now);
                    rafRef.current = requestAnimationFrame(loop);
                }

                function stopLoop() {
                    if (rafRef.current) {
                        cancelAnimationFrame(rafRef.current);
                        rafRef.current = null;
                    }
                }

                resizeCanvas();
                stopLoop();
                rafRef.current = requestAnimationFrame(loop);
                window.addEventListener('resize', resizeCanvas);

                return function () {
                    stopLoop();
                    window.removeEventListener('resize', resizeCanvas);
                };
            }, [attr.noiseOpacity, attr.noiseTint, attr.noiseFps, attr.noiseScale, attr.sectionHeight, attr.bgType, attr.bgImage, attr.bgImageOpacity, attr.bgColor, attr.bgColor2, attr.bgAngle]);

            var preview = el('div', {
                ref: previewRef,
                style: {
                    position:'relative',
                    minHeight:(attr.sectionHeight||600)+'px',
                    background: buildBg(attr),
                    display:'flex', alignItems:'center', justifyContent: attr.textAlign==='center'?'center':attr.textAlign==='right'?'flex-end':'flex-start',
                    padding:(attr.paddingTop||100)+'px clamp(24px,5vw,80px) '+(attr.paddingBottom||100)+'px',
                    overflow:'hidden',
                    borderRadius:8
                }
            },
                /* Background image layer */
                attr.bgType === 'image' && attr.bgImage && el('div', {
                    style: { position:'absolute', inset:0, backgroundImage:'url('+attr.bgImage+')', backgroundSize:'cover', backgroundPosition:'center', opacity:attr.bgImageOpacity||0.5, zIndex:0 }
                }),
                /* Grain overlay preview (static version) */
                el('canvas', {
                    ref: canvasRef,
                    style: { position:'absolute', inset:0, zIndex:1, pointerEvents:'none' }
                }),
                /* Content */
                el('div', { className: 'bkbg-ns-content', style: { position:'relative', zIndex:2, maxWidth:(attr.maxWidth||800)+'px', textAlign:attr.textAlign||'center', width:'100%' } },
                    el(attr.tag||'h1', {
                        className: 'bkbg-ns-heading',
                        style: { color:attr.textColor||'#fff', margin:'0 0 24px' }
                    }, attr.heading),
                    attr.subtext && el('p', { className: 'bkbg-ns-subtext', style: { color:attr.subtextColor||'#94a3b8', margin:'0 0 36px' } }, attr.subtext),
                    el('div', { style: { display:'flex', gap:12, flexWrap:'wrap', justifyContent:attr.textAlign==='center'?'center':'flex-start', alignItems:'center' } },
                        attr.showCta && el('a', { href:attr.ctaUrl||'#', style: { background:attr.ctaBg||'#fff', color:attr.ctaColor||'#0a0a0f', padding:'14px 32px', borderRadius:8, fontWeight:700, fontSize:16, textDecoration:'none' } }, attr.ctaLabel||'Get Started'),
                        attr.showCta2 && el('a', { href:attr.ctaUrl2||'#', style: { background:attr.ctaBg2||'transparent', color:attr.ctaColor2||'#fff', border:'1px solid '+(attr.ctaBorder2||'rgba(255,255,255,0.4)'), padding:'14px 32px', borderRadius:8, fontWeight:700, fontSize:16, textDecoration:'none' } }, attr.ctaLabel2||'Learn More')
                    )
                )
            );

            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) { Object.assign(s, _tvf(attr.headingTypo, '--bkbg-ns-hd-')); Object.assign(s, _tvf(attr.subtextTypo, '--bkbg-ns-st-')); }
                return { style: s };
            })());

            return el(React.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, {title:'Content', initialOpen:true},
                        el(TextControl,{__nextHasNoMarginBottom:true,label:'Heading',value:attr.heading,onChange:function(v){setAttr({heading:v});}}),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Heading Tag',value:attr.tag,options:TAG_OPTS,onChange:function(v){setAttr({tag:v});}}),
                        el(TextareaControl,{__nextHasNoMarginBottom:true,label:'Subtext',value:attr.subtext,onChange:function(v){setAttr({subtext:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Primary CTA',checked:attr.showCta,onChange:function(v){setAttr({showCta:v});}}),
                        attr.showCta && el(TextControl,{__nextHasNoMarginBottom:true,label:'CTA Label',value:attr.ctaLabel,onChange:function(v){setAttr({ctaLabel:v});}}),
                        attr.showCta && el(TextControl,{__nextHasNoMarginBottom:true,label:'CTA URL',value:attr.ctaUrl,onChange:function(v){setAttr({ctaUrl:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Secondary CTA',checked:attr.showCta2,onChange:function(v){setAttr({showCta2:v});}}),
                        attr.showCta2 && el(TextControl,{__nextHasNoMarginBottom:true,label:'Secondary Label',value:attr.ctaLabel2,onChange:function(v){setAttr({ctaLabel2:v});}}),
                        attr.showCta2 && el(TextControl,{__nextHasNoMarginBottom:true,label:'Secondary URL',value:attr.ctaUrl2,onChange:function(v){setAttr({ctaUrl2:v});}})
                    ),
                    el(PanelBody, {title:'Background', initialOpen:true},
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Background Type',value:attr.bgType,options:BG_OPTS,onChange:function(v){setAttr({bgType:v});}}),
                        attr.bgType === 'image' && el(MediaUpload,{
                            onSelect:function(m){setAttr({bgImage:m.url,bgImageId:m.id});},
                            allowedTypes:['image'],value:attr.bgImageId,
                            render:function(p){ return el(Button,{variant:'secondary',onClick:p.open},attr.bgImage?'Change Image':'Select Image'); }
                        }),
                        attr.bgType === 'image' && attr.bgImage && el(RangeControl,{__nextHasNoMarginBottom:true,label:'Image Opacity',value:attr.bgImageOpacity,min:0,max:1,step:0.05,onChange:function(v){setAttr({bgImageOpacity:v});}}),
                        attr.bgType === 'gradient' && el(RangeControl,{__nextHasNoMarginBottom:true,label:'Gradient Angle',value:attr.bgAngle,min:0,max:360,onChange:function(v){setAttr({bgAngle:v});}})
                    ),
                    el(PanelBody, {title:'Noise Settings', initialOpen:true},
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Noise Opacity',value:attr.noiseOpacity !== undefined ? attr.noiseOpacity : 0.3,min:0,max:0.5,step:0.01,onChange:function(v){setAttr({noiseOpacity:v});}}),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Noise Tint',value:attr.noiseTint,options:TINT_OPTS,onChange:function(v){setAttr({noiseTint:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'FPS (animation speed)',value:attr.noiseFps,min:1,max:60,onChange:function(v){setAttr({noiseFps:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Grain Scale',value:attr.noiseScale,min:0.5,max:4,step:0.5,onChange:function(v){setAttr({noiseScale:v});}})
                    ),
                    el(PanelBody, {title:'Typography', initialOpen:false},
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Text Align',value:attr.textAlign,options:ALIGN_OPTS,onChange:function(v){setAttr({textAlign:v});}}),
                        getTypoControl() && el(getTypoControl(), { label: 'Heading Typography', value: attr.headingTypo || {}, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: 'Subtext Typography', value: attr.subtextTypo || {}, onChange: function (v) { setAttr({ subtextTypo: v }); } })
                    ),
                    el(PanelBody, {title:'Layout', initialOpen:false},
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Section Height (px)',value:attr.sectionHeight,min:200,max:1200,onChange:function(v){setAttr({sectionHeight:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Content Max Width (px)',value:attr.maxWidth,min:300,max:1600,onChange:function(v){setAttr({maxWidth:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding Top (px)',value:attr.paddingTop,min:0,max:300,onChange:function(v){setAttr({paddingTop:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding Bottom (px)',value:attr.paddingBottom,min:0,max:300,onChange:function(v){setAttr({paddingBottom:v});}})
                    ),
                    el(PanelColorSettings, {
                        title:'Colors',initialOpen:false,
                        colorSettings:[
                            {value:attr.bgColor,      onChange:function(v){setAttr({bgColor:      v||'#0a0a0f'});},label:'Background / Gradient From'},
                            attr.bgType==='gradient' && {value:attr.bgColor2,onChange:function(v){setAttr({bgColor2:v||'#1e1b4b'});},label:'Gradient To'},
                            {value:attr.textColor,    onChange:function(v){setAttr({textColor:    v||'#ffffff'});},label:'Heading'},
                            {value:attr.subtextColor, onChange:function(v){setAttr({subtextColor: v||'#94a3b8'});},label:'Subtext'},
                            attr.showCta  && {value:attr.ctaBg,    onChange:function(v){setAttr({ctaBg:    v||'#fff'});},label:'CTA Bg'},
                            attr.showCta  && {value:attr.ctaColor, onChange:function(v){setAttr({ctaColor: v||'#0a0a0f'});},label:'CTA Text'},
                            attr.showCta2 && {value:attr.ctaBg2,   onChange:function(v){setAttr({ctaBg2:   v||'transparent'});},label:'CTA 2 Bg'},
                            attr.showCta2 && {value:attr.ctaColor2,onChange:function(v){setAttr({ctaColor2:v||'#fff'});},label:'CTA 2 Text'}
                        ].filter(Boolean)
                    })
                ),
                el('div', blockProps, preview)
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className:'bkbg-ns-app', 'data-opts':JSON.stringify(props.attributes) })
            );
        }
    });
}() );
