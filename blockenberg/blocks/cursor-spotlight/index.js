( function () {
    var el = React.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;

    var _csTC, _csTV;
    function _tc() { return _csTC || (_csTC = window.bkbgTypographyControl); }
    function _tv(typo, prefix) { return _csTV ? _csTV(typo, prefix) : ((_csTV = window.bkbgTypoCssVars) ? _csTV(typo, prefix) : {}); }

    var IDLE_MODES = [
        { value: 'center', label: 'Center of section' },
        { value: 'full',   label: 'Reveal all (no dark)' },
        { value: 'dark',   label: 'Fully dark' }
    ];

    registerBlockType('blockenberg/cursor-spotlight', {
        title: 'Cursor Spotlight',
        icon: 'visibility',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr = props.attributes; var setAttr = props.setAttributes;

            // Idle "center" spotlight position for editor preview
            var spotR = attr.spotlightSize || 280;
            var blur  = attr.spotlightBlur || 40;
            var mask  = 'radial-gradient(circle ' + spotR + 'px at 50% 50%, ' +
                        (attr.spotColor || '#fff') + ' 0%, transparent ' + (spotR + blur) + 'px)';
            var dimRgb = hexToRgbStr(attr.dimColor || '#000');
            var dimOverlay = 'rgba(' + dimRgb + ',' + (attr.dimOpacity || 0.92) + ')';

            return el(React.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Content', initialOpen: true },
                        el(SelectControl,  { __nextHasNoMarginBottom: true, label: 'Heading Tag', value: attr.tag, options: ['h1','h2','h3','h4','h5','h6'].map(function(t){return{value:t,label:t.toUpperCase()};}), onChange: function(v){ setAttr({tag:v}); } }),
                        el(TextControl,    { __nextHasNoMarginBottom: true, label: 'Heading', value: attr.heading, onChange: function(v){ setAttr({heading:v}); } }),
                        el(TextareaControl,{ __nextHasNoMarginBottom: true, label: 'Subtext', value: attr.subtext, onChange: function(v){ setAttr({subtext:v}); } }),
                        el(ToggleControl,  { __nextHasNoMarginBottom: true, label: 'Show Hint Text', checked: attr.showHint, onChange: function(v){ setAttr({showHint:v}); } }),
                        attr.showHint && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Hint', value: attr.hintText, onChange: function(v){ setAttr({hintText:v}); } })
                    ),
                    el(PanelBody, { title: 'Spotlight', initialOpen: true },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Spotlight Size (px)', value: attr.spotlightSize, min: 60, max: 800, onChange: function(v){ setAttr({spotlightSize:v}); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Edge Blur (px)', value: attr.spotlightBlur, min: 0, max: 200, onChange: function(v){ setAttr({spotlightBlur:v}); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Dim Opacity', value: attr.dimOpacity, min: 0.1, max: 1, step: 0.05, onChange: function(v){ setAttr({dimOpacity:v}); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Idle Mode', value: attr.idleMode, options: IDLE_MODES, onChange: function(v){ setAttr({idleMode:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Smooth Follow', checked: attr.followSmooth, onChange: function(v){ setAttr({followSmooth:v}); } })
                    ),
                    el(PanelBody, { title: 'Section Size', initialOpen: false },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Section Height (px)', value: attr.sectionHeight, min: 200, max: 1200, onChange: function(v){ setAttr({sectionHeight:v}); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Border Radius (px)', value: attr.borderRadius, min: 0, max: 48, onChange: function(v){ setAttr({borderRadius:v}); } })
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        _tc() && el(_tc(), { label: 'Heading', typo: attr.typoHeading || {}, onChange: function(v) { setAttr({ typoHeading: v }); } }),
                        _tc() && el(_tc(), { label: 'Subtext', typo: attr.typoSubtext || {}, onChange: function(v) { setAttr({ typoSubtext: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Text Align', value: attr.textAlign, options: [{value:'left',label:'Left'},{value:'center',label:'Center'},{value:'right',label:'Right'}], onChange: function(v){ setAttr({textAlign:v}); } })
                    ),
                    el(PanelBody, { title: 'Background Image', initialOpen: false },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function(m){ setAttr({bgImage:m.url,bgImageId:m.id}); },
                                allowedTypes: ['image'],
                                value: attr.bgImageId,
                                render: function(r){ return el('div', null,
                                    attr.bgImage ? el(Button, {variant:'secondary',isSmall:true,onClick:r.open},'Change BG Image') : el(Button,{variant:'primary',onClick:r.open},'Select BG Image'),
                                    attr.bgImage && el(Button,{variant:'tertiary',isSmall:true,isDestructive:true,style:{marginLeft:8},onClick:function(){setAttr({bgImage:'',bgImageId:0});}},'Remove')
                                ); }
                            })
                        ),
                        attr.bgImage && el(RangeControl, { __nextHasNoMarginBottom: true, label: 'BG Image Opacity', value: attr.bgImageOpacity, min: 0, max: 1, step: 0.05, onChange: function(v){ setAttr({bgImageOpacity:v}); } })
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors', initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,    onChange: function(v){ setAttr({bgColor:   v||'#0c0a1e'}); }, label: 'Section Background' },
                            { value: attr.dimColor,   onChange: function(v){ setAttr({dimColor:  v||'#000000'}); }, label: 'Dim Color' },
                            { value: attr.spotColor,  onChange: function(v){ setAttr({spotColor: v||'#ffffff'}); }, label: 'Spotlight Color' },
                            { value: attr.textColor,  onChange: function(v){ setAttr({textColor: v||'#ffffff'}); }, label: 'Text Color' },
                            { value: attr.accentColor,onChange: function(v){ setAttr({accentColor:v||'#a78bfa'}); }, label: 'Accent Color' }
                        ]
                    })
                ),

                el('div', useBlockProps(),
                    el('div', {
                        className: 'bkbg-cs-editor-preview',
                        style: Object.assign({
                            position: 'relative',
                            height: (attr.sectionHeight || 500) + 'px',
                            borderRadius: (attr.borderRadius || 16) + 'px',
                            overflow: 'hidden',
                            backgroundColor: attr.bgColor || '#0c0a1e',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        },
                        { '--bkbg-cs-hdg-fs': (attr.fontSize || 48) + 'px', '--bkbg-cs-hdg-fw': attr.fontWeight || '800', '--bkbg-cs-sub-fs': (attr.subtextSize || 18) + 'px' },
                        _tv(attr.typoHeading, '--bkbg-cs-hdg-'),
                        _tv(attr.typoSubtext, '--bkbg-cs-sub-'))
                    },
                        // BG image
                        attr.bgImage && el('img', { src: attr.bgImage, style: { position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:attr.bgImageOpacity||0.5 } }),
                        // Dark overlay
                        el('div', { style: { position:'absolute',inset:0, background: dimOverlay, maskImage: mask, WebkitMaskImage: mask } }),
                        // Content
                        el('div', {
                            style: { position:'relative', zIndex:2, textAlign:attr.textAlign||'center', padding:'32px', color: attr.textColor||'#fff' }
                        },
                            el(attr.tag||'h2', { className: 'bkbg-cs-heading', style: { margin:0,color:attr.textColor||'#fff' } }, attr.heading),
                            attr.subtext && el('p', { className: 'bkbg-cs-subtext', style: { marginTop:16,opacity:0.75,color:attr.textColor||'#fff' } }, attr.subtext),
                            attr.showHint && el('p', { style: { marginTop:24,fontSize:13,color:attr.accentColor||'#a78bfa',opacity:0.8,letterSpacing:'0.1em',textTransform:'uppercase' } }, '↖ ' + (attr.hintText||'Move cursor to reveal') + ' ↗')
                        )
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className:'bkbg-cs-app', 'data-opts':JSON.stringify(props.attributes) })
            );
        }
    });

    function hexToRgbStr(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(function(c){return c+c;}).join('');
        var n = parseInt(hex, 16);
        return [(n>>16)&255,(n>>8)&255,n&255].join(',');
    }
}() );
