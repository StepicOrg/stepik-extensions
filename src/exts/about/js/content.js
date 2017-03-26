/**
 * Created by meanmail on 24.03.17.
 */
;'use strict';

window.extensions.register("about", new function () {
    var EXT_ID = "about";
    var language = "ru";

    this.init = function () {
        $.get({
            url: "exts/" + EXT_ID + "/content." + language + ".html",
            dataType: "html"
        }).done(function (data) {
            $(".about-content").html(data);
        });
    };
});