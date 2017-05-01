define(["exports", "../../imports/libs/jquery"], function (exports, _jquery) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.stepik = undefined;
    var stepik = exports.stepik = function () {
        var get = _jquery.$.get,
            post = _jquery.$.post;


        var NO_LIMIT = 0;

        function UnPagination(field, query, limit) {
            var status = "pending";
            var members = [];
            var page_count = 0;
            limit = limit || 10;
            getPage(1, this);

            function getPage(page) {
                page_count++;
                if (limit > 0 && page_count > limit) {
                    done();
                }

                query(page).done(function (data) {
                    members = members.concat(data[field]);
                    if (data.meta.has_next) {
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
                if (status === "fulfilled") {
                    done(members);
                } else if (status === "pending") {
                    onDone.push(done);
                }
                return this;
            };

            this.fail = function (fail) {
                if (status === "rejected") {
                    fail(members);
                } else if (status === "pending") {
                    onFail.push(fail);
                }

                return this;
            };

            this.always = function (always) {
                if (status === "fulfilled" || status === "rejected") {
                    always(members);
                } else if (status === "pending") {
                    onAlways.push(always);
                }

                return this;
            };
        }

        function asUriParams(parameters) {
            var params = "";
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = parameters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var name = _step.value;

                    params += name + "=" + encodeURIComponent(parameters[name]) + "&";
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return params;
        }

        return {
            _host: null,
            getHost: function getHost() {
                if (!this._host) {
                    this._host = _jquery.$.cookie("stepik.host");

                    if (!this._host) {
                        this._host = "https://stepik.org/";
                        _jquery.$.cookie("stepik.host", this._host);
                    }
                }
                return this._host;
            },

            setHost: function setHost(host) {
                this._host = host;
                _jquery.$.cookie("stepik.host", this._host);
            },

            getCurrentUser: function getCurrentUser() {
                return this.getJson("api/stepics/1");
            },

            getJson: function getJson(url) {
                var access_token = _jquery.$.cookie("access_token");
                var token_type = _jquery.$.cookie("token_type");

                return get({
                    url: this.getHost() + url,
                    dataType: "json",
                    headers: {
                        "Authorization": token_type + " " + access_token
                    }
                });
            },

            postJson: function postJson(url, data) {
                var access_token = _jquery.$.cookie("access_token");
                var token_type = _jquery.$.cookie("token_type");

                return post({
                    url: this.getHost() + url,
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

                return new UnPagination("courses", function (context) {
                    return function (page) {
                        return context.getJson("api/courses?" + params + "page=" + page);
                    };
                }(this));
            },

            getLessons: function getLessons(parameters) {
                var params = asUriParams(parameters);

                return new UnPagination("lessons", function (context) {
                    return function (page) {
                        return context.getJson("api/lessons?" + params + "page=" + page);
                    };
                }(this));
            },

            getCourseGrades: function getCourseGrades(course) {
                var params = !!course ? "course=" + course + "&" : "";
                return new UnPagination("course-grades", function (context) {
                    return function (page) {
                        return context.getJson("api/course-grades?" + params + "page=" + page);
                    };
                }(this), NO_LIMIT);
            },

            getMembers: function getMembers(group) {
                return new UnPagination("members", function (context) {
                    return function (page) {
                        return context.getJson("api/members?group=" + group + "&page=" + page);
                    };
                }(this));
            },

            addMembers: function addMembers(group, user) {
                return this.postJson("api/members", {
                    member: {
                        group: group,
                        user: user
                    }
                });
            },

            getCourse: function getCourse(course_id) {
                return this.getJson("api/courses/" + course_id);
            },

            authorize: function authorize(state, code) {
                var redirect_uri = location.origin;
                var client_id = "gTUqSYtRjiT9wnrmCYEWKDR2ZfeDOcdlNN8Q0Avc";
                if (!code) {
                    state = state || location.origin;
                    var encoded_state = btoa(state + "::" + Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000);
                    _jquery.$.cookie("state", encoded_state);
                    window.location.href = this.getHost() + "oauth2/authorize/" + "?client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&scope=write" + "&state=" + encoded_state + "&response_type=code";
                } else {
                    return post({
                        url: this.getHost() + "oauth2/token/",
                        dataType: "json",
                        data: {
                            grant_type: "authorization_code",
                            client_id: client_id,
                            code: code,
                            redirect_uri: redirect_uri
                        }
                    }).done(function (data) {
                        if (!!state && state === decodeURIComponent(_jquery.$.cookie("state"))) {
                            var expires = data.expires_in;
                            _jquery.$.cookie("access_token", data.access_token, { expires: expires });
                            _jquery.$.cookie("refresh_token", data.refresh_token, { expires: expires });
                            _jquery.$.cookie("token_type", data.token_type, { expires: expires });
                            _jquery.$.cookie("scope", data.scope, { expires: expires });
                            var decoded_state = atob(state);
                            var separator_pos = decoded_state.indexOf("::");
                            location.href = decoded_state.substring(0, separator_pos);
                        } else {
                            location.href = location.origin;
                        }
                    });
                }
            },

            logout: function logout() {
                _jquery.$.cookie("access_token", null);
                _jquery.$.cookie("refresh_token", null);
                _jquery.$.cookie("token_type", null);
                _jquery.$.cookie("scope", null);
            }
        };
    }();
});