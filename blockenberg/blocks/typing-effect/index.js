( function () {
  var el = window.wp.element.createElement;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, PanelColorSettings } = window.wp.blockEditor;
  var { PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl } = window.wp.components;
  var { __ } = window.wp.i18n;

  var _tc, _tvf;
  Object.defineProperty(window, '_tc', { get: function () { return _tc || (_tc = window.bkbgTypographyControl); } });
  Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
  function getTypoControl(p, key, label) { return _tc ? _tc(p, key, label) : null; }
  function getTypoCssVars(a) {
      if (!_tvf) return {};
      return _tvf(a.textTypo || {}, '--bkte-tx-');
  }

  var TAGS = ['h1','h2','h3','h4','p','div'].map(t=>({label:t.toUpperCase(),value:t}));
  var ALIGNS = [{label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}];

  registerBlockType('blockenberg/typing-effect', {
    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
      var phrases = (a.phrases||'').split(',').map(s=>s.trim()).filter(Boolean);

      var wrapStyle = (function () {
        var _tv = getTypoCssVars(a);
        var s = {
          background: a.bgColor || undefined,
          paddingTop: a.paddingTop + 'px',
          paddingBottom: a.paddingBottom + 'px',
          textAlign: a.textAlign,
        };
        Object.assign(s, _tv);
        return s;
      })();

      return el('div', { className: 'bkte-wrap', style: wrapStyle },
        el(InspectorControls, null,
          el(PanelBody, { title: __('Content'), initialOpen: true },
            el(TextControl, { label: __('Static Prefix Text'), value: a.prefix, onChange: v => set({prefix:v}) }),
            el(TextareaControl, { label: __('Typing Phrases (comma-separated)'), value: a.phrases, rows: 4,
              help: __('e.g.: beautiful websites,powerful apps,amazing brands'),
              onChange: v => set({phrases:v}) }),
            el(TextControl, { label: __('Static Suffix Text'), value: a.suffix, onChange: v => set({suffix:v}) }),
            el(SelectControl, { label: __('HTML Tag'), value: a.tag, options: TAGS, onChange: v => set({tag:v}) }),
          ),
          el(PanelBody, { title: __('Animation'), initialOpen: false },
            el(RangeControl, { label: __('Type Speed (ms/char)'), value: a.typeSpeed, min:20, max:300, onChange: v=>set({typeSpeed:v}) }),
            el(RangeControl, { label: __('Delete Speed (ms/char)'), value: a.deleteSpeed, min:10, max:200, onChange: v=>set({deleteSpeed:v}) }),
            el(RangeControl, { label: __('Pause After Phrase (ms)'), value: a.pauseDelay, min:200, max:5000, step:100, onChange: v=>set({pauseDelay:v}) }),
            el(ToggleControl, { label: __('Loop'), checked: a.loop, onChange:v=>set({loop:v}), __nextHasNoMarginBottom:true }),
            el(TextControl, { label: __('Cursor Character'), value: a.cursorChar, onChange: v=>set({cursorChar:v.slice(0,2)}) }),
            el(ToggleControl, { label: __('Cursor Blink'), checked: a.cursorBlink, onChange:v=>set({cursorBlink:v}), __nextHasNoMarginBottom:true }),
          ),
          el(PanelBody, { title: __('Typography'), initialOpen: false },
            getTypoControl(props, 'textTypo', __('Text')),
            el(SelectControl, { label: __('Text Align'), value: a.textAlign, options: ALIGNS, onChange: v=>set({textAlign:v}) }),
          ),
          el(PanelBody, { title: __('Spacing'), initialOpen: false },
            el(RangeControl, { label: __('Padding Top (px)'), value: a.paddingTop, min:0, max:200, onChange: v=>set({paddingTop:v}) }),
            el(RangeControl, { label: __('Padding Bottom (px)'), value: a.paddingBottom, min:0, max:200, onChange: v=>set({paddingBottom:v}) }),
          ),
          el(PanelColorSettings, { title: __('Colors'), initialOpen: false, colorSettings: [
            { label: __('Prefix / Suffix Color'), value: a.prefixColor, onChange: v=>set({prefixColor:v||'#1f2937'}) },
            { label: __('Typed Text Color'),       value: a.typedColor,  onChange: v=>set({typedColor:v||'#6c3fb5'}) },
            { label: __('Cursor Color'),           value: a.cursorColor, onChange: v=>set({cursorColor:v||'#6c3fb5'}) },
            { label: __('Background Color'),       value: a.bgColor,     onChange: v=>set({bgColor:v||''}) },
          ]}),
        ),

        el(a.tag||'h2', { className: 'bkte-text', style: {
          textAlign: a.textAlign, margin: 0,
        }},
          a.prefix && el('span', { className:'bkte-prefix', style:{color:a.prefixColor} }, a.prefix),
          el('span', { className:'bkte-typed', style:{color:a.typedColor} }, phrases[0]||''),
          el('span', { className:'bkte-cursor bkte-cursor-blink', style:{color:a.cursorColor} }, a.cursorChar||'|'),
          a.suffix && el('span', { className:'bkte-suffix', style:{color:a.prefixColor} }, a.suffix),
        ),
      );
    },

    save: function({attributes:a}) {
      var wrapStyle = (function () {
        var _tv = getTypoCssVars(a);
        var s = {
          background: a.bgColor || undefined,
          paddingTop: a.paddingTop + 'px',
          paddingBottom: a.paddingBottom + 'px',
          textAlign: a.textAlign,
        };
        Object.assign(s, _tv);
        return s;
      })();
      return el('div', {
        className: 'bkte-wrap', style: wrapStyle,
        'data-phrases': a.phrases,
        'data-type-speed': a.typeSpeed,
        'data-delete-speed': a.deleteSpeed,
        'data-pause': a.pauseDelay,
        'data-loop': a.loop ? '1' : '0',
        'data-cursor-blink': a.cursorBlink ? '1' : '0',
      },
        el(a.tag||'h2', { className:'bkte-text', style: {
          margin:0,
        }},
          a.prefix && el('span', { className:'bkte-prefix', style:{color:a.prefixColor} }, a.prefix),
          el('span', { className:'bkte-typed', style:{color:a.typedColor} }),
          el('span', { className:'bkte-cursor', style:{color:a.cursorColor} }, a.cursorChar||'|'),
          a.suffix && el('span', { className:'bkte-suffix', style:{color:a.prefixColor} }, a.suffix),
        ),
      );
    }
  });
}() );
