(function () {
    'use strict';

    var LS_PREFIX = 'bkip_vote_';

    function getStoredData(instanceId) {
        try {
            var raw = localStorage.getItem(LS_PREFIX + instanceId);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function storeData(instanceId, data) {
        try {
            localStorage.setItem(LS_PREFIX + instanceId, JSON.stringify(data));
        } catch (e) {}
    }

    function calcTotals(votes) {
        return votes.reduce(function (a, b) { return a + b; }, 0);
    }

    function renderResults(wrap, votes, animate) {
        var total = calcTotals(votes);
        var fills = wrap.querySelectorAll('.bkip-bar-fill');
        var pcts  = wrap.querySelectorAll('.bkip-result-pct');
        var totalNum = wrap.querySelector('.bkip-total-num');

        fills.forEach(function (fill, i) {
            var pct = total > 0 ? Math.round((votes[i] / total) * 100) : 0;

            if (!animate) {
                fill.style.transition = 'none';
            }

            // Trigger transition by setting width after a tiny delay
            setTimeout(function () {
                fill.style.width = pct + '%';
            }, animate ? 50 : 0);

            if (pcts[i]) pcts[i].textContent = pct + '%';
        });

        if (totalNum) totalNum.textContent = total;
    }

    function showResults(wrap) {
        var votesEl  = wrap.querySelector('.bkip-votes');
        var resultsEl = wrap.querySelector('.bkip-results');
        if (votesEl)   votesEl.classList.add('bkip-hidden');
        if (resultsEl) resultsEl.classList.add('bkip-visible');
    }

    function showVotes(wrap) {
        var votesEl   = wrap.querySelector('.bkip-votes');
        var resultsEl = wrap.querySelector('.bkip-results');
        if (votesEl)   votesEl.classList.remove('bkip-hidden');
        if (resultsEl) resultsEl.classList.remove('bkip-visible');
    }

    function initPoll(wrap) {
        var instanceId   = wrap.dataset.instance;
        var allowRevote  = wrap.dataset.allowRevote  !== 'false';
        var showBefore   = wrap.dataset.showBefore   === 'true';
        var animate      = wrap.dataset.animate      !== 'false';

        if (!instanceId) return;

        // Load option data from embedded JSON
        var dataScript = wrap.querySelector('.bkip-data');
        var baseOptions;
        try {
            baseOptions = JSON.parse(dataScript ? dataScript.textContent : '[]');
        } catch (e) {
            baseOptions = [];
        }

        // Initialise votes array from localStorage or base
        var stored = getStoredData(instanceId);
        var votes   = stored ? stored.votes : baseOptions.map(function (o) { return o.votes || 0; });
        var voted   = stored ? stored.voted : false;

        // Initial render
        if (showBefore || voted) {
            renderResults(wrap, votes, false);
            if (voted) showResults(wrap);
        }

        // Vote buttons
        var btns = Array.prototype.slice.call(wrap.querySelectorAll('.bkip-option-btn'));
        btns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (voted && !allowRevote) return;

                var idx = parseInt(btn.dataset.index, 10);
                if (isNaN(idx) || idx < 0 || idx >= votes.length) return;

                // If revote: subtract previous vote
                if (voted && stored && typeof stored.lastVote === 'number') {
                    votes[stored.lastVote] = Math.max(0, votes[stored.lastVote] - 1);
                }

                votes[idx] = (votes[idx] || 0) + 1;
                voted = true;

                var newStored = { votes: votes, voted: true, lastVote: idx };
                storeData(instanceId, newStored);
                stored = newStored;

                renderResults(wrap, votes, animate);
                showResults(wrap);
            });
        });

        // Revote button
        var revoteBtn = wrap.querySelector('.bkip-revote');
        if (revoteBtn) {
            if (!allowRevote) {
                revoteBtn.style.display = 'none';
            }
            revoteBtn.addEventListener('click', function () {
                if (!allowRevote) return;
                voted = false;
                showVotes(wrap);
            });
        }
    }

    function init() {
        var polls = document.querySelectorAll('.bkip-wrap[data-instance]');
        polls.forEach(initPoll);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
