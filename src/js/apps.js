/**
 * Created by meanmail on 22.02.17.
 */
'use strict';

var widgets = window.widgets = {};
var title = "Stepik Apps";

var params = [];

var parts = window.location.search.substr(1).split("&");

for (var index in parts) {
    var pair = parts[index].split("=");
    params[pair[0]] = pair[1];
}

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

function Apps() {
}

Apps.prototype.getApp = function (id) {
    return this.applications.filter(function (item) {
        return item.id == id;
    })[0];
};

$(document).ready(function () {
    $.ajax({
        url: 'apps/apps.json',
        dataType: "json",
        success: function (data) {
            window.apps = new Apps();
            apps.applications = data.applications;
            apps.categories = data.categories;

            initCategories();

            if (!(!!params["app"])) {
                drawApplications();
            } else {
                loadApplication(params["app"]);
            }
        }
    });
});

function initCategories() {
    apps.categories.forEach(function (item) {
        $("#categories").append("<li><div class='category' category_id='" + item.id + "'>" + item.name + "</div></li>");
    });

    $(".category").click(function (event) {
        var id = event.currentTarget.getAttribute("category_id");
        drawApplications(id);
        event.stopPropagation()
    });
}

function drawApplications(category) {
    var content = $("#content");
    content.empty();
    category = parseInt(category);

    apps.applications
        .filter(function (item) {
            return isNaN(category) || (item.categories.indexOf(category) != -1);
        })
        .forEach(function (item) {
            content.append(processTemplate("${widget.app}", item));
        });

    $(".app").click(openApplication);
    $("title").text(title);
    updateUserName();
}

function openApplication(event) {
    var id = event.currentTarget.getAttribute("app_id");
    loadApplication(id);
    event.stopPropagation()
}

function loadApplication(id, redirect_app) {
    var content = $("#content");
    content.empty();

    var app = apps.getApp(id);

    if (!!!app) {
        return;
    }

    if (app.need_authorization && $.cookie("access_token") == null) {
        loadApplication("login", app.id);
        return;
    }

    if (!!!app.content) {
        $.ajax({
            url: 'apps/' + app.id + '/content.html',
            dataType: "html",
            success: function (data) {
                app.content = data;
                content.append(processTemplate("${widget.appheader} ${content}", app));
                var head = $("head");
                head.append("<link rel='stylesheet' type='text/css' href='apps/" + app.id + "/css/content.css'>");
                head.append("<script src='apps/" + app.id + "/js/content.js'>");
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
    stepik.getCurrentUser(function (user) {
        var first_name = user.first_name;
        var last_name = user.last_name;
        $("#user-name").text((first_name + " " + last_name).trim());
        $("#user-avatar").attr("src", user.avatar);
    });
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