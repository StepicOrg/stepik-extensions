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
                api_list.append("<li class='api-path'>" + api_item.path + "</li>");
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
                    data.apis.forEach(function (item) {
                        var description = apps.processTemplate("${widget.api-description}", item);
                        api_description.append(description);
                    });
                }).fail(function () {
                    api_description.empty();
                });
            });
        }
    }
});
