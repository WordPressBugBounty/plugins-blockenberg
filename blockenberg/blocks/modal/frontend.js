(function () {
    function toArray(nl) {
        return Array.prototype.slice.call(nl || []);
    }

    // Track last focused element before modal opens (for focus restoration)
    var lastFocused = null;

    // All focusable selectors
    var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

    function trapFocus(modal) {
        var focusable = toArray(modal.querySelectorAll(FOCUSABLE)).filter(function (el) {
            return el.offsetParent !== null;
        });
        if (!focusable.length) return;

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        modal.addEventListener('keydown', function onKeyDown(e) {
            if (e.key !== 'Tab') return;
            if (focusable.length === 1) {
                e.preventDefault();
                return;
            }
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        // Focus first focusable
        first.focus();
    }

    function openModal(modal) {
        lastFocused = document.activeElement;
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        trapFocus(modal);
    }

    function closeModal(modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
        if (lastFocused) {
            lastFocused.focus();
            lastFocused = null;
        }
    }

    function initModalBlock(block) {
        var modalId = block.getAttribute('data-modal-id');
        if (!modalId) return;

        var modal = block.querySelector('.bkbg-modal-overlay#' + modalId);
        var triggers = toArray(block.querySelectorAll('[data-bkbg-modal-open="' + modalId + '"]'));
        var closeBtns = toArray(block.querySelectorAll('[data-bkbg-modal-close="' + modalId + '"]'));

        if (!modal) return;

        var closeOnOverlay = modal.getAttribute('data-close-overlay') !== '0';
        var closeOnEsc = modal.getAttribute('data-close-esc') !== '0';
        var triggerMode = modal.getAttribute('data-trigger-mode');
        var autoDelay = parseInt(modal.getAttribute('data-auto-delay'), 10) || 3000;

        // Open triggers
        triggers.forEach(function (btn) {
            btn.addEventListener('click', function () {
                openModal(modal);
            });
        });

        // Close buttons
        closeBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                closeModal(modal);
            });
        });

        // Close on overlay click
        if (closeOnOverlay) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        }

        // Close on ESC key
        if (closeOnEsc) {
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                    closeModal(modal);
                }
            });
        }

        // Auto-open
        if (triggerMode === 'auto') {
            // Only auto-open once per session
            var storageKey = 'bkbg_modal_seen_' + modalId;
            if (!sessionStorage.getItem(storageKey)) {
                setTimeout(function () {
                    openModal(modal);
                    sessionStorage.setItem(storageKey, '1');
                }, autoDelay);
            }
        }
    }

    function init() {
        toArray(document.querySelectorAll('.bkbg-modal-block')).forEach(initModalBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
