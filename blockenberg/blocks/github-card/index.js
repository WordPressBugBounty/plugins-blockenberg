( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;

    var _ghcTC, _ghcTV;
    function _tc() { return _ghcTC || (_ghcTC = window.bkbgTypographyControl); }
    function _tv() { return _ghcTV || (_ghcTV = window.bkbgTypoCssVars); }

    /* ── GitHub Card preview (static mock) ── */
    function EditorPreview(props) {
        var attr = props.attr;
        var isRepo = attr.mode === 'repo';
        var handle = attr.username || 'username';
        var repoLabel = attr.repoName || 'repository-name';
        var fullName = isRepo ? handle + '/' + repoLabel : handle;

        var cardStyle = {
            background: attr.cardBg,
            border: '1px solid ' + attr.borderColor,
            borderRadius: attr.cardRadius + 'px',
            padding: attr.padding + 'px',
            maxWidth: attr.maxWidth + 'px',
            margin: attr.align2 === 'center' ? '0 auto' :
                    attr.align2 === 'right'  ? '0 0 0 auto' : '0',
            color: attr.headingColor
        };

        var mockStats = isRepo
            ? [{ icon: '⭐', label: '128', key: 'stars' }, { icon: '🍴', label: '34', key: 'forks' }, { icon: '👁', label: '12', key: 'watchers' }]
            : [{ icon: '📦', label: '32', key: 'repos' }, { icon: '👥', label: '1.2k', key: 'followers' }, { icon: '👤', label: '12', key: 'following' }];

        return el('div', { className: 'bkbg-ghc-app', style: cardStyle },
            /* Header row */
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' } },
                attr.showAvatar && el('div', {
                    style: {
                        width: attr.avatarSize + 'px', height: attr.avatarSize + 'px',
                        borderRadius: isRepo ? '8px' : '50%',
                        background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', color: '#fff'
                    }
                }, isRepo ? '📁' : '👤'),
                el('div', {},
                    el('div', { className: 'bkbg-ghc-name-row', style: { color: attr.linkColor } }, fullName),
                    attr.showBio && el('div', { className: 'bkbg-ghc-handle', style: { color: attr.metaColor, marginTop: '4px' } },
                        isRepo ? 'A great open source repository' : 'Software Developer & Creator'
                    )
                )
            ),
            /* Description */
            attr.showBio && el('div', { className: 'bkbg-ghc-desc', style: { color: attr.descColor, marginBottom: '16px' } },
                isRepo
                    ? 'This repository contains amazing code that solves real-world problems efficiently and elegantly.'
                    : 'Passionate about building great software. Open source contributor.'
            ),
            /* Language + topics */
            isRepo && el('div', { className: 'bkbg-ghc-meta-row', style: { marginBottom: '14px' } },
                attr.showLanguage && el('span', {
                    className: 'bkbg-ghc-lang', style: { color: attr.metaColor }
                }, el('span', { style: { width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' } }), 'TypeScript'),
                attr.showTopics && ['wordpress', 'gutenberg', 'blocks'].map(function (t, i) {
                    return el('span', { key: i, className: 'bkbg-ghc-topic', style: { background: 'rgba(56,139,253,0.15)', color: attr.linkColor } }, t);
                })
            ),
            /* Stats */
            attr.showStats && el('div', { className: 'bkbg-ghc-stats' },
                mockStats.map(function (s) {
                    return el('div', { key: s.key, className: 'bkbg-ghc-stat', style: { background: attr.statBg, border: '1px solid ' + attr.borderColor } },
                        el('div', { className: 'bkbg-ghc-stat-val', style: { color: attr.headingColor } }, s.label),
                        el('div', { className: 'bkbg-ghc-stat-lbl', style: { color: attr.metaColor } }, s.key)
                    );
                })
            ),
            /* Footer */
            attr.showLastUpdate && el('div', { className: 'bkbg-ghc-footer', style: { color: attr.metaColor } },
                'Updated 2 hours ago'
            )
        );
    }

    registerBlockType('blockenberg/github-card', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ style: Object.assign({ background: attr.sectionBg || undefined, padding: '20px' }, _tv()(attr.typoHeading, '--bkbg-ghc-hd-'), _tv()(attr.typoBody, '--bkbg-ghc-bd-'), _tv()(attr.typoMeta, '--bkbg-ghc-mt-')) });

            var inspector = el(InspectorControls, {},
                /* Source */
                el(PanelBody, { title: __('GitHub Source', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Card Type', 'blockenberg'),
                        value: attr.mode,
                        options: [{ label: 'Repository', value: 'repo' }, { label: 'User Profile', value: 'user' }],
                        onChange: function (v) { setAttr({ mode: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el('div', { style: { marginTop: '12px' } }),
                    el(TextControl, {
                        label: __('GitHub Username', 'blockenberg'),
                        value: attr.username,
                        onChange: function (v) { setAttr({ username: v }); },
                        placeholder: 'e.g. torvalds',
                        __nextHasNoMarginBottom: true
                    }),
                    attr.mode === 'repo' && el('div', {},
                        el('div', { style: { marginTop: '8px' } }),
                        el(TextControl, {
                            label: __('Repository Name', 'blockenberg'),
                            value: attr.repoName,
                            onChange: function (v) { setAttr({ repoName: v }); },
                            placeholder: 'e.g. linux',
                            help: __('Just the repo name, not the full URL.', 'blockenberg'),
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Cache Duration (minutes)', 'blockenberg'), value: attr.cacheMinutes, min: 5, max: 1440, onChange: function (v) { setAttr({ cacheMinutes: v }); }, help: __('Stores API response in localStorage to avoid rate limits.', 'blockenberg'), __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(ToggleControl, { label: __('Open Links in New Tab', 'blockenberg'), checked: attr.openInNewTab, onChange: function (v) { setAttr({ openInNewTab: v }); }, __nextHasNoMarginBottom: true })
                ),
                /* Display Fields */
                el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Avatar', 'blockenberg'), checked: attr.showAvatar, onChange: function (v) { setAttr({ showAvatar: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Bio / Description', 'blockenberg'), checked: attr.showBio, onChange: function (v) { setAttr({ showBio: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Stats', 'blockenberg'), checked: attr.showStats, onChange: function (v) { setAttr({ showStats: v }); }, __nextHasNoMarginBottom: true }),
                    attr.mode === 'repo' && el(ToggleControl, { label: __('Show Language', 'blockenberg'), checked: attr.showLanguage, onChange: function (v) { setAttr({ showLanguage: v }); }, __nextHasNoMarginBottom: true }),
                    attr.mode === 'repo' && el(ToggleControl, { label: __('Show Topics', 'blockenberg'), checked: attr.showTopics, onChange: function (v) { setAttr({ showTopics: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Last Updated', 'blockenberg'), checked: attr.showLastUpdate, onChange: function (v) { setAttr({ showLastUpdate: v }); }, __nextHasNoMarginBottom: true })
                ),
                /* Layout */
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Alignment', 'blockenberg'),
                        value: attr.align2,
                        options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }],
                        onChange: function (v) { setAttr({ align2: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: attr.maxWidth, min: 280, max: 800, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Padding (px)', 'blockenberg'), value: attr.padding, min: 12, max: 48, onChange: function (v) { setAttr({ padding: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Corner Radius (px)', 'blockenberg'), value: attr.cardRadius, min: 0, max: 32, onChange: function (v) { setAttr({ cardRadius: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Avatar Size (px)', 'blockenberg'), value: attr.avatarSize, min: 32, max: 120, onChange: function (v) { setAttr({ avatarSize: v }); }, __nextHasNoMarginBottom: true })
                ),
                /* Typography */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc()({ label: __('Heading', 'blockenberg'), value: attr.typoHeading, onChange: function (v) { setAttr({ typoHeading: v }); } }),
                    _tc()({ label: __('Body', 'blockenberg'), value: attr.typoBody, onChange: function (v) { setAttr({ typoBody: v }); } }),
                    _tc()({ label: __('Meta', 'blockenberg'), value: attr.typoMeta, onChange: function (v) { setAttr({ typoMeta: v }); } })
                ),
                /* Colors */
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#0d1117' }); } },
                        { label: __('Heading / Name', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#e6edf3' }); } },
                        { label: __('Description', 'blockenberg'), value: attr.descColor, onChange: function (v) { setAttr({ descColor: v || '#8b949e' }); } },
                        { label: __('Meta / Stats Label', 'blockenberg'), value: attr.metaColor, onChange: function (v) { setAttr({ metaColor: v || '#8b949e' }); } },
                        { label: __('Link / Accent', 'blockenberg'), value: attr.linkColor, onChange: function (v) { setAttr({ linkColor: v || '#58a6ff' }); } },
                        { label: __('Stat Tile Background', 'blockenberg'), value: attr.statBg, onChange: function (v) { setAttr({ statBg: v || '#161b22' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#30363d' }); } },
                        { label: __('Section Background', 'blockenberg'), value: attr.sectionBg, onChange: function (v) { setAttr({ sectionBg: v || '' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                inspector,
                (!attr.username)
                    ? el('div', {
                        style: {
                            textAlign: 'center', padding: '40px', border: '2px dashed #30363d',
                            borderRadius: attr.cardRadius + 'px', color: '#8b949e', fontFamily: 'system-ui, sans-serif'
                        }
                    },
                        el('div', { style: { fontSize: '32px', marginBottom: '12px' } }, '𝖦'),
                        el('div', { style: { fontWeight: 600, marginBottom: '8px' } }, 'GitHub Card'),
                        el('div', { style: { fontSize: '14px' } }, 'Enter a GitHub username in the block settings to preview.')
                    )
                    : el(EditorPreview, { attr: attr })
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var blockProps = useBlockProps.save();
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-ghc-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
