/**
 * Created by meanmail on 22.02.17.
 */
;'use strict';

window.extensions.register("login", new function () {
    var EXT_ID = "login";

    this.init = function (call_stack) {
        var redirect_ext = call_stack[1];

        var domain_selector = $("#domain_selector");
        domain_selector.val(stepik.getHost());

        $(".authorize").click(function () {
            var domain = domain_selector.val();
            if (!validate(domain)) {
                return;
            }
            if (domain[domain.length - 1] !== '/') {
                domain += '/';
            }
            stepik.setHost(domain);

            if (!!redirect_ext) {
                stepik.authorize(location.origin + "?ext=" + redirect_ext);
            } else {
                stepik.authorize();
            }
        });

        function validate(url) {
            var pattern = /^(https?:\/\/)?([\w\.]+)\.([a-z]{2,6}\.?)(\/[\w\.]*)*\/?$/i;
            var valid = pattern.test(url);
            if (!valid) {
                setFailText("URL not valid. Check URL and try again. if you don't know then use https://stepik.org");
            } else {
                setSuccessText("URL is valid");
            }
            return valid;
        }

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