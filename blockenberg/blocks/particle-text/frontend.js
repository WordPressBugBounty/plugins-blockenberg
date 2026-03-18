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
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    function easeOut(t)    { return 1 - Math.pow(1 - t, 3); }
    function easeIn(t)     { return t * t * t; }
    function linear(t)     { return t; }
    function spring(t)     { var c4 = (2*Math.PI)/3; return t===0?0:t===1?1:Math.pow(2,-10*t)*Math.sin((t*10-0.75)*c4)+1; }

    function getEaseFn(name) {
        return { 'ease-out':easeOut, 'ease-in':easeIn, 'linear':linear, 'spring':spring }[name] || easeOut;
    }

    function hexToRgb(hex) {
        var r=parseInt((hex||'#7c3aed').replace('#','').substr(0,2),16);
        var g=parseInt((hex||'#7c3aed').replace('#','').substr(2,2),16);
        var b=parseInt((hex||'#7c3aed').replace('#','').substr(4,2),16);
        return [r,g,b];
    }

    function lerpRgb(c1, c2, t) {
        return [
            Math.round(c1[0]+(c2[0]-c1[0])*t),
            Math.round(c1[1]+(c2[1]-c1[1])*t),
            Math.round(c1[2]+(c2[2]-c1[2])*t)
        ];
    }

    function initParticleText(appEl) {
        var opts;
        try { opts = JSON.parse(appEl.getAttribute('data-opts') || '{}'); } catch(e){ opts={}; }

        var a = {
            text:          opts.text          || 'BLOCKENBERG',
            subtext:       opts.subtext       || '',
            sampleFontSize:opts.sampleFontSize|| 100,
            fontFamily:    opts.fontFamily    || 'system-ui, sans-serif',
            fontWeight:    opts.fontWeight    || '900',
            particleSize:  opts.particleSize  || 2,
            particleGap:   opts.particleGap   || 4,
            particleColor: opts.particleColor || '#7c3aed',
            particleColor2:opts.particleColor2||'#ec4899',
            useGradient:   opts.useGradient   !== false,
            bgColor:       opts.bgColor       || '#0a0a0f',
            subtextColor:  opts.subtextColor  || '#94a3b8',
            subtextSize:   opts.subtextSize   || 18,
            canvasHeight:  opts.canvasHeight  || 300,
            scatterRadius: opts.scatterRadius || 500,
            enterDuration: opts.enterDuration || 1200,
            easing:        opts.easing        || 'ease-out',
            hoverEffect:   opts.hoverEffect   !== false,
            hoverRadius:   opts.hoverRadius   || 80,
            paddingTop:    opts.paddingTop     || 80,
            paddingBottom: opts.paddingBottom  || 80,
            subtextTypo:   opts.subtextTypo    || {}
        };

        /* Section */
        var section = document.createElement('section');
        section.className = 'bkbg-pt-section';
        section.style.setProperty('--bkbg-pt-bg',       a.bgColor);
        section.style.setProperty('--bkbg-pt-pt',       a.paddingTop+'px');
        section.style.setProperty('--bkbg-pt-pb',       a.paddingBottom+'px');
        section.style.setProperty('--bkbg-pt-sub-size', a.subtextSize+'px');
        section.style.setProperty('--bkbg-pt-sub-color',a.subtextColor);

        typoCssVarsForEl(section, a.subtextTypo, '--bkbg-pt-st-');

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-pt-canvas-wrap';

        var canvas = document.createElement('canvas');
        canvas.className = 'bkbg-pt-canvas';
        canvas.style.height = a.canvasHeight + 'px';

        wrap.appendChild(canvas);
        section.appendChild(wrap);

        var subtextEl = null;
        if (a.subtext) {
            subtextEl = document.createElement('p');
            subtextEl.className = 'bkbg-pt-subtext';
            subtextEl.textContent = a.subtext;
            section.appendChild(subtextEl);
        }

        appEl.replaceWith(section);

        /* ------- Canvas setup ------- */
        var ctx = canvas.getContext('2d');
        var pixelRatio = window.devicePixelRatio || 1;
        var W, H;
        var particles = [];
        var easeFn = getEaseFn(a.easing);
        var c1 = hexToRgb(a.particleColor);
        var c2 = hexToRgb(a.particleColor2);
        var rafId = null;
        var startTime = null;
        var assembled = false;
        var mx = -9999, my = -9999;

        function sampleText() {
            /* Offscreen canvas to sample text pixels */
            var off = document.createElement('canvas');
            var fs = a.sampleFontSize;
            off.width = Math.max(800, W);
            off.height = fs * 2.5;
            var oc = off.getContext('2d');
            oc.clearRect(0, 0, off.width, off.height);
            oc.font = a.fontWeight + ' ' + fs + 'px ' + a.fontFamily;
            oc.fillStyle = '#fff';
            oc.textAlign = 'center';
            oc.textBaseline = 'middle';
            oc.fillText(a.text, off.width / 2, off.height / 2);

            var data = oc.getImageData(0, 0, off.width, off.height).data;
            var pts = [];
            var gap = a.particleGap;
            for (var y = 0; y < off.height; y += gap) {
                for (var x = 0; x < off.width; x += gap) {
                    var idx = (y * off.width + x) * 4;
                    if (data[idx + 3] > 128) {
                        /* Map from off-canvas coords to main canvas coords */
                        var cx2 = (x / off.width) * W;
                        var cy2 = (y / off.height) * H;
                        pts.push({ tx: cx2, ty: cy2 });
                    }
                }
            }
            return pts;
        }

        function buildParticles() {
            var targets = sampleText();
            particles = targets.map(function(p) {
                var angle = Math.random() * Math.PI * 2;
                var dist = Math.random() * a.scatterRadius + 50;
                return {
                    tx: p.tx, ty: p.ty,
                    x: p.tx + Math.cos(angle) * dist,
                    y: p.ty + Math.sin(angle) * dist,
                    ox: p.tx, oy: p.ty, /* original target */
                    scatterX: p.tx + Math.cos(angle) * dist,
                    scatterY: p.ty + Math.sin(angle) * dist,
                    color: Math.random()
                };
            });
        }

        function resize() {
            W = wrap.clientWidth || 800;
            H = a.canvasHeight;
            canvas.width  = W * pixelRatio;
            canvas.height = H * pixelRatio;
            canvas.style.width  = W + 'px';
            canvas.style.height = H + 'px';
            ctx.scale(pixelRatio, pixelRatio);
            buildParticles();
        }

        function drawFrame(now) {
            ctx.clearRect(0, 0, W, H);

            var elapsed = now - (startTime || now);
            var t = Math.min(1, elapsed / a.enterDuration);
            var et = easeFn(t);

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];

                if (!assembled) {
                    p.x = p.scatterX + (p.tx - p.scatterX) * et;
                    p.y = p.scatterY + (p.ty - p.scatterY) * et;
                }

                /* Hover repulsion */
                if (a.hoverEffect && assembled) {
                    var dx = p.x - mx, dy = p.y - my;
                    var dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < a.hoverRadius) {
                        var force = (a.hoverRadius - dist) / a.hoverRadius;
                        p.x += (dx / dist) * force * 30;
                        p.y += (dy / dist) * force * 30;
                    } else {
                        p.x += (p.tx - p.x) * 0.12;
                        p.y += (p.ty - p.y) * 0.12;
                    }
                }

                var rgb = a.useGradient ? lerpRgb(c1, c2, p.color) : c1;
                var alpha = assembled ? 1 : (0.4 + et * 0.6);
                ctx.fillStyle = 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+alpha+')';
                ctx.fillRect(p.x - a.particleSize/2, p.y - a.particleSize/2, a.particleSize, a.particleSize);
            }

            if (!assembled && t >= 1) {
                assembled = true;
                if (subtextEl) subtextEl.classList.add('bkbg-pt-visible');
            }
        }

        function loop(now) {
            if (!startTime) startTime = now;
            drawFrame(now);
            rafId = requestAnimationFrame(loop);
        }

        /* Start when visible */
        resize();
        window.addEventListener('resize', function() { resize(); if (assembled) { assembled = false; startTime = null; } });

        if ('IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function(entries) {
                if (entries[0].isIntersecting) {
                    if (!rafId) { startTime = null; assembled = false; rafId = requestAnimationFrame(loop); }
                } else {
                    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
                }
            }, { threshold: 0.1 });
            obs.observe(section);
        } else {
            rafId = requestAnimationFrame(loop);
        }

        /* Mouse tracking for hover effect */
        if (a.hoverEffect) {
            canvas.addEventListener('mousemove', function(e) {
                var rect = canvas.getBoundingClientRect();
                mx = e.clientX - rect.left;
                my = e.clientY - rect.top;
            });
            canvas.addEventListener('mouseleave', function() { mx = -9999; my = -9999; });
        }
    }

    document.querySelectorAll('.bkbg-pt-app').forEach(initParticleText);
})();
