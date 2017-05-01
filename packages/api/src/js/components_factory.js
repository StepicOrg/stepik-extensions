export function create_tabs(objects) {
    let tabs = '';
    let panels = '';
    let panel_id_prefix = objects['prefix'];
    let active_index = objects['active_index'];

    for (let index = 0; index < objects.length; index++) {
        let object = objects[index];
        let panel_id = '' + panel_id_prefix + index;
        let caption = object['caption'];
        let tab_class = active_index === index ? 'active' : '';

        tabs += `<li class="${tab_class}"><a data-toggle="tab" href="#${panel_id}">${caption}</a></li>
                `;

        let content = object['content'];
        let panel_class = active_index === index ? 'in active' : '';

        panels += `<div id="${panel_id}" class="tab-pane fade ${panel_class}">${content}</div>
                  `;
    }
    return `
        <ul class="nav nav-tabs">
            ${tabs}
        </ul>

        <div class="tab-content">
            ${panels}
        </div>
    `;
}
