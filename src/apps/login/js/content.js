/**
 * Created by meanmail on 22.02.17.
 */
;'use strict';

(function () {
    var APP_ID = "login";

    function init(redirect_app) {
        $(".authorize").click(function () {
            if (!!redirect_app) {
                stepik.authorize(location.origin + "?app=" + redirect_app);
            } else {
                stepik.authorize();
            }
        });

        function setFailText(text) {
            $("#login_message").text(text)
                .addClass("login_fail")
                .removeClass("login_success");
        }

        function setSuccessText(text) {
            $("#login_message").text(text)
                .removeClass("login_fail")
                .addClass("login_success");
        }

        if (!!redirect_app) {
            var app_name = apps.applications[redirect_app].name;
            setSuccessText("Application '" + app_name + "' require authentication on Stepik.org");
        }
    }

    apps.applications[APP_ID].init = init;
})();