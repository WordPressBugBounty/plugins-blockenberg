( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;
    var SelectControl = wp.components.SelectControl;
    var RangeControl = wp.components.RangeControl;

    var STYLES = [
        { label: 'Sparkle ✨',  value: 'sparkle' },
        { label: 'Dots',        value: 'dots' },
        { label: 'Comet ☄️',   value: 'comet' },
        { label: 'Stars ⭐',    value: 'stars' },
        { label: 'Fire 🔥',    value: 'fire' },
        { label: 'Snow ❄️',    value: 'snow' },
        { label: 'Ribbon',      value: 'ribbon' }
    ];

    var COLOR_MODES = [
        { label: 'Gradient (2 colors)', value: 'gradient' },
        { label: 'Solid Primary',       value: 'solid' },
        { label: 'Rainbow',             value: 'rainbow' }
    ];

    var SCOPES = [
        { label: 'Whole Page',      value: 'page' },
        { label: 'Section Only',    value: 'section' }
    ];

    var BLEND_MODES = [
        'normal','screen','overlay','lighten','color-dodge','add'
    ].map(function (v) { return { label: v, value: v }; });

    function EditorPreview(props) {
        var attr = props.attr;
        return el('div', {
            style: {
                width: '100%', height: attr.sectionHeight + 'px',
                backgroundColor: attr.sectionBg,
                borderRadius: attr.sectionRadius + 'px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
                cursor: 'none'
            }
        },
            el('p', {
                style: {
                    color: '#fff', fontSize: '16px', fontWeight: 600,
                    opacity: 0.8, letterSpacing: '0.04em', textAlign: 'center',
                    padding: '0 20px', margin: 0
                }
            }, attr.previewText || 'Move your cursor here ✨'),
            el('div', {
                style: {
                    position: 'absolute', bottom: '12px', right: '16px',
                    fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em'
                }
            }, 'Trail: ' + (STYLES.find(function (s) { return s.value === attr.trailStyle; }) || STYLES[0]).label +
               ' · Scope: ' + attr.scope),
            // Sample particle dots for visual hint
            [0, 1, 2, 3, 4].map(function (i) {
                return el('div', {
                    key: i,
                    style: {
                        position: 'absolute',
                        left: (25 + i * 12) + '%',
                        top: (35 + Math.sin(i * 1.2) * 20) + '%',
                        width: attr.particleSize + 'px',
                        height: attr.particleSize + 'px',
                        borderRadius: '50%',
                        background: attr.colorMode === 'rainbow'
                            ? 'hsl(' + (i * 60) + ',90%,65%)'
                            : (i % 2 === 0 ? attr.color1 : attr.color2),
                        opacity: 1 - i * 0.18,
                        boxShadow: attr.glowEffect ? '0 0 ' + attr.glowSize + 'px ' + attr.color1 : undefined,
                        transform: 'scale(' + (1 - i * 0.15) + ')',
                        pointerEvents: 'none'
                    }
                });
            })
        );
    }

    wp.blocks.registerBlockType('blockenberg/mouse-trail', {
        title: 'Mouse Trail',
        icon: 'admin-customizer',
        category: 'bkbg-effects',
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ style: { fontFamily: 'inherit' } });

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Trail Style', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: __('Style', 'blockenberg'), value: attr.trailStyle, options: STYLES, onChange: function (v) { setAttr({ trailStyle: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: __('Color Mode', 'blockenberg'), value: attr.colorMode, options: COLOR_MODES, onChange: function (v) { setAttr({ colorMode: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: __('Blend Mode', 'blockenberg'), value: attr.mixBlend, options: BLEND_MODES, onChange: function (v) { setAttr({ mixBlend: v }); } })
                    ),
                    el(PanelBody, { title: __('Particles', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Max Particles', 'blockenberg'), value: attr.particleCount, min: 5, max: 100, onChange: function (v) { setAttr({ particleCount: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Particle Size (px)', 'blockenberg'), value: attr.particleSize, min: 2, max: 30, onChange: function (v) { setAttr({ particleSize: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Spread Radius (px)', 'blockenberg'), value: attr.spreadRadius, min: 0, max: 80, onChange: function (v) { setAttr({ spreadRadius: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Trail Fade Speed', 'blockenberg'), help: __('Higher = quicker fade', 'blockenberg'), value: attr.trailFade, min: 10, max: 100, onChange: function (v) { setAttr({ trailFade: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Gravity', 'blockenberg'), value: Math.round(attr.gravity * 100), min: 0, max: 100, onChange: function (v) { setAttr({ gravity: v / 100 }); } })
                    ),
                    el(PanelBody, { title: __('Glow & Effects', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Glow Effect', 'blockenberg'), checked: attr.glowEffect, onChange: function (v) { setAttr({ glowEffect: v }); } }),
                        attr.glowEffect && el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Glow Size (px)', 'blockenberg'), value: attr.glowSize, min: 2, max: 40, onChange: function (v) { setAttr({ glowSize: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Burst on Click', 'blockenberg'), checked: attr.burstOnClick, onChange: function (v) { setAttr({ burstOnClick: v }); } }),
                        attr.burstOnClick && el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Burst Particle Count', 'blockenberg'), value: attr.burstCount, min: 5, max: 60, onChange: function (v) { setAttr({ burstCount: v }); } })
                    ),
                    el(PanelBody, { title: __('Scope & Behavior', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: __('Effect Scope', 'blockenberg'), help: __("'Page' attaches to the whole page; 'Section' only applies inside this block", 'blockenberg'), value: attr.scope, options: SCOPES, onChange: function (v) { setAttr({ scope: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show on Mobile Devices', 'blockenberg'), checked: attr.showOnMobile, onChange: function (v) { setAttr({ showOnMobile: v }); } })
                    ),
                    el(PanelBody, { title: __('Section (when scoped)', 'blockenberg'), initialOpen: false },
                        el(TextControl, { __nextHasNoMarginBottom: true, label: __('Section Label/Text', 'blockenberg'), value: attr.previewText, onChange: function (v) { setAttr({ previewText: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Section Height (px)', 'blockenberg'), value: attr.sectionHeight, min: 80, max: 600, step: 10, onChange: function (v) { setAttr({ sectionHeight: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Section Border Radius', 'blockenberg'), value: attr.sectionRadius, min: 0, max: 40, onChange: function (v) { setAttr({ sectionRadius: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Primary Color',    'blockenberg'), value: attr.color1,     onChange: function (v) { setAttr({ color1: v || '' }); } },
                            { label: __('Secondary Color',  'blockenberg'), value: attr.color2,     onChange: function (v) { setAttr({ color2: v || '' }); } },
                            { label: __('Section Background','blockenberg'),value: attr.sectionBg,  onChange: function (v) { setAttr({ sectionBg: v || '' }); } }
                        ]
                    })
                ),
                el(EditorPreview, { attr: attr })
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-mt-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
