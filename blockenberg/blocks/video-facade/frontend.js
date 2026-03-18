(function () {
    function buildIframeSrc(provider, videoId) {
        if (provider === 'vimeo') {
            return 'https://player.vimeo.com/video/' + videoId + '?autoplay=1&title=0&byline=0&portrait=0';
        }
        /* Default: YouTube */
        return 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1';
    }

    function initFacade(facade) {
        var provider = facade.getAttribute('data-provider') || 'youtube';
        var videoId  = facade.getAttribute('data-vid') || '';
        var pulsing  = facade.getAttribute('data-pulsing') === '1';

        if (!videoId) return;

        /* Apply pulse class if needed */
        if (pulsing) {
            var playInner = facade.querySelector('.bkbg-vf-play > div');
            if (playInner) playInner.classList.add('bkbg-vf-play-btn-inner', 'is-pulsing');
        }

        facade.addEventListener('click', function onClick() {
            facade.removeEventListener('click', onClick);

            /* Freeze current dimensions */
            var rect = facade.getBoundingClientRect();
            facade.style.height = rect.height + 'px';
            facade.style.paddingBottom = '0';

            /* Remove thumb / overlay / play / text */
            while (facade.firstChild) { facade.removeChild(facade.firstChild); }

            /* Insert iframe wrapper */
            var wrap = document.createElement('div');
            wrap.className = 'bkbg-vf-iframe-wrap';
            var iframe = document.createElement('iframe');
            iframe.src = buildIframeSrc(provider, videoId);
            iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('title', 'Video player');
            iframe.style.border = '0';
            wrap.appendChild(iframe);
            facade.appendChild(wrap);

            facade.style.cursor = 'default';
        });
    }

    function init() {
        var wrappers = document.querySelectorAll('.bkbg-vf-wrapper');
        wrappers.forEach(function(wrapper) {
            var facade = wrapper.querySelector('.bkbg-vf-facade');
            if (facade) initFacade(facade);
        });

        /* Fade-in section on scroll */
        var io = new IntersectionObserver(function(entries, obs) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    obs.unobserve(entry.target);
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        wrappers.forEach(function(w){ io.observe(w); });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
