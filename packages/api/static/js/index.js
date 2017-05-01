define(["exports", "swagger", "../../imports/js/jquery", "components_factory"], function (exports, _swagger, _jquery, _components_factory) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.init = undefined;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var init = exports.init = function init() {
        var get = _jquery.$.get;


        var api_docs = { apis: [] };
        var examples = {};
        get({
            url: "examples/examples.json",
            dataType: "json"
        }).done(function (data) {
            examples = data.examples;
            _swagger.swagger.getApiDocs("https://stepik.org/api/docs/api-docs/").done(function (data) {
                api_docs = data;
                paint();
            }).fail(function () {
                api_docs = { apis: [] };
                paint();
            });
        });

        function paint() {
            var api_list = document.querySelector("#api-list");

            api_list.innerHTML = "";

            api_docs.apis.forEach(function (api_item) {
                var title = api_item.description ? api_item.description : "";
                var newLi = document.createElement('li');
                var a = document.createElement('a');
                a.innerText = api_item.path;
                a.setAttribute('href', '#');
                newLi.appendChild(a);
                newLi.setAttribute('class', 'api-path');
                newLi.setAttribute('title', title);
                api_list.appendChild(newLi);
            });

            var elements = document.getElementsByClassName('api-path');
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var element = _step.value;

                    element.addEventListener("click", doApiPathClick);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }

        function doApiPathClick(event) {
            var target = event.currentTarget;
            if (target !== this) {
                return;
            }

            var path = target.innerText;
            var api_description = document.querySelector("#api-description");

            function drawApi(data) {
                api_description.innerHTML = '';
                var api_description_html = '';

                data.apis.forEach(function (item, item_index) {
                    if (item['operations'].length === 0) {
                        return;
                    }
                    var operation_list = "<h2>" + item.description + "</h2>";

                    function getValues(type, parameter) {
                        var values = [];
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
                        var params = '';
                        if (!!parameters) {
                            for (var id in parameters) {
                                if (!parameters.hasOwnProperty(id)) {
                                    continue;
                                }
                                var parameter = parameters[id];
                                var required = parameter.required ? "*" : "";
                                var type = parameter.type || parameter.dataType || parameter["$ref"];
                                var values = getValues(type, parameter);
                                var defaultValue = parameter.defaultValue ? parameter.defaultValue : "";
                                var format = parameter.format ? parameter.format : "";
                                var description = parameter.description ? parameter.description : "";
                                var name = parameter.name || id;
                                params += "<tr>\n                                    <td>" + required + "</td>\n                                    <td>" + name + "</td>\n                                    <td>" + type + "</td>\n                                    <td>" + format + "</td>\n                                    <td class='api-parameter-values'>" + values + "</td>\n                                    <td>" + defaultValue + "</td>\n                                    ";

                                if (show_location) {
                                    params += "<td>" + parameter['paramType'] + "</td>";
                                }

                                params += "<td>" + description + "</td>\n                                        </tr>\n                                    ";
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
                            });
                        }
                        return responseMessages.length > 0 ? responseMessages.join("<br><br>") : "No error response defined";
                    }

                    function getRequest(operation) {
                        var request = operation.method + " " + item.path + " HTTP/1.1<br>";
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
                        if (_swagger.swagger.isPrimitive(dataType)) {
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
                            if (!properties_list.hasOwnProperty(name)) {
                                continue;
                            }
                            var property = properties_list[name];
                            var value = void 0;
                            var type = property.type;
                            if (_swagger.swagger.isPrimitive(type)) {
                                var typePresentation = getPrimitivePresentation(type);
                                var format = type === "string" ? type : property.format;
                                var defValue = property.defaultValue;
                                if ((typeof defValue === "undefined" ? "undefined" : _typeof(defValue)) === "object") {
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
                        return presentation;
                    }

                    function getResponse(operation, models) {
                        return "<code><pre>" + getModelPresentation(models, operation.type) + "</pre></code>";
                    }

                    function getModels(models, show_location) {
                        var result = "";
                        for (var id in models) {
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
                        operation_list += "\n                        <div class=\"api-item-operation\">\n                            <div class=\"api-item-method api-item-method-" + operation.method + "\">" + operation.method + "</div>\n                            <div class=\"api-item-path\">" + data.basePath + item.path + "</div>\n                        </div>\n                        <div class=\"api-item-notes\">" + operation['notes'] + "</div>\n                        ";

                        var operation_tabs = [{
                            caption: 'Parameters',
                            content: getModels({
                                'Parameters': {
                                    properties: operation['parameters']
                                }
                            }, true)
                        }, {
                            caption: 'Request',
                            content: getRequest(operation)
                        }, {
                            caption: 'Response',
                            content: getResponse(operation, data.models)
                        }, {
                            caption: 'Error code',
                            content: getResponseMessages(operation)
                        }, {
                            caption: 'Models',
                            content: getModels(data.models)
                        }];
                        operation_tabs['prefix'] = "api-item" + item_index + "-operation-" + index + "-";
                        operation_tabs['active_index'] = 0;

                        operation_list += (0, _components_factory.create_tabs)(operation_tabs);

                        var example = examples[item.path];

                        if (!!example) {
                            var examples_tabs = [];
                            for (var caption in example) {
                                if (!example.hasOwnProperty(caption)) {
                                    continue;
                                }
                                examples_tabs.push({
                                    caption: caption,
                                    content: example[caption].filename
                                });
                            }
                            examples_tabs['prefix'] = "api-item" + item_index + "-operation-" + index + "-examples-tab";
                            examples_tabs['active_index'] = 0;
                            operation_list += (0, _components_factory.create_tabs)(examples_tabs);
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
    };

    init();
});