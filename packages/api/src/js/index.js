import {swagger} from "swagger";
import {$} from "../../imports/libs/jquery";

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
            newLi.innerText = api_item.path;
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
            data.apis.forEach(function (item, item_index) {
                item.operation_list = "";

                function getValues(type, parameter) {
                    let values = [];
                    if (!!parameter.minimum) {
                        values.push("minimum: " + parameter.minimum);
                    }

                    if (!!parameter.maximum) {
                        values.push("maximum: " + parameter.maximum);
                    }

                    if (!!parameter.uniqueItems) {
                        values.push("Unique items");
                    }

                    if (type === "enum" || type === "choice") {
                        values.push(parameter.enum.join(", "));
                    }

                    return values.join("<br>");
                }

                function getParams(parameters, show_location) {
                    let params = "";
                    if (!!parameters) {
                        for (let id in parameters) {
                            let parameter = parameters[id];
                            let required = parameter.required ? "*" : "";
                            let type = parameter.type || parameter.dataType || parameter["$ref"];
                            let values = getValues(type, parameter);
                            let defaultValue = parameter.defaultValue ? parameter.defaultValue : "";
                            let format = parameter.format ? parameter.format : "";
                            let description = parameter.description ? parameter.description : "";
                            params += "<tr>";
                            params += "<td>" + required + "</td>";
                            params += "<td>" + (parameter.name || id) + "</td>";
                            params += "<td>" + type + "</td>";
                            params += "<td>" + format + "</td>";
                            params += "<td class='api-parameter-values'>" + values + "</td>";
                            params += "<td>" + defaultValue + "</td>";
                            if (show_location) {
                                params += "<td>" + parameter.paramType + "</td>";
                            }
                            params += "<td>" + description + "</td>";
                            params += "</tr>\n";
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
                    let request = operation.method + " " + operation.path + " HTTP/1.1<br>";
                    request += "Host: " + operation.basePath;


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
                        let property = properties_list[name];
                        let value;
                        let type = property.type;
                        if (swagger.isPrimitive(type)) {
                            let typePresentation = getPrimitivePresentation(type);
                            let format = type === "string" ? type : property.format;
                            let defValue = property.defaultValue;
                            if (typeof defValue === "object") {
                                defValue = JSON.stringify(defValue, ' ', 4);
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

                function getModels(models) {
                    let result = "";
                    for (let id in models) {
                        result += "<b>" + id + "</b><br>";
                        result += "<table class='api-params'>";
                        result += "<tr>";
                        result += "<th>*</th>";
                        result += "<th>Name</th>";
                        result += "<th>Type</th>";
                        result += "<th>Format</th>";
                        result += "<th>Values</th>";
                        result += "<th>Default value</th>";
                        result += "<th>Description</th>";
                        result += "</tr>";
                        result += getParams(models[id].properties);
                        result += "</table>";
                        result += "<br>";
                    }

                    return result;
                }

                item.operations.forEach(function (operation, index) {
                    operation.path = item.path;
                    operation.basePath = data.basePath;
                    operation.params = getParams(operation.parameters, true);
                    operation.item_index = item_index;
                    operation.index = index;
                    operation.responseMessages = getResponseMessages(operation);
                    operation.request = getRequest(operation);
                    operation.response = getResponse(operation, data.models);
                    operation.models = getModels(data.models);
                    operation.example_tabs = "";
                    operation.example_panels = "";

                    let example = examples[operation.path];

                    if (!!example) {
                        for (let tab_name in example) {
                            let panel_id = "api-item${item_index}-operation${index}-examples-tab_name";
                            operation.example_tabs += "<div class='tab' data-panel-id='" + panel_id + "'>" + tab_name + "</div>";
                            let data_path = example[tab_name].filename;
                            operation.example_panels += "<div class='panel' id='" + panel_id + "' data-path='" + data_path + "'></div>";
                        }
                    }
                    item.operation_list += extensions.processTemplate("${widget.api-operation}", operation);
                });

                if (item.operation_list === "") {
                    item.operation_list = "Nothing";
                }

                let description = extensions.processTemplate("${widget.api-description}", item);
                api_description.append(description);
            });

            $('.panel').on('panelShow', function (event) {
                let target = event.currentTarget;
                if (target !== this) {
                    return;
                }
                let url = target.getAttribute("data-path");
                if (!url) {
                    return;
                }
                get({
                    url: url
                }).done(function (data) {
                    $(target).text(data);
                }).fail(function () {
                    $(target).text("Not Found");
                });
            });

            $(".tab").click(function (event) {
                let target = event.currentTarget;
                if (target !== this) {
                    return;
                }
                let panel_id = target.getAttribute("data-panel-id");

                $(target).parent(".tabs").find(".tab").each(function (index, tab) {
                    $(tab).removeClass("tab-active");
                    let panel = tab.getAttribute("data-panel-id");
                    $("#" + panel).hide();
                });
                $(target).addClass("tab-active");
                let panel = $("#" + panel_id);
                panel.show();
                panel.trigger("panelShow")
            });

            $(".tabs .tab:first-child").trigger("click");
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
};

init();