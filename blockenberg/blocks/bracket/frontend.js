/* global document */
(function () {
    'use strict';

    /* ── Bracket helpers (mirrors index.js logic) ──────────────── */
    function getRounds(bracketSize) {
        var rounds = [];
        var n = bracketSize;
        while (n >= 2) { rounds.push(n / 2); n = n / 2; }
        return rounds;
    }

    function getMatchKey(r, m) { return 'r' + r + '_m' + m; }

    function getMatchTeams(r, m, teams, winners) {
        if (r === 0) {
            return [teams[m * 2] || '?', teams[m * 2 + 1] || '?'];
        }
        return [
            winners[getMatchKey(r - 1, m * 2)] || '?',
            winners[getMatchKey(r - 1, m * 2 + 1)] || '?'
        ];
    }

    function setWinner(winners, r, m, team) {
        var key = getMatchKey(r, m);
        clearDownstream(winners, r, m);
        winners[key] = team;
    }

    function clearDownstream(winners, r, m) {
        var nextR = r + 1;
        var nextM = Math.floor(m / 2);
        var nextKey = getMatchKey(nextR, nextM);
        if (winners[nextKey] !== undefined) {
            delete winners[nextKey];
            clearDownstream(winners, nextR, nextM);
        }
    }

    /* ── DOM helpers ─────────────────────────────────────────── */
    function el(tag, cls, styles) {
        var d = document.createElement(tag);
        if (cls) d.className = cls;
        applyStyles(d, styles);
        return d;
    }

    function applyStyles(node, styles) {
        if (!styles) return;
        Object.keys(styles).forEach(function (k) { node.style[k] = styles[k]; });
    }

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo) return;
        if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    /* ── Render one bracket instance ─────────────────────────── */
    function renderBracket(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var opts; try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

        /* Apply defaults */
        var defaultTeams = ['Team 1','Team 2','Team 3','Team 4','Team 5','Team 6','Team 7','Team 8'];
        var o = {
            bracketTitle:       opts.bracketTitle     || '',
            showTitle:          opts.showTitle         !== false,
            bracketSize:        opts.bracketSize       || 8,
            teams:              opts.teams             || defaultTeams,
            winners:            opts.winners           || {},
            roundLabels:        opts.roundLabels       || [],
            winnerLabel:        opts.winnerLabel       || '\uD83C\uDFC6 Champion',
            showSeeds:          opts.showSeeds         || false,
            showRoundLabels:    opts.showRoundLabels   !== false,
            borderRadius:       opts.borderRadius      !== undefined ? opts.borderRadius : 8,
            matchPadding:       opts.matchPadding      !== undefined ? opts.matchPadding : 8,
            bgColor:            opts.bgColor           || '#f8fafc',
            borderColor:        opts.borderColor       || '#e2e8f0',
            matchBg:            opts.matchBg           || '#ffffff',
            matchBorderColor:   opts.matchBorderColor  || '#e2e8f0',
            teamColor:          opts.teamColor         || '#1e293b',
            winnerBg:           opts.winnerBg          || '#fefce8',
            winnerColor:        opts.winnerColor       || '#854d0e',
            winnerBorderColor:  opts.winnerBorderColor || '#fbbf24',
            loserColor:         opts.loserColor        || '#94a3b8',
            connectorColor:     opts.connectorColor    || '#cbd5e1',
            roundLabelColor:    opts.roundLabelColor   || '#64748b',
            accentColor:        opts.accentColor       || '#6366f1',
            titleColor:         opts.titleColor        || '#1e293b',
            championBg:         opts.championBg        || '#fefce8',
            championBorderColor:opts.championBorderColor || '#f59e0b',
            championColor:      opts.championColor     || '#78350f'
        };

        /* Mutable winners copy (for click interactions) */
        var winners = JSON.parse(JSON.stringify(o.winners));
        var rounds   = getRounds(o.bracketSize);

        /* ── Outer block ─────────────────────────────────── */
        var block = el('div', 'bkbg-bk-block');
        applyStyles(block, {
            background:   o.bgColor,
            borderColor:  o.borderColor,
            padding:      '24px',
            boxSizing:    'border-box',
            overflowX:    'auto'
        });
        block.style.setProperty('--bkbg-bk-connector', o.connectorColor);
        typoCssVarsForEl(opts.typoTitle, '--bkbg-bkt-title-', block);
        typoCssVarsForEl(opts.typoTeam, '--bkbg-bkt-team-', block);
        typoCssVarsForEl(opts.typoLabel, '--bkbg-bkt-label-', block);

        /* ── Title ───────────────────────────────────────── */
        if (o.showTitle && o.bracketTitle) {
            var titleEl = el('div', 'bkbg-bk-title');
            titleEl.textContent = o.bracketTitle;
            applyStyles(titleEl, { color: o.titleColor });
            block.appendChild(titleEl);
        }

        /* ── Grid ────────────────────────────────────────── */
        var grid = el('div', 'bkbg-bk-grid');
        block.appendChild(grid);

        /* Build a round column, returns { col, redraw } */
        function buildRound(rIdx, matchCount) {
            var col = el('div', 'bkbg-bk-round');

            /* Round label */
            if (o.showRoundLabels) {
                var label = el('div', 'bkbg-bk-round-label');
                var defaultLabel = rounds.length > 1
                    ? (rIdx === rounds.length - 1 ? 'Final'
                        : rIdx === rounds.length - 2 ? 'Semifinals'
                        : 'Round ' + (rIdx + 1))
                    : 'Match';
                label.textContent = o.roundLabels[rIdx] || defaultLabel;
                applyStyles(label, { color: o.roundLabelColor });
                col.appendChild(label);
            }

            var matchesContainer = el('div', 'bkbg-bk-matches');
            col.appendChild(matchesContainer);

            function redraw() {
                matchesContainer.innerHTML = '';
                for (var mi = 0; mi < matchCount; mi++) {
                    (function (matchIdx) {
                        var pair = getMatchTeams(rIdx, matchIdx, o.teams, winners);
                        var winKey = getMatchKey(rIdx, matchIdx);
                        var curWinner = winners[winKey];
                        var isLastRound = (rIdx === rounds.length - 1);

                        var matchCard = el('div', 'bkbg-bk-match');
                        applyStyles(matchCard, {
                            background:   o.matchBg,
                            borderColor:  o.matchBorderColor,
                            borderRadius: o.borderRadius + 'px'
                        });

                        pair.forEach(function (teamName, tIdx) {
                            var isWinner = curWinner && curWinner === teamName;
                            var isLoser  = curWinner && curWinner !== teamName;
                            var isUnknown = teamName === '?';
                            var isAvailable = !isUnknown && !curWinner;

                            var teamRow = el('div', 'bkbg-bk-team'
                                + (isWinner    ? ' is-winner'    : '')
                                + (isLoser     ? ' is-loser'     : '')
                                + (isAvailable ? ' is-available' : ''));

                            if (isWinner) {
                                applyStyles(teamRow, {
                                    background:  o.winnerBg,
                                    color:       o.winnerColor,
                                    borderColor: o.winnerBorderColor,
                                    padding:     o.matchPadding + 'px 10px',
                                    cursor:      'default'
                                });
                                var icon = el('span', 'bkbg-bk-win-icon');
                                icon.textContent = '\u2605';
                                icon.style.color = o.winnerBorderColor;
                                teamRow.appendChild(icon);
                            } else if (isLoser) {
                                applyStyles(teamRow, {
                                    color:  o.loserColor,
                                    padding: o.matchPadding + 'px 10px',
                                    cursor: 'default'
                                });
                            } else {
                                applyStyles(teamRow, {
                                    color:  isUnknown ? o.loserColor : o.teamColor,
                                    padding: o.matchPadding + 'px 10px',
                                    cursor: (isAvailable && !isUnknown && !isLastRound === false) ? 'pointer' : (isUnknown ? 'default' : 'pointer')
                                });
                            }

                            /* Seed number */
                            if (o.showSeeds && rIdx === 0) {
                                var seed = el('span', '');
                                seed.textContent = '#' + (matchIdx * 2 + tIdx + 1);
                                applyStyles(seed, {
                                    fontSize: '10px',
                                    color: o.loserColor,
                                    flexShrink: '0',
                                    minWidth: '24px'
                                });
                                teamRow.appendChild(seed);
                            }

                            var nameSpan = el('span', 'bkbg-bk-team-name');
                            nameSpan.textContent = teamName;
                            teamRow.appendChild(nameSpan);

                            /* Click to set winner */
                            if (!isUnknown && !isWinner) {
                                teamRow.addEventListener('click', function () {
                                    setWinner(winners, rIdx, matchIdx, teamName);
                                    redrawAll();
                                });
                            } else if (isWinner) {
                                /* Click winner again = undo */
                                teamRow.addEventListener('click', function () {
                                    clearDownstream(winners, rIdx, matchIdx);
                                    delete winners[winKey];
                                    redrawAll();
                                });
                            }

                            matchCard.appendChild(teamRow);
                        });

                        matchesContainer.appendChild(matchCard);
                    })(mi);
                }
            }

            return { col: col, redraw: redraw };
        }

        /* Build champion column */
        function buildChampionCol() {
            var col = el('div', 'bkbg-bk-champion-col');

            /* Placeholder for label alignment */
            if (o.showRoundLabels) {
                var spacer = el('div', 'bkbg-bk-round-label');
                spacer.textContent = '\u00A0';
                col.appendChild(spacer);
            }

            var matches = el('div', 'bkbg-bk-matches');
            col.appendChild(matches);

            function redraw() {
                matches.innerHTML = '';
                var lastRoundKey = getMatchKey(rounds.length - 1, 0);
                var champion = winners[lastRoundKey] || '\u2014';

                var champBox = el('div', 'bkbg-bk-champion');
                applyStyles(champBox, {
                    background:   o.championBg,
                    borderColor:  o.championBorderColor,
                    borderRadius: o.borderRadius + 'px',
                    color:        o.championColor
                });

                var champLabel = el('div', 'bkbg-bk-champion-label');
                champLabel.textContent = o.winnerLabel;
                champBox.appendChild(champLabel);

                var champName = el('div', 'bkbg-bk-champion-name');
                champName.textContent = champion;
                champBox.appendChild(champName);

                matches.appendChild(champBox);
            }

            return { col: col, redraw: redraw };
        }

        /* Build all round columns */
        var roundCols = rounds.map(function (matchCount, rIdx) {
            return buildRound(rIdx, matchCount);
        });
        var championCol = buildChampionCol();

        /* Append columns to grid */
        roundCols.forEach(function (rc) { grid.appendChild(rc.col); });
        grid.appendChild(championCol.col);

        /* Draw all */
        function redrawAll() {
            roundCols.forEach(function (rc) { rc.redraw(); });
            championCol.redraw();
        }
        redrawAll();

        /* Insert block before the hidden data element */
        appEl.parentNode.insertBefore(block, appEl);
        appEl.style.display = 'none';
    }

    /* ── Bootstrap ───────────────────────────────────────────── */
    function init() {
        document.querySelectorAll('.bkbg-bk-app').forEach(renderBracket);
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
