define(['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.create_tabs = create_tabs;
    function create_tabs(objects) {
        var tabs = '';
        var panels = '';
        var panel_id_prefix = objects['prefix'];
        var active_index = objects['active_index'];

        for (var index = 0; index < objects.length; index++) {
            var object = objects[index];
            var panel_id = '' + panel_id_prefix + index;
            var caption = object['caption'];
            var tab_class = active_index === index ? 'active' : '';

            tabs += '<li class="' + tab_class + '"><a data-toggle="tab" href="#' + panel_id + '">' + caption + '</a></li>\n                ';

            var content = object['content'];
            var panel_class = active_index === index ? 'in active' : '';

            panels += '<div id="' + panel_id + '" class="tab-pane fade ' + panel_class + '">' + content + '</div>\n                  ';
        }
        return '\n        <ul class="nav nav-tabs">\n            ' + tabs + '\n        </ul>\n\n        <div class="tab-content">\n            ' + panels + '\n        </div>\n    ';
    }
});