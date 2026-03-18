(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = { family:'font-family', weight:'font-weight', transform:'text-transform', style:'font-style', decoration:'text-decoration',
                  sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
                  lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
                  letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
                  wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
        Object.keys(m).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k], u = typo[k + 'Unit'] || '';
                if (/Desktop|Tablet|Mobile/.test(k) && typeof v === 'number') v = v + (u || 'px');
                el.style.setProperty(prefix + m[k], '' + v);
            }
        });
    }

    function mk(tag, cls, styles) {
        var d = document.createElement(tag);
        if (cls) d.className = cls;
        if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; });
        return d;
    }
    function tx(tag, cls, text, styles) {
        var d = mk(tag, cls, styles);
        d.textContent = text;
        return d;
    }
    function ap(p) {
        Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) p.appendChild(c); });
        return p;
    }

    function nodeById(nodes, id) {
        return nodes.filter(function (n) { return n.id === id; })[0] || null;
    }

    // Count max depth from a node
    function maxDepth(nodes, id, visited) {
        visited = visited || {};
        if (visited[id]) return 0;
        visited[id] = true;
        var node = nodeById(nodes, id);
        if (!node || node.type === 'result') return 0;
        return 1 + Math.max(maxDepth(nodes, node.yesId, visited), maxDepth(nodes, node.noId, visited));
    }

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';
        var a;
        try { a = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { a = {}; }

        var nodes       = a.nodes || [];
        var rootId      = a.rootId || (nodes[0] && nodes[0].id) || '';
        var cardRadius  = (a.cardRadius  || 12) + 'px';
        var borderRadius= (a.borderRadius || 16) + 'px';
        var fs          = (a.fontSize     || 15) + 'px';
        var qs          = (a.questionSize || 18) + 'px';
        var totalDepth  = maxDepth(nodes, rootId, {});

        // State
        var history = [];  // array of node ids
        var currentId = rootId;

        // ── Outer wrapper ────────────────────────────────────────────
        var wrap = mk('div', 'bkbg-dt-wrap', {
            background:   a.bgColor || '#ffffff',
            borderRadius: borderRadius,
            paddingTop:   (a.paddingTop    || 48) + 'px',
            paddingBottom:(a.paddingBottom || 48) + 'px',
            paddingLeft:  '32px',
            paddingRight: '32px',
            fontFamily:   '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        });

        /* Typography CSS vars */
        wrap.style.setProperty('--bkbg-dtr-ttl-fs', (a.titleSize || 24) + 'px');
        wrap.style.setProperty('--bkbg-dtr-sub-fs', (a.subtitleFontSize || 16) + 'px');
        if (a.typoTitle) typoCssVarsForEl(a.typoTitle, '--bkbg-dtr-ttl-', wrap);
        if (a.typoSubtitle) typoCssVarsForEl(a.typoSubtitle, '--bkbg-dtr-sub-', wrap);

        // Title
        if (a.showTitle !== false && a.title) {
            ap(wrap, tx('h3', 'bkbg-dt-title', a.title, {
                color: a.titleColor || '#0f172a',
                margin: '0 0 8px', textAlign: 'center'
            }));
        }
        if (a.showSubtitle !== false && a.subtitle) {
            ap(wrap, tx('p', 'bkbg-dt-subtitle', a.subtitle, {
                color: a.subtitleColor || '#64748b',
                textAlign: 'center', margin: '0 0 28px'
            }));
        }

        // Progress bar
        var progressWrap = null, progressFill = null;
        if (a.showProgress !== false && totalDepth > 0) {
            progressWrap = mk('div', 'bkbg-dt-progress-bar');
            progressFill = mk('div', 'bkbg-dt-progress-fill', { background: a.yesBg || '#22c55e', width: '0%' });
            progressWrap.appendChild(progressFill);
            wrap.appendChild(progressWrap);
        }

        // Breadcrumb
        var breadcrumbEl = null;
        if (a.showBreadcrumb !== false) {
            breadcrumbEl = mk('div', 'bkbg-dt-breadcrumb', { color: a.breadcrumbColor || '#94a3b8', marginBottom: '16px' });
            wrap.appendChild(breadcrumbEl);
        }

        // Card container
        var cardContainer = mk('div', 'bkbg-dt-card-container');
        wrap.appendChild(cardContainer);

        function updateProgress() {
            if (!progressFill || totalDepth === 0) return;
            var pct = Math.min(100, Math.round((history.length / (totalDepth + 1)) * 100));
            progressFill.style.width = pct + '%';
        }

        function updateBreadcrumb() {
            if (!breadcrumbEl) return;
            breadcrumbEl.innerHTML = '';
            var crumbs = [rootId].concat(history);
            crumbs.forEach(function (id, i) {
                var node = nodeById(nodes, id);
                if (!node) return;
                if (i > 0) ap(breadcrumbEl, tx('span', 'bkbg-dt-breadcrumb-sep', ' › '));
                var label = node.type === 'result' ? '🎯' : ('Q' + (i + 1));
                ap(breadcrumbEl, tx('span', '', label, { fontWeight: i === crumbs.length - 1 ? '700' : '400', color: i === crumbs.length - 1 ? (a.questionColor || '#0f172a') : 'inherit' }));
            });
        }

        function navigateTo(id, direction) {
            var card = cardContainer.querySelector('.bkbg-dt-question-card, .bkbg-dt-result-card');
            if (card && direction !== 'back') {
                card.style.opacity = '0';
                card.style.transform = 'translateX(' + (direction === 'yes' ? '-12px' : '12px') + ')';
                card.style.transition = 'opacity .18s ease, transform .18s ease';
            }
            setTimeout(function () {
                currentId = id;
                renderCurrent();
                updateBreadcrumb();
                updateProgress();
            }, card && direction !== 'back' ? 180 : 0);
        }

        function renderCurrent() {
            cardContainer.innerHTML = '';
            var node = nodeById(nodes, currentId);
            if (!node) {
                ap(cardContainer, tx('p', '', 'Node not found: ' + currentId, { color: 'red' }));
                return;
            }

            if (node.type === 'result') {
                renderResult(node);
            } else {
                renderQuestion(node);
            }
        }

        function renderQuestion(node) {
            var card = mk('div', 'bkbg-dt-question-card', {
                background:   a.cardBg     || '#f8fafc',
                border:       '1px solid ' + (a.cardBorder || '#e2e8f0'),
                borderRadius: cardRadius,
                padding:      '28px 32px',
            });

            ap(card, tx('p', '', node.text, {
                fontSize: qs, fontWeight: '700',
                color: a.questionColor || '#0f172a',
                margin: '0 0 24px', lineHeight: '1.4'
            }));

            // Buttons
            var btnRow = mk('div', 'bkbg-dt-btn-row');

            var yesBtn = mk('button', 'bkbg-dt-btn', {
                background: a.yesBg   || '#22c55e',
                color:      a.yesText || '#ffffff',
                fontSize:   fs
            });
            var yesIconSpan = mk('span', 'bkbg-dt-btn-icon');
            var yesIconType = a.yesIconType || 'custom-char';
            if (yesIconType !== 'custom-char' && window.bkbgIconPicker) {
                yesIconSpan.appendChild(window.bkbgIconPicker.buildFrontendIcon(yesIconType, a.yesIcon, a.yesIconDashicon, a.yesIconImageUrl, a.yesIconDashiconColor));
            } else {
                yesIconSpan.textContent = a.yesIcon || '✓';
            }
            ap(yesBtn, yesIconSpan, tx('span', '', node.yesLabel || 'Yes'));
            yesBtn.addEventListener('click', function () {
                history.push(currentId);
                navigateTo(node.yesId, 'yes');
            });

            var noBtn = mk('button', 'bkbg-dt-btn', {
                background: a.noBg   || '#ef4444',
                color:      a.noText || '#ffffff',
                fontSize:   fs
            });
            var noIconSpan = mk('span', 'bkbg-dt-btn-icon');
            var noIconType = a.noIconType || 'custom-char';
            if (noIconType !== 'custom-char' && window.bkbgIconPicker) {
                noIconSpan.appendChild(window.bkbgIconPicker.buildFrontendIcon(noIconType, a.noIcon, a.noIconDashicon, a.noIconImageUrl, a.noIconDashiconColor));
            } else {
                noIconSpan.textContent = a.noIcon || '✕';
            }
            ap(noBtn, noIconSpan, tx('span', '', node.noLabel || 'No'));
            noBtn.addEventListener('click', function () {
                history.push(currentId);
                navigateTo(node.noId, 'no');
            });

            ap(btnRow, yesBtn, noBtn);
            card.appendChild(btnRow);

            // Back button
            if (history.length > 0) {
                var backRow = mk('div', 'bkbg-dt-back-row', { marginTop: '14px' });
                var backBtn = mk('button', 'bkbg-dt-back-btn', {
                    background: a.backBg   || '#f1f5f9',
                    color:      a.backText || '#374151',
                    fontSize:   '13px'
                });
                backBtn.textContent = '← Back';
                backBtn.addEventListener('click', function () {
                    var prevId = history.pop();
                    navigateTo(prevId, 'back');
                });
                ap(backRow, backBtn);
                card.appendChild(backRow);
            }

            cardContainer.appendChild(card);
            // Animate in
            card.style.opacity = '0';
            card.style.transform = 'translateX(8px)';
            card.style.transition = 'opacity .25s ease, transform .25s ease';
            setTimeout(function () {
                card.style.opacity = '1';
                card.style.transform = 'translateX(0)';
            }, 20);
        }

        function renderResult(node) {
            var card = mk('div', 'bkbg-dt-result-card', {
                background:   node.resultColor || '#6c3fb5',
                borderRadius: cardRadius,
                padding:      '36px 32px',
                textAlign:    'center',
            });

            ap(card, tx('div', '', '🎯', { fontSize: '42px', marginBottom: '14px' }));
            ap(card, tx('p', '', node.text, {
                fontSize:   fs,
                lineHeight: '1.6',
                color:      a.resultTextColor || '#ffffff',
                margin:     '0',
                fontWeight: '500'
            }));

            // Restart
            var restartBtn = mk('button', 'bkbg-dt-restart-btn', {
                color: a.resultTextColor || '#ffffff'
            });
            restartBtn.textContent = '↺ Start over';
            restartBtn.addEventListener('click', function () {
                history = [];
                navigateTo(rootId, 'back');
            });
            card.appendChild(restartBtn);

            // Back
            if (history.length > 0) {
                var backBtn = mk('button', 'bkbg-dt-restart-btn', {
                    color:    a.resultTextColor || '#ffffff',
                    marginLeft: '10px'
                });
                backBtn.textContent = '← Back';
                backBtn.addEventListener('click', function () {
                    var prevId = history.pop();
                    navigateTo(prevId, 'back');
                });
                card.appendChild(backBtn);
            }

            cardContainer.appendChild(card);
        }

        // Kick off
        renderCurrent();
        updateBreadcrumb();
        updateProgress();

        appEl.innerHTML = '';
        appEl.appendChild(wrap);
    }

    function init() {
        document.querySelectorAll('.bkbg-decision-tree-app').forEach(buildBlock);
    }

    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
