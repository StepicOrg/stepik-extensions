/**
 * Created by meanmail on 22.02.17.
 */
;'use strict';

window.extensions.register("login", new function () {
    var EXT_ID = "login";

    this.init = function (redirect_ext) {
        $(".authorize").click(function () {
            if (!!redirect_ext) {
                stepik.authorize(location.origin + "?ext=" + redirect_ext);
            } else {
                stepik.authorize();
            }
        });

        function setFailText(text) {
            $("#login_message").text(text)
                .addClass(EXT_ID + "_fail")
                .removeClass(EXT_ID + "_success");
        }

        function setSuccessText(text) {
            $("#login_message").text(text)
                .removeClass(EXT_ID + "_fail")
                .addClass(EXT_ID + "_success");
        }

        if (!!redirect_ext) {
            var ext_name = extensions.getExtension(redirect_ext).name;
            setSuccessText("Extension '" + ext_name + "' require authentication on Stepik.org");
        }
    };
});