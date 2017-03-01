/**
 * Created by meanmail on 25.02.17.
 */

window.stepik = {
    getCurrentUser: function () {
        return this.getJson("api/stepics/1");
    },

    getJson: function (url) {
        var access_token = $.cookie("access_token");
        var token_type = $.cookie("token_type");

        return $.get({
            url: "https://stepik.org/" + url,
            dataType: "json",
            headers: {
                "Authorization": token_type + " " + access_token
            }
        });
    },

    postJson: function (url, data) {
        var access_token = $.cookie("access_token");
        var token_type = $.cookie("token_type");

        return $.post({
            url: "https://stepik.org/" + url,
            dataType: "json",
            data: JSON.stringify(data),
            headers: {
                "Authorization": token_type + " " + access_token
            },
            contentType: "application/json; charset=UTF-8"
        })
    },

    getMembers: function (group) {
        return this.getJson("api/members?group=" + group);
    },

    addMembers: function (group, user) {
        return this.postJson("api/members", {
            member: {
                group: group,
                user: user
            }
        });
    },

    getCourse: function (course_id) {
        return this.getJson("api/courses/" + course_id);
    },

    authorize: function (state, code) {
        var redirect_uri = "http://apps.stepik.org";
        var client_id = "gTUqSYtRjiT9wnrmCYEWKDR2ZfeDOcdlNN8Q0Avc";
        if (!code) {
            state = state || location.origin;
            var encoded_state = btoa(state + "::" + Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000);
            $.cookie("state", encoded_state);
            window.location.href = "https://stepik.org/oauth2/authorize/" +
                "?client_id=" + client_id +
                "&redirect_uri=" + redirect_uri +
                "&scope=write" +
                "&state=" + encoded_state +
                "&response_type=code";
        } else {
            return $.post({
                url: "https://stepik.org/oauth2/token/",
                dataType: "json",
                data: {
                    grant_type: "authorization_code",
                    client_id: client_id,
                    code: code,
                    redirect_uri: redirect_uri
                }
            }).done(function (data) {
                if (!!state && state == decodeURIComponent($.cookie("state"))) {
                    var expires = data.expires_in;
                    $.cookie("access_token", data.access_token, {expires: expires});
                    $.cookie("refresh_token", data.refresh_token, {expires: expires});
                    $.cookie("token_type", data.token_type, {expires: expires});
                    $.cookie("scope", data.scope, {expires: expires});
                    var decoded_state = atob(state);
                    var separator_pos = decoded_state.indexOf("::");
                    location.href = decoded_state.substring(0, separator_pos)
                } else {
                    location.href = location.origin;
                }
            });
        }
    }
};