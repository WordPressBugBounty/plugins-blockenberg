( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    function makeId() { return 'cs' + Math.random().toString(36).substr(2,8); }

    var DEFAULT_METRICS = [
        { id: makeId(), value: '94%',  prefix: '',  suffix: '%', label: 'Reporting time reduced', description: 'From weekly to daily reports', color: '#6c3fb5' },
        { id: makeId(), value: '3.2×', prefix: '',  suffix: '×', label: 'Productivity increase',  description: 'Across all departments',       color: '#059669' },
        { id: makeId(), value: '$1.4M',prefix: '$', suffix: 'M', label: 'Annual savings',          description: 'In operational overhead',      color: '#0ea5e9' },
    ];

    /* ── Build wrapper CSS ──────────────────────────────────────────── */
    function buildWrapStyle(a) {
        return Object.assign({
            '--bkbg-cs-accent':       a.accentColor,
            '--bkbg-cs-title':        a.titleColor,
            '--bkbg-cs-subtitle':     a.subtitleColor,
            '--bkbg-cs-label':        a.labelColor,
            '--bkbg-cs-body':         a.bodyColor,
            '--bkbg-cs-sec-lbl-bg':   a.sectionLabelBg,
            '--bkbg-cs-sec-lbl-col':  a.sectionLabelColor,
            '--bkbg-cs-card-bg':      a.cardBg,
            '--bkbg-cs-card-border':  a.cardBorder,
            '--bkbg-cs-metric-bg':    a.metricBg,
            '--bkbg-cs-quote-bg':     a.quoteBg,
            '--bkbg-cs-quote-border': a.quoteBorder,
            '--bkbg-cs-quote-color':  a.quoteColor,
            '--bkbg-cs-cta-bg':       a.ctaBg,
            '--bkbg-cs-cta-color':    a.ctaColor,
            '--bkbg-cs-radius':       a.cardRadius + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        },
        _tv(a.typoTitle,    '--bkbg-cs-tt-'),
        _tv(a.typoSubtitle, '--bkbg-cs-ts-'),
        _tv(a.typoBody,     '--bkbg-cs-bd-'),
        _tv(a.typoQuote,    '--bkbg-cs-qt-'),
        _tv(a.typoCta,      '--bkbg-cs-ct-')
        );
    }

    /* ── Colour swatch helper ───────────────────────────────────────── */
    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 0', gap:'8px' } },
            el('span', { style: { fontSize:'12px', color:'#1e1e1e', flex:1, lineHeight:1.4 } }, label),
            el('div', { style: { position:'relative', flexShrink:0 } },
                el('button', { type:'button', onClick: function(){ setOpenKey(isOpen ? null : key); }, style: { width:'28px', height:'28px', borderRadius:'4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor:'pointer', padding:0, background: value||'#ccc' } }),
                isOpen && el(Popover, { position:'bottom left', onClose: function(){ setOpenKey(null); } },
                    el('div', { style:{ padding:'8px' } },
                        el(ColorPicker, { color:value, enableAlpha:true, onChange:onChange })
                    )
                )
            )
        );
    }

    /* ── Section label pill ──────────────────────────────────────────── */
    function SectionLabel(props) {
        return el('span', { style: {
            display:'inline-block', padding:'3px 12px', borderRadius:'999px',
            background: props.bg || '#ede9fe', color: props.color || '#5b21b6',
            fontSize:'11px', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:'10px',
        } }, props.children);
    }

    /* ── Metric row ──────────────────────────────────────────────────── */
    function MetricCard(props) {
        var m = props.metric;
        var a = props.a;
        return el('div', { style: { background: a.metricBg||'#f5f3ff', borderRadius: a.cardRadius+'px', padding:'20px 18px', flex:'1 1 150px', minWidth:'130px', borderTop:'3px solid '+(m.color||a.accentColor||'#6c3fb5') } },
            el('div', { style: { fontSize: a.metricValueSize+'px', fontWeight:900, color: m.color||a.accentColor||'#6c3fb5', lineHeight:1.1, marginBottom:'6px' } }, m.value),
            el('div', { style: { fontSize: a.metricLabelSize+'px', fontWeight:700, color: a.labelColor||'#374151', marginBottom:'4px' } }, m.label),
            m.description && el('div', { style: { fontSize:'12px', color: a.bodyColor||'#6b7280' } }, m.description)
        );
    }

    /* ── Metric Inspector row ─────────────────────────────────────────── */
    function MetricEditor(props) {
        var m = props.metric;
        var onChange = props.onChange;
        var onRemove = props.onRemove;
        var openKey = props.openKey;
        var setOpenKey = props.setOpenKey;

        function upd(key, val) { var c=Object.assign({},m); c[key]=val; onChange(c); }

        return el('div', { style:{ background:'#f9f9f9', border:'1px solid #e0e0e0', borderRadius:'8px', padding:'10px 12px', marginBottom:'10px' } },
            el(TextControl, { label:__('Display value (e.g. 94%)','blockenberg'), value:m.value, onChange:function(v){upd('value',v);} }),
            el(TextControl, { label:__('Label','blockenberg'), value:m.label, onChange:function(v){upd('label',v);} }),
            el(TextControl, { label:__('Description','blockenberg'), value:m.description||'', onChange:function(v){upd('description',v);} }),
            el('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'4px' } },
                renderColorControl('mc-'+m.id, __('Accent colour','blockenberg'), m.color, function(v){upd('color',v);}, openKey, setOpenKey),
                el(Button, { variant:'tertiary', size:'compact', isDestructive:true, onClick:onRemove, style:{marginLeft:'8px'} }, '✕')
            )
        );
    }

    /* ── Register ────────────────────────────────────────────────────── */
    registerBlockType('blockenberg/case-study', {
        title: __('Case Study','blockenberg'),
        icon: 'analytics',
        category: 'bkbg-business',

        edit: function(props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorState = useState(null);
            var openColorKey = openColorState[0];
            var setOpenColorKey = openColorState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, value, attrKey){
                return renderColorControl(key, label, value, function(v){ var u={}; u[attrKey]=v; setAttributes(u); }, openColorKey, setOpenColorKey);
            }

            function updateMetric(id, upd) { setAttributes({ metrics: a.metrics.map(function(m){ return m.id===id ? upd : m; }) }); }
            function removeMetric(id)   { setAttributes({ metrics: a.metrics.filter(function(m){ return m.id!==id; }) }); }
            function addMetric()        { setAttributes({ metrics: a.metrics.concat([{ id:makeId(), value:'0', prefix:'', suffix:'', label:__('New metric','blockenberg'), description:'', color:'' }]) }); }

            var twoCol = a.layout === 'two-col';

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title:__('Client Info','blockenberg'), initialOpen:true },
                        el(TextControl, { label:__('Client name','blockenberg'), value:a.clientName, onChange:function(v){setAttributes({clientName:v});} }),
                        el(TextControl, { label:__('Industry / Category','blockenberg'), value:a.clientIndustry, onChange:function(v){setAttributes({clientIndustry:v});} }),
                        el(TextControl, { label:__('Website URL','blockenberg'), value:a.clientUrl||'', onChange:function(v){setAttributes({clientUrl:v});} }),
                        el(TextControl, { label:__('Tagline','blockenberg'), value:a.clientTagline||'', onChange:function(v){setAttributes({clientTagline:v});} }),
                        el('p', { style:{margin:'4px 0 8px',fontSize:'12px',color:'#555'} }, __('Client logo:','blockenberg')),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, { onSelect:function(m){setAttributes({clientLogoUrl:m.url,clientLogoId:m.id});}, allowedTypes:['image'], value:a.clientLogoId,
                                render:function(mp){
                                    return el(Fragment, null,
                                        a.clientLogoUrl && el('img', { src:a.clientLogoUrl, style:{maxHeight:'48px', objectFit:'contain', display:'block', marginBottom:'6px' } }),
                                        el(Button, { variant:'secondary', size:'compact', onClick:mp.open }, a.clientLogoUrl ? __('Change logo','blockenberg') : __('Upload logo','blockenberg')),
                                        a.clientLogoUrl && el(Button, { variant:'tertiary', size:'compact', isDestructive:true, onClick:function(){setAttributes({clientLogoUrl:'',clientLogoId:0});}, style:{marginLeft:'6px'} }, __('Remove','blockenberg'))
                                    );
                                }
                            })
                        )
                    ),
                    el(PanelBody, { title:__('Header','blockenberg'), initialOpen:false },
                        el(ToggleControl, { label:__('Show title','blockenberg'), checked:a.showTitle, onChange:function(v){setAttributes({showTitle:v});}, __nextHasNoMarginBottom:true }),
                        a.showTitle && el(TextControl, { label:__('Title','blockenberg'), value:a.title, onChange:function(v){setAttributes({title:v});} }),
                        el(ToggleControl, { label:__('Show subtitle','blockenberg'), checked:a.showSubtitle, onChange:function(v){setAttributes({showSubtitle:v});}, __nextHasNoMarginBottom:true }),
                        a.showSubtitle && el(TextControl, { label:__('Subtitle','blockenberg'), value:a.subtitle||'', onChange:function(v){setAttributes({subtitle:v});} })
                    ),
                    el(PanelBody, { title:__('Challenge & Solution labels','blockenberg'), initialOpen:false },
                        el(TextControl, { label:__('Challenge label','blockenberg'), value:a.challengeLabel||__('The Challenge','blockenberg'), onChange:function(v){setAttributes({challengeLabel:v});} }),
                        el(TextControl, { label:__('Solution label','blockenberg'), value:a.solutionLabel||__('The Solution','blockenberg'), onChange:function(v){setAttributes({solutionLabel:v});} })
                    ),
                    el(PanelBody, { title:__('Metrics','blockenberg'), initialOpen:false },
                        (a.metrics||[]).map(function(m){
                            return el(MetricEditor, { key:m.id, metric:m, onChange:function(upd){updateMetric(m.id,upd);}, onRemove:function(){removeMetric(m.id);}, openKey:openColorKey, setOpenKey:setOpenColorKey });
                        }),
                        el(Button, { variant:'primary', onClick:addMetric }, '+ ' + __('Add metric','blockenberg'))
                    ),
                    el(PanelBody, { title:__('Quote','blockenberg'), initialOpen:false },
                        el(ToggleControl, { label:__('Show quote','blockenberg'), checked:a.showQuote, onChange:function(v){setAttributes({showQuote:v});}, __nextHasNoMarginBottom:true }),
                        el(TextareaControl, { label:__('Quote text','blockenberg'), value:a.quote||'', onChange:function(v){setAttributes({quote:v});} }),
                        el(TextControl, { label:__('Author name','blockenberg'), value:a.quoteAuthor||'', onChange:function(v){setAttributes({quoteAuthor:v});} }),
                        el(TextControl, { label:__('Author role','blockenberg'), value:a.quoteAuthorRole||'', onChange:function(v){setAttributes({quoteAuthorRole:v});} }),
                        el('p', { style:{margin:'4px 0 8px',fontSize:'12px',color:'#555'} }, __('Avatar:','blockenberg')),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, { onSelect:function(m){setAttributes({quoteAvatarUrl:m.url,quoteAvatarId:m.id});}, allowedTypes:['image'], value:a.quoteAvatarId,
                                render:function(mp){
                                    return el(Fragment, null,
                                        a.quoteAvatarUrl && el('img', { src:a.quoteAvatarUrl, style:{width:'48px',height:'48px',objectFit:'cover',borderRadius:'50%',display:'block',marginBottom:'6px'} }),
                                        el(Button, { variant:'secondary', size:'compact', onClick:mp.open }, a.quoteAvatarUrl ? __('Change avatar','blockenberg') : __('Upload avatar','blockenberg')),
                                        a.quoteAvatarUrl && el(Button, { variant:'tertiary', size:'compact', isDestructive:true, onClick:function(){setAttributes({quoteAvatarUrl:'',quoteAvatarId:0});}, style:{marginLeft:'6px'} }, __('Remove','blockenberg'))
                                    );
                                }
                            })
                        )
                    ),
                    el(PanelBody, { title:__('Call to Action','blockenberg'), initialOpen:false },
                        el(ToggleControl, { label:__('Show CTA button','blockenberg'), checked:a.showCta, onChange:function(v){setAttributes({showCta:v});}, __nextHasNoMarginBottom:true }),
                        el(TextControl, { label:__('Button label','blockenberg'), value:a.ctaLabel||'', onChange:function(v){setAttributes({ctaLabel:v});} }),
                        el(TextControl, { label:__('Button URL','blockenberg'), value:a.ctaUrl||'', onChange:function(v){setAttributes({ctaUrl:v});} }),
                        el(ToggleControl, { label:__('Open in new tab','blockenberg'), checked:a.ctaNewTab, onChange:function(v){setAttributes({ctaNewTab:v});}, __nextHasNoMarginBottom:true })
                    ),
                    el(PanelBody, { title:__('Layout','blockenberg'), initialOpen:false },
                        el(SelectControl, { label:__('Layout','blockenberg'), value:a.layout, options:[{ label:__('Two columns (challenge / solution)','blockenberg'), value:'two-col' },{ label:__('Stacked','blockenberg'), value:'stack' }], onChange:function(v){setAttributes({layout:v});} })
                    ),
                    el(PanelBody, { title:__('Colours','blockenberg'), initialOpen:false },
                        cc('accentColor', __('Accent','blockenberg'), a.accentColor, 'accentColor'),
                        cc('titleColor', __('Title','blockenberg'), a.titleColor, 'titleColor'),
                        cc('subtitleColor', __('Subtitle','blockenberg'), a.subtitleColor, 'subtitleColor'),
                        cc('labelColor', __('Label / metric label','blockenberg'), a.labelColor, 'labelColor'),
                        cc('bodyColor', __('Body text','blockenberg'), a.bodyColor, 'bodyColor'),
                        cc('sectionLabelBg', __('Section label background','blockenberg'), a.sectionLabelBg, 'sectionLabelBg'),
                        cc('sectionLabelColor', __('Section label text','blockenberg'), a.sectionLabelColor, 'sectionLabelColor'),
                        cc('cardBg', __('Card background','blockenberg'), a.cardBg, 'cardBg'),
                        cc('metricBg', __('Metric card background','blockenberg'), a.metricBg, 'metricBg'),
                        cc('quoteBg', __('Quote background','blockenberg'), a.quoteBg, 'quoteBg'),
                        cc('quoteBorder', __('Quote border','blockenberg'), a.quoteBorder, 'quoteBorder'),
                        cc('quoteColor', __('Quote text','blockenberg'), a.quoteColor, 'quoteColor'),
                        cc('ctaBg', __('CTA background','blockenberg'), a.ctaBg, 'ctaBg'),
                        cc('ctaColor', __('CTA text','blockenberg'), a.ctaColor, 'ctaColor'),
                        cc('bgColor', __('Section background','blockenberg'), a.bgColor, 'bgColor')
                    ),
                    el(PanelBody, { title:__('Appearance','blockenberg'), initialOpen:false },
                        el(RangeControl, { label:__('Card radius (px)','blockenberg'), value:a.cardRadius, min:0, max:40, onChange:function(v){setAttributes({cardRadius:v});} }),
                        el(RangeControl, { label:__('CTA radius (px)','blockenberg'), value:a.ctaRadius, min:0, max:40, onChange:function(v){setAttributes({ctaRadius:v});} })
                    ),
                    el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                        el(RangeControl, { label:__('Padding top (px)','blockenberg'), value:a.paddingTop, min:0, max:200, onChange:function(v){setAttributes({paddingTop:v});} }),
                        el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:200, onChange:function(v){setAttributes({paddingBottom:v});} })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('Subtitle', 'blockenberg'), value: a.typoSubtitle, onChange: function (v) { setAttributes({ typoSubtitle: v }); } }),
                        el(getTypographyControl(), { label: __('Body Text', 'blockenberg'), value: a.typoBody, onChange: function (v) { setAttributes({ typoBody: v }); } }),
                        el(getTypographyControl(), { label: __('Quote Text', 'blockenberg'), value: a.typoQuote, onChange: function (v) { setAttributes({ typoQuote: v }); } }),
                        el(getTypographyControl(), { label: __('CTA Button', 'blockenberg'), value: a.typoCta, onChange: function (v) { setAttributes({ typoCta: v }); } }),
                        el(RangeControl, { label:__('Metric value size (px)','blockenberg'), value:a.metricValueSize, min:24, max:72, onChange:function(v){setAttributes({metricValueSize:v});} }),
                        el(RangeControl, { label:__('Metric label size (px)','blockenberg'), value:a.metricLabelSize, min:10, max:20, onChange:function(v){setAttributes({metricLabelSize:v});} })
                    )
                ),

                el('div', blockProps,
                    /* Header */
                    (a.showTitle || a.showSubtitle) && el('div', { style:{ textAlign:'center', marginBottom:'32px' } },
                        a.showTitle && el('h2', { className: 'bkbg-cs-title', style:{ margin:'0 0 8px' } }, a.title),
                        a.showSubtitle && el('p', { className: 'bkbg-cs-subtitle', style:{ margin:0 } }, a.subtitle)
                    ),

                    /* Client info */
                    el('div', { style:{ display:'flex', alignItems:'center', gap:'18px', background: a.cardBg||'#fff', borderRadius: a.cardRadius+'px', padding:'20px 24px', marginBottom:'28px', boxShadow:'0 1px 8px rgba(0,0,0,0.06)' } },
                        a.clientLogoUrl && el('img', { src:a.clientLogoUrl, style:{ maxHeight:'60px', objectFit:'contain', flexShrink:0 } }),
                        el('div', null,
                            el('div', { style:{ fontWeight:800, fontSize:'20px', color: a.titleColor||'#1e1b4b' } }, a.clientName),
                            el('div', { style:{ fontSize:'13px', color: a.accentColor||'#6c3fb5', fontWeight:600 } }, a.clientIndustry),
                            a.clientTagline && el('div', { style:{ fontSize:'13px', color: a.bodyColor||'#6b7280', marginTop:'2px' } }, a.clientTagline)
                        )
                    ),

                    /* Challenge / Solution */
                    el('div', { style:{ display:'grid', gridTemplateColumns: twoCol ? '1fr 1fr' : '1fr', gap:'24px', marginBottom:'28px' } },
                        el('div', { style:{ background: a.cardBg||'#faf9ff', borderRadius: a.cardRadius+'px', padding:'24px' } },
                            el(SectionLabel, { bg: a.sectionLabelBg, color: a.sectionLabelColor }, a.challengeLabel || __('The Challenge','blockenberg')),
                            el(RichText, { tagName:'div', className:'bkbg-cs-rt', value:a.challenge, onChange:function(v){setAttributes({challenge:v});}, placeholder:__('Describe the problem this client faced…','blockenberg') })
                        ),
                        el('div', { style:{ background: a.cardBg||'#faf9ff', borderRadius: a.cardRadius+'px', padding:'24px' } },
                            el(SectionLabel, { bg: a.sectionLabelBg, color: a.sectionLabelColor }, a.solutionLabel || __('The Solution','blockenberg')),
                            el(RichText, { tagName:'div', className:'bkbg-cs-rt', value:a.solution, onChange:function(v){setAttributes({solution:v});}, placeholder:__('Describe how you solved it…','blockenberg') })
                        )
                    ),

                    /* Metrics */
                    (a.metrics||[]).length > 0 && el('div', { style:{ display:'flex', flexWrap:'wrap', gap:'16px', marginBottom:'28px' } },
                        (a.metrics||[]).map(function(m){ return el(MetricCard, { key:m.id, metric:m, a:a }); })
                    ),

                    /* Quote */
                    a.showQuote && a.quote && el('blockquote', { style:{ margin:'0 0 28px', padding:'24px 28px', background: a.quoteBg||'#f5f3ff', borderLeft:'4px solid '+(a.quoteBorder||'#6c3fb5'), borderRadius: a.cardRadius+'px', color: a.quoteColor||'#1e1b4b' } },
                        el('p', { style:{ fontSize:'18px', fontStyle:'italic', lineHeight:1.6, margin:'0 0 14px' } }, '\u201C' + a.quote + '\u201D'),
                        el('div', { style:{ display:'flex', alignItems:'center', gap:'12px' } },
                            a.quoteAvatarUrl && el('img', { src:a.quoteAvatarUrl, style:{ width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover' } }),
                            el('div', null,
                                el('div', { style:{ fontWeight:700, fontSize:'14px' } }, a.quoteAuthor),
                                el('div', { style:{ fontSize:'12px', opacity:0.7 } }, a.quoteAuthorRole)
                            )
                        )
                    ),

                    /* CTA */
                    a.showCta && a.ctaLabel && el('div', { style:{ textAlign:'center' } },
                        el('a', { href: a.ctaUrl||'#', style:{ display:'inline-block', padding:'14px 32px', background: a.ctaBg||'#6c3fb5', color: a.ctaColor||'#fff', borderRadius: a.ctaRadius+'px', fontWeight:700, fontSize:'16px', textDecoration:'none' } }, a.ctaLabel)
                    )
                )
            );
        },

        save: function(props) {
            var a = props.attributes;
            var twoCol = a.layout === 'two-col';
            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-cs-wrapper bkbg-cs-layout-' + a.layout,
                style: buildWrapStyle(a),
            }),
                (a.showTitle || a.showSubtitle) && el('div', { className:'bkbg-cs-header' },
                    a.showTitle  && el('h2',  { className:'bkbg-cs-title'    }, a.title),
                    a.showSubtitle && el('p', { className:'bkbg-cs-subtitle' }, a.subtitle)
                ),
                el('div', { className:'bkbg-cs-client-bar' },
                    a.clientLogoUrl && el('img', { className:'bkbg-cs-logo', src:a.clientLogoUrl, alt:a.clientName, loading:'lazy' }),
                    el('div', { className:'bkbg-cs-client-info' },
                        el('div', { className:'bkbg-cs-client-name'     }, a.clientName),
                        el('div', { className:'bkbg-cs-client-industry' }, a.clientIndustry),
                        a.clientTagline && el('div', { className:'bkbg-cs-client-tagline' }, a.clientTagline)
                    )
                ),
                el('div', { className: 'bkbg-cs-content-grid' + (twoCol ? ' bkbg-cs-two-col' : '') },
                    el('div', { className:'bkbg-cs-card bkbg-cs-challenge' },
                        el('span', { className:'bkbg-cs-section-label' }, a.challengeLabel || 'The Challenge'),
                        el(RichText.Content, { tagName:'div', className:'bkbg-cs-rt', value:a.challenge })
                    ),
                    el('div', { className:'bkbg-cs-card bkbg-cs-solution' },
                        el('span', { className:'bkbg-cs-section-label' }, a.solutionLabel || 'The Solution'),
                        el(RichText.Content, { tagName:'div', className:'bkbg-cs-rt', value:a.solution })
                    )
                ),
                (a.metrics||[]).length > 0 && el('div', { className:'bkbg-cs-metrics' },
                    (a.metrics||[]).map(function(m){
                        return el('div', { key:m.id, className:'bkbg-cs-metric', style:{ borderTopColor: m.color||a.accentColor||'' } },
                            el('div', { className:'bkbg-cs-metric-value' }, m.value),
                            el('div', { className:'bkbg-cs-metric-label' }, m.label),
                            m.description && el('div', { className:'bkbg-cs-metric-desc' }, m.description)
                        );
                    })
                ),
                a.showQuote && a.quote && el('blockquote', { className:'bkbg-cs-quote' },
                    el('p', { className:'bkbg-cs-quote-text' }, '\u201C' + a.quote + '\u201D'),
                    el('div', { className:'bkbg-cs-quote-author' },
                        a.quoteAvatarUrl && el('img', { className:'bkbg-cs-avatar', src:a.quoteAvatarUrl, alt:a.quoteAuthor, loading:'lazy' }),
                        el('div', null,
                            el('div', { className:'bkbg-cs-author-name' }, a.quoteAuthor),
                            el('div', { className:'bkbg-cs-author-role' }, a.quoteAuthorRole)
                        )
                    )
                ),
                a.showCta && a.ctaLabel && el('div', { className:'bkbg-cs-cta-row' },
                    el('a', { className:'bkbg-cs-cta', href:a.ctaUrl||'#', target: a.ctaNewTab ? '_blank' : undefined, rel: a.ctaNewTab ? 'noopener noreferrer' : undefined }, a.ctaLabel)
                )
            );
        }
    });
}() );
