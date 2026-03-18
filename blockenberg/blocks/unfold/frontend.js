(function () {
    'use strict';

    function initBlock(root) {
        var appEl = root.querySelector('.bkbg-ufd-app');
        if (!appEl) return;

        var raw = appEl.getAttribute('data-opts') || '{}';
        var o;
        try { o = JSON.parse(raw); } catch (e) { o = {}; }

        var previewHeight     = Number(o.previewHeight)     || 200;
        var expandText        = o.expandText                || 'Read More ↓';
        var collapseText      = o.collapseText              || 'Show Less ↑';
        var showCollapseBtn   = o.showCollapseBtn           !== false;
        var gradientHeight    = Number(o.gradientHeight)    || 60;
        var animationDuration = Number(o.animationDuration) || 400;
        var buttonAlign       = o.buttonAlign               || 'center';
        var buttonStyle       = o.buttonStyle               || 'filled';
        var borderRadius      = Number(o.borderRadius)      || 8;

        var sectionBg         = o.sectionBg                 || '#ffffff';
        var contentColor      = o.contentColor              || '#374151';
        var gradientTo        = o.gradientTo                || '#ffffff';
        var accentColor       = o.accentColor               || '#6366f1';
        var buttonBg          = o.buttonBg                  || '#6366f1';
        var buttonColor       = o.buttonColor               || '#ffffff';

        // Read inner content HTML from .bkbg-ufd-content-src
        var srcEl = appEl.querySelector('.bkbg-ufd-content-src');
        var contentHTML = srcEl ? srcEl.innerHTML : '';

        appEl.innerHTML = '';

        // ── Section wrapper ─────────────────────────────────────────────
        var section = document.createElement('div');
        section.style.background    = sectionBg;
        section.style.borderRadius  = borderRadius + 'px';
        section.style.overflow      = 'hidden';

        // ── Content wrap (clamped height) ───────────────────────────────
        var contentWrap = document.createElement('div');
        contentWrap.className = 'bkbg-ufd-content-wrap';
        contentWrap.style.transition = 'max-height ' + animationDuration + 'ms ease-in-out';
        contentWrap.style.maxHeight = previewHeight + 'px';

        // ── Content body ─────────────────────────────────────────────────
        var contentBody = document.createElement('div');
        contentBody.className = 'bkbg-ufd-content-body';
        contentBody.style.color      = contentColor;
        contentBody.innerHTML = contentHTML;
        contentWrap.appendChild(contentBody);

        // ── Gradient overlay ─────────────────────────────────────────────
        var gradient = document.createElement('div');
        gradient.className = 'bkbg-ufd-gradient';
        gradient.style.height     = gradientHeight + 'px';
        gradient.style.background = 'linear-gradient(transparent, ' + gradientTo + ')';
        contentWrap.appendChild(gradient);

        section.appendChild(contentWrap);

        // ── Button ────────────────────────────────────────────────────────
        var btnWrap = document.createElement('div');
        btnWrap.className = 'bkbg-ufd-btn-wrap';
        btnWrap.style.textAlign = buttonAlign;
        btnWrap.style.marginTop = '16px';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bkbg-ufd-btn bkbg-ufd-btn-' + buttonStyle;
        btn.style.borderRadius = borderRadius + 'px';

        if (buttonStyle === 'filled') {
            btn.style.background = buttonBg;
            btn.style.color      = buttonColor;
            btn.style.border     = 'none';
        } else if (buttonStyle === 'outline') {
            btn.style.background = 'transparent';
            btn.style.color      = accentColor;
            btn.style.border     = '2px solid ' + accentColor;
        } else { // text
            btn.style.background = 'none';
            btn.style.color      = accentColor;
            btn.style.border     = 'none';
        }

        btn.textContent = expandText;
        btnWrap.appendChild(btn);
        section.appendChild(btnWrap);

        appEl.appendChild(section);

        // ── Check if content is shorter than previewHeight ───────────────
        var fullHeight = contentBody.scrollHeight;

        if (fullHeight <= previewHeight) {
            // No need for expand — remove gradient and button
            gradient.style.display = 'none';
            btnWrap.style.display  = 'none';
            contentWrap.style.maxHeight = 'none';
            return;
        }

        // ── Toggle state ──────────────────────────────────────────────────
        var expanded = false;

        btn.addEventListener('click', function () {
            if (!expanded) {
                // Expand
                contentWrap.style.maxHeight = fullHeight + 'px';
                contentWrap.classList.add('bkbg-ufd-expanded');
                expanded = true;
                if (!showCollapseBtn) {
                    btnWrap.style.display = 'none';
                } else {
                    btn.textContent = collapseText;
                }
            } else {
                // Collapse
                contentWrap.style.maxHeight = previewHeight + 'px';
                contentWrap.classList.remove('bkbg-ufd-expanded');
                expanded = false;
                btn.textContent = expandText;

                // Scroll back to top of block if out of view
                var rect = root.getBoundingClientRect();
                if (rect.top < 0) {
                    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });

        // Accessibility
        btn.setAttribute('aria-expanded', 'false');
        var origToggle = btn.addEventListener;
        contentWrap.addEventListener('transitionend', function () {
            btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });
    }

    function init() {
        document.querySelectorAll('.wp-block-blockenberg-unfold').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
