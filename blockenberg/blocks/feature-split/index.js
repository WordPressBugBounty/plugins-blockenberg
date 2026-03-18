/* ====================================================
   Feature Split Block — editor (index.js)
   Block: blockenberg/feature-split
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var useState           = wp.element.useState;
    var RichText           = wp.blockEditor.RichText;
    var MediaUpload        = wp.blockEditor.MediaUpload;
    var MediaUploadCheck   = wp.blockEditor.MediaUploadCheck;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelBody          = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var ToggleControl      = wp.components.ToggleControl;
    var TextControl        = wp.components.TextControl;
    var Button             = wp.components.Button;
    var __                 = wp.i18n.__;
    var _fspTC, _fspTV;
    function _tc() { return (_fspTC = _fspTC || window.bkbgTypographyControl); }
    function _tv() { return (_fspTV = _fspTV || window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    function uid() { return 'f' + Math.random().toString(36).slice(2,7); }
    function move(arr, from, to) { var a=arr.slice(); a.splice(to,0,a.splice(from,1)[0]); return a; }

    function buildWrapStyle(a) {
        return Object.assign({
            '--bkbg-fsp-gap':        a.gap + 'px',
            '--bkbg-fsp-img-w':      a.imageWidth + '%',
            '--bkbg-fsp-img-radius': a.imageRadius + 'px',
            '--bkbg-fsp-btn-radius': a.btnRadius + 'px',
            '--bkbg-fsp-pt':         a.paddingTop + 'px',
            '--bkbg-fsp-pb':         a.paddingBottom + 'px',
            '--bkbg-fsp-content-max':a.contentMaxWidth + 'px',
            '--bkbg-fsp-eyebrow-bg': a.eyebrowBg,
            '--bkbg-fsp-eyebrow-clr':a.eyebrowColor,
            '--bkbg-fsp-h-color':    a.headlineColor,
            '--bkbg-fsp-body-color': a.bodyColor,
            '--bkbg-fsp-feat-color': a.featureColor,
            '--bkbg-fsp-prim-bg':    a.primaryBtnBg,
            '--bkbg-fsp-prim-color': a.primaryBtnColor,
            '--bkbg-fsp-sec-color':  a.secBtnColor,
            '--bkbg-fsp-accent':     a.accentColor,
            background:              a.sectionBg || undefined,
        },
            _tv()(a.typoEyebrow, '--bkbg-fsp-eb-'),
            _tv()(a.typoHeadline, '--bkbg-fsp-hl-'),
            _tv()(a.typoBody, '--bkbg-fsp-bd-'),
            _tv()(a.typoFeature, '--bkbg-fsp-ft-')
        );
    }

    /* ── REGISTER ── */
    registerBlockType('blockenberg/feature-split', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var features= a.features;

            var wrapCls = 'bkbg-fsp-wrap bkbg-fsp-style--' + a.style
                + (a.imagePosition === 'left' ? ' bkbg-fsp-img-left' : ' bkbg-fsp-img-right');
            var blockProps = useBlockProps({ className: wrapCls, style: buildWrapStyle(a) });

            function updateFeature(id, text) {
                setAttr({ features: features.map(function(f){ return f.id===id ? Object.assign({},f,{text:text}) : f; }) });
            }
            function updateFeatureIcon(id, icon) {
                setAttr({ features: features.map(function(f){ return f.id===id ? Object.assign({},f,{icon:icon}) : f; }) });
            }

            var inspector = el(InspectorControls, null,
                /* Style */
                el(PanelBody, { title:__('Style & Layout','blockenberg'), initialOpen:true },
                    el(SelectControl, { label:__('Visual style','blockenberg'), value:a.style, options:[
                        {label:__('Clean (white)','blockenberg'), value:'clean'},
                        {label:__('Dark','blockenberg'), value:'dark'},
                        {label:__('Soft gradient','blockenberg'), value:'gradient'},
                        {label:__('Accent bg','blockenberg'), value:'accent'},
                    ], onChange:function(v){ setAttr({style:v}); } }),
                    el(SelectControl, { label:__('Image position','blockenberg'), value:a.imagePosition, options:[
                        {label:__('Right','blockenberg'), value:'right'},
                        {label:__('Left','blockenberg'), value:'left'},
                    ], onChange:function(v){ setAttr({imagePosition:v}); } }),
                    el(SelectControl, { label:__('Vertical alignment','blockenberg'), value:a.verticalAlign, options:[
                        {label:'Center', value:'center'},{label:'Top', value:'flex-start'},{label:'Bottom', value:'flex-end'}
                    ], onChange:function(v){ setAttr({verticalAlign:v}); } }),
                    el(RangeControl, { label:__('Column gap (px)','blockenberg'), value:a.gap, min:0, max:120, onChange:function(v){ setAttr({gap:v}); } }),
                    el(RangeControl, { label:__('Image width %','blockenberg'), value:a.imageWidth, min:30, max:70, onChange:function(v){ setAttr({imageWidth:v}); } }),
                    el(RangeControl, { label:__('Image border radius (px)','blockenberg'), value:a.imageRadius, min:0, max:40, onChange:function(v){ setAttr({imageRadius:v}); } }),
                    el(ToggleControl, { label:__('Image shadow','blockenberg'), checked:a.imageShadow, onChange:function(v){ setAttr({imageShadow:v}); } })
                ),

                /* Content */
                el(PanelBody, { title:__('Content','blockenberg'), initialOpen:false },
                    el(ToggleControl, { label:__('Show eyebrow badge','blockenberg'), checked:a.showEyebrow, onChange:function(v){ setAttr({showEyebrow:v}); } }),
                    el(ToggleControl, { label:__('Show body text','blockenberg'),    checked:a.showBody,    onChange:function(v){ setAttr({showBody:v}); } }),
                    el(ToggleControl, { label:__('Show feature list','blockenberg'), checked:a.showFeatures,onChange:function(v){ setAttr({showFeatures:v}); } }),
                    el(ToggleControl, { label:__('Show primary button','blockenberg'), checked:a.showPrimaryBtn, onChange:function(v){ setAttr({showPrimaryBtn:v}); } }),
                    el(ToggleControl, { label:__('Show secondary button','blockenberg'), checked:a.showSecondaryBtn, onChange:function(v){ setAttr({showSecondaryBtn:v}); } }),
                    a.showEyebrow ? el(TextControl, { label:__('Eyebrow text','blockenberg'), value:a.eyebrow, onChange:function(v){ setAttr({eyebrow:v}); } }) : null,
                    a.showPrimaryBtn ? el(Fragment, null,
                        el(TextControl, { label:__('Primary button label','blockenberg'), value:a.primaryBtnLabel, onChange:function(v){ setAttr({primaryBtnLabel:v}); } }),
                        el(TextControl, { label:__('Primary button URL','blockenberg'), value:a.primaryBtnUrl, onChange:function(v){ setAttr({primaryBtnUrl:v}); } }),
                        el(ToggleControl, { label:__('Open in new tab','blockenberg'), checked:a.primaryBtnTarget, onChange:function(v){ setAttr({primaryBtnTarget:v}); } })
                    ) : null,
                    a.showSecondaryBtn ? el(Fragment, null,
                        el(TextControl, { label:__('Secondary button label','blockenberg'), value:a.secondaryBtnLabel, onChange:function(v){ setAttr({secondaryBtnLabel:v}); } }),
                        el(TextControl, { label:__('Secondary button URL','blockenberg'), value:a.secondaryBtnUrl, onChange:function(v){ setAttr({secondaryBtnUrl:v}); } })
                    ) : null,
                    el(RangeControl, { label:__('Content max width (px)','blockenberg'), value:a.contentMaxWidth, min:300, max:800, onChange:function(v){ setAttr({contentMaxWidth:v}); } })
                ),

                /* Feature list */
                a.showFeatures ? el(PanelBody, { title:__('Feature items','blockenberg'), initialOpen:false },
                    features.map(function(f, idx) {
                        return el('div', { key:f.id, style:{ display:'flex', gap:'4px', marginBottom:'6px', alignItems:'center' } },
                            el('div', { style:{ flexShrink:0 } },
                                el(IP().IconPickerControl, {
                                    iconType: f.iconType, customChar: f.icon, dashicon: f.iconDashicon, imageUrl: f.iconImageUrl,
                                    onChangeType: function(v){ setAttr({features:features.map(function(x){ return x.id===f.id ? Object.assign({},x,{iconType:v}) : x; })}); },
                                    onChangeChar: function(v){ updateFeatureIcon(f.id,v); },
                                    onChangeDashicon: function(v){ setAttr({features:features.map(function(x){ return x.id===f.id ? Object.assign({},x,{iconDashicon:v}) : x; })}); },
                                    onChangeImageUrl: function(v){ setAttr({features:features.map(function(x){ return x.id===f.id ? Object.assign({},x,{iconImageUrl:v}) : x; })}); }
                                })
                            ),
                            el(TextControl, { label: idx===0 ? __('Text','blockenberg') : undefined, value:f.text, onChange:function(v){ updateFeature(f.id,v); }, style:{ flex:1 } }),
                            el(Button, { icon:'arrow-up', isSmall:true, disabled:idx===0, onClick:function(){ setAttr({features:move(features,idx,idx-1)}); } }),
                            el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(){ setAttr({features:features.filter(function(_,i){ return i!==idx; })}); } })
                        );
                    }),
                    el(Button, { variant:'secondary', isSmall:true, style:{width:'100%',marginTop:'4px'},
                        onClick:function(){ setAttr({ features: features.concat([{id:uid(),icon:'✅',text:'New feature',iconType:'custom-char',iconDashicon:'',iconImageUrl:''}]) }); }
                    }, __('+ Add feature','blockenberg'))
                ) : null,

                /* Spacing */
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } }),
                    el(RangeControl, { label:__('Button radius (px)','blockenberg'),  value:a.btnRadius,     min:0, max:50,  onChange:function(v){ setAttr({btnRadius:v}); } })
                ),

                /* Typography */
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    _tc() && el(_tc(), { label: __('Headline', 'blockenberg'), value: a.typoHeadline, onChange: function (v) { setAttr({ typoHeadline: v }); } }),
                    _tc() && el(_tc(), { label: __('Body', 'blockenberg'), value: a.typoBody, onChange: function (v) { setAttr({ typoBody: v }); } }),
                    _tc() && el(_tc(), { label: __('Feature', 'blockenberg'), value: a.typoFeature, onChange: function (v) { setAttr({ typoFeature: v }); } }),
                    _tc() && el(_tc(), { label: __('Eyebrow', 'blockenberg'), value: a.typoEyebrow, onChange: function (v) { setAttr({ typoEyebrow: v }); } })
                ),

                /* Colors */
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Section background','blockenberg'), value:a.sectionBg,       onChange:function(v){ setAttr({sectionBg:v||''}); }},
                    {label:__('Eyebrow bg','blockenberg'),         value:a.eyebrowBg,       onChange:function(v){ setAttr({eyebrowBg:v||''}); }},
                    {label:__('Eyebrow color','blockenberg'),      value:a.eyebrowColor,    onChange:function(v){ setAttr({eyebrowColor:v||''}); }},
                    {label:__('Headline color','blockenberg'),     value:a.headlineColor,   onChange:function(v){ setAttr({headlineColor:v||''}); }},
                    {label:__('Body text color','blockenberg'),    value:a.bodyColor,       onChange:function(v){ setAttr({bodyColor:v||''}); }},
                    {label:__('Feature text color','blockenberg'), value:a.featureColor,    onChange:function(v){ setAttr({featureColor:v||''}); }},
                    {label:__('Primary btn bg','blockenberg'),     value:a.primaryBtnBg,    onChange:function(v){ setAttr({primaryBtnBg:v||''}); }},
                    {label:__('Primary btn text','blockenberg'),   value:a.primaryBtnColor, onChange:function(v){ setAttr({primaryBtnColor:v||''}); }},
                    {label:__('Secondary btn color','blockenberg'),value:a.secBtnColor,     onChange:function(v){ setAttr({secBtnColor:v||''}); }},
                    {label:__('Accent color','blockenberg'),       value:a.accentColor,     onChange:function(v){ setAttr({accentColor:v||''}); }},
                ] })
            );

            /* Content column */
            var contentEl = el('div', {
                className: 'bkbg-fsp-content',
                style: { background: a.contentBg || undefined, alignSelf: a.verticalAlign }
            },
                a.showEyebrow ? el('span', { className:'bkbg-fsp-eyebrow' }, a.eyebrow) : null,
                el(RichText, { tagName:'h2', className:'bkbg-fsp-headline', value:a.headline, onChange:function(v){ setAttr({headline:v}); }, placeholder:__('Compelling headline…','blockenberg') }),
                a.showBody ? el(RichText, { tagName:'p', className:'bkbg-fsp-body', value:a.body, onChange:function(v){ setAttr({body:v}); }, placeholder:__('Body text…','blockenberg') }) : null,
                a.showFeatures ? el('ul', { className:'bkbg-fsp-features' },
                    features.map(function(f){
                        return el('li', { key:f.id, className:'bkbg-fsp-feature' },
                            el('span', { className:'bkbg-fsp-feature-icon' }, (f.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(f.iconType, f.icon, f.iconDashicon, f.iconImageUrl, f.iconDashiconColor) : f.icon),
                            el('span', { className:'bkbg-fsp-feature-text' }, f.text)
                        );
                    })
                ) : null,
                (a.showPrimaryBtn || a.showSecondaryBtn) ? el('div', { className:'bkbg-fsp-btns' },
                    a.showPrimaryBtn ? el('a', { className:'bkbg-fsp-btn bkbg-fsp-btn--primary', href:a.primaryBtnUrl, onClick:function(e){ e.preventDefault(); } }, a.primaryBtnLabel) : null,
                    a.showSecondaryBtn ? el('a', { className:'bkbg-fsp-btn bkbg-fsp-btn--secondary', href:a.secondaryBtnUrl, onClick:function(e){ e.preventDefault(); } }, a.secondaryBtnLabel) : null
                ) : null
            );

            /* Image column */
            var imageEl = el('div', { className:'bkbg-fsp-image-wrap' + (a.imageShadow ? ' bkbg-fsp-shadow' : '') },
                a.imageUrl
                    ? el('img', { src:a.imageUrl, alt:a.imageAlt, className:'bkbg-fsp-img' })
                    : el(MediaUploadCheck, null,
                        el(MediaUpload, {
                            onSelect:function(m){ setAttr({ imageUrl:m.url, imageId:m.id, imageAlt:m.alt||'' }); },
                            allowedTypes:['image'], value:a.imageId,
                            render:function(o){ return el(Button, { onClick:o.open, className:'bkbg-fsp-img-placeholder', variant:'secondary' }, __('+ Choose image','blockenberg')); }
                        })
                    ),
                a.imageUrl ? el('div', { className:'bkbg-fsp-img-actions' },
                    el(Button, { isSmall:true, variant:'secondary', onClick:function(){ setAttr({ imageUrl:'', imageId:0 }); } }, __('Remove','blockenberg'))
                ) : null
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    a.imagePosition === 'right' ? el(Fragment, null, contentEl, imageEl) : el(Fragment, null, imageEl, contentEl)
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var wrapCls = 'bkbg-fsp-wrap bkbg-fsp-style--' + a.style
                + (a.imagePosition === 'left' ? ' bkbg-fsp-img-left' : ' bkbg-fsp-img-right');
            var blockProps = wp.blockEditor.useBlockProps.save({ className: wrapCls, style: buildWrapStyle(a) });

            var contentEl = el('div', { className:'bkbg-fsp-content', style:{ alignSelf:a.verticalAlign } },
                a.showEyebrow ? el('span', { className:'bkbg-fsp-eyebrow' }, a.eyebrow) : null,
                el(RichText.Content, { tagName:'h2', className:'bkbg-fsp-headline', value:a.headline }),
                a.showBody ? el(RichText.Content, { tagName:'p', className:'bkbg-fsp-body', value:a.body }) : null,
                a.showFeatures ? el('ul', { className:'bkbg-fsp-features' },
                    a.features.map(function(f){
                        return el('li', { key:f.id, className:'bkbg-fsp-feature' },
                            el('span', { className:'bkbg-fsp-feature-icon' }, (f.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(f.iconType, f.icon, f.iconDashicon, f.iconImageUrl, f.iconDashiconColor) : f.icon),
                            el('span', { className:'bkbg-fsp-feature-text' }, f.text)
                        );
                    })
                ) : null,
                (a.showPrimaryBtn || a.showSecondaryBtn) ? el('div', { className:'bkbg-fsp-btns' },
                    a.showPrimaryBtn ? el('a', { className:'bkbg-fsp-btn bkbg-fsp-btn--primary', href:a.primaryBtnUrl, target: a.primaryBtnTarget ? '_blank' : undefined }, a.primaryBtnLabel) : null,
                    a.showSecondaryBtn ? el('a', { className:'bkbg-fsp-btn bkbg-fsp-btn--secondary', href:a.secondaryBtnUrl }, a.secondaryBtnLabel) : null
                ) : null
            );

            var imageEl = el('div', { className:'bkbg-fsp-image-wrap' + (a.imageShadow ? ' bkbg-fsp-shadow' : '') },
                a.imageUrl ? el('img', { src:a.imageUrl, alt:a.imageAlt, className:'bkbg-fsp-img', loading:'lazy' }) : null
            );

            return el('div', blockProps,
                a.imagePosition === 'right' ? el(Fragment, null, contentEl, imageEl) : el(Fragment, null, imageEl, contentEl)
            );
        }
    });
}() );
