(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var PanelBody = wp.components.PanelBody;
        var TextControl = wp.components.TextControl;
        var ToggleControl = wp.components.ToggleControl;
        var RangeControl = wp.components.RangeControl;
        var Button = wp.components.Button;
        var SelectControl = wp.components.SelectControl;

        function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
        function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
        function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

        // ── helpers ────────────────────────────────────────────────────
        function upd(arr, idx, field, val) {
            return arr.map(function (e, i) {
                if (i !== idx) return e;
                var u = {}; u[field] = val;
                return Object.assign({}, e, u);
            });
        }

        // detect prefix from commit message (feat / fix / chore / docs / refactor / etc.)
        function getPrefix(msg) {
            var m = msg.match(/^(\w+)[\s:!]/);
            return m ? m[1].toLowerCase() : '';
        }

        // convert author name to 1–2 initials
        function initials(name) {
            var parts = (name || 'A').trim().split(/\s+/);
            if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            return parts[0][0].toUpperCase();
        }

        // color for prefix type badge
        function prefixColor(prefix, a) {
            if (prefix === 'feat')     return a.featColor;
            if (prefix === 'fix')      return a.fixColor;
            if (prefix === 'chore')    return a.choreColor;
            if (prefix === 'docs')     return a.docsColor;
            if (prefix === 'refactor') return a.refactorColor;
            return a.choreColor;
        }

        // ── row renderer ───────────────────────────────────────────────
        function renderCommitRow(commit, a, idx, isLast) {
            var prefix   = getPrefix(commit.message);
            var msgText  = commit.message;
            var initText = initials(commit.author);

            // Left timeline column
            var dot = el('div', {
                style: {
                    width: '10px', height: '10px',
                    borderRadius: '50%',
                    background: a.dotColor,
                    flexShrink: '0',
                    marginTop: '5px',
                    position: 'relative',
                    zIndex: '1',
                    boxShadow: '0 0 0 3px ' + a.bgColor + ', 0 0 0 5px ' + a.dotColor + '22'
                }
            });
            var line = !isLast ? el('div', {
                style: {
                    width: '2px',
                    flex: '1',
                    background: a.lineColor,
                    margin: '4px auto 0',
                    minHeight: '24px'
                }
            }) : null;
            var leftCol = el('div', {
                style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: '0', marginTop: '2px' }
            }, dot, line);

            // Avatar
            var avatar = a.showAuthorInitials ? el('div', {
                style: {
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: a.authorBg,
                    color: a.authorColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '700', flexShrink: '0'
                }
            }, initText) : null;

            // Prefix type badge
            var prefixBadge = prefix ? el('span', {
                style: {
                    fontSize: '11px', fontWeight: '600',
                    color: prefixColor(prefix, a),
                    marginRight: '6px', letterSpacing: '0.02em'
                }
            }, prefix) : null;

            // Tags
            var tagEls = (a.showTags && commit.tags && commit.tags.length) ? commit.tags.map(function (tag) {
                return el('span', {
                    style: {
                        display: 'inline-flex', alignItems: 'center',
                        background: a.tagBg, color: a.tagColor,
                        borderRadius: '4px', padding: '1px 7px',
                        fontSize: '11px', fontWeight: '600', letterSpacing: '0.04em',
                        marginLeft: '6px'
                    }
                }, '🏷 ' + tag);
            }) : [];

            // Message row (prefix badge + message text + tags)
            var msgRow = el('div', { style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' } },
                prefixBadge,
                el('span', { className: 'bkcmh-msg', style: { color: a.messageColor } }, msgText)
            );
            var tagRow = tagEls.length ? el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' } }, tagEls) : null;

            // Meta row (avatar + author + hash + date)
            var hashSpan = a.showHash ? el('span', {
                className: 'bkcmh-hash',
                style: {
                    color: a.hashColor,
                    background: a.tagBg,
                    borderRadius: '4px', padding: '1px 6px'
                }
            }, commit.hash) : null;
            var authorSpan = el('span', { className: 'bkcmh-meta', style: { color: a.authorColor } }, commit.author);
            var dateSpan = a.showDate ? el('span', { className: 'bkcmh-meta', style: { color: a.dateColor, marginLeft: 'auto' } }, commit.date) : null;

            var metaRow = el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
                avatar, authorSpan, hashSpan, dateSpan
            );

            var rightCol = el('div', {
                style: { flex: '1', minWidth: '0', paddingBottom: !isLast ? '16px' : '0' }
            }, msgRow, tagRow, metaRow);

            return el('div', {
                key: idx,
                style: { display: 'flex', gap: '14px' }
            }, leftCol, rightCol);
        }

        // ── edit ───────────────────────────────────────────────────────
        function Edit(props) {
            var a   = props.attributes;
            var set = props.setAttributes;

            // colour panel definitions
            var themeColors = [
                { label: __('Background'), value: a.bgColor,      onChange: function (v) { set({ bgColor: v || '#0f172a' }); } },
                { label: __('Header BG'),  value: a.headerBg,     onChange: function (v) { set({ headerBg: v || '#1e293b' }); } },
                { label: __('Border'),     value: a.borderColor,   onChange: function (v) { set({ borderColor: v || '#1e293b' }); } },
                { label: __('Repo Name'),  value: a.repoColor,     onChange: function (v) { set({ repoColor: v || '#f8fafc' }); } },
                { label: __('Branch BG'),  value: a.branchBg,      onChange: function (v) { set({ branchBg: v || '#166534' }); } },
                { label: __('Branch Text'),value: a.branchColor,   onChange: function (v) { set({ branchColor: v || '#4ade80' }); } },
                { label: __('Commit Dot'), value: a.dotColor,      onChange: function (v) { set({ dotColor: v || '#3b82f6' }); } },
                { label: __('Branch Line'),value: a.lineColor,     onChange: function (v) { set({ lineColor: v || '#1e3a5f' }); } },
                { label: __('Hash Badge'), value: a.hashColor,     onChange: function (v) { set({ hashColor: v || '#60a5fa' }); } },
                { label: __('Message'),    value: a.messageColor,  onChange: function (v) { set({ messageColor: v || '#e2e8f0' }); } },
                { label: __('Avatar BG'),  value: a.authorBg,      onChange: function (v) { set({ authorBg: v || '#334155' }); } },
                { label: __('Author Text'),value: a.authorColor,   onChange: function (v) { set({ authorColor: v || '#94a3b8' }); } },
                { label: __('Date Text'),  value: a.dateColor,     onChange: function (v) { set({ dateColor: v || '#64748b' }); } },
                { label: __('Tag BG'),     value: a.tagBg,         onChange: function (v) { set({ tagBg: v || '#1e3a5f' }); } },
                { label: __('Tag Text'),   value: a.tagColor,      onChange: function (v) { set({ tagColor: v || '#60a5fa' }); } },
            ];
            var typeColors = [
                { label: __('feat'),     value: a.featColor,     onChange: function (v) { set({ featColor: v || '#4ade80' }); } },
                { label: __('fix'),      value: a.fixColor,      onChange: function (v) { set({ fixColor: v || '#f87171' }); } },
                { label: __('chore'),    value: a.choreColor,    onChange: function (v) { set({ choreColor: v || '#94a3b8' }); } },
                { label: __('docs'),     value: a.docsColor,     onChange: function (v) { set({ docsColor: v || '#fbbf24' }); } },
                { label: __('refactor'), value: a.refactorColor, onChange: function (v) { set({ refactorColor: v || '#a78bfa' }); } },
            ];

            // Inspector
            var inspector = el(InspectorControls, {},
                // Repo / display settings
                el(PanelBody, { title: __('Repository'), initialOpen: true },
                    el(TextControl, {
                        label: __('Repo name'), value: a.repoName, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ repoName: v }); }
                    }),
                    el(TextControl, {
                        label: __('Branch'), value: a.branchName, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ branchName: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show branch badge'), checked: a.showBranch, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showBranch: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show hash'), checked: a.showHash, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showHash: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show author avatar'), checked: a.showAuthorInitials, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showAuthorInitials: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show date'), checked: a.showDate, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showDate: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show version tags'), checked: a.showTags, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showTags: v }); }
                    })
                ),
                // Typography
                el(PanelBody, { title: __('Typography'), initialOpen: false },
                    el(getTypographyControl(), { label: __('Message', 'blockenberg'), value: a.typoMessage, onChange: function (v) { set({ typoMessage: v }); } }),
                    el(getTypographyControl(), { label: __('Meta', 'blockenberg'), value: a.typoMeta, onChange: function (v) { set({ typoMeta: v }); } })
                ),
                // Appearance
                el(PanelBody, { title: __('Appearance'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Border radius'), value: a.borderRadius, min: 0, max: 32, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ borderRadius: v }); }
                    })
                ),
                // Commits editor
                el(PanelBody, { title: __('Commits (' + a.commits.length + ')'), initialOpen: false },
                    a.commits.map(function (c, idx) {
                        return el(PanelBody, {
                            key: idx,
                            title: (idx + 1) + '. ' + c.message.substring(0, 32) + (c.message.length > 32 ? '…' : ''),
                            initialOpen: false
                        },
                            el(TextControl, {
                                label: __('Commit message'), value: c.message, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ commits: upd(a.commits, idx, 'message', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Short hash (7 chars)'), value: c.hash, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ commits: upd(a.commits, idx, 'hash', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Author name'), value: c.author, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ commits: upd(a.commits, idx, 'author', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Date'), value: c.date, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ commits: upd(a.commits, idx, 'date', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Tags (comma-separated)'), value: (c.tags || []).join(', '), __nextHasNoMarginBottom: true,
                                onChange: function (v) {
                                    var tags = v.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
                                    set({ commits: upd(a.commits, idx, 'tags', tags) });
                                }
                            }),
                            el(Button, {
                                variant: 'secondary', isDestructive: true, __nextHasNoMarginBottom: true,
                                onClick: function () {
                                    var next = a.commits.slice(); next.splice(idx, 1);
                                    set({ commits: next });
                                }
                            }, __('Remove commit'))
                        );
                    }),
                    el(Button, {
                        variant: 'primary', __nextHasNoMarginBottom: true,
                        onClick: function () {
                            set({ commits: a.commits.concat([{ hash: 'a1b2c3d', message: 'feat: add new feature', author: 'Author Name', date: 'Jan 1, 2026', tags: [] }]) });
                        }
                    }, __('+ Add commit'))
                ),
                // Colors
                el(PanelColorSettings, {
                    title: __('Theme Colors'),
                    initialOpen: false,
                    colorSettings: themeColors
                }),
                el(PanelColorSettings, {
                    title: __('Type Prefix Colors'),
                    initialOpen: false,
                    colorSettings: typeColors
                })
            );

            // ── Preview ───────────────────────────────────────────────
            // Header traffic lights
            var dots = el('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } },
                el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'block' } }),
                el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', display: 'block' } }),
                el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', display: 'block' } })
            );
            var repoSpan = el('span', { style: { color: a.repoColor, fontWeight: '700', fontSize: (a.fontSize + 1) + 'px', letterSpacing: '0.01em' } },
                '📁 ' + a.repoName
            );
            var branchBadge = a.showBranch ? el('span', {
                style: {
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: a.branchBg, color: a.branchColor,
                    borderRadius: '20px', padding: '2px 10px',
                    fontSize: '12px', fontWeight: '600'
                }
            },
                el('span', { style: { width: '8px', height: '8px', borderRadius: '50%', background: a.branchColor, display: 'inline-block' } }),
                a.branchName
            ) : null;

            var header = el('div', {
                style: {
                    display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                    padding: '12px 16px',
                    background: a.headerBg,
                    borderBottom: '1px solid ' + a.borderColor,
                    borderRadius: a.borderRadius + 'px ' + a.borderRadius + 'px 0 0'
                }
            }, dots, repoSpan, branchBadge);

            var body = el('div', { style: { padding: '20px 20px 12px' } },
                a.commits.map(function (c, idx) {
                    return renderCommitRow(c, a, idx, idx === a.commits.length - 1);
                })
            );

            var wrapStyle = Object.assign({
                        background: a.bgColor,
                        border: '1px solid ' + a.borderColor,
                        borderRadius: a.borderRadius + 'px',
                        overflow: 'hidden',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                    }, _tv(a.typoMessage, '--bkcmh-msg-'), _tv(a.typoMeta, '--bkcmh-meta-'));

            return el(Fragment, {},
                inspector,
                el('div', Object.assign({}, useBlockProps(), { style: wrapStyle }), header, body)
            );
        }

        registerBlockType('blockenberg/commit-history', {
            edit: Edit,
            save: function (props) {
                var a = props.attributes;
                var sv = Object.assign({}, _tv(a.typoMessage, '--bkcmh-msg-'), _tv(a.typoMeta, '--bkcmh-meta-'));
                return el('div', useBlockProps.save({ style: sv }),
                    el('div', { className: 'bkbg-commit-history-app', 'data-opts': JSON.stringify(a) })
                );
            }
        });
})();
