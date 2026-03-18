( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var CURRENCY_POS_OPTIONS = [
        { label: __('Before ($9)', 'blockenberg'), value: 'before' },
        { label: __('After (9€)',  'blockenberg'), value: 'after'  },
    ];

    function makeId() { return 'pc' + Math.random().toString(36).substr(2, 5); }

    function buildWrapStyle(a) {
        return {
            '--bkbg-pc-accent':        a.accentColor,
            '--bkbg-pc-slider-track':  a.sliderTrack,
            '--bkbg-pc-slider-fill':   a.sliderFill,
            '--bkbg-pc-slider-thumb':  a.sliderThumb,
            '--bkbg-pc-card-bg':       a.cardBg,
            '--bkbg-pc-card-border':   a.cardBorder,
            '--bkbg-pc-price-bg':      a.priceBg,
            '--bkbg-pc-price-border':  a.priceBorder,
            '--bkbg-pc-btn-bg':        a.btnBg,
            '--bkbg-pc-btn-color':     a.btnColor,
            '--bkbg-pc-title-color':   a.titleColor,
            '--bkbg-pc-sub-color':     a.subtitleColor,
            '--bkbg-pc-label-color':   a.labelColor,
            '--bkbg-pc-price-color':   a.priceColor,
            '--bkbg-pc-price-accent':  a.priceAccent,
            '--bkbg-pc-card-r':        a.cardRadius + 'px',
            '--bkbg-pc-card-pad':      a.cardPadding + 'px',
            '--bkbg-pc-btn-r':         a.btnRadius + 'px',
            paddingTop:    a.paddingTop    + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#ccc' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Compute price from current state ───────────────────────────── */
    function calcPrice(a, sliderValues, addonChecked, isAnnual) {
        var base = a.basePrice || 0;
        var total = base;
        a.sliders.forEach(function (sl) {
            var val = sliderValues[sl.id] !== undefined ? sliderValues[sl.id] : sl.value;
            total += val * sl.pricePerUnit;
        });
        a.addons.forEach(function (ad) {
            if (addonChecked[ad.id]) total += ad.price;
        });
        if (isAnnual && a.annualDiscount > 0) {
            total = total * (1 - a.annualDiscount / 100);
        }
        return total;
    }

    function formatPrice(a, val) {
        var num = val.toFixed(2).replace(/\.00$/, '');
        return a.currencyPos === 'before'
            ? a.currency + num
            : num + a.currency;
    }

    /* ── Slider row ─────────────────────────────────────────────────── */
    function SliderRow(props) {
        var sl = props.sl;
        var val = props.val;
        var onChangeVal = props.onChangeVal;
        var a  = props.a;
        var pct = ((val - sl.min) / (sl.max - sl.min)) * 100;

        return el('div', { className: 'bkbg-pc-slider-row', style: { marginBottom: '22px' } },
            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } },
                el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                    sl.icon && el('span', { className: 'bkbg-pc-slider-icon', style: { fontSize: '16px' } }, (sl.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(sl.iconType, sl.icon, sl.iconDashicon, sl.iconImageUrl, sl.iconDashiconColor) : sl.icon),
                    el('span', { className: 'bkbg-pc-slider-label' }, sl.label)
                ),
                el('span', { className: 'bkbg-pc-slider-val' }, val + ' ' + sl.unit)
            ),
            el('div', { className: 'bkbg-pc-slider-track-wrap', style: { position: 'relative', height: '6px', borderRadius: '99px', background: a.sliderTrack } },
                el('div', { className: 'bkbg-pc-slider-fill', style: { position: 'absolute', left: 0, top: 0, height: '100%', width: pct + '%', background: a.sliderFill, borderRadius: '99px', pointerEvents: 'none' } }),
                el('input', { type: 'range', min: sl.min, max: sl.max, step: sl.step, value: val, 'data-slider-id': sl.id,
                    onChange: function (e) { onChangeVal(parseFloat(e.target.value)); },
                    className: 'bkbg-pc-range',
                    style: { position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', height: '6px', margin: 0 }
                })
            )
        );
    }

    /* ── Addon row ──────────────────────────────────────────────────── */
    function AddonRow(props) {
        var ad = props.ad;
        var checked = props.checked;
        var onToggle = props.onToggle;
        var a = props.a;

        return el('label', { className: 'bkbg-pc-addon', 'data-addon-id': ad.id, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid ' + (checked ? a.accentColor : a.cardBorder), cursor: 'pointer', marginBottom: '8px', background: checked ? 'rgba(108,63,181,0.05)' : 'transparent', transition: 'all 0.15s' } },
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                el('input', { type: 'checkbox', checked: checked, onChange: onToggle, 'data-addon-id': ad.id, style: { accentColor: a.accentColor, width: '16px', height: '16px' } }),
                ad.icon && el('span', { className: 'bkbg-pc-addon-icon', style: { fontSize: '16px' } }, (ad.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(ad.iconType, ad.icon, ad.iconDashicon, ad.iconImageUrl, ad.iconDashiconColor) : ad.icon),
                el('span', { className: 'bkbg-pc-addon-label' }, ad.label)
            ),
            el('span', { className: 'bkbg-pc-addon-price' },
                '+' + formatPrice(a, ad.price) + '/mo'
            )
        );
    }

    registerBlockType('blockenberg/price-calculator', {
        title: __('Price Calculator', 'blockenberg'),
        icon: 'calculator',
        category: 'bkbg-calculators',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            /* Interactive preview state */
            var isAnnualState = useState(false);
            var isAnnual = isAnnualState[0];
            var setIsAnnual = isAnnualState[1];

            var initSliders = {};
            a.sliders.forEach(function (sl) { initSliders[sl.id] = sl.value; });
            var sliderValsState = useState(initSliders);
            var sliderVals = sliderValsState[0];
            var setSliderVals = sliderValsState[1];

            var initAddons = {};
            a.addons.forEach(function (ad) { initAddons[ad.id] = ad.checked; });
            var addonCheckedState = useState(initAddons);
            var addonChecked = addonCheckedState[0];
            var setAddonChecked = addonCheckedState[1];

            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = buildWrapStyle(a);
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.titleTypo, '--bkbg-pc-tt-'));
                    Object.assign(s, _tvFn(a.subtitleTypo, '--bkbg-pc-st-'));
                    Object.assign(s, _tvFn(a.priceTypo, '--bkbg-pc-pr-'));
                    Object.assign(s, _tvFn(a.labelTypo, '--bkbg-pc-lb-'));
                }
                return { style: s };
            })());

            var price = calcPrice(a, sliderVals, addonChecked, isAnnual);
            var priceStr = formatPrice(a, price);
            var priceNote = isAnnual ? a.priceNoteAnnual : a.priceNote;

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateSlider(id, key, val) {
                setAttributes({ sliders: a.sliders.map(function (sl) {
                    if (sl.id !== id) return sl;
                    var u = Object.assign({}, sl); u[key] = val; return u;
                }) });
                /* Also reset preview value if key was 'value' */
                if (key === 'value') {
                    var nv = {}; nv[id] = val;
                    setSliderVals(Object.assign({}, sliderVals, nv));
                }
            }

            function updateAddon(id, key, val) {
                setAttributes({ addons: a.addons.map(function (ad) {
                    if (ad.id !== id) return ad;
                    var u = Object.assign({}, ad); u[key] = val; return u;
                }) });
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Sliders', 'blockenberg'), initialOpen: true },
                        a.sliders.map(function (sl) {
                            return el('div', { key: sl.id, style: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px', marginBottom: '10px' } },
                                el(TextControl, { label: __('Label', 'blockenberg'), value: sl.label, onChange: function (v) { updateSlider(sl.id, 'label', v); } }),
                                el(TextControl, { label: __('Unit', 'blockenberg'), value: sl.unit, onChange: function (v) { updateSlider(sl.id, 'unit', v); } }),
                                el(IP().IconPickerControl, {
                                    iconType: sl.iconType || 'custom-char',
                                    customChar: sl.icon,
                                    dashicon: sl.iconDashicon || '',
                                    imageUrl: sl.iconImageUrl || '',
                                    onChangeType: function (v) { updateSlider(sl.id, 'iconType', v); },
                                    onChangeChar: function (v) { updateSlider(sl.id, 'icon', v); },
                                    onChangeDashicon: function (v) { updateSlider(sl.id, 'iconDashicon', v); },
                                    onChangeImageUrl: function (v) { updateSlider(sl.id, 'iconImageUrl', v); }
                                }),
                                el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' } },
                                    el(TextControl, { label: __('Min', 'blockenberg'), type: 'number', value: String(sl.min), onChange: function (v) { updateSlider(sl.id, 'min', parseFloat(v)||0); } }),
                                    el(TextControl, { label: __('Max', 'blockenberg'), type: 'number', value: String(sl.max), onChange: function (v) { updateSlider(sl.id, 'max', parseFloat(v)||100); } }),
                                    el(TextControl, { label: __('Step', 'blockenberg'), type: 'number', value: String(sl.step), onChange: function (v) { updateSlider(sl.id, 'step', parseFloat(v)||1); } }),
                                    el(TextControl, { label: __('Default', 'blockenberg'), type: 'number', value: String(sl.value), onChange: function (v) { updateSlider(sl.id, 'value', parseFloat(v)||0); } })
                                ),
                                el(TextControl, { label: __('Price per unit ($/unit)', 'blockenberg'), type: 'number', value: String(sl.pricePerUnit), onChange: function (v) { updateSlider(sl.id, 'pricePerUnit', parseFloat(v)||0); } }),
                                el(Button, { isDestructive: true, variant: 'tertiary', size: 'compact', onClick: function () { setAttributes({ sliders: a.sliders.filter(function (s) { return s.id !== sl.id; }) }); } }, __('Remove', 'blockenberg'))
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: function () { setAttributes({ sliders: a.sliders.concat([{ id: makeId(), label: __('New Slider', 'blockenberg'), unit: 'units', min: 1, max: 100, step: 1, value: 10, pricePerUnit: 1, icon: '📦', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '' }]) }); }, style: { width: '100%', justifyContent: 'center' } }, '+ ' + __('Add Slider', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Add-ons', 'blockenberg'), initialOpen: false },
                        a.addons.map(function (ad) {
                            return el('div', { key: ad.id, style: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px', marginBottom: '10px' } },
                                el(TextControl, { label: __('Label', 'blockenberg'), value: ad.label, onChange: function (v) { updateAddon(ad.id, 'label', v); } }),
                                el(IP().IconPickerControl, {
                                    iconType: ad.iconType || 'custom-char',
                                    customChar: ad.icon,
                                    dashicon: ad.iconDashicon || '',
                                    imageUrl: ad.iconImageUrl || '',
                                    onChangeType: function (v) { updateAddon(ad.id, 'iconType', v); },
                                    onChangeChar: function (v) { updateAddon(ad.id, 'icon', v); },
                                    onChangeDashicon: function (v) { updateAddon(ad.id, 'iconDashicon', v); },
                                    onChangeImageUrl: function (v) { updateAddon(ad.id, 'iconImageUrl', v); }
                                }),
                                el(TextControl, { label: __('Monthly price ($)', 'blockenberg'), type: 'number', value: String(ad.price), onChange: function (v) { updateAddon(ad.id, 'price', parseFloat(v)||0); } }),
                                el(ToggleControl, { label: __('Checked by default', 'blockenberg'), checked: ad.checked, onChange: function (v) { updateAddon(ad.id, 'checked', v); }, __nextHasNoMarginBottom: true }),
                                el(Button, { isDestructive: true, variant: 'tertiary', size: 'compact', onClick: function () { setAttributes({ addons: a.addons.filter(function (x) { return x.id !== ad.id; }) }); } }, __('Remove', 'blockenberg'))
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: function () { setAttributes({ addons: a.addons.concat([{ id: makeId(), label: __('New Add-on', 'blockenberg'), price: 9, checked: false, icon: '✨', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '' }]) }); }, style: { width: '100%', justifyContent: 'center' } }, '+ ' + __('Add Add-on', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Pricing Settings', 'blockenberg'), initialOpen: false },
                        el(TextControl, { label: __('Base price ($)', 'blockenberg'), type: 'number', value: String(a.basePrice), onChange: function (v) { setAttributes({ basePrice: parseFloat(v)||0 }); } }),
                        el(TextControl, { label: __('Currency symbol', 'blockenberg'), value: a.currency, onChange: function (v) { setAttributes({ currency: v }); } }),
                        el(SelectControl, { label: __('Symbol position', 'blockenberg'), value: a.currencyPos, options: CURRENCY_POS_OPTIONS, onChange: function (v) { setAttributes({ currencyPos: v }); } }),
                        el(ToggleControl, { label: __('Show billing toggle (monthly/annual)', 'blockenberg'), checked: a.billingToggle, onChange: function (v) { setAttributes({ billingToggle: v }); }, __nextHasNoMarginBottom: true }),
                        a.billingToggle && el(RangeControl, { label: __('Annual discount %', 'blockenberg'), value: a.annualDiscount, min: 5, max: 50, onChange: function (v) { setAttributes({ annualDiscount: v }); } }),
                        el(TextControl, { label: __('Price note (monthly)', 'blockenberg'), value: a.priceNote, onChange: function (v) { setAttributes({ priceNote: v }); } }),
                        a.billingToggle && el(TextControl, { label: __('Price note (annual)', 'blockenberg'), value: a.priceNoteAnnual, onChange: function (v) { setAttributes({ priceNoteAnnual: v }); } })
                    ),
                    el(PanelBody, { title: __('CTA Button', 'blockenberg'), initialOpen: false },
                        el(TextControl, { label: __('Button label', 'blockenberg'), value: a.ctaLabel, onChange: function (v) { setAttributes({ ctaLabel: v }); } }),
                        el(TextControl, { label: __('Button URL', 'blockenberg'), value: a.ctaUrl, onChange: function (v) { setAttributes({ ctaUrl: v }); } }),
                        el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: a.ctaNewTab, onChange: function (v) { setAttributes({ ctaNewTab: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Max width (px)',    'blockenberg'), value: a.maxWidth,     min: 400, max: 900, onChange: function (v) { setAttributes({ maxWidth:     v }); } }),
                        el(RangeControl, { label: __('Card radius (px)',  'blockenberg'), value: a.cardRadius,   min: 0, max: 32, onChange: function (v) { setAttributes({ cardRadius:   v }); } }),
                        el(RangeControl, { label: __('Card padding (px)', 'blockenberg'), value: a.cardPadding,  min: 16, max: 64, onChange: function (v) { setAttributes({ cardPadding:  v }); } }),
                        el(RangeControl, { label: __('Button radius (px)','blockenberg'), value: a.btnRadius,    min: 0, max: 99, onChange: function (v) { setAttributes({ btnRadius:    v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        (function () {
                            var TC = getTypoControl();
                            if (!TC) return el('p', null, 'Loading…');
                            return el(Fragment, null,
                                el(TC, { label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                                el(TC, { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo, onChange: function (v) { setAttributes({ subtitleTypo: v }); } }),
                                el(TC, { label: __('Price', 'blockenberg'), value: a.priceTypo, onChange: function (v) { setAttributes({ priceTypo: v }); } }),
                                el(TC, { label: __('Labels', 'blockenberg'), value: a.labelTypo, onChange: function (v) { setAttributes({ labelTypo: v }); } })
                            );
                        })()
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',    __('Accent',           'blockenberg'), 'accentColor'),
                        cc('titleColor',     __('Title',            'blockenberg'), 'titleColor'),
                        cc('subtitleColor',  __('Subtitle',         'blockenberg'), 'subtitleColor'),
                        cc('labelColor',     __('Labels',           'blockenberg'), 'labelColor'),
                        cc('priceColor',     __('Price text',       'blockenberg'), 'priceColor'),
                        cc('priceAccent',    __('Price accent',     'blockenberg'), 'priceAccent'),
                        cc('sliderTrack',    __('Slider track',     'blockenberg'), 'sliderTrack'),
                        cc('sliderFill',     __('Slider fill',      'blockenberg'), 'sliderFill'),
                        cc('cardBg',         __('Card background',  'blockenberg'), 'cardBg'),
                        cc('cardBorder',     __('Card border',      'blockenberg'), 'cardBorder'),
                        cc('priceBg',        __('Price box bg',     'blockenberg'), 'priceBg'),
                        cc('priceBorder',    __('Price box border', 'blockenberg'), 'priceBorder'),
                        cc('btnBg',          __('Button background','blockenberg'), 'btnBg'),
                        cc('btnColor',       __('Button text',      'blockenberg'), 'btnColor'),
                        cc('bgColor',        __('Section bg',       'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-pc-outer', style: { maxWidth: a.maxWidth + 'px', margin: '0 auto' } },
                        el('div', { className: 'bkbg-pc-card', style: { background: a.cardBg, border: '1px solid ' + a.cardBorder, borderRadius: a.cardRadius + 'px', padding: a.cardPadding + 'px', boxSizing: 'border-box' } },
                            /* Header */
                            el('div', { className: 'bkbg-pc-header', style: { marginBottom: '28px', textAlign: 'center' } },
                                el(RichText, { tagName: 'h2', className: 'bkbg-pc-title', value: a.title, onChange: function (v) { setAttributes({ title: v }); }, placeholder: __('Calculate Your Price', 'blockenberg'), style: { color: a.titleColor, margin: '0 0 8px' } }),
                                el(RichText, { tagName: 'p', className: 'bkbg-pc-subtitle', value: a.subtitle, onChange: function (v) { setAttributes({ subtitle: v }); }, placeholder: __('Subtitle…', 'blockenberg'), style: { color: a.subtitleColor, margin: 0 } })
                            ),
                            /* Billing toggle */
                            a.billingToggle && el('div', { className: 'bkbg-pc-billing-row', style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '28px' } },
                                el('span', { className: 'bkbg-pc-billing-label', style: { color: isAnnual ? a.labelColor : a.accentColor } }, __('Monthly', 'blockenberg')),
                                el('button', { type: 'button', className: 'bkbg-pc-toggle-btn', onClick: function () { setIsAnnual(!isAnnual); },
                                    style: { width: '42px', height: '24px', borderRadius: '99px', border: 'none', background: isAnnual ? a.accentColor : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', padding: 0 } },
                                    el('span', { style: { position: 'absolute', top: '3px', left: isAnnual ? '21px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block' } })
                                ),
                                el('span', { className: 'bkbg-pc-billing-label', style: { color: isAnnual ? a.accentColor : a.labelColor } },
                                    __('Annual', 'blockenberg'),
                                    a.annualDiscount > 0 && el('span', { style: { marginLeft: '6px', background: '#dcfce7', color: '#16a34a', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px' } }, '-' + a.annualDiscount + '%')
                                )
                            ),
                            /* Sliders */
                            el('div', { className: 'bkbg-pc-sliders', style: { marginBottom: '24px' } },
                                a.sliders.map(function (sl) {
                                    return el(SliderRow, { key: sl.id, sl: sl, a: a,
                                        val: sliderVals[sl.id] !== undefined ? sliderVals[sl.id] : sl.value,
                                        onChangeVal: function (v) { var nv = {}; nv[sl.id] = v; setSliderVals(Object.assign({}, sliderVals, nv)); }
                                    });
                                })
                            ),
                            /* Add-ons */
                            a.addons.length > 0 && el('div', { className: 'bkbg-pc-addons', style: { marginBottom: '28px' } },
                                el('p', { className: 'bkbg-pc-addons-label', style: { color: a.labelColor, margin: '0 0 10px' } }, __('Add-ons', 'blockenberg')),
                                a.addons.map(function (ad) {
                                    return el(AddonRow, { key: ad.id, ad: ad, a: a,
                                        checked: addonChecked[ad.id] !== undefined ? addonChecked[ad.id] : ad.checked,
                                        onToggle: function () { var nv = {}; nv[ad.id] = !addonChecked[ad.id]; setAddonChecked(Object.assign({}, addonChecked, nv)); }
                                    });
                                })
                            ),
                            /* Price display */
                            el('div', { className: 'bkbg-pc-price-box', style: { background: a.priceBg, border: '1px solid ' + a.priceBorder, borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '20px' } },
                                el('div', { className: 'bkbg-pc-price', style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '2px', lineHeight: 1 } },
                                    a.currencyPos === 'before' && el('span', { style: { fontSize: '24px', fontWeight: 900, color: a.priceAccent, marginTop: '6px' } }, a.currency),
                                    el('span', { className: 'bkbg-pc-price-val', style: { color: a.priceColor } }, price.toFixed(2).replace(/\.00$/, '')),
                                    a.currencyPos === 'after' && el('span', { style: { fontSize: '24px', fontWeight: 900, color: a.priceAccent, marginTop: '6px' } }, a.currency)
                                ),
                                el('p', { className: 'bkbg-pc-price-note', style: { fontSize: '13px', color: a.subtitleColor, margin: '6px 0 0' } }, priceNote)
                            ),
                            /* CTA */
                            el('a', { href: a.ctaUrl, className: 'bkbg-pc-cta-btn', style: { display: 'block', padding: '16px 28px', borderRadius: a.btnRadius + 'px', border: 'none', background: a.btnBg, color: a.btnColor, fontFamily: 'inherit', fontSize: '16px', fontWeight: 800, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', lineHeight: 1 } }, a.ctaLabel)
                        )
                    )
                )
            );
        },

        deprecated: [{
            attributes: {"title":{"type":"string","default":"Calculate Your Price"},"subtitle":{"type":"string","default":"Adjust the sliders to see your custom quote instantly."},"currency":{"type":"string","default":"$"},"currencyPos":{"type":"string","default":"before"},"billingToggle":{"type":"boolean","default":true},"annualDiscount":{"type":"number","default":20},"sliders":{"type":"array","default":[{"id":"sl1","label":"Team Members","unit":"users","min":1,"max":50,"step":1,"value":5,"pricePerUnit":12,"icon":"\ud83d\udc65"},{"id":"sl2","label":"Storage","unit":"GB","min":10,"max":1000,"step":10,"value":100,"pricePerUnit":0.05,"icon":"\ud83d\udcbe"},{"id":"sl3","label":"API Calls / month","unit":"k calls","min":10,"max":500,"step":10,"value":50,"pricePerUnit":0.01,"icon":"\u26a1"}]},"addons":{"type":"array","default":[{"id":"a1","label":"Priority Support","price":29,"checked":false,"icon":"\ud83c\udfa7"},{"id":"a2","label":"Advanced Analytics","price":19,"checked":false,"icon":"\ud83d\udcca"},{"id":"a3","label":"SSO / SAML","price":49,"checked":false,"icon":"\ud83d\udd10"}]},"basePrice":{"type":"number","default":0},"ctaLabel":{"type":"string","default":"Get Started"},"ctaUrl":{"type":"string","default":"#"},"ctaNewTab":{"type":"boolean","default":false},"priceNote":{"type":"string","default":"per month, billed monthly"},"priceNoteAnnual":{"type":"string","default":"per month, billed annually"},"maxWidth":{"type":"number","default":720},"cardRadius":{"type":"number","default":20},"cardPadding":{"type":"number","default":40},"sliderRadius":{"type":"number","default":99},"btnRadius":{"type":"number","default":10},"accentColor":{"type":"string","default":"#6c3fb5"},"sliderTrack":{"type":"string","default":"#e5e7eb"},"sliderFill":{"type":"string","default":"#6c3fb5"},"sliderThumb":{"type":"string","default":"#6c3fb5"},"cardBg":{"type":"string","default":"#ffffff"},"cardBorder":{"type":"string","default":"#e5e7eb"},"priceBg":{"type":"string","default":"#f9fafb"},"priceBorder":{"type":"string","default":"#e5e7eb"},"btnBg":{"type":"string","default":"#6c3fb5"},"btnColor":{"type":"string","default":"#ffffff"},"titleColor":{"type":"string","default":"#111827"},"subtitleColor":{"type":"string","default":"#6b7280"},"labelColor":{"type":"string","default":"#374151"},"priceColor":{"type":"string","default":"#111827"},"priceAccent":{"type":"string","default":"#6c3fb5"},"titleSize":{"type":"number","default":26},"subtitleSize":{"type":"number","default":15},"priceSize":{"type":"number","default":52},"labelSize":{"type":"number","default":14},"bgColor":{"type":"string","default":""},"paddingTop":{"type":"number","default":64},"paddingBottom":{"type":"number","default":64},"titleFontWeight":{"type":"string","default":"700"},"subtitleFontWeight":{"type":"string","default":"400"}},
            save: function (props) {
                var a = props.attributes;
                function oldBuildWrapStyle(a) {
                    return {
                        '--bkbg-pc-accent':        a.accentColor,
                        '--bkbg-pc-slider-track':  a.sliderTrack,
                        '--bkbg-pc-slider-fill':   a.sliderFill,
                        '--bkbg-pc-slider-thumb':  a.sliderThumb,
                        '--bkbg-pc-card-bg':       a.cardBg,
                        '--bkbg-pc-card-border':   a.cardBorder,
                        '--bkbg-pc-price-bg':      a.priceBg,
                        '--bkbg-pc-price-border':  a.priceBorder,
                        '--bkbg-pc-btn-bg':        a.btnBg,
                        '--bkbg-pc-btn-color':     a.btnColor,
                        '--bkbg-pc-title-color':   a.titleColor,
                        '--bkbg-pc-sub-color':     a.subtitleColor,
                        '--bkbg-pc-label-color':   a.labelColor,
                        '--bkbg-pc-price-color':   a.priceColor,
                        '--bkbg-pc-price-accent':  a.priceAccent,
                        '--bkbg-pc-card-r':        a.cardRadius + 'px',
                        '--bkbg-pc-card-pad':      a.cardPadding + 'px',
                        '--bkbg-pc-btn-r':         a.btnRadius + 'px',
                        '--bkbg-pc-title-sz':      a.titleSize + 'px',
                        '--bkbg-pc-sub-sz':        a.subtitleSize + 'px',
                        '--bkbg-pc-price-sz':      a.priceSize + 'px',
                        '--bkbg-pc-label-sz':      a.labelSize + 'px',
                        paddingTop:    a.paddingTop    + 'px',
                        paddingBottom: a.paddingBottom + 'px',
                        backgroundColor: a.bgColor || undefined,
                    };
                }
                return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-pc-wrapper', style: oldBuildWrapStyle(a) }),
                    el('div', { className: 'bkbg-pc-outer', style: { maxWidth: a.maxWidth + 'px', margin: '0 auto' } },
                        el('div', { className: 'bkbg-pc-card',
                            'data-currency': a.currency,
                            'data-currency-pos': a.currencyPos,
                            'data-annual-discount': a.annualDiscount,
                            'data-base-price': a.basePrice,
                            style: { background: a.cardBg, border: '1px solid ' + a.cardBorder, borderRadius: a.cardRadius + 'px', padding: a.cardPadding + 'px', boxSizing: 'border-box' } },
                            el('div', { className: 'bkbg-pc-header' },
                                el(RichText.Content, { tagName: 'h2', className: 'bkbg-pc-title', value: a.title }),
                                el(RichText.Content, { tagName: 'p', className: 'bkbg-pc-subtitle', value: a.subtitle })
                            ),
                            a.billingToggle && el('div', { className: 'bkbg-pc-billing-row' },
                                el('span', { className: 'bkbg-pc-billing-label is-monthly' }, __('Monthly', 'blockenberg')),
                                el('button', { type: 'button', className: 'bkbg-pc-toggle-btn', 'aria-pressed': 'false', 'aria-label': __('Toggle billing period', 'blockenberg') },
                                    el('span', { className: 'bkbg-pc-toggle-thumb' })
                                ),
                                el('span', { className: 'bkbg-pc-billing-label is-annual' },
                                    __('Annual', 'blockenberg'),
                                    a.annualDiscount > 0 && el('span', { className: 'bkbg-pc-discount-badge' }, '-' + a.annualDiscount + '%')
                                )
                            ),
                            el('div', { className: 'bkbg-pc-sliders' },
                                a.sliders.map(function (sl) {
                                    return el('div', { key: sl.id, className: 'bkbg-pc-slider-row', 'data-slider-id': sl.id, 'data-price-per-unit': sl.pricePerUnit },
                                        el('div', { className: 'bkbg-pc-slider-header' },
                                            el('div', { className: 'bkbg-pc-slider-label-wrap' },
                                                sl.icon && el('span', { className: 'bkbg-pc-slider-icon', 'aria-hidden': 'true' }, sl.icon),
                                                el('span', { className: 'bkbg-pc-slider-label' }, sl.label)
                                            ),
                                            el('span', { className: 'bkbg-pc-slider-val' }, sl.value + ' ' + sl.unit)
                                        ),
                                        el('div', { className: 'bkbg-pc-slider-track-wrap' },
                                            el('div', { className: 'bkbg-pc-slider-fill' }),
                                            el('input', { type: 'range', min: sl.min, max: sl.max, step: sl.step, defaultValue: sl.value, 'data-unit': sl.unit, className: 'bkbg-pc-range', 'aria-label': sl.label })
                                        )
                                    );
                                })
                            ),
                            a.addons.length > 0 && el('div', { className: 'bkbg-pc-addons' },
                                el('p', { className: 'bkbg-pc-addons-label' }, __('Add-ons', 'blockenberg')),
                                a.addons.map(function (ad) {
                                    return el('label', { key: ad.id, className: 'bkbg-pc-addon', 'data-addon-id': ad.id, 'data-price': ad.price },
                                        el('div', { className: 'bkbg-pc-addon-left' },
                                            el('input', { type: 'checkbox', defaultChecked: ad.checked, className: 'bkbg-pc-addon-cb', 'data-addon-id': ad.id }),
                                            ad.icon && el('span', { className: 'bkbg-pc-addon-icon', 'aria-hidden': 'true' }, ad.icon),
                                            el('span', { className: 'bkbg-pc-addon-label' }, ad.label)
                                        ),
                                        el('span', { className: 'bkbg-pc-addon-price' }, '+' + a.currency + ad.price + '/mo')
                                    );
                                })
                            ),
                            el('div', { className: 'bkbg-pc-price-box' },
                                el('div', { className: 'bkbg-pc-price' },
                                    a.currencyPos === 'before' && el('span', { className: 'bkbg-pc-currency' }, a.currency),
                                    el('span', { className: 'bkbg-pc-price-val' }, '0'),
                                    a.currencyPos === 'after' && el('span', { className: 'bkbg-pc-currency' }, a.currency)
                                ),
                                el('p', { className: 'bkbg-pc-price-note', 'data-monthly': a.priceNote, 'data-annual': a.priceNoteAnnual }, a.priceNote)
                            ),
                            el('a', { href: a.ctaUrl, className: 'bkbg-pc-cta-btn', target: a.ctaNewTab ? '_blank' : undefined, rel: a.ctaNewTab ? 'noopener noreferrer' : undefined }, a.ctaLabel)
                        )
                    )
                );
            }
        }],

        save: function (props) {
            var a = props.attributes;
            var _tvFn = getTypoCssVars();
            var saveStyle = buildWrapStyle(a);
            if (_tvFn) {
                Object.assign(saveStyle, _tvFn(a.titleTypo, '--bkbg-pc-tt-'));
                Object.assign(saveStyle, _tvFn(a.subtitleTypo, '--bkbg-pc-st-'));
                Object.assign(saveStyle, _tvFn(a.priceTypo, '--bkbg-pc-pr-'));
                Object.assign(saveStyle, _tvFn(a.labelTypo, '--bkbg-pc-lb-'));
            }
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-pc-wrapper', style: saveStyle }),
                el('div', { className: 'bkbg-pc-outer', style: { maxWidth: a.maxWidth + 'px', margin: '0 auto' } },
                    el('div', { className: 'bkbg-pc-card',
                        'data-currency': a.currency,
                        'data-currency-pos': a.currencyPos,
                        'data-annual-discount': a.annualDiscount,
                        'data-base-price': a.basePrice,
                        style: { background: a.cardBg, border: '1px solid ' + a.cardBorder, borderRadius: a.cardRadius + 'px', padding: a.cardPadding + 'px', boxSizing: 'border-box' } },
                        el('div', { className: 'bkbg-pc-header' },
                            el(RichText.Content, { tagName: 'h2', className: 'bkbg-pc-title', value: a.title }),
                            el(RichText.Content, { tagName: 'p', className: 'bkbg-pc-subtitle', value: a.subtitle })
                        ),
                        a.billingToggle && el('div', { className: 'bkbg-pc-billing-row' },
                            el('span', { className: 'bkbg-pc-billing-label is-monthly' }, __('Monthly', 'blockenberg')),
                            el('button', { type: 'button', className: 'bkbg-pc-toggle-btn', 'aria-pressed': 'false', 'aria-label': __('Toggle billing period', 'blockenberg') },
                                el('span', { className: 'bkbg-pc-toggle-thumb' })
                            ),
                            el('span', { className: 'bkbg-pc-billing-label is-annual' },
                                __('Annual', 'blockenberg'),
                                a.annualDiscount > 0 && el('span', { className: 'bkbg-pc-discount-badge' }, '-' + a.annualDiscount + '%')
                            )
                        ),
                        el('div', { className: 'bkbg-pc-sliders' },
                            a.sliders.map(function (sl) {
                                return el('div', { key: sl.id, className: 'bkbg-pc-slider-row', 'data-slider-id': sl.id, 'data-price-per-unit': sl.pricePerUnit },
                                    el('div', { className: 'bkbg-pc-slider-header' },
                                        el('div', { className: 'bkbg-pc-slider-label-wrap' },
                                            sl.icon && el('span', { className: 'bkbg-pc-slider-icon', 'aria-hidden': 'true' }, (sl.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(sl.iconType, sl.icon, sl.iconDashicon, sl.iconImageUrl, sl.iconDashiconColor) : sl.icon),
                                            el('span', { className: 'bkbg-pc-slider-label' }, sl.label)
                                        ),
                                        el('span', { className: 'bkbg-pc-slider-val' }, sl.value + ' ' + sl.unit)
                                    ),
                                    el('div', { className: 'bkbg-pc-slider-track-wrap' },
                                        el('div', { className: 'bkbg-pc-slider-fill' }),
                                        el('input', { type: 'range', min: sl.min, max: sl.max, step: sl.step, defaultValue: sl.value, 'data-unit': sl.unit, className: 'bkbg-pc-range', 'aria-label': sl.label })
                                    )
                                );
                            })
                        ),
                        a.addons.length > 0 && el('div', { className: 'bkbg-pc-addons' },
                            el('p', { className: 'bkbg-pc-addons-label' }, __('Add-ons', 'blockenberg')),
                            a.addons.map(function (ad) {
                                return el('label', { key: ad.id, className: 'bkbg-pc-addon', 'data-addon-id': ad.id, 'data-price': ad.price },
                                    el('div', { className: 'bkbg-pc-addon-left' },
                                        el('input', { type: 'checkbox', defaultChecked: ad.checked, className: 'bkbg-pc-addon-cb', 'data-addon-id': ad.id }),
                                        ad.icon && el('span', { className: 'bkbg-pc-addon-icon', 'aria-hidden': 'true' }, (ad.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(ad.iconType, ad.icon, ad.iconDashicon, ad.iconImageUrl, ad.iconDashiconColor) : ad.icon),
                                        el('span', { className: 'bkbg-pc-addon-label' }, ad.label)
                                    ),
                                    el('span', { className: 'bkbg-pc-addon-price' }, '+' + a.currency + ad.price + '/mo')
                                );
                            })
                        ),
                        el('div', { className: 'bkbg-pc-price-box' },
                            el('div', { className: 'bkbg-pc-price' },
                                a.currencyPos === 'before' && el('span', { className: 'bkbg-pc-currency' }, a.currency),
                                el('span', { className: 'bkbg-pc-price-val' }, '0'),
                                a.currencyPos === 'after' && el('span', { className: 'bkbg-pc-currency' }, a.currency)
                            ),
                            el('p', { className: 'bkbg-pc-price-note', 'data-monthly': a.priceNote, 'data-annual': a.priceNoteAnnual }, a.priceNote)
                        ),
                        el('a', { href: a.ctaUrl, className: 'bkbg-pc-cta-btn', target: a.ctaNewTab ? '_blank' : undefined, rel: a.ctaNewTab ? 'noopener noreferrer' : undefined }, a.ctaLabel)
                    )
                )
            );
        }
    });
}() );
