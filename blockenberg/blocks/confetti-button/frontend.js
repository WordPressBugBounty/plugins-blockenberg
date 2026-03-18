document.addEventListener('DOMContentLoaded', function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', style:'font-style',
            decoration:'text-decoration', transform:'text-transform',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
        };
        Object.keys(map).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) v = v + (typo.sizeUnit || 'px');
                else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) v = v + (typo.lineHeightUnit || '');
                else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) v = v + (typo.letterSpacingUnit || 'px');
                else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) v = v + (typo.wordSpacingUnit || 'px');
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    document.querySelectorAll('.bkbg-cb-app').forEach(function (root) {
        var opts = JSON.parse(root.dataset.opts || '{}');
        initConfettiButton(root, opts);
    });
});

function initConfettiButton(root, a) {
    var text   = a.text    || '🎉 Celebrate!';
    var colors = a.colors  || ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9f1c'];

    /* wrap */
    var wrap = document.createElement('div');
    wrap.className = 'bkbg-cb-wrap';
    wrap.style.cssText = 'text-align:' + (a.align || 'center') + ';padding:24px;';

    /* button */
    var isLink = a.url && a.url.length > 0;
    var btn    = document.createElement(isLink ? 'a' : 'button');
    btn.className = 'bkbg-cb-btn';

    if (isLink) {
        btn.href = a.url;
        if (a.openInNewTab) { btn.target = '_blank'; btn.rel = 'noopener noreferrer'; }
    }

    var label = (a.iconBefore ? a.iconBefore + ' ' : '') + text + (a.iconAfter ? ' ' + a.iconAfter : '');
    /* Icon before */
    var IP = window.bkbgIconPicker;
    var beforeType = a.iconBeforeType || 'custom-char';
    var afterType  = a.iconAfterType  || 'custom-char';
    var hasBefore  = beforeType !== 'custom-char' ? true : !!a.iconBefore;
    var hasAfter   = afterType  !== 'custom-char' ? true : !!a.iconAfter;

    if (hasBefore) {
        var bSpan = document.createElement('span');
        bSpan.className = 'bkbg-cb-icon-before';
        if (beforeType !== 'custom-char' && IP) {
            bSpan.appendChild(IP.buildFrontendIcon(beforeType, a.iconBefore, a.iconBeforeDashicon, a.iconBeforeImageUrl, a.iconBeforeDashiconColor));
        } else {
            bSpan.textContent = a.iconBefore;
        }
        btn.appendChild(bSpan);
    }
    var lblSpan = document.createElement('span');
    lblSpan.textContent = text;
    btn.appendChild(lblSpan);
    if (hasAfter) {
        var aSpan = document.createElement('span');
        aSpan.className = 'bkbg-cb-icon-after';
        if (afterType !== 'custom-char' && IP) {
            aSpan.appendChild(IP.buildFrontendIcon(afterType, a.iconAfter, a.iconAfterDashicon, a.iconAfterImageUrl, a.iconAfterDashiconColor));
        } else {
            aSpan.textContent = a.iconAfter;
        }
        btn.appendChild(aSpan);
    }

    var shadow = a.showShadow ? '0 8px 24px ' + (a.buttonBg || '#6366f1') + '55, 0 4px 8px rgba(0,0,0,0.15)' : 'none';

    btn.style.cssText = [
        'display:' + (a.fullWidth ? 'block' : 'inline-block'),
        a.fullWidth ? 'width:100%' : (a.maxWidth ? 'max-width:' + a.maxWidth + 'px' : ''),
        'background:' + (a.buttonBg || '#6366f1'),
        'color:' + (a.buttonColor || '#ffffff'),
        'border-radius:' + (a.buttonRadius || 12) + 'px',
        'padding:' + (a.buttonPaddingV || 16) + 'px ' + (a.buttonPaddingH || 40) + 'px',
        'box-shadow:' + shadow,
        'font-family:inherit',
        'cursor:pointer',
        'border:none',
        'outline:none',
        'text-decoration:none',
        'position:relative',
        'overflow:hidden',
    ].filter(Boolean).join(';');

    typoCssVarsForEl(a.typoButton, '--bkcb-btn-', root);

    /* hover effect */
    btn.addEventListener('mouseenter', function () {
        btn.style.background = a.buttonHoverBg || '#4f46e5';
        btn.style.transform  = 'translateY(-2px)';
    });
    btn.addEventListener('mouseleave', function () {
        btn.style.background = a.buttonBg || '#6366f1';
        btn.style.transform  = 'translateY(0)';
    });

    /* ripple */
    btn.addEventListener('click', function (e) {
        var ripple = document.createElement('span');
        ripple.className = 'bkbg-cb-ripple';
        var size = Math.max(btn.offsetWidth, btn.offsetHeight);
        ripple.style.width = ripple.style.height = size + 'px';
        var rect = btn.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top  = (e.clientY - rect.top  - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 600);
    });

    wrap.appendChild(btn);

    /* sub text */
    if (a.showSubText && a.subText) {
        var sub = document.createElement('p');
        sub.className = 'bkbg-cb-sub';
        sub.textContent = a.subText;
        wrap.appendChild(sub);
    }

    root.appendChild(wrap);

    /* confetti engine */
    var firing = false;

    btn.addEventListener('click', function (e) {
        if (firing && !a.repeat) return;
        e.preventDefault(); /* prevent nav during confetti if URL set */

        btn.classList.add('bkbg-cb-firing');
        setTimeout(function () { btn.classList.remove('bkbg-cb-firing'); }, 200);

        var btnRect = btn.getBoundingClientRect();
        var originX = (btnRect.left + btnRect.width  / 2) / window.innerWidth;
        var originY = (btnRect.top  + btnRect.height / 2) / window.innerHeight;

        fireConfetti(a, colors, originX, originY);
        firing = true;

        setTimeout(function () {
            firing = false;
            if (isLink && a.url) {
                if (a.openInNewTab) window.open(a.url, '_blank');
                else window.location.href = a.url;
            }
        }, 300);
    });
}

