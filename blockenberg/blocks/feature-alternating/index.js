/* ====================================================
   Feature Alternating — editor (index.js)
   Block: blockenberg/feature-alternating
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var RichText           = wp.blockEditor.RichText;
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
    var ColorPicker         = wp.components.ColorPicker;
    var Popover            = wp.components.Popover;
    var __                 = wp.i18n.__;

    var _faltTC, _faltTV;
    function _tc() { return _faltTC || (_faltTC = window.bkbgTypographyControl); }
    function _tv() { return _faltTV || (_faltTV = window.bkbgTypoCssVars); }

    function uid() { return Math.random().toString(36).slice(2,9); }

    function isReversed(idx, imageSide) {
        if (imageSide === 'always-right') return true;
        if (imageSide === 'always-left')  return false;
        return idx % 2 !== 0;
    }

    function wrapStyle(a) {
        return Object.assign({
            '--bkbg-falt-pt':    a.paddingTop   + 'px',
            '--bkbg-falt-pb':    a.paddingBottom + 'px',
            '--bkbg-falt-sec-bg':a.sectionBg,
            '--bkbg-falt-ttl-c': a.titleColor,
            '--bkbg-falt-desc-c':a.descColor,
            '--bkbg-falt-feat-c':a.featureLabelColor,
            '--bkbg-falt-ph-bg': a.imagePlaceholderBg,
            '--bkbg-falt-r':     a.imageRadius     + 'px',
            '--bkbg-falt-row-gap':a.rowGap         + 'px',
            '--bkbg-falt-col-gap':a.colGap         + 'px',
            '--bkbg-falt-icon-sz':a.featureIconSize + 'px',
        }, _tv()(a.typoEyebrow, '--bkbg-falt-eb-'), _tv()(a.typoTitle, '--bkbg-falt-tt-'), _tv()(a.typoDescription, '--bkbg-falt-ds-'), _tv()(a.typoFeatureLabel, '--bkbg-falt-fl-'));
    }

    /* ----- Inspector row for one alternating row ----- */
    function RowInspector(props) {
        var r     = props.row;
        var idx   = props.index;
        var total = props.total;
        var onUpdate = props.onUpdate;
        var onDelete = props.onDelete;
        var onMove   = props.onMove;
        var open = useState(idx === 0);
        var isOpen = open[0]; var setOpen = open[1];

        return el('div', { style:{ borderBottom:'1px solid #e2e8f0', marginBottom:4 } },
            el('div', { style:{ display:'flex', alignItems:'center', cursor:'pointer', padding:'6px 0' }, onClick:function(){ setOpen(!isOpen); } },
                el('span', { style:{ flex:1, fontWeight:600, fontSize:12 } }, '#'+(idx+1)+' '+(r.title||'Row')),
                el('span', null, isOpen ? '▲' : '▼')
            ),
            !isOpen ? null : el('div', { style:{ paddingBottom:8 } },
                /* Image upload */
                el('p', { style:{ fontWeight:600, fontSize:11, marginBottom:4 } }, __('Image','blockenberg')),
                el(MediaUploadCheck, null,
                    el(MediaUpload, {
                        onSelect: function(media){ onUpdate(idx,{imageUrl:media.url, imageId:media.id}); },
                        allowedTypes:['image'],
                        value: r.imageId,
                        render: function(p) {
                            return el('div', null,
                                el(Button, { variant:'secondary', isSmall:true, onClick:p.open }, r.imageUrl ? __('Change image','blockenberg') : __('Select image','blockenberg')),
                                r.imageUrl ? el(Button, { isDestructive:true, isSmall:true, style:{marginLeft:4}, onClick:function(){ onUpdate(idx,{imageUrl:'',imageId:0}); } }, __('Remove','blockenberg')) : null
                            );
                        }
                    })
                ),
                r.imageUrl ? el('img', { src:r.imageUrl, style:{ marginTop:6, maxWidth:'100%', borderRadius:4 } }) : null,
                el(TextControl, { label:__('Eyebrow text','blockenberg'), value:r.eyebrow,     onChange:function(v){ onUpdate(idx,{eyebrow:v}); } }),
                el(TextControl, { label:__('Title','blockenberg'),        value:r.title,       onChange:function(v){ onUpdate(idx,{title:v}); } }),
                el(TextControl, { label:__('Description','blockenberg'),  value:r.description, onChange:function(v){ onUpdate(idx,{description:v}); } }),
                el(BkbgColorSwatch, { label:__('Accent color','blockenberg'), value:r.accentColor, onChange:function(v){ onUpdate(idx,{accentColor:v}); } }),
                el('p', { style:{ fontWeight:600, fontSize:11, margin:'8px 0 4px' } }, __('Features','blockenberg')),
                r.features.map(function(f, fi) {
                    return el('div', { key:f.id, style:{ display:'flex', gap:4, marginBottom:4, alignItems:'center' } },
                        el(TextControl, { value:f.icon, style:{ width:44 }, onChange:function(v){ var feats=[].concat(r.features); feats[fi]=Object.assign({},f,{icon:v}); onUpdate(idx,{features:feats}); }, placeholder:'✓' }),
                        el(TextControl, { value:f.label, onChange:function(v){ var feats=[].concat(r.features); feats[fi]=Object.assign({},f,{label:v}); onUpdate(idx,{features:feats}); }, placeholder:'Feature…' }),
                        el(Button, { isSmall:true, isDestructive:true, onClick:function(){ var feats=r.features.filter(function(_,i){ return i!==fi; }); onUpdate(idx,{features:feats}); } }, '✕')
                    );
                }),
                el(Button, { isSmall:true, variant:'tertiary', onClick:function(){ onUpdate(idx,{ features:r.features.concat([{id:uid(),icon:'✓',label:''}]) }); } }, __('+ Feature','blockenberg')),
                el(TextControl, { label:__('CTA label','blockenberg'), value:r.ctaLabel, onChange:function(v){ onUpdate(idx,{ctaLabel:v}); } }),
                el(TextControl, { label:__('CTA URL','blockenberg'),   value:r.ctaUrl,   onChange:function(v){ onUpdate(idx,{ctaUrl:v}); } }),
                el(SelectControl, { label:__('CTA target','blockenberg'), value:r.ctaTarget, options:[{label:'Same tab',value:'_self'},{label:'New tab',value:'_blank'}], onChange:function(v){ onUpdate(idx,{ctaTarget:v}); } }),
                el(ToggleControl, { label:__('Show CTA','blockenberg'), checked:r.showCta, onChange:function(v){ onUpdate(idx,{showCta:v}); } }),
                el('div', { style:{ display:'flex', gap:4, marginTop:8 } },
                    el(Button, { isSmall:true, variant:'secondary', disabled:idx===0,       onClick:function(){ onMove(idx,idx-1); } }, '↑'),
                    el(Button, { isSmall:true, variant:'secondary', disabled:idx===total-1, onClick:function(){ onMove(idx,idx+1); } }, '↓'),
                    el(Button, { isSmall:true, isDestructive:true,                           onClick:function(){ onDelete(idx); }   }, __('Delete','blockenberg'))
                )
            )
        );
    }

    var BkbgColorSwatch = function (props) {
        var _st = useState(false); var isOpen = _st[0]; var setOpen = _st[1];
        return el(Fragment, {},
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: '#1e1e1e' } }, props.label),
                el('button', {
                    type: 'button',
                    onClick: function () { setOpen(!isOpen); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #ccc', background: props.value || '#ffffff', cursor: 'pointer', padding: 0 }
                })
            ),
            isOpen && el(Popover, { onClose: function () { setOpen(false); } },
                el('div', { style: { padding: '8px' } },
                    el(ColorPicker, { color: props.value, onChangeComplete: function (c) { props.onChange(c.hex); }, enableAlpha: true })
                )
            )
        );
    };

    registerBlockType('blockenberg/feature-alternating', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;

            function updateRow(idx, patch) {
                var arr = a.rows.map(function(r,i){ return i===idx ? Object.assign({},r,patch) : r; });
                setAttr({ rows: arr });
            }
            function deleteRow(idx) { setAttr({ rows: a.rows.filter(function(_,i){ return i!==idx; }) }); }
            function moveRow(from, to) {
                var arr = a.rows.slice();
                arr.splice(to, 0, arr.splice(from, 1)[0]);
                setAttr({ rows: arr });
            }
            function addRow() {
                setAttr({ rows: a.rows.concat([{
                    id:uid(), imageUrl:'', imageId:0,
                    eyebrow:'What you can do', title:'New Feature', description:'Describe this feature in detail.',
                    features:[{id:uid(),icon:'✓',label:'First benefit'},{id:uid(),icon:'✓',label:'Second benefit'}],
                    ctaLabel:'Learn more', ctaUrl:'#', ctaTarget:'_self', showCta:true, accentColor:'#6c3fb5'
                }]) });
            }

            var blockProps = useBlockProps({ className:'bkbg-falt-wrap', style:wrapStyle(a) });

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Rows','blockenberg'), initialOpen:true },
                    a.rows.map(function(r,i){ return el(RowInspector, { key:r.id, row:r, index:i, total:a.rows.length, onUpdate:updateRow, onDelete:deleteRow, onMove:moveRow }); }),
                    el(Button, { variant:'primary', onClick:addRow, style:{marginTop:8} }, __('+ Add row','blockenberg'))
                ),
                el(PanelBody, { title:__('Layout','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Image side','blockenberg'), value:a.imageSide, options:[{label:'Auto (alternating)',value:'auto'},{label:'Always left',value:'always-left'},{label:'Always right',value:'always-right'}], onChange:function(v){ setAttr({imageSide:v}); } }),
                    el(RangeControl, { label:__('Image radius (px)','blockenberg'), value:a.imageRadius, min:0, max:32, onChange:function(v){ setAttr({imageRadius:v}); } }),
                    el(ToggleControl, { label:__('Image shadow','blockenberg'), checked:a.imageShadow, onChange:function(v){ setAttr({imageShadow:v}); } }),
                    el(RangeControl, { label:__('Row gap (px)','blockenberg'),   value:a.rowGap, min:0, max:200, onChange:function(v){ setAttr({rowGap:v}); } }),
                    el(RangeControl, { label:__('Column gap (px)','blockenberg'),value:a.colGap, min:0, max:128, onChange:function(v){ setAttr({colGap:v}); } }),
                    el(ToggleControl, { label:__('Show eyebrow','blockenberg'),  checked:a.showEyebrow,  onChange:function(v){ setAttr({showEyebrow:v}); } }),
                    el(ToggleControl, { label:__('Show features','blockenberg'), checked:a.showFeatures, onChange:function(v){ setAttr({showFeatures:v}); } })
                ),
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    _tc() && el(_tc(), { label: __('Eyebrow', 'blockenberg'), value: a.typoEyebrow, onChange: function (v) { setAttr({ typoEyebrow: v }); } }),
                    _tc() && el(_tc(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttr({ typoTitle: v }); } }),
                    _tc() && el(_tc(), { label: __('Description', 'blockenberg'), value: a.typoDescription, onChange: function (v) { setAttr({ typoDescription: v }); } }),
                    _tc() && el(_tc(), { label: __('Feature Label', 'blockenberg'), value: a.typoFeatureLabel, onChange: function (v) { setAttr({ typoFeatureLabel: v }); } }),
                    el(RangeControl, { label:__('Feature icon size (px)','blockenberg'), value:a.featureIconSize,  min:14, max:32, onChange:function(v){ setAttr({featureIconSize:v}); } })
                ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:200, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:200, onChange:function(v){ setAttr({paddingBottom:v}); } })
                ),
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Section bg','blockenberg'),          value:a.sectionBg,          onChange:function(v){ setAttr({sectionBg:v||''}); }},
                    {label:__('Title','blockenberg'),               value:a.titleColor,         onChange:function(v){ setAttr({titleColor:v||''}); }},
                    {label:__('Description','blockenberg'),         value:a.descColor,          onChange:function(v){ setAttr({descColor:v||''}); }},
                    {label:__('Feature label','blockenberg'),       value:a.featureLabelColor,  onChange:function(v){ setAttr({featureLabelColor:v||''}); }},
                    {label:__('Image placeholder','blockenberg'),   value:a.imagePlaceholderBg, onChange:function(v){ setAttr({imagePlaceholderBg:v||''}); }},
                ] })
            );

            /* canvas rendering */
            function renderRow(r, idx) {
                var reversed = isReversed(idx, a.imageSide);
                var imgCol = el('div', { className:'bkbg-falt-col bkbg-falt-col--image' },
                    r.imageUrl
                        ? el('img', { src:r.imageUrl, alt:'', className:'bkbg-falt-img' + (a.imageShadow ? ' bkbg-falt-img--shadow' : '') })
                        : el('div', { className:'bkbg-falt-placeholder' }, el('span', null, '🖼'))
                );
                var textCol = el('div', { className:'bkbg-falt-col bkbg-falt-col--text', style:{'--bkbg-falt-accent': r.accentColor} },
                    a.showEyebrow && r.eyebrow ? el('span', { className:'bkbg-falt-eyebrow' }, r.eyebrow) : null,
                    el('div', { className:'bkbg-falt-title' }, r.title),
                    el('div', { className:'bkbg-falt-desc' }, r.description),
                    a.showFeatures && r.features.length ? el('ul', { className:'bkbg-falt-features' },
                        r.features.map(function(f){ return el('li', { key:f.id, className:'bkbg-falt-feature' },
                            el('span', { className:'bkbg-falt-feat-icon' }, f.icon),
                            el('span', { className:'bkbg-falt-feat-label' }, f.label)
                        ); })
                    ) : null,
                    r.showCta ? el('a', { href:'#', className:'bkbg-falt-cta', onClick:function(e){ e.preventDefault(); } }, r.ctaLabel, ' →') : null
                );
                return el('div', { key:r.id, className:'bkbg-falt-row' + (reversed ? ' bkbg-falt-row--reverse' : '') },
                    reversed ? [textCol, imgCol] : [imgCol, textCol]
                );
            }

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    a.rows.map(function(r, i){ return renderRow(r, i); })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className:'bkbg-falt-wrap', style:wrapStyle(a) });

            return el('div', blockProps,
                a.rows.map(function(r, idx) {
                    var reversed = isReversed(idx, a.imageSide);
                    var imgCol = el('div', { className:'bkbg-falt-col bkbg-falt-col--image' },
                        r.imageUrl
                            ? el('img', { src:r.imageUrl, alt:'', className:'bkbg-falt-img' + (a.imageShadow ? ' bkbg-falt-img--shadow' : '') })
                            : el('div', { className:'bkbg-falt-placeholder' }, el('span', null, '🖼'))
                    );
                    var textCol = el('div', { className:'bkbg-falt-col bkbg-falt-col--text', style:{'--bkbg-falt-accent':r.accentColor} },
                        a.showEyebrow && r.eyebrow ? el('span', { className:'bkbg-falt-eyebrow' }, r.eyebrow) : null,
                        el(RichText.Content, { tagName:'h3', className:'bkbg-falt-title', value:r.title }),
                        el(RichText.Content, { tagName:'p',  className:'bkbg-falt-desc',  value:r.description }),
                        a.showFeatures && r.features.length ? el('ul', { className:'bkbg-falt-features' },
                            r.features.map(function(f){ return el('li', { key:f.id, className:'bkbg-falt-feature' },
                                el('span', { className:'bkbg-falt-feat-icon' }, f.icon),
                                el('span', { className:'bkbg-falt-feat-label' }, f.label)
                            ); })
                        ) : null,
                        r.showCta ? el('a', { href:r.ctaUrl, className:'bkbg-falt-cta', target:r.ctaTarget, rel:r.ctaTarget==='_blank'?'noopener noreferrer':undefined }, r.ctaLabel, ' →') : null
                    );
                    return el('div', { key:r.id, className:'bkbg-falt-row' + (reversed ? ' bkbg-falt-row--reverse' : '') },
                        reversed ? [textCol, imgCol] : [imgCol, textCol]
                    );
                })
            );
        }
    });
}() );
