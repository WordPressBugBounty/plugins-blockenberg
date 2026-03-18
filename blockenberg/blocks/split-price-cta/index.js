/* ====================================================
   Split Price CTA — editor (index.js)
   Block: blockenberg/split-price-cta
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
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
    var Button             = wp.components.Button;
    var GradientPicker     = wp.components.__experimentalGradientPicker;
    var __                 = wp.i18n.__;

    function uid() { return Math.random().toString(36).slice(2,9); }

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    function getLeftBg(a) {
        return a.leftStyle === 'gradient' ? a.leftGradient : a.leftBg;
    }

    function wrapStyle(a) {
        var s = {
            '--bkbg-spc-pt':          a.paddingTop  + 'px',
            '--bkbg-spc-pb':          a.paddingBottom + 'px',
            '--bkbg-spc-r':           a.blockRadius + 'px',
            '--bkbg-spc-btn-r':       a.btnRadius + 'px',
            '--bkbg-spc-chk-c':       a.checkColor,
            '--bkbg-spc-price-lbl-c': a.priceLabelColor,
            '--bkbg-spc-price-val-c': a.priceValueColor,
            '--bkbg-spc-price-note-c':a.priceNoteColor,
            '--bkbg-spc-feat-c':      a.featureColor,
            '--bkbg-spc-right-bg':    a.rightBg,
            '--bkbg-spc-ttl-c':       a.ctaHeadingColor,
            '--bkbg-spc-sub-c':       a.ctaSubtitleColor,
            '--bkbg-spc-primary-bg':  a.primaryBg,
            '--bkbg-spc-primary-c':   a.primaryColor,
            '--bkbg-spc-proof-c':     a.proofColor,
            '--bkbg-spc-bd':          a.borderColor,
            '--bkbg-spc-price-sz':    a.priceSize + 'px',
            '--bkbg-spc-pv-w':        a.priceFontWeight,
            '--bkbg-spc-ttl-sz':      a.ctaHeadingSize + 'px',
            '--bkbg-spc-hd-w':        a.ctaHeadingFontWeight,
        };
        var fn = getTypoCssVars();
        if (fn) {
            Object.assign(s, fn(a.priceTypo, '--bkspc-pv'));
            Object.assign(s, fn(a.headingTypo, '--bkspc-hd'));
            Object.assign(s, fn(a.subtitleTypo, '--bkspc-st'));
            Object.assign(s, fn(a.badgeTypo, '--bkspc-bd'));
            Object.assign(s, fn(a.featureTypo, '--bkspc-ft'));
            Object.assign(s, fn(a.btnTypo, '--bkspc-bt'));
        }
        return s;
    }

    registerBlockType('blockenberg/split-price-cta', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;

            function updateFeature(idx, text) {
                var arr = a.features.map(function(f,i){ return i===idx ? Object.assign({},f,{text:text}) : f; });
                setAttr({ features: arr });
            }
            function deleteFeature(idx) { setAttr({ features: a.features.filter(function(_,i){ return i!==idx; }) }); }
            function addFeature() { setAttr({ features: a.features.concat([{id:uid(), text:'New feature'}]) }); }
            function moveFeature(from, to) {
                var arr = a.features.slice(); arr.splice(to, 0, arr.splice(from, 1)[0]); setAttr({ features: arr });
            }

            var blockProps = useBlockProps({ className:'bkbg-spc-outer', style:wrapStyle(a) });

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Price (left panel)','blockenberg'), initialOpen:true },
                    el(TextControl, { label:__('Price label','blockenberg'),  value:a.priceLabel,  onChange:function(v){ setAttr({priceLabel:v}); } }),
                    el(TextControl, { label:__('Price value','blockenberg'),  value:a.priceValue,  onChange:function(v){ setAttr({priceValue:v}); } }),
                    el(TextControl, { label:__('Price period','blockenberg'), value:a.pricePeriod, onChange:function(v){ setAttr({pricePeriod:v}); } }),
                    el(TextControl, { label:__('Price note','blockenberg'),   value:a.priceNote,   onChange:function(v){ setAttr({priceNote:v}); } }),
                    el(ToggleControl, { label:__('Show old/crossed price','blockenberg'), checked:a.showOldPrice, onChange:function(v){ setAttr({showOldPrice:v}); } }),
                    a.showOldPrice ? el(TextControl, { label:__('Old price','blockenberg'), value:a.oldPrice, onChange:function(v){ setAttr({oldPrice:v}); } }) : null,
                    el(ToggleControl, { label:__('Show offer badge','blockenberg'), checked:a.showBadge, onChange:function(v){ setAttr({showBadge:v}); } }),
                    a.showBadge ? el(TextControl, { label:__('Badge text','blockenberg'), value:a.badge, onChange:function(v){ setAttr({badge:v}); } }) : null,
                    el('p', { style:{ fontWeight:600, fontSize:11, margin:'10px 0 4px' } }, __('Included features','blockenberg')),
                    a.features.map(function(f, i) {
                        return el('div', { key:f.id, style:{ display:'flex', gap:4, marginBottom:4, alignItems:'center' } },
                            el(TextControl, { value:f.text, onChange:function(v){ updateFeature(i,v); }, placeholder:'Feature…' }),
                            el(Button, { isSmall:true, variant:'tertiary', disabled:i===0, onClick:function(){ moveFeature(i,i-1); } }, '↑'),
                            el(Button, { isSmall:true, isDestructive:true, onClick:function(){ deleteFeature(i); } }, '✕')
                        );
                    }),
                    el(Button, { isSmall:true, variant:'tertiary', onClick:addFeature, style:{marginTop:4} }, __('+ Feature','blockenberg'))
                ),
                el(PanelBody, { title:__('CTA (right panel)','blockenberg'), initialOpen:false },
                    el(TextControl, { label:__('Heading','blockenberg'),        value:a.ctaHeading,    onChange:function(v){ setAttr({ctaHeading:v}); } }),
                    el(TextControl, { label:__('Subtitle','blockenberg'),       value:a.ctaSubtitle,   onChange:function(v){ setAttr({ctaSubtitle:v}); } }),
                    el(TextControl, { label:__('Primary button','blockenberg'), value:a.primaryLabel,  onChange:function(v){ setAttr({primaryLabel:v}); } }),
                    el(TextControl, { label:__('Primary URL','blockenberg'),    value:a.primaryUrl,    onChange:function(v){ setAttr({primaryUrl:v}); } }),
                    el(ToggleControl, { label:__('Show secondary link','blockenberg'), checked:a.showSecondary, onChange:function(v){ setAttr({showSecondary:v}); } }),
                    a.showSecondary ? el(TextControl, { label:__('Secondary label','blockenberg'), value:a.secondaryLabel, onChange:function(v){ setAttr({secondaryLabel:v}); } }) : null,
                    a.showSecondary ? el(TextControl, { label:__('Secondary URL','blockenberg'),   value:a.secondaryUrl,   onChange:function(v){ setAttr({secondaryUrl:v}); } }) : null,
                    el(ToggleControl, { label:__('Show social proof quote','blockenberg'), checked:a.showSocialProof, onChange:function(v){ setAttr({showSocialProof:v}); } }),
                    a.showSocialProof ? el(TextControl, { label:__('Quote text','blockenberg'),   value:a.socialProofText,   onChange:function(v){ setAttr({socialProofText:v}); } }) : null,
                    a.showSocialProof ? el(TextControl, { label:__('Quote author','blockenberg'), value:a.socialProofAuthor, onChange:function(v){ setAttr({socialProofAuthor:v}); } }) : null
                ),
                el(PanelBody, { title:__('Style','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Left panel style','blockenberg'), value:a.leftStyle, options:[{label:'Gradient',value:'gradient'},{label:'Solid color',value:'solid'}], onChange:function(v){ setAttr({leftStyle:v}); } }),
                    a.leftStyle === 'gradient' ? el('div', { style:{ marginBottom:'12px' } },
                        el('p', { style:{ fontSize:'11px', fontWeight:600, margin:'0 0 6px', textTransform:'uppercase', color:'#757575' } }, __('Gradient','blockenberg')),
                        el(GradientPicker, { value: a.leftGradient, onChange:function(v){ setAttr({leftGradient:v}); } })
                    ) : null,
                    el(RangeControl, { label:__('Block radius (px)','blockenberg'), value:a.blockRadius, min:0, max:32, onChange:function(v){ setAttr({blockRadius:v}); } }),
                    el(RangeControl, { label:__('Button radius (px)','blockenberg'), value:a.btnRadius, min:0, max:50, onChange:function(v){ setAttr({btnRadius:v}); } }),
                    ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() ? el(getTypoControl(), { label:__('Price','blockenberg'), value:a.priceTypo, onChange:function(v){ setAttr({priceTypo:v}); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label:__('CTA heading','blockenberg'), value:a.headingTypo, onChange:function(v){ setAttr({headingTypo:v}); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label:__('CTA subtitle','blockenberg'), value:a.subtitleTypo, onChange:function(v){ setAttr({subtitleTypo:v}); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label:__('Badge','blockenberg'), value:a.badgeTypo, onChange:function(v){ setAttr({badgeTypo:v}); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label:__('Feature','blockenberg'), value:a.featureTypo, onChange:function(v){ setAttr({featureTypo:v}); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label:__('Primary button','blockenberg'), value:a.btnTypo, onChange:function(v){ setAttr({btnTypo:v}); } }) : null
                ),
el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Check icon','blockenberg'),        value:a.checkColor,      onChange:function(v){ setAttr({checkColor:v||''}); }},
                    {label:__('Price label','blockenberg'),       value:a.priceLabelColor, onChange:function(v){ setAttr({priceLabelColor:v||''}); }},
                    {label:__('Price value','blockenberg'),       value:a.priceValueColor, onChange:function(v){ setAttr({priceValueColor:v||''}); }},
                    {label:__('Price note','blockenberg'),        value:a.priceNoteColor,  onChange:function(v){ setAttr({priceNoteColor:v||''}); }},
                    {label:__('Feature text','blockenberg'),      value:a.featureColor,    onChange:function(v){ setAttr({featureColor:v||''}); }},
                    {label:__('Right panel bg','blockenberg'),    value:a.rightBg,         onChange:function(v){ setAttr({rightBg:v||''}); }},
                    {label:__('CTA heading','blockenberg'),       value:a.ctaHeadingColor, onChange:function(v){ setAttr({ctaHeadingColor:v||''}); }},
                    {label:__('CTA subtitle','blockenberg'),      value:a.ctaSubtitleColor,onChange:function(v){ setAttr({ctaSubtitleColor:v||''}); }},
                    {label:__('Primary button bg','blockenberg'), value:a.primaryBg,       onChange:function(v){ setAttr({primaryBg:v||''}); }},
                    {label:__('Primary button text','blockenberg'),value:a.primaryColor,   onChange:function(v){ setAttr({primaryColor:v||''}); }},
                    {label:__('Quote text','blockenberg'),        value:a.proofColor,      onChange:function(v){ setAttr({proofColor:v||''}); }},
                    {label:__('Block border','blockenberg'),      value:a.borderColor,     onChange:function(v){ setAttr({borderColor:v||''}); }},
                ] })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { className:'bkbg-spc-wrap' },
                        /* Left — price panel */
                        el('div', { className:'bkbg-spc-left', style:{ background: getLeftBg(a) } },
                            a.showBadge ? el('span', { className:'bkbg-spc-badge' }, a.badge) : null,
                            el('div', { className:'bkbg-spc-price-label' }, a.priceLabel),
                            el('div', { className:'bkbg-spc-price-row' },
                                a.showOldPrice ? el('span', { className:'bkbg-spc-old-price' }, a.oldPrice) : null,
                                el('span', { className:'bkbg-spc-price' }, a.priceValue),
                                el('span', { className:'bkbg-spc-period' }, ' / ' + a.pricePeriod)
                            ),
                            el('div', { className:'bkbg-spc-price-note' }, a.priceNote),
                            el('ul', { className:'bkbg-spc-features' },
                                a.features.map(function(f) {
                                    return el('li', { key:f.id },
                                        el('span', { className:'bkbg-spc-check' }, '✓'),
                                        f.text
                                    );
                                })
                            )
                        ),
                        /* Right — CTA panel */
                        el('div', { className:'bkbg-spc-right' },
                            el(RichText, { tagName:'h3', className:'bkbg-spc-heading', value:a.ctaHeading, onChange:function(v){ setAttr({ctaHeading:v}); }, placeholder:__('CTA heading…','blockenberg') }),
                            el(RichText, { tagName:'p', className:'bkbg-spc-subtitle', value:a.ctaSubtitle, onChange:function(v){ setAttr({ctaSubtitle:v}); }, placeholder:__('Subtitle…','blockenberg') }),
                            el('div', { className:'bkbg-spc-actions' },
                                el('a', { href:'#', className:'bkbg-spc-btn-primary', onClick:function(e){ e.preventDefault(); } }, a.primaryLabel),
                                a.showSecondary ? el('a', { href:'#', className:'bkbg-spc-btn-secondary', onClick:function(e){ e.preventDefault(); } }, a.secondaryLabel) : null
                            ),
                            a.showSocialProof ? el('div', { className:'bkbg-spc-proof' },
                                el('p', { className:'bkbg-spc-proof-text' }, a.socialProofText),
                                el('p', { className:'bkbg-spc-proof-author' }, a.socialProofAuthor)
                            ) : null
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className:'bkbg-spc-outer', style:wrapStyle(a) });
            return el('div', blockProps,
                el('div', { className:'bkbg-spc-wrap' },
                    el('div', { className:'bkbg-spc-left', style:{ background: getLeftBg(a) } },
                        a.showBadge ? el('span', { className:'bkbg-spc-badge' }, a.badge) : null,
                        el('div', { className:'bkbg-spc-price-label' }, a.priceLabel),
                        el('div', { className:'bkbg-spc-price-row' },
                            a.showOldPrice ? el('span', { className:'bkbg-spc-old-price' }, a.oldPrice) : null,
                            el('span', { className:'bkbg-spc-price' }, a.priceValue),
                            el('span', { className:'bkbg-spc-period' }, ' / ' + a.pricePeriod)
                        ),
                        el('div', { className:'bkbg-spc-price-note' }, a.priceNote),
                        el('ul', { className:'bkbg-spc-features' },
                            a.features.map(function(f) {
                                return el('li', { key:f.id }, el('span', { className:'bkbg-spc-check' }, '✓'), f.text);
                            })
                        )
                    ),
                    el('div', { className:'bkbg-spc-right' },
                        el(RichText.Content, { tagName:'h3', className:'bkbg-spc-heading', value:a.ctaHeading }),
                        el(RichText.Content, { tagName:'p',  className:'bkbg-spc-subtitle', value:a.ctaSubtitle }),
                        el('div', { className:'bkbg-spc-actions' },
                            el('a', { href:a.primaryUrl, className:'bkbg-spc-btn-primary', target:a.primaryTarget, rel:a.primaryTarget==='_blank'?'noopener noreferrer':undefined }, a.primaryLabel),
                            a.showSecondary ? el('a', { href:a.secondaryUrl, className:'bkbg-spc-btn-secondary', target:a.secondaryTarget, rel:a.secondaryTarget==='_blank'?'noopener noreferrer':undefined }, a.secondaryLabel) : null
                        ),
                        a.showSocialProof ? el('div', { className:'bkbg-spc-proof' },
                            el('p', { className:'bkbg-spc-proof-text' }, a.socialProofText),
                            el('p', { className:'bkbg-spc-proof-author' }, a.socialProofAuthor)
                        ) : null
                    )
                )
            );
        }
    });
}() );
