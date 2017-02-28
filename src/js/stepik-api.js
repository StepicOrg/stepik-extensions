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
    }
};