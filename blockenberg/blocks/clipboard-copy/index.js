(function () {
    var el = window.wp.element.createElement;
    var __ = function (s) { return s; };
    var registerBlockType  = window.wp.blocks.registerBlockType;
    var InspectorControls  = window.wp.blockEditor.InspectorControls;
    var PanelBody          = window.wp.components.PanelBody;
    var ToggleControl      = window.wp.components.ToggleControl;
    var SelectControl      = window.wp.components.SelectControl;
    var RangeControl       = window.wp.components.RangeControl;
    var TextControl        = window.wp.components.TextControl;
    var TextareaControl    = window.wp.components.TextareaControl;
    var PanelColorSettings = window.wp.blockEditor.PanelColorSettings;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function _tv() { var fn = window.bkbgTypoCssVars; return fn ? fn.apply(null, arguments) : {}; }

    var copyIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';

    registerBlockType('blockenberg/clipboard-copy', {
        title: __('Clipboard Copy'),
        description: __('Display a copyable code or text with a one-click copy button.'),
        category: 'bkbg-dev',
        icon: el('svg', { viewBox: '0 0 24 24', fill: 'currentColor', width: 24, height: 24 },
            el('path', { d: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z' })
        ),

        edit: function (props) {
            var a    = props.attributes;
            var setA = props.setAttributes;

            var sizeMap = { sm: { fs: 12, h: 32, pad: '0 10px' }, md: { fs: 14, h: 40, pad: '0 14px' }, lg: { fs: 16, h: 48, pad: '0 18px' } };
            var sz = sizeMap[a.size] || sizeMap.md;

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Content'), initialOpen: true },
                    el(TextControl, {
                        label:    __('Text to Copy'),
                        value:    a.textToCopy,
                        onChange: function (v) { setA({ textToCopy: v }); },
                    }),
                    el(TextControl, {
                        label:    __('Button Label'),
                        value:    a.label,
                        onChange: function (v) { setA({ label: v }); },
                    }),
                    el(TextControl, {
                        label:    __('Copied State Label'),
                        value:    a.copiedLabel,
                        onChange: function (v) { setA({ copiedLabel: v }); },
                    }),
                    el(TextareaControl, {
                        label:    __('Description text (optional)'),
                        value:    a.description,
                        rows:     2,
                        onChange: function (v) { setA({ description: v }); },
                    }),
                    el(ToggleControl, {
                        label:    __('Show code display area'),
                        checked:  a.showCode,
                        onChange: function (v) { setA({ showCode: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    el(ToggleControl, {
                        label:    __('Show copy icon on button'),
                        checked:  a.iconEnabled,
                        onChange: function (v) { setA({ iconEnabled: v }); },
                        __nextHasNoMarginBottom: true,
                    })
                ),
                el(PanelBody, { title: __('Layout'), initialOpen: false },
                    el(SelectControl, {
                        label:    __('Card Style'),
                        value:    a.style,
                        options:  [
                            { label: 'Card (bordered)',  value: 'card' },
                            { label: 'Inline',          value: 'inline' },
                            { label: 'Minimal',         value: 'minimal' },
                        ],
                        onChange: function (v) { setA({ style: v }); },
                    }),
                    el(SelectControl, {
                        label:    __('Size'),
                        value:    a.size,
                        options:  [
                            { label: 'Small',  value: 'sm' },
                            { label: 'Medium', value: 'md' },
                            { label: 'Large',  value: 'lg' },
                        ],
                        onChange: function (v) { setA({ size: v }); },
                    }),
                    el(SelectControl, {
                        label:    __('Alignment'),
                        value:    a.alignment,
                        options:  [
                            { label: 'Left',   value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right',  value: 'right' },
                        ],
                        onChange: function (v) { setA({ alignment: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Border Radius'),
                        value: a.borderRadius,
                        min: 0, max: 30,
                        onChange: function (v) { setA({ borderRadius: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Toast Duration (ms)'),
                        value: a.toastDuration,
                        min: 500, max: 5000, step: 100,
                        onChange: function (v) { setA({ toastDuration: v }); },
                    })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Code Text', 'blockenberg'), value: a.typoCode, onChange: function (v) { setA({ typoCode: v }); } }),
                    el(getTypographyControl(), { label: __('Description', 'blockenberg'), value: a.typoDesc, onChange: function (v) { setA({ typoDesc: v }); } })
                ),
el(PanelBody, { title: __('Colors'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Card Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Card Background'),  value: a.bgColor,     onChange: function (v) { setA({ bgColor:     v || '#f9fafb' }); } },
                            { label: __('Border Color'),     value: a.borderColor, onChange: function (v) { setA({ borderColor: v || '#e5e7eb' }); } },
                            { label: __('Code Area BG'),     value: a.codeBg,      onChange: function (v) { setA({ codeBg:      v || '#f3f4f6' }); } },
                            { label: __('Code Text Color'),  value: a.codeColor,   onChange: function (v) { setA({ codeColor:   v || '#111827' }); } },
                            { label: __('Button BG'),        value: a.btnBg,       onChange: function (v) { setA({ btnBg:       v || '#111827' }); } },
                            { label: __('Button Text'),      value: a.btnColor,    onChange: function (v) { setA({ btnColor:    v || '#ffffff' }); } },
                        ],
                    })
                )
            );

            /* ── Editor preview ── */
            var isCard = a.style === 'card';
            var wrapStyle = {
                background:    isCard ? a.bgColor    : 'transparent',
                border:        isCard ? '1px solid ' + a.borderColor : 'none',
                borderRadius:  a.borderRadius + 'px',
                padding:       isCard ? '16px' : '0',
                display:       'flex',
                alignItems:    'center',
                gap:           12,
                flexWrap:      'wrap',
            };
            var codeStyle = {
                flex:        1, minWidth: 120,
                background:  a.codeBg,
                color:       a.codeColor,
                borderRadius:a.borderRadius / 2 + 'px',
                padding:     '8px 14px',
            };
            var btnStyle = {
                display:     'inline-flex', alignItems: 'center', gap: 6,
                height:      sz.h + 'px', padding: sz.pad,
                background:  a.btnBg, color: a.btnColor,
                borderRadius:a.borderRadius / 2 + 'px',
                fontSize:    sz.fs + 'px', fontWeight: a.fontWeight,
                cursor:      'pointer', whiteSpace: 'nowrap',
                border:      'none',
            };

            var typoVars = Object.assign({}, _tv(a.typoCode, '--bkbg-cpc-cd'), _tv(a.typoDesc, '--bkbg-cpc-ds'));

            return el('div', { className: 'bkbg-cpc-editor', style: typoVars },
                inspector,
                a.description && el('p', { className: 'bkbg-cpc-desc', style: { margin: '0 0 10px', color: '#6b7280' } }, a.description),
                el('div', { style: wrapStyle },
                    a.showCode && el('span', { className: 'bkbg-cpc-code', style: codeStyle }, a.textToCopy),
                    el('button', { style: btnStyle, type: 'button' },
                        a.iconEnabled && el('span', { dangerouslySetInnerHTML: { __html: copyIcon }, style: { display: 'flex', alignItems: 'center' } }),
                        a.label
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', {
                className:          'bkbg-cpc-wrap bkbg-cpc-style--' + a.style + ' bkbg-cpc-align--' + a.alignment,
                'data-text':        a.textToCopy,
                'data-label':       a.label,
                'data-copied-label':a.copiedLabel,
                'data-show-code':   a.showCode    ? '1' : '0',
                'data-icon':        a.iconEnabled ? '1' : '0',
                'data-size':        a.size,
                'data-bg':          a.bgColor,
                'data-border':      a.borderColor,
                'data-btn-bg':      a.btnBg,
                'data-btn-color':   a.btnColor,
                'data-code-bg':     a.codeBg,
                'data-code-color':  a.codeColor,
                'data-code-fs':     a.codeFontSize,
                'data-fs':          a.fontSize,
                'data-desc-size':   a.descSize,
                'data-fw':          a.fontWeight,
                'data-radius':      a.borderRadius,
                'data-toast':       a.toastDuration,
                'data-description': a.description,
                'data-typo-code': JSON.stringify(a.typoCode || {}),
                'data-typo-desc': JSON.stringify(a.typoDesc || {}),
            });
        },
    });
})();
