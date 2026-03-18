/**
 * Blockenberg — Block Manager Dashboard JS
 *
 * Handles: search, category tabs, toggle switches, bulk actions,
 * unsaved-changes indicator, and AJAX save.
 */
(function ($) {
    'use strict';

    /* ── DOM refs ─────────────────────────────── */
    var $grid        = $('#bkbg-grid');
    var $cards       = $grid.find('.bkbg-card');
    var $sections    = $grid.find('.bkbg-category-section');
    var $tabs        = $('#bkbg-category-tabs');
    var $search      = $('#bkbg-search');
    var $saveBtn     = $('#bkbg-save');
    var $enableAll   = $('#bkbg-enable-all');
    var $disableAll  = $('#bkbg-disable-all');
    var $toast       = $('#bkbg-toast');
    var $empty       = $('#bkbg-empty');
    var $enabledCount = $('#bkbg-enabled-count');

    var dirty  = false;
    var saving = false;
    var activeCategory = 'all';
    var toastTimer;

    /* ── Helpers ──────────────────────────────── */
    function showToast(msg, type) {
        clearTimeout(toastTimer);
        $toast
            .text(msg)
            .removeClass('bkbg-toast--success bkbg-toast--error')
            .addClass('bkbg-toast--visible' + (type ? ' bkbg-toast--' + type : ''));
        toastTimer = setTimeout(function () {
            $toast.removeClass('bkbg-toast--visible');
        }, 3000);
    }

    function updateEnabledCount() {
        var total   = $cards.length;
        var enabled = $cards.find('.bkbg-toggle__input:checked').length;
        $enabledCount.text(enabled);
    }

    function setDirty() {
        if (!dirty) {
            dirty = true;
            $saveBtn.addClass('bkbg-btn--unsaved');
        }
    }

    function clearDirty() {
        dirty = false;
        $saveBtn.removeClass('bkbg-btn--unsaved');
    }

    function getDisabledBlocks() {
        var disabled = [];
        $cards.find('.bkbg-toggle__input').each(function () {
            if (!this.checked) {
                disabled.push($(this).data('block'));
            }
        });
        return disabled;
    }

    function applyVisibility() {
        var query = $.trim($search.val()).toLowerCase();
        var visibleSections = {};
        var totalVisible = 0;

        $cards.each(function () {
            var $card    = $(this);
            var category = $card.closest('.bkbg-category-section').data('category');
            var matchCat = activeCategory === 'all' || category === activeCategory;
            var matchSearch = true;

            if (query) {
                var title    = $card.data('title') || '';
                var slug     = $card.data('slug') || '';
                var keywords = $card.data('keywords') || '';
                matchSearch = title.indexOf(query) !== -1 ||
                              slug.indexOf(query) !== -1 ||
                              keywords.indexOf(query) !== -1;
            }

            if (matchCat && matchSearch) {
                $card.removeClass('bkbg-card--hidden');
                visibleSections[category] = true;
                totalVisible++;
            } else {
                $card.addClass('bkbg-card--hidden');
            }
        });

        /* Show/hide category sections */
        $sections.each(function () {
            var cat = $(this).data('category');

            if (activeCategory !== 'all' && cat !== activeCategory) {
                $(this).hide();
                return;
            }

            if (visibleSections[cat]) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });

        /* Empty state */
        if (totalVisible === 0) {
            $empty.show();
        } else {
            $empty.hide();
        }
    }

    /* ── Category tabs ───────────────────────── */
    $tabs.on('click', '.bkbg-tab', function () {
        $tabs.find('.bkbg-tab').removeClass('bkbg-tab--active');
        $(this).addClass('bkbg-tab--active');
        activeCategory = $(this).data('category');
        applyVisibility();
    });

    /* ── Search ──────────────────────────────── */
    var searchDebounce;
    $search.on('input', function () {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(applyVisibility, 150);
    });

    /* ── Toggle switch ───────────────────────── */
    $grid.on('change', '.bkbg-toggle__input', function () {
        var $card = $(this).closest('.bkbg-card');
        if (this.checked) {
            $card.removeClass('bkbg-card--disabled');
        } else {
            $card.addClass('bkbg-card--disabled');
        }
        updateEnabledCount();
        setDirty();
    });

    /* ── Card click (toggle on card click) ──── */
    $grid.on('click', '.bkbg-card', function (e) {
        /* Don't toggle when clicking the toggle itself */
        if ($(e.target).closest('.bkbg-toggle').length) {
            return;
        }
        var $cb = $(this).find('.bkbg-toggle__input');
        $cb.prop('checked', !$cb.prop('checked')).trigger('change');
    });

    /* ── Bulk: Enable All / Disable All (visible) ─── */
    $enableAll.on('click', function () {
        $cards.not('.bkbg-card--hidden').find('.bkbg-toggle__input').each(function () {
            if (!this.checked) {
                $(this).prop('checked', true).trigger('change');
            }
        });
    });

    $disableAll.on('click', function () {
        $cards.not('.bkbg-card--hidden').find('.bkbg-toggle__input').each(function () {
            if (this.checked) {
                $(this).prop('checked', false).trigger('change');
            }
        });
    });

    /* ── Per-category enable/disable ─────────── */
    $grid.on('click', '.bkbg-cat-toggle', function () {
        var action = $(this).data('action');
        var cat    = $(this).data('cat');
        var $sec   = $grid.find('.bkbg-category-section[data-category="' + cat + '"]');
        var check  = action === 'enable';

        $sec.find('.bkbg-toggle__input').each(function () {
            if (this.checked !== check) {
                $(this).prop('checked', check).trigger('change');
            }
        });
    });

    /* ── Save ────────────────────────────────── */
    $saveBtn.on('click', function () {
        if (saving) return;
        saving = true;
        $saveBtn.addClass('bkbg-btn--saving');
        showToast(bkbgDashboard.i18n.saving);

        var disabled = getDisabledBlocks();

        $.ajax({
            url: bkbgDashboard.ajaxUrl,
            method: 'POST',
            data: {
                action:   'bkbg_save_disabled_blocks',
                nonce:    bkbgDashboard.nonce,
                disabled: JSON.stringify(disabled)
            },
            success: function (resp) {
                if (resp.success) {
                    clearDirty();
                    showToast(bkbgDashboard.i18n.saved, 'success');
                } else {
                    showToast(bkbgDashboard.i18n.error, 'error');
                }
            },
            error: function () {
                showToast(bkbgDashboard.i18n.error, 'error');
            },
            complete: function () {
                saving = false;
                $saveBtn.removeClass('bkbg-btn--saving');
            }
        });
    });

    /* ── Keyboard shortcut: Ctrl/Cmd+S ─────── */
    $(document).on('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (dirty) {
                $saveBtn.trigger('click');
            }
        }
    });

    /* ── Warn before leaving with unsaved changes ── */
    $(window).on('beforeunload', function () {
        if (dirty) {
            return true;
        }
    });

    /* ── Init ────────────────────────────────── */
    updateEnabledCount();

})(jQuery);
