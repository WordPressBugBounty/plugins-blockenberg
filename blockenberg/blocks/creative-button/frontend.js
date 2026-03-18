function typoCssVarsForEl(typo, prefix, el) {
    if (!typo || typeof typo !== 'object') return;
    var map = {
        family: 'font-family', weight: 'font-weight', style: 'font-style',
        transform: 'text-transform', decoration: 'text-decoration',
        sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
        sizeUnit: null,
        lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
        lineHeightUnit: null,
        letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m',
        letterSpacingUnit: null,
        wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m',
        wordSpacingUnit: null
    };
    var sizeU = typo.sizeUnit || 'px';
    var lhU   = typo.lineHeightUnit || '';
    var lsU   = typo.letterSpacingUnit || 'px';
    var wsU   = typo.wordSpacingUnit || 'px';
    Object.keys(map).forEach(function (k) {
        var css = map[k]; if (!css) return;
        var v = typo[k]; if (v === undefined || v === '' || v === null) return;
        if (/size|spacing/i.test(k)) {
            var u = /letterSpacing/.test(k) ? lsU : /wordSpacing/.test(k) ? wsU : /lineHeight/.test(k) ? lhU : sizeU;
            v = v + u;
        }
        el.style.setProperty(prefix + css, v);
    });
}

wp.domReady(function () {
    document.querySelectorAll('.bkbg-creative-button-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var label       = opts.label       || 'Get Started';
        var url         = opts.url         || '#';
        var openNewTab  = opts.openNewTab  === true;
        var effect      = opts.hoverEffect || 'slide';
        var btnStyle    = opts.buttonStyle || 'filled';
        var corners     = opts.corners     || 'rounded';
        var bgColor     = opts.bgColor     || '#7c3aed';
        var textColor   = opts.textColor   || '#ffffff';
        var hoverBg     = opts.hoverBg     || '#4f46e5';
        var hoverColor  = opts.hoverColor  || '#ffffff';
        var borderCol   = opts.borderColor || '#7c3aed';
        var borderWidth = opts.borderWidth !== undefined ? opts.borderWidth : 2;
        var gFrom       = opts.gradientFrom || '#7c3aed';
        var gTo         = opts.gradientTo   || '#2563eb';
        var fontSize    = opts.fontSize    || 16;
        var paddingH    = opts.paddingH    || 32;
        var paddingV    = opts.paddingV    || 14;
        var iconSize    = opts.iconSize    || 16;
        var showIcon    = opts.showIcon !== false;
        var icon        = opts.icon        || '→';
        var iconType    = opts.iconType    || 'custom-char';
        var iconDash    = opts.iconDashicon || '';
        var iconImg     = opts.iconImageUrl || '';
        var iconPos     = opts.iconPosition || 'right';
        var centered    = opts.centered !== false;
        var fullWidth   = opts.fullWidth === true;

        var radius = corners === 'pill' ? '999px' : corners === 'rounded' ? '8px' : '0';

        /* Wrapper */
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-cb2-wrap';
        wrap.style.textAlign = centered ? 'center' : 'left';
        wrap.style.padding = '4px 0';

        /* Button */
        var btn = document.createElement('a');
        btn.className = 'bkbg-cb2-btn bkbg-cb2-btn--' + effect + (fullWidth ? ' bkbg-cb2-full-width' : '');
        btn.href = url;
        if (openNewTab) { btn.target = '_blank'; btn.rel = 'noopener noreferrer'; }

        /* Apply CSS custom props for hover effects */
        btn.style.setProperty('--bkbg-cb2-hover-bg', hoverBg);
        btn.style.setProperty('--bkbg-cb2-hover-color', hoverColor);
        btn.style.setProperty('--bkbg-cb2-ph', paddingH + 'px');
        btn.style.padding     = paddingV + 'px ' + paddingH + 'px';
        btn.style.borderRadius = radius;
        btn.style.border      = borderWidth + 'px solid ' + borderCol;

        /* Background / color based on button style */
        if (btnStyle === 'outline') {
            btn.style.background = 'transparent';
            btn.style.color      = bgColor;
        } else if (btnStyle === 'ghost') {
            btn.style.background = 'transparent';
            btn.style.color      = bgColor;
            btn.style.border     = 'none';
        } else if (btnStyle === 'gradient') {
            btn.style.background = 'linear-gradient(to right, ' + gFrom + ', ' + gTo + ')';
            btn.style.color      = textColor;
            btn.style.border     = 'none';
        } else {
            btn.style.background = bgColor;
            btn.style.color      = textColor;
        }

        /* Icon left */
        if (showIcon && iconPos === 'left') {
            var iLeft = document.createElement('span');
            iLeft.className = 'bkbg-cb2-icon';
            iLeft.style.fontSize = iconSize + 'px';
            if (iconType !== 'custom-char' && window.bkbgIconPicker) {
                iLeft.appendChild(window.bkbgIconPicker.buildFrontendIcon(iconType, icon, iconDash, iconImg, iconDashColor));
            } else {
                iLeft.textContent = icon;
            }
            btn.appendChild(iLeft);
        }

        /* Label */
        var lbl = document.createElement('span');
        lbl.className = 'bkbg-cb2-label';
        lbl.innerHTML = label;
        btn.appendChild(lbl);

        /* Icon right / arrow effect */
        if (showIcon && iconPos === 'right') {
            var iRight = document.createElement('span');
            iRight.className = 'bkbg-cb2-icon' + (effect === 'arrow' ? ' bkbg-cb2-arrow-icon' : '');
            iRight.style.fontSize = iconSize + 'px';
            if (iconType !== 'custom-char' && window.bkbgIconPicker) {
                iRight.appendChild(window.bkbgIconPicker.buildFrontendIcon(iconType, icon, iconDash, iconImg, iconDashColor));
            } else {
                iRight.textContent = icon;
            }
            btn.appendChild(iRight);
        }

        /* Ripple effect - click handler */
        if (effect === 'ripple') {
            btn.addEventListener('click', function (e) {
                var rect = btn.getBoundingClientRect();
                var size = Math.max(btn.offsetWidth, btn.offsetHeight) * 2;
                var x = e.clientX - rect.left - size / 2;
                var y = e.clientY - rect.top  - size / 2;
                var circle = document.createElement('span');
                circle.className = 'bkbg-cb2-ripple-circle';
                circle.style.width  = size + 'px';
                circle.style.height = size + 'px';
                circle.style.left   = x + 'px';
                circle.style.top    = y + 'px';
                btn.appendChild(circle);
                setTimeout(function () { if (circle.parentNode) circle.parentNode.removeChild(circle); }, 600);
            });
        }

        wrap.appendChild(btn);
        typoCssVarsForEl(opts.typoBtn, '--bkbg-cb2-btn-', wrap);
        app.parentNode.replaceChild(wrap, app);
    });
});
