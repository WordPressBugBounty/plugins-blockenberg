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

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    registerBlockType('blockenberg/chapter-intro', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-ci-editor' });

            var isLeft = attr.layout === 'left';

            /* Divider element */
            function renderDivider() {
                if (!attr.showDivider) return null;
                if (attr.dividerStyle === 'dots') {
                    return el('div', { className: 'bkbg-ci-divider bkbg-ci-divider-dots', style: { color: attr.dividerColor, textAlign: isLeft ? 'left' : 'center', margin: '24px 0' } }, '● ● ●');
                }
                if (attr.dividerStyle === 'gradient') {
                    return el('div', { className: 'bkbg-ci-divider bkbg-ci-divider-gradient', style: {
                        height: 3, borderRadius: 2, margin: '24px ' + (isLeft ? '0' : 'auto'),
                        width: 80,
                        background: 'linear-gradient(90deg, ' + attr.accentColor + ', transparent)'
                    } });
                }
                /* default: line */
                return el('hr', { className: 'bkbg-ci-divider', style: { border: 'none', borderTop: '2px solid ' + attr.dividerColor, margin: '24px ' + (isLeft ? '0' : 'auto'), width: 80 } });
            }

            /* Big number behind/above */
            var numberEl = attr.numberStyle === 'ghost'
                ? el('div', { className: 'bkbg-ci-number bkbg-ci-number-ghost', style: {
                      fontSize: attr.numberSize + 'px',
                      color: 'transparent',
                      WebkitTextStroke: '2px ' + attr.numberColor,
                      textAlign: isLeft ? 'left' : 'center',
                      fontWeight: 900,
                      lineHeight: 0.9,
                      marginBottom: 8
                  } }, attr.chapterNumber)
                : el('div', { className: 'bkbg-ci-number bkbg-ci-number-display', style: {
                      fontSize: attr.numberSize + 'px',
                      color: attr.numberColor,
                      fontWeight: 900,
                      lineHeight: 0.9,
                      textAlign: isLeft ? 'left' : 'center',
                      marginBottom: 8
                  } }, attr.chapterNumber);

            var wrapStyle = Object.assign({
                background: attr.bgColor,
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px'
            }, _tv(attr.typoHeading, '--bkbg-ci-h-'), _tv(attr.typoText, '--bkbg-ci-t-'), _tv(attr.typoLabel, '--bkbg-ci-l-'));
            var innerStyle = {
                maxWidth: attr.maxWidth + 'px',
                margin: '0 auto',
                textAlign: isLeft ? 'left' : 'center'
            };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Layout & Style', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.layout,
                            options: [{ label: 'Centered', value: 'centered' }, { label: 'Left Aligned', value: 'left' }],
                            onChange: function (v) { setAttr({ layout: v }); } }),
                        el(SelectControl, { label: __('Number Style', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.numberStyle,
                            options: [{ label: __('Solid (filled color)', 'blockenberg'), value: 'display' }, { label: __('Ghost (outline only)', 'blockenberg'), value: 'ghost' }],
                            onChange: function (v) { setAttr({ numberStyle: v }); } }),
                        el(ToggleControl, { label: __('Show Chapter Label', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showLabel, onChange: function (v) { setAttr({ showLabel: v }); } }),
                        el(ToggleControl, { label: __('Show Divider', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showDivider, onChange: function (v) { setAttr({ showDivider: v }); } }),
                        attr.showDivider && el(SelectControl, { label: __('Divider Style', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.dividerStyle,
                            options: [{ label: 'Line', value: 'line' }, { label: 'Dots', value: 'dots' }, { label: 'Gradient', value: 'gradient' }],
                            onChange: function (v) { setAttr({ dividerStyle: v }); } })
                    ),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.maxWidth, min: 400, max: 1400, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(RangeControl, { label: __('Number Size (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.numberSize, min: 48, max: 400, onChange: function (v) { setAttr({ numberSize: v }); } }),
                        el(getTypographyControl(), { label: __('Heading', 'blockenberg'), value: attr.typoHeading, onChange: function (v) { setAttr({ typoHeading: v }); } }),
                        el(getTypographyControl(), { label: __('Text', 'blockenberg'), value: attr.typoText, onChange: function (v) { setAttr({ typoText: v }); } }),
                        el(getTypographyControl(), { label: __('Label', 'blockenberg'), value: attr.typoLabel, onChange: function (v) { setAttr({ typoLabel: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,      onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); },      label: __('Background', 'blockenberg') },
                            { value: attr.numberColor,  onChange: function (v) { setAttr({ numberColor: v || '#f0eeff' }); }, label: __('Chapter Number', 'blockenberg') },
                            { value: attr.labelColor,   onChange: function (v) { setAttr({ labelColor: v || '#7c3aed' }); },  label: __('Chapter Label', 'blockenberg') },
                            { value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); },label: __('Heading', 'blockenberg') },
                            { value: attr.textColor,    onChange: function (v) { setAttr({ textColor: v || '#4b5563' }); },   label: __('Intro Text', 'blockenberg') },
                            { value: attr.dividerColor, onChange: function (v) { setAttr({ dividerColor: v || '#e5e7eb' }); },label: __('Divider', 'blockenberg') },
                            { value: attr.accentColor,  onChange: function (v) { setAttr({ accentColor: v || '#7c3aed' }); }, label: __('Accent (gradient divider)', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { style: wrapStyle },
                        el('div', { style: innerStyle },
                            numberEl,
                            attr.showLabel && el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: isLeft ? 'flex-start' : 'center', gap: 8, marginBottom: 12 } },
                                el('span', { style: { display: 'inline-block', width: 24, height: 2, background: attr.labelColor, borderRadius: 1 } }),
                                el(RichText, { tagName: 'span', value: attr.chapterLabel, onChange: function (v) { setAttr({ chapterLabel: v }); },
                                    style: { color: attr.labelColor },
                                    placeholder: 'Chapter' }),
                                el('span', { style: { display: 'inline-block', width: 24, height: 2, background: attr.labelColor, borderRadius: 1 } })
                            ),
                            el(RichText, { tagName: 'h2', value: attr.heading, onChange: function (v) { setAttr({ heading: v }); },
                                className: 'bkbg-ci-heading',
                                style: { color: attr.headingColor, margin: '0 0 16px' },
                                placeholder: __('Chapter heading…', 'blockenberg') }),
                            renderDivider(),
                            el(RichText, { tagName: 'p', value: attr.introText, onChange: function (v) { setAttr({ introText: v }); },
                                className: 'bkbg-ci-text',
                                style: { color: attr.textColor, margin: '16px 0 0' },
                                placeholder: __('Write your intro paragraph…', 'blockenberg') })
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-chapter-intro-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
