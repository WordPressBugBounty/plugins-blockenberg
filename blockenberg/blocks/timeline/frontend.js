/**
 * Timeline Block Frontend
 * Handles scroll animations
 */
(function() {
    'use strict';

    function initTimeline() {
        var timelines = document.querySelectorAll('.bkbg-tl-wrap[data-animate="1"]');
        
        if (!timelines.length) return;

        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback: show all items immediately
            timelines.forEach(function(timeline) {
                var items = timeline.querySelectorAll('.bkbg-tl-item');
                items.forEach(function(item) {
                    item.classList.add('is-visible');
                });
            });
            return;
        }

        timelines.forEach(function(timeline) {
            var items = timeline.querySelectorAll('.bkbg-tl-item');
            
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        // Add staggered delay based on item index
                        var item = entry.target;
                        var index = Array.from(items).indexOf(item);
                        
                        setTimeout(function() {
                            item.classList.add('is-visible');
                        }, index * 150);
                        
                        // Stop observing once visible
                        observer.unobserve(item);
                    }
                });
            }, {
                threshold: 0.2,
                rootMargin: '0px 0px -50px 0px'
            });

            items.forEach(function(item) {
                observer.observe(item);
            });
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTimeline);
    } else {
        initTimeline();
    }
})();
