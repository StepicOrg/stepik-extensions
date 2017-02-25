/**
 * Created by meanmail on 22.02.17.
 */
;'use strict';

(function () {
    var APP_ID = "login";

    function init(redirect_app) {
        function redirect() {
            if (!!redirect_app) {
                window.location.search = "?app=" + redirect_app;
            }
        }

        $("#login_authorize").click(function () {
            var $login = $("input[name='login_login']");
            var $password = $("input[name='login_password']");

            if ($login.val() == "" || $password.val() == "") {
                setFailText("Логин и пароль не должны быть пустыми");
            } else {
                setSuccessText("");

                $.ajax(
                    {
                        type: "POST",
                        url: "https://stepik.org/oauth2/token/",
                        dataType: "json",
                        data: {
                            grant_type: "password",
                            client_id: "esNyQL3gPJ4elFrT4psBmbQ68i7eedhUgIxk5iEY",
                            username: $login.val(),
                            password: $password.val()
                        },
                        success: function (data) {
                            var expires = data.expires_in;
                            $.cookie("access_token", data.access_token, {expires: expires});
                            $.cookie("refresh_token", data.refresh_token, {expires: expires});
                            $.cookie("token_type", data.token_type, {expires: expires});
                            $.cookie("scope", data.scope, {expires: expires});
                            redirect();
                            setSuccessText("Ok!");
                        }
                    }
                ).fail(function () {
                    setFailText("Неверный логин или пароль");
                });
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
            setSuccessText("Приложение '" + apps.applications[redirect_app].name + "' требует аутентификации на Stepik.org");
        }
    }

    apps.applications[APP_ID].init = init;
})();