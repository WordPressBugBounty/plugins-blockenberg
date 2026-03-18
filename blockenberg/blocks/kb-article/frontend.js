(function () {
    'use strict';

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
    function ap(parent) {
        Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) parent.appendChild(c); });
        return parent;
    }
    function mkA(href, text, color) {
        var a = document.createElement('a');
        a.href = href || '#';
        a.textContent = text;
        if (color) a.style.color = color;
        return a;
    }

    function difficultyBadge(diff) {
        var map = {
            beginner:     { label: '🟢 Beginner',    bg: '#dcfce7', color: '#14532d' },
            intermediate: { label: '🟡 Intermediate', bg: '#fef9c3', color: '#713f12' },
            advanced:     { label: '🟠 Advanced',     bg: '#ffedd5', color: '#9a3412' },
            expert:       { label: '🔴 Expert',       bg: '#fee2e2', color: '#991b1b' }
        };
        return map[diff] || map.beginner;
    }

    var typoKeys = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    function typoCssVarsForEl(el, typo, prefix) {
        if (!typo || typeof typo !== 'object') return;
        var u = typo.sizeUnit || 'px';
        typoKeys.forEach(function (pair) {
            var v = typo[pair[0]];
            if (v === undefined || v === '' || v === null) return;
            var css = (typeof v === 'number' && pair[0].indexOf('size') !== -1) ? v + u
                    : (typeof v === 'number') ? String(v) : v;
            el.style.setProperty(prefix + pair[1], css);
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-kb-article-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                articleTitle: 'Knowledge Base Article',
                category: '',
                subcategory: '',
                showCategory: true,
                difficulty: 'beginner',
                showDifficulty: true,
                lastUpdated: '',
                showLastUpdated: true,
                readTime: '',
                showReadTime: true,
                appliesTo: '',
                showAppliesTo: true,
                intro: '',
                showIntro: true,
                showToc: true,
                tocLabel: 'In this article',
                sections: [],
                tags: [],
                showTags: true,
                relatedArticles: [],
                showRelated: true,
                relatedLabel: 'Related Articles',
                helpfulYes: 0,
                helpfulNo: 0,
                showHelpful: true,
                helpfulLabel: 'Was this article helpful?',
                fontSize: 15,
                titleFontSize: 26,
                lineHeight: 175,
                borderRadius: 10,
                maxWidth: 820,
                bgColor: '#ffffff',
                borderColor: '#e2e8f0',
                headerBg: '#f8fafc',
                headerColor: '#0f172a',
                categoryColor: '#64748b',
                titleColor: '#0f172a',
                textColor: '#374151',
                tocBg: '#f1f5f9',
                tocColor: '#1e293b',
                tocLinkColor: '#2563eb',
                headingColor: '#0f172a',
                sectionBorderColor: '#e5e7eb',
                infoBg: '#eff6ff',
                infoColor: '#1e40af',
                infoBorderColor: '#93c5fd',
                warningBg: '#fffbeb',
                warningColor: '#92400e',
                warningBorderColor: '#fcd34d',
                stepNumberBg: '#2563eb',
                stepNumberColor: '#ffffff',
                accentColor: '#2563eb',
                tagBg: '#f1f5f9',
                tagColor: '#475569',
                helpfulYesBg: '#dcfce7',
                helpfulYesColor: '#14532d',
                helpfulNoBg: '#fee2e2',
                helpfulNoColor: '#991b1b'
            }, opts);

            var br = (o.borderRadius || 10) + 'px';
            var db = difficultyBadge(o.difficulty);

            var block = mk('div', 'bkbg-kba-block', {
                border: '1px solid ' + o.borderColor,
                borderRadius: br,
                overflow: 'hidden',
                maxWidth: (o.maxWidth || 820) + 'px'
            });
            typoCssVarsForEl(block, o.titleTypo, '--bkbg-kba-tt-');
            typoCssVarsForEl(block, o.bodyTypo, '--bkbg-kba-bd-');
            block.style.setProperty('--bkbg-kba-sec-border', o.sectionBorderColor || '#e5e7eb');

            // ── Header ─────────────────────────────────────────────
            var header = mk('div', 'bkbg-kba-header', {
                background: o.headerBg,
                borderBottom: '1px solid ' + o.borderColor,
                borderRadius: (o.borderRadius || 10) + 'px ' + (o.borderRadius || 10) + 'px 0 0'
            });

            if (o.showCategory && o.category) {
                var bc = tx('div', 'bkbg-kba-breadcrumb', o.category + (o.subcategory ? ' › ' + o.subcategory : ''), { color: o.categoryColor });
                ap(header, bc);
            }

            var titleEl = tx('h2', 'bkbg-kba-title', o.articleTitle, { color: o.titleColor });
            ap(header, titleEl);

            var meta = mk('div', 'bkbg-kba-meta', { color: o.categoryColor });
            if (o.showDifficulty) {
                ap(meta, tx('span', 'bkbg-kba-difficulty', db.label, { background: db.bg, color: db.color }));
            }
            if (o.showReadTime    && o.readTime)    ap(meta, tx('span', null, '⏱ ' + o.readTime));
            if (o.showLastUpdated && o.lastUpdated) ap(meta, tx('span', null, '🗓 Updated ' + o.lastUpdated));
            if (o.showAppliesTo  && o.appliesTo)   ap(meta, tx('span', null, '✅ ' + o.appliesTo));
            ap(header, meta);
            ap(block, header);

            // ── Body ───────────────────────────────────────────────
            var body = mk('div', 'bkbg-kba-body', { background: o.bgColor, color: o.textColor });

            if (o.showIntro && o.intro) {
                ap(body, tx('p', 'bkbg-kba-intro', o.intro));
            }

            // TOC
            if (o.showToc && o.sections && o.sections.length) {
                var toc = mk('div', 'bkbg-kba-toc', { background: o.tocBg });
                ap(toc, tx('span', 'bkbg-kba-toc-label', o.tocLabel || 'In this article', { color: o.tocColor }));
                var tocList = mk('ol', 'bkbg-kba-toc-list');
                o.sections.forEach(function (s, i) {
                    var li  = document.createElement('li');
                    var a   = mkA('#bkbg-kba-sec-' + i, s.heading, o.tocLinkColor);
                    li.appendChild(a);
                    tocList.appendChild(li);
                });
                ap(toc, tocList);
                ap(body, toc);
            }

            // Sections
            var stepNum = 0;
            (o.sections || []).forEach(function (s, i) {
                var isStep = s.type === 'step';
                var isInfo = s.type === 'info';
                var isWarn = s.type === 'warning';
                if (isStep) stepNum++;

                var cls = 'bkbg-kba-section' + (isInfo ? ' is-info' : isWarn ? ' is-warning' : '');
                var sec = mk('div', cls);
                sec.id = 'bkbg-kba-sec-' + i;

                if (isInfo)  { sec.style.background = o.infoBg;    sec.style.color = o.infoColor;    sec.style.borderLeftColor = o.infoBorderColor; }
                if (isWarn)  { sec.style.background = o.warningBg; sec.style.color = o.warningColor; sec.style.borderLeftColor = o.warningBorderColor; }

                var hRow = mk('div', null, { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' });
                if (isStep) {
                    var numEl = tx('span', 'bkbg-kba-step-num', String(stepNum), { background: o.stepNumberBg, color: o.stepNumberColor });
                    ap(hRow, numEl);
                }
                var icon = isInfo ? '💡 ' : isWarn ? '⚠️ ' : '';
                var hEl = tx('h3', 'bkbg-kba-section-heading', icon + s.heading, {
                    color: isInfo ? o.infoColor : isWarn ? o.warningColor : o.headingColor,
                    margin: '0',
                    fontSize: '17px',
                    fontWeight: '700'
                });
                ap(hRow, hEl);
                ap(sec, hRow);

                ap(sec, tx('p', 'bkbg-kba-section-content', s.content || '', { color: isInfo ? o.infoColor : isWarn ? o.warningColor : o.textColor }));
                ap(body, sec);
            });

            ap(block, body);

            // ── Tags ──────────────────────────────────────────────
            if (o.showTags && o.tags && o.tags.length) {
                var tagsDiv = mk('div', 'bkbg-kba-tags');
                o.tags.forEach(function (t) {
                    if (!t) return;
                    ap(tagsDiv, tx('span', 'bkbg-kba-tag', t, { background: o.tagBg, color: o.tagColor }));
                });
                ap(block, tagsDiv);
            }

            // ── Related ───────────────────────────────────────────
            if (o.showRelated && o.relatedArticles && o.relatedArticles.length) {
                var rel = mk('div', 'bkbg-kba-related', { background: o.bgColor });
                ap(rel, tx('span', 'bkbg-kba-related-label', o.relatedLabel || 'Related Articles', { color: o.headingColor }));
                var relUl = mk('ul', 'bkbg-kba-related-list');
                o.relatedArticles.forEach(function (r) {
                    if (!r.title) return;
                    var li = document.createElement('li');
                    var a  = mkA(r.url || '#', r.title, o.accentColor);
                    li.appendChild(a);
                    relUl.appendChild(li);
                });
                ap(rel, relUl);
                ap(block, rel);
            }

            // ── Helpful ───────────────────────────────────────────
            if (o.showHelpful) {
                var helpful = mk('div', 'bkbg-kba-helpful', { background: o.bgColor });
                ap(helpful, tx('span', 'bkbg-kba-helpful-label', o.helpfulLabel || 'Was this article helpful?'));

                var yesBtn = tx('button', 'bkbg-kba-helpful-btn', '👍 Yes (' + (o.helpfulYes || 0) + ')', { background: o.helpfulYesBg, color: o.helpfulYesColor });
                var noBtn  = tx('button', 'bkbg-kba-helpful-btn', '👎 No ('  + (o.helpfulNo  || 0) + ')', { background: o.helpfulNoBg,  color: o.helpfulNoColor  });

                yesBtn.type = 'button';
                noBtn.type  = 'button';

                var voted = false;
                yesBtn.addEventListener('click', function () {
                    if (voted) return;
                    voted = true;
                    yesBtn.classList.add('is-voted');
                    yesBtn.textContent = '👍 Yes (' + ((o.helpfulYes || 0) + 1) + ')';
                    noBtn.disabled = true;
                });
                noBtn.addEventListener('click', function () {
                    if (voted) return;
                    voted = true;
                    noBtn.classList.add('is-voted');
                    noBtn.textContent = '👎 No (' + ((o.helpfulNo || 0) + 1) + ')';
                    yesBtn.disabled = true;
                });

                ap(helpful, yesBtn, noBtn);
                ap(block, helpful);
            }

            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
