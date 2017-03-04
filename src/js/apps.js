/**
 * Created by meanmail on 22.02.17.
 */
window.apps = new function () {
    'use strict';
    var widgets = window.widgets = {};
    var title = "Stepik Apps";

    var params = getParams();

    this.getParam = function (name) {
        return params[name];
    };

    function loadWidget(name) {
        $.ajax({
            url: 'widgets/' + name + '/template.html',
            dataType: "html",
            success: function (data) {
                var widget = widgets[name] = {};
                widget.template = data;
                $("head").append("<link rel='stylesheet' type='text/css' href='widgets/" + name + "/css/template.css'>")
            }
        });
    }

    loadWidget("app");
    loadWidget("appheader");

    $(document).ready((function (apps) {
        return function () {
            $.ajax({
                url: 'apps/apps.json',
                dataType: "json"
            }).done(function (data) {
                apps.applications = data.applications;
                apps.categories = data.categories;

                initCategories(apps);

                if (!apps.getParam("app")) {
                    var category = apps.getParam("category");
                    drawApplications(apps, category);
                } else {
                    loadApplication(apps, apps.getParam("app"));
                }
            });

            updateUserName();
        }
    })(this));

    function initCategories(apps) {
        var categories = $("#categories");
        apps.categories.forEach(function (item) {
            categories.append("<li><div class='category' category_id='" + item.id + "'>" + item.name + "</div></li>");
        });

        $(".category").click(function (event) {
            var id = event.currentTarget.getAttribute("category_id");
            location.href = location.origin + (id == "undefined" ? "" : "?category=" + id);
        });
    }

    updateUserName();

    function drawApplications(apps, category) {
        var content = $("#content");
        content.empty();
        category = parseInt(category);

        for (var appId in apps.applications) {
            var app = apps.applications[appId];

            if (app.disabled) {
                continue;
            }

            if (!isNaN(category) && app.categories.indexOf(category) == -1) {
                continue;
            }

            content.append(processTemplate("${widget.app}", app));
        }

        $(".app").click(function (event) {
            var id = event.currentTarget.getAttribute("app_id");
            location.search = "?app=" + id;
        });

        $("title").text(title);
        updateUserName();
    }

    function loadApplication(apps, id, redirect_app) {
        var content = $("#content");
        content.empty();

        var app = apps.applications[id];

        if (!app) {
            return;
        }

        if (app.need_authorization && $.cookie("access_token") == null) {
            loadApplication(apps, "login", id);
            return;
        }

        if (!app.content) {
            $.ajax({
                url: 'apps/' + app.id + '/content.html',
                dataType: "html",
                success: function (data) {
                    var head = $("head");
                    head.append("<link rel='stylesheet' type='text/css' href='apps/" + app.id + "/css/content.css'>");
                    head.append("<script src='apps/" + app.id + "/js/content.js'>");

                    app.content = data;
                    content.append(processTemplate("${widget.appheader} ${content}", app));
                    app.init(redirect_app);
                }
            });
        } else {
            content.append(processTemplate("${widget.appheader} ${content}", app));
            app.init(redirect_app);
        }

        $("title").text(title + " - " + app.name);
        updateUserName();
    }

    function updateUserName() {
        function setAnonymousUser() {
            $("#user-name").html("<a class='authorize' href='javascript:void(0)'>Sign in</a>");
            $("#user-avatar").attr("src", "img/default_avatar.png");
            $(".authorize").click(function () {
                stepik.authorize(location.origin);
            });
        }

        if ($.cookie("access_token") != null) {
            stepik.getCurrentUser().done(function (data) {
                var user = data.users[0];

                if (!user.is_guest) {
                    var first_name = user.first_name;
                    var last_name = user.last_name;
                    $("#user-name").text((first_name + " " + last_name).trim());
                    $("#user-avatar").attr("src", user.avatar);
                } else {
                    $.removeCookie('access_token', {path: '/'});
                    setAnonymousUser();
                }
            });
        } else {
            setAnonymousUser();
        }
    }

    function processTemplate(template, map) {
        var fields;

        while ((fields = template.match(".*\\$\\{widget.([^${}]*)}.*")) != null) {
            var field = fields[1];
            var widget = widgets[field];
            var widget_template;

            if (!!widget) {
                widget_template = widget.template;
            } else {
                widget_template = "";
            }
            template = template.replace("${widget." + field + "}", widget_template);
        }

        while ((fields = template.match(".*\\$\\{([^${}]*)}.*")) != null) {
            field = fields[1];
            template = template.replace("${" + field + "}", map[field]);
        }

        return template;
    }

    function getParams() {
        var params = {};

        var parts = window.location.search.substr(1).split("&");

        for (var index in parts) {
            var pair = parts[index].split("=");
            params[pair[0]] = decodeURIComponent(pair[1]);
        }

        if (!!params["code"]) {
            stepik.authorize(params["state"], params["code"]);
        }

        return params;
    }
};