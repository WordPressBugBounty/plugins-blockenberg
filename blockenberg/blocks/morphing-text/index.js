( function () {
    var el = React.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var MORPH_MODES = [
        { value: 'blur',      label: 'Blur — letters blur in/out' },
        { value: 'crossfade', label: 'Crossfade — smooth opacity' },
        { value: 'slide-up',  label: 'Slide Up' },
        { value: 'slide-down',label: 'Slide Down' },
        { value: 'typewriter',label: 'Typewriter — char by char' }
    ];

    var TAGS = ['h1','h2','h3','h4','h5','h6','p','div'].map(function(t){ return { value: t, label: t.toUpperCase() }; });

    function MorphPreview(props) {
        var attr = props.attr;
        var words = attr.words && attr.words.length ? attr.words : ['build websites'];
        var _state = React.useState(0);
        var idx = _state[0]; var setIdx = _state[1];

        React.useEffect(function () {
            var t = setInterval(function () {
                setIdx(function (i) { return (i + 1) % words.length; });
            }, (attr.duration || 2500));
            return function () { clearInterval(t); };
        }, [words.length, attr.duration]);

        var grad = attr.useGradient
            ? 'linear-gradient(90deg,' + (attr.morphColor || '#7c3aed') + ',' + (attr.morphColor2 || '#ec4899') + ')'
            : null;

        var morphStyle = {
            display: 'inline',
            color: !attr.useGradient ? (attr.morphColor || '#7c3aed') : 'transparent',
            background: grad || 'none',
            backgroundClip: grad ? 'text' : undefined,
            WebkitBackgroundClip: grad ? 'text' : undefined,
            WebkitTextFillColor: grad ? 'transparent' : undefined,
            transition: 'all 0.4s ease',
            marginLeft: '0.3em'
        };

        return el('div', {
            className: 'bkbg-mt-wrap',
            style: {
                padding: (attr.paddingV || 32) + 'px ' + (attr.paddingH || 24) + 'px',
                backgroundColor: attr.showBg ? (attr.bgColor || '#fff') : 'transparent',
                borderRadius: (attr.borderRadius || 0) + 'px',
                textAlign: attr.textAlign || 'center'
            }
        },
            el(attr.tag || 'h2', {
                className: 'bkbg-mt-heading',
                style: {
                    margin: 0, padding: 0,
                    color: attr.staticColor || '#1e293b'
                }
            },
                attr.staticBefore && el('span', null, attr.staticBefore),
                el('span', { style: morphStyle }, words[idx]),
                attr.staticAfter && el('span', null, ' ' + attr.staticAfter),
                attr.cursor && el('span', { style: { borderRight: '3px solid currentColor', marginLeft: '2px', animation: 'bkbg-mt-blink 1s step-end infinite' } })
            )
        );
    }

    registerBlockType('blockenberg/morphing-text', {
        title: 'Morphing Text',
        icon: 'editor-textcolor',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            function updateWord(i, val) {
                var words = attr.words.slice();
                words[i] = val;
                setAttr({ words: words });
            }
            function addWord() { setAttr({ words: attr.words.concat(['new word']) }); }
            function removeWord(i) {
                var words = attr.words.slice();
                words.splice(i, 1);
                setAttr({ words: words });
            }

            return el(React.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Words', initialOpen: true },
                        el('p', { style: { fontSize: 12, color: '#6b7280', margin: '0 0 8px' } }, 'The morphing text cycles through these words:'),
                        attr.words.map(function (w, i) {
                            return el('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6 } },
                                el(TextControl, { __nextHasNoMarginBottom: true, value: w, onChange: function (v) { updateWord(i, v); } }),
                                el(Button, { variant: 'tertiary', isSmall: true, isDestructive: true, onClick: function () { removeWord(i); }, disabled: attr.words.length <= 1 }, '✕')
                            );
                        }),
                        el(Button, { variant: 'secondary', isSmall: true, onClick: addWord, style: { marginTop: 4 } }, '+ Add Word')
                    ),
                    el(PanelBody, { title: 'Static Text', initialOpen: false },
                        el(TextControl, { __nextHasNoMarginBottom: true, label: 'Text Before', value: attr.staticBefore, onChange: function (v) { setAttr({ staticBefore: v }); } }),
                        el(TextControl, { __nextHasNoMarginBottom: true, label: 'Text After', value: attr.staticAfter, onChange: function (v) { setAttr({ staticAfter: v }); } })
                    ),
                    el(PanelBody, { title: 'Animation', initialOpen: true },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Morph Mode', value: attr.morphMode, options: MORPH_MODES, onChange: function (v) { setAttr({ morphMode: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Word Duration (ms)', value: attr.duration, min: 500, max: 8000, step: 100, onChange: function (v) { setAttr({ duration: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Pause Between (ms)', value: attr.pauseDuration, min: 0, max: 5000, step: 100, onChange: function (v) { setAttr({ pauseDuration: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Loop', checked: attr.loop, onChange: function (v) { setAttr({ loop: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Blinking Cursor', checked: attr.cursor, onChange: function (v) { setAttr({ cursor: v }); } })
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'HTML Tag', value: attr.tag, options: TAGS, onChange: function (v) { setAttr({ tag: v }); } }),
                        el(getTypoControl(), {
                            label: __('Heading', 'blockenberg'),
                            value: attr.headingTypo,
                            onChange: function (v) { setAttr({ headingTypo: v }); }
                        }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Text Align', value: attr.textAlign, options: [{value:'left',label:'Left'},{value:'center',label:'Center'},{value:'right',label:'Right'}], onChange: function (v) { setAttr({ textAlign: v }); } })
                    ),
                    el(PanelBody, { title: 'Background', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Background', checked: attr.showBg, onChange: function (v) { setAttr({ showBg: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Padding Vertical (px)', value: attr.paddingV, min: 0, max: 120, onChange: function (v) { setAttr({ paddingV: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Padding Horizontal (px)', value: attr.paddingH, min: 0, max: 120, onChange: function (v) { setAttr({ paddingH: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Border Radius (px)', value: attr.borderRadius, min: 0, max: 60, onChange: function (v) { setAttr({ borderRadius: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { value: attr.staticColor, onChange: function (v) { setAttr({ staticColor: v || '#1e293b' }); }, label: 'Static Text Color' },
                            { value: attr.morphColor,  onChange: function (v) { setAttr({ morphColor:  v || '#7c3aed' }); }, label: 'Morph Color 1' },
                            { value: attr.morphColor2, onChange: function (v) { setAttr({ morphColor2: v || '#ec4899' }); }, label: 'Morph Color 2 (gradient)' },
                            attr.showBg && { value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#fff' }); }, label: 'Background' }
                        ].filter(Boolean)
                    }),
                    el(PanelBody, { title: 'Morph Color Style', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Use Gradient on Morphing Word', checked: attr.useGradient, onChange: function (v) { setAttr({ useGradient: v }); } })
                    )
                ),

                el('div', useBlockProps((function () {
                    var _tvf = getTypoCssVars();
                    var s = {};
                    Object.assign(s, _tvf(attr.headingTypo, '--bkbg-mrt-hd-'));
                    return { style: s };
                })()),
                    el(MorphPreview, { attr: attr })
                )
            );
        },

        deprecated: [{
            save: function (props) {
                return el('div', useBlockProps.save(),
                    el('div', { className: 'bkbg-mt-app', 'data-opts': JSON.stringify(props.attributes) })
                );
            }
        }],

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.headingTypo, '--bkbg-mrt-hd-'));
                return { style: s };
            })());
            return el('div', blockProps,
                el('div', { className: 'bkbg-mt-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
