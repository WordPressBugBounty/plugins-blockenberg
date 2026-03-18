( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;

    var registerBlockType = wp.blocks.registerBlockType;

    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;

    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var Popover = wp.components.Popover;
    var ColorPicker = wp.components.ColorPicker;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function clampMin(n, min) {
        n = parseFloat(n);
        if (isNaN(n)) return min;
        return Math.max(min, n);
    }

    function clone(obj) {
        var out = {};
        for (var k in obj) out[k] = obj[k];
        return out;
    }

    function colorToHex(c) {
        if (!c) return '';
        if (c.hex) return c.hex;
        if (c.rgb) {
            var r = c.rgb;
            var a = typeof r.a === 'number' ? r.a : 1;
            if (a < 1) {
                return 'rgba(' + r.r + ',' + r.g + ',' + r.b + ',' + a + ')';
            }
            return '#' + [r.r, r.g, r.b].map(function (x) {
                var h = x.toString(16);
                return h.length === 1 ? '0' + h : h;
            }).join('');
        }
        return c;
    }

    var SEPARATOR_OPTIONS = [
        { label: '•', value: '•' },
        { label: '|', value: '|' },
        { label: '—', value: '—' },
        { label: '★', value: '★' },
        { label: '◆', value: '◆' },
        { label: '/', value: '/' },
        { label: __('None', 'blockenberg'), value: '' }
    ];

    var TRANSFORM_OPTIONS = [
        { label: __('None', 'blockenberg'), value: 'none' },
        { label: __('Uppercase', 'blockenberg'), value: 'uppercase' },
        { label: __('Lowercase', 'blockenberg'), value: 'lowercase' },
        { label: __('Capitalize', 'blockenberg'), value: 'capitalize' }
    ];

    registerBlockType('blockenberg/marquee', {
        title: __('Marquee / Announcement Bar', 'blockenberg'),
        icon: 'megaphone',
        category: 'bkbg-effects',
        description: __('Scrolling announcement bar with pause on hover and accessibility support.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var isSelected = props.isSelected;

            useEffect(function () {
                if (!a.instanceId) {
                    setAttributes({ instanceId: 'bkbg-mq-' + Math.random().toString(36).slice(2, 10) });
                }
            }, [a.instanceId]);

            var colorPopoverState = useState(null);
            var openColor = colorPopoverState[0];
            var setOpenColor = colorPopoverState[1];

            function updateItem(index, patch) {
                var next = (a.items || []).map(function (it, i) {
                    if (i !== index) return it;
                    var updated = clone(it || {});
                    for (var k in patch) updated[k] = patch[k];
                    return updated;
                });
                setAttributes({ items: next });
            }

            function addItem() {
                var next = (a.items || []).slice();
                next.push({ text: __('New announcement', 'blockenberg'), link: '', newTab: false });
                setAttributes({ items: next });
            }

            function removeItem(index) {
                var arr = (a.items || []).slice();
                if (arr.length <= 1) return;
                arr.splice(index, 1);
                setAttributes({ items: arr });
            }

            function moveItem(index, dir) {
                var arr = (a.items || []).slice();
                var to = index + dir;
                if (to < 0 || to >= arr.length) return;
                var tmp = arr[index];
                arr[index] = arr[to];
                arr[to] = tmp;
                setAttributes({ items: arr });
            }

            var wrapperClass = 'bkbg-marquee-wrap bkbg-editor-wrap';
            if (a.shadow) wrapperClass += ' has-shadow';
            if (a.borderTop) wrapperClass += ' has-border-top';
            if (a.borderBottom) wrapperClass += ' has-border-bottom';
            if (a.reduceMotion) wrapperClass += ' respects-motion';

            var blockProps = useBlockProps((function () {
                var tv = getTypoCssVars();
                var s = {
                    '--bkbg-mq-bg': a.backgroundColor,
                    '--bkbg-mq-color': a.textColor,
                    '--bkbg-mq-link-hover': a.linkHoverColor,
                    '--bkbg-mq-py': a.paddingY + 'px',
                    '--bkbg-mq-px': a.paddingX + 'px',
                    '--bkbg-mq-font-size': a.fontSize + 'px',
                    '--bkbg-mq-font-weight': a.fontWeight,
                    '--bkbg-mq-letter-spacing': a.letterSpacing + 'px',
                    '--bkbg-mq-speed': (a.durationSeconds && a.durationSeconds > 0
                        ? clampMin(a.durationSeconds, 5)
                        : clampMin((150 - (a.speed || 50)), 5)
                    ) + 's',
                    '--bkbg-mq-sep-spacing': a.separatorSpacing + 'px',
                    '--bkbg-mq-border-color': a.borderColor,
                    '--bkbg-mq-border-width': a.borderWidth + 'px',
                    '--bkbg-mq-close-color': a.closeButtonColor
                };
                Object.assign(s, tv(a.textTypo, '--bkbg-mq-tx-'));
                return {
                    className: wrapperClass,
                    style: s,
                    'data-block-label': 'Marquee',
                    'data-instance-id': a.instanceId || undefined,
                    'data-direction': a.direction,
                    'data-pause-hover': a.pauseOnHover ? '1' : '0'
                };
            })());

            function ColorButton(colorKey, label) {
                return el('div', { className: 'bkbg-mq-color-row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } },
                    el('span', {}, label),
                    el('button', {
                        style: { width: 28, height: 28, borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.15)', backgroundColor: a[colorKey], cursor: 'pointer' },
                        onClick: function () { setOpenColor(openColor === colorKey ? null : colorKey); }
                    }),
                    openColor === colorKey && el(Popover, { position: 'bottom left', onClose: function () { setOpenColor(null); } },
                        el(ColorPicker, {
                            color: a[colorKey],
                            onChangeComplete: function (c) {
                                var obj = {};
                                obj[colorKey] = colorToHex(c);
                                setAttributes(obj);
                            }
                        })
                    )
                );
            }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Announcements', 'blockenberg'), initialOpen: true },
                    el('div', { className: 'bkbg-marquee-editor-items' },
                        (a.items || []).map(function (item, index) {
                            return el('div', { key: index, className: 'bkbg-marquee-editor-item' },
                                el('div', { className: 'bkbg-marquee-editor-item-fields' },
                                    el(TextControl, {
                                        label: __('Text', 'blockenberg'),
                                        value: item.text || '',
                                        onChange: function (v) { updateItem(index, { text: v }); }
                                    }),
                                    el(TextControl, {
                                        label: __('Link (optional)', 'blockenberg'),
                                        value: item.link || '',
                                        onChange: function (v) { updateItem(index, { link: v }); },
                                        type: 'url'
                                    }),
                                    item.link && el(ToggleControl, {
                                        label: __('Open in new tab', 'blockenberg'),
                                        checked: !!item.newTab,
                                        __nextHasNoMarginBottom: true,
                                        onChange: function (v) { updateItem(index, { newTab: v }); }
                                    })
                                ),
                                el('div', { className: 'bkbg-marquee-editor-item-actions' },
                                    el(Button, { isSmall: true, icon: 'arrow-up-alt2', label: __('Move up', 'blockenberg'), disabled: index === 0, onClick: function () { moveItem(index, -1); } }),
                                    el(Button, { isSmall: true, icon: 'arrow-down-alt2', label: __('Move down', 'blockenberg'), disabled: index === a.items.length - 1, onClick: function () { moveItem(index, 1); } }),
                                    el(Button, { isSmall: true, icon: 'trash', label: __('Remove', 'blockenberg'), isDestructive: true, disabled: a.items.length <= 1, onClick: function () { removeItem(index); } })
                                )
                            );
                        })
                    ),
                    el(Button, { variant: 'secondary', onClick: addItem }, __('+ Add Announcement', 'blockenberg'))
                ),

                el(PanelBody, { title: __('Animation', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Direction', 'blockenberg'),
                        value: a.direction,
                        options: [
                            { label: __('Left', 'blockenberg'), value: 'left' },
                            { label: __('Right', 'blockenberg'), value: 'right' }
                        ],
                        onChange: function (v) { setAttributes({ direction: v }); }
                    }),
                    el(TextControl, {
                        label: __('Duration (seconds per loop)', 'blockenberg'),
                        type: 'number',
                        value: (typeof a.durationSeconds === 'number' && a.durationSeconds > 0)
                            ? a.durationSeconds
                            : clampMin((150 - (a.speed || 50)), 5),
                        min: 5,
                        step: 0.5,
                        onChange: function (v) { setAttributes({ durationSeconds: clampMin(v, 5) }); },
                        help: __('Lower = faster. Minimum 5s.', 'blockenberg')
                    }),
                    el(ToggleControl, {
                        label: __('Pause on hover', 'blockenberg'),
                        checked: !!a.pauseOnHover,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ pauseOnHover: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Pause on click', 'blockenberg'),
                        checked: !!a.pauseOnClick,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ pauseOnClick: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Respect reduced motion preference', 'blockenberg'),
                        checked: !!a.reduceMotion,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ reduceMotion: v }); },
                        help: __('Stops animation when user has enabled reduced motion in system settings.', 'blockenberg')
                    })
                ),

                el(PanelBody, { title: __('Separator', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show separator', 'blockenberg'),
                        checked: !!a.showSeparator,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showSeparator: v }); }
                    }),
                    a.showSeparator && el(SelectControl, {
                        label: __('Separator style', 'blockenberg'),
                        value: a.separator,
                        options: SEPARATOR_OPTIONS,
                        onChange: function (v) { setAttributes({ separator: v }); }
                    }),
                    a.showSeparator && el(RangeControl, {
                        label: __('Separator spacing', 'blockenberg'),
                        value: a.separatorSpacing,
                        onChange: function (v) { setAttributes({ separatorSpacing: v }); },
                        min: 0,
                        max: 100
                    })
                ),

                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    ColorButton('backgroundColor', __('Background', 'blockenberg')),
                    ColorButton('textColor', __('Text', 'blockenberg')),
                    ColorButton('linkHoverColor', __('Link hover', 'blockenberg'))
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: __('Text', 'blockenberg'), value: a.textTypo || {}, onChange: function (v) { set({ textTypo: v }); } })
                ),

                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Vertical padding', 'blockenberg'),
                        value: a.paddingY,
                        onChange: function (v) { setAttributes({ paddingY: v }); },
                        min: 4,
                        max: 40
                    }),
                    el(RangeControl, {
                        label: __('Horizontal padding', 'blockenberg'),
                        value: a.paddingX,
                        onChange: function (v) { setAttributes({ paddingX: v }); },
                        min: 0,
                        max: 60
                    })
                ),

                el(PanelBody, { title: __('Border & Shadow', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Border top', 'blockenberg'),
                        checked: !!a.borderTop,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ borderTop: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Border bottom', 'blockenberg'),
                        checked: !!a.borderBottom,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ borderBottom: v }); }
                    }),
                    (a.borderTop || a.borderBottom) && el(RangeControl, {
                        label: __('Border width', 'blockenberg'),
                        value: a.borderWidth,
                        onChange: function (v) { setAttributes({ borderWidth: v }); },
                        min: 1,
                        max: 5
                    }),
                    (a.borderTop || a.borderBottom) && ColorButton('borderColor', __('Border color', 'blockenberg')),
                    el(ToggleControl, {
                        label: __('Shadow', 'blockenberg'),
                        checked: !!a.shadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ shadow: v }); }
                    })
                ),

                el(PanelBody, { title: __('Close Button', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show close button', 'blockenberg'),
                        checked: !!a.showCloseButton,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showCloseButton: v }); }
                    }),
                    a.showCloseButton && ColorButton('closeButtonColor', __('Close button color', 'blockenberg')),
                    a.showCloseButton && el(ToggleControl, {
                        label: __('Remember dismissal', 'blockenberg'),
                        checked: !!a.closePersist,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ closePersist: v }); },
                        help: __('Uses a cookie to remember when visitor closes the bar.', 'blockenberg')
                    }),
                    a.showCloseButton && a.closePersist && el(RangeControl, {
                        label: __('Remember for (days)', 'blockenberg'),
                        value: a.closePersistDays,
                        onChange: function (v) { setAttributes({ closePersistDays: v }); },
                        min: 1,
                        max: 365
                    })
                ),

                el(PanelBody, { title: __('Sticky Position', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Sticky', 'blockenberg'),
                        checked: !!a.sticky,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ sticky: v }); }
                    }),
                    a.sticky && el(SelectControl, {
                        label: __('Position', 'blockenberg'),
                        value: a.stickyPosition,
                        options: [
                            { label: __('Top', 'blockenberg'), value: 'top' },
                            { label: __('Bottom', 'blockenberg'), value: 'bottom' }
                        ],
                        onChange: function (v) { setAttributes({ stickyPosition: v }); }
                    }),
                    a.sticky && el(RangeControl, {
                        label: __('Z-index', 'blockenberg'),
                        value: a.stickyZIndex,
                        onChange: function (v) { setAttributes({ stickyZIndex: v }); },
                        min: 1,
                        max: 9999
                    })
                ),

                el(PanelBody, { title: __('Accessibility', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('ARIA label', 'blockenberg'),
                        value: a.ariaLabel,
                        onChange: function (v) { setAttributes({ ariaLabel: v }); },
                        help: __('Describes the region for screen readers.', 'blockenberg')
                    })
                )
            );

            function renderItems() {
                return (a.items || []).map(function (item, index) {
                    var content = el('span', { className: 'bkbg-marquee-item', key: index }, item.text || '');
                    if (a.showSeparator && index < a.items.length - 1) {
                        // When separator is "None" we still keep spacing for readability.
                        return el(Fragment, { key: index },
                            content,
                            a.separator
                                ? el('span', { className: 'bkbg-marquee-separator' }, a.separator)
                                : el('span', { className: 'bkbg-marquee-gap', 'aria-hidden': 'true' })
                        );
                    }
                    return content;
                });
            }

            var content = el('div', blockProps,
                el('div', { className: 'bkbg-marquee-inner' },
                    el('div', { className: 'bkbg-marquee-track' },
                        el('div', { className: 'bkbg-marquee-content' }, renderItems()),
                        el('div', { className: 'bkbg-marquee-content', 'aria-hidden': 'true' }, renderItems())
                    ),
                    a.showCloseButton && el('button', { type: 'button', className: 'bkbg-marquee-close', 'aria-label': __('Close announcement', 'blockenberg') },
                        el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
                            el('path', { d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' })
                        )
                    )
                )
            );

            return el(Fragment, {}, inspector, content);
        },

        save: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var wrapperClass = 'bkbg-marquee-wrap';
            if (a.shadow) wrapperClass += ' has-shadow';
            if (a.borderTop) wrapperClass += ' has-border-top';
            if (a.borderBottom) wrapperClass += ' has-border-bottom';
            if (a.sticky) wrapperClass += ' is-sticky is-sticky-' + a.stickyPosition;
            if (a.reduceMotion) wrapperClass += ' respects-motion';

            var blockProps = useBlockProps.save((function () {
                var tv = getTypoCssVars();
                var s = {
                    '--bkbg-mq-bg': a.backgroundColor,
                    '--bkbg-mq-color': a.textColor,
                    '--bkbg-mq-link-hover': a.linkHoverColor,
                    '--bkbg-mq-py': a.paddingY + 'px',
                    '--bkbg-mq-px': a.paddingX + 'px',
                    '--bkbg-mq-font-size': a.fontSize + 'px',
                    '--bkbg-mq-font-weight': a.fontWeight,
                    '--bkbg-mq-letter-spacing': a.letterSpacing + 'px',
                    '--bkbg-mq-speed': (a.durationSeconds && a.durationSeconds > 0
                        ? clampMin(a.durationSeconds, 5)
                        : clampMin((150 - (a.speed || 50)), 5)
                    ) + 's',
                    '--bkbg-mq-sep-spacing': a.separatorSpacing + 'px',
                    '--bkbg-mq-border-color': a.borderColor,
                    '--bkbg-mq-border-width': a.borderWidth + 'px',
                    '--bkbg-mq-close-color': a.closeButtonColor,
                    '--bkbg-mq-z-index': a.stickyZIndex
                };
                Object.assign(s, tv(a.textTypo, '--bkbg-mq-tx-'));
                return {
                    className: wrapperClass,
                    style: s,
                    'data-instance-id': a.instanceId || undefined,
                    'data-direction': a.direction,
                    'data-pause-hover': a.pauseOnHover ? '1' : '0',
                    'data-pause-click': a.pauseOnClick ? '1' : '0',
                    'data-close-persist': a.closePersist ? '1' : '0',
                    'data-close-persist-days': String(a.closePersistDays),
                    'role': 'region',
                    'aria-label': a.ariaLabel || 'Announcements'
                };
            })());

            function renderItems() {
                return (a.items || []).map(function (item, index) {
                    var Tag = item.link ? 'a' : 'span';
                    var linkProps = item.link ? {
                        href: item.link,
                        target: item.newTab ? '_blank' : undefined,
                        rel: item.newTab ? 'noopener noreferrer' : undefined
                    } : {};

                    var content = el(Tag, Object.assign({ className: 'bkbg-marquee-item', key: index }, linkProps), item.text || '');

                    if (a.showSeparator && index < a.items.length - 1) {
                        return el(Fragment, { key: index },
                            content,
                            a.separator
                                ? el('span', { className: 'bkbg-marquee-separator', 'aria-hidden': 'true' }, a.separator)
                                : el('span', { className: 'bkbg-marquee-gap', 'aria-hidden': 'true' })
                        );
                    }
                    return content;
                });
            }

            return el('div', blockProps,
                el('div', { className: 'bkbg-marquee-inner' },
                    el('div', { className: 'bkbg-marquee-track' },
                        el('div', { className: 'bkbg-marquee-content' }, renderItems())
                    ),
                    a.showCloseButton && el('button', { type: 'button', className: 'bkbg-marquee-close', 'aria-label': __('Close announcement', 'blockenberg') },
                        el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
                            el('path', { d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' })
                        )
                    )
                )
            );
        }
    });
}() );
