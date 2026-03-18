( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var TextControl = wp.components.TextControl;
    var SelectControl = wp.components.SelectControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var PDFIcon = el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
        el('path', { d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h2c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1H8v5h1v-1zm0-3h1v1H8v-1zm4 3h2v-1h-2v-1h2v-1h-2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1zm5-3h-2v3h1v-1h1c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zm0 2h-1v-1h1v1z' })
    );

    registerBlockType('blockenberg/pdf-embed', {
        title: __('PDF Embed', 'blockenberg'),
        description: __('Embed a PDF document with viewer controls.', 'blockenberg'),
        category: 'bkbg-media',
        icon: PDFIcon,
        attributes: {
            pdfUrl:           { type: 'string',  default: '' },
            pdfId:            { type: 'number',  default: 0 },
            pdfTitle:         { type: 'string',  default: 'PDF Document' },
            height:           { type: 'number',  default: 600 },
            width:            { type: 'number',  default: 100 },
            showDownload:     { type: 'boolean', default: true },
            downloadLabel:    { type: 'string',  default: 'Download PDF' },
            showToolbar:      { type: 'boolean', default: true },
            borderRadius:     { type: 'number',  default: 8 },
            borderColor:      { type: 'string',  default: '#e5e7eb' },
            borderWidth:      { type: 'number',  default: 1 },
            bgColor:          { type: 'string',  default: '#f9fafb' },
            downloadBtnBg:    { type: 'string',  default: '#2563eb' },
            downloadBtnColor: { type: 'string',  default: '#ffffff' },
            fallbackMessage:  { type: 'string',  default: 'Your browser does not support inline PDF preview.' },
            showFallbackLink: { type: 'boolean', default: true },
            downloadTypo:     { type: 'object',  default: {} }
        },

        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;

            function getIframeSrc() {
                if (!a.pdfUrl) return '';
                return a.showToolbar ? a.pdfUrl : a.pdfUrl + '#toolbar=0';
            }

            var blockProps = useBlockProps((function(){
                var s = {
                    '--bkbg-pdf-radius': a.borderRadius + 'px',
                    '--bkbg-pdf-border': a.borderColor,
                    '--bkbg-pdf-bw':     a.borderWidth + 'px',
                    '--bkbg-pdf-bg':     a.bgColor,
                    '--bkbg-pdf-dl-bg':  a.downloadBtnBg,
                    '--bkbg-pdf-dl-clr': a.downloadBtnColor,
                    '--bkbg-pdf-width':  a.width + '%'
                };
                var tv = getTypoCssVars();
                if (tv) {
                    Object.assign(s, tv(a.downloadTypo || {}, '--bkbg-pdf-dl'));
                }
                return { className: 'bkbg-pdf-wrap', style: s };
            })());

            var inspector = el(InspectorControls, null,

                el(PanelBody, { title: __('PDF Source', 'blockenberg'), initialOpen: true },
                    el('p', { style: { fontSize: 12, color: '#6b7280', marginTop: 0 } },
                        __('Upload a PDF from the Media Library or enter a URL.', 'blockenberg')
                    ),
                    el(MediaUpload, {
                        onSelect: function (m) {
                            setAttr({ pdfUrl: m.url, pdfId: m.id, pdfTitle: m.title || m.filename || 'PDF Document' });
                        },
                        allowedTypes: ['application/pdf'],
                        value: a.pdfId,
                        render: function (p) {
                            return el(Button, {
                                variant: a.pdfUrl ? 'secondary' : 'primary',
                                onClick: p.open
                            }, a.pdfUrl ? __('Change PDF', 'blockenberg') : __('Upload / Choose PDF', 'blockenberg'));
                        }
                    }),
                    el('div', { style: { margin: '8px 0 4px', fontSize: 12, color: '#6b7280' } }, __('— or enter URL directly —', 'blockenberg')),
                    el(TextControl, {
                        label: __('PDF URL', 'blockenberg'),
                        type: 'url',
                        value: a.pdfUrl,
                        onChange: function (v) { setAttr({ pdfUrl: v }); },
                        placeholder: 'https://example.com/document.pdf'
                    }),
                    a.pdfUrl && el(Button, {
                        variant: 'tertiary', isDestructive: true, isSmall: true,
                        onClick: function () { setAttr({ pdfUrl: '', pdfId: 0 }); }
                    }, __('Remove PDF', 'blockenberg')),
                    el(TextControl, {
                        label: __('Document title (for accessibility)', 'blockenberg'),
                        value: a.pdfTitle,
                        onChange: function (v) { setAttr({ pdfTitle: v }); }
                    })
                ),

                el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Height (px)', 'blockenberg'),
                        value: a.height, min: 200, max: 1600,
                        onChange: function (v) { setAttr({ height: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Width (%)', 'blockenberg'),
                        value: a.width, min: 40, max: 100,
                        onChange: function (v) { setAttr({ width: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show PDF toolbar', 'blockenberg'),
                        checked: a.showToolbar,
                        onChange: function (v) { setAttr({ showToolbar: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Border radius (px)', 'blockenberg'),
                        value: a.borderRadius, min: 0, max: 24,
                        onChange: function (v) { setAttr({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border width (px)', 'blockenberg'),
                        value: a.borderWidth, min: 0, max: 8,
                        onChange: function (v) { setAttr({ borderWidth: v }); }
                    })
                ),

                el(PanelBody, { title: __('Download Button', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show download button', 'blockenberg'),
                        checked: a.showDownload,
                        onChange: function (v) { setAttr({ showDownload: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    a.showDownload && el(TextControl, {
                        label: __('Button label', 'blockenberg'),
                        value: a.downloadLabel,
                        onChange: function (v) { setAttr({ downloadLabel: v }); }
                    })
                ),

                el(PanelBody, { title: __('Fallback', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Fallback message', 'blockenberg'),
                        value: a.fallbackMessage,
                        onChange: function (v) { setAttr({ fallbackMessage: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show fallback download link', 'blockenberg'),
                        checked: a.showFallbackLink,
                        onChange: function (v) { setAttr({ showFallbackLink: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function(){ var C = getTypoControl(); return C ? [
                        el(C, { key: 'download', label: __('Download Button', 'blockenberg'), value: a.downloadTypo || {}, onChange: function(v){ setAttr({downloadTypo: v}); } })
                    ] : null; })()
                ),
                                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Frame background', 'blockenberg'),   value: a.bgColor,          onChange: function(v){ setAttr({ bgColor: v||'#f9fafb' }); } },
                            { label: __('Border', 'blockenberg'),             value: a.borderColor,      onChange: function(v){ setAttr({ borderColor: v||'#e5e7eb' }); } },
                            { label: __('Download button bg', 'blockenberg'), value: a.downloadBtnBg,    onChange: function(v){ setAttr({ downloadBtnBg: v||'#2563eb' }); } },
                            { label: __('Download button text', 'blockenberg'),value: a.downloadBtnColor,onChange: function(v){ setAttr({ downloadBtnColor: v||'#ffffff' }); } }
                        ]
                    })
                )
            );

            /* ── Editor preview ── */
            var preview;
            if (!a.pdfUrl) {
                preview = el('div', { className: 'bkbg-pdf-placeholder' },
                    el('div', { className: 'bkbg-pdf-placeholder-icon' }, PDFIcon),
                    el('p', null, __('Upload or paste a PDF URL in the settings panel.', 'blockenberg')),
                    el(MediaUpload, {
                        onSelect: function (m) {
                            setAttr({ pdfUrl: m.url, pdfId: m.id, pdfTitle: m.title || 'PDF Document' });
                        },
                        allowedTypes: ['application/pdf'],
                        value: a.pdfId,
                        render: function (p) {
                            return el(Button, { variant: 'primary', onClick: p.open }, __('Upload PDF', 'blockenberg'));
                        }
                    })
                );
            } else {
                var iframeSrc = getIframeSrc();
                preview = el(Fragment, null,
                    el('div', { className: 'bkbg-pdf-viewer', style: { height: Math.min(a.height, 400) + 'px' } },
                        el('iframe', {
                            src: iframeSrc,
                            title: a.pdfTitle,
                            className: 'bkbg-pdf-iframe',
                            style: { pointerEvents: 'none' }
                        })
                    ),
                    a.showDownload && el('div', { className: 'bkbg-pdf-footer' },
                        el('a', {
                            href: a.pdfUrl,
                            download: '',
                            className: 'bkbg-pdf-download'
                        },
                            el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', className: 'bkbg-pdf-dl-icon' },
                                el('path', { d: 'M12 16l-5-5h3V4h4v7h3l-5 5zm-7 4v-2h14v2H5z' })
                            ),
                            a.downloadLabel
                        )
                    )
                );
            }

            return el(Fragment, null,
                inspector,
                el('div', blockProps, preview)
            );
        },

        deprecated: [{
            attributes: {
                pdfUrl:           { type: 'string',  default: '' },
                pdfId:            { type: 'number',  default: 0 },
                pdfTitle:         { type: 'string',  default: 'PDF Document' },
                height:           { type: 'number',  default: 600 },
                width:            { type: 'number',  default: 100 },
                showDownload:     { type: 'boolean', default: true },
                downloadLabel:    { type: 'string',  default: 'Download PDF' },
                showToolbar:      { type: 'boolean', default: true },
                borderRadius:     { type: 'number',  default: 8 },
                borderColor:      { type: 'string',  default: '#e5e7eb' },
                borderWidth:      { type: 'number',  default: 1 },
                bgColor:          { type: 'string',  default: '#f9fafb' },
                downloadBtnBg:    { type: 'string',  default: '#2563eb' },
                downloadBtnColor: { type: 'string',  default: '#ffffff' },
                fallbackMessage:  { type: 'string',  default: 'Your browser does not support inline PDF preview.' },
                showFallbackLink: { type: 'boolean', default: true },
                downloadFontSize: { type: 'number',  default: 14 },
                downloadFontWeight: { type: 'string', default: '600' }
            },
            save: function(props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({
                    className: 'bkbg-pdf-wrap',
                    style: {
                        '--bkbg-pdf-radius': a.borderRadius + 'px',
                        '--bkbg-pdf-border': a.borderColor,
                        '--bkbg-pdf-bw':     a.borderWidth + 'px',
                        '--bkbg-pdf-bg':     a.bgColor,
                        '--bkbg-pdf-dl-bg':  a.downloadBtnBg,
                        '--bkbg-pdf-dl-clr': a.downloadBtnColor,
                        '--bkbg-pdf-width':  a.width + '%'
                    }
                });
                if (!a.pdfUrl) {
                    return el('div', blockProps,
                        el('p', { className: 'bkbg-pdf-no-source' }, 'No PDF selected.')
                    );
                }
                var iframeSrc = a.showToolbar ? a.pdfUrl : a.pdfUrl + '#toolbar=0';
                return el('div', blockProps,
                    el('div', {
                        className: 'bkbg-pdf-viewer',
                        style: { height: a.height + 'px' }
                    },
                        el('iframe', {
                            src: iframeSrc,
                            title: a.pdfTitle,
                            className: 'bkbg-pdf-iframe',
                            loading: 'lazy'
                        },
                            el('p', { className: 'bkbg-pdf-fallback' },
                                a.fallbackMessage + ' ',
                                a.showFallbackLink && el('a', { href: a.pdfUrl, download: '' }, 'Download PDF')
                            )
                        )
                    ),
                    a.showDownload && el('div', { className: 'bkbg-pdf-footer' },
                        el('a', {
                            href: a.pdfUrl,
                            download: '',
                            className: 'bkbg-pdf-download',
                            target: '_blank',
                            rel: 'noopener'
                        },
                            el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', className: 'bkbg-pdf-dl-icon' },
                                el('path', { d: 'M12 16l-5-5h3V4h4v7h3l-5 5zm-7 4v-2h14v2H5z' })
                            ),
                            a.downloadLabel
                        )
                    )
                );
            }
        }],

        save: function (props) {
            var a = props.attributes;
            var tv = getTypoCssVars();
            var s = {
                '--bkbg-pdf-radius': a.borderRadius + 'px',
                '--bkbg-pdf-border': a.borderColor,
                '--bkbg-pdf-bw':     a.borderWidth + 'px',
                '--bkbg-pdf-bg':     a.bgColor,
                '--bkbg-pdf-dl-bg':  a.downloadBtnBg,
                '--bkbg-pdf-dl-clr': a.downloadBtnColor,
                '--bkbg-pdf-width':  a.width + '%'
            };
            if (tv) { Object.assign(s, tv(a.downloadTypo || {}, '--bkbg-pdf-dl')); }
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-pdf-wrap',
                style: s
            });

            if (!a.pdfUrl) {
                return el('div', blockProps,
                    el('p', { className: 'bkbg-pdf-no-source' }, 'No PDF selected.')
                );
            }

            var iframeSrc = a.showToolbar ? a.pdfUrl : a.pdfUrl + '#toolbar=0';

            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-pdf-viewer',
                    style: { height: a.height + 'px' }
                },
                    el('iframe', {
                        src: iframeSrc,
                        title: a.pdfTitle,
                        className: 'bkbg-pdf-iframe',
                        loading: 'lazy'
                    },
                        el('p', { className: 'bkbg-pdf-fallback' },
                            a.fallbackMessage + ' ',
                            a.showFallbackLink && el('a', { href: a.pdfUrl, download: '' }, 'Download PDF')
                        )
                    )
                ),
                a.showDownload && el('div', { className: 'bkbg-pdf-footer' },
                    el('a', {
                        href: a.pdfUrl,
                        download: '',
                        className: 'bkbg-pdf-download',
                        target: '_blank',
                        rel: 'noopener'
                    },
                        el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', className: 'bkbg-pdf-dl-icon' },
                            el('path', { d: 'M12 16l-5-5h3V4h4v7h3l-5 5zm-7 4v-2h14v2H5z' })
                        ),
                        a.downloadLabel
                    )
                )
            );
        }
    });
}() );
