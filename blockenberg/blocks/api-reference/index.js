( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var METHOD_COLORS = {
        GET:    { bg: '#22c55e', color: '#fff' },
        POST:   { bg: '#3b82f6', color: '#fff' },
        PUT:    { bg: '#f59e0b', color: '#fff' },
        PATCH:  { bg: '#8b5cf6', color: '#fff' },
        DELETE: { bg: '#ef4444', color: '#fff' }
    };

    var AUTH_LABELS = {
        none:    'No Auth',
        bearer:  'Bearer Token',
        'api-key': 'API Key',
        basic:   'Basic Auth'
    };

    function updateParam(params, idx, field, val) {
        return params.map(function (p, i) {
            if (i !== idx) return p;
            var upd = {}; upd[field] = val;
            return Object.assign({}, p, upd);
        });
    }

    function ParamEditor(props) {
        var p = props.param;
        var idx = props.idx;
        var onChange = props.onChange;
        var onRemove = props.onRemove;
        var onMove = props.onMove;
        var total = props.total;

        var locationOpts = [
            { label: 'Path', value: 'path' },
            { label: 'Query', value: 'query' },
            { label: 'Body', value: 'body' },
            { label: 'Header', value: 'header' }
        ];
        var typeOpts = [
            { label: 'string', value: 'string' },
            { label: 'integer', value: 'integer' },
            { label: 'number', value: 'number' },
            { label: 'boolean', value: 'boolean' },
            { label: 'array', value: 'array' },
            { label: 'object', value: 'object' }
        ];

        return el('div', { className: 'bkbg-apir-param-editor' },
            el('div', { className: 'bkbg-apir-param-header' },
                el('strong', {}, p.name || '(unnamed)'),
                el('span', { className: 'bkbg-apir-param-loc' }, p.location),
                p.required && el('span', { className: 'bkbg-apir-req-badge' }, 'required'),
                el('div', { style: { marginLeft: 'auto', display: 'flex', gap: '4px' } },
                    idx > 0 && el(Button, { isSmall: true, onClick: function () { onMove(idx, idx - 1); } }, '↑'),
                    idx < total - 1 && el(Button, { isSmall: true, onClick: function () { onMove(idx, idx + 1); } }, '↓'),
                    el(Button, { isSmall: true, isDestructive: true, onClick: onRemove }, '✕')
                )
            ),
            el(TextControl, {
                label: __('Name', 'blockenberg'),
                value: p.name,
                __nextHasNoMarginBottom: true,
                onChange: function (v) { onChange(idx, 'name', v); }
            }),
            el(SelectControl, {
                label: __('Location', 'blockenberg'),
                value: p.location,
                options: locationOpts,
                __nextHasNoMarginBottom: true,
                onChange: function (v) { onChange(idx, 'location', v); }
            }),
            el(SelectControl, {
                label: __('Type', 'blockenberg'),
                value: p.type,
                options: typeOpts,
                __nextHasNoMarginBottom: true,
                onChange: function (v) { onChange(idx, 'type', v); }
            }),
            el(ToggleControl, {
                label: __('Required', 'blockenberg'),
                checked: p.required,
                __nextHasNoMarginBottom: true,
                onChange: function (v) { onChange(idx, 'required', v); }
            }),
            el(TextControl, {
                label: __('Description', 'blockenberg'),
                value: p.description,
                __nextHasNoMarginBottom: true,
                onChange: function (v) { onChange(idx, 'description', v); }
            }),
            el(TextControl, {
                label: __('Example', 'blockenberg'),
                value: p.example,
                __nextHasNoMarginBottom: true,
                onChange: function (v) { onChange(idx, 'example', v); }
            })
        );
    }

    function ApiPreview(props) {
        var a = props.a;
        var setAttributes = props.setAttributes;
        var tab = props.tab;
        var setTab = props.setTab;
        var editField = props.editField;
        var setEditField = props.setEditField;

        var mc = METHOD_COLORS[a.method] || METHOD_COLORS.GET;
        var codeBg = a.codeTheme === 'dark' ? '#1e1e2e' : '#f8fafc';
        var codeColor = a.codeTheme === 'dark' ? '#a9b1d6' : '#334155';

        // Header row
        var headerEl = el('div', {
            className: 'bkbg-apir-header',
            style: { background: a.headerBg, color: a.headerColor }
        },
            el('span', {
                className: 'bkbg-apir-method',
                style: { background: mc.bg, color: mc.color }
            }, a.method),
            a.showBaseUrl && el('span', { className: 'bkbg-apir-base-url' }, a.baseUrl),
            editField === 'endpoint'
                ? el('input', {
                    type: 'text',
                    className: 'bkbg-apir-endpoint-input',
                    value: a.endpoint,
                    autoFocus: true,
                    onChange: function (e) { setAttributes({ endpoint: e.target.value }); },
                    onBlur: function () { setEditField(null); },
                    onKeyDown: function (e) { if (e.key === 'Enter') setEditField(null); }
                })
                : el('span', {
                    className: 'bkbg-apir-endpoint bkbg-apir-clickable',
                    onClick: function () { setEditField('endpoint'); }
                }, a.endpoint),
            a.showAuth && el('span', {
                className: 'bkbg-apir-auth-badge'
            }, AUTH_LABELS[a.authType] || a.authType)
        );

        // Title + description
        var titleEl = editField === 'title'
            ? el('input', {
                type: 'text',
                className: 'bkbg-apir-title-input',
                value: a.title,
                autoFocus: true,
                onChange: function (e) { setAttributes({ title: e.target.value }); },
                onBlur: function () { setEditField(null); },
                onKeyDown: function (e) { if (e.key === 'Enter') setEditField(null); }
            })
            : el('h3', {
                className: 'bkbg-apir-title bkbg-apir-clickable',
                onClick: function () { setEditField('title'); }
            }, a.title || 'API Endpoint');

        var descEl = editField === 'description'
            ? el('textarea', {
                className: 'bkbg-apir-desc-input',
                value: a.description,
                autoFocus: true,
                rows: 2,
                onChange: function (e) { setAttributes({ description: e.target.value }); },
                onBlur: function () { setEditField(null); }
            })
            : el('p', {
                className: 'bkbg-apir-desc bkbg-apir-clickable',
                onClick: function () { setEditField('description'); }
            }, a.description || 'Click to add description…');

        // Tab bar
        var tabs = ['params', 'request', 'response'];
        var tabLabels = { params: 'Parameters', request: 'Request', response: 'Response' };
        var tabBar = el('div', { className: 'bkbg-apir-tabbar' },
            tabs.map(function (t) {
                return el('button', {
                    key: t,
                    className: 'bkbg-apir-tab' + (tab === t ? ' is-active' : ''),
                    onClick: function () { setTab(t); }
                }, tabLabels[t]);
            })
        );

        // Params table
        var paramsPanel = el('div', { className: 'bkbg-apir-params', style: { display: tab === 'params' ? '' : 'none' } },
            a.params.length === 0
                ? el('p', { className: 'bkbg-apir-empty' }, 'No parameters. Add them in the sidebar.')
                : el('table', { className: 'bkbg-apir-table', style: { '--bkbg-apir-table-bg': a.tableBg, '--bkbg-apir-table-alt': a.tableAltBg } },
                    el('thead', {},
                        el('tr', {},
                            el('th', {}, 'Name'),
                            el('th', {}, 'Type'),
                            el('th', {}, 'In'),
                            el('th', {}, 'Required'),
                            el('th', {}, 'Description'),
                            el('th', {}, 'Example')
                        )
                    ),
                    el('tbody', {},
                        a.params.map(function (p, i) {
                            return el('tr', { key: i, className: i % 2 ? 'alt' : '' },
                                el('td', {}, el('code', {}, p.name)),
                                el('td', {}, el('span', { className: 'bkbg-apir-type' }, p.type)),
                                el('td', {}, el('span', { className: 'bkbg-apir-loc bkbg-apir-loc-' + p.location }, p.location)),
                                el('td', {}, p.required
                                    ? el('span', { className: 'bkbg-apir-req' }, '✓')
                                    : el('span', { className: 'bkbg-apir-opt' }, '—')),
                                el('td', {}, p.description),
                                el('td', {}, p.example ? el('code', {}, p.example) : '—')
                            );
                        })
                    )
                )
        );

        // Request panel
        var requestPanel = el('div', {
            className: 'bkbg-apir-code-panel',
            style: { display: tab === 'request' ? '' : 'none', background: codeBg, color: codeColor }
        },
            a.showCopyButton && el('button', { className: 'bkbg-apir-copy' }, '📋 Copy'),
            el('span', { className: 'bkbg-apir-lang-badge' }, a.requestLang),
            editField === 'requestCode'
                ? el('textarea', {
                    className: 'bkbg-apir-code-edit',
                    value: a.requestExample,
                    autoFocus: true,
                    rows: 8,
                    style: { background: codeBg, color: codeColor },
                    onChange: function (e) { setAttributes({ requestExample: e.target.value }); },
                    onBlur: function () { setEditField(null); }
                })
                : el('pre', {
                    className: 'bkbg-apir-code bkbg-apir-clickable',
                    style: { background: codeBg, color: codeColor },
                    onClick: function () { setEditField('requestCode'); }
                }, a.requestExample)
        );

        // Response panel
        var responsePanel = el('div', {
            className: 'bkbg-apir-code-panel',
            style: { display: tab === 'response' ? '' : 'none', background: codeBg, color: codeColor }
        },
            a.showCopyButton && el('button', { className: 'bkbg-apir-copy' }, '📋 Copy'),
            el('span', { className: 'bkbg-apir-lang-badge' }, a.responseLang),
            editField === 'responseCode'
                ? el('textarea', {
                    className: 'bkbg-apir-code-edit',
                    value: a.responseExample,
                    autoFocus: true,
                    rows: 8,
                    style: { background: codeBg, color: codeColor },
                    onChange: function (e) { setAttributes({ responseExample: e.target.value }); },
                    onBlur: function () { setEditField(null); }
                })
                : el('pre', {
                    className: 'bkbg-apir-code bkbg-apir-clickable',
                    style: { background: codeBg, color: codeColor },
                    onClick: function () { setEditField('responseCode'); }
                }, a.responseExample)
        );

        return el('div', (function () {
            var _tv = getTypoCssVars();
            var s = {
                '--bkbg-apir-border': a.borderColor,
                '--bkbg-apir-radius': a.borderRadius + 'px',
                '--bkbg-apir-fs': a.fontSize + 'px'
            };
            Object.assign(s, _tv(a.textTypo || {}, '--bkbg-apir-'));
            return { className: 'bkbg-apir-wrap', style: s };
        })(),
            headerEl,
            el('div', { className: 'bkbg-apir-meta' }, titleEl, descEl),
            tabBar,
            el('div', { className: 'bkbg-apir-body' }, paramsPanel, requestPanel, responsePanel)
        );
    }

    registerBlockType('blockenberg/api-reference', {
        title: __('API Reference', 'blockenberg'),
        icon: 'rest-api',
        category: 'bkbg-dev',
        description: __('Display API endpoint documentation with method badge, parameters table, and code examples.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var tabState = useState(a.defaultTab || 'params');
            var tab = tabState[0]; var setTab = tabState[1];

            var editState = useState(null);
            var editField = editState[0]; var setEditField = editState[1];

            var methodOpts = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(function (m) {
                return { label: m, value: m };
            });
            var authOpts = [
                { label: 'No Auth', value: 'none' },
                { label: 'Bearer Token', value: 'bearer' },
                { label: 'API Key', value: 'api-key' },
                { label: 'Basic Auth', value: 'basic' }
            ];
            var themeOpts = [
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' }
            ];
            var langOpts = [
                { label: 'cURL', value: 'curl' },
                { label: 'JavaScript', value: 'javascript' },
                { label: 'Python', value: 'python' },
                { label: 'PHP', value: 'php' },
                { label: 'Go', value: 'go' }
            ];

            function handleParamChange(idx, field, val) {
                setAttributes({ params: updateParam(a.params, idx, field, val) });
            }
            function handleParamRemove(idx) {
                setAttributes({ params: a.params.filter(function (_, i) { return i !== idx; }) });
            }
            function handleParamMove(from, to) {
                var arr = a.params.slice();
                var tmp = arr[from]; arr[from] = arr[to]; arr[to] = tmp;
                setAttributes({ params: arr });
            }
            function addParam() {
                setAttributes({ params: a.params.concat([{ name: 'param', type: 'string', required: false, location: 'query', description: '', example: '' }]) });
            }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Endpoint Settings', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('HTTP Method', 'blockenberg'),
                        value: a.method,
                        options: methodOpts,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ method: v }); }
                    }),
                    el(TextControl, {
                        label: __('Base URL', 'blockenberg'),
                        value: a.baseUrl,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ baseUrl: v }); }
                    }),
                    el(TextControl, {
                        label: __('Endpoint Path', 'blockenberg'),
                        value: a.endpoint,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ endpoint: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Authentication Type', 'blockenberg'),
                        value: a.authType,
                        options: authOpts,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ authType: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Base URL', 'blockenberg'),
                        checked: a.showBaseUrl,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showBaseUrl: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Auth Badge', 'blockenberg'),
                        checked: a.showAuth,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showAuth: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Copy Button', 'blockenberg'),
                        checked: a.showCopyButton,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showCopyButton: v }); }
                    })
                ),
                el(PanelBody, { title: __('Code Examples', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Request Language', 'blockenberg'),
                        value: a.requestLang,
                        options: langOpts,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ requestLang: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Code Theme', 'blockenberg'),
                        value: a.codeTheme,
                        options: themeOpts,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ codeTheme: v }); }
                    })
                ),
                el(PanelBody, { title: __('Parameters (' + a.params.length + ')', 'blockenberg'), initialOpen: false },
                    a.params.map(function (p, i) {
                        return el(ParamEditor, {
                            key: i,
                            param: p,
                            idx: i,
                            total: a.params.length,
                            onChange: handleParamChange,
                            onRemove: function () { handleParamRemove(i); },
                            onMove: handleParamMove
                        });
                    }),
                    el(Button, {
                        variant: 'secondary',
                        style: { marginTop: '8px', width: '100%' },
                        onClick: addParam
                    }, __('+ Add Parameter', 'blockenberg'))
                ),
                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.borderRadius,
                        min: 0, max: 20,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Text Typography', 'blockenberg'), value: a.textTypo || {}, onChange: function (v) { setAttributes({ textTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Header Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.headerBg, onChange: function (c) { setAttributes({ headerBg: c || '#1e1e2e' }); }, label: __('Header Background', 'blockenberg') },
                        { value: a.headerColor, onChange: function (c) { setAttributes({ headerColor: c || '#e2e8f0' }); }, label: __('Header Text', 'blockenberg') },
                        { value: a.borderColor, onChange: function (c) { setAttributes({ borderColor: c || '#e2e8f0' }); }, label: __('Border', 'blockenberg') },
                        { value: a.tableBg, onChange: function (c) { setAttributes({ tableBg: c || '#ffffff' }); }, label: __('Table Background', 'blockenberg') },
                        { value: a.tableAltBg, onChange: function (c) { setAttributes({ tableAltBg: c || '#f8fafc' }); }, label: __('Table Alt Row', 'blockenberg') }
                    ]
                }),
                el(PanelColorSettings, {
                    title: __('Method Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.getBg, onChange: function (c) { setAttributes({ getBg: c || '#22c55e' }); }, label: 'GET' },
                        { value: a.postBg, onChange: function (c) { setAttributes({ postBg: c || '#3b82f6' }); }, label: 'POST' },
                        { value: a.putBg, onChange: function (c) { setAttributes({ putBg: c || '#f59e0b' }); }, label: 'PUT' },
                        { value: a.patchBg, onChange: function (c) { setAttributes({ patchBg: c || '#8b5cf6' }); }, label: 'PATCH' },
                        { value: a.deleteBg, onChange: function (c) { setAttributes({ deleteBg: c || '#ef4444' }); }, label: 'DELETE' }
                    ]
                })
            );

            var blockProps = useBlockProps({ className: 'bkbg-editor-wrap', 'data-block-label': 'API Reference' });

            return el('div', blockProps,
                inspector,
                el(ApiPreview, {
                    a: a,
                    setAttributes: setAttributes,
                    tab: tab,
                    setTab: setTab,
                    editField: editField,
                    setEditField: setEditField
                })
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-apir-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
