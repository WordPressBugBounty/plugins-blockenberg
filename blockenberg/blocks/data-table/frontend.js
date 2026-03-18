(function () {
    'use strict';

    function toArray(nl) {
        return Array.prototype.slice.call(nl || []);
    }

    function initDataTable(wrap) {
        var searchInput = wrap.querySelector('[data-search]');
        var table = wrap.querySelector('.bkbg-dt-table');
        var thead = table ? table.querySelector('.bkbg-dt-thead') : null;
        var tbody = table ? table.querySelector('.bkbg-dt-tbody') : null;
        var headers = thead ? toArray(thead.querySelectorAll('.bkbg-dt-th')) : [];
        var allRows = tbody ? toArray(tbody.querySelectorAll('.bkbg-dt-tr')) : [];

        var sortable = wrap.getAttribute('data-sortable') === '1';
        var paginate = wrap.getAttribute('data-paginate') === '1';
        var perPage = parseInt(wrap.getAttribute('data-per-page'), 10) || 10;

        var currentSort = { col: -1, dir: 'asc' };
        var currentPage = 1;
        var filteredRows = allRows.slice();

        // Search functionality
        function filterRows(query) {
            query = (query || '').toLowerCase().trim();
            if (!query) {
                filteredRows = allRows.slice();
            } else {
                filteredRows = allRows.filter(function (row) {
                    var text = row.textContent.toLowerCase();
                    return text.indexOf(query) !== -1;
                });
            }
            currentPage = 1;
            render();
        }

        // Sort functionality
        function sortRows(colIndex) {
            if (currentSort.col === colIndex) {
                currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.col = colIndex;
                currentSort.dir = 'asc';
            }

            // Update header UI
            headers.forEach(function (th, i) {
                th.removeAttribute('data-sort');
                if (i === colIndex) {
                    th.setAttribute('data-sort', currentSort.dir);
                }
            });

            filteredRows.sort(function (a, b) {
                var cellA = a.children[colIndex];
                var cellB = b.children[colIndex];
                if (!cellA || !cellB) return 0;

                var valA = cellA.textContent.trim();
                var valB = cellB.textContent.trim();

                // Try numeric sort
                var numA = parseFloat(valA.replace(/[^0-9.-]/g, ''));
                var numB = parseFloat(valB.replace(/[^0-9.-]/g, ''));

                if (!isNaN(numA) && !isNaN(numB)) {
                    return currentSort.dir === 'asc' ? numA - numB : numB - numA;
                }

                // String sort
                var cmp = valA.localeCompare(valB);
                return currentSort.dir === 'asc' ? cmp : -cmp;
            });

            currentPage = 1;
            render();
        }

        // Pagination
        function renderPagination() {
            var existing = wrap.querySelector('.bkbg-dt-pagination');
            if (existing) existing.remove();

            if (!paginate || filteredRows.length <= perPage) return;

            var totalPages = Math.ceil(filteredRows.length / perPage);
            var pagination = document.createElement('div');
            pagination.className = 'bkbg-dt-pagination';

            // Previous button
            var prevBtn = document.createElement('button');
            prevBtn.className = 'bkbg-dt-page-btn';
            prevBtn.textContent = '←';
            prevBtn.disabled = currentPage === 1;
            prevBtn.addEventListener('click', function () {
                if (currentPage > 1) {
                    currentPage--;
                    render();
                }
            });
            pagination.appendChild(prevBtn);

            // Page buttons
            var startPage = Math.max(1, currentPage - 2);
            var endPage = Math.min(totalPages, startPage + 4);
            if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
            }

            for (var i = startPage; i <= endPage; i++) {
                (function (page) {
                    var btn = document.createElement('button');
                    btn.className = 'bkbg-dt-page-btn' + (page === currentPage ? ' is-active' : '');
                    btn.textContent = page;
                    btn.addEventListener('click', function () {
                        currentPage = page;
                        render();
                    });
                    pagination.appendChild(btn);
                })(i);
            }

            // Next button
            var nextBtn = document.createElement('button');
            nextBtn.className = 'bkbg-dt-page-btn';
            nextBtn.textContent = '→';
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.addEventListener('click', function () {
                if (currentPage < totalPages) {
                    currentPage++;
                    render();
                }
            });
            pagination.appendChild(nextBtn);

            // Info
            var info = document.createElement('span');
            info.className = 'bkbg-dt-page-info';
            var start = (currentPage - 1) * perPage + 1;
            var end = Math.min(currentPage * perPage, filteredRows.length);
            info.textContent = start + '-' + end + ' of ' + filteredRows.length;
            pagination.appendChild(info);

            wrap.appendChild(pagination);
        }

        // Render visible rows
        function render() {
            if (!tbody) return;

            // Reorder DOM elements to match sorted order
            filteredRows.forEach(function (row) {
                tbody.appendChild(row);
            });

            // Hide all rows first
            allRows.forEach(function (row) {
                row.style.display = 'none';
            });

            // Show filtered & paginated
            var start = paginate ? (currentPage - 1) * perPage : 0;
            var end = paginate ? start + perPage : filteredRows.length;

            for (var i = start; i < end && i < filteredRows.length; i++) {
                filteredRows[i].style.display = '';
            }

            // Empty state
            var emptyEl = wrap.querySelector('.bkbg-dt-empty');
            if (filteredRows.length === 0) {
                if (!emptyEl) {
                    emptyEl = document.createElement('div');
                    emptyEl.className = 'bkbg-dt-empty';
                    emptyEl.textContent = 'No results found';
                    wrap.querySelector('.bkbg-dt-container').appendChild(emptyEl);
                }
                emptyEl.style.display = '';
            } else if (emptyEl) {
                emptyEl.style.display = 'none';
            }

            renderPagination();
        }

        // Export to CSV
        function exportCsv() {
            function csvCell(text) {
                var s = String(text == null ? '' : text);
                // Normalize whitespace/newlines for CSV rows.
                s = s.replace(/\r?\n/g, ' ').trim();
                // Prevent Excel/Sheets formula injection when opening CSV.
                // See: values starting with = + - @ can be treated as formulas.
                if (/^[=+\-@]/.test(s)) {
                    s = "'" + s;
                }
                s = s.replace(/"/g, '""');
                return '"' + s + '"';
            }

            var headerRow = headers.map(function (th) {
                return csvCell(th.textContent);
            }).join(',');

            var dataRows = filteredRows.map(function (row) {
                return toArray(row.children).map(function (td) {
                    return csvCell(td.textContent);
                }).join(',');
            });

            var csv = [headerRow].concat(dataRows).join('\n');
            var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.download = 'table-data.csv';
            link.click();
            URL.revokeObjectURL(url);
        }

        // Event listeners
        if (searchInput) {
            var debounceTimer;
            searchInput.addEventListener('input', function () {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(function () {
                    filterRows(searchInput.value);
                }, 200);
            });
        }

        if (sortable) {
            headers.forEach(function (th, index) {
                th.addEventListener('click', function () {
                    sortRows(index);
                });
                th.style.cursor = 'pointer';
            });
        }

        var exportBtn = wrap.querySelector('[data-export="csv"]');
        if (exportBtn) {
            exportBtn.addEventListener('click', function (e) {
                e.preventDefault();
                exportCsv();
            });
        }

        // Initial render
        render();
    }

    function init() {
        var tables = document.querySelectorAll('.bkbg-dt-wrap:not([data-initialized])');
        for (var i = 0; i < tables.length; i++) {
            tables[i].setAttribute('data-initialized', '1');
            initDataTable(tables[i]);
        }
    }

    // Initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also try on window load as fallback
    window.addEventListener('load', init);
})();
