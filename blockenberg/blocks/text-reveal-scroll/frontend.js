(function () {
    function initTextRevealScroll(appEl) {
        var opts;
        try { opts = JSON.parse(appEl.getAttribute('data-opts') || '{}'); } catch(e){ opts = {}; }

        var a = {
            text:          opts.text          || '',
            subtext:       opts.subtext       || '',
            tag:           opts.tag           || 'h2',
            revealUnit:    opts.revealUnit    || 'word',
            revealAnim:    opts.revealAnim    || 'slide-up',
            stagger:       opts.stagger       === undefined ? 60 : opts.stagger,
            duration:      opts.duration      || 600,
            triggerOffset: opts.triggerOffset === undefined ? 15 : opts.triggerOffset,
            once:          opts.once          !== false,
            textAlign:     opts.textAlign     || 'center',
            fontSize:      opts.fontSize      || 52,
            fontWeight:    opts.fontWeight    || 800,
            lineHeight:    opts.lineHeight    || 1.15,
            letterSpacing: opts.letterSpacing === undefined ? -1 : opts.letterSpacing,
            subtextSize:   opts.subtextSize   || 18,
            paddingTop:    opts.paddingTop     || 80,
            paddingBottom: opts.paddingBottom  || 80,
            maxWidth:      opts.maxWidth       || 900,
            bgColor:       opts.bgColor        || '',
            textColor:     opts.textColor      || '#0f172a',
            subtextColor:  opts.subtextColor   || '#64748b',
            accentColor:   opts.accentColor    || '#7c3aed',
            accentWords:   opts.accentWords    || '',
            useGradient:   opts.useGradient    || false,
            gradFrom:      opts.gradFrom       || '#7c3aed',
            gradTo:        opts.gradTo         || '#ec4899'
        };

        var accentSet = {};
        a.accentWords.split(',').forEach(function(w){ var t=w.trim().toLowerCase(); if(t) accentSet[t]=true; });

        var animClass = {
            'slide-up': 'bkbg-trs-slide-up',
            'fade':     'bkbg-trs-fade',
            'blur':     'bkbg-trs-blur',
            'clip':     'bkbg-trs-clip',
            'scale':    'bkbg-trs-scale'
        }[a.revealAnim] || 'bkbg-trs-slide-up';

        /* Section */
        var section = document.createElement('section');
        section.className = 'bkbg-trs-section';
        var cs = section.style;
        cs.setProperty('--bkbg-trs-bg',        a.bgColor || 'transparent');
        cs.setProperty('--bkbg-trs-pt',         a.paddingTop + 'px');
        cs.setProperty('--bkbg-trs-pb',         a.paddingBottom + 'px');
        cs.setProperty('--bkbg-trs-align',      a.textAlign);
        cs.setProperty('--bkbg-trs-max-width',  a.maxWidth + 'px');
        cs.setProperty('--bkbg-trs-text-color', a.textColor);
        cs.setProperty('--bkbg-trs-accent',     a.accentColor);
        cs.setProperty('--bkbg-trs-sub-color',  a.subtextColor);
        cs.setProperty('--bkbg-trs-dur',        a.duration + 'ms');
        cs.setProperty('--bkbg-trs-grad-from',  a.gradFrom);
        cs.setProperty('--bkbg-trs-grad-to',    a.gradTo);

        var inner = document.createElement('div');
        inner.className = 'bkbg-trs-inner';

        /* Build heading with animated units */
        var heading = document.createElement(a.tag);
        heading.className = 'bkbg-trs-heading';

        var text = a.text || '';
        var units = a.revealUnit === 'char' ? text.split('') : text.split(/\s+/);
        var unitEls = [];

        units.forEach(function(unit, i) {
            var span = document.createElement('span');
            var isAccent = accentSet[unit.toLowerCase()];
            span.className = [
                'bkbg-trs-unit',
                animClass,
                'bkbg-trs-hidden',
                isAccent ? 'bkbg-trs-accent' : '',
                isAccent && a.useGradient ? 'bkbg-trs-gradient' : ''
            ].filter(Boolean).join(' ');
            span.style.transitionDelay = (i * a.stagger) + 'ms';
            if (isAccent && !a.useGradient) { span.style.color = a.accentColor; }

            /* Add a non-breaking space after word (except last) */
            span.textContent = unit;
            heading.appendChild(span);

            if (a.revealUnit !== 'char' && i < units.length - 1) {
                heading.appendChild(document.createTextNode('\u00a0'));
            }

            unitEls.push(span);
        });

        inner.appendChild(heading);

        /* Subtext */
        var subtextEl = null;
        if (a.subtext) {
            subtextEl = document.createElement('p');
            subtextEl.className = 'bkbg-trs-subtext';
            subtextEl.textContent = a.subtext;
            inner.appendChild(subtextEl);
        }

        section.appendChild(inner);
        appEl.replaceWith(section);

        /* Reveal logic */
        var revealed = false;

        function revealAll() {
            unitEls.forEach(function(u) {
                u.classList.remove('bkbg-trs-hidden');
                u.classList.add('bkbg-trs-shown');
            });
            if (subtextEl) {
                var delay = unitEls.length * a.stagger + 150;
                setTimeout(function(){ subtextEl.classList.add('bkbg-trs-shown'); }, delay);
            }
            if (a.once) revealed = true;
        }

        function hideAll() {
            if (a.once && revealed) return;
            unitEls.forEach(function(u) {
                u.classList.remove('bkbg-trs-shown');
                u.classList.add('bkbg-trs-hidden');
            });
            if (subtextEl) subtextEl.classList.remove('bkbg-trs-shown');
        }

        if ('IntersectionObserver' in window) {
            var rootMargin = '-' + (a.triggerOffset || 15) + '% 0px -' + (a.triggerOffset || 15) + '% 0px';
            var obs = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        revealAll();
                    } else if (!a.once) {
                        hideAll();
                    }
                });
            }, { rootMargin: rootMargin, threshold: 0.01 });
            obs.observe(section);
        } else {
            revealAll();
        }
    }

    document.querySelectorAll('.bkbg-trs-app').forEach(initTextRevealScroll);
})();
