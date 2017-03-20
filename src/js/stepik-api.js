/**
 * Created by meanmail on 25.02.17.
 */
(function () {
    'use strict';

    function UnPagination(field, query, limit) {
        var status = "pending";
        var members = [];
        var page_count = 0;
        limit = limit || 10;
        getPage(1, this);

        function getPage(page) {
            page_count++;
            if (page_count > limit) {
                done();
            }

            query(page)
                .done(function (data) {
                    members = members.concat(data[field]);
                    if (data.meta.has_next) {
                        getPage(++page);
                    } else {
                        done();
                    }
                })
                .fail(fail)
        }

        var onDone = [];
        var onFail = [];
        var onAlways = [];

        function done() {
            onDone.forEach(function (fulfilled) {
                fulfilled(members);
            });
            always();
            status = "fulfilled";
        }

        function fail() {
            onFail.forEach(function (rejected) {
                rejected(members);
            });
            always();
            status = "rejected";
        }

        function always() {
            onAlways.forEach(function (always) {
                always(members);
            });
        }

        this.done = function (done) {
            if (status == "fulfilled") {
                done(members);
            } else if (status == "pending") {
                onDone.push(done);
            }
            return this;
        };

        this.fail = function (fail) {
            if (status == "rejected") {
                fail(members);
            } else if (status == "pending") {
                onFail.push(fail);
            }

            return this;
        };

        this.always = function (always) {
            if (status == "fulfilled" || status == "rejected") {
                always(members);
            } else if (status == "pending") {
                onAlways.push(always);
            }

            return this;
        };
    }

    window.stepik = {
        _host: null,
        getHost: function () {
            if (!this._host) {
                this._host = $.cookie("stepik.host");

                if (!this._host) {
                    this._host = "https://stepik.org/";
                    $.cookie("stepik.host", this._host)
                }
            }
            return this._host;
        },

        setHost: function (host) {
            this._host = host;
            $.cookie("stepik.host", this._host)
        },

        getCurrentUser: function () {
            return this.getJson("api/stepics/1");
        },

        getJson: function (url) {
            var access_token = $.cookie("access_token");
            var token_type = $.cookie("token_type");

            return $.get({
                url: this.getHost() + url,
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
                url: this.getHost() + url,
                dataType: "json",
                data: JSON.stringify(data),
                headers: {
                    "Authorization": token_type + " " + access_token
                },
                contentType: "application/json; charset=UTF-8"
            })
        },

        getCourses: function (enrolled, teacher) {
            var params = (!!enrolled ? "enrolled=true&" : "");
            params += (!!teacher ? "teacher=" + teacher + "&" : "");
            return new UnPagination("courses",
                (function (context) {
                    return function (page) {

                        return context.getJson("api/courses?" + params + "page=" + page);
                    };
                })(this));
        },

        getLessons: function (enrolled, teacher) {
            var params = (!!enrolled ? "enrolled=true&" : "");
            params += (!!teacher ? "teacher=" + teacher + "&" : "");
            return new UnPagination("lessons",
                (function (context) {
                    return function (page) {

                        return context.getJson("api/lessons?" + params + "page=" + page);
                    };
                })(this));
        },

        getMembers: function (group) {
            return new UnPagination("members",
                (function (context) {
                    return function (page) {
                        return context.getJson("api/members?group=" + group + "&page=" + page);
                    }
                })(this));
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
            var redirect_uri = location.origin;
            var client_id = "gTUqSYtRjiT9wnrmCYEWKDR2ZfeDOcdlNN8Q0Avc";
            if (!code) {
                state = state || location.origin;
                var encoded_state = btoa(state + "::" + Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000);
                $.cookie("state", encoded_state);
                window.location.href = this.getHost() + "oauth2/authorize/" +
                    "?client_id=" + client_id +
                    "&redirect_uri=" + redirect_uri +
                    "&scope=write" +
                    "&state=" + encoded_state +
                    "&response_type=code";
            } else {
                return $.post({
                    url: this.getHost() + "oauth2/token/",
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
        },

        logout: function () {
            $.cookie("access_token", null);
            $.cookie("refresh_token", null);
            $.cookie("token_type", null);
            $.cookie("scope", null);
        }
    };
})();