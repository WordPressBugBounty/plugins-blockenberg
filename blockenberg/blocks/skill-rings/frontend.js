(function () {
    var SVG_NS = 'http://www.w3.org/2000/svg';

    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        transform:'text-transform', decoration:'text-decoration',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    var _typoUnits = { size:'sizeUnit', lineHeight:'lineHeightUnit', letterSpacing:'letterSpacingUnit', wordSpacing:'wordSpacingUnit' };
    var _typoUnitDefaults = { size:'px', lineHeight:'', letterSpacing:'px', wordSpacing:'px' };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var prop = _typoKeys[k];
            var base = k.replace(/Desktop|Tablet|Mobile/, '');
            var uKey = _typoUnits[base];
            if (uKey && typeof v === 'number') v = v + (obj[uKey] || _typoUnitDefaults[base] || '');
            el.style.setProperty('--' + prefix + prop, v);
        });
    }

    function svgEl(tag, attrs) {
        var el = document.createElementNS(SVG_NS, tag);
        Object.keys(attrs).forEach(function(k) { el.setAttribute(k, attrs[k]); });
        return el;
    }

    function easeFn(name) {
        return { 'ease-out':'cubic-bezier(0,0,0.25,1)', 'ease-in':'cubic-bezier(0.75,0,1,1)', 'linear':'linear' }[name] || 'cubic-bezier(0,0,0.25,1)';
    }

    function initSkillRings(appEl) {
        var opts;
        try { opts = JSON.parse(appEl.getAttribute('data-opts') || '{}'); } catch(e){ opts={}; }

        var a = {
            skills:         opts.skills         || [],
            layout:         opts.layout         || 'row',
            ringSize:       opts.ringSize        || 140,
            ringGap:        opts.ringGap         || 14,
            strokeWidth:    opts.strokeWidth     || 10,
            trackColor:     opts.trackColor      || '#1f2937',
            animDuration:   opts.animDuration    || 1400,
            animEasing:     opts.animEasing      || 'ease-out',
            animDelay:      opts.animDelay       || 120,
            showPercentage: opts.showPercentage  !== false,
            showLabel:      opts.showLabel       !== false,
            labelPosition:  opts.labelPosition   || 'below',
            lineCap:        opts.lineCap         || 'round',
            bgColor:        opts.bgColor         || '',
            labelColor:     opts.labelColor      || '#ffffff',
            pctColor:       opts.pctColor        || '#ffffff',
            pctSize:        opts.pctSize         || 28,
            labelSize:      opts.labelSize       || 14,
            paddingTop:     opts.paddingTop      || 60,
            paddingBottom:  opts.paddingBottom   || 60,
            centerLabel:    opts.centerLabel     || '',
            centerLabelColor:opts.centerLabelColor||'#ffffff'
        };

        if (!a.skills.length) { appEl.remove(); return; }

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-sr-wrap';
        var cs = wrap.style;
        cs.setProperty('--bkbg-sr-bg',         a.bgColor || 'transparent');
        cs.setProperty('--bkbg-sr-pt',          a.paddingTop + 'px');
        cs.setProperty('--bkbg-sr-pb',          a.paddingBottom + 'px');
        cs.setProperty('--bkbg-sr-dur',         a.animDuration + 'ms');
        cs.setProperty('--bkbg-sr-easing',      easeFn(a.animEasing));
        cs.setProperty('--bkbg-sr-pct-size',    a.pctSize + 'px');
        cs.setProperty('--bkbg-sr-label-size',  a.labelSize + 'px');
        cs.setProperty('--bkbg-sr-pct-color',   a.pctColor);
        cs.setProperty('--bkbg-sr-label-color', a.labelColor);

        /* Apply typography CSS vars */
        typoCssVarsForEl(wrap, opts.pctTypo, 'bksr-pc-');
        typoCssVarsForEl(wrap, opts.labelTypo, 'bksr-lb-');

        var progressEls = [];

        if (a.layout === 'row') {
            var row = document.createElement('div');
            row.className = 'bkbg-sr-row';

            a.skills.forEach(function(skill, i) {
                var size = a.ringSize;
                var sw = a.strokeWidth;
                var r = (size - sw) / 2;
                var circ = 2 * Math.PI * r;
                var cx = size / 2, cy = size / 2;
                var targetOffset = circ * (1 - (skill.pct || 0) / 100);

                var item = document.createElement('div');
                item.className = 'bkbg-sr-item';

                var ringWrap = document.createElement('div');
                ringWrap.className = 'bkbg-sr-ring-wrap';

                var svg = svgEl('svg', { width:size, height:size, viewBox:'0 0 '+size+' '+size });

                /* Track */
                svg.appendChild(svgEl('circle', { cx:cx, cy:cy, r:r, fill:'none', stroke:a.trackColor, 'stroke-width':sw }));

                /* Progress */
                var prog = svgEl('circle', {
                    cx:cx, cy:cy, r:r, fill:'none',
                    stroke: skill.color || '#7c3aed',
                    'stroke-width': sw,
                    'stroke-dasharray': circ,
                    'stroke-dashoffset': circ, /* starts at 0% */
                    'stroke-linecap': a.lineCap,
                    class:'bkbg-sr-progress',
                    transform:'rotate(-90 '+cx+' '+cy+')'
                });
                prog.style.transitionDelay = (i * a.animDelay) + 'ms';
                svg.appendChild(prog);

                progressEls.push({ el: prog, target: targetOffset });

                /* Center label (inside) */
                if (a.labelPosition === 'inside') {
                    var center = document.createElement('div');
                    center.className = 'bkbg-sr-center';
                    if (a.showPercentage) {
                        var pctSpan = document.createElement('span');
                        pctSpan.className = 'bkbg-sr-pct';
                        pctSpan.textContent = (skill.pct||0) + '%';
                        center.appendChild(pctSpan);
                    }
                    if (a.showLabel) {
                        var nameSpan = document.createElement('span');
                        nameSpan.className = 'bkbg-sr-name-inside';
                        nameSpan.textContent = skill.name;
                        center.appendChild(nameSpan);
                    }
                    ringWrap.appendChild(center);
                }

                ringWrap.appendChild(svg);
                item.appendChild(ringWrap);

                /* Below label */
                if (a.labelPosition !== 'inside') {
                    var below = document.createElement('div');
                    below.className = 'bkbg-sr-label-below';
                    if (a.showPercentage) {
                        var pctD = document.createElement('div');
                        pctD.className = 'bkbg-sr-pct-below';
                        pctD.style.color = skill.color || a.pctColor;
                        pctD.textContent = (skill.pct||0) + '%';
                        below.appendChild(pctD);
                    }
                    if (a.showLabel) {
                        var nameD = document.createElement('div');
                        nameD.className = 'bkbg-sr-name-below';
                        nameD.textContent = skill.name;
                        below.appendChild(nameD);
                    }
                    item.appendChild(below);
                }

                row.appendChild(item);
            });

            wrap.appendChild(row);

        } else {
            /* Concentric layout */
            var sw2 = a.strokeWidth;
            var gap = a.ringGap;
            var n = a.skills.length;
            var totalSize = a.ringSize + (n > 1 ? (n-1)*(sw2 + gap) : 0);
            var cx2 = totalSize/2, cy2 = totalSize/2;

            var conc = document.createElement('div');
            conc.className = 'bkbg-sr-concentric';

            var svg2 = svgEl('svg', { width:totalSize, height:totalSize, viewBox:'0 0 '+totalSize+' '+totalSize, style:'max-width:100%' });

            a.skills.forEach(function(skill, i) {
                var r2 = (totalSize/2) - sw2/2 - i*(sw2+gap);
                if (r2 <= 0) return;
                var circ2 = 2*Math.PI*r2;
                var targetOffset2 = circ2*(1-(skill.pct||0)/100);

                svg2.appendChild(svgEl('circle',{cx:cx2,cy:cy2,r:r2,fill:'none',stroke:a.trackColor,'stroke-width':sw2}));
                var prog2 = svgEl('circle',{
                    cx:cx2,cy:cy2,r:r2,fill:'none',
                    stroke:skill.color||'#7c3aed','stroke-width':sw2,
                    'stroke-dasharray':circ2,'stroke-dashoffset':circ2,
                    'stroke-linecap':a.lineCap,class:'bkbg-sr-progress',
                    transform:'rotate(-90 '+cx2+' '+cy2+')'
                });
                prog2.style.transitionDelay = (i*a.animDelay)+'ms';
                svg2.appendChild(prog2);
                progressEls.push({el:prog2, target:targetOffset2});
            });

            /* Center label */
            if (a.centerLabel) {
                var txt = svgEl('text',{x:cx2,y:cy2,'dominant-baseline':'middle','text-anchor':'middle',fill:a.centerLabelColor,'font-size':20,'font-weight':700});
                txt.textContent = a.centerLabel;
                svg2.appendChild(txt);
            }

            conc.appendChild(svg2);

            /* Legend */
            var legend = document.createElement('div');
            legend.className = 'bkbg-sr-legend';
            a.skills.forEach(function(skill){
                var li = document.createElement('div'); li.className='bkbg-sr-legend-item';
                var dot = document.createElement('div'); dot.className='bkbg-sr-legend-dot'; dot.style.background=skill.color||'#7c3aed';
                var nm = document.createElement('span'); nm.className='bkbg-sr-legend-name'; nm.textContent=skill.name;
                var pc = document.createElement('span'); pc.className='bkbg-sr-legend-pct'; pc.style.color=skill.color||'#7c3aed'; pc.textContent=(skill.pct||0)+'%';
                li.appendChild(dot); li.appendChild(nm); li.appendChild(pc);
                legend.appendChild(li);
            });
            conc.appendChild(legend);
            wrap.appendChild(conc);
        }

        appEl.replaceWith(wrap);

        /* Animate when in view */
        function triggerAnimation() {
            progressEls.forEach(function(p) { p.el.setAttribute('stroke-dashoffset', p.target); });
        }

        if ('IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function(entries) {
                if (entries[0].isIntersecting) {
                    triggerAnimation();
                    obs.disconnect();
                }
            }, { threshold: 0.2 });
            obs.observe(wrap);
        } else {
            triggerAnimation();
        }
    }

    document.querySelectorAll('.bkbg-sr-app').forEach(initSkillRings);
})();
