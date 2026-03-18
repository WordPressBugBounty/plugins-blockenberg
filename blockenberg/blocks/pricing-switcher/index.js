( function () {
  const el = window.wp.element.createElement;
  const { useState } = window.wp.element;
  const { registerBlockType } = window.wp.blocks;
  const { InspectorControls, PanelColorSettings } = window.wp.blockEditor;
  const { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl } = window.wp.components;
  const { __ } = window.wp.i18n;
  const Fragment = window.wp.element.Fragment;
  let _tc; const getTypoControl = () => _tc || (_tc = window.bkbgTypographyControl);
  let _tv; const getTypoCssVars = () => _tv || (_tv = window.bkbgTypoCssVars);

  function buildTypoVars(a) {
      const fn = getTypoCssVars();
      if (!fn) return {};
      return Object.assign({}, fn(a.labelTypo || {}, '--bkpsw-lb-'), fn(a.badgeTypo || {}, '--bkpsw-bd-'));
  }

  registerBlockType( 'blockenberg/pricing-switcher', {
    edit: function ( props ) {
      const { attributes: attr, setAttributes } = props;
      const [editorActive, setEditorActive] = useState( attr.defaultActive );

      const isMonthly = editorActive === 'monthly';
      const wrapStyle = {
        '--bkpsw-accent': attr.accentColor,
        '--bkpsw-bg':     attr.bgColor,
        '--bkpsw-active-text':   attr.activeText,
        '--bkpsw-inactive-text': attr.inactiveText,
        '--bkpsw-radius': attr.borderRadius + 'px',
        display: 'flex',
        justifyContent: 'center',
        padding: '20px 0',
        ...buildTypoVars(attr),
      };

      function btnStyle( active ) {
        return {
          padding: '8px 24px',
          borderRadius: attr.borderRadius + 'px',
          background: active ? attr.accentColor : 'transparent',
          color: active ? attr.activeText : attr.inactiveText,
          border: '2px solid ' + attr.accentColor,
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'all 0.25s',
        };
      }

      return el( 'div', { className: 'bkpsw-outer', style: wrapStyle },
        el( InspectorControls, null,
          el( PanelBody, { title: __('Labels & Default'), initialOpen: true },
            el( TextControl, { label: __('Monthly Label'), value: attr.labelMonthly, onChange: v => setAttributes({labelMonthly:v}) }),
            el( TextControl, { label: __('Yearly Label'),  value: attr.labelYearly,  onChange: v => setAttributes({labelYearly:v}) }),
            el( SelectControl, { label: __('Default Active'), value: attr.defaultActive,
              options: [ {label:__('Monthly'),value:'monthly'}, {label:__('Yearly'),value:'yearly'} ],
              onChange: v => setAttributes({defaultActive:v}) }),
            el( TextControl, { label: __('Saving Badge Text'), value: attr.savingBadge, onChange: v => setAttributes({savingBadge:v}) }),
            el( ToggleControl, { label: __('Show Saving Badge'), checked: attr.showBadge, onChange: v => setAttributes({showBadge:v}), __nextHasNoMarginBottom: true })
          ),
          el( PanelBody, { title: __('Style'), initialOpen: false },
            el( SelectControl, { label: __('Switch Style'), value: attr.switchStyle,
              options: [ {label:'Pills',value:'pills'}, {label:'Slider',value:'slider'}, {label:'Toggle',value:'toggle'} ],
              onChange: v => setAttributes({switchStyle:v}) }),
            el( RangeControl, { label: __('Border Radius (px)'), value: attr.borderRadius, min: 0, max: 50, onChange: v => setAttributes({borderRadius:v}) })
          ),
          el( PanelBody, { title: __('Typography'), initialOpen: false },
              (() => {
                  const TC = getTypoControl();
                  if (!TC) return el('p', null, 'Loading…');
                  return el( Fragment, null,
                      el( TC, { label: 'Label', value: attr.labelTypo, onChange: v => setAttributes({ labelTypo: v }) }),
                      el( TC, { label: 'Badge', value: attr.badgeTypo, onChange: v => setAttributes({ badgeTypo: v }) })
                  );
              })()
          ),
                    el( PanelColorSettings, { title: __('Colors'), initialOpen: false, colorSettings: [
            { label: __('Accent Color'),    value: attr.accentColor, onChange: v => setAttributes({accentColor:v||'#6c3fb5'}) },
            { label: __('Background'),      value: attr.bgColor,     onChange: v => setAttributes({bgColor:v||'#f3f3f7'}) },
            { label: __('Active Text'),     value: attr.activeText,  onChange: v => setAttributes({activeText:v||'#ffffff'}) },
            { label: __('Inactive Text'),   value: attr.inactiveText,onChange: v => setAttributes({inactiveText:v||'#555555'}) },
          ]})
        ),

        el( 'div', { className: 'bkpsw-switch bkpsw-style-' + attr.switchStyle,
          style: { background: attr.bgColor, borderRadius: attr.borderRadius + 'px', display: 'inline-flex', alignItems: 'center', padding: '4px', gap: '4px' }},
          el( 'button', { className: 'bkpsw-btn bkpsw-monthly' + (isMonthly?' bkpsw-active':''),
            style: btnStyle(isMonthly),
            onClick: () => setEditorActive('monthly') },
            attr.labelMonthly
          ),
          el( 'button', { className: 'bkpsw-btn bkpsw-yearly' + (!isMonthly?' bkpsw-active':''),
            style: btnStyle(!isMonthly),
            onClick: () => setEditorActive('yearly') },
            attr.labelYearly,
            attr.showBadge && attr.savingBadge && el( 'span', { className: 'bkpsw-badge',
              style: { marginLeft: '6px', background: '#f59e0b', color: '#fff', borderRadius: '20px', padding: '2px 7px', verticalAlign: 'middle' }},
              attr.savingBadge
            )
          )
        )
      );
    },

    save: function ( { attributes: attr } ) {
      const isYearly = attr.defaultActive === 'yearly';
      const wrapCls = 'bkpsw-wrap' + (isYearly ? ' bkpsw-yearly-active' : ' bkpsw-monthly-active');
      const wrapStyle = {
        '--bkpsw-accent': attr.accentColor,
        '--bkpsw-bg':     attr.bgColor,
        '--bkpsw-active-text':   attr.activeText,
        '--bkpsw-inactive-text': attr.inactiveText,
        '--bkpsw-radius': attr.borderRadius + 'px',
        display: 'flex',
        justifyContent: 'center',
        padding: '20px 0',
        ...buildTypoVars(attr),
      };
      return el( 'div', { className: wrapCls, style: wrapStyle, 'data-switcher': '1', 'data-default': attr.defaultActive },
        el( 'div', { className: 'bkpsw-switch bkpsw-style-' + attr.switchStyle,
          style: { background: attr.bgColor, borderRadius: attr.borderRadius + 'px', display: 'inline-flex', alignItems: 'center', padding: '4px', gap: '4px' }},
          el( 'button', { className: 'bkpsw-btn bkpsw-monthly' + (!isYearly?' bkpsw-active':''),
            'data-target': 'monthly', type: 'button' },
            attr.labelMonthly
          ),
          el( 'button', { className: 'bkpsw-btn bkpsw-yearly' + (isYearly?' bkpsw-active':''),
            'data-target': 'yearly', type: 'button' },
            attr.labelYearly,
            attr.showBadge && attr.savingBadge && el( 'span', { className: 'bkpsw-badge' }, attr.savingBadge )
          )
        )
      );
    },

    deprecated: [
        {
            attributes: {
                labelMonthly: { type: "string", default: "Monthly" },
                labelYearly:  { type: "string", default: "Yearly" },
                defaultActive: { type: "string", default: "monthly" },
                switchStyle:  { type: "string", default: "pills" },
                accentColor:  { type: "string", default: "#6c3fb5" },
                bgColor:      { type: "string", default: "#f3f3f7" },
                activeText:   { type: "string", default: "#ffffff" },
                inactiveText: { type: "string", default: "#555555" },
                borderRadius: { type: "number", default: 40 },
                savingBadge:  { type: "string", default: "Save 20%" },
                showBadge:    { type: "boolean", default: true },
                labelFontSize:{ type: "number", default: 14 },
                badgeFontSize:{ type: "number", default: 11 }
            },
            save: function ( { attributes: attr } ) {
                const isYearly = attr.defaultActive === 'yearly';
                const wrapCls = 'bkpsw-wrap' + (isYearly ? ' bkpsw-yearly-active' : ' bkpsw-monthly-active');
                const wrapStyle = {
                    '--bkpsw-accent': attr.accentColor,
                    '--bkpsw-bg':     attr.bgColor,
                    '--bkpsw-active-text':   attr.activeText,
                    '--bkpsw-inactive-text': attr.inactiveText,
                    '--bkpsw-radius': attr.borderRadius + 'px',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '20px 0',
                };
                return el( 'div', { className: wrapCls, style: wrapStyle, 'data-switcher': '1', 'data-default': attr.defaultActive },
                    el( 'div', { className: 'bkpsw-switch bkpsw-style-' + attr.switchStyle,
                        style: { background: attr.bgColor, borderRadius: attr.borderRadius + 'px', display: 'inline-flex', alignItems: 'center', padding: '4px', gap: '4px' }},
                        el( 'button', { className: 'bkpsw-btn bkpsw-monthly' + (!isYearly?' bkpsw-active':''),
                            'data-target': 'monthly', type: 'button' },
                            attr.labelMonthly
                        ),
                        el( 'button', { className: 'bkpsw-btn bkpsw-yearly' + (isYearly?' bkpsw-active':''),
                            'data-target': 'yearly', type: 'button' },
                            attr.labelYearly,
                            attr.showBadge && attr.savingBadge && el( 'span', { className: 'bkpsw-badge' }, attr.savingBadge )
                        )
                    )
                );
            }
        }
    ]
  } );
}() );
