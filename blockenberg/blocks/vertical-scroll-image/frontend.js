wp.domReady(function () {
    var shadowMap = {
        none: 'none',
        sm:   '0 2px 8px rgba(0,0,0,0.10)',
        md:   '0 8px 32px rgba(0,0,0,0.15)',
        lg:   '0 20px 60px rgba(0,0,0,0.22)'
    };

    document.querySelectorAll('.bkbg-vertical-scroll-image-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        if (!opts.imageUrl) {
            app.parentNode.removeChild(app);
            return;
        }

        var dir        = opts.scrollDirection || 'vertical';
        var trigger    = opts.scrollTrigger   || 'hover';
        var dur        = opts.scrollDuration  || 4;
        var cHeight    = opts.containerHeight || 420;
        var maxW       = opts.maxWidth        || 800;
        var radius     = (opts.borderRadius   !== undefined ? opts.borderRadius : 12) + 'px';
        var shadow     = shadowMap[opts.shadowSize] || shadowMap.md;
        var bgColor    = opts.bgColor         || '#f9fafb';
        var borderCol  = opts.borderColor     || '#e5e7eb';

        /* Outer section */
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-vsi-wrap';
        wrap.style.background    = bgColor;
        wrap.style.paddingTop    = (opts.paddingTop    || 48) + 'px';
        wrap.style.paddingBottom = (opts.paddingBottom || 48) + 'px';

        var inner = document.createElement('div');
        inner.className = 'bkbg-vsi-inner';
        inner.style.maxWidth = maxW + 'px';

        /* Container (clipping) */
        var container = document.createElement('div');
        container.className = 'bkbg-vsi-container' + (dir === 'horizontal' ? ' bkbg-vsi--horizontal' : '');
        container.style.height       = cHeight + 'px';
        container.style.borderRadius = radius;
        container.style.border       = '1px solid ' + borderCol;
        container.style.boxShadow    = shadow;
        container.style.background   = bgColor;

        /* Image */
        var img = document.createElement('img');
        img.className = 'bkbg-vsi-img';
        img.src = opts.imageUrl;
        img.alt = opts.imageAlt || '';
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');

        /* Label */
        if (opts.showLabel && opts.label) {
            var lbl = document.createElement('div');
            lbl.className = 'bkbg-vsi-label';
            lbl.style.background = opts.labelBg    || 'rgba(0,0,0,0.55)';
            lbl.style.color      = opts.labelColor || '#ffffff';
            lbl.textContent = (dir === 'vertical' ? '↕ ' : '↔ ') + opts.label;
            container.appendChild(lbl);
        }

        container.prepend(img); // img before label in DOM order
        inner.appendChild(container);

        /* Caption */
        if (opts.showCaption && opts.caption) {
            var cap = document.createElement('p');
            cap.className = 'bkbg-vsi-caption';
            cap.style.color = opts.captionColor || '#6b7280';
            cap.innerHTML = opts.caption;
            inner.appendChild(cap);
        }

        wrap.appendChild(inner);
        app.parentNode.replaceChild(wrap, app);

        /* Scroll logic after image loads */
        img.addEventListener('load', function () {
            var imgNatural  = dir === 'vertical' ? img.naturalHeight : img.naturalWidth;
            var imgRendered = dir === 'vertical' ? img.offsetHeight  : img.offsetWidth;
            var containerDim = cHeight; // For horizontal, need container width
            if (dir === 'horizontal') {
                containerDim = container.offsetWidth;
            }
            var maxTranslate = -(imgRendered - containerDim);
            if (maxTranslate >= 0) return; // Image smaller than container — nothing to scroll

            if (trigger === 'auto') {
                var axis = dir === 'vertical' ? 'v' : 'h';
                img.style.setProperty('--bkbg-vsi-end', maxTranslate + 'px');
                img.style.setProperty('--bkbg-vsi-dur', (dur * 2) + 's');
                img.classList.add('bkbg-vsi--auto-' + axis);
            } else {
                /* Hover mode */
                img.style.transition = 'transform ' + dur + 's ease';
                container.addEventListener('mouseenter', function () {
                    if (dir === 'vertical') {
                        img.style.transform = 'translateY(' + maxTranslate + 'px)';
                    } else {
                        img.style.transform = 'translateX(' + maxTranslate + 'px)';
                    }
                });
                container.addEventListener('mouseleave', function () {
                    img.style.transform = dir === 'vertical' ? 'translateY(0)' : 'translateX(0)';
                });
            }
        });

        /* Handle cached images (already loaded) */
        if (img.complete && img.naturalHeight > 0) {
            img.dispatchEvent(new Event('load'));
        }
    });
});
