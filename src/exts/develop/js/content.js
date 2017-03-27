/**
 * Created by meanmail on 27.03.17.
 */
;'use strict';

window.extensions.register("develop", new function () {
    var EXT_ID = "develop";
    var language = "ru";

    this.init = function () {
        $.get({
            url: "exts/" + EXT_ID + "/content." + language + ".html",
            dataType: "html"
        }).done(function (data) {
            $("." + EXT_ID + "-content").html(data);
        });
    };
});