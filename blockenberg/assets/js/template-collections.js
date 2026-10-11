/* Immutable editing of converted carousel collections. Existing templates need no migration. */
(function (scope) {
    'use strict';
    function copy(value) { return JSON.parse(JSON.stringify(value)); }
    function classes(node) { return String((node.attrs || {}).class || '').split(/\s+/); }
    function references(node) {
        var found = [];
        function scan(value) {
            if (!value || typeof value !== 'object') return;
            if (typeof value.field === 'string' && found.indexOf(value.field) < 0) found.push(value.field);
            Object.keys(value).forEach(function (key) { if (key !== 'field') scan(value[key]); });
        }
        scan(node); return found;
    }
    function label(field, context) {
        if (field.type === 'image') return /avatar|author|testimonial/.test(context) ? 'Portrait' : 'Image';
        if (field.type === 'url') return 'Link URL';
        var tokens = context.split(/\s+/).reverse();
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (/extra-label|timeline-label/.test(token)) return 'Date / label';
            if (/subtitle|position|job/.test(token)) return 'Subtitle';
            if (/testimonial.*(?:title|name)|author-name|person-name/.test(token)) return 'Name';
            if (/testimonial.*description|quote/.test(token)) return 'Quote';
            if (/description|excerpt/.test(token)) return 'Description';
            if (/title|heading/.test(token)) return 'Title';
            if (/caption/.test(token)) return 'Caption';
        }
        return field.type === 'number' ? 'Value' : field.type === 'boolean' ? 'Enabled' : 'Text';
    }
    function fieldsFor(node, fields) {
        var map = {}, contexts = {};
        (fields || []).forEach(function (f) { map[f.id] = f; });
        function walk(n, context) {
            context = context + ' ' + classes(n).join(' ');
            if (n.field) contexts[n.field] = context;
            references(n.attrs || {}).forEach(function (id) { if (!contexts[id]) contexts[id] = context; });
            (n.children || []).forEach(function (c) { walk(c, context); });
        }
        walk(node, '');
        return references(node).map(function (id) {
            return map[id] ? Object.assign({}, map[id], { label: label(map[id], contexts[id] || '') }) : null;
        }).filter(Boolean);
    }
    function groups(attributes) {
        var result = [];
        function walk(nodes, path) {
            (nodes || []).forEach(function (node, i) {
                var here = path.concat(i);
                if (classes(node).indexOf('swiper-wrapper') >= 0) {
                    var items = [];
                    (node.children || []).forEach(function (child, at) {
                        if (classes(child).indexOf('swiper-slide') < 0 || classes(child).indexOf('swiper-slide-duplicate') >= 0) return;
                        var fields = fieldsFor(child, attributes.fields);
                        var title = fields.find(function (f) { return /Title|Name|Date/.test(f.label) && f.value; });
                        items.push({at: at, node: child, fields: fields,
                            key: (child.attrs || {})['data-bkbg-item-id'] || references(child).join('-') || String(at),
                            title: title ? String(title.value).replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim().slice(0,60) : ''});
                    });
                    result.push({path: here, items: items});
                } else walk(node.children, here);
            });
        }
        walk(attributes.tree, []); return result;
    }
    function atPath(tree, path) {
        var node, nodes = tree;
        path.forEach(function (index) { node = nodes[index]; nodes = node.children; });
        return node;
    }
    function change(attributes, path, operation, index, token) {
        var tree = copy(attributes.tree || []), fields = copy(attributes.fields || []);
        var track = atPath(tree, path), items = (track.children || []).filter(function (n) {
            return classes(n).indexOf('swiper-slide') >= 0 && classes(n).indexOf('swiper-slide-duplicate') < 0;
        });
        var templates = copy(!Array.isArray(attributes.collectionTemplates) && attributes.collectionTemplates || {}), templateKey = path.join('-');
        var template = templates[templateKey];
        var item = items[index] || (operation === 'add' && template ? template.node : null);
        if (!item) return null;
        var at = track.children.indexOf(item);
        if (operation === 'remove') {
            if (items.length === 1) templates[templateKey] = {node:copy(item),fields:fields.filter(function(f){return references(item).indexOf(f.id)>=0;})};
            var removed = references(item); track.children.splice(at,1);
            var retained = references(tree);
            fields = fields.filter(function (f) { return removed.indexOf(f.id) < 0 || retained.indexOf(f.id) >= 0; });
        } else if (operation === 'up' || operation === 'down') {
            var target = index + (operation === 'up' ? -1 : 1);
            if (!items[target]) return null;
            var otherAt = track.children.indexOf(items[target]);
            track.children[at] = items[target]; track.children[otherAt] = item;
        } else if (operation === 'add' || operation === 'duplicate') {
            token = token || Date.now().toString(36) + Math.random().toString(36).slice(2,8);
            var clone = copy(item), ids = {}, refs = references(item);
            var existing = new Set(fields.map(function (f) { return f.id; }));
            refs.forEach(function (id, i) {
                var original = fields.find(function (f) { return f.id === id; }) || (template && template.fields.find(function(f){return f.id === id;}));
                if (!original) return;
                var next = 'item-' + token + '-' + i;
                while (existing.has(next)) next += '-copy';
                existing.add(next); ids[id] = next;
                var field = copy(original); field.id = next;
                if (operation === 'add') {
                    if (field.type === 'image') { field.image = Object.assign({}, field.image, {src:'',alt:'',id:0}); delete field.image.srcset; delete field.image.sizes; field.value = ''; }
                    else if (field.type === 'url') field.value = '';
                    else if (field.type === 'text' || field.type === 'richtext') field.value = '';
                }
                fields.push(field);
            });
            var elementIds = {};
            function scanIds(n) {
                if (typeof (n.attrs || {}).id === 'string') elementIds[n.attrs.id] = n.attrs.id + '-item-' + token;
                (n.children || []).forEach(scanIds);
            }
            scanIds(clone);
            function remap(value, name) {
                if (value && typeof value === 'object') {
                    if (ids[value.field]) value.field = ids[value.field];
                    Object.keys(value).forEach(function (k) { value[k] = remap(value[k], k); });
                } else if (typeof value === 'string') {
                    if (name === 'id' && elementIds[value]) return elementIds[value];
                    if (['href','xlink:href','fill','stroke','clip-path','mask','for','aria-controls','aria-labelledby','aria-describedby'].indexOf(name) >= 0) {
                        Object.keys(elementIds).forEach(function (id) {
                            value = value.replace('url(#'+id+')','url(#'+elementIds[id]+')');
                            if (value === '#'+id) value = '#'+elementIds[id];
                            if (['for','aria-controls','aria-labelledby','aria-describedby'].indexOf(name)>=0) value=value.split(/\s+/).map(function(v){return v===id?elementIds[id]:v;}).join(' ');
                        });
                    }
                }
                return value;
            }
            remap(clone,''); clone.attrs = clone.attrs || {}; clone.attrs['data-bkbg-item-id'] = token;
            // Preserve source style classes, while stripping runtime state from copied items.
            clone.attrs.class = classes(clone).filter(function (c) { return !/^swiper-slide-(active|prev|next|duplicate)$/.test(c); }).join(' ');
            track.children.splice(operation === 'add' ? track.children.length : at+1,0,clone);
        } else return null;
        return {tree:tree,fields:fields,collectionTemplates:templates};
    }
    var api = {groups:groups,change:change,references:references};
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else scope.bkbgTemplateCollections = api;
})(typeof window !== 'undefined' ? window : this);
