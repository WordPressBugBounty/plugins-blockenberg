( function () {
    var el                = wp.element.createElement;
    var useState          = wp.element.useState;
    var useEffect         = wp.element.useEffect;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ── Character sets ─────────────────────────────────────────────────────── */
    var UPPER    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var LOWER    = 'abcdefghijklmnopqrstuvwxyz';
    var NUMBERS  = '0123456789';
    var SYMBOLS  = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    var AMBIG    = /[0Ol1I]/g;

    function generatePassword(opts) {
        var pool = '';
        if (opts.includeUppercase !== false) pool += UPPER;
        if (opts.includeLowercase !== false) pool += LOWER;
        if (opts.includeNumbers   !== false) pool += NUMBERS;
        if (opts.includeSymbols   !== false) pool += SYMBOLS;
        if (opts.excludeAmbiguous)           pool  = pool.replace(AMBIG, '');
        if (!pool) pool = LOWER;

        var len = opts.length || 16;
        var arr = [];
        for (var i = 0; i < len; i++) {
            arr.push(pool.charAt(Math.floor(Math.random() * pool.length)));
        }
        return arr.join('');
    }

    function getStrength(pwd, opts) {
        var score = 0;
        if (pwd.length >= 12) score++;
        if (pwd.length >= 16) score++;
        if (/[A-Z]/.test(pwd) && opts.includeUppercase !== false) score++;
        if (/[0-9]/.test(pwd) && opts.includeNumbers   !== false) score++;
        if (/[^A-Za-z0-9]/.test(pwd) && opts.includeSymbols !== false) score++;
        if (score <= 1) return { level: 'weak', label: 'Weak',   pct: 25  };
        if (score === 2) return { level: 'fair', label: 'Fair',   pct: 50  };
        if (score === 3) return { level: 'good', label: 'Good',   pct: 75  };
        return             { level: 'strong',    label: 'Strong', pct: 100 };
    }

    /* ── Preview component ────────────────────────────────────────────────── */
    function PwdPreview(props) {
        var a       = props.attrs;
        var accent  = a.accentColor || '#6c3fb5';
        var cRadius = (a.cardRadius || 16) + 'px';
        var btnR    = (a.btnRadius  || 8)  + 'px';

        var lenState = useState(a.defaultLength || 16);
        var length = lenState[0]; var setLength = lenState[1];
        var upState  = useState(a.includeUppercase !== false);
        var upper = upState[0]; var setUpper = upState[1];
        var loState  = useState(a.includeLowercase !== false);
        var lower = loState[0]; var setLower = loState[1];
        var numState = useState(a.includeNumbers !== false);
        var numbers = numState[0]; var setNumbers = numState[1];
        var symState = useState(a.includeSymbols !== false);
        var symbols = symState[0]; var setSymbols = symState[1];
        var ambState = useState(a.excludeAmbiguous === true);
        var excAmb = ambState[0]; var setExcAmb = ambState[1];
        var pwdState = useState('');
        var pwd = pwdState[0]; var setPwd = pwdState[1];
        var visState = useState(false);
        var visible = visState[0]; var setVisible = visState[1];
        var copState = useState(false);
        var copied = copState[0]; var setCopied = copState[1];

        function generate() {
            var p = generatePassword({ includeUppercase: upper, includeLowercase: lower, includeNumbers: numbers, includeSymbols: symbols, excludeAmbiguous: excAmb, length: length });
            setPwd(p);
            setCopied(false);
        }

        useEffect(function() { generate(); }, []);

        var strength = pwd ? getStrength(pwd, { includeUppercase: upper, includeNumbers: numbers, includeSymbols: symbols }) : null;
        var strengthColors = {
            weak:   a.strengthWeak   || '#ef4444',
            fair:   a.strengthFair   || '#f59e0b',
            good:   a.strengthGood   || '#3b82f6',
            strong: a.strengthStrong || '#10b981',
        };
        var strCol = strength ? strengthColors[strength.level] : '#e5e7eb';

        var cardStyle = {
            background:    a.cardBg        || '#ffffff',
            borderRadius:  cRadius,
            padding:       '32px',
            boxShadow:     '0 4px 24px rgba(0,0,0,0.08)',
            maxWidth:      (a.maxWidth     || 560) + 'px',
            margin:        '0 auto',
            paddingTop:    (a.paddingTop   || 60)  + 'px',
            paddingBottom: (a.paddingBottom|| 60)  + 'px',
            boxSizing:     'border-box',
        };

        return el('div', { className: 'bkbg-pg-card', style: cardStyle },
            a.showTitle && el('h2', { className: 'bkbg-pg-title', style: { color: a.titleColor || '#1e1b4b' } }, a.title || __('Password Generator', 'blockenberg')),
            a.showSubtitle && el('p', { style: { color: a.subtitleColor || '#6b7280', textAlign: 'center', marginTop: 0, marginBottom: 28 } }, a.subtitle),

            /* Password display */
            el('div', {
                style: {
                    background: a.pwdBg || '#f5f3ff',
                    border: '1.5px solid ' + (a.pwdBorder || '#ede9fe'),
                    borderRadius: cRadius,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                }
            },
                el('div', {
                    className: 'bkbg-pg-password' + (visible ? '' : ' blurred'),
                    style: {
                        color: a.pwdColor || '#1e1b4b'
                    }
                }, pwd || '••••••••••••••••'),
                a.showToggleVisible && el('button', {
                    onClick: function() { setVisible(!visible); },
                    title: visible ? __('Hide', 'blockenberg') : __('Show', 'blockenberg'),
                    style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#9ca3af', padding: '4px', flexShrink: 0 }
                }, visible ? '🙈' : '👁'),
                a.showRefreshBtn && el('button', {
                    onClick: generate,
                    title: __('Generate new', 'blockenberg'),
                    style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: accent, padding: '4px', flexShrink: 0 }
                }, '↻')
            ),

            /* Strength bar */
            a.showStrength && strength && el('div', { style: { marginBottom: '20px' } },
                el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: strCol } },
                    el('span', null, __('Strength', 'blockenberg')),
                    el('span', null, strength.label)
                ),
                el('div', { style: { height: '6px', borderRadius: '99px', background: '#e5e7eb', overflow: 'hidden' } },
                    el('div', { style: { height: '100%', borderRadius: '99px', width: strength.pct + '%', background: strCol, transition: 'width 0.4s ease, background 0.3s' } })
                )
            ),

            /* Length slider */
            a.showLength && el('div', { style: { marginBottom: '20px' } },
                el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '6px' } },
                    el('span', null, __('Length', 'blockenberg')),
                    el('span', { style: { color: accent, fontWeight: 700 } }, length)
                ),
                el('input', {
                    type: 'range',
                    value: length,
                    min: a.minLength || 6,
                    max: a.maxLength || 64,
                    onChange: function(e) { setLength(Number(e.target.value)); generate(); },
                    style: { width: '100%', accentColor: accent, cursor: 'pointer' }
                })
            ),

            /* Toggle options */
            el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: '24px' } },
                ['uppercase', 'lowercase', 'numbers', 'symbols'].map(function(type) {
                    var checked = type === 'uppercase' ? upper : type === 'lowercase' ? lower : type === 'numbers' ? numbers : symbols;
                    var setter  = type === 'uppercase' ? setUpper : type === 'lowercase' ? setLower : type === 'numbers' ? setNumbers : setSymbols;
                    var label   = { uppercase: __('Uppercase (A-Z)', 'blockenberg'), lowercase: __('Lowercase (a-z)', 'blockenberg'), numbers: __('Numbers (0-9)', 'blockenberg'), symbols: __('Symbols (!@#…)', 'blockenberg') }[type];
                    return el('label', { key: type, style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: a.labelColor || '#374151', cursor: 'pointer', userSelect: 'none' } },
                        el('input', {
                            type: 'checkbox',
                            checked: checked,
                            onChange: function(e) { setter(e.target.checked); },
                            style: { width: '16px', height: '16px', accentColor: accent, cursor: 'pointer' }
                        }),
                        label
                    );
                }),
                el('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: a.labelColor || '#374151', cursor: 'pointer', userSelect: 'none', gridColumn: '1 / -1' } },
                    el('input', {
                        type: 'checkbox',
                        checked: excAmb,
                        onChange: function(e) { setExcAmb(e.target.checked); },
                        style: { width: '16px', height: '16px', accentColor: accent, cursor: 'pointer' }
                    }),
                    __('Exclude ambiguous characters (0, O, l, 1, I)', 'blockenberg')
                )
            ),

            /* Action buttons */
            el('div', { style: { display: 'flex', gap: '10px' } },
                el('button', {
                    onClick: generate,
                    style: {
                        flex: 1,
                        padding: '12px',
                        borderRadius: btnR,
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '14px',
                        background: a.genBtnBg    || '#f3f4f6',
                        color:      a.genBtnColor || '#374151',
                        transition: 'filter 0.15s',
                    }
                }, a.generateLabel || __('Generate New', 'blockenberg')),
                a.showCopyBtn && el('button', {
                    onClick: function() { if (pwd) { navigator.clipboard.writeText(pwd).then(function() { setCopied(true); setTimeout(function() { setCopied(false); }, 2000); }); } },
                    style: {
                        flex: 1,
                        padding: '12px',
                        borderRadius: btnR,
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '14px',
                        background: copied ? '#10b981' : (a.copyBtnBg    || accent),
                        color:       a.copyBtnColor || '#ffffff',
                        transition: 'background 0.2s',
                    }
                }, copied ? (a.copiedLabel || __('Copied!', 'blockenberg')) : (a.copyLabel || __('Copy Password', 'blockenberg')))
            )
        );
    }

    registerBlockType('blockenberg/password-generator', {
        edit: function(props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps((function() {
                var tv = getTypoCssVars();
                var s = {};
                if (a.bgColor) s.background = a.bgColor;
                Object.assign(s, tv(a.titleTypo, '--bkbg-pg-tt-'));
                Object.assign(s, tv(a.pwdTypo, '--bkbg-pg-pw-'));
                return { style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: function(v) { setAttr({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showTitle && el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: function(v) { setAttr({ title: v }); } }),
                        el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: function(v) { setAttr({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSubtitle && el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.subtitle, onChange: function(v) { setAttr({ subtitle: v }); } }),
                        el(TextControl, { label: __('Copy Button Label', 'blockenberg'), value: a.copyLabel, onChange: function(v) { setAttr({ copyLabel: v }); } }),
                        el(TextControl, { label: __('Copied Confirmation Label', 'blockenberg'), value: a.copiedLabel, onChange: function(v) { setAttr({ copiedLabel: v }); } }),
                        el(TextControl, { label: __('Generate Button Label', 'blockenberg'), value: a.generateLabel, onChange: function(v) { setAttr({ generateLabel: v }); } })
                    ),

                    el(PanelBody, { title: __('Password Options', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Default Length', 'blockenberg'), value: a.defaultLength, min: 4, max: 64, onChange: function(v) { setAttr({ defaultLength: v }); } }),
                        el(RangeControl, { label: __('Min Length', 'blockenberg'), value: a.minLength, min: 4, max: 32, onChange: function(v) { setAttr({ minLength: v }); } }),
                        el(RangeControl, { label: __('Max Length', 'blockenberg'), value: a.maxLength, min: 16, max: 128, onChange: function(v) { setAttr({ maxLength: v }); } }),
                        el(ToggleControl, { label: __('Include Uppercase (A-Z)', 'blockenberg'), checked: a.includeUppercase, onChange: function(v) { setAttr({ includeUppercase: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Include Lowercase (a-z)', 'blockenberg'), checked: a.includeLowercase, onChange: function(v) { setAttr({ includeLowercase: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Include Numbers (0-9)', 'blockenberg'), checked: a.includeNumbers, onChange: function(v) { setAttr({ includeNumbers: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Include Symbols (!@#…)', 'blockenberg'), checked: a.includeSymbols, onChange: function(v) { setAttr({ includeSymbols: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Exclude Ambiguous (0,O,l,1,I)', 'blockenberg'), checked: a.excludeAmbiguous, onChange: function(v) { setAttr({ excludeAmbiguous: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    el(PanelBody, { title: __('Display Options', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Strength Meter', 'blockenberg'), checked: a.showStrength, onChange: function(v) { setAttr({ showStrength: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Length Slider', 'blockenberg'), checked: a.showLength, onChange: function(v) { setAttr({ showLength: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Copy Button', 'blockenberg'), checked: a.showCopyBtn, onChange: function(v) { setAttr({ showCopyBtn: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Refresh Button', 'blockenberg'), checked: a.showRefreshBtn, onChange: function(v) { setAttr({ showRefreshBtn: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Visibility Toggle', 'blockenberg'), checked: a.showToggleVisible, onChange: function(v) { setAttr({ showToggleVisible: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( getTypoControl(), { label: __('Title','blockenberg'), value: a.titleTypo, onChange: function(v){ setAttr({ titleTypo: v }); } }),
                        el( getTypoControl(), { label: __('Password','blockenberg'), value: a.pwdTypo, onChange: function(v){ setAttr({ pwdTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Accent Color', 'blockenberg'),        value: a.accentColor,    onChange: function(v) { setAttr({ accentColor: v || '#6c3fb5' }); } },
                            { label: __('Copy Button Background', 'blockenberg'), value: a.copyBtnBg,   onChange: function(v) { setAttr({ copyBtnBg: v || '#6c3fb5' }); } },
                            { label: __('Copy Button Text', 'blockenberg'),     value: a.copyBtnColor,  onChange: function(v) { setAttr({ copyBtnColor: v || '#ffffff' }); } },
                            { label: __('Generate Button Background', 'blockenberg'), value: a.genBtnBg,onChange: function(v) { setAttr({ genBtnBg: v || '#f3f4f6' }); } },
                            { label: __('Password Field Background', 'blockenberg'), value: a.pwdBg,    onChange: function(v) { setAttr({ pwdBg: v || '#f5f3ff' }); } },
                            { label: __('Password Text Color', 'blockenberg'),  value: a.pwdColor,      onChange: function(v) { setAttr({ pwdColor: v || '#1e1b4b' }); } },
                            { label: __('Weak Strength Color', 'blockenberg'),  value: a.strengthWeak,  onChange: function(v) { setAttr({ strengthWeak: v || '#ef4444' }); } },
                            { label: __('Fair Strength Color', 'blockenberg'),  value: a.strengthFair,  onChange: function(v) { setAttr({ strengthFair: v || '#f59e0b' }); } },
                            { label: __('Good Strength Color', 'blockenberg'),  value: a.strengthGood,  onChange: function(v) { setAttr({ strengthGood: v || '#3b82f6' }); } },
                            { label: __('Strong Strength Color', 'blockenberg'),value: a.strengthStrong,onChange: function(v) { setAttr({ strengthStrong: v || '#10b981' }); } },
                            { label: __('Card Background', 'blockenberg'),      value: a.cardBg,        onChange: function(v) { setAttr({ cardBg: v || '#ffffff' }); } },
                            { label: __('Section Background', 'blockenberg'),   value: a.bgColor,       onChange: function(v) { setAttr({ bgColor: v || '' }); } },
                        ]
                    }),

                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 40, onChange: function(v) { setAttr({ cardRadius: v }); } }),
                        el(RangeControl, { label: __('Button Radius (px)', 'blockenberg'), value: a.btnRadius, min: 0, max: 40, onChange: function(v) { setAttr({ btnRadius: v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 300, max: 900, onChange: function(v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 160, onChange: function(v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 160, onChange: function(v) { setAttr({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    el(PwdPreview, { attrs: a })
                )
            );
        },

        save: function(props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ style: { background: a.bgColor || undefined } });
            return el('div', blockProps,
                el('div', { className: 'bkbg-pg-app', 'data-opts': JSON.stringify(a) },
                    el('p', { className: 'bkbg-pg-loading' }, 'Loading password generator…')
                )
            );
        }
    });
}() );
