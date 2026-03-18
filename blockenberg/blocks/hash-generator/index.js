( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var RichText           = wp.blockEditor.RichText;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;
    var SelectControl      = wp.components.SelectControl;

    var ALGOS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];

    /* ── Typography lazy getters ──────────────────────────────── */
    var _ttTC, _ttTV, _stTC, _stTV;
    function _tc() { return _ttTC || (_ttTC = window.bkbgTypographyControl); }
    function _tv() { return _ttTV || (_ttTV = window.bkbgTypoCssVars); }

    // ── Editor preview ───────────────────────────────────────────────────
    function EditorPreview(props) {
        var a = props.attributes;

        var wrapStyle = {
            background:   a.sectionBg,
            borderRadius: '14px',
            padding:      '32px 24px',
            maxWidth:     a.contentMaxWidth + 'px',
            margin:       '0 auto',
            fontFamily:   'inherit',
            boxSizing:    'border-box'
        };

        var enabledAlgos = [];
        if (a.showMD5)    enabledAlgos.push('MD5');
        if (a.showSHA1)   enabledAlgos.push('SHA-1');
        if (a.showSHA256) enabledAlgos.push('SHA-256');
        if (a.showSHA512) enabledAlgos.push('SHA-512');

        var inputStyle = {
            width:        '100%',
            boxSizing:    'border-box',
            border:       '1.5px solid #e5e7eb',
            borderRadius: '10px',
            padding:      '12px 14px',
            fontSize:     '14px',
            background:   a.inputBg,
            color:        a.labelColor,
            resize:       'vertical',
            minHeight:    '90px',
            fontFamily:   'inherit'
        };

        var hashRowStyle = {
            background:   a.hashBg,
            borderRadius: '8px',
            padding:      '10px 14px',
            marginBottom: '10px',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'space-between',
            gap:          '10px'
        };

        var algoLabelStyle = {
            color:        '#818cf8',
            fontSize:     '11px',
            fontWeight:   '700',
            letterSpacing:'0.07em',
            whiteSpace:   'nowrap',
            minWidth:     '60px'
        };

        var hashValueStyle = {
            color:        a.hashColor,
            fontSize:     '12px',
            fontFamily:   'monospace',
            wordBreak:    'break-all',
            flex:         1,
            opacity:      0.7
        };

        var placeholderHash = '— enter text to generate hash —';

        return el('div', { style: wrapStyle },
            el(RichText, {
                tagName:     'h3',
                className:   'bkbg-hg-title',
                value:       a.title,
                onChange:    function(v){ props.setAttributes({ title: v }); },
                style:       { color: a.titleColor, margin: '0 0 6px 0' },
                placeholder: 'Block title...'
            }),
            el(RichText, {
                tagName:     'p',
                className:   'bkbg-hg-subtitle',
                value:       a.subtitle,
                onChange:    function(v){ props.setAttributes({ subtitle: v }); },
                style:       { color: a.subtitleColor, margin: '0 0 20px 0' },
                placeholder: 'Subtitle...'
            }),

            // Text input preview
            el('div', { style: { marginBottom: '16px' } },
                el('label', { style: { display:'block', fontSize:'13px', fontWeight:'600', color: a.labelColor, marginBottom:'6px' } }, 'Input text'),
                el('textarea', { style: inputStyle, readOnly: true, value: a.defaultInput || '', placeholder: 'Type or paste text here…' })
            ),

            // Algo selector preview
            el('div', { style: { display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px' } },
                enabledAlgos.map(function(algo) {
                    var active = algo === a.defaultAlgorithm;
                    return el('button', {
                        key:   algo,
                        style: {
                            padding:      '7px 16px',
                            borderRadius: '8px',
                            border:       '2px solid ' + (active ? a.accentColor : '#e5e7eb'),
                            background:   active ? a.accentColor : a.cardBg,
                            color:        active ? '#fff' : a.labelColor,
                            fontWeight:   active ? '700' : '500',
                            fontSize:     '13px',
                            cursor:       'pointer'
                        }
                    }, algo);
                })
            ),

            // Hash output rows preview
            el('div', { style: { marginBottom: '16px' } },
                enabledAlgos.map(function(algo) {
                    return el('div', { key: algo, style: hashRowStyle },
                        el('span', { style: algoLabelStyle }, algo),
                        el('span', { style: hashValueStyle }, placeholderHash),
                        el('button', { style: { background:'none', border:'none', color:'#6366f1', cursor:'pointer', fontSize:'18px', padding:'0 2px' } }, '⧉')
                    );
                })
            ),

            // Compare section
            a.showCompare && el('div', { style: { background: a.cardBg, borderRadius:'10px', padding:'14px 16px', border:'1.5px solid #e5e7eb' } },
                el('div', { style: { fontSize:'12px', fontWeight:'700', color: a.labelColor, marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.06em' } }, 'Verify / Compare Hash'),
                el('input', { type:'text', readOnly:true, placeholder:'Paste expected hash to compare…', style: { width:'100%', boxSizing:'border-box', border:'1.5px solid #e5e7eb', borderRadius:'8px', padding:'9px 12px', background: a.inputBg, color: a.labelColor, fontSize:'13px', fontFamily:'monospace' } })
            )
        );
    }

    // ── Register ─────────────────────────────────────────────────────────
    registerBlockType('blockenberg/hash-generator', {
        edit: function(props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var enabledAlgos = [];
            if (a.showMD5)    enabledAlgos.push('MD5');
            if (a.showSHA1)   enabledAlgos.push('SHA-1');
            if (a.showSHA256) enabledAlgos.push('SHA-256');
            if (a.showSHA512) enabledAlgos.push('SHA-512');

            var colorSettings = [
                { value: a.accentColor,   onChange: function(v){ set({ accentColor:   v||'#6366f1' }); }, label: 'Accent color'       },
                { value: a.sectionBg,     onChange: function(v){ set({ sectionBg:     v||'#f5f3ff' }); }, label: 'Section background' },
                { value: a.cardBg,        onChange: function(v){ set({ cardBg:        v||'#ffffff' }); }, label: 'Card background'    },
                { value: a.inputBg,       onChange: function(v){ set({ inputBg:       v||'#f9fafb' }); }, label: 'Input background'   },
                { value: a.hashBg,        onChange: function(v){ set({ hashBg:        v||'#1e1b4b' }); }, label: 'Hash row background' },
                { value: a.hashColor,     onChange: function(v){ set({ hashColor:     v||'#a5b4fc' }); }, label: 'Hash text color'    },
                { value: a.titleColor,    onChange: function(v){ set({ titleColor:    v||'#111827' }); }, label: 'Title color'        },
                { value: a.subtitleColor, onChange: function(v){ set({ subtitleColor: v||'#6b7280' }); }, label: 'Subtitle color'     },
                { value: a.labelColor,    onChange: function(v){ set({ labelColor:    v||'#374151' }); }, label: 'Label color'        }
            ];

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Generator Settings', initialOpen: true },
                        el(SelectControl, {
                            label:    'Default Algorithm',
                            value:    a.defaultAlgorithm,
                            options:  enabledAlgos.map(function(g){ return { label: g, value: g }; }),
                            onChange: function(v){ set({ defaultAlgorithm: v }); }
                        }),
                        el(TextControl, {
                            label:    'Placeholder Input Text',
                            value:    a.defaultInput,
                            onChange: function(v){ set({ defaultInput: v }); }
                        }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Auto-hash on type', checked:a.autoHash,    onChange:function(v){ set({ autoHash:    v }); } })
                    ),
                    el(PanelBody, { title: 'Visible Algorithms', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show MD5',     checked:a.showMD5,    onChange:function(v){ set({ showMD5:    v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show SHA-1',   checked:a.showSHA1,   onChange:function(v){ set({ showSHA1:   v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show SHA-256', checked:a.showSHA256, onChange:function(v){ set({ showSHA256: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show SHA-512', checked:a.showSHA512, onChange:function(v){ set({ showSHA512: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show Compare / Verify field', checked:a.showCompare, onChange:function(v){ set({ showCompare: v }); } })
                    ),
                    el(PanelBody, { title: 'Sizing', initialOpen: false },
                        el(RangeControl, { label:'Max Width (px)',  value:a.contentMaxWidth, min:400, max:1100, step:20, onChange:function(v){ set({ contentMaxWidth: v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && _tc()({ label: __('Title','blockenberg'), value: a.typoTitle, onChange: function(v){ set({ typoTitle: v }); } }),
                        _tc() && _tc()({ label: __('Subtitle','blockenberg'), value: a.typoSubtitle, onChange: function(v){ set({ typoSubtitle: v }); } })
                    ),
el(PanelColorSettings, { title:'Colors', initialOpen:false, disableCustomGradients:true, colorSettings: colorSettings })
                ),
                el('div', useBlockProps({ style: Object.assign({}, _tv() && _tv()(a.typoTitle, '--bkbg-hg-tt-'), _tv() && _tv()(a.typoSubtitle, '--bkbg-hg-st-')) }),
                    el(EditorPreview, { attributes: a, setAttributes: set })
                )
            );
        },

        save: function(props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className:   'bkbg-hg-app',
                    'data-opts': JSON.stringify({
                        title:            a.title,
                        subtitle:         a.subtitle,
                        defaultAlgorithm: a.defaultAlgorithm,
                        defaultInput:     a.defaultInput,
                        showMD5:          a.showMD5,
                        showSHA1:         a.showSHA1,
                        showSHA256:       a.showSHA256,
                        showSHA512:       a.showSHA512,
                        showCompare:      a.showCompare,
                        autoHash:         a.autoHash,
                        accentColor:      a.accentColor,
                        sectionBg:        a.sectionBg,
                        cardBg:           a.cardBg,
                        inputBg:          a.inputBg,
                        hashBg:           a.hashBg,
                        hashColor:        a.hashColor,
                        titleColor:       a.titleColor,
                        subtitleColor:    a.subtitleColor,
                        labelColor:       a.labelColor,
                        titleFontSize:    a.titleFontSize,
                        titleFontWeight:  a.titleFontWeight,
                        titleLineHeight:  a.titleLineHeight,
                        subtitleFontSize: a.subtitleFontSize,
                        subtitleFontWeight: a.subtitleFontWeight,
                        subtitleLineHeight: a.subtitleLineHeight,
                        contentMaxWidth:  a.contentMaxWidth,
                        typoTitle:        a.typoTitle,
                        typoSubtitle:     a.typoSubtitle
                    })
                })
            );
        }
    });
}() );
