(function () {
    'use strict';

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

    function lerp(a, b, t) { return a + (b - a) * t; }

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
        var n = parseInt(hex, 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    document.querySelectorAll('.bkbg-igm-app').forEach(function (app) {
        var o;
        try { o = JSON.parse(app.dataset.opts || '{}'); } catch (e) { return; }

        var colors         = Array.isArray(o.colors) && o.colors.length ? o.colors : ['#6366f1','#f43f5e','#06b6d4','#f59e0b'];
        var blobCount      = Math.min(o.blobCount  || 5, colors.length);
        var blobSize       = o.blobSize      || 55;
        var blurAmount     = o.blurAmount    || 80;
        var blendMode      = o.blendMode     || 'screen';
        var mouseInfluence = o.mouseInfluence || 30;
        var autoAnimate    = !!o.autoAnimate;
        var animSpeed      = o.animateSpeed  || 0.6;
        var baseBg         = o.baseBg        || '#0f172a';
        var height         = o.height        || 480;
        var showContent    = !!o.showContent;
        var heading        = o.heading       || '';
        var subheading     = o.subheading    || '';
        var ctaText        = o.ctaText       || '';
        var ctaUrl         = o.ctaUrl        || '#';
        var headingSize    = o.headingSize   || 48;
        var subheadingSize = o.subheadingSize || 18;
        var headingColor   = o.headingColor  || '#ffffff';
        var subheadingColor= o.subheadingColor || 'rgba(255,255,255,0.75)';
        var ctaBg          = o.ctaBg         || '#ffffff';
        var ctaColor       = o.ctaColor      || '#0f172a';
        var ctaRadius      = o.ctaRadius     || 100;
        var contentAlign   = o.contentAlign  || 'center';

        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        /* ── App container ── */
        app.style.height     = height + 'px';
        app.style.background = baseBg;
        app.classList.add('bkbg-igm-align-' + contentAlign);
        typoCssVarsForEl(o.headingTypo, '--bkbg-igm-h-', app);
        typoCssVarsForEl(o.subheadingTypo, '--bkbg-igm-sh-', app);

        /* ── Canvas ── */
        var canvas = document.createElement('canvas');
        canvas.className = 'bkbg-igm-canvas';
        app.appendChild(canvas);

        var ctx = canvas.getContext('2d');

        function resize() {
            canvas.width  = app.offsetWidth;
            canvas.height = app.offsetHeight;
        }
        resize();
        window.addEventListener('resize', function () { resize(); });

        /* ── Blobs ── */
        var blobs = [];
        for (var i = 0; i < blobCount; i++) {
            var color = colors[i % colors.length];
            var rgb   = hexToRgb(color);
            blobs.push({
                x:    Math.random(),
                y:    Math.random(),
                tx:   Math.random(),
                ty:   Math.random(),
                r:    rgb,
                phase: Math.random() * Math.PI * 2,
                spd:   0.2 + Math.random() * 0.6
            });
        }

        /* ── Mouse tracking ── */
        var mouseX = 0.5, mouseY = 0.5;
        app.addEventListener('mousemove', function (e) {
            var rect = app.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width;
            mouseY = (e.clientY - rect.top)  / rect.height;
        });

        /* ── Render loop ── */
        var lastTime  = null;
        var rafId     = null;
        var elapsed   = 0;

        function draw(ts) {
            if (!lastTime) lastTime = ts;
            var dt = (ts - lastTime) / 1000;
            lastTime = ts;
            elapsed += dt * animSpeed;

            var W = canvas.width;
            var H = canvas.height;

            ctx.clearRect(0, 0, W, H);

            blobs.forEach(function (blob, i) {
                /* auto movement */
                if (autoAnimate && !reducedMotion) {
                    blob.x = 0.5 + 0.4 * Math.sin(elapsed * blob.spd + blob.phase);
                    blob.y = 0.5 + 0.4 * Math.cos(elapsed * blob.spd * 0.7 + blob.phase + 1);
                }

                /* mouse influence */
                var px = blob.x + (mouseX - 0.5) * (mouseInfluence / 100);
                var py = blob.y + (mouseY - 0.5) * (mouseInfluence / 100);

                var bx = W * Math.max(0, Math.min(1, px));
                var by = H * Math.max(0, Math.min(1, py));
                var br = Math.min(W, H) * (blobSize / 100);

                var grad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
                grad.addColorStop(0, 'rgba(' + blob.r[0] + ',' + blob.r[1] + ',' + blob.r[2] + ',0.85)');
                grad.addColorStop(1, 'rgba(' + blob.r[0] + ',' + blob.r[1] + ',' + blob.r[2] + ',0)');

                ctx.save();
                ctx.filter = 'blur(' + blurAmount + 'px)';
                ctx.globalCompositeOperation = blendMode;
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(bx, by, br, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            rafId = requestAnimationFrame(draw);
        }

        /* ── Intersection observer ── */
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    lastTime = null;
                    rafId = requestAnimationFrame(draw);
                } else {
                    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
                }
            });
        }, { threshold: 0.05 });
        observer.observe(app);

        /* ── Content ── */
        if (showContent) {
            var content = document.createElement('div');
            content.className = 'bkbg-igm-content';

            var inner = document.createElement('div');
            inner.className = 'bkbg-igm-inner';

            if (heading) {
                var h2 = document.createElement('h2');
                h2.className = 'bkbg-igm-heading';
                h2.style.color    = headingColor;
                h2.textContent    = heading;
                inner.appendChild(h2);
            }
            if (subheading) {
                var p = document.createElement('p');
                p.className = 'bkbg-igm-subheading';
                p.style.color    = subheadingColor;
                p.textContent    = subheading;
                inner.appendChild(p);
            }
            if (ctaText) {
                var a = document.createElement('a');
                a.className = 'bkbg-igm-cta';
                a.href      = ctaUrl;
                a.style.background   = ctaBg;
                a.style.color        = ctaColor;
                a.style.borderRadius = ctaRadius + 'px';
                a.style.fontSize     = '15px';
                a.textContent = ctaText;
                inner.appendChild(a);
            }

            content.appendChild(inner);
            app.appendChild(content);
        }
    });
}());
