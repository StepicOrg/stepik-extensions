import {$} from "../../imports/jquery/js/jquery";
import {cookie} from "../../imports/jquery/js/jquery.cookie";

export let stepik = (function () {
    const {get, post} = $;

    let NO_LIMIT = 0;

    function UnPagination(field, query, limit=10) {
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

    return {
        getHost: () => {
            let host = cookie("stepik.host");

            if (!host) {
                host = "https://stepik.org/";
            }
            return host;
        },

        getCurrentUser: () => this.getJson("api/stepics/1"),

        getJson: url => {
            let access_token = cookie("access_token");
            let token_type = cookie("token_type");

            return get({
                url: this.getHost() + url,
                dataType: "json",
                headers: {
                    "Authorization": token_type + " " + access_token
                }
            });
        },

        postJson: (url, data) => {
            let access_token = cookie("access_token");
            let token_type = cookie("token_type");

            return post({
                url: this.getHost() + url,
                dataType: "json",
                data: JSON.stringify(data),
                headers: {
                    "Authorization": token_type + " " + access_token
                },
                contentType: "application/json; charset=UTF-8"
            })
        },

        getCourses: parameters => {
            let params = asUriParams(parameters);
            return new UnPagination("courses", page => this.getJson(`api/courses?${params}page=${page}`))
        },

        getLessons: parameters => {
            let params = asUriParams(parameters);
            return new UnPagination("lessons", page =>  this.getJson(`api/lessons?${params}page=${page}`))
        },

        getCourseGrades: course => {
            let params = !!course ? "course=" + course + "&" : "";
            return new UnPagination("course-grades",
                (page) => this.getJson(`api/course-grades?${params}page=${page}`,
                    NO_LIMIT));
        },

        getMembers: group => new UnPagination("members", page => this.getJson(`api/members?group=${group}&page=${page}`)),

        addMembers: (group, user) => this.postJson("api/members", {
                member: {
                    group: group,
                    user: user
                }
            }
        ),

        getCourse: (course_id) => this.getJson("api/courses/" + course_id)
    };
})();
