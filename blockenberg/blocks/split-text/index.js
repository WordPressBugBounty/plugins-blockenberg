( function () {
    var el                = wp.element.createElement;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var TextareaControl   = wp.components.TextareaControl;
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    function buildTypoVars(a) {
        var s = {
            '--bkst-tx-sz': a.fontSize + 'px',
            '--bkst-tx-w':  a.fontWeight,
            '--bkst-tx-lh': String(a.lineHeight),
            '--bkst-tx-tt': a.textTransform !== 'none' ? a.textTransform : '',
        };
        if (a.letterSpacing) s['--bkst-tx-ls'] = a.letterSpacing + 'px';
        var fn = getTypoCssVars();
        if (fn) Object.assign(s, fn(a.textTypo, '--bkst-tx'));
        return s;
    }

    var SPLIT_OPTIONS = [
        { label: __('Words',      'blockenberg'), value: 'words' },
        { label: __('Characters', 'blockenberg'), value: 'chars' },
        { label: __('Lines',      'blockenberg'), value: 'lines' },
    ];

    var ANIM_OPTIONS = [
        { label: __('Fade up',     'blockenberg'), value: 'fade-up'     },
        { label: __('Fade in',     'blockenberg'), value: 'fade-in'     },
        { label: __('Slide right', 'blockenberg'), value: 'slide-right' },
        { label: __('Zoom in',     'blockenberg'), value: 'zoom-in'     },
        { label: __('Blur in',     'blockenberg'), value: 'blur-in'     },
        { label: __('Drop down',   'blockenberg'), value: 'drop-down'   },
    ];

    var TAG_OPTIONS = [
        { label: 'h1', value: 'h1' },
        { label: 'h2', value: 'h2' },
        { label: 'h3', value: 'h3' },
        { label: 'h4', value: 'h4' },
        { label: 'p',  value: 'p'  },
        { label: 'div', value: 'div' },
    ];

    var WEIGHT_OPTIONS = [
        { label: '400 – Regular',    value: '400' },
        { label: '600 – Semi-bold',  value: '600' },
        { label: '700 – Bold',       value: '700' },
        { label: '800 – Extra-bold', value: '800' },
        { label: '900 – Black',      value: '900' },
    ];

    var TRANSFORM_OPTIONS = [
        { label: __('None',       'blockenberg'), value: 'none'       },
        { label: __('Uppercase',  'blockenberg'), value: 'uppercase'  },
        { label: __('Lowercase',  'blockenberg'), value: 'lowercase'  },
        { label: __('Capitalize', 'blockenberg'), value: 'capitalize' },
    ];

    function buildUnits(text, splitType) {
        var raw = text || '';
        if (splitType === 'chars') {
            return raw.split('').map(function (c) { return c === ' ' ? null : c; });
        }
        if (splitType === 'lines') {
            return raw.split('\n');
        }
        return raw.split(/\s+/).filter(function (w) { return w.length > 0; });
    }

    function isHighlighted(word, highlightWords) {
        if (!highlightWords) return false;
        var words = highlightWords.toLowerCase().split(',').map(function (w) { return w.trim(); });
        return words.indexOf(word.toLowerCase().replace(/[^a-z0-9]/g, '')) !== -1;
    }

    function renderEditorPreview(a) {
        var units   = buildUnits(a.text, a.splitType);
        var isChars = a.splitType === 'chars';
        var rawText = a.text || '';

        var containerStyle = {
            textAlign:      a.textAlign,
            color:          a.textColor,
            margin:         0,
            padding:        0,
            wordBreak:      'break-word',
        };

        if (a.splitType === 'lines') {
            return el(a.tag, {
                className: 'bkst-text',
                style:     containerStyle,
            }, units.map(function (line, i) {
                return el('span', {
                    key:       i,
                    className: 'bkst-line bkst-revealed',
                    style:     { display: 'block' }
                }, line);
            }));
        }

        // Words or chars — keep spaces between words
        var content = [];
        if (isChars) {
            rawText.split('').forEach(function (c, i) {
                if (c === ' ') {
                    content.push(el('span', { key: 'sp' + i, style: { display: 'inline-block', width: '0.3em' } }));
                } else {
                    content.push(el('span', {
                        key:       i,
                        className: 'bkst-char bkst-revealed',
                        style:     { display: 'inline-block' }
                    }, c));
                }
            });
        } else {
            units.forEach(function (word, i) {
                if (i > 0) content.push(el('span', { key: 'sp' + i, style: { display: 'inline-block', width: '0.3em' } }));
                var isHL = isHighlighted(word, a.highlightWords);
                content.push(el('span', {
                    key:       i,
                    className: 'bkst-word bkst-revealed',
                    style:     {
                        display: 'inline-block',
                        color:   isHL ? a.highlightColor : undefined,
                    }
                }, word));
            });
        }

        return el(a.tag, { className: 'bkst-text', style: containerStyle }, content);
    }

    function splitForSave(a) {
        var rawText = a.text || '';
        var splitType = a.splitType;
        var highlights = (a.highlightWords || '').toLowerCase().split(',').map(function (w) { return w.trim(); });

        if (splitType === 'lines') {
            var lines = rawText.split('\n');
            return lines.map(function (line, i) {
                return el('span', {
                    key:        i,
                    className:  'bkst-line',
                    style:      { '--bkst-i': i, display: 'block' },
                    'aria-hidden': 'false',
                }, line);
            });
        }

        var content = [];
        if (splitType === 'chars') {
            var idx = 0;
            rawText.split('').forEach(function (c, pos) {
                if (c === ' ') {
                    content.push(el('span', { key: 'sp' + pos, className: 'bkst-space', 'aria-hidden': 'true' }, '\u00a0'));
                } else {
                    content.push(el('span', {
                        key:       pos,
                        className: 'bkst-char',
                        style:     { '--bkst-i': idx },
                    }, c));
                    idx++;
                }
            });
        } else {
            var words = rawText.split(/\s+/).filter(function (w) { return w.length > 0; });
            words.forEach(function (word, i) {
                if (i > 0) content.push(el('span', { key: 'sp' + i, className: 'bkst-space', 'aria-hidden': 'true' }, '\u00a0'));
                var isHL = highlights.indexOf(word.toLowerCase().replace(/[^a-z0-9]/g, '')) !== -1;
                content.push(el('span', {
                    key:        i,
                    className:  'bkst-word' + (isHL ? ' bkst-highlight' : ''),
                    style:      { '--bkst-i': i },
                }, word));
            });
        }

        return content;
    }

    registerBlockType('blockenberg/split-text', {
        title: __('Split Text', 'blockenberg'),
        description: __('Scroll-triggered per-word text reveal animation.', 'blockenberg'),
        category: 'bkbg-effects',
        icon: 'editor-break',

        edit: function (props) {
            var attributes    = props.attributes;
            var setAttributes = props.setAttributes;

            var wrapStyle = Object.assign({
                background:    attributes.wrapBg || undefined,
                paddingTop:    attributes.paddingTop + 'px',
                paddingBottom: attributes.paddingBottom + 'px',
                textAlign:     attributes.textAlign,
            }, buildTypoVars(attributes));

            var blockProps = useBlockProps({ style: wrapStyle, className: 'bkst-section' });

            return el(Fragment, null,
                el(InspectorControls, null,
                    /* ── Text ─────────────────────────────────────── */
                    el(PanelBody, { title: __('Text', 'blockenberg'), initialOpen: true },
                        el(TextareaControl, {
                            label:    __('Text content', 'blockenberg'),
                            help:     __('For line splits use new lines (Enter).', 'blockenberg'),
                            value:    attributes.text,
                            rows:     4,
                            onChange: function (v) { setAttributes({ text: v }); },
                        }),
                        el(SelectControl, {
                            label:    __('HTML tag', 'blockenberg'),
                            value:    attributes.tag,
                            options:  TAG_OPTIONS,
                            onChange: function (v) { setAttributes({ tag: v }); },
                        }),
                        el(TextControl, {
                            label:    __('Highlight words (comma-separated)', 'blockenberg'),
                            help:     __('These words will appear in the highlight colour.', 'blockenberg'),
                            value:    attributes.highlightWords,
                            onChange: function (v) { setAttributes({ highlightWords: v }); },
                        })
                    ),
                    /* ── Animation ─────────────────────────────────── */
                    el(PanelBody, { title: __('Animation', 'blockenberg'), initialOpen: true },
                        el(SelectControl, {
                            label:    __('Split by', 'blockenberg'),
                            value:    attributes.splitType,
                            options:  SPLIT_OPTIONS,
                            onChange: function (v) { setAttributes({ splitType: v }); },
                        }),
                        el(SelectControl, {
                            label:    __('Animation style', 'blockenberg'),
                            value:    attributes.animation,
                            options:  ANIM_OPTIONS,
                            onChange: function (v) { setAttributes({ animation: v }); },
                        }),
                        el(RangeControl, {
                            label:    __('Stagger delay (ms per unit)', 'blockenberg'),
                            value:    attributes.stagger,
                            min: 10, max: 400,
                            onChange: function (v) { setAttributes({ stagger: v }); },
                        }),
                        el(RangeControl, {
                            label:    __('Animation duration (ms)', 'blockenberg'),
                            value:    attributes.duration,
                            min: 100, max: 2000, step: 50,
                            onChange: function (v) { setAttributes({ duration: v }); },
                        }),
                        el(RangeControl, {
                            label:    __('Trigger threshold (0–1)', 'blockenberg'),
                            value:    attributes.threshold,
                            min: 0, max: 1, step: 0.05,
                            onChange: function (v) { setAttributes({ threshold: v }); },
                        }),
                        el(ToggleControl, {
                            label:    __('Repeat when re-entering viewport', 'blockenberg'),
                            checked:  attributes.repeat,
                            onChange: function (v) { setAttributes({ repeat: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),
                    /* ── Typography ────────────────────────────────── */
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() ? el(getTypoControl(), { label:__('Text','blockenberg'), value:attributes.textTypo, onChange:function(v){ setAttributes({textTypo:v}); } }) : null,
                        el(SelectControl, {
                            label:    __('Text align', 'blockenberg'),
                            value:    attributes.textAlign,
                            options:  [
                                { label: __('Left',   'blockenberg'), value: 'left'   },
                                { label: __('Center', 'blockenberg'), value: 'center' },
                                { label: __('Right',  'blockenberg'), value: 'right'  },
                            ],
                            onChange: function (v) { setAttributes({ textAlign: v }); },
                        })
                    ),
                    /* ── Layout ─────────────────────────────────────── */
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label:    __('Padding top (px)', 'blockenberg'),
                            value:    attributes.paddingTop,
                            min: 0, max: 200,
                            onChange: function (v) { setAttributes({ paddingTop: v }); },
                        }),
                        el(RangeControl, {
                            label:    __('Padding bottom (px)', 'blockenberg'),
                            value:    attributes.paddingBottom,
                            min: 0, max: 200,
                            onChange: function (v) { setAttributes({ paddingBottom: v }); },
                        })
                    ),
                    /* ── Colors ──────────────────────────────────────── */
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: attributes.textColor,      onChange: function (v) { setAttributes({ textColor:      v || '#111827' }); }, label: __('Text color',        'blockenberg') },
                            { value: attributes.highlightColor, onChange: function (v) { setAttributes({ highlightColor: v || '#6c3fb5' }); }, label: __('Highlight color',   'blockenberg') },
                            { value: attributes.wrapBg,         onChange: function (v) { setAttributes({ wrapBg:         v || ''        }); }, label: __('Background',        'blockenberg') },
                        ],
                    })
                ),
                el('div', blockProps,
                    renderEditorPreview(attributes)
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            var wrapStyle = Object.assign({
                background:    a.wrapBg || undefined,
                paddingTop:    a.paddingTop + 'px',
                paddingBottom: a.paddingBottom + 'px',
            }, buildTypoVars(a));

            var textStyle = {
                textAlign:     a.textAlign,
                color:         a.textColor,
                '--bkst-dur':     a.duration + 'ms',
                '--bkst-stagger': a.stagger + 'ms',
                '--bkst-hl-c':    a.highlightColor,
            };

            return el('div', {
                className: 'bkst-section',
                style:     wrapStyle,
                'data-animation':  a.animation,
                'data-split':      a.splitType,
                'data-stagger':    a.stagger,
                'data-duration':   a.duration,
                'data-threshold':  a.threshold,
                'data-repeat':     a.repeat ? 'true' : 'false',
            },
                el(a.tag, {
                    className: 'bkst-text',
                    style:     textStyle,
                    'aria-label': a.text,
                },
                    splitForSave(a)
                )
            );
        },
    });
}() );
