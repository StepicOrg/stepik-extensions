/**
 * Created by meanmail on 22.02.17.
 */
window.extensions = new function () {
    'use strict';
    var widgets = this.widgets = {};
    var title = "Stepik Extensions";

    var params = getParams();

    this.getParam = function (name) {
        return params[name];
    };

    var extensions = {};
    var categories = {};

    this.register = function (id, ext) {
        var extension = extensions[id] || {};
        extension.init = ext.init;
        extensions[id] = extension;
    };

    this.getExtension = function (id) {
        return extensions[id];
    };

    function loadWidget(path, name) {
        $.ajax({
            url: path + "/" + name + '/template.html',
            dataType: "html",
            success: function (data) {
                var widget = widgets[name] = {};
                widget.template = data;
                $("head").append("<link rel='stylesheet' type='text/css' href='" + path + "/" + name + "/css/template.css'>")
            }
        });
    }

    loadWidget("widgets", "ext");
    loadWidget("widgets", "extheader");

    $(document).ready((function (exts) {
        return function () {
            $.ajax({
                url: 'exts/exts.json',
                dataType: "json"
            }).done(function (data) {
                extensions = data.extensions;
                categories = data.categories;

                initCategories();

                var ext_param = exts.getParam("ext");
                if (!ext_param) {
                    var category = exts.getParam("category");
                    drawExtensions(exts, category);
                } else {
                    loadExtension(exts, ext_param);
                }
            });

            updateUserName();
        }
    })(this));

    function initCategories() {
        var $categories = $("#categories");
        categories.forEach(function (item) {
            $categories.append("<li><div class='category' category_id='" + item.id + "'>" + item.name + "</div></li>");
        });

        $(".category").click(function (event) {
            var id = event.currentTarget.getAttribute("category_id");
            location.href = location.origin + (id == "undefined" ? "" : "?category=" + id);
        });
    }

    updateUserName();

    function drawExtensions(exts, category) {
        var content = $("#content");
        content.empty();
        category = parseInt(category);

        for (var extId in extensions) {
            var extension = exts.getExtension(extId);

            if (extension.disabled) {
                continue;
            }

            if (extension.hidden) {
                continue;
            }

            if (!isNaN(category) && extension.categories.indexOf(category) == -1) {
                continue;
            }

            content.append(exts.processTemplate("${widget.ext}", extension));
        }

        $(".ext").click(function (event) {
            var id = event.currentTarget.getAttribute("ext_id");
            location.search = "?ext=" + id;
        });

        $("title").text(title);
        updateUserName();
    }

    function loadExtension(exts, id, call_stack) {
        if (id == "logout") {
            stepik.logout();
            location.href = exts.getParam("redirect") || "/";
            return;
        }
        var content = $("#content");
        content.empty();

        call_stack = call_stack || [];
        call_stack.unshift(id);

        var extension = exts.getExtension(id);

        if (!extension) {
            loadExtension(exts, "unknown", call_stack);
            return;
        }

        if (extension.disabled) {
            if (call_stack.length > 1) {
                loadExtension(call_stack[1], call_stack.slice(2))
            } else {
                location.href = "/";
            }
            return;
        }

        if (extension.need_authorization && $.cookie("access_token") == null) {
            loadExtension(exts, "login", call_stack);
            return;
        }

        function initExtension() {
            extension.caller = call_stack[1];
            content.append(exts.processTemplate("${widget.extheader} ${content}", extension));
            extension.init(call_stack);
        }

        if (!extension.content) {
            $.ajax({
                url: 'exts/' + extension.id + '/content.html',
                dataType: "html",
                success: function (data) {
                    var head = $("head");
                    head.append("<link rel='stylesheet' type='text/css' href='exts/" + extension.id + "/css/content.css'>");
                    head.append("<script src='exts/" + extension.id + "/js/content.js'>");

                    if (!!extension.widgets) {
                        extension.widgets.forEach(function (widget_id) {
                            loadWidget("exts/" + extension.id + "/widgets/", widget_id);
                        });
                    }
                    extension.content = data;
                    initExtension();
                }
            });
        } else {
            initExtension();
        }

        $("title").text(title + " - " + extension.name);
        updateUserName();
    }

    function updateUserName() {
        function setAnonymousUser() {
            $("#user-name").html("<a class='authorize' href='/?ext=login'>Sign in</a>");
            $("#user-avatar").attr("src", "img/default_avatar.png");
        }

        $("#user-logout").hide();

        if ($.cookie("access_token") != null) {
            stepik.getCurrentUser().done(function (data) {
                var user = data.users[0];

                if (!user.is_guest) {
                    var first_name = user.first_name;
                    var last_name = user.last_name;
                    $("#user-name").text((first_name + " " + last_name).trim());
                    $("#user-host").text("@" + stepik.getHost());
                    $("#user-avatar").attr("src", user.avatar);
                    $("#user-logout").show();
                } else {
                    $.removeCookie('access_token', {path: '/'});
                    setAnonymousUser();
                }

                $.cookie("last_user_id", user.id);
            });
        } else {
            setAnonymousUser();
        }
    }

    this.processTemplate = function (template, map) {
        var fields;

        while ((fields = template.match(".*\\$\\{widget.([^${}]*)}.*")) != null) {
            var field = fields[1];
            var widget = this.widgets[field];
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
    };

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