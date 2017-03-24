/**
 * Created by meanmail on 10.03.17.
 */

;'use strict';

window.extensions.register("api", new function () {
    var EXT_ID = "api";
    var api_docs = {apis: []};
    var examples = {};

    var swaggerUtils = new function () {
        this.getApiDocs = function (url) {
            return $.get({
                url: url,
                dataType: "json"
            });
        };

        var PRIMITIVES = ["integer", "boolean", "number", "string", "void", "datetime", "choice",
            "object", "array", "float", "file upload", "url", "decimal", "email"];

        this.isPrimitive = function (type) {
            return PRIMITIVES.indexOf(type) != -1;
        }
    };

    this.init = function () {
        $.get({
            url: "exts/" + EXT_ID + "/examples/examples.json",
            dataType: "json"
        }).done(function (data) {
            examples = data.examples;
            swaggerUtils.getApiDocs("https://stepik.org/api/docs/api-docs/")
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
            var api_list = $("#api-list");

            api_list.empty();

            api_docs.apis.forEach(function (api_item) {
                var title = api_item.description ? "title=" + api_item.description : "";
                api_list.append("<li class='api-path' " + title + ">" + api_item.path + "</li>");
            });

            $(".api-path").click(function (event) {
                var target = event.currentTarget;
                if (target != this) {
                    return;
                }

                var path = $(target).text();
                var api_description = $("#api-description");

                function drawApi(data) {
                    api_description.empty();
                    data.apis.forEach(function (item, item_index) {
                        item.operation_list = "";

                        function getValues(type, parameter) {
                            var values = [];
                            if (!!parameter.minimum) {
                                values.push("minimum: " + parameter.minimum);
                            }

                            if (!!parameter.maximum) {
                                values.push("maximum: " + parameter.maximum);
                            }

                            if (!!parameter.uniqueItems) {
                                values.push("Unique items");
                            }

                            if (type == "enum" || type == "choice") {
                                values.push(parameter.enum.join(", "));
                            }

                            return values.join("<br>");
                        }

                        function getParams(parameters, show_location) {
                            var params = "";
                            if (!!parameters) {
                                for (var id in parameters) {
                                    var parameter = parameters[id];
                                    var required = parameter.required ? "*" : "";
                                    var type = parameter.type || parameter.dataType || parameter["$ref"];
                                    var values = getValues(type, parameter);
                                    var defaultValue = parameter.defaultValue ? parameter.defaultValue : "";
                                    var format = parameter.format ? parameter.format : "";
                                    var description = parameter.description ? parameter.description : "";
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
                            var responseMessages = [];

                            if (!!operation.responseMessages) {
                                operation.responseMessages.forEach(function (responseMessage) {
                                    responseMessages.push("Code: " + responseMessage.code + "<br>");
                                    responseMessages.push("Message: " + responseMessage.message);
                                })
                            }
                            return responseMessages.length > 0 ? responseMessages.join("<br><br>") : "No error response defined";
                        }

                        function getRequest(operation) {
                            var request = operation.method + " " + operation.path + " HTTP/1.1<br>";
                            request += "Host: " + operation.basePath;


                            return request;
                        }

                        function getPrimitivePresentation(type) {
                            if (type == "array") {
                                return "[]";
                            }
                            if (type == "object") {
                                return "{}";
                            }

                            return "<b>" + type + "</b>";
                        }

                        function getModelPresentation(models, dataType, level) {
                            if (swaggerUtils.isPrimitive(dataType)) {
                                return getPrimitivePresentation(dataType);
                            }
                            var model = models[dataType];
                            if (!model) {
                                console.log(dataType);
                            }
                            level = level ? level : 0;
                            var base_indent = new Array(level * 4).join(" ");
                            var presentation = "{\n";
                            var indent = base_indent + new Array(4).join(" ");

                            var properties_list = model.properties;
                            var properties = [];
                            for (var name in properties_list) {
                                var property = properties_list[name];
                                var value;
                                var type = property.type;
                                if (swaggerUtils.isPrimitive(type)) {
                                    var typePresentation = getPrimitivePresentation(type);
                                    var format = type == "string" ? type : property.format;
                                    var defValue = property.defaultValue;
                                    if (typeof defValue == "object") {
                                        defValue = JSON.stringify(defValue, ' ', 4);
                                    } else if (!!defValue && (type == "string" || format == "string")) {
                                        defValue = '"' + defValue + '"';
                                    }

                                    defValue = defValue ? defValue : "";

                                    value = defValue + " (" + typePresentation;

                                    if (!!format && type != format) {
                                        value += " as " + format;
                                    }

                                    value += ")";
                                } else {
                                    value = getModelPresentation(models, type, level + 1);
                                }
                                properties.push(indent + '"' + name + '":' + value);
                            }

                            return presentation += properties.join(",\n") + "\n" + base_indent + "}"
                        }

                        function getResponse(operation, models) {
                            return "<code><pre>" + getModelPresentation(models, operation.type) + "</pre></code>";
                        }

                        function getModels(operation, models) {
                            var result = "";
                            for (var id in models) {
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
                            operation.models = getModels(operation, data.models);
                            operation.example_tabs = "";
                            operation.example_panels = "";

                            var example = examples[operation.path];
                            console.log(examples);
                            console.log(operation.path);
                            console.log(example);

                            if (!!example) {
                                for (var tab_name in example) {
                                    var panel_id = "api-item${item_index}-operation${index}-examples-tab_name";
                                    operation.example_tabs += "<div class='tab' data-panel-id='" + panel_id + "'>" + tab_name + "</div>";
                                    var data_path = example[tab_name].filename;
                                    operation.example_panels += "<div class='panel' id='" + panel_id + "' data-path='" + data_path + "'></div>";
                                }
                            }
                            item.operation_list += extensions.processTemplate("${widget.api-operation}", operation);
                        });

                        if (item.operation_list == "") {
                            item.operation_list = "Nothing";
                        }

                        var description = extensions.processTemplate("${widget.api-description}", item);
                        api_description.append(description);
                    });

                    $('.panel').on('panelShow', function (event) {
                        var target = event.currentTarget;
                        if (target != this) {
                            return;
                        }
                        var url = target.getAttribute("data-path");
                        if (!url) {
                            return;
                        }
                        $.get({
                            url: "exts/" + EXT_ID + "/" + url
                        }).done(function (data) {
                            $(target).text(data);
                        }).fail(function () {
                            $(target).text("Not Found");
                        });
                    });

                    $(".tab").click(function (event) {
                        var target = event.currentTarget;
                        if (target != this) {
                            return;
                        }
                        var panel_id = target.getAttribute("data-panel-id");

                        $(target).parent(".tabs").find(".tab").each(function (index, tab) {
                            $(tab).removeClass("tab-active");
                            var panel = tab.getAttribute("data-panel-id");
                            $("#" + panel).hide();
                        });
                        $(target).addClass("tab-active");
                        var panel = $("#" + panel_id);
                        panel.show();
                        panel.trigger("panelShow")
                    });

                    $(".tabs .tab:first-child").trigger("click");
                }

                $.get({
                    url: api_docs.basePath + path,
                    dataType: "json"
                }).done(function (data) {
                    drawApi(data);
                }).fail(function () {
                    api_description.empty();
                });
            });
        }

        $("#api-auth").click(function () {
            var api_description = $("#api-description");
            $.get({
                url: "exts/" + EXT_ID + "/oauth2.html",
                dataType: "html"
            }).done(function (data) {
                api_description.html(data);
            }).fail(function () {
                api_description.html("<h1>Authentication</h1>");
            });
        });
    }


});
