define(["exports", "jquery", "jquery.cookie"], function (exports, _jquery, _jquery3) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = _interopRequireDefault(_jquery);

    var _jquery4 = _interopRequireDefault(_jquery3);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = function () {
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
                    return;
                }

                query(page).done(function (data) {
                    if (data[field].length === 0) {
                        done();
                    }
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

        var result = {};

        result.getHost = function () {
            var host = (0, _jquery4.default)("host");

            if (!host) {
                host = "https://stepik.org/";
            }
            return host;
        };

        result.getCurrentUser = function () {
            return result.getJson("api/stepics/1");
        };

        result.getJson = function (url) {
            var access_token = (0, _jquery4.default)("access_token");

            return _jquery2.default.get({
                url: result.getHost() + url,
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + access_token
                }
            });
        };

        result.postJson = function (url, data) {
            var access_token = (0, _jquery4.default)("access_token");

            return _jquery2.default.post({
                url: result.getHost() + url,
                dataType: "json",
                data: JSON.stringify(data),
                headers: {
                    "Authorization": "Bearer " + access_token
                },
                contentType: "application/json; charset=UTF-8"
            });
        };

        result.getCourses = function (parameters) {
            var params = asUriParams(parameters);
            return new UnPagination("courses", function (page) {
                return result.getJson("api/courses?" + params + "page=" + page);
            });
        };

        result.getSections = function (sections_ids) {
            var params = sections_ids.map(function (id) {
                return "ids[]=" + encodeURIComponent(id);
            }).join("&");
            return new UnPagination("sections", function (page) {
                return result.getJson("api/sections?" + params + "&page=" + page);
            });
        };

        result.getUnits = function (units_ids) {
            var params = units_ids.map(function (id) {
                return "ids[]=" + encodeURIComponent(id);
            }).join("&");
            return new UnPagination("units", function (page) {
                return result.getJson("api/units?" + params + "&page=" + page);
            });
        };

        result.getLessons = function (parameters) {
            var params = asUriParams(parameters);
            return new UnPagination("lessons", function (page) {
                return result.getJson("api/lessons?" + params + "page=" + page);
            });
        };

        result.getSteps = function (steps_ids) {
            var params = steps_ids.map(function (id) {
                return "ids[]=" + encodeURIComponent(id);
            }).join("&");
            return new UnPagination("steps", function (page) {
                return result.getJson("api/steps?" + params + "&page=" + page);
            });
        };

        result.getCourseGrades = function (course) {
            var params = !!course ? "course=" + course + "&" : "";
            return new UnPagination("course-grades", function (page) {
                return result.getJson("api/course-grades?" + params + "page=" + page, NO_LIMIT);
            });
        };

        result.getMembers = function (group) {
            return new UnPagination("members", function (page) {
                return result.getJson("api/members?group=" + group + "&page=" + page);
            });
        };

        result.addMembers = function (group, user) {
            return result.postJson("api/members", {
                member: {
                    group: group,
                    user: user
                }
            });
        };

        result.getCourse = function (course_id) {
            return result.getJson("api/courses/" + course_id);
        };

        return result;
    }();
});