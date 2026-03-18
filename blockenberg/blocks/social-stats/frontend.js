(function () {
    /* ── Platform data (mirrors index.js) ─────────────────────────── */
    var PLATFORM_COLORS = {
        instagram: '#E1306C',
        youtube:   '#FF0000',
        tiktok:    '#000000',
        linkedin:  '#0A66C2',
        twitter:   '#1DA1F2',
        facebook:  '#1877F2',
        pinterest: '#E60023',
    };

    var PLATFORM_LABELS = {
        instagram: 'Instagram',
        youtube:   'YouTube',
        tiktok:    'TikTok',
        linkedin:  'LinkedIn',
        twitter:   'Twitter / X',
        facebook:  'Facebook',
        pinterest: 'Pinterest',
    };

    var PLATFORM_ICONS = {
        instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
        youtube:   'M23.494 6.205a3.01 3.01 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.372.524A3.01 3.01 0 00.506 6.205 31.497 31.497 0 000 12a31.495 31.495 0 00.506 5.795 3.01 3.01 0 002.122 2.135C4.495 20.455 12 20.455 12 20.455s7.505 0 9.372-.525a3.01 3.01 0 002.122-2.135A31.495 31.495 0 0024 12a31.497 31.497 0 00-.506-5.795zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
        tiktok:    'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.5a8.15 8.15 0 004.77 1.53V6.54a4.85 4.85 0 01-1-.15z',
        linkedin:  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
        twitter:   'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
        facebook:  'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
        pinterest: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z',
    };

    /* ── Build an SVG icon element ──────────────────────────────────── */
    function makeSvg(platform, size, color) {
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', color || '#fff');
        svg.style.display = 'block';
        svg.style.flexShrink = '0';
        var path = document.createElementNS(ns, 'path');
        path.setAttribute('d', PLATFORM_ICONS[platform] || PLATFORM_ICONS.instagram);
        svg.appendChild(path);
        return svg;
    }

    /* ── Build a card DOM node from platform data ───────────────────── */
    function buildCard(p, opts) {
        var platformColor = p.customColor || (opts.usePlatformColors ? PLATFORM_COLORS[p.platform] : opts.accentColor) || '#6c3fb5';
        var iconBg = opts.iconBg || (opts.usePlatformColors ? platformColor : opts.accentColor) || '#6c3fb5';
        var isColored = opts.cardStyle === 'cards';

        var card = document.createElement(p.url ? 'a' : 'div');
        card.className = 'bkbg-ss-card' + (isColored ? ' bkbg-ss-colored' : '');
        card.style.setProperty('--bkbg-ss-platform-color', platformColor);
        card.style.setProperty('--bkbg-ss-stripe', platformColor);
        card.style.borderRadius = (opts.cardRadius || 16) + 'px';

        if (isColored) {
            card.style.background = opts.usePlatformColors ? platformColor : (opts.accentColor || '#6c3fb5');
        }

        if (p.url) {
            card.href = p.url;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
        }

        /* Icon wrap */
        var iconWrap = document.createElement('div');
        iconWrap.className = 'bkbg-ss-icon-wrap';
        iconWrap.style.width  = (parseInt(opts.iconSize||24) + 28) + 'px';
        iconWrap.style.height = (parseInt(opts.iconSize||24) + 28) + 'px';
        iconWrap.style.background = isColored ? 'rgba(255,255,255,0.22)' : iconBg;
        iconWrap.appendChild(makeSvg(p.platform, opts.iconSize || 24, '#fff'));
        card.appendChild(iconWrap);

        /* Platform name */
        var name = document.createElement('div');
        name.className = 'bkbg-ss-platform-name';
        name.textContent = PLATFORM_LABELS[p.platform] || p.platform;
        card.appendChild(name);

        /* Handle */
        if (opts.showHandle && p.handle) {
            var handle = document.createElement('div');
            handle.className = 'bkbg-ss-handle';
            handle.textContent = p.handle;
            card.appendChild(handle);
        }

        /* Metric 1 */
        var g1 = document.createElement('div');
        g1.className = 'bkbg-ss-metric-group';
        var v1 = document.createElement('div');
        v1.className = 'bkbg-ss-metric-value';
        v1.textContent = p.metric1Value || '0';
        var l1 = document.createElement('div');
        l1.className = 'bkbg-ss-metric-label';
        l1.textContent = p.metric1Label || '';
        g1.appendChild(v1);
        g1.appendChild(l1);
        card.appendChild(g1);

        /* Metric 2 */
        if (opts.showSecondMetric && p.metric2Value) {
            var g2 = document.createElement('div');
            g2.className = 'bkbg-ss-metric-group';
            var v2 = document.createElement('div');
            v2.className = 'bkbg-ss-metric-value-2';
            v2.textContent = p.metric2Value;
            var l2 = document.createElement('div');
            l2.className = 'bkbg-ss-metric-label';
            l2.textContent = p.metric2Label || '';
            g2.appendChild(v2);
            g2.appendChild(l2);
            card.appendChild(g2);
        }

        return card;
    }

    /* ── Init ───────────────────────────────────────────────────────── */
    function initGrid(grid) {
        var platforms, opts;
        try { platforms = JSON.parse(grid.getAttribute('data-platforms') || '[]'); } catch(e){ return; }
        try { opts      = JSON.parse(grid.getAttribute('data-opts')      || '{}'); } catch(e){ opts={}; }

        /* Build cards */
        platforms.forEach(function(p) {
            grid.appendChild(buildCard(p, opts));
        });

        /* Animated entrance */
        if (opts.animated !== false) {
            var cards = grid.querySelectorAll('.bkbg-ss-card');
            var io = new IntersectionObserver(function(entries, obs) {
                entries.forEach(function(entry, idx) {
                    if (!entry.isIntersecting) return;
                    obs.unobserve(entry.target);
                    var el = entry.target;
                    setTimeout(function() { el.classList.add('is-visible'); }, idx * 80);
                });
            }, { threshold: 0.15 });
            cards.forEach(function(c){ io.observe(c); });
        } else {
            grid.querySelectorAll('.bkbg-ss-card').forEach(function(c){ c.classList.add('is-visible'); });
        }
    }

    function init() {
        document.querySelectorAll('.bkbg-ss-grid[data-platforms]').forEach(initGrid);
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
