(function () {
    var el = window.wp.element.createElement;
    var __ = function (s) { return s; };
    var registerBlockType    = window.wp.blocks.registerBlockType;
    var InspectorControls    = window.wp.blockEditor.InspectorControls;
    var PanelBody            = window.wp.components.PanelBody;
    var PanelRow             = window.wp.components.PanelRow;
    var ToggleControl        = window.wp.components.ToggleControl;
    var SelectControl        = window.wp.components.SelectControl;
    var RangeControl         = window.wp.components.RangeControl;
    var TextControl          = window.wp.components.TextControl;
    var CheckboxControl      = window.wp.components.CheckboxControl;
    var PanelColorSettings   = window.wp.blockEditor.PanelColorSettings;

    /* ── Network definitions ── */
    var NETWORKS = [
        { id: 'twitter',   label: 'X (Twitter)', brand: '#000000' },
        { id: 'facebook',  label: 'Facebook',    brand: '#1877f2' },
        { id: 'linkedin',  label: 'LinkedIn',    brand: '#0a66c2' },
        { id: 'pinterest', label: 'Pinterest',   brand: '#e60023' },
        { id: 'whatsapp',  label: 'WhatsApp',    brand: '#25d366' },
        { id: 'telegram',  label: 'Telegram',    brand: '#26a5e4' },
        { id: 'reddit',    label: 'Reddit',      brand: '#ff4500' },
        { id: 'email',     label: 'Email',       brand: '#6b7280' },
    ];

    function networkIcon(id) {
        var icons = {
            twitter:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.737-8.837L2.25 2.25h7.008l4.262 5.632 4.724-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            facebook:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.406 18.627 0 12 0S0 5.406 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>',
            linkedin:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
            pinterest: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12C24 5.373 18.627 0 12 0z"/></svg>',
            whatsapp:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
            telegram:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
            reddit:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>',
            email:     '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
        };
        return icons[id] || '';
    }

    registerBlockType('blockenberg/social-share', {
        title: __('Social Share'),
        description: __('Social sharing buttons for any page or post.'),
        category: 'bkbg-blog',
        icon: el('svg', { viewBox: '0 0 24 24', fill: 'currentColor', width: 24, height: 24 },
            el('path', { d: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11a2.99 2.99 0 005.91-.61c0-1.66-1.34-3-3-3s-3 1.34-3 3c0 .24.04.47.09.7L8.91 11.4A2.99 2.99 0 003 13.5c0 1.66 1.34 3 3 3a2.99 2.99 0 002.46-1.29l7.13 4.17c-.05.21-.08.43-.08.65 0 1.61 1.31 2.91 2.91 2.91 1.61 0 2.91-1.3 2.91-2.91s-1.3-2.95-2.91-2.95z' })
        ),

        edit: function (props) {
            var attrs = props.attributes;
            var setA  = props.setAttributes;

            function toggleNetwork(id) {
                var nets = attrs.networks.slice();
                var idx  = nets.indexOf(id);
                if (idx > -1) nets.splice(idx, 1); else nets.push(id);
                setA({ networks: nets });
            }

            /* ── Inspector ── */
            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Networks'), initialOpen: true },
                    NETWORKS.map(function (n) {
                        return el(ToggleControl, {
                            key:   n.id,
                            label: n.label,
                            checked: attrs.networks.indexOf(n.id) > -1,
                            onChange: function () { toggleNetwork(n.id); },
                            __nextHasNoMarginBottom: true,
                        });
                    })
                ),
                el(PanelBody, { title: __('Style'), initialOpen: false },
                    el(SelectControl, {
                        label:    __('Button Style'),
                        value:    attrs.style,
                        options:  [
                            { label: 'Icon only',       value: 'icon' },
                            { label: 'Icon + Text',     value: 'icon-text' },
                            { label: 'Pill (icon+text)',value: 'pill' },
                        ],
                        onChange: function (v) { setA({ style: v }); },
                    }),
                    el(SelectControl, {
                        label:    __('Alignment'),
                        value:    attrs.alignment,
                        options:  [
                            { label: 'Left',   value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right',  value: 'right' },
                        ],
                        onChange: function (v) { setA({ alignment: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Button Size'),
                        value: attrs.size,
                        min: 24, max: 64, step: 2,
                        onChange: function (v) { setA({ size: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Gap'),
                        value: attrs.gap,
                        min: 0, max: 32,
                        onChange: function (v) { setA({ gap: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Border Radius'),
                        value: attrs.iconRadius,
                        min: 0, max: 50,
                        onChange: function (v) { setA({ iconRadius: v }); },
                    }),
                    ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(RangeControl, {
                                            label: __('Font Size'),
                                            value: attrs.fontSize,
                                            min: 10, max: 20,
                                            onChange: function (v) { setA({ fontSize: v }); },
                                        })
                ),
el(PanelBody, { title: __('Colors'), initialOpen: false },
                    el(ToggleControl, {
                        label:    __('Use brand colors'),
                        checked:  attrs.useBrandColors,
                        onChange: function (v) { setA({ useBrandColors: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    !attrs.useBrandColors && el(PanelColorSettings, {
                        title:  __('Custom Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background'),  value: attrs.bgColor,    onChange: function (v) { setA({ bgColor: v || '#1d4ed8' }); } },
                            { label: __('Icon Color'),  value: attrs.iconColor,  onChange: function (v) { setA({ iconColor: v || '#ffffff' }); } },
                            { label: __('Label Color'), value: attrs.labelColor, onChange: function (v) { setA({ labelColor: v || '#ffffff' }); } },
                        ],
                    })
                ),
                el(PanelBody, { title: __('Label'), initialOpen: false },
                    el(ToggleControl, {
                        label:    __('Show label'),
                        checked:  attrs.showLabel,
                        onChange: function (v) { setA({ showLabel: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    attrs.showLabel && el(TextControl, {
                        label:    __('Label text'),
                        value:    attrs.label,
                        onChange: function (v) { setA({ label: v }); },
                    })
                )
            );

            /* ── Editor preview ── */
            var isPill = attrs.style === 'pill';
            var wrapStyle = {
                display:    'flex',
                flexWrap:   'wrap',
                gap:        attrs.gap + 'px',
                justifyContent: attrs.alignment === 'center' ? 'center' : attrs.alignment === 'right' ? 'flex-end' : 'flex-start',
                alignItems: 'center',
            };

            var visible = NETWORKS.filter(function (n) { return attrs.networks.indexOf(n.id) > -1; });

            return el('div', { className: 'bkbg-shs-wrap' },
                inspector,
                attrs.showLabel && el('span', { className: 'bkbg-shs-heading', style: { marginRight: 8, fontSize: attrs.fontSize } }, attrs.label),
                el('div', { style: wrapStyle },
                    visible.map(function (n) {
                        var bg = attrs.useBrandColors ? n.brand : attrs.bgColor;
                        var btnStyle = {
                            display:       'inline-flex', alignItems: 'center', gap: 6,
                            padding:       attrs.style === 'icon' ? '0' : '0 12px',
                            width:         attrs.style === 'icon' ? attrs.size + 'px' : 'auto',
                            height:        attrs.size + 'px',
                            background:    bg,
                            color:         attrs.useBrandColors ? '#ffffff' : attrs.iconColor,
                            borderRadius:  isPill ? (attrs.size / 2) + 'px' : attrs.iconRadius + 'px',
                            fontSize:      attrs.fontSize + 'px',
                            fontWeight:    attrs.fontWeight,
                            cursor:        'pointer',
                            justifyContent:'center',
                            textDecoration: 'none',
                        };
                        return el('span', { key: n.id, style: btnStyle },
                            el('span', {
                                style: { width: 16, height: 16, display: 'flex' },
                                dangerouslySetInnerHTML: { __html: networkIcon(n.id) }
                            }),
                            attrs.style !== 'icon' && el('span', null, n.label)
                        );
                    })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', {
                className: 'bkbg-shs-wrap bkbg-shs-align--' + a.alignment,
                'data-networks':     a.networks.join(','),
                'data-style':        a.style,
                'data-size':         a.size,
                'data-gap':          a.gap,
                'data-radius':       a.iconRadius,
                'data-brand':        a.useBrandColors ? '1' : '0',
                'data-bg':           a.bgColor,
                'data-icon-color':   a.iconColor,
                'data-label-color':  a.labelColor,
                'data-fs':           a.fontSize,
                'data-fw':           a.fontWeight,
                'data-show-label':   a.showLabel ? '1' : '0',
                'data-label':        a.label,
            });
        },
    });
})();
