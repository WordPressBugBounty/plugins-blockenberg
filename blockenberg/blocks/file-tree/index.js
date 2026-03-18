(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var PanelBody = wp.components.PanelBody;
        var RangeControl = wp.components.RangeControl;
        var ToggleControl = wp.components.ToggleControl;
        var TextControl = wp.components.TextControl;
        var SelectControl = wp.components.SelectControl;
        var Button = wp.components.Button;

        var _ftTC, _ftTV;
        function _tc() { return (_ftTC = _ftTC || window.bkbgTypographyControl); }
        function _tv() { return (_ftTV = _ftTV || window.bkbgTypoCssVars); }

        var INDENT_OPTIONS = [
            { label: 'Level 0 (root)', value: 0 },
            { label: 'Level 1', value: 1 },
            { label: 'Level 2', value: 2 },
            { label: 'Level 3', value: 3 },
            { label: 'Level 4', value: 4 },
            { label: 'Level 5', value: 5 }
        ];

        function upd(arr, idx, field, val) {
            return arr.map(function (e, i) {
                if (i !== idx) return e;
                var u = {}; u[field] = val;
                return Object.assign({}, e, u);
            });
        }

        function getExtension(name) {
            var parts = name.split('.');
            return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
        }

        function getExtColor(ext, a) {
            if (ext === 'js' || ext === 'jsx' || ext === 'mjs') return a.jsColor;
            if (ext === 'ts' || ext === 'tsx') return a.tsColor;
            if (ext === 'css' || ext === 'scss' || ext === 'sass') return a.cssColor;
            if (ext === 'html' || ext === 'htm') return a.htmlColor;
            if (ext === 'json' || ext === 'jsonc') return a.jsonColor;
            if (ext === 'md' || ext === 'mdx') return a.mdColor;
            if (ext === 'py') return a.pyColor;
            if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'svg' || ext === 'gif' || ext === 'ico' || ext === 'webp') return a.imgColor;
            return a.fileColor;
        }

        function getFileIcon(item, a) {
            if (item.type === 'folder') return item.isOpen ? '📂' : '📁';
            var ext = getExtension(item.name);
            if (ext === 'js' || ext === 'jsx') return '⬡';
            if (ext === 'ts' || ext === 'tsx') return '⬡';
            if (ext === 'css' || ext === 'scss') return '#';
            if (ext === 'html') return '◈';
            if (ext === 'json') return '{}';
            if (ext === 'md' || ext === 'mdx') return '✎';
            if (ext === 'py') return '🐍';
            if (ext === 'svg' || ext === 'png' || ext === 'jpg' || ext === 'ico') return '🖼';
            return '◻';
        }

        function renderRow(item, idx, a, inEditor, onChange) {
            var indent = (item.indent || 0) * 20;
            var ext = getExtension(item.name);
            var isFolder = item.type === 'folder';
            var nameColor = isFolder ? a.folderColor : (a.showExtensionColors ? getExtColor(ext, a) : a.fileColor);

            return el('div', {
                key: idx,
                className: 'bkbg-ft-row',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '2px 16px 2px ' + (16 + indent) + 'px',
                    transition: 'background 0.1s',
                    background: 'transparent'
                }
            },
                a.showLines && item.indent > 0 && el('span', {
                    className: 'bkbg-ft-indent-line',
                    style: {
                        display: 'inline-block',
                        width: '1px',
                        height: '1.4em',
                        background: a.lineColor,
                        opacity: 0.25,
                        flexShrink: 0,
                        marginRight: '4px'
                    }
                }),
                a.showIcons && el('span', {
                    className: 'bkbg-ft-icon',
                    style: { color: isFolder ? a.folderIconColor : nameColor, flexShrink: 0, fontStyle: 'normal', width: '16px', textAlign: 'center', display: 'inline-block' }
                }, getFileIcon(item, a)),
                el('span', { className: 'bkbg-ft-name', style: { color: nameColor, fontWeight: isFolder ? 600 : 400 } }, item.name)
            );
        }

        registerBlockType('blockenberg/file-tree', {
            edit: function (props) {
                var a = props.attributes;
                var setAttr = props.setAttributes;

                return el(Fragment, null,
                    el(InspectorControls, null,
                        el(PanelBody, { title: __('Tree Settings'), initialOpen: true },
                            el(TextControl, { label: __('Title'), value: a.treeTitle, onChange: function (v) { setAttr({ treeTitle: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show Title'), checked: a.showTitle, onChange: function (v) { setAttr({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show Icons'), checked: a.showIcons, onChange: function (v) { setAttr({ showIcons: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show Indent Lines'), checked: a.showLines, onChange: function (v) { setAttr({ showLines: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Extension Colors'), checked: a.showExtensionColors, onChange: function (v) { setAttr({ showExtensionColors: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        el(PanelBody, { title: __('Files & Folders'), initialOpen: false },
                            a.files.map(function (item, i) {
                                return el('div', { key: i, style: { border: '1px solid #334155', borderRadius: 6, padding: 10, marginBottom: 8, background: '#1e293b' } },
                                    el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
                                        el('strong', { style: { color: '#f1f5f9', fontSize: 12 } }, (item.type === 'folder' ? '📁 ' : '📄 ') + (item.name || 'Item ' + (i + 1))),
                                        el(Button, { isDestructive: true, isSmall: true, onClick: function () { setAttr({ files: a.files.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                    ),
                                    el(TextControl, { label: __('Name'), value: item.name, onChange: function (v) { setAttr({ files: upd(a.files, i, 'name', v) }); }, __nextHasNoMarginBottom: true }),
                                    el(SelectControl, { label: __('Type'), value: item.type, options: [{ label: 'File', value: 'file' }, { label: 'Folder', value: 'folder' }], onChange: function (v) { setAttr({ files: upd(a.files, i, 'type', v) }); }, __nextHasNoMarginBottom: true }),
                                    el(SelectControl, { label: __('Indent Level'), value: item.indent, options: INDENT_OPTIONS, onChange: function (v) { setAttr({ files: upd(a.files, i, 'indent', parseInt(v, 10)) }); }, __nextHasNoMarginBottom: true }),
                                    item.type === 'folder' && el(ToggleControl, { label: __('Show as Open'), checked: item.isOpen, onChange: function (v) { setAttr({ files: upd(a.files, i, 'isOpen', v) }); }, __nextHasNoMarginBottom: true })
                                );
                            }),
                            el('div', { style: { display: 'flex', gap: 6, marginTop: 4 } },
                                el(Button, { variant: 'primary', isSmall: true, onClick: function () { setAttr({ files: a.files.concat([{ name: 'new-file.js', type: 'file', indent: 1, isOpen: false }]) }); } }, __('+ File')),
                                el(Button, { variant: 'secondary', isSmall: true, onClick: function () { setAttr({ files: a.files.concat([{ name: 'new-folder', type: 'folder', indent: 1, isOpen: true }]) }); } }, __('+ Folder'))
                            )
                        ),
                        el(PanelBody, { title: __('Typography'), initialOpen: false },
                            _tc() && el(_tc(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttr({ typoTitle: v }); } }),
                            _tc() && el(_tc(), { label: __('Items', 'blockenberg'), value: a.typoItem, onChange: function (v) { setAttr({ typoItem: v }); } }),
                            el(RangeControl, { label: __('Border Radius'), value: a.borderRadius, min: 0, max: 24, onChange: function (v) { setAttr({ borderRadius: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        el(PanelColorSettings, {
                            title: __('Theme Colors'),
                            initialOpen: false,
                            colorSettings: [
                                { label: __('Background'), value: a.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#0f172a' }); } },
                                { label: __('Header BG'), value: a.headerBg, onChange: function (v) { setAttr({ headerBg: v || '#1e293b' }); } },
                                { label: __('Border'), value: a.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#1e293b' }); } },
                                { label: __('Title'), value: a.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#f8fafc' }); } },
                                { label: __('Folder Name'), value: a.folderColor, onChange: function (v) { setAttr({ folderColor: v || '#60a5fa' }); } },
                                { label: __('Folder Icon'), value: a.folderIconColor, onChange: function (v) { setAttr({ folderIconColor: v || '#fbbf24' }); } },
                                { label: __('File Name'), value: a.fileColor, onChange: function (v) { setAttr({ fileColor: v || '#cbd5e1' }); } },
                                { label: __('Indent Lines'), value: a.lineColor, onChange: function (v) { setAttr({ lineColor: v || '#334155' }); } },
                                { label: __('Dot Red'), value: a.dotRed, onChange: function (v) { setAttr({ dotRed: v || '#ef4444' }); } },
                                { label: __('Dot Yellow'), value: a.dotYellow, onChange: function (v) { setAttr({ dotYellow: v || '#f59e0b' }); } },
                                { label: __('Dot Green'), value: a.dotGreen, onChange: function (v) { setAttr({ dotGreen: v || '#22c55e' }); } }
                            ]
                        }),
                        el(PanelColorSettings, {
                            title: __('File Type Colors'),
                            initialOpen: false,
                            colorSettings: [
                                { label: __('.js / .jsx'), value: a.jsColor, onChange: function (v) { setAttr({ jsColor: v || '#f59e0b' }); } },
                                { label: __('.ts / .tsx'), value: a.tsColor, onChange: function (v) { setAttr({ tsColor: v || '#3b82f6' }); } },
                                { label: __('.css / .scss'), value: a.cssColor, onChange: function (v) { setAttr({ cssColor: v || '#a78bfa' }); } },
                                { label: __('.html'), value: a.htmlColor, onChange: function (v) { setAttr({ htmlColor: v || '#f97316' }); } },
                                { label: __('.json'), value: a.jsonColor, onChange: function (v) { setAttr({ jsonColor: v || '#6ee7b7' }); } },
                                { label: __('.md / .mdx'), value: a.mdColor, onChange: function (v) { setAttr({ mdColor: v || '#94a3b8' }); } },
                                { label: __('.py'), value: a.pyColor, onChange: function (v) { setAttr({ pyColor: v || '#4ade80' }); } },
                                { label: __('Images'), value: a.imgColor, onChange: function (v) { setAttr({ imgColor: v || '#fb7185' }); } }
                            ]
                        })
                    ),
                    el('div', useBlockProps({
                        className: 'bkbg-ft-wrap',
                        style: Object.assign({ background: a.bgColor, borderRadius: a.borderRadius + 'px', border: '1px solid ' + a.borderColor, overflow: 'hidden' },
                            _tv()(a.typoTitle, '--bkbg-ft-tt-'),
                            _tv()(a.typoItem, '--bkbg-ft-ti-')
                        )
                    }),
                        el('div', { className: 'bkbg-ft-titlebar', style: { background: a.headerBg, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderBottom: '1px solid ' + a.borderColor } },
                            el('span', { style: { width: 12, height: 12, borderRadius: '50%', background: a.dotRed, display: 'inline-block' } }),
                            el('span', { style: { width: 12, height: 12, borderRadius: '50%', background: a.dotYellow, display: 'inline-block' } }),
                            el('span', { style: { width: 12, height: 12, borderRadius: '50%', background: a.dotGreen, display: 'inline-block' } }),
                            a.showTitle && el('span', { className: 'bkbg-ft-title', style: { marginLeft: 8, color: a.titleColor } }, a.treeTitle)
                        ),
                        el('div', { className: 'bkbg-ft-body', style: { padding: '12px 0' } },
                            a.files.map(function (item, i) { return renderRow(item, i, a, true, null); })
                        )
                    )
                );
            },
            save: function (props) {
                return el('div', useBlockProps.save(),
                    el('div', { className: 'bkbg-file-tree-app', 'data-opts': JSON.stringify(props.attributes) })
                );
            }
        });
})();
