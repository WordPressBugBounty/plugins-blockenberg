/**
 * Blockenberg Editor Scripts
 * Common functionality for all blocks
 */
wp.domReady(function() {

    /* =============================================
       Color ToolsPanel → collapsible (PanelBody-style)
       ============================================= */
    function initColorPanelToggles(root) {
        var panels = (root || document).querySelectorAll(
            '.block-editor-panel-color-gradient-settings:not([data-bkbg-collapse-init])'
        );
        panels.forEach(function (panel) {
            panel.setAttribute('data-bkbg-collapse-init', '1');
            // Start collapsed
            panel.classList.add('bkbg-panel-collapsed');

            var header = panel.querySelector('.components-tools-panel-header');
            if (!header) return;

            header.addEventListener('click', function (e) {
                // Don't toggle when clicking a child interactive element (buttons, inputs)
                if (e.target.closest('button, input, select, .components-dropdown-menu')) return;
                panel.classList.toggle('bkbg-panel-collapsed');
            });
        });
    }

    // Re-run whenever the sidebar DOM changes (block selection, tab switch, etc.)
    var colorPanelObserver = new MutationObserver(function () {
        initColorPanelToggles();
    });
    colorPanelObserver.observe(document.body, { childList: true, subtree: true });
    // Initial pass
    initColorPanelToggles();

    // Track global drag state for showing drop zones
    var isDragging = false;
    var currentDropTarget = null;
    
    function addDraggingClass() {
        if (!isDragging) {
            isDragging = true;
            document.body.classList.add('bkbg-is-dragging');
            
            // Also add to iframe if exists
            var editorCanvas = document.querySelector('iframe[name="editor-canvas"]');
            if (editorCanvas && editorCanvas.contentDocument) {
                editorCanvas.contentDocument.body.classList.add('bkbg-is-dragging');
            }
        }
    }
    
    function removeDraggingClass() {
        isDragging = false;
        document.body.classList.remove('bkbg-is-dragging');
        
        // Also remove from iframe if exists
        var editorCanvas = document.querySelector('iframe[name="editor-canvas"]');
        if (editorCanvas && editorCanvas.contentDocument) {
            editorCanvas.contentDocument.body.classList.remove('bkbg-is-dragging');
        }
        
        // Clear any drop target highlights
        clearDropTargetHighlight();
    }
    
    function clearDropTargetHighlight() {
        if (currentDropTarget) {
            currentDropTarget.classList.remove('bkbg-drop-target');
            currentDropTarget = null;
        }
        // Also clear all just in case
        document.querySelectorAll('.bkbg-drop-target').forEach(function(el) {
            el.classList.remove('bkbg-drop-target');
        });
        var editorCanvas = document.querySelector('iframe[name="editor-canvas"]');
        if (editorCanvas && editorCanvas.contentDocument) {
            editorCanvas.contentDocument.querySelectorAll('.bkbg-drop-target').forEach(function(el) {
                el.classList.remove('bkbg-drop-target');
            });
        }
    }
    
    function handleDragOver(e) {
        if (!isDragging) return;
        
        // Find the closest drop zone (appender button, block-list-appender, or layout container)
        var target = e.target;
        var dropZone = target.closest('.block-editor-button-block-appender, .block-list-appender, .bkbg-column, .bkbg-row, .bkbg-section');
        
        if (dropZone && dropZone !== currentDropTarget) {
            clearDropTargetHighlight();
            currentDropTarget = dropZone;
            dropZone.classList.add('bkbg-drop-target');
        }
    }
    
    function handleDragLeave(e) {
        var target = e.target;
        var dropZone = target.closest('.block-editor-button-block-appender, .block-list-appender, .bkbg-column, .bkbg-row, .bkbg-section');
        
        if (dropZone && dropZone.classList.contains('bkbg-drop-target')) {
            // Check if we're leaving to a child element
            var relatedTarget = e.relatedTarget;
            if (relatedTarget && dropZone.contains(relatedTarget)) {
                return; // Still inside the drop zone
            }
            dropZone.classList.remove('bkbg-drop-target');
            if (currentDropTarget === dropZone) {
                currentDropTarget = null;
            }
        }
    }
    
    // Listen for drag events on the document
    document.addEventListener('dragstart', addDraggingClass, true);
    document.addEventListener('dragend', removeDraggingClass, true);
    document.addEventListener('dragover', handleDragOver, true);
    document.addEventListener('dragleave', handleDragLeave, true);
    document.addEventListener('drop', function() {
        // Small delay to ensure drag operations complete
        setTimeout(removeDraggingClass, 100);
    }, true);
    
    // Also listen inside the editor iframe when it loads
    function setupIframeDragListeners() {
        var editorCanvas = document.querySelector('iframe[name="editor-canvas"]');
        if (editorCanvas && editorCanvas.contentDocument) {
            var doc = editorCanvas.contentDocument;
            doc.addEventListener('dragstart', addDraggingClass, true);
            doc.addEventListener('dragend', removeDraggingClass, true);
            doc.addEventListener('dragover', handleDragOver, true);
            doc.addEventListener('dragleave', handleDragLeave, true);
            doc.addEventListener('drop', function() {
                setTimeout(removeDraggingClass, 100);
            }, true);
        }
    }
    
    // Try to setup iframe listeners after a delay (iframe may not be ready immediately)
    setTimeout(setupIframeDragListeners, 1000);
    setTimeout(setupIframeDragListeners, 3000);
    
    // Also use MutationObserver to detect when iframe is added
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                var editorCanvas = document.querySelector('iframe[name="editor-canvas"]');
                if (editorCanvas) {
                    editorCanvas.addEventListener('load', setupIframeDragListeners);
                }
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
});
