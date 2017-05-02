import "../../imports/js/domReady!";
import {swagger} from "swagger";
import {$} from "../../imports/jquery/js/jquery";
import {create_tabs} from "components_factory";

export let init = function () {
        const {get} = $;

        let api_docs = {apis: []};
        let examples = {};
        get({
            url: "examples/examples.json",
            dataType: "json"
        }).done(function (data) {
            examples = data.examples;
            swagger.getApiDocs("https://stepik.org/api/docs/api-docs/")
                .done(function (data) {
                    api_docs = data;
                    paint();
                })
                .fail(function () {
                    api_docs = {apis: []};
                    paint();
                });
        });

        function paint() {
            let api_list = document.querySelector("#api-list");

            api_list.innerHTML = "";

            api_docs.apis.forEach(api_item => {
                const title = api_item.description ? api_item.description : "";
                let newLi = document.createElement('li');
                let a = document.createElement('a');
                a.innerText = api_item.path;
                a.setAttribute('href', '#');
                newLi.appendChild(a);
                newLi.setAttribute('class', 'api-path');
                newLi.setAttribute('title', title);
                api_list.appendChild(newLi);
            });

            let elements = document.getElementsByClassName('api-path');
            for (let element of elements) {
                element.addEventListener("click", doApiPathClick);
            }
        }

        function doApiPathClick(event) {
            let target = event.currentTarget;
            if (target !== this) {
                return;
            }

            let path = target.innerText;
            let api_description = document.querySelector("#api-description");

            function drawApi(data) {
                api_description.innerHTML = '';
                let api_description_html = '';

                data.apis.forEach(function (item, item_index) {
                    if (item['operations'].length === 0) {
                        return;
                    }
                    let operation_list = `<h2>${item.description}</h2>`;

                    function getValues(type, parameter) {
                        let values = [];
                        if (!!parameter['minimum']) {
                            values.push("minimum: " + parameter['minimum']);
                        }

                        if (!!parameter['maximum']) {
                            values.push("maximum: " + parameter['maximum']);
                        }

                        if (!!parameter['uniqueItems']) {
                            values.push("Unique items");
                        }

                        if (type === "enum" || type === "choice") {
                            values.push(parameter['enum'].join(", "));
                        }

                        return values.join("<br>");
                    }

                    function getParams(parameters, show_location) {
                        let params = '';
                        if (!!parameters) {
                            for (let id in parameters) {
                                if (!parameters.hasOwnProperty(id)) {
                                    continue;
                                }
                                let parameter = parameters[id];
                                let required = parameter.required ? "*" : "";
                                let type = parameter.type || parameter.dataType || parameter["$ref"];
                                let values = getValues(type, parameter);
                                let defaultValue = parameter.defaultValue ? parameter.defaultValue : "";
                                let format = parameter.format ? parameter.format : "";
                                let description = parameter.description ? parameter.description : "";
                                let name = parameter.name || id;
                                params += `<tr>
                                    <td>${required}</td>
                                    <td>${name}</td>
                                    <td>${type}</td>
                                    <td>${format}</td>
                                    <td class='api-parameter-values'>${values}</td>
                                    <td>${defaultValue}</td>
                                    `;

                                if (show_location) {
                                    params += `<td>${parameter['paramType']}</td>`;
                                }

                                params +=
                                    `<td>${description}</td>
                                        </tr>
                                    `;
                            }
                        }

                        return params;
                    }

                    function getResponseMessages(operation) {
                        let responseMessages = [];

                        if (!!operation.responseMessages) {
                            operation.responseMessages.forEach(function (responseMessage) {
                                responseMessages.push("Code: " + responseMessage.code + "<br>");
                                responseMessages.push("Message: " + responseMessage.message);
                            })
                        }
                        return responseMessages.length > 0 ? responseMessages.join("<br><br>") : "No error response defined";
                    }

                    function getRequest(operation) {
                        let request = operation.method + " " + item.path + " HTTP/1.1<br>";
                        request += "Host: " + data.basePath;


                        return request;
                    }

                    function getPrimitivePresentation(type) {
                        if (type === "array") {
                            return "[]";
                        }
                        if (type === "object") {
                            return "{}";
                        }

                        return "<b>" + type + "</b>";
                    }

                    function getModelPresentation(models, dataType, level) {
                        if (swagger.isPrimitive(dataType)) {
                            return getPrimitivePresentation(dataType);
                        }
                        let model = models[dataType];
                        if (!model) {
                            console.log(dataType);
                        }
                        level = level ? level : 0;
                        let base_indent = new Array(level * 4).join(" ");
                        let presentation = "{\n";
                        let indent = base_indent + new Array(4).join(" ");

                        let properties_list = model.properties;
                        let properties = [];
                        for (let name in properties_list) {
                            if (!properties_list.hasOwnProperty(name)) {
                                continue;
                            }
                            let property = properties_list[name];
                            let value;
                            let type = property.type;
                            if (swagger.isPrimitive(type)) {
                                let typePresentation = getPrimitivePresentation(type);
                                let format = type === "string" ? type : property.format;
                                let defValue = property.defaultValue;
                                if (typeof defValue === "object") {
                                    defValue = JSON.stringify(defValue);
                                } else if (!!defValue && (type === "string" || format === "string")) {
                                    defValue = '"' + defValue + '"';
                                }

                                defValue = defValue ? defValue : "";

                                value = defValue + " (" + typePresentation;

                                if (!!format && type !== format) {
                                    value += " as " + format;
                                }

                                value += ")";
                            } else {
                                value = getModelPresentation(models, type, level + 1);
                            }
                            properties.push(indent + '"' + name + '":' + value);
                        }
                        presentation += properties.join(",\n") + "\n" + base_indent + "}";
                        return presentation
                    }

                    function getResponse(operation, models) {
                        return "<code><pre>" + getModelPresentation(models, operation.type) + "</pre></code>";
                    }

                    function getModels(models, show_location) {
                        let result = "";
                        for (let id in models) {
                            if (!models.hasOwnProperty(id)) {
                                continue;
                            }
                            result += "<b>" + id + "</b><br>";
                            result += "<table class='api-params'>";
                            result += "<tr>";
                            result += "<th>*</th>";
                            result += "<th>Name</th>";
                            result += "<th>Type</th>";
                            result += "<th>Format</th>";
                            result += "<th>Values</th>";
                            result += "<th>Default value</th>";
                            if (show_location) {
                                result += "<th>Location</th>";
                            }
                            result += "<th>Description</th>";
                            result += "</tr>";
                            result += getParams(models[id].properties, show_location);
                            result += "</table>";
                            result += "<br>";
                        }

                        return result;
                    }

                    item['operations'].forEach(function (operation, index) {
                        operation_list += `
                        <div class="api-item-operation">
                            <div class="api-item-method api-item-method-${operation.method}">${operation.method}</div>
                            <div class="api-item-path">${data.basePath}${item.path}</div>
                        </div>
                        <div class="api-item-notes">${operation['notes']}</div>
                        `;

                        let operation_tabs = [
                            {
                                caption: 'Parameters',
                                content: getModels({
                                    'Parameters': {
                                        properties: operation['parameters']
                                    }
                                }, true)
                            },
                            {
                                caption: 'Request',
                                content: getRequest(operation)
                            },
                            {
                                caption: 'Response',
                                content: getResponse(operation, data.models)
                            },
                            {
                                caption: 'Error code',
                                content: getResponseMessages(operation)
                            },
                            {
                                caption: 'Models',
                                content: getModels(data.models)
                            }
                        ];
                        operation_tabs['prefix'] = `api-item${item_index}-operation-${index}-`;
                        operation_tabs['active_index'] = 0;

                        operation_list += create_tabs(operation_tabs);

                        let example = examples[item.path];

                        if (!!example) {
                            let examples_tabs = [];
                            for (let caption in example) {
                                if (!example.hasOwnProperty(caption)) {
                                    continue;
                                }
                                examples_tabs.push({
                                    caption: caption,
                                    content: example[caption].filename
                                });
                            }
                            examples_tabs['prefix'] = `api-item${item_index}-operation-${index}-examples-tab`;
                            examples_tabs['active_index'] = 0;
                            operation_list += create_tabs(examples_tabs);
                        }
                    });

                    if (operation_list === "") {
                        operation_list = "Nothing";
                    }

                    api_description_html += operation_list;
                });
                api_description.innerHTML = api_description_html;
            }

            get({
                url: api_docs.basePath + path,
                dataType: "json"
            }).done(function (data) {
                drawApi(data);
            }).fail(function () {
                api_description.innerHTML = '';
            });
        }
    }
;

init();