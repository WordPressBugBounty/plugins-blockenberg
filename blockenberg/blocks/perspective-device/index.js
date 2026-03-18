/* ====================================================
   Perspective Device — editor (index.js)
   Block: blockenberg/perspective-device
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var MediaUpload        = wp.blockEditor.MediaUpload;
    var MediaUploadCheck   = wp.blockEditor.MediaUploadCheck;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var ToggleControl      = wp.components.ToggleControl;
    var TextControl        = wp.components.TextControl;
    var Button             = wp.components.Button;
    var __                 = wp.i18n.__;

    function wrapStyle(a) {
        return {
            '--bkbg-pdev-pt':        a.paddingTop+'px',
            '--bkbg-pdev-pb':        a.paddingBottom+'px',
            '--bkbg-pdev-frame-c':   a.frameColor || undefined,
            '--bkbg-pdev-screen-bg': a.screenBg,
            background:              a.sectionBg || undefined,
        };
    }

    /* Build device frame element */
    function DeviceFrame(props) {
        var a           = props.a;
        var isEdit      = props.isEdit;
        var openMedia   = props.openMedia;

        var screenContent = a.screenshotUrl
            ? el('img', { src:a.screenshotUrl, alt:a.screenshotAlt, className:'bkbg-pdev-screenshot', loading:'lazy' })
            : el('div', { className:'bkbg-pdev-placeholder' },
                el('span', { style:{fontSize:'48px'} }, '🖼️'),
                isEdit ? el('p', { style:{color:'#94a3b8',fontSize:'13px',marginTop:'8px'} }, __('Click to upload screenshot','blockenberg')) : null
              );

        if (a.deviceType === 'browser') {
            return el('div', { className:'bkbg-pdev-device bkbg-pdev-device--browser' + (a.showShadow?' bkbg-pdev-device--shadow':'') },
                el('div', { className:'bkbg-pdev-browser-bar' },
                    el('div', { className:'bkbg-pdev-dots' },
                        el('span'), el('span'), el('span')
                    ),
                    el('div', { className:'bkbg-pdev-url-bar' })
                ),
                el('div', { className:'bkbg-pdev-screen', onClick: isEdit&&!a.screenshotUrl ? openMedia : undefined },
                    screenContent
                ),
                a.showReflection ? el('div', { className:'bkbg-pdev-reflection' }) : null
            );
        }

        if (a.deviceType === 'phone') {
            return el('div', { className:'bkbg-pdev-device bkbg-pdev-device--phone' + (a.showShadow?' bkbg-pdev-device--shadow':'') },
                el('div', { className:'bkbg-pdev-phone-notch' }),
                el('div', { className:'bkbg-pdev-screen', onClick: isEdit&&!a.screenshotUrl ? openMedia : undefined },
                    screenContent
                ),
                el('div', { className:'bkbg-pdev-phone-home' })
            );
        }

        if (a.deviceType === 'tablet') {
            return el('div', { className:'bkbg-pdev-device bkbg-pdev-device--tablet' + (a.showShadow?' bkbg-pdev-device--shadow':'') },
                el('div', { className:'bkbg-pdev-tablet-cam' }),
                el('div', { className:'bkbg-pdev-screen', onClick: isEdit&&!a.screenshotUrl ? openMedia : undefined },
                    screenContent
                ),
                el('div', { className:'bkbg-pdev-tablet-home' })
            );
        }

        /* laptop */
        return el('div', { className:'bkbg-pdev-device bkbg-pdev-device--laptop' + (a.showShadow?' bkbg-pdev-device--shadow':'') },
            el('div', { className:'bkbg-pdev-laptop-lid' },
                el('div', { className:'bkbg-pdev-laptop-cam' }),
                el('div', { className:'bkbg-pdev-screen', onClick: isEdit&&!a.screenshotUrl ? openMedia : undefined },
                    screenContent
                )
            ),
            el('div', { className:'bkbg-pdev-laptop-base' },
                el('div', { className:'bkbg-pdev-laptop-keyboard' }),
                el('div', { className:'bkbg-pdev-laptop-trackpad' })
            )
        );
    }

    registerBlockType('blockenberg/perspective-device', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;

            var blockProps = useBlockProps({
                className: 'bkbg-pdev-wrap bkbg-pdev-persp--' + a.perspective + ' bkbg-pdev-theme--' + a.deviceTheme,
                style: wrapStyle(a)
            });

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Screenshot','blockenberg'), initialOpen:true },
                    el(MediaUploadCheck, null,
                        el(MediaUpload, {
                            onSelect:function(m){ setAttr({screenshotUrl:m.url,screenshotId:m.id}); },
                            allowedTypes:['image'], value:a.screenshotId,
                            render:function(o){ return el(Button, { onClick:o.open, variant:'secondary' }, a.screenshotUrl ? __('Change screenshot','blockenberg') : __('Upload screenshot','blockenberg')); }
                        })
                    ),
                    a.screenshotUrl ? el(Button, { isDestructive:true, variant:'tertiary', isSmall:true, style:{marginTop:'4px'}, onClick:function(){ setAttr({screenshotUrl:'',screenshotId:0}); } }, __('Remove image','blockenberg')) : null,
                    el(TextControl, { label:__('Alt text','blockenberg'), value:a.screenshotAlt, onChange:function(v){ setAttr({screenshotAlt:v}); } })
                ),
                el(PanelBody, { title:__('Device','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Device type','blockenberg'), value:a.deviceType, options:[
                        {label:'Browser window', value:'browser'},
                        {label:'Phone',          value:'phone'},
                        {label:'Tablet',         value:'tablet'},
                        {label:'Laptop',         value:'laptop'},
                    ], onChange:function(v){ setAttr({deviceType:v}); } }),
                    el(SelectControl, { label:__('Perspective','blockenberg'), value:a.perspective, options:[
                        {label:'Flat',              value:'flat'},
                        {label:'Tilt left',         value:'tilt-left'},
                        {label:'Tilt right',        value:'tilt-right'},
                        {label:'Float (animated)',  value:'float'},
                    ], onChange:function(v){ setAttr({perspective:v}); } }),
                    el(SelectControl, { label:__('Device theme','blockenberg'), value:a.deviceTheme, options:[
                        {label:'Light', value:'light'},
                        {label:'Dark',  value:'dark'},
                    ], onChange:function(v){ setAttr({deviceTheme:v}); } }),
                    el(ToggleControl, { label:__('Show shadow','blockenberg'),     checked:a.showShadow,      onChange:function(v){ setAttr({showShadow:v}); } }),
                    el(ToggleControl, { label:__('Show reflection','blockenberg'), checked:a.showReflection,  onChange:function(v){ setAttr({showReflection:v}); } }),
                    el(RangeControl,  { label:__('Max width (px)','blockenberg'),  value:a.maxWidth,          min:320, max:1300, onChange:function(v){ setAttr({maxWidth:v}); } }),
                    el(SelectControl, { label:__('Alignment','blockenberg'), value:a.align, options:[
                        {label:'Left',   value:'left'},
                        {label:'Center', value:'center'},
                        {label:'Right',  value:'right'},
                    ], onChange:function(v){ setAttr({align:v}); } })
                ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } })
                ),
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Section bg','blockenberg'),  value:a.sectionBg,  onChange:function(v){ setAttr({sectionBg:v||''}); }},
                    {label:__('Frame color','blockenberg'), value:a.frameColor, onChange:function(v){ setAttr({frameColor:v||''}); }},
                    {label:__('Screen bg','blockenberg'),   value:a.screenBg,   onChange:function(v){ setAttr({screenBg:v||''}); }},
                ] })
            );

            var alignJustify = a.align==='center' ? 'center' : a.align==='right' ? 'flex-end' : 'flex-start';

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { className:'bkbg-pdev-inner', style:{maxWidth:a.maxWidth+'px',margin:'0 auto',display:'flex',justifyContent:alignJustify} },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect:function(m){ setAttr({screenshotUrl:m.url,screenshotId:m.id}); },
                                allowedTypes:['image'], value:a.screenshotId,
                                render:function(o){
                                    return el(DeviceFrame, { a:a, isEdit:true, openMedia:o.open });
                                }
                            })
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className:'bkbg-pdev-wrap bkbg-pdev-persp--'+a.perspective+' bkbg-pdev-theme--'+a.deviceTheme,
                style:{
                    '--bkbg-pdev-pt':a.paddingTop+'px','--bkbg-pdev-pb':a.paddingBottom+'px','--bkbg-pdev-frame-c':a.frameColor||undefined,'--bkbg-pdev-screen-bg':a.screenBg,background:a.sectionBg||undefined,
                }
            });
            var alignJustify = a.align==='center'?'center':a.align==='right'?'flex-end':'flex-start';

            var screenEl = a.screenshotUrl
                ? el('img', { src:a.screenshotUrl, alt:a.screenshotAlt, className:'bkbg-pdev-screenshot', loading:'lazy' })
                : el('div', { className:'bkbg-pdev-placeholder' });

            var deviceEl;
            if (a.deviceType === 'browser') {
                deviceEl = el('div', { className:'bkbg-pdev-device bkbg-pdev-device--browser'+(a.showShadow?' bkbg-pdev-device--shadow':'') },
                    el('div', { className:'bkbg-pdev-browser-bar' }, el('div', { className:'bkbg-pdev-dots' }, el('span'), el('span'), el('span')), el('div', { className:'bkbg-pdev-url-bar' })),
                    el('div', { className:'bkbg-pdev-screen' }, screenEl),
                    a.showReflection ? el('div', { className:'bkbg-pdev-reflection' }) : null
                );
            } else if (a.deviceType === 'phone') {
                deviceEl = el('div', { className:'bkbg-pdev-device bkbg-pdev-device--phone'+(a.showShadow?' bkbg-pdev-device--shadow':'') },
                    el('div', { className:'bkbg-pdev-phone-notch' }),
                    el('div', { className:'bkbg-pdev-screen' }, screenEl),
                    el('div', { className:'bkbg-pdev-phone-home' })
                );
            } else if (a.deviceType === 'tablet') {
                deviceEl = el('div', { className:'bkbg-pdev-device bkbg-pdev-device--tablet'+(a.showShadow?' bkbg-pdev-device--shadow':'') },
                    el('div', { className:'bkbg-pdev-tablet-cam' }),
                    el('div', { className:'bkbg-pdev-screen' }, screenEl),
                    el('div', { className:'bkbg-pdev-tablet-home' })
                );
            } else {
                deviceEl = el('div', { className:'bkbg-pdev-device bkbg-pdev-device--laptop'+(a.showShadow?' bkbg-pdev-device--shadow':'') },
                    el('div', { className:'bkbg-pdev-laptop-lid' }, el('div', { className:'bkbg-pdev-laptop-cam' }), el('div', { className:'bkbg-pdev-screen' }, screenEl)),
                    el('div', { className:'bkbg-pdev-laptop-base' }, el('div', { className:'bkbg-pdev-laptop-keyboard' }), el('div', { className:'bkbg-pdev-laptop-trackpad' }))
                );
            }

            return el('div', blockProps,
                el('div', { className:'bkbg-pdev-inner', style:{maxWidth:a.maxWidth+'px',margin:'0 auto',display:'flex',justifyContent:alignJustify} },
                    deviceEl
                )
            );
        }
    });
}() );
