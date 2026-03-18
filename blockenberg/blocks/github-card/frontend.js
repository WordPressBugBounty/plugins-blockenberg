(function () {
    'use strict';

    // Language color map for GitHub
    var LANG_COLORS = {
        'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572A5',
        'PHP': '#4F5D95', 'Ruby': '#701516', 'Go': '#00ADD8', 'Rust': '#dea584',
        'CSS': '#563d7c', 'HTML': '#e34c26', 'C': '#555555', 'C++': '#f34b7d',
        'Java': '#b07219', 'Swift': '#F05138', 'Kotlin': '#A97BFF', 'Dart': '#00B4AB',
        'Shell': '#89e051', 'Vue': '#41b883', 'Svelte': '#ff3e00'
    };

    function formatNumber(n) {
        if (!n && n !== 0) return '—';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
        return n.toString();
    }

    function formatDate(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        var now = new Date();
        var diff = Math.floor((now - d) / 1000);
        if (diff < 60) return 'Updated just now';
        if (diff < 3600) return 'Updated ' + Math.floor(diff / 60) + 'm ago';
        if (diff < 86400) return 'Updated ' + Math.floor(diff / 3600) + 'h ago';
        if (diff < 2592000) return 'Updated ' + Math.floor(diff / 86400) + 'd ago';
        return 'Updated ' + d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function getCached(key, maxAge) {
        try {
            var raw = localStorage.getItem(key);
            if (!raw) return null;
            var obj = JSON.parse(raw);
            if (Date.now() - obj.ts > maxAge * 60 * 1000) return null;
            return obj.data;
        } catch (e) { return null; }
    }

    function setCache(key, data) {
        try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: data })); } catch (e) { }
    }

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family: 'font-family', weight: 'font-weight', style: 'font-style',
            decoration: 'text-decoration', transform: 'text-transform',
            sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
            lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
            letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m',
            wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m'
        };
        Object.keys(map).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) {
                    v = v + (typo.sizeUnit || 'px');
                } else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) {
                    v = v + (typo.lineHeightUnit || '');
                } else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) {
                    v = v + (typo.letterSpacingUnit || 'px');
                } else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) {
                    v = v + (typo.wordSpacingUnit || 'px');
                }
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    document.querySelectorAll('.bkbg-ghc-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) { }

        var mode         = opts.mode         || 'repo';
        var username     = opts.username     || '';
        var repoName     = opts.repoName     || '';
        var showAvatar   = opts.showAvatar   !== false;
        var showBio      = opts.showBio      !== false;
        var showStats    = opts.showStats    !== false;
        var showLanguage = opts.showLanguage !== false;
        var showTopics   = opts.showTopics   !== false;
        var showLastUpdate = opts.showLastUpdate !== false;
        var openInNewTab = opts.openInNewTab !== false;
        var cacheMinutes = opts.cacheMinutes || 60;
        var cardRadius   = opts.cardRadius   || 16;
        var padding      = opts.padding      || 24;
        var avatarSize   = opts.avatarSize   || 64;
        var align2       = opts.align2       || 'center';
        var maxWidth     = opts.maxWidth     || 480;
        var cardBg       = opts.cardBg       || '#0d1117';
        var headingColor = opts.headingColor || '#e6edf3';
        var descColor    = opts.descColor    || '#8b949e';
        var metaColor    = opts.metaColor    || '#8b949e';
        var statBg       = opts.statBg       || '#161b22';
        var linkColor    = opts.linkColor    || '#58a6ff';
        var borderColor  = opts.borderColor  || '#30363d';
        var sectionBg    = opts.sectionBg    || '';

        if (!username) { app.style.display = 'none'; return; }
        if (sectionBg) app.style.background = sectionBg;

        typoCssVarsForEl(opts.typoHeading, '--bkbg-ghc-hd-', app);
        typoCssVarsForEl(opts.typoBody, '--bkbg-ghc-bd-', app);
        typoCssVarsForEl(opts.typoMeta, '--bkbg-ghc-mt-', app);

        // Alignment wrapper
        app.style.textAlign = align2;

        // Loading state
        var loading = document.createElement('div');
        loading.className = 'bkbg-ghc-loading';
        loading.style.cssText = 'background:' + cardBg + ';border:1px solid ' + borderColor + ';border-radius:' + cardRadius + 'px;max-width:' + maxWidth + 'px;margin:' + (align2 === 'center' ? '0 auto' : align2 === 'right' ? '0 0 0 auto' : '0') + ';color:' + metaColor + ';';
        var spinner = document.createElement('div');
        spinner.className = 'bkbg-ghc-spinner';
        loading.appendChild(spinner);
        loading.appendChild(document.createTextNode('Loading GitHub data…'));
        app.appendChild(loading);

        // API URL
        var apiUrl = mode === 'repo' && repoName
            ? 'https://api.github.com/repos/' + username + '/' + repoName
            : 'https://api.github.com/users/' + username;

        var cacheKey = 'bkbg_ghc_' + apiUrl;
        var cached = getCached(cacheKey, cacheMinutes);

        function renderCard(data) {
            app.removeChild(loading);

            var marginStyle = align2 === 'center' ? '0 auto' : align2 === 'right' ? '0 0 0 auto' : '0';
            var ghUrl = data.html_url || ('https://github.com/' + username);

            var card = document.createElement('a');
            card.className = 'bkbg-ghc-card';
            card.href = ghUrl;
            card.target = openInNewTab ? '_blank' : '_self';
            card.rel = 'noopener noreferrer';
            card.style.cssText = 'background:' + cardBg + ';border:1px solid ' + borderColor + ';border-radius:' + cardRadius + 'px;padding:' + padding + 'px;max-width:' + maxWidth + 'px;margin:' + marginStyle + ';display:block;color:inherit;text-decoration:none;';

            // Header
            var header = document.createElement('div');
            header.className = 'bkbg-ghc-header';

            if (showAvatar && data.owner && data.owner.avatar_url) {
                var img = document.createElement('img');
                img.className = 'bkbg-ghc-avatar';
                img.src = data.owner.avatar_url;
                img.alt = data.owner.login;
                img.width = avatarSize;
                img.height = avatarSize;
                img.style.cssText = 'width:' + avatarSize + 'px;height:' + avatarSize + 'px;border-radius:' + (mode === 'repo' ? '8px' : '50%') + ';object-fit:cover;';
                header.appendChild(img);
            } else if (showAvatar && data.avatar_url) {
                var img2 = document.createElement('img');
                img2.className = 'bkbg-ghc-avatar';
                img2.src = data.avatar_url;
                img2.alt = data.login;
                img2.width = avatarSize;
                img2.height = avatarSize;
                img2.style.cssText = 'width:' + avatarSize + 'px;height:' + avatarSize + 'px;border-radius:50%;object-fit:cover;';
                header.appendChild(img2);
            }

            var nameCol = document.createElement('div');
            var nameRow = document.createElement('div');
            nameRow.className = 'bkbg-ghc-name-row';
            var nameLink = document.createElement('a');
            nameLink.href = ghUrl;
            nameLink.target = openInNewTab ? '_blank' : '_self';
            nameLink.rel = 'noopener noreferrer';
            nameLink.textContent = mode === 'repo' ? (data.full_name || username + '/' + repoName) : (data.name || data.login || username);
            nameLink.style.color = linkColor;
            nameRow.appendChild(nameLink);

            var handleDiv = document.createElement('div');
            handleDiv.className = 'bkbg-ghc-handle';
            handleDiv.style.color = metaColor;
            handleDiv.textContent = mode === 'repo' ? (data.language ? data.language : '') : ('@' + (data.login || username));
            nameCol.appendChild(nameRow);
            if (handleDiv.textContent) nameCol.appendChild(handleDiv);
            header.appendChild(nameCol);
            card.appendChild(header);

            // Bio / Description
            if (showBio) {
                var descText = mode === 'repo' ? data.description : data.bio;
                if (descText) {
                    var desc = document.createElement('div');
                    desc.className = 'bkbg-ghc-desc';
                    desc.style.color = descColor;
                    desc.textContent = descText;
                    card.appendChild(desc);
                }
            }

            // Repo meta row (language + topics)
            if (mode === 'repo') {
                var metaRow = document.createElement('div');
                metaRow.className = 'bkbg-ghc-meta-row';
                metaRow.style.color = metaColor;

                if (showLanguage && data.language) {
                    var langSpan = document.createElement('span');
                    langSpan.className = 'bkbg-ghc-lang';
                    var dot = document.createElement('span');
                    dot.className = 'bkbg-ghc-lang-dot';
                    dot.setAttribute('data-lang', data.language);
                    dot.style.background = LANG_COLORS[data.language] || '#8b949e';
                    langSpan.appendChild(dot);
                    langSpan.appendChild(document.createTextNode(data.language));
                    metaRow.appendChild(langSpan);
                }

                if (showTopics && data.topics && data.topics.length) {
                    data.topics.slice(0, 5).forEach(function (topic) {
                        var t = document.createElement('a');
                        t.className = 'bkbg-ghc-topic';
                        t.href = 'https://github.com/topics/' + topic;
                        t.target = '_blank';
                        t.rel = 'noopener noreferrer';
                        t.textContent = topic;
                        t.style.cssText = 'background:rgba(56,139,253,0.15);color:' + linkColor + ';';
                        metaRow.appendChild(t);
                    });
                }

                if (metaRow.children.length) card.appendChild(metaRow);
            }

            // Stats
            if (showStats) {
                var statsRow = document.createElement('div');
                statsRow.className = 'bkbg-ghc-stats';

                var statDefs = mode === 'repo'
                    ? [
                        { icon: '⭐', val: formatNumber(data.stargazers_count), lbl: 'stars' },
                        { icon: '🍴', val: formatNumber(data.forks_count), lbl: 'forks' },
                        { icon: '👁', val: formatNumber(data.watchers_count), lbl: 'watchers' }
                    ]
                    : [
                        { icon: '📦', val: formatNumber(data.public_repos), lbl: 'repos' },
                        { icon: '👥', val: formatNumber(data.followers), lbl: 'followers' },
                        { icon: '👤', val: formatNumber(data.following), lbl: 'following' }
                    ];

                statDefs.forEach(function (s) {
                    var tile = document.createElement('div');
                    tile.className = 'bkbg-ghc-stat';
                    tile.style.cssText = 'background:' + statBg + ';border:1px solid ' + borderColor + ';border-radius:8px;';

                    var val = document.createElement('span');
                    val.className = 'bkbg-ghc-stat-val';
                    val.style.color = headingColor;
                    val.textContent = s.val;

                    var lbl = document.createElement('span');
                    lbl.className = 'bkbg-ghc-stat-lbl';
                    lbl.style.color = metaColor;
                    lbl.textContent = s.lbl;

                    tile.appendChild(val);
                    tile.appendChild(lbl);
                    statsRow.appendChild(tile);
                });

                card.appendChild(statsRow);
            }

            // Footer - last update
            if (showLastUpdate) {
                var updatedAt = mode === 'repo' ? data.pushed_at : data.updated_at;
                if (updatedAt) {
                    var footer = document.createElement('div');
                    footer.className = 'bkbg-ghc-footer';
                    footer.style.color = metaColor;
                    footer.textContent = formatDate(updatedAt);
                    card.appendChild(footer);
                }
            }

            app.appendChild(card);
        }

        function renderError(msg) {
            app.removeChild(loading);
            var err = document.createElement('div');
            err.className = 'bkbg-ghc-error';
            err.style.cssText = 'background:' + cardBg + ';border:1px solid #f43f5e;border-radius:' + cardRadius + 'px;max-width:' + maxWidth + 'px;margin:' + (align2 === 'center' ? '0 auto' : align2 === 'right' ? '0 0 0 auto' : '0') + ';color:#f43f5e;';
            err.textContent = '⚠ ' + msg;
            app.appendChild(err);
        }

        function fetchData() {
            fetch(apiUrl, { headers: { Accept: 'application/vnd.github.mercy-preview+json' } })
                .then(function (r) {
                    if (!r.ok) throw new Error('GitHub API returned ' + r.status);
                    return r.json();
                })
                .then(function (data) {
                    setCache(cacheKey, data);
                    renderCard(data);
                })
                .catch(function (e) {
                    renderError('Could not load GitHub data. ' + e.message);
                });
        }

        if (cached) {
            // Small delay to avoid flicker
            setTimeout(function () { renderCard(cached); }, 0);
        } else {
            fetchData();
        }
    });
})();
