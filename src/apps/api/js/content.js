/**
 * Created by meanmail on 10.03.17.
 */

;'use strict';

window.apps.register("api", new function () {
    var APP_ID = "api";
    var api_docs = {apis: []};

    this.init = function () {
        $.get({
            url: "https://stepik.org/api/docs/api-docs/",
            dataType: "json"
        }).done(function (data) {
            api_docs = data;
            paint();
        }).fail(function () {
            api_docs = {apis: []};
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

                $.get({
                    url: api_docs.basePath + path,
                    dataType: "json"
                }).done(function (data) {
                    api_description.empty();
                    data.apis.forEach(function (item, item_index) {
                        if (item.operations.length == 0) {
                            api_description.text("Nothing");
                            return;
                        }
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

                            if (type == "enum") {
                                values.push(parameter.enum.join(", "));
                            }

                            return values.join("<br>");
                        }

                        function getParams(operation) {
                            var params = "";
                            if (!!operation.parameters) {
                                operation.parameters.forEach(function (parameter) {
                                    var required = parameter.required ? "*" : "";
                                    var type = parameter.type || parameter.dataType || parameter["$ref"];
                                    var values = getValues(type, parameter);
                                    var defaultValue = parameter.defaultValue ? parameter.defaultValue : "";
                                    var format = parameter.format ? parameter.format : "";
                                    var description = parameter.description ? parameter.description : "";
                                    params += "<tr>";
                                    params += "<td>" + required + "</td>";
                                    params += "<td>" + parameter.name + "</td>";
                                    params += "<td>" + type + "</td>";
                                    params += "<td class='api-parameter-values'>" + values + "</td>";
                                    params += "<td>" + defaultValue + "</td>";
                                    params += "<td>" + format + "</td>";
                                    params += "<td>" + parameter.paramType + "</td>";
                                    params += "<td>" + description + "</td>";
                                    params += "</tr>\n";
                                });
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
                            return responseMessages.length > 0 ? responseMessages.join("<br><br>") : "Nothing";
                        }

                        item.operations.forEach(function (operation, index) {
                            operation.path = item.path;
                            operation.basePath = data.basePath;
                            operation.params = getParams(operation);
                            operation.item_index = item_index;
                            operation.index = index;
                            operation.responseMessages = getResponseMessages(operation);

                            item.operation_list += apps.processTemplate("${widget.api-operation}", operation);
                        });

                        var description = apps.processTemplate("${widget.api-description}", item);
                        api_description.append(description);

                    });


                    $(".api-item-section").click(function (event) {
                        var target = event.currentTarget;
                        if (target != this) {
                            return;
                        }
                        var item_index = target.getAttribute("item_index");
                        var operation_index = target.getAttribute("operation_index");
                        var index = target.getAttribute("index");

                        for (var i = 0; i <= 3; i++) {
                            var tab = $(".api-item" + item_index + "-sections-" + operation_index + " div:nth-child(" + (i + 1) + ")");
                            var tab_content = $("#api-item" + item_index + "-operation" + operation_index + "-" + i);
                            if (i == index) {
                                tab.addClass("api-active-section");
                                tab_content.show();
                            } else {
                                tab.removeClass("api-active-section");
                                tab_content.hide();
                            }
                        }
                    });
                }).fail(function () {
                    api_description.empty();
                });
            });
        }
    }
});
