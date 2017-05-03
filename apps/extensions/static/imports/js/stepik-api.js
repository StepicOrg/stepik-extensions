define(["exports", "../../imports/jquery/js/jquery", "../../imports/jquery/js/jquery.cookie"], function (exports, _jquery, _jquery2) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.stepik = undefined;
    var stepik = exports.stepik = function () {
        var _this2 = this;

        var get = _jquery.$.get,
            post = _jquery.$.post;


        var NO_LIMIT = 0;

        function UnPagination(field, query) {
            var _this = this;

            var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

            var status = "pending";
            var members = [];
            var page_count = 0;

            getPage(1, this);

            function getPage(page) {
                page_count++;
                if (limit > 0 && page_count > limit) {
                    done();
                }

                query(page).done(function (data) {
                    members = members.concat(data[field]);
                    if (data['meta']['has_next']) {
                        getPage(++page);
                    } else {
                        done();
                    }
                }).fail(fail);
            }

            var onDone = [];
            var onFail = [];
            var onAlways = [];

            function done() {
                onDone.forEach(function (fulfilled) {
                    return fulfilled(members);
                });
                always();
                status = "fulfilled";
            }

            function fail() {
                onFail.forEach(function (rejected) {
                    return rejected(members);
                });
                always();
                status = "rejected";
            }

            function always() {
                onAlways.forEach(function (always) {
                    return always(members);
                });
            }

            this.done = function (done) {
                if (status === "fulfilled") {
                    done(members);
                } else if (status === "pending") {
                    onDone.push(done);
                }
                return _this;
            };

            this.fail = function (fail) {
                if (status === "rejected") {
                    fail(members);
                } else if (status === "pending") {
                    onFail.push(fail);
                }

                return _this;
            };

            this.always = function (always) {
                if (status === "fulfilled" || status === "rejected") {
                    always(members);
                } else if (status === "pending") {
                    onAlways.push(always);
                }

                return _this;
            };
        }

        function asUriParams(parameters) {
            var params = "";
            for (var name in parameters) {
                if (!parameters.hasOwnProperty(name)) {
                    continue;
                }
                params += name + "=" + encodeURIComponent(parameters[name]) + "&";
            }
            return params;
        }

        return {
            getHost: function getHost() {
                var host = (0, _jquery2.cookie)("stepik.host");

                if (!host) {
                    host = "https://stepik.org/";
                }
                return host;
            },

            getCurrentUser: function getCurrentUser() {
                return _this2.getJson("api/stepics/1");
            },

            getJson: function getJson(url) {
                var access_token = (0, _jquery2.cookie)("access_token");
                var token_type = (0, _jquery2.cookie)("token_type");

                return get({
                    url: _this2.getHost() + url,
                    dataType: "json",
                    headers: {
                        "Authorization": token_type + " " + access_token
                    }
                });
            },

            postJson: function postJson(url, data) {
                var access_token = (0, _jquery2.cookie)("access_token");
                var token_type = (0, _jquery2.cookie)("token_type");

                return post({
                    url: _this2.getHost() + url,
                    dataType: "json",
                    data: JSON.stringify(data),
                    headers: {
                        "Authorization": token_type + " " + access_token
                    },
                    contentType: "application/json; charset=UTF-8"
                });
            },

            getCourses: function getCourses(parameters) {
                var params = asUriParams(parameters);
                return new UnPagination("courses", function (page) {
                    return _this2.getJson("api/courses?" + params + "page=" + page);
                });
            },

            getLessons: function getLessons(parameters) {
                var params = asUriParams(parameters);
                return new UnPagination("lessons", function (page) {
                    return _this2.getJson("api/lessons?" + params + "page=" + page);
                });
            },

            getCourseGrades: function getCourseGrades(course) {
                var params = !!course ? "course=" + course + "&" : "";
                return new UnPagination("course-grades", function (page) {
                    return _this2.getJson("api/course-grades?" + params + "page=" + page, NO_LIMIT);
                });
            },

            getMembers: function getMembers(group) {
                return new UnPagination("members", function (page) {
                    return _this2.getJson("api/members?group=" + group + "&page=" + page);
                });
            },

            addMembers: function addMembers(group, user) {
                return _this2.postJson("api/members", {
                    member: {
                        group: group,
                        user: user
                    }
                });
            },

            getCourse: function getCourse(course_id) {
                return _this2.getJson("api/courses/" + course_id);
            }
        };
    }();
});