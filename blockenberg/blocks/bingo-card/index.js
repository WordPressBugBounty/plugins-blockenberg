( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;

    function getTypographyControl() { return window.bkbgTypographyControl; }
    function getTypoCssVars() { return window.bkbgTypoCssVars; }

    var COLS = ['B','I','N','G','O'];
    var COL_RANGES = [[1,15],[16,30],[31,45],[46,60],[61,75]];

    function generateCard() {
        return COLS.map(function (col, ci) {
            var nums = [];
            var range = COL_RANGES[ci];
            while (nums.length < 5) {
                var n = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
                if (nums.indexOf(n) === -1) nums.push(n);
            }
            return nums;
        });
    }

    function previewCard(a) {
        var card = generateCard();
        var cellSize = 52;

        return el('div', { style: { background: a.sectionBg, padding: '24px', borderRadius: '14px', maxWidth: a.contentMaxWidth + 'px', fontFamily: 'system-ui,sans-serif', margin: '0 auto' } },
            a.showTitle && el('div', { className: 'bkbg-bng-title', style: { color: a.titleColor } }, a.title),
            a.showSubtitle && el('div', { className: 'bkbg-bng-subtitle' }, a.subtitle),

            /* Caller area */
            a.showCaller && el('div', { style: { background: a.headerBg, color: a.headerColor, borderRadius: '10px', padding: '14px', textAlign: 'center', marginBottom: '18px' } },
                el('div', { style: { fontSize: '11px', letterSpacing: '0.1em', marginBottom: '4px', opacity: 0.7 } }, 'LAST CALLED'),
                el('div', { style: { fontSize: '40px', fontWeight: 900, letterSpacing: '4px' } }, 'B-7'),
                el('button', { style: { marginTop: '10px', background: a.accentColor, color: '#fff', border: 'none', borderRadius: '7px', padding: '8px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' } }, '▶ Call Next Number')
            ),

            /* Bingo grid */
            el('div', { style: { border: '3px solid ' + a.headerBg, borderRadius: '10px', overflow: 'hidden' } },
                /* Column headers */
                el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)' } },
                    COLS.map(function (col) {
                        return el('div', { key: col, style: { background: a.headerBg, color: a.headerColor, textAlign: 'center', padding: '12px 0', fontWeight: 900, fontSize: '22px', letterSpacing: '2px' } }, col);
                    })
                ),
                /* Cells */
                el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)' } },
                    [0,1,2,3,4].map(function (row) {
                        return COLS.map(function (col, ci) {
                            var isFree = (row === 2 && ci === 2);
                            var isMarked = isFree || Math.random() < 0.3;
                            return el('div', {
                                key: col + '-' + row,
                                style: {
                                    textAlign: 'center',
                                    padding: '0',
                                    height: cellSize + 'px',
                                    lineHeight: cellSize + 'px',
                                    fontWeight: isFree ? 800 : 600,
                                    fontSize: isFree ? '11px' : '18px',
                                    background: isFree ? a.freeColor : (isMarked ? a.markedColor : a.cellBg),
                                    color: (isFree || isMarked) ? '#fff' : a.cellColor,
                                    border: '1px solid ' + a.borderColor,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }
                            }, isFree ? 'FREE' : card[ci][row]);
                        });
                    })
                )
            ),

            /* New card button */
            el('div', { style: { textAlign: 'center', marginTop: '16px' } },
                el('button', { style: { background: 'transparent', border: '2px solid ' + a.headerBg, color: a.headerBg, borderRadius: '7px', padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' } }, '🔀 New Card')
            )
        );
    }

    registerBlockType('blockenberg/bingo-card', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var _tv = getTypoCssVars();
            var bpStyle = {};
            if (_tv) {
                Object.assign(bpStyle, _tv(a.titleTypo || {}, '--bkbg-bng-title-'));
                Object.assign(bpStyle, _tv(a.subtitleTypo || {}, '--bkbg-bng-sub-'));
            }
            var blockProps = useBlockProps({ className: 'bkbg-bng-root', style: bpStyle });

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Content', initialOpen: true },
                        el(TextControl, { label: 'Title', value: a.title, onChange: function (v) { set({ title: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(TextControl, { label: 'Subtitle', value: a.subtitle, onChange: function (v) { set({ subtitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(ToggleControl, { label: 'Show Title', checked: a.showTitle, onChange: function (v) { set({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Subtitle', checked: a.showSubtitle, onChange: function (v) { set({ showSubtitle: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Game Settings', initialOpen: false },
                        el(ToggleControl, { label: 'Show Number Caller', checked: a.showCaller, onChange: function (v) { set({ showCaller: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Called Numbers List', checked: a.showCalledList, onChange: function (v) { set({ showCalledList: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Auto-Call Numbers', checked: a.autoCall, onChange: function (v) { set({ autoCall: v }); }, __nextHasNoMarginBottom: true }),
                        a.autoCall && el(RangeControl, { label: 'Auto-Call Interval (seconds)', value: a.autoCallInterval, min: 2, max: 30, onChange: function (v) { set({ autoCallInterval: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        (function () { var TC = getTypographyControl(); return TC ? el(TC, { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } }) : null; })(),
                        (function () { var TC = getTypographyControl(); return TC ? el(TC, { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function (v) { set({ subtitleTypo: v }); } }) : null; })(),
                        el(RangeControl, { label: 'Max Width (px)', value: a.contentMaxWidth, min: 300, max: 900, step: 10, onChange: function (v) { set({ contentMaxWidth: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Accent Color', value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#f59e0b' }); } },
                            { label: 'Marked Cell Color', value: a.markedColor, onChange: function (v) { set({ markedColor: v || '#f59e0b' }); } },
                            { label: 'Bingo Win Color', value: a.bingoColor, onChange: function (v) { set({ bingoColor: v || '#22c55e' }); } },
                            { label: 'FREE Space Color', value: a.freeColor, onChange: function (v) { set({ freeColor: v || '#6366f1' }); } },
                            { label: 'Header Background', value: a.headerBg, onChange: function (v) { set({ headerBg: v || '#1e3a5f' }); } },
                            { label: 'Header Text', value: a.headerColor, onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                            { label: 'Cell Background', value: a.cellBg, onChange: function (v) { set({ cellBg: v || '#ffffff' }); } },
                            { label: 'Cell Text', value: a.cellColor, onChange: function (v) { set({ cellColor: v || '#1f2937' }); } },
                            { label: 'Section Background', value: a.sectionBg, onChange: function (v) { set({ sectionBg: v || '#f8fafc' }); } },
                            { label: 'Title Color', value: a.titleColor, onChange: function (v) { set({ titleColor: v || '#1e3a5f' }); } }
                        ]
                    })
                ),
                el('div', blockProps, previewCard(a))
            );
        },
        save: function (props) {
            var a = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-bng-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
