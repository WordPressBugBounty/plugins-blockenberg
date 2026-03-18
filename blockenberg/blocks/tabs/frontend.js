(function () {
    'use strict';

    function initTabs(wrapper) {
        var tabs = Array.prototype.slice.call(wrapper.querySelectorAll('.bkbg-tabs-tab'));
        var panels = Array.prototype.slice.call(wrapper.querySelectorAll('.bkbg-tabs-panel'));

        if (!tabs.length || !panels.length) return;

        function activateTab(index) {
            tabs.forEach(function (tab, i) {
                var isActive = i === index;
                tab.classList.toggle('is-active', isActive);
                tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
                tab.setAttribute('tabIndex', isActive ? '0' : '-1');
            });

            panels.forEach(function (panel, i) {
                var isActive = i === index;
                panel.classList.toggle('is-active', isActive);
                panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
                if (isActive) {
                    // Restart animation
                    panel.style.animation = 'none';
                    // Force reflow
                    void panel.offsetHeight;
                    panel.style.animation = '';
                }
            });
        }

        tabs.forEach(function (tab, index) {
            tab.addEventListener('click', function () {
                activateTab(index);
            });

            // Keyboard navigation
            tab.addEventListener('keydown', function (e) {
                var key = e.key;
                var tabbar = tab.closest('.bkbg-tabs-tabbar');
                var tabList = Array.prototype.slice.call(tabbar ? tabbar.querySelectorAll('.bkbg-tabs-tab') : []);
                var currentIndex = tabList.indexOf(tab);
                var isVertical = wrapper.classList.contains('bkbg-tabs-pos-left');

                var prevKey = isVertical ? 'ArrowUp'   : 'ArrowLeft';
                var nextKey = isVertical ? 'ArrowDown'  : 'ArrowRight';

                if (key === nextKey) {
                    e.preventDefault();
                    var next = (currentIndex + 1) % tabList.length;
                    tabList[next].focus();
                    activateTab(next);
                } else if (key === prevKey) {
                    e.preventDefault();
                    var prev = (currentIndex - 1 + tabList.length) % tabList.length;
                    tabList[prev].focus();
                    activateTab(prev);
                } else if (key === 'Home') {
                    e.preventDefault();
                    tabList[0].focus();
                    activateTab(0);
                } else if (key === 'End') {
                    e.preventDefault();
                    tabList[tabList.length - 1].focus();
                    activateTab(tabList.length - 1);
                }
            });
        });
    }

    // Init on DOMContentLoaded and handle dynamic insertion
    function init() {
        var wrappers = Array.prototype.slice.call(document.querySelectorAll('.bkbg-tabs-wrapper'));
        wrappers.forEach(initTabs);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
