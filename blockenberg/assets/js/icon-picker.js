/**
 * Blockenberg — Shared Icon Picker
 *
 * Provides icon type selection, dashicon picker, image upload, and icon rendering
 * for use across all Blockenberg blocks.
 *
 * Works in both editor (React/createElement) and frontend (DOM) contexts.
 *
 * Editor API:
 *   window.bkbgIconPicker.IconPickerControl   — React control for inspector
 *   window.bkbgIconPicker.buildEditorIcon      — React element for editor preview
 *   window.bkbgIconPicker.buildSaveIcon        — React element for static save
 *   window.bkbgIconPicker.iconPickerProps(attr, set [, config]) — convenience mapper
 *
 * Frontend API:
 *   window.bkbgIconPicker.buildFrontendIcon    — DOM element builder
 *
 * Data:
 *   window.bkbgIconPicker.svgPaths             — { type: 'd-attribute' }
 *   window.bkbgIconPicker.dashicons            — [ 'icon-name', ... ]
 *   window.bkbgIconPicker.iconTypeOptions      — [ { label, value }, ... ]
 */
(function () {
    'use strict';

    // ── SVG Path Data ────────────────────────────────────────────────────────────
    var svgPaths = {
        check:         'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
        check2:        'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.59-7.59L19 7.5l-9 9z',
        arrow:         'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z',
        'arrow-right': 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
        star:          'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
        dash:          'M4 11h16v2H4z',
        cross:         'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
        sparkle:       'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z',
        bolt:          'M7 2v11h3v9l7-12h-4l4-8z',
        heart:         'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
        info:          'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
        warning:       'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
        shield:        'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z',
        'thumb-up':    'M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z',
        'thumb-down':  'M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z',
        lightbulb:     'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z',
        lock:          'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'
    };

    // SVG elements that need special markup (not just <path>)
    var svgSpecial = {
        disc:   '<circle cx="12" cy="12" r="6"/>',
        square: '<rect x="6" y="6" width="12" height="12" rx="2"/>'
    };

    // ── Dashicons List (subset) ──────────────────────────────────────────────────
    var dashicons = [
        'yes', 'yes-alt', 'no', 'no-alt', 'arrow-right', 'arrow-right-alt', 'arrow-right-alt2',
        'arrow-left-alt2', 'arrow-up-alt2', 'arrow-down-alt2',
        'star-filled', 'star-half', 'star-empty', 'heart', 'thumbs-up', 'thumbs-down',
        'awards', 'flag', 'warning', 'info', 'lightbulb', 'marker', 'tag', 'category',
        'location', 'location-alt', 'clock', 'calendar', 'calendar-alt',
        'groups', 'businessman', 'businesswoman', 'admin-users', 'id', 'id-alt',
        'products', 'cart', 'money', 'money-alt', 'bank', 'feedback', 'forms',
        'edit', 'trash', 'upload', 'download', 'cloud', 'cloud-upload', 'cloud-saved',
        'search', 'lock', 'unlock', 'performance', 'analytics', 'chart-bar', 'chart-pie',
        'chart-line', 'chart-area', 'list-view', 'grid-view', 'slides',
        'desktop', 'laptop', 'tablet', 'smartphone', 'phone',
        'media-audio', 'media-video', 'media-document', 'format-image', 'camera',
        'portfolio', 'book', 'book-alt', 'text-page', 'welcome-write-blog',
        'hammer', 'art', 'schedule', 'rest-api', 'database', 'code-standards',
        'rss', 'email', 'email-alt', 'share', 'share-alt', 'networking',
        'facebook', 'twitter', 'instagram', 'linkedin', 'youtube',
        'wordpress', 'superhero', 'superhero-alt', 'plugins-checked',
        'food', 'coffee', 'beer', 'car', 'airplane', 'palmtree', 'building', 'store',
        'smiley', 'bell', 'megaphone', 'microphone', 'games', 'tickets', 'tickets-alt',
        'privacy', 'shield', 'shield-alt', 'vault', 'sos', 'nametag', 'clipboard',
        'sticky', 'open-folder', 'paperclip', 'printer', 'shortcode', 'layout', 'saved',
        'plus', 'plus-alt', 'plus-alt2', 'minus', 'dismiss', 'remove', 'insert',
        'ellipsis', 'external', 'exit', 'fullscreen-alt', 'fullscreen-exit-alt'
    ];

    // ── Icon Type Options (for SelectControl) ────────────────────────────────────
    var iconTypeOptions = [
        { label: 'Checkmark ✓',    value: 'check' },
        { label: 'Check Circle ●✓', value: 'check2' },
        { label: 'Arrow ›',         value: 'arrow' },
        { label: 'Arrow Right →',   value: 'arrow-right' },
        { label: 'Disc •',          value: 'disc' },
        { label: 'Square ▪',        value: 'square' },
        { label: 'Star ★',          value: 'star' },
        { label: 'Sparkle ✦',       value: 'sparkle' },
        { label: 'Bolt ⚡',         value: 'bolt' },
        { label: 'Dash —',          value: 'dash' },
        { label: 'Cross ✕',         value: 'cross' },
        { label: 'Heart ♥',         value: 'heart' },
        { label: 'Info ℹ',          value: 'info' },
        { label: 'Warning ⚠',       value: 'warning' },
        { label: 'Shield 🛡',       value: 'shield' },
        { label: 'Thumbs Up 👍',    value: 'thumb-up' },
        { label: 'Thumbs Down 👎',  value: 'thumb-down' },
        { label: 'Lightbulb 💡',    value: 'lightbulb' },
        { label: 'Lock 🔒',         value: 'lock' },
        { label: 'Custom Character', value: 'custom-char' },
        { label: 'Custom Image',     value: 'custom-image' },
        { label: 'Dashicon',         value: 'dashicon' },
        { label: 'None',             value: 'none' }
    ];

    // ── Frontend DOM icon builder (always available) ─────────────────────────────
    function buildFrontendIcon(type, customChar, dashicon, imageUrl, dashiconColor) {
        if (!type || type === 'none') return null;

        var span = document.createElement('span');
        span.className = 'bkbg-icon-el';
        span.setAttribute('aria-hidden', 'true');
        span.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;line-height:1;';

        if (type === 'custom-image') {
            if (!imageUrl) return null;
            var img = document.createElement('img');
            img.src = imageUrl;
            img.alt = '';
            img.className = 'bkbg-icon-img';
            img.style.cssText = 'width:1em;height:1em;object-fit:contain;display:block;';
            span.appendChild(img);
        } else if (type === 'custom-char') {
            span.textContent = customChar || '→';
        } else if (type === 'dashicon') {
            var di = document.createElement('span');
            di.className = 'dashicons dashicons-' + (dashicon || 'star-filled');
            di.style.cssText = 'font-size:inherit;width:1em;height:1em;line-height:1;';
            if (dashiconColor) di.style.color = dashiconColor;
            span.appendChild(di);
        } else {
            var svgContent;
            if (svgSpecial[type]) {
                svgContent = svgSpecial[type];
            } else if (svgPaths[type]) {
                svgContent = '<path d="' + svgPaths[type] + '"/>';
            } else {
                svgContent = '<path d="' + svgPaths.check + '"/>';
            }
            span.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" ' +
                'aria-hidden="true" style="width:1em;height:1em;fill:currentColor;display:block;">' +
                svgContent + '</svg>';
        }

        return span;
    }

    // ── Editor Components (only when WP editor globals exist) ────────────────────
    var IconPickerControl = null;
    var buildEditorIcon   = null;
    var buildSaveIcon     = null;
    var builtInIcons      = null;

    if (typeof wp !== 'undefined' && wp.element && wp.components) {
        var el             = wp.element.createElement;
        var __             = wp.i18n.__;
        var useState       = wp.element.useState;
        var Fragment       = wp.element.Fragment;
        var SelectControl  = wp.components.SelectControl;
        var TextControl    = wp.components.TextControl;
        var Button         = wp.components.Button;
        var Popover        = wp.components.Popover;

        var svgStyle = { width: '1em', height: '1em', fill: 'currentColor', display: 'block' };

        // ── Built-in icons as React elements ──────────────────────────────────
        builtInIcons = {};
        Object.keys(svgPaths).forEach(function (key) {
            builtInIcons[key] = el('svg', {
                viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg',
                'aria-hidden': 'true', style: svgStyle
            }, el('path', { d: svgPaths[key] }));
        });
        builtInIcons.disc = el('svg', {
            viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg',
            'aria-hidden': 'true', style: svgStyle
        }, el('circle', { cx: '12', cy: '12', r: '6' }));
        builtInIcons.square = el('svg', {
            viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg',
            'aria-hidden': 'true', style: svgStyle
        }, el('rect', { x: '6', y: '6', width: '12', height: '12', rx: '2' }));

        // ── Media library opener ──────────────────────────────────────────────
        function openMediaLibrary(onSelect) {
            var frame = wp.media({
                title: __('Select Icon Image', 'blockenberg'),
                button: { text: __('Use as Icon', 'blockenberg') },
                multiple: false,
                library: { type: 'image' }
            });
            frame.on('select', function () {
                var attachment = frame.state().get('selection').first().toJSON();
                onSelect(attachment.url);
            });
            frame.open();
        }

        // ── IconPickerControl Component ───────────────────────────────────────
        // Props:
        //   iconType       - current icon type string
        //   customChar     - current custom character
        //   dashicon       - current dashicon name
        //   imageUrl       - current image URL
        //   onChangeType   - fn(newType)
        //   onChangeChar   - fn(newChar)
        //   onChangeDashicon  - fn(newDashicon)
        //   onChangeImageUrl  - fn(newUrl)
        //   showPreview    - (optional, default true) show inline preview for built-in icons
        //   dashiconColor  - (optional) color for dashicon
        //   onChangeColor  - fn(newColor)
        IconPickerControl = function (props) {
            var iconType   = props.iconType   || 'custom-char';
            var customChar = props.customChar  || '';
            var dashiconV  = props.dashicon    || 'star-filled';
            var imageUrl   = props.imageUrl    || '';
            var dashiconColor = props.dashiconColor || '';
            var showPreview = props.showPreview !== false;

            var pickerState  = useState(false);
            var pickerOpen   = pickerState[0];
            var setPickerOpen = pickerState[1];

            var searchState  = useState('');
            var iconSearch   = searchState[0];
            var setIconSearch = searchState[1];

            var filteredDashicons = dashicons.filter(function (i) {
                return !iconSearch || i.indexOf(iconSearch.toLowerCase()) !== -1;
            });

            return el(Fragment, {},

                // Icon Type selector
                el(SelectControl, {
                    label: __('Icon Type', 'blockenberg'),
                    value: iconType,
                    options: iconTypeOptions,
                    __nextHasNoMarginBottom: true,
                    onChange: props.onChangeType
                }),

                // ── Custom character input ────────────────────────────────────
                iconType === 'custom-char' && el('div', { style: { marginTop: '8px' } },
                    el(TextControl, {
                        label: __('Custom Character', 'blockenberg'),
                        value: customChar,
                        onChange: props.onChangeChar,
                        help: __('Any character or emoji, e.g. → ✦ ◆ 🔥 ⚠️', 'blockenberg'),
                        __nextHasNoMarginBottom: true
                    })
                ),

                // ── Custom image upload ───────────────────────────────────────
                iconType === 'custom-image' && el('div', { style: { marginTop: '8px', marginBottom: '8px' } },
                    el('p', { className: 'components-base-control__label' },
                        __('Image Icon', 'blockenberg')
                    ),
                    imageUrl && el('div', {
                        style: { marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }
                    },
                        el('img', {
                            src: imageUrl, alt: '',
                            style: {
                                width: '40px', height: '40px', objectFit: 'contain',
                                border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px'
                            }
                        }),
                        el(Button, {
                            isSmall: true, isDestructive: true, variant: 'secondary',
                            onClick: function () { props.onChangeImageUrl(''); }
                        }, __('Remove', 'blockenberg'))
                    ),
                    el(Button, {
                        variant: 'secondary',
                        onClick: function () {
                            openMediaLibrary(function (url) { props.onChangeImageUrl(url); });
                        }
                    },
                        el('span', { className: 'dashicons dashicons-upload', style: { marginRight: '4px' } }),
                        imageUrl
                            ? __('Replace Image', 'blockenberg')
                            : __('Select from Media Library', 'blockenberg')
                    )
                ),

                // ── Dashicon picker ───────────────────────────────────────────
                iconType === 'dashicon' && el('div', { style: { marginTop: '8px', marginBottom: '8px' } },
                    el('p', { className: 'components-base-control__label' },
                        __('Dashicon', 'blockenberg')
                    ),
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                        el('span', {
                            className: 'dashicons dashicons-' + dashiconV,
                            style: { fontSize: '24px', width: '24px', height: '24px', color: dashiconColor || 'inherit' }
                        }),
                        el(Button, {
                            variant: 'secondary', isSmall: true,
                            onClick: function () { setPickerOpen(!pickerOpen); }
                        }, __('Change Icon', 'blockenberg')),

                        pickerOpen && el(Popover, {
                            position: 'bottom left',
                            onClose: function () { setPickerOpen(false); setIconSearch(''); }
                        },
                            el('div', {
                                style: {
                                    width: '260px', maxHeight: '450px', background: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                                    overflow: 'hidden'
                                },
                                onMouseDown: function (e) { e.stopPropagation(); },
                                onClick: function (e) { e.stopPropagation(); }
                            },
                                // Header
                                el('div', {
                                    style: {
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', padding: '12px 16px',
                                        borderBottom: '1px solid #e0e0e0'
                                    }
                                },
                                    el('h3', { style: { margin: 0, fontSize: '14px', fontWeight: 600 } },
                                        __('Choose Dashicon', 'blockenberg')
                                    ),
                                    el(Button, {
                                        icon: 'no-alt',
                                        onClick: function () { setPickerOpen(false); setIconSearch(''); },
                                        style: { padding: 0, minWidth: '24px', height: '24px' }
                                    })
                                ),
                                // Search
                                el('div', { style: { padding: '8px 12px 0' } },
                                    el(TextControl, {
                                        placeholder: __('Search icons…', 'blockenberg'),
                                        value: iconSearch,
                                        onChange: setIconSearch
                                    })
                                ),
                                // Grid
                                el('div', {
                                    style: {
                                        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
                                        gap: '4px', maxHeight: '280px', overflowY: 'auto',
                                        padding: '8px 12px 12px'
                                    }
                                },
                                    filteredDashicons.length === 0
                                        ? el('p', {
                                            style: {
                                                gridColumn: '1 / -1', textAlign: 'center',
                                                color: '#666', padding: '20px 0'
                                            }
                                        }, __('No icons found', 'blockenberg'))
                                        : filteredDashicons.map(function (icon) {
                                            var isActive = (dashiconV === icon);
                                            return el('button', {
                                                key: icon,
                                                type: 'button',
                                                style: {
                                                    width: '36px', height: '36px',
                                                    display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: isActive ? '2px solid #007cba' : '1px solid transparent',
                                                    borderRadius: '4px',
                                                    background: isActive ? '#e6f3ff' : 'transparent',
                                                    cursor: 'pointer', padding: 0
                                                },
                                                onClick: function () {
                                                    props.onChangeDashicon(icon);
                                                    setPickerOpen(false);
                                                    setIconSearch('');
                                                },
                                                title: icon
                                            },
                                                el('span', {
                                                    className: 'dashicons dashicons-' + icon,
                                                    style: { fontSize: '20px', width: '20px', height: '20px' }
                                                })
                                            );
                                        })
                                )
                            )
                        )
                    ),

                    // ── Dashicon color ────────────────────────────────────────
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' } },
                        el('label', { style: { fontSize: '11px', fontWeight: 500 } }, __('Icon Color', 'blockenberg')),
                        el('input', {
                            type: 'color',
                            value: dashiconColor || '#000000',
                            onChange: function (e) { props.onChangeColor(e.target.value); },
                            style: { width: '32px', height: '24px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0 }
                        }),
                        dashiconColor && el(Button, {
                            isSmall: true, variant: 'tertiary',
                            onClick: function () { props.onChangeColor(''); },
                            style: { fontSize: '11px' }
                        }, __('Reset', 'blockenberg'))
                    )
                ),

                // ── Inline preview for built-in SVG icons ────────────────────
                showPreview && iconType !== 'none' && iconType !== 'custom-image' &&
                iconType !== 'dashicon' && iconType !== 'custom-char' &&
                el('div', {
                    style: { marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }
                },
                    el('span', { style: { display: 'inline-flex', width: '24px', height: '24px', fontSize: '24px' } },
                        builtInIcons[iconType] || builtInIcons.check
                    ),
                    el('span', { style: { fontSize: '12px', color: '#666' } },
                        __('Preview', 'blockenberg')
                    )
                )
            );
        };

        // ── Build editor icon (React element for live preview) ────────────────
        // 5th param: string → dashiconColor, object → { dashiconColor, style, className }
        buildEditorIcon = function (type, customChar, dashicon, imageUrl, extra) {
            if (!type || type === 'none') return null;

            var dashiconColor = '';
            var wrapStyle = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 };
            var wrapClass = 'bkbg-icon-el';

            if (typeof extra === 'string') {
                dashiconColor = extra;
            } else if (extra && typeof extra === 'object') {
                dashiconColor = extra.dashiconColor || '';
                if (extra.className) wrapClass += ' ' + extra.className;
                if (extra.style) { var es = extra.style; for (var k in es) { if (es.hasOwnProperty(k)) wrapStyle[k] = es[k]; } }
            }

            var inner;

            if (type === 'custom-image') {
                if (!imageUrl) return null;
                inner = el('img', {
                    src: imageUrl, alt: '', className: 'bkbg-icon-img',
                    style: { width: '1em', height: '1em', objectFit: 'contain', display: 'block' }
                });
            } else if (type === 'custom-char') {
                inner = customChar || '→';
            } else if (type === 'dashicon') {
                inner = el('span', {
                    className: 'dashicons dashicons-' + (dashicon || 'star-filled'),
                    style: { fontSize: 'inherit', width: '1em', height: '1em', lineHeight: 1, color: dashiconColor || undefined }
                });
            } else if (builtInIcons[type]) {
                inner = builtInIcons[type];
            } else {
                inner = builtInIcons.check;
            }

            return el('span', {
                className: wrapClass, 'aria-hidden': 'true', style: wrapStyle
            }, inner);
        };

        // ── Build save icon (React element for static save) ───────────────────
        // 5th param: string → dashiconColor, object → { dashiconColor }
        buildSaveIcon = function (type, customChar, dashicon, imageUrl, extra) {
            if (!type || type === 'none') return null;

            var dashiconColor = typeof extra === 'string' ? extra : (extra && extra.dashiconColor) || '';
            var inner;
            if (type === 'custom-image') {
                if (!imageUrl) return null;
                inner = el('img', {
                    src: imageUrl, alt: '', className: 'bkbg-icon-img',
                    style: { width: '1em', height: '1em', objectFit: 'contain', display: 'block' }
                });
            } else if (type === 'custom-char') {
                inner = el('span', { className: 'bkbg-icon-char' }, customChar || '→');
            } else if (type === 'dashicon') {
                inner = el('span', {
                    className: 'dashicons dashicons-' + (dashicon || 'star-filled'),
                    style: { fontSize: 'inherit', width: '1em', height: '1em', lineHeight: 1, color: dashiconColor || undefined }
                });
            } else if (type === 'disc') {
                inner = el('svg', {
                    viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg',
                    'aria-hidden': 'true', style: svgStyle
                }, el('circle', { cx: '12', cy: '12', r: '6' }));
            } else if (type === 'square') {
                inner = el('svg', {
                    viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg',
                    'aria-hidden': 'true', style: svgStyle
                }, el('rect', { x: '6', y: '6', width: '12', height: '12', rx: '2' }));
            } else if (svgPaths[type]) {
                inner = el('svg', {
                    viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg',
                    'aria-hidden': 'true', style: svgStyle
                }, el('path', { d: svgPaths[type] }));
            } else {
                inner = el('svg', {
                    viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg',
                    'aria-hidden': 'true', style: svgStyle
                }, el('path', { d: svgPaths.check }));
            }

            return el('span', {
                className: 'bkbg-icon-el', 'aria-hidden': 'true',
                style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }
            }, inner);
        };
    }

    // ── Convenience: standard attribute ↔ prop mapping ──────────────────────────
    // Default mapping:
    //   attr.iconType      → iconType       (override with config.typeAttr)
    //   attr.icon          → customChar     (override with config.charAttr)
    //   attr.iconDashicon  → dashicon       (override with config.dashiconAttr)
    //   attr.iconImageUrl  → imageUrl       (override with config.imageUrlAttr)
    function iconPickerProps(attr, setAttributes, config) {
        var c = config || {};
        var charAttr     = c.charAttr     || 'icon';
        var typeAttr     = c.typeAttr     || 'iconType';
        var dashiconAttr = c.dashiconAttr || 'iconDashicon';
        var imageUrlAttr = c.imageUrlAttr || 'iconImageUrl';
        var colorAttr    = c.colorAttr    || 'iconDashiconColor';

        return {
            iconType:       attr[typeAttr],
            customChar:     attr[charAttr],
            dashicon:       attr[dashiconAttr],
            imageUrl:       attr[imageUrlAttr],
            dashiconColor:  attr[colorAttr] || '',
            onChangeType: function (v) { var u = {}; u[typeAttr] = v; setAttributes(u); },
            onChangeChar: function (v) { var u = {}; u[charAttr] = v; setAttributes(u); },
            onChangeDashicon:  function (v) { var u = {}; u[dashiconAttr] = v; setAttributes(u); },
            onChangeImageUrl:  function (v) { var u = {}; u[imageUrlAttr] = v; setAttributes(u); },
            onChangeColor:     function (v) { var u = {}; u[colorAttr] = v; setAttributes(u); }
        };
    }

    // ── Export ────────────────────────────────────────────────────────────────────
    window.bkbgIconPicker = {
        svgPaths:          svgPaths,
        svgSpecial:        svgSpecial,
        dashicons:         dashicons,
        iconTypeOptions:   iconTypeOptions,
        builtInIcons:      builtInIcons,
        IconPickerControl: IconPickerControl,
        buildEditorIcon:   buildEditorIcon,
        buildSaveIcon:     buildSaveIcon,
        buildFrontendIcon: buildFrontendIcon,
        iconPickerProps:   iconPickerProps
    };

})();
