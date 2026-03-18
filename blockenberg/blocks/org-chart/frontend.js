(function () {

    function hexLuma(hex) {
        if (!hex) return 0;
        var c = hex.replace('#','');
        if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
        var r = parseInt(c.substr(0,2),16), g = parseInt(c.substr(2,2),16), b = parseInt(c.substr(4,2),16);
        return 0.299*r + 0.587*g + 0.114*b;
    }

    function buildTree(nodes) {
        var map = {};
        nodes.forEach(function (n) { map[n.id] = Object.assign({}, n, { children: [] }); });
        var roots = [];
        nodes.forEach(function (n) {
            if (!n.parentId || !map[n.parentId]) { roots.push(map[n.id]); }
            else { map[n.parentId].children.push(map[n.id]); }
        });
        return roots;
    }

    function buildNodeEl(node, opts, depth, allCards) {
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-oc-node-wrap';
        wrap.setAttribute('data-id', node.id);

        /* connector line upward (drawn by parent actually) */

        var card = document.createElement('div');
        card.className = 'bkbg-oc-card';
        card.style.borderColor = node.color || '';

        /* Avatar */
        if (opts.showAvatars) {
            var av = document.createElement('div');
            av.className = 'bkbg-oc-avatar';
            av.style.background = node.color || '';
            if (node.avatarUrl) {
                var img = document.createElement('img');
                img.src = node.avatarUrl;
                img.alt = node.name;
                av.appendChild(img);
            } else {
                var sp = document.createElement('span');
                sp.className = 'bkbg-oc-avatar-initial';
                sp.textContent = (node.name || '?').charAt(0).toUpperCase();
                av.appendChild(sp);
            }
            card.appendChild(av);
        }

        var nameEl = document.createElement('p'); nameEl.className = 'bkbg-oc-name'; nameEl.textContent = node.name; card.appendChild(nameEl);
        var roleEl = document.createElement('p'); roleEl.className = 'bkbg-oc-role'; roleEl.textContent = node.role; card.appendChild(roleEl);
        if (opts.showDept && node.department) {
            var deptEl = document.createElement('p'); deptEl.className = 'bkbg-oc-dept'; deptEl.textContent = node.department; card.appendChild(deptEl);
        }

        /* Collapse toggle */
        if (opts.collapse && node.children && node.children.length > 0) {
            card.style.cursor = 'pointer';
            card.title = 'Click to expand/collapse';
            card.addEventListener('click', function () { wrap.classList.toggle('is-collapsed'); });
        }

        allCards.push(card);
        wrap.appendChild(card);

        if (node.children && node.children.length > 0) {
            /* vertical line down */
            var vDown = document.createElement('div');
            vDown.className = 'bkbg-oc-conn-v-down';
            wrap.appendChild(vDown);

            if (node.children.length > 1) {
                var hLine = document.createElement('div');
                hLine.className = 'bkbg-oc-conn-h';
                wrap.appendChild(hLine);
            }

            var row = document.createElement('div');
            row.className = 'bkbg-oc-children-row';
            node.children.forEach(function (child) {
                var childWrap = buildNodeEl(child, opts, depth + 1, allCards);
                /* connector up for child */
                var vUp = document.createElement('div');
                vUp.className = 'bkbg-oc-conn-v-up';
                childWrap.insertBefore(vUp, childWrap.firstChild);
                row.appendChild(childWrap);
            });
            wrap.appendChild(row);
        }

        return wrap;
    }

    function initOrgChart(wrapper) {
        if (wrapper.dataset.initialized) return;
        wrapper.dataset.initialized = '1';

        var treeEl = wrapper.querySelector('.bkbg-oc-tree');
        if (!treeEl) return;

        var nodes = [];
        try { nodes = JSON.parse(treeEl.getAttribute('data-nodes') || '[]'); } catch (e) {}

        var opts = {
            showAvatars: treeEl.getAttribute('data-show-avatars') === '1',
            showDept:    treeEl.getAttribute('data-show-dept')    === '1',
            collapse:    treeEl.getAttribute('data-collapse')     === '1',
        };

        treeEl.innerHTML = '';
        treeEl.style.display = 'flex';
        treeEl.style.flexDirection = 'column';
        treeEl.style.alignItems = 'center';
        treeEl.style.minWidth = 'max-content';

        var allCards = [];
        var roots = buildTree(nodes);
        roots.forEach(function (root) {
            treeEl.appendChild(buildNodeEl(root, opts, 0, allCards));
        });

        /* Fade-in per card */
        if ('IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (e, idx) {
                    if (e.isIntersecting) {
                        setTimeout(function () { e.target.classList.add('is-visible'); }, idx * 80);
                        obs.unobserve(e.target);
                    }
                });
            }, { threshold: 0.2 });
            allCards.forEach(function (c) { obs.observe(c); });
        } else {
            allCards.forEach(function (c) { c.classList.add('is-visible'); });
        }
    }

    function init() {
        document.querySelectorAll('.bkbg-oc-wrapper').forEach(initOrgChart);
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
}());