function fireConfetti(a, colors, originX, originY) {
    var canvas = document.createElement('canvas');
    canvas.className = 'bkbg-cb-canvas';
    document.body.appendChild(canvas);
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx     = canvas.getContext('2d');
    var style   = a.confettiStyle || 'burst';
    var count   = a.particleCount || 120;
    var spread  = (a.spread  || 70) * Math.PI / 180;
    var grav    = a.gravity  || 1;
    var pSize   = a.particleSize || 8;
    var shapes  = a.shapes   || 'mixed';
    var duration = a.duration || 3000;

    var particles = [];

    function randomBetween(lo, hi) { return lo + Math.random() * (hi - lo); }

    function makeParticle(ox, oy, angleBase) {
        var angle  = angleBase + randomBetween(-spread / 2, spread / 2);
        var speed  = randomBetween(4, 14);
        var shap;
        if (shapes === 'rect')   shap = 'rect';
        else if (shapes === 'circle') shap = 'circle';
        else if (shapes === 'star') shap = 'star';
        else shap = Math.random() > 0.5 ? 'rect' : 'circle';

        return {
            x:     ox * canvas.width,
            y:     oy * canvas.height,
            vx:    Math.cos(angle) * speed,
            vy:    Math.sin(angle) * speed,
            w:     randomBetween(pSize * 0.5, pSize * 1.5),
            h:     randomBetween(pSize * 0.5, pSize * 1.5),
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shap,
            rotation: randomBetween(0, Math.PI * 2),
            rotSpeed: randomBetween(-0.15, 0.15),
            opacity:  1,
            life:     randomBetween(0.6, 1),
        };
    }

    /* emit per style */
    if (style === 'burst' || style === 'cannon') {
        var base = style === 'cannon' ? -Math.PI / 2 : 0;
        var spreadFull = style === 'cannon' ? spread : Math.PI * 2;
        for (var i = 0; i < count; i++) {
            var ang = base + (i / count) * spreadFull;
            particles.push(makeParticle(originX, originY, ang));
        }
    } else if (style === 'rain') {
        for (var i = 0; i < count; i++) {
            particles.push(makeParticle(Math.random(), -0.05, Math.PI / 2));
        }
    } else if (style === 'sides') {
        for (var i = 0; i < count; i++) {
            var side = i % 2 === 0 ? 0 : 1;
            particles.push(makeParticle(side, randomBetween(0.3, 0.7), side === 0 ? 0 : Math.PI));
        }
    } else if (style === 'spiral') {
        for (var i = 0; i < count; i++) {
            var ang2 = (i / count) * Math.PI * 4;
            particles.push(makeParticle(originX, originY, ang2));
        }
    } else {
        for (var i = 0; i < count; i++) {
            particles.push(makeParticle(originX, originY, (i / count) * Math.PI * 2));
        }
    }

    var startTime = performance.now();
    var raf;

    function drawStar(ctx, x, y, r) {
        ctx.save();
        ctx.beginPath();
        for (var i = 0; i < 5; i++) {
            var a = (i * 4 * Math.PI / 5) - Math.PI / 2;
            if (i === 0) ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
            else         ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function tick(ts) {
        var elapsed = ts - startTime;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(function (p) {
            if (p.opacity <= 0) return;
            p.x  += p.vx;
            p.y  += p.vy;
            p.vy += grav * 0.3;
            p.vx *= 0.99;
            p.rotation += p.rotSpeed;
            p.opacity = Math.max(0, p.life - elapsed / duration);

            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle   = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.shape === 'star') {
                drawStar(ctx, 0, 0, p.w / 2);
            } else {
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            }
            ctx.restore();
        });

        if (elapsed < duration + 800) {
            raf = requestAnimationFrame(tick);
        } else {
            canvas.remove();
        }
    }

    raf = requestAnimationFrame(tick);
}
