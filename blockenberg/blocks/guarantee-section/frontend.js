(function () {
    document.querySelectorAll('.bkbg-guarantee-section-app').forEach(function (root) {
        var opts = {};
        try { opts = JSON.parse(root.dataset.opts || '{}'); } catch (e) {}

        var sz = opts.sealSize || 200;
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-guarantee-section-wrap';
        wrap.style.cssText = 'background:' + (opts.bgColor || '#f5f3ff') + ';padding:' + (opts.paddingTop || 80) + 'px 40px ' + (opts.paddingBottom || 80) + 'px;';
        wrap.style.setProperty('--bkbg-gs-max', (opts.maxWidth || 1100) + 'px');

        /* typography CSS vars */
        if (window.typoCssVarsForEl) {
            window.typoCssVarsForEl(opts.typoHeading, '--bkbg-guar-hl-', wrap);
            window.typoCssVarsForEl(opts.typoBody, '--bkbg-guar-bd-', wrap);
        }

        var inner = document.createElement('div');
        inner.className = 'bkbg-gs-inner' + (opts.layout === 'centered' ? ' centered' : '');

        // Seal
        var seal = document.createElement('div');
        seal.className = 'bkbg-gs-seal';
        seal.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;background:' + (opts.sealBg || '#7c3aed') + ';color:' + (opts.sealColor || '#fff') + ';box-shadow:0 0 0 12px ' + (opts.sealBg || '#7c3aed') + '33;';

        var sealIcon = document.createElement('div');
        sealIcon.className = 'bkbg-gs-seal-icon';
        sealIcon.style.fontSize = (sz * 0.2) + 'px';
        var _IP = window.bkbgIconPicker;
        if (_IP && opts.sealIconType && opts.sealIconType !== 'custom-char') {
            var _iconNode = _IP.buildFrontendIcon(opts.sealIconType, opts.sealIcon, opts.sealIconDashicon, opts.sealIconImageUrl, opts.sealIconDashiconColor);
            if (_iconNode) sealIcon.appendChild(_iconNode);
            else sealIcon.textContent = opts.sealIcon || '🛡️';
        } else {
            sealIcon.textContent = opts.sealIcon || '🛡️';
        }

        var sealLabel = document.createElement('div');
        sealLabel.className = 'bkbg-gs-seal-label';
        sealLabel.style.fontSize = (sz * 0.17) + 'px';
        sealLabel.textContent = opts.sealLabel || '30-Day';

        var sealSub = document.createElement('div');
        sealSub.className = 'bkbg-gs-seal-sub';
        sealSub.style.fontSize = (sz * 0.1) + 'px';
        sealSub.textContent = (opts.sealSub || 'Money-Back\nGuarantee');

        seal.appendChild(sealIcon);
        seal.appendChild(sealLabel);
        seal.appendChild(sealSub);
        inner.appendChild(seal);

        // Text column
        var textDiv = document.createElement('div');
        textDiv.className = 'bkbg-gs-text';

        var h2 = document.createElement('h2');
        h2.className = 'bkbg-gs-heading';
        h2.style.color = opts.headingColor || '#111827';
        h2.innerHTML = opts.heading || '';
        textDiv.appendChild(h2);

        var p = document.createElement('p');
        p.className = 'bkbg-gs-body';
        p.style.color = opts.textColor || '#374151';
        p.innerHTML = opts.subtext || '';
        textDiv.appendChild(p);

        if (opts.bullets && opts.bullets.length) {
            var ul = document.createElement('ul');
            ul.className = 'bkbg-gs-bullets';
            opts.bullets.forEach(function (b) {
                var li = document.createElement('li');
                li.className = 'bkbg-gs-bullet';
                var chk = document.createElement('span');
                chk.className = 'bkbg-gs-check';
                chk.style.color = opts.bulletColor || '#16a34a';
                chk.textContent = '✓';
                var txt = document.createElement('span');
                txt.style.color = opts.textColor || '#374151';
                txt.textContent = b;
                li.appendChild(chk);
                li.appendChild(txt);
                ul.appendChild(li);
            });
            textDiv.appendChild(ul);
        }

        if (opts.showCta && opts.ctaLabel) {
            var cta = document.createElement('a');
            cta.className = 'bkbg-gs-cta';
            cta.href = opts.ctaUrl || '#';
            cta.style.background = opts.ctaBg || '#7c3aed';
            cta.style.color = opts.ctaColor || '#fff';
            cta.textContent = opts.ctaLabel + ' →';
            textDiv.appendChild(cta);
        }

        inner.appendChild(textDiv);
        wrap.appendChild(inner);
        root.parentNode.replaceChild(wrap, root);
    });
})();
