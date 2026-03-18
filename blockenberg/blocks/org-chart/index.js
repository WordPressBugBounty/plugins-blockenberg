( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function makeId() { return 'oc' + Math.random().toString(36).substr(2, 5); }

    function buildWrapStyle(a) {
        return {
            '--bkbg-oc-accent':       a.accentColor,
            '--bkbg-oc-card-bg':      a.cardBg,
            '--bkbg-oc-card-border':  a.cardBorder,
            '--bkbg-oc-name-color':   a.nameColor,
            '--bkbg-oc-role-color':   a.roleColor,
            '--bkbg-oc-dept-color':   a.deptColor,
            '--bkbg-oc-title-color':  a.titleColor,
            '--bkbg-oc-connector':    a.connectorColor,
            '--bkbg-oc-conn-w':       a.connectorWidth + 'px',
            '--bkbg-oc-avatar-size':  a.avatarSize + 'px',
            '--bkbg-oc-node-r':       a.nodeRadius + 'px',
            '--bkbg-oc-name-sz':      a.nameSize + 'px',
            '--bkbg-oc-role-sz':      a.roleSize + 'px',
            '--bkbg-oc-title-sz':     a.titleSize + 'px',
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

    /* ── Build parent→children map ─────────────────────────────────── */
    function buildTree(nodes) {
        var map = {};
        nodes.forEach(function (n) { map[n.id] = Object.assign({}, n, { children: [] }); });
        var roots = [];
        nodes.forEach(function (n) {
            if (!n.parentId || !map[n.parentId]) {
                roots.push(map[n.id]);
            } else {
                map[n.parentId].children.push(map[n.id]);
            }
        });
        return roots;
    }

    /* ── Node card ─────────────────────────────────────────────────── */
    function NodeCard(props) {
        var node = props.node;
        var a    = props.a;
        var initial = (node.name || '?').charAt(0).toUpperCase();

        return el('div', { className: 'bkbg-oc-node-wrap' },
            /* vertical line up (except root) */
            props.hasParent && el('div', { className: 'bkbg-oc-conn-v-up', style: { width: a.connectorWidth + 'px', minHeight: '24px', background: a.connectorColor, margin: '0 auto' } }),

            el('div', { className: 'bkbg-oc-card', style: {
                background: a.cardBg,
                border: '1.5px solid ' + (node.color || a.cardBorder),
                borderRadius: a.nodeRadius + 'px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                minWidth: '120px',
                maxWidth: '160px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            }},
                /* Avatar */
                a.showAvatars && el('div', { style: {
                    width: a.avatarSize + 'px', height: a.avatarSize + 'px', borderRadius: '50%',
                    background: node.color || a.accentColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', flexShrink: 0,
                    border: '2px solid ' + (node.color || a.accentColor),
                }},
                    node.avatarUrl ? el('img', { src: node.avatarUrl, alt: node.name, style: { width: '100%', height: '100%', objectFit: 'cover' } })
                                   : el('span', { style: { fontSize: Math.round(a.avatarSize * 0.4) + 'px', fontWeight: 800, color: '#fff' } }, initial)
                ),
                el('div', { style: { textAlign: 'center' } },
                    el('p', { className: 'bkbg-oc-name', style: { color: a.nameColor } }, node.name),
                    el('p', { className: 'bkbg-oc-role', style: { margin: '2px 0 0', color: a.roleColor } }, node.role),
                    a.showDepartment && node.department && el('p', { className: 'bkbg-oc-dept', style: { margin: '2px 0 0', color: a.deptColor } }, node.department)
                )
            ),

            /* children */
            node.children && node.children.length > 0 && el(Fragment, null,
                /* vertical line down */
                el('div', { style: { width: a.connectorWidth + 'px', height: '24px', background: a.connectorColor, margin: '0 auto' } }),
                /* horizontal bar if multiple children */
                node.children.length > 1 && el('div', { style: {
                    height: a.connectorWidth + 'px',
                    background: a.connectorColor,
                    width: 'calc(100% - ' + (a.nodeRadius * 4) + 'px)',
                    margin: '0 auto',
                }}),
                /* children row */
                el('div', { style: { display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'flex-start' } },
                    node.children.map(function (child) {
                        return el(NodeCard, { key: child.id, node: child, a: a, hasParent: true });
                    })
                )
            )
        );
    }

    registerBlockType('blockenberg/org-chart', {
        title: __('Org Chart', 'blockenberg'),
        icon: 'networking',
        category: 'bkbg-business',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var editNodeState = useState(null);
            var editNodeId = editNodeState[0];
            var setEditNodeId = editNodeState[1];

            var blockProps = useBlockProps((function () {
                var tv = getTypoCssVars();
                var s = {
                    '--bkbg-oc-accent':       a.accentColor,
                    '--bkbg-oc-card-bg':      a.cardBg,
                    '--bkbg-oc-card-border':  a.cardBorder,
                    '--bkbg-oc-name-color':   a.nameColor,
                    '--bkbg-oc-role-color':   a.roleColor,
                    '--bkbg-oc-dept-color':   a.deptColor,
                    '--bkbg-oc-title-color':  a.titleColor,
                    '--bkbg-oc-connector':    a.connectorColor,
                    '--bkbg-oc-conn-w':       a.connectorWidth + 'px',
                    '--bkbg-oc-avatar-size':  a.avatarSize + 'px',
                    '--bkbg-oc-node-r':       a.nodeRadius + 'px',
                    paddingTop:    a.paddingTop    + 'px',
                    paddingBottom: a.paddingBottom + 'px',
                    backgroundColor: a.bgColor || undefined,
                };
                Object.assign(s, tv(a.titleTypo, '--bkbg-oc-tt-'));
                Object.assign(s, tv(a.nameTypo,  '--bkbg-oc-nm-'));
                Object.assign(s, tv(a.roleTypo,  '--bkbg-oc-rl-'));
                return { className: 'bkbg-oc-wrapper', style: s };
            })());

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateNode(id, key, val) {
                setAttributes({ nodes: a.nodes.map(function (n) {
                    if (n.id !== id) return n;
                    var u = Object.assign({}, n); u[key] = val; return u;
                }) });
            }

            function removeNode(id) {
                setAttributes({ nodes: a.nodes.filter(function (n) { return n.id !== id && n.parentId !== id; }) });
            }

            function addNode() {
                var newId = makeId();
                var rootId = a.nodes.length > 0 ? a.nodes[0].id : '';
                setAttributes({ nodes: a.nodes.concat([{ id: newId, parentId: rootId, name: 'New Person', role: 'Role', department: '', avatarUrl: '', avatarId: 0, color: '' }]) });
                setEditNodeId(newId);
            }

            var tree = buildTree(a.nodes);
            var parentOptions = [{ label: '(root — no parent)', value: '' }].concat(a.nodes.map(function (n) {
                return { label: n.name + ' [' + n.id + ']', value: n.id };
            }));

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Nodes', 'blockenberg'), initialOpen: true },
                        a.nodes.map(function (node) {
                            var isEdit = editNodeId === node.id;
                            var initial = (node.name || '?').charAt(0).toUpperCase();
                            return el('div', { key: node.id, style: { border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' } },
                                el('div', { onClick: function () { setEditNodeId(isEdit ? null : node.id); },
                                    style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', cursor: 'pointer', background: isEdit ? '#f0e9ff' : '#fafafa' } },
                                    el('div', { style: { width: '22px', height: '22px', borderRadius: '50%', background: node.color || a.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
                                        el('span', { style: { fontSize: '11px', fontWeight: 800, color: '#fff' } }, initial)
                                    ),
                                    el('div', { style: { flex: 1, overflow: 'hidden' } },
                                        el('p', { style: { margin: 0, fontSize: '12px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, node.name),
                                        el('p', { style: { margin: 0, fontSize: '11px', color: '#888' } }, node.role)
                                    )
                                ),
                                isEdit && el('div', { style: { padding: '10px', borderTop: '1px solid #e0e0e0' } },
                                    el(TextControl,   { label: __('Name', 'blockenberg'),       value: node.name,       onChange: function (v) { updateNode(node.id, 'name', v); } }),
                                    el(TextControl,   { label: __('Role / Job title', 'blockenberg'), value: node.role, onChange: function (v) { updateNode(node.id, 'role', v); } }),
                                    el(TextControl,   { label: __('Department', 'blockenberg'),  value: node.department, onChange: function (v) { updateNode(node.id, 'department', v); } }),
                                    el(SelectControl, { label: __('Reports to', 'blockenberg'),  value: node.parentId,   options: parentOptions.filter(function (o) { return o.value !== node.id; }), onChange: function (v) { updateNode(node.id, 'parentId', v); } }),
                                    el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                                        el('span', { style: { fontSize: '12px', fontWeight: 600 } }, __('Accent color:', 'blockenberg')),
                                        el('input', { type: 'color', value: node.color || a.accentColor, onChange: function (e) { updateNode(node.id, 'color', e.target.value); }, style: { width: '32px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', background: 'none' } })
                                    ),
                                    el(MediaUploadCheck, null,
                                        el(MediaUpload, { onSelect: function (m) { updateNode(node.id, 'avatarUrl', m.url); updateNode(node.id, 'avatarId', m.id); }, allowedTypes: ['image'], value: node.avatarId,
                                            render: function (mp) {
                                                return el(Fragment, null,
                                                    node.avatarUrl && el('img', { src: node.avatarUrl, style: { width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', display: 'block', marginBottom: '6px', border: '2px solid ' + (node.color || a.accentColor) } }),
                                                    el(Button, { variant: 'secondary', size: 'compact', onClick: mp.open }, node.avatarUrl ? __('Change photo', 'blockenberg') : __('Upload photo', 'blockenberg')),
                                                    node.avatarUrl && el(Button, { variant: 'tertiary', size: 'compact', isDestructive: true, onClick: function () { updateNode(node.id, 'avatarUrl', ''); updateNode(node.id, 'avatarId', 0); }, style: { marginLeft: '6px' } }, __('Remove', 'blockenberg'))
                                                );
                                            }
                                        })
                                    ),
                                    el('div', { style: { marginTop: '10px' } },
                                        el(Button, { isDestructive: true, variant: 'tertiary', size: 'compact', onClick: function () { removeNode(node.id); } }, __('Remove node', 'blockenberg'))
                                    )
                                )
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: addNode, style: { width: '100%', justifyContent: 'center' } }, '+ ' + __('Add Node', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show title', 'blockenberg'),      checked: a.showTitle,     onChange: function (v) { setAttributes({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show avatars', 'blockenberg'),    checked: a.showAvatars,   onChange: function (v) { setAttributes({ showAvatars: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show department', 'blockenberg'), checked: a.showDepartment, onChange: function (v) { setAttributes({ showDepartment: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Collapse on click (frontend)', 'blockenberg'), checked: a.collapseOnClick, onChange: function (v) { setAttributes({ collapseOnClick: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Connector Lines', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Style', 'blockenberg'), value: a.connectorStyle, options: [{ label: 'Elbow', value: 'elbow' }, { label: 'Straight', value: 'straight' }, { label: 'Curved', value: 'curved' }], onChange: function (v) { setAttributes({ connectorStyle: v }); } }),
                        el(RangeControl, { label: __('Line width (px)', 'blockenberg'), value: a.connectorWidth, min: 1, max: 6, onChange: function (v) { setAttributes({ connectorWidth: v }); } }),
                        renderColorControl('connectorColor', __('Connector color', 'blockenberg'), a.connectorColor, function (v) { setAttributes({ connectorColor: v }); }, openColorKey, setOpenColorKey)
                    ),
                    el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Avatar size (px)',  'blockenberg'), value: a.avatarSize,  min: 32, max: 96, onChange: function (v) { setAttributes({ avatarSize:  v }); } }),
                        el(RangeControl, { label: __('Card radius (px)',  'blockenberg'), value: a.nodeRadius,  min: 0,  max: 32, onChange: function (v) { setAttributes({ nodeRadius:  v }); } })
                    ),
                    
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTypoControl(), { label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                        el(getTypoControl(), { label: __('Name', 'blockenberg'), value: a.nameTypo, onChange: function (v) { setAttributes({ nameTypo: v }); } }),
                        el(getTypoControl(), { label: __('Role', 'blockenberg'), value: a.roleTypo, onChange: function (v) { setAttributes({ roleTypo: v }); } })
                    ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor', __('Accent',         'blockenberg'), 'accentColor'),
                        cc('cardBg',      __('Card background','blockenberg'), 'cardBg'),
                        cc('cardBorder',  __('Card border',    'blockenberg'), 'cardBorder'),
                        cc('nameColor',   __('Name color',     'blockenberg'), 'nameColor'),
                        cc('roleColor',   __('Role color',     'blockenberg'), 'roleColor'),
                        cc('deptColor',   __('Department color','blockenberg'), 'deptColor'),
                        cc('titleColor',  __('Title color',    'blockenberg'), 'titleColor'),
                        cc('bgColor',     __('Section bg',     'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    a.showTitle && el(RichText, { tagName: 'h2', className: 'bkbg-oc-title', value: a.title, onChange: function (v) { setAttributes({ title: v }); }, placeholder: __('Our Team', 'blockenberg'), style: { color: a.titleColor, textAlign: 'center', margin: '0 0 32px' } }),

                    el('div', { className: 'bkbg-oc-tree-root', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'auto' } },
                        tree.map(function (root) {
                            return el(NodeCard, { key: root.id, node: root, a: a, hasParent: false });
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var tv = getTypoCssVars();
            var s = {
                '--bkbg-oc-accent':       a.accentColor,
                '--bkbg-oc-card-bg':      a.cardBg,
                '--bkbg-oc-card-border':  a.cardBorder,
                '--bkbg-oc-name-color':   a.nameColor,
                '--bkbg-oc-role-color':   a.roleColor,
                '--bkbg-oc-dept-color':   a.deptColor,
                '--bkbg-oc-title-color':  a.titleColor,
                '--bkbg-oc-connector':    a.connectorColor,
                '--bkbg-oc-conn-w':       a.connectorWidth + 'px',
                '--bkbg-oc-avatar-size':  a.avatarSize + 'px',
                '--bkbg-oc-node-r':       a.nodeRadius + 'px',
                paddingTop:    a.paddingTop    + 'px',
                paddingBottom: a.paddingBottom + 'px',
                backgroundColor: a.bgColor || undefined,
            };
            Object.assign(s, tv(a.titleTypo, '--bkbg-oc-tt-'));
            Object.assign(s, tv(a.nameTypo,  '--bkbg-oc-nm-'));
            Object.assign(s, tv(a.roleTypo,  '--bkbg-oc-rl-'));
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-oc-wrapper', style: s }),
                a.showTitle && el(RichText.Content, { tagName: 'h2', className: 'bkbg-oc-title', value: a.title }),
                el('div', {
                    className: 'bkbg-oc-tree',
                    'data-nodes': JSON.stringify(a.nodes),
                    'data-show-avatars': a.showAvatars ? '1' : '0',
                    'data-show-dept': a.showDepartment ? '1' : '0',
                    'data-collapse': a.collapseOnClick ? '1' : '0',
                    'data-connector-style': a.connectorStyle,
                })
            );
        },

        deprecated: [{
            save: function (props) {
                var a = props.attributes;
                return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-oc-wrapper', style: buildWrapStyle(a) }),
                    a.showTitle && el(RichText.Content, { tagName: 'h2', className: 'bkbg-oc-title', value: a.title }),
                    el('div', {
                        className: 'bkbg-oc-tree',
                        'data-nodes': JSON.stringify(a.nodes),
                        'data-show-avatars': a.showAvatars ? '1' : '0',
                        'data-show-dept': a.showDepartment ? '1' : '0',
                        'data-collapse': a.collapseOnClick ? '1' : '0',
                        'data-connector-style': a.connectorStyle,
                    })
                );
            }
        }]
    });
}() );
