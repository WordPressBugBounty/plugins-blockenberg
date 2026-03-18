( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var iconSVGs = {
        none:      '',
        info:      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke="#fff" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="16" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
        warning:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        star:      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        megaphone: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>',
        bell:      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>'
    };

    registerBlockType('blockenberg/notification-bar', {
        title: __('Notification Bar', 'blockenberg'),
        description: __('Dismissible sticky announcement bar.', 'blockenberg'),
        category: 'bkbg-marketing',
        icon: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M20 2H4a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V4a2 2 0 00-2-2zM4 6h16v2H4V6z' })
        ),
        attributes: {
            message:        { type: 'string',  default: '🎉 Special offer! Save 20% today only.' },
            linkLabel:      { type: 'string',  default: 'Shop Now' },
            linkUrl:        { type: 'string',  default: '' },
            linkTarget:     { type: 'string',  default: '_self' },
            position:       { type: 'string',  default: 'top' },
            icon:           { type: 'string',  default: 'none' },
            showClose:      { type: 'boolean', default: true },
            cookieName:     { type: 'string',  default: 'bkbg_nb_dismissed' },
            cookieDays:     { type: 'number',  default: 1 },
            bgColor:        { type: 'string',  default: '#2563eb' },
            textColor:      { type: 'string',  default: '#ffffff' },
            linkColor:      { type: 'string',  default: '#bfdbfe' },
            closeBtnColor:  { type: 'string',  default: '#93c5fd' },
            fontSize:       { type: 'number',  default: 14 },
            padding:        { type: 'number',  default: 12 },
            animation:      { type: 'string',  default: 'slide' },
            sticky:         { type: 'boolean', default: true },
            showAfterDelay: { type: 'number',  default: 0 }
        },

        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;

            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) { Object.assign(s, _tvf(a.messageTypo, '--bkbg-nb-msg-')); }
                return { className: 'bkbg-nb-editor-wrap', style: s };
            })());

            var inspector = el(InspectorControls, null,

                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label: __('Link label', 'blockenberg'),
                        value: a.linkLabel,
                        onChange: function (v) { setAttr({ linkLabel: v }); }
                    }),
                    el(TextControl, {
                        label: __('Link URL', 'blockenberg'),
                        type: 'url',
                        value: a.linkUrl,
                        onChange: function (v) { setAttr({ linkUrl: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Link target', 'blockenberg'),
                        value: a.linkTarget,
                        options: [
                            { label: 'Same tab', value: '_self' },
                            { label: 'New tab',  value: '_blank' }
                        ],
                        onChange: function (v) { setAttr({ linkTarget: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Icon', 'blockenberg'),
                        value: a.icon,
                        options: [
                            { label: 'None',      value: 'none' },
                            { label: 'Info',      value: 'info' },
                            { label: 'Warning',   value: 'warning' },
                            { label: 'Star',      value: 'star' },
                            { label: 'Megaphone', value: 'megaphone' },
                            { label: 'Bell',      value: 'bell' }
                        ],
                        onChange: function (v) { setAttr({ icon: v }); }
                    })
                ),

                el(PanelBody, { title: __('Behaviour', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Position', 'blockenberg'),
                        value: a.position,
                        options: [
                            { label: 'Top of page',    value: 'top' },
                            { label: 'Bottom of page', value: 'bottom' }
                        ],
                        onChange: function (v) { setAttr({ position: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Sticky (fixed to viewport)', 'blockenberg'),
                        checked: a.sticky,
                        onChange: function (v) { setAttr({ sticky: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show close button', 'blockenberg'),
                        checked: a.showClose,
                        onChange: function (v) { setAttr({ showClose: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Animation', 'blockenberg'),
                        value: a.animation,
                        options: [
                            { label: 'Slide', value: 'slide' },
                            { label: 'Fade',  value: 'fade' },
                            { label: 'None',  value: 'none' }
                        ],
                        onChange: function (v) { setAttr({ animation: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Show after delay (ms)', 'blockenberg'),
                        value: a.showAfterDelay, min: 0, max: 10000, step: 250,
                        onChange: function (v) { setAttr({ showAfterDelay: v }); }
                    }),
                    el(TextControl, {
                        label: __('Cookie / storage key', 'blockenberg'),
                        value: a.cookieName,
                        onChange: function (v) { setAttr({ cookieName: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Remember dismissal (days)', 'blockenberg'),
                        value: a.cookieDays, min: 0, max: 365,
                        onChange: function (v) { setAttr({ cookieDays: v }); }
                    })
                ),

                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Vertical padding (px)', 'blockenberg'),
                        value: a.padding, min: 4, max: 32,
                        onChange: function (v) { setAttr({ padding: v }); }
                    }),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background',   'blockenberg'), value: a.bgColor,       onChange: function(v){ setAttr({ bgColor: v||'#2563eb' }); } },
                            { label: __('Text',         'blockenberg'), value: a.textColor,     onChange: function(v){ setAttr({ textColor: v||'#ffffff' }); } },
                            { label: __('Link',         'blockenberg'), value: a.linkColor,     onChange: function(v){ setAttr({ linkColor: v||'#bfdbfe' }); } },
                            { label: __('Close button', 'blockenberg'), value: a.closeBtnColor, onChange: function(v){ setAttr({ closeBtnColor: v||'#93c5fd' }); } }
                        ]
                    })
                ),
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: __('Message Typography', 'blockenberg'), value: a.messageTypo || {}, onChange: function (v) { setAttr({ messageTypo: v }); } })
                )
            );

            /* editor preview (static, not sticky) */
            var previewStyle = {
                background: a.bgColor,
                color: a.textColor,
                padding: a.padding + 'px 20px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                position: 'relative'
            };

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-nb-preview-label' },
                        '🔧 Notification Bar Preview (' + a.position + (a.sticky ? ', sticky' : '') + ')'
                    ),
                    el('div', { className: 'bkbg-nb-bar', style: previewStyle },
                        a.icon !== 'none' && el('span', {
                            className: 'bkbg-nb-icon',
                            dangerouslySetInnerHTML: { __html: iconSVGs[a.icon] || '' }
                        }),
                        el(RichText, {
                            tagName: 'span',
                            className: 'bkbg-nb-message',
                            value: a.message,
                            onChange: function (v) { setAttr({ message: v }); },
                            placeholder: __('Type your announcement…', 'blockenberg'),
                            allowedFormats: ['core/bold', 'core/italic', 'core/link']
                        }),
                        a.linkUrl && a.linkLabel && el('a', {
                            href: '#',
                            className: 'bkbg-nb-link',
                            style: { color: a.linkColor }
                        }, a.linkLabel),
                        a.showClose && el('button', {
                            className: 'bkbg-nb-close',
                            style: { color: a.closeBtnColor },
                            'aria-label': 'Close'
                        }, '✕')
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tvf = getTypoCssVars();
            var barStyle = {
                '--bkbg-nb-bg':    a.bgColor,
                '--bkbg-nb-text':  a.textColor,
                '--bkbg-nb-link':  a.linkColor,
                '--bkbg-nb-close': a.closeBtnColor,
                '--bkbg-nb-fs':    a.fontSize + 'px',
                '--bkbg-nb-fw':    a.fontWeight || 500,
                '--bkbg-nb-lh':    a.lineHeight || 1.4,
                '--bkbg-nb-pad':   a.padding + 'px'
            };
            if (_tvf) { Object.assign(barStyle, _tvf(a.messageTypo, '--bkbg-nb-msg-')); }
            var blockProps = wp.blockEditor.useBlockProps.save({
                'data-position':    a.position,
                'data-animation':   a.animation,
                'data-sticky':      a.sticky ? '1' : '0',
                'data-delay':       a.showAfterDelay,
                'data-cookie':      a.cookieName,
                'data-cookie-days': a.cookieDays,
                'data-show-close':  a.showClose ? '1' : '0'
            });

            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-nb-bar',
                    style: barStyle
                },
                    el('div', { className: 'bkbg-nb-inner' },
                        el('div', { className: 'bkbg-nb-content' },
                            a.icon !== 'none' && el('span', { className: 'bkbg-nb-icon bkbg-nb-icon--' + a.icon }),
                            el(RichText.Content, { tagName: 'span', className: 'bkbg-nb-message', value: a.message }),
                            a.linkUrl && a.linkLabel && el('a', {
                                href: a.linkUrl,
                                className: 'bkbg-nb-link',
                                target: a.linkTarget,
                                rel: a.linkTarget === '_blank' ? 'noopener noreferrer' : undefined
                            }, a.linkLabel)
                        ),
                        a.showClose && el('button', {
                            className: 'bkbg-nb-close',
                            type: 'button',
                            'aria-label': 'Close notification'
                        }, el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
                            el('path', { d: 'M18 6L6 18M6 6l12 12', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round' })
                        ))
                    )
                )
            );
        },

        deprecated: [{
            attributes: {
                message:        { type: 'string',  default: '🎉 Special offer! Save 20% today only.' },
                linkLabel:      { type: 'string',  default: 'Shop Now' },
                linkUrl:        { type: 'string',  default: '' },
                linkTarget:     { type: 'string',  default: '_self' },
                position:       { type: 'string',  default: 'top' },
                icon:           { type: 'string',  default: 'none' },
                showClose:      { type: 'boolean', default: true },
                cookieName:     { type: 'string',  default: 'bkbg_nb_dismissed' },
                cookieDays:     { type: 'number',  default: 1 },
                bgColor:        { type: 'string',  default: '#2563eb' },
                textColor:      { type: 'string',  default: '#ffffff' },
                linkColor:      { type: 'string',  default: '#bfdbfe' },
                closeBtnColor:  { type: 'string',  default: '#93c5fd' },
                fontSize:       { type: 'number',  default: 14 },
                fontWeight:     { type: 'number',  default: 500 },
                lineHeight:     { type: 'number',  default: 1.4 },
                padding:        { type: 'number',  default: 12 },
                animation:      { type: 'string',  default: 'slide' },
                sticky:         { type: 'boolean', default: true },
                showAfterDelay: { type: 'number',  default: 0 }
            },
            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({
                    'data-position':    a.position,
                    'data-animation':   a.animation,
                    'data-sticky':      a.sticky ? '1' : '0',
                    'data-delay':       a.showAfterDelay,
                    'data-cookie':      a.cookieName,
                    'data-cookie-days': a.cookieDays,
                    'data-show-close':  a.showClose ? '1' : '0'
                });

                return el('div', blockProps,
                    el('div', {
                        className: 'bkbg-nb-bar',
                        style: {
                            '--bkbg-nb-bg':    a.bgColor,
                            '--bkbg-nb-text':  a.textColor,
                            '--bkbg-nb-link':  a.linkColor,
                            '--bkbg-nb-close': a.closeBtnColor,
                            '--bkbg-nb-fs':    a.fontSize + 'px',
                            '--bkbg-nb-fw':    a.fontWeight || 500,
                            '--bkbg-nb-lh':    a.lineHeight || 1.4,
                            '--bkbg-nb-pad':   a.padding + 'px'
                        }
                    },
                        el('div', { className: 'bkbg-nb-inner' },
                            el('div', { className: 'bkbg-nb-content' },
                                a.icon !== 'none' && el('span', { className: 'bkbg-nb-icon bkbg-nb-icon--' + a.icon }),
                                el(RichText.Content, { tagName: 'span', className: 'bkbg-nb-message', value: a.message }),
                                a.linkUrl && a.linkLabel && el('a', {
                                    href: a.linkUrl,
                                    className: 'bkbg-nb-link',
                                    target: a.linkTarget,
                                    rel: a.linkTarget === '_blank' ? 'noopener noreferrer' : undefined
                                }, a.linkLabel)
                            ),
                            a.showClose && el('button', {
                                className: 'bkbg-nb-close',
                                type: 'button',
                                'aria-label': 'Close notification'
                            }, el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
                                el('path', { d: 'M18 6L6 18M6 6l12 12', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round' })
                            ))
                        )
                    )
                );
            }
        }]
    });
}() );
