/**
 * Column Block Frontend
 * Handles responsive behavior for columns
 */
(function() {
    'use strict';
    
    // Column blocks are primarily CSS-based on the frontend
    // CSS variables handle responsive widths via media queries
    
    function initColumns() {
        var columns = document.querySelectorAll('.bkbg-column');
        
        columns.forEach(function(column) {
            // Add initialized class
            column.classList.add('bkbg-column--initialized');
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initColumns);
    } else {
        initColumns();
    }
})();
