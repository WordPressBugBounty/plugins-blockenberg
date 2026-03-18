/* ====================================================
   Section Intro — editor (index.js)
   Block: blockenberg/section-intro
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var RichText           = wp.blockEditor.RichText;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var ToggleControl      = wp.components.ToggleControl;
    var TextControl        = wp.components.TextControl;
    var __                 = wp.i18n.__;

    var _TC, _tv;
    function getTC() { return _TC || (_TC = window.bkbgTypographyControl); }
    function getTV() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function wrapStyle(a) {
        return {
            '--bkbg-si-pt':       a.paddingTop  + 'px',
            '--bkbg-si-pb':       a.paddingBottom + 'px',
            '--bkbg-si-gap':      a.gap + 'px',
            '--bkbg-si-mw':       a.maxWidth + 'px',
            '--bkbg-si-hl-c':     a.headingColor,
            '--bkbg-si-sub-c':    a.subtitleColor,
            '--bkbg-si-ey-bg':    a.eyebrowBg,
            '--bkbg-si-ey-c':     a.eyebrowColor,
            '--bkbg-si-div-c':    a.dividerColor,
            '--bkbg-si-cta-c':    a.ctaColor,
            '--bkbg-si-hl-sz':    a.headingSize + 'px',
            '--bkbg-si-sub-sz':   a.subtitleSize + 'px',
            '--bkbg-si-ey-sz':    a.eyebrowSize + 'px',
            '--bkbg-si-div-w':    a.dividerWidth + 'px',
            '--bkbg-si-hl-wt':    a.headingWeight,
        };
    }

    registerBlockType('blockenberg/section-intro', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;

            var blockProps = useBlockProps((function () {
                var _tvFn = getTV();
                var s = wrapStyle(a);
                Object.assign(s, _tvFn(a.headingTypo, '--bksi-ht-'));
                Object.assign(s, _tvFn(a.eyebrowTypo, '--bksi-et-'));
                Object.assign(s, _tvFn(a.subtitleTypo, '--bksi-st-'));
                return { className: 'bkbg-si-wrap bkbg-si-align--' + a.align, style: s };
            })());

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Content','blockenberg'), initialOpen:true },
                    el(ToggleControl, { label:__('Show eyebrow','blockenberg'),  checked:a.showEyebrow,  onChange:function(v){ setAttr({showEyebrow:v}); } }),
                    el(TextControl,   { label:__('Eyebrow text','blockenberg'),  value:a.eyebrow,        onChange:function(v){ setAttr({eyebrow:v}); } }),
                    el(SelectControl, { label:__('Eyebrow style','blockenberg'), value:a.eyebrowStyle, options:[{label:'Pill badge',value:'pill'},{label:'Line above',value:'line-above'},{label:'Plain text',value:'plain'},{label:'Dot separator',value:'dot'}], onChange:function(v){ setAttr({eyebrowStyle:v}); } }),
                    el(SelectControl, { label:__('Heading tag','blockenberg'), value:a.headingTag, options:[{label:'H1',value:'h1'},{label:'H2',value:'h2'},{label:'H3',value:'h3'},{label:'H4',value:'h4'}], onChange:function(v){ setAttr({headingTag:v}); } }),
                    el(ToggleControl, { label:__('Show subtitle','blockenberg'), checked:a.showSubtitle, onChange:function(v){ setAttr({showSubtitle:v}); } }),
                    el(ToggleControl, { label:__('Show divider','blockenberg'),  checked:a.showDivider,  onChange:function(v){ setAttr({showDivider:v}); } }),
                    a.showDivider ? el(RangeControl, { label:__('Divider width (px)','blockenberg'), value:a.dividerWidth, min:16, max:200, onChange:function(v){ setAttr({dividerWidth:v}); } }) : null,
                    el(ToggleControl, { label:__('Show CTA link','blockenberg'), checked:a.showCta, onChange:function(v){ setAttr({showCta:v}); } }),
                    a.showCta ? el(TextControl, { label:__('CTA label','blockenberg'), value:a.ctaLabel, onChange:function(v){ setAttr({ctaLabel:v}); } }) : null,
                    a.showCta ? el(TextControl, { label:__('CTA URL','blockenberg'),   value:a.ctaUrl,   onChange:function(v){ setAttr({ctaUrl:v}); } }) : null,
                    a.showCta ? el(SelectControl, { label:__('CTA style','blockenberg'), value:a.ctaStyle, options:[{label:'Link with arrow',value:'link-arrow'},{label:'Button filled',value:'button-filled'},{label:'Button outlined',value:'button-outlined'}], onChange:function(v){ setAttr({ctaStyle:v}); } }) : null
                ),
                el(PanelBody, { title:__('Layout','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Alignment','blockenberg'), value:a.align, options:[{label:'Center',value:'center'},{label:'Left',value:'left'},{label:'Right',value:'right'}], onChange:function(v){ setAttr({align:v}); } }),
                    el(RangeControl, { label:__('Max width (px)','blockenberg'),    value:a.maxWidth, min:300, max:1000, onChange:function(v){ setAttr({maxWidth:v}); } }),
                    el(RangeControl, { label:__('Inner gap (px)','blockenberg'),    value:a.gap, min:4, max:48, onChange:function(v){ setAttr({gap:v}); } })
                ),
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    el(getTC(), { label: __('Heading', 'blockenberg'), value: a.headingTypo, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                    el(getTC(), { label: __('Eyebrow', 'blockenberg'), value: a.eyebrowTypo, onChange: function (v) { setAttr({ eyebrowTypo: v }); } }),
                    el(getTC(), { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo, onChange: function (v) { setAttr({ subtitleTypo: v }); } })
                ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } })
                ),
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Heading','blockenberg'),      value:a.headingColor,  onChange:function(v){ setAttr({headingColor:v||''}); }},
                    {label:__('Subtitle','blockenberg'),     value:a.subtitleColor, onChange:function(v){ setAttr({subtitleColor:v||''}); }},
                    {label:__('Eyebrow bg','blockenberg'),   value:a.eyebrowBg,     onChange:function(v){ setAttr({eyebrowBg:v||''}); }},
                    {label:__('Eyebrow text','blockenberg'), value:a.eyebrowColor,  onChange:function(v){ setAttr({eyebrowColor:v||''}); }},
                    {label:__('Divider','blockenberg'),      value:a.dividerColor,  onChange:function(v){ setAttr({dividerColor:v||''}); }},
                    {label:__('CTA color','blockenberg'),    value:a.ctaColor,      onChange:function(v){ setAttr({ctaColor:v||''}); }},
                ] })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { className:'bkbg-si-inner' },
                        a.showEyebrow ? el('span', { className:'bkbg-si-eyebrow bkbg-si-ey--' + a.eyebrowStyle }, a.eyebrow) : null,
                        a.showDivider ? el('div', { className:'bkbg-si-divider' }) : null,
                        el(RichText, { tagName:a.headingTag, className:'bkbg-si-heading', value:a.heading, onChange:function(v){ setAttr({heading:v}); }, placeholder:__('Section heading…','blockenberg') }),
                        a.showSubtitle ? el(RichText, { tagName:'p', className:'bkbg-si-subtitle', value:a.subtitle, onChange:function(v){ setAttr({subtitle:v}); }, placeholder:__('Subtitle…','blockenberg') }) : null,
                        a.showCta ? el('span', { className:'bkbg-si-cta bkbg-si-cta--' + a.ctaStyle }, a.ctaLabel, a.ctaStyle === 'link-arrow' ? el('span', { className:'bkbg-si-arrow' }, ' →') : null) : null
                    )
                )
            );
        },

        deprecated: [{
            attributes: {"showEyebrow":{"type":"boolean","default":true},"eyebrow":{"type":"string","default":"Why choose us"},"eyebrowStyle":{"type":"string","default":"pill"},"heading":{"type":"string","default":"Everything you need to succeed"},"headingTag":{"type":"string","default":"h2"},"showSubtitle":{"type":"boolean","default":true},"subtitle":{"type":"string","default":"We\u2019ve built a platform that grows with you \u2014 from first launch to global scale."},"showCta":{"type":"boolean","default":false},"ctaLabel":{"type":"string","default":"Learn more"},"ctaUrl":{"type":"string","default":"#"},"ctaTarget":{"type":"string","default":"_self"},"ctaStyle":{"type":"string","default":"link-arrow"},"showDivider":{"type":"boolean","default":false},"dividerWidth":{"type":"number","default":48},"align":{"type":"string","default":"center"},"maxWidth":{"type":"number","default":680},"headingSize":{"type":"number","default":40},"headingWeight":{"type":"string","default":"800"},"subtitleSize":{"type":"number","default":18},"eyebrowSize":{"type":"number","default":12},"gap":{"type":"number","default":16},"paddingTop":{"type":"number","default":0},"paddingBottom":{"type":"number","default":0},"headingColor":{"type":"string","default":"#0f172a"},"subtitleColor":{"type":"string","default":"#475569"},"eyebrowBg":{"type":"string","default":"#f0ebff"},"eyebrowColor":{"type":"string","default":"#6c3fb5"},"dividerColor":{"type":"string","default":"#6c3fb5"},"ctaColor":{"type":"string","default":"#6c3fb5"}},
            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({
                    className: 'bkbg-si-wrap bkbg-si-align--' + a.align,
                    style: wrapStyle(a)
                });
                return el('div', blockProps,
                    el('div', { className:'bkbg-si-inner' },
                        a.showEyebrow ? el('span', { className:'bkbg-si-eyebrow bkbg-si-ey--' + a.eyebrowStyle }, a.eyebrow) : null,
                        a.showDivider ? el('div', { className:'bkbg-si-divider' }) : null,
                        el(RichText.Content, { tagName:a.headingTag, className:'bkbg-si-heading', value:a.heading }),
                        a.showSubtitle ? el(RichText.Content, { tagName:'p', className:'bkbg-si-subtitle', value:a.subtitle }) : null,
                        a.showCta ? el('a', { href:a.ctaUrl, className:'bkbg-si-cta bkbg-si-cta--' + a.ctaStyle, target:a.ctaTarget, rel:a.ctaTarget==='_blank'?'noopener noreferrer':undefined },
                            a.ctaLabel, a.ctaStyle === 'link-arrow' ? el('span', { className:'bkbg-si-arrow' }, ' →') : null
                        ) : null
                    )
                );
            }
        }],

        save: function (props) {
            var a = props.attributes;
            var _tvFn = window.bkbgTypoCssVars;
            var s = wrapStyle(a);
            if (_tvFn) {
                Object.assign(s, _tvFn(a.headingTypo || {}, '--bksi-ht-'));
                Object.assign(s, _tvFn(a.eyebrowTypo || {}, '--bksi-et-'));
                Object.assign(s, _tvFn(a.subtitleTypo || {}, '--bksi-st-'));
            }
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-si-wrap bkbg-si-align--' + a.align,
                style: s
            });
            return el('div', blockProps,
                el('div', { className:'bkbg-si-inner' },
                    a.showEyebrow ? el('span', { className:'bkbg-si-eyebrow bkbg-si-ey--' + a.eyebrowStyle }, a.eyebrow) : null,
                    a.showDivider ? el('div', { className:'bkbg-si-divider' }) : null,
                    el(RichText.Content, { tagName:a.headingTag, className:'bkbg-si-heading', value:a.heading }),
                    a.showSubtitle ? el(RichText.Content, { tagName:'p', className:'bkbg-si-subtitle', value:a.subtitle }) : null,
                    a.showCta ? el('a', { href:a.ctaUrl, className:'bkbg-si-cta bkbg-si-cta--' + a.ctaStyle, target:a.ctaTarget, rel:a.ctaTarget==='_blank'?'noopener noreferrer':undefined },
                        a.ctaLabel, a.ctaStyle === 'link-arrow' ? el('span', { className:'bkbg-si-arrow' }, ' →') : null
                    ) : null
                )
            );
        }
    });
}() );
