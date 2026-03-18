(function () {
    'use strict';

    function lerpColor(a, b, t) {
        function parse(c) {
            var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c);
            return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [200, 180, 100];
        }
        var ca = parse(a), cb = parse(b);
        return 'rgba(' +
            Math.round(ca[0] + (cb[0] - ca[0]) * t) + ',' +
            Math.round(ca[1] + (cb[1] - ca[1]) * t) + ',' +
            Math.round(ca[2] + (cb[2] - ca[2]) * t) + ',{A})';
    }

    function rainbow(i, total) {
        return 'hsl(' + Math.round((i / total) * 360) + ',90%,65%)';
    }

    // Star polygon path
    function starPath(ctx, cx, cy, r, spikes) {
        var step = Math.PI / spikes;
        ctx.beginPath();
        for (var i = 0; i < spikes * 2; i++) {
            var ang = i * step - Math.PI / 2;
            var ri  = i % 2 === 0 ? r : r * 0.45;
            ctx.lineTo(cx + Math.cos(ang) * ri, cy + Math.sin(ang) * ri);
        }
        ctx.closePath();
    }

    function initMouseTrail(appEl) {
        var raw = appEl.dataset.opts;
        if (!raw) return;
        var opts;
        try { opts = JSON.parse(raw); } catch (e) { return; }

        // Mobile check
        if (!opts.showOnMobile && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
            // Replace app element with a simple section (no trail)
            buildSectionOnly(appEl, opts);
            return;
        }

        var isPage = opts.scope === 'page';
        var particles = [];
        var hue = 0;
        var mouseX = -1000, mouseY = -1000;

        // ── Build DOM ────────────────────────────────────────────────
        var section = document.createElement('div');
        section.className = 'bkbg-mt-section';
        section.style.height = (opts.sectionHeight || 200) + 'px';
        section.style.backgroundColor = opts.sectionBg || '#1e1b4b';
        section.style.borderRadius = (opts.sectionRadius || 16) + 'px';

        if (opts.previewText) {
            var lbl = document.createElement('div');
            lbl.className = 'bkbg-mt-label';
            lbl.textContent = opts.previewText;
            section.appendChild(lbl);
        }

        var canvas = document.createElement('canvas');
        var ctx;
        if (isPage) {
            canvas.className = 'bkbg-mt-canvas';
            canvas.style.mixBlendMode = opts.mixBlend || 'normal';
            document.body.appendChild(canvas);
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
            window.addEventListener('resize', function () {
                canvas.width  = window.innerWidth;
                canvas.height = window.innerHeight;
            });
        } else {
            canvas.className = 'bkbg-mt-canvas-scoped';
            canvas.style.mixBlendMode = opts.mixBlend || 'normal';
            section.appendChild(canvas);
        }
        ctx = canvas.getContext('2d');

        appEl.parentNode.replaceChild(section, appEl);

        // ── Event listeners ──────────────────────────────────────────
        var target = isPage ? window : section;

        target.addEventListener('mousemove', function (e) {
            if (isPage) {
                mouseX = e.clientX;
                mouseY = e.clientY;
            } else {
                var rect = section.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;
            }
            spawnParticle(mouseX, mouseY, 1);
        });

        if (opts.burstOnClick) {
            (isPage ? window : section).addEventListener('click', function (e) {
                var bx = mouseX, by = mouseY;
                if (!isPage) {
                    var rect = section.getBoundingClientRect();
                    bx = e.clientX - rect.left;
                    by = e.clientY - rect.top;
                }
                for (var i = 0; i < (opts.burstCount || 20); i++) {
                    spawnParticle(bx, by, 2);
                }
            });
        }

        // ── Particle spawning ────────────────────────────────────────
        function spawnParticle(x, y, sizeMult) {
            if (particles.length > (opts.particleCount || 30)) return;
            var angle  = Math.random() * Math.PI * 2;
            var speed  = Math.random() * 2.5 + 0.5;
            var spread = opts.spreadRadius || 20;
            var ps     = (opts.particleSize || 8) * (sizeMult || 1) * (0.6 + Math.random() * 0.8);
            var style  = opts.trailStyle || 'sparkle';
            var col    = getColor(particles.length, opts.particleCount);

            particles.push({
                x: x + (Math.random() - 0.5) * spread * 0.5,
                y: y + (Math.random() - 0.5) * spread * 0.5,
                vx: Math.cos(angle) * speed * (spread / 20),
                vy: Math.sin(angle) * speed * (spread / 20),
                size: ps,
                color: col,
                life: 1.0,
                style: style,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.15
            });
        }

        function getColor(idx, total) {
            var mode = opts.colorMode || 'gradient';
            if (mode === 'rainbow') { hue = (hue + 8) % 360; return 'hsl(' + hue + ',90%,65%)'; }
            if (mode === 'gradient') {
                var t = Math.random();
                return lerpColor(opts.color1 || '#f59e0b', opts.color2 || '#ec4899', t).replace('{A}', '1');
            }
            return opts.color1 || '#f59e0b';
        }

        // ── Draw loop ────────────────────────────────────────────────
        var raf;
        function draw() {
            raf = requestAnimationFrame(draw);

            if (isPage) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            } else {
                canvas.width  = section.offsetWidth;
                canvas.height = section.offsetHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            var fadeSpeed = (opts.trailFade || 60) / 1000;
            var gravity   = opts.gravity !== undefined ? opts.gravity : 0.15;
            var glow      = opts.glowEffect;
            var glowSz    = opts.glowSize || 12;

            for (var i = particles.length - 1; i >= 0; i--) {
                var p = particles[i];
                p.x  += p.vx;
                p.y  += p.vy;
                p.vy += gravity;
                p.vx *= 0.97;
                p.life -= fadeSpeed;
                p.rot  += p.rotSpeed;

                if (p.life <= 0) { particles.splice(i, 1); continue; }

                ctx.globalAlpha = Math.max(0, p.life);
                if (glow) { ctx.shadowBlur = glowSz; ctx.shadowColor = p.color; }

                drawParticle(p);
                ctx.shadowBlur = 0;
            }
            ctx.globalAlpha = 1;
        }

        function drawParticle(p) {
            ctx.fillStyle = p.color;
            ctx.strokeStyle = p.color;

            switch (p.style) {
                case 'dots':
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'sparkle':
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.beginPath();
                    // 4-point sparkle (cross + 45° cross)
                    var s = p.size / 2;
                    for (var j = 0; j < 8; j++) {
                        var a = j * Math.PI / 4;
                        var r = j % 2 === 0 ? s : s * 0.3;
                        if (j === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                    break;

                case 'stars':
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    starPath(ctx, 0, 0, p.size / 2, 5);
                    ctx.fill();
                    ctx.restore();
                    break;

                case 'comet':
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(Math.atan2(p.vy, p.vx));
                    var tailLen = p.size * 4;
                    var grad = ctx.createLinearGradient(-tailLen, 0, p.size / 2, 0);
                    grad.addColorStop(0, 'rgba(255,255,255,0)');
                    grad.addColorStop(1, p.color);
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, tailLen / 2, p.size / 4, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.size / 2, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    break;

                case 'fire':
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    var rg = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
                    rg.addColorStop(0, '#fff9c4');
                    rg.addColorStop(0.4, '#ff6f00');
                    rg.addColorStop(1, 'rgba(255,0,0,0)');
                    ctx.fillStyle = rg;
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    break;

                case 'snow':
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size / 3, 0, Math.PI * 2);
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    // crosshairs
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    var ss = p.size / 3;
                    for (var k = 0; k < 3; k++) {
                        ctx.save();
                        ctx.rotate(k * Math.PI / 3);
                        ctx.beginPath();
                        ctx.moveTo(0, -ss); ctx.lineTo(0, ss);
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                        ctx.restore();
                    }
                    ctx.restore();
                    break;

                case 'ribbon':
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.fillRect(-p.size / 2, -p.size / 6, p.size, p.size / 3);
                    ctx.restore();
                    break;

                default:
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
        }

        draw();
    }

    function buildSectionOnly(appEl, opts) {
        var section = document.createElement('div');
        section.style.height = (opts.sectionHeight || 200) + 'px';
        section.style.backgroundColor = opts.sectionBg || '#1e1b4b';
        section.style.borderRadius = (opts.sectionRadius || 16) + 'px';
        section.style.display = 'flex';
        section.style.alignItems = 'center';
        section.style.justifyContent = 'center';
        if (opts.previewText) {
            var lbl = document.createElement('div');
            lbl.style.color = '#fff';
            lbl.style.opacity = '0.6';
            lbl.style.fontSize = '14px';
            lbl.textContent = opts.previewText;
            section.appendChild(lbl);
        }
        appEl.parentNode.replaceChild(section, appEl);
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-mt-app').forEach(initMouseTrail);
    });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        document.querySelectorAll('.bkbg-mt-app').forEach(initMouseTrail);
    }
})();
