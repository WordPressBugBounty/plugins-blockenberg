( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var __ = wp.i18n.__;

    var _frTC, _frTV;
    function _tc() { return _frTC || (_frTC = window.bkbgTypographyControl); }
    function _tv() { return _frTV || (_frTV = window.bkbgTypoCssVars); }

    var statusOptions = [
        { label: 'Planned', value: 'planned' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Done', value: 'done' },
        { label: 'Under Review', value: 'under-review' },
        { label: 'Declined', value: 'declined' }
    ];

    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    function statusInfo(s, a) {
        var map = {
            'planned':      { label: 'Planned',      bg: a.plannedBg,      color: a.plannedColor },
            'in-progress':  { label: 'In Progress',  bg: a.inProgressBg,   color: a.inProgressColor },
            'done':         { label: 'Done',          bg: a.doneBg,         color: a.doneColor },
            'declined':     { label: 'Declined',      bg: a.declinedBg,     color: a.declinedColor },
            'under-review': { label: 'Under Review',  bg: a.underReviewBg,  color: a.underReviewColor }
        };
        return map[s] || map['planned'];
    }

    function renderCard(req, a, lh) {
        var si = statusInfo(req.status, a);
        var card = el('div', {
            className: 'bkbg-fr-card',
            style: { background: a.cardBg, border: '1px solid ' + a.borderColor, borderRadius: a.cardRadius + 'px' }
        },
            el('div', { className: 'bkbg-fr-card-top' },
                el('div', { className: 'bkbg-fr-card-info' },
                    el('div', { className: 'bkbg-fr-card-title', style: { color: a.cardTitleColor } }, req.title),
                    el('div', { className: 'bkbg-fr-card-desc', style: { color: a.cardDescColor } }, req.description)
                ),
                a.showVotes && el('div', { className: 'bkbg-fr-votes', style: { background: a.votesBg, color: a.votesColor } },
                    el('span', { className: 'bkbg-fr-votes-arrow' }, '▲'),
                    el('span', null, req.votes)
                )
            ),
            el('div', { className: 'bkbg-fr-card-bottom' },
                el('span', { className: 'bkbg-fr-status-badge', style: { background: si.bg, color: si.color } }, si.label),
                a.showCategory && req.category && el('span', { className: 'bkbg-fr-category', style: { background: a.categoryBg, color: a.categoryColor } }, req.category),
                a.showDate && req.date && el('span', { className: 'bkbg-fr-date', style: { color: a.dateColor } }, req.date)
            )
        );
        return card;
    }

    wp.blocks.registerBlockType('blockenberg/feature-request', {
        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;
            var lh = (a.lineHeight / 100).toFixed(2);

            function sortedRequests() {
                return a.requests.slice().sort(function (x, y) { return y.votes - x.votes; });
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Board Settings'), initialOpen: true },
                        el(TextControl, { label: __('Board Title'), value: a.boardTitle, onChange: function (v) { setAttr({ boardTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextareaControl, { label: __('Description'), value: a.description, onChange: function (v) { setAttr({ description: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Description'), checked: a.showDescription, onChange: function (v) { setAttr({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Votes'), checked: a.showVotes, onChange: function (v) { setAttr({ showVotes: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Category'), checked: a.showCategory, onChange: function (v) { setAttr({ showCategory: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Date'), checked: a.showDate, onChange: function (v) { setAttr({ showDate: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Requests'), initialOpen: false },
                        a.requests.map(function (req, i) {
                            return el('div', { key: i, style: { border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12, background: '#fafafa' } },
                                el('strong', { style: { display: 'block', marginBottom: 6 } }, 'Request ' + (i + 1)),
                                el(TextControl, { label: __('Title'), value: req.title, onChange: function (v) { setAttr({ requests: upd(a.requests, i, 'title', v) }); }, __nextHasNoMarginBottom: true }),
                                el(TextareaControl, { label: __('Description'), value: req.description, onChange: function (v) { setAttr({ requests: upd(a.requests, i, 'description', v) }); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Votes'), type: 'number', value: String(req.votes), onChange: function (v) { setAttr({ requests: upd(a.requests, i, 'votes', parseInt(v, 10) || 0) }); }, __nextHasNoMarginBottom: true }),
                                el(SelectControl, { label: __('Status'), value: req.status, options: statusOptions, onChange: function (v) { setAttr({ requests: upd(a.requests, i, 'status', v) }); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Category'), value: req.category, onChange: function (v) { setAttr({ requests: upd(a.requests, i, 'category', v) }); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Date'), value: req.date, onChange: function (v) { setAttr({ requests: upd(a.requests, i, 'date', v) }); }, __nextHasNoMarginBottom: true }),
                                el(Button, { isDestructive: true, variant: 'secondary', onClick: function () { setAttr({ requests: a.requests.filter(function (_, j) { return j !== i; }) }); } }, __('Remove'))
                            );
                        }),
                        el(Button, { variant: 'primary', onClick: function () { setAttr({ requests: a.requests.concat([{ title: 'New Feature Request', description: 'Describe the feature here.', votes: 0, status: 'under-review', category: 'General', date: '' }]) }); } }, __('+ Add Request'))
                    ),
                    el(PanelBody, { title: __('Typography'), initialOpen: false },
                        _tc() && el(_tc(), {
                            label: __('Board Title Typography', 'blockenberg'),
                            value: a.typoTitle,
                            onChange: function (v) { setAttr({ typoTitle: v }); }
                        }),
                        _tc() && el(_tc(), {
                            label: __('Body Typography', 'blockenberg'),
                            value: a.typoBody,
                            onChange: function (v) { setAttr({ typoBody: v }); }
                        }),
                        _tc() && el(_tc(), {
                            label: __('Card Title Typography', 'blockenberg'),
                            value: a.typoCardTitle,
                            onChange: function (v) { setAttr({ typoCardTitle: v }); }
                        })
                    ),
                    el(PanelColorSettings, {
                        title: __('Layout Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background'), value: a.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#f8fafc' }); } },
                            { label: __('Card Background'), value: a.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#ffffff' }); } },
                            { label: __('Border'), value: a.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#e2e8f0' }); } },
                            { label: __('Board Title'), value: a.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#0f172a' }); } },
                            { label: __('Board Description'), value: a.descColor, onChange: function (v) { setAttr({ descColor: v || '#64748b' }); } },
                            { label: __('Card Title'), value: a.cardTitleColor, onChange: function (v) { setAttr({ cardTitleColor: v || '#1e293b' }); } },
                            { label: __('Card Description'), value: a.cardDescColor, onChange: function (v) { setAttr({ cardDescColor: v || '#64748b' }); } },
                            { label: __('Votes BG'), value: a.votesBg, onChange: function (v) { setAttr({ votesBg: v || '#f1f5f9' }); } },
                            { label: __('Votes Text'), value: a.votesColor, onChange: function (v) { setAttr({ votesColor: v || '#334155' }); } },
                            { label: __('Category BG'), value: a.categoryBg, onChange: function (v) { setAttr({ categoryBg: v || '#f1f5f9' }); } },
                            { label: __('Category Text'), value: a.categoryColor, onChange: function (v) { setAttr({ categoryColor: v || '#475569' }); } },
                            { label: __('Date Text'), value: a.dateColor, onChange: function (v) { setAttr({ dateColor: v || '#94a3b8' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Status Badge Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Planned BG'), value: a.plannedBg, onChange: function (v) { setAttr({ plannedBg: v || '#dbeafe' }); } },
                            { label: __('Planned Text'), value: a.plannedColor, onChange: function (v) { setAttr({ plannedColor: v || '#1e40af' }); } },
                            { label: __('In Progress BG'), value: a.inProgressBg, onChange: function (v) { setAttr({ inProgressBg: v || '#ede9fe' }); } },
                            { label: __('In Progress Text'), value: a.inProgressColor, onChange: function (v) { setAttr({ inProgressColor: v || '#5b21b6' }); } },
                            { label: __('Done BG'), value: a.doneBg, onChange: function (v) { setAttr({ doneBg: v || '#dcfce7' }); } },
                            { label: __('Done Text'), value: a.doneColor, onChange: function (v) { setAttr({ doneColor: v || '#14532d' }); } },
                            { label: __('Declined BG'), value: a.declinedBg, onChange: function (v) { setAttr({ declinedBg: v || '#fee2e2' }); } },
                            { label: __('Declined Text'), value: a.declinedColor, onChange: function (v) { setAttr({ declinedColor: v || '#991b1b' }); } },
                            { label: __('Under Review BG'), value: a.underReviewBg, onChange: function (v) { setAttr({ underReviewBg: v || '#fef9c3' }); } },
                            { label: __('Under Review Text'), value: a.underReviewColor, onChange: function (v) { setAttr({ underReviewColor: v || '#713f12' }); } }
                        ]
                    })
                ),
                el('div', useBlockProps({ className: 'bkbg-fr-wrap', style: Object.assign({ background: a.bgColor, borderRadius: a.borderRadius + 'px', padding: 32 }, _tv()(a.typoTitle, '--bkbg-fr-tt-'), _tv()(a.typoBody, '--bkbg-fr-bd-'), _tv()(a.typoCardTitle, '--bkbg-fr-ct-')) }),
                    el('div', { className: 'bkbg-fr-header' },
                        el('h2', { className: 'bkbg-fr-title', style: { color: a.titleColor } }, a.boardTitle),
                        a.showDescription && el('p', { className: 'bkbg-fr-desc', style: { color: a.descColor } }, a.description)
                    ),
                    el('div', { className: 'bkbg-fr-grid' },
                        sortedRequests().map(function (req, i) { return renderCard(req, a, lh); })
                    )
                )
            );
        },
        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-feature-request-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
