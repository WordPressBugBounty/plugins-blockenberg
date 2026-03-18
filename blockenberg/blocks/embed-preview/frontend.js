(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = { family:'font-family', weight:'font-weight', transform:'text-transform', style:'font-style', decoration:'text-decoration',
                  sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
                  lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
                  letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
                  wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
        Object.keys(m).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k], u = typo[k + 'Unit'] || '';
                if (/Desktop|Tablet|Mobile/.test(k) && typeof v === 'number') v = v + (u || 'px');
                el.style.setProperty(prefix + m[k], '' + v);
            }
        });
    }

    var PROVIDER_ICONS = {
        figma:    '🎨',
        loom:     '🎥',
        youtube:  '▶',
        typeform: '📋',
        calendly: '📅',
        miro:     '🗂',
        notion:   '📄',
        airtable: '🗃',
        custom:   '🔗',
    };

    var ASPECT_RATIOS = {
        '16-9': 56.25,
        '4-3':  75,
        '1-1':  100,
        '3-2':  66.67,
        '21-9': 42.86,
    };

    function hexToRgba(hex, opacity) {
        var r = parseInt((hex || '#000000').substr(1, 2), 16);
        var g = parseInt((hex || '#000000').substr(3, 2), 16);
        var b = parseInt((hex || '#000000').substr(5, 2), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + (opacity / 100) + ')';
    }

    function init() {
        document.querySelectorAll('.bkbg-ep-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                embedUrl: '',
                embedProvider: 'custom',
                embedTitle: 'Open',
                showTitle: true,
                description: '',
                showDescription: false,
                thumbnailUrl: '',
                ctaLabel: 'Click to open',
                ctaStyle: 'filled',
                aspectRatio: '16-9',
                customHeight: 480,
                maxWidth: 900,
                borderRadius: 12,
                showBrand: true,
                showLoadingBar: true,
                privacyNote: 'No data is loaded until you click.',
                showPrivacyNote: true,
                iframeSandbox: 'allow-scripts allow-same-origin allow-forms allow-popups allow-presentation',
                overlayBg: '#0f172a',
                overlayOpacity: 55,
                ctaBg: '#6366f1',
                ctaColor: '#ffffff',
                titleColor: '#f8fafc',
                descColor: '#cbd5e1',
                privacyColor: '#94a3b8',
                borderColor: '#e5e7eb',
            }, opts);

            if (!o.embedUrl) return; // nothing to show without a URL

            // ── Outer wrapper ──
            var wrap = document.createElement('div');
            wrap.className = 'bkbg-ep-wrap';
            wrap.style.maxWidth = o.maxWidth + 'px';
            wrap.style.margin = '0 auto';
            wrap.style.borderRadius = o.borderRadius + 'px';
            wrap.style.overflow = 'hidden';
            wrap.style.border = '1px solid ' + o.borderColor;

            typoCssVarsForEl(o.typoTitle, '--bkbg-ep-ttl-', wrap);
            typoCssVarsForEl(o.typoDesc, '--bkbg-ep-dsc-', wrap);
            typoCssVarsForEl(o.typoCta, '--bkbg-ep-cta-', wrap);

            // ── Container (aspect ratio box) ──
            var container = document.createElement('div');
            container.className = 'bkbg-ep-container';

            if (o.aspectRatio !== 'custom') {
                container.classList.add('ratio-' + o.aspectRatio);
            } else {
                container.style.height = o.customHeight + 'px';
            }

            // ── Thumbnail ──
            if (o.thumbnailUrl) {
                var thumb = document.createElement('img');
                thumb.className = 'bkbg-ep-thumbnail';
                thumb.src = o.thumbnailUrl;
                thumb.alt = '';
                container.appendChild(thumb);
            }

            // ── Overlay ──
            var overlay = document.createElement('div');
            overlay.className = 'bkbg-ep-overlay';
            overlay.style.background = hexToRgba(o.overlayBg, o.overlayOpacity);

            // Provider badge
            if (o.showBrand) {
                var badge = document.createElement('div');
                badge.className = 'bkbg-ep-badge';
                var icon = PROVIDER_ICONS[o.embedProvider] || PROVIDER_ICONS.custom;
                var providerName = o.embedProvider.charAt(0).toUpperCase() + o.embedProvider.slice(1);
                badge.textContent = icon + ' ' + providerName;
                overlay.appendChild(badge);
            }

            // Title
            if (o.showTitle && o.embedTitle) {
                var titleEl = document.createElement('p');
                titleEl.className = 'bkbg-ep-title';
                titleEl.textContent = o.embedTitle;
                titleEl.style.color = o.titleColor;
                overlay.appendChild(titleEl);
            }

            // Description
            if (o.showDescription && o.description) {
                var descEl = document.createElement('p');
                descEl.className = 'bkbg-ep-description';
                descEl.textContent = o.description;
                descEl.style.color = o.descColor;
                overlay.appendChild(descEl);
            }

            // CTA button
            var cta = document.createElement('button');
            cta.className = 'bkbg-ep-cta style-' + o.ctaStyle;
            cta.textContent = o.ctaLabel;
            cta.setAttribute('type', 'button');
            cta.setAttribute('aria-label', o.embedTitle || 'Open embed');

            if (o.ctaStyle === 'filled') {
                cta.style.background = o.ctaBg;
                cta.style.color = o.ctaColor;
                cta.style.borderColor = o.ctaBg;
            } else if (o.ctaStyle === 'outline') {
                cta.style.background = 'transparent';
                cta.style.color = o.ctaBg;
                cta.style.borderColor = o.ctaBg;
            } else {
                cta.style.background = 'transparent';
                cta.style.color = o.ctaColor;
                cta.style.borderColor = 'transparent';
            }
            overlay.appendChild(cta);

            // Privacy note
            if (o.showPrivacyNote && o.privacyNote) {
                var privacy = document.createElement('p');
                privacy.className = 'bkbg-ep-privacy';
                privacy.textContent = '🔒 ' + o.privacyNote;
                privacy.style.color = o.privacyColor;
                overlay.appendChild(privacy);
            }

            container.appendChild(overlay);

            // ── Click → load iframe ──
            function loadEmbed() {
                // Remove overlay
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                if (thumb && thumb.parentNode) thumb.parentNode.removeChild(thumb);

                // Loading bar
                if (o.showLoadingBar) {
                    var bar = document.createElement('div');
                    bar.className = 'bkbg-ep-loading';
                    bar.style.background = o.ctaBg || '#6366f1';
                    container.appendChild(bar);
                    setTimeout(function () {
                        if (bar.parentNode) bar.parentNode.removeChild(bar);
                    }, 2200);
                }

                // iframe
                var iframe = document.createElement('iframe');
                iframe.className = 'bkbg-ep-iframe';
                iframe.src = o.embedUrl;
                iframe.setAttribute('allowfullscreen', '');
                iframe.setAttribute('allow', 'fullscreen; autoplay; camera; microphone');
                if (o.iframeSandbox) {
                    iframe.setAttribute('sandbox', o.iframeSandbox);
                }
                iframe.setAttribute('loading', 'eager');
                container.appendChild(iframe);
            }

            overlay.addEventListener('click', loadEmbed);

            wrap.appendChild(container);
            appEl.parentNode.insertBefore(wrap, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
