(function () {
    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function(k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    function initScrollStickyContent(appEl) {
        var opts;
        try { opts = JSON.parse(appEl.getAttribute('data-opts') || '{}'); } catch(e) { opts = {}; }

        var a = {
            sectionTitle:    opts.sectionTitle    || 'Why Choose Us',
            sectionSubtitle: opts.sectionSubtitle || '',
            ctaLabel:        opts.ctaLabel        || 'Get Started',
            ctaUrl:          opts.ctaUrl          || '#',
            showCta:         opts.showCta         !== false,
            layout:          opts.layout          || 'left-sticky',
            stickyOffset:    opts.stickyOffset    || 80,
            features:        opts.features        || [],
            sectionBg:       opts.sectionBg       || '#0a0a0f',
            panelBg:         opts.panelBg         || '',
            textColor:       opts.textColor       || '#e2e8f0',
            headingColor:    opts.headingColor     || '#ffffff',
            accentColor:     opts.accentColor      || '#7c3aed',
            cardBg:          opts.cardBg           || '#111827',
            cardBorder:      opts.cardBorder       || '#1f2937',
            activeCardBg:    opts.activeCardBg     || '#1e1b4b',
            ctaBg:           opts.ctaBg            || '#7c3aed',
            ctaColor:        opts.ctaColor         || '#ffffff',
            paddingTop:      opts.paddingTop        || 80,
            paddingBottom:   opts.paddingBottom     || 80,
            titleSize:       opts.titleSize         || 42,
            subtitleSize:    opts.subtitleSize      || 18,
            cardIconSize:    opts.cardIconSize      || 36,
            cardTitleSize:   opts.cardTitleSize     || 20,
            cardDescSize:    opts.cardDescSize      || 15,
            lineConnector:   opts.lineConnector     !== false,
            animateCards:    opts.animateCards      !== false,
            threshold:       opts.threshold         || 0.45
        };

        var isRight = a.layout === 'right-sticky';

        /* --- Section wrapper --- */
        var section = document.createElement('section');
        section.className = 'bkbg-ssc-section';
        var cs = section.style;
        cs.setProperty('--bkbg-ssc-bg',            a.sectionBg);
        cs.setProperty('--bkbg-ssc-pt',            a.paddingTop + 'px');
        cs.setProperty('--bkbg-ssc-pb',            a.paddingBottom + 'px');
        cs.setProperty('--bkbg-ssc-sticky-top',    a.stickyOffset + 'px');
        cs.setProperty('--bkbg-ssc-heading-color', a.headingColor);
        cs.setProperty('--bkbg-ssc-text-color',    a.textColor);
        cs.setProperty('--bkbg-ssc-accent',         a.accentColor);
        cs.setProperty('--bkbg-ssc-card-bg',        a.cardBg);
        cs.setProperty('--bkbg-ssc-card-border',    a.cardBorder);
        cs.setProperty('--bkbg-ssc-active-bg',      a.activeCardBg);
        cs.setProperty('--bkbg-ssc-cta-bg',         a.ctaBg);
        cs.setProperty('--bkbg-ssc-cta-color',      a.ctaColor);
        cs.setProperty('--bkbg-ssc-title-size',     a.titleSize + 'px');
        cs.setProperty('--bkbg-ssc-subtitle-size',  a.subtitleSize + 'px');
        cs.setProperty('--bkbg-ssc-icon-size',      a.cardIconSize + 'px');
        cs.setProperty('--bkbg-ssc-card-title-size',a.cardTitleSize + 'px');
        cs.setProperty('--bkbg-ssc-card-desc-size', a.cardDescSize + 'px');

        typoCssVarsForEl(section, opts.headingTypo, '--bkssc-ht-');
        typoCssVarsForEl(section, opts.subtitleTypo, '--bkssc-st-');
        typoCssVarsForEl(section, opts.cardTitleTypo, '--bkssc-ct-');
        typoCssVarsForEl(section, opts.cardDescTypo, '--bkssc-cd-');

        var inner = document.createElement('div');
        inner.className = 'bkbg-ssc-inner' + (isRight ? ' bkbg-ssc-right' : '');

        /* --- Panel --- */
        var panel = document.createElement('div');
        panel.className = 'bkbg-ssc-panel';
        if (a.panelBg) panel.style.background = a.panelBg;

        var heading = document.createElement('h2');
        heading.className = 'bkbg-ssc-heading';
        heading.textContent = a.sectionTitle;
        panel.appendChild(heading);

        if (a.sectionSubtitle) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-ssc-subtitle';
            sub.textContent = a.sectionSubtitle;
            panel.appendChild(sub);
        }

        if (a.showCta && a.ctaLabel) {
            var cta = document.createElement('a');
            cta.className = 'bkbg-ssc-cta';
            cta.href = a.ctaUrl;
            cta.textContent = a.ctaLabel;
            panel.appendChild(cta);
        }

        /* --- Cards --- */
        var cards = document.createElement('div');
        cards.className = 'bkbg-ssc-cards' + (a.lineConnector ? ' bkbg-ssc-with-line' : '');

        var cardEls = a.features.map(function(f) {
            var card = document.createElement('div');
            card.className = 'bkbg-ssc-card' + (a.animateCards ? ' bkbg-ssc-animate-in' : '');

            var iconEl = document.createElement('div');
            iconEl.className = 'bkbg-ssc-card-icon';
            var _IP = window.bkbgIconPicker;
            var _iType = f.iconType || 'custom-char';
            if (_IP && _iType !== 'custom-char') {
                var _in = _IP.buildFrontendIcon(_iType, f.icon, f.iconDashicon, f.iconImageUrl, f.iconDashiconColor);
                if (_in) iconEl.appendChild(_in); else iconEl.textContent = f.icon || '⭐';
            } else { iconEl.textContent = f.icon || '⭐'; }

            var body = document.createElement('div');
            body.className = 'bkbg-ssc-card-body';

            var title = document.createElement('div');
            title.className = 'bkbg-ssc-card-title';
            title.textContent = f.title;

            var desc = document.createElement('p');
            desc.className = 'bkbg-ssc-card-desc';
            desc.textContent = f.desc;

            body.appendChild(title);
            body.appendChild(desc);
            card.appendChild(iconEl);
            card.appendChild(body);
            cards.appendChild(card);
            return card;
        });

        /* --- Layout --- */
        if (isRight) {
            inner.appendChild(cards);
            inner.appendChild(panel);
        } else {
            inner.appendChild(panel);
            inner.appendChild(cards);
        }

        section.appendChild(inner);
        appEl.replaceWith(section);

        /* --- IntersectionObserver: highlight active card --- */
        if ('IntersectionObserver' in window && cardEls.length > 0) {
            var activeCard = null;

            /* Animate-in observer */
            if (a.animateCards) {
                var revealObs = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.remove('bkbg-ssc-animate-in');
                            entry.target.classList.add('bkbg-ssc-visible');
                            revealObs.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });
                cardEls.forEach(function(c){ revealObs.observe(c); });
            }

            /* Active-highlight observer */
            var activeObs = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        if (activeCard) activeCard.classList.remove('bkbg-ssc-active');
                        entry.target.classList.add('bkbg-ssc-active');
                        activeCard = entry.target;
                    }
                });
            }, { threshold: a.threshold, rootMargin: '-15% 0px -15% 0px' });

            /* Default first card active */
            if (cardEls[0]) {
                cardEls[0].classList.add('bkbg-ssc-active');
                cardEls[0].classList.remove('bkbg-ssc-animate-in');
                cardEls[0].classList.add('bkbg-ssc-visible');
                activeCard = cardEls[0];
            }

            cardEls.forEach(function(c){ activeObs.observe(c); });
        }
    }

    document.querySelectorAll('.bkbg-ssc-app').forEach(initScrollStickyContent);
})();
