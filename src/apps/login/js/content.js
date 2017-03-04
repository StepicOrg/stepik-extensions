/**
 * Created by meanmail on 22.02.17.
 */
;'use strict';

window.apps.register("login", new function () {
    var APP_ID = "login";

    this.init = function (redirect_app) {
        $(".authorize").click(function () {
            if (!!redirect_app) {
                stepik.authorize(location.origin + "?app=" + redirect_app);
            } else {
                stepik.authorize();
            }
        });

        function setFailText(text) {
            $("#login_message").text(text)
                .addClass(APP_ID + "_fail")
                .removeClass(APP_ID + "_success");
        }

        function setSuccessText(text) {
            $("#login_message").text(text)
                .removeClass(APP_ID + "_fail")
                .addClass(APP_ID + "_success");
        }

        if (!!redirect_app) {
            var app_name = apps.applications[redirect_app].name;
            setSuccessText("Application '" + app_name + "' require authentication on Stepik.org");
        }
    };
});