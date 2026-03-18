(function () {
    'use strict';

    // Chat Bubbles — animate messages into view on scroll
    function initChatBubbles() {
        var containers = document.querySelectorAll('.bkbg-chat-container');
        if (!containers.length) return;

        if (!('IntersectionObserver' in window)) return;

        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var messages = entry.target.querySelectorAll('.bkbg-chat-msg');
                messages.forEach(function (msg, idx) {
                    setTimeout(function () {
                        msg.style.opacity = '1';
                        msg.style.transform = 'translateY(0)';
                    }, idx * 80);
                });
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.15 });

        containers.forEach(function (container) {
            var messages = container.querySelectorAll('.bkbg-chat-msg');
            messages.forEach(function (msg) {
                msg.style.opacity = '0';
                msg.style.transform = 'translateY(16px)';
                msg.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            });
            obs.observe(container);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatBubbles);
    } else {
        initChatBubbles();
    }
}());
