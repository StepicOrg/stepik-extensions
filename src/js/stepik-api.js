/**
 * Created by meanmail on 25.02.17.
 */

window.stepik = {
    getCurrentUser: function (success) {
        var access_token = $.cookie("access_token");
        var token_type = $.cookie("token_type");

        this.getJson("api/stepics/1", function (data) {
            var user = data.users[0];
            success(user);
        });
    },

    getJson: function (url, success) {
        var access_token = $.cookie("access_token");
        var token_type = $.cookie("token_type");

        $.get({
            url: "https://stepik.org/" + url,
            dataType: "json",
            headers: {
                "Authorization": token_type + " " + access_token
            }
        }).done(function (data) {
            success(data);
        });
    }
};