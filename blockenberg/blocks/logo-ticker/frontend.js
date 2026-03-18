wp.domReady(function () {
    document.querySelectorAll('.bkbg-lt-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var logos        = opts.logos        || [];
        var speed        = opts.speed        || 30;
        var direction    = opts.direction    || 'left';
        var pauseOnHover = opts.pauseOnHover !== false;
        var gap          = opts.gap          || 48;
        var height       = opts.height       || 48;
        var logoFilter   = opts.logoFilter   || 'grayscale-hover';

        var validLogos = logos.filter(function (l) { return l.imageUrl; });
        if (validLogos.length === 0) {
            app.parentNode.removeChild(app);
            return;
        }

        // Build wrapper
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-lt-wrap bkbg-lt-wrap--filter-' + logoFilter;
        if (opts.bgColor) {
            wrap.style.setProperty('--bkbg-lt-bg', opts.bgColor);
            wrap.style.background = opts.bgColor;
        }
        if (opts.borderTop)    wrap.style.borderTop    = '1px solid ' + (opts.borderColor || '#e5e7eb');
        if (opts.borderBottom) wrap.style.borderBottom = '1px solid ' + (opts.borderColor || '#e5e7eb');
        wrap.style.paddingTop    = (opts.paddingTop    || 40) + 'px';
        wrap.style.paddingBottom = (opts.paddingBottom || 40) + 'px';
        wrap.style.setProperty('--bkbg-lt-speed', speed + 's');

        // Track (duplicated for seamless loop)
        var trackClass = 'bkbg-lt-track bkbg-lt-track--' + direction;
        if (pauseOnHover) trackClass += ' bkbg-lt-track--pause';
        var track = document.createElement('div');
        track.className = trackClass;

        function buildItem(logo) {
            var item = document.createElement('div');
            item.className = 'bkbg-lt-item';
            item.style.marginRight = gap + 'px';

            var img = document.createElement('img');
            img.src    = logo.imageUrl;
            img.alt    = logo.imageAlt || '';
            img.height = height;
            img.style.height = height + 'px';
            img.loading = 'lazy';

            if (logo.linkUrl) {
                var a = document.createElement('a');
                a.href   = logo.linkUrl;
                a.target = '_blank';
                a.rel    = 'noopener noreferrer';
                a.appendChild(img);
                item.appendChild(a);
            } else {
                item.appendChild(img);
            }

            return item;
        }

        // Build items × 2 for seamless loop
        validLogos.forEach(function (logo) { track.appendChild(buildItem(logo)); });
        validLogos.forEach(function (logo) { track.appendChild(buildItem(logo)); });

        wrap.appendChild(track);
        app.parentNode.replaceChild(wrap, app);
    });
});
