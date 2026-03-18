(function () {

    var typoMap = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        for (var i = 0; i < typoMap.length; i++) {
            var v = typo[typoMap[i][0]];
            if (v !== undefined && v !== '' && v !== null) el.style.setProperty(prefix + typoMap[i][1], String(v));
        }
    }

    function fibonacciSphere(n, r) {
        var points = [];
        var phi = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < n; i++) {
            var y = 1 - (i / Math.max(n - 1, 1)) * 2;
            var radius = Math.sqrt(1 - y * y);
            var theta = phi * i;
            points.push([Math.cos(theta) * radius * r, y * r, Math.sin(theta) * radius * r]);
        }
        return points;
    }

    function rotateX(pts, a) {
        var cos = Math.cos(a), sin = Math.sin(a);
        return pts.map(function(p) { return [p[0], p[1]*cos - p[2]*sin, p[1]*sin + p[2]*cos]; });
    }
    function rotateY(pts, a) {
        var cos = Math.cos(a), sin = Math.sin(a);
        return pts.map(function(p) { return [p[0]*cos + p[2]*sin, p[1], -p[0]*sin + p[2]*cos]; });
    }

    function lerpColor(a, b, t) {
        if (!a || !b) return a||b||'#fff';
        function h(str, o) { return parseInt(str.replace('#','').substr(o,2),16); }
        var rr=Math.round(h(a,0)+(h(b,0)-h(a,0))*t);
        var rg=Math.round(h(a,2)+(h(b,2)-h(a,2))*t);
        var rb=Math.round(h(a,4)+(h(b,4)-h(a,4))*t);
        return 'rgb('+rr+','+rg+','+rb+')';
    }

    var MULTI_COLORS = ['#7c3aed','#ec4899','#06b6d4','#f59e0b','#10b981','#ef4444','#3b82f6'];

    function initIconCloud(appEl) {
        var opts;
        try { opts = JSON.parse(appEl.getAttribute('data-opts') || '{}'); } catch(e){ opts = {}; }

        var a = {
            items:          opts.items         || [],
            cloudRadius:    opts.cloudRadius   || 220,
            autoRotateX:    opts.autoRotateX   === undefined ? 0.002 : opts.autoRotateX,
            autoRotateY:    opts.autoRotateY   === undefined ? 0.004 : opts.autoRotateY,
            mouseEffect:    opts.mouseEffect   !== false,
            mouseStrength:  opts.mouseStrength || 0.06,
            perspective:    opts.perspective   || 900,
            fontSize:       (opts.itemTypo && opts.itemTypo.sizeDesktop) ? parseFloat(opts.itemTypo.sizeDesktop) : (opts.fontSize || 14),
            fontWeight:     opts.fontWeight    || 600,
            itemPadding:    opts.itemPadding   || 6,
            itemBorderRadius:opts.itemBorderRadius||6,
            bgColor:        opts.bgColor       || '',
            cloudHeight:    opts.cloudHeight   || 500,
            colorMode:      opts.colorMode     || 'gradient',
            colorFrom:      opts.colorFrom     || '#7c3aed',
            colorTo:        opts.colorTo       || '#ec4899',
            itemBg:         opts.itemBg        || '#1e1b4b',
            itemBorder:     opts.itemBorder    || '#7c3aed44',
            textColor:      opts.textColor     || '#e2e8f0',
            hoverBg:        opts.hoverBg       || '#7c3aed',
            hoverColor:     opts.hoverColor    || '#ffffff',
            showBackground: opts.showBackground|| false,
            depthFade:      opts.depthFade     !== false
        };

        if (!a.items.length) {
            appEl.remove();
            return;
        }

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-ic-wrap';
        var cs = wrap.style;
        cs.setProperty('--bkbg-ic-height',      a.cloudHeight + 'px');
        cs.setProperty('--bkbg-ic-bg',          a.showBackground && a.bgColor ? a.bgColor : 'transparent');
        cs.setProperty('--bkbg-ic-item-bg',     a.itemBg);
        cs.setProperty('--bkbg-ic-item-border', a.itemBorder);
        cs.setProperty('--bkbg-ic-fs',          a.fontSize + 'px');
        cs.setProperty('--bkbg-ic-fw',          String(a.fontWeight));
        cs.setProperty('--bkbg-ic-br',          a.itemBorderRadius + 'px');
        cs.setProperty('--bkbg-ic-pv',          a.itemPadding + 'px');
        cs.setProperty('--bkbg-ic-ph',          (a.itemPadding + 6) + 'px');
        cs.setProperty('--bkbg-ic-hover-bg',    a.hoverBg);
        cs.setProperty('--bkbg-ic-hover-color', a.hoverColor);
        cs.setProperty('--bkbg-ic-fw',          String(a.fontWeight));
        cs.setProperty('--bkbg-ic-fs',          a.fontSize + 'px');
        typoCssVarsForEl(opts.itemTypo, '--bkbg-ic-it-', wrap);

        var stage = document.createElement('div');
        stage.className = 'bkbg-ic-stage';

        /* Build DOM items */
        var itemEls = a.items.map(function(txt, i) {
            var div = document.createElement('div');
            div.className = 'bkbg-ic-item';
            div.textContent = txt;
            if (a.colorMode === 'multi') {
                div.style.color = MULTI_COLORS[i % MULTI_COLORS.length];
            }
            stage.appendChild(div);
            return div;
        });

        wrap.appendChild(stage);
        appEl.replaceWith(wrap);

        var n = a.items.length;
        var r = a.cloudRadius;
        var pts = fibonacciSphere(n, r);

        var rotX = 0, rotY = 0;
        var mouseX = 0, mouseY = 0;
        var rafId = null;

        function render() {
            var rotated = rotateX(rotateY(pts, rotY), rotX);
            var persp = a.perspective;

            for (var i = 0; i < n; i++) {
                var p = rotated[i];
                var scale = persp / (persp - p[2]);
                var x2d = p[0] * scale;
                var y2d = p[1] * scale;
                var depth = (p[2] + r) / (2 * r); /* 0=back, 1=front */
                var opacity = a.depthFade ? (0.25 + depth * 0.75) : 1;
                var el = itemEls[i];

                var color;
                if (a.colorMode === 'gradient') {
                    color = lerpColor(a.colorTo, a.colorFrom, depth);
                } else if (a.colorMode === 'multi') {
                    color = MULTI_COLORS[i % MULTI_COLORS.length];
                } else {
                    color = a.textColor;
                }

                el.style.transform = 'translate(-50%,-50%) translate(' + x2d + 'px,' + y2d + 'px)';
                el.style.zIndex = Math.round(depth * 100);
                el.style.opacity = opacity;
                el.style.color = color;
                el.style.fontSize = (a.fontSize * (0.7 + depth * 0.5)) + 'px';
            }
        }

        function loop() {
            rotY += a.autoRotateY + mouseX * a.mouseStrength;
            rotX += a.autoRotateX + mouseY * a.mouseStrength;
            mouseX *= 0.9;
            mouseY *= 0.9;
            render();
            rafId = requestAnimationFrame(loop);
        }

        if (a.mouseEffect) {
            stage.addEventListener('mousemove', function(e) {
                var rect = stage.getBoundingClientRect();
                mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width * 0.08;
                mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height * 0.08;
            });
            stage.addEventListener('mouseleave', function() { mouseX = 0; mouseY = 0; });
        }

        /* Pause when off-screen */
        if ('IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function(entries) {
                if (entries[0].isIntersecting) { if (!rafId) loop(); }
                else { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }
            }, { threshold: 0 });
            obs.observe(wrap);
        } else {
            loop();
        }
    }

    document.querySelectorAll('.bkbg-ic-app').forEach(initIconCloud);
})();
