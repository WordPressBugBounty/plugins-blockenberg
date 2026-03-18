/**
 * Blockenberg Inspector Tabs
 * Adds General / Advanced tab navigation to all Blockenberg block inspector panels.
 * One file that applies to ALL blockenberg/* blocks via the editor.BlockEdit filter.
 */
(function () {
    'use strict';

    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;
    var useRef = wp.element.useRef;
    var useCallback = wp.element.useCallback;
    var createHigherOrderComponent = wp.compose.createHigherOrderComponent;
    var addFilter = wp.hooks.addFilter;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var PanelBody = wp.components.PanelBody;
    var TabPanel = wp.components.TabPanel;
    var Button = wp.components.Button;
    var Popover = wp.components.Popover;
    var TextControl = wp.components.TextControl;
    var ColorPicker = wp.components.ColorPicker;
    var SelectControl = wp.components.SelectControl;
    var __ = wp.i18n.__;

    /* =====================================================
       Attribute definitions added to every blockenberg/* block
       ===================================================== */

    var SIDES = ['Top', 'Right', 'Bottom', 'Left'];
    var DEVICES = ['', 'Tablet', 'Mobile']; // '' = desktop

    // Build attribute map once
    var advancedAttributes = {};

    // Margin & Padding — per side, per device, with unit
    ['bkbgMargin', 'bkbgPadding'].forEach(function (prefix) {
        SIDES.forEach(function (side) {
            DEVICES.forEach(function (device) {
                var key = prefix + side + device;
                advancedAttributes[key] = { type: 'string', default: '' };
                advancedAttributes[key + 'Unit'] = { type: 'string', default: 'px' };
            });
        });
        // Linked toggle per device
        DEVICES.forEach(function (device) {
            advancedAttributes[prefix + 'Linked' + device] = { type: 'boolean', default: true };
        });
    });

    // Z-Index per device
    DEVICES.forEach(function (device) {
        advancedAttributes['bkbgZIndex' + device] = { type: 'string', default: '' };
    });

    // CSS ID & CSS Classes
    advancedAttributes.bkbgCssId = { type: 'string', default: '' };
    advancedAttributes.bkbgCssClasses = { type: 'string', default: '' };

    /* =====================================================
       Background attributes
       ===================================================== */

    // Background Type (normal & hover)
    advancedAttributes.bkbgBgType = { type: 'string', default: '' };
    advancedAttributes.bkbgBgHoverType = { type: 'string', default: '' };

    // Classic - Normal: Color
    advancedAttributes.bkbgBgColor = { type: 'string', default: '' };

    // Classic - Normal: Image (responsive)
    DEVICES.forEach(function (device) {
        advancedAttributes['bkbgBgImage' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgImageId' + device] = { type: 'number', default: 0 };
    });

    // Classic - Normal: Image settings (position/repeat/size are responsive, attachment is global)
    DEVICES.forEach(function (device) {
        advancedAttributes['bkbgBgPosition' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgRepeat' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgSize' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgSizeCustomW' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgSizeCustomH' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgPositionCustomX' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgPositionCustomY' + device] = { type: 'string', default: '' };
    });
    advancedAttributes.bkbgBgAttachment = { type: 'string', default: '' };

    // Gradient - Normal
    advancedAttributes.bkbgBgGradColor1 = { type: 'string', default: '' };
    advancedAttributes.bkbgBgGradColor2 = { type: 'string', default: '' };
    advancedAttributes.bkbgBgGradType = { type: 'string', default: 'linear' };
    DEVICES.forEach(function (device) {
        advancedAttributes['bkbgBgGradLoc1' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgGradLoc2' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgGradAngle' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgGradPosition' + device] = { type: 'string', default: '' };
    });

    // Classic - Hover: Color
    advancedAttributes.bkbgBgHoverColor = { type: 'string', default: '' };

    // Classic - Hover: Image (responsive)
    DEVICES.forEach(function (device) {
        advancedAttributes['bkbgBgHoverImage' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgHoverImageId' + device] = { type: 'number', default: 0 };
    });

    // Classic - Hover: Image settings
    DEVICES.forEach(function (device) {
        advancedAttributes['bkbgBgHoverPosition' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgHoverRepeat' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgHoverSize' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgHoverSizeCustomW' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgHoverSizeCustomH' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgHoverPositionCustomX' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgHoverPositionCustomY' + device] = { type: 'string', default: '' };
    });
    advancedAttributes.bkbgBgHoverAttachment = { type: 'string', default: '' };

    // Gradient - Hover
    advancedAttributes.bkbgBgHoverGradColor1 = { type: 'string', default: '' };
    advancedAttributes.bkbgBgHoverGradColor2 = { type: 'string', default: '' };
    advancedAttributes.bkbgBgHoverGradType = { type: 'string', default: 'linear' };
    DEVICES.forEach(function (device) {
        advancedAttributes['bkbgBgHoverGradLoc1' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgHoverGradLoc2' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgHoverGradAngle' + device] = { type: 'string', default: '' };
        advancedAttributes['bkbgBgHoverGradPosition' + device] = { type: 'string', default: '' };
    });



    /* =====================================================
       Border attributes
       ===================================================== */

    // Border Type (normal & hover) — not responsive
    advancedAttributes.bkbgBorderType = { type: 'string', default: '' };
    advancedAttributes.bkbgBorderHoverType = { type: 'string', default: '' };

    // Border Width — per side, per device, with unit (same pattern as margin/padding)
    ['bkbgBorderWidth', 'bkbgBorderHoverWidth'].forEach(function (prefix) {
        SIDES.forEach(function (side) {
            DEVICES.forEach(function (device) {
                var key = prefix + side + device;
                advancedAttributes[key] = { type: 'string', default: '' };
                advancedAttributes[key + 'Unit'] = { type: 'string', default: 'px' };
            });
        });
        DEVICES.forEach(function (device) {
            advancedAttributes[prefix + 'Linked' + device] = { type: 'boolean', default: true };
        });
    });

    // Border Color (normal & hover)
    advancedAttributes.bkbgBorderColor = { type: 'string', default: '' };
    advancedAttributes.bkbgBorderHoverColor = { type: 'string', default: '' };

    // Border Radius — per corner, per device, with unit
    ['bkbgBorderRadius', 'bkbgBorderHoverRadius'].forEach(function (prefix) {
        SIDES.forEach(function (side) {
            DEVICES.forEach(function (device) {
                var key = prefix + side + device;
                advancedAttributes[key] = { type: 'string', default: '' };
                advancedAttributes[key + 'Unit'] = { type: 'string', default: 'px' };
            });
        });
        DEVICES.forEach(function (device) {
            advancedAttributes[prefix + 'Linked' + device] = { type: 'boolean', default: true };
        });
    });

    // Box Shadow (normal)
    advancedAttributes.bkbgShadowColor = { type: 'string', default: '' };
    advancedAttributes.bkbgShadowH = { type: 'string', default: '' };
    advancedAttributes.bkbgShadowV = { type: 'string', default: '' };
    advancedAttributes.bkbgShadowBlur = { type: 'string', default: '' };
    advancedAttributes.bkbgShadowSpread = { type: 'string', default: '' };
    advancedAttributes.bkbgShadowPosition = { type: 'string', default: '' };

    // Box Shadow (hover)
    advancedAttributes.bkbgShadowHoverColor = { type: 'string', default: '' };
    advancedAttributes.bkbgShadowHoverH = { type: 'string', default: '' };
    advancedAttributes.bkbgShadowHoverV = { type: 'string', default: '' };
    advancedAttributes.bkbgShadowHoverBlur = { type: 'string', default: '' };
    advancedAttributes.bkbgShadowHoverSpread = { type: 'string', default: '' };
    advancedAttributes.bkbgShadowHoverPosition = { type: 'string', default: '' };



    // Responsive visibility
    advancedAttributes.bkbgHideDesktop = { type: 'boolean', default: false };
    advancedAttributes.bkbgHideTablet = { type: 'boolean', default: false };
    advancedAttributes.bkbgHideMobile = { type: 'boolean', default: false };

    /* =====================================================
       Filter: inject attributes into every blockenberg/* block
       ===================================================== */

    addFilter(
        'blocks.registerBlockType',
        'blockenberg/advanced-layout-attributes',
        function (settings, name) {
            if (!name || name.indexOf('blockenberg/') !== 0) return settings;

            var existing = settings.attributes || {};
            var merged = {};
            var k;
            for (k in existing) { merged[k] = existing[k]; }
            for (k in advancedAttributes) {
                if (!merged[k]) merged[k] = advancedAttributes[k];
            }
            settings.attributes = merged;
            return settings;
        }
    );

    /* =====================================================
       Unit options
       ===================================================== */

    var UNIT_OPTIONS = [
        { label: 'px', value: 'px' },
        { label: '%', value: '%' },
        { label: 'em', value: 'em' },
        { label: 'rem', value: 'rem' },
        { label: 'vw', value: 'vw' }
    ];

    /* =====================================================
       Device icons (SVG)
       ===================================================== */

    function deviceIcon(type, isActive) {
        var color = isActive ? '#e50087' : 'currentColor';
        if (type === 'desktop') {
            return el('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
                el('path', { d: 'M20 3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h6l-1 2H8v2h8v-2h-1l-1-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H4V5h16v10z', fill: color })
            );
        }
        if (type === 'tablet') {
            return el('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
                el('path', { d: 'M18.5 0h-14A2.5 2.5 0 0 0 2 2.5v19A2.5 2.5 0 0 0 4.5 24h14a2.5 2.5 0 0 0 2.5-2.5v-19A2.5 2.5 0 0 0 18.5 0zm-7 23c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7.5-4H4V3h15v16z', fill: color })
            );
        }
        // mobile
        return el('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M15.5 1h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z', fill: color })
        );
    }

    function normalizePreviewDeviceName(raw) {
        if (!raw) return 'desktop';
        var value = String(raw).toLowerCase();
        if (value === 'tablet') return 'tablet';
        if (value === 'mobile') return 'mobile';
        return 'desktop';
    }

    function setEditorPreviewDevice(deviceName) {
        var mapped = deviceName === 'desktop' ? 'Desktop' : (deviceName === 'tablet' ? 'Tablet' : 'Mobile');
        var stores = ['core/edit-post', 'core/edit-site'];

        stores.forEach(function (storeName) {
            var dispatcher = wp.data && wp.data.dispatch ? wp.data.dispatch(storeName) : null;
            if (!dispatcher) return;

            if (typeof dispatcher.__experimentalSetPreviewDeviceType === 'function') {
                dispatcher.__experimentalSetPreviewDeviceType(mapped);
                return;
            }

            if (typeof dispatcher.setDeviceType === 'function') {
                dispatcher.setDeviceType(mapped);
            }
        });
    }

    function getEditorPreviewDevice() {
        var stores = ['core/edit-post', 'core/edit-site'];
        var i;

        for (i = 0; i < stores.length; i++) {
            var selector = wp.data && wp.data.select ? wp.data.select(stores[i]) : null;
            if (!selector) continue;

            if (typeof selector.__experimentalGetPreviewDeviceType === 'function') {
                return normalizePreviewDeviceName(selector.__experimentalGetPreviewDeviceType());
            }

            if (typeof selector.getDeviceType === 'function') {
                return normalizePreviewDeviceName(selector.getDeviceType());
            }
        }

        return 'desktop';
    }

    /* =====================================================
       Responsive Device Switcher Component
       ===================================================== */

    function DeviceSwitcher(props) {
        var device = props.device;
        var onChange = props.onChange;
        var _pop = useState(false);
        var isOpen = _pop[0];
        var setOpen = _pop[1];

        return el('div', { className: 'bkbg-device-switcher' },
            el(Button, {
                className: 'bkbg-device-btn',
                onClick: function () { setOpen(!isOpen); },
                'aria-label': __('Switch device', 'blockenberg')
            }, deviceIcon(device, false)),
            isOpen && el(Popover, {
                position: 'bottom center',
                onClose: function () { setOpen(false); },
                noArrow: true,
                focusOnMount: 'container',
                className: 'bkbg-device-popover'
            },
                el('div', { className: 'bkbg-device-list' },
                    ['desktop', 'tablet', 'mobile'].map(function (d) {
                        return el(Button, {
                            key: d,
                            className: 'bkbg-device-option' + (d === device ? ' is-active' : ''),
                            onClick: function () {
                                onChange(d);
                                setEditorPreviewDevice(d);
                                setOpen(false);
                            }
                        }, deviceIcon(d, d === device));
                    })
                )
            )
        );
    }

    /* =====================================================
       Unit Selector Component
       ===================================================== */

    function UnitSelector(props) {
        var unit = props.unit || 'px';
        var onChange = props.onChange;
        var _pop = useState(false);
        var isOpen = _pop[0];
        var setOpen = _pop[1];

        return el('div', { className: 'bkbg-unit-selector' },
            el(Button, {
                className: 'bkbg-unit-btn',
                onClick: function () { setOpen(!isOpen); }
            },
                el('span', { className: 'bkbg-unit-value' }, unit),
                el('span', {
                    className: 'dashicons dashicons-arrow-down-alt2 bkbg-unit-caret',
                    'aria-hidden': true
                })
            ),
            isOpen && el(Popover, {
                position: 'bottom right',
                onClose: function () { setOpen(false); },
                noArrow: true,
                focusOnMount: 'container',
                className: 'bkbg-unit-popover'
            },
                el('div', { className: 'bkbg-unit-list' },
                    UNIT_OPTIONS.map(function (opt) {
                        return el(Button, {
                            key: opt.value,
                            className: 'bkbg-unit-option' + (opt.value === unit ? ' is-active' : ''),
                            onClick: function () { onChange(opt.value); setOpen(false); }
                        }, opt.label);
                    })
                )
            )
        );
    }

    /* =====================================================
       Spacing Control Component (Margin / Padding)
       ===================================================== */

    function SpacingControl(props) {
        var label = props.label;
        var attrPrefix = props.attrPrefix; // 'bkbgMargin' or 'bkbgPadding'
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;
        var device = props.device || 'desktop';
        var setDevice = props.onDeviceChange;

        var suffix = device === 'desktop' ? '' : (device === 'tablet' ? 'Tablet' : 'Mobile');

        // Get current linked state
        var linkedKey = attrPrefix + 'Linked' + suffix;
        var isLinked = attributes[linkedKey] !== false;

        // Get current unit (use Top as reference)
        var unitKey = attrPrefix + 'Top' + suffix + 'Unit';
        var currentUnit = attributes[unitKey] || 'px';

        // Get side values
        function getSideValue(side) {
            return attributes[attrPrefix + side + suffix] || '';
        }

        function setSideValue(side, value) {
            var updates = {};
            if (isLinked) {
                SIDES.forEach(function (s) {
                    updates[attrPrefix + s + suffix] = value;
                });
            } else {
                updates[attrPrefix + side + suffix] = value;
            }
            setAttributes(updates);
        }

        function setUnit(newUnit) {
            var updates = {};
            SIDES.forEach(function (s) {
                updates[attrPrefix + s + suffix + 'Unit'] = newUnit;
            });
            setAttributes(updates);
        }

        function toggleLinked() {
            var updates = {};
            updates[linkedKey] = !isLinked;
            setAttributes(updates);
        }

        return el('div', { className: 'bkbg-spacing-control' },
            // Header row: label + device + unit
            el('div', { className: 'bkbg-spacing-header' },
                el('span', { className: 'bkbg-spacing-label' }, label),
                el(DeviceSwitcher, { device: device, onChange: setDevice }),
                el(UnitSelector, { unit: currentUnit, onChange: setUnit })
            ),
            // Input row
            el('div', { className: 'bkbg-spacing-inputs' },
                SIDES.map(function (side) {
                    return el('div', { key: side, className: 'bkbg-spacing-side' },
                        el('input', {
                            type: 'number',
                            className: 'bkbg-spacing-input',
                            value: getSideValue(side),
                            placeholder: '',
                            onChange: function (e) {
                                setSideValue(side, e.target.value);
                            }
                        }),
                        el('span', { className: 'bkbg-spacing-side-label' }, side)
                    );
                }),
                el(Button, {
                    className: 'bkbg-link-btn' + (isLinked ? ' is-linked' : ''),
                    onClick: toggleLinked,
                    'aria-label': isLinked ? __('Unlink sides', 'blockenberg') : __('Link sides', 'blockenberg'),
                    icon: 'admin-links'
                })
            )
        );
    }

    /* =====================================================
       Z-Index Control Component
       ===================================================== */

    function ZIndexControl(props) {
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;
        var device = props.device || 'desktop';
        var setDevice = props.onDeviceChange;

        var suffix = device === 'desktop' ? '' : (device === 'tablet' ? 'Tablet' : 'Mobile');
        var attrKey = 'bkbgZIndex' + suffix;

        return el('div', { className: 'bkbg-zindex-control' },
            el('div', { className: 'bkbg-spacing-header' },
                el('span', { className: 'bkbg-spacing-label' }, __('Z-Index', 'blockenberg')),
                el(DeviceSwitcher, { device: device, onChange: setDevice })
            ),
            el('div', { className: 'bkbg-zindex-input-wrap' },
                el('input', {
                    type: 'number',
                    className: 'bkbg-zindex-input',
                    value: attributes[attrKey] || '',
                    placeholder: '',
                    onChange: function (e) {
                        var updates = {};
                        updates[attrKey] = e.target.value;
                        setAttributes(updates);
                    }
                })
            )
        );
    }

    /* =====================================================
       CSS ID / CSS Classes Control Component
       ===================================================== */

    function CssControl(props) {
        var label = props.label;
        var attrKey = props.attrKey;
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;

        return el('div', { className: 'bkbg-css-control' },
            el('div', { className: 'bkbg-spacing-header' },
                el('span', { className: 'bkbg-spacing-label' }, label)
            ),
            el('div', { className: 'bkbg-css-input-wrap' },
                el('input', {
                    type: 'text',
                    className: 'bkbg-css-input',
                    value: attributes[attrKey] || '',
                    placeholder: '',
                    onChange: function (e) {
                        var updates = {};
                        updates[attrKey] = e.target.value;
                        setAttributes(updates);
                    }
                })
            )
        );
    }

    /* =====================================================
       Background Icons (SVG)
       ===================================================== */

    function bgClassicIcon() {
        return el('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', {
                d: 'M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z',
                fill: 'currentColor'
            })
        );
    }

    function bgGradientIcon() {
        return el('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
            el('defs', {},
                el('linearGradient', { id: 'bkbg-grad-icon', x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
                    el('stop', { offset: '0%', stopColor: 'currentColor', stopOpacity: '1' }),
                    el('stop', { offset: '100%', stopColor: 'currentColor', stopOpacity: '0.15' })
                )
            ),
            el('rect', { x: 2, y: 2, width: 20, height: 20, rx: 3, fill: 'url(#bkbg-grad-icon)' })
        );
    }

    /* bgGlobeIcon removed */

    /* =====================================================
       Color Swatch + Popover Picker
       ===================================================== */

    function ColorSwatchControl(props) {
        var color = props.color || '';
        var onChange = props.onChange;
        var label = props.label;
        var _pop = useState(false);
        var isOpen = _pop[0];
        var setOpen = _pop[1];

        return el('div', { className: 'bkbg-color-row' },
            el('span', { className: 'bkbg-spacing-label' }, label),
            el('div', { className: 'bkbg-color-controls' },
                el('button', {
                    className: 'bkbg-color-swatch',
                    onClick: function () { setOpen(!isOpen); },
                    style: { backgroundColor: color || 'transparent' },
                    'aria-label': __('Choose Color', 'blockenberg')
                }),
                isOpen && el(Popover, {
                    placement: 'left-start',
                    offset: 16,
                    onClose: function () { setOpen(false); },
                    noArrow: true,
                    focusOnMount: 'container',
                    shift: true,
                    flip: true,
                    resize: false,
                    className: 'bkbg-color-popover'
                },
                    el('div', { className: 'bkbg-color-picker-wrap' },
                        el(ColorPicker, {
                            color: color || '#000000',
                            onChangeComplete: function (val) {
                                if (val && val.hex) {
                                    // Check if has alpha < 1
                                    if (val.rgb && val.rgb.a < 1) {
                                        onChange('rgba(' + val.rgb.r + ',' + val.rgb.g + ',' + val.rgb.b + ',' + val.rgb.a + ')');
                                    } else {
                                        onChange(val.hex);
                                    }
                                }
                            },
                            onChange: function (val) {
                                if (typeof val === 'string') {
                                    onChange(val);
                                }
                            }
                        }),
                        color && el(Button, {
                            className: 'bkbg-color-clear',
                            isSmall: true,
                            variant: 'secondary',
                            onClick: function () { onChange(''); setOpen(false); }
                        }, __('Clear', 'blockenberg'))
                    )
                )
            )
        );
    }

    /* =====================================================
       Image Upload Control
       ===================================================== */

    function ImageUploadControl(props) {
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;
        var prefix = props.prefix; // 'bkbgBg' or 'bkbgBgHover'
        var device = props.device || 'desktop';
        var onDeviceChange = props.onDeviceChange;

        var suffix = device === 'desktop' ? '' : (device === 'tablet' ? 'Tablet' : 'Mobile');
        var imageKey = prefix + 'Image' + suffix;
        var imageIdKey = prefix + 'ImageId' + suffix;
        var imageUrl = attributes[imageKey] || '';
        var imageId = attributes[imageIdKey] || 0;

        function onSelectImage(media) {
            if (!media || !media.url) return;
            var updates = {};
            updates[imageKey] = media.url;
            updates[imageIdKey] = media.id;
            setAttributes(updates);
        }

        function onRemoveImage() {
            var updates = {};
            updates[imageKey] = '';
            updates[imageIdKey] = 0;
            setAttributes(updates);
        }

        return el('div', { className: 'bkbg-image-control' },
            el('div', { className: 'bkbg-spacing-header' },
                el('span', { className: 'bkbg-spacing-label' }, __('Image', 'blockenberg')),
                el(DeviceSwitcher, { device: device, onChange: onDeviceChange })
            ),
            el(MediaUpload, {
                onSelect: onSelectImage,
                allowedTypes: ['image'],
                value: imageId,
                render: function (obj) {
                    return el('div', { className: 'bkbg-image-upload-area' },
                        imageUrl
                            ? el('div', { className: 'bkbg-image-preview' },
                                el('img', { src: imageUrl, alt: '' }),
                                el('div', { className: 'bkbg-image-actions' },
                                    el(Button, {
                                        className: 'bkbg-image-replace',
                                        isSmall: true,
                                        variant: 'secondary',
                                        onClick: obj.open
                                    }, __('Replace', 'blockenberg')),
                                    el(Button, {
                                        className: 'bkbg-image-remove',
                                        isSmall: true,
                                        isDestructive: true,
                                        onClick: onRemoveImage
                                    }, __('Remove', 'blockenberg'))
                                )
                            )
                            : el('div', { className: 'bkbg-image-placeholder', onClick: obj.open },
                                el('span', { className: 'bkbg-image-plus' }, '+'),
                                el(Button, {
                                    className: 'bkbg-image-choose',
                                    variant: 'secondary',
                                    isSmall: true,
                                    onClick: function (e) { e.stopPropagation(); obj.open(); }
                                }, __('Choose Image', 'blockenberg'))
                            )
                    );
                }
            })
        );
    }

    /* =====================================================
       Range Slider Control (for Location / Angle)
       ===================================================== */

    function RangeSliderControl(props) {
        var label = props.label;
        var value = props.value;
        var onChange = props.onChange;
        var min = props.min || 0;
        var max = props.max || 100;
        var unitLabel = props.unitLabel || '%';
        var device = props.device;
        var onDeviceChange = props.onDeviceChange;
        var showDevice = props.showDevice !== false;

        var numVal = value !== '' && value !== undefined ? parseFloat(value) : '';

        return el('div', { className: 'bkbg-range-control' },
            el('div', { className: 'bkbg-spacing-header' },
                el('span', { className: 'bkbg-spacing-label' }, label),
                showDevice && el(DeviceSwitcher, { device: device, onChange: onDeviceChange }),
                el('span', { className: 'bkbg-range-unit' }, unitLabel)
            ),
            el('div', { className: 'bkbg-range-inputs' },
                el('input', {
                    type: 'range',
                    className: 'bkbg-range-slider',
                    min: min,
                    max: max,
                    value: numVal !== '' ? numVal : min,
                    onChange: function (e) { onChange(e.target.value); }
                }),
                el('input', {
                    type: 'number',
                    className: 'bkbg-range-number',
                    min: min,
                    max: max,
                    value: numVal !== '' ? numVal : '',
                    placeholder: '',
                    onChange: function (e) { onChange(e.target.value); }
                })
            )
        );
    }

    /* =====================================================
       Background Option Arrays
       ===================================================== */

    var BG_POSITION_OPTIONS = [
        { label: __('Default', 'blockenberg'), value: '' },
        { label: __('Center Center', 'blockenberg'), value: 'center center' },
        { label: __('Center Left', 'blockenberg'), value: 'center left' },
        { label: __('Center Right', 'blockenberg'), value: 'center right' },
        { label: __('Top Center', 'blockenberg'), value: 'top center' },
        { label: __('Top Left', 'blockenberg'), value: 'top left' },
        { label: __('Top Right', 'blockenberg'), value: 'top right' },
        { label: __('Bottom Center', 'blockenberg'), value: 'bottom center' },
        { label: __('Bottom Left', 'blockenberg'), value: 'bottom left' },
        { label: __('Bottom Right', 'blockenberg'), value: 'bottom right' },
        { label: __('Custom', 'blockenberg'), value: 'custom' }
    ];

    var BG_ATTACHMENT_OPTIONS = [
        { label: __('Default', 'blockenberg'), value: '' },
        { label: __('Scroll', 'blockenberg'), value: 'scroll' },
        { label: __('Fixed', 'blockenberg'), value: 'fixed' }
    ];

    var BG_REPEAT_OPTIONS = [
        { label: __('Default', 'blockenberg'), value: '' },
        { label: __('No-repeat', 'blockenberg'), value: 'no-repeat' },
        { label: __('Repeat', 'blockenberg'), value: 'repeat' },
        { label: __('Repeat-x', 'blockenberg'), value: 'repeat-x' },
        { label: __('Repeat-y', 'blockenberg'), value: 'repeat-y' }
    ];

    var BG_SIZE_OPTIONS = [
        { label: __('Default', 'blockenberg'), value: '' },
        { label: __('Auto', 'blockenberg'), value: 'auto' },
        { label: __('Cover', 'blockenberg'), value: 'cover' },
        { label: __('Contain', 'blockenberg'), value: 'contain' },
        { label: __('Custom', 'blockenberg'), value: 'custom' }
    ];

    var BG_GRAD_POSITION_OPTIONS = [
        { label: __('Center Center', 'blockenberg'), value: 'center center' },
        { label: __('Center Left', 'blockenberg'), value: 'center left' },
        { label: __('Center Right', 'blockenberg'), value: 'center right' },
        { label: __('Top Center', 'blockenberg'), value: 'top center' },
        { label: __('Top Left', 'blockenberg'), value: 'top left' },
        { label: __('Top Right', 'blockenberg'), value: 'top right' },
        { label: __('Bottom Center', 'blockenberg'), value: 'bottom center' },
        { label: __('Bottom Left', 'blockenberg'), value: 'bottom left' },
        { label: __('Bottom Right', 'blockenberg'), value: 'bottom right' }
    ];

    /* =====================================================
       Dropdown Row Control (label + optional device + select)
       ===================================================== */

    function DropdownRow(props) {
        var label = props.label;
        var value = props.value || '';
        var onChange = props.onChange;
        var options = props.options;
        var device = props.device;
        var onDeviceChange = props.onDeviceChange;
        var showDevice = props.showDevice !== false;

        return el('div', { className: 'bkbg-dropdown-row' },
            el('div', { className: 'bkbg-dropdown-label-side' },
                el('span', { className: 'bkbg-spacing-label' }, label),
                showDevice && device && el(DeviceSwitcher, { device: device, onChange: onDeviceChange })
            ),
            el('div', { className: 'bkbg-dropdown-select-side' },
                el('select', {
                    className: 'bkbg-dropdown-select',
                    value: value,
                    onChange: function (e) { onChange(e.target.value); }
                },
                    options.map(function (opt) {
                        return el('option', { key: opt.value, value: opt.value }, opt.label);
                    })
                )
            )
        );
    }

    /* =====================================================
       Classic Image Settings (Position, Attachment, Repeat, Size)
       ===================================================== */

    function ImageSettingsControls(props) {
        var prefix = props.prefix; // 'bkbgBg' or 'bkbgBgHover'
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;
        var device = props.device;
        var onDeviceChange = props.onDeviceChange;

        var suffix = device === 'desktop' ? '' : (device === 'tablet' ? 'Tablet' : 'Mobile');
        var posKey = prefix + 'Position' + suffix;
        var attachKey = prefix.replace('Hover', 'Hover') + 'Attachment';
        if (prefix === 'bkbgBg') attachKey = 'bkbgBgAttachment';
        else attachKey = 'bkbgBgHoverAttachment';
        var repeatKey = prefix + 'Repeat' + suffix;
        var sizeKey = prefix + 'Size' + suffix;
        var sizeCustomWKey = prefix + 'SizeCustomW' + suffix;
        var sizeCustomHKey = prefix + 'SizeCustomH' + suffix;
        var posCustomXKey = prefix + 'PositionCustomX' + suffix;
        var posCustomYKey = prefix + 'PositionCustomY' + suffix;

        var posValue = attributes[posKey] || '';
        var sizeValue = attributes[sizeKey] || '';

        function setAttrVal(key, val) {
            var u = {};
            u[key] = val;
            setAttributes(u);
        }

        return el(Fragment, {},
            el('div', { className: 'bkbg-adv-separator' }),
            el(DropdownRow, {
                label: __('Position', 'blockenberg'),
                value: posValue,
                options: BG_POSITION_OPTIONS,
                device: device,
                onDeviceChange: onDeviceChange,
                onChange: function (val) { setAttrVal(posKey, val); }
            }),
            posValue === 'custom' && el('div', { className: 'bkbg-custom-pos-row' },
                el('div', { className: 'bkbg-custom-pos-field' },
                    el('span', { className: 'bkbg-custom-pos-lbl' }, 'X'),
                    el('input', {
                        type: 'number',
                        className: 'bkbg-custom-pos-input',
                        value: attributes[posCustomXKey] || '',
                        placeholder: '0',
                        onChange: function (e) { setAttrVal(posCustomXKey, e.target.value); }
                    }),
                    el('span', { className: 'bkbg-custom-pos-unit' }, '%')
                ),
                el('div', { className: 'bkbg-custom-pos-field' },
                    el('span', { className: 'bkbg-custom-pos-lbl' }, 'Y'),
                    el('input', {
                        type: 'number',
                        className: 'bkbg-custom-pos-input',
                        value: attributes[posCustomYKey] || '',
                        placeholder: '0',
                        onChange: function (e) { setAttrVal(posCustomYKey, e.target.value); }
                    }),
                    el('span', { className: 'bkbg-custom-pos-unit' }, '%')
                )
            ),
            el(DropdownRow, {
                label: __('Attachment', 'blockenberg'),
                value: attributes[attachKey] || '',
                options: BG_ATTACHMENT_OPTIONS,
                showDevice: false,
                onChange: function (val) { setAttrVal(attachKey, val); }
            }),
            el(DropdownRow, {
                label: __('Repeat', 'blockenberg'),
                value: attributes[repeatKey] || '',
                options: BG_REPEAT_OPTIONS,
                device: device,
                onDeviceChange: onDeviceChange,
                onChange: function (val) { setAttrVal(repeatKey, val); }
            }),
            el(DropdownRow, {
                label: __('Display Size', 'blockenberg'),
                value: sizeValue,
                options: BG_SIZE_OPTIONS,
                device: device,
                onDeviceChange: onDeviceChange,
                onChange: function (val) { setAttrVal(sizeKey, val); }
            }),
            sizeValue === 'custom' && el('div', { className: 'bkbg-custom-pos-row' },
                el('div', { className: 'bkbg-custom-pos-field' },
                    el('span', { className: 'bkbg-custom-pos-lbl' }, 'W'),
                    el('input', {
                        type: 'number',
                        className: 'bkbg-custom-pos-input',
                        value: attributes[sizeCustomWKey] || '',
                        placeholder: 'auto',
                        onChange: function (e) { setAttrVal(sizeCustomWKey, e.target.value); }
                    }),
                    el('span', { className: 'bkbg-custom-pos-unit' }, 'px')
                ),
                el('div', { className: 'bkbg-custom-pos-field' },
                    el('span', { className: 'bkbg-custom-pos-lbl' }, 'H'),
                    el('input', {
                        type: 'number',
                        className: 'bkbg-custom-pos-input',
                        value: attributes[sizeCustomHKey] || '',
                        placeholder: 'auto',
                        onChange: function (e) { setAttrVal(sizeCustomHKey, e.target.value); }
                    }),
                    el('span', { className: 'bkbg-custom-pos-unit' }, 'px')
                )
            )
        );
    }

    /* =====================================================
       Classic Background Controls
       ===================================================== */

    function ClassicBgControls(props) {
        var prefix = props.prefix; // 'bkbgBg' or 'bkbgBgHover'
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;
        var device = props.device;
        var onDeviceChange = props.onDeviceChange;

        var colorKey = prefix + 'Color';

        // Check if any device has an image set
        var suffix = device === 'desktop' ? '' : (device === 'tablet' ? 'Tablet' : 'Mobile');
        var hasImage = !!(attributes[prefix + 'Image'] || attributes[prefix + 'ImageTablet'] || attributes[prefix + 'ImageMobile']);

        return el(Fragment, {},
            el(ColorSwatchControl, {
                label: __('Color', 'blockenberg'),
                color: attributes[colorKey] || '',
                onChange: function (val) {
                    var updates = {};
                    updates[colorKey] = val;
                    setAttributes(updates);
                }
            }),
            el(ImageUploadControl, {
                prefix: prefix,
                attributes: attributes,
                setAttributes: setAttributes,
                device: device,
                onDeviceChange: onDeviceChange
            }),
            hasImage && el(ImageSettingsControls, {
                prefix: prefix,
                attributes: attributes,
                setAttributes: setAttributes,
                device: device,
                onDeviceChange: onDeviceChange
            })
        );
    }

    /* =====================================================
       Gradient Background Controls
       ===================================================== */

    function GradientBgControls(props) {
        var prefix = props.prefix; // 'bkbgBg' or 'bkbgBgHover'
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;
        var device = props.device;
        var onDeviceChange = props.onDeviceChange;

        var suffix = device === 'desktop' ? '' : (device === 'tablet' ? 'Tablet' : 'Mobile');

        var gradColor1Key = prefix + 'GradColor1';
        var gradColor2Key = prefix + 'GradColor2';
        var gradLoc1Key = prefix + 'GradLoc1' + suffix;
        var gradLoc2Key = prefix + 'GradLoc2' + suffix;
        var gradTypeKey = prefix + 'GradType';
        var gradAngleKey = prefix + 'GradAngle' + suffix;
        var gradPositionKey = prefix + 'GradPosition' + suffix;

        var gradType = attributes[gradTypeKey] || 'linear';

        return el(Fragment, {},
            el('div', { className: 'bkbg-grad-notice' },
                el('span', { className: 'bkbg-grad-notice-icon' }, '\u26A0'),
                el('span', null, __('Set locations and angle for each breakpoint to ensure the gradient adapts to different screen sizes.', 'blockenberg'))
            ),
            el(ColorSwatchControl, {
                label: __('Color', 'blockenberg'),
                color: attributes[gradColor1Key] || '',
                onChange: function (val) {
                    var u = {};
                    u[gradColor1Key] = val;
                    setAttributes(u);
                }
            }),
            el(RangeSliderControl, {
                label: __('Location', 'blockenberg'),
                value: attributes[gradLoc1Key] || '',
                min: 0,
                max: 100,
                unitLabel: '%',
                device: device,
                onDeviceChange: onDeviceChange,
                onChange: function (val) {
                    var u = {};
                    u[gradLoc1Key] = val;
                    setAttributes(u);
                }
            }),
            el(ColorSwatchControl, {
                label: __('Second Color', 'blockenberg'),
                color: attributes[gradColor2Key] || '',
                onChange: function (val) {
                    var u = {};
                    u[gradColor2Key] = val;
                    setAttributes(u);
                }
            }),
            el(RangeSliderControl, {
                label: __('Location', 'blockenberg'),
                value: attributes[gradLoc2Key] || '',
                min: 0,
                max: 100,
                unitLabel: '%',
                device: device,
                onDeviceChange: onDeviceChange,
                onChange: function (val) {
                    var u = {};
                    u[gradLoc2Key] = val;
                    setAttributes(u);
                }
            }),
            el('div', { className: 'bkbg-grad-type-row' },
                el('span', { className: 'bkbg-spacing-label' }, __('Type', 'blockenberg')),
                el('div', { className: 'bkbg-grad-type-select' },
                    el('select', {
                        className: 'bkbg-dropdown-select',
                        value: gradType,
                        onChange: function (e) {
                            var u = {};
                            u[gradTypeKey] = e.target.value;
                            setAttributes(u);
                        }
                    },
                        el('option', { value: 'linear' }, __('Linear', 'blockenberg')),
                        el('option', { value: 'radial' }, __('Radial', 'blockenberg'))
                    )
                )
            ),
            gradType === 'radial' && el(DropdownRow, {
                label: __('Position', 'blockenberg'),
                value: attributes[gradPositionKey] || 'center center',
                options: BG_GRAD_POSITION_OPTIONS,
                device: device,
                onDeviceChange: onDeviceChange,
                onChange: function (val) {
                    var u = {};
                    u[gradPositionKey] = val;
                    setAttributes(u);
                }
            }),
            gradType === 'linear' && el(RangeSliderControl, {
                label: __('Angle', 'blockenberg'),
                value: attributes[gradAngleKey] || '',
                min: 0,
                max: 360,
                unitLabel: 'deg',
                device: device,
                onDeviceChange: onDeviceChange,
                onChange: function (val) {
                    var u = {};
                    u[gradAngleKey] = val;
                    setAttributes(u);
                }
            })
        );
    }

    /* =====================================================
       Background Panel — combines all background controls
       ===================================================== */

    function BackgroundPanel(props) {
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;

        // Shared device state
        var _dev = useState(getEditorPreviewDevice());
        var activeDevice = _dev[0];
        var setActiveDevice = _dev[1];

        useEffect(function () {
            if (!wp.data || typeof wp.data.subscribe !== 'function') return;

            var unsubscribe = wp.data.subscribe(function () {
                var editorDevice = getEditorPreviewDevice();
                setActiveDevice(function (current) {
                    return current === editorDevice ? current : editorDevice;
                });
            });

            return function () {
                if (typeof unsubscribe === 'function') unsubscribe();
            };
        }, []);

        // State tab: normal or hover
        var _stateTab = useState('normal');
        var stateTab = _stateTab[0];
        var setStateTab = _stateTab[1];

        // Determine prefix based on state
        var prefix = stateTab === 'hover' ? 'bkbgBgHover' : 'bkbgBg';
        var typeKey = prefix + 'Type';
        var bgType = attributes[typeKey] || '';

        return el(Fragment, {},
            // Normal / Hover toggle
            el('div', { className: 'bkbg-bg-state-tabs' },
                el(Button, {
                    className: 'bkbg-bg-state-tab' + (stateTab === 'normal' ? ' is-active' : ''),
                    onClick: function () { setStateTab('normal'); }
                }, __('Normal', 'blockenberg')),
                el(Button, {
                    className: 'bkbg-bg-state-tab' + (stateTab === 'hover' ? ' is-active' : ''),
                    onClick: function () { setStateTab('hover'); }
                }, __('Hover', 'blockenberg'))
            ),

            // Background Type: Classic / Gradient
            el('div', { className: 'bkbg-bg-type-row' },
                el('span', { className: 'bkbg-spacing-label' }, __('Background Type', 'blockenberg')),
                el('div', { className: 'bkbg-bg-type-buttons' },
                    el(Button, {
                        className: 'bkbg-bg-type-btn' + (bgType === 'classic' ? ' is-active' : ''),
                        onClick: function () {
                            var u = {};
                            u[typeKey] = bgType === 'classic' ? '' : 'classic';
                            setAttributes(u);
                        },
                        'aria-label': __('Classic', 'blockenberg')
                    }, bgClassicIcon()),
                    el(Button, {
                        className: 'bkbg-bg-type-btn' + (bgType === 'gradient' ? ' is-active' : ''),
                        onClick: function () {
                            var u = {};
                            u[typeKey] = bgType === 'gradient' ? '' : 'gradient';
                            setAttributes(u);
                        },
                        'aria-label': __('Gradient', 'blockenberg')
                    }, bgGradientIcon())
                )
            ),

            // Controls based on type
            bgType === 'classic' && el(ClassicBgControls, {
                prefix: prefix,
                attributes: attributes,
                setAttributes: setAttributes,
                device: activeDevice,
                onDeviceChange: setActiveDevice
            }),
            bgType === 'gradient' && el(GradientBgControls, {
                prefix: prefix,
                attributes: attributes,
                setAttributes: setAttributes,
                device: activeDevice,
                onDeviceChange: setActiveDevice
            }),

        );
    }

    /* =====================================================
       Border Option Arrays
       ===================================================== */

    var BORDER_TYPE_OPTIONS = [
        { label: __('Default', 'blockenberg'), value: '' },
        { label: __('None', 'blockenberg'), value: 'none' },
        { label: __('Solid', 'blockenberg'), value: 'solid' },
        { label: __('Double', 'blockenberg'), value: 'double' },
        { label: __('Dotted', 'blockenberg'), value: 'dotted' },
        { label: __('Dashed', 'blockenberg'), value: 'dashed' },
        { label: __('Groove', 'blockenberg'), value: 'groove' }
    ];

    var SHADOW_POSITION_OPTIONS = [
        { label: __('Outline', 'blockenberg'), value: '' },
        { label: __('Inset', 'blockenberg'), value: 'inset' }
    ];

    /* =====================================================
       Box Shadow Controls (expandable via pencil icon)
       ===================================================== */

    function BoxShadowControl(props) {
        var prefix = props.prefix; // 'bkbgShadow' or 'bkbgShadowHover'
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;

        var _open = useState(false);
        var isOpen = _open[0];
        var setOpen = _open[1];

        var colorKey = prefix + 'Color';
        var hKey = prefix + 'H';
        var vKey = prefix + 'V';
        var blurKey = prefix + 'Blur';
        var spreadKey = prefix + 'Spread';
        var posKey = prefix + 'Position';

        var hasValues = !!(attributes[colorKey] || attributes[hKey] || attributes[vKey] ||
            attributes[blurKey] || attributes[spreadKey]);

        function resetShadow() {
            var u = {};
            u[colorKey] = '';
            u[hKey] = '';
            u[vKey] = '';
            u[blurKey] = '';
            u[spreadKey] = '';
            u[posKey] = '';
            setAttributes(u);
        }

        function setVal(key, val) {
            var u = {};
            u[key] = val;
            setAttributes(u);
        }

        return el('div', { className: 'bkbg-shadow-control' },
            el('div', { className: 'bkbg-shadow-header' },
                el('span', { className: 'bkbg-spacing-label' }, __('Box Shadow', 'blockenberg')),
                el('div', { className: 'bkbg-shadow-actions' },
                    hasValues && el(Button, {
                        className: 'bkbg-shadow-reset-btn',
                        onClick: resetShadow,
                        'aria-label': __('Reset', 'blockenberg')
                    }, el('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none' },
                        el('path', { d: 'M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z', fill: 'currentColor' })
                    )),
                    el(Button, {
                        className: 'bkbg-shadow-toggle-btn' + (isOpen ? ' is-active' : ''),
                        onClick: function () { setOpen(!isOpen); },
                        'aria-label': __('Edit Shadow', 'blockenberg')
                    }, el('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none' },
                        el('path', { d: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z', fill: 'currentColor' })
                    ))
                )
            ),
            isOpen && el('div', { className: 'bkbg-shadow-body' },
                el(ColorSwatchControl, {
                    label: __('Color', 'blockenberg'),
                    color: attributes[colorKey] || '',
                    onChange: function (val) { setVal(colorKey, val); }
                }),
                el(RangeSliderControl, {
                    label: __('Horizontal', 'blockenberg'),
                    value: attributes[hKey] || '',
                    min: -50,
                    max: 50,
                    unitLabel: 'px',
                    showDevice: false,
                    onChange: function (val) { setVal(hKey, val); }
                }),
                el(RangeSliderControl, {
                    label: __('Vertical', 'blockenberg'),
                    value: attributes[vKey] || '',
                    min: -50,
                    max: 50,
                    unitLabel: 'px',
                    showDevice: false,
                    onChange: function (val) { setVal(vKey, val); }
                }),
                el(RangeSliderControl, {
                    label: __('Blur', 'blockenberg'),
                    value: attributes[blurKey] || '',
                    min: 0,
                    max: 100,
                    unitLabel: 'px',
                    showDevice: false,
                    onChange: function (val) { setVal(blurKey, val); }
                }),
                el(RangeSliderControl, {
                    label: __('Spread', 'blockenberg'),
                    value: attributes[spreadKey] || '',
                    min: -50,
                    max: 50,
                    unitLabel: 'px',
                    showDevice: false,
                    onChange: function (val) { setVal(spreadKey, val); }
                }),
                el(DropdownRow, {
                    label: __('Position', 'blockenberg'),
                    value: attributes[posKey] || '',
                    options: SHADOW_POSITION_OPTIONS,
                    showDevice: false,
                    onChange: function (val) { setVal(posKey, val); }
                })
            )
        );
    }

    /* =====================================================
       Border Panel — combines all border controls
       ===================================================== */

    function BorderPanel(props) {
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;

        // Shared device state
        var _dev = useState(getEditorPreviewDevice());
        var activeDevice = _dev[0];
        var setActiveDevice = _dev[1];

        useEffect(function () {
            if (!wp.data || typeof wp.data.subscribe !== 'function') return;
            var unsubscribe = wp.data.subscribe(function () {
                var editorDevice = getEditorPreviewDevice();
                setActiveDevice(function (current) {
                    return current === editorDevice ? current : editorDevice;
                });
            });
            return function () {
                if (typeof unsubscribe === 'function') unsubscribe();
            };
        }, []);

        // State tab: normal or hover
        var _stateTab = useState('normal');
        var stateTab = _stateTab[0];
        var setStateTab = _stateTab[1];

        var isHover = stateTab === 'hover';
        var typeKey = isHover ? 'bkbgBorderHoverType' : 'bkbgBorderType';
        var borderType = attributes[typeKey] || '';
        var showBorderControls = borderType && borderType !== 'none';
        var widthPrefix = isHover ? 'bkbgBorderHoverWidth' : 'bkbgBorderWidth';
        var colorKey = isHover ? 'bkbgBorderHoverColor' : 'bkbgBorderColor';
        var radiusPrefix = isHover ? 'bkbgBorderHoverRadius' : 'bkbgBorderRadius';
        var shadowPrefix = isHover ? 'bkbgShadowHover' : 'bkbgShadow';

        return el(Fragment, {},
            // Normal / Hover toggle
            el('div', { className: 'bkbg-bg-state-tabs' },
                el(Button, {
                    className: 'bkbg-bg-state-tab' + (stateTab === 'normal' ? ' is-active' : ''),
                    onClick: function () { setStateTab('normal'); }
                }, __('Normal', 'blockenberg')),
                el(Button, {
                    className: 'bkbg-bg-state-tab' + (stateTab === 'hover' ? ' is-active' : ''),
                    onClick: function () { setStateTab('hover'); }
                }, __('Hover', 'blockenberg'))
            ),

            // Border Type
            el(DropdownRow, {
                label: __('Border Type', 'blockenberg'),
                value: borderType,
                options: BORDER_TYPE_OPTIONS,
                showDevice: false,
                onChange: function (val) {
                    var u = {};
                    u[typeKey] = val;
                    setAttributes(u);
                }
            }),

            // Border Width (only when type is set and not none)
            showBorderControls && el(SpacingControl, {
                label: __('Border Width', 'blockenberg'),
                attrPrefix: widthPrefix,
                attributes: attributes,
                setAttributes: setAttributes,
                device: activeDevice,
                onDeviceChange: setActiveDevice
            }),

            // Border Color (only when type is set and not none)
            showBorderControls && el(ColorSwatchControl, {
                label: __('Border Color', 'blockenberg'),
                color: attributes[colorKey] || '',
                onChange: function (val) {
                    var u = {};
                    u[colorKey] = val;
                    setAttributes(u);
                }
            }),

            // Border Radius (always visible)
            el(SpacingControl, {
                label: __('Border Radius', 'blockenberg'),
                attrPrefix: radiusPrefix,
                attributes: attributes,
                setAttributes: setAttributes,
                device: activeDevice,
                onDeviceChange: setActiveDevice
            }),

            // Box Shadow
            el('div', { className: 'bkbg-adv-separator' }),
            el(BoxShadowControl, {
                prefix: shadowPrefix,
                attributes: attributes,
                setAttributes: setAttributes
            }),

        );
    }

    /* =====================================================
       Responsive Panel — device visibility toggles
       ===================================================== */

    function ResponsivePanel(props) {
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;

        var toggles = [
            { label: 'Hide On Desktop', attr: 'bkbgHideDesktop' },
            { label: 'Hide On Tablet Portrait', attr: 'bkbgHideTablet' },
            { label: 'Hide On Mobile Portrait', attr: 'bkbgHideMobile' }
        ];

        return el(Fragment, {},
            el('p', {
                className: 'bkbg-responsive-notice',
                style: { fontStyle: 'italic', color: '#666', fontSize: '13px', lineHeight: '1.5', margin: '0 0 16px' }
            },
                'Responsive visibility will take effect only on ',
                el('strong', { style: { color: '#1e40af' } }, 'preview mode'),
                ' or live page, and not while editing in the editor.'
            ),
            toggles.map(function (item) {
                var isHidden = !!attributes[item.attr];
                return el('div', {
                    key: item.attr,
                    className: 'bkbg-responsive-row'
                },
                    el('span', { className: 'bkbg-responsive-label' }, item.label),
                    el('div', {
                        className: 'bkbg-responsive-toggle' + (isHidden ? ' is-active' : ''),
                        onClick: function () {
                            var obj = {};
                            obj[item.attr] = !isHidden;
                            setAttributes(obj);
                        },
                        role: 'button',
                        tabIndex: 0
                    },
                        el('div', { className: 'bkbg-toggle-track' },
                            el('div', { className: 'bkbg-toggle-thumb' })
                        ),
                        el('span', { className: 'bkbg-toggle-label' }, isHidden ? 'Hide' : 'Show')
                    )
                );
            })
        );
    }

    /* =====================================================
       Layout Panel — combines all controls
       ===================================================== */

    function LayoutPanel(props) {
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;
        var _dev = useState(getEditorPreviewDevice());
        var activeDevice = _dev[0];
        var setActiveDevice = _dev[1];

        useEffect(function () {
            if (!wp.data || typeof wp.data.subscribe !== 'function') return;

            var unsubscribe = wp.data.subscribe(function () {
                var editorDevice = getEditorPreviewDevice();
                setActiveDevice(function (current) {
                    return current === editorDevice ? current : editorDevice;
                });
            });

            return function () {
                if (typeof unsubscribe === 'function') unsubscribe();
            };
        }, []);

        return el(Fragment, {},
            el(SpacingControl, {
                label: __('Margin', 'blockenberg'),
                attrPrefix: 'bkbgMargin',
                attributes: attributes,
                setAttributes: setAttributes,
                device: activeDevice,
                onDeviceChange: setActiveDevice
            }),
            el(SpacingControl, {
                label: __('Padding', 'blockenberg'),
                attrPrefix: 'bkbgPadding',
                attributes: attributes,
                setAttributes: setAttributes,
                device: activeDevice,
                onDeviceChange: setActiveDevice
            }),
            el('div', { className: 'bkbg-adv-separator' }),
            el(ZIndexControl, {
                attributes: attributes,
                setAttributes: setAttributes,
                device: activeDevice,
                onDeviceChange: setActiveDevice
            }),
            el('div', { className: 'bkbg-adv-separator' }),
            el(CssControl, {
                label: __('CSS ID', 'blockenberg'),
                attrKey: 'bkbgCssId',
                attributes: attributes,
                setAttributes: setAttributes
            }),
            el(CssControl, {
                label: __('CSS Classes', 'blockenberg'),
                attrKey: 'bkbgCssClasses',
                attributes: attributes,
                setAttributes: setAttributes
            })
        );
    }

    /* =====================================================
       HOC – inject General / Advanced tabs
       ===================================================== */

    var withAdvancedInspector = createHigherOrderComponent(function (BlockEdit) {
        return function (props) {
            if (!props.name || props.name.indexOf('blockenberg/') !== 0) {
                return el(BlockEdit, props);
            }

            var _tab = useState('general');
            var activeTab = _tab[0];
            var setActiveTab = _tab[1];
            var wrapRef = useRef(null);
            var attrsRef = useRef(props.attributes);
            var previewDeviceRef = useRef(getEditorPreviewDevice());

            useEffect(function () {
                attrsRef.current = props.attributes;
            }, [props.attributes]);

            useEffect(function () {
                setActiveTab('general');
            }, [props.clientId]);

            useEffect(function () {
                var node = wrapRef.current;
                if (!node) return;
                var inspector = node.closest('.block-editor-block-inspector');
                if (!inspector) return;
                inspector.setAttribute('data-bkbg-tab', activeTab);
                return function () {
                    inspector.removeAttribute('data-bkbg-tab');
                };
            }, [activeTab, props.isSelected]);

            // Live preview: apply responsive layout styles to the block wrapper in editor
            useEffect(function () {
                // Small delay to ensure block DOM is rendered
                var timer = setTimeout(function () {
                    applyEditorStyles(props.clientId, props.attributes);
                }, 50);
                return function () {
                    clearTimeout(timer);
                    // Clean up background <style> tag when unmounting
                    var styleId = 'bkbg-bg-' + props.clientId;
                    var styleEl = document.getElementById(styleId);
                    if (styleEl) styleEl.remove();
                    // Also check inside iframe
                    var iframe = document.querySelector('iframe[name="editor-canvas"]');
                    if (iframe && iframe.contentDocument) {
                        var iframeStyle = iframe.contentDocument.getElementById(styleId);
                        if (iframeStyle) iframeStyle.remove();
                    }
                };
            }, [props.clientId, props.attributes]);

            useEffect(function () {
                if (!wp.data || typeof wp.data.subscribe !== 'function') return;

                var unsubscribe = wp.data.subscribe(function () {
                    var currentDevice = getEditorPreviewDevice();
                    if (currentDevice === previewDeviceRef.current) return;

                    previewDeviceRef.current = currentDevice;
                    applyEditorStyles(props.clientId, attrsRef.current || {});
                });

                return function () {
                    if (typeof unsubscribe === 'function') unsubscribe();
                };
            }, [props.clientId]);

            var tabs = [
                { name: 'general', title: __('General', 'blockenberg') },
                { name: 'advanced', title: __('Advanced', 'blockenberg') }
            ];

            return el(Fragment, {},
                el(InspectorControls, {},
                    el('div', {
                        ref: wrapRef,
                        className: 'bkbg-inspector-tabs-wrap'
                    },
                        el(TabPanel, {
                            key: 'bkbg-tabs-' + props.clientId,
                            className: 'bkbg-inspector-tab-panel',
                            activeClass: 'is-active',
                            tabs: tabs,
                            onSelect: function (tabName) {
                                setActiveTab(tabName);
                                var node = wrapRef.current;
                                if (node) {
                                    var insp = node.closest('.block-editor-block-inspector');
                                    if (insp) {
                                        insp.setAttribute('data-bkbg-tab', tabName);
                                    }
                                }
                            }
                        }, function (tab) {
                            if (tab.name === 'advanced') {
                                return el('div', { className: 'bkbg-advanced-panels' },
                                    el('div', { className: 'bkbg-advanced-header' },
                                        __('Advanced Styles', 'blockenberg')
                                    ),
                                    el(PanelBody, {
                                        title: __('Layout', 'blockenberg'),
                                        initialOpen: true,
                                        className: 'bkbg-adv-panel'
                                    },
                                        el(LayoutPanel, {
                                            attributes: props.attributes,
                                            setAttributes: props.setAttributes
                                        })
                                    ),
                                    el(PanelBody, {
                                        title: __('Background', 'blockenberg'),
                                        initialOpen: false,
                                        className: 'bkbg-adv-panel'
                                    },
                                        el(BackgroundPanel, {
                                            attributes: props.attributes,
                                            setAttributes: props.setAttributes
                                        })
                                    ),
                                    el(PanelBody, {
                                        title: __('Border', 'blockenberg'),
                                        initialOpen: false,
                                        className: 'bkbg-adv-panel'
                                    },
                                        el(BorderPanel, {
                                            attributes: props.attributes,
                                            setAttributes: props.setAttributes
                                        })
                                    ),
                                    el(PanelBody, {
                                        title: __('Responsive', 'blockenberg'),
                                        initialOpen: false,
                                        className: 'bkbg-adv-panel'
                                    },
                                        el(ResponsivePanel, {
                                            attributes: props.attributes,
                                            setAttributes: props.setAttributes
                                        })
                                    )
                                );
                            }
                            return null;
                        })
                    )
                ),
                el(BlockEdit, props)
            );
        };
    }, 'withAdvancedInspector');

    addFilter(
        'editor.BlockEdit',
        'blockenberg/advanced-inspector',
        withAdvancedInspector
    );

    /* =====================================================
       Helpers: compute responsive value strings for editor
       ===================================================== */

    function buildValue(attrs, prefix, side, suffix) {
        var val = attrs[prefix + side + suffix];
        var unit = attrs[prefix + side + suffix + 'Unit'] || 'px';
        if (!val && val !== 0) return '';
        var v = String(val).trim();
        if (!v) return '';
        return v + unit;
    }

    function getEditorSpacingValue(attrs, prefix, side, device) {
        if (device === 'mobile') {
            return buildValue(attrs, prefix, side, 'Mobile')
                || buildValue(attrs, prefix, side, 'Tablet')
                || buildValue(attrs, prefix, side, '');
        }

        if (device === 'tablet') {
            return buildValue(attrs, prefix, side, 'Tablet')
                || buildValue(attrs, prefix, side, '');
        }

        return buildValue(attrs, prefix, side, '');
    }

    function getEditorZIndexValue(attrs, device) {
        if (device === 'mobile') {
            return attrs.bkbgZIndexMobile || attrs.bkbgZIndexTablet || attrs.bkbgZIndex || '';
        }

        if (device === 'tablet') {
            return attrs.bkbgZIndexTablet || attrs.bkbgZIndex || '';
        }

        return attrs.bkbgZIndex || '';
    }

        /* =====================================================
             Editor live preview via useEffect in the HOC
             – finds block wrapper element(s) in editor DOM
                 (handles both iframed and non-iframed editors)
                 and applies responsive margin/padding/z-index inline.
             ===================================================== */

        function findBlockNode(clientId) {
        var sel = '[data-block="' + clientId + '"]';
        // Iframed editor (Site Editor / newer WP)
        var iframe = document.querySelector('iframe[name="editor-canvas"]');
        if (iframe && iframe.contentDocument) {
            var n = iframe.contentDocument.querySelector(sel);
            if (n) return n;
        }
        // Classic / non-iframed editor
        return document.querySelector(sel);
    }

    function getEditorStyleTargets(clientId) {
        var targets = [];
        var wrapper = findBlockNode(clientId);
        if (!wrapper) return targets;

        targets.push(wrapper);

        return targets;
    }

    function setImportantStyle(node, prop, value) {
        if (!node || !node.style) return;
        if (value || value === 0) {
            node.style.setProperty(prop, String(value), 'important');
        } else {
            node.style.removeProperty(prop);
        }
    }

    function getResponsiveBgProp(attrs, prefix, prop, device) {
        var suffix = device === 'desktop' ? '' : (device === 'tablet' ? 'Tablet' : 'Mobile');
        var val = attrs[prefix + prop + suffix] || '';
        if (!val && suffix) val = attrs[prefix + prop] || '';
        return val;
    }

    function applyEditorSpacingStyleTag(clientId, attrs, wrapper) {
        if (!wrapper) return;
        var doc = wrapper.ownerDocument;
        var styleId = 'bkbg-space-' + clientId;
        var existing = doc.getElementById(styleId);

        var device = getEditorPreviewDevice();
        var mt = getEditorSpacingValue(attrs, 'bkbgMargin', 'Top', device);
        var mr = getEditorSpacingValue(attrs, 'bkbgMargin', 'Right', device);
        var mb = getEditorSpacingValue(attrs, 'bkbgMargin', 'Bottom', device);
        var ml = getEditorSpacingValue(attrs, 'bkbgMargin', 'Left', device);

        var pt = getEditorSpacingValue(attrs, 'bkbgPadding', 'Top', device);
        var pr = getEditorSpacingValue(attrs, 'bkbgPadding', 'Right', device);
        var pb = getEditorSpacingValue(attrs, 'bkbgPadding', 'Bottom', device);
        var pl = getEditorSpacingValue(attrs, 'bkbgPadding', 'Left', device);

        var zi = getEditorZIndexValue(attrs, device);

        var rules = [];
        if (mt) rules.push('margin-top:' + mt + ' !important');
        if (mr) rules.push('margin-right:' + mr + ' !important');
        if (mb) rules.push('margin-bottom:' + mb + ' !important');
        if (ml) rules.push('margin-left:' + ml + ' !important');

        if (pt) rules.push('padding-top:' + pt + ' !important');
        if (pr) rules.push('padding-right:' + pr + ' !important');
        if (pb) rules.push('padding-bottom:' + pb + ' !important');
        if (pl) rules.push('padding-left:' + pl + ' !important');

        if (zi || zi === 0 || zi === '0') {
            var z = String(zi).trim();
            if (z) {
                rules.push('z-index:' + z + ' !important');
                rules.push('position:relative !important');
            }
        }

        if (!rules.length) {
            if (existing) existing.remove();
            return;
        }

        if (!existing) {
            existing = doc.createElement('style');
            existing.id = styleId;
            doc.head.appendChild(existing);
        }

        var sel = '[data-block="' + clientId + '"]';
        existing.textContent = sel + '{' + rules.join(';') + '}';
    }

    function applyEditorStyles(clientId, attrs) {
        var nodes = getEditorStyleTargets(clientId);
        if (!nodes.length) return;

        // Spacing & z-index are applied only when set in Advanced.
        // This avoids stripping block-provided inline styles by default.
        applyEditorSpacingStyleTag(clientId, attrs, nodes[0]);

        // Background styles via <style> tag so :hover can properly override
        applyEditorBgStyleTag(clientId, attrs, nodes[0]);
    }

    function buildBgRulesForPrefix(attrs, prefix, device) {
        var rules = [];
        var typeKey = prefix + 'Type';
        var bgType = attrs[typeKey] || '';

        if (bgType === 'classic') {
            var cColor = attrs[prefix + 'Color'] || '';
            if (cColor) rules.push('background-color:' + cColor + ' !important');
            var cImg = getResponsiveBgProp(attrs, prefix, 'Image', device);
            if (cImg) {
                rules.push('background-image:url(' + cImg + ') !important');
                var pos = getResponsiveBgProp(attrs, prefix, 'Position', device);
                if (pos === 'custom') {
                    var cx = getResponsiveBgProp(attrs, prefix, 'PositionCustomX', device);
                    var cy = getResponsiveBgProp(attrs, prefix, 'PositionCustomY', device);
                    rules.push('background-position:' + (cx ? cx + '%' : '50%') + ' ' + (cy ? cy + '%' : '50%') + ' !important');
                } else {
                    rules.push('background-position:' + (pos || 'center') + ' !important');
                }
                var attach = attrs[prefix + 'Attachment'] || '';
                if (attach) rules.push('background-attachment:' + attach + ' !important');
                var repeat = getResponsiveBgProp(attrs, prefix, 'Repeat', device);
                if (repeat) rules.push('background-repeat:' + repeat + ' !important');
                var sz = getResponsiveBgProp(attrs, prefix, 'Size', device);
                if (sz === 'custom') {
                    var sw = getResponsiveBgProp(attrs, prefix, 'SizeCustomW', device);
                    var sh = getResponsiveBgProp(attrs, prefix, 'SizeCustomH', device);
                    rules.push('background-size:' + (sw ? sw + 'px' : 'auto') + ' ' + (sh ? sh + 'px' : 'auto') + ' !important');
                } else {
                    rules.push('background-size:' + (sz || 'cover') + ' !important');
                }
            }
        } else if (bgType === 'gradient') {
            var grad = getEditorGradientValue(attrs, prefix, device);
            if (grad) rules.push('background-image:' + grad + ' !important');
        }
        return rules;
    }

    function buildBorderRules(attrs, typeKey, widthPrefix, colorKey, radiusPrefix, shadowPrefix, device) {
        var rules = [];
        var borderType = attrs[typeKey] || '';

        if (borderType && borderType !== 'none') {
            rules.push('border-style:' + borderType + ' !important');
            var bColor = attrs[colorKey] || '';
            if (bColor) rules.push('border-color:' + bColor + ' !important');

            var suffix = device === 'desktop' ? '' : (device === 'tablet' ? 'Tablet' : 'Mobile');
            ['Top', 'Right', 'Bottom', 'Left'].forEach(function (side) {
                var val = attrs[widthPrefix + side + suffix] || attrs[widthPrefix + side] || '';
                var unit = attrs[widthPrefix + side + suffix + 'Unit'] || attrs[widthPrefix + side + 'Unit'] || 'px';
                if (val !== '') rules.push('border-' + side.toLowerCase() + '-width:' + val + unit + ' !important');
            });
        } else if (borderType === 'none') {
            rules.push('border:none !important');
        }

        // Border radius
        var rSuffix = device === 'desktop' ? '' : (device === 'tablet' ? 'Tablet' : 'Mobile');
        var rParts = {};
        ['Top', 'Right', 'Bottom', 'Left'].forEach(function (side) {
            var val = attrs[radiusPrefix + side + rSuffix] || attrs[radiusPrefix + side] || '';
            var unit = attrs[radiusPrefix + side + rSuffix + 'Unit'] || attrs[radiusPrefix + side + 'Unit'] || 'px';
            if (val !== '') rParts[side] = val + unit;
        });
        if (Object.keys(rParts).length) {
            var tl = rParts.Top || '0px';
            var tr = rParts.Right || '0px';
            var br = rParts.Bottom || '0px';
            var bl = rParts.Left || '0px';
            rules.push('border-radius:' + tl + ' ' + tr + ' ' + br + ' ' + bl + ' !important');
        }

        // Box shadow
        var sh = attrs[shadowPrefix + 'H'];
        var sv = attrs[shadowPrefix + 'V'];
        var sb = attrs[shadowPrefix + 'Blur'];
        var ss = attrs[shadowPrefix + 'Spread'];
        var sc = attrs[shadowPrefix + 'Color'] || '';
        var sp = attrs[shadowPrefix + 'Position'] || '';
        if (sh !== undefined && sh !== '' || sv !== undefined && sv !== '' || sb !== undefined && sb !== '' || ss !== undefined && ss !== '' || sc) {
            var hv = (sh !== undefined && sh !== '') ? sh + 'px' : '0px';
            var vv = (sv !== undefined && sv !== '') ? sv + 'px' : '0px';
            var bv = (sb !== undefined && sb !== '') ? sb + 'px' : '0px';
            var spv = (ss !== undefined && ss !== '') ? ss + 'px' : '0px';
            var cv = sc || 'rgba(0,0,0,0.5)';
            var shadowVal = hv + ' ' + vv + ' ' + bv + ' ' + spv + ' ' + cv;
            if (sp === 'inset') shadowVal = 'inset ' + shadowVal;
            rules.push('box-shadow:' + shadowVal + ' !important');
        }

        return rules;
    }

    function applyEditorBgStyleTag(clientId, attrs, wrapper) {
        var doc = wrapper.ownerDocument;
        var styleId = 'bkbg-bg-' + clientId;
        var existing = doc.getElementById(styleId);

        var device = getEditorPreviewDevice();
        var sel = '[data-block="' + clientId + '"]';
        var cssText = '';

        // ── Normal rules ──
        var normalRules = buildBgRulesForPrefix(attrs, 'bkbgBg', device);
        var normalBorderRules = buildBorderRules(attrs, 'bkbgBorderType', 'bkbgBorderWidth', 'bkbgBorderColor', 'bkbgBorderRadius', 'bkbgShadow', device);
        var allNormal = normalRules.concat(normalBorderRules);
        if (allNormal.length) {
            cssText += sel + '{' + allNormal.join(';') + '}';
        }

        // ── Hover rules ──
        var hoverBgRules = [];
        var hoverType = attrs.bkbgBgHoverType || '';
        if (hoverType) {
            hoverBgRules = buildBgRulesForPrefix(attrs, 'bkbgBgHover', device);
        }
        var hoverBorderRules = buildBorderRules(attrs, 'bkbgBorderHoverType', 'bkbgBorderHoverWidth', 'bkbgBorderHoverColor', 'bkbgBorderHoverRadius', 'bkbgShadowHover', device);
        var allHover = hoverBgRules.concat(hoverBorderRules);

        if (allHover.length) {
            cssText += sel + ':hover{' + allHover.join(';') + '}';
        }

        if (!cssText) {
            if (existing) existing.remove();
            return;
        }

        if (!existing) {
            existing = doc.createElement('style');
            existing.id = styleId;
            doc.head.appendChild(existing);
        }
        existing.textContent = cssText;
    }

    /* =====================================================
       Background gradient value builder for editor preview
       ===================================================== */

    function getEditorGradientValue(attrs, prefix, device) {
        var c1 = attrs[prefix + 'GradColor1'] || '';
        var c2 = attrs[prefix + 'GradColor2'] || '';
        if (!c1 && !c2) return '';
        if (!c1) c1 = 'transparent';
        if (!c2) c2 = 'transparent';

        var suffix = device === 'desktop' ? '' : (device === 'tablet' ? 'Tablet' : 'Mobile');

        var loc1 = attrs[prefix + 'GradLoc1' + suffix] || attrs[prefix + 'GradLoc1'] || '';
        var loc2 = attrs[prefix + 'GradLoc2' + suffix] || attrs[prefix + 'GradLoc2'] || '';
        var angle = '';
        if (attrs[prefix + 'GradAngle' + suffix] !== undefined && attrs[prefix + 'GradAngle' + suffix] !== '') {
            angle = attrs[prefix + 'GradAngle' + suffix];
        } else if (attrs[prefix + 'GradAngle'] !== undefined && attrs[prefix + 'GradAngle'] !== '') {
            angle = attrs[prefix + 'GradAngle'];
        }

        var type = attrs[prefix + 'GradType'] || 'linear';

        var stop1 = c1 + (loc1 !== '' ? ' ' + loc1 + '%' : '');
        var stop2 = c2 + (loc2 !== '' ? ' ' + loc2 + '%' : '');

        if (type === 'radial') {
            var gradPos = getResponsiveBgProp(attrs, prefix, 'GradPosition', device);
            var atPart = gradPos ? ' at ' + gradPos : '';
            return 'radial-gradient(circle' + atPart + ',' + stop1 + ',' + stop2 + ')';
        }

        var anglePart = angle !== '' ? angle + 'deg,' : '';
        return 'linear-gradient(' + anglePart + stop1 + ',' + stop2 + ')';
    }

})();
