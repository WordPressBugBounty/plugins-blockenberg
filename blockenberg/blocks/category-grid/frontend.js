/* Category Grid — frontend */
(function () {
    'use strict';

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

    /* ── emoji for categories (hash-based stable assignment) ─────────────────── */
    var DEFAULT_EMOJIS = ['📁', '📂', '🗂️', '📌', '🔖', '🏷️', '💡', '✏️', '📝', '📊', '🎯', '🔍'];

    function emojiForName(name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
            hash = (hash * 31 + name.charCodeAt(i)) | 0;
        }
        return DEFAULT_EMOJIS[Math.abs(hash) % DEFAULT_EMOJIS.length];
    }

    function getCatColor(index, colorMode, multiColors, accent) {
        if (colorMode === 'multi') {
            var cols = (multiColors || '').split(',').map(function (c) { return c.trim(); }).filter(Boolean);
            if (cols.length) { return cols[index % cols.length]; }
        }
        return accent || '#6c3fb5';
    }

    /* ── build a single card ──────────────────────────────────────────────────── */
    function buildCard(cat, index, cfg) {
        var accent     = getCatColor(index, cfg.colorMode, cfg.multiColors, cfg.accent);
        var emoji      = emojiForName(cat.name);
        var showBar    = cfg.cardStyle === 'card-accent';
        var isCircle   = cfg.cardStyle === 'icon-circle';
        var isLeft     = cfg.iconPos === 'left';

        var a = document.createElement('a');
        a.className   = 'bkcg-card';
        a.href        = cat.link || '#';
        a.target      = cfg.linkTarget || '_self';
        if (cfg.linkTarget === '_blank') { a.rel = 'noopener noreferrer'; }

        Object.assign(a.style, {
            background:     cfg.cardBg,
            borderRadius:   cfg.cardRadius + 'px',
            padding:        cfg.cardPadding + 'px',
            boxShadow:      cfg.cardShadow ? '0 2px 16px rgba(0,0,0,0.08)' : 'none',
            border:         cfg.cardBorder ? '1px solid ' + cfg.borderColor : 'none',
            textAlign:      cfg.textAlign,
            display:        'flex',
            flexDirection:  isLeft ? 'row' : 'column',
            alignItems:     isLeft ? 'flex-start' : (cfg.textAlign === 'center' ? 'center' : 'flex-start'),
            gap:            isLeft ? '12px' : '8px',
            textDecoration: 'none',
            color:          'inherit',
            position:       'relative',
            overflow:       'hidden',
        });

        a.setAttribute('data-bg-hover', cfg.cardBgHover);
        a.setAttribute('data-bg', cfg.cardBg);

        /* accent top bar */
        if (showBar) {
            var bar = document.createElement('div');
            bar.style.cssText = 'position:absolute;top:0;left:0;right:0;height:3px;background:' + accent;
            a.appendChild(bar);
        }

        /* icon */
        if (cfg.showIcon) {
            var iconWrap = document.createElement('div');
            iconWrap.className = 'bkcg-icon';
            Object.assign(iconWrap.style, {
                fontSize: cfg.iconSize + 'px',
                lineHeight: '1',
                flexShrink: '0',
                background: isCircle ? accent + '18' : 'transparent',
                width: isCircle ? (cfg.iconSize * 1.8) + 'px' : undefined,
                height: isCircle ? (cfg.iconSize * 1.8) + 'px' : undefined,
                borderRadius: isCircle ? '50%' : undefined,
                display: isCircle ? 'flex' : 'block',
                alignItems: 'center',
                justifyContent: 'center',
            });
            var useChar = !cfg.iconType || cfg.iconType === 'custom-char';
            if (useChar) {
                iconWrap.textContent = emoji;
            } else {
                var IP = window.bkbgIconPicker;
                var iconEl = IP && IP.buildFrontendIcon(cfg.iconType, null, cfg.iconDashicon, cfg.iconImageUrl, cfg.iconDashiconColor);
                if (iconEl) iconWrap.appendChild(iconEl);
                else iconWrap.textContent = emoji;
            }
            a.appendChild(iconWrap);
        }

        /* body */
        var body = document.createElement('div');
        body.className = 'bkcg-body';
        body.style.flex = '1';
        body.style.minWidth = '0';

        var nameEl = document.createElement('p');
        nameEl.className = 'bkcg-name';
        nameEl.textContent = cat.name;
        Object.assign(nameEl.style, {
            margin: '0 0 4px', color: cfg.nameColor
        });
        body.appendChild(nameEl);

        if (cfg.showCount) {
            var countEl = document.createElement('span');
            countEl.className = 'bkcg-count';
            countEl.textContent = cat.count + ' ' + (cfg.countLabel || 'posts');
            Object.assign(countEl.style, {
                display: 'inline-block', background: cfg.countBg, color: cfg.countColor,
                borderRadius: '999px', padding: '1px 8px', fontSize: '11px', fontWeight: '600', marginBottom: '6px'
            });
            body.appendChild(countEl);
        }

        if (cfg.showDesc && cat.description) {
            var descEl = document.createElement('p');
            descEl.className = 'bkcg-desc';
            var desc = cat.description.replace(/<[^>]+>/g, '').slice(0, cfg.descLen || 80);
            descEl.textContent = desc;
            Object.assign(descEl.style, {
                margin: '4px 0 0', color: cfg.descColor
            });
            body.appendChild(descEl);
        }

        if (cfg.showArrow) {
            var arrow = document.createElement('span');
            arrow.className = 'bkcg-arrow';
            arrow.textContent = '→';
            Object.assign(arrow.style, { display: 'block', marginTop: '8px', color: accent, fontSize: '18px' });
            body.appendChild(arrow);
        }

        a.appendChild(body);
        return a;
    }

    /* ── hover effect ────────────────────────────────────────────────────────── */
    function attachHover(grid, cfg) {
        if (grid.getAttribute('data-animate') !== '1') { return; }

        grid.addEventListener('mouseover', function (e) {
            var card = e.target.closest('.bkcg-card');
            if (!card) { return; }
            card.style.background = cfg.cardBgHover;
        });

        grid.addEventListener('mouseout', function (e) {
            var card = e.target.closest('.bkcg-card');
            if (!card) { return; }
            card.style.background = cfg.cardBg;
        });
    }

    /* ── read all config from data attributes ─────────────────────────────────── */
    function parseConfig(grid) {
        return {
            max:          parseInt(grid.getAttribute('data-max'),          10) || 9,
            orderBy:      grid.getAttribute('data-order-by')  || 'count',
            order:        grid.getAttribute('data-order')     || 'desc',
            hideEmpty:    grid.getAttribute('data-hide-empty') !== '0',
            exclude:      grid.getAttribute('data-exclude')   || '',
            include:      grid.getAttribute('data-include')   || '',
            columns:      parseInt(grid.getAttribute('data-columns'),      10) || 3,
            gap:          parseInt(grid.getAttribute('data-gap'),          10) || 16,
            cardStyle:    grid.getAttribute('data-card-style')  || 'card',
            iconPos:      grid.getAttribute('data-icon-pos')    || 'top',
            showIcon:     grid.getAttribute('data-show-icon')  !== '0',
            iconSize:     parseInt(grid.getAttribute('data-icon-size'),    10) || 36,
            iconType:     grid.getAttribute('data-icon-type')   || 'custom-char',
            iconDashicon: grid.getAttribute('data-icon-dashicon') || '',
            iconImageUrl: grid.getAttribute('data-icon-image-url') || '',
            showCount:    grid.getAttribute('data-show-count') !== '0',
            countLabel:   grid.getAttribute('data-count-label') || 'posts',
            showDesc:     grid.getAttribute('data-show-desc')  === '1',
            descLen:      parseInt(grid.getAttribute('data-desc-len'),     10) || 80,
            showArrow:    grid.getAttribute('data-show-arrow') !== '0',
            linkTarget:   grid.getAttribute('data-link-target') || '_self',
            textAlign:    grid.getAttribute('data-text-align') || 'center',
            colorMode:    grid.getAttribute('data-color-mode') || 'single',
            multiColors:  grid.getAttribute('data-multi-colors') || '',
            accent:       grid.getAttribute('data-accent')       || '#6c3fb5',
            nameColor:    grid.getAttribute('data-name-color')   || '#1e1e1e',
            nameSize:     parseInt(grid.getAttribute('data-name-size'),    10) || 16,
            countColor:   grid.getAttribute('data-count-color')  || '#6c3fb5',
            countBg:      grid.getAttribute('data-count-bg')     || '#ede9fe',
            descColor:    grid.getAttribute('data-desc-color')   || '#6b7280',
            descSize:     parseInt(grid.getAttribute('data-desc-size'),    10) || 13,
            cardBg:       grid.getAttribute('data-card-bg')       || '#ffffff',
            cardBgHover:  grid.getAttribute('data-card-bg-hover') || '#f5f3ff',
            cardRadius:   parseInt(grid.getAttribute('data-card-radius'),  10) || 12,
            cardPadding:  parseInt(grid.getAttribute('data-card-padding'), 10) || 24,
            cardShadow:   grid.getAttribute('data-card-shadow') !== '0',
            cardBorder:   grid.getAttribute('data-card-border') === '1',
            borderColor:  grid.getAttribute('data-border-color') || '#e5e7eb',
        };
    }

    /* ── main init ───────────────────────────────────────────────────────────── */
    function init() {
        document.querySelectorAll('.bkcg-grid[data-max]').forEach(function (grid) {
            if (grid._bkcgInit) { return; }
            grid._bkcgInit = true;

            var cfg = parseConfig(grid);

            /* apply grid CSS */
            grid.style.gridTemplateColumns = 'repeat(' + cfg.columns + ', 1fr)';
            grid.style.gap = cfg.gap + 'px';

            /* typography CSS vars */
            var typoName = {};
            var typoDesc = {};
            try { typoName = JSON.parse(grid.getAttribute('data-typo-name') || '{}'); } catch (e) {}
            try { typoDesc = JSON.parse(grid.getAttribute('data-typo-desc') || '{}'); } catch (e) {}
            typoCssVarsForEl(typoName, '--bkcg-n-', grid);
            typoCssVarsForEl(typoDesc, '--bkcg-d-', grid);

            /* build API URL */
            var apiBase = (window.wpApiSettings && window.wpApiSettings.root)
                ? window.wpApiSettings.root.replace(/\/$/, '')
                : '/wp-json';

            var params = [
                'per_page=' + cfg.max,
                'orderby='  + cfg.orderBy,
                'order='    + cfg.order,
                cfg.hideEmpty ? 'hide_empty=true' : '',
                cfg.exclude   ? 'exclude=' + cfg.exclude : '',
                cfg.include   ? 'include=' + cfg.include : '',
                '_fields=id,name,count,description,link',
            ].filter(Boolean).join('&');

            var url = apiBase + '/wp/v2/categories?' + params;

            fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (cats) {
                    grid.innerHTML = '';
                    cats.forEach(function (cat, idx) {
                        var card = buildCard({
                            name:        cat.name,
                            count:       cat.count,
                            description: cat.description ? cat.description.replace(/<[^>]+>/g, '') : '',
                            link:        cat.link || '#',
                        }, idx, cfg);
                        grid.appendChild(card);
                    });
                    attachHover(grid, cfg);
                })
                .catch(function () {
                    grid.innerHTML = '<p style="color:#888;text-align:center;padding:24px;">Could not load categories.</p>';
                });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
