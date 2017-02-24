/**
 * Created by meanmail on 25.02.17.
 */

window.stepik = {
    getCurrentUser: function (success) {
        var access_token = $.cookie("access_token");
        var token_type = $.cookie("token_type");

        $.get({
            url: "https://stepik.org/api/stepics/1",
            dataType: "json",
            headers: {
                "Authorization": token_type + " " + access_token
            },
            success: function (data) {
                var user = data.users[0];
                success(user);
            }
        })
    }
};