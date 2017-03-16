/**
 * Created by meanmail on 22.02.17.
 */
;'use strict';

window.extensions.register("login", new function () {
    var EXT_ID = "login";
    var domains = [
        "https://stepik.org/",
        "https://dev.stepik.org/",
        "https://release.stepik.org/",
        "https://sb.stepic.org/"
    ];

    this.init = function (redirect_ext) {
        var domain_selector = $("#domain_selector");
        domains.forEach(function (domain) {
            domain_selector.append("<option value='" + domain + "'>" + domain + "</option>");
        });
        domain_selector.val(stepik.host);

        $(".authorize").click(function () {
            stepik.host = domain_selector.val();

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