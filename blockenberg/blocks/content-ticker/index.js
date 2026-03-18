( function () {
    var el                = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var Button            = wp.components.Button;

    var _bkbgCTKgetTC, _bkbgCTKgetTV;
    function getTC() { return _bkbgCTKgetTC || (_bkbgCTKgetTC = window.bkbgTypographyControl); }
    function getTV() { return _bkbgCTKgetTV || (_bkbgCTKgetTV = window.bkbgTypoCssVars); }
    function tv(obj, prefix) { var fn = getTV(); return fn ? fn(obj, prefix) : {}; }

    registerBlockType('blockenberg/content-ticker', {
        edit: function (props) {
            var a   = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-ctk-editor-wrap', style: Object.assign({}, tv(a.typoText, '--bkctk-text-')) });

            function updateItem(idx, field, val) {
                var ni = a.items.map(function (it, i) {
                    return i === idx ? Object.assign({}, it, { [field]: val }) : it;
                });
                set({ items: ni });
            }
            function addItem() {
                set({ items: a.items.concat([{ text: 'New announcement here...', url: '' }]) });
            }
            function removeItem(idx) {
                set({ items: a.items.filter(function (_, i) { return i !== idx; }) });
            }

            var h = a.height || 44;
            var fz = a.fontSize || 14;
            var previewText = (a.items || []).map(function (it) { return it.text; }).join(' ' + (a.separator || ' ◉ ') + ' ');

            var preview = el('div', {
                className: 'bkbg-ctk-wrap',
                style: {
                    display: 'flex', alignItems: 'stretch',
                    height: h + 'px',
                    borderRadius: (a.borderRadius || 6) + 'px',
                    overflow: 'hidden'
                }
            },
                a.showPrefix !== false && el('div', {
                    className: 'bkbg-ctk-prefix',
                    style: {
                        background: a.prefixBg || '#ef4444',
                        color: a.prefixColor || '#ffffff',
                        padding: '0 ' + (a.prefixPadding || 20) + 'px',
                        display: 'flex', alignItems: 'center',
                        whiteSpace: 'nowrap', flexShrink: 0
                    }
                }, a.prefix || '📢 Breaking'),
                el('div', {
                    style: {
                        flex: 1, overflow: 'hidden',
                        background: a.tickerBg || '#1e1b4b',
                        color: a.tickerColor || '#e2e8f0',
                        display: 'flex', alignItems: 'center',
                        padding: '0 16px'
                    }
                },
                    el('div', {
                        style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
                    }, previewText || 'Your ticker items will scroll here...')
                ),
                el('div', {
                    className: 'bkbg-ctk-arrow',
                    style: {
                        background: a.prefixBg || '#ef4444',
                        color: a.prefixColor || '#ffffff',
                        padding: '0 12px',
                        display: 'flex', alignItems: 'center',
                        flexShrink: 0
                    }
                }, a.direction === 'right' ? '◀' : '▶')
            );

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: 'Ticker Items', initialOpen: true },
                        (a.items || []).map(function (item, i) {
                            return el('div', { key: i, style: { marginBottom: 12, padding: 10,
                                background: '#f8fafc', borderRadius: 6, border: '1px solid #e5e7eb' } },
                                el(TextControl, { label: 'Headline text', value: item.text,
                                    onChange: function (v) { updateItem(i, 'text', v); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: 'Link URL (optional)', value: item.url || '',
                                    onChange: function (v) { updateItem(i, 'url', v); }, __nextHasNoMarginBottom: true }),
                                el(Button, { isDestructive: true, isSmall: true,
                                    onClick: function () { removeItem(i); } }, '✕ Remove')
                            );
                        }),
                        el(Button, { isPrimary: true, isSmall: true, onClick: addItem,
                            style: { marginTop: 4 } }, '+ Add Item')
                    ),
                    el(PanelBody, { title: 'Ticker Settings', initialOpen: false },
                        el(ToggleControl, { label: 'Show prefix label', checked: a.showPrefix !== false,
                            onChange: function (v) { set({ showPrefix: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Prefix label', value: a.prefix || '',
                            onChange: function (v) { set({ prefix: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Item separator', value: a.separator || '',
                            onChange: function (v) { set({ separator: v }); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: 'Scroll direction', value: a.direction || 'left',
                            options: [
                                { label: '← Scroll left', value: 'left' },
                                { label: '→ Scroll right', value: 'right' }
                            ],
                            onChange: function (v) { set({ direction: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Scroll speed (px/s)', value: a.speed || 60,
                            onChange: function (v) { set({ speed: v }); }, min: 10, max: 300, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Pause on hover', checked: a.pauseOnHover !== false,
                            onChange: function (v) { set({ pauseOnHover: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Style', initialOpen: false },
                        el(RangeControl, { label: 'Height (px)', value: a.height || 44,
                            onChange: function (v) { set({ height: v }); }, min: 28, max: 80, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Border radius', value: a.borderRadius || 6,
                            onChange: function (v) { set({ borderRadius: v }); }, min: 0, max: 40, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Prefix padding', value: a.prefixPadding || 20,
                            onChange: function (v) { set({ prefixPadding: v }); }, min: 8, max: 60, __nextHasNoMarginBottom: true })
                    ),
                    
                    el( PanelBody, { title: 'Typography', initialOpen: false },
                        getTC() && el(getTC(), { label: 'Ticker Text', value: a.typoText, onChange: function (v) { set({ typoText: v }); } })
                    ),
el(PanelColorSettings, {
                        title: 'Colors', initialOpen: false,
                        colorSettings: [
                            { label: 'Prefix background', value: a.prefixBg,       onChange: function (v) { set({ prefixBg: v || '#ef4444' }); } },
                            { label: 'Prefix text',       value: a.prefixColor,    onChange: function (v) { set({ prefixColor: v || '#ffffff' }); } },
                            { label: 'Ticker background', value: a.tickerBg,       onChange: function (v) { set({ tickerBg: v || '#1e1b4b' }); } },
                            { label: 'Ticker text',       value: a.tickerColor,    onChange: function (v) { set({ tickerColor: v || '#e2e8f0' }); } },
                            { label: 'Link color',        value: a.linkColor,      onChange: function (v) { set({ linkColor: v || '#a5b4fc' }); } },
                            { label: 'Separator color',   value: a.separatorColor, onChange: function (v) { set({ separatorColor: v || '#475569' }); } }
                        ],
                        disableCustomGradients: true
                    })
                ),
                preview
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save();
            var opts = {
                items:          a.items          || [],
                prefix:         a.prefix         || '📢 Breaking',
                showPrefix:     a.showPrefix      !== false,
                speed:          a.speed           || 60,
                pauseOnHover:   a.pauseOnHover    !== false,
                separator:      a.separator       || ' ◉ ',
                direction:      a.direction       || 'left',
                height:         a.height          || 44,
                fontSize:       a.fontSize        || 14,
                fontWeight:     a.fontWeight       || 400,
                borderRadius:   a.borderRadius     || 6,
                prefixPadding:  a.prefixPadding    || 20,
                prefixBg:       a.prefixBg         || '#ef4444',
                prefixColor:    a.prefixColor      || '#ffffff',
                tickerBg:       a.tickerBg         || '#1e1b4b',
                tickerColor:    a.tickerColor      || '#e2e8f0',
                linkColor:      a.linkColor        || '#a5b4fc',
                separatorColor: a.separatorColor   || '#475569',
                typoText:       a.typoText          || {}
            };
            return el('div', blockProps,
                el('div', { className: 'bkbg-ctk-app', 'data-opts': JSON.stringify(opts) })
            );
        }
    });
}() );
