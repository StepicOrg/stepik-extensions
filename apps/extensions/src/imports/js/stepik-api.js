import $ from "jquery";
import cookie from "jquery.cookie";

export default (function () {
    let NO_LIMIT = 0;

    function UnPagination(field, query, limit = 10) {
        let status = "pending";
        let members = [];
        let page_count = 0;

        getPage(1, this);

        function getPage(page) {
            page_count++;
            if (limit > 0 && page_count > limit) {
                done();
            }

            query(page)
                .done(data => {
                    members = members.concat(data[field]);
                    if (data['meta']['has_next']) {
                        getPage(++page);
                    } else {
                        done();
                    }
                })
                .fail(fail)
        }

        let onDone = [];
        let onFail = [];
        let onAlways = [];

        function done() {
            onDone.forEach(fulfilled => fulfilled(members));
            always();
            status = "fulfilled";
        }

        function fail() {
            onFail.forEach(rejected => rejected(members));
            always();
            status = "rejected";
        }

        function always() {
            onAlways.forEach(always => always(members));
        }

        this.done = done => {
            if (status === "fulfilled") {
                done(members);
            } else if (status === "pending") {
                onDone.push(done);
            }
            return this;
        };

        this.fail = fail => {
            if (status === "rejected") {
                fail(members);
            } else if (status === "pending") {
                onFail.push(fail);
            }

            return this;
        };

        this.always = always => {
            if (status === "fulfilled" || status === "rejected") {
                always(members);
            } else if (status === "pending") {
                onAlways.push(always);
            }

            return this;
        };
    }

    function asUriParams(parameters) {
        let params = "";
        for (let name in parameters) {
            if (!parameters.hasOwnProperty(name)) {
                continue;
            }
            params += name + "=" + encodeURIComponent(parameters[name]) + "&";
        }
        return params;
    }

    let result = {};

    result.getHost = () => {
        let host = cookie("host");

        if (!host) {
            host = "https://stepik.org/";
        }
        return host;
    };

    result.getCurrentUser = () => result.getJson("api/stepics/1");

    result.getJson = url => {
        let access_token = cookie("access_token");

        return $.get({
            url: result.getHost() + url,
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + access_token
            }
        });
    };

    result.postJson = (url, data) => {
        let access_token = cookie("access_token");

        return $.post({
            url: result.getHost() + url,
            dataType: "json",
            data: JSON.stringify(data),
            headers: {
                "Authorization": "Bearer " + access_token
            },
            contentType: "application/json; charset=UTF-8"
        })
    };

    result.getCourses = parameters => {
        let params = asUriParams(parameters);
        return new UnPagination("courses", page => result.getJson(`api/courses?${params}page=${page}`))
    };

    result.getLessons = parameters => {
        let params = asUriParams(parameters);
        return new UnPagination("lessons", page => result.getJson(`api/lessons?${params}page=${page}`))
    };

    result.getCourseGrades = course => {
        let params = !!course ? "course=" + course + "&" : "";
        return new UnPagination("course-grades",
            (page) => result.getJson(`api/course-grades?${params}page=${page}`, NO_LIMIT));
    };

    result.getMembers = group => new UnPagination("members", page => result.getJson(`api/members?group=${group}&page=${page}`));

    result.addMembers = (group, user) => result.postJson("api/members", {
            member: {
                group: group,
                user: user
            }
        }
    );

    result.getCourse = (course_id) => result.getJson("api/courses/" + course_id);

    return result;
})();
