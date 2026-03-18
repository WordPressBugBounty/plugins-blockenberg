( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;
    var useRef = wp.element.useRef;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var ALIGN_OPTIONS = [
        { label: 'Left',   value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right',  value: 'right' },
    ];
    var ERROR_LEVELS = [
        { label: 'Low (L — 7%)',       value: 'L' },
        { label: 'Medium (M — 15%)',   value: 'M' },
        { label: 'Quartile (Q — 25%)', value: 'Q' },
        { label: 'High (H — 30%)',     value: 'H' },
    ];
    var BORDER_STYLES = [
        { label: 'Shadow', value: 'shadow' },
        { label: 'Border', value: 'border' },
        { label: 'None',   value: 'none' },
    ];

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ── QR render in editor ──────────────────────────────────────────────── */
    function QRPreview(props) {
        var a = props;
        var containerRef = useRef(null);
        var qrRef = useRef(null);

        function renderQR() {
            if (!containerRef.current) return;
            if (typeof window.QRCode === 'undefined') return;
            try {
                if (qrRef.current) { qrRef.current.clear(); qrRef.current.makeCode(a.content); return; }
                containerRef.current.innerHTML = '';
                qrRef.current = new window.QRCode(containerRef.current, {
                    text: a.content || 'https://example.com',
                    width: a.size, height: a.size,
                    colorDark: a.fgColor,
                    colorLight: a.bgColor,
                    correctLevel: window.QRCode.CorrectLevel[a.errorLevel] || window.QRCode.CorrectLevel.M,
                });
            } catch (e) { /* ignore */ }
        }

        useEffect(function () {
            if (typeof window.QRCode !== 'undefined') { renderQR(); return; }
            var s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            s.onload = renderQR;
            document.head.appendChild(s);
        }, []);

        useEffect(renderQR, [a.content, a.size, a.fgColor, a.bgColor, a.errorLevel]);

        var boxStyle = {
            display: 'inline-block',
            background: a.cardBg,
            padding: a.cardPadding + 'px',
            borderRadius: a.borderRadius + 'px',
            boxShadow: a.borderStyle === 'shadow' ? '0 4px 16px rgba(0,0,0,0.10)' : 'none',
            border: a.borderStyle === 'border' ? '1px solid ' + a.borderColor : 'none',
            textAlign: 'center',
        };

        return el('div', { style: { textAlign: a.align } },
            el('div', { style: boxStyle },
                el('div', { ref: containerRef }),
                a.showCaption && a.caption && el('p', {
                    className: 'bkqr-caption',
                    style: { margin: '10px 0 0', color: a.captionColor }
                }, a.caption),
                a.downloadable && el('button', {
                    style: { display: 'block', margin: '10px auto 0', fontSize: '12px', color: '#9ca3af', background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 10px', cursor: 'default', opacity: 0.7 },
                    disabled: true,
                }, a.downloadLabel),
            )
        );
    }

    var v1Attributes = {
        content: { type: 'string', default: 'https://example.com' },
        size: { type: 'number', default: 200 },
        fgColor: { type: 'string', default: '#1f2937' },
        bgColor: { type: 'string', default: '#ffffff' },
        errorLevel: { type: 'string', default: 'M' },
        caption: { type: 'string', default: '' },
        showCaption: { type: 'boolean', default: false },
        captionColor: { type: 'string', default: '#6b7280' },
        captionSize: { type: 'number', default: 13 },
        align: { type: 'string', default: 'center' },
        cardBg: { type: 'string', default: '#ffffff' },
        cardPadding: { type: 'number', default: 20 },
        borderRadius: { type: 'number', default: 12 },
        borderStyle: { type: 'string', default: 'shadow' },
        borderColor: { type: 'string', default: '#e5e7eb' },
        downloadable: { type: 'boolean', default: true },
        downloadLabel: { type: 'string', default: 'Download QR' },
        captionFontWeight: { type: 'number', default: 400 },
        captionLineHeight: { type: 'number', default: 1.4 }
    };

    registerBlockType('blockenberg/qr-code', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var TC = getTypoControl();
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = { textAlign: a.align };
                if (_tv) {
                    Object.assign(s, _tv(a.captionTypo || {}, '--bkqr-cap-'));
                }
                return { style: s };
            })());

            return el('div', blockProps,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('QR Code Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, {
                            label: __('URL or Text to Encode', 'blockenberg'),
                            value: a.content,
                            onChange: function (v) { set({ content: v }); },
                            help: __('Paste any URL, phone number, email or plain text.', 'blockenberg')
                        }),
                        el(SelectControl, {
                            label: __('Error Correction', 'blockenberg'),
                            value: a.errorLevel,
                            options: ERROR_LEVELS,
                            onChange: function (v) { set({ errorLevel: v }); },
                            help: __('Higher = more data redundancy, larger QR.', 'blockenberg')
                        }),
                    ),
                    el(PanelBody, { title: __('Size & Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('QR Size (px)', 'blockenberg'),
                            value: a.size, min: 80, max: 500,
                            onChange: function (v) { set({ size: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Alignment', 'blockenberg'),
                            value: a.align,
                            options: ALIGN_OPTIONS,
                            onChange: function (v) { set({ align: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Card Padding (px)', 'blockenberg'),
                            value: a.cardPadding, min: 0, max: 60,
                            onChange: function (v) { set({ cardPadding: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Border Radius (px)', 'blockenberg'),
                            value: a.borderRadius, min: 0, max: 32,
                            onChange: function (v) { set({ borderRadius: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Border Style', 'blockenberg'),
                            value: a.borderStyle,
                            options: BORDER_STYLES,
                            onChange: function (v) { set({ borderStyle: v }); }
                        }),
                    ),
                    el(PanelBody, { title: __('Caption & Download', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show Caption', 'blockenberg'),
                            checked: a.showCaption,
                            onChange: function (v) { set({ showCaption: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        a.showCaption && el(TextControl, {
                            label: __('Caption Text', 'blockenberg'),
                            value: a.caption,
                            onChange: function (v) { set({ caption: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Download Button', 'blockenberg'),
                            checked: a.downloadable,
                            onChange: function (v) { set({ downloadable: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        a.downloadable && el(TextControl, {
                            label: __('Download Button Label', 'blockenberg'),
                            value: a.downloadLabel,
                            onChange: function (v) { set({ downloadLabel: v }); }
                        }),
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        TC && el(TC, { label: __('Caption', 'blockenberg'), value: a.captionTypo || {}, onChange: function(v) { set({ captionTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('QR Foreground', 'blockenberg'), value: a.fgColor,      onChange: function (v) { set({ fgColor: v || '#1f2937' }); } },
                            { label: __('QR Background', 'blockenberg'), value: a.bgColor,      onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: __('Card Background', 'blockenberg'), value: a.cardBg,     onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                            { label: __('Border Color', 'blockenberg'), value: a.borderColor,   onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); } },
                            { label: __('Caption Color', 'blockenberg'), value: a.captionColor, onChange: function (v) { set({ captionColor: v || '#6b7280' }); } },
                        ]
                    }),
                ),
                el(QRPreview, a)
            );
        },

        save: function (props) {
            var a = props.attributes;
            var boxStyle = {
                display: 'inline-block',
                background: a.cardBg,
                padding: a.cardPadding + 'px',
                borderRadius: a.borderRadius + 'px',
                boxShadow: a.borderStyle === 'shadow' ? '0 4px 16px rgba(0,0,0,0.10)' : 'none',
                border: a.borderStyle === 'border' ? '1px solid ' + a.borderColor : 'none',
                textAlign: 'center',
            };
            return el('div', {
                className: 'bkqr-wrap',
                style: (function () {
                    var _tv = getTypoCssVars();
                    var s = { textAlign: a.align };
                    if (_tv) {
                        Object.assign(s, _tv(a.captionTypo || {}, '--bkqr-cap-'));
                    }
                    return s;
                })()
            },
                el('div', {
                    className: 'bkqr-box',
                    style: boxStyle,
                    'data-content': a.content,
                    'data-size': a.size,
                    'data-fg': a.fgColor,
                    'data-bg': a.bgColor,
                    'data-level': a.errorLevel,
                },
                    el('div', { className: 'bkqr-canvas' }),
                    a.showCaption && a.caption && el('p', {
                        className: 'bkqr-caption',
                        style: { margin: '10px 0 0', color: a.captionColor }
                    }, a.caption),
                    a.downloadable && el('button', {
                        className: 'bkqr-download',
                        style: { display: 'block', margin: '10px auto 0', fontSize: '12px', color: '#6b7280', background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }
                    }, a.downloadLabel),
                )
            );
        },

        deprecated: [{
            attributes: v1Attributes,
            save: function (props) {
                var a = props.attributes;
                var boxStyle = {
                    display: 'inline-block',
                    background: a.cardBg,
                    padding: a.cardPadding + 'px',
                    borderRadius: a.borderRadius + 'px',
                    boxShadow: a.borderStyle === 'shadow' ? '0 4px 16px rgba(0,0,0,0.10)' : 'none',
                    border: a.borderStyle === 'border' ? '1px solid ' + a.borderColor : 'none',
                    textAlign: 'center',
                };
                return el('div', {
                    className: 'bkqr-wrap',
                    style: { textAlign: a.align }
                },
                    el('div', {
                        className: 'bkqr-box',
                        style: boxStyle,
                        'data-content': a.content,
                        'data-size': a.size,
                        'data-fg': a.fgColor,
                        'data-bg': a.bgColor,
                        'data-level': a.errorLevel,
                    },
                        el('div', { className: 'bkqr-canvas' }),
                        a.showCaption && a.caption && el('p', {
                            className: 'bkqr-caption',
                            style: { margin: '10px 0 0', color: a.captionColor, fontSize: a.captionSize + 'px', fontWeight: (a.captionFontWeight || 400), lineHeight: (a.captionLineHeight || 1.4) }
                        }, a.caption),
                        a.downloadable && el('button', {
                            className: 'bkqr-download',
                            style: { display: 'block', margin: '10px auto 0', fontSize: '12px', color: '#6b7280', background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }
                        }, a.downloadLabel),
                    )
                );
            }
        }],
    });
}() );
