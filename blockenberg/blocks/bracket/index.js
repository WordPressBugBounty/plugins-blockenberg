( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;
    var __ = wp.i18n.__;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    function _tv(typo, prefix) {
        if (!typo) return {};
        var s = {};
        if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
        if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
        if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
        if (typo.style)      s[prefix + 'font-style'] = typo.style;
        if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
        return s;
    }

    // ── bracket logic ────────────────────────────────────────────────────────────
    function getRounds(bracketSize) {
        var rounds = [];
        var n = bracketSize;
        while (n >= 2) { rounds.push(n / 2); n = n / 2; }
        return rounds; // e.g. [4, 2, 1] for bracketSize=8
    }

    function getMatchKey(r, m) { return 'r' + r + '_m' + m; }

    function getMatchTeams(r, m, teams, winners) {
        if (r === 0) {
            return [teams[m * 2] || '?', teams[m * 2 + 1] || '?'];
        }
        var t1key = getMatchKey(r - 1, m * 2);
        var t2key = getMatchKey(r - 1, m * 2 + 1);
        return [winners[t1key] || '?', winners[t2key] || '?'];
    }

    function setWinner(winners, r, m, team) {
        var newWinners = Object.assign({}, winners);
        var key = getMatchKey(r, m);
        // If winner changes, clear downstream
        if (newWinners[key] !== team) {
            newWinners[key] = team;
            // Clear all keys that depended on this match
            clearDownstream(newWinners, r, m);
        }
        return newWinners;
    }

    function clearDownstream(winners, r, m) {
        // The result of (r, m) feeds into (r+1, Math.floor(m/2))
        var nextR = r + 1;
        var nextM = Math.floor(m / 2);
        var nextKey = getMatchKey(nextR, nextM);
        // Only clear if there's a winner set downstream
        if (winners[nextKey]) {
            delete winners[nextKey];
            clearDownstream(winners, nextR, nextM);
        }
    }

    // ── Match component ──────────────────────────────────────────────────────────
    function Match(props) {
        var a = props.a;
        var roundIdx = props.roundIdx;
        var matchIdx = props.matchIdx;
        var teams = props.teams;
        var winners = props.winners;
        var setAttributes = props.setAttributes;
        var isLast = props.isLast; // last match in last round

        var matchTeams = getMatchTeams(roundIdx, matchIdx, teams, winners);
        var winnerKey = getMatchKey(roundIdx, matchIdx);
        var currentWinner = winners[winnerKey] || null;

        function pickWinner(team) {
            if (team === '?') return;
            var newWinners = setWinner(Object.assign({}, winners), roundIdx, matchIdx, team);
            setAttributes({ winners: newWinners });
        }

        return el('div', { className: 'bkbg-bk-match', style: { borderRadius: a.borderRadius + 'px', borderColor: a.matchBorderColor } },
            matchTeams.map(function (team, ti) {
                var isWinner = currentWinner === team && team !== '?';
                var isLoser = currentWinner && currentWinner !== team && team !== '?';
                var available = team !== '?';

                return el('div', {
                    key: ti,
                    className: 'bkbg-bk-team' + (isWinner ? ' is-winner' : '') + (isLoser ? ' is-loser' : '') + (available ? ' is-available' : ''),
                    style: {
                        background: isWinner ? a.winnerBg : a.matchBg,
                        color: isWinner ? a.winnerColor : (isLoser ? a.loserColor : a.teamColor),
                        borderColor: isWinner ? a.winnerBorderColor : 'transparent',
                        cursor: available ? 'pointer' : 'default'
                    },
                    onClick: function () { if (available) pickWinner(team); },
                    title: available ? __('Click to set as winner') : ''
                },
                    isWinner && el('span', { className: 'bkbg-bk-win-icon' }, '★'),
                    el('span', { className: 'bkbg-bk-team-name' }, team)
                );
            })
        );
    }

    // ── BracketPreview ───────────────────────────────────────────────────────────
    function BracketPreview(props) {
        var a = props.a;
        var setAttributes = props.setAttributes;

        var rounds = getRounds(a.bracketSize);
        var numRounds = rounds.length;

        // Default round labels: expand if needed
        var defaultLabels = ['Round of ' + a.bracketSize, 'Quarterfinals', 'Semifinals', 'Final'];
        function getRoundLabel(i) {
            if (a.roundLabels && a.roundLabels[i] !== undefined) return a.roundLabels[i];
            if (i === numRounds - 1) return 'Final';
            if (i === numRounds - 2) return 'Semifinals';
            return 'Round ' + (i + 1);
        }

        // Champion
        var finalMatchKey = getMatchKey(numRounds - 1, 0);
        var champion = a.winners[finalMatchKey] || null;

        return el('div', { className: 'bkbg-bk-block', style: { background: a.bgColor, borderRadius: a.borderRadius + 'px' } },
            a.showTitle && el('h3', {
                className: 'bkbg-bk-title',
                style: { color: a.titleColor },
                contentEditable: true,
                suppressContentEditableWarning: true,
                onBlur: function (e) { setAttributes({ bracketTitle: e.target.textContent }); }
            }, a.bracketTitle),
            el('div', { className: 'bkbg-bk-grid' },
                rounds.map(function (matchCount, ri) {
                    return el('div', { key: ri, className: 'bkbg-bk-round' },
                        a.showRoundLabels && el('div', { className: 'bkbg-bk-round-label', style: { color: a.roundLabelColor } },
                            getRoundLabel(ri)
                        ),
                        el('div', { className: 'bkbg-bk-matches' },
                            Array.from({ length: matchCount }, function (_, mi) {
                                return el(Match, {
                                    key: mi,
                                    a: a,
                                    roundIdx: ri,
                                    matchIdx: mi,
                                    teams: a.teams,
                                    winners: a.winners,
                                    setAttributes: setAttributes
                                });
                            })
                        )
                    );
                }),
                // Champion column
                el('div', { className: 'bkbg-bk-round bkbg-bk-champion-col' },
                    a.showRoundLabels && el('div', { className: 'bkbg-bk-round-label', style: { color: a.roundLabelColor } }, ''),
                    el('div', { className: 'bkbg-bk-matches' },
                        el('div', {
                            className: 'bkbg-bk-champion',
                            style: {
                                background: a.championBg,
                                borderColor: a.championBorderColor,
                                color: a.championColor,
                                borderRadius: a.borderRadius + 'px'
                            }
                        },
                            el('div', { className: 'bkbg-bk-champion-label' }, a.winnerLabel),
                            el('div', { className: 'bkbg-bk-champion-name' }, champion || '—')
                        )
                    )
                )
            )
        );
    }

    // ── register ─────────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/bracket', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            function updateTeam(idx, val) {
                var newTeams = a.teams.slice();
                newTeams[idx] = val;
                setAttributes({ teams: newTeams });
            }

            function updateRoundLabel(idx, val) {
                var newLabels = (a.roundLabels || []).slice();
                while (newLabels.length <= idx) newLabels.push('');
                newLabels[idx] = val;
                setAttributes({ roundLabels: newLabels });
            }

            var rounds = getRounds(a.bracketSize);

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Bracket Setup'), initialOpen: true },
                        el(SelectControl, {
                            label: __('Bracket size'),
                            value: String(a.bracketSize),
                            __nextHasNoMarginBottom: true,
                            options: [
                                { value: '4', label: '4 Teams (2 rounds)' },
                                { value: '8', label: '8 Teams (3 rounds)' },
                                { value: '16', label: '16 Teams (4 rounds)' }
                            ],
                            onChange: function (v) {
                                var size = parseInt(v, 10);
                                var newTeams = Array.from({ length: size }, function (_, i) {
                                    return a.teams[i] || 'Team ' + (i + 1);
                                });
                                setAttributes({ bracketSize: size, teams: newTeams, winners: {} });
                            }
                        }),
                        el(Button, {
                            variant: 'secondary',
                            isSmall: true,
                            onClick: function () { setAttributes({ winners: {} }); },
                            style: { marginTop: '6px' }
                        }, __('Reset all results'))
                    ),
                    el(PanelBody, { title: __('Teams'), initialOpen: true },
                        a.teams.map(function (team, i) {
                            return el(TextControl, {
                                key: i,
                                label: __('Team ') + (i + 1),
                                value: team,
                                __nextHasNoMarginBottom: true,
                                onChange: function (v) { updateTeam(i, v); }
                            });
                        })
                    ),
                    el(PanelBody, { title: __('Round Labels'), initialOpen: false },
                        rounds.map(function (_, ri) {
                            var def = ri === rounds.length - 1 ? 'Final' : (ri === rounds.length - 2 ? 'Semifinals' : 'Round ' + (ri + 1));
                            return el(TextControl, {
                                key: ri,
                                label: __('Round ') + (ri + 1),
                                value: (a.roundLabels && a.roundLabels[ri]) || def,
                                __nextHasNoMarginBottom: true,
                                onChange: function (v) { updateRoundLabel(ri, v); }
                            });
                        }),
                        el(TextControl, {
                            label: __('Winner label'),
                            value: a.winnerLabel,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ winnerLabel: v }); }
                        })
                    ),
                    el(PanelBody, { title: __('Display'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show bracket title'),
                            checked: a.showTitle,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showTitle: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show round labels'),
                            checked: a.showRoundLabels,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showRoundLabels: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Border radius (px)'),
                            value: a.borderRadius,
                            min: 0, max: 20,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ borderRadius: v }); }
                        })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('Team Name', 'blockenberg'), value: a.typoTeam, onChange: function (v) { setAttributes({ typoTeam: v }); } }),
                        el(getTypographyControl(), { label: __('Round Label', 'blockenberg'), value: a.typoLabel, onChange: function (v) { setAttributes({ typoLabel: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background'), value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#f8fafc' }); } },
                            { label: __('Accent'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#f59e0b' }); } },
                            { label: __('Title'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#0f172a' }); } },
                            { label: __('Match border'), value: a.matchBorderColor, onChange: function (v) { setAttributes({ matchBorderColor: v || '#cbd5e1' }); } },
                            { label: __('Match background'), value: a.matchBg, onChange: function (v) { setAttributes({ matchBg: v || '#ffffff' }); } },
                            { label: __('Team text'), value: a.teamColor, onChange: function (v) { setAttributes({ teamColor: v || '#334155' }); } },
                            { label: __('Winner background'), value: a.winnerBg, onChange: function (v) { setAttributes({ winnerBg: v || '#fef9c3' }); } },
                            { label: __('Winner text'), value: a.winnerColor, onChange: function (v) { setAttributes({ winnerColor: v || '#713f12' }); } },
                            { label: __('Winner border'), value: a.winnerBorderColor, onChange: function (v) { setAttributes({ winnerBorderColor: v || '#fbbf24' }); } },
                            { label: __('Loser text'), value: a.loserColor, onChange: function (v) { setAttributes({ loserColor: v || '#cbd5e1' }); } },
                            { label: __('Connector lines'), value: a.connectorColor, onChange: function (v) { setAttributes({ connectorColor: v || '#cbd5e1' }); } },
                            { label: __('Champion bg'), value: a.championBg, onChange: function (v) { setAttributes({ championBg: v || '#fffbeb' }); } },
                            { label: __('Champion border'), value: a.championBorderColor, onChange: function (v) { setAttributes({ championBorderColor: v || '#f59e0b' }); } },
                            { label: __('Champion text'), value: a.championColor, onChange: function (v) { setAttributes({ championColor: v || '#92400e' }); } }
                        ]
                    })
                ),
                el('div', useBlockProps({ className: 'bkbg-bk-editor-wrap', style: Object.assign({}, _tv(a.typoTitle, '--bkbg-bkt-title-'), _tv(a.typoTeam, '--bkbg-bkt-team-'), _tv(a.typoLabel, '--bkbg-bkt-label-')) }),
                    el(BracketPreview, { a: a, setAttributes: setAttributes })
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-bk-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
